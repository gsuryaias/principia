import React, { useMemo, useState, useEffect } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', color: '#e4e4e7', fontFamily: 'Inter, system-ui, sans-serif' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '18px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowX: 'auto', minHeight: 400 },
  controls: { padding: '14px 24px', display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center', background: '#111114', borderTop: '1px solid #1e1e2e' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 130, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 52, textAlign: 'right' },
  results: { display: 'flex', gap: 26, flexWrap: 'wrap', padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, textTransform: 'uppercase', color: '#52525b', fontWeight: 700, letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontFamily: 'monospace', fontWeight: 700 },
  theory: { flex: 1, padding: '32px 24px', maxWidth: 860, margin: '0 auto', width: '100%', overflowY: 'auto' },
  h2: { fontSize: 22, fontWeight: 700, color: '#f4f4f5', margin: '36px 0 14px', paddingBottom: 8, borderBottom: '1px solid #27272a' },
  h3: { fontSize: 17, fontWeight: 600, color: '#e4e4e7', margin: '24px 0 10px' },
  p: { fontSize: 15, lineHeight: 1.8, color: '#a1a1aa', margin: '0 0 14px' },
  eq: { display: 'block', padding: '14px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontFamily: 'monospace', fontSize: 15, color: '#c4b5fd', margin: '16px 0', textAlign: 'center', overflowX: 'auto' },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { display: 'block', fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14 },
  ctxP: { margin: 0, fontSize: 14, lineHeight: 1.7, color: '#a1a1aa' },
  tbl: { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #3f3f46', color: '#d4d4d8', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #27272a', color: '#a1a1aa' },
};

/* ── Simplified instrument transformer model (assumed nameplate values) ── */
const CT_SPEC = {
  ratioPrimaryA: 2000,
  ratioSecondaryA: 1,
  kneeVoltageV: 400,
  secondaryResistanceOhm: 4.0,
  ratedBurdenVA: 15,
  ratedALF: 20,
};

const PT_SPEC = {
  secondaryVoltageV: 110,
  ratedBurdenVA: 100,
  nameplateClass: '0.5',
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function ctData(primaryA, burdenVA) {
  const ratio = CT_SPEC.ratioPrimaryA / CT_SPEC.ratioSecondaryA;
  const secondaryCurrentA = primaryA / ratio;
  const burdenOhm = burdenVA / (CT_SPEC.ratioSecondaryA ** 2);
  const totalSecondaryOhm = burdenOhm + CT_SPEC.secondaryResistanceOhm;
  const secondaryVoltageV = secondaryCurrentA * totalSecondaryOhm;
  const vOverVk = secondaryVoltageV / CT_SPEC.kneeVoltageV;
  const ratedTotalOhm = CT_SPEC.ratedBurdenVA / (CT_SPEC.ratioSecondaryA ** 2) + CT_SPEC.secondaryResistanceOhm;
  const effectiveAlf = CT_SPEC.ratedALF * (ratedTotalOhm / totalSecondaryOhm);
  const requiredMultiple = primaryA / CT_SPEC.ratioPrimaryA;
  const excitationCurrentmA = clamp(6 * (Math.exp(secondaryVoltageV / 120) - 1), 0, 320);
  const saturationLikely = vOverVk >= 1 || requiredMultiple > effectiveAlf;
  const ratioErrorPct = clamp(
    0.2 + Math.max(0, vOverVk - 0.5) * 3.2 + Math.max(0, requiredMultiple - effectiveAlf) * 2.5,
    0.2,
    25,
  );

  return {
    ...CT_SPEC,
    burdenOhm,
    totalSecondaryOhm,
    secondaryCurrentA,
    vsec: secondaryVoltageV,
    vk: CT_SPEC.kneeVoltageV,
    vOverVk,
    requiredMultiple,
    effectiveAlf,
    excitationCurrentmA,
    saturationLikely,
    ratioErrorPct,
  };
}

function ptData(ptBurdenVA) {
  const utilization = ptBurdenVA / PT_SPEC.ratedBurdenVA;
  const secondaryCurrentA = ptBurdenVA / PT_SPEC.secondaryVoltageV;
  const burdenOhm = ptBurdenVA > 0 ? (PT_SPEC.secondaryVoltageV ** 2) / ptBurdenVA : Infinity;
  const ratioErrorEstimatePct = clamp(0.1 + 0.4 * utilization ** 1.3, 0.1, 1.2);
  const phaseDisplacementMin = clamp(3 + 7 * utilization, 2, 20);
  return {
    ...PT_SPEC,
    utilization,
    utilizationPct: utilization * 100,
    secondaryCurrentA,
    burdenOhm,
    ratioErrorEstimatePct,
    phaseDisplacementMin,
    withinRatedBurden: utilization <= 1,
  };
}

function useAnimationPulse(interval = 900) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => !p), interval);
    return () => clearInterval(id);
  }, [interval]);
  return pulse;
}

