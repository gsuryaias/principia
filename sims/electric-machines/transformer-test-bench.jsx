import React, { useMemo, useState } from 'react';

const S = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 3.5rem)',
    background: '#09090b',
    color: '#e4e4e7',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  tabBar: {
    display: 'flex',
    gap: 4,
    padding: '12px 24px',
    background: '#0a0a0f',
    borderBottom: '1px solid #1f1f26',
    flexWrap: 'wrap',
  },
  tab: (active) => ({
    padding: '8px 16px',
    borderRadius: 10,
    border: 'none',
    background: active ? '#6366f1' : 'transparent',
    color: active ? '#ffffff' : '#71717a',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  }),
  panel: {
    padding: '20px 24px',
    borderBottom: '1px solid #1f1f26',
    background: '#0d0d12',
  },
  sectionTitle: {
    fontSize: 13,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 14,
    fontWeight: 700,
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 20,
    alignItems: 'center',
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 220,
  },
  label: {
    fontSize: 13,
    color: '#a1a1aa',
    minWidth: 108,
  },
  slider: {
    width: 132,
    accentColor: '#6366f1',
    cursor: 'pointer',
  },
  value: {
    fontSize: 13,
    color: '#d4d4d8',
    fontFamily: 'monospace',
    minWidth: 72,
    textAlign: 'right',
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  chip: (active) => ({
    padding: '8px 12px',
    borderRadius: 999,
    border: `1px solid ${active ? '#6366f1' : '#27272a'}`,
    background: active ? 'rgba(99,102,241,0.18)' : '#111114',
    color: active ? '#c7d2fe' : '#a1a1aa',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  }),
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    padding: '18px 24px 0',
  },
  storyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
    padding: '18px 24px 0',
  },
  storyCard: {
    background: '#111114',
    border: '1px solid #1f1f26',
    borderRadius: 18,
    padding: '16px 16px 15px',
  },
  storyEyebrow: {
    fontSize: 11,
    color: '#818cf8',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 700,
    marginBottom: 6,
  },
  storyTitle: {
    fontSize: 15,
    color: '#f4f4f5',
    fontWeight: 700,
    marginBottom: 8,
  },
  storyText: {
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 1.7,
  },
  formulaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
    padding: '18px 24px 0',
  },
  formulaCard: {
    background: '#101017',
    border: '1px solid #26263a',
    borderRadius: 18,
    padding: '14px 16px',
  },
  formulaTitle: {
    fontSize: 11,
    color: '#a5b4fc',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 700,
    marginBottom: 8,
  },
  formulaText: {
    fontSize: 14,
    color: '#ddd6fe',
    fontFamily: 'monospace',
    lineHeight: 1.7,
  },
  formulaHint: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 8,
    lineHeight: 1.55,
  },
  metric: {
    background: '#111114',
    border: '1px solid #1f1f26',
    borderRadius: 16,
    padding: '14px 16px',
  },
  metricLabel: {
    fontSize: 11,
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 700,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 21,
    fontWeight: 800,
    fontFamily: 'monospace',
    color: '#f4f4f5',
  },
  metricNote: {
    fontSize: 12,
    color: '#a1a1aa',
    marginTop: 6,
    lineHeight: 1.5,
  },
  vizWrap: {
    padding: '16px 16px 18px',
    display: 'flex',
    justifyContent: 'center',
    overflowX: 'auto',
  },
  experimentBox: {
    margin: '18px 24px 0',
    padding: '14px 16px',
    borderRadius: 16,
    border: '1px solid #27272a',
    background: '#101014',
  },
  experimentTitle: {
    fontSize: 12,
    color: '#f4f4f5',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 8,
  },
  theory: {
    maxWidth: 860,
    margin: '0 auto',
    padding: '28px 24px 40px',
  },
  h2: {
    fontSize: 22,
    fontWeight: 800,
    color: '#f4f4f5',
    margin: '30px 0 12px',
    borderBottom: '1px solid #27272a',
    paddingBottom: 8,
  },
  h3: {
    fontSize: 17,
    fontWeight: 700,
    color: '#e4e4e7',
    margin: '22px 0 10px',
  },
  p: {
    fontSize: 15,
    lineHeight: 1.75,
    color: '#a1a1aa',
    margin: '0 0 14px',
  },
  eq: {
    display: 'block',
    padding: '14px 18px',
    borderRadius: 14,
    border: '1px solid #27272a',
    background: '#111114',
    color: '#c4b5fd',
    fontFamily: 'monospace',
    fontSize: 14,
    margin: '14px 0',
    overflowX: 'auto',
  },
  callout: {
    padding: '14px 18px',
    borderRadius: 14,
    background: 'rgba(99,102,241,0.08)',
    borderLeft: '3px solid #6366f1',
    margin: '16px 0',
  },
  calloutTitle: {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: '#a5b4fc',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  ul: {
    margin: '10px 0 16px',
    paddingLeft: 20,
  },
  li: {
    fontSize: 14,
    lineHeight: 1.75,
    color: '#a1a1aa',
    marginBottom: 4,
  },
};

const TABS = ['lab', 'performance', 'inrush', 'harmonics', 'theory'];

const LOAD_PRESETS = {
  resistive: { label: 'Resistive', x: 0.8, pf: 1, mode: 'lagging' },
  industrial: { label: 'Industrial motor', x: 0.85, pf: 0.82, mode: 'lagging' },
  lighting: { label: 'Lighting feeder', x: 0.55, pf: 0.95, mode: 'lagging' },
  capacitive: { label: 'Capacitive / overexcited', x: 0.65, pf: 0.92, mode: 'leading' },
};

