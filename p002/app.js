const SCALES = {
  pcl5: {
    id:'pcl5', name:'PCL-5', subtitle:'PTSD Checklist for DSM-5 · 20题', window:'过去一个月', publicDomain:true,
    note:'PCL-5 由美国 VA National Center for PTSD 开发，公开说明为 public domain。这里的中文为原型转述；研究部署应替换为目标语言的合规/验证版本。',
    instruction:'请始终以同一段最困扰的压力经历为参照。你不需要在这里描述事件内容。过去一个月，这些问题在多大程度上困扰到你？',
    choices:['完全没有','有一点','中等程度','相当多','极其严重'],
    chapters:[
      {key:'B',title:'回声',desc:'一些经历会以记忆、梦境或身体反应的方式重新出现。',range:[1,5]},
      {key:'C',title:'绕行',desc:'有时我们会避开与经历有关的想法、感受和外部提醒。',range:[6,7]},
      {key:'D',title:'余波',desc:'经历也可能改变记忆、信念、情绪以及与他人的距离。',range:[8,14]},
      {key:'E',title:'警戒',desc:'身体和注意系统可能仍处在高警觉、易惊或难以休息的状态。',range:[15,20]},
    ],
    items:[
      ['B','反复出现、不由自主且令人不适的、与那段压力经历有关的记忆？','Repeated, disturbing, and unwanted memories of the stressful experience?'],
      ['B','反复做与那次压力经历有关、令人不安的梦？','Repeated, disturbing dreams of the stressful experience?'],
      ['B','突然感觉或表现得仿佛那次压力经历正在再次发生（像真的回到当时重新经历）？','Suddenly feeling or acting as if the stressful experience were actually happening again?'],
      ['B','遇到相关提醒时感到非常难受？','Feeling very upset when something reminded you of the stressful experience?'],
      ['B','遇到相关提醒时出现明显身体反应，例如心跳加快、呼吸困难或出汗？','Having strong physical reactions when something reminded you of the stressful experience?'],
      ['C','会避开与那次经历有关的记忆、想法或感受？','Avoiding memories, thoughts, or feelings related to the stressful experience?'],
      ['C','会避开外部提醒，例如某些人、地方、谈话、活动、物品或情境？','Avoiding external reminders of the stressful experience?'],
      ['D','难以回忆那次经历的重要部分？','Trouble remembering important parts of the stressful experience?'],
      ['D','对自己、他人或世界形成很强的负面信念？','Having strong negative beliefs about yourself, other people, or the world?'],
      ['D','会责怪自己或他人导致了那次经历，或之后发生的事情？','Blaming yourself or someone else for the stressful experience or what happened after it?'],
      ['D','经常有很强的负面感受，例如恐惧、惊恐、愤怒、内疚或羞耻？','Having strong negative feelings such as fear, horror, anger, guilt, or shame?'],
      ['D','对过去喜欢的活动失去兴趣？','Loss of interest in activities that you used to enjoy?'],
      ['D','感觉与其他人疏远或隔绝？','Feeling distant or cut off from other people?'],
      ['D','难以体验积极情绪，例如快乐或对亲近之人的爱意？','Trouble experiencing positive feelings?'],
      ['E','容易烦躁、愤怒爆发或表现出攻击性？','Irritable behavior, angry outbursts, or acting aggressively?'],
      ['E','会做过度冒险、可能伤害自己的事情？','Taking too many risks or doing things that could cause you harm?'],
      ['E','处于“高度警觉”、不断留意危险或保持戒备？','Being “superalert” or watchful or on guard?'],
      ['E','容易受惊或被突然的事情吓一跳？','Feeling jumpy or easily startled?'],
      ['E','难以集中注意力？','Having difficulty concentrating?'],
      ['E','入睡困难或难以维持睡眠？','Trouble falling or staying asleep?'],
    ].map((x,i)=>({id:i+1,cluster:x[0],text:x[1],original:x[2]}))
  },
  cape15: {
    id:'cape15', name:'Current CAPE-P15', subtitle:'近期精神病性样体验 · 15题', window:'过去三个月', publicDomain:false,
    note:'Current CAPE-P15 的公开论文描述为 15 题、三个维度，并可在体验出现后追加困扰度。本仓库不把自译文本冒充正式中文版；以下为基于构念的研究原型转述。',
    instruction:'过去三个月，你是否有过以下体验？请选择最接近实际情况的出现频率。若至少出现过“有时”，会再询问这项体验带来的困扰程度。',
    scoringScheme:'cape-p15-published-1-4', choices:['从未','有时','经常','几乎总是'], choiceValues:[1,2,3,4], distressChoices:['完全不困扰','有一点困扰','比较困扰','非常困扰'], distressValues:[1,2,3,4],
    chapters:[
      {key:'PI',title:'读空气',desc:'人与人之间的信息有时会显得格外有指向性。',range:[1,5]},
      {key:'BE',title:'边界感',desc:'有些体验涉及思维归属、控制感或现实边界。',range:[6,12]},
      {key:'PA',title:'感知',desc:'有些体验来自听觉或视觉，而其他人未必同时察觉。',range:[13,15]},
    ],
    items:[
      ['PI','是否觉得别人像是在暗示你，或说的话带有针对你的双重含义？'],
      ['PI','是否觉得某些人并不像表面看起来的那样？'],
      ['PI','是否感觉自己正在受到迫害？'],
      ['PI','是否感觉有人正在密谋对付你？'],
      ['PI','是否觉得别人因为你的外表而用异样眼光看你？'],
      ['BE','是否感觉电脑等电子设备会影响你的思维方式？'],
      ['BE','是否有过思维像被从脑中拿走的感觉？'],
      ['BE','是否有过脑中的想法不像是属于自己的感觉？'],
      ['BE','是否有过想法异常鲜明，以至担心别人也能听见？'],
      ['BE','是否有过自己的想法像回声一样被“听见”的体验？'],
      ['BE','是否感觉自己受到某种自身以外的力量控制？'],
      ['BE','是否感觉家人、朋友或熟人被一个一模一样的人替代了？'],
      ['PA','独处时是否听到过人声？'],
      ['PA','独处时是否听到过两个或更多声音彼此交谈？'],
      ['PA','是否看到过别人没有同时看到的人、物体或动物？'],
    ].map((x,i)=>({id:i+1,cluster:x[0],text:x[1]}))
  }
};

