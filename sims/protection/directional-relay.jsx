import React, { useMemo, useState, useCallback } from 'react';

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
  results: { display: 'flex', gap: 26, flexWrap: 'wrap', padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', alignItems: 'flex-start' },
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
};

const tooltipStyle = {
  position: 'absolute',
  background: '#27272a',
  border: '1px solid #3f3f46',
  borderRadius: 8,
  padding: '8px 12px',
  zIndex: 100,
  pointerEvents: 'none',
  maxWidth: 340,
  fontSize: 12,
  color: '#d4d4d8',
  lineHeight: 1.5,
  fontFamily: 'Inter, system-ui, sans-serif',
  bottom: '100%',
  left: 0,
  marginBottom: 6,
  whiteSpace: 'normal',
};

function Tooltip({ text, visible }) {
  if (!visible) return null;
  return <div style={tooltipStyle}>{text}</div>;
}

function useTooltip() {
  const [visible, setVisible] = useState(false);
  const onMouseEnter = useCallback(() => setVisible(true), []);
  const onMouseLeave = useCallback(() => setVisible(false), []);
  return { visible, onMouseEnter, onMouseLeave };
}

function normalizeAngle(angle) {
  let a = angle;
  while (a > 180) a -= 360;
  while (a <= -180) a += 360;
  return a;
}

function computeState({ mta, currentAngle, currentMag, pickup, direction, faultType }) {
  const theta = normalizeAngle(currentAngle + (direction === 'Reverse' ? 180 : 0));
  const torque = Math.cos((theta - mta) * Math.PI / 180);
  const overcurrent = currentMag >= pickup;
  const directional = torque > 0;
  const operate = overcurrent && directional;
  const polarising = faultType === 'Earth Fault' ? 'Residual / negative sequence voltage' : 'Phase voltage or memory voltage';
  return { theta, torque, overcurrent, directional, operate, polarising };
}

/* SVG: Directional Element with Voltage and Current Inputs */
function DirectionalElementSVG() {
  return (
    <svg viewBox="0 0 700 280" style={S.svgDiag}>
      <rect width="700" height="280" fill="#09090b" />
      <text x="350" y="20" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">DIRECTIONAL ELEMENT -- VOLTAGE AND CURRENT INPUTS</text>
      {/* Protected line */}
      <line x1="40" y1="100" x2="560" y2="100" stroke="#e4e4e7" strokeWidth="3" />
      {/* Source 1 */}
      <circle cx="60" cy="100" r="18" fill="none" stroke="#60a5fa" strokeWidth="2" />
      <text x="60" y="105" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="700">S1</text>
      {/* Source 2 */}
      <circle cx="540" cy="100" r="18" fill="none" stroke="#22c55e" strokeWidth="2" />
      <text x="540" y="105" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700">S2</text>
      {/* CB */}
      <rect x="140" y="86" width="40" height="28" rx="4" fill="#18181b" stroke="#ef4444" strokeWidth="2" />
      <text x="160" y="104" textAnchor="middle" fill="#ef4444" fontSize="10">CB</text>
      {/* CT */}
      <circle cx="220" cy="100" r="14" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="220" cy="100" r="10" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="220" y="80" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="600">CT</text>
      {/* VT */}
      <line x1="300" y1="100" x2="300" y2="140" stroke="#60a5fa" strokeWidth="1.5" />
      <circle cx="300" cy="150" r="10" fill="none" stroke="#60a5fa" strokeWidth="2" />
      <circle cx="300" cy="150" r="7" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
      <text x="300" y="174" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">VT</text>
      {/* Secondary wiring */}
      <line x1="220" y1="114" x2="220" y2="200" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="220" y1="200" x2="350" y2="200" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="300" y1="160" x2="300" y2="210" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="300" y1="210" x2="350" y2="210" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Directional relay */}
      <rect x="350" y="182" width="130" height="50" rx="10" fill="#18181b" stroke="#6366f1" strokeWidth="2.5" />
      <text x="415" y="204" textAnchor="middle" fill="#6366f1" fontSize="12" fontWeight="700">67 Directional</text>
      <text x="415" y="220" textAnchor="middle" fill="#818cf8" fontSize="9">OC Relay</text>
      {/* Input labels */}
      <text x="338" y="198" textAnchor="end" fill="#f59e0b" fontSize="9">I input</text>
      <text x="338" y="214" textAnchor="end" fill="#60a5fa" fontSize="9">V input (pol)</text>
      {/* Trip back to CB */}
      <line x1="415" y1="182" x2="415" y2="60" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="415" y1="60" x2="160" y2="60" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="160" y1="60" x2="160" y2="86" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
      <text x="288" y="54" textAnchor="middle" fill="#ef4444" fontSize="9">Trip (if forward + OC)</text>
      {/* Forward direction annotation */}
      <path d="M260,130 L310,130" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrDE)" />
      <text x="285" y="126" textAnchor="middle" fill="#22c55e" fontSize="9">Forward</text>
      {/* Reverse */}
      <path d="M190,130 L150,130" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrDE2)" />
      <text x="170" y="126" textAnchor="middle" fill="#ef4444" fontSize="9">Reverse</text>
      {/* Decision logic box */}
      <g transform="translate(520,160)">
        <rect width="150" height="80" rx="8" fill="#18181b" stroke="#27272a" />
        <text x="10" y="18" fill="#818cf8" fontSize="9" fontWeight="700">TRIP LOGIC</text>
        <text x="10" y="36" fill="#a1a1aa" fontSize="9">Direction = Forward?</text>
        <text x="10" y="50" fill="#a1a1aa" fontSize="9">AND</text>
        <text x="10" y="64" fill="#a1a1aa" fontSize="9">Current &gt; Pickup?</text>
      </g>
      <defs>
        <marker id="arrDE" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="none" stroke="#22c55e" strokeWidth="1" /></marker>
        <marker id="arrDE2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="none" stroke="#ef4444" strokeWidth="1" /></marker>
      </defs>
    </svg>
  );
}

