import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCategories } from '../utils/loader';
import { Sparkles, User } from 'lucide-react';

export default function Sidebar() {
  const categories = getCategories();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAbout = location.pathname === '/about';

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
          <Link
            to="/"
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isHome ? 'bg-indigo-500/10 text-indigo-300' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            All Simulations
          </Link>
          {categories.map((cat) => {
            const isActive = location.pathname === `/category/${cat.slug}`;
            return (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-300'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                  isActive ? 'bg-indigo-500/20 text-indigo-200' : 'text-zinc-600 bg-zinc-900'
                }`}>
                  {cat.count}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
