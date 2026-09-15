(() => {
'use strict';

const STORAGE_KEY = 'bjtu.p005.state.v1';
const LEGACY_KEYS = ['bjtu_p005_future_me_v2', 'aiques_future_me_v1'];
const MODULE_ID = 'P005';
const MODULE_VERSION = '0.2.0';

const SCREENS = ['welcome', 'survey', 'portrait', 'generate', 'ready', 'chat', 'capsule'];
const STEP_NAMES = {
  welcome: '开始',
  survey: '人生故事',
  portrait: '现在的你',
  generate: '生成',
  ready: '未来的你',
  chat: '对话',
  capsule: '之后'
};

const QUESTIONS = [
  { section:'现在的你', key:'name', question:'希望未来的你怎么称呼你？', hint:'用你平时最习惯的称呼。', type:'text', placeholder:'例如：小林', required:true },
  { section:'现在的你', key:'age', question:'你现在几岁？', hint:'Future Me 会以 60 岁为时间锚点。', type:'number', placeholder:'22', required:true },
  { section:'现在的你', key:'pronouns', question:'你希望未来的自己怎样称呼你？', hint:'可选。用于让未来自我的叙述更自然。', type:'text', placeholder:'例如：TA / 她 / 他' },
  { section:'现在的你', key:'location', question:'你现在生活在哪里？', hint:'城市或一个你认同的地方都可以。', type:'text', placeholder:'例如：北京' },
  { section:'现在的你', key:'currentWork', question:'现在，什么占据了你大部分时间？', hint:'学习、工作、研究、照顾家人，或者一段过渡期。', type:'textarea', placeholder:'说几句你现在的生活状态……' },

  { section:'人生故事', key:'people', question:'现在对你最重要的人是谁？', hint:'他们为什么重要？你们的关系是什么样？', type:'textarea', placeholder:'家人、伴侣、朋友、老师……' },
  { section:'人生故事', key:'proud', question:'哪一个时刻，让你真正为自己骄傲？', hint:'不需要宏大。一个只有你知道意义的时刻也可以。', type:'textarea', placeholder:'那天发生了什么？' },
  { section:'人生故事', key:'lowPoint', question:'你经历过的一段低谷是什么？', hint:'只写你愿意写的部分。', type:'textarea', placeholder:'最难的是什么？它后来怎样影响了你？' },
  { section:'人生故事', key:'turningPoint', question:'哪件事明显改变了你的方向？', hint:'一次选择、一个人、一场失败或偶然都可以。', type:'textarea', placeholder:'从那之后，什么不一样了？' },
  { section:'人生故事', key:'challenge', question:'现在最想跨过去的难题是什么？', hint:'Future Me 会把它当作未来记忆中的一个重要张力。', type:'textarea', placeholder:'例如：害怕失败、职业选择、关系边界……' },

  { section:'未来的你', key:'lifeProject', question:'如果有一件事值得投入很多年，会是什么？', hint:'事业、研究、家庭、创作、公益或一种生活方式。', type:'textarea', placeholder:'我希望长期投入……' },
  { section:'未来的你', key:'career', question:'到 60 岁时，你希望自己做过什么？', hint:'想象职业和成就，但不要只写职位。', type:'textarea', placeholder:'我希望曾经……' },
  { section:'未来的你', key:'finance', question:'那时，怎样的财务状态会让你觉得足够？', hint:'不是数字比赛。可以写安全感、自由度或责任。', type:'textarea', placeholder:'我希望钱能让我……' },
  { section:'未来的你', key:'family', question:'那时，你希望亲密关系和家庭是什么样？', hint:'没有标准答案，也可以选择独居或非传统家庭。', type:'textarea', placeholder:'我希望身边……' },
  { section:'未来的你', key:'futureLocation', question:'60 岁时，你想在哪里生活？', hint:'写地点，也可以写一种环境。', type:'textarea', placeholder:'也许在……' },
  { section:'未来的你', key:'dailyLife', question:'想象那时一个很普通的星期二。', hint:'你几点起床？做什么？和谁吃饭？什么让一天值得？', type:'textarea', placeholder:'早上我会……' },
  { section:'未来的你', key:'values', question:'无论未来怎么变，什么最好不要丢？', hint:'这是 Future Me 最重要的连续性线索。', type:'textarea', placeholder:'好奇、自由、关系、创造、诚实……' },
  { section:'可能的分岔', key:'decision', question:'有一个你现在拿不准的 A / B 决定吗？', hint:'可选。当前 Future You 也在探索“两个可能未来”的决策路径。', type:'decision' }
];

const state = {
  screen:'welcome',
  surveyIndex:0,
  profile:{},
  memory:null,
  messages:[],
  currentPortrait:'',
  futurePortrait:'',
  capsules:[],
  generated:false,
  settings:{ voiceMode:false, unlockMonths:12 }
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function parseJson(value){ try{return JSON.parse(value)}catch(_){return null} }
function clean(value,fallback=''){ const text=String(value||'').trim(); return text||fallback }
function firstClause(value,fallback=''){
  const source=clean(value,fallback).split(/[。！？.!?\n]/)[0];
  return source.length>62 ? source.slice(0,62)+'…' : source;
}
function escapeHtml(value){
  return String(value==null?'':value)
    .replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))
    .replace(/\n/g,'<br>');
}
function hash(value){
  let h=2166136261;
  for(const ch of String(value||'')){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619) }
  return h>>>0;
}
function pick(list,seed){ return list[hash(seed)%list.length] }