const CONNECTIONS = {
  yy_ungrounded: {
    label: 'Y-Y Ungrounded',
    lineFactor: 0.12,
    neutralFactor: 0,
    deltaFactor: 0,
    distortionFactor: 0.95,
    message: 'Triplen magnetising current has no easy path. Current stays low, but the neutral can float and phase voltage distortion rises sharply.',
  },
  yy_grounded: {
    label: 'Y-Y Grounded Neutral',
    lineFactor: 0.18,
    neutralFactor: 0.95,
    deltaFactor: 0,
    distortionFactor: 0.42,
    message: 'Grounding provides the zero-sequence path. Third-harmonic current can return through the neutral, reducing voltage distortion but increasing neutral burden.',
  },
  dy: {
    label: 'Δ-Y',
    lineFactor: 0.08,
    neutralFactor: 0.12,
    deltaFactor: 0.86,
    distortionFactor: 0.2,
    message: 'The delta winding traps triplen harmonics as a circulating current, so the line-side waveform stays much cleaner.',
  },
  yd: {
    label: 'Y-Δ',
    lineFactor: 0.08,
    neutralFactor: 0.05,
    deltaFactor: 0.86,
    distortionFactor: 0.22,
    message: 'The delta side again provides the local circulating path. Harmonic current is mostly internal to the transformer rather than appearing in the external line current.',
  },
  dd: {
    label: 'Δ-Δ',
    lineFactor: 0.06,
    neutralFactor: 0,
    deltaFactor: 0.92,
    distortionFactor: 0.16,
    message: 'Closed deltas suppress triplen voltage distortion well, but the price is internal circulating harmonic current and extra heating.',
  },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function format(value, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : '0.00';
}

function deriveFromTests({
  ratingKVA,
  vHv,
  vLv,
  vocPct,
  iocPct,
  pocKW,
  vscPct,
  pscKW,
  freq,
}) {
  const sVA = ratingKVA * 1000;
  const a = vHv / vLv;
  const iHvRated = sVA / vHv;
  const iLvRated = sVA / vLv;

  const voc = vLv * (vocPct / 100);
  const ioc = iLvRated * (iocPct / 100);
  const poc = pocKW * 1000;

  const cosPhi0 = clamp(poc / Math.max(voc * ioc, 1e-6), 0, 0.999);
  const iw = ioc * cosPhi0;
  const im = Math.sqrt(Math.max(ioc * ioc - iw * iw, 0));
  const rcLv = poc > 1e-6 ? (voc * voc) / poc : Infinity;
  const xmLv = im > 1e-6 ? voc / im : Infinity;
  const rcHv = rcLv * a * a;
  const xmHv = xmLv * a * a;
  const pCoreRated = rcLv < Infinity ? (vLv * vLv) / rcLv : 0;

  const vsc = vHv * (vscPct / 100);
  const psc = pscKW * 1000;
  const zEqHv = vsc / Math.max(iHvRated, 1e-6);
  const rEqHv = psc / Math.max(iHvRated * iHvRated, 1e-6);
  const xEqHv = Math.sqrt(Math.max(zEqHv * zEqHv - rEqHv * rEqHv, 0));
  const zBaseHv = (vHv * vHv) / sVA;
  const rPu = rEqHv / zBaseHv;
  const xPu = xEqHv / zBaseHv;
  const zPu = zEqHv / zBaseHv;
  const xOverR = rEqHv > 1e-9 ? xEqHv / rEqHv : Infinity;

  return {
    ratingKVA,
    vHv,
    vLv,
    freq,
    a,
    iHvRated,
    iLvRated,
    voc,
    ioc,
    poc,
    cosPhi0,
    iw,
    im,
    rcLv,
    xmLv,
    rcHv,
    xmHv,
    pCoreRated,
    vsc,
    psc,
    zEqHv,
    rEqHv,
    xEqHv,
    zPu,
    rPu,
    xPu,
    xOverR,
  };
}

function computePerformance(tests, loadFraction, pf, mode) {
  const sinPhi = Math.sqrt(Math.max(0, 1 - pf * pf));
  const signedSin = mode === 'leading' ? -sinPhi : sinPhi;
  const term1 = loadFraction * (tests.rPu * pf + tests.xPu * signedSin);
  const term2 = (loadFraction * loadFraction * Math.pow(tests.xPu * pf - tests.rPu * signedSin, 2)) / 2;
  const resistiveDropPct = loadFraction * tests.rPu * pf * 100;
  const reactiveDropPct = loadFraction * tests.xPu * signedSin * 100;
  const regulationPct = (term1 + term2) * 100;
  const secondaryVoltage = tests.vLv * (1 - regulationPct / 100);
  const copperLoss = loadFraction * loadFraction * tests.psc;
  const outputPower = tests.ratingKVA * 1000 * loadFraction * pf;
  const inputPower = outputPower + tests.pCoreRated + copperLoss;
  const efficiency = inputPower > 1 ? (outputPower / inputPower) * 100 : 0;

  return {
    loadFraction,
    pf,
    mode,
    regulationPct,
    resistiveDropPct,
    reactiveDropPct,
    secondOrderPct: term2 * 100,
    secondaryVoltage,
    copperLoss,
    outputPower,
    inputPower,
    efficiency,
    currentLv: tests.iLvRated * loadFraction,
    currentHv: tests.iHvRated * loadFraction,
  };
}

function buildPerfCurve(tests, pf, mode) {
  const pts = [];
  for (let i = 0; i <= 72; i += 1) {
    const x = (1.5 * i) / 72;
    pts.push({ x, ...computePerformance(tests, x, pf, mode) });
  }
  return pts;
}

function computeInrush({
  tests,
  switchAngle,
  remanence,
  kneeFlux,
  sourceStiffness,
  decayCycles,
}) {
  const alpha = (switchAngle * Math.PI) / 180;
  const duration = 3 / tests.freq;
  const points = [];
  let peakFluxPu = 0;
  let peakCurrentPu = 0;

  for (let i = 0; i <= 240; i += 1) {
    const t = (duration * i) / 240;
    const theta = 2 * Math.PI * tests.freq * t;
    const voltage = Math.sin(theta + alpha);
    const fluxPu = remanence + Math.cos(alpha) - Math.cos(theta + alpha);
    const excess = Math.max(0, Math.abs(fluxPu) / kneeFlux - 1);
    const decay = Math.exp(-t / Math.max(decayCycles / tests.freq, 1e-4));
    const magnetisingPu = 0.12 * Math.sin(theta + alpha - Math.PI / 2);
    const inrushPu = Math.sign(fluxPu) * sourceStiffness * 8.5 * Math.pow(excess, 2.15) * decay;
    const currentPu = magnetisingPu + inrushPu;

    peakFluxPu = Math.max(peakFluxPu, Math.abs(fluxPu));
    peakCurrentPu = Math.max(peakCurrentPu, Math.abs(currentPu));
    points.push({ tMs: t * 1000, voltage, fluxPu, currentPu });
  }

  const peakCurrentA = peakCurrentPu * tests.iHvRated;
  let risk = 'Low';
  let riskColor = '#22c55e';
  if (peakCurrentPu >= 8) {
    risk = 'Severe';
    riskColor = '#ef4444';
  } else if (peakCurrentPu >= 5) {
    risk = 'High';
    riskColor = '#f97316';
  } else if (peakCurrentPu >= 2.5) {
    risk = 'Moderate';
    riskColor = '#f59e0b';
  }

  return {
    points,
    peakFluxPu,
    peakCurrentPu,
    peakCurrentA,
    dcBiasPu: remanence + Math.cos(alpha),
    risk,
    riskColor,
  };
}

function assessHarmonics(connectionKey, triplenPct) {
  const config = CONNECTIONS[connectionKey];
  const level = triplenPct / 100;
  const lineTriplenPct = level * config.lineFactor * 100;
  const neutralTriplenPct = level * config.neutralFactor * 100;
  const deltaCirculatingPct = level * config.deltaFactor * 100;
  const distortionPct = level * config.distortionFactor * 100;

  let verdict = 'Managed';
  let color = '#22c55e';
  if (distortionPct > 55 || deltaCirculatingPct > 55 || neutralTriplenPct > 55) {
    verdict = 'Watch closely';
    color = '#f59e0b';
  }
  if (distortionPct > 80) {
    verdict = 'Problematic';
    color = '#ef4444';
  }

  return {
    config,
    lineTriplenPct,
    neutralTriplenPct,
    deltaCirculatingPct,
    distortionPct,
    verdict,
    color,
  };
}

function Slider({ label, min, max, step, value, onChange, suffix = '', formatValue = (v) => v }) {
  return (
    <div style={S.controlGroup}>
      <span style={S.label}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={S.slider}
      />
      <span style={S.value}>{formatValue(value)}{suffix}</span>
    </div>
  );
}

function MetricCard({ label, value, note, color }) {
  return (
    <div style={S.metric}>
      <div style={S.metricLabel}>{label}</div>
      <div style={{ ...S.metricValue, color: color || S.metricValue.color }}>{value}</div>
      {note ? <div style={S.metricNote}>{note}</div> : null}
    </div>
  );
}

function MiniBar({ label, value, max = 100, color, note }) {
  const width = `${clamp((value / max) * 100, 0, 100)}%`;
  return (
    <div style={{ minWidth: 220, flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: '#a1a1aa' }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'monospace', color: '#e4e4e7' }}>{format(value, 1)}%</span>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: '#18181b', overflow: 'hidden', border: '1px solid #27272a' }}>
        <div style={{ width, height: '100%', background: color, borderRadius: 999 }} />
      </div>
      {note ? <div style={{ fontSize: 12, color: '#71717a', marginTop: 6 }}>{note}</div> : null}
    </div>
  );
}

function StoryGrid({ items }) {
  return (
    <div style={S.storyGrid}>
      {items.map((item) => (
        <div key={item.title} style={S.storyCard}>
          <div style={S.storyEyebrow}>{item.eyebrow}</div>
          <div style={S.storyTitle}>{item.title}</div>
          <div style={S.storyText}>{item.text}</div>
        </div>
      ))}
    </div>
  );
}

function FormulaGrid({ items }) {
  return (
    <div style={S.formulaGrid}>
      {items.map((item) => (
        <div key={item.title} style={S.formulaCard}>
          <div style={S.formulaTitle}>{item.title}</div>
          <div style={S.formulaText}>{item.formula}</div>
          <div style={S.formulaHint}>{item.hint}</div>
        </div>
      ))}
    </div>
  );
}

