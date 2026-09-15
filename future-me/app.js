const STORAGE_KEY='aiques_future_me_v1';
const state={screen:'welcome',profile:{},memory:null,messages:[],generated:false};
const screens=['welcome','identity','present','future','generate','ready','chat','letter'];
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify({profile:state.profile,memory:state.memory,messages:state.messages}));}
function load(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(x){state.profile=x.profile||{};state.memory=x.memory||null;state.messages=x.messages||[];fillForms();}}catch(e){}}
function fillForms(){for(const [k,v] of Object.entries(state.profile)){const el=document.querySelector(`[name="${k}"]`);if(el)el.value=v||'';}}
function collect(){['identityForm','presentForm','futureForm'].forEach(id=>{const form=$('#'+id);if(!form)return;new FormData(form).forEach((v,k)=>state.profile[k]=String(v).trim());});save();}
function show(name){collect();state.screen=name;$$('.screen').forEach(x=>x.classList.remove('active'));$('#screen-'+name).classList.add('active');renderDots();if(name==='generate')generateSequence();if(name==='ready')renderReady();if(name==='chat')startChat();if(name==='letter')renderLetter();window.scrollTo({top:0,behavior:'smooth'});}
function renderDots(){const idx=Math.max(0,screens.indexOf(state.screen));$('#stepDots').innerHTML=[1,2,3,4,5].map((_,i)=>`<i class="${idx>=Math.min(7,i+1)?'active':''}"></i>`).join('');}

$$('[data-next]').forEach(b=>b.onclick=()=>{const formId=b.dataset.validate;if(formId&&!$('#'+formId).reportValidity())return;show(b.dataset.next);});
$$('[data-prev]').forEach(b=>b.onclick=()=>show(b.dataset.prev));
$('#resetBtn').onclick=()=>{if(confirm('清空本地的 Future Me 回答和对话，重新开始？')){localStorage.removeItem(STORAGE_KEY);location.reload();}};

function clean(v,fallback=''){return(v||'').trim()||fallback}
function firstClause(v,fallback){const s=clean(v,fallback).split(/[。！？.!?\n]/)[0];return s.length>42?s.slice(0,42)+'…':s;}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function pick(arr,seed){return arr[hash(seed)%arr.length]}

function buildMemory(){
  const p=state.profile;const age=Number(p.age)||22;const gap=Math.max(1,60-age);const y1=Math.min(5,Math.max(2,Math.round(gap*.18)));const y2=Math.min(15,Math.max(y1+3,Math.round(gap*.48)));
  const challenge=firstClause(p.challenge,'学会在不确定里继续行动');
  const project=firstClause(p.lifeProject,'持续投入一件真正重要的长期事情');
  const career=firstClause(p.career,'逐渐找到更适合自己的工作方式');
  const people=firstClause(p.people,'重要的人');
  const values=firstClause(p.values,'好奇、关系与自主');
  const futureLoc=firstClause(p.futureLocation,p.location||'一个让自己感到安稳的地方');
  const daily=firstClause(p.dailyLife,'有工作，也有稳定留给生活和关系的时间');
  const proud=firstClause(p.proud,'曾经做成一件自己真正认可的事');
  const low=firstClause(p.lowPoint,'经历过一段并不轻松的时期');
  const turn=firstClause(p.turningPoint,'一次让方向发生变化的选择');
  const timeline=[
    {age,tag:'现在',text:`你带着“${values}”这些仍很重要的东西出发。你已经${proud}，也${low}，并经历过${turn}。`},
    {age:Math.min(60,age+y1),tag:'第一段变化',text:`你没有一次解决所有问题，而是开始把“${challenge}”拆成更小的行动。你和${people}的关系也在这个阶段重新调整。`},
    {age:Math.min(60,age+y2),tag:'方向逐渐成形',text:`围绕“${project}”，你积累了更稳定的能力与伙伴。职业上，${career}。有些计划没有按原样发生，但价值排序变得更清楚。`},
    {age:60,tag:'60 岁',text:`你生活在${futureLoc}。理想的一天是：${daily}。你回头看，会把这条路理解成许多次小选择叠加的结果，而不是某个命中注定的答案。`}
  ];
  const lessons=[
    `不是所有担心都需要先消失，才有资格开始。`,
    `你真正保留下来的，不只是成就，还有“${values}”。`,
    `关系和长期项目都靠反复回到现场，而不是靠一次完美决定。`,
    `未来并没有证明你当初“选对了”，它只是让你更会承担选择。`
  ];
  return {timeline,lessons,summary:`这是${clean(p.name,'你')}从 ${age} 岁走向 60 岁的一种可能版本。核心线索包括：${challenge}、${project}、${career}，以及${values}。`};
}

