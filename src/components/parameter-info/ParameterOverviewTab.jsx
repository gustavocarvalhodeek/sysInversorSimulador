import React from "react";
import { useI18n } from "../../i18n/useI18n.js";
import { Field, Grid, Section } from "./ParameterInfoPrimitives.jsx";

export default function ParameterOverviewTab({
  parameter,
  currentValue,
  accessLabel,
}) {
  const { t } = useI18n();

  return (
    <div>
      <Section title={t("parameterInfo.overviewDescription")}>
        <p
          style={{
            margin: 0,
            color: "#4b5569",
            fontSize: "15px",
            lineHeight: 1.55,
          }}
        >
          {parameter.shortDescription}
        </p>
      </Section>
      <Grid>
        <Field label={t("parameterInfo.range")} value={parameter.range} />
        <Field label={t("parameterInfo.unit")} value={parameter.unit} />
        <Field label={t("parameterInfo.currentValue")} value={currentValue} />
        <Field
          label={t("parameterInfo.factoryDefault")}
          value={parameter.factoryDefault}
        />
        <Field label={t("parameterInfo.access")} value={accessLabel} />
        <Field label={t("parameterInfo.manualPage")} value={parameter.pageReference} />
      </Grid>
    </div>
  );
}
