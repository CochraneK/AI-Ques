// Scenario-based experimental modes for AI-Ques.
// These are research prototypes. They are intentionally kept separate from validated scale scoring.

registerMode('itemscene',
  {name:'逐题情景化', desc:'每一道当前问卷题对应一个生活情景，仍保留一题一映射，便于和直接问卷条件逐题比较。', tag:'一题 ↔ 一情景'},
  {renderStep: renderItemScene}
);
registerMode('construct',
  {name:'构念情景化', desc:'不追求逐题对应，围绕 B/C/D/E 或 PI/BE/PA 构念设计多个独立决策情境。', tag:'构念级 SJT'},
  {renderStep: renderConstructScene}
);
registerMode('aisjt',
  {name:'AI-SJT', desc:'用 AI 生成思路制作多个校园 SJT 变体；当前 Pages 版使用预生成题库，不调用在线模型。', tag:'低成本 AI 题库'},
  {renderStep: renderAISJT}
);
registerMode('psychogat',
  {name:'PsychoGAT-lite', desc:'把量表节点串成连续互动小说：故事会记住你的选择，下一幕继续推进。', tag:'LLM Agent 范式'},
  {renderStep: renderPsychoGAT}
);

const ITEM_SCENES = {
  pcl5:[
    '晚上整理手机相册时，一张与那段压力经历有关的旧照片突然出现在屏幕上。',
    '清晨醒来，你发现昨晚又做了一个和那段经历有关、让人很不舒服的梦。',
    '走在校园里，一个声音或画面突然让你产生“事情又回来了”的感觉。',
    '课堂里出现一个与那段经历相似的例子，你注意到自己的情绪一下被拉高。',
    '经过某个提醒你的地方时，你发现心跳、呼吸或出汗出现明显变化。',
    '朋友无意提到相关话题，你发现自己很想把脑中的记忆和感受推开。',
    '去上课的最短路线会经过一个容易勾起回忆的地方，你需要决定怎么走。',
    '有人问起那次经历的细节，你发现有些重要部分怎么也想不清楚。',
    '一次普通的小挫折后，你很快想到“自己、别人或这个世界可能一直都很糟”。',
    '回想事情经过时，你发现自己不断把原因归到自己或某个人身上。',
    '在看似平静的一天里，恐惧、愤怒、内疚或羞耻突然占据了很大空间。',
    '朋友邀请你参加以前很喜欢的活动，但你发现兴趣明显变弱。',
    '大家在一起聊天时，你却感觉自己像隔着一层玻璃，和别人有距离。',
    '发生一件本来应该开心的事时，你发现自己很难真正感觉到积极情绪。',
    '一次小冲突里，你注意到自己的烦躁或愤怒比过去更容易一下冲上来。',
    '在压力较大时，你发现自己更容易做一些明知可能伤害自己的冒险决定。',
    '坐在公共空间时，你发现自己会不断扫视周围、留意可能的危险。',
    '身后突然掉下一本书或传来巨响，你的身体反应比周围人更强烈。',
    '准备考试时，你坐在桌前，却发现注意力不断被拉走，很难持续集中。',
    '一天结束后已经很累，但你躺下后仍很难入睡，或容易在夜里醒来。'
  ],
  cape15:[
    '你经过食堂一桌同学，他们看到你后突然压低声音，你开始判断这句话是不是在暗指你。',
    '第一次认识一个看起来很友善的人时，你脑中浮现“他也许并不像表面那样”的感觉。',
    '群里出现一句没有点名的抱怨，你开始觉得这可能是在针对或为难自己。',
    '几个人最近总是一起出现，你开始怀疑他们是不是联合起来对付你。',
    '走进教室时有人抬头看你，你开始觉得他们可能因为你的外表而用异样眼光看你。',
    '电脑在你输入文字时突然卡顿和弹窗，你一瞬间把设备和自己的思维联系了起来。',
    '写作时一个刚刚还很清楚的想法突然消失，你产生了“它像被拿走”的体验。',
    '脑中突然出现一个念头，你觉得它异常陌生，像不属于自己。',
    '一个念头非常鲜明，你甚至担心旁边的人也能知道或听见它。',
    '独处时你感觉自己的想法像有回声一样被再次“听见”。',
    '做决定时，你突然觉得自己的行为或想法像被某种外在力量控制。',
    '和熟悉的人说话时，一瞬间你产生“眼前的人像被另一个一模一样的人替代”的感觉。',
    '安静独处时，你似乎听见有人叫你或说话，但身边没有明显声源。',
    '独处时，你似乎听见不止一个声音像在彼此交谈。',
    '余光里出现一个很清楚的人影、物体或动物，但周围的人似乎没有看到。'
  ]
};

