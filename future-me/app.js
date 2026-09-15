const STORAGE_KEY = 'bjtu_p005_future_me_v2';
const LEGACY_KEY = 'aiques_future_me_v1';
const SHARED_KEYS = ['bjtu_p00_profile_v1', 'bjtu_profile_v1', 'aiques_shared_profile_v1'];
const MODULE_ID = 'P005';
const MODULE_VERSION = '0.1.0';

const screens = ['welcome', 'identity', 'present', 'future', 'generate', 'ready', 'chat', 'capsule'];
const stepNames = {
  welcome: '开始',
  identity: '现在',
  present: '经历',
  future: '未来',
  generate: '生成',
  ready: '见面',
  chat: '对话',
  capsule: '时间胶囊'
};

const state = {
  screen: 'welcome',
  profile: {},
  memory: null,
  messages: [],
  currentPortrait: '',
  futurePortrait: '',
  capsules: [],
  generated: false,
  settings: {
    voiceMode: false,
    unlockMonths: 12
  }
};

const $ = function (selector) { return document.querySelector(selector); };
const $$ = function (selector) { return Array.from(document.querySelectorAll(selector)); };

function parseJson(value) {
  try { return JSON.parse(value); } catch (e) { return null; }
}

function clean(value, fallback) {
  const text = String(value || '').trim();
  return text || (fallback || '');
}

function firstClause(value, fallback) {
  const source = clean(value, fallback || '').split(/[。！？.!?\n]/)[0];
  return source.length > 52 ? source.slice(0, 52) + '…' : source;
}

function hash(value) {
  let h = 2166136261;
  const text = String(value || '');
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(list, seed) {
  return list[hash(seed) % list.length];
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c];
    })
    .replace(/\n/g, '<br>');
}

function apiConfig(name) {
  const config = window.P005_FUTURE_ME_CONFIG || {};
  const directMap = {
    chatApi: window.FUTURE_ME_API,
    imageApi: window.FUTURE_ME_IMAGE_API,
    voiceApi: window.FUTURE_ME_VOICE_API,
    adminApi: window.P00_ADMIN_API
  };
  return directMap[name] || config[name] || '';
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__p005ToastTimer);
  window.__p005ToastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
}

function sharedProfile() {
  const merged = {};
  SHARED_KEYS.forEach(function (key) {
    const value = parseJson(localStorage.getItem(key) || '');
    if (!value || typeof value !== 'object') return;
    const candidate = value.profile && typeof value.profile === 'object' ? value.profile : value;
    Object.keys(candidate).forEach(function (k) {
      if (candidate[k] !== undefined && candidate[k] !== null && candidate[k] !== '') merged[k] = candidate[k];
    });
  });
  if (window.P00_CONTEXT && typeof window.P00_CONTEXT === 'object') {
    const candidate = window.P00_CONTEXT.profile || window.P00_CONTEXT;
    Object.keys(candidate).forEach(function (k) {
      if (candidate[k] !== undefined && candidate[k] !== null && candidate[k] !== '') merged[k] = candidate[k];
    });
  }
  return merged;
}

function mapSharedIntoProfile(shared) {
  const map = {
    nickname: 'name',
    displayName: 'name',
    userName: 'name',
    hometown: 'origin',
    city: 'location',
    currentCity: 'location',
    occupation: 'currentWork',
    currentRole: 'currentWork',
    coreValues: 'values'
  };
  Object.keys(shared || {}).forEach(function (key) {
    const target = map[key] || key;
    if (['name', 'age', 'origin', 'location', 'currentWork', 'values'].indexOf(target) >= 0 && !state.profile[target]) {
      state.profile[target] = shared[key];
    }
  });
}

function writeSharedProfile() {
  const current = parseJson(localStorage.getItem('aiques_shared_profile_v1') || '') || {};
  const next = Object.assign({}, current, {
    name: state.profile.name || current.name || '',
    age: state.profile.age || current.age || '',
    origin: state.profile.origin || current.origin || '',
    location: state.profile.location || current.location || '',
    currentWork: state.profile.currentWork || current.currentWork || '',
    values: state.profile.values || current.values || '',
    updatedBy: MODULE_ID,
    updatedAt: new Date().toISOString()
  });
  try { localStorage.setItem('aiques_shared_profile_v1', JSON.stringify(next)); } catch (e) {}
}

function snapshot(includeMedia) {
  const data = {
    module: MODULE_ID,
    version: MODULE_VERSION,
    profile: state.profile,
    syntheticMemory: state.memory,
    messages: state.messages,
    capsules: state.capsules,
    settings: state.settings,
    screen: state.screen,
    media: {
      hasCurrentPortrait: Boolean(state.currentPortrait),
      hasFuturePortrait: Boolean(state.futurePortrait)
    },
    exportedAt: new Date().toISOString()
  };
  if (includeMedia) {
    data.media.currentPortrait = state.currentPortrait || '';
    data.media.futurePortrait = state.futurePortrait || '';
  }
  return data;
}

