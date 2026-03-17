import React, { useState, useMemo, useEffect, useCallback } from 'react';

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

const E_MAX = 280, IF_KNEE = 1.2, IF_RES = 0.03, N_RATED = 1500, RA = 0.5, RSE = 0.2;
const FIELD_V = 220;

function occ(If, N) {
  return (N / N_RATED) * E_MAX * (If + IF_RES) / (If + IF_RES + IF_KNEE);
}

function occSlope0(N) {
  return (N / N_RATED) * E_MAX * IF_KNEE / ((IF_RES + IF_KNEE) * (IF_RES + IF_KNEE));
}

function findNoLoad(N, Rf) {
  if (Rf >= occSlope0(N)) return 0;
  let Vt = occ(0, N);
  for (let i = 0; i < 60; i++) {
    const nxt = occ(Vt / Rf, N);
    if (Math.abs(nxt - Vt) < 0.05) return nxt;
    Vt = nxt;
  }
  return Vt;
}

function extSepExcited(N, Rf, maxIL) {
  const If_sep = FIELD_V / Math.max(Rf, 0.1);
  const Eg = occ(If_sep, N);
  const pts = [];
  for (let IL = 0; IL <= maxIL; IL += 0.5) {
    const Vt = Eg - IL * RA;
    if (Vt < 0) break;
    pts.push({ il: IL, vt: Vt });
  }
  return pts;
}

function extShunt(N, Rf, maxIL) {
  let Vt = findNoLoad(N, Rf);
  const pts = [];
  for (let IL = 0; IL <= maxIL; IL += 0.5) {
    for (let iter = 0; iter < 40; iter++) {
      const If = Math.max(Vt / Rf, 0);
      const Ia = IL + If;
      const Eg = occ(If, N);
      const Vn = Eg - Ia * RA;
      if (Math.abs(Vn - Vt) < 0.05) { Vt = Math.max(Vn, 0); break; }
      Vt = Math.max(Vn, 0);
    }
    if (Vt < 1) break;
    pts.push({ il: IL, vt: Vt });
  }
  return pts;
}

function extSeries(N, maxIL) {
  const pts = [];
  for (let IL = 0.5; IL <= maxIL; IL += 0.5) {
    const Eg = occ(IL, N);
    const Vt = Eg - IL * (RA + RSE);
    if (Vt < 0) break;
    pts.push({ il: IL, vt: Vt });
  }
  return pts;
}

/* Small circuit schematic overlay showing generator config */
function GenCircuit({ extType }) {
  const w = 160, h = 80;
  return (
    <g transform="translate(10, 10)">
      <rect x={0} y={0} width={w} height={h} rx={6} fill="rgba(15,15,19,0.92)" stroke="#27272a" strokeWidth={0.8} />
      <text x={w/2} y={12} textAnchor="middle" fill="#52525b" fontSize={7} fontWeight={600}>
        {extType === 'sep' ? 'SEPARATELY EXCITED' : extType === 'shunt' ? 'SHUNT GENERATOR' : extType === 'series' ? 'SERIES GENERATOR' : 'GENERATOR TYPES'}
      </text>
      {/* Generator */}
      <circle cx={30} cy={44} r={10} fill="none" stroke="#f59e0b" strokeWidth={0.8} />
      <text x={30} y={47} textAnchor="middle" fill="#f59e0b" fontSize={7}>G</text>
      {/* Top wire */}
      <line x1={30} y1={34} x2={30} y2={22} stroke="#52525b" strokeWidth={0.6} />
      <line x1={30} y1={22} x2={140} y2={22} stroke="#52525b" strokeWidth={0.6} />
      {/* Ra */}
      <rect x={55} y={18} width={20} height={8} rx={2} fill="none" stroke="#ef4444" strokeWidth={0.6} />
      <text x={65} y={16} textAnchor="middle" fill="#ef4444" fontSize={5}>R<tspan dy={1} fontSize={4}>a</tspan></text>
      {/* Load */}
      <rect x={120} y={30} width={20} height={24} rx={3} fill="none" stroke="#818cf8" strokeWidth={0.8} />
      <text x={130} y={45} textAnchor="middle" fill="#818cf8" fontSize={6}>Load</text>
      <line x1={130} y1={22} x2={130} y2={30} stroke="#52525b" strokeWidth={0.6} />
      <line x1={130} y1={54} x2={130} y2={66} stroke="#52525b" strokeWidth={0.6} />
      {/* Bottom */}
      <line x1={30} y1={54} x2={30} y2={66} stroke="#52525b" strokeWidth={0.6} />
      <line x1={30} y1={66} x2={140} y2={66} stroke="#52525b" strokeWidth={0.6} />
      {/* Field winding based on type */}
      {(extType === 'shunt' || extType === 'all') && (
        <g>
          <line x1={95} y1={22} x2={95} y2={32} stroke="#22c55e" strokeWidth={0.5} />
          <rect x={91} y={32} width={8} height={16} rx={1} fill="none" stroke="#22c55e" strokeWidth={0.5} />
          <line x1={95} y1={48} x2={95} y2={66} stroke="#22c55e" strokeWidth={0.5} />
          <text x={88} y={42} textAnchor="end" fill="#22c55e" fontSize={4}>R<tspan dy={1} fontSize={3}>f</tspan></text>
        </g>
      )}
      {/* Current arrow */}
      <polygon points="80,22 74,19 74,25" fill="#22d3ee" />
      <text x={78} y={16} fill="#22d3ee" fontSize={5}>I<tspan dy={1} fontSize={4}>L</tspan></text>
    </g>
  );
}

