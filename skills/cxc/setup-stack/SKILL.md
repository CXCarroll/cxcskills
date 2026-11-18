---
name: setup-stack
description: Set up a SvelteKit app on the cxcskills stack (Bun, TypeScript, Oxlint, svelte-check, Vitest, Playwright, lefthook, the Svelte MCP, optional Drizzle, Better Auth and Effect), with settled versions checked for conflicts and every quality gate proven to fail on a planted violation.
disable-model-invocation: true
allowed-tools:
  - "Bash(${CLAUDE_SKILL_DIR}/scripts/resolve-versions.ts *)"
  - "Bash(${CLAUDE_SKILL_DIR}/scripts/prove-gates.sh *)"
---

# Setup stack

Turn an empty folder, or an existing SvelteKit app, into one whose quality gates are wired in and proven. A **gate** is a check that runs without anyone remembering it: a `package.json` script that CI runs, or a git or Claude Code hook. A gate counts only once it has passed on the clean tree and failed on a planted violation.

Run it once per app, before `/setup-matt-pocock-skills` and `/grill-with-docs`. Running it again on a set-up app is safe: each step merges into what is there.

## 1. Is there an app?

Look for `@sveltejs/kit` in `package.json`. If it is there, skip to step 3: you are bringing an existing app up to the stack, so merge into its files, never overwrite them.

If it is not, the first thing you say is the question **"Shall I template a SvelteKit project?"**, with three answers:

- **Yes, you run it.** You run `sv create` with every option set, so it never prompts.
- **I'll run it myself.** You print the same command. The user runs it in a terminal tab (Claude's command runner can't answer `sv`'s prompts) and says "done". They may change answers at the prompts; read the result in step 3 rather than assuming your options.
- **No.** Stop.

On either yes, ask the stack choices in one message (use AskUserQuestion when you have it):

| Choice | Default | Adds |
| --- | --- | --- |
| Database | Postgres through Drizzle | `drizzle="database:postgresql+client:postgres.js+docker:yes"` |
| Auth | none | `better-auth="demo:none"` (needs the database) |
| Effect | no | step 4 |
| Deploy adapter | `node` (Railway, Docker) | `sveltekit-adapter="adapter:<node, bun, cloudflare, auto>"` |