function emitSessionEvent(type, payload) {
  try {
    window.dispatchEvent(new CustomEvent('p00:session', {
      detail: {
        module: MODULE_ID,
        type: type,
        payload: payload || {},
        snapshot: snapshot(false)
      }
    }));
  } catch (e) {}
}

async function syncAdmin(type) {
  const endpoint = apiConfig('adminApi');
  if (!endpoint) return;
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: MODULE_ID,
        version: MODULE_VERSION,
        event: type,
        occurredAt: new Date().toISOString(),
        data: snapshot(false)
      })
    });
  } catch (e) {
    console.warn('P005 admin sync unavailable', e);
  }
}

function save() {
  const payload = {
    profile: state.profile,
    memory: state.memory,
    messages: state.messages,
    currentPortrait: state.currentPortrait,
    futurePortrait: state.futurePortrait,
    capsules: state.capsules,
    settings: state.settings,
    screen: state.screen
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    writeSharedProfile();
  } catch (e) {
    console.warn('P005 local save failed', e);
  }
}

function migrateLegacy() {
  if (localStorage.getItem(STORAGE_KEY)) return;
  const legacy = parseJson(localStorage.getItem(LEGACY_KEY) || '');
  if (!legacy) return;
  state.profile = legacy.profile || {};
  state.memory = legacy.memory || null;
  state.messages = legacy.messages || [];
}

function fillForms() {
  Object.keys(state.profile).forEach(function (key) {
    const field = document.querySelector('[name="' + key + '"]');
    if (field && field.value !== String(state.profile[key] || '')) field.value = state.profile[key] || '';
  });
  if ($('#heroAge')) $('#heroAge').textContent = state.profile.age ? String(state.profile.age) : '今天';
}

function collect() {
  ['identityForm', 'presentForm', 'futureForm'].forEach(function (id) {
    const form = $('#' + id);
    if (!form) return;
    new FormData(form).forEach(function (value, key) {
      state.profile[key] = String(value || '').trim();
    });
  });
  fillForms();
  save();
}

function restorePortraits() {
  if (state.currentPortrait) {
    $('#currentPortraitFrame').classList.add('has-image');
    $('#currentPortraitImg').src = state.currentPortrait;
  }
  renderFuturePortrait();
}

function load() {
  migrateLegacy();
  const saved = parseJson(localStorage.getItem(STORAGE_KEY) || '');
  if (saved) {
    state.profile = saved.profile || state.profile || {};
    state.memory = saved.memory || null;
    state.messages = saved.messages || [];
    state.currentPortrait = saved.currentPortrait || '';
    state.futurePortrait = saved.futurePortrait || '';
    state.capsules = saved.capsules || [];
    state.settings = Object.assign({}, state.settings, saved.settings || {});
    state.screen = saved.screen || 'welcome';
    state.generated = Boolean(state.memory);
  }
  mapSharedIntoProfile(sharedProfile());
  fillForms();
  restorePortraits();
  updateVoiceUI();
  renderCapsules();
  setUnlockMonths(state.settings.unlockMonths || 12, false);

  const hasProgress = Boolean(saved && (
    Object.keys(state.profile).length || state.messages.length || state.memory || state.currentPortrait || state.capsules.length
  ));
  if ($('#resumeBtn')) $('#resumeBtn').style.display = hasProgress ? '' : 'none';
}

function renderDots() {
  const index = Math.max(0, screens.indexOf(state.screen));
  $('#stepLabel').textContent = stepNames[state.screen] || '';
  $('#stepDots').innerHTML = [0, 1, 2, 3, 4, 5].map(function (_, i) {
    return '<i class="' + (index >= Math.min(7, i + 1) ? 'active' : '') + '"></i>';
  }).join('');
}

function show(name) {
  collect();
  state.screen = name;
  $$('.screen').forEach(function (node) { node.classList.remove('active'); });
  const target = $('#screen-' + name);
  if (target) target.classList.add('active');
  renderDots();

  if (name === 'generate') generateSequence();
  if (name === 'ready') renderReady();
  if (name === 'chat') startChat();
  if (name === 'capsule') {
    renderLetter();
    renderCapsules();
  }

  save();
  emitSessionEvent('screen_view', { screen: name });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$$('[data-next]').forEach(function (button) {
  button.addEventListener('click', function () {
    const formId = button.dataset.validate;
    if (formId && !$('#' + formId).reportValidity()) return;
    show(button.dataset.next);
  });
});

$$('[data-prev]').forEach(function (button) {
  button.addEventListener('click', function () { show(button.dataset.prev); });
});

$('#resumeBtn').addEventListener('click', function () {
  let destination = state.screen;
  if (!destination || destination === 'welcome' || destination === 'generate') {
    destination = state.memory ? 'ready' : (Object.keys(state.profile).length ? 'identity' : 'welcome');
  }
  show(destination);
});

$('#resetBtn').addEventListener('click', function () {
  if (!confirm('清空本地的 P005 回答、照片、对话和时间胶囊，重新开始？')) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_KEY);
  location.reload();
});

