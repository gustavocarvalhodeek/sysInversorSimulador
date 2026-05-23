function translateOrFallback(t, key, fallback, params) {
  if (typeof t !== "function" || !key) {
    return fallback ?? "";
  }

  const translated = t(key, params);
  if (translated === key || translated === undefined || translated === null) {
    return fallback ?? key;
  }

  return translated;
}

function normalizeStatusMessage(status) {
  if (!status || typeof status !== "object" || Array.isArray(status)) {
    return status;
  }

  if ("key" in status || "fallback" in status) {
    return status;
  }

  if ("labelKey" in status || "label" in status) {
    return {
      key: status.labelKey,
      fallback: status.label ?? "",
      params: status.params,
    };
  }

  return status;
}

function translateStatusParam(param, t) {
  if (!param || typeof param !== "object" || Array.isArray(param)) {
    return param;
  }

  if (!("key" in param) && !("fallback" in param)) {
    return param;
  }

  return translateOrFallback(
    t,
    param.key,
    param.fallback ?? "",
    param.params,
  );
}

function resolveStatusParams(status, t) {
  if (!status?.params || typeof status.params !== "object") {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(status.params).map(([name, value]) => [
      name,
      translateStatusParam(value, t),
    ]),
  );
}

export function translateStatusMessage(status, t = null) {
  if (typeof status === "string") {
    return status;
  }

  if (!status || typeof status !== "object") {
    return "";
  }

  const normalizedStatus = normalizeStatusMessage(status);

  if (!normalizedStatus.key) {
    return normalizedStatus.fallback ?? "";
  }

  return translateOrFallback(
    t,
    normalizedStatus.key,
    normalizedStatus.fallback ?? normalizedStatus.key,
    resolveStatusParams(normalizedStatus, t),
  );
}

export function getStatusMessageListKey(status, index) {
  if (typeof status === "string") {
    return `status:${index}:${status}`;
  }

  if (!status || typeof status !== "object") {
    return `status:${index}:empty`;
  }

  const normalizedStatus = normalizeStatusMessage(status);
  let paramsKey = "";

  if (normalizedStatus.params !== undefined) {
    try {
      paramsKey = JSON.stringify(normalizedStatus.params);
    } catch {
      paramsKey = "";
    }
  }

  return `status:${index}:${normalizedStatus.key ?? "fallback"}:${normalizedStatus.fallback ?? ""}:${paramsKey}`;
}
