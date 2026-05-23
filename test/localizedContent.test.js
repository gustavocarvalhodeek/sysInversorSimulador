import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  getHmiControlAriaLabel,
  getLocalizedParameterField,
  getLocalizedPresetContent,
  getLocalizedScenarioModeLabel,
  localizeParameter,
} from "../src/i18n/localizedContent.js";
import { translate } from "../src/i18n/translations.js";
import { getScenarioPresetId } from "../src/configurations/scenarioPresetRuntime.js";

function readSource(relativePath) {
  return fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

const tPt = (key, params) => translate("pt-BR", key, params);
const tEn = (key, params) => translate("en-US", key, params);

test("aria-label da HMI respeita o idioma atual", () => {
  assert.equal(getHmiControlAriaLabel("run", tPt), "Ligar o inversor");
  assert.equal(getHmiControlAriaLabel("run", tEn), "Start the drive");
  assert.equal(getHmiControlAriaLabel("menu", tEn), "Open programming menu");
});

test("presets respeitam o idioma com fallback seguro", () => {
  const preset = {
    scenario: {
      name: "Modo demonstração automática",
      application: "Simula uma sequência automática.",
    },
  };

  const localizedPreset = getLocalizedPresetContent(
    { ...preset, id: "modo-demonstracao-automatica" },
    "en-US",
  );
  const fallbackPreset = getLocalizedPresetContent(
    { ...preset, id: "preset-inexistente" },
    "en-US",
  );

  assert.equal(localizedPreset.name, "Automatic demo mode");
  assert.match(localizedPreset.application, /automatic sequence/i);
  assert.equal(fallbackPreset.name, "Modo demonstração automática");
  assert.equal(fallbackPreset.application, "Simula uma sequência automática.");
});

test("texto tecnico traduzido usa o idioma selecionado quando disponivel", () => {
  const parameter = {
    code: "P001",
    category: "acesso_leitura",
    categoryLabel: "Leitura e monitoração",
    name: "Referência Velocidade",
    shortDescription: "Mostra a referência de velocidade solicitada ao inversor.",
    description: "Mostra a referência de velocidade solicitada ao inversor.",
    longDescription: "Texto longo em português.",
    example: "Exemplo em português.",
    simulatorBehavior: "Comportamento em português.",
    editCondition: "Somente leitura.",
    readOnly: true,
    requiresStoppedMotor: false,
  };

  const localized = localizeParameter(parameter, "en-US");

  assert.equal(localized.name, "Speed reference");
  assert.equal(localized.categoryLabel, "Read and monitoring");
  assert.equal(
    localized.shortDescription,
    "Shows the speed reference requested from the drive.",
  );
  assert.equal(localized.editCondition, "Read only.");
});

test("fallback tecnico usa PT-BR quando nao houver traducao especifica", () => {
  const parameter = {
    code: "P400",
    category: "dados_motor",
    categoryLabel: "Dados do motor",
    name: "Tensão do Motor",
    shortDescription: "Texto técnico em português.",
    description: "Texto técnico em português.",
    longDescription: "Detalhe em português.",
    example: "Exemplo em português.",
    simulatorBehavior: "Simulação em português.",
    editCondition: "Alterável somente com motor parado.",
    readOnly: false,
    requiresStoppedMotor: true,
  };

  assert.equal(getLocalizedParameterField(parameter, "name", "en-US"), "Tensão do Motor");
  assert.equal(getLocalizedParameterField(parameter, "categoryLabel", "en-US"), "Motor data");
  assert.equal(
    getLocalizedParameterField(parameter, "shortDescription", "en-US"),
    "Texto técnico em português.",
  );
});

test("idioma invalido nao quebra e cai para fallback seguro", () => {
  const preset = getLocalizedPresetContent(
    {
      id: "modo-aluno-iniciante",
      activeScenarioName: "Modo aluno iniciante",
      activeScenarioApplication: "Limita a simulação.",
    },
    "es-ES",
  );
  const parameter = {
    code: "P001",
    category: "acesso_leitura",
    categoryLabel: "Leitura e monitoração",
    name: "Referência Velocidade",
    shortDescription: "Mostra a referência.",
    description: "Mostra a referência.",
    longDescription: "",
    example: "",
    simulatorBehavior: "",
    editCondition: "Somente leitura.",
    readOnly: true,
    requiresStoppedMotor: false,
  };

  assert.equal(preset.name, "Modo aluno iniciante");
  assert.equal(getLocalizedParameterField(parameter, "name", "es-ES"), "Referência Velocidade");
  assert.equal(getLocalizedScenarioModeLabel("student", tEn), "Student");
  assert.equal(getLocalizedScenarioModeLabel("desconhecido", tEn), "desconhecido");
});

test("componentes usam helpers de localizacao para presets e conteudo tecnico", () => {
  const headerSource = readSource("src/components/HeaderMenu.jsx");
  const panelSource = readSource("src/components/ParameterInfoPanel.jsx");
  const searchSource = readSource("src/components/parameter-info/ParameterSearch.jsx");
  const quickListSource = readSource("src/components/parameter-info/ParameterQuickList.jsx");
  const relatedSource = readSource("src/components/parameter-info/ParameterRelatedList.jsx");

  assert.match(headerSource, /getLocalizedPresetContent/);
  assert.match(headerSource, /getLocalizedScenarioModeLabel/);
  assert.match(panelSource, /localizeParameter/);
  assert.match(searchSource, /localizeParameter/);
  assert.match(quickListSource, /localizeParameter/);
  assert.match(relatedSource, /localizeParameter/);
  assert.equal(
    getScenarioPresetId({ scenario: { name: "Modo demonstração automática" } }),
    "modo-demonstracao-automatica",
  );
});
