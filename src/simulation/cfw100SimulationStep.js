import { resolveCommand } from "./commandResolver.js";
import { stepDriveSimulation } from "./cfw100DriveSimulation.js";
import { computeMotorState } from "./motorModel.js";
import { stepOverloadIxt } from "./overloadModel.js";

// ---------------------------------------------------------------------------
// Modelo térmico do módulo IGBT (P030)
// ---------------------------------------------------------------------------
// O calor gerado é proporcional a I² (efeito Joule nas perdas de chaveamento).
// O resfriamento é proporcional ao excesso de temperatura acima do ambiente.
//
//   dT/dt = k_heat × (I/Inom)² − k_cool × (T − Tamb)
//
// Constantes calibradas para o CFW100:
//   Tamb      = 40 °C  (temperatura ambiente típica)
//   k_heat    = 0.15   °C/s na carga nominal (steady-state ~70 °C)
//   k_cool    = 0.005  → constante de tempo térmica ~200 s
//   T_max     = 120 °C (limite de exibição)
//   T_trip    = 85 °C  → gera F051 (supertemperatura)
export const THERMAL_TRIP_TEMP = 85;

function stepModuleTemperature({ currentTemp, motorCurrent, nominalCurrent, deltaMs }) {
  const ambient  = 40;
  const kHeat    = 0.15;
  const kCool    = 0.005;
  const dt       = deltaMs / 1000;

  const loadRatio = nominalCurrent > 0 ? motorCurrent / nominalCurrent : 0;
  const dT = (kHeat * loadRatio * loadRatio - kCool * (currentTemp - ambient)) * dt;

  return Math.max(ambient, Math.min(120, currentTemp + dT));
}

// ---------------------------------------------------------------------------
// Passo físico completo do simulador: rampa, grandezas do motor e proteção Ixt.
// ---------------------------------------------------------------------------
export function stepSimulationTick({
  driveState,
  hmiState,
  ixtPercent,
  moduleTemperature,
  deltaMs,
}) {
  const nextDriveState = stepDriveSimulation(driveState, hmiState, deltaMs);
  const command = resolveCommand(hmiState);
  const motorState = computeMotorState({
    frequency: nextDriveState.outputFrequency,
    mechanicalHz: nextDriveState.mechanicalHz,
    df_dt: nextDriveState.df_dt,
    electricalOutputActive: nextDriveState.electricalOutputActive,
    isCoasting: nextDriveState.isCoasting,
    requestedFrequency: command.running ? command.referenceFrequency : 0,
    parameters: hmiState.parameters,
    loadPercent: hmiState.loadPercent,
    // Item 13 (P139): corrente filtrada do tick anterior para o filtro de 1ª ordem.
    lastFilteredCurrent: hmiState.parameters?.P003?.value ?? 0,
  });
  const nextIxtPercent = stepOverloadIxt({
    currentIxtPercent: ixtPercent,
    motorCurrent: motorState.current,
    overloadCurrent: hmiState.parameters.P156.value,
    deltaMs,
  });
  const nextModuleTemperature = stepModuleTemperature({
    currentTemp: moduleTemperature ?? 40,
    motorCurrent: motorState.current,
    nominalCurrent: hmiState.parameters.P401?.value ?? 1.4,
    deltaMs,
  });

  return {
    driveState: nextDriveState,
    motorState,
    ixtPercent: nextIxtPercent,
    moduleTemperature: nextModuleTemperature,
  };
}
