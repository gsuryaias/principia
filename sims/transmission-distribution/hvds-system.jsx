import React, { useState, useMemo, useCallback, useEffect } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '16px 16px 0', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 130, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 50, textAlign: 'right' },
  results: { display: 'flex', gap: 32, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  sel: { padding: '4px 10px', borderRadius: 8, border: '1px solid #3f3f46', background: '#18181b', color: '#e4e4e7', fontSize: 13, cursor: 'pointer', outline: 'none' },
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

const SQRT3 = Math.sqrt(3);
const COND = {
  dog:    { name: 'ACSR Dog',    rLT: 0.379, rHT: 0.379 },
  weasel: { name: 'ACSR Weasel', rLT: 1.182, rHT: 0.379 },
  abc:    { name: 'LT ABC',     rLT: 0.641, rHT: 0.379 },
};

function vColor(v) {
  if (v >= 390) return '#22c55e';
  if (v >= 370) return '#eab308';
  return '#ef4444';
}

function compute(numC, totalKW, ltLen, pf, condKey) {
  const c = COND[condKey];
  const perConsumer = totalKW / numC;

  const iLT = totalKW * 1000 / (SQRT3 * 415 * pf);
  const iHT = totalKW * 1000 / (SQRT3 * 11000 * pf);

  const lossLVDS = 3 * iLT * iLT * c.rLT * (ltLen / 1000);
  const lossLVDS_kW = lossLVDS / 1000;
  const lossLVDS_pct = (lossLVDS_kW / totalKW) * 100;

  const numDTR = Math.ceil(numC / 4);
  const htLen = ltLen * 0.85;
  const shortLT = 75;
  const perDTR_kW = totalKW / numDTR;
  const iHT_sec = perDTR_kW * 1000 / (SQRT3 * 11000 * pf);
  const lossHT = 3 * iHT * iHT * c.rHT * (htLen / 1000);
  const iLT_short = perDTR_kW * 1000 / (SQRT3 * 415 * pf);
  const lossLT_short = numDTR * 3 * iLT_short * iLT_short * c.rLT * (shortLT / 1000);
  const lossHVDS_kW = (lossHT + lossLT_short) / 1000;
  const lossHVDS_pct = (lossHVDS_kW / totalKW) * 100;

  const reduction = lossLVDS_kW > 0 ? ((lossLVDS_kW - lossHVDS_kW) / lossLVDS_kW) * 100 : 0;

  const sections = 10;
  const vProfileLVDS = [];
  const vProfileHVDS = [];
  for (let i = 0; i <= sections; i++) {
    const frac = i / sections;
    const dist = frac * ltLen;
    const loadFrac = 1 - frac * 0.5;
    const iSec = iLT * loadFrac;
    const dropSec = SQRT3 * iSec * c.rLT * (dist / 1000) * 0.3;
    const vLVDS = Math.max(300, 415 - dropSec);
    vProfileLVDS.push({ dist, v: vLVDS });

    const dropHT = SQRT3 * iHT * c.rHT * (dist / 1000) * 0.3;
    const vHVDS = Math.max(390, 415 - dropHT - 2);
    vProfileHVDS.push({ dist, v: vHVDS });
  }

  const tailLVDS = vProfileLVDS[sections].v;
  const tailHVDS = vProfileHVDS[sections].v;

  const costLVDS = 100;
  const costHVDS = 100 + numDTR * 8 + (htLen / 1000) * 15;
  const costRatio = costHVDS / costLVDS;

  return {
    iLT, iHT, lossLVDS_kW, lossLVDS_pct, lossHVDS_kW, lossHVDS_pct,
    reduction, tailLVDS, tailHVDS, numDTR, vProfileLVDS, vProfileHVDS,
    perConsumer, costRatio, shortLT,
  };
}

function House({ x, y, voltage, scale = 1 }) {
  const c = vColor(voltage);
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <polygon points="-6,-8 0,-14 6,-8" fill={c} opacity={0.8} />
      <rect x={-5} y={-8} width={10} height={10} fill={c} opacity={0.6} rx={1} />
      <rect x={-2} y={-2} width={4} height={4} fill="#09090b" rx={0.5} />
      <text y={14} textAnchor="middle" fontSize={7} fill={c} fontFamily="monospace" fontWeight={600}>{Math.round(voltage)}V</text>
    </g>
  );
}

