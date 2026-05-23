import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialHmiState, hmiReducer } from "../src/hmi/cfw100Hmi.js";
import { computeMotorState } from "../src/simulation/motorModel.js";
import { setStorage } from "../src/utils/persistence.js";

setStorage(null);

const params = () => createInitialHmiState().parameters;

function motor(freq, load, overrides = {}) {
  const p = params();
  for (const [code, value] of Object.entries(overrides)) {
    p[code] = { ...p[code], value };
  }
  return computeMotorState({
    frequency: freq,
    requestedFrequency: freq,
    parameters: p,
    loadPercent: load,
  });
}

test("carga aumenta corrente e torque", () => {
  const vazio = motor(60, 0);
  const carga = motor(60, 100);
  assert.ok(carga.current > vazio.current, "corrente sob carga > vazio");
  assert.ok(carga.torquePercent > vazio.torquePercent);
});

test("escorregamento: rpm cai com carga e fica perto do sincrono em vazio", () => {
  const vazio = motor(60, 0);
  const carga = motor(60, 100);
  assert.ok(vazio.rpm > carga.rpm, "rpm em vazio > rpm com carga");
  assert.ok(vazio.rpm > 1790 && vazio.rpm <= 1800, `sincrono ~1800, obtido ${vazio.rpm}`);
});

test("curva V/f linear: 30 Hz ~110 V, 60 Hz ~220 V", () => {
  assert.ok(Math.abs(motor(30, 0).outputVoltage - 110) < 2);
  assert.ok(Math.abs(motor(60, 0).outputVoltage - 220) < 2);
});

test("V/f quadratico (P202=1) entrega menos tensao em baixa rotacao", () => {
  const linear = motor(30, 0);
  const quad = motor(30, 0, { P202: 1 });
  assert.ok(quad.outputVoltage < linear.outputVoltage * 0.6);
});

test("boost manual (P136) eleva tensao em baixa frequencia", () => {
  const semBoost = motor(6, 0);
  const comBoost = motor(6, 0, { P136: 10 });
  assert.ok(comBoost.outputVoltage > semBoost.outputVoltage);
});

test("enfraquecimento de campo: tensao satura acima de P145", () => {
  const a60 = motor(60, 0, { P134: 120 });
  const a90 = motor(90, 0, { P134: 120 });
  assert.ok(Math.abs(a90.outputVoltage - a60.outputVoltage) < 1, "tensao saturada");
});

test("VVW (P202=5) mantem rotacao mais perto do sincrono sob carga", () => {
  const vf = motor(60, 100);
  const vvw = motor(60, 100, { P202: 5 });
  assert.ok(vvw.rpm > vf.rpm, `VVW (${vvw.rpm}) > V/f (${vf.rpm})`);
});

test("modo de controle do motor expone labelKey semantico com fallback PT-BR", () => {
  const linear = motor(60, 0);
  const vvw = motor(60, 0, { P202: 5 });

  assert.equal(linear.controlMode.labelKey, "motor.controlMode.vfLinear");
  assert.equal(linear.controlMode.label, "V/f linear");
  assert.equal(vvw.controlMode.labelKey, "motor.controlMode.vvw");
  assert.equal(vvw.controlMode.label, "VVW");
});

test("limitacao de corrente (P135) limita e gera aviso", () => {
  const m = computeMotorState({
    frequency: 5,
    requestedFrequency: 66,
    parameters: { ...params(), P135: { value: 1.0 } },
    loadPercent: 150,
  });
  assert.ok(m.current <= 1.0 + 1e-6, `corrente limitada, obtido ${m.current}`);
  assert.ok(
    m.notes.some(
      (note) =>
        note.key === "motor.notes.currentLimited" &&
        note.params?.limit === "1.0",
    ),
  );
});

test("integracao: SET_LOAD reflete em P003/P009 e parado zera", () => {
  let s = createInitialHmiState();
  s = { ...s, outputFrequency: 60, running: true, referenceFrequency: 60 };
  s = hmiReducer(s, { type: "SET_LOAD", value: 100 });
  assert.ok(s.parameters.P003.value > 0);
  assert.ok(s.parameters.P009.value > 0);

  const parado = createInitialHmiState();
  assert.equal(parado.parameters.P003.value, 0);
  assert.equal(parado.parameters.P002.value, 0);
});

test("estado sincronizado reaproveita motorState nas grandezas de leitura", () => {
  let s = createInitialHmiState();
  s = { ...s, outputFrequency: 60, running: true, referenceFrequency: 60 };
  s = hmiReducer(s, { type: "SET_LOAD", value: 100 });

  assert.ok(s.motorState);
  assert.equal(s.parameters.P002.value, Math.round(s.motorState.rpm));
  assert.equal(s.parameters.P003.value, Number(s.motorState.current.toFixed(1)));
  assert.equal(s.parameters.P009.value, Number(s.motorState.torquePercent.toFixed(1)));
});

test("coast-down sem saida eletrica preserva giro mecanico e zera grandezas ativas", () => {
  const m = computeMotorState({
    frequency: 60,
    mechanicalHz: 60,
    requestedFrequency: 0,
    parameters: params(),
    loadPercent: 100,
    electricalOutputActive: false,
    isCoasting: true,
  });

  assert.ok(m.rpm > 0, `rpm mecanico deveria continuar > 0, obtido ${m.rpm}`);
  assert.equal(m.outputVoltage, 0);
  assert.equal(m.current, 0);
  assert.equal(m.activeCurrent, 0);
  assert.equal(m.torquePercent, 0);
  assert.equal(m.outputPower, 0);
  assert.equal(m.electricalOutputActive, false);
  assert.equal(m.isCoasting, true);
  assert.ok(
    m.notes.some((note) => note.key === "motor.notes.coastDown"),
  );
});
