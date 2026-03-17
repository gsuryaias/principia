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
  svgWrap:{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:220, padding:'4px 0' },
  controls:{ padding:'12px 22px', background:C.surface, borderTop:`1px solid ${C.border}`, display:'flex', flexWrap:'wrap', gap:16, alignItems:'center' },
  eq:{ display:'block', padding:'10px 16px', background:C.surfaceAlt, border:`1px solid ${C.borderLight}`, borderRadius:10, fontFamily:'monospace', fontSize:13, color:C.mono, margin:'8px 0', textAlign:'center', lineHeight:1.7 },
  note:{ padding:'12px 16px', background:C.accentGlow, borderLeft:`3px solid ${C.accent}`, borderRadius:'0 10px 10px 0', margin:'6px 0' },
  noteT:{ fontWeight:700, color:C.accentLight, fontSize:12, marginBottom:4, display:'block', textTransform:'uppercase', letterSpacing:'0.04em' },
  noteP:{ fontSize:13, lineHeight:1.65, color:C.muted, margin:0 },
  title:{ fontSize:17, fontWeight:700, color:C.text, margin:'0 0 2px' },
  sub:{ fontSize:12.5, color:C.dim, margin:0, lineHeight:1.5 },
  cg:{ display:'flex', alignItems:'center', gap:8 },
  label:{ fontSize:12, color:C.muted, fontWeight:500, whiteSpace:'nowrap' },
  slider:{ width:100, accentColor:C.accent, cursor:'pointer' },
  val:{ fontSize:12, color:C.dim, fontFamily:'monospace', minWidth:40, textAlign:'right' },
  ri:{ display:'flex', flexDirection:'column', gap:2 },
  rl:{ fontSize:10, color:C.faint, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' },
  rv:{ fontSize:15, fontWeight:700, fontFamily:'monospace' },
  mistake:{ padding:'12px 16px', background:'rgba(239,68,68,0.08)', borderLeft:`3px solid ${C.red}`, borderRadius:'0 10px 10px 0', margin:'6px 0' },
  mistakeT:{ fontWeight:700, color:C.red, fontSize:12, marginBottom:4, display:'block', textTransform:'uppercase', letterSpacing:'0.04em' },
};

const TABS = ['t-Tests','Paired vs Independent','Proportion Tests','Chi-Square + Fisher','ANOVA + Effect Size'];

const CG = ({ label, min, max, step, value, set, unit }) => (
  <div style={S.cg}>
    <span style={S.label}>{label}</span>
    <input type="range" min={min} max={max} step={step||1} value={value} onChange={e=>set(+e.target.value)} style={S.slider}/>
    <span style={S.val}>{(step&&step<1)?value.toFixed(1):value}{unit||''}</span>
  </div>
);

const Stat = ({ label, value, color }) => (
  <div style={S.ri}><span style={S.rl}>{label}</span><span style={{...S.rv,color}}>{value}</span></div>
);

const Mistake = ({ text }) => (
  <div style={S.mistake}><span style={S.mistakeT}>Common Mistake</span><p style={S.noteP}>{text}</p></div>
);

/* normal PDF */
const normPdf = (x,m,s)=> Math.exp(-0.5*((x-m)/s)**2)/(s*Math.sqrt(2*Math.PI));
/* approx CDF via logistic */
const normCdf = (z)=>1/(1+Math.exp(-0.07056*z*z*z-1.5976*z));
/* t-distribution approx CDF (Welch-Satterthwaite uses normal for large df) */
const tCdf = (t,df)=>{ const x=df/(df+t*t); if(t<0) return 0.5*betaI(x,df/2,0.5); return 1-0.5*betaI(x,df/2,0.5); };
const betaI = (x,a,b)=>{ if(x<=0)return 0; if(x>=1)return 1; let s=0,t=1; for(let k=0;k<200;k++){t*=x*(a+k)/(a+k); const term=t/((a+k+1)); s+=term; if(Math.abs(term)<1e-12)break; } return Math.pow(x,a)*Math.pow(1-x,b)*s/(a*betaFn(a,b)); };
const betaFn = (a,b)=>Math.exp(lgamma(a)+lgamma(b)-lgamma(a+b));
const lgamma = (z)=>{ const c=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5]; let x=z,y=z,tmp=x+5.5; tmp-=(x+0.5)*Math.log(tmp); let ser=1.000000000190015; for(let j=0;j<6;j++) ser+=c[j]/++y; return -tmp+Math.log(2.5066282746310005*ser/x); };
/* two-tailed p-value from t */
const tPval = (t,df)=>{ const p=tCdf(Math.abs(t),df); return 2*(1-p); };

