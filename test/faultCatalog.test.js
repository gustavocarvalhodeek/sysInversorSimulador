import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialHmiState, hmiReducer } from "../src/hmi/cfw100Hmi.js";
import {
  FAULT_CATALOG,
  FAULT_CODES,
  getFaultDefinition,
  getFaultTriggerLabel,
  getSimulatorFaultCatalog,
  resolveAutomaticFaultCode,
} from "../src/logic/faultCatalog.js";

test("catalogo central alinha F072 com sobrecarga Ixt e F051 com supertemperatura", () => {
  const overloadFault = getFaultDefinition(FAULT_CODES.IXT_OVERLOAD);
  const thermalFault = getFaultDefinition(FAULT_CODES.MODULE_OVERTEMPERATURE);

  assert.equal(overloadFault.shortLabel, "Sobrecarga Ixt");
  assert.match(overloadFault.description, /Ixt|sobrecarga/i);
  assert.equal(thermalFault.shortLabel, "Supertemperatura do modulo");
  assert.match(thermalFault.description, /modulo|temperatura/i);
});

test("catalogo central nao possui codigos duplicados conflitantes", () => {
  const codes = FAULT_CATALOG.map((fault) => fault.code);
  assert.equal(new Set(codes).size, codes.length);
});

test("lista do simulador inclui F051 e F072 com trigger coerente", () => {
  const simulatorFaults = getSimulatorFaultCatalog();
  const codes = simulatorFaults.map((fault) => fault.code);

  assert.ok(codes.includes(FAULT_CODES.MODULE_OVERTEMPERATURE));
  assert.ok(codes.includes(FAULT_CODES.IXT_OVERLOAD));
  assert.equal(
    getFaultTriggerLabel(FAULT_CODES.MODULE_OVERTEMPERATURE),
    "Automatica + manual",
  );
  assert.equal(
    getFaultTriggerLabel(FAULT_CODES.IXT_OVERLOAD),
    "Automatica + manual",
  );
});

test("disparo automatico usa F072 para Ixt e F051 para temperatura", () => {
  assert.equal(
    resolveAutomaticFaultCode({
      ixtPercent: 100,
      moduleTemperature: 60,
      thermalTripTemp: 85,
    }),
    FAULT_CODES.IXT_OVERLOAD,
  );

  assert.equal(
    resolveAutomaticFaultCode({
      ixtPercent: 40,
      moduleTemperature: 85,
      thermalTripTemp: 85,
    }),
    FAULT_CODES.MODULE_OVERTEMPERATURE,
  );
});

test("RAISE_FAULT rejeita codigo desconhecido sem corromper o estado", () => {
  let state = createInitialHmiState();
  state = hmiReducer(state, { type: "PRESS_RUN" });

  const nextState = hmiReducer(state, { type: "RAISE_FAULT", code: 999 });

  assert.equal(nextState, state);
  assert.equal(nextState.faultCode, null);
  assert.equal(nextState.lastFault, null);
  assert.equal(nextState.running, true);
});
