import React, { useState, useMemo, useCallback } from 'react';

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

const PRICE = [
  2.8, 2.6, 2.4, 2.3, 2.4, 2.8,
  3.5, 4.2, 4.0, 3.6, 3.2, 2.8,
  2.5, 2.6, 2.8, 3.2, 3.8, 5.0,
  6.8, 7.5, 7.0, 5.5, 4.0, 3.2,
];

const DEMAND = [
  0.55, 0.50, 0.48, 0.46, 0.48, 0.55,
  0.65, 0.78, 0.82, 0.80, 0.76, 0.74,
  0.72, 0.74, 0.76, 0.80, 0.85, 0.92,
  1.00, 0.98, 0.92, 0.82, 0.70, 0.60,
];

const SOLAR_CF = [
  0, 0, 0, 0, 0, 0,
  0.04, 0.16, 0.38, 0.58, 0.76, 0.88,
  0.95, 0.92, 0.82, 0.66, 0.44, 0.18,
  0.03, 0, 0, 0, 0, 0,
];

const FREQ_BASE = 50.0;

function lerp(arr, h) {
  const i = Math.min(Math.floor(h), 23);
  const j = Math.min(i + 1, 23);
  return arr[i] + (h - i) * (arr[j] - arr[i]);
}

function compute(bessMW, bessHrs, solarMW, peakMW, mode, rte) {
  const bessCapMWh = bessMW * bessHrs;
  const N = 48;
  const dt = 0.5;
  const hours = Array.from({ length: N }, (_, i) => i * dt);

  const demand = hours.map(h => lerp(DEMAND, h) * peakMW);
  const solar = hours.map(h => lerp(SOLAR_CF, h) * solarMW);
  const netDemand = hours.map((_, i) => demand[i] - solar[i]);
  const price = hours.map(h => lerp(PRICE, h));

  const bessPower = new Array(N).fill(0);
  const socArr = new Array(N).fill(0);
  let soc = bessCapMWh * 0.2;

  if (mode === 'arbitrage') {
    for (let i = 0; i < N; i++) {
      const h = hours[i];
      if (h >= 10 && h < 15 && price[i] < 3.5) {
        const maxCharge = Math.min(bessMW, (bessCapMWh * 0.95 - soc) / (dt * Math.sqrt(rte / 100)));
        const charge = Math.max(0, maxCharge);
        bessPower[i] = -charge;
        soc += charge * dt * Math.sqrt(rte / 100);
      } else if (h >= 17 && h < 22 && price[i] > 4.5) {
        const maxDis = Math.min(bessMW, (soc - bessCapMWh * 0.1) / dt);
        const dis = Math.max(0, maxDis);
        bessPower[i] = dis * Math.sqrt(rte / 100);
        soc -= dis * dt;
      }
      socArr[i] = soc;
    }
  } else {
    const avgNet = netDemand.reduce((s, v) => s + v, 0) / N;
    for (let i = 0; i < N; i++) {
      const excess = netDemand[i] - avgNet;
      if (excess > 0) {
        const dis = Math.min(bessMW, excess, (soc - bessCapMWh * 0.1) / dt);
        const d = Math.max(0, dis);
        bessPower[i] = d * Math.sqrt(rte / 100);
        soc -= d * dt;
      } else if (excess < 0) {
        const charge = Math.min(bessMW, -excess, (bessCapMWh * 0.95 - soc) / (dt * Math.sqrt(rte / 100)));
        const c = Math.max(0, charge);
        bessPower[i] = -c;
        soc += c * dt * Math.sqrt(rte / 100);
      }
      socArr[i] = soc;
    }
  }

  const finalDemand = hours.map((_, i) => netDemand[i] - bessPower[i]);
  const peakBefore = Math.max(...netDemand);
  const peakAfter = Math.max(...finalDemand);
  const peakShaved = peakBefore - peakAfter;

  let revArb = 0, revAS = 0, energyCharged = 0, energyDischarged = 0;
  for (let i = 0; i < N; i++) {
    if (bessPower[i] > 0) {
      revArb += bessPower[i] * dt * price[i];
      energyDischarged += bessPower[i] * dt;
    } else if (bessPower[i] < 0) {
      revArb += bessPower[i] * dt * price[i];
      energyCharged += Math.abs(bessPower[i]) * dt;
    }
  }
  revAS = bessMW * 0.8 * 24;

  const freq = hours.map((_, i) => {
    const imbalance = (netDemand[i] - demand[i] * 0.95) / peakMW;
    const freqDev = imbalance * 2.0;
    const bessCorrection = bessPower[i] > 0 ? bessPower[i] / peakMW * 1.5 : bessPower[i] / peakMW * 1.5;
    return FREQ_BASE - freqDev + bessCorrection * 0.3;
  });

  const cycles = energyDischarged / Math.max(bessCapMWh, 0.01);

  return {
    hours, demand, solar, netDemand, bessPower, socArr, finalDemand, price, freq,
    peakBefore, peakAfter, peakShaved, revArb, revAS,
    energyCharged, energyDischarged, cycles, bessCapMWh,
    socMin: Math.min(...socArr),
    socMax: Math.max(...socArr),
  };
}

