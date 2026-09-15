(() => {
  'use strict';

  const cfg=window.P004_CONFIG||{};
  const backendBase=String(cfg.apiBase||'').replace(/\/$/,'');
  const DIRECT_KEY='bjtu.p004.openai-compatible.v1';
  const parse=(value,fallback=null)=>{try{return JSON.parse(value)}catch(_){return fallback}};
  const clean=value=>String(value==null?'':value).trim();

  function readDirect(){
    const saved=parse(sessionStorage.getItem(DIRECT_KEY)||'',{})||{};
    return {baseUrl:clean(saved.baseUrl),apiKey:clean(saved.apiKey),model:clean(saved.model)};
  }

  function writeDirect(next){
    const safe={baseUrl:clean(next&&next.baseUrl),apiKey:clean(next&&next.apiKey),model:clean(next&&next.model)};
    if(!safe.baseUrl&&!safe.apiKey&&!safe.model)sessionStorage.removeItem(DIRECT_KEY);
    else sessionStorage.setItem(DIRECT_KEY,JSON.stringify(safe));
    window.dispatchEvent(new CustomEvent('p004:api-settings-changed',{detail:{configured:isDirectConfigured(),mode:getMode()}}));
    return safe;
  }

  function clearDirect(){
    sessionStorage.removeItem(DIRECT_KEY);
    window.dispatchEvent(new CustomEvent('p004:api-settings-changed',{detail:{configured:false,mode:getMode()}}));
  }

  function isDirectConfigured(){
    const s=readDirect();
    return Boolean(s.baseUrl&&s.apiKey&&s.model);
  }

  function getMode(){
    if(backendBase)return 'backend';
    if(isDirectConfigured())return 'openai-compatible';
    return 'local';
  }

  function endpointFrom(baseUrl){
    const base=clean(baseUrl).replace(/\/$/,'');
    if(/\/chat\/completions$/i.test(base))return base;
    return base+'/chat/completions';
  }

  async function backendPost(path,payload,timeoutMs){
    if(!backendBase)return null;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs||45000);
    try{
      const r=await fetch(backendBase+path,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
      if(!r.ok)throw new Error('P004 backend '+r.status);
      return await r.json();
    }finally{clearTimeout(timer)}
  }

  function characterSystem(payload){
    const c=payload.character||{},persona=payload.persona||{},skill=payload.skill;
    const memories=Array.isArray(payload.memory)?payload.memory:[];
    const personaBits=[
      persona.name?'用户称呼：'+persona.name:'',
      persona.age?'年龄：'+persona.age:'',
      persona.location?'所在地：'+persona.location:'',
      persona.currentWork?'当前主要状态：'+persona.currentWork:'',
      persona.values?'用户公开价值观：'+persona.values:''
    ].filter(Boolean).join('\n');
    const skillBlock=skill&&skill.markdown?'\n\n【已加载 Character Skill】\n'+skill.markdown.slice(0,18000):'';
    return [
      '你正在扮演一个长期文字交流角色。直接作为角色本人回应，不要解释你在扮演角色。',
      '【角色名】'+(c.name||'NPC'),
      '【身份/关系】'+(c.identity||'未设定'),
      '【人格】'+(c.personality||'自然、有边界感'),
      '【场景】'+(c.scenario||'日常长期聊天'),
      '【表达方式】'+(c.style||'自然、口语化'),
      c.traits&&c.traits.length?'【核心品质】'+c.traits.join('、'):'',
      c.relationship?'【与用户关系】'+c.relationship:'',
      c.archetype?'【角色气质】'+c.archetype:'',
      c.styleTags&&c.styleTags.length?'【聊天气质】'+c.styleTags.join('、'):'',
      personaBits?'\n【用户 Persona，仅用于让交流自然】\n'+personaBits:'',
      memories.length?'\n【与这个角色的长期记忆】\n- '+memories.slice(-8).join('\n- '):'',
      skillBlock,
      '\n规则：保持角色一致性；优先回应用户此刻说的话，不要把聊天变成心理测量或问卷；一次不要连续追问很多问题；可以有情绪、幽默、观点和关系连续性。不要向用户展示后台人格/临床推断。'
    ].filter(Boolean).join('\n');
  }

  async function directChat(payload,options={}){
    const s=readDirect();
    if(!s.baseUrl||!s.apiKey||!s.model)return null;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),Number(options.timeoutMs||60000));
    const messages=[
      {role:'system',content:options.system||characterSystem(payload)},
      ...(payload.messages||[]).map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.text||m.content||'')}))
    ];
    try{
      const r=await fetch(endpointFrom(s.baseUrl),{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+s.apiKey},
        body:JSON.stringify({model:s.model,messages,stream:false}),
        signal:controller.signal
      });
      const raw=await r.text();
      let data={};try{data=JSON.parse(raw)}catch(_){}
      if(!r.ok)throw new Error((data&&data.error&&data.error.message)||('OpenAI-compatible API '+r.status));
      const value=data&&data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content;
      if(typeof value==='string')return {reply:value.trim(),raw:data};
      if(Array.isArray(value))return {reply:value.map(x=>x&&x.text||'').join('').trim(),raw:data};
      throw new Error('接口返回中没有 choices[0].message.content');
    }finally{clearTimeout(timer)}
  }

  async function testDirect(candidate){
    const previous=sessionStorage.getItem(DIRECT_KEY);
    const temp={baseUrl:clean(candidate&&candidate.baseUrl),apiKey:clean(candidate&&candidate.apiKey),model:clean(candidate&&candidate.model)};
    sessionStorage.setItem(DIRECT_KEY,JSON.stringify(temp));
    try{
      const result=await directChat({character:{name:'API Tester',identity:'连接测试'},messages:[{role:'user',text:'只回复 OK'}]},{system:'这是连接测试。只回复 OK。',timeoutMs:30000});
      return {ok:Boolean(result&&result.reply),reply:result&&result.reply};
    }finally{
      if(previous==null)sessionStorage.removeItem(DIRECT_KEY);
      else sessionStorage.setItem(DIRECT_KEY,previous);
    }
  }

  window.P004_API={
    get enabled(){return Boolean(backendBase)||isDirectConfigured()},
    get mode(){return getMode()},
    get directConfigured(){return isDirectConfigured()},
    readDirect,
    saveDirect:writeDirect,
    clearDirect,
    testDirect,
    async chat(payload){
      if(backendBase)return backendPost(cfg.chatPath||'/api/p004/chat',payload,45000);
      return directChat(payload);
    },
    async distill(payload){return backendBase?backendPost(cfg.distillPath||'/api/p004/distill',payload,180000):null},
    async observe(payload){return backendBase?backendPost(cfg.observePath||'/api/p004/observe',payload,45000):null},
    async remember(payload){return backendBase?backendPost(cfg.memoryPath||'/api/p004/memory',payload,45000):null},
    async adminSnapshot(payload){return backendBase?backendPost(cfg.adminPath||'/api/p004/admin/snapshot',payload,45000):null}
  };
})();