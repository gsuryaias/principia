import React, { useMemo, useState } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', color: '#e4e4e7', fontFamily: 'Inter, system-ui, sans-serif' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', cursor: 'pointer', fontSize: 14, fontWeight: 500 }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowX: 'auto', minHeight: 320 },
  controls: { padding: '14px 24px', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center', background: '#111114', borderTop: '1px solid #1e1e2e' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 12, color: '#a1a1aa', fontWeight: 500 },
  slider: { width: 120, accentColor: '#6366f1' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 52, textAlign: 'right' },
  sel: { padding: '6px 10px', borderRadius: 8, background: '#18181b', color: '#e4e4e7', border: '1px solid #27272a' },
  results: { display: 'flex', gap: 26, flexWrap: 'wrap', padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
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
  svgDiag: { width: '100%', margin: '20px 0', borderRadius: 12, overflow: 'hidden' },
};

const CURVES = {
  SI: { label: 'Standard Inverse', color: '#6366f1', fn: (m, tms) => 0.14 * tms / (Math.pow(m, 0.02) - 1) },
  VI: { label: 'Very Inverse', color: '#22c55e', fn: (m, tms) => 13.5 * tms / (m - 1) },
  EI: { label: 'Extremely Inverse', color: '#f59e0b', fn: (m, tms) => 80 * tms / (m * m - 1) },
  LTI: { label: 'Long-Time Inverse', color: '#38bdf8', fn: (m, tms) => 120 * tms / (m - 1) },
  DT: { label: 'Definite Time', color: '#ef4444', fn: (_m, tms) => 0.25 + 2.5 * tms },
};

const CURVE_FORMULAS = {
  SI: (tms, psm, time) => `t = 0.14 \u00d7 TMS / (PSM^0.02 \u2212 1) = 0.14 \u00d7 ${tms.toFixed(3)} / (${psm.toFixed(2)}^0.02 \u2212 1) = ${time} s`,
  VI: (tms, psm, time) => `t = 13.5 \u00d7 TMS / (PSM \u2212 1) = 13.5 \u00d7 ${tms.toFixed(3)} / (${psm.toFixed(2)} \u2212 1) = ${time} s`,
  EI: (tms, psm, time) => `t = 80 \u00d7 TMS / (PSM\u00b2 \u2212 1) = 80 \u00d7 ${tms.toFixed(3)} / (${psm.toFixed(2)}\u00b2 \u2212 1) = ${time} s`,
  LTI: (tms, psm, time) => `t = 120 \u00d7 TMS / (PSM \u2212 1) = 120 \u00d7 ${tms.toFixed(3)} / (${psm.toFixed(2)} \u2212 1) = ${time} s`,
  DT: (tms, _psm, time) => `t = 0.25 + 2.5 \u00d7 TMS = 0.25 + 2.5 \u00d7 ${tms.toFixed(3)} = ${time} s`,
};

const TMS_FAMILY = [0.1, 0.2, 0.3, 0.5, 1.0];
const CT_RATIO_OPTIONS = [50, 100, 200, 300, 400, 500, 600, 800, 1000, 1200];

function relayTime(type, psm, tms) {
  if (psm <= 1) return Infinity;
  return Math.max(CURVES[type].fn(psm, tms), 0.02);
}

/* Reusable Tooltip component */
function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', gap: 2 }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 8,
          background: '#27272a',
          border: '1px solid #3f3f46',
          padding: '8px 12px',
          borderRadius: 8,
          zIndex: 100,
          pointerEvents: 'none',
          whiteSpace: 'pre-wrap',
          fontSize: 12,
          color: '#d4d4d8',
          fontFamily: 'monospace',
          lineHeight: 1.5,
          minWidth: 220,
          maxWidth: 400,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}>
          {text}
        </div>
      )}
    </span>
  );
}

