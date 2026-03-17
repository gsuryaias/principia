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

function seededRng(seed) {
  let s = seed | 0 || 1;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

function genPop(type, rng, n = 200) {
  const vals = [];
  for (let i = 0; i < n; i++) {
    if (type === 'uniform') vals.push(rng() * 10);
    else if (type === 'skewed') vals.push(-Math.log(1 - rng()) * 3);
    else if (type === 'bimodal') vals.push(rng() < 0.5 ? 2 + rng() * 1.5 : 7 + rng() * 1.5);
    else vals.push(-Math.log(1 - rng()) * 3);
  }
  return vals;
}

function mean(a) { return a.reduce((s, v) => s + v, 0) / a.length; }
function std(a) { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length); }

function histogram(vals, bins, lo, hi) {
  const counts = new Array(bins).fill(0);
  const w = (hi - lo) / bins;
  vals.forEach(v => { const b = Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / w))); counts[b]++; });
  return counts;
}

function Slider({ label, value, onChange, min, max, step }) {
  return (
    <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:C.muted }}>
      <span style={{ color:C.dim, fontWeight:600, minWidth:20 }}>{label}</span>
      <input type="range" min={min} max={max} step={step||1} value={value} onChange={e => onChange(+e.target.value)}
        style={{ accentColor:C.accent, width:100 }} />
      <span style={{ color:C.accentLight, fontFamily:'monospace', fontSize:12, minWidth:28 }}>{value}</span>
    </label>
  );
}

function Btn({ children, onClick, active }) {
  return <button onClick={onClick} style={{ padding:'5px 14px', borderRadius:8, border:`1px solid ${active?C.accent:C.borderLight}`, background:active?C.accent:C.surfaceAlt, color:active?'#fff':C.muted, fontSize:11.5, fontWeight:600, cursor:'pointer' }}>{children}</button>;
}

function Hist({ counts, lo, hi, w, h, color, label, maxOverride }) {
  const mx = maxOverride || Math.max(...counts, 1);
  const bw = w / counts.length;
  return (
    <g>
      {label && <text x={w/2} y={-6} textAnchor="middle" fill={C.dim} fontSize={10} fontWeight={600}>{label}</text>}
      {counts.map((c, i) => <rect key={i} x={i * bw + 1} y={h - (c / mx) * h} width={bw - 2} height={(c / mx) * h} fill={color} rx={2} opacity={0.85} />)}
      <line x1={0} y1={h} x2={w} y2={h} stroke={C.borderLight} strokeWidth={1} />
      <text x={0} y={h + 12} fill={C.faint} fontSize={9}>{lo.toFixed(1)}</text>
      <text x={w} y={h + 12} fill={C.faint} fontSize={9} textAnchor="end">{hi.toFixed(1)}</text>
    </g>
  );
}

const tabs = ['Repeated Sampling', 'Sample Mean', 'Sample Proportion', 'CLT', 'Standard Error'];

