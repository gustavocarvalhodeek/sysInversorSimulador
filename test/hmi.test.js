import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createInitialHmiState,
  getDisplayModel,
  hmiReducer,
} from "../src/hmi/cfw100Hmi.js";
import { canEditParameter } from "../src/hmi/parameters/parameterHelpers.js";
import {
  createDidacticPasswordDigest,
  setStorage,
} from "../src/utils/persistence.js";

const press = (state, type, extra = {}) =>
  hmiReducer(state, { type, ...extra });

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

test("defaults de fabrica e display inicial", () => {
  const s = createInitialHmiState();
  assert.equal(getDisplayModel(s).value, "rdY");
  assert.equal(s.parameters.P134.value, 66);
  assert.equal(s.parameters.P133.value, 3);
  assert.equal(s.parameters.P121.value, 3);
});

test("navegacao e edicao de P100 com persistencia desligada", () => {
  setStorage(null);
  let s = createInitialHmiState();
  s = press(s, "SELECT_PARAMETER", { code: "P100" });
  s = press(s, "PRESS_P"); // entra em edicao
  s = press(s, "PRESS_UP"); // 5.0 -> 5.1
  s = press(s, "PRESS_P"); // salva
  assert.equal(s.parameters.P100.value, 5.1);
});

test("parametro somente leitura nao edita", () => {
  const s = createInitialHmiState();
  const verdict = canEditParameter(s.parameters.P005, s);
  assert.equal(verdict.editable, false);
});

test("parametro cfg bloqueado com motor em funcionamento", () => {
  let s = createInitialHmiState();
  s = press(s, "PRESS_RUN");
  assert.equal(canEditParameter(s.parameters.P202, s).editable, false);
});

test("P000 fica oculto enquanto a senha estiver inativa", () => {
  const s = createInitialHmiState();
  assert.equal(s.parameterOrder.includes("P000"), false);
});

test("senha usa P200 como programacao e P000 mostra apenas 0 ou 1", () => {
  setStorage(null);
  let s = createInitialHmiState();
  s = press(s, "SELECT_PARAMETER", { code: "P200" });
  s = press(s, "PRESS_P");
  s = press(s, "PRESS_UP"); // 0 -> 1 (indicacao, nao ativa)
  s = press(s, "PRESS_UP"); // 1 -> 2 (nova senha)
  s = press(s, "PRESS_P");
  assert.equal(s.parameters.P200.value, 1);
  assert.equal(s.passwordDigest, createDidacticPasswordDigest(2));
  assert.equal(s.passwordAccessGranted, true);
  assert.equal(s.parameterOrder.includes("P000"), true);
  assert.equal(s.parameters.P000.value, 1);

  s = {
    ...s,
    passwordAccessGranted: false,
    parameters: {
      ...s.parameters,
      P000: { ...s.parameters.P000, value: 0 },
    },
  };
  assert.equal(canEditParameter(s.parameters.P100, s).editable, false);

  s = press(s, "SELECT_PARAMETER", { code: "P000" });
  s = press(s, "PRESS_P");
  s = press(s, "PRESS_UP"); // senha errada = 1
  s = press(s, "PRESS_P");
  assert.equal(s.parameters.P000.value, 0);
  assert.equal(canEditParameter(s.parameters.P100, s).editable, false);

  s = press(s, "SELECT_PARAMETER", { code: "P000" });
  s = press(s, "PRESS_P");
  s = press(s, "PRESS_UP");
  s = press(s, "PRESS_UP"); // senha correta = 2
  s = press(s, "PRESS_P");
  assert.equal(s.parameters.P000.value, 1);
  assert.equal(canEditParameter(s.parameters.P100, s).editable, true);
});

