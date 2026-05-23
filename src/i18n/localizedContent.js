import { getScenarioPresetId } from "../configurations/scenarioPresetRuntime.js";
import { DEFAULT_LANGUAGE, resolveLanguageCode } from "./languages.js";

const HMI_CONTROL_LABEL_KEYS = {
  menu: "hmiControls.openMenu",
  down: "hmiControls.decreaseReference",
  up: "hmiControls.increaseReference",
  run: "hmiControls.run",
  stop: "hmiControls.stop",
};

const PRESET_LOCALIZED_CONTENT = {
  "configuracao-de-fabrica": {
    name: { "en-US": "Factory configuration" },
    application: {
      "en-US":
        "Restores the simulator to an initial condition close to the CFW100 factory defaults on a 60 Hz mains supply.",
    },
  },
  "bancada-didatica-220-v-60-hz": {
    name: { "en-US": "Didactic bench 220 V / 60 Hz" },
    application: {
      "en-US":
        "Safe setup for a test bench with a 220 V three-phase motor operating up to 60 Hz.",
    },
  },
  "motor-parado-ready": {
    name: { "en-US": "Motor stopped / Ready" },
    application: {
      "en-US":
        "Simulates an energized drive, without faults, ready to start, but still not applying frequency to the motor.",
    },
  },
  "motor-rodando-em-30-hz": {
    name: { "en-US": "Motor running at 30 Hz" },
    application: {
      "en-US":
        "Simulates the motor operating steadily at half speed, with reference and output frequency at 30 Hz.",
    },
  },
  "motor-rodando-em-60-hz": {
    name: { "en-US": "Motor running at 60 Hz" },
    application: {
      "en-US":
        "Simulates the motor operating at nominal frequency, with 60 Hz output and speed close to rated rpm.",
    },
  },
  "partida-simples-pela-hmi": {
    name: { "en-US": "Simple start from HMI" },
    application: {
      "en-US":
        "Setup in which the user starts, stops, and adjusts frequency using only the drive front keys.",
    },
  },
  "controle-total-pela-hmi": {
    name: { "en-US": "Full control from HMI" },
    application: {
      "en-US":
        "All main commands are executed from the front panel: start, stop, and speed adjustment.",
    },
  },
  "referencia-fixa-30-hz": {
    name: { "en-US": "Fixed 30 Hz reference" },
    application: {
      "en-US":
        "Configuration for the motor to always start with a 30 Hz reference, representing a fixed medium speed.",
    },
  },
  "referencia-fixa-60-hz": {
    name: { "en-US": "Fixed 60 Hz reference" },
    application: {
      "en-US":
        "Configuration for the motor to start up to the nominal 60 Hz frequency.",
    },
  },
  "referencia-inicial-baixa": {
    name: { "en-US": "Low initial reference" },
    application: {
      "en-US":
        "Configuration for visual tests with a low initial frequency, ideal for demonstrating fine control.",
    },
  },
  "modo-demonstracao-automatica": {
    name: { "en-US": "Automatic demo mode" },
    application: {
      "en-US":
        "Simulates an automatic sequence in which the drive starts, accelerates, stabilizes, and then stops.",
    },
  },
  "modo-aluno-iniciante": {
    name: { "en-US": "Beginner student mode" },
    application: {
      "en-US":
        "Limits the simulation to the most important parameters for someone learning frequency inverter basics.",
    },
  },
  "modo-tecnico-completo": {
    name: { "en-US": "Full technical mode" },
    application: {
      "en-US":
        "Unlocks navigation through all simulator parameters, including motor, inputs, outputs, communication, and SoftPLC.",
    },
  },
  "modo-somente-leitura": {
    name: { "en-US": "Read-only mode" },
    application: {
      "en-US":
        "Allows the user to browse parameters and observe values, but blocks any changes.",
    },
  },
  "modo-edicao-liberada": {
    name: { "en-US": "Free edit mode" },
    application: {
      "en-US":
        "Allows editable parameters to be changed without password, still respecting read-only and stopped-motor conditions.",
    },
  },
};

