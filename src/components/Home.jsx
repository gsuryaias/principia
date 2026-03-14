import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  FolderOpen,
  Atom,
  Calculator,
  Code,
  FlaskConical,
  Lightbulb,
  Box,
  BrainCircuit,
  Waves,
  ArrowRight,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Cog,
  Cable,
  Network
} from 'lucide-react';
import { getSimulations, getCategories } from '../utils/loader';
import { hashIndex } from '../lib/utils';

const CATEGORY_ICONS = {
  physics: Atom,
  math: Calculator,
  mathematics: Calculator,
  'computer-science': Code,
  cs: Code,
  algorithms: Code,
  chemistry: FlaskConical,
  biology: Atom,
  'machine-learning': BrainCircuit,
  ai: BrainCircuit,
  signals: Waves,
  examples: Lightbulb,
  uncategorized: Box,
  'electric-machines': Cog,
  'transmission-distribution': Cable,
  'power-systems': Network,
};

const GRADIENTS = [
  ['from-indigo-500/20 to-purple-500/20', 'from-indigo-500 to-purple-500'],
  ['from-cyan-500/20 to-blue-500/20', 'from-cyan-500 to-blue-500'],
  ['from-emerald-500/20 to-teal-500/20', 'from-emerald-500 to-teal-500'],
  ['from-rose-500/20 to-pink-500/20', 'from-rose-500 to-pink-500'],
  ['from-amber-500/20 to-orange-500/20', 'from-amber-500 to-orange-500'],
  ['from-violet-500/20 to-fuchsia-500/20', 'from-violet-500 to-fuchsia-500'],
  ['from-sky-500/20 to-indigo-500/20', 'from-sky-500 to-indigo-500'],
  ['from-lime-500/20 to-emerald-500/20', 'from-lime-500 to-emerald-500'],
];

