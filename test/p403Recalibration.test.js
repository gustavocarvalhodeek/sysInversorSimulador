import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createInitialHmiState,
  hmiReducer,
  recalculateP403DependentParameters,
} from "../src/hmi/cfw100Hmi.js";

const press = (state, type, extra = {}) =>
  hmiReducer(state, { type, ...extra });

function roundTo(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function assertApprox(actual, expected, tolerance = 0.1) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `esperado ${expected} (+/- ${tolerance}), recebido ${actual}`,
  );
}

function editParameterTo(state, code, targetValue) {
  let nextState = press(state, "SELECT_PARAMETER", { code });
  nextState = press(nextState, "PRESS_P");

  const currentValue = nextState.editingValue;
  const steps = Math.round((targetValue - currentValue) * 10);
  const action = steps >= 0 ? "PRESS_UP" : "PRESS_DOWN";

  for (let index = 0; index < Math.abs(steps); index += 1) {
    nextState = press(nextState, action);
  }

  return press(nextState, "PRESS_P");
}

test("recalibracao de P403 continua coerente em 60 -> 50 -> 60", () => {
  let state = createInitialHmiState();

  state = editParameterTo(state, "P403", 50);
  assert.equal(state.parameters.P403.value, 50);
  assert.equal(state.parameters.P134.value, 55);
  assert.equal(state.parameters.P142.value, 83.3);
  assert.equal(state.parameters.P145.value, 50);

  state = editParameterTo(state, "P403", 60);
  assert.equal(state.parameters.P403.value, 60);
  assert.equal(state.parameters.P134.value, 66);
  assert.equal(state.parameters.P142.value, 100);
  assert.equal(state.parameters.P145.value, 60);
});

test("recalibracao de P403 usa o valor anterior real em bases intermediarias", () => {
  let state = createInitialHmiState();

  state = editParameterTo(state, "P403", 50);
  state = editParameterTo(state, "P403", 55);
  assert.equal(state.parameters.P403.value, 55);
  assert.equal(state.parameters.P134.value, 60.5);
  assert.equal(state.parameters.P142.value, 91.6);
  assert.equal(state.parameters.P145.value, 55);

  const before57_5 = {
    p134: state.parameters.P134.value,
    p142: state.parameters.P142.value,
    p145: state.parameters.P145.value,
  };

  state = editParameterTo(state, "P403", 57.5);
  const ratio57_5 = 57.5 / 55;
  assert.equal(state.parameters.P403.value, 57.5);
  assert.equal(
    state.parameters.P134.value,
    roundTo(before57_5.p134 * ratio57_5, 1),
  );
  assert.equal(
    state.parameters.P142.value,
    roundTo(before57_5.p142 * ratio57_5, 1),
  );
  assert.equal(
    state.parameters.P145.value,
    roundTo(before57_5.p145 * ratio57_5, 1),
  );

  const before60 = {
    p134: state.parameters.P134.value,
    p142: state.parameters.P142.value,
    p145: state.parameters.P145.value,
  };

  state = editParameterTo(state, "P403", 60);
  const ratio60 = 60 / 57.5;
  assert.equal(state.parameters.P403.value, 60);
  assert.equal(
    state.parameters.P134.value,
    roundTo(before60.p134 * ratio60, 1),
  );
  assert.equal(
    state.parameters.P142.value,
    roundTo(before60.p142 * ratio60, 1),
  );
  assert.equal(
    state.parameters.P145.value,
    roundTo(before60.p145 * ratio60, 1),
  );
  assertApprox(state.parameters.P134.value, 66.1);
  assertApprox(state.parameters.P142.value, 100);
  assertApprox(state.parameters.P145.value, 60);
});

test("recalibracao de P403 respeita limites e ignora bases invalidas", () => {
  const state = createInitialHmiState();
  const parameters = {
    ...state.parameters,
    P134: { ...state.parameters.P134, value: state.parameters.P134.max - 1 },
    P142: { ...state.parameters.P142, value: 95 },
    P145: { ...state.parameters.P145, value: state.parameters.P145.max - 1 },
  };

  const clamped = recalculateP403DependentParameters(parameters, 50, 300);
  assert.equal(clamped.P134.value, parameters.P134.max);
  assert.equal(clamped.P142.value, parameters.P142.max);
  assert.equal(clamped.P145.value, parameters.P145.max);

  const unchangedWhenOldInvalid = recalculateP403DependentParameters(parameters, 0, 55);
  const unchangedWhenNewInvalid = recalculateP403DependentParameters(parameters, 55, NaN);

  assert.equal(unchangedWhenOldInvalid.P134.value, parameters.P134.value);
  assert.equal(unchangedWhenOldInvalid.P142.value, parameters.P142.value);
  assert.equal(unchangedWhenOldInvalid.P145.value, parameters.P145.value);
  assert.equal(unchangedWhenNewInvalid.P134.value, parameters.P134.value);
  assert.equal(unchangedWhenNewInvalid.P142.value, parameters.P142.value);
  assert.equal(unchangedWhenNewInvalid.P145.value, parameters.P145.value);

  for (const code of ["P134", "P142", "P145"]) {
    assert.equal(Number.isFinite(clamped[code].value), true);
    assert.equal(Number.isFinite(unchangedWhenOldInvalid[code].value), true);
    assert.equal(Number.isFinite(unchangedWhenNewInvalid[code].value), true);
  }
});

test("importacao com P403 intermediario preserva a base real para a proxima recalibracao", () => {
  let state = createInitialHmiState();

  state = press(state, "IMPORT_CONFIGURATION", {
    snapshot: {
      P403: 55,
      P134: 60.5,
      P142: 91.6,
      P145: 55,
    },
  });

  assert.equal(state.parameters.P403.value, 55);
  assert.equal(state.parameters.P134.value, 60.5);
  assert.equal(state.parameters.P142.value, 91.6);
  assert.equal(state.parameters.P145.value, 55);

  state = editParameterTo(state, "P403", 57.5);
  assert.equal(state.parameters.P403.value, 57.5);
  assert.equal(state.parameters.P134.value, 63.3);
  assert.equal(state.parameters.P142.value, 95.8);
  assert.equal(state.parameters.P145.value, 57.5);
});
