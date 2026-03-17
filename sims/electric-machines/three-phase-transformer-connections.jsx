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
  slider: { width: 120, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 50, textAlign: 'right' },
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

const PHASE_COLORS = { A: '#ef4444', B: '#eab308', C: '#3b82f6', a: '#ef4444', b: '#eab308', c: '#3b82f6' };
const RAD = Math.PI / 180;
const sqrt3 = Math.sqrt(3);

const GROUP_COLORS = { 0: '#22c55e', 11: '#f59e0b', 6: '#ef4444', 1: '#60a5fa' };

const CONNECTIONS = [
  { id: 'Yd11', label: 'Yd11', primary: 'Y', secondary: 'D', groupNum: 11, phaseShift: -30, desc: 'Star-Delta (-30 deg HV reference)', groupColor: '#f59e0b' },
  { id: 'Dy11', label: 'Dy11', primary: 'D', secondary: 'Y', groupNum: 11, phaseShift: 30, desc: 'Delta-Star (+30 deg HV reference)', groupColor: '#f59e0b' },
  { id: 'Dd0',  label: 'Dd0',  primary: 'D', secondary: 'D', groupNum: 0,  phaseShift: 0,   desc: 'Delta-Delta (0 deg)', groupColor: '#22c55e' },
  { id: 'Yy0',  label: 'Yy0',  primary: 'Y', secondary: 'Y', groupNum: 0,  phaseShift: 0,   desc: 'Star-Star (0 deg)', groupColor: '#22c55e' },
];

function fmt(v, digits = 2) {
  if (Math.abs(v) >= 1000) return (v / 1000).toFixed(2) + ' kV';
  return v.toFixed(digits) + ' kV';
}

// Coil symbol: a zigzag path representing a winding
function CoilPath({ x1, y1, x2, y2, color, turns = 4 }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return null;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux; // perpendicular
  const amp = 7;
  const segLen = len / (turns * 2);
  let d = `M ${x1} ${y1}`;
  for (let i = 0; i < turns * 2; i++) {
    const tx = x1 + ux * segLen * (i + 0.5) + px * amp * (i % 2 === 0 ? 1 : -1);
    const ty = y1 + uy * segLen * (i + 0.5) + py * amp * (i % 2 === 0 ? 1 : -1);
    d += ` Q ${tx} ${ty} ${x1 + ux * segLen * (i + 1)} ${y1 + uy * segLen * (i + 1)}`;
  }
  return <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />;
}

// Arrow marker def id
function ArrowDefs() {
  return (
    <defs>
      <marker id="arrowA" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M0,1 L8,4 L0,7 Z" fill="#ef4444" />
      </marker>
      <marker id="arrowB" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M0,1 L8,4 L0,7 Z" fill="#eab308" />
      </marker>
      <marker id="arrowC" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M0,1 L8,4 L0,7 Z" fill="#3b82f6" />
      </marker>
      <marker id="arrowGray" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
        <path d="M0,1 L8,4 L0,7 Z" fill="#6366f1" />
      </marker>
      <style>{`
        @keyframes pulse-a { 0%,100%{opacity:0.7} 50%{opacity:1} }
        @keyframes pulse-b { 0%,100%{opacity:0.7} 33%{opacity:1} }
        @keyframes pulse-c { 0%,100%{opacity:0.7} 66%{opacity:1} }
        .ph-a { animation: pulse-a 2s ease-in-out infinite }
        .ph-b { animation: pulse-b 2s ease-in-out infinite }
        .ph-c { animation: pulse-c 2s ease-in-out infinite }
      `}</style>
    </defs>
  );
}

// Draw Star connection
function StarDiagram({ cx, cy, r, labels, voltageLabel, isSecondary }) {
  // Three terminals at 90°, 210°, 330°
  const terminals = [
    { angle: 90, label: labels[0], color: PHASE_COLORS[labels[0]], cls: 'ph-a' },
    { angle: 210, label: labels[1], color: PHASE_COLORS[labels[1]], cls: 'ph-b' },
    { angle: 330, label: labels[2], color: PHASE_COLORS[labels[2]], cls: 'ph-c' },
  ];
  return (
    <g>
      {/* Neutral */}
      <circle cx={cx} cy={cy} r={5} fill="#4b5563" stroke="#6b7280" strokeWidth={1} />
      <text x={cx + 8} y={cy + 4} fontSize={10} fill="#71717a" fontFamily="monospace">N</text>
      {terminals.map(t => {
        const tx = cx + r * Math.cos((t.angle - 90) * RAD);
        const ty = cy + r * Math.sin((t.angle - 90) * RAD);
        const mx = cx + (r * 0.45) * Math.cos((t.angle - 90) * RAD);
        const my = cy + (r * 0.45) * Math.sin((t.angle - 90) * RAD);
        const lx = cx + (r * 0.55) * Math.cos((t.angle - 90) * RAD);
        const ly = cy + (r * 0.55) * Math.sin((t.angle - 90) * RAD);
        return (
          <g key={t.label} className={t.cls}>
            <line x1={cx} y1={cy} x2={mx} y2={my} stroke={t.color} strokeWidth={2} strokeOpacity={0.3} />
            <CoilPath x1={mx} y1={my} x2={lx} y2={ly} color={t.color} turns={3} />
            <line x1={lx} y1={ly} x2={tx} y2={ty} stroke={t.color} strokeWidth={2.5} />
            <circle cx={tx} cy={ty} r={5} fill={t.color} fillOpacity={0.9} />
            <text x={tx + (tx > cx ? 10 : -10)} y={ty + (ty > cy ? 12 : -6)}
              fontSize={13} fontWeight="700" fill={t.color} fontFamily="monospace"
              textAnchor={tx > cx ? 'start' : 'end'}>{t.label}</text>
          </g>
        );
      })}
      <text x={cx} y={cy + r + 18} fontSize={11} fill="#6366f1" textAnchor="middle" fontFamily="monospace">{voltageLabel}</text>
    </g>
  );
}

