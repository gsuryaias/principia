import React, { useMemo, useState, useCallback } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', color: '#e4e4e7', fontFamily: 'Inter, system-ui, sans-serif' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', cursor: 'pointer', fontSize: 14, fontWeight: 500 }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowX: 'auto', minHeight: 340 },
  controls: { padding: '14px 24px', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center', background: '#111114', borderTop: '1px solid #1e1e2e' },
  cg: { display: 'flex', alignItems: 'center', gap: 10, position: 'relative' },
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
    position: 'absolute', background: '#27272a', border: '1px solid #3f3f46',
    borderRadius: 8, padding: '8px 12px', zIndex: 100, pointerEvents: 'none',
    maxWidth: 340, fontSize: 12, color: '#d4d4d8', lineHeight: 1.5,
    bottom: '100%', left: '50%', transform: 'translateX(-50%)',
    marginBottom: 6, whiteSpace: 'normal',
  },
};

/* Reusable Tooltip component */
function Tooltip({ text, children, style: extraStyle }) {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', gap: 2, cursor: 'default' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{ ...S.tooltip, ...extraStyle }}>{text}</div>
      )}
    </div>
  );
}

function biasPickup(ir, slope1, slope2, knee, pickup) {
  if (ir <= knee) return pickup + slope1 * ir;
  return pickup + slope1 * knee + slope2 * (ir - knee);
}

function computeState({ equipment, scenario, throughCurrent, mismatch, slope1, slope2, knee, harmonicBlock }) {
  let i1 = throughCurrent;
  let i2 = throughCurrent;
  let secondHarmonic = 2;
  let fifthHarmonic = 2;

  if (scenario === 'Internal Fault') {
    i2 = throughCurrent * (equipment === 'Transformer' ? 0.08 : 0.18);
    secondHarmonic = 1;
  } else if (scenario === 'External Fault') {
    i2 = throughCurrent * (1 - mismatch / 100);
  } else if (scenario === 'Load') {
    i2 = throughCurrent * (1 - mismatch / 200);
  } else if (scenario === 'Inrush') {
    i2 = 0;
    secondHarmonic = 18;
    fifthHarmonic = 3;
  } else if (scenario === 'Overexcitation') {
    i2 = 0.2 * throughCurrent;
    secondHarmonic = 4;
    fifthHarmonic = 28;
  }

  const id = Math.abs(i1 - i2);
  const ir = (Math.abs(i1) + Math.abs(i2)) / 2;
  const pickup = equipment === 'Transformer' ? 120 : 80;
  const operateBoundary = biasPickup(ir, slope1, slope2, knee, pickup);
  const harmonicBlocked =
    harmonicBlock && (
      (scenario === 'Inrush' && secondHarmonic >= 15) ||
      (scenario === 'Overexcitation' && fifthHarmonic >= 20)
    );
  const harmonicReason =
    scenario === 'Inrush' && secondHarmonic >= 15
      ? '2nd harmonic inrush restraint'
      : scenario === 'Overexcitation' && fifthHarmonic >= 20
        ? '5th harmonic overexcitation restraint'
        : null;
  const operate = !harmonicBlocked && id > operateBoundary;

  return {
    i1,
    i2,
    id,
    ir,
    pickup,
    operateBoundary,
    secondHarmonic,
    fifthHarmonic,
    harmonicBlocked,
    harmonicReason,
    operate,
    vectorGroup: equipment === 'Transformer' ? 'Dyn11 compensated' : 'No phase-shift compensation',
  };
}

/* SVG: Basic Differential Relay Principle */
function DifferentialPrincipleSVG() {
  return (
    <svg viewBox="0 0 700 260" style={S.svgDiag}>
      <rect width="700" height="260" fill="#09090b" />
      <text x="350" y="20" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">BASIC DIFFERENTIAL RELAY PRINCIPLE (KIRCHHOFF'S CURRENT LAW)</text>
      {/* Protected equipment */}
      <rect x="220" y="60" width="180" height="80" rx="14" fill="#101015" stroke="#a78bfa" strokeWidth="2" />
      <text x="310" y="96" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="700">Protected</text>
      <text x="310" y="114" textAnchor="middle" fill="#a78bfa" fontSize="14" fontWeight="700">Zone</text>
      {/* Left CT */}
      <circle cx="140" cy="100" r="18" fill="#0f172a" stroke="#60a5fa" strokeWidth="2.5" />
      <circle cx="140" cy="100" r="13" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
      <text x="140" y="105" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="700">CT1</text>
      {/* Right CT */}
      <circle cx="480" cy="100" r="18" fill="#052e16" stroke="#22c55e" strokeWidth="2.5" />
      <circle cx="480" cy="100" r="13" fill="none" stroke="#22c55e" strokeWidth="1.5" />
      <text x="480" y="105" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700">CT2</text>
      {/* Primary current lines */}
      <line x1="40" y1="100" x2="122" y2="100" stroke="#60a5fa" strokeWidth="4" />
      <line x1="158" y1="100" x2="220" y2="100" stroke="#60a5fa" strokeWidth="4" />
      <line x1="400" y1="100" x2="462" y2="100" stroke="#22c55e" strokeWidth="4" />
      <line x1="498" y1="100" x2="600" y2="100" stroke="#22c55e" strokeWidth="4" />
      {/* Current flow arrows */}
      <path d="M60,88 L90,88" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrDP)" />
      <text x="75" y="82" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">I1</text>
      <path d="M520,88 L550,88" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrDP2)" />
      <text x="535" y="82" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="600">I2</text>
      {/* Secondary wiring down to relay */}
      <line x1="140" y1="118" x2="140" y2="190" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="480" y1="118" x2="480" y2="190" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="140" y1="190" x2="310" y2="190" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="480" y1="190" x2="310" y2="190" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Relay */}
      <circle cx="310" cy="210" r="24" fill="#18181b" stroke="#6366f1" strokeWidth="3" />
      <text x="310" y="216" textAnchor="middle" fill="#6366f1" fontSize="13" fontWeight="700">87</text>
      {/* Operate label */}
      <text x="310" y="250" textAnchor="middle" fill="#818cf8" fontSize="10">Operates on Id = |I1 - I2|</text>
      {/* Annotations */}
      <g transform="translate(560,160)">
        <rect width="120" height="60" rx="8" fill="#18181b" stroke="#27272a" />
        <text x="10" y="18" fill="#818cf8" fontSize="9" fontWeight="700">Healthy zone:</text>
        <text x="10" y="34" fill="#a1a1aa" fontSize="9">I1 = I2, Id = 0</text>
        <text x="10" y="50" fill="#22c55e" fontSize="9" fontWeight="600">Relay restrained</text>
      </g>
      <defs>
        <marker id="arrDP" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="none" stroke="#60a5fa" strokeWidth="1" /></marker>
        <marker id="arrDP2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="none" stroke="#22c55e" strokeWidth="1" /></marker>
      </defs>
    </svg>
  );
}

