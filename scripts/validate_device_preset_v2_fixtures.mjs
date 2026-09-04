#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
const fixtureRoot = resolve(repositoryRoot, "test-data", "device-presets-v2");
const expectedErrorsPath = resolve(fixtureRoot, "expected-errors.json");

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

async function main() {
  const schema = await readJson(schemaPath);
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
  const validate = ajv.compile(schema);

  const validFiles = [
    ...(await listJsonFiles(resolve(fixtureRoot, "canonical"))),
    ...(await listJsonFiles(resolve(fixtureRoot, "valid"))),
  ];
  const invalidFiles = await listJsonFiles(resolve(fixtureRoot, "invalid"));

  let failures = 0;

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

  console.log("");
  console.log(
    `Summary: valid=${validFiles.length} invalid=${invalidFiles.length} failures=${failures}`,
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
