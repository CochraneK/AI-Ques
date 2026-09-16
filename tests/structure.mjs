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
assert.equal(byId.P001.path, "p001/");
assert.equal(byId.P003.path, null);

for (const file of [
  "shared/profile.js",
  "p001/index.html", "p001/report.js", "p001/static-api.js", "p001/study-manifest.json", "p001/app-loader.js",
  "p002/index.html", "p002/app.js", "p002/experiments.js", "p002/study-manifest.json",
  "p004/index.html", "p004/core.js", "p004/app.js", "p004/module-manifest.json", "p004/NVWA_CONTRACT.md",
  "p005/index.html", "p005/app.js", "p005/api-client.js", "p005/module-manifest.json", "p005/runtime-config.js", "p005/admin.html", "p005/admin.js", "p005/admin.css",
  "docs/ARCHITECTURE.md", "docs/DESIGN_PRINCIPLES.md", "p005/RESEARCH_NOTES.md", "p005/METHODS_MAPPING.md", "tests/p004-runtime.mjs", "tests/p005-runtime.mjs"
]) {
  assert.ok(exists(file), `missing canonical file: ${file}`);
}

const rootIndex = read("index.html");
assert.match(rootIndex, /href="p002\/"/);
assert.match(rootIndex, /href="p004\/"/);
assert.match(rootIndex, /href="p005\/"/);
assert.doesNotMatch(rootIndex, /SIDE EXPERIMENT\s*·\s*FUTURE ME/i);

const p001Manifest = JSON.parse(read("p001/study-manifest.json"));
assert.equal(p001Manifest.status, "prototype_only");
assert.equal(p001Manifest.formal_data_collection_authorized, false);
assert.equal(p001Manifest.constructs.current_self_facets.pool, 30);
assert.equal(p001Manifest.constructs.ideal_self_facets.pool, 24);
assert.deepEqual(p001Manifest.constructs.ideal_self_facets.excludes, ["N"]);
assert.equal(p001Manifest.constructs.personal_values.pool, 16);
assert.equal(p001Manifest.pages_storage.not_for_sensitive_or_formal_research, true);

const shared = read("shared/profile.js");
assert.match(shared, /bjtu\.p00\.profile\.v1/);
assert.match(shared, /name.*age.*origin.*location.*currentWork/s);
assert.ok(!/clinicalInference|evidenceQuotes|safetyState/.test(shared), "shared adapter must not whitelist admin/clinical fields");

