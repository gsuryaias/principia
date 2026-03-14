# SimLab — Agent Context

## Project Identity

**SimLab** is a local-first React app for collecting, organizing, and running interactive JSX simulations. The user receives standalone JSX simulation files from AI assistants (Claude, ChatGPT) that explain complex topics through interactive visualizations. This app is the viewer/organizer for those files.

## Architecture Summary

- **Framework**: React 19 + Vite 8 (ESM, no bundler config needed by user)
- **Styling**: Tailwind CSS v3 (utility-first, dark theme, zinc palette + indigo accents)
- **Routing**: react-router-dom v7 with `HashRouter` (client-side, no server needed)
- **Animations**: framer-motion for layout transitions; CSS `@keyframes` for entrance animations
- **Icons**: lucide-react
- **No backend** — purely client-side, runs via `npm run dev`

## Critical Paths

| What | Where |
|---|---|
| Simulation files (user content) | `sims/**/*.jsx` |
| Auto-discovery logic | `src/utils/loader.js` — uses `import.meta.glob('/sims/**/*.jsx')` |
| Home page / index | `src/components/Home.jsx` |
| Simulation viewer | `src/components/SimulationView.jsx` |
| Error boundary | `src/components/ErrorBoundary.jsx` |
| Layout shell + nav | `src/components/Layout.jsx` |
| CSS design system | `src/index.css` (Tailwind layers + custom classes) |
| Vite config + sim-watcher plugin | `vite.config.js` |
| Shared utilities | `src/lib/utils.js` (`cn()`, `hashIndex()`) |

## How Simulation Discovery Works

1. `import.meta.glob('/sims/**/*.jsx')` in `loader.js` returns a map of `{ path → lazy loader }` at build/dev time.
2. Each path is parsed: folder structure → category, filename → display name.
3. The `Home` component calls `getSimulations()` and renders cards in a filterable grid.
4. Clicking a card navigates to `/sim/<slug>`, where `SimulationView` calls the lazy loader and renders the default export.
5. A custom Vite plugin (`sim-watcher`) watches the `sims/` directory and auto-restarts the dev server when `.jsx` files are added or removed.

## Simulation File Contract

Each file in `sims/` **must**:
- Be a `.jsx` file
- `export default` a React component
- Be self-contained (can import from `react`, `framer-motion`, `lucide-react`, `recharts`, or any `npm install`-ed package)

## Design System

- **Dark theme only** — `bg-zinc-950` base, zinc scale for surfaces
- **Accent**: indigo-400/500 primary, violet secondary
- **Cards**: `sim-card` class (see `index.css`) — rounded-2xl, subtle hover lift + border glow
- **Category pills**: `pill`, `pill-active`, `pill-inactive` classes
- **Gradient text**: `gradient-text` utility
- **Typography**: Inter font, system-ui fallback
- **Category icons**: mapped in `Home.jsx` `CATEGORY_ICONS` — maps folder name → Lucide icon
- **Card gradients**: 8 gradient pairs, deterministically assigned via `hashIndex(slug)`

## Key Conventions

- All dependencies are **local** (`node_modules/`), nothing global
- `type: "module"` in package.json — all JS uses ESM imports
- Path alias: `@` → `src/` (configured in `vite.config.js`)
- Tailwind scans both `src/` and `sims/` for class usage
- HashRouter is used (URLs look like `/#/sim/physics/wave`) — works without server config
- Simulations render inside an `ErrorBoundary` so crashes don't break the app

## When Adding Features

- New categories are auto-created from folder names — no config needed
- To add a dependency that simulations commonly need: `npm install <pkg>` and it's available
- The `CATEGORY_ICONS` map in `Home.jsx` can be extended for new topic folders
- The `GRADIENTS` array in `Home.jsx` controls card color variety

## Commands

```bash
npm run dev      # Start dev server (Vite, port 5173+)
npm run build    # Production build → dist/
npm run preview  # Serve production build locally
```
