import React, { useState, useMemo, useCallback } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 130, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 58, textAlign: 'right' },
  results: { display: 'flex', gap: 26, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  strip: { display: 'flex', gap: 12, padding: '12px 24px', background: '#0f0f12', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  box: { flex: '1 1 200px', padding: '12px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 10 },
  boxT: { display: 'block', fontSize: 10, color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 },
  boxV: { display: 'block', fontSize: 13, color: '#c4b5fd', fontFamily: 'monospace', lineHeight: 1.6 },
  theory: { flex: 1, padding: '32px 24px', maxWidth: 860, margin: '0 auto', overflowY: 'auto', width: '100%' },
  h2: { fontSize: 22, fontWeight: 700, color: '#f4f4f5', margin: '34px 0 14px', paddingBottom: 8, borderBottom: '1px solid #27272a' },
  h3: { fontSize: 17, fontWeight: 600, color: '#e4e4e7', margin: '24px 0 10px' },
  p: { fontSize: 15, lineHeight: 1.8, color: '#a1a1aa', margin: '0 0 14px' },
  eq: { display: 'block', padding: '14px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontFamily: 'monospace', fontSize: 15, color: '#c4b5fd', margin: '16px 0', textAlign: 'center' },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14, display: 'block' },
  ctxP: { fontSize: 14, lineHeight: 1.7, color: '#a1a1aa', margin: 0 },
};

// Curve colors: indigo, violet, pink, amber, teal
const CURVE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6'];
const P_LEVELS = [0, 0.25, 0.5, 0.75, 1.0];
const P_LABELS = ['0.00', '0.25', '0.50', '0.75', '1.00'];

function buildVCurve(P, Xs) {
  const V = 1.0;
  const points = [];
  const N = 300;
  for (let i = 0; i <= N; i++) {
    const phi = (-85 + (170 * i) / N) * (Math.PI / 180);
    const cosPhi = Math.cos(phi);
    if (Math.abs(cosPhi) < 0.01) continue;
    const Ia = P === 0 ? Math.abs(Math.sin(phi)) * 0.8 + 0.01 : Math.abs(P / cosPhi);
    if (Ia > 3.0) continue;
    const Q = Ia * Math.sin(phi);
    const Ef = Math.sqrt(Math.pow(1 - Xs * Q, 2) + Math.pow(Xs * P, 2));
    if (Ef < 0.05 || Ef > 3.0) continue;
    const pf = Math.min(1.0, Math.abs(cosPhi));
    points.push({ ef: Ef, ia: Ia, pf, q: Q, phi });
  }
  points.sort((a, b) => a.ef - b.ef);
  return points;
}

function findUnityPFPoint(points) {
  if (!points.length) return null;
  let minIa = Infinity;
  let best = null;
  for (const pt of points) {
    if (pt.ia < minIa) { minIa = pt.ia; best = pt; }
  }
  return best;
}

function computeOperatingPoint(P, If, Xs) {
  const V = 1.0;
  const Ef = If;
  const disc = Ef * Ef - (Xs * P) * (Xs * P);
  if (disc < 0) return null;
  const term = Math.sqrt(disc);
  const Q = (1 - term) / Xs;
  const Ia = Math.sqrt(P * P + Q * Q) / V;
  const pf = Ia > 1e-6 ? Math.min(1.0, P / (V * Ia)) : 1.0;
  const pfSign = Q >= 0 ? 'lag' : 'lead';
  const sinDelta = Xs * P / Ef;
  const delta = Math.abs(sinDelta) <= 1 ? Math.asin(sinDelta) * (180 / Math.PI) : 90;
  return { Ia, Q, pf, pfSign, Ef, delta };
}

// SVG viewport constants
const W = 700;
const H_VCURVE = 280;
const H_INVCURVE = 200;
const H_GAP = 24;
const H_TOTAL = H_VCURVE + H_GAP + H_INVCURVE;
const PAD = { left: 58, right: 20, top: 18, bottom: 36 };

const IF_MIN = 0.0;
const IF_MAX = 2.8;
const IA_MAX = 2.5;
const PF_MAX = 1.05;

function toSvgX(ef) {
  return PAD.left + ((ef - IF_MIN) / (IF_MAX - IF_MIN)) * (W - PAD.left - PAD.right);
}
function toSvgY_V(ia) {
  return PAD.top + (1 - ia / IA_MAX) * (H_VCURVE - PAD.top - PAD.bottom);
}
function toSvgY_INV(pf) {
  const top = H_VCURVE + H_GAP + 14;
  const bot = H_VCURVE + H_GAP + H_INVCURVE - 26;
  return bot - (pf / PF_MAX) * (bot - top);
}

function polylinePoints(pts, xFn, yFn) {
  return pts.map(p => `${xFn(p).toFixed(1)},${yFn(p).toFixed(1)}`).join(' ');
}

function AxisV() {
  const ticks = [0, 0.5, 1.0, 1.5, 2.0, 2.5];
  return (
    <>
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={H_VCURVE - PAD.bottom} stroke="#3f3f46" strokeWidth={1} />
      {ticks.map(v => {
        const y = toSvgY_V(v);
        return (
          <g key={v}>
            <line x1={PAD.left - 4} y1={y} x2={PAD.left} y2={y} stroke="#3f3f46" strokeWidth={1} />
            <text x={PAD.left - 7} y={y + 4} textAnchor="end" fill="#52525b" fontSize={10}>{v.toFixed(1)}</text>
          </g>
        );
      })}
      <line x1={PAD.left} y1={H_VCURVE - PAD.bottom} x2={W - PAD.right} y2={H_VCURVE - PAD.bottom} stroke="#3f3f46" strokeWidth={1} />
      {[0.5, 1.0, 1.5, 2.0, 2.5].map(v => {
        const x = toSvgX(v);
        return (
          <g key={v}>
            <line x1={x} y1={H_VCURVE - PAD.bottom} x2={x} y2={H_VCURVE - PAD.bottom + 4} stroke="#3f3f46" strokeWidth={1} />
          </g>
        );
      })}
      <text x={PAD.left - 36} y={(PAD.top + H_VCURVE - PAD.bottom) / 2} textAnchor="middle" fill="#71717a" fontSize={11} transform={`rotate(-90, ${PAD.left - 36}, ${(PAD.top + H_VCURVE - PAD.bottom) / 2})`}>Ia (pu)</text>
      {ticks.map(v => (
        <line key={v} x1={PAD.left} y1={toSvgY_V(v)} x2={W - PAD.right} y2={toSvgY_V(v)} stroke="#1e1e2e" strokeWidth={1} />
      ))}
    </>
  );
}

function AxisINV() {
  const ticks = [0, 0.25, 0.5, 0.75, 1.0];
  const xTicks = [0.5, 1.0, 1.5, 2.0, 2.5];
  return (
    <>
      <line x1={PAD.left} y1={H_VCURVE + H_GAP + 14} x2={PAD.left} y2={H_VCURVE + H_GAP + H_INVCURVE - 26} stroke="#3f3f46" strokeWidth={1} />
      {ticks.map(v => {
        const y = toSvgY_INV(v);
        return (
          <g key={v}>
            <line x1={PAD.left - 4} y1={y} x2={PAD.left} y2={y} stroke="#3f3f46" strokeWidth={1} />
            <text x={PAD.left - 7} y={y + 4} textAnchor="end" fill="#52525b" fontSize={10}>{v.toFixed(2)}</text>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#1e1e2e" strokeWidth={1} />
          </g>
        );
      })}
      <line x1={PAD.left} y1={H_VCURVE + H_GAP + H_INVCURVE - 26} x2={W - PAD.right} y2={H_VCURVE + H_GAP + H_INVCURVE - 26} stroke="#3f3f46" strokeWidth={1} />
      {xTicks.map(v => {
        const x = toSvgX(v);
        return (
          <g key={v}>
            <line x1={x} y1={H_VCURVE + H_GAP + H_INVCURVE - 26} x2={x} y2={H_VCURVE + H_GAP + H_INVCURVE - 22} stroke="#3f3f46" strokeWidth={1} />
            <text x={x} y={H_VCURVE + H_GAP + H_INVCURVE - 12} textAnchor="middle" fill="#52525b" fontSize={10}>{v.toFixed(1)}</text>
          </g>
        );
      })}
      <text x={(PAD.left + W - PAD.right) / 2} y={H_TOTAL - 2} textAnchor="middle" fill="#71717a" fontSize={11}>Field Current If (pu)</text>
      <text x={PAD.left - 36} y={(H_VCURVE + H_GAP + 14 + H_VCURVE + H_GAP + H_INVCURVE - 26) / 2} textAnchor="middle" fill="#71717a" fontSize={11} transform={`rotate(-90, ${PAD.left - 36}, ${(H_VCURVE + H_GAP + 14 + H_VCURVE + H_GAP + H_INVCURVE - 26) / 2})`}>PF</text>
    </>
  );
}

function SimTab({ P, setP, If, setIf, Xs, setXs }) {
  const curves = useMemo(() => {
    return P_LEVELS.map(p => {
      const pts = buildVCurve(p, Xs);
      const unity = findUnityPFPoint(pts);
      return { p, pts, unity };
    });
  }, [Xs]);

  const opPoint = useMemo(() => computeOperatingPoint(P, If, Xs), [P, If, Xs]);

  const closestCurveIdx = P_LEVELS.reduce((best, pl, i) => Math.abs(pl - P) < Math.abs(P_LEVELS[best] - P) ? i : best, 0);

  const stabilityLimit = useMemo(() => {
    return P_LEVELS.map((p, i) => {
      const efMin = p * Xs;
      if (efMin < 0.05) return null;
      const Q_sl = -1 / Xs;
      const Ia_sl = Math.sqrt(p * p + Q_sl * Q_sl);
      return { ef: efMin, ia: Ia_sl, p, color: CURVE_COLORS[i] };
    }).filter(Boolean);
  }, [Xs]);

  const shadedRegions = useMemo(() => {
    return curves.map(({ pts, unity }) => {
      if (!unity) return { over: [], under: [] };
      const overPts = pts.filter(pt => pt.ef < unity.ef);
      const underPts = pts.filter(pt => pt.ef >= unity.ef);
      return { over: overPts, under: underPts };
    });
  }, [curves]);

  const opX = opPoint ? toSvgX(opPoint.Ef) : null;
  const opYV = opPoint ? toSvgY_V(opPoint.Ia) : null;
  const opYInv = opPoint ? toSvgY_INV(opPoint.pf) : null;

  const qValue = opPoint ? Math.abs(opPoint.Q).toFixed(3) : '\u2014';
  const qSign = opPoint ? (opPoint.Q < 0 ? 'Supplying' : 'Absorbing') : '';
  const qColor = opPoint ? (opPoint.Q < 0 ? '#14b8a6' : '#f97316') : '#e4e4e7';

  const scQ = opPoint ? ((1 - opPoint.Ef) / Xs).toFixed(3) : '\u2014';
  const qMVAR = opPoint ? (Math.abs(opPoint.Q) * 10).toFixed(1) : '\u2014';

  return (
    <div style={S.simBody}>
      <div style={S.svgWrap}>
        <svg width={W} height={H_TOTAL} viewBox={`0 0 ${W} ${H_TOTAL}`} style={{ maxWidth: '100%', height: 'auto' }}>
          <defs>
            <clipPath id="vcClip">
              <rect x={PAD.left} y={0} width={W - PAD.left - PAD.right} height={H_VCURVE - PAD.bottom} />
            </clipPath>
            <clipPath id="invClip">
              <rect x={PAD.left} y={H_VCURVE + H_GAP} width={W - PAD.left - PAD.right} height={H_INVCURVE} />
            </clipPath>
          </defs>

          {/* PLOT 1: V-Curves */}
          <text x={PAD.left + 4} y={PAD.top + 12} fill="#52525b" fontSize={11} fontWeight={600}>V-CURVES  (Ia vs If)</text>

          {/* Color-coded lagging/leading zone backgrounds */}
          <g clipPath="url(#vcClip)">
            {/* Over-excited (leading) background - left side of unity PF */}
            {curves[closestCurveIdx] && curves[closestCurveIdx].unity && (() => {
              const unityX = toSvgX(curves[closestCurveIdx].unity.ef);
              return (
                <>
                  <rect x={PAD.left} y={PAD.top} width={unityX - PAD.left} height={H_VCURVE - PAD.top - PAD.bottom} fill="rgba(20,184,166,0.03)" />
                  <rect x={unityX} y={PAD.top} width={W - PAD.right - unityX} height={H_VCURVE - PAD.top - PAD.bottom} fill="rgba(249,115,22,0.03)" />
                </>
              );
            })()}

            {shadedRegions.map(({ over, under }, i) => (
              <g key={i}>
                {over.length > 1 && (
                  <polyline
                    points={polylinePoints(over, pt => toSvgX(pt.ef), pt => toSvgY_V(pt.ia))}
                    fill="none" stroke="#14b8a6" strokeWidth={1} strokeOpacity={0.15}
                  />
                )}
                {under.length > 1 && (
                  <polyline
                    points={polylinePoints(under, pt => toSvgX(pt.ef), pt => toSvgY_V(pt.ia))}
                    fill="none" stroke="#f97316" strokeWidth={1} strokeOpacity={0.15}
                  />
                )}
              </g>
            ))}

            {/* Region labels with background pills */}
            <rect x={toSvgX(0.35)} y={toSvgY_V(2.2) - 10} width={130} height={16} rx={4} fill="rgba(20,184,166,0.1)" />
            <text x={toSvgX(0.55)} y={toSvgY_V(2.1)} fill="#14b8a6" fontSize={10} fontWeight={600} fontFamily="monospace">{'\u2190'} LEADING PF (Over-excited)</text>

            <rect x={toSvgX(1.45)} y={toSvgY_V(2.2) - 10} width={140} height={16} rx={4} fill="rgba(249,115,22,0.1)" />
            <text x={toSvgX(1.55)} y={toSvgY_V(2.1)} fill="#f97316" fontSize={10} fontWeight={600} fontFamily="monospace">LAGGING PF (Under-excited) {'\u2192'}</text>

            {/* Unity PF vertical line */}
            {curves[closestCurveIdx] && curves[closestCurveIdx].unity && (
              <line
                x1={toSvgX(curves[closestCurveIdx].unity.ef)}
                y1={PAD.top}
                x2={toSvgX(curves[closestCurveIdx].unity.ef)}
                y2={H_VCURVE - PAD.bottom}
                stroke="#ffffff"
                strokeWidth={1}
                strokeDasharray="3,3"
                opacity={0.15}
              />
            )}

            {/* Stability limit dashed curve */}
            {stabilityLimit.length > 1 && (
              <polyline
                points={stabilityLimit.map(sl => `${toSvgX(sl.ef).toFixed(1)},${toSvgY_V(sl.ia).toFixed(1)}`).join(' ')}
                fill="none" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5,4" opacity={0.7}
              />
            )}
            {stabilityLimit.length > 0 && (() => {
              const last = stabilityLimit[stabilityLimit.length - 1];
              return <text x={toSvgX(last.ef) + 4} y={toSvgY_V(last.ia)} fill="#ef4444" fontSize={9} opacity={0.8}>Stability Limit</text>;
            })()}

            {/* Main V-curves */}
            {curves.map(({ pts, unity }, i) => (
              <g key={i}>
                <polyline
                  points={polylinePoints(pts, pt => toSvgX(pt.ef), pt => toSvgY_V(pt.ia))}
                  fill="none"
                  stroke={CURVE_COLORS[i]}
                  strokeWidth={i === closestCurveIdx ? 2.5 : 1.8}
                  opacity={i === closestCurveIdx ? 1 : 0.65}
                />
                {/* Unity PF dot */}
                {unity && (
                  <>
                    <circle
                      cx={toSvgX(unity.ef)}
                      cy={toSvgY_V(unity.ia)}
                      r={4}
                      fill={CURVE_COLORS[i]}
                      stroke="#09090b"
                      strokeWidth={1.5}
                    />
                    {/* Sync condenser annotation for P=0 curve */}
                    {i === 0 && (
                      <>
                        <line x1={toSvgX(unity.ef)} y1={toSvgY_V(unity.ia) + 6} x2={toSvgX(unity.ef) + 40} y2={toSvgY_V(unity.ia) + 20} stroke="#6366f1" strokeWidth={0.8} strokeDasharray="3 2" />
                        <text x={toSvgX(unity.ef) + 42} y={toSvgY_V(unity.ia) + 24} fill="#6366f1" fontSize={8} fontFamily="monospace" fontWeight={600}>Sync Condenser</text>
                        <text x={toSvgX(unity.ef) + 42} y={toSvgY_V(unity.ia) + 34} fill="#52525b" fontSize={7} fontFamily="monospace">min Ia at If={unity.ef.toFixed(2)}</text>
                      </>
                    )}
                  </>
                )}
                {pts.length > 0 && (() => {
                  const last = pts[pts.length - 1];
                  const x = toSvgX(last.ef);
                  const y = toSvgY_V(last.ia);
                  if (x > W - PAD.right - 30) return null;
                  return <text x={x + 4} y={y + 4} fill={CURVE_COLORS[i]} fontSize={10} opacity={0.85}>P={P_LABELS[i]}</text>;
                })()}
              </g>
            ))}

            {/* Unity PF envelope */}
            {(() => {
              const unityPts = curves.map(c => c.unity).filter(Boolean);
              if (unityPts.length < 2) return null;
              return (
                <polyline
                  points={unityPts.map(u => `${toSvgX(u.ef).toFixed(1)},${toSvgY_V(u.ia).toFixed(1)}`).join(' ')}
                  fill="none" stroke="#ffffff" strokeWidth={1} strokeDasharray="4,4" opacity={0.25}
                />
              );
            })()}

            {/* Operating point marker on V-curve plot */}
            {opPoint && opX !== null && opYV !== null && opYV > PAD.top && opYV < H_VCURVE - PAD.bottom && (
              <>
                <line x1={opX} y1={PAD.top} x2={opX} y2={H_VCURVE - PAD.bottom} stroke="#ffffff" strokeWidth={1} strokeDasharray="3,3" opacity={0.3} />
                <circle cx={opX} cy={opYV} r={9} fill="none" stroke={qColor} strokeWidth={1.5} opacity={0.4} />
                <circle cx={opX} cy={opYV} r={7} fill="none" stroke={qColor} strokeWidth={2} />
                <circle cx={opX} cy={opYV} r={3.5} fill={qColor} />
                {/* Operating point label */}
                <text x={opX + 12} y={opYV - 4} fill={qColor} fontSize={9} fontFamily="monospace" fontWeight={600}>
                  {opPoint.pfSign === 'lead' ? 'Leading' : 'Lagging'}
                </text>
              </>
            )}
          </g>
          <AxisV />

          {/* Separator */}
          <line x1={PAD.left} y1={H_VCURVE + H_GAP / 2} x2={W - PAD.right} y2={H_VCURVE + H_GAP / 2} stroke="#27272a" strokeWidth={1} strokeDasharray="4,4" />

          {/* PLOT 2: Inverted V-Curves */}
          <text x={PAD.left + 4} y={H_VCURVE + H_GAP + 12} fill="#52525b" fontSize={11} fontWeight={600}>INVERTED V-CURVES  (PF vs If)</text>

          <g clipPath="url(#invClip)">
            {/* Color zone backgrounds */}
            {curves[closestCurveIdx] && curves[closestCurveIdx].unity && (() => {
              const unityX = toSvgX(curves[closestCurveIdx].unity.ef);
              return (
                <>
                  <rect x={PAD.left} y={H_VCURVE + H_GAP + 14} width={unityX - PAD.left} height={H_INVCURVE - 40} fill="rgba(20,184,166,0.03)" />
                  <rect x={unityX} y={H_VCURVE + H_GAP + 14} width={W - PAD.right - unityX} height={H_INVCURVE - 40} fill="rgba(249,115,22,0.03)" />
                </>
              );
            })()}

            {/* Region labels */}
            <text x={toSvgX(0.55)} y={toSvgY_INV(0.35)} fill="#14b8a6" fontSize={10} fontWeight={600}>{'\u2190'} Leading PF</text>
            <text x={toSvgX(1.6)} y={toSvgY_INV(0.35)} fill="#f97316" fontSize={10} fontWeight={600}>Lagging PF {'\u2192'}</text>

            {/* PF = 1.0 reference line */}
            <line x1={PAD.left} y1={toSvgY_INV(1.0)} x2={W - PAD.right} y2={toSvgY_INV(1.0)} stroke="#ffffff" strokeWidth={1} strokeDasharray="3,3" opacity={0.15} />
            <text x={W - PAD.right - 2} y={toSvgY_INV(1.0) - 4} textAnchor="end" fill="#52525b" fontSize={9} fontFamily="monospace">Unity PF</text>

            {/* Inverted V curves */}
            {curves.map(({ pts, unity }, i) => (
              <g key={i}>
                <polyline
                  points={polylinePoints(pts, pt => toSvgX(pt.ef), pt => toSvgY_INV(pt.pf))}
                  fill="none"
                  stroke={CURVE_COLORS[i]}
                  strokeWidth={i === closestCurveIdx ? 2.5 : 1.8}
                  opacity={i === closestCurveIdx ? 1 : 0.6}
                />
                {unity && (
                  <>
                    <circle
                      cx={toSvgX(unity.ef)}
                      cy={toSvgY_INV(unity.pf)}
                      r={4}
                      fill={CURVE_COLORS[i]}
                      stroke="#09090b"
                      strokeWidth={1.5}
                    />
                    {/* Peak label for highlighted curve */}
                    {i === closestCurveIdx && (
                      <text x={toSvgX(unity.ef) + 8} y={toSvgY_INV(unity.pf) - 6} fill={CURVE_COLORS[i]} fontSize={8} fontFamily="monospace" fontWeight={600}>PF=1.0</text>
                    )}
                  </>
                )}
              </g>
            ))}

            {/* Operating point on PF plot */}
            {opPoint && opX !== null && opYInv !== null && opYInv > H_VCURVE + H_GAP && opYInv < H_VCURVE + H_GAP + H_INVCURVE - 26 && (
              <>
                <line x1={opX} y1={H_VCURVE + H_GAP + 14} x2={opX} y2={H_VCURVE + H_GAP + H_INVCURVE - 26} stroke="#ffffff" strokeWidth={1} strokeDasharray="3,3" opacity={0.3} />
                <circle cx={opX} cy={opYInv} r={7} fill="none" stroke={qColor} strokeWidth={2} />
                <circle cx={opX} cy={opYInv} r={3.5} fill={qColor} />
              </>
            )}
          </g>
          <AxisINV />
        </svg>
      </div>

      {/* Controls */}
      <div style={S.controls}>
        <div style={S.cg}>
          <span style={S.label}>Active Power P</span>
          <input type="range" min={0} max={1.0} step={0.01} value={P} onChange={e => setP(parseFloat(e.target.value))} style={S.slider} />
          <span style={S.val}>{P.toFixed(2)} pu</span>
        </div>
        <div style={S.cg}>
          <span style={S.label}>Field Current If</span>
          <input type="range" min={0.5} max={2.5} step={0.01} value={If} onChange={e => setIf(parseFloat(e.target.value))} style={S.slider} />
          <span style={S.val}>{If.toFixed(2)} pu</span>
        </div>
        <div style={S.cg}>
          <span style={S.label}>Synchronous Reactance Xs</span>
          <input type="range" min={0.8} max={1.5} step={0.01} value={Xs} onChange={e => setXs(parseFloat(e.target.value))} style={S.slider} />
          <span style={S.val}>{Xs.toFixed(2)} pu</span>
        </div>
      </div>

      {/* Operating point badge */}
      {opPoint && (
        <div style={{ display: 'flex', gap: 10, padding: '8px 24px', background: '#0d0d10', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            padding: '6px 14px', borderRadius: 8,
            border: `1.5px solid ${opPoint.Q < 0 ? '#14b8a6' : opPoint.Q > 0.01 ? '#f97316' : '#d4d4d8'}`,
            background: opPoint.Q < 0 ? 'rgba(20,184,166,0.1)' : opPoint.Q > 0.01 ? 'rgba(249,115,22,0.1)' : 'rgba(212,212,216,0.06)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: opPoint.Q < 0 ? '#14b8a6' : opPoint.Q > 0.01 ? '#f97316' : '#d4d4d8',
              boxShadow: `0 0 8px ${opPoint.Q < 0 ? '#14b8a6' : opPoint.Q > 0.01 ? '#f97316' : '#d4d4d8'}66`,
            }} />
            <span style={{
              fontSize: 12, fontWeight: 700, fontFamily: 'monospace',
              color: opPoint.Q < 0 ? '#14b8a6' : opPoint.Q > 0.01 ? '#f97316' : '#d4d4d8',
            }}>
              {opPoint.pfSign === 'lead' ? 'LEADING PF' : opPoint.pf > 0.99 ? 'UNITY PF' : 'LAGGING PF'}
            </span>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: 8,
            border: `1.5px solid ${opPoint.Q < 0 ? '#14b8a6' : '#f97316'}`,
            background: 'rgba(99,102,241,0.06)',
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'monospace', color: '#a1a1aa' }}>
              {opPoint.Q < 0 ? 'OVER-EXCITED' : opPoint.Q > 0.01 ? 'UNDER-EXCITED' : 'NORMAL'}
            </span>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: 8,
            border: '1.5px solid #27272a', background: 'transparent',
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'monospace', color: '#71717a' }}>
              \u03B4 = {opPoint.delta.toFixed(1)}\u00B0
            </span>
          </div>
        </div>
      )}

      {/* Live readouts */}
      <div style={S.results}>
        <div style={S.ri}>
          <span style={S.rl}>Ia (pu)</span>
          <span style={{ ...S.rv, color: '#818cf8' }}>{opPoint ? opPoint.Ia.toFixed(3) : '\u2014'}</span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>Power Factor</span>
          <span style={{ ...S.rv, color: '#c4b5fd' }}>{opPoint ? `${opPoint.pf.toFixed(3)} ${opPoint.pfSign}` : '\u2014'}</span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>Reactive Power Q</span>
          <span style={{ ...S.rv, color: qColor }}>
            {opPoint ? `${qSign} ${qValue} pu` : '\u2014'}
          </span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>Ef (pu)</span>
          <span style={{ ...S.rv, color: '#34d399' }}>{opPoint ? opPoint.Ef.toFixed(3) : '\u2014'}</span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>Power Angle \u03B4</span>
          <span style={{ ...S.rv, color: '#f59e0b' }}>{opPoint ? `${opPoint.delta.toFixed(1)}\u00B0` : '\u2014'}</span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>Region</span>
          <span style={{ ...S.rv, color: qColor, fontSize: 14 }}>
            {opPoint ? (opPoint.Q < 0 ? 'Over-excited' : 'Under-excited') : '\u2014'}
          </span>
        </div>
      </div>

      {/* Info strips */}
      <div style={S.strip}>
        <div style={S.box}>
          <span style={S.boxT}>Synchronous Condenser (P = 0)</span>
          <span style={S.boxV}>
            {`Q = (V\u00B2 \u2212 Ef\u00B7V) / Xs\n`}
            {`   = (1 \u2212 ${opPoint ? opPoint.Ef.toFixed(3) : '?'} \u00D7 1) / ${Xs.toFixed(2)}\n`}
            {`   = ${scQ} pu\n`}
            {P < 0.05 ? '\u2192 Pure VAr compensator mode' : `\u2192 At P=${P.toFixed(2)} pu: combined load + VAr`}
          </span>
        </div>
        <div style={S.box}>
          <span style={S.boxT}>PF Correction (10 MW base)</span>
          <span style={S.boxV}>
            {`Q ${opPoint && opPoint.Q < 0 ? 'supplied' : 'absorbed'}: ${qMVAR} MVAR\n`}
            {`Operating PF: ${opPoint ? opPoint.pf.toFixed(3) : '?'} ${opPoint ? opPoint.pfSign : ''}\n`}
            {opPoint && opPoint.pf < 0.9
              ? `PF < 0.9 \u2014 penalty zone\n  Increase If to improve PF`
              : opPoint && opPoint.pfSign === 'lead'
              ? `Leading PF \u2014 supplying Q to grid`
              : `PF >= 0.9 \u2014 acceptable`}
          </span>
        </div>
        <div style={S.box}>
          <span style={S.boxT}>Legend</span>
          <span style={S.boxV}>
            {P_LEVELS.map((p, i) => {
              const c = CURVE_COLORS[i];
              return `P=${P_LABELS[i]} pu`;
            }).join('  ')}
            {`\ndots = unity PF points\n--- white = unity PF envelope\n--- red = stability limit (\u03B4=90\u00B0)`}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Theory SVG Diagrams ── */

/** Per-phase equivalent circuit of a synchronous machine */
function EquivalentCircuitSVG() {
  const W = 500, H = 130;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: '100%', display: 'block', margin: '18px auto' }}>
      {/* Ef source (circle with ~) */}
      <circle cx={50} cy={55} r={22} fill="none" stroke="#22d3ee" strokeWidth={2} />
      <text x={50} y={51} textAnchor="middle" fill="#22d3ee" fontSize={12} fontFamily="monospace" fontWeight={700}>Ef</text>
      <text x={50} y={67} textAnchor="middle" fill="#22d3ee" fontSize={16} fontFamily="serif">~</text>
      <text x={50} y={28} textAnchor="middle" fill="#71717a" fontSize={10}>+</text>

      {/* Wire from Ef to Ra */}
      <line x1={72} y1={55} x2={120} y2={55} stroke="#a1a1aa" strokeWidth={1.5} />

      {/* Ra resistor (zigzag) */}
      <path d="M120,55 l5,-10 10,20 10,-20 10,20 10,-20 5,10" fill="none" stroke="#fb923c" strokeWidth={2} />
      <text x={150} y={42} textAnchor="middle" fill="#fb923c" fontSize={11} fontFamily="monospace" fontWeight={600}>Ra</text>

      {/* Wire from Ra to jXs */}
      <line x1={170} y1={55} x2={210} y2={55} stroke="#a1a1aa" strokeWidth={1.5} />

      {/* jXs inductor (coils) */}
      {[0,1,2,3].map(i => (
        <path key={i} d={`M${210 + i*20},55 a8,8 0 0 1 20,0`} fill="none" stroke="#facc15" strokeWidth={2} />
      ))}
      <text x={270} y={42} textAnchor="middle" fill="#facc15" fontSize={11} fontFamily="monospace" fontWeight={600}>jXs</text>

      {/* Wire from jXs to terminal */}
      <line x1={290} y1={55} x2={340} y2={55} stroke="#a1a1aa" strokeWidth={1.5} />

      {/* Ia arrow */}
      <defs>
        <marker id="eq-arr-vc" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#34d399" />
        </marker>
      </defs>
      <line x1={90} y1={40} x2={135} y2={40} stroke="#34d399" strokeWidth={1.5} markerEnd="url(#eq-arr-vc)" />
      <text x={112} y={35} textAnchor="middle" fill="#34d399" fontSize={11} fontFamily="monospace" fontWeight={600}>Ia</text>

      {/* Terminal voltage V */}
      <circle cx={350} cy={55} r={4} fill="#d4d4d8" />
      <text x={362} y={50} fill="#d4d4d8" fontSize={12} fontFamily="monospace" fontWeight={700}>V</text>

      {/* Load */}
      <line x1={354} y1={55} x2={400} y2={55} stroke="#a1a1aa" strokeWidth={1.5} />
      <text x={420} y={59} fill="#71717a" fontSize={11} fontFamily="monospace">Grid</text>

      {/* Equation */}
      <text x={W / 2} y={105} textAnchor="middle" fill="#71717a" fontSize={10} fontFamily="monospace">
        Ef = V + Ia(Ra + jXs)  [Generator]
      </text>

      {/* Annotation: field current controls Ef */}
      <line x1={50} y1={80} x2={50} y2={120} stroke="#22d3ee" strokeWidth={0.8} strokeDasharray="3 2" />
      <text x={50} y={122} textAnchor="middle" fill="#22d3ee" fontSize={8} fontFamily="monospace">If controls Ef</text>
    </svg>
  );
}

