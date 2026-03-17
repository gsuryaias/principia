import React, { useState, useMemo, useEffect, useRef } from 'react';

/* ─────────────────────────── style object ─────────────────────────── */
const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 380 },
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

/* ─────────────────────────── constants ─────────────────────────── */
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

const VW = 900, VH = 420;
const ML = 70, MR = 30, MT = 40, MB = 60;
const PW = VW - ML - MR;
const PH = VH - MT - MB;

/* ─────────────────────────── math helpers ─────────────────────────── */

function Pcyl(delta_rad, V, Ef, Xs) {
  return (V * Ef / Xs) * Math.sin(delta_rad);
}

function Psalient(delta_rad, V, Ef, Xd, Xq) {
  const excitation = (V * Ef / Xd) * Math.sin(delta_rad);
  const reluctance = (V * V * (Xd - Xq) / (2 * Xd * Xq)) * Math.sin(2 * delta_rad);
  return excitation + reluctance;
}

function Preluctance(delta_rad, V, Xd, Xq) {
  return (V * V * (Xd - Xq) / (2 * Xd * Xq)) * Math.sin(2 * delta_rad);
}

function findDelta(Pm, Pmax, salient, V, Ef, Xd, Xq) {
  if (Math.abs(Pm) > Pmax) return null;

  if (!salient) {
    return Math.asin(Math.max(-1, Math.min(Pm / Pmax, 1)));
  }

  let peakDelta = 0;
  let peakP = 0;
  for (let d = 0; d <= 90 * DEG; d += 0.001) {
    const p = Psalient(d, V, Ef, Xd, Xq);
    if (p > peakP) { peakP = p; peakDelta = d; }
  }
  if (Math.abs(Pm) > peakP) return null;

  const sign = Pm >= 0 ? 1 : -1;
  let lo = 0, hi = peakDelta;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const p = sign * Psalient(sign * mid, V, Ef, Xd, Xq);
    if (p < Math.abs(Pm)) lo = mid; else hi = mid;
  }
  return sign * ((lo + hi) / 2);
}

/* ─────────────────────────── coordinate mappers ─────────────────────────── */

function degToX(deg) {
  return ML + ((deg + 180) / 360) * PW;
}

function puToY(p, Pmax) {
  const span = 2 * Pmax;
  return MT + PH - ((p + Pmax) / span) * PH;
}

/* ─────────────────────────── SVG path builder ─────────────────────────── */

