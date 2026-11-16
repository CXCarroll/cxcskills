## What it does

`create-verification-skill` writes a skill for one app, `verify-<app>`, that launches it in isolation, uses it the way a user does, and captures proof: screenshots, ARIA snapshots, database rows. It does not write tests. It gives every later agent a shared **driver** script and a **feature map** (one file per user-facing feature: how to reach it, how to drive it, what end state proves it works), so agents verify their own changes in the running app instead of improvising a harness each time.

## When to reach for it

You invoke this by typing `/create-verification-skill`, and the agent won't reach for it on its own. Reach for it once per app, when the app runs end to end but has no scripted way to prove a feature works. The skill it generates is model-invoked, so agents then reach for that while building.

## Prerequisites

The app must build and start from the checkout. The skill writes into `.claude/skills/verify-<app>/` (linked into `.agents/skills/` for Codex). It seeds the feature map from `docs/design/views.md` if [to-views](./to-views.md) made one.

## The feature map

The map is the app described from the user's side: "the filter in the tenant list", not a component name. That gives you and the agents the same words, and gives each feature a recipe with real selectors and a proof standard: the action and the resulting state, side effects included, never a test-only shortcut. The skill runs its own output once end to end before handing it over, because a verification skill that was never run is a draft.

## Common questions

**My app already has a QA script or skill. Will this duplicate it?**
It looks for existing harnesses, QA scenario lists and project skills first, and asks whether to extend one or replace it.

**Does it work for iOS?**
Yes, with a Simulator recipe: a dedicated simulator per run, deep links, screenshots and video through `simctl`, and taps through the app's UI test target. Without a UI test target the driver reaches only deep links, and the skill says so.

## It's working if

- PRs carry screenshots and snapshots from the running app in their Evidence section.
- Agents say "verified in the app" with a path to the evidence, not "it compiles".
- You describe a bug by feature name and the agent drives straight to it.

## Where it fits

A run-once setup per app, kept current by [maintain-verification-skill](./maintain-verification-skill.md). Its driver also serves [ui-hill-climb](./ui-hill-climb.md)'s screenshots. [ask-matt](https://aihero.dev/skills-ask-matt) maps the rest.