/* SVG: V-I Angle Diagram with Forward/Reverse Trip Zones */
function VIAngleDiagramSVG() {
  const cx = 200, cy = 180, r = 130;
  // MTA at 45 degrees
  const mtaRad = 45 * Math.PI / 180;
  const mtaX = cx + r * Math.cos(mtaRad);
  const mtaY = cy - r * Math.sin(mtaRad);
  // Boundary lines at MTA +/- 90 degrees
  const bnd1Rad = (45 + 90) * Math.PI / 180;
  const bnd2Rad = (45 - 90) * Math.PI / 180;
  const b1x = cx + r * Math.cos(bnd1Rad);
  const b1y = cy - r * Math.sin(bnd1Rad);
  const b2x = cx + r * Math.cos(bnd2Rad);
  const b2y = cy - r * Math.sin(bnd2Rad);
  return (
    <svg viewBox="0 0 700 360" style={S.svgDiag}>
      <rect width="700" height="360" fill="#09090b" />
      <text x="350" y="20" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">V-I ANGLE DIAGRAM: FORWARD AND REVERSE TRIP ZONES</text>
      {/* Circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#27272a" strokeWidth="1.5" />
      {/* Forward region (upper half relative to MTA boundary) -- green shading */}
      <path d={`M${cx},${cy} L${b1x},${b1y} A${r},${r} 0 1 1 ${b2x},${b2y} Z`} fill="rgba(34,197,94,0.12)" />
      {/* Reverse region -- red shading */}
      <path d={`M${cx},${cy} L${b2x},${b2y} A${r},${r} 0 1 1 ${b1x},${b1y} Z`} fill="rgba(239,68,68,0.08)" />
      {/* Boundary line */}
      <line x1={b1x} y1={b1y} x2={b2x} y2={b2y} stroke="#71717a" strokeWidth="1.5" strokeDasharray="6 4" />
      {/* MTA line */}
      <line x1={cx} y1={cy} x2={mtaX} y2={mtaY} stroke="#a78bfa" strokeWidth="2.5" />
      <text x={mtaX + 8} y={mtaY - 4} fill="#a78bfa" fontSize="10" fontWeight="600">MTA = 45 deg</text>
      {/* V reference (horizontal) */}
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#60a5fa" strokeWidth="3" />
      <text x={cx + r + 8} y={cy + 4} fill="#60a5fa" fontSize="11" fontWeight="700">Vpol (ref)</text>
      {/* Example current phasor at 30 degrees (forward) */}
      <line x1={cx} y1={cy} x2={cx + r * 0.75 * Math.cos(30 * Math.PI / 180)} y2={cy - r * 0.75 * Math.sin(30 * Math.PI / 180)} stroke="#f59e0b" strokeWidth="3" />
      <text x={cx + r * 0.75 * Math.cos(30 * Math.PI / 180) + 8} y={cy - r * 0.75 * Math.sin(30 * Math.PI / 180)} fill="#f59e0b" fontSize="10" fontWeight="600">I (forward)</text>
      {/* Example current phasor at -120 degrees (reverse) */}
      <line x1={cx} y1={cy} x2={cx + r * 0.6 * Math.cos(-120 * Math.PI / 180)} y2={cy - r * 0.6 * Math.sin(-120 * Math.PI / 180)} stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" />
      <text x={cx + r * 0.6 * Math.cos(-120 * Math.PI / 180) - 8} y={cy - r * 0.6 * Math.sin(-120 * Math.PI / 180) + 14} fill="#ef4444" fontSize="10">I (reverse)</text>
      {/* Labels */}
      <text x={cx + 30} y={cy - 50} fill="#22c55e" fontSize="12" fontWeight="700">FORWARD</text>
      <text x={cx + 30} y={cy - 36} fill="#22c55e" fontSize="9">(TRIP permitted)</text>
      <text x={cx - 100} y={cy + 60} fill="#ef4444" fontSize="12" fontWeight="700">REVERSE</text>
      <text x={cx - 100} y={cy + 74} fill="#ef4444" fontSize="9">(RESTRAIN)</text>
      {/* Angle annotation */}
      <path d={`M${cx + 40},${cy} A40,40 0 0 0 ${cx + 40 * Math.cos(30 * Math.PI / 180)},${cy - 40 * Math.sin(30 * Math.PI / 180)}`} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <text x={cx + 50} y={cy - 14} fill="#f59e0b" fontSize="9">theta</text>
      {/* Legend */}
      <g transform="translate(420,60)">
        <rect width="250" height="120" rx="10" fill="#18181b" stroke="#27272a" />
        <text x="14" y="22" fill="#818cf8" fontSize="10" fontWeight="700">DIRECTIONAL DECISION</text>
        <text x="14" y="42" fill="#a1a1aa" fontSize="10">Torque = V x I x cos(theta - MTA)</text>
        <text x="14" y="62" fill="#22c55e" fontSize="10">Torque &gt; 0: Forward (trip permit)</text>
        <text x="14" y="82" fill="#ef4444" fontSize="10">Torque &lt; 0: Reverse (restrain)</text>
        <text x="14" y="102" fill="#a1a1aa" fontSize="10">Boundary at theta = MTA +/- 90 deg</text>
      </g>
      {/* Torque formula */}
      <g transform="translate(420,210)">
        <rect width="250" height="100" rx="10" fill="#18181b" stroke="#27272a" />
        <text x="14" y="22" fill="#818cf8" fontSize="10" fontWeight="700">MAXIMUM SENSITIVITY</text>
        <text x="14" y="42" fill="#a1a1aa" fontSize="10">At theta = MTA, torque is maximum.</text>
        <text x="14" y="62" fill="#a1a1aa" fontSize="10">At theta = MTA +/- 90, torque = 0.</text>
        <text x="14" y="82" fill="#a1a1aa" fontSize="10">MTA is typically 30-60 deg for</text>
        <text x="14" y="96" fill="#a1a1aa" fontSize="10">phase faults on overhead lines.</text>
      </g>
    </svg>
  );
}

