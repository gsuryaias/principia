import React, { useState, useMemo } from 'react';

// ── Voltage colour palette ────────────────────────────────────────────────────
const VCOL = {
  400: '#3b82f6', 220: '#06b6d4', 132: '#8b5cf6',
  33: '#f59e0b', 11: '#f97316', 0.415: '#f43f5e',
};

// ── Stage definitions ─────────────────────────────────────────────────────────
const STAGES = [
  { id:'gen',  name:'Generating Station',   short:'Generator',       equip:'Thermal / Hydro / Solar',              vkv:11,    org:'NTPC / APGENCO',   lp:0,     icon:'gen'   },
  { id:'gsu',  name:'Step-Up Transformer',  short:'GSU (11→400 kV)', equip:'11/400 kV, 500 MVA',                   vkv:400,   org:'GENCO',            lp:0.005, icon:'xfmr'  },
  { id:'ehv',  name:'400 kV EHV Line',      short:'400 kV Line',     equip:'Quad ACSR Moose, 200 km',              vkv:400,   org:'PGCIL / AP Transco',lp:0.015, icon:'tower' },
  { id:'gss',  name:'400/220 kV Grid SS',   short:'Grid Substation', equip:'400/220 kV ICTs, 315 MVA',             vkv:220,   org:'AP Transco',       lp:0.003, icon:'sub'   },
  { id:'hvl',  name:'220 kV Line',          short:'220 kV Line',     equip:'Twin ACSR Moose, 100 km',              vkv:220,   org:'AP Transco',       lp:0.01,  icon:'tower' },
  { id:'sss',  name:'220/33 kV Substation', short:'220/33 kV SS',    equip:'220/33 kV, 100 MVA',                   vkv:33,    org:'AP Transco',       lp:0.005, icon:'sub'   },
  { id:'dss',  name:'33/11 kV Substation',  short:'33/11 kV SS',     equip:'33/11 kV, 10 MVA',                     vkv:11,    org:'DISCOM',           lp:0.008, icon:'sub'   },
  { id:'dtr',  name:'Dist. Transformer',    short:'DTR (11→415 V)',  equip:'11 kV / 415 V, 100–250 kVA',           vkv:0.415, org:'DISCOM',           lp:0.02,  icon:'xfmr'  },
  { id:'load', name:'Consumer Load',        short:'Consumer',        equip:'Residential / Commercial / Industrial', vkv:0.415, org:'End User',         lp:0,     icon:'house' },
];

function compute(genMW, pf) {
  let p = genMW, totalLoss = 0;
  const nodes = STAGES.map(s => {
    const loss = p * s.lp;
    p -= loss; totalLoss += loss;
    const amp = s.vkv > 1
      ? (p * 1e3) / (Math.sqrt(3) * s.vkv * pf)
      : (p * 1e3) / (Math.sqrt(3) * s.vkv);
    return { ...s, mw: p, loss, amp };
  });
  return { genMW, delivered: p, totalLoss, eff: (p / genMW) * 100, nodes };
}

