import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Maximize, Minimize, Loader2, AlertTriangle } from 'lucide-react';
import { getSimulation } from '../utils/loader';
import ErrorBoundary from './ErrorBoundary';

export default function SimulationView() {
  const params = useParams();
  const slug = params['*'];
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(true);

  const sim = getSimulation(slug);

  useEffect(() => {
    if (!sim) {
      setError('Simulation not found');
      setLoading(false);
      return;
    }

    sim
      .loader()
      .then((mod) => {
        setComponent(() => mod.default);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [sim]);

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // fullscreen not supported
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Loading simulation...</p>
        </div>
      </div>
    );
  }

  if (error || !Component) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-200 mb-2">
            {error === 'Simulation not found'
              ? 'Simulation Not Found'
              : 'Failed to Load'}
          </h2>
          <p className="text-zinc-500 mb-6 text-sm leading-relaxed">
            {error || 'The simulation component could not be loaded.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to SimLab
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Toolbar */}
      {toolbarVisible && (
        <div className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all text-sm shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Link>
              <div className="w-px h-5 bg-zinc-800 shrink-0" />
              <div className="min-w-0">
                <h2 className="text-sm font-medium text-zinc-200 truncate">
                  {sim.name}
                </h2>
              </div>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-500 text-xs font-medium shrink-0">
                {sim.category}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setToolbarVisible(false)}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all text-xs"
                title="Hide toolbar (press Escape to show)"
              >
                Hide
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all"
                title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {fullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden toolbar restore hint */}
      {!toolbarVisible && (
        <button
          onClick={() => setToolbarVisible(true)}
          className="fixed top-3 left-3 z-50 px-3 py-1.5 rounded-lg bg-zinc-800/80 backdrop-blur border border-zinc-700/50 text-zinc-400 hover:text-zinc-200 text-xs transition-all opacity-30 hover:opacity-100"
        >
          Show toolbar
        </button>
      )}

      {/* Simulation container */}
      <div
        className={`${toolbarVisible ? '' : 'pt-0'}`}
        style={{ minHeight: toolbarVisible ? 'calc(100vh - 3rem)' : '100vh' }}
      >
        <ErrorBoundary>
          <Component />
        </ErrorBoundary>
      </div>
    </div>
  );
}
