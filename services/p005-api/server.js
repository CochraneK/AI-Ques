import crypto from 'node:crypto';
import express from 'express';
import multer from 'multer';
import { createStore } from './storage.js';
import { protocolFromEnv, consentDefinition, validateConsent } from './protocol.js';

const env = process.env;
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const store = await createStore(env);
const protocol = protocolFromEnv(env);
const PORT = Number(env.PORT || 3000);
const allowedOrigins = new Set(
  String(env.FRONTEND_ORIGINS || 'https://cochranek.github.io,http://localhost:8000,http://127.0.0.1:8000')
    .split(',').map((x) => x.trim()).filter(Boolean)
);
const adminToken = String(env.ADMIN_TOKEN || '');
const providerBase = String(env.MODEL_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/,'');
const providerKey = String(env.MODEL_API_KEY || '');
const models = {
  chat: String(env.CHAT_MODEL || ''),
  memory: String(env.MEMORY_MODEL || env.CHAT_MODEL || ''),
  image: String(env.IMAGE_MODEL || ''),
  tts: String(env.TTS_MODEL || ''),
  stt: String(env.STT_MODEL || '')
};
const requestBuckets = new Map();

app.disable('x-powered-by');
app.use(express.json({ limit: '14mb' }));
app.use((req,res,next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary','Origin');
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization,X-Session-Id,X-Admin-Token');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,DELETE,OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});
app.use((req,res,next) => {
  if (req.path === '/health') return next();
  const key = req.ip || 'unknown';
  const minute = Math.floor(Date.now()/60000);
  const bucketKey = key+':'+minute;
  const count = (requestBuckets.get(bucketKey)||0)+1;
  requestBuckets.set(bucketKey,count);
  if (requestBuckets.size > 5000) {
    for (const k of requestBuckets.keys()) if (!k.endsWith(':'+minute)) requestBuckets.delete(k);
  }
  if (count > Number(env.RATE_LIMIT_PER_MINUTE || 180)) return res.status(429).json({error:'rate_limited'});
  next();
});

function bearer(req) {
  const value = String(req.headers.authorization || '');
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}
function sessionHeaders(req) {
  return { id: String(req.headers['x-session-id'] || ''), token: bearer(req) };
}
async function requireSession(req,res,next) {
  const {id,token}=sessionHeaders(req);
  const session = await store.getSession(id,token);
  if (!session) return res.status(401).json({error:'invalid_session'});
  req.researchSession=session;
  req.researchToken=token;
  next();
}
function requireAdmin(req,res,next) {
  const supplied=String(req.headers['x-admin-token']||'');
  const a=Buffer.from(supplied),b=Buffer.from(adminToken);
  if (!adminToken || a.length!==b.length || !crypto.timingSafeEqual(a,b)) return res.status(401).json({error:'admin_auth_required'});
  next();
}
function modelReady(kind) {
  return Boolean(providerKey && models[kind]);
}
function providerHeaders(json=true) {
  return {
    ...(json?{'Content-Type':'application/json'}:{}),
    'Authorization':'Bearer '+providerKey
  };
}
async function providerJson(path, body) {
  const response=await fetch(providerBase+path,{
    method:'POST',
    headers:providerHeaders(true),
    body:JSON.stringify(body),
    signal:AbortSignal.timeout(Number(env.MODEL_TIMEOUT_MS||60000))
  });
  const text=await response.text();
  let data={}; try{data=JSON.parse(text)}catch(_){}
  if(!response.ok)throw new Error(data?.error?.message||('provider_'+response.status));
  return data;
}
function textFromChat(data) {
  const value=data?.choices?.[0]?.message?.content;
  if(typeof value==='string')return value.trim();
  if(Array.isArray(value))return value.map((x)=>x?.text||'').join('').trim();
  return '';
}
function futureMessages(payload, instruction) {
  const context={
    target:payload.target||null,
    intakeProtocol:payload.intakeProtocol||null,
    profile:payload.profile||{},
    structuredAnswers:payload.structuredAnswers||{},
    personaBrief:payload.personaBrief||{},
    syntheticMemory:payload.syntheticMemory||null
  };
  return [
    {role:'system',content:String(instruction||payload.instruction||'')+'\n\n【Future Me context】\n'+JSON.stringify(context)+'\n\nUse this context naturally; do not dump it.'},
    ...(payload.messages||[]).map((m)=>({
      role:m.role==='future'||m.role==='assistant'?'assistant':'user',
      content:String(m.text||m.content||'')
    }))
  ];
}
function parseModelJson(text) {
  const cleaned=String(text||'').replace(/^\s*```(?:json)?/i,'').replace(/```\s*$/,'').trim();
  return JSON.parse(cleaned);
}
function dataUrlToBlob(dataUrl) {
  const match=String(dataUrl||'').match(/^data:([^;]+);base64,(.+)$/);
  if(!match)throw new Error('invalid_image_data');
  return new Blob([Buffer.from(match[2],'base64')],{type:match[1]});
}
function csvCell(value) {
  const text=typeof value==='string'?value:JSON.stringify(value??'');
  return '"'+text.replaceAll('"','""')+'"';
}

app.get('/health', async (_req,res) => {
  try {
    const db=await store.health();
    res.json({ok:true,service:'p005-api',protocolVersion:protocol.protocolVersion,db,models:{
      chat:modelReady('chat'),memory:modelReady('memory'),image:modelReady('image'),tts:modelReady('tts'),stt:modelReady('stt')
    }});
  } catch (error) {
    res.status(503).json({ok:false,error:String(error.message||error)});
  }
});

app.get('/api/v1/protocol', (_req,res) => {
  res.json({protocol,consent:consentDefinition()});
});

app.post('/api/v1/sessions', async (req,res,next) => {
  try {
    const consent=req.body?.consent||{};
    const checked=validateConsent(consent);
    if(!checked.ok)return res.status(400).json({error:'consent_required',missing:checked.missing});
    const created=await store.createSession({
      externalParticipantId:String(req.body?.participantId||'').slice(0,128),
      studyId:String(req.body?.studyId||'p005').slice(0,80),
      condition:String(req.body?.condition||'').slice(0,80),
      protocol,
      consent,
      client:req.body?.client||{}
    });
    res.status(201).json({
      participantId:created.participant.id,
      externalParticipantId:created.participant.externalId,
      session:created.session,
      resumeToken:created.resumeToken,
      protocol
    });
  } catch(error){next(error)}
});

app.get('/api/v1/sessions/:id', async (req,res,next) => {
  try{
    const session=await store.getSession(req.params.id,bearer(req));
    if(!session)return res.status(401).json({error:'invalid_session'});
    res.json({session,protocol});
  }catch(error){next(error)}
});

app.post('/api/v1/sessions/:id/consent', async (req,res,next) => {
  try{
    const checked=validateConsent(req.body||{});
    if(!checked.ok)return res.status(400).json({error:'consent_required',missing:checked.missing});
    const session=await store.updateConsent(req.params.id,bearer(req),req.body||{});
    if(!session)return res.status(401).json({error:'invalid_session'});
    res.json({session});
  }catch(error){next(error)}
});

app.post('/api/v1/sessions/:id/events', async (req,res,next) => {
  try{
    const event=await store.recordEvent(req.params.id,bearer(req),{
      type:req.body?.type,
      payload:req.body?.payload||{},
      snapshot:req.body?.snapshot||null,
      occurredAt:req.body?.occurredAt||new Date().toISOString()
    });
    if(!event)return res.status(401).json({error:'invalid_session'});
    res.status(201).json({ok:true,eventId:event.id});
  }catch(error){next(error)}
});

app.delete('/api/v1/sessions/:id', async (req,res,next) => {
  try{
    const deleted=await store.deleteSession(req.params.id,bearer(req));
    if(!deleted)return res.status(401).json({error:'invalid_session'});
    res.status(204).end();
  }catch(error){next(error)}
});

app.post('/api/v1/ai/chat', requireSession, async (req,res,next) => {
  try{
    if(!modelReady('chat'))return res.status(503).json({error:'chat_model_not_configured'});
    const payload=req.body||{};
    const messages=futureMessages(payload,payload.instruction);
    if(payload.userMessage && !messages.some((m,i)=>i===messages.length-1&&m.role==='user'&&m.content===payload.userMessage)){
      messages.push({role:'user',content:String(payload.userMessage)});
    }
    const data=await providerJson('/chat/completions',{model:models.chat,messages,stream:false});
    const reply=textFromChat(data);
    if(!reply)throw new Error('empty_chat_reply');
    res.json({reply});
  }catch(error){next(error)}
});

app.post('/api/v1/ai/memory', requireSession, async (req,res,next) => {
  try{
    if(!modelReady('memory'))return res.status(503).json({error:'memory_model_not_configured'});
    const payload=req.body||{};
    const messages=futureMessages(payload,
      'Create one plausible future memory, not a prediction. Return ONLY valid JSON with summary, futureVignette, memories (3 strings), timeline, and voiceAnchors. Ground it in the supplied context. Do not diagnose.'
    );
    messages.push({role:'user',content:'Generate the Future Memory JSON now.'});
    const data=await providerJson('/chat/completions',{model:models.memory,messages,stream:false});
    res.json(parseModelJson(textFromChat(data)));
  }catch(error){next(error)}
});

app.post('/api/v1/ai/image', requireSession, async (req,res,next) => {
  try{
    if(!modelReady('image'))return res.status(503).json({error:'image_model_not_configured'});
    const payload=req.body||{};
    const form=new FormData();
    form.append('model',models.image);
    form.append('image',dataUrlToBlob(payload.image),'present-self.jpg');
    form.append('size','1024x1024');
    form.append('prompt',String(payload.instruction||'Preserve identity and create a respectful, natural future-age portrait.')+
      ' Current age: '+String(payload.currentAge||'unknown')+'. Target age: '+String(payload.targetAge||'unknown')+'.');
    const response=await fetch(providerBase+'/images/edits',{
      method:'POST',headers:providerHeaders(false),body:form,
      signal:AbortSignal.timeout(Number(env.IMAGE_TIMEOUT_MS||90000))
    });
    const text=await response.text();let data={};try{data=JSON.parse(text)}catch(_){}
    if(!response.ok)throw new Error(data?.error?.message||('provider_'+response.status));
    const item=data?.data?.[0]||{};
    const imageUrl=item.url||(item.b64_json?'data:image/png;base64,'+item.b64_json:'');
    if(!imageUrl)throw new Error('empty_image_reply');
    res.json({imageUrl});
  }catch(error){next(error)}
});

app.post('/api/v1/ai/tts', requireSession, async (req,res,next) => {
  try{
    if(!modelReady('tts'))return res.status(503).json({error:'tts_model_not_configured'});
    const response=await fetch(providerBase+'/audio/speech',{
      method:'POST',
      headers:providerHeaders(true),
      body:JSON.stringify({
        model:models.tts,
        input:String(req.body?.text||'').slice(0,4096),
        voice:String(req.body?.voice||env.TTS_VOICE||'marin'),
        instructions:String(req.body?.instructions||'自然、平静、像熟悉自己的真人，不要播音腔。'),
        response_format:'mp3'
      }),
      signal:AbortSignal.timeout(Number(env.MODEL_TIMEOUT_MS||60000))
    });
    if(!response.ok){
      const text=await response.text();let data={};try{data=JSON.parse(text)}catch(_){}
      throw new Error(data?.error?.message||('provider_'+response.status));
    }
    res.setHeader('Content-Type','audio/mpeg');
    res.setHeader('Cache-Control','no-store');
    res.send(Buffer.from(await response.arrayBuffer()));
  }catch(error){next(error)}
});

app.post('/api/v1/ai/transcribe', requireSession, upload.single('audio'), async (req,res,next) => {
  try{
    if(!modelReady('stt'))return res.status(503).json({error:'stt_model_not_configured'});
    if(!req.file)return res.status(400).json({error:'audio_required'});
    const form=new FormData();
    form.append('file',new Blob([req.file.buffer],{type:req.file.mimetype||'audio/webm'}),req.file.originalname||'future-me.webm');
    form.append('model',models.stt);
    form.append('language',String(req.body?.language||'zh'));
    const response=await fetch(providerBase+'/audio/transcriptions',{
      method:'POST',headers:providerHeaders(false),body:form,
      signal:AbortSignal.timeout(Number(env.MODEL_TIMEOUT_MS||60000))
    });
    const text=await response.text();let data={};try{data=JSON.parse(text)}catch(_){}
    if(!response.ok)throw new Error(data?.error?.message||('provider_'+response.status));
    res.json({text:String(data.text||'').trim()});
  }catch(error){next(error)}
});

app.get('/api/v1/admin/sessions', requireAdmin, async (req,res,next) => {
  try{res.json({sessions:await store.listSessions({limit:req.query.limit})})}catch(error){next(error)}
});
app.get('/api/v1/admin/sessions/:id', requireAdmin, async (req,res,next) => {
  try{
    const detail=await store.adminSession(req.params.id);
    if(!detail)return res.status(404).json({error:'not_found'});
    res.json(detail);
  }catch(error){next(error)}
});
app.get('/api/v1/admin/export.csv', requireAdmin, async (_req,res,next) => {
  try{
    const sessions=await store.listSessions({limit:10000});
    const header=['session_id','participant_id','study_id','condition','protocol_version','status','created_at','updated_at','event_count','consent_json','current_state_json'];
    const rows=[header.join(',')];
    for(const s of sessions)rows.push([
      s.id,s.participantId,s.studyId,s.condition,s.protocolVersion,s.status,s.createdAt,s.updatedAt,s.eventCount,s.consent,s.currentState
    ].map(csvCell).join(','));
    res.setHeader('Content-Type','text/csv; charset=utf-8');
    res.setHeader('Content-Disposition','attachment; filename="p005-sessions.csv"');
    res.send('\uFEFF'+rows.join('\n'));
  }catch(error){next(error)}
});

app.use((error,req,res,_next) => {
  console.error('[p005-api]',req.method,req.path,error);
  const expose=env.NODE_ENV!=='production';
  res.status(500).json({error:'server_error',...(expose?{message:String(error.message||error)}:{})});
});

app.listen(PORT,'0.0.0.0',() => {
  console.log(JSON.stringify({
    service:'p005-api',port:PORT,protocolVersion:protocol.protocolVersion,
    storage:env.DATABASE_URL?'postgres':'memory',
    modelCapabilities:Object.fromEntries(Object.keys(models).map((k)=>[k,modelReady(k)]))
  }));
});
