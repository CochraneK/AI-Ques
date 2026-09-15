(() => {
'use strict';

const STORAGE_KEY = 'bjtu.p005.state.v1';
const LEGACY_KEYS = ['bjtu_p005_future_me_v2', 'aiques_future_me_v1'];
const MODULE_ID = 'P005';
const MODULE_VERSION = '0.6.0';
const ADMIN_SETTINGS_KEY = 'bjtu.p005.admin.v1';
const HORIZON_OPTIONS = ['1y','2y','3y','4y','10y','age60'];

const P001_PROFILE_ASSETS_FALLBACK = {
  // Temporary mirror until the authoritative P001 24+16 word list is exposed to the shared runtime.
  // P001 research basis in the project map: IPIP public-domain trait content + Miller Personal Values Card Sort.
  qualities:[
    '好奇','创造','勤奋','自律','可靠','负责',
    '勇敢','坚持','真诚','善良','同理','合作',
    '公平','谦逊','宽容','乐观','幽默','热情',
    '独立','开放','审慎','果断','领导力','适应力'
  ],
  values:[
    '家人','亲密关系','友谊','健康',
    '成长','学习','事业','成就',
    '创造','自由','稳定','财富',
    '影响力','帮助他人','体验','内心平静'
  ]
};

function p001Sources(){
  const root=window.P00_CONTEXT||{};
  const sources=[root.p001,root.P001,window.P001_PROFILE].filter((x)=>x&&typeof x==='object');
  try{
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i)||'';
      if(!/p[-_.]?001/i.test(key))continue;
      const raw=parseJson(localStorage.getItem(key)||'');
      if(raw&&typeof raw==='object')sources.push(raw);
    }
  }catch(_){}
  return sources;
}
function nestedCandidates(source){
  if(!source||typeof source!=='object')return [];
  const out=[source];
  for(const key of ['profile','result','results','answers','self','data','summary']){
    const value=source[key];
    if(value&&typeof value==='object'&&!Array.isArray(value))out.push(value);
  }
  return out;
}
function p001Context(){
  const sources=p001Sources();
  return sources.length?sources[0]:{};
}
function p001Assets(){
  let ext=window.P001_PROFILE_ASSETS||null;
  if(!ext){
    for(const source of p001Sources()){
      for(const candidate of nestedCandidates(source)){
        if(candidate.assets&&typeof candidate.assets==='object'){ext=candidate.assets;break}
      }
      if(ext)break;
    }
  }
  ext=ext||{};
  const qualities=Array.isArray(ext.positiveQualities)&&ext.positiveQualities.length===24
    ? ext.positiveQualities
    : P001_PROFILE_ASSETS_FALLBACK.qualities;
  const values=Array.isArray(ext.values)&&ext.values.length===16
    ? ext.values
    : P001_PROFILE_ASSETS_FALLBACK.values;
  return {qualities:[...qualities],values:[...values]};
}
function firstArray(source,keys){
  const sources=source?[source]:p001Sources();
  for(const item of sources){
    for(const candidate of nestedCandidates(item)){
      for(const key of keys){
        if(Array.isArray(candidate&&candidate[key]))return candidate[key].filter(Boolean).map(String);
      }
    }
  }
  return [];
}


const SCREENS = ['welcome', 'survey', 'portrait', 'generate', 'ready', 'chat', 'share', 'capsule'];
const STEP_NAMES = {
  welcome: '开始',
  survey: '人生故事',
  portrait: '现在的你',
  generate: '生成',
  ready: '未来的你',
  chat: '对话',
  share: '卡片',
  capsule: '之后'
};

const QUESTIONS = [
  { section:'现在的你', key:'name', source:'paper-core', question:'希望未来的你怎么称呼你？', hint:'用你平时最习惯的称呼。', type:'text', placeholder:'例如：小林', required:true },
  { section:'现在的你', key:'age', source:'paper-core', question:'你现在几岁？', hint:'Future Me 会使用管理员设定的未来时间锚点。', type:'number', placeholder:'22', required:true },

  { section:'现在的你', key:'pronouns', source:'paper-core', replicationOnly:true, question:'你希望未来的自己怎样称呼你？', hint:'2024 Future You 论文公开字段。', type:'text', placeholder:'请用自己的话回答' },
  { section:'现在的你', key:'gender', source:'p005-extension', guidedOnly:true, question:'你的性别是？', hint:'请选择。', type:'text', guidedType:'single', options:['男','女'], required:true },

  { section:'现在的你', key:'location', source:'paper-core', question:'你现在生活在哪里？', hint:'填写城市即可。', type:'text', placeholder:'例如：北京' },
  { section:'现在的你', key:'currentWork', source:'p005-extension', guidedOnly:true, question:'现在，什么占据了你大部分时间？', hint:'请选择最主要的一项。', type:'textarea', guidedType:'single', required:true, options:[
    '本科阶段学习','硕士阶段学习','博士阶段学习','其他阶段学习',
    '职业培训或备考','全职受雇工作','兼职受雇工作','自由职业',
    '创业经营','求职','照顾家庭','休学或间隔期',
    '暂时没有固定安排','其他'
  ], optionalDetail:true },

  { section:'快速画像', key:'p001Qualities', source:'p001-reuse', guidedOnly:true, question:'哪些积极品质最像现在的你？', hint:'最多选 6 个。这里只做快速画像，不重复 P001 的玩法。', type:'matrix', asset:'qualities', max:6, required:true },
  { section:'快速画像', key:'p001Values', source:'p001-reuse', guidedOnly:true, question:'对你来说，哪些事情真的重要？', hint:'最多选 4 个。', type:'matrix', asset:'values', max:4, required:true },

  { section:'人生故事', key:'people', source:'paper-core', question:'现在对你最重要的人是谁？', hint:'可以多选。研究复刻版保持自由文本。', type:'textarea', guidedType:'multi', max:5, options:['父母','其他家人','伴侣','孩子','朋友','老师或导师','同学或同事','自己','其他'], optionalDetail:true },
  { section:'人生故事', key:'proud', source:'paper-core', question:'哪一个时刻，让你真正为自己骄傲？', hint:'先选最接近的一类，也可以补一句。', type:'textarea', guidedType:'single', options:['学习突破','科研突破','工作成果','创作作品','帮助他人','跨过困难','独立做出重要选择','关系中的成长','体育或比赛','其他'], optionalDetail:true },
  { section:'人生故事', key:'lowPoint', source:'paper-core', question:'你经历过的一段低谷是什么？', hint:'只回答你愿意回答的部分。', type:'textarea', guidedType:'single', options:['学业受挫','工作受挫','关系变化','失去重要的人或事','健康压力','经济压力','方向迷茫','家庭事件','其他','不想细说'], optionalDetail:true },
  { section:'人生故事', key:'turningPoint', source:'paper-core', question:'哪件事明显改变了你的方向？', hint:'选择最接近的一类即可，也可以补一句。', type:'textarea', guidedType:'single', options:['升学选择','专业选择','工作选择','搬到新的城市','出国经历','一段重要关系','一次成功','一次失败','家庭事件','健康事件','偶然机会','其他'], optionalDetail:true },
  { section:'人生故事', key:'challenge', source:'p005-extension', guidedOnly:true, question:'现在最想跨过去的难题是什么？', hint:'请选择最接近的一项。', type:'textarea', guidedType:'single', options:['方向选择','学业压力','工作压力','害怕失败','自信不足','关系困扰','经济压力','健康或精力','时间管理','暂时没有','其他'], optionalDetail:true },

  { section:'未来的你', key:'lifeProject', source:'paper-prompt', question:'如果有一件事值得长期投入，会是什么？', hint:'这个字段出现在论文公开的 Future Memory prompt 中。', type:'textarea', guidedType:'single', options:['专业研究','事业发展','创业','创作','家庭关系','教育他人','帮助他人','公益行动','健康生活','探索世界','还不知道','其他'], optionalDetail:true },
  { section:'未来的你', key:'career', source:'paper-core', question:'到 {future}，你希望事业更接近哪种状态？', hint:'最多选 2 项。', type:'textarea', guidedType:'multi', max:2, options:['成为某领域的专家','做有影响力的项目','带领团队','拥有自己的事业','更自由地工作','工作稳定','工作和生活更平衡','帮助更多人','仍在探索'], optionalDetail:true },
  { section:'未来的你', key:'finance', source:'paper-core', question:'到 {future}，怎样的财务状态会让你觉得够好？', hint:'最多选 3 项。', type:'textarea', guidedType:'multi', max:3, options:['基本没有经济焦虑','有稳定储蓄','没有高压债务','能支持家人','有选择工作的自由','实现财务独立','能为兴趣和体验花钱','钱不是生活的核心'], optionalDetail:true },
  { section:'未来的你', key:'family', source:'paper-core', question:'到 {future}，你希望亲密关系和家庭是什么样？', hint:'可以多选。', type:'textarea', guidedType:'multi', max:4, options:['有稳定伴侣','有孩子','和父母关系亲近','和其他家人关系亲近','有稳定的朋友群体','独居但关系充实','还不确定','其他'], optionalDetail:true },
  { section:'未来的你', key:'personalLife', source:'paper-core', question:'到 {future}，你希望个人生活最明显的变化是什么？', hint:'最多选 3 项。', type:'textarea', guidedType:'multi', max:3, options:['更自由自主','更平静稳定','更健康有精力','有更多时间陪重要的人','持续学习成长','有更多创造和兴趣','更多旅行','更有生活掌控感'], optionalDetail:true },
  { section:'未来的你', key:'futureLocation', source:'paper-prompt', question:'到 {future}，你想在哪里生活？', hint:'请选择最接近的一项。', type:'textarea', guidedType:'single', options:['继续留在现在的城市','回到家乡','去中国另一座城市','长期生活在海外','在多个城市之间生活','住在更自然安静的地方','地点不重要','还不知道'], optionalDetail:true },
  { section:'未来的你', key:'dailyLife', source:'paper-prompt', question:'到 {future}，普通的一天里你希望有什么？', hint:'最多选 4 项。', type:'textarea', guidedType:'multi', max:4, options:['专注工作','创作','运动','陪伴家人','陪伴伴侣','和朋友见面','学习新东西','旅行或户外','参与社区活动','安静独处','规律休息'], optionalDetail:true }
];

