import React, { useMemo, useState } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 12, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 120, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 56, textAlign: 'right' },
  results: { display: 'flex', gap: 26, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  strip: { display: 'flex', gap: 12, padding: '12px 24px', background: '#0f0f12', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  box: { flex: '1 1 180px', padding: '12px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 10 },
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

const SQRT3 = Math.sqrt(3);

const cAdd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const cMul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cDiv = (a, b) => {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
const cAbs = (a) => Math.hypot(a[0], a[1]);
const cConj = (a) => [a[0], -a[1]];
const cParallel = (a, b) => cDiv(cMul(a, b), cAdd(a, b));

function compute(Vll, R1, X1, R2, X2, Xm, Rc, slip) {
  const s = Math.max(slip, 0.005);
  const Vph = Vll / SQRT3;
  const Z1 = [R1, X1];
  const Zm = cParallel([Rc, 0], [0, Xm]);
  const Z2 = [R2 / s, X2];
  const Zp = cParallel(Zm, Z2);
  const Zin = cAdd(Z1, Zp);
  const I1 = cDiv([Vph, 0], Zin);
  const Vgap = cMul(I1, Zp);
  const Icore = cDiv(Vgap, [Rc, 0]);
  const Imag = cDiv(Vgap, [0, Xm]);
  const Im = cAdd(Icore, Imag);
  const I2 = cDiv(Vgap, Z2);
  const Sin = cMul([3 * Vph, 0], cConj(I1));
  const Pin = Sin[0];
  const Qin = Sin[1];
  const Pscu = 3 * cAbs(I1) * cAbs(I1) * R1;
  const Pcore = 3 * cAbs(Vgap) * cAbs(Vgap) / Rc;
  const Pag = 3 * cAbs(I2) * cAbs(I2) * (R2 / s);
  const Prcu = 3 * cAbs(I2) * cAbs(I2) * R2;
  const Pconv = Pag - Prcu;
  const eta = Pin > 1 ? (Pconv / Pin) * 100 : 0;
  const pf = Pin / Math.max(Math.hypot(Pin, Qin), 1e-6);
  return {
    Vph,
    I1,
    Im,
    I2,
    Imag,
    Icore,
    Pin,
    Qin,
    Pscu,
    Pcore,
    Pag,
    Prcu,
    Pconv,
    eta,
    pf,
    Zin,
    s,
  };
}

function donutPath(cx, cy, r1, r2, a0, a1) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const x1o = cx + r2 * Math.cos(a0);
  const y1o = cy + r2 * Math.sin(a0);
  const x2o = cx + r2 * Math.cos(a1);
  const y2o = cy + r2 * Math.sin(a1);
  const x1i = cx + r1 * Math.cos(a1);
  const y1i = cy + r1 * Math.sin(a1);
  const x2i = cx + r1 * Math.cos(a0);
  const y2i = cy + r1 * Math.sin(a0);
  return `M${x1o},${y1o} A${r2},${r2} 0 ${large} 1 ${x2o},${y2o} L${x1i},${y1i} A${r1},${r1} 0 ${large} 0 ${x2i},${y2i} Z`;
}

function Diagram({ data }) {
  const W = 980;
  const H = 400;
  const vals = [
    { label: 'Stator Cu', value: Math.max(data.Pscu, 0), color: '#ef4444' },
    { label: 'Core loss', value: Math.max(data.Pcore, 0), color: '#3b82f6' },
    { label: 'Rotor Cu', value: Math.max(data.Prcu, 0), color: '#f59e0b' },
    { label: 'Converted', value: Math.max(data.Pconv, 0), color: '#22c55e' },
  ];
  const total = vals.reduce((s, v) => s + v.value, 0) || 1;
  let a = -Math.PI / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <defs>
        <marker id="arrow-pf" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <polygon points="0,0 10,5 0,10" fill="#818cf8" />
        </marker>
      </defs>

      <text x="300" y="34" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="700" letterSpacing="0.07em">
        PER-PHASE APPROXIMATE EQUIVALENT CIRCUIT
      </text>
      <line x1="86" y1="178" x2="150" y2="178" stroke="#d4d4d8" strokeWidth="2" />
      <circle cx="76" cy="178" r="10" fill="none" stroke="#6366f1" strokeWidth="2" />
      <text x="76" y="183" textAnchor="middle" fill="#a5b4fc" fontSize="10">V</text>

      <rect x="150" y="158" width="72" height="40" rx="8" fill="#111114" stroke="#ef4444" />
      <text x="186" y="182" textAnchor="middle" fill="#ef4444" fontSize="12" fontWeight="700">R1</text>
      <rect x="240" y="158" width="72" height="40" rx="8" fill="#111114" stroke="#f59e0b" />
      <text x="276" y="182" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="700">jX1</text>
      <line x1="312" y1="178" x2="384" y2="178" stroke="#d4d4d8" strokeWidth="2" />

      <line x1="384" y1="92" x2="384" y2="270" stroke="#d4d4d8" strokeWidth="2" />
      <line x1="384" y1="92" x2="606" y2="92" stroke="#d4d4d8" strokeWidth="2" />
      <line x1="384" y1="270" x2="606" y2="270" stroke="#d4d4d8" strokeWidth="2" />
      <line x1="606" y1="92" x2="606" y2="270" stroke="#d4d4d8" strokeWidth="2" />

      <rect x="350" y="122" width="68" height="40" rx="8" fill="#111114" stroke="#3b82f6" />
      <text x="384" y="146" textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="700">jXm</text>

      <rect x="522" y="122" width="68" height="40" rx="8" fill="#111114" stroke="#22c55e" />
      <text x="556" y="146" textAnchor="middle" fill="#22c55e" fontSize="12" fontWeight="700">R2/s</text>
      <rect x="522" y="198" width="68" height="40" rx="8" fill="#111114" stroke="#14b8a6" />
      <text x="556" y="222" textAnchor="middle" fill="#14b8a6" fontSize="12" fontWeight="700">jX2</text>

      <line x1="606" y1="178" x2="704" y2="178" stroke="#d4d4d8" strokeWidth="2" />
      <line x1="704" y1="178" x2="770" y2="178" stroke="#22c55e" strokeWidth={Math.max(2, data.Pconv / Math.max(data.Pin, 1) * 10)} markerEnd="url(#arrow-pf)" />
      <text x="783" y="182" fill="#22c55e" fontSize="12" fontWeight="700">Pconv</text>

      <line x1="94" y1="138" x2="312" y2="138" stroke="#818cf8" strokeWidth={Math.max(2, cAbs(data.I1) * 0.75)} markerEnd="url(#arrow-pf)" />
      <text x="196" y="128" textAnchor="middle" fill="#818cf8" fontSize="11" fontWeight="700">I1 = {cAbs(data.I1).toFixed(2)} A</text>
      <line x1="420" y1="106" x2="420" y2="244" stroke="#60a5fa" strokeWidth={Math.max(2, cAbs(data.Im) * 0.6)} markerEnd="url(#arrow-pf)" />
      <text x="432" y="148" fill="#60a5fa" fontSize="11" fontWeight="700">Ic + Im</text>
      <line x1="570" y1="106" x2="570" y2="244" stroke="#34d399" strokeWidth={Math.max(2, cAbs(data.I2) * 0.6)} markerEnd="url(#arrow-pf)" />
      <text x="582" y="148" fill="#34d399" fontSize="11" fontWeight="700">I2'</text>

      <text x="835" y="34" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="700" letterSpacing="0.07em">
        POWER FLOW BREAKDOWN
      </text>
      <circle cx="835" cy="178" r="92" fill="#101015" stroke="#27272a" />
      <circle cx="835" cy="178" r="44" fill="#09090b" />
      {vals.map((seg) => {
        const sweep = (seg.value / total) * Math.PI * 2;
        const path = donutPath(835, 178, 44, 92, a, a + sweep);
        a += sweep;
        return <path key={seg.label} d={path} fill={seg.color} opacity="0.9" />;
      })}
      <text x="835" y="170" textAnchor="middle" fill="#f4f4f5" fontSize="13" fontWeight="700">Pin</text>
      <text x="835" y="188" textAnchor="middle" fill="#c4b5fd" fontSize="16" fontWeight="700">{(data.Pin / 1000).toFixed(1)} kW</text>
      {vals.map((seg, i) => (
        <g key={seg.label} transform={`translate(762, ${286 + i * 24})`}>
          <rect width="12" height="12" rx="3" fill={seg.color} />
          <text x="20" y="10" fill="#a1a1aa" fontSize="11">{seg.label}: {(seg.value / 1000).toFixed(2)} kW</text>
        </g>
      ))}
    </svg>
  );
}

export default function InductionMotorEquivalentCircuit() {
  const [tab, setTab] = useState('sim');
  const [Vll, setVll] = useState(415);
  const [R1, setR1] = useState(0.6);
  const [X1, setX1] = useState(1.1);
  const [R2, setR2] = useState(0.45);
  const [X2, setX2] = useState(1.0);
  const [Xm, setXm] = useState(26);
  const [Rc, setRc] = useState(180);
  const [slip, setSlip] = useState(0.04);

  const data = useMemo(() => compute(Vll, R1, X1, R2, X2, Xm, Rc, slip), [Vll, R1, X1, R2, X2, Xm, Rc, slip]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'sim')} onClick={() => setTab('sim')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'sim' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram data={data} />
          </div>

          <div style={S.controls}>
            {[
              ['Line voltage', Vll, 250, 460, 1, setVll, ' V'],
              ['R1', R1, 0.2, 1.2, 0.01, setR1, ' ohm'],
              ['X1', X1, 0.4, 2.0, 0.01, setX1, ' ohm'],
              ['R2', R2, 0.15, 1.0, 0.01, setR2, ' ohm'],
              ['X2', X2, 0.4, 2.0, 0.01, setX2, ' ohm'],
              ['Xm', Xm, 10, 60, 0.5, setXm, ' ohm'],
              ['Rc', Rc, 60, 500, 1, setRc, ' ohm'],
              ['Slip', slip, 0.005, 0.2, 0.001, setSlip, ' pu'],
            ].map(([label, value, min, max, step, setter, unit]) => (
              <div style={S.cg} key={label}>
                <span style={S.label}>{label}</span>
                <input style={S.slider} type="range" min={min} max={max} step={step} value={value} onChange={(e) => setter(Number(e.target.value))} />
                <span style={S.val}>{Number(value).toFixed(step < 0.01 ? 3 : step < 0.1 ? 2 : 1)}{unit}</span>
              </div>
            ))}
          </div>

          <div style={S.results}>
            <div style={S.ri}><span style={S.rl}>Input power</span><span style={S.rv}>{(data.Pin / 1000).toFixed(2)} kW</span></div>
            <div style={S.ri}><span style={S.rl}>Power factor</span><span style={S.rv}>{data.pf.toFixed(3)}</span></div>
            <div style={S.ri}><span style={S.rl}>Air-gap power</span><span style={S.rv}>{(data.Pag / 1000).toFixed(2)} kW</span></div>
            <div style={S.ri}><span style={S.rl}>Core loss</span><span style={S.rv}>{(data.Pcore / 1000).toFixed(2)} kW</span></div>
            <div style={S.ri}><span style={S.rl}>Rotor copper loss</span><span style={S.rv}>{(data.Prcu / 1000).toFixed(2)} kW</span></div>
            <div style={S.ri}><span style={S.rl}>Converted mechanical</span><span style={S.rv}>{(data.Pconv / 1000).toFixed(2)} kW</span></div>
            <div style={S.ri}><span style={S.rl}>Efficiency</span><span style={S.rv}>{data.eta.toFixed(1)}%</span></div>
          </div>

          <div style={S.strip}>
            <div style={S.box}>
              <span style={S.boxT}>Phase values</span>
              <span style={S.boxV}>Vph = {data.Vph.toFixed(1)} V{'\n'}|I1| = {cAbs(data.I1).toFixed(2)} A{'\n'}|I2'| = {cAbs(data.I2).toFixed(2)} A</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Loss chain</span>
              <span style={S.boxV}>Pscu = {(data.Pscu / 1000).toFixed(2)} kW{'\n'}Pcore = {(data.Pcore / 1000).toFixed(2)} kW{'\n'}Prcu = {(data.Prcu / 1000).toFixed(2)} kW</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Excitation branch</span>
              <span style={S.boxV}>|Imag| = {cAbs(data.Imag).toFixed(2)} A{'\n'}|Icore| = {cAbs(data.Icore).toFixed(2)} A{'\n'}Qin = {(data.Qin / 1000).toFixed(2)} kVAr</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={S.theory}>
          <h2 style={S.h2}>Induction Motor Per-Phase Equivalent Circuit</h2>
          <p style={S.p}>
            The induction motor behaves like a transformer with a rotating secondary. The stator is the primary, the rotor is the secondary, and the air gap replaces the fixed magnetic path of a transformer.
            After referring rotor quantities to the stator side, the machine can be represented by a per-phase equivalent circuit that predicts current, power factor, air-gap power, rotor copper loss, and converted mechanical power.
          </p>

          <h3 style={S.h3}>Classical exact branch meanings</h3>
          <ul style={S.ul}>
            <li style={S.li}><strong style={{ color: '#ef4444' }}>R1</strong> represents stator copper loss.</li>
            <li style={S.li}><strong style={{ color: '#f59e0b' }}>X1</strong> represents stator leakage flux that does not cross the air gap.</li>
            <li style={S.li}><strong style={{ color: '#3b82f6' }}>Rc</strong> models iron loss: hysteresis plus eddy-current loss.</li>
            <li style={S.li}><strong style={{ color: '#60a5fa' }}>Xm</strong> is the magnetizing reactance that establishes air-gap flux.</li>
            <li style={S.li}><strong style={{ color: '#22c55e' }}>R2'/s + jX2'</strong> is the rotor branch referred to the stator, with slip appearing explicitly in the effective rotor resistance.</li>
          </ul>

          <span style={S.eq}>Z2' = R2' / s + jX2'</span>
          <span style={S.eq}>Pag = 3 |I2'|^2 (R2' / s), Prcl = 3 |I2'|^2 R2', Pconv = Pag (1 - s)</span>
          <span style={S.eq}>Pin = Pscu + Pcore + Pag</span>

          <h2 style={S.h2}>Power Flow Interpretation</h2>
          <p style={S.p}>
            The most important insight is that the rotor branch converts slip directly into power partition. Of the air-gap power, a fraction <strong style={{ color: '#e4e4e7' }}>s</strong> is rotor copper loss and a fraction <strong style={{ color: '#e4e4e7' }}>(1 - s)</strong> becomes converted mechanical power:
          </p>
          <span style={S.eq}>Prcu / Pag = s,  Pconv / Pag = 1 - s</span>
          <p style={S.p}>
            This is why slip is not just a speed variable. It is also a power-flow variable. Near standstill, rotor copper loss dominates. Near rated speed, most air-gap power becomes mechanical conversion.
          </p>

          <h2 style={S.h2}>Parameter Tests Used In Practice</h2>
          <h3 style={S.h3}>No-load test</h3>
          <p style={S.p}>
            With the rotor nearly unloaded, slip is very small and the rotor branch draws little real power. The measured current and power mainly determine <strong style={{ color: '#e4e4e7' }}>Rc</strong> and <strong style={{ color: '#e4e4e7' }}>Xm</strong>.
          </p>
          <h3 style={S.h3}>Blocked-rotor test</h3>
          <p style={S.p}>
            With the rotor blocked, slip is unity and the circuit resembles a short-circuited transformer. The measured current and power are used to estimate the series parameters <strong style={{ color: '#e4e4e7' }}>R1 + R2'</strong> and <strong style={{ color: '#e4e4e7' }}>X1 + X2'</strong>.
          </p>

          <div style={S.ctx}>
            <span style={S.ctxT}>Assumptions Used Here</span>
            <p style={S.ctxP}>
              This simulation uses the standard approximate per-phase model with all quantities referred to the stator. Stray-load loss, mechanical rotational loss, saturation, skin effect in deep bars, and temperature dependence of rotor resistance are not modeled. The displayed efficiency therefore represents electromagnetic conversion efficiency up to converted mechanical power, not final shaft efficiency.
            </p>
          </div>

          <h2 style={S.h2}>Why Each Control Matters</h2>
          <ul style={S.ul}>
            <li style={S.li}>Increasing <strong style={{ color: '#e4e4e7' }}>Xm</strong> reduces magnetizing current and generally improves power factor.</li>
            <li style={S.li}>Increasing <strong style={{ color: '#e4e4e7' }}>R2'</strong> raises starting torque up to an optimum but also increases operating slip for the same load torque.</li>
            <li style={S.li}>Increasing <strong style={{ color: '#e4e4e7' }}>X1 + X2'</strong> reduces the air-gap voltage available to the rotor and depresses torque capability.</li>
            <li style={S.li}>Decreasing slip lowers rotor copper loss as a fraction of air-gap power and raises converted mechanical power.</li>
          </ul>

          <h2 style={S.h2}>References</h2>
          <ul style={S.ul}>
            <li style={S.li}>Chapman, S.J. — <em>Electric Machinery Fundamentals</em>, McGraw-Hill</li>
            <li style={S.li}>Fitzgerald, Kingsley, Umans — <em>Electric Machinery</em>, McGraw-Hill</li>
            <li style={S.li}>P.S. Bimbhra — <em>Electrical Machinery</em>, Khanna Publishers</li>
            <li style={S.li}>B.L. Theraja and A.K. Theraja — <em>A Textbook of Electrical Technology, Vol. II</em></li>
          </ul>
        </div>
      )}
    </div>
  );
}
