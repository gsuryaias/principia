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
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 64, textAlign: 'right' },
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

const METHODS = ['DOL', 'Star-Delta', 'Autotransformer'];

function machineBase(powerKW) {
  const Vll = 415;
  const eta = 0.9;
  const pf = 0.86;
  const ns = 1500;
  const nfl = 1450;
  const ifl = (powerKW * 1000) / (Math.sqrt(3) * Vll * eta * pf);
  const tfl = (powerKW * 1000) / (2 * Math.PI * nfl / 60);
  const idol = ifl * 6.2;
  const tdol = tfl * 1.85;
  return { Vll, eta, pf, ns, nfl, ifl, tfl, idol, tdol };
}

function compute(powerKW, tap) {
  const base = machineBase(powerKW);
  const methods = [
    {
      name: 'DOL',
      lineCurrent: base.idol,
      motorCurrent: base.idol,
      torque: base.tdol,
      ratioI: base.idol / base.ifl,
      ratioT: base.tdol / base.tfl,
      note: 'Full voltage applied at the stator terminals.',
      color: '#ef4444',
    },
    {
      name: 'Star-Delta',
      lineCurrent: base.idol / 3,
      motorCurrent: base.idol / Math.sqrt(3),
      torque: base.tdol / 3,
      ratioI: (base.idol / 3) / base.ifl,
      ratioT: (base.tdol / 3) / base.tfl,
      note: 'Start in star, then switch to delta near 80-90% speed.',
      color: '#f59e0b',
    },
    {
      name: 'Autotransformer',
      lineCurrent: base.idol * tap * tap,
      motorCurrent: base.idol * tap,
      torque: base.tdol * tap * tap,
      ratioI: (base.idol * tap * tap) / base.ifl,
      ratioT: (base.tdol * tap * tap) / base.tfl,
      note: 'Reduced-voltage starting with adjustable tap ratio k.',
      color: '#22c55e',
    },
  ];
  const loadTorque = base.tfl * 0.55;
  const selected = methods;
  return { base, methods: selected, loadTorque };
}

function Diagram({ data, active }) {
  const W = 980;
  const H = 420;
  const currentMax = Math.max(...data.methods.map((m) => m.ratioI));
  const torqueMax = Math.max(...data.methods.map((m) => m.ratioT), data.loadTorque / data.base.tfl);
  const boxW = 250;
  const gap = 52;
  const startX = 76;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      {data.methods.map((m, i) => {
        const x = startX + i * (boxW + gap);
        const activeCard = m.name === active;
        const curH = (m.ratioI / currentMax) * 146;
        const torH = (m.ratioT / torqueMax) * 146;
        const loadH = ((data.loadTorque / data.base.tfl) / torqueMax) * 146;
        return (
          <g key={m.name} transform={`translate(${x},48)`}>
            <rect width={boxW} height="286" rx="16" fill={activeCard ? '#111827' : '#101015'} stroke={m.color} strokeWidth={activeCard ? 2.2 : 1.2} opacity={activeCard ? 1 : 0.8} />
            <text x={boxW / 2} y="28" textAnchor="middle" fill={m.color} fontSize="14" fontWeight="700">{m.name}</text>

            <g transform="translate(26,58)">
              <rect width="66" height="142" rx="10" fill="#09090b" stroke="#27272a" />
              <rect x="14" y={142 - curH + 10} width="38" height={curH - 10} rx="8" fill={m.color} opacity="0.8" />
              <text x="33" y="162" textAnchor="middle" fill="#a1a1aa" fontSize="10">Istart</text>
              <text x="33" y="182" textAnchor="middle" fill="#c4b5fd" fontSize="11" fontWeight="700">{m.ratioI.toFixed(1)} x</text>
            </g>

            <g transform="translate(146,58)">
              <rect width="66" height="142" rx="10" fill="#09090b" stroke="#27272a" />
              <rect x="14" y={142 - torH + 10} width="38" height={torH - 10} rx="8" fill="#60a5fa" opacity="0.85" />
              <line x1="8" y1={152 - loadH} x2="58" y2={152 - loadH} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth="2" />
              <text x="33" y="162" textAnchor="middle" fill="#a1a1aa" fontSize="10">Tstart</text>
              <text x="33" y="182" textAnchor="middle" fill="#c4b5fd" fontSize="11" fontWeight="700">{m.ratioT.toFixed(2)} x</text>
            </g>

            <text x="24" y="230" fill="#71717a" fontSize="11">{m.note}</text>
            <text x="24" y="252" fill="#a1a1aa" fontSize="11">Line current: {m.lineCurrent.toFixed(0)} A</text>
            <text x="24" y="270" fill="#a1a1aa" fontSize="11">Starting torque: {m.torque.toFixed(0)} N·m</text>
          </g>
        );
      })}

      <g transform="translate(726,18)">
        <rect width="208" height="66" rx="10" fill="#101015" stroke="#27272a" />
        <text x="14" y="22" fill="#a1a1aa" fontSize="11">Reference load torque line = {data.loadTorque.toFixed(0)} N·m</text>
        <text x="14" y="40" fill="#a1a1aa" fontSize="11">Blue bars = starting torque, colored bars = line current</text>
        <text x="14" y="58" fill="#c4b5fd" fontSize="11" fontFamily="monospace">Star-delta: Iline = Idol / 3, Tstart = TdOL / 3</text>
      </g>
    </svg>
  );
}

