---
name: to-views
description: Turn a spec into a list of the app's views and one Claude Design brief per view, ready to prototype the screens.
disable-model-invocation: true
---

# To Views

Turn a spec into the app's **views**: every screen, sheet, dialog and message a person sees, each with what it shows, what it lets them do, and the states it can be in. Then write one **brief** per view for Claude Design, plus a design-system brief that keeps every screen consistent. Once the boards drawn from these briefs are right, `/adopt-design` makes them the source of truth for the build.

Work from the spec on disk, not from the conversation. Run in a fresh context (after `/clear`), so the views come from what the spec actually says: anything the interview settled that never reached the spec shows up here as a gap, and that is the moment to fix the spec.

## Process

### 1. Read the sources

- **The spec**: the path, issue number or URL the user passed. With none, find it through the issue tracker doc (`docs/agents/issue-tracker.md`), and ask if it is still missing. Read its full body and comments.
- **The domain docs**: the project's domain glossary (`GLOSSARY.md`, or `CONTEXT.md` in older repos) and the ADRs. View names, labels and sample data use the glossary's terms.
- **Any existing design system** (`docs/design/`, `design/`, a `tokens.*` file). When one exists, the briefs reuse it instead of starting a new look.

**Done when:** you can name every actor in the spec and the user stories each one appears in.

### 2. Draft the views

Walk the user stories in order. Every place an actor sees something or does something lands in a view. Merge stories that share a screen; split a screen when two actors need different things from it.

A view is one destination: a page with its own route, or a sheet, dialog or full-screen flow that carries its own task. Emails, PDFs and notifications the spec describes are views too; mark their kind. Toasts, menus and inline errors are not views: list them under the view they appear on.

Write each view in the format in [VIEWS-FORMAT.md](VIEWS-FORMAT.md): kind, route, who, purpose, stories, shows, actions, states, navigation, sizes. Then list the shared parts: the app shell, navigation, the messages, and every component used on more than one view.

**Done when:** every user story maps to at least one view or is marked "no UI" with a reason, and every view maps to at least one story.

### 3. Check coverage and quiz the user

Report the gaps first: stories with no view, views with no story (a screen the spec never asked for), and states the spec leaves undefined (what an empty list says, what an actor without permission sees). Gaps get fixed in the spec, not invented here, so offer the user the spec change and wait for the answer.

Then present the views as a numbered list (name, kind, route, who, one-line purpose) in build order, core loop first, and ask:

- Is anything missing, or here that shouldn't be?
- Should any views be merged or split?
- Is this the right order to design and build them?

Iterate until the user approves the list.

### 4. Settle the look

The design-system brief needs a direction the spec rarely gives. If the spec, the domain docs and any existing design system are silent, ask the user in one message: how it should feel (three to five words), products whose look they like, where it gets used (a phone in the field, a desk, both), and any hard constraints (brand colours, dark mode, an accessibility level). WCAG AA is the floor unless they set a higher one.

### 5. Write the files

Write to `docs/design/`, or wherever the repo already keeps design docs:

- `views.md`: the approved views and shared parts.
- `briefs/00-design-system.md`: the design-system brief.
- `briefs/NN-<view-slug>.md`: one brief per view, numbered in the approved order.

Each brief follows [BRIEF-FORMAT.md](BRIEF-FORMAT.md) and stands alone, because it gets pasted into Claude Design by itself. Content is concrete: realistic sample data in the glossary's terms (believable names, addresses, amounts and dates) rather than placeholder text, and one frame per state the view lists.

### 6. Hand off

Tell the user the order to work in: start a Claude Design canvas with `00-design-system.md`, then add each view brief, in number order, to the same canvas so every screen draws on one system. Tweak the boards until they are right, then run `/adopt-design` with the canvas link or the exported boards.

Report: how many views, which gaps changed the spec, and the files written.
