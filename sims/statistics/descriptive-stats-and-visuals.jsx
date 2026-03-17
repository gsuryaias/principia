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
  mistake:{ padding:'12px 16px', background:'rgba(239,68,68,0.08)', borderLeft:`3px solid ${C.red}`, borderRadius:'0 10px 10px 0', margin:'6px 0' },
};
const btn = (label, onClick, active) => React.createElement('button', { onClick, style:{ padding:'6px 14px', borderRadius:8, border:`1px solid ${active?C.accent:C.borderLight}`, background:active?C.accent:C.surfaceAlt, color:active?'#fff':C.muted, fontSize:12, fontWeight:600, cursor:'pointer' } }, label);
const Lbl = ({ children }) => React.createElement('span', { style:{ fontSize:11.5, color:C.dim, fontWeight:600 } }, children);
const mean = a => a.reduce((s,v)=>s+v,0)/a.length;
const median = a => { const s=[...a].sort((x,y)=>x-y); const m=Math.floor(s.length/2); return s.length%2?s[m]:(s[m-1]+s[m])/2; };
const mode = a => { const f={}; a.forEach(v=>f[v]=(f[v]||0)+1); const mx=Math.max(...Object.values(f)); return Object.keys(f).filter(k=>f[k]===mx).map(Number); };
const variance = a => { const m=mean(a); return a.reduce((s,v)=>s+(v-m)**2,0)/a.length; };
const quantile = (a,q) => { const s=[...a].sort((x,y)=>x-y); const p=(s.length-1)*q; const b=Math.floor(p); return b===s.length-1?s[b]:s[b]+(p-b)*(s[b+1]-s[b]); };

const TABS = ['Mean / Median / Mode','Spread + Robustness','Percentiles + Boxplots','Histograms + Shape','Categorical Summaries'];

function Tab1() {
  const base = [250,265,270,280,285,290,295,300,310,315];
  const [outliers, setOutliers] = useState([]);
  const data = useMemo(() => [...base, ...outliers], [outliers]);
  const m = mean(data), md = median(data), mo = mode(data);
  const skewed = Math.abs(m - md) > 15;
  const ticks = [200, 400, 600, 800, 1000, 1200];
  const xPos = v => 20 + ((v - 200) / 900) * 480;
  return React.createElement(React.Fragment, null,
    React.createElement('p', { style:S.title }, 'House Prices ($K) in a Neighborhood'),
    React.createElement('p', { style:S.sub }, 'Add expensive mansions (outliers) and watch how the mean shifts dramatically while the median stays stable. This is the key idea behind "robust" statistics.'),
    React.createElement('div', { style:S.svgWrap },
      React.createElement('svg', { viewBox:'0 0 520 130', style:{ width:'100%', maxWidth:520 } },
        // axis line
        React.createElement('line', { x1:20, y1:75, x2:500, y2:75, stroke:C.border, strokeWidth:1 }),
        // tick marks
        ticks.map(t => React.createElement(React.Fragment, { key:'t'+t },
          React.createElement('line', { x1:xPos(t), y1:73, x2:xPos(t), y2:77, stroke:C.faint, strokeWidth:1 }),
          React.createElement('text', { x:xPos(t), y:88, fill:C.faint, fontSize:8, textAnchor:'middle' }, `$${t}K`)
        )),
        // data points
        data.map((v,i) => {
          const x = xPos(v);
          return React.createElement('circle', { key:i, cx:x, cy:55, r:6, fill:outliers.includes(v)?C.orange:C.accent, opacity:0.85 });
        }),
        // mean line
        React.createElement('line', { x1:xPos(m), y1:25, x2:xPos(m), y2:70, stroke:C.pink, strokeWidth:2, strokeDasharray:'4 3' }),
        React.createElement('text', { x:xPos(m), y:18, fill:C.pink, fontSize:10, textAnchor:'middle' }, `Mean: $${m.toFixed(0)}K`),
        // median line
        React.createElement('line', { x1:xPos(md), y1:25, x2:xPos(md), y2:70, stroke:C.green, strokeWidth:2 }),
        React.createElement('text', { x:xPos(md), y:100, fill:C.green, fontSize:10, textAnchor:'middle' }, `Median: $${md.toFixed(0)}K`)
      )
    ),
    React.createElement('div', { style:S.controls },
      btn('Add $850K Mansion', () => setOutliers(p=>[...p, 850])),
      btn('Add $1.2M Estate', () => setOutliers(p=>[...p, 1200])),
      btn('Add $500K Home', () => setOutliers(p=>[...p, 500])),
      btn('Reset', () => setOutliers([])),
      React.createElement(Lbl, null, `Mode: ${mo.join(', ')}K  |  n = ${data.length}  |  Diff: $${Math.abs(m-md).toFixed(0)}K`)
    ),
    React.createElement('div', { style:S.eq }, 'Mean = Sum(x_i) / n    |    Median = middle value when sorted'),
    skewed && React.createElement('div', { style:S.note },
      React.createElement('span', { style:S.noteT }, 'Insight'),
      React.createElement('p', { style:S.noteP }, 'The mean is pulled toward outliers. When data is skewed, the median better represents a "typical" value.')
    ),
    React.createElement('div', { style:S.mistake },
      React.createElement('span', { style:{...S.noteT, color:C.red} }, 'Common Mistake'),
      React.createElement('p', { style:S.noteP }, 'Always using the mean without checking for skew. Real estate agents often quote median home prices precisely because a few mansions would inflate the mean.')
    )
  );
}

