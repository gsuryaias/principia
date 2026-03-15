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
  slider: { width: 140, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 60, textAlign: 'right' },
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

const NODES = [
  { name: 'Substation', km: 0, houses: 0 },
  { name: 'LP-1', km: 2, houses: 50 },
  { name: 'LP-2', km: 4, houses: 65 },
  { name: 'LP-3', km: 6, houses: 80 },
  { name: 'LP-4', km: 8, houses: 60 },
  { name: 'LP-5', km: 10, houses: 40 },
];
const R_KM = 1.3;
const SEG_KM = 2;
const R_SEG = R_KM * SEG_KM;
const V_NOM = 11.0;
const V_HI = V_NOM * 1.06;
const V_LO = V_NOM * 0.94;
const LOAD_PEAK = 3.0;
const SOLAR_KWP = 5;

const LOAD_CURVE = [
  0.30, 0.28, 0.25, 0.22, 0.20, 0.22,
  0.35, 0.55, 0.70, 0.65,
  0.50, 0.42, 0.38, 0.38, 0.42,
  0.50, 0.60, 0.75, 0.92, 1.00, 0.90,
  0.70, 0.50, 0.40,
];

function solarIrr(h) {
  const hh = ((h % 24) + 24) % 24;
  if (hh <= 6 || hh >= 18) return 0;
  return Math.sin(Math.PI * (hh - 6) / 12);
}

function loadMult(h) {
  const hh = ((h % 24) + 24) % 24;
  const i = Math.min(Math.floor(hh), 23);
  const f = hh - i;
  return LOAD_CURVE[i] + (LOAD_CURVE[(i + 1) % 24] - LOAD_CURVE[i]) * f;
}

function fmtHour(h) {
  const hh = Math.floor(((h % 24) + 24) % 24);
  const mm = Math.round((h - Math.floor(h)) * 60);
  const ap = hh < 12 ? 'AM' : 'PM';
  const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return `${h12}:${String(mm).padStart(2, '0')} ${ap}`;
}

function calcVoltages(hour, penFrac) {
  const irr = solarIrr(hour);
  const lm = loadMult(hour);
  const voltages = [V_NOM];
  for (let s = 0; s < NODES.length - 1; s++) {
    let flow = 0;
    for (let j = s + 1; j < NODES.length; j++) {
      flow += NODES[j].houses * LOAD_PEAK * lm - NODES[j].houses * penFrac * SOLAR_KWP * irr;
    }
    const dv = (flow * R_SEG) / (1000 * voltages[voltages.length - 1]);
    voltages.push(voltages[voltages.length - 1] - dv);
  }
  return voltages;
}

function compute(hour, penPct) {
  const irr = solarIrr(hour);
  const lm = loadMult(hour);
  const pf = penPct / 100;

  const nodeData = NODES.map((n, i) => {
    if (i === 0) return { ...n, load: 0, solar: 0, net: 0 };
    const load = n.houses * LOAD_PEAK * lm;
    const solar = n.houses * pf * SOLAR_KWP * irr;
    return { ...n, load, solar, net: load - solar };
  });

  const segFlows = [];
  for (let s = 0; s < NODES.length - 1; s++) {
    let flow = 0;
    for (let j = s + 1; j < NODES.length; j++) flow += nodeData[j].net;
    segFlows.push(flow);
  }

  const voltages = [V_NOM];
  for (let i = 0; i < segFlows.length; i++) {
    const dv = (segFlows[i] * R_SEG) / (1000 * voltages[i]);
    voltages.push(voltages[i] - dv);
  }

  const maxV = Math.max(...voltages);
  const minV = Math.min(...voltages);
  const violation = maxV > V_HI || minV < V_LO;
  const ssFlow = segFlows[0];

  let relayStatus = 'normal';
  if (ssFlow < -5) relayStatus = Math.abs(ssFlow) > 500 ? 'trip-risk' : 'confused';

  let revHours = 0;
  for (let h = 0; h < 24; h += 0.5) {
    const iH = solarIrr(h);
    const lH = loadMult(h);
    let tot = 0;
    for (let j = 1; j < NODES.length; j++)
      tot += NODES[j].houses * LOAD_PEAK * lH - NODES[j].houses * pf * SOLAR_KWP * iH;
    if (tot < -5) revHours += 0.5;
  }

  let hostCapPen = 100;
  for (let p = 100; p >= 0; p--) {
    const vs = calcVoltages(12, p / 100);
    if (Math.max(...vs) <= V_HI) { hostCapPen = p; break; }
  }
  const hostingUtil = hostCapPen > 0 ? Math.min((penPct / hostCapPen) * 100, 150) : 100;

  return { nodeData, segFlows, voltages, maxV, minV, violation, ssFlow, relayStatus, revHours, hostingUtil, irr, lm, hostCapPen };
}