$('#exportBtn').addEventListener('click', function () {
  collect();
  const blob = new Blob([JSON.stringify(snapshot(true), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'P005-Future-Me-' + new Date().toISOString().slice(0, 10) + '.json';
  anchor.click();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  emitSessionEvent('export', {});
  showToast('已导出 P005 本地数据');
});

async function compressImage(file) {
  const dataUrl = await new Promise(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () { resolve(reader.result); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const image = await new Promise(function (resolve, reject) {
    const img = new Image();
    img.onload = function () { resolve(img); };
    img.onerror = reject;
    img.src = dataUrl;
  });

  const maxSide = 1024;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

$('#portraitUploadBtn').addEventListener('click', function () { $('#portraitInput').click(); });
$('#portraitInput').addEventListener('change', async function (event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('请选择图片文件');
    return;
  }
  if (file.size > 12 * 1024 * 1024) {
    showToast('图片太大，请选择 12MB 以下的照片');
    return;
  }
  try {
    state.currentPortrait = await compressImage(file);
    state.futurePortrait = '';
    $('#currentPortraitFrame').classList.add('has-image');
    $('#currentPortraitImg').src = state.currentPortrait;
    renderFuturePortrait();
    save();
    emitSessionEvent('portrait_added', {});
    showToast('照片已在本地保存');
  } catch (e) {
    console.error(e);
    showToast('照片读取失败');
  }
});

function buildMemory() {
  const p = state.profile;
  const age = Number(p.age) || 22;
  const gap = Math.max(1, 60 - age);
  const y1 = Math.min(6, Math.max(2, Math.round(gap * 0.18)));
  const y2 = Math.min(16, Math.max(y1 + 3, Math.round(gap * 0.48)));

  const challenge = firstClause(p.challenge, '学会在不确定里继续行动');
  const project = firstClause(p.lifeProject, '持续投入一件真正重要的长期事情');
  const career = firstClause(p.career, '逐渐找到更适合自己的工作方式');
  const people = firstClause(p.people, '重要的人');
  const values = firstClause(p.values, '好奇、关系与自主');
  const futureLocation = firstClause(p.futureLocation, p.location || '一个让自己感到安稳的地方');
  const daily = firstClause(p.dailyLife, '有工作，也有稳定留给生活和关系的时间');
  const proud = firstClause(p.proud, '曾经做成一件自己真正认可的事');
  const low = firstClause(p.lowPoint, '经历过一段并不轻松的时期');
  const turning = firstClause(p.turningPoint, '一次让方向发生变化的选择');

  const timeline = [
    {
      age: age,
      tag: '现在',
      text: '你带着“' + values + '”这些仍很重要的东西出发。你已经' + proud + '，也' + low + '，并经历过' + turning + '。'
    },
    {
      age: Math.min(60, age + y1),
      tag: '第一段变化',
      text: '你没有一次解决所有问题，而是开始把“' + challenge + '”拆成更小的行动。你和' + people + '的关系也在这个阶段重新调整。'
    },
    {
      age: Math.min(60, age + y2),
      tag: '方向逐渐成形',
      text: '围绕“' + project + '”，你积累了更稳定的能力、关系和作品。职业上，' + career + '。有些计划没有按原样发生，但价值排序变得更清楚。'
    },
    {
      age: 60,
      tag: 'Future Me',
      text: '你生活在' + futureLocation + '。一个普通的理想日常是：' + daily + '。回头看，这条路更像许多小选择叠加的结果，而不是某个命中注定的答案。'
    }
  ];

  const lessons = [
    '不是所有担心都需要先消失，才有资格开始。',
    '真正保留下来的不只是成就，还有“' + values + '”。',
    '关系和长期项目都靠反复回到现场，而不是靠一次完美决定。',
    '未来没有替你证明“当初选对了”，它只是让你更会承担选择。'
  ];

  let branch = null;
  const decision = firstClause(p.decision, '');
  const optionA = firstClause(p.optionA, '');
  const optionB = firstClause(p.optionB, '');
  if (decision && optionA && optionB) {
    branch = {
      decision: decision,
      a: {
        label: optionA,
        text: '如果走向“' + optionA + '”，你可能更早得到某些确定性，同时也需要主动保护“' + values + '”与长期项目“' + project + '”不被惯性吞掉。'
      },
      b: {
        label: optionB,
        text: '如果走向“' + optionB + '”，你可能面对更高的不确定性，但也得到重新组织职业、关系与生活节奏的机会。关键仍是用真实反馈修正，而不是把一次决定当成终局。'
      }
    };
  }

  return {
    timeline: timeline,
    lessons: lessons,
    branch: branch,
    summary: '这是 ' + clean(p.name, '你') + ' 从 ' + age + ' 岁走向 60 岁的一种可能版本。核心线索包括：' + challenge + '、' + project + '、' + career + '，以及“' + values + '”。',
    voiceAnchors: {
      values: values,
      people: people,
      challenge: challenge,
      project: project,
      career: career
    }
  };
}

function generateSequence() {
  collect();
  state.memory = buildMemory();
  state.generated = true;
  save();

  const lines = [
    '读取现在的你：' + clean(state.profile.name, '你') + '，' + clean(state.profile.age, '?') + ' 岁。',
    '找到重要关系：' + firstClause(state.profile.people, '你在意的人') + '。',
    '连接高点、低谷与转折点。',
    '加入未来挑战：' + firstClause(state.profile.challenge, '一个尚未解决的挑战') + '。',
    '加入长期项目：' + firstClause(state.profile.lifeProject, '一个值得长期投入的项目') + '。',
    state.memory.branch ? '识别到一个 A / B 决策分支，同时保留两条可能路径。' : '生成从现在到 60 岁的可能经历。',
    'Future Me 已准备好。'
  ];

  const stream = $('#memoryStream');
  stream.innerHTML = '';
  $('#meetBtn').classList.add('hidden');
  $('#generateTitle').textContent = '正在把人生线索连接起来……';
  $('#generateSub').textContent = '不是预测，而是构造一个与你的信息相连、内部尽量一致的“可能未来”。';

  lines.forEach(function (text, i) {
    setTimeout(function () {
      const item = document.createElement('div');
      item.className = 'memory-line';
      item.textContent = text;
      stream.appendChild(item);
      if (i === lines.length - 1) {
        $('#generateTitle').textContent = 'Future Me 已经带着一段未来记忆回来了。';
        $('#generateSub').textContent = '先看一眼这条可能路径，再决定你想问什么。';
        $('#meetBtn').classList.remove('hidden');
        emitSessionEvent('future_generated', { hasBranch: Boolean(state.memory.branch) });
        syncAdmin('future_generated');
      }
    }, i * 260);
  });
}

$('#meetBtn').addEventListener('click', function () { show('ready'); });

function renderFuturePortrait() {
  const frame = $('#futurePortrait');
  const image = $('#futurePortraitImg');
  const monogram = $('#futureMonogram');
  const status = $('#portraitStatus');
  const initial = (clean(state.profile.name, 'F').charAt(0) || 'F').toUpperCase();
  if (monogram) monogram.textContent = initial;

  if (state.futurePortrait) {
    frame.classList.add('has-image');
    image.src = state.futurePortrait;
    status.textContent = '未来头像 · API 结果';
  } else {
    frame.classList.remove('has-image');
    image.removeAttribute('src');
    status.textContent = state.currentPortrait ? '已收到当前照片 · 待年龄化' : '未来头像未生成';
  }
}

$('#agePortraitBtn').addEventListener('click', async function () {
  collect();
  if (!state.currentPortrait) {
    showToast('先在“现在的我”里加入一张照片');
    show('identity');
    return;
  }

  const endpoint = apiConfig('imageApi');
  if (!endpoint) {
    $('#futurePortrait').classList.add('has-image');
    $('#futurePortraitImg').src = state.currentPortrait;
    $('#portraitStatus').textContent = '当前照片占位 · 未连接年龄化 API';
    showToast('图像 API 未连接，暂用当前照片占位');
    return;
  }

  const button = $('#agePortraitBtn');
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = '正在生成…';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: state.currentPortrait,
        currentAge: Number(state.profile.age) || null,
        targetAge: 60,
        instruction: 'Preserve identity. Create a respectful, photorealistic age-progressed portrait at approximately age 60. Do not alter race, gender presentation, or core facial identity unless implied by natural aging.'
      })
    });
    if (!response.ok) throw new Error('image api ' + response.status);
    const result = await response.json();
    const imageValue = result.imageUrl || result.url || (result.imageBase64 ? 'data:image/png;base64,' + result.imageBase64 : '');
    if (!imageValue) throw new Error('missing image result');
    state.futurePortrait = imageValue;
    renderFuturePortrait();
    save();
    emitSessionEvent('future_portrait_generated', {});
    syncAdmin('future_portrait_generated');
    showToast('Future Me 头像已生成');
  } catch (e) {
    console.error(e);
    showToast('未来头像生成失败，已保留原照片');
  } finally {
    button.disabled = false;
    button.textContent = oldText;
  }
});

