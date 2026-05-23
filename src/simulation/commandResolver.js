import {
  DRIVE_STATUS,
  getDriveStatus,
  isPwmEnableBlocked,
} from "../logic/driveStatus.js";
import {
  DEFAULT_EXTERNAL_SOURCES,
  getSafeFrequencyLimits,
  sanitizeExternalSources,
  sanitizeLoadPercent,
  toFiniteNumber,
} from "../utils/sanitizers.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const LOCREM = {
  0: { mode: "LOCAL", simulated: true, label: "Sempre Local", labelKey: "commandSource.alwaysLocal" },
  1: { mode: "REMOTE", simulated: true, label: "Sempre Remoto", labelKey: "commandSource.alwaysRemote" },
  4: { mode: "LOCAL", simulated: true, label: "DIx", labelKey: "commandSource.dix" },
  5: { mode: "LOCAL", simulated: true, label: "Serial/USB (LOC)", labelKey: "commandSource.serialUsbLoc" },
  6: { mode: "REMOTE", simulated: true, label: "Serial/USB (REM)", labelKey: "commandSource.serialUsbRem" },
  9: { mode: "LOCAL", simulated: true, label: "CO/DN (LOC)", labelKey: "commandSource.codnLoc" },
  10: { mode: "REMOTE", simulated: true, label: "CO/DN (REM)", labelKey: "commandSource.codnRem" },
  11: { mode: "LOCAL", simulated: true, label: "SoftPLC", labelKey: "commandSource.softplc" },
};

const REFERENCE_SOURCE = {
  0: { kind: "HMI", simulated: true, label: "Teclas HMI", labelKey: "commandSource.hmiKeys" },
  1: { kind: "AI1", simulated: true, label: "AI1", labelKey: "commandSource.ai1" },
  4: { kind: "FI", simulated: true, label: "FI", labelKey: "commandSource.fi" },
  7: { kind: "EP", simulated: true, label: "Potenciometro eletronico", labelKey: "commandSource.electronicPot" },
  8: { kind: "MULTISPEED", simulated: true, label: "Multispeed", labelKey: "commandSource.multispeed" },
  9: { kind: "SERIAL", simulated: true, label: "Serial/USB", labelKey: "commandSource.serialUsb" },
  11: { kind: "CODN", simulated: true, label: "CO/DN", labelKey: "commandSource.codn" },
  12: { kind: "SOFTPLC", simulated: true, label: "SoftPLC", labelKey: "commandSource.softplc" },
  14: { kind: "AI1", simulated: true, label: "AI1 > 0", labelKey: "commandSource.ai1Positive" },
  17: { kind: "FI", simulated: true, label: "FI > 0", labelKey: "commandSource.fiPositive" },
};

const COMMAND_SOURCE = {
  0: { kind: "HMI", simulated: true, label: "Teclas HMI", labelKey: "commandSource.hmiKeys" },
  1: { kind: "DI", simulated: true, label: "DIx", labelKey: "commandSource.dix" },
  2: { kind: "SERIAL", simulated: true, label: "Serial/USB", labelKey: "commandSource.serialUsb" },
  3: { kind: "NONE", simulated: true, label: "Sem funcao", labelKey: "commandSource.noFunction" },
  4: { kind: "CODN", simulated: true, label: "CO/DN", labelKey: "commandSource.codn" },
  5: { kind: "SOFTPLC", simulated: true, label: "SoftPLC", labelKey: "commandSource.softplc" },
};

const JOG_SOURCE = {
  0: { kind: "NONE", simulated: true, label: "Inativo", labelKey: "commandSource.inactive" },
  1: { kind: "NONE", simulated: true, label: "Sem funcao", labelKey: "commandSource.noFunction" },
  2: { kind: "DI", simulated: true, label: "DIx", labelKey: "commandSource.dix" },
  3: { kind: "SERIAL", simulated: true, label: "Serial/USB", labelKey: "commandSource.serialUsb" },
  5: { kind: "CODN", simulated: true, label: "CO/DN", labelKey: "commandSource.codn" },
  6: { kind: "SOFTPLC", simulated: true, label: "SoftPLC", labelKey: "commandSource.softplc" },
};

