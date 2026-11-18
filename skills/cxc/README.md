# cxc

Skills added in this fork: some adapted from Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack) and Theo Browne's [tstack](https://github.com/t3dotgg/tstack), each naming its source in `metadata.credits`, and some written here (`model-delegates`, `to-views`, `adopt-design`, `ui-hill-climb`, `setup-stack`, and `lint-guardrails`, from the lint rules in Lauren Tan's talk).

## User-invoked

Reachable only when you type them (Claude Code: `disable-model-invocation: true`; Codex: `policy.allow_implicit_invocation: false` in `agents/openai.yaml`).

- **[setup-stack](./setup-stack/SKILL.md)**: Set up a SvelteKit app on the cxcskills stack, with settled versions checked for conflicts and every quality gate proven to fail on a planted violation.
- **[sol-loop](./sol-loop/SKILL.md)**: Review the current change with OpenAI's Sol model in a short loop until you both agree.
- **[council](./council/SKILL.md)**: Get a review or feedback from three models from different providers, and loop until they agree.
- **[blast-radius](./blast-radius/SKILL.md)**: Find what a change could break outside its diff, and prove the one fact it is safe because of by running real code.
- **[to-views](./to-views/SKILL.md)**: Turn a spec into a list of the app's views and one Claude Design brief per view, ready to prototype the screens.
- **[adopt-design](./adopt-design/SKILL.md)**: Make finished Claude Design boards the repo's source of truth for how the app looks, with tokens, a design README, and the coding standards that enforce them.
- **[ui-hill-climb](./ui-hill-climb/SKILL.md)**: Raise the app's UI quality round by round until models from different providers score every design category at a target, judged against reference apps.
- **[correct](./correct/SKILL.md)**: Turn the mistakes agents keep repeating in this repo into checks that fail, each proven red on a real past mistake.
- **[create-verification-skill](./create-verification-skill/SKILL.md)**: Generate a project-local skill that launches this app, drives it the way a user does, and captures proof, with a feature map of what to check.
- **[maintain-verification-skill](./maintain-verification-skill/SKILL.md)**: Audit the repo's verification skill against the app as it is now, drive every mapped feature live, and ship one PR of proven corrections.

## Model-invoked

Model- or user-reachable (rich trigger phrasing so the model can reach for them).

- **[typescript-best-practices](./typescript-best-practices/SKILL.md)**: Type-design rules for TypeScript and Svelte: discriminated unions, branded IDs from a verifying parse, parsing at boundaries, no `as` or `!`, exhaustive switches. `code-review` loads it for TypeScript diffs.
- **[model-delegates](./model-delegates/SKILL.md)**: Run a read-only task on a model from another provider (Codex CLI, a Claude subagent, or any CLI you configure) and keep a record of what ran. `sol-loop`, `council` and `blast-radius` use it.
- **[lint-guardrails](./lint-guardrails/SKILL.md)**: Lint rules that ban a pattern agents misuse, with an error that names the fix, wired into the pre-commit hook and ratcheted for existing code. Works with ESLint or Oxlint. Starter bans for Svelte 5's `$effect` and raw timers. `correct` and `setup-stack` use it.
