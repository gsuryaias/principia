import React, { useMemo, useState, useEffect } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', color: '#e4e4e7', fontFamily: 'Inter, system-ui, sans-serif' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowX: 'auto', minHeight: 400 },
  controls: { padding: '14px 24px', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center', background: '#111114', borderTop: '1px solid #1e1e2e' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 130, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 52, textAlign: 'right' },
  sel: { padding: '6px 10px', borderRadius: 8, background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a', fontSize: 13 },
  results: { display: 'flex', gap: 26, flexWrap: 'wrap', padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, textTransform: 'uppercase', color: '#52525b', fontWeight: 700, letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontFamily: 'monospace', fontWeight: 700 },
  theory: { flex: 1, padding: '32px 24px', maxWidth: 860, margin: '0 auto', width: '100%', overflowY: 'auto' },
  h2: { fontSize: 22, fontWeight: 700, color: '#f4f4f5', margin: '36px 0 14px', paddingBottom: 8, borderBottom: '1px solid #27272a' },
  h3: { fontSize: 17, fontWeight: 600, color: '#e4e4e7', margin: '24px 0 10px' },
  p: { fontSize: 15, lineHeight: 1.8, color: '#a1a1aa', margin: '0 0 14px' },
  eq: { display: 'block', padding: '14px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontFamily: 'monospace', fontSize: 15, color: '#c4b5fd', margin: '16px 0', textAlign: 'center', overflowX: 'auto' },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { display: 'block', fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14 },
  ctxP: { margin: 0, fontSize: 14, lineHeight: 1.7, color: '#a1a1aa' },
  tbl: { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #3f3f46', color: '#d4d4d8', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #27272a', color: '#a1a1aa' },
};

/* ── calculation (unchanged physics) ── */
function calc(breaker, current, xr) {
  const trv = current * (breaker === 'Vacuum' ? 0.22 : breaker === 'SF6' ? 0.18 : 0.14) * (1 + xr / 20);
  const time = breaker === 'Vacuum' ? 45 : breaker === 'SF6' ? 55 : 85;
  return { trv, time, status: trv > 9 ? 'Re-strike risk' : 'Successful interruption' };
}

const BREAKER_COLORS = { SF6: '#22d3ee', Vacuum: '#a78bfa', Oil: '#f59e0b' };

function useAnimationPulse(interval = 900) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), interval);
    return () => clearInterval(id);
  }, [interval]);
  return pulse;
}

/* ── SF6 Breaker Cross-Section SVG ── */
function SF6CrossSection() {
  return (
    <svg viewBox="0 0 340 280" style={{ width: '100%', maxWidth: 340, height: 'auto', margin: '18px 0' }}>
      {/* outer enclosure */}
      <rect x="40" y="20" width="260" height="240" rx="16" fill="#101015" stroke="#22d3ee" strokeWidth="2" />
      <text x="170" y="16" textAnchor="middle" fill="#22d3ee" fontSize="11" fontWeight="700">SF6 Breaker Cross-Section</text>

      {/* SF6 gas fill */}
      <rect x="55" y="35" width="230" height="210" rx="10" fill="rgba(34,211,238,0.04)" />
      <text x="250" y="55" fill="#22d3ee" fontSize="8" opacity="0.6">SF6 gas</text>

      {/* fixed contact (top) */}
      <rect x="140" y="45" width="60" height="35" rx="4" fill="#27272a" stroke="#60a5fa" strokeWidth="2" />
      <text x="170" y="67" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="600">Fixed</text>

      {/* moving contact (bottom) */}
      <rect x="140" y="155" width="60" height="35" rx="4" fill="#27272a" stroke="#22c55e" strokeWidth="2" />
      <text x="170" y="177" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="600">Moving</text>

      {/* nozzle (around arc zone) */}
      <path d="M120,80 L130,95 L130,145 L120,160 L220,160 L210,145 L210,95 L220,80 Z" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="235" y="120" fill="#f59e0b" fontSize="8">PTFE nozzle</text>

      {/* arc zone */}
      <rect x="150" y="85" width="40" height="65" rx="4" fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeDasharray="4 3" />
      <text x="170" y="122" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="600">Arc zone</text>

      {/* gas flow arrows */}
      <path d="M130,100 L140,105 L130,110" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
      <path d="M210,100 L200,105 L210,110" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
      <text x="170" y="145" textAnchor="middle" fill="#22d3ee" fontSize="7">gas blast</text>

      {/* operating mechanism */}
      <rect x="140" y="200" width="60" height="30" rx="6" fill="#18181b" stroke="#3f3f46" />
      <text x="170" y="219" textAnchor="middle" fill="#71717a" fontSize="8">Mechanism</text>
      <line x1="170" y1="190" x2="170" y2="200" stroke="#3f3f46" strokeWidth="2" />

      {/* bushing connections */}
      <line x1="170" y1="45" x2="170" y2="20" stroke="#60a5fa" strokeWidth="4" />
      <line x1="170" y1="230" x2="170" y2="260" stroke="#22c55e" strokeWidth="4" />
    </svg>
  );
}