function buildCurvePath(points) {
  if (!points.length) return '';
  return points.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(2)},${pt[1].toFixed(2)}`).join(' ');
}

/* ─────────────────────────── Stability Margin Arc ─────────────────────────── */

function StabilityMarginIndicator({ deltaDeg, maxDeltaDeg, opPower, maxPower, powerScale }) {
  if (deltaDeg === null) return null;
  const margin = maxDeltaDeg - Math.abs(deltaDeg);
  if (margin <= 0) return null;

  const opX = degToX(deltaDeg);
  const limitDeg = deltaDeg >= 0 ? maxDeltaDeg : -maxDeltaDeg;
  const limitPower = deltaDeg >= 0 ? maxPower : -maxPower;
  const leftX = Math.min(opX, degToX(limitDeg));
  const rightX = Math.max(opX, degToX(limitDeg));
  const opY = puToY(opPower, powerScale);
  const maxX = degToX(limitDeg);
  const maxY = puToY(limitPower, powerScale);

  // Color based on margin
  const color = margin > 40 ? '#22c55e' : margin > 20 ? '#f59e0b' : '#ef4444';

  return (
    <g>
      {/* Bracket showing margin */}
      <line x1={leftX} y1={MT + 4} x2={leftX} y2={MT + 14} stroke={color} strokeWidth={1.5} />
      <line x1={rightX} y1={MT + 4} x2={rightX} y2={MT + 14} stroke={color} strokeWidth={1.5} />
      <line x1={leftX} y1={MT + 9} x2={rightX} y2={MT + 9} stroke={color} strokeWidth={1.5} />
      {/* Arrow tips */}
      <polygon points={`${leftX},${MT + 9} ${leftX + 5},${MT + 6} ${leftX + 5},${MT + 12}`} fill={color} />
      <polygon points={`${rightX},${MT + 9} ${rightX - 5},${MT + 6} ${rightX - 5},${MT + 12}`} fill={color} />
      {/* Label */}
      <text x={(leftX + rightX) / 2} y={MT + 6} textAnchor="middle" fill={color} fontSize={9} fontWeight={700} fontFamily="monospace">
        Margin: {margin.toFixed(0)}\u00B0
      </text>
    </g>
  );
}

/* ─────────────────────────── Spring-Mass Analogy Panel ─────────────────────────── */

function SpringMassPanel({ Ks, stable, disturbed, onAnimEnd }) {
  const rafRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const tRef = useRef(0);

  useEffect(() => {
    if (!disturbed) { setOffset(0); return; }

    const A = 28;
    const omegaN = Math.max(0.5, Math.sqrt(Math.abs(Ks)) * 2.5);
    const zeta = stable ? 0.15 : -0.08;
    const omegaD = omegaN * Math.sqrt(Math.max(0.01, 1 - zeta * zeta));
    const start = performance.now();
    const duration = stable ? 4000 : 2000;

    const animate = (now) => {
      const t = (now - start) / 1000;
      const envelope = Math.exp(-zeta * omegaN * t);
      const x = A * envelope * Math.cos(omegaD * t);
      setOffset(x);
      if (now - start < duration) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setOffset(0);
        onAnimEnd && onAnimEnd();
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [disturbed]); // eslint-disable-line react-hooks/exhaustive-deps

  const W = 320, H = 90;
  const wallX = 20, anchorY = H / 2;
  const massX = 130 + offset;
  const massW = 32, massH = 32;

  const springStart = wallX + 8;
  const springEnd = massX - massW / 2;
  const coils = 6;
  const springPath = (() => {
    const len = springEnd - springStart;
    if (len < 10) return `M${springStart},${anchorY} L${springEnd},${anchorY}`;
    const step = len / (coils * 2);
    let d = `M${springStart},${anchorY}`;
    for (let i = 0; i < coils * 2; i++) {
      const cx = springStart + step * (i + 1);
      const cy = i % 2 === 0 ? anchorY - 12 : anchorY + 12;
      d += ` L${cx.toFixed(1)},${cy}`;
    }
    d += ` L${springEnd},${anchorY}`;
    return d;
  })();

  const label = stable
    ? (Math.abs(offset) < 1 && !disturbed ? 'Equilibrium \u2014 Stable' : `Oscillating\u2026 will settle (Ks = ${Ks.toFixed(2)})`)
    : 'DIVERGING \u2014 Loss of Synchronism!';
  const labelColor = stable ? '#22c55e' : '#ef4444';

  return (
    <div style={{ padding: '10px 24px 14px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e' }}>
      <div style={{ fontSize: 11, color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        Spring\u2013Mass Analogy (Synchronizing Torque)
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <svg width={W} height={H} style={{ overflow: 'visible' }}>
          {/* Wall */}
          <rect x={0} y={anchorY - 24} width={wallX} height={48} fill="#27272a" rx={2} />
          <line x1={wallX} y1={anchorY - 24} x2={wallX} y2={anchorY + 24} stroke="#3f3f46" strokeWidth={2} />

          {/* Spring */}
          <path d={springPath} stroke="#6366f1" strokeWidth={2} fill="none" />

          {/* Mass (rotor) */}
          <rect
            x={massX - massW / 2}
            y={anchorY - massH / 2}
            width={massW}
            height={massH}
            fill={stable ? '#18181b' : 'rgba(239,68,68,0.15)'}
            stroke={stable ? '#6366f1' : '#ef4444'}
            strokeWidth={2}
            rx={5}
          />
          <text x={massX} y={anchorY + 5} textAnchor="middle" fill="#a1a1aa" fontSize={9} fontFamily="monospace">\u03B4</text>

          {/* Equilibrium marker */}
          <line x1={130} y1={anchorY - massH / 2 - 6} x2={130} y2={anchorY + massH / 2 + 6}
            stroke="#22c55e" strokeWidth={1} strokeDasharray="3,2" opacity={0.5} />

          {/* Displacement arrow when disturbed */}
          {Math.abs(offset) > 2 && (
            <line x1={130} y1={anchorY}
              x2={massX} y2={anchorY}
              stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#arr)" opacity={0.7} />
          )}

          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
            </marker>
          </defs>
        </svg>

        <div>
          <div style={{ fontSize: 12, color: labelColor, fontWeight: 600, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 11, color: '#52525b', lineHeight: 1.6 }}>
            Spring stiffness \u2261 dP/d\u03B4 = {Ks.toFixed(3)} pu/rad<br />
            {stable
              ? 'Positive stiffness \u2192 restoring torque \u2192 system returns to \u03B4'
              : 'Stiffness \u2264 0 \u2192 no restoring force \u2192 pole slip occurs'}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Simulate Tab ─────────────────────────── */

function SimTab() {
  const [Ef, setEf] = useState(1.2);
  const [V, setV] = useState(1.0);
  const [Xs, setXs] = useState(1.0);
  const [Pm, setPm] = useState(0.6);
  const [salient, setSalient] = useState(false);
  const [Xd, setXd] = useState(1.0);
  const [Xq, setXq] = useState(0.65);

  const [disturbed, setDisturbed] = useState(false);
  const [flashLoss, setFlashLoss] = useState(false);
  const flashRef = useRef(null);

  const { Pmax, maxDeltaDeg } = useMemo(() => {
    if (!salient) return { Pmax: V * Ef / Xs, maxDeltaDeg: 90 };
    let peak = 0;
    let peakDelta = 0;
    for (let d = 0; d <= 90 * DEG; d += 0.001) {
      const p = Psalient(d, V, Ef, Xd, Xq);
      if (p > peak) {
        peak = p;
        peakDelta = d / DEG;
      }
    }
    return { Pmax: peak, maxDeltaDeg: peakDelta };
  }, [salient, V, Ef, Xs, Xd, Xq]);

  const PmMax = Math.min(1.5 * Pmax, 3.0);
  const PmClamped = Math.max(-PmMax, Math.min(Pm, PmMax));

  const deltaRad = useMemo(
    () => findDelta(PmClamped, Pmax, salient, V, Ef, Xd, Xq),
    [PmClamped, Pmax, salient, V, Ef, Xd, Xq]
  );
  const deltaDeg = deltaRad !== null ? deltaRad * RAD : null;

  const Ks = useMemo(() => {
    if (deltaRad === null) return 0;
    if (!salient) return (V * Ef / Xs) * Math.cos(deltaRad);
    const h = 0.001;
    return (Psalient(deltaRad + h, V, Ef, Xd, Xq) - Psalient(deltaRad - h, V, Ef, Xd, Xq)) / (2 * h);
  }, [deltaRad, salient, V, Ef, Xs, Xd, Xq]);

  const stable = Ks > 0;
  const stabilityMarginPct = deltaDeg !== null ? Math.max(0, ((maxDeltaDeg - Math.abs(deltaDeg)) / maxDeltaDeg) * 100) : 0;

  useEffect(() => {
    if (deltaRad === null) {
      if (flashRef.current) clearInterval(flashRef.current);
      let on = true;
      setFlashLoss(true);
      flashRef.current = setInterval(() => {
        on = !on;
        setFlashLoss(on);
      }, 400);
    } else {
      if (flashRef.current) clearInterval(flashRef.current);
      setFlashLoss(false);
    }
    return () => flashRef.current && clearInterval(flashRef.current);
  }, [deltaRad]);

  const { cylPoints, sailPoints, relPoints } = useMemo(() => {
    const N = 720;
    const cyl = [], sail = [], rel = [];
    const pmaxCyl = V * Ef / Xs;
    const scale = salient ? Pmax : pmaxCyl;

    for (let i = 0; i <= N; i++) {
      const deg = -180 + (360 * i) / N;
      const rad = deg * DEG;
      const px = degToX(deg);
      const pc = Pcyl(rad, V, Ef, Xs);
      const ps = Psalient(rad, V, Ef, Xd, Xq);
      const pr = Preluctance(rad, V, Xd, Xq);
      cyl.push([px, puToY(pc, scale)]);
      sail.push([px, puToY(ps, scale)]);
      rel.push([px, puToY(pr, scale)]);
    }
    return { cylPoints: cyl, sailPoints: sail, relPoints: rel };
  }, [V, Ef, Xs, Xd, Xq, salient, Pmax]);

  const pmaxCyl = V * Ef / Xs;
  const pmaxRef = salient ? Pmax : pmaxCyl;

  const opX = deltaDeg !== null ? degToX(deltaDeg) : null;
  const opY = deltaRad !== null ? puToY(PmClamped, pmaxRef) : null;
  const pmLineY = puToY(PmClamped, pmaxRef);

  const yTicks = useMemo(() => {
    const step = pmaxRef <= 0.5 ? 0.25 : pmaxRef <= 1.0 ? 0.5 : 1.0;
    const ticks = [];
    for (let v = -Math.ceil(pmaxRef / step) * step; v <= Math.ceil(pmaxRef / step) * step + 0.001; v += step) {
      const y = puToY(v, pmaxRef);
      if (y >= MT - 5 && y <= MT + PH + 5) ticks.push({ v, y });
    }
    return ticks;
  }, [pmaxRef]);

  const xTicks = [-180, -135, -90, -45, 0, 45, 90, 135, 180];

  return (
    <div style={S.simBody}>
      {/* Main P-delta Plot */}
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', maxWidth: VW, height: 'auto' }}>
          <defs>
            <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Background regions */}
          {/* Stable generator: 0-90 */}
          <rect
            x={degToX(0)} y={MT}
            width={degToX(maxDeltaDeg) - degToX(0)} height={PH}
            fill="rgba(34,197,94,0.04)"
          />
          {/* Stable motor: -90 to 0 */}
          <rect
            x={degToX(-maxDeltaDeg)} y={MT}
            width={degToX(0) - degToX(-maxDeltaDeg)} height={PH}
            fill="rgba(99,102,241,0.04)"
          />
          {/* Unstable generator: 90-180 */}
          <rect
            x={degToX(maxDeltaDeg)} y={MT}
            width={degToX(180) - degToX(maxDeltaDeg)} height={PH}
            fill="rgba(239,68,68,0.06)"
          />
          {/* Unstable motor: -180 to -90 */}
          <rect
            x={degToX(-180)} y={MT}
            width={degToX(-maxDeltaDeg) - degToX(-180)} height={PH}
            fill="rgba(239,68,68,0.06)"
          />

          {/* Region labels */}
          <text x={degToX(maxDeltaDeg / 2)} y={MT + 16} textAnchor="middle" fill="#22c55e" fontSize={10} opacity={0.6} fontWeight={600}>STABLE GEN</text>
          <text x={degToX(maxDeltaDeg / 2)} y={MT + 28} textAnchor="middle" fill="#22c55e" fontSize={8} opacity={0.4}>0\u00B0 \u2013 {maxDeltaDeg.toFixed(0)}\u00B0</text>
          <text x={degToX(-maxDeltaDeg / 2)} y={MT + 16} textAnchor="middle" fill="#6366f1" fontSize={10} opacity={0.7} fontWeight={600}>STABLE MOTOR</text>
          <text x={degToX(-maxDeltaDeg / 2)} y={MT + 28} textAnchor="middle" fill="#6366f1" fontSize={8} opacity={0.4}>-{maxDeltaDeg.toFixed(0)}\u00B0 \u2013 0\u00B0</text>
          <text x={degToX((180 + maxDeltaDeg) / 2)} y={MT + 16} textAnchor="middle" fill="#ef4444" fontSize={10} opacity={0.6} fontWeight={600}>UNSTABLE</text>
          <text x={degToX((180 + maxDeltaDeg) / 2)} y={MT + 28} textAnchor="middle" fill="#ef4444" fontSize={8} opacity={0.4}>{maxDeltaDeg.toFixed(0)}\u00B0 \u2013 180\u00B0</text>
          <text x={degToX((-180 - maxDeltaDeg) / 2)} y={MT + 16} textAnchor="middle" fill="#ef4444" fontSize={10} opacity={0.6} fontWeight={600}>UNSTABLE</text>
          <text x={degToX((-180 - maxDeltaDeg) / 2)} y={MT + 28} textAnchor="middle" fill="#ef4444" fontSize={8} opacity={0.4}>-180\u00B0 \u2013 -{maxDeltaDeg.toFixed(0)}\u00B0</text>

          {/* Grid lines */}
          {yTicks.map(({ v, y }) => (
            <line key={v} x1={ML} x2={ML + PW} y1={y} y2={y}
              stroke="#1e1e2e" strokeWidth={v === 0 ? 1.5 : 1} />
          ))}
          {xTicks.map(d => (
            <line key={d} x1={degToX(d)} x2={degToX(d)} y1={MT} y2={MT + PH}
              stroke="#1e1e2e" strokeWidth={d === 0 ? 1.5 : 1} />
          ))}

          {/* Axes */}
          <line x1={ML} x2={ML + PW} y1={puToY(0, pmaxRef)} y2={puToY(0, pmaxRef)} stroke="#3f3f46" strokeWidth={1.5} />
          <line x1={ML} x2={ML} y1={MT} y2={MT + PH} stroke="#3f3f46" strokeWidth={1.5} />
          <line x1={ML + PW} x2={ML + PW} y1={MT} y2={MT + PH} stroke="#3f3f46" strokeWidth={1} />

          {/* X tick labels */}
          {xTicks.map(d => (
            <text key={d} x={degToX(d)} y={MT + PH + 18}
              textAnchor="middle" fill="#52525b" fontSize={11} fontFamily="monospace">
              {d}\u00B0
            </text>
          ))}
          <text x={ML + PW / 2} y={VH - 6} textAnchor="middle" fill="#71717a" fontSize={12}>
            Power Angle \u03B4 (degrees)
          </text>

          {/* Y tick labels */}
          {yTicks.map(({ v, y }) => (
            <text key={v} x={ML - 8} y={y + 4}
              textAnchor="end" fill="#52525b" fontSize={11} fontFamily="monospace">
              {v.toFixed(1)}
            </text>
          ))}
          <text
            x={16} y={MT + PH / 2}
            textAnchor="middle" fill="#71717a" fontSize={12}
            transform={`rotate(-90, 16, ${MT + PH / 2})`}
          >
            P (pu)
          </text>

          {/* Reluctance torque component (dashed, salient only) */}
          {salient && (
            <path
              d={buildCurvePath(relPoints)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="5,4"
              opacity={0.7}
            />
          )}

          {/* Main P-delta curve */}
          <path
            d={buildCurvePath(cylPoints)}
            fill="none"
            stroke={salient ? '#6366f1' : '#6366f1'}
            strokeWidth={salient ? 1.5 : 2.5}
            opacity={salient ? 0.3 : 1}
          />
          {salient && (
            <path
              d={buildCurvePath(sailPoints)}
              fill="none"
              stroke="#818cf8"
              strokeWidth={2.5}
              opacity={1}
            />
          )}

          {/* Key point markers */}
          {/* No-load point */}
          <circle cx={degToX(0)} cy={puToY(0, pmaxRef)} r={5} fill="#27272a" stroke="#6366f1" strokeWidth={2} />
          <text x={degToX(0) + 8} y={puToY(0, pmaxRef) - 8} fill="#6366f1" fontSize={10} fontFamily="monospace">No Load</text>

          {/* Pmax point */}
          <circle cx={degToX(maxDeltaDeg)} cy={puToY(Pmax, pmaxRef)} r={5} fill="#27272a" stroke="#22c55e" strokeWidth={2} />
          <text x={degToX(maxDeltaDeg)} y={puToY(Pmax, pmaxRef) - 10} fill="#22c55e" fontSize={10} fontFamily="monospace" textAnchor="middle">
            P_max  \u03B4={maxDeltaDeg.toFixed(0)}\u00B0
          </text>

          {/* Max motoring power */}
          <circle cx={degToX(-maxDeltaDeg)} cy={puToY(-Pmax, pmaxRef)} r={5} fill="#27272a" stroke="#818cf8" strokeWidth={2} />
          <text x={degToX(-maxDeltaDeg) + 4} y={puToY(-Pmax, pmaxRef) + 16} fill="#818cf8" fontSize={10} fontFamily="monospace" textAnchor="middle">
            Max Motor Power
          </text>

          {/* Mechanical power line Pm */}
          <line
            x1={ML} x2={ML + PW}
            y1={pmLineY} y2={pmLineY}
            stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="8,5"
            opacity={0.85}
          />
          <text x={ML + PW - 4} y={pmLineY - 6} fill="#f59e0b" fontSize={11} textAnchor="end" fontFamily="monospace">
            Pm = {PmClamped.toFixed(2)} pu
          </text>

          {/* Stability margin indicator */}
          <StabilityMarginIndicator deltaDeg={deltaDeg} maxDeltaDeg={maxDeltaDeg} opPower={PmClamped} maxPower={Pmax} powerScale={pmaxRef} />

          {/* Operating point dot */}
          {opX !== null && opY !== null && (
            <>
              {/* Vertical guide to x-axis */}
              <line x1={opX} x2={opX} y1={opY} y2={MT + PH}
                stroke="#06b6d4" strokeWidth={1} strokeDasharray="4,3" opacity={0.5} />
              {/* Glowing operating point */}
              <circle cx={opX} cy={opY} r={9} fill="rgba(6,182,212,0.15)" filter="url(#glow)" />
              <circle cx={opX} cy={opY} r={6} fill="#06b6d4" filter="url(#glow)" />
              <circle cx={opX} cy={opY} r={3} fill="#fff" />
              {/* delta label */}
              <text x={opX} y={MT + PH + 34} textAnchor="middle" fill="#06b6d4" fontSize={11} fontFamily="monospace">
                \u03B4 = {deltaDeg!==null ? deltaDeg.toFixed(1) : '\u2014'}\u00B0
              </text>
            </>
          )}

          {/* Loss of synchronism overlay */}
          {deltaRad === null && flashLoss && (
            <rect x={ML} y={MT} width={PW} height={PH}
              fill="rgba(239,68,68,0.08)" />
          )}
          {deltaRad === null && (
            <text
              x={ML + PW / 2} y={MT + PH / 2}
              textAnchor="middle" fill={flashLoss ? '#ef4444' : '#7f1d1d'}
              fontSize={18} fontWeight={700} fontFamily="monospace"
            >
              LOSS OF SYNCHRONISM
            </text>
          )}

          {/* Title */}
          <text x={ML + PW / 2} y={MT - 14} textAnchor="middle" fill="#71717a" fontSize={13} fontWeight={600}>
            Power\u2013Angle Curve \u2014 {salient ? 'Salient Pole' : 'Cylindrical Rotor'} Synchronous Machine
          </text>

          {/* Legend */}
          {salient && (
            <g transform={`translate(${ML + PW - 180}, ${MT + 34})`}>
              <rect x={0} y={0} width={170} height={56} fill="#0c0c0f" stroke="#27272a" strokeWidth={1} rx={6} />
              <line x1={10} y1={16} x2={36} y2={16} stroke="#818cf8" strokeWidth={2.5} />
              <text x={42} y={20} fill="#a1a1aa" fontSize={11}>Salient total</text>
              <line x1={10} y1={32} x2={36} y2={32} stroke="#6366f1" strokeWidth={1.5} opacity={0.4} />
              <text x={42} y={36} fill="#71717a" fontSize={11}>Cylindrical</text>
              <line x1={10} y1={48} x2={36} y2={48} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4,3" />
              <text x={42} y={52} fill="#f59e0b" fontSize={11}>Reluctance</text>
            </g>
          )}
        </svg>
      </div>

      {/* Stability badge bar */}
      <div style={{ display: 'flex', gap: 10, padding: '8px 24px', background: '#0d0d10', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{
          padding: '6px 14px', borderRadius: 8,
          border: `1.5px solid ${deltaRad === null ? '#ef4444' : stable ? '#22c55e' : '#ef4444'}`,
          background: deltaRad === null ? 'rgba(239,68,68,0.12)' : stable ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.12)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: deltaRad === null ? '#ef4444' : stable ? '#22c55e' : '#ef4444',
            boxShadow: `0 0 8px ${deltaRad === null ? '#ef4444' : stable ? '#22c55e' : '#ef4444'}66`,
            animation: deltaRad === null ? undefined : undefined,
          }} />
          <span style={{
            fontSize: 12, fontWeight: 700, fontFamily: 'monospace',
            color: deltaRad === null ? '#ef4444' : stable ? '#22c55e' : '#ef4444',
          }}>
            {deltaRad === null ? 'LOSS OF SYNCHRONISM' : stable ? 'STABLE OPERATION' : 'UNSTABLE'}
          </span>
        </div>
        {deltaDeg !== null && (
          <div style={{
            padding: '6px 14px', borderRadius: 8,
            border: `1.5px solid ${stabilityMarginPct > 40 ? '#22c55e' : stabilityMarginPct > 20 ? '#f59e0b' : '#ef4444'}`,
            background: 'rgba(99,102,241,0.06)',
          }}>
            <span style={{
              fontSize: 11, fontWeight: 600, fontFamily: 'monospace',
              color: stabilityMarginPct > 40 ? '#22c55e' : stabilityMarginPct > 20 ? '#f59e0b' : '#ef4444',
            }}>
              MARGIN: {stabilityMarginPct.toFixed(0)}%
            </span>
          </div>
        )}
        <div style={{
          padding: '6px 14px', borderRadius: 8,
          border: '1.5px solid #27272a', background: 'transparent',
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'monospace', color: '#71717a' }}>
            {salient ? 'Salient Pole' : 'Cylindrical Rotor'}
          </span>
        </div>
      </div>

      {/* Live readouts */}
      <div style={S.results}>
        <div style={S.ri}>
          <span style={S.rl}>P_max</span>
          <span style={{ ...S.rv, color: '#22c55e' }}>{Pmax.toFixed(3)} pu</span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>\u03B4 (operating)</span>
          <span style={{ ...S.rv, color: '#06b6d4' }}>
            {deltaDeg !== null ? `${deltaDeg.toFixed(1)}\u00B0` : '\u2014'}
          </span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>Stability Margin</span>
          <span style={{
            ...S.rv,
            color: stabilityMarginPct > 40 ? '#22c55e' : stabilityMarginPct > 20 ? '#f59e0b' : '#ef4444'
          }}>
            {deltaDeg !== null ? `${stabilityMarginPct.toFixed(1)}%` : '\u2014'}
          </span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>dP/d\u03B4 (Ks)</span>
          <span style={{ ...S.rv, color: Ks > 0 ? '#818cf8' : '#ef4444' }}>
            {Ks.toFixed(3)} pu/rad
          </span>
        </div>
        <div style={S.ri}>
          <span style={S.rl}>Status</span>
          <span style={{ ...S.rv, color: deltaRad === null ? '#ef4444' : stable ? '#22c55e' : '#ef4444' }}>
            {deltaRad === null ? 'OUT OF SYNC' : stable ? 'STABLE' : 'UNSTABLE'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={S.controls}>
        <div style={S.cg}>
          <label style={S.label}>Ef (pu)</label>
          <input type="range" min={0.5} max={2.0} step={0.05} value={Ef}
            onChange={e => setEf(+e.target.value)} style={S.slider} />
          <span style={S.val}>{Ef.toFixed(2)}</span>
        </div>
        <div style={S.cg}>
          <label style={S.label}>V (pu)</label>
          <input type="range" min={0.8} max={1.2} step={0.05} value={V}
            onChange={e => setV(+e.target.value)} style={S.slider} />
          <span style={S.val}>{V.toFixed(2)}</span>
        </div>
        {!salient && (
          <div style={S.cg}>
            <label style={S.label}>Xs (pu)</label>
            <input type="range" min={0.5} max={2.0} step={0.05} value={Xs}
              onChange={e => setXs(+e.target.value)} style={S.slider} />
            <span style={S.val}>{Xs.toFixed(2)}</span>
          </div>
        )}
        {salient && (
          <>
            <div style={S.cg}>
              <label style={S.label}>Xd (pu)</label>
              <input type="range" min={0.5} max={2.0} step={0.05} value={Xd}
                onChange={e => setXd(+e.target.value)} style={S.slider} />
              <span style={S.val}>{Xd.toFixed(2)}</span>
            </div>
            <div style={S.cg}>
              <label style={S.label}>Xq (pu)</label>
              <input type="range" min={0.3} max={1.5} step={0.05} value={Xq}
                onChange={e => setXq(Math.min(+e.target.value, Xd - 0.05))} style={S.slider} />
              <span style={S.val}>{Xq.toFixed(2)}</span>
            </div>
          </>
        )}
        <div style={S.cg}>
          <label style={S.label}>Pm (pu)</label>
          <input type="range" min={-PmMax} max={PmMax} step={0.01} value={PmClamped}
            onChange={e => setPm(+e.target.value)} style={{ ...S.slider, width: 160 }} />
          <span style={S.val}>{PmClamped.toFixed(2)}</span>
        </div>
        <div style={S.cg}>
          <label style={{ ...S.label, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={salient} onChange={e => setSalient(e.target.checked)}
              style={{ accentColor: '#6366f1', width: 14, height: 14 }} />
            Salient Pole
          </label>
        </div>
        <button
          onClick={() => { setDisturbed(false); setTimeout(() => setDisturbed(true), 50); }}
          style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid #27272a',
            background: '#18181b', color: '#c4b5fd', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', whiteSpace: 'nowrap'
          }}
        >
          Apply Disturbance
        </button>
      </div>

      {/* Spring-Mass analogy panel */}
      <SpringMassPanel
        Ks={Ks}
        stable={stable && deltaRad !== null}
        disturbed={disturbed}
        onAnimEnd={() => setDisturbed(false)}
      />

      {/* Info boxes */}
      <div style={S.strip}>
        <div style={S.box}>
          <span style={S.boxT}>Operating Interpretation</span>
          <span style={S.boxV}>
            {PmClamped >= 0
              ? `Prime-mover torque drives the rotor ahead (\u03B4 > 0).\nMore mechanical input raises \u03B4 and increases generator output.`
              : `Electrical input dominates and the machine operates as a motor (\u03B4 < 0).\nLarger motoring load increases |\u03B4| while power is absorbed from the bus.`}
            <br />
            Critical angle magnitude \u2248 {maxDeltaDeg.toFixed(1)}\u00B0 for the selected model
          </span>
        </div>
        <div style={S.box}>
          <span style={S.boxT}>Stability Margin</span>
          <span style={{ ...S.boxV, color: stabilityMarginPct > 40 ? '#86efac' : stabilityMarginPct > 20 ? '#fde68a' : '#fca5a5' }}>
            {deltaDeg !== null
              ? `${stabilityMarginPct.toFixed(1)}% \u2014 ${stabilityMarginPct > 40 ? 'Healthy. Grid-connected machines typically maintain > 30% margin.' : stabilityMarginPct > 20 ? 'Caution \u2014 margin is narrow. Susceptible to faults.' : 'CRITICAL \u2014 approaching pull-out torque!'}`
              : 'Machine has slipped a pole \u2014 circuit breaker must trip.'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Theory SVG Diagrams ─────────────────────────── */

/** P-delta curve sketch with labeled regions */
function PDeltaCurveSVG() {
  const W = 520, H = 200;
  const pad = { l: 50, r: 20, t: 30, b: 40 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const midY = pad.t + cH / 2;

  // Build sine curve points
  const pts = [];
  for (let i = 0; i <= 200; i++) {
    const deg = -180 + (360 * i / 200);
    const rad = deg * Math.PI / 180;
    const p = Math.sin(rad);
    const x = pad.l + ((deg + 180) / 360) * cW;
    const y = midY - p * (cH / 2 - 10);
    pts.push([x, y]);
  }
  const path = pts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' ');

  // Stable region (0-90) highlight
  const stablePts = [];
  for (let i = 0; i <= 50; i++) {
    const deg = (90 * i / 50);
    const rad = deg * Math.PI / 180;
    const p = Math.sin(rad);
    const x = pad.l + ((deg + 180) / 360) * cW;
    const y = midY - p * (cH / 2 - 10);
    stablePts.push([x, y]);
  }
  const stableArea = `${stablePts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' ')} L${stablePts[stablePts.length - 1][0].toFixed(1)},${midY} L${stablePts[0][0].toFixed(1)},${midY} Z`;

  // Pmax position
  const pmaxX = pad.l + (270 / 360) * cW;
  const pmaxY = midY - (cH / 2 - 10);

  // Operating point at ~30 deg
  const opDeg = 30;
  const opX = pad.l + ((opDeg + 180) / 360) * cW;
  const opP = Math.sin(opDeg * Math.PI / 180);
  const opY = midY - opP * (cH / 2 - 10);

  // Pm line
  const pmY = opY;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: '100%', display: 'block', margin: '18px auto' }}>
      {/* Stable region fill */}
      <path d={stableArea} fill="rgba(34,197,94,0.08)" />

      {/* Unstable region (90-180) */}
      <rect x={pmaxX} y={pad.t} width={pad.l + cW - pmaxX - pad.r} height={cH} fill="rgba(239,68,68,0.06)" rx={0} />

      {/* Axes */}
      <line x1={pad.l} y1={midY} x2={pad.l + cW} y2={midY} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={pad.l + cW / 2} y1={pad.t} x2={pad.l + cW / 2} y2={pad.t + cH} stroke="#3f3f46" strokeWidth={1} />

      {/* P-delta curve */}
      <path d={path} fill="none" stroke="#6366f1" strokeWidth={2.5} />

      {/* Pm line */}
      <line x1={pad.l} y1={pmY} x2={pad.l + cW} y2={pmY} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6,4" />
      <text x={pad.l + cW + 2} y={pmY + 4} fill="#f59e0b" fontSize={9} fontFamily="monospace">Pm</text>

      {/* Pmax marker */}
      <circle cx={pmaxX} cy={pmaxY} r={5} fill="#27272a" stroke="#22c55e" strokeWidth={2} />
      <text x={pmaxX + 8} y={pmaxY + 4} fill="#22c55e" fontSize={9} fontWeight={700} fontFamily="monospace">Pmax</text>

      {/* Operating point */}
      <circle cx={opX} cy={opY} r={5} fill="#06b6d4" />
      <text x={opX + 8} y={opY - 6} fill="#06b6d4" fontSize={9} fontFamily="monospace">Operating pt</text>

      {/* Region labels */}
      <text x={pad.l + cW * 0.63} y={pad.t + 18} fill="#22c55e" fontSize={9} fontWeight={600} fontFamily="monospace">STABLE (0\u00B0\u201390\u00B0)</text>
      <text x={pad.l + cW * 0.85} y={pad.t + 18} fill="#ef4444" fontSize={9} fontWeight={600} fontFamily="monospace">UNSTABLE</text>

      {/* Axis labels */}
      <text x={pad.l + cW / 2} y={H - 8} textAnchor="middle" fill="#71717a" fontSize={10} fontFamily="monospace">\u03B4 (degrees)</text>
      <text x={pad.l - 8} y={pad.t + 4} fill="#71717a" fontSize={10} fontFamily="monospace">P</text>

      {/* Degree marks */}
      {[-180, -90, 0, 90, 180].map(d => {
        const x = pad.l + ((d + 180) / 360) * cW;
        return <text key={d} x={x} y={midY + 16} textAnchor="middle" fill="#52525b" fontSize={8} fontFamily="monospace">{d}\u00B0</text>;
      })}
    </svg>
  );
}

/** Two-machine system diagram */
function TwoMachineSVG() {
  const W = 500, H = 140;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: '100%', display: 'block', margin: '18px auto' }}>
      <defs>
        <marker id="tm-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#34d399" />
        </marker>
        <marker id="tm-arr2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
        </marker>
      </defs>

      {/* Title */}
      <text x={W / 2} y={16} textAnchor="middle" fill="#52525b" fontSize={11} fontWeight={600} fontFamily="monospace">TWO-MACHINE / MACHINE-INFINITE BUS SYSTEM</text>

      {/* Generator (left) */}
      <circle cx={60} cy={70} r={28} fill="#18181b" stroke="#22c55e" strokeWidth={2} />
      <text x={60} y={66} textAnchor="middle" fill="#22c55e" fontSize={11} fontFamily="monospace" fontWeight={700}>G</text>
      <text x={60} y={80} textAnchor="middle" fill="#22c55e" fontSize={9} fontFamily="monospace">Ef\u2220\u03B4</text>

      {/* Xs line (transmission line + machine reactance) */}
      <line x1={88} y1={70} x2={140} y2={70} stroke="#a1a1aa" strokeWidth={1.5} />
      {/* jXs inductor symbol */}
      {[0,1,2].map(i => (
        <path key={i} d={`M${140 + i*22},70 a9,9 0 0 1 22,0`} fill="none" stroke="#facc15" strokeWidth={2} />
      ))}
      <text x={184} y={58} textAnchor="middle" fill="#facc15" fontSize={10} fontFamily="monospace" fontWeight={600}>jXs</text>
      <line x1={206} y1={70} x2={260} y2={70} stroke="#a1a1aa" strokeWidth={1.5} />

      {/* Current arrow */}
      <line x1={120} y1={52} x2={180} y2={52} stroke="#34d399" strokeWidth={1.5} markerEnd="url(#tm-arr)" />
      <text x={150} y={47} textAnchor="middle" fill="#34d399" fontSize={10} fontFamily="monospace" fontWeight={600}>Ia</text>

      {/* Power flow arrow */}
      <line x1={140} y1={100} x2={210} y2={100} stroke="#f59e0b" strokeWidth={1.5} markerEnd="url(#tm-arr2)" />
      <text x={175} y={116} textAnchor="middle" fill="#f59e0b" fontSize={9} fontFamily="monospace">P = (V\u00B7Ef/Xs)\u00B7sin(\u03B4)</text>

      {/* Infinite bus / Load (right) */}
      <rect x={260} y={50} width={4} height={40} fill="#6366f1" rx={2} />
      <text x={280} y={65} fill="#6366f1" fontSize={11} fontFamily="monospace" fontWeight={700}>V\u22200\u00B0</text>
      <text x={280} y={80} fill="#71717a" fontSize={9} fontFamily="monospace">Infinite Bus</text>

      {/* Mechanical input */}
      <line x1={10} y1={70} x2={32} y2={70} stroke="#a78bfa" strokeWidth={2} markerEnd="url(#tm-arr)" />
      <text x={20} y={58} textAnchor="middle" fill="#a78bfa" fontSize={8} fontFamily="monospace">Pm (turbine)</text>

      {/* Delta angle annotation */}
      <path d={`M 340 42 Q 370 32 400 42`} fill="none" stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={370} y={28} textAnchor="middle" fill="#06b6d4" fontSize={10} fontFamily="monospace" fontWeight={600}>\u03B4 = angle(Ef, V)</text>

      {/* Angle arc between Ef and V */}
      <g transform="translate(340, 70)">
        <line x1={0} y1={0} x2={45} y2={0} stroke="#6366f1" strokeWidth={1.5} />
        <line x1={0} y1={0} x2={38} y2={-22} stroke="#22c55e" strokeWidth={1.5} />
        <path d="M 20 0 A 20 20 0 0 0 17 -11" fill="none" stroke="#06b6d4" strokeWidth={1} />
        <text x={24} y={-3} fill="#06b6d4" fontSize={8} fontFamily="monospace">\u03B4</text>
        <text x={48} y={4} fill="#6366f1" fontSize={8} fontFamily="monospace">V</text>
        <text x={40} y={-22} fill="#22c55e" fontSize={8} fontFamily="monospace">Ef</text>
      </g>
    </svg>
  );
}

/** Equal area criterion concept sketch */
function EqualAreaSVG() {
  const W = 480, H = 200;
  const pad = { l: 50, r: 20, t: 30, b: 36 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const midY = pad.t + cH / 2;
  const scale = (cH / 2 - 10);

  // Pm = 0.5 pu
  const Pm = 0.5;
  const pmY = midY - Pm * scale;

  // Operating point: delta_0 = asin(0.5) = 30 deg
  const d0 = 30;
  // Fault clearance angle: ~60 deg
  const dc = 60;
  // Max angle: ~110 deg (where decelerating area equals accelerating area)
  const dmax = 110;

  // Sine curve
  const sinePts = [];
  for (let i = 0; i <= 200; i++) {
    const deg = (180 * i / 200);
    const x = pad.l + (deg / 180) * cW;
    const y = midY - Math.sin(deg * Math.PI / 180) * scale;
    sinePts.push([x, y]);
  }
  const sinePath = sinePts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' ');

  // Accelerating area (d0 to dc, Pm > Pe during fault, Pe=0 during fault)
  const accelArea = (() => {
    let d = `M ${pad.l + (d0 / 180) * cW} ${pmY}`;
    d += ` L ${pad.l + (dc / 180) * cW} ${pmY}`;
    d += ` L ${pad.l + (dc / 180) * cW} ${midY}`;
    d += ` L ${pad.l + (d0 / 180) * cW} ${midY}`;
    d += ' Z';
    return d;
  })();

  // Decelerating area (dc to dmax, Pe > Pm after fault clearance)
  const decelPts = [];
  for (let i = 0; i <= 50; i++) {
    const deg = dc + (dmax - dc) * i / 50;
    const x = pad.l + (deg / 180) * cW;
    const y = midY - Math.sin(deg * Math.PI / 180) * scale;
    decelPts.push([x, y]);
  }
  let decelArea = decelPts.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(' ');
  decelArea += ` L ${pad.l + (dmax / 180) * cW} ${pmY}`;
  decelArea += ` L ${pad.l + (dc / 180) * cW} ${pmY} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ maxWidth: '100%', display: 'block', margin: '18px auto' }}>
      {/* Axes */}
      <line x1={pad.l} y1={midY} x2={pad.l + cW} y2={midY} stroke="#3f3f46" strokeWidth={1} />

      {/* Accelerating area (red) */}
      <path d={accelArea} fill="rgba(239,68,68,0.2)" stroke="none" />
      <text x={pad.l + ((d0 + dc) / 2 / 180) * cW} y={midY - Pm * scale / 2 + 4} textAnchor="middle" fill="#ef4444" fontSize={9} fontWeight={700} fontFamily="monospace">A_accel</text>

      {/* Decelerating area (green) */}
      <path d={decelArea} fill="rgba(34,197,94,0.2)" stroke="none" />
      <text x={pad.l + ((dc + dmax) / 2 / 180) * cW} y={pmY - 10} textAnchor="middle" fill="#22c55e" fontSize={9} fontWeight={700} fontFamily="monospace">A_decel</text>

      {/* P-delta sine curve */}
      <path d={sinePath} fill="none" stroke="#6366f1" strokeWidth={2} />

      {/* Pm line */}
      <line x1={pad.l} y1={pmY} x2={pad.l + cW} y2={pmY} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5,3" />
      <text x={pad.l - 4} y={pmY + 4} textAnchor="end" fill="#f59e0b" fontSize={9} fontFamily="monospace">Pm</text>

      {/* Pe = 0 during fault line */}
      <line x1={pad.l + (d0 / 180) * cW} y1={midY} x2={pad.l + (dc / 180) * cW} y2={midY} stroke="#ef4444" strokeWidth={2} />
      <text x={pad.l + ((d0 + dc) / 2 / 180) * cW} y={midY + 14} textAnchor="middle" fill="#ef4444" fontSize={8} fontFamily="monospace">Pe=0 (fault)</text>

      {/* Key points */}
      <circle cx={pad.l + (d0 / 180) * cW} cy={pmY} r={4} fill="#06b6d4" />
      <text x={pad.l + (d0 / 180) * cW} y={pmY - 8} textAnchor="middle" fill="#06b6d4" fontSize={8} fontFamily="monospace">\u03B4\u2080={d0}\u00B0</text>

      <circle cx={pad.l + (dc / 180) * cW} cy={midY - Math.sin(dc * Math.PI / 180) * scale} r={4} fill="#f59e0b" />
      <text x={pad.l + (dc / 180) * cW} y={midY - Math.sin(dc * Math.PI / 180) * scale - 8} textAnchor="middle" fill="#f59e0b" fontSize={8} fontFamily="monospace">\u03B4c={dc}\u00B0</text>

      <circle cx={pad.l + (dmax / 180) * cW} cy={pmY} r={4} fill="#22c55e" />
      <text x={pad.l + (dmax / 180) * cW + 4} y={pmY - 8} fill="#22c55e" fontSize={8} fontFamily="monospace">\u03B4max={dmax}\u00B0</text>

      {/* Title */}
      <text x={pad.l + cW / 2} y={pad.t - 8} textAnchor="middle" fill="#52525b" fontSize={11} fontWeight={600} fontFamily="monospace">EQUAL AREA CRITERION</text>

      {/* Equation */}
      <text x={pad.l + cW / 2} y={H - 6} textAnchor="middle" fill="#71717a" fontSize={10} fontFamily="monospace">A_accel = A_decel \u2192 System is transiently stable</text>
    </svg>
  );
}

