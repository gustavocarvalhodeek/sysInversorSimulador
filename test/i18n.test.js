import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  AVAILABLE_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
} from "../src/i18n/languages.js";
import {
  TRANSLATIONS,
  hasTranslation,
  translate,
} from "../src/i18n/translations.js";

function readSource(relativePath) {
  return fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("idioma padrao e chave de persistencia seguem o contrato esperado", () => {
  assert.equal(DEFAULT_LANGUAGE, "pt-BR");
  assert.equal(LANGUAGE_STORAGE_KEY, "cfw100.language");
});

test("idiomas disponiveis incluem pt-BR e en-US sem codigos duplicados", () => {
  const codes = AVAILABLE_LANGUAGES.map((language) => language.code);

  assert.equal(codes.includes("pt-BR"), true);
  assert.equal(codes.includes("en-US"), true);
  assert.equal(new Set(codes).size, codes.length);
});

test("translate retorna textos em pt-BR e en-US", () => {
  assert.equal(translate("pt-BR", "header.menuButton"), "Menu");
  assert.equal(
    translate("en-US", "componentLibrary.panelTitle"),
    "Component Library",
  );
  assert.equal(
    translate("en-US", "parameterInfo.fileLoaded", { count: 12 }),
    "Configuration loaded (12 parameters).",
  );
  assert.equal(translate("pt-BR", "rampSelector.ramp1"), "1a rampa");
  assert.equal(translate("pt-BR", "rampSelector.ramp2"), "2a rampa");
  assert.equal(translate("pt-BR", "rampSelector.emergency"), "Emergencia");
  assert.equal(translate("en-US", "rampSelector.ramp1"), "1st ramp");
  assert.equal(translate("en-US", "rampSelector.ramp2"), "2nd ramp");
  assert.equal(translate("en-US", "rampSelector.emergency"), "Emergency");
  assert.equal(
    translate("pt-BR", "rampSelector.notSimulated", { label: "DIx" }),
    "Selecao de rampa \"DIx\" nao simulada: usando 1a rampa.",
  );
  assert.equal(
    translate("en-US", "rampSelector.notSimulated", { label: "DIx" }),
    "Ramp selection \"DIx\" not simulated: using 1st ramp.",
  );
  assert.equal(
    translate("pt-BR", "commandStatusNotes.pwmBlocked", { reason: "CONFIG" }),
    "PWM bloqueado por CONFIG.",
  );
  assert.equal(
    translate("en-US", "commandStatusNotes.pwmBlocked", { reason: "CONFIG" }),
    "PWM blocked by CONFIG.",
  );
  assert.equal(translate("pt-BR", "motor.controlMode.vfLinear"), "V/f linear");
  assert.equal(translate("en-US", "motor.controlMode.vfQuadratic"), "Quadratic V/f");
  assert.equal(
    translate("pt-BR", "motor.notes.currentLimited", {
      current: "2.4",
      limit: "1.0",
    }),
    "Corrente (2.4 A) acima de P135 (1.0 A): limitacao de corrente atuaria.",
  );
  assert.equal(
    translate("en-US", "motor.notes.coastDown"),
    "Electrical output disabled: motor is coasting down by inertia.",
  );
});

test("translate faz fallback para pt-BR e depois para a propria chave", () => {
  assert.equal(translate("es-ES", "header.menuButton"), "Menu");
  assert.equal(translate("en-US", "missing.translation.key"), "missing.translation.key");
});

test("chaves essenciais existem em todos os idiomas disponiveis", () => {
  const essentialKeys = [
    "app.title",
    "header.menuButton",
    "header.languageLabel",
    "menu.saveConfiguration",
    "faultSimulator.dialogTitle",
    "componentLibrary.panelTitle",
    "componentLibrary.status.available",
    "about.title",
    "motorPanel.chartTitle",
    "parameterInfo.tabs.parameter",
    "parameterInfo.searchResultsAria",
    "rampSelector.ramp1",
    "rampSelector.ramp2",
    "rampSelector.emergency",
    "rampSelector.notSimulated",
    "commandStatusNotes.pwmBlocked",
    "commandStatusNotes.referenceUnavailable",
    "motor.controlMode.vfLinear",
    "motor.controlMode.vfQuadratic",
    "motor.controlMode.vvw",
    "motor.notes.coastDown",
    "motor.notes.currentLimited",
  ];

  for (const language of AVAILABLE_LANGUAGES) {
    for (const key of essentialKeys) {
      assert.equal(hasTranslation(language.code, key), true, `${language.code}:${key}`);
    }
  }
});

test("status da biblioteca, textos do header, sobre e falhas possuem traducao", () => {
  assert.equal(TRANSLATIONS["pt-BR"].componentLibrary.status.available, "Disponivel");
  assert.equal(TRANSLATIONS["en-US"].componentLibrary.status.available, "Available");
  assert.equal(TRANSLATIONS["pt-BR"].header.languageLabel, "Idioma");
  assert.equal(TRANSLATIONS["en-US"].about.title, "About the simulator");
  assert.equal(TRANSLATIONS["pt-BR"].faultSimulator.dialogTitle, "Simulador de Falhas");
  assert.equal(TRANSLATIONS["pt-BR"].motor.controlMode.vfLinear, "V/f linear");
  assert.equal(
    TRANSLATIONS["en-US"].motor.notes.currentLimited,
    "Current ({current} A) above P135 ({limit} A): current limiting would act.",
  );
});

test("provider e seletor usam localStorage, fallback seguro e select acessivel", () => {
  const contextSource = readSource("src/i18n/I18nContext.jsx");
  const selectorSource = readSource("src/components/LanguageSelector.jsx");

  assert.match(contextSource, /window\.localStorage\.getItem\(LANGUAGE_STORAGE_KEY\)/);
  assert.match(contextSource, /window\.localStorage\.setItem\(LANGUAGE_STORAGE_KEY, language\)/);
  assert.match(contextSource, /resolveLanguageCode/);
  assert.match(contextSource, /translate\(language, key, params\)/);
  assert.match(selectorSource, /<select/);
  assert.match(selectorSource, /header\.languageSelectorAriaLabel/);
  assert.match(selectorSource, /availableLanguages\.map/);
});