function apiConfig(name){
  const config=window.P005_FUTURE_ME_CONFIG||{};
  const direct={
    chatApi:window.FUTURE_ME_API,
    memoryApi:window.FUTURE_ME_MEMORY_API,
    imageApi:window.FUTURE_ME_IMAGE_API,
    voiceApi:window.FUTURE_ME_VOICE_API,
    adminApi:window.P00_ADMIN_API
  };
  return direct[name]||config[name]||'';
}

function showToast(message){
  const toast=$('#toast');
  if(!toast)return;
  toast.textContent=message;
  toast.classList.add('show');
  clearTimeout(window.__p005ToastTimer);
  window.__p005ToastTimer=setTimeout(()=>toast.classList.remove('show'),1800);
}

function sharedProfile(){
  if(window.BJTU_PROFILE&&typeof window.BJTU_PROFILE.getFlat==='function')return window.BJTU_PROFILE.getFlat();
  return (window.P00_CONTEXT&&window.P00_CONTEXT.profile)||{};
}
function mapSharedIntoProfile(shared){
  const allowed=['name','age','origin','location','currentWork','values'];
  for(const key of allowed){
    if(!state.profile[key]&&shared&&shared[key])state.profile[key]=shared[key];
  }
}
function writeSharedProfile(){
  if(!window.BJTU_PROFILE||typeof window.BJTU_PROFILE.update!=='function')return;
  window.BJTU_PROFILE.update({
    name:state.profile.name||'',
    age:state.profile.age||'',
    origin:state.profile.origin||'',
    location:state.profile.location||'',
    currentWork:state.profile.currentWork||'',
    values:state.profile.values||''
  },MODULE_ID);
}

function normalizedScreen(name){
  if(['identity','present','future'].includes(name))return 'survey';
  if(name==='generate')return state.memory?'ready':'survey';
  return SCREENS.includes(name)?name:'welcome';
}

function snapshot(includeMedia=false){
  const data={
    module:MODULE_ID,
    version:MODULE_VERSION,
    profile:state.profile,
    syntheticMemory:state.memory,
    messages:state.messages,
    capsules:state.capsules,
    settings:state.settings,
    screen:state.screen,
    surveyIndex:state.surveyIndex,
    media:{hasCurrentPortrait:Boolean(state.currentPortrait),hasFuturePortrait:Boolean(state.futurePortrait)},
    exportedAt:new Date().toISOString()
  };
  if(includeMedia){
    data.media.currentPortrait=state.currentPortrait||'';
    data.media.futurePortrait=state.futurePortrait||'';
  }
  return data;
}
function emitSessionEvent(type,payload={}){
  try{
    window.dispatchEvent(new CustomEvent('p00:session',{detail:{module:MODULE_ID,type,payload,snapshot:snapshot(false)}}));
  }catch(_){}
}
async function syncAdmin(type){
  const endpoint=apiConfig('adminApi');
  if(!endpoint)return;
  try{
    await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      module:MODULE_ID,version:MODULE_VERSION,event:type,occurredAt:new Date().toISOString(),data:snapshot(false)
    })});
  }catch(error){console.warn('P005 admin sync unavailable',error)}
}

function save(){
  try{
    localStorage.setItem(STORAGE_KEY,JSON.stringify({
      profile:state.profile,
      memory:state.memory,
      messages:state.messages,
      currentPortrait:state.currentPortrait,
      futurePortrait:state.futurePortrait,
      capsules:state.capsules,
      settings:state.settings,
      screen:state.screen,
      surveyIndex:state.surveyIndex
    }));
    writeSharedProfile();
  }catch(error){console.warn('P005 local save failed',error)}
}
function migrateLegacy(){
  if(localStorage.getItem(STORAGE_KEY))return;
  for(const key of LEGACY_KEYS){
    const legacy=parseJson(localStorage.getItem(key)||'');
    if(!legacy)continue;
    const migrated={
      profile:legacy.profile||{},
      memory:legacy.memory||null,
      messages:legacy.messages||[],
      currentPortrait:legacy.currentPortrait||'',
      futurePortrait:legacy.futurePortrait||'',
      capsules:legacy.capsules||[],
      settings:Object.assign({},state.settings,legacy.settings||{}),
      screen:normalizedScreen(legacy.screen),
      surveyIndex:0
    };
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(migrated))}catch(_){}
    break;
  }
}

function load(){
  migrateLegacy();
  const saved=parseJson(localStorage.getItem(STORAGE_KEY)||'');
  if(saved){
    state.profile=saved.profile||{};
    state.memory=saved.memory||null;
    state.messages=saved.messages||[];
    state.currentPortrait=saved.currentPortrait||'';
    state.futurePortrait=saved.futurePortrait||'';
    state.capsules=saved.capsules||[];
    state.settings=Object.assign({},state.settings,saved.settings||{});
    state.screen=normalizedScreen(saved.screen);
    state.surveyIndex=Math.max(0,Math.min(QUESTIONS.length-1,Number(saved.surveyIndex)||0));
    state.generated=Boolean(state.memory);
  }
  mapSharedIntoProfile(sharedProfile());
  restorePortraits();
  renderSurvey();
  updateVoiceUI();
  renderCapsules();
  setUnlockMonths(state.settings.unlockMonths||12,false);
  const hasProgress=Boolean(saved&&(Object.keys(state.profile).length||state.memory||state.messages.length||state.currentPortrait||state.capsules.length));
  if($('#resumeBtn'))$('#resumeBtn').classList.toggle('hidden',!hasProgress);
  if($('#generateAgeNow'))$('#generateAgeNow').textContent=state.profile.age?state.profile.age:'现在';
}

