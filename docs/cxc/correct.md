## What it does

`correct` turns a mistake agents keep making in your repo into a check that fails when the next agent makes it. It doesn't add another line to `CLAUDE.md`: a written rule fails silently when an agent skips it, so the skill climbs a **ladder** instead (architecture, then types, then a lint rule whose error names the fix, then a test) and writes a rule down only for a genuine judgement call. Each check is proven **red** on a real past mistake before it counts.

## When to reach for it

You invoke this by typing `/correct`, and the agent won't reach for it on its own.

| Your situation | Type |
| --- | --- |
| You just corrected an agent for something it has done before | `/correct <the mistake>` |
| You want a sweep of the repo's history for repeated mistakes | `/correct` |
| A session went badly and you want ideas for the whole setup | [retro](https://aihero.dev/skills-retro) first; it points at `/correct` for the mechanical ones |

## The ladder

A mistake class (one that has happened at least twice) is fixed on the highest rung that works:

1. **Architecture** makes it impossible: one owner per piece of state, one supported way per task, the old way deleted so nobody copies it.
2. **Types** reject the bad state.
3. **A lint rule** fails on it, with an error that says what to use instead, through [lint-guardrails](./lint-guardrails.md).
4. **A test** catches the behaviour.
5. **A written rule** in `CODING_STANDARDS.md`, for judgement calls only, where [code-review](https://aihero.dev/skills-code-review) reads it.

Every fix gets a row in an `## Enforced rules` table in `CODING_STANDARDS.md`, pairing the rule with what enforces it and the past mistake it was proven red on.

## Common questions

**Doesn't `retro` already do this?**
`retro` looks at one session and suggests improvements across your whole setup. `correct` builds the check itself, proves it on real history, and records it. Use `retro` to spot the problem and `correct` to lock the fix in.

**What about a pattern that is already all over the codebase?**
The lint rule is ratcheted: today's occurrences are recorded, new ones fail, and the count can only go down. The skill offers a ticket for cleaning up the old ones.

## It's working if

- You stop giving the same correction twice: the second time, a commit fails before you see it.
- `CLAUDE.md` and your lessons files get shorter as their rules move into checks.
- Each new check comes with a pasted failure from a real old commit or PR.

## Where it fits

Periodic upkeep, reached for whenever you catch yourself repeating a correction, and after [retro](https://aihero.dev/skills-retro). [ask-matt](https://aihero.dev/skills-ask-matt) maps the rest.