/* ── Vacuum Breaker Cross-Section SVG ── */
function VacuumCrossSection() {
  return (
    <svg viewBox="0 0 340 280" style={{ width: '100%', maxWidth: 340, height: 'auto', margin: '18px 0' }}>
      {/* outer body */}
      <rect x="40" y="20" width="260" height="240" rx="16" fill="#101015" stroke="#a78bfa" strokeWidth="2" />
      <text x="170" y="16" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="700">Vacuum Breaker Cross-Section</text>

      {/* vacuum interrupter bottle */}
      <rect x="110" y="40" width="120" height="180" rx="20" fill="rgba(167,139,250,0.04)" stroke="#a78bfa" strokeWidth="1.5" />
      <text x="170" y="58" textAnchor="middle" fill="#a78bfa" fontSize="8">Vacuum bottle</text>

      {/* fixed contact */}
      <rect x="145" y="70" width="50" height="25" rx="4" fill="#27272a" stroke="#60a5fa" strokeWidth="2" />
      <text x="170" y="87" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="600">Fixed</text>

      {/* moving contact */}
      <rect x="145" y="155" width="50" height="25" rx="4" fill="#27272a" stroke="#22c55e" strokeWidth="2" />
      <text x="170" y="172" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="600">Moving</text>

      {/* arc zone */}
      <rect x="155" y="100" width="30" height="50" rx="4" fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeDasharray="4 3" />
      <text x="170" y="128" textAnchor="middle" fill="#ef4444" fontSize="7" fontWeight="600">Arc</text>

      {/* bellows */}
      <path d="M145,185 Q155,190 145,195 Q155,200 145,205 Q155,210 145,215" fill="none" stroke="#71717a" strokeWidth="1.5" />
      <path d="M195,185 Q185,190 195,195 Q185,200 195,205 Q185,210 195,215" fill="none" stroke="#71717a" strokeWidth="1.5" />
      <text x="215" y="200" fill="#71717a" fontSize="8">Bellows</text>

      {/* shield */}
      <path d="M125,90 L125,170 L215,170 L215,90" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
      <text x="250" y="130" fill="#f59e0b" fontSize="8">Shield</text>

      {/* connections */}
      <line x1="170" y1="40" x2="170" y2="20" stroke="#60a5fa" strokeWidth="4" />
      <line x1="170" y1="220" x2="170" y2="260" stroke="#22c55e" strokeWidth="4" />

      {/* operating rod */}
      <line x1="170" y1="180" x2="170" y2="240" stroke="#3f3f46" strokeWidth="3" />
      <rect x="150" y="235" width="40" height="20" rx="4" fill="#18181b" stroke="#3f3f46" />
      <text x="170" y="249" textAnchor="middle" fill="#71717a" fontSize="7">Drive</text>
    </svg>
  );
}