const CONDITION_CONFIG = globalThis.P002_CONDITION || {
  read:()=>({condition:'story'}),
  options:{
    story:{label:'故事问卷'},
    direct:{label:'直接问卷'},
    scenario:{label:'情景选择'}
  }
};
const ACTIVE_CONDITION = CONDITION_CONFIG.read().condition || 'story';
const RESEARCH = globalThis.P00_RESEARCH || null;
const PROJECT_ID = 'P002';
const STUDY_VERSION = '0.12.0-prototype';

const RUSH = {
  pcl5:[
    {title:'意外出现的提醒',story:'你正在做别的事情，某个画面或声音突然让你想起那段压力经历。',cluster:'B',options:[['只是短暂想起，很快回到正在做的事',0],['相关画面或念头会反复出现一阵',2],['相关画面或念头强烈反复出现，很难把注意力移开',4]]},
    {title:'熟悉得过头的一刻',story:'某个场景突然让你产生很强的熟悉感。',cluster:'B',options:[['只是觉得熟悉，仍清楚自己此刻在哪里',0],['有一瞬间像回到当时，但很快恢复',2],['一度强烈感觉那件事正在再次发生',4]]},
    {title:'经过提醒你的地方',story:'去上课的路线会经过一个容易让你想起那段经历的地方。',cluster:'C',options:[['通常仍按原路线经过',0],['有时会犹豫或绕开',2],['几乎总会想办法避开，必要时会改变安排',4]]},
    {title:'以前喜欢的活动',story:'朋友邀请你参加以前很喜欢的一项活动。',cluster:'D',options:[['仍然有兴趣参加',0],['兴趣明显变弱，常常拿不定主意',2],['几乎完全提不起兴趣',4]]},
    {title:'一次普通失误',story:'你在一件日常小事上出了错。',cluster:'D',options:[['主要把它看成这件事本身的问题',0],['会有一阵明显的负面想法',2],['很容易扩展成对自己、别人或世界的强烈负面判断',4]]},
    {title:'突如其来的巨响',story:'安静环境里突然传来一声很大的撞击声。',cluster:'E',options:[['被吓到一下，很快恢复',0],['明显紧张一阵，需要一点时间恢复',2],['会进入很强的警觉状态，很久都难以放松',4]]},
    {title:'专注一段时间',story:'你给自己留出一段安静时间完成一项任务。',cluster:'E',options:[['大多数时候能持续专注',0],['注意力会频繁飘走，但还能拉回来',2],['很难维持注意力，任务经常被迫中断',4]]},
    {title:'准备入睡',story:'一天结束后，你已经躺下准备睡觉。',cluster:'E',options:[['通常可以正常入睡并维持睡眠',0],['有时入睡困难或夜里醒来',2],['经常很难入睡，或睡眠反复中断',4]]},
  ],
  cape15:[
    {title:'一句没有点名的话',story:'群聊里有人发了一句模糊的话，没有提到任何人的名字。',cluster:'PI',options:[['通常不会把它和自己联系起来',0],['会怀疑这句话可能和自己有关',2],['会很确信这句话是在暗指自己',4]]},
    {title:'几个人突然安静',story:'你经过几个人身边时，他们刚好停止了交谈。',cluster:'PI',options:[['通常不会特别解释这件事',0],['会怀疑他们刚才是不是在谈自己',2],['会很确信他们在联合起来针对自己',4]]},
    {title:'设备的异常反应',story:'你刚想到一件事，设备随后出现了一个与你刚才想法相关的内容。',cluster:'BE',options:[['通常会把它看作普通巧合或算法结果',0],['会短暂觉得它可能和自己的想法有特殊联系',2],['会很确信设备能够影响或读取自己的思维',4]]},
    {title:'突然出现的念头',story:'脑中突然出现一句与你平时想法不太一样的话。',cluster:'BE',options:[['仍会把它看作自己的一个念头',0],['会觉得这个念头有些陌生，不太确定',2],['会很确信这个念头并不属于自己',4]]},
    {title:'安静环境里的声音',story:'独处时，你似乎听见有人叫你。',cluster:'PA',options:[['不确定是不是周围环境中的声音',0],['觉得像是真的听见了，但仍不能确定',2],['会很确信听到了外界实际并不存在的声音',4]]},
    {title:'余光里的影子',story:'余光里似乎有一个人影或物体一闪而过。',cluster:'PA',options:[['不确定刚才到底看到了什么',0],['会觉得自己可能真的看到了什么',2],['会很确信看到了别人没有同时看到的人或东西',4]]},
  ]
};

