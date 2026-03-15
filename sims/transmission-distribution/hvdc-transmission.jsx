import React, { useState, useMemo } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '16px 16px 8px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 8 },
  label: { fontSize: 12, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 120, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 50, textAlign: 'right' },
  btn: (a) => ({ padding: '4px 10px', borderRadius: 6, border: a ? '1px solid #6366f1' : '1px solid #27272a', background: a ? 'rgba(99,102,241,0.15)' : 'transparent', color: a ? '#a5b4fc' : '#71717a', fontSize: 11, cursor: 'pointer', fontWeight: a ? 600 : 400, transition: 'all 0.15s', outline: 'none' }),
  bg: { display: 'flex', gap: 3 },
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

const HVDC_COST_BASE = 0.12;
const HVDC_COST_PER_KM = 0.0003;
const HVAC_COST_BASE = 0.04;
const HVAC_COST_PER_KM = 0.0006;

const HVDC_LOSS_PER_KM = 0.003;
const HVAC_LOSS_PER_KM = 0.008;
const HVDC_CONVERTER_LOSS = 0.015;

function compute(distKm, powerMW, voltKV, tech, cableType) {
  const isCable = cableType === 'cable';
  const hvdcBase = isCable ? HVDC_COST_BASE * 2.5 : HVDC_COST_BASE;
  const hvacBase = isCable ? HVAC_COST_BASE * 4 : HVAC_COST_BASE;
  const hvdcPerKm = isCable ? HVDC_COST_PER_KM * 2 : HVDC_COST_PER_KM;
  const hvacPerKm = isCable ? HVAC_COST_PER_KM * 1.8 : HVAC_COST_PER_KM;

  const N = 50;
  const dists = Array.from({ length: N + 1 }, (_, i) => i * 20);
  const hvdcCosts = dists.map(d => (hvdcBase + hvdcPerKm * d) * powerMW);
  const hvacCosts = dists.map(d => (hvacBase + hvacPerKm * d) * powerMW);

  let breakeven = 0;
  for (let d = 0; d < 1000; d += 1) {
    const hdc = (hvdcBase + hvdcPerKm * d) * powerMW;
    const hac = (hvacBase + hvacPerKm * d) * powerMW;
    if (hdc <= hac) { breakeven = d; break; }
  }
  if (breakeven === 0) breakeven = isCable ? 50 : 600;

  const hvdcLineLoss = distKm * HVDC_LOSS_PER_KM;
  const hvdcTotalLoss = hvdcLineLoss + HVDC_CONVERTER_LOSS * 2;
  const hvacTotalLoss = distKm * HVAC_LOSS_PER_KM;
  const hvdcLossMW = powerMW * hvdcTotalLoss / 100;
  const hvacLossMW = powerMW * hvacTotalLoss / 100;
  const hvdcDelivered = powerMW - hvdcLossMW;
  const hvacDelivered = powerMW - hvacLossMW;
  const hvdcEff = (hvdcDelivered / powerMW) * 100;
  const hvacEff = (hvacDelivered / powerMW) * 100;

  const hvdcCost = (hvdcBase + hvdcPerKm * distKm) * powerMW;
  const hvacCost = (hvacBase + hvacPerKm * distKm) * powerMW;
  const cheaper = hvdcCost < hvacCost ? 'HVDC' : 'HVAC';

  const dcCurrent = powerMW * 1000 / voltKV;
  const reactiveComp = tech === 'lcc' ? powerMW * 0.5 : 0;
  const converterStations = tech === 'lcc' ? 2 : 2;

  return {
    dists, hvdcCosts, hvacCosts, breakeven,
    hvdcLossMW, hvacLossMW, hvdcEff, hvacEff,
    hvdcCost, hvacCost, cheaper,
    dcCurrent, reactiveComp, converterStations,
    hvdcDelivered, hvacDelivered,
    hvdcTotalLoss, hvacTotalLoss,
  };
}

