import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   Hypothesis Testing Core — 5-tab interactive simulation
   Tabs: Null vs Alt → Test Statistic → P-Value → Power → Multiple Testing
   ═══════════════════════════════════════════════════════════════════ */

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
  btn:c=>({ padding:'6px 14px', borderRadius:8, border:'none', background:c||C.accent, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s' }),
  ri:{ display:'flex', flexDirection:'column', gap:2 },
  rl:{ fontSize:10, color:C.faint, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' },
  rv:{ fontSize:15, fontWeight:700, fontFamily:'monospace' },
  results:{ display:'flex', gap:18, padding:'10px 22px', background:'#0c0c0f', borderTop:`1px solid ${C.border}`, flexWrap:'wrap' },
};

const TABS = [
  { id:'null-alt', label:'Null vs Alternative' },
  { id:'test-stat', label:'Test Statistic' },
  { id:'p-value', label:'P-Value' },
  { id:'power', label:'Type I/II + Power' },
  { id:'multiple', label:'Multiple Testing' },
];

/* ─── Math helpers ─── */
const norm = (x,mu,sig) => Math.exp(-0.5*((x-mu)/sig)**2)/(sig*Math.sqrt(2*Math.PI));
const normCDF = (z) => { const t=1/(1+0.2316419*Math.abs(z)),d=0.3989422804*Math.exp(-z*z/2); const p=d*t*(0.3193815+t*(-0.3565638+t*(1.781478+t*(-1.821256+t*1.330274)))); return z>0?1-p:p; };
const normInv = (p) => { if(p<=0)return-Infinity; if(p>=1)return Infinity; const pp=p<0.5?p:1-p,t=Math.sqrt(-2*Math.log(pp)); const z=t-(2.515517+0.802853*t+0.010328*t*t)/(1+1.432788*t+0.189269*t*t+0.001308*t*t*t); return p<0.5?-z:z; };

const CG = ({label,min,max,step,value,set,unit}) => (
  <div style={S.cg}><span style={S.label}>{label}</span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e=>set(+e.target.value)} style={S.slider}/>
    <span style={S.val}>{step<1?value.toFixed(step<0.01?3:step<0.1?2:1):value}{unit||''}</span>
  </div>
);

const W=460, H=230, MG={t:22,r:20,b:32,l:40};
const pw=W-MG.l-MG.r, ph=H-MG.t-MG.b;

function curvePath(mu,sig,xMin,xMax,steps=120) {
  const pts=[]; for(let i=0;i<=steps;i++){const x=xMin+(xMax-xMin)*i/steps;pts.push([x,norm(x,mu,sig)]);} return pts;
}
function toSVG(pts,xMin,xMax,yMax) { return pts.map(([x,y])=>[MG.l+(x-xMin)/(xMax-xMin)*pw,MG.t+ph-y/yMax*ph]); }
function pathD(p) { return p.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(''); }
function areaD(p,bl) { if(!p.length)return''; return pathD(p)+`L${p[p.length-1][0].toFixed(1)},${bl}L${p[0][0].toFixed(1)},${bl}Z`; }

const Axis=({xMin,xMax,ticks,labelText})=>{const bl=MG.t+ph;return(<>
  <line x1={MG.l} y1={bl} x2={MG.l+pw} y2={bl} stroke={C.faint} strokeWidth={1}/>
  {ticks.map(v=><text key={v} x={MG.l+(v-xMin)/(xMax-xMin)*pw} y={bl+14} fill={C.faint} fontSize={10} textAnchor="middle">{v}</text>)}
  <text x={MG.l+pw/2} y={bl+27} fill={C.dim} fontSize={10} textAnchor="middle">{labelText}</text>
</>);};

const RI=({label,value,color})=>(<div style={S.ri}><span style={S.rl}>{label}</span><span style={{...S.rv,color:color||C.accent}}>{value}</span></div>);

/* ═══════════════════════════════════════════════════════════════════
   Tab 1 — Null vs Alternative
   ═══════════════════════════════════════════════════════════════════ */
function Tab1({ trueP, setTrueP }) {
  const [flips, setFlips] = useState(null);
  const n = 100;
  const sigNull = Math.sqrt(0.5 * 0.5 / n);
  const sigAlt = Math.sqrt(trueP * (1 - trueP) / n);
  const xMin = 0.2, xMax = 0.8;
  const yMax = norm(0.5, 0.5, sigNull) * 1.15;
  const baseline = MG.t + ph;
  const nullPts = toSVG(curvePath(0.5, sigNull, xMin, xMax), xMin, xMax, yMax);
  const altPts = toSVG(curvePath(trueP, sigAlt, xMin, xMax), xMin, xMax, yMax);

  const flipCoin = useCallback(() => {
    let heads = 0;
    for (let i = 0; i < n; i++) heads += Math.random() < trueP ? 1 : 0;
    setFlips(heads / n);
  }, [trueP]);

  const flipX = flips != null ? MG.l + (flips - xMin) / (xMax - xMin) * pw : null;
  const overlap = 1 - Math.abs(trueP - 0.5) / 0.3;

  return (<>
    <h3 style={S.title}>Is this coin fair?</h3>
    <p style={S.sub}>
      H0: p = 0.5 (fair) vs H1: p = {trueP.toFixed(2)}.
      Flip {n} times and see where the sample proportion falls.
    </p>
    <div style={S.svgWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
        <path d={areaD(nullPts, baseline)} fill="rgba(99,102,241,0.18)" />
        <path d={pathD(nullPts)} fill="none" stroke={C.accent} strokeWidth={2} />
        <path d={areaD(altPts, baseline)} fill="rgba(239,68,68,0.14)" />
        <path d={pathD(altPts)} fill="none" stroke={C.red} strokeWidth={2} />
        {flipX != null && flipX >= MG.l && flipX <= MG.l + pw && <>
          <line x1={flipX} y1={MG.t} x2={flipX} y2={baseline}
            stroke={C.amber} strokeWidth={2} strokeDasharray="4,3" />
          <circle cx={flipX} cy={MG.t + 8} r={4} fill={C.amber} />
          <text x={flipX} y={MG.t - 2} fill={C.amber} fontSize={10}
            textAnchor="middle">p-hat={flips.toFixed(2)}</text>
        </>}
        <Axis xMin={xMin} xMax={xMax} ticks={[0.3, 0.4, 0.5, 0.6, 0.7]}
          labelText="Sample proportion (p-hat)" />
        <rect x={W - 130} y={6} width={10} height={10} rx={2} fill={C.accent} opacity={0.6} />
        <text x={W - 116} y={15} fill={C.muted} fontSize={10}>H0 (null)</text>
        <rect x={W - 130} y={22} width={10} height={10} rx={2} fill={C.red} opacity={0.6} />
        <text x={W - 116} y={31} fill={C.muted} fontSize={10}>H1 (alternative)</text>
      </svg>
    </div>
    <div style={S.controls}>
      <CG label="True p" min={0.3} max={0.7} step={0.01} value={trueP} set={setTrueP} />
      <button style={S.btn(C.amber)} onClick={flipCoin}>Flip {n} coins</button>
      {flips != null && <span style={{ fontSize: 12, color: C.muted }}>
        Result: {Math.round(flips * n)} heads / {n}
      </span>}
    </div>
    <p style={{ ...S.sub, marginTop: 4 }}>
      {overlap > 0.7
        ? 'The distributions overlap heavily -- hard to distinguish H0 from H1.'
        : overlap > 0.3
        ? 'Moderate separation -- larger n would help.'
        : 'Clear separation -- this effect size is easy to detect.'}
    </p>
    <div style={S.note}>
      <span style={S.noteT}>Common Mistake</span>
      <p style={S.noteP}>
        "Fail to reject H0" does NOT mean "H0 is true." It only means we lack
        sufficient evidence to distinguish the true proportion from 0.5 given
        our sample size.
      </p>
    </div>
  </>);
}

/* ═══════════════════════════════════════════════════════════════════
   Tab 2 — Test Statistic
   ═══════════════════════════════════════════════════════════════════ */
function Tab2({ xBar, setXBar, mu0, setMu0, sigma, setSigma, n2, setN2 }) {
  const se = sigma / Math.sqrt(n2);
  const z = (xBar - mu0) / se;
  const xMin = mu0 - 4 * se, xMax = mu0 + 4 * se;
  const yMax = norm(mu0, mu0, se) * 1.15;
  const baseline = MG.t + ph;
  const pts = toSVG(curvePath(mu0, se, xMin, xMax), xMin, xMax, yMax);
  const zX = MG.l + ((xBar - xMin) / (xMax - xMin)) * pw;

  // Critical region shading at +/-1.96
  const critRight = curvePath(mu0, se, mu0 + 1.96 * se, xMax, 40);
  const critLeft = curvePath(mu0, se, xMin, mu0 - 1.96 * se, 40);
  const crSVG = toSVG(critRight, xMin, xMax, yMax);
  const clSVG = toSVG(critLeft, xMin, xMax, yMax);

  return (<>
    <h3 style={S.title}>Computing the Test Statistic</h3>
    <p style={S.sub}>How many standard errors is x-bar from mu0? Gray zones = rejection regions at alpha = 0.05.</p>
    <span style={S.eq}>
      z = (x-bar - mu0) / (sigma / sqrt(n)) = ({xBar.toFixed(1)} - {mu0.toFixed(1)}) / ({sigma.toFixed(1)} / sqrt({n2})) ={' '}
      <b style={{ color: Math.abs(z) > 1.96 ? C.red : C.green }}>{z.toFixed(3)}</b>
    </span>
    <div style={S.svgWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
        <path d={areaD(crSVG, baseline)} fill="rgba(239,68,68,0.12)" />
        <path d={areaD(clSVG, baseline)} fill="rgba(239,68,68,0.12)" />
        <path d={areaD(pts, baseline)} fill="rgba(99,102,241,0.10)" />
        <path d={pathD(pts)} fill="none" stroke={C.accent} strokeWidth={2} />
        {zX >= MG.l && zX <= MG.l + pw && <>
          <line x1={zX} y1={MG.t} x2={zX} y2={baseline}
            stroke={C.amber} strokeWidth={2} strokeDasharray="4,3" />
          <circle cx={zX} cy={MG.t + ph - norm(xBar, mu0, se) / yMax * ph}
            r={4} fill={C.amber} />
          <text x={zX} y={MG.t - 4} fill={C.amber} fontSize={10} textAnchor="middle">
            z = {z.toFixed(2)}
          </text>
        </>}
        <line x1={MG.l} y1={baseline} x2={MG.l + pw} y2={baseline}
          stroke={C.faint} strokeWidth={1} />
        <text x={MG.l + pw / 2} y={baseline + 14} fill={C.dim} fontSize={10}
          textAnchor="middle">Sampling distribution of x-bar under H0</text>
      </svg>
    </div>
    <div style={S.results}>
      <RI label="Std Error" value={se.toFixed(3)} color={C.cyan} />
      <RI label="z-stat" value={z.toFixed(3)} color={Math.abs(z) > 1.96 ? C.red : C.green} />
      <RI label="Decision" value={Math.abs(z) > 1.96 ? 'Reject H0' : 'Fail to Reject'}
        color={Math.abs(z) > 1.96 ? C.red : C.green} />
    </div>
    <div style={S.controls}>
      <CG label="x-bar" min={mu0 - 20} max={mu0 + 20} step={0.5} value={xBar} set={setXBar} />
      <CG label="mu0" min={50} max={150} step={1} value={mu0} set={setMu0} />
      <CG label="sigma" min={1} max={30} step={0.5} value={sigma} set={setSigma} />
      <CG label="n" min={5} max={200} step={1} value={n2} set={setN2} />
    </div>
    <div style={S.note}>
      <span style={S.noteT}>Common Mistake</span>
      <p style={S.noteP}>
        Dividing by n instead of sqrt(n). The standard error is sigma/sqrt(n), not sigma/n.
        Using the wrong denominator drastically changes the test statistic.
      </p>
    </div>
  </>);
}

/* ═══════════════════════════════════════════════════════════════════
   Tab 3 — P-Value
   ═══════════════════════════════════════════════════════════════════ */
function Tab3({ zStat, setZStat, twoTail, setTwoTail }) {
  const xMin = -4, xMax = 4, yMax = norm(0, 0, 1) * 1.15;
  const baseline = MG.t + ph;
  const fullSVG = toSVG(curvePath(0, 1, xMin, xMax, 200), xMin, xMax, yMax);
  const rightSVG = toSVG(curvePath(0, 1, Math.abs(zStat), xMax, 80), xMin, xMax, yMax);
  const leftSVG = toSVG(curvePath(0, 1, xMin, -Math.abs(zStat), 80), xMin, xMax, yMax);
  const pRight = 1 - normCDF(Math.abs(zStat));
  const pVal = twoTail ? 2 * pRight : (zStat > 0 ? pRight : normCDF(zStat));

  const zLineX = MG.l + (Math.abs(zStat) - xMin) / (xMax - xMin) * pw;
  const zLineXL = MG.l + (-Math.abs(zStat) - xMin) / (xMax - xMin) * pw;

  return (<>
    <h3 style={S.title}>Understanding the P-Value</h3>
    <p style={S.sub}>
      Shaded area = probability of data this extreme IF H0 is true.
      This is the p-value, not the probability H0 is true.
    </p>
    <span style={S.eq}>
      p-value = {pVal.toFixed(4)} ({twoTail ? 'two' : 'one'}-tailed)
      {' '}{pVal < 0.01 ? '< 0.01 -- Strong evidence against H0'
        : pVal < 0.05 ? '< 0.05 -- Reject H0 at 5% level'
        : '>= 0.05 -- Fail to reject H0'}
    </span>
    <div style={S.svgWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
        <path d={pathD(fullSVG)} fill="none" stroke={C.accent} strokeWidth={2} />
        <path d={areaD(rightSVG, baseline)} fill="rgba(239,68,68,0.35)" />
        {twoTail && <path d={areaD(leftSVG, baseline)} fill="rgba(239,68,68,0.35)" />}
        {zLineX >= MG.l && zLineX <= MG.l + pw &&
          <line x1={zLineX} y1={MG.t} x2={zLineX} y2={baseline}
            stroke={C.red} strokeWidth={1} strokeDasharray="3,3" />}
        {twoTail && zLineXL >= MG.l && zLineXL <= MG.l + pw &&
          <line x1={zLineXL} y1={MG.t} x2={zLineXL} y2={baseline}
            stroke={C.red} strokeWidth={1} strokeDasharray="3,3" />}
        {/* Critical value markers at 1.96 */}
        {[-1.96, 1.96].map(cv => {
          const cx = MG.l + (cv - xMin) / (xMax - xMin) * pw;
          return <text key={cv} x={cx} y={baseline - 4} fill={C.faint} fontSize={8}
            textAnchor="middle">{cv}</text>;
        })}
        <Axis xMin={xMin} xMax={xMax} ticks={[-3, -2, -1, 0, 1, 2, 3]} labelText="z" />
      </svg>
    </div>
    <div style={S.controls}>
      <CG label="Test statistic z" min={-3.5} max={3.5} step={0.05} value={zStat} set={setZStat} />
      <button style={S.btn(twoTail ? C.accent : C.surfaceAlt)}
        onClick={() => setTwoTail(t => !t)}>
        {twoTail ? 'Two-tailed' : 'One-tailed'}
      </button>
    </div>
    <div style={S.note}>
      <span style={S.noteT}>Common Mistake</span>
      <p style={S.noteP}>
        The p-value is NOT the probability that H0 is true. It is P(data this
        extreme | H0 true). Confusing these leads to overconfident conclusions.
      </p>
    </div>
  </>);
}

/* ═══════════════════════════════════════════════════════════════════
   Tab 4 — Type I / Type II Errors and Power
   ═══════════════════════════════════════════════════════════════════ */
function Tab4({ effectSize, setEffectSize, n4, setN4, alpha, setAlpha }) {
  const mu0 = 0, mu1 = effectSize, sig = 1;
  const se = sig / Math.sqrt(n4);
  const zCrit = normInv(1 - alpha);
  const xCrit = mu0 + zCrit * se;
  const beta = normCDF((xCrit - mu1) / se);
  const power = 1 - beta;
  const xMin = Math.min(mu0, mu1) - 4 * se;
  const xMax = Math.max(mu0, mu1) + 4 * se;
  const yMax = norm(mu0, mu0, se) * 1.15;
  const baseline = MG.t + ph;
  const nullPts = toSVG(curvePath(mu0, se, xMin, xMax), xMin, xMax, yMax);
  const altPts = toSVG(curvePath(mu1, se, xMin, xMax), xMin, xMax, yMax);
  const alphaRegion = toSVG(curvePath(mu0, se, xCrit, xMax, 60), xMin, xMax, yMax);
  const betaRegion = toSVG(curvePath(mu1, se, xMin, xCrit, 80), xMin, xMax, yMax);
  const critX = MG.l + ((xCrit - xMin) / (xMax - xMin)) * pw;

  const powerCurve = useMemo(() => {
    const pts=[]; for(let nn=5;nn<=200;nn+=5){const se2=sig/Math.sqrt(nn),zc=normInv(1-alpha),xc=mu0+zc*se2;pts.push([nn,1-normCDF((xc-mu1)/se2)]);}return pts;
  }, [effectSize, alpha]);

  const pcW = 160, pcH = 60;

  return (<>
    <h3 style={S.title}>Type I / Type II Errors and Power</h3>
    <p style={S.sub}>
      Red = alpha (false positive). Amber = beta (false negative). Power = 1 - beta = {power.toFixed(3)}.
    </p>
    <div style={S.svgWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W }}>
        <path d={areaD(alphaRegion, baseline)} fill="rgba(239,68,68,0.3)" />
        <path d={areaD(betaRegion, baseline)} fill="rgba(245,158,11,0.22)" />
        <path d={pathD(nullPts)} fill="none" stroke={C.accent} strokeWidth={2} />
        <path d={pathD(altPts)} fill="none" stroke={C.green} strokeWidth={2} />
        {critX >= MG.l && critX <= MG.l + pw && <>
          <line x1={critX} y1={MG.t} x2={critX} y2={baseline}
            stroke={C.dim} strokeWidth={1.5} strokeDasharray="4,3" />
          <text x={critX} y={MG.t - 4} fill={C.dim} fontSize={9} textAnchor="middle">
            critical value
          </text>
        </>}
        <line x1={MG.l} y1={baseline} x2={MG.l + pw} y2={baseline}
          stroke={C.faint} strokeWidth={1} />
        {/* Legend */}
        <rect x={W - 135} y={6} width={10} height={10} rx={2} fill={C.red} opacity={0.5} />
        <text x={W - 121} y={15} fill={C.muted} fontSize={10}>alpha (Type I)</text>
        <rect x={W - 135} y={22} width={10} height={10} rx={2} fill={C.amber} opacity={0.5} />
        <text x={W - 121} y={31} fill={C.muted} fontSize={10}>beta (Type II)</text>
        <rect x={W - 135} y={38} width={10} height={10} rx={2} fill={C.green} opacity={0.5} />
        <text x={W - 121} y={47} fill={C.muted} fontSize={10}>H1 distribution</text>
        {/* Mini power curve inset */}
        <rect x={MG.l + 2} y={MG.t} width={pcW + 8} height={pcH + 16}
          rx={6} fill={C.surfaceAlt} stroke={C.borderLight} strokeWidth={1} opacity={0.9} />
        <text x={MG.l + 6} y={MG.t + 11} fill={C.dim} fontSize={8}>Power vs n</text>
        {powerCurve.map(([nn, p], i) => {
          const px = MG.l + 6 + (nn / 200) * pcW;
          const py = MG.t + 14 + (1 - p) * pcH;
          return i === 0 ? null :
            <line key={nn} x1={MG.l + 6 + (powerCurve[i-1][0] / 200) * pcW}
              y1={MG.t + 14 + (1 - powerCurve[i-1][1]) * pcH}
              x2={px} y2={py} stroke={C.green} strokeWidth={1.5} />;
        })}
        {/* 0.8 power line */}
        <line x1={MG.l + 6} y1={MG.t + 14 + 0.2 * pcH}
          x2={MG.l + 6 + pcW} y2={MG.t + 14 + 0.2 * pcH}
          stroke={C.faint} strokeWidth={0.5} strokeDasharray="2,2" />
        <text x={MG.l + 8 + pcW} y={MG.t + 14 + 0.2 * pcH + 3}
          fill={C.faint} fontSize={7}>0.8</text>
      </svg>
    </div>
    <div style={S.results}>
      <RI label="Alpha" value={alpha.toFixed(2)} color={C.red} />
      <RI label="Beta" value={beta.toFixed(3)} color={C.amber} />
      <RI label="Power" value={power.toFixed(3)} color={C.green} />
      <RI label="Effect" value={effectSize.toFixed(2)} color={C.cyan} />
    </div>
    <div style={S.controls}>
      <CG label="Effect size" min={0.1} max={3} step={0.05} value={effectSize} set={setEffectSize} />
      <CG label="n" min={5} max={200} step={1} value={n4} set={setN4} />
      <CG label="alpha" min={0.01} max={0.1} step={0.01} value={alpha} set={setAlpha} />
    </div>
    <div style={S.note}>
      <span style={S.noteT}>Common Mistake</span>
      <p style={S.noteP}>
        Focusing only on alpha while ignoring power. A study with alpha = 0.05 but
        power = 0.2 will miss 80% of real effects. Aim for power of at least 0.8 by
        choosing an adequate sample size.
      </p>
    </div>
  </>);
}

/* ═══════════════════════════════════════════════════════════════════
   Tab 5 — Multiple Testing and P-Hacking
   ═══════════════════════════════════════════════════════════════════ */
function Tab5() {
  const [results, setResults] = useState(null);
  const [bonferroni, setBonferroni] = useState(false);
  const [history, setHistory] = useState([]);

  const runTests = useCallback(() => {
    const k=20,tests=[]; for(let i=0;i<k;i++){let s=0;for(let j=0;j<30;j++)s+=(Math.random()-0.5);
      const z=s/Math.sqrt(30/12),p=2*(1-normCDF(Math.abs(z))),thresh=bonferroni?0.05/k:0.05;
      tests.push({id:i+1,z:z.toFixed(2),p:p.toFixed(4),sig:p<thresh});}
    setResults(tests); setHistory(h=>[...h.slice(-9),tests.filter(t=>t.sig).length]);
  }, [bonferroni]);

  const sigCount = results ? results.filter(t => t.sig).length : 0;
  const gridStyle = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(90px,1fr))', gap: 6
  };
  const cellStyle = s => ({
    padding: '6px 8px', borderRadius: 6,
    background: s ? 'rgba(239,68,68,0.18)' : C.surfaceAlt,
    border: `1px solid ${s ? C.red : C.borderLight}`,
    textAlign: 'center', fontSize: 11
  });

  return (<>
    <h3 style={S.title}>Multiple Testing and P-Hacking</h3>
    <p style={S.sub}>
      All 20 tests have H0 true. At alpha = 0.05, expect ~1 false positive per batch.
      {history.length > 0 && ` Across ${history.length} batches: avg ${(history.reduce((a, b) => a + b, 0) / history.length).toFixed(1)} false positives.`}
    </p>
    <div style={S.controls}>
      <button style={S.btn(C.accent)} onClick={runTests}>Run 20 Tests</button>
      <button style={S.btn(bonferroni ? C.green : C.surfaceAlt)}
        onClick={() => setBonferroni(b => !b)}>
        Bonferroni: {bonferroni ? 'ON' : 'OFF'}
      </button>
      {results && <span style={{ fontSize: 12, color: sigCount > 0 ? C.red : C.green, fontWeight: 600 }}>
        {sigCount} of 20 "significant"
        {bonferroni ? ` (threshold = ${(0.05 / 20).toFixed(4)})` : ''}
      </span>}
    </div>
    {results && <div style={{ ...S.section, padding: '12px 22px', flex: 'none' }}>
      <div style={gridStyle}>
        {results.map(t => (
          <div key={t.id} style={cellStyle(t.sig)}>
            <div style={{ fontWeight: 600, color: t.sig ? C.red : C.dim }}>Test {t.id}</div>
            <div style={{ fontFamily: 'monospace', color: t.sig ? C.red : C.muted, fontSize: 10 }}>
              p = {t.p}
            </div>
          </div>
        ))}
      </div>
    </div>}
    {history.length > 1 && <div style={S.results}>
      <RI label="Batches Run" value={history.length} color={C.cyan} />
      <RI label="Avg False Pos" value={(history.reduce((a, b) => a + b, 0) / history.length).toFixed(2)}
        color={C.amber} />
      <RI label="Expected" value="1.00" color={C.dim} />
    </div>}
    <span style={S.eq}>
      Bonferroni correction: reject if p &lt; alpha / k = 0.05 / 20 = 0.0025
    </span>
    <div style={S.note}>
      <span style={S.noteT}>Common Mistake</span>
      <p style={S.noteP}>
        Cherry-picking the one significant result from 20 tests and reporting it
        as a discovery. Without adjusting for multiple comparisons (e.g., Bonferroni),
        you will find "significant" results purely by chance about 5% of the time per test.
      </p>
    </div>
  </>);
}

/* ═══════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════ */
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
        {TABS.map((t, i) => (
          <button key={t.id} style={S.topicTab(i === tab)} onClick={() => setTab(i)}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={S.body}>
        <div style={S.section}>
          {tab === 0 && <Tab1 trueP={trueP} setTrueP={setTrueP} />}
          {tab === 1 && <Tab2 xBar={xBar} setXBar={setXBar} mu0={mu0} setMu0={setMu0}
            sigma={sigma} setSigma={setSigma} n2={n2} setN2={setN2} />}
          {tab === 2 && <Tab3 zStat={zStat} setZStat={setZStat}
            twoTail={twoTail} setTwoTail={setTwoTail} />}
          {tab === 3 && <Tab4 effectSize={effectSize} setEffectSize={setEffectSize}
            n4={n4} setN4={setN4} alpha={alpha} setAlpha={setAlpha} />}
          {tab === 4 && <Tab5 />}
        </div>
      </div>
    </div>
  );
}
