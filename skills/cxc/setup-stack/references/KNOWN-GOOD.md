# Known-good versions

The last set proven together by a full setup-stack run: `check:all`, unit and component tests, build, a boot, and every row of `prove-gates.sh` reading `ok`. Use it when the registry can't be reached, or as the fallback when a fresh resolution won't go green. Update it when a run proves a newer set.

Proven 2026-11-18, with Bun 1.4.4, Node 22.23 and `sv` 1.3.0 (1.5.0 also passed). Database Postgres through Drizzle, adapter node; Effect and Better Auth checked in separate runs.

| Package | Version |
| --- | --- |
| @sveltejs/kit | 3.2.0 |
| @sveltejs/adapter-node | 6.0.2 |
| @sveltejs/vite-plugin-svelte | 7.3.1 |
| svelte | 5.57.3 |
| svelte-check | 4.7.8 |
| typescript | 6.0.3 |
| vite | 8.3.8 |
| vitest | 5.1.0 |
| @vitest/browser-playwright | 5.1.0 |
| vitest-browser-svelte | 3.1.0 |
| @playwright/test | 1.65.0 |
| playwright | 1.65.0 |
| prettier | 3.9.10 |
| prettier-plugin-svelte | 4.1.1 |
| oxlint | 1.93.0 |
| oxlint-tsgolint | 7.0.2006 |
| lefthook | 2.2.2 |
| drizzle-orm | 0.45.4 |
| drizzle-kit | 0.31.11 |
| postgres | 4.1.0 |
| effect | 4.1.4 |
| @types/node | 22.20.5 |

Pairings that broke or nearly broke on that date:

- `svelte-check` 4.7.8 accepts TypeScript `^5 || ^6`; npm's `latest` TypeScript was 7.0.2.
- `oxlint` 1.94.0 requires `oxlint-tsgolint` 7.0.2007 or later; both were under a week old, so the pair stepped back together to 1.93.0 and 7.0.2006.
- SvelteKit 3.3.1, `prettier-plugin-svelte` 4.2.0 and `sv` 1.5.0 shipped the day of the run and were held back. `sv` 1.5.0 added the `agentsMd` option, which 1.3.0 rejects.
