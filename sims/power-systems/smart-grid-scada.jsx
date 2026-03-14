import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '12px 16px 0', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 },
  controls: { padding: '12px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 8 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 110, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 40, textAlign: 'right' },
  results: { display: 'flex', gap: 28, padding: '10px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  alarmBar: { padding: '6px 24px', background: '#08080c', borderTop: '1px solid #1a1a24', display: 'flex', gap: 6, overflowX: 'auto', alignItems: 'stretch' },
  alarmLbl: { fontSize: 10, color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', writingMode: 'vertical-rl', transform: 'rotate(180deg)', paddingRight: 6, display: 'flex', alignItems: 'center', flexShrink: 0 },
  ac: (sev) => ({ padding: '4px 8px', borderRadius: 5, minWidth: 155, flexShrink: 0, background: sev === 'fault' ? 'rgba(239,68,68,0.06)' : sev === 'warn' ? 'rgba(245,158,11,0.06)' : 'rgba(34,197,94,0.04)', borderLeft: `2px solid ${sev === 'fault' ? '#ef4444' : sev === 'warn' ? '#f59e0b' : '#22c55e'}`, fontSize: 11, color: sev === 'fault' ? '#fca5a5' : sev === 'warn' ? '#fcd34d' : '#86efac', lineHeight: 1.5 }),
  at: { color: '#52525b', fontSize: 9, fontFamily: 'monospace', display: 'block' },
  sel: { padding: '5px 8px', borderRadius: 6, border: '1px solid #27272a', background: '#18181b', color: '#a1a1aa', fontSize: 12, cursor: 'pointer', outline: 'none' },
  btn: (active, danger) => ({ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${danger ? '#ef4444' : active ? '#6366f1' : '#27272a'}`, background: danger ? 'rgba(239,68,68,0.1)' : active ? 'rgba(99,102,241,0.15)' : 'transparent', color: danger ? '#fca5a5' : active ? '#a5b4fc' : '#a1a1aa', transition: 'all 0.15s' }),
  popup: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' },
  popCard: { background: '#18181b', border: '1px solid #27272a', borderRadius: 16, padding: '24px 28px', maxWidth: 360, width: '90%' },
  popTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#f4f4f5' },
  popRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1f1f23', fontSize: 14 },
  popL: { color: '#71717a' },
  popV: { color: '#e4e4e7', fontFamily: 'monospace', fontWeight: 600 },
  popClose: { marginTop: 16, padding: '8px 20px', borderRadius: 8, border: '1px solid #3f3f46', background: 'transparent', color: '#a1a1aa', fontSize: 13, cursor: 'pointer' },
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

const SUBS = [
  { tag: 'SS-1', name: 'Vijayawada Urban', cap: 10 },
  { tag: 'SS-2', name: 'Industrial Area', cap: 12 },
  { tag: 'SS-3', name: 'Residential Colony', cap: 8 },
];
const FEEDS = [
  { name: 'F1', ss: 0, baseMW: 4.2 }, { name: 'F2', ss: 0, baseMW: 3.8 },
  { name: 'F3', ss: 1, baseMW: 5.5 }, { name: 'F4', ss: 1, baseMW: 4.0 },
  { name: 'F5', ss: 2, baseMW: 2.5 }, { name: 'F6', ss: 2, baseMW: 3.0 },
];
const SSP = [{ x: 130, y: 210 }, { x: 720, y: 210 }, { x: 430, y: 378 }];
const FLP = [
  { x: 50, y: 328 }, { x: 210, y: 328 },
  { x: 640, y: 328 }, { x: 800, y: 328 },
  { x: 340, y: 465 }, { x: 520, y: 465 },
];
const GSx = 430, GSy = 48;
const TOD = [.45,.42,.40,.38,.40,.45,.55,.70,.82,.85,.88,.90,.85,.80,.78,.80,.85,.92,1.0,.98,.90,.75,.60,.50];
const FLISR_MSG = [
  'T+0.0s — Fault detected: overcurrent 2.8 kA on F2',
  'T+0.5s — CB-F2 tripped by overcurrent relay',
  'T+1.2s — FPI locates fault at Section 2 of F2',
  'T+2.0s — Sectionalizer S2 opened — fault isolated',
  'T+3.0s — NOP tie-switch TS-25 closed — alternate path',
  'T+3.5s — Supply restored to healthy sections via SS-3',
  'FLISR Complete — Total: 3 min 12 sec (real-time equivalent)',
];

function compute(loadPct, hour, brk, shed, nopCl, reconf) {
  const sc = (loadPct / 100) * TOD[hour];
  const fL = FEEDS.map((f, i) => {
    if (!brk[i]) return (i === 1 && nopCl) ? f.baseMW * sc * 0.7 : 0;
    return f.baseMW * sc * (shed[i] ? 0.3 : 1);
  });
  const total = fL.reduce((a, b) => a + b, 0);
  const busV = SUBS.map((s, si) => {
    let ssL = FEEDS.reduce((a, f, fi) => f.ss === si ? a + fL[fi] : a, 0);
    if (si === 2 && nopCl && !brk[1]) ssL += fL[1];
    return Math.max(9.5, 11.0 - ssL * 0.07 * (reconf ? 0.82 : 1));
  });
  const fI = fL.map(l => l > 0 ? l * 1000 / (1.732 * 11 * 0.85) : 0);
  let loss = fL.reduce((a, l) => a + l * l * 6.5, 0);
  if (reconf) loss *= 0.85;
  return { fL, total, busV, fI, loss, on: brk.filter(Boolean).length };
}

function NetworkMap({ net, brk, shed, flisrStep, nopCl, reconf, onSS }) {
  const vCol = v => v > 10.4 ? '#22c55e' : v > 10.0 ? '#f59e0b' : '#ef4444';
  return (
    <svg viewBox="0 0 860 510" style={{ width: '100%', maxWidth: 880, height: 'auto' }}>
      <defs>
        <filter id="gw"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      {Array.from({ length: 18 }, (_, i) => <line key={`gx${i}`} x1={i * 50} y1={0} x2={i * 50} y2={510} stroke="#0e0e13" strokeWidth={0.5} />)}
      {Array.from({ length: 11 }, (_, i) => <line key={`gy${i}`} x1={0} y1={i * 50} x2={860} y2={i * 50} stroke="#0e0e13" strokeWidth={0.5} />)}
      <text x={430} y={16} textAnchor="middle" fill="#27272a" fontSize={10} fontWeight={700} letterSpacing="0.15em">SCADA CONTROL CENTER — REGIONAL DISTRIBUTION GRID</text>

      {/* Grid Substation */}
      <rect x={GSx - 78} y={GSy - 22} width={156} height={52} rx={8} fill="rgba(14,14,20,0.95)" stroke="#6366f1" strokeWidth={2} />
      <text x={GSx} y={GSy - 3} textAnchor="middle" fill="#818cf8" fontSize={12} fontWeight={700}>Grid Substation</text>
      <text x={GSx} y={GSy + 16} textAnchor="middle" fill="#a1a1aa" fontSize={10}>220 / 33 kV</text>
      <circle cx={GSx + 68} cy={GSy - 12} r={4} fill="#22c55e"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" /></circle>

      {/* 33 kV transmission lines */}
      {SSP.map((ss, i) => {
        const y1 = GSy + 30, y2 = ss.y - 28;
        return (<g key={`t${i}`}>
          <line x1={GSx} y1={y1} x2={ss.x} y2={y2} stroke="#22c55e" strokeWidth={2.5} opacity={0.3} />
          <rect x={(GSx + ss.x) / 2 - 5} y={(y1 + y2) / 2 - 5} width={10} height={10} rx={2} fill="#22c55e" stroke="#0f0f14" strokeWidth={1} />
          {[0, 1].map(p => (<circle key={p} r={2.5} fill="#22c55e" opacity={0.55} filter="url(#gw)">
            <animateMotion dur="3s" begin={`${p * 1.5}s`} repeatCount="indefinite" path={`M${GSx},${y1} L${ss.x},${y2}`} />
          </circle>))}
          <text x={(GSx + ss.x) / 2 + 12} y={(y1 + y2) / 2 + 4} fill="#1e1e28" fontSize={8} fontWeight={600}>33 kV</text>
        </g>);
      })}

      {/* Distribution Substations */}
      {SUBS.map((s, i) => {
        const p = SSP[i], v = net.busV[i];
        const ssL = FEEDS.reduce((a, f, fi) => f.ss === i ? a + net.fL[fi] : a, 0);
        return (<g key={`s${i}`} onClick={() => onSS(i)} style={{ cursor: 'pointer' }}>
          <rect x={p.x - 64} y={p.y - 25} width={128} height={50} rx={8} fill="rgba(14,14,20,0.95)" stroke={vCol(v)} strokeWidth={1.5} />
          <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#a1a1aa" fontSize={9} fontWeight={600}>{s.tag} • {s.name}</text>
          <text x={p.x - 24} y={p.y + 14} textAnchor="middle" fill={vCol(v)} fontSize={12} fontWeight={700}>{v.toFixed(2)} kV</text>
          <text x={p.x + 32} y={p.y + 14} textAnchor="middle" fill="#71717a" fontSize={10}>{ssL.toFixed(1)} MW</text>
          <circle cx={p.x + 54} cy={p.y - 16} r={3.5} fill={vCol(v)}>
            <animate attributeName="opacity" values="1;0.3;1" dur={v > 10.4 ? '2.5s' : '0.8s'} repeatCount="indefinite" />
          </circle>
        </g>);
      })}

      {/* 11 kV Feeders */}
      {FEEDS.map((f, i) => {
        const ss = SSP[f.ss], lp = FLP[i];
        const ffIdx = FEEDS.filter((_, j) => FEEDS[j].ss === f.ss && j < i).length;
        const x1 = ss.x + (ffIdx === 0 ? -20 : 20), y1 = ss.y + 25;
        const x2 = lp.x, y2 = lp.y;
        const bx = x1 + (x2 - x1) * 0.35, by = y1 + (y2 - y1) * 0.35;
        const on = brk[i], col = on ? '#22c55e' : '#ef4444';
        const isTarget = flisrStep !== null && i === 1;
        return (<g key={`f${i}`}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={on ? 1.8 : 1.2} opacity={on ? 0.4 : 0.2} strokeDasharray={on ? 'none' : '6 4'} />
          <rect x={bx - 5} y={by - 5} width={10} height={10} rx={2} fill={col} stroke="#0a0a0e" strokeWidth={1.2} />
          {on && [0, 1].map(p => (<circle key={p} r={2} fill={col} opacity={0.5} filter="url(#gw)">
            <animateMotion dur="2s" begin={`${p}s`} repeatCount="indefinite" path={`M${x1},${y1} L${x2},${y2}`} />
          </circle>))}
          {on && <text x={bx + 12} y={by + 3} fill="#3f3f46" fontSize={8} fontWeight={500}>{net.fI[i].toFixed(0)} A</text>}
          <rect x={x2 - 35} y={y2 - 12} width={70} height={24} rx={5} fill="rgba(14,14,20,0.95)" stroke={on ? '#27272a' : '#ef4444'} strokeWidth={1} />
          <text x={x2} y={y2 + 4} textAnchor="middle" fill={on ? '#d4d4d8' : '#ef4444'} fontSize={10} fontWeight={600}>
            {on ? `${net.fL[i].toFixed(1)} MW` : 'OFF'}
          </text>
          <text x={x2} y={y2 - 17} textAnchor="middle" fill={shed[i] ? '#f59e0b' : '#52525b'} fontSize={9} fontWeight={600}>
            {f.name}{shed[i] ? ' ⚠' : ''}
          </text>
          {isTarget && flisrStep <= 2 && (<g>
            <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 14} textAnchor="middle" fill="#ef4444" fontSize={16}>⚡</text>
            <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={10} fill="none" stroke="#ef4444" strokeWidth={2}>
              <animate attributeName="r" values="6;16;6" dur="0.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.1;0.7" dur="0.8s" repeatCount="indefinite" />
            </circle>
          </g>)}
          {isTarget && flisrStep >= 2 && flisrStep <= 5 && (<g>
            <circle cx={(x1 + x2) / 2 + 8} cy={(y1 + y2) / 2 + 8} r={4} fill="#ef4444">
              <animate attributeName="opacity" values="1;0.2;1" dur="0.5s" repeatCount="indefinite" />
            </circle>
            <text x={(x1 + x2) / 2 + 16} y={(y1 + y2) / 2 + 11} fill="#ef4444" fontSize={7} fontWeight={700}>FPI</text>
          </g>)}
          {isTarget && flisrStep >= 3 && flisrStep <= 5 && (
            <line x1={(x1 + x2) / 2 - 10} y1={(y1 + y2) / 2} x2={(x1 + x2) / 2 + 10} y2={(y1 + y2) / 2} stroke="#ef4444" strokeWidth={3} strokeLinecap="round" />
          )}
        </g>);
      })}

      {/* NOP tie line (F2 ↔ F5) */}
      {(() => { const a = FLP[1], b = FLP[4], cl = nopCl || reconf; return (<g>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={cl ? '#22c55e' : '#52525b'} strokeWidth={cl ? 1.8 : 1} strokeDasharray={cl ? 'none' : '8 4'} opacity={cl ? 0.4 : 0.18} />
        <rect x={(a.x + b.x) / 2 - 15} y={(a.y + b.y) / 2 - 9} width={30} height={18} rx={4} fill="#0a0a0e" stroke={cl ? '#22c55e' : '#3f3f46'} strokeWidth={1} />
        <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 4} textAnchor="middle" fill={cl ? '#22c55e' : '#52525b'} fontSize={8} fontWeight={700}>{cl ? 'CLOSED' : 'NOP'}</text>
        {cl && [0, 1].map(p => (<circle key={p} r={2} fill="#22c55e" opacity={0.5} filter="url(#gw)">
          <animateMotion dur="2.5s" begin={`${p * 1.25}s`} repeatCount="indefinite" path={`M${a.x},${a.y} L${b.x},${b.y}`} />
        </circle>))}
      </g>); })()}

      {/* Legend */}
      <g transform="translate(10,480)">
        <rect x={0} y={-2} width={8} height={8} rx={1.5} fill="#22c55e" /><text x={12} y={6} fill="#3f3f46" fontSize={8}>Breaker Closed</text>
        <rect x={90} y={-2} width={8} height={8} rx={1.5} fill="#ef4444" /><text x={102} y={6} fill="#3f3f46" fontSize={8}>Breaker Open</text>
        <line x1={180} y1={2} x2={200} y2={2} stroke="#52525b" strokeWidth={1} strokeDasharray="4 3" /><text x={204} y={6} fill="#3f3f46" fontSize={8}>NOP</text>
      </g>

      {flisrStep !== null && (<g>
        <rect x={220} y={488} width={420} height={20} rx={5} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth={0.8} />
        <text x={430} y={501} textAnchor="middle" fill="#a5b4fc" fontSize={10} fontWeight={600}>{FLISR_MSG[Math.min(flisrStep, 6)]}</text>
      </g>)}
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Smart Grid & SCADA Systems</h2>
      <p style={S.p}>
        A <strong style={{ color: '#e4e4e7' }}>smart grid</strong> integrates digital communication,
        advanced sensing, and automated control into the traditional electrical grid. At its heart is the{' '}
        <strong style={{ color: '#e4e4e7' }}>SCADA (Supervisory Control and Data Acquisition)</strong> system —
        the nerve center that enables operators to monitor and control the entire distribution network
        from a central control room in real time.
      </p>

      <h3 style={S.h3}>SCADA Architecture</h3>
      <p style={S.p}>
        A distribution SCADA system has four layers, each performing a critical function:
      </p>
      <div style={S.eq}>RTU / IED → Communication Network → Master Station (SCADA Server) → HMI (Operator Console)</div>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>RTU (Remote Terminal Unit):</strong> Installed at each substation, it interfaces with field devices — CTs, PTs, breaker contacts, tap changers. RTUs digitize analog measurements (voltage, current, power) and transmit them to the master station. Modern RTUs also accept control commands (open/close breakers, adjust taps).</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>IED (Intelligent Electronic Device):</strong> A more capable successor to the RTU. IEDs include protective relays, bay controllers, and meters that communicate via IEC 61850. A single IED can perform protection, measurement, and control simultaneously.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Communication Network:</strong> Links RTUs/IEDs to the master station. Media includes fiber optic (preferred for reliability), GPRS/4G cellular, microwave radio, and pilot cables. Latency requirements range from 4 ms (protection) to 1–2 seconds (SCADA polling).</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Master Station:</strong> Central server that polls RTUs, processes incoming data (state estimation, alarm processing, event logging), and sends control commands. Typically deployed in redundant hot-standby configuration.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>HMI (Human Machine Interface):</strong> What operators see — schematic network diagrams with real-time data overlays, alarm lists, trend displays, and control dialogs. The simulation tab above mimics a simplified HMI.</li>
      </ul>

      <h3 style={S.h3}>Communication Protocols</h3>
      <table style={S.tbl}>
        <thead><tr>
          <th style={S.th}>Protocol</th><th style={S.th}>Medium</th><th style={S.th}>Standard</th><th style={S.th}>Use Case</th>
        </tr></thead>
        <tbody>
          {[
            ['DNP3', 'Serial / TCP', 'IEEE 1815', 'Substation ↔ Master station'],
            ['IEC 60870-5-101', 'Serial', 'IEC 60870', 'Point-to-point SCADA (legacy)'],
            ['IEC 60870-5-104', 'TCP/IP', 'IEC 60870', 'WAN SCADA over IP networks'],
            ['IEC 61850 GOOSE', 'Ethernet', 'IEC 61850-8-1', 'Fast intra-substation events'],
            ['IEC 61850 MMS', 'TCP/IP', 'IEC 61850-8-1', 'Client-server data exchange'],
            ['Modbus', 'Serial / TCP', 'Modicon', 'Legacy field devices, meters'],
          ].map(([p, m, s, u]) => (<tr key={p}>
            <td style={{ ...S.td, color: '#d4d4d8', fontWeight: 500 }}>{p}</td>
            <td style={S.td}>{m}</td><td style={S.td}>{s}</td><td style={S.td}>{u}</td>
          </tr>))}
        </tbody>
      </table>

      <h3 style={S.h3}>IEC 61850 — The Modern Substation Standard</h3>
      <p style={S.p}>
        IEC 61850 is the international standard for communication in substations and is rapidly
        replacing DNP3 in new installations. It defines a complete data model for substation devices
        and three key message types:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>GOOSE (Generic Object Oriented Substation Event):</strong> Publisher-subscriber multicast messages for fast peer-to-peer communication between IEDs. Transfer time {'<'}4 ms — fast enough for protection interlocking. Eliminates copper wiring between relays.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>MMS (Manufacturing Message Specification):</strong> Client-server protocol for reading/writing data objects, retrieving event logs, and file transfer. Used for SCADA polling and engineering access.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Sampled Values (SV):</strong> Digitized analog measurements streamed over Ethernet at 80–256 samples per cycle (4000–12800 samples/sec at 50 Hz). Enables process-bus architecture where conventional CT/PT copper wiring is replaced by fiber optic merging units.</li>
      </ul>
      <p style={S.p}>
        IEC 61850 uses a hierarchical data model: <strong style={{ color: '#e4e4e7' }}>Logical Device → Logical Node → Data Object → Data Attribute</strong>. For example, a circuit breaker is modeled as logical node <code style={{ color: '#c4b5fd' }}>XCBR</code> with data objects for position (<code style={{ color: '#c4b5fd' }}>Pos</code>), operating count, and health status. This standardized model enables multi-vendor interoperability.
      </p>

      <h3 style={S.h3}>Synchrophasors & PMUs</h3>
      <p style={S.p}>
        A <strong style={{ color: '#e4e4e7' }}>Phasor Measurement Unit (PMU)</strong> measures voltage and current phasors with precise GPS time-stamps, enabling system-wide synchronized snapshots:
      </p>
      <div style={S.eq}>V(t) = Vm cos(2πf₀t + φ) → Synchrophasor = (Vm/√2) ∠φ at GPS time T</div>
      <ul style={S.ul}>
        <li style={S.li}>PMUs sample at 25–50 frames/sec (vs. SCADA's 2–4 sec polling) — IEEE C37.118 standard</li>
        <li style={S.li}>Data streams to a <strong style={{ color: '#e4e4e7' }}>PDC (Phasor Data Concentrator)</strong> which time-aligns phasors from multiple PMUs</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>WAMS (Wide Area Monitoring System)</strong> uses PMU data to detect inter-area oscillations, voltage instability, islanding, and out-of-step conditions in real time</li>
        <li style={S.li}>Phase angle differences across the grid reveal power transfer stress — angles {'>'} 30° indicate potential instability</li>
      </ul>
      <div style={S.ctx}>
        <span style={S.ctxT}>India's Unified WAMS</span>
        <p style={S.ctxP}>
          Grid-India (formerly POSOCO) operates India's unified WAMS, collecting synchrophasor data from
          over 70 PMUs installed across all five regional grids. The National WAMS at NLDC (New Delhi)
          monitors inter-regional power flows, frequency deviations, and oscillation modes in real time.
          This was instrumental during the July 2012 grid collapse analysis and subsequent grid-strengthening
          measures. Each RLDC has a regional PDC feeding into the national PDC.
        </p>
      </div>

      <h3 style={S.h3}>Distribution Management System (DMS)</h3>
      <p style={S.p}>
        A DMS is the software brain that sits on top of SCADA, providing advanced analytics and
        automated control for distribution networks:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>FLISR (Fault Location, Isolation & Service Restoration):</strong> The automated sequence demonstrated in this simulation. When a fault occurs: (1) fault passage indicators detect fault current direction, (2) the upstream breaker trips, (3) FLISR software locates the faulted section using FPI data, (4) motorized sectionalizers isolate the faulted section, (5) the NOP closes to restore supply from an alternate feeder. Total time: 2–5 minutes automated vs. 2–4 hours manual.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>VVO (Volt-VAR Optimization):</strong> Coordinates capacitor banks, voltage regulators, and OLTC tap changers to minimize losses and maintain voltage within ±6% limits. Uses real-time SCADA data + power flow models.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Network Reconfiguration:</strong> Optimizes feeder topology by moving NOP positions to minimize losses. Uses algorithms (branch exchange, genetic algorithms) to find the radial configuration with minimum I²R loss while maintaining voltage constraints.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Demand Response:</strong> Integrates with AMI (Advanced Metering Infrastructure) to shed non-critical loads during peak demand or emergency conditions. Time-of-use tariffs + direct load control signals.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>DER Management:</strong> Monitors and controls distributed energy resources — rooftop solar, battery storage, EV chargers — to manage reverse power flow and voltage rise on LT networks.</li>
      </ul>
      <div style={S.eq}>Loss Reduction by Reconfiguration: ΔP_loss = Σ(I²R)_normal − Σ(I²R)_optimized</div>

      <h3 style={S.h3}>Advanced Metering Infrastructure (AMI)</h3>
      <p style={S.p}>
        AMI is the smart metering backbone of a smart grid. Unlike conventional meters that require manual reading, AMI meters communicate bidirectionally:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>RF mesh / GPRS / NB-IoT communication from meter to head-end system</li>
        <li style={S.li}>15-minute interval data enables time-of-use tariffs, tamper detection, and demand profiling</li>
        <li style={S.li}>Remote connect/disconnect capability for prepaid billing and load management</li>
        <li style={S.li}>Outage detection — meter "last gasp" message pinpoints outage location before customer calls</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>India's Smart Grid Pilots & Programs</span>
        <p style={S.ctxP}>
          The <strong>National Smart Grid Mission (NSGM)</strong> launched 11 pilot projects across India
          to demonstrate smart grid technologies. Key pilots include:
          <br /><br />
          <strong>AP — Vijayawada Smart Grid Pilot (APEPDCL):</strong> Deployed AMI smart meters, SCADA
          with FLISR capability, and distribution automation across select urban feeders. Demonstrated
          30% reduction in outage duration (SAIDI improvement).
          <br /><br />
          <strong>Gujarat — UGVCL Pilot:</strong> AMI + SCADA integration with 20,000 smart meters,
          automatic meter reading, and tamper detection. Achieved 12% AT&C loss reduction.
          <br /><br />
          <strong>Puducherry:</strong> India's first comprehensive smart grid deployment — full SCADA,
          AMI, distribution automation, and demand response covering the entire UT.
          <br /><br />
          <strong>RDSS (Revamped Distribution Sector Scheme):</strong> ₹3,03,758 crore scheme (2021)
          targeting smart metering (250 million prepaid smart meters), feeder segregation, distribution
          infrastructure upgrades, and AT&C loss reduction to 12–15% pan-India. EESL is the central
          nodal agency for smart meter procurement and deployment.
          <br /><br />
          <strong>R-APDRP / IPDS:</strong> Earlier schemes that laid the groundwork — R-APDRP established
          IT-enabled billing and SCADA in 1,400+ towns; IPDS extended this to remaining urban areas.
        </p>
      </div>

      <h3 style={S.h3}>Cybersecurity in Smart Grids</h3>
      <p style={S.p}>
        As grids become increasingly digital and networked, cybersecurity becomes critical.
        Key standards and practices include:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>IEC 62351:</strong> Security standard for power system communication protocols — covers authentication, encryption, and access control for IEC 61850, DNP3, and IEC 60870-5-104</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>NERC CIP:</strong> North American reliability standards for critical infrastructure protection — applicable in India via CEA cybersecurity guidelines (2021)</li>
        <li style={S.li}>Defense-in-depth: network segmentation (IT/OT separation), firewalls, intrusion detection, role-based access control, and encrypted VPN tunnels for remote SCADA access</li>
      </ul>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>IEC 61850 — Communication networks and systems for power utility automation</li>
        <li style={S.li}>IEEE C37.118 — Standard for Synchrophasor Measurements for Power Systems</li>
        <li style={S.li}>IEEE 1815 (DNP3) — Standard for Electric Power Systems Communications</li>
        <li style={S.li}>CEA — Technical Standards for Communication System in Power Sector</li>
        <li style={S.li}>NSGM Reports — Ministry of Power, Government of India</li>
        <li style={S.li}>RDSS Guidelines — Ministry of Power, 2021</li>
        <li style={S.li}>Grid-India (POSOCO) — Unified Real-Time Dynamic State Measurement (URTDSM) reports</li>
        <li style={S.li}>IEC 62351 — Power systems management and associated information exchange — Data and communications security</li>
        <li style={S.li}>CEA — Guidelines on Cyber Security in Power Sector, 2021</li>
      </ul>
    </div>
  );
}

export default function SmartGridScada() {
  const [tab, setTab] = useState('simulate');
  const [loadPct, setLoadPct] = useState(85);
  const [hour, setHour] = useState(14);
  const [brk, setBrk] = useState(Array(6).fill(true));
  const [shed, setShed] = useState(Array(6).fill(false));
  const [selSS, setSelSS] = useState(null);
  const [tripT, setTripT] = useState(0);
  const [flisrStep, setFlisrStep] = useState(null);
  const [nopCl, setNopCl] = useState(false);
  const [reconf, setReconf] = useState(false);
  const [alarms, setAlarms] = useState([
    { time: '14:00:00', sev: 'info', msg: 'SCADA online — all feeders energized' },
  ]);
  const alarmSeq = useRef(0);
  const timers = useRef([]);

  const pushAlarm = useCallback((sev, msg) => {
    const seq = alarmSeq.current++;
    const hh = String(14 + Math.floor(seq / 20)).padStart(2, '0');
    const mm = String((seq * 3 + 1) % 60).padStart(2, '0');
    const ss = String((seq * 17 + 5) % 60).padStart(2, '0');
    setAlarms(prev => [{ time: `${hh}:${mm}:${ss}`, sev, msg }, ...prev].slice(0, 8));
  }, []);

  const clearT = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  useEffect(() => clearT, [clearT]);

  const net = useMemo(() => compute(loadPct, hour, brk, shed, nopCl, reconf), [loadPct, hour, brk, shed, nopCl, reconf]);
  const flisrRunning = flisrStep !== null && flisrStep < 6;

  const startFlisr = useCallback(() => {
    clearT();
    setBrk(Array(6).fill(true));
    setShed(Array(6).fill(false));
    setNopCl(false);
    setReconf(false);
    setFlisrStep(0);
    pushAlarm('fault', 'ALARM: Overcurrent on F2 — 2.8 kA detected');
    timers.current = [
      setTimeout(() => { setFlisrStep(1); setBrk(p => p.map((b, i) => i === 1 ? false : b)); pushAlarm('fault', 'TRIP: CB-F2 opened by O/C relay'); }, 800),
      setTimeout(() => { setFlisrStep(2); pushAlarm('warn', 'FPI: Fault located — Section 2 of F2'); }, 1800),
      setTimeout(() => { setFlisrStep(3); pushAlarm('warn', 'ISOLATE: Sectionalizer S2 opened'); }, 3000),
      setTimeout(() => { setFlisrStep(4); setNopCl(true); pushAlarm('info', 'NOP: Tie-switch TS-25 closed'); }, 4500),
      setTimeout(() => { setFlisrStep(5); pushAlarm('info', 'RESTORED: Supply via alternate SS-3 feed'); }, 5500),
      setTimeout(() => setFlisrStep(6), 6500),
    ];
  }, [clearT, pushAlarm]);

  const resetFlisr = useCallback(() => {
    clearT(); setFlisrStep(null); setNopCl(false);
    setBrk(Array(6).fill(true));
    pushAlarm('info', 'System reset — normal topology restored');
  }, [clearT, pushAlarm]);

  const tripFeeder = useCallback(() => {
    const on = brk[tripT];
    setBrk(p => p.map((b, i) => i === tripT ? !b : b));
    pushAlarm(on ? 'fault' : 'info', on ? `TRIP: Breaker ${FEEDS[tripT].name} opened by operator` : `CLOSE: Breaker ${FEEDS[tripT].name} reclosed`);
  }, [brk, tripT, pushAlarm]);

  const shedLoad = useCallback(() => {
    const on = shed[tripT];
    setShed(p => p.map((s, i) => i === tripT ? !s : s));
    pushAlarm(on ? 'info' : 'warn', on ? `RESTORE: Load on ${FEEDS[tripT].name} restored` : `SHED: ${FEEDS[tripT].name} load reduced to 30%`);
  }, [shed, tripT, pushAlarm]);

  const vs = net.busV.filter((_, i) => FEEDS.some((f, fi) => f.ss === i && brk[fi]));
  const minV = vs.length ? Math.min(...vs) : 0;
  const maxV = vs.length ? Math.max(...vs) : 0;
  const faultCount = alarms.filter(a => a.sev === 'fault').length;

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <NetworkMap net={net} brk={brk} shed={shed} flisrStep={flisrStep} nopCl={nopCl} reconf={reconf} onSS={setSelSS} />
          </div>

          <div style={S.alarmBar}>
            <span style={S.alarmLbl}>ALARMS</span>
            {alarms.slice(0, 5).map((a, i) => (
              <div key={i} style={S.ac(a.sev)}>
                <span style={S.at}>{a.time}</span>{a.msg}
              </div>
            ))}
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>System Load</span>
              <span style={{ ...S.rv, color: '#3b82f6' }}>{net.total.toFixed(1)} MW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Total Losses</span>
              <span style={{ ...S.rv, color: '#ef4444' }}>{net.loss.toFixed(0)} kW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Fault Alarms</span>
              <span style={{ ...S.rv, color: faultCount > 0 ? '#ef4444' : '#22c55e' }}>{faultCount}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Bus Voltage</span>
              <span style={{ ...S.rv, color: minV > 10.2 ? '#22c55e' : '#f59e0b' }}>
                {minV > 0 ? `${minV.toFixed(2)}–${maxV.toFixed(2)} kV` : '—'}
              </span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Feeders On</span>
              <span style={{ ...S.rv, color: net.on === 6 ? '#22c55e' : '#f59e0b' }}>{net.on} / 6</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Load</span>
              <input type="range" min={40} max={120} value={loadPct} onChange={e => setLoadPct(+e.target.value)} style={S.slider} />
              <span style={S.val}>{loadPct}%</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Hour</span>
              <input type="range" min={0} max={23} value={hour} onChange={e => setHour(+e.target.value)} style={{ ...S.slider, width: 90 }} />
              <span style={S.val}>{String(hour).padStart(2, '0')}:00</span>
            </div>
            <div style={S.cg}>
              <select style={S.sel} value={tripT} onChange={e => setTripT(+e.target.value)}>
                {FEEDS.map((f, i) => <option key={i} value={i}>{f.name}</option>)}
              </select>
              <button style={{ ...S.btn(false, brk[tripT]), opacity: flisrRunning ? 0.35 : 1 }} onClick={tripFeeder} disabled={flisrRunning}>
                {brk[tripT] ? 'Trip' : 'Close'}
              </button>
              <button style={{ ...S.btn(shed[tripT], false), opacity: flisrRunning ? 0.35 : 1 }} onClick={shedLoad} disabled={flisrRunning}>
                {shed[tripT] ? 'Restore' : 'Shed Load'}
              </button>
            </div>
            <div style={S.cg}>
              <button style={S.btn(flisrStep !== null, false)} onClick={flisrStep === null ? startFlisr : flisrStep >= 6 ? resetFlisr : undefined} disabled={flisrRunning}>
                {flisrStep === null ? 'FLISR Demo' : flisrStep >= 6 ? 'Reset' : 'Running…'}
              </button>
            </div>
            <div style={S.cg}>
              <button style={{ ...S.btn(reconf, false), opacity: flisrRunning ? 0.35 : 1 }} onClick={() => {
                if (flisrRunning) return;
                setReconf(p => !p);
                pushAlarm('info', reconf ? 'Normal topology restored' : 'Network reconfigured — losses minimized');
              }}>
                {reconf ? '⟲ Normal' : 'Reconfigure'}
              </button>
            </div>
          </div>

          {selSS !== null && (() => {
            const s = SUBS[selSS], v = net.busV[selSS];
            const ssL = FEEDS.reduce((a, f, i) => f.ss === selSS ? a + net.fL[i] : a, 0);
            const loading = Math.min(100, (ssL / s.cap) * 100);
            const temp = (35 + loading * 0.3).toFixed(1);
            const rows = [
              ['Bus Voltage', `${v.toFixed(3)} kV`, v > 10.4 ? '#22c55e' : '#f59e0b'],
              ['Total Load', `${ssL.toFixed(2)} MW`, '#a5b4fc'],
              ['Power Factor', '0.85 lag', '#a1a1aa'],
              ['Transformer Loading', `${loading.toFixed(1)}%`, loading > 80 ? '#ef4444' : '#a1a1aa'],
              ['Winding Temp', `${temp} °C`, parseFloat(temp) > 55 ? '#f59e0b' : '#a1a1aa'],
              ['Feeders Active', `${FEEDS.filter((f, i) => f.ss === selSS && brk[i]).length} / 2`, '#a1a1aa'],
              ['SCADA Link', 'Online', '#22c55e'],
            ];
            return (
              <div style={S.popup} onClick={() => setSelSS(null)}>
                <div style={S.popCard} onClick={e => e.stopPropagation()}>
                  <div style={S.popTitle}>{s.tag} — {s.name}</div>
                  {rows.map(([l, val, col]) => (
                    <div key={l} style={S.popRow}>
                      <span style={S.popL}>{l}</span>
                      <span style={{ ...S.popV, color: col }}>{val}</span>
                    </div>
                  ))}
                  <button style={S.popClose} onClick={() => setSelSS(null)}>Close</button>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