function renderReady() {
  if (!state.memory) state.memory = buildMemory();
  collect();

  const p = state.profile;
  const initial = (clean(p.name, 'F').charAt(0) || 'F').toUpperCase();
  $('#futureName').textContent = clean(p.name, '你');
  $('#chatName').textContent = clean(p.name, 'Future Me') + ' · 60';
  $('#chatAvatar').textContent = initial;
  $('#futureMonogram').textContent = initial;
  renderFuturePortrait();

  const timelineHtml = state.memory.timeline.map(function (x) {
    return '<div class="milestone"><b>' + escapeHtml(x.age) + ' 岁 · ' + escapeHtml(x.tag) + '</b><p>' + escapeHtml(x.text) + '</p></div>';
  }).join('');

  const lessonsHtml = state.memory.lessons.map(function (item) {
    return '<div class="lesson">' + escapeHtml(item) + '</div>';
  }).join('');

  $('#memorySummary').innerHTML =
    '<p class="future-summary">' + escapeHtml(state.memory.summary) + '</p>' +
    '<div class="timeline">' + timelineHtml + '</div>' +
    '<div class="section-kicker"><span>可能学到的几件事</span><i></i></div>' +
    '<div class="lesson-grid">' + lessonsHtml + '</div>';

  if (state.memory.branch) {
    $('#branchPreview').innerHTML =
      '<div class="branch-card">' +
      '<h3>分岔路口 · ' + escapeHtml(state.memory.branch.decision) + '</h3>' +
      '<div class="branch-options">' +
      '<div class="branch-option"><small>OPTION A · ' + escapeHtml(state.memory.branch.a.label) + '</small><p>' + escapeHtml(state.memory.branch.a.text) + '</p></div>' +
      '<div class="branch-option"><small>OPTION B · ' + escapeHtml(state.memory.branch.b.label) + '</small><p>' + escapeHtml(state.memory.branch.b.text) + '</p></div>' +
      '</div></div>';
  } else {
    $('#branchPreview').innerHTML = '';
  }

  save();
}

