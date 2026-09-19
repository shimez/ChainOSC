#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

let Ajv2020;

try {
  ({ default: Ajv2020 } = await import("ajv/dist/2020.js"));
} catch (error) {
  console.error("ERROR: Ajv was not found.");
  console.error("Install it in the ChainOSC repository with: npm install --save-dev ajv");
  if (process.env.CHAINOSC_FIXTURE_VALIDATION_DEBUG === "1") {
    console.error(error);
  }
  process.exit(1);
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const schemaPath = resolve(
  repositoryRoot,
  "schemas",
  "chainosc-device-preset-v2.schema.json",
);
const v1SchemaPath = resolve(
  repositoryRoot,
  "schemas",
  "chainosc-device-preset-v1.schema.json",
);
const fixtureRoot = resolve(repositoryRoot, "test-data", "device-presets-v2");
const expectedErrorsPath = resolve(fixtureRoot, "expected-errors.json");
const migrationRoot = resolve(fixtureRoot, "migration");
const migrationCasesPath = resolve(migrationRoot, "cases.json");
const keyRuntimeVectorsPath = resolve(
  repositoryRoot,
  "test-data",
  "device-presets",
  "key-runtime-vectors.json",
);
const v1FixtureRoot = resolve(repositoryRoot, "test-data", "device-presets");

async function readJson(path) {
  const source = await readFile(path, "utf8");

  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(`Invalid JSON: ${relative(repositoryRoot, path)}\n${error.message}`);
  }
}

async function listJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
    .map((entry) => resolve(directory, entry.name))
    .sort((left, right) => left.localeCompare(right, "en"));
}

function fixtureName(path) {
  return relative(fixtureRoot, path).replaceAll("\\", "/");
}

function formatAjvErrors(errors) {
  if (!errors || errors.length === 0) {
    return "    (no validation details)";
  }

  return errors
    .map((error) => {
      const location = error.instancePath || "/";
      const details = error.params ? ` ${JSON.stringify(error.params)}` : "";
      return `    ${location}: ${error.message ?? error.keyword}${details}`;
    })
    .join("\n");
}

function deriveSemanticsPreservingV2Amount(input) {
  const encoder = input?.encoder;
  if (!encoder || encoder.sendIncrement !== false ||
      (encoder.wrapAround ?? true) !== false ||
      encoder.absoluteInputMin !== 0) return null;
  const span = encoder.absoluteInputMax - encoder.absoluteInputMin;
  if (!Number.isInteger(span) || span < 1 || span > 65535) return null;
  return {
    format: "ChainOSC-device-preset",
    schemaVersion: 2,
    deviceType: 1,
    deviceTypeName: "Encoder",
    encoder: {
      rotationAddress: encoder.rotationAddress,
      rotationMode: "amount",
      rangeSteps: span,
      wrap: false,
      clockwiseIncreases: true,
      outputMin: encoder.range.outMin,
      outputMax: encoder.range.outMax,
      outputType: encoder.range.type,
      pushMode: encoder.clickMode,
      press: encoder.press,
      release: encoder.release,
      sequence: encoder.sequence,
    },
  };
}

function normalizeRuntimeValue(value) {
  if (typeof value === "number") return Math.round(value * 1e9) / 1e9;
  if (Array.isArray(value)) return value.map(normalizeRuntimeValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeRuntimeValue(item)]),
    );
  }
  return value;
}

function runKeyRuntimeCase(testCase) {
  if (testCase.kind === "pressRelease") {
    const sends = [];
    for (const event of testCase.events) {
      sends.push(...(event === "press" ? testCase.press : testCase.release));
    }
    return sends;
  }
  if (testCase.kind === "invalidImport") {
    return testCase.events.map(() => ({
      send: false,
      settings: testCase.initialState.settings,
      position: testCase.initialState.position,
    }));
  }
  let position = testCase.initialPosition ?? testCase.start;
  return testCase.events.map((event) => {
    if (event.operation === "coldStart") {
      position = testCase.start;
      return { send: false, nextPosition: position };
    }
    if (event.operation !== "press")
      throw new Error(`${testCase.id}: unsupported operation ${event.operation}`);
    if (event.sendResult === "detected-failure")
      return { send: false, nextPosition: position };
    const value = position;
    const next = position + testCase.step;
    if ((testCase.step > 0 && next > testCase.end) ||
        (testCase.step < 0 && next < testCase.end) ||
        testCase.start === testCase.end) {
      position = testCase.start;
    } else {
      position = next;
    }
    return { send: true, value, nextPosition: position };
  });
}

