import React, { useMemo, useState } from 'react';

const S = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 3.5rem)',
    background: '#09090b',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#e4e4e7',
  },
  tabBar: {
    display: 'flex',
    gap: 4,
    padding: '12px 24px',
    background: '#0a0a0f',
    borderBottom: '1px solid #1e1e2e',
  },
  tab: (active) => ({
    padding: '8px 18px',
    borderRadius: 10,
    border: 'none',
    background: active ? '#6366f1' : 'transparent',
    color: active ? '#ffffff' : '#71717a',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }),
  simBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  hero: {
    padding: '22px 24px 16px',
    background: 'linear-gradient(180deg, rgba(99,102,241,0.08), rgba(9,9,11,0))',
    borderBottom: '1px solid #1a1a23',
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: '#f4f4f5',
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 1.7,
    color: '#a1a1aa',
    margin: '10px 0 0',
    maxWidth: 960,
  },
  presetRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    padding: '16px 24px',
    background: '#0b0b10',
    borderBottom: '1px solid #17171e',
  },
  presetBtn: (active) => ({
    padding: '10px 14px',
    borderRadius: 12,
    border: `1px solid ${active ? '#6366f1' : '#27272a'}`,
    background: active ? 'rgba(99,102,241,0.14)' : '#111114',
    color: active ? '#c7d2fe' : '#a1a1aa',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    transition: 'all 0.2s ease',
  }),
  presetMeta: {
    padding: '14px 24px 0',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 14,
  },
  modeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    padding: '10px 24px 0',
  },
  modeBtn: (active) => ({
    padding: '8px 12px',
    borderRadius: 999,
    border: `1px solid ${active ? '#6366f1' : '#27272a'}`,
    background: active ? 'rgba(99,102,241,0.14)' : '#101015',
    color: active ? '#c7d2fe' : '#a1a1aa',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  }),
  card: {
    background: '#111114',
    border: '1px solid #1f1f28',
    borderRadius: 18,
    padding: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#818cf8',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 1.7,
    color: '#a1a1aa',
    margin: 0,
  },
  statusBadge: (tone) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 999,
    border: `1px solid ${tone.border}`,
    background: tone.bg,
    color: tone.text,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  }),
  metricStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 12,
    padding: '16px 24px',
  },
  metric: {
    padding: '14px 16px',
    background: '#0e0e13',
    border: '1px solid #1b1b24',
    borderRadius: 14,
  },
  metricLabel: {
    fontSize: 11,
    color: '#52525b',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 700,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 800,
    color: '#f4f4f5',
    letterSpacing: '-0.02em',
  },
  metricSub: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 6,
    lineHeight: 1.5,
  },
  panelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: 16,
    padding: '0 24px 18px',
  },
  controlGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
    padding: '0 24px 28px',
  },
  controlCard: {
    background: '#0d0d12',
    border: '1px solid #1b1b24',
    borderRadius: 18,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#e4e4e7',
    margin: 0,
  },
  sectionHint: {
    fontSize: 12,
    color: '#71717a',
    margin: '6px 0 14px',
    lineHeight: 1.55,
  },
  sliderWrap: {
    marginBottom: 16,
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 7,
  },
  sliderLabel: {
    fontSize: 13,
    color: '#d4d4d8',
    fontWeight: 500,
  },
  sliderValue: {
    fontSize: 12,
    color: '#a5b4fc',
    fontWeight: 700,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  slider: {
    width: '100%',
    accentColor: '#6366f1',
    cursor: 'pointer',
  },
  optionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  optionBtn: (active) => ({
    padding: '7px 12px',
    borderRadius: 10,
    border: `1px solid ${active ? '#6366f1' : '#27272a'}`,
    background: active ? 'rgba(99,102,241,0.16)' : '#111114',
    color: active ? '#c7d2fe' : '#a1a1aa',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  }),
  note: {
    marginTop: 14,
    padding: '12px 14px',
    borderRadius: 12,
    background: 'rgba(99,102,241,0.08)',
    borderLeft: '3px solid #6366f1',
    fontSize: 13,
    lineHeight: 1.7,
    color: '#cbd5e1',
  },
  theory: {
    flex: 1,
    padding: '30px 24px 36px',
    maxWidth: 900,
    width: '100%',
    margin: '0 auto',
  },
  h2: {
    fontSize: 24,
    fontWeight: 800,
    color: '#f4f4f5',
    margin: '0 0 14px',
    letterSpacing: '-0.02em',
  },
  h3: {
    fontSize: 18,
    fontWeight: 700,
    color: '#e4e4e7',
    margin: '28px 0 10px',
  },
  p: {
    fontSize: 15,
    lineHeight: 1.8,
    color: '#a1a1aa',
    margin: '0 0 14px',
  },
  eq: {
    display: 'block',
    margin: '16px 0',
    padding: '14px 18px',
    borderRadius: 14,
    border: '1px solid #262633',
    background: '#13131a',
    color: '#c4b5fd',
    fontSize: 14,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    overflowX: 'auto',
  },
  ul: {
    paddingLeft: 20,
    margin: '10px 0 14px',
  },
  li: {
    fontSize: 14,
    lineHeight: 1.8,
    color: '#a1a1aa',
    marginBottom: 4,
  },
};

const TWO_PI = Math.PI * 2;
const STEP_TIME = 1;
const SIM_TIME = 12;
const DT = 0.01;
const UFLS_STAGES = [
  { thresholdPu: 0.984, amount: 0.05, dwell: 0.14, label: 'UFLS-1' },
  { thresholdPu: 0.98, amount: 0.05, dwell: 0.14, label: 'UFLS-2' },
  { thresholdPu: 0.976, amount: 0.1, dwell: 0.12, label: 'UFLS-3' },
  { thresholdPu: 0.972, amount: 0.1, dwell: 0.1, label: 'UFLS-4' },
];

const STATUS_TONES = {
  secure: { border: '#22c55e', bg: 'rgba(34,197,94,0.12)', text: '#86efac' },
  stressed: { border: '#f59e0b', bg: 'rgba(245,158,11,0.12)', text: '#fcd34d' },
  emergency: { border: '#ef4444', bg: 'rgba(239,68,68,0.12)', text: '#fca5a5' },
  blackout: { border: '#dc2626', bg: 'rgba(127,29,29,0.28)', text: '#fecaca' },
};