const VP_LEFT = 120, VP_RIGHT = 990, VP_TOP = 280, VP_BOT = 500;
const kmToX = (km) => VP_LEFT + (km / 10) * (VP_RIGHT - VP_LEFT);
const NX = NODES.map(n => kmToX(n.km));
const FY = 148;
const vpY = (v) => VP_BOT - ((v - 10.0) / 2.0) * (VP_BOT - VP_TOP);

const RELAY_COL = { normal: '#22c55e', confused: '#f59e0b', 'trip-risk': '#ef4444' };
const RELAY_LBL = { normal: 'OK', confused: 'ALERT', 'trip-risk': 'TRIP' };

function Diagram({ data, hour }) {
  const sunVis = hour > 5.5 && hour < 18.5;
  const sunT = Math.max(0, Math.min(1, (hour - 6) / 12));
  const sunX = 120 + sunT * 870;
  const sunY = 55 - Math.sin(Math.PI * sunT) * 38;

  return (
    <svg viewBox="0 0 1100 545" style={{ width: '100%', maxWidth: 1100, height: 'auto' }}>
      <defs>
        <filter id="gl"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#fbbf24" /></linearGradient>
      </defs>

      {/* ── sky ── */}
      <path d="M120,60 Q555,0 990,60" stroke="#fbbf2430" strokeDasharray="4 4" fill="none" />
      {(hour < 6 || hour > 18) && <>
        <circle cx={220} cy={22} r={1.2} fill="#d4d4d8" opacity={0.4} />
        <circle cx={430} cy={32} r={1} fill="#d4d4d8" opacity={0.25} />
        <circle cx={650} cy={18} r={1.3} fill="#d4d4d8" opacity={0.35} />
        <circle cx={830} cy={28} r={1} fill="#d4d4d8" opacity={0.3} />
        <circle cx={340} cy={14} r={0.8} fill="#d4d4d8" opacity={0.2} />
        <circle cx={750} cy={38} r={1.2} fill="#d4d4d8" opacity={0.35} />
      </>}
      {sunVis && <g>
        <circle cx={sunX} cy={sunY} r={14} fill="#fbbf24" filter="url(#gl)" opacity={0.7} />
        <circle cx={sunX} cy={sunY} r={10} fill="url(#sg)" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
          const r1 = 15, r2 = 20, rad = a * Math.PI / 180;
          return <line key={a} x1={sunX + Math.cos(rad) * r1} y1={sunY + Math.sin(rad) * r1} x2={sunX + Math.cos(rad) * r2} y2={sunY + Math.sin(rad) * r2} stroke="#fbbf24" strokeWidth={1.3} opacity={0.4} />;
        })}
      </g>}
      <text x={120} y={72} textAnchor="middle" fill="#52525b" fontSize={8}>6 AM</text>
      <text x={555} y={72} textAnchor="middle" fill="#52525b" fontSize={8}>12 PM</text>
      <text x={990} y={72} textAnchor="middle" fill="#52525b" fontSize={8}>6 PM</text>

      {/* ── feeder base line ── */}
      <line x1={NX[0] + 28} y1={FY} x2={NX[5]} y2={FY} stroke="#27272a" strokeWidth={3} />

      {/* ── segments: colored lines, arrows, particles ── */}
      {data.segFlows.map((flow, i) => {
        const x1 = NX[i] + (i === 0 ? 28 : 0), x2 = NX[i + 1];
        const rev = flow < -5;
        const fwd = flow > 5;
        const col = rev ? '#ef4444' : fwd ? '#3b82f6' : '#52525b';
        const w = Math.max(1.5, Math.min(5, Math.abs(flow) / 200));
        const midX = (x1 + x2) / 2;
        const d = rev ? -1 : 1;
        const path = rev ? `M${x2},${FY} L${x1},${FY}` : `M${x1},${FY} L${x2},${FY}`;
        return (
          <g key={i}>
            <line x1={x1} y1={FY} x2={x2} y2={FY} stroke={col} strokeWidth={w} opacity={0.45} />
            {(fwd || rev) && <polygon points={`${midX + d * 7},${FY} ${midX - d * 5},${FY - 5} ${midX - d * 5},${FY + 5}`} fill={col} opacity={0.85} />}
            {(fwd || rev) && [0, 1, 2].map(pi => (
              <circle key={pi} r={3} fill={col} opacity={0.55} filter="url(#gl)">
                <animateMotion dur="2.2s" begin={`${pi * 0.73}s`} repeatCount="indefinite" path={path} />
              </circle>
            ))}
            <text x={midX} y={FY - 11} textAnchor="middle" fill={col} fontSize={8} fontWeight={600} opacity={0.8}>
              {Math.abs(flow).toFixed(0)} kW
            </text>
          </g>
        );
      })}

      {/* ── substation ── */}
      <rect x={NX[0] - 24} y={FY - 24} width={48} height={48} rx={6} fill="#18181b" stroke="#6366f1" strokeWidth={1.4} />
      <circle cx={NX[0] - 7} cy={FY + 1} r={7} fill="none" stroke="#818cf8" strokeWidth={1.1} />
      <circle cx={NX[0] + 7} cy={FY + 1} r={7} fill="none" stroke="#818cf8" strokeWidth={1.1} />
      <text x={NX[0]} y={FY - 10} textAnchor="middle" fill="#d4d4d8" fontSize={8} fontWeight={700}>11 kV</text>
      <text x={NX[0]} y={FY + 34} textAnchor="middle" fill="#71717a" fontSize={8} fontWeight={600}>SS</text>

      {/* ── relay indicator ── */}
      <circle cx={NX[0]} cy={FY - 40} r={6} fill={RELAY_COL[data.relayStatus]} opacity={0.9} />
      {data.relayStatus !== 'normal' && <circle cx={NX[0]} cy={FY - 40} r={6} fill="none" stroke={RELAY_COL[data.relayStatus]} strokeWidth={2} opacity={0.3}>
        <animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
      </circle>}
      <text x={NX[0]} y={FY - 51} textAnchor="middle" fill="#71717a" fontSize={7} fontWeight={600}>OCR</text>
      <text x={NX[0]} y={FY - 33} textAnchor="middle" fill={RELAY_COL[data.relayStatus]} fontSize={6} fontWeight={700}>{RELAY_LBL[data.relayStatus]}</text>

      {/* ── net meter ── */}
      <rect x={NX[0] - 32} y={FY + 42} width={64} height={22} rx={4} fill="#111114" stroke="#27272a" strokeWidth={0.8} />
      <text x={NX[0]} y={FY + 51} textAnchor="middle" fill="#52525b" fontSize={6} fontWeight={600}>NET METER</text>
      <text x={NX[0]} y={FY + 60} textAnchor="middle" fill={data.ssFlow < -5 ? '#ef4444' : '#22c55e'} fontSize={9} fontWeight={700} fontFamily="monospace">
        {data.ssFlow < -5 ? '◄ ' : '► '}{Math.abs(data.ssFlow).toFixed(0)} kW
      </text>

      {/* ── load points ── */}
      {NODES.slice(1).map((n, idx) => {
        const i = idx + 1;
        const x = NX[i];
        const nd = data.nodeData[i];
        const hasSolar = nd.solar > 0.1;
        const v = data.voltages[i];
        const vBad = v > V_HI || v < V_LO;
        const vCol = vBad ? '#ef4444' : v > V_HI - 0.15 || v < V_LO + 0.15 ? '#f59e0b' : '#22c55e';
        const netCol = nd.net < -5 ? '#ef4444' : nd.net > 5 ? '#3b82f6' : '#71717a';
        return (
          <g key={n.name}>
            {/* tap */}
            <line x1={x} y1={FY - 16} x2={x} y2={FY} stroke="#3f3f46" strokeWidth={1} />
            {/* house */}
            <g transform={`translate(${x},${FY - 30})`}>
              <path d="M-11,0 L0,-13 L11,0 L11,14 L-11,14 Z" fill="#1f1f23" stroke="#3f3f46" strokeWidth={0.8} />
              <rect x={-3} y={7} width={6} height={7} fill="#09090b" rx={0.5} />
              {/* solar panel */}
              <rect x={-9} y={-18} width={18} height={6} rx={1} fill={hasSolar ? '#fbbf24' : '#2a2a2e'} stroke={hasSolar ? '#f59e0b' : '#3f3f46'} strokeWidth={0.7} opacity={hasSolar ? 1 : 0.4} />
              {hasSolar && <>
                <line x1={-9} y1={-15} x2={9} y2={-15} stroke="#f59e0b" strokeWidth={0.4} />
                <line x1={-3} y1={-18} x2={-3} y2={-12} stroke="#f59e0b" strokeWidth={0.4} />
                <line x1={3} y1={-18} x2={3} y2={-12} stroke="#f59e0b" strokeWidth={0.4} />
              </>}
            </g>
            {/* labels above */}
            <text x={x} y={FY - 54} textAnchor="middle" fill="#71717a" fontSize={8} fontWeight={600}>{n.name}</text>
            <text x={x} y={FY - 64} textAnchor="middle" fill="#52525b" fontSize={7}>{n.houses} homes</text>
            {/* labels below */}
            <text x={x} y={FY + 18} textAnchor="middle" fill={vCol} fontSize={9} fontWeight={700} fontFamily="monospace">{v.toFixed(2)} kV</text>
            <text x={x} y={FY + 30} textAnchor="middle" fill={netCol} fontSize={8} fontFamily="monospace">
              {nd.net > 0 ? '+' : ''}{nd.net.toFixed(0)} kW
            </text>
          </g>
        );
      })}

      {/* ── distance markers ── */}
      {NODES.map((n, i) => (
        <text key={i} x={NX[i]} y={FY + 42} textAnchor="middle" fill="#3f3f46" fontSize={7}>{n.km} km</text>
      ))}

      {/* ── flow legend ── */}
      <rect x={420} y={FY + 46} width={8} height={8} rx={1} fill="#3b82f6" opacity={0.7} />
      <text x={432} y={FY + 54} fill="#52525b" fontSize={7}>Forward</text>
      <rect x={490} y={FY + 46} width={8} height={8} rx={1} fill="#ef4444" opacity={0.7} />
      <text x={502} y={FY + 54} fill="#52525b" fontSize={7}>Reverse</text>

      {/* ── separator ── */}
      <line x1={60} y1={240} x2={1040} y2={240} stroke="#1e1e2e" strokeDasharray="3 4" />
      <text x={65} y={260} fill="#52525b" fontSize={9} fontWeight={600}>VOLTAGE PROFILE</text>

      {/* ── voltage profile grid ── */}
      {[10.0, 10.5, 11.0, 11.5, 12.0].map(v => (
        <g key={v}>
          <line x1={VP_LEFT} y1={vpY(v)} x2={VP_RIGHT} y2={vpY(v)} stroke="#1e1e2e" />
          <text x={VP_LEFT - 6} y={vpY(v) + 3} textAnchor="end" fill="#3f3f46" fontSize={8} fontFamily="monospace">{v.toFixed(1)}</text>
        </g>
      ))}
      <line x1={VP_LEFT} y1={VP_TOP} x2={VP_LEFT} y2={VP_BOT} stroke="#27272a" />
      <line x1={VP_LEFT} y1={VP_BOT} x2={VP_RIGHT} y2={VP_BOT} stroke="#27272a" />
      {NODES.map((n, i) => (
        <text key={i} x={NX[i]} y={VP_BOT + 13} textAnchor="middle" fill="#3f3f46" fontSize={8}>{n.km} km</text>
      ))}
      <text x={70} y={(VP_TOP + VP_BOT) / 2 + 4} textAnchor="middle" fill="#3f3f46" fontSize={8} fontWeight={600} transform={`rotate(-90,70,${(VP_TOP + VP_BOT) / 2})`}>V (kV)</text>

      {/* ── ANSI limits ── */}
      <line x1={VP_LEFT} y1={vpY(V_HI)} x2={VP_RIGHT} y2={vpY(V_HI)} stroke="#ef4444" strokeDasharray="6 3" opacity={0.5} />
      <text x={VP_RIGHT + 4} y={vpY(V_HI) + 3} fill="#ef4444" fontSize={7} opacity={0.7}>{V_HI.toFixed(2)}</text>
      <line x1={VP_LEFT} y1={vpY(V_LO)} x2={VP_RIGHT} y2={vpY(V_LO)} stroke="#ef4444" strokeDasharray="6 3" opacity={0.5} />
      <text x={VP_RIGHT + 4} y={vpY(V_LO) + 3} fill="#ef4444" fontSize={7} opacity={0.7}>{V_LO.toFixed(2)}</text>
      <line x1={VP_LEFT} y1={vpY(V_NOM)} x2={VP_RIGHT} y2={vpY(V_NOM)} stroke="#52525b" strokeDasharray="3 5" opacity={0.4} />
      <text x={VP_RIGHT + 4} y={vpY(V_NOM) + 3} fill="#52525b" fontSize={7}>11.00</text>

      {/* ── violation shading ── */}
      {data.maxV > V_HI && (() => {
        const pts = NODES.map((n, i) => {
          const v = Math.max(data.voltages[i], V_HI);
          return `${NX[i]},${vpY(v)}`;
        });
        const base = [...NODES].reverse().map(n => `${kmToX(n.km)},${vpY(V_HI)}`);
        return <polygon points={[...pts, ...base].join(' ')} fill="#ef4444" opacity={0.1} />;
      })()}
      {data.minV < V_LO && (() => {
        const pts = NODES.map((n, i) => {
          const v = Math.min(data.voltages[i], V_LO);
          return `${NX[i]},${vpY(v)}`;
        });
        const base = [...NODES].reverse().map(n => `${kmToX(n.km)},${vpY(V_LO)}`);
        return <polygon points={[...pts, ...base].join(' ')} fill="#ef4444" opacity={0.1} />;
      })()}

      {/* ── voltage curve ── */}
      <polyline points={NODES.map((n, i) => `${NX[i]},${vpY(data.voltages[i])}`).join(' ')} fill="none" stroke="#22d3ee" strokeWidth={2.5} strokeLinejoin="round" />
      {NODES.map((n, i) => {
        const v = data.voltages[i];
        const bad = v > V_HI || v < V_LO;
        return <circle key={i} cx={NX[i]} cy={vpY(v)} r={4} fill={bad ? '#ef4444' : '#22d3ee'} stroke={bad ? '#fca5a5' : '#67e8f9'} strokeWidth={1.5} />;
      })}

      {/* ── VP limit labels ── */}
      <text x={VP_LEFT + 4} y={vpY(V_HI) - 4} fill="#ef4444" fontSize={7} opacity={0.6}>+6% limit</text>
      <text x={VP_LEFT + 4} y={vpY(V_LO) + 10} fill="#ef4444" fontSize={7} opacity={0.6}>−6% limit</text>
    </svg>
  );
}

