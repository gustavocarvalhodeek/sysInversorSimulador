import React, { useId } from "react";
import { useI18n } from "../i18n/useI18n.js";

const VISUALLY_HIDDEN_STYLE = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export default function LanguageSelector() {
  const { availableLanguages, language, setLanguage, t } = useI18n();
  const selectId = useId();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: "38px",
      }}
    >
      <label htmlFor={selectId} style={VISUALLY_HIDDEN_STYLE}>
        {t("header.languageLabel")}
      </label>
      <select
        id={selectId}
        value={language}
        aria-label={t("header.languageSelectorAriaLabel")}
        onChange={(event) => setLanguage(event.target.value)}
        className="app-focus-ring"
        style={{
          minHeight: "38px",
          minWidth: "76px",
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid #d3dbe9",
          background: "#f5f8fd",
          color: "#27406b",
          fontWeight: 700,
          fontSize: "13px",
          cursor: "pointer",
        }}
      >
        {availableLanguages.map((availableLanguage) => (
          <option key={availableLanguage.code} value={availableLanguage.code}>
            {availableLanguage.shortLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