/* SVG: Power Direction Sensing Principle */
function PowerDirectionSVG() {
  return (
    <svg viewBox="0 0 700 220" style={S.svgDiag}>
      <rect width="700" height="220" fill="#09090b" />
      <text x="350" y="20" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">POWER DIRECTION SENSING PRINCIPLE</text>
      {/* Two scenarios side by side */}
      {/* Forward fault */}
      <g transform="translate(30,40)">
        <text x="140" y="14" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="700">FORWARD FAULT</text>
        <line x1="0" y1="60" x2="280" y2="60" stroke="#e4e4e7" strokeWidth="3" />
        <circle cx="20" cy="60" r="14" fill="none" stroke="#60a5fa" strokeWidth="2" />
        <text x="20" y="65" textAnchor="middle" fill="#60a5fa" fontSize="9">S</text>
        {/* Relay */}
        <rect x="100" y="46" width="40" height="28" rx="6" fill="#18181b" stroke="#22c55e" strokeWidth="2" />
        <text x="120" y="64" textAnchor="middle" fill="#22c55e" fontSize="9">67</text>
        {/* Fault on right */}
        <g transform="translate(230,44)">
          <line x1="0" y1="16" x2="10" y2="0" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="10" y1="0" x2="20" y2="16" stroke="#ef4444" strokeWidth="2.5" />
          <text x="10" y="30" textAnchor="middle" fill="#ef4444" fontSize="9">F</text>
        </g>
        {/* Power arrow (forward) */}
        <path d="M50,42 L100,42" stroke="#22c55e" strokeWidth="2.5" markerEnd="url(#arrPD1)" />
        <text x="75" y="36" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="600">P (forward)</text>
        {/* Result */}
        <rect x="20" y="100" width="240" height="50" rx="8" fill="#18181b" stroke="#27272a" />
        <text x="140" y="120" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="600">Power flows FROM source TO fault</text>
        <text x="140" y="138" textAnchor="middle" fill="#22c55e" fontSize="10">Relay sees FORWARD direction -- PERMIT</text>
      </g>
      {/* Reverse fault */}
      <g transform="translate(380,40)">
        <text x="140" y="14" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="700">REVERSE FAULT</text>
        <line x1="0" y1="60" x2="280" y2="60" stroke="#e4e4e7" strokeWidth="3" />
        <circle cx="260" cy="60" r="14" fill="none" stroke="#60a5fa" strokeWidth="2" />
        <text x="260" y="65" textAnchor="middle" fill="#60a5fa" fontSize="9">S</text>
        {/* Relay */}
        <rect x="120" y="46" width="40" height="28" rx="6" fill="#18181b" stroke="#ef4444" strokeWidth="2" />
        <text x="140" y="64" textAnchor="middle" fill="#ef4444" fontSize="9">67</text>
        {/* Fault on left */}
        <g transform="translate(20,44)">
          <line x1="0" y1="16" x2="10" y2="0" stroke="#ef4444" strokeWidth="2.5" />
          <line x1="10" y1="0" x2="20" y2="16" stroke="#ef4444" strokeWidth="2.5" />
          <text x="10" y="30" textAnchor="middle" fill="#ef4444" fontSize="9">F</text>
        </g>
        {/* Power arrow (reverse through relay) */}
        <path d="M210,42 L160,42" stroke="#ef4444" strokeWidth="2.5" markerEnd="url(#arrPD2)" />
        <text x="185" y="36" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="600">P (reverse)</text>
        {/* Result */}
        <rect x="20" y="100" width="240" height="50" rx="8" fill="#18181b" stroke="#27272a" />
        <text x="140" y="120" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="600">Power flows FROM source BEHIND relay</text>
        <text x="140" y="138" textAnchor="middle" fill="#ef4444" fontSize="10">Relay sees REVERSE direction -- RESTRAIN</text>
      </g>
      <defs>
        <marker id="arrPD1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="none" stroke="#22c55e" strokeWidth="1" /></marker>
        <marker id="arrPD2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="none" stroke="#ef4444" strokeWidth="1" /></marker>
      </defs>
    </svg>
  );
}

/* Helper: SVG arc path for angle annotation */
function describeArc(cx, cy, radius, startAngleDeg, endAngleDeg) {
  const startRad = -startAngleDeg * Math.PI / 180;
  const endRad = -endAngleDeg * Math.PI / 180;
  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);
  let diff = endAngleDeg - startAngleDeg;
  // Normalize
  while (diff > 360) diff -= 360;
  while (diff < -360) diff += 360;
  const largeArc = Math.abs(diff) > 180 ? 1 : 0;
  // sweep: if endAngle > startAngle (CCW in math = CW in SVG y-down), sweep=0
  const sweep = diff > 0 ? 0 : 1;
  return { path: `M${x1},${y1} A${radius},${radius} 0 ${largeArc} ${sweep} ${x2},${y2}`, midX: cx + radius * Math.cos(-(startAngleDeg + diff / 2) * Math.PI / 180), midY: cy + radius * Math.sin(-(startAngleDeg + diff / 2) * Math.PI / 180) };
}