async function main() {
  const schema = await readJson(schemaPath);
  const v1Schema = await readJson(v1SchemaPath);
  const expectedErrors = await readJson(expectedErrorsPath);
  const expectedInvalidFixtures = expectedErrors.fixtures;

  if (
    expectedInvalidFixtures === null ||
    typeof expectedInvalidFixtures !== "object" ||
    Array.isArray(expectedInvalidFixtures)
  ) {
    throw new Error(
      `${relative(repositoryRoot, expectedErrorsPath)} must contain an object named "fixtures".`,
    );
  }

  // The x-chainosc-* members are specification annotations. JSON Schema
  // validation checks the standard Draft 2020-12 constraints; product-level
  // validators separately check the annotated semantic constraints.
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
  });
  ajv.addKeyword({
    keyword: "x-chainosc-finiteFloat32",
    schemaType: "boolean",
    type: "number",
    validate(enabled, data) {
      return !enabled || Number.isFinite(Math.fround(data));
    },
  });
  ajv.addKeyword({
    keyword: "x-chainosc-pressReleaseMaxItems",
    schemaType: "number",
    type: "object",
    validate(limit, data) {
      if (!Array.isArray(data?.press) || !Array.isArray(data?.release))
        return true;
      return data.press.length + data.release.length <= limit;
    },
  });
  ajv.addKeyword({
    keyword: "x-chainosc-stepMustMoveTowardEnd",
    schemaType: "boolean",
    type: "object",
    validate(enabled, data) {
      if (!enabled || typeof data?.start !== "number" ||
          typeof data?.end !== "number" || typeof data?.step !== "number")
        return true;
      if (data.step === 0) return false;
      return !((data.start < data.end && data.step < 0) ||
               (data.start > data.end && data.step > 0));
    },
  });
  ajv.addKeyword({
    keyword: "x-chainosc-amountOutputValid",
    schemaType: "boolean",
    type: "object",
    validate(enabled, data) {
      if (!enabled || typeof data?.outputMin !== "number" ||
          typeof data?.outputMax !== "number" ||
          typeof data?.outputType !== "number") return true;
      const outputMin = Math.fround(data.outputMin);
      const outputMax = Math.fround(data.outputMax);
      if (!Number.isFinite(outputMin) || !Number.isFinite(outputMax) ||
          !(outputMin < outputMax) ||
          !Number.isFinite(Math.fround(outputMax - outputMin))) return false;
      if (data.outputType !== 1) return true;
      const roundAwayFromZero = (value) =>
        value < 0 ? -Math.round(-value) : Math.round(value);
      return roundAwayFromZero(outputMin) >= -2147483648 &&
             roundAwayFromZero(outputMax) <= 2147483647;
    },
  });
  ajv.addKeyword({
    keyword: "x-chainosc-amountResetValid",
    schemaType: "string",
    type: "object",
    validate(_rule, data) {
      if (data?.pushMode !== 2) return true;
      if (typeof data?.resetValue !== "number" ||
          typeof data?.outputMin !== "number" ||
          typeof data?.outputMax !== "number") return true;
      const resetValue = Math.fround(data.resetValue);
      const outputMin = Math.fround(data.outputMin);
      const outputMax = Math.fround(data.outputMax);
      if (!Number.isFinite(resetValue) || resetValue < outputMin ||
          resetValue > outputMax) return false;
      if (data.outputType !== 1) return true;
      const rounded = resetValue < 0 ? -Math.round(-resetValue) : Math.round(resetValue);
      return rounded >= -2147483648 && rounded <= 2147483647;
    },
  });
  const validate = ajv.compile(schema);
  const validateV1 = ajv.compile(v1Schema);
  let failures = 0;

  const v1KeyFiles = [
    resolve(v1FixtureRoot, "canonical", "key.json"),
    ...(await listJsonFiles(resolve(v1FixtureRoot, "valid"))).filter((path) =>
      /^key-/.test(relative(resolve(v1FixtureRoot, "valid"), path)),
    ),
  ];
  let v1KeyValid = 0;
  for (const path of v1KeyFiles) {
    const fixture = await readJson(path);
    const name = relative(v1FixtureRoot, path).replaceAll("\\", "/");
    if (!validateV1(fixture) || fixture.deviceType !== 3) {
      failures += 1;
      console.error(`FAIL v1 Key: ${name}`);
      console.error(formatAjvErrors(validateV1.errors));
    } else {
      v1KeyValid += 1;
      console.log(`PASS v1 Key: ${name}`);
    }
  }

  const validFiles = [
    ...(await listJsonFiles(resolve(fixtureRoot, "canonical"))),
    ...(await listJsonFiles(resolve(fixtureRoot, "valid"))),
  ];
  const invalidFiles = await listJsonFiles(resolve(fixtureRoot, "invalid"));

  for (const path of validFiles) {
    const name = fixtureName(path);
    const fixture = await readJson(path);

    if (validate(fixture)) {
      console.log(`PASS valid:   ${name}`);
    } else {
      failures += 1;
      console.error(`FAIL valid:   ${name} was rejected by the schema`);
      console.error(formatAjvErrors(validate.errors));
    }
  }

  const actualInvalidNames = new Set(invalidFiles.map(fixtureName));

  for (const path of invalidFiles) {
    const name = fixtureName(path);
    const fixture = await readJson(path);

    if (!(name in expectedInvalidFixtures)) {
      failures += 1;
      console.error(`FAIL invalid: ${name} is missing from expected-errors.json`);
    }

    if (validate(fixture)) {
      failures += 1;
      console.error(`FAIL invalid: ${name} was accepted by the schema`);
    } else {
      const expectedCode = expectedInvalidFixtures[name] ?? "UNREGISTERED";
      console.log(`PASS invalid: ${name} (${expectedCode})`);
    }
  }

  for (const name of Object.keys(expectedInvalidFixtures).sort()) {
    if (!actualInvalidNames.has(name)) {
      failures += 1;
      console.error(`FAIL registry: ${name} is registered but the fixture does not exist`);
    }
  }

  const migrationManifest = await readJson(migrationCasesPath);
  const allowedOutcomes = new Set([
    "v2-migration",
    "legacy-import",
    "import-error",
  ]);
  const outcomeCounts = new Map(
    [...allowedOutcomes].map((outcome) => [outcome, 0]),
  );
  const referencedMigrationFiles = new Set(["cases.json"]);

  if (!Array.isArray(migrationManifest.cases)) {
    throw new Error(
      `${relative(repositoryRoot, migrationCasesPath)} must contain a cases array.`,
    );
  }

  for (const migrationCase of migrationManifest.cases) {
    const id = migrationCase.id ?? "(missing id)";
    const outcome = migrationCase.outcome;
    if (!allowedOutcomes.has(outcome)) {
      failures += 1;
      console.error(`FAIL migration: ${id} has invalid outcome ${outcome}`);
      continue;
    }
    outcomeCounts.set(outcome, outcomeCounts.get(outcome) + 1);

    if (typeof migrationCase.input !== "string") {
      failures += 1;
      console.error(`FAIL migration: ${id} has no input fixture`);
      continue;
    }
    referencedMigrationFiles.add(migrationCase.input);
    const input = await readJson(resolve(migrationRoot, migrationCase.input));
    const inputIsValidV1 = validateV1(input);

    if (outcome === "import-error") {
      if (typeof migrationCase.expectedError !== "string") {
        failures += 1;
        console.error(`FAIL migration: ${id} has no expectedError`);
      } else if (inputIsValidV1) {
        failures += 1;
        console.error(`FAIL migration: ${id} expects an error but input is valid v1`);
      } else {
        console.log(`PASS migration: ${id} (import-error: ${migrationCase.expectedError})`);
      }
      continue;
    }

    if (!inputIsValidV1) {
      failures += 1;
      console.error(`FAIL migration: ${id} input is not valid Device Preset v1`);
      console.error(formatAjvErrors(validateV1.errors));
      continue;
    }

    const expectedKey = outcome === "v2-migration"
      ? "expectedV2"
      : "expectedLegacy";
    const expectedName = migrationCase[expectedKey];
    if (typeof expectedName !== "string") {
      failures += 1;
      console.error(`FAIL migration: ${id} has no ${expectedKey} fixture`);
      continue;
    }
    referencedMigrationFiles.add(expectedName);
    const expected = await readJson(resolve(migrationRoot, expectedName));

    if (outcome === "v2-migration") {
      if (!validate(expected)) {
        failures += 1;
        console.error(`FAIL migration: ${id} expectedV2 is not valid v2`);
        console.error(formatAjvErrors(validate.errors));
      } else if (!isDeepStrictEqual(
        expected,
        deriveSemanticsPreservingV2Amount(input),
      )) {
        failures += 1;
        console.error(`FAIL migration: ${id} expectedV2 does not match the lossless Amount mapping`);
      } else {
        console.log(`PASS migration: ${id} (v2-migration)`);
      }
    } else if (!validateV1(expected)) {
      failures += 1;
      console.error(`FAIL migration: ${id} expectedLegacy is not valid v1`);
      console.error(formatAjvErrors(validateV1.errors));
    } else if (!isDeepStrictEqual(input, expected)) {
      failures += 1;
      console.error(`FAIL migration: ${id} expectedLegacy changes the v1 settings`);
    } else {
      console.log(`PASS migration: ${id} (legacy-import, settings preserved)`);
    }
  }

  for (const outcome of allowedOutcomes) {
    if (outcomeCounts.get(outcome) === 0) {
      failures += 1;
      console.error(`FAIL migration: no ${outcome} case is defined`);
    }
  }

  const migrationFiles = await listJsonFiles(migrationRoot);
  for (const path of migrationFiles) {
    const name = relative(migrationRoot, path).replaceAll("\\", "/");
    if (!referencedMigrationFiles.has(name)) {
      failures += 1;
      console.error(`FAIL migration: unreferenced fixture ${name}`);
    }
  }

  const keyRuntimeVectors = await readJson(keyRuntimeVectorsPath);
  if (!Array.isArray(keyRuntimeVectors.cases)) {
    failures += 1;
    console.error("FAIL Key runtime: cases must be an array");
  } else {
    const ids = new Set();
    for (const testCase of keyRuntimeVectors.cases) {
      if (typeof testCase.id !== "string" || ids.has(testCase.id)) {
        failures += 1;
        console.error(`FAIL Key runtime: invalid or duplicate id ${testCase.id}`);
        continue;
      }
      ids.add(testCase.id);
      const actual = runKeyRuntimeCase(testCase);
      const expected = testCase.kind === "pressRelease"
        ? testCase.expectedSends
        : testCase.expected;
      if (!isDeepStrictEqual(
        normalizeRuntimeValue(actual),
        normalizeRuntimeValue(expected),
      )) {
        failures += 1;
        console.error(`FAIL Key runtime: ${testCase.id}`);
      } else {
        console.log(`PASS Key runtime: ${testCase.id}`);
      }
    }
  }

  console.log("");
  console.log(
    `Summary: valid=${validFiles.length} invalid=${invalidFiles.length} migration=${migrationManifest.cases.length} v1KeyValid=${v1KeyValid} keyRuntime=${keyRuntimeVectors.cases?.length ?? 0} failures=${failures}`,
  );

  if (failures > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  if (process.env.CHAINOSC_FIXTURE_VALIDATION_DEBUG === "1") {
    console.error(error.stack);
  }
  process.exitCode = 1;
});