/* ── Approximate CT Excitation Curve SVG ── */
function MagnetizationCurve() {
  return (
    <svg viewBox="0 0 500 340" style={{ width: '100%', maxWidth: 500, height: 'auto', margin: '18px 0' }}>
      <text x="250" y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">Approximate CT Excitation Curve (Iexc vs Vsec)</text>

      {/* axes */}
      <line x1="60" y1="170" x2="460" y2="170" stroke="#3f3f46" strokeWidth="1.5" />
      <line x1="250" y1="20" x2="250" y2="320" stroke="#3f3f46" strokeWidth="1.5" />
      <text x="465" y="175" fill="#71717a" fontSize="10">Vsec (V)</text>
      <text x="260" y="25" fill="#71717a" fontSize="10">Iexc (mA)</text>

      {/* Excitation curve (nonlinear rise near knee) */}
      <path d="M100,280 C150,270 200,220 250,170 C280,145 310,90 340,65 C370,48 400,42 440,38" fill="none" stroke="#60a5fa" strokeWidth="2.5" />
      {/* return path */}
      <path d="M440,38 C400,42 370,48 340,65 C310,90 280,145 250,170 C200,220 150,270 100,280" fill="none" stroke="#60a5fa" strokeWidth="2.5" opacity="0.3" strokeDasharray="4 3" />

      {/* knee point */}
      <circle cx="320" cy="80" r="6" fill="#ef4444" />
      <line x1="320" y1="80" x2="370" y2="55" stroke="#ef4444" strokeWidth="1" />
      <text x="375" y="52" fill="#ef4444" fontSize="10" fontWeight="700">Knee Point (Vk)</text>
      <text x="375" y="66" fill="#a1a1aa" fontSize="8">Excitation current rises rapidly</text>

      {/* linear region */}
      <line x1="200" y1="200" x2="250" y2="170" stroke="#22c55e" strokeWidth="2" strokeDasharray="5 4" />
      <text x="145" y="215" fill="#22c55e" fontSize="9" fontWeight="600">Linear region</text>
      <text x="145" y="228" fill="#71717a" fontSize="8">(low magnetizing current)</text>

      {/* saturation region */}
      <rect x="330" y="30" width="120" height="30" rx="6" fill="rgba(239,68,68,0.08)" stroke="#ef4444" strokeDasharray="3 3" />
      <text x="390" y="50" textAnchor="middle" fill="#ef4444" fontSize="9">Saturation region</text>

      {/* annotation */}
      <text x="250" y="330" textAnchor="middle" fill="#52525b" fontSize="9">
        Conceptual curve for burden checks; not a material-specific B-H test plot
      </text>
    </svg>
  );
}

/* ── CT Equivalent Circuit Diagram ── */
function CTEquivalentCircuit() {
  return (
    <svg viewBox="0 0 660 220" style={{ width: '100%', maxWidth: 660, height: 'auto', margin: '18px 0' }}>
      <text x="330" y="16" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">CT Equivalent Circuit (Referred to Secondary)</text>

      {/* ideal transformer */}
      <rect x="100" y="50" width="80" height="100" rx="8" fill="#101015" stroke="#3f3f46" strokeWidth="2" />
      <ellipse cx="130" cy="100" rx="12" ry="30" fill="none" stroke="#60a5fa" strokeWidth="1.5" />
      <ellipse cx="160" cy="100" rx="12" ry="30" fill="none" stroke="#22c55e" strokeWidth="1.5" />
      <text x="140" y="165" textAnchor="middle" fill="#71717a" fontSize="8">N1:N2</text>

      {/* primary current source */}
      <line x1="30" y1="80" x2="100" y2="80" stroke="#60a5fa" strokeWidth="2" />
      <line x1="30" y1="120" x2="100" y2="120" stroke="#60a5fa" strokeWidth="2" />
      <text x="60" y="70" textAnchor="middle" fill="#60a5fa" fontSize="9">I_p / N</text>

      {/* secondary winding resistance Rct */}
      <line x1="180" y1="80" x2="230" y2="80" stroke="#22c55e" strokeWidth="2" />
      <rect x="230" y="70" width="50" height="20" rx="4" fill="#18181b" stroke="#f59e0b" />
      <text x="255" y="84" textAnchor="middle" fill="#f59e0b" fontSize="8">Rct</text>
      <text x="255" y="60" textAnchor="middle" fill="#71717a" fontSize="7">Winding R</text>

      {/* leakage reactance */}
      <line x1="280" y1="80" x2="310" y2="80" stroke="#22c55e" strokeWidth="2" />
      <path d="M310,80 Q315,65 320,80 Q325,95 330,80 Q335,65 340,80" fill="none" stroke="#a78bfa" strokeWidth="2" />
      <text x="325" y="60" textAnchor="middle" fill="#a78bfa" fontSize="7">X_leak</text>

      {/* magnetizing branch (parallel) */}
      <line x1="180" y1="80" x2="180" y2="120" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="200" y1="80" x2="200" y2="100" stroke="#3f3f46" strokeWidth="1" />
      {/* Xm */}
      <path d="M200,100 Q205,106 200,112 Q195,118 200,124 Q205,130 200,136" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
      <text x="215" y="120" fill="#22d3ee" fontSize="7">X_m</text>
      <line x1="200" y1="136" x2="200" y2="160" stroke="#3f3f46" strokeWidth="1" />
      <text x="200" y="175" textAnchor="middle" fill="#22d3ee" fontSize="7">I_mag</text>

      {/* burden */}
      <line x1="340" y1="80" x2="400" y2="80" stroke="#22c55e" strokeWidth="2" />
      <rect x="400" y="60" width="80" height="80" rx="8" fill="rgba(99,102,241,0.06)" stroke="#6366f1" strokeWidth="2" />
      <text x="440" y="95" textAnchor="middle" fill="#6366f1" fontSize="9" fontWeight="600">Burden</text>
      <text x="440" y="110" textAnchor="middle" fill="#6366f1" fontSize="8">Z_B</text>

      {/* return path */}
      <line x1="180" y1="120" x2="340" y2="120" stroke="#22c55e" strokeWidth="2" />
      <line x1="340" y1="120" x2="340" y2="80" stroke="#22c55e" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="440" y1="140" x2="440" y2="160" stroke="#22c55e" strokeWidth="2" />
      <line x1="180" y1="160" x2="440" y2="160" stroke="#22c55e" strokeWidth="2" />

      {/* current labels */}
      <text x="360" y="70" fill="#22c55e" fontSize="8">I_sec</text>

      {/* voltage across burden */}
      <text x="510" y="100" fill="#a1a1aa" fontSize="8">V_sec = I_sec * Z_B</text>
      <text x="330" y="200" textAnchor="middle" fill="#52525b" fontSize="9">Ratio error = I_mag / (I_p/N) — increases as core approaches saturation</text>
    </svg>
  );
}

