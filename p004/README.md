# P004 · Conversational Portrait

P004 is a **conversation-first psychological portrait prototype** for AI-Ques.

## Product rule

The public experience must feel like ordinary conversation, not a disguised questionnaire.

- User side: only playful, neutral or strengths-oriented portrait language.
- Admin/research side: exploratory Big Five / MBTI-like / PHQ-like / GAD-like / PCL-like / CAPE-like signals with evidence, coverage and evidence strength.
- Clinical-style outputs are **not standardized questionnaire scores** and must not be presented as diagnoses.
- Safety escalation is separate from the normal portrait layer.

## Prototype architecture

```text
Conversation UI
  ├─ local demo conversation controller
  ├─ public portrait renderer
  └─ safety interrupt
        ↓
Observer layer
  ├─ trait cues
  ├─ symptom-domain cues
  ├─ evidence ledger
  └─ uncertainty / coverage
        ↓
Public profile adapter
  └─ ../shared/profile.js → localStorage: bjtu.p00.profile.v1

P004 private research snapshot
  └─ sessionStorage: bjtu.p004.session.v1
```

The static GitHub Pages build intentionally does **not** accept a raw model API key in the browser. P004 no longer stores clinical-style inference in the public shared profile. The local demo keeps its private research snapshot in sessionStorage and clears it when the tab is closed or the user selects “清除本次画像”. Production deployment should call a backend proxy (for example `/api/p004/chat`, `/api/p004/observe`, `/api/p004/safety`) so credentials and admin-only inference never reach the client.

## Admin demo

The admin control is shown only when the page is opened with `?admin=1`.

This is only a **demo gate**, not a security boundary. Production requires server-side authentication, RBAC, audit logging and data minimization.

## Research boundary

P004 currently demonstrates interaction and data architecture only. It does not establish validity, diagnostic accuracy, cutoffs, equivalence with PHQ/GAD/PCL/CAPE, or suitability for clinical screening.

## Backend API contract

Define `window.P004_CONFIG = { apiBase: "https://your-backend.example" }` before `api-client.js` to enable the live conversation backend. The client calls:

- `POST /api/p004/chat` with `sessionId`, role/text messages and the current public portrait; expects `{ "reply": "..." }`.
- `POST /api/p004/admin/snapshot` is reserved for an authenticated admin portal. The public client does not call it automatically.

Keep provider API keys on the server. Do not inject OpenAI/Anthropic/Gemini keys into the GitHub Pages build.
