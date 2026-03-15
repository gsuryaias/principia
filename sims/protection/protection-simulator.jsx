import React, { useMemo, useState, useEffect } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', color: '#e4e4e7', fontFamily: 'Inter, system-ui, sans-serif' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '20px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowX: 'auto', minHeight: 320 },
  controls: { padding: '14px 24px', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', background: '#111114', borderTop: '1px solid #1e1e2e' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  sel: { padding: '6px 12px', borderRadius: 8, border: '1px solid #3f3f46', background: '#18181b', color: '#e4e4e7', fontSize: 13, outline: 'none' },
  slider: { width: 130, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 56, textAlign: 'right' },
  results: { display: 'flex', gap: 28, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  strip: { display: 'flex', gap: 12, padding: '12px 24px', background: '#0f0f12', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  box: { flex: '1 1 220px', padding: '12px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 10 },
  boxT: { display: 'block', fontSize: 10, color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 },
  boxV: { display: 'block', fontSize: 13, color: '#c4b5fd', fontFamily: 'monospace', lineHeight: 1.6 },
  theory: { flex: 1, padding: '32px 24px', maxWidth: 900, margin: '0 auto', width: '100%', overflowY: 'auto' },
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

const NODES = [
  { id: 'gen', name: 'Generator', short: '11 kV Gen', x: 90, y: 170, relay: '87G + 51V', breaker: 'B1', zone: 'Generator zone' },
  { id: 'gt', name: 'Generator Transformer', short: '11/220 kV GT', x: 230, y: 170, relay: '87T + Buchholz', breaker: 'B2', zone: 'Transformer zone' },
  { id: 'bus220', name: '220 kV Bus', short: '220 kV Bus', x: 390, y: 170, relay: 'Bus differential', breaker: 'B3', zone: 'Busbar zone' },
  { id: 'line', name: '220 kV Line', short: '220 kV Line', x: 560, y: 170, relay: 'Distance Z1/Z2/Z3', breaker: 'B4', zone: 'Line zone' },
  { id: 'tf', name: '132/33 kV Transformer', short: '132/33 kV TF', x: 720, y: 170, relay: '87T + 51/51N', breaker: 'B5', zone: 'Substation transformer zone' },
  { id: 'fd1', name: '33 kV Feeder A', short: 'Feeder A', x: 860, y: 110, relay: '67/51', breaker: 'B6', zone: 'Feeder zone' },
  { id: 'fd2', name: '33 kV Feeder B', short: 'Feeder B', x: 860, y: 230, relay: '67/51', breaker: 'B7', zone: 'Feeder zone' },
];

const FAULTS = {
  LG: { mult: 1.0, label: 'Single line to ground' },
  LL: { mult: 0.82, label: 'Line to line' },
  LLG: { mult: 0.92, label: 'Double line to ground' },
  '3-Phase': { mult: 1.12, label: 'Three-phase short circuit' },
};

const ZONE_COLORS = {
  gen: '#22c55e',
  gt: '#60a5fa',
  bus220: '#a78bfa',
  line: '#22d3ee',
  tf: '#f59e0b',
  fd1: '#f472b6',
  fd2: '#fb923c',
};

function useAnimationPulse(interval = 800) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), interval);
    return () => clearInterval(id);
  }, [interval]);
  return pulse;
}

