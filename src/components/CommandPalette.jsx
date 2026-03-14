import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, Box, ArrowRight } from 'lucide-react';
import { getSimulations } from '../utils/loader';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const simulations = getSimulations();
  
  const filtered = search.trim() === '' 
    ? simulations.slice(0, 5) // Show top 5 when empty
    : simulations.filter(sim => 
        sim.name.toLowerCase().includes(search.toLowerCase()) || 
        sim.category.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 8); // Max 8 results

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  const handleSelect = (slug) => {
    setIsOpen(false);
    navigate(`/sim/${slug}`);
  };

  const handlePaletteKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      e.preventDefault();
      handleSelect(filtered[activeIndex].slug);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm cursor-pointer animate-fade-in" 
        onClick={() => setIsOpen(false)}
      />
      
      {/* Palette */}
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-down">
        <div className="flex items-center px-4 border-b border-zinc-800/80">
          <Search className="w-5 h-5 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            className="w-full h-14 bg-transparent border-none pl-4 pr-12 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-0 text-lg"
            placeholder="Search simulations, concepts, or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handlePaletteKeyDown}
          />
          <div className="absolute right-4 flex items-center gap-1">
            <kbd className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400 font-mono flex items-center gap-1">
              ESC
            </kbd>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Box className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">No results found for "{search}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {search === '' ? 'Suggestions' : 'Results'}
              </div>
              {filtered.map((sim, index) => (
                <button
                  key={sim.slug}
                  onClick={() => handleSelect(sim.slug)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all ${
                    index === activeIndex 
                      ? 'bg-indigo-500/10 text-indigo-300 relative' 
                      : 'text-zinc-300 hover:bg-zinc-800/50'
                  }`}
                >
                  {index === activeIndex && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-md" />
                  )}
                  <div className="flex flex-col items-start text-left">
                    <span className={`font-medium ${index === activeIndex ? 'text-indigo-300' : 'text-zinc-100'}`}>
                      {sim.name}
                    </span>
                    <span className="text-xs text-zinc-500 mt-0.5">
                      {sim.category}
                    </span>
                  </div>
                  {index === activeIndex && (
                    <ArrowRight className="w-4 h-4 text-indigo-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer shortcuts */}
        <div className="px-4 py-3 bg-zinc-950/50 border-t border-zinc-800/80 flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-mono">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-mono">↓</kbd>
            <span>to navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] font-mono">↵</kbd>
            <span>to select</span>
          </span>
        </div>
      </div>
    </div>
  );
}
