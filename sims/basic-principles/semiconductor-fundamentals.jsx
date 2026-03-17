import React, { useState, useEffect, useRef, useMemo } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   Semiconductor Fundamentals — 13-topic interactive simulation
   Topics: Energy Bands → Doping → Transport → Diode → BJT → MOSFET
           → FinFET → CMOS → Logic → CPU → GPU → MCU → Fabrication
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  bg:'#09090b', surface:'#111114', surfaceAlt:'#18181b',
  border:'#1e1e2e', borderLight:'#27272a',
  accent:'#6366f1', accentLight:'#818cf8', accentGlow:'rgba(99,102,241,0.12)',
  text:'#e4e4e7', muted:'#a1a1aa', dim:'#71717a', faint:'#52525b',
  mono:'#c4b5fd', green:'#22c55e', red:'#ef4444', amber:'#f59e0b', cyan:'#22d3ee',
  pink:'#ec4899', teal:'#14b8a6', orange:'#f97316', violet:'#8b5cf6',
};

const S = {
  container:{ display:'flex', flexDirection:'column', minHeight:'calc(100vh - 3.5rem)', background:C.bg, fontFamily:'Inter,system-ui,sans-serif', color:C.text },
  modeBar:{ display:'flex', gap:4, padding:'10px 16px', background:'#0a0a0f', borderBottom:`1px solid ${C.border}`, flexShrink:0 },
  modeTab:a=>({ padding:'8px 20px', borderRadius:10, border:'none', background:a?C.accent:'transparent', color:a?'#fff':C.dim, fontSize:14, fontWeight:600, cursor:'pointer', transition:'all .15s' }),
  topicBar:{ display:'flex', gap:4, padding:'8px 16px', background:'#0c0c10', borderBottom:`1px solid ${C.border}`, overflowX:'auto', flexShrink:0 },
  topicTab:a=>({ padding:'6px 12px', borderRadius:8, border:'none', background:a?C.surfaceAlt:'transparent', color:a?C.accentLight:C.faint, fontSize:11.5, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s' }),
  body:{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto' },
  section:{ padding:'18px 22px', flex:1, display:'flex', flexDirection:'column', gap:14 },
  svgWrap:{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:260, padding:'4px 0' },
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
  sel:{ padding:'5px 10px', borderRadius:8, border:`1px solid ${C.borderLight}`, background:C.surfaceAlt, color:C.text, fontSize:12, cursor:'pointer' },
  btn:a=>({ padding:'6px 14px', borderRadius:8, border:'none', background:a?C.red:C.green, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }),
  theory:{ flex:1, padding:'28px 22px', maxWidth:820, margin:'0 auto', overflowY:'auto', width:'100%' },
  h2:{ fontSize:20, fontWeight:700, color:'#f4f4f5', margin:'28px 0 12px', paddingBottom:8, borderBottom:`1px solid ${C.borderLight}` },
  h3:{ fontSize:16, fontWeight:600, color:C.text, margin:'20px 0 8px' },
  p:{ fontSize:14, lineHeight:1.8, color:C.muted, margin:'0 0 12px' },
  ul:{ paddingLeft:20, margin:'8px 0' },
  li:{ fontSize:13, lineHeight:1.8, color:C.muted, marginBottom:4 },
  ctx:{ padding:'14px 18px', background:'rgba(99,102,241,0.06)', borderLeft:`3px solid ${C.accent}`, borderRadius:'0 10px 10px 0', margin:'16px 0' },
  ctxT:{ fontWeight:600, color:C.accentLight, marginBottom:6, fontSize:13, display:'block' },
  ctxP:{ fontSize:13, lineHeight:1.7, color:C.muted, margin:0 },
  tbl:{ width:'100%', borderCollapse:'collapse', margin:'12px 0', fontSize:13 },
  th:{ padding:'8px 12px', background:C.surfaceAlt, color:C.accentLight, fontWeight:600, textAlign:'left', borderBottom:`1px solid ${C.borderLight}` },
  td:{ padding:'8px 12px', color:C.muted, borderBottom:`1px solid ${C.border}` },
};

/* ─── Topic tabs ─── */
const TOPIC_TABS = [
  { id:'energy-bands', label:'Energy Bands' },
  { id:'doping', label:'Doping' },
  { id:'transport', label:'Transport' },
  { id:'diode', label:'PN Diode' },
  { id:'bjt', label:'BJT' },
  { id:'mosfet', label:'MOSFET' },
  { id:'finfet', label:'FinFET' },
  { id:'cmos', label:'CMOS' },
  { id:'logic', label:'Logic Gates' },
  { id:'cpu', label:'CPU' },
  { id:'gpu', label:'GPU' },
  { id:'mcu', label:'Microcontrollers' },
  { id:'fab', label:'Fabrication' },
];

/* ─── Reusable components ─── */
const CG = ({ label, min, max, step, value, set, unit }) => (
  <div style={S.cg}>
    <span style={S.label}>{label}</span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(+e.target.value)} style={S.slider} />
    <span style={S.val}>{step < 1 ? value.toFixed(step < 0.01 ? 3 : step < 0.1 ? 2 : 1) : value}{unit || ''}</span>
  </div>
);
const RI = ({ label, value, color }) => (
  <div style={S.ri}>
    <span style={S.rl}>{label}</span>
    <span style={{ ...S.rv, color: color || C.accent }}>{value}</span>
  </div>
);

/* ─── Physics constants ─── */
const k_B = 1.381e-23;   // Boltzmann J/K
const q = 1.602e-19;     // electron charge C
const kT300 = 0.02585;   // kT/q at 300K in eV

const MATERIALS = {
  Si:  { Eg: 1.12, ni300: 1.5e10, munE: 1400, mupE: 450, eps: 11.7, color: C.cyan, label:'Silicon' },
  Ge:  { Eg: 0.66, ni300: 2.4e13, munE: 3900, mupE: 1900, eps: 16.0, color: C.green, label:'Germanium' },
  GaAs:{ Eg: 1.43, ni300: 1.8e6,  munE: 8500, mupE: 400, eps: 12.9, color: C.amber, label:'GaAs' },
};

const LOGIC_TRUTH = {
  NAND: (a, b) => (!(a && b) ? 1 : 0),
  NOR:  (a, b) => (!(a || b) ? 1 : 0),
  AND:  (a, b) => ((a && b) ? 1 : 0),
  OR:   (a, b) => ((a || b) ? 1 : 0),
};

const LOGIC_INFO = {
  NAND: { pull: '2 PMOS parallel ↑, 2 NMOS series ↓', universal: true },
  NOR:  { pull: '2 PMOS series ↑, 2 NMOS parallel ↓', universal: true },
  AND:  { pull: 'NAND + Inverter', universal: false },
  OR:   { pull: 'NOR + Inverter', universal: false },
};

const CPU_STAGES = ['Fetch', 'Decode', 'Execute', 'Memory', 'Writeback'];
const CPU_STAGE_COLORS = [C.cyan, C.accent, C.amber, C.green, C.violet];
const CPU_STAGE_DESCRIPTIONS = {
  ADD: ['Read ADD R1,R2,R3 from memory', 'Decode: op=ADD, src=R2,R3, dst=R1', 'ALU: R2 + R3 → result', 'No memory access needed', 'Write result → R1'],
  LOAD: ['Read LOAD R1,[R2] from memory', 'Decode: op=LOAD, addr=R2, dst=R1', 'ALU: compute address R2+offset', 'L1 cache event depends on hit/miss', 'Write data → R1'],
  STORE: ['Read STORE [R2],R1 from memory', 'Decode: op=STORE, addr=R2, src=R1', 'ALU: compute address R2+offset', 'Write data to cache/memory', 'Complete (write buffer)'],
};

const GPU_PIPELINE_STAGES = ['Global Memory', 'L2 Cache', 'Shared Memory', 'Tensor/ALU', 'Writeback'];

const MCU_FAMILIES = {
  ARM: { name: 'ARM Cortex-M4', flash: '512 KB', ram: '128 KB', clock: '168 MHz', bits: 32, color: C.cyan },
  AVR: { name: 'ATmega328P', flash: '32 KB', ram: '2 KB', clock: '16 MHz', bits: 8, color: C.green },
  PIC: { name: 'PIC18F4550', flash: '32 KB', ram: '2 KB', clock: '48 MHz', bits: 8, color: C.amber },
};

const MCU_PERIPHERALS = [
  { id: 'GPIO', label: 'GPIO', color: C.green },
  { id: 'ADC', label: 'ADC', color: C.amber },
  { id: 'Timer', label: 'Timers', color: C.cyan },
  { id: 'UART', label: 'UART', color: C.violet },
  { id: 'SPI', label: 'SPI', color: C.pink },
  { id: 'I2C', label: 'I2C', color: C.teal },
];

const FAB_STEPS = [
  { name: 'Si Wafer', desc: 'Start with a polished 300mm silicon wafer (pure single crystal)', color: C.cyan },
  { name: 'Oxidation', desc: 'Grow thin SiO₂ layer by exposing to O₂ at 900-1100°C', color: C.amber },
  { name: 'Photoresist', desc: 'Spin-coat light-sensitive polymer (photoresist) on top', color: C.pink },
  { name: 'Exposure', desc: 'Shine UV/EUV light through a mask to pattern the resist', color: C.violet },
  { name: 'Develop', desc: 'Dissolve exposed (or unexposed) resist to reveal pattern', color: C.green },
  { name: 'Etch', desc: 'Remove exposed SiO₂ (or Si) using plasma or chemicals', color: C.red },
  { name: 'Ion Implant', desc: 'Accelerate dopant ions (B, P, As) into exposed regions', color: C.teal },
  { name: 'Strip Resist', desc: 'Remove remaining photoresist (O₂ plasma ash or solvent)', color: C.orange },
  { name: 'Deposition', desc: 'Deposit metal (Cu, W, Al) or dielectric layers', color: C.accent },
  { name: 'Metallization', desc: 'Form copper interconnect wires linking transistors', color: C.amber },
  { name: 'Packaging', desc: 'Dice wafer into chips, bond wires, encapsulate in package', color: C.green },
];

function formatCurrent(amps) {
  const absI = Math.abs(amps);
  if (absI >= 1e-3) return `${(amps * 1e3).toFixed(2)} mA`;
  if (absI >= 1e-6) return `${(amps * 1e6).toFixed(2)} uA`;
  if (absI >= 1e-9) return `${(amps * 1e9).toFixed(2)} nA`;
  return `${(amps * 1e12).toFixed(2)} pA`;
}


/* ═══════════════════════════════════════════════════════════════════
   TAB 1 — Energy Bands and Band Gap
   ═══════════════════════════════════════════════════════════════════ */
function EnergyBandsSimulate() {
  const [mat, setMat] = useState('Si');
  const [T, setT] = useState(300);
  const [phase, setPhase] = useState(0);
  const af = useRef(); const lt = useRef(0);

  useEffect(() => {
    const tick = t => {
      if (lt.current) setPhase(p => (p + (t - lt.current) * 0.001) % (2 * Math.PI));
      lt.current = t;
      af.current = requestAnimationFrame(tick);
    };
    af.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(af.current); lt.current = 0; };
  }, []);

  const m = MATERIALS[mat];
  const Eg = m.Eg;
  const ni = m.ni300 * Math.pow(T / 300, 1.5) * Math.exp(-Eg * q / (2 * k_B) * (1/T - 1/300));
  const thermalE = kT300 * T / 300;

  // Excited electrons count (visual, not exact)
  const excitedCount = Math.min(8, Math.max(0, Math.round(3 * Math.log10(Math.max(ni, 1)) / 10 - 2)));

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Energy Bands &amp; Band Gap</p><p style={S.sub}>Valence band, conduction band, and the forbidden gap that defines a semiconductor</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 300" style={{ width:'100%', maxWidth:560 }}>
            {/* Conduction band */}
            <rect x={40} y={20} width={200} height={50} rx={6} fill={C.cyan} opacity={0.12} stroke={C.cyan} strokeWidth={1}/>
            <text x={140} y={50} fill={C.cyan} fontSize={12} fontWeight={600} textAnchor="middle">Conduction Band (Ec)</text>

            {/* Band gap */}
            <rect x={40} y={70} width={200} height={80} rx={0} fill="none" stroke={C.borderLight} strokeWidth={1} strokeDasharray="4 3"/>
            <text x={140} y={115} fill={C.amber} fontSize={13} fontWeight={700} textAnchor="middle">Eg = {Eg} eV</text>

            {/* Valence band */}
            <rect x={40} y={150} width={200} height={50} rx={6} fill={C.violet} opacity={0.12} stroke={C.violet} strokeWidth={1}/>
            <text x={140} y={180} fill={C.violet} fontSize={12} fontWeight={600} textAnchor="middle">Valence Band (Ev)</text>

            {/* Electrons in valence band */}
            {Array.from({ length: 8 }, (_, i) => {
              const ex = 60 + i * 22;
              const isExcited = i < excitedCount;
              const ey = isExcited ? 38 + 6 * Math.sin(phase + i) : 165 + 4 * Math.sin(phase * 0.7 + i * 0.8);
              return <circle key={i} cx={ex} cy={ey} r={4} fill={isExcited ? C.cyan : C.violet} opacity={0.9}/>;
            })}

            {/* Holes in valence band */}
            {Array.from({ length: excitedCount }, (_, i) => (
              <circle key={'h'+i} cx={60 + i * 22} cy={170 + 3 * Math.sin(phase + i + 1)} r={4} fill="none" stroke={C.pink} strokeWidth={1.5} opacity={0.8}/>
            ))}

            {/* Thermal excitation arrow */}
            {excitedCount > 0 && (
              <g>
                <line x1={140} y1={148} x2={140} y2={72} stroke={C.amber} strokeWidth={1.5} strokeDasharray="3 3" opacity={0.6}/>
                <polygon points="140,72 136,80 144,80" fill={C.amber} opacity={0.6}/>
                <text x={170} y={100} fill={C.amber} fontSize={10} opacity={0.7}>Thermal</text>
              </g>
            )}

            {/* Comparison bars on right */}
            <text x={330} y={30} fill={C.text} fontSize={12} fontWeight={600}>Band Gap Comparison</text>
            {Object.entries(MATERIALS).map(([key, mtl], idx) => {
              const bw = mtl.Eg / 1.5 * 120;
              const by = 50 + idx * 50;
              const isActive = key === mat;
              return (
                <g key={key}>
                  <rect x={330} y={by} width={bw} height={28} rx={5} fill={mtl.color} opacity={isActive ? 0.35 : 0.12} stroke={mtl.color} strokeWidth={isActive ? 2 : 0.5}/>
                  <text x={335} y={by + 18} fill={mtl.color} fontSize={11} fontWeight={600}>{key}: {mtl.Eg} eV</text>
                </g>
              );
            })}

            {/* Energy axis */}
            <line x1={30} y1={15} x2={30} y2={205} stroke={C.dim} strokeWidth={1}/>
            <polygon points="30,15 27,22 33,22" fill={C.dim}/>
            <text x={18} y={115} fill={C.dim} fontSize={10} textAnchor="middle" transform="rotate(-90,18,115)">Energy (E)</text>

            {/* Legend */}
            <circle cx={330} cy={220} r={4} fill={C.cyan}/><text x={340} y={224} fill={C.muted} fontSize={11}>Electron</text>
            <circle cx={410} cy={220} r={4} fill="none" stroke={C.pink} strokeWidth={1.5}/><text x={420} y={224} fill={C.muted} fontSize={11}>Hole</text>
          </svg>
        </div>
        <span style={S.eq}>nᵢ(T) = √(Nc·Nv) · exp(−Eg / 2kT)   |   nᵢ({mat}) ≈ {ni.toExponential(2)} cm⁻³</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>Silicon's 1.12 eV band gap makes it ideal for room-temperature electronics — small enough for useful conductivity, large enough to suppress leakage. GaAs with 1.43 eV is preferred for optoelectronics (LEDs, lasers) because its gap matches visible/IR photon energies.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Material" value={MATERIALS[mat].label} color={MATERIALS[mat].color}/>
        <RI label="Band gap" value={`${Eg} eV`} color={C.amber}/>
        <RI label="nᵢ at T" value={`${ni.toExponential(2)} cm⁻³`} color={C.cyan}/>
        <RI label="kT/q" value={`${(thermalE*1e3).toFixed(1)} meV`} color={C.green}/>
      </div>
      <div style={S.controls}>
        <div style={S.cg}>
          <span style={S.label}>Material</span>
          <select style={S.sel} value={mat} onChange={e=>setMat(e.target.value)}>
            {Object.entries(MATERIALS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <CG label="Temperature" min={200} max={600} step={10} value={T} set={setT} unit=" K"/>
      </div>
    </div>
  );
}

function EnergyBandsTheory() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>Energy Bands &amp; Band Gap</h2>
      <p style={S.p}>In an isolated atom, electrons occupy discrete energy levels (1s, 2s, 2p…). When ~10²³ atoms form a crystal lattice, quantum-mechanical interactions cause these discrete levels to split into quasi-continuous <strong>energy bands</strong>. The highest mostly-filled band is the <strong>valence band (Ev)</strong>; the lowest mostly-empty band is the <strong>conduction band (Ec)</strong>. The forbidden energy region between them is the <strong>band gap Eg = Ec − Ev</strong>.</p>

      <h3 style={S.h3}>Classification by Band Gap</h3>
      <table style={S.tbl}>
        <thead><tr><th style={S.th}>Material type</th><th style={S.th}>Eg (eV)</th><th style={S.th}>Examples</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Insulator</td><td style={S.td}>&gt; 4 eV</td><td style={S.td}>SiO₂ (9 eV), Al₂O₃ (7 eV), Diamond (5.5 eV)</td></tr>
          <tr><td style={S.td}>Semiconductor</td><td style={S.td}>0.3–3.5 eV</td><td style={S.td}>Ge (0.66), Si (1.12), GaAs (1.43), GaN (3.4), SiC (3.26)</td></tr>
          <tr><td style={S.td}>Conductor</td><td style={S.td}>~0 (overlap)</td><td style={S.td}>Cu, Al, Au, W</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>The Fermi Level &amp; Fermi-Dirac Distribution</h3>
      <p style={S.p}>The <strong>Fermi level (EF)</strong> is the electrochemical potential of electrons — the energy at which the probability of occupancy is exactly 50%, given by the Fermi-Dirac distribution:</p>
      <code style={S.eq}>f(E) = 1 / (1 + exp((E − EF) / kT))</code>
      <p style={S.p}>In an intrinsic (undoped) semiconductor, EF lies very close to mid-gap. At T = 0 K, all states below EF are filled and all above are empty — a perfect step function. At room temperature (kT ≈ 26 meV), the distribution rounds off slightly, allowing a small fraction of electrons to thermally populate the conduction band. This Fermi level concept is central to understanding doping, junctions, and device biasing — in equilibrium, <strong>EF is flat throughout the entire structure</strong>.</p>

      <h3 style={S.h3}>Direct vs Indirect Band Gap</h3>
      <p style={S.p}>Band structure is plotted as energy E vs crystal momentum k. In an <strong>indirect gap</strong> semiconductor (Si, Ge), the conduction band minimum and valence band maximum occur at <em>different</em> k-values. An optical transition requires conserving both energy (photon) and momentum (phonon), making radiative recombination highly inefficient. In a <strong>direct gap</strong> semiconductor (GaAs, InP, GaN), the extrema align at the same k, allowing efficient photon emission or absorption:</p>
      <table style={S.tbl}>
        <thead><tr><th style={S.th}>Property</th><th style={S.th}>Indirect (Si)</th><th style={S.th}>Direct (GaAs)</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Radiative recombination</td><td style={S.td}>Very inefficient (phonon needed)</td><td style={S.td}>Efficient — LEDs &amp; lasers possible</td></tr>
          <tr><td style={S.td}>Optical absorption depth</td><td style={S.td}>~100 μm (thick absorber)</td><td style={S.td}>~1 μm (thin absorber)</td></tr>
          <tr><td style={S.td}>Electronics suitability</td><td style={S.td}>Dominant (mature, cheap)</td><td style={S.td}>High-speed RF, optoelectronics</td></tr>
          <tr><td style={S.td}>Minority carrier lifetime</td><td style={S.td}>Long (μs–ms)</td><td style={S.td}>Short (ns) — fast recombination</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>Intrinsic Carrier Concentration</h3>
      <p style={S.p}>At temperature T, thermal energy promotes electrons from valence to conduction band, leaving behind holes. The <strong>intrinsic carrier concentration nᵢ</strong> is:</p>
      <code style={S.eq}>nᵢ = √(Nc · Nv) · exp(−Eg / 2kT)</code>
      <p style={S.p}>Here Nc and Nv are the <strong>effective density of states</strong> (≈ 2.8 × 10¹⁹ and 1.04 × 10¹⁹ cm⁻³ for Si at 300 K) — the number of available states per unit volume near each band edge. For silicon at 300 K, nᵢ ≈ 1.5 × 10¹⁰ cm⁻³, which is only 3 parts per trillion of the total Si atom density (5 × 10²² cm⁻³), explaining why intrinsic Si is a very poor conductor (ρ ≈ 2300 Ω·cm).</p>

      <h3 style={S.h3}>Temperature Dependence &amp; Thermal Runaway</h3>
      <p style={S.p}>nᵢ rises exponentially with temperature. For typical doping levels (10¹⁶ cm⁻³), intrinsic carriers begin to overwhelm dopants above ~150–200°C in Si — this sets a hard upper limit for Si devices. <strong>Wide-bandgap semiconductors</strong> (SiC: 3.26 eV, GaN: 3.4 eV) push this limit above 600°C, enabling high-temperature power electronics in aircraft, downhole drilling, and EV powertrain modules. Additionally, leakage current doubles roughly every 10°C, so thermal management is critical for chip reliability.</p>

      <svg viewBox="0 0 480 230" style={{ width:'100%', maxWidth:480, margin:'12px auto', display:'block' }}>
        <rect x={0} y={0} width={480} height={230} fill={C.surfaceAlt} rx={10}/>
        {/* Band diagram with Fermi levels */}
        <text x={115} y={18} fill={C.text} fontSize={11} fontWeight={600} textAnchor="middle">Band Diagram + EF</text>
        <rect x={20} y={28} width={190} height={28} rx={4} fill={C.cyan} opacity={0.15} stroke={C.cyan} strokeWidth={1}/>
        <text x={115} y={47} fill={C.cyan} fontSize={10} textAnchor="middle" fontWeight={600}>Conduction Band (Ec)</text>
        <rect x={20} y={60} width={190} height={52} fill="none" stroke={C.borderLight} strokeDasharray="3 3"/>
        <text x={115} y={89} fill={C.amber} fontSize={11} fontWeight={700} textAnchor="middle">Eg (forbidden gap)</text>
        <rect x={20} y={116} width={190} height={28} rx={4} fill={C.violet} opacity={0.15} stroke={C.violet} strokeWidth={1}/>
        <text x={115} y={135} fill={C.violet} fontSize={10} textAnchor="middle" fontWeight={600}>Valence Band (Ev)</text>
        {/* Fermi levels */}
        <line x1={20} y1={88} x2={210} y2={88} stroke={C.green} strokeWidth={1.5} strokeDasharray="5 3"/>
        <text x={215} y={92} fill={C.green} fontSize={9}>EF (intrinsic ≈ mid-gap)</text>
        {/* Eg arrow */}
        <line x1={220} y1={58} x2={220} y2={116} stroke={C.amber} strokeWidth={1.5}/>
        <polygon points="220,58 217,65 223,65" fill={C.amber}/>
        <polygon points="220,116 217,109 223,109" fill={C.amber}/>
        <text x={228} y={91} fill={C.amber} fontSize={10}>Eg</text>
        {/* Band gaps comparison */}
        <text x={340} y={18} fill={C.text} fontSize={11} fontWeight={600} textAnchor="middle">Band Gap Comparison</text>
        {[['Ge', 0.66, C.green], ['Si', 1.12, C.cyan], ['GaAs', 1.43, C.amber], ['GaN', 3.4, C.violet], ['SiC', 3.26, C.red]].map(([name, eg, color], i) => {
          const bw = eg / 3.5 * 130;
          const by = 28 + i * 22;
          return (
            <g key={name}>
              <rect x={260} y={by} width={bw} height={14} rx={3} fill={color} opacity={0.25} stroke={color} strokeWidth={0.8}/>
              <text x={265} y={by + 10} fill={color} fontSize={9} fontWeight={600}>{name}: {eg} eV</text>
            </g>
          );
        })}
        {/* Direct vs indirect */}
        <text x={115} y={170} fill={C.text} fontSize={10} fontWeight={600} textAnchor="middle">Indirect (Si)</text>
        <path d="M45,205 Q72,175 100,205" fill="none" stroke={C.violet} strokeWidth={1.5}/>
        <path d="M58,200 Q72,210 86,200" fill="none" stroke={C.cyan} strokeWidth={1.5}/>
        <text x={72} y={222} fill={C.dim} fontSize={8} textAnchor="middle">different k</text>
        <text x={365} y={170} fill={C.text} fontSize={10} fontWeight={600} textAnchor="middle">Direct (GaAs)</text>
        <path d="M315,205 Q340,172 365,205" fill="none" stroke={C.violet} strokeWidth={1.5}/>
        <path d="M327,205 Q340,215 353,205" fill="none" stroke={C.amber} strokeWidth={1.5}/>
        <text x={340} y={222} fill={C.dim} fontSize={8} textAnchor="middle">same k</text>
        {/* Photon arrow - indirect */}
        <line x1={72} y1={200} x2={58} y2={180} stroke={C.pink} strokeWidth={1} strokeDasharray="2 2"/>
        <text x={38} y={185} fill={C.pink} fontSize={8}>hν + phonon</text>
        {/* Photon arrow - direct */}
        <line x1={340} y1={205} x2={340} y2={183} stroke={C.green} strokeWidth={1.5}/>
        <polygon points="340,183 337,190 343,190" fill={C.green}/>
        <text x={349} y={194} fill={C.green} fontSize={8}>hν only</text>
      </svg>

      <div style={S.ctx}><span style={S.ctxT}>Where this matters</span><p style={S.ctxP}>Band gap determines the application domain: Si (1.12 eV, indirect) for CMOS ICs; GaAs/InP (1.1–1.5 eV, direct) for solar cells, LEDs, and RF amplifiers; GaN (3.4 eV) for blue/UV LEDs, power transistors, and 5G RF; SiC (3.26 eV) for high-voltage/high-temperature power electronics. Solar cell efficiency peaks when Eg ≈ 1.34 eV (Shockley-Queisser limit), which is why GaAs-based cells achieve ~29% single-junction efficiency vs Si at ~26%.</p></div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   TAB 2 — Doping and Carrier Concentration
   ═══════════════════════════════════════════════════════════════════ */
function DopingSimulate() {
  const [type, setType] = useState('N');
  const [logDoping, setLogDoping] = useState(16);
  const [T, setT] = useState(300);

  const ni = 1.5e10 * Math.pow(T / 300, 1.5) * Math.exp(-1.12 * q / (2 * k_B) * (1/T - 1/300));
  const dopantDensity = Math.pow(10, logDoping);
  const majority = dopantDensity;
  const minority = ni * ni / dopantDensity;

  const logMaj = Math.log10(Math.max(majority, 1));
  const logMin = Math.log10(Math.max(minority, 1));
  const logNi = Math.log10(Math.max(ni, 1));

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Doping &amp; Carrier Concentration</p><p style={S.sub}>Adding impurities to control majority and minority carriers</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 300" style={{ width:'100%', maxWidth:560 }}>
            {/* Silicon lattice */}
            <text x={20} y={20} fill={C.text} fontSize={12} fontWeight={600}>Crystal Lattice ({type}-type)</text>
            {Array.from({ length: 4 }, (_, r) =>
              Array.from({ length: 5 }, (_, c) => {
                const cx = 40 + c * 40, cy = 40 + r * 40;
                const isDopant = r === 1 && c === 2;
                return (
                  <g key={`${r}-${c}`}>
                    <circle cx={cx} cy={cy} r={12} fill={isDopant ? (type === 'N' ? C.cyan : C.pink) : C.surfaceAlt} stroke={isDopant ? (type === 'N' ? C.cyan : C.pink) : C.borderLight} strokeWidth={1.5} opacity={isDopant ? 0.4 : 0.3}/>
                    <text x={cx} y={cy + 4} fill={isDopant ? '#fff' : C.dim} fontSize={9} textAnchor="middle" fontWeight={600}>{isDopant ? (type === 'N' ? 'P' : 'B') : 'Si'}</text>
                    {/* Bonds */}
                    {c < 4 && <line x1={cx + 12} y1={cy} x2={cx + 28} y2={cy} stroke={C.borderLight} strokeWidth={0.8}/>}
                    {r < 3 && <line x1={cx} y1={cy + 12} x2={cx} y2={cy + 28} stroke={C.borderLight} strokeWidth={0.8}/>}
                  </g>
                );
              })
            )}
            {/* Extra carrier near dopant */}
            {type === 'N' ? (
              <g><circle cx={140} cy={64} r={5} fill={C.cyan} opacity={0.9}/><text x={155} y={68} fill={C.cyan} fontSize={9}>free e⁻</text></g>
            ) : (
              <g><circle cx={140} cy={64} r={5} fill="none" stroke={C.pink} strokeWidth={2}/><text x={155} y={68} fill={C.pink} fontSize={9}>hole h⁺</text></g>
            )}

            {/* Carrier concentration bar chart */}
            <text x={290} y={20} fill={C.text} fontSize={12} fontWeight={600}>Carrier Concentrations (log₁₀)</text>
            {/* Majority bar */}
            <rect x={300} y={45} width={Math.max(logMaj / 20 * 200, 2)} height={30} rx={4} fill={type === 'N' ? C.cyan : C.pink} opacity={0.4}/>
            <text x={305} y={64} fill={C.text} fontSize={10} fontWeight={600}>{type === 'N' ? 'n' : 'p'} = 10^{logMaj.toFixed(1)}</text>

            {/* Minority bar */}
            <rect x={300} y={90} width={Math.max(logMin / 20 * 200, 2)} height={30} rx={4} fill={type === 'N' ? C.pink : C.cyan} opacity={0.3}/>
            <text x={305} y={109} fill={C.muted} fontSize={10}>{type === 'N' ? 'p' : 'n'} = 10^{logMin.toFixed(1)}</text>

            {/* ni bar */}
            <rect x={300} y={135} width={Math.max(logNi / 20 * 200, 2)} height={30} rx={4} fill={C.amber} opacity={0.25}/>
            <text x={305} y={154} fill={C.amber} fontSize={10}>nᵢ = 10^{logNi.toFixed(1)}</text>

            {/* n·p = ni² annotation */}
            <text x={300} y={195} fill={C.green} fontSize={12} fontWeight={600}>n · p = nᵢ² (always)</text>
            <text x={300} y={215} fill={C.muted} fontSize={10}>10^{logMaj.toFixed(1)} × 10^{logMin.toFixed(1)} = 10^{(logMaj + logMin).toFixed(1)}</text>
            <text x={300} y={235} fill={C.muted} fontSize={10}>nᵢ² = 10^{(2 * logNi).toFixed(1)}</text>
          </svg>
        </div>
        <span style={S.eq}>n · p = nᵢ²   |   {type === 'N' ? 'nₙ ≈ Nd' : 'pₚ ≈ Na'} = 10^{logDoping}   |   {type === 'N' ? 'pₙ' : 'nₚ'} = nᵢ²/{type === 'N' ? 'Nd' : 'Na'} = {minority.toExponential(2)} cm⁻³</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>Doping is the most fundamental tool in semiconductor engineering. By controlling Nd or Na, engineers set the conductivity and type of each region in a device — the N and P sides of a diode, the base of a BJT, the channel of a MOSFET. The mass-action law n·p = nᵢ² governs minority carrier injection.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Type" value={type + '-type'} color={type === 'N' ? C.cyan : C.pink}/>
        <RI label="Majority" value={`${majority.toExponential(2)}`} color={type === 'N' ? C.cyan : C.pink}/>
        <RI label="Minority" value={`${minority.toExponential(2)}`} color={type === 'N' ? C.pink : C.cyan}/>
        <RI label="nᵢ" value={`${ni.toExponential(2)}`} color={C.amber}/>
      </div>
      <div style={S.controls}>
        <div style={S.cg}>
          <span style={S.label}>Type</span>
          <select style={S.sel} value={type} onChange={e => setType(e.target.value)}>
            <option value="N">N-type (Donor)</option>
            <option value="P">P-type (Acceptor)</option>
          </select>
        </div>
        <CG label={`log₁₀(${type === 'N' ? 'Nd' : 'Na'})`} min={14} max={18} step={0.5} value={logDoping} set={setLogDoping} unit=" cm⁻³"/>
        <CG label="Temperature" min={200} max={600} step={10} value={T} set={setT} unit=" K"/>
      </div>
    </div>
  );
}

function DopingTheory() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>Doping &amp; Carrier Concentration</h2>
      <p style={S.p}>Pure (intrinsic) silicon has equal numbers of electrons and holes: n = p = nᵢ ≈ 1.5 × 10¹⁰ cm⁻³ at 300 K, giving a resistivity of ~2300 Ω·cm — too resistive for practical devices. <strong>Doping</strong> substitutes a tiny fraction (~1 in 10⁷) of Si atoms with impurities to increase conductivity by orders of magnitude and set the carrier type.</p>

      <h3 style={S.h3}>N-Type Doping (Donors)</h3>
      <p style={S.p}>Group V elements (P, As, Sb) contribute 5 valence electrons. Four form covalent bonds with neighboring Si; the fifth is loosely bound in a hydrogen-like orbit just ~45 meV below Ec for phosphorus. At room temperature (kT ≈ 26 meV), <strong>~100% of donors are ionized</strong>, each releasing one free electron into the conduction band. The electron Fermi level shifts toward Ec:</p>
      <code style={S.eq}>EF = Ec − kT · ln(Nc / Nd)   (for Nd ≫ nᵢ)</code>
      <p style={S.p}>Majority carrier concentration: nₙ ≈ Nd. The donor ion becomes positively charged (fixed space charge).</p>

      <h3 style={S.h3}>P-Type Doping (Acceptors)</h3>
      <p style={S.p}>Group III elements (B, Al, Ga) have 3 valence electrons — one Si bond is incomplete, creating a mobile hole. The acceptor level sits ~45 meV above Ev (for boron). At room temperature, nearly all acceptors ionize: pₚ ≈ Na. The Fermi level shifts toward Ev:</p>
      <code style={S.eq}>EF = Ev + kT · ln(Nv / Na)   (for Na ≫ nᵢ)</code>

      <h3 style={S.h3}>Mass-Action Law</h3>
      <code style={S.eq}>n · p = nᵢ²  (always true in thermal equilibrium)</code>
      <p style={S.p}>This product is invariant regardless of doping level. If N-type doping sets n = 10¹⁶ cm⁻³, minority holes become p = (1.5 × 10¹⁰)² / 10¹⁶ = 2.25 × 10⁴ cm⁻³ — twelve orders of magnitude lower. This extreme asymmetry between majority and minority carriers is the operating principle of every semiconductor device: <strong>a small minority carrier injection can strongly modulate current</strong>.</p>

      <h3 style={S.h3}>Compensation Doping</h3>
      <p style={S.p}>When both donors and acceptors are present simultaneously, they partially cancel. The <strong>net doping</strong> determines the type and carrier concentrations:</p>
      <code style={S.eq}>n ≈ Nd − Na  (if Nd &gt; Na),  p ≈ Na − Nd  (if Na &gt; Nd)</code>
      <p style={S.p}>Compensation is used intentionally in some device regions to reduce peak doping while retaining carrier type, and it occurs unavoidably from background impurities. Heavily compensated material has higher mobility degradation due to increased ionized impurity scattering.</p>

      <h3 style={S.h3}>Degenerate Doping &amp; Ohmic Contact</h3>
      <p style={S.p}>When doping exceeds ~10¹⁹ cm⁻³ (for Si), EF moves <em>into</em> the band — the semiconductor behaves metallic. This <strong>degenerate doping</strong> is used for N⁺/P⁺ contact regions and poly-silicon gates. It enables ohmic (non-rectifying) metal-semiconductor contacts essential for device terminals.</p>

      <h3 style={S.h3}>Resistivity and Conductivity</h3>
      <code style={S.eq}>σ = q(nμₙ + pμₚ)   |   ρ = 1/σ</code>
      <table style={S.tbl}>
        <thead><tr><th style={S.th}>Doping (cm⁻³)</th><th style={S.th}>Type</th><th style={S.th}>ρ (Ω·cm)</th><th style={S.th}>Application</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>10¹⁴</td><td style={S.td}>N⁻</td><td style={S.td}>~45</td><td style={S.td}>Power MOSFET drift region (high voltage)</td></tr>
          <tr><td style={S.td}>10¹⁶</td><td style={S.td}>N</td><td style={S.td}>~0.5</td><td style={S.td}>MOSFET well, BJT base</td></tr>
          <tr><td style={S.td}>10¹⁸</td><td style={S.td}>N</td><td style={S.td}>~0.007</td><td style={S.td}>MOSFET source/drain</td></tr>
          <tr><td style={S.td}>&gt;10²⁰</td><td style={S.td}>N⁺</td><td style={S.td}>&lt;0.001</td><td style={S.td}>Ohmic contacts, poly-Si gate</td></tr>
        </tbody>
      </table>

      <div style={S.ctx}><span style={S.ctxT}>Where this matters</span><p style={S.ctxP}>The doping profile IS the device design — every transition between N and P regions, every concentration gradient, defines a device's voltage handling, speed, and current capacity. A power MOSFET's N⁻ drift region (10¹⁴ cm⁻³) sustains 600 V; its N⁺ source (10²⁰ cm⁻³) makes ohmic contact. A BJT's lightly-doped base (10¹⁷ cm⁻³) sets current gain β. Doping control to within 1% across a 300 mm wafer is a key challenge of semiconductor fabrication.</p></div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   TAB 3 — Carrier Transport (Drift and Diffusion)
   ═══════════════════════════════════════════════════════════════════ */
function TransportSimulate() {
  const [E, setE] = useState(500);
  const [gradN, setGradN] = useState(1e18);
  const [mu, setMu] = useState(1400);
  const [phase, setPhase] = useState(0);
  const af = useRef(); const lt = useRef(0);

  useEffect(() => {
    const tick = t => {
      if (lt.current) setPhase(p => (p + (t - lt.current) * 0.002) % 100);
      lt.current = t;
      af.current = requestAnimationFrame(tick);
    };
    af.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(af.current); lt.current = 0; };
  }, []);

  const electronDensity = 1e16;
  const dnDx = -gradN;
  const Jdrift = q * electronDensity * mu * E;
  const D = mu * kT300;
  const Jdiff = -q * D * dnDx;

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Carrier Transport: Drift &amp; Diffusion</p><p style={S.sub}>Two mechanisms that drive current in semiconductors</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 280" style={{ width:'100%', maxWidth:560 }}>
            {/* Drift region */}
            <text x={140} y={18} fill={C.cyan} fontSize={12} fontWeight={600} textAnchor="middle">DRIFT (Electric Field)</text>
            <rect x={20} y={25} width={240} height={90} rx={8} fill={C.surfaceAlt} stroke={C.borderLight} strokeWidth={1}/>
            {/* E field arrow */}
            <line x1={30} y1={70} x2={240} y2={70} stroke={C.amber} strokeWidth={2} opacity={0.4}/>
            <polygon points="240,70 230,65 230,75" fill={C.amber} opacity={0.6}/>
            <text x={245} y={74} fill={C.amber} fontSize={10}>E</text>
            {/* Drifting electrons */}
            {Array.from({ length: 6 }, (_, i) => {
              const x = 240 - ((phase * 2 + i * 40) % 200);
              const y = 55 + (i % 3) * 15 + Math.sin(phase + i) * 3;
              return <circle key={i} cx={x} cy={y} r={3.5} fill={C.cyan} opacity={0.8}/>;
            })}
            <text x={140} y={132} fill={C.muted} fontSize={11} textAnchor="middle">J_drift = qnμE → e⁻ drift opposite E; current follows E</text>

            {/* Diffusion region */}
            <text x={420} y={18} fill={C.green} fontSize={12} fontWeight={600} textAnchor="middle">DIFFUSION (Concentration Gradient)</text>
            <rect x={300} y={25} width={240} height={90} rx={8} fill={C.surfaceAlt} stroke={C.borderLight} strokeWidth={1}/>
            {/* Concentration gradient */}
            <defs>
              <linearGradient id="concGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={C.green} stopOpacity={0.5}/>
                <stop offset="100%" stopColor={C.green} stopOpacity={0.02}/>
              </linearGradient>
            </defs>
            <rect x={305} y={30} width={230} height={80} rx={4} fill="url(#concGrad)"/>
            {/* Diffusing particles */}
            {Array.from({ length: 8 }, (_, i) => {
              const x = 310 + ((phase * 1.5 + i * 28) % 225);
              const y = 50 + (i % 4) * 15 + Math.sin(phase * 0.8 + i) * 4;
              return <circle key={i} cx={x} cy={y} r={3} fill={C.green} opacity={0.6 - (x - 310) / 500}/>;
            })}
            <text x={420} y={132} fill={C.muted} fontSize={11} textAnchor="middle">J_diff = −qD(dn/dx) → carriers flow from high to low</text>

            {/* Current density comparison */}
            <text x={280} y={170} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">Current Density</text>
            <rect x={80} y={185} width={Math.min(Jdrift / 100, 200)} height={20} rx={4} fill={C.cyan} opacity={0.5}/>
            <text x={85} y={199} fill={C.text} fontSize={10}>J_drift = {Jdrift.toExponential(2)} A/cm²</text>
            <rect x={80} y={215} width={Math.min(Jdiff / 100, 200)} height={20} rx={4} fill={C.green} opacity={0.5}/>
            <text x={85} y={229} fill={C.text} fontSize={10}>J_diff = {Jdiff.toExponential(2)} A/cm²</text>
          </svg>
        </div>
        <span style={S.eq}>J_drift = qnμE   |   J_diff = −qD(dn/dx)   |   D/μ = kT/q (Einstein relation)</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>In a MOSFET channel, carriers drift under the gate-induced field. At a PN junction, diffusion drives minority carrier injection. The balance of drift and diffusion creates the built-in potential that makes diodes work. The Einstein relation D = μkT/q links these two seemingly different mechanisms.</p></div>
      </div>
      <div style={S.results}>
        <RI label="J_drift" value={`${Jdrift.toExponential(2)} A/cm²`} color={C.cyan}/>
        <RI label="J_diff" value={`${Jdiff.toExponential(2)} A/cm²`} color={C.green}/>
        <RI label="D (Einstein)" value={`${D.toFixed(1)} cm²/s`} color={C.amber}/>
      </div>
      <div style={S.controls}>
        <CG label="E field" min={100} max={5000} step={100} value={E} set={setE} unit=" V/cm"/>
        <CG label="μₙ" min={200} max={8500} step={100} value={mu} set={setMu} unit=" cm²/V·s"/>
      </div>
    </div>
  );
}

