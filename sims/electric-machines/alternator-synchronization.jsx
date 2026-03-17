import React, { useState, useEffect, useRef, useMemo } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 130, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 58, textAlign: 'right' },
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
  eq: { display: 'block', padding: '14px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontFamily: 'monospace', fontSize: 15, color: '#c4b5fd', margin: '16px 0', textAlign: 'center' },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14, display: 'block' },
  ctxP: { fontSize: 14, lineHeight: 1.7, color: '#a1a1aa', margin: 0 },
};

function seqButton(active) {
  return {
    padding: '6px 12px',
    borderRadius: 8,
    border: active ? '1px solid #22c55e' : '1px solid #27272a',
    background: active ? 'rgba(34,197,94,0.12)' : 'transparent',
    color: active ? '#22c55e' : '#a1a1aa',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    minWidth: 98,
  };
}

// Sine wave SVG helper
function SineWave({ phase, color, freq, label, voltPu }) {
  const W = 200, H = 70;
  const amp = 24 * voltPu;
  const pts = [];
  for (let x = 0; x <= W; x += 2) {
    const t = (x / W) * 2 * Math.PI * 2;
    const y = H / 2 - amp * Math.sin(t + phase);
    pts.push(`${x},${y.toFixed(2)}`);
  }
  const d = 'M ' + pts.join(' L ');
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#27272a" strokeWidth={1} />
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <text x={4} y={12} fill={color} fontSize={10} fontFamily="monospace">{label}</text>
    </svg>
  );
}

// Voltage bar gauge
function VoltBar({ voltage, maxV, color, label }) {
  const pct = Math.min(1, voltage / maxV);
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: '#71717a' }}>{label}</span>
        <span style={{ fontSize: 11, fontFamily: 'monospace', color }}>{voltage.toFixed(2)} kV</span>
      </div>
      <div style={{ height: 8, background: '#27272a', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: 4, transition: 'width 0.1s' }} />
      </div>
    </div>
  );
}

// Condition light
function CondLight({ ok, near, label }) {
  const color = ok ? '#22c55e' : near ? '#eab308' : '#ef4444';
  const glow = ok ? '0 0 12px #22c55e88' : near ? '0 0 10px #eab30866' : '0 0 8px #ef444455';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ width: 16, height: 16, borderRadius: '50%', background: color, boxShadow: glow, transition: 'all 0.3s' }} />
      <span style={{ fontSize: 10, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  );
}

// Animated Synchroscope with smooth needle
function Synchroscope({ angleRad }) {
  const R = 70, cx = 80, cy = 80;
  const nearSync = Math.abs(((angleRad % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) < 0.26
    || Math.abs(((angleRad % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - 2 * Math.PI) < 0.26;

  // Pointer tip
  const px = cx + (R - 8) * Math.sin(angleRad);
  const py = cy - (R - 8) * Math.cos(angleRad);

  // Pointer tail (opposite side, shorter)
  const tailLen = 14;
  const tx = cx - tailLen * Math.sin(angleRad);
  const ty = cy + tailLen * Math.cos(angleRad);

  // Green sector path +/-15 degrees around top
  const secR = R - 2;
  const a1 = -15 * Math.PI / 180, a2 = 15 * Math.PI / 180;
  const x1 = cx + secR * Math.sin(a1), y1 = cy - secR * Math.cos(a1);
  const x2 = cx + secR * Math.sin(a2), y2 = cy - secR * Math.cos(a2);
  const arcPath = `M ${cx} ${cy} L ${x1} ${y1} A ${secR} ${secR} 0 0 1 ${x2} ${y2} Z`;

  // Amber sectors +/-15 to +/-30
  const a3 = -30 * Math.PI / 180, a4 = 30 * Math.PI / 180;
  const x3 = cx + secR * Math.sin(a3), y3 = cy - secR * Math.cos(a3);
  const x4 = cx + secR * Math.sin(a4), y4 = cy - secR * Math.cos(a4);
  const amberLeft = `M ${cx} ${cy} L ${x3} ${y3} A ${secR} ${secR} 0 0 1 ${x1} ${y1} Z`;
  const amberRight = `M ${cx} ${cy} L ${x2} ${y2} A ${secR} ${secR} 0 0 1 ${x4} ${y4} Z`;

  // Red sectors rest
  const redLeftPath = `M ${cx} ${cy} L ${cx - secR * Math.sin(Math.PI / 6)} ${cy + secR * Math.cos(Math.PI / 6)} A ${secR} ${secR} 0 1 1 ${x3} ${y3} Z`;

  // Tick marks
  const ticks = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * 2 * Math.PI;
    const inner = i % 3 === 0 ? R - 12 : R - 7;
    ticks.push({ x1: cx + inner * Math.sin(a), y1: cy - inner * Math.cos(a), x2: cx + R * Math.sin(a), y2: cy - R * Math.cos(a) });
  }

  // Needle glow color
  const needleColor = nearSync ? '#22c55e' : '#f59e0b';
  const needleGlow = nearSync ? 'drop-shadow(0 0 6px #22c55e)' : 'drop-shadow(0 0 3px #f59e0b88)';

  return (
    <svg width={160} height={160}>
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={R} fill="#111114" stroke="#3f3f46" strokeWidth={2} />

      {/* Outer decorative ring */}
      <circle cx={cx} cy={cy} r={R + 1} fill="none" stroke="#27272a" strokeWidth={3} />

      {/* Amber sectors */}
      <path d={amberLeft} fill="rgba(245,158,11,0.1)" />
      <path d={amberRight} fill="rgba(245,158,11,0.1)" />

      {/* Green sync sector */}
      <path d={arcPath} fill="rgba(34,197,94,0.18)" />

      {/* Ticks */}
      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#3f3f46" strokeWidth={i % 3 === 0 ? 2 : 1} />
      ))}

      {/* Labels */}
      <text x={cx} y={cy - R + 16} textAnchor="middle" fill="#22c55e" fontSize={11} fontFamily="monospace" fontWeight={700}>12</text>
      <text x={cx + R - 14} y={cy + 4} textAnchor="middle" fill="#a1a1aa" fontSize={11} fontFamily="monospace">3</text>
      <text x={cx} y={cy + R - 8} textAnchor="middle" fill="#ef4444" fontSize={11} fontFamily="monospace">6</text>
      <text x={cx - R + 14} y={cy + 4} textAnchor="middle" fill="#a1a1aa" fontSize={11} fontFamily="monospace">9</text>

      {/* "FAST" / "SLOW" labels */}
      <text x={cx + 28} y={cy - R + 28} textAnchor="middle" fill="#6366f1" fontSize={7} fontFamily="monospace" fontWeight={600}>FAST</text>
      <text x={cx - 28} y={cy - R + 28} textAnchor="middle" fill="#6366f1" fontSize={7} fontFamily="monospace" fontWeight={600}>SLOW</text>

      {/* Pointer tail (counterweight) */}
      <line x1={cx} y1={cy} x2={tx} y2={ty} stroke={needleColor} strokeWidth={4} strokeLinecap="round" opacity={0.4} />

      {/* Pointer needle */}
      <line
        x1={cx} y1={cy}
        x2={px} y2={py}
        stroke={needleColor}
        strokeWidth={3}
        strokeLinecap="round"
        style={{ filter: needleGlow, transition: 'filter 0.2s' }}
      />

      {/* Center pivot */}
      <circle cx={cx} cy={cy} r={5} fill="#18181b" stroke="#6366f1" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={2} fill="#6366f1" />

      {/* Sync label */}
      {nearSync && (
        <text x={cx} y={cy + R + 14} textAnchor="middle" fill="#22c55e" fontSize={10} fontFamily="monospace" fontWeight="bold">SYNC ZONE</text>
      )}
    </svg>
  );
}

