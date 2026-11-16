---
name: lint-guardrails
description: Lint rules that ban a pattern agents misuse, with an error that names the fix, wired into the pre-commit hook and ratcheted so existing code doesn't block a commit. Includes starter bans for SvelteKit and Svelte 5 (`$effect`, raw timers). Use when adding or changing a lint rule, banning an API or pattern, setting up ESLint in a repo, or turning a repeated correction into a check.
metadata:
  credits:
    skill: "the lint rules from \"turning slop into gold\" and pstack's correct and encode-lessons-in-structure"
    author: Lauren Tan (poteto)
    url: "https://github.com/cursor/plugins/tree/main/pstack/skills"
---

# Lint guardrails

A **guardrail** is a check that runs without anyone remembering it: the pre-commit hook, and CI if the repo has it. A lint rule is a guardrail only once it is wired in, and it is a good one only when its error tells the agent what to do instead. An agent that hits "X is banned" works around the ban; an agent that hits "use Y from `src/lib/y.ts`" uses Y.

## 1. Find the repo's guardrail

Read `eslint.config.js` (flat config), the `lint` script in `package.json`, `.husky/pre-commit`, the lint-staged config (`.lintstagedrc*` or `lint-staged` in `package.json`), and `.github/workflows/`. Then name the gap, if any:

- **ESLint never runs at commit.** A common default is lint-staged running only Prettier, so ESLint runs only when someone types `bun run lint`. Add a key for code files to the lint-staged config, beside the existing Prettier key:

  ```json
  "*.{js,ts,svelte}": "eslint --no-warn-ignored"
  ```

  `--no-warn-ignored` stops ESLint warning about staged files its config ignores. ESLint only reads files, so it can run beside Prettier.
- **No hook at all.** Set one up with Husky and lint-staged, then add the key above.
- **No ESLint.** Set up the flat config from the framework's own template (for SvelteKit, `bunx sv add eslint`), then come back here.

## 2. Write the rule

Use an existing rule when one fits and its message can name the fix: the Svelte plugin, typescript-eslint, or core `no-restricted-imports`. Otherwise add a rule to the repo's local plugin, `eslint/guardrails.js`. Start that file from [references/guardrails.js](references/guardrails.js), which defines the plugin, its scoping, and the two starter rules below.

- **The message names the fix.** Lead with the positive target: what to call, compute, or import, and from where. Then say where the rare legitimate use lives.
- **Give the legitimate use a home.** A folder where the rule is off, holding the few helpers that own the pattern (an effect that syncs a third-party widget, a debounce that clears itself). Product code calls the helper. The rule's message names the folder.
- **Scope with `files` and `ignores`.** Server code and tests usually play by different rules from client code.
- **One object per restricted list.** `no-restricted-syntax`, `no-restricted-globals` and `no-restricted-imports` don't merge across config objects: a later object replaces the whole list for the files it matches. Keep each list in one place, or write a named rule in the local plugin instead.

## 3. Starter rules for SvelteKit and Svelte 5

Copy [references/guardrails.js](references/guardrails.js) to `eslint/guardrails.js`, import it in `eslint.config.js`, and spread it in after the Svelte configs. Set `EFFECT_HOME` and `TIMER_HOME` at the top of the file to folders that suit the repo.

| Rule | Bans | The fix its error names |
| --- | --- | --- |
| `guardrails/no-effect` | `$effect`, `$effect.pre`, `$effect.root` outside the effect home | `$derived` for values, the event handler for user actions, `load` or `{#await}` for data, `{@attach}` for DOM behaviour; a real outside sync as a helper in the effect home |
| `guardrails/no-timers` | `setTimeout`, `setInterval`, `requestAnimationFrame`, `requestIdleCallback` (also on `window`, `globalThis`, `self`) in client code outside the timer home | `await tick()` to wait for the DOM, transitions or `svelte/motion` to animate, fixing the update order; a real schedule as a self-clearing helper in the timer home |

Both skip server code (`src/lib/server/`, `*.server.ts`, `+server.ts`) and tests. `no-timers` also skips a function that shadows the global's name. Both fire inside markup expressions as well as `<script>`.

The server and client split needs no rule: SvelteKit already refuses to let client code import `$lib/server/*` or `*.server.ts` modules. Keep server-only code there and the framework enforces it.

## 4. Ratchet existing code

When the pattern is already common, ban it for new code without a big refactor first. ESLint's bulk suppressions record today's count per file and rule:

```bash
bunx eslint . --suppress-rule guardrails/no-effect --suppress-rule guardrails/no-timers
```

Commit the `eslint-suppressions.json` this writes. From then on:

- **A new occurrence fails**, even in a file that already has suppressed ones (its count went up).
- **Fixing an old occurrence also fails**, until `bunx eslint . --prune-suppressions` lowers the count. Commit the pruned file with the fix. Counts only go down.

Name each rule with `--suppress-rule`, never `--suppress-all`, which would also hide unrelated errors. Never add `--pass-on-unpruned-suppressions` to the hook: it lets counts drift back up.

## 5. Prove it

A rule you have never seen fail proves nothing. For each new rule:

1. **Red:** write or restore one real example of the mistake, run `bunx eslint <file>`, and see the error with its message.
2. **Home:** the same code in the rule's home folder, and in server code where the rule skips it, passes.
3. **Hook:** stage the red example and run `bunx lint-staged`. The commit is refused.
4. **Clean:** remove the example; `bunx eslint .` passes (after the ratchet, if there was one).

If the repo's `CODING_STANDARDS.md` has an `## Enforced rules` table, add a row for the rule, and delete any written rule or `CLAUDE.md` line it replaces.

An exception goes on the line, with its reason after `--`, and only with the user's approval:

```ts
// eslint-disable-next-line guardrails/no-timers -- third-party widget needs one frame after mount
```
