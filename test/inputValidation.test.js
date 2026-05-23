import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialHmiState, hmiReducer } from "../src/hmi/cfw100Hmi.js";
import { resolveCommand } from "../src/simulation/commandResolver.js";
import { setStorage } from "../src/utils/persistence.js";

setStorage(null);

const reduce = (state, type, extra = {}) =>
  hmiReducer(state, { type, ...extra });

test("SET_LOAD rejeita NaN e limita valores fora da faixa", () => {
  let state = createInitialHmiState();
  state = reduce(state, "SET_LOAD", { value: 80 });

  state = reduce(state, "SET_LOAD", { value: Number.NaN });
  assert.equal(state.loadPercent, 80);

  state = reduce(state, "SET_LOAD", { value: -10 });
  assert.equal(state.loadPercent, 0);

  state = reduce(state, "SET_LOAD", { value: 999 });
  assert.equal(state.loadPercent, 150);
});

test("SET_AI1_PERCENT rejeita NaN e limita entre 0 e 100", () => {
  let state = createInitialHmiState();
  state = reduce(state, "SET_AI1_PERCENT", { value: 40 });

  state = reduce(state, "SET_AI1_PERCENT", { value: Number.NaN });
  assert.equal(state.externalSources.ai1Percent, 40);

  state = reduce(state, "SET_AI1_PERCENT", { value: -35 });
  assert.equal(state.externalSources.ai1Percent, 0);

  state = reduce(state, "SET_AI1_PERCENT", { value: 135 });
  assert.equal(state.externalSources.ai1Percent, 100);
});

test("SET_FI_FREQUENCY rejeita NaN e limita a faixa valida", () => {
  let state = createInitialHmiState();
  state = reduce(state, "SET_FI_FREQUENCY", { value: 1200 });

  state = reduce(state, "SET_FI_FREQUENCY", { value: Infinity });
  assert.equal(state.externalSources.fiFrequency, 1200);

  state = reduce(state, "SET_FI_FREQUENCY", { value: -5 });
  assert.equal(state.externalSources.fiFrequency, 0);

  state = reduce(state, "SET_FI_FREQUENCY", { value: 9999 });
  assert.equal(state.externalSources.fiFrequency, 3000);
});

test("SET_EXTERNAL_SOURCE ignora campos desconhecidos e preserva valores invalidos anteriores", () => {
  let state = createInitialHmiState();
  state = reduce(state, "SET_EXTERNAL_SOURCE", {
    source: "serial",
    value: { speed13Bit: 1024, run: true },
  });

  state = reduce(state, "SET_EXTERNAL_SOURCE", {
    source: "serial",
    value: { speed13Bit: Number.NaN, jog: "true", unsafe: 999 },
  });
  assert.equal(state.externalSources.serial.speed13Bit, 1024);
  assert.equal(state.externalSources.serial.run, true);
  assert.equal(state.externalSources.serial.jog, true);
  assert.equal("unsafe" in state.externalSources.serial, false);

  const previousSources = JSON.parse(JSON.stringify(state.externalSources));
  state = reduce(state, "SET_EXTERNAL_SOURCE", {
    source: "desconhecida",
    value: { foo: "bar" },
  });
  assert.deepEqual(state.externalSources, previousSources);
});

test("SET_DIGITAL_INPUT normaliza booleanos e ignora indices invalidos", () => {
  let state = createInitialHmiState();
  state = reduce(state, "SET_DIGITAL_INPUT", { index: 0, value: "true" });
  assert.equal(state.digitalInputs[0], true);

  const previousInputs = [...state.digitalInputs];
  state = reduce(state, "SET_DIGITAL_INPUT", { index: 99, value: false });
  assert.deepEqual(state.digitalInputs, previousInputs);
});

test("importacao com valores invalidos nao corrompe o estado do simulador", () => {
  let state = createInitialHmiState();

  state = reduce(state, "IMPORT_CONFIGURATION", {
    snapshot: {
      P100: "invalido",
      P121: 9999,
      P133: -5,
      P999: 1,
    },
  });

  assert.equal(state.parameters.P100.value, 5);
  assert.equal(state.parameters.P121.value, state.parameters.P134.value);
  assert.equal(state.referenceFrequency, state.parameters.P134.value);
  assert.equal(state.parameters.P133.value, 0);
});

test("preset com simulation invalida e sanitizado sem quebrar fontes externas e entradas digitais", () => {
  const state = reduce(createInitialHmiState(), "APPLY_SCENARIO_PRESET", {
    preset: {
      scenario: { name: "Preset invalido" },
      parameters: { P121: 40 },
      simulation: {
        loadPercent: Infinity,
        ixtPercent: -15,
        moduleTemperature: "quente",
        outputFrequency: "ruim",
        digitalInputs: [1, "false", "true", null],
        externalSources: {
          ai1Percent: -30,
          fiFrequency: "900",
          serial: { speed13Bit: "99999", run: "yes" },
          softplc: { remoteMode: "1" },
        },
      },
    },
  });

  assert.equal(state.loadPercent, 0);
  assert.equal(state.ixtPercent, 0);
  assert.equal(state.outputFrequency, 0);
  assert.deepEqual(state.digitalInputs.slice(0, 4), [true, false, true, false]);
  assert.equal(state.externalSources.ai1Percent, 0);
  assert.equal(state.externalSources.fiFrequency, 900);
  assert.equal(state.externalSources.serial.speed13Bit, 8192);
  assert.equal(state.externalSources.serial.run, true);
  assert.equal(state.externalSources.softplc.remoteMode, true);
});

test("SYNC_DRIVE_STATE nao grava NaN no estado principal", () => {
  let state = createInitialHmiState();
  state = reduce(state, "SYNC_DRIVE_STATE", {
    outputFrequency: 12,
    mechanicalHz: 11,
    ixtPercent: 20,
    moduleTemperature: 55,
  });

  state = reduce(state, "SYNC_DRIVE_STATE", {
    outputFrequency: Number.NaN,
    mechanicalHz: Infinity,
    ixtPercent: Number.NaN,
    moduleTemperature: -999,
    electricalOutputActive: "true",
    isCoasting: "false",
  });

  assert.equal(state.outputFrequency, 12);
  assert.equal(state.mechanicalHz, 11);
  assert.equal(state.ixtPercent, 20);
  assert.equal(state.moduleTemperature, 40);
  assert.equal(state.electricalOutputActive, true);
  assert.equal(state.isCoasting, false);
});

test("commandResolver nunca retorna referencia NaN com fontes externas invalidas", () => {
  const state = createInitialHmiState();
  state.running = true;
  state.parameters.P221.value = 1;
  state.externalSources = {
    ai1Percent: Number.NaN,
    serial: { speed13Bit: Infinity },
    softplc: { remoteMode: "talvez" },
  };

  let command = resolveCommand(state);
  assert.equal(Number.isFinite(command.referenceFrequency), true);
  assert.equal(command.referenceFrequency, state.parameters.P133.value);

  state.parameters.P221.value = 9;
  command = resolveCommand(state);
  assert.equal(Number.isFinite(command.referenceFrequency), true);
  assert.equal(command.referenceFrequency, state.parameters.P133.value);
});