function Transformer({ x, y, label, size = 'large' }) {
  const r = size === 'large' ? 14 : 9;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="none" stroke="#6366f1" strokeWidth={2} />
      <circle cx={x} cy={y + r * 0.6} r={r * 0.7} fill="none" stroke="#818cf8" strokeWidth={1.5} />
      <text x={x} y={y - r - 4} textAnchor="middle" fontSize={size === 'large' ? 8 : 6.5} fill="#a1a1aa" fontWeight={600}>{label}</text>
    </g>
  );
}

function FlowDots({ x1, y1, x2, y2, count, speed, color, tick }) {
  const dots = [];
  for (let i = 0; i < count; i++) {
    const t = ((tick * speed + i / count) % 1);
    const cx = x1 + (x2 - x1) * t;
    const cy = y1 + (y2 - y1) * t;
    dots.push(<circle key={i} cx={cx} cy={cy} r={2.5} fill={color} opacity={0.7 + 0.3 * Math.sin(t * Math.PI)} />);
  }
  return <>{dots}</>;
}

function LVDSDiagram({ data, numC, ltLen, tick }) {
  const W = 380, H = 420;
  const txY = 55, lineStartY = txY + 35;
  const lineEndY = H - 30;
  const lineLen = lineEndY - lineStartY;
  const consumers = [];
  const spacing = lineLen / (numC + 1);

  for (let i = 1; i <= numC; i++) {
    const frac = i / numC;
    const v = data.vProfileLVDS[Math.min(Math.round(frac * 10), 10)].v;
    const cy = lineStartY + i * spacing;
    const side = i % 2 === 0 ? 1 : -1;
    consumers.push({ x: W / 2 + side * 55, y: cy, v, i: i });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <defs>
        <linearGradient id="lt-wire" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <text x={W / 2} y={14} textAnchor="middle" fontSize={13} fontWeight={700} fill="#f4f4f5">LVDS — Conventional</text>

      <line x1={W / 2} y1={22} x2={W / 2} y2={txY - 18} stroke="#6366f1" strokeWidth={2} />
      <text x={W / 2 + 14} y={38} fontSize={8} fill="#818cf8" fontWeight={600}>11 kV</text>
      <FlowDots x1={W / 2} y1={22} x2={W / 2} y2={txY - 18} count={2} speed={0.008} color="#818cf8" tick={tick} />

      <Transformer x={W / 2} y={txY} label="100 kVA DTR" size="large" />

      <line x1={W / 2} y1={lineStartY} x2={W / 2} y2={lineEndY} stroke="url(#lt-wire)" strokeWidth={4} strokeLinecap="round" />
      <FlowDots x1={W / 2} y1={lineStartY} x2={W / 2} y2={lineEndY} count={Math.min(numC, 18)} speed={0.015} color="#fbbf24" tick={tick} />

      <text x={W / 2 + 18} y={lineStartY + 10} fontSize={7} fill="#71717a">415V LT ({ltLen}m)</text>
      <text x={W / 2 + 18} y={lineStartY + 22} fontSize={7} fill="#ef4444">I = {data.iLT.toFixed(1)} A</text>

      {consumers.map((c, idx) => {
        const side = c.x > W / 2 ? 1 : -1;
        return (
          <g key={idx}>
            <line x1={W / 2} y1={c.y} x2={c.x - side * 8} y2={c.y} stroke="#3f3f46" strokeWidth={1} strokeDasharray="3,2" />
            <House x={c.x} y={c.y} voltage={c.v} scale={0.85} />
          </g>
        );
      })}

      <g transform={`translate(${W / 2 - 60},${lineEndY - 40})`}>
        <rect x={0} y={0} width={50} height={18} rx={4} fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth={0.5} />
        <text x={25} y={12} textAnchor="middle" fontSize={7} fill="#ef4444" fontWeight={600}>Theft Easy</text>
      </g>

      <rect x={12} y={H - 22} width={W - 24} height={18} rx={6} fill="#18181b" stroke="#27272a" strokeWidth={1} />
      <rect x={12} y={H - 22} width={Math.min((W - 24) * data.lossLVDS_pct / 25, W - 24)} height={18} rx={6} fill="rgba(239,68,68,0.3)" />
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize={9} fill="#fca5a5" fontWeight={600}>Loss: {data.lossLVDS_kW.toFixed(1)} kW ({data.lossLVDS_pct.toFixed(1)}%)</text>
    </svg>
  );
}