const state={scale:null,condition:ACTIVE_CONDITION,index:0,answers:[],distress:[],rushSignals:{},chapterSeen:{},sessionId:null,runStatus:'idle',itemStartedAt:null};
const $=s=>document.querySelector(s);
const SEARCH=typeof location!=='undefined'?String(location.search||''):'';
function queryParam(name){
  const match=SEARCH.match(new RegExp('(?:[?&])'+name+'=([^&]*)'));
  return match?decodeURIComponent(match[1]):null;
}
const SHOW_SOURCE=queryParam('source')==='1';
const SHOW_RESEARCH=queryParam('research')==='1';

function renderLauncher(){
  const hint = $('#experienceHint');
  if(hint){
    hint.textContent = state.condition==='scenario'
      ? '根据几个生活情境，选择最接近你的反应。'
      : state.condition==='direct'
        ? '选择量表后，直接按题目完成这次体验。'
        : '沿着一段简单的故事，完成当前量表。';
  }
  $('#scaleChoices').innerHTML=Object.values(SCALES).map(s=>`<button class="choice ${state.scale===s.id?'active':''}" data-scale="${s.id}" aria-pressed="${state.scale===s.id}">
    <h3>${s.name}</h3>
    <p>${s.subtitle}<br>时间窗口：${s.window}</p>
  </button>`).join('');

  document.querySelectorAll('[data-scale]').forEach(b=>b.onclick=()=>{state.scale=b.dataset.scale;renderLauncher();});
  $('#startBtn').disabled=!state.scale;
}

