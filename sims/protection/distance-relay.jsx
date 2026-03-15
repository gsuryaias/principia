import React, { useMemo, useState } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', color: '#e4e4e7', fontFamily: 'Inter, system-ui, sans-serif' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', cursor: 'pointer', fontSize: 14, fontWeight: 500 }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowX: 'auto', minHeight: 340 },
  controls: { padding: '14px 24px', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center', background: '#111114', borderTop: '1px solid #1e1e2e' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 12, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 126, accentColor: '#6366f1' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 60, textAlign: 'right' },
  sel: { padding: '6px 10px', borderRadius: 8, background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' },
  results: { display: 'flex', gap: 26, flexWrap: 'wrap', padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' },
  rl: { fontSize: 11, textTransform: 'uppercase', color: '#52525b', fontWeight: 700, letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontFamily: 'monospace', fontWeight: 700 },
  strip: { display: 'flex', gap: 12, padding: '12px 24px', background: '#0f0f12', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  box: { flex: '1 1 220px', padding: '12px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 10 },
  boxT: { display: 'block', fontSize: 10, color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 },
  boxV: { display: 'block', fontSize: 13, color: '#c4b5fd', fontFamily: 'monospace', lineHeight: 1.6 },
  theory: { flex: 1, padding: '32px 24px', maxWidth: 900, margin: '0 auto', width: '100%', overflowY: 'auto' },
  h2: { fontSize: 22, fontWeight: 700, color: '#f4f4f5', margin: '36px 0 14px', paddingBottom: 8, borderBottom: '1px solid #27272a' },
  h3: { fontSize: 17, fontWeight: 600, color: '#e4e4e7', margin: '24px 0 10px' },
  p: { fontSize: 15, lineHeight: 1.8, color: '#a1a1aa', margin: '0 0 14px' },
  eq: { display: 'block', padding: '14px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, color: '#c4b5fd', fontFamily: 'monospace', margin: '16px 0', textAlign: 'center' },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { display: 'block', fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14 },
  ctxP: { margin: 0, fontSize: 14, lineHeight: 1.7, color: '#a1a1aa' },
  tbl: { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #3f3f46', color: '#d4d4d8', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #27272a', color: '#a1a1aa' },
  svgDiag: { width: '100%', margin: '20px 0', borderRadius: 12, overflow: 'hidden' },
  tooltip: {
    position: 'absolute',
    background: '#27272a',
    border: '1px solid #3f3f46',
    borderRadius: 8,
    padding: '8px 12px',
    zIndex: 100,
    pointerEvents: 'none',
    maxWidth: 320,
    fontSize: 12,
    color: '#d4d4d8',
    fontFamily: 'monospace',
    lineHeight: 1.5,
    bottom: '100%',
    left: 0,
    marginBottom: 4,
    whiteSpace: 'pre-wrap',
  },
  checkbox: { display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#a1a1aa' },
  warningBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid #ef4444',
    borderRadius: 6,
    color: '#ef4444',
    fontSize: 11,
    fontWeight: 600,
  },
};

const Z_POS_KM = { r: 0.03, x: 0.32 };
const ZONES = [
  { key: 'z3', label: 'Zone 3', color: '#f59e0b' },
  { key: 'z2', label: 'Zone 2', color: '#22c55e' },
  { key: 'z1', label: 'Zone 1', color: '#3b82f6' },
];
const FAULT_MULT = { '3-Phase': 0.5, LL: 0.8, LG: 1.0, LLG: 0.9 };

/* Reusable Tooltip component */
function Tooltip({ visible, children }) {
  if (!visible) return null;
  return <div style={S.tooltip}>{children}</div>;
}

/* Hoverable wrapper for tooltip triggers */
function WithTooltip({ tip, children }) {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', gap: 2, cursor: 'help' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <Tooltip visible={show}>{tip}</Tooltip>
    </div>
  );
}

/* Hoverable label with tooltip for sliders */
function LabelWithTip({ text, tip }) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ ...S.label, position: 'relative', cursor: 'help', borderBottom: '1px dotted #52525b' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {text}
      <Tooltip visible={show}>{tip}</Tooltip>
    </span>
  );
}

function mag(v) {
  return Math.hypot(v.r, v.x);
}

function rotate(point, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { along: point.r * c + point.x * s, cross: -point.r * s + point.x * c };
}

function inMho(point, reach) {
  const cx = reach.r / 2;
  const cy = reach.x / 2;
  const radius = mag(reach) / 2;
  return (point.r - cx) ** 2 + (point.x - cy) ** 2 <= radius ** 2;
}

function inQuadrilateral(point, reach, lineAngle, resistiveReach) {
  const local = rotate(point, lineAngle);
  const reachLocal = rotate(reach, lineAngle);
  return local.along >= 0 && local.along <= reachLocal.along && Math.abs(local.cross) <= resistiveReach;
}

function inLens(point, reach, lineAngle, resistiveReach) {
  const local = rotate(point, lineAngle);
  const reachLocal = rotate(reach, lineAngle);
  const a = Math.max(reachLocal.along / 2, 0.1);
  const b = Math.max(resistiveReach * 0.85, 0.1);
  const dx = local.along - a;
  return local.along >= 0 && local.along <= reachLocal.along && (dx * dx) / (a * a) + (local.cross * local.cross) / (b * b) <= 1;
}

function zoneResult({ characteristic, shiftedFault, reaches, lineAngle, swing }) {
  if (swing) return { zone: 'Blocked', decision: 'Power swing blocking', time: 'Blocked', zoneKey: null };
  for (const zone of ZONES) {
    const reach = reaches[zone.key];
    const reachMag = mag(reach);
    const resistiveReach = reachMag * (zone.key === 'z1' ? 0.16 : zone.key === 'z2' ? 0.2 : 0.26);
    const inside =
      characteristic === 'Mho'
        ? inMho(shiftedFault, reach)
        : characteristic === 'Quadrilateral'
          ? inQuadrilateral(shiftedFault, reach, lineAngle, resistiveReach)
          : inLens(shiftedFault, reach, lineAngle, resistiveReach);
    if (inside) {
      return {
        zone: zone.label,
        decision: 'Trip',
        time: zone.key === 'z1' ? '40 ms' : zone.key === 'z2' ? '350 ms' : '800 ms',
        zoneKey: zone.key,
      };
    }
  }
  return { zone: 'Out of reach', decision: 'Restrain', time: 'No trip', zoneKey: null };
}

function computeState({ lineKm, nextKm, faultPct, faultType, arcR, characteristic, swing, sourceZ }) {
  const lineZ = { r: Z_POS_KM.r * lineKm, x: Z_POS_KM.x * lineKm };
  const nextZ = { r: Z_POS_KM.r * nextKm, x: Z_POS_KM.x * nextKm };
  const reaches = {
    z1: { r: 0.8 * lineZ.r, x: 0.8 * lineZ.x },
    z2: { r: lineZ.r + 0.5 * nextZ.r, x: lineZ.x + 0.5 * nextZ.x },
    z3: { r: lineZ.r + nextZ.r, x: lineZ.x + nextZ.x },
  };
  const lineAngle = Math.atan2(lineZ.x, lineZ.r);
  const k = faultPct / 100;
  const baseFault = { r: lineZ.r * k, x: lineZ.x * k };
  const shiftedFault = { r: baseFault.r + arcR * FAULT_MULT[faultType], x: baseFault.x };
  const result = zoneResult({ characteristic, shiftedFault, reaches, lineAngle, swing });

  // Fault current: Ifault = Vsource / |Zs + Zfault|
  const Vsource = 220000 / Math.sqrt(3); // Phase voltage for 220 kV system
  const ZtotalR = sourceZ + shiftedFault.r;
  const ZtotalX = shiftedFault.x;
  const ZtotalMag = Math.hypot(ZtotalR, ZtotalX);
  const faultCurrent = ZtotalMag > 0 ? Vsource / ZtotalMag : 0;

  // SIR
  const lineMag = mag(lineZ);
  const sir = lineMag > 0 ? sourceZ / lineMag : 0;

  return {
    lineZ,
    nextZ,
    reaches,
    lineAngle,
    baseFault,
    shiftedFault,
    result,
    apparentMag: mag(shiftedFault),
    reach1Pct: mag(reaches.z1) / mag(lineZ) * 100,
    zFaultPct: faultPct,
    sourceZ,
    sir,
    faultCurrent,
  };
}

function zoneShape(characteristic, reach, angle, scale, origin) {
  const x = (v) => origin.x + v.r * scale;
  const y = (v) => origin.y - v.x * scale;
  const reachMag = mag(reach);
  const localReach = rotate(reach, angle).along;
  const resistiveReach = reachMag * 0.2;
  if (characteristic === 'Mho') {
    const center = { r: reach.r / 2, x: reach.x / 2 };
    return <circle cx={x(center)} cy={y(center)} r={(reachMag / 2) * scale} fill="none" />;
  }
  if (characteristic === 'Quadrilateral') {
    const w = reachMag * 0.2;
    const pts = [
      { along: 0, cross: -w },
      { along: localReach, cross: -w },
      { along: localReach, cross: w },
      { along: 0, cross: w },
    ].map((p) => {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return { r: p.along * c - p.cross * s, x: p.along * s + p.cross * c };
    });
    return <path d={pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p)},${y(p)}`).join(' ') + ' Z'} fill="none" />;
  }
  const a = localReach / 2;
  const b = resistiveReach * 0.85;
  const pts = Array.from({ length: 60 }, (_, i) => {
    const t = (i / 59) * Math.PI * 2;
    const along = a + a * Math.cos(t);
    const cross = b * Math.sin(t);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { r: along * c - cross * s, x: along * s + cross * c };
  });
  return <path d={pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p)},${y(p)}`).join(' ') + ' Z'} fill="none" />;
}

/* SVG: R-X Diagram showing Mho, Impedance Circle, and Quadrilateral */
function RXCharacteristicsSVG() {
  const W = 700, H = 360;
  const cx = 200, cy = 220, sc = 5;
  const lineAngle = Math.atan2(32, 3);
  const zReach = { r: 3, x: 32 };
  const mhoR = mag(zReach) / 2;
  // Mho circle
  const mhoCx = cx + (zReach.r / 2) * sc;
  const mhoCy = cy - (zReach.x / 2) * sc;
  // Impedance circle (non-directional, centred at origin)
  const impR = mag(zReach) * sc / 2;
  // Quadrilateral
  const localReach = rotate(zReach, lineAngle).along;
  const rReach = mag(zReach) * 0.25;
  const quadPts = [
    { along: 0, cross: -rReach },
    { along: localReach, cross: -rReach },
    { along: localReach, cross: rReach },
    { along: 0, cross: rReach },
  ].map((p) => {
    const c = Math.cos(lineAngle);
    const s = Math.sin(lineAngle);
    return { r: p.along * c - p.cross * s, x: p.along * s + p.cross * c };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={S.svgDiag}>
      <rect width={W} height={H} fill="#09090b" />
      <text x={W / 2} y="22" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">DISTANCE RELAY CHARACTERISTICS ON R-X PLANE</text>
      {/* Axes */}
      <line x1="60" y1={cy} x2="400" y2={cy} stroke="#3f3f46" strokeWidth="1" />
      <line x1={cx} y1="40" x2={cx} y2="320" stroke="#3f3f46" strokeWidth="1" />
      <text x="402" y={cy + 14} fill="#71717a" fontSize="10">R</text>
      <text x={cx - 14} y="44" fill="#71717a" fontSize="10">X</text>
      {/* Impedance circle (centred at origin) */}
      <circle cx={cx} cy={cy} r={impR} fill="none" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="6 4" />
      {/* Mho circle (passes through origin, directional) */}
      <circle cx={mhoCx} cy={mhoCy} r={mhoR * sc} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="2.5" />
      {/* Quadrilateral */}
      <path d={quadPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${cx + p.r * sc},${cy - p.x * sc}`).join(' ') + ' Z'} fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="2" />
      {/* Line impedance vector */}
      <line x1={cx} y1={cy} x2={cx + zReach.r * sc} y2={cy - zReach.x * sc} stroke="#a78bfa" strokeWidth="2" />
      <text x={cx + zReach.r * sc + 8} y={cy - zReach.x * sc} fill="#a78bfa" fontSize="10">ZL</text>
      {/* Legend */}
      <g transform="translate(430,50)">
        <rect width="240" height="120" rx="10" fill="#18181b" stroke="#27272a" />
        <text x="14" y="22" fill="#818cf8" fontSize="10" fontWeight="700">CHARACTERISTIC TYPES</text>
        <line x1="14" y1="40" x2="40" y2="40" stroke="#6366f1" strokeWidth="2.5" />
        <text x="48" y="44" fill="#6366f1" fontSize="10">Mho (directional, inherent)</text>
        <line x1="14" y1="60" x2="40" y2="60" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="6 4" />
        <text x="48" y="64" fill="#ef4444" fontSize="10">Plain impedance (non-directional)</text>
        <line x1="14" y1="80" x2="40" y2="80" stroke="#22c55e" strokeWidth="2" />
        <text x="48" y="84" fill="#22c55e" fontSize="10">Quadrilateral (adjustable R and X)</text>
        <line x1="14" y1="100" x2="40" y2="100" stroke="#a78bfa" strokeWidth="2" />
        <text x="48" y="104" fill="#a78bfa" fontSize="10">Line impedance vector ZL</text>
      </g>
      {/* Direction arrow at origin */}
      <path d="M200,220 L204,202" stroke="#71717a" strokeWidth="1" markerEnd="url(#arrDR)" />
      <text x={cx + 12} y={cy - 10} fill="#71717a" fontSize="8">Forward</text>
      <defs>
        <marker id="arrDR" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="none" stroke="#71717a" strokeWidth="1" /></marker>
      </defs>
    </svg>
  );
}

/* SVG: Zone 1/2/3 Reach on Single-Line Diagram */
function ZoneReachSVG() {
  return (
    <svg viewBox="0 0 700 220" style={S.svgDiag}>
      <rect width="700" height="220" fill="#09090b" />
      <text x="350" y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">ZONE REACH ON SINGLE-LINE DIAGRAM</text>
      {/* Buses */}
      <line x1="80" y1="60" x2="80" y2="120" stroke="#e4e4e7" strokeWidth="4" />
      <text x="80" y="50" textAnchor="middle" fill="#e4e4e7" fontSize="10" fontWeight="600">Bus A</text>
      <line x1="380" y1="60" x2="380" y2="120" stroke="#e4e4e7" strokeWidth="4" />
      <text x="380" y="50" textAnchor="middle" fill="#e4e4e7" fontSize="10" fontWeight="600">Bus B</text>
      <line x1="620" y1="60" x2="620" y2="120" stroke="#e4e4e7" strokeWidth="4" />
      <text x="620" y="50" textAnchor="middle" fill="#e4e4e7" fontSize="10" fontWeight="600">Bus C</text>
      {/* Protected line */}
      <line x1="80" y1="90" x2="380" y2="90" stroke="#a78bfa" strokeWidth="3" />
      <text x="230" y="82" textAnchor="middle" fill="#a78bfa" fontSize="10">Protected Line (ZL)</text>
      {/* Next line */}
      <line x1="380" y1="90" x2="620" y2="90" stroke="#6366f1" strokeWidth="2" strokeDasharray="6 4" />
      <text x="500" y="82" textAnchor="middle" fill="#6366f1" fontSize="10">Next Line (ZN)</text>
      {/* Relay at Bus A */}
      <rect x="88" y="94" width="30" height="20" rx="4" fill="#18181b" stroke="#3b82f6" strokeWidth="2" />
      <text x="103" y="108" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="700">21</text>
      {/* Zone reaches */}
      {/* Zone 1 = 80% of line */}
      <line x1="88" y1="130" x2={88 + 0.8 * 292} y2="130" stroke="#3b82f6" strokeWidth="3" />
      <circle cx={88 + 0.8 * 292} cy="130" r="3" fill="#3b82f6" />
      <text x={88 + 0.8 * 292 / 2} y="146" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="600">Zone 1 (80% ZL) -- Instantaneous</text>
      {/* Zone 2 */}
      <line x1="88" y1="160" x2={88 + 292 + 0.5 * 240} y2="160" stroke="#22c55e" strokeWidth="2.5" />
      <circle cx={88 + 292 + 0.5 * 240} cy="160" r="3" fill="#22c55e" />
      <text x={88 + (292 + 0.5 * 240) / 2} y="176" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="600">Zone 2 (ZL + 50% ZN) -- 0.3-0.5 s</text>
      {/* Zone 3 */}
      <line x1="88" y1="190" x2={88 + 292 + 240} y2="190" stroke="#f59e0b" strokeWidth="2" />
      <circle cx={88 + 292 + 240} cy="190" r="3" fill="#f59e0b" />
      <text x={88 + (292 + 240) / 2} y="206" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="600">Zone 3 (ZL + ZN) -- 0.6-1.0 s backup</text>
    </svg>
  );
}

/* SVG: Relay VT and CT Connection */
function RelayConnectionSVG() {
  return (
    <svg viewBox="0 0 700 200" style={S.svgDiag}>
      <rect width="700" height="200" fill="#09090b" />
      <text x="350" y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">DISTANCE RELAY -- VT AND CT INPUTS</text>
      {/* Line */}
      <line x1="50" y1="90" x2="500" y2="90" stroke="#e4e4e7" strokeWidth="3" />
      {/* CT */}
      <circle cx="180" cy="90" r="14" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="180" cy="90" r="10" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="180" y="70" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="600">CT</text>
      {/* VT connection */}
      <line x1="260" y1="90" x2="260" y2="130" stroke="#60a5fa" strokeWidth="1.5" />
      <circle cx="260" cy="140" r="10" fill="none" stroke="#60a5fa" strokeWidth="2" />
      <circle cx="260" cy="140" r="7" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
      <text x="260" y="164" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">VT</text>
      {/* Secondary wiring to relay */}
      <line x1="180" y1="104" x2="180" y2="160" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="180" y1="160" x2="380" y2="160" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="260" y1="150" x2="260" y2="170" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="260" y1="170" x2="380" y2="170" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Distance Relay */}
      <rect x="380" y="140" width="120" height="46" rx="10" fill="#18181b" stroke="#6366f1" strokeWidth="2" />
      <text x="440" y="160" textAnchor="middle" fill="#6366f1" fontSize="11" fontWeight="700">21 Distance</text>
      <text x="440" y="176" textAnchor="middle" fill="#818cf8" fontSize="9">Relay</text>
      {/* Labels for inputs */}
      <text x="340" y="156" textAnchor="end" fill="#f59e0b" fontSize="9">I (from CT)</text>
      <text x="340" y="174" textAnchor="end" fill="#60a5fa" fontSize="9">V (from VT)</text>
      {/* Zapp = V/I */}
      <g transform="translate(530,140)">
        <rect width="130" height="46" rx="8" fill="#18181b" stroke="#27272a" />
        <text x="65" y="20" textAnchor="middle" fill="#c4b5fd" fontSize="11" fontWeight="600">Zapp = V / I</text>
        <text x="65" y="36" textAnchor="middle" fill="#71717a" fontSize="9">Measured impedance</text>
      </g>
      {/* CB */}
      <rect x="100" y="78" width="40" height="24" rx="4" fill="#18181b" stroke="#ef4444" strokeWidth="1.5" />
      <text x="120" y="94" textAnchor="middle" fill="#ef4444" fontSize="10">CB</text>
      {/* Trip */}
      <line x1="440" y1="140" x2="440" y2="50" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="440" y1="50" x2="120" y2="50" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="120" y1="50" x2="120" y2="78" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
      <text x="280" y="44" textAnchor="middle" fill="#ef4444" fontSize="9">Trip command</text>
    </svg>
  );
}

function Diagram({ state, characteristic, swing, showLoadEncroachment, loadMVA }) {
  const W = 1000;
  const H = 470;
  const origin = { x: 110, y: 360 };
  const maxR = state.reaches.z3.r + 10;
  const maxX = state.reaches.z3.x + 10;
  const scale = Math.min(700 / Math.max(maxR, 1), 300 / Math.max(maxX, 1));
  const x = (v) => origin.x + v.r * scale;
  const y = (v) => origin.y - v.x * scale;
  const resultColor = state.result.decision === 'Trip' ? '#ef4444' : '#a1a1aa';
  const swingPath = [
    { r: state.reaches.z3.r * 0.9, x: state.reaches.z3.x * 0.15 },
    { r: state.reaches.z2.r * 0.8, x: state.reaches.z2.x * 0.45 },
    { r: state.reaches.z1.r * 0.7, x: state.reaches.z1.x * 0.8 },
    { r: state.reaches.z3.r * 0.55, x: state.reaches.z3.x * 0.55 },
  ];

  // Relay status
  const isTrip = state.result.decision === 'Trip';
  const statusColor = isTrip ? '#ef4444' : swing ? '#f59e0b' : '#22c55e';
  const statusText = isTrip ? 'TRIPPED' : swing ? 'BLOCKED' : 'RESTRAIN';

  // Load encroachment
  const V_kV = 220;
  const Zload = (V_kV * V_kV) / loadMVA; // ohms
  const loadBandR = Zload * 0.15; // variation band radius

  // Check zone 3 overlap with load region
  const z3mag = mag(state.reaches.z3);
  const loadEncroachmentRisk = showLoadEncroachment && (Zload - loadBandR) < z3mag;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <rect x="0" y="0" width={W} height={H} fill="#09090b" />
      <text x={W / 2} y="24" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="700" letterSpacing="0.08em">
        DISTANCE RELAY R-X PLANE WITH TRANSMISSION-LINE ZONES
      </text>

      {Array.from({ length: Math.ceil(maxR / 5) + 1 }, (_, i) => i * 5).map((r) => (
        <g key={`r${r}`}>
          <line x1={x({ r, x: 0 })} y1={y({ r, x: 0 })} x2={x({ r, x: maxX })} y2={y({ r, x: maxX })} stroke="#18181b" />
          <text x={x({ r, x: 0 })} y={origin.y + 16} textAnchor="middle" fill="#52525b" fontSize="9">{r}</text>
        </g>
      ))}
      {Array.from({ length: Math.ceil(maxX / 10) + 1 }, (_, i) => i * 10).map((xv) => (
        <g key={`x${xv}`}>
          <line x1={origin.x} y1={y({ r: 0, x: xv })} x2={x({ r: maxR, x: xv })} y2={y({ r: maxR, x: xv })} stroke="#18181b" />
          <text x={origin.x - 8} y={y({ r: 0, x: xv }) + 4} textAnchor="end" fill="#52525b" fontSize="9">{xv}</text>
        </g>
      ))}

      <line x1={origin.x} y1={40} x2={origin.x} y2={origin.y} stroke="#3f3f46" strokeWidth="1.5" />
      <line x1={origin.x} y1={origin.y} x2={900} y2={origin.y} stroke="#3f3f46" strokeWidth="1.5" />
      <text x="902" y={origin.y + 18} fill="#71717a" fontSize="10">R (ohm)</text>
      <text x="76" y="44" fill="#71717a" fontSize="10">X (ohm)</text>

      {/* Load encroachment circle */}
      {showLoadEncroachment && (
        <>
          <circle
            cx={x({ r: Zload, x: 0 })}
            cy={y({ r: 0, x: 0 })}
            r={loadBandR * scale}
            fill="rgba(113,113,122,0.08)"
            stroke="#71717a"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <text
            x={x({ r: Zload, x: 0 })}
            y={y({ r: 0, x: 0 }) + loadBandR * scale + 14}
            textAnchor="middle"
            fill="#71717a"
            fontSize="9"
            fontWeight="600"
          >Load region</text>
        </>
      )}

      {ZONES.map((zone) => {
        const color = zone.color;
        const shape = zoneShape(characteristic, state.reaches[zone.key], state.lineAngle, scale, origin);
        return React.cloneElement(shape, {
          key: zone.key,
          stroke: color,
          strokeWidth: state.result.zoneKey === zone.key ? 3 : 2,
          fill: `${color}18`,
        });
      })}

      {/* Zone labels inside the shapes */}
      {ZONES.map((zone) => {
        const reach = state.reaches[zone.key];
        const labelPos = { r: reach.r * 0.5, x: reach.x * 0.5 };
        const timeLabel = zone.key === 'z1' ? '~40ms' : zone.key === 'z2' ? '~350ms' : '~800ms';
        return (
          <g key={`label-${zone.key}`}>
            <text x={x(labelPos) + (zone.key === 'z3' ? 20 : zone.key === 'z2' ? 10 : 0)} y={y(labelPos)} fill={zone.color} fontSize="9" fontWeight="600" opacity="0.8">{zone.label}</text>
            <text x={x(labelPos) + (zone.key === 'z3' ? 20 : zone.key === 'z2' ? 10 : 0)} y={y(labelPos) + 12} fill={zone.color} fontSize="8" opacity="0.6">{timeLabel}</text>
          </g>
        );
      })}

      {/* Zone reach impedance annotations near tip of each zone */}
      {ZONES.map((zone) => {
        const reach = state.reaches[zone.key];
        const reachMag = mag(reach);
        const tipPos = { r: reach.r * 0.92, x: reach.x * 0.92 };
        const zoneLabel = zone.key === 'z1' ? 'Z1' : zone.key === 'z2' ? 'Z2' : 'Z3';
        const offset = zone.key === 'z3' ? 30 : zone.key === 'z2' ? 18 : 6;
        return (
          <text
            key={`zval-${zone.key}`}
            x={x(tipPos) + offset}
            y={y(tipPos) - 4}
            fill={zone.color}
            fontSize="9"
            fontWeight="700"
            opacity="0.9"
          >
            {zoneLabel}: {reachMag.toFixed(1)} ohm
          </text>
        );
      })}

      <line x1={origin.x} y1={origin.y} x2={x(state.lineZ)} y2={y(state.lineZ)} stroke="#a78bfa" strokeWidth="3" />
      <text x={x(state.lineZ) + 10} y={y(state.lineZ) - 6} fill="#a78bfa" fontSize="10">Protected line ZL</text>
      <line x1={x(state.lineZ)} y1={y(state.lineZ)} x2={x({ r: state.lineZ.r + state.nextZ.r, x: state.lineZ.x + state.nextZ.x })} y2={y({ r: state.lineZ.r + state.nextZ.r, x: state.lineZ.x + state.nextZ.x })} stroke="#6366f1" strokeDasharray="5 5" strokeWidth="2" />
      <text x={x({ r: state.lineZ.r + state.nextZ.r, x: state.lineZ.x + state.nextZ.x }) + 8} y={y({ r: state.lineZ.r + state.nextZ.r, x: state.lineZ.x + state.nextZ.x }) + 4} fill="#6366f1" fontSize="10">Next line extension</text>

      <circle cx={x(state.baseFault)} cy={y(state.baseFault)} r="5" fill="#60a5fa" />
      <text x={x(state.baseFault) + 8} y={y(state.baseFault) - 10} fill="#60a5fa" fontSize="10">Without arc</text>

      {state.shiftedFault.r !== state.baseFault.r && (
        <>
          <line x1={x(state.baseFault)} y1={y(state.baseFault)} x2={x(state.shiftedFault)} y2={y(state.shiftedFault)} stroke="#f59e0b" strokeDasharray="4 3" />
          {/* Animated arc resistance shift */}
          <circle r="3" fill="#f59e0b" opacity="0.7">
            <animateMotion dur="1.5s" repeatCount="indefinite" path={`M${x(state.baseFault)},${y(state.baseFault)} L${x(state.shiftedFault)},${y(state.shiftedFault)}`} />
          </circle>
        </>
      )}
      <circle cx={x(state.shiftedFault)} cy={y(state.shiftedFault)} r="7" fill={resultColor} stroke="#fff" strokeWidth="1.5" />
      {isTrip && (
        <circle cx={x(state.shiftedFault)} cy={y(state.shiftedFault)} r="11" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.5">
          <animate attributeName="r" values="11;16;11" dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1s" repeatCount="indefinite" />
        </circle>
      )}
      <text x={x(state.shiftedFault) + 10} y={y(state.shiftedFault) - 8} fill={resultColor} fontSize="11" fontWeight="700">{state.result.zone}</text>

      {swing && (
        <>
          <path d={swingPath.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p)},${y(p)}`).join(' ')} fill="none" stroke="#facc15" strokeWidth="3" strokeDasharray="6 4" />
          <circle r="4" fill="#facc15">
            <animateMotion dur="3s" repeatCount="indefinite" path={swingPath.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p)},${y(p)}`).join(' ')} />
          </circle>
          <text x={x(swingPath[1]) + 10} y={y(swingPath[1]) - 10} fill="#facc15" fontSize="10">Slow impedance trajectory</text>
        </>
      )}

      {/* Status and info panels */}
      <g transform="translate(640,44)">
        <rect width="300" height="156" rx="12" fill="#101015" stroke="#27272a" />
        {/* Status badge */}
        <rect x="200" y="8" width="86" height="22" rx="6" fill={`${statusColor}22`} stroke={statusColor} strokeWidth="1.5" />
        <text x="243" y="23" textAnchor="middle" fill={statusColor} fontSize="10" fontWeight="700">{statusText}</text>
        {isTrip && (
          <circle cx="192" cy="19" r="4" fill="#ef4444">
            <animate attributeName="r" values="4;6;4" dur="0.5s" repeatCount="indefinite" />
          </circle>
        )}
        <text x="16" y="24" fill="#a1a1aa" fontSize="11">Characteristic = {characteristic}</text>
        <text x="16" y="44" fill="#a1a1aa" fontSize="11">Apparent Z = {state.shiftedFault.r.toFixed(2)} + j{state.shiftedFault.x.toFixed(2)} ohm</text>
        <text x="16" y="64" fill="#a1a1aa" fontSize="11">Fault location = {state.zFaultPct.toFixed(0)}% of protected line</text>
        <text x="16" y="84" fill="#a1a1aa" fontSize="11">Arc resistance shift = {(state.shiftedFault.r - state.baseFault.r).toFixed(2)} ohm</text>
        <text x="16" y="104" fill={resultColor} fontSize="11" fontWeight="700">{state.result.decision}</text>
        <text x="16" y="124" fill="#c4b5fd" fontSize="11">Operating time = {state.result.time}</text>
        <text x="16" y="144" fill="#71717a" fontSize="10">|Zapp| = {state.apparentMag.toFixed(2)} ohm</text>
      </g>

      <g transform="translate(620,240)">
        <rect width="320" height="124" rx="12" fill="#101015" stroke="#27272a" />
        <text x="16" y="22" fill="#818cf8" fontSize="11" fontWeight="700">Zone Reach Philosophy</text>
        <text x="16" y="44" fill="#3b82f6" fontSize="11">Zone 1 = 0.8 x Zline, no intentional delay</text>
        <text x="16" y="64" fill="#22c55e" fontSize="11">Zone 2 = Zline + 0.5 x Znext, delayed local backup</text>
        <text x="16" y="84" fill="#f59e0b" fontSize="11">Zone 3 = Zline + Znext, remote backup / BF backup</text>
        <text x="16" y="104" fill="#a1a1aa" fontSize="11">Arc resistance mainly shifts the point to the right on R-axis.</text>
      </g>

      {/* Load encroachment warning */}
      {loadEncroachmentRisk && (
        <g transform="translate(620,380)">
          <rect width="320" height="28" rx="6" fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="1.5" />
          <text x="16" y="19" fill="#ef4444" fontSize="10" fontWeight="700">Zone 3 load encroachment risk!</text>
        </g>
      )}
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Distance Relay Principle and Zone Logic</h2>
      <p style={S.p}>
        Distance protection measures apparent impedance from relay location to the fault. Since transmission-line
        impedance is approximately proportional to length, the relay can infer whether the fault lies inside its protected
        section. This makes distance protection much less dependent on source fault level than simple overcurrent protection.
      </p>
      <span style={S.eq}>Zapp = V / I</span>
      <span style={S.eq}>Zfault approx. zline per km x distance to fault + Rfault</span>

      <h3 style={S.h3}>Characteristic shapes on the R-X plane</h3>
      <p style={S.p}>
        The relay's operating boundary is drawn on the R-X (resistance-reactance) plane. The three most common
        characteristic shapes are shown below. Each has different advantages for specific line and fault conditions.
      </p>
      <RXCharacteristicsSVG />
      <ul style={S.ul}>
        <li style={S.li}>Mho: circular and inherently directional, traditionally preferred on long EHV lines.</li>
        <li style={S.li}>Quadrilateral: independent control of resistive and reactive reach, better for resistive faults and short lines.</li>
        <li style={S.li}>Lens or tomato type: narrow directional reach with broader resistive tolerance for difficult short-line applications.</li>
        <li style={S.li}>Plain impedance: non-directional circle centred at origin, now rarely used alone because it cannot distinguish forward from reverse faults.</li>
      </ul>

      <h3 style={S.h3}>Why three zones are standard</h3>
      <p style={S.p}>
        A practical line relay is not set to 100% instantaneous reach because CVT transients, remote infeed,
        fault resistance, and measuring error can cause overreach. Engineers therefore deliberately underreach Zone 1,
        then use delayed Zone 2 and Zone 3 to cover the remote bus and the next line section.
      </p>
      <ZoneReachSVG />

      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Zone</th>
            <th style={S.th}>Typical Reach</th>
            <th style={S.th}>Typical Delay</th>
            <th style={S.th}>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}>Zone 1</td>
            <td style={S.td}>80% of protected line</td>
            <td style={S.td}>1-2 cycles</td>
            <td style={S.td}>Fast primary protection without overreach risk</td>
          </tr>
          <tr>
            <td style={S.td}>Zone 2</td>
            <td style={S.td}>100% of line + about 50% of next line</td>
            <td style={S.td}>0.3-0.5 s</td>
            <td style={S.td}>Remote-end overlap and delayed backup</td>
          </tr>
          <tr>
            <td style={S.td}>Zone 3</td>
            <td style={S.td}>Line + next line section</td>
            <td style={S.td}>0.6-1.0 s</td>
            <td style={S.td}>Remote backup and breaker-failure margin</td>
          </tr>
        </tbody>
      </table>

      <h3 style={S.h3}>Relay connection: VT and CT inputs</h3>
      <p style={S.p}>
        The distance relay requires both voltage and current inputs to compute the apparent impedance. The current
        transformer (CT) and voltage transformer (VT) provide stepped-down replicas of primary quantities to the relay.
      </p>
      <RelayConnectionSVG />

      <h3 style={S.h3}>Arc resistance, load encroachment, and power swing</h3>
      <p style={S.p}>
        Fault resistance introduces an additional positive R component, so the apparent impedance point shifts rightward.
        That is why close-in arcing faults may underreach a simple mho Zone 1. Stable power swings also move the apparent
        impedance through the plane, but the trajectory is slow and continuous compared with a genuine fault. Modern relays
        therefore use load encroachment logic, power-swing blocking, and out-of-step tripping functions.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Indian transmission context</span>
        <p style={S.ctxP}>
          Distance protection is standard on 220 kV and 400 kV lines across the Indian grid. CBIP and utility practice
          commonly use quadrilateral numerical relays from ABB REL670, Siemens 7SA, GE MiCOM, SEL, and similar families.
          Typical positive-sequence impedance for a 220 kV ACSR Zebra line is in the range of 0.03 + j0.32 ohm per km,
          which is why the line vector in this simulation is steep on the R-X plane.
        </p>
      </div>

      <h3 style={S.h3}>Engineering cautions</h3>
      <ul style={S.ul}>
        <li style={S.li}>Zone 3 must be set carefully because it can see beyond the intended corridor and contribute to cascading outages if applied poorly.</li>
        <li style={S.li}>Ground distance elements need zero-sequence compensation, especially on lines with varying source grounding.</li>
        <li style={S.li}>Pilot protection is preferred where high speed is needed for the full line instead of only 80% instantaneous reach.</li>
      </ul>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Y.G. Paithankar and S.R. Bhide, <em>Fundamentals of Power System Protection</em></li>
        <li style={S.li}>J. Lewis Blackburn and Thomas J. Domin, <em>Protective Relaying: Principles and Applications</em></li>
        <li style={S.li}>C.R. Mason, <em>The Art and Science of Protective Relaying</em></li>
        <li style={S.li}>CBIP Manual on Protection of Transmission Lines</li>
        <li style={S.li}>PGCIL and state-transmission line protection practices for 220 kV and 400 kV corridors</li>
      </ul>
    </div>
  );
}

export default function DistanceRelay() {
  const [tab, setTab] = useState('simulate');
  const [characteristic, setCharacteristic] = useState('Quadrilateral');
  const [faultType, setFaultType] = useState('LG');
  const [lineKm, setLineKm] = useState(120);
  const [nextKm, setNextKm] = useState(80);
  const [faultPct, setFaultPct] = useState(72);
  const [arcR, setArcR] = useState(4);
  const [swing, setSwing] = useState(false);
  const [sourceZ, setSourceZ] = useState(5);
  const [showLoadEncroachment, setShowLoadEncroachment] = useState(false);
  const [loadMVA, setLoadMVA] = useState(200);

  const state = useMemo(
    () => computeState({ lineKm, nextKm, faultPct, faultType, arcR, characteristic, swing, sourceZ }),
    [lineKm, nextKm, faultPct, faultType, arcR, characteristic, swing, sourceZ]
  );

  // Load encroachment risk check for warning badge in results
  const V_kV = 220;
  const Zload = (V_kV * V_kV) / loadMVA;
  const loadBandR = Zload * 0.15;
  const z3mag = mag(state.reaches.z3);
  const loadEncroachmentRisk = showLoadEncroachment && (Zload - loadBandR) < z3mag;

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram state={state} characteristic={characteristic} swing={swing} showLoadEncroachment={showLoadEncroachment} loadMVA={loadMVA} />
          </div>

          <div style={S.controls}>
            <div style={S.cg}><LabelWithTip text="Characteristic" tip="Relay operating boundary shape on R-X plane. Mho is circular/directional, Quad gives independent R/X control." /><select style={S.sel} value={characteristic} onChange={(e) => setCharacteristic(e.target.value)}><option>Mho</option><option>Quadrilateral</option><option>Lens</option></select></div>
            <div style={S.cg}><LabelWithTip text="Fault type" tip="Type of short circuit. LG = line-ground, LL = line-line, LLG = double line-ground, 3-Phase = balanced fault. Affects arc resistance factor." /><select style={S.sel} value={faultType} onChange={(e) => setFaultType(e.target.value)}><option>LG</option><option>LL</option><option>LLG</option><option>3-Phase</option></select></div>
            <div style={S.cg}><LabelWithTip text="Protected line" tip="Length of the protected transmission line in km. Impedance = z1 per km x length." /><input style={S.slider} type="range" min="20" max="400" step="5" value={lineKm} onChange={(e) => setLineKm(Number(e.target.value))} /><span style={S.val}>{lineKm} km</span></div>
            <div style={S.cg}><LabelWithTip text="Next line" tip="Length of the adjacent line section beyond the remote bus. Used for Zone 2 and Zone 3 reach calculations." /><input style={S.slider} type="range" min="10" max="300" step="5" value={nextKm} onChange={(e) => setNextKm(Number(e.target.value))} /><span style={S.val}>{nextKm} km</span></div>
            <div style={S.cg}><LabelWithTip text="Fault location" tip="Percentage of protected line to fault. >100% means the fault is beyond the remote bus, into the next line section." /><input style={S.slider} type="range" min="5" max="200" step="1" value={faultPct} onChange={(e) => setFaultPct(Number(e.target.value))} /><span style={S.val}>{faultPct}%</span></div>
            <div style={S.cg}><LabelWithTip text="Arc resistance" tip="Additional resistance from the fault arc. Shifts the apparent impedance point to the right on the R-X plane." /><input style={S.slider} type="range" min="0" max="40" step="0.5" value={arcR} onChange={(e) => setArcR(Number(e.target.value))} /><span style={S.val}>{arcR.toFixed(1)} ohm</span></div>
            <div style={S.cg}><LabelWithTip text="Source impedance Zs" tip="Source impedance behind the relay. Affects SIR (Source Impedance Ratio) and fault current magnitude." /><input style={S.slider} type="range" min="0.5" max="15" step="0.5" value={sourceZ} onChange={(e) => setSourceZ(Number(e.target.value))} /><span style={S.val}>{sourceZ.toFixed(1)} ohm</span></div>
            <div style={S.cg}><LabelWithTip text="Power swing" tip="Simulates a stable power swing trajectory that drifts through the relay zones slowly." /><input type="checkbox" checked={swing} onChange={(e) => setSwing(e.target.checked)} /></div>
            <div style={{ ...S.cg, borderLeft: '1px solid #27272a', paddingLeft: 14 }}>
              <label style={S.checkbox}>
                <input type="checkbox" checked={showLoadEncroachment} onChange={(e) => setShowLoadEncroachment(e.target.checked)} />
                Show load encroachment
              </label>
            </div>
            {showLoadEncroachment && (
              <div style={S.cg}><LabelWithTip text="Load MVA" tip={`Load apparent power. Zload = V^2/S = ${V_kV}^2/${loadMVA} = ${Zload.toFixed(1)} ohm. Drawn as a circle on the R-axis.`} /><input style={S.slider} type="range" min="50" max="500" step="10" value={loadMVA} onChange={(e) => setLoadMVA(Number(e.target.value))} /><span style={S.val}>{loadMVA} MVA</span></div>
            )}
          </div>

          <div style={S.results}>
            <WithTooltip tip={`Zapp = Zline x (fault%/100) + Rarc = ${state.shiftedFault.r.toFixed(2)} + j${state.shiftedFault.x.toFixed(2)} ohm, |Z| = ${state.apparentMag.toFixed(2)} ohm`}>
              <span style={S.rl}>Apparent Z</span>
              <span style={S.rv}>{state.shiftedFault.r.toFixed(2)} + j{state.shiftedFault.x.toFixed(2)}</span>
            </WithTooltip>
            <div style={S.ri}><span style={S.rl}>Zone reached</span><span style={S.rv}>{state.result.zone}</span></div>
            <div style={S.ri}><span style={S.rl}>Trip decision</span><span style={{ ...S.rv, color: state.result.decision === 'Trip' ? '#ef4444' : '#71717a' }}>{state.result.decision}</span></div>
            <div style={S.ri}><span style={S.rl}>Operating time</span><span style={S.rv}>{state.result.time}</span></div>
            <WithTooltip tip={`Zline = z1 x length = (${Z_POS_KM.r} + j${Z_POS_KM.x}) x ${lineKm} km = ${state.lineZ.r.toFixed(2)} + j${state.lineZ.x.toFixed(2)} ohm`}>
              <span style={S.rl}>Line impedance</span>
              <span style={S.rv}>{state.lineZ.r.toFixed(2)} + j{state.lineZ.x.toFixed(2)}</span>
            </WithTooltip>
            <WithTooltip tip={`Z1 = 0.8 x Zline = 0.8 x (${state.lineZ.r.toFixed(2)} + j${state.lineZ.x.toFixed(2)}) = ${state.reaches.z1.r.toFixed(2)} + j${state.reaches.z1.x.toFixed(2)} ohm`}>
              <span style={S.rl}>Zone 1 reach</span>
              <span style={{ ...S.rv, color: '#3b82f6' }}>{mag(state.reaches.z1).toFixed(2)} ohm</span>
            </WithTooltip>
            <WithTooltip tip={`Z2 = Zline + 0.5 x Znext = (${state.lineZ.r.toFixed(2)} + j${state.lineZ.x.toFixed(2)}) + 0.5 x (${state.nextZ.r.toFixed(2)} + j${state.nextZ.x.toFixed(2)}) = ${state.reaches.z2.r.toFixed(2)} + j${state.reaches.z2.x.toFixed(2)} ohm`}>
              <span style={S.rl}>Zone 2 reach</span>
              <span style={{ ...S.rv, color: '#22c55e' }}>{mag(state.reaches.z2).toFixed(2)} ohm</span>
            </WithTooltip>
            <WithTooltip tip={`Z3 = Zline + Znext = (${state.lineZ.r.toFixed(2)} + j${state.lineZ.x.toFixed(2)}) + (${state.nextZ.r.toFixed(2)} + j${state.nextZ.x.toFixed(2)}) = ${state.reaches.z3.r.toFixed(2)} + j${state.reaches.z3.x.toFixed(2)} ohm`}>
              <span style={S.rl}>Zone 3 reach</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{mag(state.reaches.z3).toFixed(2)} ohm</span>
            </WithTooltip>
            <WithTooltip tip={`SIR = Zs / |Zline| = ${sourceZ.toFixed(1)} / ${mag(state.lineZ).toFixed(2)} = ${state.sir.toFixed(3)}. High SIR (>4) indicates weak source relative to line.`}>
              <span style={S.rl}>SIR</span>
              <span style={S.rv}>{state.sir.toFixed(3)}</span>
            </WithTooltip>
            <WithTooltip tip={`Ifault = Vsource / |Zs + Zfault| = ${(220000 / Math.sqrt(3)).toFixed(0)} V / |${sourceZ.toFixed(1)} + (${state.shiftedFault.r.toFixed(2)} + j${state.shiftedFault.x.toFixed(2)})| = ${state.faultCurrent.toFixed(0)} A`}>
              <span style={S.rl}>Fault current</span>
              <span style={{ ...S.rv, color: '#22d3ee' }}>{state.faultCurrent.toFixed(0)} A</span>
            </WithTooltip>
            {loadEncroachmentRisk && (
              <div style={{ ...S.ri, justifyContent: 'center' }}>
                <span style={S.warningBadge}>Zone 3 load encroachment risk!</span>
              </div>
            )}
          </div>

          <div style={S.strip}>
            <div style={S.box}><span style={S.boxT}>Zone logic</span><span style={S.boxV}>Z1 underreaches for security.{'\n'}Z2 overlaps the remote bus.{'\n'}Z3 provides delayed backup.</span></div>
            <div style={S.box}><span style={S.boxT}>Arc resistance</span><span style={S.boxV}>Higher arc resistance shifts the point right.{'\n'}Mho is more sensitive to underreach.{'\n'}Quadrilateral gives wider resistive coverage.</span></div>
            <div style={S.box}><span style={S.boxT}>Swing blocking</span><span style={S.boxV}>A true fault lands abruptly in the trip region.{'\n'}A stable swing drifts through the plane slowly and should be blocked.</span></div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
