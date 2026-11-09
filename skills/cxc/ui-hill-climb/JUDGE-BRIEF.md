# Judge brief

Every judge gets the same brief each round, with the screenshots attached as images (see `model-delegates`). The brief names no target and no earlier scores.

```
Review only. Do not edit, commit, push, comment, or start subagents.

You are judging the visual design of <App>, <one sentence on what it is and who uses it>.
Attached are screenshots of <App> (files named app-*) and of reference apps
(files named ref-<name>-*), showing comparable screens at phone and desktop sizes.

Score <App> and each reference app from 1 to 10, to one decimal place, in each category:
- Hierarchy: is it obvious what matters most on each screen, and what to do next?
- Typography: type scale, weights, line length, and readability.
- Colour and contrast: palette, meaning carried by colour, and legibility in every theme.
- Iconography: consistent, clear, and well sized.
- Spacing and layout: rhythm, alignment, density, and use of space at each size.
- Consistency: the same things look and behave the same across screens.
- Polish: states, edges, and details that make it feel finished.

Judge only what the screenshots show. Compare <App> with the references directly:
a 9 means as good as the best reference in that category.

Reply in this format:
SCORES
<App>: hierarchy 0.0, typography 0.0, colour 0.0, iconography 0.0, spacing 0.0, consistency 0.0, polish 0.0
ref-<name>: hierarchy 0.0, ...
FINDINGS (most impact first, at most 8)
F1 [high|medium|low] <screen file> <what is wrong>. Fix: <the specific change>
```

Taste direction from the user, when there is some, goes after the categories as one line: `The owner wants: <direction>.`