/* Torque vs Angle sub-plot */
function TorqueAngleCurve({ mta, currentAngle, svgX, svgY, svgW, svgH }) {
  const plotL = svgX + 40;
  const plotR = svgX + svgW - 10;
  const plotT = svgY + 18;
  const plotB = svgY + svgH - 20;
  const plotW = plotR - plotL;
  const plotH = plotB - plotT;
  const midY = plotT + plotH / 2;

  // Map angle (-180..180) to x
  const ax = (a) => plotL + ((a + 180) / 360) * plotW;
  // Map torque (-1..1) to y
  const ty = (t) => midY - (t * plotH / 2);

  // Build cosine curve path
  const pts = [];
  for (let a = -180; a <= 180; a += 2) {
    const t = Math.cos((a - mta) * Math.PI / 180);
    pts.push(`${a === -180 ? 'M' : 'L'}${ax(a).toFixed(1)},${ty(t).toFixed(1)}`);
  }
  const curvePath = pts.join(' ');

  // Forward region fill (where torque > 0): from MTA-90 to MTA+90
  const fwdStart = mta - 90;
  const fwdEnd = mta + 90;
  // Build fill path for forward region
  const fwdPts = [];
  for (let a = -180; a <= 180; a += 2) {
    const t = Math.cos((a - mta) * Math.PI / 180);
    // Normalize angle diff
    let d = a - mta;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    const inFwd = Math.abs(d) < 90;
    if (inFwd && t > 0) {
      fwdPts.push({ x: ax(a), y: ty(t) });
    }
  }
  let fwdPath = '';
  if (fwdPts.length > 1) {
    fwdPath = `M${fwdPts[0].x.toFixed(1)},${midY.toFixed(1)} `;
    fwdPts.forEach((p, i) => { fwdPath += `L${p.x.toFixed(1)},${p.y.toFixed(1)} `; });
    fwdPath += `L${fwdPts[fwdPts.length - 1].x.toFixed(1)},${midY.toFixed(1)} Z`;
  }

  // Reverse region fill (where torque < 0)
  const revPts = [];
  for (let a = -180; a <= 180; a += 2) {
    const t = Math.cos((a - mta) * Math.PI / 180);
    if (t < 0) {
      revPts.push({ x: ax(a), y: ty(t) });
    }
  }
  let revPath = '';
  if (revPts.length > 1) {
    revPath = `M${revPts[0].x.toFixed(1)},${midY.toFixed(1)} `;
    revPts.forEach((p) => { revPath += `L${p.x.toFixed(1)},${p.y.toFixed(1)} `; });
    revPath += `L${revPts[revPts.length - 1].x.toFixed(1)},${midY.toFixed(1)} Z`;
  }

  // Current operating point
  const opTorque = Math.cos((currentAngle - mta) * Math.PI / 180);
  const opX = ax(currentAngle);
  const opY = ty(opTorque);

  // MTA position on x-axis
  const mtaX = ax(mta);
  // Boundary positions
  const clampAngle = (a) => { while (a > 180) a -= 360; while (a < -180) a += 360; return a; };
  const bnd1 = clampAngle(mta - 90);
  const bnd2 = clampAngle(mta + 90);

  return (
    <g>
      <text x={svgX + svgW / 2} y={svgY + 12} textAnchor="middle" fill="#71717a" fontSize="10" fontWeight="700" letterSpacing="0.04em">TORQUE vs V-I ANGLE</text>
      {/* Axes */}
      <line x1={plotL} y1={midY} x2={plotR} y2={midY} stroke="#3f3f46" strokeWidth="1" />
      <line x1={plotL} y1={plotT} x2={plotL} y2={plotB} stroke="#3f3f46" strokeWidth="1" />
      {/* X-axis labels */}
      {[-180, -90, 0, 90, 180].map((a) => (
        <g key={a}>
          <line x1={ax(a)} y1={midY - 3} x2={ax(a)} y2={midY + 3} stroke="#52525b" strokeWidth="1" />
          <text x={ax(a)} y={plotB + 12} textAnchor="middle" fill="#52525b" fontSize="8">{a}°</text>
        </g>
      ))}
      {/* Y-axis labels */}
      <text x={plotL - 4} y={plotT + 4} textAnchor="end" fill="#52525b" fontSize="8">1</text>
      <text x={plotL - 4} y={midY + 3} textAnchor="end" fill="#52525b" fontSize="8">0</text>
      <text x={plotL - 4} y={plotB + 3} textAnchor="end" fill="#52525b" fontSize="8">-1</text>
      {/* Grid lines */}
      <line x1={plotL} y1={plotT} x2={plotR} y2={plotT} stroke="#1e1e2e" strokeWidth="0.5" />
      <line x1={plotL} y1={plotB} x2={plotR} y2={plotB} stroke="#1e1e2e" strokeWidth="0.5" />
      {/* Forward fill */}
      {fwdPath && <path d={fwdPath} fill="rgba(34,197,94,0.15)" />}
      {/* Reverse fill */}
      {revPath && <path d={revPath} fill="rgba(239,68,68,0.10)" />}
      {/* Cosine curve */}
      <path d={curvePath} fill="none" stroke="#a78bfa" strokeWidth="1.5" />
      {/* MTA marker */}
      <line x1={mtaX} y1={plotT} x2={mtaX} y2={plotB} stroke="#a78bfa" strokeWidth="1" strokeDasharray="3 3" />
      <text x={mtaX} y={plotT - 3} textAnchor="middle" fill="#a78bfa" fontSize="8">MTA</text>
      {/* Boundary markers */}
      {[bnd1, bnd2].map((b, i) => {
        const bx = ax(b);
        if (bx >= plotL && bx <= plotR) {
          return (
            <g key={i}>
              <line x1={bx} y1={plotT} x2={bx} y2={plotB} stroke="#71717a" strokeWidth="0.8" strokeDasharray="2 3" />
              <text x={bx} y={plotB + 12} textAnchor="middle" fill="#71717a" fontSize="7">{b.toFixed(0)}°</text>
            </g>
          );
        }
        return null;
      })}
      {/* Operating point */}
      <circle cx={opX} cy={opY} r="5" fill={opTorque > 0 ? '#22c55e' : '#ef4444'} stroke="#fff" strokeWidth="1.5" />
      <line x1={opX} y1={midY} x2={opX} y2={opY} stroke={opTorque > 0 ? '#22c55e' : '#ef4444'} strokeWidth="1" strokeDasharray="2 2" />
      <text x={opX + 8} y={opY - 4} fill="#e4e4e7" fontSize="8" fontWeight="600">{opTorque.toFixed(3)}</text>
    </g>
  );
}

