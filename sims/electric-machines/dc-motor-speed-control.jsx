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
  eqBox: { padding: '16px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, margin: '16px 0', overflowX: 'auto' },
  eqStep: { fontFamily: 'monospace', fontSize: 14, color: '#a1a1aa', margin: '6px 0', lineHeight: 1.6 },
  eqResult: { fontFamily: 'monospace', fontSize: 15, color: '#c4b5fd', margin: '8px 0 0', fontWeight: 600 },
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14, display: 'block' },
  ctxP: { fontSize: 14, lineHeight: 1.7, color: '#a1a1aa', margin: 0 },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  tbl: { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #3f3f46', color: '#d4d4d8', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #27272a', color: '#a1a1aa' },
  svgDiagram: { width: '100%', margin: '20px 0', borderRadius: 12, border: '1px solid #27272a', background: '#0f0f13', padding: 0 },
};

const KE_RATED = 1.5;
const RA_BASE = 0.5;
const V_RATED = 220;
const IA_RATED = 30;

function ntCurve(V, Ke, Ra, maxT) {
  const pts = [];
  for (let T = 0; T <= maxT; T += 0.5) {
    const Ia = Ke > 0.01 ? T / Ke : 9999;
    if (Ia > IA_RATED * 2.5) break;
    const Eb = V - Ia * Ra;
    if (Eb <= 0) break;
    const N = (Eb / Ke) * 30 / Math.PI;
    pts.push({ t: T, n: N, ia: Ia });
  }
  return pts;
}

function opPoint(V, Ke, Ra, TL) {
  if (Ke < 0.01) return null;
  const Ia = TL / Ke;
  const Eb = V - Ia * Ra;
  if (Eb <= 0) return { t: TL, n: 0, ia: V / Ra, stalled: true };
  const N = (Eb / Ke) * 30 / Math.PI;
  const P = Eb * Ia;
  const eta = V * Ia > 0 ? (P / (V * Ia)) * 100 : 0;
  return { t: TL, n: N, ia: Ia, P, eta, stalled: false };
}

const METHODS = [
  { id: 'av', label: 'Armature Voltage', color: '#22c55e', desc: 'Below base speed \u2014 constant torque' },
  { id: 'fw', label: 'Field Weakening', color: '#f59e0b', desc: 'Above base speed \u2014 constant power' },
  { id: 'ar', label: 'Armature Resistance', color: '#ef4444', desc: 'Variable speed \u2014 lossy method' },
];

/* Small circuit schematic for current control method */
function MethodCircuit({ method }) {
  const w = 170, h = 85;
  return (
    <g transform="translate(10, 10)">
      <rect x={0} y={0} width={w} height={h} rx={6} fill="rgba(15,15,19,0.92)" stroke="#27272a" strokeWidth={0.8} />
      <text x={w/2} y={12} textAnchor="middle" fill="#52525b" fontSize={7} fontWeight={600}>
        {method === 'av' ? 'ARMATURE VOLTAGE CTRL' : method === 'fw' ? 'FIELD WEAKENING' : 'ARMATURE RESISTANCE'}
      </text>
      {/* Vt */}
      <circle cx={20} cy={46} r={9} fill="none" stroke="#6366f1" strokeWidth={0.8} />
      <text x={20} y={49} textAnchor="middle" fill="#6366f1" fontSize={6}>V</text>
      {/* Top wire */}
      <line x1={20} y1={37} x2={20} y2={22} stroke="#52525b" strokeWidth={0.6} />
      <line x1={20} y1={22} x2={150} y2={22} stroke="#52525b" strokeWidth={0.6} />
      {/* Motor */}
      <circle cx={135} cy={46} r={10} fill="none" stroke="#f59e0b" strokeWidth={0.8} />
      <text x={135} y={49} textAnchor="middle" fill="#f59e0b" fontSize={7}>M</text>
      <line x1={135} y1={36} x2={135} y2={22} stroke="#52525b" strokeWidth={0.6} />
      <line x1={135} y1={56} x2={135} y2={72} stroke="#52525b" strokeWidth={0.6} />
      {/* Bottom */}
      <line x1={20} y1={55} x2={20} y2={72} stroke="#52525b" strokeWidth={0.6} />
      <line x1={20} y1={72} x2={150} y2={72} stroke="#52525b" strokeWidth={0.6} />

      {method === 'av' && (
        <g>
          {/* Variable voltage indicator on source */}
          <line x1={8} y1={40} x2={14} y2={52} stroke="#22c55e" strokeWidth={1.5} />
          <polygon points="8,38 5,42 11,42" fill="#22c55e" />
          <text x={5} y={58} fill="#22c55e" fontSize={5}>Var V</text>
          {/* Ra */}
          <rect x={60} y={18} width={22} height={8} rx={2} fill="none" stroke="#ef4444" strokeWidth={0.6} />
          <text x={71} y={16} textAnchor="middle" fill="#ef4444" fontSize={5}>R<tspan dy={1} fontSize={4}>a</tspan></text>
        </g>
      )}
      {method === 'fw' && (
        <g>
          {/* Ra */}
          <rect x={55} y={18} width={22} height={8} rx={2} fill="none" stroke="#ef4444" strokeWidth={0.6} />
          <text x={66} y={16} textAnchor="middle" fill="#ef4444" fontSize={5}>R<tspan dy={1} fontSize={4}>a</tspan></text>
          {/* Field winding with variable resistor */}
          <line x1={110} y1={22} x2={110} y2={32} stroke="#f59e0b" strokeWidth={0.5} />
          <rect x={105} y={32} width={10} height={20} rx={2} fill="none" stroke="#f59e0b" strokeWidth={0.6} />
          <text x={100} y={45} textAnchor="end" fill="#f59e0b" fontSize={4}>R<tspan dy={1} fontSize={3}>f</tspan></text>
          <line x1={110} y1={52} x2={110} y2={72} stroke="#f59e0b" strokeWidth={0.5} />
          {/* Arrow indicating variable */}
          <line x1={118} y1={36} x2={102} y2={48} stroke="#f59e0b" strokeWidth={0.8} />
          <polygon points="118,34 115,38 120,38" fill="#f59e0b" />
        </g>
      )}
      {method === 'ar' && (
        <g>
          {/* Ra internal */}
          <rect x={50} y={18} width={18} height={8} rx={2} fill="none" stroke="#ef4444" strokeWidth={0.6} />
          <text x={59} y={16} textAnchor="middle" fill="#ef4444" fontSize={5}>R<tspan dy={1} fontSize={4}>a</tspan></text>
          {/* Ra_ext with variable */}
          <rect x={76} y={18} width={22} height={8} rx={2} fill="none" stroke="#ef4444" strokeWidth={0.8} />
          <text x={87} y={16} textAnchor="middle" fill="#ef4444" fontSize={4}>R<tspan dy={1} fontSize={3}>ext</tspan></text>
          <line x1={95} y1={14} x2={79} y2={28} stroke="#ef4444" strokeWidth={0.8} />
          <polygon points="95,12 92,16 97,16" fill="#ef4444" />
          {/* Heat symbol */}
          <text x={87} y={34} textAnchor="middle" fill="#ef4444" fontSize={6}>~heat~</text>
        </g>
      )}
    </g>
  );
}