const p004 = read("p004/app.js");
const p004Core = read("p004/core.js");
assert.match(p004Core, /bjtu\.p004\.characters\.v2/);
assert.match(p004Core, /bjtu\.p004\.memory\.v2/);
assert.match(p004Core, /bjtu\.p005\.state\.v1/);
assert.match(p004Core, /bjtu-p004-skill-vault/);
assert.match(p004, /indexedDB\.open\(K\.skillDb/);
assert.match(p004, /roleplayMustYieldToSafety:true/);
assert.match(p004, /doNotExposeClinicalLabels:true/);
assert.doesNotMatch(p004, /aiques\.global\.profile\.v1/);
assert.doesNotMatch(p004, /BJTU_PROFILE|P00_CONTEXT/, "P004 standalone runtime must not read P001-P003 shared profile");
assert.match(p004, /function peerProfile\(\)/);
assert.doesNotMatch(p004Index, /\.\.\/shared\/profile\.js/);

const p004Index = read("p004/index.html");
assert.match(p004Index, /CHARACTER CARD/);
assert.match(p004Index, /BACKGROUND OBSERVER/);
assert.match(p004Index, /NVWA/);
assert.doesNotMatch(p004Index, /清除本次画像/);

const p004Manifest = JSON.parse(read("p004/module-manifest.json"));
assert.equal(p004Manifest.version, "2.4.0");
assert.equal(p004Manifest.user_experience.clinical_labels_visible, false);
assert.equal(p004Manifest.user_experience.nvwa_distillation_optional, true);
assert.equal(p004Manifest.user_experience.openai_compatible_byok, true);
assert.equal(p004Manifest.user_experience.playful_character_creator, true);
const p004Api = read("p004/api-client.js");
assert.match(p004Api, /chat\/completions/);
assert.match(p004Api, /sessionStorage\.setItem\(DIRECT_KEY/);
assert.match(p004Index, /OPENAI-COMPATIBLE · BYOK/);
assert.match(p004Index, /CHARACTER STUDIO/);
assert.match(p004Index, /VIA 24 Character Strengths/);
assert.match(p004Index, /Interpersonal Circumplex/);
assert.match(p004, /const CHAT_FEELS=\[/);
assert.match(p004, /agency:1,communion:0/);
assert.match(p004, /agency:0,communion:1/);
assert.match(p004Index, /FreeLLMAPI · 本机/);
assert.match(p004, /DASHBOARD_ORIGINS=/);
assert.equal(p004Manifest.user_experience.relationship_selection_auto_advance, false);
assert.match(p004Manifest.user_experience.character_strengths_basis, /VIA 24/);
assert.match(p004Manifest.user_experience.interaction_feel_basis, /Interpersonal Circumplex/);
assert.match(p004, /亲密关系/);
assert.match(p004, /家庭关系/);
assert.match(p004, /朋友关系/);
assert.match(p004, /同伴关系/);
assert.match(p004, /引导关系/);
assert.match(p004, /专业关系/);
assert.match(p004, /竞争 \/ 对立/);
assert.match(p004, /陌生 \/ 未定/);
assert.doesNotMatch(p004, /setCreatorStep\(1\).*180/s);
assert.match(p004Api, /kind:'http'/);
assert.match(p004Api, /kind:'network'/);
assert.match(p004Api, /kind:'timeout'/);
assert.match(p004Index, /选好后由你点击“下一步”/);
assert.match(p004Index, /你决定哪些内容留下/);
assert.match(p004Index, /p005ConsentToggle/);
assert.match(p004Index, /clearP004DataBtn/);
assert.match(p004Index, /core\.js/);
assert.match(p004Core, /p005Observer:false/);
assert.match(p004Core, /removeEvidenceSource/);
assert.match(p004Core, /p004LocalStorageKeys/);
assert.match(p004, /CORE\.canImportP005\(consentState\(\)\)/);
assert.match(p004, /clearP004LocalData/);
assert.match(p004, /rebuildObserverFromP004/);
assert.match(p004, /nvwa-skill@fdb181f0e057e837e15942707b1ea35845850979/);
assert.match(read("p004/NVWA_CONTRACT.md"), /fdb181f0e057e837e15942707b1ea35845850979/);

const p004Styles = read("p004/styles.css");
assert.match(p004Styles, /100dvh/);
assert.match(p004Styles, /creator-modal[^}]*overflow:hidden/);
const workflowText = read(".github/workflows/quality-gate.yml") + "\n" + read(".github/workflows/pages.yml");
assert.doesNotMatch(workflowText, /uses:\s*[^\s#]+@v\d+/);
assert.match(workflowText, /actions\/checkout@d23441a48e516b6c34aea4fa41551a30e30af803/);
assert.match(workflowText, /actions\/configure-pages@983d7736d9b0ae728b81ab479565c72886d7745b/);
assert.match(workflowText, /actions\/upload-pages-artifact@7b1f4a764d45c48632c6b24a0339c27f5614fb0b/);
assert.match(workflowText, /actions\/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e/);


const p005 = read("p005/app.js");
assert.match(p005, /bjtu\.p005\.state\.v1/);
assert.doesNotMatch(p005, /BJTU_PROFILE|P00_CONTEXT|P001_PROFILE/, "P005 standalone runtime must not read P001-P003 profile state");
assert.doesNotMatch(p005, /const SHARED_KEYS/);
assert.match(p005, /const QUESTIONS = \[/);
assert.match(p005, /surveyIndex/);
assert.match(p005, /exchanged<16/);
assert.match(p005, /targetHorizon:'4y'/);
assert.match(p005, /intakeProtocol:'guided'/);
assert.match(p005, /function activeQuestions\(\)/);
assert.match(p005, /paper-core/);
assert.match(p005, /transcribeApi/);
assert.match(p005, /MediaRecorder/);
assert.match(p005, /function renderShareCard\(\)/);
assert.match(p005, /personaBrief:buildPersonaBrief\(\)/);
assert.match(p005, /const PROFILE_ASSETS =/);
assert.match(p005, /key:'positiveQualities'/);
assert.match(p005, /key:'importantValues'/);
assert.doesNotMatch(p005, /p001Sources|p001Assets|hydrateP001Selections/);
assert.match(p005, /max:6/);
assert.match(p005, /max:4/);
assert.match(p005, /options:\['男','女'\]/);
assert.match(p005, /本科阶段学习/);
assert.doesNotMatch(p005, /Option A|Option B|decisionMain|data-decision-preset/);
assert.match(p005, /CARD_STYLES/);
assert.match(p005, /minimal:\{/);
assert.match(p005, /warm:\{/);
assert.match(p005, /night:\{/);
assert.match(p005, /mint:\{/);
assert.doesNotMatch(p005, /(?<!\$)\$\('\[data-matrix-option\]'\)\.forEach/);
assert.doesNotMatch(p005, /(?<!\$)\$\('\[data-api-close\]'\)\.forEach/);
assert.doesNotMatch(p005, /(?<!\$)\$\('#promptChips button'\)\.forEach/);
assert.match(p005, /bjtu\.p004\.threads\.v2/);
assert.match(p005, /bjtu\.p004\.memory\.v2/);
assert.doesNotMatch(p005, /bjtu\.p004\.observer\.v2/);
assert.match(p005, /useP004Context:false/);
assert.match(p005, /peer_context_consent_changed/);
assert.match(p005, /buildPersonaBrief\(\{includePeerContext:false\}\)/);
assert.match(read("p005/index.html"), /p004ContextToggle/);
assert.doesNotMatch(read("p005/index.html"), /\.\.\/shared\/profile\.js/);
assert.match(read("p005/index.html"), /href="\.\/" aria-label="Future Me 首页"/);
const p005Api = read("p005/api-client.js");
assert.match(p005Api, /chat\/completions/);
assert.match(p005Api, /images\/edits/);
assert.match(p005Api, /audio\/speech/);
assert.match(p005Api, /audio\/transcriptions/);
assert.match(p005Api, /sessionStorage\.setItem\(DIRECT_KEY/);
assert.match(p005Api, /chatModel:''/);
assert.match(p005Api, /imageModel:''/);
assert.match(p005Api, /ttsModel:''/);
assert.match(p005Api, /sttModel:''/);
assert.match(p005Api, /function capabilities\(/);
assert.match(p005Api, /fetchWithTimeout/);
assert.match(read("p005/index.html"), /MODEL SETTINGS · SESSION BYOK/);
assert.match(read("p005/index.html"), /至少填一种能力/);
assert.match(read("p005/index.html"), /图像与语音/);
assert.match(p005, /HORIZON_OPTIONS = \['1y','2y','3y','4y','10y','age60'\]/);
assert.doesNotMatch(p005, /if\(name==='generate'\).*survey/);
assert.match(read("p005/runtime-config.js"), /targetHorizon: "4y"/);
assert.match(read("p005/admin.html"), /60 岁时/);
assert.match(read("p005/admin.html"), /研究复刻版/);
assert.match(read("p005/runtime-config.js"), /transcribeApi/);
assert.match(read("p005/METHODS_MAPPING.md"), /sequential, one question per screen/);
assert.match(read("docs/DESIGN_PRINCIPLES.md"), /Less is more/);
assert.match(read("docs/ARCHITECTURE.md"), /P004 \/ P005 future standalone decision/);
const p005Manifest = JSON.parse(read("p005/module-manifest.json"));
assert.equal(p005Manifest.version, "0.7.0");
assert.equal(p005Manifest.interoperability.required_predecessors.length, 0);
assert.equal(p005Manifest.interoperability.optional_collection_sources.length, 0);
assert.equal(p005Manifest.interoperability.p004_requires_explicit_user_consent, true);
assert.equal(p005Manifest.admin_data.peer_context_raw_copied_into_snapshot, false);
assert.equal(p005Manifest.shared_profile.runtime_dependency, false);
assert.equal(JSON.parse(read("p004/module-manifest.json")).interoperability.bilateral_peer, "P005");
assert.equal(JSON.parse(read("p004/module-manifest.json")).interoperability.shared_profile_runtime_dependency, false);
assert.match(workflowText, /node tests\/p005-runtime\.mjs/);
assert.match(workflowText, /node --check p005\/api-client\.js/);

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

const p005Index = read("p005/index.html");
assert.doesNotMatch(p005Index, /P001 共用画像|不重复 P001 的玩法/);
assert.doesNotMatch(p005, /source:'p001-reuse'/);
assert.ok(
  !/key:'p001Qualities'|key:'p001Values'/.test(p005),
  "legacy P001 answer keys may only appear in migration references, never active question definitions"
);
assert.match(p005, /if\(!allowed\)return \{allowed:false\};/);

console.log("Repository structure checks passed: standalone P004/P005 + explicit bilateral consent + private admin boundaries.");
