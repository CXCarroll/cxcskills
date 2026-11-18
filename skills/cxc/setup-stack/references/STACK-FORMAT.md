# docs/STACK.md format

Write `docs/STACK.md` in the app like this. Keep it to what a person upgrading the stack next month needs.

```markdown
# Stack

Set up on <date> with `/setup-stack`. Settled means a stable release on npm's `latest` tag, out at least seven days.
The lockfile pins exact versions; this file records the choices.

## Versions

| Package | Version | Note |
| --- | --- | --- |
| @sveltejs/kit | 3.2.0 | held back: 3.3.1 was 0 days old |
| typescript | 6.0.3 | held at 6.x: svelte-check accepts ^5 or ^6 |
| oxlint | 1.93.0 | |

## Choices

- Database: Postgres through Drizzle (`postgres.js` client)
- Auth: none
- Effect: no
- Adapter: node

## Gates

<the table prove-gates.sh printed>

## Upgrading

Run `resolve-versions.ts` from the setup-stack skill with no arguments, move what it flags, then rerun
`bun run check:all`, `bun run test:unit`, `bun run build` and `prove-gates.sh`. Update this file.
```

List every direct dependency, not only the held-back ones, so a diff of this file shows what moved.