/* ─────────────────────────── Theory Tab ─────────────────────────── */

function TheoryTab() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>The Power\u2013Angle Relationship</h2>
      <p style={S.p}>
        The power-angle (P\u2013\u03B4) curve is the single most important characteristic of a synchronous
        machine. It describes, at a glance, how much active power a generator can deliver (or a
        motor can absorb) as a function of the torque angle \u03B4 \u2014 the angle by which the rotor's
        magnetic axis leads (generator) or lags (motor) the air-gap flux.
      </p>
      <p style={S.p}>
        Starting from the equivalent circuit \u2014 terminal voltage <strong>V</strong>, excitation EMF
        <strong> Ef</strong>, and synchronous reactance <strong>Xs</strong> \u2014 the phasor diagram
        gives the active component of the current, and therefore the electrical power:
      </p>
      <code style={S.eq}>P = (V \u00B7 Ef / Xs) \u00B7 sin(\u03B4)   [cylindrical rotor]</code>

      <h3 style={S.h3}>Two-Machine System Model</h3>
      <p style={S.p}>
        The P-\u03B4 relationship is derived from the simplified two-machine system (or machine-infinite
        bus system) shown below. The generator with excitation EMF Ef at angle \u03B4 is connected
        through the synchronous reactance Xs to an infinite bus at voltage V\u22200\u00B0.
      </p>

      <TwoMachineSVG />

      <PDeltaCurveSVG />

      <p style={S.p}>
        In a <em>generator</em>, Ef leads V by \u03B4 (the rotor field is ahead of the stator field).
        In a <em>motor</em>, V leads Ef by \u03B4, giving negative P by convention. The curve is
        simply a sine wave \u2014 symmetric, and bounded at \u00B1Pmax.
      </p>
      <code style={S.eq}>P_max = V \u00B7 Ef / Xs</code>

      <h2 style={S.h2}>Key Equations</h2>

      <h3 style={S.h3}>Salient-Pole Machine</h3>
      <p style={S.p}>
        Salient-pole machines (hydro generators, diesel gensets) have different reactances along
        the two magnetic axes. The power equation acquires an extra{' '}
        <em>reluctance torque</em> term that exists even when Ef = 0:
      </p>
      <code style={S.eq}>
        P = (V\u00B7Ef/Xd)\u00B7sin(\u03B4) + (V\u00B2\u00B7(Xd \u2212 Xq) / (2\u00B7Xd\u00B7Xq))\u00B7sin(2\u03B4)
      </code>
      <p style={S.p}>
        The second term peaks at \u03B4 = 45\u00B0 and shifts the overall maximum to \u03B4 &lt; 90\u00B0, giving a
        slightly better stability margin than an equivalent cylindrical machine.
      </p>

      <h3 style={S.h3}>Synchronizing Power Coefficient</h3>
      <code style={S.eq}>Ks = dP/d\u03B4 = (V \u00B7 Ef / Xs) \u00B7 cos(\u03B4)   [cylindrical]</code>
      <p style={S.p}>
        Ks is the <em>stiffness</em> of the electromagnetic "spring" holding the rotor in
        synchronism. At \u03B4 = 0\u00B0 it is maximum (Pmax / rad); at \u03B4 = 90\u00B0 it is zero (no restoring
        force); beyond 90\u00B0 it is negative (destabilising).
      </p>

      <h2 style={S.h2}>Stability Analysis</h2>
      <p style={S.p}>
        The steady-state stability of a synchronous machine is completely determined by the sign
        of Ks:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Stable (\u03B4 &lt; 90\u00B0):</strong> Ks &gt; 0 \u2014 any small perturbation in \u03B4 generates a restoring electromagnetic torque that pulls the rotor back. The system behaves like a damped spring-mass.</li>
        <li style={S.li}><strong>Unstable (\u03B4 &gt; 90\u00B0):</strong> Ks &lt; 0 \u2014 a perturbation increases the torque imbalance, causing further acceleration. The rotor "slips a pole" \u2014 it overshoots one full revolution relative to the stator field. This is violent and must be cleared by protection relays.</li>
        <li style={S.li}><strong>Neutral (\u03B4 = 90\u00B0):</strong> Ks = 0 \u2014 the maximum power point, also called <em>pull-out torque</em>. Mathematically stable but practically a knife-edge; any noise causes loss of synchronism.</li>
      </ul>

      <h3 style={S.h3}>The Spring Analogy</h3>
      <p style={S.p}>
        Think of the rotor as a mass connected to the grid by an invisible spring. The spring
        stiffness equals Ks = dP/d\u03B4. When you push the mass (apply a mechanical disturbance),
        the spring pulls it back \u2014 that is synchronizing torque. As \u03B4 increases toward 90\u00B0, the
        spring gets progressively weaker. At \u03B4 = 90\u00B0 the spring is slack; beyond it, the spring
        pushes the mass away \u2014 guaranteed instability.
      </p>

      <h2 style={S.h2}>Equal Area Criterion</h2>
      <p style={S.p}>
        For a fault or sudden load change, transient stability can be assessed graphically: the kinetic
        energy the rotor gains (area between Pm line and P-\u03B4 curve during acceleration) must be
        absorbed by the decelerating area after fault clearance. If the accelerating area (A_accel)
        equals the maximum available decelerating area (A_decel), the machine is at the critical
        clearing angle.
      </p>

      <EqualAreaSVG />

      <p style={S.p}>
        The equal area criterion states: if A_accel \u2264 A_decel_max, the system is transiently stable.
        The critical clearing angle \u03B4_c is the maximum angle at which the fault can be cleared while
        still satisfying this energy balance. Faster fault clearance (lower \u03B4_c) provides a larger
        stability margin.
      </p>

      <h2 style={S.h2}>Salient-Pole vs Cylindrical-Rotor Machines</h2>
      <ul style={S.ul}>
        <li style={S.li}><strong>Cylindrical rotor:</strong> Steam turbine generators, gas turbines. High speed (3000 / 1500 rpm at 50 Hz). Uniform air-gap \u2192 Xd = Xq = Xs. Simple sine-wave P-\u03B4.</li>
        <li style={S.li}><strong>Salient pole:</strong> Hydro generators, diesel gensets. Low speed (100\u2013600 rpm). Non-uniform air-gap \u2192 Xd &gt; Xq. The reluctance term adds power and shifts the peak to \u03B4 &lt; 90\u00B0.</li>
        <li style={S.li}>The reluctance component exists even with zero excitation (Ef = 0), allowing limited power transfer through "reluctance torque" alone \u2014 used in switched reluctance motors.</li>
      </ul>

      <h2 style={S.h2}>Physical Meaning of \u03B4</h2>
      <p style={S.p}>
        \u03B4 is not just a mathematical angle \u2014 it represents the physical <em>lead of the rotor
        magnetic axis over the air-gap flux axis</em> (which rotates at synchronous speed \u03C9s).
        Both spin at \u03C9s in steady state; the difference in their instantaneous positions is \u03B4.
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong>No load (\u03B4 = 0\u00B0):</strong> Rotor and stator fields perfectly aligned. No torque transferred \u2014 only reactive power (if Ef \u2260 V).</li>
        <li style={S.li}><strong>Adding mechanical input:</strong> Governor opens steam/water valves \u2192 shaft accelerates momentarily \u2192 rotor pulls ahead \u2192 \u03B4 increases \u2192 opposing electromagnetic torque rises \u2192 new equilibrium at higher \u03B4 and higher P.</li>
        <li style={S.li}><strong>Pole slip:</strong> If mechanical input exceeds Pmax, the rotor cannot find equilibrium. It accelerates continuously relative to the stator field, slipping poles. The resulting current/torque oscillations are destructive \u2014 protection trips the machine within cycles.</li>
      </ul>

      <h2 style={S.h2}>Indian Power Grid Context</h2>
      <div style={S.ctx}>
        <span style={S.ctxT}>NTPC Operating Practice</span>
        <p style={S.ctxP}>
          Large NTPC thermal generators (500 MW, 660 MW units) typically operate at \u03B4 = 20\u201330\u00B0
          under normal dispatch, giving a stability margin of 65\u201378%. The governor droop setting
          of 4\u20135% (IEGC requirement) ensures that incremental load changes are shared
          proportionally; the corresponding P-\u03B4 operating point is adjusted automatically by
          Automatic Generation Control (AGC) through real-time set-point dispatch from the
          Regional Load Despatch Centres (RLDCs).
        </p>
      </div>
      <div style={{ ...S.ctx, borderLeftColor: '#ef4444', background: 'rgba(239,68,68,0.04)' }}>
        <span style={{ ...S.ctxT, color: '#f87171' }}>August 2012 Indian Grid Blackout</span>
        <p style={S.ctxP}>
          On 30\u201331 July 2012, the largest power outage in history struck India \u2014 620 million
          people lost electricity. Immediate cause: heavy overloading of inter-regional transmission
          lines in the Northern Region grid. As line flows exceeded stability limits,
          generators began hitting their P-\u03B4 stability boundary sequentially. Each trip increased
          the load on the remaining machines, driving their \u03B4 values toward 90\u00B0 \u2014 exactly the
          scenario shown in this simulation. Cascading pole slips tripped the entire Northern,
          Eastern, and North-Eastern grids within minutes.
          <br /><br />
          The Enquiry Committee found that multiple utilities were drawing more power than their
          schedule (open access violations), the automatic Under-Frequency Load Shedding (UFLS)
          relays were not properly set, and several generators lacked adequate loss-of-field
          protection. This simulation shows exactly the mechanism: when Pm approaches Pmax and
          margin falls toward zero, one perturbation is enough.
        </p>
      </div>
      <div style={S.ctx}>
        <span style={S.ctxT}>IEGC Fault-Ride-Through Requirements</span>
        <p style={S.ctxP}>
          The Indian Electricity Grid Code (IEGC) requires synchronous generators above 10 MW
          to remain connected through voltage dips up to 15% lasting up to 200 ms, and to
          ride through specified fault events without losing synchronism. This effectively mandates
          a stability margin that ensures the equal-area criterion is satisfied for the defined
          contingency set \u2014 the generator's \u03B4 trajectory must return to equilibrium after clearing.
        </p>
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}

/* ─────────────────────────── Root Component ─────────────────────────── */

export default function PowerAngleCurve() {
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
