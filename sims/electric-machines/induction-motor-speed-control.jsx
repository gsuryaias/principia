import React, { useMemo, useState } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 140, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 60, textAlign: 'right' },
  bg: { display: 'flex', gap: 6 },
  btn: (a) => ({ padding: '6px 12px', borderRadius: 8, border: a ? '1px solid #6366f1' : '1px solid #27272a', background: a ? 'rgba(99,102,241,0.18)' : 'transparent', color: a ? '#c4b5fd' : '#71717a', cursor: 'pointer', fontSize: 12, fontWeight: a ? 700 : 500 }),
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
  eq: { display: 'block', padding: '14px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontFamily: 'monospace', fontSize: 15, color: '#c4b5fd', margin: '16px 0', textAlign: 'center', overflowX: 'auto' },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14, display: 'block' },
  ctxP: { fontSize: 14, lineHeight: 1.7, color: '#a1a1aa', margin: 0 },
};

const BASE = { R1: 0.6, X1: 1.1, R2: 0.45, X2: 1.1, Xm: 28, poles: 4, V: 415, f: 50 };
const SQRT3 = Math.sqrt(3);
const METHODS = ['V/f', 'Rotor resistance', 'Cascade'];

const cAdd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const cMul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cDiv = (a, b) => {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
const cAbs = (a) => Math.hypot(a[0], a[1]);

function torqueAtSlip(s, Vll, freq, R2eff, poles) {
  const scale = freq / BASE.f;
  const X1 = BASE.X1 * scale;
  const X2 = BASE.X2 * scale;
  const Xm = BASE.Xm * scale;
  const Z1 = [BASE.R1, X1];
  const Zm = [0, Xm];
  const Zsum = cAdd(Z1, Zm);
  const Vth = cMul([Vll / SQRT3, 0], cDiv(Zm, Zsum));
  const Zth = cDiv(cMul(Z1, Zm), Zsum);
  const ws = (4 * Math.PI * freq) / poles;
  const slip = Math.max(s, 1e-4);
  const rOverS = R2eff / slip;
  const denom = (Zth[0] + rOverS) ** 2 + (Zth[1] + X2) ** 2;
  return (3 * cAbs(Vth) ** 2 * rOverS) / (ws * denom);
}

function buildMethodCurve(method, param) {
  let freq = BASE.f;
  let Vll = BASE.V;
  let R2eff = BASE.R2;
  let poles = BASE.poles;
  let note = '';

  if (method === 'V/f') {
    freq = param;
    Vll = BASE.V * (freq / BASE.f);
    note = 'Flux held approximately constant below base speed.';
  } else if (method === 'Rotor resistance') {
    R2eff = BASE.R2 + param;
    note = 'External rotor resistance increases operating slip.';
  } else {
    poles = BASE.poles + param;
    Vll = BASE.V * 0.92;
    note = 'Ideal cumulative cascade, coupling losses neglected.';
  }

  const ns = (120 * freq) / poles;
  const samples = [];
  for (let i = 0; i <= 220; i += 1) {
    const speed = (i / 220) * 1500;
    const slip = Math.max((ns - speed) / ns, 0.001);
    const torque = speed > ns ? 0 : torqueAtSlip(slip, Vll, freq, R2eff, poles);
    samples.push({ speed, torque, slip });
  }
  const maxTorque = Math.max(...samples.map((p) => p.torque));
  const loadTorque = maxTorque * 0.42;
  let operating = samples[0];
  for (const point of samples.filter((p) => p.speed <= ns)) {
    if (Math.abs(point.torque - loadTorque) < Math.abs(operating.torque - loadTorque)) operating = point;
  }

  return { method, param, freq, Vll, R2eff, poles, ns, samples, loadTorque, operating, note };
}

function Diagram({ curves, activeMethod }) {
  const W = 980;
  const H = 420;
  const ML = 70;
  const MR = 24;
  const MT = 36;
  const MB = 56;
  const PW = W - ML - MR;
  const PH = H - MT - MB;
  const maxTorque = Math.max(...curves.flatMap((c) => c.samples.map((p) => p.torque))) * 1.05;
  const xS = (n) => ML + (n / 1500) * PW;
  const yS = (t) => MT + PH - (t / maxTorque) * PH;
  const colors = { 'V/f': '#22c55e', 'Rotor resistance': '#f59e0b', Cascade: '#60a5fa' };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      {[0, 300, 600, 900, 1200, 1500].map((n) => (
        <g key={n}>
          <line x1={xS(n)} y1={MT} x2={xS(n)} y2={MT + PH} stroke="#1f2937" strokeWidth="0.7" />
          <text x={xS(n)} y={MT + PH + 18} textAnchor="middle" fill="#52525b" fontSize="9">{n}</text>
        </g>
      ))}
      {Array.from({ length: 6 }, (_, i) => (maxTorque * i) / 5).map((t) => (
        <g key={t}>
          <line x1={ML} y1={yS(t)} x2={ML + PW} y2={yS(t)} stroke="#1f2937" strokeWidth="0.7" />
          <text x={ML - 8} y={yS(t) + 4} textAnchor="end" fill="#52525b" fontSize="9">{t.toFixed(0)}</text>
        </g>
      ))}

      {curves.map((curve) => {
        const active = curve.method === activeMethod;
        const d = curve.samples.map((p, i) => `${i === 0 ? 'M' : 'L'}${xS(p.speed).toFixed(1)},${yS(p.torque).toFixed(1)}`).join(' ');
        return (
          <g key={curve.method}>
            <path d={d} fill="none" stroke={colors[curve.method]} strokeWidth={active ? 3.2 : 1.7} opacity={active ? 1 : 0.45} />
            <line x1={ML} y1={yS(curve.loadTorque)} x2={xS(curve.ns)} y2={yS(curve.loadTorque)} stroke={colors[curve.method]} strokeDasharray="4 4" strokeWidth="1" opacity={active ? 0.7 : 0.25} />
            <circle cx={xS(curve.operating.speed)} cy={yS(curve.operating.torque)} r={active ? 6 : 4} fill={colors[curve.method]} />
            <line x1={xS(curve.ns)} y1={MT} x2={xS(curve.ns)} y2={MT + PH} stroke={colors[curve.method]} strokeDasharray="6 4" strokeWidth="1" opacity={active ? 0.85 : 0.35} />
          </g>
        );
      })}

      <text x={W / 2} y={H - 14} textAnchor="middle" fill="#71717a" fontSize="10">Speed (rpm)</text>
      <text x={16} y={H / 2} textAnchor="middle" fill="#71717a" fontSize="10" transform={`rotate(-90 16 ${H / 2})`}>Torque (N·m)</text>

      <g transform="translate(716,48)">
        <rect width="220" height="92" rx="10" fill="#101015" stroke="#27272a" />
        {METHODS.map((method, i) => (
          <g key={method} transform={`translate(14, ${18 + i * 22})`}>
            <rect width="12" height="12" rx="3" fill={colors[method]} opacity={method === activeMethod ? 1 : 0.55} />
            <text x="20" y="10" fill={method === activeMethod ? '#f4f4f5' : '#a1a1aa'} fontSize="11">{method}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function InductionMotorSpeedControl() {
  const [tab, setTab] = useState('sim');
  const [method, setMethod] = useState('V/f');
  const [vfFreq, setVfFreq] = useState(35);
  const [rExt, setRExt] = useState(0.5);
  const [cascadePoles, setCascadePoles] = useState(4);

  const curves = useMemo(
    () => [
      buildMethodCurve('V/f', vfFreq),
      buildMethodCurve('Rotor resistance', rExt),
      buildMethodCurve('Cascade', cascadePoles),
    ],
    [vfFreq, rExt, cascadePoles]
  );
  const active = curves.find((c) => c.method === method);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'sim')} onClick={() => setTab('sim')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'sim' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram curves={curves} activeMethod={method} />
          </div>

          <div style={S.controls}>
            <div style={S.bg}>
              {METHODS.map((m) => (
                <button key={m} style={S.btn(method === m)} onClick={() => setMethod(m)}>{m}</button>
              ))}
            </div>
            {method === 'V/f' && (
              <div style={S.cg}>
                <span style={S.label}>Command frequency</span>
                <input style={S.slider} type="range" min="15" max="50" step="1" value={vfFreq} onChange={(e) => setVfFreq(Number(e.target.value))} />
                <span style={S.val}>{vfFreq.toFixed(0)} Hz</span>
              </div>
            )}
            {method === 'Rotor resistance' && (
              <div style={S.cg}>
                <span style={S.label}>External rotor R</span>
                <input style={S.slider} type="range" min="0" max="1.5" step="0.01" value={rExt} onChange={(e) => setRExt(Number(e.target.value))} />
                <span style={S.val}>{rExt.toFixed(2)} ohm</span>
              </div>
            )}
            {method === 'Cascade' && (
              <div style={S.cg}>
                <span style={S.label}>Auxiliary motor poles</span>
                <input style={S.slider} type="range" min="2" max="8" step="2" value={cascadePoles} onChange={(e) => setCascadePoles(Number(e.target.value))} />
                <span style={S.val}>{cascadePoles.toFixed(0)}</span>
              </div>
            )}
          </div>

          <div style={S.results}>
            <div style={S.ri}><span style={S.rl}>Selected method</span><span style={S.rv}>{active.method}</span></div>
            <div style={S.ri}><span style={S.rl}>Synchronous speed</span><span style={S.rv}>{active.ns.toFixed(0)} rpm</span></div>
            <div style={S.ri}><span style={S.rl}>Operating speed</span><span style={S.rv}>{active.operating.speed.toFixed(0)} rpm</span></div>
            <div style={S.ri}><span style={S.rl}>Operating slip</span><span style={S.rv}>{active.operating.slip.toFixed(3)}</span></div>
            <div style={S.ri}><span style={S.rl}>Approx. max torque</span><span style={S.rv}>{Math.max(...active.samples.map((p) => p.torque)).toFixed(1)} N·m</span></div>
          </div>

          <div style={S.strip}>
            <div style={S.box}>
              <span style={S.boxT}>V/f control</span>
              <span style={S.boxV}>Best for squirrel-cage drives.{'\n'}Keeps air-gap flux nearly constant while changing synchronous speed.</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Rotor resistance</span>
              <span style={S.boxV}>Only for slip-ring motors.{'\n'}Good low-speed torque, poor efficiency because slip power is dissipated as heat.</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Cascade</span>
              <span style={S.boxV}>Discrete sub-synchronous speeds.{'\n'}Classical concatenation control using two coupled induction machines.</span>
            </div>
          </div>

          <div style={S.strip}>
            <div style={{ ...S.box, flexBasis: '100%' }}>
              <span style={S.boxT}>Selected method note</span>
              <span style={S.boxV}>{active.note}</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={S.theory}>
          <h2 style={S.h2}>Induction Motor Speed Control</h2>
          <p style={S.p}>
            The speed equation of the induction motor is:
          </p>
          <span style={S.eq}>N = Ns (1 - s), Ns = 120 f / P</span>
          <p style={S.p}>
            Therefore speed can be changed in two conceptually different ways:
            either change synchronous speed <strong style={{ color: '#e4e4e7' }}>Ns</strong> by changing frequency or pole number,
            or change slip <strong style={{ color: '#e4e4e7' }}>s</strong> for a given torque by altering rotor or slip-power conditions.
          </p>

          <h2 style={S.h2}>Method Comparison</h2>
          <h3 style={S.h3}>V/f control</h3>
          <p style={S.p}>
            This is the dominant industrial method because it retains good efficiency and wide speed range with electronic drives. Below base frequency the applied voltage is reduced in proportion to frequency so the air-gap flux stays roughly constant and the torque capability remains usable.
          </p>
          <span style={S.eq}>For constant flux: V / f = constant</span>
          <p style={S.p}>
            If frequency is reduced without reducing voltage, flux would rise and the machine would saturate. If voltage is reduced too much relative to frequency, flux falls and torque capability collapses.
          </p>

          <h3 style={S.h3}>Rotor resistance control</h3>
          <p style={S.p}>
            Adding external rotor resistance shifts the operating point to higher slip. Speed falls at the same torque, but the lost slip power becomes heat in the external resistance, so this method is inefficient except for short-duration control or starting.
          </p>
          <span style={S.eq}>Increasing R2 shifts smax to the right with little change in Tmax</span>

          <h3 style={S.h3}>Cascade control</h3>
          <p style={S.p}>
            In cumulative cascade, the rotor output of one motor feeds the stator of another, so the combined set runs at synchronous speed based on the sum of pole numbers. That creates a few discrete sub-synchronous operating speeds and was historically useful before variable-frequency drives became common.
          </p>
          <span style={S.eq}>Nc = 120 f / (P1 + P2)</span>

          <h2 style={S.h2}>What The Curves Mean</h2>
          <ul style={S.ul}>
            <li style={S.li}>Each colored curve is a torque-speed characteristic for one speed-control method.</li>
            <li style={S.li}>The dashed vertical marker indicates synchronous speed for that method.</li>
            <li style={S.li}>The operating point is the intersection of the method-specific torque curve with a representative load-torque line.</li>
            <li style={S.li}>Comparing the operating slip across methods shows why rotor-resistance control is lossy and why V/f control is preferred in modern drives.</li>
          </ul>

          <h2 style={S.h2}>Engineering Interpretation</h2>
          <h3 style={S.h3}>Why VFDs replaced classical methods</h3>
          <p style={S.p}>
            V/f control changes speed by changing synchronous speed itself rather than wasting power in slip.
            That preserves efficiency, reduces rotor heating, and gives a wide smooth control range, especially for squirrel-cage motors.
          </p>

          <h3 style={S.h3}>Why rotor resistance still matters academically</h3>
          <p style={S.p}>
            Slip-ring motors with external resistance remain the clearest physical example of slip control. They show directly that speed can be reduced by increasing rotor copper loss, which is useful pedagogically even though it is inefficient.
          </p>

          <h3 style={S.h3}>Why cascade is historically important</h3>
          <p style={S.p}>
            Cascade or concatenation control predates power electronic drives. It offered a practical way to obtain more than one stable sub-synchronous speed for large motors using electromechanical means alone.
          </p>

          <div style={S.ctx}>
            <span style={S.ctxT}>Assumptions Used Here</span>
            <p style={S.ctxP}>
              The plotted curves come from the classical steady-state torque equation. The cascade curve is shown with an idealized cumulative-cascade assumption and a small voltage reduction to keep the comparison qualitative but still anchored to the correct speed equation.
            </p>
          </div>

          <h2 style={S.h2}>References</h2>
          <ul style={S.ul}>
            <li style={S.li}>Chapman, S.J. — <em>Electric Machinery Fundamentals</em>, induction motor drives and speed control</li>
            <li style={S.li}>P.C. Sen — <em>Principles of Electric Machines and Power Electronics</em></li>
            <li style={S.li}>P.S. Bimbhra — <em>Electrical Machinery</em></li>
            <li style={S.li}>B.L. Theraja and A.K. Theraja — <em>A Textbook of Electrical Technology, Vol. II</em></li>
          </ul>
        </div>
      )}
    </div>
  );
}