/* SVG: Electromechanical Induction Disc Relay Internal Mechanism */
function InductionDiscSVG() {
  return (
    <svg viewBox="0 0 440 340" style={S.svgDiag}>
      <rect width="440" height="340" fill="#09090b" />
      <text x="220" y="22" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">INDUCTION DISC RELAY -- INTERNAL MECHANISM</text>
      {/* Electromagnet core - upper */}
      <rect x="60" y="50" width="100" height="36" rx="4" fill="#27272a" stroke="#6366f1" strokeWidth="1.5" />
      <text x="110" y="73" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="600">Upper Electromagnet</text>
      {/* Winding coils on upper electromagnet */}
      <path d="M75,86 Q75,96 85,96 Q95,96 95,86" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <path d="M85,86 Q85,96 95,96 Q105,96 105,86" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <path d="M95,86 Q95,96 105,96 Q115,96 115,86" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <path d="M105,86 Q105,96 115,96 Q125,96 125,86" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <text x="100" y="112" textAnchor="middle" fill="#f59e0b" fontSize="9">CT secondary winding</text>
      {/* Lower pole (shaded pole) */}
      <rect x="60" y="230" width="100" height="30" rx="4" fill="#27272a" stroke="#6366f1" strokeWidth="1.5" />
      <text x="110" y="250" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="600">Lower Pole</text>
      {/* Shading ring on lower pole */}
      <rect x="120" y="232" width="26" height="26" rx="4" fill="none" stroke="#22c55e" strokeWidth="2" />
      <text x="133" y="270" textAnchor="middle" fill="#22c55e" fontSize="8">Shading ring</text>
      {/* Aluminium disc */}
      <ellipse cx="110" cy="170" rx="55" ry="14" fill="none" stroke="#e4e4e7" strokeWidth="2.5" />
      <ellipse cx="110" cy="170" rx="55" ry="14" fill="rgba(228,228,231,0.08)" />
      <text x="110" y="174" textAnchor="middle" fill="#e4e4e7" fontSize="10" fontWeight="600">Aluminium Disc</text>
      {/* Spindle / shaft */}
      <line x1="110" y1="120" x2="110" y2="156" stroke="#a1a1aa" strokeWidth="2" />
      <line x1="110" y1="184" x2="110" y2="228" stroke="#a1a1aa" strokeWidth="2" />
      <circle cx="110" cy="170" r="5" fill="#3f3f46" stroke="#a1a1aa" strokeWidth="1.5" />
      <text x="128" y="142" fill="#a1a1aa" fontSize="8">Spindle</text>
      {/* Spiral spring */}
      <path d="M100,142 Q92,132 110,126 Q128,120 120,110" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 2" />
      <text x="75" y="130" fill="#22d3ee" fontSize="8">Spiral spring</text>
      {/* Moving contact arm */}
      <line x1="140" y1="170" x2="210" y2="145" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="210" cy="145" r="5" fill="#ef4444" />
      <text x="220" y="142" fill="#ef4444" fontSize="9" fontWeight="600">Moving contact</text>
      {/* Fixed contact */}
      <circle cx="235" cy="128" r="5" fill="#22c55e" />
      <text x="250" y="126" fill="#22c55e" fontSize="9" fontWeight="600">Fixed contact</text>
      {/* Trip circuit output */}
      <line x1="235" y1="128" x2="280" y2="128" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x="290" y="132" fill="#22c55e" fontSize="9">To trip coil</text>
      {/* Backstop */}
      <rect x="135" y="186" width="30" height="8" rx="2" fill="#3f3f46" stroke="#71717a" strokeWidth="1" />
      <text x="150" y="206" textAnchor="middle" fill="#71717a" fontSize="8">Backstop</text>
      {/* Permanent magnet (drag magnet) */}
      <g transform="translate(220,170)">
        <rect x="0" y="-18" width="60" height="36" rx="6" fill="none" stroke="#ef4444" strokeWidth="1.5" />
        <text x="30" y="-2" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="600">Permanent</text>
        <text x="30" y="10" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="600">Magnet</text>
        <text x="2" y="4" fill="#ef4444" fontSize="11" fontWeight="700">N</text>
        <text x="48" y="4" fill="#3b82f6" fontSize="11" fontWeight="700">S</text>
      </g>
      <text x="280" y="216" fill="#71717a" fontSize="8">(braking / damping torque)</text>
      {/* Flux arrows */}
      <path d="M110,86 L110,120" stroke="#818cf8" strokeWidth="1" markerEnd="url(#arrOC)" strokeDasharray="3 2" />
      <path d="M110,184 L110,228" stroke="#818cf8" strokeWidth="1" markerEnd="url(#arrOC)" strokeDasharray="3 2" />
      <text x="60" y="205" fill="#818cf8" fontSize="8">Flux through disc</text>
      {/* Torque arrow */}
      <path d="M60,170 A50,14 0 0 1 85,160" fill="none" stroke="#22d3ee" strokeWidth="1.5" markerEnd="url(#arrOC)" />
      <text x="32" y="166" fill="#22d3ee" fontSize="8">Driving torque</text>
      {/* Annotations */}
      <g transform="translate(300,50)">
        <rect width="120" height="84" rx="8" fill="#18181b" stroke="#27272a" />
        <text x="10" y="18" fill="#818cf8" fontSize="9" fontWeight="700">Operating Principle</text>
        <text x="10" y="34" fill="#a1a1aa" fontSize="8">Two fluxes displaced</text>
        <text x="10" y="46" fill="#a1a1aa" fontSize="8">in time and space</text>
        <text x="10" y="58" fill="#a1a1aa" fontSize="8">produce eddy currents</text>
        <text x="10" y="70" fill="#a1a1aa" fontSize="8">that create disc torque.</text>
      </g>
      <defs>
        <marker id="arrOC" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="none" stroke="#818cf8" strokeWidth="1" /></marker>
      </defs>
    </svg>
  );
}

