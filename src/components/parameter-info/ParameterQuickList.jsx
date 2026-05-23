import React, { useEffect, useId, useRef } from "react";
import { useI18n } from "../../i18n/useI18n.js";
import { localizeParameter } from "../../i18n/localizedContent.js";
import { getAllParameters } from "../../hmi/parameters/parameterHelpers.js";
import {
  isEscapeDismissKey,
  scheduleFocus,
  trapFocusWithin,
} from "../accessibilityHelpers.js";

export default function ParameterQuickList({
  open,
  onClose,
  onSelect,
  activeCode,
  hmiState,
  triggerRef,
}) {
  const { t, currentLanguage } = useI18n();
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const returnFocusRef = useRef(null);
  const dialogTitleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    returnFocusRef.current =
      triggerRef?.current ??
      dialogRef.current?.ownerDocument?.activeElement ??
      null;
    scheduleFocus(closeButtonRef);
  }, [open, triggerRef]);

  if (!open) {
    return null;
  }

  const parameters = getAllParameters(hmiState).map((parameter) =>
    localizeParameter(parameter, currentLanguage),
  );

  const handleRequestClose = () => {
    onClose();
    scheduleFocus(returnFocusRef);
  };

  const handleDialogKeyDown = (event) => {
    if (isEscapeDismissKey(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      handleRequestClose();
      return;
    }

    trapFocusWithin(event, dialogRef.current);
  };

  return (
    <div
      onClick={handleRequestClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(20,28,46,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleDialogKeyDown}
        style={{
          width: "min(92vw, 560px)",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(20,28,46,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 22px",
            borderBottom: "1px solid #eef1f6",
          }}
        >
          <strong
            id={dialogTitleId}
            style={{ fontSize: "16px", color: "#1b2740" }}
          >
            {t("parameterInfo.quickListTitle", { count: parameters.length })}
          </strong>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleRequestClose}
            aria-label={t("parameterInfo.quickListCloseAria")}
            style={{
              border: "none",
              background: "#eef1f6",
              borderRadius: "8px",
              padding: "6px 12px",
              cursor: "pointer",
              color: "#4b5569",
              fontWeight: 700,
            }}
          >
            {t("parameterInfo.quickListClose")}
          </button>
        </div>
        <div style={{ overflowY: "auto" }}>
          {parameters.map((parameter) => {
            const isActive = parameter.code === activeCode;
            return (
              <button
                key={parameter.code}
                type="button"
                aria-label={t("parameterInfo.selectParameterAria", {
                  code: parameter.code,
                  name: parameter.name,
                })}
                onClick={() => {
                  onSelect(parameter.code);
                  handleRequestClose();
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "62px 1fr auto",
                  gap: "12px",
                  alignItems: "center",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 22px",
                  border: "none",
                  borderBottom: "1px solid #f1f4f9",
                  background: isActive ? "#eef4ff" : "transparent",
                  cursor: "pointer",
                  color: "#26324a",
                }}
              >
                <span style={{ fontWeight: 700 }}>{parameter.code}</span>
                <span>
                  <div style={{ fontSize: "14px" }}>{parameter.name}</div>
                  <div style={{ fontSize: "11px", color: "#8a93a5" }}>
                    {parameter.categoryLabel}
                  </div>
                </span>
                <span style={{ fontSize: "11px", color: "#6b7487" }}>
                  {parameter.access === "editavel"
                    ? t("parameterInfo.accessEditable")
                    : parameter.access === "somente_leitura"
                      ? t("parameterInfo.accessReadOnly")
                      : parameter.access}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
