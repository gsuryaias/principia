# SimLab — How It Works

A detailed walkthrough of every technology, design decision, and architectural pattern in this project.

---

## The Problem

AI assistants (Claude, ChatGPT) frequently generate standalone JSX files to explain complex topics — physics simulations, algorithm visualizers, math concept explorers. But there's no good way to:

1. **Run them** without setting up a fresh React project every time
2. **Organize them** into a browsable collection
3. **Find them later** when you want to revisit a concept

SimLab solves all three. Drop a `.jsx` file into a folder, and it instantly becomes a card in a searchable, categorized interface.

---

## Technology Stack

### 1. Vite (v8) — Build Tool & Dev Server

**What it is**: A next-generation frontend build tool that serves code via native ES modules during development, making startup near-instant regardless of project size.

**Why we use it**: Vite's `import.meta.glob()` API is the backbone of SimLab. It lets us scan an entire directory of `.jsx` files at build time and generate lazy-loading imports for each one — without any manual configuration or route files.

**Where it lives**: `vite.config.js`

**Key mechanisms**:

- **`@vitejs/plugin-react`**: Transforms JSX syntax into plain JavaScript. Without this, browsers can't understand `<div>` inside JS files.

- **`import.meta.glob('/sims/**/*.jsx')`**: This is a Vite-specific API. At build time, Vite scans the filesystem for every `.jsx` file matching the glob pattern and generates a JavaScript object like:
  ```js
  {
    '/sims/examples/wave-interference.jsx': () => import('/sims/examples/wave-interference.jsx'),
    '/sims/examples/sorting-visualizer.jsx': () => import('/sims/examples/sorting-visualizer.jsx'),
  }
  ```
  Each value is a **lazy import function** — the file isn't loaded until the user clicks on it.

- **Custom `sim-watcher` plugin**: A tiny Vite plugin defined inline in the config. It hooks into Vite's dev server via `configureServer()` and listens for filesystem `add`/`unlink` events in the `sims/` directory. When a new `.jsx` file appears (or one is deleted), it calls `server.restart()` to re-evaluate the glob and update the index. This means you can drop a file in and just refresh the browser.

- **Path aliases**: `@` is aliased to `src/` so imports like `import { cn } from '@/lib/utils'` work cleanly.

---

### 2. React (v19) — UI Framework

**What it is**: A component-based JavaScript library for building user interfaces.

**Why we use it**: The simulation files are React components. The host app must also be React to render them. React 19 is the latest major version with improved performance.

**Key patterns used**:

- **Functional components** with hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`)
- **`useMemo`** for memoizing filtered simulation lists (search + category filtering)
- **Dynamic component rendering**: `SimulationView` stores the loaded component in state via `setComponent(() => mod.default)` — the function wrapper prevents React from calling it during setState
- **Error boundaries**: A class component (`ErrorBoundary`) that catches render errors via `getDerivedStateFromError` and `componentDidCatch`. This is the only React pattern that still requires class components.

---

### 3. React Router DOM (v7) — Client-Side Routing

**What it is**: The standard routing library for React single-page applications.

**Why we use it**: Provides URL-based navigation so each simulation has a unique, shareable URL.

**Configuration**:

- **`HashRouter`** (not `BrowserRouter`): Uses URL hashes (`/#/sim/examples/wave-interference`) instead of clean URLs (`/sim/...`). This works without any server configuration — critical since this is a local dev tool, not a deployed web app.

- **Catch-all route**: `<Route path="/sim/*" element={<SimulationView />} />` matches any path depth under `/sim/`. Inside `SimulationView`, `useParams()['*']` extracts the full slug (e.g., `examples/wave-interference`), which maps directly to the file path `sims/examples/wave-interference.jsx`.

**Routes**:
| URL Pattern | Component | Purpose |
|---|---|---|
| `/#/` | `Home` | Index page with search and grid |
| `/#/sim/<category>/<name>` | `SimulationView` | Renders a specific simulation |

---

### 4. Tailwind CSS (v3) — Utility-First CSS Framework

