// Modelo elétrico SIMPLIFICADO (engenharia, não dq) de um motor de indução
// acionado por V/f. Reproduz de forma fiel-o-suficiente para estudo:
// curva V/f (P142/P143/P145/P146), boost de torque (P136/P137), modo de
// controle P202 (V/f, V/f quadrático, VVW), escorregamento dependente da
// carga, compensação de escorregamento (P138) e as grandezas P002/P003/
// P004/P007/P009/P011. Não é um modelo de regime transitório detalhado.

const NOMINAL_DC_RATIO = Math.SQRT2; // Vca -> Vcc do barramento (pico).

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export const CONTROL_MODE = {
  0: { kind: "VF", label: "V/f linear" },
  1: { kind: "VF_QUAD", label: "V/f quadrático" },
  2: { kind: "VF", label: "V/f linear c/ compensação de corrente ativa" },
  3: { kind: "VF_QUAD", label: "V/f quadrático c/ compensação de corrente ativa" },
  4: { kind: "VF", label: "Sem função" },
  5: { kind: "VVW", label: "VVW" },
};

const CONTROL_MODE_FALLBACK_LABELS = {
  0: "V/f linear",
  1: "V/f quadratico",
  2: "V/f linear c/ compensacao de corrente ativa",
  3: "V/f quadratico c/ compensacao de corrente ativa",
  4: "Sem funcao",
  5: "VVW",
};

const CONTROL_MODE_LABEL_KEYS = {
  0: "motor.controlMode.vfLinear",
  1: "motor.controlMode.vfQuadratic",
  2: "motor.controlMode.vfLinearActiveCurrentComp",
  3: "motor.controlMode.vfQuadraticActiveCurrentComp",
  4: "motor.controlMode.noFunction",
  5: "motor.controlMode.vvw",
};

function createMotorMessage(key, fallback, params = undefined) {
  return params === undefined
    ? { key, fallback }
    : { key, fallback, params };
}

function getControlModeConfig(modeCode) {
  const baseMode = CONTROL_MODE[modeCode] ?? CONTROL_MODE[0];

  return {
    ...baseMode,
    label: CONTROL_MODE_FALLBACK_LABELS[modeCode] ?? CONTROL_MODE_FALLBACK_LABELS[0],
    labelKey: CONTROL_MODE_LABEL_KEYS[modeCode] ?? CONTROL_MODE_LABEL_KEYS[0],
  };
}

// Número de polos estimado a partir de rotação/frequência nominais.
function estimatePoles(rpmNom, fNom) {
  if (rpmNom <= 0 || fNom <= 0) {
    return 4;
  }
  const poles = 2 * Math.round((120 * fNom) / (2 * rpmNom));
  return Math.max(2, poles);
}

// Tensão da curva V/f (em % da tensão nominal) para a frequência dada.
function voltagePercent(freq, params, mode) {
  const fInter = params.P146?.value ?? 30;
  const fNom = params.P403?.value ?? 60;
  const fWeak = params.P145?.value ?? fNom;
  const vInter = params.P143?.value ?? 50;
  const vMax = params.P142?.value ?? 100;

  if (freq <= 0) {
    return 0;
  }

  if (mode === "VF_QUAD") {
    // Curva quadrática: tensão ~ (f/fNom)^2, saturando em vMax.
    const ratio = clamp(freq / Math.max(fNom, 0.01), 0, 1);
    return Math.min(vMax, vMax * ratio * ratio);
  }

  // V/f linear por trechos: 0 -> P146 -> P145 (campo enfraquecido).
  if (freq <= fInter && fInter > 0) {
    return (vInter * freq) / fInter;
  }

  if (freq <= fWeak && fWeak > fInter) {
    const span = (vMax - vInter) * ((freq - fInter) / (fWeak - fInter));
    return vInter + span;
  }

  // Acima do enfraquecimento de campo: tensão saturada.
  return vMax;
}