const ROTATION = {
  0: { kind: "FIXED", sign: 1, simulated: true, label: "Horario", labelKey: "commandSource.clockwise" },
  1: { kind: "FIXED", sign: -1, simulated: true, label: "Anti-horario", labelKey: "commandSource.counterClockwise" },
  4: { kind: "DI", sign: 1, simulated: true, label: "DIx", labelKey: "commandSource.dix" },
  5: { kind: "FIXED", sign: 1, simulated: true, label: "Serial/USB (H)", labelKey: "commandSource.serialCW" },
  6: { kind: "FIXED", sign: -1, simulated: true, label: "Serial/USB (AH)", labelKey: "commandSource.serialCCW" },
  9: { kind: "FIXED", sign: 1, simulated: true, label: "CO/DN (H)", labelKey: "commandSource.codnCW" },
  10: { kind: "FIXED", sign: -1, simulated: true, label: "CO/DN (AH)", labelKey: "commandSource.codnCCW" },
  12: { kind: "SOFTPLC", sign: 1, simulated: true, label: "SoftPLC", labelKey: "commandSource.softplc" },
};

const lookup = (table, value, fallback) => table[value] ?? table[fallback];

function createStatusMessage(key, fallback, params = {}) {
  return {
    key,
    fallback,
    params,
  };
}

function getExternalSources(hmiState) {
  return sanitizeExternalSources(hmiState.externalSources, DEFAULT_EXTERNAL_SOURCES);
}

function getActiveDigitalFunctions(hmiState) {
  return (hmiState.digitalInputs ?? [])
    .map((active, index) => ({
      active,
      functionCode: hmiState.parameters[`P${263 + index}`]?.value,
    }))
    .filter((input) => input.active)
    .map((input) => input.functionCode);
}

function isDigitalFunctionActive(hmiState, functionCode) {
  return getActiveDigitalFunctions(hmiState).includes(functionCode);
}

function resolveMultispeedIndex(hmiState) {
  const configuredInputs = (hmiState.digitalInputs ?? [])
    .map((active, index) => ({
      active,
      functionCode: hmiState.parameters[`P${263 + index}`]?.value,
    }))
    .filter((input) => input.functionCode === 13);

  if (configuredInputs.length === 0) {
    return clamp(hmiState.multispeedIndex ?? 0, 0, 7);
  }

  return configuredInputs.reduce(
    (index, input, bit) => index + (input.active ? 2 ** bit : 0),
    0,
  );
}

function resolveLocRem(selection, hmiState) {
  const base = lookup(LOCREM, selection, 0);
  const externalSources = getExternalSources(hmiState);

  if (selection === 4) {
    return {
      ...base,
      mode: isDigitalFunctionActive(hmiState, 9) ? "REMOTE" : "LOCAL",
    };
  }

  if (selection === 11) {
    return {
      ...base,
      mode: externalSources.softplc.remoteMode ? "REMOTE" : "LOCAL",
    };
  }

  return base;
}

function resolveAi1Reference(parameters, externalSources) {
  const rawPercent = toFiniteNumber(externalSources.ai1Percent, 0);
  const gain = toFiniteNumber(parameters.P232?.value, 1);
  const offset = toFiniteNumber(parameters.P234?.value, 0);
  const percent = clamp(rawPercent * gain + offset, -100, 100);
  return (percent / 100) * toFiniteNumber(parameters.P134?.value, 0);
}

function resolveFiReference(parameters, externalSources) {
  const frequency = toFiniteNumber(externalSources.fiFrequency, 0);
  const minFrequency = toFiniteNumber(parameters.P248?.value, 0);
  const maxFrequency = Math.max(
    toFiniteNumber(parameters.P250?.value, minFrequency),
    minFrequency + 0.001,
  );
  const normalized = clamp(
    (frequency - minFrequency) / (maxFrequency - minFrequency),
    0,
    1,
  );
  const gain = toFiniteNumber(parameters.P247?.value, 1);
  const offset = toFiniteNumber(parameters.P249?.value, 0);
  const percent = clamp(normalized * 100 * gain + offset, -100, 100);
  return (percent / 100) * toFiniteNumber(parameters.P134?.value, 0);
}

