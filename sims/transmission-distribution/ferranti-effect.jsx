import React, { useState, useMemo } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '16px 16px 8px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
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
};

const cMul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cAdd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const cDiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
const cAbs = (a) => Math.hypot(a[0], a[1]);
const cArg = (a) => Math.atan2(a[1], a[0]);
const cScale = (a, s) => [a[0] * s, a[1] * s];
const cSqrt = (a) => { const r = Math.sqrt(cAbs(a)), th = cArg(a) / 2; return [r * Math.cos(th), r * Math.sin(th)]; };
const cExp = (a) => { const e = Math.exp(a[0]); return [e * Math.cos(a[1]), e * Math.sin(a[1])]; };
const cNeg = (a) => [-a[0], -a[1]];
const cCosh = (a) => { const p = cExp(a), n = cExp(cNeg(a)); return [(p[0] + n[0]) / 2, (p[1] + n[1]) / 2]; };
const cSinh = (a) => { const p = cExp(a), n = cExp(cNeg(a)); return [(p[0] - n[0]) / 2, (p[1] - n[1]) / 2]; };

const Z_KM = [0.032, 0.327];
const Y_KM = [0, 3.72e-6];
const SQRT3 = Math.sqrt(3);

function compute(lineKm, VsLL, loadPct) {
  const gamma = cSqrt(cMul(Z_KM, Y_KM));
  const beta = gamma[1];
  const Zc = cSqrt(cDiv(Z_KM, Y_KM));
  const ZcMag = cAbs(Zc);
  const SIL = (VsLL * VsLL) / ZcMag;
  const k = loadPct / 100;

  const gl = cScale(gamma, lineKm);
  const A = cCosh(gl);
  const sinhGL = cSinh(gl);
  const C_abcd = cDiv(sinhGL, Zc);
  const VsPhase = VsLL / SQRT3;

  const denom = cAdd(A, cScale(sinhGL, k));
  const VrC = cDiv([VsPhase, 0], denom);
  const VrMag = cAbs(VrC);
  const VrLL = VrMag * SQRT3;

  const N = 80;
  const profile = [];
  for (let i = 0; i <= N; i++) {
    const d = (i / N) * lineKm;
    const x = lineKm - d;
    const gx = cScale(gamma, x);
    const V = cMul(VrC, cAdd(cCosh(gx), cScale(cSinh(gx), k)));
    profile.push({ d, V: cAbs(V) * SQRT3 });
  }

  const refs = [0, 1, 1.5].map((kk) => {
    const dm = cAdd(A, cScale(sinhGL, kk));
    const vr = cDiv([VsPhase, 0], dm);
    const pts = [];
    for (let i = 0; i <= N; i++) {
      const d = (i / N) * lineKm;
      const x = lineKm - d;
      const gx = cScale(gamma, x);
      const V = cMul(vr, cAdd(cCosh(gx), cScale(cSinh(gx), kk)));
      pts.push({ d, V: cAbs(V) * SQRT3 });
    }
    return pts;
  });

  const IrC = cScale(cDiv(VrC, Zc), k);
  const IsC = cAdd(cMul(C_abcd, VrC), cMul(A, IrC));

  const VrNL = cDiv([VsPhase, 0], A);
  const IcC = cMul(C_abcd, VrNL);
  const IcAmp = cAbs(IcC) * 1000;

  const deltaV = ((VrLL - VsLL) / VsLL) * 100;
  const vrAngle = cArg(VrC);

  return {
    VsLL, VrLL, VrMag, VsPhase, deltaV, SIL, k, loadPct, lineKm,
    beta, ZcMag, profile, refs,
    IcAmp,
    IsAmp: cAbs(IsC) * 1000,
    phasor: {
      vrMag: VrMag,
      vsMag: VsPhase,
      vsAngle: -vrAngle,
      icAngle: cArg(IcC) - cArg(VrNL),
      icMag: IcAmp,
    },
  };
}

