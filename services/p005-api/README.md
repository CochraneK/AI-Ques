# P005 Production API

Production service for P005 Future Me.

## What this service owns

- participant/session identity;
- frozen protocol + consent version;
- resumable server-side state;
- event log;
- research admin list/detail/CSV export;
- participant deletion;
- server-side model gateway for chat, Future Memory, image edit, TTS and STT.

## Production invariant

`NODE_ENV=production` without `DATABASE_URL` **fails at startup**. Formal research data must never silently fall back to process memory.

## API

Public:
- `GET /health`
- `GET /api/v1/protocol`
- `POST /api/v1/sessions`

Participant-authenticated:
- `GET /api/v1/sessions/:id`
- `POST /api/v1/sessions/:id/events`
- `DELETE /api/v1/sessions/:id`
- `POST /api/v1/ai/chat`
- `POST /api/v1/ai/memory`
- `POST /api/v1/ai/image`
- `POST /api/v1/ai/tts`
- `POST /api/v1/ai/transcribe`

Admin-authenticated:
- `GET /api/v1/admin/sessions`
- `GET /api/v1/admin/sessions/:id`
- `GET /api/v1/admin/export.csv`

Participant calls use:

```
Authorization: Bearer <resumeToken>
X-Session-Id: <sessionId>
```

Admin calls use:

```
X-Admin-Token: <ADMIN_TOKEN>
```

## Database

PostgreSQL tables are created automatically:

- `p005_participants`
- `p005_sessions`
- `p005_events`

The resume token is stored only as SHA-256, never in plaintext.

## Model provider

The server expects an OpenAI-compatible provider and keeps the provider API key server-side.

Each modality is independently optional:
- `CHAT_MODEL`
- `MEMORY_MODEL`
- `IMAGE_MODEL`
- `TTS_MODEL`
- `STT_MODEL`

A missing model returns HTTP 503 for that capability instead of pretending it is configured.