function protectionSequence(locationId, faultType, zf, breakerFail) {
  const loc = NODES.find((n) => n.id === locationId);
  const baseFault = (locationId === 'line' ? 18 : locationId.startsWith('fd') ? 8.5 : locationId === 'bus220' ? 22 : 14) * FAULTS[faultType].mult;
  const current = Math.max(baseFault - zf * 0.6, 1.4);
  const relayStates = NODES.map((node) => ({ id: node.id, status: 'monitor', time: null }));
  const events = [];

  const mark = (id, status, time) => {
    const r = relayStates.find((x) => x.id === id);
    if (r) { r.status = status; r.time = time; }
  };

  events.push(`t=0 ms: ${FAULTS[faultType].label} fault at ${loc.name}; estimated fault current ${current.toFixed(1)} kA`);

  if (locationId === 'line') {
    mark('line', 'pickup', 8);
    events.push('t=8 ms: Distance relay at line terminal picks up');
    events.push('t=28 ms: Zone 1 trip issued for 80% protected line reach');
    mark('line', 'trip', 28);
  } else if (locationId === 'bus220') {
    mark('bus220', 'pickup', 6);
    events.push('t=6 ms: Bus differential measures non-zero spill current');
    events.push('t=20 ms: Busbar differential trip to all associated breakers');
    mark('bus220', 'trip', 20);
  } else if (locationId === 'gt' || locationId === 'tf') {
    mark(locationId, 'pickup', 10);
    events.push(`t=10 ms: ${loc.relay} detects internal imbalance`);
    if (locationId === 'gt') events.push('t=18 ms: Buchholz gas surge element also detects severe oil disturbance');
    events.push('t=35 ms: Differential trip to HV and LV breakers');
    mark(locationId, 'trip', 35);
  } else if (locationId === 'gen') {
    mark('gen', 'pickup', 8);
    events.push('t=8 ms: Generator differential operates inside stator zone');
    events.push('t=25 ms: Generator lockout and field suppression initiated');
    mark('gen', 'trip', 25);
  } else {
    mark(locationId, 'pickup', 15);
    mark('tf', 'pickup', 90);
    events.push(`t=15 ms: Directional overcurrent on ${loc.short} picks up in forward direction`);
    events.push(`t=140 ms: ${loc.short} feeder relay trips after IDMT delay`);
    mark(locationId, 'trip', 140);
    if (!breakerFail) events.push('t=240 ms: Upstream transformer OC remains in pickup but resets after feeder isolation');
  }

  if (breakerFail) {
    events.push(`t=230 ms: Breaker ${loc.breaker} fails to clear after trip command`);
    if (locationId === 'line' || locationId.startsWith('fd')) {
      mark('tf', 'pickup', 260);
      events.push('t=260 ms: Backup overcurrent at upstream transformer starts timing');
      events.push('t=520 ms: Backup breaker trip command isolates broader section');
      mark('tf', 'trip', 520);
    } else {
      mark('bus220', 'pickup', 240);
      events.push('t=240 ms: Breaker failure logic at 220 kV bus issues breaker-fail trip');
      events.push('t=420 ms: Adjacent breakers open to clear stuck fault');
      mark('bus220', 'trip', 420);
    }
  } else {
    events.push(`t=${locationId.startsWith('fd') ? 180 : 65} ms: ${loc.breaker} contacts part, arc extinguishes at current zero`);
    events.push('t=95 ms: Healthy sections remain energized; faulted zone isolated selectively');
  }

  const supplied = NODES.map((node) => {
    if (!breakerFail && node.id !== locationId && !(locationId.startsWith('fd') && node.id === 'tf')) return { id: node.id, live: true };
    if (locationId === 'line') return { id: node.id, live: ['gen', 'gt', 'bus220'].includes(node.id) };
    if (locationId === 'bus220') return { id: node.id, live: ['gen', 'gt'].includes(node.id) };
    if (locationId === 'gen') return { id: node.id, live: false };
    if (locationId === 'gt') return { id: node.id, live: node.id === 'gen' ? true : false };
    if (locationId === 'tf') return { id: node.id, live: ['gen', 'gt', 'bus220', 'line'].includes(node.id) };
    if (locationId === 'fd1') return { id: node.id, live: node.id !== 'fd1' };
    if (locationId === 'fd2') return { id: node.id, live: node.id !== 'fd2' };
    return { id: node.id, live: true };
  });

  return {
    current,
    primary: relayStates.find((r) => r.status === 'trip')?.id || locationId,
    relayStates,
    events,
    supplied,
    breakerText: breakerFail ? 'Breaker failure scenario active' : `${loc.breaker} opened successfully`,
  };
}

