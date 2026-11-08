# cxc

Skills added in this fork: some adapted from Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack) and Theo Browne's [tstack](https://github.com/t3dotgg/tstack), each naming its source in `metadata.credits`, and some written here (`model-delegates`, `to-views`, `adopt-design`).

## User-invoked

Reachable only when you type them (Claude Code: `disable-model-invocation: true`; Codex: `policy.allow_implicit_invocation: false` in `agents/openai.yaml`).

- **[sol-loop](./sol-loop/SKILL.md)**: Review the current change with OpenAI's Sol model in a short loop until you both agree.
- **[council](./council/SKILL.md)**: Get a review or feedback from three models from different providers, and loop until they agree.
- **[blast-radius](./blast-radius/SKILL.md)**: Find what a change could break outside its diff, and prove the one fact it is safe because of by running real code.
- **[to-views](./to-views/SKILL.md)**: Turn a spec into a list of the app's views and one Claude Design brief per view, ready to prototype the screens.
- **[adopt-design](./adopt-design/SKILL.md)**: Make finished Claude Design boards the repo's source of truth for how the app looks, with tokens, a design README, and the coding standards that enforce them.

## Model-invoked

Model- or user-reachable (rich trigger phrasing so the model can reach for them).

- **[typescript-best-practices](./typescript-best-practices/SKILL.md)**: Type-design rules for TypeScript and Svelte: discriminated unions, branded IDs from a verifying parse, parsing at boundaries, no `as` or `!`, exhaustive switches. `code-review` loads it for TypeScript diffs.
- **[model-delegates](./model-delegates/SKILL.md)**: Run a read-only task on a model from another provider (Codex CLI, a Claude subagent, or any CLI you configure) and keep a record of what ran. `sol-loop`, `council` and `blast-radius` use it.