function updateProgress(){
  const label=$('#stepLabel');
  const fill=$('#progressFill');
  if(label)label.textContent=STEP_NAMES[state.screen]||'';
  let ratio=SCREENS.indexOf(state.screen)/(SCREENS.length-1);
  if(state.screen==='survey')ratio=.06+.35*((state.surveyIndex+1)/QUESTIONS.length);
  if(fill)fill.style.width=Math.round(Math.max(0,Math.min(1,ratio))*100)+'%';
}

function show(name){
  state.screen=normalizedScreen(name);
  $$('.screen').forEach((node)=>node.classList.remove('active'));
  const target=$('#screen-'+state.screen);
  if(target)target.classList.add('active');
  if(state.screen==='survey')renderSurvey();
  if(state.screen==='portrait')restorePortraits();
  if(state.screen==='generate')generateSequence();
  if(state.screen==='ready')renderReady();
  if(state.screen==='chat')startChat();
  if(state.screen==='capsule'){renderLetter();renderCapsules()}
  updateProgress();
  save();
  emitSessionEvent('screen_view',{screen:state.screen});
  window.scrollTo({top:0,behavior:'smooth'});
}

$$('[data-next]').forEach((button)=>button.addEventListener('click',()=>show(button.dataset.next)));
$$('[data-prev]').forEach((button)=>button.addEventListener('click',()=>show(button.dataset.prev)));

function renderSurvey(){
  const q=QUESTIONS[state.surveyIndex];
  if(!q)return;
  $('#surveySection').textContent=q.section;
  $('#surveyCount').textContent=(state.surveyIndex+1)+' / '+QUESTIONS.length;
  $('#surveyQuestion').textContent=q.question;
  $('#surveyHint').textContent=q.hint||'';

  const root=$('#surveyInput');
  if(q.type==='decision'){
    root.innerHTML=
      '<div class="decision-inputs">'+
      '<label><span>我正在决定</span><input id="decisionMain" placeholder="例如：继续读博，还是去工作"></label>'+
      '<div class="decision-options">'+
      '<label><span>Option A</span><input id="decisionA" placeholder="继续读博"></label>'+
      '<label><span>Option B</span><input id="decisionB" placeholder="去工作"></label>'+
      '</div></div>';
    $('#decisionMain').value=state.profile.decision||'';
    $('#decisionA').value=state.profile.optionA||'';
    $('#decisionB').value=state.profile.optionB||'';
    setTimeout(()=>$('#decisionMain').focus(),60);
  }else{
    const tag=q.type==='textarea'?'textarea':'input';
    const type=q.type==='number'?'number':'text';
    root.innerHTML=tag==='textarea'
      ? '<textarea id="surveyField" rows="4" placeholder="'+escapeHtml(q.placeholder||'')+'"></textarea>'
      : '<input id="surveyField" type="'+type+'" '+(q.type==='number'?'min="16" max="100" inputmode="numeric"':'')+' placeholder="'+escapeHtml(q.placeholder||'')+'">';
    $('#surveyField').value=state.profile[q.key]||'';
    setTimeout(()=>$('#surveyField').focus(),60);
  }
  $('#surveyBackBtn').textContent=state.surveyIndex===0?'返回首页':'上一题';
  $('#surveyNextBtn').textContent=state.surveyIndex===QUESTIONS.length-1?'继续':'下一题';
  updateProgress();
}

function captureSurvey(){
  const q=QUESTIONS[state.surveyIndex];
  if(!q)return true;
  if(q.type==='decision'){
    state.profile.decision=clean($('#decisionMain').value,'');
    state.profile.optionA=clean($('#decisionA').value,'');
    state.profile.optionB=clean($('#decisionB').value,'');
    save();
    return true;
  }
  const field=$('#surveyField');
  const value=clean(field.value,'');
  if(q.required&&!value){
    field.focus();
    showToast('先回答这一题');
    return false;
  }
  if(q.key==='age'){
    const age=Number(value);
    if(!Number.isFinite(age)||age<16||age>100){
      showToast('请输入 16–100 之间的年龄');
      field.focus();
      return false;
    }
  }
  state.profile[q.key]=value;
  save();
  return true;
}
$('#surveyNextBtn').addEventListener('click',()=>{
  if(!captureSurvey())return;
  if(state.surveyIndex>=QUESTIONS.length-1){show('portrait');return}
  state.surveyIndex+=1;
  renderSurvey();
});
$('#surveyBackBtn').addEventListener('click',()=>{
  captureSurvey();
  if(state.surveyIndex===0){show('welcome');return}
  state.surveyIndex-=1;
  renderSurvey();
});
$('#surveyInput').addEventListener('keydown',(event)=>{
  if(event.key==='Enter'&&!event.shiftKey&&event.target.tagName==='INPUT'&&state.surveyIndex<QUESTIONS.length-1){
    event.preventDefault();
    $('#surveyNextBtn').click();
  }
});

