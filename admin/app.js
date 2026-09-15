const $=s=>document.querySelector(s);
let allEvents=[];

function uniq(values){return [...new Set(values.filter(Boolean))].sort()}
function short(v,n=54){
  if(v==null)return "";
  const s=typeof v==="string"?v:JSON.stringify(v);
  return s.length>n?s.slice(0,n)+"…":s;
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
function populateFilters(){
  const projects=uniq(allEvents.map(e=>e.project_id));
  const types=uniq(allEvents.map(e=>e.event_type));
  $("#projectFilter").innerHTML='<option value="">全部项目</option>'+projects.map(x=>'<option>'+escapeHtml(x)+'</option>').join("");
  $("#eventFilter").innerHTML='<option value="">全部事件</option>'+types.map(x=>'<option>'+escapeHtml(x)+'</option>').join("");
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
function render(){
  const rows=filtered().sort((a,b)=>String(b.occurred_at).localeCompare(String(a.occurred_at)));
  $("#rowCount").textContent=rows.length+" rows";
  $("#eventRows").innerHTML=rows.length?rows.map(e=>'<tr>'+
    '<td>'+escapeHtml(e.occurred_at||"")+'</td>'+
    '<td><code>'+escapeHtml(e.participant_id||"—")+'</code></td>'+
    '<td>'+escapeHtml(e.project_id||"—")+'</td>'+
    '<td><code>'+escapeHtml(e.session_id||"—")+'</code></td>'+
    '<td>'+escapeHtml(e.event_type||"")+'</td>'+
    '<td class="summary" title="'+escapeHtml(JSON.stringify(e.payload||{}))+'">'+escapeHtml(short(e.payload,100))+'</td>'+
    '</tr>').join(""):'<tr><td colspan="6" class="empty">暂无匹配数据</td></tr>';

  $("#metricParticipants").textContent=uniq(allEvents.map(e=>e.participant_id)).length;
  $("#metricSessions").textContent=uniq(allEvents.map(e=>e.session_id)).length;
  $("#metricEvents").textContent=allEvents.length;
  $("#metricPending").textContent=AIQ.queuedEvents().length;
}
async function load(){
  const source=await AIQ.adminEvents();
  allEvents=source.events||[];
  const banner=$("#modeBanner");
  if(source.mode==="remote"){
    banner.className="banner remote";
    banner.textContent="已连接研究后端：当前表格读取管理员远端事件库。";
  }else{
    banner.className="banner";
    banner.textContent="当前为本地原型模式：此页面只能看到同一浏览器产生的数据。要实现跨设备、所有参与者实时同步，需要在 shared/config.js 配置经过伦理与安全审核的研究 API。";
  }
  populateFilters();
  render();
}
["projectFilter","eventFilter"].forEach(id=>$("#"+id).onchange=render);
$("#participantFilter").oninput=render;
$("#refreshBtn").onclick=async()=>{await AIQ.flush();await load()};
$("#exportJson").onclick=()=>AIQ.download("aiques-all-events.json",JSON.stringify(allEvents,null,2),"application/json");
$("#exportCsv").onclick=()=>{
  const cols=["event_id","occurred_at","participant_id","project_id","session_id","event_type","payload_json"];
  const esc=v=>'"'+String(v??"").replaceAll('"','""')+'"';
  const rows=allEvents.map(e=>[
    e.event_id,e.occurred_at,e.participant_id,e.project_id,e.session_id,e.event_type,JSON.stringify(e.payload||{})
  ]);
  const csv=[cols.join(","),...rows.map(r=>r.map(esc).join(","))].join("\n");
  AIQ.download("aiques-all-events.csv","\ufeff"+csv,"text/csv;charset=utf-8");
};
load();