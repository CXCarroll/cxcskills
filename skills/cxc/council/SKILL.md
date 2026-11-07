---
name: council
description: Get a review or feedback from three models from different providers, and loop until they agree.
disable-model-invocation: true
metadata:
  credits:
    skill: council
    author: Theo Browne
    url: "https://github.com/t3dotgg/tstack/blob/main/skills/council/SKILL.md"
---

# Council

Before an audit, address outstanding PR comments, fix known issues, and run relevant checks. Give council the updated implementation; do not defer known fixes until reviews return. If the user wants to discard the implementation and explore new ideas, skip fixes to code being replaced.

## Members

Bring in three delegates to help with the user's request, usually for review or feedback: one strong model from each of three different providers, at high reasoning effort.

Call the Skill tool with "model-delegates" for the routes, the settings, and the delegate script. Pick the members in this order:

1. The members the user names in this request.
2. The settings' `Council` line.
3. With neither, Claude Opus and GPT from the defaults, plus a third member the user has not configured yet.

If you cannot reach three providers, or a named member is unavailable, report it instead of substituting. A missing third member is reported the same way, with a pointer to the `## Model delegates` settings.

## Run a round

Give each delegate the request and the relevant context in one self-contained brief. For review or feedback, keep their work read-only. Start every member in the same turn, each with a fresh context window, and edit nothing until all of them return.

For a code review, use this brief:

```
Review only. Do not edit, commit, push, comment on PRs, or start subagents.
Use `git --no-optional-locks` for every git command.
Repo: <abs path> Base: <sha> Intent: <intent> Out of scope: <scope> Checks: <results>
See: git diff <base> [-- <paths>]; git status --short (read untracked).
Read surrounding code. Find bugs, broken callers, mismatch with intent.
Skip style unless it hides a bug. Hold to the smallest change.
blocker = intended case wrong. should = real bug callers will hit, in intent. nit = rest.
Reply:
SCORE: <n>/10
F1 [blocker|should|nit] <file>:<line> <claim>. Fix: <suggestion> (stable ids)
```

Collect their responses and summarize the useful findings, disagreements, and recommended next steps. Check every finding against the code yourself before acting on it.

For a code review, ask each delegate for a score out of 10. Count each full review pass as one round. A fresh review after fixes starts a new round, with fresh delegates given the same brief, the findings ledger, and the change since the last round.

## Report the scores

If the work ends in a pull request, put the results in the PR description, at the end of the body after the `pr` skill's sections:

```markdown
## Council review

Rounds: 2

| Delegate | Round 1 | Round 2 |
| --- | --- | --- |
| Claude Opus | 7/10 | 9/10 |
| GPT Sol | 8/10 | 10/10 |
| <third member> | 7/10 | 9/10 |
```

Use each member's name from the settings and the model exactly as its `meta.txt` states it. If a delegate gives no score, write `no score`. Do not invent one. If the PR is open, edit the description. Do not post a comment for this. If there is no PR, put the same results in the final reply only.

## Loop

If you agree with their recommendations, make the changes and request a fresh review after. Continue until all delegates are satisfied, for at most 3 rounds unless the user sets another budget. Budget end is not approval: report what is still open and let the user decide.

Do not let repeated reviews result in scope creep. It is your job to fight to keep scope limited.
