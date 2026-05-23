import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveAutomationCycleUpdate } from "../src/hooks/useAutomationCycle.js";
import { createInitialHmiState, hmiReducer } from "../src/hmi/cfw100Hmi.js";
import { setStorage } from "../src/utils/persistence.js";

setStorage(null);

function createAutomationState({ p133 = 0, p134 = 60 } = {}) {
  const state = createInitialHmiState();

  return {
    ...state,
    automationCycle: "acceleration",
    automationStartTime: 0,
    parameters: {
      ...state.parameters,
      P133: { ...state.parameters.P133, value: p133 },
      P134: { ...state.parameters.P134, value: p134 },
    },
  };
}

function applyAutomationTick(state, elapsedMs) {
  const update = resolveAutomationCycleUpdate({
    automationCycle: state.automationCycle,
    elapsedMs,
    parameters: state.parameters,
  });

  const nextState = hmiReducer(state, {
    type: "UPDATE_AUTOMATION_SPEED",
    speed: update.targetFrequency,
    running: update.shouldRun,
  });

  return { update, nextState };
}

test("ciclo automático nao satura imediatamente em P134", () => {
  const state = createAutomationState({ p133: 0, p134: 60 });
  const { update, nextState } = applyAutomationTick(state, 400);

  assert.equal(update.shouldRun, true);
  assert.equal(update.targetFrequency > 0, true);
  assert.equal(update.targetFrequency < 60, true);
  assert.equal(nextState.referenceFrequency < 60, true);
});

test("ciclo automático respeita P134", () => {
  const state = createAutomationState({ p133: 0, p134: 60 });

  for (const elapsedMs of [10_000, 20_000, 45_000, 80_000]) {
    const { update, nextState } = applyAutomationTick(state, elapsedMs);
    assert.equal(update.targetFrequency <= 60, true, `elapsed=${elapsedMs}`);
    assert.equal(nextState.referenceFrequency <= 60, true, `elapsed=${elapsedMs}`);
  }
});

test("ciclo automático respeita P133", () => {
  const state = createAutomationState({ p133: 25, p134: 60 });

  for (const elapsedMs of [0, 2_500, 10_000, 45_000, 60_000]) {
    const { update, nextState } = applyAutomationTick(state, elapsedMs);
    assert.equal(update.targetFrequency >= 25, true, `elapsed=${elapsedMs}`);
    assert.equal(nextState.referenceFrequency >= 25, true, `elapsed=${elapsedMs}`);
  }
});

test("ciclo automático evolui gradualmente ao longo da rampa", () => {
  const state = createAutomationState({ p133: 0, p134: 60 });

  const start = applyAutomationTick(state, 0).update.targetFrequency;
  const early = applyAutomationTick(state, 2_500).update.targetFrequency;
  const middle = applyAutomationTick(state, 5_000).update.targetFrequency;
  const late = applyAutomationTick(state, 7_500).update.targetFrequency;
  const top = applyAutomationTick(state, 10_000).update.targetFrequency;

  assert.equal(start < early, true);
  assert.equal(early < middle, true);
  assert.equal(middle < late, true);
  assert.equal(late <= top, true);
  assert.equal(top, 60);
});
