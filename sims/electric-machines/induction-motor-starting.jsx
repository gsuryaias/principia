import React, { useMemo, useState } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 140, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 64, textAlign: 'right' },
  bg: { display: 'flex', gap: 6 },
  btn: (a) => ({ padding: '6px 12px', borderRadius: 8, border: a ? '1px solid #6366f1' : '1px solid #27272a', background: a ? 'rgba(99,102,241,0.18)' : 'transparent', color: a ? '#c4b5fd' : '#71717a', cursor: 'pointer', fontSize: 12, fontWeight: a ? 700 : 500 }),
  results: { display: 'flex', gap: 26, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  strip: { display: 'flex', gap: 12, padding: '12px 24px', background: '#0f0f12', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  box: { flex: '1 1 200px', padding: '12px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 10 },
  boxT: { display: 'block', fontSize: 10, color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 },
  boxV: { display: 'block', fontSize: 13, color: '#c4b5fd', fontFamily: 'monospace', lineHeight: 1.6 },
  theory: { flex: 1, padding: '32px 24px', maxWidth: 860, margin: '0 auto', overflowY: 'auto', width: '100%' },
  h2: { fontSize: 22, fontWeight: 700, color: '#f4f4f5', margin: '34px 0 14px', paddingBottom: 8, borderBottom: '1px solid #27272a' },
  h3: { fontSize: 17, fontWeight: 600, color: '#e4e4e7', margin: '24px 0 10px' },
  p: { fontSize: 15, lineHeight: 1.8, color: '#a1a1aa', margin: '0 0 14px' },
  eq: { display: 'block', padding: '14px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontFamily: 'monospace', fontSize: 15, color: '#c4b5fd', margin: '16px 0', textAlign: 'center', overflowX: 'auto' },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14, display: 'block' },
  ctxP: { fontSize: 14, lineHeight: 1.7, color: '#a1a1aa', margin: 0 },
  svgDiagram: { width: '100%', margin: '20px 0', background: '#0d0d11', border: '1px solid #27272a', borderRadius: 12, padding: 0 },
};

const METHODS = ['DOL', 'Star-Delta', 'Autotransformer'];

function machineBase(powerKW) {
  const Vll = 415;
  const eta = 0.9;
  const pf = 0.86;
  const ns = 1500;
  const nfl = 1450;
  const ifl = (powerKW * 1000) / (Math.sqrt(3) * Vll * eta * pf);
  const tfl = (powerKW * 1000) / (2 * Math.PI * nfl / 60);
  const idol = ifl * 6.2;
  const tdol = tfl * 1.85;
  return { Vll, eta, pf, ns, nfl, ifl, tfl, idol, tdol };
}

function compute(powerKW, tap) {
  const base = machineBase(powerKW);
  const methods = [
    {
      name: 'DOL',
      lineCurrent: base.idol,
      motorCurrent: base.idol,
      torque: base.tdol,
      ratioI: base.idol / base.ifl,
      ratioT: base.tdol / base.tfl,
      note: 'Full voltage applied at the stator terminals.',
      color: '#ef4444',
    },
    {
      name: 'Star-Delta',
      lineCurrent: base.idol / 3,
      motorCurrent: base.idol / Math.sqrt(3),
      torque: base.tdol / 3,
      ratioI: (base.idol / 3) / base.ifl,
      ratioT: (base.tdol / 3) / base.tfl,
      note: 'Start in star, then switch to delta near 80-90% speed.',
      color: '#f59e0b',
    },
    {
      name: 'Autotransformer',
      lineCurrent: base.idol * tap * tap,
      motorCurrent: base.idol * tap,
      torque: base.tdol * tap * tap,
      ratioI: (base.idol * tap * tap) / base.ifl,
      ratioT: (base.tdol * tap * tap) / base.tfl,
      note: 'Reduced-voltage starting with adjustable tap ratio k.',
      color: '#22c55e',
    },
  ];
  const loadTorque = base.tfl * 0.55;
  const selected = methods;
  return { base, methods: selected, loadTorque };
}

function Diagram({ data, active }) {
  const W = 980;
  const H = 420;
  const currentMax = Math.max(...data.methods.map((m) => m.ratioI));
  const torqueMax = Math.max(...data.methods.map((m) => m.ratioT), data.loadTorque / data.base.tfl);
  const boxW = 250;
  const gap = 52;
  const startX = 76;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      {data.methods.map((m, i) => {
        const x = startX + i * (boxW + gap);
        const activeCard = m.name === active;
        const curH = (m.ratioI / currentMax) * 146;
        const torH = (m.ratioT / torqueMax) * 146;
        const loadH = ((data.loadTorque / data.base.tfl) / torqueMax) * 146;
        return (
          <g key={m.name} transform={`translate(${x},48)`}>
            <rect width={boxW} height="286" rx="16" fill={activeCard ? '#111827' : '#101015'} stroke={m.color} strokeWidth={activeCard ? 2.2 : 1.2} opacity={activeCard ? 1 : 0.8} />
            <text x={boxW / 2} y="28" textAnchor="middle" fill={m.color} fontSize="14" fontWeight="700">{m.name}</text>

            {/* Current bar */}
            <g transform="translate(26,58)">
              <rect width="66" height="142" rx="10" fill="#09090b" stroke="#27272a" />
              <rect x="14" y={142 - curH + 10} width="38" height={curH - 10} rx="8" fill={m.color} opacity="0.8" />
              {/* Current value on bar */}
              <text x="33" y={142 - curH + 26} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">{m.ratioI.toFixed(1)}x</text>
              <text x="33" y="162" textAnchor="middle" fill="#a1a1aa" fontSize="10">Istart</text>
              <text x="33" y="182" textAnchor="middle" fill="#c4b5fd" fontSize="11" fontWeight="700">{m.lineCurrent.toFixed(0)} A</text>
            </g>

            {/* Torque bar */}
            <g transform="translate(146,58)">
              <rect width="66" height="142" rx="10" fill="#09090b" stroke="#27272a" />
              <rect x="14" y={142 - torH + 10} width="38" height={torH - 10} rx="8" fill="#60a5fa" opacity="0.85" />
              {/* Torque value on bar */}
              <text x="33" y={142 - torH + 26} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">{m.ratioT.toFixed(2)}x</text>
              {/* Load torque line with label */}
              <line x1="8" y1={152 - loadH} x2="58" y2={152 - loadH} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth="2" />
              <text x="66" y={152 - loadH + 4} fill="#f59e0b" fontSize="7">Load</text>
              <text x="33" y="162" textAnchor="middle" fill="#a1a1aa" fontSize="10">Tstart</text>
              <text x="33" y="182" textAnchor="middle" fill="#c4b5fd" fontSize="11" fontWeight="700">{m.torque.toFixed(0)} N.m</text>
            </g>

            {/* Adequacy indicator */}
            {(() => {
              const adequate = m.torque >= data.loadTorque;
              return (
                <g>
                  <rect x="24" y="240" width={boxW - 48} height="18" rx="4" fill={adequate ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'} stroke={adequate ? '#22c55e' : '#ef4444'} strokeWidth="0.8" />
                  <text x={boxW / 2} y="253" textAnchor="middle" fill={adequate ? '#22c55e' : '#ef4444'} fontSize="9" fontWeight="700">
                    {adequate ? 'Adequate starting torque' : 'Insufficient starting torque'}
                  </text>
                </g>
              );
            })()}

            <text x="24" y="274" fill="#71717a" fontSize="10">{m.note}</text>
          </g>
        );
      })}

      <g transform="translate(726,18)">
        <rect width="208" height="66" rx="10" fill="#101015" stroke="#27272a" />
        <text x="14" y="22" fill="#a1a1aa" fontSize="11">Reference load torque = {data.loadTorque.toFixed(0)} N.m</text>
        <text x="14" y="40" fill="#a1a1aa" fontSize="11">Blue bars = torque, colored bars = current</text>
        <text x="14" y="58" fill="#c4b5fd" fontSize="11" fontFamily="monospace">Star-delta: Iline = Idol / 3</text>
      </g>

      {/* Comparison summary bar at bottom */}
      <g transform="translate(76,356)">
        <rect width={3 * boxW + 2 * gap} height="42" rx="8" fill="#101015" stroke="#27272a" />
        {data.methods.map((m, i) => (
          <g key={m.name} transform={`translate(${20 + i * 290}, 0)`}>
            <rect x="0" y="8" width={Math.max(10, (m.ratioI / currentMax) * 200)} height="10" rx="4" fill={m.color} opacity="0.7" />
            <text x="0" y="32" fill="#a1a1aa" fontSize="9">{m.name}: {m.ratioI.toFixed(1)}x current, {m.ratioT.toFixed(2)}x torque</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ============================================================
   Theory SVG Diagrams
   ============================================================ */

function DOLCircuitSVG() {
  return (
    <svg viewBox="0 0 780 170" style={S.svgDiagram}>
      <defs>
        <marker id="st-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0,0 8,3 0,6" fill="#ef4444" />
        </marker>
      </defs>
      <text x="390" y="20" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="600" letterSpacing="0.06em">DOL (DIRECT-ON-LINE) STARTING CIRCUIT</text>

      {/* 3-phase supply */}
      <g transform="translate(30,50)">
        {['R', 'Y', 'B'].map((ph, i) => (
          <g key={ph}>
            <line x1="0" y1={i * 28} x2="60" y2={i * 28} stroke={['#ef4444', '#f59e0b', '#3b82f6'][i]} strokeWidth="2" />
            <text x="-14" y={i * 28 + 5} fill={['#ef4444', '#f59e0b', '#3b82f6'][i]} fontSize="10" fontWeight="700">{ph}</text>
          </g>
        ))}
      </g>

      {/* Contactor */}
      <rect x="100" y="40" width="80" height="80" rx="8" fill="#18181b" stroke="#ef4444" strokeWidth="1.5" />
      <text x="140" y="75" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="700">Main</text>
      <text x="140" y="90" textAnchor="middle" fill="#ef4444" fontSize="10">Contactor</text>

      {/* Motor */}
      <g transform="translate(200,50)">
        {[0, 1, 2].map(i => (
          <line key={i} x1="0" y1={i * 28} x2="80" y2={i * 28} stroke="#d4d4d8" strokeWidth="2" />
        ))}
      </g>
      <circle cx="340" cy="78" r="40" fill="#18181b" stroke="#6366f1" strokeWidth="2" />
      <text x="340" y="74" textAnchor="middle" fill="#a5b4fc" fontSize="11" fontWeight="700">IM</text>
      <text x="340" y="90" textAnchor="middle" fill="#71717a" fontSize="9">3-phase</text>

      {/* Annotations */}
      <line x1="140" y1="130" x2="140" y2="148" stroke="#ef4444" strokeWidth="1" markerEnd="url(#st-arr)" />
      <text x="140" y="160" textAnchor="middle" fill="#ef4444" fontSize="9">Full voltage applied</text>

      {/* Key facts */}
      <rect x="440" y="40" width="310" height="80" rx="10" fill="#18181b" stroke="#27272a" />
      <text x="460" y="62" fill="#ef4444" fontSize="11" fontWeight="700">DOL Starting</text>
      <text x="460" y="80" fill="#a1a1aa" fontSize="10">Istart = 5-8 x Ifl (locked rotor)</text>
      <text x="460" y="96" fill="#a1a1aa" fontSize="10">Tstart = 1.5-2.5 x Tfl</text>
      <text x="460" y="112" fill="#71717a" fontSize="9">Simple, cheap, highest torque, highest current</text>
    </svg>
  );
}

function StarDeltaCircuitSVG() {
  return (
    <svg viewBox="0 0 780 190" style={S.svgDiagram}>
      <text x="390" y="20" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="600" letterSpacing="0.06em">STAR-DELTA STARTING CIRCUIT</text>

      {/* Star configuration */}
      <g transform="translate(40,50)">
        <rect x="0" y="0" width="140" height="100" rx="10" fill="#18181b" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="70" y="20" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="700">START: Star (Y)</text>
        {/* Star windings */}
        <line x1="30" y1="40" x2="70" y2="70" stroke="#ef4444" strokeWidth="2" />
        <line x1="110" y1="40" x2="70" y2="70" stroke="#3b82f6" strokeWidth="2" />
        <line x1="70" y1="70" x2="70" y2="92" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="70" cy="70" r="3" fill="#d4d4d8" />
        <text x="26" y="38" fill="#ef4444" fontSize="9">R</text>
        <text x="108" y="38" fill="#3b82f6" fontSize="9">B</text>
        <text x="78" y="90" fill="#f59e0b" fontSize="9">Y</text>
        <text x="70" y="84" textAnchor="middle" fill="#52525b" fontSize="8">neutral</text>
      </g>

      {/* Arrow */}
      <line x1="200" y1="100" x2="260" y2="100" stroke="#818cf8" strokeWidth="2" markerEnd="url(#st-arr)" />
      <text x="230" y="92" textAnchor="middle" fill="#818cf8" fontSize="9">Switch at</text>
      <text x="230" y="120" textAnchor="middle" fill="#818cf8" fontSize="9">~85% speed</text>

      {/* Delta configuration */}
      <g transform="translate(270,50)">
        <rect x="0" y="0" width="140" height="100" rx="10" fill="#18181b" stroke="#22c55e" strokeWidth="1.5" />
        <text x="70" y="20" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="700">RUN: Delta</text>
        {/* Delta windings */}
        <line x1="30" y1="44" x2="110" y2="44" stroke="#ef4444" strokeWidth="2" />
        <line x1="110" y1="44" x2="70" y2="88" stroke="#3b82f6" strokeWidth="2" />
        <line x1="70" y1="88" x2="30" y2="44" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="30" cy="44" r="3" fill="#d4d4d8" />
        <circle cx="110" cy="44" r="3" fill="#d4d4d8" />
        <circle cx="70" cy="88" r="3" fill="#d4d4d8" />
      </g>

      {/* Key facts */}
      <rect x="440" y="40" width="310" height="100" rx="10" fill="#18181b" stroke="#27272a" />
      <text x="460" y="62" fill="#f59e0b" fontSize="11" fontWeight="700">Star-Delta Starting</text>
      <text x="460" y="80" fill="#a1a1aa" fontSize="10">In star: Vphase = Vline / sqrt(3)</text>
      <text x="460" y="96" fill="#a1a1aa" fontSize="10">Iline(star) = Idol / 3</text>
      <text x="460" y="112" fill="#a1a1aa" fontSize="10">Tstart(star) = Tdol / 3</text>
      <text x="460" y="130" fill="#71717a" fontSize="9">Cheap, widely used for lightly loaded starts</text>

      <defs>
        <marker id="st-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0,0 8,3 0,6" fill="#818cf8" />
        </marker>
      </defs>
    </svg>
  );
}

function AutotransformerCircuitSVG() {
  return (
    <svg viewBox="0 0 780 180" style={S.svgDiagram}>
      <text x="390" y="20" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="600" letterSpacing="0.06em">AUTOTRANSFORMER STARTING CIRCUIT</text>

      {/* Supply */}
      <g transform="translate(30,55)">
        {['R', 'Y', 'B'].map((ph, i) => (
          <g key={ph}>
            <line x1="0" y1={i * 28} x2="40" y2={i * 28} stroke={['#ef4444', '#f59e0b', '#3b82f6'][i]} strokeWidth="2" />
            <text x="-14" y={i * 28 + 5} fill={['#ef4444', '#f59e0b', '#3b82f6'][i]} fontSize="10" fontWeight="700">{ph}</text>
          </g>
        ))}
      </g>

      {/* Autotransformer */}
      <rect x="80" y="40" width="120" height="100" rx="8" fill="#18181b" stroke="#22c55e" strokeWidth="1.5" />
      <text x="140" y="60" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="700">Auto-</text>
      <text x="140" y="76" textAnchor="middle" fill="#22c55e" fontSize="11" fontWeight="700">transformer</text>
      {/* Tap indication */}
      <line x1="100" y1="100" x2="160" y2="100" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="4 2" />
      <text x="140" y="96" textAnchor="middle" fill="#22c55e" fontSize="9">Tap k</text>
      <circle cx="130" cy="110" r="2" fill="#22c55e" />
      <text x="140" y="130" textAnchor="middle" fill="#71717a" fontSize="9">k = 50-80%</text>

      {/* Output to motor */}
      <g transform="translate(210,55)">
        {[0, 1, 2].map(i => (
          <line key={i} x1="0" y1={i * 28} x2="60" y2={i * 28} stroke="#d4d4d8" strokeWidth="2" />
        ))}
      </g>

      {/* Motor */}
      <circle cx="320" cy="83" r="36" fill="#18181b" stroke="#6366f1" strokeWidth="2" />
      <text x="320" y="80" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="700">IM</text>
      <text x="320" y="94" textAnchor="middle" fill="#71717a" fontSize="8">kV applied</text>

      {/* Key facts */}
      <rect x="440" y="40" width="310" height="100" rx="10" fill="#18181b" stroke="#27272a" />
      <text x="460" y="62" fill="#22c55e" fontSize="11" fontWeight="700">Autotransformer Starting</text>
      <text x="460" y="80" fill="#a1a1aa" fontSize="10">Motor voltage = k x Vline</text>
      <text x="460" y="96" fill="#a1a1aa" fontSize="10">Iline = k^2 x Idol</text>
      <text x="460" y="112" fill="#a1a1aa" fontSize="10">Tstart = k^2 x Tdol</text>
      <text x="460" y="130" fill="#71717a" fontSize="9">Best torque-per-ampere ratio of reduced-V methods</text>
    </svg>
  );
}

function ComparisonBarChartSVG() {
  const methods = [
    { name: 'DOL', iRatio: 6.2, tRatio: 1.85, colorI: '#ef4444', colorT: '#60a5fa' },
    { name: 'Star-Delta', iRatio: 6.2 / 3, tRatio: 1.85 / 3, colorI: '#f59e0b', colorT: '#60a5fa' },
    { name: 'Auto (65%)', iRatio: 6.2 * 0.65 * 0.65, tRatio: 1.85 * 0.65 * 0.65, colorI: '#22c55e', colorT: '#60a5fa' },
  ];
  const maxI = Math.max(...methods.map(m => m.iRatio));
  const maxT = Math.max(...methods.map(m => m.tRatio));

  return (
    <svg viewBox="0 0 780 260" style={S.svgDiagram}>
      <text x="390" y="20" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="600" letterSpacing="0.06em">
        STARTING CURRENT AND TORQUE COMPARISON (MULTIPLES OF FULL-LOAD)
      </text>

      {/* Current bars */}
      <text x="60" y="50" fill="#a1a1aa" fontSize="10" fontWeight="600">Starting Current (x Ifl)</text>
      {methods.map((m, i) => {
        const barW = (m.iRatio / maxI) * 350;
        const y = 62 + i * 32;
        return (
          <g key={`i-${m.name}`}>
            <text x="56" y={y + 14} textAnchor="end" fill="#a1a1aa" fontSize="10">{m.name}</text>
            <rect x="62" y={y} width={barW} height="20" rx="4" fill={m.colorI} opacity="0.8" />
            <text x={62 + barW + 6} y={y + 14} fill={m.colorI} fontSize="10" fontWeight="700">{m.iRatio.toFixed(1)}x</text>
          </g>
        );
      })}

      {/* Torque bars */}
      <text x="60" y="168" fill="#a1a1aa" fontSize="10" fontWeight="600">Starting Torque (x Tfl)</text>
      {methods.map((m, i) => {
        const barW = (m.tRatio / maxT) * 350;
        const y = 180 + i * 32;
        return (
          <g key={`t-${m.name}`}>
            <text x="56" y={y + 14} textAnchor="end" fill="#a1a1aa" fontSize="10">{m.name}</text>
            <rect x="62" y={y} width={barW} height="20" rx="4" fill={m.colorT} opacity="0.8" />
            <text x={62 + barW + 6} y={y + 14} fill={m.colorT} fontSize="10" fontWeight="700">{m.tRatio.toFixed(2)}x</text>
          </g>
        );
      })}

      {/* Key insight */}
      <rect x="500" y="60" width="250" height="60" rx="10" fill="#18181b" stroke="#27272a" />
      <text x="625" y="80" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontFamily="monospace">Istart prop. to V</text>
      <text x="625" y="96" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontFamily="monospace">Tstart prop. to V^2</text>
      <text x="625" y="112" textAnchor="middle" fill="#71717a" fontSize="9">Torque penalty is always worse than current reduction</text>
    </svg>
  );
}

export default function InductionMotorStarting() {
  const [tab, setTab] = useState('sim');
  const [method, setMethod] = useState('DOL');
  const [powerKW, setPowerKW] = useState(45);
  const [tap, setTap] = useState(0.65);

  const data = useMemo(() => compute(powerKW, tap), [powerKW, tap]);
  const selected = data.methods.find((m) => m.name === method);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'sim')} onClick={() => setTab('sim')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'sim' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram data={data} active={method} />
          </div>

          <div style={S.controls}>
            <div style={S.bg}>
              {METHODS.map((m) => (
                <button key={m} style={S.btn(method === m)} onClick={() => setMethod(m)}>{m}</button>
              ))}
            </div>
            <div style={S.cg}>
              <span style={S.label}>Motor rating</span>
              <input style={S.slider} type="range" min="15" max="150" step="5" value={powerKW} onChange={(e) => setPowerKW(Number(e.target.value))} />
              <span style={S.val}>{powerKW.toFixed(0)} kW</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Autotransformer tap</span>
              <input style={S.slider} type="range" min="0.5" max="0.8" step="0.01" value={tap} onChange={(e) => setTap(Number(e.target.value))} />
              <span style={S.val}>{(tap * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div style={S.results}>
            <div style={S.ri}><span style={S.rl}>Selected method</span><span style={S.rv}>{selected.name}</span></div>
            <div style={S.ri}><span style={S.rl}>Rated current</span><span style={S.rv}>{data.base.ifl.toFixed(1)} A</span></div>
            <div style={S.ri}><span style={S.rl}>Starting line current</span><span style={S.rv}>{selected.lineCurrent.toFixed(0)} A</span></div>
            <div style={S.ri}><span style={S.rl}>Current multiple</span><span style={S.rv}>{selected.ratioI.toFixed(1)} x FL</span></div>
            <div style={S.ri}><span style={S.rl}>Starting torque</span><span style={S.rv}>{selected.torque.toFixed(0)} N.m</span></div>
            <div style={S.ri}><span style={S.rl}>Torque multiple</span><span style={S.rv}>{selected.ratioT.toFixed(2)} x FL</span></div>
          </div>

          <div style={S.strip}>
            <div style={S.box}>
              <span style={S.boxT}>DOL</span>
              <span style={S.boxV}>Highest starting torque.{'\n'}Highest line current and voltage dip risk.</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Star-Delta</span>
              <span style={S.boxV}>Cheap and common for lightly loaded starts.{'\n'}Only suitable for motors intended to run in delta.</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Autotransformer</span>
              <span style={S.boxV}>Adjustable compromise between current and torque.{'\n'}Line current and torque both scale with k^2.</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={S.theory}>
          <h2 style={S.h2}>Starting Of Three-Phase Induction Motors</h2>
          <p style={S.p}>
            At standstill, the rotor frequency equals supply frequency because slip is unity. The induction motor therefore behaves like a transformer with a short-circuited secondary, drawing a large locked-rotor current. Starting methods are designed to limit that current while still providing enough accelerating torque for the mechanical load.
          </p>

          <span style={S.eq}>At start: s = 1</span>
          <span style={S.eq}>Istart proportional to Vstart, Tstart proportional to Vstart^2</span>

          <h2 style={S.h2}>Starting Method Circuits</h2>

          <h3 style={S.h3}>Direct-on-line (DOL)</h3>

          <DOLCircuitSVG />

          <span style={S.eq}>Star-delta: Iline = Idol / 3, Tstart = TdOL / 3</span>

          <h3 style={S.h3}>Star-Delta starting</h3>

          <StarDeltaCircuitSVG />

          <h3 style={S.h3}>Autotransformer starting</h3>

          <AutotransformerCircuitSVG />

          <span style={S.eq}>Autotransformer with tap k: Iline = k^2 IdOL, Tstart = k^2 TdOL</span>

          <h2 style={S.h2}>Current and Torque Comparison</h2>
          <p style={S.p}>
            The following bar chart compares starting current and starting torque for each method as multiples of full-load values. Notice that the torque penalty is always steeper than the current reduction because torque scales with V^2 while current scales with V.
          </p>

          <ComparisonBarChartSVG />

          <h2 style={S.h2}>Why Reduced-Voltage Starting Works</h2>
          <p style={S.p}>
            Locked-rotor current is roughly proportional to applied stator voltage. Electromagnetic torque is approximately proportional to the square of applied voltage, provided frequency remains constant.
            That means every current-reduction method has an unavoidable penalty in starting torque. The engineering problem is therefore not "how do I reduce current?" but "how much current can I reduce and still accelerate the load?"
          </p>

          <h2 style={S.h2}>Method Comparison</h2>
          <h3 style={S.h3}>Direct-on-line</h3>
          <p style={S.p}>
            DOL gives the highest starting torque and the fastest acceleration, but it also produces the highest current. It is acceptable when the supply is stiff and the motor rating is small enough that voltage dip is acceptable.
          </p>

          <h3 style={S.h3}>Star-delta</h3>
          <p style={S.p}>
            Starting in star reduces phase voltage to Vline / root(3), so line current becomes one-third of DOL and starting torque also becomes one-third of DOL. This is suitable when the load torque at zero speed is low.
          </p>

          <h3 style={S.h3}>Autotransformer</h3>
          <p style={S.p}>
            The autotransformer starter provides a tunable reduced-voltage start. Because the transformer also reduces the supply-side current, it gives better torque per ampere drawn from the line than star-delta starting.
          </p>

          <h2 style={S.h2}>How To Read The Simulation</h2>
          <ul style={S.ul}>
            <li style={S.li}>The colored bar shows starting line current as a multiple of full-load current.</li>
            <li style={S.li}>The blue bar shows starting torque as a multiple of full-load torque.</li>
            <li style={S.li}>The dashed horizontal line is a representative load-torque requirement. If the starting-torque bar falls below this line, the motor would accelerate poorly or fail to start.</li>
            <li style={S.li}>The adequacy indicator below each card shows whether that method provides sufficient starting torque for the load.</li>
            <li style={S.li}>Changing motor rating rescales the absolute current and torque values while preserving the standard starter relationships.</li>
          </ul>

          <h2 style={S.h2}>Practical Selection Logic</h2>
          <ul style={S.ul}>
            <li style={S.li}><strong style={{ color: '#ef4444' }}>DOL</strong> is preferred for small and medium motors when the supply can tolerate inrush current and the load needs strong breakaway torque.</li>
            <li style={S.li}><strong style={{ color: '#f59e0b' }}>Star-delta</strong> is suitable for fans, pumps, and other loads that do not require high torque at zero speed.</li>
            <li style={S.li}><strong style={{ color: '#22c55e' }}>Autotransformer starting</strong> is chosen when lower line current is needed but star-delta torque is insufficient.</li>
          </ul>

          <div style={S.ctx}>
            <span style={S.ctxT}>Assumptions Used Here</span>
            <p style={S.ctxP}>
              The simulation uses standard design-rule ratios for full-load current, locked-rotor current, and starting torque rather than a full equivalent-circuit solve for every motor rating. The comparison ratios between methods follow the classical induction-motor starting relations exactly.
            </p>
          </div>

          <h2 style={S.h2}>References</h2>
          <ul style={S.ul}>
            <li style={S.li}>Chapman, S.J. — <em>Electric Machinery Fundamentals</em>, starting behavior of induction motors</li>
            <li style={S.li}>Fitzgerald, Kingsley, Umans — <em>Electric Machinery</em></li>
            <li style={S.li}>P.S. Bimbhra — <em>Electrical Machinery</em></li>
            <li style={S.li}>B.L. Theraja and A.K. Theraja — <em>A Textbook of Electrical Technology, Vol. II</em></li>
          </ul>
        </div>
      )}
    </div>
  );
}