/* ── CT Physical Connection Diagram ── */
function CTConnectionDiagram() {
  return (
    <svg viewBox="0 0 600 240" style={{ width: '100%', maxWidth: 600, height: 'auto', margin: '18px 0' }}>
      <text x="300" y="16" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">CT Physical Connections</text>

      {/* primary conductor (busbar) */}
      <line x1="40" y1="100" x2="560" y2="100" stroke="#60a5fa" strokeWidth="10" strokeLinecap="round" />
      <text x="300" y="80" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="600">Primary Conductor (I_p)</text>

      {/* CT core and secondary winding */}
      <rect x="200" y="60" width="200" height="80" rx="14" fill="#101015" stroke="#3f3f46" strokeWidth="2" />

      {/* toroidal core representation */}
      <ellipse cx="300" cy="100" rx="60" ry="25" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <text x="300" y="105" textAnchor="middle" fill="#f59e0b" fontSize="9">Core</text>

      {/* secondary winding turns */}
      {[250, 265, 280, 295, 310, 325, 340, 355].map((x, i) => (
        <ellipse key={i} cx={x} cy="100" rx="3" ry="18" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.5" />
      ))}
      <text x="300" y="135" textAnchor="middle" fill="#22c55e" fontSize="8">Secondary winding (N2 turns)</text>

      {/* secondary leads */}
      <line x1="240" y1="140" x2="240" y2="180" stroke="#22c55e" strokeWidth="2" />
      <line x1="360" y1="140" x2="360" y2="180" stroke="#22c55e" strokeWidth="2" />

      {/* burden box */}
      <rect x="250" y="175" width="100" height="35" rx="8" fill="rgba(99,102,241,0.06)" stroke="#6366f1" />
      <text x="300" y="197" textAnchor="middle" fill="#6366f1" fontSize="9" fontWeight="600">Burden (Relay)</text>
      <line x1="240" y1="192" x2="250" y2="192" stroke="#22c55e" strokeWidth="2" />
      <line x1="350" y1="192" x2="360" y2="192" stroke="#22c55e" strokeWidth="2" />

      {/* polarity markings */}
      <circle cx="200" cy="90" r="4" fill="#ef4444" />
      <text x="190" y="80" fill="#ef4444" fontSize="8">P1</text>
      <circle cx="400" cy="90" r="4" fill="#ef4444" />
      <text x="408" y="80" fill="#ef4444" fontSize="8">P2</text>
      <circle cx="240" cy="150" r="4" fill="#22c55e" />
      <text x="225" y="160" fill="#22c55e" fontSize="8">S1</text>
      <circle cx="360" cy="150" r="4" fill="#22c55e" />
      <text x="368" y="160" fill="#22c55e" fontSize="8">S2</text>

      {/* warning */}
      <text x="300" y="232" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="600">
        DANGER: Never open-circuit the secondary with primary energized
      </text>
    </svg>
  );
}

