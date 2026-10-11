#!/usr/bin/env node
// Copies package.json's version into plugin.json, the AGENTS.md block and WORKFLOW.md markers, and
// the minimum block version each skill checks for,
// so the version is only ever edited in one place.
// With --check it changes nothing and exits 1 if anything is out of sync.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(readFileSync(join(repo, "package.json"), "utf8"));
const check = process.argv.includes("--check");

const targets = [
  [".claude-plugin/plugin.json", /("version"\s*:\s*")[^"]*(")/],
  ["skills/setup-agent-workspace/AGENTS-BLOCK.md", /(<!-- rom-skills:start v)[^ ]*( -->)/],
  ["skills/setup-agent-workspace/WORKFLOW.md", /(<!-- rom-skills workflow v)\d+\.\d+\.\d+()/],
  // Skills ask for a block at least this new. Only major.minor, so patch releases
  // (wording fixes) don't make users re-run setup.
  ...["explain", "feature", "implement", "patch", "review", "verify"].map((skill) => [
    `skills/${skill}/SKILL.md`,
    /(is older than )\d+\.\d+(, ignoring the last number)/,
    "minor",
  ]),
];

let outOfSync = false;
for (const [file, pattern, part] of targets) {
  const path = join(repo, file);
  const source = readFileSync(path, "utf8");
  if (!pattern.test(source)) {
    console.error(`${file}: no version found to update`);
    process.exit(1);
  }
  const value = part === "minor" ? version.split(".").slice(0, 2).join(".") : version;
  const updated = source.replace(pattern, `$1${value}$2`);
  if (updated === source) continue;
  outOfSync = true;
  if (check) console.error(`${file}: out of sync with package.json (${version})`);
  else {
    writeFileSync(path, updated);
    console.log(`${file}: -> ${value}`);
  }
}

if (check && outOfSync) process.exit(1);
if (!outOfSync) console.log(`All versions are ${version}`);
