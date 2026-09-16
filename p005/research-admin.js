(() => {
  'use strict';
  const KEY='bjtu.p005.research-admin.v1';
  const $=(s)=>document.querySelector(s);
  const escape=(value)=>String(value==null?'':value).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const read=()=>{try{return JSON.parse(sessionStorage.getItem(KEY)||'{}')}catch(_){return{}}};
  const write=(v)=>sessionStorage.setItem(KEY,JSON.stringify(v));
  const base=()=>String(read().baseUrl||'').replace(/\/$/,'');
  const headers=()=>({'X-Admin-Token':read().adminToken||''});

  async function api(path){
    const r=await fetch(base()+path,{headers:headers()});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(data.error||('HTTP '+r.status));
    return data;
  }
  function fmt(value){
    if(!value)return '—';
    try{return new Date(value).toLocaleString('zh-CN')}catch(_){return value}
  }
  function status(text,error=false){
    $('#connectStatus').textContent=text||'';
    $('#connectStatus').classList.toggle('error',error);
  }
  async function connect(){
    const baseUrl=$('#researchApiInput').value.trim().replace(/\/$/,'');
    const adminToken=$('#adminTokenInput').value.trim();
    if(!baseUrl||!adminToken){status('需要 API 地址和 Admin token',true);return}
    write({baseUrl,adminToken});
    status('正在连接…');
    try{
      await loadSessions();
      $('#dataPanel').classList.remove('hidden');
      status('已连接');
    }catch(error){status('连接失败 · '+error.message,true)}
  }
  async function loadSessions(){
    const data=await api('/api/v1/admin/sessions?limit=500');
    const sessions=data.sessions||[];
    $('#sessionCount').textContent=sessions.length;
    $('#sessionList').innerHTML=sessions.map((s)=>`
      <button class="session-row" data-id="${escape(s.id)}">
        <span><b>${escape(s.externalParticipantId||s.participantId)}</b><small>${escape(s.condition||s.studyId)}</small></span>
        <span><b>${escape(s.status)}</b><small>${escape(s.protocolVersion)}</small></span>
        <span><b>${s.eventCount||0}</b><small>events</small></span>
        <span><b>${escape(fmt(s.createdAt))}</b><small>started</small></span>
      </button>`).join('')||'<p class="empty">暂无 session</p>';
    document.querySelectorAll('[data-id]').forEach((button)=>button.addEventListener('click',()=>openSession(button.dataset.id)));
  }
  async function openSession(id){
    const data=await api('/api/v1/admin/sessions/'+encodeURIComponent(id));
    const s=data.session||{},events=data.events||[];
    const detail=$('#sessionDetail');
    detail.classList.remove('hidden');
    detail.innerHTML=`
      <div class="detail-head"><div><small>SESSION</small><h2>${escape(s.id)}</h2></div><button id="closeDetail" type="button">关闭</button></div>
      <dl>
        <div><dt>Participant</dt><dd>${escape(s.participantId)}</dd></div>
        <div><dt>Study</dt><dd>${escape(s.studyId)}</dd></div>
        <div><dt>Condition</dt><dd>${escape(s.condition||'—')}</dd></div>
        <div><dt>Protocol</dt><dd>${escape(s.protocolVersion)}</dd></div>
        <div><dt>Status</dt><dd>${escape(s.status)}</dd></div>
        <div><dt>Started</dt><dd>${escape(fmt(s.createdAt))}</dd></div>
      </dl>
      <h3>Current state</h3>
      <pre>${escape(JSON.stringify(s.currentState||{},null,2))}</pre>
      <h3>Events · ${events.length}</h3>
      <div class="events">${events.map((e)=>`
        <details>
          <summary><b>${escape(e.type)}</b><span>${escape(fmt(e.createdAt))}</span></summary>
          <pre>${escape(JSON.stringify({payload:e.payload,snapshot:e.snapshot},null,2))}</pre>
        </details>`).join('')}</div>
    `;
    $('#closeDetail').addEventListener('click',()=>detail.classList.add('hidden'));
    detail.scrollIntoView({behavior:'smooth',block:'start'});
  }
  async function exportCsv(){
    const r=await fetch(base()+'/api/v1/admin/export.csv',{headers:headers()});
    if(!r.ok){status('导出失败 · HTTP '+r.status,true);return}
    const blob=await r.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='p005-sessions.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
  }

  const saved=read();
  $('#researchApiInput').value=saved.baseUrl||(window.P005_FUTURE_ME_CONFIG||{}).researchApi||'';
  $('#adminTokenInput').value=saved.adminToken||'';
  $('#connectBtn').addEventListener('click',connect);
  $('#refreshBtn').addEventListener('click',()=>loadSessions().catch((e)=>status(e.message,true)));
  $('#exportCsvBtn').addEventListener('click',exportCsv);
  if(saved.baseUrl&&saved.adminToken)connect();
})();
