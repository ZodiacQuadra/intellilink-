# IntelliLink — Framer project as code

Exported from the live Framer project **"Fantom AI (copy)"** (`1c228b2ad6036e6b`) on
17 September 2026, via the official `@framer/agent` CLI and the components' published
module URLs.

## What's here

```
intellilink-code/
├── components/          12 code components, original TypeScript as authored
│   ├── Animated_arc.tsx          Animated_pixels.tsx      LogoGrid.tsx
│   ├── Animated_beam.tsx         DottedIcon.tsx           SlotCounter.tsx
│   ├── Animated_lines.tsx        GrowthGraph.tsx          StaggerTestimonials.tsx
│   ├── Animated_lines_2.tsx      ImpactGraph.tsx
│   └── Workshop/Typewriter.tsx
├── overrides/
│   └── Examples.tsx     1 code override, original TypeScript
├── framer/
│   ├── <Name>.js        18 named barrels, import these
│   ├── modules/         55 compiled modules plus shared dependencies
│   └── index.json       component to module map
├── assets/              77 binaries: fonts, images, video
│   └── manifest.json    source URL and usage for each file
├── tokens.css           32 colour + 11 text styles as CSS custom properties
├── tokens.json          the same tokens as data
├── _framer-xml/         full serialized trees for both pages and all 18 components
└── _tools/              scripts to re-fetch modules, assets and tokens
```

## Three kinds of code, and why they differ

**`components/` and `overrides/` are original source.** Authored as code inside Framer, so
what you see is what was written — typed props, comments, `addPropertyControls` and all. This
is where every animation lives. Edit freely.

**`framer/` is compiled output.** The 18 design components were drawn on the canvas, not
written as code, so no handwritten source exists. Framer publishes compiled React +
framer-motion; it is complete and runnable, and prettier-formatted here so it reads, but
identifiers are machine-generated (`jlYR3ckV6`, `framer-v-17717ly`). Treat these as build
artefacts.

**`_framer-xml/` is structure, not code.** Full serialized layer trees for both pages and all
18 components, including every attribute, variant and animation setting. This is the complete
record of the design — it just isn't React.

Every `framerusercontent.com` import in `framer/` has been rewritten to a local relative path,
so the tree resolves offline with no build-time network calls.

## The animations

All animation work is in `components/` as original TypeScript — nothing is skipped or
summarised:

| File | What it does |
|---|---|
| `Animated_beam.tsx` | Travelling beam along connection paths |
| `Animated_lines.tsx`, `Animated_lines_2.tsx` | Flowing line systems |
| `Animated_arc.tsx` | Animated arc sweep |
| `Animated_pixels.tsx` | Pixel-grid animation |
| `SlotCounter.tsx` | Rolling number counter |
| `StaggerTestimonials.tsx` | Staggered testimonial transitions |
| `Typewriter.tsx` | Cycling typewriter text |
| `ImpactGraph.tsx`, `GrowthGraph.tsx` | Animated charts (line/area/bars/radial) |
| `DottedIcon.tsx`, `LogoGrid.tsx` | Animated icon and logo systems |

Component-level motion (variants, transitions, hover states) additionally lives inside the
compiled `framer/modules/*.js` files and is fully described in
`_framer-xml/components-serialized/`.

## Using it

```bash
npm i react react-dom framer framer-motion
```

```jsx
import Button from "./framer/Button.js"
import ImpactGraph from "./components/ImpactGraph.tsx"

<Button variant="jlYR3ckV6" oGE0W8Khx="Explore solutions" F05bztbU6="/#features" />
```

Variant IDs and prop names are in `_framer-xml/`. For `Button`: `oGE0W8Khx` is the label,
`F05bztbU6` the link, `VOL5lEKBp` the arrow toggle; variants are `n1gMtcmI9`, `jlYR3ckV6`,
`AfZO288ir`, `YnCyd7g0P`, `L4yW9kxuA`.

Only four npm peers across all 55 modules: `react`, `react/jsx-runtime`, `framer`,
`framer-motion`.

## The one thing that is not code

**Page composition.** The two pages are Framer canvas documents, not components, so nothing
compiles them to React. Both are fully captured as serialized trees:

- `_framer-xml/PAGE-Home.serialized.txt` — 1,214,721 chars
- `_framer-xml/PAGE-404.serialized.txt` — 42,069 chars

Everything needed to rebuild them in React is there. The rebuild has not been done, by request.

Checked and genuinely empty, so not gaps: **CMS collections (0)** and **design pages (0)**.

## Colour and type

| Token | Value |
|---|---|
| Brand / Primary | `rgb(1, 43, 255)` |
| Brand / Primary dark | `rgb(2, 37, 212)` |
| Brand / Secondary | `rgb(9, 174, 255)` |
| Brand / Hero BG | `rgb(7, 11, 62)` |
| Page BG | `rgb(250, 250, 250)` |
| Body text | `rgba(0, 0, 0, 0.7)` |

Headings use **PP Neue Montreal Medium** (H1 68px to H6 16px); body, buttons and labels use
**Geist**. Full set in `tokens.css`. Every colour style has an empty `dark` value in Framer,
so there is no dark theme.

## Regenerating

```bash
node _tools/_fetch-modules.mjs    # re-pull compiled component modules
node _tools/_fetch-assets.mjs     # re-download fonts, images, video
node _tools/_extract-tokens.mjs   # rebuild tokens.css / tokens.json
```

Module and asset fetching need only network access. Token extraction reads
`_framer-xml/PROJECT-styles-and-tree.xml`.

## Note on the paid export

unframer's `exportReactComponents` requires a React Export subscription this account does not
have. This export was assembled instead from the official `@framer/agent` CLI plus each
component's public module URL, neither of which needs one.