/* ── Burden Effect Illustration ── */
function BurdenEffectDiagram() {
  return (
    <svg viewBox="0 0 600 260" style={{ width: '100%', maxWidth: 600, height: 'auto', margin: '18px 0' }}>
      <text x="300" y="16" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">Effect of Burden on CT Accuracy</text>

      {/* axes */}
      <line x1="70" y1="220" x2="540" y2="220" stroke="#3f3f46" strokeWidth="1" />
      <line x1="70" y1="30" x2="70" y2="220" stroke="#3f3f46" strokeWidth="1" />
      <text x="550" y="225" fill="#71717a" fontSize="9">Burden (VA)</text>
      <text x="40" y="35" fill="#71717a" fontSize="9">Error %</text>

      {/* low burden curve - good accuracy */}
      <path d="M70,210 C150,208 250,200 350,180 C400,165 450,135 520,60" fill="none" stroke="#22c55e" strokeWidth="2" />
      <text x="530" y="55" fill="#22c55e" fontSize="9" fontWeight="600">High ALF CT</text>

      {/* high burden curve - worse accuracy */}
      <path d="M70,205 C150,195 200,175 280,140 C330,115 380,80 440,45" fill="none" stroke="#ef4444" strokeWidth="2" />
      <text x="450" y="40" fill="#ef4444" fontSize="9" fontWeight="600">Low ALF CT</text>

      {/* rated burden line */}
      <line x1="300" y1="30" x2="300" y2="220" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="300" y="245" textAnchor="middle" fill="#f59e0b" fontSize="9">Rated burden</text>

      {/* acceptable error region */}
      <rect x="70" y="180" width="230" height="40" rx="6" fill="rgba(34,197,94,0.06)" stroke="#22c55e" strokeDasharray="3 3" />
      <text x="185" y="200" textAnchor="middle" fill="#22c55e" fontSize="8">Acceptable error region</text>

      {/* class limit line */}
      <line x1="70" y1="180" x2="540" y2="180" stroke="#a78bfa" strokeWidth="1" strokeDasharray="3 3" />
      <text x="540" y="175" fill="#a78bfa" fontSize="8">Class limit</text>

      {/* burden VA scale */}
      {[5, 10, 15, 20, 25, 30].map((v, i) => (
        <text key={v} x={70 + i * 94} y="237" textAnchor="middle" fill="#52525b" fontSize="8">{v}</text>
      ))}

      {/* error scale */}
      {[0, 5, 10, 15, 20].map((v, i) => (
        <text key={v} x="55" y={220 - i * 47} textAnchor="end" fill="#52525b" fontSize="8">{v}</text>
      ))}
    </svg>
  );
}

