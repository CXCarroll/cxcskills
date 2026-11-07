## What it does

`blast-radius` finds what a change could break outside its own diff, before it ships. It does not list callers, which grep does in a second. It hunts the breakage grep misses (a wire format, a database column, a lifecycle timing, code three hops away), then proves the **one fact** the change is safe because of by running real code. A writeup that only sounds right counts for nothing.

## When to reach for it

You invoke this by typing `/blast-radius`, and the agent won't reach for it on its own. Reach for it on a small diff you don't trust yet, especially one that touches shared state, a schema, or a library's behaviour.

| Your situation | Reach for |
| --- | --- |
| Is the diff built right, and does it match its spec? | [code-review](https://aihero.dev/skills-code-review) |
| What does this diff break somewhere else? | This skill |
| Something is already broken | [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) |

## The one safety fact

Most risky-looking changes are safe because of a single fact, such as "this call only drops cache entries that are already dead". The skill spends its effort finding that fact and pushing it down a ladder of certainty: said so, pointed at the line, walked the failure, ran it, reproduced it in the app. The report says where it stopped, and writes **unproven** when it couldn't get further.

For a big or wide change it also asks a model from another provider, through [model-delegates](./model-delegates.md), and merges the answers.

## It's working if

- The report names one safety fact and pastes the output of a script that tested it.
- Risks cite a real `file:line` with a likelihood and a cost, and cleared risks are listed apart from confirmed ones.
- The "before you merge" check is a test or repro you can run.

## Where it fits

A standalone, reached for between [code-review](https://aihero.dev/skills-code-review) and merging. [ask-matt](https://aihero.dev/skills-ask-matt) maps the rest.
