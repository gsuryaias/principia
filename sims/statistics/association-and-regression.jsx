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
  topicBar: {
    display:'flex', gap:4, padding:'10px 16px', background:'#0a0a0f',
    borderBottom:`1px solid ${C.border}`, overflowX:'auto', flexShrink:0,
  },
  topicTab: a => ({
    padding:'7px 13px', borderRadius:10, border:'none',
    background:a ? C.accent : 'transparent', color:a ? '#fff' : C.dim,
    fontSize:12.5, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap',
    transition:'all .15s',
  }),
  body: { flex:1, display:'flex', flexDirection:'column', overflowY:'auto' },
  section: {
    padding:'18px 22px', flex:1, display:'flex', flexDirection:'column', gap:14,
  },
  svgWrap: {
    display:'flex', justifyContent:'center', alignItems:'center',
    minHeight:220, padding:'4px 0',
  },
  controls: {
    padding:'12px 22px', background:C.surface, borderTop:`1px solid ${C.border}`,
    display:'flex', flexWrap:'wrap', gap:16, alignItems:'center',
  },
  eq: {
    display:'block', padding:'10px 16px', background:C.surfaceAlt,
    border:`1px solid ${C.borderLight}`, borderRadius:10, fontFamily:'monospace',
    fontSize:14, color:C.mono, margin:'8px 0', textAlign:'center', lineHeight:1.7,
  },
  note: {
    padding:'12px 16px', background:C.accentGlow,
    borderLeft:`3px solid ${C.accent}`, borderRadius:'0 10px 10px 0', margin:'6px 0',
  },
  noteT: {
    fontWeight:700, color:C.accentLight, fontSize:12, marginBottom:4,
    display:'block', textTransform:'uppercase', letterSpacing:'0.04em',
  },
  noteP: { fontSize:13, lineHeight:1.65, color:C.muted, margin:0 },
  title: { fontSize:17, fontWeight:700, color:C.text, margin:'0 0 2px' },
  sub: { fontSize:12.5, color:C.dim, margin:0, lineHeight:1.5 },
  btn: a => ({
    padding:'6px 14px', borderRadius:8, border:'none',
    background:a ? C.accent : C.surfaceAlt, color:a ? '#fff' : C.muted,
    fontSize:12, fontWeight:600, cursor:'pointer',
  }),
  results: {
    display:'flex', gap:18, padding:'10px 22px', background:'#0c0c0f',
    borderTop:`1px solid ${C.border}`, flexWrap:'wrap',
  },
};
const CG = ({ label, min, max, step, value, set }) => (
  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
    <span style={{ fontSize:12, color:C.muted, fontWeight:500, whiteSpace:'nowrap' }}>
      {label}
    </span>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => set(+e.target.value)}
      style={{ width:110, accentColor:C.accent, cursor:'pointer' }} />
    <span style={{ fontSize:12, color:C.dim, fontFamily:'monospace', minWidth:42, textAlign:'right' }}>
      {step < 1 ? value.toFixed(step < 0.1 ? 2 : 1) : value}
    </span>
  </div>
);

