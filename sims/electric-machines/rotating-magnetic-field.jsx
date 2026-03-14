import React, { useEffect, useMemo, useState } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 22, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 140, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 68, textAlign: 'right' },
  results: { display: 'flex', gap: 28, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
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

const PHASES = [
  { key: 'A', angle: 0, color: '#ef4444' },
  { key: 'B', angle: -120, color: '#f59e0b' },
  { key: 'C', angle: 120, color: '#3b82f6' },
];

const DEG = Math.PI / 180;

function compute(freq, poles, currents, timeDeg) {
  const wt = timeDeg * DEG;
  const inst = PHASES.map((phase, idx) => {
    const theta = wt + phase.angle * DEG;
    return currents[idx] * Math.sin(theta);
  });

  const fx =
    inst[0] * Math.cos(0) +
    inst[1] * Math.cos(-120 * DEG) +
    inst[2] * Math.cos(120 * DEG);
  const fy =
    inst[0] * Math.sin(0) +
    inst[1] * Math.sin(-120 * DEG) +
    inst[2] * Math.sin(120 * DEG);

  const spaceWave = Array.from({ length: 73 }, (_, i) => {
    const angle = -180 + i * 5;
    const phi = angle * DEG;
    const mmf =
      inst[0] * Math.cos(phi) +
      inst[1] * Math.cos(phi + 120 * DEG) +
      inst[2] * Math.cos(phi - 120 * DEG);
    return { angle, mmf };
  });

  const mag = Math.hypot(fx, fy);
  const ns = (120 * freq) / poles;
  const mechRps = ns / 60;
  const balance = (Math.min(...currents) / Math.max(...currents)) * 100;

  return {
    inst,
    fx,
    fy,
    mag,
    fieldAngle: Math.atan2(fy, fx) / DEG,
    spaceWave,
    ns,
    mechRps,
    syncOmega: (4 * Math.PI * freq) / poles,
    balance,
  };
}

function Diagram({ data, timeDeg }) {
  const W = 980;
  const H = 420;
  const cx = 255;
  const cy = 175;
  const radius = 116;
  const waveX = 520;
  const waveY = 74;
  const waveW = 395;
  const waveH = 240;

  const maxWave = Math.max(...data.spaceWave.map((p) => Math.abs(p.mmf)), 1);
  const xS = (a) => waveX + ((a + 180) / 360) * waveW;
  const yS = (v) => waveY + waveH / 2 - (v / maxWave) * (waveH * 0.42);
  const path = data.spaceWave
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xS(p.angle).toFixed(1)},${yS(p.mmf).toFixed(1)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <defs>
        <filter id="rmf-glow"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x={cx} y={30} textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="600" letterSpacing="0.08em">
        STATOR AXES AND RESULTANT ROTATING FIELD
      </text>
      <circle cx={cx} cy={cy} r={radius + 20} fill="none" stroke="#18181b" strokeWidth="26" />
      <circle cx={cx} cy={cy} r={radius} fill="#0d0d11" stroke="#27272a" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="26" fill="#111827" stroke="#6366f1" strokeWidth="1.2" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="#a5b4fc" fontWeight="700">Rotor</text>

      {PHASES.map((phase, i) => {
        const a = phase.angle * DEG;
        const x1 = cx - Math.cos(a) * (radius - 12);
        const y1 = cy + Math.sin(a) * (radius - 12);
        const x2 = cx + Math.cos(a) * (radius - 12);
        const y2 = cy - Math.sin(a) * (radius - 12);
        const dotX = cx + Math.cos(a) * (radius + 3);
        const dotY = cy - Math.sin(a) * (radius + 3);
        const crossX = cx - Math.cos(a) * (radius + 3);
        const crossY = cy + Math.sin(a) * (radius + 3);
        const current = data.inst[i];
        return (
          <g key={phase.key}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={phase.color} strokeWidth="3" strokeOpacity="0.55" />
            <circle cx={dotX} cy={dotY} r="10" fill="none" stroke={phase.color} strokeWidth="2" />
            <circle cx={dotX} cy={dotY} r="3.6" fill={phase.color} />
            <circle cx={crossX} cy={crossY} r="10" fill="none" stroke={phase.color} strokeWidth="2" />
            <line x1={crossX - 4} y1={crossY - 4} x2={crossX + 4} y2={crossY + 4} stroke={phase.color} strokeWidth="2" />
            <line x1={crossX + 4} y1={crossY - 4} x2={crossX - 4} y2={crossY + 4} stroke={phase.color} strokeWidth="2" />
            <text x={cx + Math.cos(a) * (radius + 34)} y={cy - Math.sin(a) * (radius + 34)} textAnchor="middle" fill={phase.color} fontSize="12" fontWeight="700">
              {phase.key}
            </text>
            <text x={cx + Math.cos(a) * (radius + 58)} y={cy - Math.sin(a) * (radius + 58)} textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="monospace">
              {current.toFixed(2)} pu
            </text>
          </g>
        );
      })}

      <line x1={cx} y1={cy} x2={cx + data.fx * 58} y2={cy - data.fy * 58} stroke="#22c55e" strokeWidth="6" strokeLinecap="round" filter="url(#rmf-glow)" />
      <polygon
        points={`${cx + data.fx * 58},${cy - data.fy * 58} ${cx + data.fx * 58 - 10 * Math.cos(Math.atan2(-data.fy, data.fx) - 0.45)},${cy - data.fy * 58 - 10 * Math.sin(Math.atan2(-data.fy, data.fx) - 0.45)} ${cx + data.fx * 58 - 10 * Math.cos(Math.atan2(-data.fy, data.fx) + 0.45)},${cy - data.fy * 58 - 10 * Math.sin(Math.atan2(-data.fy, data.fx) + 0.45)}`}
        fill="#22c55e"
      />
      <text x={cx} y={335} textAnchor="middle" fill="#22c55e" fontSize="12" fontWeight="700">
        Resultant field @ t = {timeDeg.toFixed(0)} deg
      </text>

      <text x={waveX + waveW / 2} y={30} textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="600" letterSpacing="0.08em">
        AIR-GAP MMF DISTRIBUTION
      </text>
      <rect x={waveX} y={waveY} width={waveW} height={waveH} rx="10" fill="#0d0d11" stroke="#27272a" />
      {[ -1, -0.5, 0, 0.5, 1 ].map((v) => (
        <g key={v}>
          <line x1={waveX} y1={yS(v * maxWave)} x2={waveX + waveW} y2={yS(v * maxWave)} stroke="#1f2937" strokeWidth="0.7" />
          <text x={waveX - 8} y={yS(v * maxWave) + 4} textAnchor="end" fill="#52525b" fontSize="9">{v.toFixed(1)}</text>
        </g>
      ))}
      {[ -180, -120, -60, 0, 60, 120, 180 ].map((a) => (
        <g key={a}>
          <line x1={xS(a)} y1={waveY} x2={xS(a)} y2={waveY + waveH} stroke="#1f2937" strokeWidth="0.6" />
          <text x={xS(a)} y={waveY + waveH + 14} textAnchor="middle" fill="#52525b" fontSize="9">{a}</text>
        </g>
      ))}
      <line x1={waveX} y1={waveY + waveH / 2} x2={waveX + waveW} y2={waveY + waveH / 2} stroke="#3f3f46" strokeWidth="1" />
      <path d={path} fill="none" stroke="#a78bfa" strokeWidth="3" />
      <text x={waveX + waveW / 2} y={waveY + waveH + 32} textAnchor="middle" fill="#71717a" fontSize="10">Space angle in electrical degrees</text>

      <g transform="translate(555,345)">
        <rect width="330" height="52" rx="10" fill="#101015" stroke="#27272a" />
        <text x="16" y="22" fill="#a1a1aa" fontSize="11">Balanced 3-phase currents produce a nearly constant-magnitude rotating field.</text>
        <text x="16" y="38" fill="#52525b" fontSize="10" fontFamily="monospace">F(theta,t) = ia cos(theta) + ib cos(theta + 120 deg) + ic cos(theta - 120 deg)</text>
      </g>
    </svg>
  );
}

