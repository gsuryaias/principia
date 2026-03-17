import React, { useState, useMemo, useEffect, useRef } from 'react';

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
  eqBox: { padding: '16px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, margin: '16px 0', overflowX: 'auto' },
  eqStep: { fontFamily: 'monospace', fontSize: 14, color: '#a1a1aa', margin: '6px 0', lineHeight: 1.6 },
  eqResult: { fontFamily: 'monospace', fontSize: 15, color: '#c4b5fd', margin: '8px 0 0', fontWeight: 600 },
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14, display: 'block' },
  ctxP: { fontSize: 14, lineHeight: 1.7, color: '#a1a1aa', margin: 0 },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  tbl: { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #3f3f46', color: '#d4d4d8', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #27272a', color: '#a1a1aa' },
  svgDiagram: { width: '100%', margin: '20px 0', borderRadius: 12, border: '1px solid #27272a', background: '#0f0f13', padding: 0 },
};

const RA = 1.0;
const KF = 1.0;

function computeMotor(V, If, TL) {
  const Ke = KF * If;
  if (Ke < 0.001) return { V, N: 0, Ia: V / RA, Eb: 0, omega: 0, T: 0, Pin: V * V / RA, Pcu: V * V / RA, Pmech: 0, eta: 0, Ke, stalled: true };
  const Ia = TL / Ke;
  const Eb = V - Ia * RA;
  if (Eb <= 0) {
    const Is = V / RA;
    return { V, N: 0, Ia: Is, Eb: 0, omega: 0, T: Ke * Is, Pin: V * Is, Pcu: Is * Is * RA, Pmech: 0, eta: 0, Ke, stalled: true };
  }
  const omega = Eb / Ke;
  const N = omega * 30 / Math.PI;
  const Pin = V * Ia;
  const Pcu = Ia * Ia * RA;
  const Pmech = Eb * Ia;
  const eta = Pin > 0 ? (Pmech / Pin) * 100 : 0;
  return { V, N, Ia, Eb, omega, T: TL, Pin, Pcu, Pmech, eta, Ke, stalled: false };
}

const arc = (cx, cy, r, a1, a2) => {
  const pts = [];
  for (let a = a1; a <= a2; a += 2) { const rd = a * Math.PI / 180; pts.push(`${cx + r * Math.cos(rd)},${cy - r * Math.sin(rd)}`); }
  return 'M ' + pts.join(' L ');
};

/* Small circuit schematic overlay for the simulation */
function CircuitSchematic({ motor }) {
  const w = 180, h = 90;
  return (
    <g transform="translate(10, 10)">
      <rect x={0} y={0} width={w} height={h} rx={8} fill="rgba(15,15,19,0.92)" stroke="#27272a" strokeWidth={1} />
      <text x={w/2} y={14} textAnchor="middle" fill="#52525b" fontSize={8} fontWeight={600}>ARMATURE CIRCUIT</text>
      {/* Vt source */}
      <circle cx={20} cy={50} r={10} fill="none" stroke="#6366f1" strokeWidth={1.2} />
      <text x={20} y={53} textAnchor="middle" fill="#6366f1" fontSize={7} fontWeight={600}>V<tspan dy={3} fontSize={5}>t</tspan></text>
      {/* Top wire */}
      <line x1={20} y1={40} x2={20} y2={26} stroke="#52525b" strokeWidth={0.8} />
      <line x1={20} y1={26} x2={160} y2={26} stroke="#52525b" strokeWidth={0.8} />
      {/* Ra resistor */}
      <rect x={55} y={22} width={30} height={8} rx={2} fill="none" stroke="#ef4444" strokeWidth={0.8} />
      <text x={70} y={20} textAnchor="middle" fill="#ef4444" fontSize={6}>R<tspan dy={2} fontSize={5}>a</tspan></text>
      {/* Current arrow */}
      <polygon points="45,26 40,23.5 40,28.5" fill="#22d3ee" />
      <text x={42} y={37} fill="#22d3ee" fontSize={6}>I<tspan dy={2} fontSize={5}>a</tspan><tspan dy={-2}> = {motor.Ia.toFixed(1)}A</tspan></text>
      {/* Back-EMF source */}
      <circle cx={140} cy={50} r={10} fill="none" stroke="#22c55e" strokeWidth={1.2} />
      <text x={140} y={53} textAnchor="middle" fill="#22c55e" fontSize={7} fontWeight={600}>E<tspan dy={3} fontSize={5}>b</tspan></text>
      {/* Right wire */}
      <line x1={140} y1={40} x2={140} y2={26} stroke="#52525b" strokeWidth={0.8} />
      {/* Bottom wire */}
      <line x1={20} y1={60} x2={20} y2={76} stroke="#52525b" strokeWidth={0.8} />
      <line x1={20} y1={76} x2={140} y2={76} stroke="#52525b" strokeWidth={0.8} />
      <line x1={140} y1={60} x2={140} y2={76} stroke="#52525b" strokeWidth={0.8} />
      {/* Values */}
      <text x={w/2} y={h-4} textAnchor="middle" fill="#3f3f46" fontSize={6}>V={motor.V}V  E<tspan dy={2} fontSize={5}>b</tspan><tspan dy={-2}>={motor.Eb.toFixed(1)}V</tspan></text>
    </g>
  );
}

