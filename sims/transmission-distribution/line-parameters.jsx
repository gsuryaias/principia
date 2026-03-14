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
  sel: { padding: '6px 12px', borderRadius: 8, border: '1px solid #3f3f46', background: '#18181b', color: '#e4e4e7', fontSize: 13, cursor: 'pointer', outline: 'none', fontFamily: 'inherit' },
  results: { display: 'flex', gap: 28, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  fRow: { display: 'flex', gap: 10, padding: '12px 24px', background: '#0f0f12', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  fBox: { flex: '1 1 175px', padding: '10px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 10, minWidth: 165 },
  fLabel: { fontSize: 10, color: '#818cf8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5, display: 'block' },
  fEq: { fontFamily: 'monospace', color: '#71717a', fontSize: 12, lineHeight: 1.6, display: 'block' },
  fVal: { fontFamily: 'monospace', color: '#c4b5fd', fontSize: 14, fontWeight: 700, display: 'block', marginTop: 3 },
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

const COND = [
  { name: 'ACSR Moose', dia: 31.77, gmr: 12.41, r: 0.0558, strand: '54/7', area: 597, use: '400 kV EHV' },
  { name: 'ACSR Zebra', dia: 28.62, gmr: 11.16, r: 0.0684, strand: '54/7', area: 484.5, use: '220 kV HV' },
  { name: 'ACSR Panther', dia: 21.0, gmr: 8.21, r: 0.136, strand: '30/7', area: 261.5, use: '132 kV HV' },
  { name: 'ACSR Dog', dia: 14.15, gmr: 5.59, r: 0.2792, strand: '6/7', area: 118.5, use: '33/11 kV' },
];

const SPAC = [
  { name: 'Horizontal', type: 'H', d: 8, d12: 8, d23: 8, d31: 16 },
  { name: 'Vertical', type: 'V', d: 6, d12: 6, d23: 6, d31: 12 },
  { name: 'Triangular', type: 'T', d: 7, d12: 7, d23: 7, d31: 7 },
];

const D_B = 0.45;
const VOLT = [132, 220, 400, 765];
const PC = ['#ef4444', '#eab308', '#3b82f6'];
const PL = ['R', 'Y', 'B'];

function calc(ci, si, bn, vkv) {
  const c = COND[ci], sp = SPAC[si];
  const gmrS = c.gmr / 1000;
  const rS = c.dia / 2000;
  const deq = Math.pow(sp.d12 * sp.d23 * sp.d31, 1 / 3);
  let gmrB, rB;
  if (bn === 1) { gmrB = gmrS; rB = rS; }
  else {
    gmrB = Math.pow(gmrS * Math.pow(D_B, bn - 1), 1 / bn);
    rB = Math.pow(rS * Math.pow(D_B, bn - 1), 1 / bn);
  }
  const R = c.r / bn;
  const L = 0.2 * Math.log(deq / gmrB);
  const C = (2 * Math.PI * 8.854) / Math.log(deq / rB);
  const Zc = Math.sqrt((L * 1e-3) / (C * 1e-9));
  const SIL = (vkv * 1e3) ** 2 / Zc / 1e6;
  return { deq, gmrB, rB, R, L, C, Zc, SIL, c, sp, bn };
}

function Diagram({ ci, si, bn, res }) {
  const sp = SPAC[si];
  const cond = COND[ci];

  const phases = si === 0
    ? [{ x: 110, y: 155 }, { x: 260, y: 155 }, { x: 410, y: 155 }]
    : si === 1
    ? [{ x: 350, y: 100 }, { x: 350, y: 210 }, { x: 350, y: 320 }]
    : [{ x: 260, y: 108 }, { x: 172, y: 260 }, { x: 348, y: 260 }];

  const bOff = [
    [[0, 0]],
    [[-26, 0], [26, 0]],
    [[0, -24], [-21, 12], [21, 12]],
    [[-22, -22], [22, -22], [-22, 22], [22, 22]],
  ][bn - 1];

  const bEdges = [
    [],
    [[0, 1]],
    [[0, 1], [0, 2], [1, 2]],
    [[0, 1], [0, 2], [1, 3], [2, 3]],
  ][bn - 1];

  const BPX = 680, BPY = 180;

  return (
    <svg viewBox="0 0 870 430" style={{ width: '100%', maxWidth: 880, height: 'auto' }}>
      <defs>
        <filter id="gl"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {/* Section label */}
      <text x={260} y={18} textAnchor="middle" fill="#3f3f46" fontSize={10} fontWeight={600} letterSpacing="0.1em">
        {sp.type === 'H' ? 'HORIZONTAL' : sp.type === 'V' ? 'VERTICAL' : 'EQUILATERAL TRIANGULAR'} ARRANGEMENT
      </text>

      {/* ──────── HORIZONTAL TOWER ──────── */}
      {si === 0 && (
        <g>
          {/* Peak & earth wire */}
          <line x1={260} y1={36} x2={242} y2={82} stroke="#27272a" strokeWidth={2.5} />
          <line x1={260} y1={36} x2={278} y2={82} stroke="#27272a" strokeWidth={2.5} />
          <circle cx={260} cy={32} r={4} fill="none" stroke="#22c55e" strokeWidth={1.5} />
          <text x={276} y={35} fill="#22c55e" fontSize={8} fontWeight={500}>OPGW</text>

          {/* Cross-arm */}
          <line x1={78} y1={108} x2={442} y2={108} stroke="#3f3f46" strokeWidth={3} />

          {/* Legs */}
          <line x1={242} y1={108} x2={222} y2={392} stroke="#27272a" strokeWidth={2.5} />
          <line x1={278} y1={108} x2={298} y2={392} stroke="#27272a" strokeWidth={2.5} />

          {/* Cross-bracing */}
          {[165, 230, 295, 355].map(y => {
            const t = (y - 108) / 284;
            return <line key={y} x1={242 - 20 * t} y1={y} x2={278 + 20 * t} y2={y} stroke="#1e1e2e" strokeWidth={1} />;
          })}
          {[165, 295].map(y => {
            const t1 = (y - 108) / 284, t2 = (y + 60 - 108) / 284;
            return (
              <g key={'x' + y}>
                <line x1={242 - 20 * t1} y1={y} x2={278 + 20 * t2} y2={y + 60} stroke="#1e1e2e" strokeWidth={0.7} />
                <line x1={278 + 20 * t1} y1={y} x2={242 - 20 * t2} y2={y + 60} stroke="#1e1e2e" strokeWidth={0.7} />
              </g>
            );
          })}

          {/* Insulator strings */}
          {[110, 260, 410].map(x => (
            <g key={'ins' + x}>
              <line x1={x} y1={108} x2={x} y2={143} stroke="#52525b" strokeWidth={1.5} />
              {[114, 122, 130, 138].map(iy => (
                <rect key={iy} x={x - 4} y={iy} width={8} height={3} rx={1} fill="#3f3f46" opacity={0.6} />
              ))}
            </g>
          ))}

          {/* Ground */}
          <line x1={155} y1={398} x2={365} y2={398} stroke="#1e1e2e" strokeWidth={1} strokeDasharray="6,4" />
          <text x={260} y={416} textAnchor="middle" fill="#27272a" fontSize={9}>GROUND LEVEL</text>
        </g>
      )}

      {/* ──────── VERTICAL TOWER ──────── */}
      {si === 1 && (
        <g>
          {/* Peak */}
          <line x1={220} y1={36} x2={208} y2={72} stroke="#27272a" strokeWidth={2.5} />
          <line x1={220} y1={36} x2={232} y2={72} stroke="#27272a" strokeWidth={2.5} />
          <circle cx={220} cy={32} r={4} fill="none" stroke="#22c55e" strokeWidth={1.5} />
          <text x={236} y={35} fill="#22c55e" fontSize={8} fontWeight={500}>OPGW</text>

          {/* Legs */}
          <line x1={208} y1={72} x2={196} y2={392} stroke="#27272a" strokeWidth={2.5} />
          <line x1={232} y1={72} x2={244} y2={392} stroke="#27272a" strokeWidth={2.5} />

          {/* Arms extending right to conductors */}
          {[100, 210, 320].map((y, i) => {
            const t = (y - 72) / 320;
            const xr = Math.round(232 + 12 * t);
            return (
              <g key={'arm' + y}>
                <line x1={xr} y1={y} x2={332} y2={y} stroke="#3f3f46" strokeWidth={2.5} />
                {/* Insulator */}
                <line x1={332} y1={y} x2={342} y2={y} stroke="#52525b" strokeWidth={1.5} />
                <circle cx={337} cy={y} r={2} fill="#3f3f46" />
              </g>
            );
          })}

          {/* Cross-bracing */}
          {[150, 265, 360].map(y => {
            const t = (y - 72) / 320;
            return <line key={y} x1={208 - 12 * t} y1={y} x2={232 + 12 * t} y2={y} stroke="#1e1e2e" strokeWidth={1} />;
          })}

          <line x1={155} y1={398} x2={280} y2={398} stroke="#1e1e2e" strokeWidth={1} strokeDasharray="6,4" />
          <text x={218} y={416} textAnchor="middle" fill="#27272a" fontSize={9}>GROUND LEVEL</text>
        </g>
      )}

      {/* ──────── TRIANGULAR TOWER ──────── */}
      {si === 2 && (
        <g>
          {/* Peak */}
          <line x1={260} y1={36} x2={240} y2={72} stroke="#27272a" strokeWidth={2.5} />
          <line x1={260} y1={36} x2={280} y2={72} stroke="#27272a" strokeWidth={2.5} />
          <circle cx={260} cy={32} r={4} fill="none" stroke="#22c55e" strokeWidth={1.5} />
          <text x={276} y={35} fill="#22c55e" fontSize={8} fontWeight={500}>OPGW</text>

          {/* Legs */}
          <line x1={240} y1={72} x2={210} y2={392} stroke="#27272a" strokeWidth={2.5} />
          <line x1={280} y1={72} x2={310} y2={392} stroke="#27272a" strokeWidth={2.5} />

          {/* Upper arm (Phase R) */}
          <line x1={234} y1={95} x2={286} y2={95} stroke="#3f3f46" strokeWidth={2.5} />
          <line x1={260} y1={95} x2={260} y2={100} stroke="#52525b" strokeWidth={1.5} />

          {/* Lower arm (Phases Y, B) */}
          <line x1={148} y1={248} x2={372} y2={248} stroke="#3f3f46" strokeWidth={2.5} />
          <line x1={172} y1={248} x2={172} y2={253} stroke="#52525b" strokeWidth={1.5} />
          <line x1={348} y1={248} x2={348} y2={253} stroke="#52525b" strokeWidth={1.5} />

          {/* Cross-bracing */}
          {[160, 310, 360].map(y => {
            const t = (y - 72) / 320;
            return <line key={y} x1={240 - 30 * t} y1={y} x2={280 + 30 * t} y2={y} stroke="#1e1e2e" strokeWidth={1} />;
          })}

          <line x1={160} y1={398} x2={360} y2={398} stroke="#1e1e2e" strokeWidth={1} strokeDasharray="6,4" />
          <text x={260} y={416} textAnchor="middle" fill="#27272a" fontSize={9}>GROUND LEVEL</text>
        </g>
      )}

      {/* ──────── PHASE CONDUCTORS ──────── */}
      {phases.map((ph, i) => {
        const lx = si === 1 ? ph.x - 22 : ph.x;
        const ly = si === 1 ? ph.y + 5 : si === 2 && i === 0 ? ph.y - 20 : ph.y - 20;
        return (
          <g key={'ph' + i}>
            <circle cx={ph.x} cy={ph.y} r={14} fill={PC[i]} opacity={0.1} />
            <circle cx={ph.x} cy={ph.y} r={8} fill={PC[i]} opacity={0.85} filter="url(#gl)">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
            </circle>
            <text x={lx} y={ly} textAnchor="middle" fill={PC[i]} fontSize={11} fontWeight={700}>{PL[i]}</text>
          </g>
        );
      })}

      {/* Phase spacing dashed lines */}
      {[[0, 1], [1, 2], [2, 0]].map(([a, b], i) => (
        <line key={'sp' + i}
          x1={phases[a].x} y1={phases[a].y} x2={phases[b].x} y2={phases[b].y}
          stroke="#3f3f46" strokeWidth={0.6} strokeDasharray="5,4" />
      ))}

      {/* ──────── DIMENSION LINES ──────── */}
      {si === 0 && (
        <g>
          {/* D12 */}
          <line x1={110} y1={178} x2={260} y2={178} stroke="#52525b" strokeWidth={0.7} />
          <line x1={110} y1={172} x2={110} y2={184} stroke="#52525b" strokeWidth={1} />
          <line x1={260} y1={172} x2={260} y2={184} stroke="#52525b" strokeWidth={1} />
          <rect x={155} y={181} width={60} height={16} rx={4} fill="#18181b" stroke="#27272a" strokeWidth={0.5} />
          <text x={185} y={193} textAnchor="middle" fill="#a1a1aa" fontSize={9} fontFamily="monospace">D₁₂ = {sp.d12}m</text>
          {/* D23 */}
          <line x1={260} y1={178} x2={410} y2={178} stroke="#52525b" strokeWidth={0.7} />
          <line x1={410} y1={172} x2={410} y2={184} stroke="#52525b" strokeWidth={1} />
          <rect x={305} y={181} width={60} height={16} rx={4} fill="#18181b" stroke="#27272a" strokeWidth={0.5} />
          <text x={335} y={193} textAnchor="middle" fill="#a1a1aa" fontSize={9} fontFamily="monospace">D₂₃ = {sp.d23}m</text>
          {/* D31 */}
          <line x1={110} y1={210} x2={410} y2={210} stroke="#52525b" strokeWidth={0.7} />
          <line x1={110} y1={204} x2={110} y2={216} stroke="#52525b" strokeWidth={1} />
          <line x1={410} y1={204} x2={410} y2={216} stroke="#52525b" strokeWidth={1} />
          <rect x={230} y={213} width={60} height={16} rx={4} fill="#18181b" stroke="#27272a" strokeWidth={0.5} />
          <text x={260} y={225} textAnchor="middle" fill="#818cf8" fontSize={9} fontWeight={600} fontFamily="monospace">D₃₁ = {sp.d31}m</text>
        </g>
      )}

      {si === 1 && (
        <g>
          {/* D12 */}
          <line x1={385} y1={100} x2={385} y2={210} stroke="#52525b" strokeWidth={0.7} />
          <line x1={380} y1={100} x2={390} y2={100} stroke="#52525b" strokeWidth={1} />
          <line x1={380} y1={210} x2={390} y2={210} stroke="#52525b" strokeWidth={1} />
          <rect x={393} y={146} width={62} height={16} rx={4} fill="#18181b" stroke="#27272a" strokeWidth={0.5} />
          <text x={424} y={158} textAnchor="middle" fill="#a1a1aa" fontSize={9} fontFamily="monospace">D₁₂ = {sp.d12}m</text>
          {/* D23 */}
          <line x1={385} y1={210} x2={385} y2={320} stroke="#52525b" strokeWidth={0.7} />
          <line x1={380} y1={320} x2={390} y2={320} stroke="#52525b" strokeWidth={1} />
          <rect x={393} y={256} width={62} height={16} rx={4} fill="#18181b" stroke="#27272a" strokeWidth={0.5} />
          <text x={424} y={268} textAnchor="middle" fill="#a1a1aa" fontSize={9} fontFamily="monospace">D₂₃ = {sp.d23}m</text>
          {/* D31 */}
          <line x1={460} y1={100} x2={460} y2={320} stroke="#52525b" strokeWidth={0.7} />
          <line x1={455} y1={100} x2={465} y2={100} stroke="#52525b" strokeWidth={1} />
          <line x1={455} y1={320} x2={465} y2={320} stroke="#52525b" strokeWidth={1} />
          <rect x={468} y={202} width={62} height={16} rx={4} fill="#18181b" stroke="#27272a" strokeWidth={0.5} />
          <text x={499} y={214} textAnchor="middle" fill="#818cf8" fontSize={9} fontWeight={600} fontFamily="monospace">D₃₁ = {sp.d31}m</text>
        </g>
      )}

      {si === 2 && (
        <g>
          {/* Bottom D23 */}
          <line x1={172} y1={282} x2={348} y2={282} stroke="#52525b" strokeWidth={0.7} />
          <line x1={172} y1={276} x2={172} y2={288} stroke="#52525b" strokeWidth={1} />
          <line x1={348} y1={276} x2={348} y2={288} stroke="#52525b" strokeWidth={1} />
          <rect x={230} y={286} width={60} height={16} rx={4} fill="#18181b" stroke="#27272a" strokeWidth={0.5} />
          <text x={260} y={298} textAnchor="middle" fill="#a1a1aa" fontSize={9} fontFamily="monospace">D = {sp.d}m</text>
          <text x={260} y={316} textAnchor="middle" fill="#3f3f46" fontSize={9} fontStyle="italic">All spacings equal (equilateral)</text>
        </g>
      )}

      {/* Deq readout on diagram */}
      <rect x={100} y={360} width={320} height={22} rx={6} fill="#18181b" stroke="#27272a" strokeWidth={0.7} />
      <text x={260} y={375} textAnchor="middle" fill="#71717a" fontSize={10} fontFamily="monospace">
        D_eq = ({sp.d12}×{sp.d23}×{sp.d31})^⅓ = {res.deq.toFixed(3)} m
      </text>

      {/* ──────── SEPARATOR ──────── */}
      <line x1={530} y1={25} x2={530} y2={410} stroke="#1e1e2e" strokeWidth={1} />

      {/* ──────── BUNDLE DETAIL PANEL ──────── */}
      <rect x={548} y={25} width={305} height={390} rx={12} fill="#111114" stroke="#27272a" strokeWidth={1} />
      <text x={BPX} y={53} textAnchor="middle" fill="#52525b" fontSize={10} fontWeight={600} letterSpacing="0.08em">
        BUNDLE DETAIL — {['SINGLE', 'TWIN', 'TRIPLE', 'QUAD'][bn - 1]}
      </text>
      <text x={BPX} y={70} textAnchor="middle" fill="#3f3f46" fontSize={10}>
        {bn === 1 ? 'Single conductor per phase' : `${bn} sub-conductors · d = ${D_B} m`}
      </text>

      {/* Bundle edge connections */}
      {bEdges.map(([a, b], i) => (
        <line key={'be' + i}
          x1={BPX + bOff[a][0]} y1={BPY + bOff[a][1]}
          x2={BPX + bOff[b][0]} y2={BPY + bOff[b][1]}
          stroke="#3f3f46" strokeWidth={0.8} strokeDasharray="4,3" />
      ))}

      {/* Sub-conductors */}
      {bOff.map((off, i) => (
        <g key={'bc' + i}>
          <circle cx={BPX + off[0]} cy={BPY + off[1]} r={16} fill="#6366f1" opacity={0.06} />
          <circle cx={BPX + off[0]} cy={BPY + off[1]} r={10} fill="#18181b" stroke="#818cf8" strokeWidth={2} />
          <circle cx={BPX + off[0]} cy={BPY + off[1]} r={4} fill="#818cf8" opacity={0.4} />
        </g>
      ))}

      {/* Spacing label between first two sub-conductors */}
      {bn >= 2 && (() => {
        const mx = BPX + (bOff[0][0] + bOff[1][0]) / 2;
        const my = BPY + (bOff[0][1] + bOff[1][1]) / 2;
        const isVert = Math.abs(bOff[0][1] - bOff[1][1]) > Math.abs(bOff[0][0] - bOff[1][0]);
        return (
          <text
            x={isVert ? mx - 18 : mx}
            y={isVert ? my + 4 : my - 16}
            textAnchor="middle" fill="#818cf8" fontSize={10} fontFamily="monospace">
            d = {D_B}m
          </text>
        );
      })()}

      {/* ── Conductor info section ── */}
      <line x1={562} y1={248} x2={838} y2={248} stroke="#27272a" strokeWidth={0.5} />
      <text x={BPX} y={272} textAnchor="middle" fill="#a1a1aa" fontSize={12} fontWeight={600}>{cond.name}</text>
      <text x={BPX} y={292} textAnchor="middle" fill="#52525b" fontSize={10} fontFamily="monospace">
        Dia: {cond.dia} mm · GMR: {cond.gmr} mm
      </text>
      <text x={BPX} y={310} textAnchor="middle" fill="#52525b" fontSize={10} fontFamily="monospace">
        R_dc: {cond.r} Ω/km · Stranding: {cond.strand}
      </text>

      <line x1={562} y1={326} x2={838} y2={326} stroke="#27272a" strokeWidth={0.5} />
      <text x={BPX} y={348} textAnchor="middle" fill="#818cf8" fontSize={11} fontWeight={600} fontFamily="monospace">
        GMR_eff = {(res.gmrB * 1000).toFixed(2)} mm
      </text>
      <text x={BPX} y={368} textAnchor="middle" fill="#818cf8" fontSize={11} fontWeight={600} fontFamily="monospace">
        r_eff = {(res.rB * 1000).toFixed(2)} mm
      </text>
      <text x={BPX} y={388} textAnchor="middle" fill="#f59e0b" fontSize={11} fontWeight={600} fontFamily="monospace">
        R = {res.R.toFixed(4)} Ω/km
      </text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Transmission Line Parameters — R, L, C per km</h2>
      <p style={S.p}>
        Every transmission line has three fundamental electrical parameters per unit length:
        resistance (R), inductance (L), and capacitance (C). A fourth parameter — conductance (G),
        representing leakage current through insulator surfaces — is negligible for overhead lines
        and typically ignored. These parameters, expressed per km, determine the line's impedance,
        voltage regulation, power transfer capability, and surge impedance loading (SIL).
      </p>

      <h3 style={S.h3}>Geometric Mean Radius (GMR)</h3>
      <p style={S.p}>
        The GMR of a conductor is the effective radius for inductance calculations. A current-carrying
        conductor produces magnetic flux both externally and internally. The internal flux linkage
        effectively reduces the apparent radius. For a solid cylindrical conductor of radius r:
      </p>
      <div style={S.eq}>r' = 0.7788 × r = r × e^(−1/4)</div>
      <p style={S.p}>
        For stranded ACSR (Aluminium Conductor Steel Reinforced) conductors, the GMR is
        determined experimentally by the manufacturer. It accounts for the non-uniform current
        distribution across aluminium strands and the steel core. The GMR is always <strong
        style={{ color: '#e4e4e7' }}>less than the physical radius</strong> of the conductor.
        Note that GMR is used only for inductance; the actual physical radius is used for capacitance
        calculations since capacitance depends on the surface charge distribution, not internal flux.
      </p>

      <h3 style={S.h3}>Geometric Mean Distance (GMD)</h3>
      <p style={S.p}>
        The GMD (or equivalent spacing, D_eq) represents the effective spacing between phases for
        a perfectly transposed three-phase line. For three phase conductors with inter-phase
        distances D₁₂, D₂₃, and D₃₁:
      </p>
      <div style={S.eq}>D_eq = (D₁₂ × D₂₃ × D₃₁)^(1/3)</div>
      <p style={S.p}>
        Transposition — cyclically rotating each phase conductor's position at regular intervals
        along the line — ensures balanced impedances. In practice, lines longer than ~100 km
        are transposed. For equilateral triangular spacing, all distances are equal
        (D₁₂ = D₂₃ = D₃₁ = D), so D_eq = D, and transposition is unnecessary.
        For horizontal or vertical arrangements with equal adjacent spacing D, we get
        D₃₁ = 2D, yielding D_eq = D × 2^(1/3) ≈ 1.26 × D.
      </p>

      <h3 style={S.h3}>Effect of Bundling on Inductance and Capacitance</h3>
      <p style={S.p}>
        Bundled conductors — 2, 3, or 4 sub-conductors per phase connected by rigid spacers at
        intervals of 0.3–0.45m — are used on EHV lines (220 kV and above). Bundling produces
        several critical effects:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Reduces inductance</strong> — The effective GMR increases dramatically (e.g., from ~12 mm to ~183 mm for quad bundling with Moose), reducing the ln(D_eq/GMR_b) ratio and hence L.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Increases capacitance</strong> — The effective conductor radius increases similarly, reducing ln(D_eq/r_b). Higher capacitance provides natural reactive power generation.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Reduces corona</strong> — Larger effective diameter lowers the surface electric field gradient, raising the corona onset voltage well above the operating voltage.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Increases SIL</strong> — Since Z_c = √(L/C) and SIL = V²/Z_c, reducing L while increasing C lowers surge impedance and raises the natural loading power.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Lower RI & AN</strong> — Reduced surface gradient also lowers Radio Interference (RI) and Audible Noise (AN) levels to within regulatory limits.</li>
      </ul>
      <p style={S.p}>
        For a bundle of n sub-conductors arranged symmetrically with adjacent spacing d, the
        effective GMR and radius for inductance and capacitance calculations are:
      </p>
      <div style={S.eq}>GMR_bundle = (GMR × d^(n−1))^(1/n)</div>
      <div style={S.eq}>r_bundle = (r × d^(n−1))^(1/n)</div>

      <h3 style={S.h3}>Standard ACSR Conductor Properties</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Conductor</th>
            <th style={S.th}>Stranding (Al/St)</th>
            <th style={S.th}>Dia (mm)</th>
            <th style={S.th}>GMR (mm)</th>
            <th style={S.th}>R₂₀ (Ω/km)</th>
            <th style={S.th}>Al Area (mm²)</th>
            <th style={S.th}>Typical Use</th>
          </tr>
        </thead>
        <tbody>
          {COND.map(c => (
            <tr key={c.name}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{c.name}</td>
              <td style={S.td}>{c.strand}</td>
              <td style={S.td}>{c.dia}</td>
              <td style={S.td}>{c.gmr}</td>
              <td style={S.td}>{c.r}</td>
              <td style={S.td}>{c.area}</td>
              <td style={S.td}>{c.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={S.p}>
        Conductor names in the Indian system follow the "animal code" — a legacy of British
        naming conventions in IS 398. ACSR Moose is the largest commonly used conductor,
        while Dog is used on lower-voltage distribution lines.
      </p>

      <h3 style={S.h3}>Why PGCIL Uses Quad-Bundled Moose for 400 kV</h3>
      <p style={S.p}>
        Power Grid Corporation of India (PGCIL) has standardized quad-bundled ACSR Moose
        conductors with 0.45m bundle spacing for all 400 kV transmission lines. This choice
        is driven by several engineering and economic factors:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Corona performance:</strong> The corona inception voltage with quad Moose exceeds 400 kV, virtually eliminating corona losses under fair-weather conditions at altitudes up to ~1000m.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>SIL optimization:</strong> SIL increases from ~350 MW (single Moose) to ~650 MW (quad), enabling long-distance bulk power transfer of 1000+ MW without extensive reactive compensation substations.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Thermal rating:</strong> The quad bundle provides a combined thermal capacity of ~3,600 A (900 A per sub-conductor), offering adequate margin for N-1 contingency and seasonal loading variations.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>RI/AN compliance:</strong> Quad bundling keeps radio interference below 40 dB(μV/m) and audible noise below 52 dB(A), meeting CEA environmental clearance norms.</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>Real-World Context — AP Transco</span>
        <p style={S.ctxP}>
          In AP Transco, 400 kV lines typically use quad ACSR Moose conductors with 0.45m bundle
          spacing on lattice towers with horizontal conductor arrangement (phase spacing ~12m).
          The 220 kV network uses twin ACSR Moose or single ACSR Zebra depending on the required
          transfer capacity. For 132 kV lines, single ACSR Panther or Zebra is used. The 400 kV
          backbone — including Kurnool–Gajuwaka, Sri Kalahasti–Nellore, and Srisailam–Nagarjunasagar
          lines — connects generating stations to load centers via the PGCIL inter-state grid.
        </p>
      </div>

      <h3 style={S.h3}>Key Equations</h3>
      <p style={S.p}>Geometric Mean Distance for transposed three-phase line:</p>
      <div style={S.eq}>D_eq = (D₁₂ × D₂₃ × D₃₁)^(1/3)</div>
      <p style={S.p}>Effective GMR and radius for n-conductor bundle with spacing d:</p>
      <div style={S.eq}>GMR_b = (GMR × d^(n−1))^(1/n)  ·  r_b = (r × d^(n−1))^(1/n)</div>
      <p style={S.p}>Inductance per phase per km:</p>
      <div style={S.eq}>L = 2 × 10⁻⁷ × ln(D_eq / GMR_b) H/m = 0.2 × ln(D_eq / GMR_b) mH/km</div>
      <p style={S.p}>Capacitance per phase per km (phase-to-neutral):</p>
      <div style={S.eq}>C = 2πε₀ / ln(D_eq / r_b) F/m = 55.63 / ln(D_eq / r_b) nF/km</div>
      <p style={S.p}>Surge impedance and natural loading:</p>
      <div style={S.eq}>Z_c = √(L / C)     SIL = V²_LL / Z_c  (MW)</div>
      <p style={S.p}>Bundle resistance (n sub-conductors in parallel):</p>
      <div style={S.eq}>R_bundle = R_single / n</div>

      <div style={S.ctx}>
        <span style={S.ctxT}>Assumptions in This Simulation</span>
        <p style={S.ctxP}>
          Fully transposed line with balanced impedances across all three phases. Earth effect
          on capacitance is neglected (valid for lines well above ground — typically 20+ m clearance).
          Conductor DC resistance at 20°C is used; for other temperatures apply
          R_T = R₂₀ × [1 + 0.004 × (T − 20)]. Skin effect and proximity effect at 50 Hz are
          neglected (significant only above a few hundred Hz). Spacings D₁₂, D₂₃, D₃₁ refer to
          center-to-center distances between phase bundles, not between individual sub-conductors.
          The simplified bundle formula (GMR × d^(n−1))^(1/n) is used; for n = 4 this is an
          approximation that omits the diagonal factor (√2 correction ≈ 1.09×).
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>IS 398 (Part 2) — Aluminium Conductor Steel Reinforced, Bureau of Indian Standards</li>
        <li style={S.li}>CEA Manual on Transmission Planning Criteria, Central Electricity Authority</li>
        <li style={S.li}>CBIP Manual on Transmission Line Construction Practices</li>
        <li style={S.li}>Stevenson, W.D. & Grainger, J.J. — Elements of Power System Analysis, McGraw-Hill</li>
        <li style={S.li}>PGCIL — Manual on Transmission Planning Criteria (MTPC), 2023</li>
        <li style={S.li}>AP Transco — Technical Standards for Transmission Lines</li>
      </ul>
    </div>
  );
}

export default function LineParameters() {
  const [tab, setTab] = useState('simulate');
  const [ci, setCi] = useState(0);
  const [si, setSi] = useState(0);
  const [bn, setBn] = useState(4);
  const [vi, setVi] = useState(2);

  const res = useMemo(() => calc(ci, si, bn, VOLT[vi]), [ci, si, bn, vi]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram ci={ci} si={si} bn={bn} res={res} />
          </div>

          <div style={S.fRow}>
            <div style={S.fBox}>
              <span style={S.fLabel}>GMD (D_eq)</span>
              <span style={S.fEq}>
                {si === 2
                  ? `D₁₂ = D₂₃ = D₃₁ = ${SPAC[si].d}m`
                  : `(${res.sp.d12}×${res.sp.d23}×${res.sp.d31})^(1/3)`
                }
              </span>
              <span style={S.fVal}>= {res.deq.toFixed(3)} m</span>
            </div>
            <div style={S.fBox}>
              <span style={S.fLabel}>Effective GMR</span>
              <span style={S.fEq}>
                {bn === 1
                  ? `GMR from data = ${COND[ci].gmr} mm`
                  : `(${COND[ci].gmr}mm × ${D_B}^${bn - 1})^(1/${bn})`
                }
              </span>
              <span style={S.fVal}>= {(res.gmrB * 1000).toFixed(2)} mm</span>
            </div>
            <div style={S.fBox}>
              <span style={S.fLabel}>Inductance (L)</span>
              <span style={S.fEq}>0.2 × ln({res.deq.toFixed(3)} / {res.gmrB.toFixed(4)})</span>
              <span style={S.fVal}>= {res.L.toFixed(4)} mH/km</span>
            </div>
            <div style={S.fBox}>
              <span style={S.fLabel}>Capacitance (C)</span>
              <span style={S.fEq}>55.63 / ln({res.deq.toFixed(3)} / {res.rB.toFixed(4)})</span>
              <span style={S.fVal}>= {res.C.toFixed(3)} nF/km</span>
            </div>
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>R (Ω/km)</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{res.R.toFixed(4)}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>L (mH/km)</span>
              <span style={{ ...S.rv, color: '#22c55e' }}>{res.L.toFixed(4)}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>C (nF/km)</span>
              <span style={{ ...S.rv, color: '#3b82f6' }}>{res.C.toFixed(3)}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>GMD (m)</span>
              <span style={{ ...S.rv, color: '#a78bfa' }}>{res.deq.toFixed(3)}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>GMR_eff (mm)</span>
              <span style={{ ...S.rv, color: '#f472b6' }}>{(res.gmrB * 1000).toFixed(2)}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>SIL (MW)</span>
              <span style={{ ...S.rv, color: '#06b6d4' }}>{res.SIL.toFixed(1)}</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Conductor</span>
              <select style={S.sel} value={ci} onChange={e => setCi(+e.target.value)}>
                {COND.map((c, i) => <option key={i} value={i}>{c.name}</option>)}
              </select>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Spacing</span>
              <select style={S.sel} value={si} onChange={e => setSi(+e.target.value)}>
                {SPAC.map((s, i) => <option key={i} value={i}>{s.name} (D={s.d}m)</option>)}
              </select>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Bundle</span>
              <select style={S.sel} value={bn} onChange={e => setBn(+e.target.value)}>
                {[1, 2, 3, 4].map(n => (
                  <option key={n} value={n}>
                    {['Single', 'Twin', 'Triple', 'Quad'][n - 1]}{n > 1 ? ` (d=${D_B}m)` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Voltage (SIL)</span>
              <select style={S.sel} value={vi} onChange={e => setVi(+e.target.value)}>
                {VOLT.map((v, i) => <option key={i} value={i}>{v} kV</option>)}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
