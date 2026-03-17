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
  cg:{ display:'flex', alignItems:'center', gap:8 },
  label:{ fontSize:12, color:C.muted, fontWeight:500, whiteSpace:'nowrap' },
  slider:{ width:110, accentColor:C.accent, cursor:'pointer' },
  val:{ fontSize:12, color:C.dim, fontFamily:'monospace', minWidth:46, textAlign:'right' },
  btn:c=>({ padding:'6px 14px', borderRadius:8, border:'none', background:c||C.accent, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }),
};

const TABS = [
  { id:'null-alt', label:'Null vs Alternative' },
  { id:'test-stat', label:'Test Statistic' },
  { id:'p-value', label:'P-Value' },
  { id:'power', label:'Type I/II + Power' },
  { id:'multiple', label:'Multiple Testing' },
];

const norm = (x, mu, sig) => Math.exp(-0.5*((x-mu)/sig)**2)/(sig*Math.sqrt(2*Math.PI));
const normCDF = (z) => { const t=1/(1+0.2316419*Math.abs(z)); const d=0.3989422804*Math.exp(-z*z/2); const p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274)))); return z>0?1-p:p; };

const CG = ({ label, min, max, step, value, set, unit }) => (
  <div style={S.cg}>
    <span style={S.label}>{label}</span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>set(+e.target.value)} style={S.slider}/>
    <span style={S.val}>{step<1?value.toFixed(step<0.01?3:step<0.1?2:1):value}{unit||''}</span>
  </div>
);

const W = 460, H = 220, M = { t:20, r:20, b:30, l:40 };
const pw = W-M.l-M.r, ph = H-M.t-M.b;

function curvePath(mu, sig, xMin, xMax, steps=120) {
  const pts = [];
  for (let i=0;i<=steps;i++) { const x=xMin+(xMax-xMin)*i/steps; pts.push([x,norm(x,mu,sig)]); }
  return pts;
}
function toSVG(pts,xMin,xMax,yMax) {
  return pts.map(([x,y])=>[M.l+(x-xMin)/(xMax-xMin)*pw, M.t+ph-y/yMax*ph]);
}
function pathD(svgPts) { return svgPts.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(''); }
function areaD(svgPts,baseline) { return pathD(svgPts)+`L${svgPts[svgPts.length-1][0].toFixed(1)},${baseline}L${svgPts[0][0].toFixed(1)},${baseline}Z`; }