const RI = ({ label, value, color }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
    <span style={{ fontSize:10, color:C.faint, fontWeight:700,
      textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
    <span style={{ fontSize:15, fontWeight:700, fontFamily:'monospace',
      color: color || C.accent }}>{value}</span>
  </div>
);

const VW=440,VH=270,MG={t:26,r:26,b:32,l:42};
const pw=VW-MG.l-MG.r,ph=VH-MG.t-MG.b;
const px=(v,r)=>MG.l+((v-r[0])/(r[1]-r[0]))*pw;
const py=(v,r)=>VH-MG.b-((v-r[0])/(r[1]-r[0]))*ph;

const compStats = (pts) => {
  const n = pts.length;
  if (n < 2) return { r:0, b0:0, b1:0, mx:0, my:0, cov:0, syy:0 };
  const mx = pts.reduce((s, p) => s + p[0], 0) / n;
  const my = pts.reduce((s, p) => s + p[1], 0) / n;
  let sxx = 0, syy = 0, sxy = 0;
  pts.forEach(p => {
    const dx = p[0] - mx, dy = p[1] - my;
    sxx += dx * dx; syy += dy * dy; sxy += dx * dy;
  });
  const r = (sxx && syy) ? sxy / Math.sqrt(sxx * syy) : 0;
  const b1 = sxx ? sxy / sxx : 0;
  const b0 = my - b1 * mx;
  return { r, b0, b1, mx, my, cov: sxy / (n - 1), syy };
};
const Axes = ({ xL, yL, xR, yR }) => {
  const tk = (a, b, n = 5) => Array.from({ length: n + 1 }, (_, i) => a + i * (b - a) / n);
  return (
    <g>
      <line x1={MG.l} y1={VH - MG.b} x2={VW - MG.r} y2={VH - MG.b}
        stroke={C.border} />
      <line x1={MG.l} y1={MG.t} x2={MG.l} y2={VH - MG.b}
        stroke={C.border} />
      {tk(xR[0], xR[1]).map((v, i) => (
        <text key={i} x={px(v, xR)} y={VH - MG.b + 16}
          fill={C.faint} fontSize={9} textAnchor="middle">
          {Math.round(v * 10) / 10}
        </text>
      ))}
      {tk(yR[0], yR[1]).map((v, i) => (
        <text key={i} x={MG.l - 6} y={py(v, yR)}
          fill={C.faint} fontSize={9} textAnchor="end" dominantBaseline="middle">
          {Math.round(v * 10) / 10}
        </text>
      ))}
      <text x={MG.l + pw / 2} y={VH - 3}
        fill={C.dim} fontSize={10} textAnchor="middle">{xL}</text>
      <text x={12} y={MG.t + ph / 2} fill={C.dim} fontSize={10}
        textAnchor="middle"
        transform={`rotate(-90,12,${MG.t + ph / 2})`}>{yL}</text>
    </g>
  );
};
const TABS=['Covariance + Correlation','Simple Linear Regression','Residuals + Diagnostics','Multiple Regression','Logistic Regression'];
const initPts=()=>[[2,3],[3,4.5],[4,4],[5,6],[6,5.5],[7,7],[8,7.5],[9,8.5]];
const seed=(fn,n=30)=>Array.from({length:n},(_,i)=>{const x=1+8*i/n+Math.random();return[x,fn(x)+(.8*Math.random()-.4)]});

/* ═══ TAB 1 — Covariance + Correlation ═══ */
function Tab1(){
  const[pts,setPts]=useState(initPts);const[mode,setMode]=useState('linear');
  const[drag,setDrag]=useState(-1);const svgRef=useRef();
  const xR=[0,11],yR=[0,11];
  const data=useMemo(()=>mode==='linear'?pts:pts.map(p=>[p[0],5+3*Math.sin(p[0]*0.7)]),[pts,mode]);
  const st=useMemo(()=>compStats(data),[data]);
  const toD=e=>{const rc=svgRef.current.getBoundingClientRect();const sx=(e.clientX-rc.left)/rc.width*VW,sy=(e.clientY-rc.top)/rc.height*VH;return[(sx-MG.l)/pw*11,(VH-MG.b-sy)/ph*11]};
  const onDown=(e,i)=>{e.preventDefault();e.stopPropagation();setDrag(i)};
  const onMove=useCallback(e=>{if(drag<0)return;const[x,y]=toD(e);setPts(p=>{const n=[...p];n[drag]=[Math.max(.5,Math.min(10.5,x)),Math.max(.5,Math.min(10.5,y))];return n})},[drag]);
  const onUp=useCallback(()=>setDrag(-1),[]);
  const onClick=e=>{if(drag>=0)return;const[x,y]=toD(e);if(x>0&&x<11&&y>0&&y<11)setPts(p=>[...p,[x,y]])};
  useEffect(()=>{if(drag>=0){window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',onUp);return()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',onUp)}}},[drag,onMove,onUp]);
  const rC=Math.abs(st.r)>.7?C.green:Math.abs(st.r)>.3?C.amber:C.red;
  return <div style={S.section}>
    <div><p style={S.title}>Covariance and Correlation</p>
    <p style={S.sub}>Use case: height vs weight. Click to add points, drag to move them. Watch r update live.</p></div>
    <div style={S.svgWrap}><svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} style={{width:'100%',maxWidth:VW,background:C.surface,borderRadius:10,cursor:'crosshair'}} onClick={onClick}>
      <Axes xL="x" yL="y" xR={xR} yR={yR}/>
      <line x1={px(st.mx,xR)} y1={MG.t} x2={px(st.mx,xR)} y2={VH-MG.b} stroke={C.dim} strokeWidth={.5} strokeDasharray="3 4"/>
      <line x1={MG.l} y1={py(st.my,yR)} x2={VW-MG.r} y2={py(st.my,yR)} stroke={C.dim} strokeWidth={.5} strokeDasharray="3 4"/>
      {data.map((p,i)=><circle key={i} cx={px(p[0],xR)} cy={py(p[1],yR)} r={drag===i?7:5} fill={C.accent} opacity={.85} style={{cursor:'grab'}} onMouseDown={e=>onDown(e,i)}/>)}
      {data.length>1&&<text x={VW-MG.r-4} y={MG.t+14} fill={rC} fontSize={13} fontWeight={700} textAnchor="end" fontFamily="monospace">r = {st.r.toFixed(3)}</text>}
    </svg></div>
    <div style={S.results}>
      <RI label="n" value={data.length} color={C.text}/><RI label="Cov(x,y)" value={st.cov.toFixed(3)} color={C.cyan}/>
      <RI label="r (Pearson)" value={st.r.toFixed(3)} color={rC}/><RI label="Mean x" value={st.mx.toFixed(2)} color={C.dim}/>
    </div>
    <div style={S.controls}>
      <button style={S.btn(mode==='linear')} onClick={()=>setMode('linear')}>Linear data</button>
      <button style={S.btn(mode==='nonlinear')} onClick={()=>setMode('nonlinear')}>Nonlinear (sine)</button>
      <button style={S.btn(false)} onClick={()=>setPts(initPts())}>Reset</button>
      <button style={S.btn(false)} onClick={()=>setPts(p=>p.length>2?p.slice(0,-1):p)}>Undo last</button>
    </div>
    <code style={S.eq}>r = Cov(x,y) / (s_x * s_y)&nbsp;&nbsp;range: [-1, +1]</code>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span>
    <p style={S.noteP}>r = 0 does NOT mean "no relationship" -- it only means no <em>linear</em> relationship. Switch to "Nonlinear (sine)": the points follow a clear wave pattern yet r is near zero. Always plot your data first.</p></div>
  </div>;
}