/* chi-square CDF approx */
const chiCdf = (x,k)=>{ if(x<=0)return 0; return regularizedGammaP(k/2,x/2); };
const regularizedGammaP = (a,x)=>{ if(x<a+1){let s=1/a,t=1/a; for(let n=1;n<200;n++){t*=x/(a+n);s+=t;if(Math.abs(t)<1e-10)break;} return s*Math.exp(-x+a*Math.log(x)-lgamma(a));} let b2=x+1-a,c=1e30,d=1/b2,h=d; for(let i=1;i<200;i++){const an=-i*(i-a),bn=x+2*i+1-a;d=bn+an*d;if(Math.abs(d)<1e-30)d=1e-30;c=bn+an/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;h*=d*c;if(Math.abs(d*c-1)<1e-10)break;} return 1-h*Math.exp(-x+a*Math.log(x)-lgamma(a)); };

/* F-distribution CDF */
const fCdf = (f,d1,d2)=>{ if(f<=0)return 0; const x=d1*f/(d1*f+d2); return regularizedBetaI(x,d1/2,d2/2); };
const regularizedBetaI = (x,a,b)=>{ if(x<=0)return 0; if(x>=1)return 1; const bt=Math.exp(lgamma(a+b)-lgamma(a)-lgamma(b)+a*Math.log(x)+b*Math.log(1-x)); if(x<(a+1)/(a+b+2)) return bt*cfBeta(x,a,b)/a; return 1-bt*cfBeta(1-x,b,a)/b; };
const cfBeta = (x,a,b)=>{ let qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap; if(Math.abs(d)<1e-30)d=1e-30; d=1/d; let h=d; for(let m=1;m<=200;m++){let m2=2*m,aa=m*(b-m)*x/((qam+m2)*(a+m2)); d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;h*=d*c; aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2)); d=1+aa*d;if(Math.abs(d)<1e-30)d=1e-30;c=1+aa/c;if(Math.abs(c)<1e-30)c=1e-30;d=1/d;let del=d*c;h*=del;if(Math.abs(del-1)<1e-10)break;} return h; };

