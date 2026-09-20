# AGENTS.md

## Project mission

AI-Ques is a static P00 research-prototype hub for multiple psychology-informed interaction modules. The repository must preserve module boundaries, research-validity limits, privacy separation, and the standing **Less is more** design constraint.

## Read before editing

1. `README.md`
2. `docs/ARCHITECTURE.md`
3. `docs/DESIGN_PRINCIPLES.md`
4. `module-registry.json`
5. module-native docs/config for the module being changed
6. `.github/workflows/quality-gate.yml`

Git is the durable source of truth. Handoff files summarize current state but do not override module-native contracts.

## Non-negotiable boundaries

- Do not present the repository as a diagnostic product.
- Do not let prototype translations or rewritten items inherit the validity of source instruments automatically.
- Keep low-sensitivity shared profile fields separate from module-private or research/admin-only data.
- Never write P004 clinical-like inference, evidence quotes, or private observer state into the shared public profile.
- P004/P005 interoperability must remain explicit and user-enabled in the consuming module.
- P004 and P005 must remain extractable as standalone products; do not create mandatory dependencies on P001/P002/P003.
- Do not make Future Me sound predictive, therapeutic, or deterministic.
- Do not turn static GitHub Pages into an implied production admin/security architecture.
- Preserve one-task-per-screen / progressive-disclosure / low-density UI unless evidence justifies otherwise.
- Use repository-facing identity **CochraneK**.

## Validation

Run the repository quality gate locally when possible:

```bash
node --check app.js
node --check shared/profile.js
node --check shared/config.js
node --check shared/core.js
node --check p001/app.js
node --check p001/report.js
node --check p001/static-api.js
node --check p002/condition-config.js
node --check p002/app.js
node --check p002/admin.js
node --check p004/core.js
node --check p004/app.js
node --check p004/api-client.js
node --check p005/app.js
node --check p005/api-client.js
node --check p005/admin.js
node tests/smoke.mjs
node tests/p004-runtime.mjs
node tests/p005-runtime.mjs
node tests/structure.mjs
python scripts/quality_sensor.py --strict
```

GitHub Actions remains the final regression gate.

## Bounded work / checkpoint rule

For one bounded change:

1. read the target module's canonical files;
2. change module-native implementation/contracts first;
3. run targeted validation;
4. update `STATUS.md` when current state changes;
5. append material architectural/product decisions to `DECISIONS.md`;
6. update `HANDOFF.md` when the next gate or blocker changes;
7. commit before switching module/project/agent.

## Owner / external gates

Do not auto-decide ethics approval, licensing/validation claims, destructive history changes, publication of sensitive data, or production security architecture.
