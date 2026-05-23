import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyMotorHistoryReset,
  shouldResetMotorHistory,
} from "../src/components/motor-simulation/motorHistoryState.js";
import { CFW100_SCENARIO_PRESETS } from "../src/configurations/cfw100ScenarioPresets.js";
import { createInitialHmiState, hmiReducer } from "../src/hmi/cfw100Hmi.js";
import { setStorage } from "../src/utils/persistence.js";

setStorage(null);

function findPreset(predicate, label) {
  const preset = CFW100_SCENARIO_PRESETS.find(predicate);
  assert.ok(preset, `preset ${label} deveria existir`);
  return preset;
}

function applyPreset(preset) {
  return hmiReducer(createInitialHmiState(), {
    type: "APPLY_SCENARIO_PRESET",
    preset,
  });
}

function createPanelHistoryState() {
  return {
    samples: [{ time: 1, rpm: 900, current: 1.2 }],
    faultEvents: [{ time: 2, code: 72 }],
    logs: [{ time: new Date(0), type: "motorStarted" }],
    frozenSamples: [{ time: 3, rpm: 1000, current: 1.5 }],
    activeSeries: new Set(["rpm", "current"]),
    windowMs: 30_000,
    paused: true,
    isFullscreen: true,
    activeTab: "log",
  };
}

test("histórico deve limpar ao trocar preset/cenário", () => {
  const previousState = createInitialHmiState();
  const preset = findPreset(
    (candidate) =>
      candidate.simulatedReadings?.P005 === 30 &&
      candidate.simulatedReadings?.P006 === "run",
    "motor rodando em 30 Hz",
  );
  const nextState = hmiReducer(previousState, {
    type: "APPLY_SCENARIO_PRESET",
    preset,
  });

  assert.equal(
    shouldResetMotorHistory(
      previousState.runtimeSeedVersion,
      nextState.runtimeSeedVersion,
    ),
    true,
  );

  const resetState = applyMotorHistoryReset(createPanelHistoryState(), {
    hmiState: nextState,
    motor: nextState.motorState,
    isRunning: Math.abs(nextState.outputFrequency) > 0.05,
  });

  assert.deepEqual(resetState.samples, []);
  assert.deepEqual(resetState.faultEvents, []);
  assert.deepEqual(resetState.logs, []);
  assert.equal(resetState.frozenSamples, null);
});

test("histórico não deve limpar durante funcionamento normal", () => {
  const runtimeSeedVersion = 4;
  const panelState = createPanelHistoryState();
  const nextPanelState = shouldResetMotorHistory(
    runtimeSeedVersion,
    runtimeSeedVersion,
  )
    ? applyMotorHistoryReset(panelState, {
        hmiState: createInitialHmiState(),
        motor: createInitialHmiState().motorState,
        isRunning: false,
      })
    : panelState;

  assert.equal(nextPanelState, panelState);
  assert.equal(nextPanelState.samples.length, 1);
  assert.equal(nextPanelState.faultEvents.length, 1);
  assert.equal(nextPanelState.logs.length, 1);
});

test("reset visual acompanha o mesmo gatilho do reset físico", () => {
  const previousState = createInitialHmiState();
  const preset = findPreset(
    (candidate) => candidate.simulation?.autoStart === true,
    "autoStart",
  );
  const nextState = hmiReducer(previousState, {
    type: "APPLY_SCENARIO_PRESET",
    preset,
  });

  assert.equal(previousState.runtimeSeedVersion, 0);
  assert.equal(nextState.runtimeSeedVersion, 1);
  assert.equal(
    shouldResetMotorHistory(
      previousState.runtimeSeedVersion,
      nextState.runtimeSeedVersion,
    ),
    true,
  );
});

test("troca de preset não quebra o contexto visual do painel", () => {
  const preset = findPreset(
    (candidate) => candidate.ui?.mode === "student",
    "modo aluno",
  );
  const nextState = applyPreset(preset);
  const panelState = createPanelHistoryState();

  const resetState = applyMotorHistoryReset(panelState, {
    hmiState: nextState,
    motor: nextState.motorState,
    isRunning: Math.abs(nextState.outputFrequency) > 0.05,
  });

  assert.equal(resetState.activeTab, panelState.activeTab);
  assert.equal(resetState.isFullscreen, panelState.isFullscreen);
  assert.equal(resetState.paused, panelState.paused);
  assert.equal(resetState.windowMs, panelState.windowMs);
  assert.equal(resetState.latestRefValue.hmiState, nextState);
  assert.equal(resetState.latestRefValue.motor, nextState.motorState);
  assert.equal(resetState.prevParameters, nextState.parameters);
});