const CONSTRUCT_SCENES = {
  pcl5:[
    ['B','突然出现的提醒','手机弹出一条与你过去压力经历有关的内容。你此刻更接近哪种反应？',[['注意到了，但情绪很快回落',0],['会明显难受一阵，脑中反复出现相关内容',2],['像被一下拉回当时，很久都难以恢复',4]]],
    ['C','回家的两条路','一条路更近，但会经过让你不舒服的提醒；另一条路要多走十五分钟。',[['按原计划走，不特别回避',0],['会犹豫，偶尔绕路',2],['几乎总会想办法避开',4]]],
    ['D','朋友发来的邀请','朋友约你参加以前喜欢的活动。',[['有兴趣，愿意去',0],['有些提不起劲，可能临时取消',2],['几乎完全不想参加，也不想见人',4]]],
    ['D','一次普通失误','你在课堂汇报中说错了一句话。',[['把它当成一次普通失误',0],['会反复自责一阵',2],['很快扩展成对自己、他人或世界的强烈负面判断',4]]],
    ['E','图书馆的巨响','安静时外面突然传来很大的撞击声。',[['被吓到一下，很快恢复',0],['明显紧张，需要一会儿恢复',2],['立刻高度戒备，很久难以放松',4]]],
    ['E','期末周的夜晚','任务很多，你已经躺下，但脑子仍停不下来。',[['多数时候还能正常休息',0],['有几晚明显睡不好',2],['常常很难入睡或持续睡眠',4]]]
  ],
  cape15:[
    ['PI','没有点名的消息','群聊里有人发了一句模糊的话，没有点名。',[['信息不足，不和自己联系',0],['会怀疑是不是在说自己',2],['很确定是在暗指或针对自己',4]]],
    ['PI','走过一群同学','几个人在你经过时突然安静下来。',[['更可能理解为巧合',0],['会觉得有些可疑',2],['很确定他们在联合起来谈论或针对自己',4]]],
    ['BE','电脑的异常弹窗','电脑突然弹出一个陌生窗口。',[['把它当技术问题',0],['短暂联想到自己的想法',2],['明显感觉设备在影响、读取或回应自己的思维',4]]],
    ['BE','陌生的念头','一个念头突然进入脑中。',[['认为这是自己的普通念头',0],['觉得有点陌生但不确定',2],['很确定这个念头并不属于自己',4]]],
    ['PA','安静房间里的声音','独处时似乎听见有人叫名字。',[['先确认环境，更像听错了',0],['无法确定是否真的听见',2],['很确定听见了外界并不存在的声音',4]]],
    ['PA','余光里的影子','窗边似乎有个影子一闪而过。',[['确认后就不再在意',0],['会怀疑自己刚才是不是看到了什么',2],['确信看见了别人没有看到的东西',4]]]
  ]
};

const AI_SJT_BANK = {
  pcl5:[
    ['B','AI-SJT / 深夜通知','凌晨准备睡觉时，一个应用推送的标题意外勾起过去的压力经历。',['只是注意到标题，然后继续原本的事','情绪被影响，之后会反复想到','明显像重新经历一样，注意力很难离开','身体和情绪反应都很强，需要很久缓下来']],
    ['C','AI-SJT / 校园路线','临时教室调整后，导航给出的路线会经过一个让你很不舒服的区域。',['照常经过','会犹豫，但可能还是走过去','倾向于绕开，即使更麻烦','宁可放弃这次安排也不靠近']],
    ['D','AI-SJT / 社团消息','曾经喜欢的社团通知今晚有活动。',['觉得挺期待','兴趣比以前弱，但可能参加','大概率取消','完全没有兴趣，也不想和别人接触']],
    ['E','AI-SJT / 实验室报警','实验室测试警报突然响起。',['短暂惊一下后恢复','明显紧张一会儿','之后持续警觉周围声音','长时间无法放松并不断确认危险']],
    ['E','AI-SJT / 考试复习','你给自己留了两小时复习。',['能持续完成计划','偶尔走神但能回来','注意力频繁中断','几乎无法维持注意']],
    ['D','AI-SJT / 导师反馈','导师说“这版还需要重做”。',['把它理解为针对作业的反馈','会难受一阵但仍能区分任务和自我','很快变成强烈自责或负面判断','由此确认自己/别人/世界都很糟']]
  ],
  cape15:[
    ['PI','AI-SJT / 群聊省略号','你发言后，群里有人只回了“……”然后另起了话题。',['不作特别解释','会想一下是不是和自己有关','越来越觉得是在暗示自己','很确定这是一种针对自己的信号']],
    ['PI','AI-SJT / 食堂眼神','你端着餐盘经过时，两个人抬头看了你一眼。',['认为只是自然注意','有点在意','会怀疑他们是不是在议论自己','很确定他们的目光带有针对性']],
    ['BE','AI-SJT / 推荐算法','你刚想到一件事，短视频很快推荐了类似内容。',['觉得是算法巧合','短暂觉得有点神奇','怀疑设备和自己的想法存在特殊联系','很确定设备能够读取或影响自己的思维']],
    ['BE','AI-SJT / 一闪而过的念头','一个与你平时想法不太一致的念头突然出现。',['把它看作普通的心理活动','感觉有些陌生','怀疑它是不是来自自己以外','很确定这个念头不是自己的']],
    ['PA','AI-SJT / 空教室','你一个人在空教室时，似乎听见身后有人说话。',['回头确认后认为可能是环境声音','不确定是否真的听到了','觉得声音很清楚但找不到来源','确信听见了别人并未听到的声音']],
    ['PA','AI-SJT / 楼梯转角','余光里像有人从转角经过，但回头没有人。',['当作视觉错觉','会有点疑惑','认为自己可能真的看见了什么','确信那里刚才存在别人看不到的人或东西']]
  ]
};

