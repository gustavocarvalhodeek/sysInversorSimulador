import React, { useRef, useState } from "react";
import { useI18n } from "../../i18n/useI18n.js";
import { createConfigurationFilePayload } from "../../utils/persistence.js";
import {
  consumeSelectedConfigurationFile,
  downloadConfigurationPayload,
  getConfigurationFileErrorTranslationKey,
  openConfigurationFilePicker,
  readConfigurationSnapshotFromFile,
} from "../../utils/configurationFileActions.js";

function ActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
      {children}
    </button>
  );
}

export default function ParameterFileActions({ parameters, onImport }) {
  const { t } = useI18n();
  const inputRef = useRef(null);
  const [feedback, setFeedback] = useState("");

  const handleExport = () => {
    const payload = createConfigurationFilePayload(parameters);
    downloadConfigurationPayload(payload);
    setFeedback(t("parameterInfo.fileSaved"));
  };

  const handleImportClick = () => {
    openConfigurationFilePicker(inputRef);
  };

  const handleFileChange = async (event) => {
    const file = consumeSelectedConfigurationFile(event);
    if (!file) {
      return;
    }

    try {
      const snapshot = await readConfigurationSnapshotFromFile(file);
      onImport(snapshot);
      setFeedback(t("parameterInfo.fileLoaded", { count: Object.keys(snapshot).length }));
    } catch (error) {
      setFeedback(t(getConfigurationFileErrorTranslationKey(error)));
    }
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <ActionButton onClick={handleExport}>{t("parameterInfo.fileSave")}</ActionButton>
        <ActionButton onClick={handleImportClick}>{t("parameterInfo.fileLoad")}</ActionButton>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {feedback ? (
        <div
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: "#5f6b82",
          }}
        >
          {feedback}
        </div>
      ) : null}
    </div>
  );
}