/* ── Simulation Diagram ── */
function SimDiagram({ ptBurden, ct, pulse }) {
  const pt = ptData(ptBurden);
  const saturated = ct.saturationLikely;

  // generate excitation curve points (approximate, based on assumed model)
  const magPoints = [];
  for (let v = 0; v <= 500; v += 5) {
    const x = 80 + (v / 500) * 340;
    const iexc = clamp(6 * (Math.exp(v / 120) - 1), 0, 320);
    const y = 260 - (iexc / 320) * 180;
    magPoints.push(`${x},${y}`);
  }

  // operating point on the curve
  const opV = Math.min(ct.vsec, 500);
  const opIexc = clamp(6 * (Math.exp(opV / 120) - 1), 0, 320);
  const opX = 80 + (opV / 500) * 340;
  const opY = 260 - (opIexc / 320) * 180;
  const kneeIexc = clamp(6 * (Math.exp(ct.vk / 120) - 1), 0, 320);
  const kneeY = 260 - (kneeIexc / 320) * 180;

  // secondary current waveform
  const secPoints = [];
  const distortion = clamp((ct.vOverVk - 0.8) / 1.2, 0, 0.85);
  for (let t = 0; t <= 120; t++) {
    const x = 500 + t * 2.8;
    const angle = t * 0.25;
    const ideal = Math.sin(angle);
    const clipped = saturated
      ? Math.sign(ideal) * Math.min(Math.abs(ideal), 1 - distortion) + 0.08 * Math.sin(3 * angle)
      : ideal;
    const y = 160 - clipped * 58;
    secPoints.push(`${x},${y}`);
  }

  return (
    <svg viewBox="0 0 960 440" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      <defs>
        <filter id="ctglow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      <text x="480" y="22" textAnchor="middle" fill="#71717a" fontSize="12" fontWeight="700" letterSpacing="0.06em">
        CT/PT CHARACTERISTICS — ASSUMED NAMEPLATE MODEL (SIMPLIFIED)
      </text>

      {/* ── CT Magnetization Curve ── */}
      <rect x="40" y="40" width="400" height="240" rx="12" fill="#101015" stroke="#27272a" />
      <text x="240" y="60" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="700">CT Excitation Check (Approximate)</text>

      {/* axes */}
      <line x1="80" y1="260" x2="420" y2="260" stroke="#3f3f46" strokeWidth="1" />
      <line x1="80" y1="70" x2="80" y2="260" stroke="#3f3f46" strokeWidth="1" />
      <text x="425" y="265" fill="#52525b" fontSize="8">Vsec (V)</text>
      <text x="60" y="75" fill="#52525b" fontSize="8">Iexc</text>

      {/* magnetization curve */}
      <polyline points={magPoints.join(' ')} fill="none" stroke="#60a5fa" strokeWidth="2.5" />

      {/* knee point */}
      <circle cx={80 + (ct.vk / 500) * 340} cy={kneeY} r="6" fill="#ef4444" filter="url(#ctglow)" />
      <line x1={80 + (ct.vk / 500) * 340} y1={kneeY} x2={80 + (ct.vk / 500) * 340 + 40} y2={kneeY - 20} stroke="#ef4444" strokeWidth="1" />
      <text x={80 + (ct.vk / 500) * 340 + 45} y={kneeY - 22} fill="#ef4444" fontSize="9" fontWeight="700">Knee Point</text>
      <text x={80 + (ct.vk / 500) * 340 + 45} y={kneeY - 10} fill="#ef4444" fontSize="8">Vk = {ct.vk} V</text>

      {/* Vk horizontal line */}
      <line x1={80 + (ct.vk / 500) * 340} y1="80" x2={80 + (ct.vk / 500) * 340} y2="260" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />

      {/* operating point */}
      <circle cx={opX} cy={opY} r={saturated ? (pulse ? 8 : 6) : 5} fill={saturated ? '#ef4444' : '#22c55e'} filter="url(#ctglow)" />
      <text x={opX + 12} y={opY - 5} fill={saturated ? '#ef4444' : '#22c55e'} fontSize="9" fontWeight="600">
        {saturated ? 'SATURATED' : 'Normal'}
      </text>
      <text x={opX + 12} y={opY + 8} fill="#a1a1aa" fontSize="8">Vsec = {ct.vsec.toFixed(1)} V | Iexc = {ct.excitationCurrentmA.toFixed(0)} mA</text>

      {/* Vsec operating line */}
      <line x1={opX} y1="80" x2={opX} y2="260" stroke={saturated ? '#ef4444' : '#22c55e'} strokeWidth="1" strokeDasharray="5 4" />

      {/* linear region label */}
      <rect x="90" y="210" width="70" height="18" rx="4" fill="rgba(34,197,94,0.1)" />
      <text x="125" y="223" textAnchor="middle" fill="#22c55e" fontSize="8">Linear</text>

      {/* saturation region label */}
      <rect x="320" y="80" width="80" height="18" rx="4" fill="rgba(239,68,68,0.1)" />
      <text x="360" y="93" textAnchor="middle" fill="#ef4444" fontSize="8">Saturated</text>

      {/* ── Secondary current waveform (with saturation effect) ── */}
      <rect x="480" y="40" width="440" height="200" rx="12" fill="#101015" stroke="#27272a" />
      <text x="700" y="60" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700">
        Secondary Current Waveform {saturated ? '(Saturated)' : '(Normal)'}
      </text>

      {/* axes */}
      <line x1="500" y1="160" x2="900" y2="160" stroke="#3f3f46" strokeWidth="0.5" />
      <line x1="500" y1="70" x2="500" y2="230" stroke="#3f3f46" strokeWidth="0.5" />

      {/* ideal sinusoidal (reference) */}
      <polyline points={Array.from({ length: 120 }, (_, t) => {
        const x = 500 + t * 2.8;
        const y = 160 - Math.sin(t * 0.25) * 60;
        return `${x},${y}`;
      }).join(' ')} fill="none" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3 3" />
      <text x="880" y="80" fill="#3f3f46" fontSize="8">Ideal</text>

      {/* actual secondary current */}
      <polyline points={secPoints.join(' ')} fill="none" stroke={saturated ? '#ef4444' : '#22c55e'} strokeWidth="2" />
      <text x="880" y="95" fill={saturated ? '#ef4444' : '#22c55e'} fontSize="8" fontWeight="600">Actual</text>

      {saturated && (
        <text x="700" y="228" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="600">
          Waveform distorted due to CT saturation — flat-topped peaks
        </text>
      )}

      {/* ── PT / VT section ── */}
      <rect x="480" y="260" width="440" height="140" rx="12" fill="#101015" stroke="#27272a" />
      <text x="700" y="280" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="700">PT / VT Burden Analysis</text>

      <text x="510" y="305" fill="#a1a1aa" fontSize="11">Secondary burden = <tspan fill="#c4b5fd" fontWeight="600">{ptBurden.toFixed(0)} VA</tspan></text>
      <text x="510" y="328" fill="#a1a1aa" fontSize="11">Burden loading = <tspan fill={pt.withinRatedBurden ? '#22c55e' : '#ef4444'} fontWeight="600">{pt.utilizationPct.toFixed(0)}%</tspan> of rated</text>
      <text x="510" y="351" fill="#a1a1aa" fontSize="11">Estimated ratio error (load effect) = <tspan fill="#c4b5fd" fontWeight="600">{pt.ratioErrorEstimatePct.toFixed(2)}%</tspan></text>
      <text x="510" y="374" fill="#a1a1aa" fontSize="11">Estimated phase displacement = <tspan fill="#c4b5fd" fontWeight="600">{pt.phaseDisplacementMin.toFixed(1)} min</tspan></text>

      {/* PT nameplate indicator */}
      <rect x="760" y="295" width="150" height="86" rx="8" fill={pt.withinRatedBurden ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'} stroke={pt.withinRatedBurden ? '#22c55e' : '#ef4444'} />
      <text x="835" y="317" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="700">Nameplate Class {pt.nameplateClass}</text>
      <text x="835" y="337" textAnchor="middle" fill="#a1a1aa" fontSize="8">110 V secondary, 100 VA</text>
      <text x="835" y="352" textAnchor="middle" fill="#a1a1aa" fontSize="8">Status: {pt.withinRatedBurden ? 'Within rated burden' : 'Overburdened'}</text>
      <text x="835" y="367" textAnchor="middle" fill="#71717a" fontSize="8">Ferroresonance is system-dependent</text>

      {/* ── CT connection schematic (bottom left) ── */}
      <rect x="40" y="300" width="400" height="105" rx="12" fill="#101015" stroke="#27272a" />
      <text x="240" y="320" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="700">CT Operating Status</text>

      {/* status indicators */}
      <circle cx="80" cy="350" r="8" fill={saturated ? '#ef4444' : '#22c55e'} filter="url(#ctglow)">
        {saturated && <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />}
      </circle>
      <text x="95" y="354" fill={saturated ? '#ef4444' : '#22c55e'} fontSize="11" fontWeight="600">
        {saturated ? 'CT near/into saturation - protection margin reduced' : 'CT in linear operating region'}
      </text>

      <text x="80" y="380" fill="#a1a1aa" fontSize="10">
        Operating V/Vk ratio: <tspan fill={saturated ? '#ef4444' : '#22c55e'} fontWeight="600">{ct.vOverVk.toFixed(2)}</tspan>
        {' '} | Effective ALF: <tspan fill="#c4b5fd" fontWeight="600">{ct.effectiveAlf.toFixed(1)}x</tspan>
      </text>
      <text x="80" y="395" fill="#a1a1aa" fontSize="10">
        Required multiple at selected current: <tspan fill="#c4b5fd" fontWeight="600">{ct.requiredMultiple.toFixed(2)}x</tspan>
        {' '} (assumed CT 2000/1A, Vk 400V, Rct 4ohm, rated burden 15VA, ALF 20)
      </text>
    </svg>
  );
}

/* ── CT Saturation Waveform SVG ── */
function CTSaturationWaveformSVG() {
  return (
    <svg viewBox="0 0 600 320" style={{ width: '100%', maxWidth: 600, height: 'auto', margin: '18px 0' }}>
      <text x="300" y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700">CT Saturation (Conceptual) - Secondary Waveform Distortion</text>

      {/* primary current waveform (ideal) */}
      <rect x="30" y="35" width="540" height="120" rx="10" fill="#101015" stroke="#27272a" />
      <text x="50" y="52" fill="#60a5fa" fontSize="9" fontWeight="600">Primary Current (ideal sinusoidal)</text>
      <line x1="50" y1="95" x2="550" y2="95" stroke="#3f3f46" strokeWidth="0.5" />
      <polyline points={Array.from({ length: 200 }, (_, t) => {
        const x = 50 + t * 2.5;
        const y = 95 - Math.sin(t * 0.063) * 35;
        return `${x},${y}`;
      }).join(' ')} fill="none" stroke="#60a5fa" strokeWidth="2" />
      <text x="555" y="98" fill="#60a5fa" fontSize="8">I_p</text>

      {/* secondary current waveform (saturated) */}
      <rect x="30" y="170" width="540" height="130" rx="10" fill="#101015" stroke="#27272a" />
      <text x="50" y="187" fill="#ef4444" fontSize="9" fontWeight="600">Secondary Current (with CT saturation + DC offset)</text>
      <line x1="50" y1="235" x2="550" y2="235" stroke="#3f3f46" strokeWidth="0.5" />

      {/* saturated waveform: first half cycle reproduces, then collapses due to flux saturation */}
      <polyline points={Array.from({ length: 200 }, (_, t) => {
        const x = 50 + t * 2.5;
        const angle = t * 0.063;
        const cycle = Math.floor(t / 50);
        const pos = (t % 50) / 50;
        const dcOffset = Math.exp(-t / 80);
        const ideal = Math.sin(angle);
        // saturation clipping in positive half with DC offset
        let saturated;
        if (ideal + dcOffset > 0.8) {
          // clips the positive peaks progressively
          const clipFactor = Math.max(0, 1 - (ideal + dcOffset - 0.8) * 2.5);
          saturated = ideal * clipFactor;
        } else {
          saturated = ideal;
        }
        // after first cycle, severe saturation causes near-zero output for part of cycle
        if (cycle >= 1 && ideal > 0.3 && dcOffset > 0.2) {
          saturated = ideal * Math.max(0.05, 1 - dcOffset * 1.5);
        }
        const y = 235 - saturated * 35;
        return `${x},${y}`;
      }).join(' ')} fill="none" stroke="#ef4444" strokeWidth="2" />

      {/* ideal reference (dashed) */}
      <polyline points={Array.from({ length: 200 }, (_, t) => {
        const x = 50 + t * 2.5;
        const y = 235 - Math.sin(t * 0.063) * 35;
        return `${x},${y}`;
      }).join(' ')} fill="none" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3 3" />
      <text x="555" y="238" fill="#ef4444" fontSize="8">I_s</text>

      {/* saturation onset annotation */}
      <line x1="150" y1="195" x2="150" y2="270" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
      <text x="155" y="280" fill="#f59e0b" fontSize="8">Saturation onset</text>

      {/* flat-top annotation */}
      <path d="M180,200 L220,200" fill="none" stroke="#ef4444" strokeWidth="1" />
      <text x="230" y="203" fill="#ef4444" fontSize="7">Flat-topped (clipped)</text>

      {/* DC offset envelope */}
      <path d={`M50,235 ${Array.from({ length: 200 }, (_, t) => {
        const x = 50 + t * 2.5;
        const dc = Math.exp(-t / 80) * 35;
        return `L${x},${235 - dc}`;
      }).join(' ')}`} fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" />
      <text x="100" y="195" fill="#f59e0b" fontSize="8">DC offset decay</text>

      <text x="300" y="312" textAnchor="middle" fill="#52525b" fontSize="9">DC offset in fault current causes asymmetric flux, leading to CT core saturation</text>
    </svg>
  );
}

/* ── Saturation Warning Badge ── */
function SaturationWarningBadge({ ct }) {
  const saturated = ct.saturationLikely;
  const ratio = ct.vOverVk;
  let color, bg, label;
  if (saturated) {
    color = '#ef4444'; bg = 'rgba(239,68,68,0.12)'; label = 'CT SATURATED';
  } else if (ratio > 0.8) {
    color = '#f59e0b'; bg = 'rgba(245,158,11,0.12)'; label = 'NEAR SATURATION';
  } else {
    color = '#22c55e'; bg = 'rgba(34,197,94,0.12)'; label = 'CT NORMAL';
  }
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: bg, border: `1px solid ${color}`, borderRadius: 8, marginRight: 12 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: 10, color: '#71717a' }}>V/Vk = {ratio.toFixed(2)} | est error = {ct.ratioErrorPct.toFixed(1)}%</span>
    </div>
  );
}

