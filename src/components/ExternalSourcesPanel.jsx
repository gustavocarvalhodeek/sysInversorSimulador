import React from "react";
import { useI18n } from "../i18n/useI18n.js";

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: "11px",
        color: "#6b7487",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: "8px",
      }}
    >
      {children}
    </div>
  );
}

function NumericField({ label, value, min, max, step, onChange }) {
  return (
    <label style={{ display: "grid", gap: "4px" }}>
      <span style={{ fontSize: "11px", color: "#6b7487" }}>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.valueAsNumber;
          if (Number.isFinite(nextValue)) {
            onChange(nextValue);
          }
        }}
        style={{
          width: "100%",
          boxSizing: "border-box",
          border: "1px solid #d3dbe9",
          borderRadius: "8px",
          padding: "7px 8px",
          color: "#26324a",
          background: "#ffffff",
        }}
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12px",
        color: "#26324a",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

function NetworkSource({
  title,
  source,
  onChange,
  showRemoteMode = false,
  t,
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: "8px",
        padding: "10px",
        border: "1px solid #e2e8f2",
        borderRadius: "10px",
        background: "#ffffff",
      }}
    >
      <strong style={{ fontSize: "12px", color: "#26324a" }}>{title}</strong>
      <NumericField
        label={t("parameterInfo.reference13Bit")}
        value={source.speed13Bit}
        min={0}
        max={8192}
        step={1}
        onChange={(value) => onChange({ speed13Bit: value })}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <Toggle
          label={t("parameterInfo.run")}
          checked={source.run}
          onChange={(run) => onChange({ run })}
        />
        <Toggle
          label={t("parameterInfo.jog")}
          checked={source.jog}
          onChange={(jog) => onChange({ jog })}
        />
        <Toggle
          label={t("parameterInfo.counterClockwise")}
          checked={source.rotationSign < 0}
          onChange={(reverse) => onChange({ rotationSign: reverse ? -1 : 1 })}
        />
        {showRemoteMode ? (
          <Toggle
            label={t("parameterInfo.remoteMode")}
            checked={source.remoteMode}
            onChange={(remoteMode) => onChange({ remoteMode })}
          />
        ) : null}
      </div>
    </div>
  );
}

export default function ExternalSourcesPanel({ hmiState, dispatch }) {
  const { t } = useI18n();
  const sources = hmiState.externalSources;

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
          fontSize: "13px",
          fontWeight: 700,
          color: "#1b2740",
          marginBottom: "12px",
        }}
      >
        {t("parameterInfo.externalSourcesTitle")}
      </div>

      <SectionTitle>{t("parameterInfo.analogFrequency")}</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <NumericField
          label="AI1 (%)"
          value={sources.ai1Percent}
          min={0}
          max={100}
          step={0.1}
          onChange={(value) => dispatch({ type: "SET_AI1_PERCENT", value })}
        />
        <NumericField
          label="FI (Hz)"
          value={sources.fiFrequency}
          min={0}
          max={3000}
          step={1}
          onChange={(value) => dispatch({ type: "SET_FI_FREQUENCY", value })}
        />
      </div>

      <SectionTitle>{t("parameterInfo.digitalInputs")}</SectionTitle>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        {hmiState.digitalInputs.map((active, index) => (
          <Toggle
            key={`di-${index + 1}`}
            label={`DI${index + 1}`}
            checked={active}
            onChange={(value) =>
              dispatch({ type: "SET_DIGITAL_INPUT", index, value })
            }
          />
        ))}
      </div>

      <SectionTitle>{t("parameterInfo.networksSoftplc")}</SectionTitle>
      <div style={{ display: "grid", gap: "10px" }}>
        <NetworkSource
          title="Serial/USB"
          source={sources.serial}
          t={t}
          onChange={(value) =>
            dispatch({ type: "SET_EXTERNAL_SOURCE", source: "serial", value })
          }
        />
        <NetworkSource
          title="CO/DN"
          source={sources.codn}
          t={t}
          onChange={(value) =>
            dispatch({ type: "SET_EXTERNAL_SOURCE", source: "codn", value })
          }
        />
        <NetworkSource
          title="SoftPLC"
          source={sources.softplc}
          showRemoteMode
          t={t}
          onChange={(value) =>
            dispatch({ type: "SET_EXTERNAL_SOURCE", source: "softplc", value })
          }
        />
      </div>
    </div>
  );
}
