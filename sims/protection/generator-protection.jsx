import React, { useMemo, useState, useEffect } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', color: '#e4e4e7', fontFamily: 'Inter, system-ui, sans-serif' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowX: 'auto', minHeight: 380 },
  controls: { padding: '14px 24px', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center', background: '#111114', borderTop: '1px solid #1e1e2e' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 130, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 56, textAlign: 'right' },
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

function inCircle(point, center, radius) {
  return (point.r - center.r) ** 2 + (point.x - center.x) ** 2 <= radius ** 2;
}

/* Approximate capability / protection checks derived from P-Q at rated terminal voltage. */
function evaluateOperatingPoint(p, q) {
  const ppu = p / 100;
  const qpu = q / 100;
  const statorLoading = Math.hypot(ppu, qpu);
  const denom = Math.max(ppu * ppu + qpu * qpu, 0.0001);
  const impedance = {
    r: ppu / denom,
    x: qpu / denom,
  };
  const reversePower = p <= -2;
  const lofZone1 = inCircle(impedance, { r: 0.35, x: -0.55 }, 0.32);
  const lofZone2 = inCircle(impedance, { r: 0.55, x: -0.9 }, 0.58);
  const lossOfField = q < -20 && (lofZone1 || lofZone2);
  const fieldOrEndRegionHeating =
    q > 105 ||
    statorLoading > 1.08 ||
    (q < -85 && !lossOfField);
  const primeMoverLimit = p > 105;

  let zone = 'Normal';
  if (reversePower) zone = 'Reverse Power';
  else if (lossOfField) zone = 'Loss of Field';
  else if (fieldOrEndRegionHeating) zone = 'Field / end-region heating';
  else if (primeMoverLimit) zone = 'Prime Mover Limit';

  return {
    zone,
    impedance,
    statorLoading,
    reversePower,
    lossOfField,
    lofZone: lofZone1 ? 'Zone 1' : lofZone2 ? 'Zone 2' : 'Outside',
  };
}

const ZONE_COLORS = {
  Normal: '#22c55e',
  'Reverse Power': '#ef4444',
  'Loss of Field': '#f59e0b',
  'Field / end-region heating': '#a78bfa',
  'Prime Mover Limit': '#22d3ee',
};

function useAnimationPulse(interval = 900) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), interval);
    return () => clearInterval(id);
  }, [interval]);
  return pulse;
}

/* ── P-Q Capability Curve SVG for Theory ── */
function CapabilityCurveDiagram() {
  const cx = 320, cy = 200;
  const pScale = 2.2, qScale = 1.3;
  return (
    <svg viewBox="0 0 700 400" style={{ width: '100%', maxWidth: 700, height: 'auto', margin: '18px 0' }}>
      {/* axes */}
      <line x1="60" y1={cy} x2="640" y2={cy} stroke="#3f3f46" strokeWidth="1.5" />
      <line x1={cx} y1="20" x2={cx} y2="380" stroke="#3f3f46" strokeWidth="1.5" />
      <text x="645" y={cy + 5} fill="#71717a" fontSize="11">P (MW)</text>
      <text x={cx - 30} y="18" fill="#71717a" fontSize="11">+Q (MVAr)</text>
      <text x={cx - 30} y="395" fill="#71717a" fontSize="11">-Q (MVAr)</text>

      {/* stator current limit (main capability arc, upper) */}
      <path d={`M${cx},${cy} A${110 * pScale},${100 * qScale} 0 0 0 ${cx + 105 * pScale},${cy - 40 * qScale}`} fill="none" stroke="#22c55e" strokeWidth="2.5" />
      <text x={cx + 90 * pScale} y={cy - 55 * qScale} fill="#22c55e" fontSize="9" fontWeight="600">Stator current limit</text>

      {/* rotor field limit (upper right arc) */}
      <path d={`M${cx + 105 * pScale},${cy - 40 * qScale} A${80 * pScale},${60 * qScale} 0 0 0 ${cx + 90 * pScale},${cy - 90 * qScale}`} fill="none" stroke="#60a5fa" strokeWidth="2.5" />
      <text x={cx + 70 * pScale} y={cy - 95 * qScale} fill="#60a5fa" fontSize="9" fontWeight="600">Rotor field limit</text>

      {/* end region heating limit (lower right) */}
      <path d={`M${cx},${cy} A${90 * pScale},${80 * qScale} 0 0 1 ${cx + 100 * pScale},${cy + 50 * qScale}`} fill="none" stroke="#a78bfa" strokeWidth="2.5" />
      <text x={cx + 75 * pScale} y={cy + 65 * qScale} fill="#a78bfa" fontSize="9" fontWeight="600">End-region heating</text>

      {/* stability limit (lower, under-excited) */}
      <path d={`M${cx + 100 * pScale},${cy + 50 * qScale} A${60 * pScale},${40 * qScale} 0 0 1 ${cx + 40 * pScale},${cy + 90 * qScale}`} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 4" />
      <text x={cx + 20 * pScale} y={cy + 100 * qScale} fill="#f59e0b" fontSize="9" fontWeight="600">Stability limit / LOF zone</text>

      {/* prime mover limit */}
      <line x1={cx + 105 * pScale} y1={cy - 100 * qScale} x2={cx + 105 * pScale} y2={cy + 60 * qScale} stroke="#22d3ee" strokeWidth="2" strokeDasharray="5 4" />
      <text x={cx + 105 * pScale + 5} y={cy - 105 * qScale} fill="#22d3ee" fontSize="9" fontWeight="600">Turbine limit</text>

      {/* reverse power zone */}
      <rect x="70" y={cy - 60} width={cx - 80} height="120" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeDasharray="4 3" />
      <text x="170" y={cy - 40} fill="#ef4444" fontSize="10" fontWeight="600">Reverse Power Zone (32)</text>

      {/* safe operating region label */}
      <text x={cx + 40 * pScale} y={cy - 20} fill="#22c55e" fontSize="11" fontWeight="700" opacity="0.5">SAFE REGION</text>

      {/* grid lines */}
      {[25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={cx + v * pScale} y1={cy - 3} x2={cx + v * pScale} y2={cy + 3} stroke="#3f3f46" />
          <text x={cx + v * pScale} y={cy + 16} textAnchor="middle" fill="#52525b" fontSize="8">{v}</text>
        </g>
      ))}
      {[-100, -50, 50, 100].map((v) => (
        <g key={v}>
          <line x1={cx - 3} y1={cy - v * qScale} x2={cx + 3} y2={cy - v * qScale} stroke="#3f3f46" />
          <text x={cx - 16} y={cy - v * qScale + 4} textAnchor="end" fill="#52525b" fontSize="8">{v}</text>
        </g>
      ))}
    </svg>
  );
}

