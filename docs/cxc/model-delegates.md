## What it does

`model-delegates` runs one read-only task, usually a review, on a model from another provider and brings the reply back with a record of what ran. A **delegate** is one model given one self-contained brief. The defining constraint is that a delegate never changes anything: the Codex route runs in Codex's read-only sandbox, and a guard fingerprints the git working tree before and after every run and fails the run if anything moved.

## When to reach for it

Type `/model-delegates`, or the agent reaches for it automatically when you ask what another model thinks, or when [sol-loop](./sol-loop.md), [council](./council.md) or [blast-radius](./blast-radius.md) need a reviewer from another provider.

## Prerequisites

Settings in a `## Model delegates` section of `CLAUDE.md` or `AGENTS.md`, naming each member's route, model and effort, plus the `Sol reviewer` and `Council` lines. The skill's `SKILL.md` has the format and the defaults.

| Route | Needs |
| --- | --- |
| `subagent` | Claude Code. Runs a Claude model as a [subagent](https://www.aihero.dev/ai-coding-dictionary/subagent) with a fresh context window |
| `codex` | The Codex CLI, signed in |
| `cmd` | Any CLI that reads the brief on stdin and prints its reply, run with its own read-only flags |

## The run record

Every run gets a folder outside the repo holding the brief, the reply, the provider's raw output, and a `meta.txt` with the model as the provider reported it, the effort, token usage when reported, the exit status and the guard's verdict. Reports quote that file instead of guessing which model answered.

## Common questions

**What happens if a member isn't available?**
The skill reports the blocker and stops that member. It never swaps in a different model, since the point of a named delegate is to hear from that model.

## It's working if

- Every delegate's reply arrives with a run folder and a `meta.txt` you can open.
- `git status` is the same before and after a review round.
- A missing CLI or a failed sign-in shows up as a named blocker, not a silent fallback.

## Where it fits

Machinery underneath [sol-loop](./sol-loop.md), [council](./council.md) and [blast-radius](./blast-radius.md). [ask-matt](https://aihero.dev/skills-ask-matt) maps the rest.
