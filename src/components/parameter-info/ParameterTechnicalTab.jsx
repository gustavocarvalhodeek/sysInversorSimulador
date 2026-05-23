import React from "react";
import { useI18n } from "../../i18n/useI18n.js";
import { Field, Grid, Section } from "./ParameterInfoPrimitives.jsx";

export default function ParameterTechnicalTab({ parameter }) {
  const { t } = useI18n();
  const yesNo = (value) => (value ? t("common.yes") : t("common.no"));
  const accessoryKey = `parameterInfo.accessory.${parameter.requiresAccessory}`;
  const accessoryLabel = t(accessoryKey);
  const difficultyKey = `parameterInfo.difficultyLevel.${parameter.difficulty}`;
  const difficultyLabel =
    parameter.difficulty && t(difficultyKey) !== difficultyKey
      ? t(difficultyKey)
      : parameter.difficulty;

  return (
    <div>
      <Section title={t("parameterInfo.detailedDescription")}>
        <p
          style={{
            margin: 0,
            color: "#4b5569",
            fontSize: "15px",
            lineHeight: 1.6,
          }}
        >
          {parameter.longDescription || parameter.description}
        </p>
      </Section>
      <Grid>
        <Field label={t("parameterInfo.category")} value={parameter.categoryLabel} />
        <Field label={t("parameterInfo.unit")} value={parameter.unit} />
        <Field label={t("parameterInfo.readOnly")} value={yesNo(parameter.readOnly)} />
        <Field label={t("parameterInfo.editable")} value={yesNo(parameter.editable)} />
        <Field
          label={t("parameterInfo.requiresStoppedMotor")}
          value={yesNo(parameter.requiresStoppedMotor)}
        />
        <Field
          label={t("parameterInfo.requiresAccessory")}
          value={
            parameter.requiresAccessory
              ? accessoryLabel === accessoryKey
                ? t("common.yes")
                : accessoryLabel
              : t("common.no")
          }
        />
        <Field label={t("parameterInfo.difficulty")} value={difficultyLabel} />
        <Field label={t("parameterInfo.editCondition")} value={parameter.editCondition} />
      </Grid>
    </div>
  );
}
