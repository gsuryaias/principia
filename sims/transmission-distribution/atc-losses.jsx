import React, { useState, useMemo, useCallback } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '16px 16px 0', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 8 },
  label: { fontSize: 12, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 110, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 44, textAlign: 'right' },
  results: { display: 'flex', gap: 28, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  btn: (a) => ({ padding: '5px 12px', borderRadius: 7, border: a ? '1px solid #6366f1' : '1px solid #27272a', background: a ? 'rgba(99,102,241,0.15)' : 'transparent', color: a ? '#a5b4fc' : '#71717a', fontSize: 11, cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s', outline: 'none' }),
  bg: { display: 'flex', gap: 5 },
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

const DISCOMS = [
  { name: 'TPDDL', atc: 8 }, { name: 'APEPDCL', atc: 9 },
  { name: 'BESCOM', atc: 12 }, { name: 'APSPDCL', atc: 14 },
  { name: 'UGVCL', atc: 15 }, { name: 'MSEDCL', atc: 18 },
  { name: 'BSES Yamuna', atc: 20 }, { name: 'JVVNL', atc: 28 },
  { name: 'TANGEDCO', atc: 35 },
];

const PR = {
  best: [15000, 2, 4, 0.5, 0.5, 99],
  avg: [10000, 3, 7, 3, 1, 95],
  worst: [8000, 5, 10, 8, 2, 85],
};

function calc(inp, trP, dtP, thP, mtP, ceP) {
  const transLoss = inp * trP / 100;
  const distEntry = inp - transLoss;
  const distTechLoss = inp * dtP / 100;
  const lineLoss = distTechLoss * 0.6;
  const xfmrLoss = distTechLoss * 0.4;
  const available = Math.max(0, distEntry - distTechLoss);
  const theftLoss = available * thP / 100;
  const meterLoss = available * mtP / 100;
  const commercialLoss = theftLoss + meterLoss;
  const billed = Math.max(0, available - commercialLoss);
  const billingEff = inp > 0 ? (billed / inp) * 100 : 0;
  const revBilled = billed * 0.4;
  const revCollected = revBilled * ceP / 100;
  const revGap = revBilled - revCollected;
  const atc = Math.max(0, (1 - (billingEff / 100) * (ceP / 100)) * 100);
  const collEquiv = billed * ceP / 100;
  return {
    transLoss, distEntry, distTechLoss, lineLoss, xfmrLoss, available,
    theftLoss, meterLoss, commercialLoss, billed, billingEff,
    revBilled, revCollected, revGap, atc, collEquiv,
    techLoss: transLoss + distTechLoss, techPct: trP + dtP,
    commPct: inp > 0 ? (commercialLoss / inp) * 100 : 0,
  };
}

function atcCol(v) {
  return v < 10 ? '#22c55e' : v < 20 ? '#eab308' : v < 30 ? '#f97316' : '#ef4444';
}

function hBand(x1, t1, b1, x2, t2, b2) {
  const cx = (x1 + x2) / 2;
  return `M${x1},${t1} C${cx},${t1} ${cx},${t2} ${x2},${t2} L${x2},${b2} C${cx},${b2} ${cx},${b1} ${x1},${b1} Z`;
}

function vBand(cx, y1, w1, y2, w2) {
  const my = (y1 + y2) / 2;
  return `M${cx - w1 / 2},${y1} C${cx - w1 / 2},${my} ${cx - w2 / 2},${my} ${cx - w2 / 2},${y2} L${cx + w2 / 2},${y2} C${cx + w2 / 2},${my} ${cx + w1 / 2},${my} ${cx + w1 / 2},${y1} Z`;
}

function Sankey({ d, inp }) {
  const W = 860, H = 320, cy = 148, maxH = 105;
  const xs = [35, 225, 415, 605, 825];
  const stVals = [inp, d.distEntry, d.available, d.billed, d.collEquiv];
  const hs = stVals.map(v => Math.max(5, (Math.max(0, v) / Math.max(1, inp)) * maxH));
  const pcts = stVals.map(v => inp > 0 ? (v / inp * 100) : 0);
  const stNames = ['Energy Input', 'Dist. Entry', 'Available', 'Billed', 'Collected'];

  const losses = [
    { mu: d.transLoss, label: 'Transmission', sub: `${(d.transLoss / inp * 100).toFixed(1)}% of input`, color: '#ef4444', dir: -1 },
    { mu: d.distTechLoss, label: 'Dist. Technical', sub: `Line ${d.lineLoss.toFixed(0)} · Xfmr ${d.xfmrLoss.toFixed(0)}`, color: '#f97316', dir: -1 },
    { mu: d.commercialLoss, label: 'Commercial', sub: `Theft ${d.theftLoss.toFixed(0)} · Meter ${d.meterLoss.toFixed(0)}`, color: '#eab308', dir: 1 },
    { mu: d.billed - d.collEquiv, label: 'Collection Gap', sub: `₹${d.revGap.toFixed(0)} Cr gap`, color: '#f59e0b', dir: 1 },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ maxHeight: 310 }}>
      <defs>
        <linearGradient id="gf" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
          <stop offset="50%" stopColor="#16a34a" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.2} />
        </linearGradient>
        <filter id="gl"><feGaussianBlur stdDeviation="2.5" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {[0, 1, 2, 3].map(i => (
        <path key={i} d={hBand(xs[i] + 5, cy - hs[i] / 2, cy + hs[i] / 2, xs[i + 1] - 5, cy - hs[i + 1] / 2, cy + hs[i + 1] / 2)} fill="url(#gf)" />
      ))}

      {xs.map((x, i) => (
        <rect key={`b${i}`} x={x - 3} y={cy - hs[i] / 2} width={6} height={Math.max(5, hs[i])}
          rx={3} fill={i === 0 || i === 4 ? '#22c55e' : '#4ade80'} opacity={0.9} filter="url(#gl)" />
      ))}

      {losses.map((l, i) => {
        const lH = Math.max(0, hs[i] - hs[i + 1]);
        if (l.mu < 0.5) return null;
        const midX = (xs[i] + xs[i + 1]) / 2;
        const midH = (hs[i] + hs[i + 1]) / 2;
        const srcY = l.dir < 0 ? cy - midH / 2 : cy + midH / 2;
        const destY = l.dir < 0 ? 48 : H - 60;
        const srcW = Math.min(Math.max(lH, 5), 30);
        const destW = Math.min(srcW * 0.45, 10);
        return (
          <g key={`l${i}`}>
            <path d={vBand(midX, srcY, srcW, destY, destW)} fill={l.color} opacity={0.3} />
            <circle cx={midX} cy={srcY} r={2.5} fill={l.color} opacity={0.9} />
            <text x={midX} y={l.dir < 0 ? 24 : H - 38} fill={l.color} fontSize={10} fontWeight={600} textAnchor="middle">{l.label}</text>
            <text x={midX} y={l.dir < 0 ? 36 : H - 26} fill={l.color} fontSize={9} textAnchor="middle" opacity={0.85} fontFamily="monospace">{l.mu.toFixed(0)} MU</text>
            <text x={midX} y={l.dir < 0 ? 47 : H - 15} fill={l.color} fontSize={8} textAnchor="middle" opacity={0.6}>{l.sub}</text>
          </g>
        );
      })}

      {xs.map((x, i) => (
        <g key={`s${i}`}>
          <text x={x} y={cy + maxH / 2 + 22} fill="#a1a1aa" fontSize={10} fontWeight={600} textAnchor="middle">{stNames[i]}</text>
          <text x={x} y={cy + maxH / 2 + 35} fill="#71717a" fontSize={9} textAnchor="middle" fontFamily="monospace">{stVals[i].toFixed(0)} MU</text>
          <text x={x} y={cy + maxH / 2 + 47} fill="#52525b" fontSize={8} textAnchor="middle" fontFamily="monospace">({pcts[i].toFixed(1)}%)</text>
        </g>
      ))}

      {[0, 1, 2, 3, 4, 5].map(i => (
        <circle key={`p${i}`} r={2} fill="#4ade80" opacity={0.55}>
          <animateMotion dur="4.5s" begin={`${i * 0.75}s`} repeatCount="indefinite" path={`M${xs[0]},${cy} L${xs[4]},${cy}`} />
        </circle>
      ))}

      {/* Legend */}
      <g transform={`translate(${W - 155}, 10)`}>
        <rect x={0} y={0} width={145} height={72} fill="#09090b" stroke="#27272a" rx={6} opacity={0.9} />
        {[
          { color: '#22c55e', label: 'Useful energy flow' },
          { color: '#ef4444', label: 'Technical losses' },
          { color: '#eab308', label: 'Commercial losses' },
          { color: '#f59e0b', label: 'Collection gap' },
        ].map((item, i) => (
          <g key={item.label} transform={`translate(10, ${12 + i * 16})`}>
            <rect width={10} height={10} fill={item.color} rx={2} opacity={0.7} />
            <text x={16} y={9} fill="#71717a" fontSize={9}>{item.label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function Benchmark({ atc }) {
  const W = 640, H = 320, mx = 108, bw = 420, bh = 22, gap = 7;
  const maxV = 42;
  const userX = mx + Math.min(atc, maxV) / maxV * bw;
  const endY = 38 + DISCOMS.length * (bh + gap);
  const thresholds = [
    { x: 10, label: '10%', color: '#22c55e' },
    { x: 20, label: '20%', color: '#eab308' },
    { x: 30, label: '30%', color: '#f97316' },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ maxHeight: 310 }}>
      <text x={W / 2} y={18} fill="#a1a1aa" fontSize={12} fontWeight={600} textAnchor="middle">
        DISCOM AT&C Loss Benchmarking
      </text>
      <line x1={mx} y1={30} x2={mx} y2={endY} stroke="#27272a" strokeWidth={1} />

      {thresholds.map(t => {
        const tx = mx + t.x / maxV * bw;
        return (
          <g key={t.label}>
            <line x1={tx} y1={30} x2={tx} y2={endY} stroke={t.color} strokeWidth={1} opacity={0.15} />
            <text x={tx} y={endY + 12} fill={t.color} fontSize={8} textAnchor="middle" opacity={0.5}>
              {t.label}
            </text>
          </g>
        );
      })}

      {DISCOMS.map((dc, i) => {
        const y = 38 + i * (bh + gap);
        const w = dc.atc / maxV * bw;
        const c = atcCol(dc.atc);
        return (
          <g key={dc.name}>
            <text x={mx - 8} y={y + bh / 2 + 4} fill="#a1a1aa" fontSize={10} textAnchor="end">
              {dc.name}
            </text>
            <rect x={mx} y={y} width={w} height={bh} fill={c} opacity={0.55} rx={4} />
            <rect x={mx} y={y} width={w} height={bh} fill={c} opacity={0.15} rx={4} filter="url(#gl)" />
            <text x={mx + w + 8} y={y + bh / 2 + 4} fill="#71717a" fontSize={10} fontFamily="monospace">
              {dc.atc}%
            </text>
          </g>
        );
      })}

      <line x1={userX} y1={32} x2={userX} y2={endY}
        stroke="#818cf8" strokeWidth={2} strokeDasharray="4,3" opacity={0.85} />
      <polygon
        points={`${userX - 6},${endY + 6} ${userX + 6},${endY + 6} ${userX},${endY}`}
        fill="#6366f1" />
      <rect x={userX - 34} y={endY + 10} width={68} height={22} fill="#6366f1" rx={5} />
      <text x={userX} y={endY + 25} fill="#fff" fontSize={10} fontWeight={600} textAnchor="middle"
        fontFamily="monospace">
        You: {atc.toFixed(1)}%
      </text>
    </svg>
  );
}

function TheorySVGATCFlow() {
  return (
    <svg viewBox="0 0 760 300" style={{ width: '100%', maxWidth: 760, height: 'auto', margin: '20px 0' }}>
      <rect width="760" height="300" rx="12" fill="#111114" stroke="#27272a" />
      <text x="380" y="28" textAnchor="middle" fill="#d4d4d8" fontSize={14} fontWeight={700}>AT&C Loss — Energy & Revenue Flow Chain</text>

      {/* Energy flow pipeline */}
      {/* Energy Input */}
      <rect x="40" y="60" width="120" height="50" rx="8" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth={2} />
      <text x="100" y="82" textAnchor="middle" fill="#a5b4fc" fontSize={10} fontWeight={600}>Energy Input</text>
      <text x="100" y="96" textAnchor="middle" fill="#71717a" fontSize={8}>1000 MU</text>

      {/* Arrow */}
      <defs>
        <marker id="atcArr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#52525b" />
        </marker>
      </defs>
      <line x1="160" y1="85" x2="195" y2="85" stroke="#52525b" strokeWidth={1.5} markerEnd="url(#atcArr)" />

      {/* Technical loss leak */}
      <line x1="135" y1="110" x2="135" y2="145" stroke="#ef4444" strokeWidth={1.5} markerEnd="url(#atcArr)" />
      <rect x="100" y="145" width="70" height="30" rx="4" fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1} />
      <text x="135" y="160" textAnchor="middle" fill="#ef4444" fontSize={8}>Technical Loss</text>
      <text x="135" y="172" textAnchor="middle" fill="#71717a" fontSize={7}>I²R + iron losses</text>

      {/* Energy Available */}
      <rect x="200" y="60" width="120" height="50" rx="8" fill="rgba(245,158,11,0.1)" stroke="#f59e0b" strokeWidth={1.5} />
      <text x="260" y="78" textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight={600}>Energy Available</text>
      <text x="260" y="92" textAnchor="middle" fill="#f59e0b" fontSize={9}>for Sale</text>
      <text x="260" y="106" textAnchor="middle" fill="#71717a" fontSize={8}>850 MU</text>

      <line x1="320" y1="85" x2="355" y2="85" stroke="#52525b" strokeWidth={1.5} markerEnd="url(#atcArr)" />

      {/* Commercial loss leak */}
      <line x1="295" y1="110" x2="295" y2="145" stroke="#ef4444" strokeWidth={1.5} markerEnd="url(#atcArr)" />
      <rect x="260" y="145" width="70" height="30" rx="4" fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1} />
      <text x="295" y="160" textAnchor="middle" fill="#ef4444" fontSize={8}>Commercial Loss</text>
      <text x="295" y="172" textAnchor="middle" fill="#71717a" fontSize={7}>Theft, meter errors</text>

      {/* Energy Billed */}
      <rect x="360" y="60" width="120" height="50" rx="8" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth={1.5} />
      <text x="420" y="82" textAnchor="middle" fill="#22c55e" fontSize={10} fontWeight={600}>Energy Billed</text>
      <text x="420" y="96" textAnchor="middle" fill="#71717a" fontSize={8}>750 MU</text>

      <line x1="480" y1="85" x2="515" y2="85" stroke="#52525b" strokeWidth={1.5} markerEnd="url(#atcArr)" />

      {/* Collection loss leak */}
      <line x1="455" y1="110" x2="455" y2="145" stroke="#ef4444" strokeWidth={1.5} markerEnd="url(#atcArr)" />
      <rect x="420" y="145" width="70" height="30" rx="4" fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1} />
      <text x="455" y="160" textAnchor="middle" fill="#ef4444" fontSize={8}>Collection Gap</text>
      <text x="455" y="172" textAnchor="middle" fill="#71717a" fontSize={7}>Non-payment</text>

      {/* Revenue Collected */}
      <rect x="520" y="60" width="120" height="50" rx="8" fill="rgba(34,211,238,0.1)" stroke="#22d3ee" strokeWidth={2} />
      <text x="580" y="78" textAnchor="middle" fill="#22d3ee" fontSize={9} fontWeight={600}>Revenue</text>
      <text x="580" y="92" textAnchor="middle" fill="#22d3ee" fontSize={9}>Collected</text>
      <text x="580" y="106" textAnchor="middle" fill="#71717a" fontSize={8}>675 MU equiv.</text>

      {/* AT&C Loss result */}
      <rect x="660" y="55" width="80" height="60" rx="8" fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth={2} />
      <text x="700" y="76" textAnchor="middle" fill="#ef4444" fontSize={10} fontWeight={700}>AT&C</text>
      <text x="700" y="92" textAnchor="middle" fill="#ef4444" fontSize={14} fontWeight={700}>32.5%</text>
      <line x1="640" y1="85" x2="658" y2="85" stroke="#52525b" strokeWidth={1.5} markerEnd="url(#atcArr)" />

      {/* Formula */}
      <rect x="140" y="210" width="480" height="70" rx="8" fill="#18181b" stroke="#27272a" />
      <text x="380" y="232" textAnchor="middle" fill="#c4b5fd" fontSize={11} fontFamily="monospace">BE = Energy Billed / Energy Input = 750/1000 = 75%</text>
      <text x="380" y="250" textAnchor="middle" fill="#c4b5fd" fontSize={11} fontFamily="monospace">CE = Revenue Collected / Revenue Billed = 90%</text>
      <text x="380" y="268" textAnchor="middle" fill="#f59e0b" fontSize={12} fontFamily="monospace" fontWeight={700}>AT&C = [1 - (BE x CE)] x 100 = [1 - 0.675] x 100 = 32.5%</text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>What is AT&C Loss?</h2>
      <p style={S.p}>
        AT&C stands for <strong style={{ color: '#e4e4e7' }}>Aggregate Technical & Commercial Loss</strong>. It is the single
        most important metric for measuring the financial and operational health of an electricity distribution
        company (DISCOM). Unlike simple technical loss, AT&C captures the complete picture — from energy entering
        the distribution system to revenue actually collected by the utility.
      </p>

      <TheorySVGATCFlow />
      <p style={S.p}>
        The metric was introduced by the Ministry of Power, Government of India, to provide a unified measure
        that accounts for technical losses in the network, commercial losses (theft, metering deficiencies),
        and collection inefficiency. A DISCOM with high AT&C losses is essentially purchasing energy it can
        never monetize — a direct path to financial insolvency.
      </p>
      <h3 style={S.h3}>Formula Derivation</h3>
      <p style={S.p}>The AT&C loss is derived step by step from the energy flow chain:</p>
      <span style={S.eq}>Technical Loss = (Energy Input − Energy Available for Sale) / Energy Input</span>
      <span style={S.eq}>Commercial Loss = (Energy Available − Energy Billed) / Energy Input</span>
      <span style={S.eq}>Distribution Loss = Technical + Commercial = (Input − Billed) / Input</span>
      <span style={S.eq}>Billing Efficiency (BE) = Energy Billed / Energy Input</span>
      <span style={S.eq}>Collection Efficiency (CE) = Revenue Collected / Revenue Billed</span>
      <span style={S.eq}>AT&C Loss (%) = [1 − (BE × CE)] × 100</span>
      <p style={S.p}>
        The elegance of this formula is that it captures the entire value chain in a single number. Even if a
        DISCOM has low technical losses, poor billing or collection can make AT&C unacceptably high.
      </p>

      <h2 style={S.h2}>Technical Losses — Breakdown</h2>
      <h3 style={S.h3}>Transmission Losses (3–5%)</h3>
      <p style={S.p}>
        Energy lost in high-voltage transmission from generating stations to distribution substations. This
        includes PGCIL (Power Grid Corporation of India) interstate 765/400/220 kV lines and state Transco
        intrastate lines. Primarily consists of I²R losses in long conductors and corona losses at EHV levels,
        especially during adverse weather conditions.
      </p>
      <h3 style={S.h3}>Distribution Line Losses (6–10%)</h3>
      <p style={S.p}>
        I²R losses in the distribution network — 33 kV sub-transmission, 11 kV primary distribution, and
        415 V LT (low tension) secondary distribution. LT lines contribute the most losses because they carry
        the highest currents at the lowest voltage. Long single-phase LT lines in rural areas are especially
        lossy, sometimes exceeding 20% on individual feeders.
      </p>
      <h3 style={S.h3}>Transformer Losses</h3>
      <p style={S.p}>Distribution transformers have two components of loss:</p>
      <span style={S.eq}>P_core (iron loss) = constant — hysteresis + eddy current, independent of load</span>
      <span style={S.eq}>P_cu (copper loss) = K × (Load / Rating)² — varies with the square of loading</span>
      <p style={S.p}>
        Overloaded transformers have disproportionately high copper losses. Under-loaded transformers waste
        energy on core losses relative to throughput. Optimal loading is typically 50–80% of nameplate rating.
        India has over 12 million distribution transformers, and their aggregate losses are substantial.
      </p>
      <h3 style={S.h3}>International Comparison</h3>
      <table style={S.tbl}>
        <thead><tr><th style={S.th}>Country</th><th style={S.th}>T&D Loss (%)</th><th style={S.th}>Notes</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Japan</td><td style={S.td}>~4%</td><td style={S.td}>Compact grid, underground cables</td></tr>
          <tr><td style={S.td}>USA</td><td style={S.td}>~6%</td><td style={S.td}>Large grid, well-maintained</td></tr>
          <tr><td style={S.td}>UK</td><td style={S.td}>~8%</td><td style={S.td}>Dense, modernized network</td></tr>
          <tr><td style={S.td}>China</td><td style={S.td}>~6%</td><td style={S.td}>Heavy UHV investment</td></tr>
          <tr><td style={S.td}>Brazil</td><td style={S.td}>~16%</td><td style={S.td}>Large, dispersed grid</td></tr>
          <tr><td style={S.td}>India</td><td style={{ ...S.td, color: '#ef4444', fontWeight: 600 }}>~18%</td><td style={S.td}>One of the highest globally</td></tr>
        </tbody>
      </table>

      <h2 style={S.h2}>Commercial Losses — Categories</h2>
      <h3 style={S.h3}>Theft & Unauthorized Use</h3>
      <ul style={S.ul}>
        <li style={S.li}>Direct hooking — tapping from bare overhead LT lines, common in rural/semi-urban areas</li>
        <li style={S.li}>Meter tampering — reversing connections, short-circuiting CT secondaries, breaking seals</li>
        <li style={S.li}>Bypassing meter — connecting load before the meter point using concealed wiring</li>
        <li style={S.li}>Organized theft — systematic unauthorized connections, sometimes with local collusion</li>
      </ul>
      <h3 style={S.h3}>Metering Inefficiency</h3>
      <ul style={S.ul}>
        <li style={S.li}>Defective or stuck meters that stop recording consumption entirely</li>
        <li style={S.li}>Old electromechanical meters with ±3–5% measurement error at low loads</li>
        <li style={S.li}>Estimation-based billing for unmetered connections (agricultural pumps in many states)</li>
        <li style={S.li}>CT/PT ratio errors in HT (high tension) consumer metering installations</li>
      </ul>
      <h3 style={S.h3}>Billing Inefficiency</h3>
      <ul style={S.ul}>
        <li style={S.li}>Data entry errors during manual meter reading transcription</li>
        <li style={S.li}>Incorrect tariff category application (domestic vs commercial rates)</li>
        <li style={S.li}>Delayed billing cycles creating estimation backlogs</li>
        <li style={S.li}>Un-updated consumer databases — demolished or shifted premises still on records</li>
      </ul>

      <h2 style={S.h2}>Collection Efficiency</h2>
      <p style={S.p}>
        Collection Efficiency = (Revenue Collected / Revenue Billed) × 100. Even after energy is correctly
        metered and billed, DISCOMs struggle to collect full payment. Key issues include:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>Government departments are the biggest defaulters — they consume power but delay payment,
          creating massive arrears sometimes exceeding ₹1,000 crore per state</li>
        <li style={S.li}>Political interference — announcements of bill waivers disincentivize timely payment by
          consumers expecting future waivers</li>
        <li style={S.li}>Agricultural subsidy delays — state governments commit subsidies but release funds late,
          creating working capital gaps for DISCOMs</li>
        <li style={S.li}>Dispute resolution delays — consumers contest inflated bills, payments stuck in litigation</li>
      </ul>
      <p style={S.p}>
        Smart prepaid metering eliminates collection losses by design — consumers pay before consuming energy,
        achieving ~100% collection efficiency. This single technology addresses the largest controllable
        component of AT&C loss in many DISCOMs.
      </p>

      <h2 style={S.h2}>Why AT&C Matters More Than Technical Loss</h2>
      <p style={S.p}>
        Technical loss alone does not capture the full financial reality of a DISCOM. Consider two utilities:
      </p>
      <table style={S.tbl}>
        <thead><tr><th style={S.th}>Metric</th><th style={S.th}>DISCOM A</th><th style={S.th}>DISCOM B</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Technical Loss</td><td style={S.td}>15%</td><td style={S.td}>10%</td></tr>
          <tr><td style={S.td}>Billing Efficiency</td><td style={S.td}>85%</td><td style={S.td}>72%</td></tr>
          <tr><td style={S.td}>Collection Efficiency</td><td style={S.td}>95%</td><td style={S.td}>80%</td></tr>
          <tr><td style={S.td}>AT&C Loss</td><td style={{ ...S.td, color: '#eab308', fontWeight: 600 }}>19.3%</td><td style={{ ...S.td, color: '#ef4444', fontWeight: 600 }}>42.4%</td></tr>
        </tbody>
      </table>
      <p style={S.p}>
        DISCOM B has lower technical loss but far worse AT&C because of poor billing and collection. The AT&C
        metric reveals the true "revenue gap" — the fraction of energy purchased that never translates into
        revenue. This is why regulators and investors focus on AT&C rather than technical loss alone.
      </p>

      <h3 style={S.h3}>Typical Loss Waterfall (Indian Average)</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Stage</th>
            <th style={S.th}>Loss Component</th>
            <th style={S.th}>% of Input</th>
            <th style={S.th}>Cumulative</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={S.td}>Transmission</td><td style={S.td}>EHV & HV line I²R + corona</td><td style={S.td}>3.5%</td><td style={S.td}>3.5%</td></tr>
          <tr><td style={S.td}>Sub-transmission</td><td style={S.td}>33 kV lines & substations</td><td style={S.td}>2.0%</td><td style={S.td}>5.5%</td></tr>
          <tr><td style={S.td}>11 kV Distribution</td><td style={S.td}>Primary feeder I²R</td><td style={S.td}>3.5%</td><td style={S.td}>9.0%</td></tr>
          <tr><td style={S.td}>DT Losses</td><td style={S.td}>Core + copper losses</td><td style={S.td}>3.0%</td><td style={S.td}>12.0%</td></tr>
          <tr><td style={S.td}>LT Lines</td><td style={S.td}>415 V secondary network</td><td style={S.td}>6.0%</td><td style={S.td}>18.0%</td></tr>
          <tr><td style={S.td}>Theft</td><td style={S.td}>Unauthorized tapping</td><td style={S.td}>5.0%</td><td style={S.td}>23.0%</td></tr>
          <tr><td style={S.td}>Metering</td><td style={S.td}>Defective + unmetered</td><td style={S.td}>3.0%</td><td style={S.td}>26.0%</td></tr>
        </tbody>
      </table>

      <h2 style={S.h2}>UDAY Scheme</h2>
      <p style={S.p}>
        The Ujwal DISCOM Assurance Yojana (UDAY), launched in November 2015, was the Government of India's
        flagship scheme to rescue DISCOMs from a debt crisis that had accumulated to over ₹4.3 lakh crore.
      </p>
      <ul style={S.ul}>
        <li style={S.li}>States took over ₹2.32 lakh crore of DISCOM debt (75% converted to state bonds at lower interest)</li>
        <li style={S.li}>Target: reduce AT&C losses to 15% nationally by FY 2018–19</li>
        <li style={S.li}>Mandated smart metering, feeder separation, LED distribution, energy efficiency</li>
        <li style={S.li}>Required quarterly tariff revisions linked to fuel cost changes</li>
      </ul>
      <p style={S.p}>
        Results were mixed: states like Andhra Pradesh and Gujarat made real progress, but most missed the 15%
        target. DISCOM finances improved temporarily due to debt transfer, but structural problems — tariff
        inadequacy, subsidy delays, high losses — persisted in many states. The scheme was succeeded by the
        Revamped Distribution Sector Scheme (RDSS) in 2021, which shifted focus to smart metering infrastructure
        with a ₹3.03 lakh crore outlay and a target of 250 million smart prepaid meters.
      </p>

      <h2 style={S.h2}>Smart Metering & Solutions</h2>
      <h3 style={S.h3}>Advanced Metering Infrastructure (AMI)</h3>
      <p style={S.p}>
        AMI enables real-time consumption monitoring, tamper alerts, remote connect/disconnect, time-of-use
        pricing, and automated billing. It eliminates manual reading errors, detects theft instantly through
        energy balance analysis, and enables demand-side management programmes.
      </p>
      <h3 style={S.h3}>Prepaid Metering</h3>
      <p style={S.p}>
        Consumers purchase energy credits in advance. Automatic disconnection at zero balance eliminates
        collection losses entirely. EESL (Energy Efficiency Services Ltd) is deploying smart prepaid meters
        across India — one of the world's largest metering transformation programmes targeting 250 million
        installations.
      </p>
      <h3 style={S.h3}>HVDS (High Voltage Distribution System)</h3>
      <p style={S.p}>
        Replaces long LT (415 V) lines with 11 kV HT lines extending closer to consumers, with small
        (16–25 kVA) transformers near each consumer cluster. Current reduces by ~27× at 11 kV versus 415 V
        for the same power, so I²R losses drop dramatically. Additionally, theft from insulated 11 kV HT
        lines is far more difficult and dangerous than from bare overhead LT lines.
      </p>
      <h3 style={S.h3}>Feeder-Level Energy Audit</h3>
      <p style={S.p}>
        Installing meters at each distribution transformer (DTR) and comparing energy input with billed
        consumption enables identification of high-loss feeders. This allows targeted anti-theft drives
        and infrastructure upgrades where they have the greatest impact on AT&C reduction.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>AP DISCOM Context</span>
        <p style={S.ctxP}>
          Andhra Pradesh has two distribution companies: APSPDCL (southern) with AT&C ~14% and APEPDCL (eastern)
          with AT&C ~9% — among the best-performing DISCOMs in India. Key strategies include aggressive HVDS
          conversion (over 90% of agricultural feeders), feeder segregation (separating agricultural from domestic
          feeders), and early AMI deployment in urban circles.
        </p>
        <p style={{ ...S.ctxP, marginTop: 8 }}>
          The state faces unique challenges: agricultural electricity subsidy exceeds ₹9,000 crore per year, and
          many pump-sets remain unmetered, making accurate loss computation difficult. APERC tariff orders mandate
          annual AT&C reduction targets. The cross-subsidy structure has industrial and commercial consumers
          subsidizing agricultural consumption — a politically sensitive but financially critical arrangement.
        </p>
      </div>

      <h2 style={S.h2}>Regulatory Framework</h2>
      <h3 style={S.h3}>State ERCs</h3>
      <p style={S.p}>
        State Electricity Regulatory Commissions (e.g., APERC for Andhra Pradesh) set retail tariffs, approve
        capital expenditure plans, and mandate AT&C reduction trajectories. DISCOMs file Annual Revenue
        Requirements (ARR) that include projected AT&C loss levels as a key input to tariff computation.
      </p>
      <h3 style={S.h3}>True-Up Mechanism</h3>
      <p style={S.p}>
        If actual AT&C losses exceed the ERC-approved target, the DISCOM bears the financial shortfall — the
        gap cannot be passed to consumers as a tariff increase. If AT&C improves beyond the target, the DISCOM
        retains the efficiency gains. This performance-linked approach creates a direct financial incentive for
        loss reduction. True-up reconciliation typically occurs every 1–2 years.
      </p>
      <h3 style={S.h3}>CERC & Interstate Framework</h3>
      <p style={S.p}>
        The Central Electricity Regulatory Commission handles interstate transmission loss norms (currently ~3.5%
        for the national grid). These losses are allocated pro-rata to DISCOMs drawing power from the central
        generating pool. CERC's performance-based regulation at the national level rewards states that achieve
        faster AT&C reduction with preferential power allocation.
      </p>

      <h2 style={S.h2}>Financial Impact</h2>
      <p style={S.p}>
        India's DISCOMs collectively purchase about 1,400 billion units (BU) annually. At a national average
        AT&C loss of ~22%, approximately 308 BU of energy value is lost every year. At an average cost of supply
        of ₹5.5/kWh, this represents an annual revenue loss of roughly ₹1.7 lakh crore (~$20 billion) — money
        that DISCOMs spend on purchasing power but can never recover.
      </p>
      <p style={S.p}>
        This revenue gap is the primary driver of DISCOM indebtedness. As of 2023, total DISCOM payables exceeded
        ₹6 lakh crore, with many utilities technically insolvent. High AT&C losses create a vicious cycle: losses
        erode finances → DISCOMs cannot invest in infrastructure → network deteriorates → losses increase further.
        Breaking this cycle requires simultaneous action on technology (smart meters, HVDS), governance (anti-theft
        enforcement), and regulation (cost-reflective tariffs).
      </p>

      <h2 style={S.h2}>References</h2>
      <ul style={S.ul}>
        <li style={S.li}>PFC (Power Finance Corporation) — Report on Performance of State Power Utilities (Annual)</li>
        <li style={S.li}>APERC Tariff Orders — apspdcl.in / apepdcl.in</li>
        <li style={S.li}>UDAY Dashboard — uday.gov.in</li>
        <li style={S.li}>CEA (Central Electricity Authority) — General Review (Annual)</li>
        <li style={S.li}>Ministry of Power — RDSS (Revamped Distribution Sector Scheme) Guidelines, 2021</li>
        <li style={S.li}>EESL Smart Meter Programme — eeslindia.org</li>
        <li style={S.li}>NITI Aayog — India Energy Outlook Reports</li>
        <li style={S.li}>Prayas Energy Group — Electricity Distribution: Key Issues, Reforms and Way Forward</li>
      </ul>
    </div>
  );
}

export default function ATCLosses() {
  const [tab, setTab] = useState('sim');
  const [inp, setInp] = useState(10000);
  const [trP, setTrP] = useState(3);
  const [dtP, setDtP] = useState(7);
  const [thP, setThP] = useState(3);
  const [mtP, setMtP] = useState(1);
  const [ceP, setCeP] = useState(95);

  const d = useMemo(() => calc(inp, trP, dtP, thP, mtP, ceP), [inp, trP, dtP, thP, mtP, ceP]);

  const preset = useCallback((k) => {
    const [i, t, dt, th, m, c] = PR[k];
    setInp(i); setTrP(t); setDtP(dt); setThP(th); setMtP(m); setCeP(c);
  }, []);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'sim')} onClick={() => setTab('sim')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'sim' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Sankey d={d} inp={inp} />
          </div>

          <div style={{ padding: '10px 24px', background: '#0c0c10', borderTop: '1px solid #1e1e2e' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#a1a1aa', lineHeight: 2, textAlign: 'center' }}>
              <span style={{ color: '#c4b5fd', fontWeight: 600 }}>AT&C Loss</span>
              {' = [1 − (Billing Eff × Collection Eff)] × 100'}
              <br />
              {'= [1 − ('}{d.billed.toFixed(0)}{' / '}{inp}{' × ₹'}{d.revCollected.toFixed(0)}{' / ₹'}{d.revBilled.toFixed(0)}{')]  × 100'}
              <br />
              {'= [1 − ('}{(d.billingEff / 100).toFixed(4)}{' × '}{(ceP / 100).toFixed(2)}{')]  × 100 = '}
              <span style={{ color: atcCol(d.atc), fontWeight: 700, fontSize: 16 }}>{d.atc.toFixed(1)}%</span>
            </div>
          </div>

          <div style={{ padding: '4px 16px 8px', display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
            <Benchmark atc={d.atc} />
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Input (MU)</span>
              <input type="range" min={1000} max={50000} step={1000} value={inp}
                onChange={e => setInp(+e.target.value)} style={S.slider} />
              <span style={S.val}>{inp.toLocaleString()}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Trans. Loss</span>
              <input type="range" min={1} max={8} step={0.5} value={trP}
                onChange={e => setTrP(+e.target.value)} style={S.slider} />
              <span style={S.val}>{trP}%</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Dist. Tech.</span>
              <input type="range" min={5} max={20} step={1} value={dtP}
                onChange={e => setDtP(+e.target.value)} style={S.slider} />
              <span style={S.val}>{dtP}%</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Theft</span>
              <input type="range" min={0} max={25} step={1} value={thP}
                onChange={e => setThP(+e.target.value)} style={S.slider} />
              <span style={S.val}>{thP}%</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Metering Err.</span>
              <input type="range" min={0} max={10} step={0.5} value={mtP}
                onChange={e => setMtP(+e.target.value)} style={S.slider} />
              <span style={S.val}>{mtP}%</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Coll. Eff.</span>
              <input type="range" min={70} max={100} step={1} value={ceP}
                onChange={e => setCeP(+e.target.value)} style={S.slider} />
              <span style={S.val}>{ceP}%</span>
            </div>
            <div style={S.bg}>
              <button style={S.btn(false)} onClick={() => preset('best')}>Best DISCOM</button>
              <button style={S.btn(false)} onClick={() => preset('avg')}>Average</button>
              <button style={S.btn(false)} onClick={() => preset('worst')}>Worst</button>
            </div>
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>AT&C Loss</span>
              <span style={{ ...S.rv, color: atcCol(d.atc) }}>{d.atc.toFixed(1)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Energy Input</span>
              <span style={S.rv}>{inp.toLocaleString()} MU</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Tech. Loss</span>
              <span style={{ ...S.rv, color: '#ef4444' }}>{d.techLoss.toFixed(0)} MU ({d.techPct}%)</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Comm. Loss</span>
              <span style={{ ...S.rv, color: '#eab308' }}>{d.commercialLoss.toFixed(0)} MU ({d.commPct.toFixed(1)}%)</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Billed</span>
              <span style={S.rv}>{d.billed.toFixed(0)} MU</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Rev. Billed</span>
              <span style={S.rv}>₹{d.revBilled.toFixed(0)} Cr</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Rev. Collected</span>
              <span style={S.rv}>₹{d.revCollected.toFixed(0)} Cr</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Revenue Gap</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>₹{d.revGap.toFixed(0)} Cr</span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