function ensureGreeting() {
  if (state.messages.length) return;
  const p = state.profile;
  state.messages.push({
    role: 'future',
    text: '嗨，' + clean(p.name, '年轻的我') + '。我是 60 岁的你。先说明：我不是真正发生过的未来，只是从你刚才写下的目标、关系与经历长出来的一种可能版本。\n\n如果你愿意，我们可以聊工作、家人、后悔、意外，或者你现在最难做的决定。'
  });
  save();
}

function renderMessages() {
  const box = $('#messages');
  box.innerHTML = state.messages.map(function (message) {
    const roleLabel = message.role === 'future' ? 'Future Me · 60' : '现在的我';
    return '<div class="message ' + escapeHtml(message.role) + '"><span class="meta">' + roleLabel + '</span>' + escapeHtml(message.text) + '</div>';
  }).join('');
  box.scrollTop = box.scrollHeight;
}

function startChat() {
  ensureGreeting();
  renderMessages();
  updateVoiceUI();
}

function localFutureReply(input) {
  const p = state.profile;
  const q = input.toLowerCase();
  const memory = state.memory || buildMemory();
  const anchors = memory.voiceAnchors || {};
  const values = anchors.values || firstClause(p.values, '真正重要的东西');
  const project = anchors.project || firstClause(p.lifeProject, '长期投入的事情');
  const challenge = anchors.challenge || firstClause(p.challenge, '眼前这个挑战');

  const replies = {
    happy: [
      '如果你问“幸福”是不是一直很稳定，答案是否定的。真正变化的是，我不再把幸福当成某个终点。后来最踏实的部分，反而来自' + firstClause(p.dailyLife, '普通而有节奏的日常') + '。',
      '有一些阶段我很快乐，也有一些阶段并不轻松。到 60 岁，我更珍惜的是：生活和“' + values + '”没有完全脱节。'
    ],
    career: [
      '职业没有完全照着最初的剧本走。但“' + firstClause(p.career, '想做的事') + '”一直像一根线。后来我发现，比职位更重要的是持续累积能带走的能力、关系和作品。',
      '你现在很容易把职业看成一次选对就结束。其实后来更像连续实验：做一段、复盘、换假设，再做一段。围绕“' + project + '”的投入，反而比某个头衔更稳定。'
    ],
    family: [
      '关于家人和重要的人，我最想告诉你的是：不要总等“忙完这一阵”。你曾经写下' + firstClause(p.people, '重要的人') + '，后来这些关系真正留下来的，都是一次次具体的联系。',
      '未来的家庭没有必要长成某一种模板。重要的是你有没有让关系里的人知道：他们对你重要。'
    ],
    money: [
      '钱后来更像一种选择权，而不是分数。你写下的理想状态是“' + firstClause(p.finance, '更有安全感和自主性') + '”。真正有效的是把它变成长期习惯，而不是等收入到了某个数字才开始。'
    ],
    regret: [
      '当然有后悔。有些机会错过了，有些关系处理得不够好。但最有用的后悔，不是“当初为什么没选另一条”，而是让我看清：以后遇到类似时，我想成为什么样的人。',
      '我最后没有得到一条“零后悔路径”。好消息是，大多数后悔后来都变成了信息，而不是判决。'
    ],
    challenge: [
      '你现在写下想跨过去的是“' + challenge + '”。后来真正起作用的不是某一天突然想通，而是把它拆得小到可以重复练习。你不用等自己完全不怕。',
      '关于“' + challenge + '”，未来的我没法替你保证结果。但我可以告诉你：最关键的变化通常发生在你愿意多做一次真实尝试之后。'
    ],
    fear: [
      '我记得那种不确定。后来我才懂，焦虑经常是在要求你提前拿到未来的保证。但人生很少给这种保证。我们能做的是让下一步更小、更真实、更可撤回。',
      '你不需要证明自己不会失败。你只需要让失败不再等于“我完了”。你经历过' + firstClause(p.lowPoint, '低谷') + '，那已经说明你有重新组织生活的能力。'
    ],
    surprise: [
      '最大的意外是：很多当年以为会决定一生的事，后来只是一个路口；而一些当时很小的习惯和关系，反而滚成了很大的差异。',
      '我没想到“' + firstClause(p.turningPoint, '某个转折点') + '”之后的影响会持续那么久。未来最常见的不是戏剧性反转，而是小东西慢慢复利。'
    ],
    decision: [
      memory.branch
        ? '关于“' + memory.branch.decision + '”，我不会从 60 岁假装知道 A 或 B 哪个一定更好。真正值得比较的是：哪条路更符合“' + values + '”，哪条路能更快给你真实反馈，以及哪种代价是你愿意承担的。'
        : '如果你正卡在一个选择里，不妨把它拆成三个问题：我真正重视什么？我能承受哪种代价？哪个下一步能让我获得更多真实信息？'
    ],
    hello: [
      '你好，' + clean(p.name, '年轻的我') + '。我们只是站在不同时间尺度看同一组问题。你最想先问哪一件事？'
    ],
    advice: [
      '如果只能留一句：别把未来的自己当裁判，把他当队友。今天先做一个能让明天多一点信息的小动作。',
      '先别追求“正确人生”。问一个更实用的问题：哪一个下一步既符合“' + values + '”，又能让你更了解现实？去做那个。'
    ]
  };

  let key = 'advice';
  if (/开心|幸福|快乐|happy/.test(q)) key = 'happy';
  else if (/工作|职业|事业|career|专业|学校|学习/.test(q)) key = 'career';
  else if (/家人|家庭|父母|朋友|伴侣|爱情|关系/.test(q)) key = 'family';
  else if (/钱|财务|收入|财富|money/.test(q)) key = 'money';
  else if (/后悔|遗憾|regret/.test(q)) key = 'regret';
  else if (/挑战|困难|跨过|克服/.test(q)) key = 'challenge';
  else if (/焦虑|害怕|担心|恐惧|怕/.test(q)) key = 'fear';
  else if (/意外|没想到|unexpected|惊讶/.test(q)) key = 'surprise';
  else if (/选择|决定|纠结|option|选哪/.test(q)) key = 'decision';
  else if (/你好|hi|hello|嗨/.test(q)) key = 'hello';

  const reply = pick(replies[key], input + JSON.stringify(p));
  const tail = pick([
    '如果把这个问题拉回今天，你觉得最难的是哪一小部分？',
    '你现在脑中有没有一个具体场景，让这个问题特别真实？',
    '如果明天只能试一个很小的动作，你会选什么？',
    '我更想听听你为什么现在会问这个。'
  ], input + 'tail');

  return reply + '\n\n' + tail;
}