function Chart({ d, bessCapMWh }) {
  const { hours, demand, netDemand, bessPower, socArr, finalDemand } = d;
  const N = hours.length;
  const W = 920, H = 440;
  const ML = 58, MR = 16, MT = 25, MB = 48;
  const PW = W - ML - MR, PH = H - MT - MB;

  const midY = MT + PH * 0.6;
  const topH = PH * 0.6;
  const botH = PH * 0.4;

  const pMax = Math.ceil(Math.max(...demand, ...netDemand.map(Math.abs), ...finalDemand) / 50) * 50 + 20;
  const bMax = Math.max(Math.max(...bessPower.map(Math.abs)), 1);

  const p = n => n.toFixed(1);
  const xS = h => ML + (h / 24) * PW;
  const yP = v => MT + topH * (1 - v / pMax);
  const yB = v => midY + botH * 0.5 - (v / bMax) * botH * 0.45;

  const line = (arr, yFn) => arr.map((v, i) => `${i ? 'L' : 'M'}${p(xS(hours[i]))},${p(yFn(v))}`).join(' ');

  const bessArea = bessPower.map((v, i) => {
    const x = xS(hours[i]);
    return i === 0 ? `M${p(x)},${p(yB(0))} L${p(x)},${p(yB(v))}` : `L${p(x)},${p(yB(v))}`;
  }).join(' ') + ` L${p(xS(hours[N - 1]))},${p(yB(0))} Z`;

  const socPH = 50;
  const socY0 = H - MB + 6;
  const socYFn = v => socY0 - (v / Math.max(bessCapMWh, 1)) * socPH;

  const socLine = socArr.map((v, i) => `${i ? 'L' : 'M'}${p(xS(hours[i]))},${p(socYFn(v))}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H + socPH - 20}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <defs>
        <clipPath id="bess-clip"><rect x={ML} y={MT} width={PW} height={PH + socPH + 10} /></clipPath>
        <linearGradient id="chg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#22c55e" stopOpacity="0.5" /><stop offset="1" stopColor="#22c55e" stopOpacity="0.1" /></linearGradient>
        <linearGradient id="dis" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ef4444" stopOpacity="0.5" /><stop offset="1" stopColor="#ef4444" stopOpacity="0.1" /></linearGradient>
      </defs>

      <rect x={xS(17)} y={MT} width={xS(22) - xS(17)} height={topH} fill="#f5920815" rx={4} />
      <text x={xS(19.5)} y={MT + 12} textAnchor="middle" fontSize={8} fill="#f59e0b" opacity={0.5}>Peak Hours</text>

      <rect x={xS(10)} y={MT} width={xS(15) - xS(10)} height={topH} fill="#22c55e10" rx={4} />
      <text x={xS(12.5)} y={MT + 12} textAnchor="middle" fontSize={8} fill="#22c55e" opacity={0.5}>Solar Surplus</text>

      {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => (
        <g key={`x${h}`}>
          <line x1={xS(h)} y1={MT} x2={xS(h)} y2={midY + botH} stroke="#1e1e2e" strokeWidth={0.5} />
          <text x={xS(h)} y={midY + botH + 14} textAnchor="middle" fontSize={9} fill="#52525b">{String(h).padStart(2, '0')}:00</text>
        </g>
      ))}

      {Array.from({ length: 6 }, (_, i) => i * pMax / 5).map(v => (
        <g key={`yp${v}`}>
          <line x1={ML} y1={yP(v)} x2={W - MR} y2={yP(v)} stroke="#1e1e2e" strokeWidth={0.4} />
          <text x={ML - 5} y={yP(v) + 3} textAnchor="end" fontSize={8} fill="#3f3f46">{v.toFixed(0)}</text>
        </g>
      ))}

      <text x={14} y={MT + topH / 2} textAnchor="middle" fontSize={9} fill="#3f3f46" transform={`rotate(-90 14 ${MT + topH / 2})`}>Power (MW)</text>

      <g clipPath="url(#bess-clip)">
        <path d={line(demand, yP)} fill="none" stroke="#71717a" strokeWidth={1.3} strokeDasharray="5 3" />
        <path d={line(netDemand, yP)} fill="none" stroke="#f97316" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5} />
        <path d={line(finalDemand, yP)} fill="none" stroke="#22d3ee" strokeWidth={2.5} strokeLinejoin="round" />

        {bessPower.map((v, i) => {
          if (Math.abs(v) < 0.5) return null;
          const x = xS(hours[i]);
          const w = PW / N * 0.8;
          const y0 = yB(0);
          const y1 = yB(v);
          return <rect key={i} x={x - w / 2} y={Math.min(y0, y1)} width={w} height={Math.abs(y1 - y0)} fill={v > 0 ? '#ef4444' : '#22c55e'} opacity={0.55} rx={1} />;
        })}

        <line x1={ML} y1={yB(0)} x2={W - MR} y2={yB(0)} stroke="#3f3f46" strokeWidth={0.5} />
      </g>

      <line x1={ML} y1={MT} x2={ML} y2={midY + botH} stroke="#3f3f46" strokeWidth={1} />
      <line x1={ML} y1={midY + botH} x2={W - MR} y2={midY + botH} stroke="#3f3f46" strokeWidth={1} />

      <text x={14} y={midY + botH * 0.2} textAnchor="middle" fontSize={8} fill="#3f3f46" transform={`rotate(-90 14 ${midY + botH * 0.3})`}>BESS MW</text>
      <text x={W - MR + 2} y={yB(bMax * 0.7)} fontSize={7} fill="#22c55e" opacity={0.6}>Chg</text>
      <text x={W - MR + 2} y={yB(-bMax * 0.7)} fontSize={7} fill="#ef4444" opacity={0.6}>Dis</text>

      <text x={ML + PW / 2} y={midY + botH + 28} textAnchor="middle" fontSize={10} fill="#3f3f46">Hour of Day</text>

      <g transform={`translate(${W - MR - 175}, ${MT + 4})`}>
        <rect width={172} height={66} rx={6} fill="#09090b" opacity={0.92} stroke="#27272a" strokeWidth={0.5} />
        <line x1={8} y1={11} x2={20} y2={11} stroke="#71717a" strokeWidth={1.3} strokeDasharray="4 2" />
        <text x={26} y={14} fontSize={8} fill="#a1a1aa">Gross Demand</text>
        <line x1={8} y1={24} x2={20} y2={24} stroke="#f97316" strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={26} y={27} fontSize={8} fill="#a1a1aa">Net Demand (no BESS)</text>
        <line x1={8} y1={37} x2={20} y2={37} stroke="#22d3ee" strokeWidth={2.5} />
        <text x={26} y={40} fontSize={8} fill="#a1a1aa">Final Demand (with BESS)</text>
        <rect x={8} y={47} width={12} height={6} rx={1} fill="#22c55e" opacity={0.6} />
        <text x={26} y={53} fontSize={8} fill="#a1a1aa">Charging</text>
        <rect x={80} y={47} width={12} height={6} rx={1} fill="#ef4444" opacity={0.6} />
        <text x={98} y={53} fontSize={8} fill="#a1a1aa">Discharging</text>
      </g>
    </svg>
  );
}

function SoCGauge({ soc, cap }) {
  const pct = cap > 0 ? (soc / cap) * 100 : 0;
  const W = 120, H = 70;
  const barW = 50, barH = 44;
  const bx = (W - barW) / 2, by = 8;
  const fillH = (barH - 4) * (pct / 100);
  const col = pct > 80 ? '#22c55e' : pct > 40 ? '#f59e0b' : pct > 15 ? '#f97316' : '#ef4444';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 110, height: 65 }}>
      <rect x={bx + 14} y={by - 4} width={22} height={5} rx={2} fill="#3f3f46" />
      <rect x={bx} y={by} width={barW} height={barH} rx={5} fill="none" stroke="#3f3f46" strokeWidth={1.5} />
      <rect x={bx + 2} y={by + 2 + (barH - 4 - fillH)} width={barW - 4} height={fillH} rx={3} fill={col} opacity={0.7} />
      <text x={W / 2} y={by + barH / 2 + 4} textAnchor="middle" fontSize={13} fill="#fff" fontWeight={700} fontFamily="monospace">{pct.toFixed(0)}%</text>
      <text x={W / 2} y={by + barH + 14} textAnchor="middle" fontSize={8} fill="#71717a">{soc.toFixed(1)} / {cap.toFixed(0)} MWh</text>
    </svg>
  );
}

function FreqDemo({ bessMW }) {
  const W = 280, H = 100;
  const ML = 35, MR = 10, MT = 15, MB = 18;
  const PW = W - ML - MR, PH = H - MT - MB;

  const gasResponse = Array.from({ length: 60 }, (_, t) => {
    if (t < 5) return 50.0;
    if (t < 8) return 50.0 - 0.3;
    const rec = Math.min(1, (t - 8) / 40);
    return 50.0 - 0.3 * (1 - rec * 0.85);
  });

  const bessResponse = Array.from({ length: 60 }, (_, t) => {
    if (t < 5) return 50.0;
    if (t < 6) return 50.0 - 0.15;
    const rec = Math.min(1, (t - 6) / 4);
    return 50.0 - 0.15 * (1 - rec * 0.95);
  });

  const xS = t => ML + (t / 60) * PW;
  const yS = v => MT + PH * (1 - (v - 49.5) / 1.0);

  const linePath = arr => arr.map((v, i) => `${i ? 'L' : 'M'}${xS(i).toFixed(1)},${yS(v).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 260, height: 'auto' }}>
      <text x={W / 2} y={10} textAnchor="middle" fontSize={8} fill="#71717a" fontWeight={600}>Frequency Response: BESS vs Gas Turbine</text>
      {[49.5, 49.7, 50.0, 50.3].map(f => (
        <g key={f}>
          <line x1={ML} y1={yS(f)} x2={W - MR} y2={yS(f)} stroke="#1e1e2e" strokeWidth={0.4} />
          <text x={ML - 4} y={yS(f) + 3} textAnchor="end" fontSize={7} fill="#3f3f46">{f.toFixed(1)}</text>
        </g>
      ))}
      <line x1={ML} y1={yS(49.9)} x2={W - MR} y2={yS(49.9)} stroke="#ef4444" strokeDasharray="3 3" opacity={0.3} />
      <text x={W - MR - 2} y={yS(49.9) - 3} textAnchor="end" fontSize={6} fill="#ef4444" opacity={0.5}>49.9 Hz threshold</text>

      <path d={linePath(gasResponse)} fill="none" stroke="#f97316" strokeWidth={1.3} strokeDasharray="4 2" />
      <path d={linePath(bessResponse)} fill="none" stroke="#22c55e" strokeWidth={2} />

      <line x1={xS(5)} y1={MT} x2={xS(5)} y2={MT + PH} stroke="#ef4444" strokeDasharray="2 3" opacity={0.4} />
      <text x={xS(5)} y={MT + PH + 12} textAnchor="middle" fontSize={6} fill="#ef4444" opacity={0.6}>Load event</text>

      <text x={ML + PW / 2} y={H - 2} textAnchor="middle" fontSize={7} fill="#3f3f46">Time (seconds)</text>

      <rect x={ML + 4} y={MT + 2} width={85} height={22} rx={3} fill="#09090b" opacity={0.9} stroke="#27272a" strokeWidth={0.4} />
      <line x1={ML + 8} y1={MT + 9} x2={ML + 18} y2={MT + 9} stroke="#22c55e" strokeWidth={2} />
      <text x={ML + 22} y={MT + 12} fontSize={6.5} fill="#a1a1aa">BESS (~200 ms)</text>
      <line x1={ML + 8} y1={MT + 19} x2={ML + 18} y2={MT + 19} stroke="#f97316" strokeWidth={1.3} strokeDasharray="3 2" />
      <text x={ML + 22} y={MT + 22} fontSize={6.5} fill="#a1a1aa">Gas Turbine (~5 min)</text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Battery Energy Storage Systems (BESS)</h2>
      <p style={S.p}>
        A Battery Energy Storage System (BESS) stores electrical energy in electrochemical cells and dispatches
        it on demand. In the context of power grids, BESS provides fast-responding, bidirectional power capability
        — absorbing surplus generation during low-demand periods and injecting power during peak demand or
        contingency events. Unlike conventional generators, BESS responds in <strong style={{ color: '#e4e4e7' }}>milliseconds</strong>,
        making it uniquely suited for frequency regulation, peak shaving, and renewable energy integration.
      </p>

      <h3 style={S.h3}>Li-ion Cell Chemistry</h3>
      <p style={S.p}>
        Grid-scale BESS predominantly uses lithium-ion chemistries. The cell converts chemical energy to
        electrical energy through intercalation — lithium ions shuttle between cathode and anode through
        an electrolyte during charge and discharge:
      </p>
      <div style={S.eq}>Cathode: LiFePO₄ ⇌ FePO₄ + Li⁺ + e⁻ &nbsp;&nbsp;(LFP example)</div>
      <div style={S.eq}>Anode: C₆ + Li⁺ + e⁻ ⇌ LiC₆</div>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Chemistry</th>
            <th style={S.th}>Energy Density</th>
            <th style={S.th}>Cycle Life</th>
            <th style={S.th}>Safety</th>
            <th style={S.th}>Grid Use</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['LFP (LiFePO₄)', '100–160 Wh/kg', '3,000–6,000', 'High', 'Dominant for grid; CATL, BYD'],
            ['NMC (Ni-Mn-Co)', '150–220 Wh/kg', '1,500–3,000', 'Moderate', 'Used where space is limited'],
            ['LTO (Li₄Ti₅O₁₂)', '50–80 Wh/kg', '10,000–20,000', 'Very High', 'Fast-cycling applications'],
            ['NaS (Sodium-Sulfur)', '150 Wh/kg', '2,500', 'Requires heat', 'NGK; deployed at few sites in India'],
          ].map(([c, e, cy, sa, gu]) => (
            <tr key={c}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{c}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{e}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{cy}</td>
              <td style={S.td}>{sa}</td>
              <td style={S.td}>{gu}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>C-Rate and Cycle Life Trade-off</h3>
      <p style={S.p}>
        The <strong style={{ color: '#e4e4e7' }}>C-rate</strong> defines the charge/discharge rate relative to capacity.
        A 100 MWh battery at C/2 discharges at 50 MW for 2 hours; at 1C, it delivers 100 MW for 1 hour.
        Higher C-rates accelerate degradation:
      </p>
      <div style={S.eq}>C-rate = P_discharge (MW) / E_capacity (MWh)</div>
      <div style={S.eq}>Cycle life at 0.5C ≈ 5,000 cycles (LFP) → at 2C ≈ 2,000 cycles</div>
      <p style={S.p}>
        Grid BESS typically operates at C/2 to C/4 for energy applications (peak shaving, arbitrage) and up to 2C
        for power applications (frequency regulation). SECI and NTPC tenders typically specify 2–4 hour duration,
        corresponding to C/2 to C/4.
      </p>

      <h3 style={S.h3}>Round-Trip Efficiency (RTE)</h3>
      <p style={S.p}>
        Not all energy stored can be retrieved. Losses occur in the battery cells (internal resistance, heat),
        power electronics (DC-DC converter, inverter), and auxiliary systems (cooling, BMS). RTE is the ratio
        of energy delivered to energy absorbed:
      </p>
      <div style={S.eq}>η_RTE = E_discharged / E_charged × 100%</div>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Li-ion (LFP)</strong>: 86–92% RTE at rated conditions</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Li-ion (NMC)</strong>: 88–94% RTE</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Pumped Hydro</strong>: 75–82% RTE</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Compressed Air (CAES)</strong>: 50–70% RTE</li>
      </ul>
      <p style={S.p}>
        RTE degrades with calendar aging, cycling, and temperature extremes. A 10-year-old LFP system may
        have RTE of 82–85% compared to 90% when new. SECI tender specifications typically guarantee minimum
        85% RTE over the contract period.
      </p>

      <h3 style={S.h3}>Degradation and State of Health</h3>
      <p style={S.p}>
        Battery capacity fades over time due to two mechanisms:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Calendar aging</strong> — Capacity loss even
          without cycling, driven by temperature and state of charge (SoC). Keeping SoC between 20–80%
          significantly slows calendar degradation.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Cycle aging</strong> — Capacity loss proportional
          to cumulative energy throughput. Depth of discharge (DoD) and C-rate are key factors. A cycle at
          90% DoD degrades roughly 3× faster than a cycle at 50% DoD.</li>
      </ul>
      <div style={S.eq}>SoH(t) ≈ 1 − (α × √t + β × N_eq)</div>
      <p style={S.p}>
        where α is the calendar aging coefficient, t is time, β is the cycle aging coefficient, and N_eq is
        the number of equivalent full cycles. End-of-life (EoL) is typically defined as 80% of original
        nameplate capacity (State of Health = 80%). For grid-scale LFP, this is typically reached at
        3,500–5,000 equivalent full cycles or 15–20 years.
      </p>

      <h3 style={S.h3}>BESS Applications in Power Systems</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Application</th>
            <th style={S.th}>Response</th>
            <th style={S.th}>Duration</th>
            <th style={S.th}>Revenue Stream</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Frequency Regulation', '<200 ms', '15–30 min', 'Ancillary services market (₹/MW/hr)'],
            ['Peak Shaving', '1–5 s', '2–4 hours', 'Avoided demand charges, capacity deferral'],
            ['Energy Arbitrage', 'Minutes', '2–6 hours', 'Buy low (off-peak), sell high (peak)'],
            ['RE Firming', 'Seconds', '1–4 hours', 'Firm RE PPA; higher tariff than variable RE'],
            ['Black Start', '<1 min', '1–2 hours', 'Grid restoration services'],
            ['T&D Deferral', 'N/A', '2–6 hours', 'Avoided infrastructure investment'],
          ].map(([app, resp, dur, rev]) => (
            <tr key={app}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{app}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{resp}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{dur}</td>
              <td style={S.td}>{rev}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>India's BESS Landscape</h3>
      <p style={S.p}>
        India is rapidly deploying grid-scale BESS as part of its strategy to integrate 500 GW of
        non-fossil fuel capacity by 2030. Key developments:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>SECI tenders</strong> — Solar Energy Corporation
          of India has tendered multiple GWh-scale BESS projects. The landmark 500 MW / 1,000 MWh tender in
          2022 at Rajnandgaon (Chhattisgarh) achieved a storage tariff of ₹3.50–3.60/kWh.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>NTPC projects</strong> — NTPC commissioned India's
          first grid-scale BESS at Simhadri (Andhra Pradesh) — 10 MW / 40 MWh using Li-ion, for
          peak shaving and renewable firming.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Hybrid RE + Storage</strong> — MNRE promotes
          "round-the-clock" (RTC) RE supply contracts combining solar, wind, and BESS to provide
          dispatchable RE at ₹3.00–3.60/kWh.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>CEA targets</strong> — Central Electricity Authority's
          National Electricity Plan (2023) projects 18.8 GW / 73.9 GWh of BESS by 2031–32, primarily for
          RE integration and peak demand management.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Viability Gap Funding (VGF)</strong> — Government
          approved ₹3,760 crore VGF for 4,000 MWh BESS capacity to bring down storage costs to grid parity.</li>
      </ul>

      <h3 style={S.h3}>BESS vs Pumped Storage Hydro (PSH)</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Parameter</th>
            <th style={S.th}>BESS (Li-ion)</th>
            <th style={S.th}>Pumped Hydro</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Response time', '<200 ms', '60–90 seconds'],
            ['Duration', '1–4 hours', '6–12 hours'],
            ['Round-trip efficiency', '86–92%', '75–82%'],
            ['Land footprint', 'Compact (container)', 'Large (reservoir)'],
            ['Lifespan', '15–20 years', '50–80 years'],
            ['Capital cost (2024)', '$200–350/kWh', '$50–150/kWh (at scale)'],
            ['Environmental impact', 'Mining, disposal', 'Land, ecosystem disruption'],
            ['India capacity', '~0.5 GW operational', '4.7 GW operational'],
            ['India potential', 'Unlimited (manufacturing)', '96 GW identified sites'],
          ].map(([p, b, ps]) => (
            <tr key={p}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{p}</td>
              <td style={S.td}>{b}</td>
              <td style={S.td}>{ps}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>CERC Regulations on Energy Storage</h3>
      <p style={S.p}>
        The Central Electricity Regulatory Commission (CERC) has established a regulatory framework
        for energy storage in India:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Electricity Act 2003 Amendment (2022)</strong> — Formally
          defined "energy storage" including BESS, pumped hydro, compressed air, and other technologies.
          ESS treated as an asset class distinct from generation, transmission, or distribution.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>CERC ESS Regulations (2024)</strong> — Framework for
          ESS participation in wholesale electricity markets, ancillary services, and capacity markets.
          Allows ESS to stack multiple revenue streams.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>General Network Access (GNA)</strong> — ESS can obtain
          connectivity to the ISTS (Inter-State Transmission System) for charging from one source and
          discharging to another, enabling geographic arbitrage.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Ancillary Services</strong> — BESS eligible for
          primary (automatic) and secondary (AGC) frequency response markets. Payment rates of
          ₹8–12/MW/hour for regulation services.</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>Real-World Context — Andhra Pradesh</span>
        <p style={S.ctxP}>
          NTPC's Simhadri BESS (10 MW / 40 MWh) in Visakhapatnam was India's first large grid-scale
          battery storage project, commissioned in 2021 using Samsung SDI NMC cells. It is co-located
          with the 2,000 MW Simhadri thermal station and is used for peak shaving and frequency regulation.
          AP Transco has identified 400 kV substations at Kurnool, Anantapur, and Kadapa as potential BESS
          locations for managing solar intermittency from the 4+ GW solar capacity in Rayalaseema region.
          APSPDCL has proposed 50 MW / 200 MWh BESS at the 220 kV Orvakal substation near Kurnool Ultra
          Mega Solar Park to firm evening power supply. The state's solar-rich western districts see
          midday surplus exceeding 2 GW, creating significant opportunities for storage arbitrage.
        </p>
      </div>

      <div style={S.ctx}>
        <span style={S.ctxT}>Simulation Assumptions</span>
        <p style={S.ctxP}>
          This simulation models a simplified BESS dispatch at a state-level substation bus. Arbitrage mode
          charges during midday low-price hours (10:00–15:00) and discharges during evening high-price hours
          (17:00–22:00). Peak-shaving mode attempts to flatten the net demand curve. Energy prices are
          representative of Indian Energy Exchange (IEX) day-ahead market patterns. Round-trip efficiency
          losses are modeled as √η applied symmetrically to charge and discharge. SoC is bounded between
          10–95% of nameplate. Revenue from ancillary services is estimated at ₹0.80/MW/hr based on CERC
          AS market data. The frequency response demo is conceptual — actual grid frequency dynamics involve
          complex governor and AGC interactions across thousands of generators.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Central Electricity Authority (CEA) — National Electricity Plan (Generation), 2023</li>
        <li style={S.li}>CERC — Framework for Energy Storage Systems, 2024</li>
        <li style={S.li}>SECI — Tender for 500 MW / 1,000 MWh BESS, Rajnandgaon (2022)</li>
        <li style={S.li}>NTPC — Simhadri BESS Project Report, 2021</li>
        <li style={S.li}>MNRE — Guidelines for Implementation of Battery Energy Storage Systems, 2023</li>
        <li style={S.li}>Ministry of Power — Electricity (Amendment) Act, 2022 — Energy Storage Provisions</li>
        <li style={S.li}>NITI Aayog — Report on India's Renewable Energy Storage Requirements (2023)</li>
        <li style={S.li}>IEX — Day-Ahead Market Price Data, 2023–24</li>
        <li style={S.li}>Bloomberg NEF — Lithium-Ion Battery Price Survey, 2023</li>
        <li style={S.li}>IRENA — Electricity Storage Valuation Framework, 2020</li>
      </ul>
    </div>
  );
}

export default function BatteryEnergyStorage() {
  const [tab, setTab] = useState('simulate');
  const [bessMW, setBessMW] = useState(50);
  const [bessHrs, setBessHrs] = useState(4);
  const [solarMW, setSolarMW] = useState(120);
  const [peakMW, setPeakMW] = useState(300);
  const [mode, setMode] = useState('arbitrage');
  const [rte, setRte] = useState(88);

  const data = useMemo(
    () => compute(bessMW, bessHrs, solarMW, peakMW, mode, rte),
    [bessMW, bessHrs, solarMW, peakMW, mode, rte]
  );

  const curHour = new Date().getHours() + new Date().getMinutes() / 60;
  const curIdx = Math.min(Math.floor(curHour * 2), data.hours.length - 1);
  const curSoC = data.socArr[curIdx] || data.socArr[0];

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={{ display: 'flex', flex: 1, minHeight: 300 }}>
            <div style={{ ...S.svgWrap, flex: 1 }}>
              <Chart d={data} bessCapMWh={data.bessCapMWh} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 12px', gap: 8, borderLeft: '1px solid #1e1e2e', background: '#0c0c0f', minWidth: 130 }}>
              <span style={{ fontSize: 10, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>SoC Gauge</span>
              <SoCGauge soc={curSoC} cap={data.bessCapMWh} />
              <FreqDemo bessMW={bessMW} />
            </div>
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Peak Before</span>
              <span style={{ ...S.rv, color: '#f97316' }}>{data.peakBefore.toFixed(0)} MW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Peak After</span>
              <span style={{ ...S.rv, color: '#22d3ee' }}>{data.peakAfter.toFixed(0)} MW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Peak Shaved</span>
              <span style={{ ...S.rv, color: data.peakShaved > 0 ? '#22c55e' : '#71717a' }}>{data.peakShaved.toFixed(0)} MW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Energy Cycled</span>
              <span style={{ ...S.rv, color: '#a78bfa' }}>{data.energyDischarged.toFixed(0)} MWh</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Equiv. Cycles</span>
              <span style={{ ...S.rv, color: data.cycles > 1 ? '#f59e0b' : '#71717a' }}>{data.cycles.toFixed(2)}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Daily Revenue</span>
              <span style={{ ...S.rv, color: '#22c55e' }}>₹{((data.revArb + data.revAS) / 1000 * 83).toFixed(0)}K</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>BESS Power</span>
              <input type="range" min={10} max={200} step={5} value={bessMW}
                onChange={e => setBessMW(+e.target.value)} style={S.slider} />
              <span style={S.val}>{bessMW} MW</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Duration</span>
              <input type="range" min={1} max={8} step={0.5} value={bessHrs}
                onChange={e => setBessHrs(+e.target.value)} style={S.slider} />
              <span style={S.val}>{bessHrs}h ({(bessMW * bessHrs).toFixed(0)} MWh)</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Solar</span>
              <input type="range" min={0} max={300} step={10} value={solarMW}
                onChange={e => setSolarMW(+e.target.value)} style={S.slider} />
              <span style={S.val}>{solarMW} MW</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Peak Load</span>
              <input type="range" min={100} max={500} step={10} value={peakMW}
                onChange={e => setPeakMW(+e.target.value)} style={S.slider} />
              <span style={S.val}>{peakMW} MW</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>RTE</span>
              <input type="range" min={70} max={95} step={1} value={rte}
                onChange={e => setRte(+e.target.value)} style={S.slider} />
              <span style={S.val}>{rte}%</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Mode</span>
              <div style={S.bg}>
                <button style={S.btn(mode === 'arbitrage')} onClick={() => setMode('arbitrage')}>Arbitrage</button>
                <button style={S.btn(mode === 'peakshave')} onClick={() => setMode('peakshave')}>Peak Shave</button>
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
