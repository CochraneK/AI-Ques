# Global participant + data architecture

## Goal

All P00x projects share one participant profile and one event pipeline.

### One-time profile
Stored under `aiques_global_profile_v1` on the common origin:
- participant_id
- name
- age
- origin
- location
- currentWork

P001, P002, P003... should **read** this profile instead of asking again.

### Session
Every project run gets a new session:
- session_id
- participant_id
- project_id
- project_version
- started_at

### Unified event
Every meaningful action can be represented as:
- event_id
- occurred_at
- participant_id
- project_id
- session_id
- event_type
- payload

Recommended event types:
- session_started
- item_response
- task_completed
- session_completed
- profile_saved

## Synchronization

`shared/core.js` always writes an event to a local event store first and also queues it for remote sync.

When `window.AIQUES_CONFIG.apiBase` is configured, queued events are POSTed to:

`POST /v1/events`

Admin reads:

`GET /v1/admin/events`

The admin endpoint must require server-side authentication. Do not put administrator secrets in GitHub Pages JavaScript.

Until an approved backend exists, the admin page explicitly runs in local prototype mode and cannot claim cross-device synchronization.

## P001 migration

Do not add another identity form.

1. Load `../shared/config.js` and `../shared/core.js`.
2. On entry, call `AIQ.ensureProfile({ portalUrl: "../portal/" })`.
3. Populate P001 identity fields from `AIQ.getProfile()`.
4. Make repeated identity fields read-only or remove the identity screen.
5. Create a P001 session with `AIQ.startSession("P001", version)`.
6. Emit task / final data through `AIQ.recordEvent` and `AIQ.completeSession`.
7. Keep the P001 project-specific local draft only for unfinished-task recovery.

## P002 migration

P002 is connected on the P002 branch:
- participant_id comes from the global profile;
- each run creates a P002 session;
- each item response can be synchronized;
- the final summary is synchronized as session_completed.

## Privacy / production gate

Before enabling remote sync:
- ethics approval and consent text
- data minimization review
- TLS endpoint
- authenticated admin access
- server-side authorization
- retention / deletion policy
- audit logging
- incident handling
- export schema freeze
