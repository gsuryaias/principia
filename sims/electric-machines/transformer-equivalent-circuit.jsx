import React, { useState, useMemo } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '20px 16px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 120, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 50, textAlign: 'right' },
  results: { display: 'flex', gap: 28, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  theory: { flex: 1, padding: '32px 24px', maxWidth: 820, margin: '0 auto', overflowY: 'auto', width: '100%' },
  h2: { fontSize: 22, fontWeight: 700, color: '#f4f4f5', margin: '36px 0 14px', paddingBottom: 8, borderBottom: '1px solid #27272a' },
  h3: { fontSize: 17, fontWeight: 600, color: '#e4e4e7', margin: '24px 0 10px' },
  p: { fontSize: 15, lineHeight: 1.8, color: '#a1a1aa', margin: '0 0 14px' },
  eq: { display: 'block', padding: '14px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontFamily: 'monospace', fontSize: 15, color: '#c4b5fd', margin: '16px 0', textAlign: 'center', overflowX: 'auto' },
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14, display: 'block' },
  ctxP: { fontSize: 14, lineHeight: 1.7, color: '#a1a1aa', margin: 0 },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  tbl: { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #3f3f46', color: '#d4d4d8', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #27272a', color: '#a1a1aa' },
};

// Complex arithmetic helpers
const cadd = ([ar, ai], [br, bi]) => [ar + br, ai + bi];
const csub = ([ar, ai], [br, bi]) => [ar - br, ai - bi];
const cmul = ([ar, ai], [br, bi]) => [ar * br - ai * bi, ar * bi + ai * br];
const cdiv = ([ar, ai], [br, bi]) => { const d = br * br + bi * bi; return [(ar * br + ai * bi) / d, (ai * br - ar * bi) / d]; };
const cabs = ([r, i]) => Math.hypot(r, i);
const cang = ([r, i]) => Math.atan2(i, r) * 180 / Math.PI;
const cconj = ([r, i]) => [r, -i];

function compute({ I2, PF, R1, X1, R2, X2, Rc, Xm, a, side }) {
  const phi = Math.acos(Math.max(0.001, Math.min(1, PF)));
  // Take V2 as reference = 1 pu, work in actual circuit
  // For a 10kVA type transformer, let's derive V1 from circuit
  // Use V2 = 240V reference (secondary terminal voltage)
  const V2ref = 240;
  const V1ref = a * V2ref; // nominal primary = a * V2

  // Load current at secondary, lagging
  const I2c = [I2 * PF, -I2 * Math.sin(phi)]; // I2 at angle -phi

  // Secondary impedance referred to primary
  const R2p = a * a * R2;
  const X2p = a * a * X2;

  // Secondary voltage referred to primary (approximate: take V2' = a*V2ref as reference terminal)
  const V2p = [a * V2ref, 0]; // V2' referred to primary

  // Voltage drop across series secondary impedance referred to primary
  const Z2p = [R2p, X2p];
  const I2p = [I2c[0] / a, I2c[1] / a]; // I2 referred to primary
  const Vdrop2p = cmul(I2p, Z2p);
  const Vmid = cadd(V2p, Vdrop2p); // voltage at shunt branch node (mid-point)

  // Shunt branch: Rc || jXm referred to primary
  const Icore = [Vmid[0] / Rc, 0]; // current through Rc
  const Imag = [0, -Vmid[1] / Xm - Vmid[0] / Xm]; // approximate: Vmid / (jXm) = -jVmid/Xm
  // Proper: Vmid / jXm
  const ImP = cdiv(Vmid, [0, Xm]); // = [Vmid_i/Xm, -Vmid_r/Xm]
  const IcP = cdiv(Vmid, [Rc, 0]);  // = [Vmid_r/Rc, Vmid_i/Rc]
  const Ish = cadd(IcP, ImP);

  // Primary current = I2' + Ish
  const I1c = cadd(I2p, Ish);

  // Voltage drop across primary series impedance
  const Z1 = [R1, X1];
  const Vdrop1 = cmul(I1c, Z1);
  const V1c = cadd(Vmid, Vdrop1); // V1 = Vmid + I1*(R1+jX1)

  const V1mag = cabs(V1c);
  const V2mag = V2ref;
  const I1mag = cabs(I1c);
  const I2mag = I2;

  // Losses
  const Pcu1 = I1mag * I1mag * R1;
  const Pcu2 = I2mag * I2mag * R2;
  const Pcu = Pcu1 + Pcu2;
  const Pfe = (cabs(Vmid) * cabs(Vmid)) / Rc; // core loss based on Vmid
  const P2 = V2mag * I2mag * PF; // output power
  const P1 = P2 + Pcu + Pfe;
  const efficiency = P1 > 0.1 ? (P2 / P1) * 100 : 0;

  // No-load voltage (I2=0): V2_NL ~ V1/a (approximate, ignoring small Ish*Z1)
  const V2_NL = V1mag / a;
  const VR = ((V2_NL - V2mag) / V2mag) * 100;

  // For referred-to-secondary display
  const R1s = R1 / (a * a);
  const X1s = X1 / (a * a);
  const Rcs = Rc / (a * a);
  const Xms = Xm / (a * a);

  return {
    V1mag, V2mag, I1mag, I2mag,
    Pcu, Pfe, P2, P1, efficiency, VR,
    Pcu1, Pcu2,
    I1c, I2c, I2p, Ish,
    V1c, V2p, Vmid,
    R2p, X2p, R1s, X1s, Rcs, Xms,
    phi,
  };
}

// SVG circuit drawing helpers
function Resistor({ x, y, w = 36, h = 16, color = '#f59e0b', label = '', sub = '' }) {
  return (
    <g>
      <rect x={x} y={y - h / 2} width={w} height={h} rx={4} fill="#111114" stroke={color} strokeWidth={1.5} />
      <text x={x + w / 2} y={y - h / 2 - 5} textAnchor="middle" fill={color} fontSize="10" fontWeight="700">{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" fill={color} fontSize="9">{sub}</text>}
    </g>
  );
}

function Inductor({ x, y, w = 36, h = 16, color = '#f59e0b', label = '', sub = '' }) {
  // Draw as 3 bumps
  const bumps = 3;
  const bw = w / bumps;
  let d = `M${x},${y}`;
  for (let i = 0; i < bumps; i++) {
    const cx = x + i * bw + bw / 2;
    d += ` A${bw / 2},${bw / 2} 0 0 1 ${x + (i + 1) * bw},${y}`;
  }
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={1.8} />
      <text x={x + w / 2} y={y - 8} textAnchor="middle" fill={color} fontSize="10" fontWeight="700">{label}</text>
      {sub && <text x={x + w / 2} y={y + 14} textAnchor="middle" fill={color} fontSize="9">{sub}</text>}
    </g>
  );
}

function VoltageSource({ cx, cy, r = 16, label = 'V1', color = '#6366f1' }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={2} />
      <text x={cx} y={cy + 5} textAnchor="middle" fill={color} fontSize="11" fontWeight="700">{label}</text>
    </g>
  );
}