function Tab2() {
  const base = [60,62,65,67,68,70,72,74,76,78];
  const [outlierCount, setOutlierCount] = useState(0);
  const data = useMemo(() => [...base, ...Array(outlierCount).fill(150)], [outlierCount]);
  const sd = Math.sqrt(variance(data)), q1 = quantile(data, 0.25), q3 = quantile(data, 0.75), iqr = q3 - q1;
  const baseSD = Math.sqrt(variance(base)), baseIQR = quantile(base,0.75) - quantile(base,0.25);
  const sdChange = outlierCount > 0 ? ((sd / baseSD - 1)*100).toFixed(0) : 0;
  const iqrChange = outlierCount > 0 ? ((iqr / baseIQR - 1)*100).toFixed(0) : 0;
  const W = 460, H = 160, barW = W / 2 - 30;
  const sdH = Math.min((sd / 40) * 100, 130), iqrH = Math.min((iqr / 40) * 100, 130);
  return React.createElement(React.Fragment, null,
    React.createElement('p', { style:S.title }, 'SD vs IQR: Robustness to Outliers'),
    React.createElement('p', { style:S.sub }, 'Add outlier exam scores of 150 and compare how Standard Deviation explodes while IQR barely moves.'),
    React.createElement('div', { style:S.svgWrap },
      React.createElement('svg', { viewBox:`0 0 ${W} ${H}`, style:{ width:'100%', maxWidth:W } },
        React.createElement('rect', { x:40, y:H - sdH - 10, width:barW - 20, height:sdH, fill:C.pink, rx:6, opacity:0.8 }),
        React.createElement('text', { x:40 + (barW-20)/2, y:H - sdH - 16, fill:C.pink, fontSize:12, textAnchor:'middle', fontWeight:700 }, `SD: ${sd.toFixed(1)}`),
        React.createElement('text', { x:40 + (barW-20)/2, y:H - 2, fill:C.dim, fontSize:10, textAnchor:'middle' }, 'Std Dev'),
        React.createElement('rect', { x:W/2 + 20, y:H - iqrH - 10, width:barW - 20, height:iqrH, fill:C.teal, rx:6, opacity:0.8 }),
        React.createElement('text', { x:W/2 + 20 + (barW-20)/2, y:H - iqrH - 16, fill:C.teal, fontSize:12, textAnchor:'middle', fontWeight:700 }, `IQR: ${iqr.toFixed(1)}`),
        React.createElement('text', { x:W/2 + 20 + (barW-20)/2, y:H - 2, fill:C.dim, fontSize:10, textAnchor:'middle' }, 'IQR')
      )
    ),
    React.createElement('div', { style:S.controls },
      React.createElement(Lbl, null, `Outliers (score=150): ${outlierCount}`),
      React.createElement('input', { type:'range', min:0, max:5, value:outlierCount, onChange:e=>setOutlierCount(+e.target.value), style:{ accentColor:C.accent } }),
      React.createElement(Lbl, null, `Var: ${variance(data).toFixed(1)}  |  n = ${data.length}`),
      outlierCount > 0 && React.createElement(Lbl, null, `SD changed ${sdChange}%  |  IQR changed ${iqrChange}%`)
    ),
    React.createElement('div', { style:S.eq }, 'Var = Sum((x_i - mean)^2) / n    |    SD = sqrt(Var)    |    IQR = Q3 - Q1'),
    React.createElement('div', { style:S.note },
      React.createElement('span', { style:S.noteT }, 'Insight'),
      React.createElement('p', { style:S.noteP }, 'In salary data or medical studies, IQR is preferred when outliers are expected. SD is ideal for symmetric, bell-shaped distributions.')
    ),
    React.createElement('div', { style:S.mistake },
      React.createElement('span', { style:{...S.noteT, color:C.red} }, 'Common Mistake'),
      React.createElement('p', { style:S.noteP }, 'Reporting SD alone without context of the distribution shape. A SD of 20 means very different things for a normal distribution vs. a heavily skewed one.')
    )
  );
}