function Diagram({ motor, angle }) {
  const CX = 195, CY = 155, SR = 115, RR = 72, CR = 52, SH = 14, NC = 8;

  const conductors = Array.from({ length: NC }, (_, i) => {
    const theta = ((i * 45 + angle) % 360 + 360) % 360;
    const rad = theta * Math.PI / 180;
    const x = CX + CR * Math.cos(rad), y = CY - CR * Math.sin(rad);
    const isOut = theta < 180;
    const field = Math.abs(Math.sin(rad));
    const tx = -Math.sin(rad), ty = -Math.cos(rad);
    const fl = motor.Ia > 0.1 ? Math.min(field * motor.Ia * 0.6, 22) : 0;
    return { x, y, isOut, tx, ty, fl };
  });

  const emfPath = useMemo(() => {
    let d = '';
    for (let i = 0; i <= 360; i += 3) {
      const v = Math.abs(Math.sin(i * Math.PI / 180));
      d += (i === 0 ? 'M' : 'L') + `${432 + i * 1.38},${88 - v * 52}`;
    }
    return d;
  }, []);

  const sinPath = useMemo(() => {
    let d = '';
    for (let i = 0; i <= 360; i += 3) {
      const v = Math.sin(i * Math.PI / 180);
      d += (i === 0 ? 'M' : 'L') + `${432 + i * 1.38},${88 - v * 52}`;
    }
    return d;
  }, []);

  const ma = angle % 360;
  const mx = 432 + ma * 1.38;
  const mv = Math.abs(Math.sin(ma * Math.PI / 180));
  const my = 88 - mv * 52;

  const vBarX = 440, vBarW = 480, vBarY = 175;
  const ebFrac = motor.V > 0 ? Math.max(motor.Eb / motor.V, 0) : 0;
  const pBarY = 230;
  const etaFrac = motor.Pin > 0 ? Math.max(motor.Pmech / motor.Pin, 0) : 0;

  /* Power flow direction indicator */
  const powerFlowAnim = motor.omega > 0.1;

  return (
    <svg viewBox="0 0 960 310" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      <defs>
        <marker id="fa" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0,0 5,2 0,4" fill="#c084fc" opacity="0.8" />
        </marker>
        <marker id="powerArrow" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0,0 6,2.5 0,5" fill="#22c55e" opacity="0.7" />
        </marker>
      </defs>

      <text x={CX} y={18} textAnchor="middle" fill="#71717a" fontSize={12} fontWeight={600}>DC Motor Cross-Section (Animated)</text>

      {/* Stator yoke */}
      <circle cx={CX} cy={CY} r={SR} fill="none" stroke="#3f3f46" strokeWidth={10} />
      {/* N pole (top) */}
      <path d={arc(CX, CY, SR - 5, 55, 125)} fill="none" stroke="#ef4444" strokeWidth={12} strokeLinecap="round" opacity={0.85} />
      <text x={CX} y={CY - SR + 22} textAnchor="middle" fill="#fca5a5" fontSize={14} fontWeight={700}>N</text>
      {/* S pole (bottom) */}
      <path d={arc(CX, CY, SR - 5, 235, 305)} fill="none" stroke="#3b82f6" strokeWidth={12} strokeLinecap="round" opacity={0.85} />
      <text x={CX} y={CY + SR - 10} textAnchor="middle" fill="#93c5fd" fontSize={14} fontWeight={700}>S</text>

      {/* Field direction */}
      <line x1={CX} y1={CY - 82} x2={CX} y2={CY + 82} stroke="#52525b" strokeWidth={1} strokeDasharray="5 4" opacity={0.3} />
      <polygon points={`${CX},${CY + 78} ${CX - 4},${CY + 70} ${CX + 4},${CY + 70}`} fill="#52525b" opacity={0.3} />
      <text x={CX + 14} y={CY + 2} fill="#52525b" fontSize={8} opacity={0.5}>B</text>

      {/* Rotor */}
      <circle cx={CX} cy={CY} r={RR} fill="#18181b" stroke="#3f3f46" strokeWidth={1.5} />
      <circle cx={CX} cy={CY} r={SH} fill="#27272a" stroke="#52525b" strokeWidth={1.5} />
      <line x1={CX} y1={CY} x2={CX + SH * Math.cos(angle * Math.PI / 180)} y2={CY - SH * Math.sin(angle * Math.PI / 180)} stroke="#6366f1" strokeWidth={2.5} strokeLinecap="round" />

      {/* Conductors */}
      {conductors.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r={7} fill={c.isOut ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)'} stroke={c.isOut ? '#fbbf24' : '#4ade80'} strokeWidth={1.5} />
          {c.isOut
            ? <circle cx={c.x} cy={c.y} r={2.5} fill="#fbbf24" />
            : <><line x1={c.x - 3.5} y1={c.y - 3.5} x2={c.x + 3.5} y2={c.y + 3.5} stroke="#4ade80" strokeWidth={1.8} /><line x1={c.x + 3.5} y1={c.y - 3.5} x2={c.x - 3.5} y2={c.y + 3.5} stroke="#4ade80" strokeWidth={1.8} /></>}
          {c.fl > 2 && <line x1={c.x} y1={c.y} x2={c.x + c.fl * c.tx} y2={c.y + c.fl * c.ty} stroke="#c084fc" strokeWidth={1.5} opacity={0.7} markerEnd="url(#fa)" />}
        </g>
      ))}

      {/* Brushes */}
      <rect x={CX + RR + 3} y={CY - 6} width={11} height={12} rx={2} fill="#52525b" stroke="#71717a" strokeWidth={1} />
      <text x={CX + RR + 18} y={CY + 3} fill="#71717a" fontSize={8} fontWeight={500}>+</text>
      <rect x={CX - RR - 14} y={CY - 6} width={11} height={12} rx={2} fill="#52525b" stroke="#71717a" strokeWidth={1} />
      <text x={CX - RR - 22} y={CY + 3} fill="#71717a" fontSize={8} fontWeight={500}>{'\u2212'}</text>

      {/* Rotation arrow */}
      <path d={arc(CX, CY, RR + 16, 20, 55)} fill="none" stroke="#6366f1" strokeWidth={1.2} opacity={0.5} />
      <polygon points={`${CX + (RR + 16) * Math.cos(55 * Math.PI / 180)},${CY - (RR + 16) * Math.sin(55 * Math.PI / 180)} ${CX + (RR + 12) * Math.cos(50 * Math.PI / 180)},${CY - (RR + 12) * Math.sin(50 * Math.PI / 180)} ${CX + (RR + 20) * Math.cos(50 * Math.PI / 180)},${CY - (RR + 20) * Math.sin(50 * Math.PI / 180)}`} fill="#6366f1" opacity={0.5} />

      {/* Operating state label */}
      <rect x={CX - 50} y={CY + SR + 24} width={100} height={20} rx={6}
        fill={motor.stalled ? 'rgba(239,68,68,0.12)' : motor.eta > 80 ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)'}
        stroke={motor.stalled ? '#ef4444' : motor.eta > 80 ? '#22c55e' : '#f59e0b'} strokeWidth={0.8} />
      <text x={CX} y={CY + SR + 38} textAnchor="middle"
        fill={motor.stalled ? '#ef4444' : motor.eta > 80 ? '#22c55e' : '#f59e0b'}
        fontSize={9} fontWeight={600}>
        {motor.stalled ? 'STALLED' : motor.eta > 80 ? 'MOTORING' : 'LOW EFFICIENCY'}
      </text>

      {/* Legend */}
      <circle cx={50} cy={CY + SR + 10} r={3} fill="#fbbf24" />
      <text x={58} y={CY + SR + 13} fill="#a1a1aa" fontSize={9}>Current out</text>
      <line x1={137} y1={CY + SR + 7} x2={143} y2={CY + SR + 13} stroke="#4ade80" strokeWidth={1.5} />
      <line x1={143} y1={CY + SR + 7} x2={137} y2={CY + SR + 13} stroke="#4ade80" strokeWidth={1.5} />
      <text x={150} y={CY + SR + 13} fill="#a1a1aa" fontSize={9}>Current in</text>
      <line x1={228} y1={CY + SR + 10} x2={248} y2={CY + SR + 10} stroke="#c084fc" strokeWidth={1.5} markerEnd="url(#fa)" />
      <text x={254} y={CY + SR + 13} fill="#a1a1aa" fontSize={9}>Force (F=BIL)</text>

      {/* Divider */}
      <line x1={400} y1={8} x2={400} y2={302} stroke="#1e1e2e" strokeWidth={1} />

      {/* ── Right panel: Back-EMF Waveform ── */}
      <text x={690} y={18} textAnchor="middle" fill="#71717a" fontSize={12} fontWeight={600}>Back-EMF Waveform (Single Conductor)</text>

      {/* Axes */}
      <line x1={430} y1={88} x2={935} y2={88} stroke="#27272a" strokeWidth={1} />
      <line x1={430} y1={32} x2={430} y2={145} stroke="#27272a" strokeWidth={1} />
      <text x={425} y={40} textAnchor="end" fill="#52525b" fontSize={8}>+E<tspan dy={3} fontSize={6}>b</tspan></text>
      <text x={425} y={92} textAnchor="end" fill="#52525b" fontSize={8}>0</text>
      <text x={425} y={142} textAnchor="end" fill="#52525b" fontSize={8}>{'\u2212'}E<tspan dy={3} fontSize={6}>b</tspan></text>
      {[0, 90, 180, 270, 360].map(d => (
        <text key={d} x={432 + d * 1.38} y={152} textAnchor="middle" fill="#3f3f46" fontSize={8}>{d}{'\u00B0'}</text>
      ))}

      {/* Raw sine (before commutation) */}
      <path d={sinPath} fill="none" stroke="#3b82f6" strokeWidth={1.2} strokeDasharray="4 3" opacity={0.4} />
      {/* Commutated |sin| */}
      <path d={emfPath} fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.8} />

      {/* Position marker */}
      <line x1={mx} y1={30} x2={mx} y2={148} stroke="#6366f1" strokeWidth={1} strokeDasharray="3 2" opacity={0.5} />
      <circle cx={mx} cy={my} r={4} fill="#6366f1" stroke="#818cf8" strokeWidth={1.5} />

      {/* Waveform legend */}
      <line x1={440} y1={158} x2={460} y2={158} stroke="#3b82f6" strokeWidth={1.2} strokeDasharray="4 3" opacity={0.5} />
      <text x={465} y={161} fill="#52525b" fontSize={8}>Raw EMF (AC)</text>
      <line x1={570} y1={158} x2={590} y2={158} stroke="#f59e0b" strokeWidth={2} opacity={0.8} />
      <text x={595} y={161} fill="#52525b" fontSize={8}>Commutated (DC)</text>

      {/* ── Voltage Equation Bar ── */}
      <text x={440} y={vBarY - 5} fill="#a1a1aa" fontSize={10} fontWeight={600}>Voltage Equation: V = E<tspan dy={-4} fontSize={7}>b</tspan><tspan dy={4}> + I</tspan><tspan dy={-4} fontSize={7}>a</tspan><tspan dy={4}>R</tspan><tspan dy={-4} fontSize={7}>a</tspan></text>
      <rect x={vBarX} y={vBarY} width={vBarW} height={20} rx={4} fill="none" stroke="#3f3f46" strokeWidth={1} />
      <rect x={vBarX} y={vBarY} width={Math.max(ebFrac * vBarW, 0)} height={20} rx={4} fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth={1} />
      {ebFrac > 0.15 && <text x={vBarX + ebFrac * vBarW / 2} y={vBarY + 14} textAnchor="middle" fill="#22c55e" fontSize={10} fontWeight={600}>E<tspan dy={3} fontSize={7}>b</tspan><tspan dy={-3}>={motor.Eb.toFixed(1)}V</tspan></text>}
      {(1 - ebFrac) > 0.05 && <text x={vBarX + ebFrac * vBarW + (1 - ebFrac) * vBarW / 2} y={vBarY + 14} textAnchor="middle" fill="#ef4444" fontSize={9} fontWeight={500}>I<tspan dy={3} fontSize={6}>a</tspan><tspan dy={-3}>R</tspan><tspan dy={3} fontSize={6}>a</tspan><tspan dy={-3}>={motor.stalled ? motor.V.toFixed(0) : (motor.Ia * RA).toFixed(1)}V</tspan></text>}
      <text x={vBarX + vBarW + 8} y={vBarY + 14} fill="#71717a" fontSize={10} fontWeight={600}>{motor.V}V</text>

      {/* ── Power Flow Bar with animated arrows ── */}
      <text x={440} y={pBarY - 5} fill="#a1a1aa" fontSize={10} fontWeight={600}>Power Flow: P<tspan dy={-4} fontSize={7}>in</tspan><tspan dy={4}> = P</tspan><tspan dy={-4} fontSize={7}>mech</tspan><tspan dy={4}> + P</tspan><tspan dy={-4} fontSize={7}>cu</tspan></text>
      <rect x={vBarX} y={pBarY} width={vBarW} height={20} rx={4} fill="none" stroke="#3f3f46" strokeWidth={1} />
      <rect x={vBarX} y={pBarY} width={Math.max(etaFrac * vBarW, 0)} height={20} rx={4} fill="rgba(34,197,94,0.12)" stroke="#22c55e" strokeWidth={1} />
      {etaFrac > 0.2 && <text x={vBarX + etaFrac * vBarW / 2} y={pBarY + 14} textAnchor="middle" fill="#22c55e" fontSize={9} fontWeight={500}>P<tspan dy={3} fontSize={6}>mech</tspan><tspan dy={-3}>={motor.Pmech.toFixed(0)}W</tspan></text>}
      {(1 - etaFrac) > 0.05 && <text x={vBarX + etaFrac * vBarW + (1 - etaFrac) * vBarW / 2} y={pBarY + 14} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight={500}>P<tspan dy={3} fontSize={6}>cu</tspan><tspan dy={-3}>={motor.Pcu.toFixed(0)}W</tspan></text>}
      <text x={vBarX + vBarW + 8} y={pBarY + 14} fill="#71717a" fontSize={10} fontWeight={600}>{motor.Pin.toFixed(0)}W</text>

      {/* Animated power flow arrows */}
      {powerFlowAnim && (
        <g>
          <line x1={vBarX - 15} y1={pBarY + 10} x2={vBarX - 3} y2={pBarY + 10} stroke="#22c55e" strokeWidth={1.5} markerEnd="url(#powerArrow)" opacity={0.6}>
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" repeatCount="indefinite" />
          </line>
          <text x={vBarX - 20} y={pBarY + 14} textAnchor="end" fill="#22c55e" fontSize={7} opacity={0.5}>P<tspan dy={2} fontSize={5}>in</tspan></text>
        </g>
      )}

      {/* Efficiency arc gauge */}
      <text x={690} y={pBarY + 45} textAnchor="middle" fill="#71717a" fontSize={10} fontWeight={600}>
        {'\u03B7'} = {motor.eta.toFixed(1)}%
      </text>
      {motor.stalled && <text x={690} y={pBarY + 62} textAnchor="middle" fill="#ef4444" fontSize={11} fontWeight={700}>MOTOR STALLED {'\u2014'} I<tspan dy={3} fontSize={8}>a</tspan><tspan dy={-3}> = {motor.Ia.toFixed(1)}A</tspan></text>}

      {/* Key equations */}
      <text x={440} y={pBarY + 50} fill="#52525b" fontSize={9}>
        T = K{'\u03C6'}{'\u00B7'}I<tspan dy={2} fontSize={7}>a</tspan><tspan dy={-2}> = {motor.Ke.toFixed(2)} {'\u00D7'} {motor.Ia.toFixed(1)} = {(motor.Ke * motor.Ia).toFixed(1)} Nm</tspan>
      </text>
      <text x={440} y={pBarY + 65} fill="#52525b" fontSize={9}>
        N = E<tspan dy={2} fontSize={7}>b</tspan><tspan dy={-2}>/(K{'\u03C6'}) {'\u00D7'} 30/{'\u03C0'} = {motor.N.toFixed(0)} rpm{motor.stalled ? ' (stalled)' : ''}</tspan>
      </text>

      {/* Circuit schematic overlay */}
      <CircuitSchematic motor={motor} />
    </svg>
  );
}

