import React, { useState, useMemo, useCallback } from 'react';

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

const W=440, H=240, PAD=40;
const sl={ display:'flex', alignItems:'center', gap:8, fontSize:12, color:C.muted };
const slIn={ width:100, accentColor:C.accent, cursor:'pointer' };
const lbl=(n,v)=>({ ...sl, children:undefined, key:n, label:`${n}: ${v}` });

function Slider({label,min,max,step,value,onChange}){
  return <label style={sl}><span style={{color:C.dim,minWidth:50}}>{label}</span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(+e.target.value)} style={slIn}/>
    <span style={{color:C.mono,fontFamily:'monospace',minWidth:36}}>{value}</span></label>;
}

function normalPDF(x,mu,sigma){ const z=(x-mu)/sigma; return Math.exp(-0.5*z*z)/(sigma*Math.sqrt(2*Math.PI)); }
function tPDF(x,df){ const g=gamma; const c=g((df+1)/2)/(Math.sqrt(df*Math.PI)*g(df/2)); return c*Math.pow(1+x*x/df,-(df+1)/2); }
function gamma(z){ if(z<0.5) return Math.PI/(Math.sin(Math.PI*z)*gamma(1-z)); z-=1; const g=7; const c=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7]; let x=c[0]; for(let i=1;i<g+2;i++) x+=c[i]/(z+i); const t=z+g+0.5; return Math.sqrt(2*Math.PI)*Math.pow(t,z+0.5)*Math.exp(-t)*x; }
function poissonPMF(k,lam){ let lp=k*Math.log(lam)-lam; for(let i=2;i<=k;i++) lp-=Math.log(i); return Math.exp(lp); }
function expPDF(x,lam){ return x<0?0:lam*Math.exp(-lam*x); }
function weibullPDF(x,k,lam){ if(x<0) return 0; return (k/lam)*Math.pow(x/lam,k-1)*Math.exp(-Math.pow(x/lam,k)); }

function Chart({points,color,xRange,yMax,barWidth,bars,label,overlay,zones}){
  const xMin=xRange[0], xMax=xRange[1];
  const sx=x=>PAD+(x-xMin)/(xMax-xMin)*(W-2*PAD);
  const sy=y=>H-PAD-y/yMax*(H-2*PAD);
  const ticks=5;
  return <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',maxWidth:W,height:'auto'}}>
    <rect width={W} height={H} fill="transparent"/>
    {zones && zones.map((z,i)=><rect key={i} x={sx(z[0])} y={PAD} width={sx(z[1])-sx(z[0])} height={H-2*PAD} fill={z[2]} opacity={0.15}/>)}
    <line x1={PAD} y1={H-PAD} x2={W-PAD} y2={H-PAD} stroke={C.borderLight} strokeWidth={1}/>
    <line x1={PAD} y1={PAD} x2={PAD} y2={H-PAD} stroke={C.borderLight} strokeWidth={1}/>
    {Array.from({length:ticks+1},(_,i)=>{const v=xMin+i*(xMax-xMin)/ticks; return <text key={i} x={sx(v)} y={H-PAD+14} fill={C.faint} fontSize={9} textAnchor="middle">{v%1?v.toFixed(1):v}</text>;})}
    {Array.from({length:4},(_,i)=>{const v=(i+1)*yMax/4; return <g key={i}><line x1={PAD} y1={sy(v)} x2={W-PAD} y2={sy(v)} stroke={C.border} strokeWidth={0.5}/><text x={PAD-4} y={sy(v)+3} fill={C.faint} fontSize={8} textAnchor="end">{v.toFixed(2)}</text></g>;})}
    {bars ? points.map((p,i)=><rect key={i} x={sx(p[0])-barWidth/2*(W-2*PAD)/(xMax-xMin)} y={sy(p[1])} width={barWidth*(W-2*PAD)/(xMax-xMin)} height={H-PAD-sy(p[1])} fill={color} opacity={0.85} rx={2}/>) :
      <polyline fill="none" stroke={color} strokeWidth={2} points={points.map(p=>`${sx(p[0])},${sy(p[1])}`).join(' ')}/>}
    {overlay && <polyline fill="none" stroke={overlay.color} strokeWidth={1.5} strokeDasharray="4,3" points={overlay.points.map(p=>`${sx(p[0])},${sy(p[1])}`).join(' ')}/>}
    {label && <text x={W-PAD} y={PAD-6} fill={C.dim} fontSize={9} textAnchor="end">{label}</text>}
    {overlay && <text x={W-PAD} y={PAD+8} fill={overlay.color} fontSize={9} textAnchor="end">{overlay.label}</text>}
  </svg>;
}