/* SVG: Through-Fault vs Internal Fault Current Flow */
function FaultFlowSVG() {
  return (
    <svg viewBox="0 0 700 320" style={S.svgDiag}>
      <rect width="700" height="320" fill="#09090b" />
      <text x="350" y="20" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">THROUGH-FAULT vs INTERNAL FAULT CURRENT FLOW</text>
      {/* Through fault scenario */}
      <text x="350" y="48" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="700">THROUGH (EXTERNAL) FAULT -- RELAY RESTRAINS</text>
      <rect x="200" y="60" width="140" height="50" rx="10" fill="#101015" stroke="#3f3f46" strokeWidth="1.5" />
      <text x="270" y="90" textAnchor="middle" fill="#a1a1aa" fontSize="11">Protected Zone</text>
      {/* CT1 and CT2 for through fault */}
      <circle cx="130" cy="85" r="12" fill="none" stroke="#60a5fa" strokeWidth="2" />
      <text x="130" y="89" textAnchor="middle" fill="#60a5fa" fontSize="8">CT1</text>
      <circle cx="410" cy="85" r="12" fill="none" stroke="#22c55e" strokeWidth="2" />
      <text x="410" y="89" textAnchor="middle" fill="#22c55e" fontSize="8">CT2</text>
      {/* Current lines through */}
      <line x1="40" y1="85" x2="118" y2="85" stroke="#60a5fa" strokeWidth="3" />
      <line x1="142" y1="85" x2="200" y2="85" stroke="#60a5fa" strokeWidth="3" />
      <line x1="340" y1="85" x2="398" y2="85" stroke="#22c55e" strokeWidth="3" />
      <line x1="422" y1="85" x2="480" y2="85" stroke="#22c55e" strokeWidth="3" />
      {/* Arrows showing same magnitude */}
      <path d="M50,75 L80,75" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrFF1)" />
      <text x="65" y="70" textAnchor="middle" fill="#60a5fa" fontSize="9">I</text>
      <path d="M440,75 L470,75" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrFF2)" />
      <text x="455" y="70" textAnchor="middle" fill="#22c55e" fontSize="9">I</text>
      {/* Fault symbol outside */}
      <g transform="translate(510,70)">
        <line x1="0" y1="15" x2="10" y2="0" stroke="#ef4444" strokeWidth="2" />
        <line x1="10" y1="0" x2="20" y2="15" stroke="#ef4444" strokeWidth="2" />
        <text x="28" y="12" fill="#ef4444" fontSize="9">External fault</text>
      </g>
      {/* Result */}
      <text x="270" y="130" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="600">Id = |I - I| = 0 ... Relay restrained</text>

      {/* Internal fault scenario */}
      <text x="350" y="170" textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="700">INTERNAL FAULT -- RELAY OPERATES</text>
      <rect x="200" y="182" width="140" height="50" rx="10" fill="#101015" stroke="#ef4444" strokeWidth="1.5" />
      <text x="270" y="212" textAnchor="middle" fill="#a1a1aa" fontSize="11">Protected Zone</text>
      {/* CT1 and CT2 for internal fault */}
      <circle cx="130" cy="207" r="12" fill="none" stroke="#60a5fa" strokeWidth="2" />
      <text x="130" y="211" textAnchor="middle" fill="#60a5fa" fontSize="8">CT1</text>
      <circle cx="410" cy="207" r="12" fill="none" stroke="#22c55e" strokeWidth="2" />
      <text x="410" y="211" textAnchor="middle" fill="#22c55e" fontSize="8">CT2</text>
      {/* Large current from left */}
      <line x1="40" y1="207" x2="118" y2="207" stroke="#60a5fa" strokeWidth="5" />
      <line x1="142" y1="207" x2="200" y2="207" stroke="#60a5fa" strokeWidth="5" />
      {/* Small or no current from right */}
      <line x1="340" y1="207" x2="398" y2="207" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="422" y1="207" x2="480" y2="207" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Arrows */}
      <path d="M50,197 L80,197" stroke="#60a5fa" strokeWidth="2" markerEnd="url(#arrFF1)" />
      <text x="65" y="192" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="700">Ifault</text>
      <text x="455" y="200" fill="#22c55e" fontSize="9">~0</text>
      {/* Fault inside */}
      <g transform="translate(256,218)">
        <line x1="0" y1="14" x2="8" y2="0" stroke="#ef4444" strokeWidth="2.5" />
        <line x1="8" y1="0" x2="16" y2="14" stroke="#ef4444" strokeWidth="2.5" />
        <text x="24" y="10" fill="#ef4444" fontSize="9" fontWeight="700">FAULT</text>
      </g>
      {/* Result */}
      <text x="270" y="260" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="600">Id = |Ifault - 0| = Ifault ... Relay TRIPS</text>
      {/* Key insight */}
      <g transform="translate(500,220)">
        <rect width="170" height="60" rx="8" fill="#18181b" stroke="#27272a" />
        <text x="10" y="18" fill="#818cf8" fontSize="9" fontWeight="700">Key insight:</text>
        <text x="10" y="34" fill="#a1a1aa" fontSize="9">Internal fault breaks KCL</text>
        <text x="10" y="50" fill="#a1a1aa" fontSize="9">balance in the protected zone.</text>
      </g>
      <defs>
        <marker id="arrFF1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="none" stroke="#60a5fa" strokeWidth="1" /></marker>
        <marker id="arrFF2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="none" stroke="#22c55e" strokeWidth="1" /></marker>
      </defs>
    </svg>
  );
}

