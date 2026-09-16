(() => {
  'use strict';

  const KEYS = Object.freeze({
    participant: 'bjtu.p00.participant.v1',
    sessions: 'bjtu.p00.sessions.v1',
    events: 'bjtu.p00.events.v1',
    pending: 'bjtu.p00.pending-sync.v1'
  });

  function parse(value, fallback) {
    try {
      const parsed = JSON.parse(value);
      return parsed ?? fallback;
    } catch (_) {
      return fallback;
    }
  }

  function readList(key) {
    const value = parse(localStorage.getItem(key) || '', []);
    return Array.isArray(value) ? value : [];
  }

  function writeList(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function id(prefix) {
    const uuid = globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : [Date.now().toString(36), Math.random().toString(36).slice(2, 10)].join('-');
    return prefix + '_' + uuid;
  }

  function ensureParticipant() {
    const existing = parse(localStorage.getItem(KEYS.participant) || '', null);
    if (existing && existing.participant_id) return existing;
    const created = {
      schema_version: 1,
      participant_id: id('pt'),
      created_at: new Date().toISOString()
    };
    localStorage.setItem(KEYS.participant, JSON.stringify(created));
    return created;
  }

  function participantId() {
    return ensureParticipant().participant_id;
  }

  function createSession(meta = {}) {
    const session = {
      schema_version: 1,
      participant_id: participantId(),
      session_id: id('ss'),
      project_id: String(meta.project_id || ''),
      study_version: String(meta.study_version || ''),
      scale_id: meta.scale_id == null ? null : String(meta.scale_id),
      condition_id: meta.condition_id == null ? null : String(meta.condition_id),
      started_at: new Date().toISOString(),
      ended_at: null,
      status: 'active'
    };
    const sessions = readList(KEYS.sessions);
    sessions.push(session);
    writeList(KEYS.sessions, sessions);
    return session;
  }

  function completeSession(sessionId, status = 'completed') {
    if (!sessionId) return null;
    const sessions = readList(KEYS.sessions);
    const index = sessions.findIndex(x => x && x.session_id === sessionId);
    if (index < 0) return null;
    sessions[index] = Object.assign({}, sessions[index], {
      status,
      ended_at: new Date().toISOString()
    });
    writeList(KEYS.sessions, sessions);
    return sessions[index];
  }

  function appendEvent(event = {}) {
    const normalized = Object.assign({
      schema_version: 1,
      event_id: id('ev'),
      participant_id: participantId(),
      session_id: null,
      project_id: null,
      study_version: null,
      scale_id: null,
      condition_id: null,
      event_type: null,
      item_id: null,
      cluster: null,
      response: null,
      distress: null,
      response_ms: null,
      timestamp: new Date().toISOString()
    }, event || {});

    const events = readList(KEYS.events);
    events.push(normalized);
    writeList(KEYS.events, events);

    const pending = readList(KEYS.pending);
    pending.push(normalized);
    writeList(KEYS.pending, pending);
    return normalized;
  }

  function listSessions(projectId = null) {
    const rows = readList(KEYS.sessions);
    return projectId ? rows.filter(x => x && x.project_id === projectId) : rows;
  }

  function listEvents(projectId = null) {
    const rows = readList(KEYS.events);
    return projectId ? rows.filter(x => x && x.project_id === projectId) : rows;
  }

  function pendingCount(projectId = null) {
    const rows = readList(KEYS.pending);
    return projectId ? rows.filter(x => x && x.project_id === projectId).length : rows.length;
  }

  function clearProjectData(projectId) {
    if (!projectId) throw new Error('projectId is required');
    const sessions = readList(KEYS.sessions);
    const events = readList(KEYS.events);
    const pending = readList(KEYS.pending);
    const nextSessions = sessions.filter(x => !x || x.project_id !== projectId);
    const nextEvents = events.filter(x => !x || x.project_id !== projectId);
    const nextPending = pending.filter(x => !x || x.project_id !== projectId);
    writeList(KEYS.sessions, nextSessions);
    writeList(KEYS.events, nextEvents);
    writeList(KEYS.pending, nextPending);
    return {
      project_id: projectId,
      removed_sessions: sessions.length - nextSessions.length,
      removed_events: events.length - nextEvents.length,
      removed_pending: pending.length - nextPending.length
    };
  }

  async function flushPending() {
    const config = globalThis.P00_RUNTIME_CONFIG?.read?.() || { apiBase: '' };
    const apiBase = String(config.apiBase || '').replace(/\/+$/, '');
    const pending = readList(KEYS.pending);
    if (!apiBase || !pending.length || typeof fetch !== 'function') {
      return { synced: 0, pending: pending.length, skipped: true };
    }

    const remaining = [];
    let synced = 0;
    for (const event of pending) {
      try {
        const response = await fetch(apiBase + '/v1/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        synced += 1;
      } catch (_) {
        remaining.push(event);
      }
    }
    writeList(KEYS.pending, remaining);
    return { synced, pending: remaining.length, skipped: false };
  }

  globalThis.P00_RESEARCH = Object.freeze({
    keys: KEYS,
    ensureParticipant,
    participantId,
    createSession,
    completeSession,
    appendEvent,
    listSessions,
    listEvents,
    pendingCount,
    clearProjectData,
    flushPending
  });
})();