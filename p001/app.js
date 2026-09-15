(function(){
const FACETS=[{"id":"N1","domain":"N","source_facet":"Anxiety","label":"容易担心","desc":"遇到不确定时，脑子容易提前想很多。","domain_label":"情绪反应","color":"#FF7094"},{"id":"N2","domain":"N","source_facet":"Anger","label":"容易烦躁","desc":"事情不顺时，情绪容易一下被点燃。","domain_label":"情绪反应","color":"#FF7094"},{"id":"N3","domain":"N","source_facet":"Depression","label":"容易低落","desc":"有时会更容易陷进失落或没劲的状态。","domain_label":"情绪反应","color":"#FF7094"},{"id":"N4","domain":"N","source_facet":"Self-Consciousness","label":"很在意别人怎么看","desc":"在人群里或被关注时，容易紧张或自我意识变强。","domain_label":"情绪反应","color":"#FF7094"},{"id":"N5","domain":"N","source_facet":"Immoderation","label":"容易被诱惑带着走","desc":"面对即时诱惑时，有时很难马上收住。","domain_label":"情绪反应","color":"#FF7094"},{"id":"N6","domain":"N","source_facet":"Vulnerability","label":"压力大时容易慌乱","desc":"事情一多时，容易觉得自己一下应付不过来。","domain_label":"情绪反应","color":"#FF7094"},{"id":"E1","domain":"E","source_facet":"Friendliness","label":"容易亲近别人","desc":"和人相处时，通常比较容易释放友好。","domain_label":"活力连接","color":"#FFAE55"},{"id":"E2","domain":"E","source_facet":"Gregariousness","label":"喜欢和大家待在一起","desc":"和一群人一起时，往往更有能量。","domain_label":"活力连接","color":"#FFAE55"},{"id":"E3","domain":"E","source_facet":"Assertiveness","label":"敢表达自己的想法","desc":"需要发声时，比较愿意把自己的意见说出来。","domain_label":"活力连接","color":"#FFAE55"},{"id":"E4","domain":"E","source_facet":"Activity Level","label":"行动节奏快","desc":"喜欢让生活动起来，不太习惯一直停着。","domain_label":"活力连接","color":"#FFAE55"},{"id":"E5","domain":"E","source_facet":"Excitement-Seeking","label":"喜欢新鲜和刺激","desc":"更容易被新体验、新挑战吸引。","domain_label":"活力连接","color":"#FFAE55"},{"id":"E6","domain":"E","source_facet":"Cheerfulness","label":"容易感到愉快","desc":"日常里比较容易捕捉到轻松和开心。","domain_label":"活力连接","color":"#FFAE55"},{"id":"O1","domain":"O","source_facet":"Imagination","label":"有想象力","desc":"脑海里常能展开画面、故事或不同可能。","domain_label":"探索想象","color":"#9E8BFF"},{"id":"O2","domain":"O","source_facet":"Artistic Interests","label":"对美和艺术敏感","desc":"容易被音乐、视觉、文字或审美体验打动。","domain_label":"探索想象","color":"#9E8BFF"},{"id":"O3","domain":"O","source_facet":"Emotionality","label":"能感到细腻的情绪","desc":"会留意自己内在情绪的细小变化。","domain_label":"探索想象","color":"#9E8BFF"},{"id":"O4","domain":"O","source_facet":"Adventurousness","label":"愿意尝试不同的事","desc":"面对陌生体验时，通常愿意迈出去看看。","domain_label":"探索想象","color":"#9E8BFF"},{"id":"O5","domain":"O","source_facet":"Intellect","label":"喜欢把问题想明白","desc":"会享受思考、讨论和理解复杂问题。","domain_label":"探索想象","color":"#9E8BFF"},{"id":"O6","domain":"O","source_facet":"Liberalism","label":"愿意重新看待旧观点","desc":"遇到新证据时，比较愿意调整原来的看法。","domain_label":"探索想象","color":"#9E8BFF"},{"id":"A1","domain":"A","source_facet":"Trust","label":"愿意信任别人","desc":"更容易先相信多数人是善意的。","domain_label":"关系关怀","color":"#5ED5A1"},{"id":"A2","domain":"A","source_facet":"Morality","label":"真诚守原则","desc":"更看重坦诚和不绕弯子的相处方式。","domain_label":"关系关怀","color":"#5ED5A1"},{"id":"A3","domain":"A","source_facet":"Altruism","label":"乐于帮助别人","desc":"看到别人需要时，比较愿意伸手帮忙。","domain_label":"关系关怀","color":"#5ED5A1"},{"id":"A4","domain":"A","source_facet":"Cooperation","label":"愿意合作","desc":"发生分歧时，更愿意寻找双方都能接受的办法。","domain_label":"关系关怀","color":"#5ED5A1"},{"id":"A5","domain":"A","source_facet":"Modesty","label":"不太需要把自己放在中心","desc":"不太依赖炫耀自己来获得存在感。","domain_label":"关系关怀","color":"#5ED5A1"},{"id":"A6","domain":"A","source_facet":"Sympathy","label":"容易体会别人的感受","desc":"别人难受时，比较容易产生共情。","domain_label":"关系关怀","color":"#5ED5A1"},{"id":"C1","domain":"C","source_facet":"Self-Efficacy","label":"相信自己能把事做成","desc":"遇到任务时，通常相信自己有办法处理。","domain_label":"行动秩序","color":"#52B6E8"},{"id":"C2","domain":"C","source_facet":"Orderliness","label":"喜欢有条理","desc":"更喜欢把东西、计划和步骤安排清楚。","domain_label":"行动秩序","color":"#52B6E8"},{"id":"C3","domain":"C","source_facet":"Dutifulness","label":"有责任心","desc":"答应过的事，会倾向于认真完成。","domain_label":"行动秩序","color":"#52B6E8"},{"id":"C4","domain":"C","source_facet":"Achievement-Striving","label":"愿意为目标投入","desc":"有目标时，比较愿意持续往前推。","domain_label":"行动秩序","color":"#52B6E8"},{"id":"C5","domain":"C","source_facet":"Self-Discipline","label":"能让自己坚持下去","desc":"即使不太想做，也比较能继续推进。","domain_label":"行动秩序","color":"#52B6E8"},{"id":"C6","domain":"C","source_facet":"Cautiousness","label":"做决定前会多想一步","desc":"行动前会留意后果，不太喜欢完全凭冲动。","domain_label":"行动秩序","color":"#52B6E8"}], DOMAINS={"N":{"label":"情绪反应","color":"#FF7094"},"E":{"label":"活力连接","color":"#FFAE55"},"O":{"label":"探索想象","color":"#9E8BFF"},"A":{"label":"关系关怀","color":"#5ED5A1"},"C":{"label":"行动秩序","color":"#52B6E8"}}, VALUES=[{"id":"growth","label":"有所成长","category":"growth","desc":"持续学习、进步和拓展自己。"},{"id":"curiosity","label":"保持好奇","category":"growth","desc":"愿意理解新事物，也愿意继续提问。"},{"id":"creativity","label":"创造新的东西","category":"growth","desc":"把想法变成作品、方案或新的可能。"},{"id":"courage","label":"面对困难的勇气","category":"growth","desc":"遇到不容易的事，也愿意试着往前。"},{"id":"autonomy","label":"自主选择","category":"agency","desc":"能按照自己的价值和判断作决定。"},{"id":"purpose","label":"有意义和方向","category":"agency","desc":"知道自己为什么做一件事，也有想去的方向。"},{"id":"responsibility","label":"承担责任","category":"agency","desc":"愿意为自己的选择和任务负责。"},{"id":"dependability","label":"做可靠的人","category":"agency","desc":"答应的事情尽量做到，让别人可以信任。"},{"id":"friendship","label":"有亲近的朋友","category":"connection","desc":"拥有可以分享、支持彼此的朋友。"},{"id":"belonging","label":"有归属感","category":"connection","desc":"在一些人和地方里感到自己属于这里。"},{"id":"caring","label":"关心别人","category":"connection","desc":"愿意留意身边人的感受和需要。"},{"id":"cooperation","label":"彼此合作","category":"connection","desc":"和别人一起把事情做好，而不是只靠自己。"},{"id":"inner_peace","label":"内心平和","category":"wellbeing","desc":"生活里能留住一些安定和松弛。"},{"id":"self_acceptance","label":"接纳自己","category":"wellbeing","desc":"看见自己的不同状态，也不过分苛责自己。"},{"id":"hope","label":"保持希望","category":"wellbeing","desc":"困难的时候，仍然相信事情有变化的可能。"},{"id":"leisure","label":"有休息和享受的时间","category":"wellbeing","desc":"给生活留出休息、兴趣和享受的空间。"}], VALUE_CATEGORIES={"growth":{"label":"成长与探索","color":"#FF9A62"},"agency":{"label":"自主与担当","color":"#55A6E8"},"connection":{"label":"关系与连接","color":"#59C49A"},"wellbeing":{"label":"内在与生活","color":"#A78BDA"}}, CONTEXTS=[{"id":"morning","label":"早晨"},{"id":"class","label":"上课"},{"id":"study","label":"自习"},{"id":"lab","label":"科研"},{"id":"dorm","label":"宿舍"},{"id":"canteen","label":"吃饭"},{"id":"friends","label":"朋友"},{"id":"club","label":"兴趣"},{"id":"relationship","label":"亲密关系"},{"id":"career","label":"实习求职"},{"id":"exam","label":"考试准备"},{"id":"exercise","label":"运动"},{"id":"rest","label":"独处休息"},{"id":"family","label":"家庭"},{"id":"money","label":"消费"},{"id":"city","label":"出行"},{"id":"night","label":"睡前"},{"id":"other","label":"其他"}], OBSTACLES=[{"id":"procrastination","label":"总想再等等 / 拖延"},{"id":"perfectionism","label":"总觉得还不够好"},{"id":"fear_failure","label":"担心失败"},{"id":"evaluation","label":"太在意别人怎么看"},{"id":"uncertain","label":"不知道自己到底想要什么"},{"id":"start","label":"不知道从哪里开始"},{"id":"phone","label":"容易被手机 / 信息打断"},{"id":"motivation","label":"很难提起劲"},{"id":"fatigue","label":"太累 / 睡眠不够"},{"id":"time","label":"时间总是不够"},{"id":"workload","label":"课程 / 任务太多"},{"id":"relationship","label":"人际关系让我分心"},{"id":"emotion","label":"情绪一来就容易停住"},{"id":"resources","label":"缺少资源 / 支持"},{"id":"future_uncertainty","label":"对未来的不确定让我犹豫"},{"id":"comparison","label":"总在和别人比较"},{"id":"confidence","label":"怀疑自己能不能做到"},{"id":"habit","label":"老习惯很容易把我拉回去"},{"id":"other","label":"还有别的"}], ACTIONS=[{"id":"five_minutes","label":"只做 5 分钟"},{"id":"one_step","label":"只列下一步"},{"id":"break_down","label":"把任务拆小"},{"id":"remove_distraction","label":"先关掉一个干扰"},{"id":"short_break","label":"休息 10 分钟"},{"id":"walk","label":"出去走一小圈"},{"id":"talk","label":"找一个人聊聊"},{"id":"ask_help","label":"直接寻求帮助"},{"id":"write_three","label":"写下最重要的 3 件事"},{"id":"sleep_first","label":"先把睡眠补回来"},{"id":"other","label":"其他办法"}];
const FUTURE_PROMPTS=["别忘了照顾自己","继续保持好奇","不必着急证明什么","希望你还记得今天为什么出发"], REPLY_PROMPTS=["你已经走得比想象中远了","放心，有些事会慢慢变清楚","谢谢你没有放弃","别只顾着赶路，也看看身边"];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const stages=['entry','currentSwipe','currentRank','idealSwipe','idealRank','valueSwipe','valueRank','futureDistance','futureOverlap','futureDay','obstacle','messages','result'];
const facetMap=Object.fromEntries(FACETS.map(x=>[x.id,x])), valueMap=Object.fromEntries(VALUES.map(x=>[x.id,x]));
const state={participant_id:null,session_id:null,public_code:null,stage:'entry',settings:{orb_theme:'sunlight',future_horizon_key:'future',future_horizon_label:'未来',stj_budget:24},currentDeck:[],idealDeck:[],valueDeck:[],currentSwipeIndex:0,idealSwipeIndex:0,valueSwipeIndex:0,currentSwipeHistory:[],idealSwipeHistory:[],valueSwipeHistory:[],currentSelected:[],idealSelected:[],valueSelected:[],currentRank:[],idealRank:[],valueRank:[],currentStats:{},idealStats:{},valueStats:{},futureDistance:50,distanceTouched:false,futureOverlap:0,overlapTouched:false,contexts:[],contextOther:'',obstacles:[],obstacleOther:'',actionId:null,actionOther:'',profileSnapshot:{},futureMessage:'',futureReply:'',posterStyle:'diary',started:Date.now()};
const pending=[];let currentResult=null,recognition=null,stjController=null;
const stageEls=$$('.stage'),prog=$('#progress');stages.forEach((_,i)=>{const d=document.createElement('i');if(!i)d.className='on';prog.appendChild(d)});const dots=[...prog.children];
function icons(){try{window.lucide?.createIcons()}catch(e){}}
function show(stage){state.stage=stage;stageEls.forEach(x=>x.classList.toggle('on',x.dataset.stage===stage));dots.forEach((d,i)=>d.classList.toggle('on',stages[i]===stage));window.scrollTo({top:0,behavior:'smooth'});log('stage_view',{stage});icons()}
async function api(path,method='GET',body=null){const r=await fetch(path,{method,headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):null});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'request_failed');return d}
function log(type,payload={}){if(!state.participant_id||!state.session_id)return Promise.resolve();const p=fetch('/api/student/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({participant_id:state.participant_id,session_id:state.session_id,event_type:type,stage:state.stage,payload,ts_ms:Date.now()})}).catch(()=>{});pending.push(p);return p}
function seededShuffle(a,seed){let s=0;for(const ch of String(seed))s=(s*31+ch.charCodeAt(0))>>>0;const x=[...a];for(let i=x.length-1;i>0;i--){s=(1664525*s+1013904223)>>>0;const j=s%(i+1);[x[i],x[j]]=[x[j],x[i]]}return x}
function applySettings(s){Object.assign(state.settings,s||{});document.body.classList.remove('theme-sunlight','theme-garden','theme-sky');document.body.classList.add('theme-'+(state.settings.orb_theme||'sunlight'));$('#entryHorizon').textContent=state.settings.future_horizon_label||'未来';$$('.hzLabel').forEach(x=>x.textContent=state.settings.future_horizon_label||'未来')}
api('/api/settings').then(applySettings).catch(()=>{});
window.addEventListener('load',()=>{icons();try{window.tsParticles?.load({id:'ambientParticles',options:{fullScreen:{enable:false},particles:{number:{value:18},color:{value:['#ff9a78','#82dfbf','#f5d486','#a999ff']},opacity:{value:{min:.03,max:.10}},size:{value:{min:2,max:5}},move:{enable:true,speed:.18,outModes:{default:'out'}}}}})}catch(e){}});
function stableAlias4(){
  const key='bjtu.p001.pages.alias4.v2';
  let v=localStorage.getItem(key)||'';
  if(!/^[A-Z]{4}$/.test(v)){const letters='ABCDEFGHJKLMNPQRSTUVWXYZ';v=Array.from({length:4},()=>letters[Math.floor(Math.random()*letters.length)]).join('');localStorage.setItem(key,v)}
  return v;
}
function renderProfileHello(){
  const p=window.BJTU_PROFILE?.getFlat?.()||{};
  state.profileSnapshot=p;
  const name=(p.name||'').trim();
  const bits=[p.currentWork,p.location].filter(Boolean).slice(0,2);
  const hello=$('#profileHello');
  if(hello) hello.innerHTML=name?'<strong>'+name+'</strong>，你的 AI-Ques 资料卡已读取'+(bits.length?' · '+bits.join(' · '):''):'已连接 AI-Ques 公共资料卡，无需再次填写个人信息。';
}
async function enter(){
  const profile=window.BJTU_PROFILE?.getFlat?.()||{};
  state.profileSnapshot=profile;
  try{
    const d=await api('/api/student/register','POST',{alias4:stableAlias4(),profile});
    Object.assign(state,{participant_id:d.participant_id,session_id:d.session_id,public_code:d.public_code});
    applySettings(d.settings||{});
    state.currentDeck=seededShuffle(FACETS,state.participant_id+'-current-30');
    state.idealDeck=seededShuffle(FACETS.filter(x=>x.domain!=='N'),state.participant_id+'-ideal-24');
    state.valueDeck=seededShuffle(VALUES,state.participant_id+'-values-16');
    renderLegend();renderSwipe('current');show('currentSwipe')
  }catch(e){const box=$('#entryError');if(box)box.textContent='暂时无法开始，请稍后再试。'}
}
$('#startBtn').onclick=()=>enter();
renderProfileHello();
function renderLegend(){const domains=(sel,keys)=>$(sel).innerHTML=keys.map(k=>'<span><i class="domain-dot" style="background:'+DOMAINS[k].color+'"></i>'+k+' · '+DOMAINS[k].label+'</span>').join('');domains('#domainLegendCurrent',['N','E','O','A','C']);domains('#domainLegendIdeal',['E','O','A','C']);$('#valueLegend').innerHTML=Object.entries(VALUE_CATEGORIES).map(([k,v])=>'<span><i class="domain-dot" style="background:'+v.color+'"></i>'+v.label+'</span>').join('')}
function swipeConfig(kind){if(kind==='current')return{deck:state.currentDeck,index:'currentSwipeIndex',history:'currentSwipeHistory',selected:'currentSelected',stack:'#currentSwipeStack',progress:'#currentSwipeProgress',bar:'#currentSwipeBar',count:'#currentSelectedCount',undo:'#undoCurrentSwipe',leftBtn:'#currentLeftBtn',rightBtn:'#currentRightBtn',left:'不像现在的我',right:'像现在的我'};if(kind==='ideal')return{deck:state.idealDeck,index:'idealSwipeIndex',history:'idealSwipeHistory',selected:'idealSelected',stack:'#idealSwipeStack',progress:'#idealSwipeProgress',bar:'#idealSwipeBar',count:'#idealSelectedCount',undo:'#undoIdealSwipe',leftBtn:'#idealLeftBtn',rightBtn:'#idealRightBtn',left:'不是我想靠近的',right:'我想靠近'};return{deck:state.valueDeck,index:'valueSwipeIndex',history:'valueSwipeHistory',selected:'valueSelected',stack:'#valueSwipeStack',progress:'#valueSwipeProgress',bar:'#valueSwipeBar',count:'#valueSelectedCount',undo:'#undoValueSwipe',leftBtn:'#valueLeftBtn',rightBtn:'#valueRightBtn',left:'没那么重要',right:'对我重要'}}
function cardData(kind,item){if(kind!=='value')return{color:item.color,tag:item.domain+' · '+item.domain_label,title:item.label,desc:item.desc};const cat=VALUE_CATEGORIES[item.category];return{color:cat.color,tag:cat.label,title:item.label,desc:item.desc}}
function renderSwipe(kind){const c=swipeConfig(kind),i=state[c.index],deck=c.deck,stack=$(c.stack);$(c.progress).textContent=Math.min(i+1,deck.length)+' / '+deck.length;$(c.bar).style.width=(Math.min(i+1,deck.length)/deck.length*100)+'%';$(c.count).textContent='已留下 '+state[c.selected].length+' 个';$(c.undo).disabled=state[c.history].length===0;if(i>=deck.length){finishSwipe(kind);return}const item=deck[i],d=cardData(kind,item);stack.innerHTML='';const card=document.createElement('article');card.className='swipe-card';card.style.setProperty('--facet-color',d.color);card.innerHTML='<span class="swipe-stamp left">'+c.left+'</span><span class="swipe-stamp right">'+c.right+'</span><span class="facet-domain"><i class="domain-dot" style="background:'+d.color+'"></i>'+d.tag+'</span><h3>'+d.title+'</h3><p>'+d.desc+'</p>';stack.appendChild(card);wireSwipeCard(card,kind,item);$(c.leftBtn).onclick=()=>triggerSwipe(kind,false,'button');$(c.rightBtn).onclick=()=>triggerSwipe(kind,true,'button');icons();try{window.VanillaTilt?.init(card,{max:2.5,speed:450,glare:true,'max-glare':.04})}catch(e){}}
function wireSwipeCard(card,kind,item){let active=false,startX=0,startTs=0;card.onpointerdown=e=>{active=true;startX=e.clientX;startTs=performance.now();card.setPointerCapture(e.pointerId)};card.onpointermove=e=>{if(!active)return;const x=e.clientX-startX;card.style.transform='translateX('+x+'px) rotate('+(x/24)+'deg)';card.querySelector('.swipe-stamp.left').style.opacity=String(Math.max(0,Math.min(1,-x/90)));card.querySelector('.swipe-stamp.right').style.opacity=String(Math.max(0,Math.min(1,x/90)))};card.onpointerup=e=>{if(!active)return;active=false;const dx=e.clientX-startX;if(Math.abs(dx)>=82)commitSwipe(kind,dx>0,Math.round(performance.now()-startTs),item,'gesture');else resetCard(card)};card.onpointercancel=()=>{active=false;resetCard(card)}}
function resetCard(card){card.style.transition='transform .24s ease';card.style.transform='';card.querySelectorAll('.swipe-stamp').forEach(x=>x.style.opacity='0');setTimeout(()=>card.style.transition='',260)}
function triggerSwipe(kind,selected,input){const c=swipeConfig(kind),item=c.deck[state[c.index]],card=$(c.stack+' .swipe-card');if(!item||!card)return;commitSwipe(kind,selected,null,item,input)}
function commitSwipe(kind,selected,rt,item,input){const c=swipeConfig(kind),hist=state[c.history],arr=state[c.selected];hist.push({id:item.id,selected,index:state[c.index]});if(selected&&!arr.includes(item.id))arr.push(item.id);if(!selected&&arr.includes(item.id))arr.splice(arr.indexOf(item.id),1);log(kind+'_swipe',{id:item.id,selected,direction:selected?'right':'left',rt_ms:rt,input,order_index:state[c.index]});const card=$(c.stack+' .swipe-card'),done=()=>{state[c.index]++;renderSwipe(kind)};if(window.gsap)window.gsap.to(card,{x:selected?360:-360,y:300,rotation:selected?22:-22,opacity:0,duration:.34,ease:'power2.in',onComplete:done});else{card.style.transition='all .34s ease';card.style.transform='translate('+(selected?360:-360)+'px,300px) rotate('+(selected?22:-22)+'deg)';card.style.opacity='0';setTimeout(done,350)}}
function undoSwipe(kind){const c=swipeConfig(kind),hist=state[c.history];if(!hist.length)return;const last=hist.pop(),arr=state[c.selected];if(last.selected&&arr.includes(last.id))arr.splice(arr.indexOf(last.id),1);state[c.index]=last.index;log(kind+'_swipe_undo',{id:last.id,selected_was:last.selected});renderSwipe(kind)}
$('#undoCurrentSwipe').onclick=()=>undoSwipe('current');$('#undoIdealSwipe').onclick=()=>undoSwipe('ideal');$('#undoValueSwipe').onclick=()=>undoSwipe('value');
function finishSwipe(kind){const arr=state[swipeConfig(kind).selected];if(kind==='current'){if(arr.length>=2){show('currentRank');runSTJ(arr,'current',$('#currentTournament'),'哪一个更像现在的我？',(rank,stats)=>{state.currentRank=rank;state.currentStats=stats;renderSwipe('ideal');show('idealSwipe')})}else{state.currentRank=[...arr];renderSwipe('ideal');show('idealSwipe')}}else if(kind==='ideal'){if(arr.length>=2){show('idealRank');runSTJ(arr,'ideal',$('#idealTournament'),'哪一个更接近理想的我？',(rank,stats)=>{state.idealRank=rank;state.idealStats=stats;renderSwipe('value');show('valueSwipe')})}else{state.idealRank=[...arr];renderSwipe('value');show('valueSwipe')}}else{if(arr.length>=2){show('valueRank');runSTJ(arr,'value',$('#valueTournament'),'哪一个更值得我先守住？',(rank,stats)=>{state.valueRank=rank;state.valueStats=stats;show('futureDistance');requestAnimationFrame(initDistance)})}else{state.valueRank=[...arr];show('futureDistance');requestAnimationFrame(initDistance)}}}

function runSTJ(items,kind,mount,question,done){
 if(items.length<=1){done([...items],{});return}
 const answers=[],undoStack=[],pairCounts={},matchCounts={},winCounts={},rtTotals={};
 items.forEach(id=>{matchCounts[id]=0;winCounts[id]=0;rtTotals[id]=0});
 const key=(a,b)=>[a,b].sort().join('|');
 const clone=o=>JSON.parse(JSON.stringify(o));
 const n=items.length,uniquePairs=n*(n-1)/2;
 const requested=Number(state.settings.stj_budget||24);
 const scientificFloor=Math.min(36,Math.ceil(n*1.5));
 const budget=Math.min(uniquePairs,Math.max(requested,scientificFloor));
 const order=seededShuffle(items,state.participant_id+'-'+kind+'-coverage-v2');
 let coverage=[];
 if(n===2)coverage=[[order[0],order[1]]];
 else for(let i=0;i<n;i++)coverage.push([order[i],order[(i+1)%n]]);
 let left=null,right=null,started=0,busy=false;

 function obj(id){return kind==='value'?valueMap[id]:facetMap[id]}
 function colorOf(o){return kind==='value'?VALUE_CATEGORIES[o.category].color:o.color}
 function tagOf(o){return kind==='value'?VALUE_CATEGORIES[o.category].label:(o.domain+' · '+o.domain_label)}
 function meaning(){return kind==='current'?'更像现在的我':kind==='ideal'?'更接近理想的我':'对我更重要'}
 function card(id,side){const o=obj(id),c=colorOf(o);return '<article class="pk-card persistent '+side+'" data-side="'+side+'" data-id="'+id+'" style="--facet-color:'+c+'"><span class="domain-tag"><i class="domain-dot" style="background:'+c+'"></i>'+tagOf(o)+'</span><h3>'+o.label+'</h3><p>'+(o.desc||'')+'</p><div class="choice-meaning">'+(side==='left'?'← ':'→ ')+meaning()+'</div></article>'}
 function wireCard(el){el.onclick=()=>pick(el.dataset.side,'click')}
 function rebuildCounts(){
   Object.keys(matchCounts).forEach(id=>{matchCounts[id]=0;winCounts[id]=0;rtTotals[id]=0});
   Object.keys(pairCounts).forEach(k=>delete pairCounts[k]);
   for(const a of answers){
     const w=a.preferred_id,l=w===a.left_id?a.right_id:a.left_id;
     matchCounts[w]++;matchCounts[l]++;winCounts[w]++;rtTotals[w]+=a.rt_ms||0;rtTotals[l]+=a.rt_ms||0;
     pairCounts[key(w,l)]=(pairCounts[key(w,l)]||0)+1;
   }
 }
 function fitBT(){
   const theta=Object.fromEntries(items.map(id=>[id,0])),lambda=.6;
   for(let iter=0;iter<120;iter++){
     const grad=Object.fromEntries(items.map(id=>[id,-lambda*theta[id]]));
     for(const a of answers){
       const i=a.left_id,j=a.right_id,y=a.preferred_id===i?1:0,d=theta[i]-theta[j],p=1/(1+Math.exp(-Math.max(-12,Math.min(12,d)))),err=y-p;
       grad[i]+=err;grad[j]-=err;
     }
     const lr=.18/Math.sqrt(1+iter*.04);
     for(const id of items)theta[id]+=lr*grad[id];
     const mean=items.reduce((s,id)=>s+theta[id],0)/items.length;
     for(const id of items)theta[id]-=mean;
   }
   const info=Object.fromEntries(items.map(id=>[id,lambda]));
   for(const a of answers){
     const i=a.left_id,j=a.right_id,d=theta[i]-theta[j],p=1/(1+Math.exp(-Math.max(-12,Math.min(12,d)))),v=p*(1-p);
     info[i]+=v;info[j]+=v;
   }
   const se=Object.fromEntries(items.map(id=>[id,1/Math.sqrt(info[id])]));
   return {theta,se};
 }
 function nextCoverage(winner){
   if(!coverage.length)return null;
   let idx=winner?coverage.findIndex(p=>p.includes(winner)):-1;
   if(idx<0)idx=0;
   return coverage.splice(idx,1)[0];
 }
 function nextAdaptive(winner){
   const model=fitBT(),meanMatches=items.reduce((s,id)=>s+matchCounts[id],0)/items.length;
   let best=null,bestScore=-Infinity,bestWithWinner=null,bestWinnerScore=-Infinity;
   for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
     const a=items[i],b=items[j],repeat=pairCounts[key(a,b)]||0;
     const exposure=1/(1+matchCounts[a])+1/(1+matchCounts[b]);
     const uncertainty=model.se[a]+model.se[b];
     const closeness=Math.exp(-Math.abs(model.theta[a]-model.theta[b]));
     const score=3.2*exposure+2.1*uncertainty+1.8*closeness-4.5*repeat;
     if(score>bestScore){bestScore=score;best=[a,b]}
     if(winner&&(a===winner||b===winner)&&matchCounts[winner]<=meanMatches+1&&score>bestWinnerScore){bestWinnerScore=score;bestWithWinner=[a,b]}
   }
   return bestWithWinner&&bestWinnerScore>=bestScore*.82?bestWithWinner:best;
 }
 function chooseNext(winner){
   if(answers.length>=budget)return null;
   if(coverage.length)return nextCoverage(winner);
   return nextAdaptive(winner);
 }
 function updateMeta(){
   const counter=mount.querySelector('.stj-counter'),bar=mount.querySelector('.stj-bar i'),undo=mount.querySelector('.undoSTJ');
   if(counter)counter.textContent=Math.min(answers.length+1,budget)+' / '+budget;
   if(bar)bar.style.width=(answers.length/budget*100)+'%';
   if(undo)undo.disabled=!answers.length
 }
 function render(){
   mount.innerHTML='<div class="stj-shell"><div class="stj-top"><span class="round-badge">先保证每个候选都被看见，再重点比较难分的</span><span class="stj-counter">'+(answers.length+1)+' / '+budget+'</span></div><div class="stj-bar"><i style="width:'+(answers.length/budget*100)+'%"></i></div><div class="stj-question">'+question+'</div><div class="stj-sub">← 左边 · → 右边 · ↑ 返回上一场</div><div class="pk-row persistent-row">'+card(left,'left')+'<div class="vs">VS</div>'+card(right,'right')+'</div><div class="stj-undo-row"><button class="tool-btn undoSTJ" '+(answers.length?'':'disabled')+'><kbd>↑</kbd> 返回上一场</button></div></div>';
   mount.querySelectorAll('.pk-card').forEach(wireCard);mount.querySelector('.undoSTJ').onclick=undo;icons();started=performance.now()
 }
 function transitionTo(nextPair,winner,loserSide){
   if(!nextPair){busy=false;showComplete();return}
   const winnerIsLeft=left===winner,winnerIsRight=right===winner;
   if(nextPair.includes(winner)&&(winnerIsLeft||winnerIsRight)){
     const challenger=nextPair[0]===winner?nextPair[1]:nextPair[0];
     if(winnerIsLeft){right=challenger;replaceSide('right',challenger)}
     else{left=challenger;replaceSide('left',challenger)}
     busy=false;return;
   }
   left=nextPair[0];right=nextPair[1];
   render();busy=false;
   const cards=mount.querySelectorAll('.pk-card');
   if(window.gsap)window.gsap.fromTo(cards,{y:18,opacity:0},{y:0,opacity:1,duration:.26,stagger:.04,ease:'power2.out'});
 }
 function replaceSide(side,id){
   const old=mount.querySelector('.pk-card.'+side);if(!old){render();return}
   old.outerHTML=card(id,side);const fresh=mount.querySelector('.pk-card.'+side);wireCard(fresh);
   if(window.gsap)window.gsap.fromTo(fresh,{x:side==='right'?220:-220,opacity:0,rotation:side==='right'?7:-7},{x:0,opacity:1,rotation:0,duration:.28,ease:'power2.out'});
   started=performance.now();updateMeta();icons()
 }
 function pick(side,input){
   if(busy||answers.length>=budget)return;busy=true;
   const winner=side==='left'?left:right,loser=side==='left'?right:left,loserSide=side==='left'?'right':'left',rt=Math.round(performance.now()-started);
   undoStack.push({left,right,answers:clone(answers),coverage:clone(coverage)});
   const ans={left_id:left,right_id:right,preferred_id:winner,rt_ms:rt,input};
   answers.push(ans);rebuildCounts();
   log(kind+'_pairwise',{...ans,comparison_index:answers.length,budget,model:'regularized_bradley_terry',scheduler:coverage.length?'coverage_then_adaptive':'adaptive_uncertainty'});
   const loserEl=mount.querySelector('.pk-card.'+loserSide),outX=loserSide==='right'?340:-340;
   const next=()=>{const pair=chooseNext(winner);transitionTo(pair,winner,loserSide)};
   if(window.gsap)window.gsap.to(loserEl,{x:outX,y:260,opacity:0,rotation:loserSide==='right'?18:-18,duration:.32,ease:'power2.in',onComplete:next});
   else{loserEl.style.transition='all .32s ease';loserEl.style.transform='translate('+outX+'px,260px) rotate('+(loserSide==='right'?18:-18)+'deg)';loserEl.style.opacity='0';setTimeout(next,330)}
 }
 function undo(){
   if(!undoStack.length||busy)return;
   const snap=undoStack.pop();left=snap.left;right=snap.right;coverage=snap.coverage;answers.splice(0,answers.length,...snap.answers);rebuildCounts();
   log(kind+'_pairwise_undo',{left_id:left,right_id:right});render()
 }
 function showComplete(){
   const model=fitBT();
   const sorted=[...items].sort((a,b)=>model.theta[b]-model.theta[a]);
   const uncertain=sorted.slice(0,Math.min(5,sorted.length)).some(id=>model.se[id]>.85);
   mount.innerHTML='<div class="stj-shell stj-complete"><div class="round-badge">这一轮完成了</div><div class="stj-question">已经做了 '+answers.length+' 次取舍</div><div class="stj-sub">'+(uncertain?'有些候选仍然很接近，结果会按“Top”呈现，不做虚假的精细名次。':'核心优先顺序已经比较清楚。')+' ↑ 仍可返回上一场。</div><div class="stj-undo-row"><button class="tool-btn undoSTJ"><kbd>↑</kbd> 返回上一场</button><button class="btn primary finishSTJ">确认这一轮</button></div></div>';
   mount.querySelector('.undoSTJ').onclick=undo;mount.querySelector('.finishSTJ').onclick=finish;icons()
 }
 function finish(){
   const model=fitBT(),ranking=[...items].sort((a,b)=>model.theta[b]-model.theta[a]),clean={};
   for(const id of items)clean[id]={
     bt_score:Math.round(model.theta[id]*1000)/1000,
     bt_se:Math.round(model.se[id]*1000)/1000,
     comparisons:matchCounts[id]||0,
     wins:winCounts[id]||0,
     mean_rt_ms:matchCounts[id]?Math.round(rtTotals[id]/matchCounts[id]):null
   };
   log(kind+'_ranking_complete',{ranking,comparisons:answers.length,budget,stats:clean,model:'regularized_bradley_terry',scheduler:'balanced_coverage_then_adaptive_uncertainty'});
   stjController=null;done(ranking,clean)
 }
 const first=chooseNext(null);left=first[0];right=first[1];
 stjController={pickSide:side=>pick(side,'keyboard'),undo};render();
}

window.addEventListener('keydown',e=>{const tag=(e.target?.tagName||'').toUpperCase();if(['INPUT','TEXTAREA','SELECT'].includes(tag)||e.target?.isContentEditable)return;if(e.key==='ArrowUp'){if(['currentSwipe','idealSwipe','valueSwipe'].includes(state.stage)){e.preventDefault();undoSwipe(state.stage.replace('Swipe','').replace('current','current').replace('ideal','ideal').replace('value','value'));return}if(['currentRank','idealRank','valueRank'].includes(state.stage)&&stjController){e.preventDefault();stjController.undo();return}}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){if(['currentSwipe','idealSwipe','valueSwipe'].includes(state.stage)){e.preventDefault();const kind=state.stage==='currentSwipe'?'current':state.stage==='idealSwipe'?'ideal':'value';triggerSwipe(kind,e.key==='ArrowRight','keyboard');return}if(['currentRank','idealRank','valueRank'].includes(state.stage)&&stjController){e.preventDefault();stjController.pickSide(e.key==='ArrowLeft'?'left':'right')}}});

