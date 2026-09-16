import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

class FakeClassList {
  add() {}
  remove() {}
  contains() { return false; }
}

class FakeElement {
  constructor() {
    this.innerHTML = "";
    this.textContent = "";
    this.disabled = false;
    this.onclick = null;
    this.style = {};
    this.classList = new FakeClassList();
    this.offsetTop = 0;
  }
  querySelectorAll() { return []; }
  appendChild() {}
}

const elements = new Map();
const getElement = (selector) => {
  if (!elements.has(selector)) elements.set(selector, new FakeElement());
  return elements.get(selector);
};

const document = {
  querySelector: getElement,
  querySelectorAll: () => [],
  createElement: () => new FakeElement(),
};

const store = new Map();
const localStorage = {
  getItem(key){ return store.has(key) ? store.get(key) : null; },
  setItem(key,value){ store.set(key,String(value)); },
  removeItem(key){ store.delete(key); },
};

const context = vm.createContext({
  console,
  document,
  localStorage,
  window: { scrollTo() {} },
  location: { search: "" },
  setTimeout,
  clearTimeout,
});

for (const file of ["../shared/config.js", "../shared/core.js", "../p002/condition-config.js", "../p002/app.js"]) {
  const source = fs.readFileSync(new URL(file, import.meta.url), "utf8");
  vm.runInContext(source, context, { filename: file });
}

function evaluate(expression) {
  return vm.runInContext(expression, context);
}

assert.deepEqual(
  Array.from(evaluate("Object.keys(SCALES)")),
  ["pcl5", "cape15"],
  "P002 should expose exactly two scale prototypes"
);
assert.equal(evaluate("SCALES.pcl5.items.length"), 20);
assert.equal(evaluate("SCALES.cape15.items.length"), 15);
assert.equal(evaluate("SCALES.pcl5.choices.length"), 5);
assert.equal(evaluate("SCALES.cape15.choices.length"), 4);
assert.equal(evaluate("SCALES.cape15.scoringScheme"), "cape-p15-published-1-4");
assert.deepEqual(Array.from(evaluate("SCALES.cape15.choiceValues")), [1,2,3,4]);
assert.equal(evaluate("SCALES.cape15.distressChoices.length"), 4);
assert.deepEqual(Array.from(evaluate("SCALES.cape15.distressValues")), [1,2,3,4]);
assert.equal(evaluate("SCALES.cape15.scoreOffset"), undefined);
assert.match(evaluate("SCALES.pcl5.instruction"), /同一段最困扰的压力经历/);
assert.match(evaluate("SCALES.pcl5.instruction"), /困扰到你/);

assert.equal(evaluate("P002_CONDITION.key"), "bjtu.p002.condition.v1");
assert.deepEqual(
  Array.from(evaluate("Object.keys(P002_CONDITION.options)")),
  ["story", "direct", "scenario"]
);
assert.equal(evaluate("P002_CONDITION.read().condition"), "story", "story must be the no-config default");
assert.equal(evaluate("state.condition"), "story", "participant runtime should start in story mode by default");

assert.match(evaluate("P00_RESEARCH.ensureParticipant().participant_id"), /^pt_/);
const stableParticipantId = evaluate("P00_RESEARCH.participantId()");
assert.equal(evaluate("P00_RESEARCH.participantId()"), stableParticipantId, "participant_id must stay stable");
const testSessionId = evaluate(`P00_RESEARCH.createSession({project_id:"P002",study_version:"test",scale_id:"pcl5",condition_id:"story"}).session_id`);
assert.match(testSessionId, /^ss_/);
evaluate(`P00_RESEARCH.appendEvent({project_id:"P002",session_id:"${testSessionId}",study_version:"test",scale_id:"pcl5",condition_id:"story",event_type:"item_response",item_id:1,cluster:"B",response:2,distress:null,response_ms:123})`);
assert.equal(evaluate("P00_RESEARCH.listSessions('P002').length"), 1);
assert.equal(evaluate("P00_RESEARCH.listEvents('P002').length"), 1);
assert.equal(evaluate("P00_RESEARCH.pendingCount('P002')"), 1);



