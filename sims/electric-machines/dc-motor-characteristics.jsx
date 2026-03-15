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

const MOTORS = {
  shunt:        { label: 'Shunt',         color: '#22c55e', Ke: 1.5,  Ra: 0.5, type: 'shunt' },
  series:       { label: 'Series',        color: '#ef4444', Kse: 0.02, Ra: 0.8, type: 'series' },
  cumulative:   { label: 'Cum. Compound', color: '#3b82f6', Ke_sh: 1.3, Kse: 0.004, Ra: 0.6, type: 'cumulative' },
  differential: { label: 'Diff. Compound', color: '#f59e0b', Ke_sh: 1.3, Kse: 0.004, Ra: 0.6, type: 'differential' },
};

const APPS = {
  shunt: 'Lathes, Centrifugal pumps, Machine tools',
  series: 'Traction, Cranes, Hoists, Electric vehicles',
  cumulative: 'Rolling mills, Punch presses, Elevators',
  differential: 'Rarely used (unstable) — academic interest',
};

function computeCurves(V) {
  const step = 0.5, maxT = 65;
  const out = {};

  out.shunt = [];
  for (let T = 0.5; T <= maxT; T += step) {
    const Ia = T / MOTORS.shunt.Ke;
    const Eb = V - Ia * MOTORS.shunt.Ra;
    if (Eb <= 0) break;
    out.shunt.push({ t: T, n: (Eb / MOTORS.shunt.Ke) * 30 / Math.PI, ia: Ia });
  }

  out.series = [];
  for (let T = 1; T <= maxT; T += step) {
    const Ia = Math.sqrt(T / MOTORS.series.Kse);
    const phi = MOTORS.series.Kse * Ia;
    const Eb = V - Ia * MOTORS.series.Ra;
    if (Eb <= 0 || phi < 0.01) break;
    out.series.push({ t: T, n: (Eb / phi) * 30 / Math.PI, ia: Ia });
  }

  out.cumulative = [];
  for (let T = 0.5; T <= maxT; T += step) {
    const { Ke_sh, Kse, Ra } = MOTORS.cumulative;
    const disc = Ke_sh * Ke_sh + 4 * Kse * T;
    const Ia = (-Ke_sh + Math.sqrt(disc)) / (2 * Kse);
    if (Ia <= 0) continue;
    const phi = Ke_sh + Kse * Ia;
    const Eb = V - Ia * Ra;
    if (Eb <= 0) break;
    out.cumulative.push({ t: T, n: (Eb / phi) * 30 / Math.PI, ia: Ia });
  }

  out.differential = [];
  for (let T = 0.5; T <= maxT; T += step) {
    const { Ke_sh, Kse, Ra } = MOTORS.differential;
    const disc = Ke_sh * Ke_sh - 4 * Kse * T;
    if (disc < 0) break;
    const Ia = (Ke_sh - Math.sqrt(disc)) / (2 * Kse);
    if (Ia <= 0) continue;
    const phi = Ke_sh - Kse * Ia;
    if (phi <= 0.05) break;
    const Eb = V - Ia * Ra;
    if (Eb <= 0) break;
    out.differential.push({ t: T, n: (Eb / phi) * 30 / Math.PI, ia: Ia });
  }

  return out;
}

function interpolate(curve, T) {
  if (!curve || curve.length < 2) return null;
  for (let i = 0; i < curve.length - 1; i++) {
    if (curve[i].t <= T && curve[i + 1].t >= T) {
      const f = (T - curve[i].t) / (curve[i + 1].t - curve[i].t);
      return { t: T, n: curve[i].n + f * (curve[i + 1].n - curve[i].n), ia: curve[i].ia + f * (curve[i + 1].ia - curve[i].ia) };
    }
  }
  if (T <= curve[0].t) return curve[0];
  if (T >= curve[curve.length - 1].t) return curve[curve.length - 1];
  return null;
}

const PX = 80, PY = 40, PW = 510, PH = 260;

