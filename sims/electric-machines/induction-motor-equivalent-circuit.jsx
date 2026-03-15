import React, { useMemo, useState } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 12, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 120, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 56, textAlign: 'right' },
  results: { display: 'flex', gap: 26, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  strip: { display: 'flex', gap: 12, padding: '12px 24px', background: '#0f0f12', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  box: { flex: '1 1 180px', padding: '12px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 10 },
  boxT: { display: 'block', fontSize: 10, color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 },
  boxV: { display: 'block', fontSize: 13, color: '#c4b5fd', fontFamily: 'monospace', lineHeight: 1.6 },
  theory: { flex: 1, padding: '32px 24px', maxWidth: 860, margin: '0 auto', overflowY: 'auto', width: '100%' },
  h2: { fontSize: 22, fontWeight: 700, color: '#f4f4f5', margin: '34px 0 14px', paddingBottom: 8, borderBottom: '1px solid #27272a' },
  h3: { fontSize: 17, fontWeight: 600, color: '#e4e4e7', margin: '24px 0 10px' },
  p: { fontSize: 15, lineHeight: 1.8, color: '#a1a1aa', margin: '0 0 14px' },
  eq: { display: 'block', padding: '14px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontFamily: 'monospace', fontSize: 15, color: '#c4b5fd', margin: '16px 0', textAlign: 'center', overflowX: 'auto' },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14, display: 'block' },
  ctxP: { fontSize: 14, lineHeight: 1.7, color: '#a1a1aa', margin: 0 },
  svgDiagram: { width: '100%', margin: '20px 0', background: '#0d0d11', border: '1px solid #27272a', borderRadius: 12, padding: 0 },
};

const SQRT3 = Math.sqrt(3);

const cAdd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const cMul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cDiv = (a, b) => {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
const cAbs = (a) => Math.hypot(a[0], a[1]);
const cConj = (a) => [a[0], -a[1]];
const cParallel = (a, b) => cDiv(cMul(a, b), cAdd(a, b));

function compute(Vll, R1, X1, R2, X2, Xm, Rc, slip) {
  const s = Math.max(slip, 0.005);
  const Vph = Vll / SQRT3;
  const Z1 = [R1, X1];
  const Zm = cParallel([Rc, 0], [0, Xm]);
  const Z2 = [R2 / s, X2];
  const Zp = cParallel(Zm, Z2);
  const Zin = cAdd(Z1, Zp);
  const I1 = cDiv([Vph, 0], Zin);
  const Vgap = cMul(I1, Zp);
  const Icore = cDiv(Vgap, [Rc, 0]);
  const Imag = cDiv(Vgap, [0, Xm]);
  const Im = cAdd(Icore, Imag);
  const I2 = cDiv(Vgap, Z2);
  const Sin = cMul([3 * Vph, 0], cConj(I1));
  const Pin = Sin[0];
  const Qin = Sin[1];
  const Pscu = 3 * cAbs(I1) * cAbs(I1) * R1;
  const Pcore = 3 * cAbs(Vgap) * cAbs(Vgap) / Rc;
  const Pag = 3 * cAbs(I2) * cAbs(I2) * (R2 / s);
  const Prcu = 3 * cAbs(I2) * cAbs(I2) * R2;
  const Pconv = Pag - Prcu;
  const eta = Pin > 1 ? (Pconv / Pin) * 100 : 0;
  const pf = Pin / Math.max(Math.hypot(Pin, Qin), 1e-6);
  return {
    Vph,
    I1,
    Im,
    I2,
    Imag,
    Icore,
    Pin,
    Qin,
    Pscu,
    Pcore,
    Pag,
    Prcu,
    Pconv,
    eta,
    pf,
    Zin,
    s,
  };
}

function donutPath(cx, cy, r1, r2, a0, a1) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const x1o = cx + r2 * Math.cos(a0);
  const y1o = cy + r2 * Math.sin(a0);
  const x2o = cx + r2 * Math.cos(a1);
  const y2o = cy + r2 * Math.sin(a1);
  const x1i = cx + r1 * Math.cos(a1);
  const y1i = cy + r1 * Math.sin(a1);
  const x2i = cx + r1 * Math.cos(a0);
  const y2i = cy + r1 * Math.sin(a0);
  return `M${x1o},${y1o} A${r2},${r2} 0 ${large} 1 ${x2o},${y2o} L${x1i},${y1i} A${r1},${r1} 0 ${large} 0 ${x2i},${y2i} Z`;
}

function Diagram({ data }) {
  const W = 980;
  const H = 400;
  const vals = [
    { label: 'Stator Cu', value: Math.max(data.Pscu, 0), color: '#ef4444' },
    { label: 'Core loss', value: Math.max(data.Pcore, 0), color: '#3b82f6' },
    { label: 'Rotor Cu', value: Math.max(data.Prcu, 0), color: '#f59e0b' },
    { label: 'Converted', value: Math.max(data.Pconv, 0), color: '#22c55e' },
  ];
  const total = vals.reduce((s, v) => s + v.value, 0) || 1;
  let a = -Math.PI / 2;

  // Animated power flow arrow scaling
  const flowScale = Math.max(data.Pin, 1);
  const agFrac = data.Pag / flowScale;
  const convFrac = data.Pconv / flowScale;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <defs>
        <marker id="arrow-pf" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <polygon points="0,0 10,5 0,10" fill="#818cf8" />
        </marker>
        <marker id="arrow-green" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <polygon points="0,0 10,5 0,10" fill="#22c55e" />
        </marker>
        <marker id="arrow-red" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <polygon points="0,0 10,5 0,10" fill="#ef4444" />
        </marker>
        <marker id="arrow-amber" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <polygon points="0,0 10,5 0,10" fill="#f59e0b" />
        </marker>
        <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <polygon points="0,0 10,5 0,10" fill="#3b82f6" />
        </marker>
      </defs>

      <text x="300" y="34" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="700" letterSpacing="0.07em">
        PER-PHASE APPROXIMATE EQUIVALENT CIRCUIT
      </text>
      <line x1="86" y1="178" x2="150" y2="178" stroke="#d4d4d8" strokeWidth="2" />
      <circle cx="76" cy="178" r="10" fill="none" stroke="#6366f1" strokeWidth="2" />
      <text x="76" y="183" textAnchor="middle" fill="#a5b4fc" fontSize="10">V</text>

      <rect x="150" y="158" width="72" height="40" rx="8" fill="#111114" stroke="#ef4444" />
      <text x="186" y="182" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="700">R1</text>
      <text x="186" y="208" textAnchor="middle" fill="#71717a" fontSize="9">{data.Pscu > 0 ? (data.Pscu/1000).toFixed(2) + ' kW' : ''}</text>
      <rect x="240" y="158" width="72" height="40" rx="8" fill="#111114" stroke="#f59e0b" />
      <text x="276" y="182" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="700">jX1</text>
      <line x1="312" y1="178" x2="384" y2="178" stroke="#d4d4d8" strokeWidth="2" />

      <line x1="384" y1="92" x2="384" y2="270" stroke="#d4d4d8" strokeWidth="2" />
      <line x1="384" y1="92" x2="606" y2="92" stroke="#d4d4d8" strokeWidth="2" />
      <line x1="384" y1="270" x2="606" y2="270" stroke="#d4d4d8" strokeWidth="2" />
      <line x1="606" y1="92" x2="606" y2="270" stroke="#d4d4d8" strokeWidth="2" />

      {/* Air gap divider */}
      <line x1="495" y1="80" x2="495" y2="282" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" />
      <text x="495" y="74" textAnchor="middle" fill="#6366f1" fontSize="9" opacity="0.6">AIR GAP</text>

      <rect x="350" y="122" width="68" height="40" rx="8" fill="#111114" stroke="#3b82f6" />
      <text x="384" y="146" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="700">jXm</text>

      {/* Rc branch */}
      <rect x="350" y="200" width="68" height="40" rx="8" fill="#111114" stroke="#60a5fa" />
      <text x="384" y="224" textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="700">Rc</text>
      <text x="384" y="250" textAnchor="middle" fill="#71717a" fontSize="9">{data.Pcore > 0 ? (data.Pcore/1000).toFixed(2) + ' kW' : ''}</text>

      <rect x="522" y="122" width="68" height="40" rx="8" fill="#111114" stroke="#22c55e" />
      <text x="556" y="146" textAnchor="middle" fill="#22c55e" fontSize="12" fontWeight="700">R2'/s</text>
      <rect x="522" y="198" width="68" height="40" rx="8" fill="#111114" stroke="#14b8a6" />
      <text x="556" y="222" textAnchor="middle" fill="#14b8a6" fontSize="12" fontWeight="700">jX2'</text>

      {/* Power flow arrows along the bottom */}
      <line x1="606" y1="178" x2="704" y2="178" stroke="#d4d4d8" strokeWidth="2" />
      <line x1="704" y1="178" x2="770" y2="178" stroke="#22c55e" strokeWidth={Math.max(2, convFrac * 10)} markerEnd="url(#arrow-green)" />
      <text x="783" y="172" fill="#22c55e" fontSize="12" fontWeight="700">Pconv</text>
      <text x="783" y="188" fill="#22c55e" fontSize="10">{(data.Pconv / 1000).toFixed(2)} kW</text>

      {/* Power flow annotations */}
      <g transform="translate(60,290)">
        <rect width="660" height="42" rx="8" fill="#101015" stroke="#27272a" opacity="0.9" />
        <line x1="20" y1="21" x2="120" y2="21" stroke="#818cf8" strokeWidth={Math.max(2, 8)} markerEnd="url(#arrow-pf)" />
        <text x="70" y="16" textAnchor="middle" fill="#818cf8" fontSize="9" fontWeight="600">Pin</text>
        {/* Stator Cu loss branch off */}
        <line x1="130" y1="21" x2="130" y2="8" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrow-red)" />
        <text x="148" y="10" fill="#ef4444" fontSize="8">Pscu</text>
        {/* Core loss branch off */}
        <line x1="190" y1="21" x2="190" y2="8" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow-blue)" />
        <text x="208" y="10" fill="#3b82f6" fontSize="8">Pcore</text>
        {/* Air gap power */}
        <line x1="140" y1="21" x2="350" y2="21" stroke="#a78bfa" strokeWidth={Math.max(2, agFrac * 8)} markerEnd="url(#arrow-pf)" />
        <text x="245" y="16" textAnchor="middle" fill="#a78bfa" fontSize="9" fontWeight="600">Pag</text>
        {/* Rotor Cu loss */}
        <line x1="360" y1="21" x2="360" y2="8" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow-amber)" />
        <text x="378" y="10" fill="#f59e0b" fontSize="8">Prcu</text>
        {/* Converted */}
        <line x1="370" y1="21" x2="540" y2="21" stroke="#22c55e" strokeWidth={Math.max(2, convFrac * 8)} markerEnd="url(#arrow-green)" />
        <text x="455" y="16" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="600">Pconv = Pag(1-s)</text>
        {/* Mechanical output */}
        <line x1="550" y1="21" x2="640" y2="21" stroke="#22d3ee" strokeWidth={Math.max(1.5, convFrac * 6)} markerEnd="url(#arrow-pf)" />
        <text x="595" y="16" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="600">Pmech - Prot</text>
      </g>

      <line x1="94" y1="138" x2="312" y2="138" stroke="#818cf8" strokeWidth={Math.max(2, cAbs(data.I1) * 0.75)} markerEnd="url(#arrow-pf)" />
      <text x="196" y="128" textAnchor="middle" fill="#818cf8" fontSize="11" fontWeight="700">I1 = {cAbs(data.I1).toFixed(2)} A</text>
      <line x1="420" y1="106" x2="420" y2="244" stroke="#60a5fa" strokeWidth={Math.max(2, cAbs(data.Im) * 0.6)} markerEnd="url(#arrow-pf)" />
      <text x="432" y="148" fill="#60a5fa" fontSize="11" fontWeight="700">Ic + Im</text>
      <line x1="570" y1="106" x2="570" y2="244" stroke="#34d399" strokeWidth={Math.max(2, cAbs(data.I2) * 0.6)} markerEnd="url(#arrow-pf)" />
      <text x="582" y="148" fill="#34d399" fontSize="11" fontWeight="700">I2'</text>

      <text x="835" y="34" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="700" letterSpacing="0.07em">
        POWER FLOW BREAKDOWN
      </text>
      <circle cx="835" cy="178" r="92" fill="#101015" stroke="#27272a" />
      <circle cx="835" cy="178" r="44" fill="#09090b" />
      {vals.map((seg) => {
        const sweep = (seg.value / total) * Math.PI * 2;
        const path = donutPath(835, 178, 44, 92, a, a + sweep);
        a += sweep;
        return <path key={seg.label} d={path} fill={seg.color} opacity="0.9" />;
      })}
      <text x="835" y="170" textAnchor="middle" fill="#f4f4f5" fontSize="13" fontWeight="700">Pin</text>
      <text x="835" y="188" textAnchor="middle" fill="#c4b5fd" fontSize="16" fontWeight="700">{(data.Pin / 1000).toFixed(1)} kW</text>
      {vals.map((seg, i) => (
        <g key={seg.label} transform={`translate(762, ${286 + i * 24})`}>
          <rect width="12" height="12" rx="3" fill={seg.color} />
          <text x="20" y="10" fill="#a1a1aa" fontSize="11">{seg.label}: {(seg.value / 1000).toFixed(2)} kW</text>
        </g>
      ))}

      {/* Efficiency badge */}
      <g transform="translate(835,370)">
        <rect x="-50" y="-14" width="100" height="24" rx="8" fill="#18181b" stroke="#27272a" />
        <text x="0" y="2" textAnchor="middle" fill={data.eta > 80 ? '#22c55e' : data.eta > 60 ? '#f59e0b' : '#ef4444'} fontSize="12" fontWeight="700">
          eta = {data.eta.toFixed(1)}%
        </text>
      </g>
    </svg>
  );
}