/* ── Generator Protection Single-Line Diagram ── */
function GeneratorSLDDiagram() {
  return (
    <svg viewBox="0 0 700 280" style={{ width: '100%', maxWidth: 700, height: 'auto', margin: '18px 0' }}>
      {/* generator symbol */}
      <circle cx="80" cy="140" r="35" fill="#101015" stroke="#22c55e" strokeWidth="2" />
      <text x="80" y="136" textAnchor="middle" fill="#22c55e" fontSize="14" fontWeight="700">G</text>
      <text x="80" y="152" textAnchor="middle" fill="#22c55e" fontSize="8">11 kV</text>

      {/* generator neutral */}
      <line x1="80" y1="175" x2="80" y2="220" stroke="#3f3f46" strokeWidth="2" />
      <line x1="65" y1="220" x2="95" y2="220" stroke="#3f3f46" strokeWidth="2" />
      <line x1="70" y1="228" x2="90" y2="228" stroke="#3f3f46" strokeWidth="1.5" />
      <line x1="75" y1="234" x2="85" y2="234" stroke="#3f3f46" strokeWidth="1" />
      <text x="105" y="225" fill="#52525b" fontSize="8">Neutral grounding</text>

      {/* stator winding zone */}
      <rect x="40" y="95" width="80" height="95" rx="8" fill="none" stroke="#22c55e" strokeDasharray="4 3" />
      <text x="80" y="88" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="600">87G Zone</text>

      {/* neutral CT for stator ground fault */}
      <circle cx="80" cy="195" r="8" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="100" y="198" fill="#f59e0b" fontSize="7">CT (64G)</text>

      {/* connection to GT */}
      <line x1="115" y1="140" x2="200" y2="140" stroke="#3f3f46" strokeWidth="4" />

      {/* generator breaker */}
      <rect x="200" y="126" width="36" height="28" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
      <line x1="208" y1="140" x2="228" y2="140" stroke="#22c55e" strokeWidth="3" />
      <text x="218" y="118" textAnchor="middle" fill="#71717a" fontSize="8">GCB</text>

      {/* CT for differential */}
      <circle cx="255" cy="140" r="10" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
      <text x="255" y="143" textAnchor="middle" fill="#60a5fa" fontSize="7">CT</text>

      {/* generator transformer */}
      <rect x="290" y="110" width="100" height="65" rx="12" fill="#101015" stroke="#3f3f46" strokeWidth="2" />
      <ellipse cx="325" cy="142" rx="16" ry="22" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
      <ellipse cx="355" cy="142" rx="16" ry="22" fill="none" stroke="#22c55e" strokeWidth="1.5" />
      <text x="340" y="102" textAnchor="middle" fill="#71717a" fontSize="9">11/220 kV GT</text>

      {/* HV side */}
      <line x1="390" y1="140" x2="480" y2="140" stroke="#3f3f46" strokeWidth="4" />

      {/* HV CT */}
      <circle cx="440" cy="140" r="10" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
      <text x="440" y="143" textAnchor="middle" fill="#60a5fa" fontSize="7">CT</text>

      {/* HV breaker */}
      <rect x="480" y="126" width="36" height="28" rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
      <line x1="488" y1="140" x2="508" y2="140" stroke="#22c55e" strokeWidth="3" />
      <text x="498" y="118" textAnchor="middle" fill="#71717a" fontSize="8">HV CB</text>

      {/* to grid */}
      <line x1="516" y1="140" x2="620" y2="140" stroke="#60a5fa" strokeWidth="5" />
      <text x="570" y="130" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">220 kV Grid</text>

      {/* protection relay boxes */}
      <rect x="130" y="210" width="80" height="28" rx="6" fill="rgba(99,102,241,0.08)" stroke="#6366f1" />
      <text x="170" y="228" textAnchor="middle" fill="#6366f1" fontSize="8" fontWeight="600">87G Diff</text>

      <rect x="230" y="210" width="80" height="28" rx="6" fill="rgba(239,68,68,0.08)" stroke="#ef4444" />
      <text x="270" y="228" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="600">32 Rev Power</text>

      <rect x="330" y="210" width="80" height="28" rx="6" fill="rgba(245,158,11,0.08)" stroke="#f59e0b" />
      <text x="370" y="228" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="600">40 LOF</text>

      <rect x="430" y="210" width="80" height="28" rx="6" fill="rgba(167,139,250,0.08)" stroke="#a78bfa" />
      <text x="470" y="228" textAnchor="middle" fill="#a78bfa" fontSize="8" fontWeight="600">59 O/V</text>

      <rect x="530" y="210" width="80" height="28" rx="6" fill="rgba(34,211,238,0.08)" stroke="#22d3ee" />
      <text x="570" y="228" textAnchor="middle" fill="#22d3ee" fontSize="8" fontWeight="600">46 Neg Seq</text>

      {/* CT secondary leads to relays */}
      <line x1="255" y1="150" x2="255" y2="224" stroke="#60a5fa" strokeDasharray="3 3" strokeWidth="1" />
      <line x1="440" y1="150" x2="440" y2="224" stroke="#60a5fa" strokeDasharray="3 3" strokeWidth="1" />

      <text x="350" y="268" textAnchor="middle" fill="#52525b" fontSize="9">All functions typically integrated in a single numerical IED (e.g., ABB REG670, Siemens 7UM62)</text>
    </svg>
  );
}