/* SVG diagram: Armature circuit for Theory tab */
function TheoryCircuitDiagram() {
  return (
    <svg viewBox="0 0 760 220" style={S.svgDiagram}>
      <text x={380} y={22} textAnchor="middle" fill="#71717a" fontSize={13} fontWeight={600}>DC Motor Armature Equivalent Circuit</text>

      {/* Main circuit loop */}
      {/* Vt source on the left */}
      <circle cx={120} cy={120} r={28} fill="none" stroke="#6366f1" strokeWidth={2} />
      <text x={120} y={108} textAnchor="middle" fill="#6366f1" fontSize={10} fontWeight={600}>+</text>
      <text x={120} y={136} textAnchor="middle" fill="#6366f1" fontSize={10} fontWeight={600}>{'\u2212'}</text>
      <text x={120} y={124} textAnchor="middle" fill="#818cf8" fontSize={12} fontWeight={700}>V<tspan dy={4} fontSize={9}>t</tspan></text>
      <text x={120} y={165} textAnchor="middle" fill="#52525b" fontSize={10}>Supply</text>

      {/* Top wire from Vt to Ra */}
      <line x1={120} y1={92} x2={120} y2={55} stroke="#a1a1aa" strokeWidth={1.5} />
      <line x1={120} y1={55} x2={530} y2={55} stroke="#a1a1aa" strokeWidth={1.5} />

      {/* Current arrow on top wire */}
      <polygon points="200,55 190,51 190,59" fill="#22d3ee" />
      <text x={200} y={48} fill="#22d3ee" fontSize={11} fontWeight={600}>I<tspan dy={3} fontSize={8}>a</tspan></text>

      {/* Ra resistor */}
      <rect x={270} y={42} width={70} height={26} rx={5} fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeWidth={1.5} />
      <text x={305} y={60} textAnchor="middle" fill="#ef4444" fontSize={12} fontWeight={700}>R<tspan dy={4} fontSize={9}>a</tspan></text>
      <text x={305} y={82} textAnchor="middle" fill="#71717a" fontSize={9}>Armature</text>
      <text x={305} y={93} textAnchor="middle" fill="#71717a" fontSize={9}>Resistance</text>

      {/* Voltage drop across Ra */}
      <line x1={270} y1={36} x2={270} y2={30} stroke="#ef4444" strokeWidth={0.8} strokeDasharray="3 2" />
      <line x1={340} y1={36} x2={340} y2={30} stroke="#ef4444" strokeWidth={0.8} strokeDasharray="3 2" />
      <line x1={270} y1={30} x2={340} y2={30} stroke="#ef4444" strokeWidth={0.8} strokeDasharray="3 2" />
      <text x={305} y={26} textAnchor="middle" fill="#ef4444" fontSize={9}>I<tspan dy={2} fontSize={7}>a</tspan><tspan dy={-2}>{'\u00B7'}R</tspan><tspan dy={2} fontSize={7}>a</tspan></text>

      {/* Back-EMF source */}
      <circle cx={480} cy={120} r={28} fill="none" stroke="#22c55e" strokeWidth={2} />
      <text x={480} y={108} textAnchor="middle" fill="#22c55e" fontSize={10} fontWeight={600}>+</text>
      <text x={480} y={136} textAnchor="middle" fill="#22c55e" fontSize={10} fontWeight={600}>{'\u2212'}</text>
      <text x={480} y={124} textAnchor="middle" fill="#22c55e" fontSize={12} fontWeight={700}>E<tspan dy={4} fontSize={9}>b</tspan></text>
      <text x={480} y={165} textAnchor="middle" fill="#52525b" fontSize={10}>Back-EMF</text>

      {/* Wire from Ra to Eb */}
      <line x1={480} y1={92} x2={480} y2={55} stroke="#a1a1aa" strokeWidth={1.5} />

      {/* Bottom wire */}
      <line x1={120} y1={148} x2={120} y2={190} stroke="#a1a1aa" strokeWidth={1.5} />
      <line x1={120} y1={190} x2={480} y2={190} stroke="#a1a1aa" strokeWidth={1.5} />
      <line x1={480} y1={148} x2={480} y2={190} stroke="#a1a1aa" strokeWidth={1.5} />

      {/* Ground symbol */}
      <line x1={295} y1={190} x2={315} y2={190} stroke="#52525b" strokeWidth={1.5} />
      <line x1={299} y1={195} x2={311} y2={195} stroke="#52525b" strokeWidth={1.2} />
      <line x1={303} y1={200} x2={307} y2={200} stroke="#52525b" strokeWidth={0.8} />

      {/* KVL equation */}
      <rect x={550} y={45} width={195} height={60} rx={8} fill="rgba(99,102,241,0.06)" stroke="#6366f1" strokeWidth={1} />
      <text x={647} y={65} textAnchor="middle" fill="#818cf8" fontSize={10} fontWeight={600}>KVL around loop:</text>
      <text x={647} y={85} textAnchor="middle" fill="#c4b5fd" fontSize={13} fontWeight={700} fontFamily="monospace">V<tspan dy={3} fontSize={9}>t</tspan><tspan dy={-3}> = E</tspan><tspan dy={3} fontSize={9}>b</tspan><tspan dy={-3}> + I</tspan><tspan dy={3} fontSize={9}>a</tspan><tspan dy={-3}>R</tspan><tspan dy={3} fontSize={9}>a</tspan></text>

      {/* Motor mechanical output symbol */}
      <line x1={508} y1={120} x2={540} y2={120} stroke="#a1a1aa" strokeWidth={1.5} />
      <circle cx={555} cy={120} r={15} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={555} y={124} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight={700}>M</text>
      <path d="M 570 120 Q 578 112 578 120 Q 578 128 586 120" fill="none" stroke="#f59e0b" strokeWidth={1.2} />
      <text x={575} y={145} textAnchor="middle" fill="#71717a" fontSize={8}>Shaft</text>
    </svg>
  );
}

