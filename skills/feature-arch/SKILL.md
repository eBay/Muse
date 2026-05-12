---
name: feature-arch
description: >
  A skill for feature-based development using the js-plugin package in Node.js or frontend
  applications. Use this whenever the user is working with features under a src/features/
  directory — creating features, wiring them via extension points, updating specs, or
  managing feature boundaries.
---

# Feature-Based Development Skill

This skill describes a feature-based development approach powered by the [js-plugin](./references/js-plugin.md) package. It applies to both Node.js backend and frontend UI applications.

**Before proceeding with any feature work, read `./references/js-plugin.md`** to understand the plugin API and extension point patterns. The entire approach depends on it.

---

## Folder Structure

Each feature lives in its own subdirectory under `src/features/`:

```
src/features/
├── feature1/
│   ├── ext/
│   │   └── index.js        # Extension point contributions from this feature
│   ├── index.js            # Feature plugin definition
│   └── FEATURE_SPEC.md     # Feature specification
├── feature2/
│   ├── ext/
│   │   └── index.js
│   ├── index.js
│   └── FEATURE_SPEC.md
└── ...
```

Tip: you can use `.ts[x]` , `.js[x]` for index files, not limited to `.js`.

---

## What Is a Feature?

A feature is a cohesive group of related capabilities. All features work together to form the complete application, but each one is independently removable.

**Core rules:**

- Every feature lives as a subdirectory under `src/features/`.
- Every feature is implemented as a js-plugin plugin.
- A feature must be removable without breaking the rest of the application — its absence degrades functionality gracefully rather than causing crashes or errors.
- Features communicate with each other exclusively through **extension points** and **exports** — never through direct imports across feature boundaries.
- Add extension points or exports to a feature only when integration with another feature actually requires it.

---

## FEATURE_SPEC.md

Every feature folder must contain a `FEATURE_SPEC.md` file. This file defines the feature's boundary and serves as the source of truth for its capabilities.

**Purpose:** The spec establishes what the feature does and how it does it — not why it exists. Keep it precise and current.

**When to update:**

- Add an entry whenever a new capability is added to the feature.
- When the user manually edits the spec, treat it as an implementation directive and apply the changes in code.

**Boundary enforcement:** If a proposed change seems to exceed the feature's defined scope, pause and ask the user whether a new feature is needed rather than expanding the current one silently.

**Suggested sections** — include only what's relevant, and add any other sections that help describe the feature clearly:

| Section                      | Content                                                           |
| ---------------------------- | ----------------------------------------------------------------- |
| **Overview**                 | A short, accurate description of what the feature does            |
| **UI Requirements**          | Layout, components, interactions, and visual behavior             |
| **Performance Requirements** | Loading targets, caching strategy, optimization constraints       |
| **Security Requirements**    | Auth checks, data access rules, input validation                  |
| **Extensibility**            | Extension points exposed, global shared modal IDs, plugin exports |

Keep the spec concise. Avoid rationale or background — focus on _what_ and _how_.

---

## Workflow

### Creating a new feature

When the user asks to create a new feature:

1. Create a subdirectory under `src/features/` with a name that reflects the feature's purpose.
2. Set up the standard folder structure (`ext/index.js`, `index.js`, `FEATURE_SPEC.md`).
3. Write an initial `FEATURE_SPEC.md` with an accurate overview and placeholder sections for UI, performance, security, and extensibility.
4. Scaffold the js-plugin plugin in `index.js`.

### Implementing or modifying a feature

When adding or changing capabilities:

1. Review the feature's `FEATURE_SPEC.md` to confirm the change is in scope.
2. If the change is in scope, implement it and update the spec to reflect the new capability.
3. If the change appears out of scope, ask the user whether to expand the spec or create a new feature.
4. After applying any code changes, verify that the implementation matches the spec.

### Wiring features together

Use extension points for inter-feature communication:

- A feature that needs to expose behavior for others defines an extension point in its plugin.
- A feature that contributes to another's extension point does so in its `ext/index.js`.
- Never import directly from another feature's internal modules — always go through the plugin's public interface.

---

## Quick Reference

| Question                                       | Answer                                                        |
| ---------------------------------------------- | ------------------------------------------------------------- |
| Where do new features go?                      | `src/features/<feature-name>/`                                |
| How do features share behavior?                | Extension points and plugin exports                           |
| What happens if I remove a feature?            | App still runs; that feature's capabilities are simply absent |
| Where is a feature's contract defined?         | `FEATURE_SPEC.md`                                             |
| When do I create a new feature vs. extend one? | When the capability is outside the existing spec's boundary   |