$('#resumeBtn').addEventListener('click',()=>{
  const destination=state.memory?(state.messages.length?'chat':'ready'):(Object.keys(state.profile).length?'survey':'welcome');
  show(destination);
});
$('#resetBtn').addEventListener('click',()=>{
  if(!confirm('清空 P005 在此浏览器中的回答、照片、对话和时间胶囊？'))return;
  localStorage.removeItem(STORAGE_KEY);
  LEGACY_KEYS.forEach((key)=>localStorage.removeItem(key));
  location.reload();
});
$('#exportBtn').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(snapshot(true),null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='P005-Future-Me-'+new Date().toISOString().slice(0,10)+'.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),600);
  emitSessionEvent('export',{});
  showToast('已导出');
});

async function compressImage(file){
  const dataUrl=await new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);
  });
  const image=await new Promise((resolve,reject)=>{
    const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=dataUrl;
  });
  const maxSide=1024,scale=Math.min(1,maxSide/Math.max(image.width,image.height));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
  canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/jpeg',.82);
}
function restorePortraits(){
  const frame=$('#currentPortraitFrame'),img=$('#currentPortraitImg');
  if(frame&&img){
    frame.classList.toggle('has-image',Boolean(state.currentPortrait));
    if(state.currentPortrait)img.src=state.currentPortrait; else img.removeAttribute('src');
  }
  const presentMonogram=$('#presentMonogram');
  if(presentMonogram)presentMonogram.textContent=(clean(state.profile.name,'你').charAt(0)||'你').toUpperCase();
  renderFuturePortrait();
}
$('#portraitUploadBtn').addEventListener('click',()=>$('#portraitInput').click());
$('#portraitInput').addEventListener('change',async(event)=>{
  const file=event.target.files&&event.target.files[0];
  if(!file)return;
  if(!file.type.startsWith('image/')){showToast('请选择图片');return}
  if(file.size>12*1024*1024){showToast('请选择 12MB 以下图片');return}
  try{
    state.currentPortrait=await compressImage(file);
    state.futurePortrait='';
    restorePortraits();
    save();
    emitSessionEvent('portrait_added',{});
  }catch(error){console.error(error);showToast('照片读取失败')}
});

function buildMemory(){
  const p=state.profile;
  const age=Number(p.age)||22;
  const values=firstClause(p.values,'好奇、关系与自主');
  const people=firstClause(p.people,'重要的人');
  const career=firstClause(p.career,'找到一种更适合自己的工作方式');
  const project=firstClause(p.lifeProject,'持续投入一件真正重要的长期事情');
  const challenge=firstClause(p.challenge,'学会在不确定里继续行动');
  const low=firstClause(p.lowPoint,'一段并不轻松的时期');
  const turning=firstClause(p.turningPoint,'一个改变方向的时刻');
  const futureLocation=firstClause(p.futureLocation,p.location||'一个让自己安稳的地方');
  const daily=firstClause(p.dailyLife,'有工作，也有留给生活和关系的时间');
  const family=firstClause(p.family,'和重要的人保持真实而稳定的关系');

  const memories=[
    '有一年，我突然发现“'+project+'”已经不再只是一个计划。最有满足感的不是结果，而是终于看见长期积累开始有自己的形状。',
    '我也经历过“'+challenge+'”反复回来。后来真正帮到我的，是把它变成能重复的小动作，而不是等自己彻底不害怕。',
    '最大的意外，是很多当年以为会决定一生的事后来只是路口；反而是“'+values+'”和与'+people+'的关系，慢慢决定了生活长成什么样。'
  ];

  const timeline=[
    {age,tag:'现在',text:'你带着“'+values+'”出发，也已经经历过'+low+'和'+turning+'。'},
    {age:Math.min(60,age+Math.max(4,Math.round((60-age)*.3))),tag:'变化',text:'你开始围绕“'+project+'”积累作品、能力和关系，职业方向逐渐靠近“'+career+'”。'},
    {age:60,tag:'Future Me',text:'你生活在'+futureLocation+'。普通的一天是：'+daily+'。关系上，你希望'+family+'。'}
  ];

  let branch=null;
  if(clean(p.decision)&&clean(p.optionA)&&clean(p.optionB)){
    branch={
      decision:firstClause(p.decision),
      a:{label:firstClause(p.optionA),text:'这条路可能更早带来某种确定性；真正要观察的是，它是否仍给“'+values+'”留下空间。'},
      b:{label:firstClause(p.optionB),text:'这条路可能带来更多未知；真正要观察的是，它是否让你获得更真实的新信息。'}
    };
  }

  return {
    summary:'这是 '+clean(p.name,'你')+' 从 '+age+' 岁走向 60 岁的一种可能版本。它围绕“'+project+'”、'+career+'，以及你不想丢掉的“'+values+'”展开。',
    futureVignette:'60 岁的你住在'+futureLocation+'。生活没有完全按计划发生，但“'+values+'”仍然能在日常里被看见。',
    memories,
    timeline,
    branch,
    voiceAnchors:{values,people,career,project,challenge}
  };
}

