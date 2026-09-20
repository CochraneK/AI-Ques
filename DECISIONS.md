# Decisions

This file records durable cross-agent decisions that affect more than one implementation detail. Module-native contracts remain authoritative for module-specific behavior.

## Shared profile boundary

`shared/profile.js` is the only canonical cross-module profile adapter. The shared profile is limited to low-sensitivity continuity fields and must not become a store for P004 clinical-like inference, evidence quotes, raw conversations, or other module-private state.

## P004 / P005 standalone direction

P004 and P005 are expected to be distributable independently in the future. Their core flows must not require P001, P002, or P003. Any current monorepo reuse is a convenience, not a hard dependency.

## P004 / P005 bilateral continuity

When both modules exist, user-authored context may be reused only through an explicit user-enabled bridge. P004 admin/research-only inference is not part of the public bridge. Raw cross-module context should not be copied into unrelated exports.

## Research claims boundary

AI-Ques is a research/product prototype, not a diagnostic or predictive clinical system. Reworded/prototype instrument content does not automatically inherit source validity.

## Static deployment boundary

GitHub Pages and browser-local/session storage support prototyping and demos; they do not constitute production authentication, RBAC, retention, deletion, or sensitive-data governance.

## Product design

**Less is more** is a standing cross-module principle. Feature growth should not automatically increase visible density.

## Agent continuity

Git is canonical. `AGENTS.md`, `HANDOFF.md`, `STATUS.md`, and this decision log exist so another agent can continue without reconstructing project state from chat history.

## Identity

Repository-facing identity is **CochraneK**.