/* ── TRV Waveform SVG ── */
function TRVWaveform({ trv, breaker }) {
  const color = BREAKER_COLORS[breaker] || '#22d3ee';
  // generate TRV waveform points
  const points = [];
  for (let t = 0; t <= 100; t++) {
    const x = 60 + t * 5.2;
    const trvEnv = trv * (1 - Math.exp(-t / 15));
    const osc = trvEnv * Math.sin(t * 0.3) * Math.exp(-t / 40);
    const y = 120 - osc * 10;
    points.push(`${x},${y}`);
  }

  // RRRV line (rate of rise of recovery voltage)
  const rrrvSlope = trv / (breaker === 'Vacuum' ? 25 : breaker === 'SF6' ? 35 : 50);

  return (
    <svg viewBox="0 0 620 240" style={{ width: '100%', maxWidth: 620, height: 'auto', margin: '18px 0' }}>
      <text x="310" y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">Transient Recovery Voltage (TRV) Waveform</text>

      {/* axes */}
      <line x1="60" y1="120" x2="590" y2="120" stroke="#3f3f46" strokeWidth="1" />
      <line x1="60" y1="20" x2="60" y2="220" stroke="#3f3f46" strokeWidth="1" />
      <text x="595" y="125" fill="#71717a" fontSize="9">t</text>
      <text x="40" y="25" fill="#71717a" fontSize="9">V</text>

      {/* TRV envelope (upper) */}
      <path d={`M60,120 ${Array.from({ length: 100 }, (_, t) => {
        const x = 60 + t * 5.2;
        const env = trv * (1 - Math.exp(-t / 15)) * 10;
        return `L${x},${120 - env}`;
      }).join(' ')}`} fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />

      {/* TRV envelope (lower) */}
      <path d={`M60,120 ${Array.from({ length: 100 }, (_, t) => {
        const x = 60 + t * 5.2;
        const env = trv * (1 - Math.exp(-t / 15)) * 10;
        return `L${x},${120 + env}`;
      }).join(' ')}`} fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />

      {/* actual TRV waveform */}
      <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="2.5" />

      {/* RRRV line */}
      <line x1="60" y1="120" x2={60 + 100} y2={120 - rrrvSlope * 100} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x={170} y={120 - rrrvSlope * 100 - 5} fill="#ef4444" fontSize="9">RRRV = {rrrvSlope.toFixed(2)} kV/us</text>

      {/* dielectric recovery line */}
      <line x1="60" y1="120" x2="350" y2="40" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="280" y="50" fill="#22c55e" fontSize="9">Dielectric recovery</text>

      {/* labels */}
      <text x="310" y="230" textAnchor="middle" fill="#52525b" fontSize="9">
        If TRV rises faster than dielectric recovery, restrike occurs
      </text>

      {/* TRV peak annotation */}
      <line x1="160" y1={120 - trv * 10} x2="200" y2={120 - trv * 10 - 15} stroke={color} strokeWidth="1" />
      <text x="205" y={120 - trv * 10 - 18} fill={color} fontSize="9" fontWeight="600">TRV peak = {trv.toFixed(2)} pu</text>
    </svg>
  );
}

/* ── Arc Quenching Process SVG ── */
function ArcQuenchingProcess() {
  return (
    <svg viewBox="0 0 720 180" style={{ width: '100%', maxWidth: 720, height: 'auto', margin: '18px 0' }}>
      <text x="360" y="16" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">Arc Quenching Process — Contact Separation to Arc Extinction</text>

      {/* Stage 1: Contacts closed */}
      <rect x="20" y="40" width="140" height="120" rx="10" fill="#101015" stroke="#27272a" />
      <text x="90" y="58" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="700">1. CLOSED</text>
      <rect x="55" y="75" width="28" height="20" rx="3" fill="#27272a" stroke="#60a5fa" />
      <rect x="83" y="75" width="28" height="20" rx="3" fill="#27272a" stroke="#22c55e" />
      <line x1="55" y1="85" x2="111" y2="85" stroke="#22c55e" strokeWidth="3" />
      <text x="90" y="115" textAnchor="middle" fill="#a1a1aa" fontSize="8">Normal current flow</text>
      <text x="90" y="130" textAnchor="middle" fill="#71717a" fontSize="7">Trip command received</text>

      {/* arrow */}
      <path d="M165,100 L185,100 L180,95 M185,100 L180,105" fill="none" stroke="#3f3f46" strokeWidth="1.5" />

      {/* Stage 2: Contact separation, arc forms */}
      <rect x="190" y="40" width="140" height="120" rx="10" fill="#101015" stroke="#27272a" />
      <text x="260" y="58" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="700">2. ARC FORMS</text>
      <rect x="215" y="75" width="28" height="20" rx="3" fill="#27272a" stroke="#60a5fa" />
      <rect x="263" y="75" width="28" height="20" rx="3" fill="#27272a" stroke="#22c55e" />
      {/* arc */}
      <path d="M243,80 Q253,70 255,85 Q257,95 263,80" fill="none" stroke="#ef4444" strokeWidth="2.5" />
      <text x="260" y="68" textAnchor="middle" fill="#ef4444" fontSize="7">Arc</text>
      <text x="260" y="115" textAnchor="middle" fill="#a1a1aa" fontSize="8">Contacts separating</text>
      <text x="260" y="130" textAnchor="middle" fill="#71717a" fontSize="7">Arc plasma sustains</text>

      {/* arrow */}
      <path d="M335,100 L355,100 L350,95 M355,100 L350,105" fill="none" stroke="#3f3f46" strokeWidth="1.5" />

      {/* Stage 3: Arc at current zero */}
      <rect x="360" y="40" width="140" height="120" rx="10" fill="#101015" stroke="#27272a" />
      <text x="430" y="58" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="700">3. CURRENT ZERO</text>
      <rect x="385" y="75" width="28" height="20" rx="3" fill="#27272a" stroke="#60a5fa" />
      <rect x="443" y="75" width="28" height="20" rx="3" fill="#27272a" stroke="#22c55e" />
      {/* dying arc */}
      <path d="M413,85 Q420,82 425,85 Q430,88 435,85" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.5" strokeDasharray="2 2" />
      <text x="430" y="115" textAnchor="middle" fill="#a1a1aa" fontSize="8">Arc weakening at</text>
      <text x="430" y="130" textAnchor="middle" fill="#71717a" fontSize="7">natural current zero</text>

      {/* arrow */}
      <path d="M505,100 L525,100 L520,95 M525,100 L520,105" fill="none" stroke="#3f3f46" strokeWidth="1.5" />

      {/* Stage 4: Arc extinction, gap recovers */}
      <rect x="530" y="40" width="160" height="120" rx="10" fill="#101015" stroke="#27272a" />
      <text x="610" y="58" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="700">4. ARC EXTINCT</text>
      <rect x="560" y="75" width="28" height="20" rx="3" fill="#27272a" stroke="#60a5fa" />
      <rect x="628" y="75" width="28" height="20" rx="3" fill="#27272a" stroke="#22c55e" />
      {/* gap - no arc */}
      <text x="614" y="88" textAnchor="middle" fill="#22c55e" fontSize="7">GAP</text>
      <text x="610" y="115" textAnchor="middle" fill="#a1a1aa" fontSize="8">Dielectric strength</text>
      <text x="610" y="130" textAnchor="middle" fill="#a1a1aa" fontSize="8">recovers across gap</text>
      <text x="610" y="148" textAnchor="middle" fill="#22c55e" fontSize="7">Interruption complete</text>
    </svg>
  );
}

