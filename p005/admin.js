(() => {
  'use strict';

  const KEY = 'bjtu.p005.admin.v1';
  const allowed = ['1y','2y','3y','4y','10y','age60'];

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch (_) { return {}; }
  }

  const current = read();
  const runtime = window.P005_FUTURE_ME_CONFIG || {};
  const target = allowed.includes(current.targetHorizon)
    ? current.targetHorizon
    : (allowed.includes(runtime.targetHorizon) ? runtime.targetHorizon : '4y');

  const input = document.querySelector('input[name="targetHorizon"][value="' + target + '"]');
  if (input) input.checked = true;

  document.getElementById('horizonForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = new FormData(event.currentTarget).get('targetHorizon');
    if (!allowed.includes(selected)) return;
    const next = Object.assign({}, read(), {
      targetHorizon: selected,
      updatedAt: new Date().toISOString()
    });
    localStorage.setItem(KEY, JSON.stringify(next));
    event.currentTarget.querySelector('button').textContent = '已保存';
    setTimeout(() => event.currentTarget.querySelector('button').textContent = '保存', 1200);
  });

  const endpoint = runtime.adminApi || window.P00_ADMIN_API || '';
  document.getElementById('adminApiState').textContent = endpoint
    ? 'Admin API：已配置'
    : 'Admin API：未配置。当前填写内容只保存在用户浏览器，管理员不会自动收到。';
})();