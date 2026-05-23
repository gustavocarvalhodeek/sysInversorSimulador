function normalizeRuntimeSeedVersion(value) {
  return Number.isFinite(value) ? value : 0;
}

export function shouldResetMotorHistory(
  previousRuntimeSeedVersion,
  nextRuntimeSeedVersion,
) {
  return normalizeRuntimeSeedVersion(previousRuntimeSeedVersion) !==
    normalizeRuntimeSeedVersion(nextRuntimeSeedVersion);
}

export function applyMotorHistoryReset(panelState, runtimeContext) {
  return {
    ...panelState,
    samples: [],
    faultEvents: [],
    logs: [],
    frozenSamples: null,
    latestRefValue: {
      hmiState: runtimeContext.hmiState,
      motor: runtimeContext.motor,
    },
    prevFaultCode: runtimeContext.hmiState.faultCode,
    prevParameters: runtimeContext.hmiState.parameters,
    prevRunning: runtimeContext.isRunning,
  };
}