// Draw Delta connection
function DeltaDiagram({ cx, cy, r, labels, voltageLabel }) {
  // Triangle: top, bottom-left, bottom-right
  const pts = [
    { x: cx, y: cy - r * 0.85, label: labels[0], color: PHASE_COLORS[labels[0]], cls: 'ph-a' },
    { x: cx - r * 0.75, y: cy + r * 0.5, label: labels[1], color: PHASE_COLORS[labels[1]], cls: 'ph-b' },
    { x: cx + r * 0.75, y: cy + r * 0.5, label: labels[2], color: PHASE_COLORS[labels[2]], cls: 'ph-c' },
  ];
  const sides = [
    { from: 0, to: 1, color: pts[0].color, cls: 'ph-a' },
    { from: 1, to: 2, color: pts[1].color, cls: 'ph-b' },
    { from: 2, to: 0, color: pts[2].color, cls: 'ph-c' },
  ];
  return (
    <g>
      {sides.map((s, i) => {
        const p1 = pts[s.from], p2 = pts[s.to];
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        const frac = 0.3;
        const q1x = p1.x + (mx - p1.x) * frac, q1y = p1.y + (my - p1.y) * frac;
        const q2x = mx + (p2.x - mx) * (1 - frac), q2y = my + (p2.y - my) * (1 - frac);
        return (
          <g key={i} className={s.cls}>
            <line x1={p1.x} y1={p1.y} x2={q1x} y2={q1y} stroke={s.color} strokeWidth={2.5} />
            <CoilPath x1={q1x} y1={q1y} x2={q2x} y2={q2y} color={s.color} turns={3} />
            <line x1={q2x} y1={q2y} x2={p2.x} y2={p2.y} stroke={s.color} strokeWidth={2.5} />
          </g>
        );
      })}
      {pts.map(pt => (
        <g key={pt.label} className={pt.cls}>
          <circle cx={pt.x} cy={pt.y} r={5} fill={pt.color} fillOpacity={0.9} />
          <text
            x={pt.x + (pt.x > cx ? 12 : pt.x < cx ? -12 : 0)}
            y={pt.y + (pt.y < cy ? -8 : 14)}
            fontSize={13} fontWeight="700" fill={pt.color} fontFamily="monospace"
            textAnchor={pt.x > cx ? 'start' : pt.x < cx ? 'end' : 'middle'}
          >{pt.label}</text>
        </g>
      ))}
      <text x={cx} y={cy + r * 0.5 + 24} fontSize={11} fill="#6366f1" textAnchor="middle" fontFamily="monospace">{voltageLabel}</text>
    </g>
  );
}

// Phasor diagram
function PhasorDiagram({ cx, cy, r, phaseShift, label, secondary }) {
  const phases = [
    { label: secondary ? 'Va' : 'VA', markerId: 'arrowA', angle: 90 + phaseShift, color: '#ef4444', cls: 'ph-a' },
    { label: secondary ? 'Vb' : 'VB', markerId: 'arrowB', angle: 90 + phaseShift - 120, color: '#eab308', cls: 'ph-b' },
    { label: secondary ? 'Vc' : 'VC', markerId: 'arrowC', angle: 90 + phaseShift + 120, color: '#3b82f6', cls: 'ph-c' },
  ];
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#27272a" strokeWidth={1} strokeDasharray="3 3" />
      <circle cx={cx} cy={cy} r={2} fill="#6366f1" />
      <text x={cx} y={cy - r - 6} fontSize={11} fill="#818cf8" textAnchor="middle" fontFamily="monospace">{label}</text>
      {phases.map(ph => {
        const ex = cx + r * Math.cos((ph.angle - 90) * RAD);
        const ey = cy + r * Math.sin((ph.angle - 90) * RAD);
        const lx = cx + (r + 14) * Math.cos((ph.angle - 90) * RAD);
        const ly = cy + (r + 14) * Math.sin((ph.angle - 90) * RAD);
        return (
          <g key={ph.label} className={ph.cls}>
            <line x1={cx} y1={cy} x2={ex} y2={ey}
              stroke={ph.color} strokeWidth={2.5} markerEnd={`url(#${ph.markerId})`} />
            <text x={lx} y={ly + 4} fontSize={10} fill={ph.color} textAnchor="middle" fontFamily="monospace">{ph.label}</text>
          </g>
        );
      })}
    </g>
  );
}

