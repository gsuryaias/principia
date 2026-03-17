import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── colour palette ───────────────────────────────────────────────────────────
const C = {
  bg: '#09090b',
  surface: '#18181b',
  border: '#27272a',
  muted: '#52525b',
  text: '#e4e4e7',
  sub: '#a1a1aa',
  indigo: '#6366f1',
  cyan: '#22d3ee',
  emerald: '#34d399',
  amber: '#fbbf24',
  rose: '#f43f5e',
  violet: '#a78bfa',
  sky: '#38bdf8',
};

// ─── architecture nodes ───────────────────────────────────────────────────────
const LAYERS = [
  {
    id: 'sources',
    label: 'Data Sources',
    color: C.cyan,
    icon: '📡',
    x: 0,
    items: [
      { label: '435+ RSS Feeds', sub: '15 topic categories' },
      { label: '92 Stock Exchanges', sub: 'commodities, crypto' },
      { label: 'Gov & Infra APIs', sub: 'disasters, military' },
    ],
    detail:
      'WorldMonitor ingests 435+ hand-curated RSS feeds spanning geopolitics, tech, finance, disasters, and more. '
      + 'Raw XML/JSON from feeds is fetched on a schedule (≈5 min) via 60+ Vercel Edge Functions deployed globally. '
      + 'Financial data from 92 exchanges is pulled through dedicated feed adapters, and the same '
      + 'pipeline handles commodities, crypto, and government data streams.',
  },
  {
    id: 'ai',
    label: 'AI Processing',
    color: C.violet,
    icon: '🧠',
    x: 1,
    items: [
      { label: 'LLM Summarisation', sub: 'Ollama · Groq · OpenRouter' },
      { label: 'Signal Correlation', sub: 'military × economic × disaster' },
      { label: 'Risk Scoring', sub: '12-signal country index' },
    ],
    detail:
      'Each batch of stories is sent to an LLM (Ollama for local-only use, Groq or OpenRouter in the cloud). '
      + 'The model distils dozens of articles into a concise brief and extracts structured signals. '
      + 'A cross-stream correlator then looks for convergence across military, economic, and disaster signals '
      + 'to compute a composite Country Intelligence Index across 12 dimensions. '
      + 'Transformers.js handles lightweight browser-side inference when running fully offline.',
  },
  {
    id: 'cache',
    label: 'Cache & Edge',
    color: C.emerald,
    icon: '⚡',
    x: 2,
    items: [
      { label: '3-Tier Cache', sub: 'Redis (Upstash) · CDN · SW' },
      { label: 'Protocol Buffers', sub: '92 protos · 22 services' },
      { label: '60+ Edge Functions', sub: 'Vercel global network' },
    ],
    detail:
      'Processed briefs and market data are serialised via Protocol Buffers (92 proto schemas, 22 services) '
      + 'and stored in Upstash Redis. A three-tier caching strategy serves data at edge PoPs, '
      + 'from CDN for static assets, and via a service worker for offline PWA support. '
      + 'A Railway relay bridges between the edge functions and any self-hosted Ollama instance.',
  },
  {
    id: 'frontend',
    label: 'Presentation',
    color: C.amber,
    icon: '🌍',
    x: 3,
    items: [
      { label: '5 Site Variants', sub: 'world · tech · finance · commodity · happy' },
      { label: 'Dual Map Engine', sub: 'globe.gl (3-D) · deck.gl (WebGL flat)' },
      { label: '45 Data Layers', sub: '21 languages, RTL support' },
    ],
    detail:
      'A single TypeScript/Vite codebase generates five fully independent site variants via build-time flags. '
      + 'The map view offers a 3-D globe powered by globe.gl + Three.js, or a WebGL flat map via deck.gl + MapLibre GL '
      + 'overlaid with 45 toggleable data layers (conflicts, disasters, finance, …). '
      + 'The app ships as a PWA and as a native desktop app (Tauri 2 with a Node.js sidecar) '
      + 'for macOS, Windows, and Linux, with 21 language packs including RTL.',
  },
];

