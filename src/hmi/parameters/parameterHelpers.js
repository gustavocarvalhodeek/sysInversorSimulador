import { isDriveStopped } from "../../logic/driveStatus.js";
import { localizeParameter } from "../../i18n/localizedContent.js";
import { CFW100_PARAMETER_CATALOG } from "./cfw100ParameterCatalog.js";
import { DIFFICULTY_LABEL } from "./cfw100ParameterEnrichment.js";

const CATALOG_BY_CODE = Object.fromEntries(
  CFW100_PARAMETER_CATALOG.map((parameter) => [parameter.code, parameter]),
);

const CATALOG_ORDER = CFW100_PARAMETER_CATALOG.map((parameter) => parameter.code);

// Acessorios instalados na configuracao simulada. Por padrao o CFW100 vem
// "standalone": sem expansao de I/O, sem CAN e sem modulo Bluetooth.
const ACCESSORY_AVAILABILITY = {
  expansao_io: false,
  can: false,
  bluetooth: false,
  expansao_io_ou_can: false,
};

export function getParameterByCode(code) {
  return CATALOG_BY_CODE[code] ?? null;
}

export function getParameterIndex(code) {
  return CATALOG_ORDER.indexOf(code);
}

export function getNextParameterCode(code) {
  const index = getParameterIndex(code);
  if (index < 0) {
    return CATALOG_ORDER[0];
  }
  return CATALOG_ORDER[(index + 1) % CATALOG_ORDER.length];
}

export function getPreviousParameterCode(code) {
  const index = getParameterIndex(code);
  if (index < 0) {
    return CATALOG_ORDER[0];
  }
  return CATALOG_ORDER[(index - 1 + CATALOG_ORDER.length) % CATALOG_ORDER.length];
}

export function isPasswordActive(hmiState) {
  return (hmiState?.parameters?.P200?.value ?? 0) === 1;
}

function getScenarioUi(hmiState) {
  return hmiState?.scenarioUi ?? null;
}

export function isParameterVisible(parameter, hmiState) {
  if (!parameter) {
    return false;
  }

  const passwordVisible = parameter.code !== "P000" || isPasswordActive(hmiState);
  if (!passwordVisible) {
    return false;
  }

  const scenarioUi = getScenarioUi(hmiState);
  if (!scenarioUi || scenarioUi.showAllParameters) {
    return true;
  }

  if (Array.isArray(scenarioUi.visibleParameters)) {
    return scenarioUi.visibleParameters.includes(parameter.code);
  }

  if (scenarioUi.lockedAdvancedParameters && parameter.difficulty === "avancado") {
    return false;
  }

  return true;
}

export function getVisibleParameterCodes(hmiState) {
  return CFW100_PARAMETER_CATALOG.filter((parameter) =>
    isParameterVisible(parameter, hmiState),
  ).map((parameter) => parameter.code);
}

export function isAccessoryAvailable(requiresAccessory) {
  if (!requiresAccessory) {
    return true;
  }
  return ACCESSORY_AVAILABILITY[requiresAccessory] ?? false;
}

// Senha de fabrica do CFW100. P200 apenas habilita (1) ou desabilita (0) a
// protecao; o valor digitado em P000 precisa ser esta senha para liberar.
export function isPasswordUnlocked(hmiState) {
  if (!isPasswordActive(hmiState)) {
    return true;
  }
  return Boolean(hmiState?.passwordAccessGranted);
}