function PhasorDiagram({ data, px, py, scale = 0.18 }) {
  const { V1c, V2p, I2c, I1c, phi } = data;
  const V1mag = cabs(V1c);
  const V2mag = 240;
  const I2mag = cabs(I2c);
  const I1mag = cabs(I1c);

  const scaleV = 55 / Math.max(V1mag, 1);
  const scaleI = 30 / Math.max(I1mag, I2mag, 1);

  // V2 as reference (horizontal)
  const v2x = px + V2mag * scaleV;
  const v2y = py;

  // V1 angle relative to V2
  const v1ang = Math.atan2(V1c[1], V1c[0]);
  const v1x = px + V1mag * scaleV * Math.cos(v1ang);
  const v1y = py - V1mag * scaleV * Math.sin(v1ang);

  // I2 angle: -phi relative to V2 (horizontal reference)
  const i2x = px + I2mag * scaleI * Math.cos(-phi);
  const i2y = py - I2mag * scaleI * Math.sin(-phi);

  // I1 angle
  const i1ang = Math.atan2(I1c[1], I1c[0]);
  const i1x = px + I1mag * scaleI * Math.cos(i1ang);
  const i1y = py - I1mag * scaleI * Math.sin(i1ang);

  const arr = (id, col) => (
    <marker key={id} id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <polygon points="0,0 8,3 0,6" fill={col} />
    </marker>
  );

  return (
    <g>
      <defs>
        {arr('a-v1', '#818cf8')}
        {arr('a-v2', '#22c55e')}
        {arr('a-i2', '#f59e0b')}
        {arr('a-i1', '#60a5fa')}
      </defs>
      <text x={px} y={py - 75} textAnchor="middle" fill="#71717a" fontSize="10" fontWeight="700" letterSpacing="0.06em">PHASOR DIAGRAM</text>
      {/* Axes */}
      <line x1={px - 65} y1={py} x2={px + 65} y2={py} stroke="#27272a" strokeWidth={1} />
      <line x1={px} y1={py + 65} x2={px} y2={py - 65} stroke="#27272a" strokeWidth={1} />
      {/* V2 */}
      <line x1={px} y1={py} x2={v2x} y2={v2y} stroke="#22c55e" strokeWidth={2} markerEnd="url(#a-v2)" />
      {/* V1 */}
      <line x1={px} y1={py} x2={v1x} y2={v1y} stroke="#818cf8" strokeWidth={2} markerEnd="url(#a-v1)" />
      {/* I2 */}
      <line x1={px} y1={py} x2={i2x} y2={i2y} stroke="#f59e0b" strokeWidth={1.8} markerEnd="url(#a-i2)" />
      {/* I1 */}
      <line x1={px} y1={py} x2={i1x} y2={i1y} stroke="#60a5fa" strokeWidth={1.8} markerEnd="url(#a-i1)" />
      {/* Labels */}
      <text x={v2x + 4} y={v2y + 4} fill="#22c55e" fontSize="10" fontWeight="700">V2</text>
      <text x={v1x + (v1x > px ? 4 : -18)} y={v1y - 4} fill="#818cf8" fontSize="10" fontWeight="700">V1</text>
      <text x={i2x + 4} y={i2y + 10} fill="#f59e0b" fontSize="10" fontWeight="700">I2</text>
      <text x={i1x + 4} y={i1y - 4} fill="#60a5fa" fontSize="10" fontWeight="700">I1</text>
    </g>
  );
}

