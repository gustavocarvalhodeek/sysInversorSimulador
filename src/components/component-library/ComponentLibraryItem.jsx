import React from "react";
import { useI18n } from "../../i18n/useI18n.js";
import {
  getComponentSimulationModeLabel,
  getComponentStatusLabel,
} from "./componentLibraryLabels.js";

const STATUS_TONES = {
  available: {
    background: "#e9f7ee",
    border: "#bfe3ca",
    color: "#23663a",
  },
  partial: {
    background: "#fff7e8",
    border: "#f0d7a5",
    color: "#8a5a00",
  },
  planned: {
    background: "#eef4ff",
    border: "#d6e3fb",
    color: "#33517d",
  },
  experimental: {
    background: "#fceefe",
    border: "#e6c7ef",
    color: "#6c3b7c",
  },
  documentationOnly: {
    background: "#f6f7fa",
    border: "#dfe5ef",
    color: "#51627f",
  },
  visualOnly: {
    background: "#eef7f7",
    border: "#cfe3e3",
    color: "#2f6a6a",
  },
};

export default function ComponentLibraryItem({
  item,
  selected = false,
  isCurrent = false,
  onSelect,
  onKeyDown,
}) {
  const { t } = useI18n();
  const statusLabel = getComponentStatusLabel(item.status, t);
  const simulationModeLabel = getComponentSimulationModeLabel(item.simulationMode, t);
  const statusTone = STATUS_TONES[item.status] ?? STATUS_TONES.planned;

  return (
    <button
      type="button"
      data-component-select="true"
      className="component-library-item"
      aria-current={selected ? "true" : undefined}
      onClick={() => onSelect?.(item.id)}
      onKeyDown={onKeyDown}
      style={{
        display: "grid",
        gap: "12px",
        padding: "14px",
        borderRadius: "12px",
        border: "1px solid #dbe4f1",
        background: "#ffffff",
        boxShadow: selected
          ? "0 0 0 2px rgba(47, 111, 214, 0.22), 0 5px 16px rgba(56, 70, 110, 0.1)"
          : "0 3px 10px rgba(56, 70, 110, 0.06)",
        textAlign: "left",
        width: "100%",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "grid", gap: "10px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "grid", gap: "4px", minWidth: 0 }}>
            <span
              id={`${item.id}-title`}
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#26324a",
              }}
            >
              {item.name}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#60728d",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {item.shortName}
            </span>
          </div>

          <span
            className="component-library-status"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 8px",
              borderRadius: "999px",
              border: `1px solid ${statusTone.border}`,
              background: statusTone.background,
              color: statusTone.color,
              fontSize: "11px",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {statusLabel}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "12px",
            lineHeight: 1.5,
            color: "#394a66",
          }}
        >
          {item.description}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 8px",
              borderRadius: "999px",
              border: "1px solid #dbe4f1",
              background: "#f7f9fc",
              color: "#3c4f70",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            {simulationModeLabel}
          </span>

          {item.tags?.map((tag) => (
            <span
              key={tag}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 8px",
                borderRadius: "999px",
                background: "#eef3f9",
                color: "#58708f",
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            lineHeight: 1.4,
            color: "#60728d",
            maxWidth: "100%",
          }}
        >
          {isCurrent
            ? t("componentLibrary.itemNote.current")
            : item.status === "available"
              ? t("componentLibrary.itemNote.available")
              : t("componentLibrary.itemNote.unavailable")}
        </span>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            minHeight: "34px",
            padding: "6px 12px",
            borderRadius: "8px",
            border: selected ? "1px solid #b7cef5" : "1px solid #d8e1ee",
            background: selected ? "#eef4ff" : "#f6f8fb",
            color: selected ? "#2d4d84" : "#6a7890",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          {selected
            ? t("componentLibrary.cta.detailsOpen")
            : t("componentLibrary.cta.viewDetails")}
        </span>
      </div>
    </button>
  );
}
