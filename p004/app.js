(() => {
'use strict';
const K='bjtu.p004.session.v1', sid='p004_'+Date.now().toString(36), admin=new URLSearchParams(location.search).get('admin')==='1';
const S={
  messages:[],turn:0,
  big:{openness:50,conscientiousness:50,extraversion:50,agreeableness:50,sensitivity:50},
  mbti:{ei:0,sn:0,tf:0,jp:0},
  pub:{curiosity:50,socialEnergy:50,reflection:50,action:50,warmth:50},
  clinical:{
    phqLike:{signal:0,coverage:0,evidenceStrength:0,domains:new Set()},
    gadLike:{signal:0,coverage:0,evidenceStrength:0,domains:new Set()},
    pclLike:{signal:0,coverage:0,evidenceStrength:0,domains:new Set()},
    capeLike:{signal:0,coverage:0,evidenceStrength:0,domains:new Set()}
  },
  evidence:[],safety:{active:false,reason:null}
};
const $=id=>document.getElementById(id);
const R={chat:$('chatLog'),form:$('composer'),input:$('messageInput'),send:$('sendBtn'),turn:$('turnCount'),starters:$('starterWrap'),status:$('portraitStatus'),arc:$('publicArchetype'),sub:$('publicSubtitle'),signals:$('publicSignals'),report:$('reportModal'),reportContent:$('reportContent'),adminBtn:$('adminBtn'),admin:$('adminModal'),personality:$('adminPersonality'),clinical:$('adminClinical'),evidence:$('evidenceList'),about:$('aboutModal')};
const PUB=[['curiosity','探索欲'],['socialEnergy','社交能量'],['reflection','内在思考'],['action','行动倾向'],['warmth','关系温度']];
const BIG=[['openness','Openness'],['conscientiousness','Conscientiousness'],['extraversion','Extraversion'],['agreeableness','Agreeableness'],['sensitivity','Emotional sensitivity']];
const CLIN=[['phqLike','PHQ-like'],['gadLike','GAD-like'],['pclLike','PCL-like'],['capeLike','CAPE-like']];
const L={
 openness:['新鲜','好奇','探索','创意','艺术','旅行','想象','为什么','可能性','不同','学习'],
 conscientiousness:['计划','安排','按时','完成','目标','清单','坚持','规律','效率','负责','准备'],
 extraversion:['朋友','聚会','聊天','认识人','一起','热闹','团队','社交','分享','见面'],
 agreeableness:['理解','照顾','体谅','帮助','倾听','关系','温柔','支持','合作','在意别人'],
 sensitivity:['担心','焦虑','紧张','难过','压力','烦','敏感','害怕','反复想','睡不着','内耗'],
 action:['马上','直接','去做','行动','尝试','开始','决定','执行','解决'],
 reflection:['想了很久','琢磨','反思','思考','意义','原因','回想','想清楚','分析'],
 intro:['一个人','独处','安静','不想说话','人多会累','社交很累','自己待着'],
 sensing:['具体','细节','实际','现实','眼前','事实','步骤'],
 thinking:['逻辑','分析','理性','权衡','成本','效率','证据'],
 feeling:['感受','在意','共情','关系','氛围','难受','开心'],
 judging:['计划','确定','安排','提前','可控','按部就班'],
 perceiving:['随性','临时','看看再说','灵活','随机','顺其自然']
};
const SYM={
 phqLike:{den:8,d:{lowMood:['低落','难过','沮丧','没希望','很绝望','情绪很差'],anhedonia:['没兴趣','提不起兴趣','什么都不想做','没意思','没有乐趣'],sleep:['睡不着','失眠','睡太多','睡不好','早醒'],energy:['没力气','很累','疲惫','精力差'],worth:['觉得自己很差','没用','自责','失败','不值得'],concentration:['注意力','集中不了','无法专注']}},
 gadLike:{den:7,d:{tension:['紧张','焦虑','不安','坐立不安'],worry:['控制不住地担心','停不下来地担心','一直担心','反复担心'],many:['很多事都担心','什么都担心'],relax:['放松不了','没法放松','一直绷着'],irritability:['烦躁','易怒','很容易生气'],catastrophe:['最坏','出事','灾难','不好的事情会发生']}},
 pclLike:{den:4,d:{intrusion:['闪回','噩梦','突然想起','像又发生了一遍','反复出现的记忆'],avoidance:['不敢去','刻意避开','不想提','不想想起','绕开'],cognition:['自责','世界很危险','不相信别人','和别人疏远','麻木'],arousal:['高度警觉','容易受惊','警惕','睡不着','易怒']}},
 capeLike:{den:3,d:{suspiciousness:['有人针对我','联合起来对付我','被监视','暗示我','针对我'],unusualThought:['想法不是我的','思想被控制','脑子里的想法被拿走','别人能听到我的想法'],perception:['听到声音','看到别人看不到','声音在说话']}}
};
const SAFE=['想死','不想活','结束生命','自杀','伤害自己','割腕','跳楼','活不下去'];
const clamp=n=>Math.max(0,Math.min(100,n));
const esc=v=>String(v||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const score=(t,a)=>a.reduce((n,w)=>n+(t.includes(w)?1:0),0);
const time=()=>new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});
function message(role,text,opt){
  opt=opt||{}; S.messages.push({role:role,text:text,at:Date.now()});
  const a=document.createElement('article'); a.className='message '+role;
  const av=document.createElement('div'); av.className='avatar'; av.textContent=role==='agent'?'P4':'你';
  const b=document.createElement('div'); b.className='bubble'+(opt.safety?' safety-bubble':'');
  b.innerHTML=(opt.safety?'<strong>先把安全放在第一位</strong>':'')+'<p>'+esc(text)+'</p><small>'+time()+'</small>';
  a.append(av,b); R.chat.appendChild(a); R.chat.scrollTop=R.chat.scrollHeight; R.turn.textContent=S.turn+' turns';
}
function typing(on){let x=$('typingRow');if(!on){if(x)x.remove();return}x=document.createElement('article');x.id='typingRow';x.className='message agent';x.innerHTML='<div class="avatar">P4</div><div class="bubble"><div class="typing"><i></i><i></i><i></i></div></div>';R.chat.appendChild(x);R.chat.scrollTop=R.chat.scrollHeight}
function analyze(text){
 const t=text.toLowerCase(), before=S.evidence.length;
 const o=score(t,L.openness),c=score(t,L.conscientiousness),e=score(t,L.extraversion),a=score(t,L.agreeableness),n=score(t,L.sensitivity),i=score(t,L.intro),r=score(t,L.reflection),ac=score(t,L.action);
 S.big.openness=clamp(S.big.openness+o*3.2);S.big.conscientiousness=clamp(S.big.conscientiousness+c*3);S.big.extraversion=clamp(S.big.extraversion+e*2.5-i*3.2);S.big.agreeableness=clamp(S.big.agreeableness+a*2.8);S.big.sensitivity=clamp(S.big.sensitivity+n*3);
 S.pub.curiosity=clamp(S.pub.curiosity+o*3.5);S.pub.socialEnergy=clamp(S.pub.socialEnergy+e*2.7-i*3.2);S.pub.reflection=clamp(S.pub.reflection+r*4+n*1.1);S.pub.action=clamp(S.pub.action+ac*4+c*1.5);S.pub.warmth=clamp(S.pub.warmth+a*3.5);
 S.mbti.ei+=e-i;S.mbti.sn+=o+score(t,['抽象','未来','可能'])-score(t,L.sensing);S.mbti.tf+=score(t,L.thinking)-score(t,L.feeling);S.mbti.jp+=score(t,L.judging)-score(t,L.perceiving);
 Object.entries(SYM).forEach(function(entry){
   const key=entry[0],cfg=entry[1],m=S.clinical[key];let hits=0;
   Object.entries(cfg.d).forEach(function(x){const h=score(t,x[1]);if(h){hits+=h;m.domains.add(x[0]);S.evidence.push({dimension:key,domain:x[0],kind:'support',quote:text.length>120?text.slice(0,117)+'…':text,turn:S.turn})}});
   m.signal=clamp(m.signal+(hits?10+Math.min(18,hits*5):-0.8));m.coverage=Math.round(m.domains.size/cfg.den*100);m.evidenceStrength=clamp(Math.round(m.coverage*.55+Math.min(40,S.turn*4)));
 });
 if(SAFE.some(w=>t.includes(w))){S.safety.active=true;S.safety.reason='self-harm language'}
 if(S.evidence.length===before&&text.length>20){const d=o?'openness':c?'conscientiousness':(e||i)?'extraversion':a?'agreeableness':r?'reflection':null;if(d)S.evidence.push({dimension:d,domain:'conversation cue',kind:'support',quote:text.slice(0,120),turn:S.turn})}
 persist();
}
const mbti=()=>''+(S.mbti.ei>=0?'E':'I')+(S.mbti.sn>=0?'N':'S')+(S.mbti.tf>=0?'T':'F')+(S.mbti.jp>=0?'J':'P');
function archetype(){
 const p=S.pub,a=[
  ['探索型思考者',p.curiosity+p.reflection,'喜欢理解事情背后的原因，也愿意靠近新的可能性。'],
  ['温和连接者',p.warmth+p.socialEnergy*.6,'在人与人的互动里，你常常先感受到关系和氛围。'],
  ['安静观察者',p.reflection+(100-p.socialEnergy)*.6,'你更像先在心里搭好地图，再决定要不要向外走。'],
  ['行动实验家',p.action+p.curiosity*.7,'比起一直等待完美答案，你更愿意边走边调整。'],
  ['稳定推进者',p.action+S.big.conscientiousness,'你在意事情能不能被真正推进，也会自然寻找秩序感。']
 ];a.sort((x,y)=>y[1]-x[1]);return{name:a[0][0],sub:a[0][2]}
}
function localReply(text){
 if(S.safety.active)return'你刚才提到的内容让我更关心你此刻是否安全。如果你正准备伤害自己、已经有具体计划，或感觉自己可能无法保证安全，请优先联系当地急救服务、危机热线，或马上去到一个可信任的人身边。你也可以只告诉我：你现在是安全的，还是有立即危险？';
 const t=text.toLowerCase();
 if(/工作|学习|项目|论文|任务/.test(t))return'听起来这件事不只是“忙”，里面可能还有你对自己标准的要求。最近哪一个瞬间最让你觉得：这件事真的在影响我？';
 if(/朋友|关系|对象|同事|家人|父母/.test(t))return'我注意到你说这段关系时，不只是描述发生了什么，也在意彼此是怎么理解对方的。你最希望对方真正明白你的哪一部分？';
 if(/旅行|想去|未来|以后|梦想|如果可以/.test(t))return'这个画面挺有意思。先不考虑“现实不现实”，它吸引你的到底是新鲜感、自由感，还是一种重新开始的感觉？';
 if(/累|压力|焦虑|烦|难过|睡不着/.test(t))return'听起来你已经在这个状态里待了一阵。比起给它下名字，我更想知道：它通常在一天里的什么时候最明显，又会在什么情况下稍微松一点？';
 if(/开心|兴奋|有意思|喜欢|满足/.test(t))return'你说到这里时，整段话的能量明显不一样。这里面最让你“活起来”的部分是什么？';
 if(/一个人|独处|安静|社交/.test(t))return'你似乎不是简单地“喜欢社交”或“不喜欢社交”，更像会挑环境。什么样的人或场合，会让你觉得待久一点也不累？';
 return['我大概抓到一点你在意的东西了。要是把这件事再往里走一步，你觉得自己真正想守住的是什么？','这段话里有一个细节我挺好奇：你当时是先做决定，还是先观察了一阵？','如果把“别人会怎么看”先拿掉，你自己的第一反应会是什么？','听起来你并不是没有答案，而是有几个答案在拉扯。现在声音最大的那个是哪一个？'][S.turn%4];
}
function portrait(){
 const a=archetype();R.arc.textContent=S.turn<2?'正在认识你':a.name;R.sub.textContent=S.turn<2?'先聊几句，画像会慢慢长出来。':a.sub;R.status.textContent=S.turn<2?'刚开始认识':S.turn<5?'轮廓形成中':'画像持续更新';
 R.signals.innerHTML=PUB.map(x=>{const v=Math.round(S.pub[x[0]]);return'<div class="signal"><label>'+x[1]+'</label><div class="signal-track"><div class="signal-fill" style="width:'+v+'%"></div></div><span class="signal-value">'+v+'</span></div>'}).join('');
}
function report(){
 const a=archetype(),m=mbti(),p=S.pub;
 const tiles=[
 ['你如何靠近新事物',p.curiosity>=58?'先探索，再形成自己的判断。':'更喜欢先确认价值，再决定要不要深入。'],
 ['你如何恢复能量',p.socialEnergy>=56?'互动本身常会给你新的线索和动力。':'独处或小范围交流更容易帮你整理思路。'],
 ['你如何做决定',p.action>=57?'愿意先迈出一步，用真实反馈修正方向。':'更倾向于先观察、理解，再选择稳一点的入口。'],
 ['你在人际中的温度',p.warmth>=56?'你会自然留意别人的感受和关系里的细节。':'你更看重真实、边界和是否值得投入。']
 ];
 R.reportContent.innerHTML='<div class="report-archetype"><div><h3>'+esc(a.name)+'</h3><p>'+esc(a.sub)+'</p></div><div class="report-code">'+esc(m)+'</div></div><div class="report-grid">'+tiles.map(x=>'<article class="report-tile"><span>'+esc(x[0])+'</span><h4>'+esc(x[1])+'</h4><p>'+esc(x[1])+'</p></article>').join('')+'</div>';
}
function adminRender(){
 R.personality.innerHTML=BIG.map(x=>{const v=Math.round(S.big[x[0]]);return'<div class="metric-row"><strong>'+x[1]+'</strong><div class="metric-bar"><i style="width:'+v+'%"></i></div><em>'+v+'</em></div>'}).join('')+'<div class="metric-row"><strong>MBTI-like</strong><div class="metric-bar"><i style="width:'+Math.min(100,45+S.turn*4)+'%"></i></div><em>'+mbti()+'</em></div>';
 R.clinical.innerHTML=CLIN.map(x=>{const m=S.clinical[x[0]];return'<article class="clinical-card"><div class="clinical-card-head"><strong>'+x[1]+'</strong><b>'+Math.round(m.signal)+'</b></div><p>Exploratory conversational signal. Not a standardized score.</p><div class="mini-meta"><span>coverage '+m.coverage+'%</span><span>evidence strength '+m.evidenceStrength+'%</span></div></article>'}).join('');
 R.evidence.innerHTML=S.evidence.length?S.evidence.slice().reverse().map(x=>'<div class="evidence-item"><span class="evidence-dim">'+esc(x.dimension)+' · '+esc(x.domain)+'</span><span class="evidence-quote">“'+esc(x.quote)+'”</span><span class="evidence-kind '+esc(x.kind)+'">'+(x.kind==='support'?'支持':'反向')+'</span></div>').join(''):'<div class="empty-evidence">暂无足够证据。继续自然聊天后，这里会逐步出现可追溯线索。</div>';
}
function persist(){
 const c={};Object.entries(S.clinical).forEach(x=>c[x[0]]={signal:x[1].signal,coverage:x[1].coverage,evidenceStrength:x[1].evidenceStrength,domains:Array.from(x[1].domains)});
 const payload={version:2,updatedAt:new Date().toISOString(),sessionId:sid,turns:S.turn,personality:{bigFive:S.big,mbtiLike:mbti()},publicPortrait:Object.assign({},S.pub,{archetype:archetype().name}),clinicalInference:c,evidence:S.evidence,safety:S.safety};
 try{sessionStorage.setItem(K,JSON.stringify(payload))}catch(e){}
 try{window.dispatchEvent(new CustomEvent('p00:session',{detail:{module:'P004',type:'snapshot',snapshot:payload}}))}catch(e){}
}
function download(name,body,type){const b=new Blob([body],{type:type||'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),500)}
function exportJSON(){let o={};try{o=JSON.parse(sessionStorage.getItem(K)||'{}')}catch(e){}download('p004-'+sid+'.json',JSON.stringify(o,null,2))}
function exportCSV(){const rows=[['session_id','turn','dimension','domain','kind','quote']];S.evidence.forEach(e=>rows.push([sid,e.turn,e.dimension,e.domain,e.kind,e.quote]));download('p004-'+sid+'-evidence.csv','\ufeff'+rows.map(r=>r.map(c=>'"'+String(c||'').replace(/"/g,'""')+'"').join(',')).join('\n'),'text/csv;charset=utf-8')}
function open(m){m.classList.remove('hidden');document.body.style.overflow='hidden'}function close(m){m.classList.add('hidden');document.body.style.overflow=''}
async function submit(text){
 text=text.trim();if(!text)return;S.turn++;message('user',text);analyze(text);portrait();R.starters.classList.add('hidden');R.input.value='';resize();R.send.disabled=true;typing(true);await new Promise(r=>setTimeout(r,420));typing(false);
 let reply=null;if(!S.safety.active&&window.P004_API&&window.P004_API.enabled){try{const x=await window.P004_API.chat({sessionId:sid,messages:S.messages.map(m=>({role:m.role,text:m.text})),publicProfile:Object.assign({},S.pub,{archetype:archetype().name})});if(x&&typeof x.reply==='string')reply=x.reply.trim()}catch(e){}}
 if(!reply)reply=localReply(text);message('agent',reply,{safety:S.safety.active});R.send.disabled=false;R.input.focus();
}
function resize(){R.input.style.height='auto';R.input.style.height=Math.min(150,R.input.scrollHeight)+'px'}
R.form.addEventListener('submit',e=>{e.preventDefault();submit(R.input.value)});R.input.addEventListener('input',resize);R.input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();R.form.requestSubmit()}});
document.querySelectorAll('.starter').forEach(b=>b.addEventListener('click',()=>{R.input.value=b.dataset.starter;resize();R.input.focus()}));
$('resetBtn').addEventListener('click',()=>{try{sessionStorage.removeItem(K)}catch(e){}location.reload()});$('openReportBtn').addEventListener('click',()=>{report();open(R.report)});R.adminBtn.addEventListener('click',()=>{adminRender();open(R.admin)});$('aboutBtn').addEventListener('click',()=>open(R.about));
document.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click',()=>close(x.dataset.close==='report'?R.report:x.dataset.close==='admin'?R.admin:R.about)));document.addEventListener('keydown',e=>{if(e.key==='Escape')[R.report,R.admin,R.about].forEach(close)});
$('exportJsonBtn').addEventListener('click',exportJSON);$('exportCsvBtn').addEventListener('click',exportCSV);$('copyReportBtn').addEventListener('click',async()=>{const a=archetype(),t='P004 人物图鉴｜'+a.name+'\n'+a.sub+'\nMBTI-like: '+mbti()+'\n（趣味性对话画像，不是心理诊断）';try{await navigator.clipboard.writeText(t);$('copyReportBtn').textContent='已复制'}catch(e){}});
if(admin)R.adminBtn.classList.remove('hidden');
const shared=window.BJTU_PROFILE&&typeof window.BJTU_PROFILE.getFlat==='function'?window.BJTU_PROFILE.getFlat():{};
if(shared.name&&$('portraitMonogram'))$('portraitMonogram').textContent=shared.name.slice(0,1);
message('agent','我们不用做题。你可以从最近发生的一件小事开始，也可以直接说此刻脑子里最占位置的东西。');portrait();persist();
})();