/* ── Enhanced Simulation Diagram ── */
function SimDiagram({ p, q, zone, pulse }) {
  const cx = 420, cy = 190;
  const pScale = 2.2, qScale = 1.1;
  const zoneColor = ZONE_COLORS[zone] || '#22c55e';
  const isAlarm = zone !== 'Normal';

  return (
    <svg viewBox="0 0 920 420" style={{ width: '100%', maxWidth: 920, height: 'auto' }}>
      <defs>
        <filter id="gpglow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <radialGradient id="safeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.01" />
        </radialGradient>
      </defs>

      <text x="460" y="22" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="700" letterSpacing="0.06em">
        GENERATOR CAPABILITY CURVE — P-Q DIAGRAM WITH PROTECTION ZONES
      </text>

      {/* axes */}
      <line x1="80" y1={cy} x2="850" y2={cy} stroke="#3f3f46" strokeWidth="1.5" />
      <line x1={cx} y1="35" x2={cx} y2="380" stroke="#3f3f46" strokeWidth="1.5" />
      <text x="855" y={cy + 5} fill="#71717a" fontSize="11">P</text>
      <text x={cx - 8} y="30" fill="#71717a" fontSize="11">+Q</text>
      <text x={cx - 8} y="395" fill="#71717a" fontSize="11">-Q</text>

      {/* grid lines */}
      {[-100, -50, 50, 100].map((v) => (
        <line key={`hg${v}`} x1="100" y1={cy - v * qScale} x2="830" y2={cy - v * qScale} stroke="#1e1e2e" strokeWidth="0.5" />
      ))}
      {[25, 50, 75, 100].map((v) => (
        <line key={`vg${v}`} x1={cx + v * pScale} y1="50" x2={cx + v * pScale} y2="370" stroke="#1e1e2e" strokeWidth="0.5" />
      ))}

      {/* safe operating region fill */}
      <ellipse cx={cx + 50 * pScale} cy={cy} rx={55 * pScale} ry={95 * qScale} fill="url(#safeGrad)" />

      {/* capability boundary - stator current limit (upper) */}
      <ellipse cx={cx} cy={cy} rx={55 * pScale} ry={110 * qScale} fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.4" />

      {/* rotor field heating arc (upper right) */}
      <path d={`M${cx},${cy} A${50 * pScale},${85 * qScale} 0 0 0 ${cx + 105 * pScale},${cy - 30 * qScale}`} fill="none" stroke="#60a5fa" strokeWidth="2.5" />
      <text x={cx + 90 * pScale} y={cy - 55 * qScale} fill="#60a5fa" fontSize="10" fontWeight="600">Rotor limit</text>

      {/* stator current limit arc */}
      <path d={`M${cx + 105 * pScale},${cy - 30 * qScale} A${55 * pScale},${95 * qScale} 0 0 0 ${cx},${cy - 110 * qScale}`} fill="none" stroke="#22c55e" strokeWidth="2.5" />
      <text x={cx + 30 * pScale} y={cy - 100 * qScale} fill="#22c55e" fontSize="10" fontWeight="600">Stator limit</text>

      {/* end region heating (lower right) */}
      <path d={`M${cx},${cy} A${50 * pScale},${80 * qScale} 0 0 1 ${cx + 100 * pScale},${cy + 50 * qScale}`} fill="none" stroke="#a78bfa" strokeWidth="2.5" />
      <text x={cx + 75 * pScale} y={cy + 68 * qScale} fill="#a78bfa" fontSize="10" fontWeight="600">End-region heating</text>

      {/* stability / loss of field boundary */}
      <path d={`M${cx + 100 * pScale},${cy + 50 * qScale} A${60 * pScale},${40 * qScale} 0 0 1 ${cx + 30 * pScale},${cy + 90 * qScale}`} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 4" />
      <text x={cx + 10 * pScale} y={cy + 105 * qScale} fill="#f59e0b" fontSize="10" fontWeight="600">LOF zone (40)</text>

      {/* prime mover limit */}
      <line x1={cx + 105 * pScale} y1={cy - 120 * qScale} x2={cx + 105 * pScale} y2={cy + 70 * qScale} stroke="#22d3ee" strokeWidth="2" strokeDasharray="5 4" />
      <text x={cx + 108 * pScale} y={cy - 110 * qScale} fill="#22d3ee" fontSize="9" fontWeight="600">Turbine limit</text>

      {/* reverse power zone */}
      <rect x="90" y={cy - 50} width={cx - 100} height="100" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeDasharray="4 3" />
      <text x="200" y={cy - 30} fill="#ef4444" fontSize="10" fontWeight="600">Reverse Power (32)</text>

      {/* axis labels */}
      {[25, 50, 75, 100].map((v) => (
        <text key={`xl${v}`} x={cx + v * pScale} y={cy + 16} textAnchor="middle" fill="#52525b" fontSize="8">{v}</text>
      ))}
      {[-100, -50, 50, 100].map((v) => (
        <text key={`yl${v}`} x={cx - 16} y={cy - v * qScale + 4} textAnchor="end" fill="#52525b" fontSize="8">{v}</text>
      ))}

      {/* operating point */}
      <circle cx={cx + p * pScale} cy={cy - q * qScale} r={isAlarm ? (pulse ? 10 : 8) : 7} fill={zoneColor} filter="url(#gpglow)" opacity={isAlarm ? (pulse ? 1 : 0.7) : 1} />
      <text x={cx + p * pScale + 14} y={cy - q * qScale - 10} fill={zoneColor} fontSize="10" fontWeight="700">{zone}</text>
      <text x={cx + p * pScale + 14} y={cy - q * qScale + 4} fill="#a1a1aa" fontSize="9">{p} MW, {q} MVAr</text>

      {/* crosshair at operating point */}
      <line x1={cx + p * pScale - 14} y1={cy - q * qScale} x2={cx + p * pScale + 14} y2={cy - q * qScale} stroke={zoneColor} strokeWidth="1" opacity="0.4" />
      <line x1={cx + p * pScale} y1={cy - q * qScale - 14} x2={cx + p * pScale} y2={cy - q * qScale + 14} stroke={zoneColor} strokeWidth="1" opacity="0.4" />

      {/* protection action indicator */}
      {isAlarm && (
        <g>
          <rect x="80" y="390" width={zone.length * 10 + 180} height="24" rx="6" fill="rgba(239,68,68,0.1)" stroke={zoneColor} />
          <circle cx="95" cy="402" r="5" fill={zoneColor}>
            <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
          </circle>
          <text x="108" y="407" fill={zoneColor} fontSize="10" fontWeight="600">PROTECTION ALARM: {zone.toUpperCase()} — Relay pickup active</text>
        </g>
      )}
    </svg>
  );
}