function TransportTheory() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>Carrier Transport: Drift &amp; Diffusion</h2>
      <p style={S.p}>All current in a semiconductor is carried by two mechanisms: <strong>drift</strong> (electric field accelerates carriers) and <strong>diffusion</strong> (carriers spread from crowded to sparse regions). In any real device, both coexist — understanding their relative importance in each region is essential for device analysis.</p>

      <h3 style={S.h3}>Drift Current &amp; Mobility</h3>
      <code style={S.eq}>J_drift = σE = q(nμₙ + pμₚ)E</code>
      <p style={S.p}>Under an electric field E, carriers are accelerated but frequently <strong>scattered</strong> — by lattice vibrations (phonons) and ionized impurities. The net result is a constant average <strong>drift velocity</strong> v_d = μE, where mobility μ characterizes how easily carriers move. For Si at 300 K:</p>
      <table style={S.tbl}>
        <thead><tr><th style={S.th}>Carrier</th><th style={S.th}>μ (cm²/V·s)</th><th style={S.th}>Scattering mechanism</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Electrons (Si)</td><td style={S.td}>1400</td><td style={S.td}>Dominates at T &lt; 300 K: lattice; &gt; 10¹⁷: impurity</td></tr>
          <tr><td style={S.td}>Holes (Si)</td><td style={S.td}>450</td><td style={S.td}>Heavier effective mass → lower mobility</td></tr>
          <tr><td style={S.td}>Electrons (GaAs)</td><td style={S.td}>8500</td><td style={S.td}>Light effective mass → fastest transport</td></tr>
          <tr><td style={S.td}>Electrons (GaN)</td><td style={S.td}>1500</td><td style={S.td}>Wide gap, but manages high E-fields</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>Velocity Saturation</h3>
      <p style={S.p}>At <strong>high electric fields</strong> (&gt; ~10⁴ V/cm in Si), drift velocity stops increasing linearly and saturates at v_sat ≈ 10⁷ cm/s. This is because at high energy, intervalley scattering and optical phonon emission become dominant. Velocity saturation is critical for short-channel MOSFETs: when the channel is &lt; ~100 nm, carriers immediately reach v_sat and current becomes independent of channel length — setting a fundamental limit on speed scaling:</p>
      <code style={S.eq}>v_d = μE / √(1 + (E/Ec)²)   →   v_sat as E → ∞</code>

      <h3 style={S.h3}>Diffusion Current &amp; Diffusion Length</h3>
      <code style={S.eq}>J_diff = −qDₙ(dn/dx) + qDₚ(dp/dx)</code>
      <p style={S.p}>Carriers diffuse from regions of high concentration to low concentration — the same driving force as gas expansion or heat conduction. The diffusion coefficient D quantifies this tendency. Minority carriers injected into a region diffuse and eventually <strong>recombine</strong>. The characteristic decay length is the <strong>diffusion length</strong>:</p>
      <code style={S.eq}>L = √(D · τ)     (τ = minority carrier lifetime)</code>
      <p style={S.p}>For electrons in P-type Si: Ln ≈ 10–1000 μm (depending on doping/defects). The diffusion length must exceed the device active width for efficient carrier collection — critical for solar cell and BJT design.</p>

      <h3 style={S.h3}>Einstein Relation</h3>
      <code style={S.eq}>D/μ = kT/q ≈ 26 mV at 300 K  (thermal voltage Vt)</code>
      <p style={S.p}>This elegant relation connects drift (μ) and diffusion (D) through thermal voltage kT/q. Both arise from the same scattering physics — the collisions that limit drift velocity also randomize diffusion. It means knowing μ gives D automatically, greatly simplifying device modeling.</p>

      <h3 style={S.h3}>Hall Effect</h3>
      <p style={S.p}>When a magnetic field B is applied perpendicular to current flow, the Lorentz force deflects carriers sideways, building up a <strong>Hall voltage</strong> VH transverse to both current and B. The Hall coefficient RH = 1/(q·n) lets us directly measure carrier concentration and type from a simple four-probe measurement — the primary technique for characterizing doped wafers:</p>
      <code style={S.eq}>VH = I · B / (q · n · t)   →   n = I · B / (q · VH · t)</code>

      <div style={S.ctx}><span style={S.ctxT}>Where this matters</span><p style={S.ctxP}>In a MOSFET channel, carriers drift under the lateral gate-induced field — channel conductance is proportional to μ × Cox × (W/L). In a forward-biased PN junction, minority carriers diffuse across the neutral regions — the diffusion length determines base width limits in BJTs. In a solar cell, photogenerated carriers must diffuse to the junction before recombining — longer L means better efficiency. Velocity saturation is why aggressive node scaling eventually stops improving transistor speed.</p></div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   TAB 4 — PN Junction and Diode
   ═══════════════════════════════════════════════════════════════════ */
