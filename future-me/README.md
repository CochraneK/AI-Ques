# Future Me (AI-Ques)

A low-cost, photo-free prototype inspired by the research architecture of MIT Future You.

## What is replicated

- Sequential life-story interview
- Present-self narrative prompts
- Age-60 future-oriented prompts
- Synthetic / future memory generation
- Future-self chat experience
- Reflection letter and a small next action

## What is intentionally not replicated

- MIT branding, logos, or exact visual design
- Age-progressed portrait / photo upload
- Research account system and data collection
- Any claim of affiliation with MIT

## Current AI mode

GitHub Pages cannot safely hold an LLM API key. Therefore the public demo uses a deterministic local response engine grounded in the user's answers.

To connect a real model later, define `window.FUTURE_ME_API` to point to a backend endpoint that accepts:

```json
{
  "profile": {},
  "syntheticMemory": {},
  "messages": [],
  "userMessage": "..."
}
```

and returns:

```json
{ "reply": "..." }
```

The backend should instruct the model to act as a *possible* future self, not a prophet or therapist, and to ground responses in the supplied life-story data and synthetic memory.

## Research basis

The implementation follows publicly described Future You modules: life-story questionnaire, future/synthetic memory generation, and a conversational interface. The image-aging module is deliberately omitted.
