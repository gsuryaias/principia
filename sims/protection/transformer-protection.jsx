import React, { useMemo, useState, useEffect, useCallback } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', color: '#e4e4e7', fontFamily: 'Inter, system-ui, sans-serif' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowX: 'auto', minHeight: 360 },
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

/* ── protection response logic (unchanged physics) ── */
function protectionResponse(type, severity) {
  const map = {
    'Internal Winding Fault': ['Differential operates', 'Buchholz trip for severe oil disturbance', 'Breaker trips'],
    'External Fault': ['Differential restrains', 'Backup OC starts timing', 'Upstream system should clear'],
    Inrush: ['Differential sees mismatch', '2nd harmonic block restrains trip', 'No breaker trip'],
    Overload: ['WTI/OTI alarm', 'Temperature rises with time', 'Trip only if sustained'],
    'Oil/Gas Fault': ['Buchholz alarm', 'Buchholz trip for surge', 'Pressure relief may operate'],
  };
  return map[type].map((t, i) => `${i * Math.round(80 / Math.max(severity, 1))} ms: ${t}`);
}

/* ── fault animation state ── */
const ZONE_COLORS = {
  'Internal Winding Fault': '#ef4444',
  'External Fault': '#f59e0b',
  Inrush: '#a78bfa',
  Overload: '#f59e0b',
  'Oil/Gas Fault': '#22d3ee',
};

function useAnimationPulse(interval = 900) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), interval);
    return () => clearInterval(id);
  }, [interval]);
  return pulse;
}

/* ── Buchholz Relay SVG Diagram ── */
function BuchholzDiagram() {
  return (
    <svg viewBox="0 0 660 220" style={{ width: '100%', maxWidth: 660, height: 'auto', margin: '18px 0' }}>
      {/* conservator tank */}
      <rect x="480" y="30" width="140" height="60" rx="10" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
      <text x="550" y="65" textAnchor="middle" fill="#a1a1aa" fontSize="11" fontWeight="600">Conservator</text>
      {/* pipe connecting conservator to main tank */}
      <line x1="480" y1="60" x2="340" y2="60" stroke="#3f3f46" strokeWidth="6" />
      {/* Buchholz relay on the pipe */}
      <rect x="370" y="38" width="70" height="44" rx="8" fill="rgba(34,211,238,0.12)" stroke="#22d3ee" strokeWidth="2" />
      <text x="405" y="56" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="700">BUCHHOLZ</text>
      <text x="405" y="72" textAnchor="middle" fill="#22d3ee" fontSize="8">RELAY</text>
      {/* alarm and trip float labels */}
      <line x1="380" y1="82" x2="380" y2="105" stroke="#22d3ee" strokeDasharray="3 3" />
      <text x="380" y="118" textAnchor="middle" fill="#a1a1aa" fontSize="9">Alarm float</text>
      <line x1="430" y1="82" x2="430" y2="105" stroke="#ef4444" strokeDasharray="3 3" />
      <text x="430" y="118" textAnchor="middle" fill="#a1a1aa" fontSize="9">Trip float</text>
      {/* main tank */}
      <rect x="60" y="30" width="260" height="160" rx="14" fill="#101015" stroke="#3f3f46" strokeWidth="2" />
      <text x="190" y="75" textAnchor="middle" fill="#e4e4e7" fontSize="13" fontWeight="700">Main Tank</text>
      {/* HV and LV windings */}
      <ellipse cx="140" cy="130" rx="30" ry="40" fill="none" stroke="#60a5fa" strokeWidth="2" />
      <text x="140" y="135" textAnchor="middle" fill="#60a5fa" fontSize="10">HV</text>
      <ellipse cx="230" cy="130" rx="30" ry="40" fill="none" stroke="#22c55e" strokeWidth="2" />
      <text x="230" y="135" textAnchor="middle" fill="#22c55e" fontSize="10">LV</text>
      {/* core */}
      <rect x="160" y="95" width="20" height="70" rx="3" fill="#27272a" />
      <text x="170" y="205" textAnchor="middle" fill="#52525b" fontSize="9">Core</text>
      {/* oil level indicator */}
      <line x1="340" y1="50" x2="340" y2="180" stroke="#3f3f46" strokeDasharray="4 3" />
      <text x="345" y="195" fill="#52525b" fontSize="9">Oil level</text>
      {/* gas bubbles on fault */}
      <circle cx="185" cy="100" r="3" fill="#22d3ee" opacity="0.5" />
      <circle cx="195" cy="95" r="2" fill="#22d3ee" opacity="0.4" />
      <circle cx="178" cy="92" r="2.5" fill="#22d3ee" opacity="0.45" />
      <text x="195" y="85" fill="#22d3ee" fontSize="8" opacity="0.7">gas</text>
    </svg>
  );
}