/* ── Stator Earth Fault Protection SVG ── */
function StatorEarthFaultSVG() {
  return (
    <svg viewBox="0 0 500 340" style={{ width: '100%', maxWidth: 500, height: 'auto', margin: '18px 0' }}>
      <text x="250" y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">95% Stator Earth Fault Protection (64G)</text>

      {/* generator stator winding representation */}
      <rect x="60" y="50" width="380" height="160" rx="14" fill="#101015" stroke="#3f3f46" strokeWidth="2" />
      <text x="250" y="44" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="600">Generator Stator Winding</text>

      {/* stator winding - 3 phases */}
      {['R', 'Y', 'B'].map((ph, i) => {
        const cx = 140 + i * 90;
        const color = ph === 'R' ? '#ef4444' : ph === 'Y' ? '#f59e0b' : '#60a5fa';
        return (
          <g key={ph}>
            <path d={`M${cx},75 Q${cx + 10},90 ${cx},105 Q${cx - 10},120 ${cx},135 Q${cx + 10},150 ${cx},165`} fill="none" stroke={color} strokeWidth="2.5" />
            <text x={cx} y="68" textAnchor="middle" fill={color} fontSize="10" fontWeight="700">{ph}</text>
            {/* terminal end */}
            <line x1={cx} y1="55" x2={cx} y2="75" stroke={color} strokeWidth="2" />
            <text x={cx} y="52" textAnchor="middle" fill={color} fontSize="7">Terminal</text>
          </g>
        );
      })}

      {/* star point connection */}
      <line x1="140" y1="165" x2="320" y2="165" stroke="#3f3f46" strokeWidth="2" />
      <circle cx="230" cy="165" r="3" fill="#e4e4e7" />
      <text x="345" y="168" fill="#71717a" fontSize="8">Star point</text>

      {/* neutral to ground path */}
      <line x1="230" y1="165" x2="230" y2="195" stroke="#3f3f46" strokeWidth="2" />

      {/* neutral grounding transformer (NGT) */}
      <rect x="200" y="195" width="60" height="35" rx="6" fill="#18181b" stroke="#22d3ee" strokeWidth="1.5" />
      <text x="230" y="216" textAnchor="middle" fill="#22d3ee" fontSize="8" fontWeight="600">NGT</text>

      {/* loading resistor */}
      <line x1="230" y1="230" x2="230" y2="250" stroke="#3f3f46" strokeWidth="2" />
      <rect x="215" y="250" width="30" height="14" rx="3" fill="#18181b" stroke="#f59e0b" />
      <text x="230" y="260" textAnchor="middle" fill="#f59e0b" fontSize="7">R</text>

      {/* earth */}
      <line x1="230" y1="264" x2="230" y2="278" stroke="#3f3f46" strokeWidth="2" />
      <line x1="218" y1="278" x2="242" y2="278" stroke="#3f3f46" strokeWidth="2" />
      <line x1="222" y1="283" x2="238" y2="283" stroke="#3f3f46" strokeWidth="1.5" />

      {/* voltage relay across NGT secondary */}
      <line x1="260" y1="210" x2="320" y2="210" stroke="#22d3ee" strokeDasharray="3 3" strokeWidth="1" />
      <rect x="320" y="198" width="80" height="28" rx="6" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="1.5" />
      <text x="360" y="216" textAnchor="middle" fill="#6366f1" fontSize="8" fontWeight="700">59N / 64G</text>
      <text x="360" y="240" textAnchor="middle" fill="#71717a" fontSize="8">Voltage relay</text>

      {/* fault indication */}
      <line x1="185" y1="130" x2="185" y2="210" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="175" y="128" fill="#ef4444" fontSize="8">Fault</text>
      <path d="M180,140 L190,130 M180,130 L190,140" stroke="#ef4444" strokeWidth="1.5" />

      {/* coverage annotation */}
      <rect x="60" y="295" width="380" height="35" rx="8" fill="rgba(34,211,238,0.06)" stroke="#22d3ee" strokeDasharray="4 3" />
      <text x="250" y="310" textAnchor="middle" fill="#22d3ee" fontSize="9">95% coverage from terminals (59N), remaining 5% near neutral</text>
      <text x="250" y="325" textAnchor="middle" fill="#52525b" fontSize="8">100% coverage requires 3rd harmonic injection or sub-harmonic scheme</text>
    </svg>
  );
}

