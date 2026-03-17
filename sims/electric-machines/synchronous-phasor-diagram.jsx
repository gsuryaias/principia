import React, { useState, useMemo, useEffect, useRef } from 'react';

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

// Complex number helpers: represented as [re, im]
const cAdd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const cSub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const cMul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cScale = (a, s) => [a[0] * s, a[1] * s];
const cAbs = (a) => Math.hypot(a[0], a[1]);
const cAngleDeg = (a) => (Math.atan2(a[1], a[0]) * 180) / Math.PI;
const cFromPolar = (r, deg) => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)];
const cRotate = (a, deg) => cMul(a, cFromPolar(1, deg));

// SVG arrow marker definitions
function Defs() {
  return (
    <defs>
      <marker id="arr-v" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#d4d4d8" />
      </marker>
      <marker id="arr-ia" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#34d399" />
      </marker>
      <marker id="arr-ra" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#fb923c" />
      </marker>
      <marker id="arr-xs" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#facc15" />
      </marker>
      <marker id="arr-ef" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#22d3ee" />
      </marker>
    </defs>
  );
}

// Draw a single phasor arrow from (x1,y1) to (x2,y2)
function Phasor({ x1, y1, x2, y2, color, markerId, strokeWidth = 2.5, dashed = false }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 4) return null;
  // shorten slightly so arrowhead looks right
  const sx = x2 - (dx / len) * 1;
  const sy = y2 - (dy / len) * 1;
  return (
    <line
      x1={x1} y1={y1} x2={sx} y2={sy}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={dashed ? '6 4' : undefined}
      markerEnd={`url(#${markerId})`}
      strokeLinecap="round"
    />
  );
}

