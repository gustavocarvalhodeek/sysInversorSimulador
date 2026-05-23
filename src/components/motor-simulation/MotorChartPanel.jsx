import React, { useState, useEffect } from "react";
import { useI18n } from "../../i18n/useI18n.js";
import MotorChart from "./MotorChart.jsx";
import { SERIES, TIME_WINDOWS } from "./motorSimulationConstants.js";

const ExpandIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path
      d="M1 5V1h4M8 1h4v4M12 8v4H8M5 12H1V8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M2 2l11 11M13 2L2 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default function MotorChartPanel({
  activeSeries,
  displaySamples,
  faultEvents,
  hmiState,
  paused,
  windowMs,
  onTogglePause,
  onToggleSeries,
  onSelectWindow,
}) {
  const { t } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isModalOpen]);

  const getSeriesLabel = (key, fallbackLabel) =>
    t(`motorPanel.series.${key}`) === `motorPanel.series.${key}`
      ? fallbackLabel
      : t(`motorPanel.series.${key}`);

  const renderSeriesButtons = () => (
    <div
      role="group"
      aria-label={t("motorPanel.seriesGroupAria")}
      style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}
    >
      {SERIES.map(({ key, label, color }) => {
        const enabled = activeSeries.has(key);
        const translatedLabel = getSeriesLabel(key, label);
        return (
          <button
            key={key}
            type="button"
            aria-pressed={enabled}
            aria-label={
              enabled
                ? t("motorPanel.hideSeries", { label: translatedLabel })
                : t("motorPanel.showSeries", { label: translatedLabel })
            }
            onClick={() => onToggleSeries(key)}
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 20,
              border: `1.5px solid ${color}`,
              background: enabled ? color : "transparent",
              color: enabled ? "#fff" : color,
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.15s",
            }}
          >
            {translatedLabel}
          </button>
        );
      })}
    </div>
  );

  const renderWindowButtons = () => (
    <div
      role="group"
      aria-label={t("motorPanel.timeWindowAria")}
      style={{ display: "flex", gap: 4, marginBottom: 4 }}
    >
      {TIME_WINDOWS.map(({ label, ms }) => (
        <button
          key={ms}
          type="button"
          aria-pressed={ms === windowMs}
          aria-label={t("motorPanel.showWindow", { label })}
          onClick={() => onSelectWindow(ms)}
          style={{
            fontSize: 10,
            padding: "2px 8px",
            borderRadius: 20,
            border: `1px solid ${ms === windowMs ? "#64748b" : "#d1d5db"}`,
            background: ms === windowMs ? "#1e293b" : "transparent",
            color: ms === windowMs ? "#fff" : "#64748b",
            cursor: "pointer",
            fontWeight: ms === windowMs ? 700 : 400,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const renderLegend = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 6,
        fontSize: 10,
        color: "#94a3b8",
      }}
    >
      <span style={{ color: "#2563eb" }}>{t("motorPanel.leftAxis")}</span>
      <span style={{ color: "#6b7487" }}>
        {paused
          ? `⏸ ${t("motorPanel.paused")}`
          : `● ${t("motorPanel.live")}`}
      </span>
      <span style={{ color: "#ea580c" }}>{t("motorPanel.rightAxis")}</span>
    </div>
  );

  const renderPauseButton = () => (
    <button
      type="button"
      onClick={onTogglePause}
      aria-pressed={paused}
      aria-label={paused ? t("motorPanel.resumeAria") : t("motorPanel.pauseAria")}
      style={{
        fontSize: 11,
        padding: "3px 10px",
        borderRadius: 20,
        border: `1px solid ${paused ? "#2563eb" : "#b8c4d8"}`,
        background: paused ? "#eff6ff" : "transparent",
        color: paused ? "#2563eb" : "#6b7487",
        cursor: "pointer",
        fontWeight: paused ? 700 : 400,
      }}
    >
      {paused
        ? `▶ ${t("motorPanel.resumeButton")}`
        : `⏸ ${t("motorPanel.pauseButton")}`}
    </button>
  );

  const renderChart = () => (
    <MotorChart
      displaySamples={displaySamples}
      faultEvents={faultEvents}
      windowMs={windowMs}
      activeSeries={activeSeries}
      hmiState={hmiState}
    />
  );

  return (
    <>
      <div
        style={{
          padding: "14px 12px 10px",
          flex: 1,
          borderRadius: 16,
          background: "#f7f9fc",
          border: "1px solid #e3e9f3",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <strong style={{ fontSize: 13, color: "#1b2740" }}>
            {t("motorPanel.chartTitle")}
          </strong>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              title={t("motorPanel.expandChart")}
              aria-label={t("motorPanel.expandChart")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 7px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "transparent",
                color: "#64748b",
                cursor: "pointer",
              }}
            >
              <ExpandIcon />
            </button>
            {renderPauseButton()}
          </div>
        </div>

        {renderSeriesButtons()}
        {renderWindowButtons()}
        {renderChart()}
        {renderLegend()}
      </div>

      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("motorPanel.chartTitle")}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            aria-hidden="true"
            onClick={() => setIsModalOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15, 23, 42, 0.55)",
              backdropFilter: "blur(5px)",
            }}
          />
          <div
            style={{
              position: "relative",
              background: "#ffffff",
              borderRadius: 20,
              padding: "24px 28px 20px",
              width: "min(96vw, 860px)",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 32px 80px rgba(0, 0, 0, 0.28)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <strong style={{ fontSize: 15, color: "#1b2740" }}>
                {t("motorPanel.chartTitle")}
              </strong>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {renderPauseButton()}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label={t("common.close")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    background: "transparent",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {renderSeriesButtons()}
            {renderWindowButtons()}
            {renderChart()}
            {renderLegend()}
          </div>
        </div>
      )}
    </>
  );
}
