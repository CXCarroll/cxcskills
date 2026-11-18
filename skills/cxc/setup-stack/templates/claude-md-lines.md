## Stack

SvelteKit 3 and Svelte 5 on Bun, TypeScript strict. Versions and why any are held back: `docs/STACK.md`.

- Svelte 5 runes only. Use the Svelte MCP's autofixer on every component you write or change.
- Import from `src/lib` through `#lib` with a file extension (`#lib/server/db.js`). SvelteKit 3 removed `$lib`.
- Environment variables are declared in `src/env.ts` and imported from `$app/env/private` or `$app/env/public`, never `process.env` or `$env/*`.
- Server-only code lives in `src/lib/server`; SvelteKit refuses to bundle it for the browser.
- Route handlers and components stay thin; logic lives in plain modules under `src/lib/server`.

## Gates

- Before saying work is done, run `bun run check:all` and `bun run test:unit`.
- Never weaken a gate to get green: no `--no-verify`, no disabled rules, no `as` or `!` to quiet the type checker. If a rule looks wrong, ask.
- Pushes go to a branch, never `main`; changes reach `main` through a pull request.
