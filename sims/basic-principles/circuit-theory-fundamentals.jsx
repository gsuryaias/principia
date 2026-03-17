import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RefreshCcw, Info, Zap } from 'lucide-react';

const C = {
  bg: '#09090b',
  surface: '#111114',
  accent: '#6366f1',
  accentLight: '#818cf8',
  text: '#e4e4e7',
  muted: '#a1a1aa',
  border: '#27272a',
  green: '#22c55e',
  red: '#ef4444',
  amber: '#f59e0b',
  cyan: '#22d3ee',
  violet: '#8b5cf6',
  mono: '#38bdf8'
};

const S = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: '800px', background: C.bg, color: C.text, fontFamily: 'system-ui, sans-serif' },
  header: { padding: '24px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '24px', fontWeight: 600, color: C.text, display: 'flex', alignItems: 'center', gap: '12px' },
  tabBar: { display: 'flex', gap: '8px', padding: '0 24px', borderBottom: `1px solid ${C.border}`, overflowX: 'auto' },
  tab: active => ({ padding: '12px 16px', background: active ? C.accent : 'transparent', color: active ? '#fff' : C.muted, border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s', whiteSpace: 'nowrap' }),
  body: { flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' },
  section: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  svgWrap: { background: '#000', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' },
  results: { display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: `1px dashed ${C.border}` },
  resultItem: { display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '120px' },
  controls: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', padding: '20px', background: C.surface, borderRadius: '12px', border: `1px solid ${C.border}` },
  controlGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: C.muted },
  slider: { width: '100%', accentColor: C.accent },
  note: { padding: '16px', background: 'rgba(99, 102, 241, 0.1)', borderLeft: `4px solid ${C.accent}`, borderRadius: '0 8px 8px 0', fontSize: '14px', lineHeight: 1.5, color: '#e0e7ff', display: 'flex', gap: '12px' },
  button: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: '6px', cursor: 'pointer' },
};

const CG = ({ label, min, max, step, value, set, unit }) => (
  <div style={S.controlGroup}>
    <div style={S.labelRow}>
      <span>{label}</span>
      <span style={{ color: C.text, fontWeight: 500 }}>{value} {unit}</span>
    </div>
    <input type="range" style={S.slider} min={min} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} />
  </div>
);

const RI = ({ label, value, color = C.accentLight, unit = '' }) => (
  <div style={S.resultItem}>
    <span style={{ fontSize: '12px', color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
    <span style={{ fontSize: '20px', fontWeight: 600, color }}>{value} {unit}</span>
  </div>
);

const TheoryNote = ({ children }) => (
  <div style={S.note}>
    <Info size={20} style={{ flexShrink: 0, marginTop: '2px', color: C.accentLight }} />
    <div>{children}</div>
  </div>
);

const wavePath = (fn, w, h, steps = 120, periods = 2) => {
  let path = '';
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = t * w;
    const y = h / 2 - fn(t * Math.PI * 2 * periods) * (h / 2) * 0.8;
    path += `${i === 0 ? 'M' : 'L'} ${x} ${y} `;
  }
  return path;
};

// --- TABS ---

const KCLTab = () => {
  const [i1, setI1] = useState(5);
  const [i2, setI2] = useState(-3);
  const [i3, setI3] = useState(-1);
  const i4 = -(i1 + i2 + i3); // KCL: sum = 0

  const sum = i1 + i2 + i3 + i4;

  const renderBranch = (angle, current, label) => {
    const len = 120;
    const rad = (angle * Math.PI) / 180;
    const x2 = 150 + Math.cos(rad) * len;
    const y2 = 150 - Math.sin(rad) * len;
    
    const color = current > 0 ? C.green : C.red;
    const dir = current > 0 ? 1 : -1;
    const absI = Math.abs(current);
    
    // Animation offset for particles
    const time = Date.now() / 1000;
    const offset = (time * absI * 10) % len;

    return (
      <g key={label}>
        <line x1="150" y1="150" x2={x2} y2={y2} stroke={C.border} strokeWidth="6" />
        {current !== 0 && (
          <circle 
            cx={150 + Math.cos(rad) * (dir === 1 ? len - offset : offset)} 
            cy={150 - Math.sin(rad) * (dir === 1 ? len - offset : offset)} 
            r="4" fill={color} 
          />
        )}
        <text x={x2 + Math.cos(rad)*20} y={y2 - Math.sin(rad)*20} fill={color} textAnchor="middle" alignmentBaseline="middle" dy="5">
          {label}: {current}A
        </text>
        <path d={`M 150 150 L ${150 + Math.cos(rad)*len*0.6} ${150 - Math.sin(rad)*len*0.6}`} stroke={color} strokeWidth="2" markerEnd={`url(#arrow-${current > 0 ? 'in' : 'out'})`} />
      </g>
    );
  };

  const [, setTick] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(function loop() {
      setTick(t => t + 1);
      requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <TheoryNote>
        <strong>Kirchhoff's Current Law (KCL):</strong> The algebraic sum of currents entering a node is zero (ΣI = 0). 
        Currents entering the node (green) are positive, while currents leaving (red) are negative. 
        Thus, the total current flowing in must equal the total current flowing out.
      </TheoryNote>

      <div style={S.grid2}>
        <div style={S.section}>
          <div style={S.svgWrap}>
            <svg width="300" height="300">
              <defs>
                <marker id="arrow-in" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 10 0 L 0 5 L 10 10 z" fill={C.green} />
                </marker>
                <marker id="arrow-out" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={C.red} />
                </marker>
              </defs>
              {renderBranch(90, i1, 'I₁')}
              {renderBranch(0, i2, 'I₂')}
              {renderBranch(225, i3, 'I₃')}
              {renderBranch(315, i4, 'I₄')}
              <circle cx="150" cy="150" r="8" fill={C.text} />
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={S.results}>
            <RI label="Current I₁" value={i1} unit="A" color={i1 >= 0 ? C.green : C.red} />
            <RI label="Current I₂" value={i2} unit="A" color={i2 >= 0 ? C.green : C.red} />
            <RI label="Current I₃" value={i3} unit="A" color={i3 >= 0 ? C.green : C.red} />
            <RI label="Current I₄ (Auto)" value={i4} unit="A" color={i4 >= 0 ? C.green : C.red} />
            <RI label="ΣI (Sum)" value={sum} unit="A" color={C.mono} />
          </div>

          <div style={S.controls}>
            <CG label="Branch 1 Current (I₁)" min={-10} max={10} step={0.5} value={i1} set={setI1} unit="A" />
            <CG label="Branch 2 Current (I₂)" min={-10} max={10} step={0.5} value={i2} set={setI2} unit="A" />
            <CG label="Branch 3 Current (I₃)" min={-10} max={10} step={0.5} value={i3} set={setI3} unit="A" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ... More tabs will go here

const KVLTab = () => {
  const [Vs, setVs] = useState(12);
  const [r1, setR1] = useState(2);
  const [r2, setR2] = useState(3);
  const [r3, setR3] = useState(1);

  const req = r1 + r2 + r3;
  const I = Vs / req;
  const v1 = I * r1;
  const v2 = I * r2;
  const v3 = I * r3;

  const sumCheck = Number((Vs - v1 - v2 - v3).toFixed(2));

  // Loop animation
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(function loop() {
      setTick(t => t + 1);
      requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const time = Date.now() / 1000;
  const offset = (time * I * 20) % 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <TheoryNote>
        <strong>Kirchhoff's Voltage Law (KVL):</strong> The algebraic sum of all voltages around any closed loop in a circuit must equal zero (ΣV = 0). 
        The energy provided by the source is fully consumed by the voltage drops across the resistors.
      </TheoryNote>

      <div style={S.grid2}>
        <div style={S.section}>
          <div style={S.svgWrap}>
            <svg width="400" height="250" viewBox="0 0 400 250">
              {/* Circuit wires */}
              <rect x="100" y="50" width="200" height="150" fill="none" stroke={C.border} strokeWidth="4" />
              
              {/* Source (Left) */}
              <rect x="80" y="100" width="40" height="50" fill={C.surface} stroke={C.accent} strokeWidth="3" rx="4" />
              <text x="100" y="130" fill={C.text} textAnchor="middle" fontWeight="bold">{Vs}V</text>
              <text x="100" y="90" fill={C.text} textAnchor="middle">+</text>
              <text x="100" y="165" fill={C.text} textAnchor="middle">-</text>

              {/* Resistor 1 (Top) */}
              <rect x="175" y="35" width="50" height="30" fill={C.surface} stroke={C.amber} strokeWidth="3" rx="4" />
              <text x="200" y="55" fill={C.text} textAnchor="middle">{r1}Ω</text>
              <text x="200" y="25" fill={C.amber} textAnchor="middle">-{v1.toFixed(1)}V</text>

              {/* Resistor 2 (Right) */}
              <rect x="285" y="100" width="30" height="50" fill={C.surface} stroke={C.violet} strokeWidth="3" rx="4" />
              <text x="300" y="130" fill={C.text} textAnchor="middle">{r2}Ω</text>
              <text x="335" y="130" fill={C.violet} textAnchor="middle">-{v2.toFixed(1)}V</text>

              {/* Resistor 3 (Bottom) */}
              <rect x="175" y="185" width="50" height="30" fill={C.surface} stroke={C.cyan} strokeWidth="3" rx="4" />
              <text x="200" y="205" fill={C.text} textAnchor="middle">{r3}Ω</text>
              <text x="200" y="235" fill={C.cyan} textAnchor="middle">-{v3.toFixed(1)}V</text>

              {/* Current particles animation (top wire) */}
              <circle cx={100 + offset} cy="50" r="4" fill={C.green} />
              <circle cx={100 + offset + 100} cy="50" r="4" fill={C.green} />
              <circle cx="300" cy={50 + offset} r="4" fill={C.green} />
              <circle cx="300" cy={50 + offset + 100} r="4" fill={C.green} />
              <circle cx={300 - offset} cy="200" r="4" fill={C.green} />
              <circle cx={300 - offset - 100} cy="200" r="4" fill={C.green} />
              <circle cx="100" cy={200 - offset} r="4" fill={C.green} />
              <circle cx="100" cy={200 - offset - 100} r="4" fill={C.green} />
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={S.results}>
            <RI label="Total Current (I)" value={I.toFixed(2)} unit="A" color={C.green} />
            <RI label="V drop R₁" value={v1.toFixed(2)} unit="V" color={C.amber} />
            <RI label="V drop R₂" value={v2.toFixed(2)} unit="V" color={C.violet} />
            <RI label="V drop R₃" value={v3.toFixed(2)} unit="V" color={C.cyan} />
            <RI label="ΣV Loop (Vs - ΣVdrops)" value={sumCheck} unit="V" color={sumCheck === 0 ? C.text : C.red} />
          </div>

          <div style={S.controls}>
            <CG label="Source Voltage (Vs)" min={0} max={24} step={1} value={Vs} set={setVs} unit="V" />
            <CG label="Resistor 1 (R₁)" min={1} max={10} step={1} value={r1} set={setR1} unit="Ω" />
            <CG label="Resistor 2 (R₂)" min={1} max={10} step={1} value={r2} set={setR2} unit="Ω" />
            <CG label="Resistor 3 (R₃)" min={1} max={10} step={1} value={r3} set={setR3} unit="Ω" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SinglePhaseACTab = () => {
  const [Vp, setVp] = useState(170);
  const [f, setF] = useState(60);
  const [phiDeg, setPhiDeg] = useState(0);
  const [running, setRunning] = useState(true);
  const [renderPhase, setRenderPhase] = useState(0);

  const phaseRef = useRef(0);
  const afRef = useRef();
  const ltRef = useRef(0);

  useEffect(() => {
    if (!running) { ltRef.current = 0; return; }
    const displayOmega = 2 * Math.PI * 1.2; // 1.2 rev/s — slow enough to see clearly
    const tick = (ts) => {
      if (ltRef.current) {
        const dt = Math.min((ts - ltRef.current) / 1000, 0.05);
        phaseRef.current = (phaseRef.current + displayOmega * dt) % (2 * Math.PI);
        setRenderPhase(phaseRef.current);
      }
      ltRef.current = ts;
      afRef.current = requestAnimationFrame(tick);
    };
    afRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(afRef.current); ltRef.current = 0; };
  }, [running]);

  const Vrms = Vp / Math.sqrt(2);
  const period = (1000 / f).toFixed(1);
  const phi = (phiDeg * Math.PI) / 180;
  const currentAngle = renderPhase + phi;
  const instantV = (Vp * Math.sin(currentAngle)).toFixed(1);

  // SVG layout: phasor on left, waveform on right
  // viewBox: 0 0 560 270  |  phasor: cx=130, cy=135, r=105
  // waveform: x from 275 to 545 (270px wide, 2 periods)
  const cx = 130, cy = 135, r = 105;
  const amp = r;
  const px = cx + Math.cos(currentAngle) * r;
  const py = cy - Math.sin(currentAngle) * r;
  const wX0 = 275, wW = 270;

  const waveformD = Array.from({ length: 121 }, (_, i) => {
    const t = i / 120;
    const x = wX0 + t * wW;
    const y = cy - Math.sin(currentAngle - t * 2 * Math.PI * 2) * amp;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(2)}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <TheoryNote>
        <strong>Single-Phase AC:</strong> Alternating current continuously changes direction, represented by a sine wave:
        <span style={{ fontFamily: 'monospace', marginLeft: 8 }}>v(t) = Vpeak · sin(2πft + φ)</span>.
        The rotating phasor (left) projects onto the time-axis to trace the waveform (right).
        RMS = Vpeak / √2 — the equivalent DC heating value.
      </TheoryNote>

      <div style={S.grid2}>
        <div style={S.section}>
          <div style={{ ...S.svgWrap, minHeight: '300px' }}>
            <svg width="100%" height="280" viewBox="0 0 560 280">
              {/* Horizontal/Vertical axes */}
              <line x1="20" y1={cy} x2="550" y2={cy} stroke={C.border} strokeWidth="1" />
              <line x1={cx} y1="15" x2={cx} y2="255" stroke={C.border} strokeWidth="1" />

              {/* Vertical divider between phasor and waveform */}
              <line x1={wX0 - 5} y1="15" x2={wX0 - 5} y2="255" stroke={C.border} strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />

              {/* Phasor circle */}
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="1.5" strokeDasharray="4 4" />

              {/* Quadrant ticks at 0°, 90°, 180°, 270° */}
              {[0, 90, 180, 270].map(d => {
                const rad = d * Math.PI / 180;
                return <line key={d} x1={cx + Math.cos(rad) * (r - 5)} y1={cy - Math.sin(rad) * (r - 5)} x2={cx + Math.cos(rad) * (r + 5)} y2={cy - Math.sin(rad) * (r + 5)} stroke={C.muted} strokeWidth="1" opacity="0.5" />;
              })}
              <text x={cx + r + 9} y={cy + 4} fill={C.muted} fontSize="10">0°</text>
              <text x={cx} y={cy - r - 8} fill={C.muted} fontSize="10" textAnchor="middle">90°</text>
              <text x={cx - r - 9} y={cy + 4} fill={C.muted} fontSize="10" textAnchor="end">180°</text>
              <text x={cx} y={cy + r + 16} fill={C.muted} fontSize="10" textAnchor="middle">270°</text>

              {/* Angle arc indicator */}
              {(() => {
                const a = ((currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
                const arcR = 26;
                const largeArc = a > Math.PI ? 1 : 0;
                const ex = cx + Math.cos(a) * arcR;
                const ey = cy - Math.sin(a) * arcR;
                return a > 0.05 && <path d={`M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArc} 0 ${ex.toFixed(1)} ${ey.toFixed(1)}`} fill="none" stroke={C.accent} strokeWidth="1.5" opacity="0.6" />;
              })()}

              {/* Phasor arm */}
              <line x1={cx} y1={cy} x2={px} y2={py} stroke={C.accentLight} strokeWidth="3" strokeLinecap="round" />
              <circle cx={cx} cy={cy} r="4" fill={C.muted} />
              <circle cx={px} cy={py} r="6" fill={C.accent} stroke={C.accentLight} strokeWidth="1.5" />

              {/* Projection: horizontal from phasor tip → waveform start */}
              <line x1={px} y1={py} x2={wX0} y2={py} stroke={C.accent} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.5" />
              <circle cx={wX0} cy={py} r="4" fill={C.accent} opacity="0.8" />

              {/* Waveform ±Vp dashed lines */}
              <line x1={wX0} y1={cy - amp} x2="550" y2={cy - amp} stroke={C.red} strokeWidth="1" strokeDasharray="5 3" opacity="0.45" />
              <line x1={wX0} y1={cy + amp} x2="550" y2={cy + amp} stroke={C.red} strokeWidth="1" strokeDasharray="5 3" opacity="0.45" />
              <text x="545" y={cy - amp - 5} fill={C.red} fontSize="11" textAnchor="end" opacity="0.7">+Vp</text>
              <text x="545" y={cy + amp + 14} fill={C.red} fontSize="11" textAnchor="end" opacity="0.7">-Vp</text>

              {/* Vrms dashed line */}
              <line x1={wX0} y1={cy - amp * 0.707} x2="550" y2={cy - amp * 0.707} stroke={C.green} strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="545" y={cy - amp * 0.707 - 5} fill={C.green} fontSize="11" textAnchor="end">Vrms</text>

              {/* Waveform path */}
              <path d={waveformD} fill="none" stroke={C.accentLight} strokeWidth="2.5" />

              {/* Period label */}
              <text x={wX0 + 10} y="272" fill={C.muted} fontSize="11">← 2 cycles ({(2000/f).toFixed(0)} ms) →</text>
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={S.results}>
            <RI label="Peak Voltage" value={Vp.toFixed(0)} unit="V" />
            <RI label="RMS Voltage" value={Vrms.toFixed(1)} unit="V" color={C.green} />
            <RI label="Frequency" value={f} unit="Hz" color={C.amber} />
            <RI label="Period (T)" value={period} unit="ms" />
            <RI label="v(t) instant" value={instantV} unit="V" color={C.text} />
          </div>

          <div style={S.controls}>
            <CG label="Peak Voltage (Vpeak)" min={10} max={340} step={10} value={Vp} set={setVp} unit="V" />
            <CG label="Frequency (f)" min={1} max={120} step={1} value={f} set={setF} unit="Hz" />
            <CG label="Phase Angle (φ)" min={-180} max={180} step={15} value={phiDeg} set={setPhiDeg} unit="°" />
          </div>

          <button style={S.button} onClick={() => setRunning(v => !v)}>
            {running ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Play</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const ACImpedancePowerTab = () => {
  const [R, setR] = useState(10);
  const [L, setL] = useState(30); // mH
  const [Cval, setCval] = useState(100); // uF
  const [f, setF] = useState(60);
  const [Vs] = useState(120);

  const XL = 2 * Math.PI * f * (L / 1000);
  const XC = 1 / (2 * Math.PI * f * (Cval / 1000000));
  const X = XL - XC;
  const Z = Math.sqrt(R * R + X * X);
  const I = Vs / Z;
  
  const phiRad = Math.atan2(X, R);
  const pf = Math.cos(phiRad);
  const S_val = Vs * I;
  const P = S_val * pf;
  const Q = S_val * Math.sin(phiRad);

  const maxVal = Math.max(R, Math.abs(XL), Math.abs(XC), Z);
  const scale = 100 / maxVal;
  const cx = 150;
  const cy = 150;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <TheoryNote>
        <strong>AC Impedance & Power:</strong> In AC circuits, Inductors (L) and Capacitors (C) resist current change (Reactance XL, XC). 
        Total Impedance Z = R + j(XL - XC). True Power (P) in Watts does work. Reactive Power (Q) in VAr sustains electromagnetic fields. Apparent Power (S) is the vector sum.
      </TheoryNote>

      <div style={S.grid2}>
        <div style={S.section}>
          <div style={S.svgWrap}>
            <svg width="300" height="250" viewBox="0 0 300 250">
              <text x="10" y="20" fill={C.muted} fontSize="14">Impedance Phasor Diagram (Ohms)</text>
              {/* Axes */}
              <line x1="0" y1={cy} x2="300" y2={cy} stroke={C.border} strokeWidth="1" />
              <line x1={cx} y1="0" x2={cx} y2="250" stroke={C.border} strokeWidth="1" />
              <text x="280" y={cy + 15} fill={C.muted} fontSize="12">R (Re)</text>
              <text x={cx + 10} y="20" fill={C.muted} fontSize="12">jX (Im)</text>

              {/* R vector */}
              <line x1={cx} y1={cy} x2={cx + R * scale} y2={cy} stroke={C.text} strokeWidth="4" />
              <text x={cx + R*scale/2} y={cy + 15} fill={C.text} textAnchor="middle" fontSize="12">R={R.toFixed(1)}Ω</text>

              {/* XL vector (Up) */}
              <line x1={cx + R*scale} y1={cy} x2={cx + R*scale} y2={cy - XL*scale} stroke={C.violet} strokeWidth="3" />
              <text x={cx + R*scale + 5} y={cy - XL*scale/2} fill={C.violet} fontSize="12">XL={XL.toFixed(1)}Ω</text>

              {/* XC vector (Down from XL) */}
              <line x1={cx + R*scale} y1={cy - XL*scale} x2={cx + R*scale} y2={cy - XL*scale + XC*scale} stroke={C.cyan} strokeWidth="3" />
              <text x={cx + R*scale + 30} y={cy - XL*scale + XC*scale/2} fill={C.cyan} fontSize="12">XC={XC.toFixed(1)}Ω</text>

              {/* Z vector */}
              <line x1={cx} y1={cy} x2={cx + R * scale} y2={cy - X * scale} stroke={C.amber} strokeWidth="2" strokeDasharray="4 4" />
              <text x={cx + R*scale/2} y={cy - X*scale/2 - 10} fill={C.amber} fontSize="12">Z={Z.toFixed(1)}Ω</text>
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={S.results}>
            <RI label="Source Vrms" value={Vs} unit="V" color={C.muted} />
            <RI label="Impedance |Z|" value={Z.toFixed(2)} unit="Ω" color={C.amber} />
            <RI label="Current (I)" value={I.toFixed(2)} unit="A" />
            <RI label="Power Factor" value={pf.toFixed(3)} unit={X > 0 ? "Lag" : X < 0 ? "Lead" : ""} color={pf > 0.9 ? C.green : C.red} />
            <RI label="True Power (P)" value={P.toFixed(0)} unit="W" color={C.green} />
            <RI label="Reactive Pow (Q)" value={Math.abs(Q).toFixed(0)} unit="VAr" color={C.cyan} />
            <RI label="Apparent Pow (S)" value={S_val.toFixed(0)} unit="VA" color={C.violet} />
          </div>

          <div style={S.controls}>
            <CG label="Resistance (R)" min={1} max={50} step={1} value={R} set={setR} unit="Ω" />
            <CG label="Inductance (L)" min={0} max={100} step={1} value={L} set={setL} unit="mH" />
            <CG label="Capacitance (C)" min={10} max={500} step={10} value={Cval} set={setCval} unit="μF" />
            <CG label="Frequency (f)" min={10} max={120} step={5} value={f} set={setF} unit="Hz" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ThreePhaseSystemsTab = () => {
  const [Vphase, setVphase] = useState(120);
  const [Iphase, setIphase] = useState(10);
  const f = 60;
  const [isStar, setIsStar] = useState(true);
  const [running, setRunning] = useState(true);
  const [renderPhase, setRenderPhase] = useState(0);

  const phaseRef = useRef(0);
  const afRef = useRef();
  const ltRef = useRef(0);

  useEffect(() => {
    if (!running) { ltRef.current = 0; return; }
    const displayOmega = 2 * Math.PI * 1.2; // 1.2 rev/s — slow enough to see clearly
    const tick = (ts) => {
      if (ltRef.current) {
        const dt = Math.min((ts - ltRef.current) / 1000, 0.05);
        phaseRef.current = (phaseRef.current + displayOmega * dt) % (2 * Math.PI);
        setRenderPhase(phaseRef.current);
      }
      ltRef.current = ts;
      afRef.current = requestAnimationFrame(tick);
    };
    afRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(afRef.current); ltRef.current = 0; };
  }, [running]);

  const Vline = isStar ? Vphase * Math.sqrt(3) : Vphase;
  const Iline = isStar ? Iphase : Iphase * Math.sqrt(3);

  // Phasor SVG layout: viewBox 0 0 580 250
  // Phasor area: cx=115, cy=125, r=90  (extends to x=205, safe margin before waveform at x=230)
  // Waveform area: x from 230 to 565 (335px wide, 2 full periods)
  const cx = 115, cy = 125, r = 90;
  const amp = r * 0.82;
  const wX0 = 230, wW = 335;

  // Phasor tip positions
  const p1x = cx + Math.cos(renderPhase) * r;
  const p1y = cy - Math.sin(renderPhase) * r;
  const p2x = cx + Math.cos(renderPhase - 2*Math.PI/3) * r;
  const p2y = cy - Math.sin(renderPhase - 2*Math.PI/3) * r;
  const p3x = cx + Math.cos(renderPhase - 4*Math.PI/3) * r;
  const p3y = cy - Math.sin(renderPhase - 4*Math.PI/3) * r;

  const buildWave = (shift) => Array.from({ length: 101 }, (_, i) => {
    const t = i / 100;
    const x = wX0 + t * wW;
    const y = cy - Math.sin(renderPhase - shift - t * 2 * Math.PI * 2) * amp;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(2)}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <TheoryNote>
        <strong>Three-Phase Systems ({isStar ? 'Star / Y' : 'Delta / Δ'} Connection):</strong> Three voltages separated by 120° — the three phasors sum to zero at any instant.
        {isStar
          ? ' Star (Y): V_Line = √3 × V_Phase, I_Line = I_Phase. Provides a neutral wire.'
          : ' Delta (Δ): V_Line = V_Phase, I_Line = √3 × I_Phase. No neutral point.'}
      </TheoryNote>

      {/* Phasor + Waveform panel — full width */}
      <div style={S.section}>
        <div style={{ ...S.svgWrap, minHeight: '260px' }}>
          <svg width="100%" height="250" viewBox="0 0 580 250">
            {/* Horizontal axis */}
            <line x1="20" y1={cy} x2="570" y2={cy} stroke={C.border} strokeWidth="1" />
            {/* Phasor vertical axis */}
            <line x1={cx} y1="15" x2={cx} y2="235" stroke={C.border} strokeWidth="1" />
            {/* Divider between phasor and waveform */}
            <line x1={wX0 - 5} y1="15" x2={wX0 - 5} y2="235" stroke={C.border} strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />

            {/* Phasor circle */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx={cx} cy={cy} r="4" fill={C.muted} />

            {/* Three phasor arms */}
            <line x1={cx} y1={cy} x2={p1x} y2={p1y} stroke={C.red}   strokeWidth="3" strokeLinecap="round" />
            <line x1={cx} y1={cy} x2={p2x} y2={p2y} stroke={C.amber} strokeWidth="3" strokeLinecap="round" />
            <line x1={cx} y1={cy} x2={p3x} y2={p3y} stroke={C.cyan}  strokeWidth="3" strokeLinecap="round" />

            {/* Phasor tip dots */}
            <circle cx={p1x} cy={p1y} r="5" fill={C.red} />
            <circle cx={p2x} cy={p2y} r="5" fill={C.amber} />
            <circle cx={p3x} cy={p3y} r="5" fill={C.cyan} />

            {/* Three waveforms */}
            <path d={buildWave(0)}             fill="none" stroke={C.red}   strokeWidth="2.5" />
            <path d={buildWave(2*Math.PI/3)}  fill="none" stroke={C.amber} strokeWidth="2.5" />
            <path d={buildWave(4*Math.PI/3)}  fill="none" stroke={C.cyan}  strokeWidth="2.5" />

            {/* Period label */}
            <text x={wX0 + 8} y="245" fill={C.muted} fontSize="11">← 2 cycles ({(2000/f).toFixed(0)} ms) →</text>

            {/* Legend */}
            <rect x="390" y="12" width="180" height="46" fill={C.surface} stroke={C.border} strokeWidth="1" rx="4" />
            <circle cx="404" cy="25" r="5" fill={C.red} /><text x="414" y="29" fill={C.text} fontSize="11">L1 (Phase A, 0°)</text>
            <circle cx="404" cy="40" r="5" fill={C.amber} /><text x="414" y="44" fill={C.text} fontSize="11">L2 (Phase B, −120°)</text>
            <circle cx="404" cy="55" r="5" fill={C.cyan} /><text x="414" y="59" fill={C.text} fontSize="11">L3 (Phase C, −240°)</text>
          </svg>
        </div>
      </div>

      <div style={S.grid2}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={S.controls}>
            <div style={S.controlGroup}>
              <div style={S.labelRow}><span>Connection Type</span></div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ ...S.button, flex: 1, background: isStar ? C.accent : C.surface, color: isStar ? '#fff' : C.text, borderColor: isStar ? C.accent : C.border }} onClick={() => setIsStar(true)}>Star (Y)</button>
                <button style={{ ...S.button, flex: 1, background: !isStar ? C.accent : C.surface, color: !isStar ? '#fff' : C.text, borderColor: !isStar ? C.accent : C.border }} onClick={() => setIsStar(false)}>Delta (Δ)</button>
              </div>
            </div>
            <CG label="Phase Voltage (VP)" min={50} max={400} step={10} value={Vphase} set={setVphase} unit="V" />
            <CG label="Phase Current (IP)" min={1} max={100} step={1} value={Iphase} set={setIphase} unit="A" />
            <button style={{ ...S.button, justifyContent: 'center' }} onClick={() => setRunning(v => !v)}>
              {running ? <><Pause size={16} /> Pause Waveforms</> : <><Play size={16} /> Play Waveforms</>}
            </button>
          </div>
        </div>

        {/* Results + Connection Diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={S.results}>
            <RI label="VP (Phase V)" value={Vphase.toFixed(0)} unit="V" color={C.muted} />
            <RI label="VL (Line V)" value={Vline.toFixed(0)} unit="V" color={isStar ? C.green : C.muted} />
            <RI label="IP (Phase A)" value={Iphase.toFixed(0)} unit="A" color={C.muted} />
            <RI label="IL (Line A)" value={Iline.toFixed(2)} unit="A" color={!isStar ? C.amber : C.muted} />
            <RI label="Apparent S" value={(3 * Vphase * Iphase).toFixed(0)} unit="VA" color={C.violet} />
          </div>

          {/* Connection diagram */}
          <div style={{ ...S.svgWrap, minHeight: '200px', padding: '20px 12px' }}>
            <svg width="100%" height="205" viewBox="0 0 310 205">
              {isStar ? (
                <g fill="none">
                  <text x="10" y="15" fill={C.text} fontSize="13" fontWeight="600">Star (Y) — V_L = √3 · V_P</text>
                  {/* Center node */}
                  <circle cx="155" cy="110" r="6" fill={C.muted} />
                  {/* Arms */}
                  <line x1="155" y1="104" x2="155" y2="42" stroke={C.red}   strokeWidth="3" />
                  <line x1="150" y1="114" x2="87"  y2="170" stroke={C.amber} strokeWidth="3" />
                  <line x1="160" y1="114" x2="223" y2="170" stroke={C.cyan}  strokeWidth="3" />
                  {/* Load boxes */}
                  <rect x="143" y="57" width="24" height="32" fill={C.surface} stroke={C.red}   strokeWidth="2" rx="3" /><text x="155" y="78" fill={C.red}   fontSize="9" textAnchor="middle">Z</text>
                  <rect x="92"  y="124" width="24" height="32" fill={C.surface} stroke={C.amber} strokeWidth="2" rx="3" transform="rotate(-55 104 140)" />
                  <rect x="190" y="124" width="24" height="32" fill={C.surface} stroke={C.cyan}  strokeWidth="2" rx="3" transform="rotate(55 202 140)" />
                  {/* Neutral */}
                  <line x1="161" y1="110" x2="262" y2="110" stroke={C.muted} strokeWidth="1.5" strokeDasharray="5 4" />
                  <text x="265" y="114" fill={C.muted} fontSize="11">N</text>
                  {/* Terminal labels */}
                  <text x="155" y="34" fill={C.red}   fontSize="12" textAnchor="middle" fontWeight="bold">L1</text>
                  <text x="74"  y="190" fill={C.amber} fontSize="12" textAnchor="middle" fontWeight="bold">L2</text>
                  <text x="236" y="190" fill={C.cyan}  fontSize="12" textAnchor="middle" fontWeight="bold">L3</text>
                </g>
              ) : (
                <g fill="none">
                  <text x="10" y="15" fill={C.text} fontSize="13" fontWeight="600">Delta (Δ) — I_L = √3 · I_P</text>
                  {/* Triangle vertices: top (155,40), bottom-left (75,175), bottom-right (235,175) */}
                  {/* Side loads */}
                  <line x1="155" y1="40"  x2="113" y2="107" stroke={C.red}   strokeWidth="3" />
                  <rect x="99" y="63" width="24" height="32" fill={C.surface} stroke={C.red} strokeWidth="2" rx="3" transform="rotate(-57 111 79)" />
                  <line x1="113" y1="107" x2="75"  y2="175" stroke={C.red}   strokeWidth="3" />

                  <line x1="75"  y1="175" x2="154" y2="175" stroke={C.amber} strokeWidth="3" />
                  <rect x="97"  y="163" width="24" height="32" fill={C.surface} stroke={C.amber} strokeWidth="2" rx="3" transform="rotate(90 109 175)" />
                  <line x1="154" y1="175" x2="235" y2="175" stroke={C.amber} strokeWidth="3" />

                  <line x1="235" y1="175" x2="195" y2="107" stroke={C.cyan} strokeWidth="3" />
                  <rect x="187" y="63" width="24" height="32" fill={C.surface} stroke={C.cyan} strokeWidth="2" rx="3" transform="rotate(57 199 79)" />
                  <line x1="195" y1="107" x2="155" y2="40" stroke={C.cyan} strokeWidth="3" />
                  {/* Terminal lines out */}
                  <line x1="155" y1="40"  x2="155" y2="18"  stroke={C.red}   strokeWidth="2" />
                  <line x1="75"  y1="175" x2="45"  y2="195" stroke={C.amber} strokeWidth="2" />
                  <line x1="235" y1="175" x2="265" y2="195" stroke={C.cyan}  strokeWidth="2" />
                  {/* Terminal labels */}
                  <text x="155" y="14" fill={C.red}   fontSize="12" textAnchor="middle" fontWeight="bold">L1</text>
                  <text x="38"  y="202" fill={C.amber} fontSize="12" textAnchor="middle" fontWeight="bold">L2</text>
                  <text x="272" y="202" fill={C.cyan}  fontSize="12" textAnchor="middle" fontWeight="bold">L3</text>
                </g>
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const ThreePhaseAdvantagesTab = () => {
  const [pfAngleDeg, setPfAngleDeg] = useState(0);
  const [loadPower, setLoadPower] = useState(100);
  const [showPhases, setShowPhases] = useState(true);

  const phi = (pfAngleDeg * Math.PI) / 180;
  
  // Power plots over time (theta = 0 to 2*PI)
  const steps = 60;
  const Vm = 1, Im = 1;

  const points3ph = Array.from({length: steps+1}, (_, i) => {
    const t = (i/steps)*2*Math.PI;
    const pa = Vm*Im * Math.sin(t) * Math.sin(t - phi);
    const pb = Vm*Im * Math.sin(t - 2*Math.PI/3) * Math.sin(t - 2*Math.PI/3 - phi);
    const pc = Vm*Im * Math.sin(t - 4*Math.PI/3) * Math.sin(t - 4*Math.PI/3 - phi);
    return {t, pa, pb, pc, ptot: pa + pb + pc};
  });

  const points1ph = Array.from({length: steps+1}, (_, i) => {
    const t = (i/steps)*2*Math.PI;
    const p1 = (Vm*Math.sqrt(3)) * (Im*Math.sqrt(3)) * Math.sin(t) * Math.sin(t - phi);
    return {t, p1};
  });

  const S_3ph = 3 * loadPower; 
  const S_1ph = 3 * loadPower; // equivalent load

  // Copper Volume roughly 0.75 for 3-phase vs 1-phase for same power/distance/loss
  const cu1ph = 100;
  const cu3ph = 75;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <TheoryNote>
        <strong>Three-Phase Advantages:</strong> Providing the same total power, a 3-phase system delivers <em>constant instantaneous power</em> (unlike single-phase which pulsates at 2f, causing vibrations in motors). 
        Furthermore, a 3-phase system requires only 75% of the conductor material (copper/aluminum) compared to an equivalent single-phase system, drastically reducing transmission costs.
      </TheoryNote>

      <div style={S.grid2}>
        <div style={S.section}>
          <div style={S.svgWrap}>
            <svg width="100%" height="250" viewBox="0 0 400 250">
              <text x="10" y="20" fill={C.muted} fontSize="14">Instantaneous Power</text>
              <line x1="0" y1="180" x2="400" y2="180" stroke={C.border} strokeWidth="1" />
              <text x="10" y="170" fill={C.muted} fontSize="10">0W</text>
              
              {/* Single Phase Power Pulsation */}
              <text x="10" y="40" fill={C.red} fontSize="12">Single Phase (Pulsating)</text>
              <path 
                d={points1ph.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.t/(2*Math.PI))*400} ${180 - p.p1 * 40}`).join(' ')}
                fill="none" stroke={C.red} strokeWidth="2" strokeDasharray="4 4" opacity="0.6"
              />

              {/* Three Phase Ptot */}
              <text x="10" y="60" fill={C.green} fontSize="12">Three Phase Total (Constant)</text>
              <path 
                d={points3ph.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.t/(2*Math.PI))*400} ${180 - p.ptot * 40}`).join(' ')}
                fill="none" stroke={C.green} strokeWidth="3"
              />

              {/* Individual 3 Phases */}
              {showPhases && <path d={points3ph.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.t/(2*Math.PI))*400} ${180 - p.pa * 40}`).join(' ')} fill="none" stroke={C.red} opacity="0.3" />}
              {showPhases && <path d={points3ph.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.t/(2*Math.PI))*400} ${180 - p.pb * 40}`).join(' ')} fill="none" stroke={C.amber} opacity="0.3" />}
              {showPhases && <path d={points3ph.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(p.t/(2*Math.PI))*400} ${180 - p.pc * 40}`).join(' ')} fill="none" stroke={C.cyan} opacity="0.3" />}
            </svg>
          </div>
          
          <div style={S.controls}>
            <CG label="Power Factor Angle (φ)" min={-60} max={60} step={5} value={pfAngleDeg} set={setPfAngleDeg} unit="°" />
            <CG label="Simulated Load" min={10} max={500} step={10} value={loadPower} set={setLoadPower} unit="kW" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="phs" checked={showPhases} onChange={e => setShowPhases(e.target.checked)} style={{ cursor: 'pointer', width: 18, height: 18 }} />
              <label htmlFor="phs" style={{ cursor: 'pointer' }}>Show individual phase powers</label>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={S.results}>
            <RI label="3-Ph Power Ripple" value="0" unit="%" color={C.green} />
            <RI label="1-Ph Power Ripple" value="100" unit="%" color={C.red} />
            <RI label="Copper Savings" value="25" unit="%" color={C.accent} />
          </div>

          <div style={{ ...S.section, flex: 1, justifyContent: 'center' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: C.text }}>Conductor Material Required (for {S_3ph} kW)</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: C.text }}>Single-Phase (2 wires, larger cross-section)</span>
                  <span style={{ color: C.red, fontWeight: 'bold' }}>100% Volume</span>
                </div>
                <div style={{ width: '100%', height: '24px', background: C.border, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: C.red, opacity: 0.8 }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: C.text }}>Three-Phase (3 or 4 wires, much smaller section)</span>
                  <span style={{ color: C.green, fontWeight: 'bold' }}>75% Volume</span>
                </div>
                <div style={{ width: '100%', height: '24px', background: C.border, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ width: '75%', height: '100%', background: C.green }} />
                </div>
              </div>
              
              <p style={{ fontSize: '14px', color: C.muted, marginTop: '16px' }}>
                Three-phase transmission saves 25% of copper/aluminum weight yielding millions of dollars in savings for grid infrastructure. Furthermore, three-phase provides a rotating magnetic field which enables simple, self-starting induction motors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlaceholderTab = ({ title }) => <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>{title} implementation goes here...</div>;

// --- MAIN WRAPPER ---

const TABS = [
  { id: 'kcl', label: 'KCL' },
  { id: 'kvl', label: 'KVL' },
  { id: 'ac', label: 'Single-Phase AC' },
  { id: 'impedance', label: 'AC Impedance' },
  { id: '3ph', label: '3-Phase Systems' },
  { id: 'adv', label: '3-Phase Advantages' }
];

const TAB_MAP = {
  kcl: KCLTab,
  kvl: KVLTab,
  ac: SinglePhaseACTab,
  impedance: ACImpedancePowerTab,
  '3ph': ThreePhaseSystemsTab,
  adv: ThreePhaseAdvantagesTab
};

export default function CircuitTheoryFundamentals() {
  const [activeTab, setActiveTab] = useState('kcl');
  const ActiveComponent = TAB_MAP[activeTab];

  return (
    <div style={S.container}>
      <header style={S.header}>
        <h1 style={S.title}><Zap size={28} color={C.accent} /> Circuit Theory Fundamentals</h1>
      </header>

      <div style={S.tabBar}>
        {TABS.map(t => (
          <button key={t.id} style={S.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={S.body}>
        <ActiveComponent />
      </div>
    </div>
  );
}