/* ── Differential Protection CT Connections SVG ── */
function DifferentialCTDiagram() {
  return (
    <svg viewBox="0 0 700 240" style={{ width: '100%', maxWidth: 700, height: 'auto', margin: '18px 0' }}>
      {/* HV side */}
      <line x1="40" y1="100" x2="160" y2="100" stroke="#60a5fa" strokeWidth="4" />
      <text x="100" y="80" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">220 kV HV Side</text>
      {/* HV CT */}
      <circle cx="170" cy="100" r="16" fill="none" stroke="#60a5fa" strokeWidth="2" />
      <circle cx="170" cy="100" r="10" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
      <text x="170" y="104" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="700">CT1</text>
      {/* transformer symbol */}
      <rect x="240" y="65" width="140" height="80" rx="12" fill="#101015" stroke="#3f3f46" strokeWidth="2" />
      <ellipse cx="290" cy="105" rx="22" ry="28" fill="none" stroke="#60a5fa" strokeWidth="2" />
      <ellipse cx="330" cy="105" rx="22" ry="28" fill="none" stroke="#22c55e" strokeWidth="2" />
      <text x="310" y="80" textAnchor="middle" fill="#71717a" fontSize="9">Transformer</text>
      {/* connection lines */}
      <line x1="186" y1="100" x2="240" y2="100" stroke="#3f3f46" strokeWidth="3" />
      <line x1="380" y1="100" x2="430" y2="100" stroke="#3f3f46" strokeWidth="3" />
      {/* LV CT */}
      <circle cx="440" cy="100" r="16" fill="none" stroke="#22c55e" strokeWidth="2" />
      <circle cx="440" cy="100" r="10" fill="none" stroke="#22c55e" strokeWidth="1.5" />
      <text x="440" y="104" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="700">CT2</text>
      {/* LV side */}
      <line x1="456" y1="100" x2="580" y2="100" stroke="#22c55e" strokeWidth="4" />
      <text x="520" y="80" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="600">132 kV LV Side</text>
      {/* CT secondary leads down to relay */}
      <line x1="170" y1="116" x2="170" y2="190" stroke="#60a5fa" strokeDasharray="4 3" strokeWidth="1.5" />
      <line x1="440" y1="116" x2="440" y2="190" stroke="#22c55e" strokeDasharray="4 3" strokeWidth="1.5" />
      {/* differential relay */}
      <rect x="200" y="180" width="210" height="40" rx="10" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="2" />
      <text x="305" y="205" textAnchor="middle" fill="#6366f1" fontSize="11" fontWeight="700">87T Differential Relay</text>
      <line x1="170" y1="200" x2="200" y2="200" stroke="#60a5fa" strokeDasharray="3 3" />
      <line x1="440" y1="200" x2="410" y2="200" stroke="#22c55e" strokeDasharray="3 3" />
      {/* current direction labels */}
      <text x="145" y="145" fill="#a1a1aa" fontSize="8">I_HV / N</text>
      <text x="445" y="145" fill="#a1a1aa" fontSize="8">I_LV / N</text>
      {/* spill current annotation */}
      <text x="305" y="235" textAnchor="middle" fill="#52525b" fontSize="9">I_diff = |I1 - I2| &gt; I_pickup triggers trip</text>
    </svg>
  );
}