function HVDSDiagram({ data, numC, ltLen, tick }) {
  const W = 380, H = 420;
  const htLineY1 = 22, htLineY2 = H - 60;
  const htLen = ltLen * 0.85;
  const numDTR = data.numDTR;
  const dtrSpacing = (htLineY2 - htLineY1 - 40) / (numDTR + 1);
  const consumersPerDTR = Math.ceil(numC / numDTR);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      <text x={W / 2} y={14} textAnchor="middle" fontSize={13} fontWeight={700} fill="#f4f4f5">HVDS — Modern</text>

      <line x1={70} y1={htLineY1} x2={70} y2={htLineY2} stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" />
      <FlowDots x1={70} y1={htLineY1} x2={70} y2={htLineY2} count={3} speed={0.005} color="#818cf8" tick={tick} />
      <text x={56} y={htLineY1 + 15} fontSize={8} fill="#818cf8" fontWeight={600} textAnchor="end">11 kV</text>
      <text x={56} y={htLineY1 + 27} fontSize={7} fill="#6366f1" textAnchor="end">HT Line</text>
      <text x={56} y={htLineY1 + 38} fontSize={6} fill="#52525b" textAnchor="end">I = {data.iHT.toFixed(2)} A</text>

      {Array.from({ length: numDTR }).map((_, d) => {
        const dtrY = htLineY1 + 40 + d * dtrSpacing;
        const nc = d < numDTR - 1 ? consumersPerDTR : numC - d * consumersPerDTR;
        const actualNC = Math.max(1, Math.min(nc, consumersPerDTR));
        const vIdx = Math.min(Math.round(((d + 0.5) / numDTR) * 10), 10);
        const baseV = data.vProfileHVDS[vIdx].v;

        return (
          <g key={d}>
            <line x1={70} y1={dtrY} x2={105} y2={dtrY} stroke="#6366f1" strokeWidth={1.5} />
            <Transformer x={120} y={dtrY} label={`${Math.round(data.perConsumer * actualNC / 5) * 5 || 16} kVA`} size="small" />

            <line x1={135} y1={dtrY} x2={175} y2={dtrY} stroke="#f59e0b" strokeWidth={2} />
            <text x={155} y={dtrY - 6} fontSize={5.5} fill="#71717a" textAnchor="middle">{data.shortLT}m</text>

            {Array.from({ length: Math.min(actualNC, 5) }).map((_, ci) => {
              const cx = 185 + ci * 38;
              const v = baseV - ci * 0.8;
              return (
                <g key={ci}>
                  <line x1={ci === 0 ? 175 : 185 + (ci - 1) * 38 + 6} y1={dtrY} x2={cx - 6} y2={dtrY} stroke="#3f3f46" strokeWidth={0.8} strokeDasharray="2,2" />
                  <House x={cx} y={dtrY} voltage={v} scale={0.75} />
                </g>
              );
            })}
            <FlowDots x1={135} y1={dtrY} x2={175} y2={dtrY} count={2} speed={0.012} color="#fbbf24" tick={tick} />
          </g>
        );
      })}

      <g transform={`translate(${200},${htLineY2 - 15})`}>
        <rect x={0} y={0} width={65} height={18} rx={4} fill="rgba(34,197,94,0.12)" stroke="#22c55e" strokeWidth={0.5} />
        <text x={32.5} y={12} textAnchor="middle" fontSize={7} fill="#22c55e" fontWeight={600}>Theft Difficult</text>
      </g>

      <rect x={12} y={H - 22} width={W - 24} height={18} rx={6} fill="#18181b" stroke="#27272a" strokeWidth={1} />
      <rect x={12} y={H - 22} width={Math.min((W - 24) * data.lossHVDS_pct / 25, W - 24)} height={18} rx={6} fill="rgba(34,197,94,0.3)" />
      <text x={W / 2} y={H - 10} textAnchor="middle" fontSize={9} fill="#86efac" fontWeight={600}>Loss: {data.lossHVDS_kW.toFixed(1)} kW ({data.lossHVDS_pct.toFixed(1)}%)</text>
    </svg>
  );
}

