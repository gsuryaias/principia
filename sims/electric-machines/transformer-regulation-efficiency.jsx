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

// Compute VR (per-unit approximate formula)
function computeVR(x, cosφ, Rpu, Xpu) {
  const sinφ = Math.sqrt(1 - cosφ * cosφ);
  const term1 = x * (Rpu * cosφ + Xpu * sinφ);
  const term2 = (x * x * Math.pow(Xpu * cosφ - Rpu * sinφ, 2)) / 2;
  return (term1 + term2) * 100; // VR%
}

// Compute efficiency (%)
function computeEff(x, cosφ, Pi_kW, Pc_kW, S_kVA) {
  const output = x * S_kVA * cosφ; // kW
  const pcu = x * x * Pc_kW;       // kW
  const denom = output + Pi_kW + pcu;
  if (denom <= 0) return 0;
  return (output / denom) * 100;
}

function Diagram({ x, cosφ, Rpu, Xpu, Pi, Pc }) {
  const S_kVA = 1000; // normalised 1000 kVA rated

  // Compute current operating point values
  const vrCurrent = computeVR(x, cosφ, Rpu, Xpu);
  const effCurrent = computeEff(x, cosφ, Pi, Pc, S_kVA);
  const xOpt = Math.sqrt(Pi / Pc);
  const effMax = computeEff(xOpt, cosφ, Pi, Pc, S_kVA);
  const pcuCurrent = x * x * Pc * 1000; // W
  const piW = Pi * 1000;                 // W
  const outputCurrent = x * S_kVA * cosφ; // kW

  // SVG layout
  const W = 960, H = 340;

  // LEFT PLOT: VR vs x
  const LP = { x: 48, y: 28, w: 400, h: 240 };
  // RIGHT PLOT: Efficiency vs x
  const RP = { x: 510, y: 28, w: 400, h: 240 };

  const X_MAX = 1.5;
  const N_PTS = 90;

  // VR curves for 3 PF scenarios
  const vrConfigs = [
    { cosφ: 0.8, lag: true,  color: '#f59e0b', label: 'cos φ=0.8 lag' },
    { cosφ: 1.0, lag: false, color: '#22c55e', label: 'cos φ=1.0' },
    { cosφ: 0.8, lag: false, color: '#60a5fa', label: 'cos φ=0.8 lead', lead: true },
  ];

  // For the lead PF curve, sinφ should flip sign (leading PF negative sin)
  function computeVRConfig(xx, cfg) {
    const cφ = cfg.cosφ;
    const sinφ = Math.sqrt(1 - cφ * cφ);
    const sφ = cfg.lead ? -sinφ : sinφ;
    const term1 = xx * (Rpu * cφ + Xpu * sφ);
    const term2 = (xx * xx * Math.pow(Xpu * cφ - Rpu * sφ, 2)) / 2;
    return (term1 + term2) * 100;
  }

  // Compute VR range for y-axis
  let vrMin = Infinity, vrMax = -Infinity;
  vrConfigs.forEach((cfg) => {
    for (let i = 0; i <= N_PTS; i++) {
      const xx = (i / N_PTS) * X_MAX;
      const v = computeVRConfig(xx, cfg);
      if (v < vrMin) vrMin = v;
      if (v > vrMax) vrMax = v;
    }
  });
  vrMin = Math.floor(vrMin - 0.5);
  vrMax = Math.ceil(vrMax + 0.5);
  if (vrMin > -1) vrMin = -1;
  if (vrMax < 2) vrMax = 2;

  const xToLPx = (xx) => LP.x + (xx / X_MAX) * LP.w;
  const vrToLPy = (vr) => LP.y + LP.h - ((vr - vrMin) / (vrMax - vrMin)) * LP.h;

  const effYMin = 70, effYMax = 100;
  const xToRPx = (xx) => RP.x + (xx / X_MAX) * RP.w;
  const effToRPy = (eff) => RP.y + RP.h - ((eff - effYMin) / (effYMax - effYMin)) * RP.h;

  // Generate VR polyline points
  function vrPoints(cfg) {
    const pts = [];
    for (let i = 0; i <= N_PTS; i++) {
      const xx = (i / N_PTS) * X_MAX;
      const vr = computeVRConfig(xx, cfg);
      pts.push(`${xToLPx(xx).toFixed(1)},${vrToLPy(vr).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  // Generate Efficiency curve points (for current cosφ)
  const effPts = [];
  const effFillPts = [];
  for (let i = 0; i <= N_PTS; i++) {
    const xx = (i / N_PTS) * X_MAX;
    const eff = computeEff(xx, cosφ, Pi, Pc, S_kVA);
    effPts.push({ x: xToRPx(xx), y: effToRPy(eff) });
    effFillPts.push({ x: xToRPx(xx), y: effToRPy(eff) });
  }
  const effPolyline = effPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Fill path for efficiency curve
  const effFillPath = effFillPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('') +
    `L${xToRPx(X_MAX).toFixed(1)},${(RP.y + RP.h).toFixed(1)}` +
    `L${xToRPx(0).toFixed(1)},${(RP.y + RP.h).toFixed(1)}Z`;

  // X-axis tick values
  const xTicks = [0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5];

  // VR y-axis ticks
  const vrStep = (vrMax - vrMin) > 12 ? 2 : 1;
  const vrTicks = [];
  for (let v = Math.ceil(vrMin / vrStep) * vrStep; v <= vrMax; v += vrStep) vrTicks.push(v);

  // Eff y-axis ticks
  const effTicks = [70, 75, 80, 85, 90, 95, 100];

  // Clamp current VR to plot area
  const vrCurrentClamped = Math.max(vrMin, Math.min(vrMax, vrCurrent));
  const effCurrentClamped = Math.max(effYMin, Math.min(effYMax, effCurrent));

  // Max efficiency point x position
  const xOptClamped = Math.min(xOpt, X_MAX);
  const effMaxClamped = Math.max(effYMin, Math.min(effYMax, effMax));

  // Sankey bar dimensions (below plots)
  const BW = 880, BH = 34, BX = 40, BY = 290;
  const totalPower = outputCurrent + Pi + Pc * x * x;
  const outFrac = totalPower > 0 ? outputCurrent / totalPower : 0.7;
  const cuFrac = totalPower > 0 ? (Pc * x * x) / totalPower : 0.15;
  const feFrac = totalPower > 0 ? Pi / totalPower : 0.15;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <defs>
        <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="outGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="cuGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="feGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <filter id="glow2"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <style>{`
          @keyframes pulseDot { 0%,100%{r:5} 50%{r:7.5} }
          .pulseDot { animation: pulseDot 1.6s ease-in-out infinite; }
        `}</style>
      </defs>

      {/* ── LEFT PLOT: VR vs Load ── */}
      <rect x={LP.x} y={LP.y} width={LP.w} height={LP.h} rx={4} fill="#0c0c10" stroke="#1e1e2e" strokeWidth={0.5} />
      <text x={LP.x + LP.w / 2} y={LP.y - 10} textAnchor="middle" fontSize={11} fontWeight={600} fill="#d4d4d8">
        Voltage Regulation vs Load
      </text>

      {/* VR grid lines */}
      {vrTicks.map((v) => (
        <g key={`vrg${v}`}>
          <line x1={LP.x} y1={vrToLPy(v)} x2={LP.x + LP.w} y2={vrToLPy(v)} stroke="#1a1a24" strokeWidth={0.5} />
          <text x={LP.x - 5} y={vrToLPy(v) + 4} textAnchor="end" fontSize={8} fill="#52525b" fontFamily="monospace">{v}%</text>
        </g>
      ))}
      {xTicks.map((xx) => (
        <g key={`lxg${xx}`}>
          <line x1={xToLPx(xx)} y1={LP.y} x2={xToLPx(xx)} y2={LP.y + LP.h} stroke="#1a1a24" strokeWidth={0.5} />
          <text x={xToLPx(xx)} y={LP.y + LP.h + 13} textAnchor="middle" fontSize={8} fill="#52525b">{xx}</text>
        </g>
      ))}

      {/* Zero VR horizontal line */}
      {vrMin <= 0 && vrMax >= 0 && (
        <line x1={LP.x} y1={vrToLPy(0)} x2={LP.x + LP.w} y2={vrToLPy(0)}
          stroke="#4b5563" strokeWidth={1} strokeDasharray="4 3" opacity={0.8} />
      )}

      {/* VR curves */}
      {vrConfigs.map((cfg, i) => (
        <polyline key={`vrc${i}`} points={vrPoints(cfg)}
          fill="none" stroke={cfg.color} strokeWidth={1.8} strokeLinejoin="round" opacity={0.85} />
      ))}

      {/* Highlight for current selected PF curve (closest to current cosφ) */}
      {(() => {
        // Draw the actual current PF curve highlighted
        const sinφ = Math.sqrt(1 - cosφ * cosφ);
        const pts = [];
        for (let i = 0; i <= N_PTS; i++) {
          const xx = (i / N_PTS) * X_MAX;
          const vr = computeVR(xx, cosφ, Rpu, Xpu);
          pts.push(`${xToLPx(xx).toFixed(1)},${vrToLPy(vr).toFixed(1)}`);
        }
        return (
          <polyline points={pts.join(' ')} fill="none" stroke="#a78bfa"
            strokeWidth={2.5} strokeLinejoin="round" />
        );
      })()}

      {/* Current operating point marker on VR plot */}
      <line x1={xToLPx(x)} y1={LP.y} x2={xToLPx(x)} y2={LP.y + LP.h}
        stroke="#a78bfa" strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
      <circle className="pulseDot" cx={xToLPx(x)} cy={vrToLPy(vrCurrentClamped)} r={5}
        fill="#a78bfa" filter="url(#glow2)" />

      {/* VR value label at marker */}
      <rect x={xToLPx(x) + 7} y={vrToLPy(vrCurrentClamped) - 14} width={54} height={16} rx={4}
        fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth={0.5} />
      <text x={xToLPx(x) + 34} y={vrToLPy(vrCurrentClamped) - 3} textAnchor="middle"
        fontSize={9} fill="#a78bfa" fontWeight={700} fontFamily="monospace">
        {vrCurrent.toFixed(2)}%
      </text>

      {/* VR Legend */}
      <rect x={LP.x + LP.w - 108} y={LP.y + 6} width={104} height={96} rx={6}
        fill="rgba(9,9,11,0.88)" stroke="#27272a" strokeWidth={0.5} />
      {vrConfigs.map((cfg, i) => (
        <g key={`lgl${i}`}>
          <line x1={LP.x + LP.w - 100} y1={LP.y + 20 + i * 20} x2={LP.x + LP.w - 82} y2={LP.y + 20 + i * 20}
            stroke={cfg.color} strokeWidth={2} />
          <text x={LP.x + LP.w - 78} y={LP.y + 24 + i * 20} fontSize={8} fill={cfg.color}>{cfg.label}</text>
        </g>
      ))}
      <g>
        <line x1={LP.x + LP.w - 100} y1={LP.y + 80} x2={LP.x + LP.w - 82} y2={LP.y + 80}
          stroke="#a78bfa" strokeWidth={2.5} />
        <text x={LP.x + LP.w - 78} y={LP.y + 84} fontSize={8} fill="#a78bfa">Selected PF</text>
      </g>

      {/* Axis labels */}
      <text x={LP.x + LP.w / 2} y={LP.y + LP.h + 26} textAnchor="middle" fontSize={9} fill="#52525b">Load Fraction x (p.u.)</text>
      <text x={LP.x - 32} y={LP.y + LP.h / 2} textAnchor="middle" fontSize={9} fill="#52525b"
        transform={`rotate(-90,${LP.x - 32},${LP.y + LP.h / 2})`}>VR (%)</text>

      {/* ── RIGHT PLOT: Efficiency vs Load ── */}
      <rect x={RP.x} y={RP.y} width={RP.w} height={RP.h} rx={4} fill="#0c0c10" stroke="#1e1e2e" strokeWidth={0.5} />
      <text x={RP.x + RP.w / 2} y={RP.y - 10} textAnchor="middle" fontSize={11} fontWeight={600} fill="#d4d4d8">
        Efficiency vs Load
      </text>

      {/* Eff grid lines */}
      {effTicks.map((e) => (
        <g key={`effg${e}`}>
          <line x1={RP.x} y1={effToRPy(e)} x2={RP.x + RP.w} y2={effToRPy(e)} stroke="#1a1a24" strokeWidth={0.5} />
          <text x={RP.x - 5} y={effToRPy(e) + 4} textAnchor="end" fontSize={8} fill="#52525b" fontFamily="monospace">{e}%</text>
        </g>
      ))}
      {xTicks.map((xx) => (
        <g key={`rxg${xx}`}>
          <line x1={xToRPx(xx)} y1={RP.y} x2={xToRPx(xx)} y2={RP.y + RP.h} stroke="#1a1a24" strokeWidth={0.5} />
          <text x={xToRPx(xx)} y={RP.y + RP.h + 13} textAnchor="middle" fontSize={8} fill="#52525b">{xx}</text>
        </g>
      ))}

      {/* Gradient fill under efficiency curve */}
      <path d={effFillPath} fill="url(#effGrad)" />

      {/* Efficiency curve */}
      <polyline points={effPolyline} fill="none" stroke="#6366f1" strokeWidth={2.5} strokeLinejoin="round" />

      {/* Max efficiency vertical dashed line */}
      {xOptClamped <= X_MAX && (
        <g>
          <line x1={xToRPx(xOptClamped)} y1={RP.y} x2={xToRPx(xOptClamped)} y2={RP.y + RP.h}
            stroke="#22c55e" strokeWidth={1.2} strokeDasharray="5 4" />
          <circle cx={xToRPx(xOptClamped)} cy={effToRPy(effMaxClamped)} r={5} fill="#22c55e" filter="url(#glow2)" />
          {/* η_max label */}
          <rect x={xToRPx(xOptClamped) - 62} y={RP.y + 5} width={60} height={28} rx={5}
            fill="rgba(34,197,94,0.12)" stroke="#22c55e" strokeWidth={0.5} />
          <text x={xToRPx(xOptClamped) - 32} y={RP.y + 16} textAnchor="middle" fontSize={8} fill="#22c55e" fontWeight={700}>η_max</text>
          <text x={xToRPx(xOptClamped) - 32} y={RP.y + 27} textAnchor="middle" fontSize={7} fill="#22c55e" fontFamily="monospace">
            x={xOptClamped.toFixed(2)}
          </text>
        </g>
      )}

      {/* All-day efficiency annotation */}
      <rect x={RP.x + 6} y={RP.y + 6} width={92} height={24} rx={5}
        fill="rgba(6,182,212,0.08)" stroke="#06b6d4" strokeWidth={0.5} />
      <text x={RP.x + 52} y={RP.y + 15} textAnchor="middle" fontSize={7.5} fill="#06b6d4" fontWeight={600}>All-Day Eff.</text>
      <text x={RP.x + 52} y={RP.y + 25} textAnchor="middle" fontSize={7} fill="#06b6d4" fontFamily="monospace">
        {(() => {
          // Approximate all-day efficiency (load cycle: 50% for 6h, 100% for 10h, 25% for 8h)
          const cycles = [{ x: 0.5, h: 6 }, { x: 1.0, h: 10 }, { x: 0.25, h: 8 }];
          let totalOut = 0, totalIn = 0;
          cycles.forEach(({ x: xx, h }) => {
            const out = xx * S_kVA * cosφ * h;
            const pcu = xx * xx * Pc * h;
            const pin = Pi * h;
            totalOut += out;
            totalIn += out + pin + pcu;
          });
          return totalIn > 0 ? (totalOut / totalIn * 100).toFixed(1) + '%' : '--';
        })()}
      </text>

      {/* Current operating point dot on efficiency plot */}
      <line x1={xToRPx(x)} y1={RP.y} x2={xToRPx(x)} y2={RP.y + RP.h}
        stroke="#a78bfa" strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
      <circle className="pulseDot" cx={xToRPx(x)} cy={effToRPy(effCurrentClamped)} r={5}
        fill="#a78bfa" filter="url(#glow2)" />
      <rect x={xToRPx(x) + 7} y={effToRPy(effCurrentClamped) - 14} width={52} height={16} rx={4}
        fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth={0.5} />
      <text x={xToRPx(x) + 33} y={effToRPy(effCurrentClamped) - 3} textAnchor="middle"
        fontSize={9} fill="#a78bfa" fontWeight={700} fontFamily="monospace">
        {effCurrent.toFixed(1)}%
      </text>

      {/* Axis labels */}
      <text x={RP.x + RP.w / 2} y={RP.y + RP.h + 26} textAnchor="middle" fontSize={9} fill="#52525b">Load Fraction x (p.u.)</text>
      <text x={RP.x - 32} y={RP.y + RP.h / 2} textAnchor="middle" fontSize={9} fill="#52525b"
        transform={`rotate(-90,${RP.x - 32},${RP.y + RP.h / 2})`}>η (%)</text>

      {/* ── POWER FLOW SANKEY BAR ── */}
      {(() => {
        const barY = BY + 8;
        const outW = Math.max(4, outFrac * BW);
        const cuW = Math.max(4, cuFrac * BW);
        const feW = Math.max(4, feFrac * BW);
        const totalW = outW + cuW + feW;
        const scale = BW / totalW;
        const oW = outW * scale;
        const cW = cuW * scale;
        const fW = feW * scale;
        return (
          <g>
            <text x={BX + BW / 2} y={barY - 6} textAnchor="middle" fontSize={9} fill="#52525b" fontWeight={600}>
              Power Flow at x = {x.toFixed(2)} (proportional)
            </text>
            {/* Output bar */}
            <rect x={BX} y={barY} width={oW} height={BH} rx={0} fill="url(#outGrad)" />
            {oW > 60 && (
              <>
                <text x={BX + oW / 2} y={barY + BH / 2 - 4} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={600}>Output</text>
                <text x={BX + oW / 2} y={barY + BH / 2 + 8} textAnchor="middle" fontSize={8} fill="#bbf7d0" fontFamily="monospace">
                  {outputCurrent.toFixed(1)} kW
                </text>
              </>
            )}
            {/* Copper loss bar */}
            <rect x={BX + oW} y={barY} width={cW} height={BH} fill="url(#cuGrad)" />
            {cW > 50 && (
              <>
                <text x={BX + oW + cW / 2} y={barY + BH / 2 - 4} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={600}>Cu Loss</text>
                <text x={BX + oW + cW / 2} y={barY + BH / 2 + 8} textAnchor="middle" fontSize={8} fill="#fef3c7" fontFamily="monospace">
                  {(Pc * x * x).toFixed(1)} kW
                </text>
              </>
            )}
            {/* Iron loss bar */}
            <rect x={BX + oW + cW} y={barY} width={fW} height={BH} rx={0} fill="url(#feGrad)" />
            {fW > 40 && (
              <>
                <text x={BX + oW + cW + fW / 2} y={barY + BH / 2 - 4} textAnchor="middle" fontSize={9} fill="#fff" fontWeight={600}>Fe Loss</text>
                <text x={BX + oW + cW + fW / 2} y={barY + BH / 2 + 8} textAnchor="middle" fontSize={8} fill="#fecaca" fontFamily="monospace">
                  {Pi.toFixed(1)} kW
                </text>
              </>
            )}
            {/* Bar legend labels outside */}
            <rect x={BX} y={barY + BH} width={BW} height={1} fill="#1e1e2e" />
            <circle cx={BX + 8} cy={barY + BH + 10} r={4} fill="#22c55e" />
            <text x={BX + 16} y={barY + BH + 14} fontSize={8} fill="#a1a1aa">Output Power</text>
            <circle cx={BX + 100} cy={barY + BH + 10} r={4} fill="#f59e0b" />
            <text x={BX + 108} y={barY + BH + 14} fontSize={8} fill="#a1a1aa">Copper Loss (∝ x²)</text>
            <circle cx={BX + 230} cy={barY + BH + 10} r={4} fill="#ef4444" />
            <text x={BX + 238} y={barY + BH + 14} fontSize={8} fill="#a1a1aa">Iron Loss (constant)</text>
          </g>
        );
      })()}
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Transformer Voltage Regulation & Efficiency</h2>
      <p style={S.p}>
        A transformer's performance is characterised by two key metrics: <strong style={{ color: '#e4e4e7' }}>voltage regulation (VR)</strong>,
        which measures how much the secondary voltage changes between no-load and full-load, and
        <strong style={{ color: '#e4e4e7' }}> efficiency (η)</strong>, which quantifies how much of the
        input power is delivered usefully to the load. Both quantities depend on the load level, power
        factor, and the transformer's equivalent circuit parameters.
      </p>

      <h3 style={S.h3}>1. Voltage Regulation — Definition</h3>
      <p style={S.p}>
        Voltage regulation is defined as the fractional (or percentage) change in secondary terminal
        voltage as the load is varied from no-load to full-load at a given power factor, with the
        primary voltage held constant:
      </p>
      <div style={S.eq}>VR = (V₂,NL − V₂,FL) / V₂,FL × 100%</div>
      <p style={S.p}>
        Equivalently, referred to the primary side, it is computed using the equivalent circuit
        impedance parameters.
      </p>

      <h3 style={S.h3}>2. Approximate VR Formula — Phasor Derivation</h3>
      <p style={S.p}>
        Using the equivalent circuit (all referred to primary), with V₂ as reference and load current
        I at angle −φ (lagging), the primary voltage phasor is:
      </p>
      <div style={S.eq}>V₁ = V₂ + I(R_eq cosφ + X_eq sinφ) + jI(X_eq cosφ − R_eq sinφ)</div>
      <p style={S.p}>
        Taking the magnitude and subtracting V₂, and normalising by the rated values (per-unit), the
        approximate formula in terms of load fraction x is:
      </p>
      <div style={S.eq}>VR ≈ x·(Rpu·cosφ + Xpu·sinφ) + x²·(Xpu·cosφ − Rpu·sinφ)² / 2</div>
      <p style={S.p}>
        The first term is the <strong style={{ color: '#e4e4e7' }}>resistive-reactive drop</strong> (dominant),
        and the second term is a small second-order correction from the imaginary component. This formula
        is accurate to within ±0.1% for typical transformer parameters.
      </p>

      <h3 style={S.h3}>3. Effect of Power Factor on VR</h3>
      <p style={S.p}>
        The sign and magnitude of VR depend critically on the load power factor:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#f59e0b' }}>Lagging PF (inductive load):</strong> Both Rpu·cosφ and
          Xpu·sinφ are positive, giving the highest positive VR. The secondary voltage falls significantly
          from no-load to full-load. Typical distribution transformer VR is 2–5% at rated load, 0.85 lag.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#22c55e' }}>Unity PF (resistive load):</strong> sinφ = 0, so VR is
          determined only by the resistive drop Rpu·cosφ. Lower than lagging case.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#60a5fa' }}>Leading PF (capacitive load):</strong> sinφ is effectively
          negative. The Xpu·sinφ term subtracts from Rpu·cosφ, and can dominate to give{' '}
          <strong style={{ color: '#e4e4e7' }}>negative VR</strong> — meaning the secondary voltage at
          full-load exceeds the no-load voltage. This is analogous to the Ferranti effect but in a
          transformer context, caused by capacitive load feeding reactive power back into the system.
        </li>
      </ul>

      <h3 style={S.h3}>4. Efficiency Expression</h3>
      <p style={S.p}>
        Transformer losses consist of two components:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Iron (Core) losses P_i:</strong> Hysteresis and eddy-current
          losses in the core. These are essentially <strong style={{ color: '#e4e4e7' }}>constant</strong> at
          rated voltage regardless of load, since core flux is fixed by the applied voltage.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Copper (Winding) losses P_cu:</strong> I²R losses in primary
          and secondary windings. These are proportional to <strong style={{ color: '#e4e4e7' }}>current squared</strong>,
          hence to load fraction squared: P_cu(x) = x² × P_c (full-load copper loss).
        </li>
      </ul>
      <p style={S.p}>
        At load fraction x (ratio of actual load current to rated current) and power factor cosφ:
      </p>
      <div style={S.eq}>η = x·S·cosφ / (x·S·cosφ + P_i + x²·P_c) × 100%</div>
      <p style={S.p}>
        where S is the rated kVA, P_i and P_c are in kW (or same unit as x·S·cosφ).
      </p>

      <h3 style={S.h3}>5. Maximum Efficiency Condition</h3>
      <p style={S.p}>
        To find the load fraction x at which efficiency is maximum, differentiate η with respect to x
        and set dη/dx = 0. Equivalently, we minimise total losses for a given output:
      </p>
      <div style={S.eq}>d/dx [P_i + x²·P_c] = 0 subject to fixed output → P_i = x²·P_c</div>
      <p style={S.p}>
        This yields the maximum efficiency condition: <strong style={{ color: '#c4b5fd' }}>iron losses equal
        copper losses</strong>. Solving for x:
      </p>
      <div style={S.eq}>x_opt = √(P_i / P_c)</div>
      <div style={S.eq}>η_max = x_opt·S·cosφ / (x_opt·S·cosφ + 2·P_i) × 100%</div>
      <p style={S.p}>
        This is a fundamental result: maximum efficiency occurs when the constant losses (iron) equal
        the variable losses (copper). For a typical distribution transformer with P_i = 50 kW and
        P_c = 100 kW, x_opt = √(50/100) = 0.707, i.e., maximum efficiency at 70.7% of full load.
      </p>

      <h3 style={S.h3}>6. All-Day Efficiency</h3>
      <p style={S.p}>
        Instantaneous efficiency at full load is not the only metric of interest for distribution
        transformers, which operate at variable loads over a 24-hour cycle. The{' '}
        <strong style={{ color: '#e4e4e7' }}>All-Day Efficiency</strong> (also called energy efficiency) is:
      </p>
      <div style={S.eq}>η_all-day = ΣOutput (kWh) / ΣInput (kWh) over 24 hours</div>
      <p style={S.p}>
        For a distribution transformer, iron losses run continuously for all 24 hours regardless of
        load. Copper losses accumulate only during loaded hours. This is why distribution transformers
        are designed with lower iron losses (and higher copper losses) compared to power transformers —
        they spend most of their life lightly loaded, so minimising constant iron losses improves
        all-day efficiency even if peak efficiency is slightly lower.
      </p>
      <div style={S.ctx}>
        <span style={S.ctxT}>AP Transco Context — 25 MVA 132/33 kV Power Transformers</span>
        <p style={S.ctxP}>
          AP Transco's 25 MVA, 132/33 kV power transformers at grid substations such as Vijayawada,
          Guntur, and Tirupati typically exhibit iron losses of approximately 25 kW and full-load
          copper losses of around 120 kW. This gives x_opt = √(25/120) ≈ 0.456, meaning maximum
          efficiency occurs at about 45.6% of rated load (≈ 11.4 MVA). With typical loading factors
          of 60–80% during peak hours and 20–30% at off-peak, these transformers operate near their
          efficiency sweet spot for much of the day. The overall efficiency at rated load (cos φ = 0.85)
          exceeds 99.4%, consistent with BEE (Bureau of Energy Efficiency) Star-1 label requirements
          for transformers above 10 MVA. AP Transco has been progressively retrofitting older,
          higher-loss transformers under the RDSS scheme to reduce aggregate distribution losses
          below 12% by 2025-26.
        </p>
      </div>

      <h3 style={S.h3}>7. Typical Performance Data</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Rating</th>
            <th style={S.th}>Iron Loss (kW)</th>
            <th style={S.th}>Cu Loss FL (kW)</th>
            <th style={S.th}>x_opt</th>
            <th style={S.th}>η at FL, 0.85 pf</th>
            <th style={S.th}>Rpu</th>
            <th style={S.th}>Xpu</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['100 kVA, 11/0.4 kV', '0.27', '1.8', '0.39', '97.8%', '0.018', '0.040'],
            ['500 kVA, 33/11 kV', '1.0', '5.5', '0.43', '98.5%', '0.016', '0.050'],
            ['2 MVA, 33/11 kV', '3.2', '18', '0.42', '98.9%', '0.014', '0.055'],
            ['10 MVA, 132/33 kV', '14', '75', '0.43', '99.2%', '0.013', '0.060'],
            ['25 MVA, 132/33 kV', '25', '120', '0.46', '99.4%', '0.012', '0.062'],
            ['100 MVA, 220/132 kV', '70', '380', '0.43', '99.6%', '0.010', '0.070'],
          ].map(([r, pi, pc, xo, eff, rpu, xpu]) => (
            <tr key={r}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{r}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{pi}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{pc}</td>
              <td style={{ ...S.td, fontFamily: 'monospace', color: '#22c55e' }}>{xo}</td>
              <td style={{ ...S.td, fontFamily: 'monospace', color: '#6366f1', fontWeight: 700 }}>{eff}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{rpu}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{xpu}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>8. Per-Unit Parameters — Physical Meaning</h3>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Rpu (per-unit resistance):</strong> Ratio of full-load
          copper loss to rated kVA. Rpu = P_c / S_rated. For a 25 MVA transformer with 120 kW copper
          loss: Rpu = 120/25000 = 0.0048. A lower Rpu means less I²R heating and lower VR, but larger,
          heavier windings.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Xpu (per-unit reactance):</strong> The leakage reactance,
          which determines the voltage regulation under reactive loads and limits short-circuit current.
          Higher Xpu reduces fault current but increases VR at lagging PF. BIS standards (IS 2026)
          specify Xpu in the range 0.04–0.12 for power transformers.
        </li>
      </ul>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>S.K. Chapman, <em>"Electric Machinery Fundamentals"</em>, McGraw-Hill, 5th Edition, Ch. 2</li>
        <li style={S.li}>B.L. Theraja & A.K. Theraja, <em>"A Textbook of Electrical Technology"</em>, Vol. II, Ch. 31</li>
        <li style={S.li}>BIS IS 2026 — <em>"Power Transformers"</em>, Parts 1–5</li>
        <li style={S.li}>Bureau of Energy Efficiency (BEE), <em>"Star Labelling Programme for Distribution Transformers"</em></li>
        <li style={S.li}>CEA — <em>"Technical Standards for Connectivity, Grid Standards and Performance of Generating Stations"</em></li>
        <li style={S.li}>AP Transco — <em>"Annual Report 2022-23: Transformation Loss Reduction under RDSS"</em></li>
      </ul>
    </div>
  );
}

export default function TransformerRegulationEfficiency() {
  const [tab, setTab] = useState('simulate');
  const [x, setX] = useState(1.0);
  const [cosφ, setCosφ] = useState(0.85);
  const [Rpu, setRpu] = useState(0.015);
  const [Xpu, setXpu] = useState(0.06);
  const [Pi, setPi] = useState(50);   // kW
  const [Pc, setPc] = useState(100);  // kW

  const S_kVA = 1000;

  const results = useMemo(() => {
    const vrPct = (() => {
      const sinφ = Math.sqrt(1 - cosφ * cosφ);
      const term1 = x * (Rpu * cosφ + Xpu * sinφ);
      const term2 = (x * x * Math.pow(Xpu * cosφ - Rpu * sinφ, 2)) / 2;
      return (term1 + term2) * 100;
    })();
    const eff = (() => {
      const output = x * S_kVA * cosφ;
      const pcu = x * x * Pc;
      const denom = output + Pi + pcu;
      return denom > 0 ? (output / denom) * 100 : 0;
    })();
    const xOpt = Math.sqrt(Pi / Pc);
    const effMax = (() => {
      const output = xOpt * S_kVA * cosφ;
      return (output / (output + 2 * Pi)) * 100;
    })();
    const pcuW = x * x * Pc * 1000;
    const piW = Pi * 1000;
    return { vrPct, eff, xOpt, effMax, pcuW, piW };
  }, [x, cosφ, Rpu, Xpu, Pi, Pc]);

  const vrColor = results.vrPct < 0 ? '#60a5fa' : results.vrPct > 5 ? '#ef4444' : '#22c55e';
  const effColor = results.eff > 98 ? '#22c55e' : results.eff > 95 ? '#f59e0b' : '#ef4444';

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram x={x} cosφ={cosφ} Rpu={Rpu} Xpu={Xpu} Pi={Pi} Pc={Pc} />
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>VR%</span>
              <span style={{ ...S.rv, color: vrColor }}>{results.vrPct.toFixed(2)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Efficiency η</span>
              <span style={{ ...S.rv, color: effColor }}>{results.eff.toFixed(2)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>x_opt (max eff.)</span>
              <span style={{ ...S.rv, color: '#22c55e' }}>{results.xOpt.toFixed(3)}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>η_max</span>
              <span style={{ ...S.rv, color: '#22c55e' }}>{results.effMax.toFixed(2)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Iron Loss P_i</span>
              <span style={{ ...S.rv, color: '#ef4444' }}>{results.piW.toFixed(0)} W</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Cu Loss P_cu</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{results.pcuW.toFixed(0)} W</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Load x (p.u.)</span>
              <input type="range" min={0} max={1.5} step={0.05} value={x}
                onChange={(e) => setX(+e.target.value)} style={S.slider} />
              <span style={S.val}>{x.toFixed(2)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>cos φ</span>
              <input type="range" min={0.5} max={1.0} step={0.01} value={cosφ}
                onChange={(e) => setCosφ(+e.target.value)} style={S.slider} />
              <span style={S.val}>{cosφ.toFixed(2)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>R_pu</span>
              <input type="range" min={0.005} max={0.05} step={0.001} value={Rpu}
                onChange={(e) => setRpu(+e.target.value)} style={S.slider} />
              <span style={S.val}>{Rpu.toFixed(3)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>X_pu</span>
              <input type="range" min={0.02} max={0.15} step={0.005} value={Xpu}
                onChange={(e) => setXpu(+e.target.value)} style={S.slider} />
              <span style={S.val}>{Xpu.toFixed(3)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Iron Loss P_i (kW)</span>
              <input type="range" min={10} max={200} step={1} value={Pi}
                onChange={(e) => setPi(+e.target.value)} style={S.slider} />
              <span style={S.val}>{Pi}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Cu Loss P_c (kW)</span>
              <input type="range" min={20} max={300} step={5} value={Pc}
                onChange={(e) => setPc(+e.target.value)} style={S.slider} />
              <span style={S.val}>{Pc}</span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