function TryThis({ items }) {
  return (
    <div style={S.experimentBox}>
      <div style={S.experimentTitle}>Try These Intuitive Checks</div>
      <ul style={{ ...S.ul, margin: 0 }}>
        {items.map((item) => (
          <li key={item} style={S.li}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function EquivalentCircuitSvg({ tests, perf, highlight = 'all' }) {
  const shuntHot = ['oc', 'inrush', 'harmonics', 'all'].includes(highlight);
  const seriesHot = ['sc', 'load', 'all'].includes(highlight);
  const loadHot = ['load', 'all'].includes(highlight);
  const shuntColor = shuntHot ? '#f59e0b' : '#52525b';
  const seriesColor = seriesHot ? '#38bdf8' : '#52525b';
  const loadColor = loadHot ? '#22c55e' : '#52525b';

  const calloutMap = {
    oc: 'Open-circuit test mainly reveals Rc and Xm because the current is tiny, so the series drop is almost invisible.',
    sc: 'Short-circuit test mainly reveals Req and Xeq because only a small voltage is applied, so the core flux and iron loss stay small.',
    load: 'Under load, the series branch sets regulation while the shunt branch keeps flux alive in the core.',
    inrush: 'At energisation the magnetising branch stops behaving linearly. Once the core saturates, Xm effectively collapses and current jumps.',
    harmonics: 'Third harmonics are born in the non-linear magnetising branch. The external connection decides whether they escape, return in neutral, or circulate in delta.',
    all: 'Both classical tests reconstruct this approximate equivalent circuit, which is why the same model predicts regulation, efficiency, and current.',
  };

  const arrowText = calloutMap[highlight] || calloutMap.all;
  const pfText = perf ? `${format(perf.pf, 2)} ${perf.mode === 'leading' ? 'lead' : 'lag'}` : 'set by load';
  const loadText = perf ? `x = ${format(perf.loadFraction, 2)}` : 'referred load';

  return (
    <svg viewBox="0 0 960 310" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      <rect x="20" y="18" width="920" height="274" rx="20" fill="#0c0c10" stroke="#1f1f26" />
      <text x="480" y="40" textAnchor="middle" fill="#c7d2fe" fontSize="15" fontWeight="700">Approximate Equivalent Circuit Referred To HV Side</text>
      <text x="480" y="60" textAnchor="middle" fill="#71717a" fontSize="11">This is the single picture that ties the tests, load behaviour, inrush intuition, and harmonic discussion together.</text>

      <line x1="86" y1="126" x2="840" y2="126" stroke="#e4e4e7" strokeWidth="2" />
      <line x1="86" y1="232" x2="840" y2="232" stroke="#e4e4e7" strokeWidth="2" />

      <circle cx="112" cy="179" r="22" fill="none" stroke="#6366f1" strokeWidth="2.4" />
      <text x="112" y="184" textAnchor="middle" fill="#c7d2fe" fontSize="11" fontWeight="700">V₁</text>
      <text x="112" y="253" textAnchor="middle" fill="#818cf8" fontSize="10">source</text>

      <line x1="182" y1="126" x2="182" y2="232" stroke="#e4e4e7" strokeWidth="2" />
      <rect x="156" y="148" width="20" height="34" rx="8" fill="#111114" stroke={shuntColor} strokeWidth="2" />
      <path d="M188 146 C200 146 200 160 188 160 C200 160 200 174 188 174 C200 174 200 188 188 188" fill="none" stroke={shuntColor} strokeWidth="2" />
      <text x="165" y="142" textAnchor="middle" fill={shuntColor} fontSize="10" fontWeight="700">Rc</text>
      <text x="190" y="142" textAnchor="middle" fill={shuntColor} fontSize="10" fontWeight="700">Xm</text>
      <text x="182" y="251" textAnchor="middle" fill="#a1a1aa" fontSize="10">shunt / exciting branch</text>

      <line x1="236" y1="126" x2="294" y2="126" stroke="#e4e4e7" strokeWidth="2" />
      <rect x="294" y="108" width="72" height="36" rx="8" fill="#111114" stroke={seriesColor} strokeWidth="2.2" />
      <text x="330" y="130" textAnchor="middle" fill={seriesColor} fontSize="11" fontWeight="700">Req</text>
      <line x1="366" y1="126" x2="406" y2="126" stroke="#e4e4e7" strokeWidth="2" />
      <path d="M406 126 C418 126 418 108 430 108 C442 108 442 126 454 126 C466 126 466 108 478 108 C490 108 490 126 502 126" fill="none" stroke={seriesColor} strokeWidth="2.3" />
      <text x="454" y="98" textAnchor="middle" fill={seriesColor} fontSize="11" fontWeight="700">Xeq</text>
      <line x1="502" y1="126" x2="608" y2="126" stroke="#e4e4e7" strokeWidth="2" />
      <text x="402" y="154" textAnchor="middle" fill="#a1a1aa" fontSize="10">series drop branch</text>

      <rect x="642" y="98" width="56" height="162" rx="16" fill="#0f172a" stroke="#475569" strokeDasharray="6 4" />
      <text x="670" y="120" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="700">referred</text>
      <text x="670" y="134" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="700">load</text>
      <rect x="732" y="144" width="36" height="70" rx="10" fill="#111114" stroke={loadColor} strokeWidth="2.2" />
      <text x="750" y="137" textAnchor="middle" fill={loadColor} fontSize="11" fontWeight="700">Z'L</text>
      <text x="750" y="251" textAnchor="middle" fill="#a1a1aa" fontSize="10">{loadText}</text>
      <text x="750" y="266" textAnchor="middle" fill="#a1a1aa" fontSize="10">{pfText}</text>
      <line x1="608" y1="126" x2="732" y2="126" stroke="#e4e4e7" strokeWidth="2" />
      <line x1="750" y1="214" x2="750" y2="232" stroke="#e4e4e7" strokeWidth="2" />
      <line x1="698" y1="232" x2="804" y2="232" stroke="#e4e4e7" strokeWidth="2" />

      <text x="300" y="204" fill={shuntColor} fontSize="11">Rc = {format(tests.rcHv / 1000, 1)} kΩ</text>
      <text x="300" y="220" fill={shuntColor} fontSize="11">Xm = {format(tests.xmHv / 1000, 1)} kΩ</text>
      <text x="430" y="204" fill={seriesColor} fontSize="11">Req = {format(tests.rEqHv, 1)} Ω</text>
      <text x="430" y="220" fill={seriesColor} fontSize="11">Xeq = {format(tests.xEqHv, 1)} Ω</text>
      <text x="560" y="204" fill="#22c55e" fontSize="11">Z% = {format(tests.zPu * 100, 2)}%</text>

      <path d="M118 82 C198 36 302 34 376 62" fill="none" stroke="#818cf8" strokeWidth="2" strokeDasharray="5 4" />
      <text x="392" y="66" fill="#c7d2fe" fontSize="11">{arrowText}</text>
    </svg>
  );
}

function HarmonicWaveformsSvg({ triplenPct, lineTriplenPct, distortionPct }) {
  const W = 960;
  const H = 240;
  const box = { x: 48, y: 42, w: 864, h: 152 };
  const ampCore = (triplenPct / 100) * 0.35;
  const ampLine = (lineTriplenPct / 100) * 0.35;
  const ampVoltage = (distortionPct / 100) * 0.22;

  const pathFor = (fn) => {
    let d = '';
    for (let i = 0; i <= 360; i += 3) {
      const rad = (i * Math.PI) / 180;
      const x = box.x + (i / 360) * box.w;
      const y = box.y + box.h / 2 - fn(rad) * (box.h / 2 - 10);
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }
    return d;
  };

  const pure = pathFor((r) => Math.sin(r));
  const core = pathFor((r) => 0.9 * Math.sin(r) + ampCore * Math.sin(3 * r));
  const line = pathFor((r) => 0.9 * Math.sin(r) + ampLine * Math.sin(3 * r));
  const voltage = pathFor((r) => Math.sin(r) + ampVoltage * Math.sin(3 * r));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <rect x="20" y="18" width="920" height="204" rx="20" fill="#0c0c10" stroke="#1f1f26" />
      <text x="480" y="34" textAnchor="middle" fill="#c7d2fe" fontSize="14" fontWeight="700">Fundamental Plus Third-Harmonic Distortion</text>
      <line x1={box.x} y1={box.y + box.h / 2} x2={box.x + box.w} y2={box.y + box.h / 2} stroke="#1f1f26" />
      <path d={pure} fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="5 5" />
      <path d={core} fill="none" stroke="#f59e0b" strokeWidth="2.4" />
      <path d={line} fill="none" stroke="#38bdf8" strokeWidth="2.4" />
      <path d={voltage} fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
      <text x="72" y="58" fill="#334155" fontSize="10" fontWeight="700">pure sine</text>
      <text x="154" y="58" fill="#f59e0b" fontSize="10" fontWeight="700">core magnetising current</text>
      <text x="322" y="58" fill="#38bdf8" fontSize="10" fontWeight="700">line current after connection</text>
      <text x="500" y="58" fill="#ef4444" fontSize="10" fontWeight="700">phase voltage distortion</text>
      <text x="52" y="208" fill="#a1a1aa" fontSize="11">
        Same core non-linearity on the left can look very different on the line side depending on whether triplen current is blocked, returned through neutral, or trapped inside delta.
      </text>
    </svg>
  );
}

function TestBenchSvg({ tests }) {
  const ocPfAngle = Math.acos(clamp(tests.cosPhi0, 0, 1));
  const phix = 145 + Math.cos(-ocPfAngle) * 58;
  const phiy = 235 + Math.sin(-ocPfAngle) * 58;
  const magx = 145;
  const magy = 177;

  const copperShare = tests.psc > 0 ? (tests.rPu / Math.max(tests.zPu, 1e-6)) * 100 : 0;
  const leakageShare = 100 - copperShare;

  return (
    <svg viewBox="0 0 960 360" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      <defs>
        <marker id="tbArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <polygon points="0,0 7,3.5 0,7" fill="#a5b4fc" />
        </marker>
      </defs>

      <rect x="20" y="20" width="920" height="320" rx="20" fill="#0c0c10" stroke="#1f1f26" />

      <text x="160" y="46" textAnchor="middle" fill="#c7d2fe" fontSize="15" fontWeight="700">Open-Circuit Test</text>
      <text x="160" y="66" textAnchor="middle" fill="#71717a" fontSize="11">LV excited, secondary open</text>
      <line x1="78" y1="118" x2="258" y2="118" stroke="#e4e4e7" strokeWidth="2" />
      <line x1="78" y1="286" x2="258" y2="286" stroke="#e4e4e7" strokeWidth="2" />
      <circle cx="92" cy="202" r="18" fill="none" stroke="#6366f1" strokeWidth="2" />
      <text x="92" y="206" textAnchor="middle" fill="#c7d2fe" fontSize="10" fontWeight="700">V</text>
      <rect x="188" y="148" width="24" height="108" rx="12" fill="#111114" stroke="#22c55e" />
      <rect x="224" y="148" width="18" height="108" rx="9" fill="#111114" stroke="#f59e0b" />
      <line x1="242" y1="118" x2="242" y2="148" stroke="#e4e4e7" strokeWidth="2" />
      <line x1="242" y1="256" x2="242" y2="286" stroke="#e4e4e7" strokeWidth="2" />
      <text x="200" y="138" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700">Core-loss branch</text>
      <text x="233" y="138" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="700">Xm</text>
      <text x="78" y="318" fill="#a1a1aa" fontSize="11">Measured: V₀={format(tests.voc, 0)} V, I₀={format(tests.ioc, 2)} A, P₀={format(tests.poc / 1000, 2)} kW</text>

      <text x="145" y="98" textAnchor="middle" fill="#71717a" fontSize="11">No-load current split</text>
      <line x1="145" y1="235" x2={magx} y2={magy} stroke="#f59e0b" strokeWidth="2" markerEnd="url(#tbArrow)" />
      <line x1="145" y1="235" x2={phix} y2={phiy} stroke="#60a5fa" strokeWidth="2" markerEnd="url(#tbArrow)" />
      <line x1="145" y1="235" x2="203" y2="235" stroke="#22c55e" strokeWidth="2" markerEnd="url(#tbArrow)" />
      <text x="207" y="239" fill="#22c55e" fontSize="10" fontWeight="700">Iw</text>
      <text x={phix + 6} y={phiy + 4} fill="#60a5fa" fontSize="10" fontWeight="700">I₀</text>
      <text x={magx + 6} y={magy - 4} fill="#f59e0b" fontSize="10" fontWeight="700">Im</text>

      <text x="480" y="46" textAnchor="middle" fill="#c7d2fe" fontSize="15" fontWeight="700">Derived Equivalent Circuit</text>
      <text x="480" y="66" textAnchor="middle" fill="#71717a" fontSize="11">All values referred to HV side from OC + SC tests</text>
      <line x1="360" y1="180" x2="600" y2="180" stroke="#e4e4e7" strokeWidth="2" />
      <rect x="388" y="162" width="74" height="36" rx="8" fill="#111114" stroke="#f97316" />
      <text x="425" y="184" textAnchor="middle" fill="#f97316" fontSize="11" fontWeight="700">Req</text>
      <rect x="474" y="162" width="74" height="36" rx="8" fill="#111114" stroke="#38bdf8" />
      <text x="511" y="184" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="700">Xeq</text>
      <line x1="480" y1="180" x2="480" y2="122" stroke="#e4e4e7" strokeWidth="2" />
      <line x1="480" y1="180" x2="480" y2="238" stroke="#e4e4e7" strokeWidth="2" />
      <rect x="444" y="90" width="72" height="24" rx="8" fill="#111114" stroke="#22c55e" />
      <rect x="444" y="246" width="72" height="24" rx="8" fill="#111114" stroke="#f59e0b" />
      <text x="480" y="107" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="700">Rc</text>
      <text x="480" y="263" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="700">Xm</text>
      <text x="365" y="226" fill="#a1a1aa" fontSize="11">Req = {format(tests.rEqHv, 1)} Ω</text>
      <text x="365" y="244" fill="#a1a1aa" fontSize="11">Xeq = {format(tests.xEqHv, 1)} Ω</text>
      <text x="365" y="262" fill="#a1a1aa" fontSize="11">Rc = {format(tests.rcHv / 1000, 1)} kΩ</text>
      <text x="365" y="280" fill="#a1a1aa" fontSize="11">Xm = {format(tests.xmHv / 1000, 1)} kΩ</text>

      <text x="800" y="46" textAnchor="middle" fill="#c7d2fe" fontSize="15" fontWeight="700">Short-Circuit Test</text>
      <text x="800" y="66" textAnchor="middle" fill="#71717a" fontSize="11">HV excited, LV shorted, rated current forced</text>
      <line x1="702" y1="118" x2="882" y2="118" stroke="#e4e4e7" strokeWidth="2" />
      <line x1="702" y1="286" x2="882" y2="286" stroke="#e4e4e7" strokeWidth="2" />
      <circle cx="716" cy="202" r="18" fill="none" stroke="#6366f1" strokeWidth="2" />
      <text x="716" y="206" textAnchor="middle" fill="#c7d2fe" fontSize="10" fontWeight="700">V</text>
      <rect x="814" y="162" width="64" height="36" rx="8" fill="#111114" stroke="#f97316" />
      <text x="846" y="184" textAnchor="middle" fill="#f97316" fontSize="11" fontWeight="700">Req + jXeq</text>
      <line x1="878" y1="118" x2="878" y2="286" stroke="#ef4444" strokeWidth="3" />
      <text x="878" y="204" textAnchor="start" fill="#ef4444" fontSize="11" fontWeight="700">Short</text>
      <text x="694" y="318" fill="#a1a1aa" fontSize="11">Measured: Vsc={format(tests.vsc, 0)} V, Isc={format(tests.iHvRated, 2)} A, Psc={format(tests.psc / 1000, 2)} kW</text>

      <text x="716" y="102" fill="#71717a" fontSize="11">Series drop split at rated current</text>
      <rect x="690" y="86" width="220" height="14" rx="7" fill="#18181b" stroke="#27272a" />
      <rect x="690" y="86" width={220 * clamp(copperShare / 100, 0, 1)} height="14" rx="7" fill="#f97316" />
      <rect x={690 + 220 * clamp(copperShare / 100, 0, 1)} y="86" width={220 * clamp(leakageShare / 100, 0, 1)} height="14" rx="7" fill="#38bdf8" />
      <text x="690" y="78" fill="#f97316" fontSize="10" fontWeight="700">Resistive share {format(copperShare, 0)}%</text>
      <text x="910" y="78" textAnchor="end" fill="#38bdf8" fontSize="10" fontWeight="700">Reactive share {format(leakageShare, 0)}%</text>
    </svg>
  );
}

function PerformanceSvg({ curve, perf, ratedVoltage }) {
  const W = 960;
  const H = 360;
  const left = { x: 48, y: 42, w: 390, h: 230 };
  const right = { x: 520, y: 42, w: 390, h: 230 };
  const xMax = 1.5;
  const regValues = curve.map((p) => p.regulationPct);
  const effValues = curve.map((p) => p.efficiency);
  const regMin = Math.min(-3, Math.floor(Math.min(...regValues) - 1));
  const regMax = Math.max(8, Math.ceil(Math.max(...regValues) + 1));
  const effMin = Math.max(80, Math.floor(Math.min(...effValues) - 1));
  const effMax = 100;
  const xTo = (r, x) => r.x + (x / xMax) * r.w;
  const yReg = (v) => left.y + left.h - ((v - regMin) / (regMax - regMin)) * left.h;
  const yEff = (v) => right.y + right.h - ((v - effMin) / (effMax - effMin)) * right.h;

  const regPolyline = curve.map((p) => `${xTo(left, p.x).toFixed(1)},${yReg(p.regulationPct).toFixed(1)}`).join(' ');
  const effPolyline = curve.map((p) => `${xTo(right, p.x).toFixed(1)},${yEff(p.efficiency).toFixed(1)}`).join(' ');
  const currentRegY = yReg(perf.regulationPct);
  const currentEffY = yEff(perf.efficiency);
  const xNowLeft = xTo(left, perf.loadFraction);
  const xNowRight = xTo(right, perf.loadFraction);
  const voltageScaleMax = Math.max(ratedVoltage * 1.15, 1);
  const ratedMarkerX = 520 + 390 * clamp(ratedVoltage / voltageScaleMax, 0, 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <defs>
        <linearGradient id="effFillTb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <rect x="20" y="18" width="920" height="324" rx="20" fill="#0c0c10" stroke="#1f1f26" />

      {[0, 0.25, 0.5, 0.75, 1, 1.25, 1.5].map((tick) => (
        <g key={`xt${tick}`}>
          <line x1={xTo(left, tick)} y1={left.y} x2={xTo(left, tick)} y2={left.y + left.h} stroke="#1f1f26" />
          <line x1={xTo(right, tick)} y1={right.y} x2={xTo(right, tick)} y2={right.y + right.h} stroke="#1f1f26" />
          <text x={xTo(left, tick)} y={left.y + left.h + 16} textAnchor="middle" fill="#71717a" fontSize="10">{tick.toFixed(2)}</text>
          <text x={xTo(right, tick)} y={right.y + right.h + 16} textAnchor="middle" fill="#71717a" fontSize="10">{tick.toFixed(2)}</text>
        </g>
      ))}

      {[regMin, (regMin + regMax) / 2, regMax].map((tick, idx) => (
        <g key={`rt${idx}`}>
          <line x1={left.x} y1={yReg(tick)} x2={left.x + left.w} y2={yReg(tick)} stroke="#1f1f26" />
          <text x={left.x - 8} y={yReg(tick) + 4} textAnchor="end" fill="#71717a" fontSize="10">{format(tick, 1)}%</text>
        </g>
      ))}

      {[effMin, (effMin + effMax) / 2, effMax].map((tick, idx) => (
        <g key={`et${idx}`}>
          <line x1={right.x} y1={yEff(tick)} x2={right.x + right.w} y2={yEff(tick)} stroke="#1f1f26" />
          <text x={right.x - 8} y={yEff(tick) + 4} textAnchor="end" fill="#71717a" fontSize="10">{format(tick, 1)}%</text>
        </g>
      ))}

      <text x={left.x + left.w / 2} y="28" textAnchor="middle" fill="#c7d2fe" fontSize="14" fontWeight="700">Voltage Regulation From Test Data</text>
      <text x={right.x + right.w / 2} y="28" textAnchor="middle" fill="#c7d2fe" fontSize="14" fontWeight="700">Efficiency From Test Data</text>
      <text x={left.x + left.w / 2} y="300" textAnchor="middle" fill="#71717a" fontSize="10">Load fraction x</text>
      <text x={right.x + right.w / 2} y="300" textAnchor="middle" fill="#71717a" fontSize="10">Load fraction x</text>

      <polyline points={regPolyline} fill="none" stroke="#a78bfa" strokeWidth="3" />
      <path
        d={`${effPolyline.split(' ').map((p, i) => `${i === 0 ? 'M' : 'L'}${p}`).join(' ')} L${xTo(right, xMax)},${right.y + right.h} L${xTo(right, 0)},${right.y + right.h} Z`}
        fill="url(#effFillTb)"
      />
      <polyline points={effPolyline} fill="none" stroke="#22c55e" strokeWidth="3" />

      <line x1={xNowLeft} y1={left.y} x2={xNowLeft} y2={left.y + left.h} stroke="#71717a" strokeDasharray="4 4" />
      <circle cx={xNowLeft} cy={currentRegY} r="6" fill="#a78bfa" />
      <line x1={xNowRight} y1={right.y} x2={xNowRight} y2={right.y + right.h} stroke="#71717a" strokeDasharray="4 4" />
      <circle cx={xNowRight} cy={currentEffY} r="6" fill="#22c55e" />

      <rect x="56" y="314" width="390" height="16" rx="8" fill="#18181b" stroke="#27272a" />
      <rect x="56" y="314" width={390 * clamp(perf.outputPower / perf.inputPower, 0, 1)} height="16" rx="8" fill="#22c55e" />
      <text x="56" y="308" fill="#22c55e" fontSize="10" fontWeight="700">Output {format(perf.outputPower / 1000, 1)} kW</text>
      <text x="446" y="308" textAnchor="end" fill="#ef4444" fontSize="10" fontWeight="700">Losses {format((perf.inputPower - perf.outputPower) / 1000, 2)} kW</text>

      <rect x="520" y="314" width="390" height="16" rx="8" fill="#18181b" stroke="#27272a" />
      <rect x="520" y="314" width={390 * clamp(perf.secondaryVoltage / voltageScaleMax, 0, 1)} height="16" rx="8" fill="#60a5fa" />
      <line x1={ratedMarkerX} y1="310" x2={ratedMarkerX} y2="334" stroke="#c7d2fe" strokeWidth="2" />
      <text x="520" y="308" fill="#60a5fa" fontSize="10" fontWeight="700">Secondary voltage {format(perf.secondaryVoltage, 1)} V</text>
      <text x="910" y="308" textAnchor="end" fill="#a1a1aa" fontSize="10">Rated marker {format(ratedVoltage, 0)} V</text>
    </svg>
  );
}

function InrushSvg({ inrush }) {
  const W = 960;
  const H = 360;
  const plot = { x: 56, y: 38, w: 848, h: 240 };
  const xMax = inrush.points[inrush.points.length - 1].tMs;
  const yFluxMin = -2.8;
  const yFluxMax = 2.8;
  const yCurMin = -12;
  const yCurMax = 12;
  const xTo = (x) => plot.x + (x / xMax) * plot.w;
  const yFlux = (y) => plot.y + plot.h - ((y - yFluxMin) / (yFluxMax - yFluxMin)) * plot.h;
  const yCur = (y) => plot.y + plot.h - ((y - yCurMin) / (yCurMax - yCurMin)) * plot.h;
  const fluxLine = inrush.points.map((p) => `${xTo(p.tMs).toFixed(1)},${yFlux(p.fluxPu).toFixed(1)}`).join(' ');
  const curLine = inrush.points.map((p) => `${xTo(p.tMs).toFixed(1)},${yCur(p.currentPu).toFixed(1)}`).join(' ');
  const voltLine = inrush.points.map((p) => `${xTo(p.tMs).toFixed(1)},${yFlux(p.voltage).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <rect x="20" y="18" width="920" height="324" rx="20" fill="#0c0c10" stroke="#1f1f26" />
      {[0, xMax / 3, (2 * xMax) / 3, xMax].map((tick, i) => (
        <g key={i}>
          <line x1={xTo(tick)} y1={plot.y} x2={xTo(tick)} y2={plot.y + plot.h} stroke="#1f1f26" />
          <text x={xTo(tick)} y={plot.y + plot.h + 18} textAnchor="middle" fill="#71717a" fontSize="10">{format(tick, 0)} ms</text>
        </g>
      ))}
      {[0, 1, 2, -1, -2].map((tick) => (
        <g key={`f${tick}`}>
          <line x1={plot.x} y1={yFlux(tick)} x2={plot.x + plot.w} y2={yFlux(tick)} stroke="#1f1f26" />
          <text x={plot.x - 8} y={yFlux(tick) + 4} textAnchor="end" fill="#71717a" fontSize="10">{tick} pu Φ</text>
        </g>
      ))}
      <text x="480" y="28" textAnchor="middle" fill="#c7d2fe" fontSize="14" fontWeight="700">Energisation Flux and Inrush Current</text>
      <polyline points={voltLine} fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.55" />
      <polyline points={fluxLine} fill="none" stroke="#a78bfa" strokeWidth="2.4" />
      <polyline points={curLine} fill="none" stroke="#f97316" strokeWidth="2.2" />
      <line x1={plot.x} y1={yFlux(1)} x2={plot.x + plot.w} y2={yFlux(1)} stroke="#a78bfa" strokeDasharray="4 4" opacity="0.7" />
      <line x1={plot.x} y1={yFlux(-1)} x2={plot.x + plot.w} y2={yFlux(-1)} stroke="#a78bfa" strokeDasharray="4 4" opacity="0.7" />
      <text x="92" y="54" fill="#60a5fa" fontSize="10" fontWeight="700">Applied voltage</text>
      <text x="228" y="54" fill="#a78bfa" fontSize="10" fontWeight="700">Core flux</text>
      <text x="314" y="54" fill="#f97316" fontSize="10" fontWeight="700">Magnetising / inrush current</text>
      <text x="812" y="54" fill={inrush.riskColor} fontSize="11" fontWeight="700">Risk: {inrush.risk}</text>
      <text x="56" y="314" fill="#a1a1aa" fontSize="11">
        When the switch closes near voltage zero, the integral of voltage creates the largest flux offset. Remanent flux shifts the waveform further and pushes the core deep into saturation.
      </text>
    </svg>
  );
}

function HarmonicsSvg({ assessment }) {
  const { config, lineTriplenPct, neutralTriplenPct, deltaCirculatingPct, distortionPct } = assessment;
  const hasDelta = deltaCirculatingPct > 0;
  const hasNeutral = neutralTriplenPct > 0;

  return (
    <svg viewBox="0 0 960 320" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      <defs>
        <marker id="ha" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <polygon points="0,0 7,3.5 0,7" fill="#f59e0b" />
        </marker>
      </defs>
      <rect x="20" y="18" width="920" height="284" rx="20" fill="#0c0c10" stroke="#1f1f26" />
      <text x="480" y="42" textAnchor="middle" fill="#c7d2fe" fontSize="15" fontWeight="700">Third-Harmonic / Triplen Behaviour</text>
      <text x="480" y="62" textAnchor="middle" fill="#71717a" fontSize="11">{config.label}</text>

      <rect x="96" y="106" width="160" height="96" rx="18" fill="#111114" stroke="#6366f1" />
      <text x="176" y="128" textAnchor="middle" fill="#c7d2fe" fontSize="12" fontWeight="700">Magnetising source</text>
      <text x="176" y="148" textAnchor="middle" fill="#a1a1aa" fontSize="11">Non-linear core</text>
      <text x="176" y="168" textAnchor="middle" fill="#f59e0b" fontSize="11">Triplen current generated</text>

      <rect x="400" y="98" width="164" height="112" rx="18" fill="#111114" stroke="#22c55e" />
      <text x="482" y="122" textAnchor="middle" fill="#86efac" fontSize="12" fontWeight="700">Transformer connection</text>
      <text x="482" y="144" textAnchor="middle" fill="#a1a1aa" fontSize="11">{config.label}</text>

      {hasDelta ? (
        <polygon points="454,178 510,178 482,132" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
      ) : (
        <>
          <line x1="482" y1="134" x2="452" y2="182" stroke="#60a5fa" strokeWidth="2.5" />
          <line x1="482" y1="134" x2="512" y2="182" stroke="#60a5fa" strokeWidth="2.5" />
          <line x1="452" y1="182" x2="512" y2="182" stroke="#60a5fa" strokeWidth="2.5" />
          {hasNeutral ? <line x1="482" y1="182" x2="482" y2="214" stroke="#e4e4e7" strokeWidth="2.5" /> : null}
        </>
      )}

      <rect x="704" y="106" width="160" height="96" rx="18" fill="#111114" stroke="#38bdf8" />
      <text x="784" y="128" textAnchor="middle" fill="#7dd3fc" fontSize="12" fontWeight="700">External system</text>
      <text x="784" y="148" textAnchor="middle" fill="#a1a1aa" fontSize="11">What the line sees</text>
      <text x="784" y="168" textAnchor="middle" fill="#ef4444" fontSize="11">Voltage distortion risk</text>

      <line x1="256" y1="154" x2="400" y2="154" stroke="#f59e0b" strokeWidth="2.5" markerEnd="url(#ha)" />
      <line x1="564" y1="154" x2="704" y2="154" stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#ha)" />

      {hasDelta ? (
        <path d="M520 176 C548 214 420 214 448 176" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeDasharray="5 4" markerEnd="url(#ha)" />
      ) : null}
      {hasNeutral ? <line x1="482" y1="214" x2="482" y2="248" stroke="#22c55e" strokeWidth="2.4" markerEnd="url(#ha)" /> : null}

      <text x="420" y="248" fill="#f59e0b" fontSize="11">Delta circulating = {format(deltaCirculatingPct, 1)}%</text>
      <text x="420" y="266" fill="#22c55e" fontSize="11">Neutral return = {format(neutralTriplenPct, 1)}%</text>
      <text x="420" y="284" fill="#38bdf8" fontSize="11">Line triplen leakage = {format(lineTriplenPct, 1)}%</text>
      <text x="726" y="248" fill="#ef4444" fontSize="11">Voltage distortion = {format(distortionPct, 1)}%</text>
    </svg>
  );
}

export default function TransformerTestBench() {
  const [tab, setTab] = useState('lab');
  const [ratingKVA, setRatingKVA] = useState(100);
  const [vHv, setVHv] = useState(11000);
  const [vLv, setVLv] = useState(415);
  const [freq, setFreq] = useState(50);
  const [vocPct, setVocPct] = useState(100);
  const [iocPct, setIocPct] = useState(3.2);
  const [pocKW, setPocKW] = useState(0.62);
  const [vscPct, setVscPct] = useState(5.4);
  const [pscKW, setPscKW] = useState(1.75);

  const [preset, setPreset] = useState('industrial');
  const [loadFraction, setLoadFraction] = useState(LOAD_PRESETS.industrial.x);
  const [pf, setPf] = useState(LOAD_PRESETS.industrial.pf);
  const [mode, setMode] = useState(LOAD_PRESETS.industrial.mode);

  const [switchAngle, setSwitchAngle] = useState(0);
  const [remanence, setRemanence] = useState(0.55);
  const [kneeFlux, setKneeFlux] = useState(1.15);
  const [sourceStiffness, setSourceStiffness] = useState(1);
  const [decayCycles, setDecayCycles] = useState(3.5);

  const [connection, setConnection] = useState('dy');
  const [triplenPct, setTriplenPct] = useState(45);

  const tests = useMemo(
    () => deriveFromTests({ ratingKVA, vHv, vLv, vocPct, iocPct, pocKW, vscPct, pscKW, freq }),
    [ratingKVA, vHv, vLv, vocPct, iocPct, pocKW, vscPct, pscKW, freq],
  );

  const performance = useMemo(
    () => computePerformance(tests, loadFraction, pf, mode),
    [tests, loadFraction, pf, mode],
  );

  const perfCurve = useMemo(
    () => buildPerfCurve(tests, pf, mode),
    [tests, pf, mode],
  );

  const inrush = useMemo(
    () => computeInrush({ tests, switchAngle, remanence, kneeFlux, sourceStiffness, decayCycles }),
    [tests, switchAngle, remanence, kneeFlux, sourceStiffness, decayCycles],
  );

  const harmonicAssessment = useMemo(
    () => assessHarmonics(connection, triplenPct),
    [connection, triplenPct],
  );

  const applyPreset = (key) => {
    const next = LOAD_PRESETS[key];
    setPreset(key);
    setLoadFraction(next.x);
    setPf(next.pf);
    setMode(next.mode);
  };

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        {TABS.map((name) => (
          <button key={name} style={S.tab(tab === name)} onClick={() => setTab(name)}>
            {name === 'lab' ? 'Tests' : name === 'performance' ? 'Loads' : name === 'inrush' ? 'Inrush' : name === 'harmonics' ? '3rd Harmonics' : 'Theory'}
          </button>
        ))}
      </div>

      {tab === 'lab' ? (
        <>
          <div style={S.panel}>
            <div style={S.sectionTitle}>Rated Transformer</div>
            <div style={S.controls}>
              <Slider label="Rating" min={25} max={500} step={5} value={ratingKVA} onChange={setRatingKVA} suffix=" kVA" formatValue={(v) => format(v, 0)} />
              <Slider label="HV rating" min={3300} max={33000} step={100} value={vHv} onChange={setVHv} suffix=" V" formatValue={(v) => format(v, 0)} />
              <Slider label="LV rating" min={230} max={11000} step={5} value={vLv} onChange={setVLv} suffix=" V" formatValue={(v) => format(v, 0)} />
              <Slider label="Frequency" min={50} max={60} step={10} value={freq} onChange={setFreq} suffix=" Hz" formatValue={(v) => format(v, 0)} />
            </div>
          </div>

          <div style={S.panel}>
            <div style={S.sectionTitle}>Open-Circuit Test Inputs</div>
            <div style={S.controls}>
              <Slider label="Applied V0" min={85} max={110} step={1} value={vocPct} onChange={setVocPct} suffix="% LV" formatValue={(v) => format(v, 0)} />
              <Slider label="No-load current" min={0.8} max={10} step={0.1} value={iocPct} onChange={setIocPct} suffix="% rated" formatValue={(v) => format(v, 1)} />
              <Slider label="Core loss P0" min={0.1} max={5} step={0.01} value={pocKW} onChange={setPocKW} suffix=" kW" formatValue={(v) => format(v, 2)} />
            </div>
          </div>

          <div style={S.panel}>
            <div style={S.sectionTitle}>Short-Circuit Test Inputs</div>
            <div style={S.controls}>
              <Slider label="Applied Vsc" min={2} max={10} step={0.1} value={vscPct} onChange={setVscPct} suffix="% HV" formatValue={(v) => format(v, 1)} />
              <Slider label="Copper loss Psc" min={0.2} max={8} step={0.01} value={pscKW} onChange={setPscKW} suffix=" kW" formatValue={(v) => format(v, 2)} />
            </div>
          </div>

          <div style={S.metrics}>
            <MetricCard label="Rc (HV referred)" value={`${format(tests.rcHv / 1000, 1)} kΩ`} note="From the wattful component of no-load current." />
            <MetricCard label="Xm (HV referred)" value={`${format(tests.xmHv / 1000, 1)} kΩ`} note="From the magnetising component of the OC test." />
            <MetricCard label="Req (HV referred)" value={`${format(tests.rEqHv, 1)} Ω`} note="Equivalent winding resistance from Psc." />
            <MetricCard label="Xeq (HV referred)" value={`${format(tests.xEqHv, 1)} Ω`} note="Leakage reactance from the SC test." />
            <MetricCard label="No-load PF" value={format(tests.cosPhi0, 3)} note="Usually very low because exciting current is mostly reactive." />
            <MetricCard label="Percent impedance" value={`${format(tests.zPu * 100, 2)} %`} note={`X/R = ${format(tests.xOverR, 2)}`} />
          </div>

          <StoryGrid
            items={[
              {
                eyebrow: 'Idle test',
                title: 'OC test asks: what does the transformer consume just to stay alive?',
                text: 'With the secondary open, almost no useful output power can flow. So the current you measure is mainly the current needed to build flux and pay the iron-loss bill.',
              },
              {
                eyebrow: 'Push current',
                title: 'SC test asks: how much voltage is needed to push rated current through the windings?',
                text: 'Because the applied voltage is very small, the core is hardly excited. That makes the wattmeter reading behave like a copper-loss meter and exposes the series impedance.',
              },
              {
                eyebrow: 'Big picture',
                title: 'Together, the two tests rebuild the whole textbook model',
                text: 'OC gives the shunt branch. SC gives the series branch. Once both are known, the transformer stops being a black box and becomes a solvable circuit.',
              },
            ]}
          />

          <FormulaGrid
            items={[
              {
                title: 'No-load power factor',
                formula: 'cos φ₀ = P₀ / (V₀ I₀)',
                hint: 'A low value means the exciting current is mostly reactive, which is exactly what you expect from a magnetising branch.',
              },
              {
                title: 'OC shunt branch',
                formula: 'Rc = V₀² / P₀   and   Xm = V₀ / Im',
                hint: 'Rc represents the real power lost in the core. Xm represents how “hard” the core must be driven to create flux.',
              },
              {
                title: 'SC series branch',
                formula: 'Zeq = Vsc / Irated',
                hint: 'This is the total internal opposition seen by rated current during the short-circuit test.',
              },
              {
                title: 'Split the drop',
                formula: 'Req = Psc / I²rated,   Xeq = √(Z²eq - R²eq)',
                hint: 'Req is the heating part. Xeq is the leakage-flux part. They affect load voltage in different ways.',
              },
            ]}
          />

          <div style={S.vizWrap}>
            <EquivalentCircuitSvg tests={tests} highlight="all" />
          </div>

          <div style={S.vizWrap}>
            <TestBenchSvg tests={tests} />
          </div>

          <TryThis
            items={[
              'Raise P₀ while keeping I₀ similar. Rc should fall, telling you the core is “leakier” in terms of real power.',
              'Raise Vsc%. Zeq should rise, which means larger internal voltage drop and stronger short-circuit limiting.',
              'Raise Psc at the same Vsc%. Req grows while Xeq shrinks in relative importance, so the transformer heats more for the same current.',
            ]}
          />
        </>
      ) : null}

      {tab === 'performance' ? (
        <>
          <div style={S.panel}>
            <div style={S.sectionTitle}>Load Type</div>
            <div style={S.row}>
              {Object.entries(LOAD_PRESETS).map(([key, option]) => (
                <button key={key} style={S.chip(preset === key)} onClick={() => applyPreset(key)}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div style={S.panel}>
            <div style={S.sectionTitle}>Operating Point</div>
            <div style={S.controls}>
              <Slider label="Load fraction x" min={0} max={1.5} step={0.01} value={loadFraction} onChange={setLoadFraction} formatValue={(v) => format(v, 2)} />
              <Slider label="Power factor" min={0.4} max={1} step={0.01} value={pf} onChange={setPf} formatValue={(v) => format(v, 2)} />
              <div style={S.controlGroup}>
                <span style={S.label}>Reactive nature</span>
                <div style={S.row}>
                  <button style={S.chip(mode === 'lagging')} onClick={() => setMode('lagging')}>Lagging</button>
                  <button style={S.chip(mode === 'leading')} onClick={() => setMode('leading')}>Leading</button>
                </div>
              </div>
            </div>
          </div>

          <StoryGrid
            items={[
              {
                eyebrow: 'Req',
                title: 'Req is the heating part of the drop',
                text: 'This term always costs voltage because it behaves like resistance in any other circuit. More current means more copper loss and more real drop.',
              },
              {
                eyebrow: 'Xeq',
                title: 'Xeq is the leakage-flux part of the drop',
                text: 'Leakage reactance does not consume real power, but it can still hurt regulation. Its effect depends strongly on whether the load current lags or leads.',
              },
              {
                eyebrow: 'Power factor',
                title: 'Power factor decides which part of the current “leans” into Xeq',
                text: 'Lagging current makes the reactive drop add to the resistive drop. Leading current can oppose it and sometimes produce a slight rise in terminal voltage.',
              },
            ]}
          />

          <FormulaGrid
            items={[
              {
                title: 'Approximate regulation',
                formula: 'VR ≈ x(Rpu cos φ ± Xpu sin φ)',
                hint: 'Use “+” for lagging loads and “−” for leading loads. The reactive term is why the same transformer feels different to different loads.',
              },
              {
                title: 'Copper loss scaling',
                formula: 'Pcu = x² Pcu,rated',
                hint: 'Double the current and copper loss becomes four times larger. This is why overloads become a heating problem quickly.',
              },
              {
                title: 'Efficiency',
                formula: 'η = Output / (Output + Pcore + Pcu)',
                hint: 'Core loss is almost fixed. Copper loss grows with load. The best operating region is where neither dominates too much.',
              },
              {
                title: 'Voltage intuition',
                formula: 'V₂ ≈ Vrated (1 - VR)',
                hint: 'The test data is now being used as a practical prediction tool, not just as isolated lab readings.',
              },
            ]}
          />

          <div style={S.vizWrap}>
            <EquivalentCircuitSvg tests={tests} perf={performance} highlight="load" />
          </div>

          <div style={S.metrics}>
            <MetricCard label="Secondary voltage" value={`${format(performance.secondaryVoltage, 1)} V`} note="Approximate terminal voltage from extracted equivalent circuit." color={performance.secondaryVoltage < tests.vLv * 0.95 ? '#f97316' : '#f4f4f5'} />
            <MetricCard label="Voltage regulation" value={`${format(performance.regulationPct, 2)} %`} note={mode === 'leading' ? 'Leading loads can drive negative regulation or voltage rise.' : 'Lagging current adds the leakage-reactance drop.'} color={performance.regulationPct > 6 ? '#ef4444' : '#f4f4f5'} />
            <MetricCard label="Efficiency" value={`${format(performance.efficiency, 2)} %`} note={`Core loss fixed at ${format(tests.pCoreRated / 1000, 2)} kW; copper loss varies as x².`} color={performance.efficiency > 97 ? '#22c55e' : '#f4f4f5'} />
            <MetricCard label="Copper loss" value={`${format(performance.copperLoss / 1000, 2)} kW`} note={`SC test base loss ${format(tests.psc / 1000, 2)} kW at rated current.`} />
            <MetricCard label="Resistive drop share" value={`${format(performance.resistiveDropPct, 2)} %`} note="This is the part tied directly to Req and useful current." color="#f97316" />
            <MetricCard label="Reactive drop share" value={`${format(performance.reactiveDropPct, 2)} %`} note="This term changes sign for leading loads, which is why regulation can improve or go negative." color={mode === 'leading' ? '#22c55e' : '#38bdf8'} />
            <MetricCard label="LV current" value={`${format(performance.currentLv, 1)} A`} note={`HV current ${format(performance.currentHv, 2)} A`} />
            <MetricCard label="Output power" value={`${format(performance.outputPower / 1000, 1)} kW`} note={`Input ${format(performance.inputPower / 1000, 1)} kW`} />
          </div>

          <div style={S.vizWrap}>
            <PerformanceSvg curve={perfCurve} perf={performance} ratedVoltage={tests.vLv} />
          </div>

          <TryThis
            items={[
              'Keep x fixed and change PF from 1.0 to 0.8 lagging. Watch how Xeq suddenly matters much more than before.',
              'Switch from lagging to leading at the same PF. The reactive-drop card changes sign, which is the intuitive reason voltage can rise.',
              'Increase load above 1.0 pu and compare efficiency versus copper loss. The loss grows faster than the useful output.',
            ]}
          />
        </>
      ) : null}

      {tab === 'inrush' ? (
        <>
          <div style={S.panel}>
            <div style={S.sectionTitle}>Energisation Conditions</div>
            <div style={S.controls}>
              <Slider label="Switching angle" min={0} max={180} step={1} value={switchAngle} onChange={setSwitchAngle} suffix="°" formatValue={(v) => format(v, 0)} />
              <Slider label="Remanent flux" min={0} max={1} step={0.01} value={remanence} onChange={setRemanence} suffix=" pu" formatValue={(v) => format(v, 2)} />
              <Slider label="Knee flux" min={1} max={1.4} step={0.01} value={kneeFlux} onChange={setKneeFlux} suffix=" pu" formatValue={(v) => format(v, 2)} />
              <Slider label="Source stiffness" min={0.5} max={1.5} step={0.01} value={sourceStiffness} onChange={setSourceStiffness} formatValue={(v) => format(v, 2)} />
              <Slider label="Decay time" min={1} max={8} step={0.1} value={decayCycles} onChange={setDecayCycles} suffix=" cycles" formatValue={(v) => format(v, 1)} />
            </div>
          </div>

          <StoryGrid
            items={[
              {
                eyebrow: 'Integral idea',
                title: 'Flux is the time integral of applied voltage',
                text: 'A transformer does not react to voltage instantaneously. It keeps accumulating flux according to the area under the voltage curve. That is the core reason inrush exists.',
              },
              {
                eyebrow: 'Worst instant',
                title: 'Closing at voltage zero is bad, not good',
                text: 'At that instant the voltage is small but its integral starts in the worst possible way, so the flux can get a large dc offset and overshoot far above its normal peak.',
              },
              {
                eyebrow: 'Memory',
                title: 'Remanent flux means the core remembers the previous switching event',
                text: 'If the new flux wants to build in the same direction as the leftover flux, the core can hit saturation almost immediately and the magnetising current spikes.',
              },
            ]}
          />

          <FormulaGrid
            items={[
              {
                title: 'Flux after closing',
                formula: 'φ(t) = φr + cos α - cos(ωt + α)',
                hint: 'The dc offset comes from the starting condition α and the residual flux φr, not from the steady-state transformer ratio.',
              },
              {
                title: 'Why saturation appears',
                formula: '|φ| > φknee  →  Xm collapses',
                hint: 'Past the knee, a small extra change in flux demands a disproportionately large current. That is the visual meaning of the inrush spike.',
              },
              {
                title: 'What matters physically',
                formula: 'source stiffness + remanence + close angle',
                hint: 'A stiff source can feed the inrush. A weak source limits it. Remanence and switching instant decide how badly the core is over-driven.',
              },
            ]}
          />

          <div style={S.vizWrap}>
            <EquivalentCircuitSvg tests={tests} highlight="inrush" />
          </div>

          <div style={S.metrics}>
            <MetricCard label="Peak flux" value={`${format(inrush.peakFluxPu, 2)} pu`} note={`Steady-state target is about 1.00 pu. Anything much above the knee drives saturation.`} color={inrush.peakFluxPu > kneeFlux ? '#f97316' : '#f4f4f5'} />
            <MetricCard label="Peak inrush current" value={`${format(inrush.peakCurrentPu, 1)} pu`} note={`${format(inrush.peakCurrentA, 1)} A on the energised HV winding.`} color={inrush.riskColor} />
            <MetricCard label="DC flux bias" value={`${format(inrush.dcBiasPu, 2)} pu`} note="This offset is set by closing angle plus remanence." />
            <MetricCard label="Severity" value={inrush.risk} note="Simplified saturating-core estimate; intended for intuition, not protection settings." color={inrush.riskColor} />
          </div>

          <div style={S.vizWrap}>
            <InrushSvg inrush={inrush} />
          </div>

          <TryThis
            items={[
              'Set switching angle close to 0° and remanence above 0.6 pu. That combination usually creates the most severe first-cycle current.',
              'Move the switching angle toward 90°. The flux offset reduces, so the current wave becomes much more ordinary.',
              'Raise the knee flux or reduce source stiffness and notice how the same flux overshoot causes less current stress.',
            ]}
          />
        </>
      ) : null}

      {tab === 'harmonics' ? (
        <>
          <div style={S.panel}>
            <div style={S.sectionTitle}>Connection and Excitation</div>
            <div style={S.row}>
              {Object.entries(CONNECTIONS).map(([key, item]) => (
                <button key={key} style={S.chip(connection === key)} onClick={() => setConnection(key)}>
                  {item.label}
                </button>
              ))}
            </div>
            <div style={{ height: 16 }} />
            <div style={S.controls}>
              <Slider label="Triplen severity" min={0} max={100} step={1} value={triplenPct} onChange={setTriplenPct} suffix="%" formatValue={(v) => format(v, 0)} />
            </div>
          </div>

          <StoryGrid
            items={[
              {
                eyebrow: 'Origin',
                title: 'Third harmonic is born in the non-linear magnetising current',
                text: 'The core B-H curve is not perfectly straight. As the transformer approaches saturation, the exciting current stops looking like a pure sine wave.',
              },
              {
                eyebrow: 'Triplen',
                title: 'Third harmonics are zero-sequence: all three phases move together',
                text: 'Because the third-harmonic components are co-phasal, they need a neutral or a closed delta path. If that path is missing, the voltage waveform absorbs the distortion.',
              },
              {
                eyebrow: 'Connection effect',
                title: 'The winding connection decides where the problem appears',
                text: 'Delta tends to trap the harmonic internally. Grounded star tends to export it into the neutral. Ungrounded star tends to push it into voltage distortion and neutral shift.',
              },
            ]}
          />

          <FormulaGrid
            items={[
              {
                title: 'Distorted exciting current',
                formula: 'im(t) ≈ I1 sin ωt + I3 sin 3ωt',
                hint: 'The third-harmonic term is the simplest way to see why the current waveform becomes peaky near saturation.',
              },
              {
                title: 'Triplen property',
                formula: 'sin(3ωt), sin(3ωt - 360°), sin(3ωt - 720°)',
                hint: 'All are in phase. That is why the triplen set behaves like a zero-sequence current.',
              },
              {
                title: 'Path question',
                formula: 'No path → voltage distortion',
                hint: 'The key engineering question is not “is there third harmonic?” but “where is it allowed to go?”',
              },
            ]}
          />

          <div style={S.vizWrap}>
            <EquivalentCircuitSvg tests={tests} highlight="harmonics" />
          </div>

          <div style={S.metrics}>
            <MetricCard label="Assessment" value={harmonicAssessment.verdict} note={harmonicAssessment.config.message} color={harmonicAssessment.color} />
            <MetricCard label="Line triplen leakage" value={`${format(harmonicAssessment.lineTriplenPct, 1)} %`} note="How much 3rd harmonic current escapes into the external lines." />
            <MetricCard label="Neutral burden" value={`${format(harmonicAssessment.neutralTriplenPct, 1)} %`} note="Only relevant for grounded-star paths." />
            <MetricCard label="Delta circulating current" value={`${format(harmonicAssessment.deltaCirculatingPct, 1)} %`} note="Useful for waveform cleanup, but it increases internal heating." />
          </div>

          <div style={S.vizWrap}>
            <HarmonicsSvg assessment={harmonicAssessment} />
          </div>

          <div style={S.vizWrap}>
            <HarmonicWaveformsSvg
              triplenPct={triplenPct}
              lineTriplenPct={harmonicAssessment.lineTriplenPct}
              distortionPct={harmonicAssessment.distortionPct}
            />
          </div>

          <div style={{ ...S.panel, paddingTop: 0 }}>
            <div style={{ ...S.sectionTitle, marginBottom: 12 }}>What The Connection Does</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
              <MiniBar label="Voltage distortion risk" value={harmonicAssessment.distortionPct} color="#ef4444" note="Ungrounded Y-Y is worst because current is blocked and voltage distortion absorbs the triplen component." />
              <MiniBar label="Neutral current path" value={harmonicAssessment.neutralTriplenPct} color="#22c55e" note="Grounded star gives the zero-sequence return path." />
              <MiniBar label="Internal delta trapping" value={harmonicAssessment.deltaCirculatingPct} color="#f59e0b" note="Delta windings suppress triplen voltage at the line by carrying the harmonic locally." />
            </div>
          </div>

          <TryThis
            items={[
              'Move from Y-Y ungrounded to Δ-Y at the same triplen severity. The line-side waveform cleans up because the delta gives the harmonic a local loop.',
              'Use grounded Y-Y and raise the triplen severity. Distortion risk falls compared with ungrounded Y-Y, but neutral burden rises.',
              'Remember the engineering question: is the harmonic being blocked, exported, or trapped? That single question explains most of the behaviour on this tab.',
            ]}
          />
        </>
      ) : null}

      {tab === 'theory' ? (
        <div style={S.theory}>
          <h2 style={S.h2}>Why This Simulation Fits Chapman Chapter 2</h2>
          <p style={S.p}>
            This simulation is built around the most useful mental move in transformer theory:
            stop thinking of the transformer as a mysterious magnetic box and start thinking of it as a very ordinary circuit with one magnetic trick inside it.
            Chapman’s Chapter 2 becomes much easier once you keep asking one question:
            <strong style={{ color: '#e4e4e7' }}> which part of the equivalent circuit is active in this situation?</strong>
          </p>

          <div style={S.callout}>
            <span style={S.calloutTitle}>Feynman-Style Shortcut</span>
            <p style={{ ...S.p, margin: 0 }}>
              If you had to explain a transformer to a bright school student, you could say:
              one branch keeps the magnetic field alive all the time, one branch represents the internal drop of the windings, and the rest is just load current responding to that internal circuit.
            </p>
          </div>

          <h3 style={S.h3}>1. The Equivalent Circuit Is The Real Story</h3>
          <p style={S.p}>
            The equivalent circuit is not just a mathematical convenience. It is the cleanest way to separate four very different physical effects:
          </p>
          <ul style={S.ul}>
            <li style={S.li}><strong style={{ color: '#22c55e' }}>Rc</strong>: the core’s real-power appetite. Hysteresis and eddy currents end up here.</li>
            <li style={S.li}><strong style={{ color: '#f59e0b' }}>Xm</strong>: how much reactive current is needed to build flux in the core.</li>
            <li style={S.li}><strong style={{ color: '#f97316' }}>Req</strong>: the winding copper that heats up when load current flows.</li>
            <li style={S.li}><strong style={{ color: '#38bdf8' }}>Xeq</strong>: leakage flux that does not couple perfectly, but still creates internal voltage drop.</li>
          </ul>
          <p style={S.p}>
            Once you see the model that way, most transformer questions become diagnostic:
            “Is this problem about exciting current, copper loss, leakage drop, or switching the core into saturation?”
          </p>

          <h3 style={S.h3}>2. Why The Open-Circuit Test Works</h3>
          <p style={S.p}>
            Open-circuit means the secondary is disconnected, so no useful load current can be delivered. That immediately kills most of the series-branch action.
            The transformer is now like a pump spinning with its outlet closed: it is alive, drawing a little power, but not delivering real output.
          </p>
          <p style={S.p}>
            The small no-load current is not useless. It contains two clues:
            one part <strong style={{ color: '#e4e4e7' }}>Iw</strong> pays for core loss, and another part <strong style={{ color: '#e4e4e7' }}>Im</strong> establishes flux.
            That is why the no-load power factor is poor: the current is mostly doing field-building duty, not real work transfer.
          </p>
          <span style={S.eq}>cos φ₀ = P₀ / (V₀ I₀),   Rc = V₀² / P₀,   Xm = V₀ / Im</span>
          <p style={S.p}>
            Intuition: if <strong style={{ color: '#e4e4e7' }}>P₀</strong> is high, the core is wasting more real power, so <strong style={{ color: '#e4e4e7' }}>Rc</strong> must be lower.
            If <strong style={{ color: '#e4e4e7' }}>Im</strong> is high, it takes more reactive current to make the same flux, so <strong style={{ color: '#e4e4e7' }}>Xm</strong> is lower.
          </p>

          <h3 style={S.h3}>3. Why The Short-Circuit Test Works</h3>
          <p style={S.p}>
            In the short-circuit test the secondary is shorted and you apply only enough voltage to drive rated current. That “only enough voltage” is the key.
            Because the applied voltage is small, the core flux is small too. So the core branch becomes almost irrelevant and the transformer behaves mainly like a series impedance.
          </p>
          <p style={S.p}>
            This is beautiful experimentally: you do not need a destructive full-voltage fault test to learn short-circuit behaviour.
            A small applied voltage is enough to reveal the internal drop characteristics safely.
          </p>
          <span style={S.eq}>Zeq = Vsc / Irated,   Req = Psc / I²rated,   Xeq = √(Z²eq - R²eq)</span>
          <p style={S.p}>
            Intuition: if it takes more voltage to push rated current, then internal impedance must be larger. If the wattmeter reading is larger, then more of that impedance must be resistive.
            Whatever remains after removing the resistive part is leakage reactance.
          </p>

          <h3 style={S.h3}>4. Load Behaviour: Why Different Loads “Feel” Different</h3>
          <p style={S.p}>
            Once the equivalent circuit is known, the transformer’s response to load becomes almost obvious. The current flowing through <strong style={{ color: '#e4e4e7' }}>Req</strong> and <strong style={{ color: '#e4e4e7' }}>Xeq</strong>
            creates internal drop before the load sees its terminal voltage.
          </p>
          <p style={S.p}>
            A purely resistive load makes current line up with voltage, so only the “straightforward” drop matters. A lagging motor load tilts the current into the reactive direction,
            and then the leakage reactance starts hurting much more. A leading load tilts the current the other way and can partially cancel the reactive drop.
          </p>
          <span style={S.eq}>VR ≈ x(Rpu cos φ ± Xpu sin φ) × 100%</span>
          <span style={S.eq}>η = Output / (Output + Pcore + x²Pcu,rated)</span>
          <p style={S.p}>
            Two intuitive rules are worth memorising:
          </p>
          <ul style={S.ul}>
            <li style={S.li}>Core loss is nearly fixed once voltage and frequency are fixed.</li>
            <li style={S.li}>Copper loss depends on current squared, so overload makes heating rise very quickly.</li>
          </ul>

          <h3 style={S.h3}>5. Inrush: The Core Is An Integrator With Memory</h3>
          <p style={S.p}>
            Inrush is one of those topics that becomes easy once you say the right sentence:
            <strong style={{ color: '#e4e4e7' }}> voltage sets the slope of flux, not the flux directly.</strong>
            Since flux is the integral of voltage, the starting point matters enormously.
          </p>
          <span style={S.eq}>φ(t) = φr + cos α - cos(ωt + α)</span>
          <p style={S.p}>
            If you close at the wrong instant, the new flux waveform can be shifted by a dc offset. If the old residual flux is already sitting in the same direction,
            the first peak can be well above the normal 1 pu operating level. That pushes the core into saturation. Once saturation begins, the magnetising branch stops acting like a gentle reactance and starts demanding a huge current.
          </p>
          <p style={S.p}>
            That is why the worst case is usually near voltage-zero closing, not voltage-peak closing. The paradox disappears once you remember that flux comes from the integral of voltage.
          </p>

          <h3 style={S.h3}>6. Third-Harmonic Issue: The Real Question Is Path</h3>
          <p style={S.p}>
            Third harmonic in transformers is often taught as a “waveform distortion” fact, but the engineering insight is simpler:
            the core creates triplen components, and the winding connection decides where they go.
          </p>
          <p style={S.p}>
            Triplen harmonics (3rd, 9th, 15th, ...) are zero-sequence components, which means they are in phase across all three phases.
            So unlike the fundamental set, they cannot simply cancel in the usual way.
          </p>
          <ul style={S.ul}>
            <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Y-Y ungrounded</strong>: no easy path, so voltage distortion and neutral shift become the visible symptom.</li>
            <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Y-Y grounded</strong>: the harmonic can return through the neutral, which reduces voltage distortion but raises neutral current.</li>
            <li style={S.li}><strong style={{ color: '#e4e4e7' }}>Any delta present</strong>: the harmonic tends to circulate inside the delta loop, cleaning up the line-side waveform at the cost of internal circulating current.</li>
          </ul>
          <p style={S.p}>
            So the intuitive question is: <strong style={{ color: '#e4e4e7' }}>is the third harmonic blocked, exported, or trapped?</strong>
            That single question explains most of the connection behaviour.
          </p>

          <h3 style={S.h3}>7. A Fast Diagnostic Map</h3>
          <ul style={S.ul}>
            <li style={S.li}>High no-load current but small load current concern: think <strong style={{ color: '#e4e4e7' }}>Xm</strong> and core condition.</li>
            <li style={S.li}>High no-load watt loss: think <strong style={{ color: '#e4e4e7' }}>Rc</strong> and core-loss mechanisms.</li>
            <li style={S.li}>Poor regulation under lagging loads: think <strong style={{ color: '#e4e4e7' }}>Xeq</strong>.</li>
            <li style={S.li}>Excessive heating at high current: think <strong style={{ color: '#e4e4e7' }}>Req</strong> and copper loss.</li>
            <li style={S.li}>Huge first-cycle current after switching: think <strong style={{ color: '#e4e4e7' }}>remanence + closing angle + saturation</strong>.</li>
            <li style={S.li}>Distorted voltage or suspicious neutral current: think <strong style={{ color: '#e4e4e7' }}>triplen path</strong>.</li>
          </ul>

          <div style={S.callout}>
            <span style={S.calloutTitle}>What To Remember After Closing The Book</span>
            <p style={{ ...S.p, margin: 0 }}>
              OC test tells you how the core behaves at normal voltage. SC test tells you how the windings behave at normal current.
              Those two experiments assemble the equivalent circuit. After that, load regulation, efficiency, inrush intuition, and harmonic behaviour all become
              different ways of interrogating the same model.
            </p>
          </div>

          <div style={S.callout}>
            <span style={S.calloutTitle}>Model Limits</span>
            <p style={{ ...S.p, margin: 0 }}>
              The test-based equivalent-circuit part is close to the classical textbook model. The inrush and harmonic tabs are deliberately simplified and meant to
              build intuition, not replace EMT simulation, detailed B-H data, or protection settings calculations.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
