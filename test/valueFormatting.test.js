import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatInfoValue,
  isValueMissing,
  MISSING_INFO_LABEL,
} from "../src/components/parameter-info/valueFormatting.js";

test("0 numerico e exibido como valor valido", () => {
  assert.equal(isValueMissing(0), false);
  assert.equal(formatInfoValue(0), 0);
});

test('"0" string e exibido como valor valido', () => {
  assert.equal(isValueMissing("0"), false);
  assert.equal(formatInfoValue("0"), "0");
});

test("0 com unidade permanece visivel", () => {
  assert.equal(formatInfoValue("0 Hz"), "0 Hz");
  assert.equal(formatInfoValue("0 %"), "0 %");
  assert.equal(formatInfoValue("0 s"), "0 s");
});

test("false booleano valido nao vira valor ausente", () => {
  assert.equal(isValueMissing(false), false);
  assert.equal(formatInfoValue(false), "false");
});

test("null, undefined, string vazia e NaN usam fallback de ausencia", () => {
  assert.equal(formatInfoValue(null), MISSING_INFO_LABEL);
  assert.equal(formatInfoValue(undefined), MISSING_INFO_LABEL);
  assert.equal(formatInfoValue(""), MISSING_INFO_LABEL);
  assert.equal(formatInfoValue("   "), MISSING_INFO_LABEL);
  assert.equal(formatInfoValue(Number.NaN), MISSING_INFO_LABEL);
});