/* ── Enhanced Single-Line Diagram for Theory ── */
function SystemSLDDiagram() {
  return (
    <svg viewBox="0 0 920 300" style={{ width: '100%', maxWidth: 920, height: 'auto', margin: '18px 0' }}>
      <text x="460" y="16" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">
        PROTECTED SYSTEM — SINGLE LINE DIAGRAM WITH PROTECTION ZONES
      </text>

      {/* protection zone overlays */}
      <rect x="30" y="50" width="110" height="120" rx="8" fill="rgba(34,197,94,0.05)" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 3" />
      <text x="85" y="44" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="600">87G Zone</text>

      <rect x="130" y="50" width="130" height="120" rx="8" fill="rgba(96,165,250,0.05)" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 3" />
      <text x="195" y="44" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="600">87T Zone</text>

      <rect x="250" y="50" width="140" height="120" rx="8" fill="rgba(167,139,250,0.05)" stroke="#a78bfa" strokeWidth="1" strokeDasharray="4 3" />
      <text x="320" y="44" textAnchor="middle" fill="#a78bfa" fontSize="8" fontWeight="600">Bus Diff Zone</text>

      <rect x="380" y="50" width="230" height="120" rx="8" fill="rgba(34,211,238,0.05)" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 3" />
      <text x="495" y="44" textAnchor="middle" fill="#22d3ee" fontSize="8" fontWeight="600">Distance Zone</text>

      <rect x="600" y="50" width="160" height="120" rx="8" fill="rgba(245,158,11,0.05)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" />
      <text x="680" y="44" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="600">87T + OC Zone</text>

      {/* main busbar */}
      <line x1="50" y1="110" x2="700" y2="110" stroke="#3f3f46" strokeWidth="6" />

      {/* generator */}
      <circle cx="70" cy="110" r="22" fill="#101015" stroke="#22c55e" strokeWidth="2" />
      <text x="70" y="114" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700">G</text>
      <text x="70" y="148" textAnchor="middle" fill="#71717a" fontSize="8">11 kV</text>

      {/* CT symbols */}
      {[130, 250, 380, 600, 760].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="110" r="7" fill="none" stroke={['#22c55e', '#60a5fa', '#a78bfa', '#22d3ee', '#f59e0b'][i]} strokeWidth="1.5" />
          <text x={x} y="113" textAnchor="middle" fill={['#22c55e', '#60a5fa', '#a78bfa', '#22d3ee', '#f59e0b'][i]} fontSize="6">CT</text>
        </g>
      ))}

      {/* breaker symbols */}
      {[{ x: 110, l: 'B1' }, { x: 220, l: 'B2' }, { x: 330, l: 'B3' }, { x: 540, l: 'B4' }, { x: 660, l: 'B5' }].map(({ x, l }) => (
        <g key={l}>
          <rect x={x - 12} y="100" width="24" height="20" rx="4" fill="#18181b" stroke="#3f3f46" />
          <text x={x} y="114" textAnchor="middle" fill="#e4e4e7" fontSize="7" fontWeight="600">{l}</text>
        </g>
      ))}

      {/* generator transformer */}
      <rect x="155" y="88" width="60" height="44" rx="8" fill="#101015" stroke="#60a5fa" strokeWidth="1.5" />
      <text x="185" y="108" textAnchor="middle" fill="#60a5fa" fontSize="8">11/220</text>
      <text x="185" y="120" textAnchor="middle" fill="#60a5fa" fontSize="7">kV GT</text>

      {/* 220 kV bus */}
      <line x1="280" y1="100" x2="370" y2="100" stroke="#a78bfa" strokeWidth="8" />
      <text x="325" y="92" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">220 kV Bus</text>

      {/* 220 kV line */}
      <line x1="400" y1="110" x2="580" y2="110" stroke="#22d3ee" strokeWidth="3" />
      <text x="490" y="100" textAnchor="middle" fill="#22d3ee" fontSize="9">220 kV Line</text>
      {/* tower symbols */}
      {[430, 480, 530].map((x) => (
        <g key={x}>
          <line x1={x} y1="110" x2={x} y2="125" stroke="#22d3ee" strokeWidth="1" />
          <line x1={x - 5} y1="125" x2={x + 5} y2="125" stroke="#22d3ee" strokeWidth="1" />
        </g>
      ))}

      {/* receiving end transformer */}
      <rect x="620" y="88" width="60" height="44" rx="8" fill="#101015" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="650" y="108" textAnchor="middle" fill="#f59e0b" fontSize="8">132/33</text>
      <text x="650" y="120" textAnchor="middle" fill="#f59e0b" fontSize="7">kV TF</text>

      {/* feeder bus */}
      <line x1="700" y1="110" x2="700" y2="80" stroke="#3f3f46" strokeWidth="3" />
      <line x1="700" y1="110" x2="700" y2="140" stroke="#3f3f46" strokeWidth="3" />

      {/* feeders */}
      <line x1="700" y1="80" x2="860" y2="80" stroke="#f472b6" strokeWidth="2" />
      <rect x="760" y="70" width="24" height="20" rx="4" fill="#18181b" stroke="#3f3f46" />
      <text x="772" y="84" textAnchor="middle" fill="#e4e4e7" fontSize="7">B6</text>
      <text x="830" y="75" fill="#f472b6" fontSize="9">Feeder A</text>

      <line x1="700" y1="140" x2="860" y2="140" stroke="#fb923c" strokeWidth="2" />
      <rect x="760" y="130" width="24" height="20" rx="4" fill="#18181b" stroke="#3f3f46" />
      <text x="772" y="144" textAnchor="middle" fill="#e4e4e7" fontSize="7">B7</text>
      <text x="830" y="135" fill="#fb923c" fontSize="9">Feeder B</text>

      {/* overlap annotations */}
      <text x="460" y="190" textAnchor="middle" fill="#52525b" fontSize="9">
        Protection zones overlap at CT locations to eliminate blind spots
      </text>

      {/* relay labels below */}
      <g transform="translate(0,210)">
        {[
          { x: 70, c: '#22c55e', t: '87G + 51V' },
          { x: 185, c: '#60a5fa', t: '87T + Buchholz' },
          { x: 325, c: '#a78bfa', t: 'Bus Diff' },
          { x: 490, c: '#22d3ee', t: 'Dist Z1/Z2/Z3' },
          { x: 650, c: '#f59e0b', t: '87T + 51/51N' },
          { x: 810, c: '#f472b6', t: '67/51' },
        ].map(({ x, c, t }) => (
          <g key={t}>
            <rect x={x - 45} y="0" width="90" height="22" rx="6" fill="rgba(255,255,255,0.03)" stroke={c} strokeWidth="1" />
            <text x={x} y="15" textAnchor="middle" fill={c} fontSize="8" fontWeight="600">{t}</text>
          </g>
        ))}
      </g>

      {/* distance zone reach arrows */}
      <g transform="translate(0,250)">
        <text x="490" y="10" textAnchor="middle" fill="#52525b" fontSize="8">Distance zone reach:</text>
        <line x1="400" y1="20" x2="540" y2="20" stroke="#22d3ee" strokeWidth="2" />
        <text x="470" y="18" textAnchor="middle" fill="#22d3ee" fontSize="7">Z1 (80%)</text>
        <line x1="380" y1="30" x2="620" y2="30" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x="500" y="28" textAnchor="middle" fill="#22d3ee" fontSize="7" opacity="0.7">Z2 (120%)</text>
        <line x1="350" y1="40" x2="700" y2="40" stroke="#22d3ee" strokeWidth="1" strokeDasharray="2 3" />
        <text x="525" y="38" textAnchor="middle" fill="#22d3ee" fontSize="7" opacity="0.5">Z3 (remote backup)</text>
      </g>
    </svg>
  );
}