test("P200=0 desativa a senha e oculta P000", () => {
  setStorage(null);
  let s = createInitialHmiState();
  s = press(s, "SELECT_PARAMETER", { code: "P200" });
  s = press(s, "PRESS_P");
  s = press(s, "PRESS_UP");
  s = press(s, "PRESS_UP");
  s = press(s, "PRESS_P");

  s = press(s, "SELECT_PARAMETER", { code: "P200" });
  s = press(s, "PRESS_P");
  s = press(s, "PRESS_DOWN"); // 1 -> 0
  s = press(s, "PRESS_P");

  assert.equal(s.parameters.P200.value, 0);
  assert.equal(s.parameterOrder.includes("P000"), false);
  assert.equal(canEditParameter(s.parameters.P100, s).editable, true);
});

test("config invalida (P133 > P134) mostra conF", () => {
  const s = createInitialHmiState();
  s.parameters.P133.value = 80;
  assert.equal(getDisplayModel(s).value, "conF");
});

test("estado CONFIG bloqueia partida e atualiza P006/P047", () => {
  let s = createInitialHmiState();
  s.parameters.P264.value = 4;
  s.parameters.P265.value = 4;
  s = press(s, "PRESS_RUN");

  assert.equal(s.running, false);
  assert.equal(s.parameters.P006.value, 5);
  assert.equal(s.parameters.P047.value, 1);
  assert.equal(getDisplayModel(s).value, "conF");
});

test("subtensao bloqueia partida e aparece em P006", () => {
  let s = createInitialHmiState();
  s = press(s, "SET_UNDERVOLTAGE", { value: true });
  s = press(s, "PRESS_RUN");

  assert.equal(s.running, false);
  assert.equal(s.parameters.P006.value, 2);
  assert.equal(getDisplayModel(s).value, "Sub");
});

test("falha para o inversor, atualiza P049 e pode ser resetada", () => {
  let s = createInitialHmiState();
  s = press(s, "PRESS_RUN");
  s = press(s, "RAISE_FAULT", { code: 70 });

  assert.equal(s.running, false);
  assert.equal(s.parameters.P006.value, 3);
  assert.equal(s.parameters.P049.value, 70);
  assert.equal(getDisplayModel(s).value, "F070");

  s = press(s, "PRESS_RUN");
  assert.equal(s.running, false);

  s = press(s, "PRESS_STOP");
  assert.equal(s.parameters.P006.value, 0);
  assert.equal(s.parameters.P049.value, 0);
});

test("alarme atualiza P048 sem derrubar o estado RUN", () => {
  let s = createInitialHmiState();
  s = press(s, "PRESS_RUN");
  s = press(s, "RAISE_ALARM", { code: 46 });

  assert.equal(s.running, true);
  assert.equal(s.parameters.P006.value, 1);
  assert.equal(s.parameters.P048.value, 46);
  assert.equal(getDisplayModel(s).value, "A046");

  s = press(s, "CLEAR_ALARM");
  assert.equal(s.parameters.P048.value, 0);
});

test("fontes externas atualizam parametros de leitura e P006", () => {
  let s = createInitialHmiState();
  s = press(s, "SET_AI1_PERCENT", { value: 25 });
  s = press(s, "SET_FI_FREQUENCY", { value: 250 });
  s = press(s, "SET_DIGITAL_INPUT", { index: 0, value: true });
  s = press(s, "SET_EXTERNAL_SOURCE", {
    source: "serial",
    value: { speed13Bit: 4096, run: true },
  });
  s.parameters.P224.value = 2;
  s.parameters.P221.value = 9;
  s = press(s, "SET_LOAD", { value: s.loadPercent });

  assert.equal(s.parameters.P018.value, 25);
  assert.equal(s.parameters.P022.value, 250);
  assert.equal(s.parameters.P012.value, 1);
  assert.equal(s.parameters.P683.value, 4096);
  assert.equal(s.parameters.P006.value, 1);
});

test("P120 define a referencia inicial ao habilitar", () => {
  let s = createInitialHmiState();
  s.referenceFrequency = 40;
  s.parameters.P121.value = 25;
  s.parameters.P120.value = 0;
  s = press(s, "PRESS_RUN");
  assert.equal(s.referenceFrequency, s.parameters.P133.value);

  s = press(s, "PRESS_STOP");
  s.referenceFrequency = 42;
  s.parameters.P120.value = 1;
  s = press(s, "PRESS_RUN");
  assert.equal(s.referenceFrequency, 42);

  s = press(s, "PRESS_STOP");
  s.referenceFrequency = 45;
  s.parameters.P121.value = 28;
  s.parameters.P120.value = 2;
  s = press(s, "PRESS_RUN");
  assert.equal(s.referenceFrequency, 28);
});