function TheorySVGReverseFlow() {
  return (
    <svg viewBox="0 0 760 280" style={{ width: '100%', maxWidth: 760, height: 'auto', margin: '20px 0' }}>
      <rect width="760" height="280" rx="12" fill="#111114" stroke="#27272a" />
      <text x="380" y="28" textAnchor="middle" fill="#d4d4d8" fontSize={14} fontWeight={700}>Normal vs Reverse Power Flow on Distribution Feeder</text>

      {/* Normal flow - top */}
      <text x="380" y="56" textAnchor="middle" fill="#22c55e" fontSize={11} fontWeight={600}>Normal Flow (Night / Low Solar)</text>
      {/* Substation */}
      <rect x="70" y="70" width="60" height="30" rx="4" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth={1.5} />
      <text x="100" y="89" textAnchor="middle" fill="#a5b4fc" fontSize={9}>Substation</text>
      {/* Feeder */}
      <line x1="130" y1="85" x2="650" y2="85" stroke="#52525b" strokeWidth={2.5} />
      {/* Flow arrows */}
      <defs>
        <marker id="rpfArr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <path d="M0,0 L8,3 L0,6 Z" fill="#22c55e" />
        </marker>
        <marker id="rpfArrR" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
          <path d="M8,0 L0,3 L8,6 Z" fill="#ef4444" />
        </marker>
      </defs>
      {[200, 350, 500].map(x => (
        <line key={x} x1={x} y1="75" x2={x + 60} y2="75" stroke="#22c55e" strokeWidth={1.5} markerEnd="url(#rpfArr)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" />
        </line>
      ))}
      {/* Loads */}
      {[250, 400, 550].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="85" x2={x} y2="108" stroke="#52525b" strokeWidth={1} />
          <rect x={x - 14} y="108" width="28" height="16" rx="3" fill="#18181b" stroke="#3f3f46" />
          <text x={x} y="119" textAnchor="middle" fill="#71717a" fontSize={7}>Load</text>
        </g>
      ))}
      {/* Voltage profile dropping */}
      <text x="680" y="80" fill="#22c55e" fontSize={8}>V drops</text>

      {/* Reverse flow - bottom */}
      <text x="380" y="155" textAnchor="middle" fill="#ef4444" fontSize={11} fontWeight={600}>Reverse Flow (Midday High Solar)</text>
      {/* Substation */}
      <rect x="70" y="170" width="60" height="30" rx="4" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth={1.5} />
      <text x="100" y="189" textAnchor="middle" fill="#a5b4fc" fontSize={9}>Substation</text>
      {/* Feeder */}
      <line x1="130" y1="185" x2="650" y2="185" stroke="#52525b" strokeWidth={2.5} />
      {/* Reverse flow arrows */}
      {[260, 410, 560].map(x => (
        <line key={x} x1={x} y1="175" x2={x - 60} y2="175" stroke="#ef4444" strokeWidth={1.5} markerEnd="url(#rpfArrR)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" />
        </line>
      ))}
      {/* Loads with solar */}
      {[250, 400, 550].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="185" x2={x} y2="208" stroke="#52525b" strokeWidth={1} />
          <rect x={x - 14} y="208" width="28" height="16" rx="3" fill="#18181b" stroke="#3f3f46" />
          <text x={x} y="219" textAnchor="middle" fill="#71717a" fontSize={7}>Load</text>
          {/* Solar panel */}
          <rect x={x + 16} y="202" width="20" height="14" rx="2" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth={1} />
          <text x={x + 26} y="212" textAnchor="middle" fill="#f59e0b" fontSize={6}>PV</text>
        </g>
      ))}
      {/* Voltage profile rising */}
      <text x="680" y="180" fill="#ef4444" fontSize={8}>V rises!</text>

      {/* Warning box */}
      <rect x="180" y="245" width="400" height="28" rx="6" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.2)" />
      <text x="380" y="260" textAnchor="middle" fill="#ef4444" fontSize={9} fontWeight={500}>Reverse flow causes voltage rise, relay misoperation, and protection blind spots</text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Reverse Power Flow from Distributed Rooftop Solar</h2>
      <p style={S.p}>
        Traditional distribution feeders were designed for <strong style={{ color: '#e4e4e7' }}>unidirectional power flow</strong> — from
        the substation down to consumers. Rooftop solar photovoltaic (PV) systems at consumer premises fundamentally
        challenge this paradigm. When distributed generation (DG) at a load point exceeds local consumption, surplus
        power flows <em>backwards</em> through the feeder toward the substation. This is <strong style={{ color: '#e4e4e7' }}>reverse power flow</strong>.
      </p>

      <TheorySVGReverseFlow />

      <h3 style={S.h3}>What Causes Reverse Power Flow?</h3>
      <p style={S.p}>
        At any node on the feeder, the net power injection is the difference between local load and local generation.
        When solar generation exceeds demand — typically during midday hours when irradiance peaks and residential
        load is at its lowest — the node becomes a net exporter:
      </p>
      <div style={S.eq}>P_net(x) = P_load(x) − P_solar(x)</div>
      <p style={S.p}>
        If P_net is negative at enough nodes, the aggregate power flow at the substation reverses. The feeder
        effectively becomes a generator, pushing power back into the 33 kV or 66 kV network upstream.
      </p>

      <h3 style={S.h3}>Why Radial Feeders Assume Unidirectional Flow</h3>
      <p style={S.p}>
        Indian 11 kV distribution feeders are radial — a single path from the substation to the farthest consumer.
        Protection coordination (fuses, sectionalizers, reclosers), voltage regulation (line drop compensators,
        OLTC settings), and conductor sizing all assume that current flows only from the substation outward.
        Reverse flow violates every one of these design assumptions.
      </p>

      <h3 style={S.h3}>Voltage Rise at the Point of Common Coupling</h3>
      <p style={S.p}>
        Under normal forward flow, voltage drops progressively from the substation to the feeder tail due to
        I²R losses in the conductor. When DG injects power, the voltage at the injection point <em>rises</em> above
        the sending-end voltage. The approximate voltage change across a feeder segment carrying power P is:
      </p>
      <div style={S.eq}>ΔV ≈ (P × R + Q × X) / (V × 1000)&nbsp;&nbsp;[kV]</div>
      <p style={S.p}>
        For forward flow (P {'>'} 0), ΔV is positive and voltage drops. For reverse flow (P {'<'} 0), ΔV is negative
        and voltage <em>rises</em>. On resistive rural feeders (high R/X ratio), the voltage rise from active power
        injection dominates. If the rise exceeds the statutory ±6% band (ANSI C84.1 / IE Rules), it causes
        overvoltage at consumer premises.
      </p>

      <h3 style={S.h3}>Hosting Capacity</h3>
      <p style={S.p}>
        The <strong style={{ color: '#e4e4e7' }}>hosting capacity</strong> of a feeder is the maximum amount of DG (in kW or kWp) that can be
        connected without violating voltage, thermal, or protection limits under any credible operating condition.
        It is determined by the most binding constraint — usually voltage rise at the feeder tail during minimum
        load and maximum generation:
      </p>
      <div style={S.eq}>HC = max P_DG &nbsp;s.t.&nbsp; V_min ≤ V(x) ≤ V_max &nbsp;∀x ∈ feeder</div>
      <p style={S.p}>
        Hosting capacity depends on feeder impedance, conductor size, length, load distribution, and the location
        of DG along the feeder. DG located near the substation has less voltage impact than DG at the feeder tail.
      </p>

      <h3 style={S.h3}>Protection Challenges</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Directional blindness</strong> — Conventional overcurrent relays (OCRs) at the substation are non-directional. Reverse current from DG may be interpreted as a downstream fault, causing nuisance tripping.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Fuse-recloser miscoordination</strong> — DG infeed increases fault current seen by the fuse, potentially causing it to blow before the upstream recloser can operate, destroying the fuse-saving scheme.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Sympathetic tripping</strong> — A fault on an adjacent feeder may cause DG on the healthy feeder to supply fault current, tripping the healthy feeder's protection.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Unintentional islanding</strong> — If the substation breaker opens, DG may continue to energize the feeder, creating a safety hazard for linemen and causing out-of-phase reclosure.</li>
      </ul>

      <h3 style={S.h3}>Solutions & Mitigation</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Smart inverters (IEEE 1547-2018)</strong> — Volt-VAr mode absorbs reactive power to lower voltage; Volt-Watt mode curtails real power output when voltage exceeds a setpoint. These are autonomous, fast-acting, and require no communication.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>OLTC coordination</strong> — On-load tap changers at the substation transformer can be set to wider bandwidth or equipped with line drop compensation (LDC) that accounts for bidirectional flow.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Network reconfiguration</strong> — Transferring load between feeders via tie switches can redistribute DG hosting across the network.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Battery Energy Storage (BESS)</strong> — Community or feeder-level BESS absorbs surplus solar at midday and dispatches during evening peak, reducing reverse flow and voltage rise.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Directional protection</strong> — Upgrading OCRs to directional overcurrent relays (67/67N) that can distinguish forward fault current from reverse DG current.</li>
      </ul>

      <h3 style={S.h3}>India's Net Metering Framework</h3>
      <p style={S.p}>
        Net metering allows rooftop solar consumers to export surplus power to the grid, with the exported units
        being adjusted against consumed units on a billing-cycle basis. The framework is governed by state electricity
        regulatory commissions (SERCs) under the Electricity Act 2003 and MNRE guidelines.
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Parameter</th>
            <th style={S.th}>Typical Provision</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Eligible capacity', 'Up to 1 MW (varies by state)'],
            ['Metering', 'Bidirectional net meter at consumer premises'],
            ['Settlement', 'kWh banking within billing cycle; surplus at APPC rate'],
            ['Technical limit', 'DG ≤ 80% of DTR capacity (to avoid reverse flow at 11 kV)'],
            ['Interconnection', 'As per CEA Technical Standards for DG, 2013 / 2019 amendment'],
            ['Anti-islanding', 'Required per IEC 62116 / IEEE 1547'],
          ].map(([p, v]) => (
            <tr key={p}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{p}</td>
              <td style={S.td}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.ctx}>
        <span style={S.ctxT}>Real-World Context — Andhra Pradesh</span>
        <p style={S.ctxP}>
          AP has ~2 GW of rooftop solar potential. Under APERC's net metering regulation, consumers up to 1 MW can
          install rooftop solar with net metering. At high penetration levels ({'>'} 30% of transformer capacity),
          DISCOMs face reverse flow and voltage issues on 11 kV feeders. APEPDCL has flagged 200+ distribution
          transformers (DTRs) with high solar hosting challenges — particularly on long, lightly-loaded rural feeders
          in East Godavari and Visakhapatnam districts where R/X ratios exceed 3:1 and conductor sizes are 50 mm² ACSR
          or smaller. APSPDCL has begun pilot deployment of smart inverters with Volt-VAr droop settings on feeders
          in Kurnool district, where solar penetration on some 11 kV feeders exceeds 40% of transformer nameplate.
        </p>
      </div>

      <h3 style={S.h3}>Hosting Capacity Assessment Methodology</h3>
      <p style={S.p}>
        A systematic hosting capacity study evaluates the feeder's ability to absorb DG without violating
        operational constraints. The methodology involves:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Step 1</strong> — Develop a validated feeder model (conductor impedance, topology, load allocation) in a power flow tool (OpenDSS, ETAP, PSS/SINCAL).</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Step 2</strong> — Define study scenarios: minimum load / maximum generation (worst-case voltage rise), maximum load / no generation (baseline voltage drop).</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Step 3</strong> — Incrementally add DG at each node and run power flow until the first constraint binds: steady-state voltage (±6%), thermal rating, protection reach, or flicker.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Step 4</strong> — Record the maximum DG at each node — the hosting capacity map. Present results as a spatial heat map along the feeder.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Step 5</strong> — Assess mitigation options (smart inverters, OLTC, BESS) and re-evaluate hosting capacity with mitigations in place.</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>Simulation Assumptions</span>
        <p style={S.ctxP}>
          This simulation models a 10 km, 11 kV radial feeder with 5 load points and conductor resistance of 1.3 Ω/km
          (typical 50 mm² ACSR). Each household has a peak demand of 3 kW and optional 5 kWp rooftop solar. Reactive power
          effects are neglected (unity power factor assumed for both loads and inverters). The substation voltage is regulated
          at 11.0 kV by an OLTC. Voltage limits follow the ±6% band per Indian Electricity Rules / ANSI C84.1.
        </p>
      </div>

      <h3 style={S.h3}>Key Equations Used</h3>
      <p style={S.p}>Solar irradiance model (bell curve, 6 AM to 6 PM):</p>
      <div style={S.eq}>G(t) = sin(π × (t − 6) / 12) &nbsp;&nbsp;for 6 ≤ t ≤ 18</div>
      <p style={S.p}>Voltage change across a feeder segment of resistance R carrying net power P:</p>
      <div style={S.eq}>V_receiving = V_sending − (P × R) / (V_sending × 1000)</div>
      <p style={S.p}>Voltage limits (±6% of nominal 11 kV):</p>
      <div style={S.eq}>10.34 kV ≤ V(x) ≤ 11.66 kV</div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>APERC (Rooftop Solar PV Grid Interactive Systems Based on Net Metering) Regulations</li>
        <li style={S.li}>IEEE 1547-2018 — Standard for Interconnection and Interoperability of DERs</li>
        <li style={S.li}>CEA (Technical Standards for Connectivity of Distributed Generation Resources) Regulations, 2013 & 2019 Amendment</li>
        <li style={S.li}>IEC 62116 — Utility-interconnected PV inverters — Test procedure for islanding prevention</li>
        <li style={S.li}>MNRE — Guidelines for Rooftop Solar Programme Phase-II</li>
        <li style={S.li}>EPRI — Stochastic Analysis to Determine Feeder Hosting Capacity for DERs (Technical Report 1026423)</li>
      </ul>
    </div>
  );
}