/* ============================================================
   Theory SVG Diagrams
   ============================================================ */

function EquivalentCircuitSVG() {
  return (
    <svg viewBox="0 0 780 260" style={S.svgDiagram}>
      <defs>
        <marker id="eqc-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0,0 8,3 0,6" fill="#818cf8" />
        </marker>
      </defs>
      <text x="390" y="22" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="600" letterSpacing="0.06em">PER-PHASE EXACT EQUIVALENT CIRCUIT</text>

      {/* Source */}
      <circle cx="40" cy="130" r="14" fill="none" stroke="#6366f1" strokeWidth="2" />
      <text x="40" y="135" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="700">Vph</text>
      <line x1="54" y1="130" x2="90" y2="130" stroke="#d4d4d8" strokeWidth="2" />

      {/* R1 */}
      <rect x="90" y="112" width="70" height="36" rx="6" fill="#111114" stroke="#ef4444" strokeWidth="1.5" />
      <text x="125" y="134" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="700">R1</text>
      <text x="125" y="160" textAnchor="middle" fill="#71717a" fontSize="9">Stator resistance</text>

      {/* X1 */}
      <rect x="180" y="112" width="70" height="36" rx="6" fill="#111114" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="215" y="134" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="700">jX1</text>
      <text x="215" y="160" textAnchor="middle" fill="#71717a" fontSize="9">Stator leakage</text>

      <line x1="160" y1="130" x2="180" y2="130" stroke="#d4d4d8" strokeWidth="2" />
      <line x1="250" y1="130" x2="310" y2="130" stroke="#d4d4d8" strokeWidth="2" />

      {/* Junction node */}
      <circle cx="310" cy="130" r="3" fill="#d4d4d8" />

      {/* Shunt branches */}
      <line x1="310" y1="130" x2="310" y2="60" stroke="#d4d4d8" strokeWidth="1.5" />
      <line x1="310" y1="60" x2="370" y2="60" stroke="#d4d4d8" strokeWidth="1.5" />

      {/* Rc */}
      <rect x="310" y="40" width="60" height="34" rx="6" fill="#111114" stroke="#60a5fa" strokeWidth="1.5" />
      <text x="340" y="62" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="700">Rc</text>

      {/* Xm */}
      <line x1="310" y1="130" x2="310" y2="190" stroke="#d4d4d8" strokeWidth="1.5" />
      <rect x="310" y="180" width="60" height="34" rx="6" fill="#111114" stroke="#3b82f6" strokeWidth="1.5" />
      <text x="340" y="202" textAnchor="middle" fill="#3b82f6" fontSize="11" fontWeight="700">jXm</text>
      <text x="340" y="228" textAnchor="middle" fill="#71717a" fontSize="9">Magnetizing</text>

      <text x="340" y="34" textAnchor="middle" fill="#71717a" fontSize="9">Core loss</text>

      {/* Connect shunt branches */}
      <line x1="370" y1="60" x2="370" y2="214" stroke="#d4d4d8" strokeWidth="1.5" />
      <line x1="370" y1="214" x2="310" y2="214" stroke="#d4d4d8" strokeWidth="1.5" />

      {/* Series rotor path */}
      <line x1="310" y1="130" x2="440" y2="130" stroke="#d4d4d8" strokeWidth="2" />

      {/* Air gap marker */}
      <line x1="400" y1="100" x2="400" y2="160" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
      <text x="400" y="95" textAnchor="middle" fill="#6366f1" fontSize="8" opacity="0.6">AIR GAP</text>

      {/* R2/s */}
      <rect x="440" y="112" width="80" height="36" rx="6" fill="#111114" stroke="#22c55e" strokeWidth="1.5" />
      <text x="480" y="134" textAnchor="middle" fill="#22c55e" fontSize="12" fontWeight="700">R2'/s</text>
      <text x="480" y="160" textAnchor="middle" fill="#71717a" fontSize="9">Rotor referred</text>

      {/* X2 */}
      <rect x="540" y="112" width="70" height="36" rx="6" fill="#111114" stroke="#14b8a6" strokeWidth="1.5" />
      <text x="575" y="134" textAnchor="middle" fill="#14b8a6" fontSize="12" fontWeight="700">jX2'</text>
      <text x="575" y="160" textAnchor="middle" fill="#71717a" fontSize="9">Rotor leakage</text>

      <line x1="520" y1="130" x2="540" y2="130" stroke="#d4d4d8" strokeWidth="2" />
      <line x1="610" y1="130" x2="660" y2="130" stroke="#d4d4d8" strokeWidth="2" />

      {/* Return path */}
      <line x1="40" y1="130" x2="40" y2="240" stroke="#d4d4d8" strokeWidth="1.5" />
      <line x1="40" y1="240" x2="660" y2="240" stroke="#d4d4d8" strokeWidth="1.5" />
      <line x1="660" y1="240" x2="660" y2="130" stroke="#d4d4d8" strokeWidth="1.5" />

      {/* Current arrows */}
      <line x1="60" y1="118" x2="140" y2="118" stroke="#818cf8" strokeWidth="1.5" markerEnd="url(#eqc-arr)" />
      <text x="100" y="112" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="600">I1</text>

      <line x1="446" y1="118" x2="510" y2="118" stroke="#22c55e" strokeWidth="1.5" markerEnd="url(#eqc-arr)" />
      <text x="478" y="112" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="600">I2'</text>

      {/* Stator / Rotor labels */}
      <rect x="680" y="110" width="90" height="40" rx="8" fill="#18181b" stroke="#27272a" />
      <text x="725" y="128" textAnchor="middle" fill="#a1a1aa" fontSize="9">STATOR | ROTOR</text>
      <text x="725" y="142" textAnchor="middle" fill="#52525b" fontSize="8">referred to stator</text>
    </svg>
  );
}

