(() => {
  'use strict';

  const KEY = 'bjtu.p00.runtime.v1';
  const DEFAULTS = Object.freeze({
    schema_version: 1,
    apiBase: ''
  });

  function parse(value) {
    try { return JSON.parse(value); } catch (_) { return null; }
  }

  function normalizeApiBase(value) {
    return String(value || '').trim().replace(/\/+$/, '');
  }

  function read() {
    const raw = parse(localStorage.getItem(KEY) || '') || {};
    return {
      schema_version: 1,
      apiBase: normalizeApiBase(raw.apiBase)
    };
  }

  function write(patch = {}) {
    const next = Object.assign({}, read(), patch || {});
    next.schema_version = 1;
    next.apiBase = normalizeApiBase(next.apiBase);
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  }

  function clear() {
    localStorage.removeItem(KEY);
    return { ...DEFAULTS };
  }

  globalThis.P00_RUNTIME_CONFIG = Object.freeze({
    key: KEY,
    defaults: DEFAULTS,
    read,
    write,
    clear
  });
})();