const $=s=>document.querySelector(s);
let allEvents=[];

function uniq(values){return [...new Set(values.filter(Boolean))].sort()}
function short(v,n=54){if(v==null)return "";const s=typeof v==="string"?v:JSON.stringify(v);return s.length>n?s.slice(0,n)+"…":s}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
function fmtTime(iso){if(!iso)return "—";try{return new Date(iso).toLocaleString("zh-CN",{hour12:false})}catch(e){return iso}}
function completionEvents(){return allEvents.filter(e=>e.event_type==="session_completed")}
function startEvents(){return allEvents.filter(e=>e.event_type==="session_started")}

function populateFilters(){
  const currentProject=$("#projectFilter").value;
  const currentType=$("#eventFilter").value;
  const projects=uniq(allEvents.map(e=>e.project_id));
  const types=uniq(allEvents.map(e=>e.event_type));
  $("#projectFilter").innerHTML='<option value="">全部项目</option>'+projects.map(x=>'<option>'+escapeHtml(x)+'</option>').join("");
  $("#eventFilter").innerHTML='<option value="">全部事件</option>'+types.map(x=>'<option>'+escapeHtml(x)+'</option>').join("");
  $("#projectFilter").value=currentProject;
  $("#eventFilter").value=currentType;
}
function filtered(){
  const project=$("#projectFilter").value;
  const participant=$("#participantFilter").value.trim().toLowerCase();
  const type=$("#eventFilter").value;
  return allEvents.filter(e=>
    (!project||e.project_id===project) &&
    (!type||e.event_type===type) &&
    (!participant||String(e.participant_id||"").toLowerCase().includes(participant))
  );
}
function renderProjectBars(){
  const groups={};
  allEvents.forEach(e=>{if(e.project_id)groups[e.project_id]=(groups[e.project_id]||0)+1});
  const entries=Object.entries(groups).sort((a,b)=>b[1]-a[1]);
  const max=Math.max(1,...entries.map(x=>x[1]));
  $("#projectBars").innerHTML=entries.length?entries.map(([id,n])=>
    '<div class="project-bar"><span class="label">'+escapeHtml(id)+'</span><div class="bar-track"><div class="bar-fill" style="width:'+Math.round(n/max*100)+'%"></div></div><small>'+n+' events</small></div>'
  ).join(""):'<div class="empty">暂无项目事件</div>';
}
function renderHealth(){
  const starts=startEvents().length;
  const completed=completionEvents().length;
  const rate=starts?Math.round(completed/starts*100):0;
  const participants=uniq(allEvents.map(e=>e.participant_id));
  const multi=participants.filter(pid=>uniq(allEvents.filter(e=>e.participant_id===pid).map(e=>e.project_id)).length>1).length;
  const p002=completionEvents().filter(e=>e.project_id==="P002");
  const rapid=p002.filter(e=>{
    const t=e.payload?.result?.summary?.timing;
    const n=e.payload?.result?.item_count||0;
    return t&&n&&t.rapid_under_800ms_n/Math.max(n,1)>.25;
  }).length;
  $("#healthGrid").innerHTML=
    '<div class="health-card"><strong>'+rate+'%</strong><span>session completion / started</span></div>'+
    '<div class="health-card"><strong>'+multi+'</strong><span>跨 2+ 项目的参与者</span></div>'+
    '<div class="health-card"><strong>'+p002.length+'</strong><span>P002 完成 sessions</span></div>'+
    '<div class="health-card"><strong>'+rapid+'</strong><span>P002 快速作答提示 sessions</span></div>';
}
function p002Core(e){
  const result=e.payload?.result||{};
  const summary=result.summary||{};
  const scale=result.scale_id||"—";
  if(scale==="pcl5"){
    return {
      main:"PCL 总分 "+(summary.total??"—"),
      sub:"B/C/D/E pattern: "+(summary.dsm_cluster_pattern_all?"all met":"not all met")
    };
  }
  return {
    main:"频率均值 "+(summary.frequency_mean==null?"—":Number(summary.frequency_mean).toFixed(2)),
    sub:"困扰均值 "+(summary.distress_mean_endorsed==null?"—":Number(summary.distress_mean_endorsed).toFixed(2))+" · endorsed "+(summary.endorsed_n??"—")
  };
}
function renderP002(){
  const rows=completionEvents().filter(e=>e.project_id==="P002").sort((a,b)=>String(b.occurred_at).localeCompare(String(a.occurred_at)));
  $("#p002Section").classList.toggle("hidden",!rows.length);
  if(!rows.length)return;
  $("#p002Count").textContent=rows.length+" completed";
  $("#p002Rows").innerHTML=rows.map(e=>{
    const r=e.payload?.result||{}, s=r.summary||{}, t=s.timing||{}, core=p002Core(e);
    const itemN=r.item_count||0, rapid=t.rapid_under_800ms_n||0;
    const q=rapid/Math.max(itemN,1)>.25;
    const quality='<span class="'+(q?'quality-warn':'quality-ok')+'">'+(q?'⚠ ':'✓ ')+rapid+'/'+itemN+' <800ms</span>'+
      '<span class="result-sub">median '+(t.median_response_ms==null?"—":Math.round(t.median_response_ms))+' ms</span>';
    return '<tr>'+
      '<td><code>'+escapeHtml(e.participant_id||"—")+'</code></td>'+
      '<td><code>'+escapeHtml(e.session_id||"—")+'</code></td>'+
      '<td><span class="pill">'+escapeHtml(r.scale_id||"—")+'</span></td>'+
      '<td>'+escapeHtml(r.condition_id||"—")+'</td>'+
      '<td><span class="result-main">'+escapeHtml(core.main)+'</span><span class="result-sub">'+escapeHtml(core.sub)+'</span></td>'+
      '<td>'+quality+'</td>'+
      '<td>'+escapeHtml(fmtTime(e.payload?.finished_at||e.occurred_at))+'</td>'+
      '</tr>';
  }).join("");
}
function renderEvents(){
  const rows=filtered().sort((a,b)=>String(b.occurred_at).localeCompare(String(a.occurred_at)));
  $("#rowCount").textContent=rows.length+" rows";
  $("#eventRows").innerHTML=rows.length?rows.map(e=>'<tr>'+
    '<td>'+escapeHtml(fmtTime(e.occurred_at))+'</td>'+
    '<td><code>'+escapeHtml(e.participant_id||"—")+'</code></td>'+
    '<td>'+escapeHtml(e.project_id||"—")+'</td>'+
    '<td><code>'+escapeHtml(e.session_id||"—")+'</code></td>'+
    '<td>'+escapeHtml(e.event_type||"")+'</td>'+
    '<td class="summary" title="'+escapeHtml(JSON.stringify(e.payload||{}))+'">'+escapeHtml(short(e.payload,110))+'</td>'+
    '</tr>').join(""):'<tr><td colspan="6" class="empty">暂无匹配数据</td></tr>';
}
function render(){
  const participants=uniq(allEvents.map(e=>e.participant_id));
  $("#metricParticipants").textContent=participants.length;
  $("#metricSessions").textContent=uniq(allEvents.map(e=>e.session_id)).length;
  $("#metricCompleted").textContent=completionEvents().length;
  $("#metricEvents").textContent=allEvents.length+" events";
  $("#metricPending").textContent=AIQ.queuedEvents().length;
  renderProjectBars();
  renderHealth();
  renderP002();
  renderEvents();
}
async function load(){
  const source=await AIQ.adminEvents();
  allEvents=source.events||[];
  const banner=$("#modeBanner");
  if(source.mode==="remote"){
    banner.className="banner remote";
    banner.textContent="已连接研究后端：当前页面读取管理员远端事件库。";
  }else{
    banner.className="banner";
    banner.textContent="本地原型模式：当前只能读取这个浏览器产生的数据。shared/config.js 配置经过审核的 research API 后，同一面板会切换到跨设备管理员事件库。";
  }
  populateFilters();
  render();
}
["projectFilter","eventFilter"].forEach(id=>$("#"+id).onchange=renderEvents);
$("#participantFilter").oninput=renderEvents;
$("#refreshBtn").onclick=async()=>{await AIQ.flush();await load()};
$("#exportJson").onclick=()=>AIQ.download("aiques-all-events.json",JSON.stringify(allEvents,null,2),"application/json");
$("#exportCsv").onclick=()=>{
  const cols=["event_id","occurred_at","participant_id","project_id","session_id","event_type","payload_json"];
  const esc=v=>'"'+String(v??"").replaceAll('"','""')+'"';
  const rows=allEvents.map(e=>[e.event_id,e.occurred_at,e.participant_id,e.project_id,e.session_id,e.event_type,JSON.stringify(e.payload||{})]);
  const csv=[cols.join(","),...rows.map(r=>r.map(esc).join(","))].join("\n");
  AIQ.download("aiques-all-events.csv","\ufeff"+csv,"text/csv;charset=utf-8");
};
load();