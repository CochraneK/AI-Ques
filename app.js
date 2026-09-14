const SCALES = {
  pcl5: {
    id:'pcl5', name:'PCL-5', subtitle:'PTSD Checklist for DSM-5 · 20题', window:'过去一个月', publicDomain:true,
    note:'PCL-5 由美国 VA National Center for PTSD 开发，公开说明为 public domain。这里的中文为原型转述；研究部署应替换为目标语言的合规/验证版本。',
    choices:['完全没有','有一点','中等程度','相当多','非常严重'],
    chapters:[
      {key:'B',title:'回声',desc:'一些经历会以记忆、梦境或身体反应的方式重新出现。',range:[1,5]},
      {key:'C',title:'绕行',desc:'有时我们会避开与经历有关的想法、感受和外部提醒。',range:[6,7]},
      {key:'D',title:'余波',desc:'经历也可能改变记忆、信念、情绪以及与他人的距离。',range:[8,14]},
      {key:'E',title:'警戒',desc:'身体和注意系统可能仍处在高警觉、易惊或难以休息的状态。',range:[15,20]},
    ],
    items:[
      ['B','反复出现、不由自主且令人不适的相关记忆？','Repeated, disturbing, and unwanted memories of the stressful experience?'],
      ['B','反复做与那次压力经历有关、令人不安的梦？','Repeated, disturbing dreams of the stressful experience?'],
      ['B','突然感觉或表现得像那次经历正在再次发生？','Suddenly feeling or acting as if the stressful experience were actually happening again?'],
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
    choices:['从未','有时','经常','几乎总是'],
    chapters:[
      {key:'PI',title:'读空气',desc:'人与人之间的信息有时会显得格外有指向性。',range:[1,5]},
      {key:'BE',title:'边界感',desc:'有些体验涉及思维归属、控制感或现实边界。',range:[6,12]},
      {key:'PA',title:'感知',desc:'有些体验来自听觉或视觉，而其他人未必同时察觉。',range:[13,15]},
    ],
    items:[
      ['PI','是否觉得别人像是在暗示你，或说的话带有针对你的双重含义？'],
      ['PI','是否觉得某些人并不像表面看起来的那样？'],
      ['PI','是否感觉自己正在被针对、迫害或为难？'],
      ['PI','是否感觉有人在联合起来对付你？'],
      ['PI','是否觉得别人因为你的外表而用异样眼光看你？'],
      ['BE','是否觉得电子设备可能影响你的思维方式？'],
      ['BE','是否有过思维像被从脑中拿走的感觉？'],
      ['BE','是否有过脑中的想法不像是属于自己的感觉？'],
      ['BE','是否有过想法异常鲜明，以至担心别人也能听见？'],
      ['BE','是否有过自己的想法像回声一样被“听见”的体验？'],
      ['BE','是否感觉自己受到某种外在力量或力量控制？'],
      ['BE','是否有过熟悉的人像被“另一个一模一样的人”替代的感觉？'],
      ['PA','独处时是否听到过似乎来自外界的声音？'],
      ['PA','独处时是否听到过两个或更多声音彼此交谈？'],
      ['PA','是否看到过别人没有同时看到的人、物体或动物？'],
    ].map((x,i)=>({id:i+1,cluster:x[0],text:x[1]}))
  }
};

const MODES = {
  vassip:{name:'VASSIP 式',desc:'故事化 + 沉浸 + 不计分小游戏；核心题目和评分不改变。',tag:'最适合第一版'},
  emoji:{name:'Emoji Game 式',desc:'量表保持原样，只加入“找 Emoji”任务，提高完成过程的轻松感。',tag:'成本最低'},
  rush:{name:'HEXACO-RUSH 式',desc:'把构念改写成连续情景决策；输出实验性行为画像，不冒充标准量表分数。',tag:'创新最高 / 需验证'}
};

const RUSH = {
  pcl5:[
    {title:'夜里 00:47',story:'你准备睡觉时，手机弹出一条内容，意外勾起了一段非常难受的往事。你第一反应更接近：',cluster:'B',options:[['把手机扣下，先感受呼吸和脚踩地面的感觉',0],['快速划走，但脑中仍反复闪回那段画面',2],['停住不动，像重新回到了当时',4]]},
    {title:'路过那条走廊',story:'第二天去上课，最短路线会经过一个让你想起那段经历的地方。',cluster:'C',options:[['照常走过去，但允许自己慢一点',0],['犹豫后绕远路',2],['无论如何都不会靠近那里',4]]},
    {title:'朋友的消息',story:'朋友约你参加以前很喜欢的活动。最近你对很多事情都提不起兴趣。',cluster:'D',options:[['愿意先去十分钟看看',0],['想去，但大概率会取消',2],['完全不想参与，也不想见任何人',4]]},
    {title:'突然的巨响',story:'自习室外突然传来一声巨响。',cluster:'E',options:[['被吓到一下，很快能回到手头的事',0],['明显紧张，过一会儿才能缓过来',2],['立刻进入高度戒备，很久都难以放松',4]]},
    {title:'期末周',story:'任务很多，你发现注意力一直被拉走，晚上也难以休息。',cluster:'E',options:[['调整节奏后还能继续完成任务',1],['效率明显下降，需要频繁中断',2],['几乎无法集中，也很难睡着',4]]},
    {title:'一次争执',story:'有人无意中说了一句话，让你很不舒服。',cluster:'D',options:[['先确认对方意思，再决定如何回应',0],['脑中马上出现很强的负面判断',2],['强烈觉得自己/别人/世界都不可信或很糟',4]]},
  ],
  cape15:[
    {title:'食堂里的低声交谈',story:'你经过一桌同学，他们看到你后声音变小了。你更容易把这个瞬间理解成：',cluster:'PI',options:[['可能只是巧合，先不下结论',0],['有点像在谈我，但我不确定',2],['他们明显是在用暗示针对我',4]]},
    {title:'群聊里的省略号',story:'群里有人发了一句模糊的话，没有点名。',cluster:'PI',options:[['信息不足，不把它和自己联系起来',0],['会反复想是不是在说自己',2],['基本确定是在暗指自己',4]]},
    {title:'电脑忽然卡顿',story:'电脑在你打字时突然卡住并自动弹窗。你第一反应更接近：',cluster:'BE',options:[['普通技术故障',0],['短暂觉得它好像和自己的想法有关',2],['明显感觉设备正在影响或读取自己的思维',4]]},
    {title:'脑中的一句话',story:'独处时，一个念头突然闯入脑中。',cluster:'BE',options:[['把它看作自己的一个念头',0],['觉得有些陌生，但仍能保留不确定',2],['很确定这个念头并不属于自己',4]]},
    {title:'安静的房间',story:'深夜房间很安静，你似乎听见了有人叫你的名字。',cluster:'PA',options:[['先检查环境，也考虑疲劳或声音错觉',0],['不确定是真的还是听错了',2],['很确定听到了别人并没有听到的声音',4]]},
    {title:'窗边一闪而过',story:'余光里好像看到一个影子。',cluster:'PA',options:[['回头确认后就不再在意',0],['会怀疑刚才是不是看到了什么',2],['确信看见了别人看不到的人或东西',4]]},
  ]
};

const state={scale:null,mode:null,index:0,answers:[],emojiFound:0,emojiSeen:0,rushSignals:{},lastReflection:''};
const $=s=>document.querySelector(s);

function renderLauncher(){
  $('#scaleChoices').innerHTML=Object.values(SCALES).map(s=>`<button class="choice ${state.scale===s.id?'active':''}" data-scale="${s.id}"><h3>${s.name}</h3><p>${s.subtitle}<br>时间窗口：${s.window}</p><span class="tag">${s.id==='pcl5'?'标准评分可保留':'原型转述需验证'}</span></button>`).join('');
  $('#modeChoices').innerHTML=Object.entries(MODES).map(([id,m])=>`<button class="choice ${state.mode===id?'active':''}" data-mode="${id}"><h3>${m.name}</h3><p>${m.desc}</p><span class="tag">${m.tag}</span></button>`).join('');
  document.querySelectorAll('[data-scale]').forEach(b=>b.onclick=()=>{state.scale=b.dataset.scale;renderLauncher();});
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;renderLauncher();});
  $('#startBtn').disabled=!(state.scale&&state.mode);
}