function VoltageChart({ data, ltLen }) {
  const W = 780, H = 200, PL = 60, PR = 30, PT = 20, PB = 40;
  const cw = W - PL - PR, ch = H - PT - PB;
  const vMin = 320, vMax = 420;

  const toX = (d) => PL + (d / ltLen) * cw;
  const toY = (v) => PT + ((vMax - v) / (vMax - vMin)) * ch;

  const pathLVDS = data.vProfileLVDS.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.dist).toFixed(1)},${toY(p.v).toFixed(1)}`).join(' ');
  const pathHVDS = data.vProfileHVDS.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p.dist).toFixed(1)},${toY(p.v).toFixed(1)}`).join(' ');
  const minLine = toY(390);
  const nomLine = toY(415);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ maxWidth: W }}>
      <rect x={PL} y={PT} width={cw} height={ch} fill="#0c0c0f" rx={4} />
      {[340, 360, 380, 400, 420].map(v => (
        <g key={v}>
          <line x1={PL} y1={toY(v)} x2={PL + cw} y2={toY(v)} stroke="#1e1e2e" strokeWidth={1} />
          <text x={PL - 6} y={toY(v) + 4} textAnchor="end" fontSize={9} fill="#52525b">{v}V</text>
        </g>
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map(f => (
        <text key={f} x={toX(f * ltLen)} y={H - PB + 18} textAnchor="middle" fontSize={9} fill="#52525b">{Math.round(f * ltLen)}m</text>
      ))}

      <line x1={PL} y1={minLine} x2={PL + cw} y2={minLine} stroke="#ef4444" strokeWidth={1} strokeDasharray="6,3" opacity={0.6} />
      <text x={PL + cw + 4} y={minLine + 4} fontSize={8} fill="#ef4444">390V min</text>

      <line x1={PL} y1={nomLine} x2={PL + cw} y2={nomLine} stroke="#22c55e" strokeWidth={1} strokeDasharray="4,3" opacity={0.4} />
      <text x={PL + cw + 4} y={nomLine + 4} fontSize={8} fill="#22c55e">415V</text>

      <path d={pathLVDS} fill="none" stroke="#ef4444" strokeWidth={2.5} strokeLinejoin="round" />
      <path d={pathHVDS} fill="none" stroke="#22c55e" strokeWidth={2.5} strokeLinejoin="round" />

      <rect x={PL + 10} y={PT + 6} width={12} height={3} rx={1} fill="#ef4444" />
      <text x={PL + 26} y={PT + 10} fontSize={9} fill="#a1a1aa">LVDS</text>
      <rect x={PL + 62} y={PT + 6} width={12} height={3} rx={1} fill="#22c55e" />
      <text x={PL + 78} y={PT + 10} fontSize={9} fill="#a1a1aa">HVDS</text>

      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="#71717a">Distance from Substation (m)</text>
      <text x={14} y={H / 2} textAnchor="middle" fontSize={10} fill="#71717a" transform={`rotate(-90,14,${H / 2})`}>Voltage (V)</text>
    </svg>
  );
}

function CurrentCallout({ data }) {
  const ratio = (data.iLT / data.iHT);
  const lossRatio = ratio * ratio;
  return (
    <div style={{ display: 'flex', gap: 16, padding: '10px 24px', background: '#111118', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: 'rgba(239,68,68,0.08)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)' }}>
        <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>LT Current</span>
        <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: '#fca5a5' }}>{data.iLT.toFixed(1)} A</span>
      </div>
      <div style={{ fontSize: 18, color: '#52525b' }}>vs</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: 'rgba(34,197,94,0.08)', borderRadius: 10, border: '1px solid rgba(34,197,94,0.2)' }}>
        <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>HT Current</span>
        <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: '#86efac' }}>{data.iHT.toFixed(2)} A</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(99,102,241,0.1)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.25)' }}>
        <span style={{ fontSize: 11, color: '#818cf8', fontWeight: 600 }}>I² Ratio</span>
        <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: '#c4b5fd' }}>{lossRatio.toFixed(0)}×</span>
        <span style={{ fontSize: 10, color: '#6366f1' }}>more loss at LT</span>
      </div>
    </div>
  );
}