// Arc to show angle between two phasors
function AngleArc({ cx, cy, r, startDeg, endDeg, color, label, labelOffset = 14 }) {
  const clampedStart = startDeg * Math.PI / 180;
  const clampedEnd = endDeg * Math.PI / 180;
  const x1 = cx + r * Math.cos(clampedStart);
  const y1 = cy + r * Math.sin(clampedStart);
  const x2 = cx + r * Math.cos(clampedEnd);
  const y2 = cy + r * Math.sin(clampedEnd);
  let diff = endDeg - startDeg;
  // normalize diff to [-180, 180]
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  const largeArc = Math.abs(diff) > 180 ? 1 : 0;
  const sweep = diff > 0 ? 1 : 0;
  const midDeg = startDeg + diff / 2;
  const lx = cx + (r + labelOffset) * Math.cos(midDeg * Math.PI / 180);
  const ly = cy + (r + labelOffset) * Math.sin(midDeg * Math.PI / 180);
  return (
    <g>
      <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`}
        fill="none" stroke={color} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.75} />
      <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
        fontSize={11} fill={color} fontFamily="monospace" fontWeight={700}>{label}</text>
    </g>
  );
}

// Convert complex phasor [re, im] to SVG coords offset from center
// SVG y-axis is inverted vs math, so negate imaginary part
function toSVG(cx, cy, scale, c) {
  return [cx + c[0] * scale, cy - c[1] * scale];
}

function computePhasors(isGenerator, P, phiDeg, Ef, Xs, Ra) {
  // V is the reference phasor at 0 degrees, magnitude 1.0 pu
  const V = [1.0, 0.0];

  // Ia: magnitude determined by P and V=1, angle = -phi (phi positive = lag)
  // P = V * Ia * cos(phi), so Ia = P / (V * cos(phi))
  const phiRad = (phiDeg * Math.PI) / 180;
  const cosPhi = Math.cos(phiRad);
  const sinPhi = Math.sin(phiRad);
  const IaMag = Math.abs(cosPhi) < 0.01 ? P / 0.01 : P / Math.abs(cosPhi);
  // Ia lags V by phi (in SVG math: phi > 0 means Ia angle is negative)
  const Ia = cFromPolar(IaMag, -phiDeg);

  // Impedance drops: Ia*Ra (resistive) and jXs*Ia (reactive, 90° ahead of Ia)
  const IaRa = cScale(Ia, Ra);
  const jXsIa = cMul([0, Xs], Ia); // j*Xs*Ia = rotate Ia by +90°

  let EfVec;
  if (isGenerator) {
    // Generator: Ef = V + Ia*(Ra + jXs)
    EfVec = cAdd(V, cAdd(IaRa, jXsIa));
  } else {
    // Motor: Ef = V - Ia*(Ra + jXs)
    EfVec = cSub(V, cAdd(IaRa, jXsIa));
  }

  const EfMag = cAbs(EfVec);
  const deltaAngle = cAngleDeg(EfVec); // angle of Ef relative to V (V is at 0°)
  const IaAngle = cAngleDeg(Ia);

  // Q uses the lagging-current sign convention. Physical VAr flow depends on generator/motor mode.
  const Q = 1.0 * IaMag * sinPhi;

  return { V, Ia, IaRa, jXsIa, EfVec, EfMag, deltaAngle, IaAngle, IaMag, Q, cosPhi };
}

function getPfMode(isGenerator, phiDeg) {
  if (phiDeg > 1) {
    return isGenerator
      ? { label: 'Lagging PF', sub: 'Over-excited (supplies Q)', border: '#fb923c' }
      : { label: 'Lagging PF', sub: 'Under-excited (absorbs Q)', border: '#fb923c' };
  }
  if (phiDeg < -1) {
    return isGenerator
      ? { label: 'Leading PF', sub: 'Under-excited (absorbs Q)', border: '#22d3ee' }
      : { label: 'Leading PF', sub: 'Over-excited (supplies Q)', border: '#22d3ee' };
  }
  return { label: 'Unity PF', sub: 'No reactive exchange', border: '#d4d4d8' };
}

function getReactiveFlowText(isGenerator, Q) {
  if (Q > 0.01) {
    return isGenerator ? '→ Lagging: generator supplies VArs' : '→ Lagging: motor absorbs VArs';
  }
  if (Q < -0.01) {
    return isGenerator ? '→ Leading: generator absorbs VArs' : '→ Leading: motor supplies VArs';
  }
  return '→ Unity PF: no VAr exchange';
}

/* ── Operating Region Annotation on SVG ── */
function OperatingRegionBadge({ cx, cy, phiDeg, isGenerator, deltaAngle }) {
  const stable = Math.abs(deltaAngle) < 90;
  const pfMode = getPfMode(isGenerator, phiDeg);
  const regionLabel = `${pfMode.label.toUpperCase()} / ${pfMode.sub.split(' ')[0].toUpperCase()}`;
  const regionColor = pfMode.border;
  const regionBg = pfMode.border === '#d4d4d8' ? 'rgba(212,212,216,0.06)' : `${pfMode.border}14`;
  const stabColor = stable ? '#22c55e' : '#ef4444';
  const stabLabel = stable ? 'STABLE' : 'UNSTABLE';
  return (
    <g>
      <rect x={340} y={8} width={150} height={42} rx={8} fill={regionBg} stroke={regionColor} strokeWidth={1} opacity={0.85} />
      <text x={415} y={24} textAnchor="middle" fill={regionColor} fontSize={9} fontWeight={700} fontFamily="monospace">{regionLabel}</text>
      <circle cx={360} cy={38} r={4} fill={stabColor} />
      <text x={368} y={42} fill={stabColor} fontSize={9} fontWeight={700} fontFamily="monospace">{stabLabel} ({Math.abs(deltaAngle).toFixed(0)}°)</text>
    </g>
  );
}

function PhasorSVG({ isGenerator, P, phiDeg, Xs, Ra, rotation }) {
  const cx = 250, cy = 250;

  const { V, Ia, IaRa, jXsIa, EfVec, EfMag, deltaAngle, IaAngle, IaMag, Q, cosPhi } =
    useMemo(() => computePhasors(isGenerator, P, phiDeg, 0, Xs, Ra), [isGenerator, P, phiDeg, Xs, Ra]);

  // Scale: pick so the largest phasor fits nicely (max ~180 SVG units from center)
  const maxMag = Math.max(cAbs(V), cAbs(EfVec), IaMag * Xs + IaMag * Ra + 1.0);
  const scale = Math.min(180 / maxMag, 130);

  // Apply global rotation (animation) to all phasors
  const rot = (vec) => cRotate(vec, rotation);

  // Phasor chain: origin -> tip of V, then voltage drops, then Ef
  const origin = [0, 0];

  const Vrot = rot(V);
  const [Vx1, Vy1] = toSVG(cx, cy, scale, origin);
  const [Vx2, Vy2] = toSVG(cx, cy, scale, Vrot);

  // Current phasor: draw separately from origin, slightly offset for clarity
  const Iarot = rot(Ia);
  // Draw Ia from origin, scaled down a bit for visual clarity
  const IaDisplay = cScale(Iarot, 0.7); // display scale factor for Ia
  const [Iax1, Iay1] = toSVG(cx, cy, scale, origin);
  const [Iax2, Iay2] = toSVG(cx, cy, scale, cScale(rot(cFromPolar(1.0, -phiDeg + rotation)), 0.7 * IaMag));

  // Voltage drop chain: starts at tip of V for generator
  let chainStart, IaRaEnd, jXsIaEnd, EfEnd;
  if (isGenerator) {
    // Ef = V + IaRa + jXsIa => draw drops from tip of V to tip of Ef
    chainStart = rot(V);
    IaRaEnd = cAdd(chainStart, rot(IaRa));
    jXsIaEnd = cAdd(IaRaEnd, rot(jXsIa));
    EfEnd = jXsIaEnd; // should equal rot(EfVec)
  } else {
    // Motor: V = Ef + drops => Ef drawn from origin, drops added to reach V
    chainStart = rot(EfVec);
    IaRaEnd = cAdd(chainStart, rot(IaRa));
    jXsIaEnd = cAdd(IaRaEnd, rot(jXsIa));
    EfEnd = rot(EfVec);
  }

  const [cs_x, cs_y] = toSVG(cx, cy, scale, chainStart);
  const [ra_x, ra_y] = toSVG(cx, cy, scale, IaRaEnd);
  const [xs_x, xs_y] = toSVG(cx, cy, scale, jXsIaEnd);
  const [ef_x, ef_y] = toSVG(cx, cy, scale, rot(EfVec));
  const [ef_ox, ef_oy] = toSVG(cx, cy, scale, isGenerator ? origin : rot(EfVec));

  // Angles for arc labels (in SVG-space: negate angles because y is flipped)
  const vAngleSVG = rotation; // V is always at 'rotation' degrees (in math space) = -rotation in SVG
  const iaAngleSVG = -phiDeg + rotation;
  const efAngleSVG = deltaAngle + rotation;

  const arcR_phi = scale * 0.38;
  const arcR_delta = scale * 0.55;

  return (
    <svg viewBox="0 0 500 500" width="480" height="480" style={{ maxWidth: '100%' }}>
      <Defs />

      {/* Grid circles */}
      {[0.5, 1.0, 1.5].map(r => (
        <circle key={r} cx={cx} cy={cy} r={r * scale}
          fill="none" stroke="#27272a" strokeWidth={0.8} strokeDasharray="3 4" opacity={0.5} />
      ))}
      {/* Axes */}
      <line x1={cx - 200} y1={cy} x2={cx + 200} y2={cy} stroke="#27272a" strokeWidth={0.8} />
      <line x1={cx} y1={cy - 200} x2={cx} y2={cy + 200} stroke="#27272a" strokeWidth={0.8} />

      {/* ---- V phasor (reference, white/gray) ---- */}
      <Phasor x1={cx} y1={cy} x2={Vx2} y2={Vy2} color="#d4d4d8" markerId="arr-v" strokeWidth={3} />

      {/* ---- Ef phasor (cyan) ---- */}
      <Phasor x1={cx} y1={cy} x2={ef_x} y2={ef_y} color="#22d3ee" markerId="arr-ef" strokeWidth={3} dashed />

      {/* ---- Voltage drop chain ---- */}
      {isGenerator ? (
        <>
          {/* IaRa: from tip of V */}
          <Phasor x1={Vx2} y1={Vy2} x2={ra_x} y2={ra_y} color="#fb923c" markerId="arr-ra" strokeWidth={2} />
          {/* jXsIa: from tip of IaRa */}
          <Phasor x1={ra_x} y1={ra_y} x2={xs_x} y2={xs_y} color="#facc15" markerId="arr-xs" strokeWidth={2} />
        </>
      ) : (
        <>
          {/* Motor: drops added from tip of Ef to reach V */}
          <Phasor x1={ef_x} y1={ef_y} x2={ra_x} y2={ra_y} color="#fb923c" markerId="arr-ra" strokeWidth={2} />
          <Phasor x1={ra_x} y1={ra_y} x2={xs_x} y2={xs_y} color="#facc15" markerId="arr-xs" strokeWidth={2} />
        </>
      )}

      {/* ---- Ia phasor (green), drawn from origin ---- */}
      <Phasor x1={Iax1} y1={Iay1} x2={Iax2} y2={Iay2} color="#34d399" markerId="arr-ia" strokeWidth={2.5} />

      {/* ---- Angle arcs ---- */}
      {/* phi arc: between V and Ia */}
      {Math.abs(phiDeg) > 1 && (
        <AngleArc
          cx={cx} cy={cy}
          r={arcR_phi}
          startDeg={-vAngleSVG}
          endDeg={-(iaAngleSVG)}
          color="#34d399"
          label={'\u03C6'}
          labelOffset={12}
        />
      )}
      {/* delta arc: between V and Ef */}
      {Math.abs(deltaAngle) > 1 && (
        <AngleArc
          cx={cx} cy={cy}
          r={arcR_delta}
          startDeg={-vAngleSVG}
          endDeg={-(efAngleSVG)}
          color="#22d3ee"
          label={'\u03B4'}
          labelOffset={14}
        />
      )}

      {/* ---- Labels (fixed, not rotating) ---- */}
      <text x={Vx2 + 8} y={Vy2 - 6} fontSize={13} fill="#d4d4d8" fontWeight={700} fontFamily="monospace">V</text>
      <text x={ef_x + 8} y={ef_y - 6} fontSize={13} fill="#22d3ee" fontWeight={700} fontFamily="monospace">Ef</text>
      <text x={Iax2 + 6} y={Iay2 + 4} fontSize={13} fill="#34d399" fontWeight={700} fontFamily="monospace">Ia</text>

      {/* Label IaRa midpoint */}
      {(() => {
        const [mx, my] = toSVG(cx, cy, scale, isGenerator
          ? cAdd(rot(V), cScale(rot(IaRa), 0.5))
          : cAdd(rot(EfVec), cScale(rot(IaRa), 0.5)));
        return cAbs(IaRa) * scale > 8 ? (
          <text x={mx + 5} y={my - 5} fontSize={10} fill="#fb923c" fontFamily="monospace">{'\u2082'}{'\u2090'}R{'\u2090'}</text>
        ) : null;
      })()}

      {/* Label jXsIa midpoint */}
      {(() => {
        const [mx, my] = toSVG(cx, cy, scale, isGenerator
          ? cAdd(IaRaEnd, cScale(rot(jXsIa), 0.5))
          : cAdd(IaRaEnd, cScale(rot(jXsIa), 0.5)));
        return cAbs(jXsIa) * scale > 8 ? (
          <text x={mx + 5} y={my - 5} fontSize={10} fill="#facc15" fontFamily="monospace">jXsI{'\u2090'}</text>
        ) : null;
      })()}

      {/* Mode label */}
      <text x={20} y={24} fontSize={12} fill="#6366f1" fontFamily="monospace" fontWeight={700}>
        {isGenerator ? 'GENERATOR' : 'MOTOR'}
      </text>

      {/* Operating Region Badge */}
      <OperatingRegionBadge cx={cx} cy={cy} phiDeg={phiDeg} isGenerator={isGenerator} deltaAngle={deltaAngle} />

      {/* Legend */}
      {[
        { color: '#d4d4d8', label: 'V \u2014 Terminal Voltage (ref)' },
        { color: '#22d3ee', label: 'Ef \u2014 Excitation EMF' },
        { color: '#34d399', label: 'Ia \u2014 Armature Current' },
        { color: '#fb923c', label: 'I\u2090R\u2090 \u2014 Resistive Drop' },
        { color: '#facc15', label: 'jXsI\u2090 \u2014 Reactive Drop' },
      ].map(({ color, label }, i) => (
        <g key={i} transform={`translate(20, ${460 - i * 18})`}>
          <line x1={0} y1={0} x2={18} y2={0} stroke={color} strokeWidth={2.5} />
          <text x={22} y={4} fontSize={11} fill={color} fontFamily="monospace">{label}</text>
        </g>
      ))}
    </svg>
  );
}

function SimTab() {
  const [isGenerator, setIsGenerator] = useState(true);
  const [P, setP] = useState(0.7);
  const [phiDeg, setPhiDeg] = useState(-30);
  const [Xs, setXs] = useState(1.0);
  const [Ra] = useState(0.05); // small fixed resistance
  const [rotation, setRotation] = useState(0);
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Animation: one full rotation per 3 seconds
  useEffect(() => {
    const animate = (time) => {
      if (lastTimeRef.current !== null) {
        const dt = time - lastTimeRef.current;
        setRotation((r) => (r + (dt / 3000) * 360) % 360);
      }
      lastTimeRef.current = time;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const { EfMag, deltaAngle, IaMag, Q, cosPhi } =
    useMemo(() => computePhasors(isGenerator, P, phiDeg, 0, Xs, Ra), [isGenerator, P, phiDeg, Xs, Ra]);

  const pfStr = Math.abs(cosPhi).toFixed(3);
  const pfLabel = phiDeg > 1 ? 'lag' : phiDeg < -1 ? 'lead' : 'unity';
  const qLabel = Q > 0.01
    ? (isGenerator ? 'supplying' : 'absorbing')
    : Q < -0.01
    ? (isGenerator ? 'absorbing' : 'supplying')
    : 'zero';
  const stable = Math.abs(deltaAngle) < 90;
  const pfMode = getPfMode(isGenerator, phiDeg);

  return (
    <div style={S.simBody}>
      <div style={S.svgWrap}>
        <PhasorSVG
          isGenerator={isGenerator}
          P={P}
          phiDeg={phiDeg}
          Xs={Xs}
          Ra={Ra}
          rotation={rotation}
        />
      </div>

      {/* PF mode quick buttons */}
      <div style={{ display: 'flex', gap: 10, padding: '8px 24px', background: '#0d0d10', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' }}>
        {[
          { phi: 30, color: '#fb923c' },
          { phi: 0, color: '#d4d4d8' },
          { phi: -30, color: '#22d3ee' },
        ].map(({ phi, color }) => {
          const mode = getPfMode(isGenerator, phi);
          return (
          <button
            key={mode.label}
            onClick={() => setPhiDeg(phi)}
            style={{
              padding: '7px 16px', borderRadius: 8,
              border: `1.5px solid ${phiDeg === phi ? color : '#27272a'}`,
              background: phiDeg === phi ? `${color}18` : 'transparent',
              color: phiDeg === phi ? color : '#71717a',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {mode.label}
            <span style={{ display: 'block', fontSize: 10, fontWeight: 400, marginTop: 1, color: phiDeg === phi ? color : '#52525b' }}>{mode.sub}</span>
          </button>
          );
        })}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {['Generator', 'Motor'].map((m) => (
            <button
              key={m}
              onClick={() => setIsGenerator(m === 'Generator')}
              style={{
                padding: '7px 18px', borderRadius: 8,
                border: `1.5px solid ${(isGenerator ? 'Generator' : 'Motor') === m ? '#6366f1' : '#27272a'}`,
                background: (isGenerator ? 'Generator' : 'Motor') === m ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: (isGenerator ? 'Generator' : 'Motor') === m ? '#818cf8' : '#71717a',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >{m}</button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div style={S.controls}>
        <div style={S.cg}>
          <span style={S.label}>P (pu)</span>
          <input type="range" min={0.2} max={1.0} step={0.05} value={P}
            onChange={(e) => setP(+e.target.value)} style={S.slider} />
          <span style={S.val}>{P.toFixed(2)} pu</span>
        </div>
        <div style={S.cg}>
          <span style={S.label}>PF Angle \u03C6 (+ = lag)</span>
          <input type="range" min={-60} max={60} step={1} value={phiDeg}
            onChange={(e) => setPhiDeg(+e.target.value)} style={S.slider} />
          <span style={S.val}>{phiDeg > 0 ? '+' : ''}{phiDeg}\u00B0</span>
        </div>
        <div style={S.cg}>
          <span style={S.label}>Xs (pu)</span>
          <input type="range" min={0.5} max={2.0} step={0.05} value={Xs}
            onChange={(e) => setXs(+e.target.value)} style={S.slider} />
          <span style={S.val}>{Xs.toFixed(2)} pu</span>
        </div>
      </div>

      {/* Live readouts */}
      <div style={S.results}>
        <div style={S.ri}>
          <span style={S.rl}>Ia</span>
          <span style={{ ...S.rv, color: '#34d399' }}>{IaMag.toFixed(3)} pu</span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>PF</span>
          <span style={{ ...S.rv, color: phiDeg > 1 ? '#fb923c' : phiDeg < -1 ? '#22d3ee' : '#d4d4d8' }}>
            {pfStr} {pfLabel}
          </span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>P</span>
          <span style={{ ...S.rv, color: '#a78bfa' }}>{P.toFixed(2)} pu</span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>Q (pu)</span>
          <span style={{ ...S.rv, color: Q > 0.01 ? '#fb923c' : Q < -0.01 ? '#22d3ee' : '#d4d4d8' }}>
            {Math.abs(Q).toFixed(3)} {qLabel}
          </span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>Power Angle \u03B4</span>
          <span style={{ ...S.rv, color: stable ? '#4ade80' : '#f87171' }}>
            {deltaAngle.toFixed(1)}\u00B0{!stable ? ' -- unstable' : ''}
          </span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>|Ef|</span>
          <span style={{ ...S.rv, color: '#22d3ee' }}>{EfMag.toFixed(3)} pu</span>
        </div>
      </div>

      {/* Info boxes */}
      <div style={S.strip}>
        <div style={S.box}>
          <span style={S.boxT}>Operating Mode</span>
          <span style={S.boxV}>
            {isGenerator ? 'Generator' : 'Motor'} | {pfMode.label}{'\n'}
            {pfMode.sub}{'\n'}
            Equation: {isGenerator ? '\u0116f = V\u0307 + I\u2090(R\u2090 + jXs)' : 'V\u0307 = \u0116f + I\u2090(R\u2090 + jXs)'}
          </span>
        </div>
        <div style={S.box}>
          <span style={S.boxT}>Reactive Power</span>
          <span style={S.boxV}>
            Q = V\u00B7Ia\u00B7sin(\u03C6){'\n'}
            Q = 1.0 \u00D7 {IaMag.toFixed(3)} \u00D7 sin({phiDeg}\u00B0){'\n'}
            Q = {Q.toFixed(3)} pu{'\n'}
            {getReactiveFlowText(isGenerator, Q)}
          </span>
        </div>
        <div style={S.box}>
          <span style={S.boxT}>Stability</span>
          <span style={S.boxV}>
            \u03B4 = {deltaAngle.toFixed(1)}\u00B0{'\n'}
            Max power at \u03B4 = 90\u00B0{'\n'}
            Pmax = V\u00B7Ef/Xs = {(EfMag / Xs).toFixed(3)} pu{'\n'}
            {stable
              ? `Margin: ${(90 - Math.abs(deltaAngle)).toFixed(1)}\u00B0 to pull-out`
              : 'WARNING: Machine may pull out of step!'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────── SVG Diagrams for Theory Tab ─────────── */

/** Per-phase equivalent circuit of a synchronous machine */
function EquivalentCircuitSVG() {
  const W = 540, H = 120;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: '100%', display: 'block', margin: '18px auto' }}>
      {/* Ef source (circle with ~) */}
      <circle cx={50} cy={60} r={22} fill="none" stroke="#22d3ee" strokeWidth={2} />
      <text x={50} y={56} textAnchor="middle" fill="#22d3ee" fontSize={12} fontFamily="monospace" fontWeight={700}>Ef</text>
      <text x={50} y={72} textAnchor="middle" fill="#22d3ee" fontSize={16} fontFamily="serif">~</text>
      {/* + / - polarity */}
      <text x={50} y={30} textAnchor="middle" fill="#71717a" fontSize={11}>+</text>

      {/* Wire from Ef to Ra */}
      <line x1={72} y1={60} x2={130} y2={60} stroke="#a1a1aa" strokeWidth={1.5} />

      {/* Ra resistor (zigzag) */}
      <path d="M130,60 l5,-10 10,20 10,-20 10,20 10,-20 5,10" fill="none" stroke="#fb923c" strokeWidth={2} />
      <text x={160} y={50} textAnchor="middle" fill="#fb923c" fontSize={11} fontFamily="monospace" fontWeight={600}>Ra</text>

      {/* Wire from Ra to jXs */}
      <line x1={180} y1={60} x2={230} y2={60} stroke="#a1a1aa" strokeWidth={1.5} />

      {/* jXs inductor (coils) */}
      {[0,1,2,3].map(i => (
        <path key={i} d={`M${230 + i*20},60 a8,8 0 0 1 20,0`} fill="none" stroke="#facc15" strokeWidth={2} />
      ))}
      <text x={290} y={50} textAnchor="middle" fill="#facc15" fontSize={11} fontFamily="monospace" fontWeight={600}>jXs</text>

      {/* Wire from jXs to terminal */}
      <line x1={310} y1={60} x2={370} y2={60} stroke="#a1a1aa" strokeWidth={1.5} />

      {/* Ia arrow along wire */}
      <defs>
        <marker id="eqarr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#34d399" />
        </marker>
      </defs>
      <line x1={100} y1={45} x2={145} y2={45} stroke="#34d399" strokeWidth={1.5} markerEnd="url(#eqarr)" />
      <text x={122} y={40} textAnchor="middle" fill="#34d399" fontSize={11} fontFamily="monospace" fontWeight={600}>Ia</text>

      {/* Terminal voltage V (open circle) */}
      <circle cx={380} cy={60} r={4} fill="#d4d4d8" />
      <text x={395} y={55} fill="#d4d4d8" fontSize={12} fontFamily="monospace" fontWeight={700}>V</text>

      {/* Wire to load */}
      <line x1={384} y1={60} x2={440} y2={60} stroke="#a1a1aa" strokeWidth={1.5} />
      <text x={460} y={64} fill="#71717a" fontSize={11} fontFamily="monospace">Load / Grid</text>

      {/* Voltage drop labels underneath */}
      <line x1={72} y1={95} x2={310} y2={95} stroke="#71717a" strokeWidth={0.5} strokeDasharray="3 2" />
      <text x={191} y={112} textAnchor="middle" fill="#71717a" fontSize={10} fontFamily="monospace">
        Ef = V + Ia(Ra + jXs)  [Generator]
      </text>

      {/* Return path */}
      <line x1={50} y1={82} x2={50} y2={100} stroke="#a1a1aa" strokeWidth={1} strokeDasharray="4 3" />
      <line x1={380} y1={64} x2={380} y2={100} stroke="#a1a1aa" strokeWidth={1} strokeDasharray="4 3" />
    </svg>
  );
}

/** Three phasor diagrams side by side: lagging, unity, leading */
function PhasorCasesSVG() {
  const caseW = 170, caseH = 180, gap = 10;
  const totalW = caseW * 3 + gap * 2;
  const scale = 55;

  const cases = [
    { label: 'Lagging PF', phiDeg: 30, color: '#fb923c', sub: 'Under-excited (Gen)' },
    { label: 'Unity PF', phiDeg: 0, color: '#d4d4d8', sub: 'Min Ia for given P' },
    { label: 'Leading PF', phiDeg: -30, color: '#22d3ee', sub: 'Over-excited (Gen)' },
  ];

  return (
    <svg viewBox={`0 0 ${totalW} ${caseH}`} width={totalW} height={caseH} style={{ maxWidth: '100%', display: 'block', margin: '18px auto' }}>
      <defs>
        <marker id="pa-v" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#d4d4d8" /></marker>
        <marker id="pa-ef" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#22d3ee" /></marker>
        <marker id="pa-ia" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#34d399" /></marker>
        <marker id="pa-xs" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto"><polygon points="0 0, 7 2.5, 0 5" fill="#facc15" /></marker>
      </defs>
      {cases.map((c, idx) => {
        const ox = idx * (caseW + gap) + caseW / 2;
        const oy = caseH / 2 + 14;
        const phiRad = c.phiDeg * Math.PI / 180;
        // V along +x
        const vx = ox + scale, vy = oy;
        // Ia at angle -phi from V (lagging = below, leading = above in SVG)
        const iaLen = scale * 0.55;
        const iax = ox + iaLen * Math.cos(-phiRad);
        const iay = oy - iaLen * Math.sin(-phiRad); // SVG y inverted

        // Generator: Ef = V + jXs*Ia (ignoring Ra for sketch)
        // jXs*Ia rotates Ia by +90 deg
        const jxLen = scale * 0.5;
        const iaAngle = -c.phiDeg;
        const jxAngle = iaAngle + 90;
        const jxEndX = vx + jxLen * Math.cos(jxAngle * Math.PI / 180);
        const jxEndY = oy - jxLen * Math.sin(jxAngle * Math.PI / 180);

        return (
          <g key={idx}>
            {/* Background panel */}
            <rect x={idx * (caseW + gap)} y={0} width={caseW} height={caseH} rx={8} fill="#18181b" stroke={c.color} strokeWidth={1} opacity={0.5} />
            {/* Title */}
            <text x={ox} y={16} textAnchor="middle" fill={c.color} fontSize={11} fontWeight={700} fontFamily="monospace">{c.label}</text>
            <text x={ox} y={28} textAnchor="middle" fill="#52525b" fontSize={9} fontFamily="monospace">{c.sub}</text>

            {/* V phasor */}
            <line x1={ox} y1={oy} x2={vx - 2} y2={vy} stroke="#d4d4d8" strokeWidth={2} markerEnd="url(#pa-v)" />
            <text x={vx + 4} y={oy - 3} fill="#d4d4d8" fontSize={10} fontFamily="monospace" fontWeight={700}>V</text>

            {/* Ia phasor */}
            <line x1={ox} y1={oy} x2={iax - 1} y2={iay} stroke="#34d399" strokeWidth={2} markerEnd="url(#pa-ia)" />
            <text x={iax + 4} y={iay + 3} fill="#34d399" fontSize={10} fontFamily="monospace" fontWeight={700}>Ia</text>

            {/* jXsIa from tip of V */}
            <line x1={vx} y1={vy} x2={jxEndX - 1} y2={jxEndY} stroke="#facc15" strokeWidth={1.5} markerEnd="url(#pa-xs)" />
            <text x={jxEndX + 2} y={jxEndY - 4} fill="#facc15" fontSize={9} fontFamily="monospace">jXsIa</text>

            {/* Ef from origin to tip of jXsIa */}
            <line x1={ox} y1={oy} x2={jxEndX - 1} y2={jxEndY} stroke="#22d3ee" strokeWidth={2} strokeDasharray="5 3" markerEnd="url(#pa-ef)" />
            <text x={jxEndX - 12} y={jxEndY - 10} fill="#22d3ee" fontSize={10} fontFamily="monospace" fontWeight={700}>Ef</text>

            {/* Phi arc */}
            {c.phiDeg !== 0 && (() => {
              const r = 20;
              const sa = 0;
              const ea = c.phiDeg * Math.PI / 180;
              const sx = ox + r; const sy = oy;
              const ex = ox + r * Math.cos(ea); const ey = oy + r * Math.sin(ea);
              const sweepFlag = c.phiDeg > 0 ? 1 : 0;
              return (
                <>
                  <path d={`M ${sx} ${sy} A ${r} ${r} 0 0 ${sweepFlag} ${ex} ${ey}`} fill="none" stroke="#34d399" strokeWidth={1} strokeDasharray="3 2" />
                  <text x={ox + r + 8} y={oy + (c.phiDeg > 0 ? 10 : -6)} fill="#34d399" fontSize={9} fontFamily="monospace">{'\u03C6'}</text>
                </>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
}

/** Generator vs Motor convention diagram */
function GenMotorConventionSVG() {
  const W = 480, H = 130;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: '100%', display: 'block', margin: '18px auto' }}>
      <defs>
        <marker id="gc-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#34d399" /></marker>
        <marker id="gc-arr2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#818cf8" /></marker>
      </defs>

      {/* Generator side */}
      <rect x={10} y={10} width={210} height={110} rx={10} fill="#18181b" stroke="#22c55e" strokeWidth={1} opacity={0.6} />
      <text x={115} y={30} textAnchor="middle" fill="#22c55e" fontSize={12} fontWeight={700} fontFamily="monospace">GENERATOR</text>

      {/* Machine circle */}
      <circle cx={60} cy={72} r={22} fill="none" stroke="#22d3ee" strokeWidth={1.5} />
      <text x={60} y={77} textAnchor="middle" fill="#22d3ee" fontSize={10} fontFamily="monospace">Ef</text>

      {/* Arrow Ia out */}
      <line x1={82} y1={72} x2={140} y2={72} stroke="#34d399" strokeWidth={2} markerEnd="url(#gc-arr)" />
      <text x={110} y={66} textAnchor="middle" fill="#34d399" fontSize={10} fontFamily="monospace">Ia</text>

      {/* Terminal V */}
      <circle cx={160} cy={72} r={4} fill="#d4d4d8" />
      <text x={170} y={68} fill="#d4d4d8" fontSize={10} fontFamily="monospace">V</text>

      {/* Equation */}
      <text x={115} y={110} textAnchor="middle" fill="#a1a1aa" fontSize={10} fontFamily="monospace">Ef = V + Ia(Ra+jXs)</text>
      <text x={115} y={48} textAnchor="middle" fill="#71717a" fontSize={9} fontFamily="monospace">Ia flows OUT, Ef leads V</text>

      {/* Motor side */}
      <rect x={250} y={10} width={210} height={110} rx={10} fill="#18181b" stroke="#6366f1" strokeWidth={1} opacity={0.6} />
      <text x={355} y={30} textAnchor="middle" fill="#6366f1" fontSize={12} fontWeight={700} fontFamily="monospace">MOTOR</text>

      {/* Terminal V */}
      <circle cx={300} cy={72} r={4} fill="#d4d4d8" />
      <text x={283} y={68} fill="#d4d4d8" fontSize={10} fontFamily="monospace">V</text>

      {/* Arrow Ia in */}
      <line x1={310} y1={72} x2={370} y2={72} stroke="#818cf8" strokeWidth={2} markerEnd="url(#gc-arr2)" />
      <text x={340} y={66} textAnchor="middle" fill="#818cf8" fontSize={10} fontFamily="monospace">Ia</text>

      {/* Machine circle */}
      <circle cx={395} cy={72} r={22} fill="none" stroke="#22d3ee" strokeWidth={1.5} />
      <text x={395} y={77} textAnchor="middle" fill="#22d3ee" fontSize={10} fontFamily="monospace">Ef</text>

      {/* Equation */}
      <text x={355} y={110} textAnchor="middle" fill="#a1a1aa" fontSize={10} fontFamily="monospace">V = Ef + Ia(Ra+jXs)</text>
      <text x={355} y={48} textAnchor="middle" fill="#71717a" fontSize={9} fontFamily="monospace">Ia flows IN, V leads Ef</text>
    </svg>
  );
}

function TheoryTab() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>What is a Phasor Diagram?</h2>
      <p style={S.p}>
        A phasor is a rotating vector whose length represents the rms (root-mean-square) magnitude of a sinusoidal
        quantity and whose angle represents its phase. In steady state all quantities rotate at the same angular
        frequency \u03C9 (50 Hz in India, 60 Hz elsewhere), so we freeze the diagram and only show their relative angles
        and magnitudes. The phasor diagram therefore captures the complete voltage and current relationships in the
        machine at a glance.
      </p>
      <p style={S.p}>
        For a synchronous machine operating at synchronous speed, all voltages and currents are pure sinusoids at
        supply frequency. The phasor diagram maps every sinusoid x(t) = X<sub>m</sub>\u00B7cos(\u03C9t + \u03B8) to the phasor
        X = (X<sub>m</sub>/\u221A2)\u2220\u03B8, where X<sub>m</sub>/\u221A2 is the rms value.
      </p>

      <h2 style={S.h2}>The Synchronous Machine Equivalent Circuit</h2>
      <p style={S.p}>
        Each phase of a synchronous machine is modelled as an ideal voltage source Ef (the excitation or internal
        EMF generated by the DC field winding) in series with the armature resistance Ra and the synchronous
        reactance Xs. The synchronous reactance Xs accounts for both the leakage flux and the armature reaction flux.
      </p>

      <EquivalentCircuitSVG />

      <p style={S.p}>
        The terminal voltage V is what the external grid sees. The armature current Ia flows through the series
        impedance (Ra + jXs), creating voltage drops that must be accounted for to relate V and Ef.
      </p>

      <h2 style={S.h2}>Generator vs Motor Convention</h2>
      <p style={S.p}>
        The direction of current flow and the relationship between Ef and V differ between generator and motor
        operation. In a generator, Ef leads V (rotor field ahead of stator field), while in a motor, V leads Ef.
      </p>

      <GenMotorConventionSVG />

      <h2 style={S.h2}>Key Equations</h2>
      <h3 style={S.h3}>Generator Convention</h3>
      <p style={S.p}>
        Current flows out of the machine terminals. The internal EMF is the sum of the terminal voltage plus the
        impedance drops:
      </p>
      <code style={S.eq}>\u0116f = V\u0307 + \u0130a(Ra + jXs)</code>
      <p style={S.p}>
        Ef leads V by the power angle \u03B4. In generator operation, a larger field current increases Ef and pushes the
        stator current toward lagging PF, which corresponds to over-excited operation and reactive-power export to the grid.
      </p>

      <h3 style={S.h3}>Motor Convention</h3>
      <p style={S.p}>
        Current flows into the machine. The supply voltage drives current against the back-EMF:
      </p>
      <code style={S.eq}>V\u0307 = \u0116f + \u0130a(Ra + jXs)</code>

      <h3 style={S.h3}>Active and Reactive Power</h3>
      <code style={S.eq}>P = (V \u00B7 Ef / Xs) \u00B7 sin(\u03B4)</code>
      <code style={S.eq}>Q = (V \u00B7 Ef / Xs) \u00B7 cos(\u03B4) \u2212 V\u00B2 / Xs</code>
      <code style={S.eq}>P = V \u00B7 Ia \u00B7 cos(\u03C6)   |   Q = V \u00B7 Ia \u00B7 sin(\u03C6)</code>
      <p style={S.p}>
        The pull-out (maximum) torque occurs at \u03B4 = 90\u00B0. Beyond this the machine loses synchronism \u2014 a condition
        called "pulling out of step." Normal operation keeps \u03B4 well below 90\u00B0 to maintain a stability margin.
      </p>

      <h2 style={S.h2}>Phasor Diagrams for Three PF Cases</h2>
      <p style={S.p}>
        The three diagrams below show the generator phasor diagram for lagging, unity, and leading power factor.
        Notice how the position of Ef relative to V changes with excitation level \u2014 over-excitation pushes Ef further
        from V, while under-excitation brings Ef closer to or below V in magnitude.
      </p>

      <PhasorCasesSVG />

      <h2 style={S.h2}>Power Factor Control \u2014 The Unique Advantage</h2>
      <p style={S.p}>
        Unlike induction motors, which always operate at lagging power factor (absorbing reactive power from the
        grid), synchronous machines can be operated at any power factor simply by adjusting the DC field current:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#22d3ee' }}>Generator, over-excited:</strong> stator current is typically lagging and
          the machine supplies reactive power to the grid, raising nearby bus voltages.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#fb923c' }}>Generator, under-excited:</strong> stator current is typically leading and
          the machine absorbs reactive power from the grid. This can be useful to suppress over-voltages on lightly loaded lines.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#d4d4d8' }}>Motor / condenser note:</strong> the synchronous-motor convention is the
          opposite: over-excited motors draw leading current and supply VArs, while under-excited motors draw lagging
          current and absorb VArs.
        </li>
      </ul>
      <p style={S.p}>
        A <strong>synchronous condenser</strong> is a synchronous machine running with no mechanical load (no prime
        mover, no driven load) purely to supply or absorb reactive power. It is the original "STATCOM" \u2014 and is
        experiencing a revival today for its short-circuit strength and inertia contribution to grids with high
        renewable penetration.
      </p>

      <h2 style={S.h2}>Salient Pole vs Cylindrical Rotor Machines</h2>
      <p style={S.p}>
        The model above assumes a <strong>cylindrical (round) rotor</strong>, where the air-gap is uniform and a
        single synchronous reactance Xs describes the machine fully. Large steam turbine generators (2-pole,
        3000 rpm at 50 Hz) use this construction.
      </p>
      <p style={S.p}>
        <strong>Salient pole machines</strong> \u2014 used in hydroelectric generators and diesel gensets (low speed,
        many poles) \u2014 have a non-uniform air-gap. The direct-axis (d-axis, aligned with field) and quadrature-axis
        (q-axis, 90\u00B0 electrical ahead) have different permeances, giving two different reactances:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>Xd (d-axis synchronous reactance) \u2248 1.0\u20131.2 pu \u2014 larger, field axis</li>
        <li style={S.li}>Xq (q-axis synchronous reactance) \u2248 0.6\u20130.7 pu \u2014 smaller, interpolar axis</li>
      </ul>
      <p style={S.p}>
        This leads to <strong>two-reaction theory</strong> (Blondel, 1899): armature current is resolved into d-axis
        and q-axis components, each multiplied by the respective reactance. Salient pole machines produce a
        reluctance torque component even at zero excitation, and can supply more reactive power at leading PF for
        a given field current than cylindrical machines.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Indian Power Sector Context</span>
        <p style={S.ctxP}>
          <strong>NTPC Simhadri (Andhra Pradesh):</strong> 2\u00D7500 MW units operating at 21 kV, rated 0.85 PF lagging,
          synchronous reactance Xs \u2248 1.0 pu. The 0.85 lagging design point reflects the need to supply reactive power
          to the 400 kV transmission grid, supporting voltage at distant load centres.
          <br /><br />
          <strong>Powergrid India \u2014 Synchronous Condensers Revival:</strong> Powergrid Corporation is deploying new
          synchronous condensers at key 400/765 kV substations (including Raigarh, Meerut, Sipat) to provide reactive
          power support and inertia as coal plant retirements accelerate with RE integration. Each unit is rated
          \u00B1200\u2013300 MVAr.
          <br /><br />
          <strong>BEA/CEA Regulatory Requirements:</strong> The Central Electricity Authority (CEA) grid code
          mandates that large generators maintain a capability from 0.85 power factor lag (supplying reactive power)
          to 0.95 power factor lead (absorbing reactive power), ensuring the machine can flexibly support system voltage under varying load
          conditions.
          <br /><br />
          <strong>Large Hydro \u2014 Salient Pole Machines:</strong> Bhakra (1,325 MW, Himachal Pradesh) and Tehri
          (1,000 MW, Uttarakhand) use salient pole generators with prominent leading PF capability. During light
          monsoon loads, these machines operate under-excited to absorb the reactive power produced by long lightly
          loaded 400 kV lines (the Ferranti effect), preventing dangerous voltage rise at receiving-end substations.
        </p>
      </div>
    </div>
  );
}

export default function SynchronousPhasorDiagram() {
  const [tab, setTab] = useState(0);
  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 0)} onClick={() => setTab(0)}>Simulate</button>
        <button style={S.tab(tab === 1)} onClick={() => setTab(1)}>Theory</button>
      </div>
      {tab === 0 ? <SimTab /> : <TheoryTab />}
    </div>
  );
}
