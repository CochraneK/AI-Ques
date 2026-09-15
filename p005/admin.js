(() => {
  'use strict';

  const KEY = 'bjtu.p005.admin.v1';
  const allowedHorizons = ['1y','2y','3y','4y','10y','age60'];
  const allowedProtocols = ['guided','replication'];
  const allowedVoices = ['marin','cedar','coral','verse'];

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch (_) { return {}; }
  }

  function select(name, value) {
    const input = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (input) input.checked = true;
  }

  const current = read();
  const runtime = window.P005_FUTURE_ME_CONFIG || {};
  select('targetHorizon', allowedHorizons.includes(current.targetHorizon)
    ? current.targetHorizon
    : (allowedHorizons.includes(runtime.targetHorizon) ? runtime.targetHorizon : '4y'));
  select('intakeProtocol', allowedProtocols.includes(current.intakeProtocol)
    ? current.intakeProtocol
    : (allowedProtocols.includes(runtime.intakeProtocol) ? runtime.intakeProtocol : 'guided'));
  select('voiceId', allowedVoices.includes(current.voiceId)
    ? current.voiceId
    : (allowedVoices.includes(runtime.voiceId) ? runtime.voiceId : 'marin'));

  document.getElementById('horizonForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const targetHorizon = form.get('targetHorizon');
    const intakeProtocol = form.get('intakeProtocol');
    const voiceId = form.get('voiceId');
    if (!allowedHorizons.includes(targetHorizon) || !allowedProtocols.includes(intakeProtocol) || !allowedVoices.includes(voiceId)) return;

    const next = Object.assign({}, read(), {
      targetHorizon,
      intakeProtocol,
      voiceId,
      updatedAt: new Date().toISOString()
    });
    localStorage.setItem(KEY, JSON.stringify(next));
    const button = event.currentTarget.querySelector('button[type="submit"]');
    button.textContent = '已保存';
    setTimeout(() => button.textContent = '保存', 1200);
  });

  const endpoint = runtime.adminApi || window.P00_ADMIN_API || '';
  document.getElementById('adminApiState').textContent = endpoint
    ? 'Admin API：已配置'
    : 'Admin API：未配置。当前填写内容只保存在用户浏览器，管理员不会自动收到。';

  const voiceBits = [
    runtime.voiceApi ? 'TTS 已配置' : 'TTS 未配置',
    runtime.transcribeApi ? '语音转文字已配置' : '语音转文字未配置',
    runtime.realtimeSessionApi ? 'Realtime 会话入口已配置' : 'Realtime 未配置'
  ];
  document.getElementById('voiceApiState').textContent = '语音模块：' + voiceBits.join(' · ');
})();