function CircuitPrimary({ data, params }) {
  const { R1, X1, R2, X2, Rc, Xm, a } = params;
  const R2p = a * a * R2;
  const X2p = a * a * X2;
  const { I1mag, I2mag, Pcu1, Pcu2 } = data;

  // Layout: viewBox 0 0 960 320
  // Top rail: y=120, Bottom rail: y=220, midline y=170
  const y = 170; // center line
  const yt = 100; // top rail
  const yb = 240; // bottom rail
  const x0 = 30;  // left side
  const xSrc = 60; // source center x
  const xA = 110; // after source, start of R1
  const xR1 = 120;
  const xX1 = 170;
  const xMid = 240; // shunt node
  const xRc = 280;  // shunt components center x (Rc top, Xm bottom)
  const xMid2 = 360; // right of shunt
  const xR2p = 380;
  const xX2p = 430;
  const xLoad = 510; // load node
  const xEnd = 560; // right terminal

  return (
    <g>
      {/* Title */}
      <text x={300} y={28} textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.07em">
        EQUIVALENT CIRCUIT REFERRED TO PRIMARY
      </text>

      {/* Source */}
      <VoltageSource cx={xSrc} cy={y} r={18} label="V1" color="#6366f1" />
      <text x={xSrc} y={y + 32} textAnchor="middle" fill="#818cf8" fontSize="9">{data.V1mag.toFixed(1)}V</text>

      {/* Wire from source to R1 */}
      <line x1={xSrc} y1={yt} x2={xSrc} y2={y - 18} stroke="#d4d4d8" strokeWidth={1.8} />
      <line x1={xSrc} y1={yt} x2={xR1} y2={yt} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* R1 */}
      <Resistor x={xR1} y={yt} w={34} h={14} color="#ef4444" label="R1" sub={R1.toFixed(2)+'Ω'} />
      <line x1={xR1 + 34} y1={yt} x2={xX1} y2={yt} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* X1 */}
      <Inductor x={xX1} y={yt} w={34} h={14} color="#f59e0b" label="jX1" sub={X1.toFixed(2)+'Ω'} />
      <line x1={xX1 + 34} y1={yt} x2={xMid} y2={yt} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* I1 label */}
      <text x={(xR1 + xX1) / 2 + 17} y={yt - 14} textAnchor="middle" fill="#60a5fa" fontSize="9">I1={data.I1mag.toFixed(1)}A</text>

      {/* Shunt node vertical line */}
      <line x1={xMid} y1={yt} x2={xMid} y2={yb} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* Shunt Rc (top half) */}
      <line x1={xMid} y1={yt + 20} x2={xRc} y2={yt + 20} stroke="#d4d4d8" strokeWidth={1.5} />
      <Resistor x={xRc} y={yt + 20} w={34} h={14} color="#a78bfa" label="Rc" sub={Rc+'Ω'} />
      <line x1={xRc + 34} y1={yt + 20} x2={xMid2} y2={yt + 20} stroke="#d4d4d8" strokeWidth={1.5} />

      {/* Shunt Xm (bottom half) */}
      <line x1={xMid} y1={yb - 20} x2={xRc} y2={yb - 20} stroke="#d4d4d8" strokeWidth={1.5} />
      <Inductor x={xRc} y={yb - 20} w={34} h={14} color="#34d399" label="jXm" sub={Xm+'Ω'} />
      <line x1={xRc + 34} y1={yb - 20} x2={xMid2} y2={yb - 20} stroke="#d4d4d8" strokeWidth={1.5} />

      {/* Right side of shunt node */}
      <line x1={xMid2} y1={yt + 20} x2={xMid2} y2={yb - 20} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* Wire from right shunt node to R2' */}
      <line x1={xMid2} y1={yt} x2={xR2p} y2={yt} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* R2' */}
      <Resistor x={xR2p} y={yt} w={34} h={14} color="#ef4444" label="R2'" sub={R2p.toFixed(2)+'Ω'} />
      <line x1={xR2p + 34} y1={yt} x2={xX2p} y2={yt} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* X2' */}
      <Inductor x={xX2p} y={yt} w={34} h={14} color="#f59e0b" label="jX2'" sub={X2p.toFixed(2)+'Ω'} />
      <line x1={xX2p + 34} y1={yt} x2={xLoad} y2={yt} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* Load terminal */}
      <line x1={xLoad} y1={yt} x2={xLoad} y2={yb} stroke="#22c55e" strokeWidth={2} strokeDasharray="4,3" />
      <rect x={xLoad + 4} y={yt + 30} width={40} height={50} rx={5} fill="#111114" stroke="#22c55e" strokeWidth={1.5} />
      <text x={xLoad + 24} y={yt + 58} textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700">ZL</text>
      <text x={xLoad + 24} y={yt + 70} textAnchor="middle" fill="#22c55e" fontSize="8">V2'={( a * 240).toFixed(0)}V</text>

      {/* Bottom return wire */}
      <line x1={xSrc} y1={y + 18} x2={xSrc} y2={yb} stroke="#d4d4d8" strokeWidth={1.8} />
      <line x1={xSrc} y1={yb} x2={xLoad} y2={yb} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* Ideal transformer symbol in center */}
      <text x={310} y={y + 20} textAnchor="middle" fill="#52525b" fontSize="9" fontStyle="italic">a={params.a}:1 referred</text>

      {/* I2' label */}
      <text x={(xR2p + xX2p) / 2 + 17} y={yt - 14} textAnchor="middle" fill="#f59e0b" fontSize="9">I2'={( data.I2mag / params.a).toFixed(1)}A</text>

      {/* Phasor diagram */}
      <PhasorDiagram data={data} px={660} py={170} />

      {/* Legend */}
      <g transform="translate(590,95)">
        <rect width={8} height={8} rx={2} fill="#818cf8" />
        <text x={12} y={8} fill="#a1a1aa" fontSize="9">V1</text>
        <rect y={14} width={8} height={8} rx={2} fill="#22c55e" />
        <text x={12} y={22} fill="#a1a1aa" fontSize="9">V2</text>
        <rect y={28} width={8} height={8} rx={2} fill="#f59e0b" />
        <text x={12} y={36} fill="#a1a1aa" fontSize="9">I2 (lagging)</text>
        <rect y={42} width={8} height={8} rx={2} fill="#60a5fa" />
        <text x={12} y={50} fill="#a1a1aa" fontSize="9">I1</text>
      </g>

      {/* Loss annotations */}
      <text x={140} y={yb + 25} textAnchor="middle" fill="#ef4444" fontSize="9">Pcu1={Pcu1.toFixed(0)}W</text>
      <text x={450} y={yb + 25} textAnchor="middle" fill="#ef4444" fontSize="9">Pcu2={Pcu2.toFixed(0)}W</text>
    </g>
  );
}

