import assert from 'node:assert/strict';
import { MemoryStore } from './storage.js';
import { protocolFromEnv, validateConsent } from './protocol.js';

const protocol=protocolFromEnv({P005_TARGET_HORIZON:'4y',P005_INTAKE_PROTOCOL:'guided'});
assert.equal(protocol.protocolVersion,'p005-prod-1.0.0');
assert.equal(protocol.targetHorizon,'4y');
assert.equal(protocol.intakeProtocol,'guided');

assert.equal(validateConsent({futureNotPrediction:true,researchData:true,privacy:true}).ok,true);
assert.equal(validateConsent({futureNotPrediction:true}).ok,false);

const store=await new MemoryStore().init();
const created=await store.createSession({
  externalParticipantId:'pilot-001',
  studyId:'future-you-pilot',
  condition:'guided-text',
  protocol,
  consent:{futureNotPrediction:true,researchData:true,privacy:true,media:false,voice:false},
  client:{ua:'test'}
});
assert.ok(created.resumeToken);
assert.equal(created.session.status,'active');

const session=await store.getSession(created.session.id,created.resumeToken);
assert.equal(session.externalParticipantId,'pilot-001');

const event=await store.recordEvent(created.session.id,created.resumeToken,{
  type:'survey_answered',
  payload:{key:'name'},
  snapshot:{profile:{name:'小林'},screen:'survey'}
});
assert.ok(event.id);

const detail=await store.adminSession(created.session.id);
assert.equal(detail.events.length,1);
assert.equal(detail.session.currentState.profile.name,'小林');

await store.recordEvent(created.session.id,created.resumeToken,{
  type:'chat_ended',
  payload:{exchanged:16},
  snapshot:{screen:'share'}
});
const completed=await store.getSession(created.session.id,created.resumeToken);
assert.equal(completed.status,'completed');

assert.equal(await store.deleteSession(created.session.id,'wrong-token'),false);
assert.equal(await store.deleteSession(created.session.id,created.resumeToken),true);
assert.equal(await store.getSession(created.session.id,created.resumeToken),null);

console.log('P005 production API tests passed: protocol + consent + session + event + deletion.');
