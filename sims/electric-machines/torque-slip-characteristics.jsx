import React, { useMemo, useState } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 },
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
  eq: { display: 'block', padding: '14px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontFamily: 'monospace', fontSize: 15, color: '#c4b5fd', margin: '16px 0', textAlign: 'center', overflowX: 'auto' },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14, display: 'block' },
  ctxP: { fontSize: 14, lineHeight: 1.7, color: '#a1a1aa', margin: 0 },
};

const BASE = { R1: 0.6, X1: 1.1, R2: 0.45, X2: 1.1, Xm: 28, poles: 4, fBase: 50, VBase: 415 };
const SQRT3 = Math.sqrt(3);

const cAdd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const cMul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cDiv = (a, b) => {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
const cAbs = (a) => Math.hypot(a[0], a[1]);

function torqueAtSlip(slip, Vll, rotorMultiplier, freq) {
  const s = Math.abs(slip) < 1e-4 ? (slip >= 0 ? 1e-4 : -1e-4) : slip;
  const scale = freq / BASE.fBase;
  const X1 = BASE.X1 * scale;
  const X2 = BASE.X2 * scale;
  const Xm = BASE.Xm * scale;
  const Z1 = [BASE.R1, X1];
  const Zm = [0, Xm];
  const Zsum = cAdd(Z1, Zm);
  const Vth = cMul([Vll / SQRT3, 0], cDiv(Zm, Zsum));
  const Zth = cDiv(cMul(Z1, Zm), Zsum);
  const R2e = BASE.R2 * rotorMultiplier;
  const ws = (4 * Math.PI * freq) / BASE.poles;
  const rOverS = R2e / s;
  const denom = (Zth[0] + rOverS) ** 2 + (Zth[1] + X2) ** 2;
  return (3 * cAbs(Vth) ** 2 * rOverS) / (ws * denom);
}

function buildCurve(Vll, rotorMultiplier, freq) {
  const samples = [];
  for (let i = 0; i <= 300; i += 1) {
    const s = -1 + i * (3 / 300);
    samples.push({ s, T: torqueAtSlip(s, Vll, rotorMultiplier, freq) });
  }
  const motoring = samples.filter((p) => p.s > 0 && p.s < 1);
  const tMax = motoring.reduce((best, p) => (p.T > best.T ? p : best), motoring[0]);
  return { samples, tMax };
}

const BASE_CURVE = buildCurve(BASE.VBase, 1, BASE.fBase);
const LOAD_TORQUE = BASE_CURVE.tMax.T * 0.38;

function solveOperatingPoint(curve, freq) {
  const motoring = curve.samples.filter((p) => p.s > 0.001 && p.s < 1);
  let best = motoring[0];
  for (const point of motoring) {
    if (Math.abs(point.T - LOAD_TORQUE) < Math.abs(best.T - LOAD_TORQUE)) best = point;
  }
  const ns = (120 * freq) / BASE.poles;
  return { ...best, ns, speed: ns * (1 - best.s) };
}

function Diagram({ curve, operating, freq }) {
  const W = 980;
  const H = 420;
  const ML = 70;
  const MR = 28;
  const MT = 38;
  const MB = 56;
  const PW = W - ML - MR;
  const PH = H - MT - MB;
  const tMin = Math.min(...curve.samples.map((p) => p.T));
  const tMax = Math.max(...curve.samples.map((p) => p.T), LOAD_TORQUE);
  const yS = (t) => MT + PH - ((t - tMin) / (tMax - tMin)) * PH;
  const xS = (s) => ML + ((s + 1) / 3) * PW;
  const path = curve.samples.map((p, i) => `${i === 0 ? 'M' : 'L'}${xS(p.s).toFixed(1)},${yS(p.T).toFixed(1)}`).join(' ');
  const ns = (120 * freq) / BASE.poles;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <rect x={xS(-1)} y={MT} width={xS(0) - xS(-1)} height={PH} fill="#0f172a" opacity="0.45" />
      <rect x={xS(0)} y={MT} width={xS(1) - xS(0)} height={PH} fill="#052e16" opacity="0.35" />
      <rect x={xS(1)} y={MT} width={xS(2) - xS(1)} height={PH} fill="#3f0d12" opacity="0.26" />

      {[ -1, -0.5, 0, 0.5, 1, 1.5, 2 ].map((s) => (
        <g key={s}>
          <line x1={xS(s)} y1={MT} x2={xS(s)} y2={MT + PH} stroke="#1f2937" strokeWidth="0.7" />
          <text x={xS(s)} y={MT + PH + 18} textAnchor="middle" fontSize="9" fill="#52525b">{s.toFixed(1)}</text>
        </g>
      ))}
      {Array.from({ length: 6 }, (_, i) => tMin + ((tMax - tMin) * i) / 5).map((t) => (
        <g key={t}>
          <line x1={ML} y1={yS(t)} x2={ML + PW} y2={yS(t)} stroke="#1f2937" strokeWidth="0.7" />
          <text x={ML - 8} y={yS(t) + 4} textAnchor="end" fontSize="9" fill="#52525b">{t.toFixed(0)}</text>
        </g>
      ))}

      <line x1={ML} y1={yS(0)} x2={ML + PW} y2={yS(0)} stroke="#52525b" strokeWidth="1" />
      <path d={path} fill="none" stroke="#a78bfa" strokeWidth="3" />
      <line x1={ML} y1={yS(LOAD_TORQUE)} x2={ML + PW} y2={yS(LOAD_TORQUE)} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6 4" />
      <circle cx={xS(operating.s)} cy={yS(operating.T)} r="6" fill="#22c55e" />
      <text x={xS(operating.s) + 10} y={yS(operating.T) - 10} fill="#22c55e" fontSize="11" fontWeight="700">
        Operating point
      </text>
      <circle cx={xS(curve.tMax.s)} cy={yS(curve.tMax.T)} r="5" fill="#ef4444" />
      <text x={xS(curve.tMax.s) + 10} y={yS(curve.tMax.T) + 4} fill="#ef4444" fontSize="11" fontWeight="700">
        Tmax
      </text>

      <text x={xS(-0.5)} y={MT + 18} textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="700">Generating</text>
      <text x={xS(0.5)} y={MT + 18} textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="700">Motoring</text>
      <text x={xS(1.5)} y={MT + 18} textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="700">Plugging / Braking</text>

      <text x={W / 2} y={H - 14} textAnchor="middle" fill="#71717a" fontSize="10">Slip, s</text>
      <text x={16} y={H / 2} textAnchor="middle" fill="#71717a" fontSize="10" transform={`rotate(-90 16 ${H / 2})`}>Torque (N·m)</text>

      <g transform="translate(680,52)">
        <rect width="250" height="88" rx="10" fill="#101015" stroke="#27272a" />
        <text x="14" y="22" fill="#a1a1aa" fontSize="11">Ns = {ns.toFixed(0)} rpm</text>
        <text x="14" y="40" fill="#a1a1aa" fontSize="11">N = Ns (1 - s) = {operating.speed.toFixed(0)} rpm</text>
        <text x="14" y="58" fill="#a1a1aa" fontSize="11">Load torque line = {LOAD_TORQUE.toFixed(1)} N·m</text>
        <text x="14" y="76" fill="#c4b5fd" fontSize="11" fontFamily="monospace">T proportional to V^2, smax proportional to R2</text>
      </g>
    </svg>
  );
}