function SimTab({ numC, totalKW, ltLen, pf, condKey, setNumC, setTotalKW, setLtLen, setPf, setCondKey }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  const data = useMemo(() => compute(numC, totalKW, ltLen, pf, condKey), [numC, totalKW, ltLen, pf, condKey]);

  const cappedNumC = Math.min(numC, 25);

  return (
    <div style={S.simBody}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, padding: '4px 16px', overflow: 'auto' }}>
        <LVDSDiagram data={data} numC={cappedNumC} ltLen={ltLen} tick={tick} />
        <HVDSDiagram data={data} numC={cappedNumC} ltLen={ltLen} tick={tick} />
      </div>

      <div style={{ padding: '4px 16px', display: 'flex', justifyContent: 'center' }}>
        <VoltageChart data={data} ltLen={ltLen} />
      </div>

      <CurrentCallout data={data} />

      <div style={S.controls}>
        <div style={S.cg}>
          <span style={S.label}>Consumers</span>
          <input type="range" min={10} max={50} value={numC} onChange={e => setNumC(+e.target.value)} style={S.slider} />
          <span style={S.val}>{numC}</span>
        </div>
        <div style={S.cg}>
          <span style={S.label}>Total Load</span>
          <input type="range" min={50} max={500} step={10} value={totalKW} onChange={e => setTotalKW(+e.target.value)} style={S.slider} />
          <span style={S.val}>{totalKW} kW</span>
        </div>
        <div style={S.cg}>
          <span style={S.label}>LT Length</span>
          <input type="range" min={300} max={2000} step={50} value={ltLen} onChange={e => setLtLen(+e.target.value)} style={S.slider} />
          <span style={S.val}>{ltLen} m</span>
        </div>
        <div style={S.cg}>
          <span style={S.label}>Power Factor</span>
          <input type="range" min={70} max={99} value={Math.round(pf * 100)} onChange={e => setPf(+e.target.value / 100)} style={S.slider} />
          <span style={S.val}>{pf.toFixed(2)}</span>
        </div>
        <div style={S.cg}>
          <span style={S.label}>Conductor</span>
          <select value={condKey} onChange={e => setCondKey(e.target.value)} style={S.sel}>
            {Object.entries(COND).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </div>
      </div>

      <div style={S.results}>
        <div style={S.ri}>
          <span style={S.rl}>LVDS Loss</span>
          <span style={{ ...S.rv, color: '#fca5a5' }}>{data.lossLVDS_kW.toFixed(2)} kW ({data.lossLVDS_pct.toFixed(1)}%)</span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>HVDS Loss</span>
          <span style={{ ...S.rv, color: '#86efac' }}>{data.lossHVDS_kW.toFixed(2)} kW ({data.lossHVDS_pct.toFixed(1)}%)</span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>Loss Reduction</span>
          <span style={{ ...S.rv, color: '#c4b5fd' }}>{data.reduction.toFixed(1)}%</span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>LVDS Tail Voltage</span>
          <span style={{ ...S.rv, color: vColor(data.tailLVDS) }}>{data.tailLVDS.toFixed(0)} V</span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>HVDS Tail Voltage</span>
          <span style={{ ...S.rv, color: vColor(data.tailHVDS) }}>{data.tailHVDS.toFixed(0)} V</span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>Capital Cost</span>
          <span style={{ ...S.rv, color: '#a1a1aa' }}>HVDS {data.costRatio.toFixed(1)}× LVDS</span>
        </div>
      </div>
    </div>
  );
}

