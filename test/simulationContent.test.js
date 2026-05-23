import { test } from "node:test";
import assert from "node:assert/strict";
import { CFW100_PARAMETER_CATALOG } from "../src/hmi/parameters/cfw100ParameterCatalog.js";
import { resolveSimulationTabModel } from "../src/components/parameter-info/simulationContent.js";

const byCode = Object.fromEntries(
  CFW100_PARAMETER_CATALOG.map((parameter) => [parameter.code, parameter]),
);

const normalizeText = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

test("quando simulatorBehavior existe ele tem prioridade sobre longDescription", () => {
  const model = resolveSimulationTabModel(byCode.P121);

  assert.equal(
    model.primaryText,
    byCode.P121.simulatorBehavior,
  );
  assert.notEqual(model.primaryText, byCode.P121.longDescription);
  assert.equal(model.generalDescriptionText, byCode.P121.longDescription);
});

test("parametro com suporte parcial mostra comportamento e limitacao real", () => {
  const model = resolveSimulationTabModel(byCode.P221);

  assert.equal(model.primaryText, byCode.P221.simulatorBehavior);
  assert.match(model.statusMessage, /Suporte parcial/i);
});

test("parametro editavel sem efeito mostra texto honesto sem prometer implementacao", () => {
  const model = resolveSimulationTabModel(byCode.P231);

  assert.equal(model.primaryTitle, "Comportamento documentado");
  assert.equal(model.primaryText, byCode.P231.simulatorBehavior);
  assert.ok(
    normalizeText(model.statusMessage).includes(
      "ainda nao altera diretamente o nucleo de simulacao",
    ),
  );
});

test("parametro sem simulatorBehavior mostra fallback honesto do status real", () => {
  const model = resolveSimulationTabModel(byCode.P283);

  assert.ok(
    normalizeText(model.primaryText).includes(
      "consulta/edicao, mas ainda nao altera diretamente o nucleo de simulacao",
    ),
  );
  assert.equal(model.statusMessage, "");
});

test("parametro somente leitura usa comportamento especifico e explica telemetria", () => {
  const model = resolveSimulationTabModel(byCode.P001);

  assert.equal(model.primaryText, byCode.P001.simulatorBehavior);
  assert.match(model.statusMessage, /Somente leitura\/telemetria/i);
});

test("campo de simulacao alternativo com 0 continua visivel", () => {
  const model = resolveSimulationTabModel({
    implementationStatus: "full",
    simulationEffects: [],
    simulatorBehavior: "",
    simulationBehavior: "",
    simulationNotes: "0 s de atraso adicional.",
    longDescription: "Descricao geral",
    description: "",
  });

  assert.equal(model.primaryText, "0 s de atraso adicional.");
});
