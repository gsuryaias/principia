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
  topicBar:{ display:'flex', gap:4, padding:'10px 16px', background:'#0a0a0f', borderBottom:`1px solid ${C.border}`, overflowX:'auto', flexShrink:0 },
  topicTab:a=>({ padding:'8px 18px', borderRadius:10, border:'none', background:a?C.accent:'transparent', color:a?'#fff':C.dim, fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s' }),
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
  title:{ fontSize:17, fontWeight:700, color:C.text, margin:'0 0 2px' },
  sub:{ fontSize:12.5, color:C.dim, margin:0, lineHeight:1.5 },
  btn:a=>({ padding:'6px 14px', borderRadius:8, border:`1px solid ${a?C.accent:C.borderLight}`, background:a?C.accent:C.surfaceAlt, color:a?'#fff':C.muted, fontSize:12, fontWeight:600, cursor:'pointer' }),
  mistake:{ padding:'12px 16px', background:'rgba(239,68,68,0.08)', borderLeft:`3px solid ${C.red}`, borderRadius:'0 10px 10px 0', margin:'6px 0' },
  mistakeT:{ fontWeight:700, color:C.red, fontSize:12, marginBottom:4, display:'block', textTransform:'uppercase', letterSpacing:'0.04em' },
};

const TABS = ['Point Estimates','Confidence Intervals','Margin of Error','Bootstrap','Sample Size'];
const Z = { 80:1.282, 90:1.645, 95:1.96, 99:2.576 };
const rng = () => Math.random();
const rnorm = () => { let u=0,v=0; while(!u) u=rng(); while(!v) v=rng(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
const sampleNorm = (mu,sd,n) => Array.from({length:n},()=>mu+sd*rnorm());

export default function EstimationAndConfidenceIntervals() {
  const [tab, setTab] = useState(0);
  const [mu] = useState(100);
  const sigma = 15;

  /* Tab 0: Point Estimates */
  const [pe_n, setPeN] = useState(30);
  const [pe_samples, setPeSamples] = useState([]);
  const drawSample = useCallback(() => {
    const s = sampleNorm(mu, sigma, pe_n);
    const mean = s.reduce((a,b)=>a+b,0)/s.length;
    setPeSamples(prev => [...prev.slice(-29), mean]);
  }, [mu, pe_n]);
  const pe_grand = pe_samples.length ? pe_samples.reduce((a,b)=>a+b,0)/pe_samples.length : null;

  /* Tab 1: Confidence Intervals */
  const [ci_level, setCiLevel] = useState(95);
  const [ci_data, setCiData] = useState([]);
  const genCIs = useCallback(() => {
    const z = Z[ci_level];
    const cis = Array.from({length:100}, () => {
      const s = sampleNorm(mu, sigma, 30);
      const m = s.reduce((a,b)=>a+b,0)/s.length;
      const se = sigma / Math.sqrt(30);
      return { m, lo: m - z*se, hi: m + z*se, hit: m - z*se <= mu && mu <= m + z*se };
    });
    setCiData(cis);
  }, [mu, ci_level]);
  const ci_hitRate = ci_data.length ? ci_data.filter(c=>c.hit).length : 0;

  /* Tab 2: Margin of Error */
  const [me_n, setMeN] = useState(400);
  const [me_level, setMeLevel] = useState(95);
  const me_z = Z[me_level];
  const me_se = sigma / Math.sqrt(me_n);
  const me_val = me_z * me_se;

  /* Tab 3: Bootstrap */
  const [bs_orig] = useState(() => sampleNorm(mu, sigma, 20));
  const [bs_means, setBsMeans] = useState([]);
  const runBootstrap = useCallback(() => {
    const means = Array.from({length:500}, () => {
      const resample = Array.from({length: bs_orig.length}, () => bs_orig[Math.floor(rng()*bs_orig.length)]);
      return resample.reduce((a,b)=>a+b,0)/resample.length;
    });
    means.sort((a,b)=>a-b);
    setBsMeans(means);
  }, [bs_orig]);
  const bs_ci = bs_means.length >= 20 ? [bs_means[Math.floor(bs_means.length*0.025)], bs_means[Math.floor(bs_means.length*0.975)]] : null;
  const bs_origMean = useMemo(() => bs_orig.reduce((a,b)=>a+b,0)/bs_orig.length, [bs_orig]);
  const bs_hist = useMemo(() => {
    if (!bs_means.length) return [];
    const bins = 30;
    const lo = bs_means[0], hi = bs_means[bs_means.length-1];
    const bw = (hi-lo)/bins || 1;
    const counts = Array(bins).fill(0);
    bs_means.forEach(v => { const i = Math.min(bins-1, Math.floor((v-lo)/bw)); counts[i]++; });
    return counts.map((c,i) => ({ x: lo+i*bw+bw/2, c }));
  }, [bs_means]);

  /* Tab 4: Sample Size */
  const [ss_me, setSsMe] = useState(3);
  const [ss_level, setSsLevel] = useState(95);
  const ss_z = Z[ss_level];
  const ss_n = Math.ceil((ss_z * sigma / ss_me) ** 2);

  const W = 520, H = 280, pad = 40;

  const renderTab0 = () => {
    const xMin = mu - 3*sigma/Math.sqrt(pe_n), xMax = mu + 3*sigma/Math.sqrt(pe_n);
    const xScale = v => pad + (v - xMin)/(xMax - xMin)*(W - 2*pad);
    return (<>
      <h3 style={S.title}>Point Estimates: Sample Mean as Estimator of {'\u03BC'}</h3>
      <p style={S.sub}>Each dot is an x&#772; from a sample of n={pe_n}. The grand mean of all x&#772; values converges to {'\u03BC'}={mu}.</p>
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',maxWidth:W}}>
          <line x1={xScale(mu)} y1={20} x2={xScale(mu)} y2={H-30} stroke={C.accent} strokeWidth={2} strokeDasharray="6,4"/>
          <text x={xScale(mu)} y={14} fill={C.accentLight} fontSize={11} textAnchor="middle">{'\u03BC'}={mu}</text>
          <line x1={pad} y1={H-30} x2={W-pad} y2={H-30} stroke={C.borderLight} strokeWidth={1}/>
          {pe_samples.map((m, i) => (
            <circle key={i} cx={xScale(m)} cy={H - 50 - i*7} r={4} fill={C.cyan} opacity={0.8}/>
          ))}
          {pe_grand !== null && <>
            <line x1={xScale(pe_grand)} y1={25} x2={xScale(pe_grand)} y2={H-30} stroke={C.green} strokeWidth={1.5} strokeDasharray="3,3"/>
            <text x={xScale(pe_grand)} y={H-16} fill={C.green} fontSize={10} textAnchor="middle">grand mean={pe_grand.toFixed(2)}</text>
          </>}
        </svg>
      </div>
      <div style={S.controls}>
        <div style={S.cg}><span style={S.label}>n</span>
          <input type="range" min={5} max={100} value={pe_n} onChange={e=>setPeN(+e.target.value)} style={S.slider}/>
          <span style={S.val}>{pe_n}</span></div>
        <button style={S.btn(true)} onClick={drawSample}>Draw Sample</button>
        <button style={S.btn(false)} onClick={()=>setPeSamples([])}>Reset</button>
      </div>
      <div style={S.eq}>x&#772; is an unbiased estimator of {'\u03BC'}: E[x&#772;] = {'\u03BC'}, &nbsp; SE = {'\u03C3'}/{'\u221A'}n = {(sigma/Math.sqrt(pe_n)).toFixed(2)}</div>
      <div style={S.note}><span style={S.noteT}>Practical Insight</span>
        <p style={S.noteP}>Draw several samples and watch the dots cluster around {'\u03BC'}. Larger n produces tighter clustering (smaller SE), meaning each individual estimate is more precise.</p></div>
      <div style={S.mistake}><span style={S.mistakeT}>Common Mistake</span>
        <p style={S.noteP}>Reporting a point estimate without any measure of uncertainty. A single x&#772; tells you nothing about how precise it is — always pair it with a standard error or confidence interval.</p></div>
    </>);
  };

  const renderTab1 = () => {
    const xMin = mu - 12, xMax = mu + 12;
    const xScale = v => pad + (v - xMin)/(xMax - xMin)*(W - 2*pad);
    const h = Math.max(H, ci_data.length * 3 + 60);
    return (<>
      <h3 style={S.title}>100 Confidence Intervals</h3>
      <p style={S.sub}>Each horizontal segment is a {ci_level}% CI. Red intervals miss {'\u03BC'}. Hit rate: {ci_hitRate}/100.</p>
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${W} ${h}`} style={{width:'100%',maxWidth:W}}>
          <line x1={xScale(mu)} y1={10} x2={xScale(mu)} y2={h-10} stroke={C.accent} strokeWidth={2} strokeDasharray="6,4"/>
          <text x={xScale(mu)} y={8} fill={C.accentLight} fontSize={11} textAnchor="middle">{'\u03BC'}={mu}</text>
          {ci_data.map((c, i) => {
            const y = 20 + i * 3;
            const col = c.hit ? C.green : C.red;
            return <g key={i}>
              <line x1={xScale(c.lo)} y1={y} x2={xScale(c.hi)} y2={y} stroke={col} strokeWidth={1.5} opacity={0.7}/>
              <circle cx={xScale(c.m)} cy={y} r={1.5} fill={col}/>
            </g>;
          })}
        </svg>
      </div>
      <div style={S.controls}>
        <div style={S.cg}><span style={S.label}>Confidence Level</span>
          {[80,90,95,99].map(l => <button key={l} style={S.btn(ci_level===l)} onClick={()=>setCiLevel(l)}>{l}%</button>)}</div>
        <button style={S.btn(true)} onClick={genCIs}>Generate 100 CIs</button>
      </div>
      <div style={S.eq}>CI = x&#772; {'\u00B1'} z* {'\u00D7'} SE, &nbsp; z*({ci_level}%) = {Z[ci_level]}</div>
      <div style={S.note}><span style={S.noteT}>Practical Insight</span>
        <p style={S.noteP}>Try switching between 80% and 99%. Higher confidence means wider intervals — you pay for more confidence with less precision. The tradeoff is fundamental.</p></div>
      <div style={S.mistake}><span style={S.mistakeT}>Common Mistake</span>
        <p style={S.noteP}>"There is a 95% probability that {'\u03BC'} is in this interval." Wrong! {'\u03BC'} is fixed. The 95% refers to the procedure — if we repeated it many times, 95% of the intervals would capture {'\u03BC'}.</p></div>
    </>);
  };

  const renderTab2 = () => {
    const nVals = [25,50,100,200,400,800,1600];
    const bars = nVals.map(n => ({ n, me: Z[me_level] * sigma / Math.sqrt(n) }));
    const maxME = bars[0].me;
    const bw = (W - 2*pad) / bars.length - 8;
    return (<>
      <h3 style={S.title}>Margin of Error</h3>
      <p style={S.sub}>ME = z* {'\u00D7'} {'\u03C3'}/{'\u221A'}n. Larger samples yield smaller margins of error. Current ME = {'\u00B1'}{me_val.toFixed(2)}.</p>
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',maxWidth:W}}>
          {bars.map((b, i) => {
            const x = pad + i*((W-2*pad)/bars.length) + 4;
            const barH = (b.me/maxME)*(H-80);
            const col = b.n === me_n ? C.accent : C.faint;
            return <g key={i}>
              <rect x={x} y={H-40-barH} width={bw} height={barH} rx={4} fill={col} opacity={0.7}/>
              <text x={x+bw/2} y={H-26} fill={C.muted} fontSize={9} textAnchor="middle">n={b.n}</text>
              <text x={x+bw/2} y={H-44-barH} fill={C.text} fontSize={9} textAnchor="middle">{'\u00B1'}{b.me.toFixed(1)}</text>
            </g>;
          })}
        </svg>
      </div>
      <div style={S.controls}>
        <div style={S.cg}><span style={S.label}>n</span>
          <input type="range" min={25} max={1600} step={25} value={me_n} onChange={e=>setMeN(+e.target.value)} style={S.slider}/>
          <span style={S.val}>{me_n}</span></div>
        <div style={S.cg}><span style={S.label}>Level</span>
          {[80,90,95,99].map(l => <button key={l} style={S.btn(me_level===l)} onClick={()=>setMeLevel(l)}>{l}%</button>)}</div>
      </div>
      <div style={S.note}><span style={S.noteT}>Practical Insight</span>
        <p style={S.noteP}>Election polls typically use n {'\u2248'} 1000, giving ME {'\u2248'} {'\u00B1'}{(1.96*0.5/Math.sqrt(1000)*100).toFixed(1)} percentage points (for proportions near 50%).</p></div>
      <div style={S.mistake}><span style={S.mistakeT}>Common Mistake</span>
        <p style={S.noteP}>Thinking the margin of error accounts for all sources of error. It only covers sampling variability — not nonresponse bias, question wording effects, or coverage error.</p></div>
    </>);
  };

  const renderTab3 = () => {
    const origMean = bs_origMean;
    const hist = bs_hist;
    const maxC = Math.max(1, ...hist.map(h=>h.c));
    const xMin = bs_means.length ? bs_means[0]-1 : 85, xMax = bs_means.length ? bs_means[bs_means.length-1]+1 : 115;
    const xScale = v => pad + (v-xMin)/(xMax-xMin)*(W-2*pad);
    const bw2 = bs_means.length ? (W-2*pad)/30 - 1 : 10;
    return (<>
      <h3 style={S.title}>Bootstrap Resampling</h3>
      <p style={S.sub}>Original sample (n={bs_orig.length}), x&#772;={origMean.toFixed(2)}. Resample with replacement 500 times to build a distribution of means.</p>
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',maxWidth:W}}>
          <line x1={pad} y1={H-35} x2={W-pad} y2={H-35} stroke={C.borderLight} strokeWidth={1}/>
          {hist.map((h,i) => {
            const barH = (h.c/maxC)*(H-80);
            return <rect key={i} x={xScale(h.x)-bw2/2} y={H-35-barH} width={bw2} height={barH} rx={2} fill={C.violet} opacity={0.7}/>;
          })}
          {bs_ci && <>
            <line x1={xScale(bs_ci[0])} y1={20} x2={xScale(bs_ci[0])} y2={H-35} stroke={C.amber} strokeWidth={1.5} strokeDasharray="4,3"/>
            <line x1={xScale(bs_ci[1])} y1={20} x2={xScale(bs_ci[1])} y2={H-35} stroke={C.amber} strokeWidth={1.5} strokeDasharray="4,3"/>
            <text x={xScale(bs_ci[0])} y={14} fill={C.amber} fontSize={9} textAnchor="middle">{bs_ci[0].toFixed(1)}</text>
            <text x={xScale(bs_ci[1])} y={14} fill={C.amber} fontSize={9} textAnchor="middle">{bs_ci[1].toFixed(1)}</text>
            <rect x={xScale(bs_ci[0])} y={H-38} width={xScale(bs_ci[1])-xScale(bs_ci[0])} height={6} rx={3} fill={C.amber} opacity={0.3}/>
          </>}
          <line x1={xScale(origMean)} y1={20} x2={xScale(origMean)} y2={H-35} stroke={C.cyan} strokeWidth={1.5}/>
          <text x={xScale(origMean)} y={H-22} fill={C.cyan} fontSize={9} textAnchor="middle">x&#772;={origMean.toFixed(1)}</text>
        </svg>
      </div>
      <div style={S.controls}>
        <button style={S.btn(true)} onClick={runBootstrap}>Run 500 Bootstrap Resamples</button>
        {bs_ci && <span style={{...S.val, minWidth:200}}>95% Bootstrap CI: [{bs_ci[0].toFixed(2)}, {bs_ci[1].toFixed(2)}]</span>}
      </div>
      <div style={S.eq}>Bootstrap CI: use the 2.5th and 97.5th percentiles of the bootstrap distribution</div>
      <div style={S.note}><span style={S.noteT}>Practical Insight</span>
        <p style={S.noteP}>Bootstrap is powerful when the sampling distribution of your statistic is unknown or hard to derive analytically. It works for medians, ratios, regression coefficients — not just means.</p></div>
      <div style={S.mistake}><span style={S.mistakeT}>Common Mistake</span>
        <p style={S.noteP}>Bootstrap cannot fix a biased or non-representative original sample. If your original data is biased, all 500 resamples inherit that bias. Garbage in, garbage out.</p></div>
    </>);
  };

  const renderTab4 = () => {
    const meVals = [1,2,3,4,5,6];
    const bars = meVals.map(me => ({ me, n: Math.ceil((ss_z*sigma/me)**2) }));
    const maxN = bars[0].n;
    const bw = (W-2*pad)/bars.length - 8;
    return (<>
      <h3 style={S.title}>Required Sample Size</h3>
      <p style={S.sub}>Given desired ME={'\u00B1'}{ss_me} and {ss_level}% confidence: n = (z*{'\u00B7'}{'\u03C3'}/ME){'\u00B2'} = {ss_n}</p>
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',maxWidth:W}}>
          {bars.map((b,i) => {
            const x = pad + i*((W-2*pad)/bars.length) + 4;
            const barH = Math.min((b.n/maxN)*(H-80), H-80);
            const col = b.me === ss_me ? C.accent : C.faint;
            return <g key={i}>
              <rect x={x} y={H-40-barH} width={bw} height={barH} rx={4} fill={col} opacity={0.7}/>
              <text x={x+bw/2} y={H-26} fill={C.muted} fontSize={9} textAnchor="middle">ME={'\u00B1'}{b.me}</text>
              <text x={x+bw/2} y={H-44-barH} fill={C.text} fontSize={9} textAnchor="middle">n={b.n}</text>
            </g>;
          })}
        </svg>
      </div>
      <div style={S.controls}>
        <div style={S.cg}><span style={S.label}>Desired ME</span>
          <input type="range" min={1} max={6} step={0.5} value={ss_me} onChange={e=>setSsMe(+e.target.value)} style={S.slider}/>
          <span style={S.val}>{'\u00B1'}{ss_me}</span></div>
        <div style={S.cg}><span style={S.label}>Level</span>
          {[80,90,95,99].map(l => <button key={l} style={S.btn(ss_level===l)} onClick={()=>setSsLevel(l)}>{l}%</button>)}</div>
      </div>
      <div style={S.note}><span style={S.noteT}>Cost-Precision Tradeoff</span>
        <p style={S.noteP}>Halving the margin of error requires 4{'\u00D7'} the sample size. Going from ME={'\u00B1'}6 to {'\u00B1'}3 means ~4{'\u00D7'} more respondents and cost. Diminishing returns set in quickly.</p></div>
      <div style={S.eq}>n = (z* {'\u00D7'} {'\u03C3'} / ME){'\u00B2'} &nbsp;|&nbsp; {'\u221A'}n relationship: 4{'\u00D7'}n {'\u2192'} 2{'\u00D7'} precision</div>
      <div style={S.mistake}><span style={S.mistakeT}>Common Mistake</span>
        <p style={S.noteP}>Thinking that doubling the sample size halves the margin of error. Because ME depends on {'\u221A'}n, you must quadruple n to halve ME.</p></div>
    </>);
  };

  const panels = [renderTab0, renderTab1, renderTab2, renderTab3, renderTab4];

  return (
    <div style={S.container}>
      <div style={S.topicBar}>
        {TABS.map((t,i) => <button key={i} style={S.topicTab(tab===i)} onClick={()=>setTab(i)}>{t}</button>)}
      </div>
      <div style={S.body}>
        <div style={S.section}>{panels[tab]()}</div>
      </div>
    </div>
  );
}