/** Excitation effect diagram showing what happens as If changes */
function ExcitationEffectSVG() {
  const W = 500, H = 260;
  const cx = 130, cy = 140;
  const scale = 70;

  // Three excitation levels
  const cases = [
    { ef: 0.7, label: 'Under-excited', color: '#f97316', pfLabel: 'Lagging PF', qLabel: 'Absorbs Q', ifLabel: 'Low If' },
    { ef: 1.0, label: 'Normal excitation', color: '#d4d4d8', pfLabel: 'Unity PF', qLabel: 'Q = 0', ifLabel: 'If = normal' },
    { ef: 1.4, label: 'Over-excited', color: '#14b8a6', pfLabel: 'Leading PF', qLabel: 'Supplies Q', ifLabel: 'High If' },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: '100%', display: 'block', margin: '18px auto' }}>
      {/* Title */}
      <text x={W / 2} y={18} textAnchor="middle" fill="#52525b" fontSize={11} fontWeight={600} fontFamily="monospace">EFFECT OF FIELD CURRENT ON ARMATURE CURRENT</text>

      {/* Arrow showing If increasing */}
      <defs>
        <marker id="exc-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#818cf8" />
        </marker>
      </defs>
      <line x1={30} y1={240} x2={W - 30} y2={240} stroke="#818cf8" strokeWidth={2} markerEnd="url(#exc-arr)" />
      <text x={W / 2} y={256} textAnchor="middle" fill="#818cf8" fontSize={10} fontWeight={600} fontFamily="monospace">Field Current If increasing</text>

      {cases.map((c, idx) => {
        const ox = 80 + idx * 160;
        const oy = 120;

        // V phasor (fixed, horizontal)
        const vLen = scale * 0.9;
        // Ia depends on excitation level
        // Under-excited: Ia lags V (larger, lower PF)
        // Unity: Ia aligned with V (smallest)
        // Over-excited: Ia leads V (medium, good PF)
        const phiDeg = idx === 0 ? 35 : idx === 1 ? 0 : -30;
        const phiRad = phiDeg * Math.PI / 180;
        const iaLen = idx === 1 ? scale * 0.45 : scale * 0.55;
        const iax = ox + iaLen * Math.cos(-phiRad);
        const iay = oy - iaLen * Math.sin(-phiRad);

        return (
          <g key={idx}>
            {/* Panel background */}
            <rect x={ox - 65} y={32} width={130} height={190} rx={8} fill="#18181b" stroke={c.color} strokeWidth={1} opacity={0.5} />

            {/* Label */}
            <text x={ox} y={50} textAnchor="middle" fill={c.color} fontSize={10} fontWeight={700} fontFamily="monospace">{c.label}</text>
            <text x={ox} y={62} textAnchor="middle" fill="#52525b" fontSize={8} fontFamily="monospace">{c.ifLabel}</text>

            {/* V phasor */}
            <line x1={ox} y1={oy} x2={ox + vLen - 2} y2={oy} stroke="#d4d4d8" strokeWidth={2} />
            <text x={ox + vLen + 2} y={oy - 4} fill="#d4d4d8" fontSize={9} fontFamily="monospace" fontWeight={700}>V</text>

            {/* Ia phasor */}
            <line x1={ox} y1={oy} x2={iax} y2={iay} stroke="#34d399" strokeWidth={2} />
            <text x={iax + 4} y={iay + 3} fill="#34d399" fontSize={9} fontFamily="monospace" fontWeight={700}>Ia</text>

            {/* Phi arc */}
            {phiDeg !== 0 && (() => {
              const r = 20;
              const sa = 0;
              const ea = phiDeg * Math.PI / 180;
              const sx = ox + r; const sy = oy;
              const ex = ox + r * Math.cos(ea); const ey = oy + r * Math.sin(ea);
              const sweepFlag = phiDeg > 0 ? 1 : 0;
              return (
                <path d={`M ${sx} ${sy} A ${r} ${r} 0 0 ${sweepFlag} ${ex} ${ey}`} fill="none" stroke="#34d399" strokeWidth={1} strokeDasharray="3 2" />
              );
            })()}

            {/* Info labels */}
            <text x={ox} y={oy + 50} textAnchor="middle" fill={c.color} fontSize={9} fontWeight={600} fontFamily="monospace">{c.pfLabel}</text>
            <text x={ox} y={oy + 64} textAnchor="middle" fill="#71717a" fontSize={8} fontFamily="monospace">{c.qLabel}</text>
            <text x={ox} y={oy + 78} textAnchor="middle" fill="#52525b" fontSize={8} fontFamily="monospace">|Ia| = {idx === 1 ? 'minimum' : 'larger'}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** V-Curves family diagram */
function VCurvesFamilySVG() {
  const W = 480, H = 220;
  const pad = { l: 50, r: 20, t: 30, b: 40 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  // Simplified V-curves for illustration
  const curvePts = (p, minIf) => {
    const pts = [];
    for (let i = 0; i <= 100; i++) {
      const ef = 0.3 + 2.2 * i / 100;
      const unityEf = Math.max(0.8, Math.sqrt(1 + p * p));
      const dist = ef - unityEf;
      const ia = p + 0.05 + 0.4 * dist * dist;
      if (ia > 2.2) continue;
      pts.push([pad.l + (ef / 2.5) * cW, pad.t + cH - (ia / 2.3) * cH]);
    }
    return pts;
  };

  const powers = [
    { p: 0, color: '#6366f1', label: 'P=0' },
    { p: 0.3, color: '#8b5cf6', label: 'P=0.3' },
    { p: 0.6, color: '#ec4899', label: 'P=0.6' },
    { p: 0.9, color: '#f59e0b', label: 'P=0.9' },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: '100%', display: 'block', margin: '18px auto' }}>
      {/* Background zones */}
      <rect x={pad.l} y={pad.t} width={cW * 0.42} height={cH} fill="rgba(20,184,166,0.05)" />
      <rect x={pad.l + cW * 0.42} y={pad.t} width={cW * 0.58} height={cH} fill="rgba(249,115,22,0.05)" />

      {/* Zone labels */}
      <text x={pad.l + cW * 0.2} y={pad.t + 16} textAnchor="middle" fill="#14b8a6" fontSize={9} fontWeight={600} fontFamily="monospace">LEADING</text>
      <text x={pad.l + cW * 0.2} y={pad.t + 26} textAnchor="middle" fill="#14b8a6" fontSize={8} fontFamily="monospace">(Over-excited)</text>
      <text x={pad.l + cW * 0.75} y={pad.t + 16} textAnchor="middle" fill="#f97316" fontSize={9} fontWeight={600} fontFamily="monospace">LAGGING</text>
      <text x={pad.l + cW * 0.75} y={pad.t + 26} textAnchor="middle" fill="#f97316" fontSize={8} fontFamily="monospace">(Under-excited)</text>

      {/* Axes */}
      <line x1={pad.l} y1={pad.t + cH} x2={pad.l + cW} y2={pad.t + cH} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + cH} stroke="#3f3f46" strokeWidth={1.5} />
      <text x={pad.l + cW / 2} y={H - 6} textAnchor="middle" fill="#71717a" fontSize={11} fontFamily="monospace">Field Current If (pu)</text>
      <text x={14} y={pad.t + cH / 2} textAnchor="middle" fill="#71717a" fontSize={11} fontFamily="monospace" transform={`rotate(-90,14,${pad.t + cH / 2})`}>Ia (pu)</text>

      {/* V-curves */}
      {powers.map(({ p, color, label }, idx) => {
        const pts = curvePts(p);
        if (pts.length < 2) return null;
        const d = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' ');
        // Find minimum point
        let minY = Infinity, minIdx = 0;
        pts.forEach((pt, i) => { if (pt[1] > minY) return; minY = pt[1]; minIdx = i; });
        return (
          <g key={idx}>
            <path d={d} fill="none" stroke={color} strokeWidth={2} />
            {/* Unity PF dot */}
            <circle cx={pts[minIdx][0]} cy={pts[minIdx][1]} r={4} fill={color} stroke="#09090b" strokeWidth={1.5} />
            {/* Label */}
            <text x={pts[pts.length - 1][0] + 4} y={pts[pts.length - 1][1] + 4} fill={color} fontSize={9} fontFamily="monospace">{label}</text>
          </g>
        );
      })}

      {/* Unity PF envelope */}
      <line x1={pad.l + cW * 0.42} y1={pad.t + cH * 0.95} x2={pad.l + cW * 0.42} y2={pad.t + cH * 0.08} stroke="#ffffff" strokeWidth={1} strokeDasharray="4,3" opacity={0.2} />
      <text x={pad.l + cW * 0.42} y={pad.t + cH + 14} textAnchor="middle" fill="#71717a" fontSize={8} fontFamily="monospace">Unity PF line</text>

      {/* Title */}
      <text x={pad.l + cW / 2} y={pad.t - 10} textAnchor="middle" fill="#52525b" fontSize={11} fontWeight={600} fontFamily="monospace">FAMILY OF V-CURVES</text>
    </svg>
  );
}

/** Inverted V-curves diagram */
function InvertedVCurvesSVG() {
  const W = 480, H = 180;
  const pad = { l: 50, r: 20, t: 30, b: 36 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  const powers = [
    { p: 0, color: '#6366f1', label: 'P=0' },
    { p: 0.3, color: '#8b5cf6', label: 'P=0.3' },
    { p: 0.6, color: '#ec4899', label: 'P=0.6' },
    { p: 0.9, color: '#f59e0b', label: 'P=0.9' },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: '100%', display: 'block', margin: '18px auto' }}>
      {/* PF=1.0 reference */}
      <line x1={pad.l} y1={pad.t} x2={pad.l + cW} y2={pad.t} stroke="#ffffff" strokeWidth={1} strokeDasharray="3,3" opacity={0.15} />
      <text x={pad.l + cW + 2} y={pad.t + 4} fill="#52525b" fontSize={8} fontFamily="monospace">PF=1.0</text>

      {/* Axes */}
      <line x1={pad.l} y1={pad.t + cH} x2={pad.l + cW} y2={pad.t + cH} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + cH} stroke="#3f3f46" strokeWidth={1.5} />
      <text x={pad.l + cW / 2} y={H - 4} textAnchor="middle" fill="#71717a" fontSize={11} fontFamily="monospace">Field Current If (pu)</text>
      <text x={14} y={pad.t + cH / 2} textAnchor="middle" fill="#71717a" fontSize={11} fontFamily="monospace" transform={`rotate(-90,14,${pad.t + cH / 2})`}>PF</text>

      {/* Inverted V-curves */}
      {powers.map(({ p, color, label }, idx) => {
        const pts = [];
        for (let i = 0; i <= 100; i++) {
          const ef = 0.3 + 2.2 * i / 100;
          const unityEf = Math.max(0.8, Math.sqrt(1 + p * p));
          const dist = ef - unityEf;
          const pf = Math.max(0.1, 1.0 - 0.7 * dist * dist);
          pts.push([pad.l + (ef / 2.5) * cW, pad.t + (1 - pf) * cH]);
        }
        const d = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' ');
        // Peak point
        let minY = Infinity, peakIdx = 0;
        pts.forEach((pt, i) => { if (pt[1] < minY) { minY = pt[1]; peakIdx = i; } });
        return (
          <g key={idx}>
            <path d={d} fill="none" stroke={color} strokeWidth={2} />
            <circle cx={pts[peakIdx][0]} cy={pts[peakIdx][1]} r={4} fill={color} stroke="#09090b" strokeWidth={1.5} />
            {/* Unity PF peak label */}
            {idx === 2 && (
              <>
                <line x1={pts[peakIdx][0]} y1={pts[peakIdx][1] - 6} x2={pts[peakIdx][0] + 30} y2={pad.t - 4} stroke={color} strokeWidth={0.8} strokeDasharray="3 2" />
                <text x={pts[peakIdx][0] + 32} y={pad.t} fill={color} fontSize={8} fontFamily="monospace" fontWeight={600}>Unity PF peak</text>
              </>
            )}
            <text x={pts[pts.length - 1][0] + 4} y={pts[pts.length - 1][1] + 4} fill={color} fontSize={9} fontFamily="monospace">{label}</text>
          </g>
        );
      })}

      {/* Title */}
      <text x={pad.l + cW / 2} y={pad.t - 10} textAnchor="middle" fill="#52525b" fontSize={11} fontWeight={600} fontFamily="monospace">INVERTED V-CURVES (PF vs If)</text>
    </svg>
  );
}