function protocolMode(){
  return runtimeConfig().intakeProtocol==='replication'?'replication':'guided';
}
function activeQuestions(){
  return protocolMode()==='replication'
    ? QUESTIONS.filter((q)=>(q.source==='paper-core'||q.source==='paper-prompt')&&!q.guidedOnly)
    : QUESTIONS.filter((q)=>!q.replicationOnly);
}
function questionSourceLabel(source){
  return ({'paper-core':'2024 论文核心','paper-prompt':'2024 Memory prompt','p001-reuse':'P001 共用画像','p005-extension':'P005 扩展'})[source]||'';
}

const state = {
  screen:'welcome',
  surveyIndex:0,
  profile:{},
  structuredAnswers:{},
  memory:null,
  messages:[],
  currentPortrait:'',
  futurePortrait:'',
  capsules:[],
  generated:false,
  settings:{ voiceMode:false, unlockMonths:12, shareCardStyle:'minimal' }
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

function adminSettings(){
  const local=parseJson(localStorage.getItem(ADMIN_SETTINGS_KEY)||'')||{};
  return local&&typeof local==='object'?local:{};
}
function runtimeConfig(){
  return Object.assign({
    targetHorizon:'4y',
    intakeProtocol:'guided',
    voiceId:'marin',
    ttsInstructions:'自然、平静、像熟悉自己的真人，不要播音腔；中文语速略慢。'
  },window.P005_FUTURE_ME_CONFIG||{},adminSettings());
}
function apiConfig(name){
  const config=runtimeConfig();
  const direct={
    chatApi:window.FUTURE_ME_API,
    memoryApi:window.FUTURE_ME_MEMORY_API,
    imageApi:window.FUTURE_ME_IMAGE_API,
    voiceApi:window.FUTURE_ME_VOICE_API,
    transcribeApi:window.FUTURE_ME_TRANSCRIBE_API,
    realtimeSessionApi:window.FUTURE_ME_REALTIME_SESSION_API,
    adminApi:window.P00_ADMIN_API
  };
  return direct[name]||config[name]||'';
}
function horizonMode(){
  const raw=String(runtimeConfig().targetHorizon||'4y');
  return HORIZON_OPTIONS.includes(raw)?raw:'4y';
}
function horizonYears(){
  const mode=horizonMode();
  return mode==='age60'?null:Number(mode.replace('y',''));
}
function targetAge(){
  const current=Number(state.profile.age)||22;
  const years=horizonYears();
  return years===null?60:current+years;
}
function targetYear(){
  const years=horizonYears();
  return years===null?null:new Date().getFullYear()+years;
}
function targetPhrase(){
  const years=horizonYears();
  if(years===null)return '60 岁时';
  return years+' 年后';
}
function targetLabel(){
  const years=horizonYears();
  if(years===null)return '60 岁的你';
  const year=targetYear();
  return years+' 年后的你'+(year?' · '+year:'');
}
function interpolateQuestion(text){
  return String(text||'').replaceAll('{future}',targetPhrase());
}
function renderTargetLabels(){
  const values={
    welcomeTarget:targetPhrase(),
    pairFuture:targetPhrase(),
    generateAgeFuture:targetPhrase(),
    futureTargetLabel:targetPhrase()
  };
  Object.entries(values).forEach(([id,value])=>{
    const node=document.getElementById(id);
    if(node)node.textContent=value;
  });
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
  const allowed=['name','age','origin','location','currentWork','values','gender'];
  for(const key of allowed){
    if(!state.profile[key]&&shared&&shared[key])state.profile[key]=shared[key];
  }
}
function hydrateP001Selections(){
  const qualities=firstArray(null,['selectedQualities','positiveQualities','qualities','strengths','traits']).slice(0,6);
  const values=firstArray(null,['selectedValues','valueChoices','importantValues','values','priorities']).slice(0,4);
  if(qualities.length&&!(state.structuredAnswers.p001Qualities&&state.structuredAnswers.p001Qualities.selected&&state.structuredAnswers.p001Qualities.selected.length)){
    state.structuredAnswers.p001Qualities={selected:qualities,detail:'',reusedFromP001:true};
    state.profile.positiveQualities=qualities.join('、');
  }
  if(values.length&&!(state.structuredAnswers.p001Values&&state.structuredAnswers.p001Values.selected&&state.structuredAnswers.p001Values.selected.length)){
    state.structuredAnswers.p001Values={selected:values,detail:'',reusedFromP001:true};
    state.profile.values=values.join('、');
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
  return SCREENS.includes(name)?name:'welcome';
}
function normalizedSavedScreen(name){
  if(['identity','present','future'].includes(name))return 'survey';
  if(name==='generate')return state.memory?'ready':'portrait';
  return SCREENS.includes(name)?name:'welcome';
}

function snapshot(includeMedia=false){
  const data={
    module:MODULE_ID,
    version:MODULE_VERSION,
    profile:state.profile,
    structuredAnswers:state.structuredAnswers,
    personaBrief:buildPersonaBrief(),
    syntheticMemory:state.memory,
    messages:state.messages,
    capsules:state.capsules,
    settings:Object.assign({},state.settings,{
      targetHorizon:horizonMode(),targetAge:targetAge(),targetYear:targetYear(),
      intakeProtocol:protocolMode(),voiceId:runtimeConfig().voiceId||'marin'
    }),
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
async function syncAdmin(type,payload={}){
  const endpoint=apiConfig('adminApi');
  if(!endpoint)return;
  try{
    await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,body:JSON.stringify({
      module:MODULE_ID,
      version:MODULE_VERSION,
      event:type,
      occurredAt:new Date().toISOString(),
      target:{mode:horizonMode(),years:horizonYears(),age:targetAge(),year:targetYear()},
      payload,
      data:snapshot(false)
    })});
  }catch(error){console.warn('P005 admin sync unavailable',error)}
}

function save(){
  try{
    localStorage.setItem(STORAGE_KEY,JSON.stringify({
      profile:state.profile,
      structuredAnswers:state.structuredAnswers,
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
      structuredAnswers:legacy.structuredAnswers||{},
      memory:legacy.memory||null,
      messages:legacy.messages||[],
      currentPortrait:legacy.currentPortrait||'',
      futurePortrait:legacy.futurePortrait||'',
      capsules:legacy.capsules||[],
      settings:Object.assign({},state.settings,legacy.settings||{}),
      screen:normalizedSavedScreen(legacy.screen),
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
    state.structuredAnswers=saved.structuredAnswers||{};
    state.memory=saved.memory||null;
    state.messages=saved.messages||[];
    state.currentPortrait=saved.currentPortrait||'';
    state.futurePortrait=saved.futurePortrait||'';
    state.capsules=saved.capsules||[];
    state.settings=Object.assign({},state.settings,saved.settings||{});
    state.screen=normalizedSavedScreen(saved.screen);
    state.surveyIndex=Math.max(0,Math.min(activeQuestions().length-1,Number(saved.surveyIndex)||0));
    state.generated=Boolean(state.memory);
  }
  mapSharedIntoProfile(sharedProfile());
  hydrateP001Selections();
  restorePortraits();
  renderSurvey();
  updateVoiceUI();
  renderCapsules();
  setUnlockMonths(state.settings.unlockMonths||12,false);
  const hasProgress=Boolean(saved&&(Object.keys(state.profile).length||state.memory||state.messages.length||state.currentPortrait||state.capsules.length));
  if($('#resumeBtn'))$('#resumeBtn').classList.toggle('hidden',!hasProgress);
  if($('#generateAgeNow'))$('#generateAgeNow').textContent=state.profile.age?state.profile.age:'现在';
  renderTargetLabels();
  state.screen='welcome';
}

function updateProgress(){
  const label=$('#stepLabel');
  const fill=$('#progressFill');
  if(label)label.textContent=STEP_NAMES[state.screen]||'';
  let ratio=SCREENS.indexOf(state.screen)/(SCREENS.length-1);
  if(state.screen==='survey')ratio=.06+.35*((state.surveyIndex+1)/activeQuestions().length);
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
  if(state.screen==='share')renderShareCard();
  if(state.screen==='capsule'){renderLetter();renderCapsules()}
  updateProgress();
  save();
  emitSessionEvent('screen_view',{screen:state.screen});
  window.scrollTo({top:0,behavior:'smooth'});
}

$$('[data-next]').forEach((button)=>button.addEventListener('click',()=>show(button.dataset.next)));
$$('[data-prev]').forEach((button)=>button.addEventListener('click',()=>show(button.dataset.prev)));

function selectedGuidedValues(q){
  const stored=state.structuredAnswers[q.key]||{};
  return Array.isArray(stored.selected)?stored.selected:[];
}
function renderMatrixQuestion(q,root){
  const assets=p001Assets();
  const options=assets[q.asset]||[];
  const stored=state.structuredAnswers[q.key]||{};
  const selected=Array.isArray(stored.selected)?stored.selected:[];
  root.innerHTML=
    '<div class="matrix-head"><span>已选 <b id="matrixCount">'+selected.length+'</b> / '+q.max+'</span><small>点一下选择，再点一下取消</small></div>'+
    '<div class="profile-matrix">'+options.map((option)=>{
      const on=selected.includes(option)?' selected':'';
      return '<button type="button" class="matrix-item'+on+'" data-matrix-option="'+escapeHtml(option)+'">'+escapeHtml(option)+'</button>';
    }).join('')+'</div>';
  $('[data-matrix-option]').forEach((button)=>button.addEventListener('click',()=>{
    const value=button.dataset.matrixOption;
    let values=Array.isArray((state.structuredAnswers[q.key]||{}).selected)?[...state.structuredAnswers[q.key].selected]:[];
    if(values.includes(value))values=values.filter((x)=>x!==value);
    else{
      if(values.length>=q.max){showToast('最多选择 '+q.max+' 个');return}
      values.push(value);
    }
    state.structuredAnswers[q.key]={selected:values,detail:'',reusedFromP001:false};
    button.classList.toggle('selected',values.includes(value));
    const count=$('#matrixCount');if(count)count.textContent=values.length;
  }));
}

function renderGuidedChoices(q,root){
  const selected=selectedGuidedValues(q);
  const type=q.guidedType||'single';
  const options=(q.options||[]).map((option)=>{
    const on=selected.includes(option)?' selected':'';
    return '<button type="button" class="answer-option'+on+'" data-answer-option="'+escapeHtml(option)+'">'+escapeHtml(option)+'</button>';
  }).join('');
  root.innerHTML='<div class="answer-options '+type+'">'+options+'</div>'+
    (q.optionalDetail?'<input class="answer-detail" id="surveyDetail" placeholder="可选：补充一句，让 Future Me 更像你">':'');
  const detail=$('#surveyDetail');
  if(detail)detail.value=(state.structuredAnswers[q.key]||{}).detail||'';
  $$('[data-answer-option]').forEach((button)=>button.addEventListener('click',()=>{
    const value=button.dataset.answerOption;
    let values=selectedGuidedValues(q);
    if(type==='single'){
      values=[value];
      $$('[data-answer-option]').forEach((node)=>node.classList.toggle('selected',node===button));
    }else{
      if(values.includes(value))values=values.filter((x)=>x!==value);
      else{
        if(q.max&&values.length>=q.max){showToast('最多选择 '+q.max+' 项');return}
        values=[...values,value];
      }
      button.classList.toggle('selected',values.includes(value));
    }
    state.structuredAnswers[q.key]={selected:values,detail:detail?detail.value:''};
  }));
}
function renderSurvey(){
  const list=activeQuestions();
  const q=list[state.surveyIndex];
  if(!q)return;
  $('#surveySection').textContent=q.section+' · '+questionSourceLabel(q.source);
  $('#surveyProtocol').textContent=protocolMode()==='replication'?'研究复刻版':'低负担版';
  $('#surveyCount').textContent=(state.surveyIndex+1)+' / '+list.length;
  $('#surveyQuestion').textContent=interpolateQuestion(q.question);
  $('#surveyHint').textContent=interpolateQuestion(q.hint||'');

  const root=$('#surveyInput');
  if(q.type==='matrix'&&protocolMode()==='guided'){
    renderMatrixQuestion(q,root);
  }else if(protocolMode()==='guided'&&q.guidedType){
    renderGuidedChoices(q,root);
  }else{
    const tag=q.type==='textarea'||(protocolMode()==='replication'&&!['name','age','pronouns','location'].includes(q.key))?'textarea':'input';
    const type=q.type==='number'?'number':'text';
    root.innerHTML=tag==='textarea'
      ? '<textarea id="surveyField" rows="4" placeholder="'+escapeHtml(q.placeholder||'请用自己的话回答……')+'"></textarea>'
      : '<input id="surveyField" type="'+type+'" '+(q.type==='number'?'min="16" max="100" inputmode="numeric"':'')+' placeholder="'+escapeHtml(q.placeholder||'')+'">';
    $('#surveyField').value=state.profile[q.key]||'';
    setTimeout(()=>$('#surveyField').focus(),60);
  }
  $('#surveyBackBtn').textContent=state.surveyIndex===0?'返回首页':'上一题';
  $('#surveyNextBtn').textContent=state.surveyIndex===list.length-1?'继续':'下一题';
  updateProgress();
}

function captureSurvey(){
  const list=activeQuestions();
  const q=list[state.surveyIndex];
  if(!q)return true;

  if(q.type==='matrix'&&protocolMode()==='guided'){
    const current=state.structuredAnswers[q.key]||{};
    const selected=Array.isArray(current.selected)?current.selected:[];
    if(q.required&&!selected.length){showToast('至少选择 1 个');return false}
    if(selected.length>q.max){showToast('最多选择 '+q.max+' 个');return false}
    state.profile[q.key==='p001Qualities'?'positiveQualities':'values']=selected.join('、');
    save();
    syncAdmin('survey_answered',{key:q.key,source:q.source,protocol:protocolMode(),structured:current,value:selected,surveyIndex:state.surveyIndex});
    return true;
  }
  if(protocolMode()==='guided'&&q.guidedType){
    const current=state.structuredAnswers[q.key]||{};
    const selected=Array.isArray(current.selected)?current.selected:[];
    const detail=clean($('#surveyDetail')?$('#surveyDetail').value:current.detail,'');
    if(q.required&&!selected.length&&!detail){showToast('先选择一项');return false}
    state.structuredAnswers[q.key]={selected,detail};
    state.profile[q.key]=[selected.join('、'),detail].filter(Boolean).join('；补充：');
    save();
    syncAdmin('survey_answered',{key:q.key,source:q.source,protocol:protocolMode(),structured:state.structuredAnswers[q.key],value:state.profile[q.key],surveyIndex:state.surveyIndex});
    return true;
  }

  const field=$('#surveyField');
  const value=clean(field&&field.value,'');
  if(q.required&&!value){
    if(field)field.focus();
    showToast('先回答这一题');
    return false;
  }
  if(q.key==='age'&&value){
    const age=Number(value);
    if(!Number.isFinite(age)||age<16||age>100){
      showToast('请输入 16–100 之间的年龄');
      if(field)field.focus();
      return false;
    }
  }
  state.profile[q.key]=value;
  save();
  syncAdmin('survey_answered',{key:q.key,source:q.source,protocol:protocolMode(),value,surveyIndex:state.surveyIndex});
  return true;
}
$('#surveyNextBtn').addEventListener('click',()=>{
  const list=activeQuestions();
  if(!captureSurvey())return;
  if(state.surveyIndex>=list.length-1){show('portrait');return}
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
  if(event.key==='Enter'&&!event.shiftKey&&event.target.tagName==='INPUT'&&state.surveyIndex<activeQuestions().length-1&&protocolMode()==='replication'){
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
  syncAdmin('session_reset',{});
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
  syncAdmin('export',{});
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
    syncAdmin('portrait_added',{hasPortrait:true,fileType:file.type,fileSize:file.size});
  }catch(error){console.error(error);showToast('照片读取失败')}
});

function safeExternalPersona(){
  const context=window.P00_CONTEXT||{};
  const candidate=context.selfProfile||context.persona||context.publicPersona||{};
  if(!candidate||typeof candidate!=='object')return {};
  const allowed=['traits','strengths','values','interests','roles','priorities','selfDescription'];
  return Object.fromEntries(allowed.filter((k)=>candidate[k]).map((k)=>[k,candidate[k]]));
}
function p004SafeContext(){
  const threads=parseJson(localStorage.getItem('bjtu.p004.threads.v2')||'')||{};
  const memories=parseJson(localStorage.getItem('bjtu.p004.memory.v2')||'')||{};
  const userTurns=Object.values(threads).flat().filter((m)=>m&&m.role==='user'&&clean(m.text)).map((m)=>clean(m.text)).slice(-40);
  const continuityMemories=Object.values(memories).flat().filter((m)=>m&&clean(m.text)).map((m)=>clean(m.text)).slice(-24);
  return {
    available:Boolean(userTurns.length||continuityMemories.length),
    recentUserTurns:userTurns,
    continuityMemories
  };
}
function buildPersonaBrief(){
  const p=state.profile;
  return {
    identity:{name:p.name||'',age:p.age||'',gender:p.gender||'',pronouns:p.pronouns||'',location:p.location||'',currentWork:p.currentWork||''},
    continuity:{
      importantPeople:p.people||'',proudPoint:p.proud||'',lowPoint:p.lowPoint||'',turningPoint:p.turningPoint||'',
      positiveQualities:p.positiveQualities||'',values:p.values||'',lifeProject:p.lifeProject||'',currentChallenge:p.challenge||''
    },
    futurePreferences:{
      career:p.career||'',finance:p.finance||'',family:p.family||'',personalLife:p.personalLife||'',
      futureLocation:p.futureLocation||'',dailyLife:p.dailyLife||''
    },
    p004SafeContext:p004SafeContext(),
    optionalCollectionContext:safeExternalPersona()
  };
}

function buildMemory(){
  const p=state.profile;
  const age=Number(p.age)||22;
  const futureAge=targetAge();
  const futurePhrase=targetPhrase();
  const values=firstClause(p.values,'好奇、关系与自主');
  const people=firstClause(p.people,'重要的人');
  const career=firstClause(p.career,'找到一种更适合自己的工作方式');
  const project=firstClause(p.lifeProject,'持续投入一件真正重要的长期事情');
  const challenge=firstClause(p.challenge,'学会在不确定里继续行动');
  const low=firstClause(p.lowPoint,'一段并不轻松的时期');
  const turning=firstClause(p.turningPoint,'一个改变方向的时刻');
  const futureLocation=firstClause(p.futureLocation,p.location||'一个让自己安稳的地方');
  const daily=firstClause(p.dailyLife||p.personalLife,'有工作，也有留给生活和关系的时间');
  const family=firstClause(p.family,'和重要的人保持真实而稳定的关系');
  const personalLife=firstClause(p.personalLife,'有更自由、健康而稳定的个人生活');

  const memories=[
    futurePhrase+'，我回头看“'+project+'”已经不再只是一个计划。最有满足感的不是结果，而是终于看见持续投入开始有自己的形状。',
    '我也经历过“'+challenge+'”反复回来。后来真正帮到我的，是把它变成能重复的小动作，而不是等自己彻底不害怕。',
    '最大的意外，是很多当年以为会决定一生的事后来只是路口；反而是“'+values+'”和与'+people+'的关系，慢慢决定了生活长成什么样。'
  ];

  const timeline=[
    {age,tag:'现在',text:'你带着“'+values+'”出发，也已经经历过'+low+'和'+turning+'。'},
    {age:Math.round((age+futureAge)/2),tag:'变化',text:'你开始围绕“'+project+'”积累作品、能力和关系，职业方向逐渐靠近“'+career+'”。'},
    {age:futureAge,tag:'Future Me',text:'到'+futurePhrase+'，你生活在'+futureLocation+'。普通的一天是：'+daily+'。关系上，你希望'+family+'；个人生活更接近：'+personalLife+'。'}
  ];


  return {
    summary:'这是 '+clean(p.name,'你')+' 从现在走向'+futurePhrase+'的一种可能版本。它围绕“'+project+'”、'+career+'，以及你不想丢掉的“'+values+'”展开。',
    futureVignette:futurePhrase+'的你住在'+futureLocation+'。生活没有完全按计划发生，但“'+values+'”仍然能在日常里被看见。',
    memories,
    timeline,
    voiceAnchors:{values,people,career,project,challenge}
  };
}

async function generateMemory(){
  const payload={
    module:MODULE_ID,
    profile:state.profile,
    structuredAnswers:state.structuredAnswers,
    personaBrief:buildPersonaBrief(),
    intakeProtocol:protocolMode(),
    target:{mode:horizonMode(),years:horizonYears(),age:targetAge(),year:targetYear(),phrase:targetPhrase()},
    instruction:'Create one plausible future memory at the configured target horizon, not a prediction. Return ONLY valid JSON with summary, futureVignette, memories (3 strings), and timeline. Ground it in the user profile and P004 safe context when available. Include expected and unexpected outcomes, rewarding moments, challenges, and continuity with present values.'
  };
  if(window.P005_API&&window.P005_API.configured){
    try{
      const r=await window.P005_API.chat(Object.assign({},payload,{
        messages:[{role:'user',text:'根据提供的画像生成 Future Memory。只返回 JSON。'}],
        userMessage:'根据提供的画像生成 Future Memory。只返回 JSON。'
      }));
      const raw=String(r&&r.reply||'').replace(/^\s*```(?:json)?/i,'').replace(/```\s*$/,'').trim();
      const parsed=parseJson(raw);
      if(parsed&&parsed.summary&&Array.isArray(parsed.memories))return parsed;
    }catch(error){console.warn('P005 direct memory generation unavailable',error)}
  }
  const endpoint=apiConfig('memoryApi');
  if(endpoint){
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      if(!response.ok)throw new Error('memory api '+response.status);
      const result=await response.json();
      if(result&&result.summary)return result;
    }catch(error){console.warn('Future memory API unavailable; using local fallback',error)}
  }
  return buildMemory();
}

async function requestFuturePortrait(){
  if(!state.currentPortrait)return false;
  const payload={
    image:state.currentPortrait,currentAge:Number(state.profile.age)||null,targetAge:targetAge(),
    instruction:'Preserve identity. Create a respectful photorealistic portrait at the configured future age. Apply only natural age progression appropriate to the age difference; do not alter race, gender presentation, or core facial identity.'
  };
  const directCaps=window.P005_API&&window.P005_API.capabilities?window.P005_API.capabilities():{};
  if(directCaps.image){
    try{
      const result=await window.P005_API.image(payload);
      if(result&&result.imageUrl){
        state.futurePortrait=result.imageUrl;save();
        emitSessionEvent('future_portrait_generated',{source:'direct-api'});syncAdmin('future_portrait_generated',{source:'direct-api'});
        return true;
      }
    }catch(error){console.warn('P005 direct image API unavailable',error);showToast('图像 API 调用失败，已保留文字版 Future Me')}
  }
  const endpoint=apiConfig('imageApi');
  if(!endpoint)return false;
  try{
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    if(!response.ok)throw new Error('image api '+response.status);
    const result=await response.json();
    const imageValue=result.imageUrl||result.url||(result.imageBase64?'data:image/png;base64,'+result.imageBase64:'');
    if(!imageValue)throw new Error('missing image result');
    state.futurePortrait=imageValue;
    save();
    emitSessionEvent('future_portrait_generated',{source:'backend'});syncAdmin('future_portrait_generated',{source:'backend'});
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
  const end=$('#generateAgeFuture');if(end)end.textContent=targetPhrase();

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
    emitSessionEvent('future_generated',{target:targetPhrase()});
    syncAdmin('future_generated');
  },1150);
}
$('#meetBtn').addEventListener('click',()=>show('ready'));

function renderFuturePortrait(){
  const frame=$('#futurePortrait'),image=$('#futurePortraitImg'),mono=$('#futureMonogram'),status=$('#portraitStatus');
  if(!frame||!image||!mono||!status)return;
  mono.textContent=(clean(state.profile.name,'F').charAt(0)||'F').toUpperCase();
  if(state.futurePortrait){
    frame.classList.add('has-image');image.src=state.futurePortrait;status.textContent='可能的 '+targetPhrase()+'头像';
  }else{
    frame.classList.remove('has-image');image.removeAttribute('src');
    status.textContent=state.currentPortrait?'未连接年龄化结果':'未上传照片';
  }
}

function renderReady(){
  if(!state.memory)state.memory=buildMemory();
  $('#futureName').textContent=clean(state.profile.name,'你');
  const targetNode=$('#futureTargetLabel');if(targetNode)targetNode.textContent=targetPhrase();
  $('#futureMonogram').textContent=(clean(state.profile.name,'F').charAt(0)||'F').toUpperCase();
  $('#chatAvatar').textContent=(clean(state.profile.name,'F').charAt(0)||'F').toUpperCase();
  $('#chatName').textContent=clean(state.profile.name,'Future Me')+' · '+targetPhrase();
  $('#futureIntro').textContent=state.memory.futureVignette||'一个由你现在的故事延伸出来的可能版本。';
  renderFuturePortrait();
  const caps=window.P005_API&&window.P005_API.capabilities?window.P005_API.capabilities():{};
  $('#agePortraitBtn').classList.toggle('hidden',!(state.currentPortrait&&(caps.image||apiConfig('imageApi'))));

  const memories=Array.isArray(state.memory.memories)&&state.memory.memories.length
    ? state.memory.memories.slice(0,3)
    : (state.memory.timeline||[]).slice(1).map((x)=>x.text);

  $('#memorySummary').innerHTML=
    '<p class="future-summary">'+escapeHtml(state.memory.summary||'')+'</p>'+
    '<div class="memory-glimpse">'+memories.map((x)=>'<p>'+escapeHtml(x)+'</p>').join('')+'</div>';

  save();
}

$('#agePortraitBtn').addEventListener('click',async()=>{
  if(!state.currentPortrait){showToast('先加入一张现在的照片');show('portrait');return}
  const caps=window.P005_API&&window.P005_API.capabilities?window.P005_API.capabilities():{};
  if(!(caps.image||apiConfig('imageApi'))){showToast('尚未配置可用的图像编辑模型');return}
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
    text:'嗨，'+clean(p.name,'现在的我')+'。我是'+targetPhrase()+'的你——先说清楚，这只是可能的未来，人生完全可能走成别的样子。'
  });
  state.messages.push({
    role:'future',
    text:'我像你这么大时，也在想“'+firstClause(p.career||p.currentWork,'以后到底会成为什么样的人')+'”。我还记得“'+firstClause(p.proud,'那个让我第一次觉得自己做得到的时刻')+'”，它后来比我当时想象得更重要。'
  });
  state.messages.push({
    role:'future',
    text:'从'+targetPhrase()+'回头看，'+firstClause(p.people,'重要的人')+'、'+firstClause(p.turningPoint,'那个改变方向的节点')+'，还有“'+firstClause(p.values||p.personalLife,'真正想守住的生活')+'”，一起把很多选择串了起来。你现在最想问我哪一件？'
  });
  save();
}

function renderMessages(){
  const box=$('#messages');
  box.innerHTML=state.messages.map((message)=>{
    const role=message.role==='future'?'future':'user';
    return '<div class="message '+role+'"><span class="meta">'+(role==='future'?'Future Me · '+targetPhrase():'现在的我')+'</span>'+escapeHtml(message.text)+'</div>';
  }).join('');
  box.scrollTop=box.scrollHeight;
  const exchanged=state.messages.filter((m)=>m.text!=='…').length;
  $('#finishChatBtn').classList.toggle('hidden',exchanged<16);
  if(exchanged>3)$('#promptChips').classList.add('hidden');
}

function renderPersonalizedPrompts(){
  const p=state.profile;
  const prompts=[
    p.career?'关于“'+firstClause(p.career)+'”，后来真的接近了吗？':'你后来最满意的工作是什么？',
    p.people?'你和'+firstClause(p.people)+'后来怎么样？':'后来哪些关系一直留在身边？',
    p.turningPoint?'回头看，“'+firstClause(p.turningPoint)+'”真的改变了人生吗？':'最大的意外是什么？'
  ];
  $('#promptChips button').forEach((button,i)=>{if(prompts[i])button.textContent=prompts[i]});
}
function startChat(){ensureGreeting();renderPersonalizedPrompts();renderMessages();updateVoiceUI();updateChatModeNote()}

function localFutureReply(input){
  const p=state.profile,m=state.memory||buildMemory(),a=m.voiceAnchors||{};
  const values=a.values||firstClause(p.values,'真正重要的东西');
  const project=a.project||firstClause(p.lifeProject,'长期投入的事情');
  const challenge=a.challenge||firstClause(p.challenge,'眼前这个难题');
  const q=input.toLowerCase();

  const groups={
    happy:[
      '并不是一直开心。到'+targetPhrase()+'，我更在意的不是“幸福有没有到达”，而是生活有没有长期偏离“'+values+'”。',
      '有快乐，也有很普通甚至很难的几年。真正稳定下来的，是我终于不再要求每个阶段都证明自己走对了。'
    ],
    career:[
      '你现在的状态是“'+firstClause(p.currentWork,'正在寻找自己的位置')+'”。回头看，真正有复利的不是一次选对，而是围绕“'+project+'”持续积累。你曾经为“'+firstClause(p.proud,'一次小小的突破')+'”骄傲，那种能力后来没有消失。',
      '“'+firstClause(p.career,'想做的事')+'”最后没有完全照剧本发生。真正帮我判断机会的，是它是否同时照顾到“'+firstClause(p.values||p.personalLife,'我想要的生活')+'”。'
    ],
    people:[
      '你写下的“'+firstClause(p.people,'重要的人')+'”后来并没有自动留在生命里。真正留下来的关系，是一次次具体地出现、表达、道歉和设边界。',
      '你希望未来的关系更接近“'+firstClause(p.family,'稳定而真实')+'”。这件事不是等来的，而是在很多很普通的日子里慢慢做出来的。'
    ],
    regret:[
      '当然有遗憾。尤其经历过“'+firstClause(p.lowPoint,'那段低谷')+'”以后，我很久都想把每一步走对。后来才知道，很多遗憾会变成信息，不是判决。',
      '“'+firstClause(p.turningPoint,'那个转折点')+'”当时看起来像一条不可逆的路，后来才发现人可以在选择之后继续修正自己。'
    ],
    fear:[
      '我记得这种不确定。焦虑常常在要求你提前拿到未来的保证，但未来很少给这种保证。你能做的是让下一步更小、更真实、更可撤回。',
      '关于“'+challenge+'”，真正的变化不是某天突然不怕了，而是害怕时仍然能完成一个足够小的动作。'
    ],

    surprise:[
      '最大的意外是：很多当年觉得会决定一生的事，后来只是路口；一些很小的习惯和关系，反而慢慢复利成了人生。',
      '未来最常见的不是戏剧性反转，而是一些当时不起眼的选择，几年后突然显出差异。'
    ],
    default:[
      '当我从'+targetPhrase()+'往回看，我不会先问“正确答案是什么”，而会问：这件事和“'+values+'”、'+firstClause(p.people,'重要的人')+'，以及“'+firstClause(p.personalLife,'我真正想过的生活')+'”分别有什么关系？',
      '你已经经历过“'+firstClause(p.turningPoint,'一次方向变化')+'”，也做成过“'+firstClause(p.proud,'一件让自己骄傲的事')+'”。这让我更愿意把现在的问题当成下一次真实实验，而不是一次必须完美的考试。'
    ]
  };

  let key='default';
  if(/开心|幸福|快乐|happy/.test(q))key='happy';
  else if(/工作|职业|事业|career|学习|专业/.test(q))key='career';
  else if(/家人|家庭|朋友|伴侣|关系|父母/.test(q))key='people';
  else if(/后悔|遗憾|regret/.test(q))key='regret';
  else if(/焦虑|害怕|担心|恐惧|压力/.test(q))key='fear';
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
  const payload={
    module:MODULE_ID,
    profile:state.profile,
        structuredAnswers:state.structuredAnswers,
        personaBrief:buildPersonaBrief(),
        syntheticMemory:state.memory,
        messages:state.messages.filter((item)=>item.text!=='…'),
        userMessage:input,
        target:{mode:horizonMode(),years:horizonYears(),age:targetAge(),year:targetYear(),phrase:targetPhrase()},
    instruction:'Act as one plausible future self at the configured target horizon. Ground every response in the supplied personaBrief, life story, structured answers, future memory, and P004 safe context when available. When relevant, naturally reference one or two concrete user-specific details rather than giving generic advice. Never expose P004 clinical/admin inference. Do not mechanically repeat profile fields. Speak autobiographically using continuity cues when natural. Include expected and unexpected outcomes. Be a reflective mirror rather than a counselor. Ask thoughtful follow-up questions. Never claim certainty, prophecy, diagnosis, therapy, or that this future has actually happened.'
  };
  if(window.P005_API&&window.P005_API.configured){
    try{
      const result=await window.P005_API.chat(payload);
      if(result&&result.reply)return String(result.reply);
    }catch(error){console.warn('P005 direct chat API unavailable; trying backend/local fallback',error)}
  }
  const endpoint=apiConfig('chatApi');
  if(endpoint){
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
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
function effectiveMessageCount(){return state.messages.filter((m)=>m.text!=='…').length}
function endConversation(source){
  const exchanged=effectiveMessageCount();
  const early=protocolMode()==='replication'&&exchanged<16;
  if(early&&!confirm('原 Future You 研究在 16 条交换消息后才出现完成入口。现在结束会被记录为提前结束，仍要继续吗？'))return;
  syncAdmin('chat_ended',{source,exchanged,endedEarly:early,protocol:protocolMode()});
  emitSessionEvent('chat_ended',{source,exchanged,endedEarly:early});
  show('share');
}
$('#finishChatBtn').addEventListener('click',()=>endConversation('protocol_completion'));
$('#endChatBtn').addEventListener('click',()=>endConversation('user_end_button'));

async function speakText(text){
  if(!text)return;
  const voicePayload={
    text,
    voice:(window.P005_API&&window.P005_API.configured?window.P005_API.readDirect().voice:runtimeConfig().voiceId)||'marin',
    instructions:runtimeConfig().ttsInstructions||'自然、平静、像熟悉自己的真人，不要播音腔。',
    language:'zh-CN',
    profile:{name:state.profile.name||'',targetAge:targetAge(),targetPhrase:targetPhrase()}
  };
  const directCaps=window.P005_API&&window.P005_API.capabilities?window.P005_API.capabilities():{};
  if(directCaps.tts){
    try{
      const result=await window.P005_API.speak(voicePayload);
      if(result&&result.audioUrl){
        const audio=new Audio(result.audioUrl);
        if(result.revoke)audio.addEventListener('ended',()=>URL.revokeObjectURL(result.audioUrl),{once:true});
        await audio.play();return;
      }
    }catch(error){console.warn('P005 direct TTS unavailable; trying backend/browser fallback',error)}
  }
  const endpoint=apiConfig('voiceApi');
  if(endpoint){
    try{
      const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(voicePayload)});
      if(response.ok){
        const result=await response.json(),url=result.audioUrl||result.url||'';
        if(url){await new Audio(url).play();return}
      }
    }catch(error){console.warn('Future voice API unavailable; using browser speech',error)}
  }
  if(!('speechSynthesis' in window)){showToast('当前浏览器不支持朗读');return}
  speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang='zh-CN';utterance.rate=.95;utterance.pitch=.94;
  const voice=speechSynthesis.getVoices().find((v)=>/zh|Chinese|Mandarin/i.test(v.lang+' '+v.name));
  if(voice)utterance.voice=voice;
  speechSynthesis.speak(utterance);
}

function updateVoiceUI(){
  const active=Boolean(state.settings.voiceMode);
  $('#voiceModeBtn').textContent=active?'关闭语音回复':'语音回复';
  const stateNode=$('#voiceState');
  if(stateNode){
    stateNode.classList.toggle('hidden',!active);
    const label=stateNode.querySelector('span');if(label)label.textContent=active?'语音回复已开启':'文字模式';
  }
  updateChatModeNote();
}
$('#voiceModeBtn').addEventListener('click',()=>{
  state.settings.voiceMode=!state.settings.voiceMode;updateVoiceUI();save();
  showToast(state.settings.voiceMode?'Future Me 会自动朗读回复':'已关闭语音回复');
});
$('#speakLastBtn').addEventListener('click',()=>{
  const last=state.messages.filter((x)=>x.role==='future'&&x.text!=='…').slice(-1)[0];
  if(last)speakText(last.text);
});

let recognition=null,recognitionActive=false;
let recorder=null,recordingStream=null,audioChunks=[];

function setListening(active,label='正在听'){
  recognitionActive=active;
  $('#micBtn').classList.toggle('listening',active);
  $('#voiceListening').classList.toggle('hidden',!active);
  const text=$('#voiceListening span');if(text)text.textContent=label;
}
function ensureRecognition(){
  if(recognition)return recognition;
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition)return null;
  recognition=new Recognition();recognition.lang='zh-CN';recognition.interimResults=true;recognition.continuous=false;
  recognition.onstart=()=>setListening(true,'正在听');
  recognition.onresult=(event)=>{
    let transcript='';
    for(let i=event.resultIndex;i<event.results.length;i++)transcript+=event.results[i][0].transcript;
    $('#chatInput').value=transcript;
  };
  recognition.onerror=()=>showToast('语音识别失败，可以继续打字');
  recognition.onend=()=>setListening(false);
  return recognition;
}
async function transcribeRecordedAudio(blob){
  const directCaps=window.P005_API&&window.P005_API.capabilities?window.P005_API.capabilities():{};
  if(directCaps.stt){
    try{
      const result=await window.P005_API.transcribe(blob);
      if(result&&result.text)return String(result.text).trim();
    }catch(error){console.warn('P005 direct STT unavailable; trying backend fallback',error)}
  }
  const endpoint=apiConfig('transcribeApi');
  if(!endpoint)return '';
  const form=new FormData();
  form.append('audio',blob,'future-me.webm');
  form.append('language','zh');
  form.append('context',JSON.stringify({module:MODULE_ID,name:state.profile.name||'',target:targetPhrase()}));
  const response=await fetch(endpoint,{method:'POST',body:form});
  if(!response.ok)throw new Error('transcribe api '+response.status);
  const result=await response.json();
  return String(result.text||result.transcript||'').trim();
}
async function startBackendRecording(){
  recordingStream=await navigator.mediaDevices.getUserMedia({audio:true});
  recorder=new MediaRecorder(recordingStream);
  audioChunks=[];
  recorder.ondataavailable=(event)=>{if(event.data&&event.data.size)audioChunks.push(event.data)};
  recorder.onstop=async()=>{
    setListening(true,'正在转成文字');
    const blob=new Blob(audioChunks,{type:recorder.mimeType||'audio/webm'});
    try{
      const transcript=await transcribeRecordedAudio(blob);
      if(transcript){$('#chatInput').value=transcript;$('#chatInput').focus()}
      else showToast('没有识别到文字');
    }catch(error){console.warn(error);showToast('语音转文字失败，可以继续打字')}
    finally{
      recordingStream&&recordingStream.getTracks().forEach((track)=>track.stop());
      recordingStream=null;recorder=null;setListening(false);
    }
  };
  recorder.start();
  setListening(true,'再次点击结束录音');
}
$('#micBtn').addEventListener('click',async()=>{
  const caps=window.P005_API&&window.P005_API.capabilities?window.P005_API.capabilities():{};
  if((caps.stt||apiConfig('transcribeApi'))&&navigator.mediaDevices&&window.MediaRecorder){
    if(recorder&&recorder.state==='recording'){recorder.stop();return}
    try{await startBackendRecording()}catch(error){console.warn(error);showToast('无法使用麦克风')}
    return;
  }
  const engine=ensureRecognition();
  if(!engine){showToast('尚未配置语音转文字，且浏览器不支持听写');return}
  if(recognitionActive)engine.stop(); else try{engine.start()}catch(_){}
});

function updateChatModeNote(){
  const caps=window.P005_API&&window.P005_API.capabilities?window.P005_API.capabilities():{};
  const bits=[targetPhrase()];
  bits.push(caps.chat?'BYOK':apiConfig('chatApi')?'LLM':'本地原型');
  if(caps.stt||apiConfig('transcribeApi'))bits.push('语音转文字');
  if(state.settings.voiceMode)bits.push((caps.tts||apiConfig('voiceApi'))?'真人感 TTS':'浏览器朗读');
  $('#chatModeNote').textContent=bits.join(' · ');
}

function apiCandidate(){
  return {
    baseUrl:clean($('#apiBaseUrl').value,''),
    apiKey:clean($('#apiKeyInput').value,''),
    chatModel:clean($('#apiChatModel').value,''),
    imageModel:clean($('#apiImageModel').value,''),
    ttsModel:clean($('#apiTtsModel').value,''),
    sttModel:clean($('#apiSttModel').value,''),
    voice:clean($('#apiVoice').value,'marin')
  };
}
function renderApiRuntime(){
  const configured=Boolean(window.P005_API&&window.P005_API.configured);
  const button=$('#apiBtn');
  if(button)button.classList.toggle('connected',configured);
  if($('#apiBtnText'))$('#apiBtnText').textContent=configured?'API 已接':'模型';
  updateChatModeNote();
  const caps=window.P005_API&&window.P005_API.capabilities?window.P005_API.capabilities():{};
  if($('#agePortraitBtn'))$('#agePortraitBtn').classList.toggle('hidden',!(state.currentPortrait&&(caps.image||apiConfig('imageApi'))));
}
function openApiSettings(){
  if(!window.P005_API)return;
  const s=window.P005_API.readDirect();
  $('#apiBaseUrl').value=s.baseUrl||'https://api.openai.com/v1';
  $('#apiKeyInput').value=s.apiKey||'';
  $('#apiChatModel').value=s.chatModel||'';
  $('#apiImageModel').value=s.imageModel||'';
  $('#apiTtsModel').value=s.ttsModel||'';
  $('#apiSttModel').value=s.sttModel||'';
  $('#apiVoice').value=s.voice||'marin';
  $('#apiKeyInput').type='password';$('#toggleApiKeyBtn').textContent='显示';
  $('#apiTestResult').classList.add('hidden');$('#apiTestResult').classList.remove('error');
  $('#apiModal').classList.remove('hidden');document.body.style.overflow='hidden';
}
function closeApiSettings(){
  $('#apiModal').classList.add('hidden');document.body.style.overflow='';
}
function validateApiCandidate(x){
  if(!x.baseUrl)return'需要 Base URL';
  if(!x.apiKey)return'需要 API Key';
  if(!x.chatModel)return'至少需要文字对话模型';
  return'';
}
async function testApiSettings(){
  const candidate=apiCandidate(),problem=validateApiCandidate(candidate),box=$('#apiTestResult');
  if(problem){box.textContent=problem;box.classList.remove('hidden');box.classList.add('error');return}
  $('#testApiBtn').disabled=true;box.classList.remove('hidden','error');box.textContent='正在测试文字对话接口…';
  try{
    const result=await window.P005_API.testDirect(candidate);
    box.textContent=result.ok?'连接成功 · '+(result.reply||'OK'):'接口已返回，但没有拿到文本';
    box.classList.toggle('error',!result.ok);
  }catch(error){
    const raw=String(error&&error.message||error);
    const friendly=/Failed to fetch|NetworkError|Load failed|AbortError/i.test(raw)
      ? '连接失败 · 浏览器无法访问该地址。请检查 Base URL、CORS、HTTPS/HTTP 或本地服务是否启动。'
      : '连接失败 · '+raw.slice(0,180);
    box.textContent=friendly;box.classList.add('error');
  }finally{$('#testApiBtn').disabled=false}
}
function saveApiSettings(){
  const candidate=apiCandidate(),problem=validateApiCandidate(candidate);
  if(problem){showToast(problem);return}
  window.P005_API.saveDirect(candidate);
  renderApiRuntime();closeApiSettings();showToast('模型设置只保存到当前标签页');
}
function clearApiSettings(){
  window.P005_API.clearDirect();renderApiRuntime();closeApiSettings();showToast('本次会话的模型设置已清除');
}
$('#apiBtn').addEventListener('click',openApiSettings);
$('[data-api-close]').forEach((button)=>button.addEventListener('click',closeApiSettings));
$('#toggleApiKeyBtn').addEventListener('click',()=>{
  const input=$('#apiKeyInput'),show=input.type==='password';input.type=show?'text':'password';$('#toggleApiKeyBtn').textContent=show?'隐藏':'显示';
});
$('#testApiBtn').addEventListener('click',testApiSettings);
$('#saveApiBtn').addEventListener('click',saveApiSettings);
$('#clearApiBtn').addEventListener('click',clearApiSettings);
window.addEventListener('p005:api-settings-changed',renderApiRuntime);
document.addEventListener('keydown',(event)=>{if(event.key==='Escape'&&!$('#apiModal').classList.contains('hidden'))closeApiSettings()});

function cardValues(){
  const p=state.profile;
  const raw=clean(p.values,[firstClause(p.positiveQualities,''),firstClause(p.people,''),firstClause(p.personalLife,'')].filter(Boolean).join('、')||'真实、连接、成长');
  return raw.split(/[、，,；;\/]/).map((x)=>x.replace(/^补充：/,'').trim()).filter(Boolean).slice(0,3);
}
function latestFutureQuote(){
  const item=state.messages.filter((x)=>x.role==='future'&&x.text!=='…').slice(-1)[0];
  return firstClause(item?item.text:(state.memory&&state.memory.futureVignette)||'未来不是答案，而是一种看清今天的距离。');
}
function wrapCanvasText(ctx,text,x,y,maxWidth,lineHeight,maxLines=99){
  const chars=Array.from(String(text||''));let line='',lines=[];
  for(const ch of chars){
    const test=line+ch;
    if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=ch;if(lines.length>=maxLines)break}
    else line=test;
  }
  if(line&&lines.length<maxLines)lines.push(line);
  lines.forEach((row,i)=>ctx.fillText(row,x,y+i*lineHeight));
  return y+lines.length*lineHeight;
}
const CARD_STYLES = {
  minimal:{label:'留白',bg:'#ffffff',ink:'#151515',muted:'#8a8a8f',accent:'#5b3cf6',line:'#e6e6e8'},
  warm:{label:'暖纸',bg:'#f7f1e8',ink:'#2e2924',muted:'#887d70',accent:'#b86a4b',line:'#ded2c4'},
  night:{label:'夜航',bg:'#151824',ink:'#f6f3ff',muted:'#aaa7bd',accent:'#9f8cff',line:'#36394a'},
  mint:{label:'青简',bg:'#eef7f2',ink:'#18322b',muted:'#688078',accent:'#2d7c69',line:'#cfe2d9'}
};
function selectedCardStyle(){
  const key=state.settings.shareCardStyle||'minimal';
  return CARD_STYLES[key]?key:'minimal';
}
function drawCardBackground(ctx,w,h,styleKey,style){
  ctx.fillStyle=style.bg;ctx.fillRect(0,0,w,h);
  if(styleKey==='warm'){
    ctx.strokeStyle=style.line;ctx.lineWidth=1;
    for(let y=230;y<h-120;y+=62){ctx.beginPath();ctx.moveTo(72,y);ctx.lineTo(w-72,y);ctx.stroke()}
  }else if(styleKey==='night'){
    ctx.fillStyle=style.accent;ctx.globalAlpha=.12;ctx.beginPath();ctx.arc(w-140,170,180,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  }else if(styleKey==='mint'){
    ctx.strokeStyle=style.accent;ctx.globalAlpha=.2;ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(w-110,h-130,210,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
  }
}
function renderShareCard(){
  const canvas=$('#shareCardCanvas');if(!canvas)return;
  const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
  const styleKey=selectedCardStyle(),style=CARD_STYLES[styleKey];
  drawCardBackground(ctx,w,h,styleKey,style);

  ctx.fillStyle=style.accent;ctx.fillRect(72,72,16,16);
  ctx.fillStyle=style.ink;ctx.font='700 30px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('FUTURE ME',112,93);
  ctx.fillStyle=style.muted;ctx.font='500 22px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('一个可能的未来，不是预测',72,150);

  ctx.fillStyle=style.ink;ctx.font='650 72px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
  let y=300;
  y=wrapCanvasText(ctx,clean(state.profile.name,'我')+' × '+targetPhrase()+'的我',72,y,900,92,2)+38;

  ctx.strokeStyle=style.line;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(72,y);ctx.lineTo(1008,y);ctx.stroke();y+=70;

  const qualities=(state.structuredAnswers.p001Qualities&&state.structuredAnswers.p001Qualities.selected)||[];
  if(qualities.length){
    ctx.fillStyle=style.muted;ctx.font='600 21px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText('现在的我',72,y);y+=50;
    ctx.fillStyle=style.ink;ctx.font='600 34px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
    y=wrapCanvasText(ctx,qualities.slice(0,6).join('  ·  '),72,y,900,50,2)+48;
  }

  ctx.fillStyle=style.muted;ctx.font='600 21px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('对我重要',72,y);y+=50;
  ctx.fillStyle=style.ink;ctx.font='600 38px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
  const vals=cardValues();
  y=wrapCanvasText(ctx,vals.join('  ·  '),72,y,900,54,2)+66;

  ctx.fillStyle=style.muted;ctx.font='600 21px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('未来片段',72,y);y+=48;
  ctx.fillStyle=style.ink;ctx.font='400 30px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
  y=wrapCanvasText(ctx,(state.memory&&state.memory.futureVignette)||'未来仍然有变化，但重要的东西没有完全丢掉。',72,y,900,48,4)+64;

  ctx.fillStyle=style.muted;ctx.font='600 21px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('Future Me 留给我的一句话',72,y);y+=54;
  ctx.fillStyle=style.ink;ctx.font='500 36px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
  wrapCanvasText(ctx,'“'+latestFutureQuote()+'”',72,y,900,56,4);

  ctx.fillStyle=style.muted;ctx.font='500 20px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText('P005 · '+new Date().toLocaleDateString('zh-CN'),72,h-86);
  $$('#cardStyleChoices button').forEach((button)=>button.classList.toggle('active',button.dataset.cardStyle===styleKey));
  syncAdmin('share_card_generated',{target:targetPhrase(),style:styleKey});
}
$$('[data-card-style]').forEach((button)=>button.addEventListener('click',()=>{
  state.settings.shareCardStyle=button.dataset.cardStyle;
  save();renderShareCard();
}));
function cardBlob(){
  return new Promise((resolve)=>$('#shareCardCanvas').toBlob(resolve,'image/png',.95));
}
$('#downloadCardBtn').addEventListener('click',async()=>{
  renderShareCard();
  const blob=await cardBlob();if(!blob)return;
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='Future-Me-card-'+new Date().toISOString().slice(0,10)+'.png';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),600);
  syncAdmin('share_card_saved',{style:selectedCardStyle()});showToast('卡片已保存');
});
$('#shareCardBtn').addEventListener('click',async()=>{
  renderShareCard();
  const blob=await cardBlob();if(!blob)return;
  const file=new File([blob],'future-me-card.png',{type:'image/png'});
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title:'Future Me',text:'和未来的自己聊了一次。'});syncAdmin('share_card_shared',{style:selectedCardStyle()});return}catch(error){if(error&&error.name==='AbortError')return}
  }
  showToast('当前浏览器不支持直接分享，可先保存图片');
});

function letterHtml(){
  const p=state.profile,action=clean($('#nextAction').value,'');
  const latest=state.messages.filter((x)=>x.role==='user').slice(-1)[0];
  const latestQuestion=latest?firstClause(latest.text,'未来会怎样'):'未来会怎样';
  return '<h3>给未来的 '+escapeHtml(clean(p.name,'我'))+'</h3>'+
    '<p>今天的我还在想“'+escapeHtml(latestQuestion)+'”。刚才我和一个 '+escapeHtml(targetPhrase())+'的可能版本聊了一会儿。它没有告诉我答案，只是把时间拉长了一点。</p>'+
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
renderApiRuntime();
updateChatModeNote();
emitSessionEvent('loaded',{hasSavedProfile:Boolean(Object.keys(state.profile).length),targetHorizon:horizonMode()});
syncAdmin('session_started',{targetHorizon:horizonMode(),intakeProtocol:protocolMode(),voiceId:runtimeConfig().voiceId||'marin',p001ProfileReused:Boolean((state.structuredAnswers.p001Qualities||{}).reusedFromP001||(state.structuredAnswers.p001Values||{}).reusedFromP001)});

})();
