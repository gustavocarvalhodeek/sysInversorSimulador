import React, { Suspense, lazy, useEffect, useId, useRef, useState } from "react";
import { useI18n } from "../i18n/useI18n.js";
import { localizeParameter } from "../i18n/localizedContent.js";
import MotorStatusBar from "./MotorStatusBar.jsx";
import {
  canEditParameter,
  formatParameterValue,
  getAccessBadges,
} from "../hmi/parameters/parameterHelpers.js";
import ParameterTabs from "./parameter-info/ParameterTabs.jsx";
import ParameterInfoToolbar from "./parameter-info/ParameterInfoToolbar.jsx";
import ParameterInfoHeader from "./parameter-info/ParameterInfoHeader.jsx";
import ParameterOverviewTab from "./parameter-info/ParameterOverviewTab.jsx";
import ParameterFileActions from "./parameter-info/ParameterFileActions.jsx";

const LazyParameterQuickList = lazy(() =>
  import("./parameter-info/ParameterQuickList.jsx"),
);
const LazyParameterStatusTab = lazy(() =>
  import("./parameter-info/ParameterStatusTab.jsx"),
);
const LazyParameterTechnicalTab = lazy(() =>
  import("./parameter-info/ParameterTechnicalTab.jsx"),
);
const LazyParameterSimulationTab = lazy(() =>
  import("./parameter-info/ParameterSimulationTab.jsx"),
);

function ParameterLazyFallback({ label }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        padding: "14px 16px",
        border: "1px solid #dce3ef",
        borderRadius: "12px",
        background: "#f6f8fc",
        color: "#53627e",
        fontSize: "13px",
      }}
    >
      {label}
    </div>
  );
}

export default function ParameterInfoPanel({
  parameter,
  hmiState,
  onSelectParameter,
  dispatch,
}) {
  const { t, currentLanguage } = useI18n();
  const [activeTab, setActiveTab] = useState("parametro");
  const [quickListOpen, setQuickListOpen] = useState(false);
  const tabIdBase = useId();
  const quickListButtonRef = useRef(null);
  const localizedParameter = localizeParameter(parameter, currentLanguage);

  useEffect(() => {
    setActiveTab("parametro");
  }, [parameter.code]);

  const tabs = [
    { id: "parametro", label: t("parameterInfo.tabs.parameter") },
    { id: "status", label: t("parameterInfo.tabs.status") },
    { id: "tecnico", label: t("parameterInfo.tabs.technical") },
    { id: "simulacao", label: t("parameterInfo.tabs.simulation") },
  ];

  const badges = getAccessBadges(parameter, hmiState);
  const verdict = canEditParameter(parameter, hmiState);
  const currentValue = `${formatParameterValue(localizedParameter, localizedParameter.value)}${
    localizedParameter.unit ? ` ${localizedParameter.unit}` : ""
  }`;
  const accessLabel =
    localizedParameter.access === "editavel"
      ? t("parameterInfo.accessEditable")
      : localizedParameter.access === "somente_leitura"
        ? t("parameterInfo.accessReadOnly")
        : localizedParameter.access;
  const getTabId = (tabId) => `${tabIdBase}-tab-${tabId}`;
  const getPanelId = (tabId) => `${tabIdBase}-panel-${tabId}`;

  let activeTabContent = null;

  if (activeTab === "parametro") {
    activeTabContent = (
      <ParameterOverviewTab
        parameter={localizedParameter}
        currentValue={currentValue}
        accessLabel={accessLabel}
      />
    );
  } else if (activeTab === "status") {
    activeTabContent = (
      <LazyParameterStatusTab hmiState={hmiState} dispatch={dispatch} />
    );
  } else if (activeTab === "tecnico") {
    activeTabContent = <LazyParameterTechnicalTab parameter={localizedParameter} />;
  } else if (activeTab === "simulacao") {
    activeTabContent = (
      <LazyParameterSimulationTab
        parameter={localizedParameter}
        onSelectParameter={onSelectParameter}
      />
    );
  }

  return (
    <aside
      style={{
        width: "min(92vw, 620px)",
        padding: "26px",
        boxSizing: "border-box",
        border: "1px solid #d7ddea",
        borderRadius: "18px",
        background: "rgba(255,255,255,0.97)",
        boxShadow: "0 18px 42px rgba(56, 70, 110, 0.12)",
        color: "#26324a",
      }}
    >
      <ParameterInfoToolbar
        hmiState={hmiState}
        onSelectParameter={onSelectParameter}
        onOpenQuickList={() => setQuickListOpen(true)}
        quickListButtonRef={quickListButtonRef}
      />
      <ParameterFileActions
        parameters={hmiState.parameters}
        onImport={(snapshot) =>
          dispatch({ type: "IMPORT_CONFIGURATION", snapshot })
        }
      />
      <ParameterInfoHeader
        parameter={localizedParameter}
        badges={badges}
        verdict={verdict}
      />

      <MotorStatusBar hmiState={hmiState} dispatch={dispatch} />

      <ParameterTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        ariaLabel={t("parameterInfo.tabsAriaLabel")}
        getTabId={getTabId}
        getPanelId={getPanelId}
      />

      <div
        role="tabpanel"
        id={getPanelId(activeTab)}
        aria-labelledby={getTabId(activeTab)}
      >
        <Suspense fallback={<ParameterLazyFallback label={t("parameterInfo.loadingTab")} />}>
          {activeTabContent}
        </Suspense>
      </div>

      {quickListOpen ? (
        <Suspense
          fallback={
            <ParameterLazyFallback label={t("parameterInfo.loadingQuickList")} />
          }
        >
          <LazyParameterQuickList
            open={quickListOpen}
            onClose={() => setQuickListOpen(false)}
            onSelect={onSelectParameter}
            activeCode={parameter.code}
            hmiState={hmiState}
            triggerRef={quickListButtonRef}
          />
        </Suspense>
      ) : null}
    </aside>
  );
}
