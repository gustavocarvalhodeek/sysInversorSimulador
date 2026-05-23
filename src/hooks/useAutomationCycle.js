import { useEffect, useRef } from "react";
import {
  getSafeFrequencyLimits,
  toFiniteNumber,
} from "../utils/sanitizers.js";

const CYCLE_MS = 80_000;
const ACCELERATION_END_MS = 10_000;
const HOLD_END_MS = 40_000;
const DECELERATION_END_MS = 50_000;

function clampProgress(value) {
  return Math.max(0, Math.min(1, value));
}

function interpolate(start, end, progress) {
  return start + (end - start) * clampProgress(progress);
}

export function resolveAutomationCycleUpdate({
  automationCycle,
  elapsedMs,
  parameters,
}) {
  const { minimumFrequency, maximumFrequency } = getSafeFrequencyLimits(
    parameters,
  );
  const safeElapsedMs = Math.max(0, toFiniteNumber(elapsedMs, 0));
  const positionInCycle = safeElapsedMs % CYCLE_MS;

  let targetFrequency = minimumFrequency;
  let shouldRun = false;

  if (automationCycle === "acceleration") {
    if (positionInCycle < ACCELERATION_END_MS) {
      targetFrequency = interpolate(
        minimumFrequency,
        maximumFrequency,
        positionInCycle / ACCELERATION_END_MS,
      );
      shouldRun = true;
    } else if (positionInCycle < HOLD_END_MS) {
      targetFrequency = maximumFrequency;
      shouldRun = true;
    } else if (positionInCycle < DECELERATION_END_MS) {
      targetFrequency = interpolate(
        maximumFrequency,
        minimumFrequency,
        (positionInCycle - HOLD_END_MS) /
          (DECELERATION_END_MS - HOLD_END_MS),
      );
      shouldRun = true;
    }
  }

  return {
    targetFrequency,
    shouldRun,
    minimumFrequency,
    maximumFrequency,
    positionInCycle,
  };
}

export function useAutomationCycle(hmiState, dispatch) {
  const automationStateRef = useRef({
    automationCycle: hmiState.automationCycle,
    automationStartTime: hmiState.automationStartTime,
    parameters: hmiState.parameters,
  });

  useEffect(() => {
    automationStateRef.current = {
      automationCycle: hmiState.automationCycle,
      automationStartTime: hmiState.automationStartTime,
      parameters: hmiState.parameters,
    };
  }, [hmiState.automationCycle, hmiState.automationStartTime, hmiState.parameters]);

  useEffect(() => {
    if (!hmiState.automationCycle || !hmiState.automationStartTime) {
      return;
    }

    const interval = setInterval(() => {
      const {
        automationCycle,
        automationStartTime,
        parameters,
      } = automationStateRef.current;

      if (!automationCycle || !automationStartTime) {
        return;
      }

      const elapsedMs = Date.now() - automationStartTime;
      const { targetFrequency, shouldRun } = resolveAutomationCycleUpdate({
        automationCycle,
        elapsedMs,
        parameters,
      });

      dispatch({
        type: "UPDATE_AUTOMATION_SPEED",
        // Mantido como "speed" por compatibilidade; o valor agora e Hz.
        speed: Math.round(targetFrequency * 10) / 10,
        running: shouldRun,
      });
    }, 100);

    return () => clearInterval(interval);
  }, [dispatch, hmiState.automationCycle, hmiState.automationStartTime]);
}
