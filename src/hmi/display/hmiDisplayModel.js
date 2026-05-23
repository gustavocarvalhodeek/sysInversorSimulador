import { resolveCommand } from "../../simulation/commandResolver.js";
import {
  DRIVE_STATUS,
  getDriveStatus,
  hasActiveOutput,
} from "../../logic/driveStatus.js";
import { formatEventCode } from "../../logic/faultManager.js";
import { clamp } from "../../utils/math.js";

function formatNumericValue(value, decimals) {
  return Number(value).toFixed(decimals);
}

function getDisplayBarPercent(state) {
  const barParameterCode = `P${String(state.parameters.P207?.value ?? 3).padStart(3, "0")}`;
  const barParameter = state.parameters[barParameterCode];
  const rawValue = Math.abs(barParameter?.value ?? 0);
  const fullScale = Math.max(
    Math.abs(state.parameters.P208?.value ?? state.parameters.P134.value),
    0.001,
  );

  return clamp((rawValue / fullScale) * 100, 0, 100);
}

function getDisplayStatusLabel(driveStatus) {
  switch (driveStatus) {
    case DRIVE_STATUS.RUN:
      return "RUN";
    case DRIVE_STATUS.SUB:
      return "SUB";
    case DRIVE_STATUS.FAULT:
      return "FLT";
    case DRIVE_STATUS.CONFIG:
      return "CONF";
    default:
      return "RDY";
  }
}

function buildDisplayModel(state, overrides = {}) {
  const command = resolveCommand(state);
  const driveStatus = getDriveStatus(state, command.running);

  return {
    value: "",
    unit: "",
    status: getDisplayStatusLabel(driveStatus),
    direction: command.rotationSign < 0 ? "REV" : "FWD",
    barPercent: getDisplayBarPercent(state),
    blinkValue: false,
    blinkUnit: false,
    ...overrides,
  };
}

export function getDisplayModelForState(state, selectedParameter) {
  if (state.lastRejectedEdit) {
    const reasonParts = state.lastRejectedEdit.reason.split(":");
    const shortError = reasonParts.length > 1 ? reasonParts[0].trim() : "Err";
    return buildDisplayModel(state, {
      value: shortError,
      unit: "",
      blinkValue: true,
    });
  }

  if (state.faultCode !== null) {
    return buildDisplayModel(state, {
      value: formatEventCode("F", state.faultCode),
      unit: "",
      blinkValue: true,
    });
  }

  if (state.alarmCode !== null && !state.alarmAcknowledged) {
    return buildDisplayModel(state, {
      value: formatEventCode("A", state.alarmCode),
      unit: "",
    });
  }

  if (state.mode === "SELECT_PARAM") {
    return buildDisplayModel(state, {
      value: selectedParameter.code,
      unit: state.alarmCode !== null ? "A" : "",
      blinkUnit: state.alarmCode !== null,
    });
  }

  if (state.mode === "EDIT_PARAM") {
    return buildDisplayModel(state, {
      value: formatNumericValue(state.editingValue, selectedParameter.decimals ?? 0),
      unit: state.alarmCode !== null ? "A" : selectedParameter.unit,
      blinkUnit: state.alarmCode !== null,
    });
  }

  const command = resolveCommand(state);
  const driveStatus = getDriveStatus(state, command.running);

  if (driveStatus === DRIVE_STATUS.CONFIG) {
    return buildDisplayModel(state, { value: "conF", unit: "" });
  }

  if (driveStatus === DRIVE_STATUS.SUB) {
    return buildDisplayModel(state, { value: "Sub", unit: "" });
  }

  if (driveStatus === DRIVE_STATUS.RUN || hasActiveOutput(state)) {
    return buildDisplayModel(state, {
      value: formatNumericValue(state.outputFrequency, 1),
      unit: "Hz",
    });
  }

  return buildDisplayModel(state, { value: "rdY", unit: "" });
}