function PowerFlowSVG() {
  return (
    <svg viewBox="0 0 780 200" style={S.svgDiagram}>
      <defs>
        <marker id="pf-arr" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <polygon points="0,0 10,4 0,8" fill="#818cf8" />
        </marker>
        <marker id="pf-arr-r" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0,0 8,3 0,6" fill="#ef4444" />
        </marker>
        <marker id="pf-arr-b" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0,0 8,3 0,6" fill="#3b82f6" />
        </marker>
        <marker id="pf-arr-a" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0,0 8,3 0,6" fill="#f59e0b" />
        </marker>
        <marker id="pf-arr-g" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <polygon points="0,0 10,4 0,8" fill="#22c55e" />
        </marker>
        <marker id="pf-arr-c" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <polygon points="0,0 10,4 0,8" fill="#22d3ee" />
        </marker>
      </defs>
      <text x="390" y="22" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="600" letterSpacing="0.06em">SANKEY-STYLE POWER FLOW DIAGRAM</text>

      {/* Main flow arrow - wide band */}
      <rect x="30" y="70" width="100" height="40" rx="4" fill="#818cf8" opacity="0.15" />
      <line x1="30" y1="90" x2="130" y2="90" stroke="#818cf8" strokeWidth="6" markerEnd="url(#pf-arr)" />
      <text x="80" y="64" textAnchor="middle" fill="#818cf8" fontSize="11" fontWeight="700">Pin = 3Vph I1 cos(phi)</text>

      {/* Stator Cu loss branch */}
      <line x1="145" y1="90" x2="145" y2="38" stroke="#ef4444" strokeWidth="3" markerEnd="url(#pf-arr-r)" />
      <text x="170" y="36" fill="#ef4444" fontSize="10" fontWeight="600">Stator Cu loss</text>
      <text x="170" y="50" fill="#71717a" fontSize="9">3|I1|^2 R1</text>

      {/* Core loss branch */}
      <line x1="210" y1="90" x2="210" y2="38" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#pf-arr-b)" />
      <text x="240" y="36" fill="#3b82f6" fontSize="10" fontWeight="600">Core loss</text>
      <text x="240" y="50" fill="#71717a" fontSize="9">3|Vgap|^2/Rc</text>

      {/* Air gap power */}
      <rect x="230" y="74" width="180" height="32" rx="4" fill="#a78bfa" opacity="0.1" />
      <line x1="150" y1="90" x2="410" y2="90" stroke="#a78bfa" strokeWidth="5" markerEnd="url(#pf-arr)" />
      <text x="330" y="84" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="700">Pag = 3|I2'|^2 (R2'/s)</text>

      {/* Rotor Cu loss branch */}
      <line x1="420" y1="90" x2="420" y2="38" stroke="#f59e0b" strokeWidth="3" markerEnd="url(#pf-arr-a)" />
      <text x="450" y="36" fill="#f59e0b" fontSize="10" fontWeight="600">Rotor Cu loss</text>
      <text x="450" y="50" fill="#71717a" fontSize="9">s * Pag</text>

      {/* Converted power */}
      <rect x="430" y="76" width="160" height="28" rx="4" fill="#22c55e" opacity="0.1" />
      <line x1="425" y1="90" x2="600" y2="90" stroke="#22c55e" strokeWidth="4" markerEnd="url(#pf-arr-g)" />
      <text x="520" y="84" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="700">Pconv = (1-s) Pag</text>

      {/* Rotational loss */}
      <line x1="610" y1="90" x2="610" y2="38" stroke="#71717a" strokeWidth="2" markerEnd="url(#pf-arr-r)" />
      <text x="638" y="40" fill="#71717a" fontSize="10">Friction + windage</text>

      {/* Shaft output */}
      <rect x="620" y="78" width="120" height="24" rx="4" fill="#22d3ee" opacity="0.1" />
      <line x1="615" y1="90" x2="740" y2="90" stroke="#22d3ee" strokeWidth="3" markerEnd="url(#pf-arr-c)" />
      <text x="680" y="84" textAnchor="middle" fill="#22d3ee" fontSize="11" fontWeight="700">Pshaft</text>

      {/* Key relationship box */}
      <rect x="180" y="130" width="420" height="52" rx="10" fill="#18181b" stroke="#27272a" />
      <text x="390" y="152" textAnchor="middle" fill="#c4b5fd" fontSize="12" fontFamily="monospace">Prcu / Pag = s     Pconv / Pag = (1 - s)</text>
      <text x="390" y="172" textAnchor="middle" fill="#71717a" fontSize="10">Slip determines the power split between rotor loss and mechanical output</text>
    </svg>
  );
}

