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

const Sl = ({label,v,set,min=0,max=1,step=0.01}) => (
  <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:C.muted,minWidth:0}}>
    <span style={{whiteSpace:'nowrap'}}>{label}</span>
    <input type="range" min={min} max={max} step={step} value={v} onChange={e=>set(+e.target.value)}
      style={{flex:1,minWidth:60,accentColor:C.accent}} />
    <span style={{fontFamily:'monospace',color:C.mono,fontSize:12,minWidth:36,textAlign:'right'}}>{typeof v==='number'&&v%1?v.toFixed(2):v}</span>
  </label>
);

const Mistake = ({text}) => (
  <div style={{...S.note, background:'rgba(239,68,68,0.08)', borderLeftColor:C.red}}>
    <span style={{...S.noteT, color:C.red}}>Common Mistake</span>
    <p style={S.noteP}>{text}</p>
  </div>
);

const comb = (n,k) => { if(k>n||k<0) return 0; if(k===0||k===n) return 1; let r=1; for(let i=0;i<Math.min(k,n-k);i++) r=r*(n-i)/(i+1); return Math.round(r); };
const binPmf = (k,n,p) => comb(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k);

/* ── Tab 1: Probability Rules ─────────────────────────────── */
function ProbRules() {
  const [pA, setPa] = useState(0.40);
  const [pB, setPb] = useState(0.35);
  const [ov, setOv] = useState(0.15);
  const pAB = Math.min(ov, pA, pB);
  const pUnion = pA + pB - pAB;
  const cx = 200, cy = 120, r = 68;
  const overlap = Math.max(0, Math.min(1, pAB / Math.min(pA || 0.01, pB || 0.01)));
  const sep = r * 2 * (1 - overlap * 0.7);

  return <>
    <h3 style={S.title}>Probability Rules</h3>
    <p style={S.sub}>Marketing campaign: what fraction of customers does Campaign A or B reach?</p>
    <div style={S.svgWrap}>
      <svg viewBox="0 0 400 270" style={{width:'100%', maxWidth:420}}>
        <rect width="400" height="270" rx="12" fill={C.surfaceAlt} />
        <text x="390" y="20" fill={C.faint} fontSize="11" textAnchor="end">Sample Space S</text>
        <circle cx={cx-sep/2} cy={cy} r={r} fill="rgba(99,102,241,0.22)" stroke={C.accent} strokeWidth="1.5"/>
        <circle cx={cx+sep/2} cy={cy} r={r} fill="rgba(236,72,153,0.18)" stroke={C.pink} strokeWidth="1.5"/>
        <text x={cx-sep/2-28} y={cy+5} fill={C.accentLight} fontSize="14" fontWeight="700" textAnchor="middle">A</text>
        <text x={cx+sep/2+28} y={cy+5} fill={C.pink} fontSize="14" fontWeight="700" textAnchor="middle">B</text>
        <text x={cx} y={cy-4} fill={C.text} fontSize="11" textAnchor="middle">A{'\u2229'}B</text>
        <text x={cx} y={cy+12} fill={C.amber} fontSize="12" fontWeight="600" textAnchor="middle">{pAB.toFixed(2)}</text>
        <text x={cx-sep/2-28} y={cy+22} fill={C.muted} fontSize="10" textAnchor="middle">{(pA-pAB).toFixed(2)}</text>
        <text x={cx+sep/2+28} y={cy+22} fill={C.muted} fontSize="10" textAnchor="middle">{(pB-pAB).toFixed(2)}</text>
        <text x={cx} y={240} fill={C.dim} fontSize="11" textAnchor="middle">
          P(A{'\u222A'}B) = {pUnion.toFixed(3)}  |  P(A') = {(1-pA).toFixed(2)}  |  P(neither) = {Math.max(0,1-pUnion).toFixed(3)}
        </text>
      </svg>
    </div>
    <code style={S.eq}>P(A{'\u222A'}B) = P(A) + P(B) - P(A{'\u2229'}B) = {pA.toFixed(2)} + {pB.toFixed(2)} - {pAB.toFixed(2)} = {pUnion.toFixed(3)}</code>
    <div style={S.note}>
      <span style={S.noteT}>Practical Insight</span>
      <p style={S.noteP}>If Campaign A reaches {(pA*100).toFixed(0)}% and B reaches {(pB*100).toFixed(0)}% of customers with {(pAB*100).toFixed(0)}% overlap, total unique reach is {(pUnion*100).toFixed(1)}% -- not {((pA+pB)*100).toFixed(0)}%.</p>
    </div>
    <Mistake text="Forgetting to subtract P(A\u2229B) when computing the union. Without it you double-count the overlap, inflating your reach estimate." />
    <div style={S.controls}>
      <Sl label="P(A)" v={pA} set={setPa} />
      <Sl label="P(B)" v={pB} set={setPb} />
      <Sl label="P(A\u2229B)" v={ov} set={setOv} max={0.5} />
    </div>
  </>;
}

/* ── Tab 2: Conditional Probability ───────────────────────── */
function CondProb() {
  const [prev, setPrev] = useState(0.01);
  const [sens, setSens] = useState(0.95);
  const [spec, setSpec] = useState(0.90);
  const pPos = sens * prev + (1 - spec) * (1 - prev);
  const ppv = pPos > 0 ? (sens * prev) / pPos : 0;
  const branches = [
    { lbl: 'Disease', p: prev, col: C.red,
      children: [
        { lbl: 'Test +', p: sens, col: C.amber },
        { lbl: 'Test \u2212', p: 1 - sens, col: C.dim },
      ]},
    { lbl: 'No Disease', p: 1 - prev, col: C.green,
      children: [
        { lbl: 'Test +', p: 1 - spec, col: C.amber },
        { lbl: 'Test \u2212', p: spec, col: C.dim },
      ]},
  ];

  return <>
    <h3 style={S.title}>Conditional Probability</h3>
    <p style={S.sub}>
      Medical test: given a positive result, what is the true probability of disease?
    </p>
    <div style={S.svgWrap}>
      <svg viewBox="0 0 460 230" style={{width:'100%', maxWidth:480}}>
        <circle cx="50" cy="115" r="6" fill={C.accent} />
        <text x="50" y="105" fill={C.muted} fontSize="10" textAnchor="middle">Start</text>
        {branches.map((br, i) => {
          const y0 = 115, y1 = 58 + i * 114;
          return <g key={i}>
            <line x1="56" y1={y0} x2="160" y2={y1}
              stroke={C.borderLight} strokeWidth="1.5" />
            <text x="100" y={i === 0 ? y0 - 28 : y0 + 22}
              fill={C.muted} fontSize="10" fontWeight="600">
              {br.p.toFixed(3)}
            </text>
            <rect x="162" y={y1 - 12} width="80" height="22" rx="6"
              fill={br.col} opacity={0.15} />
            <text x="202" y={y1 + 4} fill={br.col}
              fontSize="12" fontWeight="600" textAnchor="middle">
              {br.lbl}
            </text>
            {br.children.map((ch, j) => {
              const y2 = y1 - 28 + j * 56;
              const joint = br.p * ch.p;
              return <g key={j}>
                <line x1="244" y1={y1} x2="340" y2={y2}
                  stroke={C.borderLight} strokeWidth="1" />
                <text x="286" y={j === 0 ? y1 - 12 : y1 + 16}
                  fill={C.faint} fontSize="10">
                  {ch.p.toFixed(3)}
                </text>
                <text x="348" y={y2 + 4} fill={ch.col} fontSize="11">
                  {ch.lbl}
                </text>
                <text x="430" y={y2 + 4} fill={C.mono} fontSize="10"
                  textAnchor="end">
                  {joint.toFixed(5)}
                </text>
              </g>;
            })}
          </g>;
        })}
        <text x="430" y="20" fill={C.faint} fontSize="9" textAnchor="end">
          Joint P
        </text>
      </svg>
    </div>
    <code style={S.eq}>
      P(Disease | +) = P(+|D){'\u00B7'}P(D) / P(+) = {(sens * prev).toFixed(5)} / {pPos.toFixed(5)} = {ppv.toFixed(4)}
    </code>
    <div style={S.note}>
      <span style={S.noteT}>Insight</span>
      <p style={S.noteP}>
        With {(prev * 100).toFixed(1)}% prevalence, even a {(sens * 100).toFixed(0)}%-sensitive
        / {(spec * 100).toFixed(0)}%-specific test yields PPV of only {(ppv * 100).toFixed(1)}%.
        Most positives are false alarms.
      </p>
    </div>
    <Mistake text="Confusing P(Positive|Disease) with P(Disease|Positive) -- the prosecutor's fallacy. A 95% sensitive test does NOT mean a positive result gives a 95% chance of disease." />
    <div style={S.controls}>
      <Sl label="Prevalence" v={prev} set={setPrev} max={0.3} />
      <Sl label="Sensitivity" v={sens} set={setSens} min={0.5} />
      <Sl label="Specificity" v={spec} set={setSpec} min={0.5} />
    </div>
  </>;
}

/* ── Tab 3: Expected Value ────────────────────────────────── */
function ExpValue() {
  const [cost, setCost] = useState(2);
  const outcomes = [
    { face: '1', pay: 0 }, { face: '2', pay: 0 }, { face: '3', pay: 3 },
    { face: '4', pay: 3 }, { face: '5', pay: 5 }, { face: '6', pay: 10 },
  ];
  const ev = useMemo(() => outcomes.reduce((s, o) => s + o.pay / 6, 0), []);
  const net = ev - cost;
  const W = 380, H = 180, pad = 40, maxPay = 10;

  return <>
    <h3 style={S.title}>Expected Value</h3>
    <p style={S.sub}>Dice game: pay ${cost.toFixed(2)} to roll once. Should you play?</p>
    <div style={S.svgWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', maxWidth:400}}>
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad}
          stroke={C.borderLight} strokeWidth="1" />
        {outcomes.map((o, i) => {
          const bw = (W - 2 * pad) / 6 - 4;
          const x = pad + i * (bw + 4);
          const h = (o.pay / maxPay) * (H - pad - 20);
          return <g key={i}>
            <rect x={x} y={H - pad - h} width={bw} height={Math.max(h, 1)}
              rx="4" fill={o.pay > 0 ? C.green : C.faint} opacity={0.7} />
            <text x={x + bw / 2} y={H - pad + 16} fill={C.muted}
              fontSize="12" textAnchor="middle">
              {o.face}
            </text>
            <text x={x + bw / 2} y={H - pad - h - 6} fill={C.text}
              fontSize="11" textAnchor="middle" fontWeight="600">
              ${o.pay}
            </text>
          </g>;
        })}
        {/* EV line */}
        {(() => {
          const evY = H - pad - (ev / maxPay) * (H - pad - 20);
          return <>
            <line x1={pad} y1={evY} x2={W - pad} y2={evY}
              stroke={C.amber} strokeWidth="1.5" strokeDasharray="6 3" />
            <text x={W - pad + 4} y={evY + 4} fill={C.amber} fontSize="10">
              E[X]=${ev.toFixed(2)}
            </text>
          </>;
        })()}
        <text x={W / 2} y={16} fill={C.dim} fontSize="11" textAnchor="middle">
          Payoff per face (each P = 1/6)
        </text>
      </svg>
    </div>
    <code style={S.eq}>
      E[X] = {'\u03A3'} x{'\u00B7'}P(x) = (0+0+3+3+5+10)/6 = ${ev.toFixed(2)}
    </code>
    <code style={S.eq}>
      Net = E[X] {'\u2212'} Cost = ${ev.toFixed(2)} {'\u2212'} ${cost.toFixed(2)} = {net >= 0 ? '+' : ''}{net.toFixed(2)} {net > 0.005 ? '\u2192 Play!' : net < -0.005 ? '\u2192 Don\'t play' : '\u2192 Fair game'}
    </code>
    <div style={S.note}>
      <span style={S.noteT}>Practical Insight</span>
      <p style={S.noteP}>
        The fair price is ${ev.toFixed(2)}. A casino sets cost above this to guarantee
        long-run profit. Adjust the slider to find the break-even point.
      </p>
    </div>
    <Mistake text="Thinking expected value means the 'most likely outcome.' E[X] = $3.50 doesn't mean you'll ever win exactly $3.50 on a single roll -- it's the long-run average over many plays." />
    <div style={S.controls}>
      <Sl label="Cost to play ($)" v={cost} set={setCost} min={0} max={10} step={0.25} />
    </div>
  </>;
}

/* ── Tab 4: Bernoulli + Binomial ──────────────────────────── */
function BinomialTab() {
  const [n, setN] = useState(10);
  const [p, setP] = useState(0.5);
  const [samples, setSamples] = useState([]);
  const animRef = useRef(null);

  const pmf = useMemo(
    () => Array.from({ length: n + 1 }, (_, k) => ({ k, pr: binPmf(k, n, p) })),
    [n, p]
  );
  const mu = n * p, variance = n * p * (1 - p);
  const sigma = Math.sqrt(variance);
  const maxPr = Math.max(...pmf.map(d => d.pr));

  const runSample = useCallback(() => {
    setSamples([]);
    let i = 0;
    clearInterval(animRef.current);
    animRef.current = setInterval(() => {
      const hits = Array.from({ length: n }, () => Math.random() < p ? 1 : 0)
        .reduce((a, b) => a + b, 0);
      setSamples(prev => [...prev.slice(-199), hits]);
      if (++i >= 60) clearInterval(animRef.current);
    }, 70);
  }, [n, p]);

  useEffect(() => () => clearInterval(animRef.current), []);

  const W = 440, H = 200, pad = 32;
  const bw = Math.min((W - 2 * pad) / (n + 1) - 2, 26);

  return <>
    <h3 style={S.title}>Bernoulli + Binomial Distribution</h3>
    <p style={S.sub}>
      Conversion rate scenario: {n} independent visitors, each converts with
      probability p = {p.toFixed(2)}.
    </p>
    <div style={S.svgWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', maxWidth:460}}>
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad}
          stroke={C.borderLight} strokeWidth="1" />
        {pmf.map(({ k, pr }) => {
          const x = pad + k * (bw + 2);
          const h = maxPr > 0 ? (pr / maxPr) * (H - pad - 24) : 0;
          const sFreq = samples.filter(s => s === k).length;
          const sH = samples.length > 0
            ? (sFreq / samples.length) / maxPr * (H - pad - 24) : 0;
          return <g key={k}>
            <rect x={x} y={H - pad - h} width={bw} height={h}
              rx="3" fill={C.accent} opacity={0.65} />
            {samples.length > 0 && (
              <rect x={x + bw * 0.12} y={H - pad - sH}
                width={bw * 0.76} height={sH}
                rx="2" fill={C.amber} opacity={0.55} />
            )}
            <text x={x + bw / 2} y={H - pad + 14}
              fill={C.faint} fontSize={n > 20 ? 7 : 10} textAnchor="middle">
              {k}
            </text>
          </g>;
        })}
        {/* Mean marker */}
        {(() => {
          const mx = pad + mu * (bw + 2) + bw / 2;
          return <line x1={mx} y1={H - pad + 2} x2={mx} y2={20}
            stroke={C.cyan} strokeWidth="1" strokeDasharray="4 3" opacity={0.7} />;
        })()}
        <text x={W - 8} y={16} fill={C.dim} fontSize="10" textAnchor="end">
          {samples.length > 0 ? `${samples.length} samples (amber)` : 'PMF (purple)'}
        </text>
      </svg>
    </div>
    <code style={S.eq}>
      X ~ Bin({n}, {p.toFixed(2)})  |  {'\u03BC'} = np = {mu.toFixed(2)}  |  {'\u03C3\u00B2'} = npq = {variance.toFixed(2)}  |  {'\u03C3'} = {sigma.toFixed(2)}
    </code>
    <div style={{display:'flex', gap:10, flexWrap:'wrap', alignItems:'center'}}>
      <button onClick={runSample}
        style={{padding:'6px 14px', background:C.accent, color:'#fff', border:'none',
          borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer'}}>
        Animate 60 Samples
      </button>
      {samples.length > 0 && (
        <span style={{fontSize:11, color:C.muted}}>
          Sample mean: {(samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(2)} (theory: {mu.toFixed(2)})
        </span>
      )}
    </div>
    <div style={S.note}>
      <span style={S.noteT}>Practical Insight</span>
      <p style={S.noteP}>
        With n={n} trials and p={p.toFixed(2)}, expect about {mu.toFixed(1)} conversions
        ({'\u00B1'}{sigma.toFixed(1)}). Watch the amber histogram converge to the
        theoretical PMF as samples accumulate.
      </p>
    </div>
    <Mistake text="Using the binomial model when trials aren't independent. If selecting without replacement from a small population, use the hypergeometric distribution instead." />
    <div style={S.controls}>
      <Sl label="n (trials)" v={n} set={setN} min={1} max={30} step={1} />
      <Sl label="p (success prob)" v={p} set={setP} />
    </div>
  </>;
}

/* ── Tab 5: Bayes in Screening ────────────────────────────── */
function BayesScreen() {
  const [prev, setPrev] = useState(0.02);
  const [sens, setSens] = useState(0.90);
  const [spec, setSpec] = useState(0.95);
  const N = 1000;
  const sick = Math.round(N * prev), healthy = N - sick;
  const tp = Math.round(sick * sens), fn = sick - tp;
  const fp = Math.round(healthy * (1 - spec)), tn = healthy - fp;
  const ppv = tp + fp > 0 ? tp / (tp + fp) : 0;
  const npv = tn + fn > 0 ? tn / (tn + fn) : 0;

  const cellS = {
    padding: '8px 12px',
    border: `1px solid ${C.borderLight}`,
    fontSize: 12,
    textAlign: 'center',
  };

  const segments = [
    { lbl: 'TP', v: tp, c: C.green },
    { lbl: 'FP', v: fp, c: C.red },
    { lbl: 'FN', v: fn, c: C.orange },
    { lbl: 'TN', v: tn, c: C.teal },
  ];

  return <>
    <h3 style={S.title}>Bayes in Screening</h3>
    <p style={S.sub}>
      Out of {N} people screened, how many positive results actually indicate disease?
    </p>
    <div style={{overflowX:'auto', margin:'8px 0'}}>
      <table style={{
        borderCollapse:'collapse', margin:'0 auto',
        background:C.surfaceAlt, borderRadius:10, overflow:'hidden',
      }}>
        <thead>
          <tr style={{background:C.surface}}>
            <th style={cellS}></th>
            <th style={{...cellS, color:C.red}}>Disease +</th>
            <th style={{...cellS, color:C.green}}>Disease {'\u2212'}</th>
            <th style={{...cellS, color:C.muted}}>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{...cellS, color:C.amber, fontWeight:600}}>Test +</td>
            <td style={{...cellS, color:C.cyan, fontWeight:700}}>{tp}</td>
            <td style={cellS}>{fp}</td>
            <td style={{...cellS, fontWeight:600}}>{tp + fp}</td>
          </tr>
          <tr>
            <td style={{...cellS, color:C.amber, fontWeight:600}}>Test {'\u2212'}</td>
            <td style={cellS}>{fn}</td>
            <td style={{...cellS, color:C.cyan, fontWeight:700}}>{tn}</td>
            <td style={{...cellS, fontWeight:600}}>{fn + tn}</td>
          </tr>
          <tr style={{background:C.surface}}>
            <td style={{...cellS, fontWeight:700}}>Total</td>
            <td style={cellS}>{sick}</td>
            <td style={cellS}>{healthy}</td>
            <td style={{...cellS, fontWeight:700}}>{N}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style={S.svgWrap}>
      <svg viewBox="0 0 420 110" style={{width:'100%', maxWidth:440}}>
        {segments.reduce((acc, d, i) => {
          const w = (d.v / N) * 360;
          const x0 = acc.x;
          acc.els.push(
            <g key={i}>
              <rect x={30 + x0} y={20} width={Math.max(w, 1)} height={44}
                fill={d.c} opacity={0.55} rx="2" />
              {w > 22 && (
                <text x={30 + x0 + w / 2} y={46} fill="#fff"
                  fontSize="10" textAnchor="middle" fontWeight="600">
                  {d.lbl}={d.v}
                </text>
              )}
            </g>
          );
          acc.x += w;
          return acc;
        }, { x: 0, els: [] }).els}
        <text x="210" y={86} fill={C.muted} fontSize="11" textAnchor="middle">
          Natural frequencies: {N} people
        </text>
        <text x="210" y={100} fill={C.dim} fontSize="10" textAnchor="middle">
          Green = correct | Red/Orange = errors
        </text>
      </svg>
    </div>
    <code style={S.eq}>
      PPV = TP / (TP + FP) = {tp} / ({tp} + {fp}) = {(ppv * 100).toFixed(1)}%  |  NPV = {(npv * 100).toFixed(1)}%
    </code>
    <div style={S.note}>
      <span style={S.noteT}>Practical Insight</span>
      <p style={S.noteP}>
        With only {(prev * 100).toFixed(1)}% prevalence, {fp} of {tp + fp} positive
        results are false alarms. Increase prevalence (targeted screening)
        to dramatically improve PPV.
      </p>
    </div>
    <Mistake text="Ignoring the base rate (base-rate neglect). Even an excellent test has poor PPV when the disease is rare, because false positives from the large healthy group swamp true positives from the tiny sick group." />
    <div style={S.controls}>
      <Sl label="Prevalence" v={prev} set={setPrev} max={0.30} />
      <Sl label="Sensitivity" v={sens} set={setSens} min={0.5} />
      <Sl label="Specificity" v={spec} set={setSpec} min={0.5} />
    </div>
  </>;
}

/* ── Main Component ───────────────────────────────────────── */
const tabs = [
  'Probability Rules', 'Conditional Prob', 'Expected Value',
  'Bernoulli + Binomial', 'Bayes in Screening',
];
const panels = [ProbRules, CondProb, ExpValue, BinomialTab, BayesScreen];

export default function ProbabilityAndBinomial() {
  const [tab, setTab] = useState(0);
  const Panel = panels[tab];

  return (
    <div style={S.container}>
      <div style={S.topicBar}>
        {tabs.map((t, i) => (
          <button key={i} style={S.topicTab(tab === i)}
            onClick={() => setTab(i)}>
            {t}
          </button>
        ))}
      </div>
      <div style={S.body}>
        <div style={S.section}>
          <Panel />
        </div>
      </div>
    </div>
  );
}
