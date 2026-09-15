(() => {
  'use strict';

  const cfg = window.P004_CONFIG || {};
  const base = String(cfg.apiBase || '').replace(/\/$/, '');

  async function post(path, payload) {
    if (!base) return null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(cfg.timeoutMs || 12000));
    try {
      const response = await fetch(`${base}${path}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`P004 API ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  window.P004_API = {
    enabled: Boolean(base),
    async chat(payload) {
      return post(cfg.chatPath || '/api/p004/chat', payload);
    },
    async adminSnapshot(payload) {
      return post(cfg.adminPath || '/api/p004/admin/snapshot', payload);
    }
  };
})();
