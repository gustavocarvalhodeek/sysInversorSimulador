import {
  clampNumber,
  isFiniteNumber,
  sanitizeBoolean,
  sanitizeDigitalInputs,
  sanitizeExternalSources,
  sanitizeIxtPercent,
  sanitizeLoadPercent,
  sanitizeModuleTemperature,
  sanitizeOutputFrequency,
  sanitizeParameterValue,
  sanitizeReferenceFrequency,
} from "../utils/sanitizers.js";

export { DEFAULT_EXTERNAL_SOURCES } from "../utils/sanitizers.js";

export const DEFAULT_SCENARIO_UI = {
  mode: "default",
  showAllParameters: true,
  showAdvancedDetails: true,
  showRelatedParameters: true,
  allowEditing: true,
  lockedAdvancedParameters: false,
  editAttemptMessage: "",
  visibleParameters: null,
};

function toSlug(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeParameterSnapshot(snapshot, parameterMap, warnings) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return {};
  }

  const sanitized = {};
  const unknownCodes = [];
  const invalidValues = [];

  for (const [code, value] of Object.entries(snapshot)) {
    const parameter = parameterMap[code];
    if (!parameter) {
      unknownCodes.push(code);
      continue;
    }

    if (!isFiniteNumber(value)) {
      invalidValues.push(code);
      continue;
    }

    sanitized[code] = sanitizeParameterValue(parameter, value, parameter.value);
  }

  if (unknownCodes.length > 0) {
    warnings.push(
      `Preset ignorou parâmetros desconhecidos: ${unknownCodes.join(", ")}.`,
    );
  }
  if (invalidValues.length > 0) {
    warnings.push(
      `Preset ignorou valores inválidos em: ${invalidValues.join(", ")}.`,
    );
  }

  return sanitized;
}

function sanitizeVisibleParameters(visibleParameters, parameterMap, warnings) {
  if (!Array.isArray(visibleParameters)) {
    return null;
  }

  const validCodes = [];
  const unknownCodes = [];

  for (const code of visibleParameters) {
    if (typeof code !== "string") {
      continue;
    }
    if (!parameterMap[code]) {
      unknownCodes.push(code);
      continue;
    }
    if (!validCodes.includes(code)) {
      validCodes.push(code);
    }
  }

  if (unknownCodes.length > 0) {
    warnings.push(
      `Preset ignorou parâmetros de UI inexistentes: ${unknownCodes.join(", ")}.`,
    );
  }

  return validCodes.length > 0 ? validCodes : null;
}

function sanitizeScenarioUi(ui, parameterMap, warnings) {
  if (!ui || typeof ui !== "object" || Array.isArray(ui)) {
    return null;
  }

  const nextUi = {};

  if (typeof ui.mode === "string" && ui.mode.trim()) {
    nextUi.mode = ui.mode.trim();
  }
  if (typeof ui.showAllParameters === "boolean") {
    nextUi.showAllParameters = ui.showAllParameters;
  }
  if (typeof ui.showAdvancedDetails === "boolean") {
    nextUi.showAdvancedDetails = ui.showAdvancedDetails;
  }
  if (typeof ui.showRelatedParameters === "boolean") {
    nextUi.showRelatedParameters = ui.showRelatedParameters;
  }
  if (typeof ui.allowEditing === "boolean") {
    nextUi.allowEditing = ui.allowEditing;
  }
  if (typeof ui.lockedAdvancedParameters === "boolean") {
    nextUi.lockedAdvancedParameters = ui.lockedAdvancedParameters;
  }
  if (typeof ui.editAttemptMessage === "string" && ui.editAttemptMessage.trim()) {
    nextUi.editAttemptMessage = ui.editAttemptMessage.trim();
  }

  const visibleParameters = sanitizeVisibleParameters(
    ui.visibleParameters,
    parameterMap,
    warnings,
  );
  if (visibleParameters !== null) {
    nextUi.visibleParameters = visibleParameters;
    if (typeof nextUi.showAllParameters !== "boolean") {
      nextUi.showAllParameters = false;
    }
  }

  if (Object.keys(nextUi).length === 0) {
    return null;
  }

  return {
    ...DEFAULT_SCENARIO_UI,
    ...nextUi,
  };
}

