import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createInitialHmiState,
  getDisplayModel,
  hmiReducer,
} from "../src/hmi/cfw100Hmi.js";
import {
  createInitialDriveState,
  stepDriveSimulation,
} from "../src/simulation/cfw100DriveSimulation.js";
import { advance, createEngine } from "../src/simulation/engine.js";
import { STOPPED_FREQUENCY_EPSILON } from "../src/logic/driveStatus.js";
import { canEditParameter } from "../src/hmi/parameters/parameterHelpers.js";
import { setStorage } from "../src/utils/persistence.js";

setStorage(null);

function press(state, type, extra = {}) {
  return hmiReducer(state, { type, ...extra });
}

function syncOutputFrequency(state, outputFrequency) {
  return press(state, "SYNC_DRIVE_STATE", { outputFrequency });
}

function syncDriveState(state, outputFrequency, extra = {}) {
  return press(state, "SYNC_DRIVE_STATE", {
    outputFrequency,
    mechanicalHz: outputFrequency,
    ...extra,
  });
}

function createDriveAtFrequency(frequency) {
  return {
    ...createInitialDriveState(),
    outputFrequency: frequency,
    mechanicalHz: frequency,
    segmentStart: frequency,
    segmentTarget: frequency,
  };
}

function simulateDrive(hmiState, seconds, fromDrive) {
  let drive = fromDrive ?? createInitialDriveState();
  const engine = createEngine();
  const frames = Math.ceil((seconds * 1000) / 16);

  for (let frame = 0; frame < frames; frame += 1) {
    advance(engine, 16, (tickMs) => {
      drive = stepDriveSimulation(drive, hmiState, tickMs);
    });
  }

  return drive;
}

test("STOP remove o comando RUN sem colocar P006 em READY com saida ainda ativa", () => {
  let state = createInitialHmiState();
  state = { ...state, running: true, referenceFrequency: 30 };
  state = syncOutputFrequency(state, 30);

  state = press(state, "PRESS_STOP");

  assert.equal(state.running, false);
  assert.equal(state.parameters.P006.value, 1);
  assert.equal(getDisplayModel(state).value, "30.0");
  assert.equal(canEditParameter(state.parameters.P202, state).editable, false);
});

test("PRESS_STOP com P229=1 corta a saida eletrica imediatamente e entra em coast-down", () => {
  let state = createInitialHmiState();
  state = {
    ...state,
    running: true,
    referenceFrequency: 30,
    parameters: {
      ...state.parameters,
      P229: { ...state.parameters.P229, value: 1 },
    },
  };
  state = syncDriveState(state, 30, {
    electricalOutputActive: true,
    isCoasting: false,
  });

  state = press(state, "PRESS_STOP");

  assert.equal(state.running, false);
  assert.equal(state.outputFrequency, 30);
  assert.equal(state.mechanicalHz, 30);
  assert.equal(state.electricalOutputActive, false);
  assert.equal(state.isCoasting, true);
  assert.equal(state.parameters.P003.value, 0);
  assert.equal(state.parameters.P007.value, 0);
  assert.equal(state.parameters.P009.value, 0);
  assert.equal(state.parameters.P011.value, 0);
  assert.equal(state.parameters.P006.value, 1);
  assert.equal(canEditParameter(state.parameters.P202, state).editable, false);
});

test("PRESS_STOP com P229=0 preserva a parada por rampa sem marcar coast-down", () => {
  let state = createInitialHmiState();
  state = { ...state, running: true, referenceFrequency: 30 };
  state = syncDriveState(state, 30, {
    electricalOutputActive: true,
    isCoasting: false,
  });

  state = press(state, "PRESS_STOP");

  assert.equal(state.running, false);
  assert.equal(state.outputFrequency, 30);
  assert.equal(state.mechanicalHz, 30);
  assert.equal(state.electricalOutputActive, true);
  assert.equal(state.isCoasting, false);
  assert.equal(state.parameters.P006.value, 1);
  assert.equal(canEditParameter(state.parameters.P202, state).editable, false);
});

test("durante a desaceleracao por rampa os parametros CFG continuam bloqueados", () => {
  let state = createInitialHmiState();
  state = { ...state, running: true, referenceFrequency: 66 };
  state = syncOutputFrequency(state, 66);

  state = press(state, "PRESS_STOP");
  const driveAfter1s = simulateDrive(state, 1, createDriveAtFrequency(66));
  assert.ok(driveAfter1s.outputFrequency > STOPPED_FREQUENCY_EPSILON);

  state = syncOutputFrequency(state, driveAfter1s.outputFrequency);

  assert.equal(state.parameters.P006.value, 1);
  assert.equal(canEditParameter(state.parameters.P202, state).editable, false);
});

test("durante o coast-down com P229=1 os parametros CFG continuam bloqueados", () => {
  let state = createInitialHmiState();
  state = {
    ...state,
    running: true,
    referenceFrequency: 66,
    parameters: {
      ...state.parameters,
      P229: { ...state.parameters.P229, value: 1 },
    },
  };
  state = syncOutputFrequency(state, 66);

  state = press(state, "PRESS_STOP");
  const driveAfter1s = simulateDrive(state, 1, createDriveAtFrequency(66));
  assert.ok(driveAfter1s.outputFrequency > STOPPED_FREQUENCY_EPSILON);

  state = syncOutputFrequency(state, driveAfter1s.outputFrequency);

  assert.equal(state.parameters.P006.value, 1);
  assert.equal(canEditParameter(state.parameters.P202, state).editable, false);
});

test("quando a frequencia chega a zero o inversor volta a READY e libera CFG", () => {
  let state = createInitialHmiState();
  state = { ...state, running: true, referenceFrequency: 40 };
  state = syncOutputFrequency(state, 40);

  state = press(state, "PRESS_STOP");
  state = syncOutputFrequency(state, 0);

  assert.equal(state.parameters.P006.value, 0);
  assert.equal(getDisplayModel(state).value, "rdY");
  assert.equal(canEditParameter(state.parameters.P202, state).editable, true);
});