/* SVG: CT Connection to Relay in a Feeder Circuit */
function CTConnectionSVG() {
  return (
    <svg viewBox="0 0 700 200" style={S.svgDiag}>
      <rect width="700" height="200" fill="#09090b" />
      <text x="350" y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">CT CONNECTION TO OVERCURRENT RELAY IN A SIMPLE FEEDER</text>
      {/* Source */}
      <circle cx="50" cy="100" r="22" fill="none" stroke="#60a5fa" strokeWidth="2" />
      <text x="50" y="105" textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="700">G</text>
      <text x="50" y="138" textAnchor="middle" fill="#71717a" fontSize="9">Source</text>
      {/* Bus */}
      <line x1="72" y1="100" x2="140" y2="100" stroke="#e4e4e7" strokeWidth="3" />
      {/* Breaker (CB) */}
      <rect x="140" y="86" width="40" height="28" rx="4" fill="#18181b" stroke="#ef4444" strokeWidth="2" />
      <text x="160" y="104" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="600">CB</text>
      {/* Feeder line */}
      <line x1="180" y1="100" x2="280" y2="100" stroke="#e4e4e7" strokeWidth="3" />
      {/* CT symbol */}
      <circle cx="240" cy="100" r="14" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="240" cy="100" r="10" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="240" y="80" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="600">CT</text>
      <text x="240" y="130" textAnchor="middle" fill="#71717a" fontSize="8">Ratio: N1/N2</text>
      {/* Secondary wiring down to relay */}
      <line x1="240" y1="114" x2="240" y2="160" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="240" y1="160" x2="340" y2="160" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* OC Relay */}
      <rect x="340" y="140" width="80" height="40" rx="8" fill="#18181b" stroke="#6366f1" strokeWidth="2" />
      <text x="380" y="157" textAnchor="middle" fill="#6366f1" fontSize="10" fontWeight="700">51 OC</text>
      <text x="380" y="170" textAnchor="middle" fill="#818cf8" fontSize="8">Relay</text>
      {/* Trip signal back to CB */}
      <line x1="340" y1="152" x2="160" y2="152" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="160" y1="114" x2="160" y2="152" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
      <text x="250" y="148" textAnchor="middle" fill="#ef4444" fontSize="8">Trip signal</text>
      {/* Load */}
      <line x1="280" y1="100" x2="430" y2="100" stroke="#e4e4e7" strokeWidth="3" />
      {/* Feeder sections */}
      <line x1="430" y1="100" x2="560" y2="100" stroke="#e4e4e7" strokeWidth="2" strokeDasharray="6 4" />
      {/* Fault location */}
      <g transform="translate(500,70)">
        <line x1="0" y1="30" x2="12" y2="14" stroke="#ef4444" strokeWidth="2.5" />
        <line x1="12" y1="14" x2="0" y2="0" stroke="#ef4444" strokeWidth="2.5" />
        <text x="18" y="20" fill="#ef4444" fontSize="10" fontWeight="700">Fault</text>
      </g>
      {/* Load at end */}
      <rect x="560" y="86" width="40" height="28" rx="4" fill="#18181b" stroke="#22c55e" strokeWidth="1.5" />
      <text x="580" y="104" textAnchor="middle" fill="#22c55e" fontSize="10">Load</text>
      {/* Current flow arrow */}
      <path d="M80,90 L120,90" stroke="#22d3ee" strokeWidth="1.5" markerEnd="url(#arrCT)" />
      <text x="100" y="84" textAnchor="middle" fill="#22d3ee" fontSize="8">Ifault</text>
      <defs>
        <marker id="arrCT" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="none" stroke="#22d3ee" strokeWidth="1" /></marker>
      </defs>
    </svg>
  );
}