async function generateMemory(){
  const endpoint=apiConfig('memoryApi');
  if(!endpoint)return buildMemory();
  try{
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      module:MODULE_ID,profile:state.profile,targetAge:60,
      instruction:'Create one plausible future memory, not a prediction. Return JSON with summary, futureVignette, memories[3], timeline, and optional branch. Include expected and unexpected outcomes, rewarding moments, challenges, and continuity with present values.'
    })});
    if(!response.ok)throw new Error('memory api '+response.status);
    const result=await response.json();
    if(result&&result.summary)return result;
  }catch(error){console.warn('Future memory API unavailable; using local fallback',error)}
  return buildMemory();
}

async function requestFuturePortrait(){
  const endpoint=apiConfig('imageApi');
  if(!endpoint||!state.currentPortrait)return false;
  try{
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      image:state.currentPortrait,currentAge:Number(state.profile.age)||null,targetAge:60,
      instruction:'Preserve identity. Create a respectful photorealistic portrait at approximately age 60. Natural aging only; do not alter race, gender presentation, or core facial identity.'
    })});
    if(!response.ok)throw new Error('image api '+response.status);
    const result=await response.json();
    const imageValue=result.imageUrl||result.url||(result.imageBase64?'data:image/png;base64,'+result.imageBase64:'');
    if(!imageValue)throw new Error('missing image result');
    state.futurePortrait=imageValue;
    save();
    emitSessionEvent('future_portrait_generated',{});
    syncAdmin('future_portrait_generated');
    return true;
  }catch(error){console.warn('Future portrait unavailable',error);return false}
}

let generationToken=0;
async function generateSequence(){
  const token=++generationToken;
  $('#meetBtn').classList.add('hidden');
  $('#memoryStream').innerHTML='';
  $('#generateTitle').textContent='正在连接你的人生线索。';
  $('#generateSub').textContent='把过去、目标与可能经历组织成一段连续的 future memory。';
  $('#generateAgeNow').textContent=clean(state.profile.age,'现在');

  const lines=['读取现在的你','连接高点、低谷与转折','延伸目标与价值','生成未来记忆'];
  lines.forEach((text,i)=>setTimeout(()=>{
    if(token!==generationToken||state.screen!=='generate')return;
    const line=document.createElement('div');line.className='memory-line';line.textContent=text;$('#memoryStream').appendChild(line);
  },i*260));

  const portraitPromise=requestFuturePortrait();
  state.memory=await generateMemory();
  state.generated=true;
  save();
  await portraitPromise;

  setTimeout(()=>{
    if(token!==generationToken||state.screen!=='generate')return;
    $('#generateTitle').textContent='Future Me 已经准备好了。';
    $('#generateSub').textContent='它不是你的真实未来，只是一个足够具体、可以与之对话的可能版本。';
    $('#meetBtn').classList.remove('hidden');
    emitSessionEvent('future_generated',{hasBranch:Boolean(state.memory&&state.memory.branch)});
    syncAdmin('future_generated');
  },1150);
}
$('#meetBtn').addEventListener('click',()=>show('ready'));

function renderFuturePortrait(){
  const frame=$('#futurePortrait'),image=$('#futurePortraitImg'),mono=$('#futureMonogram'),status=$('#portraitStatus');
  if(!frame||!image||!mono||!status)return;
  mono.textContent=(clean(state.profile.name,'F').charAt(0)||'F').toUpperCase();
  if(state.futurePortrait){
    frame.classList.add('has-image');image.src=state.futurePortrait;status.textContent='可能的 60 岁头像';
  }else{
    frame.classList.remove('has-image');image.removeAttribute('src');
    status.textContent=state.currentPortrait?'未连接年龄化结果':'未上传照片';
  }
}

function renderReady(){
  if(!state.memory)state.memory=buildMemory();
  $('#futureName').textContent=clean(state.profile.name,'你');
  $('#futureMonogram').textContent=(clean(state.profile.name,'F').charAt(0)||'F').toUpperCase();
  $('#chatAvatar').textContent=(clean(state.profile.name,'F').charAt(0)||'F').toUpperCase();
  $('#chatName').textContent=clean(state.profile.name,'Future Me')+' · 60';
  $('#futureIntro').textContent=state.memory.futureVignette||'一个由你现在的故事延伸出来的可能版本。';
  renderFuturePortrait();

  const memories=Array.isArray(state.memory.memories)&&state.memory.memories.length
    ? state.memory.memories.slice(0,3)
    : (state.memory.timeline||[]).slice(1).map((x)=>x.text);

  $('#memorySummary').innerHTML=
    '<p class="future-summary">'+escapeHtml(state.memory.summary||'')+'</p>'+
    '<div class="memory-glimpse">'+memories.map((x)=>'<p>'+escapeHtml(x)+'</p>').join('')+'</div>';

  if(state.memory.branch){
    $('#branchPreview').innerHTML=
      '<div class="branch-card"><h3>'+escapeHtml(state.memory.branch.decision)+'</h3><div class="branch-options">'+
      '<div class="branch-option"><small>A · '+escapeHtml(state.memory.branch.a.label)+'</small><p>'+escapeHtml(state.memory.branch.a.text)+'</p></div>'+
      '<div class="branch-option"><small>B · '+escapeHtml(state.memory.branch.b.label)+'</small><p>'+escapeHtml(state.memory.branch.b.text)+'</p></div>'+
      '</div></div>';
  }else $('#branchPreview').innerHTML='';
  save();
}