/* SVG: Percentage Bias Characteristic */
function BiasCharacteristicSVG() {
  const W = 700, H = 300;
  const ox = 80, oy = 250, pw = 540, ph = 200;
  const xS = (v) => ox + (v / 3000) * pw;
  const yS = (v) => oy - (v / 1500) * ph;
  const pickup = 120;
  const s1 = 0.2, s2 = 0.45, kn = 1000;
  const biasLine = `M${xS(0)},${yS(pickup)} L${xS(kn)},${yS(biasPickup(kn, s1, s2, kn, pickup))} L${xS(3000)},${yS(biasPickup(3000, s1, s2, kn, pickup))}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={S.svgDiag}>
      <rect width={W} height={H} fill="#09090b" />
      <text x={W / 2} y="20" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">PERCENTAGE BIAS CHARACTERISTIC (OPERATE vs RESTRAIN)</text>
      {/* Axes */}
      <line x1={ox} y1={oy - ph - 10} x2={ox} y2={oy} stroke="#3f3f46" strokeWidth="1.5" />
      <line x1={ox} y1={oy} x2={ox + pw + 10} y2={oy} stroke="#3f3f46" strokeWidth="1.5" />
      <text x={ox + pw / 2} y={oy + 28} textAnchor="middle" fill="#71717a" fontSize="10">Restraining current Ir (A)</text>
      <text x={ox - 24} y={oy - ph / 2} textAnchor="middle" fill="#71717a" fontSize="10" transform={`rotate(-90 ${ox - 24} ${oy - ph / 2})`}>Differential current Id (A)</text>
      {/* Grid */}
      {[0, 500, 1000, 1500, 2000, 2500, 3000].map((v) => (
        <g key={`gx${v}`}>
          <line x1={xS(v)} y1={oy} x2={xS(v)} y2={oy - ph} stroke="#18181b" strokeWidth="0.7" />
          <text x={xS(v)} y={oy + 14} textAnchor="middle" fill="#52525b" fontSize="8">{v}</text>
        </g>
      ))}
      {[0, 300, 600, 900, 1200, 1500].map((v) => (
        <g key={`gy${v}`}>
          <line x1={ox} y1={yS(v)} x2={ox + pw} y2={yS(v)} stroke="#18181b" strokeWidth="0.7" />
          <text x={ox - 8} y={yS(v) + 4} textAnchor="end" fill="#52525b" fontSize="8">{v}</text>
        </g>
      ))}
      {/* Operate region fill */}
      <path d={`${biasLine} L${xS(3000)},${yS(1500)} L${xS(0)},${yS(1500)} Z`} fill="rgba(239,68,68,0.08)" />
      {/* Restrain region fill */}
      <path d={`${biasLine} L${xS(3000)},${yS(0)} L${xS(0)},${yS(0)} Z`} fill="rgba(34,197,94,0.08)" />
      {/* Bias line */}
      <path d={biasLine} fill="none" stroke="#f59e0b" strokeWidth="3" />
      {/* Region labels */}
      <text x={xS(800)} y={yS(900)} fill="#ef4444" fontSize="14" fontWeight="700" opacity="0.6">OPERATE</text>
      <text x={xS(1500)} y={yS(200)} fill="#22c55e" fontSize="14" fontWeight="700" opacity="0.6">RESTRAIN</text>
      {/* Slope annotations */}
      <text x={xS(400)} y={yS(biasPickup(400, s1, s2, kn, pickup)) - 14} fill="#f59e0b" fontSize="9">Slope 1 = 20%</text>
      <text x={xS(1800)} y={yS(biasPickup(1800, s1, s2, kn, pickup)) - 14} fill="#f59e0b" fontSize="9">Slope 2 = 45%</text>
      {/* Knee annotation */}
      <circle cx={xS(kn)} cy={yS(biasPickup(kn, s1, s2, kn, pickup))} r="5" fill="#f59e0b" />
      <text x={xS(kn) + 10} y={yS(biasPickup(kn, s1, s2, kn, pickup)) - 8} fill="#f59e0b" fontSize="10" fontWeight="600">Knee point</text>
      {/* Pickup floor */}
      <line x1={ox} y1={yS(pickup)} x2={ox + 30} y2={yS(pickup)} stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3 2" />
      <text x={ox + 36} y={yS(pickup) + 4} fill="#818cf8" fontSize="9">Pickup floor = {pickup} A</text>
    </svg>
  );
}

/* CT Secondary Waveform Panel */
function WaveformPanel({ state, scenario }) {
  const W = 960;
  const H = 200;
  const panelPad = 16;
  const waveW = (W - panelPad * 4) / 3;
  const waveH = 130;
  const waveY = 40;

  const generateWaveform = useCallback((type) => {
    return Array.from({ length: 200 }, (_, i) => {
      const t = (i / 200) * 2 * Math.PI;
      if (type === 'ct1') {
        if (scenario === 'Inrush') {
          // Inrush: asymmetric half-wave with gaps (clipped sine with DC offset)
          const raw = Math.sin(t) + 0.6;
          return raw > 0 ? raw * state.i1 / 1.6 : 0;
        }
        if (scenario === 'Overexcitation') {
          // Peaked waveform with 5th harmonic
          return state.i1 * (Math.sin(t) + 0.28 * Math.sin(5 * t));
        }
        return state.i1 * Math.sin(t);
      }
      if (type === 'ct2') {
        if (scenario === 'Inrush') {
          return 0; // No CT2 current during inrush
        }
        if (scenario === 'Overexcitation') {
          return state.i2 * (Math.sin(t) + 0.1 * Math.sin(5 * t));
        }
        return state.i2 * Math.sin(t);
      }
      // Differential
      if (scenario === 'Inrush') {
        const ct1 = Math.sin(t) + 0.6;
        const v1 = ct1 > 0 ? ct1 * state.i1 / 1.6 : 0;
        return Math.abs(v1);
      }
      if (scenario === 'Overexcitation') {
        const v1 = state.i1 * (Math.sin(t) + 0.28 * Math.sin(5 * t));
        const v2 = state.i2 * (Math.sin(t) + 0.1 * Math.sin(5 * t));
        return Math.abs(v1 - v2);
      }
      return Math.abs(state.i1 * Math.sin(t) - state.i2 * Math.sin(t));
    });
  }, [state.i1, state.i2, scenario]);

  const ct1Points = useMemo(() => generateWaveform('ct1'), [generateWaveform]);
  const ct2Points = useMemo(() => generateWaveform('ct2'), [generateWaveform]);
  const diffPoints = useMemo(() => generateWaveform('diff'), [generateWaveform]);

  const maxAmp = Math.max(state.i1, state.i2, state.id, 100);

  const toPath = (points, offsetX) => {
    const midY = waveY + waveH / 2;
    const scale = (waveH / 2 - 8) / maxAmp;
    return points.map((v, i) => {
      const x = offsetX + (i / 199) * waveW;
      const y = midY - v * scale;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  const diffColor = state.operate ? '#ef4444' : '#22c55e';

  return (
    <div style={{ padding: '0 16px 10px' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', background: '#0c0c0f', borderRadius: 10, border: '1px solid #27272a' }}>
        <text x={W / 2} y="18" textAnchor="middle" fill="#71717a" fontSize="10" fontWeight="700" letterSpacing="0.06em">CT SECONDARY CURRENT WAVEFORMS</text>

        {/* CT1 waveform */}
        {(() => {
          const ox = panelPad;
          const midY = waveY + waveH / 2;
          return (
            <g>
              <rect x={ox} y={waveY - 6} width={waveW} height={waveH + 12} rx="6" fill="#101015" stroke="#1e1e2e" strokeWidth="0.5" />
              <line x1={ox} y1={midY} x2={ox + waveW} y2={midY} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3 2" />
              <text x={ox + 6} y={waveY + 6} fill="#60a5fa" fontSize="9" fontWeight="600">CT1 Secondary (I1={state.i1.toFixed(0)} A)</text>
              <path d={toPath(ct1Points, ox)} fill="none" stroke="#60a5fa" strokeWidth="1.5" />
            </g>
          );
        })()}

        {/* CT2 waveform */}
        {(() => {
          const ox = panelPad * 2 + waveW;
          const midY = waveY + waveH / 2;
          return (
            <g>
              <rect x={ox} y={waveY - 6} width={waveW} height={waveH + 12} rx="6" fill="#101015" stroke="#1e1e2e" strokeWidth="0.5" />
              <line x1={ox} y1={midY} x2={ox + waveW} y2={midY} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3 2" />
              <text x={ox + 6} y={waveY + 6} fill="#22c55e" fontSize="9" fontWeight="600">CT2 Secondary (I2={state.i2.toFixed(0)} A)</text>
              <path d={toPath(ct2Points, ox)} fill="none" stroke="#22c55e" strokeWidth="1.5" />
            </g>
          );
        })()}

        {/* Differential waveform */}
        {(() => {
          const ox = panelPad * 3 + waveW * 2;
          const midY = waveY + waveH / 2;
          return (
            <g>
              <rect x={ox} y={waveY - 6} width={waveW} height={waveH + 12} rx="6" fill="#101015" stroke="#1e1e2e" strokeWidth="0.5" />
              <line x1={ox} y1={midY} x2={ox + waveW} y2={midY} stroke="#27272a" strokeWidth="0.5" strokeDasharray="3 2" />
              <text x={ox + 6} y={waveY + 6} fill={diffColor} fontSize="9" fontWeight="600">Differential |I1-I2| (Id={state.id.toFixed(0)} A)</text>
              <path d={toPath(diffPoints, ox)} fill="none" stroke={diffColor} strokeWidth="1.5" />
            </g>
          );
        })()}

        {/* Scenario label */}
        <text x={W / 2} y={H - 8} textAnchor="middle" fill="#52525b" fontSize="9">
          {scenario === 'Inrush' ? 'Inrush: asymmetric half-wave with DC offset (strong 2nd harmonic)' :
           scenario === 'Overexcitation' ? 'Overexcitation: peaked waveform with 5th harmonic distortion' :
           'Sinusoidal CT secondary currents'}
        </text>
      </svg>
    </div>
  );
}

/* Harmonic Content Bar Chart */
function HarmonicBarChart({ state }) {
  const blockThreshold = 15;
  const bars = [
    { label: 'Fundamental', value: 100, color: '#6366f1' },
    { label: '2nd Harmonic', value: state.secondHarmonic, color: state.secondHarmonic >= blockThreshold ? '#ef4444' : '#22c55e' },
    { label: '5th Harmonic', value: state.fifthHarmonic, color: state.fifthHarmonic >= 20 ? '#f59e0b' : '#22d3ee' },
  ];
  const maxVal = 100;
  const barW = 180;
  const barH = 14;
  const gap = 8;

  return (
    <div style={{ ...S.box, minWidth: 260 }}>
      <span style={S.boxT}>Harmonic Content</span>
      <svg viewBox={`0 0 280 ${bars.length * (barH + gap) + 20}`} style={{ width: '100%', height: 'auto' }}>
        {bars.map((b, i) => {
          const y = i * (barH + gap) + 4;
          const w = Math.min((b.value / maxVal) * barW, barW);
          return (
            <g key={b.label}>
              <text x="0" y={y + barH - 3} fill="#a1a1aa" fontSize="9">{b.label}</text>
              <rect x="90" y={y} width={barW} height={barH} rx="3" fill="#18181b" stroke="#27272a" strokeWidth="0.5" />
              <rect x="90" y={y} width={w} height={barH} rx="3" fill={b.color} opacity="0.7" />
              <text x={90 + w + 4} y={y + barH - 3} fill={b.color} fontSize="9" fontWeight="600">{b.value.toFixed(1)}%</text>
            </g>
          );
        })}
        {/* Blocking threshold dashed line at 15% */}
        {(() => {
          const threshX = 90 + (blockThreshold / maxVal) * barW;
          const totalH = bars.length * (barH + gap);
          return (
            <g>
              <line x1={threshX} y1="0" x2={threshX} y2={totalH} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />
              <text x={threshX + 2} y={totalH + 12} fill="#f59e0b" fontSize="7">Block threshold (15%)</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

function Diagram({ equipment, state, slope1, slope2, knee, scenario }) {
  const W = 1020;
  const H = 460;
  const chart = { x: 590, y: 360, w: 330, h: 260 };
  const xS = (v) => chart.x + (v / 3000) * chart.w;
  const yS = (v) => chart.y - (v / 1800) * chart.h;
  const opColor = state.operate ? '#ef4444' : '#22c55e';
  const bodyLabel = equipment === 'Transformer' ? 'Power Transformer' : 'Turbo Generator';
  const zoneLabel = equipment === 'Transformer' ? '87T / REF protected zone' : '87G protected stator zone';

  // Relay status
  const statusText = state.operate ? 'TRIPPED' : state.harmonicBlocked ? 'BLOCKED' : 'RESTRAINED';
  const statusColor = state.operate ? '#ef4444' : state.harmonicBlocked ? '#f59e0b' : '#22c55e';

  // Operating margin
  const margin = state.id - state.operateBoundary;
  const marginColor = margin > 0 ? '#ef4444' : margin < -50 ? '#22c55e' : '#f59e0b';

  // Margin visual line on bias chart: from operating point to bias line at same Ir
  const opPtX = xS(state.ir);
  const opPtY = yS(state.id);
  const biasAtIr = state.operateBoundary;
  const biasPtY = yS(biasAtIr);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <text x={W / 2} y="24" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="700" letterSpacing="0.08em">
        PERCENTAGE DIFFERENTIAL PROTECTION WITH DUAL-SLOPE BIAS
      </text>

      <g transform="translate(42,70)">
        <rect x="80" y="56" width="250" height="128" rx="18" fill="#101015" stroke="#3f3f46" strokeWidth="2" />
        <text x="205" y="106" textAnchor="middle" fill="#e4e4e7" fontSize="17" fontWeight="700">{bodyLabel}</text>
        <text x="205" y="130" textAnchor="middle" fill="#71717a" fontSize="11">{zoneLabel}</text>

        {/* Animated current flow lines */}
        <line x1="0" y1="120" x2="80" y2="120" stroke="#60a5fa" strokeWidth={Math.max(3, state.i1 / 200)} strokeLinecap="round" />
        <line x1="330" y1="120" x2="410" y2="120" stroke="#22c55e" strokeWidth={Math.max(3, state.i2 / 200)} strokeLinecap="round" />
        {/* Animated flow dots on current paths */}
        {state.i1 > 100 && (
          <circle r="3" fill="#60a5fa">
            <animateMotion dur="1s" repeatCount="indefinite" path="M0,120 L80,120" />
          </circle>
        )}
        {state.i2 > 100 && (
          <circle r="3" fill="#22c55e">
            <animateMotion dur="1s" repeatCount="indefinite" path="M330,120 L410,120" />
          </circle>
        )}
        <circle cx="52" cy="120" r="18" fill="#0f172a" stroke="#60a5fa" strokeWidth="2" />
        <circle cx="358" cy="120" r="18" fill="#052e16" stroke="#22c55e" strokeWidth="2" />
        <text x="52" y="125" textAnchor="middle" fill="#60a5fa" fontSize="10">CT1</text>
        <text x="358" y="125" textAnchor="middle" fill="#22c55e" fontSize="10">CT2</text>
        <text x="18" y="94" fill="#60a5fa" fontSize="11">I1 = {state.i1.toFixed(0)} A</text>
        <text x="292" y="94" fill="#22c55e" fontSize="11">I2 = {state.i2.toFixed(0)} A</text>

        {/* Relay element with status animation */}
        <circle cx="205" cy="250" r="28" fill={state.operate ? '#7f1d1d' : '#172554'} stroke={state.operate ? '#ef4444' : '#60a5fa'} strokeWidth="3" />
        {state.operate && (
          <circle cx="205" cy="250" r="34" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.5">
            <animate attributeName="r" values="34;40;34" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0.1;0.5" dur="0.8s" repeatCount="indefinite" />
          </circle>
        )}
        <text x="205" y="256" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">87</text>
        <line x1="52" y1="138" x2="205" y2="222" stroke="#818cf8" strokeWidth="2.5" />
        <line x1="358" y1="138" x2="205" y2="222" stroke="#818cf8" strokeWidth="2.5" />

        {/* Status badge */}
        <rect x="145" y="288" width="120" height="22" rx="6" fill={`${statusColor}22`} stroke={statusColor} strokeWidth="1.5" />
        <text x="205" y="303" textAnchor="middle" fill={statusColor} fontSize="10" fontWeight="700">{statusText}</text>

        <g transform="translate(0,328)">
          <rect width="420" height="76" rx="12" fill="#101015" stroke="#27272a" />
          <text x="16" y="24" fill="#818cf8" fontSize="11" fontWeight="700">Physical interpretation</text>
          <text x="16" y="44" fill="#a1a1aa" fontSize="11">Scenario = {scenario}</text>
          <text x="16" y="62" fill="#a1a1aa" fontSize="11">Spill current exists only when the protected zone current balance is violated or CTs distort it.</text>
        </g>
      </g>

      <g>
        <line x1={chart.x} y1={chart.y - chart.h} x2={chart.x} y2={chart.y} stroke="#3f3f46" strokeWidth="1.5" />
        <line x1={chart.x} y1={chart.y} x2={chart.x + chart.w} y2={chart.y} stroke="#3f3f46" strokeWidth="1.5" />
        <text x={chart.x + chart.w / 2} y={chart.y + 24} textAnchor="middle" fill="#71717a" fontSize="10">Restraining current Ir (A)</text>
        <text x={chart.x - 18} y={chart.y - chart.h / 2} textAnchor="middle" fill="#71717a" fontSize="10" transform={`rotate(-90 ${chart.x - 18} ${chart.y - chart.h / 2})`}>Differential current Id (A)</text>

        {Array.from({ length: 7 }, (_, i) => i * 500).map((v) => (
          <g key={`x${v}`}>
            <line x1={xS(v)} y1={chart.y - chart.h} x2={xS(v)} y2={chart.y} stroke="#18181b" />
            <text x={xS(v)} y={chart.y + 16} textAnchor="middle" fill="#52525b" fontSize="9">{v}</text>
          </g>
        ))}
        {Array.from({ length: 7 }, (_, i) => i * 300).map((v) => (
          <g key={`y${v}`}>
            <line x1={chart.x} y1={yS(v)} x2={chart.x + chart.w} y2={yS(v)} stroke="#18181b" />
            <text x={chart.x - 8} y={yS(v) + 4} textAnchor="end" fill="#52525b" fontSize="9">{v}</text>
          </g>
        ))}

        {/* Operate region shading */}
        <path
          d={`M${xS(0)},${yS(state.pickup)} L${xS(knee)},${yS(biasPickup(knee, slope1, slope2, knee, state.pickup))} L${xS(3000)},${yS(biasPickup(3000, slope1, slope2, knee, state.pickup))} L${xS(3000)},${yS(1800)} L${xS(0)},${yS(1800)} Z`}
          fill="rgba(239,68,68,0.06)"
        />
        {/* Restrain region shading */}
        <path
          d={`M${xS(0)},${yS(state.pickup)} L${xS(knee)},${yS(biasPickup(knee, slope1, slope2, knee, state.pickup))} L${xS(3000)},${yS(biasPickup(3000, slope1, slope2, knee, state.pickup))} L${xS(3000)},${yS(0)} L${xS(0)},${yS(0)} Z`}
          fill="rgba(34,197,94,0.06)"
        />
        {/* Region labels */}
        <text x={xS(600)} y={yS(1200)} fill="#ef4444" fontSize="11" fontWeight="600" opacity="0.5">OPERATE</text>
        <text x={xS(1800)} y={yS(200)} fill="#22c55e" fontSize="11" fontWeight="600" opacity="0.5">RESTRAIN</text>

        <path
          d={`M${xS(0)},${yS(state.pickup)} L${xS(knee)},${yS(biasPickup(knee, slope1, slope2, knee, state.pickup))} L${xS(3000)},${yS(biasPickup(3000, slope1, slope2, knee, state.pickup))}`}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="3"
        />

        {/* Margin line: vertical from operating point to bias line */}
        <line
          x1={opPtX} y1={opPtY}
          x2={opPtX} y2={biasPtY}
          stroke={marginColor}
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
        {/* Margin arrowheads */}
        {Math.abs(opPtY - biasPtY) > 12 && (
          <g>
            <polygon
              points={`${opPtX - 3},${opPtY + (margin > 0 ? 6 : -6)} ${opPtX + 3},${opPtY + (margin > 0 ? 6 : -6)} ${opPtX},${opPtY}`}
              fill={marginColor}
            />
            <polygon
              points={`${opPtX - 3},${biasPtY + (margin > 0 ? -6 : 6)} ${opPtX + 3},${biasPtY + (margin > 0 ? -6 : 6)} ${opPtX},${biasPtY}`}
              fill={marginColor}
            />
          </g>
        )}
        {/* Margin label */}
        <text
          x={opPtX + 8}
          y={(opPtY + biasPtY) / 2 + 4}
          fill={marginColor}
          fontSize="9"
          fontWeight="600"
        >
          {margin > 0 ? '+' : ''}{margin.toFixed(0)} A
        </text>

        <circle cx={xS(state.ir)} cy={yS(state.id)} r="7" fill={opColor} stroke="#fff" strokeWidth="1.5" />
        <text x={xS(state.ir) + 10} y={yS(state.id) - 10} fill={opColor} fontSize="11" fontWeight="700">
          ({state.ir.toFixed(0)}, {state.id.toFixed(0)})
        </text>
        <text x={xS(knee) + 8} y={yS(biasPickup(knee, slope1, slope2, knee, state.pickup)) - 10} fill="#f59e0b" fontSize="10">Knee</text>

        <g transform="translate(650,52)">
          <rect width="270" height="112" rx="12" fill="#101015" stroke="#27272a" />
          <text x="14" y="24" fill="#a1a1aa" fontSize="11">Pickup floor = {state.pickup.toFixed(0)} A</text>
          <text x="14" y="44" fill="#a1a1aa" fontSize="11">Slope 1 = {(slope1 * 100).toFixed(0)}%</text>
          <text x="14" y="64" fill="#a1a1aa" fontSize="11">Slope 2 = {(slope2 * 100).toFixed(0)}%</text>
          <text x="14" y="84" fill="#a1a1aa" fontSize="11">2nd harmonic = {state.secondHarmonic.toFixed(1)}%</text>
          <text x="14" y="102" fill={opColor} fontSize="11" fontWeight="700">{state.operate ? 'Operate region reached' : state.harmonicBlocked ? 'Harmonic restraint active' : 'Inside restraint region'}</text>
        </g>
      </g>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Biased Differential Protection</h2>
      <p style={S.p}>
        Differential protection applies Kirchhoff's current law directly to the protected zone. For a healthy transformer,
        generator, bus, or motor, the current entering the zone should equal the current leaving the zone after ratio and
        phase compensation. Any sustained spill current indicates an internal fault or a measurement problem.
      </p>
      <span style={S.eq}>Id = |I1 - I2|</span>
      <span style={S.eq}>Ir = (|I1| + |I2|) / 2</span>

      <h3 style={S.h3}>Basic differential relay principle</h3>
      <p style={S.p}>
        The fundamental scheme places a CT on each side of the protected equipment and connects the relay across the
        CT secondaries. Under healthy conditions and external faults, the secondary currents circulate through both CTs
        and no spill current flows through the relay. During an internal fault, the current balance is broken and the
        relay sees the difference.
      </p>
      <DifferentialPrincipleSVG />

      <h3 style={S.h3}>Through-fault versus internal fault</h3>
      <p style={S.p}>
        Understanding the current flow pattern is critical. During an external (through) fault, current flows into and
        out of the protected zone in balance. During an internal fault, most current flows in from one or both sides
        but does not exit, creating a net differential current that the relay detects.
      </p>
      <FaultFlowSVG />

      <h3 style={S.h3}>Why percentage bias is essential</h3>
      <p style={S.p}>
        External through-faults may produce several multiples of rated current. Under those conditions CT errors and CT
        saturation become significant, so a plain differential relay would be too sensitive and could trip incorrectly.
        Percentage bias makes the operating threshold rise with restraining current.
      </p>
      <span style={S.eq}>Operate if Id &gt; pickup + slope x Ir</span>
      <BiasCharacteristicSVG />

      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Characteristic region</th>
            <th style={S.th}>Why it exists</th>
            <th style={S.th}>Practical effect</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}>Low-current pickup floor</td>
            <td style={S.td}>Filters noise, CT mismatch, and minor ratio error</td>
            <td style={S.td}>Improves security under load</td>
          </tr>
          <tr>
            <td style={S.td}>Slope 1</td>
            <td style={S.td}>Normal external-fault and load restraint</td>
            <td style={S.td}>Maintains sensitivity to internal faults</td>
          </tr>
          <tr>
            <td style={S.td}>Slope 2</td>
            <td style={S.td}>Heavy through-fault CT saturation region</td>
            <td style={S.td}>Prevents maloperation at very high Ir</td>
          </tr>
        </tbody>
      </table>

      <h3 style={S.h3}>Transformer-specific complications</h3>
      <ul style={S.ul}>
        <li style={S.li}>Turns-ratio compensation is required so both CT inputs represent the same base current.</li>
        <li style={S.li}>Vector-group phase shift must be compensated, such as the 30 degree shift of Dyn transformers.</li>
        <li style={S.li}>Magnetizing inrush produces large differential current with strong second harmonic, so trip must be restrained.</li>
        <li style={S.li}>Overexcitation is often associated with fifth harmonic and should be distinguished from inrush.</li>
      </ul>

      <h3 style={S.h3}>Generator differential considerations</h3>
      <p style={S.p}>
        Generator differential protection is optimized for stator winding faults inside the zone between terminal CTs and
        neutral-side CTs. It must be fast, sensitive, and secure, and is usually complemented by stator earth-fault,
        rotor earth-fault, negative-sequence, loss-of-excitation, and backup impedance elements.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Indian utility context</span>
        <p style={S.ctxP}>
          Differential protection is standard on major grid transformers and synchronous generators in India.
          Typical numerical platforms include ABB RET/REG series, Siemens 7UT/7UM, GE MiCOM, SEL, and similar relays.
          Second-harmonic blocking around 15% and fifth-harmonic restraint for overexcitation are common engineering values,
          but actual settings follow CT performance, transformer design, and utility studies.
        </p>
      </div>

      <h3 style={S.h3}>Engineering cautions</h3>
      <ul style={S.ul}>
        <li style={S.li}>Too low a slope gives excellent sensitivity but poor stability during external faults.</li>
        <li style={S.li}>Too high a slope improves security but can miss low-level internal faults near the winding ends.</li>
        <li style={S.li}>Harmonic restraint is not a substitute for proper CT selection, saturation study, and ratio compensation.</li>
      </ul>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Y.G. Paithankar and S.R. Bhide, <em>Fundamentals of Power System Protection</em></li>
        <li style={S.li}>J. Lewis Blackburn and Thomas J. Domin, <em>Protective Relaying: Principles and Applications</em></li>
        <li style={S.li}>C.R. Mason, <em>The Art and Science of Protective Relaying</em></li>
        <li style={S.li}>IS 3842 application guidance and CBIP transformer and generator protection manuals</li>
        <li style={S.li}>Practical generator and transformer protection schemes used by NTPC, PGCIL, and state utilities</li>
      </ul>
    </div>
  );
}

export default function DifferentialRelay() {
  const [tab, setTab] = useState('simulate');
  const [equipment, setEquipment] = useState('Transformer');
  const [scenario, setScenario] = useState('Internal Fault');
  const [throughCurrent, setThroughCurrent] = useState(1400);
  const [mismatch, setMismatch] = useState(8);
  const [slope1, setSlope1] = useState(0.2);
  const [slope2, setSlope2] = useState(0.45);
  const [knee, setKnee] = useState(1000);
  const [harmonicBlock, setHarmonicBlock] = useState(true);

  const state = useMemo(
    () => computeState({ equipment, scenario, throughCurrent, mismatch, slope1, slope2, knee, harmonicBlock }),
    [equipment, scenario, throughCurrent, mismatch, slope1, slope2, knee, harmonicBlock]
  );

  const margin = state.id - state.operateBoundary;
  const marginColor = margin > 0 ? '#ef4444' : margin < -50 ? '#22c55e' : '#f59e0b';

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram equipment={equipment} state={state} slope1={slope1} slope2={slope2} knee={knee} scenario={scenario} />
          </div>

          {/* CT Secondary Waveforms */}
          <WaveformPanel state={state} scenario={scenario} />

          <div style={S.controls}>
            <div style={S.cg}><span style={S.label}>Equipment</span><select style={S.sel} value={equipment} onChange={(e) => setEquipment(e.target.value)}><option>Transformer</option><option>Generator</option></select></div>
            <div style={S.cg}><span style={S.label}>Scenario</span><select style={S.sel} value={scenario} onChange={(e) => setScenario(e.target.value)}><option>Load</option><option>Internal Fault</option><option>External Fault</option><option>Inrush</option><option>Overexcitation</option></select></div>
            <Tooltip text="Total current flowing through the protected zone. In a transformer, this represents the load or through-fault current.">
              <div style={S.cg}><span style={S.label}>Through current</span><input style={S.slider} type="range" min="100" max="5000" step="50" value={throughCurrent} onChange={(e) => setThroughCurrent(Number(e.target.value))} /><span style={S.val}>{throughCurrent} A</span></div>
            </Tooltip>
            <div style={S.cg}><span style={S.label}>CT mismatch / sat.</span><input style={S.slider} type="range" min="0" max="40" step="1" value={mismatch} onChange={(e) => setMismatch(Number(e.target.value))} /><span style={S.val}>{mismatch}%</span></div>
            <Tooltip text="Low-current slope for normal operation. Higher slope = more security, less sensitivity.">
              <div style={S.cg}><span style={S.label}>Slope 1</span><input style={S.slider} type="range" min="0.05" max="0.40" step="0.01" value={slope1} onChange={(e) => setSlope1(Number(e.target.value))} /><span style={S.val}>{(slope1 * 100).toFixed(0)}%</span></div>
            </Tooltip>
            <Tooltip text="High-current slope for CT saturation region. Must be higher than Slope 1.">
              <div style={S.cg}><span style={S.label}>Slope 2</span><input style={S.slider} type="range" min="0.2" max="0.8" step="0.01" value={slope2} onChange={(e) => setSlope2(Number(e.target.value))} /><span style={S.val}>{(slope2 * 100).toFixed(0)}%</span></div>
            </Tooltip>
            <div style={S.cg}><span style={S.label}>Knee point</span><input style={S.slider} type="range" min="400" max="2500" step="50" value={knee} onChange={(e) => setKnee(Number(e.target.value))} /><span style={S.val}>{knee} A</span></div>
            <div style={S.cg}><span style={S.label}>Harmonic block</span><input type="checkbox" checked={harmonicBlock} onChange={(e) => setHarmonicBlock(e.target.checked)} /></div>
          </div>

          <div style={S.results}>
            <Tooltip text={`Differential current Id = |I1 - I2| = |${state.i1.toFixed(0)} - ${state.i2.toFixed(0)}| = ${state.id.toFixed(0)} A`}>
              <div style={S.ri}><span style={S.rl}>Id</span><span style={S.rv}>{state.id.toFixed(0)} A</span></div>
            </Tooltip>
            <Tooltip text={`Restraining current Ir = (|I1| + |I2|) / 2 = (${state.i1.toFixed(0)} + ${state.i2.toFixed(0)}) / 2 = ${state.ir.toFixed(0)} A`}>
              <div style={S.ri}><span style={S.rl}>Ir</span><span style={S.rv}>{state.ir.toFixed(0)} A</span></div>
            </Tooltip>
            <Tooltip text={`Operate threshold = pickup + slope * Ir. At Ir=${state.ir.toFixed(0)}: threshold = ${state.pickup.toFixed(0)} + ${slope1}*${state.ir.toFixed(0)} = ${state.operateBoundary.toFixed(0)} A. Relay operates when Id > threshold.`}>
              <div style={S.ri}><span style={S.rl}>Bias pickup</span><span style={S.rv}>{state.operateBoundary.toFixed(0)} A</span></div>
            </Tooltip>
            <Tooltip text={`Second harmonic content = ${state.secondHarmonic.toFixed(1)}%. Inrush blocking threshold typically 15-20%. Current value: ${state.secondHarmonic >= 15 ? 'above' : 'below'} threshold.`}>
              <div style={S.ri}><span style={S.rl}>2nd harmonic</span><span style={S.rv}>{state.secondHarmonic.toFixed(1)}%</span></div>
            </Tooltip>
            <Tooltip text={`Fifth harmonic content = ${state.fifthHarmonic.toFixed(1)}%. Overexcitation restraint commonly uses 5th harmonic supervision.`}>
              <div style={S.ri}><span style={S.rl}>5th harmonic</span><span style={S.rv}>{state.fifthHarmonic.toFixed(1)}%</span></div>
            </Tooltip>
            <div style={S.ri}>
              <span style={S.rl}>Decision</span>
              <span style={{ ...S.rv, color: state.operate ? '#ef4444' : state.harmonicBlocked ? '#f59e0b' : '#22c55e' }}>
                {state.operate ? 'Trip' : state.harmonicBlocked ? 'Blocked' : 'Restrain'}
              </span>
              {state.harmonicBlocked && (
                <span style={{ fontSize: 10, color: '#71717a' }}>{state.harmonicReason}</span>
              )}
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Margin</span>
              <span style={{ ...S.rv, color: marginColor }}>
                {margin > 0 ? '+' : ''}{margin.toFixed(0)} A
              </span>
              <span style={{ fontSize: 10, color: '#71717a' }}>
                {margin > 0 ? 'above operate line' : margin < -50 ? 'safely restrained' : 'marginal'}
              </span>
            </div>
          </div>

          <div style={S.strip}>
            <div style={S.box}><span style={S.boxT}>Protected-zone idea</span><span style={S.boxV}>Healthy zone: Iin approx. Iout.{'\n'}Internal fault: spill current appears.{'\n'}External fault: large through current must still restrain.</span></div>
            <div style={S.box}><span style={S.boxT}>Dual slope</span><span style={S.boxV}>Low slope keeps sensitivity.{'\n'}High slope secures against CT saturation.{'\n'}Knee point splits the two regions.</span></div>
            <HarmonicBarChart state={state} />
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