export default function ReversePowerFlow() {
  const [tab, setTab] = useState('simulate');
  const [hour, setHour] = useState(12);
  const [pen, setPen] = useState(60);

  const data = useMemo(() => compute(hour, pen), [hour, pen]);

  const vMaxCol = data.maxV > V_HI ? '#ef4444' : data.maxV > V_HI - 0.15 ? '#f59e0b' : '#22c55e';
  const vMinCol = data.minV < V_LO ? '#ef4444' : data.minV < V_LO + 0.15 ? '#f59e0b' : '#22c55e';
  const hostCol = data.hostingUtil > 100 ? '#ef4444' : data.hostingUtil > 80 ? '#f59e0b' : '#22c55e';

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram data={data} hour={hour} />
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Net Power at SS</span>
              <span style={{ ...S.rv, color: data.ssFlow < -5 ? '#ef4444' : '#22c55e' }}>
                {data.ssFlow > 0 ? '+' : ''}{data.ssFlow.toFixed(0)} kW
              </span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Max Voltage</span>
              <span style={{ ...S.rv, color: vMaxCol }}>{data.maxV.toFixed(3)} kV</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Min Voltage</span>
              <span style={{ ...S.rv, color: vMinCol }}>{data.minV.toFixed(3)} kV</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Voltage Violation</span>
              <span style={{ ...S.rv, color: data.violation ? '#ef4444' : '#22c55e' }}>
                {data.violation ? 'Yes' : 'No'}
              </span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Reverse Flow Duration</span>
              <span style={{ ...S.rv, color: data.revHours > 0 ? '#f59e0b' : '#71717a' }}>{data.revHours.toFixed(1)} hrs</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Hosting Cap. Util.</span>
              <span style={{ ...S.rv, color: hostCol }}>{data.hostingUtil.toFixed(0)}%</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Time of Day</span>
              <input type="range" min={0} max={24} step={0.5} value={hour}
                onChange={e => setHour(+e.target.value)} style={S.slider} />
              <span style={S.val}>{fmtHour(hour)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Solar Penetration</span>
              <input type="range" min={0} max={100} step={5} value={pen}
                onChange={e => setPen(+e.target.value)} style={S.slider} />
              <span style={S.val}>{pen}%</span>
            </div>
            <span style={{ fontSize: 12, color: '#3f3f46', marginLeft: 'auto' }}>
              Hosting capacity: {data.hostCapPen}% ({(NODES.reduce((s, n) => s + n.houses, 0) * data.hostCapPen / 100 * SOLAR_KWP).toFixed(0)} kWp)
            </span>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
