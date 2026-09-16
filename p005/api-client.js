(() => {
  'use strict';

  const DIRECT_KEY='bjtu.p005.openai-compatible.v1';
  const clean=(v)=>String(v==null?'':v).trim();
  const parse=(v,f={})=>{try{return JSON.parse(v)}catch(_){return f}};

  function defaults(){
    return {
      baseUrl:'https://api.openai.com/v1',
      apiKey:'',
      chatModel:'',
      imageModel:'',
      ttsModel:'',
      sttModel:'',
      voice:'marin'
    };
  }

  function readDirect(){
    return Object.assign(defaults(),parse(sessionStorage.getItem(DIRECT_KEY)||'',{}));
  }

  function saveDirect(next){
    const src=Object.assign({},defaults(),next||{});
    const safe={
      baseUrl:clean(src.baseUrl),
      apiKey:clean(src.apiKey),
      chatModel:clean(src.chatModel),
      imageModel:clean(src.imageModel),
      ttsModel:clean(src.ttsModel),
      sttModel:clean(src.sttModel),
      voice:clean(src.voice)||'marin'
    };
    sessionStorage.setItem(DIRECT_KEY,JSON.stringify(safe));
    window.dispatchEvent(new CustomEvent('p005:api-settings-changed',{detail:{configured:isConfigured()}}));
    return safe;
  }

  function clearDirect(){
    sessionStorage.removeItem(DIRECT_KEY);
    window.dispatchEvent(new CustomEvent('p005:api-settings-changed',{detail:{configured:false}}));
  }

  function isConfigured(){
    const s=readDirect();
    return Boolean(s.baseUrl&&s.apiKey&&s.chatModel);
  }

  function endpoint(path,baseOverride){
    const base=clean(baseOverride||readDirect().baseUrl).replace(/\/$/,'');
    if(!base)return '';
    const lower=base.toLowerCase(),target=path.toLowerCase();
    if(lower.endsWith(target))return base;
    if(/\/chat\/completions$/i.test(base)&&path!='/chat/completions'){
      return base.replace(/\/chat\/completions$/i,path);
    }
    return base+path;
  }
  function capabilities(source){
    const s=Object.assign({},readDirect(),source||{});
    return {
      chat:Boolean(clean(s.baseUrl)&&clean(s.apiKey)&&clean(s.chatModel)),
      image:Boolean(clean(s.baseUrl)&&clean(s.apiKey)&&clean(s.imageModel)),
      tts:Boolean(clean(s.baseUrl)&&clean(s.apiKey)&&clean(s.ttsModel)),
      stt:Boolean(clean(s.baseUrl)&&clean(s.apiKey)&&clean(s.sttModel))
    };
  }
  async function fetchWithTimeout(url,options,timeoutMs=30000){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      return await fetch(url,Object.assign({},options,{signal:controller.signal}));
    }finally{clearTimeout(timer)}
  }

  function auth(source){
    const s=Object.assign({},readDirect(),source||{});
    return {'Authorization':'Bearer '+clean(s.apiKey)};
  }

  async function directChat(payload,override){
    const s=Object.assign({},readDirect(),override||{});
    if(!s.baseUrl||!s.apiKey||!s.chatModel)return null;
    const messages=[
      {role:'system',content:String(payload.instruction||'')+'\n\n用户画像（只作为自然对话上下文，不要机械复述）：\n'+JSON.stringify(payload.personaBrief||payload.profile||{})},
      ...(payload.messages||[]).map((m)=>({role:m.role==='future'?'assistant':m.role==='assistant'?'assistant':'user',content:String(m.text||m.content||'')}))
    ];
    if(payload.userMessage&&!messages.some((m,i)=>i===messages.length-1&&m.role==='user'&&m.content===payload.userMessage)){
      messages.push({role:'user',content:String(payload.userMessage)});
    }
    const url=endpoint('/chat/completions',s.baseUrl);
    const r=await fetchWithTimeout(url,{
      method:'POST',
      headers:Object.assign({'Content-Type':'application/json'},auth(s)),
      body:JSON.stringify({model:s.chatModel,messages,stream:false})
    },30000);
    const raw=await r.text();let data={};try{data=JSON.parse(raw)}catch(_){}
    if(!r.ok)throw new Error(data?.error?.message||('Chat API '+r.status));
    const value=data?.choices?.[0]?.message?.content;
    if(typeof value==='string')return {reply:value.trim(),raw:data};
    if(Array.isArray(value))return {reply:value.map((x)=>x?.text||'').join('').trim(),raw:data};
    throw new Error('接口没有返回 choices[0].message.content');
  }

  function dataUrlToBlob(dataUrl){
    const [header,data]=String(dataUrl||'').split(',');
    if(!header||!data)throw new Error('照片格式不正确');
    const mime=(header.match(/data:([^;]+)/)||[])[1]||'image/jpeg';
    const bytes=atob(data),arr=new Uint8Array(bytes.length);
    for(let i=0;i<bytes.length;i++)arr[i]=bytes.charCodeAt(i);
    return new Blob([arr],{type:mime});
  }

  async function directImage(payload){
    const s=readDirect();
    if(!s.baseUrl||!s.apiKey||!s.imageModel||!payload.image)return null;
    const form=new FormData();
    const blob=dataUrlToBlob(payload.image);
    form.append('image',blob,'present-self.jpg');
    form.append('model',s.imageModel);
    form.append('size','1024x1024');
    form.append('prompt',[
      payload.instruction||'Preserve identity and create a natural future-age portrait.',
      'Current age: '+(payload.currentAge||'unknown')+'.',
      'Target age: '+(payload.targetAge||'unknown')+'.',
      'Photorealistic, natural lighting, neutral portrait, preserve the same person and core facial identity.'
    ].join(' '));
    const r=await fetchWithTimeout(endpoint('/images/edits',s.baseUrl),{
      method:'POST',headers:auth(s),body:form
    },60000);
    const raw=await r.text();let data={};try{data=JSON.parse(raw)}catch(_){}
    if(!r.ok)throw new Error(data?.error?.message||('Image API '+r.status));
    const item=data?.data?.[0]||{};
    const imageUrl=item.url||(item.b64_json?'data:image/png;base64,'+item.b64_json:'');
    if(!imageUrl)throw new Error('图像接口没有返回图片');
    return {imageUrl,raw:data};
  }

  async function directSpeak(payload){
    const s=readDirect();
    if(!s.baseUrl||!s.apiKey||!s.ttsModel)return null;
    const r=await fetchWithTimeout(endpoint('/audio/speech',s.baseUrl),{
      method:'POST',
      headers:Object.assign({'Content-Type':'application/json'},auth(s)),
      body:JSON.stringify({
        model:s.ttsModel,
        input:String(payload.text||'').slice(0,4096),
        voice:s.voice||payload.voice||'marin',
        instructions:payload.instructions||'自然、平静、像熟悉自己的真人，不要播音腔。',
        response_format:'mp3'
      })
    },45000);
    if(!r.ok){
      let message='TTS API '+r.status;try{const j=await r.json();message=j?.error?.message||message}catch(_){}
      throw new Error(message);
    }
    const blob=await r.blob();
    return {audioUrl:URL.createObjectURL(blob),revoke:true};
  }

  async function directTranscribe(blob){
    const s=readDirect();
    if(!s.baseUrl||!s.apiKey||!s.sttModel)return null;
    const form=new FormData();
    form.append('file',blob,'future-me.webm');
    form.append('model',s.sttModel);
    form.append('language','zh');
    const r=await fetchWithTimeout(endpoint('/audio/transcriptions',s.baseUrl),{
      method:'POST',headers:auth(s),body:form
    },45000);
    const raw=await r.text();let data={};try{data=JSON.parse(raw)}catch(_){}
    if(!r.ok)throw new Error(data?.error?.message||('STT API '+r.status));
    return {text:String(data.text||'').trim(),raw:data};
  }

  async function testDirect(candidate){
    const temp=Object.assign({},defaults(),candidate||{});
    const result=await directChat({
      instruction:'这是 API 连接测试，只回复 OK。',
      messages:[{role:'user',text:'只回复 OK'}],
      userMessage:'只回复 OK'
    },temp);
    return {ok:Boolean(result&&result.reply),reply:result&&result.reply};
  }

  window.P005_API=Object.freeze({
    get configured(){return isConfigured()},
    capabilities,
    readDirect,
    saveDirect,
    clearDirect,
    testDirect,
    chat:directChat,
    image:directImage,
    speak:directSpeak,
    transcribe:directTranscribe
  });
})();