// Retorna { editable, reason } combinando todas as travas reais do CFW100.
export function canEditParameter(parameter, hmiState) {
  if (!parameter) {
    return {
      editable: false,
      reason: "Parametro inexistente.",
      reasonKey: "parameterInfo.editReasons.missingParameter",
    };
  }

  const scenarioUi = getScenarioUi(hmiState);

  if (scenarioUi?.allowEditing === false) {
    return {
      editable: false,
      reason:
        scenarioUi.editAttemptMessage ||
        "Modo somente leitura: alteracao bloqueada.",
      reasonKey: "parameterInfo.editReasons.readOnlyMode",
    };
  }

  if (parameter.readOnly || !parameter.editable) {
    return {
      editable: false,
      reason: "Este parametro e somente leitura.",
      reasonKey: "parameterInfo.editReasons.readOnlyParameter",
    };
  }

  if (
    scenarioUi?.lockedAdvancedParameters &&
    parameter.difficulty === "avancado"
  ) {
    return {
      editable: false,
      reason: "Este parametro avancado esta bloqueado no modo atual.",
      reasonKey: "parameterInfo.editReasons.lockedAdvanced",
    };
  }

  if (!isAccessoryAvailable(parameter.requiresAccessory)) {
    return {
      editable: false,
      reason:
        "Este parametro depende de acessorio externo e nao esta disponivel nesta configuracao.",
      reasonKey: "parameterInfo.editReasons.requiresAccessory",
    };
  }

  if (parameter.requiresStoppedMotor && !isDriveStopped(hmiState)) {
    return {
      editable: false,
      reason: "Este parametro so pode ser alterado com o motor parado.",
      reasonKey: "parameterInfo.editReasons.requiresStoppedMotor",
    };
  }

  // Intertravamento real: P202 e P400+ (dados de motor) bloqueados se rodando.
  const pNumber = parseInt(parameter.code.substring(1), 10);
  if ((parameter.code === "P202" || pNumber >= 400) && !isDriveStopped(hmiState)) {
    return {
      editable: false,
      reason: "rUn: Parametro de controle/motor exige motor parado para edicao.",
      reasonKey: "parameterInfo.editReasons.motorControlStopped",
    };
  }

  // Intertravamento real: Multispeed (P124 a P131) bloqueado se P221 e P222 != 8
  if (pNumber >= 124 && pNumber <= 131) {
    const isMultispeedLocal = hmiState.parameters?.P221?.value === 8;
    const isMultispeedRemote = hmiState.parameters?.P222?.value === 8;
    if (!isMultispeedLocal && !isMultispeedRemote) {
      return {
        editable: false,
        reason: "ConF: Multispeed nao selecionado em P221 ou P222.",
        reasonKey: "parameterInfo.editReasons.multispeedUnavailable",
      };
    }
  }

  // Intertravamento real: Boost e escorregamento bloqueados em modo VVW (P202 = 5)
  if (
    (parameter.code === "P136" || parameter.code === "P137") &&
    hmiState.parameters?.P202?.value === 5
  ) {
    return {
      editable: false,
      reason: "ConF: Incompativel com modo de controle VVW (P202=5).",
      reasonKey: "parameterInfo.editReasons.vvwIncompatible",
    };
  }

  // A senha nao trava o proprio P000 (e onde se digita a senha).
  if (parameter.code !== "P000" && !isPasswordUnlocked(hmiState)) {
    return {
      editable: false,
      reason: "Parametro protegido. Libere o acesso em P000.",
      reasonKey: "parameterInfo.editReasons.passwordProtected",
    };
  }

  return { editable: true, reason: "", reasonKey: "" };
}

export function formatParameterValue(parameter, value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "---";
  }
  const decimals = parameter?.decimals ?? 0;
  return Number(value).toFixed(decimals);
}

export function getAccessBadges(parameter, hmiState) {
  const badges = [];

  if (parameter.readOnly) {
    badges.push({
      key: "ro",
      label: "Somente leitura",
      labelKey: "parameterInfo.badges.readOnly",
      tone: "neutral",
    });
  } else {
    badges.push({
      key: "edit",
      label: "Editavel",
      labelKey: "parameterInfo.badges.editable",
      tone: "success",
    });
  }

  if (parameter.requiresStoppedMotor) {
    badges.push({
      key: "cfg",
      label: "Motor parado",
      labelKey: "parameterInfo.badges.stoppedMotor",
      tone: "warning",
    });
  }

  if (parameter.requiresAccessory) {
    badges.push({
      key: "acc",
      label: "Requer acessorio",
      labelKey: "parameterInfo.badges.requiresAccessory",
      tone: "danger",
    });
  }

  const passwordActive = isPasswordActive(hmiState);
  if (passwordActive && parameter.code !== "P000") {
    const locked = !isPasswordUnlocked(hmiState);
    badges.push({
      key: "pwd",
      label: locked ? "Protegido" : "Liberado",
      labelKey: locked
        ? "parameterInfo.badges.protected"
        : "parameterInfo.badges.unlocked",
      tone: locked ? "danger" : "success",
    });
  }

  const difficultyLabel = DIFFICULTY_LABEL[parameter.difficulty];
  if (difficultyLabel) {
    badges.push({
      key: "diff",
      label: difficultyLabel,
      labelKey: `parameterInfo.badges.difficulty.${parameter.difficulty}`,
      tone: parameter.difficulty === "avancado" ? "warning" : "info",
    });
  }

  return badges;
}

const DIACRITICS = /[\u0300-\u036f]/g;

const normalize = (text) =>
  String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "");

export function searchParameters(query, limit = 40, hmiState = null, language = "pt-BR") {
  const term = normalize(query).trim();
  if (!term) {
    return [];
  }

  return CFW100_PARAMETER_CATALOG.filter((parameter) => {
    if (!isParameterVisible(parameter, hmiState)) {
      return false;
    }

    const localizedParameter = localizeParameter(parameter, language);
    const haystack = normalize(
      [
        parameter.code,
        parameter.name,
        parameter.categoryLabel,
        parameter.shortDescription,
        parameter.description,
        localizedParameter.name,
        localizedParameter.categoryLabel,
        localizedParameter.shortDescription,
        localizedParameter.description,
      ].join(" "),
    );
    return haystack.includes(term);
  }).slice(0, limit);
}

export function getAllParameters(hmiState = null) {
  return CFW100_PARAMETER_CATALOG.filter((parameter) =>
    isParameterVisible(parameter, hmiState),
  );
}
