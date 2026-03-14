import React, { useState, useMemo } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '16px 16px 8px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
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

const F0 = 50, S_SYS = 10000, STEP_MW = 500, DT = 0.02, TMAX = 20, TSTEP = 2;

function simFreq(Heff, govCap, R, D, Tg) {
  const H = Math.max(0.15, Heff);
  const dp = STEP_MW / S_SYS;
  const pts = [];
  let dw = 0, pg = 0;
  for (let t = 0; t <= TMAX; t += DT) {
    pts.push({ t, f: F0 * (1 + dw) });
    if (t >= TSTEP) {
      pg += (((-dw) / R) * govCap - pg) * DT / Tg;
      dw += (pg - D * dw - dp) * DT / (2 * H);
    }
  }
  return pts;
}

function compute(H, rePct, synth, invT) {
  const alpha = rePct / 100;
  const Hinv = invT === 'gfm' ? 5 : synth ? 3 : 0;
  const Heff = Math.max(0.15, H * (1 - alpha) + Hinv * alpha);
  const govCap = invT === 'gfm' ? 1.0 : Math.max(0.05, 1 - alpha);

  const cur = simFreq(Heff, govCap, 0.04, 1, 5);
  const base = simFreq(H, 1.0, 0.04, 1, 5);

  let nadir = F0, nadirT = 0;
  cur.forEach(p => { if (p.f < nadir) { nadir = p.f; nadirT = p.t; } });

  let rocof = 0;
  for (let i = 1; i < cur.length; i++) {
    const r = Math.abs((cur[i].f - cur[i - 1].f) / DT);
    if (r > rocof) rocof = r;
  }

  const settle = cur.slice(-100).reduce((s, p) => s + p.f, 0) / 100;
  const Irated = 500 / (Math.sqrt(3) * 20);

  return { Heff, alpha, govCap, cur, base, nadir, nadirT, rocof, settle, Irated };
}

/* ═══════════ Frequency Response View ═══════════ */