/* Small circuit schematic showing the active motor configuration */
function MiniCircuit({ show }) {
  const active = Object.keys(MOTORS).find(k => show[k]);
  if (!active) return null;
  const w = 150, h = 80;
  return (
    <g transform={`translate(${PX + PW - w - 5}, ${PY + 5})`}>
      <rect x={0} y={0} width={w} height={h} rx={6} fill="rgba(15,15,19,0.92)" stroke="#27272a" strokeWidth={0.8} />
      <text x={w/2} y={12} textAnchor="middle" fill="#52525b" fontSize={7} fontWeight={600}>ACTIVE CONFIG</text>
      {/* Vt */}
      <circle cx={20} cy={45} r={8} fill="none" stroke="#6366f1" strokeWidth={0.8} />
      <text x={20} y={48} textAnchor="middle" fill="#6366f1" fontSize={6}>V</text>
      {/* Top wire */}
      <line x1={20} y1={37} x2={20} y2={22} stroke="#52525b" strokeWidth={0.6} />
      <line x1={20} y1={22} x2={130} y2={22} stroke="#52525b" strokeWidth={0.6} />
      {/* Ra */}
      <rect x={55} y={18} width={20} height={8} rx={2} fill="none" stroke="#ef4444" strokeWidth={0.6} />
      <text x={65} y={16} textAnchor="middle" fill="#ef4444" fontSize={5}>R<tspan dy={1} fontSize={4}>a</tspan></text>
      {/* Motor circle */}
      <circle cx={115} cy={45} r={10} fill="none" stroke="#f59e0b" strokeWidth={0.8} />
      <text x={115} y={48} textAnchor="middle" fill="#f59e0b" fontSize={7}>M</text>
      <line x1={115} y1={35} x2={115} y2={22} stroke="#52525b" strokeWidth={0.6} />
      {/* Bottom */}
      <line x1={20} y1={53} x2={20} y2={68} stroke="#52525b" strokeWidth={0.6} />
      <line x1={20} y1={68} x2={130} y2={68} stroke="#52525b" strokeWidth={0.6} />
      <line x1={115} y1={55} x2={115} y2={68} stroke="#52525b" strokeWidth={0.6} />
      {/* Field winding based on type */}
      {(active === 'shunt' || active === 'cumulative' || active === 'differential') && (
        <g>
          <rect x={88} y={38} width={6} height={14} rx={1} fill="none" stroke="#22c55e" strokeWidth={0.6} />
          <text x={84} y={48} textAnchor="end" fill="#22c55e" fontSize={4}>R<tspan dy={1} fontSize={3}>f</tspan></text>
          <line x1={91} y1={38} x2={91} y2={22} stroke="#22c55e" strokeWidth={0.5} />
          <line x1={91} y1={52} x2={91} y2={68} stroke="#22c55e" strokeWidth={0.5} />
        </g>
      )}
      {(active === 'series' || active === 'cumulative' || active === 'differential') && (
        <g>
          <rect x={35} y={18} width={14} height={8} rx={1} fill="none" stroke="#22d3ee" strokeWidth={0.6} />
          <text x={42} y={16} textAnchor="middle" fill="#22d3ee" fontSize={4}>R<tspan dy={1} fontSize={3}>se</tspan></text>
        </g>
      )}
    </g>
  );
}