// ── SVG Icons (centered at 0,0) ───────────────────────────────────────────────
function Icon({ type, col }) {
  if (type === 'gen') return (
    <g>
      <circle r="14" fill="none" stroke={col} strokeWidth="1.8"/>
      <path d="M-4,-8 L0,0 L-3,0 L3,8 L-1,8 L4,0 L1,0 Z" fill={col} opacity="0.9"/>
    </g>
  );
  if (type === 'xfmr') return (
    <g>
      <circle cx="-7" cy="2" r="9" fill="none" stroke={col} strokeWidth="1.8"/>
      <circle cx="7"  cy="2" r="9" fill="none" stroke={col} strokeWidth="1.8"/>
      <line x1="-7" y1="-7" x2="-7" y2="-14" stroke={col} strokeWidth="1.5"/>
      <line x1="7"  y1="-7" x2="7"  y2="-14" stroke={col} strokeWidth="1.5"/>
      <line x1="-13" y1="-14" x2="13" y2="-14" stroke={col} strokeWidth="1.8"/>
    </g>
  );
  if (type === 'tower') return (
    <g>
      <line x1="0" y1="-16" x2="-11" y2="13" stroke={col} strokeWidth="1.5"/>
      <line x1="0" y1="-16" x2="11"  y2="13" stroke={col} strokeWidth="1.5"/>
      <line x1="-3" y1="-2" x2="3" y2="-2" stroke={col} strokeWidth="1" opacity="0.7"/>
      <line x1="-7" y1="5"  x2="7" y2="5"  stroke={col} strokeWidth="1" opacity="0.7"/>
      <line x1="-14" y1="-8" x2="14" y2="-8" stroke={col} strokeWidth="2"/>
      <line x1="-11" y1="13" x2="11" y2="13" stroke={col} strokeWidth="1.5"/>
      <circle cx="-14" cy="-11" r="2" fill={col}/>
      <circle cx="0"   cy="-11" r="2" fill={col}/>
      <circle cx="14"  cy="-11" r="2" fill={col}/>
    </g>
  );
  if (type === 'sub') return (
    <g>
      <rect x="-13" y="-7" width="26" height="19" rx="2" fill="none" stroke={col} strokeWidth="1.8"/>
      <line x1="-9" y1="-12" x2="9" y2="-12" stroke={col} strokeWidth="2.5"/>
      <line x1="-6" y1="-12" x2="-6" y2="-7" stroke={col} strokeWidth="1.5"/>
      <line x1="0"  y1="-12" x2="0"  y2="-7" stroke={col} strokeWidth="1.5"/>
      <line x1="6"  y1="-12" x2="6"  y2="-7" stroke={col} strokeWidth="1.5"/>
      <rect x="-9" y="-2" width="7" height="10" rx="1" fill="none" stroke={col} strokeWidth="1" opacity="0.7"/>
      <rect x="2"  y="-2" width="7" height="10" rx="1" fill="none" stroke={col} strokeWidth="1" opacity="0.7"/>
    </g>
  );
  if (type === 'house') return (
    <g>
      <polygon points="0,-16 -13,-3 13,-3" fill="none" stroke={col} strokeWidth="1.8"/>
      <rect x="-11" y="-3" width="22" height="17" fill="none" stroke={col} strokeWidth="1.8"/>
      <rect x="-4" y="5" width="8" height="9" fill="none" stroke={col} strokeWidth="1.2"/>
      <rect x="4"  y="-1" width="5" height="5" fill="none" stroke={col} strokeWidth="1"/>
    </g>
  );
  return null;
}

// ── Layout constants ──────────────────────────────────────────────────────────
const N = 9;
const VB_W = 1400, VB_H = 310;
const CY = 140;
const NW = 110, NH = 100;
const CX = Array.from({ length: N }, (_, i) => 70 + i * ((VB_W - 130) / (N - 1)));