$('#agePortraitBtn').addEventListener('click',async()=>{
  if(!state.currentPortrait){showToast('先加入一张现在的照片');show('portrait');return}
  if(!apiConfig('imageApi')){showToast('尚未连接年龄化图像 API');return}
  const button=$('#agePortraitBtn'),old=button.textContent;
  button.disabled=true;button.textContent='生成中…';
  const ok=await requestFuturePortrait();
  renderFuturePortrait();
  button.disabled=false;button.textContent=old;
  showToast(ok?'未来头像已更新':'生成失败');
});

function ensureGreeting(){
  if(state.messages.length)return;
  const p=state.profile,m=state.memory||buildMemory(),a=m.voiceAnchors||{};
  state.messages.push({
    role:'future',
    text:'嗨，'+clean(p.name,'年轻的我')+'。我是一个 60 岁的你——先说清楚，这只是可能的未来，人生完全可能走成别的样子。'
  });
  state.messages.push({
    role:'future',
    text:'我像你这么大时，也在想“'+firstClause(p.career,'以后到底会成为什么样的人')+'”。后来有些事情按预期发生，也有很多没有。真正留下来的，是我一直没舍得丢掉“'+firstClause(p.values,'真正重要的东西')+'”。'
  });
  state.messages.push({
    role:'future',
    text:'你知道吗，回头看这几十年，我最珍惜的往往不是某个头衔，而是'+firstClause(p.people,'重要的人')+'和那些慢慢长出来的日常。你现在最想问我什么？'
  });
  save();
}

function renderMessages(){
  const box=$('#messages');
  box.innerHTML=state.messages.map((message)=>{
    const role=message.role==='future'?'future':'user';
    return '<div class="message '+role+'"><span class="meta">'+(role==='future'?'Future Me · 60':'现在的我')+'</span>'+escapeHtml(message.text)+'</div>';
  }).join('');
  box.scrollTop=box.scrollHeight;
  const exchanged=state.messages.filter((m)=>m.text!=='…').length;
  $('#finishChatBtn').classList.toggle('hidden',exchanged<16);
  if(exchanged>3)$('#promptChips').classList.add('hidden');
}

function startChat(){ensureGreeting();renderMessages();updateVoiceUI();updateChatModeNote()}

function localFutureReply(input){
  const p=state.profile,m=state.memory||buildMemory(),a=m.voiceAnchors||{};
  const values=a.values||firstClause(p.values,'真正重要的东西');
  const project=a.project||firstClause(p.lifeProject,'长期投入的事情');
  const challenge=a.challenge||firstClause(p.challenge,'眼前这个难题');
  const q=input.toLowerCase();

  const groups={
    happy:[
      '并不是一直开心。到 60 岁以后，我更在意的不是“幸福有没有到达”，而是生活有没有长期偏离“'+values+'”。',
      '有快乐，也有很普通甚至很难的几年。真正稳定下来的，是我终于不再要求每个阶段都证明自己走对了。'
    ],
    career:[
      '当年我把职业看得像一道单选题。后来才知道它更像连续实验。围绕“'+project+'”积累下来的能力和关系，比某个职位更能带走。',
      '“'+firstClause(p.career,'想做的事')+'”最后没有完全照剧本发生，但它一直像一根线，帮我判断哪些机会值得投入。'
    ],
    people:[
      '我最想提醒你的，是别总等“忙完这一阵”再联系重要的人。后来真正留下来的关系，都是一次次很具体的出现。',
      '关系没有自动变好。它们是被时间、道歉、边界和反复回来慢慢做出来的。'
    ],
    regret:[
      '当然有遗憾。但大多数遗憾后来都变成信息，不再是判决。真正难受的通常不是“选错”，而是当时没有诚实面对自己在意什么。',
      '我没有得到一条零后悔的人生。好消息是，人可以在错误之后继续成为别的人。'
    ],
    fear:[
      '我记得这种不确定。焦虑常常在要求你提前拿到未来的保证，但未来很少给这种保证。你能做的是让下一步更小、更真实、更可撤回。',
      '关于“'+challenge+'”，真正的变化不是某天突然不怕了，而是害怕时仍然能完成一个足够小的动作。'
    ],
    decision:[
      m.branch
        ? '关于“'+m.branch.decision+'”，我不会假装从 60 岁知道 A 或 B 哪个一定更好。更值得比较的是：哪条路更接近“'+values+'”，哪条路能更快带回真实反馈，以及哪种代价是你愿意承担的。'
        : '如果你卡在一个选择里，我会问三个问题：我真正重视什么？哪种代价我愿意承担？哪个下一步能让我获得更多真实信息？'
    ],
    surprise:[
      '最大的意外是：很多当年觉得会决定一生的事，后来只是路口；一些很小的习惯和关系，反而慢慢复利成了人生。',
      '未来最常见的不是戏剧性反转，而是一些当时不起眼的选择，几年后突然显出差异。'
    ],
    default:[
      '当我把这个问题从 60 岁往回看，我不会先问“正确答案是什么”，而会先问：它和“'+values+'”有什么关系？',
      '我能给你的不是答案，而是一点时间距离。很多问题放到几十年的尺度里，会从“必须马上选对”变成“先做一次真实尝试”。'
    ]
  };

  let key='default';
  if(/开心|幸福|快乐|happy/.test(q))key='happy';
  else if(/工作|职业|事业|career|学习|专业/.test(q))key='career';
  else if(/家人|家庭|朋友|伴侣|关系|父母/.test(q))key='people';
  else if(/后悔|遗憾|regret/.test(q))key='regret';
  else if(/焦虑|害怕|担心|恐惧|压力/.test(q))key='fear';
  else if(/选择|决定|纠结|option|选哪/.test(q))key='decision';
  else if(/意外|惊讶|没想到|unexpected/.test(q))key='surprise';

  const reply=pick(groups[key],input+JSON.stringify(p));
  const tail=pick([
    '如果把它拉回今天，你最想先弄清哪一小部分？',
    '你为什么会在现在这个时候问我这件事？',
    '如果明天只能试一个很小的动作，你会选什么？',
    '这件事里，哪一种代价是你最不愿意承受的？'
  ],input+'tail');
  return reply+'\n\n'+tail;
}

