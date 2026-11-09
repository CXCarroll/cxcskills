## What it does

`ui-hill-climb` turns "make the UI better" into a score agents can push up. Every round it captures the same screenshots the same way, has models from different providers score them in fixed design categories, fixes what they agree on, and goes again until every judge scores every category at your target. Judges always see screenshots of **reference apps** beside yours: without them, scores inflate, and a UI that looks like a 9 on its own often scores a 7 next to the apps it competes with.

## When to reach for it

You invoke this by typing `/ui-hill-climb`, and the agent won't reach for it on its own. Reach for it when an app works but doesn't look good enough, or when you want it to look better than specific apps.

| Your situation | Reach for |
| --- | --- |
| Raise the UI's quality over many rounds | This skill |
| One review of a change from three providers | [council](./council.md) |
| Designing screens before any code exists | [to-views](./to-views.md) |

## Prerequisites

Judges set up in your `## Model delegates` settings (see [model-delegates](./model-delegates.md)), screenshots of two or three reference apps in `docs/design/references/`, and a browser test tool in the repo for the screenshot script.

## The gate

Judges join one at a time. The fastest, cheapest judge scores alone until it reaches the target, then the next joins, then the last. That keeps slow or scarce models out of the early rounds, when the problems are obvious to any of them. Judges are never told the target or their earlier scores, since knowing the goal shifts the scores.

## Common questions

**How much does a climb cost?**
A lot of agent time. The run this skill is modelled on took about 18 hours of agent time and 30-plus review rounds across several climbs. The round budget (default 10) is the brake, and gating the judges keeps the expensive ones out until the end.

## It's working if

- The app's scores rise round over round while the references' scores stay roughly level beside them.
- Each round's commit makes a small, nameable change through tokens or shared components.
- You prefer the final screenshots when you look at them yourself.

## Where it fits

Periodic upkeep for the look of an app, and a natural follow-up to [adopt-design](./adopt-design.md) once real screens exist. [ask-matt](https://aihero.dev/skills-ask-matt) maps the rest.
