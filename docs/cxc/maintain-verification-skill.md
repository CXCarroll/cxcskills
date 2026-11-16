## What it does

`maintain-verification-skill` keeps a `verify-<app>` skill honest as the app changes. Subagents read the source for every feature in the map, then one live session drives every feature in the running app, and the pass ends **clean**, **changed** (one PR of proven fixes to the map or driver) or **blocked**. It never edits product code: a feature that stopped working is reported as a regression, not written out of the map.

## When to reach for it

You invoke this by typing `/maintain-verification-skill`, and the agent won't reach for it on its own. Reach for it after a run of feature work, or when an agent's verification fails for reasons that turn out to be the map rather than the app.

## Prerequisites

A verification skill made by [create-verification-skill](./create-verification-skill.md), or any project skill with launch and drive steps and a `features/` map.

## Drift versus regression

Every mismatch gets one label:

| What it finds | What happens |
| --- | --- |
| The map describes the feature wrongly or misses one | Doc drift: fixed in the PR |
| The feature works but the driver can't reach it | Harness gap: driver fixed and re-driven live |
| The feature is broken | Product gap: reported to you, kept out of the PR |

## It's working if

- Each pass reports which features it drove and with what evidence.
- New screens show up in the map soon after they ship.
- Regressions arrive as reports, never as quiet edits to the map.

## Where it fits

Periodic upkeep beside [create-verification-skill](./create-verification-skill.md). [ask-matt](https://aihero.dev/skills-ask-matt) maps the rest.