// ─── feature cards ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🗺️', title: 'Dual Map Engine', color: C.cyan,
    desc: 'Switch between an interactive 3-D globe (globe.gl + Three.js) and a high-performance WebGL flat map (deck.gl + MapLibre GL) with 45 toggleable data layers.' },
  { icon: '🤖', title: 'Local-First AI', color: C.violet,
    desc: 'Run everything with Ollama on your own machine — no API keys required. Cloud providers (Groq, OpenRouter) plug in transparently when you want more speed.' },
  { icon: '📊', title: 'Finance Radar', color: C.emerald,
    desc: '92 stock exchanges, commodities, crypto, and a 7-signal composite market health score updated continuously from global market feeds.' },
  { icon: '⚠️', title: 'Country Intelligence Index', color: C.amber,
    desc: 'A composite risk score built from 12 distinct signal categories — military activity, economic stress, disaster events, governance instability, and more.' },
  { icon: '🌐', title: '5 Variants, One Codebase', color: C.indigo,
    desc: 'World · Tech · Finance · Commodity · Happy — each variant reshapes the UX theme, default feeds, and data layers from a single Vite build config.' },
  { icon: '🖥️', title: 'Native Desktop App', color: C.rose,
    desc: 'Tauri 2 (Rust) wraps the web app with a Node.js sidecar for macOS, Windows, and Linux — with the same feature set as the hosted version.' },
];

// ─── tech stack rows ──────────────────────────────────────────────────────────
const TECH = [
  { cat: 'Frontend',    items: ['TypeScript (Vanilla)', 'Vite', 'globe.gl + Three.js', 'deck.gl + MapLibre GL'], color: C.sky },
  { cat: 'Desktop',     items: ['Tauri 2 (Rust)', 'Node.js sidecar', 'PWA / Service Worker'], color: C.violet },
  { cat: 'AI / ML',     items: ['Ollama (local)', 'Groq API', 'OpenRouter', 'Transformers.js'], color: C.emerald },
  { cat: 'API Layer',   items: ['Protocol Buffers (92 protos)', '22 gRPC-like services', 'Vercel Edge Functions (60+)'], color: C.amber },
  { cat: 'Deployment',  items: ['Vercel Edge Network', 'Railway relay', 'Docker / static export'], color: C.indigo },
  { cat: 'Caching',     items: ['Redis via Upstash', '3-tier cache strategy', 'CDN + Service Worker'], color: C.cyan },
];

// ─── animated particle ────────────────────────────────────────────────────────
const PARTICLE_SPAWN_MS = 340;    // spawn a new particle every ~340 ms
const PARTICLE_MAX = 24;          // cap active particles for performance
const PARTICLE_SPEED = 0.018;     // progress units per animation frame (~60 fps ≈ 1.08 s crossing time)

let _particleCounter = 0;