Create into the current folder when it holds nothing but `.git` and dotfiles; otherwise ask for a folder name. Resolve `sv` itself first (step 2's script with `sv` as the argument), then run `bunx sv@<settled> create --help`. Add-on options change between `sv` releases, and an option left unset makes `sv` prompt, so set every option the help lists for each add-on you pass. As of `sv` 1.3:

```bash
bunx sv@<settled> create <folder> --template minimal --types ts \
  --add prettier vitest="usages:unit,component" playwright="demo:no" sveltekit-adapter="adapter:node" \
  ai-tools="ide:claude-code+delivery:tools+tools:mcp+mcpSetup:local+optInSkills:none" \
  <database and auth add-ons> --install bun
```

Later releases add options (1.5 added `agentsMd`; set it to `no`, since step 3 writes the agent notes). An option the settled `sv` doesn't list is an error, so don't pass one the help doesn't show.

`ai-tools` is Svelte's official way to add the Svelte MCP: it writes `.mcp.json` in the app. It can also install Svelte's own skills (`svelte-core-bestpractices`, `svelte-code-writer`); add them to `tools:` only if the user asks.

## 2. Settle the versions

**Settled** means a stable release on npm's `latest` tag that has been out at least seven days: brand-new releases are where most regressions and supply-chain attacks surface. The script picks settled versions and checks the whole set for peer and engine conflicts:

```bash
${CLAUDE_SKILL_DIR}/scripts/resolve-versions.ts                    # audit the app's installed dependencies
${CLAUDE_SKILL_DIR}/scripts/resolve-versions.ts oxlint oxlint-tsgolint lefthook   # resolve new tools against them
```

- **Audit first.** `sv` installs whatever is newest, often a release from that morning. Step each package the audit flags back to its settled version with `bun add -d <pkg>@<version>` (no `-d` for packages under `dependencies`). Bun pins an exact version when given one, which is the point.
- **Then resolve the tools `sv` doesn't add** (`oxlint oxlint-tsgolint lefthook`, plus `effect` in step 4) and install them with the script's `Install:` line.
- **Fix conflicts by the hints**, preferring to step the newer package back. Never cross a major version to fix one without asking the user. TypeScript stays within the range `svelte-check` declares (6.x at the time of writing; 7 is the Go compiler).
- **Peer metadata is advisory.** Older releases often declare looser ranges than they can honour (an old `svelte-check` claims any TypeScript from 5 up). Only step 5 proves a set works.

If the registry can't be reached, use the versions in [references/KNOWN-GOOD.md](references/KNOWN-GOOD.md) and say so.

## 3. Apply the stack

Copy each template from [templates/](templates/) unless the app already has the file; when it does, merge the missing parts in and show the user what changed.

| Template | Goes to | Notes |
| --- | --- | --- |
| `oxlintrc.json`, `oxlintrc.type-aware.json` | `.oxlintrc.json`, `.oxlintrc.type-aware.json` | Lints `.ts`, `.js` and the `<script>` of `.svelte` files. Templates are svelte-check's job. |
| `lefthook.yml`, `lefthook/pre-push/block-push-to-main.sh` | `lefthook.yml`, `.lefthook/pre-push/` | Run `git init` first if there is no repo. |
| `claude/hooks/block-dangerous-git.sh` | `.claude/hooks/`, executable | Needs `jq`. Refuses force pushes, pushes to `main`, and commands that destroy work. |
| `claude/settings.json` | `.claude/settings.json` in the app | Merge the hook entry into the app's file. Never touch the user's own `~/.claude` settings. |
| `github/workflows/ci.yml` | `.github/workflows/ci.yml` | Add jobs for each gate the app gains later (integration tests, e2e). |

Then:

- **Scripts.** Set these in `package.json`, keeping any the app already has:
  - `"prepare": "svelte-kit sync && lefthook install"`
  - `"format:check": "prettier --check ."`
  - `"lint": "oxlint --deny-warnings"`
  - `"lint:types": "oxlint -c .oxlintrc.type-aware.json --type-aware --deny-warnings"`
  - `"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --fail-on-warnings"`
  - `"test:unit": "vitest --run"`, `"test:unit:watch": "vitest"`
  - `"check:all": "bun run format:check && bun run lint && bun run lint:types && bun run check"`

  `sv` points `lint` at Prettier; it now runs Oxlint and `format:check` runs Prettier. Replace `npm run` with `bun run` in `package.json` and `playwright.config.ts`. Run `bun run prepare` to install the hooks.
- **Strict TypeScript.** Add `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride` and `noFallthroughCasesInSwitch` to `compilerOptions` in `tsconfig.json`.
- **Environment.** SvelteKit 3 declares variables in `src/env.ts` with `defineEnvVars` and validates them, with any Standard Schema validator, at build and at startup. Code imports them from `$app/env/private` or `$app/env/public`; the Oxlint config bans `$env/*` and `process.env` with a message that says so. Keep `.env.example` listing every declared variable with a placeholder, because CI's build copies it to `.env`.
- **Guardrails.** Call the Skill tool with "lint-guardrails" and follow its Oxlint path to add the starter Svelte bans.
- **Agent notes.** Append [templates/claude-md-lines.md](templates/claude-md-lines.md) to the app's `CLAUDE.md` (or `AGENTS.md`, whichever the app uses), creating it if needed.
- **Browser support.** Those notes carry a `**Browser Support:**` line, the policy Chrome's Modern Web Guidance reads to decide when a newer feature needs a fallback. The default is "Baseline widely available", which matches Vite's default build target. Ask whether the app's users need anything older (locked-down corporate browsers, an embedded webview), and write their answer into the line.
- **Modern Web Guidance.** If the user hasn't installed it, suggest Chrome's skill plugin, which steers agents to built-in platform features (`<dialog>`, popovers, anchor positioning) instead of hand-rolled code and extra libraries: `claude plugin install modern-web-guidance@claude-plugins-official`. Its searches run `npx -y modern-web-guidance@latest`, so they fetch the newest release on every call: the one place the stack doesn't use settled versions. In an existing app, offer its `legacy-scan` audit once setup is done.

Run `bunx prettier --write .`, then `bun run check:all`. When a gate fails on a file `sv` generated, fix the file; never loosen a rule to get green. (Example: `vitest-browser-svelte` 3 made `render` async, and the type-aware pass flags `sv`'s example test until it is awaited.) If a rule looks wrong for this app, ask the user.

## 4. Effect (optional, default no)

Effect earns its place in server code with many failure modes, retries, resources and services to swap in tests. It stays out of components and route files, which call into it.

1. Resolve and install `effect` as a runtime dependency.
2. Copy `templates/effect/runtime.ts` and `runtime.test.ts` to `src/lib/server/`, and `templates/effect/hooks.server.ts` to `src/hooks.server.ts` (merge if it exists). The runtime builds the app's services once from a `Layer`; `run(program)` is the one bridge from `load`, actions and `+server.ts` handlers into Effect; the shutdown hook disposes it. The `Clock` service is a starting example: replace it with the app's first real service.
3. Add the Effect docs MCP to `.mcp.json` beside `svelte`: `{ "type": "stdio", "command": "npx", "args": ["-y", "effect-mcp"] }`. Check that its answers cover the installed Effect major; if they don't, leave it out and say so.
4. Write an ADR (`docs/adr/`, per the repo's layout) recording the choice, the version, and the boundary: Effect in `src/lib/server`, plain TypeScript at the edges.

## 5. Prove it

```bash
bun run check:all && bun run test:unit && bun run build
${CLAUDE_SKILL_DIR}/scripts/prove-gates.sh
```

The build needs every variable in `src/env.ts`; use `.env` (copied from `.env.example` if missing). The test run needs Playwright's Chromium (`bunx playwright install chromium`).

`prove-gates.sh` runs each gate on the clean tree, then plants one violation for it under `src/lib/__gate_probe__/` and expects a failure: Prettier, Oxlint on `.ts` and on a `.svelte` script, the type-aware pass, svelte-check errors and warnings, Vitest, the `$effect` guardrail, the pre-commit hook, the pre-push hook on `main`, and the Claude git hook (which must still allow a feature branch). Probes are removed on exit. Run it with nothing staged: the pre-commit probe refuses to run beside the user's staged changes, since the hook would reformat them. Every row must read `ok`; show the user the table.

When a gate fails on the clean tree after a version change, step that package back one settled version, rerun, and note why in step 6.

## 6. Record it

Write `docs/STACK.md` from [references/STACK-FORMAT.md](references/STACK-FORMAT.md): every direct dependency's version, each one held back and why, the gate table from step 5, and the date. The lockfile is the exact record; `STACK.md` is the reasoning. Offer to commit both with the setup; don't commit unasked.

If this run proved a set newer than [references/KNOWN-GOOD.md](references/KNOWN-GOOD.md), tell the user, so they can update it in their cxcskills clone.

## 7. Hand off

Next: `/setup-matt-pocock-skills` for the issue tracker, labels and doc layout, then `/grill-with-docs` to start the spec. If the user runs `sol-loop`, `council` or `ui-hill-climb`, add the `## Model delegates` table those skills read (call the Skill tool with "model-delegates" for its format).

To upgrade later, run the audit again (`resolve-versions.ts` with no arguments), move what it shows, and rerun step 5.