export default function TorqueSlipCharacteristics() {
  const [tab, setTab] = useState('sim');
  const [Vll, setVll] = useState(415);
  const [rotorMultiplier, setRotorMultiplier] = useState(1);
  const [freq, setFreq] = useState(50);

  const curve = useMemo(() => buildCurve(Vll, rotorMultiplier, freq), [Vll, rotorMultiplier, freq]);
  const operating = useMemo(() => solveOperatingPoint(curve, freq), [curve, freq]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'sim')} onClick={() => setTab('sim')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'sim' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram curve={curve} operating={operating} freq={freq} />
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Voltage</span>
              <input style={S.slider} type="range" min="220" max="460" step="1" value={Vll} onChange={(e) => setVll(Number(e.target.value))} />
              <span style={S.val}>{Vll.toFixed(0)} V</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Rotor resistance</span>
              <input style={S.slider} type="range" min="0.5" max="3" step="0.01" value={rotorMultiplier} onChange={(e) => setRotorMultiplier(Number(e.target.value))} />
              <span style={S.val}>{rotorMultiplier.toFixed(2)} x</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Frequency</span>
              <input style={S.slider} type="range" min="20" max="60" step="1" value={freq} onChange={(e) => setFreq(Number(e.target.value))} />
              <span style={S.val}>{freq.toFixed(0)} Hz</span>
            </div>
          </div>

          <div style={S.results}>
            <div style={S.ri}><span style={S.rl}>Pull-out torque</span><span style={S.rv}>{curve.tMax.T.toFixed(1)} N·m</span></div>
            <div style={S.ri}><span style={S.rl}>Slip at Tmax</span><span style={S.rv}>{curve.tMax.s.toFixed(3)}</span></div>
            <div style={S.ri}><span style={S.rl}>Operating slip</span><span style={S.rv}>{operating.s.toFixed(3)}</span></div>
            <div style={S.ri}><span style={S.rl}>Operating speed</span><span style={S.rv}>{operating.speed.toFixed(0)} rpm</span></div>
            <div style={S.ri}><span style={S.rl}>Synchronous speed</span><span style={S.rv}>{operating.ns.toFixed(0)} rpm</span></div>
          </div>

          <div style={S.strip}>
            <div style={S.box}>
              <span style={S.boxT}>Region meaning</span>
              <span style={S.boxV}>s &lt; 0: generating{'\n'}0 &lt; s &lt; 1: motoring{'\n'}1 &lt; s &lt; 2: plugging</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Voltage effect</span>
              <span style={S.boxV}>Tstart and Tmax both scale approximately with V^2.{'\n'}Reducing voltage depresses the whole curve.</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Rotor resistance effect</span>
              <span style={S.boxV}>Increasing R2 shifts the peak to higher slip.{'\n'}Tmax changes little, but it occurs at lower speed.</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={S.theory}>
          <h2 style={S.h2}>Torque-Slip Characteristic Of The Induction Motor</h2>
          <p style={S.p}>
            The torque-slip characteristic is the central steady-state performance curve of the induction motor. It shows how torque varies with rotor speed relative to synchronous speed.
            The same curve explains starting torque, pull-out torque, normal operating slip, generating operation, and plugging.
          </p>

          <span style={S.eq}>T = 3 |Vth|^2 (R2 / s) / [omega_sync ((Rth + R2 / s)^2 + (Xth + X2)^2)]</span>
          <span style={S.eq}>smax = R2 / sqrt(Rth^2 + (Xth + X2)^2)</span>

          <h2 style={S.h2}>Operating Regions</h2>
          <ul style={S.ul}>
            <li style={S.li}><strong style={{ color: '#93c5fd' }}>s &lt; 0</strong> — generating region. Rotor speed exceeds synchronous speed and mechanical power is converted into electrical power.</li>
            <li style={S.li}><strong style={{ color: '#86efac' }}>0 &lt; s &lt; 1</strong> — motoring region. This is the normal induction-motor operating range.</li>
            <li style={S.li}><strong style={{ color: '#fca5a5' }}>1 &lt; s &lt; 2</strong> — plugging region. Reversing phase sequence while the rotor is moving makes slip exceed unity and produces strong braking torque.</li>
          </ul>

          <h2 style={S.h2}>Characteristic Features</h2>
          <h3 style={S.h3}>Low-slip region</h3>
          <p style={S.p}>
            For small slip, rotor reactance is small compared with R2/s, and torque is approximately proportional to slip.
            This is why the induction motor behaves like a nearly linear speed-regulated machine around rated operating point.
          </p>
          <span style={S.eq}>For small s: T proportional to s</span>

          <h3 style={S.h3}>High-slip region</h3>
          <p style={S.p}>
            At high slip, the leakage reactance dominates and torque becomes inversely proportional to slip. That is why the curve rises, reaches a maximum, and then falls.
          </p>
          <span style={S.eq}>For large s: T proportional to 1 / s</span>

          <h3 style={S.h3}>Maximum or pull-out torque</h3>
          <p style={S.p}>
            The peak of the curve is called breakdown torque or pull-out torque. If the load demands more than this, the motor cannot remain in steady operation and will decelerate toward stall.
          </p>

          <h2 style={S.h2}>Engineering Reading</h2>
          <h3 style={S.h3}>Voltage control</h3>
          <p style={S.p}>
            Since torque is approximately proportional to the square of stator voltage, reducing voltage lowers starting torque and pull-out torque strongly. That is why undervoltage conditions can cause stalling under the same mechanical load.
          </p>

          <h3 style={S.h3}>Rotor resistance control</h3>
          <p style={S.p}>
            Increasing rotor resistance shifts the maximum-torque point to higher slip. Slip-ring motors exploit this during starting because they can develop high starting torque without drawing the very high inrush current of a directly started squirrel-cage motor.
          </p>

          <h3 style={S.h3}>Frequency effect</h3>
          <p style={S.p}>
            Increasing frequency raises synchronous speed and also increases leakage reactance. With fixed voltage, that usually reduces available torque.
            This is why practical VFD drives raise voltage together with frequency to keep the air-gap flux approximately constant.
          </p>

          <div style={S.ctx}>
            <span style={S.ctxT}>Assumptions Used Here</span>
            <p style={S.ctxP}>
              The curve uses a Thevenin-reduced stator network and constant parameters. Saturation, deep-bar effect, temperature rise, and frequency-dependent rotor resistance are neglected. The operating point is the intersection with a fixed load-torque line used only to give the moving dot a consistent physical meaning.
            </p>
          </div>

          <h2 style={S.h2}>References</h2>
          <ul style={S.ul}>
            <li style={S.li}>Chapman, S.J. — <em>Electric Machinery Fundamentals</em>, induction motor torque derivation</li>
            <li style={S.li}>Fitzgerald, Kingsley, Umans — <em>Electric Machinery</em>, torque-slip and Thevenin reduction</li>
            <li style={S.li}>P.S. Bimbhra — <em>Electrical Machinery</em></li>
            <li style={S.li}>B.L. Theraja and A.K. Theraja — <em>A Textbook of Electrical Technology, Vol. II</em></li>
          </ul>
        </div>
      )}
    </div>
  );
}