const PARAMETER_CATEGORY_LABELS = {
  acesso_leitura: { "en-US": "Read and monitoring" },
  rampas_referencias: { "en-US": "Ramps and references" },
  controle_motor: { "en-US": "Motor control" },
  senha_display_controle: { "en-US": "Password, display and control" },
  comando_referencia: { "en-US": "Command and reference" },
  analogicas_frequencia: { "en-US": "Analog and frequency" },
  entradas_digitais: { "en-US": "Digital inputs" },
  saidas_digitais: { "en-US": "Digital outputs" },
  frenagem_serial: { "en-US": "Braking and serial" },
  flying_motor: { "en-US": "Flying start and motor" },
  dados_motor: { "en-US": "Motor data" },
  comunicacao: { "en-US": "Communication" },
  bluetooth_softplc: { "en-US": "Bluetooth and SoftPLC" },
  geral: { "en-US": "General" },
};

const PARAMETER_FIELD_TRANSLATIONS = {
  P000: {
    name: { "en-US": "Parameter access" },
    shortDescription: {
      "en-US": "Controls access release to parameters when password protection is enabled.",
    },
    description: {
      "en-US": "Controls access release to parameters when password protection is enabled.",
    },
    longDescription: {
      "en-US":
        "Access release point. With the password active (P200 = 1), the user types the stored password here; after validation the display shows only 1 for granted access or 0 for blocked access, keeping the real value hidden.",
    },
    example: {
      "en-US":
        "With P200 = 1, set P000 to the stored password to unlock editing. If the password is inactive, P000 does not appear on the HMI.",
    },
    simulatorBehavior: {
      "en-US":
        "When the password is active, allow parameter changes only if P000 is validated correctly. If not validated, let the user browse and view values but block editing.",
    },
  },
  P001: {
    name: { "en-US": "Speed reference" },
    shortDescription: {
      "en-US": "Shows the speed reference requested from the drive.",
    },
    description: {
      "en-US": "Shows the speed reference requested from the drive.",
    },
    longDescription: {
      "en-US":
        "Shows the active speed reference, that is, the target frequency the drive is trying to reach through the ramp. It is read-only: it reflects HMI reference P121 limited by P133 and P134.",
    },
    example: {
      "en-US":
        "Setting the HMI reference to 45.0 Hz makes P001 indicate 45.0 Hz, while the output P005 ramps up to that value.",
    },
    simulatorBehavior: {
      "en-US":
        "Displays the target speed/frequency value. It may differ from the actual frequency while the ramp is still accelerating or decelerating.",
    },
  },
  P002: {
    name: { "en-US": "Motor output speed" },
    shortDescription: {
      "en-US": "Shows the estimated motor output speed.",
    },
    description: {
      "en-US": "Shows the estimated motor output speed.",
    },
    longDescription: {
      "en-US":
        "Estimated motor shaft speed, derived from output frequency and the motor nameplate data. It follows P005 proportionally.",
    },
    example: {
      "en-US":
        "For a 4-pole motor at 60 Hz, P002 indicates approximately 1800 rpm.",
    },
    simulatorBehavior: {
      "en-US":
        "Calculates rpm proportionally to output frequency. Example: if P403 = 60 Hz and P402 = 1720 rpm, at 30 Hz it shows approximately half the rated speed.",
    },
  },
  P003: {
    name: { "en-US": "Motor current" },
    shortDescription: {
      "en-US": "Shows the instantaneous motor current.",
    },
    description: {
      "en-US": "Shows the instantaneous motor current.",
    },
    longDescription: {
      "en-US":
        "Effective current delivered by the drive to the motor. It rises with load and acceleration and is used by overload protections.",
    },
    example: {
      "en-US":
        "At no load the current stays close to magnetizing current; under rated load it approaches the motor rated current P401.",
    },
    simulatorBehavior: {
      "en-US":
        "Varies according to load and acceleration. At no load it shows a lower current; with high load or a fast ramp it increases and may trigger overload alarms or faults.",
    },
  },
  P004: {
    name: { "en-US": "DC bus voltage" },
    shortDescription: {
      "en-US": "Shows the measured DC bus voltage.",
    },
    description: {
      "en-US": "Shows the measured DC bus voltage.",
    },
    longDescription: {
      "en-US":
        "Internal DC bus voltage after the rectifier bridge. On a 220 V supply it stays around 311 V. Drops generate undervoltage; excess can simulate overvoltage.",
    },
    example: {
      "en-US":
        "Powered from 220 Vac, P004 stabilizes around 311 Vdc with the drive ready.",
    },
    simulatorBehavior: {
      "en-US":
        "Keeps a value coherent with the simulated supply. It drops under undervoltage scenarios and rises during regenerative deceleration to simulate DC-link overvoltage.",
    },
  },
  P005: {
    name: { "en-US": "Motor output frequency" },
    shortDescription: {
      "en-US": "Shows the actual frequency applied to the motor.",
    },
    description: {
      "en-US": "Shows the actual frequency applied to the motor.",
    },
    longDescription: {
      "en-US":
        "Frequency actually applied to the motor at this instant. It evolves from 0 to the reference while obeying acceleration P100 and deceleration P101 ramps.",
    },
    example: {
      "en-US":
        "With P100 = 5.0 s and a 60.0 Hz reference, P005 goes from 0.0 to 60.0 Hz in about 5 seconds.",
    },
    simulatorBehavior: {
      "en-US":
        "Updates through the ramp. When starting, it rises from 0.0 Hz to P001 using P100 or P102; when stopping, it falls using P101 or P103.",
    },
  },
  P006: {
    name: { "en-US": "Drive status" },
    shortDescription: {
      "en-US": "Indicates the current drive state, such as ready, running, or fault.",
    },
    description: {
      "en-US": "Indicates the current drive state, such as ready, running, or fault.",
    },
    longDescription: {
      "en-US":
        "Operating state of the drive. On the display it appears as rdY (ready), frequency value while running, Sub (undervoltage), conF (invalid configuration), or Fxxx/Axxx for fault or alarm.",
    },
    example: {
      "en-US":
        "Stopped and without faults it shows rdY; after pressing run it starts showing output frequency.",
    },
    simulatorBehavior: {
      "en-US":
        "Acts as the master HMI state. It shows values such as rdY, run, Sub, Fxxx, or ConF according to the internal state.",
    },
  },
  P100: {
    name: { "en-US": "Acceleration time" },
    shortDescription: {
      "en-US": "Defines the time of the main acceleration ramp.",
    },
    description: {
      "en-US": "Defines the time of the main acceleration ramp.",
    },
    longDescription: {
      "en-US":
        "Acceleration ramp time: how long the drive takes to raise frequency from 0 to maximum frequency P134. Higher values make startup smoother; lower values make acceleration more abrupt and demand more current.",
    },
    example: {
      "en-US":
        "With P100 = 5.0 s, P134 = 60.0 Hz, and a 60.0 Hz reference, output rises from 0.0 to 60.0 Hz in about 5 seconds. With a 30.0 Hz reference it takes about 2.5 seconds.",
    },
    simulatorBehavior: {
      "en-US":
        "When starting, it increases P005 gradually up to P001 using this time when the first ramp is selected.",
    },
  },
  P101: {
    name: { "en-US": "Deceleration time" },
    shortDescription: {
      "en-US": "Defines the time of the main deceleration ramp.",
    },
    description: {
      "en-US": "Defines the time of the main deceleration ramp.",
    },
    longDescription: {
      "en-US":
        "Deceleration ramp time: how long the drive takes to reduce frequency from P134 to 0. Short times may increase DC bus voltage due to regeneration.",
    },
    example: {
      "en-US":
        "With P101 = 10.0 s, stopping from 60.0 Hz makes output fall to 0.0 Hz in about 10 seconds.",
    },
    simulatorBehavior: {
      "en-US":
        "When stopping, it reduces P005 gradually down to 0.0 Hz using this time when the first ramp is selected.",
    },
  },
  P121: {
    name: { "en-US": "HMI reference" },
    shortDescription: {
      "en-US": "Frequency reference adjusted by the HMI keys.",
    },
    description: {
      "en-US": "Frequency reference adjusted by the HMI keys.",
    },
    longDescription: {
      "en-US":
        "Frequency reference adjusted by the HMI keys. It is the speed target when the reference source is the keypad and is always limited by minimum P133 and maximum P134.",
    },
    example: {
      "en-US":
        "Pressing the up key in monitoring mode increases P121 in 0.1 Hz steps up to the P134 limit.",
    },
    simulatorBehavior: {
      "en-US":
        "When pressing up or down in monitoring mode, it changes this value while respecting P133 and P134.",
    },
  },
  P133: {
    name: { "en-US": "Minimum frequency" },
    shortDescription: {
      "en-US": "Lower operating frequency limit.",
    },
    description: {
      "en-US": "Lower operating frequency limit.",
    },
    longDescription: {
      "en-US":
        "Minimum operating frequency. With the motor enabled, output never goes below this value even if the reference is smaller. It protects the motor and load from running too slowly.",
    },
    example: {
      "en-US":
        "With P133 = 3.0 Hz and reference at 0.0 Hz, pressing run makes the motor stabilize at 3.0 Hz instead of 0.",
    },
    simulatorBehavior: {
      "en-US":
        "Applies as the lower limit for P001, P005, and adjustable references.",
    },
  },
  P134: {
    name: { "en-US": "Maximum frequency" },
    shortDescription: {
      "en-US": "Upper operating frequency limit.",
    },
    description: {
      "en-US": "Upper operating frequency limit.",
    },
    longDescription: {
      "en-US":
        "Maximum operating frequency. It limits both reference and output and is also the ramp base for P100 and P101 from 0 to P134.",
    },
    example: {
      "en-US":
        "With P134 = 66.0 Hz, even if the HMI requests more, output does not exceed 66.0 Hz.",
    },
    simulatorBehavior: {
      "en-US":
        "Applies as the upper limit for both reference and output frequency.",
    },
  },
  P200: {
    name: { "en-US": "Password control" },
    shortDescription: {
      "en-US": "Controls password activation and programming.",
    },
    description: {
      "en-US": "Controls password activation and programming.",
    },
    longDescription: {
      "en-US":
        "Controls access password: 0 disables it, 1 indicates password active, and values from 2 to 9999 program a new password. After saving a new password, P200 returns to 1.",
    },
    example: {
      "en-US":
        "Program a value between 2 and 9999 in P200 to create or change the password. With protection active, unlock access by entering the current password in P000.",
    },
    simulatorBehavior: {
      "en-US":
        "Controls whether the local password gate is active and whether P000 must be validated before editing protected parameters.",
    },
  },
  P202: {
    name: { "en-US": "Control mode" },
    shortDescription: {
      "en-US": "Selects the motor control mode.",
    },
    description: {
      "en-US": "Selects the motor control mode.",
    },
    longDescription: {
      "en-US":
        "Selects the motor control mode (linear V/f, quadratic V/f, or VVW). Because it requires the motor to be stopped, it can only be changed with the drive disabled.",
    },
    example: {
      "en-US":
        "For pump and fan loads, quadratic V/f reduces energy usage at low speed.",
    },
    simulatorBehavior: {
      "en-US":
        "Changes the motor model and output voltage strategy, switching between linear V/f, quadratic V/f, and VVW behavior.",
    },
  },
};

