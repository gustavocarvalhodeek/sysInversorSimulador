import { CFW100_PARAMETER_CATALOG } from "./parameters/cfw100ParameterCatalog.js";
import {
  canEditParameter,
  getNextParameterCode,
  getPreviousParameterCode,
} from "./parameters/parameterHelpers.js";
import {
  applySnapshotValues,
  applyPersistedValues,
  createDidacticPasswordDigest,
  loadUserParameterSet,
  loadPersistedSecurity,
  matchesDidacticPassword,
  persistSecurity,
  persistValues,
  saveUserParameterSet,
} from "../utils/persistence.js";
import { resolveCommand } from "../simulation/commandResolver.js";
import {
  hasActiveOutput,
  isPwmEnableBlocked,
} from "../logic/driveStatus.js";
import {
  clearAlarm,
  raiseAlarm,
  raiseFault,
  resetFault,
} from "../logic/faultManager.js";
import { normalizeKnownFaultCode } from "../logic/faultCatalog.js";
import {
  normalizeScenarioPreset,
} from "../configurations/scenarioPresetRuntime.js";
import {
  cloneDefaultExternalSources,
  sanitizeAi1Percent,
  sanitizeBoolean,
  sanitizeDigitalInputIndex,
  sanitizeDigitalInputs,
  sanitizeExternalSourceUpdate,
  sanitizeExternalSources,
  sanitizeFiFrequency,
  isFiniteNumber,
  sanitizeIxtPercent,
  sanitizeLoadPercent,
  sanitizeModuleTemperature,
  sanitizeOutputFrequency,
  sanitizeReferenceFrequency,
  toFiniteNumber,
} from "../utils/sanitizers.js";
import { getDisplayModelForState } from "./display/hmiDisplayModel.js";
import { withSyncedParameters as withSyncedParametersHelper } from "./helpers/hmiStateSync.js";
import {
  applySpecialParameterEffects as applySpecialParameterEffectsImpl,
  recalculateP403DependentParameters as recalculateP403DependentParametersImpl,
} from "./parameter-effects/specialParameterEffects.js";
import {
  adjustEditingValue,
  adjustReferenceFrequency,
  enterEditMode,
  getSelectedParameter,
  moveParameterSelection,
  selectParameterByCode,
  withVisibleParameterOrder,
} from "./parameter-editing/hmiParameterEditing.js";

export const HMI_MODES = {
  MONITOR: "MONITOR",
  SELECT_PARAM: "SELECT_PARAM",
  EDIT_PARAM: "EDIT_PARAM",
};

const FREQUENCY_STEP = 0.1;

export function recalculateP403DependentParameters(parameters, oldBaseValue, newBaseValue) {
  return recalculateP403DependentParametersImpl(
    parameters,
    oldBaseValue,
    newBaseValue,
  );
}

function createFactoryParameterMap() {
  return Object.fromEntries(
    CFW100_PARAMETER_CATALOG.map((parameter) => [
      parameter.code,
      {
        ...parameter,
      },
    ]),
  );
}

function cloneParameters() {
  return createFactoryParameterMap();
}

function createDefaultExternalSources() {
  return cloneDefaultExternalSources();
}

function createScenarioMetadataState(overrides = {}) {
  return {
    activeScenarioId: null,
    activeScenarioName: null,
    activeScenarioApplication: "",
    activeScenarioNotes: [],
    scenarioUi: null,
    scenarioWarnings: [],
    runtimeSeedVersion: 0,
    ...overrides,
  };
}

function clearScenarioMetadata(state) {
  return createScenarioMetadataState({
    runtimeSeedVersion: state.runtimeSeedVersion ?? 0,
  });
}

function clampReferenceFromParameters(value, parameters) {
  return sanitizeReferenceFrequency(
    value,
    parameters,
    toFiniteNumber(parameters?.P121?.value, parameters?.P133?.value ?? 0),
  );
}

function clampOutputFromParameters(value, parameters) {
  return sanitizeOutputFrequency(value, parameters, 0);
}

