import crypto from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;
const now = () => new Date().toISOString();
const clone = (value) => JSON.parse(JSON.stringify(value ?? null));
const hashToken = (value) => crypto.createHash('sha256').update(String(value || '')).digest('hex');
const randomId = (prefix) => prefix + crypto.randomUUID().replaceAll('-', '');
const randomToken = () => crypto.randomBytes(32).toString('base64url');

export class MemoryStore {
  constructor() {
    this.participants = new Map();
    this.sessions = new Map();
    this.events = [];
  }
  async init() { return this; }
  async health() { return { ok: true, backend: 'memory' }; }
  async createSession({ externalParticipantId = '', studyId = 'p005', condition = '', protocol, consent, client = {} }) {
    let participant = [...this.participants.values()].find((p) => p.studyId === studyId && externalParticipantId && p.externalId === externalParticipantId);
    if (!participant) {
      participant = { id: randomId('p_'), externalId: externalParticipantId || '', studyId, createdAt: now() };
      this.participants.set(participant.id, participant);
    }
    const resumeToken = randomToken();
    const session = {
      id: randomId('s_'),
      participantId: participant.id,
      externalParticipantId: participant.externalId,
      studyId,
      condition,
      protocolVersion: protocol.protocolVersion,
      protocol: clone(protocol),
      consentVersion: protocol.consentVersion,
      consent: clone(consent),
      resumeTokenHash: hashToken(resumeToken),
      status: 'active',
      currentState: null,
      client: clone(client),
      createdAt: now(),
      updatedAt: now(),
      completedAt: null
    };
    this.sessions.set(session.id, session);
    return { participant: clone(participant), session: this.publicSession(session), resumeToken };
  }
  publicSession(session) {
    const { resumeTokenHash, ...safe } = session;
    return clone(safe);
  }
  async requireSession(id, token) {
    const session = this.sessions.get(id);
    if (!session || !token || session.resumeTokenHash !== hashToken(token)) return null;
    return session;
  }
  async getSession(id, token) {
    const session = await this.requireSession(id, token);
    return session ? this.publicSession(session) : null;
  }
  async updateConsent(id, token, consent) {
    const session = await this.requireSession(id, token);
    if (!session) return null;
    session.consent = clone(consent);
    session.updatedAt = now();
    return this.publicSession(session);
  }
  async recordEvent(id, token, { type, payload = {}, snapshot = null, occurredAt = now() }) {
    const session = await this.requireSession(id, token);
    if (!session) return null;
    const event = {
      id: this.events.length + 1,
      sessionId: id,
      type: String(type || 'event'),
      payload: clone(payload),
      snapshot: snapshot ? clone(snapshot) : null,
      createdAt: occurredAt
    };
    this.events.push(event);
    session.updatedAt = now();
    if (snapshot) session.currentState = clone(snapshot);
    if (type === 'chat_ended' || type === 'session_completed') {
      session.status = 'completed';
      session.completedAt = now();
    }
    return clone(event);
  }
  async listSessions({ limit = 100 } = {}) {
    return [...this.sessions.values()]
      .sort((a,b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map((s) => ({ ...this.publicSession(s), eventCount: this.events.filter((e) => e.sessionId === s.id).length }));
  }
  async adminSession(id) {
    const session = this.sessions.get(id);
    if (!session) return null;
    return {
      session: this.publicSession(session),
      events: clone(this.events.filter((e) => e.sessionId === id))
    };
  }
  async deleteSession(id, token) {
    const session = await this.requireSession(id, token);
    if (!session) return false;
    this.sessions.delete(id);
    this.events = this.events.filter((e) => e.sessionId !== id);
    return true;
  }
}

export class PostgresStore {
  constructor(connectionString) {
    this.pool = new Pool({
      connectionString,
      max: Number(process.env.DB_POOL_MAX || 8),
      ssl: process.env.DATABASE_SSL === 'require' ? { rejectUnauthorized: false } : undefined
    });
  }
  async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS p005_participants (
        id TEXT PRIMARY KEY,
        external_id TEXT NOT NULL DEFAULT '',
        study_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS p005_participants_study_external_idx
        ON p005_participants(study_id, external_id);

      CREATE TABLE IF NOT EXISTS p005_sessions (
        id TEXT PRIMARY KEY,
        participant_id TEXT NOT NULL REFERENCES p005_participants(id),
        study_id TEXT NOT NULL,
        condition TEXT NOT NULL DEFAULT '',
        protocol_version TEXT NOT NULL,
        protocol_json JSONB NOT NULL,
        consent_version TEXT NOT NULL,
        consent_json JSONB NOT NULL,
        resume_token_hash TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        current_state JSONB,
        client_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS p005_sessions_created_idx ON p005_sessions(created_at DESC);
      CREATE INDEX IF NOT EXISTS p005_sessions_participant_idx ON p005_sessions(participant_id);

      CREATE TABLE IF NOT EXISTS p005_events (
        id BIGSERIAL PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES p005_sessions(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        snapshot_json JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS p005_events_session_idx ON p005_events(session_id, created_at);
    `);
    return this;
  }
  async health() {
    await this.pool.query('SELECT 1');
    return { ok: true, backend: 'postgres' };
  }
  async createSession({ externalParticipantId = '', studyId = 'p005', condition = '', protocol, consent, client = {} }) {
    const db = await this.pool.connect();
    try {
      await db.query('BEGIN');
      let participant;
      if (externalParticipantId) {
        const found = await db.query(
          'SELECT * FROM p005_participants WHERE study_id=$1 AND external_id=$2 ORDER BY created_at ASC LIMIT 1',
          [studyId, externalParticipantId]
        );
        participant = found.rows[0];
      }
      if (!participant) {
        const id = randomId('p_');
        const created = await db.query(
          'INSERT INTO p005_participants(id,external_id,study_id) VALUES($1,$2,$3) RETURNING *',
          [id, externalParticipantId || '', studyId]
        );
        participant = created.rows[0];
      }
      const sessionId = randomId('s_');
      const resumeToken = randomToken();
      const created = await db.query(
        `INSERT INTO p005_sessions(
          id,participant_id,study_id,condition,protocol_version,protocol_json,
          consent_version,consent_json,resume_token_hash,client_json
        ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [
          sessionId, participant.id, studyId, condition || '',
          protocol.protocolVersion, protocol, protocol.consentVersion, consent,
          hashToken(resumeToken), client || {}
        ]
      );
      await db.query('COMMIT');
      return {
        participant: this.mapParticipant(participant),
        session: this.mapSession(created.rows[0]),
        resumeToken
      };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      db.release();
    }
  }
  mapParticipant(row) {
    return {
      id: row.id,
      externalId: row.external_id,
      studyId: row.study_id,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
    };
  }
  mapSession(row) {
    return {
      id: row.id,
      participantId: row.participant_id,
      studyId: row.study_id,
      condition: row.condition,
      protocolVersion: row.protocol_version,
      protocol: row.protocol_json,
      consentVersion: row.consent_version,
      consent: row.consent_json,
      status: row.status,
      currentState: row.current_state,
      client: row.client_json,
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
      completedAt: row.completed_at instanceof Date ? row.completed_at.toISOString() : row.completed_at
    };
  }
  async requireSession(id, token) {
    if (!id || !token) return null;
    const result = await this.pool.query(
      'SELECT * FROM p005_sessions WHERE id=$1 AND resume_token_hash=$2 LIMIT 1',
      [id, hashToken(token)]
    );
    return result.rows[0] || null;
  }
  async getSession(id, token) {
    const row = await this.requireSession(id, token);
    return row ? this.mapSession(row) : null;
  }
  async updateConsent(id, token, consent) {
    const row = await this.requireSession(id, token);
    if (!row) return null;
    const updated = await this.pool.query(
      'UPDATE p005_sessions SET consent_json=$2, updated_at=NOW() WHERE id=$1 RETURNING *',
      [id, consent || {}]
    );
    return this.mapSession(updated.rows[0]);
  }
  async recordEvent(id, token, { type, payload = {}, snapshot = null, occurredAt = now() }) {
    const row = await this.requireSession(id, token);
    if (!row) return null;
    const db = await this.pool.connect();
    try {
      await db.query('BEGIN');
      const event = await db.query(
        'INSERT INTO p005_events(session_id,type,payload_json,snapshot_json,created_at) VALUES($1,$2,$3,$4,$5) RETURNING *',
        [id, String(type || 'event'), payload || {}, snapshot, occurredAt]
      );
      const complete = type === 'chat_ended' || type === 'session_completed';
      await db.query(
        `UPDATE p005_sessions
         SET current_state=COALESCE($2,current_state), updated_at=NOW(),
             status=CASE WHEN $3 THEN 'completed' ELSE status END,
             completed_at=CASE WHEN $3 THEN COALESCE(completed_at,NOW()) ELSE completed_at END
         WHERE id=$1`,
        [id, snapshot, complete]
      );
      await db.query('COMMIT');
      const e = event.rows[0];
      return {
        id: e.id,
        sessionId: e.session_id,
        type: e.type,
        payload: e.payload_json,
        snapshot: e.snapshot_json,
        createdAt: e.created_at instanceof Date ? e.created_at.toISOString() : e.created_at
      };
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      db.release();
    }
  }
  async listSessions({ limit = 100 } = {}) {
    const result = await this.pool.query(
      `SELECT s.*, COUNT(e.id)::int AS event_count
       FROM p005_sessions s
       LEFT JOIN p005_events e ON e.session_id=s.id
       GROUP BY s.id
       ORDER BY s.created_at DESC
       LIMIT $1`,
      [Math.min(Math.max(Number(limit)||100,1),1000)]
    );
    return result.rows.map((row) => ({ ...this.mapSession(row), eventCount: row.event_count }));
  }
  async adminSession(id) {
    const sessionResult = await this.pool.query('SELECT * FROM p005_sessions WHERE id=$1 LIMIT 1',[id]);
    if (!sessionResult.rows[0]) return null;
    const eventsResult = await this.pool.query(
      'SELECT * FROM p005_events WHERE session_id=$1 ORDER BY created_at ASC,id ASC',
      [id]
    );
    return {
      session: this.mapSession(sessionResult.rows[0]),
      events: eventsResult.rows.map((e) => ({
        id: e.id,
        sessionId: e.session_id,
        type: e.type,
        payload: e.payload_json,
        snapshot: e.snapshot_json,
        createdAt: e.created_at instanceof Date ? e.created_at.toISOString() : e.created_at
      }))
    };
  }
  async deleteSession(id, token) {
    const row = await this.requireSession(id, token);
    if (!row) return false;
    const result = await this.pool.query('DELETE FROM p005_sessions WHERE id=$1',[id]);
    return result.rowCount > 0;
  }
}

export async function createStore(env = process.env) {
  if (env.DATABASE_URL) return await new PostgresStore(env.DATABASE_URL).init();
  if (env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required in production; refusing ephemeral research storage.');
  }
  return await new MemoryStore().init();
}