// ── Diagram ───────────────────────────────────────────────────────────────────
function Diagram({ sys, hover, onHover }) {
  const maxMW = sys.genMW;
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: '100%', maxWidth: VB_W, height: 'auto' }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="lossglow">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Wires between nodes ─────────────────────────────────────────────── */}
      {CX.slice(0, -1).map((x, i) => {
        const x2   = CX[i + 1];
        const srcNode = sys.nodes[i];
        const dstNode = sys.nodes[i + 1];
        const col  = VCOL[dstNode.vkv] || '#6366f1';
        const wireW = 2 + (srcNode.mw / maxMW) * 11; // thicker = more power
        const x1c  = x + NW / 2 + 4;
        const x2c  = x2 - NW / 2 - 4;
        const isLong = dstNode.id === 'ehv' || dstNode.id === 'hvl';
        const partDur = isLong ? 1.8 : 1.1;
        const vLabel = dstNode.vkv >= 1 ? `${dstNode.vkv} kV` : `${(dstNode.vkv * 1000).toFixed(0)} V`;

        return (
          <g key={`wire-${i}`}>
            {/* Thick wire (background) */}
            <line x1={x1c} y1={CY} x2={x2c} y2={CY}
              stroke={col} strokeWidth={wireW} opacity={0.18} strokeLinecap="round"/>
            {/* Dashed animated overlay */}
            <line x1={x1c} y1={CY} x2={x2c} y2={CY}
              stroke={col} strokeWidth={1.2} opacity={0.45} strokeDasharray="7 5">
              <animate attributeName="stroke-dashoffset" from="0" to="-24"
                dur={`${partDur * 0.55}s`} repeatCount="indefinite"/>
            </line>
            {/* Flow particles */}
            {[0, 1, 2, 3].map(pi => (
              <circle key={pi} r={wireW > 9 ? 4.5 : 3.5} fill={col} filter="url(#glow)">
                <animateMotion
                  dur={`${partDur}s`}
                  begin={`${(pi * partDur) / 4}s`}
                  repeatCount="indefinite"
                  path={`M${x1c},${CY} L${x2c},${CY}`}
                />
              </circle>
            ))}
            {/* Voltage badge on wire */}
            <text x={(x1c + x2c) / 2} y={CY - wireW / 2 - 6}
              textAnchor="middle" fill={col} fontSize="10" fontWeight="700" opacity="0.85">
              {vLabel}
            </text>
          </g>
        );
      })}

      {/* ── Loss particles (drip downward from lossy nodes) ─────────────────── */}
      {sys.nodes.map((n, i) => {
        if (n.loss <= 0) return null;
        const x = CX[i];
        const numDrops = Math.min(5, Math.max(2, Math.round((n.lp / 0.02) * 4)));
        return Array.from({ length: numDrops }, (_, di) => {
          const ox = (di - (numDrops - 1) / 2) * 7;
          const ddur = 1.3 + di * 0.25;
          return (
            <g key={`drop-${i}-${di}`}>
              <circle r="2.5" fill="#ef4444" opacity="0" filter="url(#lossglow)">
                <animateMotion
                  dur={`${ddur}s`} begin={`${di * 0.3}s`} repeatCount="indefinite"
                  path={`M${x + ox},${CY + NH / 2} L${x + ox},${CY + NH / 2 + 55}`}
                />
                <animate attributeName="opacity" values="0;0.85;0"
                  dur={`${ddur}s`} begin={`${di * 0.3}s`} repeatCount="indefinite"/>
              </circle>
            </g>
          );
        });
      })}

      {/* ── Nodes ───────────────────────────────────────────────────────────── */}
      {sys.nodes.map((n, i) => {
        const x   = CX[i];
        const col = VCOL[n.vkv] || '#71717a';
        const isHov = hover === i;
        return (
          <g key={n.id} style={{ cursor: 'pointer' }}>
            {/* Outer glow ring on hover */}
            <rect x={x - NW / 2 - 5} y={CY - NH / 2 - 5}
              width={NW + 10} height={NH + 10} rx={14}
              fill="none" stroke={col} strokeWidth="1.5"
              opacity={isHov ? 0.4 : 0}
              style={{ transition: 'opacity 0.15s' }}/>
            {/* Card background */}
            <rect x={x - NW / 2} y={CY - NH / 2}
              width={NW} height={NH} rx={10}
              fill={isHov ? `${col}18` : 'rgba(18,18,22,0.97)'}
              stroke={col} strokeWidth={isHov ? 2 : 1.2}
              strokeOpacity={isHov ? 1 : 0.55}
              style={{ transition: 'fill 0.15s, stroke-width 0.15s' }}/>
            {/* Icon — pointer-events off so hit-rect below is sole trigger */}
            <g transform={`translate(${x}, ${CY - 14})`} pointerEvents="none">
              <Icon type={n.icon} col={col}/>
            </g>
            {/* Voltage label */}
            <text x={x} y={CY + 30} textAnchor="middle" fill={col} fontSize="11" fontWeight="700" pointerEvents="none">
              {n.vkv >= 1 ? `${n.vkv} kV` : `${(n.vkv * 1000).toFixed(0)} V`}
            </text>
            {/* MW label */}
            <text x={x} y={CY + 44} textAnchor="middle" fill="#52525b" fontSize="9" pointerEvents="none">
              {n.mw.toFixed(0)} MW
            </text>
            {/* Loss indicator below box */}
            {n.loss > 0 && (
              <text x={x} y={CY + NH / 2 + 16} textAnchor="middle" fill="#ef4444" fontSize="9" opacity="0.85" pointerEvents="none">
                −{n.loss.toFixed(1)} MW
              </text>
            )}
            {/* Transparent hit-area rect — always same size, always on top, sole hover target */}
            <rect
              x={x - NW / 2} y={CY - NH / 2} width={NW} height={NH} rx={10}
              fill="transparent"
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
            />
          </g>
        );
      })}

      {/* ── Short name labels at bottom ──────────────────────────────────────── */}
      {sys.nodes.map((n, i) => (
        <text key={`lbl-${i}`} x={CX[i]} y={VB_H - 6}
          textAnchor="middle" fill="#3f3f46" fontSize="8.5" fontWeight="500">
          {n.short}
        </text>
      ))}

      {/* ── Source / Consumer badges ─────────────────────────────────────────── */}
      <text x={CX[0]} y={CY - NH / 2 - 12} textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700">SOURCE</text>
      <text x={CX[8]} y={CY - NH / 2 - 12} textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="700">CONSUMER</text>

      {/* System efficiency indicator */}
      <g transform={`translate(${VB_W / 2 - 105}, ${VB_H - 28})`}>
        <rect width={210} height={18} rx={4}
          fill={sys.eff > 95 ? '#22c55e10' : sys.eff > 90 ? '#f59e0b10' : '#ef444410'}
          stroke={sys.eff > 95 ? '#22c55e' : sys.eff > 90 ? '#f59e0b' : '#ef4444'} strokeWidth={0.5} />
        <text x={105} y={13} textAnchor="middle" fontSize={9}
          fill={sys.eff > 95 ? '#86efac' : sys.eff > 90 ? '#fcd34d' : '#fca5a5'} fontWeight={600}>
          {sys.eff > 95 ? 'NORMAL' : sys.eff > 90 ? 'ELEVATED LOSSES' : 'HIGH LOSSES'} | Eff: {sys.eff.toFixed(1)}% | Loss: {sys.totalLoss.toFixed(1)} MW
        </text>
      </g>
    </svg>
  );
}