function speed13BitToHz(speed13Bit, parameters) {
  return (toFiniteNumber(speed13Bit, 0) / 8192) * toFiniteNumber(parameters.P403?.value, 60);
}

function resolveReferenceValue(source, hmiState) {
  const parameters = hmiState.parameters;
  const externalSources = getExternalSources(hmiState);

  switch (source.kind) {
    case "HMI":
    case "EP":
      return { value: hmiState.referenceFrequency, available: true };
    case "AI1":
      return {
        value: resolveAi1Reference(parameters, externalSources),
        available: true,
      };
    case "FI":
      return {
        value: resolveFiReference(parameters, externalSources),
        available: true,
      };
    case "MULTISPEED": {
      const index = resolveMultispeedIndex(hmiState);
      const code = `P${124 + index}`;
      return { value: parameters[code]?.value ?? 0, available: true };
    }
    case "SERIAL":
      return {
        value: speed13BitToHz(externalSources.serial.speed13Bit, parameters),
        available: true,
      };
    case "CODN":
      return {
        value: speed13BitToHz(externalSources.codn.speed13Bit, parameters),
        available: true,
      };
    case "SOFTPLC":
      return {
        value: speed13BitToHz(externalSources.softplc.speed13Bit, parameters),
        available: true,
      };
    default:
      return { value: 0, available: false };
  }
}

function resolveDigitalRun(hmiState) {
  if (isDigitalFunctionActive(hmiState, 39)) {
    return false;
  }

  if (isDigitalFunctionActive(hmiState, 1)) {
    return true;
  }

  return (
    isDigitalFunctionActive(hmiState, 6) &&
    !isDigitalFunctionActive(hmiState, 7)
  );
}

function resolveRunCommand(commandSource, hmiState) {
  const externalSources = getExternalSources(hmiState);

  switch (commandSource.kind) {
    case "HMI":
      return Boolean(hmiState.running);
    case "DI":
      return resolveDigitalRun(hmiState);
    case "SERIAL":
      return Boolean(externalSources.serial.run);
    case "CODN":
      return Boolean(externalSources.codn.run);
    case "SOFTPLC":
      return Boolean(externalSources.softplc.run);
    default:
      return false;
  }
}

function resolveJog(jogSource, hmiState) {
  const externalSources = getExternalSources(hmiState);

  switch (jogSource.kind) {
    case "DI":
      return isDigitalFunctionActive(hmiState, 10);
    case "SERIAL":
      return Boolean(externalSources.serial.jog);
    case "CODN":
      return Boolean(externalSources.codn.jog);
    case "SOFTPLC":
      return Boolean(externalSources.softplc.jog);
    default:
      return false;
  }
}

function resolveRotationSign(rotation, hmiState) {
  const externalSources = getExternalSources(hmiState);

  if (rotation.kind === "DI") {
    if (isDigitalFunctionActive(hmiState, 5)) {
      return -1;
    }
    if (isDigitalFunctionActive(hmiState, 4)) {
      return 1;
    }
    return isDigitalFunctionActive(hmiState, 8) ? 1 : -1;
  }

  if (rotation.kind === "SOFTPLC") {
    return externalSources.softplc.rotationSign < 0 ? -1 : 1;
  }

  return rotation.sign;
}

