import React, { useState, useMemo } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { padding: '12px 16px 4px', overflowX: 'auto', display: 'flex', justifyContent: 'center' },
  graphWrap: { padding: '4px 16px 8px', overflowX: 'auto', display: 'flex', justifyContent: 'center' },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 8 },
  label: { fontSize: 12, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 110, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 36, textAlign: 'right' },
  results: { display: 'flex', gap: 24, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 10, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 16, fontWeight: 700, fontFamily: 'monospace' },
  btn: (a, c) => ({ padding: '4px 10px', borderRadius: 6, border: `1px solid ${a ? (c || '#6366f1') : '#27272a'}`, background: a ? (c ? c + '22' : 'rgba(99,102,241,0.15)') : 'transparent', color: a ? (c || '#a5b4fc') : '#71717a', fontSize: 11, cursor: 'pointer', fontWeight: a ? 600 : 400, transition: 'all 0.15s' }),
  bg: { display: 'flex', gap: 3 },
  sel: { padding: '4px 8px', borderRadius: 6, border: '1px solid #27272a', background: '#18181b', color: '#e4e4e7', fontSize: 12, cursor: 'pointer', outline: 'none' },
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

/* ─── Constants ─── */
const NH = 10, PF = 0.85, ZS = 0.012, VN = 240;
const CHRG = {
  L1: { kw: 3.3, nm: 'L1 · 3.3 kW', c: '#22c55e' },
  L2: { kw: 7.2, nm: 'L2 · 7.2 kW', c: '#3b82f6' },
  DC: { kw: 50, nm: 'DC · 50 kW', c: '#ef4444' },
};
const BASE = [0.5, 0.4, 0.4, 0.4, 0.5, 0.8, 1.2, 1.8, 2.0, 1.5, 1.0, 1.0, 1.3, 1.5, 1.2, 1.0, 1.0, 1.5, 2.0, 2.5, 2.8, 2.5, 1.8, 1.0];
const EV_U = [0.08, 0.03, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.15, 0.55, 0.85, 1.0, 0.88, 0.55, 0.2];
const EV_S = [0.82, 0.88, 0.92, 0.80, 0.55, 0.25, 0.05, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.25, 0.55];
const HX = Array.from({ length: NH }, (_, i) => 130 + i * 60);

/* ─── Helpers ─── */
function lerp(a, h) {
  const i = Math.floor(h) % 24, f = h - Math.floor(h);
  return a[i] * (1 - f) + a[(i + 1) % 24] * f;
}

function therm(K, Ta) {
  const k = Math.max(0.01, K);
  const hs = Ta + 55 * Math.pow(k * k, 0.8) + 15 * Math.pow(k, 1.6);
  const faa = Math.exp(15000 / 383 - 15000 / (hs + 273));
  const capped = Math.min(faa, 50000);
  return { hs, faa: capped, life: Math.min(40, 180000 / Math.max(capped, 0.001) / 8760) };
}

function feederV(loads) {
  const v = [];
  let d = 0;
  for (let i = 0; i < loads.length; i++) {
    let I = 0;
    for (let j = i; j < loads.length; j++) I += (loads[j] * 1000) / (VN * PF);
    d += I * ZS;
    v.push(Math.max(180, VN - d));
  }
  return v;
}

function vC(v) { return v >= 228 ? '#22c55e' : v >= 216 ? '#eab308' : '#ef4444'; }
function ldC(p) { return p <= 80 ? '#22c55e' : p <= 100 ? '#eab308' : '#ef4444'; }
function tpC(t) { return t <= 110 ? '#22c55e' : t <= 130 ? '#eab308' : '#ef4444'; }
function lfC(y) { return y >= 15 ? '#22c55e' : y >= 5 ? '#eab308' : '#ef4444'; }