/* ── Loss of Excitation R-X Diagram SVG ── */
function LossOfExcitationSVG() {
  return (
    <svg viewBox="0 0 460 400" style={{ width: '100%', maxWidth: 460, height: 'auto', margin: '18px 0' }}>
      <text x="230" y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">Loss of Excitation — R-X Characteristic (ANSI 40)</text>

      {/* R-X axes */}
      <line x1="60" y1="200" x2="400" y2="200" stroke="#3f3f46" strokeWidth="1.5" />
      <line x1="230" y1="30" x2="230" y2="380" stroke="#3f3f46" strokeWidth="1.5" />
      <text x="405" y="205" fill="#71717a" fontSize="10">+R</text>
      <text x="235" y="28" fill="#71717a" fontSize="10">+X</text>
      <text x="235" y="390" fill="#71717a" fontSize="10">-X</text>

      {/* Zone 1 mho circle (smaller, faster) */}
      <circle cx="230" cy="275" r="55" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="2" />
      <text x="305" y="290" fill="#ef4444" fontSize="9" fontWeight="600">Zone 1</text>
      <text x="305" y="303" fill="#ef4444" fontSize="8">0.1s delay</text>

      {/* Zone 2 mho circle (larger, slower) */}
      <circle cx="230" cy="290" r="90" fill="rgba(245,158,11,0.04)" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 4" />
      <text x="340" y="340" fill="#f59e0b" fontSize="9" fontWeight="600">Zone 2</text>
      <text x="340" y="353" fill="#f59e0b" fontSize="8">0.5s delay</text>

      {/* offset annotation */}
      <line x1="230" y1="200" x2="230" y2="220" stroke="#a78bfa" strokeWidth="2" />
      <text x="245" y="215" fill="#a78bfa" fontSize="8">-X'd/2 offset</text>

      {/* Xd annotation */}
      <line x1="215" y1="200" x2="215" y2="365" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3" />
      <text x="195" y="285" fill="#60a5fa" fontSize="8" transform="rotate(-90,195,285)">Xd diameter</text>

      {/* normal operating point */}
      <circle cx="260" cy="165" r="5" fill="#22c55e" />
      <text x="275" y="163" fill="#22c55e" fontSize="9" fontWeight="600">Normal</text>
      <text x="275" y="175" fill="#71717a" fontSize="8">operating point</text>

      {/* LOF trajectory */}
      <path d="M260,165 C255,180 245,210 240,250 Q238,270 235,290" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" />
      <text x="210" y="250" fill="#ef4444" fontSize="8">LOF</text>
      <text x="200" y="262" fill="#ef4444" fontSize="7">trajectory</text>
      {/* arrow on trajectory */}
      <path d="M238,280 L235,290 L242,285" fill="#ef4444" stroke="#ef4444" strokeWidth="1" />

      {/* stability limit line */}
      <line x1="130" y1="200" x2="330" y2="360" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="5 3" />
      <text x="130" y="195" fill="#22d3ee" fontSize="8">Stability limit</text>

      {/* legend */}
      <text x="230" y="395" textAnchor="middle" fill="#52525b" fontSize="9">Impedance migrates into mho circles when field current decays</text>
    </svg>
  );
}

