# SimLab — Interactive Learning Laboratory

A local-first platform for collecting, organizing, and running interactive JSX simulations. Drop in JSX files from Claude, ChatGPT, or any source — they instantly appear in a beautiful browsable interface.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Adding Simulations

1. Drop any `.jsx` file into the `sims/` folder
2. Use subfolders to organize by topic (each subfolder becomes a category)
3. The dev server auto-detects new files — just refresh

### File Structure

```
sims/
├── physics/
│   ├── pendulum.jsx
│   └── wave-interference.jsx
├── algorithms/
│   └── sorting-visualizer.jsx
├── math/
│   └── fourier-transform.jsx
└── any-topic/
    └── your-simulation.jsx
```

### Simulation File Format

Each file should export a default React component:

```jsx
import React, { useState } from 'react';

export default function MySimulation() {
  const [value, setValue] = useState(0);

  return (
    <div style={{ padding: 24 }}>
      <h2>My Simulation</h2>
      {/* Your interactive content */}
    </div>
  );
}
```

## Available Dependencies

These are pre-installed and available for use in simulation files:

| Package | Use Case |
|---------|----------|
| `react`, `react-dom` | Core React |
| `framer-motion` | Animations |
| `lucide-react` | Icons |
| `recharts` | Charts (install with `npm i recharts`) |

Need additional packages? Just `npm install <package>` and use them in your simulations.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Tips

- **Inline styles** work best for portable simulations
- **Tailwind classes** are available since the `sims/` folder is scanned
- Simulations render full-width — use the fullscreen button for immersive view
- The error boundary catches render errors gracefully — click "Try Again" to retry
- Canvas-based simulations should handle resize via `ResizeObserver`

## License

MIT
