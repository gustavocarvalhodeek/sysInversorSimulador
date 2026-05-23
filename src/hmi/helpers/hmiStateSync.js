import { resolveCommand } from "../../simulation/commandResolver.js";
import { computeMotorState } from "../../simulation/motorModel.js";
import { selectRamp } from "../../simulation/rampSelector.js";
import { roundTo } from "../../utils/math.js";
import {
  DRIVE_STATUS,
  P006_STATUS_VALUE,
  getConfigCode,
  getDriveStatus,
  hasActiveOutput,
  isPwmEnableBlocked,
} from "../../logic/driveStatus.js";

export function deriveDriveOutputFlags(state, command) {
  const isCoasting =
    Boolean(state.isCoasting) ||
    (!command.running &&
      !state.emergencyStop &&
      (state.parameters.P229?.value ?? 0) === 1 &&
      hasActiveOutput(state));
  const electricalOutputActive =
    Boolean(state.electricalOutputActive) ||
    state.emergencyStop ||
    command.running ||
    (hasActiveOutput(state) && !isCoasting);

  return { electricalOutputActive, isCoasting };
}

export function deriveMotorState(state, command) {
  const { electricalOutputActive, isCoasting } = deriveDriveOutputFlags(
    state,
    command,
  );
  return computeMotorState({
    frequency: state.outputFrequency,
    mechanicalHz: state.mechanicalHz ?? state.outputFrequency,
    electricalOutputActive,
    isCoasting,
    requestedFrequency: command.running ? command.referenceFrequency : 0,
    parameters: state.parameters,
    loadPercent: state.loadPercent,
  });
}

function deriveReadOnly(motor) {
  return {
    P002: roundTo(motor.rpm, 0),
    P003: roundTo(motor.current, 1),
    P004: roundTo(motor.dcVoltage, 0),
    P007: roundTo(motor.outputVoltage, 0),
    P009: roundTo(motor.torquePercent, 1),
    P011: roundTo(motor.activeCurrent, 1),
  };
}

function buildSynchronizedRuntimeContext(state, providedMotorState = null) {
  const interlockedState = isPwmEnableBlocked(state)
    ? { ...state, running: false }
    : state;
  const command = resolveCommand(interlockedState);
  const driveStatus = getDriveStatus(interlockedState, command.running);
  const selectedRamp = selectRamp(interlockedState);
  const motorState =
    providedMotorState ?? deriveMotorState(interlockedState, command);

  return {
    interlockedState,
    command,
    driveStatus,
    selectedRamp,
    motorState,
  };
}

export function syncReadOnlyParameters(state, runtimeContext) {
  const {
    command,
    driveStatus,
    selectedRamp,
    motorState,
  } = runtimeContext;
  const derived = deriveReadOnly(motorState);
  const configCode = getConfigCode(state.parameters);
  const digitalInputMask = (state.digitalInputs ?? []).reduce(
    (mask, active, index) => mask + (active ? 2 ** index : 0),
    0,
  );
  const externalSources = state.externalSources ?? {};
  const logicalStatus = [
    command.running,
    selectedRamp.label === "2a rampa",
    configCode !== 0,
    state.alarmCode !== null,
    hasActiveOutput(state),
    driveStatus === DRIVE_STATUS.RUN,
    command.rotationSign >= 0,
    command.jogActive,
    command.mode === "REMOTE",
    state.undervoltage,
    state.faultCode !== null,
  ].reduce((word, active, index) => {
    const bitByIndex = [1, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15][index];
    return active ? word | (1 << bitByIndex) : word;
  }, 0);

  return {
    ...state.parameters,
    // P001 deve refletir a referencia efetivamente resolvida pelo inversor
    // (HMI, AI1, FI, rede, multispeed, JOG), e nao apenas o valor interno da HMI.
    P001: { ...state.parameters.P001, value: command.referenceFrequency },
    P002: { ...state.parameters.P002, value: derived.P002 },
    P003: { ...state.parameters.P003, value: derived.P003 },
    P004: { ...state.parameters.P004, value: derived.P004 },
    P005: { ...state.parameters.P005, value: state.outputFrequency },
    P006: { ...state.parameters.P006, value: P006_STATUS_VALUE[driveStatus] },
    P007: { ...state.parameters.P007, value: derived.P007 },
    P009: { ...state.parameters.P009, value: derived.P009 },
    P011: { ...state.parameters.P011, value: derived.P011 },
    P012: { ...state.parameters.P012, value: digitalInputMask },
    P030: {
      ...state.parameters.P030,
      value: roundTo(state.moduleTemperature ?? 40, 1),
    },
    P037: { ...state.parameters.P037, value: roundTo(state.ixtPercent, 1) },
    P018: {
      ...state.parameters.P018,
      value: externalSources.ai1Percent ?? 0,
    },
    P022: {
      ...state.parameters.P022,
      value: externalSources.fiFrequency ?? 0,
    },
    P047: { ...state.parameters.P047, value: configCode },
    P048: { ...state.parameters.P048, value: state.alarmCode ?? 0 },
    P049: { ...state.parameters.P049, value: state.faultCode ?? 0 },
    P050: { ...state.parameters.P050, value: state.lastFault?.code ?? 0 },
    P051: { ...state.parameters.P051, value: state.lastFault?.current ?? 0 },
    P052: { ...state.parameters.P052, value: state.lastFault?.dcVoltage ?? 0 },
    P053: { ...state.parameters.P053, value: state.lastFault?.frequency ?? 0 },
    P054: {
      ...state.parameters.P054,
      value: state.lastFault?.temperature ?? 0,
    },
    P683: {
      ...state.parameters.P683,
      value: externalSources.serial?.speed13Bit ?? 0,
    },
    P685: {
      ...state.parameters.P685,
      value: externalSources.codn?.speed13Bit ?? 0,
    },
    P680: { ...state.parameters.P680, value: logicalStatus },
  };
}

export function withSyncedParameters(state, providedMotorState = null) {
  // Mantem a resolucao do runtime concentrada antes de atualizar leituras HMI.
  const runtimeContext = buildSynchronizedRuntimeContext(
    state,
    providedMotorState,
  );
  const { interlockedState, motorState } = runtimeContext;

  return {
    ...interlockedState,
    motorState,
    parameters: syncReadOnlyParameters(interlockedState, runtimeContext),
  };
}