// Clock face (group number)
function ClockFace({ cx, cy, r, groupNum }) {
  const angle = 90 - groupNum * 30; // 12 o'clock is 12 (=0), clockwise
  const handX = cx + r * 0.7 * Math.cos((angle - 90) * RAD);
  const handY = cy + r * 0.7 * Math.sin((angle - 90) * RAD);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#18181b" stroke="#3f3f46" strokeWidth={1.5} />
      {[0,1,2,3,4,5,6,7,8,9,10,11].map(n => {
        const a = (90 - n * 30 - 90) * RAD;
        const tx = cx + (r - 8) * Math.cos(a);
        const ty = cy + (r - 8) * Math.sin(a);
        return <text key={n} x={tx} y={ty + 3} fontSize={7} fill={n === groupNum ? '#6366f1' : '#52525b'} textAnchor="middle" fontFamily="monospace">{n === 0 ? '12' : n}</text>;
      })}
      <circle cx={cx} cy={cy} r={3} fill="#6366f1" />
      <line x1={cx} y1={cy} x2={handX} y2={handY} stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" />
      <text x={cx} y={cy + r + 12} fontSize={10} fill="#818cf8" textAnchor="middle" fontFamily="monospace">Group {groupNum}</text>
    </g>
  );
}

function compute(conn, v1L, ratio) {
  const { primary, secondary, phaseShift } = conn;
  const n2n1 = 1 / ratio; // N2/N1

  let v1Ph, v2Ph, v2L;

  if (primary === 'Y') {
    v1Ph = v1L / sqrt3;
  } else {
    v1Ph = v1L;
  }

  v2Ph = v1Ph * n2n1;

  if (secondary === 'D') {
    v2L = v2Ph;
  } else {
    v2L = v2Ph * sqrt3;
  }

  return { v1Ph, v2Ph, v2L, phaseShift };
}