function FreqView({ sim, stepped, invType, syncH }) {
  const W = 1020, VH = 530;
  const PL = 75, PR = 980, PT = 100, PB = 490;
  const tx = t => PL + (t / TMAX) * (PR - PL);

  let fLo, fHi;
  if (stepped) {
    const af = [...sim.cur, ...sim.base].map(p => p.f);
    fLo = Math.floor(Math.min(...af) * 10) / 10 - 0.05;
    fHi = Math.max(50.06, Math.ceil(Math.max(...af) * 10) / 10 + 0.05);
  } else {
    fLo = 49.85; fHi = 50.15;
  }
  const fy = f => PT + ((fHi - f) / (fHi - fLo)) * (PB - PT);
  const poly = arr => arr.filter((_, i) => i % 4 === 0)
    .map(p => `${tx(p.t).toFixed(1)},${fy(p.f).toFixed(1)}`).join(' ');

  const hG = [], vG = [];
  for (let f = Math.ceil(fLo * 10) / 10; f <= fHi; f = +(f + 0.1).toFixed(1)) hG.push(f);
  for (let t = 0; t <= TMAX; t += 2) vG.push(t);

  return (
    <svg viewBox={`0 0 ${W} ${VH}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <rect x={40} y={12} width={130} height={42} rx={8} fill="rgba(59,130,246,0.08)" stroke="#3b82f6" />
      <text x={105} y={30} textAnchor="middle" fill="#93c5fd" fontSize={10} fontWeight={600}>Sync Generator</text>
      <text x={105} y={44} textAnchor="middle" fill="#3b82f6" fontSize={9}>H = {syncH}s</text>
      <line x1={170} y1={33} x2={340} y2={33} stroke="#3b82f6" strokeWidth={1.5} />
      {[0, 1, 2].map(i => (
        <circle key={`sb${i}`} r={3} fill="#3b82f6" opacity={0.7}>
          <animateMotion dur="1.8s" begin={`${i * 0.6}s`} repeatCount="indefinite" path="M170,33 L340,33" />
        </circle>
      ))}

      <rect x={340} y={16} width={170} height={34} rx={5} fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth={1.5} />
      <text x={425} y={38} textAnchor="middle" fill="#a5b4fc" fontSize={11} fontWeight={700}>GRID BUS · {F0} Hz</text>

      <rect x={660} y={12} width={140} height={42} rx={8} fill="rgba(245,158,11,0.08)" stroke="#f59e0b" />
      <text x={730} y={30} textAnchor="middle" fill="#fbbf24" fontSize={10} fontWeight={600}>Inverter (IBR)</text>
      <text x={730} y={44} textAnchor="middle" fill="#f59e0b" fontSize={9}>{invType === 'gfm' ? 'Grid-Forming' : 'Grid-Following'}</text>
      <line x1={660} y1={33} x2={510} y2={33} stroke="#f59e0b" strokeWidth={1.5} />
      {[0, 1, 2].map(i => (
        <circle key={`ib${i}`} r={3} fill="#f59e0b" opacity={0.7}>
          <animateMotion dur="1.8s" begin={`${i * 0.6}s`} repeatCount="indefinite" path="M660,33 L510,33" />
        </circle>
      ))}

      <line x1={425} y1={50} x2={425} y2={72} stroke="#ef4444" strokeWidth={1.5} />
      <rect x={370} y={72} width={110} height={22} rx={4}
        fill={stepped ? 'rgba(239,68,68,0.08)' : 'rgba(39,39,42,0.4)'}
        stroke={stepped ? '#ef4444' : '#27272a'} />
      <text x={425} y={87} textAnchor="middle" fill={stepped ? '#fca5a5' : '#52525b'} fontSize={9} fontWeight={stepped ? 600 : 400}>
        {stepped ? `+${STEP_MW} MW STEP` : 'LOAD'}
      </text>

      <text x={860} y={24} fill="#52525b" fontSize={9}>Sync: {((1 - sim.alpha) * 100).toFixed(0)}%</text>
      <text x={860} y={38} fill="#52525b" fontSize={9}>RE: {(sim.alpha * 100).toFixed(0)}%</text>
      <text x={860} y={52} fill="#52525b" fontSize={9}>H_eff: {sim.Heff.toFixed(2)}s</text>

      <rect x={PL} y={PT} width={PR - PL} height={PB - PT} rx={4} fill="#0c0c0f" stroke="#1e1e2e" />
      {hG.map(f => (
        <g key={f}>
          <line x1={PL} y1={fy(f)} x2={PR} y2={fy(f)}
            stroke={Math.abs(f - 50) < 0.01 ? '#3f3f46' : '#1a1a1f'}
            strokeWidth={Math.abs(f - 50) < 0.01 ? 1 : 0.5}
            strokeDasharray={Math.abs(f - 50) < 0.01 ? '8 4' : undefined} />
          <text x={PL - 6} y={fy(f) + 4} textAnchor="end" fill="#52525b" fontSize={9} fontFamily="monospace">{f.toFixed(1)}</text>
        </g>
      ))}
      {vG.map(t => (
        <g key={t}>
          <line x1={tx(t)} y1={PT} x2={tx(t)} y2={PB} stroke="#1a1a1f" strokeWidth={0.5} />
          <text x={tx(t)} y={PB + 14} textAnchor="middle" fill="#52525b" fontSize={9} fontFamily="monospace">{t}s</text>
        </g>
      ))}
      <text x={PL - 44} y={(PT + PB) / 2} textAnchor="middle" fill="#71717a" fontSize={10}
        transform={`rotate(-90,${PL - 44},${(PT + PB) / 2})`}>Frequency (Hz)</text>
      <text x={(PL + PR) / 2} y={PB + 30} textAnchor="middle" fill="#71717a" fontSize={10}>Time (seconds)</text>

      {stepped ? (
        <g>
          <polyline points={poly(sim.base)} fill="none" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="6 3" opacity={0.5} />
          <polyline points={poly(sim.cur)} fill="none" stroke="#f59e0b" strokeWidth={2.5} />

          <circle cx={tx(sim.nadirT)} cy={fy(sim.nadir)} r={5} fill="#ef4444" stroke="#18181b" strokeWidth={2} />
          <line x1={tx(sim.nadirT)} y1={fy(sim.nadir) + 8} x2={tx(sim.nadirT)} y2={fy(sim.nadir) + 28} stroke="#ef4444" />
          <text x={tx(sim.nadirT)} y={fy(sim.nadir) + 40} textAnchor="middle" fill="#ef4444" fontSize={10} fontWeight={600}>
            NADIR {sim.nadir.toFixed(2)} Hz
          </text>

          <line x1={tx(15)} y1={fy(sim.settle)} x2={PR - 5} y2={fy(sim.settle)} stroke="#22c55e" strokeWidth={1} strokeDasharray="4 2" />
          <text x={PR - 8} y={fy(sim.settle) - 6} textAnchor="end" fill="#22c55e" fontSize={9}>
            f_settle = {sim.settle.toFixed(2)} Hz
          </text>

          <line x1={tx(TSTEP)} y1={PT} x2={tx(TSTEP)} y2={PB} stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" opacity={0.4} />
          <text x={tx(TSTEP) + 4} y={PT + 14} fill="#ef4444" fontSize={8} opacity={0.7}>t = {TSTEP}s</text>

          {(() => {
            const i0 = Math.round(TSTEP / DT) + 2, i1 = i0 + 12;
            if (i1 >= sim.cur.length) return null;
            const x1 = tx(sim.cur[i0].t), y1 = fy(sim.cur[i0].f);
            const x2 = tx(sim.cur[i1].t), y2 = fy(sim.cur[i1].f);
            const dx = x2 - x1, dy = y2 - y1;
            return (
              <g>
                <line x1={x1} y1={y1} x2={x2 + dx * 3.5} y2={y2 + dy * 3.5} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />
                <text x={x2 + dx * 3.5 + 5} y={y2 + dy * 3.5 - 4} fill="#a78bfa" fontSize={9}>
                  RoCoF = {sim.rocof.toFixed(2)} Hz/s
                </text>
              </g>
            );
          })()}

          <rect x={PR - 225} y={PT + 6} width={218} height={42} rx={6} fill="rgba(9,9,11,0.92)" stroke="#1e1e2e" />
          <line x1={PR - 213} y1={PT + 22} x2={PR - 183} y2={PT + 22} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="6 3" />
          <text x={PR - 177} y={PT + 26} fill="#93c5fd" fontSize={9}>Baseline (100% sync gen)</text>
          <line x1={PR - 213} y1={PT + 38} x2={PR - 183} y2={PT + 38} stroke="#f59e0b" strokeWidth={2.5} />
          <text x={PR - 177} y={PT + 42} fill="#fbbf24" fontSize={9}>Current system ({(sim.alpha * 100).toFixed(0)}% RE)</text>
        </g>
      ) : (
        <g>
          <line x1={PL} y1={fy(50)} x2={PR} y2={fy(50)} stroke="#6366f1" strokeWidth={2} />
          <text x={(PL + PR) / 2} y={(PT + PB) / 2 + 10} textAnchor="middle" fill="#52525b" fontSize={13}>
            Click "Apply 500 MW Load Step" to simulate frequency disturbance
          </text>
        </g>
      )}
    </svg>
  );
}

/* ═══════════ P-Q Capability View ═══════════ */

function PQView() {
  const W = 1020, VH = 520, Sn = 500, sc = 0.38;
  const lcx = 245, lcy = 270, rcx = 775, rcy = 270;

  const lx = p => lcx + p * sc, ly = q => lcy - q * sc;
  const rx = p => rcx + p * sc, ry = q => rcy - q * sc;

  const sgPts = [
    [0, 420], [50, 418], [100, 412], [150, 402], [200, 388], [250, 368], [300, 340],
    [350, 298], [400, 235], [430, 175], [460, 100], [480, 38], [Sn, 0],
    [480, -58], [460, -112], [430, -148], [400, -170], [350, -182],
    [300, -190], [200, -194], [100, -192], [0, -180],
  ];
  const sgPath = sgPts.map((p, i) => `${i ? 'L' : 'M'}${lx(p[0]).toFixed(1)},${ly(p[1]).toFixed(1)}`).join(' ') + ' Z';

  const invPts = [];
  for (let a = -90; a <= 90; a += 2) {
    const r = a * Math.PI / 180;
    invPts.push([Sn * Math.cos(r), Sn * Math.sin(r)]);
  }
  const invPath = invPts.map((p, i) => `${i ? 'L' : 'M'}${rx(p[0]).toFixed(1)},${ry(p[1]).toFixed(1)}`).join(' ') + ' Z';

  const qTicks = [-400, -200, 0, 200, 400];
  const pTicks = [0, 200, 400];

  function axes(cx, cy, xf, yf, title, col) {
    return (
      <g>
        <text x={cx} y={22} textAnchor="middle" fill={col} fontSize={13} fontWeight={700}>{title}</text>
        <text x={cx} y={37} textAnchor="middle" fill="#52525b" fontSize={10}>({Sn} MVA rated)</text>
        <line x1={cx} y1={yf(450)} x2={cx} y2={yf(-450)} stroke="#27272a" strokeWidth={1} />
        <line x1={xf(-20)} y1={cy} x2={xf(540)} y2={cy} stroke="#27272a" strokeWidth={1} />
        <text x={xf(530)} y={cy - 8} fill="#71717a" fontSize={9}>P (MW) →</text>
        <text x={cx + 8} y={yf(430)} fill="#71717a" fontSize={9}>Q lag ↑</text>
        <text x={cx + 8} y={yf(-430)} fill="#71717a" fontSize={9}>Q lead ↓</text>
        {qTicks.filter(q => q !== 0).map(q => (
          <g key={q}>
            <line x1={cx - 3} y1={yf(q)} x2={cx + 3} y2={yf(q)} stroke="#3f3f46" strokeWidth={0.5} />
            <text x={cx - 8} y={yf(q) + 3} textAnchor="end" fill="#3f3f46" fontSize={8}>{q}</text>
          </g>
        ))}
        {pTicks.filter(p => p > 0).map(p => (
          <g key={p}>
            <line x1={xf(p)} y1={cy - 3} x2={xf(p)} y2={cy + 3} stroke="#3f3f46" strokeWidth={0.5} />
            <text x={xf(p)} y={cy + 14} textAnchor="middle" fill="#3f3f46" fontSize={8}>{p}</text>
          </g>
        ))}
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${VH}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <line x1={W / 2} y1={10} x2={W / 2} y2={VH - 10} stroke="#1e1e2e" strokeWidth={1} strokeDasharray="4 4" />

      {axes(lcx, lcy, lx, ly, 'Synchronous Generator', '#93c5fd')}
      <path d={sgPath} fill="rgba(59,130,246,0.1)" stroke="#3b82f6" strokeWidth={1.8} />
      <text x={lx(410)} y={ly(210)} fill="#60a5fa" fontSize={8} fontWeight={500}>Armature</text>
      <text x={lx(410)} y={ly(198)} fill="#60a5fa" fontSize={8}>limit</text>
      <text x={lx(140)} y={ly(415)} fill="#93c5fd" fontSize={8} fontWeight={500}>Field current limit</text>
      <text x={lx(120)} y={ly(-210)} fill="#f87171" fontSize={8} fontWeight={500}>Under-excitation limit</text>
      <text x={lx(470)} y={ly(-20)} fill="#52525b" fontSize={7}>Stability</text>
      <circle cx={lx(350)} cy={ly(120)} r={4} fill="#22c55e" stroke="#18181b" strokeWidth={1.5} />
      <text x={lx(350) + 8} y={ly(120) + 4} fill="#22c55e" fontSize={8}>Typical OP</text>

      {axes(rcx, rcy, rx, ry, 'Inverter-Based Resource', '#fbbf24')}
      <path d={invPath} fill="rgba(245,158,11,0.08)" stroke="#f59e0b" strokeWidth={1.8} />
      <text x={rx(350)} y={ry(340)} fill="#fbbf24" fontSize={8} fontWeight={500}>MVA rating limit</text>
      <text x={rx(350)} y={ry(328)} fill="#fbbf24" fontSize={8}>(S = {Sn} MVA)</text>
      <text x={rx(200)} y={ry(-350)} fill="#f59e0b" fontSize={8}>Current limiter</text>
      <text x={rx(200)} y={ry(-362)} fill="#f59e0b" fontSize={8}>constrains boundary</text>
      <circle cx={rx(400)} cy={ry(0)} r={4} fill="#22c55e" stroke="#18181b" strokeWidth={1.5} />
      <text x={rx(400) + 8} y={ry(0) + 4} fill="#22c55e" fontSize={8}>Rated P</text>
      <circle cx={rx(0)} cy={ry(400)} r={3} fill="#a78bfa" stroke="#18181b" strokeWidth={1} />
      <text x={rx(0) + 8} y={ry(400) + 4} fill="#a78bfa" fontSize={7}>STATCOM mode</text>

      <rect x={W / 2 - 108} y={VH - 58} width={216} height={46} rx={8} fill="rgba(99,102,241,0.06)" stroke="#6366f1" strokeWidth={0.5} />
      <text x={W / 2} y={VH - 38} textAnchor="middle" fill="#818cf8" fontSize={9} fontWeight={600}>Key Differences</text>
      <text x={W / 2} y={VH - 25} textAnchor="middle" fill="#a1a1aa" fontSize={8}>Sync gen: D-curve, field + stability limits</text>
      <text x={W / 2} y={VH - 14} textAnchor="middle" fill="#a1a1aa" fontSize={8}>Inverter: circular MVA limit, symmetric Q range</text>
    </svg>
  );
}

/* ═══════════ Fault Current View ═══════════ */

function FaultView({ sim }) {
  const W = 1020, VH = 520;
  const PL = 90, PR = 580, PT = 55, PB = 450;
  const In = sim.Irated;
  const Id2 = In / 0.18, Id1 = In / 0.3, Iss = In / 0.5, Iinv = In * 1.2;
  const Imax = Id2 * 1.12;
  const tx = ms => PL + (ms / 500) * (PR - PL);
  const iy = i => PB - (i / Imax) * (PB - PT);

  const sgPts = [];
  for (let ms = 1; ms <= 500; ms += 2) {
    const t = ms / 1000;
    sgPts.push(`${tx(ms).toFixed(1)},${iy((Id2 - Id1) * Math.exp(-t / 0.03) + (Id1 - Iss) * Math.exp(-t / 0.2) + Iss).toFixed(1)}`);
  }

  const BL = 640, BR = 980, barMax = Math.ceil(Id2 / In);
  const bars = [
    { l: 'Subtransient', sub: "(I''d)", v: Id2 / In, c: '#3b82f6' },
    { l: 'Transient', sub: "(I'd)", v: Id1 / In, c: '#60a5fa' },
    { l: 'Steady-State', sub: '(Id)', v: Iss / In, c: '#93c5fd' },
    { l: 'Inverter', sub: '(limited)', v: Iinv / In, c: '#f59e0b' },
  ];
  const bw = 55, gap = 20, bx0 = BL + 35;

  const refs = [
    [In, `I_rated = ${In.toFixed(1)} kA`, '#22c55e'],
    [Id2, `${(Id2 / In).toFixed(1)}× rated`, '#93c5fd'],
    [Iss, `${(Iss / In).toFixed(1)}× rated`, '#60a5fa'],
  ];

  return (
    <svg viewBox={`0 0 ${W} ${VH}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <text x={(PL + PR) / 2} y={30} textAnchor="middle" fill="#f4f4f5" fontSize={13} fontWeight={600}>Fault Current — Time Domain</text>
      <text x={(BL + BR) / 2} y={30} textAnchor="middle" fill="#f4f4f5" fontSize={13} fontWeight={600}>Peak (× I_rated)</text>

      <rect x={PL} y={PT} width={PR - PL} height={PB - PT} rx={4} fill="#0c0c0f" stroke="#1e1e2e" />
      {[0, 100, 200, 300, 400, 500].map(ms => (
        <g key={ms}>
          <line x1={tx(ms)} y1={PT} x2={tx(ms)} y2={PB} stroke="#1a1a1f" strokeWidth={0.5} />
          <text x={tx(ms)} y={PB + 14} textAnchor="middle" fill="#52525b" fontSize={8}>{ms}ms</text>
        </g>
      ))}
      <text x={(PL + PR) / 2} y={PB + 30} textAnchor="middle" fill="#71717a" fontSize={9}>Time after fault inception</text>
      <text x={PL - 38} y={(PT + PB) / 2} textAnchor="middle" fill="#71717a" fontSize={9}
        transform={`rotate(-90,${PL - 38},${(PT + PB) / 2})`}>Current (kA)</text>

      {refs.map(([v, label, col]) => (
        <g key={label}>
          <line x1={PL} y1={iy(v)} x2={PR} y2={iy(v)} stroke={col} strokeWidth={0.5} strokeDasharray="4 3" opacity={0.4} />
          <text x={PR + 4} y={iy(v) + 3} fill={col} fontSize={7}>{label}</text>
        </g>
      ))}

      <polyline points={`${tx(0).toFixed(1)},${iy(0).toFixed(1)} ${sgPts.join(' ')}`}
        fill="none" stroke="#3b82f6" strokeWidth={2.5} />
      <line x1={tx(0)} y1={iy(0)} x2={tx(0)} y2={iy(Iinv)} stroke="#f59e0b" strokeWidth={2.5} />
      <line x1={tx(0)} y1={iy(Iinv)} x2={tx(500)} y2={iy(Iinv)} stroke="#f59e0b" strokeWidth={2.5} />

      <rect x={PL + 8} y={PT + 6} width={155} height={34} rx={5} fill="rgba(9,9,11,0.9)" stroke="#1e1e2e" />
      <line x1={PL + 18} y1={PT + 19} x2={PL + 43} y2={PT + 19} stroke="#3b82f6" strokeWidth={2.5} />
      <text x={PL + 48} y={PT + 23} fill="#93c5fd" fontSize={9}>Sync Generator</text>
      <line x1={PL + 18} y1={PT + 33} x2={PL + 43} y2={PT + 33} stroke="#f59e0b" strokeWidth={2.5} />
      <text x={PL + 48} y={PT + 37} fill="#fbbf24" fontSize={9}>Inverter (I-limited)</text>

      <rect x={BL} y={PT} width={BR - BL} height={PB - PT} rx={4} fill="#0c0c0f" stroke="#1e1e2e" />
      {Array.from({ length: barMax + 1 }, (_, i) => (
        <g key={i}>
          <line x1={BL} y1={PB - (i / barMax) * (PB - PT)} x2={BR} y2={PB - (i / barMax) * (PB - PT)} stroke="#1a1a1f" strokeWidth={0.5} />
          <text x={BL - 6} y={PB - (i / barMax) * (PB - PT) + 3} textAnchor="end" fill="#3f3f46" fontSize={8}>{i}×</text>
        </g>
      ))}
      {bars.map((b, i) => {
        const x = bx0 + i * (bw + gap);
        const h = (b.v / barMax) * (PB - PT);
        return (
          <g key={i}>
            <rect x={x} y={PB - h} width={bw} height={h} rx={4} fill={b.c} opacity={0.2} stroke={b.c} strokeWidth={1} />
            <text x={x + bw / 2} y={PB - h - 6} textAnchor="middle" fill={b.c} fontSize={11} fontWeight={700}>{b.v.toFixed(1)}×</text>
            <text x={x + bw / 2} y={PB + 14} textAnchor="middle" fill="#71717a" fontSize={8}>{b.l}</text>
            <text x={x + bw / 2} y={PB + 24} textAnchor="middle" fill="#52525b" fontSize={7}>{b.sub}</text>
          </g>
        );
      })}

      <rect x={BL + 8} y={PB + 36} width={BR - BL - 16} height={28} rx={6} fill="rgba(239,68,68,0.05)" stroke="#ef4444" strokeWidth={0.5} />
      <text x={(BL + BR) / 2} y={PB + 55} textAnchor="middle" fill="#fca5a5" fontSize={9}>
        IBR fault current too low for conventional overcurrent relays
      </text>
    </svg>
  );
}

/* ═══════════ Theory ═══════════ */

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Inverter-Based Resources vs Synchronous Generators</h2>
      <p style={S.p}>
        The global transition from conventional synchronous generators to inverter-based resources
        (IBRs) — primarily solar PV and wind — fundamentally changes the physical characteristics
        of the power grid. Unlike synchronous machines with massive rotating parts, IBRs interface
        through power electronic converters with entirely different dynamic behaviour. Understanding
        these differences is critical for maintaining grid stability as renewable energy penetration
        increases.
      </p>

      <h3 style={S.h3}>Synchronous Generator Fundamentals</h3>
      <p style={S.p}>
        A synchronous generator converts mechanical energy (steam, water, or gas turbine) into
        electrical energy via electromagnetic induction. The rotor — a massive rotating body with
        field windings — spins at synchronous speed locked to the grid frequency. This rotating
        mass stores kinetic energy and provides <strong style={{ color: '#e4e4e7' }}>inertia</strong> to
        the power system.
      </p>
      <p style={S.p}>
        The inertia constant <strong style={{ color: '#e4e4e7' }}>H</strong> quantifies stored kinetic
        energy relative to the machine's MVA rating:
      </p>
      <div style={S.eq}>H = ½Jω² / S_rated [seconds]</div>
      <p style={S.p}>
        Typical values: H = 3–5 s for large thermal units, 2–4 s for gas turbines, 2–6 s for
        hydro generators. A 500 MW thermal unit with H = 5 s stores 2,500 MJ of kinetic energy.
        When load exceeds generation, this stored energy is released automatically — the rotor
        decelerates, converting kinetic energy to electrical energy and slowing the frequency drop.
        The dynamics are governed by the <strong style={{ color: '#e4e4e7' }}>swing equation</strong>:
      </p>
      <div style={S.eq}>2H × d(Δω/ω₀)/dt = P_m − P_e [per unit]</div>
      <p style={S.p}>
        This inertial response is automatic, instantaneous, and requires no control action — it is
        an inherent physical property of the rotating mass coupled to the grid. It buys critical
        seconds for governors to ramp up mechanical power and restore the generation-load balance.
      </p>

      <h3 style={S.h3}>Inverter-Based Resources (IBR)</h3>
      <p style={S.p}>
        Solar PV and Type-4 (full-converter) wind turbines connect to the grid through power
        electronic inverters. The DC source (PV panels or variable-speed generator + rectifier)
        feeds a DC bus, which is converted to 50 Hz AC by a voltage source inverter (VSI) using
        IGBT or SiC semiconductor switches operating at kHz switching frequencies.
      </p>
      <p style={S.p}>
        Because there is no rotating mass coupled to the grid (or the rotating mass is decoupled by
        a full converter), IBRs provide <strong style={{ color: '#e4e4e7' }}>zero natural inertia</strong>.
        The inverter's output is controlled entirely by its software algorithms. This has profound
        implications for frequency stability, fault response, and protection coordination.
      </p>

      <h3 style={S.h3}>Grid-Following vs Grid-Forming Inverters</h3>
      <p style={S.p}>
        This distinction is the most critical technical challenge for high-RE grids:
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Characteristic</th>
            <th style={S.th}>Grid-Following (GFL)</th>
            <th style={S.th}>Grid-Forming (GFM)</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Control reference', 'Grid voltage angle via PLL', 'Internal voltage reference'],
            ['Electrical behaviour', 'Current source', 'Voltage source'],
            ['Inertia provision', 'None (or synthetic via dP/df)', 'Virtual inertia (inherent)'],
            ['Grid strength req.', 'Requires strong grid (SCR > 3)', 'Operates in weak grids (SCR < 2)'],
            ['Island operation', 'Cannot form or sustain', 'Can form and sustain island'],
            ['Black start', 'No', 'Yes (with energy storage)'],
            ['Frequency response', 'Delayed (measurement + control)', 'Inherent (swing-equation based)'],
            ['Technology maturity', 'Mature, widely deployed', 'Emerging, pilot deployments'],
          ].map(([c, gfl, gfm]) => (
            <tr key={c}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{c}</td>
              <td style={S.td}>{gfl}</td>
              <td style={S.td}>{gfm}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={S.p}>
        Grid-following inverters use a Phase-Locked Loop (PLL) to track the grid voltage angle and
        inject current accordingly — they behave as controlled current sources. In a system with
        100% GFL inverters and no synchronous machines, there is no voltage reference and the
        system collapses. Grid-forming inverters create their own voltage reference and behave
        as voltage sources behind impedance, mimicking synchronous machine behaviour and enabling
        stable operation even without synchronous generators.
      </p>

      <h3 style={S.h3}>Frequency Stability — RoCoF and Nadir</h3>
      <p style={S.p}>
        The Rate of Change of Frequency (RoCoF) immediately after a power imbalance is inversely
        proportional to system inertia:
      </p>
      <div style={S.eq}>RoCoF = df/dt = −ΔP × f₀ / (2 × H_sys × S_sys) [Hz/s]</div>
      <p style={S.p}>
        The effective system inertia is the aggregate of all online synchronous machines plus any
        virtual inertia from IBRs:
      </p>
      <div style={S.eq}>H_sys = Σ(H_i × S_i) / S_sys</div>
      <p style={S.p}>
        As IBRs displace synchronous generators, H_sys decreases, causing:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Higher RoCoF</strong> — frequency drops faster, potentially triggering RoCoF relays (typically 0.5–1.0 Hz/s settings)</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Deeper frequency nadir</strong> — may reach UFLS thresholds (49.5, 49.2, 49.0 Hz per IEGC)</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Less time for governors</strong> — nadir occurs sooner, before governor response has fully developed</li>
      </ul>

      <h3 style={S.h3}>Synthetic Inertia and Virtual Inertia</h3>
      <p style={S.p}>
        To mitigate inertia loss, inverters can emulate inertial response. The inverter monitors
        frequency, computes df/dt, and adjusts active power proportionally:
      </p>
      <div style={S.eq}>ΔP_synthetic = −K_inertia × (df/dt)</div>
      <p style={S.p}>
        <strong style={{ color: '#e4e4e7' }}>Synthetic inertia</strong> (grid-following) is a
        derivative-based control response with inherent measurement delay of 100–200 ms.
        <strong style={{ color: '#e4e4e7' }}> Virtual inertia</strong> (grid-forming) is inherent to the
        swing-equation-based control structure and responds within one switching cycle (~100 μs).
        Energy for inertial response comes from either curtailed headroom, DC-link capacitor
        energy, or co-located battery storage.
      </p>

      <h3 style={S.h3}>Fault Current — A Critical Difference</h3>
      <p style={S.p}>
        Synchronous generators contribute high fault currents due to their voltage-behind-impedance
        characteristic. During a three-phase fault, the subtransient reactance X''d determines the
        initial fault current:
      </p>
      <div style={S.eq}>I''_fault = E / X''d ≈ 5–7 × I_rated (subtransient, {'<'} 50 ms)</div>
      <div style={S.eq}>I'_fault = E / X'd ≈ 3–4 × I_rated (transient, decays over 0.5–2 s)</div>
      <p style={S.p}>
        Inverter-based resources have tight current limiters to protect IGBT/MOSFET switches from
        thermal destruction (junction temperature must stay below ~150°C):
      </p>
      <div style={S.eq}>I_fault_IBR ≈ 1.1–1.5 × I_rated (current limiter protection)</div>
      <p style={S.p}>
        This 4–5× difference has major protection implications:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Overcurrent relays</strong> may not pick up faults if IBR fault current is below relay pickup setting</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Distance relays</strong> may underreach or malfunction — the measured impedance depends on the inverter's current-limiting control, not on physical impedance</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Fuse-breaker coordination</strong> in distribution networks may fail with insufficient fault current</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Negative-sequence currents</strong> are typically suppressed by inverter controls, rendering negative-sequence-based directional elements ineffective</li>
      </ul>

      <h3 style={S.h3}>LVRT / HVRT Requirements</h3>
      <p style={S.p}>
        Grid codes require RE plants to ride through voltage disturbances rather than disconnecting
        (which would cascade the disturbance). CEA Technical Standards (2019 amendments) specify:
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Voltage at PCC</th>
            <th style={S.th}>Duration</th>
            <th style={S.th}>Requirement</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['0% (zero voltage)', '0.3 s', 'Must remain connected (LVRT)'],
            ['15%', '0.3–0.5 s', 'Must remain connected'],
            ['85%', '3.0 s', 'Must remain connected, inject Q'],
            ['100% (nominal)', 'Continuous', 'Normal operation'],
            ['110%', '3.0 s', 'Must remain connected (HVRT)'],
            ['120%', '0.16 s', 'Must remain connected (HVRT)'],
          ].map(([v, d, r]) => (
            <tr key={v}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{v}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{d}</td>
              <td style={S.td}>{r}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={S.p}>
        During voltage dips, IBRs must inject reactive current to support grid voltage:
      </p>
      <div style={S.eq}>ΔI_q / I_rated ≥ 2 × (V_nom − V_actual) / V_nom [for V {'>'} 0.5 pu]</div>

      <h3 style={S.h3}>CEA Technical Standards for RE Connectivity</h3>
      <p style={S.p}>
        The Central Electricity Authority (CEA) Technical Standards for Connectivity to the Grid
        (2007, amended 2013 and 2019) specify requirements for RE generators connecting at
        33 kV and above:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Frequency response:</strong> RE plants must curtail output when frequency exceeds 50.2 Hz. At 51.5 Hz, output must reach zero. Below 49.5 Hz, plants must not reduce output.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Power factor:</strong> Must operate between 0.95 lagging and 0.95 leading at PCC.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Harmonics:</strong> THD {'<'} 5% (current), individual harmonics per IEEE 519.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Anti-islanding:</strong> Must detect and disconnect from unintentional islands within 2 seconds.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Ramp rate:</strong> Maximum 10% of rated capacity per minute for solar {'>'} 50 MW at ISTS connection.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Forecasting:</strong> RE generators {'>'} 10 MW must provide day-ahead and intra-day generation forecasts to SLDC.</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>Real-World Context — Andhra Pradesh RE Integration</span>
        <p style={S.ctxP}>
          As AP's RE capacity grows (target 20+ GW solar and wind), the effective system inertia
          decreases because inverter-based plants replace synchronous generators on the merit order.
          AP Transco must ensure adequate inertia through synchronous condensers (repurposed retired
          thermal units), BESS with synthetic inertia, or grid-forming inverters. During low-demand
          periods (spring nights), RE can supply {'>'} 60% of state demand, pushing effective H below
          3 s. POSOCO / GRID-INDIA monitors system inertia in real-time and can curtail RE dispatch
          if RoCoF risks exceed acceptable limits (typically 0.5 Hz/s for the Indian grid). The
          recent commissioning of ±800 kV Raigarh–Pugalur HVDC (6,000 MW) also introduces converter-
          based dynamics that further reduce synchronous inertia share.
        </p>
      </div>

      <h3 style={S.h3}>IEEE 1547-2018 — DER Interconnection Standard</h3>
      <p style={S.p}>
        IEEE 1547-2018 (Standard for Interconnection and Interoperability of Distributed Energy
        Resources) defines three performance categories with increasing grid-support capabilities:
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Category</th>
            <th style={S.th}>Voltage Ride-Through</th>
            <th style={S.th}>Frequency Ride-Through</th>
            <th style={S.th}>Grid Support Functions</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Cat I', 'Basic', 'Basic', 'Limited (Volt-VAr optional)'],
            ['Cat II', 'Enhanced', 'Enhanced', 'Volt-VAr, Freq-Watt required'],
            ['Cat III', 'Most stringent', 'Most stringent', 'Full grid support, dynamic V'],
          ].map(([c, v, f, g]) => (
            <tr key={c}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{c}</td>
              <td style={S.td}>{v}</td>
              <td style={S.td}>{f}</td>
              <td style={S.td}>{g}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={S.p}>
        Category III DER must ride through voltages as low as 0% for up to 1 second and provide
        frequency-droop response equivalent to a 5% droop governor. IEEE 1547 also mandates
        anti-islanding, power quality limits, and communication interfaces (IEEE 2030.5 / SunSpec).
      </p>

      <h3 style={S.h3}>Key Equations Summary</h3>
      <p style={S.p}>Effective system inertia with RE penetration α:</p>
      <div style={S.eq}>H_eff = H_sync × (1 − α) + H_virtual × α</div>
      <p style={S.p}>Initial rate of change of frequency after a generation loss ΔP:</p>
      <div style={S.eq}>RoCoF₀ = −ΔP × f₀ / (2 × H_eff × S_sys)</div>
      <p style={S.p}>Frequency nadir (approximate, for first-order governor with time constant T_g):</p>
      <div style={S.eq}>f_nadir ≈ f₀ − ΔP × f₀ / (S_sys × D_eff) × [1 + e^(−π / √(T_g / (2H_eff × D_eff) − 1))]</div>
      <p style={S.p}>Inverter MVA capability constraint:</p>
      <div style={S.eq}>P² + Q² ≤ S_rated² [circular limit]</div>
      <p style={S.p}>Synchronous generator subtransient fault current:</p>
      <div style={S.eq}>I''_f = E'' / X''d where X''d ≈ 0.15–0.25 pu</div>

      <div style={S.ctx}>
        <span style={S.ctxT}>Assumptions in This Simulation</span>
        <p style={S.ctxP}>
          The frequency response uses a single-machine equivalent model with first-order governor
          dynamics (T_g = 5 s, droop R = 4%). Load damping D = 1.0 pu. System base is 10,000 MW.
          Fault current uses X''d = 0.18 pu, X'd = 0.3 pu, X_d = 0.5 pu for a 500 MVA synchronous
          generator, and 1.2× rated for the inverter current limiter. The P-Q capability uses
          typical values for a cylindrical-rotor turbogenerator. Grid-forming virtual inertia is
          modelled as H_virtual = 5 s; synthetic inertia as H_synthetic = 3 s. In practice, each
          machine has unique parameters and the system response depends on network topology, load
          composition, and coordinated controls.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>CEA — Technical Standards for Connectivity to the Grid (Regulation 2007, amended 2019)</li>
        <li style={S.li}>Indian Electricity Grid Code (IEGC), 2023 — CERC</li>
        <li style={S.li}>IEEE 1547-2018 — Standard for Interconnection and Interoperability of DER</li>
        <li style={S.li}>CIGRÉ Technical Brochure 671 — "Connection of Wind Farms to Weak AC Networks"</li>
        <li style={S.li}>CIGRÉ Technical Brochure 727 — "Modelling of Inverter-Based Generation for Power System Dynamic Studies"</li>
        <li style={S.li}>POSOCO / GRID-INDIA — System Inertia Monitoring Reports</li>
        <li style={S.li}>Kundur, P., <em>"Power System Stability and Control"</em>, McGraw-Hill, 1994</li>
        <li style={S.li}>NERC — "Reliability Guideline: BPS-Connected Inverter-Based Resource Performance" (2018)</li>
        <li style={S.li}>AEMO — "Renewable Integration Study: Stage 1" (2020) — Australian grid insights</li>
        <li style={S.li}>B. Kroposki et al., "Achieving a 100% Renewable Grid," <em>IEEE Power and Energy Magazine</em>, 2017</li>
      </ul>
    </div>
  );
}

/* ═══════════ Main Component ═══════════ */

export default function InverterBasedResources() {
  const [tab, setTab] = useState('simulate');
  const [view, setView] = useState('freq');
  const [H, setH] = useState(5);
  const [rePen, setRePen] = useState(30);
  const [synth, setSynth] = useState(false);
  const [invType, setInvType] = useState('gfl');
  const [stepped, setStepped] = useState(false);

  const sim = useMemo(() => compute(H, rePen, synth, invType), [H, rePen, synth, invType]);

  const nadirCol = sim.nadir < 49.5 ? '#ef4444' : sim.nadir < 49.8 ? '#f59e0b' : '#22c55e';
  const rocofCol = sim.rocof > 1.0 ? '#ef4444' : sim.rocof > 0.5 ? '#f59e0b' : '#22c55e';

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            {view === 'freq' && <FreqView sim={sim} stepped={stepped} invType={invType} syncH={H} />}
            {view === 'pq' && <PQView />}
            {view === 'fault' && <FaultView sim={sim} />}
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>H Effective</span>
              <span style={{ ...S.rv, color: '#6366f1' }}>{sim.Heff.toFixed(2)} s</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Freq. Nadir</span>
              <span style={{ ...S.rv, color: nadirCol }}>{sim.nadir.toFixed(2)} Hz</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>RoCoF</span>
              <span style={{ ...S.rv, color: rocofCol }}>{sim.rocof.toFixed(2)} Hz/s</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Fault I (Sync)</span>
              <span style={{ ...S.rv, color: '#3b82f6' }}>{(sim.Irated / 0.18).toFixed(1)} kA</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Fault I (IBR)</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{(sim.Irated * 1.2).toFixed(1)} kA</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Q Cap. (Sync)</span>
              <span style={{ ...S.rv, color: '#8b5cf6' }}>420 MVAr</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>View</span>
              <div style={S.bg}>
                <button style={S.btn(view === 'freq')} onClick={() => setView('freq')}>Frequency</button>
                <button style={S.btn(view === 'pq')} onClick={() => setView('pq')}>P-Q Capability</button>
                <button style={S.btn(view === 'fault')} onClick={() => setView('fault')}>Fault Current</button>
              </div>
            </div>

            {view === 'freq' && (
              <button onClick={() => setStepped(!stepped)} style={{
                padding: '5px 14px', borderRadius: 7,
                border: `1px solid ${stepped ? '#ef4444' : '#22c55e'}`,
                background: stepped ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
                color: stepped ? '#fca5a5' : '#86efac',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {stepped ? '↺ Reset' : '⚡ Apply 500 MW Load Step'}
              </button>
            )}

            <div style={S.cg}>
              <span style={S.label}>Inverter</span>
              <div style={S.bg}>
                <button style={S.btn(invType === 'gfl')} onClick={() => setInvType('gfl')}>Grid-Following</button>
                <button style={S.btn(invType === 'gfm')} onClick={() => setInvType('gfm')}>Grid-Forming</button>
              </div>
            </div>

            {invType === 'gfl' && (
              <div style={S.cg}>
                <span style={S.label}>Synth. Inertia</span>
                <button onClick={() => setSynth(!synth)} style={{
                  ...S.btn(synth),
                  background: synth ? 'rgba(34,197,94,0.15)' : 'transparent',
                  borderColor: synth ? '#22c55e' : '#27272a',
                  color: synth ? '#86efac' : '#71717a',
                }}>{synth ? 'ON' : 'OFF'}</button>
              </div>
            )}

            <div style={S.cg}>
              <span style={S.label}>H (s)</span>
              <input type="range" min={1} max={10} step={0.5} value={H}
                onChange={e => setH(+e.target.value)} style={S.slider} />
              <span style={S.val}>{H.toFixed(1)}</span>
            </div>

            <div style={S.cg}>
              <span style={S.label}>RE %</span>
              <input type="range" min={0} max={80} step={5} value={rePen}
                onChange={e => setRePen(+e.target.value)} style={S.slider} />
              <span style={S.val}>{rePen}%</span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
