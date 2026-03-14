import { User, Mail, Github, Twitter, ExternalLink } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-[800px] mx-auto px-8 md:px-12 py-12 pb-32 animate-fade-in-up">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4 gradient-text">About Me</h1>
        <p className="text-xl text-zinc-400">
          Hi, I'm the creator of this simulation library.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-zinc-100 mb-6 flex items-center gap-3">
            <User className="w-6 h-6 text-indigo-400" />
            Background
          </h2>
          <div className="space-y-4 text-zinc-300 leading-relaxed">
            <p>
              Write your background and details here. You can edit this section in <code>src/components/About.jsx</code>.
            </p>
            <p>
              This platform was built to host interactive simulations and visual explainers for complex concepts across different domains.
            </p>
          </div>
        </section>

        <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-zinc-100 mb-6 flex items-center gap-3">
            <Mail className="w-6 h-6 text-indigo-400" />
            Connect
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="#" className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors group">
              <Github className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200" />
              <span className="text-zinc-300 group-hover:text-zinc-100">GitHub</span>
              <ExternalLink className="w-4 h-4 ml-auto text-zinc-600 group-hover:text-zinc-400" />
            </a>
            <a href="#" className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors group">
              <Twitter className="w-5 h-5 text-zinc-400 group-hover:text-zinc-200" />
              <span className="text-zinc-300 group-hover:text-zinc-100">Twitter</span>
              <ExternalLink className="w-4 h-4 ml-auto text-zinc-600 group-hover:text-zinc-400" />
            </a>
            {/* Add more links as needed */}
          </div>
        </section>
      </div>
    </div>
  );
}