function DiodeSimulate() {
  const [Vbias, setVbias] = useState(0.3);
  const [T, setT] = useState(300);
  const [logDoping, setLogDoping] = useState(16);
  const [n, setN] = useState(1.6);
  const [Rs, setRs] = useState(10);

  const Vt = k_B * T / q;
  const ni = 1.5e10 * Math.pow(T / 300, 1.5) * Math.exp(-1.12 * q / (2 * k_B) * (1/T - 1/300));
  const Nd = Math.pow(10, logDoping);
  const Na = Nd;
  const Is300 = 1e-14;
  const EgSi = 1.12 * q;
  const Is = Is300 * Math.pow(T / 300, 3) * Math.exp(-(EgSi / k_B) * (1 / T - 1 / 300));
  const Vbi = Vt * Math.log((Na * Nd) / (ni * ni));
  const barrierV = Math.max(Vbi - Vbias, 1e-4);
  const eps0 = 8.854e-14;
  const epsSi = 11.7 * eps0;
  const Wcm = Math.sqrt((2 * epsSi * barrierV * (1 / Na + 1 / Nd)) / q);
  const W = Wcm * 1e4;
  const depletionPx = Math.max(3, W * 30);
  const bandBend = Math.max(Vbi - Vbias, 0) * 40;

  // Solve I = Is * (exp((V - I*Rs)/(n*Vt)) - 1) with fixed-point iteration.
  const diodeCurrent = useMemo(() => {
    const thermal = Math.max(n * Vt, 1e-6);
    let current = Is * (Math.exp(Math.min(Vbias / thermal, 40)) - 1);
    for (let i = 0; i < 14; i++) {
      const junctionV = Vbias - current * Rs;
      const arg = Math.max(-60, Math.min(40, junctionV / thermal));
      current = Is * (Math.exp(arg) - 1);
    }
    return current;
  }, [Is, Rs, Vbias, Vt, n]);

  // I-V curve points in log(|I|) for readability over decades of current.
  const ivPoints = useMemo(() => {
    const points = [];
    const thermal = Math.max(n * Vt, 1e-6);
    for (let v = -2; v <= 0.9; v += 0.02) {
      let i = Is * (Math.exp(Math.min(v / thermal, 40)) - 1);
      for (let iter = 0; iter < 10; iter++) {
        const junctionV = v - i * Rs;
        const arg = Math.max(-60, Math.min(40, junctionV / thermal));
        i = Is * (Math.exp(arg) - 1);
      }
      points.push([v, i]);
    }
    return points;
  }, [Is, Rs, Vt, n]);

  const yMin = -12;
  const yMax = -1;
  const opLogI = Math.log10(Math.max(Math.abs(diodeCurrent), 1e-12));

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>PN Junction &amp; Diode</p><p style={S.sub}>Depletion region, built-in potential, and I-V characteristic</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 300" style={{ width:'100%', maxWidth:560 }}>
            {/* Band diagram */}
            <text x={130} y={18} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">Band Diagram</text>
            {/* P-side */}
            <rect x={20} y={30} width={100} height={120} rx={4} fill={C.pink} opacity={0.06}/>
            <text x={70} y={50} fill={C.pink} fontSize={11} textAnchor="middle" fontWeight={600}>P-type</text>
            {/* N-side */}
            <rect x={140} y={30} width={100} height={120} rx={4} fill={C.cyan} opacity={0.06}/>
            <text x={190} y={50} fill={C.cyan} fontSize={11} textAnchor="middle" fontWeight={600}>N-type</text>
            {/* Depletion region */}
            <rect x={130 - depletionPx / 2} y={30} width={depletionPx} height={120} fill={C.amber} opacity={0.08} stroke={C.amber} strokeWidth={1} strokeDasharray="3 3"/>
            <text x={130} y={165} fill={C.amber} fontSize={10} textAnchor="middle">W ∝ √(Vbi − V)</text>
            {/* Band bending */}
            <path d={`M20,80 L${130 - depletionPx / 2},80 Q130,${80 + bandBend * 0.75} ${130 + depletionPx / 2},${80 + bandBend} L240,${80 + bandBend}`} fill="none" stroke={C.cyan} strokeWidth={2}/>
            <text x={250} y={78} fill={C.cyan} fontSize={10}>Ec</text>
            <path d={`M20,120 L${130 - depletionPx / 2},120 Q130,${120 + bandBend * 0.75} ${130 + depletionPx / 2},${120 + bandBend} L240,${120 + bandBend}`} fill="none" stroke={C.violet} strokeWidth={2}/>
            <text x={250} y={118} fill={C.violet} fontSize={10}>Ev</text>

            {/* I-V curve */}
            <g transform="translate(300, 10)">
              <text x={120} y={10} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">I-V Characteristic</text>
              {/* Axes */}
              <line x1={0} y1={140} x2={240} y2={140} stroke={C.borderLight} strokeWidth={1}/>
              <line x1={100} y1={20} x2={100} y2={240} stroke={C.borderLight} strokeWidth={1}/>
              <text x={235} y={155} fill={C.dim} fontSize={9}>V</text>
              <text x={105} y={25} fill={C.dim} fontSize={9}>log|I|</text>

              {/* I-V curve */}
              <path d={ivPoints.map(([v, i], idx) => {
                const px = 100 + v * 100;
                const li = Math.log10(Math.max(Math.abs(i), 1e-12));
                const py = 230 - ((li - yMin) / (yMax - yMin)) * 200;
                return `${idx === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
              }).join(' ')} fill="none" stroke={C.green} strokeWidth={2}/>

              {/* Operating point */}
              {(() => {
                const px = 100 + Vbias * 100;
                const py = 230 - ((opLogI - yMin) / (yMax - yMin)) * 200;
                return <circle cx={Math.min(px, 230)} cy={Math.max(py, 25)} r={5} fill={C.amber} stroke="#fff" strokeWidth={1.5}/>;
              })()}

              {/* Decade markers */}
              {[-12, -9, -6, -3, -1].map((dec) => {
                const y = 230 - ((dec - yMin) / (yMax - yMin)) * 200;
                return (
                  <g key={dec}>
                    <line x1={96} y1={y} x2={240} y2={y} stroke={C.borderLight} strokeWidth={0.6} opacity={0.25}/>
                    <text x={92} y={y + 3} fill={C.faint} fontSize={8} textAnchor="end">10^{dec}</text>
                  </g>
                );
              })}

              <text x={100} y={260} fill={C.muted} fontSize={10} textAnchor="middle">Vbias = {Vbias.toFixed(2)} V</text>
            </g>
          </svg>
        </div>
        <span style={S.eq}>I = Iₛ(e^((V − I·Rs)/(nVt)) − 1)   |   n = {n.toFixed(2)}   |   Rs = {Rs.toFixed(1)} Ω   |   I = {formatCurrent(diodeCurrent)}</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>The PN junction is the building block of all semiconductor devices. Diodes rectify AC to DC in every power supply. Solar cells are PN junctions generating current from light. LEDs are forward-biased junctions emitting photons. BJTs and MOSFETs contain multiple PN junctions.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Bias" value={`${Vbias.toFixed(2)} V`} color={Vbias >= 0 ? C.green : C.red}/>
        <RI label="Current" value={formatCurrent(diodeCurrent)} color={C.amber}/>
        <RI label="Vbi" value={`${Vbi.toFixed(3)} V`} color={C.cyan}/>
        <RI label="Depletion W" value={`${W.toFixed(2)} μm`} color={C.violet}/>
      </div>
      <div style={S.controls}>
        <CG label="V bias" min={-2} max={0.75} step={0.01} value={Vbias} set={setVbias} unit=" V"/>
        <CG label="Temperature" min={200} max={500} step={10} value={T} set={setT} unit=" K"/>
        <CG label="log₁₀(Na = Nd)" min={14} max={18} step={0.5} value={logDoping} set={setLogDoping}/>
        <CG label="Ideality n" min={1} max={2} step={0.05} value={n} set={setN}/>
        <CG label="Series R" min={0} max={50} step={1} value={Rs} set={setRs} unit=" Ω"/>
      </div>
    </div>
  );
}

function DiodeTheory() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>PN Junction &amp; Diode</h2>
      <p style={S.p}>When P-type and N-type semiconductors are brought together, electrons and holes near the junction diffuse across and recombine. This leaves behind a <strong>depletion region</strong> — a zone stripped of mobile carriers containing only ionized dopant atoms (positive donors on the N-side, negative acceptors on the P-side). The resulting electric field creates a <strong>built-in potential Vbi</strong> that prevents further net diffusion at equilibrium.</p>

      <h3 style={S.h3}>Built-in Potential</h3>
      <code style={S.eq}>Vbi = (kT/q) · ln(Na · Nd / nᵢ²)</code>
      <p style={S.p}>For Si with Na = Nd = 10¹⁶ cm⁻³: Vbi ≈ 0.72 V. Despite this internal field, Vbi is <em>not</em> directly measurable with a voltmeter — material contact potentials exactly cancel it. It represents the energy barrier that majority carriers must overcome to cross the junction.</p>

      <h3 style={S.h3}>Depletion Width &amp; Junction Capacitance</h3>
      <code style={S.eq}>W = √(2ε(Vbi − V)(1/Na + 1/Nd) / q)</code>
      <p style={S.p}>Reverse bias widens the depletion region (larger barrier); forward bias narrows it. The depletion region acts as a parallel-plate capacitor whose plate separation changes with bias — this gives the <strong>junction capacitance</strong>:</p>
      <code style={S.eq}>Cj = ε · A / W   ∝ 1/√(Vbi − V)</code>
      <p style={S.p}>This voltage-tunable capacitance is exploited in <strong>varactor diodes</strong> for frequency tuning in VCOs, PLLs, and RF circuits. Reverse-biasing the junction increases W and reduces Cj, enabling faster switching — critical for high-speed photodetectors.</p>

      <h3 style={S.h3}>Ideal Diode Equation</h3>
      <code style={S.eq}>I = Iₛ · (e^(V / nVt) − 1)   where   Vt = kT/q ≈ 26 mV</code>
      <p style={S.p}><strong>Forward bias</strong> (V &gt; 0): Reduces the potential barrier. Minority carriers are injected across the junction; their diffusion through the neutral regions produces exponentially growing current. At V ≈ 0.55–0.7 V for Si, current rises into the mA range.</p>
      <p style={S.p}><strong>Reverse bias</strong> (V &lt; 0): Increases the barrier; minority carriers generated thermally near the junction are swept across by the field, producing a small, relatively constant saturation current Iₛ (≈ 10⁻¹³ to 10⁻¹⁵ A for Si at 300 K). Iₛ doubles roughly every 10°C.</p>

      <h3 style={S.h3}>Non-Ideal Effects: Ideality Factor &amp; Series Resistance</h3>
      <p style={S.p}>The ideal equation applies perfectly only to long-base diodes with diffusion current only. Real diodes deviate:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Ideality factor n:</strong> n = 1 for pure diffusion current (ideal); n = 2 for recombination-generation in the depletion region (dominant at low forward bias). Most real diodes show n between 1 and 2 and may show two slopes in the I-V curve.</li>
        <li style={S.li}><strong>Series resistance Rs:</strong> At high currents, the bulk resistance of the undepleted regions creates an Ohmic voltage drop, reducing the apparent turn-on sharpness.</li>
        <li style={S.li}><strong>Temperature:</strong> Forward voltage decreases at ~−2 mV/°C (negative temperature coefficient) — if diodes share current in parallel, one heating up drives more current, potentially causing thermal runaway.</li>
      </ul>
      <code style={S.eq}>I = Iₛ (e^((V − I·Rs)/(nVt)) − 1)</code>

      <h3 style={S.h3}>Reverse Breakdown</h3>
      <p style={S.p}>At a high enough reverse voltage, two mechanisms can generate large currents:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Avalanche breakdown:</strong> Carriers accelerated in the high field gain enough energy to collide and generate new electron-hole pairs (impact ionization). This multiplies exponentially — the mechanism in most rectifier and protection diodes. Breakdown voltage increases with temperature.</li>
        <li style={S.li}><strong>Zener breakdown:</strong> At high doping (&gt;10¹⁸ cm⁻³), the depletion region is so narrow (&lt;10 nm) that quantum tunneling allows electrons to cross directly from valence to conduction band. This occurs at V &lt; 5 V and has a <em>negative</em> temperature coefficient — the two effects cancel near 5.6 V, giving stable Zener reference diodes.</li>
      </ul>

      <div style={S.ctx}><span style={S.ctxT}>Where this matters</span><p style={S.ctxP}>PN junctions are the foundation of all semiconductor devices. Rectifier diodes in power supplies convert AC to DC. Zener diodes provide stable voltage references in every analog IC. Solar cells are large-area PN junctions generating current from light (photovoltaic effect). LEDs and laser diodes emit photons via radiative recombination at forward-biased direct-gap junctions. Varactors tune oscillators in phase-locked loops. Schottky diodes (metal-semiconductor junction) eliminate minority carrier storage for ultra-fast switching in GHz circuits.</p></div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   TAB 5 — BJT (Bipolar Junction Transistor)
   ═══════════════════════════════════════════════════════════════════ */
function BJTSimulate() {
  const [Vbe, setVbe] = useState(0.65);
  const [Vce, setVce] = useState(5);
  const [beta, setBeta] = useState(100);
  const [type, setType] = useState('NPN');

  const isPNP = type === 'PNP';
  const Vt = 0.02585;
  const Is = 1e-15;
  const Ib = Is * (Math.exp(Vbe / Vt) - 1);
  const IcIdeal = beta * Ib;
  const Vce_sat = 0.2;
  const inSat = Vce < Vce_sat && IcIdeal > 0;
  const Ic = inSat ? Vce / 0.2 * IcIdeal * 0.5 : IcIdeal;
  const Ie = Ic + Ib;
  const mode = Vbe < 0.5 ? 'Cutoff' : inSat ? 'Saturation' : 'Active';
  const carrierColor = isPNP ? C.pink : C.cyan;
  const emitterType = isPNP ? 'P' : 'N';
  const baseType = isPNP ? 'N' : 'P';
  const collectorType = emitterType;
  const carrierLabel = isPNP ? 'h⁺' : 'e⁻';
  const vbeLabel = isPNP ? 'Veb' : 'Vbe';
  const vceLabel = isPNP ? 'Vec' : 'Vce';

  // Output characteristics
  const curves = [0.6, 0.65, 0.7, 0.72];

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Bipolar Junction Transistor (BJT)</p><p style={S.sub}>Current-controlled transistor — current magnitudes follow |Ic| = β·|Ib| in active region</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 300" style={{ width:'100%', maxWidth:560 }}>
            {/* NPN cross-section */}
            <text x={105} y={18} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">{type} Structure</text>
            <rect x={20} y={30} width={60} height={80} rx={4} fill={carrierColor} opacity={0.15} stroke={carrierColor} strokeWidth={1}/>
            <text x={50} y={55} fill={carrierColor} fontSize={11} textAnchor="middle" fontWeight={600}>{emitterType}</text>
            <text x={50} y={72} fill={C.dim} fontSize={9} textAnchor="middle">Emitter</text>
            <rect x={80} y={30} width={50} height={80} rx={4} fill={isPNP ? C.cyan : C.pink} opacity={0.15} stroke={isPNP ? C.cyan : C.pink} strokeWidth={1}/>
            <text x={105} y={55} fill={isPNP ? C.cyan : C.pink} fontSize={11} textAnchor="middle" fontWeight={600}>{baseType}</text>
            <text x={105} y={72} fill={C.dim} fontSize={9} textAnchor="middle">Base</text>
            <rect x={130} y={30} width={60} height={80} rx={4} fill={carrierColor} opacity={0.15} stroke={carrierColor} strokeWidth={1}/>
            <text x={160} y={55} fill={carrierColor} fontSize={11} textAnchor="middle" fontWeight={600}>{collectorType}</text>
            <text x={160} y={72} fill={C.dim} fontSize={9} textAnchor="middle">Collector</text>

            {/* Carrier flow arrows in active mode */}
            {mode === 'Active' && (
              <g>
                {Array.from({ length: 4 }, (_, i) => (
                  <g key={i}>
                    <circle cx={85 + i * 12} cy={48 + (i % 2) * 10} r={2.5} fill={carrierColor} opacity={0.8}/>
                    <line x1={82 + i * 12} y1={48 + (i % 2) * 10} x2={92 + i * 12} y2={48 + (i % 2) * 10} stroke={carrierColor} strokeWidth={0.8}/>
                  </g>
                ))}
                <text x={105} y={100} fill={C.green} fontSize={9} textAnchor="middle">→ {carrierLabel} injected from E to C</text>
              </g>
            )}

            {/* Mode indicator */}
            <rect x={20} y={120} width={170} height={24} rx={6} fill={mode === 'Active' ? C.green : mode === 'Saturation' ? C.amber : C.red} opacity={0.15}/>
            <text x={105} y={136} fill={mode === 'Active' ? C.green : mode === 'Saturation' ? C.amber : C.red} fontSize={12} textAnchor="middle" fontWeight={700}>{mode} Mode</text>

            {/* Output characteristics */}
            <g transform="translate(260, 10)">
              <text x={130} y={10} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">|Ic| vs {vceLabel}</text>
              <line x1={30} y1={230} x2={270} y2={230} stroke={C.borderLight} strokeWidth={1}/>
              <line x1={30} y1={20} x2={30} y2={230} stroke={C.borderLight} strokeWidth={1}/>
              <text x={265} y={248} fill={C.dim} fontSize={9}>{vceLabel}</text>
              <text x={8} y={25} fill={C.dim} fontSize={9}>|Ic|</text>

              {curves.map((vb, idx) => {
                const ib = Is * (Math.exp(vb / Vt) - 1);
                const icMax = beta * ib;
                const pts = [];
                for (let vce = 0; vce <= 10; vce += 0.1) {
                  const ic = vce < Vce_sat ? vce / Vce_sat * icMax * 0.5 : icMax;
                  const px = 30 + vce * 24;
                  const py = 230 - Math.min(ic * 1e3 * 50, 200);
                  pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
                }
                return <polyline key={idx} points={pts.join(' ')} fill="none" stroke={C.accent} strokeWidth={1.5} opacity={0.3 + idx * 0.2}/>;
              })}

              {/* Operating point */}
              {(() => {
                const px = 30 + Vce * 24;
                const py = 230 - Math.min(Ic * 1e3 * 50, 200);
                return <circle cx={Math.min(px, 265)} cy={Math.max(py, 30)} r={5} fill={C.amber} stroke="#fff" strokeWidth={1.5}/>;
              })()}

              {/* Labels */}
              {curves.map((vb, idx) => (
                <text key={idx} x={262} y={230 - Math.min(beta * Is * (Math.exp(vb / Vt) - 1) * 1e3 * 50, 200) + 4} fill={C.muted} fontSize={8}>{vbeLabel}={vb}</text>
              ))}
            </g>
          </svg>
        </div>
        <span style={S.eq}>|Ic| = β · |Ib|   |   β = {beta}   |   |Ib| = {(Ib * 1e6).toFixed(2)} μA   |   |Ic| = {(Ic * 1e3).toFixed(2)} mA</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>BJTs are the original transistor — still used in analog amplifiers, RF circuits, high-speed ECL logic, and power applications. A small base current controls a much larger collector current (current gain β = 50–300). Understanding active/cutoff/saturation modes is essential for circuit design.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Mode" value={mode} color={mode === 'Active' ? C.green : mode === 'Saturation' ? C.amber : C.red}/>
        <RI label="|Ib|" value={`${(Ib * 1e6).toFixed(2)} μA`} color={C.pink}/>
        <RI label="|Ic|" value={`${(Ic * 1e3).toFixed(2)} mA`} color={carrierColor}/>
        <RI label="|Ie|" value={`${(Ie * 1e3).toFixed(2)} mA`} color={C.green}/>
      </div>
      <div style={S.controls}>
        <div style={S.cg}>
          <span style={S.label}>Type</span>
          <select style={S.sel} value={type} onChange={e => setType(e.target.value)}>
            <option value="NPN">NPN</option><option value="PNP">PNP</option>
          </select>
        </div>
        <CG label={vbeLabel} min={0} max={0.75} step={0.01} value={Vbe} set={setVbe} unit=" V"/>
        <CG label={vceLabel} min={0} max={10} step={0.1} value={Vce} set={setVce} unit=" V"/>
        <CG label="β" min={20} max={300} step={10} value={beta} set={setBeta}/>
      </div>
    </div>
  );
}

function BJTTheory() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>Bipolar Junction Transistor (BJT)</h2>
      <p style={S.p}>The BJT is a three-terminal device (Emitter, Base, Collector) formed by two back-to-back PN junctions sharing a thin base region. It's fundamentally a <strong>current-controlled current source</strong>: a small base current Ib controls a much larger collector current Ic = β · Ib. The BJT was invented at Bell Labs in 1947 and enabled the first transistor computers.</p>

      <h3 style={S.h3}>NPN vs PNP</h3>
      <p style={S.p}><strong>NPN:</strong> N(emitter)–P(base)–N(collector). Forward-biased B-E junction injects electrons from emitter into the base; most traverse the thin base and are swept into the collector by the reverse-biased B-C junction. <strong>PNP:</strong> Reverse polarity — holes are the main carriers — but the operating principle is identical. NPN devices are faster because electron mobility (1400 cm²/V·s) exceeds hole mobility (450 cm²/V·s).</p>

      <h3 style={S.h3}>Operating Modes</h3>
      <table style={S.tbl}>
        <thead><tr><th style={S.th}>Mode</th><th style={S.th}>B-E Junction</th><th style={S.th}>B-C Junction</th><th style={S.th}>Use Case</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Active (forward)</td><td style={S.td}>Forward biased</td><td style={S.td}>Reverse biased</td><td style={S.td}>Amplification — Ic = β·Ib</td></tr>
          <tr><td style={S.td}>Cutoff</td><td style={S.td}>Reverse</td><td style={S.td}>Reverse</td><td style={S.td}>Switch OFF — both junctions blocking</td></tr>
          <tr><td style={S.td}>Saturation</td><td style={S.td}>Forward</td><td style={S.td}>Forward</td><td style={S.td}>Switch ON — Vce ≈ 0.2 V (Vce_sat)</td></tr>
          <tr><td style={S.td}>Inverse active</td><td style={S.td}>Reverse</td><td style={S.td}>Forward</td><td style={S.td}>Rarely used; β is very small</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>Current Gain Mechanics</h3>
      <p style={S.p}>The DC current gain β = Ic/Ib is the product of two efficiency factors:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Emitter injection efficiency γ:</strong> Fraction of emitter current that is the minority carrier component (electrons for NPN). Maximized by heavily doping the emitter (N⁺) relative to the base (P), so most emitter current is electrons, not holes flowing the wrong way.</li>
        <li style={S.li}><strong>Base transport factor α_T:</strong> Fraction of injected minority carriers that make it across the base without recombining. With base width W_B and diffusion length L_n in the base: α_T ≈ 1 − (W_B/L_n)². Thin bases (&lt; L_n) give α_T ≈ 1.</li>
      </ul>
      <code style={S.eq}>β ≈ γ · α_T / (1 − γ · α_T)   |   typical: β = 50 – 300</code>

      <h3 style={S.h3}>Key Equations</h3>
      <code style={S.eq}>Ic = β · Ib   |   Ie = Ic + Ib = (β + 1) · Ib</code>
      <code style={S.eq}>Ic = Is · exp(Vbe / Vt)   (in active region, independent of Vce)</code>
      <p style={S.p}>Note that Ic is exponentially controlled by Vbe — the BJT is in reality a <em>transconductance</em> device. The relationship Ic = β · Ib is a consequence; β itself varies with temperature, collector current, and between units of the same part number.</p>

      <h3 style={S.h3}>Early Effect</h3>
      <p style={S.p}>In practice, Ic is not perfectly constant with Vce in the active region — it increases slightly. Higher Vce widens the B-C depletion region into the base, <strong>effectively narrowing the base width</strong> (base-width modulation). A narrower base means less recombination → higher β. Extrapolating the Ic-Vce output curves back to the Vce-axis gives the <strong>Early voltage VA</strong> (−15 to −150 V). The modified model:</p>
      <code style={S.eq}>Ic = Is · exp(Vbe / Vt) · (1 + Vce / VA)</code>

      <h3 style={S.h3}>Frequency Response &amp; fT</h3>
      <p style={S.p}>At high frequencies, current gain drops. The <strong>transition frequency fT</strong> is the frequency at which |β| = 1:</p>
      <code style={S.eq}>1/(2π·fT) ≈ τ_F + Cje/gm   (τ_F = minority carrier transit time through base)</code>
      <p style={S.p}>For modern Si BJTs, fT ≈ 5–50 GHz. <strong>SiGe HBTs</strong> (heterojunction bipolar transistors) use a graded SiGe alloy in the base to create a built-in electric field that accelerates carriers, achieving fT &gt; 500 GHz — enabling mm-wave circuits for 5G backhaul, radar, and automotive sensors.</p>

      <div style={S.ctx}><span style={S.ctxT}>Where this matters</span><p style={S.ctxP}>BJTs remain essential for: precision analog circuits where the exponential Vbe-Ic relation enables bandgap voltage references (used in every voltage regulator IC); RF/microwave amplifiers using SiGe HBTs in 5G base stations; IGBTs (Insulated Gate Bipolar Transistor = MOSFET gate + BJT output) for high-current power electronics up to MW scale in trains, EV inverters, and industrial drives; ECL (Emitter-Coupled Logic) for sub-100 ps gate delays in specialized high-speed applications.</p></div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   TAB 6 — MOSFET
   ═══════════════════════════════════════════════════════════════════ */
function MOSFETSimulate() {
  const [Vgs, setVgs] = useState(2.0);
  const [Vds, setVds] = useState(3.0);
  const [Vt, setVth] = useState(1.0);
  const [kn, setKn] = useState(0.5);
  const knA = kn * 1e-3;

  const isOff = Vgs < Vt;
  const inTriode = !isOff && Vds < (Vgs - Vt);
  const inSat = !isOff && Vds >= (Vgs - Vt);
  const mode = isOff ? 'Cutoff' : inTriode ? 'Triode' : 'Saturation';

  const Id = isOff ? 0 : inTriode
    ? knA * ((Vgs - Vt) * Vds - 0.5 * Vds * Vds)
    : 0.5 * knA * (Vgs - Vt) * (Vgs - Vt);

  // I-V family
  const vgsValues = [1.5, 2.0, 2.5, 3.0];

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>MOSFET (Metal-Oxide-Semiconductor FET)</p><p style={S.sub}>Voltage-controlled switch — gate voltage creates a conducting channel</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 300" style={{ width:'100%', maxWidth:560 }}>
            {/* MOS cross-section */}
            <text x={120} y={18} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">NMOS Cross-Section</text>
            {/* Substrate */}
            <rect x={20} y={140} width={220} height={70} rx={4} fill={C.pink} opacity={0.08} stroke={C.pink} strokeWidth={1}/>
            <text x={130} y={185} fill={C.pink} fontSize={10} textAnchor="middle">P-substrate (Body)</text>
            {/* Source */}
            <rect x={30} y={110} width={50} height={35} rx={3} fill={C.cyan} opacity={0.2} stroke={C.cyan} strokeWidth={1}/>
            <text x={55} y={132} fill={C.cyan} fontSize={10} textAnchor="middle">N⁺ S</text>
            {/* Drain */}
            <rect x={180} y={110} width={50} height={35} rx={3} fill={C.cyan} opacity={0.2} stroke={C.cyan} strokeWidth={1}/>
            <text x={205} y={132} fill={C.cyan} fontSize={10} textAnchor="middle">N⁺ D</text>
            {/* Oxide */}
            <rect x={80} y={97} width={100} height={15} rx={2} fill={C.amber} opacity={0.2} stroke={C.amber} strokeWidth={1}/>
            <text x={130} y={108} fill={C.amber} fontSize={8} textAnchor="middle">SiO₂</text>
            {/* Gate */}
            <rect x={80} y={77} width={100} height={20} rx={3} fill={C.accent} opacity={0.25} stroke={C.accent} strokeWidth={1.5}/>
            <text x={130} y={91} fill={C.accentLight} fontSize={10} textAnchor="middle" fontWeight={600}>Gate</text>
            {/* Channel (if on) */}
            {!isOff && (
              <rect x={80} y={112} width={100} height={8} rx={2} fill={C.cyan} opacity={0.3 + (Vgs - Vt) * 0.15}/>
            )}
            {!isOff && <text x={130} y={158} fill={C.cyan} fontSize={9} textAnchor="middle">Channel (inversion layer)</text>}

            {/* I-V curves */}
            <g transform="translate(290, 10)">
              <text x={120} y={10} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">Id vs Vds</text>
              <line x1={30} y1={230} x2={250} y2={230} stroke={C.borderLight} strokeWidth={1}/>
              <line x1={30} y1={20} x2={30} y2={230} stroke={C.borderLight} strokeWidth={1}/>
              <text x={245} y={248} fill={C.dim} fontSize={9}>Vds</text>
              <text x={12} y={25} fill={C.dim} fontSize={9}>Id</text>

              {vgsValues.map((vg, idx) => {
                if (vg <= Vt) return null;
                const pts = [];
                for (let vd = 0; vd <= 5; vd += 0.05) {
                  const id = vd < (vg - Vt)
                    ? knA * ((vg - Vt) * vd - 0.5 * vd * vd)
                    : 0.5 * knA * (vg - Vt) * (vg - Vt);
                  const px = 30 + vd * 44;
                  const py = 230 - Math.min(id * 1e3 * 40, 200);
                  pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
                }
                return <polyline key={idx} points={pts.join(' ')} fill="none" stroke={C.accent} strokeWidth={1.5} opacity={0.3 + idx * 0.2}/>;
              })}

              {/* Triode/Sat boundary */}
              {!isOff && (() => {
                const vdsat = Vgs - Vt;
                const px = 30 + vdsat * 44;
                return <line x1={px} y1={30} x2={px} y2={230} stroke={C.amber} strokeWidth={1} strokeDasharray="3 3" opacity={0.5}/>;
              })()}

              {/* Operating point */}
              {(() => {
                const px = 30 + Vds * 44;
                const py = 230 - Math.min(Id * 1e3 * 40, 200);
                return <circle cx={Math.min(px, 245)} cy={Math.max(py, 25)} r={5} fill={C.amber} stroke="#fff" strokeWidth={1.5}/>;
              })()}

              {vgsValues.map((vg, idx) => {
                if (vg <= Vt) return null;
                const id = 0.5 * knA * (vg - Vt) * (vg - Vt);
                return <text key={idx} x={252} y={230 - Math.min(id * 1e3 * 40, 200) + 4} fill={C.muted} fontSize={8}>Vgs={vg}</text>;
              })}
            </g>

            {/* Mode */}
            <rect x={20} y={220} width={220} height={22} rx={6} fill={mode === 'Saturation' ? C.green : mode === 'Triode' ? C.amber : C.red} opacity={0.15}/>
            <text x={130} y={235} fill={mode === 'Saturation' ? C.green : mode === 'Triode' ? C.amber : C.red} fontSize={11} textAnchor="middle" fontWeight={700}>{mode} (Vgs−Vt = {(Vgs - Vt).toFixed(2)} V)</text>
          </svg>
        </div>
        <span style={S.eq}>{mode === 'Triode' ? `Id = kn[(Vgs−Vt)Vds − Vds²/2] = ${(Id * 1e3).toFixed(3)} mA` : mode === 'Saturation' ? `Id = ½kn(Vgs−Vt)² = ${(Id * 1e3).toFixed(3)} mA` : 'Id = 0  (Vgs < Vt)'}</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>The MOSFET is the dominant device in modern ICs — billions per chip. It's a voltage-controlled switch with near-zero gate current, enabling CMOS logic with minimal static power. Understanding triode vs saturation is essential for both digital (switching) and analog (amplification) design.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Mode" value={mode} color={mode === 'Saturation' ? C.green : mode === 'Triode' ? C.amber : C.red}/>
        <RI label="Id" value={`${(Id * 1e3).toFixed(1)} mA`} color={C.accent}/>
        <RI label="Vgs−Vt" value={`${(Vgs - Vt).toFixed(2)} V`} color={C.cyan}/>
        <RI label="Vds(sat)" value={isOff ? 'N/A' : `${(Vgs - Vt).toFixed(2)} V`} color={C.amber}/>
      </div>
      <div style={S.controls}>
        <CG label="Vgs" min={0} max={3.5} step={0.05} value={Vgs} set={setVgs} unit=" V"/>
        <CG label="Vds" min={0} max={5} step={0.05} value={Vds} set={setVds} unit=" V"/>
        <CG label="Vt" min={0.3} max={2} step={0.1} value={Vt} set={setVth} unit=" V"/>
        <CG label="kn" min={0.1} max={2} step={0.1} value={kn} set={setKn} unit=" mA/V²"/>
      </div>
    </div>
  );
}

function MOSFETTheory() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>MOSFET</h2>
      <p style={S.p}>The Metal-Oxide-Semiconductor Field-Effect Transistor is the most important device in modern electronics — over 10²² have been manufactured. Unlike the BJT, it's <strong>voltage-controlled</strong>: the gate draws essentially zero DC current (gate is isolated by SiO₂ or high-k dielectric). This enables CMOS logic with near-zero static power, allowing billions of transistors per chip.</p>

      <h3 style={S.h3}>MOS Capacitor &amp; Threshold Voltage</h3>
      <p style={S.p}>The core of the MOSFET is a capacitor: metal/polysilicon gate — thin dielectric (SiO₂ or HfO₂) — semiconductor body. As gate voltage Vgs increases, the semiconductor surface undergoes three regimes:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Accumulation</strong> (Vgs &lt; 0 for NMOS): Majority carriers (holes) accumulate at the surface. No channel forms.</li>
        <li style={S.li}><strong>Depletion</strong> (0 &lt; Vgs &lt; Vt): Holes are repelled, forming a depletion region. Surface is depleted of mobile carriers.</li>
        <li style={S.li}><strong>Inversion</strong> (Vgs &gt; Vt): Electron concentration at the surface <em>exceeds</em> hole concentration — a conducting inversion layer ("channel") forms between source and drain, enabling current flow.</li>
      </ul>
      <p style={S.p}>The threshold voltage Vt is a key design parameter set by oxide thickness, substrate doping, and work function engineering:</p>
      <code style={S.eq}>Vt = φ_ms − Qox/Cox + 2φ_F + √(4εs·q·Na·φ_F)/Cox</code>

      <h3 style={S.h3}>Operating Regions</h3>
      <code style={S.eq}>Triode:      Id = μn·Cox·(W/L)·[(Vgs − Vt)Vds − Vds²/2]   (Vds &lt; Vgs − Vt)</code>
      <code style={S.eq}>Saturation:  Id = ½·μn·Cox·(W/L)·(Vgs − Vt)²              (Vds ≥ Vgs − Vt)</code>
      <p style={S.p}>In <strong>triode</strong> (linear) region, the channel exists from source to drain — the MOSFET behaves as a voltage-controlled resistor with Ron = L/(μn·Cox·W·(Vgs − Vt)). In <strong>saturation</strong>, the channel "pinches off" at the drain end; Id is ideally independent of Vds, operating as a voltage-controlled current source. The <strong>transconductance</strong>:</p>
      <code style={S.eq}>gm = ∂Id/∂Vgs = μn·Cox·(W/L)·(Vgs − Vt) = √(2·μn·Cox·(W/L)·Id)</code>

      <h3 style={S.h3}>Body Effect</h3>
      <p style={S.p}>When the body (substrate) is not at the same potential as the source, the threshold voltage shifts — this is the <strong>body effect</strong> or back-gate effect:</p>
      <code style={S.eq}>Vt = Vt0 + γ(√(|2φ_F + Vsb|) − √(|2φ_F|))</code>
      <p style={S.p}>In stacked circuits and pass-transistor logic, source-body voltage Vsb increases as transistors are stacked, raising Vt and weakening pull-down strength. This is a key consideration in multi-stack CMOS gate design.</p>

      <h3 style={S.h3}>Short-Channel Effects</h3>
      <p style={S.p}>As channel length L shrinks below ~100 nm, ideal behavior breaks down. Critical short-channel effects:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>DIBL</strong> (Drain-Induced Barrier Lowering): Drain's electric field penetrates toward the source, lowering the potential barrier and reducing Vt at high Vds. Measured in mV/V — lower is better.</li>
        <li style={S.li}><strong>Threshold voltage roll-off:</strong> Vt decreases with shorter L because drain/source depletion regions eat into the channel, reducing the charge the gate must control.</li>
        <li style={S.li}><strong>Velocity saturation:</strong> Carriers reach v_sat before the channel can pinch off, so Id ∝ (Vgs − Vt) → linear, not quadratic.</li>
        <li style={S.li}><strong>Gate leakage:</strong> SiO₂ below ~1.5 nm is thin enough for quantum-mechanical tunneling. Solved by high-k dielectrics (HfO₂, k ≈ 22) allowing physically thicker gate dielectric with same capacitance.</li>
      </ul>

      <h3 style={S.h3}>Scaling with Moore's Law</h3>
      <p style={S.p}>Dennard scaling (1974) predicted that shrinking all dimensions by 1/k: doubles transistor density, improves speed by k, and keeps power density constant. This held until ~2004 when static leakage power exploded with thinner gates. Modern scaling innovations include: <strong>strained silicon</strong> (+50% mobility), <strong>high-k/metal gate</strong> (reduces leakage), <strong>FinFETs</strong> (better electrostatics), and <strong>EUV lithography</strong> (defining 5 nm features).</p>

      <div style={S.ctx}><span style={S.ctxT}>Where this matters</span><p style={S.ctxP}>Every digital IC — CPUs, GPUs, FPGAs, memory — is built from MOSFETs. An Apple M2-class chip contains tens of billions of MOSFETs on a 5 nm-class process. Power MOSFETs (LDMOS, Super-Junction) handle 600+ V / 100+ A in EV inverters, solar converters, and industrial motor drives. RF MOSFETs in antenna switches handle GHz signals in every smartphone. Understanding MOSFET operation is the foundation for digital design, analog IC design, and power electronics.</p></div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   TAB 7 — FinFET
   ═══════════════════════════════════════════════════════════════════ */
function FinFETSimulate() {
  const [finH, setFinH] = useState(40);
  const [finW, setFinW] = useState(7);
  const [Vgs, setVgs] = useState(0.7);
  const [Vds, setVds] = useState(0.5);

  const Vt = 0.3;
  const isOff = Vgs < Vt;
  const Weff = 2 * finH + finW; // effective gate width
  const kn = 0.8;
  const Vov = Math.max(Vgs - Vt, 0);
  const inSat = Vds >= Vov;
  const Id = isOff ? 0 : inSat ? 0.5 * kn * Weff / 100 * Vov * Vov : kn * Weff / 100 * (Vov * Vds - 0.5 * Vds * Vds);
  const SS = isOff ? 75 : 65 + (Vov > 0 ? 0 : 10); // approx subthreshold slope

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>FinFET (Fin Field-Effect Transistor)</p><p style={S.sub}>3D tri-gate structure for sub-22 nm nodes</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 300" style={{ width:'100%', maxWidth:560 }}>
            {/* 3D-ish fin illustration */}
            <text x={140} y={18} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">FinFET 3D Structure</text>

            {/* Substrate base */}
            <polygon points="30,240 250,240 290,200 70,200" fill={C.surfaceAlt} stroke={C.borderLight} strokeWidth={1}/>
            <text x={160} y={225} fill={C.dim} fontSize={10} textAnchor="middle">Si Substrate</text>

            {/* Fin (vertical) */}
            {(() => {
              const fh = finH * 2;
              const fw = finW * 1.5;
              const fx = 140 - fw / 2;
              const fy = 200 - fh;
              return (
                <g>
                  {/* Fin front face */}
                  <rect x={fx} y={fy} width={fw} height={fh} fill={C.cyan} opacity={0.2} stroke={C.cyan} strokeWidth={1.5}/>
                  {/* Fin top face */}
                  <polygon points={`${fx},${fy} ${fx + 20},${fy - 15} ${fx + fw + 20},${fy - 15} ${fx + fw},${fy}`} fill={C.cyan} opacity={0.15} stroke={C.cyan} strokeWidth={1}/>
                  {/* Fin side face */}
                  <polygon points={`${fx + fw},${fy} ${fx + fw + 20},${fy - 15} ${fx + fw + 20},${fy + fh - 15} ${fx + fw},${fy + fh}`} fill={C.cyan} opacity={0.1} stroke={C.cyan} strokeWidth={1}/>
                  <text x={fx + fw / 2} y={fy + fh / 2 + 4} fill={C.cyan} fontSize={9} textAnchor="middle" fontWeight={600}>Fin</text>
                  <text x={fx - 5} y={fy + fh / 2} fill={C.dim} fontSize={8} textAnchor="end">H={finH}nm</text>
                  <text x={fx + fw / 2} y={fy + fh + 14} fill={C.dim} fontSize={8} textAnchor="middle">W={finW}nm</text>
                </g>
              );
            })()}

            {/* Gate wrapping around fin */}
            {(() => {
              const fh = finH * 2;
              const fw = finW * 1.5;
              const gx = 125 - fw / 2;
              const gy = 200 - fh - 10;
              const gw = fw + 30 + 20;
              const gh = fh + 20;
              return (
                <rect x={gx} y={gy} width={gw} height={gh} rx={6} fill={C.accent} opacity={0.12} stroke={C.accent} strokeWidth={2} strokeDasharray="5 3"/>
              );
            })()}
            <text x={210} y={120} fill={C.accentLight} fontSize={11} fontWeight={600}>Gate wraps 3 sides</text>

            {/* Source / Drain labels */}
            <text x={60} y={170} fill={C.green} fontSize={11} fontWeight={600}>Source</text>
            <text x={200} y={170} fill={C.amber} fontSize={11} fontWeight={600}>Drain</text>

            {/* Planar vs FinFET comparison */}
            <g transform="translate(320, 25)">
              <text x={100} y={0} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">Planar vs FinFET</text>

              {/* Planar */}
              <rect x={10} y={20} width={180} height={55} rx={6} fill={C.surfaceAlt} stroke={C.borderLight} strokeWidth={1}/>
              <text x={20} y={38} fill={C.red} fontSize={10} fontWeight={600}>Planar MOSFET</text>
              <text x={20} y={52} fill={C.muted} fontSize={9}>Gate controls from 1 side</text>
              <text x={20} y={65} fill={C.muted} fontSize={9}>Poor electrostatics at &lt;22nm</text>

              {/* FinFET */}
              <rect x={10} y={85} width={180} height={55} rx={6} fill={C.surfaceAlt} stroke={C.accent} strokeWidth={1.5}/>
              <text x={20} y={103} fill={C.green} fontSize={10} fontWeight={600}>FinFET (Tri-Gate)</text>
              <text x={20} y={117} fill={C.muted} fontSize={9}>Gate wraps 3 sides of fin</text>
              <text x={20} y={131} fill={C.muted} fontSize={9}>Better control, lower leakage</text>

              {/* Metrics */}
              <text x={100} y={165} fill={C.text} fontSize={11} fontWeight={600} textAnchor="middle">Key Advantages</text>
              <text x={20} y={185} fill={C.cyan} fontSize={10}>Weff = 2H + W = {Weff} nm</text>
              <text x={20} y={200} fill={C.green} fontSize={10}>SS ≈ {SS} mV/dec (ideal: 60)</text>
              <text x={20} y={215} fill={C.amber} fontSize={10}>Id ≈ {(Id * 1e3).toFixed(2)} mA</text>
              <text x={20} y={235} fill={C.muted} fontSize={9}>Used: Intel 22nm+, TSMC 16nm+</text>
            </g>
          </svg>
        </div>
        <span style={S.eq}>Weff = 2·H + W = {Weff} nm   |   Id ≈ {(Id * 1e3).toFixed(2)} mA   |   SS ≈ {SS} mV/decade</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>Every modern CPU, GPU, and mobile SoC (from Intel 22nm onward, TSMC 16nm, Samsung 14nm) uses FinFET technology. The 3D fin structure was the breakthrough that kept Moore's Law alive past the 22 nm node. Gate-all-around (GAA) nanosheet transistors are the next evolution at 3 nm and below.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Fin Height" value={`${finH} nm`} color={C.cyan}/>
        <RI label="Fin Width" value={`${finW} nm`} color={C.violet}/>
        <RI label="Weff" value={`${Weff} nm`} color={C.green}/>
        <RI label="Id" value={`${(Id * 1e3).toFixed(2)} mA`} color={C.amber}/>
      </div>
      <div style={S.controls}>
        <CG label="Fin Height" min={20} max={60} step={2} value={finH} set={setFinH} unit=" nm"/>
        <CG label="Fin Width" min={5} max={15} step={1} value={finW} set={setFinW} unit=" nm"/>
        <CG label="Vgs" min={0} max={1.0} step={0.05} value={Vgs} set={setVgs} unit=" V"/>
        <CG label="Vds" min={0} max={1.0} step={0.05} value={Vds} set={setVds} unit=" V"/>
      </div>
    </div>
  );
}

function FinFETTheory() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>FinFET (Fin Field-Effect Transistor)</h2>
      <p style={S.p}>As planar MOSFET channel lengths shrank below ~30 nm, the gate electrode sitting on top of a flat channel lost electrostatic control. The drain's field began "punching through" to the source region — a phenomenon called <strong>Drain-Induced Barrier Lowering (DIBL)</strong> — causing excessive off-state leakage. The <strong>FinFET</strong> solved this by moving the channel into a vertical 3D fin and wrapping the gate around it on three sides.</p>

      <h3 style={S.h3}>Why Planar MOSFETs Failed Below 22nm</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong>DIBL:</strong> Drain's electric field lowers the source-channel potential barrier, reducing Vt and increasing off-state current</li>
        <li style={S.li}><strong>Vt roll-off:</strong> Source and drain depletion regions extend into the channel, reducing the gate's share of charge control ("natural length" scales with gate oxide and channel thickness)</li>
        <li style={S.li}><strong>Degraded subthreshold slope:</strong> SS exceeds the 60 mV/dec ideal due to poor gate electrostatic control — device can't turn off sharply</li>
        <li style={S.li}><strong>Random dopant fluctuation:</strong> With only ~100 dopant atoms in a short channel, statistical variation causes device-to-device Vt mismatch</li>
      </ul>

      <h3 style={S.h3}>The FinFET Solution: Tri-Gate Control</h3>
      <p style={S.p}>A silicon fin (typically 5–10 nm wide, 30–50 nm tall) rises vertically from the substrate. The gate metal wraps over the top and down both sides — controlling the channel from <em>three</em> surfaces simultaneously. This dramatically improves the gate's electrostatic leverage over the channel.</p>
      <code style={S.eq}>Weff = 2 × Hfin + Wfin</code>
      <p style={S.p}>For Hfin = 40 nm, Wfin = 7 nm: Weff = 87 nm. Multiple fins placed side-by-side multiply drive current while sharing source/drain and gate contacts. This lets designers trade off width in discrete steps (multiples of fin pitch, typically 27–42 nm).</p>

      <h3 style={S.h3}>Subthreshold Slope</h3>
      <code style={S.eq}>SS = (kT/q) · ln(10) · (1 + Cd/Cox) ≈ 60–70 mV/decade</code>
      <p style={S.p}>The ideal subthreshold slope (60 mV/dec at 300 K) means each decade of current change requires 60 mV change in gate voltage. FinFETs achieve 65–70 mV/dec vs. 90–110 mV/dec for equivalent planar devices, enabling sharper switching with better off-state leakage control.</p>

      <h3 style={S.h3}>Technology Adoption</h3>
      <table style={S.tbl}>
        <thead><tr><th style={S.th}>Company</th><th style={S.th}>First FinFET Node</th><th style={S.th}>Year</th><th style={S.th}>Notable Products</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Intel</td><td style={S.td}>22 nm (Ivy Bridge)</td><td style={S.td}>2012</td><td style={S.td}>Core i-series 3rd gen</td></tr>
          <tr><td style={S.td}>TSMC</td><td style={S.td}>16 nm</td><td style={S.td}>2014</td><td style={S.td}>Apple A9, Nvidia Pascal</td></tr>
          <tr><td style={S.td}>Samsung</td><td style={S.td}>14 nm</td><td style={S.td}>2015</td><td style={S.td}>Exynos 7420, Snapdragon 820</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>Next Generation: Gate-All-Around (GAA) Nanosheets</h3>
      <p style={S.p}>FinFETs reach their electrostatic limit at ~3–5 nm nodes — the fin becomes too narrow for high drive current. <strong>Gate-All-Around (GAA) nanosheet transistors</strong> stack horizontal Si or SiGe nanosheets and wrap the gate on all four sides, achieving even better electrostatic control. Key advantages over FinFET:</p>
      <ul style={S.ul}>
        <li style={S.li}>Continuous gate-width tunability (by varying nanosheet width/count)</li>
        <li style={S.li}>Further DIBL and SS improvement</li>
        <li style={S.li}><strong>CFET</strong> (Complementary FET): NMOS and PMOS stacked vertically on same footprint, potentially 2× density over lateral CMOS</li>
      </ul>
      <p style={S.p}>Samsung and Intel introduced GAA at their 3 nm node (2022–2023). TSMC adopted GAA at N2 (2025). This is the transistor architecture that will define AI accelerators and mobile chips through the 2030s.</p>

      <div style={S.ctx}><span style={S.ctxT}>Where this matters</span><p style={S.ctxP}>Every modern high-performance chip — iPhone processors (TSMC N3E), NVIDIA GPUs (TSMC N4), AMD Ryzen CPUs (TSMC N4P) — uses FinFET technology. The transition from planar to FinFET was as significant as going from vacuum tubes to transistors. Without FinFET, Moore's Law would have stalled in 2012. Without GAA, it would have stalled at ~3 nm. The physics of electrostatic control in nanoscale channels directly determines the pace of AI hardware advancement.</p></div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   TAB 8 — CMOS Inverter
   ═══════════════════════════════════════════════════════════════════ */
function CMOSSimulate() {
  const [Vin, setVin] = useState(0.5);
  const [Vdd, setVdd] = useState(1.8);
  const [ratio, setRatio] = useState(1.0);

  // Simplified VTC
  const Vm = Vdd * ratio / (1 + ratio);
  const Vout = Vin < Vm * 0.4 ? Vdd : Vin > Vm * 1.6 ? 0 : Vdd * (1 - Math.pow((Vin - Vm * 0.4) / (Vm * 1.2), 2));
  const pmosOn = Vin < Vdd * 0.5;
  const nmosOn = Vin > Vdd * 0.5;

  // VTC curve
  const vtcPoints = [];
  for (let v = 0; v <= Vdd; v += 0.01) {
    const vo = v < Vm * 0.4 ? Vdd : v > Vm * 1.6 ? 0 : Vdd * (1 - Math.pow((v - Vm * 0.4) / (Vm * 1.2), 2));
    vtcPoints.push([v, Math.max(0, Math.min(Vdd, vo))]);
  }

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>CMOS Inverter</p><p style={S.sub}>Complementary PMOS + NMOS — the building block of all digital logic</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 300" style={{ width:'100%', maxWidth:560 }}>
            {/* Schematic */}
            <text x={100} y={18} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">Inverter Circuit</text>

            {/* VDD rail */}
            <line x1={60} y1={35} x2={140} y2={35} stroke={C.red} strokeWidth={1.5}/>
            <text x={100} y={30} fill={C.red} fontSize={10} textAnchor="middle">VDD = {Vdd} V</text>

            {/* PMOS */}
            <rect x={75} y={45} width={50} height={40} rx={4} fill={pmosOn ? C.green : C.surfaceAlt} opacity={pmosOn ? 0.2 : 0.1} stroke={pmosOn ? C.green : C.borderLight} strokeWidth={1.5}/>
            <text x={100} y={69} fill={pmosOn ? C.green : C.dim} fontSize={10} textAnchor="middle" fontWeight={600}>PMOS</text>
            <line x1={100} y1={35} x2={100} y2={45} stroke={C.borderLight} strokeWidth={1.5}/>
            {/* Gate connection for PMOS */}
            <line x1={75} y1={65} x2={55} y2={65} stroke={C.borderLight} strokeWidth={1}/>
            <circle cx={75} cy={65} r={3} fill="none" stroke={C.accent} strokeWidth={1.5}/> {/* bubble = PMOS */}

            {/* Wire from PMOS to output */}
            <line x1={100} y1={85} x2={100} y2={105} stroke={C.borderLight} strokeWidth={1.5}/>

            {/* Output node */}
            <circle cx={100} cy={105} r={4} fill={C.amber}/>
            <line x1={104} y1={105} x2={155} y2={105} stroke={C.amber} strokeWidth={1.5}/>
            <text x={160} y={109} fill={C.amber} fontSize={10}>Vout = {Vout.toFixed(2)} V</text>

            {/* NMOS */}
            <rect x={75} y={115} width={50} height={40} rx={4} fill={nmosOn ? C.green : C.surfaceAlt} opacity={nmosOn ? 0.2 : 0.1} stroke={nmosOn ? C.green : C.borderLight} strokeWidth={1.5}/>
            <text x={100} y={139} fill={nmosOn ? C.green : C.dim} fontSize={10} textAnchor="middle" fontWeight={600}>NMOS</text>
            {/* Gate connection for NMOS */}
            <line x1={75} y1={135} x2={55} y2={135} stroke={C.borderLight} strokeWidth={1}/>
            <line x1={55} y1={65} x2={55} y2={135} stroke={C.borderLight} strokeWidth={1}/>
            <line x1={55} y1={100} x2={30} y2={100} stroke={C.accent} strokeWidth={1.5}/>
            <text x={15} y={104} fill={C.accent} fontSize={10}>Vin</text>

            {/* GND rail */}
            <line x1={100} y1={155} x2={100} y2={170} stroke={C.borderLight} strokeWidth={1.5}/>
            <line x1={60} y1={170} x2={140} y2={170} stroke={C.dim} strokeWidth={1.5}/>
            <text x={100} y={185} fill={C.dim} fontSize={10} textAnchor="middle">GND</text>

            {/* State annotation */}
            <text x={100} y={210} fill={pmosOn ? C.green : C.red} fontSize={10} textAnchor="middle">{pmosOn ? 'PMOS ON, NMOS OFF → Vout = HIGH' : 'NMOS ON, PMOS OFF → Vout = LOW'}</text>

            {/* VTC */}
            <g transform="translate(300, 10)">
              <text x={110} y={10} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">Voltage Transfer Characteristic</text>
              <line x1={30} y1={230} x2={240} y2={230} stroke={C.borderLight} strokeWidth={1}/>
              <line x1={30} y1={30} x2={30} y2={230} stroke={C.borderLight} strokeWidth={1}/>
              <text x={235} y={248} fill={C.dim} fontSize={9}>Vin</text>
              <text x={12} y={35} fill={C.dim} fontSize={9}>Vout</text>

              {/* Ideal line */}
              <line x1={30} y1={30} x2={30 + Vm * 0.4 / Vdd * 200} y2={30} stroke={C.borderLight} strokeWidth={1} strokeDasharray="2 2" opacity={0.3}/>

              {/* VTC curve */}
              <polyline points={vtcPoints.map(([v, vo]) => {
                const px = 30 + (v / Vdd) * 200;
                const py = 230 - (vo / Vdd) * 200;
                return `${px.toFixed(1)},${py.toFixed(1)}`;
              }).join(' ')} fill="none" stroke={C.green} strokeWidth={2}/>

              {/* Operating point */}
              {(() => {
                const px = 30 + (Vin / Vdd) * 200;
                const py = 230 - (Vout / Vdd) * 200;
                return <circle cx={px} cy={Math.max(py, 30)} r={5} fill={C.amber} stroke="#fff" strokeWidth={1.5}/>;
              })()}

              {/* Unity gain line */}
              <line x1={30} y1={230} x2={230} y2={30} stroke={C.dim} strokeWidth={0.8} strokeDasharray="4 3"/>
              <text x={180} y={60} fill={C.dim} fontSize={9}>Vout = Vin</text>

              {/* Noise margins */}
              <text x={120} y={268} fill={C.muted} fontSize={9} textAnchor="middle">Switching threshold ≈ {Vm.toFixed(2)} V</text>
            </g>
          </svg>
        </div>
        <span style={S.eq}>Vin = {Vin.toFixed(2)} V → Vout = {Vout.toFixed(2)} V   |   PMOS {pmosOn ? 'ON' : 'OFF'}, NMOS {nmosOn ? 'ON' : 'OFF'}   |   Static power ≈ 0</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>The CMOS inverter has near-zero static power consumption — one of PMOS/NMOS is always off, so no DC path from VDD to GND. This is why CMOS technology dominates: a billion-transistor chip can have sub-watt standby power. Every logic gate (NAND, NOR, XOR) is built from CMOS inverter principles.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Vin" value={`${Vin.toFixed(2)} V`} color={C.accent}/>
        <RI label="Vout" value={`${Vout.toFixed(2)} V`} color={C.amber}/>
        <RI label="PMOS" value={pmosOn ? 'ON' : 'OFF'} color={pmosOn ? C.green : C.red}/>
        <RI label="NMOS" value={nmosOn ? 'ON' : 'OFF'} color={nmosOn ? C.green : C.red}/>
      </div>
      <div style={S.controls}>
        <CG label="Vin" min={0} max={Vdd} step={0.01} value={Vin} set={setVin} unit=" V"/>
        <CG label="VDD" min={0.8} max={5.0} step={0.1} value={Vdd} set={setVdd} unit=" V"/>
        <CG label="P/N ratio" min={0.5} max={3.0} step={0.1} value={ratio} set={setRatio}/>
      </div>
    </div>
  );
}

function CMOSTheory() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>CMOS Inverter</h2>
      <p style={S.p}>The CMOS inverter uses one PMOS (pull-up) and one NMOS (pull-down) transistor connected in series between VDD and GND with their gates tied together. It is the foundation of all digital logic and the reason modern chips can integrate billions of transistors without melting.</p>

      <h3 style={S.h3}>Operation</h3>
      <p style={S.p}><strong>Input LOW (Vin = 0):</strong> PMOS gate-source voltage Vgs = −VDD, so |Vgs| &gt; |Vtp| — PMOS is ON and pulls output to VDD. NMOS has Vgs = 0 &lt; Vtn — NMOS is OFF. No DC path from VDD to GND. Vout = HIGH = VDD.</p>
      <p style={S.p}><strong>Input HIGH (Vin = VDD):</strong> NMOS has Vgs = VDD &gt; Vtn — ON and pulls output to GND. PMOS has Vgs = 0, |Vgs| &lt; |Vtp| — OFF. Vout = LOW = 0. In both stable states, exactly one transistor is off — <strong>zero DC current path, zero static power</strong>.</p>
      <p style={S.p}><strong>During transition:</strong> Both transistors are momentarily ON — a short-circuit current (crowbar current) flows for ~100 ps. This &ldquo;short-circuit power&rdquo; is typically a small fraction of total.</p>

      <h3 style={S.h3}>Voltage Transfer Characteristic &amp; Noise Margins</h3>
      <p style={S.p}>The VTC plots Vout vs Vin. A well-designed CMOS inverter has a sharp transition at the switching threshold Vm ≈ VDD/2. The <strong>noise margins</strong> quantify how much noise can be tolerated at inputs/outputs:</p>
      <code style={S.eq}>NMH = VOH − VIH   |   NML = VIL − VOL</code>
      <p style={S.p}>Where VOH = VDD (output high), VOL = 0 (output low), and VIH/VIL are the input voltages where gain = −1 on the VTC (the "unity-gain" threshold points). For a symmetric CMOS inverter with P/N ratio = 1: VM = VDD/2 and NMH = NML ≈ VDD/2 − Vt. Typical: ~0.4–0.45 × VDD noise margin at each rail.</p>

      <h3 style={S.h3}>Key Advantages of CMOS</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong>Zero static power:</strong> In steady state, exactly one transistor is off at all times — no DC current path from VDD to GND</li>
        <li style={S.li}><strong>Full rail-to-rail swing:</strong> Output reaches precisely 0 and VDD (unlike NMOS-only logic which is limited to VDD − Vt)</li>
        <li style={S.li}><strong>High noise margins:</strong> Sharp VTC transition allows large tolerance for noise on input signals</li>
        <li style={S.li}><strong>Scalability:</strong> The principles work from 10 μm feature sizes down to 2 nm nodes — the fundamental circuit topology has not changed in 50 years</li>
      </ul>

      <h3 style={S.h3}>Power Consumption</h3>
      <code style={S.eq}>P_dynamic = α · CL · VDD² · f</code>
      <code style={S.eq}>P_static = Ileak · VDD</code>
      <p style={S.p}><strong>Dynamic power</strong> dominates in active circuits — proportional to switching activity α (fraction of nodes switching per clock cycle), load capacitance CL (mostly gate + wire), supply voltage squared, and clock frequency. This is why reducing VDD from 1.2 V to 0.9 V gives a 44% dynamic power reduction.</p>
      <p style={S.p}><strong>Static (leakage) power</strong> has grown with scaling: thinner gate oxides allow tunneling current; shorter channels allow subthreshold current even when &ldquo;off.&rdquo; At 5 nm nodes, leakage can approach 30–50% of total chip power, driving techniques like multi-threshold CMOS (high-Vt cells for leakage-sensitive paths), power gating, and back-biasing.</p>

      <h3 style={S.h3}>Propagation Delay</h3>
      <code style={S.eq}>tpd ≈ 0.69 · Ron · CL   (RC delay model)</code>
      <p style={S.p}>Where Ron is the on-resistance of the driving transistor. Reducing CL (smaller devices, shorter wires) and increasing drive strength (wider transistors, lower Ron) both reduce delay. The fundamental tension in digital design: larger devices → lower Ron and faster drive, but larger Cgate loading on the previous stage — optimum balancing is performed by automatic timing-driven place-and-route tools.</p>

      <div style={S.ctx}><span style={S.ctxT}>Where this matters</span><p style={S.ctxP}>CMOS is the technology that makes modern computing possible. Without near-zero static power, a 10-billion transistor chip would dissipate thousands of watts at rest. The CMOS inverter principle extends to ALL gates (NAND, NOR, XOR), flip-flops, SRAMs, and complete microprocessors. Every digital system — from a $0.10 microcontroller to a $30,000 AI accelerator — is built from this same PMOS+NMOS complementary pair.</p></div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   TAB 9 — Logic Gates from Transistors
   ═══════════════════════════════════════════════════════════════════ */
function LogicSimulate() {
  const [A, setA] = useState(0);
  const [B, setB] = useState(0);
  const [gate, setGate] = useState('NAND');

  const Y = LOGIC_TRUTH[gate](A, B);

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Logic Gates from Transistors</p><p style={S.sub}>Building Boolean logic from CMOS pull-up and pull-down networks</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 300" style={{ width:'100%', maxWidth:560 }}>
            {/* Gate symbol */}
            <text x={120} y={18} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">{gate} Gate</text>

            {/* Inputs */}
            <line x1={20} y1={80} x2={60} y2={80} stroke={A ? C.green : C.dim} strokeWidth={2}/>
            <text x={40} y={72} fill={A ? C.green : C.dim} fontSize={11} textAnchor="middle" fontWeight={600}>A={A}</text>
            <line x1={20} y1={120} x2={60} y2={120} stroke={B ? C.green : C.dim} strokeWidth={2}/>
            <text x={40} y={112} fill={B ? C.green : C.dim} fontSize={11} textAnchor="middle" fontWeight={600}>B={B}</text>

            {/* Gate body */}
            <rect x={60} y={65} width={80} height={70} rx={gate === 'NAND' || gate === 'AND' ? 0 : 12} fill={C.surfaceAlt} stroke={C.accent} strokeWidth={2}/>
            {(gate === 'AND' || gate === 'NAND') && <path d="M100,65 L140,65 A40,35 0 0 1 140,135 L100,135 Z" fill={C.surfaceAlt} stroke={C.accent} strokeWidth={2}/>}
            {(gate === 'OR' || gate === 'NOR') && <path d="M60,65 Q80,100 60,135 Q110,135 140,100 Q110,65 60,65 Z" fill={C.surfaceAlt} stroke={C.accent} strokeWidth={2}/>}

            {/* Bubble for NAND/NOR */}
            {(gate === 'NAND' || gate === 'NOR') && <circle cx={148} cy={100} r={6} fill={C.bg} stroke={C.accent} strokeWidth={1.5}/>}

            {/* Output */}
            <line x1={gate === 'NAND' || gate === 'NOR' ? 154 : 140} y1={100} x2={200} y2={100} stroke={Y ? C.green : C.dim} strokeWidth={2}/>
            <text x={208} y={104} fill={Y ? C.green : C.dim} fontSize={12} fontWeight={700}>Y={Y}</text>

            {/* CMOS implementation */}
            <g transform="translate(280, 10)">
              <text x={120} y={10} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">CMOS Implementation</text>

              <text x={20} y={35} fill={C.muted} fontSize={10}>{LOGIC_INFO[gate].pull}</text>
              {LOGIC_INFO[gate].universal && <text x={20} y={52} fill={C.green} fontSize={10} fontWeight={600}>★ Universal gate — can build any logic</text>}

              {/* Truth table */}
              <text x={120} y={80} fill={C.text} fontSize={11} fontWeight={600} textAnchor="middle">Truth Table</text>
              <text x={30} y={100} fill={C.accentLight} fontSize={10} fontWeight={600}>A</text>
              <text x={70} y={100} fill={C.accentLight} fontSize={10} fontWeight={600}>B</text>
              <text x={130} y={100} fill={C.accentLight} fontSize={10} fontWeight={600}>Y = {gate}(A,B)</text>
              {[[0,0],[0,1],[1,0],[1,1]].map(([a, b], i) => {
                const y = LOGIC_TRUTH[gate](a, b);
                const isActive = a === A && b === B;
                return (
                  <g key={i}>
                    {isActive && <rect x={15} y={107 + i * 22} width={210} height={20} rx={4} fill={C.accent} opacity={0.1}/>}
                    <text x={30} y={121 + i * 22} fill={isActive ? C.text : C.muted} fontSize={11}>{a}</text>
                    <text x={70} y={121 + i * 22} fill={isActive ? C.text : C.muted} fontSize={11}>{b}</text>
                    <text x={150} y={121 + i * 22} fill={y ? C.green : C.red} fontSize={11} fontWeight={isActive ? 700 : 500}>{y}</text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        <span style={S.eq}>{gate}({A}, {B}) = {Y}   |   {LOGIC_INFO[gate].universal ? 'Universal gate — can implement any Boolean function' : `${gate} = ${gate === 'AND' ? 'NAND' : 'NOR'} + NOT`}</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>NAND and NOR are "universal" gates — any Boolean function can be built using only NAND (or only NOR) gates. In practice, standard cell libraries contain hundreds of gate variants, but they all reduce to combinations of NAND, NOR, and inverters. This is how software becomes hardware.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Gate" value={gate} color={C.accent}/>
        <RI label="A" value={A.toString()} color={A ? C.green : C.red}/>
        <RI label="B" value={B.toString()} color={B ? C.green : C.red}/>
        <RI label="Output Y" value={Y.toString()} color={Y ? C.green : C.red}/>
      </div>
      <div style={S.controls}>
        <div style={S.cg}>
          <span style={S.label}>Gate</span>
          <select style={S.sel} value={gate} onChange={e => setGate(e.target.value)}>
            <option value="NAND">NAND</option><option value="NOR">NOR</option>
            <option value="AND">AND</option><option value="OR">OR</option>
          </select>
        </div>
        <div style={S.cg}>
          <span style={S.label}>Input A</span>
          <button style={S.btn(A)} onClick={() => setA(a => 1 - a)}>{A ? 'HIGH (1)' : 'LOW (0)'}</button>
        </div>
        <div style={S.cg}>
          <span style={S.label}>Input B</span>
          <button style={S.btn(B)} onClick={() => setB(b => 1 - b)}>{B ? 'HIGH (1)' : 'LOW (0)'}</button>
        </div>
      </div>
    </div>
  );
}

function LogicTheory() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>Logic Gates from Transistors</h2>
      <p style={S.p}>Digital logic gates implement Boolean functions using transistors as switches. In CMOS, every gate has a complementary pair of networks: a <strong>pull-up network</strong> (PMOS, connects output to VDD for logic HIGH) and a <strong>pull-down network</strong> (NMOS, connects output to GND for logic LOW). The key constraint is that exactly one network is conducting in every static input state — guaranteeing full rail-to-rail output and zero static power.</p>

      <h3 style={S.h3}>Complementary Network Duality Rule</h3>
      <p style={S.p}>The PMOS pull-up network is always the <strong>topological dual</strong> of the NMOS pull-down network:</p>
      <ul style={S.ul}>
        <li style={S.li}>Wherever NMOS transistors are in <strong>series</strong> (implementing AND), PMOS transistors are in <strong>parallel</strong> (implementing NAND pull-up)</li>
        <li style={S.li}>Wherever NMOS transistors are in <strong>parallel</strong> (implementing OR), PMOS transistors are in <strong>series</strong> (implementing NOR pull-up)</li>
      </ul>
      <p style={S.p}>This duality means every combinational CMOS gate is inherently inverting — it implements Y = NOT(f(A,B,...)), which is why NAND and NOR are the primitive building blocks rather than AND and OR.</p>

      <h3 style={S.h3}>CMOS NAND Gate</h3>
      <p style={S.p}>Two NMOS in <strong>series</strong> (pull-down) + two PMOS in <strong>parallel</strong> (pull-up):</p>
      <code style={S.eq}>Y = ‾(A · B)   (NAND)</code>
      <p style={S.p}>Pull-down path completes (Y = LOW) only when BOTH A and B are HIGH — both series NMOS transistors ON. Otherwise, at least one PMOS is ON pulling Y HIGH. For a 3-input NAND: three NMOS in series. Note: series transistors must be upsized for equal drive strength (each NMOS has only 1/N of its normal width contribution).</p>

      <h3 style={S.h3}>CMOS NOR Gate</h3>
      <p style={S.p}>Two NMOS in <strong>parallel</strong> (pull-down) + two PMOS in <strong>series</strong> (pull-up):</p>
      <code style={S.eq}>Y = ‾(A + B)   (NOR)</code>
      <p style={S.p}>Pull-down completes (Y = LOW) when ANY input is HIGH. Y is HIGH only when ALL inputs are LOW (both series PMOS ON). Series PMOS must be upsized — PMOS already has ~2–3× the width of NMOS for equal drive current, so NOR gates scale poorly for many inputs.</p>

      <h3 style={S.h3}>Universal Gates &amp; De Morgan&apos;s Theorem</h3>
      <p style={S.p}>NAND and NOR are <strong>universal</strong> — any Boolean function can be built from only NAND (or only NOR) gates. This is proven via De Morgan&apos;s theorems:</p>
      <code style={S.eq}>‾(A · B) = ‾A + ‾B   (NAND De Morgan)</code>
      <code style={S.eq}>‾(A + B) = ‾A · ‾B   (NOR De Morgan)</code>
      <p style={S.p}>Constructing inverter, AND, and OR solely from NAND:</p>
      <ul style={S.ul}>
        <li style={S.li}>NOT(A) = NAND(A, A)</li>
        <li style={S.li}>AND(A, B) = NAND(NAND(A,B), NAND(A,B)) — invert the NAND</li>
        <li style={S.li}>OR(A, B) = NAND(NAND(A,A), NAND(B,B)) — De Morgan</li>
      </ul>

      <h3 style={S.h3}>Fan-In, Fan-Out &amp; Drive Strength</h3>
      <p style={S.p}><strong>Fan-in</strong> is the number of inputs a gate can accept. High fan-in (e.g., 8-input NAND) has a long series NMOS chain with high equivalent resistance — slow pull-down. Practical fan-in limit is 4–6 for standard cells.</p>
      <p style={S.p}><strong>Fan-out</strong> is the number of gate inputs driven. Each additional load adds capacitance, increasing propagation delay: tpd ∝ fan-out. Beyond 4–6 loads, buffers (repeated inverter pairs) are inserted. <strong>Drive strength</strong> variants (1×, 2×, 4×, 8× width) in standard cell libraries allow the EDA tool to match drive strength to load.</p>

      <h3 style={S.h3}>From Gates to Chips: RTL to GDS</h3>
      <p style={S.p}>Modern chip design uses RTL (Verilog/VHDL) → logic synthesis (convert to optimal gate netlist) → placement and routing (place standard cells, route wires) → signoff (timing, power, DRC). Synthesis tools map register-transfer logic to a library of characterized standard cells. A 5 nm standard cell library may contain 1000+ cell variants just for basic logic and flip-flops.</p>

      <div style={S.ctx}><span style={S.ctxT}>Where this matters</span><p style={S.ctxP}>NAND/NOR universality means an entire CPU can be built from just one gate type. In practice, standard cell libraries balance many gate types for area/speed/power trade-offs. NAND-dominant logic is preferred because series NMOS is faster than series PMOS. AOI (And-Or-Invert) and OAI cells implement complex Boolean functions in a single gate stage, critical for critical-path timing. Every FPGA lookup table (LUT-4, LUT-6) is a small SRAM that implements any 4/6-input Boolean function — a software-configurable universal logic element.</p></div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   TAB 10 — CPU Architecture
   ═══════════════════════════════════════════════════════════════════ */
function CPUSimulate() {
  const [stage, setStage] = useState(0);
  const [cacheHit, setCacheHit] = useState(true);
  const [inst, setInst] = useState('ADD');

  const stageMessage = useMemo(() => {
    if (inst === 'LOAD' && stage === 3) return cacheHit ? 'L1 cache HIT → data ready' : 'L1 MISS → L2/L3/DRAM (stall)';
    return CPU_STAGE_DESCRIPTIONS[inst][stage];
  }, [inst, stage, cacheHit]);

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>CPU Architecture &amp; Pipeline</p><p style={S.sub}>Fetch → Decode → Execute → Memory → Writeback</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 340" style={{ width:'100%', maxWidth:560 }}>
            {/* Pipeline stages */}
            <text x={280} y={18} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">5-Stage Pipeline</text>
            {CPU_STAGES.map((s, i) => {
              const x = 20 + i * 108;
              const isActive = i === stage;
              return (
                <g key={i}>
                  <rect x={x} y={30} width={100} height={50} rx={8} fill={CPU_STAGE_COLORS[i]} opacity={isActive ? 0.3 : 0.08} stroke={CPU_STAGE_COLORS[i]} strokeWidth={isActive ? 2.5 : 1}/>
                  <text x={x + 50} y={52} fill={CPU_STAGE_COLORS[i]} fontSize={11} textAnchor="middle" fontWeight={700}>{s}</text>
                  <text x={x + 50} y={68} fill={C.dim} fontSize={8} textAnchor="middle">{i + 1}</text>
                  {i < 4 && <line x1={x + 100} y1={55} x2={x + 108} y2={55} stroke={C.borderLight} strokeWidth={1.5}/>}
                </g>
              );
            })}

            {/* Current instruction info */}
            <rect x={20} y={95} width={520} height={35} rx={6} fill={CPU_STAGE_COLORS[stage]} opacity={0.08} stroke={CPU_STAGE_COLORS[stage]} strokeWidth={1}/>
            <text x={280} y={117} fill={CPU_STAGE_COLORS[stage]} fontSize={12} textAnchor="middle" fontWeight={600}>{stageMessage}</text>

            {/* CPU block diagram */}
            <text x={280} y={155} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">CPU Block Diagram</text>

            {/* Control Unit */}
            <rect x={20} y={170} width={100} height={50} rx={6} fill={C.accent} opacity={0.12} stroke={C.accent} strokeWidth={1}/>
            <text x={70} y={200} fill={C.accentLight} fontSize={10} textAnchor="middle" fontWeight={600}>Control Unit</text>

            {/* Registers */}
            <rect x={140} y={170} width={80} height={50} rx={6} fill={C.violet} opacity={0.12} stroke={C.violet} strokeWidth={1}/>
            <text x={180} y={193} fill={C.violet} fontSize={10} textAnchor="middle" fontWeight={600}>Registers</text>
            <text x={180} y={207} fill={C.dim} fontSize={8} textAnchor="middle">R0-R31</text>

            {/* ALU */}
            <rect x={240} y={170} width={80} height={50} rx={6} fill={C.amber} opacity={0.12} stroke={C.amber} strokeWidth={1}/>
            <text x={280} y={200} fill={C.amber} fontSize={10} textAnchor="middle" fontWeight={600}>ALU</text>

            {/* Cache hierarchy */}
            <rect x={340} y={165} width={60} height={28} rx={4} fill={C.green} opacity={0.12} stroke={C.green} strokeWidth={1}/>
            <text x={370} y={183} fill={C.green} fontSize={9} textAnchor="middle" fontWeight={600}>L1$</text>
            <rect x={410} y={165} width={60} height={28} rx={4} fill={C.cyan} opacity={0.12} stroke={C.cyan} strokeWidth={1}/>
            <text x={440} y={183} fill={C.cyan} fontSize={9} textAnchor="middle" fontWeight={600}>L2$</text>
            <rect x={480} y={165} width={60} height={28} rx={4} fill={C.teal} opacity={0.12} stroke={C.teal} strokeWidth={1}/>
            <text x={510} y={183} fill={C.teal} fontSize={9} textAnchor="middle" fontWeight={600}>L3$</text>
            <rect x={340} y={200} width={200} height={25} rx={4} fill={C.muted} opacity={0.08} stroke={C.borderLight} strokeWidth={1}/>
            <text x={440} y={217} fill={C.dim} fontSize={9} textAnchor="middle">Main Memory (DRAM)</text>

            {/* Connections */}
            <line x1={120} y1={195} x2={140} y2={195} stroke={C.borderLight} strokeWidth={1}/>
            <line x1={220} y1={195} x2={240} y2={195} stroke={C.borderLight} strokeWidth={1}/>
            <line x1={320} y1={195} x2={340} y2={180} stroke={C.borderLight} strokeWidth={1}/>

            {/* Memory latency */}
            <text x={280} y={260} fill={C.text} fontSize={11} fontWeight={600} textAnchor="middle">Memory Access Latency</text>
            {[['L1 Cache', '~1 ns (4 cycles)', 30, C.green], ['L2 Cache', '~5 ns (12 cycles)', 50, C.cyan], ['L3 Cache', '~20 ns (40 cycles)', 90, C.teal], ['DRAM', '~100 ns (200 cycles)', 200, C.red]].map(([label, lat, w, color], i) => (
              <g key={i}>
                <rect x={100} y={270 + i * 16} width={w} height={12} rx={3} fill={color} opacity={0.3}/>
                <text x={95} y={280 + i * 16} fill={C.muted} fontSize={9} textAnchor="end">{label}</text>
                <text x={105 + w} y={280 + i * 16} fill={color} fontSize={9}>{lat}</text>
              </g>
            ))}
          </svg>
        </div>
        <span style={S.eq}>CPI = Cycles Per Instruction   |   IPC = 1/CPI   |   Throughput = IPC × Clock Frequency</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>The fetch-decode-execute pipeline is the heart of every CPU. Pipelining lets the CPU work on 5 instructions simultaneously (one per stage). Cache misses are the biggest performance killer — a single L1 miss can cost 200+ cycles waiting for DRAM. That's why CPU caches are so critical.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Instruction" value={inst} color={C.accent}/>
        <RI label="Stage" value={CPU_STAGES[stage]} color={CPU_STAGE_COLORS[stage]}/>
        <RI label="Cache" value={cacheHit ? 'HIT' : 'MISS'} color={cacheHit ? C.green : C.red}/>
      </div>
      <div style={S.controls}>
        <div style={S.cg}>
          <span style={S.label}>Instruction</span>
          <select style={S.sel} value={inst} onChange={e => setInst(e.target.value)}>
            <option value="ADD">ADD R1, R2, R3</option>
            <option value="LOAD">LOAD R1, [R2]</option>
            <option value="STORE">STORE [R2], R1</option>
          </select>
        </div>
        <CG label="Pipeline Stage" min={0} max={4} step={1} value={stage} set={setStage}/>
        <div style={S.cg}>
          <span style={S.label}>Cache</span>
          <button style={S.btn(!cacheHit)} onClick={() => setCacheHit(h => !h)}>{cacheHit ? 'HIT' : 'MISS'}</button>
        </div>
      </div>
    </div>
  );
}

function CPUTheory() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>CPU Architecture</h2>
      <p style={S.p}>A CPU (Central Processing Unit) is a general-purpose processor that executes a sequential stream of instructions. Its fundamental challenge is bridging the gap between the fast arithmetic logic and slow memory access — every architectural innovation from pipelining to out-of-order execution is motivated by this <strong>memory wall</strong>.</p>

      <h3 style={S.h3}>The 5-Stage Pipeline</h3>
      <p style={S.p}>Pipelining overlaps multiple instruction executions like an assembly line — while one instruction executes, the next one decodes, and the one after fetches. This achieves throughput approaching 1 instruction per cycle (IPC = 1) for a simple in-order pipeline:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Fetch (IF):</strong> Read the next instruction from I-cache using the Program Counter (PC)</li>
        <li style={S.li}><strong>Decode (ID):</strong> Identify the operation, read register operands from the register file, expand immediate fields</li>
        <li style={S.li}><strong>Execute (EX):</strong> ALU performs the operation (add, shift, compare, multiply). Floating-point may take multiple cycles</li>
        <li style={S.li}><strong>Memory (MEM):</strong> Load/Store operations access the D-cache. On cache miss, the pipeline stalls</li>
        <li style={S.li}><strong>Writeback (WB):</strong> Write the result back to the destination register</li>
      </ul>
      <p style={S.p}><strong>Pipeline hazards</strong> hurt ideal throughput: data hazards (instruction needs result of earlier in-flight instruction), structural hazards (two instructions need same resource), and control hazards (branch target unknown until Execute).</p>

      <h3 style={S.h3}>Branch Prediction</h3>
      <p style={S.p}>When the pipeline encounters a conditional branch, it doesn&apos;t know the next PC until the Execute stage — 2–3 cycles later. Without prediction, the pipeline stalls. Modern CPUs use <strong>dynamic branch predictors</strong> to guess the outcome and speculatively fetch/decode along the predicted path:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Bimodal predictor:</strong> 2-bit saturating counter per branch — predicts taken/not-taken based on recent history</li>
        <li style={S.li}><strong>TAGE predictor:</strong> Tagged geometric history length predictor — uses multiple tables indexed by different lengths of global history. &gt;95% accuracy on typical workloads</li>
        <li style={S.li}><strong>Misprediction penalty:</strong> On a wrong prediction, all speculatively-fetched instructions must be flushed (15–20 cycle penalty on modern deep pipelines like Intel Golden Cove)</li>
      </ul>

      <h3 style={S.h3}>Out-of-Order Execution (OoO)</h3>
      <p style={S.p}>Modern CPUs can execute instructions out of their programmed order to hide latency. A large <strong>Reorder Buffer (ROB)</strong> (typically 256–512 entries) tracks in-flight instructions and commits results in-order to maintain the illusion of sequential semantics. Key components:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Rename registers:</strong> Physical register file (e.g., 280 registers) mapped to architectural registers (e.g., 16) eliminates false data dependencies</li>
        <li style={S.li}><strong>Instruction scheduler:</strong> Selects ready instructions (all operands available) from the reservation stations and dispatches to execution units</li>
        <li style={S.li}><strong>Superscalar dispatch:</strong> Modern CPUs can issue 4–8 instructions per cycle to multiple parallel ALUs, load/store units, and FPUs</li>
      </ul>
      <code style={S.eq}>Effective IPC = min(Dispatch width, Instruction-level parallelism) × (1 − stall fraction)</code>

      <h3 style={S.h3}>Memory Hierarchy</h3>
      <table style={S.tbl}>
        <thead><tr><th style={S.th}>Level</th><th style={S.th}>Size</th><th style={S.th}>Latency</th><th style={S.th}>Bandwidth</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Registers</td><td style={S.td}>~1–2 KB</td><td style={S.td}>0 cycles</td><td style={S.td}>~20 TB/s</td></tr>
          <tr><td style={S.td}>L1 I+D Cache</td><td style={S.td}>32–64 KB each</td><td style={S.td}>4–5 cycles</td><td style={S.td}>~2 TB/s</td></tr>
          <tr><td style={S.td}>L2 Cache</td><td style={S.td}>256 KB–4 MB</td><td style={S.td}>12–14 cycles</td><td style={S.td}>~500 GB/s</td></tr>
          <tr><td style={S.td}>L3 Cache (LLC)</td><td style={S.td}>8–96 MB</td><td style={S.td}>30–50 cycles</td><td style={S.td}>~200 GB/s</td></tr>
          <tr><td style={S.td}>DRAM</td><td style={S.td}>8–512 GB</td><td style={S.td}>~200 cycles</td><td style={S.td}>50–100 GB/s</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>Performance Equation</h3>
      <code style={S.eq}>Execution Time = Instructions × CPI / Clock Frequency</code>
      <p style={S.p}>Reducing any of the three factors improves performance. Compiler optimizations reduce instruction count; branch predictors and OoO execution reduce CPI; process technology scaling increases clock frequency. Modern CPUs achieve effective CPI close to 0.25 (4 IPC) on many workloads through wide superscalar, OoO, and deep speculation.</p>

      <div style={S.ctx}><span style={S.ctxT}>Where this matters</span><p style={S.ctxP}>Understanding CPU architecture explains why software performance varies so widely. Cache-friendly sequential access patterns can be 100× faster than random access. Branch-heavy code (JIT compilers, interpreters) suffers from mispredictions. SIMD instructions (AVX-512) vectorize loops for 8–16× speedup on throughput-bound code. These principles guide systems programming, performance-critical embedded firmware, operating system scheduler design, and hardware-software co-design for AI inference engines.</p></div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   TAB 11 — GPU and Matrix Multiplication
   ═══════════════════════════════════════════════════════════════════ */
function GPUSimulate() {
  const [size, setSize] = useState(3);
  const [step, setStep] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [smCount, setSmCount] = useState(6);
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const af = useRef(); const lt = useRef(0);

  // Generate simple matrices
  const A = useMemo(() => Array.from({ length: size }, (_, i) => Array.from({ length: size }, (_, j) => ((i * size + j + 1) % 9) + 1)), [size]);
  const B = useMemo(() => Array.from({ length: size }, (_, i) => Array.from({ length: size }, (_, j) => ((i + j * 2 + 1) % 9) + 1)), [size]);

  const currentK = Math.min(step, size - 1);
  const threadCount = size * size;
  const warpSize = 32;
  const warpCount = Math.max(1, Math.ceil(threadCount / warpSize));
  const activeWarp = cycle % warpCount;
  const activeSm = cycle % smCount;

  const stageIdx = cycle % GPU_PIPELINE_STAGES.length;

  // Compute C up to current step
  const C_partial = useMemo(() => {
    const c = Array.from({ length: size }, () => Array(size).fill(0));
    for (let k = 0; k <= currentK; k++) {
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          c[i][j] += A[i][k] * B[k][j];
        }
      }
    }
    return c;
  }, [A, B, size, currentK]);

  useEffect(() => {
    if (!running) { lt.current = 0; return; }
    const tick = t => {
      if (lt.current) {
        const dt = (t - lt.current) / 1000;
        if (dt > 0.8 / speed) {
          setStep(s => {
            if (s >= size - 1) { setRunning(false); return size - 1; }
            return s + 1;
          });
          setCycle(c => c + 1);
          lt.current = t;
        }
      } else { lt.current = t; }
      af.current = requestAnimationFrame(tick);
    };
    af.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(af.current); lt.current = 0; };
  }, [running, speed, size]);

  const smLoad = useMemo(() => {
    return Array.from({ length: smCount }, (_, idx) => {
      const base = Math.floor(warpCount / smCount);
      const extra = idx < warpCount % smCount ? 1 : 0;
      return base + extra;
    });
  }, [smCount, warpCount]);

  const cs = 28; // cell size
  const matX = (mx, data, highlight) => (
    <g>
      {data.map((row, i) => row.map((val, j) => {
        const hl = highlight ? highlight(i, j) : false;
        return (
          <g key={`${i}-${j}`}>
            <rect x={mx + j * cs} y={i * cs} width={cs - 2} height={cs - 2} rx={3} fill={hl ? C.accent : C.surfaceAlt} opacity={hl ? 0.3 : 0.15} stroke={hl ? C.accent : C.borderLight} strokeWidth={hl ? 1.5 : 0.5}/>
            <text x={mx + j * cs + cs / 2 - 1} y={i * cs + cs / 2 + 4} fill={hl ? C.text : C.muted} fontSize={10} textAnchor="middle" fontWeight={hl ? 700 : 400}>{val}</text>
          </g>
        );
      }))}
    </g>
  );

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>GPU &amp; Matrix Multiplication</p><p style={S.sub}>Parallel dot products — why GPUs dominate AI and graphics</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 340" style={{ width:'100%', maxWidth:560 }}>
            <text x={280} y={15} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">C = A × B  (step {step + 1}/{size}: k={currentK})</text>

            <g transform="translate(10, 35)">
              <text x={size * cs / 2} y={-5} fill={C.cyan} fontSize={10} textAnchor="middle" fontWeight={600}>A</text>
              {matX(0, A, (i, j) => j === currentK)}
            </g>

            <text x={20 + size * cs + 10} y={35 + size * cs / 2} fill={C.dim} fontSize={16} fontWeight={700}>×</text>

            <g transform={`translate(${35 + size * cs + 15}, 35)`}>
              <text x={size * cs / 2} y={-5} fill={C.amber} fontSize={10} textAnchor="middle" fontWeight={600}>B</text>
              {matX(0, B, (i, j) => i === currentK)}
            </g>

            <text x={50 + size * cs * 2 + 25} y={35 + size * cs / 2} fill={C.dim} fontSize={16} fontWeight={700}>=</text>

            <g transform={`translate(${65 + size * cs * 2 + 30}, 35)`}>
              <text x={size * cs / 2} y={-5} fill={C.green} fontSize={10} textAnchor="middle" fontWeight={600}>C (partial)</text>
              {matX(0, C_partial, () => true)}
            </g>

            {/* Parallelism illustration */}
            <g transform={`translate(15, ${55 + size * cs + 8})`}>
              <text x={265} y={0} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">GPU Architecture Flow</text>
              <text x={265} y={16} fill={C.muted} fontSize={9} textAnchor="middle">Warp {activeWarp + 1}/{warpCount} scheduled on SM {activeSm + 1}/{smCount}</text>

              {/* Memory/compute pipeline */}
              {GPU_PIPELINE_STAGES.map((name, idx) => {
                const x = 12 + idx * 104;
                const active = idx === stageIdx;
                return (
                  <g key={name}>
                    <rect x={x} y={26} width={94} height={20} rx={5} fill={active ? C.accent : C.surfaceAlt} opacity={active ? 0.35 : 0.12} stroke={active ? C.accentLight : C.borderLight} strokeWidth={active ? 1.6 : 0.8}/>
                    <text x={x + 47} y={39} fill={active ? C.text : C.muted} fontSize={8.5} textAnchor="middle" fontWeight={active ? 700 : 500}>{name}</text>
                    {idx < GPU_PIPELINE_STAGES.length - 1 && <line x1={x + 94} y1={36} x2={x + 104} y2={36} stroke={C.borderLight} strokeWidth={1.2}/>} 
                  </g>
                );
              })}

              {/* Streaming multiprocessors and occupancy */}
              {Array.from({ length: smCount }, (_, sm) => {
                const col = sm % 3;
                const row = Math.floor(sm / 3);
                const x = 38 + col * 165;
                const y = 58 + row * 28;
                const active = sm === activeSm;
                return (
                  <g key={sm}>
                    <rect x={x} y={y} width={148} height={20} rx={5} fill={active ? C.green : C.surfaceAlt} opacity={active ? 0.25 : 0.1} stroke={active ? C.green : C.borderLight} strokeWidth={active ? 1.5 : 0.8}/>
                    <text x={x + 8} y={72} fill={active ? C.green : C.muted} fontSize={8.5} fontWeight={600}>SM{sm}</text>
                    <text x={x + 142} y={72} fill={C.dim} fontSize={8} textAnchor="end">{smLoad[sm]} warps</text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        <span style={S.eq}>C[i,j] = Σₖ A[i,k] · B[k,j]   |   Threads = {threadCount}   |   Warps = {warpCount} (size {warpSize})   |   Active stage: {GPU_PIPELINE_STAGES[stageIdx]}</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>GPUs have thousands of cores executing the same operation on different data (SIMT). Neural network training is 90%+ matrix multiplication — this is why GPUs (NVIDIA CUDA) dominate AI. A modern GPU delivers ~300 TFLOPS of FP16, vs ~1 TFLOP for a CPU.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Matrix" value={`${size}×${size}`} color={C.accent}/>
        <RI label="Threads" value={`${threadCount}`} color={C.green}/>
        <RI label="Warps" value={`${warpCount}`} color={C.violet}/>
        <RI label="Total MACs" value={`${threadCount * size}`} color={C.amber}/>
        <RI label="Step" value={`${step + 1}/${size}`} color={C.cyan}/>
      </div>
      <div style={S.controls}>
        <div style={S.cg}>
          <span style={S.label}>Size</span>
          <select style={S.sel} value={size} onChange={e => { setSize(+e.target.value); setStep(0); setCycle(0); setRunning(false); }}>
            <option value={2}>2×2</option><option value={3}>3×3</option><option value={4}>4×4</option>
          </select>
        </div>
        <CG label="Step (k)" min={0} max={size - 1} step={1} value={step} set={s => { setStep(s); setRunning(false); }}/>
        <CG label="SM count" min={2} max={12} step={1} value={smCount} set={setSmCount}/>
        <CG label="Speed" min={0.5} max={3} step={0.5} value={speed} set={setSpeed} unit="x"/>
        <div style={S.cg}>
          <button style={S.btn(running)} onClick={() => { if (!running) { setStep(0); setCycle(0); } setRunning(r => !r); }}>{running ? 'Stop' : 'Animate'}</button>
        </div>
      </div>
    </div>
  );
}

function GPUTheory() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>GPU &amp; Matrix Multiplication</h2>
      <p style={S.p}>A GPU (Graphics Processing Unit) is a massively parallel processor designed for workloads where the same operation is applied to many data elements simultaneously. While a CPU has 8–16 powerful cores, a GPU has thousands of simpler cores.</p>

      <h3 style={S.h3}>Matrix Multiplication</h3>
      <code style={S.eq}>C[i,j] = Σₖ A[i,k] · B[k,j]</code>
      <p style={S.p}>Each element C[i,j] is the dot product of row i of A and column j of B. For an N×N matrix, there are N² independent dot products, each requiring N multiply-accumulate (MAC) operations. This is perfectly parallel — each dot product can run on a separate thread.</p>

      <h3 style={S.h3}>SIMT Execution</h3>
      <p style={S.p}>GPUs use <strong>SIMT</strong> (Single Instruction, Multiple Threads): groups of 32 threads (a "warp" in NVIDIA) execute the same instruction on different data. This is efficient for matrix ops where every thread performs the same multiply-add sequence.</p>

      <h3 style={S.h3}>GPU Architecture Path</h3>
      <p style={S.p}>A kernel launch dispatches thread blocks to <strong>Streaming Multiprocessors (SMs)</strong>. Each SM schedules warps and moves data through a hierarchy: global memory (HBM) → L2 cache → shared memory/registers → ALU/Tensor cores → writeback. Real performance depends on occupancy, memory coalescing, and cache hit rates, not just FLOP counts.</p>

      <h3 style={S.h3}>Why GPUs Dominate AI</h3>
      <p style={S.p}>Neural network training and inference are dominated by matrix multiplications (convolutions, attention, fully-connected layers). The arithmetic intensity is high (many FLOPs per byte loaded), matching GPU architecture perfectly.</p>

      <table style={S.tbl}>
        <thead><tr><th style={S.th}>Metric</th><th style={S.th}>CPU (high-end)</th><th style={S.th}>GPU (NVIDIA H100)</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Cores</td><td style={S.td}>16–64</td><td style={S.td}>16,896 CUDA cores</td></tr>
          <tr><td style={S.td}>FP32 TFLOPS</td><td style={S.td}>~1</td><td style={S.td}>~67</td></tr>
          <tr><td style={S.td}>FP16 TFLOPS</td><td style={S.td}>~2</td><td style={S.td}>~990 (Tensor)</td></tr>
          <tr><td style={S.td}>Memory BW</td><td style={S.td}>~80 GB/s</td><td style={S.td}>~3.4 TB/s</td></tr>
        </tbody>
      </table>

      <div style={S.ctx}><span style={S.ctxT}>Where this matters</span><p style={S.ctxP}>Every major AI model (GPT, DALL-E, diffusion models) is trained on GPU clusters. NVIDIA's CUDA platform is the dominant programming model. Understanding matrix multiplication parallelism explains why AI hardware investment is measured in billions of dollars — more compute = larger models = better AI performance.</p></div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   TAB 12 — Microcontrollers
   ═══════════════════════════════════════════════════════════════════ */
function MCUSimulate() {
  const [family, setFamily] = useState('ARM');
  const [peripheral, setPeripheral] = useState(['GPIO', 'ADC', 'Timer']);
  const [program, setProgram] = useState('blink');

  const mcu = MCU_FAMILIES[family];

  const togglePeripheral = (id) => {
    setPeripheral(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Microcontrollers (MCU)</p><p style={S.sub}>Single-chip computers — CPU + memory + peripherals on one die</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 300" style={{ width:'100%', maxWidth:560 }}>
            <text x={280} y={18} fill={C.text} fontSize={12} fontWeight={600} textAnchor="middle">{mcu.name} Block Diagram</text>

            {/* CPU core */}
            <rect x={200} y={35} width={160} height={60} rx={8} fill={mcu.color} opacity={0.15} stroke={mcu.color} strokeWidth={2}/>
            <text x={280} y={60} fill={mcu.color} fontSize={13} textAnchor="middle" fontWeight={700}>{family} Core</text>
            <text x={280} y={78} fill={C.dim} fontSize={9} textAnchor="middle">{mcu.bits}-bit @ {mcu.clock}</text>

            {/* Bus */}
            <line x1={40} y1={115} x2={520} y2={115} stroke={C.accent} strokeWidth={2}/>
            <text x={280} y={110} fill={C.accentLight} fontSize={9} textAnchor="middle" fontWeight={600}>AHB / APB Bus</text>
            <line x1={280} y1={95} x2={280} y2={115} stroke={C.accent} strokeWidth={1.5}/>

            {/* Flash */}
            <rect x={30} y={35} width={80} height={50} rx={6} fill={C.surfaceAlt} stroke={C.borderLight} strokeWidth={1}/>
            <text x={70} y={58} fill={C.text} fontSize={10} textAnchor="middle" fontWeight={600}>Flash</text>
            <text x={70} y={73} fill={C.dim} fontSize={9} textAnchor="middle">{mcu.flash}</text>
            <line x1={70} y1={85} x2={70} y2={115} stroke={C.borderLight} strokeWidth={1}/>

            {/* RAM */}
            <rect x={440} y={35} width={80} height={50} rx={6} fill={C.surfaceAlt} stroke={C.borderLight} strokeWidth={1}/>
            <text x={480} y={58} fill={C.text} fontSize={10} textAnchor="middle" fontWeight={600}>SRAM</text>
            <text x={480} y={73} fill={C.dim} fontSize={9} textAnchor="middle">{mcu.ram}</text>
            <line x1={480} y1={85} x2={480} y2={115} stroke={C.borderLight} strokeWidth={1}/>

            {/* Peripherals */}
            {MCU_PERIPHERALS.map((p, i) => {
              const x = 30 + i * 88;
              const y = 135;
              const active = peripheral.includes(p.id);
              return (
                <g key={p.id}>
                  <line x1={x + 40} y1={115} x2={x + 40} y2={y} stroke={active ? p.color : C.borderLight} strokeWidth={1}/>
                  <rect x={x} y={y} width={78} height={45} rx={6} fill={active ? p.color : C.surfaceAlt} opacity={active ? 0.15 : 0.06} stroke={active ? p.color : C.borderLight} strokeWidth={active ? 1.5 : 0.5}/>
                  <text x={x + 39} y={y + 20} fill={active ? p.color : C.dim} fontSize={10} textAnchor="middle" fontWeight={600}>{p.label}</text>
                  <text x={x + 39} y={y + 35} fill={C.dim} fontSize={8} textAnchor="middle">{active ? 'Active' : 'Idle'}</text>
                </g>
              );
            })}

            {/* Program flow */}
            <text x={280} y={210} fill={C.text} fontSize={11} fontWeight={600} textAnchor="middle">Program: {program === 'blink' ? 'Blink LED' : 'Read Sensor'}</text>
            {program === 'blink' ? (
              <g>
                <text x={280} y={230} fill={C.muted} fontSize={10} textAnchor="middle">GPIO → Set pin HIGH → delay(500ms) → Set pin LOW → delay(500ms) → repeat</text>
                <text x={280} y={248} fill={C.green} fontSize={10} textAnchor="middle">Uses: GPIO, Timer (for delay)</text>
              </g>
            ) : (
              <g>
                <text x={280} y={230} fill={C.muted} fontSize={10} textAnchor="middle">ADC → Read analog voltage → Convert to digital → UART → Send to PC</text>
                <text x={280} y={248} fill={C.amber} fontSize={10} textAnchor="middle">Uses: ADC, UART, Timer (sampling rate)</text>
              </g>
            )}

            {/* External connections */}
            <text x={280} y={278} fill={C.dim} fontSize={9} textAnchor="middle">External: LEDs, sensors, motors, displays, communication modules</text>
          </svg>
        </div>
        <span style={S.eq}>MCU = CPU Core + Flash + SRAM + Peripherals (one chip)   |   {mcu.name}: {mcu.bits}-bit, {mcu.clock}</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>Microcontrollers are everywhere: Arduino (AVR), STM32 (ARM Cortex-M), ESP32 (for WiFi IoT). A modern car has 50–100 MCUs. They're in washing machines, medical devices, industrial controllers, drones, and smart home gadgets. ARM Cortex-M dominates with ~50B chips shipped.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Family" value={mcu.name} color={mcu.color}/>
        <RI label="Flash" value={mcu.flash} color={C.text}/>
        <RI label="RAM" value={mcu.ram} color={C.text}/>
        <RI label="Peripherals" value={`${peripheral.length} active`} color={C.green}/>
      </div>
      <div style={S.controls}>
        <div style={S.cg}>
          <span style={S.label}>MCU Family</span>
          <select style={S.sel} value={family} onChange={e => setFamily(e.target.value)}>
            <option value="ARM">ARM Cortex-M4</option>
            <option value="AVR">AVR (ATmega328P)</option>
            <option value="PIC">PIC18F4550</option>
          </select>
        </div>
        <div style={S.cg}>
          <span style={S.label}>Program</span>
          <select style={S.sel} value={program} onChange={e => setProgram(e.target.value)}>
            <option value="blink">Blink LED</option>
            <option value="sensor">Read Sensor</option>
          </select>
        </div>
        {MCU_PERIPHERALS.map(p => (
          <div key={p.id} style={S.cg}>
            <button style={{ ...S.btn(peripheral.includes(p.id)), background: peripheral.includes(p.id) ? p.color : C.surfaceAlt, fontSize: 11, padding: '4px 10px' }} onClick={() => togglePeripheral(p.id)}>{p.label}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MCUTheory() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>Microcontrollers</h2>
      <p style={S.p}>A microcontroller (MCU) is a <strong>single-chip computer</strong> integrating a CPU core, program memory (Flash), data memory (SRAM), and diverse peripherals. Unlike a desktop CPU that needs external RAM, GPU, and I/O chips, an MCU is self-contained — add power and a clock, and it runs.</p>

      <h3 style={S.h3}>MCU vs CPU vs SoC</h3>
      <table style={S.tbl}>
        <thead><tr><th style={S.th}>Feature</th><th style={S.th}>MCU</th><th style={S.th}>CPU</th><th style={S.th}>SoC</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Integration</td><td style={S.td}>Core + Memory + I/O</td><td style={S.td}>Core + Cache</td><td style={S.td}>Core + GPU + Memory ctrl</td></tr>
          <tr><td style={S.td}>Memory</td><td style={S.td}>KB–MB (on-chip)</td><td style={S.td}>GB (external DRAM)</td><td style={S.td}>GB (external)</td></tr>
          <tr><td style={S.td}>Clock</td><td style={S.td}>16–240 MHz</td><td style={S.td}>3–5 GHz</td><td style={S.td}>1–3 GHz</td></tr>
          <tr><td style={S.td}>Power</td><td style={S.td}>μW–mW</td><td style={S.td}>50–250 W</td><td style={S.td}>5–15 W</td></tr>
          <tr><td style={S.td}>Example</td><td style={S.td}>STM32, ESP32</td><td style={S.td}>Intel Core, AMD Ryzen</td><td style={S.td}>Apple M2, Snapdragon</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>Common Peripherals</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong>GPIO:</strong> General Purpose I/O — digital pins for LEDs, buttons, relays</li>
        <li style={S.li}><strong>ADC:</strong> Analog-to-Digital Converter — reads sensor voltages (temperature, pressure, light)</li>
        <li style={S.li}><strong>Timers:</strong> Generate PWM, measure time intervals, create delays</li>
        <li style={S.li}><strong>UART:</strong> Serial communication (RS-232, debug terminal)</li>
        <li style={S.li}><strong>SPI:</strong> High-speed serial bus for displays, SD cards, sensors</li>
        <li style={S.li}><strong>I2C:</strong> Two-wire bus for sensors, EEPROMs, small displays</li>
      </ul>

      <h3 style={S.h3}>Major MCU Families</h3>
      <p style={S.p}><strong>ARM Cortex-M</strong> dominates the market (STM32, nRF52, RP2040). 32-bit performance with excellent peripherals and low power. <strong>AVR</strong> (ATmega328P = Arduino Uno) and <strong>PIC</strong> remain popular for simple, cost-sensitive applications. <strong>RISC-V</strong> MCUs (ESP32-C3) are emerging as an open-source alternative.</p>

      <div style={S.ctx}><span style={S.ctxT}>Where this matters</span><p style={S.ctxP}>Billions of MCUs ship every year. They're in every embedded system: automotive ECUs, medical devices (pacemakers, insulin pumps), industrial automation (PLCs, motor controllers), consumer electronics (TV remotes, smart thermostats), and IoT devices. Understanding MCU architecture is essential for embedded systems engineering.</p></div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   TAB 13 — Semiconductor Fabrication Process
   ═══════════════════════════════════════════════════════════════════ */
function FabSimulate() {
  const [step, setStep] = useState(0);

  const s = FAB_STEPS[step];

  return (
    <div style={S.body}>
      <div style={S.section}>
        <div><p style={S.title}>Semiconductor Fabrication Process</p><p style={S.sub}>Wafer → billions of transistors through 100s of process steps</p></div>
        <div style={S.svgWrap}>
          <svg viewBox="0 0 560 310" style={{ width:'100%', maxWidth:560 }}>
            {/* Step indicator */}
            <text x={280} y={18} fill={s.color} fontSize={13} fontWeight={700} textAnchor="middle">Step {step + 1}/{FAB_STEPS.length}: {s.name}</text>
            <text x={280} y={35} fill={C.muted} fontSize={11} textAnchor="middle">{s.desc}</text>

            {/* Cross-section evolution */}
            <g transform="translate(50, 55)">
              {/* Si substrate (always visible) */}
              <rect x={0} y={120} width={460} height={60} rx={4} fill={C.cyan} opacity={0.12} stroke={C.cyan} strokeWidth={1}/>
              <text x={230} y={155} fill={C.cyan} fontSize={11} textAnchor="middle">Silicon Substrate</text>

              {/* Oxide layer */}
              {step >= 1 && (
                <rect x={0} y={100} width={460} height={20} rx={2} fill={C.amber} opacity={step >= 5 ? 0.08 : 0.2} stroke={C.amber} strokeWidth={step >= 5 ? 0.5 : 1}/>
              )}
              {step >= 1 && step < 5 && <text x={230} y={114} fill={C.amber} fontSize={9} textAnchor="middle">SiO₂</text>}

              {/* After etch - patterned oxide */}
              {step >= 5 && (
                <g>
                  <rect x={0} y={100} width={130} height={20} rx={2} fill={C.amber} opacity={0.2} stroke={C.amber} strokeWidth={1}/>
                  <rect x={330} y={100} width={130} height={20} rx={2} fill={C.amber} opacity={0.2} stroke={C.amber} strokeWidth={1}/>
                  {/* Etched gap */}
                  <rect x={130} y={100} width={200} height={20} fill="none" stroke={C.red} strokeWidth={1} strokeDasharray="3 3" opacity={0.4}/>
                  <text x={230} y={114} fill={C.red} fontSize={8} textAnchor="middle">Etched opening</text>
                </g>
              )}

              {/* Photoresist layer */}
              {step >= 2 && step <= 4 && (
                <rect x={0} y={80} width={460} height={18} rx={2} fill={C.pink} opacity={0.2} stroke={C.pink} strokeWidth={1}/>
              )}
              {step === 2 && <text x={230} y={93} fill={C.pink} fontSize={9} textAnchor="middle">Photoresist</text>}

              {/* Exposure pattern */}
              {step === 3 && (
                <g>
                  <rect x={130} y={50} width={200} height={28} fill="none" stroke={C.violet} strokeWidth={1.5} strokeDasharray="4 3"/>
                  <text x={230} y={68} fill={C.violet} fontSize={9} textAnchor="middle">UV Light through Mask</text>
                  {[150, 190, 230, 270, 310].map(x => (
                    <line key={x} x1={x} y1={50} x2={x} y2={80} stroke={C.violet} strokeWidth={1} opacity={0.6}/>
                  ))}
                  <rect x={130} y={80} width={200} height={18} fill={C.violet} opacity={0.15}/>
                </g>
              )}

              {/* Developed resist */}
              {step === 4 && (
                <g>
                  <rect x={0} y={80} width={130} height={18} rx={2} fill={C.pink} opacity={0.2} stroke={C.pink} strokeWidth={1}/>
                  <rect x={330} y={80} width={130} height={18} rx={2} fill={C.pink} opacity={0.2} stroke={C.pink} strokeWidth={1}/>
                  <text x={230} y={93} fill={C.green} fontSize={9} textAnchor="middle">Pattern transferred to resist</text>
                </g>
              )}

              {/* Ion implant */}
              {step === 6 && (
                <g>
                  {[160, 200, 240, 280, 310].map((x, i) => (
                    <g key={i}>
                      <line x1={x} y1={60} x2={x} y2={120} stroke={C.teal} strokeWidth={1.5} opacity={0.5}/>
                      <polygon points={`${x},120 ${x-3},113 ${x+3},113`} fill={C.teal} opacity={0.7}/>
                    </g>
                  ))}
                  <text x={230} y={55} fill={C.teal} fontSize={9} textAnchor="middle">Dopant ions (P, B, As)</text>
                  {/* Implanted region */}
                  <rect x={130} y={120} width={200} height={15} rx={2} fill={C.teal} opacity={0.2}/>
                </g>
              )}

              {/* Metal deposition */}
              {step >= 8 && step <= 9 && (
                <g>
                  <rect x={0} y={70} width={460} height={25} rx={3} fill={C.accent} opacity={0.15} stroke={C.accent} strokeWidth={1}/>
                  <text x={230} y={87} fill={C.accentLight} fontSize={9} textAnchor="middle">{step === 8 ? 'Deposited layer' : 'Cu Interconnects'}</text>
                </g>
              )}

              {/* Packaging */}
              {step === 10 && (
                <g>
                  <rect x={100} y={40} width={260} height={140} rx={8} fill={C.surfaceAlt} stroke={C.green} strokeWidth={2}/>
                  <rect x={140} y={75} width={180} height={50} rx={4} fill={C.cyan} opacity={0.15} stroke={C.cyan} strokeWidth={1}/>
                  <text x={230} y={105} fill={C.cyan} fontSize={10} textAnchor="middle" fontWeight={600}>Die</text>
                  {/* Bond wires */}
                  {[160, 200, 240, 280].map(x => (
                    <path key={x} d={`M${x},75 Q${x},55 ${x - 30},45`} fill="none" stroke={C.amber} strokeWidth={1}/>
                  ))}
                  <text x={230} y={165} fill={C.green} fontSize={9} textAnchor="middle">Packaged IC</text>
                </g>
              )}
            </g>

            {/* Process flow timeline at bottom */}
            <g transform="translate(20, 260)">
              {FAB_STEPS.map((st, i) => {
                const x = i * (520 / FAB_STEPS.length);
                const w = 520 / FAB_STEPS.length - 2;
                return (
                  <g key={i}>
                    <rect x={x} y={0} width={w} height={16} rx={3} fill={st.color} opacity={i === step ? 0.4 : 0.1} stroke={i === step ? st.color : 'none'} strokeWidth={1.5}/>
                    <text x={x + w / 2} y={30} fill={i === step ? st.color : C.faint} fontSize={7} textAnchor="middle" fontWeight={i === step ? 700 : 400}>{i + 1}</text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
        <span style={S.eq}>Step {step + 1}: {s.name} — {s.desc}</span>
        <div style={S.note}><span style={S.noteT}>Where this matters</span><p style={S.noteP}>A modern fab costs $10–20 billion. A single chip goes through 500–1000 process steps over 2–3 months. EUV lithography uses 13.5 nm wavelength light to print features at 3–5 nm scale. Only 3 companies (TSMC, Samsung, Intel) can manufacture leading-edge chips — semiconductor fabrication is the most complex manufacturing process humanity has ever created.</p></div>
      </div>
      <div style={S.results}>
        <RI label="Step" value={`${step + 1}/${FAB_STEPS.length}`} color={s.color}/>
        <RI label="Process" value={s.name} color={s.color}/>
      </div>
      <div style={S.controls}>
        <CG label="Process Step" min={0} max={FAB_STEPS.length - 1} step={1} value={step} set={setStep}/>
        <div style={S.cg}>
          <button style={{ ...S.btn(false), background: C.accent }} onClick={() => setStep(s => Math.max(0, s - 1))}>← Prev</button>
          <button style={{ ...S.btn(false), background: C.accent }} onClick={() => setStep(s => Math.min(FAB_STEPS.length - 1, s + 1))}>Next →</button>
        </div>
      </div>
    </div>
  );
}

function FabTheory() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>Semiconductor Fabrication Process</h2>
      <p style={S.p}>Turning a silicon crystal into a chip with billions of transistors is the most complex and precise manufacturing process ever devised. The full process involves 500–1000 individual steps, but they all build on a handful of core operations repeated across many layers.</p>

      <h3 style={S.h3}>Core Process Steps</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong>Oxidation:</strong> Grow SiO₂ on the wafer surface (gate dielectric, isolation)</li>
        <li style={S.li}><strong>Photolithography:</strong> Transfer a pattern from a mask to the wafer using light and photoresist. This defines where transistor features go</li>
        <li style={S.li}><strong>Etching:</strong> Remove material in patterned areas (plasma etch for anisotropic, wet etch for isotropic)</li>
        <li style={S.li}><strong>Ion implantation:</strong> Shoot dopant ions (B, P, As) into the silicon to create N and P regions</li>
        <li style={S.li}><strong>Deposition:</strong> Add thin films (metals, dielectrics) using CVD, PVD, or ALD</li>
        <li style={S.li}><strong>CMP:</strong> Chemical-mechanical polishing to planarize surfaces between layers</li>
        <li style={S.li}><strong>Metallization:</strong> Form copper interconnect wires (damascene process) linking transistors</li>
      </ul>

      <h3 style={S.h3}>Lithography — The Critical Step</h3>
      <p style={S.p}>Lithography determines the minimum feature size. Optical lithography used 193 nm light with immersion and multi-patterning down to ~7 nm. <strong>EUV (Extreme Ultraviolet)</strong> at 13.5 nm wavelength is now used for 5 nm and below. An EUV machine (ASML) costs ~$200M and weighs 180 tons.</p>

      <h3 style={S.h3}>From Wafer to Chip</h3>
      <p style={S.p}>After all layers are built (FEOL = transistors, BEOL = interconnects), the wafer is tested, diced into individual chips, packaged (wire bonding or flip-chip), tested again, and shipped. A 300 mm wafer can yield 500+ large chips or thousands of small ones.</p>

      <h3 style={S.h3}>Economics</h3>
      <table style={S.tbl}>
        <thead><tr><th style={S.th}>Item</th><th style={S.th}>Cost</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Leading-edge fab</td><td style={S.td}>$15–20 billion</td></tr>
          <tr><td style={S.td}>EUV scanner (ASML)</td><td style={S.td}>$150–200 million</td></tr>
          <tr><td style={S.td}>300mm Si wafer</td><td style={S.td}>~$500</td></tr>
          <tr><td style={S.td}>Mask set (EUV)</td><td style={S.td}>$5–10 million</td></tr>
          <tr><td style={S.td}>Processing cost per wafer</td><td style={S.td}>$5,000–15,000</td></tr>
        </tbody>
      </table>

      <div style={S.ctx}><span style={S.ctxT}>Where this matters</span><p style={S.ctxP}>Semiconductor fabrication is a strategic industry. Only TSMC, Samsung, and Intel have cutting-edge fabs. ASML (Netherlands) is the sole supplier of EUV machines. Geopolitics (Taiwan, CHIPS Act) directly impact chip supply chains. Understanding the fab process explains why chips take months to make, why shortages happen, and why a fab costs more than an aircraft carrier.</p></div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   Simulate / Theory Maps and Root Component
   ═══════════════════════════════════════════════════════════════════ */
const SIMULATE_MAP = {
  'energy-bands': EnergyBandsSimulate,
  'doping': DopingSimulate,
  'transport': TransportSimulate,
  'diode': DiodeSimulate,
  'bjt': BJTSimulate,
  'mosfet': MOSFETSimulate,
  'finfet': FinFETSimulate,
  'cmos': CMOSSimulate,
  'logic': LogicSimulate,
  'cpu': CPUSimulate,
  'gpu': GPUSimulate,
  'mcu': MCUSimulate,
  'fab': FabSimulate,
};

const THEORY_MAP = {
  'energy-bands': EnergyBandsTheory,
  'doping': DopingTheory,
  'transport': TransportTheory,
  'diode': DiodeTheory,
  'bjt': BJTTheory,
  'mosfet': MOSFETTheory,
  'finfet': FinFETTheory,
  'cmos': CMOSTheory,
  'logic': LogicTheory,
  'cpu': CPUTheory,
  'gpu': GPUTheory,
  'mcu': MCUTheory,
  'fab': FabTheory,
};

export default function SemiconductorFundamentals() {
  const [viewMode, setViewMode] = useState('simulate');
  const [topic, setTopic] = useState('energy-bands');

  const ActiveSimulate = SIMULATE_MAP[topic];
  const ActiveTheory = THEORY_MAP[topic];

  return (
    <div style={S.container}>
      <div style={S.modeBar}>
        <button style={S.modeTab(viewMode === 'simulate')} onClick={() => setViewMode('simulate')}>Simulate</button>
        <button style={S.modeTab(viewMode === 'theory')} onClick={() => setViewMode('theory')}>Theory</button>
      </div>
      <div style={S.topicBar}>
        {TOPIC_TABS.map(t => (
          <button key={t.id} style={S.topicTab(topic === t.id)} onClick={() => setTopic(t.id)}>{t.label}</button>
        ))}
      </div>
      {viewMode === 'simulate' ? <ActiveSimulate /> : <ActiveTheory />}
    </div>
  );
}
