(() => {
  'use strict';
  const nativeFetch = window.fetch.bind(window);
  const K = {
    participants: 'bjtu.p001.pages.participants.v2',
    events: 'bjtu.p001.pages.events.v2',
    results: 'bjtu.p001.pages.results.v2',
    settings: 'bjtu.p001.pages.settings.v1'
  };
  const defaults = {assignment_mode:'playful',orb_theme:'sunlight',future_horizon_key:'future',future_horizon_label:'未来',future_horizon_months:null,stj_budget:24};
  const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v??fallback}catch{return fallback}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const uuid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const code=()=>`BJTU-${Math.random().toString(36).slice(2,6).toUpperCase()}-${String(Math.floor(1000+Math.random()*9000))}`;
  const json=(obj,status=200)=>Promise.resolve(new Response(JSON.stringify(obj),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}}));
  const body=async(opts)=>{if(!opts?.body)return{};try{return JSON.parse(opts.body)}catch{return{}}};
  const settings=()=>({...defaults,...read(K.settings,{})});
  const participants=()=>read(K.participants,[]);
  const saveParticipants=rows=>write(K.participants,rows);
  const startSession=p=>({participant_id:p.participant_id,public_code:p.public_code,session_id:uuid(),ui_mode:'playful',settings:settings()});
  window.P001_PAGES_MODE=true;
  window.fetch=async(input,opts={})=>{
    const u=new URL(typeof input==='string'?input:input.url,location.href);
    if(!u.pathname.startsWith('/api/'))return nativeFetch(input,opts);
    const b=await body(opts);
    if(u.pathname==='/api/settings')return json(settings());
    if(u.pathname==='/api/health')return json({ok:true,version:'p001-pages-beta5.3'});
    if(u.pathname==='/api/student/register'){
      const rows=participants();
      const alias4=String(b.alias4||'').toUpperCase();
      let p=rows.find(x=>x.alias4===alias4);
      if(!p){
        p={participant_id:uuid(),public_code:code(),alias4,profile:b.profile||{},created_at:Date.now()};
        rows.unshift(p);
      }else{
        p.profile=b.profile||p.profile||{};
        p.updated_at=Date.now();
      }
      saveParticipants(rows);return json(startSession(p),201);
    }
    if(u.pathname==='/api/student/event'){
      const rows=read(K.events,[]);rows.push({...b,saved_at:Date.now()});
      if(rows.length>5000)rows.splice(0,rows.length-5000);write(K.events,rows);return json({ok:true});
    }
    if(u.pathname==='/api/student/finalize'){
      const rows=read(K.results,[]);rows.unshift({...b,completed_at:Date.now()});write(K.results,rows.slice(0,100));return json({ok:true,saved_at:Date.now()});
    }
    return json({error:'static_pages_endpoint_unavailable'},404);
  };
})();