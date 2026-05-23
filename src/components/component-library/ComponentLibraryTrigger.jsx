import React, { Suspense, lazy, useId, useRef, useState } from "react";
import { scheduleFocus } from "../accessibilityHelpers.js";
import { useI18n } from "../../i18n/useI18n.js";

const LazyComponentLibraryPanel = lazy(() =>
  import("./ComponentLibraryPanel.jsx"),
);

function ComponentLibraryLoadingFallback({
  dialogId,
  onClose,
  title,
  description,
  closeAriaLabel,
}) {
  return (
    <div
      className="component-library-backdrop"
      onClick={() => onClose?.()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(18, 26, 40, 0.46)",
      }}
    >
      <div
        id={dialogId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-busy="true"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(420px, 100%)",
          background: "#ffffff",
          border: "1px solid #d3dbe9",
          borderRadius: "16px",
          boxShadow: "0 12px 36px rgba(34, 48, 80, 0.24)",
          padding: "18px",
          display: "grid",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#26324a",
            }}
          >
            {title}
          </span>
          <button
            type="button"
            className="app-focus-ring"
            aria-label={closeAriaLabel}
            onClick={() => onClose?.()}
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
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            lineHeight: 1.5,
            color: "#53627e",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default function ComponentLibraryTrigger({
  activeComponentId = "cfw100",
  triggerLabel = null,
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const triggerButtonRef = useRef(null);
  const dialogId = useId();
  const resolvedTriggerLabel = triggerLabel ?? t("componentLibrary.triggerButton");
  const loadingTitle = t("componentLibrary.loadingTitle");
  const loadingDescription = t("componentLibrary.loadingDescription");
  const closeAriaLabel = t("componentLibrary.closeAriaLabel");

  const closePanel = ({ returnFocus = true } = {}) => {
    setOpen(false);
    if (returnFocus) {
      scheduleFocus(triggerButtonRef);
    }
  };

  const handleToggle = () => {
    if (open) {
      closePanel();
      return;
    }

    setOpen(true);
  };

  return (
    <div
      className="component-library-trigger"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "6px",
      }}
    >
      <button
        ref={triggerButtonRef}
        type="button"
        className="surface-button app-focus-ring"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={handleToggle}
        style={{
          padding: "8px 16px",
          background: open ? "#e8eef8" : "#f5f8fd",
          border: "1px solid #d3dbe9",
          borderRadius: "8px",
          cursor: "pointer",
          color: "#27406b",
          fontWeight: 600,
          fontSize: "13px",
          minHeight: "38px",
        }}
      >
        {resolvedTriggerLabel}
      </button>

      {open ? (
        <Suspense
          fallback={
            <ComponentLibraryLoadingFallback
              dialogId={dialogId}
              onClose={closePanel}
              title={loadingTitle}
              description={loadingDescription}
              closeAriaLabel={closeAriaLabel}
            />
          }
        >
          <LazyComponentLibraryPanel
            open={open}
            dialogId={dialogId}
            onClose={closePanel}
            activeComponentId={activeComponentId}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
