---
name: correct
description: Turn the mistakes agents keep repeating in this repo into checks that fail, each proven red on a real past mistake.
disable-model-invocation: true
metadata:
  credits:
    skill: correct
    author: Lauren Tan (poteto)
    url: "https://github.com/cursor/plugins/blob/main/pstack/skills/correct/SKILL.md"
---

# Correct

You keep correcting agents in this repo for the same mistakes. Change the repo so the next agent can't make them.

Assume every contributor is an agent that sees only the files it opened, copies the nearest example, and takes the shortest path that compiles. A workaround in the codebase is an example it will copy. Design the repo so a change that looks right from one file is right for the whole repo.

Read `GLOSSARY.md` if the repo has one, and use its terms.

## 1. Find the mistake classes

The user's argument decides the scope:

- **A correction** (`/correct agents keep using setTimeout to wait for the DOM`): that one **mistake class**. Find its past occurrences to prove the check against, then go to step 2.
- **No argument**: sweep the repo for classes. Read, newest first:
  - reverts and fix-up commits (`git log --oneline -200`, then `git show` on the suspicious ones);
  - review comments on recent PRs (`gh pr list --state merged --limit 30`, then `gh api repos/{owner}/{repo}/pulls/<n>/comments`);
  - the rules in `CLAUDE.md`, `AGENTS.md`, `CODING_STANDARDS.md` and any lessons or docs folder that agents are told to read; a rule written down is a mistake someone made;
  - comments that justify a workaround (`grep -rnE "workaround|hack|for now|do not remove|IMPORTANT"`), and lint or type suppressions (`eslint-disable`, `@ts-expect-error`, `@ts-ignore`).

A class counts once it has happened twice. Group the evidence by class, and list each class with its occurrences (commit, PR comment, or `file:line`) before fixing anything.

## 2. Fix each class at the highest rung that works

Climb the **ladder** from the top, and stop at the first rung that makes the mistake impossible or loud:

1. **Architecture removes it.** Give each piece of state one owner and each task one supported way. Hide internals so the wrong import fails. Replace hand-synced lists with one source of truth. Delete the old way and dead code an agent would copy. Call the Skill tool with "codebase-design" for the vocabulary.
2. **Types reject it.** Make the bad state impossible to write. Call the Skill tool with "typescript-best-practices" for the patterns.
3. **A lint rule fails on it**, with an error that names the fix: the function, file, or pattern to use instead. Call the Skill tool with "lint-guardrails" for how to write the rule, scope it, wire it into the pre-commit hook, and **ratchet** it when the pattern is already common (fail only when a change adds more).
4. **A test catches it.** Fix or delete any test that still passes when the behaviour it checks breaks, or that fails when only the internals change.
5. **A written rule, last, and only for a judgement call.** It goes in `CODING_STANDARDS.md`, where `code-review` reads it, not in `CLAUDE.md`. Nothing fails when an agent skips a written rule, so a class that a rung above could catch never ends here.

## 3. Prove each check red, then fix

Fix the most frequent classes first, one commit per class.

For each check, prove it goes **red** on a real past mistake: put the old code back in a scratch copy (or check out the commit that made the mistake), run the check, and paste the failure. A check you have never seen fail proves nothing. Then run it on the current code. It passes, or fails only on occurrences you have just fixed or ratcheted.

Run the same command the pre-commit hook and CI run. A check that runs only when an agent remembers it is a written rule.

An exception goes on the offending line with its reason (`// eslint-disable-next-line guardrails/no-timers -- <reason>`), and only after the user approves that exception. If the class is already common and you ratcheted it, offer a ticket to clean up the old occurrences, filed in the issue tracker from `docs/agents/issue-tracker.md` if the repo has one.

## 4. Keep the enforced-rules table

`CODING_STANDARDS.md` keeps one table, under `## Enforced rules`, pairing each rule with what enforces it:

| Rule | Enforced by | Proven red on |
| --- | --- | --- |
| Wait for the DOM with `tick()`, not a timer | `guardrails/no-timers` (lint) | `a1b2c3d` |
| Reviewers check that a new route has a loading state | written rule (judgement) | PR #41 comment |

Add a row for every class you fixed. `code-review` skips rules a check already enforces and reviews the judgement rows by hand.

When the user corrects you and the rule is already in the table as a written rule, that is a repeat: fix it on a higher rung in the same change. Drop a row once its mistake can't happen, for example when the architecture that allowed it is gone. Remove the matching prose from `CLAUDE.md`, `AGENTS.md` or a lessons file once a check enforces it, so the rule lives in one place.

## Reply

For each class: the evidence (occurrences), the rung you picked and why the rungs above it didn't work, the red run, and the commit. Then the classes you found but didn't fix, and any exceptions waiting for the user's approval.