function withSyncedParameters(state, providedMotorState = null) {
  return withSyncedParametersHelper(state, providedMotorState);
}


function applySpecialParameterEffects(state, parameter, previousState = state) {
  return applySpecialParameterEffectsImpl(state, parameter, previousState, {
    withSyncedParameters,
  });
}

function finishPasswordAccessEdit(state, parameter) {
  const passwordMatches = matchesDidacticPassword(
    state.editingValue,
    state.passwordDigest,
  );

  return withSyncedParameters({
    ...state,
    mode: HMI_MODES.SELECT_PARAM,
    editingValue: null,
    lastRejectedEdit: null,
    passwordAccessGranted: passwordMatches,
    parameters: {
      ...state.parameters,
      P000: {
        ...parameter,
        value: passwordMatches ? 1 : 0,
      },
    },
  });
}

function finishPasswordControlEdit(state, parameter) {
  const requestedValue = state.editingValue;

  if (requestedValue >= 2) {
    const passwordDigest = createDidacticPasswordDigest(requestedValue);
    const nextState = withVisibleParameterOrder(
      withSyncedParameters({
        ...state,
        mode: HMI_MODES.SELECT_PARAM,
        editingValue: null,
        lastRejectedEdit: null,
        passwordDigest,
        passwordAccessGranted: true,
        parameters: {
          ...state.parameters,
          P000: {
            ...state.parameters.P000,
            value: 1,
          },
          P200: {
            ...parameter,
            value: 1,
          },
        },
      }),
      "P200",
    );

    persistValues(nextState.parameters);
    persistSecurity({ passwordDigest });
    return nextState;
  }

  if (requestedValue === 0) {
    const nextState = withVisibleParameterOrder(
      withSyncedParameters({
        ...state,
        mode: HMI_MODES.SELECT_PARAM,
        editingValue: null,
        lastRejectedEdit: null,
        passwordDigest: null,
        passwordAccessGranted: true,
        parameters: {
          ...state.parameters,
          P000: {
            ...state.parameters.P000,
            value: 1,
          },
          P200: {
            ...parameter,
            value: 0,
          },
        },
      }),
      "P200",
    );

    persistValues(nextState.parameters);
    persistSecurity({ passwordDigest: null });
    return nextState;
  }

  // O valor 1 e apenas a indicacao de senha ativa, nao programa uma senha nova.
  return withSyncedParameters({
    ...state,
    mode: HMI_MODES.SELECT_PARAM,
    editingValue: null,
    lastRejectedEdit: null,
    parameters: {
      ...state.parameters,
      P200: {
        ...parameter,
        value: state.parameters.P200.value === 1 ? 1 : 0,
      },
    },
  });
}

function applyReferenceBackupOnEnable(state) {
  const backupMode = state.parameters.P120?.value ?? 0;
  let referenceFrequency = state.referenceFrequency;

  if (backupMode === 0) {
    // Parte da frequência mínima
    referenceFrequency = state.parameters.P133.value;
  } else if (backupMode === 1) {
    // Bug 7: mantém a última referência usada (nenhuma alteração necessária)
  } else if (backupMode === 2) {
    // Usa o valor salvo em P121
    referenceFrequency = state.parameters.P121.value;
  }

  return {
    ...state,
    referenceFrequency: sanitizeReferenceFrequency(
      referenceFrequency,
      state.parameters,
      state.parameters.P133.value,
    ),
  };
}