function generateSequence(){
  if(state.generated&&state.memory){$('#meetBtn').classList.remove('hidden');return}
  collect();state.memory=buildMemory();save();state.generated=true;
  const lines=[
    `读取现在的你：${clean(state.profile.name,'你')}，${clean(state.profile.age,'?')} 岁。`,
    `找到重要关系：${firstClause(state.profile.people,'你在意的人')}。`,
    `连接高点、低谷与转折点……`,
    `加入未来挑战：${firstClause(state.profile.challenge,'一个尚未解决的挑战')}。`,
    `加入长期项目：${firstClause(state.profile.lifeProject,'一个值得长期投入的项目')}。`,
    `生成从现在到 60 岁的可能经历。`,
    `Future Me 已准备好。`
  ];
  const stream=$('#memoryStream');stream.innerHTML='';$('#meetBtn').classList.add('hidden');
  lines.forEach((t,i)=>setTimeout(()=>{const d=document.createElement('div');d.className='memory-line';d.textContent=t;stream.appendChild(d);if(i===lines.length-1){$('#generateTitle').textContent='Future Me 已经带着一段未来记忆回来了。';$('#generateSub').textContent='先看一眼这条可能路径，再决定你想问什么。';$('#meetBtn').classList.remove('hidden');}},i*420));
}
$('#meetBtn').onclick=()=>show('ready');

function renderReady(){
  if(!state.memory)state.memory=buildMemory();
  const p=state.profile;
  const initial=(clean(p.name,'F')[0]||'F').toUpperCase();
  $('#futureAvatar').textContent=initial;
  $('#chatAvatar').textContent=initial;
  $('#futureName').textContent=clean(p.name,'你');
  $('#chatName').textContent=`${clean(p.name,'Future Me')} · 60`;
  const summary=escapeHtml(state.memory.summary);
  const timeline=state.memory.timeline.map(x=>`<div class="milestone"><b>${escapeHtml(x.age)} 岁 · ${escapeHtml(x.tag)}</b><p>${escapeHtml(x.text)}</p></div>`).join('');
  const lessons=state.memory.lessons.map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  $('#memorySummary').innerHTML=`<p>${summary}</p><div class="timeline">${timeline}</div><p><strong>可能学到的几件事</strong></p><ul>${lessons}</ul>`;
  save();
}

function ensureGreeting(){if(state.messages.length)return;const p=state.profile;state.messages.push({role:'future',text:`嗨，${clean(p.name,'年轻的我')}。我是 60 岁的你。先说清楚：我不是“真正发生过的未来”，只是你刚才那些目标、关系和经历长出来的一种可能版本。\n\n但如果你愿意，我可以从这个时间点回头，和你聊聊工作、家人、后悔、意外，或者你现在最难做的决定。`});save();}
function startChat(){ensureGreeting();renderMessages();}
function renderMessages(){const box=$('#messages');box.innerHTML=state.messages.map(m=>`<div class="message ${m.role}"><span class="meta">${m.role==='future'?'Future Me · 60':'现在的我'}</span>${escapeHtml(m.text)}</div>`).join('');box.scrollTop=box.scrollHeight;}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])).replace(/\n/g,'<br>')}

