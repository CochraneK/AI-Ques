import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));

const registry = JSON.parse(read("module-registry.json"));
assert.equal(registry.shared_profile.key, "bjtu.p00.profile.v1");
assert.equal(registry.shared_profile.adapter, "shared/profile.js");

const byId = Object.fromEntries(registry.modules.map((m) => [m.id, m]));
assert.equal(byId.P002.path, "p002/");
assert.equal(byId.P004.path, "p004/");
assert.equal(byId.P005.path, "p005/");
assert.equal(byId.P001.path, null);
assert.equal(byId.P003.path, null);

for (const file of [
  "shared/profile.js",
  "p002/index.html", "p002/app.js", "p002/experiments.js", "p002/study-manifest.json",
  "p004/index.html", "p004/app.js", "p004/module-manifest.json", "p004/NVWA_CONTRACT.md",
  "p005/index.html", "p005/app.js", "p005/module-manifest.json",
  "docs/ARCHITECTURE.md", "docs/DESIGN_PRINCIPLES.md", "p005/RESEARCH_NOTES.md"
]) {
  assert.ok(exists(file), `missing canonical file: ${file}`);
}

const rootIndex = read("index.html");
assert.match(rootIndex, /href="p002\/"/);
assert.match(rootIndex, /href="p004\/"/);
assert.match(rootIndex, /href="p005\/"/);
assert.doesNotMatch(rootIndex, /SIDE EXPERIMENT\s*·\s*FUTURE ME/i);

const shared = read("shared/profile.js");
assert.match(shared, /bjtu\.p00\.profile\.v1/);
assert.match(shared, /name.*age.*origin.*location.*currentWork/s);
assert.ok(!/clinicalInference|evidenceQuotes|safetyState/.test(shared), "shared adapter must not whitelist admin/clinical fields");

const p004 = read("p004/app.js");
assert.match(p004, /bjtu\.p004\.characters\.v2/);
assert.match(p004, /bjtu\.p004\.memory\.v2/);
assert.match(p004, /bjtu\.p005\.state\.v1/);
assert.match(p004, /indexedDB\.open\('bjtu-p004-skill-vault'/);
assert.match(p004, /roleplayMustYieldToSafety:true/);
assert.match(p004, /doNotExposeClinicalLabels:true/);
assert.doesNotMatch(p004, /aiques\.global\.profile\.v1/);

const p004Index = read("p004/index.html");
assert.match(p004Index, /CHARACTER CARD/);
assert.match(p004Index, /BACKGROUND OBSERVER/);
assert.match(p004Index, /NVWA/);
assert.doesNotMatch(p004Index, /清除本次画像/);

const p004Manifest = JSON.parse(read("p004/module-manifest.json"));
assert.equal(p004Manifest.version, "2.0.0");
assert.equal(p004Manifest.user_experience.clinical_labels_visible, false);
assert.equal(p004Manifest.user_experience.nvwa_distillation_optional, true);

const p005 = read("p005/app.js");
assert.match(p005, /bjtu\.p005\.state\.v1/);
assert.match(p005, /BJTU_PROFILE/);
assert.doesNotMatch(p005, /const SHARED_KEYS/);
assert.match(p005, /const QUESTIONS = \[/);
assert.match(p005, /surveyIndex/);
assert.match(p005, /exchanged<16/);
assert.match(read("docs/DESIGN_PRINCIPLES.md"), /Less is more/);

const legacyFuture = fs.readdirSync(path.join(root, "future-me")).sort();
assert.deepEqual(legacyFuture, ["index.html"], "future-me must be redirect-only");
assert.match(read("future-me/index.html"), /\.\.\/p005\//);

for (const forbidden of [
  "experiments.js",
  "study-manifest.json",
  "QUALITY_LOOP.md",
  "scripts/next_quality_target.py",
  ".github/agent-memory/ai-ques-hardening.md",
  ".claude/skills/ai-ques-hardening/SKILL.md",
  ".claude/skills/ai-ques-hardening/references/response-template.md"
]) {
  assert.ok(!exists(forbidden), `obsolete repository residue still exists: ${forbidden}`);
}

console.log("Repository structure checks passed: P00 hub + P002/P004/P005 boundaries + shared/private storage.");
