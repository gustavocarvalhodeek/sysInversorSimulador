import React from "react";
import { useI18n } from "../i18n/useI18n.js";
import {
  getStatusMessageListKey,
  translateStatusMessage,
} from "./commandStatusMessages.js";
import {
  getMotorLoadValueText,
  VISUALLY_HIDDEN_STYLES,
} from "./hmiAccessibility.js";

const MOTOR_LOAD_SLIDER_ID = "motor-load-slider";
const MOTOR_LOAD_SLIDER_DESCRIPTION_ID = "motor-load-slider-description";

function Metric({ label, value, unit }) {
  return (
    <div>
      <div style={{ fontSize: "11px", color: "#6b7487", marginBottom: "2px" }}>
        {label}
      </div>
      <div style={{ fontSize: "15px", fontWeight: 700, color: "#26324a" }}>
        {value}
        {unit ? <span style={{ fontSize: "11px" }}> {unit}</span> : null}
      </div>
    </div>
  );
}

export default function MotorStatusBar({ hmiState, dispatch }) {
  const { t } = useI18n();
  const motor = hmiState.motorState;

  const round = (value, digits = 1) => Number(value).toFixed(digits);
  const loadPercent = hmiState.loadPercent ?? 0;
  const controlModeLabel = translateStatusMessage(motor.controlMode, t);
  const translatedNotes = (Array.isArray(motor.notes) ? motor.notes : [])
    .map((note, index) => ({
      id: getStatusMessageListKey(note, index),
      text: translateStatusMessage(note, t),
    }))
    .filter((note) => note.text);

  return (
    <div
      style={{
        border: "1px solid #dce3ef",
        borderRadius: "12px",
        background: "#f6f8fc",
        padding: "14px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "10px",
        }}
      >
        <strong style={{ fontSize: "13px", color: "#1b2740" }}>
          {t("parameterInfo.motorTitle")}
        </strong>
        <span style={{ fontSize: "12px", color: "#6b7487" }}>
          {t("parameterInfo.control")}: {controlModeLabel}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <Metric label={t("parameterInfo.rotation")} value={round(motor.rpm, 0)} unit="rpm" />
        <Metric
          label={t("parameterInfo.frequency")}
          value={round(hmiState.outputFrequency, 1)}
          unit="Hz"
        />
        <Metric label={t("parameterInfo.current")} value={round(motor.current, 1)} unit="A" />
        <Metric label={t("parameterInfo.voltage")} value={round(motor.outputVoltage, 0)} unit="V" />
        <Metric label={t("parameterInfo.torque")} value={round(motor.torquePercent, 0)} unit="%" />
        <Metric label={t("parameterInfo.dcBus")} value={round(motor.dcVoltage, 0)} unit="V" />
      </div>

      <label
        htmlFor={MOTOR_LOAD_SLIDER_ID}
        style={{
          display: "block",
          fontSize: "12px",
          color: "#6b7487",
          marginBottom: "6px",
        }}
      >
        {t("parameterInfo.loadLabel", {
          value: round(loadPercent, 0),
        })}
      </label>
      <span id={MOTOR_LOAD_SLIDER_DESCRIPTION_ID} style={VISUALLY_HIDDEN_STYLES}>
        {t("parameterInfo.loadDescription")}
      </span>
      <input
        id={MOTOR_LOAD_SLIDER_ID}
        type="range"
        min="0"
        max="150"
        step="5"
        value={loadPercent}
        aria-describedby={MOTOR_LOAD_SLIDER_DESCRIPTION_ID}
        aria-valuetext={getMotorLoadValueText(loadPercent, t)}
        onChange={(event) => {
          const nextValue = event.target.valueAsNumber;
          if (Number.isFinite(nextValue)) {
            dispatch({ type: "SET_LOAD", value: nextValue });
          }
        }}
        style={{ width: "100%" }}
      />

      {translatedNotes.length > 0 ? (
        <ul
          style={{
            margin: "10px 0 0",
            paddingLeft: "18px",
            color: "#9b6a00",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          {translatedNotes.map((note) => (
            <li key={note.id}>{note.text}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
