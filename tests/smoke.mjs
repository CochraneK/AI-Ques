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
}

const elements = new Map();
const getElement = (selector) => {
  if (!elements.has(selector)) elements.set(selector, new FakeElement());
  return elements.get(selector);
};

const document = {
  querySelector: getElement,
  querySelectorAll: () => [],
};

const context = vm.createContext({
  console,
  document,
  window: { scrollTo() {} },
  location: { search: "" },
  setTimeout,
  clearTimeout,
});

for (const file of ["../p002/app.js"]) {
  const source = fs.readFileSync(new URL(file, import.meta.url), "utf8");
  vm.runInContext(source, context, { filename: file });
}

function evaluate(expression) {
  return vm.runInContext(expression, context);
}

assert.deepEqual(
  Array.from(evaluate("Object.keys(SCALES)")),
  ["pcl5", "cape15"],
  "P002 should expose exactly the two declared scale prototypes"
);
assert.equal(evaluate("SCALES.pcl5.items.length"), 20, "PCL-5 prototype should expose 20 items");
assert.equal(evaluate("SCALES.cape15.items.length"), 15, "CAPE-P15 prototype should expose 15 items");
assert.equal(evaluate("SCALES.pcl5.choices.length"), 5, "PCL-5 response format should remain 0-4");
assert.equal(evaluate("SCALES.cape15.choices.length"), 4, "CAPE prototype should remain four frequency choices");
assert.equal(evaluate("SCALES.cape15.scoringScheme"), "current-cape-p15-original-0-3", "CAPE should declare the original 0-3 scoring scheme");
assert.equal(evaluate("SCALES.cape15.distressChoices.length"), 4, "CAPE should expose four distress choices");
assert.equal(evaluate("SCALES.cape15.scoreOffset"), undefined, "CAPE should not apply the old +1 score offset");
assert.match(evaluate("SCALES.pcl5.instruction"), /同一段最困扰的压力经历/, "PCL instruction should preserve a single stressful-event anchor");
assert.match(evaluate("SCALES.pcl5.instruction"), /困扰到你/, "PCL instruction should ask degree of bother, not frequency");
assert.equal(evaluate("state.emojiIndex"), null, "emoji placement should initialize once per run rather than using many fixed items");

const expectedModes = ["original", "vassip", "emoji", "rush"];

assert.deepEqual(
  Array.from(evaluate("Object.keys(MODES)")).sort(),
  [...expectedModes].sort(),
  "P002 runtime registry should expose exactly the four active modes"
);

const manifest = JSON.parse(
  fs.readFileSync(new URL("../p002/study-manifest.json", import.meta.url), "utf8")
);
assert.deepEqual(
  Object.keys(manifest.modes).sort(),
  [...expectedModes].sort(),
  "P002 study manifest mode list should match the runtime mode registry"
);
assert.equal(manifest.formal_data_collection_authorized, false);
assert.equal(manifest.status, "prototype_only");

const smokeResult = evaluate(`
(() => {
  const failures = [];
  const terminalIndex = (scale, mode) => {
    if (mode === "rush") return RUSH[scale].length;
    return SCALES[scale].items.length;
  };

  for (const scale of Object.keys(SCALES)) {
    for (const mode of Object.keys(MODES)) {
      try {
        resetRun();
        state.scale = scale;
        state.mode = mode;
        renderStep();

        resetRun();
        state.scale = scale;
        state.mode = mode;
        state.index = terminalIndex(scale, mode);
        renderStep();
      } catch (error) {
        failures.push({ scale, mode, message: String(error?.stack || error) });
      }
    }
  }
  return failures;
})()
`);

assert.deepEqual(Array.from(smokeResult), [], "all P002 scale × mode start/end smoke paths should execute");

console.log("P002 smoke tests passed: 2 scales × 4 active modes, registry + manifest + start/end paths.");


const appSource = fs.readFileSync(new URL("../p002/app.js", import.meta.url), "utf8");
const htmlSource = fs.readFileSync(new URL("../p002/index.html", import.meta.url), "utf8");

assert.ok(!appSource.includes("高信号"), "participant-facing source should not contain scoring feedback labels");
assert.ok(!appSource.includes("中等信号"), "participant-facing source should not contain scoring feedback labels");
assert.ok(!htmlSource.includes("START AN EXPERIMENT"), "launcher should avoid redundant research UI chrome");
assert.ok(!htmlSource.includes("正式研究或服务部署前"), "ethics/governance copy belongs in research docs, not repeated participant footer");
assert.match(appSource,/state\.index===state\.emojiIndex/, "Emoji Game should use one session-level placement");
assert.match(appSource,/SHOW_RESEARCH/, "raw research scores should be gated behind research view");

assert.ok(!appSource.includes("emoji-counter"), "no persistent Emoji counter should clutter the questionnaire");
assert.ok(!appSource.includes("构念启发"), "participant SJT screens should not expose construct-language chrome");
assert.ok(!appSource.includes("item.cluster}</div>"), "participant item labels should not append construct codes");