function resetRun(){state.index=0;state.answers=[];state.emojiFound=0;state.emojiSeen=0;state.rushSignals={};state.lastReflection='';}
function start(){resetRun();$('#launcher').classList.add('hidden');$('#result').classList.add('hidden');$('#game').classList.remove('hidden');renderStep();window.scrollTo({top:$('#game').offsetTop-20,behavior:'smooth'});}
function backHome(){ $('#game').classList.add('hidden');$('#result').classList.add('hidden');$('#launcher').classList.remove('hidden');renderLauncher(); }
function progress(done,total){$('#progressBar').style.width=`${Math.min(100,done/total*100)}%`;$('#progressText').textContent=`${done}/${total}`;}
function currentChapter(scale,item){return scale.chapters.find(c=>c.key===item.cluster)}

function renderStep(){
  if(state.mode==='rush') return renderRush();
  const scale=SCALES[state.scale], item=scale.items[state.index];
  if(!item) return finishStandard();
  progress(state.index,scale.items.length);
  const ch=currentChapter(scale,item), chapterStart=state.index===0 || scale.items[state.index-1].cluster!==item.cluster;
  const emojiActive=state.mode==='emoji' && [1,3,5,7,9,11,13,16,19].includes(state.index);
  if(emojiActive) state.emojiSeen++;
  $('#gameBody').innerHTML=`<div class="scene">
    ${chapterStart && state.mode==='vassip'?`<div class="chapter-card"><span class="scene-kicker">${ch.key} · ${scale.window}</span><h2>${ch.title}</h2><p>${ch.desc}</p></div>`:''}
    <div class="scene-kicker">${state.mode==='vassip'?'故事中的真实量表题':'Emoji Check-in'} · ${scale.name}</div>
    <h2>${state.mode==='vassip'?ch.title:'找到小表情，也完成一次自我观察'}</h2>
    <p class="story">${state.mode==='vassip'?storyLine(scale,item):'题目与评分逻辑保持不变；Emoji 只是额外的寻找任务，不影响答案。'}</p>
    <div class="question-card">
      ${emojiActive?`<button class="emoji-clue" id="emojiClue" aria-label="找到隐藏表情">${['🪐','🫧','🦊','🌱','🧩','🐳'][state.index%6]}</button>`:''}
      <div class="question-id">${scale.name} · ${item.id}/${scale.items.length} · ${item.cluster}</div>
      <div class="question">${scale.window}，${item.text}</div>
      ${item.original?`<div class="original">Public-domain source item: ${item.original}</div>`:''}
      <div class="answers">${scale.choices.map((c,i)=>`<button class="answer" data-score="${i}"><span>${c}</span><span class="score">${i}</span></button>`).join('')}</div>
      ${state.mode==='emoji'?`<div class="emoji-counter">已找到 ${state.emojiFound} / ${state.emojiSeen} 个 Emoji · 不参与量表计分</div>`:''}
    </div>
  </div>`;
  document.querySelectorAll('.answer').forEach(b=>b.onclick=()=>{state.answers.push(Number(b.dataset.score));state.index++;renderStep();});
  const ec=$('#emojiClue'); if(ec) ec.onclick=()=>{ if(!ec.classList.contains('found')){state.emojiFound++;ec.classList.add('found');ec.textContent='✓';$('.emoji-counter').textContent=`已找到 ${state.emojiFound} / ${state.emojiSeen} 个 Emoji · 不参与量表计分`; } };
}

