#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import Ajv2020 from "ajv/dist/2020.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = resolve(root, "test-data/device-presets-v3");
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const files = async (directory) => (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();

const ajv = new Ajv2020({ allErrors: true, strict: false });
// x-chainosc-* annotations are shared with the v1/v2 schemas. These checks
// cover the cross-field constraints needed by these fixtures; hardware Import
// error codes and ArduinoJson's numeric token types need physical verification.
ajv.addKeyword({ keyword: "x-chainosc-maxUtf8Bytes", type: "string", schemaType: "number",
  validate: (limit, value) => Buffer.byteLength(value, "utf8") <= limit });
ajv.addKeyword({ keyword: "x-chainosc-finiteFloat32", type: "number", schemaType: "boolean",
  validate: (enabled, value) => !enabled || Number.isFinite(Math.fround(value)) });
ajv.addKeyword({ keyword: "x-chainosc-pressReleaseMaxItems", type: "object", schemaType: "number",
  validate: (limit, value) => !Array.isArray(value.press) || !Array.isArray(value.release) ||
    value.press.length + value.release.length <= limit });
ajv.addKeyword({ keyword: "x-chainosc-stepMustMoveTowardEnd", type: "object", schemaType: "boolean",
  validate: (enabled, value) => !enabled ||
    [value.start, value.end, value.step].some((item) => typeof item !== "number") ||
    (value.step !== 0 &&
    !(value.start < value.end && value.step < 0) &&
    !(value.start > value.end && value.step > 0)) });
ajv.addKeyword({ keyword: "x-chainosc-amountOutputValid", type: "object", schemaType: "boolean",
  validate: (enabled, value) => !enabled ||
    [value.outputMin, value.outputMax, value.outputType].some((item) => typeof item !== "number") ||
    (value.outputMin < value.outputMax &&
    Number.isFinite(Math.fround(value.outputMax - value.outputMin)) &&
    (value.outputType !== 1 || (Math.round(value.outputMin) >= -2147483648 &&
      Math.round(value.outputMax) <= 2147483647))) });
ajv.addKeyword({ keyword: "x-chainosc-amountResetValid", type: "object", schemaType: "string",
  validate: (_rule, value) => value.pushMode !== 2 ||
    (value.resetValue >= value.outputMin && value.resetValue <= value.outputMax) });

const validate = ajv.compile(await readJson(resolve(root, "schemas/chainosc-device-preset-v3.schema.json")));
const validateV1 = ajv.compile(await readJson(resolve(root, "schemas/chainosc-device-preset-v1.schema.json")));
const validateV2 = ajv.compile(await readJson(resolve(root, "schemas/chainosc-device-preset-v2.schema.json")));
const expected = (await readJson(resolve(fixtures, "expected-errors.json"))).fixtures;
const validFiles = await files(resolve(fixtures, "valid"));
const invalidFiles = await files(resolve(fixtures, "invalid"));
assert.deepEqual(Object.keys(expected).sort(), [...invalidFiles].sort(), "Invalid fixture/error registry parity");

for (const file of validFiles) {
  const preset = await readJson(resolve(fixtures, "valid", file));
  assert.equal(validate(preset), true, `${file}: ${ajv.errorsText(validate.errors)}`);
  const seq = preset.key?.sequence ?? preset.encoder?.sequence ?? preset.joystick?.sequence;
  assert.equal(seq?.progressionMode ?? 0, file.includes("pingpong") ? 1 : 0, `${file}: mode`);
  if (file.includes("missing-progression")) assert.equal(Object.hasOwn(seq, "progressionMode"), false);
}
for (const file of invalidFiles) {
  const preset = await readJson(resolve(fixtures, "invalid", file));
  assert.equal(validate(preset), false, `${file}: schema accepted expected ${expected[file]}`);
}
const decimalSource = await readFile(resolve(fixtures, "compat/key-mode-decimal-notation.json"), "utf8");
assert.match(decimalSource, /"progressionMode":1\.0\b/);
assert.equal(validate(JSON.parse(decimalSource)), true, "JSON Schema integer treats 1.0 as 1");
assert.equal(validate(await readJson(resolve(fixtures, "compat/angle-schema-three-noncanonical.json"))),
  false, "Angle does not have a canonical v3 export contract");

// Previously distributed v1/v2 examples remain importable by current devices;
// they are not rewritten as v3, and the v3 schema must not relabel them.
const distributed = [];
for (const type of ["key", "encoder", "angle", "joystick"]) {
  for (const file of await files(resolve(root, "presets", type))) {
    const preset = await readJson(resolve(root, "presets", type, file));
    distributed.push(file);
    if (preset.schemaVersion === 3) {
      assert.equal(validate(preset), true, `${file}: ${ajv.errorsText(validate.errors)}`);
      assert.equal(preset.key?.sequence?.progressionMode, 1, `${file}: Ping-Pong example`);
    } else {
      assert.equal((preset.schemaVersion === 1 ? validateV1 : validateV2)(preset), true, `${file}: old schema`);
      assert.equal(validate(preset), false, `${file}: old sample misclassified as v3`);
    }
  }
}

function runSequence({ mode, start, end, step, expected: sends }) {
  let current = start;
  let forward = true;
  const actual = [];
  for (let i = 0; i < sends.length; i++) {
    actual.push(current);
    if (mode === 0) {
      const next = current + step;
      current = start === end || (step > 0 ? next > end : next < end) ? start : next;
    } else if (start === end) {
      current = start;
    } else {
      const towardEnd = forward ? step : -step;
      const next = current + towardEnd;
      const reached = forward ? (step > 0 ? next >= end : next <= end)
        : (step > 0 ? next <= start : next >= start);
      current = reached ? (forward ? end : start) : next;
      if (reached) forward = !forward;
    }
  }
  assert.deepEqual(actual, sends);
}
const vectors = (await readJson(resolve(fixtures, "runtime-vectors.json"))).cases;
for (const vector of vectors) runSequence(vector);

const specification = await readFile(resolve(root, "DEVICE_PRESET_FORMAT_V3.md"), "utf8");
let documentExamples = 0;
for (const [, source] of specification.matchAll(/```json\s*\n([\s\S]*?)\n```/g)) {
  const example = JSON.parse(source);
  if (!example.key && !example.encoder && !example.joystick) continue; // header/Sequence fragments
  assert.equal(validate(example), true, `v3 specification example: ${ajv.errorsText(validate.errors)}`);
  documentExamples++;
}
assert.equal(documentExamples, 5, "Expected Key, Legacy Encoder, Amount, Direction, Joystick examples");
console.log(`v3 validated: ${validFiles.length} valid, ${invalidFiles.length} invalid, ${distributed.length} distributed, ${documentExamples} specification examples, ${vectors.length} runtime vectors; 2 compatibility cases`);
