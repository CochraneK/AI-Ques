import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(new URL('../'+p, import.meta.url),'utf8');
const registry=JSON.parse(read('shared/project-registry.json'));
const p2=read('p002/app.js');
const p2html=read('p002/index.html');
const portal=read('portal/app.js');
const admin=read('admin/app.js');
const core=read('shared/core.js');

assert.equal(new Set(registry.projects.map(x=>x.id)).size, registry.projects.length, 'project ids must be unique');
assert.ok(registry.projects.find(x=>x.id==='P001'&&x.status==='active'));
assert.ok(registry.projects.find(x=>x.id==='P002'&&x.status==='active'));

assert.match(core,/participant_id/);
assert.match(core,/startSession/);
assert.match(core,/session_completed/);
assert.match(core,/\/v1\/events/);
assert.match(core,/\/v1\/admin\/events/);

assert.ok(!p2html.includes('id="participantId"'), 'P002 must not ask participant id again');
assert.match(p2,/conditionId/);
assert.match(p2,/condition_id/);
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

for (const [name,src] of [['p002',p2],['portal',portal],['admin',admin],['core',core]]) {
  new Function(src);
  console.log('syntax ok:',name);
}
console.log('global/P002 smoke checks passed');