function applyP204Action(state, requestedValue) {
  if (requestedValue === 9) {
    saveUserParameterSet(state.parameters);
    return state;
  }

  if (![5, 6, 7].includes(requestedValue)) {
    return state;
  }

  let parameters = createFactoryParameterMap();
  if (requestedValue === 6) {
    parameters.P124.value = 3;
    parameters.P125.value = 5;
    parameters.P126.value = 10;
    parameters.P127.value = 20;
    parameters.P128.value = 30;
    parameters.P129.value = 40;
    parameters.P130.value = 50;
    parameters.P131.value = 55;
    parameters.P134.value = 55;
    parameters.P145.value = 50;
    parameters.P146.value = 25;
    parameters.P208.value = 500;
    parameters.P402.value = 1310;
    parameters.P403.value = 50;
  }

  if (requestedValue === 7) {
    const userParameters = loadUserParameterSet();
    if (!userParameters) {
      return state;
    }
    parameters = applySnapshotValues(parameters, userParameters);
  }

  parameters.P000.value = state.parameters.P000.value;
  parameters.P200.value = state.parameters.P200.value;
  parameters.P204.value = 0;
  parameters.P121.value = clampReferenceFromParameters(parameters.P121.value, parameters);

  return {
    ...state,
    ...clearScenarioMetadata(state),
    parameters,
    referenceFrequency: clampReferenceFromParameters(parameters.P121.value, parameters),
  };
}

function applyImportedConfiguration(state, snapshot) {
  const selectedCode = getSelectedParameter(state)?.code;
  const parameters = applySnapshotValues(cloneParameters(), snapshot);

  // Configuração operacional e segurança são tratadas separadamente.
  parameters.P000.value = state.parameters.P000.value;
  parameters.P200.value = state.parameters.P200.value;
  parameters.P204.value = 0;
  parameters.P121.value = clampReferenceFromParameters(parameters.P121.value, parameters);

  const nextState = withVisibleParameterOrder(
    withSyncedParameters({
      ...state,
      ...clearScenarioMetadata(state),
      mode: HMI_MODES.SELECT_PARAM,
      editingValue: null,
      lastRejectedEdit: null,
      parameters,
      referenceFrequency: clampReferenceFromParameters(parameters.P121.value, parameters),
    }),
    selectedCode,
  );

  persistValues(nextState.parameters);
  return nextState;
}

