## What it does

`setup-stack` takes an empty folder, or an existing SvelteKit app, to the cxcskills stack: Bun, TypeScript strict, Oxlint (plain and type-aware), svelte-check, Vitest, Playwright, lefthook, CI, the Svelte MCP, a Claude Code git guardrail, and optionally Drizzle, Better Auth and Effect. A gate doesn't count until it has been seen to fail: the skill ends by planting one violation per gate and showing a table where every gate passed on the clean tree and failed on its probe.

Its first question in an empty folder is "Shall I template a SvelteKit project?". You can let it run `sv create` with every option set, or have it print the command and run it yourself in a terminal tab.

## When to reach for it

You invoke this by typing `/setup-stack`, and the agent won't reach for it on its own.

| Your situation | What it does |
| --- | --- |
| Empty folder, new app | Asks to template, scaffolds with `sv create`, then sets everything up |
| Existing SvelteKit app | Skips the scaffold and merges into the app's files, never overwriting them |
| An app it already set up, months later | The version audit shows what moved; step the packages forward and prove the gates again |

For a single new lint ban in an app that is already set up, use [lint-guardrails](./lint-guardrails.md) instead.

## Settled versions

The skill installs **settled** versions: stable releases on npm's `latest` tag that have been out at least a week, because brand-new releases are where most regressions and supply-chain attacks surface. A script checks the whole set for peer and engine conflicts and suggests fixes that stay within a major version. Peer metadata can't settle everything, since older releases often declare looser ranges than they honour, so the proof at the end is what decides.

On the day it was written, this held back SvelteKit 3.3.1 (released that morning), kept TypeScript at 6 because svelte-check doesn't accept 7, and stepped Oxlint back a release because its newest version needed a type-aware companion that was five days old.

## Common questions

**Why `sv create` instead of templates of its own?**
Svelte's CLI and its official add-ons (Prettier, Vitest, Playwright, Drizzle, Better Auth, the Svelte MCP through `ai-tools`) are maintained by the Svelte team and track SvelteKit's changes. The skill adds only what `sv` doesn't ship. That paid off at once: SvelteKit 3 replaced `$lib` with `#lib` and added a validated `src/env.ts`, and `sv`'s output already used both.

**Why can't it answer `sv`'s prompts for me?**
Claude's command runner can't type into an interactive prompt. Either let the skill set every option on the command line, or run the command yourself in a terminal tab and say "done".

**Is Effect part of the stack?**
Only if you say yes; the default is no. When added, it lives in `src/lib/server` behind one `run(program)` bridge, with an ADR recording the boundary.

**How does it work with Modern Web Guidance?**
Chrome's guidance plugin decides when a newer browser feature needs a fallback by reading a `**Browser Support:**` line in `CLAUDE.md` or `AGENTS.md`. The skill writes one (Baseline widely available, unless your users need older browsers) and suggests installing the plugin. The same notes tell agents to type new HTML attributes by extending Svelte's element types, not with the `as any` the guidance's framework tips suggest, since the stack's lint bans both `as` and `any`.

**Will it overwrite my CLAUDE.md or settings?**
It appends a short stack section to the app's `CLAUDE.md` and merges its hook into the app's own `.claude/settings.json`. It never touches your user-level Claude Code settings.

## It's working if

- The final table reads `ok` on every row, and you saw it.
- A commit with a lint error is refused locally, and a push to `main` is refused by both git and Claude Code.
- `docs/STACK.md` says which packages were held back and why, so the next upgrade starts from reasons rather than guesses.

## Where it fits

A run-once setup at the start of an app, before [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills) and [grill-with-docs](https://aihero.dev/skills-grill-with-docs). It calls [lint-guardrails](./lint-guardrails.md) for the starter Svelte bans, and the gates it proves are the ones [typescript-best-practices](./typescript-best-practices.md) and [correct](./correct.md) build on. [ask-matt](https://aihero.dev/skills-ask-matt) maps the rest.
