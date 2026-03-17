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
  topicTab:a=>({ padding:'7px 13px', borderRadius:10, border:'none', background:a?C.accent:'transparent', color:a?'#fff':C.dim, fontSize:12.5, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s' }),
  body:{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto' },
  section:{ padding:'18px 22px', flex:1, display:'flex', flexDirection:'column', gap:14 },
  svgWrap:{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:220, padding:'4px 0' },
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
  btn:a=>({ padding:'6px 14px', borderRadius:8, border:'none', background:a?C.accent:C.surfaceAlt, color:a?'#fff':C.muted, fontSize:12, fontWeight:600, cursor:'pointer' }),
  ri:{ display:'flex', flexDirection:'column', gap:2 },
  rl:{ fontSize:10, color:C.faint, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' },
  rv:{ fontSize:15, fontWeight:700, fontFamily:'monospace' },
  results:{ display:'flex', gap:18, padding:'10px 22px', background:'#0c0c0f', borderTop:`1px solid ${C.border}`, flexWrap:'wrap' },
};

const CG = ({ label, min, max, step, value, set, unit }) => (
  <div style={S.cg}>
    <span style={S.label}>{label}</span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>set(+e.target.value)} style={S.slider}/>
    <span style={S.val}>{step<1?value.toFixed(step<0.1?2:1):value}{unit||''}</span>
  </div>
);

const RI = ({ label, value, color }) => (
  <div style={S.ri}><span style={S.rl}>{label}</span><span style={{...S.rv,color:color||C.accent}}>{value}</span></div>
);

const W=440, H=260, M={t:25,r:25,b:30,l:40};
const pw=W-M.l-M.r, ph=H-M.t-M.b;

const stats = (pts) => {
  const n=pts.length; if(n<2) return {r:0,b0:0,b1:0,mx:0,my:0};
  const mx=pts.reduce((s,p)=>s+p[0],0)/n, my=pts.reduce((s,p)=>s+p[1],0)/n;
  let sxx=0,syy=0,sxy=0;
  pts.forEach(p=>{const dx=p[0]-mx,dy=p[1]-my;sxx+=dx*dx;syy+=dy*dy;sxy+=dx*dy});
  const r=sxx&&syy?sxy/Math.sqrt(sxx*syy):0;
  const b1=sxx?sxy/sxx:0, b0=my-b1*mx;
  return {r,b0,b1,mx,my,sxx,syy,sxy};
};

const Axes = ({xL,yL,xR=[0,10],yR=[0,10]}) => {
  const ticks=(min,max,n=5)=>{const s=(max-min)/n;return Array.from({length:n+1},(_,i)=>(min+i*s))};
  return <g>
    <line x1={M.l} y1={H-M.b} x2={W-M.r} y2={H-M.b} stroke={C.border} strokeWidth={1}/>
    <line x1={M.l} y1={M.t} x2={M.l} y2={H-M.b} stroke={C.border} strokeWidth={1}/>
    {ticks(xR[0],xR[1]).map((v,i)=><text key={i} x={M.l+((v-xR[0])/(xR[1]-xR[0]))*pw} y={H-M.b+16} fill={C.faint} fontSize={9} textAnchor="middle">{Math.round(v*10)/10}</text>)}
    {ticks(yR[0],yR[1]).map((v,i)=><text key={i} x={M.l-6} y={H-M.b-((v-yR[0])/(yR[1]-yR[0]))*ph} fill={C.faint} fontSize={9} textAnchor="end" dominantBaseline="middle">{Math.round(v*10)/10}</text>)}
    <text x={M.l+pw/2} y={H-2} fill={C.dim} fontSize={10} textAnchor="middle">{xL}</text>
    <text x={12} y={M.t+ph/2} fill={C.dim} fontSize={10} textAnchor="middle" transform={`rotate(-90,12,${M.t+ph/2})`}>{yL}</text>
  </g>;
};

const tx=(v,xR)=>M.l+((v-xR[0])/(xR[1]-xR[0]))*pw;
const ty=(v,yR)=>H-M.b-((v-yR[0])/(yR[1]-yR[0]))*ph;

const TABS=['Covariance + Correlation','Simple Linear Regression','Residuals + Diagnostics','Multiple Regression','Logistic Regression'];

const initPts=()=>[[2,3],[3,4.5],[4,4],[5,6],[6,5.5],[7,7],[8,7.5],[9,8.5]];
const seed=(fn,n=30)=>Array.from({length:n},(_,i)=>{const x=1+8*i/n+Math.random();return [x,fn(x)+(.8*Math.random()-.4)];});

function Tab1(){
  const [pts,setPts]=useState(initPts);
  const [mode,setMode]=useState('linear');
  const [drag,setDrag]=useState(-1);
  const svgRef=useRef();
  const xR=[0,11],yR=[0,11];
  const data=mode==='linear'?pts:pts.map(p=>[p[0],3+2*Math.sin(p[0]*0.8)+(Math.random()-.5)*.4]);
  const {r}=useMemo(()=>stats(data),[data]);

  const toData=(e)=>{const rc=svgRef.current.getBoundingClientRect();const sx=(e.clientX-rc.left)/rc.width*W;const sy=(e.clientY-rc.top)/rc.height*H;return [(sx-M.l)/pw*(xR[1]-xR[0])+xR[0],(H-M.b-sy)/ph*(yR[1]-yR[0])+yR[0]];};
  const onDown=(e,i)=>{e.preventDefault();setDrag(i)};
  const onMove=useCallback(e=>{if(drag<0)return;const[x,y]=toData(e);setPts(p=>{const n=[...p];n[drag]=[Math.max(0,Math.min(11,x)),Math.max(0,Math.min(11,y))];return n})},[drag]);
  const onUp=useCallback(()=>setDrag(-1),[]);
  const onClick=(e)=>{if(drag>=0)return;const[x,y]=toData(e);if(x>=0&&x<=11&&y>=0&&y<=11)setPts(p=>[...p,[x,y]])};
  useEffect(()=>{if(drag>=0){window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);return()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp)}};},[drag,onMove,onUp]);

  return <div style={S.section}>
    <div><p style={S.title}>Covariance and Correlation</p><p style={S.sub}>Use case: height vs weight. Click to add points, drag to move them.</p></div>
    <div style={S.svgWrap}><svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{width:'100%',maxWidth:W,background:C.surface,borderRadius:10,cursor:'crosshair'}} onClick={onClick}>
      <Axes xL="x" yL="y" xR={xR} yR={yR}/>
      {data.map((p,i)=><circle key={i} cx={tx(p[0],xR)} cy={ty(p[1],yR)} r={5} fill={C.accent} opacity={0.85} style={{cursor:'grab'}} onMouseDown={e=>onDown(e,i)}/>)}
    </svg></div>
    <div style={S.results}>
      <RI label="n" value={data.length} color={C.text}/> <RI label="r (Pearson)" value={r.toFixed(3)} color={Math.abs(r)>.7?C.green:Math.abs(r)>.3?C.amber:C.red}/>
    </div>
    <div style={S.controls}>
      <button style={S.btn(mode==='linear')} onClick={()=>setMode('linear')}>Linear data</button>
      <button style={S.btn(mode==='nonlinear')} onClick={()=>setMode('nonlinear')}>Nonlinear data</button>
      <button style={S.btn(false)} onClick={()=>setPts(initPts())}>Reset</button>
    </div>
    <code style={S.eq}>r = Sxy / sqrt(Sxx * Syy)</code>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>r = 0 does NOT mean "no relationship" -- it only means no LINEAR relationship. Switch to nonlinear data above: the points follow a clear sine pattern yet r is near zero.</p></div>
  </div>;
}