/* ═══ TAB 2 — Simple Linear Regression ═══ */
function Tab2(){
  const[pts]=useState(()=>seed(x=>0.5+0.9*x,20));
  const[manual,setManual]=useState(false);const[b0,setB0]=useState(1);const[b1,setB1]=useState(0.8);
  const xR=[0,11],yR=[0,12];const auto=useMemo(()=>compStats(pts),[pts]);
  const slope=manual?b1:auto.b1,inter=manual?b0:auto.b0;
  const sse=useMemo(()=>pts.reduce((s,p)=>{const e=p[1]-(inter+slope*p[0]);return s+e*e},0),[pts,slope,inter]);
  const bestSSE=useMemo(()=>pts.reduce((s,p)=>{const e=p[1]-(auto.b0+auto.b1*p[0]);return s+e*e},0),[pts,auto]);
  return <div style={S.section}>
    <div><p style={S.title}>Simple Linear Regression</p>
    <p style={S.sub}>Use case: predicting sales from ad spend. Toggle manual to adjust slope/intercept and watch SSE. The red squares show squared errors the OLS line minimizes.</p></div>
    <div style={S.svgWrap}><svg viewBox={`0 0 ${VW} ${VH}`} style={{width:'100%',maxWidth:VW,background:C.surface,borderRadius:10}}>
      <Axes xL="Ad spend ($k)" yL="Sales ($k)" xR={xR} yR={yR}/>
      {pts.map((p,i)=>{const yh=inter+slope*p[0],cyP=py(p[1],yR),cyH=py(yh,yR),side=Math.abs(cyP-cyH);
        return <g key={i}>
          <rect x={px(p[0],xR)-side/2} y={Math.min(cyP,cyH)} width={side} height={side} fill={C.red} opacity={.07} stroke={C.red} strokeWidth={.3} strokeOpacity={.2}/>
          <line x1={px(p[0],xR)} y1={cyP} x2={px(p[0],xR)} y2={cyH} stroke={C.red} strokeWidth={.8} opacity={.5}/>
          <circle cx={px(p[0],xR)} cy={cyP} r={4} fill={C.cyan}/>
        </g>})}
      <line x1={px(xR[0],xR)} y1={py(inter+slope*xR[0],yR)} x2={px(xR[1],xR)} y2={py(inter+slope*xR[1],yR)} stroke={C.amber} strokeWidth={2}/>
    </svg></div>
    <div style={S.results}>
      <RI label="Slope (b1)" value={slope.toFixed(3)} color={C.amber}/>
      <RI label="Intercept (b0)" value={inter.toFixed(3)} color={C.cyan}/>
      <RI label="SSE" value={sse.toFixed(2)} color={C.red}/>
      {manual&&<RI label="Best SSE" value={bestSSE.toFixed(2)} color={C.green}/>}
    </div>
    <div style={S.controls}>
      <button style={S.btn(manual)} onClick={()=>setManual(!manual)}>{manual?'Auto-fit (OLS)':'Manual mode'}</button>
      {manual&&<><CG label="b0" min={-3} max={5} step={0.1} value={b0} set={setB0}/><CG label="b1" min={-1} max={2} step={0.05} value={b1} set={setB1}/></>}
    </div>
    <code style={S.eq}>{'y\u0302 = b\u2080 + b\u2081x  |  SSE = \u03A3(y\u1D62 - y\u0302\u1D62)\u00B2'}</code>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span>
    <p style={S.noteP}>Extrapolating far beyond the observed data range is dangerous. The linear relationship holding for x in [1, 10] may break down entirely at x = 50. Always note the domain of your training data.</p></div>
  </div>;
}