function applyScenarioSimulationState(state, scenarioSimulation = {}) {
  const resetState = {
    ...state,
    running: false,
    emergencyStop: false,
    undervoltage: false,
    referenceFrequency: clampReferenceFromParameters(
      state.parameters.P121.value,
      state.parameters,
    ),
    outputFrequency: 0,
    mechanicalHz: 0,
    electricalOutputActive: false,
    isCoasting: false,
    loadPercent: 0,
    ixtPercent: 0,
    moduleTemperature: 40,
    multispeedIndex: 0,
    digitalInputs: Array.from({ length: 8 }, () => false),
    externalSources: createDefaultExternalSources(),
    lastFault: null,
    faultCode: null,
    alarmCode: null,
    alarmAcknowledged: false,
    automationCycle: null,
    automationStartTime: null,
  };

  const nextState = { ...resetState };

  if (typeof scenarioSimulation.running === "boolean") {
    nextState.running = sanitizeBoolean(scenarioSimulation.running, nextState.running);
  }
  if (typeof scenarioSimulation.emergencyStop === "boolean") {
    nextState.emergencyStop = sanitizeBoolean(
      scenarioSimulation.emergencyStop,
      nextState.emergencyStop,
    );
  }
  if (typeof scenarioSimulation.undervoltage === "boolean") {
    nextState.undervoltage = sanitizeBoolean(
      scenarioSimulation.undervoltage,
      nextState.undervoltage,
    );
  }
  if (isFiniteNumber(scenarioSimulation.referenceFrequency)) {
    nextState.referenceFrequency = clampReferenceFromParameters(
      scenarioSimulation.referenceFrequency,
      state.parameters,
    );
  }
  if (isFiniteNumber(scenarioSimulation.outputFrequency)) {
    nextState.outputFrequency = clampOutputFromParameters(
      scenarioSimulation.outputFrequency,
      state.parameters,
    );
  }
  if (isFiniteNumber(scenarioSimulation.mechanicalHz)) {
    nextState.mechanicalHz = clampOutputFromParameters(
      scenarioSimulation.mechanicalHz,
      state.parameters,
    );
  } else {
    nextState.mechanicalHz = nextState.outputFrequency;
  }
  if (isFiniteNumber(scenarioSimulation.loadPercent)) {
    nextState.loadPercent = sanitizeLoadPercent(
      scenarioSimulation.loadPercent,
      nextState.loadPercent,
    );
  }
  if (isFiniteNumber(scenarioSimulation.ixtPercent)) {
    nextState.ixtPercent = sanitizeIxtPercent(
      scenarioSimulation.ixtPercent,
      nextState.ixtPercent,
    );
  }
  if (isFiniteNumber(scenarioSimulation.moduleTemperature)) {
    nextState.moduleTemperature = sanitizeModuleTemperature(
      scenarioSimulation.moduleTemperature,
      nextState.moduleTemperature,
    );
  }
  if (Array.isArray(scenarioSimulation.digitalInputs)) {
    nextState.digitalInputs = sanitizeDigitalInputs(
      scenarioSimulation.digitalInputs,
      nextState.digitalInputs,
    );
  }
  if (
    scenarioSimulation.externalSources &&
    typeof scenarioSimulation.externalSources === "object"
  ) {
    nextState.externalSources = sanitizeExternalSources(
      scenarioSimulation.externalSources,
      nextState.externalSources,
    );
  }
  if (typeof scenarioSimulation.automationCycle === "string") {
    nextState.automationCycle = scenarioSimulation.automationCycle;
  }
  if (isFiniteNumber(scenarioSimulation.automationStartTime)) {
    nextState.automationStartTime = scenarioSimulation.automationStartTime;
  }

  const outputStillActive = hasActiveOutput(nextState);
  const inferredCoasting =
    !nextState.running &&
    !nextState.emergencyStop &&
    (nextState.parameters.P229?.value ?? 0) === 1 &&
    outputStillActive;

  nextState.isCoasting =
    typeof scenarioSimulation.isCoasting === "boolean"
      ? sanitizeBoolean(scenarioSimulation.isCoasting, false) &&
        outputStillActive &&
        !nextState.running
      : inferredCoasting;

  nextState.electricalOutputActive =
    typeof scenarioSimulation.electricalOutputActive === "boolean"
      ? sanitizeBoolean(scenarioSimulation.electricalOutputActive, false) &&
        !nextState.isCoasting &&
        (nextState.running || outputStillActive)
      : nextState.running || (outputStillActive && !nextState.isCoasting);

  if (!nextState.automationCycle) {
    nextState.automationStartTime = null;
  } else if (!nextState.automationStartTime) {
    nextState.automationStartTime = Date.now();
  }

  return nextState;
}

function applyScenarioPreset(state, preset) {
  const selectedCode = getSelectedParameter(state)?.code;
  const normalized = normalizeScenarioPreset(preset, cloneParameters());
  const parameters = applySnapshotValues(
    cloneParameters(),
    normalized.parameterSnapshot,
  );
  const scenarioWarnings = [...normalized.warnings];
  const hasStoredPassword =
    typeof state.passwordDigest === "string" &&
    state.passwordDigest.length > 0;

  if ((parameters.P200?.value ?? 0) === 1 && !hasStoredPassword) {
    parameters.P200.value = 0;
    scenarioWarnings.push(
      "Preset pediu P200=1 sem senha programada; a protecao ficou apenas no modo do cenario.",
    );
  }

  parameters.P121.value = clampReferenceFromParameters(parameters.P121.value, parameters);
  parameters.P000.value = parameters.P200.value === 1 ? 0 : 1;
  parameters.P204.value = 0;

  let nextState = {
    ...state,
    mode: HMI_MODES.SELECT_PARAM,
    editingValue: null,
    lastRejectedEdit: null,
    parameters,
    referenceFrequency: clampReferenceFromParameters(
      parameters.P121.value,
      parameters,
    ),
    passwordAccessGranted: parameters.P200.value !== 1,
    ...createScenarioMetadataState({
      activeScenarioId: normalized.id,
      activeScenarioName: normalized.name,
      activeScenarioApplication: normalized.application,
      activeScenarioNotes: normalized.notes,
      scenarioUi: normalized.scenarioUi,
      scenarioWarnings,
      runtimeSeedVersion: (state.runtimeSeedVersion ?? 0) + 1,
    }),
  };

  nextState = applyScenarioSimulationState(nextState, normalized.scenarioSimulation);

  return withVisibleParameterOrder(
    withSyncedParameters(nextState),
    selectedCode,
  );
}

