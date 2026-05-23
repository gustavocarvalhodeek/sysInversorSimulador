import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialHmiState, hmiReducer } from "../src/hmi/cfw100Hmi.js";
import {
  MAX_CONFIGURATION_FILE_SIZE_BYTES,
  readConfigurationSnapshotFromFile,
} from "../src/utils/configurationFileActions.js";
import {
  createConfigurationFilePayload,
  setStorage,
} from "../src/utils/persistence.js";

setStorage(null);

function createFakeFile({
  name = "config.json",
  type = "application/json",
  size,
  contents = "{}",
  text,
} = {}) {
  const contentSize = Buffer.byteLength(String(contents), "utf8");
  let textCalls = 0;

  return {
    file: {
      name,
      type,
      size: size ?? contentSize,
      text: async () => {
        textCalls += 1;
        if (typeof text === "function") {
          return text();
        }
        return contents;
      },
    },
    getTextCalls: () => textCalls,
  };
}

async function assertRejectsWithCode(promiseFactory, code) {
  await assert.rejects(promiseFactory, (error) => {
    assert.equal(error?.code, code);
    return true;
  });
}

test("rejeita arquivo muito grande antes de chamar file.text", async () => {
  const { file, getTextCalls } = createFakeFile({
    size: MAX_CONFIGURATION_FILE_SIZE_BYTES + 1,
    text: () => {
      throw new Error("nao deveria ler arquivo grande");
    },
  });

  await assertRejectsWithCode(
    () => readConfigurationSnapshotFromFile(file),
    "fileTooLarge",
  );
  assert.equal(getTextCalls(), 0);
});

test("rejeita arquivo vazio", async () => {
  const { file, getTextCalls } = createFakeFile({
    size: 0,
    contents: "",
  });

  await assertRejectsWithCode(
    () => readConfigurationSnapshotFromFile(file),
    "emptyFile",
  );
  assert.equal(getTextCalls(), 0);
});

test("rejeita extensao invalida", async () => {
  const { file, getTextCalls } = createFakeFile({
    name: "config.txt",
    type: "text/plain",
    contents: '{"format":"cfw100-parameter-configuration"}',
  });

  await assertRejectsWithCode(
    () => readConfigurationSnapshotFromFile(file),
    "invalidType",
  );
  assert.equal(getTextCalls(), 0);
});

test("rejeita JSON invalido", async () => {
  const { file, getTextCalls } = createFakeFile({
    contents: '{"format":',
  });

  await assertRejectsWithCode(
    () => readConfigurationSnapshotFromFile(file),
    "invalidJson",
  );
  assert.equal(getTextCalls(), 1);
});

test("rejeita estrutura incompativel", async () => {
  const { file } = createFakeFile({
    contents: JSON.stringify({ teste: true }),
  });

  await assertRejectsWithCode(
    () => readConfigurationSnapshotFromFile(file),
    "invalidConfiguration",
  );
});

test("rejeita versao nao suportada", async () => {
  const { parameters } = createInitialHmiState();
  const payload = createConfigurationFilePayload(parameters);
  const { file } = createFakeFile({
    contents: JSON.stringify({ ...payload, version: payload.version + 1 }),
  });

  await assertRejectsWithCode(
    () => readConfigurationSnapshotFromFile(file),
    "unsupportedVersion",
  );
});

test("aceita arquivo valido exportado pelo sistema", async () => {
  const { parameters } = createInitialHmiState();
  parameters.P100.value = 7.5;
  parameters.P121.value = 45;
  const payload = createConfigurationFilePayload(parameters);
  const { file } = createFakeFile({
    name: "cfw100-configuracao.json",
    contents: JSON.stringify(payload),
  });

  const snapshot = await readConfigurationSnapshotFromFile(file);

  assert.equal(snapshot.P100, 7.5);
  assert.equal(snapshot.P121, 45);
  assert.equal("P200" in snapshot, false);
});

test("mantem compatibilidade com a importacao existente", async () => {
  let state = createInitialHmiState();
  state.parameters.P100.value = 9;
  state.parameters.P121.value = 33;
  const payload = createConfigurationFilePayload(state.parameters);
  const { file } = createFakeFile({
    contents: JSON.stringify(payload),
  });

  const snapshot = await readConfigurationSnapshotFromFile(file);
  const importedState = hmiReducer(createInitialHmiState(), {
    type: "IMPORT_CONFIGURATION",
    snapshot,
  });

  assert.equal(importedState.parameters.P100.value, 9);
  assert.equal(importedState.parameters.P121.value, 33);
  assert.equal(importedState.referenceFrequency, 33);
});