function Chart({ curves, show, TL, plotType, V }) {
  const allVisible = Object.keys(MOTORS).filter(k => show[k] && curves[k] && curves[k].length > 1);

  let T_MAX = 60, yMax = 1800, yLabel = 'Speed (rpm)', xLabel = 'Torque (Nm)';
  if (plotType === 'nt') {
    yMax = 3500;
    yLabel = 'Speed N (rpm)';
    allVisible.forEach(k => curves[k].forEach(p => { if (p.n > yMax * 0.9) yMax = Math.ceil(p.n / 500) * 500; }));
    yMax = Math.min(yMax, 6000);
  } else if (plotType === 'nia') {
    yMax = 3500;
    T_MAX = 80;
    xLabel = 'Armature Current I\u2090 (A)';
    yLabel = 'Speed N (rpm)';
    allVisible.forEach(k => curves[k].forEach(p => { if (p.ia > T_MAX * 0.9) T_MAX = Math.ceil(p.ia / 10) * 10; }));
  } else {
    yMax = 65;
    T_MAX = 80;
    xLabel = 'Armature Current I\u2090 (A)';
    yLabel = 'Torque T (Nm)';
  }

  const sx = v => PX + (v / T_MAX) * PW;
  const sy = v => PY + PH - (Math.min(v, yMax) / yMax) * PH;

  const getX = (p) => plotType === 'nt' ? p.t : p.ia;
  const getY = (p) => plotType === 'tia' ? p.t : p.n;

  const curvePath = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(getX(p)).toFixed(1)},${sy(getY(p)).toFixed(1)}`).join('');

  const yTicks = [];
  const yStep = plotType === 'tia' ? 10 : (yMax <= 2000 ? 500 : 1000);
  for (let v = 0; v <= yMax; v += yStep) yTicks.push(v);

  const xStep = plotType === 'nt' ? 10 : 10;
  const xTicks = [];
  for (let v = 0; v <= T_MAX; v += xStep) xTicks.push(v);

  const ops = {};
  allVisible.forEach(k => { ops[k] = interpolate(curves[k], TL); });

  return (
    <svg viewBox="0 0 960 370" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      <text x={(PX + PX + PW) / 2} y={22} textAnchor="middle" fill="#71717a" fontSize={13} fontWeight={600}>
        DC Motor {plotType === 'nt' ? 'Speed\u2013Torque' : plotType === 'nia' ? 'Speed\u2013Current' : 'Torque\u2013Current'} Characteristics
      </text>

      {/* Grid */}
      {yTicks.map(v => <line key={`yg${v}`} x1={PX} y1={sy(v)} x2={PX + PW} y2={sy(v)} stroke="#1e1e2e" strokeWidth={1} />)}
      {xTicks.map(v => <line key={`xg${v}`} x1={sx(v)} y1={PY} x2={sx(v)} y2={PY + PH} stroke="#1e1e2e" strokeWidth={1} />)}

      {/* Region annotations for N-T plot */}
      {plotType === 'nt' && show.shunt && (
        <g>
          {/* Constant speed region for shunt */}
          <rect x={PX} y={sy(yMax * 0.95)} width={PW} height={sy(yMax * 0.7) - sy(yMax * 0.95)} rx={4} fill="rgba(34,197,94,0.03)" />
          <text x={PX + PW - 5} y={sy(yMax * 0.85)} textAnchor="end" fill="#22c55e" fontSize={8} opacity={0.4}>Shunt: Near-Constant Speed Region</text>
        </g>
      )}

      {/* Series motor danger zone */}
      {show.series && plotType === 'nt' && (
        <g>
          <rect x={PX} y={PY} width={sx(8) - PX} height={PH} fill="rgba(239,68,68,0.04)" />
          <text x={sx(4)} y={PY + 20} textAnchor="middle" fill="#ef4444" fontSize={8} opacity={0.6}>RUNAWAY</text>
          <text x={sx(4)} y={PY + 30} textAnchor="middle" fill="#ef4444" fontSize={8} opacity={0.6}>ZONE</text>
        </g>
      )}

      {/* High torque region annotation for series */}
      {show.series && plotType === 'nt' && (
        <g>
          <rect x={sx(35)} y={PY + PH - 60} width={sx(60) - sx(35)} height={55} rx={4} fill="rgba(239,68,68,0.03)" />
          <text x={(sx(35) + sx(60)) / 2} y={PY + PH - 12} textAnchor="middle" fill="#ef4444" fontSize={7} opacity={0.5}>High Torque Region</text>
        </g>
      )}

      {/* Differential instability region */}
      {show.differential && plotType === 'nt' && curves.differential.length > 2 && (
        <g>
          {/* Find where speed starts rising */}
          <text x={sx(T_MAX * 0.6)} y={PY + PH - 5} fill="#f59e0b" fontSize={7} opacity={0.5}>Unstable: speed rises with load</text>
        </g>
      )}

      {/* Axes */}
      <line x1={PX} y1={PY} x2={PX} y2={PY + PH} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={PX} y1={PY + PH} x2={PX + PW} y2={PY + PH} stroke="#3f3f46" strokeWidth={1.5} />

      {/* Tick labels */}
      {yTicks.map(v => <text key={`yl${v}`} x={PX - 8} y={sy(v) + 4} textAnchor="end" fill="#52525b" fontSize={9}>{v}</text>)}
      {xTicks.map(v => <text key={`xl${v}`} x={sx(v)} y={PY + PH + 16} textAnchor="middle" fill="#52525b" fontSize={9}>{v}</text>)}

      {/* Axis labels */}
      <text x={(PX + PX + PW) / 2} y={PY + PH + 34} textAnchor="middle" fill="#71717a" fontSize={11}>{xLabel}</text>
      <text x={18} y={(PY + PY + PH) / 2} textAnchor="middle" fill="#71717a" fontSize={11} transform={`rotate(-90, 18, ${(PY + PY + PH) / 2})`}>{yLabel}</text>

      {/* Curves with color-coded region backgrounds */}
      {allVisible.map(k => (
        <path key={k} d={curvePath(curves[k])} fill="none" stroke={MOTORS[k].color} strokeWidth={2.5} opacity={0.85} />
      ))}

      {/* Load torque line (only for N vs T plot) */}
      {plotType === 'nt' && (
        <g>
          <line x1={sx(TL)} y1={PY} x2={sx(TL)} y2={PY + PH} stroke="#6366f1" strokeWidth={1} strokeDasharray="6 4" opacity={0.5} />
          <text x={sx(TL)} y={PY - 4} textAnchor="middle" fill="#6366f1" fontSize={8} fontWeight={500}>T<tspan dy={2} fontSize={6}>L</tspan><tspan dy={-2}> = {TL} Nm</tspan></text>
        </g>
      )}

      {/* Operating points */}
      {plotType === 'nt' && allVisible.map(k => {
        const op = ops[k];
        if (!op) return null;
        return (
          <g key={`op${k}`}>
            <circle cx={sx(op.t)} cy={sy(op.n)} r={6} fill="none" stroke={MOTORS[k].color} strokeWidth={2} />
            <circle cx={sx(op.t)} cy={sy(op.n)} r={3} fill={MOTORS[k].color} />
            <text x={sx(op.t) + 10} y={sy(op.n) - 8} fill={MOTORS[k].color} fontSize={9} fontWeight={600}>{op.n.toFixed(0)} rpm</text>
          </g>
        );
      })}

      {/* ── Right Info Panel ── */}
      <line x1={615} y1={PY - 5} x2={615} y2={PY + PH + 10} stroke="#1e1e2e" strokeWidth={1} />

      {/* Motor type legend */}
      <text x={635} y={55} fill="#71717a" fontSize={12} fontWeight={600}>Motor Types</text>
      {Object.entries(MOTORS).map(([k, m], i) => (
        <g key={k} opacity={show[k] ? 1 : 0.35}>
          <line x1={635} y1={78 + i * 28} x2={660} y2={78 + i * 28} stroke={m.color} strokeWidth={3} strokeLinecap="round" />
          <text x={668} y={82 + i * 28} fill={show[k] ? m.color : '#52525b'} fontSize={11} fontWeight={500}>{m.label}</text>
        </g>
      ))}

      {/* Operating point data */}
      <text x={635} y={202} fill="#71717a" fontSize={11} fontWeight={600}>At T = {TL} Nm</text>
      {allVisible.map((k, i) => {
        const op = ops[k];
        if (!op) return null;
        return (
          <g key={`info${k}`}>
            <text x={640} y={222 + i * 18} fill={MOTORS[k].color} fontSize={10}>
              {MOTORS[k].label}: {op.n.toFixed(0)} rpm, {op.ia.toFixed(1)} A
            </text>
          </g>
        );
      })}

      {/* Speed regulation */}
      {plotType === 'nt' && allVisible.includes('shunt') && curves.shunt.length > 2 && (
        <g>
          <text x={635} y={300} fill="#71717a" fontSize={10} fontWeight={600}>Speed Regulation</text>
          {allVisible.filter(k => curves[k].length > 2).map((k, i) => {
            const n0 = curves[k][0].n;
            const nfl = ops[k] ? ops[k].n : curves[k][curves[k].length - 1].n;
            const reg = n0 > 0 ? ((n0 - nfl) / nfl * 100) : 0;
            return <text key={`sr${k}`} x={640} y={318 + i * 16} fill={MOTORS[k].color} fontSize={9}>{MOTORS[k].label}: {reg.toFixed(1)}%</text>;
          })}
        </g>
      )}

      {/* Application labels */}
      <text x={635} y={PY + PH - 10} fill="#71717a" fontSize={10} fontWeight={600}>Applications</text>
      {allVisible.slice(0, 3).map((k, i) => (
        <text key={`app${k}`} x={640} y={PY + PH + 8 + i * 14} fill="#52525b" fontSize={8}>{MOTORS[k].label}: {APPS[k]}</text>
      ))}

      {/* Mini circuit schematic */}
      <MiniCircuit show={show} />
    </svg>
  );
}

/* SVG: Circuit diagrams for series, shunt, compound motors */
function TheoryCircuitDiagrams() {
  return (
    <svg viewBox="0 0 760 280" style={S.svgDiagram}>
      <text x={380} y={22} textAnchor="middle" fill="#71717a" fontSize={13} fontWeight={600}>DC Motor Connection Configurations</text>

      {/* ── Shunt Motor ── */}
      <text x={130} y={48} textAnchor="middle" fill="#22c55e" fontSize={11} fontWeight={600}>Shunt Motor</text>
      {/* Vt source */}
      <circle cx={40} cy={140} r={16} fill="none" stroke="#6366f1" strokeWidth={1.5} />
      <text x={40} y={144} textAnchor="middle" fill="#6366f1" fontSize={9} fontWeight={600}>V</text>
      {/* Top wire */}
      <line x1={40} y1={124} x2={40} y2={70} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={40} y1={70} x2={220} y2={70} stroke="#a1a1aa" strokeWidth={1} />
      {/* Ia arrow */}
      <polygon points="80,70 72,67 72,73" fill="#22d3ee" />
      <text x={80} y={64} fill="#22d3ee" fontSize={8}>I<tspan dy={2} fontSize={6}>a</tspan></text>
      {/* Ra */}
      <rect x={110} y={62} width={30} height={16} rx={3} fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1} />
      <text x={125} y={74} textAnchor="middle" fill="#ef4444" fontSize={8}>R<tspan dy={2} fontSize={6}>a</tspan></text>
      {/* Motor */}
      <circle cx={195} cy={140} r={14} fill="none" stroke="#f59e0b" strokeWidth={1.2} />
      <text x={195} y={143} textAnchor="middle" fill="#f59e0b" fontSize={8}>M</text>
      <line x1={195} y1={126} x2={195} y2={70} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={195} y1={154} x2={195} y2={210} stroke="#a1a1aa" strokeWidth={1} />
      {/* Field winding in parallel */}
      <line x1={160} y1={70} x2={160} y2={90} stroke="#22c55e" strokeWidth={1} />
      <rect x={154} y={90} width={12} height={40} rx={3} fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth={1} />
      <text x={150} y={114} textAnchor="end" fill="#22c55e" fontSize={7}>R<tspan dy={1} fontSize={5}>f</tspan></text>
      <line x1={160} y1={130} x2={160} y2={210} stroke="#22c55e" strokeWidth={1} />
      {/* If arrow */}
      <polygon points="160,95 157,88 163,88" fill="#22c55e" />
      <text x={148} y={96} textAnchor="end" fill="#22c55e" fontSize={7}>I<tspan dy={1} fontSize={5}>f</tspan></text>
      {/* Bottom wire */}
      <line x1={40} y1={156} x2={40} y2={210} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={40} y1={210} x2={220} y2={210} stroke="#a1a1aa" strokeWidth={1} />
      {/* Label */}
      <text x={130} y={235} textAnchor="middle" fill="#52525b" fontSize={8}>{'\u03C6'} = const (I<tspan dy={2} fontSize={6}>f</tspan><tspan dy={-2}> independent of load)</tspan></text>

      {/* ── Series Motor ── */}
      <text x={400} y={48} textAnchor="middle" fill="#ef4444" fontSize={11} fontWeight={600}>Series Motor</text>
      {/* Vt */}
      <circle cx={300} cy={140} r={16} fill="none" stroke="#6366f1" strokeWidth={1.5} />
      <text x={300} y={144} textAnchor="middle" fill="#6366f1" fontSize={9} fontWeight={600}>V</text>
      {/* Top wire */}
      <line x1={300} y1={124} x2={300} y2={70} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={300} y1={70} x2={490} y2={70} stroke="#a1a1aa" strokeWidth={1} />
      {/* Ia=If arrow */}
      <polygon points="340,70 332,67 332,73" fill="#22d3ee" />
      <text x={340} y={64} fill="#22d3ee" fontSize={8}>I<tspan dy={2} fontSize={6}>a</tspan><tspan dy={-2}> = I</tspan><tspan dy={2} fontSize={6}>f</tspan></text>
      {/* Rse (series field) */}
      <rect x={370} y={62} width={30} height={16} rx={3} fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1} />
      <text x={385} y={74} textAnchor="middle" fill="#ef4444" fontSize={7}>R<tspan dy={1} fontSize={5}>se</tspan></text>
      {/* Ra */}
      <rect x={420} y={62} width={30} height={16} rx={3} fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1} />
      <text x={435} y={74} textAnchor="middle" fill="#ef4444" fontSize={8}>R<tspan dy={2} fontSize={6}>a</tspan></text>
      {/* Motor */}
      <circle cx={470} cy={140} r={14} fill="none" stroke="#f59e0b" strokeWidth={1.2} />
      <text x={470} y={143} textAnchor="middle" fill="#f59e0b" fontSize={8}>M</text>
      <line x1={470} y1={126} x2={470} y2={70} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={470} y1={154} x2={470} y2={210} stroke="#a1a1aa" strokeWidth={1} />
      {/* Bottom */}
      <line x1={300} y1={156} x2={300} y2={210} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={300} y1={210} x2={490} y2={210} stroke="#a1a1aa" strokeWidth={1} />
      <text x={400} y={235} textAnchor="middle" fill="#52525b" fontSize={8}>{'\u03C6'} {'\u221D'} I<tspan dy={2} fontSize={6}>a</tspan><tspan dy={-2}> (field in series with armature)</tspan></text>

      {/* ── Compound Motor ── */}
      <text x={650} y={48} textAnchor="middle" fill="#3b82f6" fontSize={11} fontWeight={600}>Compound Motor</text>
      {/* Vt */}
      <circle cx={570} cy={140} r={16} fill="none" stroke="#6366f1" strokeWidth={1.5} />
      <text x={570} y={144} textAnchor="middle" fill="#6366f1" fontSize={9} fontWeight={600}>V</text>
      {/* Top wire */}
      <line x1={570} y1={124} x2={570} y2={70} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={570} y1={70} x2={740} y2={70} stroke="#a1a1aa" strokeWidth={1} />
      {/* Series field */}
      <rect x={620} y={62} width={26} height={16} rx={3} fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1} />
      <text x={633} y={74} textAnchor="middle" fill="#ef4444" fontSize={6}>R<tspan dy={1} fontSize={5}>se</tspan></text>
      {/* Ra */}
      <rect x={660} y={62} width={26} height={16} rx={3} fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1} />
      <text x={673} y={74} textAnchor="middle" fill="#ef4444" fontSize={7}>R<tspan dy={2} fontSize={5}>a</tspan></text>
      {/* Motor */}
      <circle cx={720} cy={140} r={14} fill="none" stroke="#f59e0b" strokeWidth={1.2} />
      <text x={720} y={143} textAnchor="middle" fill="#f59e0b" fontSize={8}>M</text>
      <line x1={720} y1={126} x2={720} y2={70} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={720} y1={154} x2={720} y2={210} stroke="#a1a1aa" strokeWidth={1} />
      {/* Shunt field in parallel */}
      <line x1={700} y1={70} x2={700} y2={90} stroke="#22c55e" strokeWidth={1} />
      <rect x={694} y={90} width={12} height={35} rx={3} fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth={1} />
      <text x={690} y={110} textAnchor="end" fill="#22c55e" fontSize={6}>R<tspan dy={1} fontSize={5}>f</tspan></text>
      <line x1={700} y1={125} x2={700} y2={210} stroke="#22c55e" strokeWidth={1} />
      {/* Bottom */}
      <line x1={570} y1={156} x2={570} y2={210} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={570} y1={210} x2={740} y2={210} stroke="#a1a1aa" strokeWidth={1} />
      <text x={655} y={235} textAnchor="middle" fill="#52525b" fontSize={8}>{'\u03C6'} = {'\u03C6'}<tspan dy={2} fontSize={5}>sh</tspan><tspan dy={-2}> {'\u00B1'} {'\u03C6'}</tspan><tspan dy={2} fontSize={5}>se</tspan><tspan dy={-2}> (+ cum, {'\u2212'} diff)</tspan></text>
      {/* +/- annotation */}
      <rect x={640} y={248} width={30} height={14} rx={4} fill="rgba(59,130,246,0.1)" stroke="#3b82f6" strokeWidth={0.5} />
      <text x={655} y={258} textAnchor="middle" fill="#3b82f6" fontSize={7}>+ cum</text>
      <rect x={675} y={248} width={30} height={14} rx={4} fill="rgba(245,158,11,0.1)" stroke="#f59e0b" strokeWidth={0.5} />
      <text x={690} y={258} textAnchor="middle" fill="#f59e0b" fontSize={7}>{'\u2212'} diff</text>
    </svg>
  );
}

/* SVG: Annotated speed-torque curve sketch */
function TheorySpeedTorqueDiagram() {
  const px = 80, py = 40, pw = 380, ph = 200;
  const sx = v => px + (v / 60) * pw;
  const sy = v => py + ph - (v / 3500) * ph;

  /* Generate approximate curves for the sketch */
  const shuntPts = [];
  for (let t = 0; t <= 55; t += 1) { shuntPts.push({ x: sx(t), y: sy(1400 - t * 3) }); }
  const seriesPts = [];
  for (let t = 2; t <= 55; t += 1) { const n = Math.min(3200, 300 / (t * 0.01 + 0.05)); seriesPts.push({ x: sx(t), y: sy(n) }); }
  const cumPts = [];
  for (let t = 0; t <= 55; t += 1) { cumPts.push({ x: sx(t), y: sy(1350 - t * 8) }); }
  const diffPts = [];
  for (let t = 0; t <= 40; t += 1) { diffPts.push({ x: sx(t), y: sy(1300 + t * 5) }); }

  const toPath = pts => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');

  return (
    <svg viewBox="0 0 760 310" style={S.svgDiagram}>
      <text x={380} y={22} textAnchor="middle" fill="#71717a" fontSize={13} fontWeight={600}>Speed-Torque Characteristics {'\u2014'} All Motor Types</text>

      {/* Grid */}
      {[0, 500, 1000, 1500, 2000, 2500, 3000].map(n => <line key={n} x1={px} y1={sy(n)} x2={px + pw} y2={sy(n)} stroke="#1e1e2e" strokeWidth={1} />)}
      {[0, 10, 20, 30, 40, 50].map(t => <line key={t} x1={sx(t)} y1={py} x2={sx(t)} y2={py + ph} stroke="#1e1e2e" strokeWidth={1} />)}

      {/* Axes */}
      <line x1={px} y1={py} x2={px} y2={py + ph} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={px} y1={py + ph} x2={px + pw} y2={py + ph} stroke="#3f3f46" strokeWidth={1.5} />
      <text x={px + pw / 2} y={py + ph + 22} textAnchor="middle" fill="#71717a" fontSize={10}>Torque T (Nm)</text>
      <text x={28} y={py + ph / 2} textAnchor="middle" fill="#71717a" fontSize={10} transform={`rotate(-90, 28, ${py + ph / 2})`}>Speed N (rpm)</text>

      {/* Runaway zone shading */}
      <rect x={px} y={py} width={sx(8) - px} height={ph} fill="rgba(239,68,68,0.05)" />
      <text x={sx(4)} y={py + 15} textAnchor="middle" fill="#ef4444" fontSize={8} opacity={0.6}>Runaway</text>

      {/* Curves */}
      <path d={toPath(shuntPts)} fill="none" stroke="#22c55e" strokeWidth={2.5} />
      <path d={toPath(seriesPts)} fill="none" stroke="#ef4444" strokeWidth={2.5} />
      <path d={toPath(cumPts)} fill="none" stroke="#3b82f6" strokeWidth={2.5} />
      <path d={toPath(diffPts)} fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="6 3" />

      {/* Curve labels */}
      <text x={sx(48)} y={sy(1400 - 48 * 3) - 8} fill="#22c55e" fontSize={10} fontWeight={600}>Shunt</text>
      <text x={sx(50)} y={sy(Math.min(3200, 300 / (50 * 0.01 + 0.05))) + 14} fill="#ef4444" fontSize={10} fontWeight={600}>Series</text>
      <text x={sx(40)} y={sy(1350 - 40 * 8) - 8} fill="#3b82f6" fontSize={10} fontWeight={600}>Cum. Compound</text>
      <text x={sx(35)} y={sy(1300 + 35 * 5) + 14} fill="#f59e0b" fontSize={10} fontWeight={600}>Diff. Compound</text>

      {/* Annotation arrows */}
      {/* Shunt: nearly flat */}
      <line x1={sx(55)} y1={sy(1250)} x2={sx(55)} y2={sy(1380)} stroke="#22c55e" strokeWidth={1} opacity={0.4} />
      <text x={sx(55) + 4} y={sy(1320)} fill="#22c55e" fontSize={7} opacity={0.6}>Small</text>
      <text x={sx(55) + 4} y={sy(1320) + 9} fill="#22c55e" fontSize={7} opacity={0.6}>drop</text>

      {/* ── Right: Key properties ── */}
      <line x1={500} y1={30} x2={500} y2={270} stroke="#1e1e2e" strokeWidth={1} />

      <text x={520} y={55} fill="#e4e4e7" fontSize={12} fontWeight={600}>Characteristic Summary</text>

      {[
        { y: 80, color: '#22c55e', label: 'Shunt', props: ['Nearly constant speed (3-5% reg)', 'T \u221D I\u2090 (linear)', 'Best for constant-speed loads'] },
        { y: 135, color: '#ef4444', label: 'Series', props: ['Speed \u221D 1/\u221AT (hyperbolic)', 'T \u221D I\u2090\u00B2 (parabolic)', 'Runaway risk at no-load!'] },
        { y: 195, color: '#3b82f6', label: 'Cumulative', props: ['Moderate speed drop', 'Good starting torque', 'No runaway risk'] },
        { y: 245, color: '#f59e0b', label: 'Differential', props: ['Speed rises with load', 'UNSTABLE - rarely used'] },
      ].map(item => (
        <g key={item.label}>
          <rect x={518} y={item.y - 12} width={8} height={8} rx={2} fill={item.color} />
          <text x={532} y={item.y - 4} fill={item.color} fontSize={10} fontWeight={600}>{item.label}</text>
          {item.props.map((prop, j) => (
            <text key={j} x={532} y={item.y + 10 + j * 13} fill="#71717a" fontSize={8}>{prop}</text>
          ))}
        </g>
      ))}
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>DC Motor Types {'\u2014'} Speed-Torque Characteristics</h2>
      <p style={S.p}>
        DC motors are classified by the way their field winding is connected relative to the
        armature winding. This connection determines the relationship between flux, current,
        and load {'\u2014'} and therefore the shape of the speed-torque characteristic.
      </p>

      {/* SVG: Circuit diagrams for all 3 types */}
      <TheoryCircuitDiagrams />

      <h3 style={S.h3}>Shunt Motor (Separately Excited / Shunt-Connected)</h3>
      <p style={S.p}>
        The field winding is connected in parallel with the armature (or excited by a separate
        source). Since the field voltage is constant, the field current and therefore flux {'\u03C6'}
        are approximately constant regardless of load:
      </p>
      <div style={S.eq}>N = (V {'\u2212'} I<sub>a</sub>{'\u00B7'}R<sub>a</sub>) / K{'\u03C6'}</div>
      <p style={S.p}>
        Since {'\u03C6'} is constant, the only term that varies with load is the I<sub>a</sub>{'\u00B7'}R<sub>a</sub> drop. For typical
        motors R<sub>a</sub> is small, so the speed drops only slightly from no-load to full-load {'\u2014'} typically
        3{'\u2013'}5% regulation. The speed-torque curve is a nearly flat, slightly drooping line.
      </p>
      <div style={S.ctx}>
        <span style={S.ctxT}>Shunt Motor {'\u2014'} Constant Speed Machine</span>
        <p style={S.ctxP}>
          The shunt motor is essentially a constant-speed machine. At no load, I<sub>a</sub> {'\u2248'} 0 and N = V/K{'\u03C6'}.
          When load increases, more current flows (I<sub>a</sub> = T/K{'\u03C6'}), E<sub>b</sub> drops slightly, and speed
          decreases marginally. This self-regulating behavior makes it ideal for machine tools,
          lathes, and centrifugal pumps where constant speed is desired.
        </p>
      </div>

      <h3 style={S.h3}>Series Motor</h3>
      <p style={S.p}>
        The field winding is in series with the armature, so the field current equals the
        armature current: I<sub>f</sub> = I<sub>a</sub>. In the unsaturated region, flux is proportional to
        armature current: {'\u03C6'} = K<sub>se</sub> {'\u00D7'} I<sub>a</sub>. This gives:
      </p>
      <div style={S.eqBox}>
        <span style={{ ...S.ctxT, color: '#818cf8', fontSize: 12 }}>Series Motor Equations</span>
        <div style={S.eqStep}>Since {'\u03C6'} = K<sub>se</sub> {'\u00B7'} I<sub>a</sub>:</div>
        <div style={S.eqStep}>T = K{'\u03C6'} {'\u00B7'} I<sub>a</sub> = K<sub>se</sub> {'\u00B7'} I<sub>a</sub>{'\u00B2'}</div>
        <div style={S.eqResult}>T {'\u221D'} I<sub>a</sub>{'\u00B2'} (parabolic torque-current relationship)</div>
        <div style={S.eqStep} style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 14, color: '#a1a1aa' }}>N = (V {'\u2212'} I<sub>a</sub>(R<sub>a</sub>+R<sub>se</sub>)) / (K<sub>se</sub> {'\u00B7'} I<sub>a</sub>)</div>
      </div>
      <p style={S.p}>
        At light load: I<sub>a</sub> is small {'\u2192'} {'\u03C6'} is small {'\u2192'} speed is very high. As I<sub>a</sub> {'\u2192'} 0, speed {'\u2192'} {'\u221E'}.
        This is the <strong style={{ color: '#ef4444' }}>runaway problem</strong> {'\u2014'} a series motor
        must <em>never</em> be operated without mechanical load, or the speed will increase
        destructively. Belts or couplings that might slip are not acceptable.
      </p>
      <p style={S.p}>
        At heavy load: I<sub>a</sub> is large {'\u2192'} {'\u03C6'} is large {'\u2192'} speed drops rapidly. The series motor provides
        enormous starting torque (T {'\u221D'} I<sub>a</sub>{'\u00B2'}) and naturally slows under heavy load, making it
        ideal for traction (trains, electric vehicles), cranes, and hoists where high starting
        torque and variable speed under load are needed.
      </p>

      <h3 style={S.h3}>Compound Motors</h3>
      <p style={S.p}>
        Compound motors have both a shunt and a series field winding. The total flux is:
      </p>
      <div style={S.eq}>{'\u03C6'} = {'\u03C6'}<sub>shunt</sub> {'\u00B1'} {'\u03C6'}<sub>series</sub> = K<sub>e,sh</sub>{'\u00B7'}I<sub>sh</sub> {'\u00B1'} K<sub>se</sub>{'\u00B7'}I<sub>a</sub></div>

      <p style={S.p}>
        <strong style={{ color: '#3b82f6' }}>Cumulative compound</strong> (+): The series
        field adds to the shunt field. As load increases, total flux increases, causing speed
        to drop more than a pure shunt motor but less than a pure series motor. It provides
        a compromise: better starting torque than a shunt motor, and no runaway risk at no load
        (the shunt field maintains a minimum flux). Used for rolling mills, punch presses,
        and elevators.
      </p>
      <p style={S.p}>
        <strong style={{ color: '#f59e0b' }}>Differential compound</strong> ({'\u2212'}): The series
        field opposes the shunt field. As load increases, total flux <em>decreases</em>,
        causing speed to <em>increase</em> {'\u2014'} this is inherently unstable. The motor can
        enter a positive feedback loop: more load {'\u2192'} less flux {'\u2192'} higher speed {'\u2192'} more current
        {'\u2192'} even less flux. This makes it dangerous and it is rarely used in practice.
      </p>

      {/* SVG: Speed-torque characteristic comparison */}
      <TheorySpeedTorqueDiagram />

      <h3 style={S.h3}>Speed Regulation</h3>
      <div style={S.eq}>Speed Regulation = (N<sub>no-load</sub> {'\u2212'} N<sub>full-load</sub>) / N<sub>full-load</sub> {'\u00D7'} 100%</div>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Motor Type</th>
            <th style={S.th}>Speed Regulation</th>
            <th style={S.th}>Characteristic</th>
            <th style={S.th}>Starting Torque</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Shunt', '3\u20135%', 'Nearly constant speed', 'Moderate (\u221D I\u2090)'],
            ['Series', '15\u201325% (steep drop)', 'Highly variable', 'Very high (\u221D I\u2090\u00B2)'],
            ['Cum. Compound', '7\u201315%', 'Moderate drop', 'High'],
            ['Diff. Compound', 'Negative (unstable)', 'Speed rises with load', 'Low (opposing flux)'],
          ].map(([type, reg, char, st]) => (
            <tr key={type}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{type}</td>
              <td style={S.td}>{reg}</td>
              <td style={S.td}>{char}</td>
              <td style={S.td}>{st}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>Application Matching</h3>
      <p style={S.p}>
        The load characteristic determines the motor choice:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#22c55e' }}>Constant-torque loads</strong> (conveyors, hoists): Shunt or cumulative compound {'\u2014'} speed remains stable.</li>
        <li style={S.li}><strong style={{ color: '#ef4444' }}>High starting torque loads</strong> (traction, cranes): Series {'\u2014'} T {'\u221D'} I<sub>a</sub>{'\u00B2'} provides massive breakaway torque, and natural speed reduction under load prevents excessive current.</li>
        <li style={S.li}><strong style={{ color: '#3b82f6' }}>Intermittent heavy loads</strong> (rolling mills, punch presses): Cumulative compound {'\u2014'} handles torque surges while maintaining reasonable speed regulation.</li>
        <li style={S.li}><strong style={{ color: '#a1a1aa' }}>Fan/pump loads</strong> (T {'\u221D'} N{'\u00B2'}): Shunt {'\u2014'} the load torque drops with speed, providing natural self-regulation.</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>Why Series Motors Dominate Traction</span>
        <p style={S.ctxP}>
          Indian Railways' WAG-5 and WAG-7 electric locomotives used series DC traction motors
          for decades. The series motor's natural characteristic {'\u2014'} high torque at low speed for
          starting heavy trains, and lower torque at high speed for cruising {'\u2014'} perfectly matches
          the traction load profile. The T {'\u221D'} 1/N{'\u00B2'} characteristic means the motor naturally
          delivers maximum torque during acceleration (when N is low) and reduces current at
          cruise speed. Modern locomotives (WAP-7, WAG-9) have transitioned to 3-phase AC
          induction motors with VVVF drives, but the traction characteristic is electronically
          shaped to mimic the favorable series motor behavior.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Chapman, S.J. {'\u2014'} <em>Electric Machinery Fundamentals</em>, 5th Edition, McGraw-Hill</li>
        <li style={S.li}>Fitzgerald, Kingsley, Umans {'\u2014'} <em>Electric Machinery</em>, 7th Edition</li>
        <li style={S.li}>Theraja, B.L. {'\u2014'} <em>A Textbook of Electrical Technology Vol. II</em>, S. Chand</li>
        <li style={S.li}>IS 4722 {'\u2014'} Rotating Electrical Machines {'\u2014'} AC and DC Motors</li>
      </ul>
    </div>
  );
}

const btnS = (active, color) => ({
  padding: '5px 14px', borderRadius: 8,
  border: active ? `1px solid ${color}` : '1px solid #27272a',
  background: active ? `${color}18` : 'transparent',
  color: active ? color : '#52525b',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
});

export default function DCMotorCharacteristics() {
  const [tab, setTab] = useState('simulate');
  const [V, setV] = useState(220);
  const [TL, setTL] = useState(20);
  const [plotType, setPlotType] = useState('nt');
  const [show, setShow] = useState({ shunt: true, series: true, cumulative: true, differential: true });

  const curves = useMemo(() => computeCurves(V), [V]);

  const toggle = (k) => setShow(s => ({ ...s, [k]: !s[k] }));

  const ops = {};
  Object.keys(MOTORS).forEach(k => { if (show[k]) ops[k] = interpolate(curves[k], TL); });

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Chart curves={curves} show={show} TL={TL} plotType={plotType} V={V} />
          </div>

          <div style={S.results}>
            {Object.keys(MOTORS).filter(k => show[k] && ops[k]).map(k => (
              <div key={k} style={S.ri}>
                <span style={S.rl}>{MOTORS[k].label}</span>
                <span style={{ ...S.rv, color: MOTORS[k].color }}>{ops[k].n.toFixed(0)} rpm / {ops[k].ia.toFixed(1)} A</span>
              </div>
            ))}
            <div style={S.ri}>
              <span style={S.rl}>Load Torque</span>
              <span style={{ ...S.rv, color: '#c4b5fd' }}>{TL} Nm</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Supply</span>
              <span style={{ ...S.rv, color: '#e4e4e7' }}>{V} V</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Voltage (V)</span>
              <input type="range" min={100} max={250} step={5} value={V} onChange={e => setV(+e.target.value)} style={S.slider} />
              <span style={S.val}>{V} V</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Load Torque (Nm)</span>
              <input type="range" min={2} max={60} step={1} value={TL} onChange={e => setTL(+e.target.value)} style={S.slider} />
              <span style={S.val}>{TL} Nm</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Plot</span>
              <button style={btnS(plotType === 'nt', '#6366f1')} onClick={() => setPlotType('nt')}>N vs T</button>
              <button style={btnS(plotType === 'nia', '#6366f1')} onClick={() => setPlotType('nia')}>N vs I<sub>a</sub></button>
              <button style={btnS(plotType === 'tia', '#6366f1')} onClick={() => setPlotType('tia')}>T vs I<sub>a</sub></button>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Motors</span>
              {Object.entries(MOTORS).map(([k, m]) => (
                <button key={k} style={btnS(show[k], m.color)} onClick={() => toggle(k)}>{m.label}</button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