function CircuitSecondary({ data, params }) {
  const { R1, X1, R2, X2, Rc, Xm, a } = params;
  const R1s = R1 / (a * a);
  const X1s = X1 / (a * a);
  const Rcs = Rc / (a * a);
  const Xms = Xm / (a * a);

  const y = 170;
  const yt = 100;
  const yb = 240;
  const xSrc = 60;
  const xR1s = 110;
  const xX1s = 158;
  const xMid = 220;
  const xRcs = 260;
  const xMid2 = 330;
  const xR2 = 350;
  const xX2 = 398;
  const xLoad = 470;

  return (
    <g>
      <text x={290} y={28} textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.07em">
        EQUIVALENT CIRCUIT REFERRED TO SECONDARY
      </text>

      {/* Source (V1 referred to secondary = V1/a) */}
      <VoltageSource cx={xSrc} cy={y} r={18} label="V1/a" color="#6366f1" />
      <text x={xSrc} y={y + 32} textAnchor="middle" fill="#818cf8" fontSize="9">{(data.V1mag / a).toFixed(1)}V</text>

      <line x1={xSrc} y1={yt} x2={xSrc} y2={y - 18} stroke="#d4d4d8" strokeWidth={1.8} />
      <line x1={xSrc} y1={yt} x2={xR1s} y2={yt} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* R1'' */}
      <Resistor x={xR1s} y={yt} w={34} h={14} color="#ef4444" label="R1''" sub={R1s.toFixed(3)+'Ω'} />
      <line x1={xR1s + 34} y1={yt} x2={xX1s} y2={yt} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* X1'' */}
      <Inductor x={xX1s} y={yt} w={34} h={14} color="#f59e0b" label="jX1''" sub={X1s.toFixed(3)+'Ω'} />
      <line x1={xX1s + 34} y1={yt} x2={xMid} y2={yt} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* I1'' label (I1 referred to secondary = a*I1) */}
      <text x={(xR1s + xX1s) / 2 + 17} y={yt - 14} textAnchor="middle" fill="#60a5fa" fontSize="9">I1/a={( data.I1mag).toFixed(1)}A</text>

      {/* Shunt node */}
      <line x1={xMid} y1={yt} x2={xMid} y2={yb} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* Rc'' */}
      <line x1={xMid} y1={yt + 20} x2={xRcs} y2={yt + 20} stroke="#d4d4d8" strokeWidth={1.5} />
      <Resistor x={xRcs} y={yt + 20} w={34} h={14} color="#a78bfa" label="Rc''" sub={Rcs.toFixed(1)+'Ω'} />
      <line x1={xRcs + 34} y1={yt + 20} x2={xMid2} y2={yt + 20} stroke="#d4d4d8" strokeWidth={1.5} />

      {/* Xm'' */}
      <line x1={xMid} y1={yb - 20} x2={xRcs} y2={yb - 20} stroke="#d4d4d8" strokeWidth={1.5} />
      <Inductor x={xRcs} y={yb - 20} w={34} h={14} color="#34d399" label="jXm''" sub={Xms.toFixed(1)+'Ω'} />
      <line x1={xRcs + 34} y1={yb - 20} x2={xMid2} y2={yb - 20} stroke="#d4d4d8" strokeWidth={1.5} />

      <line x1={xMid2} y1={yt + 20} x2={xMid2} y2={yb - 20} stroke="#d4d4d8" strokeWidth={1.8} />
      <line x1={xMid2} y1={yt} x2={xR2} y2={yt} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* R2 */}
      <Resistor x={xR2} y={yt} w={34} h={14} color="#ef4444" label="R2" sub={R2.toFixed(3)+'Ω'} />
      <line x1={xR2 + 34} y1={yt} x2={xX2} y2={yt} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* X2 */}
      <Inductor x={xX2} y={yt} w={34} h={14} color="#f59e0b" label="jX2" sub={X2.toFixed(2)+'Ω'} />
      <line x1={xX2 + 34} y1={yt} x2={xLoad} y2={yt} stroke="#d4d4d8" strokeWidth={1.8} />

      {/* Load terminal */}
      <line x1={xLoad} y1={yt} x2={xLoad} y2={yb} stroke="#22c55e" strokeWidth={2} strokeDasharray="4,3" />
      <rect x={xLoad + 4} y={yt + 30} width={42} height={50} rx={5} fill="#111114" stroke="#22c55e" strokeWidth={1.5} />
      <text x={xLoad + 25} y={yt + 55} textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700">ZL</text>
      <text x={xLoad + 25} y={yt + 67} textAnchor="middle" fill="#22c55e" fontSize="8">V2=240V</text>
      <text x={xLoad + 25} y={yt + 78} textAnchor="middle" fill="#22c55e" fontSize="8">I2={data.I2mag}A</text>

      <line x1={xSrc} y1={y + 18} x2={xSrc} y2={yb} stroke="#d4d4d8" strokeWidth={1.8} />
      <line x1={xSrc} y1={yb} x2={xLoad} y2={yb} stroke="#d4d4d8" strokeWidth={1.8} />

      <text x={300} y={y + 20} textAnchor="middle" fill="#52525b" fontSize="9" fontStyle="italic">1:a={params.a} referred to secondary</text>

      <text x={(xR2 + xX2) / 2 + 17} y={yt - 14} textAnchor="middle" fill="#f59e0b" fontSize="9">I2={data.I2mag}A</text>

      {/* Phasor diagram */}
      <PhasorDiagram data={data} px={660} py={170} />

      {/* Legend */}
      <g transform="translate(590,95)">
        <rect width={8} height={8} rx={2} fill="#818cf8" />
        <text x={12} y={8} fill="#a1a1aa" fontSize="9">V1/a</text>
        <rect y={14} width={8} height={8} rx={2} fill="#22c55e" />
        <text x={12} y={22} fill="#a1a1aa" fontSize="9">V2</text>
        <rect y={28} width={8} height={8} rx={2} fill="#f59e0b" />
        <text x={12} y={36} fill="#a1a1aa" fontSize="9">I2 (lagging)</text>
        <rect y={42} width={8} height={8} rx={2} fill="#60a5fa" />
        <text x={12} y={50} fill="#a1a1aa" fontSize="9">I1</text>
      </g>

      <text x={(xR1s + xX1s) / 2 + 17} y={yb + 25} textAnchor="middle" fill="#ef4444" fontSize="9">Pcu1={data.Pcu1.toFixed(0)}W</text>
      <text x={(xR2 + xX2) / 2 + 17} y={yb + 25} textAnchor="middle" fill="#ef4444" fontSize="9">Pcu2={data.Pcu2.toFixed(0)}W</text>
    </g>
  );
}