// ── Hover Tooltip ─────────────────────────────────────────────────────────────
function Tooltip({ node }) {
  // Fixed height wrapper prevents layout shift (which causes SVG to move → mouseLeave fires → flicker)
  const wrapStyle = { minHeight: 72, borderTop: '1px solid #1a1a1f', background: '#0d0d10', display: 'flex', alignItems: 'center' };
  if (!node) {
    return (
      <div style={{ ...wrapStyle, justifyContent: 'center' }}>
        <span style={{ color: '#3f3f46', fontSize: 12, letterSpacing: '0.02em' }}>Hover over any component to see details</span>
      </div>
    );
  }
  const col = VCOL[node.vkv] || '#71717a';
  const ampStr = node.amp >= 1000
    ? `${(node.amp / 1000).toFixed(2)} kA`
    : `${node.amp.toFixed(0)} A`;
  return (
    <div style={{ ...wrapStyle, flexWrap: 'wrap', alignItems: 'stretch' }}>
      <div style={{ padding: '12px 20px', borderRight: '1px solid #1a1a1f', minWidth: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f4f4f5', marginBottom: 3 }}>{node.name}</div>
        <div style={{ fontSize: 12, color: '#52525b', marginBottom: 2 }}>{node.equip}</div>
        <div style={{ fontSize: 11, color: '#3f3f46' }}>{node.org}</div>
      </div>
      {[
        ['Voltage', node.vkv >= 1 ? `${node.vkv} kV` : `${(node.vkv * 1000).toFixed(0)} V`, col],
        ['Power Flow', `${node.mw.toFixed(1)} MW`, '#22c55e'],
        ['Line Current', ampStr, '#818cf8'],
        ['Stage Loss', node.loss > 0 ? `${node.loss.toFixed(2)} MW  (${(node.lp * 100).toFixed(1)}%)` : 'No loss', node.loss > 0 ? '#ef4444' : '#22c55e'],
      ].map(([label, val, c]) => (
        <div key={label} style={{ padding: '12px 20px', borderRight: '1px solid #1a1a1f', display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center' }}>
          <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: c }}>{val}</span>
        </div>
      ))}
    </div>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ sys }) {
  const items = [
    { label: 'Generated',       value: `${sys.genMW} MW`,                                                                           color: '#22c55e' },
    { label: 'Delivered',       value: `${sys.delivered.toFixed(1)} MW`,                                                            color: '#3b82f6' },
    { label: 'Total Losses',    value: `${sys.totalLoss.toFixed(1)} MW  (${((sys.totalLoss / sys.genMW) * 100).toFixed(1)}%)`,      color: '#ef4444' },
    { label: 'System Efficiency', value: `${sys.eff.toFixed(1)}%`,                                                                  color: '#f59e0b' },
  ];
  return (
    <div style={{ display: 'flex', borderTop: '1px solid #1a1a1f', background: '#0c0c0f' }}>
      {items.map(({ label, value, color }, i) => (
        <div key={label} style={{
          flex: 1, padding: '12px 18px',
          borderRight: i < items.length - 1 ? '1px solid #1a1a1f' : 'none',
          display: 'flex', flexDirection: 'column', gap: 3,
        }}>
          <span style={{ fontSize: 10, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Loss Breakdown Chart ──────────────────────────────────────────────────────
function LossBreakdown({ sys }) {
  const lossy  = sys.nodes.filter(n => n.loss > 0);
  const maxLoss = Math.max(...lossy.map(n => n.loss));
  return (
    <div style={{ padding: '14px 24px', borderTop: '1px solid #1a1a1f', background: '#0a0a0e' }}>
      <div style={{ fontSize: 10, color: '#3f3f46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        Loss Breakdown by Stage
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {lossy.map(n => {
          const col  = VCOL[n.vkv] || '#71717a';
          const barW = (n.loss / maxLoss) * 100;
          const pct  = (n.loss / sys.genMW) * 100;
          return (
            <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 108, fontSize: 11, color: '#71717a', textAlign: 'right', flexShrink: 0 }}>{n.short}</div>
              <div style={{ flex: 1, height: 10, background: '#18181b', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  width: `${barW}%`, height: '100%',
                  background: `linear-gradient(90deg, ${col}99, ${col})`,
                  borderRadius: 6, transition: 'width 0.35s ease',
                }}/>
              </div>
              <div style={{ width: 105, fontSize: 11, fontFamily: 'monospace', color: '#ef4444', flexShrink: 0 }}>
                {n.loss.toFixed(1)} MW ({pct.toFixed(1)}%)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Controls ──────────────────────────────────────────────────────────────────
function Controls({ genMW, setGenMW, pf, setPf }) {
  return (
    <div style={{ padding: '14px 24px', background: '#111114', borderTop: '1px solid #1a1a1f', display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13, color: '#a1a1aa', fontWeight: 500 }}>Generation (MW)</span>
        <input type="range" min={100} max={1000} step={10} value={genMW}
          onChange={e => setGenMW(+e.target.value)}
          style={{ width: 130, accentColor: '#6366f1', cursor: 'pointer' }}/>
        <span style={{ fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 52, textAlign: 'right' }}>{genMW}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13, color: '#a1a1aa', fontWeight: 500 }}>Power Factor</span>
        <input type="range" min={70} max={100} value={Math.round(pf * 100)}
          onChange={e => setPf(+e.target.value / 100)}
          style={{ width: 130, accentColor: '#6366f1', cursor: 'pointer' }}/>
        <span style={{ fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 52, textAlign: 'right' }}>{pf.toFixed(2)}</span>
      </div>
      <span style={{ fontSize: 12, color: '#3f3f46', marginLeft: 'auto' }}>Hover any component for details</span>
    </div>
  );
}

// ── Theory Tab ────────────────────────────────────────────────────────────────
const T = {
  wrap:  { flex: 1, padding: '32px 24px', maxWidth: 820, margin: '0 auto', overflowY: 'auto', width: '100%' },
  h2:    { fontSize: 22, fontWeight: 700, color: '#f4f4f5', margin: '36px 0 14px', paddingBottom: 8, borderBottom: '1px solid #27272a' },
  h3:    { fontSize: 17, fontWeight: 600, color: '#e4e4e7', margin: '24px 0 10px' },
  p:     { fontSize: 15, lineHeight: 1.8, color: '#a1a1aa', margin: '0 0 14px' },
  eq:    { display: 'block', padding: '14px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontFamily: 'monospace', fontSize: 15, color: '#c4b5fd', margin: '16px 0', textAlign: 'center', overflowX: 'auto' },
  ctx:   { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT:  { fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14, display: 'block' },
  ctxP:  { fontSize: 14, lineHeight: 1.7, color: '#a1a1aa', margin: 0 },
  tbl:   { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: 13 },
  th:    { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #3f3f46', color: '#d4d4d8', fontWeight: 600 },
  td:    { padding: '10px 12px', borderBottom: '1px solid #27272a', color: '#a1a1aa' },
  ul:    { paddingLeft: 20, margin: '10px 0' },
  li:    { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
};

function Theory() {
  return (
    <div style={T.wrap}>
      <h2 style={{ ...T.h2, marginTop: 0 }}>Indian Power System — Generation to Consumer</h2>
      <p style={T.p}>
        The Indian power grid is one of the world's largest synchronous grids, operating as a single
        interconnected system across five regions. With an installed capacity exceeding{' '}
        <strong style={{ color: '#e4e4e7' }}>425 GW</strong>, it serves over 300 million consumers
        through a cascading voltage hierarchy designed to minimise transmission losses.
      </p>

      {/* ── SVG: Complete Power System Overview ── */}
      <svg viewBox="0 0 740 260" style={{ width: '100%', maxWidth: 740, height: 'auto', margin: '16px auto', display: 'block' }}>
        <rect width="740" height="260" rx="12" fill="#18181b" stroke="#27272a" strokeWidth="1" />
        <text x="370" y="22" textAnchor="middle" fontSize="12" fill="#e4e4e7" fontWeight="700">Power System: Generation to Consumer</text>

        {/* Generation */}
        <circle cx="70" cy="100" r="28" fill="#09090b" stroke="#22c55e" strokeWidth="2" />
        <text x="70" y="96" textAnchor="middle" fontSize="10" fill="#22c55e" fontWeight="700">GEN</text>
        <text x="70" y="108" textAnchor="middle" fontSize="8" fill="#71717a">11 kV</text>
        <text x="70" y="140" textAnchor="middle" fontSize="8" fill="#52525b">Power Station</text>

        {/* GSU Transformer */}
        <line x1="98" y1="100" x2="130" y2="100" stroke="#22c55e" strokeWidth="2" />
        <circle cx="143" cy="100" r="12" fill="#09090b" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="157" cy="100" r="12" fill="#09090b" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="150" y="124" textAnchor="middle" fontSize="7" fill="#71717a">Step-Up TX</text>
        <text x="150" y="76" textAnchor="middle" fontSize="8" fill="#f59e0b" fontWeight="600">11 → 400 kV</text>

        {/* EHV Transmission */}
        <line x1="169" y1="100" x2="280" y2="100" stroke="#3b82f6" strokeWidth="3" />
        {[0,1,2].map(i => (
          <circle key={i} r="3" fill="#3b82f6" opacity="0.6">
            <animateMotion dur="2s" begin={`${i*0.7}s`} repeatCount="indefinite" path="M169,100 L280,100" />
          </circle>
        ))}
        <text x="224" y="88" textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="600">400 kV EHV</text>
        {/* Tower icons */}
        {[200, 250].map(x => (
          <g key={x}>
            <line x1={x} y1="100" x2={x-4} y2="115" stroke="#3f3f46" strokeWidth="0.8" />
            <line x1={x} y1="100" x2={x+4} y2="115" stroke="#3f3f46" strokeWidth="0.8" />
            <line x1={x-6} y1="95" x2={x+6} y2="95" stroke="#3f3f46" strokeWidth="1.2" />
          </g>
        ))}

        {/* Grid Substation */}
        <rect x="280" y="82" width="50" height="36" rx="6" fill="#09090b" stroke="#06b6d4" strokeWidth="1.5" />
        <text x="305" y="98" textAnchor="middle" fontSize="8" fill="#06b6d4" fontWeight="600">400/220</text>
        <text x="305" y="110" textAnchor="middle" fontSize="7" fill="#71717a">Grid SS</text>

        {/* 220 kV line */}
        <line x1="330" y1="100" x2="410" y2="100" stroke="#8b5cf6" strokeWidth="2.5" />
        <text x="370" y="88" textAnchor="middle" fontSize="9" fill="#8b5cf6" fontWeight="600">220 kV</text>

        {/* Sub-Transmission SS */}
        <rect x="410" y="82" width="50" height="36" rx="6" fill="#09090b" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="435" y="98" textAnchor="middle" fontSize="8" fill="#f59e0b" fontWeight="600">220/33</text>
        <text x="435" y="110" textAnchor="middle" fontSize="7" fill="#71717a">Sub-TX SS</text>

        {/* 33 kV line */}
        <line x1="460" y1="100" x2="520" y2="100" stroke="#f59e0b" strokeWidth="2" />
        <text x="490" y="88" textAnchor="middle" fontSize="9" fill="#f59e0b" fontWeight="600">33 kV</text>

        {/* Distribution SS */}
        <rect x="520" y="82" width="50" height="36" rx="6" fill="#09090b" stroke="#f97316" strokeWidth="1.5" />
        <text x="545" y="98" textAnchor="middle" fontSize="8" fill="#f97316" fontWeight="600">33/11</text>
        <text x="545" y="110" textAnchor="middle" fontSize="7" fill="#71717a">Dist SS</text>

        {/* 11 kV line */}
        <line x1="570" y1="100" x2="610" y2="100" stroke="#f97316" strokeWidth="1.5" />

        {/* DTR */}
        <circle cx="620" cy="100" r="9" fill="#09090b" stroke="#f43f5e" strokeWidth="1.2" />
        <circle cx="630" cy="100" r="9" fill="#09090b" stroke="#f43f5e" strokeWidth="1.2" />
        <text x="625" y="120" textAnchor="middle" fontSize="7" fill="#71717a">DTR</text>

        {/* Consumer */}
        <line x1="639" y1="100" x2="670" y2="100" stroke="#f43f5e" strokeWidth="1.2" />
        <polygon points="670,80 700,100 670,120" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
        <text x="680" y="104" textAnchor="middle" fontSize="8" fill="#f43f5e" fontWeight="600">415V</text>
        <text x="685" y="135" textAnchor="middle" fontSize="7" fill="#71717a">Consumer</text>

        {/* Voltage stepping diagram */}
        <text x="370" y="165" textAnchor="middle" fontSize="10" fill="#e4e4e7" fontWeight="600">Voltage Level Cascade</text>
        {[{v:'11 kV', x:70, c:'#22c55e', h:12}, {v:'400 kV', x:160, c:'#3b82f6', h:65}, {v:'220 kV', x:280, c:'#8b5cf6', h:45}, {v:'33 kV', x:400, c:'#f59e0b', h:20}, {v:'11 kV', x:510, c:'#f97316', h:12}, {v:'415 V', x:620, c:'#f43f5e', h:3}].map(d => (
          <g key={d.x}>
            <rect x={d.x-25} y={240-d.h} width="50" height={d.h} rx="2" fill={d.c} opacity="0.4" />
            <text x={d.x} y={235-d.h} textAnchor="middle" fontSize="8" fill={d.c} fontWeight="600">{d.v}</text>
          </g>
        ))}
        <line x1="40" y1="240" x2="660" y2="240" stroke="#3f3f46" strokeWidth="0.5" />
        <text x="70" y="253" textAnchor="middle" fontSize="7" fill="#52525b">Gen</text>
        <text x="220" y="253" textAnchor="middle" fontSize="7" fill="#52525b">Transmission</text>
        <text x="450" y="253" textAnchor="middle" fontSize="7" fill="#52525b">Sub-TX</text>
        <text x="570" y="253" textAnchor="middle" fontSize="7" fill="#52525b">Distribution</text>
      </svg>

      <h3 style={T.h3}>Why Step Up Voltage for Transmission?</h3>
      <p style={T.p}>
        Electrical power equals voltage times current (P = V × I). For a given power level,
        raising the voltage proportionally reduces the current. Since transmission losses scale
        with the square of current, higher voltage dramatically cuts losses:
      </p>
      <div style={T.eq}>P_loss = I² × R = (P / V)² × R = P² × R / V²</div>
      <p style={T.p}>
        Doubling the transmission voltage reduces losses to{' '}
        <strong style={{ color: '#e4e4e7' }}>one-quarter</strong>. This is why generators
        producing at 11–25 kV are stepped up to 400 kV (or 765 kV) for long-distance transmission.
      </p>

      <h3 style={T.h3}>Voltage Cascade in the Indian Grid</h3>
      <table style={T.tbl}>
        <thead>
          <tr>
            <th style={T.th}>Tier</th>
            <th style={T.th}>Voltage</th>
            <th style={T.th}>Operated By</th>
            <th style={T.th}>Typical Losses</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['EHV Transmission',      '765 / 400 kV', 'PGCIL (Inter-state)',          '~1.5–3%'],
            ['HV Transmission',       '220 / 132 kV', 'State Transco (AP Transco)',   '~1–2%'],
            ['Sub-Transmission',      '33 kV',        'Transco / DISCOM',             '~0.5–1%'],
            ['Primary Distribution',  '11 kV',        'DISCOM (APSPDCL/APEPDCL)',    '~2–4%'],
            ['Secondary Distribution','415 / 240 V',  'DISCOM',                       '~3–6%'],
          ].map(([tier, v, op, loss]) => (
            <tr key={tier}>
              <td style={T.td}>{tier}</td>
              <td style={{ ...T.td, color: '#e4e4e7', fontWeight: 600 }}>{v}</td>
              <td style={T.td}>{op}</td>
              <td style={T.td}>{loss}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={T.ctx}>
        <span style={T.ctxT}>Real-World Context — AP Transco</span>
        <p style={T.ctxP}>
          Andhra Pradesh Transmission Corporation (AP Transco) operates the state's 400 kV and 220 kV
          transmission network. As of 2024, AP Transco manages ~39,000+ circuit-km of transmission
          lines and 800+ substations. The state's two distribution companies — APSPDCL (Southern)
          and APEPDCL (Eastern) — handle 33 kV and below.
        </p>
      </div>

      <h3 style={T.h3}>Key Organisations</h3>
      <ul style={T.ul}>
        <li style={T.li}><strong style={{ color: '#e4e4e7' }}>NTPC / APGENCO</strong> — Generation (thermal, hydro). Produce power at 11–25 kV.</li>
        <li style={T.li}><strong style={{ color: '#e4e4e7' }}>PGCIL (PowerGrid)</strong> — Inter-state transmission at 400/765 kV. Operates the National Grid.</li>
        <li style={T.li}><strong style={{ color: '#e4e4e7' }}>AP Transco</strong> — Intra-state transmission at 400/220/132 kV within Andhra Pradesh.</li>
        <li style={T.li}><strong style={{ color: '#e4e4e7' }}>APSPDCL / APEPDCL</strong> — Distribution companies handling 33/11 kV and LT supply to consumers.</li>
        <li style={T.li}><strong style={{ color: '#e4e4e7' }}>APERC</strong> — Andhra Pradesh Electricity Regulatory Commission. Sets tariffs and standards.</li>
      </ul>

      <h3 style={T.h3}>AT&amp;C Losses — The Bigger Picture</h3>
      <p style={T.p}>
        Aggregate Technical &amp; Commercial (AT&amp;C) losses in India average ~17–20%, compared to
        6–8% in developed countries. These include technical losses (I²R heating) and commercial
        losses (theft, metering errors, billing inefficiency).
      </p>
      <div style={T.eq}>AT&amp;C Loss = 1 − (Revenue Collected ÷ Energy Input) × 100%</div>

      <h3 style={T.h3}>Key Equations</h3>
      <div style={T.eq}>P = √3 × V_L × I_L × cos(φ)</div>
      <div style={T.eq}>I = P / (√3 × V × cos(φ))</div>
      <div style={T.eq}>P_loss = 3 × I² × R = P² × R / (V² × cos²(φ))</div>
      <div style={T.eq}>V₁ / V₂ = N₁ / N₂  (turns ratio)</div>

      <div style={T.ctx}>
        <span style={T.ctxT}>Simulation Assumptions</span>
        <p style={T.ctxP}>
          Loss percentages are simplified averages. In practice, line losses depend on conductor
          resistance (Ω/km), line length, and actual current loading. Transformer losses include
          fixed iron/core losses and variable copper losses. Values are based on typical Indian
          grid benchmarks from CEA annual reports.
        </p>
      </div>

      <h3 style={T.h3}>References</h3>
      <ul style={T.ul}>
        <li style={T.li}>Central Electricity Authority (CEA) — Annual General Review</li>
        <li style={T.li}>Indian Electricity Grid Code (IEGC), 2023</li>
        <li style={T.li}>AP Transco — Annual Performance Report</li>
        <li style={T.li}>National Electricity Plan — Ministry of Power, GoI</li>
      </ul>
    </div>
  );
}

// ── Root Component ────────────────────────────────────────────────────────────
export default function PowerGridOverview() {
  const [tab,    setTab]    = useState('simulate');
  const [genMW,  setGenMW]  = useState(500);
  const [pf,     setPf]     = useState(0.85);
  const [hover,  setHover]  = useState(null);

  const sys = useMemo(() => compute(genMW, pf), [genMW, pf]);

  const tabBtn = (id, label) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: '8px 20px', borderRadius: 10, border: 'none',
        background: tab === id ? '#6366f1' : 'transparent',
        color: tab === id ? '#fff' : '#71717a',
        fontSize: 14, fontWeight: 500, cursor: 'pointer',
      }}>
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1a1a1f' }}>
        {tabBtn('simulate', 'Simulate')}
        {tabBtn('theory', 'Theory')}
      </div>

      {tab === 'simulate' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* SVG Diagram */}
          <div style={{ flex: 1, padding: '16px 12px 8px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
            <Diagram sys={sys} hover={hover} onHover={setHover}/>
          </div>
          {/* Inline tooltip */}
          <Tooltip node={hover !== null ? sys.nodes[hover] : null}/>
          {/* Stats */}
          <StatsBar sys={sys}/>
          {/* Loss bars */}
          <LossBreakdown sys={sys}/>
          {/* Sliders */}
          <Controls genMW={genMW} setGenMW={setGenMW} pf={pf} setPf={setPf}/>
        </div>
      ) : (
        <Theory/>
      )}
    </div>
  );
}
