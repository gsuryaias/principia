import React, { useState, useMemo, useCallback } from 'react';

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
  popup: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' },
  popCard: { background: '#18181b', border: '1px solid #27272a', borderRadius: 16, padding: '24px 28px', maxWidth: 400, width: '90%' },
  popTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#f4f4f5' },
  popRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1f1f23', fontSize: 14 },
  popLabel: { color: '#71717a' },
  popVal: { color: '#e4e4e7', fontFamily: 'monospace', fontWeight: 600 },
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
  pill: (a) => ({ padding: '6px 16px', borderRadius: 8, border: `1px solid ${a ? '#6366f1' : '#27272a'}`, background: a ? 'rgba(99,102,241,0.15)' : 'transparent', color: a ? '#a5b4fc' : '#71717a', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }),
  fBtn: (a) => ({ padding: '6px 14px', borderRadius: 8, border: `1px solid ${a ? '#ef4444' : '#3f3f46'}`, background: a ? 'rgba(239,68,68,0.12)' : 'transparent', color: a ? '#fca5a5' : '#a1a1aa', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }),
};

const RK = 0.5, XK = 0.4, VS = 11, SD = 2, ND = 1.5;
const NAMES = ['LP-1 Residential', 'LP-2 Commercial', 'LP-3 Industrial', 'LP-4 Agricultural', 'LP-5 Residential', 'LP-6 Mixed'];
const LX = [250, 420, 590, 590, 420, 250];
const LY = [92, 92, 92, 308, 308, 308];
const SX = 75, SY = 200;
const DLOAD = [200, 300, 400, 250, 150, 250];
const PA = [0, 1, 2], PB = [5, 4, 3];

function vCol(v) {
  if (v <= 0) return '#ef4444';
  if (v >= 10.5) return '#22c55e';
  if (v >= 10.2) return '#eab308';
  return '#ef4444';
}

function getEdges(t) {
  const e = [
    { a: -1, b: 0 }, { a: 0, b: 1 }, { a: 1, b: 2 },
    { a: -1, b: 5 }, { a: 5, b: 4 }, { a: 4, b: 3 },
  ];
  if (t === 'ring') e.push({ a: 2, b: 3, nop: true });
  if (t === 'mesh') e.push({ a: 2, b: 3 }, { a: 0, b: 5 }, { a: 1, b: 4 });
  return e;
}

function eSt(a, b, pw, t, fi, nop) {
  if (nop && t === 'ring' && fi === null) return 'nop';
  const ap = a < 0 || pw[a], bp = b < 0 || pw[b];
  return (ap && bp) ? 'on' : 'off';
}

