// Evidence-backed experimental mode kept separate from core questionnaire/gamification modes.
// PsychoGAT reference: Yang et al. (ACL 2024), DOI 10.18653/v1/2024.acl-long.779.
// This static prototype mirrors the interaction architecture, not the validated implementation.

registerMode(
  'psychogat',
  {
    name:'PsychoGAT 式',
    desc:'以连续互动小说呈现情境选择；当前静态版使用冻结场景，不做 LLM 动态生成。'
  },
  {renderStep: renderPsychoGAT}
);

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

function renderPsychoGAT(){
  const nodes=PSYCHOGAT_NODES[state.scale], node=nodes[state.index];
  if(!node) return finishPsychoGAT();
  progress(state.index+1,nodes.length);
  $('#gameBody').innerHTML=`<div class="scene"><div class="scene-kicker">第 ${state.index+1} 幕 / ${nodes.length}</div><h2>${node[1]}</h2><p class="story">${node[2]}</p><div class="rush-options">${node[3].map((o,i)=>`<button class="rush-option" data-i="${i}">${o[0]}</button>`).join('')}</div>${state.index===0?'<p class="mode-note">请选择最接近你的反应。故事会按固定场景继续。</p>':''}</div>`;
  document.querySelectorAll('.rush-option').forEach(b=>b.onclick=()=>{
    const o=node[3][Number(b.dataset.i)];
    state.psychoScore+=o[1];
    state.expSignals[node[0]]=(state.expSignals[node[0]]||0)+o[1];
    state.index++;
    renderPsychoGAT();
  });
}

function finishPsychoGAT(){
  $('#game').classList.add('hidden');$('#result').classList.remove('hidden');
  if(!SHOW_RESEARCH){
    $('#result').innerHTML=participantCompletion();
    return;
  }
  $('#result').innerHTML=`<p class="eyebrow">Research view · PsychoGAT 式</p><h2>连续互动小说信号</h2><div class="result-grid"><div class="result-card"><div class="score-big">${state.psychoScore}</div><p>冻结路径信号，仅用于原型内部。</p></div><div class="result-card"><h3>构念信号</h3>${signalBars(state.expSignals)}</div></div><div class="safe-note"><strong>研究检查视图。</strong> 当前为 PsychoGAT-inspired 静态流程，不等同于论文中的 LLM-agent 实现。</div><p><button class="primary" onclick="backHome()">返回</button></p>`;
}

function signalBars(obj){
  const e=Object.entries(obj); const max=Math.max(...e.map(x=>x[1]),1);
  return `<div class="bars">${e.map(([k,v])=>`<div class="bar-row"><span>${k}</span><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><strong>${v}</strong></div>`).join('')}</div>`;
}


renderLauncher();