test("P204 salva e restaura conjunto do usuario", () => {
  setStorage(memoryStorage());
  let s = createInitialHmiState();
  s.parameters.P100.value = 7.5;
  s = press(s, "SELECT_PARAMETER", { code: "P204" });
  s = press(s, "PRESS_P");
  for (let i = 0; i < 9; i += 1) s = press(s, "PRESS_UP");
  s = press(s, "PRESS_P");

  s.parameters.P100.value = 2.5;
  s = press(s, "SELECT_PARAMETER", { code: "P204" });
  s = press(s, "PRESS_P");
  for (let i = 0; i < 7; i += 1) s = press(s, "PRESS_UP");
  s = press(s, "PRESS_P");

  assert.equal(s.parameters.P100.value, 7.5);
  assert.equal(s.parameters.P204.value, 0);
  setStorage(null);
});

test("P680 reflete estado logico e ultima falha fica registrada", () => {
  let s = createInitialHmiState();
  s = press(s, "PRESS_RUN");
  assert.ok(s.parameters.P680.value & (1 << 1));
  assert.ok(s.parameters.P680.value & (1 << 9));

  s = press(s, "RAISE_ALARM", { code: 46 });
  assert.ok(s.parameters.P680.value & (1 << 7));

  s = press(s, "RAISE_FAULT", { code: 70 });
  assert.equal(s.parameters.P050.value, 70);
  assert.ok(s.parameters.P680.value & (1 << 15));
});

test("arquivo importado aplica configuração operacional e preserva segurança", () => {
  let s = createInitialHmiState();
  s.parameters.P200.value = 1;
  s.passwordDigest = createDidacticPasswordDigest(7);
  s.passwordAccessGranted = false;

  s = press(s, "IMPORT_CONFIGURATION", {
    snapshot: {
      P100: 7.5,
      P121: 42,
      P200: 0,
    },
  });

  assert.equal(s.parameters.P100.value, 7.5);
  assert.equal(s.parameters.P121.value, 42);
  assert.equal(s.referenceFrequency, 42);
  assert.equal(s.parameters.P200.value, 1);
  assert.equal(s.passwordDigest, createDidacticPasswordDigest(7));
  assert.equal(s.passwordAccessGranted, false);
});

test("display mostra estado, sentido, barra e falha piscando", () => {
  let s = createInitialHmiState();
  let display = getDisplayModel(s);
  assert.equal(display.status, "RDY");
  assert.equal(display.direction, "FWD");
  assert.equal(display.barPercent, 0);

  s = press(s, "PRESS_RUN");
  display = getDisplayModel(s);
  assert.equal(display.status, "RUN");

  s = press(s, "RAISE_FAULT", { code: 70 });
  display = getDisplayModel(s);
  assert.equal(display.value, "F070");
  assert.equal(display.blinkValue, true);
});

test("display mantem frequencia durante desaceleracao em sentido reverso", () => {
  const s = {
    ...createInitialHmiState(),
    running: false,
    outputFrequency: -12.3,
  };
  s.parameters.P223.value = 1;

  const display = getDisplayModel(s);
  assert.equal(display.value, "-12.3");
  assert.equal(display.unit, "Hz");
  assert.equal(display.direction, "REV");
});

test("alarme mostra Axxx e apos navegacao pisca a unidade A", () => {
  let s = createInitialHmiState();
  s = press(s, "RAISE_ALARM", { code: 46 });
  let display = getDisplayModel(s);
  assert.equal(display.value, "A046");
  assert.equal(display.unit, "");
  assert.equal(display.blinkUnit, false);

  s = press(s, "PRESS_P");
  display = getDisplayModel(s);
  assert.equal(display.value, "P001");
  assert.equal(display.unit, "A");
  assert.equal(display.blinkUnit, true);
});