function Diagram({ topology, direction, currentAngle, mta, currentMag, pickup, faultType, state }) {
  const W = 1020;
  const H = 640;
  const cx = 250;
  const cy = 200;
  const r = 132;
  const vX = cx + r;
  const vY = cy;
  const iX = cx + r * Math.cos(state.theta * Math.PI / 180);
  const iY = cy - r * Math.sin(state.theta * Math.PI / 180);
  const mX = cx + r * Math.cos(mta * Math.PI / 180);
  const mY = cy - r * Math.sin(mta * Math.PI / 180);
  const permitColor = state.operate ? '#ef4444' : '#22c55e';
  const feederArrow = direction === 'Forward' ? '150,48 205,66 150,84' : '270,48 215,66 270,84';

  // Boundary lines for forward/reverse at MTA +/- 90
  const bnd1Rad = (mta + 90) * Math.PI / 180;
  const bnd2Rad = (mta - 90) * Math.PI / 180;
  const b1x = cx + r * Math.cos(bnd1Rad);
  const b1y = cy - r * Math.sin(bnd1Rad);
  const b2x = cx + r * Math.cos(bnd2Rad);
  const b2y = cy - r * Math.sin(bnd2Rad);

  // Relay status
  const statusColor = state.operate ? '#ef4444' : state.directional ? '#f59e0b' : '#22c55e';
  const statusText = state.operate ? 'TRIPPED' : state.directional && !state.overcurrent ? 'FWD, NO OC' : !state.directional ? 'REVERSE' : 'RESTRAIN';

  // Angle annotation arcs
  const arcRadius = 42;
  // Arc from V (0 deg) to I (effective theta after fault-side rotation)
  const thetaArc = describeArc(cx, cy, arcRadius, 0, state.theta);
  // Arc from V (0 deg) to MTA
  const mtaArcRadius = 56;
  const mtaArc = describeArc(cx, cy, mtaArcRadius, 0, mta);
  // Difference arc from MTA to operating current angle
  const diffArcRadius = 34;
  const diffArc = describeArc(cx, cy, diffArcRadius, mta, state.theta);
  const angleDiff = normalizeAngle(state.theta - mta);

  // Degree markers around circle perimeter
  const degreeMarkers = [0, 90, 180, 270];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <text x={W / 2} y="24" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="700" letterSpacing="0.08em">
        DIRECTIONAL ELEMENT SUPERVISING OVERCURRENT TRIP LOGIC
      </text>

      <g>
        <circle cx={cx} cy={cy} r={r} fill="#0f1015" stroke="#27272a" strokeWidth="2" />
        {/* Forward half shading */}
        <path d={`M${cx},${cy} L${b1x},${b1y} A${r},${r} 0 ${mta >= 0 ? '1' : '0'} 1 ${b2x},${b2y} Z`} fill="rgba(34,197,94,0.15)" />
        {/* Reverse half shading */}
        <path d={`M${cx},${cy} L${b2x},${b2y} A${r},${r} 0 ${mta >= 0 ? '1' : '0'} 1 ${b1x},${b1y} Z`} fill="rgba(239,68,68,0.10)" />
        {/* Boundary line */}
        <line x1={b1x} y1={b1y} x2={b2x} y2={b2y} stroke="#71717a" strokeWidth="1" strokeDasharray="4 3" />

        {/* Degree markers at 0, 90, 180, 270 */}
        {degreeMarkers.map((deg) => {
          const rad = deg * Math.PI / 180;
          const mx = cx + (r + 12) * Math.cos(rad);
          const my = cy - (r + 12) * Math.sin(rad);
          const tx = cx + (r + 4) * Math.cos(rad);
          const ty_m = cy - (r + 4) * Math.sin(rad);
          const ix = cx + r * Math.cos(rad);
          const iy = cy - r * Math.sin(rad);
          return (
            <g key={deg}>
              <line x1={ix} y1={iy} x2={tx} y2={ty_m} stroke="#52525b" strokeWidth="1" />
              <text x={mx} y={my + 3} textAnchor="middle" fill="#52525b" fontSize="9">{deg}°</text>
            </g>
          );
        })}

        {/* V reference phasor */}
        <line x1={cx} y1={cy} x2={vX} y2={vY} stroke="#60a5fa" strokeWidth="4" />
        {/* I phasor with magnitude-proportional width */}
        <line x1={cx} y1={cy} x2={iX} y2={iY} stroke="#f59e0b" strokeWidth={Math.max(3, currentMag / 300)} />
        {/* MTA line */}
        <line x1={cx} y1={cy} x2={mX} y2={mY} stroke="#a78bfa" strokeDasharray="6 4" strokeWidth="2.5" />

        {/* Angle arc: V to I (theta) */}
        <path d={thetaArc.path} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
        <text x={thetaArc.midX + (state.theta >= 0 ? 10 : -10)} y={thetaArc.midY + (state.theta >= 0 ? -4 : 10)} textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="600">{state.theta}°</text>

        {/* Angle arc: V to MTA */}
        <path d={mtaArc.path} fill="none" stroke="#a78bfa" strokeWidth="1" strokeDasharray="3 2" />
        <text x={mtaArc.midX + 12} y={mtaArc.midY - 2} textAnchor="middle" fill="#a78bfa" fontSize="8">MTA {mta}°</text>

        {/* Difference arc: MTA to I */}
        <path d={diffArc.path} fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="2 2" />
        <text x={diffArc.midX + (angleDiff >= 0 ? 14 : -14)} y={diffArc.midY} textAnchor="middle" fill="#22d3ee" fontSize="8" fontWeight="600">{angleDiff}°</text>

        <text x={vX + 8} y={vY + 4} fill="#60a5fa" fontSize="12" fontWeight="700">Vpol</text>
        <text x={iX + 8} y={iY + 4} fill="#f59e0b" fontSize="12" fontWeight="700">I</text>
        <text x={mX + 8} y={mY + 4} fill="#a78bfa" fontSize="11">MTA</text>
        <text x={cx} y="42" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="700">Directional torque sector</text>
        <text x={cx} y="58" textAnchor="middle" fill="#22c55e" fontSize="10">Forward permit region</text>
        <text x={cx} y="72" textAnchor="middle" fill="#ef4444" fontSize="10">Reverse restraint region</text>
      </g>

      {/* Torque vs Angle curve below the phasor circle */}
      <TorqueAngleCurve mta={mta} currentAngle={currentAngle} svgX={60} svgY={370} svgW={380} svgH={130} />

      {/* Info panel with status */}
      <g transform="translate(520,44)">
        <rect width="380" height="188" rx="12" fill="#101015" stroke="#27272a" />
        {/* Status badge */}
        <rect x="270" y="8" width="96" height="22" rx="6" fill={`${statusColor}22`} stroke={statusColor} strokeWidth="1.5" />
        <text x="318" y="23" textAnchor="middle" fill={statusColor} fontSize="10" fontWeight="700">{statusText}</text>
        {state.operate && (
          <circle cx="262" cy="19" r="4" fill="#ef4444">
            <animate attributeName="r" values="4;6;4" dur="0.5s" repeatCount="indefinite" />
          </circle>
        )}
        <text x="16" y="24" fill="#a1a1aa" fontSize="12">Topology = {topology}</text>
        <text x="16" y="46" fill="#a1a1aa" fontSize="12">Fault type = {faultType}</text>
        <text x="16" y="68" fill="#a1a1aa" fontSize="12">Fault side = {direction}</text>
        <text x="16" y="90" fill="#a1a1aa" fontSize="12">Polarising = {state.polarising}</text>
        <text x="16" y="112" fill="#a1a1aa" fontSize="12">Torque = cos({state.theta.toFixed(0)} - {mta}) = {state.torque.toFixed(3)}</text>
        <text x="16" y="134" fill="#a1a1aa" fontSize="12">OC supervision = {state.overcurrent ? 'Picked up' : 'Below pickup'}</text>
        <text x="16" y="156" fill={permitColor} fontSize="12" fontWeight="700">{state.operate ? 'Directional OC permits trip' : state.directional ? 'Direction ok, but current below pickup' : 'Directional element restrains'}</text>
        <text x="16" y="178" fill="#71717a" fontSize="11">Current = {currentMag.toFixed(0)} A, pickup = {pickup.toFixed(0)} A</text>
      </g>

      {/* Feeder diagram */}
      <g transform="translate(510,258)">
        <rect width="392" height="126" rx="14" fill="#0f1015" stroke="#27272a" />
        <line x1="34" y1="66" x2="358" y2="66" stroke="#3f3f46" strokeWidth="8" strokeLinecap="round" />
        <circle cx="70" cy="66" r="18" fill="#172554" stroke="#60a5fa" strokeWidth="2" />
        <circle cx="322" cy="66" r="18" fill="#14532d" stroke="#22c55e" strokeWidth="2" />
        <text x="70" y="71" textAnchor="middle" fill="#60a5fa" fontSize="10">S1</text>
        <text x="322" y="71" textAnchor="middle" fill="#22c55e" fontSize="10">S2</text>
        <polygon points={feederArrow} fill="#f59e0b" />
        {/* Animated fault flow arrow */}
        {state.operate && (
          <circle r="4" fill="#ef4444" opacity="0.8">
            <animateMotion dur="1.5s" repeatCount="indefinite" path={direction === 'Forward' ? 'M70,66 L322,66' : 'M322,66 L70,66'} />
          </circle>
        )}
        <circle cx="196" cy="66" r="24" fill="#101015" stroke={permitColor} strokeWidth="3" />
        <text x="196" y="71" textAnchor="middle" fill="#fff" fontSize="11">67</text>
        <text x="196" y="28" textAnchor="middle" fill="#a1a1aa" fontSize="11">{topology} power-flow picture</text>
        <text x="20" y="104" fill="#a1a1aa" fontSize="11">Trip requires both direction and current magnitude: 67 AND 51</text>
      </g>

      {/* Operating point box */}
      <g transform="translate(510,420)">
        <rect width="392" height="56" rx="12" fill="#101015" stroke="#27272a" />
        <text x="16" y="24" fill="#818cf8" fontSize="11" fontWeight="700">Operating point</text>
        <text x="16" y="42" fill="#a1a1aa" fontSize="11">Current = {currentMag.toFixed(0)} A, pickup = {pickup.toFixed(0)} A, effective theta = {state.theta.toFixed(0)} deg, MTA = {mta.toFixed(0)} deg</text>
      </g>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Directional Relay Principle</h2>
      <p style={S.p}>
        Overcurrent magnitude alone is not enough in ring mains, parallel feeders, meshed substations, or networks with
        distributed generation. A directional relay determines whether the fault is seen in the permitted forward direction
        or in the reverse direction, then supervises an overcurrent or earth-fault element.
      </p>
      <span style={S.eq}>Directional torque proportional to V x I x cos(theta - MTA)</span>

      <h3 style={S.h3}>Directional element with voltage and current inputs</h3>
      <p style={S.p}>
        The directional relay requires both voltage and current inputs. The voltage serves as the polarising reference
        that defines the forward direction. The relay compares the angular relationship between the current phasor and
        the polarising voltage to determine whether the fault power flows forward or in reverse.
      </p>
      <DirectionalElementSVG />

      <h3 style={S.h3}>V-I angle diagram: forward and reverse zones</h3>
      <p style={S.p}>
        The directional element divides the phasor plane into two half-planes separated by a boundary perpendicular
        to the maximum torque angle (MTA). Current phasors falling in the forward half-plane produce positive torque
        and permit tripping. Current phasors in the reverse half-plane are restrained.
      </p>
      <VIAngleDiagramSVG />

      <h3 style={S.h3}>Power direction sensing</h3>
      <p style={S.p}>
        The physical idea is straightforward: during a forward fault, real power flows from the source through the relay
        toward the fault. During a reverse fault, power flows from a source behind the relay location. The relay must
        distinguish these two cases to avoid tripping for faults that should be cleared by other relays.
      </p>
      <PowerDirectionSVG />

      <h3 style={S.h3}>What the directional element really decides</h3>
      <p style={S.p}>
        The directional unit compares current with a polarising reference, usually voltage. If the angular relationship
        between them falls inside the forward torque region, the relay permits tripping. If the angle indicates reverse
        power or reverse fault current, the relay restrains even if current magnitude is high.
      </p>

      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Quantity</th>
            <th style={S.th}>Meaning</th>
            <th style={S.th}>Why it matters</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}>Polarising voltage</td>
            <td style={S.td}>Reference phasor for direction</td>
            <td style={S.td}>Defines forward versus reverse region</td>
          </tr>
          <tr>
            <td style={S.td}>Maximum torque angle</td>
            <td style={S.td}>Angle of maximum sensitivity</td>
            <td style={S.td}>Should align with expected fault current angle</td>
          </tr>
          <tr>
            <td style={S.td}>Overcurrent pickup</td>
            <td style={S.td}>Minimum current for operation</td>
            <td style={S.td}>Prevents action under low current or load</td>
          </tr>
        </tbody>
      </table>

      <h3 style={S.h3}>Phase-fault and earth-fault direction</h3>
      <ul style={S.ul}>
        <li style={S.li}>Phase directional units often use phase voltage or memory voltage as the polarising quantity.</li>
        <li style={S.li}>Earth-fault directional units commonly use residual voltage, residual current, or negative-sequence quantities.</li>
        <li style={S.li}>Incorrect polarising selection can make a relay blind during close-in faults when voltage collapses.</li>
      </ul>

      <h3 style={S.h3}>Why directional OC is widely used</h3>
      <p style={S.p}>
        Directional overcurrent is an economical way to protect systems that are not purely radial. It is common on ring
        feeders, parallel lines, tie feeders, and substation bus arrangements where multiple sources contribute to a fault.
        Modern numerical relays combine several directional units with phase and earth-fault overcurrent elements.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Indian context</span>
        <p style={S.ctxP}>
          Directional overcurrent protection is common on 33 kV and 132 kV feeders, ring mains, and parallel lines in India.
          It becomes especially important where captive generation, rooftop solar, or embedded sources create reverse or
          bidirectional current paths that old radial assumptions cannot handle. Typical devices include ABB REF615,
          Siemens 7SJ, GE MiCOM, L&amp;T, Easun Reyrolle, and equivalent numerical relays.
        </p>
      </div>

      <h3 style={S.h3}>Engineering cautions</h3>
      <ul style={S.ul}>
        <li style={S.li}>Directional settings must be coordinated with source impedance and expected fault angle, not chosen arbitrarily.</li>
        <li style={S.li}>Memory voltage or negative-sequence polarising may be necessary when fault voltage collapses badly.</li>
        <li style={S.li}>Directional supervision is not a replacement for proper time grading and pickup coordination.</li>
      </ul>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Y.G. Paithankar and S.R. Bhide, <em>Fundamentals of Power System Protection</em></li>
        <li style={S.li}>J. Lewis Blackburn and Thomas J. Domin, <em>Protective Relaying: Principles and Applications</em></li>
        <li style={S.li}>C.R. Mason, <em>The Art and Science of Protective Relaying</em></li>
        <li style={S.li}>CBIP application guides for directional overcurrent and earth-fault protection</li>
        <li style={S.li}>Utility practice for ring-main and multi-infeed feeder protection in India</li>
      </ul>
    </div>
  );
}

