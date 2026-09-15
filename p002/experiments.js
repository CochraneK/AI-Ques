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
    ['B','回宿舍的路','离开图书馆时，一条旧消息突然让你想起那段压力经历。',[['只是短暂想起，注意力很快回到眼前',0],['相关画面和情绪在脑中停留了一阵',1],['相关画面强烈反复出现，很难把注意力移开',2]]],
    ['B','玻璃门前','走进宿舍楼时，一个声音让你产生很强的熟悉感。',[['只是觉得熟悉，仍清楚自己就在这里',0],['有一瞬间像回到当时，但很快恢复',1],['一度强烈感觉事情正在再次发生',2]]],
    ['C','两条路线','第二天去上课时，其中一条路会经过容易勾起回忆的地方。',[['通常仍按原路线经过',0],['有时会犹豫或改走另一条路',1],['几乎总会避开，必要时会改变安排',2]]],
    ['D','午后的邀请','朋友问你要不要参加以前很喜欢的活动。',[['仍然有兴趣参加',0],['兴趣比以前弱，常常拿不定主意',1],['几乎完全提不起兴趣',2]]],
    ['D','一次小失误','你在日常小事上出了错。',[['主要把它看作这件事本身的问题',0],['会有一阵明显的负面想法',1],['很容易扩展成对自己、别人或世界的强烈负面判断',2]]],
    ['E','楼下的巨响','安静时外面突然传来一声很大的撞击声。',[['被吓到一下，很快恢复',0],['明显紧张一阵，需要一点时间恢复',1],['会进入很强的警觉状态，很久都难以放松',2]]],
    ['E','熄灯之后','回到床上已经很晚了。',[['通常可以正常入睡并维持睡眠',0],['有时入睡困难或夜里醒来',1],['经常很难入睡，或睡眠反复中断',2]]],
    ['E','第二天的自习','你打开资料，准备连续完成一项任务。',[['大多数时候能持续专注',0],['注意力会频繁飘走，但还能拉回来',1],['很难维持注意力，任务经常被迫中断',2]]]
  ],
  cape15:[
    ['PI','群聊里的话','你看到群里有人发了一句模糊的话，没有提到任何人的名字。',[['通常不会把它和自己联系起来',0],['会怀疑这句话可能和自己有关',1],['会很确信这句话是在暗指自己',2]]],
    ['PI','经过一群人','你经过几个人身边时，他们刚好停止了交谈。',[['通常不会特别解释这件事',0],['会怀疑他们刚才是不是在谈自己',1],['会很确信他们在联合起来针对自己',2]]],
    ['BE','屏幕上的推荐','你刚想到一件具体的事，设备随后出现了相关内容。',[['通常会把它看作巧合或算法结果',0],['会短暂觉得它和自己的想法有特殊联系',1],['会很确信设备能够影响或读取自己的思维',2]]],
    ['BE','突然出现的念头','脑中突然出现一句与你平时想法不太一样的话。',[['仍会把它看作自己的一个念头',0],['会觉得这个念头有些陌生，不太确定',1],['会很确信这个念头并不属于自己',2]]],
    ['BE','熟悉的人','你在光线不太好的地方看到一个熟悉的人，外表和平时有些不同。',[['仍觉得那就是熟悉的人',0],['会短暂怀疑是不是认错了人',1],['会很确信眼前的人被一个一模一样的人替代了',2]]],
    ['PA','安静的走廊','独处时，你似乎听见有人叫你。',[['不确定是不是周围环境中的声音',0],['觉得像是真的听见了，但仍不能确定',1],['会很确信听到了外界实际并不存在的声音',2]]],
    ['PA','窗边的影子','余光里似乎有一个人影或物体一闪而过。',[['不确定刚才到底看到了什么',0],['会觉得自己可能真的看到了什么',1],['会很确信看到了别人没有同时看到的人或东西',2]]],
    ['PI','第二天的交谈','第二天有人说了一句普通但含义不太明确的话。',[['通常会按字面理解，不特别联系到自己',0],['会怀疑其中可能带有针对自己的意思',1],['会很确信这句话是专门针对自己的暗示',2]]]
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
