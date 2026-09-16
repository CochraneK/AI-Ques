# P005 · Future You Methods Mapping

This file separates **paper-described Future You variables** from later/current-site fields and P005 product adaptations so future publications can describe the protocol accurately.

## Publicly described 2024 Future You intake

The 2024 paper states that Life Story Interface questions are shown sequentially and each question uses a free-text input.

Paper-described present fields:
- name
- age
- pronouns
- location
- important people
- turning point
- proud point
- low point

Paper-described age-60 outcome fields:
- career / professional accomplishments
- financial status
- family life
- personal-life outcomes

The published Future Memory prompt additionally demonstrates that the system used:
- life project
- where to live
- daily life
- pronoun + sexual orientation in the memory template

P005 does **not** currently collect sexual orientation because it is not necessary for the present product/research objective. This is an explicit deviation.

Primary source:
- https://arxiv.org/html/2405.12514

## Current Future You public site

The current public site summarizes intake using:
- Personality
- Values
- Life story
- Goals
- Voice

Source:
- https://futureyou.media.mit.edu/

## P005 protocol modes

### replication

Purpose: closest defensible implementation to the publicly documented 2024 intake.

- sequential, one question per screen;
- no MECE answer buttons;
- free-text responses;
- includes fields marked `paper-core` and `paper-prompt`;
- excludes P005-only challenge / A-B / values extensions;
- the configured future horizon may still differ from the original age-60 protocol and must be reported.

This is **paper-aligned**, not a claim of verbatim survey replication because the paper does not publish a complete word-for-word survey instrument.

### guided

Purpose: lower burden and better product completion.

- preserves the same underlying constructs where possible;
- uses mutually exclusive single-choice categories where a single primary category is meaningful;
- uses bounded multi-select where the construct is inherently multidimensional;
- offers one optional short free-text detail field;
- includes current-site/P005 extensions.

This mode is a protocol modification and should be analyzed/reported separately from replication mode.

## Publication fields that must be logged

Every session should retain:
- module version;
- intake protocol;
- future horizon;
- exact question key;
- source classification (`paper-core`, `paper-prompt`, `current-site`, `p005-extension`);
- structured selections;
- optional free-text detail;
- chat completion/early-exit status;
- voice mode / voice id when applicable.

## Chat fidelity

The original paper describes:
- traditional chronological chat UI;
- age-progressed profile image;
- scripted opening prompts;
- continuity language such as “when I was your age…”;
- expected and unexpected future outcomes;
- 16 exchanged messages before the non-intrusive completion button appears;
- conversation + survey data sent to a Google Sheet for analysis.

P005 keeps the 16-message protocol completion control, while also exposing an always-available explicit End control for user autonomy. Ending before 16 in replication mode is logged as early termination.

## Voice extension

Voice is not part of the 2024 core intervention. The 2025 multimodal Future You work studies text, voice, and avatar modalities. Any voice-enabled condition therefore needs to be identified as a multimodal extension rather than the original 2024 text-only intervention.

Source:
- https://arxiv.org/abs/2512.06106


## V0.5 guided-profile adaptation

The guided condition now includes two P005-owned rapid-profile matrices whose content lineage mirrors the same research basis previously used elsewhere in the project:

- 24 positive-quality items, maximum 6 selections;
- 16 important-value items, maximum 4 selections.

These are **not part of the 2024 Future You intake** and must be reported as a P005 profile-enrichment layer. V0.7 does not read P001 runtime data.

The guided Chinese condition also:
- asks gender as a direct male/female choice;
- uses one primary current-role category rather than slash-combined labels;
- allows multiple important-person categories;
- removes the previous A/B decision item entirely.

The replication condition remains separate and continues to use the paper-aligned free-text fields.


## V0.7 peer-context condition

P004 history is not part of the Future You replication protocol.

If P004 data exists, P005 shows an explicit opt-in control. The receiving P005 session records:
- whether P004 context was detected;
- whether the participant allowed its use;
- counts of imported user-authored turns / continuity memories when allowed.

Raw P004 peer text is used only as model context for Future Memory / Future Me responses. It is not copied into P005 research export or the generic P005 admin snapshot.

Any study enabling this bridge must report it as an additional context condition or covariate; it must not be silently pooled with a no-history replication condition.
