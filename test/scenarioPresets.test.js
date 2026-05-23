import { test } from "node:test";
import assert from "node:assert/strict";
import { CFW100_SCENARIO_PRESETS } from "../src/configurations/cfw100ScenarioPresets.js";
import { createInitialHmiState, hmiReducer } from "../src/hmi/cfw100Hmi.js";
import {
  canEditParameter,
  getVisibleParameterCodes,
} from "../src/hmi/parameters/parameterHelpers.js";
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

test("preset com autoStart aplica parametros, simulacao e metadados do cenario", () => {
  const preset = findPreset(
    (candidate) => candidate.simulation?.autoStart === true,
    "autoStart",
  );

  const state = applyPreset(preset);

  assert.equal(state.activeScenarioName, preset.scenario.name);
  assert.equal(state.parameters.P121.value, 45);
  assert.equal(state.referenceFrequency, 45);
  assert.equal(state.running, true);
  assert.equal(state.outputFrequency, 0);
  assert.equal(state.automationCycle, "acceleration");
  assert.equal(typeof state.automationStartTime, "number");
  assert.ok(
    state.scenarioWarnings.some((warning) =>
      warning.includes("holdTimeAtReferenceSeconds"),
    ),
    "metadado de simulacao nao suportado deveria virar aviso documental",
  );
});

test("preset modo aluno aplica UI suportada e limita a lista visivel", () => {
  const preset = findPreset(
    (candidate) => candidate.ui?.mode === "student",
    "modo aluno",
  );

  const state = applyPreset(preset);
  const visibleCodes = getVisibleParameterCodes(state);

  assert.equal(state.scenarioUi?.mode, "student");
  assert.deepEqual(visibleCodes, preset.ui.visibleParameters);
  assert.equal(visibleCodes.includes("P202"), false);
});

test("preset somente leitura bloqueia edicao e trata P200=1 sem senha como aviso", () => {
  const preset = findPreset(
    (candidate) => candidate.ui?.mode === "readOnly",
    "somente leitura",
  );

  const state = applyPreset(preset);
  const verdict = canEditParameter(state.parameters.P100, state);

  assert.equal(state.scenarioUi?.allowEditing, false);
  assert.equal(verdict.editable, false);
  assert.ok(verdict.reason.toLowerCase().includes("somente leitura"));
  assert.equal(state.parameters.P200.value, 0);
  assert.ok(
    state.scenarioWarnings.some((warning) => warning.includes("P200=1")),
    "preset deveria explicar por que nao ativou senha real sem senha programada",
  );
});

test("preset de motor rodando usa simulatedReadings suportados como semente e marca o resto como documental", () => {
  const preset = findPreset(
    (candidate) =>
      candidate.simulatedReadings?.P005 === 30 &&
      candidate.simulatedReadings?.P006 === "run",
    "motor rodando em 30 Hz",
  );

  const state = applyPreset(preset);

  assert.equal(state.running, true);
  assert.equal(state.outputFrequency, 30);
  assert.equal(state.mechanicalHz, 30);
  assert.equal(state.loadPercent, 40);
  assert.equal(state.ixtPercent, 10);
  assert.equal(state.moduleTemperature, 40);
  assert.ok(
    state.scenarioWarnings.some(
      (warning) => warning.includes("P003") && warning.includes("document"),
    ),
    "leituras nao conectadas ao estado real deveriam virar aviso documental",
  );
});

test("preset invalido e desconhecido e sanitizado sem quebrar o estado", () => {
  const state = applyPreset({
    scenario: {
      name: "Preset de teste",
      application: "Validacao de sanitizacao",
    },
    parameters: {
      P121: 9999,
      P100: "invalido",
      PX99: 123,
    },
    simulation: {
      loadPercent: 999,
      outputFrequency: 9999,
      externalSources: {
        ai1Percent: 999,
        serial: { speed13Bit: 99999, run: true, rotationSign: -1 },
      },
      unknownSimulationField: true,
    },
    ui: {
      mode: "custom",
      visibleParameters: ["P121", "P999"],
    },
    simulatedReadings: {
      P005: 9999,
      P006: "run",
      P003: 9.9,
    },
  });

  assert.equal(state.activeScenarioName, "Preset de teste");
  assert.equal(state.parameters.P121.value, state.parameters.P134.value);
  assert.equal(state.loadPercent, 150);
  assert.equal(state.outputFrequency, state.parameters.P134.value);
  assert.deepEqual(getVisibleParameterCodes(state), ["P121"]);
  assert.ok(state.scenarioWarnings.length >= 3);
});

test("importar configuracao limpa os metadados do preset ativo", () => {
  const preset = findPreset(
    (candidate) => candidate.ui?.mode === "student",
    "modo aluno",
  );

  let state = applyPreset(preset);
  state = hmiReducer(state, {
    type: "IMPORT_CONFIGURATION",
    snapshot: { P121: 12, P100: 7 },
  });

  assert.equal(state.activeScenarioName, null);
  assert.equal(state.scenarioUi, null);
  assert.deepEqual(state.scenarioWarnings, []);
  assert.equal(state.parameters.P121.value, 12);
});