/* ── Simulation Diagram ── */
function SimDiagram({ breaker, current, xr, d, pulse }) {
  const bColor = BREAKER_COLORS[breaker] || '#22d3ee';
  const isRisk = d.status.includes('risk');

  // generate current waveform (AC with DC offset decay)
  const currentPoints = [];
  for (let t = 0; t <= 100; t++) {
    const x = 50 + t * 3.2;
    const dcOffset = current * 0.7 * Math.exp(-t / (xr * 2));
    const ac = current * Math.sin(t * 0.31);
    const total = (ac + dcOffset) * 2;
    const y = 130 - total;
    currentPoints.push(`${x},${y}`);
  }

  // TRV waveform
  const trvPoints = [];
  for (let t = 0; t <= 80; t++) {
    const x = 500 + t * 2.8;
    const env = d.trv * (1 - Math.exp(-t / 12));
    const osc = env * Math.sin(t * 0.35) * Math.exp(-t / 35);
    const y = 130 - osc * 8;
    trvPoints.push(`${x},${y}`);
  }

  return (
    <svg viewBox="0 0 960 450" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      <defs>
        <filter id="cbglow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="480" y="22" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="700" letterSpacing="0.06em">
        {breaker.toUpperCase()} CIRCUIT BREAKER — FAULT INTERRUPTION SEQUENCE
      </text>

      {/* ── Breaker schematic ── */}
      <rect x="340" y="50" width="280" height="140" rx="16" fill="#101015" stroke={bColor} strokeWidth="2" />
      <text x="480" y="44" textAnchor="middle" fill={bColor} fontSize="10" fontWeight="700">{breaker} Breaker Chamber</text>

      {/* Fixed contact (left) */}
      <line x1="360" y1="120" x2="420" y2="120" stroke="#60a5fa" strokeWidth="8" strokeLinecap="round" />
      <text x="390" y="108" textAnchor="middle" fill="#60a5fa" fontSize="8">Fixed</text>

      {/* Moving contact (right) */}
      <line x1="540" y1="120" x2="600" y2="120" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" />
      <text x="570" y="108" textAnchor="middle" fill="#22c55e" fontSize="8">Moving</text>

      {/* Contact position - open or closed */}
      <line x1="420" y1="120" x2="470" y2="95" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" />
      <line x1="540" y1="120" x2="490" y2="145" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" />

      {/* Arc */}
      <path d={`M470,95 Q480,110 475,120 Q470,130 490,145`} fill="none" stroke="#ef4444" strokeWidth={pulse ? 5 : 3} opacity={pulse ? 1 : 0.6}>
        <animate attributeName="strokeWidth" values="3;5;3" dur="0.5s" repeatCount="indefinite" />
      </path>
      <text x="480" y="80" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="600">ARC</text>

      {/* Medium label */}
      <text x="480" y="175" textAnchor="middle" fill={bColor} fontSize="9">
        {breaker === 'SF6' ? 'SF6 gas blast quenching' : breaker === 'Vacuum' ? 'Vacuum dielectric recovery' : 'Oil decomposition quenching'}
      </text>

      {/* Breaker state indicator */}
      <rect x="640" y="80" width="80" height="50" rx="8" fill={isRisk ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)'} stroke={isRisk ? '#ef4444' : '#22c55e'} strokeWidth="2" />
      <circle cx="660" cy="105" r="6" fill={isRisk ? '#ef4444' : '#22c55e'} filter="url(#cbglow)">
        {isRisk && <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />}
      </circle>
      <text x="695" y="100" fill={isRisk ? '#ef4444' : '#22c55e'} fontSize="9" fontWeight="700">{isRisk ? 'RISK' : 'OK'}</text>
      <text x="680" y="118" textAnchor="middle" fill="#a1a1aa" fontSize="7">{d.time} ms</text>

      {/* Source line */}
      <line x1="100" y1="120" x2="340" y2="120" stroke="#60a5fa" strokeWidth="5" />
      <text x="220" y="108" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">Source Side</text>

      {/* Load line */}
      <line x1="620" y1="120" x2="860" y2="120" stroke="#22c55e" strokeWidth="5" />
      <text x="740" y="108" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="600">Load Side</text>

      {/* ── Current waveform ── */}
      <rect x="40" y="220" width="400" height="190" rx="12" fill="#101015" stroke="#27272a" />
      <text x="240" y="240" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="700">Fault Current Waveform</text>

      {/* current axes */}
      <line x1="60" y1="320" x2="420" y2="320" stroke="#3f3f46" strokeWidth="0.5" />
      <line x1="60" y1="250" x2="60" y2="400" stroke="#3f3f46" strokeWidth="0.5" />
      <text x="420" y="315" fill="#52525b" fontSize="8">time</text>
      <text x="55" y="258" fill="#52525b" fontSize="8">I</text>

      {/* current waveform */}
      <polyline points={currentPoints.map((p) => {
        const [x, y] = p.split(',').map(Number);
        return `${x},${y + 190}`;
      }).join(' ')} fill="none" stroke="#60a5fa" strokeWidth="2" />

      {/* DC offset envelope */}
      <path d={`M50,${320} ${Array.from({ length: 100 }, (_, t) => {
        const x = 50 + t * 3.2;
        const dc = current * 0.7 * Math.exp(-t / (xr * 2)) * 2;
        return `L${x},${320 - dc}`;
      }).join(' ')}`} fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
      <text x="180" y="270" fill="#f59e0b" fontSize="8">DC offset envelope (X/R = {xr})</text>

      {/* current zero crossing line */}
      <line x1="260" y1="250" x2="260" y2="400" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
      <text x="260" y="248" textAnchor="middle" fill="#ef4444" fontSize="7">Interruption at I=0</text>

      {/* ── TRV waveform ── */}
      <rect x="480" y="220" width="440" height="190" rx="12" fill="#101015" stroke="#27272a" />
      <text x="700" y="240" textAnchor="middle" fill={bColor} fontSize="10" fontWeight="700">TRV Response</text>

      {/* TRV axes */}
      <line x1="500" y1="320" x2="900" y2="320" stroke="#3f3f46" strokeWidth="0.5" />
      <line x1="500" y1="250" x2="500" y2="400" stroke="#3f3f46" strokeWidth="0.5" />
      <text x="900" y="315" fill="#52525b" fontSize="8">time</text>
      <text x="495" y="258" fill="#52525b" fontSize="8">V</text>

      {/* TRV waveform */}
      <polyline points={trvPoints.map((p) => {
        const [x, y] = p.split(',').map(Number);
        return `${x},${y + 190}`;
      }).join(' ')} fill="none" stroke={bColor} strokeWidth="2" />

      {/* TRV envelope */}
      <path d={`M500,320 ${Array.from({ length: 80 }, (_, t) => {
        const x = 500 + t * 2.8;
        const env = d.trv * (1 - Math.exp(-t / 12)) * 8;
        return `L${x},${320 - env}`;
      }).join(' ')}`} fill="none" stroke={bColor} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

      {/* dielectric line */}
      <line x1="500" y1="320" x2="700" y2="260" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="620" y="275" fill="#22c55e" fontSize="8">Dielectric recovery</text>

      {/* TRV peak label */}
      <text x="700" y="410" textAnchor="middle" fill={isRisk ? '#ef4444' : bColor} fontSize="9" fontWeight="600">
        TRV peak = {d.trv.toFixed(2)} pu {isRisk ? '(exceeds withstand)' : '(within withstand)'}
      </text>

      {/* ── Timing strip ── */}
      <rect x="40" y="425" width="880" height="20" rx="6" fill="#101015" stroke="#27272a" />
      <text x="60" y="439" fill="#818cf8" fontSize="8" fontWeight="700">Timeline:</text>
      <text x="150" y="439" fill="#a1a1aa" fontSize="8">t=0: Trip command</text>
      <text x="310" y="439" fill="#a1a1aa" fontSize="8">t={Math.round(d.time * 0.3)}: Contacts part</text>
      <text x="480" y="439" fill="#a1a1aa" fontSize="8">t={Math.round(d.time * 0.6)}: Arc at current zero</text>
      <text x="680" y="439" fill={isRisk ? '#ef4444' : '#22c55e'} fontSize="8" fontWeight="600">t={d.time}: {d.status}</text>
    </svg>
  );
}