async function getFutureReply(input) {
  const endpoint = apiConfig('chatApi');
  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: MODULE_ID,
          profile: state.profile,
          syntheticMemory: state.memory,
          messages: state.messages.filter(function (item) { return item.text !== '…'; }),
          userMessage: input,
          instruction: 'Act as one plausible 60-year-old future self grounded in the supplied biography and synthetic memory. Never claim certainty, prophecy, diagnosis, or therapeutic authority.'
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.reply) return String(result.reply);
      }
    } catch (e) {
      console.warn('Future Me chat API unavailable; using local fallback', e);
    }
  }
  await new Promise(function (resolve) { setTimeout(resolve, 280); });
  return localFutureReply(input);
}

async function speakText(text) {
  if (!text) return;
  const endpoint = apiConfig('voiceApi');

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          voice: 'future-self',
          language: 'zh-CN',
          profile: { name: state.profile.name || '', targetAge: 60 }
        })
      });
      if (response.ok) {
        const result = await response.json();
        const audioUrl = result.audioUrl || result.url || '';
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn('Future Me voice API unavailable; using browser speech', e);
    }
  }

  if (!('speechSynthesis' in window)) {
    showToast('当前浏览器不支持语音朗读');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.96;
  utterance.pitch = 0.92;
  const voices = window.speechSynthesis.getVoices();
  const zh = voices.find(function (voice) { return /zh|Chinese|Mandarin/i.test(voice.lang + ' ' + voice.name); });
  if (zh) utterance.voice = zh;
  window.speechSynthesis.speak(utterance);
}

