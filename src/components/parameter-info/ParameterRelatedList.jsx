import React from "react";
import { useI18n } from "../../i18n/useI18n.js";
import { localizeParameter } from "../../i18n/localizedContent.js";
import { getParameterByCode } from "../../hmi/parameters/parameterHelpers.js";

export default function ParameterRelatedList({ codes, onSelect }) {
  const { currentLanguage } = useI18n();

  if (!codes || codes.length === 0) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {codes.map((code) => {
        const relatedParameter = getParameterByCode(code);
        const related = relatedParameter
          ? localizeParameter(relatedParameter, currentLanguage)
          : null;
        return (
          <button
            key={code}
            type="button"
            title={related ? related.name : code}
            onClick={() => onSelect(code)}
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "2px",
              padding: "8px 12px",
              borderRadius: "10px",
              border: "1px solid #d3dbe9",
              background: "#f5f8fd",
              cursor: "pointer",
              color: "#27406b",
              minWidth: "76px",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "14px" }}>{code}</span>
            {related ? (
              <span style={{ fontSize: "11px", color: "#6b7487" }}>
                {related.name}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
