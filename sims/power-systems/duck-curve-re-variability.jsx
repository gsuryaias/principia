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
  slider: { width: 110, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 44, textAlign: 'right' },
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

const PEAKS = { summer: 30, winter: 24, monsoon: 27 };
const MIN_TH = 8;

const LOAD = {
  summer:  [0.65,0.60,0.57,0.55,0.56,0.58,0.64,0.72,0.80,0.86,0.90,0.93,0.95,0.96,0.97,0.94,0.90,0.87,0.90,1.00,0.96,0.90,0.80,0.72,0.65],
  winter:  [0.62,0.58,0.55,0.53,0.55,0.60,0.68,0.76,0.82,0.85,0.87,0.88,0.89,0.90,0.91,0.88,0.85,0.84,0.92,1.00,0.97,0.90,0.78,0.68,0.62],
  monsoon: [0.64,0.60,0.57,0.55,0.56,0.58,0.63,0.70,0.78,0.84,0.88,0.91,0.93,0.94,0.95,0.92,0.88,0.86,0.90,1.00,0.95,0.89,0.78,0.70,0.64],
};

const SUN = {
  summer:  [0,0,0,0,0,0, 0.05,0.18,0.40,0.60,0.78,0.90, 0.96,0.94,0.85,0.70,0.50,0.25, 0.05,0,0,0,0,0, 0],
  winter:  [0,0,0,0,0,0, 0,0.05,0.20,0.42,0.62,0.78, 0.85,0.82,0.72,0.55,0.32,0.10, 0,0,0,0,0,0, 0],
  monsoon: [0,0,0,0,0,0, 0.02,0.08,0.18,0.30,0.42,0.50, 0.53,0.50,0.42,0.32,0.20,0.08, 0.01,0,0,0,0,0, 0],
};

const WND = {
  summer:  [0.35,0.38,0.40,0.42,0.40,0.35, 0.28,0.22,0.18,0.16,0.15,0.14, 0.15,0.17,0.20,0.24,0.28,0.32, 0.35,0.36,0.37,0.36,0.35,0.35, 0.35],
  winter:  [0.28,0.30,0.32,0.33,0.32,0.28, 0.22,0.18,0.15,0.13,0.12,0.11, 0.12,0.14,0.16,0.19,0.22,0.25, 0.28,0.29,0.28,0.27,0.28,0.28, 0.28],
  monsoon: [0.42,0.44,0.47,0.50,0.48,0.44, 0.38,0.32,0.28,0.26,0.24,0.23, 0.24,0.26,0.30,0.34,0.38,0.42, 0.45,0.47,0.46,0.44,0.42,0.42, 0.42],
};

function compute(solarGW, windGW, season, battGWh) {
  const peak = PEAKS[season];
  const N = 49;
  const hours = Array.from({ length: N }, (_, i) => i * 0.5);
  const dt = 0.5;

  const lerp = (arr, h) => {
    const i = Math.min(Math.floor(h), 23);
    const j = Math.min(i + 1, 24);
    return arr[i] + (h - i) * (arr[j] - arr[i]);
  };

  const gross = hours.map(h => lerp(LOAD[season], h) * peak);
  const solar = hours.map(h => lerp(SUN[season], h) * solarGW);
  const wind = hours.map(h => lerp(WND[season], h) * windGW);
  const re = hours.map((_, i) => solar[i] + wind[i]);
  const netRaw = hours.map((_, i) => gross[i] - re[i]);

  const batt = new Array(N).fill(0);
  if (battGWh > 0) {
    const maxP = battGWh / 4;
    let soc = 0;
    for (let i = 0; i < N; i++) {
      if (hours[i] >= 10 && hours[i] < 14) {
        const c = Math.min(maxP, (battGWh - soc) / dt);
        batt[i] = c;
        soc += c * dt;
      }
    }
    for (let i = 0; i < N; i++) {
      if (hours[i] >= 17 && hours[i] < 21) {
        const d = Math.min(maxP, soc / dt);
        batt[i] = -d;
        soc -= d * dt;
      }
    }
  }

  const net = hours.map((_, i) => netRaw[i] + batt[i]);

  let curtail = 0, reEnergy = 0, demEnergy = 0;
  for (let i = 0; i < N - 1; i++) {
    if (net[i] < MIN_TH) curtail += (MIN_TH - net[i]) * dt;
    reEnergy += re[i] * dt;
    demEnergy += gross[i] * dt;
  }

  const rampRate = Math.max(0, (net[38] - net[32]) * 1000 / 180);
  const rePct = demEnergy > 0 ? (reEnergy / demEnergy) * 100 : 0;

  return {
    hours, gross, solar, wind, re, net, netRaw, batt,
    curtail, rampRate, rePct,
    minNet: Math.min(...net),
    peakNet: Math.max(...net),
    co2: reEnergy * 0.82,
  };
}

