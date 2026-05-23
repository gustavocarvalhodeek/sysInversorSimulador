const FAULT_TRIGGER_TYPES = {
  MANUAL: "manual",
  AUTOMATIC: "automatic",
  BOTH: "both",
};

export const FAULT_CODES = {
  OVERCURRENT: 3,
  DC_BUS_OVERVOLTAGE: 4,
  DC_BUS_UNDERVOLTAGE: 5,
  PHASE_LOSS: 6,
  PHASE_SEQUENCE: 7,
  GENERIC_THERMAL: 10,
  SERIAL_COMMUNICATION: 12,
  ENCODER: 14,
  BRAKE: 16,
  RAMP: 17,
  FIRMWARE: 20,
  MODULE_OVERTEMPERATURE: 51,
  GENERIC_SIMULATED: 70,
  IXT_OVERLOAD: 72,
  EXTERNAL_PLC: 88,
  COMMUNICATION_PORT: 98,
};

export const FAULT_CATALOG = Object.freeze([
  {
    code: FAULT_CODES.OVERCURRENT,
    shortLabel: "Sobrecorrente",
    description: "Corrente acima do limite da etapa de potencia.",
    category: "power",
    triggerType: FAULT_TRIGGER_TYPES.MANUAL,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Injecao manual didatica pelo painel de falhas.",
  },
  {
    code: FAULT_CODES.DC_BUS_OVERVOLTAGE,
    shortLabel: "Sobretensao CC",
    description: "Tensao do barramento CC acima do limite seguro.",
    category: "power",
    triggerType: FAULT_TRIGGER_TYPES.MANUAL,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Injecao manual didatica pelo painel de falhas.",
  },
  {
    code: FAULT_CODES.DC_BUS_UNDERVOLTAGE,
    shortLabel: "Subtensao CC",
    description: "Falha F005 simulada manualmente. Diferente do estado SUB tratado separadamente pela HMI.",
    category: "power",
    triggerType: FAULT_TRIGGER_TYPES.MANUAL,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "O estado SUB continua sendo um estado operacional, nao uma falha automatica deste simulador.",
  },
  {
    code: FAULT_CODES.PHASE_LOSS,
    shortLabel: "Falta de fase",
    description: "Ausencia de uma ou mais fases de alimentacao ou saida.",
    category: "power",
    triggerType: FAULT_TRIGGER_TYPES.MANUAL,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Injecao manual didatica pelo painel de falhas.",
  },
  {
    code: FAULT_CODES.PHASE_SEQUENCE,
    shortLabel: "Sequencia de fases",
    description: "Sequencia de fases inconsistente ou invertida.",
    category: "power",
    triggerType: FAULT_TRIGGER_TYPES.MANUAL,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Injecao manual didatica pelo painel de falhas.",
  },
  {
    code: FAULT_CODES.GENERIC_THERMAL,
    shortLabel: "Falha termica generica",
    description: "Falha termica manual generica para treinamento. Nao substitui a F051 automatica do modulo.",
    category: "thermal",
    triggerType: FAULT_TRIGGER_TYPES.MANUAL,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Mantida apenas como injecao manual didatica.",
  },
  {
    code: FAULT_CODES.SERIAL_COMMUNICATION,
    shortLabel: "Falha de comunicacao",
    description: "Erro de comunicacao serial ou perda de link.",
    category: "communication",
    triggerType: FAULT_TRIGGER_TYPES.MANUAL,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Injecao manual didatica pelo painel de falhas.",
  },
  {
    code: FAULT_CODES.ENCODER,
    shortLabel: "Falha de encoder",
    description: "Problema de feedback de velocidade/posicao.",
    category: "feedback",
    triggerType: FAULT_TRIGGER_TYPES.MANUAL,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Injecao manual didatica pelo painel de falhas.",
  },
  {
    code: FAULT_CODES.BRAKE,
    shortLabel: "Falha de freio",
    description: "Falha no circuito ou comando de freio.",
    category: "control",
    triggerType: FAULT_TRIGGER_TYPES.MANUAL,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Injecao manual didatica pelo painel de falhas.",
  },
  {
    code: FAULT_CODES.RAMP,
    shortLabel: "Falha de rampa",
    description: "Erro didatico associado a geracao de rampa/comando.",
    category: "control",
    triggerType: FAULT_TRIGGER_TYPES.MANUAL,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Injecao manual didatica pelo painel de falhas.",
  },
  {
    code: FAULT_CODES.FIRMWARE,
    shortLabel: "Falha de firmware",
    description: "Erro interno de firmware ou memoria.",
    category: "internal",
    triggerType: FAULT_TRIGGER_TYPES.MANUAL,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Injecao manual didatica pelo painel de falhas.",
  },
  {
    code: FAULT_CODES.MODULE_OVERTEMPERATURE,
    shortLabel: "Supertemperatura do modulo",
    description: "Temperatura do modulo de potencia acima do limite termico (P030 >= 85 C).",
    category: "thermal",
    triggerType: FAULT_TRIGGER_TYPES.BOTH,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Disparo automatico pelo modelo termico; o painel tambem permite injecao manual didatica.",
  },
  {
    code: FAULT_CODES.GENERIC_SIMULATED,
    shortLabel: "Falha generica simulada",
    description: "Codigo generico usado pelo simulador para testes de display, reset e regressao.",
    category: "generic",
    triggerType: FAULT_TRIGGER_TYPES.MANUAL,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Mantido para testes e exercicios didaticos.",
  },
  {
    code: FAULT_CODES.IXT_OVERLOAD,
    shortLabel: "Sobrecarga Ixt",
    description: "Protecao termica Ixt do motor atingiu 100% por sobrecarga prolongada.",
    category: "overload",
    triggerType: FAULT_TRIGGER_TYPES.BOTH,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Disparo automatico pelo acumulador Ixt; o painel tambem permite injecao manual didatica.",
  },
  {
    code: FAULT_CODES.EXTERNAL_PLC,
    shortLabel: "Falha de CLP externo",
    description: "Falha de comunicacao ou logica no CLP externo.",
    category: "communication",
    triggerType: FAULT_TRIGGER_TYPES.MANUAL,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Injecao manual didatica pelo painel de falhas.",
  },
  {
    code: FAULT_CODES.COMMUNICATION_PORT,
    shortLabel: "Falha de porta",
    description: "Erro em porta ou interface de comunicacao.",
    category: "communication",
    triggerType: FAULT_TRIGGER_TYPES.MANUAL,
    resetBehavior: "manual_reset",
    simulated: true,
    notes: "Injecao manual didatica pelo painel de falhas.",
  },
]);

