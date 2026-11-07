## What it does

`sol-loop` has OpenAI's Sol model review your change in a short loop: Sol finds bugs, the agent fixes the real ones and pushes back on the rest, and Sol checks again until the two agree. The loop is **budgeted** to 3 rounds (5 for security, auth, data loss or concurrency), and it is built to keep the diff small: a finding about another path, a rare case or a small cost counts as a nit, and declined nits are listed as follow-ups rather than fixed.

## When to reach for it

You invoke this by typing `/sol-loop`, and the agent won't reach for it on its own. Reach for it after [code-review](https://aihero.dev/skills-code-review) and before the PR, when you want a second model to hunt bugs in the diff.

| Your situation | Reach for |
| --- | --- |
| One cross-provider bug hunt, cheap and quick | This skill |
| Three providers, scored, for a change where a miss is expensive | [council](./council.md) |

## Prerequisites

The Codex CLI, signed in with ChatGPT. The skill runs it read-only through [model-delegates](./model-delegates.md). With no settings it uses Codex's own default model. To pin Sol, set the `Sol reviewer` line in your `## Model delegates` settings.

## The ledger

Every finding gets an id, a severity (blocker, should, nit), and an outcome: fixed, disagreed with evidence, or declined. Later rounds see only the ledger and the code that changed. The loop stops on agreement, or hands you both sides when an item stays disputed or the budget runs out. A timeout or a missing reply is never counted as approval.

## Common questions

**Does it need T3 Code?**
No. The source skill used T3 Code's delegation; this version runs Sol through the Codex CLI in its read-only sandbox, and a guard fails the run if the working tree changed.

## It's working if

- The final report lists rounds, the model as Codex reported it, and each finding with its outcome.
- The diff is the same size or smaller after the loop.
- Nothing was pushed unless you asked.

## Where it fits

A chain step after [code-review](https://aihero.dev/skills-code-review) and before [pr](https://aihero.dev/skills-pr). [ask-matt](https://aihero.dev/skills-ask-matt) maps the rest.
