import {
  CONFIGURATION_FILE_FORMAT,
  CONFIGURATION_FILE_MODEL,
  CONFIGURATION_FILE_VERSION,
  parseConfigurationFilePayload,
} from "./persistence.js";

const CONFIGURATION_FILE_NAME = "cfw100-configuracao.json";
const JSON_FILE_EXTENSION = ".json";
const JSON_MIME_FRAGMENT = "json";

export const MAX_CONFIGURATION_FILE_SIZE_BYTES = 1024 * 1024;

function createConfigurationFileError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function hasCompatibleJsonType(file) {
  return typeof file?.type === "string" &&
    file.type.toLowerCase().includes(JSON_MIME_FRAGMENT);
}

function hasJsonExtension(file) {
  return typeof file?.name === "string" &&
    file.name.toLowerCase().endsWith(JSON_FILE_EXTENSION);
}

export function validateConfigurationFile(file) {
  if (!file) {
    return { ok: false, errorCode: "noFile" };
  }

  const fileSize = Number(file.size);
  if (!Number.isFinite(fileSize) || fileSize < 0) {
    return { ok: false, errorCode: "invalidType" };
  }

  if (fileSize === 0) {
    return { ok: false, errorCode: "emptyFile" };
  }

  if (fileSize > MAX_CONFIGURATION_FILE_SIZE_BYTES) {
    return { ok: false, errorCode: "fileTooLarge" };
  }

  if (!hasJsonExtension(file) && !hasCompatibleJsonType(file)) {
    return { ok: false, errorCode: "invalidType" };
  }

  if (typeof file.text !== "function") {
    return { ok: false, errorCode: "unreadable" };
  }

  return { ok: true };
}

function validateConfigurationPayloadShape(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, errorCode: "invalidConfiguration" };
  }

  if (payload.format !== CONFIGURATION_FILE_FORMAT) {
    return { ok: false, errorCode: "invalidConfiguration" };
  }

  if (payload.version !== CONFIGURATION_FILE_VERSION) {
    return { ok: false, errorCode: "unsupportedVersion" };
  }

  if (payload.model !== CONFIGURATION_FILE_MODEL) {
    return { ok: false, errorCode: "incompatibleModel" };
  }

  if (
    !payload.parameters ||
    typeof payload.parameters !== "object" ||
    Array.isArray(payload.parameters)
  ) {
    return { ok: false, errorCode: "invalidConfiguration" };
  }

  return { ok: true };
}

export function getConfigurationFileErrorTranslationKey(error) {
  switch (error?.code) {
    case "noFile":
      return "configurationFileErrors.noFile";
    case "emptyFile":
      return "configurationFileErrors.emptyFile";
    case "fileTooLarge":
      return "configurationFileErrors.fileTooLarge";
    case "invalidType":
      return "configurationFileErrors.invalidType";
    case "invalidJson":
      return "configurationFileErrors.invalidJson";
    case "unsupportedVersion":
      return "configurationFileErrors.unsupportedVersion";
    case "incompatibleModel":
      return "configurationFileErrors.incompatibleModel";
    case "unreadable":
      return "configurationFileErrors.unreadable";
    case "invalidConfiguration":
      return "configurationFileErrors.invalidConfiguration";
    default:
      return "configurationFileErrors.unknown";
  }
}

export function downloadConfigurationPayload(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = CONFIGURATION_FILE_NAME;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function openConfigurationFilePicker(inputRef) {
  inputRef.current?.click();
}

export function consumeSelectedConfigurationFile(event) {
  const file = event.target?.files?.[0] ?? null;
  if (event.target) {
    event.target.value = "";
  }
  return file;
}

export async function readConfigurationSnapshotFromFile(file) {
  const validation = validateConfigurationFile(file);
  if (!validation.ok) {
    throw createConfigurationFileError(validation.errorCode);
  }

  let rawPayload = "";
  try {
    rawPayload = await file.text();
  } catch {
    throw createConfigurationFileError("unreadable");
  }

  let payload;
  try {
    payload = JSON.parse(rawPayload);
  } catch {
    throw createConfigurationFileError("invalidJson");
  }

  const payloadValidation = validateConfigurationPayloadShape(payload);
  if (!payloadValidation.ok) {
    throw createConfigurationFileError(payloadValidation.errorCode);
  }

  try {
    return parseConfigurationFilePayload(payload);
  } catch {
    throw createConfigurationFileError("invalidConfiguration");
  }
}