export function resolveCommand(hmiState) {
  const parameters = hmiState.parameters;
  const { minimumFrequency, maximumFrequency } = getSafeFrequencyLimits(parameters);

  const locrem = resolveLocRem(parameters.P220?.value ?? 0, hmiState);
  const isLocal = locrem.mode === "LOCAL";

  const refSel = isLocal
    ? parameters.P221?.value ?? 0
    : parameters.P222?.value ?? 2;
  const cmdSel = isLocal
    ? parameters.P224?.value ?? 0
    : parameters.P227?.value ?? 3;
  const jogSel = isLocal
    ? parameters.P225?.value ?? 1
    : parameters.P228?.value ?? 1;
  const rotSel = isLocal
    ? parameters.P223?.value ?? 0
    : parameters.P226?.value ?? 2;

  const referenceSource = lookup(REFERENCE_SOURCE, refSel, 0);
  const commandSource = lookup(COMMAND_SOURCE, cmdSel, 0);
  const jogSource = lookup(JOG_SOURCE, jogSel, 0);
  const rotation = lookup(ROTATION, rotSel, 0);
  const status = [];

  let running = resolveRunCommand(commandSource, hmiState);
  const jogActive = resolveJog(jogSource, hmiState);
  if (jogActive) {
    running = true;
  }

  if (running && isPwmEnableBlocked(hmiState)) {
    const driveStatus = getDriveStatus(hmiState);
    const reason = driveStatus === DRIVE_STATUS.CONFIG ? "CONFIG" : driveStatus;
    running = false;
    status.push(
      createStatusMessage(
        "commandStatusNotes.pwmBlocked",
        `PWM bloqueado por ${reason}.`,
        { reason },
      ),
    );
  }

  const resolved = jogActive
    ? { value: parameters.P122?.value ?? 0, available: true }
    : resolveReferenceValue(referenceSource, hmiState);
  if (!resolved.available) {
    status.push(
      createStatusMessage(
        "commandStatusNotes.referenceUnavailable",
        `Referencia "${referenceSource.label}" indisponivel: usando 0 Hz.`,
        {
          label: {
            key: referenceSource.labelKey,
            fallback: referenceSource.label,
          },
        },
      ),
    );
  }

  const rawValue = toFiniteNumber(resolved.value, 0);
  const magnitude = clamp(
    Math.abs(rawValue),
    minimumFrequency,
    maximumFrequency,
  );
  const valueSign = rawValue < 0 ? -1 : 1;
  const rotationSign = resolveRotationSign(rotation, hmiState);
  const referenceFrequency = running
    ? rotationSign * valueSign * magnitude
    : 0;

  // Bug 6 — Compensação de escorregamento (P138):
  // Calcula a frequência extra a adicionar à saída para compensar a queda de
  // rotação causada pela carga. P138 em % (-10 a +10); 10 = compensação total.
  const p138 = toFiniteNumber(parameters.P138?.value, 0);
  const fNom = toFiniteNumber(parameters.P403?.value, 60);
  const rpmNom = toFiniteNumber(parameters.P402?.value, 1720);
  const polesEst = Math.max(2, 2 * Math.round((60 * fNom) / rpmNom));
  const syncRpmNom = (120 * fNom) / polesEst;
  const slipNom = syncRpmNom > 0
    ? clamp((syncRpmNom - rpmNom) / syncRpmNom, 0, 0.2)
    : 0.04;
  const loadPct = sanitizeLoadPercent(hmiState.loadPercent, 0);
  // Normaliza P138: divide pelo máximo (10) para obter fator 0–1
  const slipCompFactor = clamp(p138 / 10, -1, 1);
  const slipCompensationHz = running
    ? Math.sign(referenceFrequency) * slipNom * (loadPct / 100) * Math.abs(referenceFrequency) * slipCompFactor
    : 0;

  // Bug 8 — Reset de falha por DI (função 2):
  // Quando uma DI configurada com função 2 está ativa, sinaliza ao loop
  // principal que deve despachar RESET_FAULT.
  const faultResetRequest = isDigitalFunctionActive(hmiState, 2);

  return {
    mode: locrem.mode,
    referenceSource,
    commandSource,
    jogSource,
    jogActive,
    rotation,
    rotationSign,
    running,
    referenceFrequency,
    slipCompensationHz,
    faultResetRequest,
    minimumFrequency,
    maximumFrequency,
    status,
  };
}
