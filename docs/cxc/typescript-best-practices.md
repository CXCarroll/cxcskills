## What it does

`typescript-best-practices` is a set of type-design rules for TypeScript and Svelte code: model variants as discriminated unions, brand IDs through a verifying parse, parse external data where it crosses in, and write no `as` casts or `!` assertions. It works at both ends of a change. The agent loads it while writing TypeScript, and `code-review` loads it again for any diff that touches `.ts`, `.tsx` or `.svelte` files, where a repo's own `CODING_STANDARDS.md` wins wherever the two disagree.

## When to reach for it

Type `/typescript-best-practices`, or the agent reaches for it automatically when it works in TypeScript or Svelte files.

| Your situation | Reach for |
| --- | --- |
| Designing types or a signature for new code | This skill |
| Reviewing a diff | [code-review](https://aihero.dev/skills-code-review), which loads this skill for TypeScript diffs |
| The question is a module's shape (depth, seams, interface) | [codebase-design](https://aihero.dev/skills-codebase-design) |

## Illegal states, unrepresentable

The leading idea is to make the compiler reject the bad state rather than handle it at run time. A cast tells the compiler to stop checking, so a `<select>` value, a cookie or a database row that lands in a domain type through `as` is a crash nobody has met yet. The skill's patterns show the alternative for each: a guard derived from the same list as the options, a schema that owns the brand, a parse whose failure is an expected branch.

Rules a linter can check belong in the linter. The skill names the typescript-eslint and oxlint rules that ban casts, `!` and `any`, and that force exhaustive switches.

## Common questions

**Why not just put these rules in `CODING_STANDARDS.md`?**
You can, and a repo's standards override the skill. The skill carries the same rules into every repo, including new ones, and its lint table turns the mechanical half into checks that fail the build.

**My codebase already has hundreds of casts. Do I fix them all?**
No. Turn the lint rules on for new and changed files, or fail only when a change adds more, and let review hold the line from there.

## It's working if

- New code reads form values, cookies and `JSON.parse` output through a guard or a schema, not `as`.
- Each ID type has one schema that brands it, and no cast helper like `asOrgId`.
- `code-review`'s Standards report cites these rules on TypeScript diffs.

## Where it fits

Vocabulary underneath the main flow, beside [codebase-design](https://aihero.dev/skills-codebase-design): that skill shapes modules, this one shapes the types inside them. [ask-matt](https://aihero.dev/skills-ask-matt) maps the rest.
