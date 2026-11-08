# Design README format

The design README lives beside the boards and the token file. Fill every section; drop a foundations table only when the system has nothing for it.

```markdown
# <System>: the design system

<System> is the **source of truth for how the app looks**. Every screen follows it. This README gives the rules, and [tokens.css](tokens.css) has the exact values. The board files beside it are the canvas as drawn: read them for reference, and build from the tokens and components rather than from the boards' markup.

- **Upstream:** <canvas link>
- **Snapshot:** canvas version `<version>`, copied <date>. <Any board ahead of or behind the canvas, and why.>

## Precedence

- **The spec wins on behaviour; <System> wins on look.** Domain, permissions and scope come from the glossary, the ADRs and the spec. If a board shows something the spec rules out, leave it out (see Divergences).
- **Example screens are references, not specs.** Match their layout and look, but take the content and actions from the ticket.
- **The look changes upstream first.** Change the canvas, then sync this folder. Never fork the look in code.

## Principles

<Three to five rules the boards follow, in plain words. For example: "Colour carries meaning: saturated colour is kept for Status and the one primary action.">

## Foundations

### Colour

| Role | Token | Value | Use |
| --- | --- | --- | --- |

### Type

| Role | Token | Size / line height | Weight | Tracking |
| --- | --- | --- | --- | --- |

### Shape, space and motion

<Radii, the spacing scale, elevation, minimum touch targets, and motion, each with its tokens.>

## Components

Drawn on the <components board>. Build each once in `<ui path>` and reuse it.

- **<Component>:** its variants, sizes and states.

## Views

| View | Board | Sizes |
| --- | --- | --- |
| <View name> | [<Board file>](<Board file>) | phone, desktop |

## Divergences from the spec

The boards show a few things the spec doesn't include. Following the precedence rules, build what the right-hand column says:

| On the board | Build this instead |
| --- | --- |

## Syncing

When the canvas changes:

1. Read its boards again, through the artifact tool on the upstream link or from a fresh export.
2. Replace the board files.
3. Update the token file and this README where they differ.
4. Bump the snapshot line at the top.
5. Commit the sync on its own, so the design diff is reviewable by itself.
```

## Coding standards

The UI section to add to `CODING_STANDARDS.md`:

```markdown
## UI

- **The design source of truth is [<folder>/README.md](<folder>/README.md).** Every screen follows its board for look and the spec for behaviour.
- **Use the tokens.** Components use the `--<prefix>-*` custom properties. A raw colour, shadow, radius or font size in a component is a violation.
- **Use the shared components.** Build each once in `<ui path>` and import it. Don't restyle buttons, fields, chips or panes on individual screens.
- **Follow the divergences.** Where the design README's divergences table says to build something differently from its board, build it that way.
- **Accessibility:** WCAG AA, touch targets of at least 44 px, and real interactive elements (`<button>`, `<a>`, `<label>`).
```