function Diagram({ data }) {
  const { VsLL, VrLL, deltaV, lineKm, loadPct, profile, refs, phasor, IcAmp } = data;

  const W = 920, H = 330;
  const PL = 62, PT = 32, pw = 530, ph = 245;
  const PCX = 770, PCY = 165, PR = 95;

  let vMin = Infinity, vMax = -Infinity;
  [profile, ...refs].forEach((arr) =>
    arr.forEach((p) => {
      if (p.V < vMin) vMin = p.V;
      if (p.V > vMax) vMax = p.V;
    })
  );
  const vRange = vMax - vMin;
  const vPad = Math.max(vRange * 0.15, 8);
  vMin = Math.floor((vMin - vPad) / 5) * 5;
  vMax = Math.ceil((vMax + vPad) / 5) * 5;

  const xS = (d) => PL + (d / lineKm) * pw;
  const yS = (v) => PT + ph - ((v - vMin) / (vMax - vMin)) * ph;
  const mkPath = (pts) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xS(p.d).toFixed(1)},${yS(p.V).toFixed(1)}`).join(' ');

  const vStep = vRange > 80 ? 20 : vRange > 35 ? 10 : 5;
  const yTicks = [];
  for (let v = Math.ceil(vMin / vStep) * vStep; v <= vMax; v += vStep) yTicks.push(v);

  const xStep = lineKm <= 100 ? 25 : lineKm <= 200 ? 50 : 100;
  const xTicks = [];
  for (let d = 0; d <= lineKm; d += xStep) xTicks.push(d);
  if (xTicks[xTicks.length - 1] < lineKm) xTicks.push(lineKm);

  const refColors = ['#f59e0b', '#22c55e', '#3b82f6'];
  const refLabels = ['No Load', 'SIL', '1.5×SIL'];
  const activeIdx = loadPct === 0 ? 0 : loadPct === 100 ? 1 : loadPct === 150 ? 2 : -1;

  const fillPath =
    profile.map((p, i) => `${i === 0 ? 'M' : 'L'}${xS(p.d).toFixed(1)},${yS(p.V).toFixed(1)}`).join('') +
    `L${xS(lineKm).toFixed(1)},${yS(VsLL).toFixed(1)}` +
    `L${xS(0).toFixed(1)},${yS(VsLL).toFixed(1)}Z`;

  const fillCol = Math.abs(deltaV) > 0.3
    ? deltaV > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'
    : 'transparent';

  const activeCurveColor = activeIdx >= 0 ? refColors[activeIdx] : '#a78bfa';

  const sc = (PR * 0.78) / Math.max(phasor.vrMag, phasor.vsMag);
  const vrLen = phasor.vrMag * sc;
  const vsLen = phasor.vsMag * sc;
  const vsAng = phasor.vsAngle;
  const icFixedLen = PR * 0.45;

  const arrowPts = (x1, y1, x2, y2, hs = 6) => {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    if (len < 2) return '';
    const ux = dx / len, uy = dy / len, px = -uy, py = ux;
    return `${x2},${y2} ${x2 - hs * 1.6 * ux + hs * 0.5 * px},${y2 - hs * 1.6 * uy + hs * 0.5 * py} ${x2 - hs * 1.6 * ux - hs * 0.5 * px},${y2 - hs * 1.6 * uy - hs * 0.5 * py}`;
  };

  const VrEndColor = deltaV > 0.5 ? '#22c55e' : deltaV < -0.5 ? '#ef4444' : '#a1a1aa';
  const dvSign = deltaV > 0 ? '+' : '';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <defs>
        <filter id="pglow"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {/* Plot background */}
      <rect x={PL} y={PT} width={pw} height={ph} rx={4} fill="#0c0c10" stroke="#1e1e2e" strokeWidth={0.5} />

      {/* Y grid + labels */}
      {yTicks.map((v) => (
        <g key={`y${v}`}>
          <line x1={PL} y1={yS(v)} x2={PL + pw} y2={yS(v)} stroke="#1a1a24" strokeWidth={0.5} />
          <text x={PL - 6} y={yS(v) + 4} textAnchor="end" fontSize={9} fill="#52525b" fontFamily="monospace">{v}</text>
        </g>
      ))}
      {/* X grid + labels */}
      {xTicks.map((d) => (
        <g key={`x${d}`}>
          <line x1={xS(d)} y1={PT} x2={xS(d)} y2={PT + ph} stroke="#1a1a24" strokeWidth={0.5} />
          <text x={xS(d)} y={PT + ph + 14} textAnchor="middle" fontSize={9} fill="#52525b">{d}</text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={PL + pw / 2} y={PT + ph + 30} textAnchor="middle" fontSize={10} fill="#52525b">Distance from Sending End (km)</text>
      <text x={16} y={PT + ph / 2} textAnchor="middle" fontSize={10} fill="#52525b" transform={`rotate(-90,16,${PT + ph / 2})`}>Voltage (kV)</text>

      {/* Vs reference line */}
      <line x1={PL} y1={yS(VsLL)} x2={PL + pw} y2={yS(VsLL)} stroke="#6366f1" strokeWidth={1} strokeDasharray="6 4" opacity={0.5} />
      <text x={PL + pw + 4} y={yS(VsLL) + 3} fontSize={8} fill="#6366f1" opacity={0.7}>Vs</text>

      {/* Fill between active curve and Vs */}
      <path d={fillPath} fill={fillCol} />

      {/* Reference curves */}
      {refs.map((pts, i) => (
        <path key={i} d={mkPath(pts)} fill="none"
          stroke={refColors[i]}
          strokeWidth={activeIdx === i ? 2.5 : 1.2}
          strokeDasharray={activeIdx === i ? 'none' : '5 3'}
          opacity={activeIdx === i ? 1 : 0.5}
        />
      ))}

      {/* Active curve (when not matching a reference) */}
      {activeIdx < 0 && (
        <path d={mkPath(profile)} fill="none" stroke="#a78bfa" strokeWidth={2.5} />
      )}

      {/* Endpoint Vr labels */}
      {refs.map((pts, i) => {
        const vrVal = pts[pts.length - 1].V;
        return (
          <text key={`vr${i}`} x={xS(lineKm) + 4} y={yS(vrVal) + 3}
            fontSize={8} fill={refColors[i]}
            opacity={activeIdx === i ? 1 : 0.45}
            fontWeight={activeIdx === i ? 700 : 400}
            fontFamily="monospace">
            {vrVal.toFixed(0)}
          </text>
        );
      })}
      {activeIdx < 0 && (
        <text x={xS(lineKm) + 4} y={yS(VrLL) + 3}
          fontSize={9} fill="#a78bfa" fontWeight={700} fontFamily="monospace">
          {VrLL.toFixed(0)}
        </text>
      )}

      {/* Sending/Receiving labels */}
      <text x={PL + 2} y={PT - 8} fontSize={10} fontWeight={600} fill="#818cf8">Sending End</text>
      <text x={PL + pw - 2} y={PT - 8} textAnchor="end" fontSize={10} fontWeight={600} fill={VrEndColor}>Receiving End</text>

      {/* Tower icons */}
      <g transform={`translate(${PL + 6},${PT + ph - 10})`}>
        <line x1={0} y1={0} x2={0} y2={-18} stroke="#3f3f46" strokeWidth={1.5} />
        <line x1={-5} y1={-14} x2={5} y2={-14} stroke="#3f3f46" strokeWidth={1} />
        <line x1={-4} y1={-9} x2={4} y2={-9} stroke="#3f3f46" strokeWidth={1} />
        <line x1={-6} y1={0} x2={6} y2={0} stroke="#3f3f46" strokeWidth={1} />
      </g>
      <g transform={`translate(${PL + pw - 6},${PT + ph - 10})`}>
        <line x1={0} y1={0} x2={0} y2={-18} stroke="#3f3f46" strokeWidth={1.5} />
        <line x1={-5} y1={-14} x2={5} y2={-14} stroke="#3f3f46" strokeWidth={1} />
        <line x1={-4} y1={-9} x2={4} y2={-9} stroke="#3f3f46" strokeWidth={1} />
        <line x1={-6} y1={0} x2={6} y2={0} stroke="#3f3f46" strokeWidth={1} />
      </g>

      {/* Animated power flow particles along the bottom of the plot */}
      {[0, 1, 2].map((i) => (
        <circle key={`pf${i}`} r={2.5} fill="#818cf8" opacity={0.6} filter="url(#pglow)">
          <animateMotion dur="3.5s" begin={`${i * 1.17}s`} repeatCount="indefinite"
            path={`M${PL + 8},${PT + ph - 3} L${PL + pw - 8},${PT + ph - 3}`} />
        </circle>
      ))}

      {/* Legend */}
      <rect x={PL + pw - 122} y={PT + 6} width={118} height={activeIdx < 0 ? 100 : 78} rx={6}
        fill="rgba(9,9,11,0.85)" stroke="#27272a" strokeWidth={0.5} />
      {refLabels.map((lbl, i) => (
        <g key={`lg${i}`}>
          <line x1={PL + pw - 113} y1={PT + 22 + i * 22} x2={PL + pw - 93} y2={PT + 22 + i * 22}
            stroke={refColors[i]} strokeWidth={activeIdx === i ? 2.5 : 1.5}
            strokeDasharray={activeIdx === i ? 'none' : '4 2'} />
          <text x={PL + pw - 88} y={PT + 26 + i * 22} fontSize={10}
            fill={refColors[i]} opacity={activeIdx === i ? 1 : 0.7}
            fontWeight={activeIdx === i ? 600 : 400}>{lbl}</text>
        </g>
      ))}
      {activeIdx < 0 && (
        <g>
          <line x1={PL + pw - 113} y1={PT + 22 + 3 * 22} x2={PL + pw - 93} y2={PT + 22 + 3 * 22}
            stroke="#a78bfa" strokeWidth={2.5} />
          <text x={PL + pw - 88} y={PT + 26 + 3 * 22} fontSize={10} fill="#a78bfa" fontWeight={600}>
            {loadPct}% SIL
          </text>
        </g>
      )}

      {/* ΔV% badge */}
      <rect x={PL + 10} y={PT + ph - 36} width={92} height={28} rx={6}
        fill={deltaV > 0.5 ? 'rgba(34,197,94,0.12)' : deltaV < -0.5 ? 'rgba(239,68,68,0.12)' : 'rgba(161,161,170,0.08)'}
        stroke={deltaV > 0.5 ? '#22c55e' : deltaV < -0.5 ? '#ef4444' : '#3f3f46'} strokeWidth={0.7} />
      <text x={PL + 56} y={PT + ph - 18} textAnchor="middle" fontSize={12} fontWeight={700}
        fontFamily="monospace" fill={VrEndColor}>
        ΔV = {dvSign}{deltaV.toFixed(2)}%
      </text>

      {/* === Phasor Diagram === */}
      <rect x={PCX - PR - 16} y={PCY - PR - 28} width={(PR + 16) * 2} height={(PR + 16) * 2 + 8}
        rx={10} fill="#0c0c10" stroke="#1e1e2e" strokeWidth={0.5} />
      <text x={PCX} y={PCY - PR - 12} textAnchor="middle" fontSize={10} fontWeight={600} fill="#52525b">
        Phasor Diagram
      </text>

      {/* Reference circle */}
      <circle cx={PCX} cy={PCY} r={PR * 0.85} fill="none" stroke="#1e1e2e" strokeDasharray="3 3" />

      {/* Rotating reference sweep */}
      <line x1={PCX} y1={PCY} x2={PCX + PR * 0.88} y2={PCY} stroke="#27272a" strokeWidth={0.5} opacity={0.5}>
        <animateTransform attributeName="transform" type="rotate"
          from={`0 ${PCX} ${PCY}`} to={`-360 ${PCX} ${PCY}`} dur="5s" repeatCount="indefinite" />
      </line>

      {/* Vr phasor (green, at angle 0 = horizontal right) */}
      <line x1={PCX} y1={PCY} x2={PCX + vrLen} y2={PCY} stroke="#22c55e" strokeWidth={2.2} />
      <polygon points={arrowPts(PCX, PCY, PCX + vrLen, PCY, 5)} fill="#22c55e" />
      <text x={PCX + vrLen + 3} y={PCY - 6} fontSize={9} fill="#22c55e" fontWeight={600}>Vr</text>
      <text x={PCX + vrLen + 3} y={PCY + 10} fontSize={7} fill="#22c55e" fontFamily="monospace" opacity={0.8}>
        {(phasor.vrMag * SQRT3).toFixed(0)} kV
      </text>

      {/* Vs phasor (indigo) */}
      <line x1={PCX} y1={PCY}
        x2={PCX + vsLen * Math.cos(vsAng)} y2={PCY - vsLen * Math.sin(vsAng)}
        stroke="#818cf8" strokeWidth={2.2} />
      <polygon points={arrowPts(PCX, PCY, PCX + vsLen * Math.cos(vsAng), PCY - vsLen * Math.sin(vsAng), 5)} fill="#818cf8" />
      {(() => {
        const tx = PCX + vsLen * Math.cos(vsAng);
        const ty = PCY - vsLen * Math.sin(vsAng);
        return (
          <>
            <text x={tx + (vsAng < 0 ? 3 : -3)} y={ty + (vsAng < 0 ? 14 : -10)} fontSize={9} fill="#818cf8" fontWeight={600}
              textAnchor={vsAng < 0 ? 'start' : 'end'}>Vs</text>
            <text x={tx + (vsAng < 0 ? 3 : -3)} y={ty + (vsAng < 0 ? 24 : -1)} fontSize={7} fill="#818cf8"
              fontFamily="monospace" opacity={0.8} textAnchor={vsAng < 0 ? 'start' : 'end'}>
              {VsLL.toFixed(0)} kV
            </text>
          </>
        );
      })()}

      {/* Ic phasor (capacitive charging current, ~90° leading Vr) */}
      {(() => {
        const icAng = phasor.icAngle;
        const icX = PCX + icFixedLen * Math.cos(icAng);
        const icY = PCY - icFixedLen * Math.sin(icAng);
        return (
          <g>
            <line x1={PCX} y1={PCY} x2={icX} y2={icY}
              stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="5 3">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </line>
            <polygon points={arrowPts(PCX, PCY, icX, icY, 4)} fill="#06b6d4">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </polygon>
            <text x={icX + (Math.cos(icAng) > 0 ? 5 : -5)} y={icY - 5}
              fontSize={9} fill="#06b6d4" fontWeight={600}
              textAnchor={Math.cos(icAng) > 0 ? 'start' : 'end'}>Ic</text>
            <text x={icX + (Math.cos(icAng) > 0 ? 5 : -5)} y={icY + 7}
              fontSize={7} fill="#06b6d4" fontFamily="monospace" opacity={0.8}
              textAnchor={Math.cos(icAng) > 0 ? 'start' : 'end'}>
              {IcAmp.toFixed(0)} A
            </text>
          </g>
        );
      })()}

      {/* ΔV arc annotation between Vr and Vs tips */}
      {Math.abs(deltaV) > 0.3 && (
        <g>
          <line x1={PCX + vrLen} y1={PCY} x2={PCX + vsLen * Math.cos(vsAng)} y2={PCY - vsLen * Math.sin(vsAng)}
            stroke={VrEndColor} strokeWidth={1} strokeDasharray="2 2" opacity={0.6} />
          <text x={PCX + Math.max(vrLen, vsLen * Math.cos(vsAng)) + 3}
            y={PCY + (deltaV > 0 ? -20 : 22)}
            fontSize={8} fill={VrEndColor} fontWeight={600} fontFamily="monospace">
            {dvSign}{deltaV.toFixed(1)}%
          </text>
        </g>
      )}

      {/* Phasor diagram annotation */}
      <text x={PCX} y={PCY + PR + 8} textAnchor="middle" fontSize={8} fill="#3f3f46">
        {deltaV > 0.5 ? 'Vr > Vs (Ferranti Effect)' : deltaV < -0.5 ? 'Vr < Vs (Voltage Drop)' : 'Vr ≈ Vs (SIL)'}
      </text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>The Ferranti Effect</h2>
      <p style={S.p}>
        The Ferranti effect, first observed by Sebastian Ziani de Ferranti in 1887, is the phenomenon
        where the steady-state receiving-end voltage of a long transmission line <strong style={{ color: '#e4e4e7' }}>exceeds
        the sending-end voltage</strong> under no-load or light-load conditions. This counter-intuitive
        voltage rise is caused by the distributed shunt capacitance of the line drawing leading
        (capacitive) current, which interacts with the series inductance to build up voltage along the
        line length.
      </p>
      <p style={S.p}>
        The effect is significant on lines longer than about 200 km at 50 Hz, and becomes a critical
        design concern for EHV/UHV lines of 300 km and above, where the receiving-end voltage can
        rise 5–20% above the sending-end value at no-load.
      </p>

      <h3 style={S.h3}>Mathematical Foundation</h3>
      <p style={S.p}>
        For a long transmission line modelled with distributed parameters, the voltage and current
        at any point are governed by the propagation constant γ and characteristic impedance Zc:
      </p>
      <div style={S.eq}>γ = √(z × y) = α + jβ {'   '}(propagation constant)</div>
      <div style={S.eq}>Zc = √(z / y) {'   '}(characteristic / surge impedance)</div>
      <p style={S.p}>
        where z = R + jωL (Ω/km) is the series impedance and y = G + jωC (S/km) is the shunt
        admittance per unit length. Using the ABCD (transmission) parameters:
      </p>
      <div style={S.eq}>Vs = A·Vr + B·Ir {'   '}where A = cosh(γl), B = Zc·sinh(γl)</div>
      <p style={S.p}>
        At <strong style={{ color: '#e4e4e7' }}>no-load (Ir = 0)</strong>, this simplifies to:
      </p>
      <div style={S.eq}>Vr = Vs / cosh(γl) ≈ Vs / cos(βl) {'   '}(for lossless line, α ≈ 0)</div>
      <p style={S.p}>
        Since cos(βl) {'<'} 1 for any non-zero line length, we get Vr {'>'} Vs. The phase constant
        β determines how quickly the voltage builds up:
      </p>
      <div style={S.eq}>β = ω√(LC) ≈ 6° per 100 km at 50 Hz (typical 400 kV)</div>

      <h3 style={S.h3}>Physical Mechanism — Why Does Voltage Rise?</h3>
      <p style={S.p}>
        The key to understanding the Ferranti effect lies in the interaction between the line's
        distributed capacitance and inductance:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Step 1 — Capacitive charging current:</strong> The
          line-to-ground and line-to-line capacitances draw a leading (capacitive) current even at
          no-load. This current is distributed along the line, maximum at the sending end and zero
          at the open receiving end.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Step 2 — Current through inductance:</strong> This
          capacitive current flows through the series inductance of the line. The voltage drop
          across the inductance is jωL × Ic, which is 90° ahead of Ic.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Step 3 — Constructive voltage build-up:</strong> Since
          Ic leads the local voltage by 90°, and jωLIc leads Ic by another 90°, the inductive
          drop is 180° from the capacitive current direction — which means it is{' '}
          <strong style={{ color: '#e4e4e7' }}>in phase with and adds to the line voltage</strong>.
          This causes a progressive voltage rise from the sending end toward the receiving end.
        </li>
      </ul>
      <p style={S.p}>
        In essence, the line capacitance acts like a distributed voltage source that pumps reactive
        power into the system, raising the voltage above the applied sending-end value.
      </p>

      <h3 style={S.h3}>Phasor Explanation</h3>
      <p style={S.p}>
        The phasor diagram provides a clear visualization. Taking Vr (receiving end voltage) as
        the reference phasor at no-load:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Ic</strong> leads Vr by approximately 90° (capacitive charging current).
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>IR drop</strong> (= R × l × Ic) is in phase with Ic — a small upward component.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>IX drop</strong> (= ωL × l × Ic) leads Ic by 90° — this is{' '}
          <strong style={{ color: '#e4e4e7' }}>anti-parallel to Vr</strong>, pointing in the direction
          that opposes Vr.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Vs = Vr + IR + jIX:</strong> Since IX opposes Vr, the
          resultant Vs is shorter than Vr, confirming |Vr| {'>'} |Vs|.
        </li>
      </ul>

      <h3 style={S.h3}>Surge Impedance Loading (SIL) — The Transition Point</h3>
      <p style={S.p}>
        The Surge Impedance Loading (SIL), also called natural loading, is the load level at which
        the reactive power generated by the line capacitance exactly equals the reactive power
        absorbed by the line inductance:
      </p>
      <div style={S.eq}>SIL = V² / Zc {'   '}(MW, using line-to-line voltage)</div>
      <p style={S.p}>
        SIL serves as the critical boundary:
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Loading</th>
            <th style={S.th}>Voltage Profile</th>
            <th style={S.th}>Reactive Balance</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['P < SIL', 'Vr > Vs (Ferranti effect)', 'Qc > QL → net capacitive, voltage rises'],
            ['P = SIL', 'Vr ≈ Vs (flat profile)', 'Qc = QL → balanced, natural loading'],
            ['P > SIL', 'Vr < Vs (voltage drop)', 'Qc < QL → net inductive, voltage drops'],
          ].map(([load, profile, balance]) => (
            <tr key={load}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{load}</td>
              <td style={S.td}>{profile}</td>
              <td style={S.td}>{balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={S.p}>
        For a typical 400 kV line with Zc ≈ 297 Ω, SIL ≈ 539 MW. During off-peak hours when
        the load drops well below SIL, the Ferranti effect becomes pronounced.
      </p>

      <h3 style={S.h3}>Practical Implications</h3>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Equipment overvoltage:</strong> Receiving-end voltage
          can exceed the rated maximum (typically 1.05 p.u. for continuous operation, 1.1 p.u. for
          temporary). Sustained overvoltage above 420 kV on a 400 kV system stresses transformer
          insulation, CT/PT insulation, and surge arresters.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Transformer core saturation:</strong> At elevated voltage,
          transformer cores saturate, drawing harmonic-rich magnetizing current that causes
          overheating, increased noise, and distortion.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Insulation stress:</strong> Repeated overvoltage cycling
          (daily load variation) accelerates insulation ageing in cables, bushings, and instrument
          transformers.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Generator under-excitation:</strong> Generators at the
          sending end may be forced into under-excited (leading PF) operation to absorb the excess
          reactive power, risking loss of synchronism.
        </li>
      </ul>

      <h3 style={S.h3}>Compensation Strategies</h3>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Shunt reactors (most common):</strong> Fixed or switched
          shunt reactors of 50–125 MVAr installed at the receiving end (or at both ends and midpoint
          for very long lines). These absorb the excess capacitive reactive power, pulling the voltage
          back down. Typically sized to compensate 60–80% of the line's charging MVAr.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Switched shunt compensation:</strong> Mechanically
          switched reactors (MSR) or thyristor-controlled reactors (TCR) that can be switched in during
          light-load periods and switched out during peak load. This avoids the voltage depression that
          fixed reactors would cause at full load.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>SVC / STATCOM:</strong> Static VAr Compensators or
          STATCOMs provide continuous, fast-acting reactive power control that can absorb or inject
          reactive power as the load varies, maintaining flat voltage profile across all loading levels.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Load management:</strong> Maintaining a minimum load on
          the line (above SIL) during off-peak hours, though this is often impractical.
        </li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>Real-World Context — AP Transco 400 kV Network</span>
        <p style={S.ctxP}>
          AP Transco's 400 kV lines (200–350 km) experience significant Ferranti effect during
          low-demand periods, typically between 11 PM and 5 AM when industrial and agricultural
          loads drop sharply. Shunt reactors of 50–80 MVAr are installed at receiving-end
          substations (Nellore, Kurnool, Anantapur) to absorb excess reactive power and keep the
          receiving-end voltage within the IEGC-mandated band of 380–420 kV. The reactors are
          switched out during daytime peak hours to avoid unnecessary voltage depression. AP Transco
          operates approximately 15–20 shunt reactors across its 400 kV network, totalling over
          1,200 MVAr of installed compensation capacity.
        </p>
      </div>

      <h3 style={S.h3}>Numerical Example — AP Transco 400 kV Line</h3>
      <p style={S.p}>
        Consider a 400 kV line from Kurnool to Nellore, approximately 280 km, with quad ACSR Moose
        conductors:
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Parameter</th>
            <th style={S.th}>Value</th>
            <th style={S.th}>Derivation</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Series impedance z', '0.032 + j0.327 Ω/km', 'Quad ACSR Moose, 50 Hz'],
            ['Shunt admittance y', 'j3.72 µS/km', '12 nF/km capacitance'],
            ['Propagation constant β', '1.10 × 10⁻³ rad/km ≈ 6.3°/100 km', 'β = √(XB)'],
            ['Surge impedance Zc', '297 Ω', 'Zc = √(z/y)'],
            ['SIL', '539 MW', 'V²/Zc = 400²/297'],
            ['βl for 280 km', '17.6°', '6.3° × 2.8'],
            ['No-load Vr', '419.7 kV (+4.9%)', 'Vs/cos(17.6°) = 400/0.953'],
            ['Charging current Ic', '241 A', 'Vs × B × l / √3'],
            ['Charging MVAr', '167 MVAr', '√3 × V × Ic'],
            ['Shunt reactors needed', '2 × 63 MVAr ≈ 126 MVAr', '~75% compensation'],
          ].map(([param, val, note]) => (
            <tr key={param}>
              <td style={S.td}>{param}</td>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600, fontFamily: 'monospace' }}>{val}</td>
              <td style={S.td}>{note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.ctx}>
        <span style={S.ctxT}>Assumptions in This Simulation</span>
        <p style={S.ctxP}>
          The simulation uses the exact long-line (ABCD/hyperbolic) model with distributed parameters.
          Line parameters correspond to a typical 400 kV quad ACSR Moose configuration (z = 0.032 + j0.327
          Ω/km, y = j3.72 µS/km) giving β ≈ 6.3° per 100 km and Zc ≈ 297 Ω. Load is modelled as a
          fraction of SIL at unity power factor (pure resistance equal to Zc). In practice, actual loads
          have lagging power factor, which increases the voltage drop at heavy load and slightly increases
          the Ferranti rise at light load. The supply frequency is fixed at 50 Hz (Indian grid standard).
          Shunt conductance G is neglected as it is typically less than 1% of ωC.
        </p>
      </div>

      <h3 style={S.h3}>Ferranti Effect by Voltage Level</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>System Voltage</th>
            <th style={S.th}>Typical Line Length</th>
            <th style={S.th}>βl at Max Length</th>
            <th style={S.th}>No-Load Vr Rise</th>
            <th style={S.th}>Significance</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['132 kV', '50–150 km', '~9°', '~1.2%', 'Usually negligible'],
            ['220 kV', '80–200 km', '~13°', '~2.6%', 'Minor, rarely compensated'],
            ['400 kV', '200–400 km', '~25°', '~5–11%', 'Significant, shunt reactors needed'],
            ['765 kV', '400–800 km', '~50°', '~15–55%', 'Critical, heavy compensation needed'],
          ].map(([v, len, bl, rise, sig]) => (
            <tr key={v}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{v}</td>
              <td style={S.td}>{len}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{bl}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{rise}</td>
              <td style={S.td}>{sig}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>W.D. Stevenson Jr., <em>"Elements of Power System Analysis"</em>, McGraw-Hill, 4th Edition</li>
        <li style={S.li}>C.L. Wadhwa, <em>"Electrical Power Systems"</em>, New Age International Publishers</li>
        <li style={S.li}>PGCIL — <em>"Manual on Shunt Reactor Compensation for EHV Lines"</em></li>
        <li style={S.li}>Central Electricity Authority (CEA) — Manual on Transmission Planning Criteria</li>
        <li style={S.li}>Indian Electricity Grid Code (IEGC), 2023 — Voltage regulation limits</li>
        <li style={S.li}>AP Transco — Reactive Power Compensation & Voltage Control Policy</li>
      </ul>
    </div>
  );
}

export default function FerrantiEffect() {
  const [tab, setTab] = useState('simulate');
  const [lineKm, setLineKm] = useState(300);
  const [VsLL, setVsLL] = useState(400);
  const [loadPct, setLoadPct] = useState(0);

  const data = useMemo(() => compute(lineKm, VsLL, loadPct), [lineKm, VsLL, loadPct]);

  const dvColor = data.deltaV > 0.5 ? '#22c55e' : data.deltaV < -0.5 ? '#ef4444' : '#a1a1aa';
  const dvSign = data.deltaV > 0 ? '+' : '';

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram data={data} />
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Vs (Sending)</span>
              <span style={{ ...S.rv, color: '#818cf8' }}>{data.VsLL.toFixed(1)} kV</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Vr (Receiving)</span>
              <span style={{ ...S.rv, color: dvColor }}>{data.VrLL.toFixed(1)} kV</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Voltage Rise ΔV</span>
              <span style={{ ...S.rv, color: dvColor }}>{dvSign}{data.deltaV.toFixed(2)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Loading</span>
              <span style={{ ...S.rv, color: '#a78bfa' }}>{data.loadPct}% SIL</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>SIL</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{data.SIL.toFixed(0)} MW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Charging Current</span>
              <span style={{ ...S.rv, color: '#06b6d4' }}>{data.IcAmp.toFixed(0)} A</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Line Length (km)</span>
              <input type="range" min={50} max={500} step={10} value={lineKm}
                onChange={(e) => setLineKm(+e.target.value)} style={S.slider} />
              <span style={S.val}>{lineKm}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Vs (kV)</span>
              <input type="range" min={380} max={420} step={1} value={VsLL}
                onChange={(e) => setVsLL(+e.target.value)} style={S.slider} />
              <span style={S.val}>{VsLL}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Loading (% SIL)</span>
              <input type="range" min={0} max={150} step={5} value={loadPct}
                onChange={(e) => setLoadPct(+e.target.value)} style={S.slider} />
              <span style={S.val}>{loadPct}%</span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
