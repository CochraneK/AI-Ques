---
name: ai-ques-hardening
description: harden AI-Ques research boundaries and implementation safety when the quality sensor reports a finding; use repository code and validated instrument sources as truth instead of UI labels or prototype scores
---

# AI-Ques Hardening

Use this skill after running `scripts/quality_sensor.py`.

The goal is to move the repository toward the set point in `QUALITY_LOOP.md` through small, reviewable changes.

## Core requirements

- Run the sensor before choosing work.
- Use `scripts/next_quality_target.py`; address one selected target per iteration unless two edits are inseparable.
- Do not add new assessment modes while P0/P1 hardening work is outstanding.
- Never upgrade prototype translations, scenario signals, or custom weights into validated clinical scores by wording alone.
- Treat Future Me as a separate reflective lab, not as an assessment mode.
- Dynamic user/model text must use `textContent` or `escapeHtml()` before entering HTML.
- Preserve the zero-backend public demo unless a reviewed backend is explicitly introduced.
- Run the strict sensor before finishing.

## Workflow

### 1. Sense

Run:

```bash
python scripts/quality_sensor.py
python scripts/next_quality_target.py
```

Completion criterion: one target is selected and its source file is identified.

### 2. Inspect the source of truth

Read the affected implementation plus the relevant README/research note. For instrument claims, prefer cited primary/official sources over existing UI copy.

Completion criterion: you can explain what is wrong and the smallest accurate replacement.

### 3. Make the smallest safe change

Change only the selected target and inseparable documentation/test updates. Do not redesign unrelated UI or add another experiment.

Completion criterion: the selected finding is no longer reported.

### 4. Validate

Run:

```bash
python scripts/quality_sensor.py --strict
```

Completion criterion: no P0 finding is introduced and the target is resolved.

### 5. Report

Follow `references/response-template.md`.

## Review checklist

- Source of truth inspected first.
- No prototype output was reframed as diagnosis/validated score.
- User/model free text remains escaped.
- Diff is one reviewable increment.
- Strict sensor passes.