// Load sharing droop chart
function LoadSharingChart({ setpoint }) {
  const W = 320, H = 140;
  const pad = { t: 14, r: 16, b: 28, l: 44 };
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
  const R = 0.04;
  const totalLoad = 1.0;
  const fOp = 50.0;
  const P_in = Math.min(Math.max((setpoint - fOp) / R, 0), totalLoad);
  const P_grid = totalLoad - P_in;

  const toX = (P) => pad.l + (P / 1.0) * cW;
  const toY = (f) => pad.t + cH - ((f - 49.5) / 1.0) * cH;

  const inLine = [[0, setpoint], [1.0, setpoint - R * 1.0]];
  const gridLine = [[0, fOp], [1.0, fOp]];

  const pathFor = (pts) => pts.map(([p, f], i) => `${i === 0 ? 'M' : 'L'} ${toX(p)} ${toY(f)}`).join(' ');

  return (
    <svg width={W} height={H}>
      <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + cH} stroke="#3f3f46" strokeWidth={1} />
      <line x1={pad.l} y1={pad.t + cH} x2={pad.l + cW} y2={pad.t + cH} stroke="#3f3f46" strokeWidth={1} />
      {[49.5, 49.7, 50.0, 50.3, 50.5].map(f => (
        <g key={f}>
          <line x1={pad.l - 4} y1={toY(f)} x2={pad.l + cW} y2={toY(f)} stroke="#27272a" strokeWidth={1} />
          <text x={pad.l - 6} y={toY(f) + 4} textAnchor="end" fill="#52525b" fontSize={9} fontFamily="monospace">{f.toFixed(1)}</text>
        </g>
      ))}
      <line x1={pad.l} y1={toY(fOp)} x2={pad.l + cW} y2={toY(fOp)} stroke="#6366f1" strokeWidth={1} strokeDasharray="4 3" />
      <path d={pathFor(gridLine)} fill="none" stroke="#38bdf8" strokeWidth={2} />
      <path d={pathFor(inLine)} fill="none" stroke="#a78bfa" strokeWidth={2} />
      <circle cx={toX(P_in)} cy={toY(fOp)} r={5} fill="#a78bfa" style={{ filter: 'drop-shadow(0 0 4px #a78bfa)' }} />
      <circle cx={toX(P_grid)} cy={toY(fOp)} r={5} fill="#38bdf8" style={{ filter: 'drop-shadow(0 0 4px #38bdf8)' }} />
      <text x={pad.l + cW - 2} y={toY(inLine[1][1]) - 4} textAnchor="end" fill="#a78bfa" fontSize={9} fontFamily="monospace">Incoming</text>
      <text x={pad.l + cW - 2} y={toY(gridLine[1][1]) + 12} textAnchor="end" fill="#38bdf8" fontSize={9} fontFamily="monospace">Grid</text>
      <text x={pad.l + 2} y={toY(fOp) - 4} fill="#6366f1" fontSize={9} fontFamily="monospace">50.0 Hz (op)</text>
      <text x={toX(P_in)} y={toY(fOp) - 10} textAnchor="middle" fill="#a78bfa" fontSize={9} fontFamily="monospace">{P_in.toFixed(2)} pu</text>
      <text x={toX(P_grid)} y={toY(fOp) + 16} textAnchor="middle" fill="#38bdf8" fontSize={9} fontFamily="monospace">{P_grid.toFixed(2)} pu</text>
      <text x={pad.l + cW / 2} y={H - 2} textAnchor="middle" fill="#52525b" fontSize={9} fontFamily="monospace">Active Power (pu)</text>
      <text x={8} y={pad.t + cH / 2} fill="#52525b" fontSize={9} fontFamily="monospace" transform={`rotate(-90,8,${pad.t + cH / 2})`} textAnchor="middle">Freq (Hz)</text>
    </svg>
  );
}

/* ── Theory SVG Diagrams ── */

