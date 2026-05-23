import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getStatusMessageListKey,
  translateStatusMessage,
} from "../src/components/commandStatusMessages.js";
import { translate } from "../src/i18n/translations.js";

function getTranslator(language) {
  return (key, params) => translate(language, key, params);
}

test("status estruturado de PWM renderiza em pt-BR", () => {
  const note = {
    key: "commandStatusNotes.pwmBlocked",
    fallback: "PWM bloqueado por CONFIG.",
    params: { reason: "CONFIG" },
  };

  assert.equal(
    translateStatusMessage(note, getTranslator("pt-BR")),
    "PWM bloqueado por CONFIG.",
  );
});

test("status estruturado de PWM renderiza em en-US", () => {
  const note = {
    key: "commandStatusNotes.pwmBlocked",
    fallback: "PWM bloqueado por CONFIG.",
    params: { reason: "CONFIG" },
  };

  assert.equal(
    translateStatusMessage(note, getTranslator("en-US")),
    "PWM blocked by CONFIG.",
  );
});

test("status estruturado usa fallback PT-BR quando a chave nao existe", () => {
  const note = {
    key: "commandStatusNotes.missingNote",
    fallback: "PWM bloqueado por CONFIG.",
    params: { reason: "CONFIG" },
  };

  assert.equal(
    translateStatusMessage(note, getTranslator("en-US")),
    "PWM bloqueado por CONFIG.",
  );
});

test("status com parametro localizavel traduz o label antes da interpolacao", () => {
  const note = {
    key: "commandStatusNotes.referenceUnavailable",
    fallback: "Referencia \"Teclas HMI\" indisponivel: usando 0 Hz.",
    params: {
      label: {
        key: "commandSource.hmiKeys",
        fallback: "Teclas HMI",
      },
    },
  };

  assert.equal(
    translateStatusMessage(note, getTranslator("pt-BR")),
    "Referencia \"Teclas HMI\" indisponivel: usando 0 Hz.",
  );
  assert.equal(
    translateStatusMessage(note, getTranslator("en-US")),
    "Reference \"HMI keys\" unavailable: using 0 Hz.",
  );
});

test("mensagem com labelKey legado continua traduzindo modo de controle do motor", () => {
  const controlMode = {
    labelKey: "motor.controlMode.vfQuadratic",
    label: "V/f quadratico",
  };

  assert.equal(
    translateStatusMessage(controlMode, getTranslator("pt-BR")),
    "V/f quadratico",
  );
  assert.equal(
    translateStatusMessage(controlMode, getTranslator("en-US")),
    "Quadratic V/f",
  );
});

test("nota estruturada de rampa renderiza em pt-BR", () => {
  const note = {
    key: "rampSelector.notSimulated",
    fallback: "Selecao de rampa \"Serial/USB\" nao simulada: usando 1a rampa.",
    params: {
      label: {
        key: "commandSource.serialUsb",
        fallback: "Serial/USB",
      },
    },
  };

  assert.equal(
    translateStatusMessage(note, getTranslator("pt-BR")),
    "Selecao de rampa \"Serial/USB\" nao simulada: usando 1a rampa.",
  );
});

test("nota estruturada de rampa renderiza em en-US", () => {
  const note = {
    key: "rampSelector.notSimulated",
    fallback: "Selecao de rampa \"Serial/USB\" nao simulada: usando 1a rampa.",
    params: {
      label: {
        key: "commandSource.serialUsb",
        fallback: "Serial/USB",
      },
    },
  };

  assert.equal(
    translateStatusMessage(note, getTranslator("en-US")),
    "Ramp selection \"Serial/USB\" not simulated: using 1st ramp.",
  );
});

test("nota estruturada de rampa usa fallback PT-BR quando a chave nao existe", () => {
  const note = {
    key: "rampSelector.missingNote",
    fallback: "Selecao de rampa \"Serial/USB\" nao simulada: usando 1a rampa.",
    params: {
      label: {
        key: "commandSource.serialUsb",
        fallback: "Serial/USB",
      },
    },
  };

  assert.equal(
    translateStatusMessage(note, getTranslator("en-US")),
    "Selecao de rampa \"Serial/USB\" nao simulada: usando 1a rampa.",
  );
});

test("nota estruturada do motor renderiza em pt-BR e en-US", () => {
  const note = {
    key: "motor.notes.currentLimited",
    fallback:
      "Corrente (2.4 A) acima de P135 (1.0 A): limitacao de corrente atuaria.",
    params: {
      current: "2.4",
      limit: "1.0",
    },
  };

  assert.equal(
    translateStatusMessage(note, getTranslator("pt-BR")),
    "Corrente (2.4 A) acima de P135 (1.0 A): limitacao de corrente atuaria.",
  );
  assert.equal(
    translateStatusMessage(note, getTranslator("en-US")),
    "Current (2.4 A) above P135 (1.0 A): current limiting would act.",
  );
});

test("nota estruturada do motor usa fallback PT-BR quando a chave nao existe", () => {
  const note = {
    key: "motor.notes.missingNote",
    fallback:
      "Saida eletrica desativada: motor em coast-down por inercia.",
  };

  assert.equal(
    translateStatusMessage(note, getTranslator("en-US")),
    "Saida eletrica desativada: motor em coast-down por inercia.",
  );
});

test("string legada continua renderizando sem quebrar", () => {
  assert.equal(
    translateStatusMessage("1a rampa", getTranslator("en-US")),
    "1a rampa",
  );
});

test("status invalido nao renderiza undefined nem [object Object]", () => {
  assert.equal(translateStatusMessage(null, getTranslator("pt-BR")), "");
  assert.equal(translateStatusMessage(undefined, getTranslator("pt-BR")), "");
  assert.equal(getStatusMessageListKey({ fallback: "Teste" }, 0), "status:0:fallback:Teste:");
});
