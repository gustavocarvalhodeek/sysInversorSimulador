import React from "react";
import { useI18n } from "../../i18n/useI18n.js";
import ParameterBadge from "./ParameterBadge.jsx";

export default function ParameterInfoHeader({ parameter, badges, verdict }) {
  const { t } = useI18n();

  return (
    <>
      <div
        style={{
          fontSize: "12px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#6b7487",
          marginBottom: "8px",
        }}
      >
        {t("parameterInfo.selectedParameter")}
      </div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: "10px",
        }}
      >
        {parameter.code} - {parameter.name}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <ParameterBadge label={parameter.categoryLabel} tone="info" />
        {badges.map((badge) => (
          <ParameterBadge
            key={badge.key}
            label={badge.labelKey ? t(badge.labelKey) : badge.label}
            tone={badge.tone}
          />
        ))}
      </div>

      {!verdict.editable && verdict.reason ? (
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "12px 14px",
            marginBottom: "18px",
            borderRadius: "10px",
            background: "#fdf0d8",
            border: "1px solid #f0d9a8",
            color: "#8a5a00",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <span aria-hidden="true">!</span>
          <span>{verdict.reasonKey ? t(verdict.reasonKey) : verdict.reason}</span>
        </div>
      ) : null}
    </>
  );
}