/* ── Reverse Power Diagram SVG ── */
function ReversePowerSVG() {
  return (
    <svg viewBox="0 0 460 300" style={{ width: '100%', maxWidth: 460, height: 'auto', margin: '18px 0' }}>
      <text x="230" y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">Reverse Power Detection (ANSI 32)</text>

      {/* P-Q quadrant diagram */}
      <line x1="60" y1="150" x2="400" y2="150" stroke="#3f3f46" strokeWidth="1.5" />
      <line x1="230" y1="30" x2="230" y2="270" stroke="#3f3f46" strokeWidth="1.5" />
      <text x="405" y="155" fill="#71717a" fontSize="10">+P (gen)</text>
      <text x="55" y="145" fill="#71717a" fontSize="10">-P (motor)</text>
      <text x="235" y="28" fill="#71717a" fontSize="10">+Q</text>
      <text x="235" y="282" fill="#71717a" fontSize="10">-Q</text>

      {/* normal generating region */}
      <rect x="235" y="55" width="155" height="90" rx="8" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeDasharray="4 3" />
      <text x="312" y="95" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="600">Normal</text>
      <text x="312" y="110" textAnchor="middle" fill="#22c55e" fontSize="9">Generating</text>

      {/* reverse power (motoring) zone */}
      <rect x="65" y="55" width="160" height="190" rx="8" fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth="2" />
      <text x="145" y="100" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="700">MOTORING</text>
      <text x="145" y="115" textAnchor="middle" fill="#ef4444" fontSize="9">ZONE (32)</text>
      <text x="145" y="140" textAnchor="middle" fill="#a1a1aa" fontSize="8">P &lt; -0.5% to -2%</text>
      <text x="145" y="155" textAnchor="middle" fill="#a1a1aa" fontSize="8">of rated MW</text>

      {/* pickup threshold line */}
      <line x1="215" y1="40" x2="215" y2="260" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="208" y="38" fill="#ef4444" fontSize="8">Pickup</text>

      {/* normal operating point */}
      <circle cx="320" cy="120" r="6" fill="#22c55e" />
      <text x="340" y="120" fill="#22c55e" fontSize="9" fontWeight="600">OP (normal)</text>

      {/* motoring trajectory */}
      <path d="M320,120 C290,125 265,135 240,145 Q220,155 170,150" fill="none" stroke="#ef4444" strokeWidth="2" />
      <path d="M180,150 L170,150 L175,143" fill="#ef4444" stroke="#ef4444" strokeWidth="1" />
      <text x="260" y="135" fill="#ef4444" fontSize="8">Prime mover</text>
      <text x="260" y="146" fill="#ef4444" fontSize="7">loss trajectory</text>

      {/* timing annotation */}
      <rect x="85" y="185" width="120" height="40" rx="6" fill="rgba(245,158,11,0.08)" stroke="#f59e0b" />
      <text x="145" y="202" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="600">Time delay</text>
      <text x="145" y="216" textAnchor="middle" fill="#f59e0b" fontSize="8">5-30 seconds</text>

      <text x="230" y="290" textAnchor="middle" fill="#52525b" fontSize="9">Steam: 0.5-3% | Gas: 2-5% | Hydro: 0.2-2% of rated MW pickup</text>
    </svg>
  );
}

