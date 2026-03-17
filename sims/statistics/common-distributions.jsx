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

const W = 460, H = 250, PAD = 44;
const slStyle = { display:'flex', alignItems:'center', gap:8, fontSize:12, color:C.muted };
const slInput = { width:110, accentColor:C.accent, cursor:'pointer' };

function Slider({ label, min, max, step, value, onChange }) {
  return (
    <label style={slStyle}>
      <span style={{ color:C.dim, minWidth:60, fontSize:11.5 }}>{label}</span>
      <input
        type="range" min={min} max={max} step={step}
        value={value} onChange={e => onChange(+e.target.value)}
        style={slInput}
      />
      <span style={{ color:C.mono, fontFamily:'monospace', minWidth:40, fontSize:12 }}>
        {value}
      </span>
    </label>
  );
}

/* ---------- math helpers ---------- */
function normalPDF(x, mu, sigma) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

function gamma(z) {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  const coeff = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  let x = coeff[0];
  for (let i = 1; i < 9; i++) x += coeff[i] / (z + i);
  const t = z + 7.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

function tPDF(x, df) {
  const c = gamma((df + 1) / 2) / (Math.sqrt(df * Math.PI) * gamma(df / 2));
  return c * Math.pow(1 + (x * x) / df, -(df + 1) / 2);
}

function poissonPMF(k, lam) {
  let lp = k * Math.log(lam) - lam;
  for (let i = 2; i <= k; i++) lp -= Math.log(i);
  return Math.exp(lp);
}

function expPDF(x, lam) {
  return x < 0 ? 0 : lam * Math.exp(-lam * x);
}

function weibullPDF(x, k, lam) {
  if (x <= 0) return 0;
  return (k / lam) * Math.pow(x / lam, k - 1) * Math.exp(-Math.pow(x / lam, k));
}

/* ---------- SVG chart component ---------- */
function Chart({ points, color, xRange, yMax, barWidth, bars, label, overlay, zones, fillUnder }) {
  const xMin = xRange[0], xMax = xRange[1];
  const sx = x => PAD + (x - xMin) / (xMax - xMin) * (W - 2 * PAD);
  const sy = y => H - PAD - (y / yMax) * (H - 2 * PAD);
  const ticks = 6;

  const pathD = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`
  ).join(' ');

  const fillD = fillUnder
    ? pathD + `L${sx(points[points.length - 1][0]).toFixed(1)},${sy(0).toFixed(1)}L${sx(points[0][0]).toFixed(1)},${sy(0).toFixed(1)}Z`
    : null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', maxWidth:W, height:'auto' }}>
      <rect width={W} height={H} fill="transparent" />

      {/* shaded zones */}
      {zones && zones.map((z, i) => (
        <rect key={i} x={sx(z[0])} y={PAD} width={sx(z[1]) - sx(z[0])}
          height={H - 2 * PAD} fill={z[2]} opacity={0.13} />
      ))}

      {/* grid */}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={C.borderLight} strokeWidth={1} />
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke={C.borderLight} strokeWidth={1} />

      {/* x-axis ticks */}
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const v = xMin + i * (xMax - xMin) / ticks;
        return (
          <text key={i} x={sx(v)} y={H - PAD + 15} fill={C.faint}
            fontSize={9} textAnchor="middle">
            {Math.abs(v) < 0.001 ? '0' : v % 1 ? v.toFixed(1) : v}
          </text>
        );
      })}

      {/* y-axis grid + labels */}
      {Array.from({ length: 4 }, (_, i) => {
        const v = (i + 1) * yMax / 4;
        return (
          <g key={i}>
            <line x1={PAD} y1={sy(v)} x2={W - PAD} y2={sy(v)} stroke={C.border} strokeWidth={0.5} />
            <text x={PAD - 5} y={sy(v) + 3} fill={C.faint} fontSize={8} textAnchor="end">
              {v < 0.01 ? v.toExponential(0) : v.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* fill area */}
      {fillD && <path d={fillD} fill={color} opacity={0.08} />}

      {/* bars or line */}
      {bars
        ? points.map((p, i) => {
            const bw = barWidth * (W - 2 * PAD) / (xMax - xMin);
            return (
              <rect key={i} x={sx(p[0]) - bw / 2} y={sy(p[1])}
                width={bw} height={Math.max(0, H - PAD - sy(p[1]))}
                fill={color} opacity={0.85} rx={2} />
            );
          })
        : <path d={pathD} fill="none" stroke={color} strokeWidth={2} />
      }

      {/* overlay line */}
      {overlay && (
        <path
          d={overlay.points.map((p, i) =>
            `${i === 0 ? 'M' : 'L'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`
          ).join(' ')}
          fill="none" stroke={overlay.color} strokeWidth={1.5} strokeDasharray="5,3"
        />
      )}

      {/* legend labels */}
      {label && (
        <text x={W - PAD} y={PAD - 8} fill={C.dim} fontSize={9} textAnchor="end">{label}</text>
      )}
      {overlay && (
        <text x={W - PAD} y={PAD + 6} fill={overlay.color} fontSize={9} textAnchor="end">
          {overlay.label}
        </text>
      )}
    </svg>
  );
}

function Note({ title, children }) {
  return (
    <div style={S.note}>
      <span style={S.noteT}>{title}</span>
      <p style={S.noteP}>{children}</p>
    </div>
  );
}

function InfoRow({ label, value, color }) {
  return (
    <span style={{ fontSize:12, color:C.dim, marginRight:16 }}>
      {label}: <span style={{ color: color || C.mono, fontFamily:'monospace' }}>{value}</span>
    </span>
  );
}

/* ============================== TAB 1: Gaussian + t ============================== */
function GaussianTab() {
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(1);
  const [df, setDf] = useState(3);
  const [showT, setShowT] = useState(true);

  const xL = mu - 4 * sigma, xR = mu + 4 * sigma;
  const step = (xR - xL) / 200;

  const pts = useMemo(() => {
    const r = [];
    for (let x = xL; x <= xR; x += step) r.push([x, normalPDF(x, mu, sigma)]);
    return r;
  }, [mu, sigma]);

  const tPts = useMemo(() => {
    const r = [];
    for (let x = xL; x <= xR; x += step) r.push([x, tPDF((x - mu) / sigma, df) / sigma]);
    return r;
  }, [mu, sigma, df]);

  const yMax = useMemo(() =>
    Math.max(0.45, ...pts.map(p => p[1]), ...(showT ? tPts.map(p => p[1]) : [])) * 1.15,
    [pts, tPts, showT]
  );

  const zones = [
    [mu - sigma, mu + sigma, C.accent],
    [mu - 2 * sigma, mu - sigma, C.teal],
    [mu + sigma, mu + 2 * sigma, C.teal],
  ];

  return (
    <>
      <div style={S.section}>
        <div>
          <p style={S.title}>Gaussian (Normal) + t-Distribution</p>
          <p style={S.sub}>
            The bell curve is everywhere: measurement errors, test scores, natural variation.
            The t-distribution handles small samples when the population std dev is unknown.
          </p>
        </div>

        <div style={S.svgWrap}>
          <Chart
            points={pts} color={C.accent} xRange={[xL, xR]} yMax={yMax}
            fillUnder
            overlay={showT ? { points: tPts, color: C.amber, label: `t (df=${df})` } : null}
            label="Normal (solid)"
            zones={zones}
          />
        </div>

        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <InfoRow label="Mean" value={mu} />
          <InfoRow label="Std Dev" value={sigma} />
          {showT && <InfoRow label="t df" value={df} color={C.amber} />}
        </div>

        <code style={S.eq}>
          68-95-99.7 rule: 68% within 1 sigma | 95% within 2 sigma | 99.7% within 3 sigma
        </code>

        <div style={S.eq}>
          <span style={{ fontSize:12, color:C.dim }}>
            Use case: measurement noise, quality control, grading curves.
            As df increases, t-distribution converges to the normal (try df=30).
          </span>
        </div>

        <Note title="Common Mistake">
          Using the normal distribution when your sample is small (n {'<'} 30) and the
          population standard deviation is unknown. The t-distribution accounts for
          extra uncertainty with heavier tails. Increase the df slider to see how
          t approaches normal as sample size grows.
        </Note>
      </div>
      <div style={S.controls}>
        <Slider label="mu" min={-3} max={3} step={0.5} value={mu} onChange={setMu} />
        <Slider label="sigma" min={0.3} max={3} step={0.1} value={sigma} onChange={setSigma} />
        <Slider label="df" min={1} max={30} step={1} value={df} onChange={setDf} />
        <label style={{ ...slStyle, cursor:'pointer' }}>
          <input type="checkbox" checked={showT} onChange={e => setShowT(e.target.checked)}
            style={{ accentColor:C.amber }} />
          <span style={{ color: showT ? C.amber : C.faint }}>Show t</span>
        </label>
      </div>
    </>
  );
}

/* ============================== TAB 2: Poisson ============================== */
function PoissonTab() {
  const [lam, setLam] = useState(4);

  const kMax = Math.max(15, Math.ceil(lam * 2.5));
  const pts = useMemo(() => {
    const r = [];
    for (let k = 0; k <= kMax; k++) r.push([k, poissonPMF(k, lam)]);
    return r;
  }, [lam, kMax]);

  const yMax = useMemo(() => Math.max(0.1, ...pts.map(p => p[1])) * 1.2, [pts]);

  const mode = lam >= 1 ? Math.floor(lam) : 0;

  return (
    <>
      <div style={S.section}>
        <div>
          <p style={S.title}>Poisson Distribution</p>
          <p style={S.sub}>
            Counts of rare, independent events in a fixed interval.
            Examples: customers per hour, typos per page, server errors per day.
          </p>
        </div>

        <div style={S.svgWrap}>
          <Chart
            points={pts} color={C.green} xRange={[0, kMax]}
            yMax={yMax} bars barWidth={0.65}
            label={`Poisson (lambda=${lam})`}
          />
        </div>

        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <InfoRow label="Mean" value={lam} color={C.green} />
          <InfoRow label="Variance" value={lam} color={C.green} />
          <InfoRow label="Mode" value={mode} />
          <InfoRow label="Std Dev" value={Math.sqrt(lam).toFixed(2)} />
        </div>

        <code style={S.eq}>
          P(X=k) = (lambda^k * e^(-lambda)) / k! &nbsp;&nbsp;|&nbsp;&nbsp;
          Mean = Variance = lambda = {lam}
        </code>

        <div style={S.eq}>
          <span style={{ fontSize:12, color:C.dim }}>
            Use case: arrivals per hour, defects per batch, calls per minute.
            As lambda grows, the distribution becomes more symmetric (try lambda=15+).
          </span>
        </div>

        <Note title="Common Mistake">
          Applying Poisson when events are not independent or the rate varies over time
          (e.g., website traffic during a sale vs. normal hours). The Poisson requires
          a constant average rate and independent occurrences. If the rate changes,
          consider a non-homogeneous Poisson process or a different model entirely.
        </Note>
      </div>
      <div style={S.controls}>
        <Slider label="lambda" min={0.5} max={20} step={0.5} value={lam} onChange={setLam} />
      </div>
    </>
  );
}

/* ============================== TAB 3: Exponential ============================== */
function ExponentialTab() {
  const [lam, setLam] = useState(1);
  const [showMem, setShowMem] = useState(true);

  const xMax = Math.max(4, Math.min(10, 5 / lam));
  const pts = useMemo(() => {
    const r = [];
    for (let x = 0; x <= xMax; x += xMax / 200) r.push([x, expPDF(x, lam)]);
    return r;
  }, [lam, xMax]);

  const yMax = useMemo(() => Math.max(0.5, lam) * 1.15, [lam]);

  // Memoryless: survival function from a given point s
  const s = xMax * 0.3;
  const memPts = useMemo(() => {
    if (!showMem) return null;
    const r = [];
    for (let x = s; x <= xMax; x += xMax / 200) {
      r.push([x, expPDF(x, lam)]);
    }
    return r;
  }, [lam, xMax, s, showMem]);

  return (
    <>
      <div style={S.section}>
        <div>
          <p style={S.title}>Exponential Distribution</p>
          <p style={S.sub}>
            Time between events in a Poisson process. If events arrive at rate lambda,
            the waiting time between them follows Exp(lambda).
          </p>
        </div>

        <div style={S.svgWrap}>
          <Chart
            points={pts} color={C.cyan} xRange={[0, xMax]} yMax={yMax}
            fillUnder
            label={`Exp (lambda=${lam}, mean=${(1 / lam).toFixed(2)})`}
            zones={showMem ? [[s, xMax, C.amber]] : null}
          />
        </div>

        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <InfoRow label="Rate (lambda)" value={lam} color={C.cyan} />
          <InfoRow label="Mean (1/lambda)" value={(1 / lam).toFixed(3)} color={C.cyan} />
          <InfoRow label="Median" value={(Math.log(2) / lam).toFixed(3)} />
          <InfoRow label="Std Dev" value={(1 / lam).toFixed(3)} />
        </div>

        <code style={S.eq}>
          f(x) = lambda * e^(-lambda*x) &nbsp;&nbsp;|&nbsp;&nbsp; Mean = 1/lambda = {(1 / lam).toFixed(2)}
        </code>

        <code style={S.eq}>
          Memoryless: P(X {'>'} s+t | X {'>'} s) = P(X {'>'} t)
        </code>

        <div style={S.eq}>
          <span style={{ fontSize:12, color:C.dim }}>
            Use case: time until next customer arrival, time between hardware failures
            (assuming constant hazard rate). The shaded region shows that given you have
            already waited past s={s.toFixed(1)}, the remaining wait distribution is identical.
          </span>
        </div>

        <Note title="Common Mistake">
          Confusing the rate parameter lambda with the mean. If lambda=2 events/hour,
          the mean wait is 1/2 = 0.5 hours, NOT 2 hours. Many textbooks parameterize
          with beta=1/lambda instead, adding to the confusion -- always check which
          convention your source uses.
        </Note>
      </div>
      <div style={S.controls}>
        <Slider label="lambda" min={0.2} max={5} step={0.1} value={lam} onChange={setLam} />
        <label style={{ ...slStyle, cursor:'pointer' }}>
          <input type="checkbox" checked={showMem} onChange={e => setShowMem(e.target.checked)}
            style={{ accentColor:C.amber }} />
          <span style={{ color:showMem ? C.amber : C.faint }}>Memoryless zone</span>
        </label>
      </div>
    </>
  );
}

/* ============================== TAB 4: Weibull ============================== */
function WeibullTab() {
  const [k, setK] = useState(1.5);
  const [lam, setLam] = useState(2);

  const xMax = lam * 3.5;
  const pts = useMemo(() => {
    const r = [];
    for (let x = 0.01; x <= xMax; x += xMax / 250) r.push([x, weibullPDF(x, k, lam)]);
    return r;
  }, [k, lam, xMax]);

  const yMax = useMemo(() => Math.max(0.3, ...pts.map(p => p[1])) * 1.15, [pts]);

  const regime = k < 0.95
    ? { text:'Decreasing hazard (infant mortality)', color:C.amber }
    : k > 1.05
      ? { text:'Increasing hazard (wear-out / aging)', color:C.red }
      : { text:'Constant hazard (equivalent to exponential)', color:C.cyan };

  const mean = lam * gamma(1 + 1 / k);

  return (
    <>
      <div style={S.section}>
        <div>
          <p style={S.title}>Weibull Distribution</p>
          <p style={S.sub}>
            The go-to distribution for reliability engineering. The shape parameter k
            controls whether failure rate decreases, stays constant, or increases over time.
          </p>
        </div>

        <div style={S.svgWrap}>
          <Chart
            points={pts} color={C.pink} xRange={[0, xMax]} yMax={yMax}
            fillUnder
            label={`Weibull (k=${k}, lambda=${lam})`}
          />
        </div>

        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          <InfoRow label="Shape (k)" value={k} color={C.pink} />
          <InfoRow label="Scale (lambda)" value={lam} color={C.pink} />
          <InfoRow label="Mean" value={isFinite(mean) ? mean.toFixed(3) : '---'} />
        </div>

        <div style={{
          ...S.eq,
          color: regime.color,
          borderColor: regime.color,
          borderLeftWidth: 3,
          borderLeftStyle: 'solid',
        }}>
          {regime.text}
        </div>

        <code style={S.eq}>
          k{'<'}1: early-life failures &nbsp;|&nbsp; k=1: random (exponential) &nbsp;|&nbsp; k{'>'}1: aging/wear-out
        </code>

        <div style={S.eq}>
          <span style={{ fontSize:12, color:C.dim }}>
            Use case: component lifetime, bearing failure, material fatigue.
            In reliability, the "bathtub curve" uses Weibull with different k values
            for each life phase. Try k=0.5 for infant mortality, k=1 for useful life,
            k=3 for wear-out.
          </span>
        </div>

        <Note title="Common Mistake">
          Assuming a constant failure rate (exponential, k=1) when components actually
          wear out over time (k{'>'}1). Real mechanical parts, batteries, and bearings almost
          always have k {'>'}1. Ignoring this leads to scheduling too few preventive
          maintenance intervals and surprise breakdowns.
        </Note>
      </div>
      <div style={S.controls}>
        <Slider label="k (shape)" min={0.3} max={5} step={0.1} value={k} onChange={setK} />
        <Slider label="lambda" min={0.5} max={5} step={0.5} value={lam} onChange={setLam} />
      </div>
    </>
  );
}

/* ============================== TAB 5: Compare ============================== */
function CompareTab() {
  const [ans, setAns] = useState({ type: null, counting: null, memory: null });

  const rec = useMemo(() => {
    if (!ans.type) return null;
    if (ans.type === 'discrete') {
      if (ans.counting === 'yes')
        return { name:'Poisson', color:C.green, why:'Discrete counts of independent events at a constant average rate.' };
      if (ans.counting === 'no')
        return { name:'Consider Binomial or other discrete', color:C.violet, why:'Discrete but not simple event counts. Check if it is fixed-trial (Binomial), geometric, or negative binomial.' };
      return null;
    }
    if (ans.type === 'continuous') {
      if (ans.counting === 'time') {
        if (ans.memory === 'yes')
          return { name:'Exponential', color:C.cyan, why:'Continuous waiting time with memoryless (constant hazard) property.' };
        if (ans.memory === 'no')
          return { name:'Weibull', color:C.pink, why:'Continuous lifetime/duration where the hazard rate changes over time.' };
        return null;
      }
      if (ans.counting === 'measure')
        return { name:'Normal (Gaussian)', color:C.accent, why:'Continuous measurement. By the Central Limit Theorem, sums and averages of many independent factors tend toward normal.' };
      return null;
    }
    return null;
  }, [ans]);

  const btnStyle = (key, val) => ({
    padding:'6px 14px', borderRadius:8, fontSize:12, cursor:'pointer',
    fontWeight:600, transition:'all .15s',
    border: `1px solid ${ans[key] === val ? C.accent : C.borderLight}`,
    background: ans[key] === val ? C.accentGlow : 'transparent',
    color: ans[key] === val ? C.accentLight : C.muted,
  });

  const reset = () => setAns({ type:null, counting:null, memory:null });

  const rows = [
    ['Normal',     'Continuous', 'Measurement, error, averages',    'mu, sigma',  'Bell curve, symmetric, 68-95-99.7 rule'],
    ['t',          'Continuous', 'Small-sample means',              'df',         'Like Normal but heavier tails'],
    ['Poisson',    'Discrete',   'Event counts per interval',       'lambda',     'Mean equals variance'],
    ['Exponential','Continuous', 'Waiting time between events',     'lambda',     'Memoryless property'],
    ['Weibull',    'Continuous', 'Lifetimes, reliability',          'k, lambda',  'Flexible hazard rate via shape k'],
  ];

  const qRow = { display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' };
  const qLabel = { fontSize:12, color:C.dim, minWidth:180 };

  return (
    <>
      <div style={S.section}>
        <div>
          <p style={S.title}>Which Distribution Should You Use?</p>
          <p style={S.sub}>
            Answer a few questions about your data to get a recommendation,
            then refer to the summary table below.
          </p>
        </div>

        {/* interactive decision flow */}
        <div style={{ display:'flex', flexDirection:'column', gap:12,
          padding:14, background:C.surfaceAlt, borderRadius:10,
          border:`1px solid ${C.borderLight}` }}>

          <div style={qRow}>
            <span style={qLabel}>1. Is your variable...</span>
            <button style={btnStyle('type','discrete')}
              onClick={() => setAns({ type:'discrete', counting:null, memory:null })}>
              Discrete (counts)
            </button>
            <button style={btnStyle('type','continuous')}
              onClick={() => setAns({ type:'continuous', counting:null, memory:null })}>
              Continuous
            </button>
          </div>

          {ans.type === 'discrete' && (
            <div style={qRow}>
              <span style={qLabel}>2. Counting events per interval?</span>
              <button style={btnStyle('counting','yes')}
                onClick={() => setAns(a => ({ ...a, counting:'yes' }))}>Yes</button>
              <button style={btnStyle('counting','no')}
                onClick={() => setAns(a => ({ ...a, counting:'no' }))}>No</button>
            </div>
          )}

          {ans.type === 'continuous' && (
            <div style={qRow}>
              <span style={qLabel}>2. What are you measuring?</span>
              <button style={btnStyle('counting','time')}
                onClick={() => setAns(a => ({ ...a, counting:'time', memory:null }))}>
                Time / duration
              </button>
              <button style={btnStyle('counting','measure')}
                onClick={() => setAns(a => ({ ...a, counting:'measure' }))}>
                Measurement / value
              </button>
            </div>
          )}

          {ans.type === 'continuous' && ans.counting === 'time' && (
            <div style={qRow}>
              <span style={qLabel}>3. Constant failure/hazard rate?</span>
              <button style={btnStyle('memory','yes')}
                onClick={() => setAns(a => ({ ...a, memory:'yes' }))}>
                Yes (memoryless)
              </button>
              <button style={btnStyle('memory','no')}
                onClick={() => setAns(a => ({ ...a, memory:'no' }))}>
                No (changes over time)
              </button>
            </div>
          )}

          {rec && (
            <div style={{
              padding:12, marginTop:4, borderRadius:8,
              background:C.bg, border:`1px solid ${C.borderLight}`,
            }}>
              <span style={{ fontSize:14, fontWeight:700, color:rec.color }}>
                Recommended: {rec.name}
              </span>
              <p style={{ fontSize:12.5, color:C.muted, margin:'6px 0 0' }}>{rec.why}</p>
              <button onClick={reset} style={{
                marginTop:8, padding:'4px 12px', borderRadius:6,
                border:`1px solid ${C.borderLight}`, background:'transparent',
                color:C.faint, fontSize:11, cursor:'pointer',
              }}>Reset</button>
            </div>
          )}
        </div>

        {/* summary table */}
        <div style={{ overflowX:'auto', marginTop:4 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11.5 }}>
            <thead>
              <tr>
                {['Distribution','Type','Use Case','Params','Key Property'].map(h => (
                  <th key={h} style={{
                    padding:'7px 10px', borderBottom:`1px solid ${C.borderLight}`,
                    color:C.dim, fontWeight:600, textAlign:'left',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} style={{
                      padding:'7px 10px',
                      borderBottom:`1px solid ${C.border}`,
                      color: j === 0 ? C.accentLight : C.muted,
                      fontWeight: j === 0 ? 600 : 400,
                    }}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Note title="Common Mistake">
          Choosing a distribution based on mathematical convenience rather than the
          actual data-generating process. Always plot your data first, check assumptions
          (independence, constant rate, symmetry), and use goodness-of-fit tests like
          chi-squared or Kolmogorov-Smirnov before committing to a model.
        </Note>
      </div>
    </>
  );
}

/* ============================== Main Component ============================== */
const TABS = ['Gaussian + t', 'Poisson', 'Exponential', 'Weibull', 'Compare When to Use'];

export default function CommonDistributions() {
  const [tab, setTab] = useState(0);

  return (
    <div style={S.container}>
      <div style={S.topicBar}>
        {TABS.map((t, i) => (
          <button key={i} style={S.topicTab(tab === i)} onClick={() => setTab(i)}>
            {t}
          </button>
        ))}
      </div>
      <div style={S.body}>
        {tab === 0 && <GaussianTab />}
        {tab === 1 && <PoissonTab />}
        {tab === 2 && <ExponentialTab />}
        {tab === 3 && <WeibullTab />}
        {tab === 4 && <CompareTab />}
      </div>
    </div>
  );
}