function resetRun(){
  state.index=0;
  state.answers=[];
  state.distress=[];
  state.rushSignals={};
  state.chapterSeen={};
  state.sessionId=null;
  state.runStatus='idle';
  state.itemStartedAt=null;
}
function recordEvent(eventType,payload={}){
  if(!RESEARCH || !state.sessionId) return null;
  return RESEARCH.appendEvent(Object.assign({
    session_id:state.sessionId,
    project_id:PROJECT_ID,
    study_version:STUDY_VERSION,
    scale_id:state.scale,
    condition_id:state.condition,
    event_type:eventType
  },payload));
}
function finishSession(status,payload={}){
  if(state.runStatus!=='active' || !state.sessionId) return;
  recordEvent(status==='completed'?'session_completed':'session_interrupted',payload);
  RESEARCH?.completeSession?.(state.sessionId,status);
  RESEARCH?.flushPending?.();
  state.runStatus=status;
}
function start(){
  resetRun();
  state.condition=CONDITION_CONFIG.read().condition || 'story';
  if(RESEARCH){
    const session=RESEARCH.createSession({
      project_id:PROJECT_ID,
      study_version:STUDY_VERSION,
      scale_id:state.scale,
      condition_id:state.condition
    });
    state.sessionId=session.session_id;
  }
  state.runStatus='active';
  recordEvent('session_started');
  $('#launcher').classList.add('hidden');
  $('#result').classList.add('hidden');
  $('#game').classList.remove('hidden');
  renderStep();
  window.scrollTo({top:$('#game').offsetTop-20,behavior:'smooth'});
}
function backHome(){
  if(state.runStatus==='active') finishSession('interrupted',{answered_items:state.answers.length,scenario_steps:state.index});
  $('#game').classList.add('hidden');
  $('#result').classList.add('hidden');
  $('#launcher').classList.remove('hidden');
  renderLauncher();
}
function progress(done,total){$('#progressBar').style.width=`${Math.min(100,done/total*100)}%`;$('#progressText').textContent=`${done}/${total}`;}
function currentChapter(scale,item){return scale.chapters.find(c=>c.key===item.cluster)}
function publicChapter(key){
  return {
    B:{title:'第一段',desc:'沿着一条安静的路继续往前。'},
    C:{title:'第二段',desc:'前方出现几条通往同一目的地的路线。'},
    D:{title:'第三段',desc:'走廊里出现一些熟悉又陌生的片段。'},
    E:{title:'第四段',desc:'最后一段路经过明暗交替的窗。'},
    PI:{title:'第一段',desc:'周围有人来往，也有零散的信息出现。'},
    BE:{title:'第二段',desc:'你进入一个安静的房间，继续向前。'},
    PA:{title:'第三段',desc:'天色慢慢暗下来，周围有声音和光影。'}
  }[key]||{title:'下一段',desc:'继续向前。'};
}

function renderStep(){
  if(state.condition==='scenario') return renderRush();
  const scale=SCALES[state.scale], item=scale.items[state.index];
  if(!item) return finishStandard();
  progress(state.index+1,scale.items.length);
  const ch=currentChapter(scale,item), chapterStart=state.index===0 || scale.items[state.index-1].cluster!==item.cluster;
  if(state.condition==='story' && chapterStart && !state.chapterSeen[ch.key]) return renderStoryIntro(scale,ch);
  const pub=publicChapter(item.cluster);
  const firstItem=state.index===0;
  state.itemStartedAt=Date.now();
  $('#gameBody').innerHTML=`<div class="scene">
    ${chapterStart && state.condition==='story'?`<div class="chapter-card"><span class="scene-kicker">${scale.window}</span><h2>${pub.title}</h2><p>${pub.desc}</p></div>`:''}
    ${firstItem?`<p class="instrument-instruction">${scale.instruction}</p>`:''}
    <div class="question-card">
      <div class="question-id">${scale.id==='pcl5'?'过去一个月 · 同一压力经历':'过去三个月'}</div>
      <div class="question">${item.text}</div>
      ${SHOW_SOURCE && item.original?`<div class="original">Source check: ${item.original}</div>`:''}
      <div class="answers">${scale.choices.map((c,i)=>{const value=scale.choiceValues?.[i] ?? i;return `<button class="answer" data-score="${value}"><span>${c}</span><span class="score">${value}</span></button>`}).join('')}</div>
    </div>
  </div>`;
  document.querySelectorAll('.answer').forEach(b=>b.onclick=()=>{
    const score=Number(b.dataset.score);
    const responseMs=Math.max(0,Date.now()-(state.itemStartedAt||Date.now()));
    if(scale.id==='cape15' && score>1){
      renderCapeDistress(scale,item,score,responseMs);
      return;
    }
    recordEvent('item_response',{
      item_id:item.id,
      cluster:item.cluster,
      response:score,
      distress:null,
      response_ms:responseMs
    });
    state.answers.push(score);
    state.distress.push(null);
    state.index++;
    renderStep();
  });
}

