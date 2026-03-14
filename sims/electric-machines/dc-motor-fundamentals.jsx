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
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14, display: 'block' },
  ctxP: { fontSize: 14, lineHeight: 1.7, color: '#a1a1aa', margin: 0 },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  tbl: { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #3f3f46', color: '#d4d4d8', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #27272a', color: '#a1a1aa' },
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

  return (
    <svg viewBox="0 0 960 310" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      <defs>
        <marker id="fa" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0,0 5,2 0,4" fill="#c084fc" opacity="0.8" />
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
      <text x={CX - RR - 22} y={CY + 3} fill="#71717a" fontSize={8} fontWeight={500}>−</text>

      {/* Rotation arrow */}
      <path d={arc(CX, CY, RR + 16, 20, 55)} fill="none" stroke="#6366f1" strokeWidth={1.2} opacity={0.5} />
      <polygon points={`${CX + (RR + 16) * Math.cos(55 * Math.PI / 180)},${CY - (RR + 16) * Math.sin(55 * Math.PI / 180)} ${CX + (RR + 12) * Math.cos(50 * Math.PI / 180)},${CY - (RR + 12) * Math.sin(50 * Math.PI / 180)} ${CX + (RR + 20) * Math.cos(50 * Math.PI / 180)},${CY - (RR + 20) * Math.sin(50 * Math.PI / 180)}`} fill="#6366f1" opacity={0.5} />

      {/* Legend */}
      <circle cx={50} cy={CY + SR + 10} r={3} fill="#fbbf24" />
      <text x={58} y={CY + SR + 13} fill="#a1a1aa" fontSize={9}>Current out (⊙)</text>
      <line x1={147} y1={CY + SR + 7} x2={153} y2={CY + SR + 13} stroke="#4ade80" strokeWidth={1.5} />
      <line x1={153} y1={CY + SR + 7} x2={147} y2={CY + SR + 13} stroke="#4ade80" strokeWidth={1.5} />
      <text x={160} y={CY + SR + 13} fill="#a1a1aa" fontSize={9}>Current in (⊗)</text>
      <line x1={248} y1={CY + SR + 10} x2={268} y2={CY + SR + 10} stroke="#c084fc" strokeWidth={1.5} markerEnd="url(#fa)" />
      <text x={274} y={CY + SR + 13} fill="#a1a1aa" fontSize={9}>Force (F=BIL)</text>

      {/* Divider */}
      <line x1={400} y1={8} x2={400} y2={302} stroke="#1e1e2e" strokeWidth={1} />

      {/* ── Right panel: Back-EMF Waveform ── */}
      <text x={690} y={18} textAnchor="middle" fill="#71717a" fontSize={12} fontWeight={600}>Back-EMF Waveform (Single Conductor)</text>

      {/* Axes */}
      <line x1={430} y1={88} x2={935} y2={88} stroke="#27272a" strokeWidth={1} />
      <line x1={430} y1={32} x2={430} y2={145} stroke="#27272a" strokeWidth={1} />
      <text x={425} y={40} textAnchor="end" fill="#52525b" fontSize={8}>+Eb</text>
      <text x={425} y={92} textAnchor="end" fill="#52525b" fontSize={8}>0</text>
      <text x={425} y={142} textAnchor="end" fill="#52525b" fontSize={8}>−Eb</text>
      {[0, 90, 180, 270, 360].map(d => (
        <text key={d} x={432 + d * 1.38} y={152} textAnchor="middle" fill="#3f3f46" fontSize={8}>{d}°</text>
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
      {ebFrac > 0.15 && <text x={vBarX + ebFrac * vBarW / 2} y={vBarY + 14} textAnchor="middle" fill="#22c55e" fontSize={10} fontWeight={600}>Eb={motor.Eb.toFixed(1)}V</text>}
      {(1 - ebFrac) > 0.05 && <text x={vBarX + ebFrac * vBarW + (1 - ebFrac) * vBarW / 2} y={vBarY + 14} textAnchor="middle" fill="#ef4444" fontSize={9} fontWeight={500}>IaRa={motor.stalled ? motor.V.toFixed(0) : (motor.Ia * RA).toFixed(1)}V</text>}
      <text x={vBarX + vBarW + 8} y={vBarY + 14} fill="#71717a" fontSize={10} fontWeight={600}>{motor.V}V</text>

      {/* ── Power Flow Bar ── */}
      <text x={440} y={pBarY - 5} fill="#a1a1aa" fontSize={10} fontWeight={600}>Power Flow: P<tspan dy={-4} fontSize={7}>in</tspan><tspan dy={4}> = P</tspan><tspan dy={-4} fontSize={7}>mech</tspan><tspan dy={4}> + P</tspan><tspan dy={-4} fontSize={7}>cu</tspan></text>
      <rect x={vBarX} y={pBarY} width={vBarW} height={20} rx={4} fill="none" stroke="#3f3f46" strokeWidth={1} />
      <rect x={vBarX} y={pBarY} width={Math.max(etaFrac * vBarW, 0)} height={20} rx={4} fill="rgba(34,197,94,0.12)" stroke="#22c55e" strokeWidth={1} />
      {etaFrac > 0.2 && <text x={vBarX + etaFrac * vBarW / 2} y={pBarY + 14} textAnchor="middle" fill="#22c55e" fontSize={9} fontWeight={500}>Pmech={motor.Pmech.toFixed(0)}W</text>}
      {(1 - etaFrac) > 0.05 && <text x={vBarX + etaFrac * vBarW + (1 - etaFrac) * vBarW / 2} y={pBarY + 14} textAnchor="middle" fill="#f59e0b" fontSize={9} fontWeight={500}>Pcu={motor.Pcu.toFixed(0)}W</text>}
      <text x={vBarX + vBarW + 8} y={pBarY + 14} fill="#71717a" fontSize={10} fontWeight={600}>{motor.Pin.toFixed(0)}W</text>

      {/* Efficiency arc gauge */}
      <text x={690} y={pBarY + 45} textAnchor="middle" fill="#71717a" fontSize={10} fontWeight={600}>
        η = {motor.eta.toFixed(1)}%
      </text>
      {motor.stalled && <text x={690} y={pBarY + 62} textAnchor="middle" fill="#ef4444" fontSize={11} fontWeight={700}>⚠ MOTOR STALLED — Ia = {motor.Ia.toFixed(1)}A</text>}

      {/* Key equations */}
      <text x={440} y={pBarY + 50} fill="#52525b" fontSize={9}>
        T = Kφ·Ia = {motor.Ke.toFixed(2)} × {motor.Ia.toFixed(1)} = {(motor.Ke * motor.Ia).toFixed(1)} Nm
      </text>
      <text x={440} y={pBarY + 65} fill="#52525b" fontSize={9}>
        N = Eb/(Kφ) × 30/π = {motor.N.toFixed(0)} rpm{motor.stalled ? ' (stalled)' : ''}
      </text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>DC Motor — Construction & Working Principle</h2>
      <p style={S.p}>
        A DC motor converts direct-current electrical energy into mechanical rotational energy using
        the interaction between a magnetic field and current-carrying conductors. It consists of
        four essential parts: the <strong style={{ color: '#e4e4e7' }}>stator</strong> (field system),
        the <strong style={{ color: '#e4e4e7' }}>rotor</strong> (armature),
        the <strong style={{ color: '#e4e4e7' }}>commutator</strong>, and
        the <strong style={{ color: '#e4e4e7' }}>brushes</strong>.
      </p>

      <h3 style={S.h3}>Construction</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#ef4444' }}>Stator (Field System)</strong> — Provides the stationary magnetic field. In smaller motors, permanent magnets create the field. In larger machines, field windings wrapped around salient poles are energized by DC current. The field poles are bolted to the cylindrical yoke, which completes the magnetic circuit.</li>
        <li style={S.li}><strong style={{ color: '#818cf8' }}>Rotor (Armature)</strong> — A laminated steel cylinder mounted on the shaft. Slots machined into its surface house the armature conductors. Laminations reduce eddy current losses. The armature winding is typically a closed lap or wave winding.</li>
        <li style={S.li}><strong style={{ color: '#fbbf24' }}>Commutator</strong> — A cylindrical assembly of copper segments insulated from each other by mica strips, mounted on the shaft. Each segment connects to specific armature coils. The commutator is the key invention that converts the AC induced in rotating armature coils into DC at the external terminals.</li>
        <li style={S.li}><strong style={{ color: '#71717a' }}>Brushes</strong> — Stationary carbon or graphite blocks that maintain sliding contact with the rotating commutator, providing the electrical connection between the external DC supply and the armature winding.</li>
      </ul>

      <h3 style={S.h3}>Working Principle — Force on a Current-Carrying Conductor</h3>
      <p style={S.p}>
        When a current-carrying conductor is placed in a magnetic field, it experiences a mechanical
        force given by the Lorentz force law:
      </p>
      <div style={S.eq}>F = B × I × L × sin(θ)</div>
      <p style={S.p}>
        where B is the magnetic flux density (T), I is the current (A), L is the active length of
        the conductor (m), and θ is the angle between the current direction and the field (90° in
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
        and conductors under the S pole always carry current in the opposite direction —
        producing unidirectional torque regardless of rotor position.
      </p>
      <div style={S.ctx}>
        <span style={S.ctxT}>Key Insight</span>
        <p style={S.ctxP}>
          The commutator is essentially a mechanical frequency converter — a rotary switch
          synchronized to the rotor position. It converts the AC nature of the rotating armature
          into DC at the terminals. Without it, Michael Faraday's 1831 motor would simply
          oscillate rather than rotate continuously.
        </p>
      </div>

      <h3 style={S.h3}>Back-EMF — The Self-Regulating Mechanism</h3>
      <p style={S.p}>
        As the armature rotates in the magnetic field, each conductor cuts flux lines. By
        Faraday's law of electromagnetic induction, an EMF is induced in each conductor.
        This induced EMF opposes the applied voltage (Lenz's law) and is called the
        <strong style={{ color: '#f59e0b' }}> back-EMF (Eb)</strong>:
      </p>
      <div style={S.eq}>Eb = (P × φ × N × Z) / (60 × A)</div>
      <p style={S.p}>
        where P = number of poles, φ = flux per pole (Wb), N = speed (rpm),
        Z = total armature conductors, A = number of parallel paths
        (A = P for lap winding, A = 2 for wave winding).
        In simplified form:
      </p>
      <div style={S.eq}>Eb = Kφ × ω    where Kφ = PZ/(2πA) × φ</div>
      <p style={S.p}>
        Back-EMF is the motor's natural speed regulator. At no load, the motor speeds up until
        Eb ≈ V, making Ia ≈ 0 (just enough current for friction losses). When load increases,
        the motor slows slightly → Eb drops → more current flows → more torque is produced →
        a new equilibrium is reached. This negative feedback loop is inherently stable.
      </p>

      <h2 style={S.h2}>Fundamental Equations</h2>

      <h3 style={S.h3}>Voltage Equation</h3>
      <div style={S.eq}>V = Eb + Ia × Ra</div>
      <p style={S.p}>
        The supply voltage V must overcome the back-EMF and the resistive drop in the armature
        winding. This is the most fundamental equation of a DC motor. Rearranging:
      </p>
      <div style={S.eq}>Ia = (V − Eb) / Ra</div>

      <h3 style={S.h3}>Torque Equation</h3>
      <div style={S.eq}>T = Kφ × Ia    (N·m)</div>
      <p style={S.p}>
        Electromagnetic torque is directly proportional to flux and armature current. The
        torque constant Kφ has the same numerical value as the back-EMF constant (in SI units)
        because both arise from the same electromagnetic interaction — force on a conductor
        is the dual of EMF induction.
      </p>

      <h3 style={S.h3}>Speed Equation</h3>
      <div style={S.eq}>N = (V − Ia·Ra) / Kφ × (30/π)    (rpm)</div>
      <p style={S.p}>
        Speed is proportional to the net voltage driving the back-EMF, and inversely
        proportional to flux. This immediately reveals two speed control methods:
        varying V (armature voltage control) and varying φ (field control).
      </p>

      <h3 style={S.h3}>Power Balance</h3>
      <div style={S.eq}>Pin = V × Ia = Eb × Ia + Ia² × Ra = Pmech + Pcu</div>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#22c55e' }}>Pmech = Eb × Ia = T × ω</strong> — Mechanical power delivered to the shaft (also equals Eb × Ia because T = Kφ·Ia and ω = Eb/Kφ)</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>Pcu = Ia² × Ra</strong> — Copper loss in the armature winding (Joule heating)</li>
        <li style={S.li}><strong style={{ color: '#a1a1aa' }}>η = Pmech / Pin × 100%</strong> — Efficiency (real motors also have iron losses, mechanical friction, and stray losses not modeled here)</li>
      </ul>

      <h3 style={S.h3}>The Starting Problem</h3>
      <p style={S.p}>
        At standstill (N = 0), the back-EMF is zero: Eb = 0. Therefore the starting current is:
      </p>
      <div style={S.eq}>Ia(start) = V / Ra</div>
      <p style={S.p}>
        For a 220V motor with Ra = 1Ω, this gives 220A — typically 10 to 20 times the rated
        current! This enormous inrush can damage the commutator, overheat the armature, and
        cause severe voltage dips on the supply. Solutions include adding external resistance
        in series with the armature during starting (removed in steps as the motor accelerates),
        or using electronic soft-start controllers.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Simulation Parameters</span>
        <p style={S.ctxP}>
          This simulation uses Ra = {RA} Ω, Kf = {KF} V·s/(rad·A). At rated conditions
          (V = 220V, If = 1.5A), the no-load speed is approximately 1401 rpm and the
          stall torque is 330 Nm. The commutated back-EMF waveform shows how the commutator
          converts the AC sinusoidal EMF of each conductor into pulsating DC, with the ripple
          smoothed by having multiple conductors distributed around the armature.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Chapman, S.J. — <em>Electric Machinery Fundamentals</em>, 5th Edition, McGraw-Hill</li>
        <li style={S.li}>Fitzgerald, Kingsley, Umans — <em>Electric Machinery</em>, 7th Edition</li>
        <li style={S.li}>Theraja, B.L. — <em>A Textbook of Electrical Technology Vol. II</em>, S. Chand</li>
        <li style={S.li}>Sen, P.C. — <em>Principles of Electric Machines and Power Electronics</em>, 3rd Edition</li>
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
            <div style={S.ri}><span style={S.rl}>Ia</span><span style={{ ...S.rv, color: motor.Ia > 50 ? '#ef4444' : '#93c5fd' }}>{motor.Ia.toFixed(1)} A</span></div>
            <div style={S.ri}><span style={S.rl}>Torque</span><span style={{ ...S.rv, color: '#c4b5fd' }}>{motor.T.toFixed(1)} Nm</span></div>
            <div style={S.ri}><span style={S.rl}>Pin</span><span style={{ ...S.rv, color: '#e4e4e7' }}>{motor.Pin.toFixed(0)} W</span></div>
            <div style={S.ri}><span style={S.rl}>Pcu</span><span style={{ ...S.rv, color: '#f59e0b' }}>{motor.Pcu.toFixed(0)} W</span></div>
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
