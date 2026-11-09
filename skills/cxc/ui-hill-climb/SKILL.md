---
name: ui-hill-climb
description: Raise the app's UI quality round by round until models from different providers score every design category at a target, judged against reference apps.
disable-model-invocation: true
metadata:
  credits:
    skill: "the UI hill climb from \"Agents Sucked At UI (Until Today)\", run with tstack's council"
    author: Theo Browne
    url: "https://www.youtube.com/watch?v=xq0eB8vxeqk"
---

# UI Hill Climb

Turn "make the UI better" into a **score** that agents can push up. Each **round** captures the same screenshots the same way, has a panel of **judges** (models from different providers) score them in fixed design categories against **reference apps**, fixes what the judges agree on, and goes again. The climb ends when every judge scores every category at the **target** and the app outscores every reference, or when the budget runs out.

Scores are noisy: the same screenshot can get different scores from the same model. What carries signal is several providers agreeing at a high score, with references in the panel to stop the scores inflating.

## 1. Set up the climb

Call the Skill tool with "model-delegates" for the routes, the settings, and the delegate script. Then settle these with the user, asking in one message for anything they haven't given:

- **Screens:** which views and states to capture. Take them from `docs/design/views.md` if it exists. Capture each one at phone (390 wide) and desktop (1440 wide) sizes, and in light and dark if the app has both.
- **References:** screenshots of two or three apps whose look this app should beat, the same kinds of screens, in `docs/design/references/`. Without references, scores inflate. If the user has none, say so and continue only if they accept that.
- **Target and budget:** a score in every category (default 9 out of 10) and a number of rounds (default 10). Budget end is not success.
- **Judges, in gate order:** the settings' `UI judges` line, or else the `Council` line, with the fastest and cheapest judge first. The order exists to save usage: only the first judge scores until it reaches the target, then the next one joins, and so on.
- **Taste:** anything the user already knows they want ("keep it colourful", "denser tables"). The user can steer between rounds too.
- **The design system:** if the repo has a design README from `adopt-design`, its rule is that the look changes on the canvas first. Ask whether this climb may change the look in code. If it may, list every change to tokens and components for the user to carry back to the canvas, and note the sync in the design README.

Work on a new branch, stacked on the current UI branch or PR if one exists, so earlier rounds stay mergeable.

## 2. Make capture repeatable

Write a screenshot script in the repo, using its browser test tool (Playwright if it has one). It starts the app with demo data, visits every screen and state at every size and theme, waits for fonts and images to settle, and writes PNGs to `${TMPDIR:-/tmp}/ui-hill-climb/round-<n>/`, never inside the repo. Commit the script: it is useful long after the climb.

Run it once as **round 0**, the baseline.

## 3. Run a round

1. **Capture** with the script.
2. **Judge.** Write the brief in [JUDGE-BRIEF.md](JUDGE-BRIEF.md) and start a fresh delegate for every judge that is in play, attaching the app's screenshots and the references as images. Never tell a judge the target, its earlier scores, or another judge's scores: knowing the goal changes the scores.
3. **Record** every judge's per-category scores for the app and for each reference in the ledger (below).
4. **Fix.** Take the findings two or more judges share, then single findings the leading judge marks high-impact. Make each fix through tokens and shared components rather than one-off styles, keep behaviour exactly as the spec says, run the checks, and commit the round on its own (`ui-hill-climb round <n>: <what changed>`).
5. **Gate.** When every judge in play scores every category at the target, bring in the next judge in gate order.

A score that drops after a change is information, not an order to revert. Compare the before and after screenshots, and revert only if the change made things worse.

## 4. Stop

**Done:** every judge, all of them in play, scores every category at or above the target, and above every reference in that category.

**Out of budget:** stop and report where each judge stands. The user decides whether to run another climb with a fresh budget.

## The ledger

Keep the scores in the PR description, or in the final reply when there is no PR:

```markdown
## UI hill climb

Target: 9 in every category. Rounds: 4. References: <apps>.

| Judge | Round 0 | Round 1 | Round 2 | Round 3 | Round 4 |
| --- | --- | --- | --- | --- | --- |
| GPT Sol | 7.1 | 8.0 | 8.9 | 9.2 | 9.3 |
| Claude Opus | not run | not run | not run | 8.7 | 9.1 |
| <third judge> | not run | not run | not run | not run | 9.0 |
```

Each cell is the judge's lowest category score that round. Below the table, list each judge's per-category scores for the final round, with every reference's scores beside them. Write `not run` for a gated judge and `no score` when a judge gave none; never invent one.

## Report

The ledger, what changed in each round in a sentence or two, before-and-after screenshots of the screens that changed most, the token and component changes to carry back to a design canvas if there is one, and usage from each run's `meta.txt`. End by asking the user to look at the final screenshots themselves: the judges measure agreement, and the user decides on taste.