/* ── Generator Protection Status Badge ── */
function GenProtectionStatusBadge({ zone }) {
  const statusMap = {
    Normal: { label: 'ALL CLEAR', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    'Reverse Power': { label: 'REVERSE POWER (32)', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    'Loss of Field': { label: 'LOSS OF FIELD (40)', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    'Field / end-region heating': { label: 'END REGION HEATING', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    'Prime Mover Limit': { label: 'TURBINE LIMIT', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
  };
  const s = statusMap[zone] || statusMap.Normal;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: s.bg, border: `1px solid ${s.color}`, borderRadius: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: '0.05em' }}>{s.label}</span>
    </div>
  );
}

/* ── Theory Tab ── */
function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Generator Capability and Protection</h2>
      <p style={S.p}>
        Generators have a safe operating envelope in the P-Q plane bounded by multiple thermal, electrical,
        and mechanical limits. Outside that envelope, stator current heating, rotor field heating, end-region
        heating, stability margin, or turbine limits are exceeded. Protection functions monitor the operating
        point and trip the machine before damage occurs.
      </p>

      <h3 style={S.h3}>Generator Capability Curve (P-Q Diagram)</h3>
      <p style={S.p}>
        The capability curve shows the allowable operating region of a synchronous generator. Each boundary
        represents a different physical constraint. Protection zones are overlaid on this curve to show which
        relay function responds when the operating point crosses each limit.
      </p>
      <CapabilityCurveDiagram />
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#22c55e' }}>Stator current limit:</strong> Maximum stator current sets the upper MVA boundary. It is normally supervised by stator current and thermal functions, not by a simple feeder-style 50/51 alone.</li>
        <li style={S.li}><strong style={{ color: '#60a5fa' }}>Rotor field limit:</strong> Maximum field current sets the over-excited reactive power boundary.</li>
        <li style={S.li}><strong style={{ color: '#a78bfa' }}>End-region heating:</strong> Under-excited operation causes flux to enter end regions of stator core.</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>Stability / LOF:</strong> Loss of field (40) relay detects when excitation is lost and machine approaches instability.</li>
        <li style={S.li}><strong style={{ color: '#ef4444' }}>Reverse power (32):</strong> Detects motoring condition when prime mover fails.</li>
        <li style={S.li}><strong style={{ color: '#22d3ee' }}>Turbine limit:</strong> Maximum active power limited by the prime mover rating.</li>
      </ul>

      <h3 style={S.h3}>Generator Protection Scheme — Single-Line Diagram</h3>
      <p style={S.p}>
        A typical generator protection scheme includes differential protection (87G) as the primary for
        internal stator faults, plus multiple ancillary functions for abnormal operating conditions. Modern
        numerical relays integrate all functions in a single IED.
      </p>
      <GeneratorSLDDiagram />

      <h3 style={S.h3}>Key Protection Functions</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Function</th>
            <th style={S.th}>ANSI</th>
            <th style={S.th}>Detects</th>
            <th style={S.th}>Typical Setting</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Differential', '87G', 'Internal stator faults', '10-30% of rated, high-speed'],
            ['Reverse Power', '32', 'Motoring (prime mover failure)', '1-5% of rated MW, 5-30s delay'],
            ['Loss of Field', '40', 'Loss of excitation', 'Mho circle offset by -Xd/2'],
            ['Over-voltage', '59', 'Excessive terminal voltage', '110-120% of rated, IDMT or definite time'],
            ['Negative Sequence', '46', 'Unbalanced loading / open phase', 'I2 > 5-10% rated, I2^2.t limit'],
            ['Stator Earth Fault', '64G', 'Ground fault in stator winding', '95% coverage with 5% V0 setting'],
            ['Out-of-Step', '78', 'Loss of synchronism', 'Double-blinder or single-blinder scheme'],
            ['Under/Over Frequency', '81', 'Abnormal system frequency', '47.5/51.5 Hz (Indian grid)'],
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

      <span style={S.eq}>Loss-of-field relay: Mho circle diameter = X_d, offset = -X'd/2 on R-X diagram</span>
      <span style={S.eq}>Reverse power pickup: P &lt; -0.5% to -2% of rated (motoring threshold)</span>

      <h3 style={S.h3}>Stator Earth Fault Protection (64G)</h3>
      <p style={S.p}>
        Stator earth fault protection detects ground faults on the stator winding. The conventional 59N
        scheme measures neutral displacement voltage through a grounding transformer and covers approximately
        95% of the winding from the line terminals. Faults near the neutral point produce very low voltage
        and may not be detected. For 100% stator earth fault coverage, a 3rd harmonic voltage scheme or
        low-frequency injection scheme is used in addition.
      </p>
      <StatorEarthFaultSVG />

      <h3 style={S.h3}>Loss of Excitation — R-X Characteristic (40)</h3>
      <p style={S.p}>
        When a generator loses its field excitation, it draws reactive power from the system and operates as
        an induction generator. The apparent impedance seen at the generator terminals migrates from the normal
        operating region into the negative-X region of the R-X diagram, entering the mho relay characteristic
        circles. Two zones are typically used: Zone 1 (smaller circle, fast trip for complete loss of field)
        and Zone 2 (larger circle, slower trip for partial loss or slow decay).
      </p>
      <LossOfExcitationSVG />

      <h3 style={S.h3}>Reverse Power Protection (32)</h3>
      <p style={S.p}>
        When the prime mover (steam, gas, or hydro turbine) trips or loses its energy input, the generator
        begins to absorb active power from the system and acts as a synchronous motor. This condition is
        called motoring. The reverse power relay (32) detects the reversal of active power flow. The pickup
        setting is very sensitive (0.5-5% of rated MW) and a time delay of 5-30 seconds is used to avoid
        operation during power swings.
      </p>
      <ReversePowerSVG />

      <div style={S.ctx}>
        <span style={S.ctxT}>Indian Utility Practice</span>
        <p style={S.ctxP}>
          Large Indian generators (210/500/660 MW) use integrated numerical protection packages such as
          ABB REG670 or Siemens 7UM62, combining differential, loss-of-excitation, reverse power, frequency,
          voltage, negative sequence, and stator earth-fault functions. Protection settings are coordinated
          with the generator capability curve and IEGC requirements.
        </p>
      </div>

      <h2 style={S.h2}>References</h2>
      <ul style={S.ul}>
        <li style={S.li}>IEEE C37.102 — Guide for AC Generator Protection</li>
        <li style={S.li}>J. Lewis Blackburn — <em>Protective Relaying: Principles and Applications</em></li>
        <li style={S.li}>GE Publication GER-3539 — Generator Protection</li>
        <li style={S.li}>CEA Technical Standards for Generator Protection in India</li>
      </ul>
    </div>
  );
}