function Tab1({ trueP, setTrueP }) {
  const n=100, sigNull=Math.sqrt(0.5*0.5/n), sigAlt=Math.sqrt(trueP*(1-trueP)/n);
  const xMin=0.2, xMax=0.8, yMax=norm(0.5,0.5,sigNull)*1.15;
  const nullPts=toSVG(curvePath(0.5,sigNull,xMin,xMax),xMin,xMax,yMax);
  const altPts=toSVG(curvePath(trueP,sigAlt,xMin,xMax),xMin,xMax,yMax);
  const baseline=M.t+ph;
  return (<>
    <h3 style={S.title}>Is this coin fair?</h3>
    <p style={S.sub}>H0: p = 0.5 (fair) vs H1: p = {trueP.toFixed(2)}. With n = {n} flips, how separable are these hypotheses?</p>
    <div style={S.svgWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', maxWidth:W }}>
        <path d={areaD(nullPts,baseline)} fill="rgba(99,102,241,0.18)" />
        <path d={pathD(nullPts)} fill="none" stroke={C.accent} strokeWidth={2}/>
        <path d={areaD(altPts,baseline)} fill="rgba(239,68,68,0.14)" />
        <path d={pathD(altPts)} fill="none" stroke={C.red} strokeWidth={2}/>
        <line x1={M.l} y1={baseline} x2={M.l+pw} y2={baseline} stroke={C.faint} strokeWidth={1}/>
        {[0.3,0.4,0.5,0.6,0.7].map(v=><text key={v} x={M.l+(v-xMin)/(xMax-xMin)*pw} y={baseline+14} fill={C.faint} fontSize={10} textAnchor="middle">{v}</text>)}
        <text x={M.l+pw/2} y={baseline+26} fill={C.dim} fontSize={10} textAnchor="middle">Sample proportion p-hat</text>
        <rect x={W-130} y={6} width={10} height={10} rx={2} fill={C.accent} opacity={0.6}/><text x={W-116} y={15} fill={C.muted} fontSize={10}>H0 (null)</text>
        <rect x={W-130} y={22} width={10} height={10} rx={2} fill={C.red} opacity={0.6}/><text x={W-116} y={31} fill={C.muted} fontSize={10}>H1 (alternative)</text>
      </svg>
    </div>
    <div style={S.controls}><CG label="True p" min={0.3} max={0.7} step={0.01} value={trueP} set={setTrueP}/></div>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>"Fail to reject H0" does NOT mean "H0 is true." It means we lack enough evidence to distinguish the true proportion from 0.5 given our sample size.</p></div>
  </>);
}

function Tab2({ xBar, setXBar, mu0, setMu0, sigma, setSigma, n2, setN2 }) {
  const se = sigma/Math.sqrt(n2), z = (xBar-mu0)/se;
  const xMin=mu0-4*se, xMax=mu0+4*se, yMax=norm(mu0,mu0,se)*1.15;
  const pts=toSVG(curvePath(mu0,se,xMin,xMax),xMin,xMax,yMax);
  const zX=M.l+((xBar-xMin)/(xMax-xMin))*pw, baseline=M.t+ph;
  return (<>
    <h3 style={S.title}>Computing the Test Statistic</h3>
    <p style={S.sub}>How many standard errors is x-bar from mu-0?</p>
    <span style={S.eq}>z = (x-bar - mu0) / (sigma / sqrt(n)) = ({xBar.toFixed(1)} - {mu0.toFixed(1)}) / ({sigma.toFixed(1)} / sqrt({n2})) = <b style={{color:Math.abs(z)>1.96?C.red:C.green}}>{z.toFixed(3)}</b></span>
    <div style={S.svgWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', maxWidth:W }}>
        <path d={areaD(pts,baseline)} fill="rgba(99,102,241,0.15)"/>
        <path d={pathD(pts)} fill="none" stroke={C.accent} strokeWidth={2}/>
        {zX>=M.l&&zX<=M.l+pw&&<><line x1={zX} y1={M.t} x2={zX} y2={baseline} stroke={C.amber} strokeWidth={2} strokeDasharray="4,3"/>
        <circle cx={zX} cy={M.t+ph-norm(xBar,mu0,se)/yMax*ph} r={4} fill={C.amber}/><text x={zX} y={M.t-4} fill={C.amber} fontSize={10} textAnchor="middle">z={z.toFixed(2)}</text></>}
        <line x1={M.l} y1={baseline} x2={M.l+pw} y2={baseline} stroke={C.faint} strokeWidth={1}/>
        <text x={M.l+pw/2} y={baseline+14} fill={C.dim} fontSize={10} textAnchor="middle">x-bar under H0</text>
      </svg>
    </div>
    <div style={S.controls}>
      <CG label="x-bar" min={mu0-20} max={mu0+20} step={0.5} value={xBar} set={setXBar}/>
      <CG label="mu0" min={50} max={150} step={1} value={mu0} set={setMu0}/>
      <CG label="sigma" min={1} max={30} step={0.5} value={sigma} set={setSigma}/>
      <CG label="n" min={5} max={200} step={1} value={n2} set={setN2}/>
    </div>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>Using the sample standard deviation s in the formula but dividing by n instead of sqrt(n). The standard error is sigma/sqrt(n), not sigma/n.</p></div>
  </>);
}

function Tab3({ zStat, setZStat, twoTail, setTwoTail }) {
  const mu=0, sig=1, xMin=-4, xMax=4, yMax=norm(0,0,1)*1.15;
  const baseline=M.t+ph;
  const fullPts=curvePath(mu,sig,xMin,xMax,200);
  const fullSVG=toSVG(fullPts,xMin,xMax,yMax);
  const rightTail=curvePath(mu,sig,Math.abs(zStat),xMax,80);
  const rightSVG=toSVG(rightTail,xMin,xMax,yMax);
  const leftTail=curvePath(mu,sig,xMin,-Math.abs(zStat),80);
  const leftSVG=toSVG(leftTail,xMin,xMax,yMax);
  const pRight=1-normCDF(Math.abs(zStat));
  const pVal=twoTail?2*pRight:pRight;
  return (<>
    <h3 style={S.title}>Understanding the P-Value</h3>
    <p style={S.sub}>The shaded area = probability of data this extreme IF H0 is true.</p>
    <span style={S.eq}>p-value = {pVal.toFixed(4)} ({twoTail?'two':'one'}-tailed) {pVal<0.05?'< 0.05 — Reject H0':'> 0.05 — Fail to reject H0'}</span>
    <div style={S.svgWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', maxWidth:W }}>
        <path d={pathD(fullSVG)} fill="none" stroke={C.accent} strokeWidth={2}/>
        <path d={areaD(rightSVG,baseline)} fill="rgba(239,68,68,0.35)"/>
        {twoTail&&<path d={areaD(leftSVG,baseline)} fill="rgba(239,68,68,0.35)"/>}
        {['-3','-2','-1','0','1','2','3'].map(v=><text key={v} x={M.l+(+v-xMin)/(xMax-xMin)*pw} y={baseline+14} fill={C.faint} fontSize={10} textAnchor="middle">{v}</text>)}
        <line x1={M.l} y1={baseline} x2={M.l+pw} y2={baseline} stroke={C.faint} strokeWidth={1}/>
        <text x={M.l+pw/2} y={baseline+26} fill={C.dim} fontSize={10} textAnchor="middle">z</text>
      </svg>
    </div>
    <div style={S.controls}>
      <CG label="Test statistic z" min={-3.5} max={3.5} step={0.05} value={zStat} set={setZStat}/>
      <button style={S.btn(twoTail?C.accent:C.surfaceAlt)} onClick={()=>setTwoTail(t=>!t)}>{twoTail?'Two-tailed':'One-tailed'}</button>
    </div>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>The p-value is NOT the probability that H0 is true. It is the probability of observing a test statistic as extreme as (or more extreme than) the one computed, assuming H0 is true.</p></div>
  </>);
}

function Tab4({ effectSize, setEffectSize, n4, setN4, alpha, setAlpha }) {
  const mu0=0, mu1=effectSize, sig=1;
  const se=sig/Math.sqrt(n4), zCrit=alpha===0.01?2.326:alpha===0.05?1.645:1.282;
  const xCrit=mu0+zCrit*se;
  const beta=normCDF((xCrit-mu1)/se);
  const power=1-beta;
  const xMin=Math.min(mu0,mu1)-4*se, xMax=Math.max(mu0,mu1)+4*se, yMax=norm(mu0,mu0,se)*1.15;
  const baseline=M.t+ph;
  const nullPts=toSVG(curvePath(mu0,se,xMin,xMax),xMin,xMax,yMax);
  const altPts=toSVG(curvePath(mu1,se,xMin,xMax),xMin,xMax,yMax);
  const alphaRegion=toSVG(curvePath(mu0,se,xCrit,xMax,60),xMin,xMax,yMax);
  const betaRegion=toSVG(curvePath(mu1,se,xMin,xCrit,80),xMin,xMax,yMax);
  const critX=M.l+((xCrit-xMin)/(xMax-xMin))*pw;
  return (<>
    <h3 style={S.title}>Type I / Type II Errors and Power</h3>
    <p style={S.sub}>Alpha = {alpha} | Beta = {beta.toFixed(3)} | <b style={{color:C.green}}>Power = {power.toFixed(3)}</b></p>
    <div style={S.svgWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', maxWidth:W }}>
        <path d={areaD(alphaRegion,baseline)} fill="rgba(239,68,68,0.3)"/>
        <path d={areaD(betaRegion,baseline)} fill="rgba(245,158,11,0.22)"/>
        <path d={pathD(nullPts)} fill="none" stroke={C.accent} strokeWidth={2}/>
        <path d={pathD(altPts)} fill="none" stroke={C.green} strokeWidth={2}/>
        {critX>=M.l&&critX<=M.l+pw&&<line x1={critX} y1={M.t} x2={critX} y2={baseline} stroke={C.dim} strokeWidth={1.5} strokeDasharray="4,3"/>}
        <line x1={M.l} y1={baseline} x2={M.l+pw} y2={baseline} stroke={C.faint} strokeWidth={1}/>
        <rect x={W-130} y={6} width={10} height={10} rx={2} fill={C.red} opacity={0.5}/><text x={W-116} y={15} fill={C.muted} fontSize={10}>alpha (Type I)</text>
        <rect x={W-130} y={22} width={10} height={10} rx={2} fill={C.amber} opacity={0.5}/><text x={W-116} y={31} fill={C.muted} fontSize={10}>beta (Type II)</text>
        <rect x={W-130} y={38} width={10} height={10} rx={2} fill={C.green} opacity={0.5}/><text x={W-116} y={47} fill={C.muted} fontSize={10}>H1 (true)</text>
      </svg>
    </div>
    <div style={S.controls}>
      <CG label="Effect size" min={0.1} max={3} step={0.05} value={effectSize} set={setEffectSize}/>
      <CG label="n" min={5} max={200} step={1} value={n4} set={setN4}/>
      <CG label="alpha" min={0.01} max={0.1} step={0.01} value={alpha} set={setAlpha}/>
    </div>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>Focusing only on alpha (Type I error rate) while ignoring power. A study with alpha = 0.05 but power = 0.2 will miss 80% of real effects. Always consider sample size needed for adequate power (~0.8).</p></div>
  </>);
}

function Tab5() {
  const [results, setResults] = useState(null);
  const [bonferroni, setBonferroni] = useState(false);
  const runTests = useCallback(() => {
    const k=20, tests=[];
    for (let i=0;i<k;i++) {
      let s=0; for(let j=0;j<30;j++) s+=(Math.random()-0.5);
      const z=s/Math.sqrt(30/12), p=2*(1-normCDF(Math.abs(z)));
      const thresh=bonferroni?0.05/k:0.05;
      tests.push({ id:i+1, z:z.toFixed(2), p:p.toFixed(4), sig:p<thresh });
    }
    setResults(tests);
  },[bonferroni]);
  const sigCount=results?results.filter(t=>t.sig).length:0;
  const gridStyle={ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))', gap:6 };
  const cellStyle=s=>({ padding:'6px 8px', borderRadius:6, background:s?'rgba(239,68,68,0.18)':C.surfaceAlt, border:`1px solid ${s?C.red:C.borderLight}`, textAlign:'center', fontSize:11 });
  return (<>
    <h3 style={S.title}>Multiple Testing and P-Hacking</h3>
    <p style={S.sub}>Run 20 tests when H0 is true for all. At alpha = 0.05, expect ~1 false positive by chance.</p>
    <div style={S.controls}>
      <button style={S.btn(C.accent)} onClick={runTests}>Run 20 Tests</button>
      <button style={S.btn(bonferroni?C.green:C.surfaceAlt)} onClick={()=>setBonferroni(b=>!b)}>Bonferroni: {bonferroni?'ON':'OFF'}</button>
      {results&&<span style={{fontSize:12,color:sigCount>0?C.red:C.green,fontWeight:600}}>{sigCount} of 20 "significant" {bonferroni?`(threshold = ${(0.05/20).toFixed(4)})`:''}</span>}
    </div>
    {results&&<div style={{...S.section,padding:'12px 22px'}}>
      <div style={gridStyle}>
        {results.map(t=><div key={t.id} style={cellStyle(t.sig)}>
          <div style={{fontWeight:600,color:t.sig?C.red:C.dim}}>Test {t.id}</div>
          <div style={{fontFamily:'monospace',color:t.sig?C.red:C.muted,fontSize:10}}>p={t.p}</div>
        </div>)}
      </div>
    </div>}
    <span style={S.eq}>Bonferroni correction: reject if p &lt; alpha / k = 0.05 / 20 = 0.0025</span>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>Cherry-picking the one significant result from 20 tests and reporting it as a discovery. Without adjusting for multiple comparisons (e.g., Bonferroni), you will find "significant" results purely by chance about 5% of the time per test.</p></div>
  </>);
}

export default function HypothesisTestingCore() {
  const [tab, setTab] = useState(0);
  const [trueP, setTrueP] = useState(0.6);
  const [xBar, setXBar] = useState(105);
  const [mu0, setMu0] = useState(100);
  const [sigma, setSigma] = useState(15);
  const [n2, setN2] = useState(30);
  const [zStat, setZStat] = useState(1.96);
  const [twoTail, setTwoTail] = useState(true);
  const [effectSize, setEffectSize] = useState(1.0);
  const [n4, setN4] = useState(30);
  const [alpha, setAlpha] = useState(0.05);

  return (
    <div style={S.container}>
      <div style={S.topicBar}>
        {TABS.map((t,i)=><button key={t.id} style={S.topicTab(i===tab)} onClick={()=>setTab(i)}>{t.label}</button>)}
      </div>
      <div style={S.body}>
        <div style={S.section}>
          {tab===0&&<Tab1 trueP={trueP} setTrueP={setTrueP}/>}
          {tab===1&&<Tab2 xBar={xBar} setXBar={setXBar} mu0={mu0} setMu0={setMu0} sigma={sigma} setSigma={setSigma} n2={n2} setN2={setN2}/>}
          {tab===2&&<Tab3 zStat={zStat} setZStat={setZStat} twoTail={twoTail} setTwoTail={setTwoTail}/>}
          {tab===3&&<Tab4 effectSize={effectSize} setEffectSize={setEffectSize} n4={n4} setN4={setN4} alpha={alpha} setAlpha={setAlpha}/>}
          {tab===4&&<Tab5/>}
        </div>
      </div>
    </div>
  );
}
