import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialHmiState } from "../src/hmi/cfw100Hmi.js";
import {
  createInitialDriveState,
} from "../src/simulation/cfw100DriveSimulation.js";
import { stepSimulationTick } from "../src/simulation/cfw100SimulationStep.js";
import { advance, createEngine } from "../src/simulation/engine.js";
import { setStorage } from "../src/utils/persistence.js";

setStorage(null);

function simulateSystem(hmiState, seconds, previous = {}) {
  let driveState = previous.driveState ?? createInitialDriveState();
  let ixtPercent = previous.ixtPercent ?? hmiState.ixtPercent ?? 0;
  let moduleTemperature = previous.moduleTemperature ?? hmiState.moduleTemperature ?? 40;
  let next = null;
  const engine = createEngine();
  const frames = Math.ceil((seconds * 1000) / 16);

  for (let frame = 0; frame < frames; frame += 1) {
    advance(engine, 16, (tickMs) => {
      next = stepSimulationTick({
        driveState,
        hmiState,
        ixtPercent,
        moduleTemperature,
        deltaMs: tickMs,
      });
      driveState = next.driveState;
      ixtPercent = next.ixtPercent;
      moduleTemperature = next.moduleTemperature;
    });
  }

  return next;
}

function runningState(overrides = {}) {
  const state = createInitialHmiState();
  return {
    ...state,
    running: true,
    referenceFrequency: 66,
    loadPercent: 100,
    ...overrides,
  };
}

test("P229=1 corta saida eletrica, mas mantem o giro mecanico durante coast-down", () => {
  const running = runningState();
  const atTop = simulateSystem(running, 6);
  const coastStop = {
    ...running,
    running: false,
    parameters: {
      ...running.parameters,
      P229: { ...running.parameters.P229, value: 1 },
    },
  };

  const after1s = simulateSystem(coastStop, 1, atTop);

  assert.ok(after1s.driveState.outputFrequency > 0);
  assert.ok(after1s.driveState.mechanicalHz > 0);
  assert.equal(after1s.driveState.electricalOutputActive, false);
  assert.equal(after1s.driveState.isCoasting, true);
  assert.equal(after1s.motorState.electricalOutputActive, false);
  assert.equal(after1s.motorState.isCoasting, true);
  assert.ok(after1s.motorState.rpm > 0);
  assert.equal(after1s.motorState.current, 0);
  assert.equal(after1s.motorState.activeCurrent, 0);
  assert.equal(after1s.motorState.torquePercent, 0);
  assert.equal(after1s.motorState.outputPower, 0);
  assert.equal(after1s.motorState.outputVoltage, 0);
});

test("Ixt nao aumenta durante o coast-down com a saida eletrica cortada", () => {
  const running = runningState();
  const atTop = simulateSystem(running, 6);
  const coastStop = {
    ...running,
    running: false,
    parameters: {
      ...running.parameters,
      P229: { ...running.parameters.P229, value: 1 },
    },
  };

  const initialIxt = 40;
  const after1s = simulateSystem(coastStop, 1, {
    ...atTop,
    ixtPercent: initialIxt,
  });

  assert.ok(after1s.ixtPercent <= initialIxt, `${after1s.ixtPercent} deveria ser <= ${initialIxt}`);
});

test("P229=0 mantem saida eletrica ativa durante a parada por rampa", () => {
  const running = runningState();
  const atTop = simulateSystem(running, 6);
  const rampStop = {
    ...running,
    running: false,
    parameters: {
      ...running.parameters,
      P229: { ...running.parameters.P229, value: 0 },
    },
  };

  const after1s = simulateSystem(rampStop, 1, atTop);

  assert.ok(after1s.driveState.outputFrequency > 0);
  assert.equal(after1s.driveState.electricalOutputActive, true);
  assert.equal(after1s.driveState.isCoasting, false);
  assert.equal(after1s.motorState.electricalOutputActive, true);
  assert.equal(after1s.motorState.isCoasting, false);
  assert.ok(after1s.motorState.current > 0);
  assert.ok(after1s.motorState.outputVoltage > 0);
});