/* ─── Tab 1: t-Tests ─── */
function TTests(){
  const [m1,setM1]=useState(50),[m2,setM2]=useState(55),[s1,setS1]=useState(10),[s2,setS2]=useState(12),[n1,setN1]=useState(30),[n2,setN2]=useState(30);
  const stats=useMemo(()=>{
    const se=Math.sqrt(s1*s1/n1+s2*s2/n2), t=(m1-m2)/se;
    const df=Math.floor((s1*s1/n1+s2*s2/n2)**2/((s1*s1/n1)**2/(n1-1)+(s2*s2/n2)**2/(n2-1)));
    const p=tPval(t,df); return {t,df,p,se};
  },[m1,m2,s1,s2,n1,n2]);
  const w=440,h=180,xMin=Math.min(m1,m2)-3*Math.max(s1,s2),xMax=Math.max(m1,m2)+3*Math.max(s1,s2);
  const toX=v=>(v-xMin)/(xMax-xMin)*w, pts=(m,s,col)=>{let d='';for(let i=0;i<=100;i++){const x=xMin+(xMax-xMin)*i/100,y=normPdf(x,m,s);d+=(i?'L':'M')+`${toX(x).toFixed(1)},${(h-10-y*s*Math.sqrt(2*Math.PI)*120).toFixed(1)}`;}return <path d={d} fill="none" stroke={col} strokeWidth={2}/>;};
  return <div style={S.section}>
    <div><p style={S.title}>Two-Sample t-Test</p><p style={S.sub}>Compare means of two independent groups (e.g., A/B test: does a new feature improve a metric?)</p></div>
    <div style={S.svgWrap}><svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%',maxWidth:480}}>
      {pts(m1,s1,C.cyan)}{pts(m2,s2,C.pink)}
      <line x1={toX(m1)} y1={10} x2={toX(m1)} y2={h-10} stroke={C.cyan} strokeDasharray="4"/>
      <line x1={toX(m2)} y1={10} x2={toX(m2)} y2={h-10} stroke={C.pink} strokeDasharray="4"/>
      <text x={toX(m1)} y={8} fill={C.cyan} fontSize={10} textAnchor="middle">Group A</text>
      <text x={toX(m2)} y={8} fill={C.pink} fontSize={10} textAnchor="middle">Group B</text>
    </svg></div>
    <div style={S.controls}>
      <CG label="Mean A" min={20} max={80} value={m1} set={setM1}/><CG label="SD A" min={3} max={25} value={s1} set={setS1}/>
      <CG label="n A" min={5} max={100} value={n1} set={setN1}/><CG label="Mean B" min={20} max={80} value={m2} set={setM2}/>
      <CG label="SD B" min={3} max={25} value={s2} set={setS2}/><CG label="n B" min={5} max={100} value={n2} set={setN2}/>
    </div>
    <div style={{display:'flex',gap:18,padding:'10px 22px',background:'#0c0c0f',borderTop:`1px solid ${C.border}`,flexWrap:'wrap'}}>
      <Stat label="t-statistic" value={stats.t.toFixed(3)} color={C.mono}/><Stat label="df" value={stats.df} color={C.dim}/>
      <Stat label="p-value" value={stats.p<0.001?'<0.001':stats.p.toFixed(4)} color={stats.p<0.05?C.green:C.red}/>
      <Stat label="Decision (a=0.05)" value={stats.p<0.05?'Reject H0':'Fail to reject'} color={stats.p<0.05?C.green:C.amber}/>
    </div>
    <span style={S.eq}>t = (x&#772;&#8321; - x&#772;&#8322;) / SE &nbsp;&nbsp;where SE = sqrt(s&#8321;&#178;/n&#8321; + s&#8322;&#178;/n&#8322;)</span>
    <Mistake text="Using a t-test when data is heavily skewed with small n. The t-test assumes approximate normality of means; with small samples and skewed data, consider a non-parametric alternative (Mann-Whitney U)."/>
  </div>;
}

/* ─── Tab 2: Paired vs Independent ─── */
function PairedIndep(){
  const [corr,setCorr]=useState(0.7),[diff,setDiff]=useState(3),[n,setN]=useState(12);
  const data=useMemo(()=>{
    const seed=42; const rng=(i)=>{let s=Math.sin(seed+i*127.1)*43758.5453;return s-Math.floor(s);};
    const pairs=[]; for(let i=0;i<n;i++){const base=40+rng(i)*30; const before=base+rng(i+100)*6; const after=before+diff+rng(i+200)*6*(1-corr*0.8); pairs.push({before,after});}
    const diffs=pairs.map(p=>p.after-p.before), md=diffs.reduce((a,b)=>a+b,0)/n, sd=Math.sqrt(diffs.reduce((a,b)=>a+(b-md)**2,0)/(n-1));
    const tPaired=md/(sd/Math.sqrt(n)), pPaired=tPval(tPaired,n-1);
    const mB=pairs.reduce((a,p)=>a+p.before,0)/n, mA=pairs.reduce((a,p)=>a+p.after,0)/n;
    const sdB=Math.sqrt(pairs.reduce((a,p)=>a+(p.before-mB)**2,0)/(n-1)), sdA=Math.sqrt(pairs.reduce((a,p)=>a+(p.after-mA)**2,0)/(n-1));
    const se=Math.sqrt(sdB*sdB/n+sdA*sdA/n), tInd=(mA-mB)/se, dfI=Math.floor((sdB*sdB/n+sdA*sdA/n)**2/((sdB*sdB/n)**2/(n-1)+(sdA*sdA/n)**2/(n-1)));
    const pInd=tPval(tInd,dfI);
    return {pairs,tPaired,pPaired,tInd,pInd,md,sd};
  },[corr,diff,n]);
  const w=400,h=180;
  return <div style={S.section}>
    <div><p style={S.title}>Paired vs Independent Tests</p><p style={S.sub}>Paired designs connect each observation, removing between-subject variability</p></div>
    <div style={S.svgWrap}><svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%',maxWidth:440}}>
      {data.pairs.map((p,i)=>{const x1=40,x2=180,y=15+i*(h-30)/Math.max(n-1,1); const yb=(p.before-30)/40*(h-30), ya=(p.after-30)/40*(h-30);
        return <g key={i}><line x1={x1} y1={h-10-yb} x2={x2} y2={h-10-ya} stroke={C.faint} strokeWidth={1}/>
          <circle cx={x1} cy={h-10-yb} r={3.5} fill={C.cyan}/><circle cx={x2} cy={h-10-ya} r={3.5} fill={C.pink}/></g>;})}
      <text x={40} y={h-1} fill={C.cyan} fontSize={10} textAnchor="middle">Before</text>
      <text x={180} y={h-1} fill={C.pink} fontSize={10} textAnchor="middle">After</text>
      <line x1={220} y1={5} x2={220} y2={h-5} stroke={C.borderLight}/>
      {data.pairs.map((p,i)=>{const yb=(p.before-30)/40*(h-30), ya=(p.after-30)/40*(h-30);
        return <g key={i}><circle cx={270} cy={h-10-yb} r={3} fill={C.cyan} opacity={0.6}/><circle cx={350} cy={h-10-ya} r={3} fill={C.pink} opacity={0.6}/></g>;})}
      <text x={270} y={h-1} fill={C.cyan} fontSize={10} textAnchor="middle">Group 1</text>
      <text x={350} y={h-1} fill={C.pink} fontSize={10} textAnchor="middle">Group 2</text>
      <text x={110} y={10} fill={C.muted} fontSize={9} textAnchor="middle">Paired (lines connect same subject)</text>
      <text x={310} y={10} fill={C.muted} fontSize={9} textAnchor="middle">Independent (no pairing)</text>
    </svg></div>
    <div style={S.controls}>
      <CG label="Correlation" min={0} max={0.95} step={0.05} value={corr} set={setCorr}/><CG label="True diff" min={0} max={10} step={0.5} value={diff} set={setDiff}/><CG label="n pairs" min={5} max={30} value={n} set={setN}/>
    </div>
    <div style={{display:'flex',gap:24,padding:'10px 22px',background:'#0c0c0f',borderTop:`1px solid ${C.border}`,flexWrap:'wrap'}}>
      <Stat label="Paired t" value={data.tPaired.toFixed(2)} color={C.cyan}/><Stat label="Paired p" value={data.pPaired<0.001?'<0.001':data.pPaired.toFixed(4)} color={data.pPaired<0.05?C.green:C.red}/>
      <Stat label="Indep t" value={data.tInd.toFixed(2)} color={C.pink}/><Stat label="Indep p" value={data.pInd<0.001?'<0.001':data.pInd.toFixed(4)} color={data.pInd<0.05?C.green:C.red}/>
    </div>
    <div style={S.note}><span style={S.noteT}>Insight</span><p style={S.noteP}>When within-subject correlation is high, the paired test is far more powerful. Notice how the paired p-value is often smaller even with the same data.</p></div>
    <Mistake text="Using an independent-samples test on paired data throws away the correlation structure, reducing statistical power. If subjects are measured twice, always use a paired test."/>
  </div>;
}

/* ─── Tab 3: Proportion Tests ─── */
function PropTests(){
  const [p1,setP1]=useState(0.12),[p2,setP2]=useState(0.15),[n1,setN1]=useState(500),[n2,setN2]=useState(500);
  const stats=useMemo(()=>{
    const pp=(p1*n1+p2*n2)/(n1+n2), se=Math.sqrt(pp*(1-pp)*(1/n1+1/n2)), z=(p1-p2)/se;
    const pv=2*(1-normCdf(Math.abs(z))); return {pp,se,z,pv};
  },[p1,p2,n1,n2]);
  const w=400,h=140; const barW=60;
  return <div style={S.section}>
    <div><p style={S.title}>Two-Proportion z-Test</p><p style={S.sub}>Compare conversion rates, click-through rates, or success rates between groups</p></div>
    <div style={S.svgWrap}><svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%',maxWidth:420}}>
      <rect x={100} y={h-10-p1*400} width={barW} height={p1*400} rx={4} fill={C.cyan} opacity={0.8}/>
      <rect x={240} y={h-10-p2*400} width={barW} height={p2*400} rx={4} fill={C.pink} opacity={0.8}/>
      <text x={130} y={h-14-p1*400} fill={C.cyan} fontSize={12} textAnchor="middle" fontFamily="monospace">{(p1*100).toFixed(1)}%</text>
      <text x={270} y={h-14-p2*400} fill={C.pink} fontSize={12} textAnchor="middle" fontFamily="monospace">{(p2*100).toFixed(1)}%</text>
      <text x={130} y={h-1} fill={C.muted} fontSize={10} textAnchor="middle">p&#8321; (n={n1})</text>
      <text x={270} y={h-1} fill={C.muted} fontSize={10} textAnchor="middle">p&#8322; (n={n2})</text>
      <line x1={100} y1={h-10-stats.pp*400} x2={300} y2={h-10-stats.pp*400} stroke={C.amber} strokeDasharray="4" strokeWidth={1}/>
      <text x={310} y={h-8-stats.pp*400} fill={C.amber} fontSize={9}>pooled={stats.pp.toFixed(3)}</text>
    </svg></div>
    <div style={S.controls}>
      <CG label="p1" min={0.01} max={0.5} step={0.01} value={p1} set={setP1}/><CG label="n1" min={20} max={2000} step={10} value={n1} set={setN1}/>
      <CG label="p2" min={0.01} max={0.5} step={0.01} value={p2} set={setP2}/><CG label="n2" min={20} max={2000} step={10} value={n2} set={setN2}/>
    </div>
    <div style={{display:'flex',gap:18,padding:'10px 22px',background:'#0c0c0f',borderTop:`1px solid ${C.border}`,flexWrap:'wrap'}}>
      <Stat label="z-statistic" value={stats.z.toFixed(3)} color={C.mono}/><Stat label="p-value" value={stats.pv<0.001?'<0.001':stats.pv.toFixed(4)} color={stats.pv<0.05?C.green:C.red}/>
      <Stat label="Decision" value={stats.pv<0.05?'Significant':'Not significant'} color={stats.pv<0.05?C.green:C.amber}/>
    </div>
    <span style={S.eq}>z = (p&#770;&#8321; - p&#770;&#8322;) / sqrt( p&#770;(1-p&#770;)(1/n&#8321; + 1/n&#8322;) )</span>
    <Mistake text="Using a proportion test with very small sample sizes. The normal approximation requires np >= 5 and n(1-p) >= 5 for each group. With small counts, use Fisher's exact test instead."/>
  </div>;
}

/* ─── Tab 4: Chi-Square + Fisher ─── */
function ChiSquare(){
  const [a,setA]=useState(40),[b,setB]=useState(30),[c,setC2]=useState(20),[d,setD]=useState(50);
  const stats=useMemo(()=>{
    const n=a+b+c+d, r1=a+b, r2=c+d, c1=a+c, c2=b+d;
    const ea=r1*c1/n, eb=r1*c2/n, ec=r2*c1/n, ed=r2*c2/n;
    const chi=((a-ea)**2/ea)+((b-eb)**2/eb)+((c-ec)**2/ec)+((d-ed)**2/ed);
    const pv=1-chiCdf(chi,1);
    const minExp=Math.min(ea,eb,ec,ed);
    const fisherWarn=minExp<5;
    const contrib=[{v:(a-ea)**2/ea,r:0,c:0},{v:(b-eb)**2/eb,r:0,c:1},{v:(c-ec)**2/ec,r:1,c:0},{v:(d-ed)**2/ed,r:1,c:1}];
    return {ea,eb,ec,ed,chi,pv,minExp,fisherWarn,contrib};
  },[a,b,c,d]);
  const maxC=Math.max(...stats.contrib.map(c=>c.v));
  const cellColor=(v)=>{const t=maxC>0?v/maxC:0; return `rgba(99,102,241,${(0.1+t*0.5).toFixed(2)})`;};
  return <div style={S.section}>
    <div><p style={S.title}>Chi-Square Test of Independence</p><p style={S.sub}>Test whether two categorical variables are associated (e.g., survey responses by demographic group)</p></div>
    <div style={S.svgWrap}>
      <div style={{display:'flex',gap:24,flexWrap:'wrap',justifyContent:'center'}}>
        <div><div style={{fontSize:11,color:C.dim,marginBottom:6,textAlign:'center'}}>Observed</div>
          <table style={{borderCollapse:'collapse'}}>
            <thead><tr><td style={{padding:6}}></td><td style={{padding:'6px 16px',color:C.cyan,fontSize:11,fontWeight:700}}>Cat 1</td><td style={{padding:'6px 16px',color:C.pink,fontSize:11,fontWeight:700}}>Cat 2</td></tr></thead>
            <tbody>
              <tr><td style={{padding:'6px 8px',color:C.muted,fontSize:11}}>Group A</td>
                <td style={{padding:'6px 16px',background:cellColor(stats.contrib[0].v),color:C.text,fontSize:14,fontWeight:600,textAlign:'center',borderRadius:4}}>{a}</td>
                <td style={{padding:'6px 16px',background:cellColor(stats.contrib[1].v),color:C.text,fontSize:14,fontWeight:600,textAlign:'center',borderRadius:4}}>{b}</td></tr>
              <tr><td style={{padding:'6px 8px',color:C.muted,fontSize:11}}>Group B</td>
                <td style={{padding:'6px 16px',background:cellColor(stats.contrib[2].v),color:C.text,fontSize:14,fontWeight:600,textAlign:'center',borderRadius:4}}>{c}</td>
                <td style={{padding:'6px 16px',background:cellColor(stats.contrib[3].v),color:C.text,fontSize:14,fontWeight:600,textAlign:'center',borderRadius:4}}>{d}</td></tr>
            </tbody>
          </table></div>
        <div><div style={{fontSize:11,color:C.dim,marginBottom:6,textAlign:'center'}}>Expected</div>
          <table style={{borderCollapse:'collapse'}}>
            <thead><tr><td style={{padding:6}}></td><td style={{padding:'6px 16px',color:C.faint,fontSize:11}}>Cat 1</td><td style={{padding:'6px 16px',color:C.faint,fontSize:11}}>Cat 2</td></tr></thead>
            <tbody>
              <tr><td style={{padding:'6px 8px',color:C.muted,fontSize:11}}>Group A</td>
                <td style={{padding:'6px 16px',color:C.dim,fontSize:13,textAlign:'center',fontFamily:'monospace'}}>{stats.ea.toFixed(1)}</td>
                <td style={{padding:'6px 16px',color:C.dim,fontSize:13,textAlign:'center',fontFamily:'monospace'}}>{stats.eb.toFixed(1)}</td></tr>
              <tr><td style={{padding:'6px 8px',color:C.muted,fontSize:11}}>Group B</td>
                <td style={{padding:'6px 16px',color:C.dim,fontSize:13,textAlign:'center',fontFamily:'monospace'}}>{stats.ec.toFixed(1)}</td>
                <td style={{padding:'6px 16px',color:C.dim,fontSize:13,textAlign:'center',fontFamily:'monospace'}}>{stats.ed.toFixed(1)}</td></tr>
            </tbody>
          </table></div>
      </div>
    </div>
    <div style={S.controls}>
      <CG label="a" min={1} max={100} value={a} set={setA}/><CG label="b" min={1} max={100} value={b} set={setB}/>
      <CG label="c" min={1} max={100} value={c} set={setC2}/><CG label="d" min={1} max={100} value={d} set={setD}/>
    </div>
    <div style={{display:'flex',gap:18,padding:'10px 22px',background:'#0c0c0f',borderTop:`1px solid ${C.border}`,flexWrap:'wrap'}}>
      <Stat label="Chi-square" value={stats.chi.toFixed(3)} color={C.mono}/><Stat label="p-value" value={stats.pv<0.001?'<0.001':stats.pv.toFixed(4)} color={stats.pv<0.05?C.green:C.red}/>
      <Stat label="Min expected" value={stats.minExp.toFixed(1)} color={stats.fisherWarn?C.red:C.dim}/>
      {stats.fisherWarn && <Stat label="Warning" value="Use Fisher's exact!" color={C.amber}/>}
    </div>
    <span style={S.eq}>&chi;&#178; = &Sigma; (O - E)&#178; / E &nbsp;&nbsp; (cells shaded by contribution)</span>
    <Mistake text="Using chi-square when any expected count is less than 5. The chi-square approximation breaks down with small expected frequencies. Use Fisher's exact test for small samples or sparse tables."/>
  </div>;
}

/* ─── Tab 5: ANOVA + Effect Size ─── */
function AnovaTab(){
  const [m1,setM1]=useState(50),[m2,setM2]=useState(54),[m3,setM3]=useState(52),[sw,setSw]=useState(10),[ng,setNg]=useState(20);
  const stats=useMemo(()=>{
    const means=[m1,m2,m3], k=3, N=k*ng, grandM=means.reduce((a,b)=>a+b,0)/k;
    const ssb=ng*means.reduce((a,m)=>a+(m-grandM)**2,0), ssw=(ng-1)*k*sw*sw;
    const dfb=k-1, dfw=N-k, msb=ssb/dfb, msw=ssw/dfw, F=msb/msw;
    const pv=1-fCdf(F,dfb,dfw);
    const etaSq=ssb/(ssb+ssw);
    const maxDiff=Math.max(...means)-Math.min(...means), cohensD=maxDiff/sw;
    return {F,pv,etaSq,cohensD,ssb,ssw,dfb,dfw,grandM,means};
  },[m1,m2,m3,sw,ng]);
  const w=420,h=160,colors=[C.cyan,C.pink,C.amber],labels=['Group 1','Group 2','Group 3'];
  const xMin=Math.min(m1,m2,m3)-3*sw,xMax=Math.max(m1,m2,m3)+3*sw;
  const toX=v=>(v-xMin)/(xMax-xMin)*w;
  return <div style={S.section}>
    <div><p style={S.title}>One-Way ANOVA + Effect Size</p><p style={S.sub}>Compare means across 3+ groups. F-test checks if any group differs; effect size tells you how much.</p></div>
    <div style={S.svgWrap}><svg viewBox={`0 0 ${w} ${h}`} style={{width:'100%',maxWidth:460}}>
      {stats.means.map((m,i)=>{let d='';for(let j=0;j<=80;j++){const x=xMin+(xMax-xMin)*j/80,y=normPdf(x,m,sw);d+=(j?'L':'M')+`${toX(x).toFixed(1)},${(h-15-y*sw*Math.sqrt(2*Math.PI)*90).toFixed(1)}`;}
        return <g key={i}><path d={d} fill="none" stroke={colors[i]} strokeWidth={2} opacity={0.85}/>
          <line x1={toX(m)} y1={15} x2={toX(m)} y2={h-15} stroke={colors[i]} strokeDasharray="3" opacity={0.5}/>
          <text x={toX(m)} y={10} fill={colors[i]} fontSize={9} textAnchor="middle">{labels[i]} ({m})</text></g>;})}
      <line x1={toX(stats.grandM)} y1={5} x2={toX(stats.grandM)} y2={h-10} stroke={C.green} strokeWidth={1.5} strokeDasharray="6 3"/>
      <text x={toX(stats.grandM)+3} y={h-3} fill={C.green} fontSize={8}>Grand Mean</text>
    </svg></div>
    <div style={S.controls}>
      <CG label="Mean 1" min={30} max={70} value={m1} set={setM1}/><CG label="Mean 2" min={30} max={70} value={m2} set={setM2}/>
      <CG label="Mean 3" min={30} max={70} value={m3} set={setM3}/><CG label="Within SD" min={3} max={25} value={sw} set={setSw}/>
      <CG label="n/group" min={5} max={50} value={ng} set={setNg}/>
    </div>
    <div style={{display:'flex',gap:18,padding:'10px 22px',background:'#0c0c0f',borderTop:`1px solid ${C.border}`,flexWrap:'wrap'}}>
      <Stat label="F-statistic" value={stats.F.toFixed(3)} color={C.mono}/><Stat label="p-value" value={stats.pv<0.001?'<0.001':stats.pv.toFixed(4)} color={stats.pv<0.05?C.green:C.red}/>
      <Stat label="Eta-squared" value={stats.etaSq.toFixed(3)} color={stats.etaSq>0.14?C.green:stats.etaSq>0.06?C.amber:C.dim}/>
      <Stat label="Max Cohen's d" value={stats.cohensD.toFixed(2)} color={stats.cohensD>0.8?C.green:stats.cohensD>0.5?C.amber:C.dim}/>
    </div>
    <div style={S.note}><span style={S.noteT}>Effect Size Guide</span><p style={S.noteP}>Eta-squared: small=0.01, medium=0.06, large=0.14. Cohen's d: small=0.2, medium=0.5, large=0.8. A significant p-value with tiny effect size means the difference is real but practically unimportant.</p></div>
    <Mistake text="Finding a significant p-value but ignoring a tiny effect size. With large n, even trivial differences become 'significant.' Always report effect size to distinguish statistical significance from practical significance."/>
  </div>;
}

/* ─── Main Component ─── */
export default function TestsForGroupsAndCategories(){
  const [tab,setTab]=useState(0);
  const panels=[TTests,PairedIndep,PropTests,ChiSquare,AnovaTab];
  const Panel=panels[tab];
  return <div style={S.container}>
    <div style={S.topicBar}>{TABS.map((t,i)=><button key={i} style={S.topicTab(tab===i)} onClick={()=>setTab(i)}>{t}</button>)}</div>
    <div style={S.body}><Panel/></div>
  </div>;
}
