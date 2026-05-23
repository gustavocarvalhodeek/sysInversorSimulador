export const MAX_LOAD_PERCENT = 150;
export const MIN_AI1_PERCENT = 0;
export const MAX_AI1_PERCENT = 100;
export const MIN_FI_FREQUENCY = 0;
export const MAX_FI_FREQUENCY = 3000;
export const MAX_EXTERNAL_SPEED_13BIT = 8192;
export const MIN_IXT_PERCENT = 0;
export const MAX_IXT_PERCENT = 100;
export const MIN_MODULE_TEMPERATURE = 40;
export const MAX_MODULE_TEMPERATURE = 120;

export const DEFAULT_EXTERNAL_SOURCES = {
  ai1Percent: 0,
  fiFrequency: 0,
  serial: { speed13Bit: 0, run: false, jog: false, rotationSign: 1 },
  codn: { speed13Bit: 0, run: false, jog: false, rotationSign: 1 },
  softplc: {
    speed13Bit: 0,
    run: false,
    jog: false,
    rotationSign: 1,
    remoteMode: false,
  },
};

const NETWORK_SOURCE_KEYS = new Set(["serial", "codn", "softplc"]);

export function cloneDefaultExternalSources() {
  return {
    ...DEFAULT_EXTERNAL_SOURCES,
    serial: { ...DEFAULT_EXTERNAL_SOURCES.serial },
    codn: { ...DEFAULT_EXTERNAL_SOURCES.codn },
    softplc: { ...DEFAULT_EXTERNAL_SOURCES.softplc },
  };
}

export function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function coerceNumberString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

export function toFiniteNumber(value, fallback = null) {
  if (isFiniteNumber(value)) {
    return value;
  }

  const coerced = coerceNumberString(value);
  return coerced ?? fallback;
}

export function clampNumber(value, min, max, fallback = null) {
  const numeric = toFiniteNumber(value, null);
  if (numeric === null) {
    return fallback;
  }

  let nextValue = numeric;
  if (typeof min === "number") {
    nextValue = Math.max(nextValue, min);
  }
  if (typeof max === "number") {
    nextValue = Math.min(nextValue, max);
  }

  return nextValue;
}

export function sanitizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === 1 || value === "1") {
    return true;
  }
  if (value === 0 || value === "0") {
    return false;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "on", "yes", "sim"].includes(normalized)) {
      return true;
    }
    if (["false", "off", "no", "nao"].includes(normalized)) {
      return false;
    }
  }

  return fallback;
}

export function sanitizeInteger(value, min, max, fallback = 0) {
  const numeric = clampNumber(value, min, max, fallback);
  return Number.isFinite(numeric) ? Math.round(numeric) : fallback;
}

export function sanitizeLoadPercent(value, fallback = 0) {
  return clampNumber(value, 0, MAX_LOAD_PERCENT, fallback);
}

export function sanitizeAi1Percent(value, fallback = 0) {
  return clampNumber(value, MIN_AI1_PERCENT, MAX_AI1_PERCENT, fallback);
}

export function sanitizeFiFrequency(value, fallback = 0) {
  return clampNumber(value, MIN_FI_FREQUENCY, MAX_FI_FREQUENCY, fallback);
}

export function sanitizeIxtPercent(value, fallback = 0) {
  return clampNumber(value, MIN_IXT_PERCENT, MAX_IXT_PERCENT, fallback);
}

export function sanitizeModuleTemperature(value, fallback = MIN_MODULE_TEMPERATURE) {
  return clampNumber(
    value,
    MIN_MODULE_TEMPERATURE,
    MAX_MODULE_TEMPERATURE,
    fallback,
  );
}

export function sanitizeDigitalInputs(value, fallback = null) {
  const base = Array.isArray(fallback)
    ? Array.from({ length: 8 }, (_, index) => sanitizeBoolean(fallback[index], false))
    : Array.from({ length: 8 }, () => false);

  if (!Array.isArray(value)) {
    return base;
  }

  return Array.from({ length: 8 }, (_, index) =>
    sanitizeBoolean(value[index], base[index]),
  );
}

function sanitizeRotationSign(value, fallback = 1) {
  const numeric = toFiniteNumber(value, fallback);
  return numeric < 0 ? -1 : 1;
}