/* ── Operating Sequence Timing SVG (O-C-O) ── */
function OperatingSequenceSVG() {
  return (
    <svg viewBox="0 0 700 220" style={{ width: '100%', maxWidth: 700, height: 'auto', margin: '18px 0' }}>
      <text x="350" y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">Circuit Breaker Operating Sequence — O-t-CO-t'-CO</text>

      {/* timeline axis */}
      <line x1="40" y1="120" x2="660" y2="120" stroke="#3f3f46" strokeWidth="1.5" />
      <text x="670" y="124" fill="#71717a" fontSize="9">Time</text>

      {/* closed/open state line */}
      <text x="25" y="78" fill="#22c55e" fontSize="8">CLOSED</text>
      <text x="25" y="168" fill="#ef4444" fontSize="8">OPEN</text>

      {/* initial closed state */}
      <line x1="60" y1="75" x2="120" y2="75" stroke="#22c55e" strokeWidth="3" />
      <text x="90" y="65" textAnchor="middle" fill="#22c55e" fontSize="8">Closed</text>

      {/* O (open) operation */}
      <line x1="120" y1="75" x2="130" y2="165" stroke="#ef4444" strokeWidth="3" />
      <line x1="130" y1="165" x2="200" y2="165" stroke="#ef4444" strokeWidth="3" />
      <text x="165" y="185" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="700">O</text>
      <text x="165" y="198" textAnchor="middle" fill="#71717a" fontSize="7">Open (trip)</text>

      {/* dead time t */}
      <line x1="200" y1="165" x2="280" y2="165" stroke="#3f3f46" strokeWidth="3" strokeDasharray="4 3" />
      <text x="240" y="155" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">t</text>
      <text x="240" y="198" textAnchor="middle" fill="#71717a" fontSize="7">Dead time</text>
      <text x="240" y="210" textAnchor="middle" fill="#52525b" fontSize="7">0.3s typical</text>

      {/* CO (close-open) first auto-reclose */}
      <line x1="280" y1="165" x2="290" y2="75" stroke="#22c55e" strokeWidth="3" />
      <line x1="290" y1="75" x2="330" y2="75" stroke="#22c55e" strokeWidth="3" />
      <line x1="330" y1="75" x2="340" y2="165" stroke="#ef4444" strokeWidth="3" />
      <line x1="340" y1="165" x2="410" y2="165" stroke="#ef4444" strokeWidth="3" />
      <text x="340" y="65" textAnchor="middle" fill="#6366f1" fontSize="9" fontWeight="700">CO</text>
      <text x="340" y="198" textAnchor="middle" fill="#71717a" fontSize="7">1st reclose</text>

      {/* reclaim time t' */}
      <line x1="410" y1="165" x2="490" y2="165" stroke="#3f3f46" strokeWidth="3" strokeDasharray="4 3" />
      <text x="450" y="155" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">t'</text>
      <text x="450" y="198" textAnchor="middle" fill="#71717a" fontSize="7">Reclaim time</text>
      <text x="450" y="210" textAnchor="middle" fill="#52525b" fontSize="7">15-30s typical</text>

      {/* CO (close-open) second attempt */}
      <line x1="490" y1="165" x2="500" y2="75" stroke="#22c55e" strokeWidth="3" />
      <line x1="500" y1="75" x2="540" y2="75" stroke="#22c55e" strokeWidth="3" />
      <line x1="540" y1="75" x2="550" y2="165" stroke="#ef4444" strokeWidth="3" />
      <line x1="550" y1="165" x2="640" y2="165" stroke="#ef4444" strokeWidth="3" />
      <text x="550" y="65" textAnchor="middle" fill="#6366f1" fontSize="9" fontWeight="700">CO</text>
      <text x="550" y="198" textAnchor="middle" fill="#71717a" fontSize="7">2nd reclose</text>

      {/* lockout */}
      <rect x="565" y="155" width="70" height="22" rx="6" fill="rgba(239,68,68,0.1)" stroke="#ef4444" />
      <text x="600" y="170" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="700">LOCKOUT</text>

      {/* rated duty annotation */}
      <text x="350" y="215" textAnchor="middle" fill="#52525b" fontSize="9">IEC rated operating sequence: O - 0.3s - CO - 3min - CO (or O - 0.3s - CO - 15s - CO for rapid)</text>
    </svg>
  );
}

