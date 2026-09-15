# Architecture

## 1. Purpose

AI-Ques is the static P00 hub for multiple psychology-informed interaction prototypes. The root route is navigation and shared-profile management; research logic lives inside module directories.

## 2. Module boundaries

- **P002** owns assessment wording, modes, scoring prototypes and its study manifest.
- **P004** owns conversation, public portrait and private research-side exploratory inference.
- **P005** owns future-self narrative, media hooks, conversation and time capsules.

No module should silently read another module's private storage.

## 3. Public shared profile

Only `shared/profile.js` may define the canonical cross-module profile key:

`bjtu.p00.profile.v1`

Allowed cross-module fields are intentionally narrow: name, age, origin, location, currentWork, values.

The adapter can migrate safe fields from older keys, but clinical inference, evidence quotes, raw conversations and media are never imported into the shared profile.

## 4. Private module data

- P004: `sessionStorage["bjtu.p004.session.v1"]` for the current tab only.
- P005: `localStorage["bjtu.p005.state.v1"]` because the product explicitly offers resume and time-capsule behavior.
- P002 currently does not persist assessment answers.

Future production backends should replace browser-only storage for sensitive research data and enforce consent, authentication, RBAC, retention and deletion policies.

## 5. Admin synchronization

Static pages may emit `p00:session` events or call explicitly configured backend endpoints. Public profile storage is not an admin database.

P004 clinical-like signals must remain admin/research-side. P005 must not reinterpret those signals as user-visible facts.

## 6. Legacy routes

`/future-me/` exists only as a redirect to `/p005/`. New code and docs must use the canonical numbered path.

## 7. Quality rules

- No prototype translation may be called a validated baseline.
- User/model free text must be escaped before HTML insertion.
- Storage behavior must be disclosed when sensitive user-authored content is retained.
- Shared public profile and private/admin inference must use different namespaces.
- Internal agent scratchpads and workflow memory should not be published as product documentation.