function Tab2(){
  const [pts]=useState(()=>seed(x=>0.5+0.9*x,20));
  const [manual,setManual]=useState(false);
  const [b0,setB0]=useState(1);const [b1,setB1]=useState(0.8);
  const xR=[0,11],yR=[0,12];
  const auto=useMemo(()=>stats(pts),[pts]);
  const slope=manual?b1:auto.b1, inter=manual?b0:auto.b0;
  const sse=useMemo(()=>pts.reduce((s,p)=>{const e=p[1]-(inter+slope*p[0]);return s+e*e},0),[pts,slope,inter]);

  return <div style={S.section}>
    <div><p style={S.title}>Simple Linear Regression</p><p style={S.sub}>Use case: predicting sales from ad spend. Toggle manual to adjust slope/intercept.</p></div>
    <div style={S.svgWrap}><svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',maxWidth:W,background:C.surface,borderRadius:10}}>
      <Axes xL="Ad spend" yL="Sales" xR={xR} yR={yR}/>
      {pts.map((p,i)=>{const yh=inter+slope*p[0];return <g key={i}>
        <rect x={Math.min(tx(p[0],xR),tx(p[0],xR))} y={Math.min(ty(p[1],yR),ty(yh,yR))} width={Math.abs(ty(p[1],yR)-ty(yh,yR))} height={Math.abs(ty(p[1],yR)-ty(yh,yR))} fill={C.accent} opacity={0.08}/>
        <line x1={tx(p[0],xR)} y1={ty(p[1],yR)} x2={tx(p[0],xR)} y2={ty(yh,yR)} stroke={C.red} strokeWidth={0.7} opacity={0.5}/>
        <circle cx={tx(p[0],xR)} cy={ty(p[1],yR)} r={4} fill={C.cyan}/>
      </g>})}
      <line x1={tx(xR[0],xR)} y1={ty(inter+slope*xR[0],yR)} x2={tx(xR[1],xR)} y2={ty(inter+slope*xR[1],yR)} stroke={C.amber} strokeWidth={2}/>
    </svg></div>
    <div style={S.results}>
      <RI label="Slope (b1)" value={slope.toFixed(3)} color={C.amber}/> <RI label="Intercept (b0)" value={inter.toFixed(3)} color={C.cyan}/> <RI label="SSE" value={sse.toFixed(2)} color={C.red}/>
    </div>
    <div style={S.controls}>
      <button style={S.btn(manual)} onClick={()=>setManual(!manual)}>{manual?'Auto-fit':'Manual'}</button>
      {manual&&<><CG label="b0" min={-3} max={5} step={0.1} value={b0} set={setB0}/><CG label="b1" min={-1} max={2} step={0.05} value={b1} set={setB1}/></>}
    </div>
    <code style={S.eq}>y&#770; = b&#8320; + b&#8321;x</code>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>Extrapolating far beyond the data range is dangerous. The linear relationship may not hold outside the observed x values -- always check the domain of your data.</p></div>
  </div>;
}

