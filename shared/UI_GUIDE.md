# AI-Ques UI / P00x integration guide

## Global product model

Every module belongs to one product:
- portal = one-time profile + project universe
- P00x = project-specific participant experience
- admin = unified research workspace
- shared = identity, events, design tokens and registry

A module may have its own accent, but should not feel like a separate website.

## Visual rules

Load shared/theme.css before module CSS.

Shared language:
- warm paper background
- dark botanical ink
- restrained glass surfaces
- 22–32 px corner radius
- serif display typography + system sans UI text
- subtle gradients rather than saturated “AI neon”
- prefers-reduced-motion support
- visible keyboard focus
- responsive behavior around 920 px and 640 px

## Participant UX

- One profile only. Never ask for participant ID inside a module.
- Do not repeat name/age/location if the global profile already contains them.
- Project-specific questions are allowed.
- Keep diagnostic/risk labels out of participant-facing screens unless explicitly approved.
- Use neutral wording for sensitive constructs.
- Avoid long instruction walls before the task.

## Experimental UI rule

When comparing presentation conditions:
- freeze measurement wording;
- keep response options/scoring identical unless the manipulation explicitly changes them;
- write condition_id at session and item level;
- standard/baseline must not leak construct information through labels, colors or icons.

P002 example:
- standard = neutral visual treatment; no B/C/D/E or PI/BE/PA cue
- guided = cluster card and cluster-specific visual cue allowed

## Shared data contract

Every project should:
1. call AIQ.ensureProfile()
2. call AIQ.startSession("P00x", version)
3. emit meaningful events with AIQ.recordEvent()
4. finish with AIQ.completeSession()

Use an adapter when a module is developed independently. Do not rewrite module core merely to satisfy the global shell.

## Admin surface

The admin page should support:
- participant and project filters
- session identity
- complete raw export
- project-specific research summaries
- data-quality signals
- explicit local-vs-remote mode

Participant-facing and admin-only signals must remain separate.

## New project checklist

For P006+:
- add one entry to shared/project-registry.json
- inherit shared theme
- reuse global profile
- create a project session
- emit events
- add a project-specific admin summary only if useful
- add smoke assertions
- do not create a second identity store


## Figma source

Editable design-system file:
https://www.figma.com/design/nBFFHwDn3KfZF6gTSbIB4E

File name: AI-Ques UI System · P002 Review

The shared/theme.css token layer and the Figma variable collection should evolve together. Figma is a design review/spec surface; runtime behavior remains source-controlled in GitHub.