/* ─── Network Diagram ─── */
function Network({ evs, col, volts, kw, loadPct, hs, faa, life }) {
  const fw = Math.max(1.5, Math.min(5, kw / 20));
  return (
    <svg viewBox="0 0 880 120" style={{ width: '100%', maxWidth: 880 }}>
      <text x={12} y={16} fill="#71717a" fontSize={9} fontWeight={600}>11 kV</text>
      <line x1={10} y1={24} x2={55} y2={24} stroke="#818cf8" strokeWidth={2.5} />

      <circle cx={65} cy={24} r={11} fill="none" stroke="#818cf8" strokeWidth={1.8} />
      <circle cx={83} cy={24} r={11} fill="none" stroke="#a78bfa" strokeWidth={1.8} />
      <text x={74} y={44} fill="#52525b" fontSize={8} textAnchor="middle" fontWeight={600}>DTR</text>

      <text x={100} y={16} fill="#71717a" fontSize={9} fontWeight={600}>415 V LT</text>
      <line x1={95} y1={24} x2={HX[NH - 1] + 14} y2={24} stroke="#27272a" strokeWidth={fw + 1} />
      <line x1={95} y1={24} x2={HX[NH - 1] + 14} y2={24} stroke="#818cf8" strokeWidth={fw}
        strokeDasharray="8 5" opacity={kw > 0.5 ? 0.65 : 0.15}>
        <animate attributeName="stroke-dashoffset" from="13" to="0"
          dur={Math.max(0.15, 1.2 - kw / 120) + 's'} repeatCount="indefinite" />
      </line>

      {HX.map((x, i) => {
        const ev = evs[i] > 0;
        const v = volts[i];
        return (
          <g key={i}>
            <line x1={x} y1={24} x2={x} y2={38} stroke="#3f3f46" strokeWidth={0.8} />
            <polygon points={`${x - 12},${48} ${x},${36} ${x + 12},${48}`} fill="#27272a" stroke="#3f3f46" strokeWidth={0.7} />
            <rect x={x - 10} y={48} width={20} height={16} fill="#1e1e2e" stroke="#3f3f46" strokeWidth={0.7} rx={1} />
            <rect x={x - 6} y={51} width={4} height={4} fill="#fbbf24" opacity={ev ? 0.55 : 0.25} rx={0.5} />
            <rect x={x + 2} y={51} width={4} height={4} fill="#fbbf24" opacity={ev ? 0.55 : 0.25} rx={0.5} />
            <rect x={x - 2} y={58} width={5} height={6} fill="#18181b" rx={0.5} />
            {ev && (
              <g>
                <rect x={x - 8} y={68} width={16} height={10} fill={col} opacity={0.12} rx={3} stroke={col} strokeWidth={0.5} />
                <text x={x} y={75.5} fill={col} fontSize={6.5} textAnchor="middle" fontWeight={700}>EV</text>
                {evs[i] > 1 && <text x={x + 12} y={75} fill={col} fontSize={6} fontWeight={600}>×{evs[i]}</text>}
              </g>
            )}
            <text x={x} y={ev ? 92 : 78} fill={vC(v)} fontSize={7.5} textAnchor="middle" fontFamily="monospace" fontWeight={600}>
              {v.toFixed(0)}V
            </text>
          </g>
        );
      })}

      {/* Operating condition indicator */}
      <rect x={700} y={-4} width={175} height={10} rx={4}
        fill={loadPct > 100 ? '#ef4444' : loadPct > 80 ? '#f59e0b' : '#22c55e'} opacity={0.15} />
      <text x={787} y={4} textAnchor="middle" fontSize={7} fill={loadPct > 100 ? '#ef4444' : loadPct > 80 ? '#f59e0b' : '#22c55e'} fontWeight={700}>
        {loadPct > 100 ? 'CRITICAL — OVERLOADED' : loadPct > 80 ? 'STRESSED — NEAR CAPACITY' : 'NORMAL OPERATION'}
      </text>

      {/* Transformer health panel */}
      <rect x={700} y={3} width={175} height={114} fill="#0c0c0f" rx={8} stroke="#1e1e2e" strokeWidth={0.7} />
      <text x={787} y={15} fill="#52525b" fontSize={7.5} textAnchor="middle" fontWeight={700} letterSpacing="0.06em">
        TRANSFORMER HEALTH
      </text>
      <text x={710} y={30} fill="#71717a" fontSize={7.5}>Loading</text>
      <rect x={710} y={33} width={95} height={5} fill="#1e1e2e" rx={2.5} />
      <rect x={710} y={33} width={Math.min(95, loadPct * 0.95)} height={5} fill={ldC(loadPct)} rx={2.5} />
      <text x={812} y={38} fill={ldC(loadPct)} fontSize={10} fontWeight={700} fontFamily="monospace">{loadPct.toFixed(0)}%</text>

      <text x={710} y={52} fill="#71717a" fontSize={7.5}>Hot-spot</text>
      <rect x={710} y={55} width={95} height={5} fill="#1e1e2e" rx={2.5} />
      <rect x={710} y={55} width={Math.min(95, Math.max(0, (hs - 25) / 150) * 95)} height={5} fill={tpC(hs)} rx={2.5} />
      <text x={812} y={60} fill={tpC(hs)} fontSize={10} fontWeight={700} fontFamily="monospace">{hs.toFixed(0)}°C</text>

      <text x={710} y={78} fill="#71717a" fontSize={7.5}>Expected Life</text>
      <text x={862} y={78} fill={lfC(life)} fontSize={12} fontWeight={700} fontFamily="monospace" textAnchor="end">
        {life.toFixed(1)} yr
      </text>
      <text x={710} y={98} fill="#71717a" fontSize={7.5}>Aging Factor</text>
      <text x={862} y={98} fill={faa > 2 ? '#ef4444' : '#a1a1aa'} fontSize={12} fontWeight={700} fontFamily="monospace" textAnchor="end">
        {faa.toFixed(1)}×
      </text>
    </svg>
  );
}

