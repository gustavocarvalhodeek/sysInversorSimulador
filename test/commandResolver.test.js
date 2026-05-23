import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialHmiState } from "../src/hmi/cfw100Hmi.js";
import { resolveCommand } from "../src/simulation/commandResolver.js";
import { setStorage } from "../src/utils/persistence.js";

setStorage(null);

test("referencia (em funcionamento) e limitada por P133 e P134", () => {
  const hmi = createInitialHmiState();

  const acima = resolveCommand({
    ...hmi,
    running: true,
    referenceFrequency: 999,
  });
  assert.equal(acima.referenceFrequency, hmi.parameters.P134.value);

  const abaixo = resolveCommand({
    ...hmi,
    running: true,
    referenceFrequency: 1, // magnitude < P133 (3 Hz)
  });
  // piso P133; sentido horario => positivo.
  assert.equal(abaixo.referenceFrequency, hmi.parameters.P133.value);
});

test("estado de comando reflete running (com fonte HMI de fabrica)", () => {
  const hmi = createInitialHmiState();
  assert.equal(resolveCommand({ ...hmi, running: false }).running, false);
  assert.equal(resolveCommand({ ...hmi, running: true }).running, true);
});

test("fonte de comando/referencia de fabrica e a HMI", () => {
  const hmi = createInitialHmiState();
  const command = resolveCommand(hmi);
  assert.equal(command.referenceSource.kind, "HMI");
  assert.equal(command.commandSource.kind, "HMI");
  assert.equal(command.mode, "LOCAL");
});

test("estado CONFIG bloqueia comando mesmo com running=true", () => {
  const hmi = createInitialHmiState();
  hmi.parameters.P264.value = 4;
  hmi.parameters.P265.value = 4;

  const command = resolveCommand({ ...hmi, running: true });
  assert.equal(command.running, false);
  assert.equal(command.referenceFrequency, 0);
  assert.ok(
    command.status.some(
      (status) =>
        status?.key === "commandStatusNotes.pwmBlocked" &&
        status.params?.reason === "CONFIG" &&
        status.fallback === "PWM bloqueado por CONFIG.",
    ),
  );
});
