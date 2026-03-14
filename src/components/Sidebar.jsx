import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCategories } from '../utils/loader';
import { Sparkles, User } from 'lucide-react';

export default function Sidebar() {
  const categories = getCategories();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isAbout = location.pathname === '/about';

  const handleScrollToCategory = (e, slug) => {
    e.preventDefault();
    if (isHome) {
      document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-zinc-800/50 bg-zinc-950/50 backdrop-blur-xl hidden md:flex flex-col overflow-y-auto">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 group mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center group-hover:bg-indigo-500/25 transition-colors">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="font-semibold text-xl tracking-tight text-zinc-100">
            Principia
          </span>
        </Link>
        
        <nav className="space-y-1">
          <Link
            to="/about"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-6 ${
              isAbout ? 'bg-indigo-500/10 text-indigo-300' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <User className="w-4 h-4" />
            About
          </Link>

          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-3">
            Exploration
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (isHome) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate('/');
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isHome ? 'bg-indigo-500/10 text-indigo-300' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            All Simulations
          </button>
          {categories.map((cat) => (
            <a
              key={cat.slug}
              href={`#${cat.slug}`}
              onClick={(e) => handleScrollToCategory(e, cat.slug)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 transition-colors"
            >
              <span>{cat.name}</span>
              <span className="text-xs text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded-md">
                {cat.count}
              </span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
