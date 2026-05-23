import { useEffect, useRef } from "react";
import {
  createInitialDriveState,
  createDriveStateFromRuntime,
} from "../simulation/cfw100DriveSimulation.js";
import { advance, createEngine } from "../simulation/engine.js";
import {
  stepSimulationTick,
  THERMAL_TRIP_TEMP,
} from "../simulation/cfw100SimulationStep.js";
import { resolveCommand } from "../simulation/commandResolver.js";
import { resolveAutomaticFaultCode } from "../logic/faultCatalog.js";

export function useDriveSimulationRuntime(hmiState, dispatch) {
  const driveStateRef = useRef(createInitialDriveState());
  const hmiStateRef = useRef(hmiState);
  const engineRef = useRef(createEngine());
  const lastFrameRef = useRef(0);
  const automaticFaultPendingRef = useRef(null);

  useEffect(() => {
    hmiStateRef.current = hmiState;
    if (hmiState.faultCode === null) {
      automaticFaultPendingRef.current = null;
    }
  }, [hmiState]);

  useEffect(() => {
    if (!hmiState.runtimeSeedVersion) {
      return;
    }

    driveStateRef.current = createDriveStateFromRuntime(hmiStateRef.current);
    engineRef.current = createEngine();
    lastFrameRef.current = 0;
  }, [hmiState.runtimeSeedVersion]);

  useEffect(() => {
    let animationFrameId = 0;

    const animate = (timestamp) => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp;
      }

      const deltaMs = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;

      let nextIxtPercent = hmiStateRef.current.ixtPercent;
      let nextMotorState = hmiStateRef.current.motorState;
      let nextModuleTemp = hmiStateRef.current.moduleTemperature ?? 40;

      advance(engineRef.current, deltaMs, (tickMs) => {
        const nextSimulation = stepSimulationTick({
          driveState: driveStateRef.current,
          hmiState: hmiStateRef.current,
          ixtPercent: nextIxtPercent,
          moduleTemperature: nextModuleTemp,
          deltaMs: tickMs,
        });
        driveStateRef.current = nextSimulation.driveState;
        nextMotorState = nextSimulation.motorState;
        nextIxtPercent = nextSimulation.ixtPercent;
        nextModuleTemp = nextSimulation.moduleTemperature;
      });

      if (
        driveStateRef.current.outputFrequency !==
          hmiStateRef.current.outputFrequency ||
        driveStateRef.current.mechanicalHz !== hmiStateRef.current.mechanicalHz ||
        driveStateRef.current.electricalOutputActive !==
          hmiStateRef.current.electricalOutputActive ||
        driveStateRef.current.isCoasting !== hmiStateRef.current.isCoasting ||
        nextIxtPercent !== hmiStateRef.current.ixtPercent ||
        nextModuleTemp !== hmiStateRef.current.moduleTemperature
      ) {
        dispatch({
          type: "SYNC_DRIVE_STATE",
          outputFrequency: driveStateRef.current.outputFrequency,
          mechanicalHz: driveStateRef.current.mechanicalHz,
          electricalOutputActive: driveStateRef.current.electricalOutputActive,
          isCoasting: driveStateRef.current.isCoasting,
          motorState: nextMotorState,
          ixtPercent: nextIxtPercent,
          moduleTemperature: nextModuleTemp,
        });
      }

      const automaticFaultCode = resolveAutomaticFaultCode({
        ixtPercent: nextIxtPercent,
        moduleTemperature: nextModuleTemp,
        thermalTripTemp: THERMAL_TRIP_TEMP,
      });

      if (
        automaticFaultCode !== null &&
        hmiStateRef.current.faultCode === null &&
        automaticFaultPendingRef.current !== automaticFaultCode
      ) {
        automaticFaultPendingRef.current = automaticFaultCode;
        dispatch({ type: "RAISE_FAULT", code: automaticFaultCode });
      }

      if (hmiStateRef.current.faultCode !== null) {
        const cmd = resolveCommand(hmiStateRef.current);
        if (cmd.faultResetRequest) {
          dispatch({ type: "RESET_FAULT" });
        }
      }

      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [dispatch]);
}