/** All four synchronization conditions diagram */
function SynchConditionsSVG() {
  const W = 540, H = 210;
  const conditions = [
    { x: 68, label: 'VOLTAGE', icon: 'V', color: '#22c55e', desc: '|V_in| = |V_grid|', detail: '\u0394V < 2%', equation: 'Adjust field If' },
    { x: 203, label: 'FREQUENCY', icon: 'f', color: '#f59e0b', desc: 'f_in = f_grid', detail: '\u0394f < 0.1 Hz', equation: 'Adjust governor' },
    { x: 338, label: 'PHASE', icon: '\u03B8', color: '#6366f1', desc: '\u03B8_in = \u03B8_grid', detail: '\u0394\u03B8 < 10\u00B0', equation: 'Wait for synchroscope' },
    { x: 473, label: 'SEQUENCE', icon: 'RYB', color: '#22d3ee', desc: 'Same rotation', detail: 'R-Y-B order', equation: 'Phase sequence meter' },
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: '100%', display: 'block', margin: '18px auto' }}>
      {/* Title */}
      <text x={W / 2} y={16} textAnchor="middle" fill="#52525b" fontSize={11} fontWeight={600} fontFamily="monospace">FOUR CONDITIONS FOR SYNCHRONIZATION</text>

      {/* Connecting line */}
      <line x1={68} y1={60} x2={473} y2={60} stroke="#27272a" strokeWidth={2} />

      {conditions.map((c, i) => (
        <g key={i}>
          {/* Circle */}
          <circle cx={c.x} cy={60} r={26} fill="#18181b" stroke={c.color} strokeWidth={2} />
          {/* Icon */}
          <text x={c.x} y={c.icon.length > 2 ? 64 : 66} textAnchor="middle" fill={c.color} fontSize={c.icon.length > 2 ? 10 : 16} fontWeight={700} fontFamily="monospace">{c.icon}</text>
          {/* Condition number */}
          <circle cx={c.x + 20} cy={38} r={9} fill={c.color} opacity={0.15} />
          <text x={c.x + 20} y={42} textAnchor="middle" fill={c.color} fontSize={10} fontWeight={700} fontFamily="monospace">{i + 1}</text>
          {/* Label */}
          <text x={c.x} y={104} textAnchor="middle" fill={c.color} fontSize={9} fontWeight={700} fontFamily="monospace">{c.label}</text>
          {/* Description */}
          <text x={c.x} y={118} textAnchor="middle" fill="#a1a1aa" fontSize={8} fontFamily="monospace">{c.desc}</text>
          {/* Tolerance */}
          <text x={c.x} y={132} textAnchor="middle" fill="#52525b" fontSize={8} fontFamily="monospace">{c.detail}</text>
          {/* Control method */}
          <text x={c.x} y={148} textAnchor="middle" fill="#3f3f46" fontSize={7} fontFamily="monospace">{c.equation}</text>
        </g>
      ))}

      {/* Plus signs */}
      <text x={135} y={55} textAnchor="middle" fill="#3f3f46" fontSize={14}>+</text>
      <text x={270} y={55} textAnchor="middle" fill="#3f3f46" fontSize={14}>+</text>
      <text x={405} y={55} textAnchor="middle" fill="#3f3f46" fontSize={14}>+</text>

      {/* Result bar */}
      <rect x={60} y={168} width={420} height={28} rx={8} fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth={1} />
      <text x={W / 2} y={186} textAnchor="middle" fill="#22c55e" fontSize={10} fontWeight={700} fontFamily="monospace">ALL FOUR MET = SAFE TO CLOSE BREAKER</text>

      {/* Warning */}
      <text x={W / 2} y={206} textAnchor="middle" fill="#ef4444" fontSize={8} fontFamily="monospace">Closing with any mismatch \u2192 dangerous circulating currents</text>
    </svg>
  );
}

/** Synchroscope dial diagram for theory */
function SynchroscopeTheorySVG() {
  const R = 60, cx = 75, cy = 80;
  return (
    <svg viewBox="0 0 240 170" width={240} height={170} style={{ maxWidth: '100%', display: 'block', margin: '18px auto' }}>
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={R + 4} fill="none" stroke="#27272a" strokeWidth={3} />
      <circle cx={cx} cy={cy} r={R} fill="#111114" stroke="#3f3f46" strokeWidth={1.5} />

      {/* Color sectors */}
      {/* Green: top +/-15 */}
      {(() => {
        const sr = R - 3;
        const a1 = -15 * Math.PI / 180, a2 = 15 * Math.PI / 180;
        const sx = cx + sr * Math.sin(a1), sy = cy - sr * Math.cos(a1);
        const ex = cx + sr * Math.sin(a2), ey = cy - sr * Math.cos(a2);
        return <path d={`M ${cx} ${cy} L ${sx} ${sy} A ${sr} ${sr} 0 0 1 ${ex} ${ey} Z`} fill="rgba(34,197,94,0.2)" />;
      })()}

      {/* Ticks */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * 2 * Math.PI;
        const inner = i % 3 === 0 ? R - 10 : R - 5;
        return <line key={i} x1={cx + inner * Math.sin(a)} y1={cy - inner * Math.cos(a)} x2={cx + R * Math.sin(a)} y2={cy - R * Math.cos(a)} stroke="#3f3f46" strokeWidth={i % 3 === 0 ? 2 : 1} />;
      })}

      {/* Labels */}
      <text x={cx} y={cy - R + 14} textAnchor="middle" fill="#22c55e" fontSize={10} fontWeight={700} fontFamily="monospace">12</text>
      <text x={cx + R - 10} y={cy + 4} textAnchor="middle" fill="#a1a1aa" fontSize={9} fontFamily="monospace">3</text>
      <text x={cx} y={cy + R - 6} textAnchor="middle" fill="#ef4444" fontSize={10} fontWeight={700} fontFamily="monospace">6</text>
      <text x={cx - R + 10} y={cy + 4} textAnchor="middle" fill="#a1a1aa" fontSize={9} fontFamily="monospace">9</text>

      {/* Static needle pointing at ~1 o'clock (approaching sync) */}
      <line x1={cx} y1={cy} x2={cx + 20} y2={cy - 48} stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={3} fill="#6366f1" />

      {/* FAST / SLOW */}
      <text x={cx + 22} y={cy - R + 22} fill="#818cf8" fontSize={7} fontFamily="monospace">FAST</text>
      <text x={cx - 32} y={cy - R + 22} fill="#818cf8" fontSize={7} fontFamily="monospace">SLOW</text>

      {/* Annotations */}
      <line x1={cx + 4} y1={cy - R - 8} x2={160} y2={20} stroke="#22c55e" strokeWidth={0.8} strokeDasharray="3 2" />
      <text x={162} y={18} fill="#22c55e" fontSize={9} fontFamily="monospace">CLOSE here (0\u00B0)</text>
      <text x={162} y={30} fill="#52525b" fontSize={8} fontFamily="monospace">Phase diff = 0</text>

      <line x1={cx + R + 4} y1={cy} x2={190} y2={70} stroke="#a1a1aa" strokeWidth={0.8} strokeDasharray="3 2" />
      <text x={162} y={68} fill="#a1a1aa" fontSize={9} fontFamily="monospace">90\u00B0 ahead</text>

      <line x1={cx} y1={cy + R + 4} x2={160} y2={130} stroke="#ef4444" strokeWidth={0.8} strokeDasharray="3 2" />
      <text x={162} y={128} fill="#ef4444" fontSize={9} fontFamily="monospace">180\u00B0 (WORST)</text>
      <text x={162} y={140} fill="#52525b" fontSize={8} fontFamily="monospace">Ic = fault level!</text>

      <text x={cx} y={cy + R + 18} textAnchor="middle" fill="#71717a" fontSize={9} fontFamily="monospace">SYNCHROSCOPE</text>
    </svg>
  );
}