function storyLine(scale,item){
  const lines={B:'你走进一条由记忆构成的长廊。这里没有正确答案，只需要如实描述最近的体验。',C:'前方出现几条不同的路。我们不要求你面对任何不想面对的内容，只记录你通常如何应对。',D:'墙上的文字慢慢变成关于自己、他人和世界的感受。继续按最近真实情况作答。',E:'最后一段关注身体、注意力与警觉。',PI:'校园里的信息很多，有些清晰，有些模糊。只描述过去三个月你真实经历的频率。',BE:'这一章节关注思维边界与控制感。原型不对任何单项体验做诊断解释。',PA:'最后几题关注听觉或视觉体验。请选择最接近实际频率的选项。'};
  return lines[item.cluster]||'';
}

function renderRush(){
  const scenarios=RUSH[state.scale], sc=scenarios[state.index];
  if(!sc) return finishRush();
  progress(state.index,scenarios.length);
  $('#gameBody').innerHTML=`<div class="scene"><div class="scene-kicker">实验性 SJT · ${SCALES[state.scale].name} 构念启发</div><h2>${sc.title}</h2><p class="story">${sc.story}</p><div class="rush-options">${sc.options.map((o,i)=>`<button class="rush-option" data-i="${i}">${o[0]}</button>`).join('')}</div>${state.lastReflection?`<div class="reflection">${state.lastReflection}</div>`:''}<div class="safe-note"><strong>重要：</strong>这一模式模仿 HEXACO-RUSH 的“情景判断”形式，但尚未经过效度验证。选择不会被换算成 PCL-5/CAPE-P15 的正式分数。</div></div>`;
  document.querySelectorAll('.rush-option').forEach(b=>b.onclick=()=>{
    const opt=sc.options[Number(b.dataset.i)];
    state.rushSignals[sc.cluster]=(state.rushSignals[sc.cluster]||0)+opt[1];
    state.lastReflection=opt[1]>=4?'这个选择在原型里被标记为“高信号”，但它本身不能说明存在任何诊断。':opt[1]>=2?'这个选择在原型里被标记为“中等信号”，后续研究需要与标准量表对照验证。':'这个选择在原型里被标记为“低信号”；仍不能单凭一次情境决定心理状态。';
    state.index++;renderRush();
  });
}