function updateVoiceUI() {
  const active = Boolean(state.settings.voiceMode);
  const button = $('#voiceModeBtn');
  const voiceState = $('#voiceState');
  if (button) button.textContent = active ? '关闭语音模式' : '开启语音模式';
  if (voiceState) {
    voiceState.classList.toggle('active', active);
    const label = voiceState.querySelector('span');
    if (label) label.textContent = active ? '语音模式 · 自动朗读回复' : '文字模式';
  }
}

$('#voiceModeBtn').addEventListener('click', function () {
  state.settings.voiceMode = !state.settings.voiceMode;
  updateVoiceUI();
  save();
  showToast(state.settings.voiceMode ? '已开启语音模式' : '已关闭语音模式');
});

$('#speakLastBtn').addEventListener('click', function () {
  const last = state.messages.filter(function (item) { return item.role === 'future' && item.text !== '…'; }).slice(-1)[0];
  if (!last) return;
  speakText(last.text);
});

let recognition = null;
let recognitionActive = false;

function ensureRecognition() {
  if (recognition) return recognition;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return null;
  recognition = new Recognition();
  recognition.lang = 'zh-CN';
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = function () {
    recognitionActive = true;
    $('#micBtn').classList.add('listening');
    $('#voiceListening').classList.remove('hidden');
  };
  recognition.onresult = function (event) {
    let transcript = '';
    let isFinal = false;
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      transcript += event.results[i][0].transcript;
      if (event.results[i].isFinal) isFinal = true;
    }
    $('#chatInput').value = transcript;
    if (isFinal && state.settings.voiceMode && transcript.trim()) {
      setTimeout(function () { $('#chatForm').requestSubmit(); }, 120);
    }
  };
  recognition.onerror = function () {
    showToast('语音识别未成功，可以继续打字');
  };
  recognition.onend = function () {
    recognitionActive = false;
    $('#micBtn').classList.remove('listening');
    $('#voiceListening').classList.add('hidden');
  };
  return recognition;
}

$('#micBtn').addEventListener('click', function () {
  const engine = ensureRecognition();
  if (!engine) {
    showToast('当前浏览器不支持语音听写');
    return;
  }
  if (recognitionActive) {
    engine.stop();
  } else {
    try { engine.start(); } catch (e) {}
  }
});

$('#chatForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  const input = $('#chatInput');
  const text = input.value.trim();
  if (!text) return;

  state.messages.push({ role: 'user', text: text });
  input.value = '';
  renderMessages();

  const pending = { role: 'future', text: '…' };
  state.messages.push(pending);
  renderMessages();

  const reply = await getFutureReply(text);
  pending.text = reply;
  save();
  renderMessages();
  emitSessionEvent('chat_turn', { userMessage: text, replyLength: reply.length });
  syncAdmin('chat_turn');

  if (state.settings.voiceMode) speakText(reply);
});

$$('#promptChips button').forEach(function (button) {
  button.addEventListener('click', function () {
    $('#chatInput').value = button.textContent;
    $('#chatForm').requestSubmit();
  });
});

$('#finishChatBtn').addEventListener('click', function () { show('capsule'); });

function letterHtml() {
  collect();
  const p = state.profile;
  const action = clean($('#nextAction').value, '');
  const latest = state.messages.filter(function (item) { return item.role === 'user'; }).slice(-1)[0];
  const latestQuestion = latest ? firstClause(latest.text, '未来会怎样') : '未来会怎样';

  return '<h3>给未来的 ' + escapeHtml(clean(p.name, '我')) + '</h3>' +
    '<p>今天的我还在想“' + escapeHtml(latestQuestion) + '”。刚刚，我和一个 60 岁的可能版本聊了很久。它不能证明哪条路一定正确，但它让我把时间拉长了一点。</p>' +
    '<p>我希望以后还记得三件事：第一，别丢掉 <strong>' + escapeHtml(firstClause(p.values, '真正重视的东西')) + '</strong>；第二，把“' + escapeHtml(firstClause(p.challenge, '那个难题')) + '”拆成能反复练习的小动作；第三，别只照顾计划，也照顾 ' + escapeHtml(firstClause(p.people, '重要的人')) + '。</p>' +
    '<p>围绕“' + escapeHtml(firstClause(p.lifeProject, '长期投入的事情')) + '”的积累，也许会比很多短期得失更重要。城市、工作、关系可能都和现在想的不完全一样，但我希望未来的我仍然知道自己为什么出发。</p>' +
    '<p>' + (action ? '这周我先做：<strong>' + escapeHtml(action) + '</strong>。不需要更宏大。' : '我还会给这周的自己留一个小到真的能做到的行动。') + '</p>' +
    '<p>未来见。<br><strong>' + escapeHtml(clean(p.name, '现在的我')) + ' · ' + new Date().toLocaleDateString('zh-CN') + '</strong></p>';
}

