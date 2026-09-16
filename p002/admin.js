const cfg = globalThis.P002_CONDITION;
const research = globalThis.P00_RESEARCH;
const runtime = globalThis.P00_RUNTIME_CONFIG;
let selected = cfg.read().condition;

const $ = (s) => document.querySelector(s);

function formatTime(value){
  if(!value) return '默认值';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '已保存' : date.toLocaleString('zh-CN');
}

function render(){
  const current = cfg.read();
  $('#currentLabel').textContent = cfg.options[current.condition].label;
  $('#updatedAt').textContent = formatTime(current.updated_at);

  $('#conditionCards').innerHTML = Object.entries(cfg.options).map(([id,opt]) => `
    <button class="condition-card ${selected===id?'active':''}" data-condition="${id}" aria-pressed="${selected===id}">
      <span class="radio" aria-hidden="true"></span>
      <span class="copy">
        <strong>${opt.label}${id==='story'?'<em>默认</em>':''}</strong>
        <small>${opt.description}</small>
      </span>
    </button>
  `).join('');

  document.querySelectorAll('[data-condition]').forEach((button)=>{
    button.onclick = () => {
      selected = button.dataset.condition;
      render();
    };
  });
}

function toast(message){
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(()=>node.classList.remove('show'), 1600);
}

function escapeCsv(value){
  const text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g,'""') + '"' : text;
}

function download(name, text, type){
  const blob = new Blob([text], {type});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 0);
}

function p002Data(){
  const sessions = research?.listSessions?.('P002') || [];
  const events = research?.listEvents?.('P002') || [];
  return {
    schema_version: 1,
    exported_at: new Date().toISOString(),
    participant: research?.ensureParticipant?.() || null,
    sessions,
    events
  };
}

function renderData(){
  if(!research){
    $('#syncState').textContent = 'research runtime unavailable';
    return;
  }
  const data = p002Data();
  const sessions = [...data.sessions].sort((a,b)=>String(b.started_at).localeCompare(String(a.started_at)));
  const apiBase = runtime?.read?.().apiBase || '';

  $('#participantId').textContent = data.participant?.participant_id || '—';
  $('#sessionCount').textContent = String(data.sessions.length);
  $('#eventCount').textContent = String(data.events.length);
  $('#pendingCount').textContent = String(research.pendingCount('P002'));
  $('#syncState').textContent = apiBase ? 'API: ' + apiBase : '未配置服务端 API';

  $('#sessionList').innerHTML = sessions.length
    ? sessions.slice(0,12).map(session => `
      <div class="session-row">
        <code title="${session.session_id}">${session.session_id}</code>
        <span>${session.scale_id || '—'}</span>
        <span>${session.condition_id || '—'}</span>
        <span class="status">${session.status || '—'}</span>
      </div>
    `).join('')
    : '<div class="empty">当前浏览器还没有 P002 会话。</div>';
}

$('#saveBtn').onclick = () => {
  cfg.write(selected);
  render();
  toast('实验条件已保存');
};

$('#resetBtn').onclick = () => {
  cfg.reset();
  selected = 'story';
  render();
  toast('已恢复默认故事问卷');
};

$('#syncBtn').onclick = async () => {
  if(!research) return;
  $('#syncBtn').disabled = true;
  try{
    const result = await research.flushPending();
    renderData();
    toast(result.skipped ? '未配置服务端 API，事件仍保存在本地' : `已同步 ${result.synced} 条事件`);
  }finally{
    $('#syncBtn').disabled = false;
  }
};

$('#exportJsonBtn').onclick = () => {
  const data = p002Data();
  download('p002-research-export.json', JSON.stringify(data,null,2), 'application/json;charset=utf-8');
  toast('JSON 已导出');
};

$('#exportCsvBtn').onclick = () => {
  const events = p002Data().events;
  const columns = [
    'event_id','participant_id','session_id','project_id','study_version','scale_id','condition_id',
    'event_type','item_id','cluster','response','distress','response_ms','frequency_response_ms','signal','timestamp'
  ];
  const rows = [columns.join(',')].concat(
    events.map(event => columns.map(key => escapeCsv(event[key])).join(','))
  );
  download('p002-events.csv', rows.join('\n'), 'text/csv;charset=utf-8');
  toast('CSV 已导出');
};

render();
renderData();