/* ═══ TAB 3 — Residuals + Diagnostics ═══ */
function Tab3(){
  const[mode,setMode]=useState('good');
  const pts=useMemo(()=>{
    if(mode==='good')return seed(x=>1+.8*x,30);
    if(mode==='hetero')return Array.from({length:30},(_,i)=>{const x=1+8*i/30;return[x,1+.8*x+(Math.random()-.5)*x*.9]});
    return seed(x=>.3*x*x-2*x+6,30);
  },[mode]);
  const{b0,b1}=useMemo(()=>compStats(pts),[pts]);
  const res=useMemo(()=>pts.map(p=>{const yh=b0+b1*p[0];return[yh,p[1]-yh]}),[pts,b0,b1]);
  const rXR=useMemo(()=>{const v=res.map(r=>r[0]);return[Math.min(...v)-.5,Math.max(...v)+.5]},[res]);
  const rYR=useMemo(()=>{const v=res.map(r=>r[1]);const m=Math.max(...v.map(Math.abs))+.5;return[-m,m]},[res]);
  const dc=mode==='good'?C.green:C.red;
  return <div style={S.section}>
    <div><p style={S.title}>Residuals and Diagnostics</p>
    <p style={S.sub}>After fitting a model, always inspect the residual plot. Patterns mean the model is missing something.</p></div>
    <div style={S.svgWrap}><svg viewBox={`0 0 ${VW} ${VH}`} style={{width:'100%',maxWidth:VW,background:C.surface,borderRadius:10}}>
      <Axes xL="Fitted value" yL="Residual" xR={rXR} yR={rYR}/>
      <line x1={MG.l} y1={py(0,rYR)} x2={VW-MG.r} y2={py(0,rYR)} stroke={C.amber} strokeWidth={1} strokeDasharray="4 3"/>
      {res.map((r,i)=><circle key={i} cx={px(r[0],rXR)} cy={py(r[1],rYR)} r={4} fill={dc} opacity={.8}/>)}
      <text x={VW-MG.r-4} y={MG.t+14} fill={dc} fontSize={11} fontWeight={600} textAnchor="end">
        {mode==='good'?'Random scatter (good)':mode==='hetero'?'Fan shape (bad)':'Curved pattern (bad)'}
      </text>
    </svg></div>
    <div style={S.controls}>
      <button style={S.btn(mode==='good')} onClick={()=>setMode('good')}>Good fit</button>
      <button style={S.btn(mode==='hetero')} onClick={()=>setMode('hetero')}>Heteroscedastic</button>
      <button style={S.btn(mode==='nonlinear')} onClick={()=>setMode('nonlinear')}>Nonlinear</button>
    </div>
    <code style={S.eq}>{'e\u1D62 = y\u1D62 - y\u0302\u1D62  |  Ideal: no pattern, constant spread'}</code>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span>
    <p style={S.noteP}>Not checking residual plots after fitting a model. A good residual plot shows random scatter centered on zero. Fan shapes indicate heteroscedasticity (non-constant variance). Curved patterns mean a linear model is missing the true nonlinear relationship.</p></div>
  </div>;
}

