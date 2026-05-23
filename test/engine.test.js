import { test } from "node:test";
import assert from "node:assert/strict";
import { advance, createEngine, TICK_MS } from "../src/simulation/engine.js";
import { createInitialHmiState } from "../src/hmi/cfw100Hmi.js";
import {
  createInitialDriveState,
  stepDriveSimulation,
} from "../src/simulation/cfw100DriveSimulation.js";

test("advance processa ticks fixos independentemente do tamanho do delta", () => {
  const a = createEngine();
  const b = createEngine();
  let ticksA = 0;
  let ticksB = 0;

  // 100 ms de uma vez vs em 10 pedacos de 10 ms => mesmo total de ticks.
  advance(a, 100, () => {
    ticksA += 1;
  });
  for (let i = 0; i < 10; i += 1) {
    advance(b, 10, () => {
      ticksB += 1;
    });
  }

  assert.equal(ticksA, 100 / TICK_MS);
  assert.equal(ticksA, ticksB);
});

test("acumulo e limitado para evitar espiral da morte", () => {
  const engine = createEngine();
  let ticks = 0;
  advance(engine, 10000, () => {
    ticks += 1;
  });
  assert.ok(ticks <= 250, `esperado <= 250 ticks, obtido ${ticks}`);
});

test("rampa deterministica: 0 -> 66 Hz em ~P100 segundos", () => {
  const hmi = createInitialHmiState();
  const running = {
    ...hmi,
    running: true,
    referenceFrequency: hmi.parameters.P134.value, // 66 Hz
  };
  // P100 = 5.0 s por padrao.
  const accelSeconds = running.parameters.P100.value;

  let drive = createInitialDriveState();
  const engine = createEngine();
  // Simula quadros de ~16 ms por accelSeconds (uso real do navegador).
  const frames = Math.ceil((accelSeconds * 1000) / 16);
  for (let i = 0; i < frames; i += 1) {
    advance(engine, 16, (tickMs) => {
      drive = stepDriveSimulation(drive, running, tickMs);
    });
  }

  assert.ok(
    Math.abs(drive.outputFrequency - 66) < 0.1,
    `esperado ~66 Hz, obtido ${drive.outputFrequency}`,
  );
});
