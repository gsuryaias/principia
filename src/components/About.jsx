import { User, Github, ExternalLink, Linkedin, Instagram, Heart, BookOpen, AlertTriangle } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-[800px] mx-auto px-8 md:px-12 py-12 pb-32 animate-fade-in-up">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4 gradient-text">About Me</h1>
        <p className="text-xl text-zinc-400">
          Hi, I'm <span className="text-zinc-200 font-medium">Surya Praveenchand</span>.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <a
            href="https://github.com/gsuryaias/principia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition-colors group"
          >
            <Github className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
            <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/praveenchandgss/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition-colors group"
          >
            <Linkedin className="w-4 h-4 text-zinc-400 group-hover:text-blue-400" />
            <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">LinkedIn</span>
          </a>
          <a
            href="https://www.instagram.com/praveenchandias/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition-colors group"
          >
            <Instagram className="w-4 h-4 text-zinc-400 group-hover:text-pink-400" />
            <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">Instagram</span>
          </a>
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-zinc-100 mb-6 flex items-center gap-3">
            <User className="w-6 h-6 text-indigo-400" />
            Background
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              I'm an <span className="font-medium text-zinc-200">IAS officer</span>, currently serving as Joint Managing Director at <span className="font-medium text-zinc-200">APTRANSCO</span>
              (AP Transmission Corporation). My background is in engineering from <span className="font-medium text-zinc-200">IIT Patna</span>,
              where I also co-authored a research paper on{' '}
              <a
                href="https://doi.org/10.1016/j.micpro.2015.07.013"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
              >
                ARM-based arrhythmia beat monitoring
              </a>
              {' '}published in Elsevier's Microprocessors and Microsystems journal — applying
              neural networks and signal processing for real-time cardiac diagnosis.
            </p>
            <p>
              When I joined TRANSCO, I wanted to go back to the basics of electrical engineering
              and recap the fundamentals — circuit theory, machines, protection systems, power
              systems, and transmission &amp; distribution. In the process of revising these concepts,
              I started building interactive simulations to help myself visualize and understand them
              better. That's how <span className="font-medium text-zinc-200">Principia</span> came about — not as a grand project, but as a personal
              learning tool that grew over time.
            </p>
            <p>
              I genuinely believe AI and machine learning can transform the power sector in ways
              that directly impact people's lives — whether it's predicting equipment failures before
              they cause outages, optimizing grid operations to reduce losses, or improving load
              forecasting to serve consumers better. These aren't distant possibilities; they're problems
              worth working on right now. If you share this interest, I'd be happy to connect.
            </p>
          </div>
        </section>

        <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-zinc-100 mb-6 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            About This Project
          </h2>
          <div className="space-y-6 text-zinc-300 leading-relaxed">
            <p>
              Principia is a collection of interactive simulations covering electrical engineering and
              statistics. Each simulation lets you tweak parameters and see the results in real time,
              which I find more useful than reading static diagrams in textbooks.
            </p>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Tech Stack & Approach</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-sm font-medium">React 19</span>
                <span className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-sm font-medium">Tailwind CSS</span>
                <span className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-sm font-medium">Vite</span>
                <span className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg text-sm font-medium">Framer Motion</span>
                <a
                  href="https://en.wikipedia.org/wiki/Vibe_coding"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors"
                >
                  AI Vibe Coded
                </a>
              </div>
              <p className="text-sm text-zinc-400">
                The simulation content is grounded in standard references
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
              <p className="text-sm text-zinc-300 m-0">
                The project is completely open source. If you find these simulations useful or want to contribute, feel free to explore the code.
              </p>
              <a
                href="https://github.com/gsuryaias/principia"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors shadow-lg shadow-indigo-500/25"
              >
                <Github className="w-4 h-4" />
                View Repository
              </a>
            </div>
          </div>
        </section>

        <section className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-lg font-medium text-zinc-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-zinc-500" />
            Disclaimer
          </h2>
          <div className="space-y-3 text-sm text-zinc-400 leading-relaxed">
            <p>
              Since this project is entirely AI vibe coded, there may be inaccuracies, gaps, or
              oversimplifications. I've tried to ground everything in standard references, but errors
              are possible. If you spot something wrong, please{' '}
              <a
                href="https://github.com/gsuryaias/principia/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 hover:text-zinc-100 underline underline-offset-2"
              >
                raise an issue on GitHub
              </a>.
            </p>
            <p>
              These simulations are meant as learning aids, not as substitutes for textbooks
              or professional engineering judgment.
            </p>
          </div>
        </section>

        <div className="text-center pt-4">
          <p className="text-zinc-500 text-sm flex items-center justify-center gap-1.5">
            Built with <Heart className="w-3.5 h-3.5 text-red-500" /> by Surya Praveenchand
          </p>
        </div>
      </div>
    </div>
  );
}