// Calcula todas as grandezas de leitura a partir do ponto de operação.
// frequency: frequência de saída assinada (Hz).
// requestedFrequency: alvo atual (para detectar aceleracao/regeneracao).
// loadPercent: conjugado resistente como % do torque nominal (0..150).
// lastFilteredCurrent: corrente filtrada do tick anterior (para P139).
export function computeMotorState({
  frequency,
  mechanicalHz,
  df_dt,
  requestedFrequency,
  parameters,
  loadPercent,
  lastFilteredCurrent,
  electricalOutputActive = true,
  isCoasting = false,
}) {
  const notes = [];
  const p = parameters;
  const speed = Math.abs(frequency);
  const mechSpeed = Math.abs(mechanicalHz ?? frequency);
  const direction = (mechanicalHz ?? frequency) < 0 ? -1 : 1;
  const load = clamp(loadPercent ?? 0, 0, 150);

  const vNom = p.P400?.value || 220;
  const iNom = p.P401?.value || 1.4;
  const rpmNom = p.P402?.value || 1720;
  const fNom = p.P403?.value || 60;
  const pf = clamp(p.P407?.value || 0.69, 0.5, 0.99);
  const modeCode = p.P202?.value ?? 0;
  const mode = getControlModeConfig(modeCode);
  const poles = estimatePoles(rpmNom, fNom);
  const syncRpm = (120 * mechSpeed) / poles;

  if (!electricalOutputActive) {
    if (isCoasting && mechSpeed > 0) {
      notes.push(
        createMotorMessage(
          "motor.notes.coastDown",
          "Saida eletrica desativada: motor em coast-down por inercia.",
        ),
      );
    }

    return {
      controlMode: mode,
      rpm: direction * syncRpm,
      outputVoltage: 0,
      voltagePercent: 0,
      current: 0,
      activeCurrent: 0,
      torquePercent: 0,
      outputPower: 0,
      dcVoltage: vNom * NOMINAL_DC_RATIO,
      slip: 0,
      electricalOutputActive: false,
      isCoasting,
      notes,
    };
  }

  // --- Tensão de saída (curva V/f + boost) --------------------------------
  let vPercent = voltagePercent(speed, p, mode.kind);

  // Item 14 (P409) — Compensação de queda de tensão no estator (VVW):
  // No modo VVW o CFW100 adiciona ΔV = I × P409 à curva V/f para
  // manter o fluxo constante sob carga (especialmente em baixa frequência).
  if (mode.kind === "VVW") {
    const rs = p.P409?.value ?? 0; // ohm
    const iEstimate = iNom * (load / 100); // corrente de carga estimada
    const vDropPercent = rs > 0 ? (100 * (iEstimate * rs)) / Math.max(vNom, 1) : 0;
    vPercent = Math.min(p.P142?.value ?? 100, vPercent + vDropPercent);
  }

  // Boost manual (P136) decai linearmente ate fNom; automatico (P137)
  // proporcional a carga. VVW aplica boost automatico equivalente.
  const decay = speed > 0 ? Math.max(0, 1 - speed / Math.max(fNom, 0.01)) : 1;
  const manualBoost = (p.P136?.value ?? 0) * decay;
  let autoBoost = (p.P137?.value ?? 0) * (load / 100) * decay;
  if (mode.kind === "VVW") {
    // VVW compensa tensão automaticamente conforme carga (sem ajuste manual).
    autoBoost = Math.max(autoBoost, 4 * (load / 100) * decay);
  }
  if (speed > 0) {
    vPercent = Math.min(p.P142?.value ?? 100, vPercent + manualBoost + autoBoost);
  }
  const outputVoltage = (vPercent / 100) * vNom;

  // --- Escorregamento e rotação -------------------------------------------
  const syncRpmNom = (120 * fNom) / poles;
  const slipNom =
    syncRpmNom > 0 ? clamp((syncRpmNom - rpmNom) / syncRpmNom, 0, 0.2) : 0.04;

  let slip = slipNom * (load / 100);

  // Compensação de escorregamento (P138) e VVW reduzem a queda de rotação.
  const slipComp = clamp((p.P138?.value ?? 0) / 100, -0.1, 0.1);
  let slipCompensationFactor = clamp(slipComp / Math.max(slipNom, 0.001), 0, 1);
  if (mode.kind === "VVW") {
    slipCompensationFactor = Math.max(slipCompensationFactor, 0.9);
  }
  slip *= 1 - slipCompensationFactor;

  const rpm = direction * syncRpm * (1 - slip);

  // --- Corrente -----------------------------------------------------------
  // Componente de magnetizacao (proporcional ao fluxo = V/f relativo) e
  // componente de carga (proporcional ao torque exigido).
  const linearVPercent = Math.min(100, (100 * speed) / Math.max(fNom, 0.01));
  const fluxRatio =
    linearVPercent > 0 ? vPercent / linearVPercent : speed > 0 ? 1 : 0;
  const iMag = iNom * Math.sqrt(1 - pf * pf) * clamp(fluxRatio, 0, 2.5);
  const iLoad = iNom * pf * (load / 100);

  // Bug 2: Sobrecorrente de aceleração dinâmica baseada em df_dt
  // O esforço inercial (J * alpha) dita a corrente de aceleração extra.
  // df_dt = taxa de variação da frequência (Hz/s).
  // Assumimos que acelerar de 0 a 60Hz em 1 segundo exige 1.5x I_nominal
  const accelCurrent =
    df_dt !== undefined
      ? Math.abs(df_dt) * (iNom * 1.5 / Math.max(fNom, 0.01))
      : 0;

  let current =
    speed <= 0 && mechSpeed <= 0
      ? 0
      : Math.sqrt(iMag * iMag + iLoad * iLoad) + accelCurrent;

  const iLimit = p.P135?.value ?? 0;
  if (iLimit > 0 && current > iLimit) {
    const currentText = current.toFixed(1);
    const limitText = iLimit.toFixed(1);
    notes.push(
      createMotorMessage(
        "motor.notes.currentLimited",
        `Corrente (${currentText} A) acima de P135 (${limitText} A): limitacao de corrente atuaria.`,
        {
          current: currentText,
          limit: limitText,
        },
      ),
    );
    current = iLimit;
  }

  // Item 13 (P139) — Filtro de primeira ordem na corrente de saída:
  // A constante de tempo τ = P139 (s) suaviza transições rápidas.
  // Se τ = 0, sem filtragem (corrente instantânea).
  const tau139 = p.P139?.value ?? 0;
  if (tau139 > 0 && lastFilteredCurrent !== undefined) {
    const dtSec = 0.001; // passo de integração nominal (1 ms)
    const alpha = dtSec / (tau139 + dtSec); // fator do filtro exponencial
    current = alpha * current + (1 - alpha) * (lastFilteredCurrent ?? current);
  }

  // --- Torque e corrente ativa -------------------------------------------
  // Em regime, o torque desenvolvido iguala o resistente (carga).
  let torquePercent = load;
  if (
    df_dt !== undefined &&
    Math.abs(df_dt) > 0.1 &&
    Math.abs(requestedFrequency) > Math.abs(frequency)
  ) {
    torquePercent += 25 * (Math.abs(df_dt) / 10); // torque extra dinâmico
  }
  torquePercent = clamp(direction * torquePercent, -100, 100);

  const activeCurrent = clamp(direction * (iLoad + accelCurrent) * pf, -10, 10);
  const outputPower = (Math.sqrt(3) * outputVoltage * activeCurrent * pf) / 1000;

  // Bug 5: Barramento CC - Sobretensão por regeneração
  // Sobe na desaceleracao com carga inercial, com base no df_dt negativo.
  let dcVoltage = vNom * NOMINAL_DC_RATIO;

  const isRegenerating =
    (frequency > 0 && (df_dt ?? 0) < -0.1) ||
    (frequency < 0 && (df_dt ?? 0) > 0.1);
  if (isRegenerating) {
    dcVoltage +=
      150 * (Math.abs(df_dt ?? 0) / Math.max(fNom, 0.01)) * (0.4 + load / 100);
  }

  return {
    controlMode: mode,
    rpm,
    outputVoltage,
    voltagePercent: vPercent,
    current,
    activeCurrent,
    torquePercent,
    outputPower,
    dcVoltage,
    slip,
    electricalOutputActive: true,
    isCoasting: false,
    notes,
  };
}