function sanitizeNetworkSourceState(sourceName, value, fallback) {
  const base = {
    speed13Bit: sanitizeInteger(
      fallback?.speed13Bit,
      0,
      MAX_EXTERNAL_SPEED_13BIT,
      0,
    ),
    run: sanitizeBoolean(fallback?.run, false),
    jog: sanitizeBoolean(fallback?.jog, false),
    rotationSign: sanitizeRotationSign(fallback?.rotationSign, 1),
  };

  if (sourceName === "softplc") {
    base.remoteMode = sanitizeBoolean(fallback?.remoteMode, false);
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return base;
  }

  const nextState = {
    ...base,
    speed13Bit: value.speed13Bit === undefined
      ? base.speed13Bit
      : sanitizeInteger(value.speed13Bit, 0, MAX_EXTERNAL_SPEED_13BIT, base.speed13Bit),
    run: value.run === undefined ? base.run : sanitizeBoolean(value.run, base.run),
    jog: value.jog === undefined ? base.jog : sanitizeBoolean(value.jog, base.jog),
    rotationSign:
      value.rotationSign === undefined
        ? base.rotationSign
        : sanitizeRotationSign(value.rotationSign, base.rotationSign),
  };

  if (sourceName === "softplc") {
    nextState.remoteMode =
      value.remoteMode === undefined
        ? base.remoteMode
        : sanitizeBoolean(value.remoteMode, base.remoteMode);
  }

  return nextState;
}

export function sanitizeExternalSources(value, previousState = DEFAULT_EXTERNAL_SOURCES) {
  const base = cloneDefaultExternalSources();
  const previous = previousState && typeof previousState === "object"
    ? previousState
    : {};

  base.ai1Percent = sanitizeAi1Percent(previous.ai1Percent, base.ai1Percent);
  base.fiFrequency = sanitizeFiFrequency(previous.fiFrequency, base.fiFrequency);
  base.serial = sanitizeNetworkSourceState("serial", previous.serial, base.serial);
  base.codn = sanitizeNetworkSourceState("codn", previous.codn, base.codn);
  base.softplc = sanitizeNetworkSourceState("softplc", previous.softplc, base.softplc);

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return base;
  }

  return {
    ...base,
    ai1Percent:
      value.ai1Percent === undefined
        ? base.ai1Percent
        : sanitizeAi1Percent(value.ai1Percent, base.ai1Percent),
    fiFrequency:
      value.fiFrequency === undefined
        ? base.fiFrequency
        : sanitizeFiFrequency(value.fiFrequency, base.fiFrequency),
    serial:
      value.serial === undefined
        ? { ...base.serial }
        : sanitizeNetworkSourceState("serial", value.serial, base.serial),
    codn:
      value.codn === undefined
        ? { ...base.codn }
        : sanitizeNetworkSourceState("codn", value.codn, base.codn),
    softplc:
      value.softplc === undefined
        ? { ...base.softplc }
        : sanitizeNetworkSourceState("softplc", value.softplc, base.softplc),
  };
}

export function sanitizeExternalSourceUpdate(
  sourceName,
  value,
  previousState = DEFAULT_EXTERNAL_SOURCES,
) {
  const base = sanitizeExternalSources(undefined, previousState);
  if (!NETWORK_SOURCE_KEYS.has(sourceName)) {
    return base;
  }

  return sanitizeExternalSources({ [sourceName]: value }, base);
}

export function sanitizeParameterValue(parameter, value, fallback = parameter?.value) {
  if (!parameter) {
    return fallback;
  }

  const min = isFiniteNumber(parameter.min) ? parameter.min : undefined;
  const max = isFiniteNumber(parameter.max) ? parameter.max : undefined;
  return clampNumber(value, min, max, fallback);
}

export function getSafeFrequencyLimits(parameters, fallbackMin = 0, fallbackMax = 60) {
  const minimumFrequency = clampNumber(
    parameters?.P133?.value,
    0,
    Number.POSITIVE_INFINITY,
    fallbackMin,
  );
  const maximumFrequency = clampNumber(
    parameters?.P134?.value,
    minimumFrequency,
    Number.POSITIVE_INFINITY,
    Math.max(fallbackMax, minimumFrequency),
  );

  return {
    minimumFrequency,
    maximumFrequency: Math.max(maximumFrequency, minimumFrequency),
  };
}

export function sanitizeReferenceFrequency(value, parameters, fallback = null) {
  const { minimumFrequency, maximumFrequency } = getSafeFrequencyLimits(parameters);
  const safeFallback = clampNumber(
    fallback,
    minimumFrequency,
    maximumFrequency,
    minimumFrequency,
  );

  return clampNumber(value, minimumFrequency, maximumFrequency, safeFallback);
}

export function sanitizeOutputFrequency(value, parameters, fallback = 0) {
  const { maximumFrequency } = getSafeFrequencyLimits(parameters);
  const safeFallback = clampNumber(
    fallback,
    -maximumFrequency,
    maximumFrequency,
    0,
  );

  return clampNumber(value, -maximumFrequency, maximumFrequency, safeFallback);
}

export function sanitizeDigitalInputIndex(value, fallback = -1) {
  return sanitizeInteger(value, 0, 7, fallback);
}
