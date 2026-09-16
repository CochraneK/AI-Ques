const cfg = globalThis.P002_CONDITION;
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

render();