/* ═══ TAB 4 — Multiple Regression Overview ═══ */
function Tab4(){
  const[be,setBe]=useState(0.5);const bC=[C.cyan,C.green,C.amber,C.pink,C.orange];
  const pts=useMemo(()=>Array.from({length:35},()=>{const sz=800+Math.random()*2200,bd=1+Math.floor(Math.random()*5);return{sz,bd,price:50+.08*sz+be*12*bd+(Math.random()-.5)*40}}),[be]);
  const r2_1=useMemo(()=>{const s=compStats(pts.map(p=>[p.sz,p.price]));const sse=pts.reduce((a,p)=>{const e=p.price-(s.b0+s.b1*p.sz);return a+e*e},0);return s.syy?1-sse/s.syy:0},[pts]);
  const r2_2=useMemo(()=>{const n=pts.length,mx1=pts.reduce((a,p)=>a+p.sz,0)/n,mx2=pts.reduce((a,p)=>a+p.bd,0)/n,my=pts.reduce((a,p)=>a+p.price,0)/n;
    const X=pts.map(p=>[p.sz-mx1,p.bd-mx2]),Y=pts.map(p=>p.price-my);
    const A=[[0,0],[0,0]],B=[0,0];X.forEach((x,i)=>{A[0][0]+=x[0]*x[0];A[0][1]+=x[0]*x[1];A[1][0]+=x[1]*x[0];A[1][1]+=x[1]*x[1];B[0]+=x[0]*Y[i];B[1]+=x[1]*Y[i]});
    const d=A[0][0]*A[1][1]-A[0][1]*A[1][0];if(!d)return r2_1;
    const bb=[(A[1][1]*B[0]-A[0][1]*B[1])/d,(-A[1][0]*B[0]+A[0][0]*B[1])/d];
    const sse=X.reduce((a,x,i)=>{const e=Y[i]-(bb[0]*x[0]+bb[1]*x[1]);return a+e*e},0);
    const sst=Y.reduce((a,y)=>a+y*y,0);return sst?1-sse/sst:0},[pts,r2_1]);
  const xR=[500,3200],yR=[0,420];
  return <div style={S.section}>
    <div><p style={S.title}>Multiple Regression Overview</p>
    <p style={S.sub}>Use case: house price from size + bedrooms. Increase bedroom effect to see R-squared improve when adding the second predictor. Circle size/color = bedroom count.</p></div>
    <div style={S.svgWrap}><svg viewBox={`0 0 ${VW} ${VH}`} style={{width:'100%',maxWidth:VW,background:C.surface,borderRadius:10}}>
      <Axes xL="Size (sqft)" yL="Price ($k)" xR={xR} yR={yR}/>
      {pts.map((p,i)=><circle key={i} cx={px(p.sz,xR)} cy={py(p.price,yR)} r={2.5+p.bd*1.2} fill={bC[p.bd-1]||C.accent} opacity={.7}/>)}
      {bC.map((c,i)=><g key={i}><circle cx={VW-MG.r-8} cy={MG.t+12+i*15} r={3+i+1} fill={c} opacity={.8}/><text x={VW-MG.r-18} y={MG.t+13+i*15} fill={C.dim} fontSize={8} textAnchor="end" dominantBaseline="middle">{i+1}bd</text></g>)}
    </svg></div>
    <div style={S.results}>
      <RI label="R-sq (size only)" value={r2_1.toFixed(3)} color={C.amber}/>
      <RI label="R-sq (size+beds)" value={r2_2.toFixed(3)} color={C.green}/>
      <RI label="Improvement" value={`+${((r2_2-r2_1)*100).toFixed(1)}%`} color={C.cyan}/>
    </div>
    <div style={S.controls}>
      <CG label="Bedroom effect" min={0} max={2} step={0.1} value={be} set={setBe}/>
    </div>
    <code style={S.eq}>{'price = b\u2080 + b\u2081(size) + b\u2082(bedrooms)'}</code>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span>
    <p style={S.noteP}>Adding too many predictors causes overfitting: the model memorizes noise instead of signal. Also beware multicollinearity -- if two predictors are highly correlated (e.g., total rooms and bedrooms), coefficient estimates become unstable and hard to interpret.</p></div>
  </div>;
}