function initDistance(){
  const r=$('#futureDistanceRange'),label=$('#distanceNowLabel');
  r.value=32;state.futureDistance=68;state.distanceTouched=false;$('#distanceNext').disabled=true;
  const update=()=>{const v=Number(r.value);state.futureDistance=100-v;if(label)label.style.left=v+'%';state.distanceTouched=true;$('#distanceNext').disabled=false};
  r.oninput=update;
  r.onchange=()=>log('future_distance',{distance_0_100:state.futureDistance,closeness_0_100:100-state.futureDistance,moving_object:'current_self'});
  if(label)label.style.left='32%';
}
$('#distanceNext').onclick=()=>{show('futureOverlap');requestAnimationFrame(initOverlap)};
function initOverlap(){const stage=$('#overlapStage'),now=$('#nowOrb'),future=$('#futureOrb');if(!stage)return;const w=stage.clientWidth;future.style.left=(w*.70)+'px';now.style.left=(w*.26)+'px';state.futureOverlap=0;state.overlapTouched=false;$('#overlapNext').disabled=true;let dragging=false,startX=0,startLeft=0,startTs=0,moves=0;const update=()=>{const r=stage.getBoundingClientRect(),a=now.getBoundingClientRect(),b=future.getBoundingClientRect(),rad=Math.min(a.width,b.width)/2,ax=a.left+a.width/2-r.left,bx=b.left+b.width/2-r.left,d=Math.abs(ax-bx);let overlap=0;if(d<2*rad){if(d<=0)overlap=100;else{const area=2*rad*rad*Math.acos(d/(2*rad))-.5*d*Math.sqrt(Math.max(0,4*rad*rad-d*d));overlap=Math.round(area/(Math.PI*rad*rad)*100)}}state.futureOverlap=overlap;const glow=$('#overlapGlow');glow.style.left=((ax+bx)/2)+'px';glow.style.top='50%';glow.style.opacity='.22'};now.onpointerdown=e=>{dragging=true;startX=e.clientX;startLeft=parseFloat(now.style.left)||stage.clientWidth*.26;startTs=performance.now();moves=0;now.classList.add('dragging');now.setPointerCapture(e.pointerId)};now.onpointermove=e=>{if(!dragging)return;const half=now.offsetWidth/2;let x=startLeft+(e.clientX-startX);x=Math.max(half+10,Math.min(stage.clientWidth-half-10,x));now.style.left=x+'px';moves++;state.overlapTouched=true;update();$('#overlapNext').disabled=false};now.onpointerup=()=>{if(!dragging)return;dragging=false;now.classList.remove('dragging');update();log('future_overlap',{overlap_percent:state.futureOverlap,rt_ms:Math.round(performance.now()-startTs),move_count:moves})};now.onpointercancel=now.onpointerup;update()}
$('#overlapNext').onclick=()=>{renderContexts();show('futureDay')};
function renderContexts(){
  const box=$('#contextChips');box.innerHTML='';
  CONTEXTS.forEach(c=>{const b=document.createElement('button');b.className='choice-chip';b.textContent=c.label;b.onclick=()=>{
    const i=state.contexts.indexOf(c.id);if(i>=0)state.contexts.splice(i,1);else state.contexts.push(c.id);
    b.classList.toggle('on',state.contexts.includes(c.id));
    const wrap=$('#contextOtherWrap');if(c.id==='other'&&wrap)wrap.classList.toggle('hidden',!state.contexts.includes('other'));
    $('#futureDayNext').disabled=state.contexts.length===0;
    log('future_context',{id:c.id,selected:state.contexts.includes(c.id)})
  };box.appendChild(b)})
}
$('#contextOther').oninput=e=>state.contextOther=e.target.value.trim();
$('#futureDayNext').onclick=()=>{renderObstacles();show('obstacle')};
function renderObstacles(){
  const box=$('#obstacleChips');box.innerHTML='';
  OBSTACLES.forEach(o=>{const b=document.createElement('button');b.className='choice-chip';b.textContent=o.label;b.onclick=()=>{
    const i=state.obstacles.indexOf(o.id);if(i>=0)state.obstacles.splice(i,1);else state.obstacles.push(o.id);
    b.classList.toggle('on',state.obstacles.includes(o.id));
    const wrap=$('#obstacleOtherWrap');if(o.id==='other'&&wrap)wrap.classList.toggle('hidden',!state.obstacles.includes('other'));
    syncObstacle();log('obstacle',{id:o.id,selected:state.obstacles.includes(o.id)})
  };box.appendChild(b)});
  const a=$('#actionChips');a.innerHTML='';
  ACTIONS.forEach(x=>{const b=document.createElement('button');b.className='choice-chip';b.textContent=x.label;b.onclick=()=>{
    state.actionId=x.id;$$('#actionChips .choice-chip').forEach(q=>q.classList.toggle('on',q===b));
    const wrap=$('#actionOtherWrap');if(wrap)wrap.classList.toggle('hidden',x.id!=='other');
    syncObstacle();log('action_choice',{id:x.id})
  };a.appendChild(b)})
}
$('#obstacleOther').oninput=e=>{state.obstacleOther=e.target.value.trim();syncObstacle()};
$('#actionOther').oninput=e=>{state.actionOther=e.target.value.trim();syncObstacle()};
function syncObstacle(){
  const obstacleOk=state.obstacles.length>0 && (!state.obstacles.includes('other')||state.obstacleOther.length>0);
  const actionOk=!!state.actionId && (state.actionId!=='other'||state.actionOther.length>0);
  $('#obstacleNext').disabled=!(obstacleOk&&actionOk)
}
$('#obstacleNext').onclick=()=>{renderMessagePrompts();show('messages')};
function renderMessagePrompts(){const fill=(id,list,target)=>{$(id).innerHTML=list.map(x=>'<button class="prompt-chip">'+x+'</button>').join('');$$(id+' .prompt-chip').forEach(b=>b.onclick=()=>{const el=$(target);el.value=b.textContent;el.dispatchEvent(new Event('input'))})};fill('#futureMessagePrompts',FUTURE_PROMPTS,'#futureMessage');fill('#futureReplyPrompts',REPLY_PROMPTS,'#futureReply')}
$('#futureMessage').oninput=e=>state.futureMessage=e.target.value.trim();$('#futureReply').oninput=e=>state.futureReply=e.target.value.trim();
$$('.voice-message').forEach(btn=>btn.onclick=()=>startVoice(btn.dataset.target,btn));
async function startVoice(targetId,btn){const status=$('[data-status="'+targetId+'"]'),SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){status.textContent='当前浏览器不支持网页语音转文字，可以使用系统语音输入。';return}if(recognition){try{recognition.stop()}catch(e){};return}try{if(navigator.mediaDevices?.getUserMedia){const stream=await navigator.mediaDevices.getUserMedia({audio:true});stream.getTracks().forEach(t=>t.stop())}}catch(e){status.textContent='请先允许麦克风权限。';return}recognition=new SR();recognition.lang='zh-CN';recognition.interimResults=true;let finalText='';recognition.onstart=()=>status.textContent='正在听…';recognition.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)finalText+=t;else interim+=t}status.textContent=interim||'正在识别…'};recognition.onerror=e=>status.textContent='这次没听清，可以再试一次。';recognition.onend=()=>{if(finalText){const el=$('#'+targetId);el.value=(el.value+' '+finalText).trim();el.dispatchEvent(new Event('input'));status.textContent='已经写进去了。'}recognition=null};recognition.start()}
function domainCounts(ids){const out={N:0,E:0,O:0,A:0,C:0};ids.forEach(id=>{const d=facetMap[id]?.domain;if(d)out[d]++});return out}
function actionLabel(){return state.actionId==='other'?(state.actionOther||'其他办法'):(ACTIONS.find(x=>x.id===state.actionId)?.label||'')}
function valueRankItems(){return state.valueRank.map(id=>{const v=valueMap[id],c=VALUE_CATEGORIES[v.category];return{id,label:v.label,category:v.category,category_label:c.label,color:c.color}})}
function buildResult(){const shared=state.currentSelected.filter(x=>state.idealSelected.includes(x)),idealOnly=state.idealSelected.filter(x=>!state.currentSelected.includes(x));return{future_horizon_key:state.settings.future_horizon_key,future_horizon_label:state.settings.future_horizon_label,future_horizon_months:state.settings.future_horizon_months,orb_theme:state.settings.orb_theme,stj_budget:state.settings.stj_budget,current_pool_size:30,current_selected:state.currentSelected,current_selected_labels:state.currentSelected.map(id=>facetMap[id].label),current_rank:state.currentRank,current_rank_labels:state.currentRank.map(id=>facetMap[id].label),current_stj_stats:state.currentStats,ideal_pool_size:24,ideal_pool_excludes:['N'],ideal_selected:state.idealSelected,ideal_selected_labels:state.idealSelected.map(id=>facetMap[id].label),ideal_rank:state.idealRank,ideal_rank_labels:state.idealRank.map(id=>facetMap[id].label),ideal_stj_stats:state.idealStats,shared_traits:shared,shared_trait_labels:shared.map(id=>facetMap[id].label),ideal_only:idealOnly,ideal_only_labels:idealOnly.map(id=>facetMap[id].label),domain_counts_current:domainCounts(state.currentSelected),domain_counts_ideal:domainCounts(state.idealSelected),value_construct:'personal_values_activity_adapted',value_pool_size:16,value_selected:state.valueSelected,value_selected_labels:state.valueSelected.map(id=>valueMap[id].label),value_rank:state.valueRank,value_rank_labels:state.valueRank.map(id=>valueMap[id].label),value_rank_items:valueRankItems(),value_stj_stats:state.valueStats,future_distance_0_100:state.futureDistance,future_distance_closeness_0_100:100-state.futureDistance,future_overlap_percent:state.futureOverlap,profile_snapshot:state.profileSnapshot,future_contexts:state.contexts,future_context_other:state.contextOther,future_context_labels:state.contexts.map(id=>id==='other'?(state.contextOther||'其他'):CONTEXTS.find(x=>x.id===id)?.label||id),obstacles:state.obstacles,obstacle_other:state.obstacleOther,obstacle_labels:state.obstacles.map(id=>id==='other'?(state.obstacleOther||'其他'):OBSTACLES.find(x=>x.id===id)?.label||id),action_id:state.actionId,action_other:state.actionOther,action_label:actionLabel(),future_message:state.futureMessage,future_reply:state.futureReply,duration_ms:Date.now()-state.started}}
$('#resultBtn').onclick=async()=>{state.futureMessage=$('#futureMessage').value.trim();state.futureReply=$('#futureReply').value.trim();$('#resultBtn').disabled=true;$('#resultBtn').textContent='正在整理…';const result=buildResult();await Promise.allSettled(pending);const reportHTML=P001Report.html(result,state.public_code,state.posterStyle);try{await api('/api/student/finalize','POST',{participant_id:state.participant_id,session_id:state.session_id,result,report_html:reportHTML});$('#saveStatus').textContent='这次记录已经保存。'}catch(e){$('#saveStatus').textContent='保存暂时失败，但你仍然可以查看报告。'}currentResult=result;show('result');renderReport()};
function renderReport(){if(currentResult)$('#studentReportHost').innerHTML=P001Report.html(currentResult,state.public_code,state.posterStyle)}$$('[data-style]').forEach(t=>t.onclick=()=>{state.posterStyle=t.dataset.style;$$('[data-style]').forEach(x=>x.classList.toggle('on',x===t));renderReport();log('poster_style',{style:state.posterStyle})});
$('#saveImage').onclick=async()=>{
  const btn=$('#saveImage');if(!currentResult)return;const old=btn.innerHTML;btn.disabled=true;btn.textContent='正在生成…';
  try{
    const c=P001Report.canvas(currentResult,state.public_code,state.posterStyle);
    const a=document.createElement('a');a.download='写给'+(state.settings.future_horizon_label||'未来')+'的我-'+state.public_code+'.png';a.href=c.toDataURL('image/png');a.click();
    log('share_poster_saved',{style:state.posterStyle,width:c.width,height:c.height,renderer:'native_canvas'})
  }catch(e){alert('图片生成失败，请刷新页面后再试。');log('share_poster_error',{message:String(e)})}
  finally{btn.disabled=false;btn.innerHTML=old;icons()}
};
icons();
})();