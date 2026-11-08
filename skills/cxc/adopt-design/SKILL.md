---
name: adopt-design
description: Make finished Claude Design boards the repo's source of truth for how the app looks, with tokens, a design README, and the coding standards that enforce them.
disable-model-invocation: true
---

# Adopt Design

Make a set of Claude Design boards the repo's **source of truth for how the app looks**. The boards come in as references, their exact values become **tokens**, a design README states the rules and maps every view to its board, and the coding standards gain the UI rules that `code-review` enforces. Run it once the boards are tweaked and right, and again whenever the canvas changes (a **sync**).

One rule settles every disagreement: **the spec wins on behaviour, the boards win on look.**

## Process

### 1. Find the boards

The user passes a canvas link (a claude.ai artifact URL), a folder of exported boards, or both.

- With a link, read the boards through the harness's artifact tool if it can open that URL. Otherwise ask the user to export the boards and give you the folder.
- Note the source for the README: the link, the canvas version if one is shown, and today's date.

Read `docs/design/views.md` and its spec, from `/to-views`, if they exist. Without them, ask the user which board shows which screen.

**Done when:** every board file is in hand and you know which view each one shows.

### 2. File the boards

Use the repo's design-system folder if it has one. Otherwise create `docs/design/<system>/`, asking the user for a short name for the system (Frost, for example). Copy in the board files and anything they load (a canvas manifest, a runtime script) unchanged: they are references to read, not code to ship. Where the export named a board after something else, rename it after its view.

Then map views to boards and report both kinds of gap:

- **A view with no board** needs drawing before it can be built.
- **A board with no view** is either a screen the spec never asked for or an example. Label which in the README.

### 3. Make the tokens

Every value has exactly one copy. If the export includes a token file (`tokens.json`, `tokens.css`), keep it as the source. Otherwise extract the exact values from the design-system board into `tokens.css` as CSS custom properties sharing one prefix (`--frost-*`, for example): colours, type roles, spacing, radii, shadows, blur, motion. Copy each value exactly; never round one or invent one. A value that appears on a screen board but not in the system is a finding: ask whether it belongs in the system or is a slip on the board.

### 4. Reconcile with the spec

Compare each board with its view in `views.md` and the user stories behind it:

- **Drawn but ruled out:** a control or feature the spec excludes.
- **Missing:** a state, action or field the view lists that no board shows.
- **Different words:** labels that differ from the glossary's terms.

Present the list to the user, each item with the default from the precedence rule (behaviour follows the spec, look follows the board). Where the user decides the spec should change instead, tell them to change it before anything gets built. Every case that stands goes in the README's divergences table.

### 5. Write the design README

Write `<folder>/README.md` in the format in [README-FORMAT.md](README-FORMAT.md): the source and snapshot, the precedence rules, the principles, the foundations with their token names, the components and where they get built, the view-to-board map, the divergences, and how to sync.

### 6. Point the agents at it

- Add one line to the repo's `CLAUDE.md` (or `AGENTS.md`, whichever it uses): the design system is the source of truth for how the app looks, at `<folder>/README.md`, with exact values in the token file, and the UI rules are in `CODING_STANDARDS.md`.
- Add a **UI** section to `CODING_STANDARDS.md`, creating the file if needed, from the snippet at the end of [README-FORMAT.md](README-FORMAT.md). `code-review` reads that file, so these rules get enforced at review.

A rule a check can enforce (no raw colour, shadow or radius in a component file; no inline styles) belongs in a lint rule or a script, not only in prose. List those checks for the UI foundation ticket in step 7.

### 7. Commit and hand off

Commit the adoption on its own, so the design diff can be reviewed apart from any code.

Then tell the user to run `/to-tickets` with the spec and the design README, and suggest the first ticket be the **UI foundation**: load the tokens once, build the shared components to match the components board, add a development-only page that shows every component in every variant, add the checks from step 6, and run an accessibility scan on that page. Every UI ticket after it names the board it matches.

Report: the boards filed, the tokens extracted, the gaps and divergences, and the files changed.

## Syncing

When the canvas changes, run the skill again. Replace the board files, update the tokens and the README where they differ, bump the snapshot line, check the divergences again, and commit the sync on its own.