function SLD({ tech, powerMW, voltKV, distKm, data }) {
  const W = 940, H = 280;
  const isLCC = tech === 'lcc';
  const col = isLCC ? '#f97316' : '#8b5cf6';
  const techLabel = isLCC ? 'LCC-HVDC' : 'VSC-HVDC';

  const acCol = '#3b82f6';
  const dcCol = col;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <defs>
        <filter id="hgl"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <marker id="arr-dc" viewBox="0 0 10 6" refX="9" refY="3" markerWidth="8" markerHeight="5" orient="auto">
          <polygon points="0,0 10,3 0,6" fill={dcCol} />
        </marker>
        <marker id="arr-ac" viewBox="0 0 10 6" refX="9" refY="3" markerWidth="8" markerHeight="5" orient="auto">
          <polygon points="0,0 10,3 0,6" fill={acCol} />
        </marker>
      </defs>

      <text x={W / 2} y={18} textAnchor="middle" fontSize={12} fill="#d4d4d8" fontWeight={700}>{techLabel} Transmission — {voltKV} kV, {distKm} km</text>

      {/* AC System A */}
      <rect x={30} y={60} width={100} height={80} rx={10} fill="#111114" stroke={acCol} strokeWidth={1.2} />
      <text x={80} y={85} textAnchor="middle" fontSize={10} fill={acCol} fontWeight={700}>AC System A</text>
      <text x={80} y={100} textAnchor="middle" fontSize={9} fill="#71717a">Generation</text>
      <text x={80} y={115} textAnchor="middle" fontSize={9} fill="#71717a">{powerMW} MW</text>
      <path d={`M60,125 Q70,135 80,125 Q90,115 100,125`} fill="none" stroke={acCol} strokeWidth={1} opacity={0.5} />

      {/* Arrow A → Rect */}
      <line x1={130} y1={100} x2={195} y2={100} stroke={acCol} strokeWidth={1.5} markerEnd="url(#arr-ac)" />
      <text x={162} y={93} textAnchor="middle" fontSize={8} fill="#71717a">3φ AC</text>

      {/* Rectifier */}
      <rect x={200} y={55} width={110} height={90} rx={8} fill="#18181b" stroke={col} strokeWidth={1.5} />
      <text x={255} y={75} textAnchor="middle" fontSize={10} fill={col} fontWeight={700}>Rectifier</text>
      <text x={255} y={90} textAnchor="middle" fontSize={9} fill="#71717a">{isLCC ? 'Thyristor' : 'IGBT'}</text>
      <text x={255} y={104} textAnchor="middle" fontSize={9} fill="#71717a">{isLCC ? '12-pulse' : 'MMC'}</text>

      {isLCC ? (
        <g transform="translate(230, 108)">
          {[0, 16, 32].map(dx => (
            <g key={dx}>
              <polygon points={`${dx + 2},18 ${dx + 12},18 ${dx + 7},8`} fill="none" stroke={col} strokeWidth={0.8} />
              <line x1={dx + 7} y1={8} x2={dx + 7} y2={3} stroke={col} strokeWidth={0.7} />
              <line x1={dx + 4} y1={3} x2={dx + 10} y2={3} stroke={col} strokeWidth={0.7} />
            </g>
          ))}
        </g>
      ) : (
        <g transform="translate(235, 110)">
          <rect x={0} y={0} width={40} height={22} rx={3} fill="none" stroke={col} strokeWidth={0.8} />
          <text x={20} y={14} textAnchor="middle" fontSize={7} fill={col}>IGBT Module</text>
          <circle cx={10} cy={7} r={2} fill={col} opacity={0.4} />
          <circle cx={20} cy={7} r={2} fill={col} opacity={0.4} />
          <circle cx={30} cy={7} r={2} fill={col} opacity={0.4} />
        </g>
      )}

      {/* DC line with animated particles */}
      <line x1={310} y1={100} x2={620} y2={100} stroke={dcCol} strokeWidth={3} opacity={0.3} />
      <line x1={310} y1={100} x2={620} y2={100} stroke={dcCol} strokeWidth={1.5} />

      {[0, 1, 2, 3, 4].map(i => (
        <circle key={i} r={4} fill={dcCol} opacity={0.7} filter="url(#hgl)">
          <animateMotion dur="3s" begin={`${i * 0.6}s`} repeatCount="indefinite" path={`M310,100 L620,100`} />
        </circle>
      ))}

      <text x={465} y={90} textAnchor="middle" fontSize={10} fill={dcCol} fontWeight={600}>±{voltKV} kV DC</text>
      <text x={465} y={115} textAnchor="middle" fontSize={8} fill="#52525b">{distKm} km</text>
      <text x={465} y={127} textAnchor="middle" fontSize={8} fill="#52525b">I = {data.dcCurrent.toFixed(0)} A</text>

      {/* Labels above/below DC */}
      <text x={370} y={80} textAnchor="middle" fontSize={7} fill="#22c55e" opacity={0.7}>No reactive power</text>
      <text x={560} y={80} textAnchor="middle" fontSize={7} fill="#22c55e" opacity={0.7}>No skin effect</text>

      {/* Inverter */}
      <rect x={625} y={55} width={110} height={90} rx={8} fill="#18181b" stroke={col} strokeWidth={1.5} />
      <text x={680} y={75} textAnchor="middle" fontSize={10} fill={col} fontWeight={700}>Inverter</text>
      <text x={680} y={90} textAnchor="middle" fontSize={9} fill="#71717a">{isLCC ? 'Thyristor' : 'IGBT'}</text>
      <text x={680} y={104} textAnchor="middle" fontSize={9} fill="#71717a">{isLCC ? '12-pulse' : 'MMC'}</text>

      {isLCC ? (
        <g transform="translate(655, 108)">
          {[0, 16, 32].map(dx => (
            <g key={dx}>
              <polygon points={`${dx + 2},8 ${dx + 12},8 ${dx + 7},18`} fill="none" stroke={col} strokeWidth={0.8} />
              <line x1={dx + 7} y1={18} x2={dx + 7} y2={23} stroke={col} strokeWidth={0.7} />
              <line x1={dx + 4} y1={23} x2={dx + 10} y2={23} stroke={col} strokeWidth={0.7} />
            </g>
          ))}
        </g>
      ) : (
        <g transform="translate(660, 110)">
          <rect x={0} y={0} width={40} height={22} rx={3} fill="none" stroke={col} strokeWidth={0.8} />
          <text x={20} y={14} textAnchor="middle" fontSize={7} fill={col}>IGBT Module</text>
          <circle cx={10} cy={7} r={2} fill={col} opacity={0.4} />
          <circle cx={20} cy={7} r={2} fill={col} opacity={0.4} />
          <circle cx={30} cy={7} r={2} fill={col} opacity={0.4} />
        </g>
      )}

      {/* Arrow Inv → AC B */}
      <line x1={735} y1={100} x2={800} y2={100} stroke={acCol} strokeWidth={1.5} markerEnd="url(#arr-ac)" />
      <text x={768} y={93} textAnchor="middle" fontSize={8} fill="#71717a">3φ AC</text>

      {/* AC System B */}
      <rect x={805} y={60} width={100} height={80} rx={10} fill="#111114" stroke={acCol} strokeWidth={1.2} />
      <text x={855} y={85} textAnchor="middle" fontSize={10} fill={acCol} fontWeight={700}>AC System B</text>
      <text x={855} y={100} textAnchor="middle" fontSize={9} fill="#71717a">Load Center</text>
      <text x={855} y={115} textAnchor="middle" fontSize={9} fill="#71717a">{data.hvdcDelivered.toFixed(0)} MW</text>
      <path d={`M835,125 Q845,135 855,125 Q865,115 875,125`} fill="none" stroke={acCol} strokeWidth={1} opacity={0.5} />

      {/* Reactive compensation for LCC */}
      {isLCC && data.reactiveComp > 0 && (
        <>
          <line x1={255} y1={145} x2={255} y2={175} stroke="#f59e0b" strokeWidth={0.8} strokeDasharray="3 2" />
          <rect x={225} y={175} width={60} height={24} rx={4} fill="#111114" stroke="#f59e0b" strokeWidth={0.8} />
          <text x={255} y={190} textAnchor="middle" fontSize={7} fill="#f59e0b">Filter + Qcomp</text>
          <text x={255} y={210} textAnchor="middle" fontSize={7} fill="#71717a">{data.reactiveComp.toFixed(0)} MVAr</text>

          <line x1={680} y1={145} x2={680} y2={175} stroke="#f59e0b" strokeWidth={0.8} strokeDasharray="3 2" />
          <rect x={650} y={175} width={60} height={24} rx={4} fill="#111114" stroke="#f59e0b" strokeWidth={0.8} />
          <text x={680} y={190} textAnchor="middle" fontSize={7} fill="#f59e0b">Filter + Qcomp</text>
          <text x={680} y={210} textAnchor="middle" fontSize={7} fill="#71717a">{data.reactiveComp.toFixed(0)} MVAr</text>
        </>
      )}

      {/* Loss comparison bar */}
      <rect x={130} y={240} width={680} height={30} rx={6} fill="#111114" stroke="#27272a" strokeWidth={0.6} />
      <text x={142} y={252} fontSize={8} fill="#71717a" fontWeight={600}>HVDC Loss:</text>
      <rect x={220} y={247} width={Math.min(200, data.hvdcTotalLoss * 30)} height={10} rx={3} fill={col} opacity={0.6} />
      <text x={225 + Math.min(200, data.hvdcTotalLoss * 30)} y={256} fontSize={8} fill={col} fontWeight={600}>{data.hvdcTotalLoss.toFixed(2)}%</text>

      <text x={480} y={252} fontSize={8} fill="#71717a" fontWeight={600}>HVAC Loss:</text>
      <rect x={545} y={247} width={Math.min(200, data.hvacTotalLoss * 30)} height={10} rx={3} fill={acCol} opacity={0.5} />
      <text x={550 + Math.min(200, data.hvacTotalLoss * 30)} y={256} fontSize={8} fill={acCol} fontWeight={600}>{data.hvacTotalLoss.toFixed(2)}%</text>
    </svg>
  );
}