function sanitizeScenarioSimulation(simulation, warnings) {
  if (!simulation || typeof simulation !== "object" || Array.isArray(simulation)) {
    return {};
  }

  const nextSimulation = {};
  const unsupportedKeys = [];

  for (const [key, value] of Object.entries(simulation)) {
    switch (key) {
      case "running":
        nextSimulation.running = sanitizeBoolean(value, false);
        break;
      case "referenceFrequency":
        nextSimulation.referenceFrequency = clampNumber(value, 0, 3000, undefined);
        break;
      case "outputFrequency":
        nextSimulation.outputFrequency = clampNumber(value, -3000, 3000, undefined);
        break;
      case "mechanicalHz":
        nextSimulation.mechanicalHz = clampNumber(value, -3000, 3000, undefined);
        break;
      case "loadPercent":
        nextSimulation.loadPercent = sanitizeLoadPercent(value, undefined);
        break;
      case "ixtPercent":
        nextSimulation.ixtPercent = sanitizeIxtPercent(value, undefined);
        break;
      case "moduleTemperature":
        nextSimulation.moduleTemperature = sanitizeModuleTemperature(value, undefined);
        break;
      case "undervoltage":
        nextSimulation.undervoltage = sanitizeBoolean(value, false);
        break;
      case "emergencyStop":
        nextSimulation.emergencyStop = sanitizeBoolean(value, false);
        break;
      case "isCoasting":
        nextSimulation.isCoasting = sanitizeBoolean(value, false);
        break;
      case "electricalOutputActive":
        nextSimulation.electricalOutputActive = sanitizeBoolean(value, false);
        break;
      case "digitalInputs":
        if (Array.isArray(value)) {
          nextSimulation.digitalInputs = sanitizeDigitalInputs(value);
        }
        break;
      case "externalSources":
        if (value && typeof value === "object" && !Array.isArray(value)) {
          nextSimulation.externalSources = sanitizeExternalSources(value);
        }
        break;
      case "autoStart":
        if (sanitizeBoolean(value, false)) {
          nextSimulation.automationCycle = "acceleration";
          nextSimulation.automationStartTime = Date.now();
          nextSimulation.running = true;
        }
        break;
      case "autoStop":
      case "repeat":
        // Já compatível com o único ciclo automático suportado hoje.
        break;
      case "holdTimeAtReferenceSeconds":
        unsupportedKeys.push(key);
        break;
      default:
        unsupportedKeys.push(key);
        break;
    }
  }

  if (unsupportedKeys.length > 0) {
    warnings.push(
      `Preset manteve como documentação os campos de simulação: ${unsupportedKeys.join(", ")}.`,
    );
  }

  return nextSimulation;
}

function sanitizeSimulatedReadings(simulatedReadings, warnings) {
  if (
    !simulatedReadings ||
    typeof simulatedReadings !== "object" ||
    Array.isArray(simulatedReadings)
  ) {
    return { seededState: {}, documentalCodes: [] };
  }

  const seededState = {};
  const documentalCodes = [];

  if (isFiniteNumber(simulatedReadings.P001)) {
    seededState.referenceFrequency = sanitizeReferenceFrequency(
      simulatedReadings.P001,
      { P133: { value: 0 }, P134: { value: 3000 } },
      undefined,
    );
  }
  if (isFiniteNumber(simulatedReadings.P005)) {
    seededState.outputFrequency = sanitizeOutputFrequency(
      simulatedReadings.P005,
      { P134: { value: 3000 } },
      undefined,
    );
    seededState.mechanicalHz = seededState.outputFrequency;
  }
  if (isFiniteNumber(simulatedReadings.P009)) {
    seededState.loadPercent = sanitizeLoadPercent(simulatedReadings.P009, undefined);
  }
  if (isFiniteNumber(simulatedReadings.P030)) {
    seededState.moduleTemperature = sanitizeModuleTemperature(
      simulatedReadings.P030,
      undefined,
    );
  }
  if (isFiniteNumber(simulatedReadings.P037)) {
    seededState.ixtPercent = sanitizeIxtPercent(simulatedReadings.P037, undefined);
  }

  if (typeof simulatedReadings.P006 === "string") {
    const normalized = simulatedReadings.P006.trim().toLowerCase();
    if (normalized === "run") {
      seededState.running = true;
    } else if (normalized === "rdy" || normalized === "ready") {
      seededState.running = false;
    }
  }

  const supportedCodes = new Set(["P001", "P005", "P006", "P009", "P030", "P037"]);
  for (const code of Object.keys(simulatedReadings)) {
    if (!supportedCodes.has(code)) {
      documentalCodes.push(code);
    }
  }

  if (documentalCodes.length > 0) {
    warnings.push(
      `Preset usou simulatedReadings como semente de estado; leituras ${documentalCodes.join(", ")} ficaram documentais.`,
    );
  }

  return { seededState, documentalCodes };
}

export function getScenarioPresetId(preset) {
  const explicitId =
    preset?.id ??
    preset?.scenario?.id ??
    preset?.scenario?.name ??
    preset?.name ??
    "cenario";
  return toSlug(explicitId) || "cenario";
}

export function normalizeScenarioPreset(preset, parameterMap) {
  const warnings = [];
  const scenario = preset?.scenario && typeof preset.scenario === "object"
    ? preset.scenario
    : {};

  const parameterSnapshot = sanitizeParameterSnapshot(
    preset?.parameters,
    parameterMap,
    warnings,
  );
  const scenarioUi = sanitizeScenarioUi(preset?.ui, parameterMap, warnings);
  const { seededState, documentalCodes } = sanitizeSimulatedReadings(
    preset?.simulatedReadings,
    warnings,
  );
  const scenarioSimulation = {
    ...seededState,
    ...sanitizeScenarioSimulation(preset?.simulation, warnings),
  };

  return {
    id: getScenarioPresetId(preset),
    name:
      typeof scenario.name === "string" && scenario.name.trim()
        ? scenario.name.trim()
        : "Preset sem nome",
    application:
      typeof scenario.application === "string" ? scenario.application.trim() : "",
    notes: Array.isArray(scenario.notes)
      ? scenario.notes.filter(
          (note) => typeof note === "string" && note.trim().length > 0,
        )
      : [],
    parameterSnapshot,
    scenarioSimulation,
    scenarioUi,
    documentalReadings: documentalCodes,
    warnings,
  };
}
