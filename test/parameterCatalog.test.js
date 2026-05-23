import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CFW100_PARAMETER_CATALOG,
  CFW100_PARAMETER_SCHEMA,
} from "../src/hmi/parameters/cfw100ParameterCatalog.js";
import { IMPLEMENTATION_STATUS } from "../src/hmi/parameters/cfw100ParameterSimulationSupport.js";

const byCode = Object.fromEntries(
  CFW100_PARAMETER_CATALOG.map((parameter) => [parameter.code, parameter]),
);

test("parâmetros de referência recebem padrão e faixa operacionais do JSON", () => {
  assert.equal(byCode.P120.value, 1);
  assert.equal(byCode.P120.min, 0);
  assert.equal(byCode.P120.max, 2);

  assert.equal(byCode.P251.value, 2);
  assert.equal(byCode.P251.min, 0);
  assert.equal(byCode.P251.max, 28);

  assert.equal(byCode.P151.value, 380);
  assert.equal(byCode.P151.min, 325);
  assert.equal(byCode.P151.max, 460);
  assert.equal(byCode.P151.unit, "V");
});

test("parâmetros que reutilizam opções herdadas deixam de usar 0..9999", () => {
  assert.equal(byCode.P263.value, 1);
  assert.equal(byCode.P263.min, 0);
  assert.equal(byCode.P263.max, 48);
  assert.equal(byCode.P263.unit, "");
  assert.ok(byCode.P263.options.length > 0);

  assert.equal(byCode.P264.value, 8);
  assert.equal(byCode.P264.min, 0);
  assert.equal(byCode.P264.max, 48);
  assert.ok(byCode.P264.options.length > 0);
});

test("metadados decimais são derivados para edição coerente", () => {
  assert.equal(byCode.P232.value, 1);
  assert.equal(byCode.P232.decimals, 3);
  assert.equal(byCode.P232.step, 0.001);
  assert.equal(byCode.P232.min, 0);
  assert.equal(byCode.P232.max, 9.999);

  assert.equal(byCode.P234.value, 0);
  assert.equal(byCode.P234.decimals, 1);
  assert.equal(byCode.P234.step, 0.1);
  assert.equal(byCode.P234.min, -100);
  assert.equal(byCode.P234.max, 100);
  assert.equal(byCode.P234.unit, "%");
});

test("schema canônico centraliza manual, runtime e simulação", () => {
  assert.equal(CFW100_PARAMETER_SCHEMA.length, CFW100_PARAMETER_CATALOG.length);

  for (const parameter of CFW100_PARAMETER_SCHEMA) {
    assert.ok(parameter.manual, `${parameter.code} sem bloco manual`);
    assert.ok(parameter.runtime, `${parameter.code} sem bloco runtime`);
    assert.ok(parameter.simulation, `${parameter.code} sem bloco simulation`);
  }

  const schemaP121 = CFW100_PARAMETER_SCHEMA.find(
    (parameter) => parameter.code === "P121",
  );
  assert.equal(schemaP121.manual.name, byCode.P121.name);
  assert.equal(schemaP121.runtime.value, byCode.P121.value);
  assert.equal(
    schemaP121.simulation.implementationStatus,
    byCode.P121.implementationStatus,
  );
});

test("status de implementação representa o suporte real do simulador", () => {
  assert.equal(byCode.P202.implementationStatus, IMPLEMENTATION_STATUS.FULL);
  assert.deepEqual(byCode.P202.simulationEffects, ["motor_control_mode"]);

  assert.equal(byCode.P122.implementationStatus, IMPLEMENTATION_STATUS.FULL);
  assert.deepEqual(byCode.P122.simulationEffects, ["jog_reference"]);

  assert.equal(byCode.P156.implementationStatus, IMPLEMENTATION_STATUS.FULL);
  assert.deepEqual(byCode.P156.simulationEffects, ["overload_protection"]);

  assert.equal(
    byCode.P263.implementationStatus,
    IMPLEMENTATION_STATUS.PARTIAL,
  );
  assert.equal(
    byCode.P231.implementationStatus,
    IMPLEMENTATION_STATUS.EDITABLE_WITHOUT_EFFECT,
  );
  assert.equal(
    byCode.P001.implementationStatus,
    IMPLEMENTATION_STATUS.READ_ONLY_SUPPORTED,
  );
});
