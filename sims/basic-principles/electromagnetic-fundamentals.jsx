import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const C = {
  bg:'#09090b', surface:'#111114', surfaceAlt:'#18181b',
  border:'#1e1e2e', borderLight:'#27272a',
  accent:'#6366f1', accentLight:'#818cf8', accentGlow:'rgba(99,102,241,0.12)',
  text:'#e4e4e7', muted:'#a1a1aa', dim:'#71717a', faint:'#52525b',
  mono:'#c4b5fd', green:'#22c55e', red:'#ef4444', amber:'#f59e0b', cyan:'#22d3ee',
};

const S = {
  container:{ display:'flex', flexDirection:'column', minHeight:'calc(100vh - 3.5rem)', background:C.bg, fontFamily:'Inter,system-ui,sans-serif', color:C.text },
  tabBar:{ display:'flex', gap:4, padding:'10px 16px', background:'#0a0a0f', borderBottom:`1px solid ${C.border}`, overflowX:'auto', flexShrink:0 },
  tab:a=>({ padding:'7px 13px', borderRadius:10, border:'none', background:a?C.accent:'transparent', color:a?'#fff':C.dim, fontSize:12.5, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s' }),
  body:{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto' },
  section:{ padding:'18px 22px', flex:1, display:'flex', flexDirection:'column', gap:14 },
  svgWrap:{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:220, padding:'4px 0' },
  controls:{ padding:'12px 22px', background:C.surface, borderTop:`1px solid ${C.border}`, display:'flex', flexWrap:'wrap', gap:16, alignItems:'center' },
  cg:{ display:'flex', alignItems:'center', gap:8 },
  label:{ fontSize:12, color:C.muted, fontWeight:500, whiteSpace:'nowrap' },
  slider:{ width:110, accentColor:C.accent, cursor:'pointer' },
  val:{ fontSize:12, color:C.dim, fontFamily:'monospace', minWidth:46, textAlign:'right' },
  eq:{ display:'block', padding:'10px 16px', background:C.surfaceAlt, border:`1px solid ${C.borderLight}`, borderRadius:10, fontFamily:'monospace', fontSize:14, color:C.mono, margin:'8px 0', textAlign:'center', lineHeight:1.7 },
  note:{ padding:'12px 16px', background:C.accentGlow, borderLeft:`3px solid ${C.accent}`, borderRadius:'0 10px 10px 0', margin:'6px 0' },
  noteT:{ fontWeight:700, color:C.accentLight, fontSize:12, marginBottom:4, display:'block', textTransform:'uppercase', letterSpacing:'0.04em' },
  noteP:{ fontSize:13, lineHeight:1.65, color:C.muted, margin:0 },
  results:{ display:'flex', gap:18, padding:'10px 22px', background:'#0c0c0f', borderTop:`1px solid ${C.border}`, flexWrap:'wrap' },
  ri:{ display:'flex', flexDirection:'column', gap:2 },
  rl:{ fontSize:10, color:C.faint, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' },
  rv:{ fontSize:15, fontWeight:700, fontFamily:'monospace' },
  title:{ fontSize:17, fontWeight:700, color:C.text, margin:'0 0 2px' },
  sub:{ fontSize:12.5, color:C.dim, margin:0, lineHeight:1.5 },
  btn:a=>({ padding:'6px 14px', borderRadius:8, border:'none', background:a?C.red:C.green, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }),
  sel:{ padding:'5px 10px', borderRadius:8, border:`1px solid ${C.borderLight}`, background:C.surfaceAlt, color:C.text, fontSize:12, cursor:'pointer' },
};

const TABS = [
  { id:'faraday', label:"Faraday's Law" },
  { id:'ampere', label:"Ampère's Law" },
  { id:'lorentz', label:'Lorentz Force' },
  { id:'lenz', label:"Lenz's Law" },
  { id:'mag-ckt', label:'Magnetic Circuits' },
  { id:'bh', label:'BH Curve' },
  { id:'inductance', label:'Inductance' },
  { id:'energy', label:'Energy Conversion' },
  { id:'maxwell', label:"Maxwell's Eqs" },
];

const CG = ({ label, min, max, step, value, set, unit }) => (
  <div style={S.cg}>
    <span style={S.label}>{label}</span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(+e.target.value)} style={S.slider} />
    <span style={S.val}>{step < 1 ? value.toFixed(step < 0.1 ? 2 : 1) : value}{unit || ''}</span>
  </div>
);

const RI = ({ label, value, color }) => (
  <div style={S.ri}>
    <span style={S.rl}>{label}</span>
    <span style={{ ...S.rv, color: color || C.accent }}>{value}</span>
  </div>
);

const wavePath = (fn, x0, y0, w, h, steps = 120) => {
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    d += `${i === 0 ? 'M' : 'L'}${(x0 + t * w).toFixed(1)},${(y0 - fn(t * 2 * Math.PI) * h / 2).toFixed(1)}`;
  }
  return d;
};

/* ═══════════════════════════════════════════════════════════════════
   TAB 1 — Faraday's Law
   ═══════════════════════════════════════════════════════════════════ */
function FaradayTab() {
  const [N, setN] = useState(100);
  const [B, setB] = useState(1.0);
  const [omega, setOmega] = useState(3);
  const [angle, setAngle] = useState(0);
  const [run, setRun] = useState(true);
  const af = useRef(); const lt = useRef(0);

  useEffect(() => {
    if (!run) { lt.current = 0; return; }
    const tick = t => {
      if (lt.current) setAngle(a => (a + omega * (t - lt.current) / 1000) % (2 * Math.PI));
      lt.current = t;
      af.current = requestAnimationFrame(tick);
    };
    af.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(af.current);
  }, [run, omega]);

  const A = 0.01;
  const phi = N * B * A * Math.cos(angle);
  const emf = N * B * A * omega * Math.sin(angle);
  const peak = N * B * A * omega;
  const norm = angle / (2 * Math.PI);

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Faraday's Law of Electromagnetic Induction</p><p style={S.sub}>A changing magnetic flux through a coil induces an electromotive force</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 580 320" style={{ width:'100%', maxWidth:580 }}>
            {/* B field arrows */}
            {[40,90,140,190,240].map(y => (
              <g key={y}><line x1={15} y1={y} x2={145} y2={y} stroke={C.cyan} strokeWidth={1.2} opacity={0.4}/>
              <polygon points={`145,${y} 138,${y-3.5} 138,${y+3.5}`} fill={C.cyan} opacity={0.4}/></g>
            ))}
            <text x={20} y={28} fill={C.cyan} fontSize={13} fontWeight={600}>B →</text>

            {/* Rotating coil */}
            {(() => {
              const cx = 88, cy = 140, hw = 50 * Math.abs(Math.cos(angle)), hh = 70;
              return (<g>
                <rect x={cx - hw / 2} y={cy - hh / 2} width={Math.max(hw, 2)} height={hh} fill="none" stroke={C.accent} strokeWidth={2.5} rx={3}/>
                <line x1={cx} y1={cy - hh / 2 - 12} x2={cx} y2={cy + hh / 2 + 12} stroke={C.dim} strokeWidth={1} strokeDasharray="4 3"/>
                <text x={cx} y={cy + 4} fill={C.accentLight} fontSize={11} textAnchor="middle" fontWeight={600}>N={N}</text>
                <text x={cx} y={cy + hh / 2 + 28} fill={C.muted} fontSize={11} textAnchor="middle">θ = {(angle * 180 / Math.PI).toFixed(0)}°</text>
              </g>);
            })()}

            {/* Φ waveform */}
            <g transform="translate(175,15)">
              <text x={185} y={10} fill={C.green} fontSize={11} fontWeight={600} textAnchor="middle">Φ(t) = NBAcos(ωt)</text>
              <line x1={0} y1={70} x2={370} y2={70} stroke={C.borderLight} strokeWidth={0.8}/>
              <line x1={0} y1={20} x2={0} y2={120} stroke={C.borderLight} strokeWidth={0.8}/>
              <path d={wavePath(Math.cos, 0, 70, 370, 80)} fill="none" stroke={C.green} strokeWidth={1.8} opacity={0.7}/>
              <circle cx={norm * 370} cy={70 - Math.cos(angle) * 40} r={4} fill={C.green}/>
            </g>

            {/* EMF waveform */}
            <g transform="translate(175,170)">
              <text x={185} y={10} fill={C.amber} fontSize={11} fontWeight={600} textAnchor="middle">ε(t) = NBAω·sin(ωt)</text>
              <line x1={0} y1={70} x2={370} y2={70} stroke={C.borderLight} strokeWidth={0.8}/>
              <line x1={0} y1={20} x2={0} y2={120} stroke={C.borderLight} strokeWidth={0.8}/>
              <path d={wavePath(Math.sin, 0, 70, 370, 80)} fill="none" stroke={C.amber} strokeWidth={1.8} opacity={0.7}/>
              <circle cx={norm * 370} cy={70 - Math.sin(angle) * 40} r={4} fill={C.amber}/>
            </g>
          </svg>
        </div>
        <span style={S.eq}>ε = −N × dΦ/dt = NBAω sin(ωt)</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>Every AC generator produces voltage by rotating a coil in a magnetic field. Transformers rely on time-varying flux in a stationary core. Increasing turns N, field B, area A, or speed ω directly raises output voltage.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Flux linkage" value={`${(phi * 1e3).toFixed(2)} mWb`} color={C.green}/>
        <RI label="Induced EMF" value={`${(emf * 1e3).toFixed(2)} mV`} color={C.amber}/>
        <RI label="Peak EMF" value={`${(peak * 1e3).toFixed(2)} mV`} color={C.accent}/>
      </div>
      <div style={S.controls}>
        <CG label="Turns N" min={10} max={500} step={10} value={N} set={setN}/>
        <CG label="Field B (T)" min={0.1} max={2} step={0.1} value={B} set={setB}/>
        <CG label="ω (rad/s)" min={1} max={10} step={0.5} value={omega} set={setOmega}/>
        <button style={S.btn(run)} onClick={() => { setRun(!run); lt.current = 0; }}>{run ? 'Pause' : 'Play'}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 2 — Ampère's Law
   ═══════════════════════════════════════════════════════════════════ */
function AmpereTab() {
  const [I, setI] = useState(10);
  const [rPath, setRPath] = useState(30);
  const mu0 = 4 * Math.PI * 1e-7;
  const rWire = 5;
  const scale = 1e-3;
  const Bfield = r => (r < rWire * scale) ? (mu0 * I * r) / (2 * Math.PI * (rWire * scale) ** 2) : (mu0 * I) / (2 * Math.PI * r);
  const Bat = Bfield(rPath * scale);

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Ampère's Circuital Law</p><p style={S.sub}>The line integral of B around a closed path equals μ₀ times enclosed current</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 460 340" style={{ width:'100%', maxWidth:460 }}>
            {/* Concentric B-field circles */}
            {[20,35,50,70,90,115,140].map((r,i) => (
              <circle key={i} cx={160} cy={170} r={r} fill="none" stroke={C.cyan} strokeWidth={0.8} opacity={Math.max(0.1, 0.6 - i * 0.07)} strokeDasharray={i < 2 ? 'none' : '4 3'}/>
            ))}
            {/* Conductor cross-section */}
            <circle cx={160} cy={170} r={rWire} fill={C.accent} stroke={C.accentLight} strokeWidth={1.5}/>
            <text x={160} y={174} fill="#fff" fontSize={10} textAnchor="middle" fontWeight={700}>⊙</text>
            <text x={160} y={195} fill={C.muted} fontSize={10} textAnchor="middle">I out of page</text>

            {/* Integration path */}
            <circle cx={160} cy={170} r={rPath} fill="none" stroke={C.amber} strokeWidth={2} strokeDasharray="6 4"/>
            {/* Arrow on integration path */}
            {(() => {
              const ax = 160 + rPath * Math.cos(-0.3), ay = 170 + rPath * Math.sin(-0.3);
              return <polygon points={`${ax},${ay} ${ax - 6},${ay - 5} ${ax + 2},${ay - 7}`} fill={C.amber}/>;
            })()}
            <text x={160 + rPath + 8} y={170} fill={C.amber} fontSize={11} fontWeight={600}>path r</text>

            {/* Right-hand rule hint */}
            <text x={160} y={320} fill={C.dim} fontSize={11} textAnchor="middle">Right-hand rule: thumb = I, fingers = B direction</text>

            {/* B(r) chart */}
            <g transform="translate(290,30)">
              <text x={70} y={0} fill={C.muted} fontSize={11} fontWeight={600} textAnchor="middle">B vs r</text>
              <line x1={0} y1={10} x2={0} y2={250} stroke={C.borderLight} strokeWidth={0.8}/>
              <line x1={0} y1={250} x2={150} y2={250} stroke={C.borderLight} strokeWidth={0.8}/>
              <text x={75} y={268} fill={C.faint} fontSize={10} textAnchor="middle">r →</text>
              <text x={-8} y={130} fill={C.faint} fontSize={10} textAnchor="end" transform="rotate(-90,-8,130)">B →</text>
              {/* B curve */}
              {(() => {
                const pts = [];
                const maxR = 150, maxB = 220;
                const Bpeak = Bfield(rWire * scale);
                for (let px = 1; px <= maxR; px++) {
                  const r = (px / maxR) * 0.15;
                  const b = Bfield(r);
                  pts.push(`${px},${250 - Math.min(b / Bpeak, 1) * maxB}`);
                }
                return <polyline points={pts.join(' ')} fill="none" stroke={C.cyan} strokeWidth={2}/>;
              })()}
              {/* Marker for selected r */}
              {(() => {
                const px = (rPath * scale / 0.15) * 150;
                const Bpeak = Bfield(rWire * scale);
                const py = 250 - Math.min(Bat / Bpeak, 1) * 220;
                return px <= 150 ? <circle cx={px} cy={py} r={4} fill={C.amber}/> : null;
              })()}
              {/* Wire boundary line */}
              {(() => {
                const wx = (rWire * scale / 0.15) * 150;
                return <line x1={wx} y1={10} x2={wx} y2={250} stroke={C.dim} strokeWidth={0.8} strokeDasharray="3 3"/>;
              })()}
            </g>
          </svg>
        </div>
        <span style={S.eq}>∮ B · dl = μ₀ I_enc&nbsp;&nbsp;&nbsp;→&nbsp;&nbsp;&nbsp;B = μ₀I / (2πr)&nbsp;&nbsp;(outside conductor)</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>Ampère's law determines the magnetic field produced by stator and rotor windings in every machine. Solenoid and toroid field calculations for relay/contactor coils and transformer cores all stem from this law.</p></div>
      </div>
      <div style={S.results}>
        <RI label="B at path radius" value={`${(Bat * 1e3).toFixed(3)} mT`} color={C.cyan}/>
        <RI label="∮B·dl" value={`${(mu0 * I * 1e6).toFixed(2)} μT·m`} color={C.amber}/>
        <RI label="μ₀I" value={`${(mu0 * I * 1e6).toFixed(2)} μT·m`} color={C.green}/>
      </div>
      <div style={S.controls}>
        <CG label="Current I (A)" min={1} max={50} step={1} value={I} set={setI}/>
        <CG label="Path radius (mm)" min={8} max={140} step={2} value={rPath} set={setRPath}/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 3 — Lorentz Force (BIL Rule)
   ═══════════════════════════════════════════════════════════════════ */
function LorentzTab() {
  const [Bv, setBv] = useState(0.8);
  const [Iv, setIv] = useState(15);
  const [Lv, setLv] = useState(0.3);
  const F = Bv * Iv * Lv;

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Lorentz Force — BIL Rule</p><p style={S.sub}>A current-carrying conductor in a magnetic field experiences a mechanical force</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 500 320" style={{ width:'100%', maxWidth:500 }}>
            {/* Pole faces */}
            <rect x={60} y={40} width={50} height={240} rx={6} fill="#1e3a5f" stroke={C.cyan} strokeWidth={1.5}/>
            <text x={85} y={165} fill={C.cyan} fontSize={18} fontWeight={700} textAnchor="middle">N</text>
            <rect x={310} y={40} width={50} height={240} rx={6} fill="#3f1e1e" stroke={C.red} strokeWidth={1.5}/>
            <text x={335} y={165} fill={C.red} fontSize={18} fontWeight={700} textAnchor="middle">S</text>

            {/* B field arrows */}
            {[80,120,160,200,240].map(y => (
              <g key={y}>
                <line x1={115} y1={y} x2={305} y2={y} stroke={C.cyan} strokeWidth={1} opacity={0.35}/>
                <polygon points={`305,${y} 298,${y-3} 298,${y+3}`} fill={C.cyan} opacity={0.35}/>
              </g>
            ))}
            <text x={210} y={76} fill={C.cyan} fontSize={12} fontWeight={600} textAnchor="middle">B →</text>

            {/* Conductor */}
            <circle cx={210} cy={160} r={14} fill={C.surfaceAlt} stroke={C.accent} strokeWidth={2}/>
            <text x={210} y={165} fill={C.accent} fontSize={16} fontWeight={700} textAnchor="middle">⊗</text>
            <text x={210} y={195} fill={C.muted} fontSize={10} textAnchor="middle">I into page</text>

            {/* Force arrow (downward for B→ and I⊗ using conventional current) */}
            {F > 0 && (<g>
              <line x1={210} y1={180} x2={210} y2={Math.min(270, 180 + Math.min(F * 15, 80))} stroke={C.amber} strokeWidth={3}/>
              <polygon points={`210,${Math.min(270, 180 + Math.min(F * 15, 80))} 205,${Math.min(270, 180 + Math.min(F * 15, 80)) - 8} 215,${Math.min(270, 180 + Math.min(F * 15, 80)) - 8}`} fill={C.amber}/>
              <text x={226} y={Math.min(265, 180 + Math.min(F * 15, 80) - 4)} fill={C.amber} fontSize={13} fontWeight={700}>F ↓</text>
            </g>)}

            {/* Fleming's left-hand rule diagram */}
            <g transform="translate(385,40)">
              <text x={50} y={0} fill={C.muted} fontSize={11} fontWeight={600} textAnchor="middle">Fleming's LHR</text>
              <line x1={50} y1={100} x2={50} y2={156} stroke={C.amber} strokeWidth={2}/>
              <polygon points="50,156 46,146 54,146" fill={C.amber}/>
              <text x={50} y={170} fill={C.amber} fontSize={10} textAnchor="middle" fontWeight={600}>F</text>

              <line x1={50} y1={100} x2={100} y2={100} stroke={C.cyan} strokeWidth={2}/>
              <polygon points="100,100 92,96 92,104" fill={C.cyan}/>
              <text x={105} y={104} fill={C.cyan} fontSize={10} fontWeight={600}>B</text>

              <circle cx={50} cy={100} r={8} fill={C.surfaceAlt} stroke={C.accent} strokeWidth={1.5}/>
              <text x={50} y={104} fill={C.accent} fontSize={10} fontWeight={700} textAnchor="middle">⊗</text>
              <text x={50} y={120} fill={C.accent} fontSize={10} textAnchor="middle">I</text>
            </g>
          </svg>
        </div>
        <span style={S.eq}>F = B × I × L&nbsp;&nbsp;&nbsp;(force on conductor of length L carrying current I in field B)</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>This force is the basis of ALL motor action. Every DC motor, every induction motor, and every synchronous motor produces torque because current-carrying conductors experience forces in magnetic fields. F = BIL on rotor bars is what makes the shaft spin.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Force" value={`${F.toFixed(2)} N`} color={C.amber}/>
        <RI label="Torque (r=0.1m)" value={`${(F * 0.1).toFixed(3)} N·m`} color={C.green}/>
      </div>
      <div style={S.controls}>
        <CG label="B (T)" min={0.1} max={2} step={0.1} value={Bv} set={setBv}/>
        <CG label="I (A)" min={1} max={50} step={1} value={Iv} set={setIv}/>
        <CG label="L (m)" min={0.05} max={1} step={0.05} value={Lv} set={setLv}/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 4 — Lenz's Law
   ═══════════════════════════════════════════════════════════════════ */
function LenzTab() {
  const [pos, setPos] = useState(0.5);
  const [prevPos, setPrevPos] = useState(0.5);
  const [polarity, setPolarity] = useState(1);
  const [run, setRun] = useState(true);
  const af = useRef(); const lt = useRef(0);
  const phase = useRef(0);
  const posRef = useRef(0.5);

  useEffect(() => {
    if (!run) { lt.current = 0; return; }
    const tick = t => {
      if (lt.current) {
        const dt = (t - lt.current) / 1000;
        phase.current += dt * 1.5;
        const p = 0.5 + 0.4 * Math.sin(phase.current);
        setPrevPos(posRef.current);
        setPos(p);
        posRef.current = p;
      }
      lt.current = t;
      af.current = requestAnimationFrame(tick);
    };
    af.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(af.current);
  }, [run]);

  const delta = pos - prevPos;
  const approaching = delta > 0;
  const moving = Math.abs(delta) > 0.001;
  const magnetY = 30 + pos * 160;
  const inducedDir = moving ? (approaching === (polarity < 0) ? 'ccw' : 'cw') : 'none';

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Lenz's Law</p><p style={S.sub}>The induced current flows in a direction that opposes the change in flux causing it</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 500 340" style={{ width:'100%', maxWidth:500 }}>
            {/* Coil (front view) */}
            <ellipse cx={200} cy={260} rx={70} ry={20} fill="none" stroke={C.accent} strokeWidth={2.5}/>
            <ellipse cx={200} cy={250} rx={70} ry={20} fill="none" stroke={C.accent} strokeWidth={2} opacity={0.5}/>
            <ellipse cx={200} cy={270} rx={70} ry={20} fill="none" stroke={C.accent} strokeWidth={2} opacity={0.5}/>

            {/* Bar magnet */}
            <g transform={`translate(175,${magnetY})`}>
              <rect x={0} y={0} width={50} height={60} rx={5} fill={polarity > 0 ? '#1e3a5f' : '#3f1e1e'} stroke={polarity > 0 ? C.cyan : C.red} strokeWidth={1.5}/>
              <rect x={0} y={30} width={50} height={30} rx={0} fill={polarity > 0 ? '#3f1e1e' : '#1e3a5f'} stroke={polarity > 0 ? C.red : C.cyan} strokeWidth={1.5}/>
              <text x={25} y={22} fill="#fff" fontSize={14} fontWeight={700} textAnchor="middle">{polarity > 0 ? 'N' : 'S'}</text>
              <text x={25} y={52} fill="#fff" fontSize={14} fontWeight={700} textAnchor="middle">{polarity > 0 ? 'S' : 'N'}</text>
            </g>

            {/* Flux lines from magnet */}
            {[-20, 0, 20].map(dx => (
              <line key={dx} x1={200 + dx} y1={magnetY + 60} x2={200 + dx} y2={245} stroke={C.green} strokeWidth={1} opacity={0.5} strokeDasharray="4 3"
                markerEnd="url(#arrowG)"/>
            ))}
            <defs><marker id="arrowG" viewBox="0 0 6 6" refX={6} refY={3} markerWidth={6} markerHeight={6} orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={C.green} opacity={0.5}/></marker></defs>

            {/* Induced current arrows */}
            {moving && inducedDir !== 'none' && (<g>
              {inducedDir === 'cw' ? (
                <path d="M 140,260 A 65,18 0 0 1 260,260" fill="none" stroke={C.amber} strokeWidth={2} markerEnd="url(#arrowA)"/>
              ) : (
                <path d="M 260,260 A 65,18 0 0 1 140,260" fill="none" stroke={C.amber} strokeWidth={2} markerEnd="url(#arrowA)"/>
              )}
              <defs><marker id="arrowA" viewBox="0 0 6 6" refX={6} refY={3} markerWidth={6} markerHeight={6} orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={C.amber}/></marker></defs>
            </g>)}

            {/* Status indicators */}
            <g transform="translate(310,50)">
              <text x={0} y={0} fill={C.muted} fontSize={12} fontWeight={600}>Status</text>
              <text x={0} y={22} fill={C.dim} fontSize={11}>Magnet: <tspan fill={moving ? (approaching ? C.green : C.red) : C.dim}>{moving ? (approaching ? 'Approaching ↓' : 'Receding ↑') : 'Stationary'}</tspan></text>
              <text x={0} y={42} fill={C.dim} fontSize={11}>Flux through coil: <tspan fill={C.green}>{moving ? (approaching ? 'Increasing' : 'Decreasing') : 'Constant'}</tspan></text>
              <text x={0} y={62} fill={C.dim} fontSize={11}>Induced EMF: <tspan fill={C.amber}>{moving ? 'Present' : 'Zero'}</tspan></text>
              <text x={0} y={82} fill={C.dim} fontSize={11}>Current: <tspan fill={C.amber}>{inducedDir === 'none' ? 'None' : inducedDir === 'cw' ? 'Clockwise ↻' : 'Counter-CW ↺'}</tspan></text>
              <text x={0} y={110} fill={C.accentLight} fontSize={11} fontWeight={600}>Opposes flux change!</text>

              <rect x={-6} y={130} width={170} height={80} rx={8} fill={C.accentGlow} stroke={C.accent} strokeWidth={0.5}/>
              <text x={0} y={150} fill={C.accentLight} fontSize={10} fontWeight={700}>KEY INSIGHT</text>
              <text x={0} y={168} fill={C.muted} fontSize={10}>If flux ↑ → induced B opposes ↑</text>
              <text x={0} y={184} fill={C.muted} fontSize={10}>If flux ↓ → induced B supports ↓</text>
              <text x={0} y={200} fill={C.muted} fontSize={10}>Nature resists change!</text>
            </g>
          </svg>
        </div>
        <span style={S.eq}>ε = −dΦ/dt&nbsp;&nbsp;&nbsp;(the minus sign IS Lenz's law)</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>Back-EMF in motors (opposes supply, limits current), transformer polarity dots, eddy-current braking in meters and trains, and induction heating all rely on Lenz's law.</p></div>
      </div>
      <div style={S.controls}>
        <CG label="Magnet position" min={0} max={1} step={0.01} value={pos} set={v => { setPrevPos(posRef.current); posRef.current = v; setPos(v); setRun(false); lt.current = 0; }}/>
        <button style={S.btn(false)} onClick={() => setPolarity(p => p * -1)}>Flip polarity</button>
        <button style={S.btn(run)} onClick={() => { setRun(!run); lt.current = 0; }}>{run ? 'Pause' : 'Animate'}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 5 — Magnetic Circuits
   ═══════════════════════════════════════════════════════════════════ */
function MagCktTab() {
  const [N, setN] = useState(200);
  const [I, setI] = useState(2);
  const [gap, setGap] = useState(2);
  const [muR, setMuR] = useState(2000);

  const mu0 = 4 * Math.PI * 1e-7;
  const A = 0.001;
  const lCore = 0.3;
  const lGap = gap * 1e-3;
  const Rcore = lCore / (mu0 * muR * A);
  const Rgap = lGap / (mu0 * A);
  const Rtotal = Rcore + Rgap;
  const mmf = N * I;
  const phi = mmf / Rtotal;
  const Bcore = phi / A;
  const Bgap = phi / A;

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Magnetic Circuits</p><p style={S.sub}>Magnetic flux follows paths of least reluctance — analogous to Ohm's law for electric circuits</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 300" style={{ width:'100%', maxWidth:560 }}>
            {/* C-core */}
            <path d="M 60,40 L 200,40 L 200,120 L 140,120 L 140,180 L 200,180 L 200,260 L 60,260 Z"
              fill="none" stroke={C.cyan} strokeWidth={4} strokeLinejoin="round" opacity={0.7}/>
            <text x={50} y={155} fill={C.dim} fontSize={10} textAnchor="end" transform="rotate(-90,50,155)">Core (μᵣ={muR})</text>

            {/* Air gap */}
            <rect x={135} y={122} width={12} height={56} fill={C.bg} stroke={C.amber} strokeWidth={1.5} strokeDasharray="3 2"/>
            <text x={148} y={155} fill={C.amber} fontSize={9} fontWeight={600}>{gap}mm</text>

            {/* Coil on left leg */}
            {[70, 90, 110, 130, 150, 170, 190, 210, 230].map(y => (
              <ellipse key={y} cx={60} cy={y} rx={18} ry={8} fill="none" stroke={C.accent} strokeWidth={1.5} opacity={0.6}/>
            ))}
            <text x={22} y={155} fill={C.accentLight} fontSize={10} fontWeight={600}>N={N}</text>

            {/* Flux arrows */}
            {(() => {
              const opacity = Math.min(1, phi * 1e4);
              return (<g opacity={opacity}>
                <path d="M 130,60 L 130,40 L 60,40 L 60,260 L 130,260 L 130,230" fill="none" stroke={C.green} strokeWidth={2} markerEnd="url(#fluxArr)"/>
                <path d="M 130,180 L 130,120" fill="none" stroke={C.green} strokeWidth={2} strokeDasharray="4 2" markerEnd="url(#fluxArr)"/>
                <defs><marker id="fluxArr" viewBox="0 0 8 8" refX={8} refY={4} markerWidth={8} markerHeight={8} orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={C.green}/></marker></defs>
                <text x={108} y={155} fill={C.green} fontSize={10} fontWeight={600}>Φ</text>
              </g>);
            })()}

            {/* Electric circuit analogy */}
            <g transform="translate(280,30)">
              <text x={110} y={0} fill={C.muted} fontSize={12} fontWeight={700} textAnchor="middle">Equivalent Circuit</text>

              {/* Battery (MMF) */}
              <line x1={40} y1={30} x2={40} y2={80} stroke={C.accent} strokeWidth={2}/>
              <line x1={30} y1={50} x2={50} y2={50} stroke={C.accent} strokeWidth={3}/>
              <line x1={34} y1={60} x2={46} y2={60} stroke={C.accent} strokeWidth={2}/>
              <text x={55} y={58} fill={C.accentLight} fontSize={10}>MMF = NI</text>
              <text x={55} y={72} fill={C.accentLight} fontSize={10} fontFamily="monospace">= {mmf} At</text>

              {/* R_core */}
              <line x1={40} y1={30} x2={110} y2={30} stroke={C.muted} strokeWidth={1.5}/>
              <rect x={110} y={22} width={60} height={16} rx={4} fill="none" stroke={C.cyan} strokeWidth={1.5}/>
              <text x={140} y={34} fill={C.cyan} fontSize={9} textAnchor="middle" fontWeight={600}>R_core</text>
              <text x={140} y={52} fill={C.dim} fontSize={9} textAnchor="middle">{(Rcore / 1e6).toFixed(1)} MAt/Wb</text>

              {/* R_gap */}
              <line x1={170} y1={30} x2={220} y2={30} stroke={C.muted} strokeWidth={1.5}/>
              <line x1={220} y1={30} x2={220} y2={80} stroke={C.muted} strokeWidth={1.5}/>
              <rect x={185} y={72} width={60} height={16} rx={4} fill="none" stroke={C.amber} strokeWidth={1.5}/>
              <text x={215} y={84} fill={C.amber} fontSize={9} textAnchor="middle" fontWeight={600}>R_gap</text>
              <text x={215} y={100} fill={C.dim} fontSize={9} textAnchor="middle">{(Rgap / 1e6).toFixed(1)} MAt/Wb</text>

              {/* Bottom wire */}
              <line x1={40} y1={80} x2={220} y2={80} stroke={C.muted} strokeWidth={1.5}/>

              {/* Flux current */}
              <text x={130} y={130} fill={C.green} fontSize={11} textAnchor="middle" fontWeight={600}>Φ = MMF / R_total</text>
              <text x={130} y={148} fill={C.green} fontSize={11} textAnchor="middle" fontFamily="monospace">{(phi * 1e3).toFixed(3)} mWb</text>

              {/* Analogy table */}
              <g transform="translate(0,170)">
                <text x={110} y={0} fill={C.muted} fontSize={11} fontWeight={700} textAnchor="middle">Analogy</text>
                <text x={20} y={20} fill={C.dim} fontSize={10}>V = IR</text>
                <text x={20} y={36} fill={C.accentLight} fontSize={10}>MMF = ΦR</text>
                <text x={130} y={20} fill={C.dim} fontSize={10}>V → MMF (NI)</text>
                <text x={130} y={36} fill={C.dim} fontSize={10}>I → Φ (flux)</text>
                <text x={130} y={52} fill={C.dim} fontSize={10}>R → ℛ (reluctance)</text>
              </g>
            </g>
          </svg>
        </div>
        <span style={S.eq}>MMF = Φ × ℛ&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;ℛ = l / (μ₀ μᵣ A)&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;Φ = NI / (ℛ_core + ℛ_gap)</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>Transformer and motor core design revolves around magnetic circuits. The air gap in a motor is the dominant reluctance — it determines the magnetizing current needed. Reducing the air gap lowers losses but complicates mechanical design.</p></div>
      </div>
      <div style={S.results}>
        <RI label="MMF" value={`${mmf} At`} color={C.accent}/>
        <RI label="Flux Φ" value={`${(phi * 1e3).toFixed(3)} mWb`} color={C.green}/>
        <RI label="B (core)" value={`${Bcore.toFixed(2)} T`} color={C.cyan}/>
        <RI label="ℛ_core" value={`${(Rcore / 1e6).toFixed(1)} M`} color={C.dim}/>
        <RI label="ℛ_gap" value={`${(Rgap / 1e6).toFixed(1)} M`} color={C.amber}/>
      </div>
      <div style={S.controls}>
        <CG label="Turns N" min={50} max={500} step={10} value={N} set={setN}/>
        <CG label="Current I (A)" min={0.5} max={10} step={0.5} value={I} set={setI}/>
        <CG label="Air gap (mm)" min={0.5} max={10} step={0.5} value={gap} set={setGap}/>
        <CG label="μᵣ (core)" min={500} max={5000} step={100} value={muR} set={setMuR}/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 6 — BH Curve & Hysteresis
   ═══════════════════════════════════════════════════════════════════ */
const MATERIALS = {
  'Si Steel':  { Bs: 1.8, Hc: 50,  k: 0.018, color: C.cyan },
  'Cast Iron': { Bs: 1.2, Hc: 300, k: 0.005, color: C.amber },
  'Ferrite':   { Bs: 0.45, Hc: 15, k: 0.04,  color: C.green },
};

function BHTab() {
  const [mat, setMat] = useState('Si Steel');
  const [Hmax, setHmax] = useState(500);
  const [run, setRun] = useState(true);
  const [phase, setPhase] = useState(0);
  const af = useRef(); const lt = useRef(0);

  useEffect(() => {
    if (!run) { lt.current = 0; return; }
    const tick = t => {
      if (lt.current) setPhase(p => p + (t - lt.current) / 1000 * 1.2);
      lt.current = t;
      af.current = requestAnimationFrame(tick);
    };
    af.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(af.current);
  }, [run]);

  const m = MATERIALS[mat];
  const bh = (H, ascending) => m.Bs * Math.tanh(m.k * (H + (ascending ? m.Hc : -m.Hc)));

  const cx = 220, cy = 170, scaleX = 160 / Hmax, scaleY = 140 / m.Bs;

  const loopPath = useMemo(() => {
    const pts = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const H = Hmax * Math.sin(t * 2 * Math.PI);
      const asc = Math.cos(t * 2 * Math.PI) < 0;
      const B = bh(H, asc);
      pts.push(`${i === 0 ? 'M' : 'L'}${cx + H * scaleX},${cy - B * scaleY}`);
    }
    return pts.join(' ');
  }, [mat, Hmax]);

  const currentH = Hmax * Math.sin(phase);
  const currentAsc = Math.cos(phase) < 0;
  const currentB = bh(currentH, currentAsc);

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>BH Curve & Hysteresis</p><p style={S.sub}>Magnetic materials exhibit saturation and hysteresis — the shaded loop area represents energy loss per cycle</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 500 340" style={{ width:'100%', maxWidth:500 }}>
            {/* Axes */}
            <line x1={60} y1={cy} x2={400} y2={cy} stroke={C.borderLight} strokeWidth={1}/>
            <line x1={cx} y1={20} x2={cx} y2={320} stroke={C.borderLight} strokeWidth={1}/>
            <text x={405} y={cy + 4} fill={C.dim} fontSize={11}>H (A/m)</text>
            <text x={cx + 5} y={18} fill={C.dim} fontSize={11}>B (T)</text>

            {/* Axis labels */}
            <text x={cx + Hmax * scaleX} y={cy + 16} fill={C.faint} fontSize={9} textAnchor="middle">{Hmax}</text>
            <text x={cx - Hmax * scaleX} y={cy + 16} fill={C.faint} fontSize={9} textAnchor="middle">-{Hmax}</text>
            <text x={cx - 12} y={cy - m.Bs * scaleY + 4} fill={C.faint} fontSize={9} textAnchor="end">{m.Bs.toFixed(1)}</text>
            <text x={cx - 12} y={cy + m.Bs * scaleY + 4} fill={C.faint} fontSize={9} textAnchor="end">-{m.Bs.toFixed(1)}</text>

            {/* Hysteresis loop */}
            <path d={loopPath} fill={m.color + '15'} stroke={m.color} strokeWidth={2}/>

            {/* Coercivity markers */}
            <line x1={cx - m.Hc * scaleX} y1={cy - 6} x2={cx - m.Hc * scaleX} y2={cy + 6} stroke={C.red} strokeWidth={1.5}/>
            <line x1={cx + m.Hc * scaleX} y1={cy - 6} x2={cx + m.Hc * scaleX} y2={cy + 6} stroke={C.red} strokeWidth={1.5}/>
            <text x={cx + m.Hc * scaleX} y={cy + 22} fill={C.red} fontSize={9} textAnchor="middle">Hc</text>
            <text x={cx - m.Hc * scaleX} y={cy + 22} fill={C.red} fontSize={9} textAnchor="middle">-Hc</text>

            {/* Saturation lines */}
            <line x1={60} y1={cy - m.Bs * scaleY} x2={400} y2={cy - m.Bs * scaleY} stroke={C.dim} strokeWidth={0.5} strokeDasharray="4 4"/>
            <line x1={60} y1={cy + m.Bs * scaleY} x2={400} y2={cy + m.Bs * scaleY} stroke={C.dim} strokeWidth={0.5} strokeDasharray="4 4"/>
            <text x={62} y={cy - m.Bs * scaleY - 4} fill={C.dim} fontSize={9}>B_sat</text>

            {/* Current operating point */}
            <circle cx={cx + currentH * scaleX} cy={cy - currentB * scaleY} r={5} fill={C.red} stroke="#fff" strokeWidth={1.5}/>

            {/* Legend */}
            <g transform="translate(410,40)">
              <text x={0} y={0} fill={C.muted} fontSize={11} fontWeight={700}>{mat}</text>
              <text x={0} y={18} fill={C.dim} fontSize={10}>B_sat = {m.Bs} T</text>
              <text x={0} y={34} fill={C.dim} fontSize={10}>Hc = {m.Hc} A/m</text>
              <text x={0} y={58} fill={C.faint} fontSize={10}>Loop area =</text>
              <text x={0} y={72} fill={C.faint} fontSize={10}>energy loss/cycle</text>
            </g>
          </svg>
        </div>
        <span style={S.eq}>B = μ₀ μᵣ H&nbsp;&nbsp;&nbsp;(linear region)&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;P_hyst = k_h · f · B^n_max&nbsp;&nbsp;(Steinmetz)</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>Core losses (hysteresis + eddy current) are a major concern in transformers and motors. Silicon steel laminations reduce these losses. The BH curve determines the magnetizing current waveform — saturation causes harmonics.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Current H" value={`${currentH.toFixed(0)} A/m`} color={m.color}/>
        <RI label="Current B" value={`${currentB.toFixed(3)} T`} color={m.color}/>
        <RI label="B_sat" value={`${m.Bs} T`} color={C.accent}/>
        <RI label="Coercivity Hc" value={`${m.Hc} A/m`} color={C.red}/>
      </div>
      <div style={S.controls}>
        <div style={S.cg}>
          <span style={S.label}>Material</span>
          <select value={mat} onChange={e => setMat(e.target.value)} style={S.sel}>
            {Object.keys(MATERIALS).map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        <CG label="H_max (A/m)" min={100} max={2000} step={50} value={Hmax} set={setHmax}/>
        <button style={S.btn(run)} onClick={() => { setRun(!run); lt.current = 0; }}>{run ? 'Pause' : 'Animate'}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 7 — Self & Mutual Inductance
   ═══════════════════════════════════════════════════════════════════ */
function InductanceTab() {
  const [N1, setN1] = useState(200);
  const [N2, setN2] = useState(100);
  const [k, setK] = useState(0.85);
  const [Ipk, setIpk] = useState(5);
  const [phase, setPhase] = useState(0);
  const [run, setRun] = useState(true);
  const af = useRef(); const lt = useRef(0);

  useEffect(() => {
    if (!run) { lt.current = 0; return; }
    const tick = t => {
      if (lt.current) setPhase(p => p + (t - lt.current) / 1000 * 2.5);
      lt.current = t;
      af.current = requestAnimationFrame(tick);
    };
    af.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(af.current);
  }, [run]);

  const mu0 = 4 * Math.PI * 1e-7;
  const A = 5e-4; const l = 0.1;
  const L1 = mu0 * N1 * N1 * A / l;
  const L2 = mu0 * N2 * N2 * A / l;
  const M = k * Math.sqrt(L1 * L2);
  const omega = 2 * Math.PI * 50;
  const i1 = Ipk * Math.sin(phase);
  const v2 = M * Ipk * omega * Math.cos(phase);
  const norm = (phase % (2 * Math.PI)) / (2 * Math.PI);

  const nLinked = Math.round(k * 5);
  const nLeakage = 5 - nLinked;

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Self & Mutual Inductance</p><p style={S.sub}>Flux linkage between coils — the operating principle of every transformer</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 580 310" style={{ width:'100%', maxWidth:580 }}>
            {/* Primary coil */}
            <g transform="translate(60,50)">
              <text x={35} y={-8} fill={C.accent} fontSize={11} fontWeight={600} textAnchor="middle">Primary (N₁={N1})</text>
              {[0,20,40,60,80,100,120,140].map(y => (
                <path key={y} d={`M 10,${y} Q 35,${y - 12} 60,${y}`} fill="none" stroke={C.accent} strokeWidth={2} opacity={0.7}/>
              ))}
            </g>

            {/* Secondary coil */}
            <g transform="translate(190,50)">
              <text x={35} y={-8} fill={C.amber} fontSize={11} fontWeight={600} textAnchor="middle">Secondary (N₂={N2})</text>
              {[0,20,40,60,80,100,120,140].map(y => (
                <path key={y} d={`M 10,${y} Q 35,${y - 12} 60,${y}`} fill="none" stroke={C.amber} strokeWidth={2} opacity={0.7}/>
              ))}
            </g>

            {/* Linked flux lines */}
            {Array.from({ length: nLinked }).map((_, i) => {
              const y = 75 + i * 25;
              return <path key={`l${i}`} d={`M 85,${y} C 120,${y - 15} 170,${y - 15} 205,${y}`} fill="none" stroke={C.green} strokeWidth={1.5} opacity={0.6} strokeDasharray="5 3"/>;
            })}
            {/* Leakage flux */}
            {Array.from({ length: nLeakage }).map((_, i) => {
              const y = 75 + (nLinked + i) * 25;
              return <path key={`k${i}`} d={`M 85,${y} C 100,${y - 20} 100,${y + 20} 85,${y + 10}`} fill="none" stroke={C.red} strokeWidth={1} opacity={0.4} strokeDasharray="3 3"/>;
            })}

            <text x={150} y={230} fill={C.green} fontSize={10} textAnchor="middle" fontWeight={600}>Linked flux (k={k.toFixed(2)})</text>
            {nLeakage > 0 && <text x={70} y={248} fill={C.red} fontSize={10} textAnchor="middle" opacity={0.7}>Leakage</text>}

            {/* Waveforms */}
            <g transform="translate(290,20)">
              <text x={130} y={6} fill={C.muted} fontSize={10} fontWeight={600} textAnchor="middle">i₁(t) and v₂(t)</text>
              {/* i1 */}
              <line x1={0} y1={70} x2={260} y2={70} stroke={C.borderLight} strokeWidth={0.6}/>
              <path d={wavePath(Math.sin, 0, 70, 260, 45)} fill="none" stroke={C.accent} strokeWidth={1.5} opacity={0.7}/>
              <circle cx={norm * 260} cy={70 - Math.sin(phase) * 22.5} r={3.5} fill={C.accent}/>
              <text x={265} y={74} fill={C.accent} fontSize={9}>i₁</text>

              {/* v2 */}
              <g transform="translate(0,100)">
                <line x1={0} y1={70} x2={260} y2={70} stroke={C.borderLight} strokeWidth={0.6}/>
                <path d={wavePath(Math.cos, 0, 70, 260, 45)} fill="none" stroke={C.amber} strokeWidth={1.5} opacity={0.7}/>
                <circle cx={norm * 260} cy={70 - Math.cos(phase) * 22.5} r={3.5} fill={C.amber}/>
                <text x={265} y={74} fill={C.amber} fontSize={9}>v₂</text>
              </g>

              <text x={130} y={260} fill={C.dim} fontSize={10} textAnchor="middle">v₂ leads i₁ by 90° (derivative)</text>
            </g>
          </svg>
        </div>
        <span style={S.eq}>L = N²μ₀A/l&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;M = k√(L₁L₂)&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;v₂ = M · di₁/dt</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>Mutual inductance M defines transformer coupling. k ≈ 0.95-0.99 for power transformers with iron cores. Leakage flux (1 − k) causes leakage reactance, which limits fault current and causes voltage drop under load.</p></div>
      </div>
      <div style={S.results}>
        <RI label="L₁" value={`${(L1 * 1e3).toFixed(2)} mH`} color={C.accent}/>
        <RI label="L₂" value={`${(L2 * 1e3).toFixed(2)} mH`} color={C.amber}/>
        <RI label="M" value={`${(M * 1e3).toFixed(2)} mH`} color={C.green}/>
        <RI label="v₂ peak" value={`${(M * Ipk * omega).toFixed(1)} V`} color={C.amber}/>
      </div>
      <div style={S.controls}>
        <CG label="N₁" min={50} max={500} step={10} value={N1} set={setN1}/>
        <CG label="N₂" min={50} max={500} step={10} value={N2} set={setN2}/>
        <CG label="k (coupling)" min={0} max={1} step={0.05} value={k} set={setK}/>
        <CG label="I₁ peak (A)" min={1} max={20} step={1} value={Ipk} set={setIpk}/>
        <button style={S.btn(run)} onClick={() => { setRun(!run); lt.current = 0; }}>{run ? 'Pause' : 'Animate'}</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 8 — Electromechanical Energy Conversion
   ═══════════════════════════════════════════════════════════════════ */
function EnergyTab() {
  const [current, setCurrent] = useState(5);
  const [gapMm, setGapMm] = useState(5);
  const N = 500;
  const mu0 = 4 * Math.PI * 1e-7;
  const A = 4e-4;

  const x = gapMm * 1e-3;
  const L = mu0 * N * N * A / (2 * x);
  const lambda = L * current;
  const Wfield = 0.5 * L * current * current;
  const Wcoenergy = Wfield;
  const dLdx = -mu0 * N * N * A / (2 * x * x);
  const force = 0.5 * current * current * dLdx;

  const plotW = 200, plotH = 180;
  const maxLambda = mu0 * N * N * A / (2 * 1e-3) * 20;
  const lambdaScale = plotH / Math.max(maxLambda, lambda * 1.2);
  const iScale = plotW / 22;

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Electromechanical Energy Conversion</p><p style={S.sub}>Force and torque arise from the variation of stored magnetic energy with position</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 330" style={{ width:'100%', maxWidth:560 }}>
            {/* U-shaped electromagnet */}
            <g transform="translate(30,20)">
              <text x={80} y={0} fill={C.muted} fontSize={11} fontWeight={600} textAnchor="middle">Electromagnet</text>
              {/* Core */}
              <path d="M 20,200 L 20,40 L 60,40 L 60,160 L 100,160 L 100,40 L 140,40 L 140,200" fill="none" stroke={C.cyan} strokeWidth={4} strokeLinejoin="round"/>
              {/* Coil */}
              {[60,75,90,105,120,135,150].map(y => (
                <ellipse key={y} cx={30} cy={y} rx={16} ry={7} fill="none" stroke={C.accent} strokeWidth={1.5} opacity={0.6}/>
              ))}
              <text x={6} y={110} fill={C.accentLight} fontSize={8} fontWeight={600}>N</text>

              {/* Armature */}
              {(() => {
                const ay = 200 + Math.min(gapMm * 3, 50);
                return (<g>
                  <rect x={15} y={ay} width={130} height={20} rx={4} fill={C.surfaceAlt} stroke={C.amber} strokeWidth={2}/>
                  <text x={80} y={ay + 14} fill={C.amber} fontSize={10} textAnchor="middle" fontWeight={600}>Armature</text>
                  {/* Gap indicator */}
                  <line x1={80} y1={200} x2={80} y2={ay} stroke={C.dim} strokeWidth={1} strokeDasharray="3 2"/>
                  <text x={90} y={(200 + ay) / 2 + 4} fill={C.dim} fontSize={9}>g={gapMm}mm</text>
                  {/* Force arrow */}
                  {force < 0 && (<g>
                    <line x1={80} y1={ay + 25} x2={80} y2={ay + 25 - Math.min(Math.abs(force) * 0.3, 40)} stroke={C.green} strokeWidth={2.5}/>
                    <polygon points={`80,${ay + 25 - Math.min(Math.abs(force) * 0.3, 40)} 76,${ay + 25 - Math.min(Math.abs(force) * 0.3, 40) + 7} 84,${ay + 25 - Math.min(Math.abs(force) * 0.3, 40) + 7}`} fill={C.green}/>
                    <text x={95} y={ay + 15 - Math.min(Math.abs(force) * 0.15, 20)} fill={C.green} fontSize={10} fontWeight={600}>F↑</text>
                  </g>)}
                </g>);
              })()}

              {/* Flux in core */}
              <path d="M 40,50 L 40,155 M 120,155 L 120,50" fill="none" stroke={C.green} strokeWidth={1.5} opacity={0.5} strokeDasharray="4 3"/>
            </g>

            {/* Lambda-i diagram */}
            <g transform="translate(280,30)">
              <text x={100} y={0} fill={C.muted} fontSize={11} fontWeight={600} textAnchor="middle">λ-i Diagram</text>
              {/* Axes */}
              <line x1={0} y1={plotH + 15} x2={plotW + 10} y2={plotH + 15} stroke={C.borderLight} strokeWidth={1}/>
              <line x1={0} y1={plotH + 15} x2={0} y2={5} stroke={C.borderLight} strokeWidth={1}/>
              <text x={plotW / 2} y={plotH + 35} fill={C.faint} fontSize={10} textAnchor="middle">i (A) →</text>
              <text x={-10} y={plotH / 2} fill={C.faint} fontSize={10} textAnchor="middle" transform={`rotate(-90,-10,${plotH / 2})`}>λ (Wb) →</text>

              {/* L(x) line — slope = L */}
              <line x1={0} y1={plotH + 15} x2={Math.min(current * iScale, plotW)} y2={plotH + 15 - Math.min(lambda * lambdaScale, plotH)} stroke={C.cyan} strokeWidth={2}/>

              {/* Operating point */}
              <circle cx={Math.min(current * iScale, plotW)} cy={plotH + 15 - Math.min(lambda * lambdaScale, plotH)} r={5} fill={C.red} stroke="#fff" strokeWidth={1.5}/>

              {/* Co-energy (area below line, triangle) */}
              <polygon points={`0,${plotH + 15} ${Math.min(current * iScale, plotW)},${plotH + 15} ${Math.min(current * iScale, plotW)},${plotH + 15 - Math.min(lambda * lambdaScale, plotH)}`} fill={C.green} opacity={0.15}/>
              <text x={Math.min(current * iScale * 0.5, plotW * 0.5)} y={plotH + 5} fill={C.green} fontSize={9} textAnchor="middle" fontWeight={600}>W' (co-energy)</text>

              {/* Field energy (area above line) */}
              <polygon points={`0,${plotH + 15} 0,${plotH + 15 - Math.min(lambda * lambdaScale, plotH)} ${Math.min(current * iScale, plotW)},${plotH + 15 - Math.min(lambda * lambdaScale, plotH)}`} fill={C.accent} opacity={0.12}/>
              <text x={Math.min(current * iScale * 0.3, plotW * 0.3)} y={plotH + 15 - Math.min(lambda * lambdaScale * 0.6, plotH * 0.6)} fill={C.accentLight} fontSize={9} textAnchor="middle" fontWeight={600}>W_fld</text>

              {/* Slope label */}
              <text x={Math.min(current * iScale, plotW) + 10} y={plotH + 15 - Math.min(lambda * lambdaScale, plotH) - 5} fill={C.dim} fontSize={9}>slope = L(x)</text>

              {/* Explanatory text */}
              <g transform={`translate(0,${plotH + 50})`}>
                <text x={0} y={0} fill={C.dim} fontSize={10}>For linear system:</text>
                <text x={0} y={16} fill={C.dim} fontSize={10}>W_fld = W' = ½Li²</text>
                <text x={0} y={32} fill={C.green} fontSize={10} fontWeight={600}>F = ½i² · dL/dx</text>
              </g>
            </g>
          </svg>
        </div>
        <span style={S.eq}>W_fld = ½λ²/L = ½Li²&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;F = ∂W'/∂x at i=const = ½i² dL/dx</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>This is THE bridge principle. Every motor produces torque because L (inductance) changes with rotor position. In rotating machines, T = ½i²·dL/dθ. Reluctance motors, solenoid actuators, and relays all convert electrical energy to mechanical energy through this mechanism.</p></div>
      </div>
      <div style={S.results}>
        <RI label="L(x)" value={`${(L * 1e3).toFixed(2)} mH`} color={C.cyan}/>
        <RI label="λ" value={`${(lambda * 1e3).toFixed(2)} mWb`} color={C.accent}/>
        <RI label="W_field" value={`${(Wfield * 1e3).toFixed(2)} mJ`} color={C.accentLight}/>
        <RI label="Force" value={`${force.toFixed(2)} N`} color={C.green}/>
      </div>
      <div style={S.controls}>
        <CG label="Current (A)" min={1} max={20} step={1} value={current} set={setCurrent}/>
        <CG label="Air gap (mm)" min={1} max={20} step={0.5} value={gapMm} set={setGapMm}/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 9 — Maxwell's Equations
   ═══════════════════════════════════════════════════════════════════ */
function MaxwellTab() {
  const [form, setForm] = useState('integral');

  const eqs = [
    {
      name: "Gauss's Law (E)",
      integral: '∮ E · dA = Q_enc / ε₀',
      diff: '∇ · E = ρ / ε₀',
      desc: 'Electric flux through a closed surface equals enclosed charge. Governs electric field distribution.',
      color: C.amber,
      link: 'Capacitor charging, insulation stress in cables',
    },
    {
      name: "Gauss's Law (B)",
      integral: '∮ B · dA = 0',
      diff: '∇ · B = 0',
      desc: 'Magnetic field lines always form closed loops — no magnetic monopoles exist.',
      color: C.green,
      link: 'Flux must return through core or air — basis of magnetic circuit analysis',
    },
    {
      name: "Faraday's Law",
      integral: '∮ E · dl = −dΦ_B/dt',
      diff: '∇ × E = −∂B/∂t',
      desc: 'A time-varying magnetic field induces an electric field. Foundation of generators and transformers.',
      color: C.cyan,
      link: "→ See Faraday's Law tab for interactive demo",
    },
    {
      name: "Ampère-Maxwell Law",
      integral: '∮ B · dl = μ₀(I + ε₀ dΦ_E/dt)',
      diff: '∇ × B = μ₀J + μ₀ε₀ ∂E/∂t',
      desc: 'Magnetic field arises from current AND changing electric field (displacement current).',
      color: C.accent,
      link: "→ See Ampère's Law tab for the static case",
    },
  ];

  const icons = [
    (cx, cy) => (<g>
      <circle cx={cx} cy={cy} r={18} fill="none" stroke={C.amber} strokeWidth={1} strokeDasharray="3 2"/>
      {[-10, 0, 10].map(d => <line key={d} x1={cx + d} y1={cy - 6} x2={cx + d + 6} y2={cy - 16} stroke={C.amber} strokeWidth={1.5}/>)}
      <text x={cx} y={cy + 8} fill={C.amber} fontSize={10} textAnchor="middle">+Q</text>
    </g>),
    (cx, cy) => (<g>
      <ellipse cx={cx} cy={cy} rx={22} ry={12} fill="none" stroke={C.green} strokeWidth={1.5}/>
      <ellipse cx={cx} cy={cy} rx={12} ry={6} fill="none" stroke={C.green} strokeWidth={1} opacity={0.5}/>
      <polygon points={`${cx + 22},${cy} ${cx + 17},${cy - 3} ${cx + 17},${cy + 3}`} fill={C.green}/>
    </g>),
    (cx, cy) => (<g>
      <circle cx={cx} cy={cy} r={14} fill="none" stroke={C.cyan} strokeWidth={1.5} strokeDasharray="4 2"/>
      <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} stroke={C.cyan} strokeWidth={2}/>
      <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} stroke={C.cyan} strokeWidth={2}/>
      <text x={cx + 18} y={cy + 4} fill={C.cyan} fontSize={9}>∂B/∂t</text>
    </g>),
    (cx, cy) => (<g>
      <circle cx={cx} cy={cy} r={4} fill={C.accent}/>
      <circle cx={cx} cy={cy} r={12} fill="none" stroke={C.accent} strokeWidth={1.5}/>
      <circle cx={cx} cy={cy} r={20} fill="none" stroke={C.accent} strokeWidth={1} opacity={0.5}/>
      <polygon points={`${cx + 12},${cy} ${cx + 8},${cy - 3} ${cx + 8},${cy + 3}`} fill={C.accent}/>
    </g>),
  ];

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Maxwell's Equations — The Complete Picture</p><p style={S.sub}>Four equations that unify electricity, magnetism, and light</p></div>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
          <button style={S.tab(form === 'integral')} onClick={() => setForm('integral')}>Integral Form</button>
          <button style={{ ...S.tab(form === 'differential'), marginLeft:4 }} onClick={() => setForm('differential')}>Differential Form</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, maxWidth:600, margin:'0 auto', width:'100%' }}>
          {eqs.map((eq, i) => (
            <div key={i} style={{ background:C.surfaceAlt, border:`1px solid ${C.borderLight}`, borderRadius:12, padding:'16px 14px', display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <svg width={48} height={36} viewBox="0 0 48 36">{icons[i](24, 18)}</svg>
                <span style={{ fontSize:12, fontWeight:700, color:eq.color }}>{eq.name}</span>
              </div>
              <span style={{ fontFamily:'monospace', fontSize:14, color:C.mono, background:C.bg, padding:'8px 10px', borderRadius:8, textAlign:'center' }}>
                {form === 'integral' ? eq.integral : eq.diff}
              </span>
              <p style={{ fontSize:11, color:C.muted, lineHeight:1.55, margin:0 }}>{eq.desc}</p>
              <p style={{ fontSize:10, color:C.accentLight, margin:0, fontStyle:'italic' }}>{eq.link}</p>
            </div>
          ))}
        </div>
        <div style={S.note}>
          <span style={S.noteT}>The unified picture</span>
          <p style={S.noteP}>These four equations govern every electromagnetic phenomenon in power systems and machines. Faraday's law gives us generators and transformers. Ampère's law gives us the magnetic field from windings. Gauss's law for B ensures flux continuity in magnetic circuits. Together, they are the complete foundation.</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function ElectromagneticFundamentals() {
  const [tab, setTab] = useState('faraday');

  const TAB_MAP = {
    faraday: FaradayTab,
    ampere: AmpereTab,
    lorentz: LorentzTab,
    lenz: LenzTab,
    'mag-ckt': MagCktTab,
    bh: BHTab,
    inductance: InductanceTab,
    energy: EnergyTab,
    maxwell: MaxwellTab,
  };

  const Active = TAB_MAP[tab];

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        {TABS.map(t => (
          <button key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      <Active />
    </div>
  );
}