function TheoryTab() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>HVDS — High Voltage Distribution System</h2>

      <h2 style={S.h2}>1. Why India's LT Lines Have High Losses</h2>
      <p style={S.p}>
        In the conventional Indian distribution system, a single large distribution transformer (100–250 kVA) receives power at 11 kV and steps it down to 415 V (three-phase) / 240 V (single-phase). From this transformer, low-tension (LT) lines made of bare ACSR conductor extend 500 m to 2 km to reach scattered rural consumers.
      </p>
      <p style={S.p}>
        The fundamental problem is <strong style={{ color: '#f4f4f5' }}>current magnitude</strong>. For the same power delivered, current at 415 V is dramatically higher than at 11 kV:
      </p>
      <span style={S.eq}>I = P / (√3 × V × cos φ)</span>
      <span style={S.eq}>At 415 V: I_LT = P / (√3 × 415 × cos φ)  ≈  P / 574.6</span>
      <span style={S.eq}>At 11,000 V: I_HT = P / (√3 × 11000 × cos φ)  ≈  P / 15242</span>
      <span style={S.eq}>Ratio: I_LT / I_HT = 11000 / 415 ≈ 26.5×</span>
      <p style={S.p}>
        Since resistive losses scale with the <strong style={{ color: '#f4f4f5' }}>square</strong> of current (P_loss = I²R), the loss ratio becomes:
      </p>
      <span style={S.eq}>(I_LT / I_HT)² = (11000 / 415)² ≈ 703×</span>
      <p style={S.p}>
        This means that for every unit length of conductor carrying the same power, <strong style={{ color: '#ef4444' }}>LT lines have ~700 times the I²R loss</strong> compared to HT lines. Combined with long LT line lengths (1–2 km), the losses become enormous.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>India's Distribution Loss Reality</span>
        <p style={S.ctxP}>
          Rural India averages 30–40% AT&C (Aggregate Technical & Commercial) losses in many DISCOMs. Of these, LT technical losses account for 60–70% of total technical losses. The remaining includes theft facilitated by long exposed bare LT conductors — a thief simply hooks a wire onto the bare conductor at any accessible point.
        </p>
      </div>

      <h2 style={S.h2}>2. The HVDS Concept</h2>
      <p style={S.p}>
        HVDS (High Voltage Distribution System) is a re-engineering of the last-mile distribution network. The core idea is simple: <strong style={{ color: '#f4f4f5' }}>extend the 11 kV HT line as close to consumers as possible</strong>, and use multiple small distribution transformers near load centres instead of one large DTR far away.
      </p>

      <h3 style={S.h3}>Key Design Changes</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#d4d4d8' }}>HT Line Extension:</strong> The 11 kV line is extended using Aerial Bunched Cable (ABC), covered conductor (CC), or XLPE insulated cable — right up to consumer clusters.</li>
        <li style={S.li}><strong style={{ color: '#d4d4d8' }}>Multiple Small DTRs:</strong> Instead of one 100 kVA transformer, deploy five to eight 16/25 kVA transformers, each placed within 50–100 m of the consumers it serves.</li>
        <li style={S.li}><strong style={{ color: '#d4d4d8' }}>Short LT Lines:</strong> Each small DTR serves only 3–5 consumers via very short LT lines (&lt; 100 m), typically using LT ABC (Aerial Bunched Cable).</li>
        <li style={S.li}><strong style={{ color: '#d4d4d8' }}>Insulated Conductors:</strong> Both HT and LT sections use insulated/covered conductors, eliminating bare-wire theft and improving safety.</li>
      </ul>

      <h2 style={S.h2}>3. Technical Loss Reduction: 50–70%</h2>
      <h3 style={S.h3}>Worked Example</h3>
      <p style={S.p}>
        Consider a 100 kW load, 1 km LT line, ACSR Weasel conductor (R = 1.182 Ω/km), power factor 0.8:
      </p>

      <h3 style={S.h3}>LVDS Calculation</h3>
      <span style={S.eq}>I_LT = 100,000 / (√3 × 415 × 0.8) = 174.0 A</span>
      <span style={S.eq}>P_loss = 3 × I² × R × L = 3 × 174² × 1.182 × 1.0 = 107.4 kW</span>
      <p style={S.p}>This is clearly unsustainable — losses exceed the actual load! In practice, voltage drops force the system to operate at reduced capacity.</p>

      <h3 style={S.h3}>HVDS Calculation</h3>
      <p style={S.p}>Split into 5 DTRs of 20 kVA each, HT line 850 m (R = 0.379 Ω/km), short LT 75 m each:</p>
      <span style={S.eq}>I_HT = 100,000 / (√3 × 11000 × 0.8) = 6.56 A</span>
      <span style={S.eq}>HT Loss = 3 × 6.56² × 0.379 × 0.85 = 41.6 W</span>
      <span style={S.eq}>I_LT per DTR = 20,000 / (√3 × 415 × 0.8) = 34.8 A</span>
      <span style={S.eq}>LT Loss (each) = 3 × 34.8² × 1.182 × 0.075 = 322 W</span>
      <span style={S.eq}>Total HVDS Loss = 41.6 + 5 × 322 = 1.65 kW</span>

      <div style={S.ctx}>
        <span style={S.ctxT}>Loss Reduction</span>
        <p style={S.ctxP}>
          LVDS loss = 107.4 kW vs HVDS loss = 1.65 kW → <strong style={{ color: '#22c55e' }}>98.5% reduction</strong>. Even in realistic scenarios with partial loading and diversity factors, HVDS typically achieves 50–70% loss reduction.
        </p>
      </div>

      <h2 style={S.h2}>4. Commercial Loss Reduction</h2>
      <p style={S.p}>
        Beyond technical losses, HVDS dramatically curtails theft (commercial losses):
      </p>

      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Parameter</th>
            <th style={S.th}>LVDS</th>
            <th style={S.th}>HVDS</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={S.td}>Conductor Type</td><td style={S.td}>Bare ACSR (LT)</td><td style={S.td}>Covered/ABC (HT + LT)</td></tr>
          <tr><td style={S.td}>Theft Method</td><td style={S.td}>Simple hooking at 415 V</td><td style={S.td}>11 kV is lethal; insulated wire</td></tr>
          <tr><td style={S.td}>Line Length Exposed</td><td style={S.td}>1–2 km of bare wire</td><td style={S.td}>&lt; 100 m, insulated</td></tr>
          <tr><td style={S.td}>Energy Audit</td><td style={S.td}>Difficult (many consumers per DTR)</td><td style={S.td}>Easy (3–5 per DTR)</td></tr>
          <tr><td style={S.td}>Theft Detection</td><td style={S.td}>Annual audit only</td><td style={S.td}>DTR output ≠ meter sum → instant flag</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>DTR-Level Energy Accounting</h3>
      <p style={S.p}>
        With only 3–5 consumers per small DTR, the energy sent out from the transformer can be compared with the sum of consumer meter readings. Any discrepancy exceeding transformer losses (typically 2–3%) immediately indicates theft. This makes HVDS a powerful anti-theft measure — each small DTR acts as an energy accounting unit.
      </p>

      <h2 style={S.h2}>5. Cost-Benefit Analysis</h2>
      <p style={S.p}>
        HVDS requires higher upfront investment due to more transformers and HT line extension. However, the operational savings are substantial:
      </p>

      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Item</th>
            <th style={S.th}>LVDS (100 consumers)</th>
            <th style={S.th}>HVDS (100 consumers)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={S.td}>Distribution Transformers</td><td style={S.td}>1 × 100 kVA (₹1.5L)</td><td style={S.td}>25 × 16 kVA (₹12.5L)</td></tr>
          <tr><td style={S.td}>LT Line (bare/ABC)</td><td style={S.td}>1.5 km (₹4.5L)</td><td style={S.td}>25 × 75 m = 1.875 km (₹5.6L)</td></tr>
          <tr><td style={S.td}>HT Line Extension</td><td style={S.td}>Minimal</td><td style={S.td}>1.2 km CC (₹3.6L)</td></tr>
          <tr><td style={S.td}>Total Capital</td><td style={S.td}>~₹6 Lakh</td><td style={S.td}>~₹21.7 Lakh</td></tr>
          <tr><td style={S.td}>Annual Loss Saving</td><td style={S.td}>—</td><td style={S.td}>₹3–5 Lakh/year</td></tr>
          <tr><td style={S.td}>Theft Reduction Saving</td><td style={S.td}>—</td><td style={S.td}>₹2–4 Lakh/year</td></tr>
          <tr><td style={{ ...S.td, color: '#22c55e', fontWeight: 600 }}>Payback Period</td><td style={S.td}>—</td><td style={{ ...S.td, color: '#22c55e', fontWeight: 600 }}>3–5 years</td></tr>
        </tbody>
      </table>

      <h2 style={S.h2}>6. Government Schemes</h2>
      <p style={S.p}>
        The Indian government has actively promoted HVDS conversion through several flagship programmes:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#d4d4d8' }}>R-APDRP</strong> (Restructured Accelerated Power Development and Reforms Programme) — focused on urban loss reduction, IT-enabled energy auditing, and HVDS pilot projects in select towns.</li>
        <li style={S.li}><strong style={{ color: '#d4d4d8' }}>DDUGJY</strong> (Deendayal Upadhyaya Gram Jyoti Yojana) — the primary rural electrification scheme that mandated HVDS for new agricultural and rural connections. ₹43,033 crore allocated for feeder separation and system strengthening.</li>
        <li style={S.li}><strong style={{ color: '#d4d4d8' }}>RDSS</strong> (Revamped Distribution Sector Scheme, 2021) — allocated ₹3,03,758 crore for DISCOM modernization, including HVDS conversion, smart metering, and loss reduction. Target: bring AT&C losses below 12–15% pan-India.</li>
        <li style={S.li}><strong style={{ color: '#d4d4d8' }}>Saubhagya</strong> (PMSBY) — while focused on household electrification, many new connections were provisioned through HVDS to minimize losses from inception.</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>AP DISCOM HVDS Implementation</span>
        <p style={S.ctxP}>
          Andhra Pradesh's DISCOMs (APSPDCL and APEPDCL) have been among the most aggressive HVDS adopters in India. Key outcomes:
        </p>
        <ul style={{ ...S.ul, paddingLeft: 16 }}>
          <li style={{ ...S.li, fontSize: 13 }}>Converted over 2.8 lakh agricultural pump sets from LVDS to HVDS under DDUGJY and state schemes.</li>
          <li style={{ ...S.li, fontSize: 13 }}>Agricultural feeder segregation: separate 3-phase HT feeders for agricultural pumps and 1-phase feeders for domestic consumers, enabling scheduled 7-hour supply to agriculture without affecting 24×7 domestic supply.</li>
          <li style={{ ...S.li, fontSize: 13 }}>AT&C losses reduced from 28.5% (2012-13) to 17.8% (2020-21), with HVDS being a major contributor.</li>
          <li style={{ ...S.li, fontSize: 13 }}>Individual DTR monitoring through SCADA/DMS integration enables real-time loss tracking at each transformer level.</li>
          <li style={{ ...S.li, fontSize: 13 }}>Transformer failure rate reduced by 40% due to right-sizing (16/25 kVA instead of overloaded 100 kVA DTRs).</li>
        </ul>
      </div>

      <h2 style={S.h2}>7. Voltage Profile Improvement</h2>
      <p style={S.p}>
        As per IS 12360 and CEA regulations, the statutory voltage limit for LT supply is ±6% of 415 V, meaning the acceptable range is 390 V to 440 V. In conventional LVDS, tail-end consumers routinely receive 330–370 V — well below the statutory minimum. This causes:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>Motor burnouts in agricultural pumps (draws more current at low voltage to maintain torque)</li>
        <li style={S.li}>Dim lighting and appliance malfunction in households</li>
        <li style={S.li}>Increased current draw → further I²R losses → positive feedback loop of deterioration</li>
      </ul>
      <p style={S.p}>
        HVDS eliminates this problem: since the 11 kV HT line has negligible voltage drop (&lt; 1%), and LT lines are only 50–100 m long, all consumers receive voltage within 395–412 V — well within statutory limits.
      </p>

      <h2 style={S.h2}>8. Summary Comparison</h2>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Feature</th>
            <th style={S.th}>LVDS</th>
            <th style={S.th}>HVDS</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={S.td}>LT Line Length</td><td style={S.td}>500 m – 2 km</td><td style={S.td}>&lt; 100 m</td></tr>
          <tr><td style={S.td}>Current at LT</td><td style={S.td}>Very high</td><td style={S.td}>Low (few consumers)</td></tr>
          <tr><td style={S.td}>I²R Losses</td><td style={{ ...S.td, color: '#ef4444' }}>Very high (5–20%)</td><td style={{ ...S.td, color: '#22c55e' }}>Very low (&lt; 2%)</td></tr>
          <tr><td style={S.td}>Tail-end Voltage</td><td style={{ ...S.td, color: '#ef4444' }}>330–370 V</td><td style={{ ...S.td, color: '#22c55e' }}>395–412 V</td></tr>
          <tr><td style={S.td}>Theft Opportunity</td><td style={{ ...S.td, color: '#ef4444' }}>High (bare LT wire)</td><td style={{ ...S.td, color: '#22c55e' }}>Low (insulated HT)</td></tr>
          <tr><td style={S.td}>Energy Audit</td><td style={S.td}>Difficult</td><td style={S.td}>DTR-level accounting</td></tr>
          <tr><td style={S.td}>Capital Cost</td><td style={S.td}>Lower</td><td style={S.td}>1.5–3× higher</td></tr>
          <tr><td style={S.td}>Lifecycle Cost</td><td style={{ ...S.td, color: '#22c55e' }}>Higher (losses + theft)</td><td style={{ ...S.td, color: '#22c55e' }}>Lower (payback 3–5 yr)</td></tr>
        </tbody>
      </table>

      <h2 style={S.h2}>References</h2>
      <ul style={S.ul}>
        <li style={S.li}>Central Electricity Authority (CEA) — Manual on Transmission Planning Criteria, Appendix on Distribution Norms</li>
        <li style={S.li}>Ministry of Power, Government of India — RDSS Scheme Guidelines (2021)</li>
        <li style={S.li}>DDUGJY Implementation Guidelines — Rural Electrification Corporation</li>
        <li style={S.li}>APSPDCL & APEPDCL Annual Reports — AT&C Loss Reduction through HVDS</li>
        <li style={S.li}>Bureau of Indian Standards — IS 12360 (Voltage Standards for LT Supply)</li>
        <li style={S.li}>IEEE/PES — Rural Distribution System Optimization Studies</li>
        <li style={S.li}>Forum of Regulators (FOR) — Distribution Loss Reduction Handbook</li>
      </ul>
    </div>
  );
}

export default function HVDSSystem() {
  const [tab, setTab] = useState('sim');
  const [numC, setNumC] = useState(25);
  const [totalKW, setTotalKW] = useState(150);
  const [ltLen, setLtLen] = useState(1000);
  const [pf, setPf] = useState(0.80);
  const [condKey, setCondKey] = useState('weasel');

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'sim')} onClick={() => setTab('sim')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>
      {tab === 'sim' ? (
        <SimTab
          numC={numC} totalKW={totalKW} ltLen={ltLen} pf={pf} condKey={condKey}
          setNumC={setNumC} setTotalKW={setTotalKW} setLtLen={setLtLen} setPf={setPf} setCondKey={setCondKey}
        />
      ) : (
        <TheoryTab />
      )}
    </div>
  );
}
