## What it does

`council` puts the same review or question to three models from three different providers, collects their findings and scores out of 10, fixes what they agree on, and asks again until they are satisfied or the 3-round budget runs out. Each member reviews alone and read-only. The agent's job between rounds is to fight scope creep, so repeated reviews do not quietly grow the change.

## When to reach for it

You invoke this by typing `/council`, and the agent won't reach for it on its own. Reach for it when a miss is expensive: auth, payments, data migrations, a design you are about to build on.

| Your situation | Reach for |
| --- | --- |
| One cross-provider bug hunt | [sol-loop](./sol-loop.md) |
| Three providers and a scored verdict | This skill |
| Shaping a new module before any code exists | [codebase-design](https://aihero.dev/skills-codebase-design) |

## Prerequisites

Three members from your `## Model delegates` settings (see [model-delegates](./model-delegates.md)). Claude joins as a [subagent](https://www.aihero.dev/ai-coding-dictionary/subagent), OpenAI through the Codex CLI, and the third provider through any CLI you configure. Without a third member configured, council reports it and stops, unless you name the members in your request ("council with Claude and GPT").

## The score table

When the work ends in a PR, the scores go into the PR description as a table, one row per member and one column per round, so a reviewer sees how the change converged. A member that gives no score is shown as `no score`, never guessed.

## Common questions

**Can I run it with two providers?**
Yes, by naming the two members in your request. With no names it insists on three, and reports a missing one instead of substituting another model.

## It's working if

- Each round's findings come back from three different providers, each checked against the code before anything changes.
- Scores rise across rounds while the diff stays the same size.
- The loop ends on agreement, or on the budget with the open items listed for you.

## Where it fits

A chain step after [code-review](https://aihero.dev/skills-code-review), in place of [sol-loop](./sol-loop.md) when the stakes are higher. [ask-matt](https://aihero.dev/skills-ask-matt) maps the rest.
