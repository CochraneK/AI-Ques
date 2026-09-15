(() => {
'use strict';

const VERSION='2.1.0';
const K={chars:'bjtu.p004.characters.v2',threads:'bjtu.p004.threads.v2',memory:'bjtu.p004.memory.v2',observer:'bjtu.p004.observer.v2',active:'bjtu.p004.active.v2',p005:'bjtu.p005.state.v1'};
const adminMode=new URLSearchParams(location.search).get('admin')==='1';
const $=id=>document.getElementById(id);
const parse=(v,f)=>{try{return JSON.parse(v)}catch(_){return f}};
const read=(k,f)=>parse(localStorage.getItem(k)||'',f);
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
const text=v=>String(v==null?'':v).trim();
const short=(v,n=180)=>{const s=text(v);return s.length>n?s.slice(0,n-1)+'…':s};
const clamp=n=>Math.max(0,Math.min(100,n));
const uid=(p='id')=>p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);
const hash=s=>{let h=2166136261;for(const c of String(s||'')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const fmt=t=>new Date(t||Date.now()).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});

const DEFAULTS=[
{id:'mori',name:'Mori',avatar:'M',tagline:'安静、温柔，陪你把事情想清楚。',identity:'长期陪伴型朋友，不急着给答案，更在意理解你的处境。',personality:'温和、好奇、有边界感；不迎合，也不会把每件事都心理化。',scenario:'你们已经认识一段时间，可以从日常小事聊到重要选择。',style:'自然、简短、有停顿感；通常一次只追问一个真正有价值的问题。',first:'你来了。今天不用从重要的事开始，随便告诉我最近一个还留在脑子里的小片段。',distill:{enabled:false,status:'off'}},
{id:'nox',name:'Nox',avatar:'N',tagline:'锋利的辩论搭子，拆掉没注意到的前提。',identity:'直率的思考伙伴，擅长反问、找漏洞和做反事实。',personality:'冷静、好胜、诚实；不用安慰代替分析，但知道什么时候该收住。',scenario:'你们把聊天当作思想训练，可以争论但不做人身攻击。',style:'结论先行，短句，多反问；发现逻辑跳跃时直接指出。',first:'先说好，我不会因为你喜欢一个结论就同意它。扔一个你最近最拿不准的判断过来。',distill:{enabled:false,status:'off'}},
{id:'luma',name:'Luma',avatar:'L',tagline:'故事型 NPC，把现实问题换一个世界看。',identity:'擅长叙事和隐喻的旅伴，喜欢把抽象困境变成可探索的场景。',personality:'活泼、敏感、浪漫但不悬浮，尊重现实约束。',scenario:'你们像在共同写一部长篇故事，现实经验逐渐变成世界观素材。',style:'画面感强，偶尔隐喻，避免长篇独白；会把选择写成小场景。',first:'今天我们不分析。给我一个最近让你卡住的瞬间，我把它改写成一幕故事给你看。',distill:{enabled:false,status:'off'}}
];

const RELATIONSHIPS=[
  {value:'亲密关系',emoji:'♡',desc:'恋人 · 伴侣 · 暧昧对象',identity:'与你有明确亲密情感连接的人'},
  {value:'家庭关系',emoji:'⌂',desc:'家人 · 手足 · 长辈 / 晚辈',identity:'与你有家庭角色连接的人'},
  {value:'朋友关系',emoji:'☕',desc:'朋友 · 知己 · 老友',identity:'与你平等相处、彼此熟悉的朋友'},
  {value:'同伴关系',emoji:'◫',desc:'同学 · 同事 · 队友 · 搭档',identity:'与你处在共同环境或共同任务中的同伴'},
  {value:'引导关系',emoji:'↗',desc:'导师 · 前辈 · 教练 · 顾问',identity:'对你承担指导、启发或反馈角色的人'},
  {value:'专业关系',emoji:'◇',desc:'顾客 / 服务方 · 专家 · 助手',identity:'与你通过明确专业职责发生互动的人'},
  {value:'竞争 / 对立',emoji:'⚡',desc:'对手 · 竞争者 · 宿敌',identity:'与你存在明确竞争、冲突或对立张力的人'},
  {value:'陌生 / 未定',emoji:'◌',desc:'初识 · 偶遇 · 虚构世界相识',identity:'与你尚未建立稳定关系、关系仍在形成的人'}
];

const STRENGTH_GROUPS=[
  {group:'智慧',items:['好奇心','创造力','判断力','热爱学习','洞察力']},
  {group:'勇气',items:['勇敢','坚毅','诚实','热情']},
  {group:'仁爱',items:['爱','善良','社交智慧']},
  {group:'正义',items:['团队精神','公平','领导力']},
  {group:'节制',items:['宽恕','谦逊','审慎','自我调节']},
  {group:'超越',items:['审美','感恩','希望','幽默','精神性']}
];

const CHAT_STYLES=[
  {value:'温柔',emoji:'◡'},{value:'毒舌',emoji:'⌁'},{value:'冷静',emoji:'△'},{value:'热烈',emoji:'✦'},
  {value:'幽默',emoji:'☺'},{value:'克制',emoji:'—'},{value:'好奇',emoji:'?'},{value:'神秘',emoji:'◌'},
  {value:'浪漫',emoji:'☾'},{value:'直球',emoji:'→'},{value:'慢热',emoji:'…'},{value:'戏剧感',emoji:'✺'}
];

const INITIATIVES=['多听少问','会认真追问','会主动分享自己','会推动你去行动'];

const WORLDS=[
  {value:'现实日常',desc:'现在的城市、生活与琐事'},
  {value:'大学校园',desc:'课、社团、夜路与食堂'},
  {value:'工作世界',desc:'项目、野心、关系与选择'},
  {value:'漫长旅途',desc:'火车、陌生城市与偶遇'},
  {value:'近未来',desc:'一点科技，一点未知'},
  {value:'架空世界',desc:'规则可以由你们慢慢发现'}
];

const RANDOM_NAMES=['Mori','Nox','Luma','Ari','Kiro','Mina','Sora','Yun','Rin','Noa','小满','长风','阿岚','迟野','弥生'];
const RANDOM_AVATARS=['M','N','L','A','K','☾','✦','△','◌','羽','岚','野'];

function emptyCreatorDraft(){
  return {relationship:'',traits:[],styleTags:[],initiative:'',world:'',extra:'',legacyPersonality:'',legacyStyle:''};
}


function freshObserver(){return{version:2,big:{openness:50,conscientiousness:50,extraversion:50,agreeableness:50,sensitivity:50},clinical:{phqLike:0,gadLike:0,pclLike:0,capeLike:0},evidence:[],imports:{},safety:[],updatedAt:null}}
let chars=read(K.chars,null)||DEFAULTS;
let threads=read(K.threads,{})||{};
let memories=read(K.memory,{})||{};
let observer=read(K.observer,null)||freshObserver();
let activeId=localStorage.getItem(K.active)||chars[0]?.id;
let editingId=null;
let pendingFiles=[];
let creatorStep=0;
let creatorDraft=emptyCreatorDraft();
const skillCache=new Map();

function active(){return chars.find(c=>c.id===activeId)||chars[0]}
function thread(id=activeId){if(!threads[id])threads[id]=[];return threads[id]}
function memory(id=activeId){if(!memories[id])memories[id]=[];return memories[id]}
function sharedProfile(){return window.BJTU_PROFILE&&typeof window.BJTU_PROFILE.getFlat==='function'?window.BJTU_PROFILE.getFlat():((window.P00_CONTEXT&&window.P00_CONTEXT.profile)||{})}
function persist(){save(K.chars,chars);save(K.threads,threads);save(K.memory,memories);save(K.observer,observer);localStorage.setItem(K.active,activeId)}
function toast(msg){const e=$('toast');e.textContent=msg;e.classList.add('show');clearTimeout(window.__p004toast);window.__p004toast=setTimeout(()=>e.classList.remove('show'),1700)}

function openVault(){return new Promise((resolve,reject)=>{const q=indexedDB.open('bjtu-p004-skill-vault',1);q.onupgradeneeded=()=>{const db=q.result;if(!db.objectStoreNames.contains('skills'))db.createObjectStore('skills',{keyPath:'id'})};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
async function vaultPut(record){const db=await openVault();return new Promise((resolve,reject)=>{const tx=db.transaction('skills','readwrite');tx.objectStore('skills').put(record);tx.oncomplete=()=>{skillCache.set(record.id,record);resolve(record)};tx.onerror=()=>reject(tx.error)})}
async function vaultGet(id){if(!id)return null;if(skillCache.has(id))return skillCache.get(id);try{const db=await openVault();const r=await new Promise((resolve,reject)=>{const tx=db.transaction('skills','readonly');const q=tx.objectStore('skills').get(id);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error)});if(r)skillCache.set(id,r);return r}catch(_){return null}}
async function requestPersistentStorage(){try{if(navigator.storage&&navigator.storage.persist)await navigator.storage.persist()}catch(_){}}

function renderPersona(){const p=sharedProfile();$('personaName').textContent=p.name||'你的 Persona';$('personaAvatar').textContent=(p.name||'我').slice(0,1)}
function renderCharacters(){const wrap=$('characterList');wrap.replaceChildren();chars.forEach(c=>{const b=document.createElement('button');b.type='button';b.className='character-item'+(c.id===activeId?' active':'');b.onclick=()=>switchCharacter(c.id);const av=document.createElement('span');av.className='character-mini-avatar';av.textContent=c.avatar||c.name.slice(0,1);const copy=document.createElement('span');const strong=document.createElement('strong');strong.textContent=c.name;const small=document.createElement('small');small.textContent=c.tagline||c.identity||'自定义角色';copy.append(strong,small);b.append(av,copy);if(c.distill&&c.distill.status==='ready'){const mark=document.createElement('i');mark.className='skill-mark';mark.title='NVWA Skill ready';b.append(mark)}wrap.append(b)})}
async function renderActive(){const c=active();if(!c)return;$('activeAvatar').textContent=c.avatar||c.name.slice(0,1);$('activeName').textContent=c.name;$('activeTagline').textContent=c.tagline||c.identity||'';$('cardAvatar').textContent=c.avatar||c.name.slice(0,1);$('cardName').textContent=c.name;$('cardIdentity').textContent=c.identity||'未设置';$('cardPersonality').textContent=c.personality||'未设置';$('cardScenario').textContent=c.scenario||'未设置';$('cardStyle').textContent=c.style||'未设置';const ready=Boolean(c.distill&&c.distill.status==='ready'&&c.distill.skillId);$('distillBtn').classList.toggle('ready',ready);$('distillBtnText').textContent=ready?'已蒸馏':'蒸馏';$('skillStrip').classList.toggle('hidden',!ready);if(ready){const s=await vaultGet(c.distill.skillId);$('skillStripTitle').textContent=s&&s.source==='nvwa-api'?'NVWA Skill 已加载':'Character Skill 草稿已加载';$('skillStripMeta').textContent=s?((s.meta?.mentalModels||'?')+' 个心智模型 · '+(s.meta?.heuristics||'?')+' 条启发式 · 本地 Vault'):'本地 Vault'}renderMessages();renderMemory();renderCharacters()}
function renderMessages(){const log=$('chatLog');log.replaceChildren();const c=active(),list=thread();if(!list.length){const box=document.createElement('div');box.className='empty-chat';const av=document.createElement('div');av.className='empty-avatar';av.textContent=c.avatar||c.name.slice(0,1);const h=document.createElement('h3');h.textContent=c.name;const p=document.createElement('p');p.textContent=c.first||'开始一段新对话。';box.append(av,h,p);log.append(box);return}list.forEach(appendMessage);log.scrollTop=log.scrollHeight}
function appendMessage(m){const log=$('chatLog'),c=active();const row=document.createElement('article');row.className='message '+(m.role==='user'?'user':'assistant');const av=document.createElement('div');av.className='message-avatar';av.textContent=m.role==='user'?(sharedProfile().name||'我').slice(0,1):(c.avatar||c.name.slice(0,1));const body=document.createElement('div');body.className='message-body';const name=document.createElement('span');name.className='message-name';name.textContent=m.role==='user'?(sharedProfile().name||'你'):c.name;const bubble=document.createElement('div');bubble.className='bubble';bubble.textContent=m.text;const meta=document.createElement('div');meta.className='message-meta';meta.textContent=fmt(m.at)+(m.mode==='skill'?' · NVWA':m.mode==='safety'?' · safety':'');body.append(name,bubble,meta);row.append(av,body);log.append(row)}
function renderMemory(){const wrap=$('memoryList'),items=memory().slice().reverse();wrap.replaceChildren();$('memoryCount').textContent=String(items.length);if(!items.length){const e=document.createElement('span');e.className='memory-empty';e.textContent='还没有长期记忆。聊过几轮后，稳定偏好、事件和未完成话题会被压缩成记忆块。';wrap.append(e);return}items.slice(0,12).forEach(m=>{const d=document.createElement('div');d.className='memory-item';const p=document.createElement('p');p.textContent=m.text;const s=document.createElement('small');s.textContent=(m.source||'P004')+' · '+new Date(m.createdAt).toLocaleDateString('zh-CN');d.append(p,s);wrap.append(d)})}
function renderSourceCounts(){const counts={};observer.evidence.forEach(e=>counts[e.source]=(counts[e.source]||0)+1);const box=$('sourceCounts');box.replaceChildren();const entries=Object.entries(counts);if(!entries.length){const s=document.createElement('span');s.className='source-pill';s.textContent='等待交互';box.append(s);return}entries.forEach(([k,v])=>{const s=document.createElement('span');s.className='source-pill';s.textContent=k+' · '+v;box.append(s)})}
async function switchCharacter(id){activeId=id;persist();renderCharacters();await renderActive()}

function openModal(name){$(name+'Modal').classList.remove('hidden');document.body.style.overflow='hidden'}
function closeModal(name){$(name+'Modal').classList.add('hidden');document.body.style.overflow=''}
document.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click',()=>closeModal(x.dataset.close)));
document.addEventListener('keydown',e=>{if(e.key==='Escape')['character','distill','api','admin'].forEach(closeModal)});

function matchingStrengths(value){const source=String(value||'');return STRENGTH_GROUPS.flatMap(g=>g.items).filter(x=>source.includes(x))}
function matchingStyles(value){const source=String(value||'');return CHAT_STYLES.map(x=>x.value).filter(x=>source.includes(x)||((x==='温柔')&&source.includes('温和')))}
function chooseOne(list){return list[Math.floor(Math.random()*list.length)]}

function renderRelationshipGrid(){
  const box=$('relationshipGrid');box.replaceChildren();
  RELATIONSHIPS.forEach(item=>{
    const b=document.createElement('button');b.type='button';b.className='choice-card'+(creatorDraft.relationship===item.value?' selected':'');
    const emoji=document.createElement('span');emoji.className='choice-emoji';emoji.textContent=item.emoji;
    const strong=document.createElement('b');strong.textContent=item.value;
    const small=document.createElement('small');small.textContent=item.desc;
    b.append(emoji,strong,small);b.onclick=()=>{creatorDraft.relationship=item.value;renderCreatorStudio();window.setTimeout(()=>{if(creatorStep===0)setCreatorStep(1)},180)};box.append(b);
  });
}

function renderStrengthGrid(){
  const box=$('strengthGrid');box.replaceChildren();
  STRENGTH_GROUPS.forEach(group=>{
    const row=document.createElement('div');row.className='trait-group';
    const name=document.createElement('div');name.className='trait-group-name';name.textContent=group.group;
    const cloud=document.createElement('div');cloud.className='trait-cloud';
    group.items.forEach(value=>{
      const b=document.createElement('button');b.type='button';b.className='trait-chip'+(creatorDraft.traits.includes(value)?' selected':'');b.dataset.group=group.group;b.textContent=value;
      b.onclick=()=>{
        if(creatorDraft.traits.includes(value))creatorDraft.traits=creatorDraft.traits.filter(x=>x!==value);
        else if(creatorDraft.traits.length<6)creatorDraft.traits.push(value);
        else return toast('最多选 6 个核心品质');
        renderCreatorStudio();
      };cloud.append(b);
    });
    row.append(name,cloud);box.append(row);
  });
}

function renderStyleGrid(){
  const box=$('styleGrid');box.replaceChildren();
  CHAT_STYLES.forEach(item=>{
    const b=document.createElement('button');b.type='button';b.className='style-chip'+(creatorDraft.styleTags.includes(item.value)?' selected':'');
    const e=document.createElement('span');e.textContent=item.emoji;const t=document.createTextNode(item.value);b.append(e,t);
    b.onclick=()=>{
      if(creatorDraft.styleTags.includes(item.value))creatorDraft.styleTags=creatorDraft.styleTags.filter(x=>x!==item.value);
      else if(creatorDraft.styleTags.length<4)creatorDraft.styleTags.push(item.value);
      else return toast('聊天气质最多选 4 个');
      renderCreatorStudio();
    };box.append(b);
  });
  const mini=$('initiativeGrid');mini.replaceChildren();
  INITIATIVES.forEach(value=>{const b=document.createElement('button');b.type='button';b.className='mini-pill'+(creatorDraft.initiative===value?' selected':'');b.textContent=value;b.onclick=()=>{creatorDraft.initiative=value;renderCreatorStudio()};mini.append(b)});
}

function renderWorldGrid(){
  const box=$('worldGrid');box.replaceChildren();
  WORLDS.forEach(item=>{
    const b=document.createElement('button');b.type='button';b.className='world-card'+(creatorDraft.world===item.value?' selected':'');
    const strong=document.createElement('b');strong.textContent=item.value;const small=document.createElement('small');small.textContent=item.desc;b.append(strong,small);
    b.onclick=()=>{creatorDraft.world=item.value;renderCreatorStudio()};box.append(b);
  });
}

function creatorAuto(){
  const relation=RELATIONSHIPS.find(x=>x.value===creatorDraft.relationship)||RELATIONSHIPS[0];
  const world=WORLDS.find(x=>x.value===creatorDraft.world)||WORLDS[0];
  const traitText=creatorDraft.traits.join('、');
  const styleText=creatorDraft.styleTags.join('、');
  const extra=text($('charExtra')?.value)||creatorDraft.extra||'';
  const personality=creatorDraft.traits.length?(traitText+(extra?'；'+extra:'')):(creatorDraft.legacyPersonality||extra||'自然、有自己的判断，也愿意慢慢了解你');
  const style=(creatorDraft.styleTags.length||creatorDraft.initiative)?([styleText,creatorDraft.initiative].filter(Boolean).join('；')):(creatorDraft.legacyStyle||'自然、口语化，不把对话变成长篇说教');
  const identity=relation.identity+(extra?'。'+extra:'');
  const scenario='你们的故事主要发生在「'+world.value+'」里。'+world.desc+'。';
  const firstTemplates={
    '亲密关系':'你来了。今天最想让我先听哪一件事？',
    '家庭关系':'回来了。最近有什么事，你一直想找个家里人说说？',
    '朋友关系':'你来了。今天想先聊点轻松的，还是直接进正题？',
    '同伴关系':'来，对一下近况。最近哪件事最值得我们一起往前推？',
    '引导关系':'先不急着下结论。最近哪件事最值得我们认真拆一遍？',
    '专业关系':'好，我们从你现在最需要解决的事情开始。',
    '竞争 / 对立':'终于来了。说吧，这次我们要在哪件事上分个高下？',
    '陌生 / 未定':'我们还不算真正认识。那就从一件你愿意让我知道的小事开始？'
  };
  return {personality,style,identity,scenario,first:firstTemplates[relation.value]||'嗨。今天想聊什么？',world:world.value,relationship:relation.value};
}

function syncCreatorAutoFields(){
  const auto=creatorAuto();
  ['charIdentity','charScenario','charFirst'].forEach(id=>{
    const el=$(id);if(el&&el.dataset.manual!=='1')el.value=id==='charIdentity'?auto.identity:id==='charScenario'?auto.scenario:auto.first;
  });
  return auto;
}

function renderCreatorPreview(){
  const auto=syncCreatorAutoFields(),name=text($('charName').value),avatar=text($('charAvatar').value);
  $('creatorAvatarPreview').textContent=avatar||(name?name.slice(0,1):'?');
  $('creatorNamePreview').textContent=name||'一个还没有名字的人';
  $('creatorRelationPreview').textContent=creatorDraft.relationship||'还没选关系';
  const bits=[...creatorDraft.traits.slice(0,2),...creatorDraft.styleTags.slice(0,2)];
  $('creatorLinePreview').textContent=bits.length?bits.join(' × '):'选几个标签，TA 会慢慢长出来。';
  const tags=$('creatorTraitPreview');tags.replaceChildren();
  [...creatorDraft.traits,...creatorDraft.styleTags].slice(0,6).forEach(v=>{const s=document.createElement('span');s.textContent=v;tags.append(s)});
}

function setCreatorStep(step){
  creatorStep=Math.max(0,Math.min(3,step));
  document.querySelectorAll('.creator-page').forEach((p,i)=>p.classList.toggle('active',i===creatorStep));
  document.querySelectorAll('#creatorSteps i').forEach((d,i)=>d.classList.toggle('active',i<=creatorStep));
  $('creatorBackBtn').classList.toggle('hidden',creatorStep===0);
  $('creatorNextBtn').classList.toggle('hidden',creatorStep===3);
  $('saveCharacterBtn').classList.toggle('hidden',creatorStep!==3);
}

function renderCreatorStudio(){
  renderRelationshipGrid();renderStrengthGrid();renderStyleGrid();renderWorldGrid();renderCreatorPreview();setCreatorStep(creatorStep);
}

function openEditor(id){
  editingId=id||null;
  const existing=id?chars.find(x=>x.id===id):null;
  creatorDraft=emptyCreatorDraft();
  if(existing){
    creatorDraft.relationship=existing.relationship||RELATIONSHIPS.find(x=>(existing.identity||'').includes(x.value))?.value||'朋友关系';
    creatorDraft.traits=Array.isArray(existing.traits)?existing.traits.slice(0,6):matchingStrengths(existing.personality).slice(0,6);
    creatorDraft.styleTags=Array.isArray(existing.styleTags)?existing.styleTags.slice(0,4):matchingStyles((existing.style||'')+' '+(existing.personality||'')).slice(0,4);
    creatorDraft.initiative=existing.initiative||INITIATIVES.find(x=>(existing.style||'').includes(x))||'';
    creatorDraft.world=existing.world||WORLDS.find(x=>(existing.scenario||'').includes(x.value))?.value||'现实日常';
    creatorDraft.extra=existing.extra||'';
    creatorDraft.legacyPersonality=existing.personality||'';
    creatorDraft.legacyStyle=existing.style||'';
  }
  creatorStep=0;
  $('characterModalTitle').textContent=id?'重新捏一捏 '+(existing?.name||'这个角色'):'捏一个会和你长期聊天的人。';
  $('charName').value=existing?.name||'';
  $('charAvatar').value=existing?.avatar||'';
  $('charExtra').value=existing?.extra||'';
  $('charIdentity').value=existing?.identity||'';$('charScenario').value=existing?.scenario||'';$('charFirst').value=existing?.first||'';
  ['charIdentity','charScenario','charFirst'].forEach(key=>$(key).dataset.manual=existing?'1':'0');
  $('deleteCharacterBtn').classList.toggle('hidden',!id);
  renderCreatorStudio();openModal('character');
}

function creatorNext(){
  if(creatorStep===0&&!creatorDraft.relationship)return toast('先选一种你们之间的关系');
  if(creatorStep===1&&!creatorDraft.traits.length)return toast('至少给 TA 一个核心品质');
  if(creatorStep===2&&!creatorDraft.styleTags.length&&!creatorDraft.initiative)return toast('选一点聊天气质，TA 才会有声音');
  if(creatorStep<3)setCreatorStep(creatorStep+1);
}

function randomizeCharacter(){
  creatorDraft.relationship=chooseOne(RELATIONSHIPS).value;
  creatorDraft.traits=[...STRENGTH_GROUPS.flatMap(g=>g.items)].sort(()=>Math.random()-.5).slice(0,4);
  creatorDraft.styleTags=[...CHAT_STYLES.map(x=>x.value)].sort(()=>Math.random()-.5).slice(0,2);
  creatorDraft.initiative=chooseOne(INITIATIVES);creatorDraft.world=chooseOne(WORLDS).value;
  const name=chooseOne(RANDOM_NAMES);$('charName').value=name;$('charAvatar').value=chooseOne(RANDOM_AVATARS);
  ['charIdentity','charScenario','charFirst'].forEach(key=>$(key).dataset.manual='0');
  renderCreatorStudio();toast('给你摇了一个意外角色');
}

function saveCharacter(){
  const name=text($('charName').value);if(!name){setCreatorStep(3);toast('最后给 TA 一个名字');return}
  if(!creatorDraft.relationship)creatorDraft.relationship='朋友关系';
  if(!creatorDraft.world)creatorDraft.world='现实日常';
  creatorDraft.extra=text($('charExtra').value);
  const auto=creatorAuto();
  const patch={
    name,avatar:text($('charAvatar').value)||name.slice(0,1),
    identity:text($('charIdentity').value)||auto.identity,
    personality:auto.personality,
    scenario:text($('charScenario').value)||auto.scenario,
    style:auto.style,
    first:text($('charFirst').value)||auto.first,
    relationship:creatorDraft.relationship,traits:[...creatorDraft.traits],styleTags:[...creatorDraft.styleTags],
    initiative:creatorDraft.initiative,world:creatorDraft.world,extra:creatorDraft.extra,
    archetype:[creatorDraft.traits[0],creatorDraft.styleTags[0]].filter(Boolean).join(' · ')
  };
  if(editingId){const target=chars.find(x=>x.id===editingId);Object.assign(target,patch);target.tagline=[patch.relationship,...patch.traits.slice(0,2)].join(' · ')}
  else{patch.id=uid('npc');patch.tagline=[patch.relationship,...patch.traits.slice(0,2)].join(' · ');patch.distill={enabled:false,status:'off'};chars.push(patch);activeId=patch.id}
  persist();closeModal('character');renderCharacters();renderActive();toast(editingId?'角色已经变了一点':'TA 出现了');
}
function deleteCharacter(){if(!editingId||chars.length<=1){toast('至少保留一个角色');return}const idx=chars.findIndex(c=>c.id===editingId);if(idx<0)return;const removed=chars.splice(idx,1)[0];delete threads[removed.id];delete memories[removed.id];activeId=chars[0].id;persist();closeModal('character');renderCharacters();renderActive();toast('角色已删除')}

function publicCharacter(c){return{id:c.id,name:c.name,identity:c.identity,personality:c.personality,scenario:c.scenario,style:c.style,first:c.first,relationship:c.relationship||'',traits:c.traits||[],styleTags:c.styleTags||[],initiative:c.initiative||'',world:c.world||'',archetype:c.archetype||''}}
function slug(v){return text(v).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g,'-').replace(/^-|-$/g,'')||'character'}
async function readMaterials(){const out=[];const pasted=text($('distillMaterial').value);if(pasted)out.push({name:'pasted-material.md',type:'text/markdown',text:pasted});for(const f of pendingFiles){try{out.push({name:f.name,type:f.type||'text/plain',text:(await f.text()).slice(0,120000)})}catch(_){}}return out}
function openDistill(){const c=active();$('distillEnabled').checked=Boolean(c.distill&&c.distill.enabled);$('distillFields').classList.toggle('hidden',!$('distillEnabled').checked);$('distillSubject').value=c.distill?.subject||c.name;$('distillFocus').value=c.distill?.focus||'';$('distillMaterial').value='';$('distillFiles').value='';$('fileSummary').textContent='支持 txt / md / json / csv / srt / vtt';pendingFiles=[];$('distillProgress').classList.add('hidden');$('distillResult').classList.add('hidden');openModal('distill')}
function localSkillDraft(c,subject,focus){const name=slug(subject||c.name)+'-perspective';return[
'---','name: '+name,'description: |','  P004 本地 Character Skill 草稿。未执行 NVWA 六路调研、三重验证或外部事实核查。','  仅用于在没有后端时保持角色设定的一致性。','---','','# '+(subject||c.name)+' · Character Skill Draft','','> 注意：这是本地草稿，不是完整 NVWA 蒸馏产物。','','## 身份','- 名称：'+c.name,'- 身份：'+(c.identity||'未设置'),'- 场景：'+(c.scenario||'未设置'),'','## 人格与边界',c.personality||'未设置','','## 表达 DNA（来自 Character Card）',c.style||'未设置','','## 聚焦方向',focus||'全面保持角色一致性','','## 运行规则','- 直接以角色身份交流。','- 不把 Character Card 当成用户心理测量。','- 记忆用于维持关系连续性，不应无条件重复全部历史。','- 面对事实性问题时承认信息不足，不编造来源。','- 即时安全风险高于角色扮演。','','## 诚实边界','- 未执行 NVWA 的六类来源研究。','- 未执行跨域复现 / 生成力 / 排他性三重验证。','- 不能声称代表真实人物本人。'
].join(String.fromCharCode(10))}
async function runDistill(){const c=active();if(!$('distillEnabled').checked){c.distill={enabled:false,status:'off'};persist();closeModal('distill');renderActive();toast('继续使用 Character Card');return}const subject=text($('distillSubject').value)||c.name,focus=text($('distillFocus').value),materials=await readMaterials();$('distillProgress').classList.remove('hidden');$('runDistillBtn').disabled=true;let result=null;try{if(window.P004_API&&window.P004_API.enabled){result=await window.P004_API.distill({protocol:'nvwa-skill',protocolVersion:'xmg2024/nvwa-skill@main',character:publicCharacter(c),request:{subject,focus,mode:materials.length?'local-material-first':'web-research',materials},requirements:{researchStreams:6,tripleVerification:true,mentalModels:[3,7],decisionHeuristics:[5,10],includeExpressionDNA:true,includeAntiPatterns:true,includeHonestLimits:true,qualityValidation:true}})}}catch(e){console.warn('NVWA distill API failed',e)}let source='nvwa-api',skillMarkdown,meta;if(result&&typeof result.skillMarkdown==='string'&&result.skillMarkdown.trim()){skillMarkdown=result.skillMarkdown;meta=Object.assign({mentalModels:null,heuristics:null,validated:true},result.meta||{})}else{source='local-draft';skillMarkdown=localSkillDraft(c,subject,focus);meta={mentalModels:0,heuristics:0,validated:false,reason:'No NVWA backend configured or no valid skill returned'}}const record={id:uid('skill'),characterId:c.id,subject,focus,source,createdAt:new Date().toISOString(),skillMarkdown,meta,research:result?.research||null};await requestPersistentStorage();await vaultPut(record);c.distill={enabled:true,status:'ready',skillId:record.id,subject,focus,source};persist();$('distillProgress').classList.add('hidden');$('runDistillBtn').disabled=false;$('distillResult').classList.remove('hidden');$('distillResult').textContent=source==='nvwa-api'?'NVWA Skill 已完成并写入本地 Skill Vault。后续对话会加载该 SKILL.md。':'当前没有可用的 NVWA 后端，因此只生成了明确标注的本地 Character Skill 草稿；没有伪装成完整蒸馏。';renderActive();toast(source==='nvwa-api'?'NVWA Skill 已就绪':'已生成本地 Skill 草稿')}
async function relevantSkill(c){return c&&c.distill&&c.distill.enabled&&c.distill.status==='ready'?vaultGet(c.distill.skillId):null}

const SAFETY_TERMS=['想死','不想活','结束生命','自杀','伤害自己','割腕','跳楼','活不下去','杀了自己'];
function urgentSafety(v){const t=String(v||'').toLowerCase();return SAFETY_TERMS.some(w=>t.includes(w))}
function safetyReply(){return '你刚才提到的内容让我更关心你此刻是否安全。先暂停角色聊天：如果你正在准备伤害自己、已经有具体计划，或觉得自己可能无法保证安全，请立刻联系当地急救服务、危机热线，或去到一个可信任的人身边。你也可以只告诉我：你现在是安全的，还是有立即危险？'}
function localReply(input,c){const t=input.toLowerCase(),style=(c.style||'')+' '+(c.personality||'');if(/反问|辩论|漏洞/.test(style))return '先别急着回答。你现在默认成立、但其实还没有验证的前提是什么？';if(/故事|隐喻|画面/.test(style))return '我把它换成一个画面：你站在两扇门前，一扇写着“熟悉但可控”，另一扇写着“未知但可能长大”。真正让你停住的，是哪一种失去？';if(/温和|陪伴|理解/.test(style)&&/难过|焦虑|压力|累|烦|失眠/.test(t))return '我先不急着解释它。最近一次这种感觉最明显，是发生在什么具体场景里？';const mem=memory();const hook=mem.length?'我还记得你之前提过“'+short(mem[mem.length-1].text,42)+'”。':' ';return hook+'你这句话里，我更在意的不是结论，而是它为什么在现在变得重要。愿意再往前说一点吗？'}
function showTyping(){const log=$('chatLog'),row=document.createElement('article');row.id='typingRow';row.className='message assistant';const av=document.createElement('div');av.className='message-avatar';av.textContent=active().avatar||active().name.slice(0,1);const body=document.createElement('div');body.className='message-body';const n=document.createElement('span');n.className='message-name';n.textContent=active().name;const bubble=document.createElement('div');bubble.className='bubble';const dots=document.createElement('div');dots.className='typing';dots.innerHTML='<i></i><i></i><i></i>';bubble.append(dots);body.append(n,bubble);row.append(av,body);log.append(row);log.scrollTop=log.scrollHeight}
function removeTyping(){const x=$('typingRow');if(x)x.remove()}
function memoryContext(){return memory().slice(-8).map(x=>x.text)}
async function maybeRemember(input,source){if(input.length<20)return;const list=memory(),candidate=short(input.replace(/\s+/g,' '),190);if(list.some(x=>x.text===candidate))return;let value=candidate;try{if(window.P004_API&&window.P004_API.enabled&&thread().filter(m=>m.role==='user').length%4===0){const r=await window.P004_API.remember({character:publicCharacter(active()),recentMessages:thread().slice(-12),existing:list.slice(-24)});if(r&&typeof r.memory==='string')value=short(r.memory,240)}}catch(_){}list.push({id:uid('mem'),text:value,source,createdAt:Date.now()});if(list.length>60)list.splice(0,list.length-60);persist();renderMemory()}

const WORDS={openness:['好奇','新鲜','探索','创意','艺术','旅行','想象','可能性','学习','故事'],conscientiousness:['计划','安排','完成','目标','清单','坚持','规律','效率','准备'],extraversion:['朋友','聚会','聊天','认识人','一起','团队','社交','分享','见面'],agreeableness:['理解','照顾','体谅','帮助','倾听','关系','支持','合作','在意别人'],sensitivity:['担心','焦虑','紧张','难过','压力','敏感','害怕','反复想','睡不着','内耗']};
const CLIN={phqLike:['低落','没兴趣','睡不好','失眠','疲惫','自责','没用','无法专注'],gadLike:['焦虑','紧张','担心','放松不了','烦躁','最坏','出事'],pclLike:['闪回','噩梦','避开','不想提','高度警觉','容易受惊','麻木'],capeLike:['被监视','针对我','思想被控制','别人能听到我的想法','听到声音','看到别人看不到']};
function hits(t,arr){return arr.reduce((n,w)=>n+(t.includes(w)?1:0),0)}
function analyzeEvidence(input,source,context,quiet){const t=input.toLowerCase();Object.entries(WORDS).forEach(([k,arr])=>{const h=hits(t,arr);if(h){observer.big[k]=clamp(observer.big[k]+Math.min(4,h*1.4));observer.evidence.push({id:uid('ev'),source,context,dimension:k,quote:short(input),at:Date.now(),strength:Math.min(1,.35+h*.12)})}});Object.entries(CLIN).forEach(([k,arr])=>{const h=hits(t,arr);if(h){observer.clinical[k]=clamp(observer.clinical[k]+Math.min(6,h*2));observer.evidence.push({id:uid('ev'),source,context,dimension:k,quote:short(input),at:Date.now(),strength:Math.min(1,.3+h*.14)})}});observer.updatedAt=new Date().toISOString();if(observer.evidence.length>500)observer.evidence.splice(0,observer.evidence.length-500);if(!quiet){persist();renderSourceCounts()}}
function importP005(){const raw=read(K.p005,null);if(!raw)return;const signature=hash(JSON.stringify({profile:raw.profile,messages:raw.messages}));if(observer.imports.P005===signature)return;observer.evidence=observer.evidence.filter(e=>e.source!=='P005');const p=raw.profile||{};['currentWork','people','proud','lowPoint','turningPoint','futureWork','dailyLife','values','decision'].forEach(k=>{if(p[k])analyzeEvidence(String(p[k]),'P005','Future You open response',true)});(raw.messages||[]).filter(m=>m.role==='user'&&m.text).forEach(m=>analyzeEvidence(m.text,'P005','Future You chat',true));observer.imports.P005=signature;persist();renderSourceCounts()}
function collectP005(){const raw=read(K.p005,null);if(!raw)return[];const out=[];Object.values(raw.profile||{}).forEach(v=>{if(typeof v==='string'&&v.trim())out.push(v)});(raw.messages||[]).filter(m=>m.role==='user'&&m.text).forEach(m=>out.push(m.text));return out.slice(-120)}
function mergeObserver(p){if(p.big)Object.keys(observer.big).forEach(k=>{if(Number.isFinite(Number(p.big[k])))observer.big[k]=clamp(Number(p.big[k]))});if(p.clinical)Object.keys(observer.clinical).forEach(k=>{if(Number.isFinite(Number(p.clinical[k])))observer.clinical[k]=clamp(Number(p.clinical[k]))});if(Array.isArray(p.evidence))p.evidence.slice(-120).forEach(e=>observer.evidence.push({id:uid('ev'),source:e.source||'API',context:e.context||'observer',dimension:e.dimension||'unknown',quote:short(e.quote||''),at:e.at||Date.now(),strength:e.strength||.5}));observer.updatedAt=new Date().toISOString()}
async function backgroundObserve(){importP005();if(!(window.P004_API&&window.P004_API.enabled))return;try{const r=await window.P004_API.observe({sources:{P004:Object.values(threads).flat().filter(m=>m.role==='user').map(m=>m.text).slice(-120),P005:collectP005()},existing:observer});if(r&&r.profile){mergeObserver(r.profile);persist();renderSourceCounts()}}catch(e){console.warn('P004 observer API failed',e)}}

async function send(input){input=text(input);if(!input)return;const c=active(),list=thread();list.push({id:uid('m'),role:'user',text:input,at:Date.now(),source:'P004'});analyzeEvidence(input,'P004','character chat');persist();renderMessages();$('messageInput').value='';resizeInput();$('sendBtn').disabled=true;await maybeRemember(input,'P004');if(urgentSafety(input)){const reply=safetyReply();list.push({id:uid('m'),role:'assistant',text:reply,at:Date.now(),mode:'safety',source:'P004'});observer.safety.push({at:Date.now(),source:'P004',kind:'explicit-self-harm-language',quote:short(input,160)});persist();renderMessages();$('sendBtn').disabled=false;$('messageInput').focus();backgroundObserve();return}showTyping();const skill=await relevantSkill(c);let reply=null;try{if(window.P004_API&&window.P004_API.enabled){const r=await window.P004_API.chat({version:VERSION,character:publicCharacter(c),skill:skill?{id:skill.id,source:skill.source,markdown:skill.skillMarkdown}:null,persona:sharedProfile(),memory:memoryContext(),messages:list.slice(-24).map(m=>({role:m.role,text:m.text})),observerHint:{doNotExposeClinicalLabels:true},safety:{roleplayMustYieldToSafety:true}});if(r&&typeof r.reply==='string')reply=r.reply.trim()}}catch(e){console.warn('P004 chat API failed',e);if(window.P004_API?.mode==='openai-compatible')toast('API 调用失败，已暂用本地回复 · '+short(e.message||'',72))}removeTyping();if(!reply)reply=localReply(input,c);list.push({id:uid('m'),role:'assistant',text:reply,at:Date.now(),mode:skill?'skill':'card',source:'P004'});persist();renderMessages();$('sendBtn').disabled=false;$('messageInput').focus();backgroundObserve()}

function renderAdmin(){importP005();const names={openness:'Openness',conscientiousness:'Conscientiousness',extraversion:'Extraversion',agreeableness:'Agreeableness',sensitivity:'Emotional sensitivity'};const bg=$('bigFiveGrid');bg.replaceChildren();Object.entries(observer.big).forEach(([k,v])=>{const row=document.createElement('div');row.className='metric-row';const n=document.createElement('strong');n.textContent=names[k];const bar=document.createElement('span');bar.className='metric-bar';const fill=document.createElement('i');fill.style.width=Math.round(v)+'%';bar.append(fill);const num=document.createElement('em');num.textContent=Math.round(v);row.append(n,bar,num);bg.append(row)});const conf=Math.min(95,Math.round(30+observer.evidence.length*1.1));$('observerConfidence').textContent='confidence '+conf+'% · evidence '+observer.evidence.length;const cn={phqLike:'PHQ-related',gadLike:'GAD-related',pclLike:'PCL-related',capeLike:'CAPE-related'},cg=$('clinicalGrid');cg.replaceChildren();Object.entries(observer.clinical).forEach(([k,v])=>{const d=document.createElement('div');d.className='clinical-tile';const s=document.createElement('strong');s.textContent=cn[k];const b=document.createElement('b');b.textContent=Math.round(v);const p=document.createElement('p');p.textContent='开放式对话线索强度；不能当作正式量表分数、阈值或诊断。';d.append(s,b,p);cg.append(d)});const ev=$('evidenceList');ev.replaceChildren();observer.evidence.slice().reverse().slice(0,120).forEach(e=>{const row=document.createElement('div');row.className='evidence-row';const src=document.createElement('strong');src.textContent=e.source;const dim=document.createElement('span');dim.textContent=e.dimension;const q=document.createElement('p');q.textContent=e.quote;const tm=document.createElement('em');tm.textContent=new Date(e.at).toLocaleDateString('zh-CN');row.append(src,dim,q,tm);ev.append(row)});const counts={};observer.evidence.forEach(e=>counts[e.source]=(counts[e.source]||0)+1);$('evidenceSummary').textContent=Object.entries(counts).map(([k,v])=>k+' '+v).join(' · ')||'暂无证据'}
async function exportSkill(){const c=active(),s=await relevantSkill(c);if(!s){toast('这个角色还没有本地 Skill');return}const suggested=slug(c.name)+'-SKILL.md';if(window.showSaveFilePicker){try{const h=await window.showSaveFilePicker({suggestedName:suggested,types:[{description:'Markdown Skill',accept:{'text/markdown':['.md']}}]});const w=await h.createWritable();await w.write(s.skillMarkdown);await w.close();toast('SKILL.md 已保存到本地文件');return}catch(e){if(e&&e.name==='AbortError')return}}const blob=new Blob([s.skillMarkdown],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=suggested;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast('已导出 SKILL.md')}

function renderRuntime(){
  const api=window.P004_API,mode=api&&api.mode;
  const direct=api&&api.readDirect?api.readDirect():{};
  const connected=mode==='backend'||mode==='openai-compatible';
  $('apiBtn').classList.toggle('connected',connected);
  $('apiBtnText').textContent=mode==='openai-compatible'?(direct.model||'API'):mode==='backend'?'Server API':'接入 API';
  $('runtimeBadge').innerHTML=mode==='openai-compatible'?'<i></i> BYOK':mode==='backend'?'<i></i> backend':'<i></i> local first';
}

function openApiSettings(){
  const s=window.P004_API?.readDirect?.()||{};
  $('apiBaseUrl').value=s.baseUrl||'https://api.openai.com/v1';
  $('apiKeyInput').value=s.apiKey||'';
  $('apiModel').value=s.model||'';
  $('apiKeyInput').type='password';$('toggleApiKeyBtn').textContent='显示';
  $('apiTestResult').classList.add('hidden');$('apiTestResult').classList.remove('error');
  document.querySelectorAll('.api-presets .preset').forEach(b=>b.classList.toggle('active',Boolean(b.dataset.apiBase&&b.dataset.apiBase===$('apiBaseUrl').value)));
  openModal('api');
}

function apiCandidate(){return{baseUrl:text($('apiBaseUrl').value),apiKey:text($('apiKeyInput').value),model:text($('apiModel').value)}}
function validateApiCandidate(x){if(!x.baseUrl)return'需要 Base URL';if(!x.apiKey)return'需要 API Key';if(!x.model)return'需要 Model';return''}

function formatApiTestError(error){
  const e=error||{};
  const head=e.status?('HTTP '+e.status+(e.statusText?' '+e.statusText:'')):(e.kind==='timeout'?'TIMEOUT':e.kind==='network'?'NETWORK':'ERROR');
  const lines=['连接失败 · '+head];
  if(e.endpoint)lines.push('Endpoint: '+e.endpoint);
  if(e.message)lines.push('Message: '+e.message);
  if(e.detail)lines.push('Detail: '+short(e.detail,1200));
  if(e.kind==='network')lines.push('Hint: 常见原因是 CORS、网络/DNS、证书问题，或该兼容服务不允许浏览器直连。');
  if(e.status===401||e.status===403)lines.push('Hint: 检查 API Key、账户权限或服务商鉴权格式。');
  if(e.status===404)lines.push('Hint: 检查 Base URL；通常应填到 /v1，系统会自动补 /chat/completions。');
  if(e.status===429)lines.push('Hint: 可能是额度、限流或账户余额问题。');
  return lines.join('\n');
}

async function testApi(){
  const candidate=apiCandidate(),problem=validateApiCandidate(candidate),box=$('apiTestResult');
  if(problem){box.textContent=problem;box.classList.remove('hidden');box.classList.add('error');return}
  $('testApiBtn').disabled=true;box.classList.remove('hidden','error');box.textContent='正在测试…\n会发送一条“只回复 OK”的最小请求。';
  try{
    const r=await window.P004_API.testDirect(candidate);
    if(r&&r.ok){
      box.textContent=['连接成功 ✓','Endpoint: '+(r.endpoint||candidate.baseUrl),'Model: '+candidate.model,'Reply: '+(r.reply||'OK')].join('\n');
      box.classList.remove('error');
    }else{
      box.textContent=formatApiTestError(r&&r.error?r.error:{message:'接口已返回，但没有拿到可用文本'});
      box.classList.add('error');
    }
  }catch(e){
    box.textContent=formatApiTestError({kind:'client',message:e.message||String(e)});
    box.classList.add('error');
  }finally{$('testApiBtn').disabled=false}
}

function saveApi(){
  const candidate=apiCandidate(),problem=validateApiCandidate(candidate);
  if(problem){toast(problem);return}
  window.P004_API.saveDirect(candidate);renderRuntime();closeModal('api');toast('API 只保存到当前标签页');
}
function clearApi(){window.P004_API.clearDirect();$('apiKeyInput').value='';$('apiModel').value='';renderRuntime();closeModal('api');toast('本次会话的 API 配置已清除')}

function resizeInput(){const el=$('messageInput');el.style.height='auto';el.style.height=Math.min(160,el.scrollHeight)+'px'}
$('composer').addEventListener('submit',e=>{e.preventDefault();send($('messageInput').value)});
$('messageInput').addEventListener('input',resizeInput);
$('messageInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('composer').requestSubmit()}});
['newCharacterBtn','railNewBtn'].forEach(id=>$(id).addEventListener('click',()=>openEditor(null)));
['editCharacterBtn','editCardBtn'].forEach(id=>$(id).addEventListener('click',()=>openEditor(activeId)));
$('creatorNextBtn').addEventListener('click',creatorNext);
$('creatorBackBtn').addEventListener('click',()=>setCreatorStep(creatorStep-1));
$('randomizeNpcBtn').addEventListener('click',randomizeCharacter);
$('saveCharacterBtn').addEventListener('click',saveCharacter);
$('deleteCharacterBtn').addEventListener('click',deleteCharacter);
['charName','charAvatar','charExtra'].forEach(id=>$(id).addEventListener('input',()=>{creatorDraft.extra=text($('charExtra').value);renderCreatorPreview()}));
['charIdentity','charScenario','charFirst'].forEach(id=>$(id).addEventListener('input',e=>{e.target.dataset.manual='1';renderCreatorPreview()}));
$('apiBtn').addEventListener('click',openApiSettings);
$('toggleApiKeyBtn').addEventListener('click',()=>{const input=$('apiKeyInput'),show=input.type==='password';input.type=show?'text':'password';$('toggleApiKeyBtn').textContent=show?'隐藏':'显示'});
document.querySelectorAll('.api-presets .preset').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.api-presets .preset').forEach(x=>x.classList.remove('active'));btn.classList.add('active');if(btn.dataset.apiBase)$('apiBaseUrl').value=btn.dataset.apiBase}));
$('testApiBtn').addEventListener('click',testApi);
$('saveApiBtn').addEventListener('click',saveApi);
$('clearApiBtn').addEventListener('click',clearApi);
window.addEventListener('p004:api-settings-changed',renderRuntime);
$('distillBtn').addEventListener('click',openDistill);
$('distillEnabled').addEventListener('change',e=>$('distillFields').classList.toggle('hidden',!e.target.checked));
$('distillFiles').addEventListener('change',e=>{pendingFiles=Array.from(e.target.files||[]);$('fileSummary').textContent=pendingFiles.length?(pendingFiles.length+' 个文件 · '+pendingFiles.map(f=>f.name).join(' / ')):'支持 txt / md / json / csv / srt / vtt'});
$('runDistillBtn').addEventListener('click',runDistill);
$('exportSkillBtn').addEventListener('click',exportSkill);
$('refreshObserverBtn').addEventListener('click',async()=>{await backgroundObserve();renderAdmin();toast('人物画像已刷新')});
$('adminBtn').addEventListener('click',()=>{renderAdmin();openModal('admin')});

async function boot(){if(!chars.length)chars=DEFAULTS;if(!active())activeId=chars[0].id;if(adminMode)$('adminBtn').classList.remove('hidden');renderRuntime();renderPersona();importP005();renderSourceCounts();renderCharacters();await renderActive();persist();backgroundObserve()}
boot();
})();