function Chart({ method, V, Ke, Ra, TL }) {
  const PX = 75, PY = 35, PW = 420, PH = 240;
  const T_MAX = 55, N_MAX = 3000;
  const sx = v => PX + (v / T_MAX) * PW;
  const sy = v => PY + PH - (Math.min(v, N_MAX) / N_MAX) * PH;
  const toPath = pts => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.t).toFixed(1)},${sy(p.n).toFixed(1)}`).join('');

  let family = [];
  let activeIdx = 0;
  const mColor = METHODS.find(m => m.id === method).color;

  if (method === 'av') {
    const volts = [60, 100, 140, 180, 220];
    family = volts.map(v => ({ label: `${v}V`, pts: ntCurve(v, KE_RATED, RA_BASE, T_MAX), v }));
    activeIdx = volts.indexOf(V) >= 0 ? volts.indexOf(V) : volts.reduce((best, v, i) => Math.abs(v - V) < Math.abs(volts[best] - V) ? i : best, 0);
  } else if (method === 'fw') {
    const kes = [1.5, 1.2, 0.9, 0.6, 0.4];
    family = kes.map(k => ({ label: `K\u03C6=${k.toFixed(1)}`, pts: ntCurve(V_RATED, k, RA_BASE, T_MAX), k }));
    activeIdx = kes.reduce((best, k, i) => Math.abs(k - Ke) < Math.abs(kes[best] - Ke) ? i : best, 0);
  } else {
    const ras = [0.5, 2, 4, 8, 14];
    family = ras.map(r => ({ label: `Ra=${r}\u03A9`, pts: ntCurve(V_RATED, KE_RATED, r, T_MAX), r }));
    activeIdx = ras.reduce((best, r, i) => Math.abs(r - Ra) < Math.abs(ras[best] - Ra) ? i : best, 0);
  }

  const op = opPoint(V, Ke, Ra, TL);

  const yTicks = [0, 500, 1000, 1500, 2000, 2500, 3000];
  const xTicks = [0, 10, 20, 30, 40, 50];

  const EP_X = 560, EP_Y = PY, EP_W = 360, EP_H = PH;
  const baseN = (V_RATED / KE_RATED) * 30 / Math.PI;
  const maxN = baseN * 2.5;
  const T_rated = KE_RATED * IA_RATED;
  const P_rated = V_RATED * IA_RATED;
  const esx = n => EP_X + (n / maxN) * EP_W;
  const esy_t = t => EP_Y + EP_H - (t / (T_rated * 1.2)) * EP_H;
  const esy_p = p => EP_Y + EP_H - (p / (P_rated * 1.2)) * EP_H;

  const envTorque = [];
  const envPower = [];
  for (let n = 10; n <= maxN; n += 20) {
    if (n <= baseN) {
      envTorque.push({ n, v: T_rated });
      envPower.push({ n, v: T_rated * n * Math.PI / 30 });
    } else {
      envPower.push({ n, v: P_rated });
      envTorque.push({ n, v: P_rated / (n * Math.PI / 30) });
    }
  }
  const envTPath = envTorque.map((p, i) => `${i === 0 ? 'M' : 'L'}${esx(p.n).toFixed(1)},${esy_t(p.v).toFixed(1)}`).join('');
  const envPPath = envPower.map((p, i) => `${i === 0 ? 'M' : 'L'}${esx(p.n).toFixed(1)},${esy_p(p.v).toFixed(1)}`).join('');

  return (
    <svg viewBox="0 0 960 340" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      {/* ── Left: Speed-Torque Curves ── */}
      <text x={(PX + PX + PW) / 2} y={18} textAnchor="middle" fill="#71717a" fontSize={12} fontWeight={600}>
        Speed\u2013Torque Curves ({METHODS.find(m => m.id === method).label})
      </text>

      {yTicks.map(v => <line key={`yg${v}`} x1={PX} y1={sy(v)} x2={PX + PW} y2={sy(v)} stroke="#1e1e2e" strokeWidth={1} />)}
      {xTicks.map(v => <line key={`xg${v}`} x1={sx(v)} y1={PY} x2={sx(v)} y2={PY + PH} stroke="#1e1e2e" strokeWidth={1} />)}
      <line x1={PX} y1={PY} x2={PX} y2={PY + PH} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={PX} y1={PY + PH} x2={PX + PW} y2={PY + PH} stroke="#3f3f46" strokeWidth={1.5} />
      {yTicks.map(v => <text key={`yl${v}`} x={PX - 6} y={sy(v) + 4} textAnchor="end" fill="#52525b" fontSize={9}>{v}</text>)}
      {xTicks.map(v => <text key={`xl${v}`} x={sx(v)} y={PY + PH + 16} textAnchor="middle" fill="#52525b" fontSize={9}>{v}</text>)}
      <text x={(PX + PX + PW) / 2} y={PY + PH + 32} textAnchor="middle" fill="#71717a" fontSize={10}>Torque (Nm)</text>
      <text x={16} y={(PY + PY + PH) / 2} textAnchor="middle" fill="#71717a" fontSize={10} transform={`rotate(-90, 16, ${(PY + PY + PH) / 2})`}>Speed (rpm)</text>

      {/* Region annotation for armature resistance method */}
      {method === 'ar' && (
        <g>
          <rect x={PX} y={sy(N_MAX * 0.95)} width={PW} height={sy(N_MAX * 0.45) - sy(N_MAX * 0.95)} rx={4} fill="rgba(239,68,68,0.03)" />
          <text x={PX + PW - 5} y={sy(N_MAX * 0.7)} textAnchor="end" fill="#ef4444" fontSize={7} opacity={0.5}>Speed reduced by I{'\u00B2'}R loss (inefficient)</text>
        </g>
      )}

      {family.map((f, i) => (
        <g key={i} opacity={i === activeIdx ? 1 : 0.3}>
          <path d={toPath(f.pts)} fill="none" stroke={mColor} strokeWidth={i === activeIdx ? 2.5 : 1.5} />
          {f.pts.length > 0 && <text x={sx(f.pts[0].t) + 4} y={sy(f.pts[0].n) - 6} fill={mColor} fontSize={8} opacity={i === activeIdx ? 1 : 0.6}>{f.label}</text>}
        </g>
      ))}

      {/* Load torque line */}
      <line x1={sx(TL)} y1={PY} x2={sx(TL)} y2={PY + PH} stroke="#6366f1" strokeWidth={1} strokeDasharray="5 3" opacity={0.5} />
      <text x={sx(TL)} y={PY - 4} textAnchor="middle" fill="#6366f1" fontSize={8}>T<tspan dy={2} fontSize={6}>L</tspan><tspan dy={-2}> = {TL}</tspan></text>

      {/* Operating point */}
      {op && !op.stalled && (
        <g>
          <circle cx={sx(op.t)} cy={sy(op.n)} r={7} fill="none" stroke="#e4e4e7" strokeWidth={2} />
          <circle cx={sx(op.t)} cy={sy(op.n)} r={3.5} fill="#e4e4e7" />
          <text x={sx(op.t) + 12} y={sy(op.n) - 4} fill="#e4e4e7" fontSize={10} fontWeight={600}>{op.n.toFixed(0)} rpm</text>
          <text x={sx(op.t) + 12} y={sy(op.n) + 10} fill="#71717a" fontSize={9}>{op.ia.toFixed(1)} A, {'\u03B7'}={op.eta.toFixed(0)}%</text>
        </g>
      )}

      {/* Direction arrow */}
      {method === 'av' && (
        <g>
          <line x1={sx(5)} y1={sy(600)} x2={sx(5)} y2={sy(1300)} stroke={mColor} strokeWidth={1.5} opacity={0.4} />
          <polygon points={`${sx(5)},${sy(1300)} ${sx(5) - 4},${sy(1200)} ${sx(5) + 4},${sy(1200)}`} fill={mColor} opacity={0.4} />
          <text x={sx(5) + 8} y={sy(950)} fill={mColor} fontSize={9} opacity={0.5}>Increase V</text>
        </g>
      )}
      {method === 'fw' && (
        <g>
          <line x1={sx(5)} y1={sy(1400)} x2={sx(5)} y2={sy(2400)} stroke={mColor} strokeWidth={1.5} opacity={0.4} />
          <polygon points={`${sx(5)},${sy(2400)} ${sx(5) - 4},${sy(2300)} ${sx(5) + 4},${sy(2300)}`} fill={mColor} opacity={0.4} />
          <text x={sx(5) + 8} y={sy(1900)} fill={mColor} fontSize={9} opacity={0.5}>Reduce {'\u03C6'}</text>
        </g>
      )}
      {method === 'ar' && (
        <g>
          <line x1={sx(20)} y1={sy(1350)} x2={sx(20)} y2={sy(600)} stroke={mColor} strokeWidth={1.5} opacity={0.4} />
          <polygon points={`${sx(20)},${sy(600)} ${sx(20) - 4},${sy(700)} ${sx(20) + 4},${sy(700)}`} fill={mColor} opacity={0.4} />
          <text x={sx(20) + 8} y={sy(1000)} fill={mColor} fontSize={9} opacity={0.5}>Add R<tspan dy={2} fontSize={7}>a</tspan></text>
        </g>
      )}

      {/* Divider */}
      <line x1={535} y1={PY - 5} x2={535} y2={PY + PH + 15} stroke="#1e1e2e" strokeWidth={1} />

      {/* ── Right: Power-Speed Envelope ── */}
      <text x={EP_X + EP_W / 2} y={18} textAnchor="middle" fill="#71717a" fontSize={12} fontWeight={600}>Power-Speed Envelope</text>

      <line x1={EP_X} y1={EP_Y} x2={EP_X} y2={EP_Y + EP_H} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={EP_X} y1={EP_Y + EP_H} x2={EP_X + EP_W} y2={EP_Y + EP_H} stroke="#3f3f46" strokeWidth={1.5} />

      {[0, 500, 1000, 1500, 2000, 2500, 3000, 3500].map(n => (
        <g key={`en${n}`}>
          <line x1={EP_X} y1={EP_Y + EP_H} x2={EP_X + EP_W} y2={EP_Y + EP_H} stroke="transparent" />
          {n > 0 && <line x1={EP_X} y1={esy_t(n <= T_rated * 1.2 ? 0 : 0)} x2={EP_X + EP_W} y2={esy_t(0)} stroke="transparent" />}
          <text x={esx(n)} y={EP_Y + EP_H + 14} textAnchor="middle" fill="#3f3f46" fontSize={8}>{n}</text>
        </g>
      ))}
      <text x={EP_X + EP_W / 2} y={EP_Y + EP_H + 30} textAnchor="middle" fill="#71717a" fontSize={10}>Speed (rpm)</text>

      {/* Base speed line */}
      <line x1={esx(baseN)} y1={EP_Y} x2={esx(baseN)} y2={EP_Y + EP_H} stroke="#6366f1" strokeWidth={1} strokeDasharray="5 3" opacity={0.5} />
      <text x={esx(baseN)} y={EP_Y - 4} textAnchor="middle" fill="#6366f1" fontSize={9}>N<tspan dy={2} fontSize={7}>base</tspan></text>

      {/* Constant Torque region shade */}
      <rect x={EP_X} y={EP_Y} width={esx(baseN) - EP_X} height={EP_H} fill="rgba(34,197,94,0.04)" />
      <text x={(EP_X + esx(baseN)) / 2} y={EP_Y + 20} textAnchor="middle" fill="#22c55e" fontSize={9} opacity={0.7}>Constant Torque</text>
      <text x={(EP_X + esx(baseN)) / 2} y={EP_Y + 32} textAnchor="middle" fill="#22c55e" fontSize={8} opacity={0.5}>(Armature Voltage)</text>

      {/* Constant Power region shade */}
      <rect x={esx(baseN)} y={EP_Y} width={EP_X + EP_W - esx(baseN)} height={EP_H} fill="rgba(245,158,11,0.04)" />
      <text x={(esx(baseN) + EP_X + EP_W) / 2} y={EP_Y + 20} textAnchor="middle" fill="#f59e0b" fontSize={9} opacity={0.7}>Constant Power</text>
      <text x={(esx(baseN) + EP_X + EP_W) / 2} y={EP_Y + 32} textAnchor="middle" fill="#f59e0b" fontSize={8} opacity={0.5}>(Field Weakening)</text>

      {/* Active method highlight on envelope */}
      {method === 'av' && op && !op.stalled && (
        <rect x={EP_X} y={EP_Y} width={esx(baseN) - EP_X} height={EP_H}
          fill="none" stroke="#22c55e" strokeWidth={2} strokeDasharray="8 4" opacity={0.4} rx={4} />
      )}
      {method === 'fw' && (
        <rect x={esx(baseN)} y={EP_Y} width={EP_X + EP_W - esx(baseN)} height={EP_H}
          fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="8 4" opacity={0.4} rx={4} />
      )}

      {/* Torque envelope */}
      <path d={envTPath} fill="none" stroke="#22c55e" strokeWidth={2} opacity={0.8} />
      <text x={EP_X + EP_W - 5} y={esy_t(envTorque[envTorque.length - 1]?.v || 0) - 6} textAnchor="end" fill="#22c55e" fontSize={9}>T<tspan dy={2} fontSize={7}>max</tspan></text>

      {/* Power envelope */}
      <path d={envPPath} fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.8} />
      <text x={EP_X + EP_W - 5} y={esy_p(P_rated) - 6} textAnchor="end" fill="#f59e0b" fontSize={9}>P<tspan dy={2} fontSize={7}>max</tspan></text>

      {/* Operating point on envelope */}
      {op && !op.stalled && (
        <g>
          <circle cx={esx(op.n)} cy={esy_t(op.t)} r={5} fill="none" stroke="#e4e4e7" strokeWidth={1.5} />
          <circle cx={esx(op.n)} cy={esy_t(op.t)} r={2.5} fill="#e4e4e7" />
        </g>
      )}

      {/* Efficiency loss comparison (for resistance method) */}
      {method === 'ar' && op && (
        <g>
          <rect x={EP_X + 5} y={EP_Y + EP_H - 45} width={180} height={38} rx={6} fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={0.8} />
          <text x={EP_X + 15} y={EP_Y + EP_H - 28} fill="#ef4444" fontSize={9} fontWeight={600}>
            Loss in R<tspan dy={2} fontSize={7}>a,ext</tspan><tspan dy={-2}>: {(op.ia * op.ia * (Ra - RA_BASE)).toFixed(0)} W</tspan>
          </text>
          <text x={EP_X + 15} y={EP_Y + EP_H - 14} fill="#71717a" fontSize={8}>
            Wasted as heat {'\u2014'} inefficient!
          </text>
        </g>
      )}

      {/* Mini circuit schematic */}
      <MethodCircuit method={method} />
    </svg>
  );
}

/* SVG: Control circuits for Theory tab */
function TheoryControlCircuits() {
  return (
    <svg viewBox="0 0 760 250" style={S.svgDiagram}>
      <text x={380} y={22} textAnchor="middle" fill="#71717a" fontSize={13} fontWeight={600}>Speed Control Method Circuits</text>

      {/* ── Armature Voltage Control ── */}
      <text x={190} y={48} textAnchor="middle" fill="#22c55e" fontSize={11} fontWeight={600}>Armature Voltage Control</text>
      {/* Variable Vt source */}
      <circle cx={60} cy={140} r={20} fill="none" stroke="#22c55e" strokeWidth={1.5} />
      <text x={60} y={132} textAnchor="middle" fill="#22c55e" fontSize={7}>Variable</text>
      <text x={60} y={145} textAnchor="middle" fill="#22c55e" fontSize={10} fontWeight={600}>V<tspan dy={3} fontSize={7}>a</tspan></text>
      {/* Variable arrow across source */}
      <line x1={38} y1={130} x2={48} y2={152} stroke="#22c55e" strokeWidth={1.2} />
      <polygon points="38,128 35,133 41,133" fill="#22c55e" />
      {/* Top wire */}
      <line x1={60} y1={120} x2={60} y2={72} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={60} y1={72} x2={320} y2={72} stroke="#a1a1aa" strokeWidth={1} />
      {/* Current */}
      <polygon points="120,72 112,69 112,75" fill="#22d3ee" />
      <text x={120} y={66} fill="#22d3ee" fontSize={8}>I<tspan dy={2} fontSize={6}>a</tspan></text>
      {/* Ra */}
      <rect x={160} y={64} width={40} height={16} rx={3} fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1} />
      <text x={180} y={76} textAnchor="middle" fill="#ef4444" fontSize={9}>R<tspan dy={2} fontSize={7}>a</tspan></text>
      {/* Motor */}
      <circle cx={280} cy={140} r={18} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={280} y={144} textAnchor="middle" fill="#f59e0b" fontSize={10} fontWeight={600}>M</text>
      <line x1={280} y1={122} x2={280} y2={72} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={280} y1={158} x2={280} y2={205} stroke="#a1a1aa" strokeWidth={1} />
      {/* Field winding (constant flux) */}
      <line x1={240} y1={72} x2={240} y2={95} stroke="#818cf8" strokeWidth={1} />
      <rect x={233} y={95} width={14} height={45} rx={3} fill="rgba(99,102,241,0.08)" stroke="#818cf8" strokeWidth={1} />
      <text x={228} y={122} textAnchor="end" fill="#818cf8" fontSize={7}>R<tspan dy={1} fontSize={5}>f</tspan></text>
      <text x={228} y={132} textAnchor="end" fill="#818cf8" fontSize={6}>(const)</text>
      <line x1={240} y1={140} x2={240} y2={205} stroke="#818cf8" strokeWidth={1} />
      {/* Bottom */}
      <line x1={60} y1={160} x2={60} y2={205} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={60} y1={205} x2={320} y2={205} stroke="#a1a1aa" strokeWidth={1} />
      {/* Label */}
      <text x={190} y={225} textAnchor="middle" fill="#22c55e" fontSize={9} fontWeight={500}>0 {'\u2264'} V<tspan dy={2} fontSize={7}>a</tspan><tspan dy={-2}> {'\u2264'} V</tspan><tspan dy={2} fontSize={7}>rated</tspan><tspan dy={-2}> | {'\u03C6'} = const</tspan></text>
      <text x={190} y={238} textAnchor="middle" fill="#52525b" fontSize={8}>Below base speed | Constant torque</text>

      {/* ── Field Weakening Control ── */}
      <text x={570} y={48} textAnchor="middle" fill="#f59e0b" fontSize={11} fontWeight={600}>Field Weakening Control</text>
      {/* Fixed Vt */}
      <circle cx={430} cy={140} r={20} fill="none" stroke="#6366f1" strokeWidth={1.5} />
      <text x={430} y={135} textAnchor="middle" fill="#6366f1" fontSize={7}>Fixed</text>
      <text x={430} y={148} textAnchor="middle" fill="#6366f1" fontSize={10} fontWeight={600}>V<tspan dy={3} fontSize={7}>rated</tspan></text>
      {/* Top wire */}
      <line x1={430} y1={120} x2={430} y2={72} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={430} y1={72} x2={700} y2={72} stroke="#a1a1aa" strokeWidth={1} />
      {/* Ra */}
      <rect x={520} y={64} width={40} height={16} rx={3} fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1} />
      <text x={540} y={76} textAnchor="middle" fill="#ef4444" fontSize={9}>R<tspan dy={2} fontSize={7}>a</tspan></text>
      {/* Motor */}
      <circle cx={660} cy={140} r={18} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={660} y={144} textAnchor="middle" fill="#f59e0b" fontSize={10} fontWeight={600}>M</text>
      <line x1={660} y1={122} x2={660} y2={72} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={660} y1={158} x2={660} y2={205} stroke="#a1a1aa" strokeWidth={1} />
      {/* Variable field resistance */}
      <line x1={615} y1={72} x2={615} y2={95} stroke="#f59e0b" strokeWidth={1} />
      <rect x={608} y={95} width={14} height={45} rx={3} fill="rgba(245,158,11,0.08)" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={603} y={122} textAnchor="end" fill="#f59e0b" fontSize={7}>R<tspan dy={1} fontSize={5}>f</tspan></text>
      <line x1={615} y1={140} x2={615} y2={205} stroke="#f59e0b" strokeWidth={1} />
      {/* Variable arrow */}
      <line x1={626} y1={100} x2={604} y2={135} stroke="#f59e0b" strokeWidth={1.2} />
      <polygon points="626,98 623,103 629,103" fill="#f59e0b" />
      <text x={632} y={115} fill="#f59e0b" fontSize={7}>Increase</text>
      <text x={632} y={125} fill="#f59e0b" fontSize={7}>R<tspan dy={1} fontSize={5}>f</tspan></text>
      {/* Bottom */}
      <line x1={430} y1={160} x2={430} y2={205} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={430} y1={205} x2={700} y2={205} stroke="#a1a1aa" strokeWidth={1} />
      {/* Label */}
      <text x={570} y={225} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight={500}>V = V<tspan dy={2} fontSize={7}>rated</tspan><tspan dy={-2}> | {'\u03C6'} reduced by increasing R</tspan><tspan dy={2} fontSize={7}>f</tspan></text>
      <text x={570} y={238} textAnchor="middle" fill="#52525b" fontSize={8}>Above base speed | Constant power</text>
    </svg>
  );
}

/* SVG: Annotated N-T curve showing two control regions */
function TheoryNTRegionsDiagram() {
  const px = 80, py = 35, pw = 300, ph = 180;
  const sx = v => px + (v / 3500) * pw;
  const sy = v => py + ph - (v / 55) * ph;
  const baseN = 1400;

  return (
    <svg viewBox="0 0 760 280" style={S.svgDiagram}>
      <text x={380} y={22} textAnchor="middle" fill="#71717a" fontSize={13} fontWeight={600}>Two-Region Speed Control {'\u2014'} Torque & Power vs Speed</text>

      {/* Grid */}
      {[0, 500, 1000, 1500, 2000, 2500, 3000].map(n => <line key={n} x1={px} y1={sy(n/65)} x2={px + pw} y2={sy(n/65)} stroke="#1e1e2e" strokeWidth={1} />)}

      {/* Axes */}
      <line x1={px} y1={py} x2={px} y2={py + ph} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={px} y1={py + ph} x2={px + pw} y2={py + ph} stroke="#3f3f46" strokeWidth={1.5} />
      <text x={px + pw / 2} y={py + ph + 20} textAnchor="middle" fill="#71717a" fontSize={10}>Speed N (rpm)</text>

      {/* Tick labels */}
      {[0, 500, 1000, 1500, 2000, 2500, 3000, 3500].map(n => (
        <text key={n} x={sx(n)} y={py + ph + 12} textAnchor="middle" fill="#52525b" fontSize={8}>{n}</text>
      ))}

      {/* Base speed line */}
      <line x1={sx(baseN)} y1={py} x2={sx(baseN)} y2={py + ph} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="6 3" />
      <text x={sx(baseN)} y={py - 4} textAnchor="middle" fill="#6366f1" fontSize={9} fontWeight={600}>N<tspan dy={2} fontSize={7}>base</tspan></text>

      {/* Region I shading */}
      <rect x={px} y={py} width={sx(baseN) - px} height={ph} fill="rgba(34,197,94,0.05)" rx={4} />
      <text x={(px + sx(baseN)) / 2} y={py + 14} textAnchor="middle" fill="#22c55e" fontSize={10} fontWeight={600}>Region I</text>
      <text x={(px + sx(baseN)) / 2} y={py + 26} textAnchor="middle" fill="#22c55e" fontSize={8}>Constant Torque</text>

      {/* Region II shading */}
      <rect x={sx(baseN)} y={py} width={px + pw - sx(baseN)} height={ph} fill="rgba(245,158,11,0.05)" rx={4} />
      <text x={(sx(baseN) + px + pw) / 2} y={py + 14} textAnchor="middle" fill="#f59e0b" fontSize={10} fontWeight={600}>Region II</text>
      <text x={(sx(baseN) + px + pw) / 2} y={py + 26} textAnchor="middle" fill="#f59e0b" fontSize={8}>Constant Power</text>

      {/* Torque envelope */}
      <line x1={px} y1={sy(45)} x2={sx(baseN)} y2={sy(45)} stroke="#22c55e" strokeWidth={2.5} />
      {/* Torque drops as 1/N above base speed */}
      {(() => {
        let d = `M${sx(baseN).toFixed(1)},${sy(45).toFixed(1)}`;
        for (let n = baseN; n <= 3500; n += 50) {
          const t = 45 * baseN / n;
          d += ` L${sx(n).toFixed(1)},${sy(t).toFixed(1)}`;
        }
        return <path d={d} fill="none" stroke="#22c55e" strokeWidth={2.5} />;
      })()}
      <text x={px + pw - 5} y={sy(45 * baseN / 3500) + 14} textAnchor="end" fill="#22c55e" fontSize={9} fontWeight={600}>T<tspan dy={2} fontSize={7}>max</tspan></text>

      {/* Power envelope */}
      {(() => {
        let d = '';
        for (let n = 100; n <= 3500; n += 50) {
          const p = n <= baseN ? 45 * n / baseN : 45;
          const ypx = sy(p);
          d += (n === 100 ? 'M' : ' L') + `${sx(n).toFixed(1)},${ypx.toFixed(1)}`;
        }
        return <path d={d} fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="8 4" />;
      })()}
      <text x={px + pw - 5} y={sy(45) - 8} textAnchor="end" fill="#f59e0b" fontSize={9} fontWeight={600}>P<tspan dy={2} fontSize={7}>max</tspan></text>

      {/* ── Right: Properties ── */}
      <line x1={420} y1={25} x2={420} y2={260} stroke="#1e1e2e" strokeWidth={1} />

      <text x={440} y={50} fill="#e4e4e7" fontSize={12} fontWeight={600}>Control Regions</text>

      <rect x={440} y={62} width={300} height={70} rx={8} fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth={0.8} />
      <text x={450} y={78} fill="#22c55e" fontSize={10} fontWeight={600}>Region I: 0 to N<tspan dy={2} fontSize={8}>base</tspan></text>
      <text x={450} y={93} fill="#a1a1aa" fontSize={9}>Method: Vary V<tspan dy={2} fontSize={7}>a</tspan><tspan dy={-2}> from 0 to V</tspan><tspan dy={2} fontSize={7}>rated</tspan></text>
      <text x={450} y={107} fill="#a1a1aa" fontSize={9}>{'\u03C6'} = {'\u03C6'}<tspan dy={2} fontSize={7}>rated</tspan><tspan dy={-2}> (constant) | T</tspan><tspan dy={2} fontSize={7}>max</tspan><tspan dy={-2}> = K{'\u03C6'}{'\u00B7'}I</tspan><tspan dy={2} fontSize={7}>a,rated</tspan></text>
      <text x={450} y={121} fill="#a1a1aa" fontSize={9}>Power ramps linearly: P {'\u221D'} N</text>

      <rect x={440} y={142} width={300} height={70} rx={8} fill="rgba(245,158,11,0.06)" stroke="#f59e0b" strokeWidth={0.8} />
      <text x={450} y={158} fill="#f59e0b" fontSize={10} fontWeight={600}>Region II: N<tspan dy={2} fontSize={8}>base</tspan><tspan dy={-2}> to N</tspan><tspan dy={2} fontSize={8}>max</tspan></text>
      <text x={450} y={173} fill="#a1a1aa" fontSize={9}>Method: Reduce {'\u03C6'} (increase R<tspan dy={2} fontSize={7}>f</tspan><tspan dy={-2}>)</tspan></text>
      <text x={450} y={187} fill="#a1a1aa" fontSize={9}>V = V<tspan dy={2} fontSize={7}>rated</tspan><tspan dy={-2}> (constant) | T</tspan><tspan dy={2} fontSize={7}>max</tspan><tspan dy={-2}> {'\u221D'} 1/N</tspan></text>
      <text x={450} y={201} fill="#a1a1aa" fontSize={9}>Power stays constant: P = P<tspan dy={2} fontSize={7}>rated</tspan></text>

      <rect x={440} y={222} width={300} height={38} rx={8} fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth={0.8} />
      <text x={450} y={238} fill="#ef4444" fontSize={10} fontWeight={600}>Armature Resistance (Not Shown)</text>
      <text x={450} y={252} fill="#a1a1aa" fontSize={9}>Inefficient (I{'\u00B2'}R loss) | Below base speed only | Obsolete</text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>DC Motor Speed Control Methods</h2>
      <p style={S.p}>
        The speed of a DC motor is governed by the fundamental speed equation:
      </p>
      <div style={S.eq}>N = (V {'\u2212'} I<sub>a</sub>{'\u00B7'}R<sub>a</sub>) / K{'\u03C6'} {'\u00D7'} (30/{'\u03C0'})    rpm</div>
      <p style={S.p}>
        Three quantities can be varied to control speed: the armature voltage V, the flux {'\u03C6'}
        (via field current), and the armature circuit resistance R<sub>a</sub>. Each method has distinct
        characteristics that determine its suitability for different applications.
      </p>

      {/* SVG: Control circuit diagrams */}
      <TheoryControlCircuits />

      <h3 style={S.h3}>1. Armature Voltage Control (Below Base Speed)</h3>
      <p style={S.p}>
        By reducing the armature voltage while keeping flux constant, the speed decreases
        proportionally. Since flux is unchanged, the maximum torque capability
        (T<sub>max</sub> = K{'\u03C6'} {'\u00D7'} I<sub>a,rated</sub>) remains constant at all speeds. This is the
        <strong style={{ color: '#22c55e' }}> constant torque region</strong>.
      </p>
      <div style={S.eqBox}>
        <span style={{ ...S.ctxT, color: '#818cf8', fontSize: 12 }}>Armature Voltage Control Equations</span>
        <div style={S.eqStep}>N {'\u221D'} V (at constant {'\u03C6'} and load)</div>
        <div style={S.eqStep}>T<sub>max</sub> = K{'\u03C6'} {'\u00B7'} I<sub>a,rated</sub> = constant for all V</div>
        <div style={S.eqStep}>P = T {'\u00B7'} {'\u03C9'} {'\u221D'} N (power increases linearly with speed)</div>
        <div style={S.eqResult}>At V = V<sub>rated</sub>: N = N<sub>base</sub> (maximum speed in this region)</div>
      </div>
      <ul style={S.ul}>
        <li style={S.li}>Smooth, stepless speed control from zero to base speed</li>
        <li style={S.li}>Constant torque capability throughout the range</li>
        <li style={S.li}>High efficiency (no resistive losses in the control element)</li>
        <li style={S.li}>Requires a variable DC source (traditionally Ward-Leonard, now thyristor/chopper drives)</li>
      </ul>

      <h3 style={S.h3}>2. Field Weakening (Above Base Speed)</h3>
      <p style={S.p}>
        By increasing the field resistance (or reducing field current), the flux {'\u03C6'} decreases.
        Since N {'\u221D'} 1/{'\u03C6'} (at constant V), the speed increases beyond base speed. However, the
        maximum torque decreases because T<sub>max</sub> = K{'\u03C6'} {'\u00D7'} I<sub>a,rated</sub>, and {'\u03C6'} is reduced. The power
        P = V {'\u00D7'} I<sub>a</sub> remains approximately constant (since both V and I<sub>a,max</sub> are unchanged).
        This is the <strong style={{ color: '#f59e0b' }}>constant power region</strong>.
      </p>
      <div style={S.eqBox}>
        <span style={{ ...S.ctxT, color: '#818cf8', fontSize: 12 }}>Field Weakening Equations</span>
        <div style={S.eqStep}>N {'\u221D'} 1/{'\u03C6'} (at constant V and I<sub>a</sub>)</div>
        <div style={S.eqStep}>T<sub>max</sub> = K{'\u03C6'} {'\u00B7'} I<sub>a,rated</sub> {'\u221D'} {'\u03C6'} (decreases as flux weakens)</div>
        <div style={S.eqStep}>P = V {'\u00B7'} I<sub>a</sub> = constant (V and I<sub>a,max</sub> unchanged)</div>
        <div style={S.eqResult}>Speed can reach 2{'\u2013'}3{'\u00D7'} base speed before commutation limits</div>
      </div>
      <ul style={S.ul}>
        <li style={S.li}>Speed can be increased above base speed by 2{'\u2013'}3{'\u00D7'} typically</li>
        <li style={S.li}>Torque capability decreases inversely with speed</li>
        <li style={S.li}>Power capability is constant</li>
        <li style={S.li}>Simple implementation {'\u2014'} just a rheostat in the field circuit</li>
        <li style={S.li}>Limited range: excessive field weakening causes commutation problems and instability</li>
      </ul>

      {/* SVG: N-T curve with two regions annotated */}
      <TheoryNTRegionsDiagram />

      <h3 style={S.h3}>3. Armature Resistance Control</h3>
      <p style={S.p}>
        Adding external resistance in series with the armature increases the voltage drop
        I<sub>a</sub> {'\u00D7'} (R<sub>a</sub> + R<sub>a,ext</sub>), reducing the back-EMF and hence the speed. The no-load speed
        is unaffected (since I<sub>a</sub> {'\u2248'} 0 at no load, the added resistance has no effect), but
        the speed at any load drops significantly.
      </p>
      <div style={S.eq}>N = (V {'\u2212'} I<sub>a</sub>{'\u00B7'}(R<sub>a</sub> + R<sub>a,ext</sub>)) / K{'\u03C6'}</div>
      <ul style={S.ul}>
        <li style={S.li}>Simple and cheap to implement (just a rheostat)</li>
        <li style={S.li}><strong style={{ color: '#ef4444' }}>Very inefficient</strong> {'\u2014'} the power I<sub>a</sub>{'\u00B2'}{'\u00B7'}R<sub>a,ext</sub> is wasted as heat</li>
        <li style={S.li}>Speed regulation is poor (speed depends heavily on load)</li>
        <li style={S.li}>Only provides speed reduction below base speed</li>
        <li style={S.li}>Historically used for starting and crude speed control; obsolete for continuous speed control</li>
      </ul>

      <h3 style={S.h3}>The Power-Speed Envelope</h3>
      <p style={S.p}>
        By combining armature voltage control (below base speed) and field weakening (above base speed),
        a DC motor can operate over a wide speed range with optimal utilization of its ratings:
      </p>
      <div style={S.ctx}>
        <span style={S.ctxT}>Two-Region Operation</span>
        <p style={S.ctxP}>
          <strong style={{ color: '#22c55e' }}>Region I (0 to N<sub>base</sub>)</strong>: Armature voltage control.
          V varies from 0 to V<sub>rated</sub> while {'\u03C6'} = {'\u03C6'}<sub>rated</sub>. Maximum torque = K{'\u03C6'}<sub>rated</sub> {'\u00D7'} I<sub>a,rated</sub> (constant).
          Power ramps linearly from 0 to P<sub>rated</sub>.<br /><br />
          <strong style={{ color: '#f59e0b' }}>Region II (N<sub>base</sub> to N<sub>max</sub>)</strong>: Field weakening.
          V = V<sub>rated</sub> while {'\u03C6'} decreases below {'\u03C6'}<sub>rated</sub>. Maximum torque = K{'\u03C6'} {'\u00D7'} I<sub>a,rated</sub> (decreasing).
          Power stays at P<sub>rated</sub> (constant). The speed can typically reach 2{'\u2013'}3{'\u00D7'} base speed before
          commutation limits are reached.
        </p>
      </div>
      <p style={S.p}>
        This envelope is fundamental to all variable-speed drive systems. Modern DC drives
        (thyristor converters, choppers) implement armature voltage control electronically,
        while field weakening is achieved by reducing the field current through a separate
        converter or chopper.
      </p>

      <h3 style={S.h3}>Comparison of Methods</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Property</th>
            <th style={S.th}>Armature Voltage</th>
            <th style={S.th}>Field Weakening</th>
            <th style={S.th}>Armature Resistance</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Speed range', '0 to base', 'Base to ~3\u00D7 base', '0 to base (with load)'],
            ['Torque capability', 'Constant (rated)', 'Decreases (\u221D 1/N)', 'Constant (rated)'],
            ['Power capability', 'Increases (\u221D N)', 'Constant (rated)', 'Decreases'],
            ['Efficiency', 'High', 'High', 'Poor (I\u00B2R loss)'],
            ['Implementation', 'Variable DC source', 'Field rheostat', 'Armature rheostat'],
            ['Modern practice', 'Thyristor/chopper', 'Field converter', 'Obsolete'],
          ].map(([prop, av, fw, ar]) => (
            <tr key={prop}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{prop}</td>
              <td style={S.td}>{av}</td>
              <td style={S.td}>{fw}</td>
              <td style={S.td}>{ar}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.ctx}>
        <span style={S.ctxT}>Ward-Leonard Drive System</span>
        <p style={S.ctxP}>
          Before power electronics, the Ward-Leonard system provided smooth armature voltage
          control using a motor-generator set. An AC motor drives a DC generator whose output
          feeds the DC motor. By varying the generator's field current, the output voltage
          (and hence motor speed) is continuously adjustable in both directions, enabling
          four-quadrant operation. Though elegant, this system requires three machines and is
          expensive. It has been almost entirely replaced by thyristor and IGBT-based drives,
          but the control principle remains identical {'\u2014'} vary the armature voltage for speed
          below base, weaken the field for speed above base.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Chapman, S.J. {'\u2014'} <em>Electric Machinery Fundamentals</em>, 5th Edition</li>
        <li style={S.li}>Sen, P.C. {'\u2014'} <em>Principles of Electric Machines and Power Electronics</em>, 3rd Edition</li>
        <li style={S.li}>Dubey, G.K. {'\u2014'} <em>Fundamentals of Electrical Drives</em>, 2nd Edition, CRC Press</li>
        <li style={S.li}>Rashid, M.H. {'\u2014'} <em>Power Electronics</em>, 4th Edition (Ward-Leonard replacement by converters)</li>
      </ul>
    </div>
  );
}

const btnS = (active, color = '#6366f1') => ({
  padding: '5px 14px', borderRadius: 8,
  border: active ? `1px solid ${color}` : '1px solid #27272a',
  background: active ? `${color}18` : 'transparent',
  color: active ? color : '#52525b',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
});

export default function DCMotorSpeedControl() {
  const [tab, setTab] = useState('simulate');
  const [method, setMethod] = useState('av');
  const [V, setV] = useState(220);
  const [Ke, setKe] = useState(1.5);
  const [Ra, setRa] = useState(0.5);
  const [TL, setTL] = useState(15);

  const activeV = method === 'av' ? V : V_RATED;
  const activeKe = method === 'fw' ? Ke : KE_RATED;
  const activeRa = method === 'ar' ? Ra : RA_BASE;

  const op = useMemo(() => opPoint(activeV, activeKe, activeRa, TL), [activeV, activeKe, activeRa, TL]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Chart method={method} V={activeV} Ke={activeKe} Ra={activeRa} TL={TL} />
          </div>

          <div style={S.results}>
            <div style={S.ri}><span style={S.rl}>Speed</span><span style={{ ...S.rv, color: op?.stalled ? '#ef4444' : '#22c55e' }}>{op ? op.n.toFixed(0) : '\u2014'} rpm</span></div>
            <div style={S.ri}><span style={S.rl}>I<sub>a</sub></span><span style={{ ...S.rv, color: op && op.ia > IA_RATED ? '#ef4444' : '#93c5fd' }}>{op ? op.ia.toFixed(1) : '\u2014'} A</span></div>
            <div style={S.ri}><span style={S.rl}>Torque</span><span style={{ ...S.rv, color: '#c4b5fd' }}>{TL} Nm</span></div>
            <div style={S.ri}><span style={S.rl}>Power</span><span style={{ ...S.rv, color: '#f59e0b' }}>{op ? op.P.toFixed(0) : '\u2014'} W</span></div>
            <div style={S.ri}><span style={S.rl}>Efficiency</span><span style={{ ...S.rv, color: op && op.eta > 80 ? '#22c55e' : '#ef4444' }}>{op ? op.eta.toFixed(1) : '\u2014'}%</span></div>
            {method === 'ar' && op && <div style={S.ri}><span style={S.rl}>R<sub>a</sub> Loss</span><span style={{ ...S.rv, color: '#ef4444' }}>{(op.ia * op.ia * (activeRa - RA_BASE)).toFixed(0)} W</span></div>}
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Method</span>
              {METHODS.map(m => (
                <button key={m.id} style={btnS(method === m.id, m.color)} onClick={() => setMethod(m.id)}>{m.label}</button>
              ))}
            </div>

            {method === 'av' && (
              <div style={S.cg}>
                <span style={S.label}>Armature Voltage</span>
                <input type="range" min={20} max={220} step={5} value={V} onChange={e => setV(+e.target.value)} style={S.slider} />
                <span style={S.val}>{V} V</span>
              </div>
            )}
            {method === 'fw' && (
              <div style={S.cg}>
                <span style={S.label}>K{'\u03C6'} (flux)</span>
                <input type="range" min={0.3} max={1.5} step={0.05} value={Ke} onChange={e => setKe(+e.target.value)} style={S.slider} />
                <span style={S.val}>{Ke.toFixed(2)}</span>
              </div>
            )}
            {method === 'ar' && (
              <div style={S.cg}>
                <span style={S.label}>Total R<sub>a</sub></span>
                <input type="range" min={0.5} max={15} step={0.5} value={Ra} onChange={e => setRa(+e.target.value)} style={S.slider} />
                <span style={S.val}>{Ra.toFixed(1)} {'\u03A9'}</span>
              </div>
            )}

            <div style={S.cg}>
              <span style={S.label}>Load Torque</span>
              <input type="range" min={2} max={50} step={1} value={TL} onChange={e => setTL(+e.target.value)} style={S.slider} />
              <span style={S.val}>{TL} Nm</span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
