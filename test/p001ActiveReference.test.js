import { test } from "node:test";
import assert from "node:assert/strict";
import { createInitialHmiState, hmiReducer } from "../src/hmi/cfw100Hmi.js";
import { resolveCommand } from "../src/simulation/commandResolver.js";
import { setStorage } from "../src/utils/persistence.js";

setStorage(null);

function reduce(state, type, extra = {}) {
  return hmiReducer(state, { type, ...extra });
}

function withParameters(state, patch) {
  const parameters = { ...state.parameters };

  for (const [code, value] of Object.entries(patch)) {
    parameters[code] = {
      ...parameters[code],
      value,
    };
  }

  return {
    ...state,
    parameters,
  };
}

function syncState(state) {
  return reduce(state, "SET_LOAD", { value: state.loadPercent ?? 0 });
}

function assertP001MatchesResolvedReference(state) {
  const expectedReference = resolveCommand(state).referenceFrequency;

  assert.equal(state.parameters.P001.value, expectedReference);
  assert.ok(Number.isFinite(state.parameters.P001.value));

  return expectedReference;
}

test("P001 acompanha a referencia HMI em funcionamento", () => {
  let state = createInitialHmiState();
  state = {
    ...state,
    running: true,
    referenceFrequency: 45,
  };
  state = withParameters(state, { P121: 45 });
  state = syncState(state);

  const expectedReference = assertP001MatchesResolvedReference(state);

  assert.equal(expectedReference, 45);
  assert.equal(state.parameters.P001.value, 45);
});

test("P001 usa a referencia resolvida da AI1", () => {
  let state = createInitialHmiState();
  state = withParameters(state, { P221: 1 });
  state = reduce(state, "SET_AI1_PERCENT", { value: 50 });
  state = {
    ...state,
    running: true,
  };
  state = syncState(state);

  const expectedReference = assertP001MatchesResolvedReference(state);

  assert.equal(expectedReference, 33);
  assert.notEqual(state.parameters.P001.value, state.referenceFrequency);
});

test("P001 usa a referencia resolvida da FI e respeita P133/P134", () => {
  let state = createInitialHmiState();
  state = withParameters(state, {
    P221: 4,
    P133: 10,
    P134: 20,
  });
  state = reduce(state, "SET_FI_FREQUENCY", { value: 1 });
  state = {
    ...state,
    running: true,
  };
  state = syncState(state);

  const expectedReference = assertP001MatchesResolvedReference(state);

  assert.equal(expectedReference, 10);
  assert.ok(expectedReference >= state.parameters.P133.value);
  assert.ok(expectedReference <= state.parameters.P134.value);
});

test("P001 usa a referencia resolvida de Serial, CO/DN e SoftPLC", () => {
  const cases = [
    { code: 9, source: "serial", value: { speed13Bit: 4096 }, expected: 30 },
    { code: 11, source: "codn", value: { speed13Bit: 2048 }, expected: 15 },
    { code: 12, source: "softplc", value: { speed13Bit: 6144 }, expected: 45 },
  ];

  for (const { code, source, value, expected } of cases) {
    let state = createInitialHmiState();
    state = withParameters(state, { P221: code });
    state = reduce(state, "SET_EXTERNAL_SOURCE", { source, value });
    state = {
      ...state,
      running: true,
    };
    state = syncState(state);

    const expectedReference = assertP001MatchesResolvedReference(state);

    assert.equal(expectedReference, expected);
  }
});

test("P001 usa a referencia multispeed selecionada pelas DIs", () => {
  let state = createInitialHmiState();
  state = withParameters(state, {
    P221: 8,
    P263: 13,
    P264: 13,
    P126: 27,
  });
  state = {
    ...state,
    running: true,
  };
  state = reduce(state, "SET_DIGITAL_INPUT", { index: 1, value: true });

  const expectedReference = assertP001MatchesResolvedReference(state);

  assert.equal(expectedReference, 27);
});

test("P001 usa P122 quando JOG esta ativo mesmo sem RUN da HMI", () => {
  let state = createInitialHmiState();
  state = withParameters(state, {
    P122: 17,
    P225: 2,
    P263: 10,
  });
  state = {
    ...state,
    running: false,
  };
  state = reduce(state, "SET_DIGITAL_INPUT", { index: 0, value: true });

  const expectedReference = assertP001MatchesResolvedReference(state);

  assert.equal(expectedReference, 17);
  assert.equal(resolveCommand(state).jogActive, true);
});

test("P001 fica em 0 quando parado, mesmo com outra fonte selecionada", () => {
  let state = createInitialHmiState();
  state = withParameters(state, { P221: 1 });
  state = reduce(state, "SET_AI1_PERCENT", { value: 50 });
  state = {
    ...state,
    running: false,
  };
  state = syncState(state);

  const expectedReference = assertP001MatchesResolvedReference(state);

  assert.equal(expectedReference, 0);
  assert.notEqual(state.parameters.P001.value, state.referenceFrequency);
});

test("P001 nao vira NaN nem Infinity com fonte externa invalida", () => {
  let state = createInitialHmiState();
  state = withParameters(state, { P221: 9 });
  state = {
    ...state,
    running: true,
    externalSources: {
      ...state.externalSources,
      serial: {
        ...state.externalSources.serial,
        speed13Bit: Number.NaN,
      },
    },
  };
  state = syncState(state);

  assertP001MatchesResolvedReference(state);
  assert.equal(Number.isNaN(state.parameters.P001.value), false);
  assert.notEqual(state.parameters.P001.value, Infinity);
});