function saveEditingValue(state) {
  const parameter = getSelectedParameter(state);
  const verdict = canEditParameter(parameter, state);

  if (!verdict.editable) {
    return {
      ...state,
      mode: HMI_MODES.SELECT_PARAM,
      editingValue: null,
      lastRejectedEdit: { code: parameter.code, reason: verdict.reason },
    };
  }

  if (parameter.code === "P000") {
    return finishPasswordAccessEdit(state, parameter);
  }

  if (parameter.code === "P200") {
    return finishPasswordControlEdit(state, parameter);
  }

  if (parameter.code === "P204") {
    const p204State = applyP204Action(state, state.editingValue);
    const nextState = withSyncedParameters({
      ...p204State,
      mode: HMI_MODES.SELECT_PARAM,
      editingValue: null,
      lastRejectedEdit: null,
      parameters: {
        ...p204State.parameters,
        P204: {
          ...parameter,
          value: 0,
        },
      },
    });
    persistValues(nextState.parameters);
    return nextState;
  }

  const nextState = withSyncedParameters({
    ...state,
    mode: HMI_MODES.SELECT_PARAM,
    editingValue: null,
    lastRejectedEdit: null,
    parameters: {
      ...state.parameters,
      [parameter.code]: {
        ...parameter,
        value: state.editingValue,
      },
    },
  });

  const finalState = applySpecialParameterEffects(nextState, parameter, state);
  persistValues(finalState.parameters);
  return finalState;
}

function toggleRun(state, running) {
  // Não parte com emergência ativa; é preciso reconhecer (STOP) antes.
  if (running && (state.emergencyStop || isPwmEnableBlocked(state))) {
    return withSyncedParameters({ ...state, running: false });
  }

  // Intertravamento Real: Ignora a tecla RUN verde se o inversor estiver
  // configurado para receber comando (Gira/Para) de outra fonte (ex: DI ou Serial).
  const command = resolveCommand(state);
  if (running && command.commandSource.kind !== "HMI") {
    return state; // Ignora o clique
  }

  const nextState =
    running && !state.running ? applyReferenceBackupOnEnable(state) : state;

  if (!running && !state.emergencyStop) {
    const residualOutputActive = hasActiveOutput(nextState);
    const isImmediateCoastdown =
      (nextState.parameters.P229?.value ?? 0) === 1 && residualOutputActive;

    return withSyncedParameters({
      ...nextState,
      running: false,
      emergencyStop: false,
      electricalOutputActive: isImmediateCoastdown ? false : residualOutputActive,
      isCoasting: isImmediateCoastdown,
    });
  }

  return withSyncedParameters({
    ...nextState,
    running,
    // STOP tambem reconhece/limpa a parada de emergencia.
    emergencyStop: running ? state.emergencyStop : false,
  });
}