function compute(topo, ld, fi, pf) {
  const cp = pf, sp = Math.sqrt(1 - pf * pf);
  const Zd = RK * cp + XK * sp;
  const pw = Array(6).fill(true);
  let rm = 0;

  if (fi !== null) {
    pw[fi] = false;
    if (topo === 'radial') {
      const pA = PA.indexOf(fi), pB = PB.indexOf(fi);
      if (pA >= 0) for (let i = pA; i < 3; i++) pw[PA[i]] = false;
      if (pB >= 0) for (let i = pB; i < 3; i++) pw[PB[i]] = false;
      rm = 150;
    } else if (topo === 'ring') { rm = 22; }
    else { rm = 4; }
  }

  const vol = Array(6).fill(0);
  let tl = 0;
  const Ic = (kw, v) => kw / (Math.sqrt(3) * v * cp);
  const Dv = (I, km) => Math.sqrt(3) * I * Zd * km / 1000;
  const Pl = (I, km) => 3 * I * I * RK * km / 1000;

  if (topo === 'radial' || (topo === 'ring' && fi === null) || topo === 'mesh') {
    const mf = topo === 'mesh' ? 0.6 : 1;
    for (const path of [PA, PB]) {
      let V = VS;
      for (let i = 0; i < path.length; i++) {
        const idx = path[i];
        if (!pw[idx]) { vol[idx] = 0; continue; }
        let dl = 0;
        for (let j = i; j < path.length; j++) if (pw[path[j]]) dl += ld[path[j]];
        dl *= mf;
        const I = Ic(dl, V);
        V = Math.max(V - Dv(I, SD), 8);
        vol[idx] = V;
        tl += Pl(I, SD);
      }
    }
    if (topo === 'mesh') tl *= 1.05;
  } else if (topo === 'ring' && fi !== null) {
    const pA = PA.indexOf(fi), pB = PB.indexOf(fi);
    if (pA >= 0) {
      let V = VS;
      for (let i = 0; i < pA; i++) {
        let dl = 0;
        for (let j = i; j < pA; j++) dl += ld[PA[j]];
        const I = Ic(dl, V);
        V = Math.max(V - Dv(I, SD), 8);
        vol[PA[i]] = V;
        tl += Pl(I, SD);
      }
      const af = PA.slice(pA + 1);
      const el = af.reduce((s, i) => s + ld[i], 0);
      V = VS;
      for (let i = 0; i < PB.length; i++) {
        let dl = el;
        for (let j = i; j < PB.length; j++) dl += ld[PB[j]];
        const I = Ic(dl, V);
        V = Math.max(V - Dv(I, SD), 8);
        vol[PB[i]] = V;
        tl += Pl(I, SD);
      }
      const fo = [...af].reverse();
      for (let i = 0; i < fo.length; i++) {
        let dl = 0;
        for (let j = i; j < fo.length; j++) dl += ld[fo[j]];
        const d = i === 0 ? ND : SD;
        const I = Ic(dl, V);
        V = Math.max(V - Dv(I, d), 8);
        vol[fo[i]] = V;
        tl += Pl(I, d);
      }
    } else if (pB >= 0) {
      let V = VS;
      for (let i = 0; i < pB; i++) {
        let dl = 0;
        for (let j = i; j < pB; j++) dl += ld[PB[j]];
        const I = Ic(dl, V);
        V = Math.max(V - Dv(I, SD), 8);
        vol[PB[i]] = V;
        tl += Pl(I, SD);
      }
      const af = PB.slice(pB + 1);
      const el = af.reduce((s, i) => s + ld[i], 0);
      V = VS;
      for (let i = 0; i < PA.length; i++) {
        let dl = el;
        for (let j = i; j < PA.length; j++) dl += ld[PA[j]];
        const I = Ic(dl, V);
        V = Math.max(V - Dv(I, SD), 8);
        vol[PA[i]] = V;
        tl += Pl(I, SD);
      }
      const fo = [...af].reverse();
      for (let i = 0; i < fo.length; i++) {
        let dl = 0;
        for (let j = i; j < fo.length; j++) dl += ld[fo[j]];
        const d = i === 0 ? ND : SD;
        const I = Ic(dl, V);
        V = Math.max(V - Dv(I, d), 8);
        vol[fo[i]] = V;
        tl += Pl(I, d);
      }
    }
  }

  const totalLoad = ld.reduce((a, b) => a + b, 0);
  const served = ld.reduce((s, l, i) => pw[i] ? s + l : s, 0);
  const cons = ld.map(l => Math.round(l / 5));
  const totalCons = cons.reduce((a, b) => a + b, 0);
  const affCons = cons.reduce((s, c, i) => pw[i] ? s : s + c, 0);
  const pvs = vol.filter(v => v > 0);
  const minV = pvs.length ? Math.min(...pvs) : 0;
  const lossPct = served > 0 ? (tl / served) * 100 : 0;

  const prA = [{ d: 0, v: VS }];
  const prB = [{ d: 0, v: VS }];
  PA.forEach((idx, i) => prA.push({ d: (i + 1) * SD, v: pw[idx] ? vol[idx] : null }));
  PB.forEach((idx, i) => prB.push({ d: (i + 1) * SD, v: pw[idx] ? vol[idx] : null }));

  return { vol, pw, totalLoad, served, tl, lossPct, minV, cons, totalCons, affCons, rm, prA, prB };
}