export default function RotatingMagneticField() {
  const [tab, setTab] = useState('sim');
  const [freq, setFreq] = useState(50);
  const [poles, setPoles] = useState(4);
  const [iaAmp, setIaAmp] = useState(1);
  const [ibAmp, setIbAmp] = useState(1);
  const [icAmp, setIcAmp] = useState(1);
  const [timeDeg, setTimeDeg] = useState(24);
  const [playing, setPlaying] = useState(true);

  const data = useMemo(
    () => compute(freq, poles, [iaAmp, ibAmp, icAmp], timeDeg),
    [freq, poles, iaAmp, ibAmp, icAmp, timeDeg]
  );

  useEffect(() => {
    if (!playing || tab !== 'sim') return undefined;
    const id = setInterval(() => setTimeDeg((t) => (t + 4) % 360), 50);
    return () => clearInterval(id);
  }, [playing, tab]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'sim')} onClick={() => setTab('sim')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'sim' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram data={data} timeDeg={timeDeg} />
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Frequency</span>
              <input style={S.slider} type="range" min="20" max="60" step="1" value={freq} onChange={(e) => setFreq(Number(e.target.value))} />
              <span style={S.val}>{freq.toFixed(0)} Hz</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Poles</span>
              <input style={S.slider} type="range" min="2" max="8" step="2" value={poles} onChange={(e) => setPoles(Number(e.target.value))} />
              <span style={S.val}>{poles.toFixed(0)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Phase A</span>
              <input style={S.slider} type="range" min="0.5" max="1.3" step="0.01" value={iaAmp} onChange={(e) => setIaAmp(Number(e.target.value))} />
              <span style={S.val}>{iaAmp.toFixed(2)} pu</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Phase B</span>
              <input style={S.slider} type="range" min="0.5" max="1.3" step="0.01" value={ibAmp} onChange={(e) => setIbAmp(Number(e.target.value))} />
              <span style={S.val}>{ibAmp.toFixed(2)} pu</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Phase C</span>
              <input style={S.slider} type="range" min="0.5" max="1.3" step="0.01" value={icAmp} onChange={(e) => setIcAmp(Number(e.target.value))} />
              <span style={S.val}>{icAmp.toFixed(2)} pu</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Time scrub</span>
              <input style={S.slider} type="range" min="0" max="360" step="1" value={timeDeg} onChange={(e) => setTimeDeg(Number(e.target.value))} />
              <span style={S.val}>{timeDeg.toFixed(0)} deg</span>
            </div>
            <div style={S.cg}>
              <button style={{ ...S.tab(playing), padding: '6px 14px' }} onClick={() => setPlaying((p) => !p)}>
                {playing ? 'Pause' : 'Animate'}
              </button>
            </div>
          </div>

          <div style={S.results}>
            <div style={S.ri}><span style={S.rl}>Synchronous speed</span><span style={S.rv}>{data.ns.toFixed(0)} rpm</span></div>
            <div style={S.ri}><span style={S.rl}>Mechanical sync speed</span><span style={S.rv}>{data.mechRps.toFixed(2)} rps</span></div>
            <div style={S.ri}><span style={S.rl}>Resultant field magnitude</span><span style={S.rv}>{data.mag.toFixed(2)} pu</span></div>
            <div style={S.ri}><span style={S.rl}>Field angle</span><span style={S.rv}>{data.fieldAngle.toFixed(1)} deg</span></div>
            <div style={S.ri}><span style={S.rl}>Current balance</span><span style={S.rv}>{data.balance.toFixed(1)}%</span></div>
          </div>

          <div style={S.strip}>
            <div style={S.box}>
              <span style={S.boxT}>Current set</span>
              <span style={S.boxV}>ia = {data.inst[0].toFixed(3)} pu{'\n'}ib = {data.inst[1].toFixed(3)} pu{'\n'}ic = {data.inst[2].toFixed(3)} pu</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Space vector</span>
              <span style={S.boxV}>Falpha = {data.fx.toFixed(3)}{'\n'}Fbeta = {data.fy.toFixed(3)}{'\n'}|F| = {data.mag.toFixed(3)}</span>
            </div>
            <div style={S.box}>
              <span style={S.boxT}>Angular speed</span>
              <span style={S.boxV}>omega_sync = 4 pi f / P{'\n'}omega_sync = {data.syncOmega.toFixed(2)} rad/s</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={S.theory}>
          <h2 style={S.h2}>Rotating Magnetic Field Theory</h2>
          <p style={S.p}>
            The induction motor starts with the 3-phase stator alone. Each stator phase produces a sinusoidal air-gap MMF wave fixed in space but pulsating in time.
            Because the three phase axes are displaced by 120 electrical degrees and the currents are also displaced by 120 electrical degrees in time,
            the three pulsating waves sum to one resultant MMF wave of essentially constant magnitude rotating in space at synchronous speed.
          </p>

          <span style={S.eq}>Ns = 120 f / P</span>
          <span style={S.eq}>F(theta,t) = ia cos(theta) + ib cos(theta + 120 deg) + ic cos(theta - 120 deg)</span>

          <h2 style={S.h2}>Balanced 3-Phase Current Set</h2>
          <span style={S.eq}>ia = Im sin(wt), ib = Im sin(wt - 120 deg), ic = Im sin(wt - 240 deg)</span>
          <p style={S.p}>
            If the phase currents are equal in magnitude and displaced by exactly 120 degrees, the resultant field vector rotates with constant amplitude.
            This is the key reason the induction motor develops smooth torque under balanced supply conditions.
            The simulation lets you intentionally unbalance one or more phase magnitudes to show how the field magnitude begins to pulsate instead of remaining constant.
          </p>

          <h3 style={S.h3}>Electrical speed and mechanical speed</h3>
          <p style={S.p}>
            The space wave rotates at electrical angular speed omega_e = 2 pi f. Mechanical speed depends on pole count because one mechanical revolution corresponds to multiple electrical cycles in a multipole machine.
            For a P-pole machine:
          </p>
          <span style={S.eq}>omega_sync = 4 pi f / P,  Ns = 120 f / P</span>

          <h2 style={S.h2}>What This Simulation Shows</h2>
          <ul style={S.ul}>
            <li style={S.li}>The stator circle marks the physical phase axes A, B, and C inside a 2-pole representation of the machine.</li>
            <li style={S.li}>The instantaneous currents shown beside each axis are used to construct the resultant field vector.</li>
            <li style={S.li}>The green vector is the air-gap resultant MMF, which should rotate with nearly constant magnitude under balanced conditions.</li>
            <li style={S.li}>The right-hand plot is the instantaneous spatial MMF distribution F(theta,t), not a terminal voltage waveform.</li>
            <li style={S.li}>Changing pole count shows why increasing poles reduces synchronous speed for the same supply frequency.</li>
          </ul>

          <h2 style={S.h2}>Why This Matters For Induction Motors</h2>
          <p style={S.p}>
            The squirrel-cage rotor has no direct electrical connection. Rotor current exists only because the rotating stator field cuts the stationary or slower-moving rotor conductors.
            That induced rotor current interacts with the same air-gap field to produce electromagnetic torque. Without the rotating-field principle, the induction motor would not self-start.
          </p>

          <div style={S.ctx}>
            <span style={S.ctxT}>Assumptions Used Here</span>
            <p style={S.ctxP}>
              The stator windings are assumed sinusoidally distributed, the air-gap is uniform, and slot harmonics are neglected. The simulation focuses on the fundamental space harmonic only, which is the standard textbook derivation used to establish the rotating-field result.
            </p>
          </div>

          <h2 style={S.h2}>Unbalance and Negative-Sequence Insight</h2>
          <p style={S.p}>
            When the three phase currents are not balanced, the rotating field can be resolved into positive-sequence and negative-sequence components.
            The positive-sequence field rotates in the normal direction, while the negative-sequence field rotates in the reverse direction.
            That reverse field induces double-frequency rotor effects, torque pulsation, and additional heating, which is why voltage unbalance is so damaging to induction motors.
          </p>

          <h2 style={S.h2}>References</h2>
          <ul style={S.ul}>
            <li style={S.li}>Chapman, S.J. — <em>Electric Machinery Fundamentals</em>, chapter on rotating magnetic fields and induction machines</li>
            <li style={S.li}>Fitzgerald, Kingsley, Umans — <em>Electric Machinery</em>, sections on stator MMF and synchronous speed</li>
            <li style={S.li}>P.S. Bimbhra — <em>Electrical Machinery</em>, induction motor fundamentals</li>
            <li style={S.li}>B.L. Theraja and A.K. Theraja — <em>A Textbook of Electrical Technology, Vol. II</em></li>
          </ul>
        </div>
      )}
    </div>
  );
}
