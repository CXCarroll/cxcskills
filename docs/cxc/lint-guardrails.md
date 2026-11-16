## What it does

`lint-guardrails` adds lint rules that ban a pattern agents misuse, with an error message that names the fix. A rule only counts once it runs on every commit, so the skill also wires ESLint into the pre-commit hook (many repos run only Prettier there). When the pattern is already common, it **ratchets** the rule: existing occurrences are recorded, new ones fail, and the count can only go down.

## When to reach for it

Type `/lint-guardrails`, or the agent reaches for it automatically when it adds a lint rule, bans an API, or sets up ESLint. [correct](./correct.md) calls it for the lint rung of its ladder.

## The starter bans

For SvelteKit and Svelte 5, the skill ships a small local ESLint plugin with two rules:

| Rule | Why | What the error says to do instead |
| --- | --- | --- |
| `no-effect` | `$effect` needs judgement to use well, and agents reach for it to sync state that should be derived | `$derived`, the event handler, `load` or `{#await}`, `{@attach}`; a real outside sync goes in a helper folder |
| `no-timers` | `setTimeout` and friends in client code usually paper over an ordering problem | `await tick()`, transitions, fixing the update order; a real schedule goes through a self-clearing helper |

Each rule has a home folder where it is off, so the few legitimate uses live behind a helper that product code calls. Server code and tests are exempt. The server and client import split needs no rule, because SvelteKit already enforces it.

## Common questions

**Won't this break the build on an existing app?**
No. The ratchet uses ESLint's bulk suppressions file, so only new occurrences fail. Fixing an old one asks you to prune the file, which lowers the count for good.

**Why a local plugin instead of `no-restricted-syntax`?**
The core restricted-list rules don't merge across config objects, so a second list silently replaces the first. Named rules also give the ratchet one count per pattern.

## It's working if

- A commit that adds a banned pattern is refused, and the error tells the agent what to write instead.
- The suppressions file only ever shrinks.
- Agents stop leaving comments explaining why their workaround is fine.

## Where it fits

Model-invoked vocabulary underneath [correct](./correct.md) and beside [typescript-best-practices](./typescript-best-practices.md). [ask-matt](https://aihero.dev/skills-ask-matt) maps the rest.
