import { test } from "node:test";
import assert from "node:assert/strict";
import { stepOverloadIxt } from "../src/simulation/overloadModel.js";

test("Ixt sobe em sobrecarga e cai abaixo de P156", () => {
  let ixt = 0;
  for (let i = 0; i < 60000; i += 1000) {
    ixt = stepOverloadIxt({
      currentIxtPercent: ixt,
      motorCurrent: 1.5,
      overloadCurrent: 1,
      deltaMs: 1000,
    });
  }
  assert.ok(ixt >= 99);

  const cooled = stepOverloadIxt({
    currentIxtPercent: ixt,
    motorCurrent: 0.5,
    overloadCurrent: 1,
    deltaMs: 10000,
  });
  assert.ok(cooled < ixt);
});
