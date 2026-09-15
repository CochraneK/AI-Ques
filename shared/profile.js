(() => {
  'use strict';

  const KEY = 'bjtu.p00.profile.v1';
  const LEGACY_KEYS = [
    'bjtu_p00_profile_v1',
    'bjtu_profile_v1',
    'aiques_shared_profile_v1',
    'aiques.global.profile.v1'
  ];

  const FIELD_MAP = {
    name: ['name', 'nickname', 'displayName', 'userName'],
    age: ['age'],
    origin: ['origin', 'hometown'],
    location: ['location', 'city', 'currentCity'],
    currentWork: ['currentWork', 'occupation', 'currentRole'],
    values: ['values', 'coreValues']
  };

  const empty = () => ({
    schemaVersion: 1,
    participant: {
      name: '',
      age: '',
      origin: '',
      location: '',
      currentWork: ''
    },
    self: {
      values: ''
    },
    meta: {
      updatedAt: null,
      updatedBy: null
    }
  });

  function parse(value) {
    try { return JSON.parse(value); } catch (_) { return null; }
  }

  function firstNonEmpty(source, aliases) {
    for (const key of aliases) {
      const value = source && source[key];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return String(value).trim();
      }
    }
    return '';
  }

  function flatten(profile) {
    const p = profile || empty();
    return {
      name: p.participant?.name || '',
      age: p.participant?.age || '',
      origin: p.participant?.origin || '',
      location: p.participant?.location || '',
      currentWork: p.participant?.currentWork || '',
      values: p.self?.values || ''
    };
  }

  function normalizeCandidate(raw) {
    if (!raw || typeof raw !== 'object') return {};
    const source = raw.profile && typeof raw.profile === 'object' ? raw.profile : raw;
    const participant = source.participant && typeof source.participant === 'object'
      ? source.participant
      : source;
    const self = source.self && typeof source.self === 'object' ? source.self : source;

    return {
      name: firstNonEmpty(participant, FIELD_MAP.name),
      age: firstNonEmpty(participant, FIELD_MAP.age),
      origin: firstNonEmpty(participant, FIELD_MAP.origin),
      location: firstNonEmpty(participant, FIELD_MAP.location),
      currentWork: firstNonEmpty(participant, FIELD_MAP.currentWork),
      values: firstNonEmpty(self, FIELD_MAP.values)
    };
  }

  function applyFlat(target, flat) {
    if (!flat) return target;
    for (const key of ['name', 'age', 'origin', 'location', 'currentWork']) {
      if (flat[key]) target.participant[key] = String(flat[key]).trim();
    }
    if (flat.values) target.self.values = String(flat.values).trim();
    return target;
  }

  function readCanonical() {
    const raw = parse(localStorage.getItem(KEY) || '');
    if (!raw || typeof raw !== 'object') return empty();
    const next = empty();
    applyFlat(next, normalizeCandidate(raw));
    next.meta = {
      updatedAt: raw.meta?.updatedAt || null,
      updatedBy: raw.meta?.updatedBy || null
    };
    return next;
  }

  function migrateLegacy() {
    const current = readCanonical();
    const before = JSON.stringify(flatten(current));

    for (const key of LEGACY_KEYS) {
      const raw = parse(localStorage.getItem(key) || '');
      if (!raw) continue;
      const candidate = normalizeCandidate(raw);
      const existing = flatten(current);
      const missingOnly = {};
      for (const field of Object.keys(existing)) {
        if (!existing[field] && candidate[field]) missingOnly[field] = candidate[field];
      }
      applyFlat(current, missingOnly);
    }

    const changed = JSON.stringify(flatten(current)) !== before;
    if (changed) {
      current.meta.updatedAt = new Date().toISOString();
      current.meta.updatedBy = 'legacy-migration';
      localStorage.setItem(KEY, JSON.stringify(current));
    }
    return current;
  }

  function read() {
    return migrateLegacy();
  }

  function update(patch, source = 'unknown') {
    const current = readCanonical();
    const flat = normalizeCandidate(patch || {});
    applyFlat(current, flat);
    current.meta.updatedAt = new Date().toISOString();
    current.meta.updatedBy = source;
    localStorage.setItem(KEY, JSON.stringify(current));

    const detail = { source, profile: flatten(current), canonical: current };
    window.dispatchEvent(new CustomEvent('bjtu:profile-changed', { detail }));
    window.P00_CONTEXT = Object.assign({}, window.P00_CONTEXT || {}, { profile: detail.profile });
    return detail.profile;
  }

  function clear() {
    localStorage.removeItem(KEY);
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
    window.P00_CONTEXT = Object.assign({}, window.P00_CONTEXT || {}, { profile: flatten(empty()) });
    window.dispatchEvent(new CustomEvent('bjtu:profile-changed', {
      detail: { source: 'clear', profile: flatten(empty()), canonical: empty() }
    }));
  }

  function getFlat() {
    return flatten(read());
  }

  const initial = getFlat();
  window.P00_CONTEXT = Object.assign({}, window.P00_CONTEXT || {}, { profile: initial });
  window.BJTU_PROFILE = Object.freeze({
    key: KEY,
    legacyKeys: [...LEGACY_KEYS],
    read,
    getFlat,
    update,
    clear
  });
})();