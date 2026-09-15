# Remote research backend deployment boundary

The static GitHub Pages build is intentionally not the final storage layer for PCL/CAPE or other sensitive research data.

## Recommended architecture

Browser P00x module
→ authenticated/consented research ingestion endpoint
→ private Postgres event store
→ server-authenticated admin API
→ admin dashboard

Existing browser contract:
- POST /v1/events
- GET /v1/admin/events

See openapi.yaml and schema.sql.

## Provider options

The current ChatGPT plugin directory exposes backend/database integrations such as Supabase, Neon, Render and Railway. A provider can be selected later without changing the browser event schema.

For sensitive psychological data, do not connect the browser directly to an unrestricted database table.

If using Supabase:
- keep event tables non-public;
- ingest through an Edge Function or server endpoint;
- validate a consent/session token;
- use authenticated admin roles for reads;
- enable audit logging where available;
- never expose service-role keys to GitHub Pages.

## Before apiBase is enabled

Required:
- ethics approval / lawful basis
- consent wording and withdrawal behavior
- data minimization decision
- retention + deletion schedule
- admin authentication / RBAC
- transport encryption
- incident process
- server-side validation and rate limiting
- environment-specific secrets
- backup/export policy

Until those are ready, shared/config.js keeps apiBase empty and the UI explicitly labels itself local prototype mode.
