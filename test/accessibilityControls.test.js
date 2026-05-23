import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  buildHmiDisplayAccessibleSummary,
  buildHmiDisplayLiveSummary,
  getMotorLoadValueText,
} from "../src/components/hmiAccessibility.js";
import { translate } from "../src/i18n/translations.js";

function readSource(relativePath) {
  return fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

const t = (key, params) => translate("pt-BR", key, params);

test("slider possui nome acessivel e associacao semantica com o range", () => {
  const source = readSource("src/components/MotorStatusBar.jsx");

  assert.match(source, /const MOTOR_LOAD_SLIDER_ID = "motor-load-slider"/);
  assert.match(source, /const MOTOR_LOAD_SLIDER_DESCRIPTION_ID = "motor-load-slider-description"/);
  assert.match(source, /<label\s+htmlFor=\{MOTOR_LOAD_SLIDER_ID\}/);
  assert.match(source, /id=\{MOTOR_LOAD_SLIDER_ID\}/);
  assert.match(source, /aria-describedby=\{MOTOR_LOAD_SLIDER_DESCRIPTION_ID\}/);
  assert.match(source, /parameterInfo\.loadDescription/);
});

test("slider informa o valor atual com texto acessivel", () => {
  const source = readSource("src/components/MotorStatusBar.jsx");

  assert.equal(getMotorLoadValueText(37.6, t), "38% de carga do motor");
  assert.match(source, /aria-valuetext=\{getMotorLoadValueText\(loadPercent, t\)\}/);
});

test("display possui equivalente textual acessivel e live region controlada", () => {
  const source = readSource("src/components/InverterBody.jsx");

  assert.match(source, /buildHmiDisplayAccessibleSummary/);
  assert.match(source, /buildHmiDisplayLiveSummary/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /aria-atomic="true"/);
  assert.match(source, /aria-hidden="true"/);
  assert.match(source, /hmiA11y\.panelLabel/);
});

test("helper do display informa estado relevante, valor e falha", () => {
  const runningSummary = buildHmiDisplayAccessibleSummary(
    {
      value: "42.5",
      unit: "Hz",
      status: "RUN",
      direction: "FWD",
    },
    {
      faultCode: null,
      alarmCode: null,
    },
    t,
  );

  const faultSummary = buildHmiDisplayAccessibleSummary(
    {
      value: "F072",
      unit: "",
      status: "FLT",
      direction: "REV",
    },
    {
      faultCode: 72,
      alarmCode: null,
    },
    t,
  );

  const liveSummary = buildHmiDisplayLiveSummary(
    {
      value: "F072",
      unit: "",
      status: "FLT",
      direction: "REV",
    },
    {
      faultCode: 72,
      alarmCode: null,
    },
    t,
  );

  assert.equal(
    runningSummary,
    "Display do inversor: Frequencia atual 42.5 hertz. Estado RUN. Sentido horario. Sem falha ativa.",
  );
  assert.equal(
    faultSummary,
    "Display do inversor: Valor F072. Estado de falha. Sentido anti-horario. Falha ativa F072.",
  );
  assert.equal(
    liveSummary,
    "Estado de falha. Sentido anti-horario. Falha ativa F072.",
  );
});