const PSYCHOGAT_NODES = {
  pcl5:[
    ['B','雨夜的通知','你从图书馆出来，雨刚停。手机亮起，一条旧群聊被重新顶到最上面，它与你过去的一段压力经历有关。',['锁屏，把注意力放回回宿舍这件事上',0],['点开消息，记忆和情绪一下涌上来',1]],
    ['B','玻璃门上的倒影','走进宿舍楼时，一阵声音让你突然有种熟悉得过头的感觉。',['确认当下环境，继续往前走',0],['停下来，感觉自己像又回到了那个时刻',1]],
    ['C','电梯还是楼梯','电梯里有人正在聊一个容易勾起回忆的话题。',['照常乘电梯',0],['转身走楼梯，尽量避开这个话题',1]],
    ['C','明天的路线','你发现明天的活动地点就在一个让你不舒服的区域附近。',['先按计划安排，不提前回避',0],['立刻开始找各种办法绕开那里',1]],
    ['D','室友的邀请','室友问要不要一起去吃夜宵，这是以前你很喜欢的事。',['愿意一起去，哪怕只待一会儿',0],['拒绝邀请，也不太想和任何人接触',1]],
    ['D','走廊里的失误','你拿错了别人放在门口的快递，马上又放了回去。',['把它当成普通失误',0],['很快陷入强烈自责和负面判断',1]],
    ['E','楼下的巨响','楼下突然传来很大的金属撞击声。',['被吓一下后逐渐恢复',0],['立刻进入高度警觉，持续确认周围',1]],
    ['E','熄灯之后','回到床上已经很晚了。',['身体慢慢放松，准备睡觉',0],['很累却始终难以放松或入睡',1]],
    ['E','第二天的自习','你打开复习资料准备完成一章。',['能把注意力拉回任务',0],['注意力持续被打断，很难继续',1]],
    ['D','朋友的信息','朋友发来一句“最近没怎么看见你”。',['理解为关心，愿意回应',0],['感觉自己和别人越来越远，选择不回应',1]]
  ],
  cape15:[
    ['PI','未读消息','你进入一个很久没说话的群，刚好看到有人发“有些人真的很奇怪”。',['不把没有指向的信息自动和自己联系',0],['觉得这句话很可能就是在暗指自己',1]],
    ['PI','便利店门口','经过两个人身边时，他们突然停止说话。',['认为存在很多普通解释',0],['越来越确定他们刚才在谈论自己',1]],
    ['PI','朋友圈照片','一张合照里大家的表情都很普通。',['把它当作普通合照',0],['觉得其中某些表情像带着针对自己的暗示',1]],
    ['BE','深夜的推荐','你刚想到一件很具体的事，应用立刻推荐了相关内容。',['想到推荐算法和巧合',0],['感觉设备似乎在读取或影响自己的思维',1]],
    ['BE','突然消失的想法','一个刚刚很清楚的想法突然想不起来。',['认为是常见的遗忘',0],['感觉那个想法像被某种力量拿走',1]],
    ['BE','陌生念头','脑中出现一句与你平时很不同的话。',['仍把它视为自己脑中的一个念头',0],['很确定这句话并不属于自己',1]],
    ['BE','熟悉的脸','远处一个熟人走来，因为光线原因看起来有些不同。',['走近后按现实信息确认是谁',0],['产生很强的“他被另一个一模一样的人替代”的感觉',1]],
    ['PA','空走廊','夜里走廊很安静，你似乎听见有人叫你。',['先检查声源并保留不确定',0],['很确定存在一个别人没有听到的声音',1]],
    ['PA','窗边','余光里好像有个身影闪过。',['回头确认后把它视为可能的视觉错觉',0],['确信自己看见了别人看不到的人或东西',1]],
    ['PI','故事的出口','第二天有人问你昨晚怎么了。',['愿意说“有些体验我还不确定，需要再确认”',0],['认为这些线索已经足以证明别人正在针对自己',1]]
  ]
};

