# cxc

Skills added in this fork, adapted from Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack) and Theo Browne's [tstack](https://github.com/t3dotgg/tstack). Each `SKILL.md` names its source in `metadata.credits`.

## User-invoked

Reachable only when you type them (Claude Code: `disable-model-invocation: true`; Codex: `policy.allow_implicit_invocation: false` in `agents/openai.yaml`).

- **[sol-loop](./sol-loop/SKILL.md)**: Review the current change with OpenAI's Sol model in a short loop until you both agree.
- **[council](./council/SKILL.md)**: Get a review or feedback from three models from different providers, and loop until they agree.
- **[blast-radius](./blast-radius/SKILL.md)**: Find what a change could break outside its diff, and prove the one fact it is safe because of by running real code.

## Model-invoked

Model- or user-reachable (rich trigger phrasing so the model can reach for them).

- **[typescript-best-practices](./typescript-best-practices/SKILL.md)**: Type-design rules for TypeScript and Svelte: discriminated unions, branded IDs from a verifying parse, parsing at boundaries, no `as` or `!`, exhaustive switches. `code-review` loads it for TypeScript diffs.
- **[model-delegates](./model-delegates/SKILL.md)**: Run a read-only task on a model from another provider (Codex CLI, a Claude subagent, or any CLI you configure) and keep a record of what ran. `sol-loop`, `council` and `blast-radius` use it.
