# P002 research backend contract

Status: **contract only — no production backend is deployed by this repository**

Version: 0.12 · 2026-09-17

The static prototype already records browser-local events and can flush them to a configured API base. A production implementation must satisfy this contract before `formal_data_collection_authorized` can become true.

## 1. Transport and authentication

- HTTPS only.
- Participant event ingestion must not require an administrator credential in browser code.
- Administrator read/export endpoints require authenticated, role-based access.
- Do not place service secrets or administrator tokens in GitHub Pages, localStorage, query parameters, or committed JavaScript.
- CORS must allow only intended study origins.
- Server logs must avoid unnecessary raw questionnaire payload duplication.

## 2. Event ingestion

### POST /v1/events

Accept one event object per request.

Required fields:

- `event_id`
- `participant_id`
- `session_id`
- `project_id`
- `study_version`
- `scale_id`
- `condition_id`
- `event_type`
- `timestamp`

Item-response events additionally carry:

- `item_id`
- `cluster`
- `response`
- `distress` when applicable
- `response_ms`
- optional condition-specific fields such as `frequency_response_ms` or `signal`

Requirements:

- treat `event_id` as an idempotency key;
- reject unsupported `project_id`, `study_version`, `scale_id`, or `condition_id`;
- preserve source response codes exactly;
- timestamp server receipt separately from the client timestamp;
- return a 2xx response only after durable acceptance.

## 3. Administrator access

### GET /v1/admin/events

Production-only authenticated endpoint for filtered research export.

Minimum filters:

- `project_id`
- `study_version`
- `participant_id`
- `session_id`
- `scale_id`
- `condition_id`
- time range

The service should support paginated JSON and a separate audited export job for large CSV/JSON exports.

### GET /v1/admin/sessions

Returns session-level metadata and completion/interruption status without requiring the administrator to reconstruct sessions from raw events.

## 4. Withdrawal and deletion

A formal study needs a documented way to honor withdrawal / deletion requests. The concrete route may vary by backend, but the implementation must support deletion or irreversible de-identification by the study's participant lookup method and record the action in an audit log.

## 5. Retention and audit

Production deployment must define:

- retention period;
- deletion schedule;
- backup retention;
- administrator roles;
- access audit log;
- incident response owner;
- data controller / research owner;
- ethics / consent version attached to each session.

## 6. Current prototype behavior

- `shared/config.js` stores only a non-secret `apiBase`.
- `shared/core.js` queues unsent events under `bjtu.p00.pending-sync.v1`.
- P002 administrator UI may configure `apiBase` and manually retry pending events.
- P002 participants and administrators can clear P002-local sessions/events/pending events from the browser.
- The stable browser-local `participant_id` is intentionally not deleted by a P002-only clear action because it is shared across P00 modules.

This contract prepares the client boundary; it does **not** claim that cross-device synchronization, authentication, or compliant production storage already exists.