**What it is**: A CSS framework that provides low-level utility classes (`flex`, `p-4`, `rounded-xl`) instead of pre-built components. You compose styles directly in HTML/JSX.

**Why we use it**: AI-generated JSX files frequently use Tailwind classes. By including Tailwind in the host app, those classes work automatically. It also made building the host UI much faster.

**Configuration** (`tailwind.config.js`):

- **Content scanning**: Tailwind tree-shakes unused CSS. It scans `./src/**/*.{js,jsx}` AND `./sims/**/*.{js,jsx}` — so Tailwind classes in simulation files are included in the build.
- **Font family**: Extended with Inter (loaded from Google Fonts) and JetBrains Mono for monospace.

**PostCSS pipeline** (`postcss.config.js`):

Tailwind integrates as a PostCSS plugin. The CSS processing chain is:
```
src/index.css → PostCSS → [Tailwind CSS] → [Autoprefixer] → final CSS
```

- **Tailwind CSS**: Processes `@tailwind` directives, `@apply` rules, and generates utility classes
- **Autoprefixer**: Adds vendor prefixes (`-webkit-`, `-moz-`) for browser compatibility

**Custom CSS layers** (`src/index.css`):

Tailwind's `@layer` directive organizes custom styles:
- `@layer base` — global defaults (body background, font smoothing, text selection color)
- `@layer components` — reusable component classes (`glass`, `sim-card`, `pill`, `pill-active`, `pill-inactive`)
- `@layer utilities` — one-off utilities (`gradient-text`)

