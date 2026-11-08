# Brief format

A brief is pasted into Claude Design on its own, so it carries the context it needs and names the design-system board it builds on.

## The design-system brief

```markdown
# <Product>: design system

<Product> is <one sentence from the spec's problem statement>. It is used by <actors>, mostly on <a phone, a desktop, both>, <where and when>.

**Feel:** <three to five words>. **References:** <products the user named>. **Constraints:** <brand colours, dark mode, WCAG AA, touch targets of at least 44 px>.

Draw the design system as boards:

1. **Foundations:** colour (text, surfaces, one primary-action colour, and a colour for each <Status> the spec names), a type scale with roles (display, title, heading, body, label, mono), a spacing scale, radii, elevation, and motion.
2. **Components:** every shared component, in every variant and state: <the components from the shared parts in views.md>.
3. **App shell:** <the layout at each size, with the navigation items>.

Give every value a token name (`--<prefix>-<role>`), so the build uses tokens instead of raw values.
```

## A view brief

```markdown
# <Product>: <View name>

Build on the <Product> design system board: its tokens and components. When this view needs something the system lacks, add it to the system board as well.

**Who and where:** <actor>, <device and situation>.
**Job:** <the view's purpose>.
**Reached from:** <views>. **Leads to:** <views>.

**Draw these frames** at <sizes>:

1. **Default**, with this content: <realistic sample data in glossary terms>
2. **Empty:** <what it says and offers>
3. **Loading**
4. **Error:** <cause and message>
5. **<Domain state>:** <what changes>

**Actions:** <the primary action>, then <the others>.
**Leave out:** <out-of-scope items close to this view>.
```
