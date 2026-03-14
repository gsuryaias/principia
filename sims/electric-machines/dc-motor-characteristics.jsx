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

const MOTORS = {
  shunt:        { label: 'Shunt',         color: '#22c55e', Ke: 1.5,  Ra: 0.5, type: 'shunt' },
  series:       { label: 'Series',        color: '#ef4444', Kse: 0.02, Ra: 0.8, type: 'series' },
  cumulative:   { label: 'Cum. Compound', color: '#3b82f6', Ke_sh: 1.3, Kse: 0.004, Ra: 0.6, type: 'cumulative' },
  differential: { label: 'Diff. Compound', color: '#f59e0b', Ke_sh: 1.3, Kse: 0.004, Ra: 0.6, type: 'differential' },
};

const APPS = {
  shunt: 'Lathes, Centrifugal pumps, Machine tools',
  series: 'Traction, Cranes, Hoists, Electric vehicles',
  cumulative: 'Rolling mills, Punch presses, Elevators',
  differential: 'Rarely used (unstable) — academic interest',
};

function computeCurves(V) {
  const step = 0.5, maxT = 65;
  const out = {};

  out.shunt = [];
  for (let T = 0.5; T <= maxT; T += step) {
    const Ia = T / MOTORS.shunt.Ke;
    const Eb = V - Ia * MOTORS.shunt.Ra;
    if (Eb <= 0) break;
    out.shunt.push({ t: T, n: (Eb / MOTORS.shunt.Ke) * 30 / Math.PI, ia: Ia });
  }

  out.series = [];
  for (let T = 1; T <= maxT; T += step) {
    const Ia = Math.sqrt(T / MOTORS.series.Kse);
    const phi = MOTORS.series.Kse * Ia;
    const Eb = V - Ia * MOTORS.series.Ra;
    if (Eb <= 0 || phi < 0.01) break;
    out.series.push({ t: T, n: (Eb / phi) * 30 / Math.PI, ia: Ia });
  }

  out.cumulative = [];
  for (let T = 0.5; T <= maxT; T += step) {
    const { Ke_sh, Kse, Ra } = MOTORS.cumulative;
    const disc = Ke_sh * Ke_sh + 4 * Kse * T;
    const Ia = (-Ke_sh + Math.sqrt(disc)) / (2 * Kse);
    if (Ia <= 0) continue;
    const phi = Ke_sh + Kse * Ia;
    const Eb = V - Ia * Ra;
    if (Eb <= 0) break;
    out.cumulative.push({ t: T, n: (Eb / phi) * 30 / Math.PI, ia: Ia });
  }

  out.differential = [];
  for (let T = 0.5; T <= maxT; T += step) {
    const { Ke_sh, Kse, Ra } = MOTORS.differential;
    const disc = Ke_sh * Ke_sh - 4 * Kse * T;
    if (disc < 0) break;
    const Ia = (Ke_sh - Math.sqrt(disc)) / (2 * Kse);
    if (Ia <= 0) continue;
    const phi = Ke_sh - Kse * Ia;
    if (phi <= 0.05) break;
    const Eb = V - Ia * Ra;
    if (Eb <= 0) break;
    out.differential.push({ t: T, n: (Eb / phi) * 30 / Math.PI, ia: Ia });
  }

  return out;
}

function interpolate(curve, T) {
  if (!curve || curve.length < 2) return null;
  for (let i = 0; i < curve.length - 1; i++) {
    if (curve[i].t <= T && curve[i + 1].t >= T) {
      const f = (T - curve[i].t) / (curve[i + 1].t - curve[i].t);
      return { t: T, n: curve[i].n + f * (curve[i + 1].n - curve[i].n), ia: curve[i].ia + f * (curve[i + 1].ia - curve[i].ia) };
    }
  }
  if (T <= curve[0].t) return curve[0];
  if (T >= curve[curve.length - 1].t) return curve[curve.length - 1];
  return null;
}

const PX = 80, PY = 40, PW = 510, PH = 260;

