import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

const C = {
  bg:'#09090b', surface:'#111114', surfaceAlt:'#18181b',
  border:'#1e1e2e', borderLight:'#27272a',
  accent:'#6366f1', accentLight:'#818cf8', accentGlow:'rgba(99,102,241,0.12)',
  text:'#e4e4e7', muted:'#a1a1aa', dim:'#71717a', faint:'#52525b',
  mono:'#c4b5fd', green:'#22c55e', red:'#ef4444', amber:'#f59e0b', cyan:'#22d3ee',
  pink:'#ec4899', teal:'#14b8a6', orange:'#f97316', violet:'#8b5cf6',
};

const S = {
  container: {
    display:'flex', flexDirection:'column', minHeight:'calc(100vh - 3.5rem)',
    background:C.bg, fontFamily:'Inter,system-ui,sans-serif', color:C.text,
  },
  modeBar: {
    display:'flex', gap:4, padding:'10px 16px', background:'#0a0a0f',
    borderBottom:`1px solid ${C.border}`, flexShrink:0, flexWrap:'wrap',
  },
  modeTab: a => ({
    padding:'8px 20px', borderRadius:10, border:'none',
    background:a ? C.accent : 'transparent', color:a ? '#fff' : C.dim,
    fontSize:14, fontWeight:600, cursor:'pointer', transition:'all .15s',
  }),
  topicTab: a => ({
    padding:'6px 12px', borderRadius:8, border:'none',
    background:a ? C.surfaceAlt : 'transparent', color:a ? C.accentLight : C.faint,
    fontSize:11.5, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap',
    transition:'all .15s',
  }),
  body: { flex:1, display:'flex', flexDirection:'column', overflowY:'auto' },
  section: {
    padding:'18px 22px', flex:1, display:'flex', flexDirection:'column', gap:14,
  },
  svgWrap: {
    display:'flex', justifyContent:'center', alignItems:'center',
    minHeight:260, padding:'4px 0',
  },
  controls: {
    padding:'12px 22px', background:C.surface, borderTop:`1px solid ${C.border}`,
    display:'flex', flexWrap:'wrap', gap:16, alignItems:'center',
  },
  eq: {
    display:'block', padding:'10px 16px', background:C.surfaceAlt,
    border:`1px solid ${C.borderLight}`, borderRadius:10,
    fontFamily:'monospace', fontSize:14, color:C.mono,
    margin:'8px 0', textAlign:'center', lineHeight:1.7,
  },
  note: {
    padding:'12px 16px', background:C.accentGlow,
    borderLeft:`3px solid ${C.accent}`, borderRadius:'0 10px 10px 0',
    margin:'6px 0',
  },
  noteT: {
    fontWeight:700, color:C.accentLight, fontSize:12, marginBottom:4,
    display:'block', textTransform:'uppercase', letterSpacing:'0.04em',
  },
  noteP: { fontSize:13, lineHeight:1.65, color:C.muted, margin:0 },
  title: { fontSize:17, fontWeight:700, color:C.text, margin:'0 0 2px' },
  sub: { fontSize:12.5, color:C.dim, margin:0, lineHeight:1.5 },
};

const tabs = [
  'Types of Data', 'Population vs Sample', 'Sampling Methods',
  'Bias + Confounding', 'Observational vs Experiment',
];

const dataItems = [
  { name:'Eye Color', values:['Brown','Blue','Green'], type:'nominal', cat:'Categorical' },
  { name:'Zip Code', values:['90210','10001','60601'], type:'nominal', cat:'Categorical' },
  { name:'Satisfaction', values:['Low','Med','High'], type:'ordinal', cat:'Categorical' },
  { name:'Education Level', values:['HS','BA','PhD'], type:'ordinal', cat:'Categorical' },
  { name:'Shoe Size', values:[8,9,10,11], type:'discrete', cat:'Numerical' },
  { name:'# of Siblings', values:[0,1,2,3], type:'discrete', cat:'Numerical' },
  { name:'Height (cm)', values:[162.3,175.8,180.1], type:'continuous', cat:'Numerical' },
  { name:'Body Temp (°C)', values:[36.6,37.1,38.2], type:'continuous', cat:'Numerical' },
];

