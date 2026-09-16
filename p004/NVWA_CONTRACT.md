# P004 × NVWA Integration Contract

P004 is a character-conversation shell. NVWA is an optional distillation pipeline, not the default chat mode.

## Product rule

- **Distillation off**: Character Card + user Persona + retrieved long-term memory.
- **Distillation on**: run the NVWA character-skill workflow, persist the resulting `SKILL.md` locally, then load that skill into future chat turns.
- The background Observer is independent from both modes and analyzes user-authored evidence from P004, P005 / Future You, and later BJTU modules.

## NVWA methodology to preserve

Reference implementation: [xmg2024/nvwa-skill](https://github.com/xmg2024/nvwa-skill), pinned by P004 to commit `fdb181f0e057e837e15942707b1ea35845850979` for reproducible protocol semantics.

A complete server-side distillation should preserve these invariants:

1. Six research streams: writings, long conversations, expression DNA, external views / criticism, decisions, timeline.
2. User-provided first-party material has highest priority.
3. Candidate mental models pass triple verification: **cross-domain recurrence, generative power, exclusivity**.
4. Final Skill contains **3–7 mental models** and **5–10 decision heuristics**.
5. Include expression DNA, values / anti-patterns, internal tensions, and honest limits.
6. Validate known positions, an unseen edge case, and voice / style.
7. Research artifacts should remain self-contained with the skill when the backend supports bundled export.

P004 must never label a local Character Card draft as a completed NVWA distillation.

## API

### POST `/api/p004/distill`

Request:

```json
{
  "protocol": "nvwa-skill",
  "protocolVersion": "xmg2024/nvwa-skill@fdb181f0e057e837e15942707b1ea35845850979",
  "character": {
    "id": "...",
    "name": "...",
    "identity": "...",
    "personality": "...",
    "scenario": "...",
    "style": "..."
  },
  "request": {
    "subject": "...",
    "focus": "...",
    "mode": "web-research | local-material-first",
    "materials": [
      {"name": "interview.md", "type": "text/markdown", "text": "..."}
    ]
  },
  "requirements": {
    "researchStreams": 6,
    "tripleVerification": true,
    "mentalModels": [3, 7],
    "decisionHeuristics": [5, 10],
    "includeExpressionDNA": true,
    "includeAntiPatterns": true,
    "includeHonestLimits": true,
    "qualityValidation": true
  }
}
```

Response:

```json
{
  "skillMarkdown": "---\nname: ...-perspective\n---\n...",
  "meta": {
    "mentalModels": 5,
    "heuristics": 8,
    "researchStreams": 6,
    "validated": true,
    "cutoff": "2026-09-15"
  },
  "research": {
    "summary": "...",
    "files": ["01-writings.md", "02-conversations.md"]
  }
}
```

### POST `/api/p004/chat`

Receives Character Card, optional NVWA Skill markdown, shared user Persona, retrieved memory, and recent messages.

If `skill.markdown` is present, instantiate it as the role / reasoning / expression instruction layer. Do not merely quote the markdown back to the user.

The chat endpoint must not expose administrator-only personality / clinical inference.

### POST `/api/p004/memory`

Compress recent interaction into durable relationship memory. Prefer stable facts, preferences, commitments, meaningful relationship events and unresolved threads over verbatim transcript storage.

### POST `/api/p004/observe`

Accept multiple evidence sources such as P004 and P005. Return inferred traits with uncertainty and evidence references. Clinical-like dimensions are administrator-only research signals, never user-visible scores.

## Local Skill Vault

GitHub Pages cannot silently write arbitrary desktop folders. P004 therefore persists skill artifacts in IndexedDB (`bjtu-p004-skill-vault`) and exposes **Export SKILL.md**. Browsers supporting File System Access API can let the user explicitly choose a local path.

Recommended future bundle:

```text
character-id/
├── character.json
├── SKILL.md
├── memory.jsonl
└── references/
    └── research/
        ├── 01-writings.md
        ├── 02-conversations.md
        ├── 03-expression-dna.md
        ├── 04-external-views.md
        ├── 05-decisions.md
        └── 06-timeline.md
```

## Safety override

Character cards and distilled skills never outrank the safety layer. Explicit imminent self-harm language must bypass persona styling and invoke a dedicated safety response / safety agent. The Observer may record the event for authorized review, but the user-facing reply must not continue immersive roleplay as if nothing happened.