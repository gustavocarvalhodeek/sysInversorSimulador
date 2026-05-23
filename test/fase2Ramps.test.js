import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialHmiState, hmiReducer } from "../src/hmi/cfw100Hmi.js";
import {
  createInitialDriveState,
  stepDriveSimulation,
} from "../src/simulation/cfw100DriveSimulation.js";
import { advance, createEngine } from "../src/simulation/engine.js";
import { selectRamp } from "../src/simulation/rampSelector.js";
import { setStorage } from "../src/utils/persistence.js";

setStorage(null);

function runningState(overrides = {}) {
  const s = createInitialHmiState();
  return { ...s, running: true, referenceFrequency: 66, ...overrides };
}

function simulate(hmi, seconds, fromDrive) {
  let drive = fromDrive ?? createInitialDriveState();
  const engine = createEngine();
  const frames = Math.ceil((seconds * 1000) / 16);
  for (let i = 0; i < frames; i += 1) {
    advance(engine, 16, (t) => {
      drive = stepDriveSimulation(drive, hmi, t);
    });
  }
  return drive;
}

test("2a rampa (P105=1) usa P102/P103 e e mais rapida que a 1a", () => {
  const segunda = runningState();
  segunda.parameters = {
    ...segunda.parameters,
    P105: { ...segunda.parameters.P105, value: 1 },
    P102: { ...segunda.parameters.P102, value: 2.5 },
  };
  const primeira = runningState(); // P100 = 5 s

  const f1s2a = simulate(segunda, 1).outputFrequency;
  const f1s1a = simulate(primeira, 1).outputFrequency;
  assert.ok(
    f1s2a > f1s1a,
    `2a rampa deveria estar mais adiantada (${f1s2a} > ${f1s1a})`,
  );

  const fim = simulate(segunda, 3).outputFrequency;
  assert.ok(Math.abs(fim - 66) < 0.2, `esperado ~66, obtido ${fim}`);
});

test("rampa S (P104=1) suaviza o inicio (abaixo da linear)", () => {
  const linear = runningState();
  const sCurve = runningState();
  sCurve.parameters = {
    ...sCurve.parameters,
    P104: { ...sCurve.parameters.P104, value: 1 },
  };

  // Em 1 s de uma rampa de 5 s (p=0.2), a curva S esta bem abaixo da linear.
  const fLin = simulate(linear, 1).outputFrequency;
  const fS = simulate(sCurve, 1).outputFrequency;
  assert.ok(fS < fLin * 0.5, `S (${fS}) deveria ser << linear (${fLin})`);
});

test("rampa S chega ao mesmo alvo final", () => {
  const sCurve = runningState();
  sCurve.parameters = {
    ...sCurve.parameters,
    P104: { ...sCurve.parameters.P104, value: 1 },
  };
  const fim = simulate(sCurve, 6).outputFrequency;
  assert.ok(Math.abs(fim - 66) < 0.2, `esperado ~66, obtido ${fim}`);
});

test("parada de emergencia usa P107 e leva a 0", () => {
  const rodando = runningState();
  rodando.parameters = {
    ...rodando.parameters,
    P107: { ...rodando.parameters.P107, value: 2 },
  };
  const atTop = simulate(rodando, 6); // sobe ate 66
  assert.ok(Math.abs(atTop.outputFrequency - 66) < 0.5);

  const emerg = { ...rodando, emergencyStop: true };
  const parado = simulate(emerg, 3, atTop);
  assert.ok(
    Math.abs(parado.outputFrequency) < 0.2,
    `esperado ~0, obtido ${parado.outputFrequency}`,
  );
});

test("nao parte com emergencia ativa; STOP reconhece", () => {
  let s = createInitialHmiState();
  s = hmiReducer(s, { type: "EMERGENCY_STOP" });
  assert.equal(s.emergencyStop, true);

  s = hmiReducer(s, { type: "PRESS_RUN" });
  assert.equal(s.running, false); // bloqueado

  s = hmiReducer(s, { type: "PRESS_STOP" });
  assert.equal(s.emergencyStop, false);

  s = hmiReducer(s, { type: "PRESS_RUN" });
  assert.equal(s.running, true);
});

test("selectRamp: fallback honesto para P105=2 (DIx)", () => {
  const s = createInitialHmiState();
  s.parameters.P105.value = 2;
  const ramp = selectRamp(s);
  assert.equal(ramp.label, "1a rampa");
  assert.equal(ramp.accelTime, s.parameters.P100.value);
  assert.ok(
    ramp.notes.some(
      (note) =>
        note?.key === "rampSelector.notSimulated" &&
        note.fallback === "Selecao de rampa \"DIx\" nao simulada: usando 1a rampa." &&
        note.params?.label?.key === "commandSource.dix" &&
        note.params?.label?.fallback === "DIx",
    ),
  );
});

test("selectRamp: emergencia usa P106/P107 e e linear", () => {
  const s = createInitialHmiState();
  const ramp = selectRamp({ ...s, emergencyStop: true });
  assert.equal(ramp.label, "Emergencia");
  assert.equal(ramp.accelTime, s.parameters.P106.value);
  assert.equal(ramp.decelTime, s.parameters.P107.value);
  assert.equal(ramp.sShape, false);
});

test("estado CONFIG impede a rampa de subir", () => {
  const s = runningState();
  s.parameters.P264.value = 4;
  s.parameters.P265.value = 4;

  const drive = simulate(s, 2);
  assert.equal(drive.outputFrequency, 0);
});

test("P229=1 usa parada por inercia mais lenta que a rampa", () => {
  const running = runningState();
  const atTop = simulate(running, 6);

  const rampStop = {
    ...running,
    running: false,
    parameters: {
      ...running.parameters,
      P229: { ...running.parameters.P229, value: 0 },
    },
  };
  const inertiaStop = {
    ...running,
    running: false,
    parameters: {
      ...running.parameters,
      P229: { ...running.parameters.P229, value: 1 },
    },
  };

  const rampAfter1s = simulate(rampStop, 1, atTop).outputFrequency;
  const inertiaAfter1s = simulate(inertiaStop, 1, atTop).outputFrequency;
  assert.ok(inertiaAfter1s > rampAfter1s);
});
