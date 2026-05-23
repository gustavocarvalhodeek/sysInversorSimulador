import {
  canEditParameter,
  getVisibleParameterCodes,
} from "../parameters/parameterHelpers.js";
import { clamp, roundTo } from "../../utils/math.js";

export function getSelectedParameter(state) {
  const code = state.parameterOrder[state.selectedParameterIndex];
  return state.parameters[code];
}

export function moveParameterSelection(state, delta) {
  const total = state.parameterOrder.length;
  const nextIndex = (state.selectedParameterIndex + delta + total) % total;

  return {
    ...state,
    selectedParameterIndex: nextIndex,
  };
}

export function selectParameterByCode(state, code, hmiModes) {
  const index = state.parameterOrder.indexOf(code);
  if (index < 0) {
    return state;
  }

  return {
    ...state,
    mode: hmiModes.SELECT_PARAM,
    selectedParameterIndex: index,
    editingValue: null,
    lastRejectedEdit: null,
  };
}

export function withVisibleParameterOrder(state, preferredCode = null) {
  const parameterOrder = getVisibleParameterCodes(state);
  const fallbackCode = parameterOrder[0];
  const selectedCode =
    preferredCode && parameterOrder.includes(preferredCode)
      ? preferredCode
      : fallbackCode;

  return {
    ...state,
    parameterOrder,
    selectedParameterIndex: Math.max(parameterOrder.indexOf(selectedCode), 0),
  };
}

export function adjustReferenceFrequency(state, delta, withSyncedParameters) {
  const minimumFrequency = state.parameters.P133.value;
  const maximumFrequency = state.parameters.P134.value;
  const nextFrequency = clamp(
    roundTo(state.referenceFrequency + delta, 1),
    minimumFrequency,
    maximumFrequency,
  );

  return withSyncedParameters({
    ...state,
    referenceFrequency: nextFrequency,
    parameters: {
      ...state.parameters,
      P121: {
        ...state.parameters.P121,
        value: nextFrequency,
      },
    },
  });
}

export function adjustEditingValue(state, direction) {
  const parameter = getSelectedParameter(state);
  const verdict = canEditParameter(parameter, state);

  if (!verdict.editable) {
    return {
      ...state,
      lastRejectedEdit: { code: parameter.code, reason: verdict.reason },
    };
  }

  const step = parameter.step ?? 1;
  const decimals = parameter.decimals ?? 0;
  const min = parameter.min ?? Number.NEGATIVE_INFINITY;
  const max = parameter.max ?? Number.POSITIVE_INFINITY;
  const nextValue = clamp(
    roundTo(state.editingValue + direction * step, decimals),
    min,
    max,
  );

  return {
    ...state,
    editingValue: nextValue,
    lastRejectedEdit: null,
  };
}

export function enterEditMode(state, hmiModes) {
  const parameter = getSelectedParameter(state);

  return {
    ...state,
    mode: hmiModes.EDIT_PARAM,
    editingValue: parameter.value,
    lastRejectedEdit: null,
  };
}
