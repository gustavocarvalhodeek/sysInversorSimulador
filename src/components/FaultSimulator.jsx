import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  canTriggerFaultManually,
  getFaultDefinition,
  getSimulatorFaultCatalog,
} from "../logic/faultCatalog.js";
import { useI18n } from "../i18n/useI18n.js";
import {
  getResponsivePanelMaxHeight,
  getResponsivePanelWidth,
  isEscapeDismissKey,
  scheduleFocus,
  trapFocusWithin,
} from "./accessibilityHelpers.js";

function getFaultShortLabel(fault, t) {
  const key = `faultCatalog.F${String(fault.code).padStart(3, "0")}.shortLabel`;
  const translated = t(key);
  return translated === key ? fault.shortLabel : translated;
}

function getFaultDescription(fault, t) {
  const key = `faultCatalog.F${String(fault.code).padStart(3, "0")}.description`;
  const translated = t(key);
  return translated === key ? fault.description : translated;
}

function FaultButton({ fault, onTrigger, t }) {
  const [hovered, setHovered] = useState(false);
  const manualTriggerEnabled = canTriggerFaultManually(fault.code);
  const shortLabel = getFaultShortLabel(fault, t);
  const description = getFaultDescription(fault, t);

  return (
    <button
      type="button"
      className="app-focus-ring fault-card-button"
      onClick={() => manualTriggerEnabled && onTrigger(fault.code)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={description}
      disabled={!manualTriggerEnabled}
      aria-disabled={!manualTriggerEnabled}
      style={{
        padding: "12px 14px",
        border: "1px solid #e85d5d",
        background: hovered && manualTriggerEnabled ? "#fee6e6" : "#fff5f5",
        color: "#a82e2e",
        borderRadius: "8px",
        cursor: manualTriggerEnabled ? "pointer" : "not-allowed",
        fontSize: "12px",
        fontWeight: 500,
        textAlign: "left",
        opacity: manualTriggerEnabled ? 1 : 0.65,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: "4px" }}>
        F{String(fault.code).padStart(3, "0")}: {shortLabel}
      </div>
      <div style={{ fontSize: "11px", lineHeight: 1.35, marginBottom: "8px" }}>
        {description}
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "2px 8px",
          borderRadius: "999px",
          background: "#fde2e2",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.02em",
        }}
      >
        {t(`faultSimulator.triggerType.${fault.triggerType}`)}
      </div>
    </button>
  );
}

export default function FaultSimulator({ dispatch, faultCode, initialOpen = false }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(initialOpen);
  const [feedback, setFeedback] = useState(null);
  const triggerButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const dialogTitleId = useId();
  const dialogId = useId();
  const activeFault = getFaultDefinition(faultCode);
  const simulatorFaults = useMemo(() => getSimulatorFaultCatalog(), []);

  const closeDialog = ({ returnFocus = true } = {}) => {
    setOpen(false);
    if (returnFocus) {
      scheduleFocus(triggerButtonRef);
    }
  };

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    scheduleFocus(closeButtonRef);

    const handleKeyDown = (event) => {
      if (isEscapeDismissKey(event.key)) {
        event.preventDefault();
        closeDialog();
        return;
      }

      trapFocusWithin(event, dialogRef.current);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleTriggerFault = (code) => {
    if (!canTriggerFaultManually(code)) {
      setFeedback({
        message: t("faultSimulator.manualUnavailable"),
        tone: "error",
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    dispatch({ type: "RAISE_FAULT", code });
    const fault = getFaultDefinition(code);
    setFeedback({
      message: t("faultSimulator.triggeredFeedback", {
        code: String(code).padStart(3, "0"),
        label: fault ? getFaultShortLabel(fault, t) : t("faultSimulator.validCode"),
      }),
      tone: "success",
    });
    closeDialog();
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleResetFault = () => {
    dispatch({ type: "RESET_FAULT" });
    setFeedback({
      message: t("faultSimulator.resetFeedback"),
      tone: "success",
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={triggerButtonRef}
        type="button"
        className="surface-button app-focus-ring"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen((current) => !current)}
        style={{
          padding: "8px 16px",
          background: faultCode !== null ? "#fee6e6" : open ? "#e8eef8" : "#f5f8fd",
          border: faultCode !== null ? "1px solid #e85d5d" : "1px solid #d3dbe9",
          borderRadius: "8px",
          cursor: "pointer",
          color: faultCode !== null ? "#a82e2e" : "#27406b",
          fontWeight: 600,
          fontSize: "13px",
        }}
      >
        {t("faultSimulator.buttonLabel")}{" "}
        {faultCode !== null && `(F${String(faultCode).padStart(3, "0")})`}
      </button>

      {open && (
        <div
          onClick={() => closeDialog()}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            background: "rgba(18, 26, 40, 0.44)",
          }}
        >
          <div
            ref={dialogRef}
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: getResponsivePanelWidth(520),
              maxWidth: "100%",
              maxHeight: getResponsivePanelMaxHeight(480),
              overflow: "hidden",
              background: "#ffffff",
              border: "1px solid #d3dbe9",
              borderRadius: "10px",
              boxShadow: "0 8px 24px rgba(56, 70, 110, 0.2)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid #edf1f8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                id={dialogTitleId}
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#26324a",
                }}
              >
                {t("faultSimulator.dialogTitle")}
              </span>
              <button
                ref={closeButtonRef}
                type="button"
                className="app-focus-ring"
                aria-label={t("faultSimulator.closeAriaLabel")}
                onClick={() => closeDialog()}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  lineHeight: 1,
                  cursor: "pointer",
                  color: "#6b7487",
                  padding: "4px 6px",
                }}
              >
                X
              </button>
            </div>

            <div
              style={{
                padding: "16px",
                overflowY: "auto",
                display: "grid",
                gap: "12px",
              }}
            >
              <div
                className="fault-dialog-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
                  gap: "8px",
                }}
              >
                {simulatorFaults.map((fault) => (
                  <FaultButton
                    key={fault.code}
                    fault={fault}
                    onTrigger={handleTriggerFault}
                    t={t}
                  />
                ))}
              </div>

              {faultCode !== null && (
                <div
                  style={{
                    padding: "12px",
                    background: "#fee6e6",
                    border: "1px solid #e85d5d",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#a82e2e", marginBottom: "6px" }}>
                    {t("faultSimulator.activeFault", {
                      code: String(faultCode).padStart(3, "0"),
                    })}
                  </div>
                  {activeFault && (
                    <div style={{ fontSize: "12px", color: "#7e2323", marginBottom: "8px" }}>
                      {getFaultShortLabel(activeFault, t)}: {getFaultDescription(activeFault, t)}
                    </div>
                  )}
                  <button
                    type="button"
                    className="app-focus-ring"
                    onClick={handleResetFault}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "#a82e2e",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {t("faultSimulator.resetButton")}
                  </button>
                </div>
              )}

              <div style={{ fontSize: "11px", color: "#6b7487", lineHeight: "1.4" }}>
                {t("faultSimulator.automaticNote")}
              </div>
            </div>
          </div>
        </div>
      )}

      {feedback && (
        <div
          aria-live="polite"
          style={{
            position: "absolute",
            top: "-36px",
            right: 0,
            fontSize: "12px",
            color: feedback.tone === "error" ? "#a82e2e" : "#2d8844",
            fontWeight: 500,
            maxWidth: "min(280px, calc(100vw - 32px))",
            textAlign: "right",
          }}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