export default function DirectionalRelay() {
  const [tab, setTab] = useState('simulate');
  const [topology, setTopology] = useState('Ring Main');
  const [faultType, setFaultType] = useState('Phase Fault');
  const [direction, setDirection] = useState('Forward');
  const [mta, setMta] = useState(45);
  const [currentAngle, setCurrentAngle] = useState(30);
  const [currentMag, setCurrentMag] = useState(850);
  const [pickup, setPickup] = useState(400);
  const [voltage, setVoltage] = useState(11);

  // Tooltip hooks
  const ttTorque = useTooltip();
  const ttDirection = useTooltip();
  const ttOC = useTooltip();
  const ttTrip = useTooltip();
  const ttMTA = useTooltip();
  const ttVIAngle = useTooltip();
  const ttP = useTooltip();
  const ttQ = useTooltip();
  const ttS = useTooltip();

  const state = useMemo(
    () => computeState({ mta, currentAngle, currentMag, pickup, direction, faultType }),
    [mta, currentAngle, currentMag, pickup, direction, faultType]
  );

  // Power calculations (V in kV, I in A, angle in degrees)
  const thetaRad = state.theta * Math.PI / 180;
  const P = voltage * currentMag * Math.cos(thetaRad); // kW
  const Q = voltage * currentMag * Math.sin(thetaRad); // kVAR
  const Sva = voltage * currentMag; // kVA

  // Tooltip text computations
  const diff = normalizeAngle(state.theta - mta);
  const sideShift = direction === 'Reverse' ? ' (base angle rotated by 180° for a reverse-side fault)' : '';
  const torqueTooltipText = `Torque = cos(\u03B8 \u2212 MTA) = cos(${state.theta.toFixed(0)}\u00B0 \u2212 ${mta}\u00B0) = cos(${diff}\u00B0) = ${state.torque.toFixed(4)}. Positive torque permits forward operation.${sideShift}`;
  const directionTooltipText = `Direction is decided only from torque sign. Forward permit when torque > 0, i.e., |\u03B8 \u2212 MTA| < 90\u00B0. Effective current angle ${state.theta.toFixed(0)}\u00B0 vs MTA ${mta}\u00B0, difference = ${diff}\u00B0.`;
  const ocComparison = state.overcurrent ? `${currentMag} A \u2265 ${pickup} A, picked up` : `${currentMag} A < ${pickup} A, below threshold`;
  const ocTooltipText = `Overcurrent supervision: I = ${currentMag} A vs Ipickup = ${pickup} A. ${ocComparison}`;
  const tripDirStr = state.directional ? 'forward' : 'reverse';
  const tripOCStr = state.overcurrent ? 'above pickup' : 'below pickup';
  const tripTooltipText = `Trip requires BOTH: torque-derived forward permission AND I \u2265 Ipickup. Direction result: ${tripDirStr}, OC: ${tripOCStr}.`;
  const mtaTooltipText = 'Maximum Torque Angle: angle of maximum relay sensitivity. Set near expected fault current angle for the line.';
  const viAngleTooltipText = 'Base V-I angle referenced to the selected fault side. Reverse-side faults rotate the measured current phasor by 180 degrees before the directional decision.';
  const pTooltipText = `Active power P = V \u00D7 I \u00D7 cos(\u03B8eff) = ${voltage} kV \u00D7 ${currentMag} A \u00D7 cos(${state.theta.toFixed(0)}\u00B0) = ${P.toFixed(1)} kW`;
  const qTooltipText = `Reactive power Q = V \u00D7 I \u00D7 sin(\u03B8eff) = ${voltage} kV \u00D7 ${currentMag} A \u00D7 sin(${state.theta.toFixed(0)}\u00B0) = ${Q.toFixed(1)} kVAR`;

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram topology={topology} direction={direction} currentAngle={currentAngle} mta={mta} currentMag={currentMag} pickup={pickup} faultType={faultType} state={state} />
          </div>

          <div style={S.controls}>
            <div style={S.cg}><span style={S.label}>Topology</span><select style={S.sel} value={topology} onChange={(e) => setTopology(e.target.value)}><option>Ring Main</option><option>Parallel Feeders</option><option>Multi-infeed Bus</option></select></div>
            <div style={S.cg}><span style={S.label}>Fault type</span><select style={S.sel} value={faultType} onChange={(e) => setFaultType(e.target.value)}><option>Phase Fault</option><option>Earth Fault</option></select></div>
            <div style={S.cg}><span style={S.label}>Fault side</span><select style={S.sel} value={direction} onChange={(e) => setDirection(e.target.value)}><option>Forward</option><option>Reverse</option></select></div>
            <div style={{ ...S.cg, position: 'relative' }} onMouseEnter={ttMTA.onMouseEnter} onMouseLeave={ttMTA.onMouseLeave}>
              <span style={S.label}>MTA</span>
              <input style={S.slider} type="range" min="-30" max="120" step="1" value={mta} onChange={(e) => setMta(Number(e.target.value))} />
              <span style={S.val}>{mta} deg</span>
              <Tooltip text={mtaTooltipText} visible={ttMTA.visible} />
            </div>
            <div style={{ ...S.cg, position: 'relative' }} onMouseEnter={ttVIAngle.onMouseEnter} onMouseLeave={ttVIAngle.onMouseLeave}>
              <span style={S.label}>V-I angle</span>
              <input style={S.slider} type="range" min="-180" max="180" step="1" value={currentAngle} onChange={(e) => setCurrentAngle(Number(e.target.value))} />
              <span style={S.val}>{currentAngle} deg</span>
              <Tooltip text={viAngleTooltipText} visible={ttVIAngle.visible} />
            </div>
            <div style={S.cg}><span style={S.label}>Fault current</span><input style={S.slider} type="range" min="50" max="5000" step="25" value={currentMag} onChange={(e) => setCurrentMag(Number(e.target.value))} /><span style={S.val}>{currentMag} A</span></div>
            <div style={S.cg}><span style={S.label}>Pickup</span><input style={S.slider} type="range" min="50" max="2000" step="25" value={pickup} onChange={(e) => setPickup(Number(e.target.value))} /><span style={S.val}>{pickup} A</span></div>
            <div style={S.cg}><span style={S.label}>Voltage</span><input style={S.slider} type="range" min="1" max="132" step="0.5" value={voltage} onChange={(e) => setVoltage(Number(e.target.value))} /><span style={S.val}>{voltage} kV</span></div>
          </div>

          <div style={S.results}>
            <div style={{ ...S.ri, cursor: 'default' }} onMouseEnter={ttTorque.onMouseEnter} onMouseLeave={ttTorque.onMouseLeave}>
              <span style={S.rl}>Torque</span>
              <span style={S.rv}>{state.torque.toFixed(3)}</span>
              <Tooltip text={torqueTooltipText} visible={ttTorque.visible} />
            </div>
            <div style={{ ...S.ri, cursor: 'default' }} onMouseEnter={ttDirection.onMouseEnter} onMouseLeave={ttDirection.onMouseLeave}>
              <span style={S.rl}>Direction element</span>
              <span style={{ ...S.rv, color: state.directional ? '#f59e0b' : '#22c55e' }}>{state.directional ? 'Forward permit' : 'Restrain'}</span>
              <Tooltip text={directionTooltipText} visible={ttDirection.visible} />
            </div>
            <div style={{ ...S.ri, cursor: 'default' }} onMouseEnter={ttOC.onMouseEnter} onMouseLeave={ttOC.onMouseLeave}>
              <span style={S.rl}>OC pickup</span>
              <span style={{ ...S.rv, color: state.overcurrent ? '#f59e0b' : '#71717a' }}>{state.overcurrent ? 'Picked up' : 'Below pickup'}</span>
              <Tooltip text={ocTooltipText} visible={ttOC.visible} />
            </div>
            <div style={{ ...S.ri, cursor: 'default' }} onMouseEnter={ttTrip.onMouseEnter} onMouseLeave={ttTrip.onMouseLeave}>
              <span style={S.rl}>Trip logic</span>
              <span style={{ ...S.rv, color: state.operate ? '#ef4444' : '#71717a' }}>{state.operate ? '67 + 51 Trip' : 'No trip'}</span>
              <Tooltip text={tripTooltipText} visible={ttTrip.visible} />
            </div>
            <div style={{ ...S.ri, cursor: 'default' }} onMouseEnter={ttP.onMouseEnter} onMouseLeave={ttP.onMouseLeave}>
              <span style={S.rl}>P (active)</span>
              <span style={{ ...S.rv, color: P >= 0 ? '#22c55e' : '#ef4444' }}>{P.toFixed(1)} kW</span>
              <Tooltip text={pTooltipText} visible={ttP.visible} />
            </div>
            <div style={{ ...S.ri, cursor: 'default' }} onMouseEnter={ttQ.onMouseEnter} onMouseLeave={ttQ.onMouseLeave}>
              <span style={S.rl}>Q (reactive)</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{Q.toFixed(1)} kVAR</span>
              <Tooltip text={qTooltipText} visible={ttQ.visible} />
            </div>
            <div style={{ ...S.ri, cursor: 'default' }} onMouseEnter={ttS.onMouseEnter} onMouseLeave={ttS.onMouseLeave}>
              <span style={S.rl}>S (apparent)</span>
              <span style={{ ...S.rv, color: '#22d3ee' }}>{Sva.toFixed(1)} kVA</span>
              <Tooltip text={`Apparent power S = V \u00D7 I = ${voltage} kV \u00D7 ${currentMag} A = ${Sva.toFixed(1)} kVA`} visible={ttS.visible} />
            </div>
          </div>

          <div style={S.strip}>
            <div style={S.box}><span style={S.boxT}>Directional meaning</span><span style={S.boxV}>Magnitude answers how much current flows.{'\n'}Direction answers whether the fault is ahead or behind the relay.</span></div>
            <div style={S.box}><span style={S.boxT}>MTA choice</span><span style={S.boxV}>Set MTA near the expected fault angle.{'\n'}Wrong MTA reduces sensitivity or even reverses the decision.</span></div>
            <div style={S.box}><span style={S.boxT}>Trip logic</span><span style={S.boxV}>A directional unit usually supervises OC or EF elements.{'\n'}Direction alone should not trip a feeder breaker.</span></div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
