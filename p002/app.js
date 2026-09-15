const VERSION = "p002-0.1.0";
const nowIso = () => new Date().toISOString();

const SCALES = {
  pcl5: {
    id:"pcl5",
    name:"PCL-5",
    subtitle:"过去 1 个月 · 20 项",
    prompt:"过去一个月，这项情况让你困扰到什么程度？",
    choices:[["完全没有",0],["有一点",1],["中等程度",2],["相当多",3],["非常严重",4]],
    clusters:{
      B:{title:"侵入与再体验",desc:"关注不由自主的记忆、梦境、再体验与提醒后的反应。",glyph:"↺"},
      C:{title:"回避",desc:"关注对相关想法、感受和外部提醒的回避。",glyph:"↘"},
      D:{title:"认知与情绪改变",desc:"关注记忆、信念、情绪、兴趣与人际距离的变化。",glyph:"◐"},
      E:{title:"警觉与反应",desc:"关注易怒、冒险、警觉、惊跳、注意与睡眠。",glyph:"✦"}
    },
    items:[
      ["B","反复出现、不由自主且令人不适的相关记忆？"],
      ["B","反复做与那次压力经历有关、令人不安的梦？"],
      ["B","突然感觉或表现得像那次经历正在再次发生？"],
      ["B","遇到相关提醒时感到非常难受？"],
      ["B","遇到相关提醒时出现明显身体反应，例如心跳加快、呼吸困难或出汗？"],
      ["C","会避开与那次经历有关的记忆、想法或感受？"],
      ["C","会避开外部提醒，例如某些人、地方、谈话、活动、物品或情境？"],
      ["D","难以回忆那次经历的重要部分？"],
      ["D","对自己、他人或世界形成很强的负面信念？"],
      ["D","会责怪自己或他人导致了那次经历，或之后发生的事情？"],
      ["D","经常有很强的负面感受，例如恐惧、惊恐、愤怒、内疚或羞耻？"],
      ["D","对过去喜欢的活动失去兴趣？"],
      ["D","感觉与其他人疏远或隔绝？"],
      ["D","难以体验积极情绪，例如快乐或对亲近之人的爱意？"],
      ["E","容易烦躁、愤怒爆发或表现出攻击性？"],
      ["E","会做过度冒险、可能伤害自己的事情？"],
      ["E","处于高度警觉、不断留意危险或保持戒备？"],
      ["E","容易受惊或被突然的事情吓一跳？"],
      ["E","难以集中注意力？"],
      ["E","入睡困难或难以维持睡眠？"]
    ].map((x,i)=>({id:i+1,cluster:x[0],text:x[1]}))
  },
  cape15: {
    id:"cape15",
    name:"Current CAPE-P15",
    subtitle:"过去 3 个月 · 15 项",
    prompt:"过去三个月，这种体验出现得有多频繁？",
    choices:[["从未",1],["有时",2],["经常",3],["几乎总是",4]],
    distressChoices:[["完全不困扰",1],["有一点困扰",2],["比较困扰",3],["非常困扰",4]],
    clusters:{
      PI:{title:"指向性体验",desc:"关注他人言语、目光或行动是否被体验为特别指向自己。",glyph:"◎"},
      BE:{title:"异常思维体验",desc:"关注思维归属、控制感、影响感与现实边界相关体验。",glyph:"◇"},
      PA:{title:"感知体验",desc:"关注听觉或视觉方面、他人未必同时察觉的体验。",glyph:"◒"}
    },
    items:[
      ["PI","是否觉得别人像是在暗示你，或说的话带有针对你的双重含义？"],
      ["PI","是否觉得某些人并不像表面看起来的那样？"],
      ["PI","是否感觉自己正在被针对、迫害或为难？"],
      ["PI","是否感觉有人在联合起来对付你？"],
      ["PI","是否觉得别人因为你的外表而用异样眼光看你？"],
      ["BE","是否觉得电子设备可能影响你的思维方式？"],
      ["BE","是否有过思维像被从脑中拿走的感觉？"],
      ["BE","是否有过脑中的想法不像是属于自己的感觉？"],
      ["BE","是否有过想法异常鲜明，以至担心别人也能听见？"],
      ["BE","是否有过自己的想法像回声一样被听见的体验？"],
      ["BE","是否感觉自己受到某种外在力量控制？"],
      ["BE","是否有过熟悉的人像被另一个一模一样的人替代的感觉？"],
      ["PA","独处时是否听到过似乎来自外界的声音？"],
      ["PA","独处时是否听到过两个或更多声音彼此交谈？"],
      ["PA","是否看到过别人没有同时看到的人、物体或动物？"]
    ].map((x,i)=>({id:i+1,cluster:x[0],text:x[1]}))
  }
};

