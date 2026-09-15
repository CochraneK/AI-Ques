# P005 · Future You Mechanism Notes

This document records the public research mechanism that P005 is reproducing at the interaction/system level. It does **not** copy MIT Future You branding, protected assets, source code, or verbatim product copy.

## 1. Psychological target

Future You is built around **future self-continuity (FSC)**: the perceived connection between one’s present self and temporally distant future self.

The original work combines reflective and presentational interventions:
- reflective: autobiographical and future-oriented writing;
- presentational: an age-progressed representation of the user;
- interactive: a personalized future-self conversation.

The system is meant to make an ambiguous future more vivid and concrete, not to predict it.

## 2. Original four-module architecture

The 2024 Future You paper describes four modules:

### A. Life Story Interface

Sequential web questions, one question at a time, each with a free-text answer and example placeholder.

Present-oriented inputs include:
- name;
- age;
- pronouns;
- location;
- important people;
- low point;
- proud memories;
- turning point;
- biggest challenges.

Future-oriented inputs include:
- future career / professional accomplishments;
- future financial situation;
- future family situation;
- future lifestyle.

P005 V0.2 follows the same interaction logic: one question, one response, one primary action.

### B. Age-Progressed AI

Original implementation:
- user uploads a present-day portrait;
- StyleCLIP age-progresses the portrait toward approximately age 60;
- a short time-warping wait state is shown;
- the enlarged future portrait is revealed before conversation.

P005 keeps this as an API boundary. It never pretends the current photo is a genuine aged result when no image backend is configured.

### C. Future / Synthetic Memory

The LLM creates a coherent backstory from the user’s present life to age 60.

The research system expands individual survey topics into richer memories, then combines them into a future-self narrative. Important memory categories include:
- rewarding / memorable / funny moments;
- challenges and struggles;
- dreams, expectations, and how they turned out;
- expected and unexpected outcomes.

P005 exposes an optional `memoryApi`. Without a backend, a deterministic local fallback preserves the architecture but should not be treated as a research-equivalent LLM implementation.

### D. Chat Interface

Original interface is deliberately familiar: chronological messages, user input at the bottom, present/future portraits as identity anchors.

The future self begins with scripted autobiographical cues, including:
- introducing itself and explaining why it is present;
- acknowledging that the future may turn out differently;
- using continuity language such as “when I was your age…”;
- describing expected and unexpected outcomes;
- recalling personally meaningful future stories;
- asking reflective follow-up questions.

The original study surfaced a non-intrusive finish/thank-you control after 16 exchanged messages. P005 V0.2 mirrors that interaction threshold.

## 3. Current Future You direction

The current public Future You site describes the intake around:
- personality;
- values;
- life story;
- goals;
- voice.

Its live “Paths” experience also begins from an unresolved A/B decision. P005 therefore keeps A/B branching as an optional final intake item rather than making branching the entire core interface.

## 4. Multimodal extension

The 2025 Future You multimodal study compares:
- text chat + static aged portrait;
- voice interaction + static aged portrait;
- animated/lip-synced avatar.

The reported result is important for product design: personalized modalities improved FSC and wellbeing, while interaction quality (realism, persuasiveness, engagement) was a strong predictor of impact. More visual complexity was not automatically superior.

P005 therefore treats:
- **text** as the baseline/core interaction;
- **voice** as an enhancement;
- **animated avatar** as a later enhancement;
- conversational quality and autobiographical grounding as higher priority than visual spectacle.

## 5. P005 design translation

The system-level reproduction is:

```text
shared profile
   ↓
sequential life-story intake
   ↓
present portrait upload
   ↓
age-progress API (optional)
   ↓
future-memory generation
   ↓
future-self reveal
   ↓
personalized conversation
   ↓
optional letter / time capsule
```

Advanced features never replace the core reflective path.

## 6. Safety / epistemic boundary

Future Me must always be framed as:
- one plausible future;
- generated from user-provided information;
- potentially wrong or incomplete;
- useful for reflection rather than prediction.

It must not claim:
- certainty about future events;
- clinical diagnosis;
- therapeutic authority;
- privileged knowledge of the user’s actual future;
- that one A/B choice is objectively correct.

## 7. Primary public sources

- MIT Future You project overview: https://www.media.mit.edu/projects/future-you/overview/
- Current Future You site: https://futureyou.media.mit.edu/
- 2024 paper / arXiv: https://arxiv.org/abs/2405.12514
- MIT News overview: https://news.mit.edu/2024/ai-simulation-gives-people-glimpse-potential-future-self-1001
- 2025 multimodal paper / arXiv: https://arxiv.org/abs/2512.06106
