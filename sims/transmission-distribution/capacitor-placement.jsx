import React, { useState, useMemo } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '16px 16px 8px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 8 },
  label: { fontSize: 12, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 100, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 40, textAlign: 'right' },
  results: { display: 'flex', gap: 28, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  btn: (a) => ({ padding: '4px 10px', borderRadius: 6, border: a ? '1px solid #6366f1' : '1px solid #27272a', background: a ? 'rgba(99,102,241,0.15)' : 'transparent', color: a ? '#a5b4fc' : '#71717a', fontSize: 11, cursor: 'pointer', fontWeight: a ? 600 : 400, transition: 'all 0.15s', outline: 'none' }),
  bg: { display: 'flex', gap: 3 },
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

const FLEN = 10;
const NLOADS = 5;
const SLEN = 2;
const R_KM = 0.5;
const X_KM = 0.4;
const VB = 11;
const STEP = 0.5;
const NSTEPS = FLEN / STEP;
const SPS = SLEN / STEP;
const CAPS = [50, 100, 150, 200, 300];
const LPOS = [2, 4, 6, 8, 10];

function compute(loadP, pf, capQ, capX) {
  const tanPhi = Math.tan(Math.acos(Math.min(pf, 0.999)));
  const qPerLoad = loadP * tanPhi;
  const totalP = NLOADS * loadP;
  const totalQ = NLOADS * qPerLoad;

  const vB = [VB], vA = [VB];
  let lossB = 0, lossA = 0;
  const qFB = [], qFA = [];

  for (let i = 0; i < NSTEPS; i++) {
    const pos = i * STEP;
    let pFlow = 0, qFlB = 0, qFlA = 0;
    for (const lp of LPOS) {
      if (lp > pos) { pFlow += loadP; qFlB += qPerLoad; qFlA += qPerLoad; }
    }
    if (capX > pos) qFlA -= capQ;

    const R = R_KM * STEP, X = X_KM * STEP;

    const sB = Math.sqrt(pFlow * pFlow + qFlB * qFlB);
    const iB = sB / (Math.sqrt(3) * VB);
    lossB += 3 * iB * iB * R / 1000;
    const dvB = (pFlow * R + qFlB * X) / (10 * VB * VB);
    vB.push(vB[i] * (1 - dvB / 100));
    qFB.push(qFlB);

    const sA = Math.sqrt(pFlow * pFlow + qFlA * qFlA);
    const iA = sA / (Math.sqrt(3) * VB);
    lossA += 3 * iA * iA * R / 1000;
    const dvA = (pFlow * R + qFlA * X) / (10 * VB * VB);
    vA.push(vA[i] * (1 - dvA / 100));
    qFA.push(qFlA);
  }

  const pfB = totalP > 0 ? totalP / Math.sqrt(totalP * totalP + totalQ * totalQ) : 1;
  const qNet = totalQ - capQ;
  const pfA = totalP > 0 ? totalP / Math.sqrt(totalP * totalP + qNet * qNet) : 1;
  const vRise = (capQ * X_KM * capX) / (10 * VB * VB);
  const optPos = (2 / 3) * FLEN;
  const lossRed = lossB > 0 ? ((lossB - lossA) / lossB) * 100 : 0;
  const vImp = ((vA[NSTEPS] - vB[NSTEPS]) / VB) * 100;

  return { vB, vA, lossB, lossA, pfB, pfA, vRise, optPos, lossRed, vImp, totalP, totalQ, qNet, qFB, qFA };
}

const W = 900, H = 420;
const VPx1 = 100, VPx2 = 810, VPy1 = 30, VPy2 = 150;
const FY = 268, FX1 = 100, FX2 = 810;
const kmToX = (km) => FX1 + (km / FLEN) * (FX2 - FX1);

function Diagram({ data, capPos, capQ, loadP, view, onCapPos }) {
  const handleClick = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * W;
    const sy = ((e.clientY - rect.top) / rect.height) * H;
    if (sy > FY - 50 && sy < FY + 60 && sx >= FX1 && sx <= FX2) {
      const km = ((sx - FX1) / (FX2 - FX1)) * FLEN;
      if (km >= 0.5 && km <= 10) onCapPos(Math.round(km * 2) / 2);
    }
  };

  const allV = [...data.vB, ...data.vA];
  const vMinD = Math.min(...allV);
  const vMin = Math.floor(vMinD * 5) / 5 - 0.1;
  const vMax = VB + 0.15;
  const vToY = (v) => VPy1 + (vMax - v) / (vMax - vMin) * (VPy2 - VPy1);

  const mkPath = (arr) => arr.map((v, i) =>
    `${i === 0 ? 'M' : 'L'}${kmToX(i * STEP)},${vToY(v)}`
  ).join(' ');

  const fillFwd = data.vA.map((v, i) => `${i === 0 ? 'M' : 'L'}${kmToX(i * STEP)},${vToY(v)}`).join(' ');
  const fillRev = data.vB.slice().reverse().map((v, i) => {
    const idx = data.vB.length - 1 - i;
    return `L${kmToX(idx * STEP)},${vToY(v)}`;
  }).join(' ');
  const fillPath = `${fillFwd} ${fillRev} Z`;

  const secQB = [0, 1, 2, 3, 4].map(i => data.qFB[i * SPS]);
  const secQA = [0, 1, 2, 3, 4].map(i => data.qFA[i * SPS]);
  const maxQ = Math.max(...secQB.map(Math.abs), 1);
  const qArrW = 6;

  const showB = view === 'before' || view === 'both';
  const showA = view === 'after' || view === 'both';

  const grids = [];
  for (let v = Math.ceil(vMin / 0.2) * 0.2; v < vMax; v += 0.2)
    grids.push(Math.round(v * 10) / 10);

  const capSvgX = kmToX(capPos);
  const optSvgX = kmToX(data.optPos);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }} onClick={handleClick}>
      {/* Voltage profile title */}
      <text x={VPx1} y={VPy1 - 10} fontSize={10} fill="#52525b" fontWeight={600}>VOLTAGE PROFILE (kV)</text>

      {/* Chart background */}
      <rect x={VPx1} y={VPy1} width={VPx2 - VPx1} height={VPy2 - VPy1}
        fill="rgba(24,24,27,0.4)" stroke="#1e1e2e" strokeWidth={1} rx={4} />

      {/* Horizontal grid + y-axis labels */}
      {grids.map(v => (
        <g key={v}>
          <line x1={VPx1} y1={vToY(v)} x2={VPx2} y2={vToY(v)} stroke="#1e1e2e" strokeWidth={0.5} />
          <text x={VPx1 - 6} y={vToY(v) + 3} textAnchor="end" fontSize={8} fill="#3f3f46">{v.toFixed(1)}</text>
        </g>
      ))}

      {/* Vertical grid at load positions */}
      {LPOS.map(km => (
        <line key={km} x1={kmToX(km)} y1={VPy1} x2={kmToX(km)} y2={VPy2}
          stroke="#1e1e2e" strokeWidth={0.5} strokeDasharray="3 3" />
      ))}

      {/* Fill between curves */}
      {showB && showA && <path d={fillPath} fill="#22c55e" opacity={0.07} />}

      {/* Before voltage curve */}
      {showB && <path d={mkPath(data.vB)} fill="none" stroke="#f97316" strokeWidth={2} strokeDasharray="6 3" opacity={0.8} />}

      {/* After voltage curve */}
      {showA && <path d={mkPath(data.vA)} fill="none" stroke="#22c55e" strokeWidth={2.5} />}

      {/* End-of-feeder voltage labels */}
      {showB && (
        <text x={VPx2 + 5} y={vToY(data.vB[NSTEPS]) + (showA ? 12 : 4)} fontSize={10}
          fill="#f97316" fontWeight={600}>{data.vB[NSTEPS].toFixed(2)}</text>
      )}
      {showA && (
        <text x={VPx2 + 5} y={vToY(data.vA[NSTEPS]) - 2} fontSize={10}
          fill="#22c55e" fontWeight={600}>{data.vA[NSTEPS].toFixed(2)}</text>
      )}

      {/* Curve legend */}
      <line x1={VPx2 - 155} y1={VPy1 + 12} x2={VPx2 - 130} y2={VPy1 + 12}
        stroke="#f97316" strokeWidth={2} strokeDasharray="5 3" />
      <text x={VPx2 - 125} y={VPy1 + 15} fontSize={9} fill="#f97316">Before</text>
      <line x1={VPx2 - 75} y1={VPy1 + 12} x2={VPx2 - 50} y2={VPy1 + 12}
        stroke="#22c55e" strokeWidth={2} />
      <text x={VPx2 - 45} y={VPy1 + 15} fontSize={9} fill="#22c55e">After</text>

      {/* x-axis km labels */}
      {[0, 2, 4, 6, 8, 10].map(km => (
        <text key={`xl-${km}`} x={kmToX(km)} y={VPy2 + 12} textAnchor="middle" fontSize={8} fill="#3f3f46">{km}</text>
      ))}

      {/* ==== FEEDER SCHEMATIC ==== */}
      <text x={FX1} y={FY - 58} fontSize={10} fill="#52525b" fontWeight={600}>REACTIVE POWER FLOW</text>

      {/* Before Q arrows (above feeder) */}
      {showB && secQB.map((q, i) => {
        if (Math.abs(q) < 0.1) return null;
        const x1 = kmToX(i * SLEN) + 3;
        const x2 = kmToX((i + 1) * SLEN) - 3;
        const w = Math.max(1, (Math.abs(q) / maxQ) * qArrW);
        const y = FY - 8;
        return (
          <g key={`qb-${i}`}>
            <line x1={x1} y1={y} x2={x2 - 5} y2={y}
              stroke="#f97316" strokeWidth={w} opacity={0.45} strokeLinecap="round" />
            <polygon points={`${x2},${y} ${x2 - 6},${y - w * 0.55} ${x2 - 6},${y + w * 0.55}`}
              fill="#f97316" opacity={0.45} />
            {i === 0 && (
              <text x={x1 + 2} y={y - w / 2 - 3} fontSize={7} fill="#f97316" opacity={0.7}>
                {Math.round(q)} kVAr
              </text>
            )}
          </g>
        );
      })}

      {/* After Q arrows (below feeder) */}
      {showA && secQA.map((q, i) => {
        if (Math.abs(q) < 0.1) return null;
        const x1q = kmToX(i * SLEN) + 3;
        const x2q = kmToX((i + 1) * SLEN) - 3;
        const w = Math.max(1, (Math.abs(q) / maxQ) * qArrW);
        const y = FY + 8;
        const pos = q >= 0;
        const col = pos ? '#22c55e' : '#ef4444';
        const fromX = pos ? x1q : x2q;
        const toX = pos ? x2q : x1q;
        const dir = pos ? 1 : -1;
        return (
          <g key={`qa-${i}`}>
            <line x1={fromX} y1={y} x2={toX - dir * 5} y2={y}
              stroke={col} strokeWidth={w} opacity={0.45} strokeLinecap="round" />
            <polygon points={`${toX},${y} ${toX - dir * 6},${y - w * 0.55} ${toX - dir * 6},${y + w * 0.55}`}
              fill={col} opacity={0.45} />
            {i === 0 && (
              <text x={pos ? x1q + 2 : x2q - 2} y={y + w / 2 + 9} fontSize={7} fill={col} opacity={0.7}
                textAnchor={pos ? 'start' : 'end'}>
                {Math.round(Math.abs(q))} kVAr{!pos && ' ◄'}
              </text>
            )}
          </g>
        );
      })}

      {/* Feeder main line */}
      <line x1={FX1} y1={FY} x2={FX2} y2={FY} stroke="#52525b" strokeWidth={2.5} />

      {/* Substation symbol */}
      <rect x={FX1 - 34} y={FY - 16} width={34} height={32} rx={4}
        fill="rgba(24,24,27,0.95)" stroke="#818cf8" strokeWidth={1.5} />
      <text x={FX1 - 17} y={FY - 2} textAnchor="middle" fontSize={9} fontWeight={700} fill="#818cf8">SS</text>
      <text x={FX1 - 17} y={FY + 10} textAnchor="middle" fontSize={7} fill="#52525b">11 kV</text>

      {/* 2/3 rule optimal position */}
      <line x1={optSvgX} y1={FY - 30} x2={optSvgX} y2={FY + 30}
        stroke="#818cf8" strokeWidth={1} strokeDasharray="4 3" opacity={0.35} />
      <text x={optSvgX} y={FY - 34} textAnchor="middle" fontSize={7} fill="#818cf8" opacity={0.5}>
        ⅔ rule ({data.optPos.toFixed(1)} km)
      </text>

      {/* Capacitor symbol */}
      <g>
        <line x1={capSvgX} y1={FY} x2={capSvgX} y2={FY - 16} stroke="#22c55e" strokeWidth={1.5} />
        <line x1={capSvgX - 8} y1={FY - 16} x2={capSvgX + 8} y2={FY - 16} stroke="#22c55e" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={capSvgX - 8} y1={FY - 21} x2={capSvgX + 8} y2={FY - 21} stroke="#22c55e" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={capSvgX} y1={FY - 21} x2={capSvgX} y2={FY - 28} stroke="#22c55e" strokeWidth={1.5} />
        <line x1={capSvgX - 5} y1={FY - 28} x2={capSvgX + 5} y2={FY - 28} stroke="#22c55e" strokeWidth={1.2} />
        <line x1={capSvgX - 3} y1={FY - 31} x2={capSvgX + 3} y2={FY - 31} stroke="#22c55e" strokeWidth={0.8} />
        <rect x={capSvgX - 28} y={FY - 46} width={56} height={14} rx={3} fill="#09090b" opacity={0.85} />
        <text x={capSvgX} y={FY - 37} textAnchor="middle" fontSize={9} fill="#22c55e" fontWeight={600}>
          {capQ} kVAr
        </text>
      </g>

      {/* Load points */}
      {LPOS.map((km, i) => {
        const x = kmToX(km);
        return (
          <g key={`ld-${i}`}>
            <line x1={x} y1={FY} x2={x} y2={FY + 15} stroke="#f59e0b" strokeWidth={1.2} />
            <polygon points={`${x - 4},${FY + 15} ${x + 4},${FY + 15} ${x},${FY + 22}`} fill="#f59e0b" />
            <text x={x} y={FY + 33} textAnchor="middle" fontSize={7} fill="#71717a">{loadP} kW</text>
            <text x={x} y={FY + 43} textAnchor="middle" fontSize={7} fill="#3f3f46">{km} km</text>
          </g>
        );
      })}

      {/* Click-to-place zone indicator */}
      <rect x={FX1} y={FY - 50} width={FX2 - FX1} height={100}
        fill="transparent" style={{ cursor: 'crosshair' }} />

      {/* Voltage rise annotation at cap */}
      {data.vRise > 0.01 && (
        <text x={capSvgX} y={FY + 55} textAnchor="middle" fontSize={7} fill="#22c55e" opacity={0.6}>
          ΔV ≈ +{data.vRise.toFixed(2)}%
        </text>
      )}

      {/* Distance label */}
      <text x={(FX1 + FX2) / 2} y={FY + 68} textAnchor="middle" fontSize={9} fill="#3f3f46">
        Distance from Substation (km) — click feeder to place capacitor
      </text>

      {/* Scale ticks */}
      {[0, 2, 4, 6, 8, 10].map(km => (
        <g key={`tk-${km}`}>
          <line x1={kmToX(km)} y1={FY + 55} x2={kmToX(km)} y2={FY + 59} stroke="#3f3f46" strokeWidth={0.8} />
          <text x={kmToX(km)} y={FY + 56} textAnchor="middle" fontSize={7} fill="#3f3f46">{km}</text>
        </g>
      ))}
    </svg>
  );
}