function renderItemScene(){
  const scale=SCALES[state.scale], item=scale.items[state.index];
  if(!item) return finishMappedExperiment('逐题情景化');
  progress(state.index, scale.items.length);
  const scene=ITEM_SCENES[state.scale][state.index];
  $('#gameBody').innerHTML=`<div class="scene"><div class="scene-kicker">逐题映射 · ${scale.name} #${item.id}</div><h2>把这一题放进一个具体时刻</h2><p class="story">${scene}</p><div class="question-card"><div class="question-id">对应构念：${item.cluster} · 与直接问卷题一一映射</div><div class="question">回看 ${scale.window}，这种情形与你的真实体验有多接近？</div><div class="answers">${scale.choices.map((c,i)=>`<button class="answer" data-score="${i}"><span>${c}</span><span class="score">${i+(scale.scoreOffset||0)}</span></button>`).join('')}</div><div class="safe-note">这一版改变了题目呈现，因此这里的映射分数只用于与直接问卷条件做研究比较，不能直接宣称等同于正式量表分数。</div></div></div>`;
  document.querySelectorAll('.answer').forEach(b=>b.onclick=()=>{state.answers.push(Number(b.dataset.score)+(scale.scoreOffset||0));state.index++;renderItemScene();});
}

function renderConstructScene(){
  const rows=CONSTRUCT_SCENES[state.scale], sc=rows[state.index];
  if(!sc) return finishSignalExperiment('构念情景化');
  progress(state.index,rows.length);
  $('#gameBody').innerHTML=`<div class="scene"><div class="scene-kicker">构念级 SJT · ${sc[0]}</div><h2>${sc[1]}</h2><p class="story">${sc[2]}</p><div class="rush-options">${sc[3].map((o,i)=>`<button class="rush-option" data-i="${i}">${o[0]}</button>`).join('')}</div><div class="safe-note">这里不再逐题对应原量表，而是让一个情景同时承载某个构念的行为信号。</div></div>`;
  document.querySelectorAll('.rush-option').forEach(b=>b.onclick=()=>{const o=sc[3][Number(b.dataset.i)];state.expSignals[sc[0]]=(state.expSignals[sc[0]]||0)+o[1];state.index++;renderConstructScene();});
}

function renderAISJT(){
  const rows=AI_SJT_BANK[state.scale], sc=rows[state.index];
  if(!sc) return finishSignalExperiment('AI-SJT（预生成题库）');
  progress(state.index,rows.length);
  const cluster=sc[0];
  $('#gameBody').innerHTML=`<div class="scene"><div class="scene-kicker">AI-SJT · 预生成缓存 · ${cluster}</div><h2>${sc[1]}</h2><p class="story">${sc[2]}</p><div class="rush-options">${sc[3].map((o,i)=>`<button class="rush-option" data-i="${i}">${o}</button>`).join('')}</div><div class="safe-note"><strong>当前为零后端版本。</strong> 这些题目是按“构念 → 校园情境 → 梯度行为选项”的 AI-SJT 生成逻辑预先制作并缓存的。后续接模型时，应加入专家审核、去偏差、难度控制和版本冻结。</div></div>`;
  document.querySelectorAll('.rush-option').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.i);const score=[0,1,2,4][i]??i;state.expSignals[cluster]=(state.expSignals[cluster]||0)+score;state.index++;renderAISJT();});
}