function SimView({ conn, v1L, ratio, setConnId, setV1L, setRatio }) {
  const data = useMemo(() => compute(conn, v1L, ratio), [conn, v1L, ratio]);

  const isPrimY = conn.primary === 'Y';
  const isSecY = conn.secondary === 'Y';

  const v1PhStr = fmt(data.v1Ph);
  const v2LStr = fmt(data.v2L);
  const v2PhStr = fmt(data.v2Ph);
  const v1LStr = fmt(v1L);

  return (
    <>
      <div style={S.simBody}>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 960 340" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
            <ArrowDefs />

            {/* Background sections with subtle vector group color tint */}
            <rect x={0} y={0} width={310} height={340} fill="#0d0d11" rx={0} />
            <rect x={0} y={0} width={310} height={3} fill={conn.groupColor} opacity={0.3} />
            <rect x={310} y={0} width={340} height={340} fill="#0a0a0f" rx={0} />
            <rect x={310} y={0} width={340} height={3} fill={conn.groupColor} opacity={0.2} />
            <rect x={650} y={0} width={310} height={340} fill="#0d0d11" rx={0} />
            <rect x={650} y={0} width={310} height={3} fill={conn.groupColor} opacity={0.3} />

            {/* Section labels */}
            <text x={155} y={22} fontSize={12} fill="#52525b" textAnchor="middle" fontFamily="monospace" fontWeight="600">PRIMARY ({isPrimY ? 'STAR' : 'DELTA'})</text>
            <text x={480} y={22} fontSize={12} fill="#52525b" textAnchor="middle" fontFamily="monospace" fontWeight="600">PHASORS &amp; CLOCK</text>
            <text x={805} y={22} fontSize={12} fill="#52525b" textAnchor="middle" fontFamily="monospace" fontWeight="600">SECONDARY ({isSecY ? 'STAR' : 'DELTA'})</text>

            {/* Vertical dividers */}
            <line x1={310} y1={0} x2={310} y2={340} stroke="#1e1e2e" strokeWidth={1} />
            <line x1={650} y1={0} x2={650} y2={340} stroke="#1e1e2e" strokeWidth={1} />

            {/* Primary connection diagram */}
            {isPrimY
              ? <StarDiagram cx={155} cy={175} r={100} labels={['A','B','C']} voltageLabel={`V1L = ${v1LStr}  V1φ = ${v1PhStr}`} />
              : <DeltaDiagram cx={155} cy={175} r={100} labels={['A','B','C']} voltageLabel={`V1L = ${v1LStr}  V1φ = ${v1PhStr}`} />
            }

            {/* Secondary connection diagram */}
            {isSecY
              ? <StarDiagram cx={805} cy={175} r={100} labels={['a','b','c']} voltageLabel={`V2L = ${v2LStr}  V2φ = ${v2PhStr}`} isSecondary />
              : <DeltaDiagram cx={805} cy={175} r={100} labels={['a','b','c']} voltageLabel={`V2L = ${v2LStr}  V2φ = ${v2PhStr}`} />
            }

            {/* Center: transformer core symbol */}
            <rect x={446} y={118} width={8} height={104} fill="#374151" rx={2} />
            <rect x={458} y={118} width={8} height={104} fill="#374151" rx={2} />
            {/* Primary coil left */}
            <CoilPath x1={420} y1={130} x2={446} y2={130} color="#6366f1" turns={3} />
            <CoilPath x1={420} y1={170} x2={446} y2={170} color="#6366f1" turns={3} />
            <CoilPath x1={420} y1={210} x2={446} y2={210} color="#6366f1" turns={3} />
            {/* Secondary coil right */}
            <CoilPath x1={466} y1={130} x2={492} y2={130} color="#818cf8" turns={3} />
            <CoilPath x1={466} y1={170} x2={492} y2={170} color="#818cf8" turns={3} />
            <CoilPath x1={466} y1={210} x2={492} y2={210} color="#818cf8" turns={3} />

            {/* Turns ratio label */}
            <text x={480} y={104} fontSize={11} fill="#c4b5fd" textAnchor="middle" fontFamily="monospace">N1/N2 = {ratio.toFixed(1)}</text>
            {/* Color-coded vector group badge */}
            <rect x={445} y={232} width={70} height={22} rx={6} fill={`${conn.groupColor}15`} stroke={conn.groupColor} strokeWidth={1.5} />
            <text x={480} y={247} fontSize={11} fill={conn.groupColor} textAnchor="middle" fontFamily="monospace" fontWeight={700}>{conn.label}</text>
            {/* Phase shift indicator */}
            <text x={480} y={264} fontSize={9} fill={conn.groupColor} textAnchor="middle" fontFamily="monospace" opacity={0.8}>
              {conn.phaseShift === 0 ? '0 deg shift' : `${conn.phaseShift} deg shift`}
            </text>

            {/* Connecting lines primary → core */}
            <line x1={310} y1={130} x2={420} y2={130} stroke="#374151" strokeWidth={1.5} strokeDasharray="4 2" />
            <line x1={310} y1={170} x2={420} y2={170} stroke="#374151" strokeWidth={1.5} strokeDasharray="4 2" />
            <line x1={310} y1={210} x2={420} y2={210} stroke="#374151" strokeWidth={1.5} strokeDasharray="4 2" />
            <line x1={492} y1={130} x2={650} y2={130} stroke="#374151" strokeWidth={1.5} strokeDasharray="4 2" />
            <line x1={492} y1={170} x2={650} y2={170} stroke="#374151" strokeWidth={1.5} strokeDasharray="4 2" />
            <line x1={492} y1={210} x2={650} y2={210} stroke="#374151" strokeWidth={1.5} strokeDasharray="4 2" />

            {/* Primary phasor diagram */}
            <PhasorDiagram cx={345} cy={110} r={52} phaseShift={0} label="Primary Phasors" secondary={false} />

            {/* Secondary phasor diagram */}
            <PhasorDiagram cx={345} cy={255} r={52} phaseShift={data.phaseShift} label={`Secondary (${data.phaseShift >= 0 ? '+' : ''}${data.phaseShift}°)`} secondary={true} />

            {/* Phase shift arc between diagrams */}
            {data.phaseShift !== 0 && (
              <g>
                <line x1={345} y1={162} x2={345} y2={203} stroke="#6366f1" strokeWidth={1} strokeDasharray="3 2" />
                <text x={355} y={185} fontSize={10} fill="#818cf8" fontFamily="monospace">{data.phaseShift}°</text>
              </g>
            )}

            {/* Clock face */}
            <ClockFace cx={608} cy={175} r={52} groupNum={conn.groupNum} />
          </svg>
        </div>

        {/* Controls */}
        <div style={S.controls}>
          <div style={S.cg}>
            <span style={S.label}>Connection:</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {CONNECTIONS.map(c => (
                <button key={c.id} style={{
                  padding: '5px 14px', borderRadius: 8, border: conn.id === c.id ? `2px solid ${c.groupColor}` : '2px solid transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'monospace',
                  background: conn.id === c.id ? `${c.groupColor}22` : '#1e1e2e',
                  color: conn.id === c.id ? c.groupColor : '#71717a',
                  transition: 'all 0.2s',
                  boxShadow: conn.id === c.id ? `0 0 8px ${c.groupColor}33` : 'none',
                }} onClick={() => setConnId(c.id)}>
                  {c.label}
                  <span style={{ display: 'block', fontSize: 8, color: conn.id === c.id ? c.groupColor : '#52525b', marginTop: 2 }}>
                    Group {c.groupNum}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div style={S.cg}>
            <span style={S.label}>V1L (Primary Line)</span>
            <input type="range" min={100} max={500} step={10} value={v1L} style={S.slider}
              onChange={e => setV1L(+e.target.value)} />
            <span style={S.val}>{v1L} kV</span>
          </div>
          <div style={S.cg}>
            <span style={S.label}>Turns Ratio N1/N2</span>
            <input type="range" min={0.5} max={10} step={0.1} value={ratio} style={S.slider}
              onChange={e => setRatio(+e.target.value)} />
            <span style={S.val}>{ratio.toFixed(1)}</span>
          </div>
        </div>

        {/* Results */}
        <div style={S.results}>
          {[
            { l: 'Connection', v: conn.id, c: '#c4b5fd' },
            { l: 'V1 Line', v: fmt(v1L), c: '#ef4444' },
            { l: 'V1 Phase', v: fmt(data.v1Ph), c: '#f87171' },
            { l: 'V2 Line', v: fmt(data.v2L), c: '#3b82f6' },
            { l: 'V2 Phase', v: fmt(data.v2Ph), c: '#60a5fa' },
            { l: 'Phase Shift', v: `${data.phaseShift >= 0 ? '+' : ''}${data.phaseShift}°`, c: '#818cf8' },
            { l: 'Group No.', v: conn.groupNum, c: '#a78bfa' },
            { l: 'Eff. V Ratio', v: (v1L / data.v2L).toFixed(3), c: '#34d399' },
          ].map(r => (
            <div key={r.l} style={S.ri}>
              <span style={S.rl}>{r.l}</span>
              <span style={{ ...S.rv, color: r.c }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TheoryView() {
  return (
    <div style={S.theory}>
      <div style={{ ...S.h2, marginTop: 0 }}>Three-Phase Transformer Connections</div>

      <p style={S.p}>
        Three-phase transformers are the workhorses of electric power systems. A single three-phase
        transformer unit is smaller, lighter, cheaper, and more efficient than a bank of three single-phase
        units of equivalent rating. Understanding vector group notation is essential for paralleling
        transformers and designing protection schemes.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>AP Transco Context</span>
        <p style={S.ctxP}>
          AP Transco uses Yd11 configuration for all 220/33 kV and 132/33 kV power transformers.
          The 220 kV star-connected primary winding provides a solid neutral point for earthing through
          a neutral grounding resistor or directly, while the 33 kV delta-connected secondary winding
          suppresses triplen (3rd, 9th, …) harmonic currents, preventing them from entering the
          distribution network. The "11" denotes a −30° phase displacement (secondary lags primary).
        </p>
      </div>

      {/* SVG: Connection diagrams for Yy, Yd, Dy, Dd */}
      <svg viewBox="0 0 720 360" style={{ width: '100%', maxWidth: 720, height: 'auto', margin: '16px auto', display: 'block' }}>
        <text x={360} y={18} textAnchor="middle" fill="#71717a" fontSize={11} fontWeight={600}>Standard Connection Diagrams</text>

        {/* Yy0 */}
        <rect x={10} y={30} width={170} height={140} rx={6} fill="#0d0d10" stroke="#27272a" strokeWidth={1} />
        <text x={95} y={48} textAnchor="middle" fill="#818cf8" fontSize={11} fontWeight={700}>Yy0 (0 deg)</text>
        {/* Primary Y */}
        <circle cx={55} cy={100} r={3} fill="#52525b" />
        <line x1={55} y1={100} x2={55} y2={68} stroke="#ef4444" strokeWidth={1.5} />
        <line x1={55} y1={100} x2={35} y2={130} stroke="#eab308" strokeWidth={1.5} />
        <line x1={55} y1={100} x2={75} y2={130} stroke="#3b82f6" strokeWidth={1.5} />
        <text x={55} y={63} textAnchor="middle" fill="#ef4444" fontSize={8}>A</text>
        <text x={28} y={138} textAnchor="middle" fill="#eab308" fontSize={8}>B</text>
        <text x={82} y={138} textAnchor="middle" fill="#3b82f6" fontSize={8}>C</text>
        <text x={55} y={148} textAnchor="middle" fill="#52525b" fontSize={7}>Y (Star)</text>
        {/* Secondary Y */}
        <circle cx={135} cy={100} r={3} fill="#52525b" />
        <line x1={135} y1={100} x2={135} y2={68} stroke="#ef4444" strokeWidth={1.5} />
        <line x1={135} y1={100} x2={115} y2={130} stroke="#eab308" strokeWidth={1.5} />
        <line x1={135} y1={100} x2={155} y2={130} stroke="#3b82f6" strokeWidth={1.5} />
        <text x={135} y={63} textAnchor="middle" fill="#ef4444" fontSize={8}>a</text>
        <text x={108} y={138} textAnchor="middle" fill="#eab308" fontSize={8}>b</text>
        <text x={162} y={138} textAnchor="middle" fill="#3b82f6" fontSize={8}>c</text>
        <text x={135} y={148} textAnchor="middle" fill="#52525b" fontSize={7}>y (Star)</text>
        <text x={95} y={163} textAnchor="middle" fill="#22c55e" fontSize={8} fontWeight={600}>Phase shift: 0 deg</text>

        {/* Yd11 */}
        <rect x={190} y={30} width={170} height={140} rx={6} fill="#0d0d10" stroke="#27272a" strokeWidth={1} />
        <text x={275} y={48} textAnchor="middle" fill="#818cf8" fontSize={11} fontWeight={700}>Yd11 (-30 deg)</text>
        {/* Primary Y */}
        <circle cx={235} cy={100} r={3} fill="#52525b" />
        <line x1={235} y1={100} x2={235} y2={68} stroke="#ef4444" strokeWidth={1.5} />
        <line x1={235} y1={100} x2={215} y2={130} stroke="#eab308" strokeWidth={1.5} />
        <line x1={235} y1={100} x2={255} y2={130} stroke="#3b82f6" strokeWidth={1.5} />
        <text x={235} y={63} textAnchor="middle" fill="#ef4444" fontSize={8}>A</text>
        <text x={208} y={138} textAnchor="middle" fill="#eab308" fontSize={8}>B</text>
        <text x={262} y={138} textAnchor="middle" fill="#3b82f6" fontSize={8}>C</text>
        <text x={235} y={148} textAnchor="middle" fill="#52525b" fontSize={7}>Y (Star)</text>
        {/* Secondary D (triangle) */}
        <line x1={315} y1={72} x2={295} y2={130} stroke="#ef4444" strokeWidth={1.5} />
        <line x1={295} y1={130} x2={335} y2={130} stroke="#eab308" strokeWidth={1.5} />
        <line x1={335} y1={130} x2={315} y2={72} stroke="#3b82f6" strokeWidth={1.5} />
        <circle cx={315} cy={72} r={3} fill="#ef4444" />
        <circle cx={295} cy={130} r={3} fill="#eab308" />
        <circle cx={335} cy={130} r={3} fill="#3b82f6" />
        <text x={315} y={65} textAnchor="middle" fill="#ef4444" fontSize={8}>a</text>
        <text x={288} y={138} textAnchor="middle" fill="#eab308" fontSize={8}>b</text>
        <text x={342} y={138} textAnchor="middle" fill="#3b82f6" fontSize={8}>c</text>
        <text x={315} y={148} textAnchor="middle" fill="#52525b" fontSize={7}>d (Delta)</text>
        <text x={275} y={163} textAnchor="middle" fill="#f59e0b" fontSize={8} fontWeight={600}>Phase shift: -30 deg</text>

        {/* Dy11 */}
        <rect x={370} y={30} width={170} height={140} rx={6} fill="#0d0d10" stroke="#27272a" strokeWidth={1} />
        <text x={455} y={48} textAnchor="middle" fill="#818cf8" fontSize={11} fontWeight={700}>Dy11 (-30 deg)</text>
        {/* Primary D */}
        <line x1={415} y1={72} x2={395} y2={130} stroke="#ef4444" strokeWidth={1.5} />
        <line x1={395} y1={130} x2={435} y2={130} stroke="#eab308" strokeWidth={1.5} />
        <line x1={435} y1={130} x2={415} y2={72} stroke="#3b82f6" strokeWidth={1.5} />
        <circle cx={415} cy={72} r={3} fill="#ef4444" />
        <circle cx={395} cy={130} r={3} fill="#eab308" />
        <circle cx={435} cy={130} r={3} fill="#3b82f6" />
        <text x={415} y={65} textAnchor="middle" fill="#ef4444" fontSize={8}>A</text>
        <text x={388} y={138} textAnchor="middle" fill="#eab308" fontSize={8}>B</text>
        <text x={442} y={138} textAnchor="middle" fill="#3b82f6" fontSize={8}>C</text>
        <text x={415} y={148} textAnchor="middle" fill="#52525b" fontSize={7}>D (Delta)</text>
        {/* Secondary Y */}
        <circle cx={495} cy={100} r={3} fill="#52525b" />
        <line x1={495} y1={100} x2={495} y2={68} stroke="#ef4444" strokeWidth={1.5} />
        <line x1={495} y1={100} x2={475} y2={130} stroke="#eab308" strokeWidth={1.5} />
        <line x1={495} y1={100} x2={515} y2={130} stroke="#3b82f6" strokeWidth={1.5} />
        <text x={495} y={63} textAnchor="middle" fill="#ef4444" fontSize={8}>a</text>
        <text x={468} y={138} textAnchor="middle" fill="#eab308" fontSize={8}>b</text>
        <text x={522} y={138} textAnchor="middle" fill="#3b82f6" fontSize={8}>c</text>
        <text x={495} y={148} textAnchor="middle" fill="#52525b" fontSize={7}>y (Star)</text>
        <text x={455} y={163} textAnchor="middle" fill="#f59e0b" fontSize={8} fontWeight={600}>Phase shift: -30 deg</text>

        {/* Dd0 */}
        <rect x={550} y={30} width={160} height={140} rx={6} fill="#0d0d10" stroke="#27272a" strokeWidth={1} />
        <text x={630} y={48} textAnchor="middle" fill="#818cf8" fontSize={11} fontWeight={700}>Dd0 (0 deg)</text>
        {/* Primary D */}
        <line x1={595} y1={72} x2={575} y2={130} stroke="#ef4444" strokeWidth={1.5} />
        <line x1={575} y1={130} x2={615} y2={130} stroke="#eab308" strokeWidth={1.5} />
        <line x1={615} y1={130} x2={595} y2={72} stroke="#3b82f6" strokeWidth={1.5} />
        <circle cx={595} cy={72} r={3} fill="#ef4444" />
        <circle cx={575} cy={130} r={3} fill="#eab308" />
        <circle cx={615} cy={130} r={3} fill="#3b82f6" />
        <text x={595} y={65} textAnchor="middle" fill="#ef4444" fontSize={8}>A</text>
        <text x={568} y={138} textAnchor="middle" fill="#eab308" fontSize={8}>B</text>
        <text x={622} y={138} textAnchor="middle" fill="#3b82f6" fontSize={8}>C</text>
        <text x={595} y={148} textAnchor="middle" fill="#52525b" fontSize={7}>D</text>
        {/* Secondary D */}
        <line x1={665} y1={72} x2={645} y2={130} stroke="#ef4444" strokeWidth={1.5} />
        <line x1={645} y1={130} x2={685} y2={130} stroke="#eab308" strokeWidth={1.5} />
        <line x1={685} y1={130} x2={665} y2={72} stroke="#3b82f6" strokeWidth={1.5} />
        <circle cx={665} cy={72} r={3} fill="#ef4444" />
        <circle cx={645} cy={130} r={3} fill="#eab308" />
        <circle cx={685} cy={130} r={3} fill="#3b82f6" />
        <text x={665} y={65} textAnchor="middle" fill="#ef4444" fontSize={8}>a</text>
        <text x={638} y={138} textAnchor="middle" fill="#eab308" fontSize={8}>b</text>
        <text x={692} y={138} textAnchor="middle" fill="#3b82f6" fontSize={8}>c</text>
        <text x={665} y={148} textAnchor="middle" fill="#52525b" fontSize={7}>d</text>
        <text x={630} y={163} textAnchor="middle" fill="#22c55e" fontSize={8} fontWeight={600}>Phase shift: 0 deg</text>

        {/* Vector Group Notation Explanation */}
        <rect x={10} y={185} width={700} height={165} rx={8} fill="#0d0d10" stroke="#27272a" strokeWidth={1} />
        <text x={360} y={205} textAnchor="middle" fill="#818cf8" fontSize={11} fontWeight={700}>Vector Group Notation (IEC 60076)</text>

        {/* Notation breakdown */}
        <rect x={30} y={220} width={660} height={50} rx={6} fill="#18181b" stroke="#27272a" strokeWidth={0.5} />
        {/* Example: Yd11 */}
        <text x={80} y={238} fill="#6366f1" fontSize={22} fontWeight={700} fontFamily="monospace">Y</text>
        <text x={110} y={238} fill="#f59e0b" fontSize={22} fontWeight={700} fontFamily="monospace">d</text>
        <text x={140} y={238} fill="#22c55e" fontSize={22} fontWeight={700} fontFamily="monospace">11</text>

        <line x1={85} y1={244} x2={85} y2={262} stroke="#6366f1" strokeWidth={1} />
        <text x={85} y={258} textAnchor="middle" fill="#6366f1" fontSize={8}>Primary winding</text>
        <text x={85} y={268} textAnchor="middle" fill="#6366f1" fontSize={7}>(CAPITAL = HV)</text>

        <line x1={115} y1={244} x2={115} y2={262} stroke="#f59e0b" strokeWidth={1} />
        <text x={115} y={258} textAnchor="middle" fill="#f59e0b" fontSize={8}>Secondary winding</text>
        <text x={115} y={268} textAnchor="middle" fill="#f59e0b" fontSize={7}>(lowercase = LV)</text>

        <line x1={148} y1={244} x2={148} y2={262} stroke="#22c55e" strokeWidth={1} />
        <text x={148} y={258} textAnchor="middle" fill="#22c55e" fontSize={8}>Clock number</text>
        <text x={148} y={268} textAnchor="middle" fill="#22c55e" fontSize={7}>(x30 deg shift)</text>

        {/* Symbols explanation */}
        <text x={260} y={238} fill="#a1a1aa" fontSize={9}>Y/y = Star    D/d = Delta    Z/z = Zigzag</text>
        <text x={260} y={252} fill="#a1a1aa" fontSize={9}>Clock 0 = 0 deg    Clock 1 = +30 deg    Clock 11 = -30 deg    Clock 6 = 180 deg</text>

        {/* Clock diagram mini */}
        <circle cx={600} cy={240} r={25} fill="#18181b" stroke="#3f3f46" strokeWidth={1} />
        <text x={600} y={222} textAnchor="middle" fill="#52525b" fontSize={7}>12</text>
        <text x={625} y={244} textAnchor="middle" fill="#52525b" fontSize={7}>3</text>
        <text x={600} y={264} textAnchor="middle" fill="#52525b" fontSize={7}>6</text>
        <text x={575} y={244} textAnchor="middle" fill="#52525b" fontSize={7}>9</text>
        {/* Hand pointing to 11 */}
        <line x1={600} y1={240} x2={590} y2={223} stroke="#6366f1" strokeWidth={2} strokeLinecap="round" />
        <circle cx={600} cy={240} r={3} fill="#6366f1" />
        <text x={600} y={278} textAnchor="middle" fill="#818cf8" fontSize={8}>Group 11</text>

        {/* Phasor comparison */}
        <rect x={430} y={290} width={270} height={50} rx={5} fill="rgba(99,102,241,0.05)" stroke="#27272a" strokeWidth={0.5} />
        <text x={565} y={308} textAnchor="middle" fill="#818cf8" fontSize={9} fontWeight={600}>Phase Shift Rule</text>
        <text x={565} y={322} textAnchor="middle" fill="#a1a1aa" fontSize={8}>Yd11 (-30°) and Dy11 (+30°) can be paired so their shifts cancel; aligning identical numbers keeps zero net distortion.</text>
        <text x={565} y={334} textAnchor="middle" fill="#a1a1aa" fontSize={8}>Yd11 + Yd11 in parallel = OK (same group)</text>
      </svg>

      <div style={S.h3}>Star (Y) vs Delta (D) Connections</div>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Property</th>
            <th style={S.th}>Star (Y)</th>
            <th style={S.th}>Delta (D)</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Phase voltage', 'VL / √3', 'VL'],
            ['Phase current', 'IL (= line current)', 'IL / √3'],
            ['Neutral point', 'Available', 'Not available'],
            ['Insulation req.', 'Lower (1/√3 of line)', 'Full line voltage'],
            ['Harmonic path', 'None for 3rd harmonics', 'Closed path — suppresses 3rd harmonics'],
          ].map(([a, b, c]) => (
            <tr key={a}>
              <td style={S.td}>{a}</td>
              <td style={{ ...S.td, color: '#c4b5fd', fontFamily: 'monospace' }}>{b}</td>
              <td style={{ ...S.td, color: '#c4b5fd', fontFamily: 'monospace' }}>{c}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.h3}>Voltage Transformation Equations</div>
      <span style={S.eq}>Yd: V2L = V1L × (N2/N1)  [delta secondary: VL = Vφ]</span>
      <span style={S.eq}>Dy: V2L = V1L × (N2/N1) × √3  [star secondary: VL = √3·Vφ]</span>
      <span style={S.eq}>Dd: V2L = V1L × (N2/N1)  [both delta: VL = Vφ]</span>
      <span style={S.eq}>Yy: V2L = V1L × (N2/N1)  [both star: √3 factors cancel]</span>
      <p style={S.p}>
        The slider controls the per-phase turns ratio. Whenever a star winding participates, convert the per-phase voltage to line voltage with a √3 factor to match the nameplate line-to-line ratio.
      </p>

      <div style={S.h3}>IEC 60076 Vector Group Notation</div>
      <p style={S.p}>
        The vector group is written as: <strong style={{ color: '#c4b5fd' }}>Primary symbol – Secondary symbol – Clock number</strong>.
        Capital letters (Y, D, Z) denote the primary; lowercase (y, d, z) the secondary.
        The clock number (0–11) indicates the phase displacement of the secondary with respect to
        the primary, measured in multiples of 30°. Clock 11 = −30° (secondary lags primary by 30°);
        Clock 1 = +30° (secondary leads); Clock 0 = 0°.
      </p>

      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Group</th>
            <th style={S.th}>Phase Shift</th>
            <th style={S.th}>Common Types</th>
            <th style={S.th}>Typical Use</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['0', '0°', 'Yy0, Dd0, Dz0', 'Distribution, industrial'],
            ['6', '±180°', 'Yy6, Dd6', 'Special applications'],
            ['1', '+30°', 'Yd1, Dy1', 'Phase advancing'],
            ['11', '±30° (orientation)', 'Yd11, Dy11, Yz11', 'Transmission, earthing transformer'],
          ].map(([g, s, t, u]) => (
            <tr key={g}>
              <td style={{ ...S.td, color: '#818cf8', fontFamily: 'monospace', fontWeight: 700 }}>{g}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{s}</td>
              <td style={{ ...S.td, color: '#c4b5fd', fontFamily: 'monospace' }}>{t}</td>
              <td style={S.td}>{u}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.h3}>Why Yd11 / Dy11 is Most Common for Transmission</div>
      <ul style={S.ul}>
        <li style={S.li}>The delta winding circulates 3rd-harmonic magnetising current so the output voltage remains sinusoidal even under saturation.</li>
        <li style={S.li}>The star winding gives a convenient neutral that engineers often earth for protection at EHV substations, though the grounding method always follows the wider system design.</li>
        <li style={S.li}>Yd11’s −30° shift can be canceled by Dy11’s +30° when the two stages are paired correctly, keeping the consumer-side phasors aligned.</li>
        <li style={S.li}>Two Yd11 transformers share the same vector group and phase shift, so they can parallel without any correction.</li>
      </ul>

      <div style={S.h3}>Parallel Operation Requirements</div>
      <div style={S.ctx}>
        <span style={S.ctxT}>Critical Rule</span>
        <p style={S.ctxP}>
          Transformers can be paralleled ONLY if they have the same vector group number (same phase shift),
          the same voltage ratio, and the same per-unit impedance. Connecting Yd11 in parallel with Yy0
          would create a 30° phase difference, driving a circulating current of ≈ sin(15°)/Zpu ≈ several
          times rated current — causing immediate damage.
        </p>
      </div>

      <div style={S.h3}>Harmonic Suppression in Delta Winding</div>
      <p style={S.p}>
        Transformer core non-linearity generates 3rd harmonic magnetising currents (150 Hz in a 50 Hz system).
        In a star winding, these triplen harmonics are co-phasal (all three phases in phase) and cannot flow
        in the line — they appear as voltage distortion. In a delta winding, the three co-phasal voltages
        drive a circulating current around the closed delta loop, dissipating the harmonics internally and
        producing a clean sinusoidal output voltage. This is why any transformer connected to an EHV grid
        always has at least one delta winding.
      </p>

      <div style={S.h3}>References</div>
      <ul style={S.ul}>
        <li style={S.li}>IS 2026 / IEC 60076 — Power Transformers (Parts 1–5)</li>
        <li style={S.li}>Chapman, S.J. — <em>Electric Machinery Fundamentals</em>, 5th ed., McGraw-Hill</li>
        <li style={S.li}>Glover, Sarma, Overbye — <em>Power Systems Analysis and Design</em>, 5th ed.</li>
        <li style={S.li}>AP Transco Technical Specifications for EHV Transformers (2022)</li>
      </ul>
    </div>
  );
}

export default function ThreePhaseTransformerConnections() {
  const [activeTab, setActiveTab] = useState('sim');
  const [connId, setConnId] = useState('Yd11');
  const [v1L, setV1L] = useState(220);
  const [ratio, setRatio] = useState(4);

  const conn = CONNECTIONS.find(c => c.id === connId);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        {['sim', 'theory'].map(t => (
          <button key={t} style={S.tab(activeTab === t)} onClick={() => setActiveTab(t)}>
            {t === 'sim' ? 'Simulation' : 'Theory'}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#3f3f46', alignSelf: 'center' }}>
          #17 — Three-Phase Transformer Connections
        </span>
      </div>

      {activeTab === 'sim' ? (
        <SimView conn={conn} v1L={v1L} ratio={ratio} setConnId={setConnId} setV1L={setV1L} setRatio={setRatio} />
      ) : (
        <TheoryView />
      )}
    </div>
  );
}