/* ── Breaker State Badge ── */
function BreakerStateBadge({ breaker, d }) {
  const isRisk = d.status.includes('risk');
  const color = isRisk ? '#ef4444' : '#22c55e';
  const bg = isRisk ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)';
  const label = isRisk ? 'RE-STRIKE RISK' : 'SUCCESSFUL INTERRUPTION';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: bg, border: `1px solid ${color}`, borderRadius: 8, marginRight: 12 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 10, color: '#71717a' }}>{breaker} | {d.time}ms | TRV {d.trv.toFixed(2)} pu</span>
    </div>
  );
}

/* ── Theory Tab ── */
function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Circuit Breaker Operation</h2>
      <p style={S.p}>
        A circuit breaker receives the trip command from the relay, separates the contacts, sustains an arc
        for a short interval, and then extinguishes it at current zero while the dielectric strength across the
        open gap recovers. The transient recovery voltage (TRV) determines whether interruption is successful
        or whether restrike occurs.
      </p>

      <h3 style={S.h3}>Arc Quenching Process</h3>
      <p style={S.p}>
        The interruption process follows four distinct stages: contacts closed carrying normal/fault current,
        contact separation initiating an arc, arc weakening as current approaches natural zero, and finally
        arc extinction with dielectric recovery of the gap.
      </p>
      <ArcQuenchingProcess />

      <h3 style={S.h3}>SF6 vs. Vacuum Breaker Mechanisms</h3>
      <p style={S.p}>
        The two dominant modern breaker technologies use fundamentally different arc quenching mechanisms.
        SF6 breakers use pressurized sulfur hexafluoride gas blasted across the arc to cool and de-ionize it.
        Vacuum breakers rely on the high dielectric strength of vacuum, where metal vapor from the contacts
        is the only conducting medium and condenses rapidly at current zero.
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <SF6CrossSection />
        <VacuumCrossSection />
      </div>

      <h3 style={S.h3}>Transient Recovery Voltage (TRV)</h3>
      <p style={S.p}>
        After current zero, the system voltage appears across the open breaker gap. The TRV is an oscillatory
        transient that depends on the circuit parameters (inductance, capacitance, X/R ratio). If the TRV
        rises faster than the dielectric recovery of the gap medium, the arc re-ignites (restrike).
      </p>
      <TRVWaveform trv={4.5} breaker="SF6" />
      <span style={S.eq}>TRV peak = k_af * k_pp * sqrt(2) * (V_rated / sqrt(3))</span>
      <span style={S.eq}>RRRV = TRV_peak / t_3 (rate of rise of recovery voltage)</span>

      <h3 style={S.h3}>Operating Sequence and Auto-Reclosing</h3>
      <p style={S.p}>
        Circuit breakers are rated for a specific operating duty cycle defined by IEC 62271-100. The standard
        rated sequence is O-0.3s-CO-3min-CO, meaning the breaker must open (O), wait 0.3 seconds, close
        and immediately open (CO), wait 3 minutes, then close and open again (CO). For rapid auto-reclosing
        on transmission lines, the sequence is O-0.3s-CO-15s-CO. This duty tests the breaker's ability to
        interrupt fault current, reclose onto a potentially persisting fault, and trip again without failure.
      </p>
      <OperatingSequenceSVG />

      <h3 style={S.h3}>Breaker Type Comparison</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Parameter</th>
            <th style={S.th}>SF6</th>
            <th style={S.th}>Vacuum</th>
            <th style={S.th}>Oil (legacy)</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Voltage range', '72.5 kV - 800 kV', '3.3 kV - 40.5 kV', '3.3 kV - 145 kV'],
            ['Breaking capacity', 'Up to 63 kA', 'Up to 40 kA', 'Up to 25 kA'],
            ['Break time', '2-3 cycles', '1.5-3 cycles', '3-5 cycles'],
            ['Arc medium', 'SF6 gas', 'Vacuum (metal vapor)', 'Mineral oil'],
            ['Maintenance', 'Low', 'Very low', 'Regular oil testing'],
            ['Environmental', 'SF6 is potent GHG', 'Benign', 'Oil spill risk'],
            ['Restrike risk', 'Low for rated TRV', 'Current chopping at low I', 'Moderate'],
          ].map(([a, b, c, d]) => (
            <tr key={a}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{a}</td>
              <td style={S.td}>{b}</td>
              <td style={S.td}>{c}</td>
              <td style={S.td}>{d}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.ctx}>
        <span style={S.ctxT}>Indian Utility Practice</span>
        <p style={S.ctxP}>
          In modern Indian 33 kV and 11 kV systems, vacuum breakers dominate due to low maintenance and
          reliability. At 132 kV and above, SF6 breakers remain standard, though utilities increasingly
          account for SF6 environmental concerns. Breaker specifications follow IS/IEC 62271 series.
          Typical rated breaking times are 3 cycles for 132 kV and 2 cycles for 400 kV SF6 breakers.
        </p>
      </div>

      <h2 style={S.h2}>References</h2>
      <ul style={S.ul}>
        <li style={S.li}>Allan Greenwood — <em>Electrical Transients in Power Systems</em></li>
        <li style={S.li}>IEC 62271-100 — High-voltage switchgear and controlgear</li>
        <li style={S.li}>IEEE C37 series — Circuit breaker standards</li>
        <li style={S.li}>CBIP Manual on Switchgear for Indian Utilities</li>
      </ul>
    </div>
  );
}