const typeColors = {
  nominal: C.pink, ordinal: C.amber, discrete: C.cyan, continuous: C.green,
};

const typeDesc = {
  nominal: 'Labels with no inherent order. Only mode is a meaningful summary.',
  ordinal: 'Categories with a natural order, but gaps between levels are not uniform.',
  discrete: 'Countable whole numbers. Mean, median, and mode all apply.',
  continuous: 'Measurements on a continuous scale. All summary statistics apply.',
};

function seededRand(s) {
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

const Note = ({ color, label, children }) => (
  <div style={{ ...S.note, borderLeftColor: color || C.accent }}>
    <span style={{ ...S.noteT, color: color || C.accentLight }}>{label}</span>
    <p style={S.noteP}>{children}</p>
  </div>
);

const Btn = ({ active, color, onClick, children }) => (
  <button onClick={onClick} style={{
    padding:'8px 16px', borderRadius:8, border:'none', fontSize:13,
    fontWeight:600, cursor:'pointer', transition:'all .15s',
    background: active ? (color || C.accent) : C.surface,
    color: active ? '#fff' : C.dim,
  }}>{children}</button>
);

/* ── Tab 1: Types of Data ── */
function TypesOfData() {
  const [sel, setSel] = useState(null);
  const item = sel !== null ? dataItems[sel] : null;
  const stats = item
    ? item.cat === 'Numerical'
      ? 'Mean, Median, Std Dev, Range'
      : item.type === 'ordinal' ? 'Mode, Median' : 'Mode only'
    : '';

  return <>
    <p style={S.sub}>
      Click a variable below to classify it and see which summary statistics apply.
    </p>

    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
      {dataItems.map((d, i) => (
        <button key={i} onClick={() => setSel(i)} style={{
          padding:'8px 14px', borderRadius:8,
          border:`1px solid ${sel === i ? typeColors[d.type] : C.border}`,
          background: sel === i ? C.surfaceAlt : C.surface,
          color: sel === i ? typeColors[d.type] : C.muted,
          fontSize:13, cursor:'pointer', fontWeight: sel === i ? 700 : 500,
        }}>{d.name}</button>
      ))}
    </div>

    {item && (
      <div style={{ ...S.eq, textAlign:'left' }}>
        <span style={{ color:typeColors[item.type], fontWeight:700, fontSize:15 }}>
          {item.cat} / {item.type}
        </span><br />
        <span style={{ color:C.dim, fontSize:12 }}>
          Example values: {item.values.join(', ')}
        </span><br />
        <span style={{ color:C.muted, fontSize:12 }}>
          Valid statistics: {stats}
        </span><br />
        <span style={{ color:C.faint, fontSize:11, fontStyle:'italic' }}>
          {typeDesc[item.type]}
        </span>
      </div>
    )}

    <div style={S.svgWrap}>
      <svg viewBox="0 0 400 200" width="100%" style={{ maxWidth:440 }}>
        {/* Categorical side */}
        <rect x={10} y={10} width={185} height={180} rx={8}
          fill={C.surfaceAlt} stroke={C.border} />
        <text x={102} y={35} textAnchor="middle"
          fill={C.text} fontSize={13} fontWeight={700}>Categorical</text>

        <rect x={25} y={48} width={155} height={55} rx={6}
          fill="none" stroke={C.pink} strokeDasharray="4" />
        <text x={102} y={70} textAnchor="middle"
          fill={C.pink} fontSize={11}>Nominal</text>
        <text x={102} y={90} textAnchor="middle"
          fill={C.dim} fontSize={9}>No order (colors, blood type)</text>

        <rect x={25} y={112} width={155} height={55} rx={6}
          fill="none" stroke={C.amber} strokeDasharray="4" />
        <text x={102} y={134} textAnchor="middle"
          fill={C.amber} fontSize={11}>Ordinal</text>
        <text x={102} y={154} textAnchor="middle"
          fill={C.dim} fontSize={9}>Has order (rankings, Likert)</text>

        {/* Numerical side */}
        <rect x={205} y={10} width={185} height={180} rx={8}
          fill={C.surfaceAlt} stroke={C.border} />
        <text x={297} y={35} textAnchor="middle"
          fill={C.text} fontSize={13} fontWeight={700}>Numerical</text>

        <rect x={220} y={48} width={155} height={55} rx={6}
          fill="none" stroke={C.cyan} strokeDasharray="4" />
        <text x={297} y={70} textAnchor="middle"
          fill={C.cyan} fontSize={11}>Discrete</text>
        <text x={297} y={90} textAnchor="middle"
          fill={C.dim} fontSize={9}>Countable (# pets, dice roll)</text>

        <rect x={220} y={112} width={155} height={55} rx={6}
          fill="none" stroke={C.green} strokeDasharray="4" />
        <text x={297} y={134} textAnchor="middle"
          fill={C.green} fontSize={11}>Continuous</text>
        <text x={297} y={154} textAnchor="middle"
          fill={C.dim} fontSize={9}>Measurable (weight, time)</text>
      </svg>
    </div>

    <Note color={C.red} label="Common Mistake">
      ZIP codes, phone numbers, and jersey numbers look numeric but are categorical
      (nominal). Averaging them is meaningless. Ask yourself: does arithmetic on
      these values produce something interpretable?
    </Note>
    <Note color={C.teal} label="Practical Insight">
      Data type determines every downstream choice: bar chart vs histogram,
      chi-square test vs t-test, mode vs mean. Misclassifying a variable
      invalidates the entire analysis.
    </Note>
  </>;
}

/* ── Tab 2: Population vs Sample ── */
function PopVsSample() {
  const [n, setN] = useState(20);
  const rand = useMemo(() => seededRand(42), []);
  const pop = useMemo(() => Array.from({ length:200 }, () => ({
    x: rand() * 360 + 20, y: rand() * 200 + 20, v: rand() * 100,
  })), [rand]);

  const sample = useMemo(() => {
    const r = seededRand(n * 7 + 1);
    const s = new Set();
    while (s.size < n) s.add(Math.floor(r() * 200));
    return [...s];
  }, [n]);

  const mu = (pop.reduce((s, p) => s + p.v, 0) / 200).toFixed(1);
  const xbar = (sample.reduce((s, i) => s + pop[i].v, 0) / n).toFixed(1);
  const diff = Math.abs(mu - xbar).toFixed(1);

  return <>
    <p style={S.sub}>
      Drag the slider to adjust sample size. Watch the sample mean converge
      toward the population mean as n grows.
    </p>

    <div style={S.svgWrap}>
      <svg viewBox="0 0 400 240" width="100%" style={{ maxWidth:440 }}>
        {pop.map((p, i) => {
          const inS = sample.includes(i);
          return <circle key={i} cx={p.x} cy={p.y} r={inS ? 5 : 3}
            fill={inS ? C.accent : C.faint} opacity={inS ? 1 : 0.3} />;
        })}
        <text x={200} y={235} textAnchor="middle" fill={C.dim} fontSize={11}>
          Population N=200 (faint) | Sample n={n} (bright)
        </text>
      </svg>
    </div>

    <div style={S.controls}>
      <label style={{ fontSize:12, color:C.dim }}>
        Sample size: <b style={{ color:C.text }}>{n}</b>
      </label>
      <input type="range" min={5} max={100} value={n}
        onChange={e => setN(+e.target.value)}
        style={{ flex:1, maxWidth:220, accentColor:C.accent }} />
    </div>

    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
      <span style={{ ...S.eq, flex:1, minWidth:120 }}>
        Population mean (μ) = <span style={{ color:C.green }}>{mu}</span>
      </span>
      <span style={{ ...S.eq, flex:1, minWidth:120 }}>
        Sample mean (x̄) = <span style={{ color:C.accent }}>{xbar}</span>
      </span>
      <span style={{ ...S.eq, flex:1, minWidth:120 }}>
        |μ − x̄| = <span style={{ color:diff < 5 ? C.green : C.amber }}>{diff}</span>
      </span>
    </div>

    <span style={S.eq}>
      μ = population parameter | x̄ = sample statistic | As n → N, x̄ → μ
    </span>

    <Note label="Common Mistake">
      Confusing parameters (Greek letters: μ, σ — describe the population)
      with statistics (Latin letters: x̄, s — computed from the sample).
      A statistic estimates a parameter; it is not the parameter itself.
    </Note>
    <Note color={C.teal} label="Practical Insight">
      We almost never know the true population parameter. The entire field of
      inferential statistics exists to quantify how confident we can be in
      sample-based estimates.
    </Note>
  </>;
}

/* ── Tab 3: Sampling Methods ── */
function SamplingMethods() {
  const methods = ['Simple Random', 'Stratified', 'Cluster', 'Systematic'];
  const [m, setM] = useState(0);
  const strataColors = [C.pink, C.cyan, C.amber, C.green];

  const grid = useMemo(() => Array.from({ length:100 }, (_, i) => ({
    x: (i % 10) * 36 + 30, y: Math.floor(i / 10) * 22 + 20,
    g: Math.floor(i / 25), c: strataColors[Math.floor(i / 25)],
  })), []);

  const sel = useMemo(() => {
    const r = seededRand(m * 13 + 5);
    const s = new Set();
    if (m === 0) {
      while (s.size < 15) s.add(Math.floor(r() * 100));
    } else if (m === 1) {
      for (let g = 0; g < 4; g++) {
        const p = new Set();
        while (p.size < 4) p.add(g * 25 + Math.floor(r() * 25));
        p.forEach(v => s.add(v));
      }
    } else if (m === 2) {
      const cg = Math.floor(r() * 4);
      for (let i = cg * 25; i < cg * 25 + 25; i++) s.add(i);
    } else {
      const st = Math.floor(r() * 7);
      for (let i = st; i < 100; i += 7) s.add(i);
    }
    return s;
  }, [m]);

  const desc = [
    'Every individual has an equal probability of selection — like drawing names from a hat.',
    'Divide the population into strata (subgroups), then randomly sample from each stratum.',
    'Randomly select entire clusters (natural groupings like classrooms or city blocks).',
    'Select every k-th individual from an ordered list after a random starting point.',
  ];
  const theory = [
    'P(selected) = n / N — equal probability for every individual',
    'Sample from each stratum: guarantees representation of all subgroups',
    'Entire cluster chosen at random — cost-effective when groups are geographically spread',
    'k = N / n — pick every k-th element after a random start',
  ];

  return <>
    <p style={S.sub}>{desc[m]}</p>

    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
      {methods.map((name, i) => (
        <button key={i} onClick={() => setM(i)}
          style={S.topicTab(m === i)}>{name}</button>
      ))}
    </div>

    <div style={S.svgWrap}>
      <svg viewBox="0 0 400 250" width="100%" style={{ maxWidth:440 }}>
        {grid.map((g, i) => (
          <rect key={i} x={g.x} y={g.y} width={28} height={16} rx={3}
            fill={sel.has(i) ? g.c : C.surfaceAlt}
            stroke={sel.has(i) ? '#fff' : C.border}
            strokeWidth={sel.has(i) ? 1.5 : 0.5}
            opacity={sel.has(i) ? 1 : 0.35} />
        ))}
        <text x={200} y={245} textAnchor="middle" fill={C.dim} fontSize={10}>
          4 strata shown by color | {sel.size} items selected
        </text>
      </svg>
    </div>

    <span style={S.eq}>{theory[m]}</span>

    <Note color={C.red} label="Common Mistake">
      Convenience sampling (surveying only your friends or visitors at one
      location) almost always produces biased results. Every proper method
      above uses randomness to reduce selection bias.
    </Note>
    <Note color={C.teal} label="Practical Insight">
      Stratified sampling ensures minority groups are adequately represented.
      Cluster sampling reduces travel cost when the population is geographically
      dispersed. The right method depends on logistics, budget, and goals.
    </Note>
  </>;
}

/* ── Tab 4: Bias + Confounding ── */
function BiasConfounding() {
  const [temp, setTemp] = useState(75);
  const [show, setShow] = useState(false);

  const ice = ((temp - 30) * 1.2 + Math.sin(temp) * 3).toFixed(0);
  const drn = ((temp - 40) * 0.4 + Math.cos(temp) * 2).toFixed(0);

  const pts = useMemo(() => {
    const r = seededRand(7);
    return Array.from({ length:20 }, () => {
      const t = r() * 60 + 40;
      return {
        t,
        ice: (t - 30) * 1.2 + r() * 15,
        drn: (t - 40) * 0.4 + r() * 8,
      };
    });
  }, []);

  return <>
    <p style={S.sub}>
      Ice cream sales and drowning rates are highly correlated — but temperature
      is the lurking (confounding) variable driving both.
    </p>

    <div style={S.svgWrap}>
      <svg viewBox="0 0 400 230" width="100%" style={{ maxWidth:440 }}>
        <line x1={50} y1={190} x2={370} y2={190} stroke={C.border} />
        <line x1={50} y1={20} x2={50} y2={190} stroke={C.border} />
        <text x={210} y={218} textAnchor="middle" fill={C.dim} fontSize={10}>
          {show ? 'Temperature (°F)' : 'Ice Cream Sales Index'}
        </text>
        <text x={15} y={110} textAnchor="middle" fill={C.dim} fontSize={10}
          transform="rotate(-90,15,110)">Drowning Rate</text>

        {pts.map((p, i) => (
          <circle key={i}
            cx={50 + (show ? (p.t - 40) / 60 * 320 : p.ice / 80 * 320)}
            cy={190 - p.drn / 40 * 170} r={4.5}
            fill={show ? C.green : C.pink} opacity={0.75} />
        ))}

        <text x={210} y={40} textAnchor="middle"
          fill={show ? C.green : C.pink} fontSize={12} fontWeight={700}>
          {show
            ? 'Lurking variable revealed: Temperature'
            : 'Spurious correlation: ice cream causes drowning?'}
        </text>

        {show && (
          <text x={210} y={182} textAnchor="middle" fill={C.dim} fontSize={9}>
            Temperature → Ice Cream Sales AND Temperature → Drowning
          </text>
        )}
      </svg>
    </div>

    <div style={S.controls}>
      <button onClick={() => setShow(!show)} style={{
        ...S.modeTab(true), background: show ? C.green : C.pink,
      }}>
        {show ? 'Hide' : 'Show'} Lurking Variable
      </button>
      <label style={{ fontSize:12, color:C.dim }}>
        Temperature: <b style={{ color:C.text }}>{temp}°F</b>
      </label>
      <input type="range" min={40} max={100} value={temp}
        onChange={e => setTemp(+e.target.value)}
        style={{ flex:1, maxWidth:180, accentColor:C.accent }} />
    </div>

    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
      <span style={{ ...S.eq, flex:1, minWidth:100 }}>
        Ice cream: <span style={{ color:C.pink }}>{ice}</span>
      </span>
      <span style={{ ...S.eq, flex:1, minWidth:100 }}>
        Drowning: <span style={{ color:C.cyan }}>{drn}</span>
      </span>
      <span style={{ ...S.eq, flex:1, minWidth:100 }}>
        Temp: <span style={{ color:C.green }}>{temp}°F</span>
      </span>
    </div>

    <span style={S.eq}>
      Confounding: Z → X and Z → Y creates spurious X ↔ Y association
    </span>

    <Note color={C.red} label="Common Mistake">
      Assuming correlation implies causation. A confounding variable can produce
      a strong correlation between two variables with no direct causal link.
      Always ask: is there a third variable driving both?
    </Note>
    <Note color={C.teal} label="Practical Insight">
      Selection bias is another major pitfall: if your sample systematically
      excludes certain groups (e.g., online-only surveys miss people without
      internet), your conclusions will not generalize.
    </Note>
  </>;
}

/* ── Tab 5: Observational vs Experiment ── */
function ObsVsExp() {
  const subjects = useMemo(() =>
    Array.from({ length:20 }, (_, i) => ({ id:i })), []);
  const [asgn, setAsgn] = useState({});
  const [runs, setRuns] = useState(0);

  const randomize = useCallback(() => {
    const r = seededRand(Date.now() % 9999);
    const sh = [...subjects].sort(() => r() - 0.5);
    const a = {};
    sh.forEach((s, i) => { a[s.id] = i < 10 ? 'T' : 'C'; });
    setAsgn(a);
    setRuns(c => c + 1);
  }, [subjects]);

  const tN = Object.values(asgn).filter(v => v === 'T').length;
  const cN = Object.values(asgn).filter(v => v === 'C').length;
  const has = Object.keys(asgn).length > 0;

  return <>
    <p style={S.sub}>
      Click Randomize to assign 20 subjects to treatment and control groups.
      Each click produces a different random assignment.
    </p>

    <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
      <div style={{ flex:1, minWidth:170 }}>
        <div style={{ ...S.eq, borderColor:C.green, textAlign:'left' }}>
          <span style={{ color:C.green, fontWeight:700, fontSize:14 }}>
            Experiment
          </span><br />
          <span style={{ color:C.dim, fontSize:11 }}>
            Researcher assigns treatment<br />
            Random assignment controls confounders<br />
            CAN establish causation
          </span>
        </div>
      </div>
      <div style={{ flex:1, minWidth:170 }}>
        <div style={{ ...S.eq, borderColor:C.amber, textAlign:'left' }}>
          <span style={{ color:C.amber, fontWeight:700, fontSize:14 }}>
            Observational Study
          </span><br />
          <span style={{ color:C.dim, fontSize:11 }}>
            Researcher only observes<br />
            No control over variables<br />
            CANNOT establish causation
          </span>
        </div>
      </div>
    </div>

    <div style={S.svgWrap}>
      <svg viewBox="0 0 400 210" width="100%" style={{ maxWidth:440 }}>
        <text x={100} y={18} textAnchor="middle"
          fill={C.green} fontSize={11} fontWeight={700}>
          Treatment (n={tN})
        </text>
        <text x={300} y={18} textAnchor="middle"
          fill={C.cyan} fontSize={11} fontWeight={700}>
          Control (n={cN})
        </text>
        <line x1={200} y1={22} x2={200} y2={195}
          stroke={C.border} strokeDasharray="4" />

        {subjects.map((s, i) => {
          const g = asgn[s.id];
          const col = g === 'T' ? 0 : g === 'C' ? 1 : -1;
          if (col === -1) {
            return <circle key={i}
              cx={160 + (i % 5) * 20} cy={60 + Math.floor(i / 5) * 30}
              r={7} fill={C.faint} opacity={0.4} />;
          }
          const entries = Object.entries(asgn)
            .filter(([, v]) => v === (col === 0 ? 'T' : 'C'));
          const idx = entries.findIndex(([k]) => +k === s.id);
          return <circle key={i}
            cx={col === 0 ? 30 + (idx % 5) * 35 : 230 + (idx % 5) * 35}
            cy={40 + Math.floor(idx / 5) * 35}
            r={8} fill={col === 0 ? C.green : C.cyan} opacity={0.85} />;
        })}

        {!has && (
          <text x={200} y={110} textAnchor="middle" fill={C.faint} fontSize={12}>
            Click Randomize below to assign groups
          </text>
        )}
      </svg>
    </div>

    <div style={S.controls}>
      <button onClick={randomize} style={S.modeTab(true)}>Randomize</button>
      {runs > 0 && (
        <span style={{ fontSize:12, color:C.dim }}>
          Randomized {runs} time{runs > 1 ? 's' : ''} — notice different
          subjects end up in each group every time.
        </span>
      )}
    </div>

    <span style={S.eq}>
      Random assignment (experiment) ≠ Random selection (sampling).
      Both matter but serve different purposes.
    </span>

    <Note color={C.red} label="Common Mistake">
      Drawing causal conclusions from observational studies. Without random
      assignment, lurking variables may fully explain the observed association.
      Only controlled experiments with randomization support causal claims.
    </Note>
    <Note color={C.teal} label="Practical Insight">
      Many important questions (does smoking cause cancer?) cannot ethically
      be studied with experiments. Researchers use large observational studies
      with statistical controls to approximate causal inference.
    </Note>
  </>;
}

/* ── Main Component ── */
const panels = [TypesOfData, PopVsSample, SamplingMethods, BiasConfounding, ObsVsExp];

export default function DataCollectionAndTypes() {
  const [tab, setTab] = useState(0);
  const Panel = panels[tab];

  return (
    <div style={S.container}>
      <div style={S.modeBar}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={S.modeTab(tab === i)}>
            {t}
          </button>
        ))}
      </div>
      <div style={S.body}>
        <div style={S.section}>
          <h2 style={S.title}>{tabs[tab]}</h2>
          <Panel />
        </div>
      </div>
    </div>
  );
}