const state = {
  participantId:"",
  sessionId:null,
  session:null,
  profile:null,
  scaleId:null,
  index:0,
  startedAt:null,
  itemStartedAt:null,
  rows:[],
  pendingFrequency:null,
  pendingDistress:null,
  finishedAt:null
};

const $ = s => document.querySelector(s);
const launcher = $("#launcher");
const assessment = $("#assessment");
const result = $("#result");
const scaleChoices = $("#scaleChoices");
const startBtn = $("#startBtn");
const distressBlock = $("#distressBlock");
const nextBtn = $("#nextBtn");

function renderScaleChoices(){
  scaleChoices.innerHTML = Object.values(SCALES).map(function(s){
    return '<button class="scale-card ' + (state.scaleId===s.id?'active':'') + '" data-scale="' + s.id + '" aria-pressed="' + (state.scaleId===s.id) + '">' +
      '<h3>' + s.name + '</h3><p>' + s.subtitle + '</p>' +
      '<span class="tag">' + (s.id==="pcl5"?'20 项 · 0–4':'15 项 · 频率 / 困扰') + '</span></button>';
  }).join("");
  scaleChoices.querySelectorAll("[data-scale]").forEach(function(btn){
    btn.onclick=function(){
      state.scaleId=btn.dataset.scale;
      renderScaleChoices();
      updateReady();
    };
  });
}
function updateReady(){startBtn.disabled=!state.scaleId}
renderScaleChoices();
updateReady();

state.profile=AIQ.ensureProfile({portalUrl:"../portal/",returnTo:location.href});
if(state.profile){
  state.participantId=state.profile.participant_id;
  const summary=$("#profileSummary");
  if(summary){
    const bits=[state.profile.name||"参与者",state.profile.age?state.profile.age+" 岁":"",state.profile.location||"",state.profile.currentWork||""].filter(Boolean);
    summary.innerHTML="<strong>"+bits.join(" · ")+"</strong><span class=\"id-chip\">"+state.profile.participant_id+"</span>";
  }
}


startBtn.onclick=function(){
  state.profile=AIQ.getProfile();
  if(!state.profile){AIQ.ensureProfile({portalUrl:"../portal/",returnTo:location.href});return}
  state.participantId=state.profile.participant_id;
  state.session=AIQ.startSession("P002",VERSION,{scale_id:state.scaleId});
  state.sessionId=state.session.session_id;
  state.index=0;
  state.rows=[];
  state.startedAt=nowIso();
  state.finishedAt=null;
  launcher.classList.add("hidden");
  result.classList.add("hidden");
  assessment.classList.remove("hidden");
  renderQuestion();
  window.scrollTo({top:0,behavior:"smooth"});
};

$("#exitBtn").onclick=function(){
  assessment.classList.add("hidden");
  launcher.classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
};

$("#restartBtn").onclick=function(){
  result.classList.add("hidden");
  launcher.classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
};

function renderQuestion(){
  const s=SCALES[state.scaleId];
  const item=s.items[state.index];
  if(!item) return finish();

  state.itemStartedAt=performance.now();
  state.pendingFrequency=null;
  state.pendingDistress=null;

  const cluster=s.clusters[item.cluster];
  $("#progressLabel").textContent=(state.index+1) + " / " + s.items.length;
  $("#scaleLabel").textContent=s.name;
  $("#progressBar").style.width=(state.index/s.items.length*100) + "%";
  $("#weatherGlyph").textContent=cluster.glyph;
  $("#clusterTitle").textContent=cluster.title;
  $("#clusterDesc").textContent=cluster.desc;
  $("#windowChip").textContent=s.id==="pcl5" ? "时间窗口 · 过去 1 个月" : "时间窗口 · 过去 3 个月";
  $("#questionIndex").textContent=s.name + " · ITEM " + String(item.id).padStart(2,"0") + " · " + item.cluster;
  $("#questionText").textContent=item.text;
  $("#questionPrompt").textContent=s.prompt;
  distressBlock.classList.add("hidden");
  nextBtn.disabled=true;
  renderAnswers(s);
}