function finishStandard(){
  $('#game').classList.add('hidden');$('#result').classList.remove('hidden');
  const s=SCALES[state.scale], total=state.answers.reduce((a,b)=>a+b,0), clusters={};
  s.items.forEach((it,i)=>{clusters[it.cluster]=(clusters[it.cluster]||0)+(state.answers[i]||0)});
  const max=s.items.length*(s.id==='pcl5'?4:3);
  const interpretation=s.id==='pcl5' ? pclInterpret(total,state.answers) : capeInterpret(total,clusters);
  $('#result').innerHTML=`<p class="eyebrow">完成 · ${MODES[state.mode].name}</p><h2>${s.name} 原型结果</h2><div class="result-grid"><div class="result-card"><div class="score-big">${total}</div><p>原始频率/严重度总分（本原型） / ${max}</p><p>${interpretation}</p>${state.mode==='emoji'?`<p>Emoji：找到 <strong>${state.emojiFound}</strong> / ${state.emojiSeen}</p>`:''}</div><div class="result-card"><h3>维度概览</h3><div class="bars">${Object.entries(clusters).map(([k,v])=>{const cnt=s.items.filter(i=>i.cluster===k).length,maxc=cnt*(s.id==='pcl5'?4:3);return `<div class="bar-row"><span>${k}</span><div class="bar-track"><div class="bar-fill" style="width:${v/maxc*100}%"></div></div><strong>${v}</strong></div>`}).join('')}</div></div></div><div class="safe-note"><strong>不是诊断结果。</strong> ${s.note}</div>${sourceBlock()}<p><button class="primary" onclick="backHome()">换一种玩法</button></p>`;
  window.scrollTo({top:$('#result').offsetTop-20,behavior:'smooth'});
}
function pclInterpret(total,a){
  const B=a.slice(0,5).filter(x=>x>=2).length,C=a.slice(5,7).filter(x=>x>=2).length,D=a.slice(7,14).filter(x=>x>=2).length,E=a.slice(14,20).filter(x=>x>=2).length;
  return `PCL-5 官方评分允许计算 0–80 总分，并可按 ≥2 作为症状条目阈值查看 B/C/D/E 聚类。本次聚类计数：B=${B}、C=${C}、D=${D}、E=${E}。正式解释应由合格专业人员结合人群、目的和访谈完成。`;
}
function capeInterpret(){return 'Current CAPE-P15 在文献中通常按三个维度观察近期精神病性样体验频率，并可追加困扰度。本原型暂只演示频率层，不设置临床阈值或“高风险”标签。';}
function finishRush(){
  $('#game').classList.add('hidden');$('#result').classList.remove('hidden');
  const entries=Object.entries(state.rushSignals); const max=Math.max(...entries.map(x=>x[1]),1);
  $('#result').innerHTML=`<p class="eyebrow">完成 · HEXACO-RUSH 式原型</p><h2>情景决策信号图</h2><div class="result-card"><div class="bars">${entries.map(([k,v])=>`<div class="bar-row"><span>${k}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><strong>${v}</strong></div>`).join('')}</div></div><div class="safe-note"><strong>实验性结果，不是 ${SCALES[state.scale].name} 分数。</strong> 这一模式故意把量表构念改造成 SJT 式选择，因此必须通过“同一批参与者完成标准量表 + 情景版”的研究重新建立信度、效度、因子结构与阈值。在完成验证前，不应给出 PTSD、精神病风险或任何诊断性反馈。</div>${sourceBlock()}<p><button class="primary" onclick="backHome()">换一种玩法</button></p>`;
  window.scrollTo({top:$('#result').offsetTop-20,behavior:'smooth'});
}
function sourceBlock(){return `<div class="source-list"><h3>研究依据</h3><p>VASSIP：保留原量表项目与反应格式，加入故事化、沉浸与不计分游戏动态。Emoji Game：在 EMA 中加入寻找 emoji 的简单任务以提升依从性。HEXACO-RUSH：用奇幻叙事中的连续情景判断来测量人格构念。详见仓库 README 的 Sources。</p></div>`}

$('#startBtn').onclick=start;$('#backBtn').onclick=backHome;renderLauncher();
