import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import CommandPalette from './CommandPalette';
import { Search } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const isSimulation = location.pathname.startsWith('/sim/');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden">
      <CommandPalette />
      {/* Ambient background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-violet-950/15" />
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-indigo-500/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Navigation Sidebar */}
      {!isSimulation && <Sidebar />}

      {/* Main content */}
      <main className="flex-1 relative z-10 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
