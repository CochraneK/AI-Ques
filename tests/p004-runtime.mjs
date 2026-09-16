import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

function storage(){
  const values=new Map();
  return {
    getItem:key=>values.has(String(key))?values.get(String(key)):null,
    setItem:(key,value)=>values.set(String(key),String(value)),
    removeItem:key=>values.delete(String(key)),
    clear:()=>values.clear(),
    dump:()=>Object.fromEntries(values)
  };
}

function loadCore(){
  const context={console};
  vm.runInNewContext(read("p004/core.js"),context,{filename:"p004/core.js"});
  return context.P004_CORE;
}

function apiHarness(fetchImpl){
  const sessionStorage=storage();
  const events=[];
  const context={
    console,
    sessionStorage,
    CustomEvent:class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail}},
    AbortController,
    setTimeout,
    clearTimeout,
    fetch:fetchImpl,
    P004_CONFIG:{}
  };
  context.window=context;
  context.dispatchEvent=event=>events.push(event);
  vm.runInNewContext(read("p004/api-client.js"),context,{filename:"p004/api-client.js"});
  return {api:context.P004_API,context,sessionStorage,events};
}

const core=loadCore();

assert.equal(core.canImportP005(core.defaultConsent()),false);
assert.equal(core.canImportP005({p005Observer:true}),true);
assert.equal(core.validateCreatorStep(0,{}),"先选一种你们之间的关系");
assert.equal(core.validateCreatorStep(1,{relationship:"朋友关系",traits:[]}),"至少给 TA 一个核心品质");
assert.equal(core.validateCreatorStep(2,{relationship:"朋友关系",traits:["好奇心"]}),"选一种你希望 TA 带给你的感觉");
assert.equal(core.validateCreatorStep(2,{relationship:"朋友关系",traits:["好奇心"],feel:"温暖亲近"}),"");
assert.equal(core.normalizeMemoryCandidate("  很长   的\n一句话  "),"很长 的 一句话");
assert.equal(core.urgentSafety("我真的不想活了"),true);
assert.equal(core.urgentSafety("今天有点累"),false);

const observer={
  evidence:[{source:"P004",quote:"a"},{source:"P005",quote:"b"}],
  imports:{P005:"sig",P004:"own"},
  big:{openness:60}
};
const stripped=core.removeEvidenceSource(observer,"P005");
assert.deepEqual(JSON.parse(JSON.stringify(stripped.evidence)),[{source:"P004",quote:"a"}]);
assert.equal("P005" in stripped.imports,false);
assert.equal(stripped.imports.P004,"own");
assert.ok(core.p004LocalStorageKeys().includes("bjtu.p004.consent.v1"));

const calls=[];
const okFetch=async(url,options)=>{
  calls.push({url,options});
  return {
    ok:true,status:200,statusText:"OK",
    text:async()=>JSON.stringify({choices:[{message:{content:"OK"}}]})
  };
};
const {api,context,sessionStorage}=apiHarness(okFetch);
api.saveDirect({baseUrl:"https://example.test/v1",apiKey:"secret-key",model:"demo-model"});
assert.equal(api.mode,"openai-compatible");
const chat=await api.chat({
  character:{name:"Mori",identity:"friend"},
  persona:{name:"User"},
  memory:["likes tea"],
  messages:[{role:"user",text:"hello"}]
});
assert.equal(chat.reply,"OK");
assert.equal(calls[0].url,"https://example.test/v1/chat/completions");
assert.equal(calls[0].options.headers.Authorization,"Bearer secret-key");
assert.ok(!JSON.stringify(calls[0].options.body).includes("secret-key"));

const before=sessionStorage.getItem("bjtu.p004.openai-compatible.v1");
const tested=await api.testDirect({baseUrl:"https://other.test/v1",apiKey:"temporary",model:"other"});
assert.equal(tested.ok,true);
assert.equal(sessionStorage.getItem("bjtu.p004.openai-compatible.v1"),before);

context.fetch=async()=>({
  ok:false,status:401,statusText:"Unauthorized",
  text:async()=>JSON.stringify({error:{message:"bad key"}})
});
const unauthorized=await api.testDirect({baseUrl:"https://example.test/v1",apiKey:"bad",model:"demo"});
assert.equal(unauthorized.ok,false);
assert.equal(unauthorized.error.kind,"http");
assert.equal(unauthorized.error.status,401);
assert.equal(unauthorized.error.message,"bad key");

context.fetch=async()=>{throw new TypeError("Failed to fetch")};
const network=await api.testDirect({baseUrl:"http://localhost:3001/v1",apiKey:"local",model:"auto"});
assert.equal(network.ok,false);
assert.equal(network.error.kind,"network");
assert.equal(network.error.endpoint,"http://localhost:3001/v1/chat/completions");

api.clearDirect();
assert.equal(api.mode,"local");
assert.equal(sessionStorage.getItem("bjtu.p004.openai-compatible.v1"),null);

console.log("P004 runtime behavior checks passed.");