/* ── Fault Zone Diagram ── */
function FaultZoneDiagram() {
  return (
    <svg viewBox="0 0 720 200" style={{ width: '100%', maxWidth: 720, height: 'auto', margin: '18px 0' }}>
      {/* zone background rectangles */}
      <rect x="20" y="30" width="180" height="120" rx="8" fill="rgba(96,165,250,0.06)" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="110" y="22" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">Zone 1: External HV</text>
      <rect x="180" y="30" width="280" height="120" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="320" y="22" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="600">Zone 2: Internal (87T + Buchholz)</text>
      <rect x="440" y="30" width="220" height="120" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="550" y="22" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="600">Zone 3: External LV</text>
      {/* busbar HV */}
      <line x1="40" y1="90" x2="120" y2="90" stroke="#60a5fa" strokeWidth="6" />
      <text x="80" y="115" textAnchor="middle" fill="#60a5fa" fontSize="9">220 kV Bus</text>
      {/* HV CB */}
      <rect x="130" y="80" width="30" height="20" rx="4" fill="#18181b" stroke="#60a5fa" />
      <text x="145" y="94" textAnchor="middle" fill="#60a5fa" fontSize="8">CB1</text>
      {/* CT1 */}
      <circle cx="185" cy="90" r="8" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
      <text x="185" y="93" textAnchor="middle" fill="#60a5fa" fontSize="7">CT</text>
      {/* Transformer */}
      <rect x="230" y="68" width="160" height="50" rx="10" fill="#101015" stroke="#3f3f46" strokeWidth="2" />
      <text x="310" y="97" textAnchor="middle" fill="#e4e4e7" fontSize="10" fontWeight="600">220/132 kV Transformer</text>
      {/* CT2 */}
      <circle cx="430" cy="90" r="8" fill="none" stroke="#22c55e" strokeWidth="1.5" />
      <text x="430" y="93" textAnchor="middle" fill="#22c55e" fontSize="7">CT</text>
      {/* LV CB */}
      <rect x="455" y="80" width="30" height="20" rx="4" fill="#18181b" stroke="#22c55e" />
      <text x="470" y="94" textAnchor="middle" fill="#22c55e" fontSize="8">CB2</text>
      {/* busbar LV */}
      <line x1="500" y1="90" x2="620" y2="90" stroke="#22c55e" strokeWidth="6" />
      <text x="560" y="115" textAnchor="middle" fill="#22c55e" fontSize="9">132 kV Bus</text>
      {/* backup OC */}
      <rect x="80" y="140" width="100" height="22" rx="6" fill="rgba(245,158,11,0.1)" stroke="#f59e0b" />
      <text x="130" y="155" textAnchor="middle" fill="#f59e0b" fontSize="8">51/51N Backup</text>
      {/* legend */}
      <text x="20" y="185" fill="#71717a" fontSize="9">Overlap at CTs ensures no blind spot between zones</text>
    </svg>
  );
}

