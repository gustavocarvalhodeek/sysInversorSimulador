import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { COMPONENT_CATEGORIES } from "../../data/componentCategories.js";
import { SIMULATABLE_COMPONENTS } from "../../data/simulatableComponents.js";
import { localizeComponentList } from "../../data/componentLibraryTranslations.js";
import { useI18n } from "../../i18n/useI18n.js";
import {
  getResponsivePanelMaxHeight,
  getResponsivePanelWidth,
  getWrappedFocusIndex,
  isEscapeDismissKey,
  scheduleFocus,
  trapFocusWithin,
} from "../accessibilityHelpers.js";
import ComponentLibraryCategory from "./ComponentLibraryCategory.jsx";
import ComponentDetailsPanel from "./ComponentDetailsPanel.jsx";

const AVAILABLE_COMPONENT_COUNT = SIMULATABLE_COMPONENTS.filter(
  (component) => component.status === "available",
).length;

const ROADMAP_COMPONENT_COUNT =
  SIMULATABLE_COMPONENTS.length - AVAILABLE_COMPONENT_COUNT;

function SummaryPill({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 10px",
        borderRadius: "999px",
        border: "1px solid #d9e3f1",
        background: "#f7f9fc",
        color: "#3e5273",
        fontSize: "11px",
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

export default function ComponentLibraryPanel({
  open,
  dialogId,
  onClose,
  activeComponentId = "cfw100",
}) {
  const { language, t } = useI18n();
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const sidebarRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  const [selectedComponentId, setSelectedComponentId] = useState(activeComponentId);

  const localizedComponents = useMemo(
    () => localizeComponentList(SIMULATABLE_COMPONENTS, language),
    [language],
  );

  const categoriesWithComponents = useMemo(
    () =>
      COMPONENT_CATEGORIES.map((category) => ({
        ...category,
        items: localizedComponents.filter(
          (component) => component.categoryId === category.id,
        ),
      })).filter((category) => category.items.length > 0),
    [localizedComponents],
  );

  const selectedComponent =
    localizedComponents.find((component) => component.id === selectedComponentId) ??
    localizedComponents[0];

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    setSelectedComponentId((current) => current || activeComponentId);
    scheduleFocus(closeButtonRef);

    const handleKeyDown = (event) => {
      if (isEscapeDismissKey(event.key)) {
        event.preventDefault();
        onClose?.();
        return;
      }

      trapFocusWithin(event, dialogRef.current);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeComponentId, open, onClose]);

  const handleSelectComponent = (componentId) => {
    setSelectedComponentId(componentId);
  };

  const handleSidebarKeyDown = (event) => {
    const focusableButtons =
      [...(sidebarRef.current?.querySelectorAll('[data-component-select="true"]') ?? [])];

    if (focusableButtons.length === 0) {
      return;
    }

    const currentIndex = focusableButtons.indexOf(event.currentTarget);

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = getWrappedFocusIndex(
        currentIndex,
        delta,
        focusableButtons.length,
      );
      focusableButtons[nextIndex]?.focus();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusableButtons[0]?.focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      focusableButtons[focusableButtons.length - 1]?.focus();
    }
  };

  if (!open) {
    return null;
  }

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
        ref={dialogRef}
        id={dialogId}
        className="component-library-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: getResponsivePanelWidth(960),
          maxWidth: "100%",
          maxHeight: getResponsivePanelMaxHeight(720),
          overflow: "hidden",
          background: "#ffffff",
          border: "1px solid #d3dbe9",
          borderRadius: "16px",
          boxShadow: "0 12px 36px rgba(34, 48, 80, 0.24)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "18px 18px 14px",
            borderBottom: "1px solid #edf1f8",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div style={{ display: "grid", gap: "8px", minWidth: 0 }}>
            <span
              id={titleId}
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#26324a",
              }}
            >
              {t("componentLibrary.panelTitle")}
            </span>
            <p
              id={descriptionId}
              style={{
                margin: 0,
                fontSize: "12px",
                lineHeight: 1.5,
                color: "#53627e",
              }}
            >
              {t("componentLibrary.intro")}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <SummaryPill>
                {t("componentLibrary.cataloguedCount", {
                  count: SIMULATABLE_COMPONENTS.length,
                })}
              </SummaryPill>
              <SummaryPill>
                {t("componentLibrary.availableCount", {
                  count: AVAILABLE_COMPONENT_COUNT,
                })}
              </SummaryPill>
              <SummaryPill>
                {t("componentLibrary.roadmapCount", {
                  count: ROADMAP_COMPONENT_COUNT,
                })}
              </SummaryPill>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="app-focus-ring"
            aria-label={t("componentLibrary.closeAriaLabel")}
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

        <div
          className="component-library-layout"
          style={{
            padding: "18px",
          }}
        >
          <aside
            ref={sidebarRef}
            className="component-library-sidebar"
            style={{
              display: "grid",
              gap: "16px",
              alignContent: "start",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #dbe4f1",
                background: "#f7faff",
                display: "grid",
                gap: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#2b4267",
                }}
              >
                {t("componentLibrary.studyTitle")}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  lineHeight: 1.5,
                  color: "#51627f",
                }}
              >
                {t("componentLibrary.studyDescription")}
              </span>
            </div>

            {categoriesWithComponents.map((category) => (
              <ComponentLibraryCategory
                key={category.id}
                category={category}
                items={category.items}
                selectedComponentId={selectedComponent.id}
                currentComponentId={activeComponentId}
                onSelect={handleSelectComponent}
                onItemKeyDown={handleSidebarKeyDown}
              />
            ))}
          </aside>

          <ComponentDetailsPanel
            component={selectedComponent}
            isCurrent={selectedComponent.id === activeComponentId}
          />
        </div>
      </div>
    </div>
  );
}