/* SVG diagram: DC Motor cross-section for Theory tab */
function TheoryCrossSectionDiagram() {
  const cx = 200, cy = 140, sr = 110, rr = 70;
  return (
    <svg viewBox="0 0 760 300" style={S.svgDiagram}>
      <text x={380} y={22} textAnchor="middle" fill="#71717a" fontSize={13} fontWeight={600}>DC Motor Construction {'\u2014'} Cross-Section View</text>

      {/* Yoke (outer ring) */}
      <circle cx={cx} cy={cy} r={sr + 15} fill="none" stroke="#3f3f46" strokeWidth={14} />
      <text x={cx + sr + 28} y={cy - 50} fill="#71717a" fontSize={9} fontWeight={500}>Yoke</text>
      <line x1={cx + sr + 10} y1={cy - 45} x2={cx + sr + 26} y2={cy - 48} stroke="#52525b" strokeWidth={0.5} />

      {/* Field poles N and S */}
      <path d={arc(cx, cy, sr - 2, 55, 125)} fill="none" stroke="#ef4444" strokeWidth={18} strokeLinecap="round" opacity={0.7} />
      <text x={cx} y={cy - sr + 28} textAnchor="middle" fill="#fca5a5" fontSize={16} fontWeight={700}>N</text>
      <path d={arc(cx, cy, sr - 2, 235, 305)} fill="none" stroke="#3b82f6" strokeWidth={18} strokeLinecap="round" opacity={0.7} />
      <text x={cx} y={cy + sr - 16} textAnchor="middle" fill="#93c5fd" fontSize={16} fontWeight={700}>S</text>

      {/* Field winding coils */}
      <rect x={cx - 20} y={cy - sr - 2} width={40} height={14} rx={3} fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth={1} />
      <text x={cx} y={cy - sr + 8} textAnchor="middle" fill="#fca5a5" fontSize={7}>Field Winding</text>
      <rect x={cx - 20} y={cy + sr - 12} width={40} height={14} rx={3} fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth={1} />
      <text x={cx} y={cy + sr + 0} textAnchor="middle" fill="#93c5fd" fontSize={7}>Field Winding</text>

      {/* Air gap */}
      <circle cx={cx} cy={cy} r={rr + 4} fill="none" stroke="#27272a" strokeWidth={1} strokeDasharray="3 3" />
      <text x={cx + rr + 10} y={cy + 2} fill="#52525b" fontSize={7}>Air Gap</text>

      {/* Rotor (Armature) */}
      <circle cx={cx} cy={cy} r={rr} fill="#18181b" stroke="#3f3f46" strokeWidth={1.5} />
      <text x={cx} y={cy - rr + 14} textAnchor="middle" fill="#818cf8" fontSize={8} fontWeight={500}>Armature (Rotor)</text>

      {/* Slots with conductors */}
      {Array.from({ length: 12 }, (_, i) => {
        const ang = i * 30 * Math.PI / 180;
        const sx2 = cx + (rr - 8) * Math.cos(ang);
        const sy2 = cy - (rr - 8) * Math.sin(ang);
        return <circle key={i} cx={sx2} cy={sy2} r={4} fill="rgba(251,191,36,0.2)" stroke="#fbbf24" strokeWidth={0.8} />;
      })}

      {/* Shaft */}
      <circle cx={cx} cy={cy} r={14} fill="#27272a" stroke="#52525b" strokeWidth={1.5} />
      <text x={cx} y={cy + 4} textAnchor="middle" fill="#52525b" fontSize={7}>Shaft</text>

      {/* Commutator (shown conceptually) */}
      <circle cx={cx} cy={cy} r={22} fill="none" stroke="#fbbf24" strokeWidth={1} strokeDasharray="4 2" opacity={0.5} />

      {/* Brushes */}
      <rect x={cx + rr + 6} y={cy - 8} width={14} height={16} rx={3} fill="#52525b" stroke="#71717a" strokeWidth={1} />
      <text x={cx + rr + 26} y={cy + 2} fill="#71717a" fontSize={8}>Brush (+)</text>
      <rect x={cx - rr - 20} y={cy - 8} width={14} height={16} rx={3} fill="#52525b" stroke="#71717a" strokeWidth={1} />
      <text x={cx - rr - 48} y={cy + 2} fill="#71717a" fontSize={8}>Brush ({'\u2212'})</text>

      {/* Flux path arrows */}
      <line x1={cx} y1={cy - 30} x2={cx} y2={cy + 30} stroke="#52525b" strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />
      <polygon points={`${cx},${cy + 28} ${cx - 3},${cy + 22} ${cx + 3},${cy + 22}`} fill="#52525b" opacity={0.4} />
      <text x={cx + 10} y={cy + 4} fill="#52525b" fontSize={7} opacity={0.6}>B field</text>

      {/* ── Right: Labels and annotations ── */}
      <line x1={420} y1={30} x2={420} y2={270} stroke="#1e1e2e" strokeWidth={1} />

      <text x={440} y={50} fill="#e4e4e7" fontSize={13} fontWeight={600}>Key Components</text>

      {[
        { y: 75, color: '#3f3f46', label: 'Yoke', desc: 'Steel frame, provides magnetic return path' },
        { y: 105, color: '#ef4444', label: 'Field Poles (N)', desc: 'Create main magnetic field (salient poles)' },
        { y: 135, color: '#3b82f6', label: 'Field Poles (S)', desc: 'Opposite polarity, complete magnetic circuit' },
        { y: 165, color: '#818cf8', label: 'Armature (Rotor)', desc: 'Laminated steel, carries conductors in slots' },
        { y: 195, color: '#fbbf24', label: 'Commutator', desc: 'Copper segments, converts AC to DC' },
        { y: 225, color: '#71717a', label: 'Brushes', desc: 'Carbon/graphite, sliding contact with commutator' },
        { y: 255, color: '#52525b', label: 'Shaft', desc: 'Transmits mechanical power to load' },
      ].map(item => (
        <g key={item.label}>
          <rect x={440} y={item.y - 10} width={10} height={10} rx={2} fill={item.color} opacity={0.6} />
          <text x={456} y={item.y - 1} fill="#e4e4e7" fontSize={11} fontWeight={600}>{item.label}</text>
          <text x={456} y={item.y + 12} fill="#71717a" fontSize={9}>{item.desc}</text>
        </g>
      ))}
    </svg>
  );
}

