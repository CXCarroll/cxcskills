## What it does

`adopt-design` makes a finished set of Claude Design boards the repo's **source of truth for how the app looks**. It files the boards as references, turns their exact values into one token file, writes a design README that maps every view to its board, and adds the UI rules to `CODING_STANDARDS.md`, where [code-review](https://aihero.dev/skills-code-review) enforces them. One rule settles every conflict between the boards and the spec: the spec wins on behaviour, the boards win on look.

## When to reach for it

You invoke this by typing `/adopt-design`, and the agent won't reach for it on its own. Reach for it when the boards from [to-views](./to-views.md) are tweaked and right, and again whenever the canvas changes.

## Prerequisites

The canvas link or a folder of exported boards. The `views.md` from [to-views](./to-views.md) lets it map boards to screens without asking you.

## The divergences table

Boards always show a few things the spec rules out: a search box the first version doesn't have, a toggle for a feature that was cut. The skill finds each one, proposes the default (build the spec's behaviour, keep the board's look), and records what you decide in the README's divergences table, so no later ticket builds the board's version by mistake.

## Common questions

**Why copy the boards into the repo if the canvas already has them?**
The agents building the app read the repo, and a snapshot pins the look a ticket was built against. The README's snapshot line and sync steps keep the two in step, and the look always changes on the canvas first.

## It's working if

- `tokens.css` (or the export's own token file) holds every value, and no component carries a raw colour or radius.
- `code-review` flags a screen that drifts from its board.
- `/to-tickets` cuts a UI foundation ticket first, and each UI ticket names the board it matches.

## Where it fits

A chain step after [to-views](./to-views.md) and the Claude Design boards, before [to-tickets](https://aihero.dev/skills-to-tickets). Rerun it to sync after any change to the canvas. [ask-matt](https://aihero.dev/skills-ask-matt) maps the rest.