export default function SamplingDistributions() {
  const [tab, setTab] = useState(0);
  const [n, setN] = useState(30);
  const [popType, setPopType] = useState('skewed');
  const [sampleMeans, setSampleMeans] = useState([]);
  const [seed, setSeed] = useState(42);
  const [p, setP] = useState(0.5);
  const [sigma, setSigma] = useState(4);
  const [autoRunning, setAutoRunning] = useState(false);
  const animRef = useRef(null);

  const rng = useMemo(() => seededRng(seed), [seed]);
  const pop = useMemo(() => genPop(popType, seededRng(seed + 7), 500), [popType, seed]);
  const popMu = useMemo(() => mean(pop), [pop]);
  const popSd = useMemo(() => std(pop), [pop]);

  const drawSample = useCallback(() => {
    const r = seededRng(Date.now());
    const sample = Array.from({ length: n }, () => pop[Math.floor(r() * pop.length)]);
    setSampleMeans(prev => [...prev, mean(sample)]);
  }, [n, pop]);

  const draw10 = useCallback(() => {
    for (let i = 0; i < 10; i++) {
      const r = seededRng(Date.now() + i * 137);
      const sample = Array.from({ length: n }, () => pop[Math.floor(r() * pop.length)]);
      setSampleMeans(prev => [...prev, mean(sample)]);
    }
  }, [n, pop]);

  const reset = useCallback(() => { setSampleMeans([]); setSeed(s => s + 1); setAutoRunning(false); }, []);

  // Auto-draw animation
  useEffect(() => {
    if (!autoRunning) { if (animRef.current) clearInterval(animRef.current); return; }
    animRef.current = setInterval(() => {
      const r = seededRng(Date.now());
      setSampleMeans(prev => {
        if (prev.length >= 200) { setAutoRunning(false); return prev; }
        const sample = Array.from({ length: n }, () => pop[Math.floor(r() * pop.length)]);
        return [...prev, mean(sample)];
      });
    }, 120);
    return () => clearInterval(animRef.current);
  }, [autoRunning, n, pop]);

  const W = 460, H = 120, BINS = 30;

  // Tab 0: Repeated Sampling
  const tab0 = () => {
    const lo = Math.min(...pop, ...sampleMeans) - 0.5;
    const hi = Math.max(...pop, ...sampleMeans) + 0.5;
    const popH = histogram(pop, BINS, lo, hi);
    const meansH = histogram(sampleMeans, BINS, lo, hi);
    return (<>
      <p style={S.sub}>Draw samples of size n from a {popType} population and watch the histogram of sample means build up.</p>
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${W} ${H * 2 + 60}`} width="100%" style={{ maxWidth: W }}>
          <g transform="translate(0,16)"><Hist counts={popH} lo={lo} hi={hi} w={W} h={H} color={C.faint} label="Population" /></g>
          <g transform={`translate(0,${H + 46})`}><Hist counts={meansH} lo={lo} hi={hi} w={W} h={H} color={C.accent} label={`Sample Means (k=${sampleMeans.length})`} /></g>
        </svg>
      </div>
      <div style={S.controls}>
        <Slider label="n" value={n} onChange={v => { setN(v); setSampleMeans([]); }} min={2} max={100} />
        {['skewed','uniform','bimodal'].map(t => <Btn key={t} active={popType===t} onClick={() => { setPopType(t); setSampleMeans([]); }}>{t}</Btn>)}
        <Btn onClick={drawSample}>Draw 1</Btn>
        <Btn onClick={draw10}>Draw 10</Btn>
        <Btn active={autoRunning} onClick={() => setAutoRunning(r => !r)}>{autoRunning ? 'Stop' : 'Auto'}</Btn>
        <Btn onClick={reset}>Reset</Btn>
      </div>
      <div style={S.note}>
        <span style={S.noteT}>Practical Insight</span>
        <p style={S.noteP}>In practice you only get one sample. The sampling distribution is a thought experiment: "If I repeated this study thousands of times, what would the results look like?" Understanding this distribution lets us quantify uncertainty from a single sample.</p>
      </div>
      <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>Thinking one sample tells you everything about the population. A single sample mean can be far from the true mean; you need many samples to see the pattern.</p></div>
    </>);
  };

  // Tab 1: Sample Mean distribution
  const tab1 = () => {
    const r2 = seededRng(seed + 99);
    const means = Array.from({ length: 500 }, () => mean(Array.from({ length: n }, () => pop[Math.floor(r2() * pop.length)])));
    const lo = popMu - 3 * popSd, hi = popMu + 3 * popSd;
    const popH = histogram(pop, BINS, lo, hi);
    const meansH = histogram(means, BINS, lo, hi);
    const seMean = popSd / Math.sqrt(n);
    return (<>
      <p style={S.sub}>Compare the spread of individual values (top) to the spread of sample means (bottom). As n grows, means cluster tighter.</p>
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${W} ${H * 2 + 60}`} width="100%" style={{ maxWidth: W }}>
          <g transform="translate(0,16)"><Hist counts={popH} lo={lo} hi={hi} w={W} h={H} color={C.orange} label="Individual Values" /></g>
          <g transform={`translate(0,${H + 46})`}><Hist counts={meansH} lo={lo} hi={hi} w={W} h={H} color={C.cyan} label={`Distribution of X\u0304 (n=${n})`} /></g>
          <line x1={(popMu - lo) / (hi - lo) * W} y1={0} x2={(popMu - lo) / (hi - lo) * W} y2={H * 2 + 55} stroke={C.green} strokeWidth={1.5} strokeDasharray="4 3" />
        </svg>
      </div>
      <span style={S.eq}>{`\u03BC = ${popMu.toFixed(2)}   SD = ${popSd.toFixed(2)}   SE = \u03C3/\u221An = ${seMean.toFixed(3)}`}</span>
      <div style={S.controls}>
        <Slider label="n" value={n} onChange={setN} min={2} max={100} />
        {['skewed','uniform','bimodal'].map(t => <Btn key={t} active={popType===t} onClick={() => setPopType(t)}>{t}</Btn>)}
      </div>
      <div style={S.note}>
        <span style={S.noteT}>Practical Insight</span>
        <p style={S.noteP}>The green dashed line marks the population mean. Notice the bottom histogram always centers there, but gets narrower as n increases. This is why larger samples give more precise estimates.</p>
      </div>
      <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>Confusing the distribution of individual values with the distribution of sample means. Individual values are widely spread; sample means are much tighter and center on the true mean.</p></div>
    </>);
  };

  // Tab 2: Sample Proportion
  const tab2 = () => {
    const r3 = seededRng(seed + 200);
    const props = Array.from({ length: 500 }, () => {
      let s = 0; for (let i = 0; i < n; i++) s += r3() < p ? 1 : 0; return s / n;
    });
    const seP = Math.sqrt(p * (1 - p) / n);
    const lo = Math.max(0, p - 4 * seP), hi = Math.min(1, p + 4 * seP);
    const pH = histogram(props, BINS, lo, hi);
    const npOk = n * p >= 10 && n * (1 - p) >= 10;
    return (<>
      <p style={S.sub}>Sampling distribution of the sample proportion p-hat. Adjust p and n to see when the normal approximation applies.</p>
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${W} ${H + 30}`} width="100%" style={{ maxWidth: W }}>
          <g transform="translate(0,16)"><Hist counts={pH} lo={lo} hi={hi} w={W} h={H} color={npOk ? C.green : C.red} label={`p\u0302 distribution (n=${n}, p=${p})`} /></g>
          <line x1={(p - lo) / (hi - lo) * W} y1={0} x2={(p - lo) / (hi - lo) * W} y2={H + 16} stroke={C.amber} strokeWidth={1.5} strokeDasharray="4 3" />
        </svg>
      </div>
      <span style={S.eq}>{`p = ${p}   SE = \u221A(p(1-p)/n) = ${seP.toFixed(4)}   np = ${(n*p).toFixed(1)}   n(1-p) = ${(n*(1-p)).toFixed(1)}`}</span>
      <p style={{ fontSize:12, color: npOk ? C.green : C.red, textAlign:'center', margin:0 }}>
        {npOk ? 'Normal approximation is reasonable (np \u2265 10 and n(1-p) \u2265 10)' : 'Normal approximation NOT valid (need np \u2265 10 and n(1-p) \u2265 10)'}
      </p>
      <div style={S.controls}>
        <Slider label="n" value={n} onChange={setN} min={5} max={200} />
        <Slider label="p" value={p} onChange={setP} min={0.05} max={0.95} step={0.05} />
      </div>
      <div style={S.note}>
        <span style={S.noteT}>Practical Insight</span>
        <p style={S.noteP}>In polling, if 52% of 1000 respondents favor a candidate, p-hat = 0.52 with SE = 0.016, giving a margin of error around 3%. That is why polls report results like "52% (+/- 3 points)."</p>
      </div>
      <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>Using the normal approximation when np or n(1-p) is less than 10. The histogram turns red when this condition fails -- notice how non-normal it looks!</p></div>
    </>);
  };

  // Tab 3: CLT
  const tab3 = () => {
    const r4 = seededRng(seed + 300);
    const cltPop = genPop(popType, seededRng(seed + 301), 1000);
    const mu = mean(cltPop), sd = std(cltPop), se = sd / Math.sqrt(n);
    const means = Array.from({ length: 800 }, () => {
      const samp = Array.from({ length: n }, () => cltPop[Math.floor(r4() * cltPop.length)]);
      return mean(samp);
    });
    const lo = mu - 4 * se, hi2 = mu + 4 * se;
    const mH = histogram(means, BINS, lo, hi2);
    // Normal curve overlay
    const normPts = Array.from({ length: BINS }, (_, i) => {
      const x = lo + (i + 0.5) * (hi2 - lo) / BINS;
      return Math.exp(-0.5 * ((x - mu) / se) ** 2) / (se * Math.sqrt(2 * Math.PI));
    });
    const normScale = (800 * (hi2 - lo) / BINS);
    const mx = Math.max(...mH, 1);
    const bw = W / BINS;
    return (<>
      <p style={S.sub}>The CLT says: no matter the population shape, the distribution of sample means approaches normal as n grows.</p>
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${W} ${H + 30}`} width="100%" style={{ maxWidth: W }}>
          <g transform="translate(0,16)">
            <Hist counts={mH} lo={lo} hi={hi2} w={W} h={H} color={C.violet} label={`Means of ${popType} pop (n=${n})`} />
            <polyline fill="none" stroke={C.amber} strokeWidth={2} points={normPts.map((v, i) => `${(i + 0.5) * bw},${H - (v * normScale / mx) * H}`).join(' ')} />
          </g>
        </svg>
      </div>
      <span style={S.eq}>{`X\u0304 ~ N(\u03BC, \u03C3/\u221An)  =>  N(${mu.toFixed(2)}, ${se.toFixed(3)})`}</span>
      <div style={S.controls}>
        <Slider label="n" value={n} onChange={setN} min={1} max={100} />
        {['uniform','skewed','bimodal'].map(t => <Btn key={t} active={popType===t} onClick={() => setPopType(t)}>{t}</Btn>)}
      </div>
      <div style={S.note}>
        <span style={S.noteT}>Practical Insight</span>
        <p style={S.noteP}>The yellow curve is the theoretical normal distribution predicted by the CLT. Try n=1 (no CLT effect) then increase to n=30+. The fit improves dramatically. For heavily skewed populations, you may need n &gt; 30.</p>
      </div>
      <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>Thinking the CLT means "all data is normal." The CLT only says the distribution of sample <em>means</em> becomes normal. Individual data points keep whatever shape they have.</p></div>
    </>);
  };

  // Tab 4: Standard Error
  const tab4 = () => {
    const se = sigma / Math.sqrt(n);
    const nVals = [5, 10, 25, 50, 100, 200];
    const seVals = nVals.map(ni => sigma / Math.sqrt(ni));
    const maxSe = sigma / Math.sqrt(2);
    const barH = 16;
    return (<>
      <p style={S.sub}>Standard Error (SE) measures how much sample means vary from sample to sample. It shrinks with larger n.</p>
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${W} 200`} width="100%" style={{ maxWidth: W }}>
          <text x={W/2} y={14} textAnchor="middle" fill={C.dim} fontSize={10} fontWeight={600}>SE = {'\u03C3'}/{'\u221A'}n for various n ({'\u03C3'} = {sigma})</text>
          {nVals.map((ni, i) => {
            const sei = sigma / Math.sqrt(ni);
            const bw = (sei / maxSe) * (W - 80);
            const y = 30 + i * 28;
            const isActive = ni === n;
            return (
              <g key={ni}>
                <text x={0} y={y + barH / 2 + 4} fill={isActive ? C.accentLight : C.faint} fontSize={10} fontWeight={600}>n={ni}</text>
                <rect x={45} y={y} width={bw} height={barH} fill={isActive ? C.accent : C.surfaceAlt} rx={4} />
                <text x={50 + bw} y={y + barH / 2 + 4} fill={isActive ? C.accentLight : C.dim} fontSize={10}>{sei.toFixed(3)}</text>
              </g>
            );
          })}
          <line x1={45} y1={25} x2={45} y2={30 + nVals.length * 28} stroke={C.borderLight} strokeWidth={1} />
        </svg>
      </div>
      <span style={S.eq}>{`SE = \u03C3 / \u221An = ${sigma} / \u221A${n} = ${se.toFixed(4)}`}</span>
      <p style={{ fontSize:12, color:C.muted, textAlign:'center', margin:0 }}>
        Margin of error (95%) {'\u2248'} 1.96 {'\u00D7'} SE = {(1.96 * se).toFixed(3)} &mdash; e.g., poll: {'\u00B1'}{(1.96 * se).toFixed(1)}
      </p>
      <div style={S.controls}>
        <Slider label="n" value={n} onChange={setN} min={2} max={200} />
        <Slider label={'\u03C3'} value={sigma} onChange={setSigma} min={1} max={10} />
      </div>
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
        <div style={{ ...S.eq, flex:'1 1 180px', maxWidth:220 }}>
          <span style={{ fontSize:11, color:C.dim, display:'block' }}>Standard Deviation (SD)</span>
          <span style={{ fontSize:16 }}>{'\u03C3'} = {sigma}</span>
          <span style={{ fontSize:10, color:C.faint, display:'block' }}>Spread of individual values</span>
        </div>
        <div style={{ ...S.eq, flex:'1 1 180px', maxWidth:220, borderColor:C.accent }}>
          <span style={{ fontSize:11, color:C.dim, display:'block' }}>Standard Error (SE)</span>
          <span style={{ fontSize:16 }}>{sigma}/{'\u221A'}{n} = {se.toFixed(3)}</span>
          <span style={{ fontSize:10, color:C.faint, display:'block' }}>Spread of sample means</span>
        </div>
      </div>
      <div style={S.note}>
        <span style={S.noteT}>Practical Insight</span>
        <p style={S.noteP}>To cut the margin of error in half, you need four times the sample size. This is why going from n=100 to n=400 doubles precision, but going from n=1000 to n=2000 only improves it by about 30%.</p>
      </div>
      <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>Confusing standard deviation (spread of raw data) with standard error (spread of sample estimates). SD describes data variability; SE describes estimation precision. Quadrupling n only halves SE.</p></div>
    </>);
  };

  const panels = [tab0, tab1, tab2, tab3, tab4];

  return (
    <div style={S.container}>
      <div style={S.topicBar}>
        {tabs.map((t, i) => <button key={i} style={S.topicTab(tab === i)} onClick={() => setTab(i)}>{t}</button>)}
      </div>
      <div style={S.body}>
        <div style={S.section}>
          <h2 style={S.title}>{tabs[tab]}</h2>
          {panels[tab]()}
        </div>
      </div>
    </div>
  );
}