function CostChart({ data, distKm }) {
  const W = 420, H = 220;
  const ML = 55, MR = 15, MT = 20, MB = 35;
  const PW = W - ML - MR, PH = H - MT - MB;

  const maxDist = 1000;
  const maxCost = Math.max(...data.hvdcCosts, ...data.hvacCosts) * 1.05;
  const p = n => n.toFixed(1);
  const xS = d => ML + (d / maxDist) * PW;
  const yS = c => MT + PH * (1 - c / maxCost);

  const hvdcLine = data.dists.map((d, i) => `${i ? 'L' : 'M'}${p(xS(d))},${p(yS(data.hvdcCosts[i]))}`).join(' ');
  const hvacLine = data.dists.map((d, i) => `${i ? 'L' : 'M'}${p(xS(d))},${p(yS(data.hvacCosts[i]))}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 400, height: 'auto' }}>
      <text x={W / 2} y={14} textAnchor="middle" fontSize={9} fill="#a1a1aa" fontWeight={600}>HVDC vs HVAC Cost Comparison</text>

      {[0, 200, 400, 600, 800, 1000].map(d => (
        <g key={`xc${d}`}>
          <line x1={xS(d)} y1={MT} x2={xS(d)} y2={MT + PH} stroke="#1e1e2e" strokeWidth={0.4} />
          <text x={xS(d)} y={MT + PH + 13} textAnchor="middle" fontSize={8} fill="#52525b">{d}</text>
        </g>
      ))}
      {Array.from({ length: 5 }, (_, i) => (i * maxCost) / 4).map(c => (
        <g key={`yc${c}`}>
          <line x1={ML} y1={yS(c)} x2={W - MR} y2={yS(c)} stroke="#1e1e2e" strokeWidth={0.4} />
          <text x={ML - 4} y={yS(c) + 3} textAnchor="end" fontSize={7} fill="#3f3f46">{(c / 1000).toFixed(0)}B</text>
        </g>
      ))}

      <path d={hvdcLine} fill="none" stroke="#f97316" strokeWidth={2} />
      <path d={hvacLine} fill="none" stroke="#3b82f6" strokeWidth={2} />

      {data.breakeven > 0 && data.breakeven < maxDist && (
        <>
          <line x1={xS(data.breakeven)} y1={MT} x2={xS(data.breakeven)} y2={MT + PH} stroke="#22c55e" strokeWidth={1} strokeDasharray="4 3" />
          <text x={xS(data.breakeven)} y={MT + PH + 28} textAnchor="middle" fontSize={8} fill="#22c55e" fontWeight={600}>Breakeven: {data.breakeven} km</text>
        </>
      )}

      <line x1={xS(distKm)} y1={MT} x2={xS(distKm)} y2={MT + PH} stroke="#a78bfa" strokeWidth={1} strokeDasharray="2 3" opacity={0.6} />
      <circle cx={xS(distKm)} cy={yS((data.hvdcCost + data.hvacCost) / 2)} r={3} fill="#a78bfa" />

      <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="#3f3f46" strokeWidth={0.8} />
      <line x1={ML} y1={MT + PH} x2={W - MR} y2={MT + PH} stroke="#3f3f46" strokeWidth={0.8} />

      <text x={ML + PW / 2} y={H - 2} textAnchor="middle" fontSize={8} fill="#3f3f46">Distance (km)</text>
      <text x={12} y={MT + PH / 2} textAnchor="middle" fontSize={8} fill="#3f3f46" transform={`rotate(-90 12 ${MT + PH / 2})`}>Cost ($M)</text>

      <g transform={`translate(${ML + PW - 120}, ${MT + 4})`}>
        <rect width={115} height={32} rx={4} fill="#09090b" opacity={0.92} stroke="#27272a" strokeWidth={0.4} />
        <line x1={6} y1={10} x2={18} y2={10} stroke="#f97316" strokeWidth={2} />
        <text x={22} y={13} fontSize={7.5} fill="#a1a1aa">HVDC</text>
        <line x1={6} y1={22} x2={18} y2={22} stroke="#3b82f6" strokeWidth={2} />
        <text x={22} y={25} fontSize={7.5} fill="#a1a1aa">HVAC</text>
        <line x1={60} y1={10} x2={72} y2={10} stroke="#22c55e" strokeWidth={1} strokeDasharray="3 2" />
        <text x={76} y={13} fontSize={7.5} fill="#a1a1aa">Breakeven</text>
      </g>
    </svg>
  );
}

function TheorySVGHVDC() {
  return (
    <svg viewBox="0 0 760 300" style={{ width: '100%', maxWidth: 760, height: 'auto', margin: '20px 0' }}>
      <rect width="760" height="300" rx="12" fill="#111114" stroke="#27272a" />
      <text x="380" y="28" textAnchor="middle" fill="#d4d4d8" fontSize={14} fontWeight={700}>HVDC Transmission — System Single-Line Diagram</text>

      {/* AC System 1 */}
      <circle cx="80" cy="120" r="28" fill="none" stroke="#6366f1" strokeWidth={2} />
      <text x="80" y="118" textAnchor="middle" fill="#a5b4fc" fontSize={9} fontWeight={600}>AC</text>
      <text x="80" y="130" textAnchor="middle" fill="#a5b4fc" fontSize={8}>System 1</text>
      <text x="80" y="160" textAnchor="middle" fill="#52525b" fontSize={8}>50 Hz</text>

      {/* Transformer 1 */}
      <line x1="108" y1="120" x2="140" y2="120" stroke="#52525b" strokeWidth={2} />
      <circle cx="150" cy="120" r="10" fill="none" stroke="#818cf8" strokeWidth={1.5} />
      <circle cx="166" cy="120" r="10" fill="none" stroke="#818cf8" strokeWidth={1.5} />

      {/* Rectifier */}
      <line x1="176" y1="120" x2="210" y2="120" stroke="#52525b" strokeWidth={2} />
      <rect x="210" y="96" width="60" height="48" rx="6" fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1.5} />
      <text x="240" y="116" textAnchor="middle" fill="#ef4444" fontSize={9} fontWeight={600}>Rectifier</text>
      <text x="240" y="130" textAnchor="middle" fill="#71717a" fontSize={7}>AC → DC</text>

      {/* DC Line */}
      <line x1="270" y1="108" x2="490" y2="108" stroke="#ef4444" strokeWidth={2.5} />
      <line x1="270" y1="132" x2="490" y2="132" stroke="#3b82f6" strokeWidth={2.5} />
      <text x="380" y="102" textAnchor="middle" fill="#ef4444" fontSize={8}>+ pole</text>
      <text x="380" y="148" textAnchor="middle" fill="#3b82f6" fontSize={8}>- pole (or ground return)</text>

      {/* Animated DC particles */}
      {[0, 1, 2, 3, 4].map(i => (
        <circle key={i} cx="270" cy="108" r="3" fill="#ef4444" opacity={0.8}>
          <animate attributeName="cx" values="270;490" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* DC line label */}
      <text x="380" y="126" textAnchor="middle" fill="#d4d4d8" fontSize={10} fontWeight={600}>HVDC Line (100-2000 km)</text>

      {/* Inverter */}
      <rect x="490" y="96" width="60" height="48" rx="6" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth={1.5} />
      <text x="520" y="116" textAnchor="middle" fill="#22c55e" fontSize={9} fontWeight={600}>Inverter</text>
      <text x="520" y="130" textAnchor="middle" fill="#71717a" fontSize={7}>DC → AC</text>

      {/* Transformer 2 */}
      <line x1="550" y1="120" x2="584" y2="120" stroke="#52525b" strokeWidth={2} />
      <circle cx="594" cy="120" r="10" fill="none" stroke="#818cf8" strokeWidth={1.5} />
      <circle cx="610" cy="120" r="10" fill="none" stroke="#818cf8" strokeWidth={1.5} />

      {/* AC System 2 */}
      <line x1="620" y1="120" x2="652" y2="120" stroke="#52525b" strokeWidth={2} />
      <circle cx="680" cy="120" r="28" fill="none" stroke="#6366f1" strokeWidth={2} />
      <text x="680" y="118" textAnchor="middle" fill="#a5b4fc" fontSize={9} fontWeight={600}>AC</text>
      <text x="680" y="130" textAnchor="middle" fill="#a5b4fc" fontSize={8}>System 2</text>
      <text x="680" y="160" textAnchor="middle" fill="#52525b" fontSize={8}>50/60 Hz</text>

      {/* Cost comparison */}
      <line x1="40" y1="190" x2="720" y2="190" stroke="#27272a" strokeWidth={0.5} />
      <text x="380" y="212" textAnchor="middle" fill="#d4d4d8" fontSize={12} fontWeight={700}>AC vs DC Cost Comparison</text>

      {/* AC cost line */}
      <line x1="100" y1="280" x2="660" y2="230" stroke="#6366f1" strokeWidth={2} />
      <text x="665" y="228" fill="#6366f1" fontSize={9}>AC total cost</text>

      {/* DC cost line */}
      <line x1="100" y1="260" x2="660" y2="240" stroke="#ef4444" strokeWidth={2} />
      <text x="665" y="243" fill="#ef4444" fontSize={9}>DC total cost</text>

      {/* Breakeven point */}
      <circle cx="420" cy="250" r="5" fill="#f59e0b" stroke="#f59e0b" strokeWidth={2} />
      <text x="420" y="268" textAnchor="middle" fill="#f59e0b" fontSize={10} fontWeight={700}>Breakeven Distance</text>
      <text x="420" y="280" textAnchor="middle" fill="#71717a" fontSize={8}>~600-800 km (overhead) | ~50 km (submarine)</text>

      {/* Axis labels */}
      <text x="100" y="292" fill="#52525b" fontSize={8}>0 km</text>
      <text x="660" y="292" textAnchor="end" fill="#52525b" fontSize={8}>Distance</text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>HVDC Transmission</h2>
      <p style={S.p}>
        High Voltage Direct Current (HVDC) transmission converts AC power to DC at a
        <strong style={{ color: '#e4e4e7' }}> rectifier station</strong>, transmits it over a DC line, and converts
        it back to AC at an <strong style={{ color: '#e4e4e7' }}>inverter station</strong>. While the converter
        stations are expensive, the DC transmission line itself is cheaper than an equivalent AC line (fewer
        conductors, narrower right-of-way, no reactive power losses, no skin effect). Beyond a
        <strong style={{ color: '#e4e4e7' }}> breakeven distance</strong>, HVDC becomes more economical than HVAC.
      </p>

      <TheorySVGHVDC />

      <h3 style={S.h3}>Why DC for Long-Distance Transmission?</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>No reactive power losses</strong> — AC lines generate
          and consume reactive power through their distributed capacitance and inductance. At 50 Hz, a 400 kV
          AC line of 300+ km length requires shunt reactors and series capacitors for reactive compensation.
          DC lines carry only real power — there is no concept of reactive power on a DC conductor.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>No stability limit</strong> — AC transmission is limited
          by the angular stability constraint: power transfer capability decreases as line length increases
          (P ∝ sin δ / X_L). DC power flow is controlled by converter firing angles, independent of line length
          or angle difference between the two AC systems.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>No skin effect</strong> — At DC (f = 0), current
          distributes uniformly across the conductor cross-section. The effective resistance equals the DC
          resistance, which is lower than the AC resistance. This means the conductor is utilized more
          efficiently.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Asynchronous interconnection</strong> — HVDC can
          connect two AC systems operating at different frequencies (50 Hz and 60 Hz) or systems that cannot
          be synchronized. This is critical for interconnecting regional grids or linking to offshore wind.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Fewer conductors</strong> — A bipolar HVDC line uses
          2 conductors vs 6 conductors for a double-circuit HVAC line of the same power capacity. This reduces
          tower size, right-of-way width, and visual impact.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Cable advantage</strong> — Submarine and underground
          cables have very high capacitance per km. AC cables beyond ~50 km require so much reactive compensation
          that the line can carry almost no real power. DC cables have no such limitation, making HVDC the only
          viable option for long submarine crossings.</li>
      </ul>
      <div style={S.eq}>AC stability limit: P_max = (V_s × V_r) / X_L × sin(δ) &nbsp;← decreases with distance</div>
      <div style={S.eq}>HVDC: P = V_dc × I_dc &nbsp;← independent of distance (minus I²R losses)</div>

      <h3 style={S.h3}>LCC vs VSC Converter Technology</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Parameter</th>
            <th style={S.th}>LCC (Line-Commutated)</th>
            <th style={S.th}>VSC (Voltage-Source)</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Switching device', 'Thyristor (SCR)', 'IGBT'],
            ['Commutation', 'Line (needs strong AC grid)', 'Self-commutated (forced)'],
            ['Topology', '6-pulse or 12-pulse bridge', 'Modular Multilevel Converter (MMC)'],
            ['Reactive power', 'Consumes 50–60% of P as Q', 'Independent P and Q control'],
            ['Filters required', 'Large AC & DC filters', 'Minimal filtering (MMC)'],
            ['Black start', 'No — needs AC voltage', 'Yes — can energize dead grid'],
            ['Power reversal', 'Voltage polarity reversal', 'Current reversal (XLPE cable OK)'],
            ['Converter loss', '0.7–0.8% per station', '0.9–1.2% per station'],
            ['Max rating (2024)', '±800 kV, 8,000 MW', '±525 kV, 2,600 MW'],
            ['Multiterminal', 'Difficult', 'Straightforward'],
            ['Typical application', 'Bulk power, long distance', 'Offshore wind, weak grids, multi-terminal'],
            ['India examples', 'All major HVDC links', 'Under consideration for offshore wind'],
          ].map(([p, lcc, vsc]) => (
            <tr key={p}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{p}</td>
              <td style={S.td}>{lcc}</td>
              <td style={S.td}>{vsc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>6-Pulse and 12-Pulse Converter Operation</h3>
      <p style={S.p}>
        The basic LCC converter is a 6-pulse bridge (Graetz bridge) using 6 thyristors. Each thyristor
        conducts for 120° of the AC cycle, and the output DC voltage has ripple at 6× the AC frequency
        (300 Hz for a 50 Hz system). The average DC output voltage is:
      </p>
      <div style={S.eq}>V_dc = (3√2 / π) × V_LL × cos(α) ≈ 1.35 × V_LL × cos(α)</div>
      <p style={S.p}>
        where V_LL is the line-to-line AC voltage and α is the firing angle (delay angle) of the thyristors.
        In rectifier mode, 0° {'<'} α {'<'} 90°; in inverter mode, 90° {'<'} α {'<'} 180° (often expressed
        as extinction angle γ = 180° − α).
      </p>
      <p style={S.p}>
        A 12-pulse converter uses two 6-pulse bridges fed by a Y-Y and a Y-Δ transformer, producing a 30°
        phase shift. The harmonics at 6n±1 (5th, 7th) from one bridge are cancelled by the harmonics from the
        other, leaving only 12n±1 (11th, 13th) harmonics — a much cleaner waveform with smaller filters.
      </p>
      <div style={S.eq}>12-pulse: Harmonics at n = 12k ± 1 &nbsp;(11th, 13th, 23rd, 25th, ...)</div>
      <div style={S.eq}>6-pulse: Harmonics at n = 6k ± 1 &nbsp;(5th, 7th, 11th, 13th, ...)</div>

      <h3 style={S.h3}>Breakeven Distance</h3>
      <p style={S.p}>
        HVDC has high fixed costs (converter stations at both ends) but low variable costs (cheaper line per km,
        lower losses). HVAC has low fixed costs but higher variable costs. The cost curves cross at the
        <strong style={{ color: '#e4e4e7' }}> breakeven distance</strong>:
      </p>
      <div style={S.eq}>Breakeven ≈ 600–800 km for overhead lines</div>
      <div style={S.eq}>Breakeven ≈ 40–80 km for submarine/underground cables</div>
      <p style={S.p}>
        The breakeven distance varies with power rating, technology, terrain, and local costs. For India's
        Green Energy Corridors, where RE must be evacuated 1,500–2,000 km from Rajasthan/Ladakh to
        demand centers in Maharashtra/Tamil Nadu, HVDC is clearly economical.
      </p>

      <h3 style={S.h3}>India's HVDC Links — Green Energy Corridors</h3>
      <p style={S.p}>
        India has the world's largest programme of HVDC transmission for renewable energy evacuation.
        The Green Energy Corridors connect RE-rich states (Rajasthan, Gujarat, Tamil Nadu, Andhra Pradesh)
        to load centers across the country:
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Link</th>
            <th style={S.th}>Voltage</th>
            <th style={S.th}>Capacity</th>
            <th style={S.th}>Distance</th>
            <th style={S.th}>Purpose</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Biswanath Chariali – Agra', '±800 kV', '6,000 MW', '1,728 km', 'Hydro evacuation from NE India'],
            ['Champa – Kurukshetra', '±800 kV', '3,000 MW', '1,365 km', 'Thermal surplus (Chhattisgarh → North)'],
            ['Raigarh – Pugalur', '±800 kV', '6,000 MW', '1,830 km', 'Thermal + solar evacuation'],
            ['Pugalur – Trichur (VSC)', '±320 kV', '2,000 MW', '~160 km', 'Submarine cable to islands (proposed)'],
            ['Bhadla – Fatehpur (GEC-II)', '±800 kV', '6,000 MW', '~1,100 km', 'Solar evacuation from Rajasthan'],
            ['Khavda – Bhuj (proposed)', '±800 kV', '9,000 MW', '~50 km + ISTS', 'RE from 30 GW Khavda park'],
            ['Leh–Ladakh – Grid (proposed)', '±600 kV', '4,000 MW', '~900 km', '13 GW Ladakh RE park evacuation'],
          ].map(([link, v, cap, dist, purpose]) => (
            <tr key={link}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{link}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{v}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{cap}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{dist}</td>
              <td style={S.td}>{purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>Back-to-Back HVDC for Asynchronous Interconnection</h3>
      <p style={S.p}>
        When two AC systems cannot be synchronized (different frequencies, or different system operators
        unwilling to synchronize), a back-to-back HVDC station performs AC→DC→AC conversion at a
        single location with no DC transmission line. India uses back-to-back HVDC for:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Vindhyachal</strong> (500 MW) — Interconnects
          Northern and Western grids (now synchronized under ONE grid, but the station remains for
          controllable power transfer).</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Sasaram</strong> (500 MW) — Eastern–Northern
          grid interconnection.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>India–Bangladesh</strong> (500 MW at Bheramara) —
          Cross-border asynchronous interconnection for power export from India.</li>
      </ul>

      <h3 style={S.h3}>VSC-HVDC for Offshore Wind</h3>
      <p style={S.p}>
        VSC-HVDC is the preferred technology for connecting offshore wind farms to the onshore grid:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Self-commutation</strong> — Offshore wind farms
          are weak AC systems with no reliable voltage source for commutation. VSC creates its own AC
          voltage, enabling connection to passive networks.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Reactive power control</strong> — VSC provides
          independent control of active and reactive power, supporting voltage regulation at the offshore
          platform.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>XLPE cables</strong> — VSC uses current reversal
          for power reversal (voltage polarity stays constant), making it compatible with extruded XLPE
          cables. LCC requires voltage reversal, which is incompatible with XLPE — it needs oil-filled
          mass-impregnated (MI) cables.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>India's offshore plans</strong> — MNRE has
          identified 70 GW of offshore wind potential off the coasts of Gujarat and Tamil Nadu. The first
          1 GW offshore project off Gujarat's coast will likely use VSC-HVDC for connection to the
          onshore grid at Pipavav or Jafarabad.</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>Real-World Context — Andhra Pradesh & PGCIL</span>
        <p style={S.ctxP}>
          The Raigarh–Pugalur ±800 kV HVDC link passes through Andhra Pradesh and serves as a critical
          corridor for transferring 6,000 MW of power from central India's coal belt to the southern grid.
          AP Transco receives power at the Pugalur terminal via the Southern Regional grid. PGCIL (now
          Power Grid Corporation of India Ltd) operates all inter-state HVDC links as part of the ISTS.
          For AP's own 10+ GW of solar and wind capacity in Kurnool, Anantapur, and Kadapa districts,
          Green Energy Corridor-II includes 765 kV AC lines and potential HVDC reinforcement to evacuate
          RE surplus to demand centers in Vijayawada, Hyderabad, and Chennai. The 400 kV Kurnool–Nandyal–Kadapa
          corridor is already approaching thermal limits during peak solar hours.
        </p>
      </div>

      <div style={S.ctx}>
        <span style={S.ctxT}>Simulation Assumptions</span>
        <p style={S.ctxP}>
          The cost model uses simplified linear functions: HVDC has a high base cost (converter stations)
          plus a low per-km cost, while HVAC has a low base cost plus a higher per-km cost. Actual costs
          vary significantly with terrain, conductor type, tower design, environmental clearances, and
          land acquisition costs (a major factor in India). Loss percentages are representative — actual
          losses depend on loading, temperature, conductor specifications, and converter technology. The
          breakeven distance is indicative; real project decisions consider reliability, controllability,
          right-of-way constraints, and strategic grid planning in addition to pure economics.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>PGCIL (Power Grid Corporation of India Ltd) — Annual Report 2023–24</li>
        <li style={S.li}>CEA — National Electricity Plan (Transmission), 2023</li>
        <li style={S.li}>CIGRE — Working Group B4 reports on HVDC and Power Electronics</li>
        <li style={S.li}>ABB / Hitachi Energy — HVDC Reference Projects and Technology Papers</li>
        <li style={S.li}>Siemens Energy — HVDC PLUS (VSC) Technology Description</li>
        <li style={S.li}>MNRE — Green Energy Corridor Phase-I and Phase-II Reports</li>
        <li style={S.li}>POSOCO (GRID-INDIA) — Inter-regional Power Transfer Data, 2023–24</li>
        <li style={S.li}>CERC — Sharing of Inter-State Transmission Charges Regulations</li>
        <li style={S.li}>IEC 62747 — Terminology for Voltage-Sourced Converters for HVDC Systems</li>
        <li style={S.li}>IEEE Std 1547 — Standard for Interconnection (for VSC grid-forming)</li>
      </ul>
    </div>
  );
}

export default function HVDCTransmission() {
  const [tab, setTab] = useState('simulate');
  const [distKm, setDistKm] = useState(800);
  const [powerMW, setPowerMW] = useState(3000);
  const [voltKV, setVoltKV] = useState(800);
  const [tech, setTech] = useState('lcc');
  const [cableType, setCableType] = useState('overhead');

  const data = useMemo(
    () => compute(distKm, powerMW, voltKV, tech, cableType),
    [distKm, powerMW, voltKV, tech, cableType]
  );

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 300 }}>
            <div style={{ ...S.svgWrap, flex: 1 }}>
              <SLD tech={tech} powerMW={powerMW} voltKV={voltKV} distKm={distKm} data={data} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0 16px 8px' }}>
              <CostChart data={data} distKm={distKm} />
            </div>
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>HVDC Loss</span>
              <span style={{ ...S.rv, color: '#f97316' }}>{data.hvdcTotalLoss.toFixed(2)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>HVAC Loss</span>
              <span style={{ ...S.rv, color: '#3b82f6' }}>{data.hvacTotalLoss.toFixed(2)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>HVDC Delivered</span>
              <span style={{ ...S.rv, color: '#22c55e' }}>{data.hvdcDelivered.toFixed(0)} MW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>HVAC Delivered</span>
              <span style={{ ...S.rv, color: '#22d3ee' }}>{data.hvacDelivered.toFixed(0)} MW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Breakeven</span>
              <span style={{ ...S.rv, color: '#a78bfa' }}>{data.breakeven} km</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Cheaper</span>
              <span style={{ ...S.rv, color: data.cheaper === 'HVDC' ? '#22c55e' : '#3b82f6' }}>{data.cheaper}</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Distance</span>
              <input type="range" min={50} max={2000} step={50} value={distKm}
                onChange={e => setDistKm(+e.target.value)} style={S.slider} />
              <span style={S.val}>{distKm} km</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Power</span>
              <input type="range" min={500} max={8000} step={500} value={powerMW}
                onChange={e => setPowerMW(+e.target.value)} style={S.slider} />
              <span style={S.val}>{powerMW} MW</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>DC Voltage</span>
              <div style={S.bg}>
                {[320, 500, 600, 800].map(v => (
                  <button key={v} style={S.btn(voltKV === v)} onClick={() => setVoltKV(v)}>±{v} kV</button>
                ))}
              </div>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Technology</span>
              <div style={S.bg}>
                <button style={S.btn(tech === 'lcc')} onClick={() => setTech('lcc')}>LCC</button>
                <button style={S.btn(tech === 'vsc')} onClick={() => setTech('vsc')}>VSC</button>
              </div>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Line Type</span>
              <div style={S.bg}>
                <button style={S.btn(cableType === 'overhead')} onClick={() => setCableType('overhead')}>Overhead</button>
                <button style={S.btn(cableType === 'cable')} onClick={() => setCableType('cable')}>Cable</button>
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