async function getFutureReply(input){
  const endpoint=apiConfig('chatApi');
  if(endpoint){
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        module:MODULE_ID,
        profile:state.profile,
        syntheticMemory:state.memory,
        messages:state.messages.filter((item)=>item.text!=='…'),
        userMessage:input,
        instruction:'Act as one plausible 60-year-old future self grounded in the supplied life story and future memory. Speak autobiographically using continuity cues such as "when I was your age" when natural. Include expected and unexpected outcomes. Be a reflective mirror rather than a counselor. Ask thoughtful follow-up questions. Never claim certainty, prophecy, diagnosis, therapy, or that this future has actually happened.'
      })});
      if(response.ok){
        const result=await response.json();
        if(result.reply)return String(result.reply);
      }
    }catch(error){console.warn('Future Me chat API unavailable; using local fallback',error)}
  }
  await new Promise((resolve)=>setTimeout(resolve,260));
  return localFutureReply(input);
}

$('#chatForm').addEventListener('submit',async(event)=>{
  event.preventDefault();
  const input=$('#chatInput'),text=input.value.trim();
  if(!text)return;
  state.messages.push({role:'user',text});input.value='';renderMessages();
  const pending={role:'future',text:'…'};state.messages.push(pending);renderMessages();
  const reply=await getFutureReply(text);
  pending.text=reply;save();renderMessages();
  emitSessionEvent('chat_turn',{userMessage:text,replyLength:reply.length});syncAdmin('chat_turn');
  if(state.settings.voiceMode)speakText(reply);
});
$$('#promptChips button').forEach((button)=>button.addEventListener('click',()=>{
  $('#chatInput').value=button.textContent;$('#chatForm').requestSubmit();
}));
$('#finishChatBtn').addEventListener('click',()=>show('capsule'));

async function speakText(text){
  if(!text)return;
  const endpoint=apiConfig('voiceApi');
  if(endpoint){
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        text,voice:'future-self',language:'zh-CN',profile:{name:state.profile.name||'',targetAge:60}
      })});
      if(response.ok){
        const result=await response.json(),url=result.audioUrl||result.url||'';
        if(url){await new Audio(url).play();return}
      }
    }catch(error){console.warn('Future voice API unavailable; using browser speech',error)}
  }
  if(!('speechSynthesis' in window)){showToast('当前浏览器不支持朗读');return}
  speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang='zh-CN';utterance.rate=.96;utterance.pitch=.92;
  const voice=speechSynthesis.getVoices().find((v)=>/zh|Chinese|Mandarin/i.test(v.lang+' '+v.name));
  if(voice)utterance.voice=voice;
  speechSynthesis.speak(utterance);
}

function updateVoiceUI(){
  const active=Boolean(state.settings.voiceMode);
  $('#voiceModeBtn').textContent=active?'关闭语音':'语音';
  const stateNode=$('#voiceState');
  if(stateNode){
    stateNode.classList.toggle('hidden',!active);
    const label=stateNode.querySelector('span');if(label)label.textContent=active?'语音模式':'文字模式';
  }
  updateChatModeNote();
}
$('#voiceModeBtn').addEventListener('click',()=>{
  state.settings.voiceMode=!state.settings.voiceMode;updateVoiceUI();save();
  showToast(state.settings.voiceMode?'已开启自动朗读':'已关闭语音模式');
});
$('#speakLastBtn').addEventListener('click',()=>{
  const last=state.messages.filter((x)=>x.role==='future'&&x.text!=='…').slice(-1)[0];
  if(last)speakText(last.text);
});

let recognition=null,recognitionActive=false;
function ensureRecognition(){
  if(recognition)return recognition;
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition)return null;
  recognition=new Recognition();recognition.lang='zh-CN';recognition.interimResults=true;recognition.continuous=false;
  recognition.onstart=()=>{recognitionActive=true;$('#micBtn').classList.add('listening');$('#voiceListening').classList.remove('hidden')};
  recognition.onresult=(event)=>{
    let transcript='',final=false;
    for(let i=event.resultIndex;i<event.results.length;i++){transcript+=event.results[i][0].transcript;if(event.results[i].isFinal)final=true}
    $('#chatInput').value=transcript;
    if(final&&state.settings.voiceMode&&transcript.trim())setTimeout(()=>$('#chatForm').requestSubmit(),120);
  };
  recognition.onerror=()=>showToast('语音识别失败，可以继续打字');
  recognition.onend=()=>{recognitionActive=false;$('#micBtn').classList.remove('listening');$('#voiceListening').classList.add('hidden')};
  return recognition;
}
$('#micBtn').addEventListener('click',()=>{
  const engine=ensureRecognition();
  if(!engine){showToast('当前浏览器不支持语音听写');return}
  if(recognitionActive)engine.stop(); else try{engine.start()}catch(_){}
});