function Tab3(){
  const [mode,setMode]=useState('good');
  const pts=useMemo(()=>{
    if(mode==='good') return seed(x=>1+0.8*x,30);
    if(mode==='hetero') return Array.from({length:30},(_,i)=>{const x=1+8*i/30;return [x,1+0.8*x+(Math.random()-.5)*x*0.8]});
    return seed(x=>1+0.3*x*x-2*x+4,30);
  },[mode]);
  const {b0,b1}=useMemo(()=>stats(pts),[pts]);
  const residuals=useMemo(()=>pts.map(p=>{const yh=b0+b1*p[0];return [yh,p[1]-yh]}),[pts,b0,b1]);
  const rXR=useMemo(()=>{const vs=residuals.map(r=>r[0]);return [Math.min(...vs)-1,Math.max(...vs)+1]},[residuals]);
  const rYR=useMemo(()=>{const vs=residuals.map(r=>r[1]);const mx=Math.max(...vs.map(Math.abs))+0.5;return [-mx,mx]},[residuals]);

  return <div style={S.section}>
    <div><p style={S.title}>Residuals and Diagnostics</p><p style={S.sub}>Patterns in residuals reveal model problems. Toggle between good and problematic fits.</p></div>
    <div style={S.svgWrap}><svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',maxWidth:W,background:C.surface,borderRadius:10}}>
      <Axes xL="Fitted value" yL="Residual" xR={rXR} yR={rYR}/>
      <line x1={M.l} y1={ty(0,rYR)} x2={W-M.r} y2={ty(0,rYR)} stroke={C.amber} strokeWidth={1} strokeDasharray="4 3"/>
      {residuals.map((r,i)=><circle key={i} cx={tx(r[0],rXR)} cy={ty(r[1],rYR)} r={4} fill={mode==='good'?C.green:C.red} opacity={0.8}/>)}
    </svg></div>
    <div style={S.controls}>
      <button style={S.btn(mode==='good')} onClick={()=>setMode('good')}>Good fit</button>
      <button style={S.btn(mode==='hetero')} onClick={()=>setMode('hetero')}>Heteroscedastic</button>
      <button style={S.btn(mode==='nonlinear')} onClick={()=>setMode('nonlinear')}>Nonlinear</button>
    </div>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>Not checking residual plots after fitting a model. A good model shows random scatter around zero. Fan shapes suggest heteroscedasticity; curves suggest a nonlinear relationship the model misses.</p></div>
  </div>;
}

