# Views format

`views.md` opens with the actors, then one entry per view in build order, then the shared parts and what is out of scope.

```markdown
# Views

Spec: <path or issue link>. Glossary: GLOSSARY.md.

## Actors

- **<Actor>**: <who they are, and where they use the app: a phone in the field, a desk, both>.

## Views

### 1. <View name>

- **Kind:** page | sheet | dialog | flow | email | pdf | notification
- **Route:** `/issues/:id`, or "none"
- **Who:** <actors>, and what each may do here
- **Purpose:** <one sentence: the job this view does>
- **Stories:** <spec story numbers>
- **Shows:** <the data, in glossary terms>
- **Actions:** <the primary action first, then the rest>
- **States:** default; empty (<what it says and offers>); loading; error (<cause and message>); <domain states, such as Completed or Cancelled>; <permission-limited, when an actor sees less>
- **Navigation:** from <views>; to <views>
- **Sizes:** phone (390 wide), desktop (1440 wide), or both, unless the spec sets others

## Shared parts

- **App shell:** <the layout at each size, and the navigation items>
- **Components:** **<Component>**: <what it is>; used on <views>
- **Messages:** <toasts, confirmations and inline errors, each with the view it appears on>

## Out of scope

<What the spec rules out, so nobody designs it.>
```