/** Dark/Bright lamp method circuit diagram */
function LampMethodSVG() {
  const W = 520, H = 200;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: '100%', display: 'block', margin: '18px auto' }}>
      {/* Title */}
      <text x={130} y={18} textAnchor="middle" fill="#818cf8" fontSize={11} fontWeight={700} fontFamily="monospace">DARK LAMP METHOD</text>
      <text x={390} y={18} textAnchor="middle" fill="#818cf8" fontSize={11} fontWeight={700} fontFamily="monospace">TWO-BRIGHT ONE-DARK</text>

      {/* Dark lamp side */}
      {/* Generator */}
      <circle cx={40} cy={80} r={18} fill="none" stroke="#a78bfa" strokeWidth={1.5} />
      <text x={40} y={85} textAnchor="middle" fill="#a78bfa" fontSize={10} fontFamily="monospace">G</text>

      {/* Bus */}
      <rect x={200} y={50} width={4} height={100} fill="#38bdf8" rx={2} />

      {/* Phase R */}
      <line x1={58} y1={65} x2={130} y2={65} stroke="#ef4444" strokeWidth={1.5} />
      <line x1={155} y1={65} x2={200} y2={65} stroke="#ef4444" strokeWidth={1.5} />
      <text x={60} y={60} fill="#ef4444" fontSize={9} fontFamily="monospace">R</text>
      {/* Lamp R-R */}
      <circle cx={142} cy={65} r={10} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={142} y={69} textAnchor="middle" fill="#f59e0b" fontSize={8} fontFamily="monospace">L</text>

      {/* Phase Y */}
      <line x1={58} y1={85} x2={130} y2={85} stroke="#facc15" strokeWidth={1.5} />
      <line x1={155} y1={85} x2={200} y2={85} stroke="#facc15" strokeWidth={1.5} />
      <text x={60} y={80} fill="#facc15" fontSize={9} fontFamily="monospace">Y</text>
      <circle cx={142} cy={85} r={10} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={142} y={89} textAnchor="middle" fill="#f59e0b" fontSize={8} fontFamily="monospace">L</text>

      {/* Phase B */}
      <line x1={58} y1={105} x2={130} y2={105} stroke="#6366f1" strokeWidth={1.5} />
      <line x1={155} y1={105} x2={200} y2={105} stroke="#6366f1" strokeWidth={1.5} />
      <text x={60} y={100} fill="#6366f1" fontSize={9} fontFamily="monospace">B</text>
      <circle cx={142} cy={105} r={10} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={142} y={109} textAnchor="middle" fill="#f59e0b" fontSize={8} fontFamily="monospace">L</text>

      {/* Breaker symbol */}
      <rect x={195} y={45} width={14} height={10} fill="none" stroke="#22c55e" strokeWidth={1.5} rx={2} />
      <text x={202} y={43} textAnchor="middle" fill="#22c55e" fontSize={7} fontFamily="monospace">CB</text>

      {/* Description */}
      <text x={130} y={140} textAnchor="middle" fill="#a1a1aa" fontSize={9} fontFamily="monospace">R-R, Y-Y, B-B</text>
      <text x={130} y={153} textAnchor="middle" fill="#22c55e" fontSize={9} fontFamily="monospace">All dark = in phase</text>
      <text x={130} y={166} textAnchor="middle" fill="#52525b" fontSize={8} fontFamily="monospace">Simple but no fast/slow info</text>

      {/* Separator */}
      <line x1={260} y1={30} x2={260} y2={180} stroke="#27272a" strokeWidth={1} strokeDasharray="4 3" />

      {/* Two-bright one-dark side */}
      <circle cx={300} cy={80} r={18} fill="none" stroke="#a78bfa" strokeWidth={1.5} />
      <text x={300} y={85} textAnchor="middle" fill="#a78bfa" fontSize={10} fontFamily="monospace">G</text>

      <rect x={460} y={50} width={4} height={100} fill="#38bdf8" rx={2} />

      {/* R -> R (dark) */}
      <line x1={318} y1={65} x2={390} y2={65} stroke="#ef4444" strokeWidth={1.5} />
      <line x1={415} y1={65} x2={460} y2={65} stroke="#ef4444" strokeWidth={1.5} />
      <circle cx={402} cy={65} r={10} fill="none" stroke="#52525b" strokeWidth={1.5} />
      <text x={402} y={69} textAnchor="middle" fill="#52525b" fontSize={8} fontFamily="monospace">D</text>

      {/* Y -> B (bright, cross-connected) */}
      <line x1={318} y1={85} x2={390} y2={105} stroke="#facc15" strokeWidth={1.5} />
      <line x1={415} y1={105} x2={460} y2={105} stroke="#6366f1" strokeWidth={1.5} />
      <circle cx={402} cy={105} r={10} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={402} y={109} textAnchor="middle" fill="#f59e0b" fontSize={8} fontFamily="monospace">B</text>

      {/* B -> Y (bright, cross-connected) */}
      <line x1={318} y1={105} x2={390} y2={85} stroke="#6366f1" strokeWidth={1.5} />
      <line x1={415} y1={85} x2={460} y2={85} stroke="#facc15" strokeWidth={1.5} />
      <circle cx={402} cy={85} r={10} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={402} y={89} textAnchor="middle" fill="#f59e0b" fontSize={8} fontFamily="monospace">B</text>

      {/* Labels */}
      <text x={320} y={60} fill="#ef4444" fontSize={9} fontFamily="monospace">R</text>
      <text x={320} y={80} fill="#facc15" fontSize={9} fontFamily="monospace">Y</text>
      <text x={320} y={100} fill="#6366f1" fontSize={9} fontFamily="monospace">B</text>

      <text x={390} y={140} textAnchor="middle" fill="#a1a1aa" fontSize={9} fontFamily="monospace">R-R, Y-B, B-Y</text>
      <text x={390} y={153} textAnchor="middle" fill="#22c55e" fontSize={9} fontFamily="monospace">2 bright + 1 dark = sync</text>
      <text x={390} y={166} textAnchor="middle" fill="#52525b" fontSize={8} fontFamily="monospace">Also indicates phase sequence</text>
    </svg>
  );
}