export default function CircuitBreakerOperation() {
  const [tab, setTab] = useState('simulate');
  const [breaker, setBreaker] = useState('SF6');
  const [current, setCurrent] = useState(25);
  const [xr, setXr] = useState(12);
  const pulse = useAnimationPulse(500);
  const d = useMemo(() => calc(breaker, current, xr), [breaker, current, xr]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>
      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' }}>
            <BreakerStateBadge breaker={breaker} d={d} />
          </div>
          <div style={S.svgWrap}>
            <SimDiagram breaker={breaker} current={current} xr={xr} d={d} pulse={pulse} />
          </div>
          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Breaker Type</span>
              <select style={S.sel} value={breaker} onChange={(e) => setBreaker(e.target.value)}>
                <option>SF6</option>
                <option>Vacuum</option>
                <option>Oil</option>
              </select>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Fault current</span>
              <input style={S.slider} type="range" min="10" max="50" step="1" value={current} onChange={(e) => setCurrent(Number(e.target.value))} />
              <span style={S.val}>{current.toFixed(0)} kA</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>X/R ratio</span>
              <input style={S.slider} type="range" min="5" max="25" step="1" value={xr} onChange={(e) => setXr(Number(e.target.value))} />
              <span style={S.val}>{xr.toFixed(0)}</span>
            </div>
          </div>
          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>TRV peak</span>
              <span style={{ ...S.rv, color: BREAKER_COLORS[breaker] }}>{d.trv.toFixed(2)} pu</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Break time</span>
              <span style={S.rv}>{d.time} ms</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Outcome</span>
              <span style={{ ...S.rv, color: d.status.includes('risk') ? '#ef4444' : '#22c55e' }}>{d.status}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Asymmetric factor</span>
              <span style={S.rv}>{(1 + 0.7 * Math.exp(-Math.PI / xr)).toFixed(3)}</span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