/* ── Theory Tab ── */
function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>CT and PT Characteristics</h2>
      <p style={S.p}>
        Current transformers (CTs) and potential transformers (PTs/VTs) are the measurement interface between
        primary equipment and protection relays. CTs must reproduce current without saturating during the fault
        levels relevant to protection, while PTs must reproduce voltage accurately and remain stable under
        network transients.
      </p>

      <h3 style={S.h3}>Approximate Excitation Characteristic</h3>
      <p style={S.p}>
        The simulation uses an assumed protection CT nameplate (2000/1 A, Vk 400 V, secondary winding
        resistance 4 ohm, rated burden 15 VA, ALF 20). It checks operating Vsec against Vk and an approximate
        excitation curve to indicate when magnetizing current rises sharply and ratio accuracy degrades.
        This is a screening model for protection studies, not a factory excitation-test replacement.
      </p>
      <MagnetizationCurve />
      <span style={S.eq}>Isec = Iprimary / CT ratio,   Vsec = Isec x (Rct + Zburden)</span>

      <h3 style={S.h3}>CT Equivalent Circuit</h3>
      <p style={S.p}>
        The CT equivalent circuit (referred to secondary) consists of an ideal transformer, the secondary
        winding resistance (Rct), leakage reactance, and a parallel magnetizing branch. The magnetizing
        current is the error current — it flows through the core magnetizing impedance rather than through
        the burden. When the core saturates, the magnetizing impedance drops and error increases.
      </p>
      <CTEquivalentCircuit />
      <span style={S.eq}>V_sec = I_sec * (Z_burden + Z_ct_secondary)</span>
      <span style={S.eq}>Estimated error rises as Vsec/Vk approaches 1 and as required multiple exceeds effective ALF</span>

      <h3 style={S.h3}>CT Physical Connections</h3>
      <p style={S.p}>
        The primary conductor passes through (or forms) the primary winding. The secondary winding of many
        turns surrounds the toroidal core. Polarity marks (P1/S1) define the direction convention. The
        secondary must always have a closed circuit path — open-circuiting with primary energized develops
        dangerous voltage across the secondary terminals.
      </p>
      <CTConnectionDiagram />

      <h3 style={S.h3}>Effect of Burden on Accuracy</h3>
      <p style={S.p}>
        Higher burden increases the secondary voltage required, pushing the CT operating point closer to or
        beyond the knee point. Protection CTs are specified with an Accuracy Limit Factor (ALF) at rated
        burden. If the actual burden is lower than rated, the effective ALF improves proportionally.
      </p>
      <BurdenEffectDiagram />
      <span style={S.eq}>Effective ALF = Rated ALF * (Rated burden + Rct) / (Actual burden + Rct)</span>

      <h3 style={S.h3}>CT Saturation Waveform Distortion</h3>
      <p style={S.p}>
        When a CT saturates, the secondary current waveform becomes severely distorted. During fault conditions
        with a DC offset component (asymmetric fault current), the unidirectional flux drives the core into
        saturation within the first few cycles. The secondary current collapses to near zero during the
        saturated portion of each half-cycle, producing flat-topped or severely clipped waveforms. This
        distortion can cause protection relays to under-reach, over-reach, or fail to operate correctly.
        Differential relays are particularly vulnerable to CT saturation causing false differential current.
      </p>
      <CTSaturationWaveformSVG />
      <span style={S.eq}>Flux = integral(V_sec) dt — DC offset adds unidirectional flux that saturates the core</span>
      <span style={S.eq}>Saturation onset timing depends on remanence, X/R, burden resistance, point-on-wave, and core design</span>

      <h3 style={S.h3}>PT / VT Burden Interpretation</h3>
      <p style={S.p}>
        PT/VT output in this simulation uses an assumed 110 V, 100 VA, class 0.5 nameplate and reports
        burden loading plus indicative ratio/phase error growth with loading. The model does not estimate
        ferroresonance probability from burden alone, because ferroresonance depends on network capacitance,
        switching conditions, grounding, and VT type.
      </p>
      <span style={S.eq}>PT burden loading (%) = (Actual burden VA / Rated burden VA) x 100</span>

      <h3 style={S.h3}>CT Specification Classes</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Class</th>
            <th style={S.th}>Application</th>
            <th style={S.th}>Key Specification</th>
            <th style={S.th}>Error at ALF</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['5P20', 'Overcurrent protection', 'Composite error 5% at 20x rated', '5%'],
            ['10P10', 'Backup OC protection', 'Composite error 10% at 10x rated', '10%'],
            ['PS class', 'Differential protection', 'Vk, Rct, I_exc at Vk/2 specified', 'Per Vk spec'],
            ['Class 0.5', 'Metering', 'Ratio error 0.5% from 25% to 120% In', '0.5%'],
            ['Class 0.2S', 'Revenue metering', 'Accuracy from 1% to 120% In', '0.2%'],
          ].map(([a, b, c, d]) => (
            <tr key={a}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{a}</td>
              <td style={S.td}>{b}</td>
              <td style={S.td}>{c}</td>
              <td style={S.td}>{d}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.ctx}>
        <span style={S.ctxT}>Indian Utility Practice</span>
        <p style={S.ctxP}>
          Protection CTs in India are commonly specified as 5P20, 10P10, or PS class with knee-point voltage
          and winding resistance per IS 2705 / IEC 61869. PT secondaries are standardized at 110V / sqrt(3)
          for phase-to-neutral. CTs must never be open-circuited on the secondary because dangerous
          voltage can develop. Revenue metering CTs use Class 0.2S per IS 16227.
        </p>
      </div>

      <h2 style={S.h2}>References</h2>
      <ul style={S.ul}>
        <li style={S.li}>IS 2705 / IEC 61869 — Instrument Transformer Standards</li>
        <li style={S.li}>IEEE C57.13 — Standard Requirements for Instrument Transformers</li>
        <li style={S.li}>Y.G. Paithankar — <em>Fundamentals of Power System Protection</em></li>
        <li style={S.li}>CBIP Manual on CT and PT Selection for Protection</li>
      </ul>
    </div>
  );
}