function updateChatModeNote(){
  const bits=['可能未来'];
  bits.push(apiConfig('chatApi')?'LLM':'本地原型');
  if(state.settings.voiceMode)bits.push('语音');
  $('#chatModeNote').textContent=bits.join(' · ');
}

function letterHtml(){
  const p=state.profile,action=clean($('#nextAction').value,'');
  const latest=state.messages.filter((x)=>x.role==='user').slice(-1)[0];
  const latestQuestion=latest?firstClause(latest.text,'未来会怎样'):'未来会怎样';
  return '<h3>给未来的 '+escapeHtml(clean(p.name,'我'))+'</h3>'+
    '<p>今天的我还在想“'+escapeHtml(latestQuestion)+'”。刚才我和一个 60 岁的可能版本聊了一会儿。它没有告诉我答案，只是把时间拉长了一点。</p>'+
    '<p>我希望以后还记得：别丢掉 <strong>'+escapeHtml(firstClause(p.values,'真正重视的东西'))+'</strong>，也别总等“以后”再照顾 '+escapeHtml(firstClause(p.people,'重要的人'))+'。</p>'+
    '<p>'+(action?'这周我先做：<strong>'+escapeHtml(action)+'</strong>。':'我会给这周的自己留一个足够小、真的能做到的动作。')+'</p>'+
    '<p>未来见。<br><strong>'+escapeHtml(clean(p.name,'现在的我'))+' · '+new Date().toLocaleDateString('zh-CN')+'</strong></p>';
}
function renderLetter(){if($('#futureLetter'))$('#futureLetter').innerHTML=letterHtml()}
$('#nextAction').addEventListener('input',()=>{clearTimeout(window.__p005LetterTimer);window.__p005LetterTimer=setTimeout(renderLetter,150)});

function addMonths(baseDate,months){
  const date=new Date(baseDate.getTime()),day=date.getDate();
  date.setDate(1);date.setMonth(date.getMonth()+Number(months||0));
  const last=new Date(date.getFullYear(),date.getMonth()+1,0).getDate();date.setDate(Math.min(day,last));return date;
}
function dateInputValue(date){
  const local=new Date(date.getTime()-date.getTimezoneOffset()*60000);return local.toISOString().slice(0,10);
}
function setUnlockMonths(months,shouldSave=true){
  state.settings.unlockMonths=Number(months)||12;
  $$('#unlockChips button').forEach((button)=>button.classList.toggle('active',Number(button.dataset.months)===state.settings.unlockMonths));
  $('#unlockDate').value=dateInputValue(addMonths(new Date(),state.settings.unlockMonths));
  $('#unlockDate').min=dateInputValue(new Date(Date.now()+86400000));
  if(shouldSave)save();
}
$$('#unlockChips button').forEach((button)=>button.addEventListener('click',()=>setUnlockMonths(Number(button.dataset.months))));
$('#unlockDate').addEventListener('change',()=>$$('#unlockChips button').forEach((button)=>button.classList.remove('active')));

function capsuleStatus(capsule){
  const days=Math.ceil((new Date(capsule.unlockAt)-new Date())/86400000);
  if(days<=0)return '已解锁';
  if(days<31)return '还有 '+days+' 天';
  return '约 '+Math.max(1,Math.round(days/30.44))+' 个月后';
}
function renderCapsules(){
  const root=$('#savedCapsules');if(!root)return;
  if(!state.capsules.length){root.innerHTML='';return}
  root.innerHTML=state.capsules.slice().reverse().map((capsule)=>{
    const unlocked=new Date(capsule.unlockAt)<=new Date();
    return '<button class="saved-capsule" data-capsule-id="'+escapeHtml(capsule.id)+'" '+(unlocked?'':'disabled')+'>'+
      '<span><b>'+(unlocked?'已解锁':'已封存')+'</b><small>'+new Date(capsule.unlockAt).toLocaleDateString('zh-CN')+'</small></span>'+
      '<small>'+capsuleStatus(capsule)+'</small></button>';
  }).join('');
  $$('[data-capsule-id]').forEach((button)=>button.addEventListener('click',()=>{
    const capsule=state.capsules.find((x)=>x.id===button.dataset.capsuleId);
    if(!capsule||new Date(capsule.unlockAt)>new Date())return;
    $('#futureLetter').innerHTML=capsule.letterHtml;showToast('已打开');
  }));
}
$('#saveCapsuleBtn').addEventListener('click',()=>{
  const value=$('#unlockDate').value;if(!value){showToast('请选择日期');return}
  const unlockAt=new Date(value+'T09:00:00');if(unlockAt<=new Date()){showToast('请选择未来日期');return}
  const capsule={
    id:'capsule_'+Date.now(),createdAt:new Date().toISOString(),unlockAt:unlockAt.toISOString(),
    action:clean($('#nextAction').value,''),letterHtml:letterHtml()
  };
  state.capsules.push(capsule);save();renderCapsules();
  emitSessionEvent('capsule_saved',{unlockAt:capsule.unlockAt});syncAdmin('capsule_saved');showToast('已封存');
});

load();
updateProgress();
updateChatModeNote();
emitSessionEvent('loaded',{hasSavedProfile:Boolean(Object.keys(state.profile).length)});

})();