export function createInitialHmiState() {
  const parameters = applyPersistedValues(cloneParameters());
  const security = loadPersistedSecurity();
  const passwordActive =
    parameters.P200.value === 1 && security.passwordDigest !== null;

  if (!passwordActive) {
    parameters.P200.value = 0;
  }

  parameters.P000.value = passwordActive ? 0 : 1;
  parameters.P121.value = clampReferenceFromParameters(parameters.P121.value, parameters);
  const referenceFrequency = sanitizeReferenceFrequency(
    parameters.P121.value,
    parameters,
    parameters.P133.value,
  );

  const initialState = {
    mode: HMI_MODES.MONITOR,
    running: false,
    emergencyStop: false,
    undervoltage: false,
    referenceFrequency,
    outputFrequency: 0,
    mechanicalHz: 0,
    electricalOutputActive: false,
    isCoasting: false,
    loadPercent: 0,
    ixtPercent: 0,
    moduleTemperature: 40, // Temperatura inicial = ambiente (40 °C)
    multispeedIndex: 0,
    digitalInputs: Array.from({ length: 8 }, () => false),
    externalSources: createDefaultExternalSources(),
    selectedParameterIndex: 0,
    editingValue: null,
    lastRejectedEdit: null,
    parameterOrder: [],
    parameters,
    // Fingerprint didatico do P200/P000. Nao representa autenticacao real.
    passwordDigest: security.passwordDigest,
    passwordAccessGranted: !passwordActive,
    lastFault: null,
    faultCode: null,
    alarmCode: null,
    alarmAcknowledged: false,
    automationCycle: null,
    automationStartTime: null,
    ...createScenarioMetadataState(),
  };

  return withSyncedParameters(withVisibleParameterOrder(initialState));
}

const PRESS_P_HANDLERS = {
  [HMI_MODES.MONITOR]: (state) => ({ ...state, mode: HMI_MODES.SELECT_PARAM }),
  [HMI_MODES.SELECT_PARAM]: (state) => enterEditMode(state, HMI_MODES),
  [HMI_MODES.EDIT_PARAM]: saveEditingValue,
};

function handleStep(state, direction) {
  if (state.mode === HMI_MODES.MONITOR) {
    return adjustReferenceFrequency(
      state,
      direction * FREQUENCY_STEP,
      withSyncedParameters,
    );
  }
  if (state.mode === HMI_MODES.SELECT_PARAM) {
    return moveParameterSelection(state, direction);
  }
  if (state.mode === HMI_MODES.EDIT_PARAM) {
    return adjustEditingValue(state, direction);
  }
  return state;
}