export default function CtPtCharacteristics() {
  const [tab, setTab] = useState('simulate');
  const [primary, setPrimary] = useState(1200);
  const [burden, setBurden] = useState(10);
  const [ptBurden, setPtBurden] = useState(50);
  const pulse = useAnimationPulse(800);
  const ct = useMemo(() => ctData(primary, burden), [primary, burden]);
  const pt = useMemo(() => ptData(ptBurden), [ptBurden]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>
      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' }}>
            <SaturationWarningBadge ct={ct} />
          </div>
          <div style={S.svgWrap}>
            <SimDiagram ptBurden={ptBurden} ct={ct} pulse={pulse} />
          </div>
          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>CT primary current</span>
              <input style={S.slider} type="range" min="100" max="3000" step="50" value={primary} onChange={(e) => setPrimary(Number(e.target.value))} />
              <span style={S.val}>{primary.toFixed(0)} A</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>CT burden</span>
              <input style={S.slider} type="range" min="2" max="30" step="1" value={burden} onChange={(e) => setBurden(Number(e.target.value))} />
              <span style={S.val}>{burden.toFixed(0)} VA</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>PT burden</span>
              <input style={S.slider} type="range" min="5" max="100" step="1" value={ptBurden} onChange={(e) => setPtBurden(Number(e.target.value))} />
              <span style={S.val}>{ptBurden.toFixed(0)} VA</span>
            </div>
          </div>
          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Knee point</span>
              <span style={S.rv}>{ct.vk.toFixed(0)} V</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Operating voltage</span>
              <span style={{ ...S.rv, color: ct.saturationLikely ? '#ef4444' : '#22c55e' }}>{ct.vsec.toFixed(1)} V</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>CT ratio error (est)</span>
              <span style={{ ...S.rv, color: ct.ratioErrorPct > 5 ? '#ef4444' : ct.ratioErrorPct > 2 ? '#f59e0b' : '#22c55e' }}>{ct.ratioErrorPct.toFixed(2)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Saturation status</span>
              <span style={{ ...S.rv, color: ct.saturationLikely ? '#ef4444' : '#22c55e' }}>
                {ct.saturationLikely ? 'SATURATED' : 'Normal'}
              </span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>PT burden loading</span>
              <span style={{ ...S.rv, color: pt.withinRatedBurden ? '#22c55e' : '#ef4444' }}>{pt.utilizationPct.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