function Tab4(){
  const [b2,setB2]=useState(0.5);
  const pts=useMemo(()=>Array.from({length:30},()=>{const sz=800+Math.random()*2200;const bd=1+Math.floor(Math.random()*5);return {sz,bd,price:50+0.08*sz+b2*10*bd+(Math.random()-.5)*40}}),[b2]);
  const r2_1=useMemo(()=>{const s=stats(pts.map(p=>[p.sz,p.price]));const sst=s.syy;const sse=pts.reduce((a,p)=>{const e=p.price-(s.b0+s.b1*p.sz);return a+e*e},0);return sst?1-sse/sst:0},[pts]);
  const r2_2=useMemo(()=>{const n=pts.length;const mx1=pts.reduce((a,p)=>a+p.sz,0)/n,mx2=pts.reduce((a,p)=>a+p.bd,0)/n,my=pts.reduce((a,p)=>a+p.price,0)/n;
    const X=pts.map(p=>[p.sz-mx1,p.bd-mx2]);const Y=pts.map(p=>p.price-my);
    const XtX=[[0,0],[0,0]],XtY=[0,0];X.forEach((x,i)=>{XtX[0][0]+=x[0]*x[0];XtX[0][1]+=x[0]*x[1];XtX[1][0]+=x[1]*x[0];XtX[1][1]+=x[1]*x[1];XtY[0]+=x[0]*Y[i];XtY[1]+=x[1]*Y[i]});
    const det=XtX[0][0]*XtX[1][1]-XtX[0][1]*XtX[1][0];if(!det)return r2_1;
    const bb=[(XtX[1][1]*XtY[0]-XtX[0][1]*XtY[1])/det,(-XtX[1][0]*XtY[0]+XtX[0][0]*XtY[1])/det];
    const sse=X.reduce((a,x,i)=>{const e=Y[i]-(bb[0]*x[0]+bb[1]*x[1]);return a+e*e},0);const sst=Y.reduce((a,y)=>a+y*y,0);return sst?1-sse/sst:0},[pts,r2_1]);
  const xR=[500,3200],yR=[0,400];

  return <div style={S.section}>
    <div><p style={S.title}>Multiple Regression Overview</p><p style={S.sub}>Use case: house price from size + bedrooms. See how adding a predictor improves R squared.</p></div>
    <div style={S.svgWrap}><svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',maxWidth:W,background:C.surface,borderRadius:10}}>
      <Axes xL="Size (sqft)" yL="Price ($k)" xR={xR} yR={yR}/>
      {pts.map((p,i)=><circle key={i} cx={tx(p.sz,xR)} cy={ty(p.price,yR)} r={3+p.bd} fill={[C.cyan,C.green,C.amber,C.pink,C.orange][p.bd-1]||C.accent} opacity={0.7}/>)}
    </svg></div>
    <div style={S.results}>
      <RI label="R-sq (size only)" value={r2_1.toFixed(3)} color={C.amber}/>
      <RI label="R-sq (size + beds)" value={r2_2.toFixed(3)} color={C.green}/>
      <RI label="Improvement" value={`+${((r2_2-r2_1)*100).toFixed(1)}%`} color={C.cyan}/>
    </div>
    <div style={S.controls}>
      <CG label="Bedroom effect" min={0} max={2} step={0.1} value={b2} set={setB2}/>
      <span style={{fontSize:11,color:C.dim}}>Circle size = # bedrooms. Colors: 1-5 beds.</span>
    </div>
    <code style={S.eq}>price = b&#8320; + b&#8321;(size) + b&#8322;(bedrooms)</code>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>Adding too many predictors causes overfitting -- the model fits noise instead of signal. Also beware multicollinearity: if predictors are highly correlated with each other, coefficient estimates become unstable and hard to interpret.</p></div>
  </div>;
}

