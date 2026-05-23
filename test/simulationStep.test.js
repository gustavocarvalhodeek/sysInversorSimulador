import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialHmiState, hmiReducer } from "../src/hmi/cfw100Hmi.js";
import { createInitialDriveState } from "../src/simulation/cfw100DriveSimulation.js";
import { stepSimulationTick } from "../src/simulation/cfw100SimulationStep.js";
import { setStorage } from "../src/utils/persistence.js";

setStorage(null);

test("passo centralizado retorna rampa, motor e Ixt coerentes", () => {
  let hmi = createInitialHmiState();
  hmi = hmiReducer(hmi, { type: "PRESS_RUN" });

  const next = stepSimulationTick({
    driveState: createInitialDriveState(),
    hmiState: hmi,
    ixtPercent: hmi.ixtPercent,
    deltaMs: 1000,
  });

  assert.ok(next.driveState.outputFrequency > 0);
  assert.ok(next.motorState.current > 0);
  assert.ok(next.ixtPercent >= 0);
});

test("SYNC_DRIVE_STATE reaproveita o motorState calculado no passo físico", () => {
  let hmi = createInitialHmiState();
  hmi = hmiReducer(hmi, { type: "PRESS_RUN" });

  const next = stepSimulationTick({
    driveState: createInitialDriveState(),
    hmiState: hmi,
    ixtPercent: hmi.ixtPercent,
    deltaMs: 1000,
  });
  const synced = hmiReducer(hmi, {
    type: "SYNC_DRIVE_STATE",
    outputFrequency: next.driveState.outputFrequency,
    motorState: next.motorState,
    ixtPercent: next.ixtPercent,
  });

  assert.equal(synced.motorState, next.motorState);
  assert.equal(
    synced.parameters.P003.value,
    Number(next.motorState.current.toFixed(1)),
  );
});
