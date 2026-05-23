import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialHmiState } from "../src/hmi/cfw100Hmi.js";
import { resolveCommand } from "../src/simulation/commandResolver.js";
import { setStorage } from "../src/utils/persistence.js";

setStorage(null);

function running(extra = {}) {
  const s = createInitialHmiState();
  return { ...s, running: true, ...extra };
}

test("defaults de fabrica P220-P228 e multispeed", () => {
  const s = createInitialHmiState();
  assert.equal(s.parameters.P220.value, 0); // Sempre Local
  assert.equal(s.parameters.P221.value, 0); // Teclas HMI
  assert.equal(s.parameters.P224.value, 0); // Comando HMI
  assert.equal(s.parameters.P223.value, 0); // Horario
  assert.equal(s.parameters.P124.value, 3);
  assert.equal(s.parameters.P130.value, 60);
  assert.equal(s.parameters.P122.value, 5);
});

test("config de fabrica: HMI comanda, referencia das teclas", () => {
  const s = running({ referenceFrequency: 45 });
  const c = resolveCommand(s);
  assert.equal(c.mode, "LOCAL");
  assert.equal(c.referenceSource.kind, "HMI");
  assert.equal(c.running, true);
  assert.equal(c.referenceFrequency, 45);
  assert.equal(c.status.length, 0);
});

test("sentido anti-horario (P223=1) inverte o sinal da referencia", () => {
  const s = running({ referenceFrequency: 40 });
  s.parameters.P223 = { ...s.parameters.P223, value: 1 };
  const c = resolveCommand(s);
  assert.equal(c.rotation.label, "Anti-horario");
  assert.equal(c.referenceFrequency, -40);
});

test("comando por DIx (P224=1) bloqueia partida pela HMI", () => {
  const s = running({ referenceFrequency: 50 });
  s.parameters.P224 = { ...s.parameters.P224, value: 1 };
  const c = resolveCommand(s);
  assert.equal(c.running, false);
  assert.equal(c.referenceFrequency, 0);
});

test("referencia AI1 (P221=1) usa o valor analogico simulado", () => {
  const s = running({ referenceFrequency: 55 });
  s.parameters.P221 = { ...s.parameters.P221, value: 1 };
  s.externalSources.ai1Percent = 50;
  const c = resolveCommand(s);
  assert.equal(c.referenceSource.kind, "AI1");
  assert.equal(c.referenceFrequency, 33);
});

test("multispeed (P221=8) usa P124 no indice 0, limitado por P133/P134", () => {
  const s = running();
  s.parameters.P221 = { ...s.parameters.P221, value: 8 };
  s.parameters.P124 = { ...s.parameters.P124, value: 25 };
  const c = resolveCommand(s);
  assert.equal(c.referenceSource.kind, "MULTISPEED");
  assert.equal(c.referenceFrequency, 25);
});

test("DIx com funcao multispeed seleciona referencias diferentes", () => {
  const s = running();
  s.parameters.P221 = { ...s.parameters.P221, value: 8 };
  s.parameters.P263 = { ...s.parameters.P263, value: 13 };
  s.parameters.P264 = { ...s.parameters.P264, value: 13 };
  s.parameters.P125 = { ...s.parameters.P125, value: 10 };
  s.parameters.P126 = { ...s.parameters.P126, value: 20 };
  s.digitalInputs = [true, false, false, false, false, false, false, false];
  assert.equal(resolveCommand(s).referenceFrequency, 10);

  s.digitalInputs = [false, true, false, false, false, false, false, false];
  assert.equal(resolveCommand(s).referenceFrequency, 20);
});

test("comando por DIx aciona o inversor quando Gira/Para esta ativo", () => {
  const s = running({ running: false, referenceFrequency: 40 });
  s.parameters.P224 = { ...s.parameters.P224, value: 1 };
  s.parameters.P263 = { ...s.parameters.P263, value: 1 };
  s.digitalInputs = [true, false, false, false, false, false, false, false];
  const c = resolveCommand(s);
  assert.equal(c.commandSource.kind, "DI");
  assert.equal(c.running, true);
  assert.equal(c.referenceFrequency, 40);
});

test("fontes serial, CO/DN e SoftPLC usam referencias 13 bits", () => {
  const s = running({ running: false });
  s.parameters.P224 = { ...s.parameters.P224, value: 2 };
  s.parameters.P221 = { ...s.parameters.P221, value: 9 };
  s.externalSources.serial = {
    ...s.externalSources.serial,
    run: true,
    speed13Bit: 4096,
  };
  assert.equal(resolveCommand(s).referenceFrequency, 30);

  s.parameters.P224 = { ...s.parameters.P224, value: 4 };
  s.parameters.P221 = { ...s.parameters.P221, value: 11 };
  s.externalSources.codn = {
    ...s.externalSources.codn,
    run: true,
    speed13Bit: 8192,
  };
  assert.equal(resolveCommand(s).referenceFrequency, 60);

  s.parameters.P224 = { ...s.parameters.P224, value: 5 };
  s.parameters.P221 = { ...s.parameters.P221, value: 12 };
  s.externalSources.softplc = {
    ...s.externalSources.softplc,
    run: true,
    speed13Bit: 2048,
  };
  assert.equal(resolveCommand(s).referenceFrequency, 15);
});

test("JOG por DIx usa P122 mesmo sem comando de run", () => {
  const s = running({ running: false });
  s.parameters.P225 = { ...s.parameters.P225, value: 2 };
  s.parameters.P263 = { ...s.parameters.P263, value: 10 };
  s.parameters.P122 = { ...s.parameters.P122, value: 5 };
  s.digitalInputs = [true, false, false, false, false, false, false, false];
  const c = resolveCommand(s);
  assert.equal(c.jogActive, true);
  assert.equal(c.running, true);
  assert.equal(c.referenceFrequency, 5);
});

test("modo REMOTO usa P222 (default 2 = nao mapeado -> fallback HMI da tabela)", () => {
  const s = running({ referenceFrequency: 30 });
  s.parameters.P220 = { ...s.parameters.P220, value: 1 }; // Sempre Remoto
  const c = resolveCommand(s);
  assert.equal(c.mode, "REMOTE");
  // P222=2 nao existe na tabela de fontes -> fallback para HMI (codigo 0).
  assert.equal(c.referenceSource.kind, "HMI");
});

test("parado: referencia resolvida e 0", () => {
  const s = createInitialHmiState();
  assert.equal(resolveCommand(s).referenceFrequency, 0);
});