export function getLocalizedText(localizedValue, language, fallbackValue = "") {
  const resolvedLanguage = resolveLanguageCode(language);

  if (
    localizedValue &&
    typeof localizedValue === "object" &&
    !Array.isArray(localizedValue)
  ) {
    if (resolvedLanguage in localizedValue) {
      return localizedValue[resolvedLanguage];
    }
    if (DEFAULT_LANGUAGE in localizedValue) {
      return localizedValue[DEFAULT_LANGUAGE];
    }
  }

  return fallbackValue;
}

export function getHmiControlAriaLabel(action, t) {
  const key = HMI_CONTROL_LABEL_KEYS[action];
  if (!key) {
    return action;
  }

  const translated = t(key);
  return translated === key ? action : translated;
}

function resolvePresetIdentity(presetOrScenario) {
  if (presetOrScenario?.scenario) {
    return {
      id: getScenarioPresetId(presetOrScenario),
      name: presetOrScenario.scenario.name ?? "",
      application: presetOrScenario.scenario.application ?? "",
      notes: presetOrScenario.scenario.notes ?? [],
    };
  }

  return {
    id:
      presetOrScenario?.activeScenarioId ??
      presetOrScenario?.id ??
      getScenarioPresetId(presetOrScenario),
    name:
      presetOrScenario?.activeScenarioName ??
      presetOrScenario?.name ??
      "",
    application:
      presetOrScenario?.activeScenarioApplication ??
      presetOrScenario?.application ??
      "",
    notes:
      presetOrScenario?.activeScenarioNotes ??
      presetOrScenario?.notes ??
      [],
  };
}

