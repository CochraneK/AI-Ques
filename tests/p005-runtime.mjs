import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../p005/api-client.js",import.meta.url),"utf8");

function makeStorage(){
  const map=new Map();
  return {
    getItem:key=>map.has(key)?map.get(key):null,
    setItem:(key,value)=>map.set(key,String(value)),
    removeItem:key=>map.delete(key),
    snapshot:()=>Object.fromEntries(map)
  };
}

const sessionStorage=makeStorage();
const requests=[];
const context={
  console,
  sessionStorage,
  AbortController,
  setTimeout,
  clearTimeout,
  CustomEvent:class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}},
  window:{dispatchEvent(){}},
  fetch:async(url,options={})=>{
    requests.push({url,options});
    return {
      ok:true,
      status:200,
      text:async()=>JSON.stringify({choices:[{message:{content:"OK"}}]})
    };
  }
};
context.window.window=context.window;
vm.runInNewContext(source,context,{filename:"p005/api-client.js"});

const api=context.window.P005_API;
assert.ok(api,"P005_API should be exposed");

assert.deepEqual(
  JSON.parse(JSON.stringify(api.capabilities())),
  {chat:false,image:false,tts:false,stt:false}
);

api.saveDirect({
  baseUrl:"https://example.test/v1",
  apiKey:"image-key",
  chatModel:"",
  imageModel:"image-model",
  ttsModel:"",
  sttModel:""
});
assert.equal(api.configured,false,"image-only config must not pretend chat is configured");
assert.deepEqual(
  JSON.parse(JSON.stringify(api.capabilities())),
  {chat:false,image:true,tts:false,stt:false},
  "each multimodal capability must be independently usable"
);

api.saveDirect({
  baseUrl:"https://persisted.test/v1",
  apiKey:"persisted-key",
  chatModel:"persisted-model"
});
const before=sessionStorage.getItem("bjtu.p005.openai-compatible.v1");
requests.length=0;

const test=await api.testDirect({
  baseUrl:"https://candidate.test/v1",
  apiKey:"candidate-key",
  chatModel:"candidate-model"
});
assert.equal(test.ok,true);
assert.equal(
  sessionStorage.getItem("bjtu.p005.openai-compatible.v1"),
  before,
  "connection test must not mutate the user's saved session config"
);
assert.equal(requests.length,1);
assert.equal(requests[0].url,"https://candidate.test/v1/chat/completions");
assert.equal(
  requests[0].options.headers.Authorization,
  "Bearer candidate-key",
  "connection test must use the candidate key rather than the previously saved key"
);

api.saveDirect({
  baseUrl:"https://future.test/v1",
  apiKey:"future-key",
  chatModel:"future-model"
});
requests.length=0;
await api.chat({
  instruction:"Act as Future Me.",
  profile:{name:"小林"},
  structuredAnswers:{p001Values:{selected:["保持好奇"]}},
  personaBrief:{continuity:{values:"保持好奇"}},
  syntheticMemory:{summary:"四年后仍在持续研究。"},
  target:{mode:"4y",phrase:"4 年后"},
  messages:[{role:"user",text:"后来怎么样？"}],
  userMessage:"后来怎么样？"
});
const payload=JSON.parse(requests[0].options.body);
const system=payload.messages[0].content;
assert.match(system,/Future Me context/);
assert.match(system,/四年后仍在持续研究/);
assert.match(system,/4 年后/);
assert.match(system,/保持好奇/);

console.log("P005 API runtime checks passed: independent capabilities + ephemeral test + grounded Future Me context.");
