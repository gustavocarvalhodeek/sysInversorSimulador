const EVENT_CODE_PATTERN = /^[FA]\d{3}$/i;

export const VISUALLY_HIDDEN_STYLES = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

function normalizeRoundedPercent(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.round(numericValue) : 0;
}

function getDisplayStatusText(status, t) {
  switch (String(status ?? "").toUpperCase()) {
    case "RUN":
      return t("hmiA11y.statusRun");
    case "FLT":
      return t("hmiA11y.statusFault");
    case "SUB":
      return t("hmiA11y.statusSub");
    case "CONF":
      return t("hmiA11y.statusConfig");
    default:
      return t("hmiA11y.statusReady");
  }
}

function getDisplayDirectionText(direction, t) {
  return String(direction ?? "").toUpperCase() === "REV"
    ? t("hmiA11y.directionReverse")
    : t("hmiA11y.directionForward");
}

function normalizeDisplayValue(displayValue) {
  if (displayValue === null || displayValue === undefined || displayValue === "") {
    return "--";
  }

  return String(displayValue);
}

function getDisplayEventText(hmiState, t) {
  if (hmiState?.faultCode !== null && hmiState?.faultCode !== undefined) {
    return t("hmiA11y.activeFault", {
      code: `F${String(hmiState.faultCode).padStart(3, "0")}`,
    });
  }

  if (hmiState?.alarmCode !== null && hmiState?.alarmCode !== undefined) {
    return t("hmiA11y.activeAlarm", {
      code: `A${String(hmiState.alarmCode).padStart(3, "0")}`,
    });
  }

  return t("hmiA11y.noFault");
}

function getDisplayValueText(display, hmiState, t) {
  const value = normalizeDisplayValue(display?.value);
  const unit = String(display?.unit ?? "").trim();

  if (unit === "Hz") {
    return t("hmiA11y.frequencyValue", { value });
  }

  if (
    (hmiState?.alarmCode !== null && hmiState?.alarmCode !== undefined && unit === "A") ||
    EVENT_CODE_PATTERN.test(value)
  ) {
    return t("hmiA11y.genericValue", { value });
  }

  if (unit) {
    return t("hmiA11y.valueWithUnit", { value, unit });
  }

  return t("hmiA11y.genericValue", { value });
}

export function getMotorLoadValueText(loadPercent, t) {
  return t("parameterInfo.loadValueText", {
    value: normalizeRoundedPercent(loadPercent),
  });
}

export function buildHmiDisplayAccessibleSummary(display, hmiState, t) {
  return t("hmiA11y.summary", {
    value: getDisplayValueText(display, hmiState, t),
    status: getDisplayStatusText(display?.status, t),
    direction: getDisplayDirectionText(display?.direction, t),
    event: getDisplayEventText(hmiState, t),
  });
}

export function buildHmiDisplayLiveSummary(display, hmiState, t) {
  return t("hmiA11y.liveSummary", {
    status: getDisplayStatusText(display?.status, t),
    direction: getDisplayDirectionText(display?.direction, t),
    event: getDisplayEventText(hmiState, t),
  });
}