function renderLetter() {
  $('#futureLetter').innerHTML = letterHtml();
}

$('#nextAction').addEventListener('input', function () {
  clearTimeout(window.__p005LetterTimer);
  window.__p005LetterTimer = setTimeout(renderLetter, 180);
});

function addMonths(baseDate, months) {
  const date = new Date(baseDate.getTime());
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + Number(months || 0));
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, last));
  return date;
}

function dateInputValue(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function setUnlockMonths(months, shouldSave) {
  state.settings.unlockMonths = Number(months) || 12;
  $$('#unlockChips button').forEach(function (button) {
    button.classList.toggle('active', Number(button.dataset.months) === state.settings.unlockMonths);
  });
  const date = addMonths(new Date(), state.settings.unlockMonths);
  $('#unlockDate').value = dateInputValue(date);
  $('#unlockDate').min = dateInputValue(new Date(Date.now() + 86400000));
  if (shouldSave !== false) save();
}

$$('#unlockChips button').forEach(function (button) {
  button.addEventListener('click', function () { setUnlockMonths(Number(button.dataset.months)); });
});

$('#unlockDate').addEventListener('change', function () {
  $$('#unlockChips button').forEach(function (button) { button.classList.remove('active'); });
});

function capsuleStatus(capsule) {
  const unlock = new Date(capsule.unlockAt);
  const now = new Date();
  if (unlock <= now) return '已解锁';
  const days = Math.ceil((unlock.getTime() - now.getTime()) / 86400000);
  if (days < 31) return '还有 ' + days + ' 天';
  const months = Math.max(1, Math.round(days / 30.44));
  return '约 ' + months + ' 个月后';
}

function renderCapsules() {
  const root = $('#savedCapsules');
  if (!root) return;
  if (!state.capsules.length) {
    root.innerHTML = '';
    return;
  }

  root.innerHTML = '<div class="section-kicker"><span>已封存</span><i></i></div>' +
    state.capsules.slice().reverse().map(function (capsule) {
      const unlocked = new Date(capsule.unlockAt) <= new Date();
      return '<button class="saved-capsule" data-capsule-id="' + escapeHtml(capsule.id) + '" ' + (unlocked ? '' : 'disabled') + '>' +
        '<span><b>' + (unlocked ? '时间胶囊已解锁' : '时间胶囊已锁定') + '</b><small>' + new Date(capsule.unlockAt).toLocaleDateString('zh-CN') + '</small></span>' +
        '<small>' + capsuleStatus(capsule) + '</small></button>';
    }).join('');

  $$('[data-capsule-id]').forEach(function (button) {
    button.addEventListener('click', function () {
      const capsule = state.capsules.find(function (item) { return item.id === button.dataset.capsuleId; });
      if (!capsule || new Date(capsule.unlockAt) > new Date()) return;
      $('#futureLetter').innerHTML = capsule.letterHtml;
      showToast('已打开这封过去写下的信');
    });
  });
}

$('#saveCapsuleBtn').addEventListener('click', function () {
  collect();
  const value = $('#unlockDate').value;
  if (!value) {
    showToast('请选择解锁日期');
    return;
  }
  const unlockAt = new Date(value + 'T09:00:00');
  if (unlockAt <= new Date()) {
    showToast('解锁日期需要在未来');
    return;
  }

  const capsule = {
    id: 'capsule_' + Date.now(),
    createdAt: new Date().toISOString(),
    unlockAt: unlockAt.toISOString(),
    action: clean($('#nextAction').value, ''),
    letterHtml: letterHtml()
  };
  state.capsules.push(capsule);
  save();
  renderCapsules();
  emitSessionEvent('capsule_saved', { unlockAt: capsule.unlockAt });
  syncAdmin('capsule_saved');
  showToast('时间胶囊已封存到当前浏览器');
});

function updateChatModeNote() {
  const note = $('#chatModeNote');
  if (!note) return;
  note.textContent = apiConfig('chatApi') ? 'LLM 后端已配置' : '本地 fallback · 可配置 LLM API';
}

load();
renderDots();
updateChatModeNote();

if (state.screen !== 'welcome' && state.screen !== 'generate') {
  const savedScreen = state.screen;
  state.screen = 'welcome';
  renderDots();
  state.screen = savedScreen;
}

emitSessionEvent('loaded', { hasSavedProfile: Boolean(Object.keys(state.profile).length) });