// Main component
export default function AlternatorSynchronization() {
  const [tab, setTab] = useState('sim');
  const [incomingFreq, setIncomingFreq] = useState(49.5);
  const [excitation, setExcitation] = useState(0.95);
  const [xs, setXs] = useState(0.3);
  const [govSetpoint, setGovSetpoint] = useState(50.05);
  const [sequenceOk, setSequenceOk] = useState(true);

  // Animated state
  const [phaseAngle, setPhaseAngle] = useState(0);
  const [sinePhase, setSinePhase] = useState(0);
  const [synced, setSynced] = useState(false);
  const [syncFlash, setSyncFlash] = useState(null);
  const [forcedIc, setForcedIc] = useState(null);
  const [flashOpacity, setFlashOpacity] = useState(1);

  const animRef = useRef(null);
  const lastTRef = useRef(null);
  const flashRef = useRef(null);

  const GRID_FREQ = 50.0;
  const GRID_VOLT = 11.0;
  const incomingVolt = GRID_VOLT * excitation;
  const dF = incomingFreq - GRID_FREQ;
  const dV = incomingVolt - GRID_VOLT;
  const dVpct = (dV / GRID_VOLT) * 100;

  const phaseNorm = ((phaseAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const angleDeg = phaseNorm * 180 / Math.PI;
  const angleFrom12 = angleDeg > 180 ? angleDeg - 360 : angleDeg;

  const voltOk = Math.abs(dVpct) < 2;
  const voltNear = Math.abs(dVpct) < 5;
  const freqOk = Math.abs(dF) < 0.1;
  const freqNear = Math.abs(dF) < 0.5;
  const phaseOk = Math.abs(angleFrom12) < 15;
  const phaseNear = Math.abs(angleFrom12) < 30;
  const allGood = voltOk && freqOk && phaseOk && sequenceOk;

  const syncRPM = dF * 60;

  let timeToSync = null;
  if (Math.abs(dF) > 0.001) {
    const slipPeriod = 1 / Math.abs(dF);
    const fraction = dF > 0
      ? (phaseNorm > 0 ? (2 * Math.PI - phaseNorm) / (2 * Math.PI) : 0)
      : (phaseNorm / (2 * Math.PI));
    timeToSync = fraction * slipPeriod;
  }

  // Animation loop
  useEffect(() => {
    if (synced) return;
    const loop = (ts) => {
      if (lastTRef.current !== null) {
        const dt = (ts - lastTRef.current) / 1000;
        setPhaseAngle(prev => prev + 2 * Math.PI * dF * dt);
        setSinePhase(prev => prev + 2 * Math.PI * GRID_FREQ * dt * 0.04);
      }
      lastTRef.current = ts;
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
      lastTRef.current = null;
    };
  }, [dF, synced]);

  // Flash fade
  useEffect(() => {
    if (!syncFlash) return;
    setFlashOpacity(1);
    let t = 0;
    const iv = setInterval(() => {
      t += 0.05;
      setFlashOpacity(Math.max(0, 1 - t));
      if (t >= 1) { clearInterval(iv); if (syncFlash === 'bad') setSyncFlash(null); }
    }, 80);
    return () => clearInterval(iv);
  }, [syncFlash]);

  function handleClose() {
    if (synced) return;
    if (allGood) {
      setSynced(true);
      setSyncFlash('good');
      setForcedIc(null);
    } else {
      const incomingRe = incomingVolt * Math.cos(phaseAngle);
      const incomingIm = incomingVolt * Math.sin(phaseAngle);
      const deltaRe = GRID_VOLT - incomingRe;
      const deltaIm = -incomingIm;
      const deltaMag = Math.hypot(deltaRe, deltaIm);
      const ic = deltaMag / (xs * 2);
      setForcedIc(ic);
      setSyncFlash('bad');
    }
  }

  function handleReset() {
    setSynced(false);
    setSyncFlash(null);
    setForcedIc(null);
    setPhaseAngle(0);
    setSinePhase(0);
    setIncomingFreq(49.5);
    setExcitation(0.95);
    lastTRef.current = null;
  }

  const syncAngleDisplay = `${Math.abs(angleFrom12).toFixed(1)}\u00B0 ${angleFrom12 > 0 ? 'ahead' : angleFrom12 < 0 ? 'behind' : 'in phase'}`;

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'sim')} onClick={() => setTab('sim')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'sim' ? (
        <div style={S.simBody}>
          {/* Flash overlay */}
          {syncFlash && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 100, pointerEvents: 'none',
              background: syncFlash === 'good' ? `rgba(34,197,94,${flashOpacity * 0.25})` : `rgba(239,68,68,${flashOpacity * 0.35})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.08s',
            }}>
              {syncFlash === 'good' && synced && (
                <div style={{ fontSize: 38, fontWeight: 800, color: '#22c55e', textShadow: '0 0 32px #22c55e', opacity: flashOpacity, transition: 'opacity 0.08s' }}>
                  SYNCHRONIZED
                </div>
              )}
              {syncFlash === 'bad' && forcedIc != null && (
                <div style={{ textAlign: 'center', opacity: Math.min(1, flashOpacity + 0.2) }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: '#ef4444', textShadow: '0 0 32px #ef4444' }}>OUT-OF-PHASE CLOSE!</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#fca5a5', marginTop: 8 }}>
                    CIRCULATING CURRENT: {forcedIc.toFixed(2)} kA
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Top: Two columns + synchroscope */}
            <div style={{ display: 'flex', gap: 0, padding: '14px 16px 6px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>

              {/* LEFT: Incoming machine */}
              <div style={{ flex: '1 1 220px', maxWidth: 260, padding: '10px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 10, margin: '0 8px 8px' }}>
                <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Incoming Machine</div>
                <SineWave phase={sinePhase + phaseAngle} color="#a78bfa" label="V_in" voltPu={excitation} />
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#71717a' }}>Frequency</span>
                    <span style={{ fontSize: 14, fontFamily: 'monospace', color: freqOk ? '#22c55e' : freqNear ? '#eab308' : '#f87171', fontWeight: 700 }}>
                      {incomingFreq.toFixed(2)} Hz
                    </span>
                  </div>
                  <VoltBar voltage={incomingVolt} maxV={13.0} color={voltOk ? '#22c55e' : voltNear ? '#eab308' : '#f87171'} label="Voltage" />
                </div>
              </div>

              {/* CENTER: Synchroscope + conditions + breaker */}
              <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, margin: '0 8px 8px' }}>
                {/* Conditions */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 4 }}>
                  <CondLight ok={voltOk} near={voltNear} label="Volt" />
                  <CondLight ok={freqOk} near={freqNear} label="Freq" />
                  <CondLight ok={phaseOk} near={phaseNear} label="Phase" />
                </div>

                {/* Synchroscope */}
                <div style={{ position: 'relative' }}>
                  <Synchroscope angleRad={phaseAngle} />
                  <div style={{ textAlign: 'center', fontSize: 10, color: '#52525b', marginTop: -4 }}>SYNCHROSCOPE</div>
                </div>

                {/* Breaker close button */}
                {!synced ? (
                  <button
                    onClick={handleClose}
                    style={{
                      padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer',
                      background: allGood ? '#22c55e' : '#27272a',
                      color: allGood ? '#fff' : '#52525b',
                      fontSize: 13, fontWeight: 700, letterSpacing: '0.04em',
                      boxShadow: allGood ? '0 0 18px #22c55e66' : 'none',
                      transition: 'all 0.3s',
                    }}
                  >
                    {allGood ? 'CLOSE BREAKER' : 'CLOSE BREAKER'}
                  </button>
                ) : (
                  <button
                    onClick={handleReset}
                    style={{ padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}
                  >
                    RESET SIMULATION
                  </button>
                )}
                {forcedIc != null && !synced && (
                  <div style={{ fontSize: 11, color: '#f87171', fontFamily: 'monospace', textAlign: 'center' }}>
                    Last Ic: {forcedIc.toFixed(2)} kA
                  </div>
                )}
              </div>

              {/* RIGHT: Grid bus */}
              <div style={{ flex: '1 1 220px', maxWidth: 260, padding: '10px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 10, margin: '0 8px 8px' }}>
                <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Grid Bus (Infinite)</div>
                <SineWave phase={sinePhase} color="#38bdf8" label="V_grid" voltPu={1.0} />
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#71717a' }}>Frequency</span>
                    <span style={{ fontSize: 14, fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>50.00 Hz</span>
                  </div>
                  <VoltBar voltage={GRID_VOLT} maxV={13.0} color="#38bdf8" label="Voltage" />
                </div>
              </div>
            </div>

            {/* Post-sync load sharing */}
            {synced && (
              <div style={{ padding: '10px 24px', background: '#0f0f12', borderTop: '1px solid #1e1e2e' }}>
                <div style={{ fontSize: 12, color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Load Sharing \u2014 Governor Droop Curves
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                  <LoadSharingChart setpoint={govSetpoint} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={S.cg}>
                      <span style={S.label}>Gov setpoint (incoming)</span>
                      <input type="range" min={50.0} max={50.5} step={0.01} value={govSetpoint}
                        onChange={e => setGovSetpoint(Number(e.target.value))} style={S.slider} />
                      <span style={S.val}>{govSetpoint.toFixed(2)} Hz</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#71717a', lineHeight: 1.6, maxWidth: 200 }}>
                      Increase governor setpoint to pick up load. Grid machine offloads correspondingly.
                      Operating frequency stays at 50.0 Hz (infinite bus).
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sync status badge bar */}
          <div style={{ display: 'flex', gap: 10, padding: '8px 24px', background: '#0d0d10', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{
              padding: '6px 14px', borderRadius: 8,
              border: `1.5px solid ${synced ? '#22c55e' : allGood ? '#22c55e' : '#f59e0b'}`,
              background: synced ? 'rgba(34,197,94,0.12)' : allGood ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: synced ? '#22c55e' : allGood ? '#22c55e' : '#f59e0b',
                boxShadow: `0 0 8px ${synced ? '#22c55e' : allGood ? '#22c55e' : '#f59e0b'}66`,
              }} />
              <span style={{
                fontSize: 12, fontWeight: 700, fontFamily: 'monospace',
                color: synced ? '#22c55e' : allGood ? '#22c55e' : '#f59e0b',
              }}>
                {synced ? 'SYNCHRONIZED' : allGood ? 'READY TO SYNC' : 'NOT READY'}
              </span>
            </div>
            {!synced && (
              <>
                <div style={{
                  padding: '5px 10px', borderRadius: 6,
                  border: `1px solid ${voltOk ? '#22c55e' : '#ef4444'}`,
                  background: voltOk ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'monospace', color: voltOk ? '#22c55e' : '#ef4444' }}>
                    V {voltOk ? '\u2713' : '\u2717'}
                  </span>
                </div>
                <div style={{
                  padding: '5px 10px', borderRadius: 6,
                  border: `1px solid ${freqOk ? '#22c55e' : '#ef4444'}`,
                  background: freqOk ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'monospace', color: freqOk ? '#22c55e' : '#ef4444' }}>
                    f {freqOk ? '\u2713' : '\u2717'}
                  </span>
                </div>
                <div style={{
                  padding: '5px 10px', borderRadius: 6,
                  border: `1px solid ${phaseOk ? '#22c55e' : '#ef4444'}`,
                  background: phaseOk ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'monospace', color: phaseOk ? '#22c55e' : '#ef4444' }}>
                    \u03B8 {phaseOk ? '\u2713' : '\u2717'}
                  </span>
                </div>
              </>
            )}
            {dF !== 0 && !synced && (
              <div style={{
                padding: '5px 10px', borderRadius: 6,
                border: '1px solid #27272a', background: 'transparent',
              }}>
                <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'monospace', color: '#71717a' }}>
                  Slip: {Math.abs(dF).toFixed(2)} Hz | {dF > 0 ? 'FAST' : 'SLOW'}
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Incoming Speed (Governor)</span>
              <input type="range" min={49.0} max={51.0} step={0.01} value={incomingFreq}
                onChange={e => setIncomingFreq(Number(e.target.value))} style={S.slider} disabled={synced} />
              <span style={S.val}>{incomingFreq.toFixed(2)} Hz</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Excitation (Voltage)</span>
              <input type="range" min={0.8} max={1.2} step={0.005} value={excitation}
                onChange={e => setExcitation(Number(e.target.value))} style={S.slider} disabled={synced} />
              <span style={S.val}>{excitation.toFixed(3)} pu</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Xs1 + Xs2</span>
              <input type="range" min={0.2} max={0.4} step={0.01} value={xs}
                onChange={e => setXs(Number(e.target.value))} style={S.slider} />
              <span style={S.val}>{xs.toFixed(2)} pu</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Phase sequence</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={seqButton(sequenceOk)}
                  onClick={() => !synced && setSequenceOk(true)}
                  disabled={synced}
                >
                  Correct
                </button>
                <button
                  style={seqButton(!sequenceOk)}
                  onClick={() => !synced && setSequenceOk(false)}
                  disabled={synced}
                >
                  Reverse
                </button>
              </div>
            </div>
          </div>

          {/* Live readouts */}
          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>\u0394f (Hz)</span>
              <span style={{ ...S.rv, color: freqOk ? '#22c55e' : freqNear ? '#eab308' : '#f87171' }}>
                {dF >= 0 ? '+' : ''}{dF.toFixed(3)}
              </span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>\u0394V (%)</span>
              <span style={{ ...S.rv, color: voltOk ? '#22c55e' : voltNear ? '#eab308' : '#f87171' }}>
                {dVpct >= 0 ? '+' : ''}{dVpct.toFixed(2)}%
              </span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Phase \u03B8 (\u00B0)</span>
              <span style={{ ...S.rv, color: phaseOk ? '#22c55e' : phaseNear ? '#eab308' : '#f87171' }}>
                {angleFrom12 >= 0 ? '+' : ''}{angleFrom12.toFixed(1)}\u00B0
              </span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Synchroscope RPM</span>
              <span style={{ ...S.rv, color: '#c4b5fd' }}>{syncRPM.toFixed(2)}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Incoming Voltage</span>
              <span style={{ ...S.rv, color: '#e4e4e7' }}>{incomingVolt.toFixed(3)} kV</span>
            </div>
            {forcedIc != null && (
              <div style={S.ri}>
                <span style={S.rl}>Circulating Ic</span>
                <span style={{ ...S.rv, color: '#ef4444' }}>{forcedIc.toFixed(2)} kA</span>
              </div>
            )}
          </div>

          {/* Info boxes */}
          <div style={S.strip}>
            <div style={S.box}>
              <span style={S.boxT}>Synchroscope reading</span>
              <span style={S.boxV}>{syncAngleDisplay}</span>
              <span style={{ ...S.boxV, color: '#52525b' }}>RPM: {syncRPM >= 0 ? '+' : ''}{syncRPM.toFixed(2)}</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Time to sync</span>
              <span style={S.boxV}>
                {Math.abs(dF) < 0.001 && phaseOk ? 'In sync now!' :
                  timeToSync != null ? `${timeToSync.toFixed(1)} s` : 'Stopped (\u0394f = 0)'}
              </span>
              <span style={{ ...S.boxV, color: '#52525b' }}>Slip period: {Math.abs(dF) > 0.001 ? `${(1 / Math.abs(dF)).toFixed(1)} s` : '\u2014'}</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Synchronization status</span>
              <span style={{ ...S.boxV, color: allGood ? '#22c55e' : '#f87171' }}>
                {synced ? 'ONLINE \u2014 SYNCHRONIZED' : allGood ? 'READY \u2014 CLOSE BREAKER' : 'NOT READY'}
              </span>
              <span style={{ ...S.boxV, color: '#52525b' }}>
                {!voltOk && `\u0394V too large (${dVpct.toFixed(1)}%). `}
                {!freqOk && `\u0394f too large (${dF.toFixed(2)} Hz). `}
                {!phaseOk && `Phase offset (${angleFrom12.toFixed(0)}\u00B0). `}
                {!sequenceOk && 'Phase sequence mismatch. '}
                {allGood && 'All conditions met.'}
              </span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Instructions</span>
              <span style={{ ...S.boxV, color: '#a1a1aa', lineHeight: 1.7 }}>
                1. Set speed to ~50 Hz (slow synchroscope){'\n'}
                2. Adjust excitation to match 11 kV{'\n'}
                3. Wait for pointer near 12 o'clock{'\n'}
                4. Close breaker in green zone
                {'\n'}5. Verify phase sequence is correct
              </span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Phase sequence</span>
              <span style={{ ...S.boxV, color: sequenceOk ? '#22c55e' : '#f87171' }}>
                {sequenceOk ? 'Correct (R-Y-B)' : 'Reverse (R-B-Y)'}
              </span>
              <span style={{ ...S.boxV, color: '#52525b' }}>
                {sequenceOk ? 'Sequence matches bus.' : 'Reverse sequence creates large torque shock if closed.'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Theory tab */
        <div style={S.theory}>
          <h2 style={S.h2}>Alternator Synchronization</h2>

          <h3 style={S.h3}>Why synchronization matters</h3>
          <p style={S.p}>
            Connecting an unsynchronized alternator to the live grid is equivalent to applying a sudden large voltage difference across an extremely small impedance \u2014 the combined synchronous reactance of both machines. Even a 1\u00B0 phase error at 11 kV with Xs = 0.1 pu can produce tens of kiloamperes of circulating current, enough to destroy armature windings, trip protective relays, and cause severe mechanical shock on the shaft. Synchronization is therefore not a formality but a fundamental safety requirement.
          </p>

          <h2 style={S.h2}>The Four Conditions</h2>
          <p style={S.p}>
            Before closing the generator circuit breaker, four conditions must be simultaneously satisfied. Failure to meet any one of them results in dangerous circulating currents and mechanical transients. The fourth condition (phase sequence) is verified once during commissioning and typically does not change during operation.
          </p>

          <SynchConditionsSVG />

          <p style={S.p}><strong style={{ color: '#22d3ee' }}>4. Phase sequence match:</strong> The phase rotation (R-Y-B or A-B-C) of the incoming machine must match the bus. Incorrect sequence means the machine tries to rotate against the grid, producing extreme mechanical and electrical stress. This is verified once during commissioning using a phase sequence indicator. Modern auto-synchronizers include a built-in sequence check.</p>

          <p style={S.p}><strong style={{ color: '#e4e4e7' }}>1. Voltage match:</strong> The RMS terminal voltage of the incoming machine must equal the bus voltage. A mismatch drives reactive circulating current:</p>
          <code style={S.eq}>I_reactive = \u0394V / (Xs1 + Xs2)  [pu or actual]</code>
          <p style={S.p}>Overexcitation (V_in &gt; V_grid) pushes reactive current into the bus (generator supplies leading VArs). Underexcitation (V_in &lt; V_grid) draws reactive current from the bus (lagging VArs). Either imbalance causes heating, possible voltage collapse at weak buses, or relay tripping.</p>

          <p style={S.p}><strong style={{ color: '#e4e4e7' }}>2. Frequency match:</strong> The incoming machine must rotate at exactly synchronous speed. A residual frequency difference (\u0394f) causes the rotor to oscillate about the synchronous position after closing \u2014 a phenomenon called "hunting." Large \u0394f can cause loss of synchronism (pole slipping) immediately after the breaker closes.</p>

          <p style={S.p}><strong style={{ color: '#e4e4e7' }}>3. Phase angle match:</strong> This is the most critical condition. The instantaneous voltage difference between the two machines depends on the phase displacement \u03B8:</p>
          <code style={S.eq}>|\u0394V| = 2 \u00B7 V \u00B7 sin(\u03B8/2)</code>
          <code style={S.eq}>Ic = 2 \u00B7 V \u00B7 sin(\u03B8/2) / (2\u00B7Xs) = V \u00B7 sin(\u03B8/2) / Xs</code>
          <p style={S.p}>At \u03B8 = 180\u00B0 (worst case), the voltage difference equals 2V \u2014 the same as a dead short across both machines simultaneously:</p>
          <code style={S.eq}>Ic_max (at \u03B8=180\u00B0) = 2V / (2\u00B7Xs) = V / Xs  =  3-phase fault current</code>

          <h2 style={S.h2}>The Synchroscope</h2>
          <p style={S.p}>
            A synchroscope is a small phase-angle measuring instrument. Its stator winding is fed from the grid bus, and its rotor winding from the incoming machine (or vice versa). The net torque on the rotor is proportional to the slip frequency \u0394f = f_in \u2212 f_grid. The rotor therefore spins at the slip speed, and its angular position at any instant represents the accumulated phase difference between the two voltages.
          </p>

          <SynchroscopeTheorySVG />

          <ul style={S.ul}>
            <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Pointer at 12 o'clock</strong> \u2014 phase difference = 0\u00B0, ideal moment to close breaker</li>
            <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Rotating clockwise</strong> \u2014 incoming machine is fast (f_in &gt; f_grid), reduce governor setpoint</li>
            <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Rotating counter-clockwise</strong> \u2014 incoming machine is slow (f_in &lt; f_grid), increase governor setpoint</li>
            <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Slow rotation</strong> \u2014 frequencies nearly equal; close the breaker just before pointer reaches 12 o'clock (allowing for breaker closing time ~80 ms)</li>
          </ul>

          <h2 style={S.h2}>Lamp Synchronization Methods</h2>
          <p style={S.p}>Before electronic synchroscopes, operators used incandescent lamp methods:</p>

          <LampMethodSVG />

          <ul style={S.ul}>
            <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Dark lamp method:</strong> Three lamps connected R\u2013R, Y\u2013Y, B\u2013B across the open breaker contacts. All three extinguish simultaneously at in-phase condition. Simple, but gives no indication of fast vs slow.</li>
            <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Bright lamp method:</strong> Lamps cross-connected (R\u2013Y, Y\u2013B, B\u2013R). Maximum equal brightness at in-phase condition. Better visibility but more complex interpretation.</li>
            <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Two-bright one-dark method:</strong> Two lamps bright, one dark at synchronism. Also gives phase sequence indication \u2014 if sequence is wrong, two lamps light together out of step with the third.</li>
          </ul>

          <h3 style={S.h3}>Key Equations Summary</h3>
          <code style={S.eq}>Circulating current  Ic = \u0394V / (Xs1 + Xs2)</code>
          <code style={S.eq}>Voltage difference at angle \u03B8:  \u0394V = 2\u00B7V\u00B7sin(\u03B8/2)</code>
          <code style={S.eq}>Ic at angle \u03B8 = V\u00B7sin(\u03B8/2) / Xs</code>
          <code style={S.eq}>Ic_max (\u03B8=180\u00B0) = V / Xs  \u2261  three-phase fault current</code>
          <code style={S.eq}>Synchroscope speed (RPM) = (f_in \u2212 f_grid) \u00D7 60</code>
          <code style={S.eq}>Slip period = 1 / |\u0394f|  seconds between sync opportunities</code>

          <h3 style={S.h3}>Governor Droop and Load Sharing</h3>
          <p style={S.p}>
            After synchronization, the incoming machine initially carries zero active load (assuming it was synchronized at the same frequency as the bus). To pick up load, the operator raises the governor speed setpoint, shifting the machine's droop characteristic upward. The operating frequency is held fixed by the infinite bus (or by the aggregate of all connected generators), so the machine's output increases as its droop line intersects the system frequency at a higher power level.
          </p>
          <code style={S.eq}>Droop: f = f\u2080 \u2212 R \u00B7 P     (R \u2248 0.04 for 4% droop)</code>
          <code style={S.eq}>P_incoming = (f\u2080_incoming \u2212 f_system) / R</code>

          <h3 style={S.h3}>Modern Automatic Synchronizers</h3>
          <p style={S.p}>
            Modern units such as the ABB Synchrotact 5 or GE F650 measure all three conditions continuously. Critically, they calculate a "closing advance angle" \u2014 since breakers take 50\u2013100 ms to fully close, the relay issues the close command when the phase angle is slightly ahead of 0\u00B0, so that by the time contacts actually make, the pointer is exactly at 12 o'clock. The IEC 60255-6 standard governs synchrocheck relay (element 25) behavior.
          </p>

          <div style={S.ctx}>
            <span style={S.ctxT}>Indian Power System Context</span>
            <p style={S.ctxP}>
              <strong>NTPC Standard Operating Procedure:</strong> Frequency within \u00B10.1 Hz, voltage within \u00B12%, phase within 10\u00B0 before enabling the synchronizing push-button. ABB Synchrotact units are installed at virtually all NTPC, NHPC, and major State GENCO (APGENCO, MSPGCL, TNEB) control rooms.<br /><br />
              <strong>Indian Grid Code (CERC):</strong> Normal operating frequency band is 49.9\u201350.05 Hz. Before synchronizing, the incoming unit must be within this band. The Under-Frequency Load Shedding (UFLS) scheme activates below 49.2 Hz, and over-frequency relay trips generators above 50.5 Hz \u2014 so synchronizing outside the normal band risks immediately hitting protection limits.<br /><br />
              <strong>August 2012 India Grid Blackout:</strong> The world's largest power outage affected 620 million people. Recovery required careful "black start" island synchronization \u2014 isolated pockets of generation had to be carefully phased in, one section at a time, using the same three-condition checks to avoid re-collapsing the grid during restoration.<br /><br />
              <strong>Voltage levels in India:</strong> Synchronization at the generator terminal occurs at 11 kV (typical), 6.6 kV, or up to 15.75 kV depending on the unit rating, before the step-up transformer raises it to 220 kV, 400 kV, or 765 kV for the transmission grid.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
