# Legal Work Platform — Floating Hero Section

A single-viewport Next.js 14 (App Router) hero section that reproduces the
"Legal Work Platform" reference design, with a real matter-js physics
simulation (a hand-built `Gravity` / `MatterBody` primitive in the spirit of
Fancy Components) driving the floating cards on the right.

## 1. Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. For a production build:

```bash
npm run build
npm run start
```

Requires internet access at runtime to load the "Plus Jakarta Sans" font
from Google Fonts (see note in section 8 below on why it's loaded this way).

## 2. Project structure

```
app/
  layout.tsx        Root layout: metadata, viewport, Google Font <link>
  page.tsx           Route entry — renders <Hero />
  globals.css        Tailwind layers + base page rules (no horizontal
                      scroll, reduced-motion support)

components/
  Hero.tsx           The page's only section: split layout, background
                      blobs, headline/copy, and the two card visualizations
                      (physics on desktop/tablet, static stack on mobile)
  FloatingCard.tsx    Reusable pill/card primitive (color, rotation, icon,
                      label, variant)
  Gravity.tsx         Physics primitives: <Gravity> (engine + walls) and
                      <MatterBody> (one rigid body synced to a DOM node)
  GravityCards.tsx    Composes Gravity + MatterBody + FloatingCard into the
                      falling/piling "rain" effect, with the spawn/settle/
                      reset loop

tailwind.config.ts    Design tokens: colors, font, keyframes
```

## 3. How `FloatingCard` props work

```tsx
<FloatingCard color="billing" rotation={-10} icon={<Receipt />} label="Billing" />
```

- `color` selects a theme (`billing`, `matters`, `dark`, `portal`) from a
  lookup table (`COLOR_STYLES`) that resolves to a background, text and
  icon-chip color, plus a matching drop shadow. This is the one place the
  card's palette is defined, so adding a new color is a one-line change.
- `rotation` is applied as an inline `transform: rotate(...)` on the card's
  root element. It's only meaningful when the card is positioned by CSS
  (e.g. the mobile static stack). When a card is driven by physics, the
  wrapping `MatterBody` element owns the live rotation instead (see §4), so
  `rotation` is passed as `0` there to avoid double-rotating.
- `icon` and `label` are rendered as-is inside the pill; `icon` is optional
  so the component still works for icon-less cards.

## 4. How the "portal" variant works

Rather than five separate components, `FloatingCard` takes a `variant`
prop:

- `variant="pill"` (default) — the rounded-full Billing/Matters/Tasks/
  Documents layout: an icon chip + bold label.
- `variant="portal"` — a different internal layout for "John Doe - Portal":
  a rounded rectangle with an orange accent bar, an avatar chip, a bold
  name, a message line, and a meta line (ticket ref + timestamp). It reuses
  the same `color`/`theme` lookup, just applies it to a different JSX
  structure.

Both variants share one prop surface and one exported component — the
branching happens inside the function body (`if (variant === "portal") {...}`),
which is the "variant/slot" pattern the brief asks for instead of five
bespoke card components.

## 5. How Gravity / MatterBody work

`Gravity` (in `components/Gravity.tsx`) is a physics *container*, matching
the API of [fancycomponents.dev](https://fancycomponents.dev)'s Gravity
component:

- On mount it creates a `Matter.Engine` and a `Matter.Runner`
  (`Runner.run(runner, engine)` steps the simulation every frame off the
  main render loop).
- It measures its own DOM container with `getBoundingClientRect()` and
  builds **static** boundary bodies — a floor, two side walls, and (with
  `addTopWall`, on by default) a top wall — sized to match. A
  `ResizeObserver` rebuilds them whenever the container's size changes, so
  the boundaries always match the *card visualization*, not the browser
  viewport.
- It creates a `Matter.Mouse` bound to the container element and a
  `Matter.MouseConstraint`, which is what makes every card **grabbable,
  draggable and throwable** with the pointer — release a card mid-throw
  and it keeps its momentum, bounces off the walls/floor/other cards, and
  can land at any angle, including upside-down. `grabCursor` toggles a
  grab/grabbing cursor while hovering/dragging. A `startdrag` listener
  checks each body's `plugin.isDraggable` flag and immediately releases
  the constraint for any card rendered with `isDraggable={false}`.
- It exposes the engine ref and container ref through React context
  (`GravityContext`) so descendants can add bodies to the same world.

`MatterBody` is a single physics *object*:

- Accepts `x`/`y` as either pixel numbers or percentage strings (e.g.
  `"50%"`), resolved against the container's measured size — exactly like
  the real component's API.
- On mount, it calls `Matter.Bodies.rectangle(x, y, width, height, {...})`
  with the card's initial spawn position, size, restitution, friction,
  density and starting angle, plus a `chamfer` so the rigid body's corners
  are rounded like the visual pill. It adds a small random angular velocity
  and horizontal velocity so cards don't all fall identically, and tags the
  body with `plugin.isDraggable` so the mouse constraint knows whether to
  allow grabbing it.
- Every animation frame (`requestAnimationFrame`), it reads the live
  `body.position` / `body.angle` from Matter.js and writes them straight to
  the DOM node's `style.transform` (`translate3d(...) rotate(...)`) —
  bypassing React state entirely for that hot path, which is what keeps
  60fps smooth with five simultaneously falling, colliding, and
  potentially-being-dragged bodies at once.
- On unmount it removes its body from the world, which is what makes the
  reset cycle work (see §7).

`GravityCards` then composes these primitives with a config array
(`CARD_CONFIGS`) describing each card's label, color, icon, size, initial
angle, horizontal spawn fraction, and per-card restitution/friction/density
— tuned for a lively, elastic bounce so cards can end up resting at any
angle, not just gently tilted, the same way they do in the fancy-components
reference demo.

## 6. Why the physics component uses `"use client"`

`Gravity.tsx` and `GravityCards.tsx` are marked `"use client"` because they:

- Import and instantiate `matter-js`, a browser-oriented physics engine
  that has no meaning on the server (there's no DOM, no animation frame,
  nothing to simulate against).
- Use React hooks that only make sense in the browser — `useEffect`,
  `useRef`, `useState`, `ResizeObserver`, and `requestAnimationFrame` — all
  of which require a live DOM and event loop.

`FloatingCard.tsx` and `Hero.tsx` deliberately stay server components
(no `"use client"`) — they're pure presentational markup with no browser
APIs, so they're rendered on the server and only the interactive physics
subtree is shipped as client JS. This keeps the client bundle scoped to
just what actually needs the browser.

## 7. How cards are positioned/configured, and how the reset cycle works

Each entry in `CARD_CONFIGS` (in `GravityCards.tsx`) defines:

- `xFraction` — where the card starts horizontally, as a fraction of the
  container's measured width (e.g. Matters spawns at `0.2`, Billing at
  `0.64`), so positions scale with the container instead of being hardcoded
  pixels.
- `width` / `height` / `angle` — the card's size and starting tilt.
- `restitution` / `friction` / `density` — per-card physics feel (e.g. the
  Portal card is denser and less bouncy than the pill cards).

`CardRain` (inside `GravityCards.tsx`) orchestrates the loop:

1. **Spawn** — each card is added to `visibleIds` on a staggered
   `setTimeout` (≈380ms apart, with a little jitter), each starting at a
   random negative `y` above the container, so they fall in like rain
   rather than appearing all at once.
2. **Settle** — after all five have spawned, the effect waits a few more
   seconds for Matter.js to let them fall, collide, and pile up at the
   floor. At this point they're fully interactive — grab one and throw it
   and it'll bounce off the walls, floor, top wall and the other cards.
3. **Postpone on interaction** — `Gravity`'s `onInteract` fires on every
   pointer-down inside the visualization. `GravityCards` wires that to
   `scheduleEnd()`, which pushes the fade/reset timers further into the
   future instead of cancelling them outright — so if you're mid-drag when
   the "settle" timer would have fired, the loop simply waits and
   reschedules rather than yanking a card out from under you.
4. **Fade** — once things go quiet, the whole card layer's opacity is
   animated to 0 over 500ms.
5. **Reset** — a `cycle` counter increments. Because each `MatterBody`'s
   React `key` includes `cycle` (`` `${card.id}-${cycle}` ``), React
   unmounts the old instances (which removes their bodies from the Matter
   world in the cleanup function) and the effect's dependency on `cycle`
   re-triggers the whole spawn sequence from the top — producing a
   continuous "rain, pile up (or play), reset" loop for as long as the page
   is open, and it also runs fresh from the start on every full page
   load/refresh.

## 8. How responsive behavior works

- **Desktop (`md`+ / `sm`+ for the physics area)**: the full Matter.js
  simulation runs inside `GravityCards`, sized to fill the right-hand
  column; `Hero`'s `<main>` is `md:h-screen md:overflow-hidden` so the
  whole page fits one viewport with no vertical scroll.
- **Tablet**: the same physics visualization runs, just at the container's
  natural (smaller) size — because every position is computed from the
  measured container width/height rather than fixed pixels, it scales down
  cleanly without extra breakpoint-specific logic.
- **Mobile (below `sm`)**: `GravityCards` is hidden (`hidden sm:block`) and
  replaced by a lightweight, non-physics `flex flex-col` stack of the same
  `FloatingCard` components, using the `rotation` prop directly for a bit
  of character, per the assignment's own example usage. This avoids
  running a physics simulation on a small/low-powered viewport and keeps
  the section from growing excessively tall; the surrounding `<main>` is
  `overflow-x-hidden` globally to guarantee no horizontal scroll at any
  width.

## Notes

- Font: "Plus Jakarta Sans" is loaded via a standard `<link>` tag to Google
  Fonts in `app/layout.tsx` rather than `next/font/google`. Functionally
  they're equivalent for this project; `<link>` was used here because it
  doesn't require a network fetch at *build* time (only at runtime, in the
  browser), which matters in network-restricted build environments. If
  you'd prefer self-hosted/build-time font optimization, swap this for
  `next/font/google` — it's a drop-in change.
- Dark mode was intentionally left out: the assignment's core requirement
  is pixel-fidelity to the supplied light-theme reference, and a
  half-hearted dark palette risked diluting that. Every color lives in one
  place (`tailwind.config.ts` + `COLOR_STYLES` in `FloatingCard.tsx`), so
  adding a `dark:` variant per token is a mechanical follow-up if you want
  to pursue the bonus.
