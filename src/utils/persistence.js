// Persistência tipo "EEPROM": o CFW100 grava os parâmetros ajustados e os
// mantém após desligar. Aqui usamos localStorage. Também é a base para o
// P204 (Carrega/Salva Parâmetros) das fases futuras.

// v2 invalida os snapshots antigos em que parâmetros "reference-only"
// eram persistidos com padrão incorreto igual a zero.
import { sanitizeParameterValue } from "./sanitizers.js";

const STORAGE_KEY = "cfw100.parameterValues.v2";
const SECURITY_STORAGE_KEY = "cfw100.security.v2";
const LEGACY_SECURITY_STORAGE_KEY = "cfw100.security.v1";
const USER_PARAMETER_STORAGE_KEY = "cfw100.userParameters.v1";
const CONFIGURATION_FILE_FORMAT = "cfw100-parameter-configuration";
const CONFIGURATION_FILE_VERSION = 1;
const CONFIGURATION_FILE_MODEL = "CFW100";
const SECURITY_STORAGE_VERSION = 2;
const PASSWORD_DIGEST_PREFIX = "cfw100-sim:";

export {
  CONFIGURATION_FILE_FORMAT,
  CONFIGURATION_FILE_MODEL,
  CONFIGURATION_FILE_VERSION,
};

// Storage injetavel (testes em Node passam um stub; navegador usa localStorage).
let storage =
  typeof globalThis !== "undefined" && globalThis.localStorage
    ? globalThis.localStorage
    : null;

export function setStorage(customStorage) {
  storage = customStorage;
}

function isValidPasswordValue(passwordValue) {
  return Number.isInteger(passwordValue) &&
    passwordValue >= 2 &&
    passwordValue <= 9999;
}

function isValidPasswordDigest(passwordDigest) {
  return typeof passwordDigest === "string" &&
    passwordDigest.startsWith(PASSWORD_DIGEST_PREFIX);
}