export default function InductionMotorEquivalentCircuit() {
  const [tab, setTab] = useState('sim');
  const [Vll, setVll] = useState(415);
  const [R1, setR1] = useState(0.6);
  const [X1, setX1] = useState(1.1);
  const [R2, setR2] = useState(0.45);
  const [X2, setX2] = useState(1.0);
  const [Xm, setXm] = useState(26);
  const [Rc, setRc] = useState(180);
  const [slip, setSlip] = useState(0.04);

  const data = useMemo(() => compute(Vll, R1, X1, R2, X2, Xm, Rc, slip), [Vll, R1, X1, R2, X2, Xm, Rc, slip]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'sim')} onClick={() => setTab('sim')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'sim' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram data={data} />
          </div>

          <div style={S.controls}>
            {[
              ['Line voltage', Vll, 250, 460, 1, setVll, ' V'],
              ['R1', R1, 0.2, 1.2, 0.01, setR1, ' ohm'],
              ['X1', X1, 0.4, 2.0, 0.01, setX1, ' ohm'],
              ['R2', R2, 0.15, 1.0, 0.01, setR2, ' ohm'],
              ['X2', X2, 0.4, 2.0, 0.01, setX2, ' ohm'],
              ['Xm', Xm, 10, 60, 0.5, setXm, ' ohm'],
              ['Rc', Rc, 60, 500, 1, setRc, ' ohm'],
              ['Slip', slip, 0.005, 0.2, 0.001, setSlip, ' pu'],
            ].map(([label, value, min, max, step, setter, unit]) => (
              <div style={S.cg} key={label}>
                <span style={S.label}>{label}</span>
                <input style={S.slider} type="range" min={min} max={max} step={step} value={value} onChange={(e) => setter(Number(e.target.value))} />
                <span style={S.val}>{Number(value).toFixed(step < 0.01 ? 3 : step < 0.1 ? 2 : 1)}{unit}</span>
              </div>
            ))}
          </div>

          <div style={S.results}>
            <div style={S.ri}><span style={S.rl}>Input power</span><span style={S.rv}>{(data.Pin / 1000).toFixed(2)} kW</span></div>
            <div style={S.ri}><span style={S.rl}>Power factor</span><span style={S.rv}>{data.pf.toFixed(3)}</span></div>
            <div style={S.ri}><span style={S.rl}>Air-gap power</span><span style={S.rv}>{(data.Pag / 1000).toFixed(2)} kW</span></div>
            <div style={S.ri}><span style={S.rl}>Core loss</span><span style={S.rv}>{(data.Pcore / 1000).toFixed(2)} kW</span></div>
            <div style={S.ri}><span style={S.rl}>Rotor copper loss</span><span style={S.rv}>{(data.Prcu / 1000).toFixed(2)} kW</span></div>
            <div style={S.ri}><span style={S.rl}>Converted mechanical</span><span style={S.rv}>{(data.Pconv / 1000).toFixed(2)} kW</span></div>
            <div style={S.ri}><span style={S.rl}>Efficiency</span><span style={S.rv}>{data.eta.toFixed(1)}%</span></div>
          </div>

          <div style={S.strip}>
            <div style={S.box}>
              <span style={S.boxT}>Phase values</span>
              <span style={S.boxV}>Vph = {data.Vph.toFixed(1)} V{'\n'}|I1| = {cAbs(data.I1).toFixed(2)} A{'\n'}|I2'| = {cAbs(data.I2).toFixed(2)} A</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Loss chain</span>
              <span style={S.boxV}>Pscu = {(data.Pscu / 1000).toFixed(2)} kW{'\n'}Pcore = {(data.Pcore / 1000).toFixed(2)} kW{'\n'}Prcu = {(data.Prcu / 1000).toFixed(2)} kW</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Excitation branch</span>
              <span style={S.boxV}>|Imag| = {cAbs(data.Imag).toFixed(2)} A{'\n'}|Icore| = {cAbs(data.Icore).toFixed(2)} A{'\n'}Qin = {(data.Qin / 1000).toFixed(2)} kVAr</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={S.theory}>
          <h2 style={S.h2}>Induction Motor Per-Phase Equivalent Circuit</h2>
          <p style={S.p}>
            The induction motor behaves like a transformer with a rotating secondary. The stator is the primary, the rotor is the secondary, and the air gap replaces the fixed magnetic path of a transformer.
            After referring rotor quantities to the stator side, the machine can be represented by a per-phase equivalent circuit that predicts current, power factor, air-gap power, rotor copper loss, and converted mechanical power.
          </p>

          <EquivalentCircuitSVG />

          <h3 style={S.h3}>Classical exact branch meanings</h3>
          <ul style={S.ul}>
            <li style={S.li}><strong style={{ color: '#ef4444' }}>R1</strong> represents stator copper loss.</li>
            <li style={S.li}><strong style={{ color: '#f59e0b' }}>X1</strong> represents stator leakage flux that does not cross the air gap.</li>
            <li style={S.li}><strong style={{ color: '#3b82f6' }}>Rc</strong> models iron loss: hysteresis plus eddy-current loss.</li>
            <li style={S.li}><strong style={{ color: '#60a5fa' }}>Xm</strong> is the magnetizing reactance that establishes air-gap flux.</li>
            <li style={S.li}><strong style={{ color: '#22c55e' }}>R2'/s + jX2'</strong> is the rotor branch referred to the stator, with slip appearing explicitly in the effective rotor resistance.</li>
          </ul>

          <span style={S.eq}>Z2' = R2' / s + jX2'</span>
          <span style={S.eq}>Pag = 3 |I2'|^2 (R2' / s), Prcl = 3 |I2'|^2 R2', Pconv = Pag (1 - s)</span>
          <span style={S.eq}>Pin = Pscu + Pcore + Pag</span>

          <h2 style={S.h2}>Power Flow Interpretation</h2>
          <p style={S.p}>
            The most important insight is that the rotor branch converts slip directly into power partition. Of the air-gap power, a fraction <strong style={{ color: '#e4e4e7' }}>s</strong> is rotor copper loss and a fraction <strong style={{ color: '#e4e4e7' }}>(1 - s)</strong> becomes converted mechanical power:
          </p>

          <PowerFlowSVG />

          <span style={S.eq}>Prcu / Pag = s,  Pconv / Pag = 1 - s</span>
          <p style={S.p}>
            This is why slip is not just a speed variable. It is also a power-flow variable. Near standstill, rotor copper loss dominates. Near rated speed, most air-gap power becomes mechanical conversion.
          </p>

          <h2 style={S.h2}>Parameter Tests Used In Practice</h2>
          <h3 style={S.h3}>No-load test</h3>
          <p style={S.p}>
            With the rotor nearly unloaded, slip is very small and the rotor branch draws little real power. The measured current and power mainly determine <strong style={{ color: '#e4e4e7' }}>Rc</strong> and <strong style={{ color: '#e4e4e7' }}>Xm</strong>.
          </p>
          <h3 style={S.h3}>Blocked-rotor test</h3>
          <p style={S.p}>
            With the rotor blocked, slip is unity and the circuit resembles a short-circuited transformer. The measured current and power are used to estimate the series parameters <strong style={{ color: '#e4e4e7' }}>R1 + R2'</strong> and <strong style={{ color: '#e4e4e7' }}>X1 + X2'</strong>.
          </p>

          <div style={S.ctx}>
            <span style={S.ctxT}>Assumptions Used Here</span>
            <p style={S.ctxP}>
              This simulation uses the standard approximate per-phase model with all quantities referred to the stator. Stray-load loss, mechanical rotational loss, saturation, skin effect in deep bars, and temperature dependence of rotor resistance are not modeled. The displayed efficiency therefore represents electromagnetic conversion efficiency up to converted mechanical power, not final shaft efficiency.
            </p>
          </div>

          <h2 style={S.h2}>Why Each Control Matters</h2>
          <ul style={S.ul}>
            <li style={S.li}>Increasing <strong style={{ color: '#e4e4e7' }}>Xm</strong> reduces magnetizing current and generally improves power factor.</li>
            <li style={S.li}>Increasing <strong style={{ color: '#e4e4e7' }}>R2'</strong> raises starting torque up to an optimum but also increases operating slip for the same load torque.</li>
            <li style={S.li}>Increasing <strong style={{ color: '#e4e4e7' }}>X1 + X2'</strong> reduces the air-gap voltage available to the rotor and depresses torque capability.</li>
            <li style={S.li}>Decreasing slip lowers rotor copper loss as a fraction of air-gap power and raises converted mechanical power.</li>
          </ul>

          <h2 style={S.h2}>References</h2>
          <ul style={S.ul}>
            <li style={S.li}>Chapman, S.J. — <em>Electric Machinery Fundamentals</em>, McGraw-Hill</li>
            <li style={S.li}>Fitzgerald, Kingsley, Umans — <em>Electric Machinery</em>, McGraw-Hill</li>
            <li style={S.li}>P.S. Bimbhra — <em>Electrical Machinery</em>, Khanna Publishers</li>
            <li style={S.li}>B.L. Theraja and A.K. Theraja — <em>A Textbook of Electrical Technology, Vol. II</em></li>
          </ul>
        </div>
      )}
    </div>
  );
}
