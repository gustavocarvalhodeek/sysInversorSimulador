export const MISSING_INFO_LABEL = "Não informado";

export function isValueMissing(value) {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  return typeof value === "number" && Number.isNaN(value);
}

export function formatInfoValue(value, fallback = MISSING_INFO_LABEL) {
  if (isValueMissing(value)) {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (Array.isArray(value)) {
    return value.length === 0 ? "[]" : value.join(", ");
  }

  return value;
}