function Chart({ d, battGWh }) {
  const { hours, gross, solar, wind, net, netRaw } = d;
  const N = hours.length;

  const W = 880, H = 430;
  const ML = 58, MR = 15, MT = 30, MB = 48;
  const PW = W - ML - MR, PH = H - MT - MB;

  const yMax = Math.ceil(Math.max(...gross) / 5) * 5 + 2;
  const p = (n) => n.toFixed(1);
  const xS = (h) => ML + (h / 24) * PW;
  const yS = (v) => MT + PH * (1 - v / yMax);

  const line = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${p(xS(hours[i]))},${p(yS(v))}`).join(' ');

  const solarArea = solar.map((v, i) => `${i ? 'L' : 'M'}${p(xS(hours[i]))},${p(yS(v))}`).join(' ') +
    ` L${p(xS(24))},${p(yS(0))} L${p(xS(0))},${p(yS(0))} Z`;

  const sw = solar.map((s, i) => s + wind[i]);
  const windArea = sw.map((v, i) => `${i ? 'L' : 'M'}${p(xS(hours[i]))},${p(yS(v))}`).join(' ') + ' ' +
    solar.slice().reverse().map((v, i) => `L${p(xS(hours[N - 1 - i]))},${p(yS(v))}`).join(' ') + ' Z';

  const curtSegs = [];
  let cs = null;
  for (let i = 0; i < N; i++) {
    if (net[i] < MIN_TH) { if (cs === null) cs = i; }
    else { if (cs !== null) { curtSegs.push([cs, i - 1]); cs = null; } }
  }
  if (cs !== null) curtSegs.push([cs, N - 1]);

  const curtArea = curtSegs.map(([a, b]) => {
    let path = `M${p(xS(hours[a]))},${p(yS(MIN_TH))} L${p(xS(hours[b]))},${p(yS(MIN_TH))} `;
    for (let i = b; i >= a; i--) path += `L${p(xS(hours[i]))},${p(yS(net[i]))} `;
    return path + 'Z';
  }).join(' ');

  let bellyIdx = 0, bellyVal = Infinity, headIdx = 0, headVal = -Infinity;
  for (let i = 0; i < N; i++) {
    if (hours[i] >= 9 && hours[i] <= 15 && net[i] < bellyVal) { bellyVal = net[i]; bellyIdx = i; }
    if (hours[i] >= 17 && hours[i] <= 21 && net[i] > headVal) { headVal = net[i]; headIdx = i; }
  }
  const showDuck = headVal - bellyVal > 5;

  const yTicks = [];
  for (let v = 0; v <= yMax; v += 5) yTicks.push(v);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <defs>
        <clipPath id="dc-clip"><rect x={ML} y={MT} width={PW} height={PH} /></clipPath>
      </defs>

      {/* Region annotations */}
      <rect x={xS(0)} y={MT} width={xS(6) - xS(0)} height={PH} fill="#6366f1" opacity={0.04} />
      <text x={(xS(0) + xS(6)) / 2} y={MT + 12} textAnchor="middle" fontSize={8} fill="#6366f1" opacity={0.5} fontWeight="600">Off-Peak</text>
      <rect x={xS(9)} y={MT} width={xS(15) - xS(9)} height={PH} fill="#22c55e" opacity={0.04} />
      <text x={(xS(9) + xS(15)) / 2} y={MT + 12} textAnchor="middle" fontSize={8} fill="#22c55e" opacity={0.5} fontWeight="600">Solar Surplus</text>
      <rect x={xS(16)} y={MT} width={xS(20) - xS(16)} height={PH} fill="#f59e0b" opacity={0.05} />
      <text x={(xS(16) + xS(20)) / 2} y={MT + 12} textAnchor="middle" fontSize={8} fill="#f59e0b" opacity={0.5} fontWeight="600">Evening Ramp</text>
      <rect x={xS(19)} y={MT} width={xS(24) - xS(19)} height={PH} fill="#ef4444" opacity={0.04} />
      <text x={(xS(19) + xS(24)) / 2} y={MT + 12} textAnchor="middle" fontSize={8} fill="#ef4444" opacity={0.5} fontWeight="600">Peak Demand</text>

      {yTicks.map(v => (
        <g key={`y${v}`}>
          <line x1={ML} y1={yS(v)} x2={W - MR} y2={yS(v)} stroke="#1e1e2e" strokeWidth={0.6} />
          <text x={ML - 6} y={yS(v) + 3.5} textAnchor="end" fontSize={10} fill="#52525b">{v}</text>
        </g>
      ))}
      {[0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => (
        <g key={`x${h}`}>
          <line x1={xS(h)} y1={MT} x2={xS(h)} y2={MT + PH} stroke="#1e1e2e" strokeWidth={0.6} />
          <text x={xS(h)} y={MT + PH + 16} textAnchor="middle" fontSize={10} fill="#52525b">
            {String(h).padStart(2, '0')}:00
          </text>
        </g>
      ))}

      <text x={14} y={MT + PH / 2} textAnchor="middle" fontSize={10} fill="#3f3f46"
        transform={`rotate(-90 14 ${MT + PH / 2})`}>Power (GW)</text>
      <text x={ML + PW / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#3f3f46">Hour of Day</text>

      <g clipPath="url(#dc-clip)">
        <path d={solarArea} fill="rgba(34,197,94,0.22)" />
        <path d={windArea} fill="rgba(56,189,248,0.18)" />
        {curtArea && <path d={curtArea} fill="rgba(239,68,68,0.25)" />}
        <path d={line(gross)} fill="none" stroke="#71717a" strokeWidth={1.5} strokeDasharray="6 3" />
        {battGWh > 0 && (
          <path d={line(netRaw)} fill="none" stroke="#f97316" strokeWidth={1} strokeDasharray="4 3" opacity={0.3} />
        )}
        <path d={line(net)} fill="none" stroke="#f97316" strokeWidth={2.5} strokeLinejoin="round" />
      </g>

      <line x1={ML} y1={yS(MIN_TH)} x2={W - MR} y2={yS(MIN_TH)}
        stroke="#ef4444" strokeWidth={0.8} strokeDasharray="6 4" opacity={0.45} />
      <text x={W - MR - 4} y={yS(MIN_TH) - 4} textAnchor="end" fontSize={8} fill="#ef4444" opacity={0.6}>
        Min thermal {MIN_TH} GW
      </text>

      <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="#3f3f46" strokeWidth={1} />
      <line x1={ML} y1={MT + PH} x2={W - MR} y2={MT + PH} stroke="#3f3f46" strokeWidth={1} />

      {showDuck && (
        <>
          <text x={xS(hours[bellyIdx])} y={yS(bellyVal) + 15} textAnchor="middle"
            fontSize={10} fill="#f97316" fontWeight={600} opacity={0.85}>▼ Belly</text>
          <text x={xS(17.5)} y={yS((net[35] + net[37]) / 2)} textAnchor="start"
            fontSize={10} fill="#f97316" fontWeight={600} opacity={0.85} dx={10}>Ramp ↑</text>
          <text x={xS(hours[headIdx])} y={yS(headVal) - 10} textAnchor="middle"
            fontSize={10} fill="#f97316" fontWeight={600} opacity={0.85}>Head ▲</text>
        </>
      )}

      <g transform={`translate(${W - MR - 170}, ${MT + 4})`}>
        <rect width={165} height={74} rx={6} fill="#09090b" opacity={0.9} stroke="#27272a" strokeWidth={0.5} />
        <rect x={8} y={8} width={12} height={8} rx={2} fill="rgba(34,197,94,0.5)" />
        <text x={26} y={15} fontSize={9} fill="#a1a1aa">Solar Generation</text>
        <rect x={8} y={21} width={12} height={8} rx={2} fill="rgba(56,189,248,0.45)" />
        <text x={26} y={28} fontSize={9} fill="#a1a1aa">Wind Generation</text>
        <line x1={8} y1={37} x2={20} y2={37} stroke="#71717a" strokeWidth={1.5} strokeDasharray="4 2" />
        <text x={26} y={40} fontSize={9} fill="#a1a1aa">Gross Demand</text>
        <line x1={8} y1={50} x2={20} y2={50} stroke="#f97316" strokeWidth={2.5} />
        <text x={26} y={53} fontSize={9} fill="#a1a1aa">Net Demand (Duck)</text>
        <line x1={8} y1={63} x2={20} y2={63} stroke="#ef4444" strokeWidth={0.8} strokeDasharray="4 2" />
        <text x={26} y={66} fontSize={9} fill="#a1a1aa">Min Thermal</text>
      </g>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>The Duck Curve &amp; Renewable Energy Variability</h2>
      <p style={S.p}>
        The "duck curve" refers to the distinctive shape formed by the <strong style={{ color: '#e4e4e7' }}>net electrical
        demand</strong> — total demand minus variable renewable energy (VRE) generation — over a 24-hour
        period. As solar and wind capacity increases on a grid, the midday net demand drops dramatically
        (forming the duck's belly), followed by a steep evening ramp (the neck) to the evening peak
        (the head), when solar generation falls off but consumer demand surges for lighting, cooking,
        and air conditioning.
      </p>

      {/* ── SVG: Duck Curve Anatomy ── */}
      <svg viewBox="0 0 700 320" style={{ width: '100%', maxWidth: 700, height: 'auto', margin: '20px auto', display: 'block' }}>
        <rect width="700" height="320" rx="12" fill="#18181b" stroke="#27272a" strokeWidth="1" />
        <text x="350" y="24" textAnchor="middle" fontSize="13" fill="#e4e4e7" fontWeight="700">Duck Curve Anatomy</text>

        {/* Axes */}
        <line x1="70" y1="280" x2="660" y2="280" stroke="#3f3f46" strokeWidth="1" />
        <line x1="70" y1="45" x2="70" y2="280" stroke="#3f3f46" strokeWidth="1" />
        <text x="15" y="165" textAnchor="middle" fontSize="10" fill="#71717a" transform="rotate(-90 15 165)">Net Load (GW)</text>
        <text x="365" y="300" textAnchor="middle" fontSize="10" fill="#71717a">Hour of Day</text>
        {[0,3,6,9,12,15,18,21,24].map(h => (
          <g key={h}>
            <text x={70 + h/24*590} y="295" textAnchor="middle" fontSize="9" fill="#52525b">{String(h).padStart(2,'0')}:00</text>
            <line x1={70 + h/24*590} y1="278" x2={70 + h/24*590} y2="282" stroke="#3f3f46" strokeWidth="1" />
          </g>
        ))}

        {/* Total demand curve (dashed) */}
        <path d="M70,210 Q140,195 200,180 Q280,162 365,155 Q420,152 460,155 Q530,165 580,185 Q630,200 660,215"
          fill="none" stroke="#71717a" strokeWidth="1.5" strokeDasharray="6 3" />
        <text x="665" y="218" fontSize="8" fill="#71717a" textAnchor="start">Total Load</text>

        {/* Solar generation (filled) */}
        <path d="M70,280 Q140,280 200,280 Q240,275 280,240 Q320,180 365,155 Q410,180 445,240 Q480,275 530,280 Q600,280 660,280 Z"
          fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 2" />
        <text x="365" y="200" textAnchor="middle" fontSize="9" fill="#22c55e" opacity="0.8">Solar Generation</text>

        {/* Net load (duck shape) */}
        <path d="M70,210 Q120,200 160,195 Q200,195 240,210 Q280,240 320,260 Q350,268 365,265 Q390,255 420,200 Q445,155 480,110 Q510,85 540,75 Q560,72 580,80 Q610,100 640,130 Q655,145 660,155"
          fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Belly annotation */}
        <line x1="345" y1="265" x2="345" y2="232" stroke="#f97316" strokeWidth="0.8" strokeDasharray="3 2" />
        <rect x="290" y="215" width="110" height="20" rx="4" fill="#f9731620" stroke="#f97316" strokeWidth="0.5" />
        <text x="345" y="229" textAnchor="middle" fontSize="10" fill="#f97316" fontWeight="600">Belly (Solar Peak)</text>

        {/* Neck annotation */}
        <path d="M440,195 L440,130" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" markerEnd="url(#arrowUp)" />
        <rect x="450" y="148" width="80" height="20" rx="4" fill="#f59e0b20" stroke="#f59e0b" strokeWidth="0.5" />
        <text x="490" y="162" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="600">Neck (Ramp)</text>
        <defs>
          <marker id="arrowUp" markerWidth="6" markerHeight="6" refX="3" refY="6" orient="auto">
            <path d="M0,6 L3,0 L6,6" fill="none" stroke="#f59e0b" strokeWidth="1" />
          </marker>
        </defs>

        {/* Head annotation */}
        <circle cx="545" cy="74" r="4" fill="none" stroke="#ef4444" strokeWidth="1.5" />
        <line x1="545" y1="68" x2="545" y2="50" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3 2" />
        <rect x="490" y="38" width="110" height="18" rx="4" fill="#ef444420" stroke="#ef4444" strokeWidth="0.5" />
        <text x="545" y="51" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="600">Head (Evening Peak)</text>

        {/* Legend */}
        <g transform="translate(75,42)">
          <rect width="160" height="52" rx="6" fill="#09090b" opacity="0.9" stroke="#27272a" strokeWidth="0.5" />
          <line x1="8" y1="12" x2="24" y2="12" stroke="#71717a" strokeWidth="1.5" strokeDasharray="4 2" />
          <text x="30" y="15" fontSize="9" fill="#a1a1aa">Total Demand</text>
          <line x1="8" y1="26" x2="24" y2="26" stroke="#f97316" strokeWidth="2.5" />
          <text x="30" y="29" fontSize="9" fill="#a1a1aa">Net Load (Duck)</text>
          <rect x="8" y="36" width="16" height="6" rx="1" fill="rgba(34,197,94,0.3)" stroke="#22c55e" strokeWidth="0.5" />
          <text x="30" y="43" fontSize="9" fill="#a1a1aa">Solar Generation</text>
        </g>
      </svg>

      {/* ── SVG: Ramping Challenge ── */}
      <svg viewBox="0 0 700 200" style={{ width: '100%', maxWidth: 700, height: 'auto', margin: '16px auto', display: 'block' }}>
        <rect width="700" height="200" rx="12" fill="#18181b" stroke="#27272a" strokeWidth="1" />
        <text x="350" y="22" textAnchor="middle" fontSize="12" fill="#e4e4e7" fontWeight="700">Evening Ramp Challenge</text>

        {/* Timeline */}
        <line x1="80" y1="160" x2="620" y2="160" stroke="#3f3f46" strokeWidth="1" />
        {['15:00','16:00','17:00','18:00','19:00','20:00','21:00'].map((t, i) => (
          <g key={t}>
            <text x={80 + i*90} y="175" textAnchor="middle" fontSize="9" fill="#52525b">{t}</text>
            <line x1={80 + i*90} y1="158" x2={80 + i*90} y2="162" stroke="#3f3f46" />
          </g>
        ))}

        {/* Solar decline arrow */}
        <path d="M100,70 Q200,72 350,140" fill="none" stroke="#22c55e" strokeWidth="2" />
        <text x="180" y="65" fontSize="10" fill="#22c55e" fontWeight="600">Solar output declining</text>
        <path d="M340,135 L350,140 L340,140" fill="#22c55e" />

        {/* Ramp requirement arrow */}
        <path d="M420,140 Q500,80 600,50" fill="none" stroke="#ef4444" strokeWidth="2.5" />
        <text x="540" y="42" fontSize="10" fill="#ef4444" fontWeight="600">Ramp needed</text>
        <path d="M595,55 L600,50 L595,50" fill="#ef4444" />

        {/* Rate labels */}
        <rect x="400" y="80" width="130" height="36" rx="6" fill="#ef444410" stroke="#ef4444" strokeWidth="0.5" />
        <text x="465" y="96" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="600">50-100+ MW/min</text>
        <text x="465" y="110" textAnchor="middle" fontSize="9" fill="#a1a1aa">System ramp rate required</text>

        <rect x="120" y="100" width="140" height="36" rx="6" fill="#f59e0b10" stroke="#f59e0b" strokeWidth="0.5" />
        <text x="190" y="116" textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="600">Coal: 5-10 MW/min</text>
        <text x="190" y="130" textAnchor="middle" fontSize="9" fill="#a1a1aa">Per 500 MW unit</text>
      </svg>

      <h3 style={S.h3}>Origin: California ISO (CAISO), 2013</h3>
      <p style={S.p}>
        The term was first popularized by the California Independent System Operator (CAISO) in a
        2013 report that projected how increasing solar penetration would reshape the net load curve
        through 2020. California's experience — with net demand dropping to near-zero midday and
        ramping up by <strong style={{ color: '#e4e4e7' }}>13,000+ MW in three hours</strong> each
        evening — became a cautionary template for grid operators worldwide. The original CAISO chart
        showed progressively deeper "duck" shapes for each year from 2012 to 2020 as solar
        installations grew.
      </p>
      <div style={S.eq}>Net Load = Total Demand − Solar Generation − Wind Generation</div>

      <h3 style={S.h3}>India's Emerging Duck Curve</h3>
      <p style={S.p}>
        India is rapidly encountering its own duck curve as renewable energy installations surge.
        With over <strong style={{ color: '#e4e4e7' }}>190 GW</strong> of installed RE capacity
        (as of 2024) and a target of 500 GW by 2030, several Indian states already experience
        pronounced duck curves:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Rajasthan</strong> — With ~20 GW of solar
          capacity, midday solar generation regularly exceeds 12 GW, causing net demand to drop by
          40–50% from morning levels. The evening ramp exceeds 8,000 MW in 3 hours during summer.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Karnataka</strong> — A pioneer in solar
          adoption; net demand regularly drops to single-digit GW midday during clear spring days.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Andhra Pradesh</strong> — Combined solar
          and wind capacity exceeding 8.9 GW creates significant midday surplus, especially during
          clear-sky winter and spring days.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Tamil Nadu</strong> — With ~15 GW of wind
          capacity (highest in India), wind-driven variability adds a unique dimension to the state's
          duck curve, with wind peaking during monsoon nights.</li>
      </ul>

      <h3 style={S.h3}>Why the Evening Ramp is Dangerous</h3>
      <p style={S.p}>
        The steep evening ramp (neck of the duck) poses serious operational challenges. Conventional
        thermal plants cannot ramp up fast enough to compensate for the rapid loss of solar generation
        coinciding with rising evening demand:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Coal-fired plants</strong> ramp at only
          1–2% of rated capacity per minute. A 500 MW unit increases output by 5–10 MW/min at best.
          Cold start requires 6–8 hours.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Gas turbines</strong> ramp at 5–8%/min
          but India has limited gas capacity (~25 GW) and constrained gas availability.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Hydro plants</strong> ramp quickly
          (~20%/min) but are seasonal and often committed for irrigation or drinking water supply.</li>
      </ul>
      <div style={S.eq}>Typical coal ramp: 1–2% × P_rated per minute ≈ 5–10 MW/min per 500 MW unit</div>
      <div style={S.eq}>Required system evening ramp: 50–100+ MW/min (growing with RE penetration)</div>
      <p style={S.p}>
        When the required system ramp exceeds the combined ramp capability of dispatchable generators,
        grid frequency drops below 49.5 Hz, triggering under-frequency relays and potentially cascading
        outages. POSOCO data shows that Indian grid frequency excursions have increased in correlation
        with RE penetration growth.
      </p>

      <h3 style={S.h3}>Curtailment: Wasting Renewable Energy</h3>
      <p style={S.p}>
        Curtailment occurs when renewable generation exceeds what the grid can absorb — specifically,
        when net demand falls below the <strong style={{ color: '#e4e4e7' }}>minimum generation level</strong> of
        must-run conventional plants:
      </p>
      <div style={S.eq}>Curtailment = max(0, Minimum Thermal Generation − Net Demand)</div>
      <p style={S.p}>Must-run generation includes:</p>
      <ul style={S.ul}>
        <li style={S.li}>Nuclear power plants — cannot cycle economically, must run at near-full output</li>
        <li style={S.li}>Run-of-river hydro — water must be used or spilled</li>
        <li style={S.li}>Combined heat and power (CHP) plants with industrial heat commitments</li>
        <li style={S.li}>Coal thermal units at their technical minimum (typically 40–55% of rated capacity for
          sub-critical, 40% for super-critical units per CEA directive)</li>
      </ul>
      <p style={S.p}>
        Every MWh of curtailed RE represents wasted capital investment and reduced project economics —
        a generator earning no revenue while fixed costs (debt service, land lease, O&M) continue
        unabated. India curtailed an estimated 6–8 TWh of RE in FY 2023–24 due to grid constraints
        and backing-down instructions.
      </p>

      <h3 style={S.h3}>Solutions to the Duck Curve</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Solution</th>
            <th style={S.th}>Mechanism</th>
            <th style={S.th}>India Status</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Battery Storage (BESS)', 'Absorb midday surplus, discharge during evening ramp', 'SECI tendering 500 MWh+; CEA targeting 18.8 GW/73.9 GWh by 2032'],
            ['Pumped Storage Hydro', 'Pump water uphill during surplus, generate during peak', '96 GW potential identified; 4.7 GW operational'],
            ['Demand Response', 'Shift flexible loads (EV charging, cold storage, water heating) to solar hours', 'BEE pilot programs; smart meter rollout (250M target) underway'],
            ['Flexible Generation', 'Retrofit coal plants for faster ramping, two-shift operation', 'CEA technical-minimum regulations; flexible operation at 22 plants'],
            ['Grid Interconnection', 'Transfer surplus from RE-rich to deficit regions via ISTS', 'Green Energy Corridors I & II; 765 kV HVDC links'],
            ['Smart EV Charging', 'Charge EVs during solar peak, provide V2G during evening', 'FAME-II and PM E-DRIVE incentives; slow adoption thus far'],
          ].map(([s, m, status]) => (
            <tr key={s}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{s}</td>
              <td style={S.td}>{m}</td>
              <td style={S.td}>{status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.ctx}>
        <span style={S.ctxT}>Real-World Context — Andhra Pradesh</span>
        <p style={S.ctxP}>
          Andhra Pradesh had ~8.9 GW of RE capacity (solar + wind) as of 2024. During clear spring
          days, solar generation can exceed 5 GW midday, creating a significant duck curve. AP Transco
          coordinates with SRLDC for RE scheduling and has begun installing BESS at select 400 kV
          substations. The state's evening ramp from 4 PM to 7 PM has increased by over 2,000 MW
          compared to pre-solar baselines. AP Transco's SLDC actively uses forecasting tools from
          NIWE and POSOCO for day-ahead solar and wind predictions, enabling better scheduling of
          conventional generation and reducing curtailment.
        </p>
      </div>

      <h3 style={S.h3}>CERC Ancillary Services for Ramp Management</h3>
      <p style={S.p}>
        Recognizing the growing challenge of renewable variability, the Central Electricity Regulatory
        Commission (CERC) introduced India's Ancillary Services (AS) market:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Regulation Up (RU)</strong> — Generators
          increase output to compensate for RE shortfall or demand increase. Compensated at
          market-determined rates above energy charges.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Regulation Down (RD)</strong> — Generators
          reduce output to absorb RE surplus. Critical for managing the duck belly. Compensated via
          deemed generation payments.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>SCED</strong> — Security Constrained
          Economic Dispatch enables pan-India re-optimization of generation based on merit order,
          reducing system costs by ₹4,000+ crore annually and enabling better RE absorption.</li>
      </ul>

      <h3 style={S.h3}>IEGC Ramp Rate Requirements</h3>
      <p style={S.p}>
        The Indian Electricity Grid Code (IEGC), 2023 mandates minimum ramp rates for different
        generator types connected to the grid:
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Generator Type</th>
            <th style={S.th}>Ramp Rate (%/min)</th>
            <th style={S.th}>Technical Min (%)</th>
            <th style={S.th}>Cold Start Time</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Coal (Sub-critical)', '1.0', '55', '6–8 hours'],
            ['Coal (Super-critical)', '1.5', '40', '4–6 hours'],
            ['Gas Turbine (OCGT)', '8.0', '30', '10–30 min'],
            ['Gas (CCGT)', '3.0', '40', '2–4 hours'],
            ['Large Hydro', '20.0', '15', '2–5 min'],
            ['Pumped Storage', '20.0', 'N/A', '2–5 min'],
          ].map(([gen, rr, tm, st]) => (
            <tr key={gen}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{gen}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{rr}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{tm}</td>
              <td style={S.td}>{st}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>Impact on Thermal Plant Economics</h3>
      <p style={S.p}>
        The duck curve severely impacts the economics of coal-fired thermal plants, which were
        designed for baseload operation at 80–85% PLF:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Reduced PLF</strong> — Plant Load Factor
          drops below 50% as midday generation is displaced by solar. Coal plants earn less revenue
          per MW of installed capacity, stranding investment.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Cycling damage</strong> — Repeated
          start-stop cycles and rapid load changes cause thermal fatigue in boiler tubes, turbine
          blades, and thick-walled components. EPRI estimates cycling damage costs $3–5 million/year
          per 500 MW unit.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Increased heat rate</strong> — Operating
          at partial load (technical minimum) increases specific fuel consumption by 15–25%, raising
          per-unit generation cost.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Two-shift operation</strong> — CEA has
          directed older plants to adopt two-shift operation (shut down at night, start up for peaks),
          accelerating wear and increasing transient emissions.</li>
      </ul>
      <div style={S.eq}>Revenue impact: PLF drop 80% → 50% ≈ 37.5% revenue loss at constant tariff</div>

      <div style={S.ctx}>
        <span style={S.ctxT}>Assumptions in This Simulation</span>
        <p style={S.ctxP}>
          The simulation uses idealized generation profiles for solar and wind based on typical Indian
          meteorological patterns. Actual generation varies significantly with cloud cover, wind
          intermittency, and local conditions. Battery dispatch uses a simplified fixed-schedule
          algorithm (charge 10:00–14:00, discharge 17:00–21:00 at C/4 rate) rather than optimal
          economic dispatch. Minimum thermal generation is set at 8 GW, representing must-run nuclear,
          run-of-river hydro, and coal units at technical minimum. The CO₂ emission factor of
          0.82 tCO₂/MWh is the 2023 Indian grid weighted average per CEA's CO₂ Baseline Database
          v19.0. System peak demands are representative of a large Indian state-level grid.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>California ISO — "What the Duck Curve Tells Us About Managing a Green Grid", 2013</li>
        <li style={S.li}>Central Electricity Authority (CEA) — National Electricity Plan, 2023</li>
        <li style={S.li}>Central Electricity Regulatory Commission (CERC) — Ancillary Services Regulations, 2022</li>
        <li style={S.li}>POSOCO (now GRID-INDIA) — Annual Report on Renewable Energy Integration, 2023–24</li>
        <li style={S.li}>Ministry of New and Renewable Energy (MNRE) — Installed RE Capacity Dashboard</li>
        <li style={S.li}>Indian Electricity Grid Code (IEGC), 2023 — CERC</li>
        <li style={S.li}>CEA — CO₂ Baseline Database for Indian Power Sector, v19.0 (2023)</li>
        <li style={S.li}>EPRI — "Cycling Cost for Combined Cycle / Coal-Fired Power Plants"</li>
        <li style={S.li}>NIWE — Solar and Wind Energy Resource Assessment for India</li>
      </ul>
    </div>
  );
}

export default function DuckCurveREVariability() {
  const [tab, setTab] = useState('simulate');
  const [solarGW, setSolarGW] = useState(10);
  const [windGW, setWindGW] = useState(5);
  const [season, setSeason] = useState('summer');
  const [battGWh, setBattGWh] = useState(0);

  const data = useMemo(
    () => compute(solarGW, windGW, season, battGWh),
    [solarGW, windGW, season, battGWh]
  );

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Chart d={data} battGWh={battGWh} />
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>RE Penetration</span>
              <span style={{ ...S.rv, color: '#22c55e' }}>{data.rePct.toFixed(1)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Evening Ramp</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{data.rampRate.toFixed(0)} MW/min</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Curtailment</span>
              <span style={{ ...S.rv, color: data.curtail > 0 ? '#ef4444' : '#71717a' }}>
                {data.curtail.toFixed(2)} GWh
              </span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Min Net Load</span>
              <span style={{ ...S.rv, color: data.minNet < MIN_TH ? '#ef4444' : '#3b82f6' }}>
                {data.minNet.toFixed(1)} GW
              </span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Peak Net Load</span>
              <span style={{ ...S.rv, color: '#8b5cf6' }}>{data.peakNet.toFixed(1)} GW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>CO₂ Saved</span>
              <span style={{ ...S.rv, color: '#06b6d4' }}>{data.co2.toFixed(1)} kT/day</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Solar (GW)</span>
              <input type="range" min={0} max={20} step={0.5} value={solarGW}
                onChange={(e) => setSolarGW(+e.target.value)} style={S.slider} />
              <span style={S.val}>{solarGW.toFixed(1)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Wind (GW)</span>
              <input type="range" min={0} max={10} step={0.5} value={windGW}
                onChange={(e) => setWindGW(+e.target.value)} style={S.slider} />
              <span style={S.val}>{windGW.toFixed(1)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Season</span>
              <div style={S.bg}>
                {['summer', 'winter', 'monsoon'].map(s => (
                  <button key={s} style={S.btn(season === s)} onClick={() => setSeason(s)}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Battery (GWh)</span>
              <input type="range" min={0} max={5} step={0.5} value={battGWh}
                onChange={(e) => setBattGWh(+e.target.value)} style={S.slider} />
              <span style={S.val}>{battGWh.toFixed(1)}</span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