function Tab5(){
  const [b0,setB0]=useState(-4);const [b1,setB1]=useState(0.8);
  const pts=useMemo(()=>Array.from({length:30},()=>{const x=1+Math.random()*10;const p=1/(1+Math.exp(-(-.5+0.7*x-3.5)));return [x,Math.random()<p?1:0]}),[]);
  const sigmoid=x=>1/(1+Math.exp(-(b0+b1*x)));
  const boundary=b1?-b0/b1:5;
  const xR=[0,12],yR=[-0.1,1.1];

  return <div style={S.section}>
    <div><p style={S.title}>Logistic Regression Overview</p><p style={S.sub}>Use case: predicting pass/fail from study hours. Adjust coefficients to fit the sigmoid.</p></div>
    <div style={S.svgWrap}><svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',maxWidth:W,background:C.surface,borderRadius:10}}>
      <Axes xL="Study hours" yL="P(pass)" xR={xR} yR={yR}/>
      <line x1={M.l} y1={ty(0.5,yR)} x2={W-M.r} y2={ty(0.5,yR)} stroke={C.faint} strokeWidth={0.7} strokeDasharray="3 3"/>
      {boundary>xR[0]&&boundary<xR[1]&&<line x1={tx(boundary,xR)} y1={M.t} x2={tx(boundary,xR)} y2={H-M.b} stroke={C.amber} strokeWidth={1.5} strokeDasharray="5 3"/>}
      <path d={Array.from({length:100},(_, i)=>{const x=xR[0]+i*(xR[1]-xR[0])/99;return `${i===0?'M':'L'}${tx(x,xR).toFixed(1)},${ty(sigmoid(x),yR).toFixed(1)}`}).join('')} fill="none" stroke={C.accent} strokeWidth={2.5}/>
      {pts.map((p,i)=><circle key={i} cx={tx(p[0],xR)} cy={ty(p[1],yR)} r={5} fill={p[1]?C.green:C.red} opacity={0.8}/>)}
      {boundary>xR[0]&&boundary<xR[1]&&<text x={tx(boundary,xR)} y={M.t+12} fill={C.amber} fontSize={9} textAnchor="middle">boundary={boundary.toFixed(1)}</text>}
    </svg></div>
    <div style={S.results}>
      <RI label="Decision boundary" value={boundary.toFixed(2)} color={C.amber}/>
      <RI label="P(x=6)" value={sigmoid(6).toFixed(3)} color={C.green}/>
    </div>
    <div style={S.controls}>
      <CG label="beta-0" min={-8} max={2} step={0.1} value={b0} set={setB0}/>
      <CG label="beta-1" min={0} max={2} step={0.05} value={b1} set={setB1}/>
    </div>
    <code style={S.eq}>P(y=1) = 1 / (1 + e^-(beta_0 + beta_1 * x))</code>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span><p style={S.noteP}>Using linear regression for binary outcomes produces predicted probabilities outside 0-1 -- which makes no sense. Logistic regression constrains outputs to valid probabilities via the sigmoid function.</p></div>
  </div>;
}

export default function AssociationAndRegression(){
  const [tab,setTab]=useState(0);
  const Tab=[Tab1,Tab2,Tab3,Tab4,Tab5][tab];
  return <div style={S.container}>
    <div style={S.topicBar}>{TABS.map((t,i)=><button key={i} style={S.topicTab(tab===i)} onClick={()=>setTab(i)}>{t}</button>)}</div>
    <div style={S.body}><Tab/></div>
  </div>;
}