/* ═══ TAB 5 — Logistic Regression Overview ═══ */
function Tab5(){
  const[b0,setB0]=useState(-4);const[b1,setB1]=useState(0.8);const[showLin,setShowLin]=useState(false);
  const pts=useMemo(()=>Array.from({length:35},()=>{const x=1+Math.random()*10;const p=1/(1+Math.exp(-(-.5+.7*x-3.5)));return[x,Math.random()<p?1:0]}),[]);
  const sig=x=>1/(1+Math.exp(-(b0+b1*x)));const bnd=b1?-b0/b1:5;
  const xR=[0,12],yR=[-.15,1.15];const lin=useMemo(()=>compStats(pts),[pts]);
  const acc=useMemo(()=>pts.filter(p=>(sig(p[0])>=.5?1:0)===p[1]).length/pts.length,[pts,b0,b1]);
  return <div style={S.section}>
    <div><p style={S.title}>Logistic Regression Overview</p>
    <p style={S.sub}>Use case: predicting pass/fail from study hours. Adjust beta coefficients to move the sigmoid. Green = pass, red = fail. Toggle "Show linear fit" to see why linear regression fails here.</p></div>
    <div style={S.svgWrap}><svg viewBox={`0 0 ${VW} ${VH}`} style={{width:'100%',maxWidth:VW,background:C.surface,borderRadius:10}}>
      <Axes xL="Study hours" yL="P(pass)" xR={xR} yR={yR}/>
      <line x1={MG.l} y1={py(.5,yR)} x2={VW-MG.r} y2={py(.5,yR)} stroke={C.faint} strokeWidth={.7} strokeDasharray="3 3"/>
      {bnd>xR[0]&&bnd<xR[1]&&<g>
        <line x1={px(bnd,xR)} y1={MG.t} x2={px(bnd,xR)} y2={VH-MG.b} stroke={C.amber} strokeWidth={1.5} strokeDasharray="5 3"/>
        <text x={px(bnd,xR)} y={MG.t+14} fill={C.amber} fontSize={9} textAnchor="middle" fontFamily="monospace">boundary={bnd.toFixed(1)}h</text>
      </g>}
      {showLin&&<line x1={px(xR[0],xR)} y1={py(lin.b0+lin.b1*xR[0],yR)} x2={px(xR[1],xR)} y2={py(lin.b0+lin.b1*xR[1],yR)} stroke={C.red} strokeWidth={1.5} strokeDasharray="6 3" opacity={.7}/>}
      <path d={Array.from({length:120},(_,i)=>{const x=xR[0]+i*(xR[1]-xR[0])/119;return`${i===0?'M':'L'}${px(x,xR).toFixed(1)},${py(sig(x),yR).toFixed(1)}`}).join('')} fill="none" stroke={C.accent} strokeWidth={2.5}/>
      {pts.map((p,i)=><circle key={i} cx={px(p[0],xR)} cy={py(p[1],yR)} r={5} fill={p[1]?C.green:C.red} opacity={.8} stroke={C.bg} strokeWidth={.5}/>)}
    </svg></div>
    <div style={S.results}>
      <RI label="Decision boundary" value={bnd.toFixed(2)+'h'} color={C.amber}/>
      <RI label="P(x=6)" value={sig(6).toFixed(3)} color={C.green}/>
      <RI label="Accuracy" value={(acc*100).toFixed(0)+'%'} color={acc>.7?C.green:C.red}/>
    </div>
    <div style={S.controls}>
      <CG label="beta-0" min={-8} max={2} step={0.1} value={b0} set={setB0}/>
      <CG label="beta-1" min={0} max={2} step={0.05} value={b1} set={setB1}/>
      <button style={S.btn(showLin)} onClick={()=>setShowLin(!showLin)}>{showLin?'Hide':'Show'} linear fit</button>
    </div>
    <code style={S.eq}>{'P(y=1) = 1 / (1 + e^-(\u03B2\u2080 + \u03B2\u2081x))'}</code>
    <div style={S.note}><span style={S.noteT}>Common Mistake</span>
    <p style={S.noteP}>Using linear regression for binary outcomes (toggle "Show linear fit") produces predicted probabilities outside [0, 1] -- which is nonsensical. Logistic regression uses the sigmoid to constrain all outputs to valid probabilities.</p></div>
  </div>;
}

/* ═══ Main ═══ */
export default function AssociationAndRegression(){
  const[tab,setTab]=useState(0);
  const P=[Tab1,Tab2,Tab3,Tab4,Tab5][tab];
  return <div style={S.container}>
    <div style={S.topicBar}>{TABS.map((t,i)=><button key={i} style={S.topicTab(tab===i)} onClick={()=>setTab(i)}>{t}</button>)}</div>
    <div style={S.body}><P/></div>
  </div>;
}
