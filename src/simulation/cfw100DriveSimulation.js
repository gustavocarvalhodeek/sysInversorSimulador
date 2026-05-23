import { resolveCommand } from "./commandResolver.js";
import { selectRamp } from "./rampSelector.js";
import { getLoadProfile } from "./mechanicalLoadProfiles.js";
import { clamp } from "../utils/math.js";

const EPSILON = 0.001;

function roundTo(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// Filtro de 1ª ordem discretizado (Tustin) para atraso mecânico do rotor.
// tauSec é fornecido pelo perfil de carga selecionado (mechanicalLoadProfileId).
function applyMechanicalLag(prevMechanicalHz, targetElectricalHz, dtMs, tauSec) {
  const alpha = (dtMs / 1000) / (tauSec + dtMs / 1000);
  return prevMechanicalHz + alpha * (targetElectricalHz - prevMechanicalHz);
}

// Curva S do CFW100: transição suave (jerk limitado) entre o início e o
// alvo do segmento, mantendo o mesmo tempo total da rampa linear.
function smootherstep(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export function createInitialDriveState() {
  return createDriveStateFromRuntime();
}

export function createDriveStateFromRuntime(runtimeState = {}) {
  const outputFrequency = Number.isFinite(runtimeState.outputFrequency)
    ? runtimeState.outputFrequency
    : 0;
  const mechanicalHz = Number.isFinite(runtimeState.mechanicalHz)
    ? runtimeState.mechanicalHz
    : outputFrequency;

  return {
    outputFrequency,
    mechanicalHz,
    df_dt: 0,
    electricalOutputActive: Boolean(runtimeState.electricalOutputActive),
    isCoasting: Boolean(runtimeState.isCoasting),
    // Segmento de rampa atual (origem -> alvo) e tempo decorrido.
    segmentStart: outputFrequency,
    segmentTarget: outputFrequency,
    segmentElapsedMs: 0,
  };
}

function shouldCoast(command, hmiState) {
  return (
    !command.running &&
    !hmiState.emergencyStop &&
    (hmiState.parameters.P229?.value ?? 0) === 1
  );
}

function resolveElectricalOutputActive({
  command,
  hmiState,
  nextFrequency,
  requested,
  isCoasting,
}) {
  if (isCoasting) {
    return false;
  }

  return (
    hmiState.emergencyStop ||
    command.running ||
    Math.abs(nextFrequency) > EPSILON ||
    Math.abs(requested) > EPSILON
  );
}

export function stepDriveSimulation(driveState, hmiState, deltaMs) {
  const dt = Math.max(deltaMs, 0);
  const command = resolveCommand(hmiState);
  const ramp = selectRamp(hmiState);
  const loadProfile = getLoadProfile(hmiState.mechanicalLoadProfileId);
  const tauMechSec = Math.max(loadProfile.tauMs / 1000, 0.001);

  let requested = 0;
  if (!hmiState.emergencyStop && command.running) {
    requested = command.referenceFrequency;

    // Bug 6 — Compensação de escorregamento (P138):
    // Adiciona o delta de compensação ao alvo da rampa, fazendo a frequência
    // de saída (P005) subir acima da referência para manter a rotação estavel
    // sob carga. O resultado é limitado aos limites de P133/P134.
    const slipComp = command.slipCompensationHz ?? 0;
    if (slipComp !== 0) {
      const compensated = requested + slipComp;
      requested = clamp(
        Math.sign(compensated) * Math.abs(compensated),
        -command.maximumFrequency,
        command.maximumFrequency,
      );
    }
  }

  const prevFrequency = driveState.outputFrequency;
  const current = driveState.outputFrequency;
  const rampSpan = Math.max(command.maximumFrequency, EPSILON);
  let mechanicalHz = driveState.mechanicalHz ?? current;
  const prevMechanicalHz = mechanicalHz;

  // Bug 1: Parada por inércia (P229=1)
  // O inversor corta o PWM e deixa o conjunto motriz "rodar solto".
  // Para o simulador didático, a grandeza exibida passa a representar essa
  // rotação residual caindo progressivamente até zero, mais lentamente que a
  // parada controlada por rampa.
  if (shouldCoast(command, hmiState)) {
    const loadRatio = Math.max(0, Math.min((hmiState.loadPercent ?? 0) / 150, 1));
    const naturalDecayPerSecond =
      (command.maximumFrequency / 20) * (1 + loadRatio * 0.5) * loadProfile.coastDecayFactor;
    const rampDecayPerSecond =
      ramp.decelTime > 0
        ? command.maximumFrequency / ramp.decelTime
        : Number.POSITIVE_INFINITY;
    const inertiaDecayPerSecond = Math.max(
      Math.min(naturalDecayPerSecond, rampDecayPerSecond * 0.9),
      EPSILON,
    );
    const signedFrequency =
      mechanicalHz !== 0 ? mechanicalHz : current;
    // Decaimento exponencial: mesma taxa inicial do modelo linear, mas desacelera
    // progressivamente conforme o rotor perde energia — τ = v0 / taxa_inicial.
    const tauCoast = Math.abs(signedFrequency) / Math.max(inertiaDecayPerSecond, EPSILON);
    const decayFactor = Math.exp(-(dt / 1000) / Math.max(tauCoast, 1e-6));
    const nextCoastFrequency = Math.sign(signedFrequency) * Math.abs(signedFrequency) * decayFactor;
    const df_dt = dt > 0 ? ((nextCoastFrequency - prevFrequency) / (dt / 1000)) : 0;
    mechanicalHz = nextCoastFrequency;

    return {
      ...driveState,
      outputFrequency: roundTo(nextCoastFrequency, 6),
      mechanicalHz: roundTo(mechanicalHz, 6),
      df_dt: roundTo(df_dt, 6),
      electricalOutputActive: false,
      isCoasting: Math.abs(nextCoastFrequency) > EPSILON,
      segmentStart: roundTo(nextCoastFrequency, 6),
      segmentTarget: roundTo(nextCoastFrequency, 6),
      segmentElapsedMs: 0,
    };
  }

  // Bug 3: Limite de Corrente (P135) - Stall Prevention
  // Se a corrente do ciclo anterior ultrapassar o limite, reduz ativamente a frequência.
  const currentLimit = hmiState.parameters?.P135?.value ?? 0;
  const prevCurrent = Math.abs(hmiState.parameters?.P003?.value ?? 0);
  
  if (currentLimit > 0 && prevCurrent > currentLimit) {
    const shedRate = (command.maximumFrequency / 5) * (dt / 1000); // Decresce 20% da fNom por segundo
    const newFreq = Math.sign(current) * Math.max(0, Math.abs(current) - shedRate);
    const df_dt = dt > 0 ? ((newFreq - prevFrequency) / (dt / 1000)) : 0;
    
    return {
      ...driveState,
      outputFrequency: roundTo(newFreq, 6),
      mechanicalHz: roundTo(applyMechanicalLag(prevMechanicalHz, newFreq, dt, tauMechSec), 6),
      df_dt: roundTo(df_dt, 6),
      electricalOutputActive: resolveElectricalOutputActive({
        command,
        hmiState,
        nextFrequency: newFreq,
        requested,
        isCoasting: false,
      }),
      isCoasting: false,
      segmentStart: newFreq, // Reseta o segmento para partir daqui depois
      segmentTarget: requested,
      segmentElapsedMs: 0,
    };
  }

  // (Re)inicia o segmento quando o alvo muda.
  let { segmentStart, segmentTarget, segmentElapsedMs } = driveState;
  if (Math.abs(requested - segmentTarget) > EPSILON) {
    segmentStart = current;
    segmentTarget = requested;
    segmentElapsedMs = 0;
  }

  const span = segmentTarget - segmentStart;

  if (Math.abs(span) <= EPSILON) {
    const df_dt = dt > 0 ? ((segmentTarget - prevFrequency) / (dt / 1000)) : 0;
    return {
      ...driveState,
      outputFrequency: roundTo(segmentTarget, 6),
      mechanicalHz: roundTo(applyMechanicalLag(prevMechanicalHz, segmentTarget, dt, tauMechSec), 6),
      df_dt: roundTo(df_dt, 6),
      electricalOutputActive: resolveElectricalOutputActive({
        command,
        hmiState,
        nextFrequency: segmentTarget,
        requested,
        isCoasting: false,
      }),
      isCoasting: false,
      segmentStart,
      segmentTarget,
      segmentElapsedMs: 0,
    };
  }

  // Aceleração quando a magnitude do alvo cresce; senão desaceleração.
  const isAccel = Math.abs(segmentTarget) >= Math.abs(segmentStart);
  let rampTime = isAccel ? ramp.accelTime : ramp.decelTime;

  if (rampTime <= 0) {
    const df_dt = dt > 0 ? ((segmentTarget - prevFrequency) / (dt / 1000)) : 0;
    return {
      ...driveState,
      outputFrequency: roundTo(segmentTarget, 6),
      mechanicalHz: roundTo(applyMechanicalLag(prevMechanicalHz, segmentTarget, dt, tauMechSec), 6),
      df_dt: roundTo(df_dt, 6),
      electricalOutputActive: resolveElectricalOutputActive({
        command,
        hmiState,
        nextFrequency: segmentTarget,
        requested,
        isCoasting: false,
      }),
      isCoasting: false,
      segmentStart,
      segmentTarget,
      segmentElapsedMs: 0,
    };
  }

  // Bug 4: Curva S realista. Aumenta o tempo total da rampa em ~20%
  if (ramp.sShape) {
    rampTime *= 1.2;
  }

  // Tempo da rampa: definido para percorrer 0..P134; o segmento percorre
  // apenas |span|, logo dura proporcionalmente menos.
  const segmentMs = (rampTime * (Math.abs(span) / rampSpan)) * 1000;

  segmentElapsedMs += dt;

  const progress = segmentMs <= 0 ? 1 : Math.min(segmentElapsedMs / segmentMs, 1);
  const shaped = ramp.sShape ? smootherstep(progress) : progress;
  const nextFrequency =
    progress >= 1 ? segmentTarget : segmentStart + span * shaped;

  const df_dt = dt > 0 ? ((nextFrequency - prevFrequency) / (dt / 1000)) : 0;

  return {
    ...driveState,
    outputFrequency: roundTo(nextFrequency, 6),
    mechanicalHz: roundTo(applyMechanicalLag(prevMechanicalHz, nextFrequency, dt, tauMechSec), 6),
    df_dt: roundTo(df_dt, 6),
    electricalOutputActive: resolveElectricalOutputActive({
      command,
      hmiState,
      nextFrequency,
      requested,
      isCoasting: false,
    }),
    isCoasting: false,
    segmentStart,
    segmentTarget,
    segmentElapsedMs,
  };
}
