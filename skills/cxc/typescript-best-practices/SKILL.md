---
name: typescript-best-practices
description: "Type-design rules for TypeScript and Svelte code: model variants as discriminated unions, brand IDs through a verifying parse, parse external data at boundaries with the repo's schema library, no `as` casts or `!` assertions, exhaustive switches. Use when writing, changing, or reviewing TypeScript, designing types or function signatures, removing casts, or wiring lint rules for type safety."
paths: ["**/*.ts", "**/*.tsx", "**/*.svelte"]
metadata:
  credits:
    skill: "typescript-best-practices, principle-type-system-discipline, principle-boundary-discipline"
    author: Lauren Tan (poteto)
    url: "https://github.com/cursor/plugins/tree/main/pstack/skills"
---

# TypeScript best practices

Make the compiler reject impossible states, mismatched primitives, and unhandled variants. Prefer defining errors and special cases out of existence over proliferating handlers.

## Discipline

- **Brand semantic primitives.** `UserId` and `OrderId` are strings underneath but should not be interchangeable. Give each its own branded type. Validate once at creation, trust the type downstream. If two arguments share a primitive type but mean different things, brand them.
- **External data is untyped until parsed.** RPC payloads, `JSON.parse`, form data, `<select>` and input values, URL params, cookies, config files, environment variables, and database rows whose column type is wider than the domain type. Every boundary has a parse function that turns unstructured input into the typed model.
- **Guard at the boundary, trust inside.** Validate, narrow, and handle errors where data crosses in. Inside the system, typed data flows with no re-validation and no redundant nil checks. Business logic lives in pure functions with no framework dependencies; route handlers and components stay thin. Don't re-export transport, storage, framework, or wire types through a module's public surface.
- **Derive types from authoritative schemas.** When a database schema, OpenAPI spec, runtime schema, or design-token file owns a shape, derive from it instead of hand-rolling a parallel type.

## Rules

| Rule | Summary |
|------|---------|
| Discriminated unions | Model variants with a `kind` literal discriminant so impossible states can't be represented. No optional-field bags. |
| Branded types | Brand primitives with `& { readonly __brand: "X" }`, or the schema library's brand. Validate once at the boundary. A brand comes from a verifying type guard or a schema parse (`input is AgentId`, `OrgId.parse(row.id)`), never from `as`. |
| Constructive modeling | Build the shape so the illegal value can't be constructed. `[T, ...T[]]` for non-empty, `[T, T][]` for even length, `start` plus `duration` for a range. Not a runtime guard, not a wish for refinement types. |
| Simplest total type | Keep `T[]` while every operation on it stays total. Strengthen to `NonEmpty<T>` only where the loose type forces `!`, a cast, or a "should never happen" throw. |
| `unknown` over `any` | External data is `unknown`. |
| Schemas before guards | Before hand-writing a property-by-property type guard, use the repository's runtime schema library (zod, valibot, Effect Schema) and infer the type from the schema. |
| No `as` casts | Every `as` is a runtime crash waiting. Cast only after validation. `as const` is fine. |
| No `!` assertions | A `!` is partiality smuggled past the compiler. Narrow, strengthen the input type, or return `T \| undefined`. |
| Narrowing hierarchy | Discriminant switch > `in` operator > `typeof`/`instanceof` > user-defined type guard > `as`. |
| Type guards | Must verify the claim. A lying guard is worse than `as` because the bug hides behind a name that says it's safe. Name them `isX` or `hasX`. |
| Exhaustiveness | Inline `const _exhaustive: never = x;` in default arms, or the lint rule below, so the compiler errors when a new variant is added. |
| `satisfies` over `as` | Validates the value without widening literal types. |
| Boundary validation | Parse where data crosses in, into a named domain type. `Record<string, unknown>` (however spelled) stops at that parse. Trust types inside. |
| Schema-derived types | Reach for `Pick`/`Omit`/`Parameters`/`ReturnType`/`Awaited`/`typeof` and the schema's inferred types before declaring a new interface. |
| Object args | Pass objects, not positional, so argument order is self-documenting. Skip on hot paths (per-frame render, tokenizers, parsers). |
| Real tests | Don't mock what you can run. Prefer the framework's real test primitives, and verify UI in a running build. Mock only what you can't run locally. |
| Structured telemetry | Prefer structured logger diagnostics with enough context to debug from an id. No `console.log` in shipped code. |

Examples, including Svelte form values, IDs read from your own database, and cookie payloads: [references/patterns.md](references/patterns.md).

## Make it mechanical

A rule a linter can check belongs in the linter, not in a reviewer's head. When a repo lacks one of these, adding it is the fix, not another reminder.

| Rule | typescript-eslint | oxlint |
| --- | --- | --- |
| No `as` | `@typescript-eslint/consistent-type-assertions` with `{ assertionStyle: "never" }` | `typescript/consistent-type-assertions` with `{ "assertionStyle": "never" }` (oxlint 1.44 or later) |
| No `!` | `@typescript-eslint/no-non-null-assertion` | `typescript/no-non-null-assertion` |
| No `any` | `@typescript-eslint/no-explicit-any` | `typescript/no-explicit-any` |
| Exhaustive switches | `@typescript-eslint/switch-exhaustiveness-check` (type-aware) | `typescript/switch-exhaustiveness-check` (type-aware pass) |

Both assertion rules still allow `as const`. In an existing codebase full of casts, turn the rule on for new and changed files first, or fail only when a change adds more.

## In review

When `code-review` loads this skill, each rule above is a documented standard for the Standards axis. A repo's own `CODING_STANDARDS.md` overrides a rule here where the two disagree, and anything the repo's linter already enforces is skipped.