function Chart({ curves, show, TL, plotType, V }) {
  const allVisible = Object.keys(MOTORS).filter(k => show[k] && curves[k] && curves[k].length > 1);

  let T_MAX = 60, yMax = 1800, yLabel = 'Speed (rpm)', xLabel = 'Torque (Nm)';
  if (plotType === 'nt') {
    yMax = 3500;
    yLabel = 'Speed N (rpm)';
    allVisible.forEach(k => curves[k].forEach(p => { if (p.n > yMax * 0.9) yMax = Math.ceil(p.n / 500) * 500; }));
    yMax = Math.min(yMax, 6000);
  } else if (plotType === 'nia') {
    yMax = 3500;
    T_MAX = 80;
    xLabel = 'Armature Current Ia (A)';
    yLabel = 'Speed N (rpm)';
    allVisible.forEach(k => curves[k].forEach(p => { if (p.ia > T_MAX * 0.9) T_MAX = Math.ceil(p.ia / 10) * 10; }));
  } else {
    yMax = 65;
    T_MAX = 80;
    xLabel = 'Armature Current Ia (A)';
    yLabel = 'Torque T (Nm)';
  }

  const sx = v => PX + (v / T_MAX) * PW;
  const sy = v => PY + PH - (Math.min(v, yMax) / yMax) * PH;

  const getX = (p) => plotType === 'nt' ? p.t : p.ia;
  const getY = (p) => plotType === 'tia' ? p.t : p.n;

  const curvePath = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(getX(p)).toFixed(1)},${sy(getY(p)).toFixed(1)}`).join('');

  const yTicks = [];
  const yStep = plotType === 'tia' ? 10 : (yMax <= 2000 ? 500 : 1000);
  for (let v = 0; v <= yMax; v += yStep) yTicks.push(v);

  const xStep = plotType === 'nt' ? 10 : 10;
  const xTicks = [];
  for (let v = 0; v <= T_MAX; v += xStep) xTicks.push(v);

  const ops = {};
  allVisible.forEach(k => { ops[k] = interpolate(curves[k], TL); });

  return (
    <svg viewBox="0 0 960 370" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      <text x={(PX + PX + PW) / 2} y={22} textAnchor="middle" fill="#71717a" fontSize={13} fontWeight={600}>
        DC Motor {plotType === 'nt' ? 'Speed–Torque' : plotType === 'nia' ? 'Speed–Current' : 'Torque–Current'} Characteristics
      </text>

      {/* Grid */}
      {yTicks.map(v => <line key={`yg${v}`} x1={PX} y1={sy(v)} x2={PX + PW} y2={sy(v)} stroke="#1e1e2e" strokeWidth={1} />)}
      {xTicks.map(v => <line key={`xg${v}`} x1={sx(v)} y1={PY} x2={sx(v)} y2={PY + PH} stroke="#1e1e2e" strokeWidth={1} />)}

      {/* Axes */}
      <line x1={PX} y1={PY} x2={PX} y2={PY + PH} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={PX} y1={PY + PH} x2={PX + PW} y2={PY + PH} stroke="#3f3f46" strokeWidth={1.5} />

      {/* Tick labels */}
      {yTicks.map(v => <text key={`yl${v}`} x={PX - 8} y={sy(v) + 4} textAnchor="end" fill="#52525b" fontSize={9}>{v}</text>)}
      {xTicks.map(v => <text key={`xl${v}`} x={sx(v)} y={PY + PH + 16} textAnchor="middle" fill="#52525b" fontSize={9}>{v}</text>)}

      {/* Axis labels */}
      <text x={(PX + PX + PW) / 2} y={PY + PH + 34} textAnchor="middle" fill="#71717a" fontSize={11}>{xLabel}</text>
      <text x={18} y={(PY + PY + PH) / 2} textAnchor="middle" fill="#71717a" fontSize={11} transform={`rotate(-90, 18, ${(PY + PY + PH) / 2})`}>{yLabel}</text>

      {/* Series motor danger zone */}
      {show.series && plotType === 'nt' && (
        <rect x={PX} y={PY} width={sx(8) - PX} height={PH} fill="rgba(239,68,68,0.04)" />
      )}
      {show.series && plotType === 'nt' && (
        <text x={sx(4)} y={PY + 20} textAnchor="middle" fill="#ef4444" fontSize={8} opacity={0.6}>RUNAWAY ZONE</text>
      )}

      {/* Curves */}
      {allVisible.map(k => (
        <path key={k} d={curvePath(curves[k])} fill="none" stroke={MOTORS[k].color} strokeWidth={2.5} opacity={0.85} />
      ))}

      {/* Load torque line (only for N vs T plot) */}
      {plotType === 'nt' && (
        <line x1={sx(TL)} y1={PY} x2={sx(TL)} y2={PY + PH} stroke="#6366f1" strokeWidth={1} strokeDasharray="6 4" opacity={0.5} />
      )}

      {/* Operating points */}
      {plotType === 'nt' && allVisible.map(k => {
        const op = ops[k];
        if (!op) return null;
        return (
          <g key={`op${k}`}>
            <circle cx={sx(op.t)} cy={sy(op.n)} r={6} fill="none" stroke={MOTORS[k].color} strokeWidth={2} />
            <circle cx={sx(op.t)} cy={sy(op.n)} r={3} fill={MOTORS[k].color} />
            <text x={sx(op.t) + 10} y={sy(op.n) - 8} fill={MOTORS[k].color} fontSize={9} fontWeight={600}>{op.n.toFixed(0)} rpm</text>
          </g>
        );
      })}

      {/* ── Right Info Panel ── */}
      <line x1={615} y1={PY - 5} x2={615} y2={PY + PH + 10} stroke="#1e1e2e" strokeWidth={1} />

      {/* Motor type legend */}
      <text x={635} y={55} fill="#71717a" fontSize={12} fontWeight={600}>Motor Types</text>
      {Object.entries(MOTORS).map(([k, m], i) => (
        <g key={k} opacity={show[k] ? 1 : 0.35}>
          <line x1={635} y1={78 + i * 28} x2={660} y2={78 + i * 28} stroke={m.color} strokeWidth={3} strokeLinecap="round" />
          <text x={668} y={82 + i * 28} fill={show[k] ? m.color : '#52525b'} fontSize={11} fontWeight={500}>{m.label}</text>
        </g>
      ))}

      {/* Operating point data */}
      <text x={635} y={202} fill="#71717a" fontSize={11} fontWeight={600}>At T = {TL} Nm</text>
      {allVisible.map((k, i) => {
        const op = ops[k];
        if (!op) return null;
        return (
          <g key={`info${k}`}>
            <text x={640} y={222 + i * 18} fill={MOTORS[k].color} fontSize={10}>
              {MOTORS[k].label}: {op.n.toFixed(0)} rpm, {op.ia.toFixed(1)} A
            </text>
          </g>
        );
      })}

      {/* Speed regulation */}
      {plotType === 'nt' && allVisible.includes('shunt') && curves.shunt.length > 2 && (
        <g>
          <text x={635} y={300} fill="#71717a" fontSize={10} fontWeight={600}>Speed Regulation</text>
          {allVisible.filter(k => curves[k].length > 2).map((k, i) => {
            const n0 = curves[k][0].n;
            const nfl = ops[k] ? ops[k].n : curves[k][curves[k].length - 1].n;
            const reg = n0 > 0 ? ((n0 - nfl) / nfl * 100) : 0;
            return <text key={`sr${k}`} x={640} y={318 + i * 16} fill={MOTORS[k].color} fontSize={9}>{MOTORS[k].label}: {reg.toFixed(1)}%</text>;
          })}
        </g>
      )}

      {/* Application labels */}
      <text x={635} y={PY + PH - 10} fill="#71717a" fontSize={10} fontWeight={600}>Applications</text>
      {allVisible.slice(0, 3).map((k, i) => (
        <text key={`app${k}`} x={640} y={PY + PH + 8 + i * 14} fill="#52525b" fontSize={8}>{MOTORS[k].label}: {APPS[k]}</text>
      ))}
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>DC Motor Types — Speed-Torque Characteristics</h2>
      <p style={S.p}>
        DC motors are classified by the way their field winding is connected relative to the
        armature winding. This connection determines the relationship between flux, current,
        and load — and therefore the shape of the speed-torque characteristic.
      </p>

      <h3 style={S.h3}>Shunt Motor (Separately Excited / Shunt-Connected)</h3>
      <p style={S.p}>
        The field winding is connected in parallel with the armature (or excited by a separate
        source). Since the field voltage is constant, the field current and therefore flux φ
        are approximately constant regardless of load:
      </p>
      <div style={S.eq}>N = (V − Ia·Ra) / Kφ</div>
      <p style={S.p}>
        Since φ is constant, the only term that varies with load is the Ia·Ra drop. For typical
        motors Ra is small, so the speed drops only slightly from no-load to full-load — typically
        3–5% regulation. The speed-torque curve is a nearly flat, slightly drooping line.
      </p>
      <div style={S.ctx}>
        <span style={S.ctxT}>Shunt Motor — Constant Speed Machine</span>
        <p style={S.ctxP}>
          The shunt motor is essentially a constant-speed machine. At no load, Ia ≈ 0 and N = V/Kφ.
          When load increases, more current flows (Ia = T/Kφ), Eb drops slightly, and speed
          decreases marginally. This self-regulating behavior makes it ideal for machine tools,
          lathes, and centrifugal pumps where constant speed is desired.
        </p>
      </div>

      <h3 style={S.h3}>Series Motor</h3>
      <p style={S.p}>
        The field winding is in series with the armature, so the field current equals the
        armature current: If = Ia. In the unsaturated region, flux is proportional to
        armature current: φ = Kse × Ia. This gives:
      </p>
      <div style={S.eq}>T = Kse × Ia²    (parabolic torque-current relationship)</div>
      <div style={S.eq}>N = (V − Ia(Ra+Rse)) / (Kse × Ia)</div>
      <p style={S.p}>
        At light load: Ia is small → φ is small → speed is very high. As Ia → 0, speed → ∞.
        This is the <strong style={{ color: '#ef4444' }}>runaway problem</strong> — a series motor
        must <em>never</em> be operated without mechanical load, or the speed will increase
        destructively. Belts or couplings that might slip are not acceptable.
      </p>
      <p style={S.p}>
        At heavy load: Ia is large → φ is large → speed drops rapidly. The series motor provides
        enormous starting torque (T ∝ Ia²) and naturally slows under heavy load, making it
        ideal for traction (trains, electric vehicles), cranes, and hoists where high starting
        torque and variable speed under load are needed.
      </p>

      <h3 style={S.h3}>Compound Motors</h3>
      <p style={S.p}>
        Compound motors have both a shunt and a series field winding. The total flux is:
      </p>
      <div style={S.eq}>φ = φ_shunt ± φ_series = Ke_sh·Ish ± Kse·Ia</div>

      <p style={S.p}>
        <strong style={{ color: '#3b82f6' }}>Cumulative compound</strong> (+): The series
        field adds to the shunt field. As load increases, total flux increases, causing speed
        to drop more than a pure shunt motor but less than a pure series motor. It provides
        a compromise: better starting torque than a shunt motor, and no runaway risk at no load
        (the shunt field maintains a minimum flux). Used for rolling mills, punch presses,
        and elevators.
      </p>
      <p style={S.p}>
        <strong style={{ color: '#f59e0b' }}>Differential compound</strong> (−): The series
        field opposes the shunt field. As load increases, total flux <em>decreases</em>,
        causing speed to <em>increase</em> — this is inherently unstable. The motor can
        enter a positive feedback loop: more load → less flux → higher speed → more current
        → even less flux. This makes it dangerous and it is rarely used in practice.
      </p>

      <h3 style={S.h3}>Speed Regulation</h3>
      <div style={S.eq}>Speed Regulation = (N_no-load − N_full-load) / N_full-load × 100%</div>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Motor Type</th>
            <th style={S.th}>Speed Regulation</th>
            <th style={S.th}>Characteristic</th>
            <th style={S.th}>Starting Torque</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Shunt', '3–5%', 'Nearly constant speed', 'Moderate (∝ Ia)'],
            ['Series', '15–25% (steep drop)', 'Highly variable', 'Very high (∝ Ia²)'],
            ['Cum. Compound', '7–15%', 'Moderate drop', 'High'],
            ['Diff. Compound', 'Negative (unstable)', 'Speed rises with load', 'Low (opposing flux)'],
          ].map(([type, reg, char, st]) => (
            <tr key={type}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{type}</td>
              <td style={S.td}>{reg}</td>
              <td style={S.td}>{char}</td>
              <td style={S.td}>{st}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>Application Matching</h3>
      <p style={S.p}>
        The load characteristic determines the motor choice:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#22c55e' }}>Constant-torque loads</strong> (conveyors, hoists): Shunt or cumulative compound — speed remains stable.</li>
        <li style={S.li}><strong style={{ color: '#ef4444' }}>High starting torque loads</strong> (traction, cranes): Series — T ∝ Ia² provides massive breakaway torque, and natural speed reduction under load prevents excessive current.</li>
        <li style={S.li}><strong style={{ color: '#3b82f6' }}>Intermittent heavy loads</strong> (rolling mills, punch presses): Cumulative compound — handles torque surges while maintaining reasonable speed regulation.</li>
        <li style={S.li}><strong style={{ color: '#a1a1aa' }}>Fan/pump loads</strong> (T ∝ N²): Shunt — the load torque drops with speed, providing natural self-regulation.</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>Why Series Motors Dominate Traction</span>
        <p style={S.ctxP}>
          Indian Railways' WAG-5 and WAG-7 electric locomotives used series DC traction motors
          for decades. The series motor's natural characteristic — high torque at low speed for
          starting heavy trains, and lower torque at high speed for cruising — perfectly matches
          the traction load profile. The T ∝ 1/N² characteristic means the motor naturally
          delivers maximum torque during acceleration (when N is low) and reduces current at
          cruise speed. Modern locomotives (WAP-7, WAG-9) have transitioned to 3-phase AC
          induction motors with VVVF drives, but the traction characteristic is electronically
          shaped to mimic the favorable series motor behavior.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Chapman, S.J. — <em>Electric Machinery Fundamentals</em>, 5th Edition, McGraw-Hill</li>
        <li style={S.li}>Fitzgerald, Kingsley, Umans — <em>Electric Machinery</em>, 7th Edition</li>
        <li style={S.li}>Theraja, B.L. — <em>A Textbook of Electrical Technology Vol. II</em>, S. Chand</li>
        <li style={S.li}>IS 4722 — Rotating Electrical Machines — AC and DC Motors</li>
      </ul>
    </div>
  );
}

const btnS = (active, color) => ({
  padding: '5px 14px', borderRadius: 8,
  border: active ? `1px solid ${color}` : '1px solid #27272a',
  background: active ? `${color}18` : 'transparent',
  color: active ? color : '#52525b',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
});

export default function DCMotorCharacteristics() {
  const [tab, setTab] = useState('simulate');
  const [V, setV] = useState(220);
  const [TL, setTL] = useState(20);
  const [plotType, setPlotType] = useState('nt');
  const [show, setShow] = useState({ shunt: true, series: true, cumulative: true, differential: true });

  const curves = useMemo(() => computeCurves(V), [V]);

  const toggle = (k) => setShow(s => ({ ...s, [k]: !s[k] }));

  const ops = {};
  Object.keys(MOTORS).forEach(k => { if (show[k]) ops[k] = interpolate(curves[k], TL); });

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Chart curves={curves} show={show} TL={TL} plotType={plotType} V={V} />
          </div>

          <div style={S.results}>
            {Object.keys(MOTORS).filter(k => show[k] && ops[k]).map(k => (
              <div key={k} style={S.ri}>
                <span style={S.rl}>{MOTORS[k].label}</span>
                <span style={{ ...S.rv, color: MOTORS[k].color }}>{ops[k].n.toFixed(0)} rpm / {ops[k].ia.toFixed(1)} A</span>
              </div>
            ))}
            <div style={S.ri}>
              <span style={S.rl}>Load Torque</span>
              <span style={{ ...S.rv, color: '#c4b5fd' }}>{TL} Nm</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Supply</span>
              <span style={{ ...S.rv, color: '#e4e4e7' }}>{V} V</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Voltage (V)</span>
              <input type="range" min={100} max={250} step={5} value={V} onChange={e => setV(+e.target.value)} style={S.slider} />
              <span style={S.val}>{V} V</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Load Torque (Nm)</span>
              <input type="range" min={2} max={60} step={1} value={TL} onChange={e => setTL(+e.target.value)} style={S.slider} />
              <span style={S.val}>{TL} Nm</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Plot</span>
              <button style={btnS(plotType === 'nt', '#6366f1')} onClick={() => setPlotType('nt')}>N vs T</button>
              <button style={btnS(plotType === 'nia', '#6366f1')} onClick={() => setPlotType('nia')}>N vs Ia</button>
              <button style={btnS(plotType === 'tia', '#6366f1')} onClick={() => setPlotType('tia')}>T vs Ia</button>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Motors</span>
              {Object.entries(MOTORS).map(([k, m]) => (
                <button key={k} style={btnS(show[k], m.color)} onClick={() => toggle(k)}>{m.label}</button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
