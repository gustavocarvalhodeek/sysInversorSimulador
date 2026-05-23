import {
  isFiniteNumber,
  toFiniteNumber,
} from "../../utils/sanitizers.js";
import { clamp, roundTo } from "../../utils/math.js";

function clampParameterValue(parameter, value, overrides = {}) {
  if (!parameter || !isFiniteNumber(value)) {
    return parameter?.value ?? value;
  }

  const min = isFiniteNumber(overrides.min)
    ? overrides.min
    : isFiniteNumber(parameter.min)
      ? parameter.min
      : Number.NEGATIVE_INFINITY;
  const max = isFiniteNumber(overrides.max)
    ? overrides.max
    : isFiniteNumber(parameter.max)
      ? parameter.max
      : Number.POSITIVE_INFINITY;
  const decimals = parameter.decimals ?? 0;

  return roundTo(clamp(value, min, max), decimals);
}

export function recalculateP403DependentParameters(
  parameters,
  oldBaseValue,
  newBaseValue,
) {
  const oldBase = toFiniteNumber(oldBaseValue, null);
  const newBase = toFiniteNumber(newBaseValue, null);

  if (
    !Number.isFinite(oldBase) ||
    oldBase <= 0 ||
    !Number.isFinite(newBase) ||
    newBase <= 0
  ) {
    return parameters;
  }

  const ratio = newBase / oldBase;
  if (!Number.isFinite(ratio) || ratio <= 0) {
    return parameters;
  }

  const nextP134Value = clampParameterValue(
    parameters.P134,
    parameters.P134.value * ratio,
    { min: Math.max(parameters.P133?.value ?? 0, parameters.P134?.min ?? 0) },
  );
  const nextP142Value = clampParameterValue(
    parameters.P142,
    parameters.P142.value * ratio,
  );
  const nextP145Value = clampParameterValue(
    parameters.P145,
    parameters.P145.value * ratio,
    { min: Math.max(parameters.P146?.value ?? 0, parameters.P145?.min ?? 0) },
  );

  return {
    ...parameters,
    P134: { ...parameters.P134, value: nextP134Value },
    P142: { ...parameters.P142, value: nextP142Value },
    P145: { ...parameters.P145, value: nextP145Value },
  };
}

export function applySpecialParameterEffects(
  state,
  parameter,
  previousState = state,
  { withSyncedParameters },
) {
  if (parameter.code === "P121") {
    const minimumFrequency = state.parameters.P133.value;
    const maximumFrequency = state.parameters.P134.value;

    return withSyncedParameters({
      ...state,
      referenceFrequency: clamp(
        state.parameters.P121.value,
        minimumFrequency,
        maximumFrequency,
      ),
    });
  }

  if (parameter.code === "P133") {
    const maximumFrequency = state.parameters.P134.value;
    const safeMin = clamp(state.parameters.P133.value, 0, maximumFrequency);

    return withSyncedParameters({
      ...state,
      referenceFrequency: clamp(state.referenceFrequency, safeMin, maximumFrequency),
      parameters: {
        ...state.parameters,
        P133: { ...state.parameters.P133, value: safeMin },
      },
    });
  }

  if (parameter.code === "P134") {
    const minimumFrequency = state.parameters.P133.value;
    const safeMax = Math.max(state.parameters.P134.value, minimumFrequency);

    return withSyncedParameters({
      ...state,
      referenceFrequency: clamp(state.referenceFrequency, minimumFrequency, safeMax),
      parameters: {
        ...state.parameters,
        P134: { ...state.parameters.P134, value: safeMax },
      },
    });
  }

  if (parameter.code === "P401") {
    const iNom = state.parameters.P401.value;
    const p135New = roundTo(iNom * 1.5, 1);
    const p156New = roundTo(iNom * 1.2, 1);

    return withSyncedParameters({
      ...state,
      parameters: {
        ...state.parameters,
        P135: { ...state.parameters.P135, value: p135New },
        P156: { ...state.parameters.P156, value: p156New },
      },
    });
  }

  if (parameter.code === "P145") {
    const freqInter = state.parameters.P146.value;
    const safeFieldWeak = Math.max(state.parameters.P145.value, freqInter);

    return withSyncedParameters({
      ...state,
      parameters: {
        ...state.parameters,
        P145: { ...state.parameters.P145, value: safeFieldWeak },
      },
    });
  }

  if (parameter.code === "P146") {
    const freqFieldWeak = state.parameters.P145.value;
    const safeInter = clamp(state.parameters.P146.value, 0, freqFieldWeak);

    return withSyncedParameters({
      ...state,
      parameters: {
        ...state.parameters,
        P146: { ...state.parameters.P146, value: safeInter },
      },
    });
  }

  if (parameter.code === "P403") {
    const recalculatedParameters = recalculateP403DependentParameters(
      state.parameters,
      previousState.parameters.P403?.value,
      state.parameters.P403.value,
    );

    return withSyncedParameters({
      ...state,
      parameters: recalculatedParameters,
    });
  }

  if (parameter.code === "P202" && state.parameters.P202.value === 5) {
    return withSyncedParameters({
      ...state,
      parameters: {
        ...state.parameters,
        P136: { ...state.parameters.P136, value: 0 },
        P137: { ...state.parameters.P137, value: 0 },
      },
    });
  }

  return state;
}
