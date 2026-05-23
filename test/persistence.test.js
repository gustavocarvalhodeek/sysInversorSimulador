import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyPersistedValues,
  clearPersistedValues,
  createConfigurationFilePayload,
  createDidacticPasswordDigest,
  loadPersistedSecurity,
  loadPersistedValues,
  parseConfigurationFilePayload,
  persistSecurity,
  persistValues,
  setStorage,
} from "../src/utils/persistence.js";
import { createInitialHmiState, hmiReducer } from "../src/hmi/cfw100Hmi.js";

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

test("persist + load faz round-trip apenas de parametros editaveis", () => {
  setStorage(memoryStorage());
  const { parameters } = createInitialHmiState();
  parameters.P100.value = 7.3;

  persistValues(parameters);
  const loaded = loadPersistedValues();

  assert.equal(loaded.P100, 7.3);
  // Grandeza somente leitura nao e persistida.
  assert.equal("P005" in loaded, false);

  clearPersistedValues();
  assert.deepEqual(loadPersistedValues(), {});
  setStorage(null);
});

test("applyPersistedValues sobrescreve apenas editaveis e ignora invalidos", () => {
  setStorage(memoryStorage());
  const { parameters } = createInitialHmiState();
  parameters.P100.value = 12.5;
  parameters.P121.value = 40;
  persistValues(parameters);

  const fresh = createInitialHmiState().parameters;
  // valores de fabrica antes de aplicar
  fresh.P100.value = 5;
  fresh.P121.value = 3;
  applyPersistedValues(fresh);

  assert.equal(fresh.P100.value, 12.5);
  assert.equal(fresh.P121.value, 40);
  setStorage(null);
});

test("estado inicial carrega P121 persistido e ajusta referencia", () => {
  setStorage(memoryStorage());
  const base = createInitialHmiState();
  base.parameters.P121.value = 45;
  persistValues(base.parameters);

  const restored = createInitialHmiState();
  assert.equal(restored.parameters.P121.value, 45);
  assert.equal(restored.referenceFrequency, 45);
  setStorage(null);
});

test("senha real persiste separada e o acesso volta bloqueado ao reiniciar", () => {
  const storage = memoryStorage();
  setStorage(storage);
  let state = createInitialHmiState();
  state = hmiReducer(state, { type: "SELECT_PARAMETER", code: "P200" });
  state = hmiReducer(state, { type: "PRESS_P" });
  for (let i = 0; i < 7; i += 1) {
    state = hmiReducer(state, { type: "PRESS_UP" });
  }
  state = hmiReducer(state, { type: "PRESS_P" });

  const persistedSecurity = JSON.parse(storage.getItem("cfw100.security.v2"));
  assert.equal("passwordValue" in persistedSecurity, false);
  assert.equal(
    persistedSecurity.simulatedPasswordDigest,
    createDidacticPasswordDigest(7),
  );

  const restored = createInitialHmiState();
  assert.equal(restored.parameters.P200.value, 1);
  assert.equal(restored.passwordDigest, createDidacticPasswordDigest(7));
  assert.equal(restored.passwordAccessGranted, false);
  assert.equal(restored.parameters.P000.value, 0);
  assert.equal(restored.parameterOrder.includes("P000"), true);
  setStorage(null);
});

test("persistSecurity nao grava passwordValue em texto puro", () => {
  const storage = memoryStorage();
  setStorage(storage);

  persistSecurity({ passwordDigest: createDidacticPasswordDigest(4321) });

  const payload = JSON.parse(storage.getItem("cfw100.security.v2"));
  assert.equal(payload.version, 2);
  assert.equal("passwordValue" in payload, false);
  assert.equal(
    payload.simulatedPasswordDigest,
    createDidacticPasswordDigest(4321),
  );
  setStorage(null);
});

test("loadPersistedSecurity migra legado em texto puro e remove a chave antiga", () => {
  const storage = memoryStorage();
  setStorage(storage);
  storage.setItem(
    "cfw100.security.v1",
    JSON.stringify({ passwordValue: 1234 }),
  );

  const security = loadPersistedSecurity();

  assert.equal(
    security.passwordDigest,
    createDidacticPasswordDigest(1234),
  );
  assert.equal(storage.getItem("cfw100.security.v1"), null);
  const migratedPayload = JSON.parse(storage.getItem("cfw100.security.v2"));
  assert.equal("passwordValue" in migratedPayload, false);
  assert.equal(
    migratedPayload.simulatedPasswordDigest,
    createDidacticPasswordDigest(1234),
  );
  setStorage(null);
});

test("arquivo de configuração exporta parâmetros operacionais sem senha", () => {
  const { parameters } = createInitialHmiState();
  parameters.P100.value = 7.5;
  parameters.P200.value = 1;

  const payload = createConfigurationFilePayload(parameters);
  const snapshot = parseConfigurationFilePayload(payload);

  assert.equal(payload.format, "cfw100-parameter-configuration");
  assert.equal(payload.version, 1);
  assert.equal(snapshot.P100, 7.5);
  assert.equal("P000" in snapshot, false);
  assert.equal("P200" in snapshot, false);
  assert.equal("P204" in snapshot, false);
});

test("parser rejeita arquivo de configuração inválido", () => {
  assert.throws(
    () => parseConfigurationFilePayload('{"format":"outro"}'),
    /inválido/,
  );
});