export function hmiReducer(state, action) {
  switch (action.type) {
    case "SYNC_DRIVE_STATE": {
      const outputFrequency = sanitizeOutputFrequency(
        action.outputFrequency,
        state.parameters,
        state.outputFrequency,
      );
      const mechanicalHz = sanitizeOutputFrequency(
        action.mechanicalHz,
        state.parameters,
        state.mechanicalHz,
      );
      return withSyncedParameters(
        {
          ...state,
          outputFrequency,
          mechanicalHz,
          electricalOutputActive:
            action.electricalOutputActive === undefined
              ? state.electricalOutputActive
              : sanitizeBoolean(
                  action.electricalOutputActive,
                  state.electricalOutputActive,
                ),
          isCoasting:
            action.isCoasting === undefined
              ? state.isCoasting
              : sanitizeBoolean(action.isCoasting, state.isCoasting),
          ixtPercent: sanitizeIxtPercent(action.ixtPercent, state.ixtPercent),
          moduleTemperature: sanitizeModuleTemperature(
            action.moduleTemperature,
            state.moduleTemperature,
          ),
        },
        action.motorState ?? null,
      );
    }

    case "SELECT_PARAMETER":
      return selectParameterByCode(state, action.code, HMI_MODES);

    case "IMPORT_CONFIGURATION":
      return applyImportedConfiguration(state, action.snapshot);

    case "APPLY_SCENARIO_PRESET":
      return applyScenarioPreset(state, action.preset);

    case "ENTER_SELECT_MODE":
      return { ...state, mode: HMI_MODES.SELECT_PARAM };

    case "PRESS_P": {
      const handler = PRESS_P_HANDLERS[state.mode];
      const nextState = handler ? handler(state) : state;
      return state.alarmCode !== null
        ? { ...nextState, alarmAcknowledged: true }
        : nextState;
    }

    case "PRESS_UP":
      return state.alarmCode !== null
        ? { ...handleStep(state, 1), alarmAcknowledged: true }
        : handleStep(state, 1);

    case "PRESS_DOWN":
      return state.alarmCode !== null
        ? { ...handleStep(state, -1), alarmAcknowledged: true }
        : handleStep(state, -1);

    case "PRESS_RUN":
      return toggleRun(state, true);

    case "PRESS_STOP":
      if (state.faultCode !== null) {
        return withSyncedParameters(resetFault({ ...state, running: false }));
      }
      return toggleRun(state, false);

    case "EMERGENCY_STOP":
      // Parada de emergencia (no CFW100 vem de uma DI; gatilho da DI na Fase 5).
      return withSyncedParameters({ ...state, emergencyStop: true });

    case "SET_LOAD":
      // Conjugado resistente da carga, em % do torque nominal (0..150).
      return withSyncedParameters({
        ...state,
        loadPercent: sanitizeLoadPercent(action.value, state.loadPercent),
      });

    case "SET_DIGITAL_INPUT": {
      const inputIndex = sanitizeDigitalInputIndex(action.index, -1);
      if (inputIndex < 0) {
        return state;
      }
      return withSyncedParameters({
        ...state,
        digitalInputs: state.digitalInputs.map((active, index) =>
          index === inputIndex ? sanitizeBoolean(action.value, active) : active,
        ),
      });
    }

    case "SET_AI1_PERCENT":
      return withSyncedParameters({
        ...state,
        externalSources: {
          ...state.externalSources,
          ai1Percent: sanitizeAi1Percent(
            action.value,
            state.externalSources.ai1Percent,
          ),
        },
      });

    case "SET_FI_FREQUENCY":
      return withSyncedParameters({
        ...state,
        externalSources: {
          ...state.externalSources,
          fiFrequency: sanitizeFiFrequency(
            action.value,
            state.externalSources.fiFrequency,
          ),
        },
      });

    case "SET_EXTERNAL_SOURCE":
      return withSyncedParameters({
        ...state,
        externalSources: sanitizeExternalSourceUpdate(
          action.source,
          action.value,
          state.externalSources,
        ),
      });

    case "SET_UNDERVOLTAGE":
      return withSyncedParameters({
        ...state,
        undervoltage: sanitizeBoolean(action.value, state.undervoltage),
      });

    case "RAISE_FAULT":
      {
        const faultCode = normalizeKnownFaultCode(action.code);
        if (faultCode === null) {
          return state;
        }

        return withSyncedParameters(
          raiseFault(
            {
              ...state,
              lastFault: {
                code: faultCode,
                current: state.parameters.P003.value,
                dcVoltage: state.parameters.P004.value,
                frequency: state.parameters.P005.value,
                temperature: state.parameters.P030.value,
              },
            },
            faultCode,
          ),
        );
      }

    case "RESET_FAULT":
      return withSyncedParameters(resetFault(state));

    case "RAISE_ALARM":
      return withSyncedParameters({
        ...raiseAlarm(state, action.code),
        alarmAcknowledged: false,
      });

    case "CLEAR_ALARM":
      return withSyncedParameters({
        ...clearAlarm(state),
        alarmAcknowledged: false,
      });

    case "START_AUTOMATION_CYCLE":
      return {
        ...state,
        automationCycle:
          typeof action.cycle === "string" && action.cycle.trim()
            ? action.cycle
            : state.automationCycle,
        automationStartTime: Date.now(),
        running: true,
      };

    case "STOP_AUTOMATION_CYCLE":
      return {
        ...state,
        automationCycle: null,
        automationStartTime: null,
        running: false,
      };

    case "UPDATE_AUTOMATION_SPEED":
      return withSyncedParameters({
        ...state,
        // "speed" e nome legado da action; o valor representa frequencia em Hz.
        referenceFrequency: sanitizeReferenceFrequency(
          action.speed,
          state.parameters,
          state.referenceFrequency,
        ),
        running:
          action.running === undefined
            ? state.running
            : sanitizeBoolean(action.running, state.running),
      });

    default:
      return state;
  }
}

export function getDisplayModel(state) {
  return getDisplayModelForState(state, getSelectedParameter(state));
}

export function getSelectedParameterInfo(state) {
  return getSelectedParameter(state);
}

export { getNextParameterCode, getPreviousParameterCode };

