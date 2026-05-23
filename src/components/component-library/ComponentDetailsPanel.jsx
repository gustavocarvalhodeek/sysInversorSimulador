import React from "react";
import { useI18n } from "../../i18n/useI18n.js";
import {
  getComponentActionLabel,
  getComponentAvailabilityNote,
  getComponentSimulationModeLabel,
  getComponentStatusLabel,
} from "./componentLibraryLabels.js";
import ComponentDataTable from "./ComponentDataTable.jsx";
import ComponentMiniChart from "./ComponentMiniChart.jsx";
import ComponentStateViewer from "./ComponentStateViewer.jsx";

const STATUS_TONES = {
  available: { background: "#e9f7ee", border: "#bfe3ca", color: "#23663a" },
  partial: { background: "#fff7e8", border: "#f0d7a5", color: "#8a5a00" },
  planned: { background: "#eef4ff", border: "#d6e3fb", color: "#33517d" },
  experimental: { background: "#fceefe", border: "#e6c7ef", color: "#6c3b7c" },
  documentationOnly: { background: "#f6f7fa", border: "#dfe5ef", color: "#51627f" },
  visualOnly: { background: "#eef7f7", border: "#cfe3e3", color: "#2f6a6a" },
};

function Section({ title, children }) {
  return (
    <section
      style={{
        display: "grid",
        gap: "10px",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: "14px",
          fontWeight: 700,
          color: "#26324a",
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function ComponentDetailsPanel({
  component,
  isCurrent = false,
}) {
  const { t } = useI18n();
  if (!component) {
    return null;
  }

  const statusTone = STATUS_TONES[component.status] ?? STATUS_TONES.planned;
  const statusLabel = getComponentStatusLabel(component.status, t);
  const simulationModeLabel = getComponentSimulationModeLabel(
    component.simulationMode,
    t,
  );
  const note = getComponentAvailabilityNote(component, { isCurrent, t });
  const actionLabel = getComponentActionLabel(component, { isCurrent, t });

  return (
    <div
      className="component-library-details"
      style={{
        display: "grid",
        gap: "18px",
        alignContent: "start",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: "12px",
          padding: "18px",
          borderRadius: "16px",
          border: "1px solid #dbe4f1",
          background: "#ffffff",
          boxShadow: "0 6px 16px rgba(56, 70, 110, 0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "grid", gap: "4px", minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                color: "#26324a",
              }}
            >
              {component.name}
            </h2>
            <span
              style={{
                fontSize: "11px",
                color: "#60728d",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {component.shortName}
            </span>
          </div>

          <button
            type="button"
            className="app-focus-ring"
            disabled
            aria-disabled="true"
            style={{
              minHeight: "38px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: `1px solid ${statusTone.border}`,
              background: statusTone.background,
              color: statusTone.color,
              fontSize: "12px",
              fontWeight: 700,
              cursor: "default",
            }}
          >
            {actionLabel}
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
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
            }}
          >
            {statusLabel}
          </span>
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
              fontWeight: 700,
            }}
          >
            {simulationModeLabel}
          </span>
          {component.tags?.map((tag) => (
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

        <div
          style={{
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid #e1e8f4",
            background: "#f7faff",
            display: "grid",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#26324a",
            }}
          >
            {t("componentLibrary.overviewTitle")}
          </span>
          <span
            style={{
              fontSize: "12px",
              lineHeight: 1.6,
              color: "#53627e",
            }}
          >
            {component.description}
          </span>
          <span
            style={{
              fontSize: "12px",
              lineHeight: 1.6,
              color: "#3f5677",
              fontWeight: 600,
            }}
          >
            {note}
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: "18px",
          padding: "18px",
          borderRadius: "16px",
          border: "1px solid #dbe4f1",
          background: "#ffffff",
          boxShadow: "0 6px 16px rgba(56, 70, 110, 0.08)",
        }}
      >
        <Section title={t("componentLibrary.commandFunctionTitle")}>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              lineHeight: 1.65,
              color: "#394a66",
            }}
          >
            {component.functionDescription}
          </p>
        </Section>

        <Section title={t("componentLibrary.operatingPrincipleTitle")}>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              lineHeight: 1.65,
              color: "#394a66",
            }}
          >
            {component.operatingPrinciple}
          </p>
        </Section>

        <Section title={t("componentLibrary.applicationsTitle")}>
          <ul
            style={{
              margin: 0,
              paddingLeft: "18px",
              display: "grid",
              gap: "6px",
              color: "#394a66",
              fontSize: "13px",
              lineHeight: 1.6,
            }}
          >
            {component.typicalApplications.map((application) => (
              <li key={application}>{application}</li>
            ))}
          </ul>
        </Section>

        <Section title={t("componentLibrary.mainDataTitle")}>
          <ComponentDataTable rows={component.mainData} />
        </Section>

        <Section title={t("componentLibrary.statesTitle")}>
          <ComponentStateViewer states={component.visualStates} />
        </Section>

        <Section title={t("componentLibrary.chartTitle")}>
          <ComponentMiniChart
            title={component.chartTitle}
            description={component.chartDescription}
            data={component.chartData}
          />
        </Section>

        <Section title={t("componentLibrary.limitationsTitle")}>
          <ul
            style={{
              margin: 0,
              paddingLeft: "18px",
              display: "grid",
              gap: "6px",
              color: "#394a66",
              fontSize: "13px",
              lineHeight: 1.6,
            }}
          >
            {component.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