function TheorySVGCapPlacement() {
  return (
    <svg viewBox="0 0 760 300" style={{ width: '100%', maxWidth: 760, height: 'auto', margin: '20px 0' }}>
      <rect width="760" height="300" rx="12" fill="#111114" stroke="#27272a" />
      <text x="380" y="28" textAnchor="middle" fill="#d4d4d8" fontSize={14} fontWeight={700}>Capacitor Placement — The 2/3 Rule</text>

      {/* Feeder line */}
      <line x1="80" y1="100" x2="680" y2="100" stroke="#52525b" strokeWidth={3} />
      <text x="80" y="90" fill="#6366f1" fontSize={10} fontWeight={600}>Substation</text>
      <text x="680" y="90" textAnchor="end" fill="#71717a" fontSize={10}>Feeder End</text>

      {/* Distributed loads */}
      {[160, 240, 320, 400, 480, 560, 640].map(x => (
        <g key={x}>
          <line x1={x} y1="100" x2={x} y2="115" stroke="#52525b" strokeWidth={0.8} />
          <circle cx={x} cy="118" r="3" fill="#3f3f46" />
        </g>
      ))}

      {/* 2/3 point marker */}
      <line x1="480" y1="80" x2="480" y2="130" stroke="#22c55e" strokeWidth={2} strokeDasharray="5,3" />
      <text x="480" y="72" textAnchor="middle" fill="#22c55e" fontSize={10} fontWeight={700}>2/3 L</text>

      {/* Capacitor symbol at 2/3 */}
      <line x1="480" y1="130" x2="480" y2="145" stroke="#22c55e" strokeWidth={1.5} />
      <line x1="468" y1="145" x2="492" y2="145" stroke="#22c55e" strokeWidth={3} />
      <line x1="468" y1="152" x2="492" y2="152" stroke="#22c55e" strokeWidth={3} />
      <line x1="480" y1="152" x2="480" y2="165" stroke="#22c55e" strokeWidth={1.5} />
      <line x1="472" y1="165" x2="488" y2="165" stroke="#3f3f46" strokeWidth={1} />
      <text x="500" y="152" fill="#22c55e" fontSize={9} fontWeight={600}>Qc = 2/3 * Q_L</text>

      {/* Voltage profile - without cap */}
      <text x="380" y="195" textAnchor="middle" fill="#d4d4d8" fontSize={11} fontWeight={600}>Voltage Profile Comparison</text>
      <line x1="80" y1="230" x2="680" y2="230" stroke="#3f3f46" strokeWidth={0.5} />
      <text x="70" y="234" textAnchor="end" fill="#52525b" fontSize={8}>1.0</text>
      <line x1="80" y1="250" x2="680" y2="250" stroke="#3f3f46" strokeWidth={0.5} strokeDasharray="4,3" />
      <text x="70" y="254" textAnchor="end" fill="#52525b" fontSize={8}>0.94</text>

      {/* Without capacitor */}
      <path d="M80,230 L280,236 L480,248 L680,260" fill="none" stroke="#ef4444" strokeWidth={1.5} />
      <text x="685" y="263" fill="#ef4444" fontSize={8}>No cap</text>

      {/* With capacitor at 2/3 */}
      <path d="M80,230 L280,233 L480,235 L680,244" fill="none" stroke="#22c55e" strokeWidth={2} />
      <text x="685" y="247" fill="#22c55e" fontSize={8}>With cap</text>

      {/* Loss reduction annotation */}
      <rect x="240" y="268" width="280" height="22" rx="6" fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.2)" />
      <text x="380" y="283" textAnchor="middle" fill="#22c55e" fontSize={9}>Optimal: 2/3 rated Qc at 2/3 distance → 89% max loss reduction</text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Capacitor Placement for Power Factor Correction</h2>
      <p style={S.p}>
        Power factor correction using shunt capacitor banks is one of the most cost-effective
        measures to reduce losses, improve voltage profile, and release system capacity in
        distribution networks. In India, where distribution losses average 20–25% (including
        commercial losses), even modest PF improvement yields significant technical and
        financial benefits.
      </p>

      <TheorySVGCapPlacement />

      <h3 style={S.h3}>Why Power Factor Correction Matters</h3>
      <p style={S.p}>
        Most industrial and agricultural loads are inductive (motors, transformers, welding
        machines), drawing reactive power (kVAr) in addition to real power (kW). This reactive
        current flows through feeders, cables, and transformers without doing useful work, but
        causes:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Higher I²R losses:</strong> Current is
          proportional to apparent power, and since S = P/cosφ, lower PF means higher current
          and quadratically higher losses in the feeder.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Greater voltage drop:</strong> Reactive current
          flowing through line reactance causes additional voltage drop ΔV = I·X·sinφ, worsening
          the voltage profile at the tail end of feeders.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Reduced capacity:</strong> Transformers and cables
          are rated in kVA. Poor PF means less real power (kW) can be delivered for the same
          equipment rating — valuable capacity is wasted carrying reactive current.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Penalty tariffs:</strong> Most regulators impose
          penalties for PF below 0.9 (APERC) or 0.85 (some states), adding direct financial cost.
        </li>
      </ul>
      <div style={S.eq}>I = P / (√3 × V × cosφ)   →   I ∝ 1 / cosφ</div>
      <div style={S.eq}>P_loss = 3I²R = P²R / (V² × cos²φ)   →   Loss ∝ 1 / cos²φ</div>
      <p style={S.p}>
        Improving PF from 0.8 to 0.95 reduces losses by 1 − (0.8/0.95)² ={' '}
        <strong style={{ color: '#e4e4e7' }}>29%</strong>. This is achieved simply by installing
        a capacitor bank — no change to conductors, transformers, or loads is needed.
      </p>

      <h3 style={S.h3}>kVAr Sizing for Capacitor Banks</h3>
      <p style={S.p}>
        The capacitor rating required to improve power factor from cosφ₁ (initial) to cosφ₂
        (target) for a given real power demand P is:
      </p>
      <div style={S.eq}>Q_cap = P × (tanφ₁ − tanφ₂)</div>
      <p style={S.p}>Where:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>P</strong> — total real power demand (kW)</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>φ₁ = cos⁻¹(PF₁)</strong> — initial PF angle</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>φ₂ = cos⁻¹(PF₂)</strong> — target PF angle</li>
      </ul>
      <p style={S.p}>Example: For P = 1000 kW, PF₁ = 0.80, PF₂ = 0.95:</p>
      <div style={S.eq}>
        Q_cap = 1000 × (tan 36.87° − tan 18.19°) = 1000 × (0.750 − 0.329) = 421 kVAr
      </div>

      <h3 style={S.h3}>Optimal Capacitor Placement — The 2/3 Rule</h3>
      <p style={S.p}>
        For a feeder with <strong style={{ color: '#e4e4e7' }}>uniformly distributed load</strong>,
        the optimal location for a single capacitor bank that maximizes loss reduction is at{' '}
        <strong style={{ color: '#e4e4e7' }}>2/3 of the feeder length</strong> from the source
        (substation). This result comes from minimizing the total I²R loss integral:
      </p>
      <p style={S.p}>
        Consider a feeder of length L with uniform load density. The reactive current at
        distance x from the source is proportional to (L − x), the remaining feeder length
        supplying load. The total loss without compensation is:
      </p>
      <div style={S.eq}>Loss ∝ ∫₀ᴸ (L − x)² dx = L³ / 3</div>
      <p style={S.p}>
        With a capacitor at position d from the source, the reactive current between the source
        and position d is reduced. Differentiating the total loss with respect to d and setting
        to zero gives the optimal position:
      </p>
      <div style={S.eq}>d_optimal = 2L / 3</div>
      <p style={S.p}>
        For multiple capacitor banks, the optimal locations follow a generalized pattern. The
        theoretical maximum reactive loss reduction for each configuration:
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Banks</th>
            <th style={S.th}>Optimal Locations (from source)</th>
            <th style={S.th}>Max Reactive Loss Reduction</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['1', '2L/3', '89%'],
            ['2', '2L/5, 4L/5', '96%'],
            ['3', '2L/7, 4L/7, 6L/7', '98%'],
            ['n', '2kL/(2n+1) for k=1…n', '→ 100% as n → ∞'],
          ].map(([n, loc, red]) => (
            <tr key={n}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{n}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{loc}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{red}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={S.p}>
        In practice, loads are concentrated at discrete points rather than uniformly
        distributed. The simulation above models 5 discrete loads, where the 2/3 position
        (6.67 km) is shown as a reference.
      </p>

      <h3 style={S.h3}>Voltage Rise at Capacitor Location</h3>
      <p style={S.p}>
        A shunt capacitor bank raises the voltage at its installation point. The approximate
        voltage rise is:
      </p>
      <div style={S.eq}>ΔV (%) = Q_cap × X_feeder / (10 × V²)</div>
      <p style={S.p}>Where:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Q_cap</strong> — capacitor rating in kVAr</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>X_feeder</strong> — feeder reactance from substation to capacitor location (Ω)</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>V</strong> — system voltage in kV</li>
      </ul>
      <p style={S.p}>
        This voltage rise must be carefully considered during light-load conditions. If the
        capacitor is permanently connected (fixed bank), it may cause <strong style={{ color: '#e4e4e7' }}>
        overvoltage</strong> when the feeder load drops at night or on holidays. CBIP
        Publication 296 limits the permissible voltage rise to{' '}
        <strong style={{ color: '#e4e4e7' }}>5%</strong> for 11 kV systems. Exceeding this
        degrades insulation and shortens equipment life.
      </p>

      <h3 style={S.h3}>Fixed vs Switched Capacitor Banks</h3>
      <p style={S.p}>
        Capacitor banks are deployed in two main configurations to match varying reactive
        power demand:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Fixed banks:</strong> Permanently connected to the
          feeder. Sized for the base (minimum) reactive load that exists at all times. Simple
          design, low cost, no control equipment needed. Commonly used on 11 kV feeders with
          relatively flat load profiles (e.g., agricultural pump feeders in AP). Typical sizes:
          300–600 kVAr.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Switched banks:</strong> Automatically
          connected/disconnected based on measured PF, voltage, or VAr. Used at 33 kV substations
          and industrial installations where load varies significantly through the day. Types:
        </li>
      </ul>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Type</th>
            <th style={S.th}>Switching Speed</th>
            <th style={S.th}>Application</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Contactor-switched', '1–5 seconds', '33 kV SS, 5–15 steps'],
            ['Thyristor-switched (TSC)', '< 1 cycle (20 ms)', 'Industrial, rapid load changes'],
            ['Hybrid (fixed + switched)', 'Fixed: always, switched: seconds', 'Most common for DISCOMs'],
          ].map(([t, s, a]) => (
            <tr key={t}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{t}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{s}</td>
              <td style={S.td}>{a}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>Harmonic Resonance Concern</h3>
      <p style={S.p}>
        A shunt capacitor bank forms a parallel LC circuit with the system's source inductance.
        If the natural resonant frequency of this circuit coincides with a dominant harmonic
        in the system (from VFDs, rectifiers, arc furnaces, LED drivers), dangerous harmonic
        current amplification can result:
      </p>
      <div style={S.eq}>f_r = f_system × √(MVA_sc / MVAr_cap)</div>
      <div style={S.eq}>h_r = √(MVA_sc / MVAr_cap)    ← resonant harmonic order</div>
      <p style={S.p}>Where:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>f_system</strong> — system frequency (50 Hz in India)</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>MVA_sc</strong> — short-circuit capacity at the capacitor location</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>MVAr_cap</strong> — capacitor bank rating</li>
      </ul>
      <p style={S.p}>
        Example: For MVA_sc = 100 MVA and MVAr_cap = 2 MVAr: h_r = √(100/2) = 7.07. This is
        dangerously close to the <strong style={{ color: '#e4e4e7' }}>7th harmonic</strong> (common
        from 6-pulse rectifiers), risking resonance. Solutions include{' '}
        <strong style={{ color: '#e4e4e7' }}>detuned reactors</strong> — a series reactor
        (typically 5.67% or 7% of cap rating) that shifts the resonant frequency below the
        5th harmonic, avoiding amplification of all dominant harmonics.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Real-World Context — AP DISCOMs</span>
        <p style={S.ctxP}>
          AP DISCOMs (APSPDCL and APEPDCL) install fixed capacitor banks of 300–600 kVAr at
          11 kV feeders and switched banks at 33 kV substations. APERC mandates a power factor
          of 0.9 minimum for HT consumers, with a penalty tariff of ₹0.50/kVAr for PF below
          0.9. Conversely, an incentive of ₹0.50/kVAr is provided for PF above 0.95. As of
          2024, AP DISCOMs have installed over 12,000 capacitor banks across the distribution
          network, contributing to a reduction of distribution losses from 15% to 11.5%. The
          typical payback period for 11 kV capacitor bank installation is 6–12 months.
        </p>
      </div>

      <h3 style={S.h3}>Economic Analysis — Payback Period</h3>
      <p style={S.p}>
        Capacitor bank installation has one of the shortest payback periods of any distribution
        system improvement measure. The investment is recovered through reduced energy losses
        and avoided demand charges:
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Item</th>
            <th style={S.th}>Typical Value (11 kV)</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Cost of cap bank (300 kVAr)', '₹1.5–2.5 lakh'],
            ['Installation & protection', '₹0.3–0.5 lakh'],
            ['Loss reduction per bank', '8–15 kW'],
            ['Annual energy saved', '60,000–120,000 kWh'],
            ['Value of saved energy (@ ₹5/kWh)', '₹3–6 lakh/year'],
            ['Released transformer capacity', '50–100 kVA'],
            ['Simple payback period', '4–12 months'],
            ['Expected life of bank', '15–20 years'],
          ].map(([item, val]) => (
            <tr key={item}>
              <td style={S.td}>{item}</td>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={S.eq}>Payback (months) = (Cap_cost + Install_cost) / (Monthly_savings × Tariff)</div>
      <p style={S.p}>
        Additional benefits include released transformer capacity (kVA freed up for new load
        connections), reduced maximum demand charges, deferred network augmentation, and
        improved consumer-end voltage (fewer complaints).
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Assumptions in This Simulation</span>
        <p style={S.ctxP}>
          The feeder model uses a 10 km, 11 kV radial feeder with R = 0.5 Ω/km and X = 0.4 Ω/km
          (typical for ACSR Dog conductor used by AP DISCOMs on 11 kV feeders). Five equal loads
          are placed at 2 km intervals. Voltage drop uses the approximate formula ΔV = (PR + QX)/V²,
          valid for drops {'<'}5%. The 2/3 rule optimal position assumes uniformly distributed load.
          Losses are computed as 3I²R for balanced three-phase circuits. Temperature effects on
          conductor resistance and transformer tap-changer regulation are not modelled.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Central Electricity Authority (CEA) — Manual on Distribution Planning and Practices</li>
        <li style={S.li}>APERC — Tariff Order FY 2024–25, Power Factor Incentive/Penalty Clauses</li>
        <li style={S.li}>IEEE Std 1036-2010 — Guide for Application of Shunt Power Capacitors</li>
        <li style={S.li}>IS 2834:1986 — Specification for Shunt Capacitors for Power Systems</li>
        <li style={S.li}>CBIP Publication No. 296 — Manual on Reactive Power Compensation</li>
        <li style={S.li}>T.J.E. Miller, <em>"Reactive Power Control in Electric Systems"</em>, Wiley</li>
        <li style={S.li}>J.J. Grainger & W.D. Stevenson, <em>"Power Systems Analysis and Design"</em>, McGraw-Hill</li>
        <li style={S.li}>C.L. Wadhwa, <em>"Electrical Power Systems"</em>, New Age International</li>
      </ul>
    </div>
  );
}

export default function CapacitorPlacement() {
  const [tab, setTab] = useState('simulate');
  const [loadP, setLoadP] = useState(200);
  const [loadPF, setLoadPF] = useState(0.80);
  const [capQ, setCapQ] = useState(200);
  const [capPos, setCapPos] = useState(6.5);
  const [view, setView] = useState('both');

  const data = useMemo(() => compute(loadP, loadPF, capQ, capPos), [loadP, loadPF, capQ, capPos]);

  const qNet = data.totalQ - capQ;
  const pfBTag = data.pfB >= 0.999 ? '' : ' lag';
  const pfATag = Math.abs(qNet) < 0.5 ? '' : qNet > 0 ? ' lag' : ' lead';

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram data={data} capPos={capPos} capQ={capQ} loadP={loadP}
              view={view} onCapPos={setCapPos} />
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>PF Before</span>
              <span style={{ ...S.rv, color: '#f97316' }}>{data.pfB.toFixed(3)}{pfBTag}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>PF After</span>
              <span style={{ ...S.rv, color: '#22c55e' }}>{data.pfA.toFixed(3)}{pfATag}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Loss Before</span>
              <span style={{ ...S.rv, color: '#f97316' }}>{data.lossB.toFixed(1)} kW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Loss After</span>
              <span style={{ ...S.rv, color: '#22c55e' }}>{data.lossA.toFixed(1)} kW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Loss Reduction</span>
              <span style={{ ...S.rv, color: '#3b82f6' }}>{data.lossRed.toFixed(1)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>V Improvement</span>
              <span style={{ ...S.rv, color: '#8b5cf6' }}>{data.vImp.toFixed(2)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Cap Location</span>
              <span style={{ ...S.rv, color: '#e4e4e7' }}>{capPos.toFixed(1)} km</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Load / Point</span>
              <input type="range" min={100} max={400} step={10} value={loadP}
                onChange={(e) => setLoadP(+e.target.value)} style={S.slider} />
              <span style={S.val}>{loadP} kW</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Load PF</span>
              <input type="range" min={65} max={99} value={Math.round(loadPF * 100)}
                onChange={(e) => setLoadPF(+e.target.value / 100)} style={S.slider} />
              <span style={S.val}>{loadPF.toFixed(2)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Cap Size</span>
              <div style={S.bg}>
                {CAPS.map(c => (
                  <button key={c} style={S.btn(capQ === c)} onClick={() => setCapQ(c)}>{c}</button>
                ))}
              </div>
              <span style={{ fontSize: 10, color: '#3f3f46' }}>kVAr</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Position</span>
              <input type="range" min={5} max={100} step={5} value={capPos * 10}
                onChange={(e) => setCapPos(+e.target.value / 10)} style={{ ...S.slider, width: 120 }} />
              <span style={S.val}>{capPos.toFixed(1)} km</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>View</span>
              <div style={S.bg}>
                {[['before', 'Before'], ['after', 'After'], ['both', 'Both']].map(([k, l]) => (
                  <button key={k} style={S.btn(view === k)} onClick={() => setView(k)}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