const PRESETS = {
  securePeak: {
    label: 'Evening peak, secure',
    note: 'A moderate evening disturbance is absorbed because transfer margin, inertia, and reserves are still healthy.',
    params: {
      baseFreq: 50,
      eventType: 'lineTrip',
      Pm0: 0.82,
      PmaxPre: 1.65,
      PmaxFault: 0.12,
      PmaxPost: 1.36,
      clearTime: 0.14,
      Hrotor: 4.8,
      Drotor: 1.0,
      netDeficit: 0.08,
      Hsys: 5.8,
      loadDamping: 1.1,
      droopPct: 4.5,
      govTime: 0.55,
      reserveCap: 0.16,
      uflsEnabled: true,
    },
  },
  generatorTrip: {
    label: 'Large generator trip',
    note: 'A major unit outage drives a deep frequency dip. Primary response arrests the fall, and UFLS may need to act.',
    params: {
      baseFreq: 50,
      eventType: 'normal',
      Pm0: 0.78,
      PmaxPre: 1.6,
      PmaxFault: 0.1,
      PmaxPost: 1.6,
      clearTime: 0.16,
      Hrotor: 4.4,
      Drotor: 1.15,
      netDeficit: 0.22,
      Hsys: 4.8,
      loadDamping: 1.0,
      droopPct: 4.0,
      govTime: 0.6,
      reserveCap: 0.17,
      uflsEnabled: true,
    },
  },
  lowInertia: {
    label: 'Low inertia evening ramp',
    note: 'Same size imbalance, but with less stored kinetic energy the initial RoCoF is sharper and the nadir is lower.',
    params: {
      baseFreq: 50,
      eventType: 'lineTrip',
      Pm0: 0.8,
      PmaxPre: 1.55,
      PmaxFault: 0.12,
      PmaxPost: 1.28,
      clearTime: 0.15,
      Hrotor: 3.2,
      Drotor: 0.85,
      netDeficit: 0.15,
      Hsys: 3.4,
      loadDamping: 0.85,
      droopPct: 5.0,
      govTime: 0.7,
      reserveCap: 0.14,
      uflsEnabled: true,
    },
  },
  fastFault: {
    label: '3-phase fault, cleared in time',
    note: 'A severe fault nearly collapses air-gap power during fault-on time, but fast clearing keeps the machine inside the critical clearing margin.',
    params: {
      baseFreq: 50,
      eventType: 'fault',
      Pm0: 0.9,
      PmaxPre: 1.7,
      PmaxFault: 0.05,
      PmaxPost: 1.28,
      clearTime: 0.15,
      Hrotor: 4.1,
      Drotor: 0.9,
      netDeficit: 0.07,
      Hsys: 5.0,
      loadDamping: 1.0,
      droopPct: 4.5,
      govTime: 0.55,
      reserveCap: 0.15,
      uflsEnabled: false,
    },
  },
  delayedFault: {
    label: 'Delayed clearing, blackout risk',
    note: 'Fault clearing is late, post-fault transfer is weak, and the system also faces a net MW deficit. Rotor angle and frequency both move into emergency territory.',
    params: {
      baseFreq: 50,
      eventType: 'fault',
      Pm0: 0.96,
      PmaxPre: 1.72,
      PmaxFault: 0.04,
      PmaxPost: 1.14,
      clearTime: 0.34,
      Hrotor: 3.7,
      Drotor: 0.7,
      netDeficit: 0.16,
      Hsys: 3.8,
      loadDamping: 0.8,
      droopPct: 5.5,
      govTime: 0.78,
      reserveCap: 0.12,
      uflsEnabled: true,
    },
  },
  sixtyHz: {
    label: '60 Hz interconnection study',
    note: 'Same textbook mechanisms, but shown on a 60 Hz system so the user can relate the case to North American operations too.',
    params: {
      baseFreq: 60,
      eventType: 'lineTrip',
      Pm0: 0.84,
      PmaxPre: 1.62,
      PmaxFault: 0.08,
      PmaxPost: 1.26,
      clearTime: 0.14,
      Hrotor: 4.6,
      Drotor: 1.0,
      netDeficit: 0.1,
      Hsys: 5.2,
      loadDamping: 1.0,
      droopPct: 4.5,
      govTime: 0.58,
      reserveCap: 0.17,
      uflsEnabled: true,
    },
  },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(min, max, ratio) {
  return min + (max - min) * ratio;
}

function inverseLerp(min, max, value) {
  if (max === min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function formatPu(value) {
  return `${value.toFixed(2)} pu`;
}

function describeBand(score, low, mid, high) {
  if (score < 0.34) return low;
  if (score < 0.67) return mid;
  return high;
}

function getBackupScore(params) {
  const reserveScore = inverseLerp(0.08, 0.24, params.reserveCap);
  const governorScore = 1 - inverseLerp(0.35, 0.9, params.govTime);
  const droopScore = 1 - inverseLerp(3.5, 6.0, params.droopPct);
  return (reserveScore + governorScore + droopScore) / 3;
}

function getTone(status) {
  return STATUS_TONES[status] || STATUS_TONES.stressed;
}

function buildPath(points) {
  if (!points.length) return '';
  return points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ');
}

function sampleAtTime(trace, t) {
  if (!trace.length) return null;
  const index = clamp(Math.round(t / DT), 0, trace.length - 1);
  return trace[index];
}

function getRotorPmax(params, t) {
  if (params.eventType === 'normal' || t < STEP_TIME) {
    return params.PmaxPre;
  }

  if (params.eventType === 'lineTrip') {
    return params.PmaxPost;
  }

  if (params.eventType === 'fault') {
    return t < STEP_TIME + params.clearTime ? params.PmaxFault : params.PmaxPost;
  }

  return params.PmaxPre;
}

function runRotorModel(params, { track = true, totalTime = SIM_TIME, dt = DT } = {}) {
  const omegaBase = TWO_PI * params.baseFreq;
  const startRatio = clamp(params.Pm0 / Math.max(params.PmaxPre, 0.001), -0.98, 0.98);
  let delta = Math.asin(startRatio);
  let speedDev = 0;
  let unstable = false;
  let peakAngleDeg = (delta * 180) / Math.PI;
  let maxSlip = 0;
  const trace = [];

  for (let t = 0; t <= totalTime + 1e-9; t += dt) {
    const pmax = getRotorPmax(params, t);
    const pe = pmax * Math.sin(delta);
    const pa = params.Pm0 - pe - params.Drotor * speedDev;

    if (track) {
      trace.push({
        t,
        angleDeg: (delta * 180) / Math.PI,
        speedDev,
        machineFreq: params.baseFreq * (1 + speedDev),
        pe,
        pa,
        pmax,
      });
    }

    peakAngleDeg = Math.max(peakAngleDeg, (delta * 180) / Math.PI);
    maxSlip = Math.max(maxSlip, Math.abs(speedDev));

    if (Math.abs(delta) > Math.PI || Math.abs(speedDev) > 0.35) {
      unstable = true;
      if (!track) break;
    }

    speedDev += (pa / (2 * params.Hrotor)) * dt;
    delta += omegaBase * speedDev * dt;
  }

  const postRatio = params.Pm0 / Math.max(params.PmaxPost, 0.001);
  const postStableAngleDeg = Math.abs(postRatio) < 1 ? (Math.asin(postRatio) * 180) / Math.PI : null;
  const unstableBoundaryDeg = postStableAngleDeg === null ? null : 180 - postStableAngleDeg;
  const endSample = trace.length ? trace[trace.length - 1] : null;

  return {
    trace,
    unstable,
    peakAngleDeg,
    maxSlip,
    postStableAngleDeg,
    unstableBoundaryDeg,
    startAngleDeg: (Math.asin(startRatio) * 180) / Math.PI,
    endAngleDeg: endSample ? endSample.angleDeg : null,
  };
}

function estimateCriticalClearingTime(params) {
  if (params.eventType !== 'fault') return null;
  let lastStable = null;
  for (let ct = 0.05; ct <= 0.5 + 1e-9; ct += 0.01) {
    const result = runRotorModel({ ...params, clearTime: round(ct, 2) }, { track: false, totalTime: 8, dt: 0.01 });
    if (result.unstable) break;
    lastStable = ct;
  }
  return lastStable === null ? null : round(lastStable, 2);
}

function runFrequencyModel(params, { totalTime = SIM_TIME, dt = DT } = {}) {
  let deltaFpu = 0;
  let governorPower = 0;
  let shed = 0;
  const stageTimers = UFLS_STAGES.map(() => 0);
  const stageTrips = [];
  const trace = [];
  let nadirHz = params.baseFreq;
  let governorPeak = 0;
  let reserveSaturated = false;
  let minDfDt = 0;
  let blackout = false;

  for (let t = 0; t <= totalTime + 1e-9; t += dt) {
    const activeDeficit = t >= STEP_TIME ? params.netDeficit : 0;
    const freqHz = params.baseFreq * (1 + deltaFpu);

    if (params.uflsEnabled) {
      UFLS_STAGES.forEach((stage, index) => {
        if (stageTrips[index]) return;
        if (1 + deltaFpu < stage.thresholdPu) {
          stageTimers[index] += dt;
          if (stageTimers[index] >= stage.dwell) {
            shed += stage.amount;
            stageTrips[index] = { ...stage, time: round(t, 2) };
          }
        } else {
          stageTimers[index] = 0;
        }
      });
    }

    const droopGain = 1 / (params.droopPct / 100);
    const governorCmd = clamp(-droopGain * deltaFpu, 0, params.reserveCap);
    governorPower += ((governorCmd - governorPower) / params.govTime) * dt;
    reserveSaturated = reserveSaturated || governorCmd >= params.reserveCap - 1e-4;

    const dfDt = (governorPower - activeDeficit - params.loadDamping * deltaFpu + shed) / (2 * params.Hsys);
    deltaFpu += dfDt * dt;

    const updatedFreq = params.baseFreq * (1 + deltaFpu);
    nadirHz = Math.min(nadirHz, updatedFreq);
    governorPeak = Math.max(governorPeak, governorPower);
    minDfDt = Math.min(minDfDt, dfDt * params.baseFreq);

    if (updatedFreq < params.baseFreq * 0.94) {
      blackout = true;
    }

    trace.push({
      t,
      freqHz: updatedFreq,
      deltaFpu,
      governorPower,
      activeDeficit,
      netDemandAfterControls: activeDeficit + params.loadDamping * deltaFpu - shed,
      shed,
      rocof: dfDt * params.baseFreq,
    });
  }

  const finalSample = trace[trace.length - 1];

  return {
    trace,
    nadirHz,
    finalHz: finalSample.freqHz,
    governorPeak,
    loadShed: shed,
    reserveSaturated,
    minRoCoF: minDfDt,
    blackout,
    stageTrips,
  };
}

function deriveOverallStatus(rotor, frequency, params, cct) {
  if (rotor.unstable || frequency.blackout) {
    return 'blackout';
  }

  const cctMargin = cct === null || params.eventType !== 'fault' ? null : cct - params.clearTime;
  if (
    frequency.nadirHz < params.baseFreq * 0.975 ||
    frequency.loadShed > 0 ||
    (cctMargin !== null && cctMargin < 0.03) ||
    (rotor.unstableBoundaryDeg !== null && rotor.peakAngleDeg > rotor.unstableBoundaryDeg - 8)
  ) {
    return 'emergency';
  }

  if (
    frequency.nadirHz < params.baseFreq * 0.988 ||
    frequency.reserveSaturated ||
    (rotor.postStableAngleDeg !== null && rotor.peakAngleDeg > rotor.postStableAngleDeg + 35)
  ) {
    return 'stressed';
  }

  return 'secure';
}

function describeStatus(status) {
  if (status === 'blackout') return 'Loss of synchronism or deep under-frequency collapse is indicated.';
  if (status === 'emergency') return 'The system survives only with narrow margins or emergency action.';
  if (status === 'stressed') return 'The disturbance is contained, but margins are not comfortable.';
  return 'Rotor angle, frequency, and reserve behavior remain within acceptable bounds.';
}

function SliderControl({ label, value, min, max, step, formatter, onChange, disabled = false }) {
  return (
    <div style={{ ...S.sliderWrap, opacity: disabled ? 0.45 : 1 }}>
      <div style={S.sliderRow}>
        <span style={S.sliderLabel}>{label}</span>
        <span style={S.sliderValue}>{formatter ? formatter(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        style={S.slider}
      />
    </div>
  );
}

function buildStorySteps(params, rotor, frequency, status, cct) {
  const loadingRatio = params.Pm0 / Math.max(params.PmaxPre, 0.001);
  const postRatio = params.PmaxPost / Math.max(params.PmaxPre, 0.001);
  const cctMargin = cct === null || params.eventType !== 'fault' ? null : cct - params.clearTime;
  const steps = [];

  steps.push({
    title: 'Before the event',
    body: `The generator is carrying about ${(loadingRatio * 100).toFixed(0)}% of its pre-disturbance transfer strength. Turbine push and electrical pull are balanced, so the machine stays locked in step and the grid sits at ${params.baseFreq} Hz.`,
  });

  if (params.eventType === 'fault') {
    steps.push({
      title: 'At the disturbance',
      body: `A fault at 1.0 s almost chokes the electrical path. The grid can pull only ${params.PmaxFault.toFixed(2)} pu during the fault. Breakers clear it after ${params.clearTime.toFixed(2)} s, but even then only ${(postRatio * 100).toFixed(0)}% of the original transfer strength remains.`,
    });
  } else if (params.eventType === 'lineTrip') {
    steps.push({
      title: 'At the disturbance',
      body: `A major line is lost at 1.0 s. The machine is still tied to the grid, but the network is weaker. Its electrical pulling strength falls from ${params.PmaxPre.toFixed(2)} pu to ${params.PmaxPost.toFixed(2)} pu.`,
    });
  } else {
    steps.push({
      title: 'At the disturbance',
      body: `There is no rotor-network fault here. Instead, the system suddenly becomes short of generation by ${params.netDeficit.toFixed(2)} pu, which shows up first as a frequency problem rather than a transfer-path problem.`,
    });
  }

  steps.push({
    title: 'What the machine feels',
    body: `If push is briefly larger than pull, the rotor runs ahead. In this case delta peaks at ${rotor.peakAngleDeg.toFixed(1)} degrees${rotor.unstableBoundaryDeg !== null ? `, while the unstable boundary is around ${rotor.unstableBoundaryDeg.toFixed(1)} degrees.` : '.'}`,
  });

  steps.push({
    title: 'What the grid feels',
    body: `The overall grid is short by ${params.netDeficit.toFixed(2)} pu, so frequency falls to ${frequency.nadirHz.toFixed(2)} Hz. Governors add up to ${frequency.governorPeak.toFixed(2)} pu${frequency.stageTrips.length ? `, and UFLS sheds ${(frequency.loadShed * 100).toFixed(0)}% of load in ${frequency.stageTrips.length} step(s).` : params.uflsEnabled ? ', but no load shedding is needed.' : ', and load shedding is disabled.'}`,
  });

  let ending =
    status === 'secure'
      ? 'The grid has enough magnetic pull, spinning mass, and reserve response to ride through the event.'
      : status === 'stressed'
        ? 'The event is survivable, but the cushion is not generous. A slightly worse disturbance would push the system into emergency territory.'
        : status === 'emergency'
          ? 'The system survives only with a narrow margin or with emergency action. Operators would treat this as an unstable operating posture.'
          : 'Either the rotor slips out of step or frequency falls into collapse territory. This is the kind of path that can grow into a blackout.';

  if (cctMargin !== null) {
    ending += ` Fault-clearing margin is ${cctMargin >= 0 ? '+' : ''}${cctMargin.toFixed(2)} s relative to the estimated critical clearing time.`;
  }

  steps.push({
    title: 'Big lesson',
    body: ending,
  });

  return steps;
}

function SimpleMeter({ label, value, max, color, valueText, hint }) {
  const fill = max <= 0 ? 0 : clamp(value / max, 0, 1);
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 14,
        background: '#0d0d12',
        border: '1px solid #1b1b24',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#e4e4e7', fontWeight: 600 }}>{label}</span>
        <span
          style={{
            fontSize: 12,
            color,
            fontWeight: 800,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}
        >
          {valueText}
        </span>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: '#1f2937', overflow: 'hidden' }}>
        <div
          style={{
            width: `${(fill * 100).toFixed(0)}%`,
            height: '100%',
            borderRadius: 999,
            background: color,
          }}
        />
      </div>
      <div style={{ fontSize: 12, color: '#71717a', marginTop: 8, lineHeight: 1.55 }}>{hint}</div>
    </div>
  );
}

function IntuitionBoard({ params, rotor, frequency, status, cct }) {
  const pullDuring = params.eventType === 'fault' ? params.PmaxFault : params.PmaxPost;
  const backupScore = getBackupScore(params);
  const steps = buildStorySteps(params, rotor, frequency, status, cct);
  const loadingRatio = params.Pm0 / Math.max(params.PmaxPre, 0.001);

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>Feynman view</div>
      <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.75, marginBottom: 14 }}>
        Think of the grid as many heavy spinning wheels tied together by magnetic springs. The turbine keeps pushing
        one wheel forward. The rest of the grid pulls it back into step. Trouble starts when the push suddenly becomes
        stronger than the pull, or when the whole grid becomes short of generation and everyone slows down together.
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {[
          'Turbine push = mechanical input',
          'Grid pull = electrical output path',
          'Spinning mass = inertia buffer',
          'Fast backup = governors + reserves',
        ].map((item) => (
          <span
            key={item}
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              border: '1px solid #27272a',
              background: '#101015',
              color: '#a1a1aa',
              fontSize: 12,
            }}
          >
            {item}
          </span>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.05fr) minmax(280px, 1fr)',
          gap: 16,
        }}
      >
        <div style={{ display: 'grid', gap: 10 }}>
          <SimpleMeter
            label="Turbine push"
            value={params.Pm0}
            max={1.8}
            color="#818cf8"
            valueText={`${params.Pm0.toFixed(2)} pu`}
            hint={`The prime mover is pushing at about ${(loadingRatio * 100).toFixed(0)}% of the pre-disturbance transfer capability.`}
          />
          <SimpleMeter
            label="Grid pull before the event"
            value={params.PmaxPre}
            max={1.8}
            color="#60a5fa"
            valueText={`${params.PmaxPre.toFixed(2)} pu`}
            hint="This is how much electrical power the intact network can transmit at full power-angle leverage."
          />
          <SimpleMeter
            label={params.eventType === 'fault' ? 'Grid pull during the fault' : 'Grid pull after the event'}
            value={pullDuring}
            max={1.8}
            color={params.eventType === 'fault' ? '#ef4444' : '#f59e0b'}
            valueText={`${pullDuring.toFixed(2)} pu`}
            hint={
              params.eventType === 'fault'
                ? 'During the fault, the electrical path is badly pinched, so the grid cannot pull much power out of the machine.'
                : 'After the disturbance, the network is weaker than before, so the machine has less synchronizing pull available.'
            }
          />
          {params.eventType === 'fault' ? (
            <SimpleMeter
              label="Grid pull after clearing"
              value={params.PmaxPost}
              max={1.8}
              color="#f59e0b"
              valueText={`${params.PmaxPost.toFixed(2)} pu`}
              hint="Even after clearing, the network may still be weaker because a line or corridor is out of service."
            />
          ) : null}
          <SimpleMeter
            label="Spinning mass"
            value={(params.Hrotor + params.Hsys) / 2}
            max={7}
            color="#22c55e"
            valueText={`${((params.Hrotor + params.Hsys) / 2).toFixed(1)} s`}
            hint="More stored kinetic energy means the system resists sudden speed changes and buys time for controls to act."
          />
          <SimpleMeter
            label="Fast backup"
            value={backupScore}
            max={1}
            color="#38bdf8"
            valueText={describeBand(backupScore, 'weak', 'fair', 'strong')}
            hint="This combines governor droop, response speed, and available primary reserve into one plain-language cue."
          />
          <SimpleMeter
            label="Supply-demand gap"
            value={params.netDeficit}
            max={0.28}
            color="#f97316"
            valueText={`${(params.netDeficit * 100).toFixed(0)}%`}
            hint="This is the immediate power shortage the wider grid must absorb after the event."
          />
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {steps.map((step, index) => (
            <div
              key={step.title}
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: index === steps.length - 1 ? 'rgba(99,102,241,0.1)' : '#0d0d12',
                border: `1px solid ${index === steps.length - 1 ? '#3730a3' : '#1b1b24'}`,
              }}
            >
              <div style={{ fontSize: 12, color: '#818cf8', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                {index + 1}. {step.title}
              </div>
              <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.75 }}>{step.body}</div>
            </div>
          ))}

          <div style={{ padding: '12px 14px', borderRadius: 14, background: '#0d0d12', border: '1px dashed #2d2d39' }}>
            <div style={{ fontSize: 12, color: '#71717a', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
              What to watch first
            </div>
            <div style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.75 }}>
              If you only watch three things, watch these: peak rotor angle, frequency nadir, and whether reserve or UFLS had to save the system. Those three numbers tell the story faster than the full equations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PowerAngleChart({ params, rotor }) {
  const W = 520;
  const H = 280;
  const ML = 56;
  const MR = 18;
  const MT = 22;
  const MB = 44;
  const PW = W - ML - MR;
  const PH = H - MT - MB;
  const yMax = Math.max(params.PmaxPre, params.PmaxPost, params.PmaxFault, params.Pm0) * 1.2;
  const x = (deg) => ML + (deg / 180) * PW;
  const y = (val) => MT + PH - (val / yMax) * PH;

  const curve = (pmax) =>
    buildPath(
      Array.from({ length: 181 }, (_, deg) => [x(deg), y(pmax * Math.sin((deg * Math.PI) / 180))]),
    );

  const clearingSample = params.eventType === 'fault' ? sampleAtTime(rotor.trace, STEP_TIME + params.clearTime) : null;
  const peakX = x(clamp(rotor.peakAngleDeg, 0, 180));
  const peakY = y(params.PmaxPost * Math.sin((clamp(rotor.peakAngleDeg, 0, 180) * Math.PI) / 180));

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>Power-angle view</div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <rect x="0" y="0" width={W} height={H} rx="16" fill="#0c0c11" stroke="#1d1d27" />

        {Array.from({ length: 6 }, (_, index) => {
          const v = (yMax / 5) * index;
          return (
            <g key={`y-${index}`}>
              <line x1={ML} y1={y(v)} x2={W - MR} y2={y(v)} stroke="#181822" strokeWidth="0.8" />
              <text x={ML - 6} y={y(v) + 3} textAnchor="end" fontSize="10" fill="#52525b">
                {v.toFixed(1)}
              </text>
            </g>
          );
        })}

        {[0, 30, 60, 90, 120, 150, 180].map((deg) => (
          <g key={`x-${deg}`}>
            <line x1={x(deg)} y1={MT} x2={x(deg)} y2={MT + PH} stroke="#181822" strokeWidth="0.8" />
            <text x={x(deg)} y={H - 14} textAnchor="middle" fontSize="10" fill="#52525b">
              {deg}
            </text>
          </g>
        ))}

        {rotor.unstableBoundaryDeg !== null && rotor.unstableBoundaryDeg < 180 && (
          <>
            <rect
              x={x(rotor.unstableBoundaryDeg)}
              y={MT}
              width={x(180) - x(rotor.unstableBoundaryDeg)}
              height={PH}
              fill="rgba(239,68,68,0.06)"
            />
            <line
              x1={x(rotor.unstableBoundaryDeg)}
              y1={MT}
              x2={x(rotor.unstableBoundaryDeg)}
              y2={MT + PH}
              stroke="#ef4444"
              strokeDasharray="6 4"
              strokeWidth="1.1"
            />
            <text x={x(rotor.unstableBoundaryDeg) + 6} y={MT + 12} fontSize="9" fill="#fca5a5">
              unstable boundary
            </text>
          </>
        )}

        <path d={curve(params.PmaxPre)} fill="none" stroke="#60a5fa" strokeWidth="2.3" />
        {params.eventType === 'fault' && (
          <path d={curve(params.PmaxFault)} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" />
        )}
        <path d={curve(params.PmaxPost)} fill="none" stroke="#f59e0b" strokeWidth="2.3" />

        <line x1={ML} y1={y(params.Pm0)} x2={W - MR} y2={y(params.Pm0)} stroke="#a5b4fc" strokeDasharray="5 4" />
        <text x={W - MR - 4} y={y(params.Pm0) - 6} textAnchor="end" fontSize="10" fill="#a5b4fc">
          Pm = {params.Pm0.toFixed(2)} pu
        </text>

        <circle cx={x(rotor.startAngleDeg)} cy={y(params.Pm0)} r="4.5" fill="#60a5fa" />
        <text x={x(rotor.startAngleDeg) + 8} y={y(params.Pm0) - 6} fontSize="10" fill="#93c5fd">
          pre-event
        </text>

        {clearingSample && (
          <>
            <circle cx={x(clamp(clearingSample.angleDeg, 0, 180))} cy={y(clearingSample.pe)} r="4.5" fill="#ef4444" />
            <text
              x={x(clamp(clearingSample.angleDeg, 0, 180)) + 8}
              y={y(clearingSample.pe) + 14}
              fontSize="10"
              fill="#fca5a5"
            >
              clearing point
            </text>
          </>
        )}

        {rotor.postStableAngleDeg !== null && (
          <>
            <circle cx={x(rotor.postStableAngleDeg)} cy={y(params.Pm0)} r="4.5" fill="#f59e0b" />
            <text x={x(rotor.postStableAngleDeg) + 8} y={y(params.Pm0) - 6} fontSize="10" fill="#fcd34d">
              post-event eq
            </text>
          </>
        )}

        <circle cx={peakX} cy={peakY} r="4.5" fill="#f472b6" />
        <text x={peakX + 8} y={peakY + 14} fontSize="10" fill="#f9a8d4">
          peak delta
        </text>

        <line x1={ML} y1={MT + PH} x2={W - MR} y2={MT + PH} stroke="#3f3f46" />
        <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="#3f3f46" />
        <text x={16} y={MT + PH / 2} fontSize="10" fill="#52525b" transform={`rotate(-90 16 ${MT + PH / 2})`}>
          Electrical power (pu)
        </text>
        <text x={ML + PW / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="#52525b">
          Rotor angle delta (electrical deg)
        </text>
      </svg>
    </div>
  );
}