/* ── Enhanced Simulation Diagram ── */
function Diagram({ locationId, sim, pulse }) {
  const statusColor = (status) => status === 'trip' ? '#ef4444' : status === 'pickup' ? '#f59e0b' : '#22c55e';
  const liveMap = Object.fromEntries(sim.supplied.map((s) => [s.id, s.live]));
  const relayMap = Object.fromEntries(sim.relayStates.map((r) => [r.id, r]));
  const fault = NODES.find((n) => n.id === locationId);

  return (
    <svg viewBox="0 0 1040 480" style={{ width: '100%', maxWidth: 1040, height: 'auto' }}>
      <defs>
        <filter id="pglow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="faultPulse"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="520" y="24" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="700" letterSpacing="0.08em">
        FLAGSHIP PROTECTION SYSTEM SIMULATOR — 4 BUS RADIAL ARRANGEMENT
      </text>

      {/* protection zone shading for faulted element */}
      {NODES.map((node) => {
        const zoneColor = ZONE_COLORS[node.id] || '#3f3f46';
        const isFaulted = node.id === locationId;
        return (
          <rect key={`zone-${node.id}`}
            x={node.x - 48} y={node.y - 50}
            width="96" height="100" rx="10"
            fill={isFaulted ? `rgba(239,68,68,0.08)` : `rgba(255,255,255,0.01)`}
            stroke={isFaulted ? '#ef4444' : zoneColor}
            strokeWidth={isFaulted ? 2 : 0.5}
            strokeDasharray={isFaulted ? 'none' : '4 4'}
            opacity={isFaulted ? 1 : 0.3}
          />
        );
      })}

      {/* main busbar */}
      <line x1="100" y1="170" x2="760" y2="170" stroke="#3f3f46" strokeWidth="8" strokeLinecap="round" />
      <line x1="760" y1="170" x2="900" y2="170" stroke="#3f3f46" strokeWidth="8" strokeLinecap="round" />
      <line x1="900" y1="170" x2="900" y2="110" stroke="#3f3f46" strokeWidth="8" />
      <line x1="900" y1="170" x2="900" y2="230" stroke="#3f3f46" strokeWidth="8" />

      {/* energized line segments (color-coded) */}
      {NODES.slice(0, 5).map((node, i) => {
        const nextNode = NODES[Math.min(i + 1, 4)];
        const live = liveMap[node.id] && liveMap[nextNode.id];
        return (
          <line key={`seg-${i}`}
            x1={node.x + 34} y1="170"
            x2={nextNode.x - 34} y2="170"
            stroke={live ? '#22c55e' : '#ef4444'}
            strokeWidth="3" opacity={live ? 0.3 : 0.15}
          />
        );
      })}

      {/* node elements */}
      {NODES.map((node) => {
        const relay = relayMap[node.id];
        const color = statusColor(relay.status);
        const live = liveMap[node.id];
        const zoneColor = ZONE_COLORS[node.id] || '#3f3f46';
        const isFaulted = node.id === locationId;

        return (
          <g key={node.id} opacity={live ? 1 : 0.28}>
            {/* node box */}
            <rect x={node.x - 34} y={node.y - 28} width="68" height="56" rx="12"
              fill={live ? '#111114' : '#0f1013'} stroke={color} strokeWidth="2" />

            {/* relay status indicator */}
            <circle cx={node.x} cy={node.y - 42} r="8" fill={color} filter="url(#pglow)">
              {relay.status !== 'monitor' && (
                <animate attributeName="opacity" values="1;0.4;1" dur={relay.status === 'trip' ? '0.5s' : '1s'} repeatCount="indefinite" />
              )}
            </circle>

            {/* breaker symbol inside box */}
            <text x={node.x} y={node.y - 6} textAnchor="middle" fill="#f4f4f5" fontSize="10" fontWeight="700">{node.breaker}</text>

            {/* breaker state indicator */}
            {relay.status === 'trip' ? (
              <g>
                <line x1={node.x - 8} y1={node.y + 12} x2={node.x - 2} y2={node.y + 4} stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                <line x1={node.x + 8} y1={node.y + 12} x2={node.x + 2} y2={node.y + 4} stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                <text x={node.x} y={node.y + 24} textAnchor="middle" fill="#ef4444" fontSize="7" fontWeight="700">OPEN</text>
              </g>
            ) : (
              <g>
                <line x1={node.x - 10} y1={node.y + 10} x2={node.x + 10} y2={node.y + 10} stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
                <text x={node.x} y={node.y + 24} textAnchor="middle" fill="#22c55e" fontSize="7">CLOSED</text>
              </g>
            )}

            {/* element name */}
            <text x={node.x} y={node.y + 46} textAnchor="middle" fill={isFaulted ? '#c4b5fd' : '#71717a'} fontSize="10">{node.short}</text>

            {/* relay status text */}
            <text x={node.x} y={node.y - 62} textAnchor="middle" fill={color} fontSize="9" fontWeight="700">
              {relay.status.toUpperCase()}{relay.time !== null ? ` @${relay.time}ms` : ''}
            </text>

            {/* zone color strip */}
            <line x1={node.x - 30} y1={node.y + 28} x2={node.x + 30} y2={node.y + 28} stroke={zoneColor} strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      })}

      {/* fault indicator with animated pulse */}
      <g>
        <circle cx={fault.x} cy={fault.y} r={pulse ? 36 : 30} fill="none" stroke="#ef4444" strokeWidth={pulse ? 4 : 3} strokeDasharray="6 5" opacity={pulse ? 1 : 0.6} filter="url(#faultPulse)" />
        <line x1={fault.x - 18} y1={fault.y - 18} x2={fault.x + 18} y2={fault.y + 18} stroke="#ef4444" strokeWidth="3" />
        <line x1={fault.x + 18} y1={fault.y - 18} x2={fault.x - 18} y2={fault.y + 18} stroke="#ef4444" strokeWidth="3" />
        {/* fault arc effect */}
        <path d={`M${fault.x - 12},${fault.y - 5} Q${fault.x},${fault.y - 15} ${fault.x + 12},${fault.y - 5}`}
          fill="none" stroke="#ef4444" strokeWidth="2" opacity={pulse ? 0.8 : 0.3}>
          <animate attributeName="d"
            values={`M${fault.x - 12},${fault.y - 5} Q${fault.x},${fault.y - 15} ${fault.x + 12},${fault.y - 5};M${fault.x - 12},${fault.y - 5} Q${fault.x},${fault.y - 20} ${fault.x + 12},${fault.y - 5};M${fault.x - 12},${fault.y - 5} Q${fault.x},${fault.y - 15} ${fault.x + 12},${fault.y - 5}`}
            dur="0.6s" repeatCount="indefinite" />
        </path>
      </g>

      {/* fault current flow arrows */}
      {sim.current > 5 && (
        <g opacity="0.6">
          <text x={fault.x} y={fault.y + 60} textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="700">
            If = {sim.current.toFixed(1)} kA
          </text>
        </g>
      )}

      {/* zone / relay summary panel */}
      <g transform="translate(70,300)">
        <rect width="900" height="130" rx="12" fill="#101015" stroke="#27272a" />
        <text x="16" y="22" fill="#818cf8" fontSize="12" fontWeight="700">Zone / Relay Summary</text>
        {NODES.map((node, i) => {
          const relay = relayMap[node.id];
          const zoneColor = ZONE_COLORS[node.id];
          return (
            <g key={node.id} transform={`translate(${16 + (i % 4) * 220}, ${40 + Math.floor(i / 4) * 42})`}>
              <rect width="10" height="10" rx="3" fill={statusColor(relay.status)} />
              <text x="16" y="9" fill="#a1a1aa" fontSize="10">{node.zone}</text>
              <text x="16" y="24" fill={zoneColor} fontSize="9">Relay: {node.relay}</text>
              {relay.time !== null && (
                <text x="16" y="36" fill={statusColor(relay.status)} fontSize="8" fontWeight="600">
                  {relay.status === 'trip' ? `Tripped at t=${relay.time}ms` : `Pickup at t=${relay.time}ms`}
                </text>
              )}
            </g>
          );
        })}
      </g>

      {/* CT saturation warning for high fault currents */}
      {sim.current > 15 && (
        <g transform="translate(70,440)">
          <rect width="900" height="28" rx="6" fill="rgba(245,158,11,0.08)" stroke="#f59e0b" />
          <circle cx="18" cy="14" r="5" fill="#f59e0b">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <text x="30" y="18" fill="#f59e0b" fontSize="10">
            CT saturation possible at {sim.current.toFixed(1)} kA — verify CT ALF and knee-point voltage are adequate for this fault level
          </text>
        </g>
      )}
    </svg>
  );
}

/* ── Fault Current Paths SVG ── */
function FaultAnalysisSVG() {
  return (
    <svg viewBox="0 0 500 340" style={{ width: '100%', maxWidth: 500, height: 'auto', margin: '18px 0' }}>
      <text x="250" y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">Fault Current Paths — Symmetrical Components</text>

      {/* three sequence networks */}
      {[
        { y: 55, label: 'Positive Sequence (I1)', color: '#22c55e', desc: 'Drives the fault, same as load current direction' },
        { y: 145, label: 'Negative Sequence (I2)', color: '#f59e0b', desc: 'Appears only during unbalanced faults' },
        { y: 235, label: 'Zero Sequence (I0)', color: '#22d3ee', desc: 'Flows through ground and neutral paths' },
      ].map(({ y, label, color, desc }) => (
        <g key={label}>
          <rect x="30" y={y} width="440" height="70" rx="10" fill="#101015" stroke={color} strokeWidth="1.5" />
          <text x="50" y={y + 18} fill={color} fontSize="10" fontWeight="700">{label}</text>
          <text x="50" y={y + 33} fill="#a1a1aa" fontSize="8">{desc}</text>

          {/* simplified network: source — impedance — fault */}
          <circle cx="80" cy={y + 52} r="10" fill="none" stroke={color} strokeWidth="1.5" />
          <text x="80" y={y + 55} textAnchor="middle" fill={color} fontSize="7">E</text>
          <line x1="90" y1={y + 52} x2="150" y2={y + 52} stroke={color} strokeWidth="2" />
          <rect x="150" y={y + 45} width="50" height="14" rx="3" fill="#18181b" stroke={color} />
          <text x="175" y={y + 55} textAnchor="middle" fill={color} fontSize="7">Z1/Z2/Z0</text>
          <line x1="200" y1={y + 52} x2="280" y2={y + 52} stroke={color} strokeWidth="2" />

          {/* fault point */}
          <circle cx="280" cy={y + 52} r="5" fill={color} />
          <text x="295" y={y + 55} fill={color} fontSize="7">F</text>

          {/* current arrow */}
          <path d={`M120,${y + 48} L130,${y + 52} L120,${y + 56}`} fill={color} />
        </g>
      ))}

      {/* fault type table */}
      <text x="250" y="320" textAnchor="middle" fill="#52525b" fontSize="9">LG: I1=I2=I0 | LL: I1=-I2, I0=0 | LLG: I1+I2+I0=0 | 3ph: I1 only, I2=I0=0</text>
      <text x="250" y="335" textAnchor="middle" fill="#52525b" fontSize="8">Total fault current = 3*I0 (for ground faults at fault point)</text>
    </svg>
  );
}

/* ── Protection Coordination Time-Distance SVG ── */
function ProtectionCoordinationSVG() {
  return (
    <svg viewBox="0 0 560 380" style={{ width: '100%', maxWidth: 560, height: 'auto', margin: '18px 0' }}>
      <text x="280" y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">Protection Coordination — Time vs Distance Diagram</text>

      {/* axes */}
      <line x1="70" y1="330" x2="520" y2="330" stroke="#3f3f46" strokeWidth="1.5" />
      <line x1="70" y1="330" x2="70" y2="40" stroke="#3f3f46" strokeWidth="1.5" />
      <text x="530" y="335" fill="#71717a" fontSize="9">Distance from source</text>
      <text x="30" y="40" fill="#71717a" fontSize="9">Time (s)</text>

      {/* location markers on x-axis */}
      {[
        { x: 100, label: 'Gen', color: '#22c55e' },
        { x: 180, label: 'GT', color: '#60a5fa' },
        { x: 260, label: 'Bus', color: '#a78bfa' },
        { x: 370, label: 'Line', color: '#22d3ee' },
        { x: 470, label: 'TF/Fdr', color: '#f59e0b' },
      ].map(({ x, label, color }) => (
        <g key={label}>
          <line x1={x} y1="325" x2={x} y2="335" stroke={color} strokeWidth="2" />
          <text x={x} y="348" textAnchor="middle" fill={color} fontSize="8" fontWeight="600">{label}</text>
        </g>
      ))}

      {/* time scale on y-axis */}
      {[0, 0.1, 0.3, 0.5, 1.0, 2.0].map((t) => {
        const y = 330 - t * 140;
        return (
          <g key={t}>
            <line x1="65" y1={y} x2="70" y2={y} stroke="#3f3f46" />
            <text x="58" y={y + 4} textAnchor="end" fill="#52525b" fontSize="8">{t}</text>
            <line x1="70" y1={y} x2="520" y2={y} stroke="#1e1e2e" strokeWidth="0.5" />
          </g>
        );
      })}

      {/* Generator differential - instantaneous */}
      <rect x="85" y={330 - 0.025 * 140} width="30" height="8" rx="3" fill="rgba(34,197,94,0.3)" stroke="#22c55e" strokeWidth="1.5" />
      <text x="125" y={330 - 0.025 * 140 + 6} fill="#22c55e" fontSize="7">87G (25ms)</text>

      {/* Transformer differential - fast */}
      <rect x="165" y={330 - 0.035 * 140} width="30" height="8" rx="3" fill="rgba(96,165,250,0.3)" stroke="#60a5fa" strokeWidth="1.5" />
      <text x="205" y={330 - 0.035 * 140 + 6} fill="#60a5fa" fontSize="7">87T (35ms)</text>

      {/* Bus differential */}
      <rect x="245" y={330 - 0.02 * 140} width="30" height="8" rx="3" fill="rgba(167,139,250,0.3)" stroke="#a78bfa" strokeWidth="1.5" />
      <text x="285" y={330 - 0.02 * 140 + 6} fill="#a78bfa" fontSize="7">87B (20ms)</text>

      {/* Distance Zone 1 */}
      <line x1="260" y1={330 - 0.028 * 140} x2="400" y2={330 - 0.028 * 140} stroke="#22d3ee" strokeWidth="2.5" />
      <text x="330" y={330 - 0.028 * 140 - 5} fill="#22d3ee" fontSize="8" fontWeight="600">Z1 (instant)</text>

      {/* Distance Zone 2 */}
      <line x1="260" y1={330 - 0.4 * 140} x2="470" y2={330 - 0.4 * 140} stroke="#22d3ee" strokeWidth="2" strokeDasharray="5 3" />
      <text x="365" y={330 - 0.4 * 140 - 5} fill="#22d3ee" fontSize="8">Z2 (0.3-0.4s)</text>

      {/* Distance Zone 3 */}
      <line x1="260" y1={330 - 1.0 * 140} x2="500" y2={330 - 1.0 * 140} stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="380" y={330 - 1.0 * 140 - 5} fill="#22d3ee" fontSize="8" opacity="0.7">Z3 (1.0s backup)</text>

      {/* OC feeder protection (IDMT curve) */}
      <path d={`M370,${330 - 0.14 * 140} Q420,${330 - 0.3 * 140} 470,${330 - 0.5 * 140}`} fill="none" stroke="#f59e0b" strokeWidth="2" />
      <text x="480" y={330 - 0.5 * 140 + 5} fill="#f59e0b" fontSize="7">51 IDMT</text>

      {/* coordination margin annotation */}
      <line x1="400" y1={330 - 0.028 * 140} x2="400" y2={330 - 0.4 * 140} stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" />
      <text x="410" y={330 - 0.2 * 140} fill="#ef4444" fontSize="7">CTI</text>
      <text x="410" y={330 - 0.2 * 140 + 10} fill="#ef4444" fontSize="6">0.3-0.4s</text>

      {/* legend */}
      <text x="280" y="370" textAnchor="middle" fill="#52525b" fontSize="9">CTI = Coordination Time Interval (grading margin between successive protections)</text>
    </svg>
  );
}

/* ── System Status Badge ── */
function SystemStatusBadge({ sim, locationId, breakerFail }) {
  const loc = NODES.find((n) => n.id === locationId);
  const hasTrip = sim.relayStates.some((r) => r.status === 'trip');
  let color, bg, label;
  if (breakerFail) {
    color = '#ef4444'; bg = 'rgba(239,68,68,0.12)'; label = 'BREAKER FAILURE';
  } else if (hasTrip) {
    color = '#f59e0b'; bg = 'rgba(245,158,11,0.12)'; label = 'FAULT ISOLATED';
  } else {
    color = '#22c55e'; bg = 'rgba(34,197,94,0.12)'; label = 'SYSTEM NORMAL';
  }
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: bg, border: `1px solid ${color}`, borderRadius: 8, marginRight: 12 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 10, color: '#71717a' }}>{loc.short} | {sim.current.toFixed(1)} kA</span>
    </div>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Power System Protection — Flagship View</h2>
      <p style={S.p}>
        The purpose of protection is simple to state but difficult to implement: detect faults quickly,
        isolate only the faulted element, and leave the healthy system in service. A practical protection
        system must satisfy <strong style={{ color: '#e4e4e7' }}>dependability</strong> (trip when it should),
        <strong style={{ color: '#e4e4e7' }}> security</strong> (do not trip when it should not),
        <strong style={{ color: '#e4e4e7' }}> selectivity</strong>, and <strong style={{ color: '#e4e4e7' }}>speed</strong>.
      </p>

      <h3 style={S.h3}>System Single-Line Diagram with Protection Zones</h3>
      <p style={S.p}>
        The diagram below shows the complete protected system modeled in this simulator. Each color-coded
        zone represents a distinct protection boundary defined by its instrument transformer (CT) locations.
        Adjacent zones overlap at the CT positions so there is no unprotected gap.
      </p>
      <SystemSLDDiagram />

      <h3 style={S.h3}>Fault Current Analysis — Symmetrical Components</h3>
      <p style={S.p}>
        When an unbalanced fault occurs, the three-phase system is decomposed into positive, negative, and
        zero sequence networks using Fortescue's transformation. The positive sequence network drives the
        fault and exists for all fault types. The negative sequence appears only for unbalanced faults.
        The zero sequence flows only when there is a ground path (LG and LLG faults). Understanding these
        components is essential for protection relay design and fault current calculation.
      </p>
      <FaultAnalysisSVG />

      <h3 style={S.h3}>Protection Coordination — Time-Distance Grading</h3>
      <p style={S.p}>
        Proper coordination ensures that the relay closest to the fault operates first, and upstream
        relays act as backup with increasing time delay. The coordination time interval (CTI) between
        successive protection zones is typically 0.3-0.4 seconds for electromechanical relays and 0.2-0.3
        seconds for numerical relays. Differential and distance Zone 1 protections are instantaneous
        and do not require time grading with adjacent zones because they are inherently selective.
      </p>
      <ProtectionCoordinationSVG />

      <h3 style={S.h3}>Primary and Backup Philosophy</h3>
      <p style={S.p}>
        Each major element is assigned a primary protection function best suited to its physics:
        lines use distance protection, generators and transformers use differential protection, buses use busbar differential,
        and feeders use overcurrent or directional overcurrent protection. Backup protection exists because relays, CTs, wiring,
        and breakers can fail. If primary protection does not clear the fault, an upstream element must trip after a deliberate delay.
      </p>
      <span style={S.eq}>Total clearing time = relay operating time + breaker interrupting time</span>
      <span style={S.eq}>Backup delay &gt; primary clearing time + coordination margin</span>

      <h3 style={S.h3}>Protection Zones and Overlap</h3>
      <p style={S.p}>
        The boundary of a protection zone is defined by instrument transformer locations, especially CTs.
        Adjacent zones intentionally overlap so there is no unprotected gap between elements. A fault at the overlap may be seen by more than one relay,
        but selectivity logic and grading ensure the correct breaker set clears first.
      </p>

      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Element</th>
            <th style={S.th}>Primary Protection</th>
            <th style={S.th}>Why It Is Chosen</th>
            <th style={S.th}>Typical Backup</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Generator', '87G differential', 'Internal stator faults demand very fast selective trip', '51V / distance backup'],
            ['Generator transformer', '87T + Buchholz', 'Electrical internal faults and oil/gas faults require different sensors', '51/51N'],
            ['220 kV bus', 'Bus differential', 'All connected circuits must clear together for internal bus faults', 'Breaker-failure / remote backup'],
            ['220 kV line', 'Distance relay', 'Impedance is proportional to distance, suitable for EHV transmission', 'Zone 2 / Zone 3'],
            ['33 kV feeder', 'Directional OC', 'Multiple infeeds and radial sections require direction plus current magnitude', 'Upstream OC'],
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

      <h3 style={S.h3}>Fault Detection and Clearing Sequence</h3>
      <p style={S.p}>
        Understanding the sequence from fault inception to isolation is critical. The simulator models this
        timeline for each element:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#22c55e' }}>Monitor:</strong> Relay is in normal surveillance mode, continuously measuring current and voltage.</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>Pickup:</strong> Relay measuring element crosses threshold — the fault is detected but trip has not yet been issued.</li>
        <li style={S.li}><strong style={{ color: '#ef4444' }}>Trip:</strong> After logic and time delay requirements are satisfied, the relay issues a trip command to the breaker.</li>
        <li style={S.li}>The breaker must then part its contacts and interrupt at current zero without restrike.</li>
        <li style={S.li}>If the breaker fails, breaker-failure or backup protection trips a wider section to clear the stuck fault.</li>
      </ul>
      <span style={S.eq}>Fault inception → CT/PT measurement → Relay pickup → Trip command → Breaker open → Arc extinction → Fault cleared</span>

      <h3 style={S.h3}>Indian Utility Context</h3>
      <p style={S.p}>
        In Indian 220 kV and above substations, utilities such as PGCIL and state transmission companies use numerical IEDs from ABB, Siemens, GE/Alstom,
        SEL, L&T, BHEL, Easun Reyrolle and similar vendors. Protection philosophy is guided by CEA technical standards, CBIP manuals,
        CT/PT practice under IS 2705 and IEC 61869, and utility-specific coordination studies. Typical breaker operating times are around 2 to 3 cycles for modern EHV breakers.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Why This Flagship Matters</span>
        <p style={S.ctxP}>
          The protection system is the nervous system of the grid. The single-line diagram here is deliberately compact,
          but the same event chain applies to real 220/132/33 kV Indian substations: measurement by CT/PT, decision by relay,
          interruption by breaker, and backup action when anything in that chain fails.
        </p>
      </div>

      <h2 style={S.h2}>Key Protection Objectives</h2>
      <span style={S.eq}>Reliability = Dependability + Security</span>
      <p style={S.p}>
        High dependability without security produces nuisance trips. High security without dependability produces missed trips.
        Good protection engineering balances both, while also minimizing total fault energy and keeping the unfaulted network alive.
      </p>

      <h2 style={S.h2}>References</h2>
      <ul style={S.ul}>
        <li style={S.li}>Y.G. Paithankar and S.R. Bhide — <em>Fundamentals of Power System Protection</em></li>
        <li style={S.li}>J. Lewis Blackburn and Thomas J. Domin — <em>Protective Relaying: Principles and Applications</em></li>
        <li style={S.li}>C.R. Mason — <em>The Art and Science of Protective Relaying</em></li>
        <li style={S.li}>Central Electricity Authority — Technical Standards and Grid-connected Protection Practice</li>
        <li style={S.li}>CBIP Manuals on Substation and Transmission Line Protection</li>
      </ul>
    </div>
  );
}

