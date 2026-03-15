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
  slider: { width: 130, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 50, textAlign: 'right' },
  results: { display: 'flex', gap: 32, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
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
  vb: { display: 'flex', gap: 6, padding: '8px 24px 0' },
  vn: (a) => ({ padding: '5px 14px', borderRadius: 8, border: '1px solid ' + (a ? '#4f46e5' : '#27272a'), background: a ? 'rgba(99,102,241,0.1)' : 'transparent', color: a ? '#a5b4fc' : '#52525b', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  sel: { padding: '4px 10px', borderRadius: 8, border: '1px solid #3f3f46', background: '#18181b', color: '#e4e4e7', fontSize: 13, cursor: 'pointer', outline: 'none' },
};

const MU = 4 * Math.PI * 1e-7;
const MATS = {
  aluminum: { name: 'Aluminum', sigma: 3.5e7 },
  copper: { name: 'Copper', sigma: 5.8e7 },
};

function sd(f, s) { return f <= 0 ? Infinity : 1 / Math.sqrt(Math.PI * f * MU * s); }
function rr(R, d) { if (!isFinite(d)) return 1; const x = (R / (2 * d)) ** 4; return 1 + x / (3 + x); }

function hc(t) {
  t = Math.max(0, Math.min(1, t));
  const c = [[0, 8, 8, 28], [.2, 28, 25, 108], [.4, 15, 85, 178], [.55, 6, 168, 210], [.7, 50, 200, 140], [.85, 240, 180, 30], [1, 248, 78, 48]];
  for (let i = 0; i < c.length - 1; i++) {
    if (t <= c[i + 1][0]) {
      const f = (t - c[i][0]) / (c[i + 1][0] - c[i][0]);
      return `rgb(${Math.round(c[i][1] + f * (c[i + 1][1] - c[i][1]))},${Math.round(c[i][2] + f * (c[i + 1][2] - c[i][2]))},${Math.round(c[i][3] + f * (c[i + 1][3] - c[i][3]))})`;
    }
  }
  return 'rgb(248,78,48)';
}

function SkinView({ freq, rmm, sigma }) {
  const N = 40, CX = 175, CY = 195, MR = 130;

  const { rings, skinPx } = useMemo(() => {
    const dmm = sd(freq, sigma) * 1000;
    const sc = MR / rmm;
    const arr = [];
    for (let i = N; i >= 0; i--) {
      const r = (i / N) * rmm;
      const d = isFinite(dmm) ? Math.exp(-(rmm - r) / dmm) : 1;
      arr.push(<circle key={i} cx={CX} cy={CY} r={Math.max(r * sc, 0.5)} fill={hc(d)} />);
    }
    return { rings: arr, skinPx: isFinite(dmm) && dmm < rmm ? (rmm - dmm) * sc : -1 };
  }, [freq, rmm, sigma]);

  const CL = 430, CT = 55, CW = 420, CH = 280, CB = CT + CH, MF = 500;

  const { path, areaPath, yMax, yTicks, dp } = useMemo(() => {
    const mr = rr(rmm / 1000, sd(MF, sigma));
    const ym = Math.max(1.3, Math.ceil(mr * 5) / 5 + 0.1);
    const pts = [];
    for (let f = 0; f <= MF; f += 5) {
      const r = rr(rmm / 1000, sd(f, sigma));
      const px = CL + (f / MF) * CW;
      const py = CB - ((r - 1) / (ym - 1)) * CH;
      pts.push(`${f === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`);
    }
    const p = pts.join(' ');
    const rng = ym - 1;
    const st = rng >= 0.8 ? 0.2 : rng >= 0.3 ? 0.1 : 0.05;
    const tk = [];
    for (let v = 1; v <= ym + 0.001; v += st) tk.push(Math.round(v * 1000) / 1000);
    return { path: p, areaPath: `${p} L${CL + CW},${CB} L${CL},${CB} Z`, yMax: ym, yTicks: tk, dp: st < 0.1 ? 2 : 1 };
  }, [rmm, sigma]);

  const cr = rr(rmm / 1000, sd(Math.max(freq, 0.01), sigma));
  const mx = CL + (Math.min(freq, MF) / MF) * CW;
  const my = CB - ((cr - 1) / (yMax - 1)) * CH;

  return (
    <svg viewBox="0 0 900 420" style={{ width: '100%', maxWidth: 900, height: 'auto' }}>
      <text x={CX} y={28} textAnchor="middle" fill="#d4d4d8" fontSize={12} fontWeight={600}>Conductor Cross-Section</text>
      <text x={CX} y={44} textAnchor="middle" fill="#52525b" fontSize={10}>Current density heatmap</text>

      {rings}
      <circle cx={CX} cy={CY} r={MR} fill="none" stroke="#52525b" strokeWidth={1.5} />

      {skinPx > 0 && <>
        <circle cx={CX} cy={CY} r={skinPx} fill="none" stroke="#c4b5fd" strokeWidth={1} strokeDasharray="5,3" />
        <line x1={CX + skinPx} y1={CY} x2={CX + MR} y2={CY} stroke="#c4b5fd" strokeWidth={0.7} />
        <text x={CX + skinPx + (MR - skinPx) / 2} y={CY - 7} textAnchor="middle" fill="#c4b5fd" fontSize={11} fontWeight={600}>{'δ'}</text>
      </>}

      <line x1={CX} y1={CY} x2={CX} y2={CY - MR} stroke="#71717a" strokeWidth={0.7} strokeDasharray="3,2" />
      <text x={CX + 8} y={CY - MR / 2} fill="#71717a" fontSize={9} fontWeight={500}>R = {rmm} mm</text>

      <defs>
        <linearGradient id="hl" x1="0" y1="0" x2="1" y2="0">
          {[0, .2, .4, .6, .8, 1].map(t => <stop key={t} offset={`${t * 100}%`} stopColor={hc(t)} />)}
        </linearGradient>
      </defs>
      <rect x={45} y={385} width={260} height={10} rx={4} fill="url(#hl)" />
      <text x={45} y={408} fill="#52525b" fontSize={9}>Low J</text>
      <text x={305} y={408} textAnchor="end" fill="#52525b" fontSize={9}>High J</text>
      <text x={175} y={380} textAnchor="middle" fill="#71717a" fontSize={9}>Current Density</text>

      <text x={CL + CW / 2} y={28} textAnchor="middle" fill="#d4d4d8" fontSize={12} fontWeight={600}>Rac / Rdc vs Frequency</text>
      <text x={CL + CW / 2} y={44} textAnchor="middle" fill="#52525b" fontSize={10}>Resistance increase factor</text>

      <rect x={CL} y={CT} width={CW} height={CH} rx={4} fill="#111114" stroke="#1e1e2e" />

      {yTicks.map(v => {
        const yy = CB - ((v - 1) / (yMax - 1)) * CH;
        return <g key={v}>
          <line x1={CL} y1={yy} x2={CL + CW} y2={yy} stroke="#1e1e2e" strokeWidth={0.5} />
          <text x={CL - 6} y={yy + 3} textAnchor="end" fill="#52525b" fontSize={9}>{v.toFixed(dp)}</text>
        </g>;
      })}

      {[0, 100, 200, 300, 400, 500].map(f => {
        const xx = CL + (f / MF) * CW;
        return <g key={f}>
          {f > 0 && <line x1={xx} y1={CT} x2={xx} y2={CB} stroke="#1e1e2e" strokeWidth={0.5} />}
          <text x={xx} y={CB + 14} textAnchor="middle" fill="#52525b" fontSize={9}>{f}</text>
        </g>;
      })}

      <text x={CL + CW / 2} y={CB + 32} textAnchor="middle" fill="#71717a" fontSize={10}>Frequency (Hz)</text>
      <text x={CL - 32} y={CT + CH / 2} textAnchor="middle" fill="#71717a" fontSize={10} transform={`rotate(-90,${CL - 32},${CT + CH / 2})`}>Rac / Rdc</text>

      <path d={path} fill="none" stroke="#818cf8" strokeWidth={2} />
      <path d={areaPath} fill="rgba(99,102,241,0.06)" />

      {/* Region annotations */}
      <rect x={CL + 4} y={CB - 22} width={CW * 0.25} height={18} rx={4} fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" strokeWidth={0.5} />
      <text x={CL + 4 + CW * 0.125} y={CB - 10} textAnchor="middle" fill="#22c55e" fontSize={8} fontWeight={500}>Negligible</text>
      {yMax > 1.05 && <>
        <rect x={CL + CW * 0.55} y={CT + 6} width={CW * 0.42} height={18} rx={4} fill="rgba(245,158,11,0.08)" stroke="rgba(245,158,11,0.2)" strokeWidth={0.5} />
        <text x={CL + CW * 0.76} y={CT + 18} textAnchor="middle" fill="#f59e0b" fontSize={8} fontWeight={500}>Significant skin effect</text>
      </>}

      {freq <= MF && <>
        <line x1={mx} y1={CT} x2={mx} y2={CB} stroke="#6366f1" strokeWidth={1} strokeDasharray="3,3" opacity={0.4} />
        <circle cx={mx} cy={my} r={5} fill="#6366f1" stroke="#e4e4e7" strokeWidth={1.5} />
        <text x={mx + (mx > CL + CW - 60 ? -10 : 10)} y={my - 10} textAnchor={mx > CL + CW - 60 ? 'end' : 'start'} fill="#e4e4e7" fontSize={9} fontWeight={600}>{cr.toFixed(3)}</text>
      </>}
    </svg>
  );
}

function ProximityView({ rmm, sigma, freq }) {
  const MR = 80, CY = 165, gap = MR * 0.5;
  const C1 = 180, C2 = C1 + 2 * MR + gap;
  const dmm = sd(freq, sigma) * 1000;
  const pf = isFinite(dmm) ? Math.min(1, rmm / (dmm * 2.5)) : 0;

  return (
    <svg viewBox="0 0 700 360" style={{ width: '100%', maxWidth: 700, height: 'auto' }}>
      <text x={350} y={28} textAnchor="middle" fill="#d4d4d8" fontSize={12} fontWeight={600}>Proximity Effect — Adjacent Conductors</text>
      <text x={350} y={44} textAnchor="middle" fill="#52525b" fontSize={10}>Same-direction current (e.g. parallel bus bars)</text>

      <defs>
        <linearGradient id="pL" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor={hc(0.75 - 0.55 * pf)} />
          <stop offset="100%" stopColor={hc(0.75 + 0.25 * pf)} />
        </linearGradient>
        <linearGradient id="pR" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={hc(0.75 - 0.55 * pf)} />
          <stop offset="100%" stopColor={hc(0.75 + 0.25 * pf)} />
        </linearGradient>
        <marker id="aw" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#f59e0b" />
        </marker>
      </defs>

      <circle cx={C1} cy={CY} r={MR} fill={pf > 0.02 ? 'url(#pL)' : hc(0.75)} />
      <circle cx={C1} cy={CY} r={MR} fill="none" stroke="#52525b" strokeWidth={1.5} />
      <circle cx={C2} cy={CY} r={MR} fill={pf > 0.02 ? 'url(#pR)' : hc(0.75)} />
      <circle cx={C2} cy={CY} r={MR} fill="none" stroke="#52525b" strokeWidth={1.5} />

      <circle cx={C1} cy={CY} r={8} fill="none" stroke="#c4b5fd" strokeWidth={1.2} />
      <circle cx={C1} cy={CY} r={2} fill="#c4b5fd" />
      <circle cx={C2} cy={CY} r={8} fill="none" stroke="#c4b5fd" strokeWidth={1.2} />
      <circle cx={C2} cy={CY} r={2} fill="#c4b5fd" />

      <text x={C1} y={CY + MR + 20} textAnchor="middle" fill="#71717a" fontSize={10}>Conductor 1</text>
      <text x={C2} y={CY + MR + 20} textAnchor="middle" fill="#71717a" fontSize={10}>Conductor 2</text>

      <text x={C1} y={CY - MR - 8} textAnchor="middle" fill="#52525b" fontSize={9}>I (out of page)</text>
      <text x={C2} y={CY - MR - 8} textAnchor="middle" fill="#52525b" fontSize={9}>I (out of page)</text>

      {pf > 0.05 && <>
        <line x1={C1 + 14} y1={62} x2={C1 - 24} y2={62} stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#aw)" />
        <line x1={C2 - 14} y1={62} x2={C2 + 24} y2={62} stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#aw)" />
        <text x={(C1 + C2) / 2} y={56} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight={500}>Current density shifts to far sides</text>
      </>}

      <line x1={C1 + MR} y1={CY + MR + 36} x2={C2 - MR} y2={CY + MR + 36} stroke="#3f3f46" strokeWidth={0.8} />
      <line x1={C1 + MR} y1={CY + MR + 31} x2={C1 + MR} y2={CY + MR + 41} stroke="#3f3f46" strokeWidth={0.8} />
      <line x1={C2 - MR} y1={CY + MR + 31} x2={C2 - MR} y2={CY + MR + 41} stroke="#3f3f46" strokeWidth={0.8} />
      <text x={(C1 + C2) / 2} y={CY + MR + 52} textAnchor="middle" fill="#52525b" fontSize={9}>Spacing</text>

      <rect x={60} y={285} width={580} height={60} rx={8} fill="#18181b" stroke="#27272a" />
      <text x={80} y={304} fill="#a1a1aa" fontSize={11}>Magnetic fields from adjacent conductors redistribute current density. For same-direction</text>
      <text x={80} y={320} fill="#a1a1aa" fontSize={11}>currents, mutual fields oppose current on near sides, pushing it outward. For opposite-direction</text>
      <text x={80} y={336} fill="#a1a1aa" fontSize={11}>currents (go-and-return pairs), current concentrates on near sides instead.</text>
    </svg>
  );
}

function TheorySVGCrossSection() {
  return (
    <svg viewBox="0 0 760 340" style={{ width: '100%', maxWidth: 760, height: 'auto', margin: '20px 0' }}>
      <rect width="760" height="340" rx="12" fill="#111114" stroke="#27272a" />
      <text x="380" y="28" textAnchor="middle" fill="#d4d4d8" fontSize={14} fontWeight={700}>Current Density Distribution in a Conductor Cross-Section</text>

      {/* Left: DC case */}
      <text x="145" y="56" textAnchor="middle" fill="#a5b4fc" fontSize={12} fontWeight={600}>DC (f = 0)</text>
      <defs>
        <radialGradient id="dcGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.7" />
        </radialGradient>
        <radialGradient id="acGrad50" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.05" />
          <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.15" />
          <stop offset="85%" stopColor="#f59e0b" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id="acGradHF" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.01" />
          <stop offset="75%" stopColor="#22d3ee" stopOpacity="0.03" />
          <stop offset="90%" stopColor="#f59e0b" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="1.0" />
        </radialGradient>
      </defs>
      <circle cx="145" cy="165" r="80" fill="url(#dcGrad)" />
      <circle cx="145" cy="165" r="80" fill="none" stroke="#52525b" strokeWidth={1.5} />
      <text x="145" y="170" textAnchor="middle" fill="#e4e4e7" fontSize={10} fontWeight={500}>Uniform J</text>
      <text x="145" y="268" textAnchor="middle" fill="#71717a" fontSize={10}>J = I / (pi*R²)</text>

      {/* Center: 50 Hz */}
      <text x="380" y="56" textAnchor="middle" fill="#a5b4fc" fontSize={12} fontWeight={600}>50 Hz (Power Frequency)</text>
      <circle cx="380" cy="165" r="80" fill="url(#acGrad50)" />
      <circle cx="380" cy="165" r="80" fill="none" stroke="#52525b" strokeWidth={1.5} />
      <circle cx="380" cy="165" r="56" fill="none" stroke="#c4b5fd" strokeWidth={1} strokeDasharray="5,3" />
      <line x1="380" y1="165" x2="460" y2="165" stroke="#c4b5fd" strokeWidth={0.8} />
      <line x1="380" y1="165" x2="380" y2="85" stroke="#71717a" strokeWidth={0.6} strokeDasharray="3,2" />
      <text x="420" y="158" textAnchor="middle" fill="#c4b5fd" fontSize={11} fontWeight={700}>delta</text>
      <text x="395" y="126" fill="#71717a" fontSize={9}>R</text>
      <text x="380" y="268" textAnchor="middle" fill="#71717a" fontSize={10}>J concentrates near surface</text>

      {/* Right: High frequency */}
      <text x="615" y="56" textAnchor="middle" fill="#a5b4fc" fontSize={12} fontWeight={600}>High Frequency (kHz+)</text>
      <circle cx="615" cy="165" r="80" fill="url(#acGradHF)" />
      <circle cx="615" cy="165" r="80" fill="none" stroke="#52525b" strokeWidth={1.5} />
      <circle cx="615" cy="165" r="72" fill="none" stroke="#ef4444" strokeWidth={1} strokeDasharray="4,3" />
      <text x="615" y="158" textAnchor="middle" fill="#52525b" fontSize={9}>~No current</text>
      <text x="615" y="170" textAnchor="middle" fill="#52525b" fontSize={9}>in core</text>
      <text x="615" y="268" textAnchor="middle" fill="#71717a" fontSize={10}>Thin skin carries all current</text>

      {/* Color legend */}
      <defs>
        <linearGradient id="thLegend" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
        </linearGradient>
      </defs>
      <rect x="230" y="298" width="300" height="10" rx="4" fill="url(#thLegend)" />
      <text x="230" y="325" fill="#52525b" fontSize={9}>Low J (center)</text>
      <text x="530" y="325" textAnchor="end" fill="#52525b" fontSize={9}>High J (surface)</text>
    </svg>
  );
}

function TheorySVGPenetrationDepth() {
  const materials = [
    { name: 'Copper', sigma: 5.8e7, color: '#f59e0b' },
    { name: 'Aluminum', sigma: 3.5e7, color: '#22d3ee' },
  ];
  const freqs = [10, 50, 100, 200, 500, 1000, 2000, 5000];
  const W = 760, H = 300;
  const PD = { t: 50, r: 30, b: 50, l: 70 };
  const pw = W - PD.l - PD.r, ph = H - PD.t - PD.b;

  const logMin = Math.log10(10), logMax = Math.log10(5000);
  const xS = (f) => PD.l + ((Math.log10(f) - logMin) / (logMax - logMin)) * pw;
  const maxD = 35;
  const yS = (d) => PD.t + ph - (Math.min(d, maxD) / maxD) * ph;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', margin: '20px 0' }}>
      <rect width={W} height={H} rx="12" fill="#111114" stroke="#27272a" />
      <text x={W / 2} y="28" textAnchor="middle" fill="#d4d4d8" fontSize={13} fontWeight={700}>Skin Depth vs Frequency</text>
      <text x={W / 2} y="44" textAnchor="middle" fill="#52525b" fontSize={10}>delta = 1 / sqrt(pi * f * mu * sigma)</text>

      {/* Grid */}
      {freqs.map(f => (
        <g key={f}>
          <line x1={xS(f)} y1={PD.t} x2={xS(f)} y2={PD.t + ph} stroke="#1e1e2e" strokeWidth={0.5} />
          <text x={xS(f)} y={PD.t + ph + 16} textAnchor="middle" fill="#52525b" fontSize={9}>{f >= 1000 ? `${f / 1000}k` : f}</text>
        </g>
      ))}
      {[0, 5, 10, 15, 20, 25, 30, 35].map(d => (
        <g key={d}>
          <line x1={PD.l} y1={yS(d)} x2={PD.l + pw} y2={yS(d)} stroke="#1e1e2e" strokeWidth={0.5} />
          <text x={PD.l - 6} y={yS(d) + 3} textAnchor="end" fill="#52525b" fontSize={9}>{d}</text>
        </g>
      ))}

      <text x={W / 2} y={H - 6} textAnchor="middle" fill="#71717a" fontSize={10}>Frequency (Hz)</text>
      <text x={18} y={PD.t + ph / 2} textAnchor="middle" fill="#71717a" fontSize={10} transform={`rotate(-90,18,${PD.t + ph / 2})`}>Skin Depth (mm)</text>

      {/* Curves */}
      {materials.map(({ name, sigma, color }) => {
        const pts = [];
        for (let f = 10; f <= 5000; f += 5) {
          const d = (1 / Math.sqrt(Math.PI * f * 4 * Math.PI * 1e-7 * sigma)) * 1000;
          pts.push(`${pts.length === 0 ? 'M' : 'L'}${xS(f).toFixed(1)},${yS(d).toFixed(1)}`);
        }
        return <g key={name}>
          <path d={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} />
          <text x={xS(20)} y={yS((1 / Math.sqrt(Math.PI * 20 * 4 * Math.PI * 1e-7 * sigma)) * 1000) - 8} fill={color} fontSize={10} fontWeight={600}>{name}</text>
        </g>;
      })}

      {/* 50 Hz marker region */}
      <rect x={xS(50) - 1} y={PD.t} width={2} height={ph} fill="#6366f1" opacity={0.3} />
      <text x={xS(50)} y={PD.t - 4} textAnchor="middle" fill="#a5b4fc" fontSize={9} fontWeight={600}>50 Hz (Power)</text>

      {/* Region annotations */}
      <rect x={xS(10)} y={PD.t + 4} width={xS(100) - xS(10)} height={18} rx={4} fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" strokeWidth={0.5} />
      <text x={(xS(10) + xS(100)) / 2} y={PD.t + 16} textAnchor="middle" fill="#22c55e" fontSize={8} fontWeight={500}>Low-f: deep penetration</text>

      <rect x={xS(500)} y={PD.t + 4} width={xS(5000) - xS(500)} height={18} rx={4} fill="rgba(239,68,68,0.08)" stroke="rgba(239,68,68,0.2)" strokeWidth={0.5} />
      <text x={(xS(500) + xS(5000)) / 2} y={PD.t + 16} textAnchor="middle" fill="#ef4444" fontSize={8} fontWeight={500}>High-f: thin skin shell</text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Skin Effect in AC Conductors</h2>
      <p style={S.p}>
        When alternating current flows through a conductor, the current density is not uniform across
        the cross-section. Instead, it concentrates near the surface — a phenomenon called the
        <strong style={{ color: '#e4e4e7' }}> skin effect</strong>. This effectively reduces the
        usable cross-sectional area and increases AC resistance compared to DC resistance.
      </p>

      <TheorySVGCrossSection />
      <p style={S.p}>
        The skin effect arises because the time-varying magnetic field inside the conductor induces
        eddy currents (by Faraday's law). These eddy currents, governed by Lenz's law, oppose the
        change in flux — reinforcing current flow near the surface while cancelling it in the interior.
        The result: at high frequencies, current is confined to a thin shell at the conductor surface.
      </p>

      <h3 style={S.h3}>Skin Depth Derivation</h3>
      <p style={S.p}>
        Starting from Maxwell's equations for a good conductor where displacement current is negligible
        compared to conduction current (σ ≫ ωε), the electromagnetic field satisfies the diffusion equation:
      </p>
      <div style={S.eq}>∇²E = μσ × ∂E/∂t</div>
      <p style={S.p}>
        For sinusoidal excitation at angular frequency ω = 2πf, the time derivative becomes jω multiplication:
      </p>
      <div style={S.eq}>∇²E = jωμσ × E</div>
      <p style={S.p}>
        For a planar surface (the simplest geometry), the solution is a decaying exponential into the conductor.
        The characteristic decay length — the <strong style={{ color: '#e4e4e7' }}>skin depth δ</strong> — is:
      </p>
      <div style={S.eq}>δ = 1 / √(π × f × μ × σ)  =  √(2 / (ωμσ))</div>
      <p style={S.p}>
        At depth δ from the surface, current density drops to <strong style={{ color: '#e4e4e7' }}>1/e ≈ 36.8%</strong> of
        its surface value. At 3δ, it drops to ~5%. The current density profile from the surface inward follows:
      </p>
      <div style={S.eq}>J(d) = J_surface × exp(−d / δ)</div>

      <TheorySVGPenetrationDepth />

      <h3 style={S.h3}>Bessel Function Solution for Cylindrical Conductors</h3>
      <p style={S.p}>
        For a cylindrical conductor of radius R, the diffusion equation must be solved in cylindrical
        coordinates. The exact solution for current density at radial distance r from the center involves
        modified Bessel functions of the first kind:
      </p>
      <div style={S.eq}>J(r) = J₀ × I₀(√(jωμσ) × r) / I₀(√(jωμσ) × R)</div>
      <p style={S.p}>
        where I₀ is the modified Bessel function of order zero. The argument is complex (containing √j),
        so the solution involves both amplitude decay and phase shift as a function of radius. When R ≫ δ,
        the cylindrical solution approaches the planar approximation used in this simulation. For power
        frequency (50 Hz) with typical conductor sizes (5–25 mm), the exponential approximation gives
        results within a few percent of the exact Bessel solution.
      </p>

      <h3 style={S.h3}>Skin Depth at 50 Hz — Common Materials</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Material</th>
            <th style={S.th}>σ (S/m)</th>
            <th style={S.th}>δ at 50 Hz</th>
            <th style={S.th}>μᵣ</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Aluminum', '3.5 × 10⁷', '12.1 mm', '1.0'],
            ['Copper', '5.8 × 10⁷', '9.4 mm', '1.0'],
            ['Steel (mild)', '~7 × 10⁶', '~0.5–1.0 mm', '100–200'],
          ].map(([m, s, d, mu]) => (
            <tr key={m}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{m}</td>
              <td style={S.td}>{s}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{d}</td>
              <td style={S.td}>{mu}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={S.p}>
        Steel's skin depth is dramatically smaller due to its high magnetic permeability (μᵣ ≫ 1).
        This is why the steel core in ACSR conductors carries negligible AC current — virtually all
        current flows in the outer aluminum strands.
      </p>

      <h3 style={S.h3}>Why ACSR Uses Stranded Construction</h3>
      <p style={S.p}>
        ACSR (Aluminium Conductor Steel Reinforced) uses multiple aluminum strands wound around a
        steel core. This stranded construction mitigates skin effect in several ways:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Increased surface area</strong> — Multiple strands provide greater total surface perimeter than a solid conductor of equivalent cross-section, increasing the effective current-carrying area near the surface.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Air gaps between strands</strong> — Small gaps between individual strands partially interrupt eddy current loops, reducing the overall skin effect.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Steel core carries no AC</strong> — With δ ≈ 0.5 mm for steel at 50 Hz, the steel core acts purely as mechanical reinforcement, not an electrical conductor.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Flexibility</strong> — Stranded construction allows the large-diameter conductor to be wound on drums and strung between towers.</li>
      </ul>

      <h3 style={S.h3}>Proximity Effect</h3>
      <p style={S.p}>
        When two or more current-carrying conductors are close together, the magnetic field from each
        conductor influences current distribution in its neighbors. This <strong style={{ color: '#e4e4e7' }}>proximity
        effect</strong> further distorts current density beyond what skin effect alone would cause:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Same-direction currents</strong> — Current shifts to the far sides (away from each other). The magnetic field between conductors opposes current flow on the near sides.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Opposite-direction currents</strong> — Current concentrates on the near sides (toward each other), as in go-and-return cable pairs.</li>
        <li style={S.li}>In three-phase power lines, adjacent phases carry currents 120° apart, creating a complex proximity pattern. The effect is most significant in closely-spaced bus bars and cable trays, adding 2–10% to effective resistance.</li>
      </ul>

      <h3 style={S.h3}>Impact on 50 Hz Power vs Higher Harmonics</h3>
      <p style={S.p}>
        Since δ ∝ 1/√f, higher-order harmonics penetrate far less deeply into the conductor,
        experiencing much greater resistance increase:
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Harmonic</th>
            <th style={S.th}>Frequency</th>
            <th style={S.th}>δ Aluminum</th>
            <th style={S.th}>δ Copper</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Fundamental', '50 Hz', '12.1 mm', '9.4 mm'],
            ['3rd', '150 Hz', '7.0 mm', '5.4 mm'],
            ['5th', '250 Hz', '5.4 mm', '4.2 mm'],
            ['7th', '350 Hz', '4.6 mm', '3.5 mm'],
            ['11th', '550 Hz', '3.7 mm', '2.8 mm'],
          ].map(([h, f, da, dc]) => (
            <tr key={h}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{h}</td>
              <td style={S.td}>{f}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{da}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{dc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={S.p}>
        Conductors carrying harmonic-rich currents (from VFDs, power electronic loads, rectifiers)
        experience significantly higher losses than their 50 Hz rating suggests. Cable derating factors
        must account for harmonic content per IS 1554 and IEC 60287.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Real-World Context — AP Transco 400 kV Lines</span>
        <p style={S.ctxP}>
          In AP Transco's 400 kV lines using ACSR Moose conductor (overall radius ≈ 16 mm), the skin depth
          at 50 Hz for aluminum is approximately 12 mm. Since the conductor radius exceeds the skin depth,
          the Rac/Rdc ratio is about 1.02–1.05 — a small but non-negligible increase in effective resistance.
          For the quad-bundle configuration used on 400 kV lines, proximity effect between the four
          sub-conductors (spaced ~450 mm apart) adds another 1–3% to effective resistance. Over hundreds of
          kilometres of transmission line, even a 5% resistance increase translates to megawatts of additional
          I²R losses and significant economic impact on transmission charges.
        </p>
      </div>

      <div style={S.ctx}>
        <span style={S.ctxT}>Assumptions in This Simulation</span>
        <p style={S.ctxP}>
          This simulation models a solid cylindrical conductor, not stranded construction. The Rac/Rdc
          formula Rac/Rdc ≈ 1 + (R/2δ)⁴ / (3 + (R/2δ)⁴) is an approximation for solid round conductors.
          For stranded conductors like ACSR Moose, actual skin effect is somewhat less severe. The exponential
          current density model is a simplification of the exact Bessel function solution. Conductor temperature
          effects on resistivity (~+0.4%/°C for aluminum) are not modelled. The proximity effect visualisation
          is qualitative — the exact redistribution pattern depends on conductor spacing, frequency, and relative
          current directions.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>W.H. Hayt & J.A. Buck — <em>Engineering Electromagnetics</em>, 9th Ed. (Chapters 9–10)</li>
        <li style={S.li}>IS 398 (Part 2) — Aluminium Conductors for Overhead Transmission — Specification</li>
        <li style={S.li}>IS 1554 — PVC Insulated Cables — Current Rating and Derating Factors</li>
        <li style={S.li}>IEC 60287 — Electric Cables — Calculation of Current Rating (Skin & Proximity Effect Factors)</li>
        <li style={S.li}>CIGRÉ Technical Brochure 345 — AC Resistance of Stranded Conductors</li>
      </ul>
    </div>
  );
}

export default function SkinEffect() {
  const [tab, setTab] = useState('simulate');
  const [view, setView] = useState('skin');
  const [freq, setFreq] = useState(50);
  const [radius, setRadius] = useState(16);
  const [material, setMaterial] = useState('aluminum');

  const mat = MATS[material];
  const dM = sd(freq, mat.sigma);
  const dMM = dM * 1000;
  const Rm = radius / 1000;
  const rat = rr(Rm, dM);
  const rdc = (1 / mat.sigma) * 1000 / (Math.PI * Rm * Rm);
  const rac = rdc * rat;
  const pen = isFinite(dMM) ? Math.min(dMM, radius) : radius;

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.vb}>
            <button style={S.vn(view === 'skin')} onClick={() => setView('skin')}>Skin Effect</button>
            <button style={S.vn(view === 'proximity')} onClick={() => setView('proximity')}>Proximity Effect</button>
          </div>

          <div style={S.svgWrap}>
            {view === 'skin'
              ? <SkinView freq={freq} rmm={radius} sigma={mat.sigma} />
              : <ProximityView rmm={radius} sigma={mat.sigma} freq={freq} />}
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Skin Depth</span>
              <span style={{ ...S.rv, color: '#818cf8' }}>{freq <= 0 ? '∞ (DC)' : `${dMM.toFixed(1)} mm`}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Rac / Rdc</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{rat.toFixed(4)}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Effective Rac</span>
              <span style={{ ...S.rv, color: '#ef4444' }}>{rac.toFixed(4)} Ω/km</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Penetration Depth</span>
              <span style={{ ...S.rv, color: '#22c55e' }}>{freq <= 0 ? `${radius} mm (full)` : `${pen.toFixed(1)} mm`}</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Frequency (Hz)</span>
              <input type="range" min={0} max={1000} step={1} value={freq}
                onChange={e => setFreq(+e.target.value)} style={S.slider} />
              <span style={S.val}>{freq === 0 ? 'DC' : freq}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Radius (mm)</span>
              <input type="range" min={5} max={25} step={0.5} value={radius}
                onChange={e => setRadius(+e.target.value)} style={S.slider} />
              <span style={S.val}>{radius}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Material</span>
              <select value={material} onChange={e => setMaterial(e.target.value)} style={S.sel}>
                <option value="aluminum">Aluminum</option>
                <option value="copper">Copper</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
