import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const source=fs.readFileSync(path.resolve(here,"../p005/api-client.js"),"utf8");

const memory=new Map();
const sessionStorage={
  getItem:(k)=>memory.has(k)?memory.get(k):null,
  setItem:(k,v)=>memory.set(k,String(v)),
  removeItem:(k)=>memory.delete(k)
};
class CustomEvent {
  constructor(type,init={}){this.type=type;this.detail=init.detail}
}
const events=[];
const window={dispatchEvent:(event)=>events.push(event)};
const context=vm.createContext({
  window,
  sessionStorage,
  CustomEvent,
  console,
  setTimeout,
  clearTimeout,
  fetch:async()=>{throw new Error("fetch should not run in capability tests")},
  URL,
  Uint8Array,
  atob:globalThis.atob,
  Blob:globalThis.Blob,
  FormData:globalThis.FormData
});
vm.runInContext(source,context,{filename:"p005/api-client.js"});

const api=window.P005_API;
assert.ok(api,"P005_API should be exposed");
assert.deepEqual({...api.capabilities()},{chat:false,image:false,tts:false,stt:false});
assert.equal(api.configured,false);
assert.equal(api.chatConfigured,false);

api.saveDirect({
  baseUrl:"https://example.test/v1",
  apiKey:"session-key",
  imageModel:"image-model"
});
assert.deepEqual({...api.capabilities()},{chat:false,image:true,tts:false,stt:false});
assert.equal(api.configured,true,"an image-only setup must count as configured");
assert.equal(api.chatConfigured,false);
assert.match(sessionStorage.getItem("bjtu.p005.openai-compatible.v1"),/session-key/);

api.saveDirect({
  baseUrl:"https://example.test/v1",
  apiKey:"session-key",
  ttsModel:"tts-model",
  sttModel:"stt-model"
});
assert.deepEqual({...api.capabilities()},{chat:false,image:false,tts:true,stt:true});
assert.equal(api.configured,true,"voice-only setup must count as configured");

api.saveDirect({
  baseUrl:"https://example.test/v1",
  apiKey:"session-key",
  chatModel:"chat-model"
});
assert.deepEqual({...api.capabilities()},{chat:true,image:false,tts:false,stt:false});
assert.equal(api.chatConfigured,true);

api.clearDirect();
assert.equal(sessionStorage.getItem("bjtu.p005.openai-compatible.v1"),null);
assert.equal(api.configured,false);
assert.ok(events.some((event)=>event.type==="p005:api-settings-changed"));

assert.doesNotMatch(source,/localStorage\.setItem/,"BYOK API key must never be written to localStorage");

console.log("P005 runtime checks passed: independent capabilities + session-only BYOK.");
