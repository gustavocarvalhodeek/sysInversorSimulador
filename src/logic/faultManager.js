import { normalizeKnownFaultCode } from "./faultCatalog.js";

function normalizeEventCode(code) {
  const numericCode = Number(code);
  return Number.isFinite(numericCode)
    ? Math.max(0, Math.min(999, Math.trunc(numericCode)))
    : 0;
}

export function raiseFault(state, code) {
  const faultCode = normalizeKnownFaultCode(code);
  if (faultCode === null) {
    return state;
  }

  return {
    ...state,
    running: false,
    faultCode,
  };
}

export function resetFault(state) {
  return {
    ...state,
    faultCode: null,
  };
}

export function raiseAlarm(state, code) {
  return {
    ...state,
    alarmCode: normalizeEventCode(code),
  };
}

export function clearAlarm(state) {
  return {
    ...state,
    alarmCode: null,
  };
}

export function formatEventCode(prefix, code) {
  return `${prefix}${String(code ?? 0).padStart(3, "0")}`;
}