export default function GeneratorProtection() {
  const [tab, setTab] = useState('simulate');
  const [p, setP] = useState(80);
  const [q, setQ] = useState(20);
  const pulse = useAnimationPulse(800);
  const operatingPoint = useMemo(() => evaluateOperatingPoint(p, q), [p, q]);
  const zone = operatingPoint.zone;

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>
      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' }}>
            <GenProtectionStatusBadge zone={zone} />
          </div>
          <div style={S.svgWrap}>
            <SimDiagram p={p} q={q} zone={zone} pulse={pulse} />
          </div>
          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Active power</span>
              <input style={S.slider} type="range" min="-20" max="110" step="1" value={p} onChange={(e) => setP(Number(e.target.value))} />
              <span style={S.val}>{p.toFixed(0)} MW</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Reactive power</span>
              <input style={S.slider} type="range" min="-140" max="140" step="1" value={q} onChange={(e) => setQ(Number(e.target.value))} />
              <span style={S.val}>{q.toFixed(0)} MVAr</span>
            </div>
          </div>
          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Protection zone</span>
              <span style={{ ...S.rv, color: ZONE_COLORS[zone] || '#22c55e' }}>{zone}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Operating point</span>
              <span style={S.rv}>{p.toFixed(0)} MW, {q.toFixed(0)} MVAr</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Apparent power</span>
              <span style={S.rv}>{Math.sqrt(p * p + q * q).toFixed(1)} MVA</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Power factor</span>
              <span style={S.rv}>{(Math.abs(p) / Math.max(Math.sqrt(p * p + q * q), 0.1)).toFixed(3)} {q >= 0 ? 'lag' : 'lead'}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>R-X proxy</span>
              <span style={S.rv}>{operatingPoint.impedance.r.toFixed(2)} + j{operatingPoint.impedance.x.toFixed(2)} pu</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>40 status</span>
              <span style={{ ...S.rv, color: operatingPoint.lossOfField ? '#f59e0b' : '#71717a' }}>
                {operatingPoint.lossOfField ? operatingPoint.lofZone : 'Outside 40 circle'}
              </span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Stator loading</span>
              <span style={S.rv}>{(operatingPoint.statorLoading * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