export const FAULTS_BY_CODE = Object.freeze(
  Object.fromEntries(FAULT_CATALOG.map((fault) => [fault.code, fault])),
);

function normalizeEventCodeNumber(code) {
  const numericCode = Number(code);
  return Number.isFinite(numericCode)
    ? Math.max(0, Math.min(999, Math.trunc(numericCode)))
    : null;
}

export function getFaultDefinition(code) {
  const normalizedCode = normalizeEventCodeNumber(code);
  return normalizedCode === null ? null : FAULTS_BY_CODE[normalizedCode] ?? null;
}

export function normalizeKnownFaultCode(code) {
  const fault = getFaultDefinition(code);
  return fault ? fault.code : null;
}

export function canTriggerFaultManually(code) {
  const fault = getFaultDefinition(code);
  return fault
    ? fault.triggerType === FAULT_TRIGGER_TYPES.MANUAL ||
        fault.triggerType === FAULT_TRIGGER_TYPES.BOTH
    : false;
}

export function getSimulatorFaultCatalog() {
  return FAULT_CATALOG.filter(
    (fault) => fault.simulated && canTriggerFaultManually(fault.code),
  );
}

export function getFaultTriggerLabel(code) {
  const fault = getFaultDefinition(code);
  if (!fault) {
    return "desconhecida";
  }

  switch (fault.triggerType) {
    case FAULT_TRIGGER_TYPES.AUTOMATIC:
      return "Automatica";
    case FAULT_TRIGGER_TYPES.BOTH:
      return "Automatica + manual";
    default:
      return "Manual";
  }
}

export function resolveAutomaticFaultCode({
  ixtPercent,
  moduleTemperature,
  thermalTripTemp,
}) {
  if (
    Number.isFinite(moduleTemperature) &&
    Number.isFinite(thermalTripTemp) &&
    moduleTemperature >= thermalTripTemp
  ) {
    return FAULT_CODES.MODULE_OVERTEMPERATURE;
  }

  if (Number.isFinite(ixtPercent) && ixtPercent >= 100) {
    return FAULT_CODES.IXT_OVERLOAD;
  }

  return null;
}