function Diagram({ topo, loads, net, faultMode, fi, onNode }) {
  const edges = getEdges(topo);
  return (
    <svg viewBox="0 0 720 400" style={{ width: '100%', maxWidth: 720, height: 'auto' }}>
      <defs>
        <filter id="dg"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <text x={370} y={55} textAnchor="middle" fill="#3f3f46" fontSize={11} fontWeight={600} letterSpacing="0.1em">FEEDER A</text>
      <text x={370} y={375} textAnchor="middle" fill="#3f3f46" fontSize={11} fontWeight={600} letterSpacing="0.1em">FEEDER B</text>

      {edges.map((e, i) => {
        const st = eSt(e.a, e.b, net.pw, topo, fi, e.nop);
        const x1 = e.a < 0 ? SX : LX[e.a], y1 = e.a < 0 ? SY : LY[e.a];
        const x2 = LX[e.b], y2 = LY[e.b];
        const col = st === 'on' ? '#22c55e' : st === 'off' ? '#ef4444' : '#52525b';
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={st === 'on' ? 2.5 : 1.5}
              strokeDasharray={st !== 'on' ? '6 4' : 'none'} opacity={st === 'nop' ? 0.35 : 0.45} />
            {st === 'on' && [0, 1].map(pi => (
              <circle key={pi} r={3} fill={col} opacity={0.7} filter="url(#dg)">
                <animateMotion dur="2.5s" begin={`${pi * 1.25}s`} repeatCount="indefinite"
                  path={`M${x1},${y1} L${x2},${y2}`} />
              </circle>
            ))}
            {e.nop && st === 'nop' && (
              <g>
                <rect x={(x1 + x2) / 2 - 20} y={(y1 + y2) / 2 - 11} width={40} height={22} rx={5}
                  fill="#18181b" stroke="#3f3f46" strokeWidth={1} />
                <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 4} textAnchor="middle" fill="#71717a" fontSize={9} fontWeight={700}>NOP</text>
              </g>
            )}
            {e.nop && st === 'on' && (
              <text x={(x1 + x2) / 2 + 14} y={(y1 + y2) / 2 + 4} fill="#22c55e" fontSize={8} fontWeight={600}>CLOSED</text>
            )}
          </g>
        );
      })}

      {/* Distance markers on top feeder */}
      {[[SX, SY, LX[0], LY[0]], [LX[0], LY[0], LX[1], LY[1]], [LX[1], LY[1], LX[2], LY[2]]].map(([x1, y1, x2, y2], i) => (
        <text key={`da${i}`} x={(x1 + x2) / 2} y={Math.min(y1, y2) - 8} textAnchor="middle" fill="#3f3f46" fontSize={8}>2 km</text>
      ))}
      {[[SX, SY, LX[5], LY[5]], [LX[5], LY[5], LX[4], LY[4]], [LX[4], LY[4], LX[3], LY[3]]].map(([x1, y1, x2, y2], i) => (
        <text key={`db${i}`} x={(x1 + x2) / 2} y={Math.max(y1, y2) + 16} textAnchor="middle" fill="#3f3f46" fontSize={8}>2 km</text>
      ))}

      {/* Substation */}
      <g>
        <rect x={SX - 55} y={SY - 38} width={110} height={76} rx={12}
          fill="rgba(24,24,27,0.95)" stroke="#6366f1" strokeWidth={1.8} />
        <text x={SX} y={SY - 18} textAnchor="middle" fill="#818cf8" fontSize={10} fontWeight={600}>33/11 kV</text>
        <text x={SX} y={SY + 1} textAnchor="middle" fill="#e4e4e7" fontSize={12} fontWeight={700}>Substation</text>
        <text x={SX} y={SY + 20} textAnchor="middle" fill="#22c55e" fontSize={11} fontWeight={600}>11.0 kV</text>
      </g>

      {/* Load Points */}
      {NAMES.map((name, i) => {
        const x = LX[i], y = LY[i];
        const pw = net.pw[i], v = net.vol[i], isFault = fi === i;
        const vc = pw ? vCol(v) : '#ef4444';
        const short = name.split(' ');
        return (
          <g key={i} onClick={() => onNode(i)}
            style={{ cursor: faultMode ? 'crosshair' : 'pointer' }}>
            <rect x={x - 52} y={y - 33} width={104} height={66} rx={10}
              fill={isFault ? 'rgba(239,68,68,0.08)' : 'rgba(24,24,27,0.95)'}
              stroke={isFault ? '#ef4444' : vc} strokeWidth={isFault ? 2.2 : 1.2} />
            {isFault && <rect x={x - 52} y={y - 33} width={104} height={66} rx={10}
              fill="none" stroke="#ef4444" strokeWidth={2} opacity={0.5}>
              <animate attributeName="opacity" values="0.5;0.15;0.5" dur="1.5s" repeatCount="indefinite" />
            </rect>}
            <text x={x} y={y - 16} textAnchor="middle" fill="#a1a1aa" fontSize={9} fontWeight={500}>
              {short[0]}
            </text>
            <text x={x} y={y + 1} textAnchor="middle" fill="#d4d4d8" fontSize={10} fontWeight={600}>
              {loads[i]} kW
            </text>
            <text x={x} y={y + 18} textAnchor="middle" fill={vc} fontSize={11} fontWeight={700}>
              {pw ? `${v.toFixed(2)} kV` : 'NO SUPPLY'}
            </text>
            <text x={x} y={y + 30} textAnchor="middle" fill="#3f3f46" fontSize={8}>
              {short.slice(1).join(' ')}
            </text>
            {isFault && <text x={x + 44} y={y - 24} fill="#ef4444" fontSize={14}>⚡</text>}
          </g>
        );
      })}

      {faultMode && <text x={360} y={395} textAnchor="middle" fill="#ef4444" fontSize={11} opacity={0.7}>
        Click any load point to simulate a fault
      </text>}
    </svg>
  );
}