function renderCapeDistress(scale,item,frequencyScore,frequencyResponseMs){
  const host=$('.question-card');
  if(!host)return;
  host.querySelectorAll('.answer').forEach(x=>{x.disabled=true;});
  const block=document.createElement('div');
  block.className='distress-block';
  block.innerHTML='<div class="distress-kicker">补充 · 只有体验出现时才追问</div><h3>这项体验让你有多困扰？</h3><div class="distress-options">'+
    scale.distressChoices.map((label,i)=>{const value=scale.distressValues?.[i] ?? i;return '<button class="answer distress-answer" data-distress="'+value+'"><span>'+label+'</span><span class="score">'+value+'</span></button>'}).join('')+
    '</div>';
  host.appendChild(block);
  block.querySelectorAll('[data-distress]').forEach(btn=>btn.onclick=()=>{
    const distress=Number(btn.dataset.distress);
    recordEvent('item_response',{
      item_id:item.id,
      cluster:item.cluster,
      response:frequencyScore,
      distress,
      response_ms:Math.max(0,Date.now()-(state.itemStartedAt||Date.now())),
      frequency_response_ms:frequencyResponseMs
    });
    state.answers.push(frequencyScore);
    state.distress.push(distress);
    state.index++;
    renderStep();
  });
}

function renderStoryIntro(scale,ch){
  progress(state.index,scale.items.length);
  const choices=['从左边继续','从中间继续','从右边继续'];
  const pub=publicChapter(ch.key);
  state.itemStartedAt=Date.now();
  $('#gameBody').innerHTML=`<div class="scene"><div class="chapter-card"><span class="scene-kicker">下一段</span><h2>${pub.title}</h2><p>${pub.desc}</p></div><p class="story">选一条路继续。</p><div class="rush-options">${choices.map((label,i)=>`<button class="rush-option" data-story-choice="${i}">${label}</button>`).join('')}</div></div>`;
  document.querySelectorAll('[data-story-choice]').forEach(b=>b.onclick=()=>{
    recordEvent('story_transition',{
      item_id:'chapter_'+ch.key,
      cluster:ch.key,
      response:Number(b.dataset.storyChoice),
      response_ms:Math.max(0,Date.now()-(state.itemStartedAt||Date.now()))
    });
    state.chapterSeen[ch.key]=true;
    renderStep();
  });
}

function renderRush(){
  const scenarios=RUSH[state.scale], sc=scenarios[state.index];
  if(!sc) return finishRush();
  progress(state.index,scenarios.length);
  state.itemStartedAt=Date.now();
  $('#gameBody').innerHTML=`<div class="scene"><div class="scene-kicker">情境 ${state.index+1} / ${scenarios.length}</div><h2>${sc.title}</h2><p class="story">${sc.story}</p><div class="rush-options">${sc.options.map((o,i)=>`<button class="rush-option" data-i="${i}">${o[0]}</button>`).join('')}</div>${state.index===0?'<p class="mode-note">请选择最接近你的反应。这里没有对错。</p>':''}</div>`;
  document.querySelectorAll('.rush-option').forEach(b=>b.onclick=()=>{
    const optionIndex=Number(b.dataset.i);
    const opt=sc.options[optionIndex];
    recordEvent('scenario_response',{
      item_id:'scenario_'+(state.index+1),
      cluster:sc.cluster,
      response:optionIndex,
      signal:opt[1],
      response_ms:Math.max(0,Date.now()-(state.itemStartedAt||Date.now()))
    });
    state.rushSignals[sc.cluster]=(state.rushSignals[sc.cluster]||0)+opt[1];
    state.index++;
    renderRush();
  });
}