function Note({title,children}){ return <div style={S.note}><span style={S.noteT}>{title}</span><p style={S.noteP}>{children}</p></div>; }

function GaussianTab(){
  const [mu,setMu]=useState(0), [sigma,setSigma]=useState(1), [df,setDf]=useState(3);
  const pts=useMemo(()=>{const r=[]; for(let x=mu-4*sigma;x<=mu+4*sigma;x+=0.1) r.push([x,normalPDF(x,mu,sigma)]); return r;},[mu,sigma]);
  const tPts=useMemo(()=>{const r=[]; for(let x=mu-4*sigma;x<=mu+4*sigma;x+=0.1) r.push([x,tPDF((x-mu)/sigma,df)/sigma]); return r;},[mu,sigma,df]);
  const yMax=useMemo(()=>Math.max(0.5,...pts.map(p=>p[1]),...tPts.map(p=>p[1]))*1.15,[pts,tPts]);
  const z1=[mu-sigma,mu+sigma], z2=[mu-2*sigma,mu+2*sigma];
  return <>
    <div style={S.section}>
      <div><p style={S.title}>Gaussian (Normal) + t-Distribution</p><p style={S.sub}>The bell curve: most measurements cluster around the mean. The t-distribution has heavier tails for small samples.</p></div>
      <div style={S.svgWrap}><Chart points={pts} color={C.accent} xRange={[mu-4*sigma,mu+4*sigma]} yMax={yMax} overlay={{points:tPts,color:C.amber,label:`t (df=${df})`}} label="Normal (solid)" zones={[[z1[0],z1[1],C.accent],[z2[0],z1[0],C.teal],[z2[1],z2[1],C.teal]]}/></div>
      <code style={S.eq}>68-95-99.7 rule: 68% within 1 sigma, 95% within 2 sigma, 99.7% within 3 sigma</code>
      <Note title="Common Mistake">Using the normal distribution when your sample is small and the population standard deviation is unknown. Use the t-distribution instead -- it accounts for extra uncertainty with heavier tails.</Note>
    </div>
    <div style={S.controls}>
      <Slider label="mu" min={-3} max={3} step={0.5} value={mu} onChange={setMu}/>
      <Slider label="sigma" min={0.3} max={3} step={0.1} value={sigma} onChange={setSigma}/>
      <Slider label="df" min={1} max={30} step={1} value={df} onChange={setDf}/>
    </div>
  </>;
}

function PoissonTab(){
  const [lam,setLam]=useState(4);
  const pts=useMemo(()=>{const r=[]; const mx=Math.max(15,Math.ceil(lam*2.5)); for(let k=0;k<=mx;k++) r.push([k,poissonPMF(k,lam)]); return r;},[lam]);
  const yMax=useMemo(()=>Math.max(0.1,...pts.map(p=>p[1]))*1.2,[pts]);
  return <>
    <div style={S.section}>
      <div><p style={S.title}>Poisson Distribution</p><p style={S.sub}>Counts of events in a fixed interval -- arrivals per hour, defects per batch, emails per day.</p></div>
      <div style={S.svgWrap}><Chart points={pts} color={C.green} xRange={[0,Math.max(15,Math.ceil(lam*2.5))]} yMax={yMax} bars barWidth={0.7} label={`Poisson (lambda=${lam})`}/></div>
      <code style={S.eq}>Mean = Variance = lambda = {lam}</code>
      <Note title="Common Mistake">Applying Poisson when events are not independent or the rate changes over time (e.g., rush hour arrivals). The Poisson assumes a constant rate and independent occurrences.</Note>
    </div>
    <div style={S.controls}><Slider label="lambda" min={0.5} max={20} step={0.5} value={lam} onChange={setLam}/></div>
  </>;
}