function VoltageChart({ net }) {
  const ML = 55, MR = 15, MT = 15, MB = 35, W = 680, H = 190;
  const PW = W - ML - MR, PH = H - MT - MB;
  const xS = d => ML + (d / 6) * PW;
  const yS = v => MT + ((11.2 - v) / 1.4) * PH;

  function drawLine(profile, color) {
    const pts = [];
    const segments = [];
    for (const p of profile) {
      if (p.v !== null && p.v !== undefined) {
        pts.push(p);
      } else {
        if (pts.length >= 2) segments.push([...pts]);
        pts.length = 0;
      }
    }
    if (pts.length >= 2) segments.push([...pts]);

    return (
      <g>
        {segments.map((seg, i) => (
          <polyline key={i} fill="none" stroke={color} strokeWidth={2} opacity={0.85}
            points={seg.map(p => `${xS(p.d)},${yS(p.v)}`).join(' ')} />
        ))}
        {profile.filter(p => p.v !== null && p.v !== undefined).map((p, i) => (
          <g key={i}>
            <circle cx={xS(p.d)} cy={yS(p.v)} r={4} fill={color} stroke="#09090b" strokeWidth={1.5} />
            {p.d > 0 && <text x={xS(p.d)} y={yS(p.v) - 8} textAnchor="middle" fill={color} fontSize={8} fontWeight={600}>
              {p.v.toFixed(2)}
            </text>}
          </g>
        ))}
      </g>
    );
  }

  return (
    <div style={{ padding: '0 16px 8px' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
        {/* Voltage zone backgrounds */}
        <rect x={ML} y={MT} width={PW} height={yS(10.5) - MT} fill="rgba(34,197,94,0.04)" />
        <rect x={ML} y={yS(10.5)} width={PW} height={yS(10.2) - yS(10.5)} fill="rgba(234,179,8,0.04)" />
        <rect x={ML} y={yS(10.2)} width={PW} height={yS(9.8) - yS(10.2)} fill="rgba(239,68,68,0.04)" />

        {/* Grid lines */}
        {[11.0, 10.8, 10.6, 10.4, 10.2, 10.0].map(v => (
          <line key={v} x1={ML} y1={yS(v)} x2={ML + PW} y2={yS(v)} stroke="#1e1e2e" strokeWidth={0.7} />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map(d => (
          <line key={d} x1={xS(d)} y1={MT} x2={xS(d)} y2={MT + PH} stroke="#1e1e2e" strokeWidth={0.5} />
        ))}

        {/* Zone boundary lines */}
        <line x1={ML} y1={yS(10.5)} x2={ML + PW} y2={yS(10.5)} stroke="#22c55e" strokeWidth={0.7} strokeDasharray="5 3" opacity={0.5} />
        <line x1={ML} y1={yS(10.2)} x2={ML + PW} y2={yS(10.2)} stroke="#eab308" strokeWidth={0.7} strokeDasharray="5 3" opacity={0.5} />

        {/* Zone labels */}
        <text x={ML + PW + 2} y={yS(10.5) + 3} fill="#22c55e" fontSize={7} opacity={0.7}>10.5</text>
        <text x={ML + PW + 2} y={yS(10.2) + 3} fill="#eab308" fontSize={7} opacity={0.7}>10.2</text>

        {/* Y axis labels */}
        {[11.0, 10.5, 10.0].map(v => (
          <text key={v} x={ML - 5} y={yS(v) + 3} textAnchor="end" fill="#52525b" fontSize={9}>{v.toFixed(1)}</text>
        ))}
        <text x={12} y={(MT + MT + PH) / 2} textAnchor="middle" fill="#52525b" fontSize={9}
          transform={`rotate(-90, 12, ${(MT + MT + PH) / 2})`}>Voltage (kV)</text>

        {/* X axis labels */}
        {[0, 2, 4, 6].map(d => (
          <text key={d} x={xS(d)} y={MT + PH + 18} textAnchor="middle" fill="#52525b" fontSize={9}>{d}</text>
        ))}
        <text x={ML + PW / 2} y={H - 2} textAnchor="middle" fill="#52525b" fontSize={9}>Distance from Substation (km)</text>

        {/* Axes */}
        <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="#27272a" strokeWidth={1} />
        <line x1={ML} y1={MT + PH} x2={ML + PW} y2={MT + PH} stroke="#27272a" strokeWidth={1} />

        {/* Feeder lines */}
        {drawLine(net.prA, '#3b82f6')}
        {drawLine(net.prB, '#f97316')}

        {/* Legend */}
        <line x1={ML + PW - 120} y1={MT + 8} x2={ML + PW - 100} y2={MT + 8} stroke="#3b82f6" strokeWidth={2} />
        <text x={ML + PW - 96} y={MT + 11} fill="#3b82f6" fontSize={9}>Feeder A</text>
        <line x1={ML + PW - 120} y1={MT + 22} x2={ML + PW - 100} y2={MT + 22} stroke="#f97316" strokeWidth={2} />
        <text x={ML + PW - 96} y={MT + 25} fill="#f97316" fontSize={9}>Feeder B</text>

        <text x={ML + 4} y={MT + 10} fill="#52525b" fontSize={10} fontWeight={600}>VOLTAGE PROFILE</text>
      </svg>
    </div>
  );
}

function NodePopup({ idx, loads, net, onLoad, onClose }) {
  if (idx === null) return null;
  const v = net.vol[idx], pw = net.pw[idx];
  const feeder = PA.includes(idx) ? 'Feeder A (Top)' : 'Feeder B (Bottom)';
  const dist = (PA.includes(idx) ? PA.indexOf(idx) + 1 : PB.indexOf(idx) + 1) * SD;
  const cons = Math.round(loads[idx] / 5);
  const rows = [
    ['Feeder', feeder],
    ['Distance from SS', `${dist} km`],
    ['Status', pw ? 'Energized' : 'De-energized (Fault)'],
    ['Consumers Served', `~${cons}`],
  ];
  return (
    <div style={S.popup} onClick={onClose}>
      <div style={S.popCard} onClick={e => e.stopPropagation()}>
        <div style={S.popTitle}>{NAMES[idx]}</div>
        {rows.map(([l, val]) => (
          <div key={l} style={S.popRow}>
            <span style={S.popLabel}>{l}</span>
            <span style={S.popVal}>{val}</span>
          </div>
        ))}
        <div style={S.popRow}>
          <span style={S.popLabel}>Voltage</span>
          <span style={{ ...S.popVal, color: pw ? vCol(v) : '#ef4444' }}>
            {pw ? `${v.toFixed(3)} kV (${((VS - v) / VS * 100).toFixed(1)}% drop)` : 'No Supply'}
          </span>
        </div>
        <div style={{ padding: '12px 0 4px', borderBottom: '1px solid #1f1f23' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={S.popLabel}>Load (kW)</span>
            <span style={{ ...S.popVal, color: '#a5b4fc' }}>{loads[idx]} kW</span>
          </div>
          <input type="range" min={50} max={500} step={10} value={loads[idx]}
            onChange={e => onLoad(idx, +e.target.value)}
            style={{ ...S.slider, width: '100%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#3f3f46' }}>50 kW</span>
            <span style={{ fontSize: 10, color: '#3f3f46' }}>500 kW</span>
          </div>
        </div>
        <button style={S.popClose} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function TheorySVGTopologies() {
  return (
    <svg viewBox="0 0 760 340" style={{ width: '100%', maxWidth: 760, height: 'auto', margin: '20px 0' }}>
      <rect width="760" height="340" rx="12" fill="#111114" stroke="#27272a" />
      <text x="380" y="28" textAnchor="middle" fill="#d4d4d8" fontSize={14} fontWeight={700}>Distribution Network Topologies</text>

      {/* Radial */}
      <text x="130" y="58" textAnchor="middle" fill="#ef4444" fontSize={11} fontWeight={600}>Radial System</text>
      <rect x="110" y="70" width="40" height="24" rx="4" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth={1.5} />
      <text x="130" y="86" textAnchor="middle" fill="#a5b4fc" fontSize={8}>S/S</text>
      <line x1="130" y1="94" x2="130" y2="120" stroke="#52525b" strokeWidth={2} />
      <line x1="130" y1="120" x2="80" y2="150" stroke="#52525b" strokeWidth={1.5} />
      <line x1="130" y1="120" x2="180" y2="150" stroke="#52525b" strokeWidth={1.5} />
      <line x1="80" y1="150" x2="60" y2="180" stroke="#52525b" strokeWidth={1} />
      <line x1="80" y1="150" x2="100" y2="180" stroke="#52525b" strokeWidth={1} />
      <line x1="180" y1="150" x2="160" y2="180" stroke="#52525b" strokeWidth={1} />
      <line x1="180" y1="150" x2="200" y2="180" stroke="#52525b" strokeWidth={1} />
      {[60, 100, 160, 200].map(x => <circle key={x} cx={x} cy="184" r="5" fill="#ef4444" opacity={0.6} />)}
      {[80, 180].map(x => <circle key={x} cx={x} cy="154" r="5" fill="#f59e0b" opacity={0.6} />)}
      <text x="130" y="210" textAnchor="middle" fill="#71717a" fontSize={8}>Single source, tree structure</text>
      <text x="130" y="222" textAnchor="middle" fill="#ef4444" fontSize={8}>Any fault = downstream outage</text>

      {/* Ring Main */}
      <text x="380" y="58" textAnchor="middle" fill="#22c55e" fontSize={11} fontWeight={600}>Ring Main System</text>
      <rect x="360" y="70" width="40" height="24" rx="4" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth={1.5} />
      <text x="380" y="86" textAnchor="middle" fill="#a5b4fc" fontSize={8}>S/S</text>
      <line x1="380" y1="94" x2="380" y2="110" stroke="#52525b" strokeWidth={2} />
      {/* Ring */}
      <path d="M340,130 L320,160 L320,190 L380,210 L440,190 L440,160 L420,130 Z" fill="none" stroke="#22c55e" strokeWidth={2} />
      <line x1="380" y1="110" x2="340" y2="130" stroke="#52525b" strokeWidth={2} />
      <line x1="380" y1="110" x2="420" y2="130" stroke="#52525b" strokeWidth={2} />
      {[[340,130],[320,160],[320,190],[380,210],[440,190],[440,160],[420,130]].map(([x,y],i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill="#22c55e" opacity={0.6} />
          <rect x={x-2} y={y-2} width="4" height="4" rx="1" fill="none" stroke="#22c55e" strokeWidth={0.8} />
        </g>
      ))}
      <text x="380" y="240" textAnchor="middle" fill="#71717a" fontSize={8}>Closed loop with RMUs</text>
      <text x="380" y="252" textAnchor="middle" fill="#22c55e" fontSize={8}>Fault = only 1 section isolated</text>

      {/* Mesh */}
      <text x="630" y="58" textAnchor="middle" fill="#6366f1" fontSize={11} fontWeight={600}>Mesh / Network</text>
      <rect x="590" y="70" width="40" height="24" rx="4" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth={1.5} />
      <text x="610" y="86" textAnchor="middle" fill="#a5b4fc" fontSize={8}>S/S1</text>
      <rect x="650" y="70" width="40" height="24" rx="4" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth={1.5} />
      <text x="670" y="86" textAnchor="middle" fill="#a5b4fc" fontSize={8}>S/S2</text>
      {/* Grid lines */}
      {[110,150,190].map(y => (
        <g key={y}>
          <line x1="580" y1={y} x2="680" y2={y} stroke="#818cf8" strokeWidth={1.5} />
        </g>
      ))}
      {[580,610,640,680].map(x => (
        <line key={x} x1={x} y1="110" x2={x} y2="190" stroke="#818cf8" strokeWidth={1} />
      ))}
      <line x1="610" y1="94" x2="610" y2="110" stroke="#52525b" strokeWidth={2} />
      <line x1="670" y1="94" x2="670" y2="110" stroke="#52525b" strokeWidth={2} />
      {[580,610,640,680].flatMap(x => [110,150,190].map(y => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill="#818cf8" opacity={0.5} />
      )))}
      <text x="630" y="218" textAnchor="middle" fill="#71717a" fontSize={8}>Multiple sources & paths</text>
      <text x="630" y="230" textAnchor="middle" fill="#6366f1" fontSize={8}>Highest reliability & cost</text>

      {/* Voltage profile comparison at bottom */}
      <line x1="40" y1="270" x2="720" y2="270" stroke="#27272a" strokeWidth={0.5} />
      <text x="380" y="290" textAnchor="middle" fill="#d4d4d8" fontSize={11} fontWeight={600}>Voltage Drop Profile Comparison</text>
      <line x1="100" y1="310" x2="660" y2="310" stroke="#3f3f46" strokeWidth={0.5} />
      <text x="90" y="314" textAnchor="end" fill="#52525b" fontSize={8}>1.0 pu</text>
      <line x1="100" y1="325" x2="660" y2="325" stroke="#3f3f46" strokeWidth={0.5} strokeDasharray="4,3" />
      <text x="90" y="329" textAnchor="end" fill="#52525b" fontSize={8}>0.94</text>
      {/* Radial - steep drop */}
      <path d="M100,310 L300,312 L500,322 L660,330" fill="none" stroke="#ef4444" strokeWidth={1.5} />
      <text x="665" y="333" fill="#ef4444" fontSize={7}>Radial</text>
      {/* Ring - moderate */}
      <path d="M100,310 L300,311 L500,314 L660,316" fill="none" stroke="#22c55e" strokeWidth={1.5} />
      <text x="665" y="319" fill="#22c55e" fontSize={7}>Ring</text>
      {/* Mesh - flat */}
      <path d="M100,310 L300,310.5 L500,311 L660,311.5" fill="none" stroke="#818cf8" strokeWidth={1.5} />
      <text x="665" y="314" fill="#818cf8" fontSize={7}>Mesh</text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Distribution Systems — Radial, Ring Main & Mesh</h2>
      <p style={S.p}>
        Distribution systems carry power from 33/11 kV substations to end consumers. The topology
        chosen for a distribution network directly impacts its <strong style={{ color: '#e4e4e7' }}>reliability</strong>,{' '}
        <strong style={{ color: '#e4e4e7' }}>voltage quality</strong>, and{' '}
        <strong style={{ color: '#e4e4e7' }}>cost</strong>. The three fundamental topologies are
        radial, ring main, and mesh — each with distinct trade-offs.
      </p>

      <TheorySVGTopologies />

      <h3 style={S.h3}>Topology Comparison</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Feature</th>
            <th style={S.th}>Radial</th>
            <th style={S.th}>Ring Main</th>
            <th style={S.th}>Mesh</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Capital Cost', 'Lowest', 'Moderate (+50–80%)', 'Highest (+100–150%)'],
            ['Reliability', 'Lowest — full downstream outage', 'High — sectional isolation', 'Highest — multiple paths'],
            ['Voltage Profile', 'Poor at feeder tail', 'Better — dual feed path', 'Best — distributed supply'],
            ['I²R Losses', 'Highest', 'Moderate', 'Lowest (~40% less)'],
            ['Fault Impact', 'Large area affected', 'Single section isolated', 'Minimal disruption'],
            ['Restoration Time', '2–4 hours (manual)', '15–30 min (RMU)', '2–5 min (auto)'],
            ['Maintenance', 'Simple', 'Moderate', 'Complex'],
            ['Typical Use', 'Rural / sparse loads', 'Urban areas', 'CBD / critical loads'],
          ].map(([f, r, ri, m]) => (
            <tr key={f}>
              <td style={{ ...S.td, color: '#d4d4d8', fontWeight: 500 }}>{f}</td>
              <td style={S.td}>{r}</td>
              <td style={S.td}>{ri}</td>
              <td style={S.td}>{m}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>Voltage Drop Calculation in a Radial Feeder</h3>
      <p style={S.p}>
        For each section of a 3-phase feeder carrying current I over length L with impedance
        (R + jX) Ω/km, the line-to-line voltage drop is:
      </p>
      <div style={S.eq}>ΔV = √3 × I × (R·cosφ + X·sinφ) × L</div>
      <p style={S.p}>
        Where the section current I depends on the total downstream load:
      </p>
      <div style={S.eq}>I = P_downstream / (√3 × V × cosφ)</div>
      <p style={S.p}>
        In a radial feeder, each section carries the cumulative load of all downstream consumers.
        The first section (near the substation) carries the highest current and suffers the highest drop.
        Voltage at the tail end is the sum of all section drops:
      </p>
      <div style={S.eq}>V_tail = V_SS − Σ(ΔV_section)  for all sections</div>
      <p style={S.p}>
        As per Indian Electricity Rules, voltage regulation at 11 kV should be within{' '}
        <strong style={{ color: '#e4e4e7' }}>±6%</strong> — that is, voltage should remain between
        10.34 kV and 11.66 kV. This simulation uses 10.5 kV (green), 10.2 kV (yellow), and below 10.2 kV (red)
        as visual thresholds.
      </p>

      <h3 style={S.h3}>I²R Loss Calculation</h3>
      <p style={S.p}>
        Total three-phase losses in a feeder section:
      </p>
      <div style={S.eq}>P_loss = 3 × I² × R × L  (watts)</div>
      <p style={S.p}>Equivalently, in terms of power and voltage:</p>
      <div style={S.eq}>P_loss = P² × R × L / (V² × cos²φ)</div>
      <p style={S.p}>
        Since losses scale with I², a ring main system where current is shared between two paths
        can reduce losses by up to 75% compared to a single radial feeder carrying the same total
        load (since (I/2)² = I²/4 per path, total = I²/2).
      </p>

      <h3 style={S.h3}>11 kV Feeder Design Standards</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Maximum feeder length:</strong> 20 km (urban), 30–40 km (rural) — per CEA guidelines</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Maximum load per feeder:</strong> 3–5 MW (varies by conductor size)</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Voltage regulation:</strong> ±6% as per Indian Electricity Rules (IE Rules 1956, amended)</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Conductor:</strong> ACSR Dog (100 mm², 190A rating), ACSR Weasel (30 mm²) for laterals</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Impedance (ACSR Dog):</strong> R = 0.5 Ω/km, X = 0.4 Ω/km at 11 kV</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Protection:</strong> Overcurrent relays, auto-reclosers, sectionalizers</li>
      </ul>

      <h3 style={S.h3}>Reliability Indices — SAIFI & SAIDI</h3>
      <p style={S.p}>
        Two key indices measure distribution system reliability:
      </p>
      <div style={S.eq}>SAIFI = Σ(N_i) / N_T = Total customer interruptions / Total customers served</div>
      <div style={S.eq}>SAIDI = Σ(r_i × N_i) / N_T = Total customer interruption duration / Total customers</div>
      <p style={S.p}>
        Where N_i is the number of customers affected by interruption i, r_i is its duration, and N_T
        is the total number of customers. <strong style={{ color: '#e4e4e7' }}>SAIFI</strong> measures
        frequency (how often), while <strong style={{ color: '#e4e4e7' }}>SAIDI</strong> measures
        duration (how long). Lower values indicate better reliability.
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Index</th>
            <th style={S.th}>Rural Target</th>
            <th style={S.th}>Urban Target</th>
            <th style={S.th}>Metro Target</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={S.td}>SAIFI (int./yr)</td><td style={S.td}>50–70</td><td style={S.td}>10–20</td><td style={S.td}>{'<'}5</td></tr>
          <tr><td style={S.td}>SAIDI (hrs/yr)</td><td style={S.td}>100–200</td><td style={S.td}>20–50</td><td style={S.td}>{'<'}10</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>Indian Distribution Practice</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Rural areas:</strong> Predominantly radial feeders (80–90% of Indian distribution). Long feeder lengths (20–40 km) with multiple laterals and distribution transformers.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Urban areas:</strong> Ring main systems using 11 kV Ring Main Units (RMUs). RMUs have load-break switches and fuses, enabling quick sectional isolation.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Metro / CBD:</strong> Mesh or interconnected systems with XLPE cables, providing redundant supply paths for critical loads (hospitals, IT parks, government buildings).</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>HVDS conversion:</strong> Rural areas increasingly converting from LT-heavy radial to High Voltage Distribution Systems (11 kV closer to consumer, smaller DTRs) to reduce AT&C losses.</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>Real-World Context — AP DISCOMs</span>
        <p style={S.ctxP}>
          AP DISCOMs (APSPDCL and APEPDCL) primarily use radial feeders in rural areas with feeder
          lengths up to 30–40 km. Urban areas like Visakhapatnam, Vijayawada, and Tirupati use ring
          main systems with 11 kV RMUs for improved reliability. SAIFI targets are 50–70 interruptions/year
          for rural feeders and 10–20 for urban. Under RDSS (Revamped Distribution Sector Scheme),
          both DISCOMs are deploying smart meters, SCADA, and automated switching to reduce AT&C losses
          from ~14% (current) toward single digits. APEPDCL has implemented FLISR in select Visakhapatnam
          urban feeders with auto-reclosers and remote-controlled sectionalizers.
        </p>
      </div>

      <h3 style={S.h3}>FLISR — Fault Location, Isolation & Service Restoration</h3>
      <p style={S.p}>
        FLISR is a SCADA-based distribution automation scheme that automates the fault handling process:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Fault Location:</strong> Fault passage indicators (FPIs) on feeders detect fault current direction and magnitude. SCADA correlates FPI data to locate the faulted section.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Isolation:</strong> Motorized sectionalizers and reclosers remotely open to isolate the faulted section — typically within 30–60 seconds.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Service Restoration:</strong> The NOP on the ring main is closed automatically, restoring supply to healthy sections from an alternate feeder. Total restoration in 2–5 minutes vs. 2–4 hours manual.</li>
      </ul>
      <p style={S.p}>
        FLISR reduces SAIDI dramatically and is a key feature of modern smart grid deployments
        under India's National Smart Grid Mission (NSGM).
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Simulation Assumptions</span>
        <p style={S.ctxP}>
          This simulation uses simplified power flow with ACSR Dog conductor (R = 0.5 Ω/km, X = 0.4 Ω/km)
          at 11 kV. Sections are 2 km each. The mesh topology approximates parallel path sharing with a
          60% current reduction factor per feeder — in practice, mesh load flow requires iterative
          Newton-Raphson or Gauss-Seidel methods. Ring main voltage during fault restoration is
          computed by extending the alternate feeder path through the NOP.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Central Electricity Authority (CEA) — Distribution Planning Manual</li>
        <li style={S.li}>APERC Standards of Performance for Distribution Licensees</li>
        <li style={S.li}>IEEE 1366 — Guide for Electric Power Distribution Reliability Indices</li>
        <li style={S.li}>Indian Electricity Rules, 1956 (Amendment 2005) — Voltage Regulation Standards</li>
        <li style={S.li}>Bureau of Indian Standards — IS 398 (ACSR conductors)</li>
        <li style={S.li}>RDSS (Revamped Distribution Sector Scheme) Guidelines — Ministry of Power, GoI</li>
      </ul>
    </div>
  );
}

export default function DistributionSystems() {
  const [tab, setTab] = useState('simulate');
  const [topo, setTopo] = useState('radial');
  const [loads, setLoads] = useState([...DLOAD]);
  const [fi, setFi] = useState(null);
  const [faultMode, setFaultMode] = useState(false);
  const [selNode, setSelNode] = useState(null);
  const [pf, setPf] = useState(0.85);

  const net = useMemo(() => compute(topo, loads, fi, pf), [topo, loads, fi, pf]);

  const handleTopo = useCallback((t) => { setTopo(t); setFi(null); setFaultMode(false); }, []);
  const handleNode = useCallback((idx) => {
    if (faultMode) setFi(prev => prev === idx ? null : idx);
    else setSelNode(prev => prev === idx ? null : idx);
  }, [faultMode]);
  const handleLoad = useCallback((idx, val) => {
    setLoads(prev => { const n = [...prev]; n[idx] = val; return n; });
  }, []);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram topo={topo} loads={loads} net={net} faultMode={faultMode} fi={fi} onNode={handleNode} />
          </div>

          <VoltageChart net={net} />

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Total Load</span>
              <span style={{ ...S.rv, color: '#3b82f6' }}>{net.totalLoad} kW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Voltage (Last Bus)</span>
              <span style={{ ...S.rv, color: vCol(net.minV) }}>{net.minV > 0 ? `${net.minV.toFixed(2)} kV` : '—'}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>I²R Loss</span>
              <span style={{ ...S.rv, color: '#ef4444' }}>{net.tl.toFixed(1)} kW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Loss %</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{net.lossPct.toFixed(2)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Fault — Consumers Affected</span>
              <span style={{ ...S.rv, color: net.affCons > 0 ? '#ef4444' : '#22c55e' }}>
                {fi !== null ? `${net.affCons} / ${net.totalCons} (~${net.rm} min restore)` : 'None'}
              </span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Topology</span>
              {['radial', 'ring', 'mesh'].map(t => (
                <button key={t} style={S.pill(topo === t)} onClick={() => handleTopo(t)}>
                  {t === 'ring' ? 'Ring Main' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div style={S.cg}>
              <span style={S.label}>Power Factor</span>
              <input type="range" min={70} max={100} value={Math.round(pf * 100)}
                onChange={e => setPf(+e.target.value / 100)} style={S.slider} />
              <span style={S.val}>{pf.toFixed(2)}</span>
            </div>
            <div style={S.cg}>
              <button style={S.fBtn(faultMode)} onClick={() => setFaultMode(p => !p)}>
                {faultMode ? '⚡ Fault Mode ON' : 'Simulate Fault'}
              </button>
              {fi !== null && (
                <button style={S.fBtn(false)} onClick={() => { setFi(null); setFaultMode(false); }}>
                  Clear Fault
                </button>
              )}
            </div>
            <span style={{ fontSize: 12, color: '#3f3f46', marginLeft: 'auto' }}>
              Click nodes to adjust loads
            </span>
          </div>

          {selNode !== null && (
            <NodePopup idx={selNode} loads={loads} net={net} onLoad={handleLoad} onClose={() => setSelNode(null)} />
          )}
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