function localFutureReply(input){
  const p=state.profile;const q=input.toLowerCase();const name=clean(p.name,'我');
  const base={
    happy:[`如果你问“幸福”是不是一直很稳定，答案是否定的。真正变化的是，我不再把幸福当成某个终点。后来最踏实的部分，反而来自${firstClause(p.dailyLife,'普通而有节奏的日常')}。`,`有一些阶段我很快乐，也有一些阶段并不轻松。到 60 岁，我更珍惜的是：生活和“${firstClause(p.values,'真正重要的东西')}”没有完全脱节。`],
    career:[`职业没有完全照着最初的剧本走。但“${firstClause(p.career,'想做的事')}”一直像一根线。我后来发现，比职位更重要的是持续累积能带走的能力、关系和作品。`,`你现在很容易把职业看成一次选对就结束。其实后来更像连续实验：做一段、复盘、换假设，再做一段。围绕“${firstClause(p.lifeProject,'长期项目')}”的投入，反而比某个头衔更稳定。`],
    family:[`关于家人和重要的人，我最想告诉你的是：不要总等“忙完这一阵”。你曾经写下${firstClause(p.people,'重要的人')}，后来这些关系真正留下来的，都是一次次具体的联系。`,`未来的家庭没有必要长成某一种模板。重要的是你有没有让关系里的人知道：他们对你重要。你现在提到的${firstClause(p.people,'那些人')}，会比你想象得更影响后来的你。`],
    money:[`钱后来更像一种选择权，而不是分数。你写下的理想状态是“${firstClause(p.finance,'更有安全感和自主性')}”。真正有效的是把它变成长期习惯，而不是等收入到了某个数字才开始。`],
    regret:[`当然有后悔。有些机会错过了，有些关系处理得不够好。但最有用的后悔，不是“当初为什么没选另一条”，而是让我看清：以后遇到类似时，我想成为什么样的人。`,`我最后没有得到一条“零后悔路径”。好消息是，大多数后悔后来都变成了信息，而不是判决。`],
    challenge:[`你现在写下想跨过去的是“${firstClause(p.challenge,'眼前这个挑战')}”。后来真正起作用的不是某一天突然想通，而是把它拆得小到可以重复练习。你不用等自己完全不怕。`,`关于“${firstClause(p.challenge,'这个难题')}”，未来的我没法替你保证结果。但我可以告诉你：最关键的变化通常发生在你愿意多做一次真实尝试之后。`],
    advice:[`如果只能留一句：别把未来的自己当裁判，把他当队友。今天先做一个能让明天多一点信息的小动作。`,`先别追求“正确人生”。问一个更实用的问题：哪一个下一步既符合“${firstClause(p.values,'你的价值')}”，又能让你更了解现实？去做那个。`],
    fear:[`我记得那种不确定。后来我才懂，焦虑经常是在要求你提前拿到未来的保证。但人生很少给这种保证。我们能做的是让下一步更小、更真实、更可撤回。`,`你不需要证明自己不会失败。你只需要让失败不再等于“我完了”。你经历过${firstClause(p.lowPoint,'低谷')}，那已经说明你有重新组织生活的能力。`],
    surprise:[`最大的意外是：很多当年以为会决定一生的事，后来只是一个路口；而一些当时很小的习惯和关系，反而滚成了很大的差异。`,`我没想到“${firstClause(p.turningPoint,'某个转折点')}”之后的影响会持续那么久。未来最常见的不是戏剧性反转，而是小东西慢慢复利。`],
    hello:[`你好，${name}。我知道你现在还没有我的答案——其实我也没有你的答案。我们只是站在不同时间尺度看同一组问题。你最想先问哪一件事？`]
  };
  let key='advice';
  if(/开心|幸福|快乐|happy/.test(q))key='happy';else if(/工作|职业|事业|career|专业|学校|学习/.test(q))key='career';else if(/家人|家庭|父母|朋友|伴侣|爱情|关系/.test(q))key='family';else if(/钱|财务|收入|财富|money/.test(q))key='money';else if(/后悔|遗憾|regret/.test(q))key='regret';else if(/挑战|困难|跨过|克服/.test(q))key='challenge';else if(/焦虑|害怕|担心|恐惧|怕/.test(q))key='fear';else if(/意外|没想到|unexpected|惊讶/.test(q))key='surprise';else if(/你好|hi|hello|嗨/.test(q))key='hello';
  const reply=pick(base[key],input+JSON.stringify(p));
  const tail=pick([`如果把这个问题拉回今天，你觉得最难的是哪一小部分？`,`你现在脑中有没有一个具体场景，让这个问题特别真实？`,`如果明天只能试一个很小的动作，你会选什么？`,`我更想听听你为什么现在会问这个。`],input+'tail');
  return `${reply}\n\n${tail}`;
}

async function getFutureReply(input){
  if(window.FUTURE_ME_API){try{const r=await fetch(window.FUTURE_ME_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile:state.profile,syntheticMemory:state.memory,messages:state.messages,userMessage:input})});if(r.ok){const j=await r.json();if(j.reply)return j.reply}}catch(e){console.warn('Future Me API unavailable, using local fallback',e)}}
  await new Promise(r=>setTimeout(r,350));return localFutureReply(input);
}

$('#chatForm').onsubmit=async e=>{e.preventDefault();const input=$('#chatInput');const text=input.value.trim();if(!text)return;state.messages.push({role:'user',text});input.value='';renderMessages();const pending={role:'future',text:'…'};state.messages.push(pending);renderMessages();const reply=await getFutureReply(text);pending.text=reply;save();renderMessages();};
$$('#promptChips button').forEach(b=>b.onclick=()=>{$('#chatInput').value=b.textContent;$('#chatForm').requestSubmit();});
$('#finishChatBtn').onclick=()=>show('letter');

function renderLetter(){collect();const p=state.profile;const action=$('#nextAction').value.trim();const latest=state.messages.filter(x=>x.role==='user').slice(-1)[0]?.text||'未来会怎样';const letter=`<h3>给现在的 ${escapeHtml(clean(p.name,'我'))}</h3><p>你现在还在想“${escapeHtml(firstClause(latest,'未来会怎样'))}”。我不能从 60 岁回来证明哪条路一定正确，因为这个我本来就是一种可能性。</p><p>但从这条可能的人生线回头看，有三件事值得你保留：第一，别丢掉 <strong>${escapeHtml(firstClause(p.values,'你真正重视的东西'))}</strong>；第二，把“${escapeHtml(firstClause(p.challenge,'那个难题'))}”拆成能反复练习的小动作；第三，别只照顾计划，也照顾 ${escapeHtml(firstClause(p.people,'重要的人'))}。</p><p>后来，围绕“${escapeHtml(firstClause(p.lifeProject,'长期投入的事情'))}”的积累，比很多短期得失更重要。职业、城市、关系都可能和你现在想的不完全一样，但你会越来越清楚什么值得。</p><p>${action?`这周你决定先做：<strong>${escapeHtml(action)}</strong>。很好，不需要更宏大。`:'如果愿意，给这周的自己留一个小到可以真的做到的行动。'} </p><p>未来见。<br><strong>60 岁的你（一个可能版本）</strong></p>`;$('#futureLetter').innerHTML=letter;}
$('#refreshLetterBtn').onclick=renderLetter;$('#nextAction').addEventListener('input',()=>{clearTimeout(window.__letterT);window.__letterT=setTimeout(renderLetter,250)});

load();renderDots();