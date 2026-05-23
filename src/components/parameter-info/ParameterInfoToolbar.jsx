import React from "react";
import { useI18n } from "../../i18n/useI18n.js";
import ParameterSearch from "./ParameterSearch.jsx";

export default function ParameterInfoToolbar({
  hmiState,
  onSelectParameter,
  onOpenQuickList,
  quickListButtonRef,
}) {
  const { t } = useI18n();

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        marginBottom: "16px",
      }}
    >
      <div style={{ flex: 1 }}>
        <ParameterSearch onSelect={onSelectParameter} hmiState={hmiState} />
      </div>
      <button
        ref={quickListButtonRef}
        type="button"
        onClick={onOpenQuickList}
        style={{
          border: "1px solid #d3dbe9",
          background: "#f5f8fd",
          borderRadius: "10px",
          padding: "10px 14px",
          cursor: "pointer",
          color: "#27406b",
          fontWeight: 700,
          fontSize: "13px",
          whiteSpace: "nowrap",
        }}
      >
        {t("parameterInfo.parameterListButton")}
      </button>
    </div>
  );
}
