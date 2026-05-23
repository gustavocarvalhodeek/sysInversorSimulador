import React, { useId, useMemo, useState } from "react";
import { useI18n } from "../../i18n/useI18n.js";
import { localizeParameter } from "../../i18n/localizedContent.js";
import { searchParameters } from "../../hmi/parameters/parameterHelpers.js";

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

export default function ParameterSearch({ onSelect, hmiState }) {
  const { t, currentLanguage } = useI18n();
  const [query, setQuery] = useState("");
  const searchInputId = useId();
  const resultsListId = useId();
  const searchHintId = useId();
  const results = useMemo(
    () =>
      searchParameters(query, 8, hmiState, currentLanguage).map((parameter) =>
        localizeParameter(parameter, currentLanguage),
      ),
    [currentLanguage, query, hmiState],
  );

  return (
    <div style={{ position: "relative" }}>
      <label htmlFor={searchInputId} style={VISUALLY_HIDDEN_STYLE}>
        {t("parameterInfo.searchLabel")}
      </label>
      <span id={searchHintId} style={VISUALLY_HIDDEN_STYLE}>
        {t("parameterInfo.searchHint")}
      </span>
      <input
        id={searchInputId}
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-describedby={searchHintId}
        aria-controls={query ? resultsListId : undefined}
        placeholder={t("parameterInfo.searchPlaceholder")}
        autoComplete="off"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "10px 14px",
          fontSize: "14px",
          borderRadius: "10px",
          border: "1px solid #d3dbe9",
          background: "#f7f9fc",
          color: "#26324a",
          outline: "none",
        }}
      />
      {query && results.length > 0 ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 5,
            maxHeight: "260px",
            overflowY: "auto",
            background: "#ffffff",
            border: "1px solid #d3dbe9",
            borderRadius: "12px",
            boxShadow: "0 16px 36px rgba(40,55,90,0.16)",
          }}
        >
          <ul
            id={resultsListId}
            role="list"
            aria-label={t("parameterInfo.searchResultsAria")}
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {results.map((parameter) => (
              <li key={parameter.code}>
                <button
                  type="button"
                  aria-label={t("parameterInfo.selectParameterAria", {
                    code: parameter.code,
                    name: parameter.name,
                  })}
                  onClick={() => {
                    onSelect(parameter.code);
                    setQuery("");
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 14px",
                    border: "none",
                    borderBottom: "1px solid #eef1f6",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#26324a",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{parameter.code}</span>
                  <span style={{ color: "#4b5569" }}> - {parameter.name}</span>
                  <div style={{ fontSize: "11px", color: "#8a93a5" }}>
                    {parameter.categoryLabel}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {query && results.length === 0 ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 5,
            padding: "12px 14px",
            background: "#ffffff",
            border: "1px solid #d3dbe9",
            borderRadius: "12px",
            color: "#8a93a5",
            fontSize: "13px",
          }}
        >
          {t("parameterInfo.noResults")}
        </div>
      ) : null}
    </div>
  );
}