export default function ProtectionSimulator() {
  const [tab, setTab] = useState('simulate');
  const [location, setLocation] = useState('line');
  const [faultType, setFaultType] = useState('LG');
  const [zf, setZf] = useState(1);
  const [breakerFail, setBreakerFail] = useState(false);
  const pulse = useAnimationPulse(700);

  const sim = useMemo(() => protectionSequence(location, faultType, zf, breakerFail), [location, faultType, zf, breakerFail]);
  const loc = NODES.find((n) => n.id === location);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' }}>
            <SystemStatusBadge sim={sim} locationId={location} breakerFail={breakerFail} />
          </div>
          <div style={S.svgWrap}>
            <Diagram locationId={location} sim={sim} pulse={pulse} />
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Fault location</span>
              <select style={S.sel} value={location} onChange={(e) => setLocation(e.target.value)}>
                {NODES.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Fault type</span>
              <select style={S.sel} value={faultType} onChange={(e) => setFaultType(e.target.value)}>
                {Object.keys(FAULTS).map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Fault impedance</span>
              <input style={S.slider} type="range" min="0" max="10" step="0.5" value={zf} onChange={(e) => setZf(Number(e.target.value))} />
              <span style={S.val}>{zf.toFixed(1)} ohm</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Breaker fail</span>
              <input type="checkbox" checked={breakerFail} onChange={(e) => setBreakerFail(e.target.checked)} style={{ accentColor: '#6366f1' }} />
            </div>
          </div>

          <div style={S.results}>
            <div style={S.ri}><span style={S.rl}>Faulted element</span><span style={{ ...S.rv, color: ZONE_COLORS[location] }}>{loc.short}</span></div>
            <div style={S.ri}><span style={S.rl}>Estimated fault current</span><span style={S.rv}>{sim.current.toFixed(1)} kA</span></div>
            <div style={S.ri}><span style={S.rl}>Primary relay zone</span><span style={S.rv}>{loc.relay}</span></div>
            <div style={S.ri}><span style={S.rl}>Breaker result</span><span style={{ ...S.rv, color: breakerFail ? '#ef4444' : '#22c55e' }}>{sim.breakerText}</span></div>
          </div>

          <div style={S.strip}>
            <div style={S.box}>
              <span style={S.boxT}>Selected Protection Zone</span>
              <span style={S.boxV}>{loc.zone}{'\n'}Primary relay: {loc.relay}{'\n'}Controlled breaker: {loc.breaker}</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Fault Interpretation</span>
              <span style={S.boxV}>{FAULTS[faultType].label}{'\n'}Zf reduces fault current and may shift relay operating margins.{'\n'}Higher Zf generally slows or weakens pickup.</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Backup Logic</span>
              <span style={S.boxV}>{breakerFail ? 'Breaker fail enabled: backup trip expected.' : 'Primary trip only: healthy sections remain energized.'}</span>
            </div>
          </div>

          <div style={{ padding: '14px 24px', background: '#0f1015', borderTop: '1px solid #1e1e2e' }}>
            <div style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Event Timeline</div>
            {sim.events.map((e, i) => (
              <div key={i} style={{ color: '#a1a1aa', fontSize: 13, lineHeight: 1.75, paddingLeft: 8, borderLeft: `2px solid ${e.includes('trip') || e.includes('Trip') ? '#ef4444' : e.includes('pickup') || e.includes('picks up') ? '#f59e0b' : '#27272a'}` , marginBottom: 4 }}>
                {e}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
