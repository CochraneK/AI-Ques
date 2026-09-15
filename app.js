(() => {
  'use strict';

  const form = document.getElementById('profileForm');
  const badge = document.getElementById('profileBadge');
  const toast = document.getElementById('toast');

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.__hubToast);
    window.__hubToast = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function fill() {
    const profile = window.BJTU_PROFILE?.getFlat?.() || {};
    for (const [key, value] of Object.entries(profile)) {
      const field = form.elements.namedItem(key);
      if (field) field.value = value || '';
    }
    const hasAny = Object.values(profile).some(Boolean);
    badge.textContent = hasAny ? '已连接' : '未填写';
    badge.classList.toggle('ready', hasAny);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    window.BJTU_PROFILE?.update?.(data, 'P00-HUB');
    fill();
    showToast('公共资料已保存');
  });

  document.getElementById('clearProfileBtn').addEventListener('click', () => {
    if (!confirm('清除浏览器中的公共资料和旧版共享 profile？各模块自己的私有数据不会一起删除。')) return;
    window.BJTU_PROFILE?.clear?.();
    form.reset();
    fill();
    showToast('公共资料已清除');
  });

  window.addEventListener('bjtu:profile-changed', fill);
  fill();
})();