function finishStandard(){
  $('#game').classList.add('hidden');$('#result').classList.remove('hidden');
  const s=SCALES[state.scale], total=state.answers.reduce((a,b)=>a+b,0), clusters={};
  s.items.forEach((it,i)=>{clusters[it.cluster]=(clusters[it.cluster]||0)+(state.answers[i]||0)});
  const max=s.id==='pcl5'?80:60;
  const endorsedDistress=state.distress.filter((v,i)=>state.answers[i]>1 && v!=null);
  const distressMean=endorsedDistress.length?endorsedDistress.reduce((a,b)=>a+b,0)/endorsedDistress.length:null;
  const weightedMean=s.id==='cape15' && state.answers.length ? total/state.answers.length : null;
  finishSession('completed',{
    answered_items:state.answers.length,
    total_score_internal:total,
    weighted_mean_internal:weightedMean,
    distress_mean:distressMean
  });
  if(!SHOW_RESEARCH){
    $('#result').innerHTML=participantCompletion();
    return;
  }
  const interpretation=s.id==='pcl5' ? pclInterpret(total,state.answers) : capeInterpret(total,clusters,distressMean);
  $('#result').innerHTML=`<p class="eyebrow">Research view · ${CONDITION_CONFIG.options?.[state.condition]?.label || state.condition}</p><h2>${s.name} 原型数据</h2><div class="result-grid"><div class="result-card"><div class="score-big">${s.id==='cape15'&&weightedMean!=null?weightedMean.toFixed(2):total}</div><p>${s.id==='cape15'?'1–4 频率加权均值':'原型内部总分 / '+max}</p><p>${interpretation}</p>${s.id==='cape15'?`<p>频率原始总和：<strong>${total} / 60</strong> · 困扰均值：<strong>${distressMean==null?'—':distressMean.toFixed(2)}</strong></p>`:''}</div><div class="result-card"><h3>维度概览</h3><div class="bars">${Object.entries(clusters).map(([k,v])=>{const cnt=s.items.filter(i=>i.cluster===k).length,maxc=s.id==='pcl5'?cnt*4:cnt*4,pct=s.id==='pcl5'?(maxc?v/maxc*100:0):cnt?Math.max(0,Math.min(100,((v/cnt)-1)/3*100)):0;return `<div class="bar-row"><span>${k}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><strong>${v}</strong></div>`}).join('')}</div></div></div><div class="safe-note"><strong>研究检查视图。</strong> ${s.note}</div><p><button class="primary" onclick="backHome()">返回</button></p>`;
}
function participantCompletion(){
  return '<div class="completion"><p class="eyebrow">完成</p><h2>这次体验已完成。</h2><p>这里不提供诊断、风险等级或临床解释。</p><button class="primary" onclick="backHome()">返回</button></div>';
}
function pclInterpret(total,a){
  const B=a.slice(0,5).filter(x=>x>=2).length,C=a.slice(5,7).filter(x=>x>=2).length,D=a.slice(7,14).filter(x=>x>=2).length,E=a.slice(14,20).filter(x=>x>=2).length;
  return `原始 PCL-5 官方版本可计算 0–80 严重度总分，并可按 ≥2 查看 B/C/D/E 症状条目。本页中文题干属于原型转述，因此这里的数值只用于交互研究内部比较，不应直接继承验证版的临床解释。本次聚类计数：B=${B}、C=${C}、D=${D}、E=${E}。`;
}
function capeInterpret(total,clusters,distressMean){const mean=state.answers.length?total/state.answers.length:null;return `已发表的中文 CAPE-P15 研究采用 1=从未 至 4=几乎总是的频率编码，并以 1–4 记录困扰度；本原型按该响应编码原样保存。当前仓库中文题干仍是研究原型转述，并非已冻结的验证版中文文本，因此这里不套用临床阈值或风险标签。当前频率加权均值：${mean==null?'—':mean.toFixed(2)}；困扰均值：${distressMean==null?'—':distressMean.toFixed(2)}。`;}
function finishRush(){
  $('#game').classList.add('hidden');$('#result').classList.remove('hidden');
  finishSession('completed',{
    scenario_steps:state.index,
    scenario_signals:Object.assign({},state.rushSignals)
  });
  if(!SHOW_RESEARCH){
    $('#result').innerHTML=participantCompletion();
    return;
  }
  const entries=Object.entries(state.rushSignals); const max=Math.max(...entries.map(x=>x[1]),1);
  $('#result').innerHTML=`<p class="eyebrow">Research view · 情境选择</p><h2>情境决策信号</h2><div class="result-card"><div class="bars">${entries.map(([k,v])=>`<div class="bar-row"><span>${k}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><strong>${v}</strong></div>`).join('')}</div></div><div class="safe-note"><strong>研究检查视图。</strong> 这些是实验性构念信号，不是 ${SCALES[state.scale].name} 得分。</div><p><button class="primary" onclick="backHome()">返回</button></p>`;
}

$('#startBtn').onclick=start;
$('#backBtn').onclick=backHome;
const clearLocalBtn=$('#clearLocalBtn');
if(clearLocalBtn) clearLocalBtn.onclick=()=>{
  if(!RESEARCH?.clearProjectData) return;
  const approved=typeof confirm==='function' ? confirm('清除当前浏览器中的 P002 会话、答题事件和待同步事件？此操作不会清除其他 P00 模块的数据。') : true;
  if(!approved) return;
  RESEARCH.clearProjectData(PROJECT_ID);
  alert?.('本机 P002 研究数据已清除。');
};
renderLauncher();