function renderPsychoGAT(){
  const nodes=PSYCHOGAT_NODES[state.scale], node=nodes[state.index];
  if(!node) return finishPsychoGAT();
  progress(state.index,nodes.length);
  const memory=state.psychoMemory.slice(-2).join(' ') || '故事刚刚开始，还没有形成前序记忆。';
  $('#gameBody').innerHTML=`<div class="scene"><div class="scene-kicker">PsychoGAT-lite · 回合 ${state.index+1}/${nodes.length} · ${node[0]}</div><h2>${node[1]}</h2><p class="story">${node[2]}</p>${state.index?`<div class="reflection"><strong>Story Memory</strong><br>${memory}</div>`:''}<div class="rush-options">${node[3].map((o,i)=>`<button class="rush-option" data-i="${i}">${o[0]}</button>`).join('')}</div><div class="source-list"><p><strong>Designer → Controller → Critic → Evaluator</strong></p><p>这里用预生成内容模拟 PsychoGAT 的多代理工作流：量表构念决定故事节点；上一轮选择写入记忆；下一轮继续同一故事；评分隐藏在选择背后。</p></div><div class="safe-note">这是对论文范式的静态低成本复刻，不是作者官方代码，也不是经过验证的 ${SCALES[state.scale].name} 替代测验。</div></div>`;
  document.querySelectorAll('.rush-option').forEach(b=>b.onclick=()=>{const o=node[3][Number(b.dataset.i)];state.psychoScore+=o[1];state.expSignals[node[0]]=(state.expSignals[node[0]]||0)+o[1];state.psychoMemory.push(o[1]?'你在上一幕选择了更贴近目标构念的一条故事路径。':'你在上一幕选择了较少体现目标构念的一条故事路径。');state.index++;renderPsychoGAT();});
}

function finishMappedExperiment(label){
  $('#game').classList.add('hidden');$('#result').classList.remove('hidden');
  const s=SCALES[state.scale], total=state.answers.reduce((a,b)=>a+b,0), clusters={};
  s.items.forEach((it,i)=>clusters[it.cluster]=(clusters[it.cluster]||0)+(state.answers[i]||0));
  $('#result').innerHTML=`<p class="eyebrow">完成 · ${label}</p><h2>逐题情景映射结果</h2><div class="result-grid"><div class="result-card"><div class="score-big">${total}</div><p>情景映射总分，仅用于研究比较。</p><p>下一步最关键的是让同一参与者完成“直接问卷条件 + 此版本”，逐题检查相关与系统偏差。</p></div><div class="result-card"><h3>映射维度</h3>${signalBars(clusters)}</div></div><div class="safe-note"><strong>不是正式 ${s.name} 分数。</strong> 题干已经情景化，必须重新检验测量等价性。</div>${experimentalSourceBlock()}<p><button class="primary" onclick="backHome()">换一种玩法</button></p>`;
}

function finishSignalExperiment(label){
  $('#game').classList.add('hidden');$('#result').classList.remove('hidden');
  $('#result').innerHTML=`<p class="eyebrow">完成 · ${label}</p><h2>实验性情景信号</h2><div class="result-card">${signalBars(state.expSignals)}</div><div class="safe-note"><strong>构念信号，不是量表分数。</strong> 需要与标准版本做收敛效度、区分效度、重测信度和必要的因子结构验证。</div>${experimentalSourceBlock()}<p><button class="primary" onclick="backHome()">换一种玩法</button></p>`;
}

function finishPsychoGAT(){
  $('#game').classList.add('hidden');$('#result').classList.remove('hidden');
  $('#result').innerHTML=`<p class="eyebrow">完成 · PsychoGAT-lite</p><h2>10 回合互动小说完成</h2><div class="result-grid"><div class="result-card"><div class="score-big">${state.psychoScore}</div><p>隐藏二元路径总和 / 10，仅用于这个原型内部。</p><p>真正的 PsychoGAT 论文使用 LLM Designer、Controller、Critic 与硬编码 psychometric evaluator；本页为预生成的低成本结构演示。</p></div><div class="result-card"><h3>故事中的构念信号</h3>${signalBars(state.expSignals)}</div></div><div class="safe-note"><strong>不要把这个数解释为 ${SCALES[state.scale].name} 得分、风险或诊断。</strong></div>${experimentalSourceBlock()}<p><button class="primary" onclick="backHome()">换一种玩法</button></p>`;
}

function signalBars(obj){
  const e=Object.entries(obj); const max=Math.max(...e.map(x=>x[1]),1);
  return `<div class="bars">${e.map(([k,v])=>`<div class="bar-row"><span>${k}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><strong>${v}</strong></div>`).join('')}</div>`;
}

function experimentalSourceBlock(){return `<div class="source-list"><h3>这四种模式的区别</h3><p><strong>逐题情景化</strong>保留 item-level 一一映射；<strong>构念情景化</strong>只保留 construct-level 对应；<strong>AI-SJT</strong>强调自动生成多个标准化情景候选；<strong>PsychoGAT</strong>进一步把量表节点串成带记忆的连续互动小说。</p><p>PsychoGAT: Yang et al., ACL 2024, doi:10.18653/v1/2024.acl-long.779。</p></div>`}

renderLauncher();