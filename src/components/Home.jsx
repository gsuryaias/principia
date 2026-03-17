import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  Network,
  Shield,
  BarChart3,
  Sparkles
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
  protection: Shield,
  'transmission-distribution': Cable,
  'power-systems': Network,
  'basic-principles': Zap,
  statistics: BarChart3,
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
  const { categoryId } = useParams();
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

    if (categoryId) {
      const selectedCat = categories.find(c => c.slug === categoryId);
      if (!selectedCat) return [];
      return [{
        category: selectedCat,
        sims: simulations.filter(sim => sim.categorySlug === categoryId)
      }];
    }

    return categories.map(cat => ({
      category: cat,
      sims: simulations.filter(sim => sim.categorySlug === cat.slug)
    })).filter(group => group.sims.length > 0);
  }, [simulations, categories, search, categoryId]);

  return (
    <div className="max-w-[1400px] mx-auto px-8 md:px-12 py-12 pb-32">
      
      {/* Top Search Bar */}
      <div className="flex justify-center mb-10">
        <div className="relative group w-full max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
          <input
            type="text"
            placeholder="Search simulations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-14 pr-4 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl
                       text-lg text-zinc-100 placeholder-zinc-500
                       focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:bg-zinc-900
                       transition-all duration-200 shadow-xl"
          />
        </div>
      </div>

      {search === '' && !categoryId && (
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
                isSingleCategory={!!categoryId}
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
    <div className="relative rounded-[2rem] overflow-hidden mb-12 bg-zinc-900 border border-zinc-800/60 shadow-xl animate-fade-in-up">
      {/* Abstract Backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-indigo-950/40" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px]" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px]" />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />

      <div className="relative p-8 md:p-12 lg:p-14 flex flex-col md:flex-row items-center gap-8 lg:gap-16">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Featured Simulation
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
            Basics of
            <span className="gradient-text ml-3">Magnetism</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-xl leading-relaxed mb-8">
            Explore electromagnetic fundamentals. Visualize magnetic fields, understand Lorentz force, and see how electric currents create magnetic flux in real-time.
          </p>
          <Link
            to="/sim/basic-principles/electromagnetic-fundamentals"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors shadow-lg shadow-indigo-500/25"
          >
            <PlayCircle className="w-5 h-5" />
            Start Simulation
          </Link>
        </div>
      </div>
    </div>
  );
}

function BentoCard({ sim, index }) {
  const gIdx = hashIndex(sim.slug, GRADIENTS.length);
  const [bgGradient, accentGradient] = GRADIENTS[gIdx];
  const IconComponent = CATEGORY_ICONS[sim.categorySlug] || Box;

  return (
    <div className="group h-full">
      <Link to={`/sim/${sim.slug}`} className="block h-full">
        <div className="sim-card relative h-full flex flex-col justify-center p-5 overflow-hidden min-h-[5.5rem]">
          <div className="flex items-center gap-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${bgGradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out shadow-lg`}>
              <IconComponent className="w-6 h-6 text-white/90" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors text-base leading-snug">
                {sim.name}
              </h3>
            </div>
            
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
              <PlayCircle className="w-4 h-4 text-indigo-300" />
            </div>
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

function CategorySection({ group, isSearch, isSingleCategory }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = CATEGORY_ICONS[group.category.slug] || Box;

  const INITIAL_LIMIT = 8;
  const showAll = isExpanded || isSearch || isSingleCategory;
  const hasMore = !showAll && group.sims.length > INITIAL_LIMIT;
  const displaySims = showAll ? group.sims : group.sims.slice(0, INITIAL_LIMIT);

  return (
    <section id={group.category.slug} className="scroll-mt-32">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-sm">
          <IconComponent className="w-5 h-5 text-zinc-400" />
        </div>
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-100 flex items-center gap-3">
          {group.category.name}
          {!isSearch && (
            <span className="text-sm font-medium text-zinc-500 bg-zinc-800/50 px-2.5 py-0.5 rounded-full border border-zinc-700/50">
              {group.sims.length}
            </span>
          )}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displaySims.map((sim, i) => (
          <BentoCard 
            key={sim.slug} 
            sim={sim} 
            index={i} 
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
