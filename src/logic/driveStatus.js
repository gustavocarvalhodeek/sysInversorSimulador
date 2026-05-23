export const DRIVE_STATUS = {
  READY: "READY",
  RUN: "RUN",
  SUB: "SUB",
  FAULT: "FAULT",
  CONFIG: "CONFIG",
};

export const P006_STATUS_VALUE = {
  [DRIVE_STATUS.READY]: 0,
  [DRIVE_STATUS.RUN]: 1,
  [DRIVE_STATUS.SUB]: 2,
  [DRIVE_STATUS.FAULT]: 3,
  [DRIVE_STATUS.CONFIG]: 5,
};

export const STOPPED_FREQUENCY_EPSILON = 0.01;

const CONFIG_DUPLICATED_DI_RULES = new Map([
  [4, 1],
  [5, 2],
  [6, 3],
  [7, 4],
  [8, 5],
  [9, 6],
  [11, 7],
  [12, 8],
  [14, 9],
  [24, 11],
  [26, 12],
]);

function getDigitalInputValues(parameters) {
  return Array.from(
    { length: 8 },
    (_, index) => parameters[`P${263 + index}`]?.value,
  ).filter((value) => Number.isFinite(value));
}

export function getConfigCode(parameters) {
  const digitalInputValues = getDigitalInputValues(parameters);

  for (const [functionCode, configCode] of CONFIG_DUPLICATED_DI_RULES) {
    if (digitalInputValues.filter((value) => value === functionCode).length >= 2) {
      return configCode;
    }
  }

  // Regra adicional do simulador para impedir uma configuracao de referencia
  // internamente impossivel, ainda que nao seja uma linha da tabela oficial P047.
  if ((parameters.P133?.value ?? 0) > (parameters.P134?.value ?? 0)) {
    return 900;
  }

  return 0;
}

export function hasActiveOutput(state) {
  return (
    Math.max(
      Math.abs(state?.outputFrequency ?? 0),
      Math.abs(state?.mechanicalHz ?? 0),
    ) > STOPPED_FREQUENCY_EPSILON
  );
}

export function isDriveStopped(state, running = state?.running) {
  return !running && !hasActiveOutput(state);
}

export function getDriveStatus(state, running = state.running) {
  if (state.faultCode !== null) {
    return DRIVE_STATUS.FAULT;
  }

  if (state.undervoltage) {
    return DRIVE_STATUS.SUB;
  }

  if (getConfigCode(state.parameters) !== 0) {
    return DRIVE_STATUS.CONFIG;
  }

  if (running || hasActiveOutput(state) || state.emergencyStop) {
    return DRIVE_STATUS.RUN;
  }

  return DRIVE_STATUS.READY;
}

export function isPwmEnableBlocked(state) {
  return [DRIVE_STATUS.SUB, DRIVE_STATUS.FAULT, DRIVE_STATUS.CONFIG].includes(
    getDriveStatus(state),
  );
}