**Design tokens**:
- Background: `zinc-950` (#09090b)
- Surface: `zinc-900` (#18181b)
- Borders: `zinc-800` (#27272a)
- Primary accent: `indigo-400`/`indigo-500`
- Text: `zinc-100` (primary), `zinc-400`/`zinc-500` (secondary)

---

### 5. Lucide React — Icon Library

**What it is**: A collection of 1000+ clean, consistent SVG icons as React components.

**How we use it**: Each simulation category maps to a Lucide icon via the `CATEGORY_ICONS` object in `Home.jsx`. For example, a folder named `physics/` gets the `Atom` icon, `algorithms/` gets `Code`, `biology/` gets `Dna`. UI chrome (search icon, arrows, alerts) also uses Lucide.

---

### 6. Framer Motion — Animation Library

**What it is**: A production-ready React animation library.

**Status**: Installed as a dependency primarily for simulation files to use. Many AI-generated simulations import `framer-motion` for animations. Having it pre-installed means those files work out of the box. The host app uses CSS animations instead for simplicity.

---

### 7. ESM (ES Modules) — Module System

**What it is**: The modern JavaScript module system using `import`/`export` syntax.

**How it's configured**: `"type": "module"` in `package.json` tells Node.js to treat all `.js` files as ES modules. This affects config files (`vite.config.js`, `tailwind.config.js`, `postcss.config.js`) — they all use `export default` instead of `module.exports`.

**Why it matters**: Vite is ESM-native. Using ESM throughout avoids the CommonJS/ESM interop issues that plague many JavaScript projects.

---

## Architecture Deep Dive

### Simulation Auto-Discovery Pipeline

```
sims/                          File dropped by user
  └── physics/
      └── pendulum.jsx

        ↓ Vite startup / restart

import.meta.glob('/sims/**/*.jsx')    Glob evaluated
  → { '/sims/physics/pendulum.jsx': () => import(...) }

        ↓ loader.js transforms

getSimulations() returns:
  [{
    slug: 'physics/pendulum',
    name: 'Pendulum',
    category: 'Physics',
    categorySlug: 'physics',
    loader: () => import('/sims/physics/pendulum.jsx')
  }]

        ↓ Home.jsx renders

Card grid with search + category filters

        ↓ User clicks card

HashRouter navigates to /#/sim/physics/pendulum

        ↓ SimulationView.jsx

slug = 'physics/pendulum'
sim.loader() → dynamic import → module.default
setComponent(() => PendulumComponent)

        ↓ React renders

<ErrorBoundary>
  <PendulumComponent />
</ErrorBoundary>
```

### File-to-Category Mapping

The path structure determines the category:

| File Path | Category | Name |
|---|---|---|
| `sims/physics/pendulum.jsx` | Physics | Pendulum |
| `sims/algorithms/bfs.jsx` | Algorithms | Bfs |
| `sims/machine-learning/gradient-descent.jsx` | Machine Learning | Gradient Descent |
| `sims/my-simulation.jsx` | Uncategorized | My Simulation |

Name formatting: hyphens and underscores become spaces, each word is capitalized.

### Card Color Assignment

Each card gets a deterministic gradient color based on its slug. The `hashIndex()` function in `src/lib/utils.js` computes a numeric hash of the slug string, then takes `hash % 8` to index into the `GRADIENTS` array. This ensures:
- The same simulation always gets the same color
- Different simulations get visually distinct colors
- No randomness — colors are stable across page loads

### Error Handling Strategy

Three layers of error handling protect against broken simulation files:

1. **Import error** — If the `.jsx` file has syntax errors or missing dependencies, the dynamic `import()` promise rejects. `SimulationView` catches this and shows a "Failed to Load" screen.

2. **Render error** — If the component imports successfully but throws during rendering, the `ErrorBoundary` class component catches it via `getDerivedStateFromError` and shows an inline error with a "Try Again" button.

3. **Not found** — If the URL slug doesn't match any file in the glob, `getSimulation()` returns `null` and a "Simulation Not Found" screen appears.

---

## Project File Manifest

```
simulations/
├── index.html              Entry HTML — loads Inter font, sets up #root
├── package.json            Dependencies + scripts (dev/build/preview)
├── vite.config.js          Vite + React plugin + sim-watcher plugin + @ alias
├── tailwind.config.js      Content paths (src + sims), font overrides
├── postcss.config.js       Tailwind + Autoprefixer pipeline
├── .gitignore              node_modules, dist, .DS_Store
├── README.md               Quick-start guide
├── AGENTS.md               Persistent AI agent context
├── explain.md              This file
│
├── src/
│   ├── main.jsx            React root mount + HashRouter wrapper
│   ├── index.css           Tailwind directives + custom layers + scrollbar
│   ├── App.jsx             Route definitions (/ and /sim/*)
│   ├── lib/
│   │   └── utils.js        cn() classname merge + hashIndex() color hash
│   ├── utils/
│   │   └── loader.js       import.meta.glob discovery + getSimulations/Categories/Simulation
│   └── components/
│       ├── Layout.jsx      Shell: ambient gradient bg + navbar (hidden on sim view)
│       ├── Home.jsx        Hero, search, category pills, card grid, empty state
│       ├── SimulationView.jsx  Dynamic loader, toolbar, fullscreen, error states
│       └── ErrorBoundary.jsx   Class component error catcher with retry
│
└── sims/                   ← USER CONTENT GOES HERE
    └── examples/
        ├── wave-interference.jsx    Canvas-based 2-source wave physics sim
        └── sorting-visualizer.jsx   4-algorithm sorting visualizer with animation
```

---

## Dependencies Explained

### Runtime Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19 | Component model, hooks, rendering engine |
| `react-dom` | ^19 | DOM-specific rendering (mounts React into `<div id="root">`) |
| `react-router-dom` | ^7 | Client-side URL routing with HashRouter |
| `lucide-react` | ^0.577 | SVG icon components (Atom, Search, ArrowLeft, etc.) |
| `framer-motion` | ^12 | Animation library (available for simulation files to import) |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `vite` | ^8 | Dev server + production bundler, provides `import.meta.glob` |
| `@vitejs/plugin-react` | ^6 | JSX transformation, React Fast Refresh (HMR) |
| `tailwindcss` | ^3 | Utility CSS framework, scans files for class usage |
| `postcss` | ^8 | CSS transformation pipeline (required by Tailwind) |
| `autoprefixer` | ^10 | Adds vendor prefixes to CSS for browser compat |