function TimeSeriesChart({ title, subtitle, data, series, yDomain, thresholds = [], markers = [] }) {
  const W = 520;
  const H = 260;
  const ML = 54;
  const MR = 18;
  const MT = 26;
  const MB = 42;
  const PW = W - ML - MR;
  const PH = H - MT - MB;
  const x = (t) => ML + (t / SIM_TIME) * PW;
  const y = (val) => {
    const [min, max] = yDomain;
    return MT + PH - ((val - min) / (max - min || 1)) * PH;
  };

  const tickValues = Array.from({ length: 6 }, (_, index) => yDomain[0] + ((yDomain[1] - yDomain[0]) / 5) * index);

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>{title}</div>
      {subtitle ? <div style={{ fontSize: 12, color: '#71717a', marginBottom: 8 }}>{subtitle}</div> : null}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
        <rect x="0" y="0" width={W} height={H} rx="16" fill="#0c0c11" stroke="#1d1d27" />

        {tickValues.map((tick, index) => (
          <g key={`y-${index}`}>
            <line x1={ML} y1={y(tick)} x2={W - MR} y2={y(tick)} stroke="#181822" strokeWidth="0.8" />
            <text x={ML - 6} y={y(tick) + 3} textAnchor="end" fontSize="10" fill="#52525b">
              {tick.toFixed(1)}
            </text>
          </g>
        ))}

        {[0, 2, 4, 6, 8, 10, 12].map((tick) => (
          <g key={`x-${tick}`}>
            <line x1={x(tick)} y1={MT} x2={x(tick)} y2={MT + PH} stroke="#181822" strokeWidth="0.8" />
            <text x={x(tick)} y={H - 14} textAnchor="middle" fontSize="10" fill="#52525b">
              {tick.toFixed(0)}
            </text>
          </g>
        ))}

        {thresholds.map((threshold) => (
          <g key={threshold.label}>
            <line
              x1={ML}
              y1={y(threshold.value)}
              x2={W - MR}
              y2={y(threshold.value)}
              stroke={threshold.color}
              strokeWidth="1"
              strokeDasharray={threshold.dash || '5 4'}
              opacity="0.8"
            />
            <text x={W - MR - 4} y={y(threshold.value) - 5} textAnchor="end" fontSize="9" fill={threshold.color}>
              {threshold.label}
            </text>
          </g>
        ))}

        {markers.map((marker) => (
          <g key={marker.label}>
            <line
              x1={x(marker.time)}
              y1={MT}
              x2={x(marker.time)}
              y2={MT + PH}
              stroke={marker.color}
              strokeWidth="1.1"
              strokeDasharray="4 4"
            />
            <text x={x(marker.time) + 4} y={MT + 12} fontSize="9" fill={marker.color}>
              {marker.label}
            </text>
          </g>
        ))}

        {series.map((line) => {
          const points = data.map((sample) => [x(sample.t), y(sample[line.key])]);
          return <path key={line.key} d={buildPath(points)} fill="none" stroke={line.color} strokeWidth={line.width || 2.2} />;
        })}

        <line x1={ML} y1={MT + PH} x2={W - MR} y2={MT + PH} stroke="#3f3f46" />
        <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="#3f3f46" />

        <g transform={`translate(${ML}, ${H - 28})`}>
          {series.map((line, index) => (
            <g key={`legend-${line.key}`} transform={`translate(${index * 140}, 0)`}>
              <line x1="0" y1="0" x2="18" y2="0" stroke={line.color} strokeWidth="2.6" />
              <text x="24" y="4" fontSize="10" fill="#a1a1aa">
                {line.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

function OperationsBoard({ params, rotor, frequency, status }) {
  const tone = getTone(status);
  const tieLineLoading = clamp((params.Pm0 / Math.max(params.PmaxPost, 0.001)) * 100, 0, 160);
  const reserveUse = clamp((frequency.governorPeak / Math.max(params.reserveCap, 0.001)) * 100, 0, 100);
  const shedBlocks = Math.round(frequency.loadShed * 10);
  const rotorMargin =
    rotor.unstableBoundaryDeg === null ? null : Math.max(0, rotor.unstableBoundaryDeg - rotor.peakAngleDeg);

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>Operator board</div>
      <svg viewBox="0 0 960 250" style={{ width: '100%', height: 'auto' }}>
        <rect x="0" y="0" width="960" height="250" rx="18" fill="#0c0c11" stroke="#1d1d27" />

        <rect x="36" y="52" width="170" height="112" rx="16" fill="rgba(99,102,241,0.08)" stroke="#6366f1" />
        <text x="121" y="76" textAnchor="middle" fontSize="13" fill="#c7d2fe" fontWeight="700">
          Generator Area
        </text>
        <text x="121" y="104" textAnchor="middle" fontSize="24" fill="#f4f4f5" fontWeight="800">
          {params.Pm0.toFixed(2)} pu
        </text>
        <text x="121" y="124" textAnchor="middle" fontSize="11" fill="#71717a">
          pre-disturbance dispatch
        </text>
        <text x="121" y="146" textAnchor="middle" fontSize="11" fill="#a5b4fc">
          H = {params.Hrotor.toFixed(1)} s, D = {params.Drotor.toFixed(2)}
        </text>

        <line x1="206" y1="108" x2="580" y2="108" stroke="#334155" strokeWidth="12" strokeLinecap="round" opacity="0.45" />
        <line
          x1="206"
          y1="108"
          x2={206 + (374 * Math.min(tieLineLoading, 100)) / 100}
          y2="108"
          stroke={tieLineLoading > 100 ? '#ef4444' : tieLineLoading > 85 ? '#f59e0b' : '#22c55e'}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <text x="392" y="82" textAnchor="middle" fontSize="12" fill="#d4d4d8" fontWeight="700">
          Tie-line loading
        </text>
        <text x="392" y="132" textAnchor="middle" fontSize="18" fill="#f4f4f5" fontWeight="800">
          {tieLineLoading.toFixed(0)}%
        </text>
        <text x="392" y="152" textAnchor="middle" fontSize="11" fill="#71717a">
          post-event transfer usage
        </text>

        <rect x="604" y="40" width="320" height="144" rx="16" fill="rgba(15,23,42,0.55)" stroke="#334155" />
        <text x="764" y="64" textAnchor="middle" fontSize="13" fill="#e2e8f0" fontWeight="700">
          Load center and frequency
        </text>
        <text x="764" y="98" textAnchor="middle" fontSize="28" fill={tone.text} fontWeight="800">
          {frequency.nadirHz.toFixed(2)} Hz
        </text>
        <text x="764" y="118" textAnchor="middle" fontSize="11" fill="#71717a">
          frequency nadir
        </text>
        <text x="764" y="140" textAnchor="middle" fontSize="11" fill="#cbd5e1">
          reserve peak {frequency.governorPeak.toFixed(2)} pu of {params.reserveCap.toFixed(2)} pu
        </text>

        {Array.from({ length: 10 }, (_, index) => {
          const off = index < shedBlocks;
          return (
            <rect
              key={`shed-${index}`}
              x={634 + index * 26}
              y="154"
              width="18"
              height="18"
              rx="4"
              fill={off ? '#ef4444' : '#22c55e'}
              opacity={off ? 0.85 : 0.45}
            />
          );
        })}
        <text x="764" y="194" textAnchor="middle" fontSize="10" fill="#94a3b8">
          load blocks tripped by UFLS
        </text>

        <g transform="translate(36 196)">
          <text x="0" y="0" fontSize="11" fill="#71717a">
            Primary reserve
          </text>
          <rect x="0" y="12" width="220" height="12" rx="6" fill="#1e293b" />
          <rect x="0" y="12" width={(220 * reserveUse) / 100} height="12" rx="6" fill="#38bdf8" />
          <text x="228" y="22" fontSize="10" fill="#bae6fd">
            {reserveUse.toFixed(0)}%
          </text>

          <text x="0" y="50" fontSize="11" fill="#71717a">
            Rotor angle margin
          </text>
          <rect x="0" y="62" width="220" height="12" rx="6" fill="#1f1f28" />
          <rect
            x="0"
            y="62"
            width={(220 * clamp((rotorMargin ?? 0) / 60, 0, 1))}
            height="12"
            rx="6"
            fill={rotorMargin !== null && rotorMargin < 10 ? '#ef4444' : rotorMargin !== null && rotorMargin < 25 ? '#f59e0b' : '#22c55e'}
          />
          <text x="228" y="72" fontSize="10" fill="#d4d4d8">
            {rotorMargin === null ? 'no post-fault equilibrium' : `${rotorMargin.toFixed(1)} deg`}
          </text>
        </g>
      </svg>
    </div>
  );
}

function TheoryTab() {
  return (
    <div style={S.theory}>
      <h2 style={S.h2}>Grid Stability, Frequency, and Blackout Risk</h2>
      <p style={S.p}>
        This simulation combines two textbook ideas that operators often think about together during a disturbance:
        transient rotor-angle stability and short-term system frequency response. The first tells you whether a
        heavily loaded machine can stay in synchronism after a fault or line outage. The second tells you whether
        the overall grid can arrest a MW imbalance before under-frequency protection and cascading interruptions start.
      </p>
      <p style={S.p}>
        The model is intentionally compact. It is not a full multi-machine transient stability package or an EMS.
        Instead, it captures the same core mechanisms described in standard power-system texts such as Stevenson,
        Nagrath and Kothari, and Kundur, but in a form that is easy to study interactively.
      </p>

      <h3 style={S.h3}>1. Rotor-angle block</h3>
      <p style={S.p}>
        The machine is represented by the classical single-machine infinite-bus model. Mechanical input power is
        assumed constant during the first swing, while electrical output follows the familiar power-angle relation.
      </p>
      <code style={S.eq}>
        d(delta)/dt = omega_s * Delta omega
        <br />
        2H * d(Delta omega)/dt = Pm - Pe - D * Delta omega
        <br />
        Pe = Pmax * sin(delta)
      </code>
      <p style={S.p}>
        During a 3-phase fault, the effective transfer limit Pmax collapses, so electrical power drops sharply while
        mechanical input remains almost unchanged. The positive accelerating power causes delta to increase. If the
        fault is cleared quickly enough, the post-fault network can develop enough decelerating area to resynchronize
        the machine. If not, the angle crosses the unstable boundary and synchronism is lost.
      </p>

      <h3 style={S.h3}>2. Frequency block</h3>
      <p style={S.p}>
        In parallel, the simulation runs a single-area frequency response model for an aggregate MW deficit. This is
        a convenient way to represent a sudden load pickup, a generator trip, renewable output loss, or any net
        shortage of generation immediately after the disturbance.
      </p>
      <code style={S.eq}>
        d(Delta f_pu)/dt = [Pgov - Delta Pnet - Dload * Delta f_pu + Pshed] / (2Hsys)
        <br />
        d(Pgov)/dt = [-(1/R) * Delta f_pu - Pgov] / Tg
      </code>
      <p style={S.p}>
        Here, Hsys is aggregate system inertia, R is governor droop, Tg is governor-turbine response lag, and
        Dload represents the frequency sensitivity of load. UFLS stages are modeled as discrete blocks that trip
        when frequency remains below threshold for a short dwell time.
      </p>

      <h3 style={S.h3}>3. How blackout mechanisms appear</h3>
      <ul style={S.ul}>
        <li style={S.li}>High transfer angle means the machine is already operating close to the limit of the post-disturbance network.</li>
        <li style={S.li}>Longer clearing time increases accelerating area and reduces the decelerating margin.</li>
        <li style={S.li}>Low inertia produces steeper initial RoCoF and a deeper frequency nadir for the same MW deficit.</li>
        <li style={S.li}>Limited reserves or slow governors allow the deficit to persist, pushing the system toward UFLS.</li>
        <li style={S.li}>If UFLS is disabled or insufficient, frequency collapse and widespread interruption become more likely.</li>
      </ul>

      <h3 style={S.h3}>4. How to use the lab</h3>
      <ul style={S.ul}>
        <li style={S.li}>Start with "Evening peak, secure" to see a disturbance that remains manageable.</li>
        <li style={S.li}>Compare it with "Low inertia evening ramp" to isolate the effect of reduced kinetic energy.</li>
        <li style={S.li}>Switch to "3-phase fault, cleared in time" and then increase clearing time until the CCT margin disappears.</li>
        <li style={S.li}>Turn UFLS off in the generator-trip case and observe how much deeper the nadir becomes.</li>
        <li style={S.li}>Switch to 60 Hz to relate the same concepts to another operating frequency without changing the physics.</li>
      </ul>

      <h3 style={S.h3}>5. Practical reading of the plots</h3>
      <p style={S.p}>
        The power-angle plot tells you whether the machine still has a feasible post-event equilibrium and how close
        the actual excursion gets to the unstable boundary. The rotor-response plot shows the first swing directly.
        The frequency plot shows the nadir and the effect of UFLS thresholds. The control board summarizes what an
        operator would care about most: tie-line stress, reserve usage, load-shedding action, and whether the event
        stayed in the secure, stressed, emergency, or blackout-risk zone.
      </p>
    </div>
  );
}

function SimulationTab() {
  const [tab, setTab] = useState('sim');
  const [viewMode, setViewMode] = useState('guided');
  const [activePreset, setActivePreset] = useState('securePeak');
  const [params, setParams] = useState(PRESETS.securePeak.params);

  const patchParams = (patchOrUpdater) => {
    setActivePreset('custom');
    setParams((previous) => {
      const next =
        typeof patchOrUpdater === 'function'
          ? patchOrUpdater(previous)
          : { ...previous, ...patchOrUpdater };

      return {
        ...next,
        PmaxPost: Math.min(next.PmaxPost, next.PmaxPre),
        PmaxFault: Math.min(next.PmaxFault, next.PmaxPre),
        Pm0: Math.min(next.Pm0, next.PmaxPre - 0.05),
      };
    });
  };

  const setParam = (key, value) => {
    patchParams((previous) => {
      if (key === 'PmaxPre') {
        const nextPre = value;
        return {
          ...previous,
          PmaxPre: nextPre,
          PmaxPost: Math.min(previous.PmaxPost, nextPre),
          Pm0: Math.min(previous.Pm0, nextPre - 0.05),
        };
      }
      if (key === 'PmaxPost') {
        return { ...previous, PmaxPost: Math.min(value, previous.PmaxPre) };
      }
      return { ...previous, [key]: value };
    });
  };

  const applyPreset = (presetId) => {
    setActivePreset(presetId);
    setParams(PRESETS[presetId].params);
  };

  const rotor = useMemo(() => runRotorModel(params), [params]);
  const cct = useMemo(() => estimateCriticalClearingTime(params), [params]);
  const frequency = useMemo(() => runFrequencyModel(params), [params]);
  const status = useMemo(() => deriveOverallStatus(rotor, frequency, params, cct), [rotor, frequency, params, cct]);
  const tone = getTone(status);

  const rotorAngleMax = Math.max(
    90,
    rotor.peakAngleDeg + 10,
    rotor.unstableBoundaryDeg ? rotor.unstableBoundaryDeg + 6 : 0,
  );
  const minFreq = Math.min(
    params.baseFreq * 0.94,
    frequency.nadirHz - 0.25,
  );
  const maxFreq = Math.max(
    params.baseFreq * 1.005,
    frequency.finalHz + 0.15,
  );
  const maxPower = Math.max(
    params.Pm0,
    params.netDeficit,
    frequency.governorPeak,
    ...rotor.trace.map((sample) => sample.pe),
  );
  const presetMeta = PRESETS[activePreset];
  const cctMargin = cct === null || params.eventType !== 'fault' ? null : cct - params.clearTime;
  const loadingRatio = params.Pm0 / Math.max(params.PmaxPre, 0.001);
  const inertiaLevel = round((params.Hrotor + params.Hsys) / 2, 1);
  const backupStrengthPct = Math.round(getBackupScore(params) * 100);

  const setInertiaLevel = (value) => {
    patchParams({
      Hrotor: round(clamp(value - 0.3, 2.5, 6.5), 1),
      Hsys: round(clamp(value + 0.3, 2.5, 7.0), 1),
    });
  };

  const setBackupStrengthPct = (percent) => {
    const score = clamp(percent / 100, 0, 1);
    patchParams({
      reserveCap: round(lerp(0.08, 0.24, score), 2),
      govTime: round(lerp(0.9, 0.35, score), 2),
      droopPct: round(lerp(6.0, 3.5, score), 1),
    });
  };

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button type="button" style={S.tab(tab === 'sim')} onClick={() => setTab('sim')}>
          Simulation
        </button>
        <button type="button" style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>
          Theory
        </button>
      </div>

      {tab === 'theory' ? (
        <TheoryTab />
      ) : (
        <div style={S.simBody}>
          <div style={S.hero}>
            <h1 style={S.title}>Grid Stability and Blackout Lab</h1>
            <p style={S.subtitle}>
              A coordinated study bench for swing-equation dynamics, power-angle limits, frequency nadir, governor
              action, and under-frequency load shedding. Use it to compare secure operating points with stressed and
              blackout-prone disturbances under different inertia and transfer conditions.
            </p>
          </div>

          <div style={S.presetRow}>
            {Object.entries(PRESETS).map(([presetId, preset]) => (
              <button
                key={presetId}
                type="button"
                style={S.presetBtn(activePreset === presetId)}
                onClick={() => applyPreset(presetId)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div style={S.modeRow}>
            <button type="button" style={S.modeBtn(viewMode === 'guided')} onClick={() => setViewMode('guided')}>
              Guided View
            </button>
            <button type="button" style={S.modeBtn(viewMode === 'engineering')} onClick={() => setViewMode('engineering')}>
              Engineering View
            </button>
          </div>

          <div style={S.presetMeta}>
            <div style={S.card}>
              <div style={S.cardTitle}>Scenario focus</div>
              <p style={S.cardText}>{presetMeta ? presetMeta.note : 'Custom study case with manual parameter changes.'}</p>
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>Security verdict</div>
              <div style={S.statusBadge(tone)}>{status}</div>
              <p style={{ ...S.cardText, marginTop: 10 }}>{describeStatus(status)}</p>
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>Disturbance framing</div>
              <p style={S.cardText}>
                Event at {STEP_TIME.toFixed(1)} s. Net deficit = {params.netDeficit.toFixed(2)} pu. Base frequency ={' '}
                {params.baseFreq} Hz. Rotor event = {params.eventType === 'normal' ? 'no line/fault event' : params.eventType}.
              </p>
            </div>
          </div>

          <div style={S.metricStrip}>
            <div style={S.metric}>
              <div style={S.metricLabel}>{viewMode === 'guided' ? 'How Far The Rotor Runs Ahead' : 'Rotor peak angle'}</div>
              <div style={S.metricValue}>{rotor.peakAngleDeg.toFixed(1)} deg</div>
              <div style={S.metricSub}>
                post-event equilibrium {rotor.postStableAngleDeg === null ? 'not feasible' : `${rotor.postStableAngleDeg.toFixed(1)} deg`}
              </div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLabel}>{viewMode === 'guided' ? 'Lowest Frequency Reached' : 'Frequency nadir'}</div>
              <div style={S.metricValue}>{frequency.nadirHz.toFixed(2)} Hz</div>
              <div style={S.metricSub}>final frequency {frequency.finalHz.toFixed(2)} Hz</div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLabel}>{viewMode === 'guided' ? 'Initial Rate Of Fall' : 'Minimum RoCoF'}</div>
              <div style={S.metricValue}>{frequency.minRoCoF.toFixed(2)} Hz/s</div>
              <div style={S.metricSub}>initial inertial arrest rate</div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLabel}>{viewMode === 'guided' ? 'Fast Backup Used' : 'Primary reserve used'}</div>
              <div style={S.metricValue}>{frequency.governorPeak.toFixed(2)} pu</div>
              <div style={S.metricSub}>
                {frequency.reserveSaturated ? 'reserve ceiling reached' : 'reserve margin remained'}
              </div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLabel}>{viewMode === 'guided' ? 'Emergency Load Shed' : 'UFLS action'}</div>
              <div style={S.metricValue}>{(frequency.loadShed * 100).toFixed(0)}%</div>
              <div style={S.metricSub}>
                {frequency.stageTrips.length ? `${frequency.stageTrips.length} stage(s) operated` : 'no load shed'}
              </div>
            </div>
            <div style={S.metric}>
              <div style={S.metricLabel}>{viewMode === 'guided' ? 'Breaker-Clearing Margin' : 'Critical clearing'}</div>
              <div style={S.metricValue}>{cct === null ? 'n/a' : `${cct.toFixed(2)} s`}</div>
              <div style={S.metricSub}>
                {cctMargin === null
                  ? params.eventType === 'fault'
                    ? 'fault case has no stable clearing margin'
                    : 'only relevant for fault cases'
                  : `margin ${cctMargin >= 0 ? '+' : ''}${cctMargin.toFixed(2)} s`}
              </div>
            </div>
          </div>

          {viewMode === 'guided' ? (
            <>
              <div style={S.panelGrid}>
                <IntuitionBoard params={params} rotor={rotor} frequency={frequency} status={status} cct={cct} />
                <PowerAngleChart params={params} rotor={rotor} />
              </div>

              <div style={S.panelGrid}>
                <TimeSeriesChart
                  title="Rotor response"
                  subtitle="How far the machine runs ahead after the shock"
                  data={rotor.trace}
                  series={[
                    { key: 'angleDeg', label: 'delta (deg)', color: '#f59e0b' },
                  ]}
                  yDomain={[0, rotorAngleMax]}
                  thresholds={
                    rotor.unstableBoundaryDeg
                      ? [{ value: rotor.unstableBoundaryDeg, color: '#ef4444', label: 'unstable boundary' }]
                      : []
                  }
                  markers={[
                    { time: STEP_TIME, color: '#818cf8', label: 'event' },
                    ...(params.eventType === 'fault'
                      ? [{ time: STEP_TIME + params.clearTime, color: '#ef4444', label: 'clear' }]
                      : []),
                  ]}
                />
                <TimeSeriesChart
                  title="Frequency response"
                  subtitle="How low the system frequency falls before controls catch it"
                  data={frequency.trace}
                  series={[
                    { key: 'freqHz', label: 'frequency', color: '#22c55e' },
                  ]}
                  yDomain={[minFreq, maxFreq]}
                  thresholds={UFLS_STAGES.map((stage) => ({
                    value: params.baseFreq * stage.thresholdPu,
                    color: '#ef4444',
                    label: stage.label,
                  }))}
                  markers={[{ time: STEP_TIME, color: '#818cf8', label: 'event' }]}
                />
              </div>

              <div style={S.controlGrid}>
                <div style={S.controlCard}>
                  <h3 style={S.sectionTitle}>Tell The Story Of The Disturbance</h3>
                  <p style={S.sectionHint}>
                    Use plain-language levers first. They still drive the same textbook equations under the hood.
                  </p>

                  <div style={S.sliderWrap}>
                    <div style={S.sliderRow}>
                      <span style={S.sliderLabel}>Operating frequency</span>
                      <span style={S.sliderValue}>{params.baseFreq} Hz</span>
                    </div>
                    <div style={S.optionRow}>
                      {[50, 60].map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          style={S.optionBtn(params.baseFreq === freq)}
                          onClick={() => setParam('baseFreq', freq)}
                        >
                          {freq} Hz
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={S.sliderWrap}>
                    <div style={S.sliderRow}>
                      <span style={S.sliderLabel}>What kind of event happens?</span>
                      <span style={S.sliderValue}>{params.eventType}</span>
                    </div>
                    <div style={S.optionRow}>
                      {['normal', 'lineTrip', 'fault'].map((eventType) => (
                        <button
                          key={eventType}
                          type="button"
                          style={S.optionBtn(params.eventType === eventType)}
                          onClick={() => setParam('eventType', eventType)}
                        >
                          {eventType === 'normal' ? 'generation shortfall' : eventType}
                        </button>
                      ))}
                    </div>
                  </div>

                  <SliderControl
                    label="How much supply is suddenly missing?"
                    value={params.netDeficit}
                    min={0.02}
                    max={0.28}
                    step={0.01}
                    formatter={(value) => `${(value * 100).toFixed(0)}% shortage`}
                    onChange={(value) => setParam('netDeficit', value)}
                  />
                  <SliderControl
                    label="How weak is the grid after the event?"
                    value={params.PmaxPost}
                    min={0.8}
                    max={params.PmaxPre}
                    step={0.01}
                    formatter={() => `${((params.PmaxPost / params.PmaxPre) * 100).toFixed(0)}% pull left`}
                    onChange={(value) => setParam('PmaxPost', value)}
                    disabled={params.eventType === 'normal'}
                  />
                  <SliderControl
                    label="How badly does the fault choke power flow?"
                    value={params.PmaxFault}
                    min={0.02}
                    max={Math.max(0.08, params.PmaxPost)}
                    step={0.01}
                    formatter={() => `${((params.PmaxFault / params.PmaxPre) * 100).toFixed(0)}% pull during fault`}
                    onChange={(value) => setParam('PmaxFault', value)}
                    disabled={params.eventType !== 'fault'}
                  />
                  <SliderControl
                    label="How quickly do the breakers clear?"
                    value={params.clearTime}
                    min={0.05}
                    max={0.45}
                    step={0.01}
                    formatter={(value) => `${value.toFixed(2)} s`}
                    onChange={(value) => setParam('clearTime', value)}
                    disabled={params.eventType !== 'fault'}
                  />
                </div>

                <div style={S.controlCard}>
                  <h3 style={S.sectionTitle}>How Much Cushion Does The Grid Have?</h3>
                  <p style={S.sectionHint}>
                    These are the three ideas to hold in your head: how hard the machine is already working, how much
                    spinning mass exists, and how much fast backup responds when things go wrong.
                  </p>

                  <SliderControl
                    label="How hard is the generator already working?"
                    value={params.Pm0}
                    min={0.45}
                    max={Math.max(0.5, params.PmaxPre - 0.05)}
                    step={0.01}
                    formatter={() => `${(loadingRatio * 100).toFixed(0)}% loaded`}
                    onChange={(value) => setParam('Pm0', value)}
                  />
                  <SliderControl
                    label="How much spinning mass is stored?"
                    value={inertiaLevel}
                    min={2.8}
                    max={6.7}
                    step={0.1}
                    formatter={(value) => `${value.toFixed(1)} s`}
                    onChange={setInertiaLevel}
                  />
                  <SliderControl
                    label="How much fast backup arrives?"
                    value={backupStrengthPct}
                    min={0}
                    max={100}
                    step={1}
                    formatter={(value) => describeBand(value / 100, 'weak', 'fair', 'strong')}
                    onChange={setBackupStrengthPct}
                  />

                  <div style={S.sliderWrap}>
                    <div style={S.sliderRow}>
                      <span style={S.sliderLabel}>Can under-frequency load shedding help?</span>
                      <span style={S.sliderValue}>{params.uflsEnabled ? 'yes' : 'no'}</span>
                    </div>
                    <div style={S.optionRow}>
                      {[true, false].map((enabled) => (
                        <button
                          key={String(enabled)}
                          type="button"
                          style={S.optionBtn(params.uflsEnabled === enabled)}
                          onClick={() => setParam('uflsEnabled', enabled)}
                        >
                          {enabled ? 'allow UFLS' : 'block UFLS'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={S.note}>
                    In guided view, the goal is not to memorize every symbol. The goal is to see the chain clearly:
                    event weakens electrical pull, rotor runs ahead, frequency dips, reserves respond, and protection
                    either saves the system or fails to do so.
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={S.panelGrid}>
                <OperationsBoard params={params} rotor={rotor} frequency={frequency} status={status} />
                <PowerAngleChart params={params} rotor={rotor} />
              </div>

              <div style={S.panelGrid}>
                <TimeSeriesChart
                  title="Rotor response"
                  subtitle="First-swing rotor angle excursion after the event"
                  data={rotor.trace}
                  series={[
                    { key: 'angleDeg', label: 'delta (deg)', color: '#f59e0b' },
                  ]}
                  yDomain={[0, rotorAngleMax]}
                  thresholds={
                    rotor.unstableBoundaryDeg
                      ? [{ value: rotor.unstableBoundaryDeg, color: '#ef4444', label: 'unstable boundary' }]
                      : []
                  }
                  markers={[
                    { time: STEP_TIME, color: '#818cf8', label: 'event' },
                    ...(params.eventType === 'fault'
                      ? [{ time: STEP_TIME + params.clearTime, color: '#ef4444', label: 'clear' }]
                      : []),
                  ]}
                />
                <TimeSeriesChart
                  title="Frequency response"
                  subtitle="Aggregate area frequency with governor and UFLS action"
                  data={frequency.trace}
                  series={[
                    { key: 'freqHz', label: 'frequency', color: '#22c55e' },
                  ]}
                  yDomain={[minFreq, maxFreq]}
                  thresholds={UFLS_STAGES.map((stage) => ({
                    value: params.baseFreq * stage.thresholdPu,
                    color: '#ef4444',
                    label: stage.label,
                  }))}
                  markers={[{ time: STEP_TIME, color: '#818cf8', label: 'event' }]}
                />
                <TimeSeriesChart
                  title="Rotor power balance"
                  subtitle="Mechanical input, electrical output, and accelerating power"
                  data={rotor.trace}
                  series={[
                    { key: 'pe', label: 'Pe', color: '#60a5fa' },
                    { key: 'pa', label: 'Pa', color: '#f472b6' },
                  ]}
                  yDomain={[-Math.max(0.4, maxPower * 0.6), maxPower * 1.05]}
                  thresholds={[{ value: params.Pm0, color: '#a5b4fc', label: 'Pm', dash: '5 4' }]}
                  markers={[
                    { time: STEP_TIME, color: '#818cf8', label: 'event' },
                    ...(params.eventType === 'fault'
                      ? [{ time: STEP_TIME + params.clearTime, color: '#ef4444', label: 'clear' }]
                      : []),
                  ]}
                />
                <TimeSeriesChart
                  title="Area MW balance"
                  subtitle="Governor response versus remaining net deficit after controls"
                  data={frequency.trace}
                  series={[
                    { key: 'governorPower', label: 'governor power', color: '#38bdf8' },
                    { key: 'netDemandAfterControls', label: 'net deficit after controls', color: '#f97316' },
                    { key: 'shed', label: 'load shed', color: '#ef4444' },
                  ]}
                  yDomain={[-0.02, Math.max(params.netDeficit, params.reserveCap, frequency.loadShed) * 1.2 + 0.04]}
                  markers={[{ time: STEP_TIME, color: '#818cf8', label: 'event' }]}
                />
              </div>

              <div style={S.controlGrid}>
                <div style={S.controlCard}>
                  <h3 style={S.sectionTitle}>Disturbance setup</h3>
                  <p style={S.sectionHint}>
                    Use presets first, then alter one parameter at a time to see what drives the result.
                  </p>

                  <div style={S.sliderWrap}>
                    <div style={S.sliderRow}>
                      <span style={S.sliderLabel}>Base frequency</span>
                      <span style={S.sliderValue}>{params.baseFreq} Hz</span>
                    </div>
                    <div style={S.optionRow}>
                      {[50, 60].map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          style={S.optionBtn(params.baseFreq === freq)}
                          onClick={() => setParam('baseFreq', freq)}
                        >
                          {freq} Hz
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={S.sliderWrap}>
                    <div style={S.sliderRow}>
                      <span style={S.sliderLabel}>Rotor event type</span>
                      <span style={S.sliderValue}>{params.eventType}</span>
                    </div>
                    <div style={S.optionRow}>
                      {['normal', 'lineTrip', 'fault'].map((eventType) => (
                        <button
                          key={eventType}
                          type="button"
                          style={S.optionBtn(params.eventType === eventType)}
                          onClick={() => setParam('eventType', eventType)}
                        >
                          {eventType}
                        </button>
                      ))}
                    </div>
                  </div>

                  <SliderControl
                    label="Net MW deficit"
                    value={params.netDeficit}
                    min={0.02}
                    max={0.28}
                    step={0.01}
                    formatter={formatPu}
                    onChange={(value) => setParam('netDeficit', value)}
                  />
                  <SliderControl
                    label="Fault-on transfer Pmax"
                    value={params.PmaxFault}
                    min={0.02}
                    max={Math.max(0.08, params.PmaxPost)}
                    step={0.01}
                    formatter={formatPu}
                    onChange={(value) => setParam('PmaxFault', value)}
                    disabled={params.eventType !== 'fault'}
                  />
                  <SliderControl
                    label="Fault clearing time"
                    value={params.clearTime}
                    min={0.05}
                    max={0.45}
                    step={0.01}
                    formatter={(value) => `${value.toFixed(2)} s`}
                    onChange={(value) => setParam('clearTime', value)}
                    disabled={params.eventType !== 'fault'}
                  />
                </div>

                <div style={S.controlCard}>
                  <h3 style={S.sectionTitle}>Rotor-angle stability controls</h3>
                  <p style={S.sectionHint}>
                    These knobs define the power-angle curve and the machine&apos;s first-swing behavior.
                  </p>
                  <SliderControl
                    label="Initial dispatch Pm"
                    value={params.Pm0}
                    min={0.45}
                    max={Math.max(0.5, params.PmaxPre - 0.05)}
                    step={0.01}
                    formatter={formatPu}
                    onChange={(value) => setParam('Pm0', value)}
                  />
                  <SliderControl
                    label="Pre-event Pmax"
                    value={params.PmaxPre}
                    min={1.1}
                    max={1.9}
                    step={0.01}
                    formatter={formatPu}
                    onChange={(value) => setParam('PmaxPre', value)}
                  />
                  <SliderControl
                    label="Post-event Pmax"
                    value={params.PmaxPost}
                    min={0.8}
                    max={params.PmaxPre}
                    step={0.01}
                    formatter={formatPu}
                    onChange={(value) => setParam('PmaxPost', value)}
                  />
                  <SliderControl
                    label="Machine inertia H"
                    value={params.Hrotor}
                    min={2.5}
                    max={6.5}
                    step={0.1}
                    formatter={(value) => `${value.toFixed(1)} s`}
                    onChange={(value) => setParam('Hrotor', value)}
                  />
                  <SliderControl
                    label="Damping D"
                    value={params.Drotor}
                    min={0.4}
                    max={1.6}
                    step={0.05}
                    formatter={(value) => value.toFixed(2)}
                    onChange={(value) => setParam('Drotor', value)}
                  />
                </div>

                <div style={S.controlCard}>
                  <h3 style={S.sectionTitle}>Frequency-control knobs</h3>
                  <p style={S.sectionHint}>
                    These parameters shape the nadir, RoCoF, and whether emergency controls are needed.
                  </p>
                  <SliderControl
                    label="System inertia Hsys"
                    value={params.Hsys}
                    min={2.5}
                    max={7}
                    step={0.1}
                    formatter={(value) => `${value.toFixed(1)} s`}
                    onChange={(value) => setParam('Hsys', value)}
                  />
                  <SliderControl
                    label="Governor droop"
                    value={params.droopPct}
                    min={3}
                    max={7}
                    step={0.1}
                    formatter={(value) => `${value.toFixed(1)} %`}
                    onChange={(value) => setParam('droopPct', value)}
                  />
                  <SliderControl
                    label="Governor time constant"
                    value={params.govTime}
                    min={0.3}
                    max={1}
                    step={0.01}
                    formatter={(value) => `${value.toFixed(2)} s`}
                    onChange={(value) => setParam('govTime', value)}
                  />
                  <SliderControl
                    label="Primary reserve cap"
                    value={params.reserveCap}
                    min={0.06}
                    max={0.24}
                    step={0.01}
                    formatter={formatPu}
                    onChange={(value) => setParam('reserveCap', value)}
                  />
                  <SliderControl
                    label="Load damping"
                    value={params.loadDamping}
                    min={0.4}
                    max={1.6}
                    step={0.05}
                    formatter={(value) => `${value.toFixed(2)} pu/pu`}
                    onChange={(value) => setParam('loadDamping', value)}
                  />

                  <div style={S.sliderWrap}>
                    <div style={S.sliderRow}>
                      <span style={S.sliderLabel}>UFLS</span>
                      <span style={S.sliderValue}>{params.uflsEnabled ? 'enabled' : 'disabled'}</span>
                    </div>
                    <div style={S.optionRow}>
                      {[true, false].map((enabled) => (
                        <button
                          key={String(enabled)}
                          type="button"
                          style={S.optionBtn(params.uflsEnabled === enabled)}
                          onClick={() => setParam('uflsEnabled', enabled)}
                        >
                          {enabled ? 'enabled' : 'disabled'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={S.note}>
                    Event time is fixed at 1.0 s so you can compare cases directly. The MW deficit slider can stand for a
                    load pickup, a generator trip, renewable loss, or any net shortage that appears immediately after the event.
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function GridStabilityBlackoutLab() {
  return <SimulationTab />;
}
