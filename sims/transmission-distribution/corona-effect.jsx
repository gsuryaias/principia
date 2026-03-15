import React, { useState, useMemo } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '16px 16px 8px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 },
  graphWrap: { padding: '4px 16px 8px', display: 'flex', justifyContent: 'center', overflowX: 'auto' },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 8 },
  label: { fontSize: 12, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 100, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 40, textAlign: 'right' },
  results: { display: 'flex', gap: 28, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  btn: (a) => ({ padding: '4px 10px', borderRadius: 6, border: a ? '1px solid #6366f1' : '1px solid #27272a', background: a ? 'rgba(99,102,241,0.15)' : 'transparent', color: a ? '#a5b4fc' : '#71717a', fontSize: 11, cursor: 'pointer', fontWeight: a ? 600 : 400, transition: 'all 0.15s', outline: 'none' }),
  bg: { display: 'flex', gap: 3 },
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

const M0 = { smooth: 1.0, rough: 0.93, stranded: 0.87 };
const MS = { fair: 1.0, rain: 0.8, fog: 0.64 };
const FREQ = 50;
const SQRT3 = Math.sqrt(3);
const CBRT2 = Math.pow(2, 1 / 3);

function calc(vLL, r, Dm, surface, weather, tempC, altM, arrangement) {
  const Dcm = Dm * 100;
  const gmd = arrangement === 'equilateral' ? Dcm : Dcm * CBRT2;
  const m0 = M0[surface];
  const ms = MS[weather];
  const b = 76 * Math.pow(1 - 2.256e-5 * altM, 5.256);
  const delta = 3.92 * b / (273 + tempC);
  const lnDr = Math.log(gmd / r);
  const Vc_ln = Math.max(0, 21.21 * m0 * ms * delta * r * lnDr);
  const Vc = Vc_ln * SQRT3;
  const Vv = 1.5 * Vc;
  const V_ln = vLL / SQRT3;
  let Pc = 0;
  if (V_ln > Vc_ln && Vc_ln > 0) {
    Pc = (242 / delta) * (FREQ + 25) * Math.sqrt(r / gmd) * Math.pow(V_ln - Vc_ln, 2) * 1e-5;
  }
  return { Vc, Vv, Vc_ln, Pc, Pc3: 3 * Pc, delta, b, gmd };
}

const PH = [
  { label: 'R', col: '#ef4444' },
  { label: 'Y', col: '#eab308' },
  { label: 'B', col: '#3b82f6' },
];

const POS = {
  horizontal: [{ x: 150, y: 135 }, { x: 300, y: 135 }, { x: 450, y: 135 }],
  vertical: [{ x: 300, y: 50 }, { x: 300, y: 140 }, { x: 300, y: 230 }],
  equilateral: [{ x: 200, y: 195 }, { x: 300, y: 75 }, { x: 400, y: 195 }],
};

function CrossSection({ voltage, data, radius, spacing, arrangement }) {
  const { Vc, Vv } = data;
  const cr = 10 + (radius - 0.5) * 5;
  const pos = POS[arrangement];
  const hasC = voltage > Vc && Vc > 0;
  const isV = voltage > Vv;
  const inten = !hasC ? 0 : Math.min(1.5, (voltage - Vc) / Math.max(1, Vv - Vc));

  const statusText = !hasC ? 'No Corona' : isV ? 'Visual Corona' : 'Corona Onset';
  const statusCol = !hasC ? '#22c55e' : isV ? '#ef4444' : '#f59e0b';

  const gx = 615, gy0 = 25, gh = 230, gw = 14;
  const gyAt = (v) => gy0 + gh - (Math.min(Math.max(v, 0), 500) / 500) * gh;

  return (
    <svg viewBox="0 0 700 280" style={{ width: '100%', maxWidth: 720, height: 'auto' }}>
      <defs>
        <filter id="gb" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="gb2" x="-250%" y="-250%" width="600%" height="600%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <clipPath id="gc">
          <rect x={gx} y={gy0} width={gw} height={gh} rx={4} />
        </clipPath>
      </defs>

      <text x={10} y={18} fontSize={13} fontWeight={700} fill={statusCol}>{statusText}</text>
      <text x={10} y={34} fontSize={10} fill="#52525b">
        {arrangement.charAt(0).toUpperCase() + arrangement.slice(1)} arrangement • V = {voltage} kV (L-L)
      </text>

      {pos.map((p, i) => (
        <g key={i}>
          {hasC && (
            <g opacity={Math.min(1, inten * 0.85)} key={`c${hasC}${isV}`}>
              <circle cx={p.x} cy={p.y} r={cr * 3.5} fill={isV ? '#c4b5fd' : '#7c3aed'} filter="url(#gb2)">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur={isV ? '0.9s' : '1.8s'} begin={`${i * 0.25}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={p.x} cy={p.y} r={cr * 2} fill={isV ? '#a78bfa' : '#8b5cf6'} filter="url(#gb)">
                <animate attributeName="opacity" values="0.4;0.85;0.4" dur={isV ? '0.7s' : '1.3s'} begin={`${i * 0.2}s`} repeatCount="indefinite" />
              </circle>
              {isV && (
                <circle cx={p.x} cy={p.y} r={cr * 1.3} fill="#ede9fe" filter="url(#gb)">
                  <animate attributeName="opacity" values="0.3;0.9;0.3" dur="0.5s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
                </circle>
              )}
              {Array.from({ length: isV ? 12 : 8 }, (_, fi) => {
                const a = ((fi * (isV ? 30 : 45)) + i * 20) * Math.PI / 180;
                const len = cr * (0.8 + Math.min(inten, 1) * 1.2);
                return (
                  <line key={fi}
                    x1={p.x + cr * Math.cos(a)} y1={p.y + cr * Math.sin(a)}
                    x2={p.x + (cr + len) * Math.cos(a)} y2={p.y + (cr + len) * Math.sin(a)}
                    stroke={isV ? '#c4b5fd' : '#8b5cf6'} strokeWidth={isV ? 1 : 0.7}>
                    <animate attributeName="opacity" values="0;0.5;0" dur={`${0.4 + fi * 0.07}s`} begin={`${fi * 0.06 + i * 0.15}s`} repeatCount="indefinite" />
                  </line>
                );
              })}
            </g>
          )}
          <circle cx={p.x} cy={p.y} r={cr} fill="#71717a" stroke="#9ca3af" strokeWidth={1.5} />
          <circle cx={p.x} cy={p.y} r={cr * 0.35} fill="#52525b" />
          <text x={p.x} y={p.y - cr - 7} textAnchor="middle" fontSize={11} fontWeight={600} fill={PH[i].col}>{PH[i].label}</text>
        </g>
      ))}

      {arrangement === 'horizontal' && (
        <g>
          <line x1={pos[0].x} y1={pos[0].y + cr + 24} x2={pos[1].x} y2={pos[1].y + cr + 24} stroke="#3f3f46" strokeWidth={1} />
          <line x1={pos[0].x} y1={pos[0].y + cr + 20} x2={pos[0].x} y2={pos[0].y + cr + 28} stroke="#3f3f46" strokeWidth={1} />
          <line x1={pos[1].x} y1={pos[1].y + cr + 20} x2={pos[1].x} y2={pos[1].y + cr + 28} stroke="#3f3f46" strokeWidth={1} />
          <text x={(pos[0].x + pos[1].x) / 2} y={pos[0].y + cr + 42} textAnchor="middle" fontSize={11} fill="#71717a">D = {spacing.toFixed(1)} m</text>
        </g>
      )}
      {arrangement === 'vertical' && (
        <g>
          <line x1={pos[0].x + cr + 18} y1={pos[0].y} x2={pos[0].x + cr + 18} y2={pos[1].y} stroke="#3f3f46" strokeWidth={1} />
          <line x1={pos[0].x + cr + 14} y1={pos[0].y} x2={pos[0].x + cr + 22} y2={pos[0].y} stroke="#3f3f46" strokeWidth={1} />
          <line x1={pos[0].x + cr + 14} y1={pos[1].y} x2={pos[0].x + cr + 22} y2={pos[1].y} stroke="#3f3f46" strokeWidth={1} />
          <text x={pos[0].x + cr + 28} y={(pos[0].y + pos[1].y) / 2 + 4} fontSize={11} fill="#71717a">D = {spacing.toFixed(1)} m</text>
        </g>
      )}
      {arrangement === 'equilateral' && (
        <g>
          <line x1={pos[0].x} y1={pos[0].y} x2={pos[1].x} y2={pos[1].y} stroke="#3f3f46" strokeWidth={0.7} strokeDasharray="4 3" />
          <rect x={(pos[0].x + pos[1].x) / 2 - 38} y={(pos[0].y + pos[1].y) / 2 - 18} width={76} height={16} rx={3} fill="#09090b" opacity={0.85} />
          <text x={(pos[0].x + pos[1].x) / 2} y={(pos[0].y + pos[1].y) / 2 - 5} textAnchor="middle" fontSize={11} fill="#71717a">D = {spacing.toFixed(1)} m</text>
        </g>
      )}

      <line x1={pos[0].x + cr} y1={pos[0].y} x2={pos[0].x + cr + 22} y2={pos[0].y - 16} stroke="#52525b" strokeWidth={0.5} />
      <text x={pos[0].x + cr + 24} y={pos[0].y - 14} fontSize={9} fill="#52525b">r = {radius.toFixed(1)} cm</text>

      <rect x={gx} y={gy0} width={gw} height={gh} rx={4} fill="#18181b" stroke="#27272a" strokeWidth={1} />
      <g clipPath="url(#gc)">
        <rect x={gx} y={gyAt(Math.min(Vc, 500))} width={gw} height={gy0 + gh - gyAt(Math.min(Vc, 500))} fill="rgba(34,197,94,0.15)" />
        {Vc < 500 && <rect x={gx} y={gyAt(Math.min(Vv, 500))} width={gw} height={gyAt(Vc) - gyAt(Math.min(Vv, 500))} fill="rgba(245,158,11,0.15)" />}
        {Vv < 500 && <rect x={gx} y={gy0} width={gw} height={gyAt(Vv) - gy0} fill="rgba(239,68,68,0.15)" />}
      </g>
      {Vc > 0 && Vc <= 500 && (
        <>
          <line x1={gx - 3} y1={gyAt(Vc)} x2={gx + gw + 3} y2={gyAt(Vc)} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={gx + gw + 7} y={gyAt(Vc) + 3} fontSize={8} fill="#f59e0b" fontWeight={600}>Vc</text>
        </>
      )}
      {Vv > 0 && Vv <= 500 && (
        <>
          <line x1={gx - 3} y1={gyAt(Vv)} x2={gx + gw + 3} y2={gyAt(Vv)} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 2" />
          <text x={gx + gw + 7} y={gyAt(Vv) + 3} fontSize={8} fill="#ef4444" fontWeight={600}>Vv</text>
        </>
      )}
      <line x1={gx - 5} y1={gyAt(voltage)} x2={gx + gw + 5} y2={gyAt(voltage)} stroke="#818cf8" strokeWidth={2} />
      <text x={gx - 8} y={gyAt(voltage) + 4} textAnchor="end" fontSize={9} fill="#a5b4fc" fontWeight={600}>{voltage}</text>
      <text x={gx + gw / 2} y={gy0 - 6} textAnchor="middle" fontSize={8} fill="#52525b">500</text>
      <text x={gx + gw / 2} y={gy0 + gh + 12} textAnchor="middle" fontSize={8} fill="#52525b">0 kV</text>
    </svg>
  );
}

function LossGraph({ voltage, data, radius }) {
  const { Vc, Vv, Vc_ln, delta, gmd } = data;
  const W = 680, H = 200;
  const P = { t: 24, r: 20, b: 38, l: 58 };
  const pw = W - P.l - P.r, ph = H - P.t - P.b;

  const { pts, maxPc } = useMemo(() => {
    let mx = 0;
    const arr = [];
    for (let v = 0; v <= 500; v += 2) {
      const vln = v / SQRT3;
      let pc = 0;
      if (vln > Vc_ln && Vc_ln > 0) {
        pc = (242 / delta) * (FREQ + 25) * Math.sqrt(radius / gmd) * Math.pow(vln - Vc_ln, 2) * 1e-5;
      }
      if (pc > mx) mx = pc;
      arr.push({ v, pc });
    }
    return { pts: arr, maxPc: Math.max(0.1, mx) };
  }, [Vc_ln, delta, radius, gmd]);

  const ceil = maxPc * 1.15;
  const xS = (v) => P.l + (v / 500) * pw;
  const yS = (pc) => P.t + ph - (pc / ceil) * ph;

  const nonZero = pts.filter((p) => p.pc > 0);
  const linePath = nonZero.length > 0
    ? nonZero.map((p, i) => `${i === 0 ? 'M' : 'L'}${xS(p.v).toFixed(1)},${yS(p.pc).toFixed(1)}`).join(' ')
    : '';
  const fillPath = nonZero.length > 0
    ? `M${xS(nonZero[0].v).toFixed(1)},${yS(0).toFixed(1)} ${nonZero.map((p) => `L${xS(p.v).toFixed(1)},${yS(p.pc).toFixed(1)}`).join(' ')} L${xS(nonZero[nonZero.length - 1].v).toFixed(1)},${yS(0).toFixed(1)} Z`
    : '';

  const curPc = (() => {
    const vln = voltage / SQRT3;
    if (vln <= Vc_ln || Vc_ln <= 0) return 0;
    return (242 / delta) * (FREQ + 25) * Math.sqrt(radius / gmd) * Math.pow(vln - Vc_ln, 2) * 1e-5;
  })();

  const yTicks = [0, 1, 2, 3, 4].map((i) => (i / 4) * ceil);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <defs>
        <linearGradient id="lfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      <text x={W / 2} y={14} textAnchor="middle" fontSize={11} fill="#52525b" fontWeight={500}>Corona Power Loss vs Line Voltage (Peterson's Formula)</text>

      {[0, 100, 200, 300, 400, 500].map((v) => (
        <g key={`gx${v}`}>
          <line x1={xS(v)} y1={P.t} x2={xS(v)} y2={P.t + ph} stroke="#1e1e2e" strokeWidth={0.5} />
          <text x={xS(v)} y={P.t + ph + 14} textAnchor="middle" fontSize={9} fill="#52525b">{v}</text>
        </g>
      ))}
      {yTicks.map((pc, i) => (
        <g key={`gy${i}`}>
          <line x1={P.l} y1={yS(pc)} x2={P.l + pw} y2={yS(pc)} stroke="#1e1e2e" strokeWidth={0.5} />
          <text x={P.l - 5} y={yS(pc) + 3} textAnchor="end" fontSize={8} fill="#52525b">{pc < 10 ? pc.toFixed(1) : Math.round(pc)}</text>
        </g>
      ))}

      <line x1={P.l} y1={P.t} x2={P.l} y2={P.t + ph} stroke="#3f3f46" strokeWidth={1} />
      <line x1={P.l} y1={P.t + ph} x2={P.l + pw} y2={P.t + ph} stroke="#3f3f46" strokeWidth={1} />
      <text x={P.l + pw / 2} y={H - 3} textAnchor="middle" fontSize={10} fill="#71717a">Line Voltage (kV, L-L)</text>
      <text x={14} y={P.t + ph / 2} textAnchor="middle" fontSize={10} fill="#71717a" transform={`rotate(-90,14,${P.t + ph / 2})`}>kW/km/phase</text>

      {Vc > 0 && Vc <= 500 && (
        <g>
          <line x1={xS(Vc)} y1={P.t} x2={xS(Vc)} y2={P.t + ph} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 3" />
          <text x={xS(Vc)} y={P.t - 2} textAnchor="middle" fontSize={9} fill="#f59e0b" fontWeight={600}>Vc={Vc.toFixed(0)}</text>
        </g>
      )}
      {Vv > 0 && Vv <= 500 && (
        <g>
          <line x1={xS(Vv)} y1={P.t} x2={xS(Vv)} y2={P.t + ph} stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" />
          <text x={xS(Vv)} y={P.t - 2} textAnchor="middle" fontSize={9} fill="#ef4444" fontWeight={600}>Vv={Vv.toFixed(0)}</text>
        </g>
      )}

      {fillPath && <path d={fillPath} fill="url(#lfill)" />}
      {linePath && <path d={linePath} fill="none" stroke="#ef4444" strokeWidth={2} />}

      {voltage > 0 && (
        <g>
          <line x1={xS(voltage)} y1={P.t} x2={xS(voltage)} y2={P.t + ph} stroke="#6366f1" strokeWidth={1} strokeDasharray="2 2" opacity={0.5} />
          <circle cx={xS(voltage)} cy={yS(curPc)} r={4} fill="#6366f1" stroke="#a5b4fc" strokeWidth={1.5} />
          {curPc > 0.001 && (
            <text x={Math.min(xS(voltage) + 8, W - 80)} y={yS(curPc) - 8} fontSize={9} fill="#a5b4fc" fontWeight={600}>
              {curPc < 1 ? curPc.toFixed(3) : curPc.toFixed(1)} kW/km/ph
            </text>
          )}
        </g>
      )}

      {/* Region annotation: no-corona zone */}
      {Vc > 0 && Vc <= 500 && (
        <g>
          <rect x={P.l + 2} y={P.t + ph - 18} width={Math.max(0, xS(Math.min(Vc, 500)) - P.l - 4)} height={16} rx={3} fill="rgba(34,197,94,0.06)" stroke="rgba(34,197,94,0.15)" strokeWidth={0.5} />
          <text x={(P.l + xS(Math.min(Vc, 500))) / 2} y={P.t + ph - 7} textAnchor="middle" fill="#22c55e" fontSize={7} fontWeight={500}>No corona</text>
        </g>
      )}

      {Vc > 500 && (
        <text x={P.l + pw / 2} y={P.t + ph / 2} textAnchor="middle" fontSize={12} fill="#3f3f46">
          Vc ({Vc.toFixed(0)} kV) exceeds range — no corona in 0–500 kV
        </text>
      )}
    </svg>
  );
}

function TheorySVGCorona() {
  return (
    <svg viewBox="0 0 760 320" style={{ width: '100%', maxWidth: 760, height: 'auto', margin: '20px 0' }}>
      <rect width="760" height="320" rx="12" fill="#111114" stroke="#27272a" />
      <text x="380" y="28" textAnchor="middle" fill="#d4d4d8" fontSize={14} fontWeight={700}>Corona Discharge Around a Conductor</text>

      {/* No Corona state */}
      <text x="130" y="60" textAnchor="middle" fill="#22c55e" fontSize={11} fontWeight={600}>V &lt; Vc (No Corona)</text>
      <circle cx="130" cy="155" r="30" fill="#52525b" stroke="#71717a" strokeWidth={1.5} />
      <circle cx="130" cy="155" r="10" fill="#3f3f46" />
      <text x="130" y="205" textAnchor="middle" fill="#71717a" fontSize={9}>No ionization</text>

      {/* Corona onset */}
      <text x="380" y="60" textAnchor="middle" fill="#f59e0b" fontSize={11} fontWeight={600}>Vc &lt; V &lt; Vv (Onset)</text>
      <defs>
        <filter id="thGlow1" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="thGlow2" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <circle cx="380" cy="155" r="55" fill="#7c3aed" opacity="0.2" filter="url(#thGlow1)">
        <animate attributeName="opacity" values="0.15;0.3;0.15" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="380" cy="155" r="30" fill="#52525b" stroke="#71717a" strokeWidth={1.5} />
      <circle cx="380" cy="155" r="10" fill="#3f3f46" />
      {/* Micro discharge streaks */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45) * Math.PI / 180;
        return <line key={i} x1={380 + 32 * Math.cos(a)} y1={155 + 32 * Math.sin(a)}
          x2={380 + 46 * Math.cos(a)} y2={155 + 46 * Math.sin(a)}
          stroke="#8b5cf6" strokeWidth={0.8} opacity={0.5}>
          <animate attributeName="opacity" values="0;0.6;0" dur={`${0.8 + i * 0.1}s`} repeatCount="indefinite" />
        </line>;
      })}
      <text x="380" y="205" textAnchor="middle" fill="#71717a" fontSize={9}>Micro-discharges (UV only)</text>

      {/* Visual corona */}
      <text x="630" y="60" textAnchor="middle" fill="#ef4444" fontSize={11} fontWeight={600}>V &gt; Vv (Visual Corona)</text>
      <circle cx="630" cy="155" r="80" fill="#c4b5fd" opacity="0.15" filter="url(#thGlow2)">
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="0.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="630" cy="155" r="55" fill="#a78bfa" opacity="0.2" filter="url(#thGlow1)">
        <animate attributeName="opacity" values="0.15;0.45;0.15" dur="0.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="630" cy="155" r="30" fill="#52525b" stroke="#71717a" strokeWidth={1.5} />
      <circle cx="630" cy="155" r="10" fill="#3f3f46" />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i * 22.5) * Math.PI / 180;
        const len = 20 + (i % 3) * 8;
        return <line key={i} x1={630 + 32 * Math.cos(a)} y1={155 + 32 * Math.sin(a)}
          x2={630 + (32 + len) * Math.cos(a)} y2={155 + (32 + len) * Math.sin(a)}
          stroke="#c4b5fd" strokeWidth={1}>
          <animate attributeName="opacity" values="0;0.8;0" dur={`${0.3 + i * 0.05}s`} begin={`${i * 0.04}s`} repeatCount="indefinite" />
        </line>;
      })}
      <text x="630" y="205" textAnchor="middle" fill="#71717a" fontSize={9}>Visible violet glow + noise</text>

      {/* Electric field arrows */}
      <defs>
        <marker id="thArr" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <path d="M0,0 L6,2.5 L0,5 Z" fill="#71717a" />
        </marker>
      </defs>

      {/* Voltage scale bar at bottom */}
      <line x1="80" y1="270" x2="680" y2="270" stroke="#3f3f46" strokeWidth={1.5} />
      <line x1="80" y1="265" x2="80" y2="275" stroke="#3f3f46" strokeWidth={1.5} />
      <line x1="680" y1="265" x2="680" y2="275" stroke="#3f3f46" strokeWidth={1.5} />
      <text x="80" y="290" textAnchor="middle" fill="#52525b" fontSize={9}>0 V</text>

      {/* Vc marker */}
      <line x1="310" y1="260" x2="310" y2="280" stroke="#f59e0b" strokeWidth={2} />
      <text x="310" y="296" textAnchor="middle" fill="#f59e0b" fontSize={10} fontWeight={700}>Vc</text>

      {/* Vv marker */}
      <line x1="500" y1="260" x2="500" y2="280" stroke="#ef4444" strokeWidth={2} />
      <text x="500" y="296" textAnchor="middle" fill="#ef4444" fontSize={10} fontWeight={700}>Vv = 1.5 Vc</text>

      {/* Region shading */}
      <rect x="80" y="266" width="230" height="8" rx="2" fill="rgba(34,197,94,0.15)" />
      <rect x="310" y="266" width="190" height="8" rx="2" fill="rgba(245,158,11,0.15)" />
      <rect x="500" y="266" width="180" height="8" rx="2" fill="rgba(239,68,68,0.15)" />
      <text x="195" y="260" textAnchor="middle" fill="#22c55e" fontSize={8}>Safe zone</text>
      <text x="405" y="260" textAnchor="middle" fill="#f59e0b" fontSize={8}>Corona onset</text>
      <text x="590" y="260" textAnchor="middle" fill="#ef4444" fontSize={8}>Visual corona</text>
    </svg>
  );
}

function TheorySVGVIChar() {
  const W = 760, H = 260;
  const P = { t: 48, r: 30, b: 44, l: 65 };
  const pw = W - P.l - P.r, ph = H - P.t - P.b;
  const xS = v => P.l + (v / 500) * pw;
  const yS = p => P.t + ph - (p / 25) * ph;

  // Simulated Peterson curve (generic shape)
  const pts = [];
  const Vc = 200;
  for (let v = 0; v <= 500; v += 2) {
    const vln = v / Math.sqrt(3);
    const vcln = Vc / Math.sqrt(3);
    let pc = 0;
    if (vln > vcln) pc = 0.0008 * Math.pow(vln - vcln, 2);
    pts.push({ v, pc: Math.min(pc, 25) });
  }

  const nonZero = pts.filter(p => p.pc > 0);
  const linePath = nonZero.length > 0
    ? nonZero.map((p, i) => `${i === 0 ? 'M' : 'L'}${xS(p.v).toFixed(1)},${yS(p.pc).toFixed(1)}`).join(' ')
    : '';
  const fillPath = nonZero.length > 0
    ? `M${xS(nonZero[0].v).toFixed(1)},${yS(0).toFixed(1)} ${nonZero.map(p => `L${xS(p.v).toFixed(1)},${yS(p.pc).toFixed(1)}`).join(' ')} L${xS(nonZero[nonZero.length - 1].v).toFixed(1)},${yS(0).toFixed(1)} Z`
    : '';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', margin: '20px 0' }}>
      <rect width={W} height={H} rx="12" fill="#111114" stroke="#27272a" />
      <text x={W / 2} y="24" textAnchor="middle" fill="#d4d4d8" fontSize={13} fontWeight={700}>Corona Power Loss vs Voltage (Peterson's Formula)</text>
      <text x={W / 2} y="40" textAnchor="middle" fill="#52525b" fontSize={10}>Pc ∝ (V - Vc)² — quadratic increase beyond critical voltage</text>

      {/* Axes */}
      <line x1={P.l} y1={P.t} x2={P.l} y2={P.t + ph} stroke="#3f3f46" strokeWidth={1} />
      <line x1={P.l} y1={P.t + ph} x2={P.l + pw} y2={P.t + ph} stroke="#3f3f46" strokeWidth={1} />

      {[0, 100, 200, 300, 400, 500].map(v => (
        <g key={v}>
          <line x1={xS(v)} y1={P.t} x2={xS(v)} y2={P.t + ph} stroke="#1e1e2e" strokeWidth={0.5} />
          <text x={xS(v)} y={P.t + ph + 14} textAnchor="middle" fill="#52525b" fontSize={9}>{v}</text>
        </g>
      ))}
      {[0, 5, 10, 15, 20, 25].map(p => (
        <g key={p}>
          <line x1={P.l} y1={yS(p)} x2={P.l + pw} y2={yS(p)} stroke="#1e1e2e" strokeWidth={0.5} />
          <text x={P.l - 6} y={yS(p) + 3} textAnchor="end" fill="#52525b" fontSize={9}>{p}</text>
        </g>
      ))}

      <text x={W / 2} y={H - 4} textAnchor="middle" fill="#71717a" fontSize={10}>Line Voltage (kV, L-L)</text>
      <text x={16} y={P.t + ph / 2} textAnchor="middle" fill="#71717a" fontSize={10} transform={`rotate(-90,16,${P.t + ph / 2})`}>Loss (kW/km/phase)</text>

      {/* No-corona region */}
      <rect x={P.l + 2} y={P.t + ph - 20} width={xS(Vc) - P.l - 4} height={18} rx={4} fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.2)" strokeWidth={0.5} />
      <text x={(P.l + xS(Vc)) / 2} y={P.t + ph - 8} textAnchor="middle" fill="#22c55e" fontSize={8} fontWeight={500}>No corona loss</text>

      {/* Vc vertical */}
      <line x1={xS(Vc)} y1={P.t} x2={xS(Vc)} y2={P.t + ph} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5,3" />
      <text x={xS(Vc)} y={P.t - 2} textAnchor="middle" fill="#f59e0b" fontSize={10} fontWeight={700}>Vc</text>

      {/* Vv vertical */}
      <line x1={xS(300)} y1={P.t} x2={xS(300)} y2={P.t + ph} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5,3" />
      <text x={xS(300)} y={P.t - 2} textAnchor="middle" fill="#ef4444" fontSize={10} fontWeight={700}>Vv</text>

      {/* Loss curve */}
      {fillPath && <path d={fillPath} fill="rgba(239,68,68,0.08)" />}
      {linePath && <path d={linePath} fill="none" stroke="#ef4444" strokeWidth={2.5} />}

      {/* Annotation: quadratic */}
      <text x={xS(420)} y={yS(15)} fill="#a5b4fc" fontSize={9} fontWeight={500}>Pc ∝ (V-Vc)²</text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Corona Effect in Transmission Lines</h2>
      <p style={S.p}>
        Corona is a luminous partial discharge that occurs when the electric field intensity at the
        surface of a conductor exceeds the dielectric strength of the surrounding air — approximately{' '}
        <strong style={{ color: '#e4e4e7' }}>30 kV/cm (peak)</strong> or 21.21 kV/cm (rms) at NTP.
        The air molecules near the conductor surface ionize, creating a characteristic violet glow,
        audible hissing noise, ozone smell, and continuous power loss. Corona is a major design
        consideration for EHV and UHV transmission lines.
      </p>

      <TheorySVGCorona />

      <h3 style={S.h3}>Peek's Formula — Critical Disruptive Voltage</h3>
      <p style={S.p}>
        F.W. Peek (1911) established the empirical formula for the critical disruptive voltage — the
        minimum voltage at which corona discharge initiates on a conductor:
      </p>
      <div style={S.eq}>Vc = 21.21 × m₀ × mₛ × δ × r × ln(D/r) kV (rms, line-to-neutral)</div>
      <p style={S.p}>Where each factor accounts for a specific physical influence:</p>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>m₀ — Surface irregularity factor:</strong> 1.0 for
          polished smooth cylinders, ~0.93 for roughened surfaces, ~0.87 for 7-strand and typical
          ACSR conductors. Surface roughness concentrates the electric field at protrusions, lowering
          the voltage needed for breakdown.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>mₛ — Weather/spray factor:</strong> 1.0 in fair
          weather, 0.80 in rain, ~0.64 in dense fog or mist. Water droplets on the conductor surface
          create local field intensification.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>δ — Air density factor:</strong> δ = 3.92b/(273+t),
          where b is barometric pressure in cmHg and t is temperature in °C. At NTP (76 cmHg, 25°C),
          δ ≈ 1.0. At higher altitudes or temperatures, reduced air density lowers the breakdown
          strength.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>r — Conductor radius</strong> in cm. Larger radius
          reduces surface field gradient, raising Vc.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>D — Geometric mean spacing (GMD)</strong> between
          conductors in cm. For equilateral arrangement, GMD = D. For horizontal/vertical with spacing
          D between adjacent conductors, GMD = D × ∛2.
        </li>
      </ul>
      <div style={S.eq}>δ = 3.92 × b / (273 + t)</div>

      <h3 style={S.h3}>Visual Critical Voltage</h3>
      <p style={S.p}>
        The visual critical voltage (Vv) is the voltage at which corona becomes visible to the naked
        eye as a violet-blue glow surrounding the conductor. Below Vv but above Vc, corona exists as
        micro-discharges detectable only by instruments (UV cameras, radio noise meters). The visual
        corona threshold is approximately:
      </p>
      <div style={S.eq}>Vv ≈ 1.5 × Vc</div>
      <p style={S.p}>
        The exact ratio depends on conductor surface condition and atmospheric parameters. Peek's
        original formulation gives the visual voltage as Vv = 21.21 × mv × δ × r × (1 + 0.3/√(δr)) × ln(D/r),
        where mv is the visual irregularity factor (~0.72 for rough conductors, ~1.0 for polished).
      </p>

      <TheorySVGVIChar />

      <h3 style={S.h3}>Peterson's Formula — Corona Power Loss</h3>
      <p style={S.p}>
        Once the operating voltage exceeds the critical disruptive voltage, corona causes continuous
        power loss. Peterson's formula gives the loss per phase per kilometre:
      </p>
      <div style={S.eq}>Pc = (242/δ) × (f + 25) × √(r/D) × (V − Vc)² × 10⁻⁵ kW/km/phase</div>
      <p style={S.p}>
        where f = supply frequency in Hz (50 Hz in India), and V, Vc are rms line-to-neutral voltages
        in kV. The quadratic dependence on (V − Vc) means corona loss increases rapidly once the
        operating voltage exceeds the critical threshold.
      </p>

      <h3 style={S.h3}>Effects of Corona</h3>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Power loss</strong> — Continuous energy dissipation
          independent of load current. Can reach 1–20 kW/km per phase during rain on EHV lines,
          representing significant annual energy waste.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Radio & TV interference (RI/TVI)</strong> — High-frequency
          electromagnetic noise in the range 0.1–1000 MHz, affecting broadcast reception within a
          ~100 m corridor of the line.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Audible noise (AN)</strong> — Characteristic 100/120 Hz
          hum from ion vibration and broadband crackling/hissing, measured in dB(A). Most prominent
          in wet weather.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Ozone production (O₃)</strong> — Generated by ionization
          of oxygen molecules. Can corrode conductor fittings and hardware over decades of operation.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Conductor vibration</strong> — Corona-induced vibration
          (aeolian + corona modes) can cause fatigue damage at suspension and dead-end clamp locations.
        </li>
      </ul>

      <h3 style={S.h3}>Advantages of Corona</h3>
      <p style={S.p}>
        Despite its drawbacks, corona provides two important protective side effects:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Natural surge protection</strong> — Corona acts as a
          safety valve, dissipating steep-fronted voltage transients (lightning surges, switching
          surges) before they can damage equipment. The non-linear, lossy corona discharge absorbs
          the surge energy.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Reduces travelling wave amplitudes</strong> — The
          energy-dissipating nature of corona attenuates travelling waves propagating along the line,
          reducing overvoltage magnitudes at distant terminals.
        </li>
      </ul>

      <h3 style={S.h3}>How to Reduce Corona</h3>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Increase conductor diameter (bundling)</strong> — Bundled
          conductors (twin, triple, quad, hex) dramatically increase the effective radius, raising Vc.
          This is the primary design measure for 400 kV+ lines.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Increase conductor spacing</strong> — Larger D increases
          ln(D/r), reducing the surface gradient for a given voltage.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Use smooth conductors</strong> — Higher m₀ factor raises
          Vc. Expanded ACSR, trapezoidal-wire, and smooth-body conductors help.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Corona rings / grading rings</strong> — Toroidal rings
          at line terminations, insulators, and hardware smooth the electric field distribution,
          eliminating local corona hot-spots.
        </li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>Real-World Context — 400 kV Lines in AP Transco</span>
        <p style={S.ctxP}>
          400 kV lines in AP Transco use quad-bundled ACSR Moose conductors specifically to reduce
          corona. The effective bundle diameter of ~0.45 m pushes the critical voltage well above the
          operating voltage of 400/√3 ≈ 231 kV line-to-neutral. Without bundling, a single ACSR
          Moose conductor (r ≈ 1.6 cm) at D = 12 m spacing would have Vc ≈ 230 kV (L-N) — dangerously
          close to operating voltage, causing continuous corona loss and audible noise complaints.
          The quad bundle raises the effective r to approximately 22 cm, giving Vc well above 300 kV (L-N).
        </p>
      </div>

      <h3 style={S.h3}>CEA Noise Limit Standards</h3>
      <p style={S.p}>
        The Central Electricity Authority (CEA) and CPCB environmental noise regulations prescribe
        limits near transmission corridors. Corona audible noise from EHV lines must be factored into
        right-of-way (RoW) width design:
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Zone Category</th>
            <th style={S.th}>Day Limit dB(A)</th>
            <th style={S.th}>Night Limit dB(A)</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Industrial', '75', '70'],
            ['Commercial', '65', '55'],
            ['Residential', '55', '45'],
            ['Silence Zone (hospitals, schools)', '50', '40'],
          ].map(([z, d, n]) => (
            <tr key={z}>
              <td style={S.td}>{z}</td>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{d}</td>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{n}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>Typical Critical Voltages by Line Rating</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>System Voltage</th>
            <th style={S.th}>Conductor</th>
            <th style={S.th}>Bundling</th>
            <th style={S.th}>Approx. Vc (kV, L-L)</th>
            <th style={S.th}>Corona Risk</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['132 kV', 'ACSR Panther (r≈1.05 cm)', 'Single', '~170–200', 'Very Low'],
            ['220 kV', 'ACSR Zebra (r≈1.43 cm)', 'Single', '~250–300', 'Low (marginal in rain)'],
            ['400 kV', 'ACSR Moose (r≈1.6 cm)', 'Quad bundle', '~450–520', 'Designed below Vc'],
            ['765 kV', 'ACSR Bersimis (r≈1.84 cm)', 'Hex bundle', '~800–900', 'Designed below Vc'],
          ].map(([v, c, b, vc, risk]) => (
            <tr key={v}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{v}</td>
              <td style={S.td}>{c}</td>
              <td style={S.td}>{b}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{vc}</td>
              <td style={S.td}>{risk}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.ctx}>
        <span style={S.ctxT}>Assumptions in This Simulation</span>
        <p style={S.ctxP}>
          This simulation models single (unbundled) conductors. For bundled conductors, the effective
          radius r_eq = ∜(n × r × R^(n−1)) should be used, where R is the bundle radius and n is the
          number of sub-conductors. Peterson's formula is an approximation valid primarily for fair
          weather; actual rain-weather corona loss can be 10–20× higher than fair-weather values.
          The supply frequency is fixed at 50 Hz (Indian grid standard). For non-equilateral conductor
          arrangements, the simulation uses the geometric mean distance (GMD = D×∛2 for
          horizontal/vertical).
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>F.W. Peek, <em>"Dielectric Phenomena in High Voltage Engineering"</em>, McGraw-Hill, 1929</li>
        <li style={S.li}>Central Electricity Authority (CEA) — Manual on Transmission Planning Criteria</li>
        <li style={S.li}>IS 5613 (Part 1/Sec 1) — Code of Practice for Design, Installation and Maintenance of Overhead Power Lines</li>
        <li style={S.li}>CIGRÉ WG B2.06 — "Corona Noise from Overhead Transmission Lines"</li>
        <li style={S.li}>C.L. Wadhwa, <em>"Electrical Power Systems"</em>, New Age International Publishers</li>
        <li style={S.li}>CPCB — Noise Pollution (Regulation and Control) Rules, 2000 (amended 2010)</li>
      </ul>
    </div>
  );
}

export default function CoronaEffect() {
  const [tab, setTab] = useState('simulate');
  const [voltage, setVoltage] = useState(220);
  const [radius, setRadius] = useState(1.5);
  const [spacing, setSpacing] = useState(6);
  const [weather, setWeather] = useState('fair');
  const [temp, setTemp] = useState(25);
  const [altitude, setAltitude] = useState(0);
  const [surface, setSurface] = useState('stranded');
  const [arrangement, setArrangement] = useState('horizontal');

  const data = useMemo(
    () => calc(voltage, radius, spacing, surface, weather, temp, altitude, arrangement),
    [voltage, radius, spacing, surface, weather, temp, altitude, arrangement]
  );

  const status = voltage <= data.Vc ? 'None' : voltage <= data.Vv ? 'Partial' : 'Visual';

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <CrossSection voltage={voltage} data={data} radius={radius} spacing={spacing} arrangement={arrangement} />
          </div>

          <div style={S.graphWrap}>
            <LossGraph voltage={voltage} data={data} radius={radius} />
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Vc (Critical)</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{data.Vc.toFixed(1)} kV</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Vv (Visual)</span>
              <span style={{ ...S.rv, color: '#ef4444' }}>{data.Vv.toFixed(1)} kV</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Corona Loss</span>
              <span style={{ ...S.rv, color: data.Pc > 0 ? '#ef4444' : '#22c55e' }}>
                {data.Pc < 1 ? data.Pc.toFixed(3) : data.Pc.toFixed(1)} kW/km/ph
              </span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Total Loss (3φ)</span>
              <span style={{ ...S.rv, color: data.Pc3 > 0 ? '#ef4444' : '#22c55e' }}>
                {data.Pc3 < 1 ? data.Pc3.toFixed(3) : data.Pc3.toFixed(1)} kW/km
              </span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Air Density δ</span>
              <span style={{ ...S.rv, color: '#3b82f6' }}>{data.delta.toFixed(3)}</span>
              <span style={{ fontSize: 10, color: '#3f3f46', fontFamily: 'monospace' }}>{data.b.toFixed(1)} cmHg</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Status</span>
              <span style={{ ...S.rv, color: status === 'None' ? '#22c55e' : status === 'Partial' ? '#f59e0b' : '#ef4444' }}>
                {status === 'None' ? 'No Corona' : status === 'Partial' ? 'Onset' : 'Visual'}
              </span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Voltage (kV)</span>
              <input type="range" min={0} max={500} step={5} value={voltage}
                onChange={(e) => setVoltage(+e.target.value)} style={{ ...S.slider, width: 140 }} />
              <span style={S.val}>{voltage}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Radius (cm)</span>
              <input type="range" min={0.5} max={3} step={0.1} value={radius}
                onChange={(e) => setRadius(+e.target.value)} style={S.slider} />
              <span style={S.val}>{radius.toFixed(1)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Spacing (m)</span>
              <input type="range" min={3} max={15} step={0.5} value={spacing}
                onChange={(e) => setSpacing(+e.target.value)} style={S.slider} />
              <span style={S.val}>{spacing.toFixed(1)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Temp (°C)</span>
              <input type="range" min={0} max={45} step={1} value={temp}
                onChange={(e) => setTemp(+e.target.value)} style={S.slider} />
              <span style={S.val}>{temp}°</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Altitude (m)</span>
              <input type="range" min={0} max={3000} step={100} value={altitude}
                onChange={(e) => setAltitude(+e.target.value)} style={S.slider} />
              <span style={S.val}>{altitude}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Weather</span>
              <div style={S.bg}>
                {['fair', 'rain', 'fog'].map((w) => (
                  <button key={w} style={S.btn(weather === w)} onClick={() => setWeather(w)}>
                    {w.charAt(0).toUpperCase() + w.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Surface</span>
              <div style={S.bg}>
                {['smooth', 'rough', 'stranded'].map((s) => (
                  <button key={s} style={S.btn(surface === s)} onClick={() => setSurface(s)}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Arrangement</span>
              <div style={S.bg}>
                {[['horizontal', 'Horiz.'], ['vertical', 'Vert.'], ['equilateral', '△ Equil.']].map(([k, l]) => (
                  <button key={k} style={S.btn(arrangement === k)} onClick={() => setArrangement(k)}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