// Fingerprint didatico apenas para evitar guardar a senha do inversor em texto
// puro no localStorage. Nao e autenticacao real nem protecao contra inspeção
// do frontend; serve apenas para não normalizar armazenamento em claro.
export function createDidacticPasswordDigest(passwordValue) {
  if (!isValidPasswordValue(passwordValue)) {
    return null;
  }

  let hash = 2166136261;
  const input = `${PASSWORD_DIGEST_PREFIX}${passwordValue}`;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `${PASSWORD_DIGEST_PREFIX}${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function matchesDidacticPassword(passwordValue, passwordDigest) {
  const candidateDigest = createDidacticPasswordDigest(passwordValue);
  return candidateDigest !== null && candidateDigest === passwordDigest;
}

function clearPersistedSecurityStorage() {
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(SECURITY_STORAGE_KEY);
    storage.removeItem(LEGACY_SECURITY_STORAGE_KEY);
  } catch {
    // ignora
  }
}

function persistSecurityDigest(passwordDigest) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      SECURITY_STORAGE_KEY,
      JSON.stringify({
        version: SECURITY_STORAGE_VERSION,
        simulatedPasswordDigest: passwordDigest,
      }),
    );
    storage.removeItem(LEGACY_SECURITY_STORAGE_KEY);
  } catch {
    // Sem espaco / modo privado: simulador segue sem persistir.
  }
}

export function loadPersistedValues() {
  if (!storage) {
    return {};
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function loadPersistedSecurity() {
  if (!storage) {
    return { passwordDigest: null };
  }
  try {
    const raw = storage.getItem(SECURITY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const passwordDigest = parsed?.simulatedPasswordDigest;
      if (isValidPasswordDigest(passwordDigest)) {
        return { passwordDigest };
      }

      clearPersistedSecurityStorage();
      return { passwordDigest: null };
    }

    const legacyRaw = storage.getItem(LEGACY_SECURITY_STORAGE_KEY);
    if (!legacyRaw) {
      return { passwordDigest: null };
    }

    const legacyParsed = JSON.parse(legacyRaw);
    const legacyPasswordValue = legacyParsed?.passwordValue;
    const passwordDigest = createDidacticPasswordDigest(legacyPasswordValue);

    if (passwordDigest) {
      persistSecurityDigest(passwordDigest);
      return { passwordDigest };
    }

    clearPersistedSecurityStorage();
    return { passwordDigest: null };
  } catch {
    clearPersistedSecurityStorage();
    return { passwordDigest: null };
  }
}

// Grava apenas o que é ajustável pelo usuário (parâmetros editáveis).
// Grandezas somente leitura são derivadas e não devem ser persistidas.
export function persistValues(parameters) {
  if (!storage) {
    return;
  }
  try {
    const snapshot = {};
    for (const [code, parameter] of Object.entries(parameters)) {
      if (
        parameter &&
        parameter.code !== "P000" &&
        parameter.editable &&
        !parameter.readOnly
      ) {
        snapshot[code] = parameter.value;
      }
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Sem espaco / modo privado: simulador segue sem persistir.
  }
}

export function persistSecurity({ passwordDigest }) {
  if (!storage) {
    return;
  }

  if (!isValidPasswordDigest(passwordDigest)) {
    clearPersistedSecurityStorage();
    return;
  }

  persistSecurityDigest(passwordDigest);
}

export function createEditableSnapshot(parameters) {
  const snapshot = {};
  for (const [code, parameter] of Object.entries(parameters)) {
    if (
      parameter &&
      parameter.code !== "P000" &&
      parameter.code !== "P204" &&
      parameter.editable &&
      !parameter.readOnly
    ) {
      snapshot[code] = parameter.value;
    }
  }
  return snapshot;
}

function createPortableConfigurationSnapshot(parameters) {
  const snapshot = createEditableSnapshot(parameters);
  delete snapshot.P200;
  return snapshot;
}

export function createConfigurationFilePayload(parameters) {
  return {
    format: CONFIGURATION_FILE_FORMAT,
    version: CONFIGURATION_FILE_VERSION,
    model: CONFIGURATION_FILE_MODEL,
    parameters: createPortableConfigurationSnapshot(parameters),
  };
}

export function parseConfigurationFilePayload(rawPayload) {
  const payload =
    typeof rawPayload === "string" ? JSON.parse(rawPayload) : rawPayload;

  if (
    !payload ||
    typeof payload !== "object" ||
    payload.format !== CONFIGURATION_FILE_FORMAT ||
    payload.version !== CONFIGURATION_FILE_VERSION ||
    payload.model !== CONFIGURATION_FILE_MODEL ||
    !payload.parameters ||
    typeof payload.parameters !== "object" ||
    Array.isArray(payload.parameters)
  ) {
    throw new Error("Arquivo de configuração inválido.");
  }

  return payload.parameters;
}

export function saveUserParameterSet(parameters) {
  if (!storage) {
    return;
  }
  try {
    storage.setItem(
      USER_PARAMETER_STORAGE_KEY,
      JSON.stringify(createEditableSnapshot(parameters)),
    );
  } catch {
    // Sem espaco / modo privado: simulador segue sem persistir.
  }
}

export function loadUserParameterSet() {
  if (!storage) {
    return null;
  }
  try {
    const raw = storage.getItem(USER_PARAMETER_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function applySnapshotValues(parameters, snapshot) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return parameters;
  }

  for (const [code, value] of Object.entries(snapshot)) {
    const parameter = parameters[code];
    const nextValue = sanitizeParameterValue(parameter, value, null);
    if (
      parameter &&
      parameter.code !== "P000" &&
      parameter.code !== "P204" &&
      parameter.editable &&
      !parameter.readOnly &&
      nextValue !== null
    ) {
      parameter.value = nextValue;
    }
  }
  return parameters;
}

// Usado pelo P204 (restaurar padrao de fabrica) nas proximas fases.
export function clearPersistedValues() {
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(STORAGE_KEY);
    clearPersistedSecurityStorage();
    storage.removeItem(USER_PARAMETER_STORAGE_KEY);
  } catch {
    // ignora
  }
}

// Aplica os valores persistidos sobre o mapa de parâmetros recém-clonado.
export function applyPersistedValues(parameters) {
  return applySnapshotValues(parameters, loadPersistedValues());
}
