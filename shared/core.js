(function(global){
  "use strict";

  const PROFILE_KEY="aiques_global_profile_v1";
  const LEGACY_PROFILE_KEYS=["aiques.global.profile.v1"];
  const EVENTS_KEY="aiques_local_events_v1";
  const QUEUE_KEY="aiques_event_queue_v1";
  const CONFIG=global.AIQUES_CONFIG||{};

  function safeParse(raw,fallback){try{return JSON.parse(raw)}catch(e){return fallback}}
  function read(key,fallback){return safeParse(localStorage.getItem(key)||"",fallback)}
  function write(key,value){localStorage.setItem(key,JSON.stringify(value))}
  function randomId(prefix){
    const a=new Uint32Array(3);
    crypto.getRandomValues(a);
    return prefix+"-"+Array.from(a).map(x=>x.toString(36)).join("");
  }
  function now(){return new Date().toISOString()}

  function getProfile(){
    let profile=read(PROFILE_KEY,null);
    if(profile)return profile;
    for(const key of LEGACY_PROFILE_KEYS){
      const legacy=read(key,null);
      if(legacy){
        profile={
          schema_version:1,
          participant_id:legacy.participant_id||legacy.participantId||randomId("P"),
          name:String(legacy.name||"").trim(),
          age:legacy.age==null?null:Number(legacy.age),
          origin:String(legacy.origin||"").trim(),
          location:String(legacy.location||"").trim(),
          currentWork:String(legacy.currentWork||legacy.current_work||"").trim(),
          created_at:legacy.created_at||now(),
          updated_at:now()
        };
        write(PROFILE_KEY,profile);
        return profile;
      }
    }
    return null;
  }
  function saveProfile(input){
    const old=getProfile()||{};
    const profile={
      schema_version:1,
      participant_id:old.participant_id||input.participant_id||randomId("P"),
      name:String(input.name||old.name||"").trim(),
      age:input.age===""||input.age==null?(old.age??null):Number(input.age),
      origin:String(input.origin||old.origin||"").trim(),
      location:String(input.location||old.location||"").trim(),
      currentWork:String(input.currentWork||old.currentWork||"").trim(),
      created_at:old.created_at||now(),
      updated_at:now()
    };
    write(PROFILE_KEY,profile);
    LEGACY_PROFILE_KEYS.forEach(key=>write(key,profile));
    recordEvent("profile_saved",{profile_snapshot:profile},{project_id:"GLOBAL"});
    return profile;
  }
  function clearProfile(){localStorage.removeItem(PROFILE_KEY);LEGACY_PROFILE_KEYS.forEach(key=>localStorage.removeItem(key))}

  function returnUrl(){
    const u=new URL(location.href);
    return u.searchParams.get("return")||"";
  }
  function ensureProfile(opts){
    const profile=getProfile();
    if(profile)return profile;
    const returnTo=(opts&&opts.returnTo)||location.href;
    const portal=(opts&&opts.portalUrl)||"../portal/";
    location.href=portal+"?return="+encodeURIComponent(returnTo);
    return null;
  }

  function startSession(projectId,projectVersion,extra){
    const p=getProfile();
    if(!p)throw new Error("Global participant profile missing");
    const session={
      session_id:randomId("S"),
      participant_id:p.participant_id,
      project_id:projectId,
      project_version:projectVersion||null,
      started_at:now(),
      extra:extra||null
    };
    recordEvent("session_started",session,{project_id:projectId,session_id:session.session_id});
    return session;
  }

  function localEvents(){return read(EVENTS_KEY,[])}
  function queuedEvents(){return read(QUEUE_KEY,[])}

  function persistEvent(event){
    const events=localEvents();
    events.push(event);
    write(EVENTS_KEY,events.slice(-20000));
  }
  function enqueue(event){
    const queue=queuedEvents();
    queue.push(event);
    write(QUEUE_KEY,queue.slice(-5000));
  }

  async function postEvent(event){
    if(!CONFIG.apiBase)return false;
    const base=String(CONFIG.apiBase).replace(/\/$/,"");
    const res=await fetch(base+"/v1/events",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      credentials:"include",
      body:JSON.stringify(event)
    });
    if(!res.ok)throw new Error("sync failed: "+res.status);
    return true;
  }

  async function flush(){
    if(!CONFIG.apiBase || !navigator.onLine)return {sent:0,pending:queuedEvents().length};
    const queue=queuedEvents();
    if(!queue.length)return {sent:0,pending:0};
    const remaining=[];
    let sent=0;
    for(const event of queue){
      try{await postEvent(event);sent++}catch(e){remaining.push(event)}
    }
    write(QUEUE_KEY,remaining);
    return {sent,pending:remaining.length};
  }

  function recordEvent(type,payload,meta){
    const p=getProfile();
    const event={
      schema_version:1,
      event_id:randomId("E"),
      event_type:type,
      occurred_at:now(),
      participant_id:p?p.participant_id:null,
      project_id:(meta&&meta.project_id)||null,
      session_id:(meta&&meta.session_id)||null,
      payload:payload||{}
    };
    persistEvent(event);
    enqueue(event);
    flush().catch(()=>{});
    return event;
  }

  function completeSession(session,payload){
    return recordEvent("session_completed",{
      started_at:session.started_at,
      finished_at:now(),
      project_version:session.project_version,
      result:payload||{}
    },{project_id:session.project_id,session_id:session.session_id});
  }

  async function adminEvents(){
    if(CONFIG.apiBase){
      try{
        const base=String(CONFIG.apiBase).replace(/\/$/,"");
        const res=await fetch(base+"/v1/admin/events",{credentials:"include"});
        if(res.ok){
          const data=await res.json();
          return {mode:"remote",events:Array.isArray(data)?data:(data.events||[])};
        }
      }catch(e){}
    }
    return {mode:"local",events:localEvents()};
  }

  function download(name,text,type){
    const blob=new Blob([text],{type:type||"text/plain"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),500);
  }

  global.AIQ={
    version:"global-0.2.0",
    config:CONFIG,
    getProfile,saveProfile,clearProfile,ensureProfile,returnUrl,
    startSession,recordEvent,completeSession,flush,
    localEvents,queuedEvents,adminEvents,download
  };

  global.addEventListener("online",()=>flush().catch(()=>{}));
})(window);