function ExponentialTab(){
  const [lam,setLam]=useState(1);
  const pts=useMemo(()=>{const r=[]; const mx=Math.min(10,5/lam); for(let x=0;x<=mx;x+=0.05) r.push([x,expPDF(x,lam)]); return r;},[lam]);
  const yMax=useMemo(()=>Math.max(0.5,lam)*1.15,[lam]);
  const memX=2;
  return <>
    <div style={S.section}>
      <div><p style={S.title}>Exponential Distribution</p><p style={S.sub}>Time between events in a Poisson process -- waiting for the next customer, next machine failure.</p></div>
      <div style={S.svgWrap}><Chart points={pts} color={C.cyan} xRange={[0,Math.min(10,5/lam)]} yMax={yMax} label={`Exp (lambda=${lam}, mean=${(1/lam).toFixed(2)})`}/></div>
      <code style={S.eq}>P(X {'>'} s+t | X {'>'} s) = P(X {'>'} t) -- memoryless property: past waiting doesn't affect future</code>
      <div style={{...S.eq, fontSize:12, color:C.dim}}>Mean = 1/lambda = {(1/lam).toFixed(2)} | lambda = rate = {lam}</div>
      <Note title="Common Mistake">Confusing the rate parameter lambda with the mean. If lambda=2 events/hour, the mean wait is 1/2 = 0.5 hours, not 2 hours.</Note>
    </div>
    <div style={S.controls}><Slider label="lambda" min={0.2} max={5} step={0.1} value={lam} onChange={setLam}/></div>
  </>;
}

function WeibullTab(){
  const [k,setK]=useState(1.5), [lam,setLam]=useState(2);
  const pts=useMemo(()=>{const r=[]; const mx=lam*3; for(let x=0.01;x<=mx;x+=mx/200) r.push([x,weibullPDF(x,k,lam)]); return r;},[k,lam]);
  const yMax=useMemo(()=>Math.max(0.3,...pts.map(p=>p[1]))*1.15,[pts]);
  const regime=k<1?'Decreasing hazard (infant mortality)':k===1?'Constant hazard (exponential)':'Increasing hazard (wear-out)';
  return <>
    <div style={S.section}>
      <div><p style={S.title}>Weibull Distribution</p><p style={S.sub}>The Swiss army knife of reliability: models infant mortality, random failures, and wear-out depending on shape k.</p></div>
      <div style={S.svgWrap}><Chart points={pts} color={C.pink} xRange={[0,lam*3]} yMax={yMax} label={`Weibull (k=${k}, lambda=${lam})`}/></div>
      <div style={{...S.eq, color:k<1?C.amber:k===1?C.cyan:C.red}}>{regime}</div>
      <code style={S.eq}>k{'<'}1: early-life failures | k=1: random (exponential) | k{'>'}1: aging/wear-out</code>
      <Note title="Common Mistake">Assuming a constant failure rate (exponential model) when components actually wear out over time. Real mechanical parts often have k {'>'} 1 -- ignoring this leads to under-maintenance.</Note>
    </div>
    <div style={S.controls}>
      <Slider label="k (shape)" min={0.3} max={5} step={0.1} value={k} onChange={setK}/>
      <Slider label="lambda (scale)" min={0.5} max={5} step={0.5} value={lam} onChange={setLam}/>
    </div>
  </>;
}

