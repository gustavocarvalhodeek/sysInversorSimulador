import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { createConfigurationFilePayload } from "../utils/persistence.js";
import {
  consumeSelectedConfigurationFile,
  downloadConfigurationPayload,
  getConfigurationFileErrorTranslationKey,
  openConfigurationFilePicker,
  readConfigurationSnapshotFromFile,
} from "../utils/configurationFileActions.js";
import { CFW100_SCENARIO_PRESETS } from "../configurations/cfw100ScenarioPresets.js";
import { useI18n } from "../i18n/useI18n.js";
import {
  getLocalizedPresetContent,
  getLocalizedScenarioModeLabel,
} from "../i18n/localizedContent.js";
import FaultSimulator from "./FaultSimulator.jsx";
import {
  getResponsivePanelMaxHeight,
  getResponsivePanelWidth,
  getWrappedFocusIndex,
  isEscapeDismissKey,
  scheduleFocus,
} from "./accessibilityHelpers.js";

export default function HeaderMenu({
  hmiState,
  dispatch,
  initialMenuOpen = false,
  initialConfigMenuOpen = false,
  children,
}) {
  const { t, currentLanguage } = useI18n();
  const [menuOpen, setMenuOpen] = useState(initialMenuOpen);
  const [configMenuOpen, setConfigMenuOpen] = useState(initialConfigMenuOpen);
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef(null);
  const menuRootRef = useRef(null);
  const menuPanelRef = useRef(null);
  const mainMenuPanelRef = useRef(null);
  const menuButtonRef = useRef(null);
  const exportButtonRef = useRef(null);
  const scenarioButtonRef = useRef(null);
  const hoverCloseTimeoutRef = useRef(null);
  const menuOpenReasonRef = useRef("action");
  const menuId = useId();
  const scenarioGroupId = useId();
  const scenarioButtonId = useId();
  const [submenuLayout, setSubmenuLayout] = useState({ placement: "side", top: 0 });

  const getMenuItems = () =>
    [...(menuPanelRef.current?.querySelectorAll('[role="menuitem"]') ?? [])];

  const getScenarioItems = () =>
    [...(menuPanelRef.current?.querySelectorAll('[data-menu-scenario-item="true"]') ?? [])];

  const focusFirstScenarioItem = () => {
    const [firstItem] = getScenarioItems();
    firstItem?.focus();
  };

  const clearHoverCloseTimeout = useCallback(() => {
    if (hoverCloseTimeoutRef.current === null) {
      return;
    }

    clearTimeout(hoverCloseTimeoutRef.current);
    hoverCloseTimeoutRef.current = null;
  }, []);

  const scheduleFeedbackClear = () => {
    setTimeout(() => setFeedback(null), 3000);
  };

  const calculateSubmenuLayout = useCallback(() => {
    if (
      typeof window === "undefined" ||
      !mainMenuPanelRef.current ||
      !scenarioButtonRef.current
    ) {
      return null;
    }

    const panelRect = mainMenuPanelRef.current.getBoundingClientRect();
    const availableRight = window.innerWidth - panelRect.right - 16;
    const useStackedLayout = window.innerWidth < 560 || availableRight < 288;

    return {
      placement: useStackedLayout ? "stacked" : "side",
      top: useStackedLayout ? 0 : scenarioButtonRef.current.offsetTop,
    };
  }, []);

  const syncSubmenuLayout = useCallback(() => {
    const nextLayout = calculateSubmenuLayout();
    if (!nextLayout) {
      return;
    }

    setSubmenuLayout((current) => {
      if (
        current.placement === nextLayout.placement &&
        current.top === nextLayout.top
      ) {
        return current;
      }

      return nextLayout;
    });
  }, [calculateSubmenuLayout]);

  const openScenarioMenu = ({ focusFirstItem = false } = {}) => {
    clearHoverCloseTimeout();
    syncSubmenuLayout();
    setConfigMenuOpen(true);

    if (
      typeof window !== "undefined" &&
      typeof window.requestAnimationFrame === "function"
    ) {
      window.requestAnimationFrame(() => {
        syncSubmenuLayout();
        if (focusFirstItem) {
          focusFirstScenarioItem();
        }
      });
      return;
    }

    syncSubmenuLayout();
    if (focusFirstItem) {
      focusFirstScenarioItem();
    }
  };

  const closeScenarioMenu = ({ focusTarget = null } = {}) => {
    setConfigMenuOpen(false);
    if (focusTarget) {
      scheduleFocus(focusTarget);
    }
  };

  const closeMenus = useCallback(({ focusTarget = null } = {}) => {
    clearHoverCloseTimeout();
    setMenuOpen(false);
    setConfigMenuOpen(false);
    if (focusTarget) {
      scheduleFocus(focusTarget);
    }
  }, [clearHoverCloseTimeout]);

  useEffect(() => {
    if (!menuOpen) {
      setConfigMenuOpen(false);
      return;
    }

    if (menuOpenReasonRef.current === "hover") {
      return;
    }

    scheduleFocus(exportButtonRef);
  }, [menuOpen]);

  useEffect(() => () => clearHoverCloseTimeout(), [clearHoverCloseTimeout]);

  useEffect(() => {
    if (!menuOpen || !configMenuOpen) {
      return undefined;
    }

    syncSubmenuLayout();

    const handleResize = () => {
      syncSubmenuLayout();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [configMenuOpen, menuOpen, syncSubmenuLayout]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!menuRootRef.current?.contains(event.target)) {
        closeMenus();
      }
    };

    const handleGlobalKeyDown = (event) => {
      if (!isEscapeDismissKey(event.key)) {
        return;
      }

      event.preventDefault();
      if (configMenuOpen) {
        setConfigMenuOpen(false);
        scheduleFocus(scenarioButtonRef);
        return;
      }

      closeMenus({ focusTarget: menuButtonRef });
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [closeMenus, configMenuOpen, menuOpen]);

  const handleExport = () => {
    const payload = createConfigurationFilePayload(hmiState.parameters);
    downloadConfigurationPayload(payload);
    setFeedback({ message: t("menu.savedFeedback"), tone: "success" });
    closeMenus({ focusTarget: menuButtonRef });
    scheduleFeedbackClear();
  };

  const handleImportClick = () => {
    openConfigurationFilePicker(inputRef);
    closeMenus({ focusTarget: menuButtonRef });
  };

  const handleFileChange = async (event) => {
    const file = consumeSelectedConfigurationFile(event);
    if (!file) {
      return;
    }

    try {
      const snapshot = await readConfigurationSnapshotFromFile(file);
      dispatch({ type: "IMPORT_CONFIGURATION", snapshot });
      setFeedback({
        message: t("menu.loadedFeedback", {
          count: Object.keys(snapshot).length,
        }),
        tone: "success",
      });
      scheduleFeedbackClear();
    } catch (error) {
      setFeedback({
        message: t(getConfigurationFileErrorTranslationKey(error)),
        tone: "error",
      });
      scheduleFeedbackClear();
    }
  };

  const handleLoadScenarioPreset = (preset) => {
    const localizedPreset = getLocalizedPresetContent(preset, currentLanguage);
    dispatch({ type: "APPLY_SCENARIO_PRESET", preset });
    setFeedback({
      message: t("menu.scenarioLoaded", { name: localizedPreset.name }),
      tone: "success",
    });
    closeMenus({ focusTarget: menuButtonRef });
    scheduleFeedbackClear();
  };

  const toggleMenu = () => {
    clearHoverCloseTimeout();
    if (menuOpen) {
      closeMenus();
      return;
    }

    menuOpenReasonRef.current = "action";
    setMenuOpen(true);
  };

  const handleScenarioToggle = () => {
    if (configMenuOpen) {
      closeScenarioMenu();
      return;
    }

    openScenarioMenu({ focusFirstItem: true });
  };

  const handleMenuAreaMouseEnter = () => {
    clearHoverCloseTimeout();
    if (menuOpen) {
      return;
    }

    menuOpenReasonRef.current = "hover";
    setMenuOpen(true);
  };

  const handleMenuAreaMouseLeave = () => {
    clearHoverCloseTimeout();
    if (!menuOpen) {
      return;
    }

    hoverCloseTimeoutRef.current = setTimeout(() => {
      closeMenus();
    }, 120);
  };

  const handleMenuKeyDown = (event) => {
    const menuItems = getMenuItems();
    if (menuItems.length === 0) {
      return;
    }

    const activeElement = document.activeElement;
    const currentIndex = menuItems.indexOf(activeElement);
    const isInsideScenarioList =
      activeElement?.getAttribute("data-menu-scenario-item") === "true";

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = getWrappedFocusIndex(currentIndex, delta, menuItems.length);
      menuItems[nextIndex]?.focus();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      menuItems[0]?.focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      menuItems[menuItems.length - 1]?.focus();
      return;
    }

    if (event.key === "ArrowRight" && activeElement === scenarioButtonRef.current) {
      event.preventDefault();
      if (!configMenuOpen) {
        openScenarioMenu({ focusFirstItem: true });
        return;
      }

      focusFirstScenarioItem();
      return;
    }

    if (event.key === "ArrowLeft" && isInsideScenarioList) {
      event.preventDefault();
      closeScenarioMenu({ focusTarget: scenarioButtonRef });
      return;
    }

    if (
      (event.key === "Enter" || event.key === " ") &&
      activeElement === scenarioButtonRef.current
    ) {
      event.preventDefault();
      handleScenarioToggle();
    }
  };

  const activeScenario = hmiState.activeScenarioId
    ? getLocalizedPresetContent(
        {
          id: hmiState.activeScenarioId,
          activeScenarioName: hmiState.activeScenarioName,
          activeScenarioApplication: hmiState.activeScenarioApplication,
          activeScenarioNotes: hmiState.activeScenarioNotes,
        },
        currentLanguage,
      )
    : null;
  const localizedPresets = CFW100_SCENARIO_PRESETS.map((preset) => ({
    preset,
    localized: getLocalizedPresetContent(preset, currentLanguage),
  }));

  return (
    <div
      className="header-menu-bar app-header"
      style={{
        padding: "16px clamp(16px, 4vw, 24px)",
        background: "rgba(255,255,255,0.95)",
        borderBottom: "1px solid #e0e6f2",
        boxShadow: "0 2px 8px rgba(56, 70, 110, 0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px 16px",
        fontFamily: "Arial, sans-serif",
        position: "relative",
      }}
    >
      <div
        className="header-menu-actions app-header-actions"
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          maxWidth: "100%",
          order: 1,
        }}
      >
        <div
          style={{ position: "relative" }}
          ref={menuRootRef}
          onMouseEnter={handleMenuAreaMouseEnter}
          onMouseLeave={handleMenuAreaMouseLeave}
        >
          <button
            ref={menuButtonRef}
            type="button"
            className="surface-button app-focus-ring"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={toggleMenu}
            style={{
              padding: "8px 16px",
              background: menuOpen ? "#e8eef8" : "#f5f8fd",
              border: "1px solid #d3dbe9",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#27406b",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            {t("header.menuButton")}
          </button>

          {menuOpen && (
            <div
              ref={menuPanelRef}
              onKeyDown={handleMenuKeyDown}
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                marginTop: "4px",
                display: "flex",
                flexDirection: submenuLayout.placement === "side" ? "row" : "column",
                alignItems: "flex-start",
                gap: "8px",
                maxWidth: "calc(100vw - 32px)",
                zIndex: 1000,
              }}
            >
              <div
                ref={mainMenuPanelRef}
                id={menuId}
                role="menu"
                aria-label={t("menu.ariaLabel")}
                style={{
                  background: "#ffffff",
                  border: "1px solid #d3dbe9",
                  borderRadius: "10px",
                  boxShadow: "0 4px 16px rgba(56, 70, 110, 0.15)",
                  width: "max-content",
                  minWidth: "220px",
                  maxWidth: getResponsivePanelWidth(320),
                  maxHeight: getResponsivePanelMaxHeight(520),
                  overflowY: "auto",
                  overflowX: "hidden",
                  boxSizing: "border-box",
                }}
              >
                <button
                  ref={exportButtonRef}
                  type="button"
                  role="menuitem"
                  className="menu-item-button app-focus-ring"
                  onClick={handleExport}
                  onMouseEnter={() => closeScenarioMenu()}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 16px",
                    textAlign: "left",
                    border: "none",
                    cursor: "pointer",
                    color: "#26324a",
                    fontSize: "13px",
                    fontWeight: 500,
                    borderBottom: "1px solid #f0f3fa",
                    background: "transparent",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t("menu.saveConfiguration")}
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="menu-item-button app-focus-ring"
                  onClick={handleImportClick}
                  onMouseEnter={() => closeScenarioMenu()}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 16px",
                    textAlign: "left",
                    border: "none",
                    cursor: "pointer",
                    color: "#26324a",
                    fontSize: "13px",
                    fontWeight: 500,
                    borderBottom: "1px solid #f0f3fa",
                    background: "transparent",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t("menu.loadConfiguration")}
                </button>

                <button
                  ref={scenarioButtonRef}
                  id={scenarioButtonId}
                  type="button"
                  role="menuitem"
                  className="menu-item-button app-focus-ring"
                  aria-haspopup="menu"
                  aria-expanded={configMenuOpen}
                  aria-controls={scenarioGroupId}
                  onClick={handleScenarioToggle}
                  onMouseEnter={() => openScenarioMenu()}
                  style={{
                    display: "flex",
                    width: "100%",
                    padding: "10px 16px",
                    textAlign: "left",
                    border: "none",
                    cursor: "pointer",
                    color: "#26324a",
                    fontSize: "13px",
                    fontWeight: 500,
                    background: configMenuOpen ? "#f7f9fc" : "transparent",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  <span>{t("menu.realScenarios")}</span>
                  <span aria-hidden="true">{">"}</span>
                </button>
              </div>

              {configMenuOpen && (
                <div
                  id={scenarioGroupId}
                  role="menu"
                  aria-label={t("menu.submenuAriaLabel")}
                  aria-labelledby={scenarioButtonId}
                  style={{
                    display: "grid",
                    gap: "6px",
                    padding: "10px 12px 12px",
                    background: "#f9fbff",
                    border: "1px solid #d3dbe9",
                    borderRadius: "10px",
                    boxShadow: "0 4px 16px rgba(56, 70, 110, 0.15)",
                    minWidth: "260px",
                    width: "max-content",
                    maxWidth: getResponsivePanelWidth(380),
                    maxHeight: getResponsivePanelMaxHeight(520),
                    overflowY: "auto",
                    overflowX: "hidden",
                    boxSizing: "border-box",
                    marginTop: submenuLayout.placement === "side" ? `${submenuLayout.top}px` : 0,
                  }}
                >
                  {localizedPresets.map(({ preset, localized }) => (
                    <button
                      key={localized.id}
                      type="button"
                      role="menuitem"
                      data-menu-scenario-item="true"
                      className="menu-item-button app-focus-ring"
                      onClick={() => handleLoadScenarioPreset(preset)}
                      title={localized.application}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 12px",
                        textAlign: "left",
                        border: "1px solid #dbe5f3",
                        background: "#ffffff",
                        borderRadius: "8px",
                        cursor: "pointer",
                        color: "#26324a",
                        fontSize: "12px",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {localized.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {children}

        <FaultSimulator dispatch={dispatch} faultCode={hmiState.faultCode} />

        {feedback && (
          <div
            aria-live="polite"
            style={{
              fontSize: "12px",
              color: feedback.tone === "error" ? "#a82e2e" : "#2d8844",
              fontWeight: 500,
              maxWidth: "min(100%, 280px)",
            }}
          >
            {feedback.message}
          </div>
        )}
      </div>

      <div
        className="app-header-title"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          order: 2,
          marginLeft: "auto",
          textAlign: "right",
          alignItems: "flex-end",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 700,
            color: "#26324a",
          }}
        >
          {t("app.title")}
        </h1>
        {activeScenario?.name && (
          <div
            title={
              hmiState.scenarioWarnings?.length
                ? hmiState.scenarioWarnings.join("\n")
                : activeScenario.application || activeScenario.name
            }
            style={{
              display: "inline-flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              color: "#48607f",
              fontWeight: 600,
              maxWidth: "100%",
            }}
          >
            <span>
              {t("header.activePreset", { name: activeScenario.name })}
            </span>
            {hmiState.scenarioUi?.mode && (
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: "#eef4ff",
                  border: "1px solid #d6e3fb",
                  color: "#33517d",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {getLocalizedScenarioModeLabel(hmiState.scenarioUi.mode, t)}
              </span>
            )}
            {hmiState.scenarioWarnings?.length > 0 && (
              <span style={{ color: "#8a5a00" }}>
                {t("header.documentaryNotes", {
                  count: hmiState.scenarioWarnings.length,
                })}
              </span>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