/* ─── 24-Hour Load Profile Chart ─── */
function Chart({ profile, rKW, time, totalNow }) {
  const L = 55, R = 830, T = 18, B = 180;
  const W = R - L, H = B - T;
  const yMax = Math.max(rKW * 1.3, Math.max(...profile.map(p => p.total)) * 1.15, 20);
  const px = h => L + (h / 24) * W;
  const py = kw => B - (kw / yMax) * H;

  const baseArea = `M ${px(0)} ${B} ${profile.map(p => `L ${px(p.h)} ${py(p.base)}`).join(' ')} L ${px(24)} ${B} Z`;
  const evArea = profile.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p.h)} ${py(p.total)}`).join(' ') + ' ' +
    [...profile].reverse().map(p => `L ${px(p.h)} ${py(p.base)}`).join(' ') + ' Z';
  const olArea = `M ${px(0)} ${py(rKW)} ${profile.map(p => `L ${px(p.h)} ${py(Math.max(p.total, rKW))}`).join(' ')} L ${px(24)} ${py(rKW)} Z`;
  const totalLine = profile.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p.h)} ${py(p.total)}`).join(' ');
  const baseLine = profile.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p.h)} ${py(p.base)}`).join(' ');

  const yStep = Math.ceil(yMax / 5 / 10) * 10 || 10;

  return (
    <svg viewBox="0 0 880 200" style={{ width: '100%', maxWidth: 880 }}>
      {Array.from({ length: Math.ceil(yMax / yStep) + 1 }, (_, i) => i * yStep).filter(v => v <= yMax * 1.05).map((kw, i) => (
        <g key={'y' + i}>
          <line x1={L} y1={py(kw)} x2={R} y2={py(kw)} stroke="#1e1e2e" strokeWidth={0.5} />
          <text x={L - 6} y={py(kw) + 3} fill="#52525b" fontSize={9} textAnchor="end" fontFamily="monospace">{kw}</text>
        </g>
      ))}
      {Array.from({ length: 9 }, (_, i) => i * 3).map(h => (
        <g key={'x' + h}>
          <line x1={px(h)} y1={T} x2={px(h)} y2={B} stroke="#1e1e2e" strokeWidth={0.5} />
          <text x={px(h)} y={B + 13} fill="#52525b" fontSize={9} textAnchor="middle">{h}h</text>
        </g>
      ))}
      <text x={px(24)} y={B + 13} fill="#52525b" fontSize={9} textAnchor="middle">24h</text>

      {/* Region annotations */}
      <rect x={px(0)} y={T} width={px(6)-px(0)} height={B-T} fill="#6366f1" opacity={0.03} />
      <text x={(px(0)+px(6))/2} y={T+10} textAnchor="middle" fontSize={7} fill="#6366f1" opacity={0.5} fontWeight="600">Off-Peak</text>
      <rect x={px(17)} y={T} width={px(21)-px(17)} height={B-T} fill="#ef4444" opacity={0.04} />
      <text x={(px(17)+px(21))/2} y={T+10} textAnchor="middle" fontSize={7} fill="#ef4444" opacity={0.5} fontWeight="600">EV Peak Risk</text>
      <rect x={px(22)} y={T} width={px(24)-px(22)} height={B-T} fill="#22c55e" opacity={0.03} />
      <text x={(px(22)+px(24))/2} y={T+10} textAnchor="middle" fontSize={7} fill="#22c55e" opacity={0.4} fontWeight="600">Smart Window</text>

      <path d={baseArea} fill="#3b82f6" opacity={0.18} />
      <path d={evArea} fill="#f59e0b" opacity={0.22} />
      <path d={olArea} fill="#ef4444" opacity={0.2} />
      <path d={baseLine} fill="none" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 2" opacity={0.7} />
      <path d={totalLine} fill="none" stroke="#e4e4e7" strokeWidth={1.5} />

      <line x1={L} y1={py(rKW)} x2={R} y2={py(rKW)} stroke="#ef4444" strokeWidth={1} strokeDasharray="6 3" />
      <text x={R + 4} y={py(rKW) + 3} fill="#ef4444" fontSize={9} fontWeight={600}>{rKW.toFixed(0)} kW</text>

      <line x1={px(time)} y1={T} x2={px(time)} y2={B} stroke="#6366f1" strokeWidth={1.5} opacity={0.7} />
      <circle cx={px(time)} cy={py(totalNow)} r={3.5} fill="#6366f1" />
      <text x={px(time)} y={py(totalNow) - 8} fill="#e4e4e7" fontSize={9} textAnchor="middle" fontWeight={600}>
        {totalNow.toFixed(1)} kW
      </text>

      <rect x={L + 8} y={T - 1} width={8} height={3} fill="#3b82f6" opacity={0.5} rx={1} />
      <text x={L + 20} y={T + 2} fill="#71717a" fontSize={8}>Base load</text>
      <rect x={L + 75} y={T - 1} width={8} height={3} fill="#f59e0b" opacity={0.5} rx={1} />
      <text x={L + 87} y={T + 2} fill="#71717a" fontSize={8}>EV load</text>
      <rect x={L + 130} y={T - 1} width={8} height={3} fill="#ef4444" opacity={0.3} rx={1} />
      <text x={L + 142} y={T + 2} fill="#71717a" fontSize={8}>Overload</text>
      <line x1={L + 192} y1={T + 0.5} x2={L + 202} y2={T + 0.5} stroke="#e4e4e7" strokeWidth={1.2} />
      <text x={L + 206} y={T + 2} fill="#71717a" fontSize={8}>Combined</text>
      <text x={L} y={T - 6} fill="#71717a" fontSize={10} fontWeight={600}>kW</text>
    </svg>
  );
}

/* ─── Theory ─── */
function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>EV Charging Impact on Distribution</h2>
      <p style={S.p}>
        The rapid adoption of electric vehicles introduces a significant new load category on distribution networks.
        Unlike traditional residential loads that follow predictable patterns, EV charging can create sharp demand
        spikes — particularly when multiple vehicles charge simultaneously during evening peak hours. This simulation
        models the impact on a typical 11 kV / 415 V distribution transformer serving a residential colony in India.
      </p>

      {/* ── SVG: Charging Infrastructure Levels ── */}
      <svg viewBox="0 0 700 220" style={{ width: '100%', maxWidth: 700, height: 'auto', margin: '16px auto', display: 'block' }}>
        <rect width="700" height="220" rx="12" fill="#18181b" stroke="#27272a" strokeWidth="1" />
        <text x="350" y="22" textAnchor="middle" fontSize="12" fill="#e4e4e7" fontWeight="700">EV Charging Levels — Infrastructure Comparison</text>

        {/* Level 1 */}
        <rect x="30" y="42" width="200" height="110" rx="8" fill="#09090b" stroke="#22c55e" strokeWidth="1.2" />
        <text x="130" y="60" textAnchor="middle" fontSize="11" fill="#22c55e" fontWeight="700">AC Level 1 (Bharat AC)</text>
        <rect x="100" y="68" width="60" height="30" rx="4" fill="#22c55e15" stroke="#22c55e" strokeWidth="0.8" />
        <text x="130" y="80" textAnchor="middle" fontSize="12" fill="#22c55e" fontWeight="700">3.3 kW</text>
        <text x="130" y="91" textAnchor="middle" fontSize="7" fill="#71717a">230V, 15A</text>
        <text x="130" y="112" textAnchor="middle" fontSize="9" fill="#a1a1aa">Charge time: 8-12 hrs</text>
        <text x="130" y="126" textAnchor="middle" fontSize="9" fill="#a1a1aa">Home overnight</text>
        <text x="130" y="142" textAnchor="middle" fontSize="8" fill="#52525b">Standard wall socket</text>

        {/* Level 2 */}
        <rect x="250" y="42" width="200" height="110" rx="8" fill="#09090b" stroke="#3b82f6" strokeWidth="1.2" />
        <text x="350" y="60" textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="700">AC Level 2 (Type 2)</text>
        <rect x="320" y="68" width="60" height="30" rx="4" fill="#3b82f615" stroke="#3b82f6" strokeWidth="0.8" />
        <text x="350" y="80" textAnchor="middle" fontSize="12" fill="#3b82f6" fontWeight="700">7.2 kW</text>
        <text x="350" y="91" textAnchor="middle" fontSize="7" fill="#71717a">230V, 32A</text>
        <text x="350" y="112" textAnchor="middle" fontSize="9" fill="#a1a1aa">Charge time: 4-6 hrs</text>
        <text x="350" y="126" textAnchor="middle" fontSize="9" fill="#a1a1aa">Dedicated EVSE</text>
        <text x="350" y="142" textAnchor="middle" fontSize="8" fill="#52525b">Mennekes connector</text>

        {/* DC Fast */}
        <rect x="470" y="42" width="200" height="110" rx="8" fill="#09090b" stroke="#ef4444" strokeWidth="1.2" />
        <text x="570" y="60" textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="700">DC Fast (CCS2)</text>
        <rect x="540" y="68" width="60" height="30" rx="4" fill="#ef444415" stroke="#ef4444" strokeWidth="0.8" />
        <text x="570" y="80" textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="700">50 kW</text>
        <text x="570" y="91" textAnchor="middle" fontSize="7" fill="#71717a">200-1000V DC</text>
        <text x="570" y="112" textAnchor="middle" fontSize="9" fill="#a1a1aa">Charge time: 30-60 min</text>
        <text x="570" y="126" textAnchor="middle" fontSize="9" fill="#a1a1aa">Highway / Public</text>
        <text x="570" y="142" textAnchor="middle" fontSize="8" fill="#52525b">CCS Combo 2</text>

        {/* Grid Impact Scale */}
        <text x="350" y="175" textAnchor="middle" fontSize="10" fill="#71717a" fontWeight="600">Grid Impact Scale</text>
        <line x1="50" y1="190" x2="650" y2="190" stroke="#3f3f46" strokeWidth="1" />
        <rect x="50" y="185" width="200" height="10" rx="2" fill="#22c55e" opacity="0.3" />
        <rect x="250" y="185" width="200" height="10" rx="2" fill="#f59e0b" opacity="0.3" />
        <rect x="450" y="185" width="200" height="10" rx="2" fill="#ef4444" opacity="0.3" />
        <text x="150" y="210" textAnchor="middle" fontSize="8" fill="#22c55e">Low Impact</text>
        <text x="350" y="210" textAnchor="middle" fontSize="8" fill="#f59e0b">Moderate Impact</text>
        <text x="550" y="210" textAnchor="middle" fontSize="8" fill="#ef4444">High Impact</text>
      </svg>

      {/* ── SVG: Unmanaged vs Smart Charging ── */}
      <svg viewBox="0 0 700 200" style={{ width: '100%', maxWidth: 700, height: 'auto', margin: '16px auto', display: 'block' }}>
        <rect width="700" height="200" rx="12" fill="#18181b" stroke="#27272a" strokeWidth="1" />
        <text x="350" y="22" textAnchor="middle" fontSize="12" fill="#e4e4e7" fontWeight="700">Unmanaged vs Smart Charging Load Profiles</text>

        {/* Unmanaged (left) */}
        <text x="175" y="42" textAnchor="middle" fontSize="10" fill="#ef4444" fontWeight="600">Unmanaged Charging</text>
        <line x1="40" y1="160" x2="310" y2="160" stroke="#3f3f46" strokeWidth="0.8" />
        <line x1="40" y1="55" x2="40" y2="160" stroke="#3f3f46" strokeWidth="0.8" />
        {/* Base load */}
        <path d="M40,140 Q80,138 120,130 Q160,120 175,115 Q200,125 240,100 Q260,90 280,88 Q300,95 310,110"
          fill="none" stroke="#3b82f6" strokeWidth="1.2" strokeDasharray="4 2" />
        {/* EV spike */}
        <path d="M240,100 Q255,65 270,55 Q280,55 290,60 Q305,80 310,110"
          fill="#ef444420" stroke="#ef4444" strokeWidth="2" />
        <text x="270" y="50" textAnchor="middle" fontSize="8" fill="#ef4444" fontWeight="600">EV Peak Spike</text>
        <text x="175" y="178" textAnchor="middle" fontSize="8" fill="#71717a">6 PM - All EVs plug in together</text>

        {/* Smart (right) */}
        <text x="525" y="42" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="600">Smart / Managed Charging</text>
        <line x1="390" y1="160" x2="660" y2="160" stroke="#3f3f46" strokeWidth="0.8" />
        <line x1="390" y1="55" x2="390" y2="160" stroke="#3f3f46" strokeWidth="0.8" />
        {/* Base load */}
        <path d="M390,140 Q430,138 470,130 Q510,120 525,115 Q550,125 590,125 Q620,128 640,130 Q655,135 660,140"
          fill="none" stroke="#3b82f6" strokeWidth="1.2" strokeDasharray="4 2" />
        {/* Flattened EV load */}
        <path d="M390,140 Q420,140 450,140 Q480,138 510,120 Q525,115 540,118 Q570,125 590,125 Q620,128 640,130 Q655,135 660,140"
          fill="#22c55e10" stroke="#22c55e" strokeWidth="2" />
        {/* Off-peak charging highlight */}
        <rect x="390" y="65" width="100" height="80" rx="4" fill="#22c55e08" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="3 2" />
        <text x="440" y="78" textAnchor="middle" fontSize="8" fill="#22c55e" fontWeight="600">Off-peak charging</text>
        <text x="440" y="90" textAnchor="middle" fontSize="7" fill="#71717a">Midnight - 6 AM</text>
        <text x="525" y="178" textAnchor="middle" fontSize="8" fill="#71717a">Shifted to off-peak, flattened load</text>
      </svg>

      <p style={S.p}>
        The core challenge is simple: a single Level 2 EV charger (7.2 kW) draws as much power as 2–3 average Indian
        households combined. When multiple EVs in a colony plug in simultaneously at 7 PM, the resulting demand spike
        can overload the distribution transformer, cause excessive voltage drops along the LT feeder, and dramatically
        accelerate transformer insulation aging.
      </p>

      <h2 style={S.h2}>1. EV Charging Standards in India</h2>
      <p style={S.p}>
        The Bureau of Indian Standards (BIS) and the Department of Heavy Industry have defined several charging
        standards under the Bharat EV specifications, alongside internationally adopted connectors for interoperability.
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Standard</th>
            <th style={S.th}>Type</th>
            <th style={S.th}>Power</th>
            <th style={S.th}>Voltage</th>
            <th style={S.th}>Connector</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Bharat AC-001', 'AC, 1-φ', '3.3 kW', '230 V, 15 A', 'IEC 60309 (Type 1)'],
            ['Bharat DC-001', 'DC', '15 / 25 kW', '48–72 V, 200 A', 'GB/T (modified CCS)'],
            ['CCS2 (Combo 2)', 'DC', '50–350 kW', '200–1000 V', 'CCS Type 2'],
            ['CHAdeMO', 'DC', '50–62.5 kW', '200–500 V, 125 A', 'CHAdeMO'],
            ['Type 2 AC', 'AC, 3-φ', '7.2–22 kW', '230/400 V, 32 A', 'Type 2 (Mennekes)'],
          ].map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} style={S.td}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
      <p style={S.p}>
        Bharat AC-001 is the most affordable and widely deployed standard — ideal for overnight home charging of
        2-wheelers and small EVs. Bharat DC-001 targets 3-wheelers and e-rickshaws at public stations. CCS2 has emerged
        as the preferred standard for new DC fast-charging installations across highways and commercial hubs.
      </p>
      <div style={S.ctx}>
        <span style={S.ctxT}>Connector Compatibility</span>
        <p style={S.ctxP}>
          Unlike the fragmented early EV market, India is converging on CCS2 for DC fast charging. The
          Ministry of Power mandated CCS2 compatibility for all public DC chargers from 2022 onward,
          ensuring interoperability across vehicle manufacturers.
        </p>
      </div>

      <h2 style={S.h2}>2. Demand Diversity Factor</h2>
      <p style={S.p}>
        The diversity factor quantifies how individual peak demands overlap in time. It is defined as the ratio
        of the sum of individual maximum demands to the actual coincident maximum demand of the group.
      </p>
      <span style={S.eq}>DF = Σ (Individual Maximum Demands) / Coincident Maximum Demand</span>
      <p style={S.p}>
        A DF of 1.0 means all loads peak simultaneously — the absolute worst case. Higher DF values indicate
        better load spreading, meaning the system can serve more customers with less transformer capacity.
      </p>
      <h3 style={S.h3}>Effect of EV Penetration on Diversity</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong>Low penetration (1–3 EVs per transformer):</strong> DF ≈ 1.3–1.5 — EV owners arrive home at
          different times, creating natural staggering</li>
        <li style={S.li}><strong>High penetration (&gt;10 EVs per transformer):</strong> DF → 1.0–1.05 — statistically, most
          owners follow the same 6–8 PM arrival pattern</li>
        <li style={S.li}><strong>Smart/managed charging:</strong> DF ≈ 1.5–2.0+ — utility-controlled scheduling deliberately
          shifts load to off-peak windows</li>
      </ul>
      <p style={S.p}>
        Unmanaged charging destroys demand diversity because EV owners follow nearly identical daily routines —
        leaving work at 5–6 PM, arriving home by 7 PM, and plugging in immediately. This concentrates the
        entire EV charging load precisely on the evening demand peak, when residential loads (cooking, lighting,
        air conditioning) are already at their highest.
      </p>
      <span style={S.eq}>After-Diversity Demand = (Base Peak + EV Peak) / DF</span>

      <h2 style={S.h2}>3. Transformer Thermal Loading (IEEE C57.91)</h2>
      <p style={S.p}>
        Transformer insulation life is fundamentally governed by the winding hot-spot temperature. The cellulose
        insulation (kraft paper) wrapping the copper/aluminum windings degrades through hydrolysis and oxidation,
        both of which accelerate exponentially with temperature. IEEE Standard C57.91-2011 provides thermal models
        for oil-immersed transformers.
      </p>

      <h3 style={S.h3}>Hot-Spot Temperature Model</h3>
      <span style={S.eq}>θ_H = θ_A + Δθ_oil × (K²)^0.8 + Δθ_winding × K^1.6</span>
      <ul style={S.ul}>
        <li style={S.li}><strong>θ_H</strong> — winding hot-spot temperature (°C)</li>
        <li style={S.li}><strong>θ_A</strong> — ambient temperature (°C), typically 30–45°C in India</li>
        <li style={S.li}><strong>Δθ_oil</strong> — rated top-oil temperature rise = 55°C (ONAN cooling)</li>
        <li style={S.li}><strong>Δθ_winding</strong> — rated winding hot-spot gradient over top oil = 15°C</li>
        <li style={S.li}><strong>K</strong> — per-unit loading ratio = actual load ÷ rated capacity</li>
      </ul>
      <p style={S.p}>
        At rated load (K = 1.0) with 40°C ambient: θ_H = 40 + 55 + 15 = 110°C. This is the design reference
        temperature for normal insulation aging — the transformer is designed to reach exactly this hot-spot
        at nameplate rating.
      </p>
      <p style={S.p}>
        The exponents (0.8 for oil, 1.6 for winding) arise from the non-linear relationship between losses and
        temperature rise. Oil temperature rise follows I²R losses raised to the 0.8 power (due to convective
        cooling non-linearity), while the winding gradient follows losses raised to a higher exponent due to
        eddy current effects.
      </p>

      <h3 style={S.h3}>Aging Acceleration Factor (FAA)</h3>
      <span style={S.eq}>FAA = exp(15000/383 − 15000/(θ_H + 273))</span>
      <p style={S.p}>
        This Arrhenius-based formula gives FAA = 1.0 at the 110°C reference temperature. The key insight:
        every 6–7°C increase roughly <strong>doubles</strong> the aging rate.
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Hot-spot (°C)</th>
            <th style={S.th}>FAA</th>
            <th style={S.th}>Expected Life</th>
            <th style={S.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['98', '0.28', '~73 years', 'Under-loaded'],
            ['110', '1.0', '~20.5 years', 'Normal rated'],
            ['120', '2.7', '~7.6 years', 'Moderate overload'],
            ['130', '7.0', '~2.9 years', 'Heavy overload'],
            ['140', '17.2', '~1.2 years', 'Severe — emergency only'],
            ['150', '40.5', '~6 months', 'Critical failure risk'],
          ].map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} style={{ ...S.td, color: i <= 1 ? '#22c55e' : i <= 3 ? '#eab308' : '#ef4444' }}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>Insulation Life Calculation</h3>
      <p style={S.p}>
        Thermally-upgraded kraft paper insulation has a normal life of 180,000 hours (≈ 20.5 years) at a
        constant 110°C hot-spot. Operating above this temperature consumes insulation life exponentially faster.
      </p>
      <span style={S.eq}>Remaining Life (years) = 180,000 ÷ (FAA × 8,760)</span>

      <div style={S.ctx}>
        <span style={S.ctxT}>Simplifications in This Model</span>
        <p style={S.ctxP}>
          This simulation assumes steady-state thermal equilibrium at the selected loading level. Real transformers
          have thermal time constants — oil: 1–3 hours, winding: 5–10 minutes — so brief overloads are more
          tolerable than sustained ones. The model uses ONAN (Oil Natural Air Natural) cooling parameters,
          the most common type in Indian distribution. Forced-cooled transformers (ONAF, OFAF) have different
          rise constants and can tolerate higher loading.
        </p>
      </div>

      <h2 style={S.h2}>4. Smart Charging & Vehicle-Grid Integration</h2>
      <h3 style={S.h3}>Managed / Smart Charging</h3>
      <p style={S.p}>
        Smart charging strategies shift EV demand to off-peak periods (typically midnight to 6 AM) using one or
        more control mechanisms:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Time-of-Use (TOU) tariffs:</strong> cheaper electricity rates during off-peak hours incentivize
          owners to schedule charging overnight</li>
        <li style={S.li}><strong>Direct utility control:</strong> the DISCOM sends signals to connected chargers to modulate
          charging rate or defer start time</li>
        <li style={S.li}><strong>Aggregator platforms:</strong> third-party services optimize charging schedules across fleets
          while respecting departure-time constraints</li>
        <li style={S.li}><strong>Price-responsive algorithms:</strong> the charger automatically selects the cheapest charging
          window based on real-time or day-ahead prices</li>
      </ul>

      <h3 style={S.h3}>Vehicle-to-Grid (V2G)</h3>
      <p style={S.p}>
        V2G enables bidirectional power flow — the EV battery discharges power back to the grid during peak demand,
        earning revenue for the vehicle owner. A typical 40 kWh EV battery can supply 7 kW for 4–5 hours,
        effectively acting as distributed energy storage. When aggregated across thousands of vehicles, V2G can
        provide meaningful grid services including peak shaving, frequency regulation, and spinning reserve.
      </p>

      <h3 style={S.h3}>Vehicle-to-Home (V2H)</h3>
      <p style={S.p}>
        V2H uses the EV battery as backup power for the home during outages or peak tariff periods. This is
        particularly valuable in India, where power interruptions are common in semi-urban and rural areas. A
        fully charged EV battery (40–60 kWh) can power an average Indian household for 15–20 hours.
      </p>

      <h3 style={S.h3}>Communication Protocols</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong>OCPP 2.0.1</strong> (Open Charge Point Protocol) — charger-to-network communication, remote
          monitoring, firmware updates, smart charging profiles</li>
        <li style={S.li}><strong>ISO 15118</strong> — plug-and-charge with automatic authentication, certificate-based billing,
          V2G power transfer negotiation</li>
        <li style={S.li}><strong>IEC 61851</strong> — conductive charging system standards covering safety interlocks, pilot
          signal control, and mode definitions (Mode 1–4)</li>
        <li style={S.li}><strong>IEEE 2030.5</strong> — Smart Energy Profile for demand response and DER management, applicable
          to EV chargers as grid-interactive loads</li>
      </ul>

      <h2 style={S.h2}>5. Indian Distribution Context</h2>
      <div style={S.ctx}>
        <span style={S.ctxT}>Why India Is Especially Vulnerable</span>
        <p style={S.ctxP}>
          India's distribution network faces unique constraints: most distribution transformers are 25–100 kVA
          (much smaller than Western counterparts at 250–500 kVA), many already operate at 80–120% loading due
          to agricultural pump sets and growing domestic demand, and ambient temperatures frequently exceed
          40°C during summer — accelerating thermal aging even without EV load.
        </p>
      </div>
      <ul style={S.ul}>
        <li style={S.li}><strong>FAME-II Scheme:</strong> ₹10,000 crore allocation under the Faster Adoption and Manufacturing
          of Electric Vehicles scheme, targeting 2,700+ EV charging stations across 62 cities and 24 major
          highway corridors</li>
        <li style={S.li}><strong>EV Market Growth:</strong> 2-wheelers dominate sales (Ola S1 Pro, Ather 450X, TVS iQube),
          4-wheelers growing rapidly (Tata Nexon EV, MG ZS EV, Mahindra XUV400), and electric buses deployed
          in cities (BEST Mumbai, DTC Delhi, BMTC Bangalore)</li>
        <li style={S.li}><strong>EV Tariff:</strong> ₹4.5–6/kWh across most states with a dedicated EV tariff category and
          no demand charges for public charging stations — designed to keep charging cost below ₹2/km</li>
        <li style={S.li}><strong>EESL Role:</strong> Energy Efficiency Services Limited (EESL) has been procuring and deploying
          public chargers, standardizing equipment, and aggregating demand for government fleet electrification</li>
        <li style={S.li}><strong>AP DISCOM Pilot:</strong> Andhra Pradesh distribution companies conducted pilot studies showing
          that 30% EV penetration would overload approximately 60% of existing urban distribution transformers
          during evening peaks, necessitating either transformer upgrades or managed charging mandates</li>
        <li style={S.li}><strong>DTR Upgrade Cost:</strong> Replacing a single 100 kVA DTR with a 200 kVA unit costs ₹5–8 lakh
          including installation. With over 11 million distribution transformers in India, a brute-force
          capacity upgrade approach would cost ₹30,000–50,000 crore — making smart charging the economically
          rational solution</li>
      </ul>
      <p style={S.p}>
        The bottom line: without managed charging protocols, widespread EV adoption in India will require
        massive and expensive transformer upgrades. With smart charging, existing infrastructure can absorb
        2–3× more EVs before upgrades become necessary — saving DISCOMs and consumers enormous capital costs.
      </p>

      <h2 style={S.h2}>6. Voltage Drop on LT Feeders</h2>
      <p style={S.p}>
        Indian LT distribution feeders (415 V, 3-phase, 4-wire) use aluminum conductors with typical impedance
        of 0.3–0.6 Ω/km depending on conductor size. Houses connected along the feeder experience progressively
        greater voltage drops as distance from the transformer increases.
      </p>
      <span style={S.eq}>V_drop at house n = Σ (I_section_k × Z_section) for k = 1 to n</span>
      <p style={S.p}>
        Each feeder section carries the cumulative current of all downstream loads. The voltage drop is dominated
        by the sections closest to the transformer (which carry the most current). Statutory limits require
        voltage to remain within ±6% of nominal (226–254 V at 240 V nominal). EV charging load can easily push
        end-of-feeder voltages below 216 V (10% drop), causing appliance malfunction and motor overheating.
      </p>
      <p style={S.p}>
        The voltage profile here is drawn on a representative 240 V phase-to-neutral branch of the LT network,
        with household demands treated as coincident downstream loads. It is intended to illustrate feeder-drop
        trends, not to replace a full 3-phase unbalance or load-flow study.
      </p>

      <h2 style={S.h2}>7. References</h2>
      <ul style={S.ul}>
        <li style={S.li}>IEEE C57.91-2011 — Guide for Loading Mineral-Oil-Immersed Transformers and Step-Voltage Regulators</li>
        <li style={S.li}>IS 17017:2018 — Electric Vehicle Conductive AC/DC Charging System</li>
        <li style={S.li}>IS 17427 (Part 1):2020 — Electric Vehicle Power Transfer, DC Charging</li>
        <li style={S.li}>CEA (Supply Code) — Technical Standards for Connectivity to the Grid</li>
        <li style={S.li}>FAME-II — Faster Adoption and Manufacturing of (Hybrid &) Electric Vehicles, Department of Heavy Industry</li>
        <li style={S.li}>IEC 61851 — Electric Vehicle Conductive Charging System</li>
        <li style={S.li}>ISO 15118 — Vehicle to Grid Communication Interface</li>
        <li style={S.li}>OCPP 2.0.1 — Open Charge Alliance</li>
        <li style={S.li}>IEEE 2030.5-2018 — Smart Energy Profile Application Protocol</li>
      </ul>
    </div>
  );
}

/* ─── Main Component ─── */
export default function EvChargingImpact() {
  const [tab, setTab] = useState('simulate');
  const [nEV, setNEV] = useState(5);
  const [cType, setCType] = useState('L2');
  const [mode, setMode] = useState('unmanaged');
  const [time, setTime] = useState(20);
  const [ambT, setAmbT] = useState(40);
  const [tKVA, setTKVA] = useState(100);

  const sim = useMemo(() => {
    const ck = CHRG[cType];
    const evP = mode === 'smart' ? EV_S : EV_U;
    const rKW = tKVA * PF;

    const profile = [];
    for (let h = 0; h <= 24; h += 0.5) {
      const b = lerp(BASE, h) * NH;
      const e = lerp(evP, h) * nEV * ck.kw;
      profile.push({ h, base: b, ev: e, total: b + e });
    }

    const baseNow = lerp(BASE, time) * NH;
    const evFrac = lerp(evP, time);
    const evNow = evFrac * nEV * ck.kw;
    const totalNow = baseNow + evNow;
    const loadPct = rKW > 0 ? (totalNow / rKW) * 100 : 0;
    const th = therm(rKW > 0 ? totalNow / rKW : 0, ambT);

    const evH = Array(NH).fill(0);
    for (let i = 0; i < nEV; i++) evH[i % NH]++;
    const bph = lerp(BASE, time);
    const loads = evH.map(n => bph + n * ck.kw * evFrac);
    const volts = feederV(loads);

    const peak = Math.max(...profile.map(p => p.total));
    const sumInd = NH * Math.max(...BASE) + nEV * ck.kw;
    const df = peak > 0 ? sumInd / peak : 1;

    return { profile, totalNow, loadPct, th, volts, evH, peak, df, rKW, col: ck.c };
  }, [nEV, cType, mode, time, ambT, tKVA]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>
      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Network evs={sim.evH} col={sim.col} volts={sim.volts} kw={sim.totalNow}
              loadPct={sim.loadPct} hs={sim.th.hs} faa={sim.th.faa} life={sim.th.life} />
          </div>
          <div style={S.graphWrap}>
            <Chart profile={sim.profile} rKW={sim.rKW} time={time} totalNow={sim.totalNow} />
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>EVs</span>
              <input type="range" min={0} max={20} step={1} value={nEV}
                onChange={e => setNEV(+e.target.value)} style={S.slider} />
              <span style={S.val}>{nEV}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Charger</span>
              <div style={S.bg}>
                {Object.entries(CHRG).map(([k, v]) => (
                  <button key={k} style={S.btn(cType === k, v.c)} onClick={() => setCType(k)}>{v.nm}</button>
                ))}
              </div>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Mode</span>
              <div style={S.bg}>
                <button style={S.btn(mode === 'unmanaged')} onClick={() => setMode('unmanaged')}>Unmanaged</button>
                <button style={S.btn(mode === 'smart')} onClick={() => setMode('smart')}>Smart</button>
              </div>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Time</span>
              <input type="range" min={0} max={24} step={0.5} value={time}
                onChange={e => setTime(+e.target.value)} style={S.slider} />
              <span style={S.val}>{`${Math.floor(time)}:${time % 1 ? '30' : '00'}`}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Ambient</span>
              <input type="range" min={25} max={45} step={1} value={ambT}
                onChange={e => setAmbT(+e.target.value)} style={S.slider} />
              <span style={S.val}>{ambT}°C</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>DTR Rating</span>
              <select style={S.sel} value={tKVA} onChange={e => setTKVA(+e.target.value)}>
                {[63, 100, 200, 500].map(v => <option key={v} value={v}>{v} kVA</option>)}
              </select>
            </div>
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Loading</span>
              <span style={{ ...S.rv, color: ldC(sim.loadPct) }}>{sim.loadPct.toFixed(1)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Hot-spot</span>
              <span style={{ ...S.rv, color: tpC(sim.th.hs) }}>{sim.th.hs.toFixed(1)}°C</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Aging Factor</span>
              <span style={{ ...S.rv, color: sim.th.faa > 2 ? '#ef4444' : '#e4e4e7' }}>{sim.th.faa.toFixed(2)}×</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Expected Life</span>
              <span style={{ ...S.rv, color: lfC(sim.th.life) }}>{sim.th.life.toFixed(1)} yr</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Feeder End V</span>
              <span style={{ ...S.rv, color: vC(sim.volts[NH - 1]) }}>{sim.volts[NH - 1].toFixed(1)} V</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Peak Demand</span>
              <span style={S.rv}>{sim.peak.toFixed(1)} kW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Diversity Factor</span>
              <span style={S.rv}>{sim.df.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
