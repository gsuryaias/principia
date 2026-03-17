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
  container:{ display:'flex', flexDirection:'column', minHeight:'calc(100vh - 3.5rem)', background:C.bg, fontFamily:'Inter,system-ui,sans-serif', color:C.text },
  modeBar:{ display:'flex', gap:4, padding:'10px 16px', background:'#0a0a0f', borderBottom:`1px solid ${C.border}`, flexShrink:0, flexWrap:'wrap' },
  modeTab:a=>({ padding:'8px 20px', borderRadius:10, border:'none', background:a?C.accent:'transparent', color:a?'#fff':C.dim, fontSize:14, fontWeight:600, cursor:'pointer', transition:'all .15s' }),
  topicBar:{ display:'flex', gap:4, padding:'8px 16px', background:'#0c0c10', borderBottom:`1px solid ${C.border}`, overflowX:'auto', flexShrink:0 },
  topicTab:a=>({ padding:'6px 12px', borderRadius:8, border:'none', background:a?C.surfaceAlt:'transparent', color:a?C.accentLight:C.faint, fontSize:11.5, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s' }),
  body:{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto' },
  section:{ padding:'18px 22px', flex:1, display:'flex', flexDirection:'column', gap:14 },
  svgWrap:{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:260, padding:'4px 0' },
  controls:{ padding:'12px 22px', background:C.surface, borderTop:`1px solid ${C.border}`, display:'flex', flexWrap:'wrap', gap:16, alignItems:'center' },
  eq:{ display:'block', padding:'10px 16px', background:C.surfaceAlt, border:`1px solid ${C.borderLight}`, borderRadius:10, fontFamily:'monospace', fontSize:14, color:C.mono, margin:'8px 0', textAlign:'center', lineHeight:1.7 },
  note:{ padding:'12px 16px', background:C.accentGlow, borderLeft:`3px solid ${C.accent}`, borderRadius:'0 10px 10px 0', margin:'6px 0' },
  noteT:{ fontWeight:700, color:C.accentLight, fontSize:12, marginBottom:4, display:'block', textTransform:'uppercase', letterSpacing:'0.04em' },
  noteP:{ fontSize:13, lineHeight:1.65, color:C.muted, margin:0 },
  title:{ fontSize:17, fontWeight:700, color:C.text, margin:'0 0 2px' },
  sub:{ fontSize:12.5, color:C.dim, margin:0, lineHeight:1.5 },
};

const tabs = [
  'Types of Data',
  'Population vs Sample',
  'Sampling Methods',
  'Bias + Confounding',
  'Observational vs Experiment',
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

const typeColors = { nominal:C.pink, ordinal:C.amber, discrete:C.cyan, continuous:C.green };
const typeDesc = {
  nominal:'Labels with no inherent order. Only mode is meaningful.',
  ordinal:'Categories with a natural order, but gaps between levels are not uniform.',
  discrete:'Countable whole numbers. Mean and median both apply.',
  continuous:'Measurements on a continuous scale. All summary statistics apply.',
};

function seededRand(s) {
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function TypesOfData() {
  const [selected, setSelected] = useState(null);
  const item = selected !== null ? dataItems[selected] : null;
  const validStats = item
    ? item.cat === 'Numerical'
      ? 'Mean, Median, Std Dev, Range'
      : item.type === 'ordinal'
        ? 'Mode, Median'
        : 'Mode only'
    : '';

  return <>
    <p style={S.sub}>
      Click a variable below to classify it and see which summary statistics are valid.
    </p>
    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
      {dataItems.map((d, i) => (
        <button key={i} onClick={() => setSelected(i)} style={{
          padding:'8px 14px', borderRadius:8,
          border:`1px solid ${selected === i ? typeColors[d.type] : C.border}`,
          background:selected === i ? C.surfaceAlt : C.surface,
          color:selected === i ? typeColors[d.type] : C.muted,
          fontSize:13, cursor:'pointer', fontWeight:selected === i ? 700 : 500,
        }}>
          {d.name}
        </button>
      ))}
    </div>

    {item && (
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:4 }}>
        <div style={{ ...S.eq, flex:1, minWidth:200, textAlign:'left' }}>
          <span style={{ color:typeColors[item.type], fontWeight:700, fontSize:15 }}>
            {item.cat} / {item.type}
          </span><br/>
          <span style={{ color:C.dim, fontSize:12 }}>
            Example values: {item.values.join(', ')}
          </span><br/>
          <span style={{ color:C.muted, fontSize:12 }}>
            Valid statistics: {validStats}
          </span><br/>
          <span style={{ color:C.faint, fontSize:11, fontStyle:'italic' }}>
            {typeDesc[item.type]}
          </span>
        </div>
      </div>
    )}

    <div style={S.svgWrap}>
      <svg viewBox="0 0 400 200" width="100%" style={{ maxWidth:440 }}>
        {/* Categorical box */}
        <rect x={10} y={10} width={185} height={180} rx={8}
          fill={C.surfaceAlt} stroke={C.border} />
        <text x={102} y={35} textAnchor="middle"
          fill={C.text} fontSize={13} fontWeight={700}>Categorical</text>
        <rect x={25} y={48} width={155} height={55} rx={6}
          fill="none" stroke={C.pink} strokeDasharray="4" />
        <text x={102} y={70} textAnchor="middle" fill={C.pink} fontSize={11}>
          Nominal
        </text>
        <text x={102} y={90} textAnchor="middle" fill={C.dim} fontSize={9}>
          No order (colors, blood type)
        </text>
        <rect x={25} y={112} width={155} height={55} rx={6}
          fill="none" stroke={C.amber} strokeDasharray="4" />
        <text x={102} y={134} textAnchor="middle" fill={C.amber} fontSize={11}>
          Ordinal
        </text>
        <text x={102} y={154} textAnchor="middle" fill={C.dim} fontSize={9}>
          Has order (rankings, Likert)
        </text>

        {/* Numerical box */}
        <rect x={205} y={10} width={185} height={180} rx={8}
          fill={C.surfaceAlt} stroke={C.border} />
        <text x={297} y={35} textAnchor="middle"
          fill={C.text} fontSize={13} fontWeight={700}>Numerical</text>
        <rect x={220} y={48} width={155} height={55} rx={6}
          fill="none" stroke={C.cyan} strokeDasharray="4" />
        <text x={297} y={70} textAnchor="middle" fill={C.cyan} fontSize={11}>
          Discrete
        </text>
        <text x={297} y={90} textAnchor="middle" fill={C.dim} fontSize={9}>
          Countable (# pets, dice roll)
        </text>
        <rect x={220} y={112} width={155} height={55} rx={6}
          fill="none" stroke={C.green} strokeDasharray="4" />
        <text x={297} y={134} textAnchor="middle" fill={C.green} fontSize={11}>
          Continuous
        </text>
        <text x={297} y={154} textAnchor="middle" fill={C.dim} fontSize={9}>
          Measurable (weight, time)
        </text>
      </svg>
    </div>

    <div style={{ ...S.note, borderLeftColor:C.red }}>
      <span style={{ ...S.noteT, color:C.red }}>Common Mistake</span>
      <p style={S.noteP}>
        ZIP codes, phone numbers, and jersey numbers look numeric but are categorical
        (nominal). Averaging them is meaningless. Always ask: does arithmetic on these
        values produce something interpretable?
      </p>
    </div>

    <div style={S.note}>
      <span style={S.noteT}>Practical Insight</span>
      <p style={S.noteP}>
        Knowing the data type drives every downstream decision: bar chart vs histogram,
        chi-square vs t-test, mode vs mean. Misclassifying a variable leads to invalid analysis.
      </p>
    </div>
  </>;
}

function PopVsSample() {
  const [sampleSize, setSampleSize] = useState(20);
  const rand = useMemo(() => seededRand(42), []);
  const pop = useMemo(() =>
    Array.from({ length:200 }, () => ({
      x:rand() * 360 + 20,
      y:rand() * 200 + 20,
      v:rand() * 100,
    })), [rand]);

  const sample = useMemo(() => {
    const r2 = seededRand(sampleSize * 7 + 1);
    const idx = new Set();
    while (idx.size < sampleSize) idx.add(Math.floor(r2() * 200));
    return [...idx];
  }, [sampleSize]);

  const popMean = (pop.reduce((s, p) => s + p.v, 0) / 200).toFixed(1);
  const smpMean = (sample.reduce((s, i) => s + pop[i].v, 0) / sampleSize).toFixed(1);
  const diff = Math.abs(popMean - smpMean).toFixed(1);

  return <>
    <p style={S.sub}>
      Drag the slider to adjust sample size. Notice how the sample mean approaches the
      population mean as n grows.
    </p>
    <div style={S.svgWrap}>
      <svg viewBox="0 0 400 240" width="100%" style={{ maxWidth:440 }}>
        {pop.map((p, i) => {
          const inS = sample.includes(i);
          return (
            <circle key={i} cx={p.x} cy={p.y}
              r={inS ? 5 : 3}
              fill={inS ? C.accent : C.faint}
              opacity={inS ? 1 : 0.3} />
          );
        })}
        <text x={200} y={235} textAnchor="middle" fill={C.dim} fontSize={11}>
          Population N=200 (faint) | Sample n={sampleSize} (bright)
        </text>
      </svg>
    </div>

    <div style={S.controls}>
      <label style={{ fontSize:12, color:C.dim }}>
        Sample size: <b style={{ color:C.text }}>{sampleSize}</b>
      </label>
      <input type="range" min={5} max={100} value={sampleSize}
        onChange={e => setSampleSize(+e.target.value)}
        style={{ flex:1, maxWidth:220, accentColor:C.accent }} />
    </div>

    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
      <span style={{ ...S.eq, flex:1, minWidth:140 }}>
        Population mean (μ) = <span style={{ color:C.green }}>{popMean}</span>
      </span>
      <span style={{ ...S.eq, flex:1, minWidth:140 }}>
        Sample mean (x̄) = <span style={{ color:C.accent }}>{smpMean}</span>
      </span>
      <span style={{ ...S.eq, flex:1, minWidth:140 }}>
        |μ − x̄| = <span style={{ color:diff < 5 ? C.green : C.amber }}>{diff}</span>
      </span>
    </div>

    <span style={S.eq}>
      μ = population parameter &nbsp;|&nbsp; x̄ = sample statistic &nbsp;|&nbsp;
      As n → N, x̄ → μ
    </span>

    <div style={S.note}>
      <span style={S.noteT}>Common Mistake</span>
      <p style={S.noteP}>
        Confusing parameters (Greek letters: μ, σ — describe the population) with
        statistics (Latin letters: x̄, s — computed from the sample). A statistic
        estimates a parameter; it is not the parameter itself.
      </p>
    </div>

    <div style={{ ...S.note, borderLeftColor:C.teal }}>
      <span style={{ ...S.noteT, color:C.teal }}>Practical Insight</span>
      <p style={S.noteP}>
        In practice we almost never know the true population parameter. The entire
        field of inferential statistics exists to quantify how confident we can be
        in our sample-based estimates.
      </p>
    </div>
  </>;
}

function SamplingMethods() {
  const methods = ['Simple Random', 'Stratified', 'Cluster', 'Systematic'];
  const [method, setMethod] = useState(0);
  const strataColors = [C.pink, C.cyan, C.amber, C.green];

  const grid = useMemo(() => {
    const r = seededRand(99);
    return Array.from({ length:100 }, (_, i) => ({
      x:(i % 10) * 36 + 30,
      y:Math.floor(i / 10) * 22 + 20,
      group:Math.floor(i / 25),
      color:strataColors[Math.floor(i / 25)],
    }));
  }, []);

  const selected = useMemo(() => {
    const r = seededRand(method * 13 + 5);
    const s = new Set();
    if (method === 0) {
      while (s.size < 15) s.add(Math.floor(r() * 100));
    } else if (method === 1) {
      for (let g = 0; g < 4; g++) {
        const base = g * 25;
        const picks = new Set();
        while (picks.size < 4) picks.add(base + Math.floor(r() * 25));
        picks.forEach(v => s.add(v));
      }
    } else if (method === 2) {
      const cg = Math.floor(r() * 4);
      for (let i = cg * 25; i < cg * 25 + 25; i++) s.add(i);
    } else {
      const start = Math.floor(r() * 7);
      for (let i = start; i < 100; i += 7) s.add(i);
    }
    return s;
  }, [method]);

  const desc = [
    'Every individual has an equal chance of being selected — like drawing names from a hat.',
    'Divide population into strata (subgroups), then randomly sample from each stratum.',
    'Randomly select entire clusters (natural groupings like classrooms or city blocks).',
    'Select every k-th individual from an ordered list after a random start.',
  ];

  return <>
    <p style={S.sub}>{desc[method]}</p>

    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
      {methods.map((m, i) => (
        <button key={i} onClick={() => setMethod(i)}
          style={S.topicTab(method === i)}>{m}</button>
      ))}
    </div>

    <div style={S.svgWrap}>
      <svg viewBox="0 0 400 250" width="100%" style={{ maxWidth:440 }}>
        {grid.map((g, i) => (
          <rect key={i} x={g.x} y={g.y} width={28} height={16} rx={3}
            fill={selected.has(i) ? g.color : C.surfaceAlt}
            stroke={selected.has(i) ? '#fff' : C.border}
            strokeWidth={selected.has(i) ? 1.5 : 0.5}
            opacity={selected.has(i) ? 1 : 0.35} />
        ))}
        <text x={200} y={245} textAnchor="middle" fill={C.dim} fontSize={10}>
          4 strata shown by color | {selected.size} items selected
        </text>
      </svg>
    </div>

    <span style={S.eq}>
      {method === 0 && 'P(selected) = n / N — equal for every individual'}
      {method === 1 && 'Sample from each stratum: guarantees representation of all subgroups'}
      {method === 2 && 'Entire cluster chosen at random — cost-effective for geographic spread'}
      {method === 3 && 'k = N / n — pick every k-th element after a random start'}
    </span>

    <div style={{ ...S.note, borderLeftColor:C.red }}>
      <span style={{ ...S.noteT, color:C.red }}>Common Mistake</span>
      <p style={S.noteP}>
        Convenience sampling (e.g., surveying only your friends or people at one
        location) almost always produces biased results. Every proper method above
        ensures some form of randomness to reduce selection bias.
      </p>
    </div>

    <div style={{ ...S.note, borderLeftColor:C.teal }}>
      <span style={{ ...S.noteT, color:C.teal }}>Practical Insight</span>
      <p style={S.noteP}>
        Stratified sampling ensures minority groups are adequately represented.
        Cluster sampling reduces travel and cost when the population is geographically
        dispersed. The choice depends on logistics, budget, and research goals.
      </p>
    </div>
  </>;
}

function BiasConfounding() {
  const [temp, setTemp] = useState(75);
  const [showLurking, setShowLurking] = useState(false);

  const iceCream = ((temp - 30) * 1.2 + Math.sin(temp) * 3).toFixed(0);
  const drowning = ((temp - 40) * 0.4 + Math.cos(temp) * 2).toFixed(0);

  const points = useMemo(() => {
    const r = seededRand(7);
    return Array.from({ length:20 }, () => {
      const t = r() * 60 + 40;
      return { temp:t, ice:(t - 30) * 1.2 + r() * 15, drown:(t - 40) * 0.4 + r() * 8 };
    });
  }, []);

  return <>
    <p style={S.sub}>
      Ice cream sales and drowning rates are highly correlated — but temperature is
      the lurking (confounding) variable driving both.
    </p>

    <div style={S.svgWrap}>
      <svg viewBox="0 0 400 230" width="100%" style={{ maxWidth:440 }}>
        <line x1={50} y1={190} x2={370} y2={190} stroke={C.border} />
        <line x1={50} y1={20} x2={50} y2={190} stroke={C.border} />
        <text x={210} y={215} textAnchor="middle" fill={C.dim} fontSize={10}>
          {showLurking ? 'Temperature (°F)' : 'Ice Cream Sales Index'}
        </text>
        <text x={15} y={110} textAnchor="middle" fill={C.dim} fontSize={10}
          transform="rotate(-90,15,110)">Drowning Rate</text>

        {points.map((p, i) => (
          <circle key={i}
            cx={50 + (showLurking ? (p.temp - 40) / 60 * 320 : p.ice / 80 * 320)}
            cy={190 - p.drown / 40 * 170}
            r={4.5}
            fill={showLurking ? C.green : C.pink}
            opacity={0.75} />
        ))}

        {showLurking && (
          <text x={210} y={40} textAnchor="middle" fill={C.green}
            fontSize={12} fontWeight={700}>
            Lurking variable revealed: Temperature
          </text>
        )}
        {!showLurking && (
          <text x={210} y={40} textAnchor="middle" fill={C.pink}
            fontSize={12} fontWeight={700}>
            Spurious correlation: ice cream causes drowning?
          </text>
        )}

        {/* Confounding diagram */}
        {showLurking && <>
          <text x={200} y={182} textAnchor="middle" fill={C.dim} fontSize={9}>
            Temperature → Ice Cream Sales AND Temperature → Drowning
          </text>
        </>}
      </svg>
    </div>

    <div style={S.controls}>
      <button onClick={() => setShowLurking(!showLurking)}
        style={{ ...S.modeTab(true), background:showLurking ? C.green : C.pink }}>
        {showLurking ? 'Hide' : 'Show'} Lurking Variable
      </button>
      <label style={{ fontSize:12, color:C.dim }}>
        Temperature: <b style={{ color:C.text }}>{temp}°F</b>
      </label>
      <input type="range" min={40} max={100} value={temp}
        onChange={e => setTemp(+e.target.value)}
        style={{ flex:1, maxWidth:180, accentColor:C.accent }} />
    </div>

    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
      <span style={{ ...S.eq, flex:1, minWidth:120 }}>
        Ice cream: <span style={{ color:C.pink }}>{iceCream}</span>
      </span>
      <span style={{ ...S.eq, flex:1, minWidth:120 }}>
        Drowning: <span style={{ color:C.cyan }}>{drowning}</span>
      </span>
      <span style={{ ...S.eq, flex:1, minWidth:120 }}>
        Temp: <span style={{ color:C.green }}>{temp}°F</span>
      </span>
    </div>

    <span style={S.eq}>
      Confounding: Z → X and Z → Y creates a spurious X ↔ Y association
    </span>

    <div style={{ ...S.note, borderLeftColor:C.red }}>
      <span style={{ ...S.noteT, color:C.red }}>Common Mistake</span>
      <p style={S.noteP}>
        Assuming correlation implies causation. A confounding variable can create a
        strong correlation between two variables that have no direct causal link.
        Always ask: is there a third variable driving both?
      </p>
    </div>

    <div style={{ ...S.note, borderLeftColor:C.teal }}>
      <span style={{ ...S.noteT, color:C.teal }}>Practical Insight</span>
      <p style={S.noteP}>
        Selection bias is another pitfall: if your sample systematically excludes
        certain groups, your conclusions will not generalize. Surveys conducted only
        online miss populations without internet access.
      </p>
    </div>
  </>;
}

function ObsVsExp() {
  const [subjects] = useState(() =>
    Array.from({ length:20 }, (_, i) => ({ id:i, name:`S${i + 1}` }))
  );
  const [assignments, setAssignments] = useState({});
  const [runCount, setRunCount] = useState(0);

  const randomize = useCallback(() => {
    const r = seededRand(Date.now() % 9999);
    const shuffled = [...subjects].sort(() => r() - 0.5);
    const a = {};
    shuffled.forEach((s, i) => {
      a[s.id] = i < 10 ? 'treatment' : 'control';
    });
    setAssignments(a);
    setRunCount(c => c + 1);
  }, [subjects]);

  const tCount = Object.values(assignments).filter(v => v === 'treatment').length;
  const cCount = Object.values(assignments).filter(v => v === 'control').length;
  const hasAssigned = Object.keys(assignments).length > 0;

  return <>
    <p style={S.sub}>
      Click Randomize to assign 20 subjects to treatment and control groups.
      Each click produces a different random assignment.
    </p>

    <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
      <div style={{ flex:1, minWidth:170 }}>
        <div style={{ ...S.eq, borderColor:C.green, textAlign:'left' }}>
          <span style={{ color:C.green, fontWeight:700, fontSize:14 }}>Experiment</span><br/>
          <span style={{ color:C.dim, fontSize:11 }}>
            Researcher assigns treatment<br/>
            Random assignment controls confounders<br/>
            CAN establish causation
          </span>
        </div>
      </div>
      <div style={{ flex:1, minWidth:170 }}>
        <div style={{ ...S.eq, borderColor:C.amber, textAlign:'left' }}>
          <span style={{ color:C.amber, fontWeight:700, fontSize:14 }}>Observational Study</span><br/>
          <span style={{ color:C.dim, fontSize:11 }}>
            Researcher only observes<br/>
            No control over variables<br/>
            CANNOT establish causation
          </span>
        </div>
      </div>
    </div>

    <div style={S.svgWrap}>
      <svg viewBox="0 0 400 210" width="100%" style={{ maxWidth:440 }}>
        <text x={100} y={18} textAnchor="middle" fill={C.green}
          fontSize={11} fontWeight={700}>
          Treatment (n={tCount})
        </text>
        <text x={300} y={18} textAnchor="middle" fill={C.cyan}
          fontSize={11} fontWeight={700}>
          Control (n={cCount})
        </text>
        <line x1={200} y1={22} x2={200} y2={195}
          stroke={C.border} strokeDasharray="4" />

        {subjects.map((s, i) => {
          const grp = assignments[s.id];
          const col = grp === 'treatment' ? 0 : grp === 'control' ? 1 : -1;

          if (col === -1) {
            const row = Math.floor(i / 5);
            const ci = i % 5;
            return (
              <circle key={i} cx={160 + ci * 20} cy={60 + row * 30}
                r={7} fill={C.faint} opacity={0.4} />
            );
          }

          const groupEntries = Object.entries(assignments)
            .filter(([, v]) => v === (col === 0 ? 'treatment' : 'control'));
          const idx = groupEntries.findIndex(([k]) => +k === s.id);
          const row = Math.floor(idx / 5);
          const ci = idx % 5;

          return (
            <circle key={i}
              cx={col === 0 ? 30 + ci * 35 : 230 + ci * 35}
              cy={40 + row * 35}
              r={8}
              fill={col === 0 ? C.green : C.cyan}
              opacity={0.85} />
          );
        })}

        {!hasAssigned && (
          <text x={200} y={110} textAnchor="middle" fill={C.faint} fontSize={12}>
            Click Randomize below to assign groups
          </text>
        )}
      </svg>
    </div>

    <div style={S.controls}>
      <button onClick={randomize} style={S.modeTab(true)}>
        Randomize
      </button>
      {runCount > 0 && (
        <span style={{ fontSize:12, color:C.dim }}>
          Randomized {runCount} time{runCount > 1 ? 's' : ''} — notice
          different subjects end up in each group.
        </span>
      )}
    </div>

    <span style={S.eq}>
      Random assignment (experiment) ≠ Random selection (sampling).
      Both matter but serve different purposes.
    </span>

    <div style={{ ...S.note, borderLeftColor:C.red }}>
      <span style={{ ...S.noteT, color:C.red }}>Common Mistake</span>
      <p style={S.noteP}>
        Drawing causal conclusions from observational studies. Without random
        assignment, lurking variables may fully explain the observed association.
        Only controlled experiments with randomization can support causal claims.
      </p>
    </div>

    <div style={{ ...S.note, borderLeftColor:C.teal }}>
      <span style={{ ...S.noteT, color:C.teal }}>Practical Insight</span>
      <p style={S.noteP}>
        Many important questions (e.g., does smoking cause cancer?) cannot be studied
        with experiments for ethical reasons. In those cases, researchers use large
        observational studies and statistical controls to approximate causal inference.
      </p>
    </div>
  </>;
}

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