function colorOf(val) {
  if (val >= 97) return '#22c55e';
  if (val >= 94) return '#84cc16';
  if (val >= 90) return '#f59e0b';
  return '#ef4444';
}

export default function TransformerEquivalentCircuit() {
  const [tab, setTab] = useState('sim');
  const [I2, setI2] = useState(100);
  const [PF, setPF] = useState(0.85);
  const [R1, setR1] = useState(0.5);
  const [X1, setX1] = useState(1.2);
  const [R2, setR2] = useState(0.05);
  const [X2, setX2] = useState(0.3);
  const [Rc, setRc] = useState(2000);
  const [Xm, setXm] = useState(500);
  const [a, setA] = useState(10);
  const [side, setSide] = useState('primary'); // 'primary' | 'secondary'

  const params = useMemo(() => ({ I2, PF, R1, X1, R2, X2, Rc, Xm, a, side }), [I2, PF, R1, X1, R2, X2, Rc, Xm, a, side]);
  const data = useMemo(() => compute(params), [params]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'sim')} onClick={() => setTab('sim')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'sim' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <svg viewBox="0 0 960 320" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
              {side === 'primary'
                ? <CircuitPrimary data={data} params={params} />
                : <CircuitSecondary data={data} params={params} />
              }
            </svg>
          </div>

          <div style={S.controls}>
            {/* Toggle */}
            <div style={S.cg}>
              <span style={S.label}>Referred to</span>
              <button
                onClick={() => setSide('primary')}
                style={{ ...S.tab(side === 'primary'), padding: '5px 14px', fontSize: 12 }}
              >Primary</button>
              <button
                onClick={() => setSide('secondary')}
                style={{ ...S.tab(side === 'secondary'), padding: '5px 14px', fontSize: 12 }}
              >Secondary</button>
            </div>

            {[
              ['Turns ratio a', a, 1, 20, 1, setA, ':1'],
              ['Load current I2', I2, 0, 200, 1, setI2, ' A'],
              ['Power factor', PF, 0.5, 1.0, 0.01, setPF, ''],
              ['R1 (Ω)', R1, 0.1, 2.0, 0.05, setR1, ' Ω'],
              ['X1 (Ω)', X1, 0.1, 5.0, 0.1, setX1, ' Ω'],
              ['R2 (Ω)', R2, 0.01, 0.5, 0.01, setR2, ' Ω'],
              ['X2 (Ω)', X2, 0.1, 2.0, 0.05, setX2, ' Ω'],
              ['Rc (Ω)', Rc, 500, 5000, 100, setRc, ' Ω'],
              ['Xm (Ω)', Xm, 100, 2000, 50, setXm, ' Ω'],
            ].map(([label, value, min, max, step, setter, unit]) => (
              <div style={S.cg} key={label}>
                <span style={S.label}>{label}</span>
                <input
                  style={S.slider}
                  type="range"
                  min={min} max={max} step={step}
                  value={value}
                  onChange={(e) => setter(Number(e.target.value))}
                />
                <span style={S.val}>
                  {Number(value).toFixed(step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0)}{unit}
                </span>
              </div>
            ))}
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>V1 (primary)</span>
              <span style={{ ...S.rv, color: '#818cf8' }}>{data.V1mag.toFixed(1)} V</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>V2 (secondary)</span>
              <span style={{ ...S.rv, color: '#22c55e' }}>{data.V2mag.toFixed(1)} V</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>I1 (primary)</span>
              <span style={{ ...S.rv, color: '#60a5fa' }}>{data.I1mag.toFixed(2)} A</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Copper Loss</span>
              <span style={{ ...S.rv, color: '#ef4444' }}>{data.Pcu.toFixed(1)} W</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Core Loss</span>
              <span style={{ ...S.rv, color: '#a78bfa' }}>{data.Pfe.toFixed(1)} W</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Total Loss</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{(data.Pcu + data.Pfe).toFixed(1)} W</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Output P2</span>
              <span style={{ ...S.rv, color: '#34d399' }}>{(data.P2 / 1000).toFixed(2)} kW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Efficiency</span>
              <span style={{ ...S.rv, color: colorOf(data.efficiency) }}>{data.efficiency.toFixed(2)} %</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Volt. Regulation</span>
              <span style={{ ...S.rv, color: '#fb923c' }}>{data.VR.toFixed(2)} %</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={S.theory}>
          <h2 style={S.h2}>Transformer Equivalent Circuit</h2>
          <p style={S.p}>
            A real transformer has winding resistances, leakage fluxes, and a core that consumes energy
            through hysteresis and eddy currents. The exact equivalent circuit models all these effects
            using lumped parameters: primary resistance R1 and leakage reactance X1, a shunt branch (Rc
            in parallel with jXm) representing core losses and magnetizing current, and secondary
            resistance R2 with leakage reactance X2.
          </p>

          <h3 style={S.h3}>Exact Equivalent Circuit</h3>
          <p style={S.p}>
            The ideal transformer at the center couples primary and secondary. To eliminate the ideal
            transformer from calculations, we refer all quantities to one side using the turns ratio a = N1/N2.
          </p>
          <span style={S.eq}>{'a = N1/N2      V1/V2 = a      I2/I1 = a'}</span>

          <h3 style={S.h3}>Referred to Primary</h3>
          <p style={S.p}>
            Secondary quantities are multiplied by a² (impedances) or a (voltages), divided by a (currents):
          </p>
          <span style={S.eq}>{"R2' = a²·R2      X2' = a²·X2      V2' = a·V2      I2' = I2/a"}</span>
          <p style={S.p}>
            The equivalent impedance seen from primary terminals is the sum of primary leakage impedance
            plus the parallel combination of shunt branch and referred secondary impedance.
          </p>

          <h3 style={S.h3}>Referred to Secondary</h3>
          <p style={S.p}>
            Similarly, dividing all primary parameters by a²:
          </p>
          <span style={S.eq}>{"R1'' = R1/a²      X1'' = X1/a²      Rc'' = Rc/a²      Xm'' = Xm/a²"}</span>
          <p style={S.p}>
            This is useful when the secondary is the working side (e.g., distribution transformers where
            LV side parameters are more directly measurable).
          </p>

          <h3 style={S.h3}>Core Loss Resistance Rc</h3>
          <p style={S.p}>
            Rc represents the power consumed by the magnetic core through hysteresis and eddy currents.
            It appears as a shunt resistor because core loss depends on the applied voltage (hence core flux),
            not load current. A higher Rc means lower core losses. Typical values for large transformers
            are in the range of hundreds to thousands of ohms (referred to primary at HV).
          </p>
          <span style={S.eq}>{'Pfe = Vmid² / Rc     (approximately V1² / Rc for approximate circuit)'}</span>

          <h3 style={S.h3}>Magnetizing Reactance Xm</h3>
          <p style={S.p}>
            Xm represents the reactive power required to establish the core flux. The magnetizing current
            Im = V1/Xm lags V1 by 90°. A larger Xm means less no-load current, which is desirable.
            Together Ic and Im form the no-load current I0 = Ic + Im.
          </p>
          <span style={S.eq}>{'I0 = Ic + Im = V1/Rc - jV1/Xm      |I0| = V1·√(1/Rc² + 1/Xm²)'}</span>

          <h3 style={S.h3}>Loss Calculation</h3>
          <span style={S.eq}>{'Pcu = I1²·R1 + I2²·R2     (copper/winding losses)'}</span>
          <span style={S.eq}>{'Pfe ≈ V1²/Rc              (core/iron losses)'}</span>
          <span style={S.eq}>{'η = P2/(P2 + Pcu + Pfe) × 100%'}</span>

          <h3 style={S.h3}>Voltage Regulation</h3>
          <p style={S.p}>
            Voltage regulation measures how much the secondary voltage drops from no-load to full load,
            as a percentage of full-load voltage:
          </p>
          <span style={S.eq}>{'VR = (V2_NL - V2_FL) / V2_FL × 100%'}</span>
          <p style={S.p}>
            A lower VR is better. For lagging power factor loads, VR is positive (voltage falls under load).
            For leading power factor, VR can be negative (Ferranti-like voltage rise).
          </p>

          <h3 style={S.h3}>Approximate Circuit</h3>
          <p style={S.p}>
            In the approximate equivalent circuit, the shunt branch is moved to the input terminal (before
            R1, X1). This simplifies calculations with negligible error for most power transformers because
            the voltage drop across Z1 at no-load is small. This allows decoupled computation of core losses
            (from V1) and copper losses (from load current).
          </p>

          <div style={S.ctx}>
            <span style={S.ctxT}>AP Transco Context — Nellore Substation</span>
            <p style={S.ctxP}>
              For a 25 MVA, 132/33 kV power transformer at Nellore 220/132/33 kV substation (AP Transco),
              typical parameters referred to 132 kV primary are approximately: R1 ≈ 1.8 Ω, X1 ≈ 28 Ω,
              R2' ≈ 0.5 Ω, X2' ≈ 18 Ω, Rc ≈ 45,000 Ω, Xm ≈ 12,000 Ω. The no-load current is typically
              0.5–1% of rated current; efficiency at full load 0.85 p.f. exceeds 99%. Voltage regulation
              at full load lagging is around 4–6%. Short-circuit impedance (Zeq%) is typically 8–10% for
              such transformers to limit fault current on the 33 kV bus. The equivalent circuit parameters
              are determined from open-circuit (OC) and short-circuit (SC) tests performed on-site during
              commissioning.
            </p>
          </div>

          <h3 style={S.h3}>Open-Circuit and Short-Circuit Tests</h3>
          <table style={S.tbl}>
            <thead>
              <tr>
                <th style={S.th}>Test</th>
                <th style={S.th}>Energized Side</th>
                <th style={S.th}>Parameters Obtained</th>
                <th style={S.th}>Measurements</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={S.td}>Open-Circuit (OC)</td>
                <td style={S.td}>LV (secondary) at rated V</td>
                <td style={S.td}>Rc, Xm (referred to LV)</td>
                <td style={S.td}>V0, I0, P0</td>
              </tr>
              <tr>
                <td style={S.td}>Short-Circuit (SC)</td>
                <td style={S.td}>HV (primary) at reduced V</td>
                <td style={S.td}>Req = R1+R2', Xeq = X1+X2'</td>
                <td style={S.td}>Vsc, Isc, Psc</td>
              </tr>
            </tbody>
          </table>

          <h3 style={S.h3}>References</h3>
          <ul style={S.ul}>
            <li style={S.li}>Chapman, S.J. — <em>Electric Machinery Fundamentals</em>, 5th Ed., McGraw-Hill (Chapter 2: Transformers)</li>
            <li style={S.li}>Theraja, B.L. & Theraja, A.K. — <em>A Textbook of Electrical Technology</em>, Vol. II (Chapter on Transformers)</li>
            <li style={S.li}>Kothari, D.P. & Nagrath, I.J. — <em>Electric Machines</em>, 4th Ed., Tata McGraw-Hill</li>
            <li style={S.li}>AP Transco — Transformer Maintenance Manual, Asset Management Division, Hyderabad</li>
          </ul>
        </div>
      )}
    </div>
  );
}
