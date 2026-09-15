# P00 Design Principles

## Core rule: Less is more

**Less is more is the default design constraint for P001–P005.**

When a choice exists between adding another visible element and improving hierarchy, spacing, copy, motion, or interaction, prefer the latter.

## UI invariants

1. **One screen, one primary task.**
   Avoid dashboards, card walls, and multiple equally strong calls to action.

2. **Whitespace is functional.**
   Space communicates hierarchy and pacing. Do not fill empty space merely to make a screen look “complete.”

3. **Reduce containers before decorating containers.**
   Prefer typography, alignment, and spacing over bordered cards, shadows, pills, gradients, and nested boxes.

4. **One dominant accent.**
   Each module may have one primary accent color. Additional colors require a semantic reason.

5. **Typography before ornament.**
   Use scale, weight, line length, and rhythm to create character. Decorative illustration is secondary.

6. **Progressive disclosure.**
   Research caveats, API details, advanced settings, admin information, and optional features should not compete with the user’s current task.

7. **Motion must explain change.**
   Animation should communicate transition, generation, hierarchy, or direct manipulation. Avoid ambient motion that exists only to look “AI.”

8. **Mobile is not a compressed desktop dashboard.**
   Mobile layouts should become simpler, not merely narrower.

9. **No generic AI aesthetic.**
   Avoid excessive glassmorphism, glowing orbs, neon gradients, floating cards, fake waveforms, and “futuristic” decoration unless the interaction specifically needs them.

10. **Every visible element must earn its place.**
    If removing an element does not reduce comprehension, trust, task completion, or emotional meaning, remove it.

## Product implication

Feature richness belongs in system capability, not visual density.

P005 is the reference implementation: a sequential, reflection-first flow in which advanced features (voice, branching futures, time capsule) remain available but do not dominate the core Future You experience.