const manifest = JSON.parse(
  fs.readFileSync(new URL("../p002/study-manifest.json", import.meta.url), "utf8")
);
assert.equal(manifest.study_version, "0.11.0-prototype");
assert.equal(manifest.scales.cape15.response_encoding, "1-4 frequency + conditional 1-4 distress");
assert.equal(manifest.scales.cape15.scoring_scheme, "published-response-codes-1-4");
assert.equal(manifest.scales.cape15.chinese_evidence.repository_wording_is_validated_version, false);
assert.equal(manifest.instrument_assets.formal_target_language_wording_frozen, false);
assert.equal(manifest.presentation_control.participant_can_choose_condition, false);
assert.equal(manifest.presentation_control.default_condition, "story");
assert.equal(manifest.presentation_control.storage_key, "bjtu.p002.condition.v1");
assert.deepEqual(
  Object.keys(manifest.presentation_control.conditions),
  ["story", "direct", "scenario"]
);
assert.ok(!("modes" in manifest), "legacy participant mode registry should be removed");

const smokeResult = evaluate(`
(() => {
  const failures = [];
  const terminalIndex = (scale, condition) =>
    condition === "scenario" ? RUSH[scale].length : SCALES[scale].items.length;

  for (const scale of Object.keys(SCALES)) {
    for (const condition of Object.keys(P002_CONDITION.options)) {
      try {
        resetRun();
        state.scale = scale;
        state.condition = condition;
        renderStep();

        resetRun();
        state.scale = scale;
        state.condition = condition;
        state.index = terminalIndex(scale, condition);
        renderStep();
      } catch (error) {
        failures.push({ scale, condition, message: String(error?.stack || error) });
      }
    }
  }
  return failures;
})()
`);

assert.deepEqual(Array.from(smokeResult), [], "all P002 scale × admin-condition start/end paths should execute");

const appSource = fs.readFileSync(new URL("../p002/app.js", import.meta.url), "utf8");
const htmlSource = fs.readFileSync(new URL("../p002/index.html", import.meta.url), "utf8");
const adminSource = fs.readFileSync(new URL("../p002/admin.js", import.meta.url), "utf8");

assert.ok(!appSource.includes("state.mode"), "participant-selectable mode state should be gone");
assert.ok(!appSource.includes("Emoji Game"), "Emoji Game should be removed");
assert.ok(!appSource.includes("emojiIndex"), "Emoji runtime should be removed");
assert.ok(!htmlSource.includes("modeChoices"), "participant UI must not expose a condition picker");
assert.ok(!htmlSource.includes("data-mode"), "participant UI must not expose condition buttons");
assert.match(htmlSource,/condition-config\.js/, "participant runtime should read the shared admin config");
assert.match(adminSource,/cfg\.write\(selected\)/, "admin page should control the shared condition config");
assert.match(adminSource,/exportJsonBtn/);
assert.match(adminSource,/exportCsvBtn/);
assert.match(adminSource,/flushPending/);
assert.match(appSource,/RESEARCH\.createSession/);
assert.match(appSource,/recordEvent\('item_response'/);
assert.match(appSource,/condition_id:state\.condition/);
assert.match(appSource,/score>1/);
assert.match(appSource,/choiceValues:\[1,2,3,4\]/);
assert.match(appSource,/distressValues:\[1,2,3,4\]/);
assert.ok(!appSource.includes("current-cape-p15-original-0-3"));
assert.ok(!appSource.includes("原始 Current CAPE-15 论文使用 0–3"));
assert.match(appSource,/state\.condition==='story'/, "story questionnaire should remain the default presentation path");
assert.match(appSource,/state\.condition==='scenario'/, "scenario condition should remain administrator-selectable");
assert.match(appSource,/SHOW_RESEARCH/, "raw research details should remain gated");
assert.ok(!appSource.includes("高信号"));
assert.ok(!appSource.includes("中等信号"));
assert.ok(!appSource.includes("构念启发"));

console.log("P002 smoke tests passed: 2 scales × 3 admin-controlled conditions; participant picker removed; story is default.");

assert.ok(
  !appSource.includes("state.chapterSeen[ch.key]=Number"),
  "story chapter completion must not depend on a truthy choice index"
);
