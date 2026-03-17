# Principia

Interactive simulations for electrical engineering and statistics — built as a personal learning tool.

**[Live Site](https://gsuryaias.github.io/principia/)**

## What is this?

I'm [Surya Praveenchand](https://www.linkedin.com/in/praveenchandgss/), an IAS officer currently serving as Joint Managing Director at APTRANSCO (AP Transmission Corporation). When I joined TRANSCO, I wanted to go back to the basics of electrical engineering and recap the fundamentals. In the process, I started building interactive simulations to help myself visualize and understand concepts better.

That's how Principia came about — not as a grand project, but as a personal learning tool that grew over time. The name is a nod to Newton's *Principia Mathematica* — starting from first principles.

This project is entirely [vibe coded](https://en.wikipedia.org/wiki/Vibe_coding) using AI-assisted development, with simulation content grounded in standard references like Nagrath & Kothari, Stevenson, C.L. Wadhwa, and other textbooks that most electrical engineering students would be familiar with.

## Simulations (62+)

| Category | Topics |
|----------|--------|
| **Basic Principles** | Circuit theory, electromagnetic fundamentals, semiconductors |
| **Electric Machines** | DC motors & generators, induction motors, alternators, speed control, equivalent circuits |
| **Power Systems** | Substation layouts, battery energy storage, data center power, EV charging, inverter-based resources |
| **Protection** | Overcurrent, distance, differential & directional relays, circuit breakers, CT/PT characteristics |
| **Transmission & Distribution** | ABCD parameters, corona effect, Ferranti effect, HVDC, capacitor placement, distribution systems |
| **Statistics** | Probability, distributions, hypothesis testing, regression, sampling, confidence intervals |

Each simulation lets you tweak parameters and see results in real time — more useful than static diagrams in textbooks.

## Getting Started

```bash
git clone https://github.com/gsuryaias/principia.git
cd principia
npm install
npm run dev
```

Open [http://localhost:5173/principia/](http://localhost:5173/principia/) in your browser.

## Adding Simulations

1. Drop any `.jsx` file into the `sims/` folder
2. Use subfolders to organize by topic (each subfolder becomes a category)
3. The dev server auto-detects new files — just refresh

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

## Deployment

The site is deployed on GitHub Pages. To deploy:

```bash
npm run build
```

Push the built output to the `gh-pages` branch, or configure GitHub Actions to do it automatically.

## Tech Stack

- React 19, React Router, Vite
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)
- Recharts (charts in simulations)

## Disclaimer

Since this project is vibe coded, there may be inaccuracies, gaps, or oversimplifications in some simulations. I've tried to ground everything in standard references, but errors are possible. These simulations are meant as learning aids, not as substitutes for textbooks or professional engineering judgment.

If you spot something wrong or have suggestions, please [open an issue](https://github.com/gsuryaias/principia/issues) or submit a pull request — I'd be happy to correct it.

## Connect

I'm interested in exploring how AI/ML can be applied in the power sector — predictive maintenance, load forecasting, grid optimization, fault detection. If you're working on similar problems, feel free to reach out.

- [LinkedIn](https://www.linkedin.com/in/praveenchandgss/)
- [Instagram](https://www.instagram.com/praveenchandias/)

## License

MIT
