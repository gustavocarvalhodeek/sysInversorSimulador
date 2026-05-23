import React from "react";
import { useI18n } from "../../i18n/useI18n.js";
import ParameterRelatedList from "./ParameterRelatedList.jsx";
import { Field, Grid, Section } from "./ParameterInfoPrimitives.jsx";
import { resolveSimulationTabModel } from "./simulationContent.js";

export default function ParameterSimulationTab({
  parameter,
  onSelectParameter,
}) {
  const { t } = useI18n();
  const simulationModel = resolveSimulationTabModel(parameter, t);

  return (
    <div>
      <Grid>
        <Field
          label={t("parameterInfo.simulatorSupport")}
          value={simulationModel.implementationStatusLabel}
        />
        <Field
          label={t("parameterInfo.implementedEffects")}
          value={simulationModel.simulationEffectsText}
        />
      </Grid>
      <Section title={simulationModel.primaryTitle}>
        <p
          style={{
            margin: 0,
            color: "#4b5569",
            fontSize: "15px",
            lineHeight: 1.6,
          }}
        >
          {simulationModel.primaryText}
        </p>
      </Section>
      {simulationModel.statusMessage ? (
        <Section title={t("parameterInfo.currentSituation")}>
          <p
            style={{
              margin: 0,
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#fff8e8",
              border: "1px solid #ead8a2",
              color: "#72541f",
              fontSize: "14px",
              lineHeight: 1.55,
            }}
          >
            {simulationModel.statusMessage}
          </p>
        </Section>
      ) : null}
      {simulationModel.generalDescriptionText ? (
        <Section title={t("parameterInfo.generalDescription")}>
          <p
            style={{
              margin: 0,
              color: "#4b5569",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            {simulationModel.generalDescriptionText}
          </p>
        </Section>
      ) : null}
      {parameter.example ? (
        <Section title={t("parameterInfo.practicalExample")}>
          <p
            style={{
              margin: 0,
              padding: "14px 16px",
              borderRadius: "10px",
              background: "#f3f7fd",
              border: "1px solid #dce6f5",
              color: "#33405a",
              fontSize: "14px",
              lineHeight: 1.55,
            }}
          >
            {parameter.example}
          </p>
        </Section>
      ) : null}
      {parameter.relatedParameters?.length > 0 ? (
        <Section title={t("parameterInfo.relatedParameters")}>
          <ParameterRelatedList
            codes={parameter.relatedParameters}
            onSelect={onSelectParameter}
          />
        </Section>
      ) : null}
    </div>
  );
}
