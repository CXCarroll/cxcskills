## What it does

`to-views` turns a spec into the app's **views**: every screen, sheet, dialog and message someone sees, each with its route, who uses it, what it shows, what it lets them do, and the states it can be in. It then writes one Claude Design brief per view, plus a design-system brief that keeps the screens consistent. It works only from the spec on disk, never from the interview that produced it, so anything the spec forgot surfaces as a gap to fix in the spec before anyone draws a screen.

## When to reach for it

You invoke this by typing `/to-views`, and the agent won't reach for it on its own. Reach for it on a new app, or a feature with new screens, once [to-spec](https://aihero.dev/skills-to-spec) has produced the spec and before any tickets exist.

| Your situation | Reach for |
| --- | --- |
| You have a spec and want to design the screens | This skill |
| One design question you'd settle with throwaway code | [prototype](https://aihero.dev/skills-prototype) |
| The boards are finished and should guide the build | [adopt-design](./adopt-design.md) |

## Prerequisites

A spec from [to-spec](https://aihero.dev/skills-to-spec) and, ideally, the glossary that [grill-with-docs](https://aihero.dev/skills-grill-with-docs) builds. It writes `views.md` and a `briefs/` folder under `docs/design/`.

## Coverage, both ways

Every user story maps to at least one view, and every view maps back to at least one story. A story with no screen is a hole in the plan; a screen with no story is scope nobody asked for. The skill reports both, along with states the spec never defined (what an empty list says, what someone without permission sees), and asks you to settle them in the spec. Then it quizzes you on the view list before writing a single brief.

## It's working if

- Every brief has realistic sample data in your app's own terms, and one frame per state.
- The screens Claude Design draws from the briefs look like one product, because they all build on the design-system board.
- The gaps it found changed the spec, not just the briefs.

## Where it fits

A chain step in the greenfield route: [grill-with-docs](https://aihero.dev/skills-grill-with-docs), then [to-spec](https://aihero.dev/skills-to-spec), then this skill in a fresh context, then the boards in Claude Design, then [adopt-design](./adopt-design.md) and [to-tickets](https://aihero.dev/skills-to-tickets). [ask-matt](https://aihero.dev/skills-ask-matt) maps the rest.