function Tab3() {
  const init = [55,60,62,65,68,70,72,75,78,80,82,85,88,90,92,95,98];
  const [scores, setScores] = useState(init);
  const [dragIdx, setDragIdx] = useState(null);
  const svgRef = useRef(null);
  const sorted = useMemo(() => [...scores].sort((a,b)=>a-b), [scores]);
  const q1 = quantile(sorted,0.25), q2 = median(sorted), q3 = quantile(sorted,0.75);
  const iqr = q3 - q1, lo = q1 - 1.5*iqr, hi = q3 + 1.5*iqr;
  const wLo = sorted.find(v=>v>=lo)||sorted[0], wHi = [...sorted].reverse().find(v=>v<=hi)||sorted[sorted.length-1];
  const outliers = sorted.filter(v=>v<lo||v>hi);
  const W = 500, H = 160, pad = 40, mn = Math.min(...scores)-5, mx = Math.max(...scores)+5;
  const x = v => pad + ((v - mn)/(mx - mn))*(W - 2*pad);

  const handlePointerDown = useCallback((e, i) => { e.preventDefault(); setDragIdx(i); }, []);
  const handlePointerMove = useCallback(e => {
    if (dragIdx === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width * W;
    const val = Math.round(mn + ((px - pad) / (W - 2*pad)) * (mx - mn));
    setScores(p => { const n=[...p]; n[dragIdx]=Math.max(0,Math.min(100,val)); return n; });
  }, [dragIdx, mn, mx]);
  const handlePointerUp = useCallback(() => setDragIdx(null), []);

  return React.createElement(React.Fragment, null,
    React.createElement('p', { style:S.title }, 'Test Scores: Interactive Boxplot'),
    React.createElement('p', { style:S.sub }, 'Drag the dots to reshape the boxplot. Observe quartiles, whiskers, and outlier detection.'),
    React.createElement('div', { style:S.svgWrap },
      React.createElement('svg', { ref:svgRef, viewBox:`0 0 ${W} ${H}`, style:{ width:'100%', maxWidth:W, touchAction:'none' }, onPointerMove:handlePointerMove, onPointerUp:handlePointerUp, onPointerLeave:handlePointerUp },
        React.createElement('line', { x1:x(wLo), y1:60, x2:x(q1), y2:60, stroke:C.dim, strokeWidth:2 }),
        React.createElement('line', { x1:x(q3), y1:60, x2:x(wHi), y2:60, stroke:C.dim, strokeWidth:2 }),
        React.createElement('line', { x1:x(wLo), y1:48, x2:x(wLo), y2:72, stroke:C.dim, strokeWidth:2 }),
        React.createElement('line', { x1:x(wHi), y1:48, x2:x(wHi), y2:72, stroke:C.dim, strokeWidth:2 }),
        React.createElement('rect', { x:x(q1), y:40, width:x(q3)-x(q1), height:40, fill:C.accentGlow, stroke:C.accent, strokeWidth:1.5, rx:4 }),
        React.createElement('line', { x1:x(q2), y1:40, x2:x(q2), y2:80, stroke:C.amber, strokeWidth:2 }),
        outliers.map((v,i) => React.createElement('circle', { key:'o'+i, cx:x(v), cy:60, r:5, fill:'none', stroke:C.red, strokeWidth:2 })),
        scores.map((v,i) => React.createElement('circle', { key:i, cx:x(v), cy:100, r:5, fill:dragIdx===i?C.accentLight:C.accent, opacity:0.7, cursor:'ew-resize', onPointerDown:e=>handlePointerDown(e,i) })),
        React.createElement('text', { x:x(q1), y:32, fill:C.muted, fontSize:9, textAnchor:'middle' }, `Q1:${q1.toFixed(0)}`),
        React.createElement('text', { x:x(q2), y:32, fill:C.amber, fontSize:9, textAnchor:'middle' }, `Med:${q2.toFixed(0)}`),
        React.createElement('text', { x:x(q3), y:32, fill:C.muted, fontSize:9, textAnchor:'middle' }, `Q3:${q3.toFixed(0)}`)
      )
    ),
    React.createElement('div', { style:S.controls },
      React.createElement(Lbl, null, `IQR: ${iqr.toFixed(1)}  |  Outliers: ${outliers.length}  |  Whiskers: [${wLo}, ${wHi}]`),
      btn('Reset', () => setScores(init))
    ),
    React.createElement('div', { style:S.eq }, 'Q1 = 25th percentile  |  Q3 = 75th  |  IQR = Q3-Q1  |  Outlier if x < Q1-1.5*IQR or x > Q3+1.5*IQR'),
    React.createElement('div', { style:S.note },
      React.createElement('span', { style:S.noteT }, 'Insight'),
      React.createElement('p', { style:S.noteP }, 'Boxplots compactly show spread and skew. In standardized testing, they reveal score distribution at a glance.')
    ),
    React.createElement('div', { style:S.mistake },
      React.createElement('span', { style:{...S.noteT, color:C.red} }, 'Common Mistake'),
      React.createElement('p', { style:S.noteP }, 'Assuming a boxplot implies a symmetric distribution. A boxplot with equal-length whiskers can still hide multimodality or gaps in the data.')
    )
  );
}

function Tab4() {
  const [dist, setDist] = useState('normal');
  const [bins, setBins] = useState(10);
  const data = useMemo(() => {
    const rng = (seed=42) => { let s=seed; return()=>{s=(s*16807)%2147483647; return s/2147483647;}; };
    const r = rng(7);
    const normal = () => { let u=0,v=0; while(!u) u=r(); v=r(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
    if (dist==='normal') return Array.from({length:200}, ()=> 50 + normal()*15);
    if (dist==='uniform') return Array.from({length:200}, ()=> r()*100);
    return Array.from({length:200}, ()=> Math.min(100, Math.max(0, 20 + Math.abs(normal()*25)))); // right skewed
  }, [dist]);
  const mn = 0, mx = 100, bw = (mx-mn)/bins;
  const counts = useMemo(() => { const c=Array(bins).fill(0); data.forEach(v=>{ const i=Math.min(Math.floor((v-mn)/bw), bins-1); if(i>=0) c[i]++; }); return c; }, [data, bins, bw]);
  const maxC = Math.max(...counts);
  const m = mean(data), md = median(data);
  const skew = m > md + 2 ? 'Right-skewed' : m < md - 2 ? 'Left-skewed' : 'Roughly symmetric';
  const W = 500, H = 200, pad = 40;
  const axisTicks = [0, 20, 40, 60, 80, 100];
  return React.createElement(React.Fragment, null,
    React.createElement('p', { style:S.title }, 'Histogram Shape and Bin Width'),
    React.createElement('p', { style:S.sub }, 'Change the distribution and number of bins to see how histogram appearance changes. Notice how the same data looks different with different bin counts.'),
    React.createElement('div', { style:S.svgWrap },
      React.createElement('svg', { viewBox:`0 0 ${W} ${H}`, style:{ width:'100%', maxWidth:W } },
        // bars
        counts.map((c,i) => { const bx=pad+i*(W-2*pad)/bins; const bh=(c/maxC)*(H-60); return React.createElement('rect', { key:i, x:bx, y:H-20-bh, width:(W-2*pad)/bins-1, height:bh, fill:C.accent, rx:2, opacity:0.8 }); }),
        // x-axis
        React.createElement('line', { x1:pad, y1:H-20, x2:W-pad, y2:H-20, stroke:C.border, strokeWidth:1 }),
        // axis tick labels
        axisTicks.map(t => {
          const tx = pad + (t / 100) * (W - 2*pad);
          return React.createElement(React.Fragment, { key:'ax'+t },
            React.createElement('line', { x1:tx, y1:H-20, x2:tx, y2:H-16, stroke:C.faint, strokeWidth:1 }),
            React.createElement('text', { x:tx, y:H-4, fill:C.faint, fontSize:8, textAnchor:'middle' }, t)
          );
        }),
        // mean and median markers
        React.createElement('line', { x1:pad+(m/100)*(W-2*pad), y1:H-20, x2:pad+(m/100)*(W-2*pad), y2:26, stroke:C.pink, strokeWidth:1.5, strokeDasharray:'3 2' }),
        React.createElement('line', { x1:pad+(md/100)*(W-2*pad), y1:H-20, x2:pad+(md/100)*(W-2*pad), y2:26, stroke:C.green, strokeWidth:1.5 }),
        // header
        React.createElement('text', { x:W/2, y:14, fill:C.muted, fontSize:11, textAnchor:'middle', fontWeight:600 }, `${skew}  |  Mean: ${m.toFixed(1)}  Median: ${md.toFixed(1)}`),
        // legend
        React.createElement('circle', { cx:W-100, cy:30, r:4, fill:C.pink }),
        React.createElement('text', { x:W-92, y:34, fill:C.pink, fontSize:9 }, 'Mean'),
        React.createElement('circle', { cx:W-60, cy:30, r:4, fill:C.green }),
        React.createElement('text', { x:W-52, y:34, fill:C.green, fontSize:9 }, 'Median')
      )
    ),
    React.createElement('div', { style:S.controls },
      btn('Normal', ()=>setDist('normal'), dist==='normal'),
      btn('Uniform', ()=>setDist('uniform'), dist==='uniform'),
      btn('Skewed', ()=>setDist('skewed'), dist==='skewed'),
      React.createElement(Lbl, null, `Bins: ${bins}`),
      React.createElement('input', { type:'range', min:3, max:30, value:bins, onChange:e=>setBins(+e.target.value), style:{ accentColor:C.accent } })
    ),
    React.createElement('div', { style:S.eq }, 'Bin width = (max - min) / num_bins    |    Skewness: mean vs median comparison'),
    React.createElement('div', { style:S.note },
      React.createElement('span', { style:S.noteT }, 'Insight'),
      React.createElement('p', { style:S.noteP }, 'In medical research, histogram shape determines which statistical tests are valid. Always visualize before computing.')
    ),
    React.createElement('div', { style:S.mistake },
      React.createElement('span', { style:{...S.noteT, color:C.red} }, 'Common Mistake'),
      React.createElement('p', { style:S.noteP }, 'Using too few bins hides distribution shape; too many creates noise. A good rule of thumb: start with sqrt(n) bins and adjust.')
    )
  );
}

function Tab5() {
  const [cats, setCats] = useState([{label:'Strongly Agree',count:35,color:C.accent},{label:'Agree',count:45,color:C.teal},{label:'Neutral',count:25,color:C.amber},{label:'Disagree',count:15,color:C.orange},{label:'Strongly Disagree',count:10,color:C.red}]);
  const total = cats.reduce((s,c)=>s+c.count,0);
  const modeLabel = cats.reduce((a,b)=>a.count>b.count?a:b).label;
  const W = 500, H = 170, barH = 22, gap = 6, pad = 130;
  const maxC = Math.max(...cats.map(c=>c.count));
  const upd = (i, delta) => setCats(p => p.map((c,j) => j===i?{...c, count:Math.max(0,c.count+delta)}:c));

  let angle = 0;
  const slices = cats.map(c => { const a = (c.count/total)*360; const start=angle; angle+=a; return {...c, start, angle:a}; });
  const arc = (cx,cy,r,s,e) => { const sr=s*Math.PI/180, er=e*Math.PI/180; const x1=cx+r*Math.cos(sr), y1=cy+r*Math.sin(sr), x2=cx+r*Math.cos(er), y2=cy+r*Math.sin(er); const lg=e-s>180?1:0; return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${lg} 1 ${x2},${y2} Z`; };

  return React.createElement(React.Fragment, null,
    React.createElement('p', { style:S.title }, 'Survey Response Summary'),
    React.createElement('p', { style:S.sub }, 'Adjust category counts and compare bar chart vs pie chart. The frequency table updates live.'),
    React.createElement('div', { style:{ display:'flex', flexWrap:'wrap', gap:20, justifyContent:'center', padding:'8px 0' } },
      React.createElement('svg', { viewBox:`0 0 ${W} ${H}`, style:{ width:'100%', maxWidth:320 } },
        cats.map((c,i) => {
          const y = 10 + i*(barH+gap);
          const bw = maxC?((c.count/maxC)*(W-pad-20)):0;
          return React.createElement(React.Fragment, { key:i },
            React.createElement('text', { x:pad-6, y:y+barH/2+4, fill:C.muted, fontSize:10, textAnchor:'end' }, c.label),
            React.createElement('rect', { x:pad, y, width:bw, height:barH, fill:c.color, rx:4, opacity:0.85 }),
            React.createElement('text', { x:pad+bw+6, y:y+barH/2+4, fill:C.dim, fontSize:10 }, c.count)
          );
        })
      ),
      React.createElement('svg', { viewBox:'0 0 160 160', style:{ width:140, height:140 } },
        slices.map((s,i) => s.angle>0 ? React.createElement('path', { key:i, d:arc(80,80,70,s.start,s.start+s.angle-0.5), fill:s.color, opacity:0.85 }) : null)
      )
    ),
    React.createElement('div', { style:S.controls },
      cats.map((c,i) => React.createElement('span', { key:i, style:{ display:'inline-flex', alignItems:'center', gap:4 } },
        React.createElement('span', { style:{ width:8,height:8,borderRadius:4,background:c.color,display:'inline-block' } }),
        React.createElement(Lbl, null, c.label.slice(0,8)),
        btn('-', ()=>upd(i,-5)),
        btn('+', ()=>upd(i,5))
      ))
    ),
    React.createElement('div', { style:{ padding:'8px 22px', display:'flex', gap:16, flexWrap:'wrap' } },
      React.createElement('table', { style:{ borderCollapse:'collapse', fontSize:12, color:C.muted } },
        React.createElement('thead', null, React.createElement('tr', null,
          ['Category','Freq','Rel Freq'].map(h => React.createElement('th', { key:h, style:{ padding:'4px 12px', borderBottom:`1px solid ${C.border}`, color:C.dim, textAlign:'left' } }, h))
        )),
        React.createElement('tbody', null, cats.map((c,i) =>
          React.createElement('tr', { key:i },
            React.createElement('td', { style:{ padding:'3px 12px' } }, c.label),
            React.createElement('td', { style:{ padding:'3px 12px' } }, c.count),
            React.createElement('td', { style:{ padding:'3px 12px', color:C.mono } }, total?(c.count/total*100).toFixed(1)+'%':'0%')
          )
        ))
      )
    ),
    React.createElement('div', { style:S.eq }, `Mode: "${modeLabel}"  |  Total responses: ${total}  |  Relative freq = count / total`),
    React.createElement('div', { style:S.note },
      React.createElement('span', { style:S.noteT }, 'Insight'),
      React.createElement('p', { style:S.noteP }, 'Customer satisfaction surveys use mode and relative frequencies. Pie charts work for a few categories; bar charts scale better.')
    ),
    React.createElement('div', { style:S.mistake },
      React.createElement('span', { style:{...S.noteT, color:C.red} }, 'Common Mistake'),
      React.createElement('p', { style:S.noteP }, 'Computing a mean of categorical data (e.g., "average gender"). Categorical data only supports mode and frequency counts, not arithmetic operations.')
    )
  );
}

const PANELS = [Tab1, Tab2, Tab3, Tab4, Tab5];

export default function DescriptiveStatsAndVisuals() {
  const [tab, setTab] = useState(0);
  const Panel = PANELS[tab];
  return React.createElement('div', { style:S.container },
    React.createElement('div', { style:S.modeBar },
      TABS.map((t,i) => React.createElement('button', { key:i, onClick:()=>setTab(i), style:S.modeTab(tab===i) }, t))
    ),
    React.createElement('div', { style:S.body },
      React.createElement('div', { style:S.section },
        React.createElement(Panel, null)
      )
    )
  );
}
