import React from "react";
import { useI18n } from "../../i18n/useI18n.js";
import { formatInfoValue } from "./valueFormatting.js";

export function Field({ label, value }) {
  const { t } = useI18n();

  return (
    <div>
      <div style={{ fontSize: "12px", color: "#6b7487", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "15px", fontWeight: 600, color: "#26324a" }}>
        {formatInfoValue(value, t("common.notInformed"))}
      </div>
    </div>
  );
}

export function Grid({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "14px",
      }}
    >
      {children}
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        style={{
          fontSize: "12px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#6b7487",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