function Diagram({ N, Rf, buildEgs, extType }) {
  const PX = 70, PY = 40, PW = 380, PH = 250;
  const IF_MAX = 3.5, EG_MAX = 260;
  const sx = v => PX + (v / IF_MAX) * PW;
  const sy = v => PY + PH - (Math.min(v, EG_MAX) / EG_MAX) * PH;

  const occPath = useMemo(() => {
    let d = '';
    for (let i = 0; i <= IF_MAX * 100; i++) {
      const If = i / 100;
      const Eg = occ(If, N);
      d += (i === 0 ? 'M' : 'L') + `${sx(If).toFixed(1)},${sy(Eg).toFixed(1)}`;
    }
    return d;
  }, [N]);

  const rfCrit = occSlope0(N);
  const rfLineEnd = Math.min(EG_MAX / Rf, IF_MAX);
  const rfCritEnd = Math.min(EG_MAX / rfCrit, IF_MAX);

  const cobwebPath = useMemo(() => {
    if (buildEgs.length < 1) return '';
    let d = `M ${sx(0).toFixed(1)},${sy(buildEgs[0]).toFixed(1)}`;
    for (let i = 1; i < buildEgs.length; i++) {
      const prevEg = buildEgs[i - 1];
      const newIf = prevEg / Rf;
      const newEg = buildEgs[i];
      d += ` L ${sx(newIf).toFixed(1)},${sy(prevEg).toFixed(1)}`;
      d += ` L ${sx(newIf).toFixed(1)},${sy(newEg).toFixed(1)}`;
    }
    return d;
  }, [buildEgs, Rf]);

  const steadyV = findNoLoad(N, Rf);
  const steadyIf = steadyV / Rf;

  const EX = 535, EY = PY, EW = 380, EH = PH;
  const IL_MAX = 50, VT_MAX = EG_MAX;
  const esx = v => EX + (v / IL_MAX) * EW;
  const esy = v => EY + EH - (Math.min(v, VT_MAX) / VT_MAX) * EH;

  const extCurves = useMemo(() => ({
    sep: extSepExcited(N, Rf, IL_MAX),
    shunt: extShunt(N, Rf, IL_MAX),
    series: extSeries(N, IL_MAX),
  }), [N, Rf]);

  const toExtPath = pts => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${esx(p.il).toFixed(1)},${esy(p.vt).toFixed(1)}`).join('');

  const yTicks = [0, 50, 100, 150, 200, 250];
  const xTicks1 = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5];
  const xTicks2 = [0, 10, 20, 30, 40, 50];

  /* Find OCC regions for annotation */
  const kneeIf = IF_KNEE * 0.8;
  const kneeEg = occ(kneeIf, N);

  return (
    <svg viewBox="0 0 960 360" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      {/* ── Left: OCC + Voltage Build-up ── */}
      <text x={PX + PW / 2} y={20} textAnchor="middle" fill="#71717a" fontSize={12} fontWeight={600}>
        Open Circuit Characteristic (OCC) {'\u2014'} N = {N} rpm
      </text>

      {yTicks.map(v => <line key={`yg${v}`} x1={PX} y1={sy(v)} x2={PX + PW} y2={sy(v)} stroke="#1e1e2e" strokeWidth={1} />)}
      {xTicks1.map(v => <line key={`xg${v}`} x1={sx(v)} y1={PY} x2={sx(v)} y2={PY + PH} stroke="#1e1e2e" strokeWidth={1} />)}
      <line x1={PX} y1={PY} x2={PX} y2={PY + PH} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={PX} y1={PY + PH} x2={PX + PW} y2={PY + PH} stroke="#3f3f46" strokeWidth={1.5} />
      {yTicks.map(v => <text key={`yl${v}`} x={PX - 6} y={sy(v) + 4} textAnchor="end" fill="#52525b" fontSize={9}>{v}</text>)}
      {xTicks1.map(v => <text key={`xl${v}`} x={sx(v)} y={PY + PH + 14} textAnchor="middle" fill="#52525b" fontSize={8}>{v}</text>)}
      <text x={PX + PW / 2} y={PY + PH + 30} textAnchor="middle" fill="#71717a" fontSize={10}>Field Current I<tspan dy={3} fontSize={8}>f</tspan><tspan dy={-3}> (A)</tspan></text>
      <text x={18} y={PY + PH / 2} textAnchor="middle" fill="#71717a" fontSize={10} transform={`rotate(-90, 18, ${PY + PH / 2})`}>EMF E<tspan dy={3} fontSize={8}>g</tspan><tspan dy={-3}> (V)</tspan></text>

      {/* OCC region annotations */}
      {/* Linear region */}
      <rect x={PX} y={sy(kneeEg)} width={sx(kneeIf) - PX} height={PY + PH - sy(kneeEg)} rx={4} fill="rgba(34,197,94,0.04)" />
      <text x={PX + 8} y={sy(kneeEg * 0.5)} fill="#22c55e" fontSize={7} opacity={0.6}>Linear</text>
      <text x={PX + 8} y={sy(kneeEg * 0.5) + 10} fill="#22c55e" fontSize={7} opacity={0.6}>Region</text>

      {/* Knee region */}
      <rect x={sx(kneeIf)} y={sy(occ(kneeIf * 1.5, N))} width={sx(kneeIf * 1.5) - sx(kneeIf)} height={sy(kneeEg) - sy(occ(kneeIf * 1.5, N))} rx={4} fill="rgba(245,158,11,0.04)" />
      <text x={sx(kneeIf * 1.2)} y={sy(occ(kneeIf * 1.3, N)) - 6} textAnchor="middle" fill="#f59e0b" fontSize={7} opacity={0.6}>Knee</text>

      {/* Saturation region */}
      <rect x={sx(kneeIf * 1.5)} y={PY} width={PX + PW - sx(kneeIf * 1.5)} height={PH} rx={4} fill="rgba(239,68,68,0.03)" />
      <text x={sx(kneeIf * 1.5) + 8} y={PY + 14} fill="#ef4444" fontSize={7} opacity={0.5}>Saturation Region</text>

      {/* OCC curve */}
      <path d={occPath} fill="none" stroke="#3b82f6" strokeWidth={2.5} />
      <text x={sx(IF_MAX) - 30} y={sy(occ(IF_MAX, N)) - 8} fill="#3b82f6" fontSize={10} fontWeight={600}>OCC</text>

      {/* Rf line (current setting) */}
      <line x1={sx(0)} y1={sy(0)} x2={sx(rfLineEnd)} y2={sy(Rf * rfLineEnd)} stroke="#ef4444" strokeWidth={1.8} strokeDasharray="6 3" />
      <text x={sx(rfLineEnd) + 4} y={sy(Rf * rfLineEnd) - 4} fill="#ef4444" fontSize={9} fontWeight={500}>R<tspan dy={2} fontSize={7}>f</tspan><tspan dy={-2}> = {Rf}{'\u03A9'}</tspan></text>

      {/* Critical Rf line */}
      <line x1={sx(0)} y1={sy(0)} x2={sx(rfCritEnd)} y2={sy(rfCrit * rfCritEnd)} stroke="#52525b" strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
      <text x={sx(rfCritEnd) + 4} y={sy(rfCrit * rfCritEnd) + 4} fill="#52525b" fontSize={8} opacity={0.6}>R<tspan dy={2} fontSize={6}>f,crit</tspan><tspan dy={-2}> = {rfCrit.toFixed(0)}{'\u03A9'}</tspan></text>

      {/* Steady-state operating point */}
      {Rf < rfCrit && (
        <g>
          <circle cx={sx(steadyIf)} cy={sy(steadyV)} r={5} fill="none" stroke="#22c55e" strokeWidth={2} />
          <circle cx={sx(steadyIf)} cy={sy(steadyV)} r={2.5} fill="#22c55e" />
          <text x={sx(steadyIf) + 10} y={sy(steadyV) - 6} fill="#22c55e" fontSize={9} fontWeight={600}>{steadyV.toFixed(0)}V</text>
          {/* Dashed lines to axes */}
          <line x1={sx(steadyIf)} y1={sy(steadyV)} x2={sx(steadyIf)} y2={PY + PH} stroke="#22c55e" strokeWidth={0.5} strokeDasharray="3 2" opacity={0.4} />
          <line x1={sx(steadyIf)} y1={sy(steadyV)} x2={PX} y2={sy(steadyV)} stroke="#22c55e" strokeWidth={0.5} strokeDasharray="3 2" opacity={0.4} />
        </g>
      )}

      {/* Cobweb/staircase build-up */}
      {cobwebPath && <path d={cobwebPath} fill="none" stroke="#f59e0b" strokeWidth={1.8} opacity={0.85} />}

      {/* Build-up step dots */}
      {buildEgs.map((eg, i) => {
        if (i === 0) return <circle key={i} cx={sx(0)} cy={sy(eg)} r={3} fill="#f59e0b" />;
        const prevEg = buildEgs[i - 1];
        const newIf = prevEg / Rf;
        return <circle key={i} cx={sx(newIf)} cy={sy(eg)} r={3} fill="#f59e0b" />;
      })}

      {/* Build-up label */}
      {buildEgs.length > 1 && (
        <rect x={PX + 5} y={PY + 3} width={200} height={18} rx={4} fill="rgba(245,158,11,0.1)" stroke="#f59e0b" strokeWidth={0.5}>
        </rect>
      )}
      {buildEgs.length > 1 && (
        <text x={PX + 10} y={PY + 15} fill="#f59e0b" fontSize={10} fontWeight={500}>
          Build-up: Step {buildEgs.length - 1} {'\u2192'} {buildEgs[buildEgs.length - 1].toFixed(1)}V
        </text>
      )}

      {/* Divider */}
      <line x1={510} y1={PY - 5} x2={510} y2={PY + PH + 20} stroke="#1e1e2e" strokeWidth={1} />

      {/* ── Right: External Characteristics ── */}
      <text x={EX + EW / 2} y={20} textAnchor="middle" fill="#71717a" fontSize={12} fontWeight={600}>
        External Characteristics (V<tspan dy={3} fontSize={9}>t</tspan><tspan dy={-3}> vs I</tspan><tspan dy={3} fontSize={9}>L</tspan><tspan dy={-3}>)</tspan>
      </text>

      {yTicks.map(v => <line key={`eyg${v}`} x1={EX} y1={esy(v)} x2={EX + EW} y2={esy(v)} stroke="#1e1e2e" strokeWidth={1} />)}
      {xTicks2.map(v => <line key={`exg${v}`} x1={esx(v)} y1={EY} x2={esx(v)} y2={EY + EH} stroke="#1e1e2e" strokeWidth={1} />)}
      <line x1={EX} y1={EY} x2={EX} y2={EY + EH} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={EX} y1={EY + EH} x2={EX + EW} y2={EY + EH} stroke="#3f3f46" strokeWidth={1.5} />
      {yTicks.map(v => <text key={`eyl${v}`} x={EX - 6} y={esy(v) + 4} textAnchor="end" fill="#52525b" fontSize={9}>{v}</text>)}
      {xTicks2.map(v => <text key={`exl${v}`} x={esx(v)} y={EY + EH + 14} textAnchor="middle" fill="#52525b" fontSize={9}>{v}</text>)}
      <text x={EX + EW / 2} y={EY + EH + 30} textAnchor="middle" fill="#71717a" fontSize={10}>Load Current I<tspan dy={3} fontSize={8}>L</tspan><tspan dy={-3}> (A)</tspan></text>
      <text x={EX - 35} y={EY + EH / 2} textAnchor="middle" fill="#71717a" fontSize={10} transform={`rotate(-90, ${EX - 35}, ${EY + EH / 2})`}>V<tspan dy={3} fontSize={8}>t</tspan><tspan dy={-3}> (V)</tspan></text>

      {/* Region labels on external char */}
      {(extType === 'all' || extType === 'shunt') && extCurves.shunt.length > 10 && (
        <g>
          {/* Voltage collapse annotation */}
          {(() => {
            const lastPt = extCurves.shunt[extCurves.shunt.length - 1];
            if (!lastPt) return null;
            return (
              <g>
                <rect x={esx(lastPt.il) - 50} y={esy(lastPt.vt) - 18} width={65} height={16} rx={4} fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth={0.5} />
                <text x={esx(lastPt.il) - 18} y={esy(lastPt.vt) - 7} textAnchor="middle" fill="#ef4444" fontSize={7} fontWeight={500}>Voltage Collapse</text>
              </g>
            );
          })()}
        </g>
      )}

      {/* Series generator peak annotation */}
      {(extType === 'all' || extType === 'series') && extCurves.series.length > 5 && (
        <g>
          {(() => {
            let maxVt = 0, maxIdx = 0;
            extCurves.series.forEach((p, i) => { if (p.vt > maxVt) { maxVt = p.vt; maxIdx = i; } });
            const peak = extCurves.series[maxIdx];
            if (!peak) return null;
            return (
              <g>
                <line x1={esx(peak.il)} y1={esy(peak.vt)} x2={esx(peak.il)} y2={esy(peak.vt) - 20} stroke="#f59e0b" strokeWidth={0.8} strokeDasharray="2 2" />
                <text x={esx(peak.il)} y={esy(peak.vt) - 22} textAnchor="middle" fill="#f59e0b" fontSize={7} fontWeight={500}>Peak {peak.vt.toFixed(0)}V</text>
              </g>
            );
          })()}
        </g>
      )}

      {/* Separately excited */}
      {(extType === 'all' || extType === 'sep') && extCurves.sep.length > 1 && (
        <g>
          <path d={toExtPath(extCurves.sep)} fill="none" stroke="#22c55e" strokeWidth={2} />
          <text x={esx(extCurves.sep[Math.min(6, extCurves.sep.length - 1)]?.il || 0) + 4} y={esy(extCurves.sep[Math.min(6, extCurves.sep.length - 1)]?.vt || 0) - 6} fill="#22c55e" fontSize={9}>Sep. Excited</text>
        </g>
      )}

      {/* Shunt */}
      {(extType === 'all' || extType === 'shunt') && extCurves.shunt.length > 1 && (
        <g>
          <path d={toExtPath(extCurves.shunt)} fill="none" stroke="#3b82f6" strokeWidth={2} />
          {extCurves.shunt.length > 8 && (
            <text x={esx(extCurves.shunt[Math.min(12, extCurves.shunt.length - 1)]?.il || 0) + 4} y={esy(extCurves.shunt[Math.min(12, extCurves.shunt.length - 1)]?.vt || 0) + 14} fill="#3b82f6" fontSize={9}>Shunt</text>
          )}
        </g>
      )}

      {/* Series */}
      {(extType === 'all' || extType === 'series') && extCurves.series.length > 1 && (
        <g>
          <path d={toExtPath(extCurves.series)} fill="none" stroke="#f59e0b" strokeWidth={2} />
          {extCurves.series.length > 5 && (
            <text x={esx(extCurves.series[Math.min(10, extCurves.series.length - 1)]?.il || 0) + 4} y={esy(extCurves.series[Math.min(10, extCurves.series.length - 1)]?.vt || 0) - 6} fill="#f59e0b" fontSize={9}>Series</text>
          )}
        </g>
      )}

      {/* Legend */}
      <line x1={EX + 10} y1={EY + EH + 42} x2={EX + 30} y2={EY + EH + 42} stroke="#22c55e" strokeWidth={2} />
      <text x={EX + 35} y={EY + EH + 45} fill="#71717a" fontSize={9}>Sep. Excited</text>
      <line x1={EX + 130} y1={EY + EH + 42} x2={EX + 150} y2={EY + EH + 42} stroke="#3b82f6" strokeWidth={2} />
      <text x={EX + 155} y={EY + EH + 45} fill="#71717a" fontSize={9}>Shunt</text>
      <line x1={EX + 210} y1={EY + EH + 42} x2={EX + 230} y2={EY + EH + 42} stroke="#f59e0b" strokeWidth={2} />
      <text x={EX + 235} y={EY + EH + 45} fill="#71717a" fontSize={9}>Series</text>

      {/* Generator circuit schematic */}
      <GenCircuit extType={extType} />
    </svg>
  );
}

/* SVG: Generator circuit diagrams for Theory tab */
function TheoryGeneratorCircuits() {
  return (
    <svg viewBox="0 0 760 270" style={S.svgDiagram}>
      <text x={380} y={22} textAnchor="middle" fill="#71717a" fontSize={13} fontWeight={600}>DC Generator Connection Configurations</text>

      {/* ── Separately Excited ── */}
      <text x={130} y={48} textAnchor="middle" fill="#22c55e" fontSize={11} fontWeight={600}>Separately Excited</text>
      {/* Generator */}
      <circle cx={55} cy={140} r={18} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={55} y={144} textAnchor="middle" fill="#f59e0b" fontSize={10} fontWeight={600}>G</text>
      {/* Shaft */}
      <line x1={37} y1={140} x2={20} y2={140} stroke="#a1a1aa" strokeWidth={1.5} />
      <text x={12} y={144} textAnchor="end" fill="#71717a" fontSize={7}>{'\u03C9'}</text>
      {/* Top wire */}
      <line x1={55} y1={122} x2={55} y2={72} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={55} y1={72} x2={230} y2={72} stroke="#a1a1aa" strokeWidth={1} />
      {/* Ra */}
      <rect x={100} y={64} width={30} height={16} rx={3} fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1} />
      <text x={115} y={76} textAnchor="middle" fill="#ef4444" fontSize={8}>R<tspan dy={2} fontSize={6}>a</tspan></text>
      {/* Ia arrow */}
      <polygon points="85,72 77,69 77,75" fill="#22d3ee" />
      <text x={85} y={66} fill="#22d3ee" fontSize={8}>I<tspan dy={2} fontSize={6}>a</tspan></text>
      {/* Load */}
      <rect x={195} y={100} width={30} height={50} rx={4} fill="rgba(99,102,241,0.06)" stroke="#818cf8" strokeWidth={1} />
      <text x={210} y={128} textAnchor="middle" fill="#818cf8" fontSize={8}>Load</text>
      <line x1={210} y1={72} x2={210} y2={100} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={210} y1={150} x2={210} y2={200} stroke="#a1a1aa" strokeWidth={1} />
      {/* Vt label */}
      <text x={225} y={90} fill="#22c55e" fontSize={8}>V<tspan dy={2} fontSize={6}>t</tspan></text>
      <line x1={220} y1={95} x2={220} y2={145} stroke="#22c55e" strokeWidth={0.8} strokeDasharray="3 2" />
      {/* Bottom */}
      <line x1={55} y1={158} x2={55} y2={200} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={55} y1={200} x2={230} y2={200} stroke="#a1a1aa" strokeWidth={1} />
      {/* Separate field source */}
      <circle cx={170} cy={215} r={10} fill="none" stroke="#6366f1" strokeWidth={1} />
      <text x={170} y={218} textAnchor="middle" fill="#6366f1" fontSize={7}>V<tspan dy={2} fontSize={5}>f</tspan></text>
      <text x={170} y={232} textAnchor="middle" fill="#52525b" fontSize={7}>Separate source</text>
      {/* Field winding connected to separate source */}
      <line x1={160} y1={215} x2={55} y2={215} stroke="#6366f1" strokeWidth={0.8} strokeDasharray="4 2" />
      <text x={100} y={212} textAnchor="middle" fill="#6366f1" fontSize={6}>I<tspan dy={1} fontSize={5}>f</tspan><tspan dy={-1}> (independent)</tspan></text>

      {/* ── Shunt Generator ── */}
      <text x={420} y={48} textAnchor="middle" fill="#3b82f6" fontSize={11} fontWeight={600}>Shunt Generator</text>
      {/* Generator */}
      <circle cx={330} cy={140} r={18} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={330} y={144} textAnchor="middle" fill="#f59e0b" fontSize={10} fontWeight={600}>G</text>
      <line x1={312} y1={140} x2={295} y2={140} stroke="#a1a1aa" strokeWidth={1.5} />
      {/* Top wire */}
      <line x1={330} y1={122} x2={330} y2={72} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={330} y1={72} x2={510} y2={72} stroke="#a1a1aa" strokeWidth={1} />
      {/* Ra */}
      <rect x={375} y={64} width={30} height={16} rx={3} fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1} />
      <text x={390} y={76} textAnchor="middle" fill="#ef4444" fontSize={8}>R<tspan dy={2} fontSize={6}>a</tspan></text>
      {/* Field winding in parallel with output */}
      <line x1={440} y1={72} x2={440} y2={92} stroke="#3b82f6" strokeWidth={1} />
      <rect x={434} y={92} width={12} height={40} rx={3} fill="rgba(59,130,246,0.08)" stroke="#3b82f6" strokeWidth={1} />
      <text x={430} y={115} textAnchor="end" fill="#3b82f6" fontSize={7}>R<tspan dy={1} fontSize={5}>f</tspan></text>
      <line x1={440} y1={132} x2={440} y2={200} stroke="#3b82f6" strokeWidth={1} />
      {/* If arrow */}
      <polygon points="440,96 437,89 443,89" fill="#3b82f6" />
      <text x={450} y={96} fill="#3b82f6" fontSize={6}>I<tspan dy={1} fontSize={5}>f</tspan></text>
      {/* Load */}
      <rect x={475} y={100} width={30} height={50} rx={4} fill="rgba(99,102,241,0.06)" stroke="#818cf8" strokeWidth={1} />
      <text x={490} y={128} textAnchor="middle" fill="#818cf8" fontSize={8}>Load</text>
      <line x1={490} y1={72} x2={490} y2={100} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={490} y1={150} x2={490} y2={200} stroke="#a1a1aa" strokeWidth={1} />
      {/* Bottom */}
      <line x1={330} y1={158} x2={330} y2={200} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={330} y1={200} x2={510} y2={200} stroke="#a1a1aa" strokeWidth={1} />
      <text x={420} y={220} textAnchor="middle" fill="#52525b" fontSize={8}>I<tspan dy={2} fontSize={6}>f</tspan><tspan dy={-2}> = V</tspan><tspan dy={2} fontSize={6}>t</tspan><tspan dy={-2}>/R</tspan><tspan dy={2} fontSize={6}>f</tspan><tspan dy={-2}> (self-excited)</tspan></text>

      {/* ── Series Generator ── */}
      <text x={650} y={48} textAnchor="middle" fill="#f59e0b" fontSize={11} fontWeight={600}>Series Generator</text>
      {/* Generator */}
      <circle cx={575} cy={140} r={18} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={575} y={144} textAnchor="middle" fill="#f59e0b" fontSize={10} fontWeight={600}>G</text>
      <line x1={557} y1={140} x2={540} y2={140} stroke="#a1a1aa" strokeWidth={1.5} />
      {/* Top wire */}
      <line x1={575} y1={122} x2={575} y2={72} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={575} y1={72} x2={740} y2={72} stroke="#a1a1aa" strokeWidth={1} />
      {/* Series field */}
      <rect x={610} y={64} width={30} height={16} rx={3} fill="rgba(245,158,11,0.08)" stroke="#f59e0b" strokeWidth={1} />
      <text x={625} y={76} textAnchor="middle" fill="#f59e0b" fontSize={7}>R<tspan dy={2} fontSize={5}>se</tspan></text>
      {/* Ra */}
      <rect x={655} y={64} width={30} height={16} rx={3} fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1} />
      <text x={670} y={76} textAnchor="middle" fill="#ef4444" fontSize={8}>R<tspan dy={2} fontSize={6}>a</tspan></text>
      {/* Load */}
      <rect x={710} y={100} width={30} height={50} rx={4} fill="rgba(99,102,241,0.06)" stroke="#818cf8" strokeWidth={1} />
      <text x={725} y={128} textAnchor="middle" fill="#818cf8" fontSize={8}>Load</text>
      <line x1={725} y1={72} x2={725} y2={100} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={725} y1={150} x2={725} y2={200} stroke="#a1a1aa" strokeWidth={1} />
      {/* Current arrow */}
      <polygon points="600,72 592,69 592,75" fill="#22d3ee" />
      <text x={600} y={66} fill="#22d3ee" fontSize={7}>I<tspan dy={2} fontSize={5}>a</tspan><tspan dy={-2}> = I</tspan><tspan dy={2} fontSize={5}>L</tspan><tspan dy={-2}> = I</tspan><tspan dy={2} fontSize={5}>f</tspan></text>
      {/* Bottom */}
      <line x1={575} y1={158} x2={575} y2={200} stroke="#a1a1aa" strokeWidth={1} />
      <line x1={575} y1={200} x2={740} y2={200} stroke="#a1a1aa" strokeWidth={1} />
      <text x={650} y={220} textAnchor="middle" fill="#52525b" fontSize={8}>{'\u03C6'} {'\u221D'} I<tspan dy={2} fontSize={6}>L</tspan><tspan dy={-2}> (all current through field)</tspan></text>
    </svg>
  );
}

/* SVG: Annotated OCC curve sketch for Theory tab */
function TheoryOCCDiagram() {
  const px = 80, py = 35, pw = 300, ph = 190;
  const sx = v => px + (v / 3.5) * pw;
  const sy = v => py + ph - (v / 280) * ph;

  /* Generate OCC points at rated speed */
  const occPts = [];
  for (let i = 0; i <= 350; i++) {
    const If = i / 100;
    const Eg = E_MAX * (If + IF_RES) / (If + IF_RES + IF_KNEE);
    occPts.push({ x: sx(If), y: sy(Eg) });
  }
  const occD = occPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('');

  const kneeIf = IF_KNEE * 0.8;

  return (
    <svg viewBox="0 0 760 280" style={S.svgDiagram}>
      <text x={380} y={22} textAnchor="middle" fill="#71717a" fontSize={13} fontWeight={600}>Open Circuit Characteristic (OCC) {'\u2014'} Annotated</text>

      {/* Grid */}
      {[0, 50, 100, 150, 200, 250].map(e => <line key={e} x1={px} y1={sy(e)} x2={px + pw} y2={sy(e)} stroke="#1e1e2e" strokeWidth={1} />)}
      {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map(i => <line key={i} x1={sx(i)} y1={py} x2={sx(i)} y2={py + ph} stroke="#1e1e2e" strokeWidth={1} />)}

      {/* Axes */}
      <line x1={px} y1={py} x2={px} y2={py + ph} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={px} y1={py + ph} x2={px + pw} y2={py + ph} stroke="#3f3f46" strokeWidth={1.5} />
      <text x={px + pw / 2} y={py + ph + 20} textAnchor="middle" fill="#71717a" fontSize={10}>I<tspan dy={3} fontSize={8}>f</tspan><tspan dy={-3}> (A)</tspan></text>
      <text x={28} y={py + ph / 2} textAnchor="middle" fill="#71717a" fontSize={10} transform={`rotate(-90, 28, ${py + ph / 2})`}>E<tspan dy={3} fontSize={8}>g</tspan><tspan dy={-3}> (V)</tspan></text>

      {/* Region shadings */}
      <rect x={px} y={sy(E_MAX * kneeIf / (kneeIf + IF_KNEE))} width={sx(kneeIf) - px} height={py + ph - sy(E_MAX * kneeIf / (kneeIf + IF_KNEE))} rx={4} fill="rgba(34,197,94,0.05)" />
      <text x={px + 10} y={py + ph - 20} fill="#22c55e" fontSize={9} fontWeight={500}>Linear Region</text>

      <rect x={sx(kneeIf)} y={py} width={sx(kneeIf * 1.8) - sx(kneeIf)} height={ph} rx={4} fill="rgba(245,158,11,0.05)" />
      <text x={sx(kneeIf * 1.2)} y={py + 14} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight={500}>Knee</text>

      <rect x={sx(kneeIf * 1.8)} y={py} width={px + pw - sx(kneeIf * 1.8)} height={ph} rx={4} fill="rgba(239,68,68,0.04)" />
      <text x={(sx(kneeIf * 1.8) + px + pw) / 2} y={py + 14} textAnchor="middle" fill="#ef4444" fontSize={9} fontWeight={500}>Saturation</text>

      {/* OCC curve */}
      <path d={occD} fill="none" stroke="#3b82f6" strokeWidth={2.5} />

      {/* Air-gap line (tangent from origin) */}
      <line x1={sx(0)} y1={sy(0)} x2={sx(2.5)} y2={sy(2.5 * occSlope0(N_RATED))} stroke="#52525b" strokeWidth={1.5} strokeDasharray="6 3" />
      <text x={sx(2)} y={sy(2 * occSlope0(N_RATED)) - 8} fill="#52525b" fontSize={8}>Air-gap line (slope = R<tspan dy={2} fontSize={6}>f,crit</tspan><tspan dy={-2}>)</tspan></text>

      {/* Residual EMF */}
      <circle cx={sx(0)} cy={sy(occ(0, N_RATED))} r={4} fill="#f59e0b" stroke="#f59e0b" strokeWidth={1} />
      <text x={sx(0) + 8} y={sy(occ(0, N_RATED)) - 2} fill="#f59e0b" fontSize={9} fontWeight={500}>E<tspan dy={2} fontSize={7}>res</tspan></text>

      {/* ── Right: Annotations ── */}
      <line x1={420} y1={25} x2={420} y2={260} stroke="#1e1e2e" strokeWidth={1} />

      <text x={440} y={50} fill="#e4e4e7" fontSize={12} fontWeight={600}>OCC Regions</text>

      <rect x={440} y={62} width={300} height={50} rx={8} fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth={0.8} />
      <text x={450} y={78} fill="#22c55e" fontSize={10} fontWeight={600}>Linear Region (Unsaturated)</text>
      <text x={450} y={93} fill="#a1a1aa" fontSize={9}>E<tspan dy={2} fontSize={7}>g</tspan><tspan dy={-2}> {'\u221D'} I</tspan><tspan dy={2} fontSize={7}>f</tspan><tspan dy={-2}> (iron not saturated, flux {'\u221D'} current)</tspan></text>
      <text x={450} y={106} fill="#a1a1aa" fontSize={9}>Slope = air-gap line slope = R<tspan dy={2} fontSize={7}>f,crit</tspan></text>

      <rect x={440} y={122} width={300} height={40} rx={8} fill="rgba(245,158,11,0.06)" stroke="#f59e0b" strokeWidth={0.8} />
      <text x={450} y={138} fill="#f59e0b" fontSize={10} fontWeight={600}>Knee Region (Transition)</text>
      <text x={450} y={153} fill="#a1a1aa" fontSize={9}>Iron begins saturating, E<tspan dy={2} fontSize={7}>g</tspan><tspan dy={-2}> increase slows</tspan></text>

      <rect x={440} y={172} width={300} height={40} rx={8} fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth={0.8} />
      <text x={450} y={188} fill="#ef4444" fontSize={10} fontWeight={600}>Saturation Region</text>
      <text x={450} y={203} fill="#a1a1aa" fontSize={9}>Large I<tspan dy={2} fontSize={7}>f</tspan><tspan dy={-2}> increase {'\u2192'} small E</tspan><tspan dy={2} fontSize={7}>g</tspan><tspan dy={-2}> increase (diminishing returns)</tspan></text>

      <rect x={440} y={222} width={300} height={36} rx={8} fill="rgba(245,158,11,0.06)" stroke="#f59e0b" strokeWidth={0.8} />
      <text x={450} y={238} fill="#f59e0b" fontSize={10} fontWeight={600}>Residual EMF (E<tspan dy={2} fontSize={8}>res</tspan><tspan dy={-2}>)</tspan></text>
      <text x={450} y={252} fill="#a1a1aa" fontSize={9}>At I<tspan dy={2} fontSize={7}>f</tspan><tspan dy={-2}>=0: small EMF from remanent magnetism in iron</tspan></text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>DC Generator {'\u2014'} Characteristics & Self-Excitation</h2>
      <p style={S.p}>
        A DC generator converts mechanical energy into electrical energy by rotating armature
        conductors in a magnetic field. The generated EMF depends on speed, flux, and machine
        constants. The key challenge is establishing the magnetic field itself {'\u2014'} which in a
        self-excited generator comes from the generator's own output.
      </p>

      {/* SVG: Generator circuit diagrams */}
      <TheoryGeneratorCircuits />

      <h3 style={S.h3}>Generated EMF Equation</h3>
      <div style={S.eqBox}>
        <span style={{ ...S.ctxT, color: '#818cf8', fontSize: 12 }}>EMF Equation Derivation</span>
        <div style={S.eqStep}>E<sub>g</sub> = (P {'\u00D7'} {'\u03C6'} {'\u00D7'} N {'\u00D7'} Z) / (60 {'\u00D7'} A)</div>
        <div style={S.eqStep}>where P = poles, {'\u03C6'} = flux/pole, N = speed, Z = conductors, A = parallel paths</div>
        <div style={S.eqResult}>E<sub>g</sub> = K{'\u03C6'} {'\u00D7'} {'\u03C9'}    (simplified form)</div>
      </div>
      <p style={S.p}>
        The generated EMF is proportional to both the speed and the flux per pole. The
        Open Circuit Characteristic (OCC) plots E<sub>g</sub> versus field current I<sub>f</sub> at constant
        speed. Its shape follows the magnetization curve of the machine's iron core {'\u2014'} initially
        linear (unsaturated), then curving at the knee point (saturation onset), and finally
        nearly flat (deep saturation).
      </p>

      <h3 style={S.h3}>Open Circuit Characteristic (OCC)</h3>

      {/* SVG: Annotated OCC diagram */}
      <TheoryOCCDiagram />

      <p style={S.p}>
        The OCC is obtained experimentally by driving the generator at constant speed with
        no load connected, and measuring the terminal voltage as the field current is varied.
        It is also called the <strong style={{ color: '#e4e4e7' }}>magnetization curve</strong>
        or <strong style={{ color: '#e4e4e7' }}>no-load saturation curve</strong>. At I<sub>f</sub> = 0,
        a small residual EMF exists due to remanent magnetism in the iron core.
      </p>
      <p style={S.p}>
        The OCC scales linearly with speed: at half the rated speed, every point on the curve
        is halved. This property is used to find the OCC at any speed from a single measured curve.
      </p>

      <h3 style={S.h3}>Voltage Build-Up in a Self-Excited Shunt Generator</h3>
      <p style={S.p}>
        The voltage build-up process in a self-excited shunt generator is a remarkable example
        of positive feedback converging to a stable equilibrium:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>Step 1:</strong> Residual magnetism in the poles produces a small EMF (typically 2{'\u2013'}5% of rated voltage) even with zero field current.</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>Step 2:</strong> This residual EMF drives a small current through the field winding: I<sub>f</sub> = E<sub>res</sub> / R<sub>f</sub>.</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>Step 3:</strong> The field current strengthens the magnetic field, producing a larger EMF (read from the OCC at the new I<sub>f</sub>).</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>Step 4:</strong> The larger EMF drives more field current, which produces even more EMF...</li>
        <li style={S.li}><strong style={{ color: '#22c55e' }}>Convergence:</strong> The process continues in a staircase pattern until the OCC and the field resistance line (E<sub>g</sub> = R<sub>f</sub> {'\u00D7'} I<sub>f</sub>) intersect. At this point, the EMF exactly supports the field current needed to produce it {'\u2014'} a stable equilibrium.</li>
      </ul>
      <div style={S.ctx}>
        <span style={S.ctxT}>The Cobweb Diagram</span>
        <p style={S.ctxP}>
          The voltage build-up is visualized as a cobweb or staircase on the OCC plot. Starting
          from residual EMF, alternate horizontal steps (to the R<sub>f</sub> line) and vertical steps (to
          the OCC) trace the convergence path. The final operating voltage is at the intersection
          of the OCC and R<sub>f</sub> line. Use the "Animate Build-up" button in the simulation to watch
          this process unfold step by step.
        </p>
      </div>

      <h3 style={S.h3}>Conditions for Self-Excitation</h3>
      <p style={S.p}>
        For voltage to build up successfully, all four conditions must be satisfied simultaneously:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>1. Residual magnetism must exist</strong> {'\u2014'} The iron core must retain some magnetism from previous operation. If the machine is completely demagnetized, an external DC source must be briefly applied to the field winding ("flashing the field").</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>2. Correct field polarity</strong> {'\u2014'} The field winding must be connected so that the current it carries reinforces (not opposes) the residual flux. If connected in reverse, the field current will demagnetize the core.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>3. R<sub>f</sub> {'<'} R<sub>f,critical</sub></strong> {'\u2014'} The field resistance must be less than the critical value, which equals the slope of the OCC's air-gap line (the linear extrapolation of the unsaturated region through the origin). If R<sub>f</sub> is too high, the R<sub>f</sub> line doesn't intersect the OCC at any significant voltage.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>4. Speed {'\u2265'} N<sub>min</sub></strong> {'\u2014'} The speed must be high enough that the OCC (which scales with speed) has an initial slope greater than R<sub>f</sub>. The minimum speed is: N<sub>min</sub> = N<sub>rated</sub> {'\u00D7'} (R<sub>f</sub> / R<sub>f,critical at rated speed</sub>).</li>
      </ul>

      <h3 style={S.h3}>Critical Field Resistance</h3>
      <div style={S.eqBox}>
        <span style={{ ...S.ctxT, color: '#818cf8', fontSize: 12 }}>Finding R<sub>f,critical</sub></span>
        <div style={S.eqStep}>R<sub>f,critical</sub> = dE<sub>g</sub>/dI<sub>f</sub> |<sub>I<sub>f</sub>{'\u2192'}0</sub></div>
        <div style={S.eqStep}>= slope of tangent to OCC from origin</div>
        <div style={S.eqResult}>{'\u2248'} slope of air-gap line (initial linear portion of OCC)</div>
      </div>
      <p style={S.p}>
        The critical field resistance is the maximum R<sub>f</sub> at which the generator can build up
        voltage. It equals the slope of the tangent drawn from the origin to the OCC curve.
        In practice, this is approximately the slope of the air-gap line (the initial linear
        part of the OCC). The critical R<sub>f</sub> increases proportionally with speed.
      </p>

      <h3 style={S.h3}>External Characteristics (V<sub>t</sub> vs I<sub>L</sub>)</h3>
      <p style={S.p}>
        The external characteristic shows how the terminal voltage varies with load current.
        It differs significantly between generator types:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#22c55e' }}>Separately Excited:</strong> Field current is fixed by an independent source, so the flux is constant and V<sub>t</sub> falls linearly with armature voltage drop (V<sub>t</sub> = E<sub>g</sub> − I<sub>a</sub>R<sub>a</sub>).</li>
        <li style={S.li}><strong style={{ color: '#3b82f6' }}>Shunt:</strong> V<sub>t</sub> = E<sub>g</sub>(I<sub>f</sub>) {'\u2212'} I<sub>a</sub>{'\u00B7'}R<sub>a</sub> where I<sub>f</sub> = V<sub>t</sub>/R<sub>f</sub>. As V<sub>t</sub> drops under load, field current also drops, reducing E<sub>g</sub> further {'\u2014'} a steeper decline than the separately excited case.</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>Series:</strong> I<sub>f</sub> = I<sub>a</sub> = I<sub>L</sub> (field in series). At light load, E<sub>g</sub> is small (little flux) and so is V<sub>t</sub>. As load increases, flux builds and V<sub>t</sub> rises {'\u2014'} until the I<sub>a</sub>R<sub>a</sub> drop overcomes the EMF increase. The curve rises then falls.</li>
      </ul>

      <h3 style={S.h3}>Voltage Regulation</h3>
      <div style={S.eq}>Voltage Regulation = (V<sub>no-load</sub> {'\u2212'} V<sub>full-load</sub>) / V<sub>full-load</sub> {'\u00D7'} 100%</div>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Generator Type</th>
            <th style={S.th}>Typical Regulation</th>
            <th style={S.th}>V<sub>t</sub> Behavior Under Load</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Separately Excited', '5\u201310%', 'Slight linear drop'],
            ['Shunt', '10\u201315% (then collapses)', 'Drops, then collapses at high load'],
            ['Series', 'Negative at light load', 'Rises then falls'],
            ['Compound (cumulative)', '0\u20135% (designed flat)', 'Nearly constant (compensated)'],
          ].map(([t, r, b]) => (
            <tr key={t}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{t}</td>
              <td style={S.td}>{r}</td>
              <td style={S.td}>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Chapman, S.J. {'\u2014'} <em>Electric Machinery Fundamentals</em>, 5th Edition, McGraw-Hill</li>
        <li style={S.li}>Fitzgerald, Kingsley, Umans {'\u2014'} <em>Electric Machinery</em>, 7th Edition</li>
        <li style={S.li}>Theraja, B.L. {'\u2014'} <em>A Textbook of Electrical Technology Vol. II</em>, S. Chand</li>
        <li style={S.li}>IS 4722 {'\u2014'} Indian Standard for Rotating Electrical Machines</li>
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

export default function DCGeneratorCharacteristics() {
  const [tab, setTab] = useState('simulate');
  const [N, setN] = useState(1500);
  const [Rf, setRf] = useState(100);
  const [extType, setExtType] = useState('all');
  const [buildEgs, setBuildEgs] = useState([]);

  const rfCrit = occSlope0(N);
  const canBuild = Rf < rfCrit;
  const steadyV = findNoLoad(N, Rf);
  const steadyIf = steadyV / Rf;
  const nMin = Rf / (occSlope0(N_RATED)) * N_RATED;

  useEffect(() => { setBuildEgs([]); }, [N, Rf]);

  useEffect(() => {
    if (!canBuild || buildEgs.length === 0) return;
    const last = buildEgs[buildEgs.length - 1];
    const newIf = last / Rf;
    const newEg = occ(newIf, N);
    if (Math.abs(newEg - last) < 0.3 || buildEgs.length > 25) return;

        const timer = setTimeout(() => {
          setBuildEgs(prev => [...prev, newEg]);
        }, 400);
    return () => clearTimeout(timer);
  }, [buildEgs, Rf, N, canBuild]);

  const startBuildUp = useCallback(() => {
    if (!canBuild) return;
    const Eg0 = occ(0, N);
    setBuildEgs([Eg0]);
  }, [N, canBuild]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram N={N} Rf={Rf} buildEgs={buildEgs} extType={extType} />
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Steady-State V</span>
              <span style={{ ...S.rv, color: canBuild ? '#22c55e' : '#ef4444' }}>{canBuild ? `${steadyV.toFixed(1)} V` : 'No build-up'}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>I<sub>f</sub> (steady)</span>
              <span style={{ ...S.rv, color: '#93c5fd' }}>{canBuild ? `${steadyIf.toFixed(2)} A` : '\u2014'}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>R<sub>f,crit</sub></span>
              <span style={{ ...S.rv, color: '#c4b5fd' }}>{rfCrit.toFixed(0)} {'\u03A9'}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>N<sub>min</sub></span>
              <span style={{ ...S.rv, color: N >= nMin ? '#22c55e' : '#ef4444' }}>{nMin.toFixed(0)} rpm</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Self-Excitation</span>
              <span style={{ ...S.rv, color: canBuild && N >= nMin ? '#22c55e' : '#ef4444' }}>
                {canBuild && N >= nMin ? 'CAN build up' : 'CANNOT build up'}
              </span>
            </div>
            {buildEgs.length > 1 && (
              <div style={S.ri}>
                <span style={S.rl}>Build-up Step</span>
                <span style={{ ...S.rv, color: '#f59e0b' }}>{buildEgs.length - 1} {'\u2192'} {buildEgs[buildEgs.length - 1].toFixed(1)}V</span>
              </div>
            )}
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Speed (rpm)</span>
              <input type="range" min={500} max={2000} step={50} value={N} onChange={e => setN(+e.target.value)} style={S.slider} />
              <span style={S.val}>{N}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>R<sub>f</sub> ({'\u03A9'})</span>
              <input type="range" min={30} max={350} step={5} value={Rf} onChange={e => setRf(+e.target.value)} style={S.slider} />
              <span style={S.val}>{Rf} {'\u03A9'}</span>
            </div>
            <div style={S.cg}>
              <button style={btnS(buildEgs.length > 0, '#f59e0b')} onClick={startBuildUp}>
                {buildEgs.length > 0 ? 'Restart Build-up' : 'Animate Build-up'}
              </button>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Ext. Char.</span>
              <button style={btnS(extType === 'all', '#6366f1')} onClick={() => setExtType('all')}>All</button>
              <button style={btnS(extType === 'sep', '#22c55e')} onClick={() => setExtType('sep')}>Sep. Exc.</button>
              <button style={btnS(extType === 'shunt', '#3b82f6')} onClick={() => setExtType('shunt')}>Shunt</button>
              <button style={btnS(extType === 'series', '#f59e0b')} onClick={() => setExtType('series')}>Series</button>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