function useParticles(active) {
  const [particles, setParticles] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!active) { setParticles([]); return; }

    const spawn = () => {
      const id = ++_particleCounter;
      // which segment? 0 = sources→ai, 1 = ai→cache, 2 = cache→frontend
      const seg = Math.floor(Math.random() * 3);
      const colors = [C.cyan, C.violet, C.emerald];
      setParticles(prev => [
        ...prev.slice(-PARTICLE_MAX),
        { id, seg, progress: 0, color: colors[seg] }
      ]);
    };

    timerRef.current = setInterval(spawn, PARTICLE_SPAWN_MS);
    return () => clearInterval(timerRef.current);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    let raf;
    const tick = () => {
      setParticles(prev =>
        prev
          .map(p => ({ ...p, progress: p.progress + PARTICLE_SPEED }))
          .filter(p => p.progress < 1)
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return particles;
}

// ─── main component ───────────────────────────────────────────────────────────
export default function WorldMonitorExplainer() {
  const [tab, setTab] = useState('arch');          // 'arch' | 'features' | 'tech'
  const [selected, setSelected] = useState(null);  // id of selected LAYERS node
  const [running, setRunning] = useState(true);
  const particles = useParticles(running && tab === 'arch');

  const svgRef = useRef(null);

  // ── layout constants ──
  const SVG_W = 900;
  const SVG_H = 220;
  const NODE_W = 160;
  const NODE_H = 90;
  const GAP = (SVG_W - LAYERS.length * NODE_W) / (LAYERS.length + 1);

  const nodeX = (i) => GAP + i * (NODE_W + GAP);
  const nodeCX = (i) => nodeX(i) + NODE_W / 2;
  const nodeCY = SVG_H / 2;

  // ── particle SVG position ──
  const particlePos = (p) => {
    const x1 = nodeCX(p.seg) + NODE_W / 2;
    const x2 = nodeCX(p.seg + 1) - NODE_W / 2;
    const x = x1 + (x2 - x1) * p.progress;
    const arc = Math.sin(p.progress * Math.PI) * -28;
    return { x, y: nodeCY + arc };
  };

  const selectedLayer = LAYERS.find(l => l.id === selected);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)',
      background: C.bg, fontFamily: 'Inter, system-ui, sans-serif', color: C.text }}>

      {/* ── header ── */}
      <div style={{ padding: '28px 32px 0', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 26 }}>🌍</span>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>
              WorldMonitor — How It Works
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: C.sub, maxWidth: 600 }}>
            Real-time global intelligence dashboard: AI-powered news aggregation,
            geopolitical monitoring, and infrastructure tracking in a unified situational-awareness interface.
          </p>
        </div>
        <a
          href="https://worldmonitor.app"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: C.indigo, textDecoration: 'none',
            border: `1px solid ${C.indigo}44`, padding: '5px 14px', borderRadius: 8 }}
        >
          worldmonitor.app ↗
        </a>
      </div>

      {/* ── tabs ── */}
      <div style={{ padding: '18px 32px 0', display: 'flex', gap: 8 }}>
        {[
          { id: 'arch', label: 'Architecture' },
          { id: 'features', label: 'Key Features' },
          { id: 'tech', label: 'Tech Stack' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setSelected(null); }}
            style={{
              padding: '6px 18px', borderRadius: 99, fontSize: 13, fontWeight: 500,
              border: `1px solid ${tab === t.id ? C.indigo : C.border}`,
              background: tab === t.id ? `${C.indigo}22` : 'transparent',
              color: tab === t.id ? C.indigo : C.sub,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── content ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px 32px' }}>

        {/* ─── ARCHITECTURE TAB ─── */}
        {tab === 'arch' && (
          <div>
            {/* flow diagram */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>

              <div style={{ padding: '10px 20px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: C.muted }}>Data pipeline — click a node to learn more</span>
                <button
                  onClick={() => setRunning(r => !r)}
                  style={{ marginLeft: 'auto', padding: '3px 12px', borderRadius: 6,
                    fontSize: 12, border: `1px solid ${C.border}`,
                    background: running ? `${C.indigo}22` : 'transparent',
                    color: running ? C.indigo : C.muted, cursor: 'pointer' }}
                >
                  {running ? '⏸ Pause' : '▶ Play'}
                </button>
              </div>

              <svg
                ref={svgRef}
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                width="100%"
                style={{ display: 'block', cursor: 'default' }}
              >
                {/* connector lines */}
                {LAYERS.slice(0, -1).map((_, i) => (
                  <line
                    key={i}
                    x1={nodeCX(i) + NODE_W / 2}
                    y1={nodeCY}
                    x2={nodeCX(i + 1) - NODE_W / 2}
                    y2={nodeCY}
                    stroke={C.border}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                  />
                ))}

                {/* particles */}
                {particles.map(p => {
                  const pos = particlePos(p);
                  return (
                    <circle key={p.id} cx={pos.x} cy={pos.y} r={4.5}
                      fill={p.color} opacity={0.85} />
                  );
                })}

                {/* nodes */}
                {LAYERS.map((layer, i) => {
                  const x = nodeX(i);
                  const y = nodeCY - NODE_H / 2;
                  const isSelected = selected === layer.id;
                  return (
                    <g key={layer.id}
                      onClick={() => setSelected(isSelected ? null : layer.id)}
                      style={{ cursor: 'pointer' }}>
                      <rect
                        x={x} y={y} width={NODE_W} height={NODE_H}
                        rx={12}
                        fill={isSelected ? `${layer.color}18` : C.surface}
                        stroke={isSelected ? layer.color : C.border}
                        strokeWidth={isSelected ? 2 : 1}
                      />
                      <text x={x + NODE_W / 2} y={y + 28}
                        textAnchor="middle" fontSize={20} fill={layer.color}>
                        {layer.icon}
                      </text>
                      <text x={x + NODE_W / 2} y={y + 52}
                        textAnchor="middle" fontSize={12.5} fontWeight={600} fill={C.text}>
                        {layer.label}
                      </text>
                      {layer.items.slice(0, 2).map((it, j) => (
                        <text key={j} x={x + NODE_W / 2} y={y + 66 + j * 14}
                          textAnchor="middle" fontSize={9.5} fill={C.muted}>
                          {it.label}
                        </text>
                      ))}
                    </g>
                  );
                })}

                {/* arrow heads on connectors */}
                {LAYERS.slice(0, -1).map((_, i) => {
                  const ax = nodeCX(i + 1) - NODE_W / 2;
                  return (
                    <polygon key={i}
                      points={`${ax},${nodeCY} ${ax - 9},${nodeCY - 5} ${ax - 9},${nodeCY + 5}`}
                      fill={C.border} />
                  );
                })}
              </svg>
            </div>

            {/* detail panel */}
            {selectedLayer ? (
              <div style={{ background: C.surface, border: `1px solid ${selectedLayer.color}44`,
                borderRadius: 14, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 22 }}>{selectedLayer.icon}</span>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: selectedLayer.color }}>
                    {selectedLayer.label}
                  </h2>
                </div>
                <p style={{ margin: '0 0 16px', fontSize: 13.5, color: C.sub, lineHeight: 1.7 }}>
                  {selectedLayer.detail}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedLayer.items.map((it, i) => (
                    <div key={i} style={{ background: `${selectedLayer.color}12`,
                      border: `1px solid ${selectedLayer.color}30`,
                      borderRadius: 8, padding: '6px 12px' }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: selectedLayer.color }}>{it.label}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{it.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: '16px 20px', fontSize: 13, color: C.muted,
                display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>👆</span>
                Click any node above to see details about that layer of the pipeline.
              </div>
            )}

            {/* pipeline summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12, marginTop: 16 }}>
              {[
                { label: '435+', sub: 'curated news feeds', color: C.cyan },
                { label: '15', sub: 'topic categories', color: C.violet },
                { label: '92', sub: 'stock exchanges', color: C.emerald },
                { label: '45', sub: 'map data layers', color: C.amber },
                { label: '60+', sub: 'edge functions', color: C.indigo },
                { label: '21', sub: 'languages supported', color: C.sky },
              ].map((s, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── FEATURES TAB ─── */}
        {tab === 'features' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 14, padding: '18px 20px',
                borderTop: `3px solid ${f.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{f.icon}</span>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: f.color }}>{f.title}</h3>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: C.sub, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* ─── TECH STACK TAB ─── */}
        {tab === 'tech' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
              {TECH.map((t, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 14, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.color }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: t.color }}>{t.cat}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {t.items.map((item, j) => (
                      <span key={j} style={{ fontSize: 12, color: C.sub,
                        background: `${t.color}12`, border: `1px solid ${t.color}28`,
                        borderRadius: 6, padding: '3px 8px' }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* quick-start block */}
            <div style={{ marginTop: 20, background: '#0e1117', border: `1px solid ${C.border}`,
              borderRadius: 14, padding: '18px 22px' }}>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Quick Start (self-hosted)
              </div>
              <pre style={{ margin: 0, fontSize: 13, color: C.emerald, lineHeight: 1.8,
                fontFamily: '"Fira Code", "Cascadia Code", monospace', overflowX: 'auto' }}>
{`git clone https://github.com/koala73/worldmonitor.git
cd worldmonitor
npm install
npm run dev           # → localhost:5173

# Variants
npm run dev:tech      # tech.worldmonitor.app
npm run dev:finance   # finance.worldmonitor.app
npm run dev:commodity # commodity.worldmonitor.app`}
              </pre>
            </div>

            {/* license note */}
            <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 10,
              background: `${C.amber}10`, border: `1px solid ${C.amber}30`,
              fontSize: 12, color: C.amber }}>
              <strong>License:</strong> AGPL-3.0 for non-commercial / educational use.
              Commercial use requires a separate license from the author (Elie Habib).
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