export function getLocalizedPresetContent(presetOrScenario, language) {
  const basePreset = resolvePresetIdentity(presetOrScenario);
  const translations = PRESET_LOCALIZED_CONTENT[basePreset.id] ?? {};

  return {
    id: basePreset.id,
    name: getLocalizedText(translations.name, language, basePreset.name),
    application: getLocalizedText(
      translations.application,
      language,
      basePreset.application,
    ),
    notes: getLocalizedText(translations.notes, language, basePreset.notes),
  };
}

export function getLocalizedScenarioModeLabel(mode, t) {
  if (!mode) {
    return "";
  }

  const key = `header.scenarioMode.${mode}`;
  const translated = t(key);
  return translated === key ? mode : translated;
}

function getLocalizedParameterEditCondition(parameter, language) {
  const resolvedLanguage = resolveLanguageCode(language);
  if (resolvedLanguage === DEFAULT_LANGUAGE || !parameter?.editCondition) {
    return parameter?.editCondition ?? "";
  }

  if (parameter.readOnly) {
    return "Read only.";
  }

  if (parameter.requiresStoppedMotor) {
    return "Editable only with the motor stopped.";
  }

  return "Editable according to access/password and drive state.";
}

export function getLocalizedParameterField(parameter, field, language) {
  if (!parameter || typeof parameter !== "object") {
    return "";
  }

  if (field === "categoryLabel") {
    return getLocalizedText(
      PARAMETER_CATEGORY_LABELS[parameter.category],
      language,
      parameter.categoryLabel ?? "",
    );
  }

  if (field === "editCondition") {
    return getLocalizedParameterEditCondition(parameter, language);
  }

  const translatedField = getLocalizedText(
    parameter[`${field}I18n`] ?? PARAMETER_FIELD_TRANSLATIONS[parameter.code]?.[field],
    language,
    parameter[field] ?? "",
  );

  return translatedField;
}

export function localizeParameter(parameter, language) {
  if (!parameter) {
    return parameter;
  }

  return {
    ...parameter,
    name: getLocalizedParameterField(parameter, "name", language),
    categoryLabel: getLocalizedParameterField(parameter, "categoryLabel", language),
    shortDescription: getLocalizedParameterField(
      parameter,
      "shortDescription",
      language,
    ),
    description: getLocalizedParameterField(parameter, "description", language),
    longDescription: getLocalizedParameterField(
      parameter,
      "longDescription",
      language,
    ),
    example: getLocalizedParameterField(parameter, "example", language),
    simulatorBehavior: getLocalizedParameterField(
      parameter,
      "simulatorBehavior",
      language,
    ),
    editCondition: getLocalizedParameterField(parameter, "editCondition", language),
  };
}
