import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(new URL('../'+p, import.meta.url),'utf8');
const registry=JSON.parse(read('shared/project-registry.json'));
const p2=read('p002/app.js');
const p2html=read('p002/index.html');
const portal=read('portal/app.js');
const admin=read('admin/app.js');
const core=read('shared/core.js');
const p004Adapter=read('p004/global-adapter.js');
const p005Adapter=read('future-me/global-adapter.js');

assert.equal(new Set(registry.projects.map(x=>x.id)).size, registry.projects.length, 'project ids must be unique');
assert.ok(registry.projects.find(x=>x.id==='P001'));
assert.ok(registry.projects.find(x=>x.id==='P005'&&x.status==='active'&&x.route.includes('future-me')));
assert.ok(registry.projects.find(x=>x.id==='P002'&&x.status==='active'));

assert.match(core,/participant_id/);
assert.match(core,/startSession/);
assert.match(core,/session_completed/);
assert.match(core,/\/v1\/events/);
assert.match(core,/\/v1\/admin\/events/);

assert.ok(!p2html.includes('id="participantId"'), 'P002 must not ask participant id again');
assert.match(p2,/conditionId/);
assert.match(p2,/condition_id/);
assert.match(p2,/current-cape-p15-original-0-3/);
assert.match(p2,/\[\["从未",0\],\["有时",1\],\["经常",2\],\["几乎总是",3\]\]/);
assert.match(p2,/state\.pendingFrequency>=1/);
assert.match(p2,/AIQ\.recordEvent\("item_response"/);
assert.match(p2,/AIQ\.completeSession/);
assert.match(p2,/state\.conditionId==="guided" \? item\.cluster : "neutral"/);
assert.match(p2,/state\.conditionId==="guided" \? " · " \+ item\.cluster : ""/);

const pclCount=(p2.match(/\["[BCDE]","/g)||[]).length;
const capeCount=(p2.match(/\["(?:PI|BE|PA)","/g)||[]).length;
assert.equal(pclCount,20,'PCL-5 must have 20 items');
assert.equal(capeCount,15,'CAPE-P15 must have 15 items');

assert.match(portal,/project-registry\.json/);
assert.match(admin,/P002/);
assert.match(admin,/rapid_under_800ms_n/);
assert.match(core,/aiques\.global\.profile\.v1/);
assert.match(p004Adapter,/AIQ\.startSession\('P004'/);
assert.match(p004Adapter,/chat_user_message/);
assert.match(p005Adapter,/AIQ\.startSession\('P005'/);
assert.match(p005Adapter,/capsule_saved/);
assert.match(p2,/criterion_a_established:false/);

for (const [name,src] of [['p002',p2],['portal',portal],['admin',admin],['core',core],['p004-adapter',p004Adapter],['p005-adapter',p005Adapter]]) {
  new Function(src);
  console.log('syntax ok:',name);
}
console.log('global/P002 smoke checks passed');
