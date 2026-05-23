import { DEFAULT_LANGUAGE } from "../../i18n/languages.js";
import { translate } from "../../i18n/translations.js";
import { IMPLEMENTATION_STATUS } from "../../hmi/parameters/cfw100ParameterSimulationSupport.js";
import { isValueMissing } from "./valueFormatting.js";

function getDefaultTranslator() {
  return (key, params) => translate(DEFAULT_LANGUAGE, key, params);
}

function getFirstNonMissingValue(...values) {
  return values.find((value) => !isValueMissing(value)) ?? "";
}

export function getSimulationEffectsText(parameter, t = getDefaultTranslator()) {
  const effects = Array.isArray(parameter.simulationEffects)
    ? parameter.simulationEffects
    : [];

  return effects.length > 0
    ? effects
        .map((effect) => {
          const key = `parameterInfo.simulationEffect.${effect}`;
          const translated = t(key);
          return translated === key ? effect : translated;
        })
        .join(", ")
    : t("parameterInfo.noImplementedEffects");
}

export function getImplementationStatusLabel(parameter, t = getDefaultTranslator()) {
  const key = `parameterInfo.implementationStatus.${parameter.implementationStatus}`;
  const translated = t(key);
  return translated === key ? parameter.implementationStatus : translated;
}

export function resolveSimulationTabModel(parameter, t = getDefaultTranslator()) {
  const specificSimulationText = getFirstNonMissingValue(
    parameter.simulatorBehavior,
    parameter.simulationBehavior,
    parameter.simulationNotes,
  );
  const generalDescription = getFirstNonMissingValue(
    parameter.longDescription,
    parameter.description,
  );
  const statusKey = `parameterInfo.simulationStatusMessage.${parameter.implementationStatus}`;
  const translatedStatusMessage = t(statusKey);
  const statusMessage =
    translatedStatusMessage === statusKey
      ? t("parameterInfo.simulationStatusMessage.undefined")
      : translatedStatusMessage;

  let primaryTitle = t("parameterInfo.simulationPrimaryTitle");
  let primaryText = specificSimulationText;

  if (isValueMissing(primaryText)) {
    primaryText = statusMessage;
  }

  if (
    !isValueMissing(specificSimulationText) &&
    (parameter.implementationStatus === IMPLEMENTATION_STATUS.CATALOG_ONLY ||
      parameter.implementationStatus === IMPLEMENTATION_STATUS.EDITABLE_WITHOUT_EFFECT)
  ) {
    primaryTitle = t("parameterInfo.documentedBehaviorTitle");
  }

  const showStatusMessage =
    primaryText !== statusMessage &&
    (isValueMissing(specificSimulationText) ||
      parameter.implementationStatus === IMPLEMENTATION_STATUS.PARTIAL ||
      parameter.implementationStatus === IMPLEMENTATION_STATUS.READ_ONLY_SUPPORTED ||
      parameter.implementationStatus === IMPLEMENTATION_STATUS.EDITABLE_WITHOUT_EFFECT ||
      parameter.implementationStatus === IMPLEMENTATION_STATUS.CATALOG_ONLY);

  const generalDescriptionText =
    !isValueMissing(generalDescription) && generalDescription !== primaryText
      ? generalDescription
      : "";

  return {
    implementationStatusLabel: getImplementationStatusLabel(parameter, t),
    simulationEffectsText: getSimulationEffectsText(parameter, t),
    primaryTitle,
    primaryText,
    statusMessage: showStatusMessage ? statusMessage : "",
    generalDescriptionText,
    hasSpecificSimulationText: !isValueMissing(specificSimulationText),
  };
}
