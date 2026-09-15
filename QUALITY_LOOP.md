# AI-Ques Quality Control Loop

This repository uses a small HumanLayer-inspired control loop to improve research safety and maintainability without large rewrites.

## Set point

AI-Ques should converge toward these invariants:

1. The public UI never presents prototype translations as a validated psychometric gold-standard baseline.
2. User-entered or model-generated free text is escaped before entering HTML.
3. Public storage behavior is disclosed before collecting Future Me narrative data.
4. Runtime modes have one explicit source of truth rather than load-order monkey patches.
5. Research runs can eventually be version-frozen and smoke-tested.

## Sensor

Run locally:

```bash
python scripts/quality_sensor.py
python scripts/quality_sensor.py --strict
```

P0 findings are regression-gate failures. P1/P2 remain visible for later iterations.

## Controller

Run:

```bash
python scripts/next_quality_target.py
```

The controller deliberately selects one reviewable target per iteration.

## Actuator

The repo-local skill is `.claude/skills/ai-ques-hardening/SKILL.md`.

No scheduled autonomous coding workflow is installed yet because no coding-agent runner/credential has been agreed for this repository. The actuator can be run manually now and automated later.

## Disturbances

- new experimental modes;
- wording changes that restore clinical/baseline claims;
- Future Me changes that add dynamic HTML;
- future LLM backends;
- research protocol changes.

## Dampener

`.github/workflows/quality-gate.yml` runs the sensor on pull requests and pushes to `main`. It blocks only P0 violations.

## Human on the loop

Standing feedback belongs in `.github/agent-memory/ai-ques-hardening.md`. Keep one open hardening PR at a time and do not increase batch size until the loop is consistently easy to review.