function CompareTab(){
  const [ans,setAns]=useState({type:null,counting:null,memory:null});
  const rec=useMemo(()=>{
    if(!ans.type) return null;
    if(ans.type==='discrete') return ans.counting==='yes'?{name:'Poisson',color:C.green,why:'Discrete counts of independent events at a constant rate.'}:{name:'Consider Binomial or other discrete',color:C.violet,why:'Discrete but not simple event counts -- check if it is fixed-trial (Binomial) or other.'};
    if(ans.type==='continuous'){
      if(ans.counting==='time'){
        if(ans.memory==='yes') return {name:'Exponential',color:C.cyan,why:'Continuous waiting time with memoryless (constant hazard) property.'};
        return {name:'Weibull',color:C.pink,why:'Continuous lifetime/duration where hazard rate changes over time.'};
      }
      return {name:'Normal (Gaussian)',color:C.accent,why:'Continuous measurement -- by CLT, sums/averages of many factors tend toward normal.'};
    }
    return null;
  },[ans]);
  const btn=(label,key,val)=>({padding:'6px 14px',borderRadius:8,border:`1px solid ${ans[key]===val?C.accent:C.borderLight}`,background:ans[key]===val?C.accentGlow:'transparent',color:ans[key]===val?C.accentLight:C.muted,fontSize:12,cursor:'pointer',fontWeight:600,transition:'all .15s'});
  const reset=()=>setAns({type:null,counting:null,memory:null});
  const rows=[
    ['Normal','Continuous','Measurement, error','mu, sigma','bell curve, symmetric'],
    ['t','Continuous','Small-sample means','df','like Normal, heavier tails'],
    ['Poisson','Discrete','Event counts','lambda','mean = variance'],
    ['Exponential','Continuous','Wait times','lambda','memoryless'],
    ['Weibull','Continuous','Lifetimes','k, lambda','flexible hazard'],
  ];
  return <>
    <div style={S.section}>
      <div><p style={S.title}>Which Distribution Should You Use?</p><p style={S.sub}>Answer a few questions about your data to get a recommendation.</p></div>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}><span style={{fontSize:12,color:C.dim,minWidth:160}}>Is your variable...</span>
          <button style={btn('Discrete (counts)','type','discrete')} onClick={()=>setAns({type:'discrete',counting:null,memory:null})}>Discrete (counts)</button>
          <button style={btn('Continuous','type','continuous')} onClick={()=>setAns({type:'continuous',counting:null,memory:null})}>Continuous</button>
        </div>
        {ans.type==='discrete' && <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}><span style={{fontSize:12,color:C.dim,minWidth:160}}>Counting events per interval?</span>
          <button style={btn('Yes','counting','yes')} onClick={()=>setAns(a=>({...a,counting:'yes'}))}>Yes</button>
          <button style={btn('No','counting','no')} onClick={()=>setAns(a=>({...a,counting:'no'}))}>No</button>
        </div>}
        {ans.type==='continuous' && <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}><span style={{fontSize:12,color:C.dim,minWidth:160}}>What are you measuring?</span>
          <button style={btn('Time/duration','counting','time')} onClick={()=>setAns(a=>({...a,counting:'time',memory:null}))}>Time / duration</button>
          <button style={btn('Measurement/value','counting','measure')} onClick={()=>setAns(a=>({...a,counting:'measure'}))}>Measurement / value</button>
        </div>}
        {ans.type==='continuous' && ans.counting==='time' && <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}><span style={{fontSize:12,color:C.dim,minWidth:160}}>Constant failure/hazard rate?</span>
          <button style={btn('Yes (memoryless)','memory','yes')} onClick={()=>setAns(a=>({...a,memory:'yes'}))}>Yes (memoryless)</button>
          <button style={btn('No (wear-out/aging)','memory','no')} onClick={()=>setAns(a=>({...a,memory:'no'}))}>No (changes over time)</button>
        </div>}
      </div>
      {rec && <div style={{padding:14,background:C.surfaceAlt,borderRadius:10,border:`1px solid ${C.borderLight}`,marginTop:4}}>
        <span style={{fontSize:14,fontWeight:700,color:rec.color}}>Recommended: {rec.name}</span>
        <p style={{fontSize:12.5,color:C.muted,margin:'4px 0 0'}}>{rec.why}</p>
        <button onClick={reset} style={{marginTop:8,padding:'4px 12px',borderRadius:6,border:`1px solid ${C.borderLight}`,background:'transparent',color:C.faint,fontSize:11,cursor:'pointer'}}>Reset</button>
      </div>}
      <div style={{overflowX:'auto',marginTop:6}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5}}>
          <thead><tr>{['Distribution','Type','Use Case','Parameters','Key Property'].map(h=><th key={h} style={{padding:'6px 10px',borderBottom:`1px solid ${C.borderLight}`,color:C.dim,fontWeight:600,textAlign:'left'}}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j} style={{padding:'6px 10px',borderBottom:`1px solid ${C.border}`,color:j===0?C.accentLight:C.muted}}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <Note title="Common Mistake">Choosing a distribution based on mathematical convenience rather than the actual data-generating process. Always plot your data first, check assumptions (independence, constant rate, symmetry), and use goodness-of-fit tests.</Note>
    </div>
  </>;
}

const TABS=['Gaussian + t','Poisson','Exponential','Weibull','Compare When to Use'];

export default function CommonDistributions(){
  const [tab,setTab]=useState(0);
  return <div style={S.container}>
    <div style={S.topicBar}>{TABS.map((t,i)=><button key={i} style={S.topicTab(tab===i)} onClick={()=>setTab(i)}>{t}</button>)}</div>
    <div style={S.body}>
      {tab===0 && <GaussianTab/>}
      {tab===1 && <PoissonTab/>}
      {tab===2 && <ExponentialTab/>}
      {tab===3 && <WeibullTab/>}
      {tab===4 && <CompareTab/>}
    </div>
  </div>;
}