function TheoryTab() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>Equivalent Circuit</h2>
      <p style={S.p}>
        The V-curve behavior is understood from the per-phase equivalent circuit. The field current If
        directly controls the excitation EMF Ef. Changing If changes Ef, which in turn changes the
        reactive power Q and armature current Ia \u2014 while the active power P (set by the prime mover)
        remains constant.
      </p>

      <EquivalentCircuitSVG />

      <h2 style={S.h2}>What are V-Curves?</h2>
      <p style={S.p}>
        V-Curves were discovered by William M. Mordey in 1893. They describe how the armature current of
        a synchronous machine varies with field current (excitation) when the active load is held constant.
        When plotted, the curves form a distinctive V-shape \u2014 hence the name.
      </p>
      <p style={S.p}>
        The key insight is that the machine must supply the same active power P regardless of excitation.
        But changing field current shifts <em>how much reactive power</em> the machine handles.
        Too little or too much excitation both force a larger armature current to carry the same P \u2014 this is
        exactly why the current has a minimum at unity power factor.
      </p>

      <VCurvesFamilySVG />

      <div style={S.ctx}>
        <span style={S.ctxT}>Inverted V-Curves</span>
        <p style={S.ctxP}>
          When power factor (instead of Ia) is plotted on the Y-axis against the same field current, the
          curves form inverted V-shapes \u2014 each peaking at PF = 1.0 at the unity-PF operating point.
          This makes it easy to see the excitation setting that gives best power factor for each load level.
        </p>
      </div>

      <InvertedVCurvesSVG />

      <h3 style={S.h3}>Effect of Changing Field Current</h3>
      <p style={S.p}>
        The three phasor sketches below show how the armature current Ia changes direction and magnitude
        as the field current is varied from low (under-excited) through normal (unity PF) to high
        (over-excited). Notice that Ia is at its minimum when it is in phase with V (unity PF).
      </p>

      <ExcitationEffectSVG />

      <h2 style={S.h2}>Why the V-Shape? Mathematical Derivation</h2>
      <h3 style={S.h3}>Phasor Decomposition</h3>
      <p style={S.p}>
        At constant active power P (with terminal voltage V = 1 pu), the active component of armature
        current is fixed:
      </p>
      <code style={S.eq}>Ia \u00B7 cos(\u03C6) = P / V = P  (since V = 1 pu)</code>
      <p style={S.p}>
        The reactive component, however, depends on excitation:
      </p>
      <code style={S.eq}>Ia \u00B7 sin(\u03C6) = Q / V = Q</code>
      <p style={S.p}>
        The total armature current magnitude is therefore:
      </p>
      <code style={S.eq}>Ia = \u221A[(P/V)\u00B2 + (Q/V)\u00B2]</code>
      <p style={S.p}>
        This is minimized when Q = 0 (unity power factor), giving:
      </p>
      <code style={S.eq}>Ia_min = P / V</code>
      <p style={S.p}>
        Any deviation from unity PF \u2014 absorbing or supplying reactive power \u2014 increases Ia. This
        is the geometric reason for the V-shape: you are adding a reactive component to a fixed
        active component, and the vector sum can only be larger.
      </p>

      <h3 style={S.h3}>Key Equations</h3>
      <code style={S.eq}>Ia = \u221A[(P/V)\u00B2 + (Q/V)\u00B2]</code>
      <code style={S.eq}>Q = (V\u00B2 \u2212 V \u00B7 Ef \u00B7 cos(\u03B4)) / Xs</code>
      <code style={S.eq}>Ef = \u221A[(V \u2212 Xs \u00B7 Q / V)\u00B2 + (Xs \u00B7 P / V)\u00B2]</code>
      <p style={S.p}>
        In per-unit with V = 1, these simplify to:
      </p>
      <code style={S.eq}>Ef = \u221A[(1 \u2212 Xs \u00B7 Q)\u00B2 + (Xs \u00B7 P)\u00B2]</code>

      <h2 style={S.h2}>Over-excited vs Under-excited Operation</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '14px 0' }}>
        <div style={{ ...S.box, borderColor: '#14b8a6', flex: '1 1 220px' }}>
          <span style={{ ...S.boxT, color: '#14b8a6' }}>Over-excited (Ef &gt; V correction)</span>
          <span style={S.boxV}>
            {`\u2022 If > unity-PF value\n\u2022 Ia leads terminal voltage V\n\u2022 Machine supplies reactive power (Q < 0)\n\u2022 Acts like a capacitor bank\n\u2022 Helps nearby inductive loads\n\u2022 Improves sending-end voltage`}
          </span>
        </div>
        <div style={{ ...S.box, borderColor: '#f97316', flex: '1 1 220px' }}>
          <span style={{ ...S.boxT, color: '#f97316' }}>Under-excited (Ef &lt; V correction)</span>
          <span style={S.boxV}>
            {`\u2022 If < unity-PF value\n\u2022 Ia lags terminal voltage V\n\u2022 Machine absorbs reactive power (Q > 0)\n\u2022 Acts like an inductor\n\u2022 Reduces voltage at terminals\n\u2022 Risk of loss of synchronism`}
          </span>
        </div>
      </div>
      <p style={S.p}>
        The critical physical fact: in an over-excited synchronous motor, the rotor's strong magnetic field
        "pushes" flux into the stator, effectively injecting reactive power into the network \u2014 just as a
        capacitor would. This is entirely controllable by adjusting the DC field current.
      </p>

      <h2 style={S.h2}>Synchronous Condenser</h2>
      <p style={S.p}>
        A synchronous condenser is a synchronous motor running at no mechanical load (P \u2248 0), used
        purely for reactive power control. It can supply or absorb reactive power continuously and
        smoothly by varying field current.
      </p>
      <code style={S.eq}>Q = (V\u00B2 \u2212 V \u00B7 Ef) / Xs  \u2190  synchronous condenser reactive output</code>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Continuously variable:</strong> unlike fixed capacitor banks, Q can be adjusted in real-time.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Bidirectional:</strong> can supply (over-excited) or absorb (under-excited) reactive power from the same machine.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Provides inertia:</strong> the spinning rotor adds rotational inertia to the grid, improving frequency stability \u2014 something static capacitors cannot do.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Short-circuit contribution:</strong> maintains fault current levels needed for protection system coordination.</li>
      </ul>

      <h2 style={S.h2}>Stability Limit</h2>
      <p style={S.p}>
        The dashed red curve on the simulation marks the <em>stability limit</em>. For a synchronous motor,
        the power delivered is:
      </p>
      <code style={S.eq}>P = (V \u00B7 Ef / Xs) \u00B7 sin(\u03B4)</code>
      <p style={S.p}>
        This is maximized at \u03B4 = 90\u00B0. If the field current is reduced below the value that gives
        Ef = P \u00B7 Xs / V, the machine cannot deliver the required power at any stable angle \u2014 it
        loses synchronism (pulls out of sync) and stalls. In practice, a stability margin of
        \u03B4 \u2264 60\u201370\u00B0 is maintained.
      </p>
      <code style={S.eq}>Ef_min = P \u00B7 Xs  (stability boundary, V = 1 pu)</code>

      <h2 style={S.h2}>Indian Industrial Context</h2>
      <div style={S.ctx}>
        <span style={S.ctxT}>Cement Industry \u2014 Synchronous Motors for Ball Mills</span>
        <p style={S.ctxP}>
          ACC, UltraTech, and Ambuja cement plants across India operate large synchronous motors (2000\u20135000 HP,
          typically at 6.6 kV or 11 kV) for ball mills, raw mills, and cement mills. These are run at 0.9 PF
          leading \u2014 simultaneously providing mechanical work AND supplying reactive power to the plant network.
          This eliminates the need for separate capacitor banks and reduces the apparent power drawn from the
          DISCOM.
        </p>
      </div>
      <div style={S.ctx}>
        <span style={S.ctxT}>DISCOM PF Tariff Economics</span>
        <p style={S.ctxP}>
          Most Indian state DISCOMs penalize industrial consumers for operating below 0.9 PF, typically charging
          0.5% extra per 0.01 below 0.9. For a cement plant drawing 5 MW at 0.75 PF: the plant pays for
          5 / 0.75 = 6.67 MVA of apparent power instead of 5 / 0.9 = 5.56 MVA. Combined with PF penalty
          clauses, the annual financial impact can reach Rs 50\u201380 lakhs. A synchronous motor running at 0.9
          leading PF eliminates both the penalty and reduces line losses throughout the plant network.
        </p>
      </div>
      <div style={S.ctx}>
        <span style={S.ctxT}>Powergrid India \u2014 Grid-Scale Synchronous Condensers</span>
        <p style={S.ctxP}>
          As thermal generators retire, Powergrid Corporation of India is installing large synchronous condensers
          at 400 kV substations to maintain voltage stability and short-circuit levels. Each unit is rated
          200\u2013400 MVAR with a \u00B1300 MVAR continuous control range. Unlike static VAr compensators (SVC) or
          STATCOMs, they contribute fault current and add grid inertia \u2014 critical for a power system with
          rapidly growing non-synchronous renewables (wind and solar). Projects are underway at multiple
          regional grid substations under the National Transmission Plan.
        </p>
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}

export default function VCurvesInvertedV() {
  const [tab, setTab] = useState('sim');
  const [P, setP] = useState(0.6);
  const [If, setIf] = useState(1.2);
  const [Xs, setXs] = useState(1.0);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'sim')} onClick={() => setTab('sim')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>
      {tab === 'sim'
        ? <SimTab P={P} setP={setP} If={If} setIf={setIf} Xs={Xs} setXs={setXs} />
        : <TheoryTab />
      }
    </div>
  );
}