/* SVG diagram: Back-EMF vs Speed annotation for Theory tab */
function TheoryBackEmfDiagram() {
  const px = 60, py = 30, pw = 280, ph = 160;
  const sx = v => px + (v / 1600) * pw;
  const sy = v => py + ph - (v / 250) * ph;
  return (
    <svg viewBox="0 0 760 230" style={S.svgDiagram}>
      <text x={380} y={20} textAnchor="middle" fill="#71717a" fontSize={13} fontWeight={600}>Back-EMF vs Speed (E<tspan dy={3} fontSize={10}>b</tspan><tspan dy={-3}> = K{'\u03C6'}{'\u00B7'}{'\u03C9'})</tspan></text>

      {/* Grid */}
      {[0, 500, 1000, 1500].map(n => <line key={n} x1={sx(n)} y1={py} x2={sx(n)} y2={py + ph} stroke="#1e1e2e" strokeWidth={1} />)}
      {[0, 50, 100, 150, 200].map(e => <line key={e} x1={px} y1={sy(e)} x2={px + pw} y2={sy(e)} stroke="#1e1e2e" strokeWidth={1} />)}

      {/* Axes */}
      <line x1={px} y1={py} x2={px} y2={py + ph} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={px} y1={py + ph} x2={px + pw} y2={py + ph} stroke="#3f3f46" strokeWidth={1.5} />
      <text x={px + pw / 2} y={py + ph + 20} textAnchor="middle" fill="#71717a" fontSize={10}>Speed N (rpm)</text>
      <text x={20} y={py + ph / 2} textAnchor="middle" fill="#71717a" fontSize={10} transform={`rotate(-90, 20, ${py + ph / 2})`}>E<tspan dy={3} fontSize={8}>b</tspan><tspan dy={-3}> (V)</tspan></text>

      {/* Tick labels */}
      {[0, 500, 1000, 1500].map(n => <text key={n} x={sx(n)} y={py + ph + 12} textAnchor="middle" fill="#52525b" fontSize={8}>{n}</text>)}
      {[0, 50, 100, 150, 200].map(e => <text key={e} x={px - 6} y={sy(e) + 3} textAnchor="end" fill="#52525b" fontSize={8}>{e}</text>)}

      {/* Line: Eb = K*phi*omega, for phi=1.5 */}
      <line x1={sx(0)} y1={sy(0)} x2={sx(1500)} y2={sy(1500 * 1.5 * Math.PI / 30)} stroke="#22c55e" strokeWidth={2.5} />
      <text x={sx(1100)} y={sy(1100 * 1.5 * Math.PI / 30) - 10} fill="#22c55e" fontSize={10} fontWeight={600}>K{'\u03C6'} = 1.5</text>

      {/* Line for weaker field */}
      <line x1={sx(0)} y1={sy(0)} x2={sx(1500)} y2={sy(1500 * 0.8 * Math.PI / 30)} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 3" />
      <text x={sx(1300)} y={sy(1300 * 0.8 * Math.PI / 30) - 8} fill="#f59e0b" fontSize={9}>K{'\u03C6'} = 0.8 (weakened)</text>

      {/* Annotation: slope = Kphi */}
      <text x={sx(500)} y={sy(500 * 1.5 * Math.PI / 30) + 20} fill="#a1a1aa" fontSize={9}>Slope = K{'\u03C6'}</text>

      {/* ── Right: Operating point annotations ── */}
      <line x1={400} y1={25} x2={400} y2={210} stroke="#1e1e2e" strokeWidth={1} />

      <text x={420} y={50} fill="#e4e4e7" fontSize={12} fontWeight={600}>Back-EMF Properties</text>

      <rect x={420} y={62} width={320} height={44} rx={8} fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeWidth={0.8} />
      <text x={430} y={78} fill="#22c55e" fontSize={10} fontWeight={600}>Linear relationship:</text>
      <text x={430} y={96} fill="#a1a1aa" fontSize={10} fontFamily="monospace">E<tspan dy={3} fontSize={8}>b</tspan><tspan dy={-3}> = K{'\u03C6'} {'\u00D7'} {'\u03C9'} = K{'\u03C6'} {'\u00D7'} (2{'\u03C0'}N/60)</tspan></text>

      <rect x={420} y={116} width={320} height={44} rx={8} fill="rgba(99,102,241,0.06)" stroke="#6366f1" strokeWidth={0.8} />
      <text x={430} y={132} fill="#818cf8" fontSize={10} fontWeight={600}>Self-regulation mechanism:</text>
      <text x={430} y={148} fill="#a1a1aa" fontSize={9}>Load {'\u2191'} {'\u2192'} Speed {'\u2193'} {'\u2192'} E<tspan dy={2} fontSize={7}>b</tspan><tspan dy={-2}> {'\u2193'} {'\u2192'} I</tspan><tspan dy={2} fontSize={7}>a</tspan><tspan dy={-2}> {'\u2191'} {'\u2192'} Torque {'\u2191'}</tspan></text>

      <rect x={420} y={170} width={320} height={36} rx={8} fill="rgba(239,68,68,0.06)" stroke="#ef4444" strokeWidth={0.8} />
      <text x={430} y={186} fill="#ef4444" fontSize={10} fontWeight={600}>At start (N=0): E<tspan dy={3} fontSize={8}>b</tspan><tspan dy={-3}> = 0</tspan></text>
      <text x={430} y={200} fill="#a1a1aa" fontSize={9}>I<tspan dy={2} fontSize={7}>a(start)</tspan><tspan dy={-2}> = V/R</tspan><tspan dy={2} fontSize={7}>a</tspan><tspan dy={-2}> (dangerously high!)</tspan></text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>DC Motor {'\u2014'} Construction & Working Principle</h2>
      <p style={S.p}>
        A DC motor converts direct-current electrical energy into mechanical rotational energy using
        the interaction between a magnetic field and current-carrying conductors. It consists of
        four essential parts: the <strong style={{ color: '#e4e4e7' }}>stator</strong> (field system),
        the <strong style={{ color: '#e4e4e7' }}>rotor</strong> (armature),
        the <strong style={{ color: '#e4e4e7' }}>commutator</strong>, and
        the <strong style={{ color: '#e4e4e7' }}>brushes</strong>.
      </p>

      {/* SVG: Cross-section diagram */}
      <TheoryCrossSectionDiagram />

      <h3 style={S.h3}>Construction</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#ef4444' }}>Stator (Field System)</strong> {'\u2014'} Provides the stationary magnetic field. In smaller motors, permanent magnets create the field. In larger machines, field windings wrapped around salient poles are energized by DC current. The field poles are bolted to the cylindrical yoke, which completes the magnetic circuit.</li>
        <li style={S.li}><strong style={{ color: '#818cf8' }}>Rotor (Armature)</strong> {'\u2014'} A laminated steel cylinder mounted on the shaft. Slots machined into its surface house the armature conductors. Laminations reduce eddy current losses. The armature winding is typically a closed lap or wave winding.</li>
        <li style={S.li}><strong style={{ color: '#fbbf24' }}>Commutator</strong> {'\u2014'} A cylindrical assembly of copper segments insulated from each other by mica strips, mounted on the shaft. Each segment connects to specific armature coils. The commutator is the key invention that converts the AC induced in rotating armature coils into DC at the external terminals.</li>
        <li style={S.li}><strong style={{ color: '#71717a' }}>Brushes</strong> {'\u2014'} Stationary carbon or graphite blocks that maintain sliding contact with the rotating commutator, providing the electrical connection between the external DC supply and the armature winding.</li>
      </ul>

      <h3 style={S.h3}>Working Principle {'\u2014'} Force on a Current-Carrying Conductor</h3>
      <p style={S.p}>
        When a current-carrying conductor is placed in a magnetic field, it experiences a mechanical
        force given by the Lorentz force law:
      </p>
      <div style={S.eq}>F = B {'\u00D7'} I {'\u00D7'} L {'\u00D7'} sin({'\u03B8'})</div>
      <p style={S.p}>
        where B is the magnetic flux density (T), I is the current (A), L is the active length of
        the conductor (m), and {'\u03B8'} is the angle between the current direction and the field (90{'\u00B0'} in
        a well-designed motor, giving maximum force). This force creates a torque about the shaft
        axis, causing rotation.
      </p>

      <h3 style={S.h3}>The Genius of the Commutator</h3>
      <p style={S.p}>
        As the rotor turns, each conductor alternately passes under N and S poles. Without
        commutation, the torque direction would reverse every half revolution, producing zero
        net rotation. The commutator solves this by reversing the current direction in each
        conductor precisely as it crosses the magnetic neutral axis (the brush position).
        This ensures that conductors under the N pole always carry current in one direction,
        and conductors under the S pole always carry current in the opposite direction {'\u2014'}
        producing unidirectional torque regardless of rotor position.
      </p>
      <div style={S.ctx}>
        <span style={S.ctxT}>Key Insight</span>
        <p style={S.ctxP}>
        The commutator is essentially a mechanical frequency converter {'\u2014'} a rotary switch
        synchronized to the rotor position. It rectifies the AC nature of the rotating armature
        into DC at the terminals. (Faraday's 1831 homopolar motor already ran continuously
        without a commutator; the switching network shown here is needed only for the
        conventional multi-turn armature.)
        </p>
      </div>

      <h3 style={S.h3}>Back-EMF {'\u2014'} The Self-Regulating Mechanism</h3>
      <p style={S.p}>
        As the armature rotates in the magnetic field, each conductor cuts flux lines. By
        Faraday's law of electromagnetic induction, an EMF is induced in each conductor.
        This induced EMF opposes the applied voltage (Lenz's law) and is called the
        <strong style={{ color: '#f59e0b' }}> back-EMF (E<sub>b</sub>)</strong>:
      </p>
      <div style={S.eq}>E<sub>b</sub> = (P {'\u00D7'} {'\u03C6'} {'\u00D7'} N {'\u00D7'} Z) / (60 {'\u00D7'} A)</div>
      <p style={S.p}>
        where P = number of poles, {'\u03C6'} = flux per pole (Wb), N = speed (rpm),
        Z = total armature conductors, A = number of parallel paths
        (A = P for lap winding, A = 2 for wave winding).
        In simplified form:
      </p>
      <div style={S.eq}>E<sub>b</sub> = K{'\u03C6'} {'\u00D7'} {'\u03C9'}    where K{'\u03C6'} = PZ/(2{'\u03C0'}A) {'\u00D7'} {'\u03C6'}</div>

      {/* SVG: Back-EMF vs Speed diagram */}
      <TheoryBackEmfDiagram />

      <p style={S.p}>
        Back-EMF is the motor's natural speed regulator. At no load, the motor speeds up until
        E<sub>b</sub> {'\u2248'} V, making I<sub>a</sub> {'\u2248'} 0 (just enough current for friction losses). When load increases,
        the motor slows slightly {'\u2192'} E<sub>b</sub> drops {'\u2192'} more current flows {'\u2192'} more torque is produced {'\u2192'}
        a new equilibrium is reached. This negative feedback loop is inherently stable.
      </p>

      <h2 style={S.h2}>Fundamental Equations</h2>

      <h3 style={S.h3}>Voltage Equation</h3>

      {/* SVG: Circuit diagram */}
      <TheoryCircuitDiagram />

      <div style={S.eq}>V = E<sub>b</sub> + I<sub>a</sub> {'\u00D7'} R<sub>a</sub></div>
      <p style={S.p}>
        The supply voltage V must overcome the back-EMF and the resistive drop in the armature
        winding. This is the most fundamental equation of a DC motor. Rearranging:
      </p>

      {/* Step-by-step derivation box */}
      <div style={S.eqBox}>
        <span style={{ ...S.ctxT, color: '#818cf8', fontSize: 12 }}>Step-by-step: Finding Armature Current</span>
        <div style={S.eqStep}>Given: V = E<sub>b</sub> + I<sub>a</sub> {'\u00B7'} R<sub>a</sub></div>
        <div style={S.eqStep}>Rearrange: I<sub>a</sub> {'\u00B7'} R<sub>a</sub> = V {'\u2212'} E<sub>b</sub></div>
        <div style={S.eqResult}>I<sub>a</sub> = (V {'\u2212'} E<sub>b</sub>) / R<sub>a</sub></div>
      </div>

      <h3 style={S.h3}>Torque Equation</h3>
      <div style={S.eq}>T = K{'\u03C6'} {'\u00D7'} I<sub>a</sub>    (N{'\u00B7'}m)</div>
      <p style={S.p}>
        Electromagnetic torque is directly proportional to flux and armature current. The
        torque constant K{'\u03C6'} has the same numerical value as the back-EMF constant (in SI units)
        because both arise from the same electromagnetic interaction {'\u2014'} force on a conductor
        is the dual of EMF induction.
      </p>

      <h3 style={S.h3}>Speed Equation</h3>
      <div style={S.eqBox}>
        <span style={{ ...S.ctxT, color: '#818cf8', fontSize: 12 }}>Derivation of Speed Equation</span>
        <div style={S.eqStep}>From voltage equation: E<sub>b</sub> = V {'\u2212'} I<sub>a</sub> {'\u00B7'} R<sub>a</sub></div>
        <div style={S.eqStep}>Since E<sub>b</sub> = K{'\u03C6'} {'\u00B7'} {'\u03C9'}: {'\u03C9'} = E<sub>b</sub> / K{'\u03C6'} = (V {'\u2212'} I<sub>a</sub>{'\u00B7'}R<sub>a</sub>) / K{'\u03C6'}</div>
        <div style={S.eqStep}>Convert to rpm: N = {'\u03C9'} {'\u00D7'} 30/{'\u03C0'}</div>
        <div style={S.eqResult}>N = (V {'\u2212'} I<sub>a</sub>{'\u00B7'}R<sub>a</sub>) / K{'\u03C6'} {'\u00D7'} (30/{'\u03C0'})    rpm</div>
      </div>
      <p style={S.p}>
        Speed is proportional to the net voltage driving the back-EMF, and inversely
        proportional to flux. This immediately reveals two speed control methods:
        varying V (armature voltage control) and varying {'\u03C6'} (field control).
      </p>

      <h3 style={S.h3}>Power Balance</h3>
      <div style={S.eq}>P<sub>in</sub> = V {'\u00D7'} I<sub>a</sub> = E<sub>b</sub> {'\u00D7'} I<sub>a</sub> + I<sub>a</sub>{'\u00B2'} {'\u00D7'} R<sub>a</sub> = P<sub>mech</sub> + P<sub>cu</sub></div>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#22c55e' }}>P<sub>mech</sub> = E<sub>b</sub> {'\u00D7'} I<sub>a</sub> = T {'\u00D7'} {'\u03C9'}</strong> {'\u2014'} Mechanical power delivered to the shaft (also equals E<sub>b</sub> {'\u00D7'} I<sub>a</sub> because T = K{'\u03C6'}{'\u00B7'}I<sub>a</sub> and {'\u03C9'} = E<sub>b</sub>/K{'\u03C6'})</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>P<sub>cu</sub> = I<sub>a</sub>{'\u00B2'} {'\u00D7'} R<sub>a</sub></strong> {'\u2014'} Copper loss in the armature winding (Joule heating)</li>
        <li style={S.li}><strong style={{ color: '#a1a1aa' }}>{'\u03B7'} = P<sub>mech</sub> / P<sub>in</sub> {'\u00D7'} 100%</strong> {'\u2014'} Efficiency (real motors also have iron losses, mechanical friction, and stray losses not modeled here)</li>
      </ul>

      <h3 style={S.h3}>The Starting Problem</h3>
      <p style={S.p}>
        At standstill (N = 0), the back-EMF is zero: E<sub>b</sub> = 0. Therefore the starting current is:
      </p>
      <div style={S.eq}>I<sub>a(start)</sub> = V / R<sub>a</sub></div>
      <p style={S.p}>
        For a 220V motor with R<sub>a</sub> = 1{'\u03A9'}, this gives 220A {'\u2014'} typically 10 to 20 times the rated
        current! This enormous inrush can damage the commutator, overheat the armature, and
        cause severe voltage dips on the supply. Solutions include adding external resistance
        in series with the armature during starting (removed in steps as the motor accelerates),
        or using electronic soft-start controllers.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Simulation Parameters</span>
        <p style={S.ctxP}>
          This simulation uses R<sub>a</sub> = {RA} {'\u03A9'}, K<sub>f</sub> = {KF} V{'\u00B7'}s/(rad{'\u00B7'}A). At rated conditions
          (V = 220V, I<sub>f</sub> = 1.5A), the no-load speed is approximately 1401 rpm and the
          stall torque is 330 Nm. The commutated back-EMF waveform shows how the commutator
          converts the AC sinusoidal EMF of each conductor into pulsating DC, with the ripple
          smoothed by having multiple conductors distributed around the armature.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Chapman, S.J. {'\u2014'} <em>Electric Machinery Fundamentals</em>, 5th Edition, McGraw-Hill</li>
        <li style={S.li}>Fitzgerald, Kingsley, Umans {'\u2014'} <em>Electric Machinery</em>, 7th Edition</li>
        <li style={S.li}>Theraja, B.L. {'\u2014'} <em>A Textbook of Electrical Technology Vol. II</em>, S. Chand</li>
        <li style={S.li}>Sen, P.C. {'\u2014'} <em>Principles of Electric Machines and Power Electronics</em>, 3rd Edition</li>
      </ul>
    </div>
  );
}

export default function DCMotorFundamentals() {
  const [tab, setTab] = useState('simulate');
  const [V, setV] = useState(220);
  const [If, setIf] = useState(1.5);
  const [TL, setTL] = useState(10);
  const [angle, setAngle] = useState(0);

  const motor = useMemo(() => computeMotor(V, If, TL), [V, If, TL]);
  const motorRef = useRef(motor);
  motorRef.current = motor;

  useEffect(() => {
    let raf;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const w = motorRef.current.omega;
      if (w > 0.1) setAngle(a => (a + w * 0.4 * dt) % 360);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const nCol = motor.stalled ? '#ef4444' : motor.N > 1200 ? '#22c55e' : motor.N > 600 ? '#f59e0b' : '#ef4444';

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram motor={motor} angle={angle} />
          </div>

          <div style={S.results}>
            <div style={S.ri}><span style={S.rl}>Speed</span><span style={{ ...S.rv, color: nCol }}>{motor.N.toFixed(0)} rpm</span></div>
            <div style={S.ri}><span style={S.rl}>Back-EMF</span><span style={{ ...S.rv, color: '#22c55e' }}>{motor.Eb.toFixed(1)} V</span></div>
            <div style={S.ri}><span style={S.rl}>I<sub>a</sub></span><span style={{ ...S.rv, color: motor.Ia > 50 ? '#ef4444' : '#93c5fd' }}>{motor.Ia.toFixed(1)} A</span></div>
            <div style={S.ri}><span style={S.rl}>Torque</span><span style={{ ...S.rv, color: '#c4b5fd' }}>{motor.T.toFixed(1)} Nm</span></div>
            <div style={S.ri}><span style={S.rl}>P<sub>in</sub></span><span style={{ ...S.rv, color: '#e4e4e7' }}>{motor.Pin.toFixed(0)} W</span></div>
            <div style={S.ri}><span style={S.rl}>P<sub>cu</sub></span><span style={{ ...S.rv, color: '#f59e0b' }}>{motor.Pcu.toFixed(0)} W</span></div>
            <div style={S.ri}><span style={S.rl}>Efficiency</span><span style={{ ...S.rv, color: motor.eta > 85 ? '#22c55e' : '#f59e0b' }}>{motor.eta.toFixed(1)}%</span></div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Armature Voltage (V)</span>
              <input type="range" min={20} max={250} step={5} value={V} onChange={e => setV(+e.target.value)} style={S.slider} />
              <span style={S.val}>{V} V</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Field Current (A)</span>
              <input type="range" min={0.3} max={3} step={0.1} value={If} onChange={e => setIf(+e.target.value)} style={S.slider} />
              <span style={S.val}>{If.toFixed(1)} A</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Load Torque (Nm)</span>
              <input type="range" min={0} max={50} step={1} value={TL} onChange={e => setTL(+e.target.value)} style={S.slider} />
              <span style={S.val}>{TL} Nm</span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