/* SVG: Annotated IDMT Curve Family Sketch */
function IDMTCurveFamilySVG() {
  const W = 700, H = 320, ML = 70, PW = 580, PH = 240, MT = 40;
  const xS = (m) => ML + ((Math.log10(m) - Math.log10(1.05)) / (Math.log10(30) - Math.log10(1.05))) * PW;
  const yS = (t) => MT + PH - ((Math.log10(t) - Math.log10(0.05)) / (Math.log10(100) - Math.log10(0.05))) * PH;
  const curvePath = (fn) => {
    const pts = [];
    for (let m = 1.08; m <= 30; m += 0.2) {
      const t = fn(m, 0.3);
      if (t > 0.05 && t < 100) pts.push({ m, t });
    }
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xS(p.m).toFixed(1)},${yS(p.t).toFixed(1)}`).join(' ');
  };
  const curves = [
    { label: 'Standard Inverse (SI)', color: '#6366f1', fn: CURVES.SI.fn },
    { label: 'Very Inverse (VI)', color: '#22c55e', fn: CURVES.VI.fn },
    { label: 'Extremely Inverse (EI)', color: '#f59e0b', fn: CURVES.EI.fn },
    { label: 'Long-Time Inverse (LTI)', color: '#38bdf8', fn: CURVES.LTI.fn },
    { label: 'Definite Time (DT)', color: '#ef4444', fn: CURVES.DT.fn },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={S.svgDiag}>
      <rect width={W} height={H} fill="#09090b" />
      <text x={W / 2} y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">IEC 60255 IDMT CURVE FAMILY (TMS = 0.3)</text>
      {/* Grid */}
      {[0.1, 1, 10, 100].map((t) => (
        <g key={`y${t}`}>
          <line x1={ML} y1={yS(t)} x2={ML + PW} y2={yS(t)} stroke="#1f2937" strokeWidth="0.7" />
          <text x={ML - 8} y={yS(t) + 4} textAnchor="end" fill="#52525b" fontSize="9">{t}</text>
        </g>
      ))}
      {[1.5, 2, 3, 5, 10, 20].map((m) => (
        <g key={`x${m}`}>
          <line x1={xS(m)} y1={MT} x2={xS(m)} y2={MT + PH} stroke="#1f2937" strokeWidth="0.7" />
          <text x={xS(m)} y={MT + PH + 16} textAnchor="middle" fill="#52525b" fontSize="9">{m}</text>
        </g>
      ))}
      {/* Axis labels */}
      <text x={W / 2} y={H - 4} textAnchor="middle" fill="#71717a" fontSize="10">Plug Setting Multiplier (PSM = I/Is)</text>
      <text x="14" y={MT + PH / 2} textAnchor="middle" fill="#71717a" fontSize="10" transform={`rotate(-90 14 ${MT + PH / 2})`}>Operating Time (s) -- log scale</text>
      {/* Curves */}
      {curves.map((c, i) => (
        <g key={i}>
          <path d={curvePath(c.fn)} fill="none" stroke={c.color} strokeWidth="2.5" />
        </g>
      ))}
      {/* Legend */}
      {curves.map((c, i) => (
        <g key={`leg${i}`} transform={`translate(${ML + 10},${MT + 8 + i * 16})`}>
          <line x1="0" y1="0" x2="20" y2="0" stroke={c.color} strokeWidth="2.5" />
          <text x="26" y="4" fill={c.color} fontSize="9">{c.label}</text>
        </g>
      ))}
      {/* Annotation: inverse relationship */}
      <g transform={`translate(${xS(8)},${yS(0.5) - 16})`}>
        <rect x="-4" y="-12" width="150" height="30" rx="6" fill="#18181b" stroke="#27272a" />
        <text x="72" y="6" textAnchor="middle" fill="#c4b5fd" fontSize="9">Higher PSM = faster trip</text>
      </g>
    </svg>
  );
}

function Diagram({ curveType, psm, tms, current, pickup, relayType, showTmsFamily, i2t }) {
  const W = 980, H = 500, ML = 60, MR = 20, MT = 28, MB = 58, PW = W - ML - MR, PH = 246;
  const xS = (m) => ML + ((Math.log10(m) - Math.log10(1.01)) / (Math.log10(20) - Math.log10(1.01))) * PW;
  const yS = (t) => MT + PH - ((Math.log10(t) - Math.log10(0.02)) / (Math.log10(10) - Math.log10(0.02))) * PH;
  const opTime = relayTime(curveType, Math.max(psm, 1.001), tms);

  const curvePath = (type, tmsVal) => {
    const pts = [];
    for (let m = 1.05; m <= 20; m += 0.12) pts.push({ m, t: relayTime(type, m, tmsVal || tms) });
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xS(p.m).toFixed(1)},${yS(Math.min(p.t, 10)).toFixed(1)}`).join(' ');
  };

  const wavePts = Array.from({ length: 260 }, (_, i) => {
    const x = ML + (i / 259) * PW;
    const u = i / 259;
    const amp = u < 0.38 ? 0.3 : Math.min(psm / 7.5, 1.05);
    const y = 384 - amp * Math.sin(u * 10 * Math.PI) * 26;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const pickupState = psm > 1;
  const tripped = pickupState && opTime < 10;

  // Relay status
  const statusColor = tripped ? '#ef4444' : pickupState ? '#f59e0b' : '#22c55e';
  const statusText = tripped ? 'TRIPPED' : pickupState ? 'TIMING' : 'IDLE';

  // Operating point position
  const opX = xS(Math.max(psm, 1.001));
  const opY = yS(Math.min(opTime, 10));

  // Callout box position - offset to the right and up from the dot
  const calloutX = Math.min(opX + 16, W - 150);
  const calloutY = Math.max(opY - 50, MT + 8);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      {/* Trip region shading on curve area */}
      <rect x={ML} y={MT} width={PW} height={PH} fill="#09090b" />
      {/* PSM > 1 region label */}
      <rect x={xS(1.01)} y={MT} width={xS(20) - xS(1.01)} height={PH} fill="rgba(239,68,68,0.04)" />
      <text x={xS(3)} y={MT + 16} fill="rgba(239,68,68,0.5)" fontSize="10" fontWeight="600">TRIP ZONE (PSM &gt; 1)</text>
      {/* PSM <= 1 restrain region */}
      <text x={ML + 8} y={MT + 16} fill="rgba(34,197,94,0.5)" fontSize="10" fontWeight="600">RESTRAIN</text>

      {Array.from({ length: 5 }, (_, i) => 0.02 * Math.pow(10 / 0.02, i / 4)).map((t) => (
        <g key={t}>
          <line x1={ML} y1={yS(t)} x2={ML + PW} y2={yS(t)} stroke="#1f2937" strokeWidth="0.7" />
          <text x={ML - 8} y={yS(t) + 4} textAnchor="end" fontSize="9" fill="#52525b">{t.toFixed(t < 1 ? 2 : 1)}</text>
        </g>
      ))}
      {[1.1, 1.5, 2, 3, 5, 10, 20].map((m) => (
        <g key={m}>
          <line x1={xS(m)} y1={MT} x2={xS(m)} y2={MT + PH} stroke="#1f2937" strokeWidth="0.7" />
          <text x={xS(m)} y={MT + PH + 16} textAnchor="middle" fontSize="9" fill="#52525b">{m}</text>
        </g>
      ))}

      {/* Multi-TMS overlay curves */}
      {showTmsFamily && TMS_FAMILY.map((tmsFam) => (
        <g key={`tms-fam-${tmsFam}`}>
          <path
            d={curvePath(curveType, tmsFam)}
            fill="none"
            stroke={CURVES[curveType].color}
            strokeWidth={Math.abs(tmsFam - tms) < 0.001 ? 3 : 1.2}
            opacity={Math.abs(tmsFam - tms) < 0.001 ? 1 : 0.3}
            strokeDasharray={Math.abs(tmsFam - tms) < 0.001 ? 'none' : '6 3'}
          />
          {/* Label each TMS family curve at PSM ~ 2 */}
          <text
            x={xS(1.8)}
            y={yS(Math.min(relayTime(curveType, 1.8, tmsFam), 10)) - 5}
            fill={CURVES[curveType].color}
            fontSize="8"
            opacity={0.7}
            fontWeight="500"
          >
            TMS={tmsFam}
          </text>
        </g>
      ))}

      {/* Main curves (when TMS family not shown, or non-selected curves) */}
      {Object.entries(CURVES).map(([k, c]) => (
        <path key={k} d={curvePath(k)} fill="none" stroke={c.color} strokeWidth={k === curveType ? 3 : 1.3} opacity={k === curveType ? 1 : (showTmsFamily ? 0.15 : 0.38)} />
      ))}

      {/* Operating point dot */}
      <circle cx={opX} cy={opY} r="6" fill="#fff" stroke={CURVES[curveType].color} strokeWidth="3" />

      {/* Operating point callout annotation */}
      {pickupState && opTime < 10 && (
        <g>
          {/* Leader line from dot to callout */}
          <line x1={opX} y1={opY} x2={calloutX} y2={calloutY + 22} stroke="#71717a" strokeWidth="0.8" strokeDasharray="3 2" />
          {/* Callout box */}
          <rect x={calloutX} y={calloutY} width={130} height={46} rx="6" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
          <text x={calloutX + 8} y={calloutY + 14} fill="#c4b5fd" fontSize="9" fontFamily="monospace">PSM = {psm.toFixed(2)}</text>
          <text x={calloutX + 8} y={calloutY + 28} fill="#c4b5fd" fontSize="9" fontFamily="monospace">t = {opTime.toFixed(3)} s</text>
          <text x={calloutX + 8} y={calloutY + 42} fill="#c4b5fd" fontSize="9" fontFamily="monospace">I{'\u00B2'}t = {i2t < 1e6 ? i2t.toFixed(1) : (i2t / 1e6).toFixed(2) + 'M'} A{'\u00B2'}s</text>
        </g>
      )}

      <line x1={opX} y1={MT} x2={opX} y2={MT + PH} stroke="#71717a" strokeDasharray="5 4" />
      <text x={W / 2} y={H - 152} textAnchor="middle" fill="#71717a" fontSize="10">Plug Setting Multiplier (PSM)</text>
      <text x={16} y={MT + PH / 2} textAnchor="middle" fill="#71717a" fontSize="10" transform={`rotate(-90 16 ${MT + PH / 2})`}>Trip Time (s)</text>

      {/* Relay status indicator */}
      <g transform="translate(670,34)">
        <rect width="270" height="130" rx="10" fill="#101015" stroke="#27272a" />
        {/* Status badge */}
        <rect x="180" y="8" width="76" height="22" rx="6" fill={`${statusColor}22`} stroke={statusColor} strokeWidth="1.5" />
        <text x="218" y="23" textAnchor="middle" fill={statusColor} fontSize="10" fontWeight="700">{statusText}</text>
        {/* Pulsing dot for timing state */}
        {pickupState && !tripped && (
          <circle cx="172" cy="19" r="4" fill="#f59e0b">
            <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
          </circle>
        )}
        {tripped && (
          <circle cx="172" cy="19" r="4" fill="#ef4444">
            <animate attributeName="r" values="4;6;4" dur="0.5s" repeatCount="indefinite" />
          </circle>
        )}
        <text x="14" y="24" fill="#a1a1aa" fontSize="11">Relay: {relayType}</text>
        <text x="14" y="46" fill="#a1a1aa" fontSize="11">Fault current = {current.toFixed(0)} A primary</text>
        <text x="14" y="64" fill="#a1a1aa" fontSize="11">Pickup current = {pickup.toFixed(0)} A primary</text>
        <text x="14" y="82" fill="#a1a1aa" fontSize="11">PSM = {psm.toFixed(2)}</text>
        <text x="14" y="100" fill={CURVES[curveType].color} fontSize="11" fontWeight="700">{CURVES[curveType].label}: {opTime === Infinity ? 'No trip' : `${opTime.toFixed(3)} s`}</text>
        <text x="14" y="118" fill="#71717a" fontSize="10">TMS = {tms.toFixed(2)}</text>
      </g>

      {/* Fault current waveform with annotations */}
      <rect x={ML} y="346" width={PW} height="76" rx="10" fill="#101015" stroke="#27272a" />
      <text x={ML + 14} y="366" fill="#71717a" fontSize="11" fontWeight="700">Fault current waveform</text>
      <path d={wavePts} fill="none" stroke="#60a5fa" strokeWidth="2.2" />
      {/* Animated fault current flow indicator */}
      {pickupState && (
        <circle r="4" fill="#60a5fa">
          <animateMotion dur="2s" repeatCount="indefinite" path={wavePts} />
        </circle>
      )}
      <line x1={ML + PW * 0.38} y1="350" x2={ML + PW * 0.38} y2="418" stroke="#ef4444" strokeDasharray="4 4" />
      <text x={ML + PW * 0.38 + 8} y="362" fill="#ef4444" fontSize="9">Fault inception</text>
      <text x={ML + 20} y="402" fill="#a1a1aa" fontSize="11">Before pickup: load current below PS. After pickup: timer follows selected {relayType === 'Numerical' ? 'IEC curve in firmware' : 'disc torque characteristic'}.</text>

      {/* Curve family legend */}
      <g transform="translate(670,180)">
        <rect width="270" height="100" rx="10" fill="#101015" stroke="#27272a" />
        <text x="14" y="18" fill="#818cf8" fontSize="10" fontWeight="700">CURVE FAMILY</text>
        {Object.entries(CURVES).map(([k, c], i) => (
          <g key={k}>
            <line x1="14" y1={34 + i * 14} x2="34" y2={34 + i * 14} stroke={c.color} strokeWidth={k === curveType ? 3 : 1.5} />
            <text x="40" y={38 + i * 14} fill={k === curveType ? c.color : '#71717a'} fontSize="10" fontWeight={k === curveType ? '700' : '400'}>{c.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Overcurrent and IDMT Relay Characteristic</h2>
      <p style={S.p}>
        Overcurrent protection is the fundamental protection method for radial feeders. It does not infer fault distance directly.
        Instead, it compares measured current with a preset pickup threshold and, when current exceeds that threshold,
        issues a trip after a time determined by the selected relay characteristic.
      </p>

      <h3 style={S.h3}>Electromechanical induction disc relay</h3>
      <p style={S.p}>
        The classical overcurrent relay uses an aluminium disc rotating between two electromagnets. The interaction of
        fluxes displaced in time and space by the shading ring produces eddy currents in the disc, generating a driving
        torque proportional to the square of the current. A permanent magnet provides braking torque, and the spiral spring
        provides the reset force. The disc travel from backstop to the moving contact determines the operating time.
      </p>
      <InductionDiscSVG />

      <h3 style={S.h3}>CT connection in a feeder protection scheme</h3>
      <p style={S.p}>
        The relay is connected to the secondary of a current transformer (CT) installed on the protected feeder.
        The CT steps down the primary fault current to a measurable level. The relay trip output energises the
        circuit breaker trip coil to isolate the faulted section.
      </p>
      <CTConnectionSVG />

      <h3 style={S.h3}>Pickup, plug setting, and PSM</h3>
      <p style={S.p}>
        In feeder protection, the relay sees CT secondary current, not primary current. The plug setting determines the minimum secondary current
        at which the relay will start timing. The fault current divided by pickup current is the plug setting multiplier:
      </p>
      <span style={S.eq}>PSM = Ifault / Ipickup</span>
      <p style={S.p}>
        If PSM is less than or equal to 1, the relay should not trip. Once PSM exceeds 1, the relay enters pickup and the time element begins.
      </p>

      <h3 style={S.h3}>IEC inverse-time characteristics</h3>
      <span style={S.eq}>SI: t = 0.14 x TMS / (PSM^0.02 - 1)</span>
      <span style={S.eq}>VI: t = 13.5 x TMS / (PSM - 1)</span>
      <span style={S.eq}>EI: t = 80 x TMS / (PSM^2 - 1)</span>
      <p style={S.p}>
        The physical idea is simple: higher fault current should clear faster, because severe faults cause more thermal and electromechanical stress.
        Inverse-time curves satisfy that requirement while still leaving enough time margin for downstream relays to operate first.
      </p>
      <IDMTCurveFamilySVG />

      <h3 style={S.h3}>What TMS actually does</h3>
      <p style={S.p}>
        The Time Multiplier Setting scales the operating time without changing the characteristic family itself. Protection engineers use TMS
        to coordinate multiple relays in series. The downstream relay is given the smallest acceptable time, and upstream relays are delayed above it
        by the required coordination time interval.
      </p>

      <h3 style={S.h3}>Electromechanical versus numerical relays</h3>
      <ul style={S.ul}>
        <li style={S.li}>Electromechanical IDMT relays achieved inverse timing through induction-disc torque and disc travel.</li>
        <li style={S.li}>Numerical relays implement the same curve equations in software and add event recording, communication, oscillography, and self-diagnostics.</li>
        <li style={S.li}>The underlying coordination concept remains the same even though the hardware is different.</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>Indian feeder practice</span>
        <p style={S.ctxP}>
          At 11 kV and 33 kV in India, overcurrent and earth-fault elements remain the backbone of radial feeder protection.
          Typical feeder IEDs include ABB REF615, Siemens 7SJ, Easun Reyrolle, L&amp;T and similar devices. CT secondary rating is commonly 1 A for protection.
          Plug setting is often chosen near full-load current with margin, and TMS is selected through coordination studies using CBIP practice.
        </p>
      </div>

      <h3 style={S.h3}>Design tradeoffs</h3>
      <ul style={S.ul}>
        <li style={S.li}>Low pickup improves sensitivity but risks nuisance operation during overload or cold-load pickup.</li>
        <li style={S.li}>High TMS improves grading but increases fault clearing time and damage energy.</li>
        <li style={S.li}>Very inverse and extremely inverse curves are useful where fault current falls sharply with distance, such as distribution feeders or transformer-backed circuits.</li>
      </ul>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>IEC 60255 relay characteristic definitions</li>
        <li style={S.li}>Y.G. Paithankar and S.R. Bhide — <em>Fundamentals of Power System Protection</em></li>
        <li style={S.li}>J. Lewis Blackburn and Thomas J. Domin — <em>Protective Relaying: Principles and Applications</em></li>
        <li style={S.li}>CBIP Manual on Protective Relays and Co-ordination</li>
        <li style={S.li}>B.L. Theraja and A.K. Theraja — <em>A Textbook of Electrical Technology, Vol. III</em></li>
      </ul>
    </div>
  );
}

export default function OvercurrentRelay() {
  const [tab, setTab] = useState('simulate');
  const [curveType, setCurveType] = useState('SI');
  const [ps, setPs] = useState(1);
  const [tms, setTms] = useState(0.15);
  const [ctRatio, setCtRatio] = useState(200);
  const [faultCurrent, setFaultCurrent] = useState(1200);
  const [relayType, setRelayType] = useState('Numerical');
  const [showTmsFamily, setShowTmsFamily] = useState(false);

  const pickup = ps * ctRatio;
  const psm = faultCurrent / Math.max(pickup, 1);
  const operatingTime = relayTime(curveType, psm, tms);
  const pickupState = psm > 1;
  const tripState = pickupState && operatingTime < Infinity;
  const delayedTrip = tripState && operatingTime >= 10;

  // I2t energy calculation
  const i2tRaw = operatingTime === Infinity ? 0 : faultCurrent * faultCurrent * operatingTime;
  const i2tMA2s = i2tRaw / 1e6; // Convert to MA2s
  const i2tColor = i2tMA2s < 10 ? '#22c55e' : i2tMA2s < 50 ? '#f59e0b' : '#ef4444';
  const i2tLabel = i2tMA2s < 10 ? 'LOW' : i2tMA2s < 50 ? 'MODERATE' : 'SEVERE';

  const timeStr = operatingTime === Infinity ? 'No trip' : operatingTime.toFixed(3);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram curveType={curveType} psm={psm} tms={tms} current={faultCurrent} pickup={pickup} relayType={relayType} showTmsFamily={showTmsFamily} i2t={i2tRaw} />
          </div>

          <div style={S.controls}>
            <div style={S.cg}><span style={S.label}>Curve family</span><select style={S.sel} value={curveType} onChange={(e) => setCurveType(e.target.value)}>{Object.entries(CURVES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
            <div style={S.cg}><span style={S.label}>Relay type</span><select style={S.sel} value={relayType} onChange={(e) => setRelayType(e.target.value)}><option>Electromechanical</option><option>Numerical</option></select></div>
            <div style={S.cg}>
              <Tooltip text={`Plug Setting = fraction of CT secondary rating.\nPickup = PS \u00d7 CT ratio = ${ps.toFixed(2)} \u00d7 ${ctRatio} = ${pickup.toFixed(0)} A`}>
                <span style={S.label}>Plug setting</span>
              </Tooltip>
              <input style={S.slider} type="range" min="0.25" max="2.5" step="0.05" value={ps} onChange={(e) => setPs(Number(e.target.value))} /><span style={S.val}>{ps.toFixed(2)} pu</span>
            </div>
            <div style={S.cg}>
              <Tooltip text="Time Multiplier Setting scales the operating time. Higher TMS = slower trip.">
                <span style={S.label}>TMS</span>
              </Tooltip>
              <input style={S.slider} type="range" min="0.025" max="1.2" step="0.005" value={tms} onChange={(e) => setTms(Number(e.target.value))} /><span style={S.val}>{tms.toFixed(3)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>CT ratio</span>
              <select style={S.sel} value={ctRatio} onChange={(e) => setCtRatio(Number(e.target.value))}>
                {CT_RATIO_OPTIONS.map((r) => <option key={r} value={r}>{r}/1</option>)}
              </select>
            </div>
            <div style={S.cg}><span style={S.label}>Fault current</span><input style={S.slider} type="range" min="50" max="10000" step="50" value={faultCurrent} onChange={(e) => setFaultCurrent(Number(e.target.value))} /><span style={S.val}>{faultCurrent.toFixed(0)} A</span></div>
            <div style={S.cg}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#a1a1aa', fontWeight: 500, cursor: 'pointer' }}>
                <input type="checkbox" checked={showTmsFamily} onChange={(e) => setShowTmsFamily(e.target.checked)} style={{ accentColor: '#6366f1' }} />
                Show TMS family
              </label>
            </div>
          </div>

          <div style={S.results}>
            <div style={S.ri}><span style={S.rl}>Pickup current</span><span style={S.rv}>{pickup.toFixed(0)} A</span></div>
            <Tooltip text={`PSM = Ifault / Ipickup = ${faultCurrent.toFixed(0)} / ${pickup.toFixed(0)} = ${psm.toFixed(2)}`}>
              <div style={S.ri}><span style={S.rl}>PSM</span><span style={S.rv}>{psm.toFixed(2)}</span></div>
            </Tooltip>
            <Tooltip text={operatingTime === Infinity ? 'PSM \u2264 1, relay does not operate.' : CURVE_FORMULAS[curveType](tms, psm, timeStr)}>
              <div style={S.ri}><span style={S.rl}>Operate time</span><span style={S.rv}>{operatingTime === Infinity ? 'No trip' : `${operatingTime.toFixed(3)} s`}</span></div>
            </Tooltip>
            <div style={S.ri}><span style={S.rl}>Pickup</span><span style={{ ...S.rv, color: pickupState ? '#f59e0b' : '#71717a' }}>{pickupState ? 'Yes' : 'No'}</span></div>
            <div style={S.ri}>
              <span style={S.rl}>Trip decision</span>
              <span style={{ ...S.rv, color: tripState ? (delayedTrip ? '#f59e0b' : '#ef4444') : '#71717a' }}>
                {tripState ? (delayedTrip ? 'Trip (delayed)' : 'Trip') : 'Restrain'}
              </span>
            </div>
          </div>

          {/* I2t Energy Row */}
          <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', padding: '10px 24px', background: '#0a0a0e', borderTop: '1px solid #1e1e2e', alignItems: 'center' }}>
            <Tooltip text={`I\u00B2t = Ifault\u00B2 \u00d7 t = ${faultCurrent.toFixed(0)}\u00B2 \u00d7 ${timeStr} = ${i2tRaw.toFixed(1)} A\u00B2s. This determines conductor and equipment thermal damage.`}>
              <div style={S.ri}>
                <span style={S.rl}>Fault energy (I{'\u00B2'}t)</span>
                <span style={S.rv}>
                  {operatingTime === Infinity ? '\u2014' : `${i2tMA2s.toFixed(2)} MA\u00B2s`}
                </span>
              </div>
            </Tooltip>
            <div style={S.ri}>
              <span style={S.rl}>Thermal damage</span>
              <span style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'monospace',
                background: `${i2tColor}18`,
                color: i2tColor,
                border: `1px solid ${i2tColor}44`,
              }}>
                {operatingTime === Infinity ? '\u2014' : i2tLabel}
              </span>
            </div>
            <div style={{ ...S.ri, flex: 1 }}>
              <span style={{ fontSize: 11, color: '#52525b', lineHeight: 1.5 }}>
                {operatingTime !== Infinity && i2tMA2s < 10 && 'Thermal stress within safe limits for typical cables and equipment.'}
                {operatingTime !== Infinity && i2tMA2s >= 10 && i2tMA2s < 50 && 'Elevated thermal stress -- verify cable withstand and consider reducing TMS or fault level.'}
                {operatingTime !== Infinity && i2tMA2s >= 50 && 'Severe thermal damage risk -- protection too slow for this fault level. Reduce TMS or use faster curve.'}
                {operatingTime === Infinity && 'No trip -- I\u00B2t not applicable.'}
              </span>
            </div>
          </div>

          <div style={S.strip}>
            <div style={S.box}><span style={S.boxT}>Selected curve</span><span style={S.boxV}>{CURVES[curveType].label}{'\n'}Best understood as: larger PSM means smaller trip time.</span></div>
            <div style={S.box}><span style={S.boxT}>Protection meaning</span><span style={S.boxV}>If PSM is less than or equal to 1 the relay must restrain.{'\n'}If PSM is greater than 1 the timing element starts.{'\n'}Trip occurs after the computed delay.</span></div>
            <div style={S.box}><span style={S.boxT}>Engineering note</span><span style={S.boxV}>The same curve family is often reused for feeder OC and transformer backup protection, but settings are coordinated differently.</span></div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
