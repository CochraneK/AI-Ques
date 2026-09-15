# Architecture

## 1. Purpose

AI-Ques is the static P00 hub for multiple psychology-informed interaction prototypes. The root route is navigation and shared-profile management; research logic lives inside module directories.

## 2. Module boundaries

- **P002** owns assessment wording, modes, scoring prototypes and its study manifest.
- **P004** owns Character Cards, NPC conversation, optional NVWA Skill artifacts, relationship memory and private research-side longitudinal inference.
- **P005** owns future-self narrative, media hooks, conversation and time capsules.

Modules should not silently read another module's private storage. P004 is the explicit cross-module Observer exception: its UI discloses that user-authored P005 / Future You open responses may contribute to the same research evidence pool. Production must move this aggregation behind consent-aware authenticated APIs.

## 3. Public shared profile

Only `shared/profile.js` may define the canonical cross-module profile key:

`bjtu.p00.profile.v1`

Allowed cross-module fields are intentionally narrow: name, age, origin, location, currentWork, values.

The adapter can migrate safe fields from older keys, but clinical inference, evidence quotes, raw conversations and media are never imported into the shared profile.

## 4. Private module data

- P004 Character Cards / threads / relationship memory: module-scoped `localStorage` in the static prototype.
- P004 distilled Skill artifacts: IndexedDB `bjtu-p004-skill-vault`, with explicit `SKILL.md` export.
- P004 Observer evidence: `localStorage["bjtu.p004.observer.v2"]` in the prototype only; production must use protected server-side storage with RBAC, retention and deletion controls.
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


## 8. Design system

P001–P005 share a standing product-design constraint: **Less is more**.

The canonical UI principles are documented in `docs/DESIGN_PRINCIPLES.md`. Feature growth must not automatically increase visible interface density. Prefer one-task-per-screen flows, progressive disclosure, whitespace, typography, and semantic motion over additional cards, gradients, badges, and decorative AI motifs.