function renderAnswers(s){
  const container=$("#answerOptions");
  container.innerHTML=s.choices.map(function(pair){
    return '<button class="answer" data-value="' + pair[1] + '"><span>' + pair[0] + '</span><span class="score">' + pair[1] + '</span></button>';
  }).join("");

  container.querySelectorAll(".answer").forEach(function(btn){
    btn.onclick=function(){
      container.querySelectorAll(".answer").forEach(function(x){x.classList.remove("active")});
      btn.classList.add("active");
      state.pendingFrequency=Number(btn.dataset.value);

      if(s.id==="cape15" && state.pendingFrequency>=2){
        renderDistress(s);
        nextBtn.disabled=state.pendingDistress===null;
      }else{
        state.pendingDistress=null;
        distressBlock.classList.add("hidden");
        nextBtn.disabled=false;
      }
    };
  });
}

function renderDistress(s){
  distressBlock.classList.remove("hidden");
  const d=$("#distressOptions");
  d.innerHTML=s.distressChoices.map(function(pair){
    return '<button class="answer" data-distress="' + pair[1] + '"><span>' + pair[0] + '</span><span class="score">' + pair[1] + '</span></button>';
  }).join("");

  d.querySelectorAll(".answer").forEach(function(btn){
    btn.onclick=function(){
      d.querySelectorAll(".answer").forEach(function(x){x.classList.remove("active")});
      btn.classList.add("active");
      state.pendingDistress=Number(btn.dataset.distress);
      nextBtn.disabled=false;
    };
  });
}

nextBtn.onclick=function(){
  const s=SCALES[state.scaleId];
  const item=s.items[state.index];
  const responseMs=Math.round(performance.now()-state.itemStartedAt);

  const row={
    participant_id:state.participantId || null,
    session_id:state.sessionId,
    study_version:VERSION,
    scale_id:s.id,
    scale_name:s.name,
    item_id:item.id,
    cluster:item.cluster,
    frequency_or_severity:state.pendingFrequency,
    distress:s.id==="cape15" ? state.pendingDistress : null,
    response_ms:responseMs,
    answered_at:nowIso()
  };
  state.rows.push(row);
  AIQ.recordEvent("item_response",row,{project_id:"P002",session_id:state.sessionId});

  state.index++;
  renderQuestion();
};

function mean(arr){
  return arr.length ? arr.reduce(function(a,b){return a+b},0)/arr.length : null;
}

function summarize(){
  const s=SCALES[state.scaleId];
  const rows=state.rows;
  const clusters={};

  Object.keys(s.clusters).forEach(function(k){
    const rr=rows.filter(function(r){return r.cluster===k});
    const vals=rr.map(function(r){return r.frequency_or_severity});
    clusters[k]={n:rr.length,sum:vals.reduce(function(a,b){return a+b},0),mean:mean(vals)};

    if(s.id==="cape15"){
      const endorsed=rr.filter(function(r){return r.frequency_or_severity>=2 && r.distress!=null});
      clusters[k].distress_mean_endorsed=mean(endorsed.map(function(r){return r.distress}));
      clusters[k].endorsed_n=endorsed.length;
    }else{
      clusters[k].endorsed_ge2=rr.filter(function(r){return r.frequency_or_severity>=2}).length;
    }
  });

  if(s.id==="pcl5"){
    return {
      total:rows.reduce(function(a,r){return a+r.frequency_or_severity},0),
      max:80,
      clusters:clusters
    };
  }

  const endorsed=rows.filter(function(r){return r.frequency_or_severity>=2 && r.distress!=null});
  return {
    frequency_sum:rows.reduce(function(a,r){return a+r.frequency_or_severity},0),
    frequency_mean:mean(rows.map(function(r){return r.frequency_or_severity})),
    distress_mean_endorsed:mean(endorsed.map(function(r){return r.distress})),
    endorsed_n:endorsed.length,
    clusters:clusters
  };
}