export default function InductionMotorStarting() {
  const [tab, setTab] = useState('sim');
  const [method, setMethod] = useState('DOL');
  const [powerKW, setPowerKW] = useState(45);
  const [tap, setTap] = useState(0.65);

  const data = useMemo(() => compute(powerKW, tap), [powerKW, tap]);
  const selected = data.methods.find((m) => m.name === method);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'sim')} onClick={() => setTab('sim')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'sim' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram data={data} active={method} />
          </div>

          <div style={S.controls}>
            <div style={S.bg}>
              {METHODS.map((m) => (
                <button key={m} style={S.btn(method === m)} onClick={() => setMethod(m)}>{m}</button>
              ))}
            </div>
            <div style={S.cg}>
              <span style={S.label}>Motor rating</span>
              <input style={S.slider} type="range" min="15" max="150" step="5" value={powerKW} onChange={(e) => setPowerKW(Number(e.target.value))} />
              <span style={S.val}>{powerKW.toFixed(0)} kW</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Autotransformer tap</span>
              <input style={S.slider} type="range" min="0.5" max="0.8" step="0.01" value={tap} onChange={(e) => setTap(Number(e.target.value))} />
              <span style={S.val}>{(tap * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div style={S.results}>
            <div style={S.ri}><span style={S.rl}>Selected method</span><span style={S.rv}>{selected.name}</span></div>
            <div style={S.ri}><span style={S.rl}>Rated current</span><span style={S.rv}>{data.base.ifl.toFixed(1)} A</span></div>
            <div style={S.ri}><span style={S.rl}>Starting line current</span><span style={S.rv}>{selected.lineCurrent.toFixed(0)} A</span></div>
            <div style={S.ri}><span style={S.rl}>Current multiple</span><span style={S.rv}>{selected.ratioI.toFixed(1)} x FL</span></div>
            <div style={S.ri}><span style={S.rl}>Starting torque</span><span style={S.rv}>{selected.torque.toFixed(0)} N·m</span></div>
            <div style={S.ri}><span style={S.rl}>Torque multiple</span><span style={S.rv}>{selected.ratioT.toFixed(2)} x FL</span></div>
          </div>

          <div style={S.strip}>
            <div style={S.box}>
              <span style={S.boxT}>DOL</span>
              <span style={S.boxV}>Highest starting torque.{'\n'}Highest line current and voltage dip risk.</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Star-Delta</span>
              <span style={S.boxV}>Cheap and common for lightly loaded starts.{'\n'}Only suitable for motors intended to run in delta.</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Autotransformer</span>
              <span style={S.boxV}>Adjustable compromise between current and torque.{'\n'}Line current and torque both scale with k^2.</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={S.theory}>
          <h2 style={S.h2}>Starting Of Three-Phase Induction Motors</h2>
          <p style={S.p}>
            At standstill, the rotor frequency equals supply frequency because slip is unity. The induction motor therefore behaves like a transformer with a short-circuited secondary, drawing a large locked-rotor current. Starting methods are designed to limit that current while still providing enough accelerating torque for the mechanical load.
          </p>

          <span style={S.eq}>At start: s = 1</span>
          <span style={S.eq}>Istart proportional to Vstart, Tstart proportional to Vstart^2</span>
          <span style={S.eq}>Star-delta: Iline = Idol / 3, Tstart = TdOL / 3</span>
          <span style={S.eq}>Autotransformer with tap k: Iline = k^2 IdOL, Tstart = k^2 TdOL</span>

          <h2 style={S.h2}>Why Reduced-Voltage Starting Works</h2>
          <p style={S.p}>
            Locked-rotor current is roughly proportional to applied stator voltage. Electromagnetic torque is approximately proportional to the square of applied voltage, provided frequency remains constant.
            That means every current-reduction method has an unavoidable penalty in starting torque. The engineering problem is therefore not “how do I reduce current?” but “how much current can I reduce and still accelerate the load?”
          </p>

          <h2 style={S.h2}>Method Comparison</h2>
          <h3 style={S.h3}>Direct-on-line</h3>
          <p style={S.p}>
            DOL gives the highest starting torque and the fastest acceleration, but it also produces the highest current. It is acceptable when the supply is stiff and the motor rating is small enough that voltage dip is acceptable.
          </p>

          <h3 style={S.h3}>Star-delta</h3>
          <p style={S.p}>
            Starting in star reduces phase voltage to Vline / root(3), so line current becomes one-third of DOL and starting torque also becomes one-third of DOL. This is suitable when the load torque at zero speed is low.
          </p>

          <h3 style={S.h3}>Autotransformer</h3>
          <p style={S.p}>
            The autotransformer starter provides a tunable reduced-voltage start. Because the transformer also reduces the supply-side current, it gives better torque per ampere drawn from the line than star-delta starting.
          </p>

          <h2 style={S.h2}>How To Read The Simulation</h2>
          <ul style={S.ul}>
            <li style={S.li}>The colored bar shows starting line current as a multiple of full-load current.</li>
            <li style={S.li}>The blue bar shows starting torque as a multiple of full-load torque.</li>
            <li style={S.li}>The dashed horizontal line is a representative load-torque requirement. If the starting-torque bar falls below this line, the motor would accelerate poorly or fail to start.</li>
            <li style={S.li}>Changing motor rating rescales the absolute current and torque values while preserving the standard starter relationships.</li>
          </ul>

          <h2 style={S.h2}>Practical Selection Logic</h2>
          <ul style={S.ul}>
            <li style={S.li}><strong style={{ color: '#ef4444' }}>DOL</strong> is preferred for small and medium motors when the supply can tolerate inrush current and the load needs strong breakaway torque.</li>
            <li style={S.li}><strong style={{ color: '#f59e0b' }}>Star-delta</strong> is suitable for fans, pumps, and other loads that do not require high torque at zero speed.</li>
            <li style={S.li}><strong style={{ color: '#22c55e' }}>Autotransformer starting</strong> is chosen when lower line current is needed but star-delta torque is insufficient.</li>
          </ul>

          <div style={S.ctx}>
            <span style={S.ctxT}>Assumptions Used Here</span>
            <p style={S.ctxP}>
              The simulation uses standard design-rule ratios for full-load current, locked-rotor current, and starting torque rather than a full equivalent-circuit solve for every motor rating. The comparison ratios between methods follow the classical induction-motor starting relations exactly.
            </p>
          </div>

          <h2 style={S.h2}>References</h2>
          <ul style={S.ul}>
            <li style={S.li}>Chapman, S.J. — <em>Electric Machinery Fundamentals</em>, starting behavior of induction motors</li>
            <li style={S.li}>Fitzgerald, Kingsley, Umans — <em>Electric Machinery</em></li>
            <li style={S.li}>P.S. Bimbhra — <em>Electrical Machinery</em></li>
            <li style={S.li}>B.L. Theraja and A.K. Theraja — <em>A Textbook of Electrical Technology, Vol. II</em></li>
          </ul>
        </div>
      )}
    </div>
  );
}
