(() => {
  'use strict';

  const KEY='bjtu.p005.research-session.v1';
  const config=()=>window.P005_FUTURE_ME_CONFIG||{};
  const base=()=>String(config().researchApi||'').replace(/\/$/,'');
  const clean=(v)=>String(v==null?'':v).trim();
  const parse=(v,f=null)=>{try{return JSON.parse(v)}catch(_){return f}};

  function read(){
    return parse(localStorage.getItem(KEY)||'',{})||{};
  }
  function write(value){
    localStorage.setItem(KEY,JSON.stringify(value||{}));
  }
  function clear(){
    localStorage.removeItem(KEY);
  }
  function urlMeta(){
    const q=new URLSearchParams(location.search);
    return {
      studyId:clean(q.get('study')||config().studyId||'p005'),
      participantId:clean(q.get('pid')||''),
      condition:clean(q.get('condition')||config().condition||'')
    };
  }
  function authHeaders(json=true){
    const s=read();
    return {
      ...(json?{'Content-Type':'application/json'}:{}),
      ...(s.resumeToken?{'Authorization':'Bearer '+s.resumeToken}:{}),
      ...(s.sessionId?{'X-Session-Id':s.sessionId}:{})
    };
  }
  async function request(path,options={}){
    if(!base())throw new Error('research_api_not_configured');
    const response=await fetch(base()+path,options);
    if(response.status===204)return null;
    const contentType=response.headers.get('content-type')||'';
    const data=contentType.includes('application/json')?await response.json():await response.text();
    if(!response.ok){
      const error=new Error(data?.error||('research_api_'+response.status));
      error.status=response.status;error.data=data;throw error;
    }
    return data;
  }
  async function init(){
    if(!base())return {configured:false};
    try{
      const data=await request('/api/v1/protocol');
      const protocol=data?.protocol||{};
      window.P005_FUTURE_ME_CONFIG=Object.assign({},config(),{
        targetHorizon:protocol.targetHorizon||config().targetHorizon,
        intakeProtocol:protocol.intakeProtocol||config().intakeProtocol,
        protocolVersion:protocol.protocolVersion||''
      });
      return {configured:true,protocol,consent:data?.consent||null};
    }catch(error){
      console.warn('P005 research protocol unavailable',error);
      return {configured:true,error};
    }
  }
  async function ensureSession(consent,client={}){
    const existing=read();
    if(existing.sessionId&&existing.resumeToken){
      try{
        const restored=await restore();
        if(restored?.session)return restored;
      }catch(error){
        if(error.status!==401)throw error;
        clear();
      }
    }
    const meta=urlMeta();
    const data=await request('/api/v1/sessions',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        participantId:meta.participantId,
        studyId:meta.studyId,
        condition:meta.condition,
        consent,
        client:Object.assign({
          userAgent:navigator.userAgent,
          language:navigator.language,
          timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||''
        },client||{})
      })
    });
    write({
      sessionId:data.session.id,
      resumeToken:data.resumeToken,
      participantId:data.participantId,
      externalParticipantId:data.externalParticipantId||meta.participantId||'',
      studyId:meta.studyId,
      condition:meta.condition,
      protocolVersion:data.protocol?.protocolVersion||'',
      createdAt:new Date().toISOString()
    });
    return data;
  }
  async function restore(){
    const s=read();
    if(!s.sessionId||!s.resumeToken)return null;
    return await request('/api/v1/sessions/'+encodeURIComponent(s.sessionId),{
      headers:authHeaders(false)
    });
  }
  async function event(type,payload={},snapshot=null){
    const s=read();
    if(!s.sessionId||!s.resumeToken||!base())return null;
    return await request('/api/v1/sessions/'+encodeURIComponent(s.sessionId)+'/events',{
      method:'POST',
      headers:authHeaders(true),
      body:JSON.stringify({type,payload,snapshot,occurredAt:new Date().toISOString()})
    });
  }
  async function deleteSession(){
    const s=read();
    if(!s.sessionId||!s.resumeToken)return false;
    await request('/api/v1/sessions/'+encodeURIComponent(s.sessionId),{
      method:'DELETE',headers:authHeaders(false)
    });
    clear();return true;
  }
  async function aiJson(kind,payload){
    return await request('/api/v1/ai/'+kind,{
      method:'POST',headers:authHeaders(true),body:JSON.stringify(payload)
    });
  }
  async function speak(payload){
    const response=await fetch(base()+'/api/v1/ai/tts',{
      method:'POST',headers:authHeaders(true),body:JSON.stringify(payload)
    });
    if(!response.ok){
      let data={};try{data=await response.json()}catch(_){}
      const error=new Error(data?.error||('tts_'+response.status));error.status=response.status;throw error;
    }
    const blob=await response.blob();
    return {audioUrl:URL.createObjectURL(blob),revoke:true};
  }
  async function transcribe(blob){
    const form=new FormData();
    form.append('audio',blob,'future-me.webm');
    form.append('language','zh');
    const response=await fetch(base()+'/api/v1/ai/transcribe',{
      method:'POST',headers:authHeaders(false),body:form
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok){
      const error=new Error(data?.error||('stt_'+response.status));error.status=response.status;throw error;
    }
    return data;
  }

  window.P005_RESEARCH=Object.freeze({
    get configured(){return Boolean(base())},
    get session(){return read()},
    init,
    ensureSession,
    restore,
    event,
    deleteSession,
    chat:(payload)=>aiJson('chat',payload),
    memory:(payload)=>aiJson('memory',payload),
    image:(payload)=>aiJson('image',payload),
    speak,
    transcribe
  });
})();
