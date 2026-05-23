import React, { useRef } from "react";
import { getWrappedFocusIndex } from "../accessibilityHelpers.js";

export default function ParameterTabs({
  tabs,
  activeTab,
  onChange,
  ariaLabel = "Abas de informacoes do parametro",
  getTabId = (tabId) => `parameter-tab-${tabId}`,
  getPanelId = (tabId) => `parameter-panel-${tabId}`,
}) {
  const tabRefs = useRef(new Map());

  const focusTab = (tabId) => {
    tabRefs.current.get(tabId)?.focus?.();
  };

  const handleTabKeyDown = (event, index) => {
    let nextIndex = -1;

    if (event.key === "ArrowRight") {
      nextIndex = getWrappedFocusIndex(index, 1, tabs.length);
    } else if (event.key === "ArrowLeft") {
      nextIndex = getWrappedFocusIndex(index, -1, tabs.length);
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();

    const nextTab = tabs[nextIndex];
    if (!nextTab) {
      return;
    }

    onChange(nextTab.id);
    focusTab(nextTab.id);
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      style={{
        display: "flex",
        gap: "6px",
        padding: "4px",
        background: "#eef1f6",
        borderRadius: "12px",
        marginBottom: "18px",
      }}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={(element) => {
              if (element) {
                tabRefs.current.set(tab.id, element);
                return;
              }

              tabRefs.current.delete(tab.id);
            }}
            id={getTabId(tab.id)}
            type="button"
            role="tab"
            tabIndex={isActive ? 0 : -1}
            aria-selected={isActive}
            aria-controls={getPanelId(tab.id)}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            style={{
              flex: 1,
              padding: "9px 12px",
              fontSize: "13px",
              fontWeight: 700,
              border: "none",
              borderRadius: "9px",
              cursor: "pointer",
              color: isActive ? "#1b2740" : "#6b7487",
              background: isActive ? "#ffffff" : "transparent",
              boxShadow: isActive ? "0 2px 8px rgba(40,55,90,0.12)" : "none",
              transition: "background 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