export default function Home() {
  const [search, setSearch] = useState('');
  
  const simulations = getSimulations();
  const categories = getCategories();

  const isEmpty = simulations.length === 0;

  // Group simulations by category for the bento layout
  const groupedSims = useMemo(() => {
    if (search.trim() !== '') {
      // If searching, just show a flat list of results
      const lowerSearch = search.toLowerCase();
      return [{
        category: { slug: 'search-results', name: 'Search Results' },
        sims: simulations.filter(sim => 
          sim.name.toLowerCase().includes(lowerSearch) || 
          sim.category.toLowerCase().includes(lowerSearch)
        )
      }];
    }

    return categories.map(cat => ({
      category: cat,
      sims: simulations.filter(sim => sim.categorySlug === cat.slug)
    })).filter(group => group.sims.length > 0);
  }, [simulations, categories, search]);

  return (
    <div className="max-w-[1400px] mx-auto px-8 md:px-12 py-12 pb-32">
      
      {/* Top Search Bar */}
      <div className="flex justify-end mb-12">
        <div className="relative group w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
          <input
            type="text"
            placeholder="Search library..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-zinc-900/50 border border-zinc-800/80 rounded-full
                       text-sm text-zinc-100 placeholder-zinc-500
                       focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:bg-zinc-900
                       transition-all duration-200"
          />
        </div>
      </div>

      {search === '' && (
        <HeroBanner />
      )}

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="space-y-24">
          {groupedSims.map((group) => {
            if (group.sims.length === 0) return null;
            return (
              <CategorySection 
                key={group.category.slug} 
                group={group} 
                isSearch={search.trim() !== ''} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function HeroBanner() {
  return (
    <div className="relative rounded-[2rem] overflow-hidden mb-20 bg-zinc-900 border border-zinc-800/60 shadow-2xl animate-fade-in-up">
      {/* Abstract Backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/40" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]" />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />

      <div className="relative p-10 md:p-16 lg:p-20 flex flex-col md:flex-row items-center gap-12 lg:gap-24">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-xs font-medium text-zinc-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Open Learning Library
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Explore Interactive
            <br />
            <span className="gradient-text">Simulations</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-xl leading-relaxed">
            A curated collection of complex concepts brought to life through beautiful, interactive visualizations.
          </p>
        </div>
        
        {/* Playful abstract geometric representation for hero */}
        <div className="hidden md:flex relative w-64 h-64 items-center justify-center">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-900 to-transparent z-10" />
          <div className="relative w-48 h-48 animate-spin-slow">
             <div className="absolute inset-0 border border-indigo-500/30 rounded-full" />
             <div className="absolute inset-4 border border-purple-500/30 rounded-full border-dashed" />
             <div className="absolute inset-12 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full backdrop-blur-xl border border-white/10" />
             <div className="absolute top-1/2 left-0 w-3 h-3 bg-indigo-400 rounded-full -translate-y-1/2 -translate-x-1/2 shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
             <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-purple-400 rounded-full -translate-x-1/2 translate-y-1/2 shadow-[0_0_15px_rgba(192,132,252,0.5)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BentoCard({ sim, index, featured }) {
  const gIdx = hashIndex(sim.slug, GRADIENTS.length);
  const [bgGradient, accentGradient] = GRADIENTS[gIdx];
  const IconComponent = CATEGORY_ICONS[sim.categorySlug] || Box;

  return (
    <div
      className={`animate-fade-in-up group h-full ${
        featured ? 'md:col-span-2' : 'col-span-1'
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <Link to={`/sim/${sim.slug}`} className="block h-full">
        <div className="sim-card h-full flex flex-col p-6">
          <div className="flex justify-between items-start mb-auto">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out shadow-lg`}>
              <IconComponent className="w-6 h-6 text-white/90" />
            </div>
            
            <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1">
              <PlayCircle className="w-4 h-4 text-indigo-300" />
            </div>
          </div>

          <div className="mt-8">
            <h3 className={`font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors mb-2 ${featured ? 'text-2xl lg:text-3xl' : 'text-lg'}`}>
              {sim.name}
            </h3>
            {featured && (
              <p className="text-zinc-400 text-sm md:text-base line-clamp-2 max-w-md">
                Interactive visualization and theory breakdown for {sim.name.toLowerCase()}. Open the simulation to explore parameters.
              </p>
            )}
          </div>
          
          {/* Subtle glowing accent line that appears on hover */}
          <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        </div>
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-32">
      <div className="w-20 h-20 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-8">
        <Box className="w-10 h-10 text-zinc-600" />
      </div>
      <h3 className="text-2xl font-semibold text-zinc-300 mb-4">
        Library is empty
      </h3>
      <p className="text-zinc-500 max-w-md mx-auto leading-relaxed text-lg">
        Drop JSX files into the{' '}
        <code className="text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-md text-sm font-mono border border-zinc-700">
          sims/
        </code>{' '}
        folder to populate the library.
      </p>
    </div>
  );
}

function CategorySection({ group, isSearch }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = CATEGORY_ICONS[group.category.slug] || Box;

  const INITIAL_LIMIT = 5;
  const hasMore = !isSearch && group.sims.length > INITIAL_LIMIT;
  const displaySims = (isExpanded || isSearch) ? group.sims : group.sims.slice(0, INITIAL_LIMIT);

  return (
    <section id={group.category.slug} className="scroll-mt-32">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 flex items-center gap-3">
          {group.category.name}
          {!isSearch && (
            <span className="text-sm font-medium text-zinc-500 bg-zinc-800/50 px-2.5 py-0.5 rounded-full border border-zinc-700/50">
              {group.sims.length}
            </span>
          )}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-[280px]">
        {displaySims.map((sim, i) => (
          <BentoCard 
            key={sim.slug} 
            sim={sim} 
            index={i} 
            // Make the first item in each category a featured wide card if we have enough space
            featured={i === 0 && displaySims.length > 1} 
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-sm font-medium text-zinc-300 transition-all duration-200"
          >
            {isExpanded ? (
              <>
                Show Less
                <ChevronUp className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </>
            ) : (
              <>
                View All {group.sims.length} Simulations
                <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