/* ── Main Simulation Diagram ── */
function SimDiagram({ faultType, severity, pulse, events }) {
  const faultColor = ZONE_COLORS[faultType] || '#ef4444';
  const isFaulted = faultType === 'Internal Winding Fault' || faultType === 'Oil/Gas Fault';
  const isDiffTrip = faultType === 'Internal Winding Fault';
  const isTripFault = faultType === 'Internal Winding Fault' || faultType === 'Oil/Gas Fault';
  const isInrush = faultType === 'Inrush';
  const isOverload = faultType === 'Overload';
  const isExternal = faultType === 'External Fault';

  // breaker state based on fault type
  const hvBreakerOpen = isTripFault;
  const lvBreakerOpen = isTripFault;

  return (
    <svg viewBox="0 0 960 420" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      <defs>
        <filter id="tpglow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <linearGradient id="tpZoneInt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      <text x="480" y="22" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="700" letterSpacing="0.06em">
        TRANSFORMER PROTECTION SCHEME — 220/132 kV
      </text>

      {/* ── protection zone shading ── */}
      <rect x="215" y="60" width="430" height="180" rx="12" fill="url(#tpZoneInt)" stroke={isDiffTrip ? '#ef4444' : '#27272a'} strokeWidth={isDiffTrip ? 2 : 1} strokeDasharray={isDiffTrip ? 'none' : '6 4'} />
      <text x="430" y="76" textAnchor="middle" fill={isDiffTrip ? '#ef4444' : '#3f3f46'} fontSize="9" fontWeight="600">DIFFERENTIAL PROTECTION ZONE (87T)</text>

      {/* ── 220 kV source ── */}
      <line x1="40" y1="150" x2="160" y2="150" stroke="#60a5fa" strokeWidth="5" />
      <text x="100" y="135" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">220 kV</text>

      {/* ── HV Breaker ── */}
      <g transform="translate(170,135)">
        <rect width="40" height="30" rx="6" fill={hvBreakerOpen ? 'rgba(239,68,68,0.15)' : '#18181b'} stroke={hvBreakerOpen ? '#ef4444' : '#3f3f46'} strokeWidth="2" />
        {hvBreakerOpen ? (
          <>
            <line x1="10" y1="25" x2="20" y2="5" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            <line x1="30" y1="25" x2="20" y2="5" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <line x1="5" y1="15" x2="35" y2="15" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
        )}
        <text x="20" y={hvBreakerOpen ? -4 : -4} textAnchor="middle" fill={hvBreakerOpen ? '#ef4444' : '#22c55e'} fontSize="8" fontWeight="700">
          {hvBreakerOpen ? 'OPEN' : 'CLOSED'}
        </text>
      </g>

      {/* ── HV CT ── */}
      <circle cx="240" cy="150" r="14" fill="none" stroke="#60a5fa" strokeWidth="2" />
      <circle cx="240" cy="150" r="8" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
      <text x="240" y="154" textAnchor="middle" fill="#60a5fa" fontSize="7" fontWeight="700">CT1</text>
      <text x="240" y="180" textAnchor="middle" fill="#60a5fa" fontSize="9">HV CT</text>

      {/* ── Transformer ── */}
      <rect x="310" y="95" width="220" height="120" rx="16" fill="#101015" stroke="#3f3f46" strokeWidth="2" />
      <ellipse cx="380" cy="155" rx="32" ry="40" fill="none" stroke="#60a5fa" strokeWidth="2" />
      <text x="380" y="159" textAnchor="middle" fill="#60a5fa" fontSize="10">HV</text>
      <ellipse cx="460" cy="155" rx="32" ry="40" fill="none" stroke="#22c55e" strokeWidth="2" />
      <text x="460" y="159" textAnchor="middle" fill="#22c55e" fontSize="10">LV</text>
      {/* core */}
      <rect x="408" y="120" width="14" height="70" rx="3" fill="#27272a" />

      {/* ── Buchholz relay ── */}
      <rect x="380" y="56" width="80" height="28" rx="8" fill={faultType === 'Oil/Gas Fault' ? 'rgba(34,211,238,0.2)' : 'rgba(34,211,238,0.06)'} stroke="#22d3ee" strokeWidth={faultType === 'Oil/Gas Fault' ? 2 : 1} />
      <circle cx="395" cy="70" r="5" fill={faultType === 'Oil/Gas Fault' ? (pulse ? '#22d3ee' : '#0e7490') : '#164e63'} />
      <text x="430" y="74" textAnchor="middle" fill="#22d3ee" fontSize="8" fontWeight="700">BUCHHOLZ</text>
      <line x1="420" y1="56" x2="420" y2="40" stroke="#22d3ee" strokeDasharray="3 3" />
      <text x="420" y="36" textAnchor="middle" fill="#22d3ee" fontSize="8">To conservator</text>

      {/* ── WTI / OTI ── */}
      <rect x="545" y="95" width="100" height="28" rx="8" fill={isOverload ? 'rgba(245,158,11,0.15)' : '#18181b'} stroke="#f59e0b" strokeWidth={isOverload ? 2 : 1} />
      <text x="595" y="113" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="600">WTI / OTI</text>
      <text x="595" y="138" textAnchor="middle" fill="#52525b" fontSize="8">Temperature</text>

      {/* ── Backup OC ── */}
      <rect x="545" y="155" width="100" height="28" rx="8" fill={isExternal ? 'rgba(245,158,11,0.15)' : '#18181b'} stroke="#ef4444" strokeWidth={isExternal ? 2 : 1} />
      <text x="595" y="173" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="600">51 / 51N</text>
      <text x="595" y="198" textAnchor="middle" fill="#52525b" fontSize="8">Backup OC</text>

      {/* ── LV CT ── */}
      <circle cx="580" cy="265" r="14" fill="none" stroke="#22c55e" strokeWidth="2" />
      <circle cx="580" cy="265" r="8" fill="none" stroke="#22c55e" strokeWidth="1.5" />
      <text x="580" y="269" textAnchor="middle" fill="#22c55e" fontSize="7" fontWeight="700">CT2</text>
      <text x="580" y="295" textAnchor="middle" fill="#22c55e" fontSize="9">LV CT</text>

      {/* ── LV Breaker ── */}
      <g transform="translate(620,250)">
        <rect width="40" height="30" rx="6" fill={lvBreakerOpen ? 'rgba(239,68,68,0.15)' : '#18181b'} stroke={lvBreakerOpen ? '#ef4444' : '#3f3f46'} strokeWidth="2" />
        {lvBreakerOpen ? (
          <>
            <line x1="10" y1="25" x2="20" y2="5" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
            <line x1="30" y1="25" x2="20" y2="5" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          </>
        ) : (
          <line x1="5" y1="15" x2="35" y2="15" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
        )}
        <text x="20" y={-4} textAnchor="middle" fill={lvBreakerOpen ? '#ef4444' : '#22c55e'} fontSize="8" fontWeight="700">
          {lvBreakerOpen ? 'OPEN' : 'CLOSED'}
        </text>
      </g>

      {/* ── 132 kV load side ── */}
      <line x1="530" y1="215" x2="530" y2="265" stroke="#22c55e" strokeWidth="3" />
      <line x1="530" y1="265" x2="560" y2="265" stroke="#22c55e" strokeWidth="3" />
      <line x1="660" y1="265" x2="760" y2="265" stroke="#22c55e" strokeWidth="5" />
      <text x="730" y="250" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="600">132 kV</text>

      {/* ── connection from transformer to LV side ── */}
      <line x1="255" y1="150" x2="310" y2="150" stroke="#3f3f46" strokeWidth="3" />
      <line x1="530" y1="155" x2="530" y2="215" stroke="#3f3f46" strokeWidth="3" />

      {/* ── Differential Relay ── */}
      <rect x="280" y="260" width="200" height="36" rx="10" fill={isDiffTrip ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.06)'} stroke="#6366f1" strokeWidth={isDiffTrip ? 2 : 1} />
      <circle cx="295" cy="278" r="6" fill={isDiffTrip ? (pulse ? '#ef4444' : '#6366f1') : '#6366f1'} filter="url(#tpglow)" />
      <text x="390" y="283" textAnchor="middle" fill="#6366f1" fontSize="11" fontWeight="700">87T Biased Differential Relay</text>
      {/* CT1 secondary lead */}
      <line x1="240" y1="164" x2="240" y2="278" stroke="#60a5fa" strokeDasharray="4 3" strokeWidth="1.5" />
      <line x1="240" y1="278" x2="280" y2="278" stroke="#60a5fa" strokeDasharray="4 3" strokeWidth="1.5" />
      {/* CT2 secondary lead */}
      <line x1="580" y1="251" x2="580" y2="320" stroke="#22c55e" strokeDasharray="4 3" strokeWidth="1.5" />
      <line x1="580" y1="320" x2="490" y2="320" stroke="#22c55e" strokeDasharray="4 3" strokeWidth="1.5" />
      <line x1="490" y1="320" x2="490" y2="296" stroke="#22c55e" strokeDasharray="4 3" strokeWidth="1.5" />
      <line x1="490" y1="296" x2="480" y2="296" stroke="#22c55e" strokeDasharray="3 3" strokeWidth="1.5" />

      {/* ── Fault indicator ── */}
      {isFaulted && (
        <g>
          <circle cx="420" cy="155" r={pulse ? 28 : 24} fill="none" stroke={faultColor} strokeWidth="3" strokeDasharray="5 4" opacity={pulse ? 1 : 0.6} />
          <line x1="408" y1="143" x2="432" y2="167" stroke={faultColor} strokeWidth="2.5" />
          <line x1="432" y1="143" x2="408" y2="167" stroke={faultColor} strokeWidth="2.5" />
          <text x="420" y="200" textAnchor="middle" fill={faultColor} fontSize="9" fontWeight="700">FAULT</text>
        </g>
      )}
      {isInrush && (
        <g>
          <path d={`M360,135 Q380,115 395,135 Q410,155 425,135 Q440,115 455,135`} fill="none" stroke="#a78bfa" strokeWidth="2" opacity={pulse ? 1 : 0.5} />
          <text x="420" y="108" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Magnetizing inrush</text>
          <text x="420" y="230" textAnchor="middle" fill="#a78bfa" fontSize="9">2nd harmonic restraint active</text>
        </g>
      )}

      {/* ── 2nd harmonic block indicator for inrush ── */}
      {isInrush && (
        <rect x="320" y="300" width="200" height="22" rx="6" fill="rgba(167,139,250,0.1)" stroke="#a78bfa">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </rect>
      )}
      {isInrush && <text x="420" y="316" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">HARMONIC BLOCK: TRIP RESTRAINED</text>}

      {/* ── Event timeline strip at bottom ── */}
      <rect x="30" y="355" width="900" height="55" rx="10" fill="#101015" stroke="#27272a" />
      <text x="50" y="374" fill="#818cf8" fontSize="10" fontWeight="700">Event Sequence</text>
      {events.slice(0, 3).map((ev, i) => (
        <text key={i} x="50" y={390 + i * 14} fill="#a1a1aa" fontSize="9">{ev}</text>
      ))}
    </svg>
  );
}

/* ── REF Protection SVG ── */
function REFProtectionSVG() {
  return (
    <svg viewBox="0 0 500 320" style={{ width: '100%', maxWidth: 500, height: 'auto', margin: '18px 0' }}>
      <text x="250" y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">Restricted Earth Fault (64REF) Protection</text>

      {/* transformer star winding */}
      <rect x="120" y="50" width="260" height="140" rx="14" fill="#101015" stroke="#3f3f46" strokeWidth="2" />
      <text x="250" y="70" textAnchor="middle" fill="#e4e4e7" fontSize="10" fontWeight="600">Star Winding (LV Side)</text>

      {/* three phase windings with CT on each */}
      {['R', 'Y', 'B'].map((ph, i) => {
        const cx = 170 + i * 60;
        const color = ph === 'R' ? '#ef4444' : ph === 'Y' ? '#f59e0b' : '#60a5fa';
        return (
          <g key={ph}>
            {/* winding coil */}
            <path d={`M${cx},90 Q${cx + 8},100 ${cx},110 Q${cx - 8},120 ${cx},130 Q${cx + 8},140 ${cx},150`} fill="none" stroke={color} strokeWidth="2" />
            <text x={cx} y="85" textAnchor="middle" fill={color} fontSize="9" fontWeight="600">{ph}</text>
            {/* phase CT */}
            <circle cx={cx} cy="165" r="8" fill="none" stroke={color} strokeWidth="1.5" />
            <text x={cx} y="168" textAnchor="middle" fill={color} fontSize="6">CT</text>
            {/* CT secondary lead down */}
            <line x1={cx} y1="173" x2={cx} y2="220" stroke={color} strokeDasharray="3 3" strokeWidth="1" />
          </g>
        );
      })}

      {/* neutral point (star connection) */}
      <line x1="170" y1="150" x2="290" y2="150" stroke="#3f3f46" strokeWidth="1.5" />
      <line x1="230" y1="150" x2="230" y2="195" stroke="#3f3f46" strokeWidth="2" />

      {/* neutral CT */}
      <circle cx="230" cy="205" r="10" fill="none" stroke="#22d3ee" strokeWidth="2" />
      <text x="230" y="208" textAnchor="middle" fill="#22d3ee" fontSize="7" fontWeight="700">NCT</text>
      <text x="260" y="210" fill="#22d3ee" fontSize="8">Neutral CT</text>

      {/* neutral grounding resistor */}
      <line x1="230" y1="215" x2="230" y2="240" stroke="#3f3f46" strokeWidth="2" />
      <rect x="218" y="240" width="24" height="16" rx="3" fill="#18181b" stroke="#f59e0b" />
      <text x="230" y="252" textAnchor="middle" fill="#f59e0b" fontSize="7">NGR</text>
      <line x1="230" y1="256" x2="230" y2="275" stroke="#3f3f46" strokeWidth="2" />
      {/* earth */}
      <line x1="218" y1="275" x2="242" y2="275" stroke="#3f3f46" strokeWidth="2" />
      <line x1="222" y1="280" x2="238" y2="280" stroke="#3f3f46" strokeWidth="1.5" />
      <line x1="226" y1="285" x2="234" y2="285" stroke="#3f3f46" strokeWidth="1" />

      {/* REF relay */}
      <rect x="150" y="225" width="130" height="30" rx="8" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="2" />
      <text x="215" y="244" textAnchor="middle" fill="#6366f1" fontSize="9" fontWeight="700">64REF Relay</text>

      {/* CT secondary connections to relay */}
      <line x1="170" y1="220" x2="170" y2="225" stroke="#ef4444" strokeDasharray="2 2" strokeWidth="1" />
      <line x1="230" y1="220" x2="215" y2="225" stroke="#22d3ee" strokeDasharray="2 2" strokeWidth="1" />
      <line x1="290" y1="220" x2="280" y2="225" stroke="#60a5fa" strokeDasharray="2 2" strokeWidth="1" />

      {/* explanation */}
      <text x="250" y="305" textAnchor="middle" fill="#52525b" fontSize="9">Sum of 3 phase CTs = Neutral CT under normal conditions</text>
      <text x="250" y="318" textAnchor="middle" fill="#52525b" fontSize="8">Internal earth fault causes mismatch, REF relay operates</text>
    </svg>
  );
}

/* ── Protection Status Badge ── */
function ProtectionStatusBadge({ faultType, severity }) {
  const statusMap = {
    'Internal Winding Fault': { label: 'FAULT DETECTED', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    'External Fault': { label: 'BACKUP ACTIVE', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    Inrush: { label: 'RESTRAINT ON', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    Overload: { label: 'THERMAL ALARM', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    'Oil/Gas Fault': { label: 'BUCHHOLZ TRIP', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
  };
  const s = statusMap[faultType] || { label: 'NORMAL', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: s.bg, border: `1px solid ${s.color}`, borderRadius: 8, marginRight: 12 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block', animation: faultType === 'Internal Winding Fault' || faultType === 'Oil/Gas Fault' ? 'none' : 'none' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: '0.05em' }}>{s.label}</span>
      <span style={{ fontSize: 10, color: '#71717a' }}>Severity {severity}/10</span>
    </div>
  );
}

/* ── Theory Tab ── */
function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Transformer Protection Philosophy</h2>
      <p style={S.p}>
        Transformers need multiple protection elements because different faults manifest differently.
        Differential protection (87T) is the primary for internal electrical faults, Buchholz relay detects
        gas and oil surge in oil-filled units, overcurrent and earth-fault elements act as backup, and
        temperature devices (WTI/OTI) protect against long-duration thermal stress.
      </p>

      <h3 style={S.h3}>Buchholz Relay Location</h3>
      <p style={S.p}>
        The Buchholz relay is installed in the pipe connecting the main tank to the conservator. It has two
        elements: an alarm float that collects slow gas accumulation from minor faults, and a trip float that
        responds to the oil surge produced by severe arcing inside the tank.
      </p>
      <BuchholzDiagram />

      <h3 style={S.h3}>Differential Protection CT Connections</h3>
      <p style={S.p}>
        The biased differential relay receives current from CTs on both the HV and LV sides. Under normal
        load or external faults, the currents balance (after ratio and phase compensation) and the relay
        restrains. For an internal fault, the currents no longer balance and the differential (spill) current
        exceeds the pickup threshold, causing a high-speed trip.
      </p>
      <DifferentialCTDiagram />
      <span style={S.eq}>I_diff = |I_HV/N_HV - I_LV/N_LV| &gt; I_pickup =&gt; TRIP</span>
      <span style={S.eq}>Bias = (|I1| + |I2|) / 2, and I_diff must exceed bias slope to trip</span>

      <h3 style={S.h3}>Fault Zone Diagram</h3>
      <p style={S.p}>
        Different faults are covered by different protection functions depending on their location relative
        to the CTs. The differential zone covers faults between CT1 and CT2. Faults outside this zone are
        seen by backup overcurrent protection.
      </p>
      <FaultZoneDiagram />

      <h3 style={S.h3}>Protection Functions Summary</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Function</th>
            <th style={S.th}>ANSI Code</th>
            <th style={S.th}>Detects</th>
            <th style={S.th}>Speed</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Biased Differential', '87T', 'Internal winding faults', 'Very fast (20-40 ms)'],
            ['Buchholz Relay', '--', 'Gas evolution, oil surge from arcing', 'Fast trip, slow alarm'],
            ['Restricted Earth Fault', '64REF', 'Star winding ground faults', 'Fast (30-50 ms)'],
            ['Overcurrent', '51/51N', 'External faults, backup for internal', 'IDMT graded (0.3-1.0 s)'],
            ['WTI/OTI', '26/49', 'Sustained overload thermal stress', 'Slow (minutes to hours)'],
            ['Pressure Relief', '63', 'Tank pressure surge', 'Fast mechanical trip'],
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

      <h3 style={S.h3}>Restricted Earth Fault (REF) Protection</h3>
      <p style={S.p}>
        The REF relay (64REF) provides high-speed, sensitive protection for earth faults on star-connected
        transformer windings. It compares the sum of the three phase CT currents with the neutral CT current.
        Under external fault or load conditions, these balance. An internal earth fault within the protected
        zone creates a mismatch that trips the relay. REF is especially valuable for detecting earth faults
        near the star point, which produce low fault current and may not be detected by differential protection.
      </p>
      <REFProtectionSVG />
      <span style={S.eq}>I_REF = |(I_R + I_Y + I_B) - I_N| &gt; I_pickup =&gt; TRIP</span>
      <span style={S.eq}>Coverage: ~95% of winding from terminals, remaining 5% near neutral has low fault current</span>

      <h3 style={S.h3}>Inrush Restraint</h3>
      <p style={S.p}>
        When a transformer is energized, the magnetizing inrush current can reach 8-12 times rated current.
        This current flows only on the primary side and appears as a false differential to the relay. The
        second harmonic component of inrush current (typically 15-70% of fundamental) is used to block the
        differential trip during energization.
      </p>
      <span style={S.eq}>I_2nd / I_fundamental &gt; 15% =&gt; Harmonic restraint active =&gt; Trip blocked</span>

      <div style={S.ctx}>
        <span style={S.ctxT}>Indian Utility Practice</span>
        <p style={S.ctxP}>
          In Indian 220/132 kV and 132/33 kV substations, transformer protection commonly includes biased
          differential (87T), Buchholz relay, WTI/OTI, REF on star windings, and backup overcurrent/earth-fault
          protection. Numerical relays from ABB, Siemens, GE, and L&T are standard. CT specifications follow
          IS 2705 / IEC 61869.
        </p>
      </div>

      <h2 style={S.h2}>References</h2>
      <ul style={S.ul}>
        <li style={S.li}>Y.G. Paithankar and S.R. Bhide — <em>Fundamentals of Power System Protection</em></li>
        <li style={S.li}>J. Lewis Blackburn and Thomas J. Domin — <em>Protective Relaying: Principles and Applications</em></li>
        <li style={S.li}>CEA Technical Standards for Transformer Protection</li>
        <li style={S.li}>IEEE C57.13 — Standard Requirements for Instrument Transformers</li>
      </ul>
    </div>
  );
}

export default function TransformerProtection() {
  const [tab, setTab] = useState('simulate');
  const [faultType, setFaultType] = useState('Internal Winding Fault');
  const [severity, setSeverity] = useState(5);
  const pulse = useAnimationPulse(800);
  const events = useMemo(() => protectionResponse(faultType, severity), [faultType, severity]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>
      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' }}>
            <ProtectionStatusBadge faultType={faultType} severity={severity} />
          </div>
          <div style={S.svgWrap}>
            <SimDiagram faultType={faultType} severity={severity} pulse={pulse} events={events} />
          </div>
          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Fault Type</span>
              <select style={S.sel} value={faultType} onChange={(e) => setFaultType(e.target.value)}>
                <option>Internal Winding Fault</option>
                <option>External Fault</option>
                <option>Inrush</option>
                <option>Overload</option>
                <option>Oil/Gas Fault</option>
              </select>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Severity</span>
              <input style={S.slider} type="range" min="1" max="10" step="1" value={severity} onChange={(e) => setSeverity(Number(e.target.value))} />
              <span style={S.val}>{severity}</span>
            </div>
          </div>
          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Fault Type</span>
              <span style={{ ...S.rv, color: ZONE_COLORS[faultType] || '#e4e4e7' }}>{faultType}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Primary Response</span>
              <span style={S.rv}>{events[0]}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Severity Level</span>
              <span style={S.rv}>{severity}/10</span>
            </div>
          </div>
          <div style={{ padding: '14px 24px', background: '#0f1015', borderTop: '1px solid #1e1e2e' }}>
            <div style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Protection Sequence</div>
            {events.map((e) => (
              <div key={e} style={{ color: '#a1a1aa', fontSize: 13, lineHeight: 1.7 }}>{e}</div>
            ))}
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
