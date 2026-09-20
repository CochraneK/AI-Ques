# Agent Handoff

## Current mission

Maintain AI-Ques as a coherent P001–P005 research-prototype hub while keeping shared profile reuse narrow, module-private state isolated, and P004/P005 independently extractable.

## Current structure

- Root: P00 navigation + shared profile editing.
- P001: current / ideal / future self interaction prototype.
- P002: PCL/CAPE interaction experiment.
- P003: not currently embedded in this repository.
- P004: conversational character/persona profiling prototype.
- P005: Future Me / future-self prototype.
- `future-me/`: legacy URL compatibility only.
- `shared/profile.js`: canonical low-sensitivity cross-module profile adapter.

## Established boundaries

- The product is a research prototype, not a diagnostic system.
- Shared profile data is intentionally narrow.
- P004 research/admin-like inference remains private to P004.
- P005 future-self output is a possible future narrative, not prediction.
- Static browser storage is prototype infrastructure, not production research-data governance.
- P004 and P005 must remain capable of future standalone extraction.

## Immediate next actions

1. Keep active module work inside the architecture and privacy contracts above.
2. When changing shared data, verify no sensitive/module-private field crosses namespaces.
3. When changing P004/P005 interoperability, preserve explicit user enablement and standalone fallbacks.
4. Run the full quality gate before merge.
5. Keep README/module registry/docs synchronized with any module-status or routing change.

## Validation

```bash
node tests/smoke.mjs
node tests/p004-runtime.mjs
node tests/p005-runtime.mjs
node tests/structure.mjs
python scripts/quality_sensor.py --strict
```

## Canonical files

- `module-registry.json`
- `shared/profile.js`
- `docs/ARCHITECTURE.md`
- `docs/DESIGN_PRINCIPLES.md`
- module-native code/config/docs
- `.github/workflows/quality-gate.yml`

## Do not

- do not let chat-only decisions become canonical;
- do not merge module-private storage into the shared profile;
- do not make P004/P005 depend on the rest of the monorepo for core operation;
- do not imply diagnostic, predictive, or treatment validity that has not been independently established.

## Session closeout

Checkpoint material state to Git, update STATUS/DECISIONS/HANDOFF when relevant, and leave the next action executable by another agent without requiring the previous chat.