function finish(){
  state.finishedAt=nowIso();
  assessment.classList.add("hidden");
  result.classList.remove("hidden");
  $("#progressBar").style.width="100%";

  const s=SCALES[state.scaleId];
  const summary=summarize();
  const cards=$("#resultCards");
  if(state.session){
    AIQ.completeSession(state.session,{scale_id:s.id,scale_name:s.name,summary:summary,item_count:state.rows.length});
  }

  if(s.id==="pcl5"){
    cards.innerHTML =
      '<div class="metric-card"><span class="section-kicker">总严重度</span><div class="metric">' + summary.total + '</div><p>0–80 的原始总分。仅作研究记录，不在参与者页面给出诊断阈值。</p></div>' +
      '<div class="metric-card"><span class="section-kicker">条目完成</span><div class="metric">20/20</div><p>全部题目已作答。</p></div>' +
      '<div class="metric-card"><span class="section-kicker">Session</span><div class="metric">✓</div><p>' + state.sessionId + '</p></div>' +
      clusterBlock(s,summary.clusters);
  }else{
    cards.innerHTML =
      '<div class="metric-card"><span class="section-kicker">平均频率</span><div class="metric">' + summary.frequency_mean.toFixed(2) + '</div><p>1–4 的平均频率分。页面不设置“高风险”标签。</p></div>' +
      '<div class="metric-card"><span class="section-kicker">出现过的体验</span><div class="metric">' + summary.endorsed_n + '</div><p>频率至少为“有时”的条目数。</p></div>' +
      '<div class="metric-card"><span class="section-kicker">困扰均值</span><div class="metric">' + (summary.distress_mean_endorsed==null?"—":summary.distress_mean_endorsed.toFixed(2)) + '</div><p>仅对出现过的体验计算，频率与困扰分开保留。</p></div>' +
      clusterBlock(s,summary.clusters);
  }

  window.scrollTo({top:0,behavior:"smooth"});
}

function clusterBlock(s,clusters){
  const rows=Object.entries(clusters).map(function(entry){
    const k=entry[0];
    const v=entry[1];
    const pct=s.id==="pcl5" ? (v.sum/(v.n*4))*100 : ((v.mean-1)/3)*100;
    const tail=s.id==="pcl5"
      ? "总分 " + v.sum + " · ≥2 条目 " + v.endorsed_ge2
      : "频率均值 " + v.mean.toFixed(2) + " · 出现 " + v.endorsed_n;

    return '<div class="cluster-row"><span><strong>' + k + '</strong></span><div class="cluster-track"><div class="cluster-fill" style="width:' + Math.max(0,pct) + '%"></div></div><span>' + tail + '</span></div>';
  }).join("");

  return '<div class="cluster-list"><p class="section-kicker">维度概览</p>' + rows + '</div>';
}

function payload(){
  return {
    schema_version:1,
    study_id:"P002",
    study_version:VERSION,
    status:"prototype_only",
    participant_id:state.participantId || null,
    session_id:state.sessionId,
    scale_id:state.scaleId,
    started_at:state.startedAt,
    finished_at:state.finishedAt,
    summary:summarize(),
    responses:state.rows,
    instrument_note:state.scaleId==="pcl5"
      ? "PCL-5 construct and scoring structure; Chinese wording in this prototype should be replaced/frozen according to the approved study language version."
      : "Current CAPE-P15 research prototype; frequency and conditional distress are stored separately. Chinese wording/version must be frozen before formal collection."
  };
}

function download(name,text,type){
  const blob=new Blob([text],{type:type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download=name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function(){URL.revokeObjectURL(url)},500);
}

$("#downloadJson").onclick=function(){
  download("P002_" + state.scaleId + "_" + state.sessionId + ".json",JSON.stringify(payload(),null,2),"application/json");
};

$("#downloadCsv").onclick=function(){
  const cols=["participant_id","session_id","study_version","scale_id","scale_name","item_id","cluster","frequency_or_severity","distress","response_ms","answered_at"];
  const esc=function(v){
    return v==null ? "" : '"' + String(v).replaceAll('"','""') + '"';
  };
  const csv=[cols.join(",")].concat(state.rows.map(function(r){
    return cols.map(function(c){return esc(r[c])}).join(",");
  })).join("\n");

  download("P002_" + state.scaleId + "_" + state.sessionId + ".csv","\ufeff"+csv,"text/csv;charset=utf-8");
};