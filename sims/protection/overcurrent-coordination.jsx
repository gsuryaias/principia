import React, { useMemo, useState, useCallback } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', color: '#e4e4e7', fontFamily: 'Inter, system-ui, sans-serif' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', cursor: 'pointer', fontSize: 14, fontWeight: 500 }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  theory: { flex: 1, padding: '32px 24px', maxWidth: 900, margin: '0 auto', width: '100%', overflowY: 'auto' },
  h2: { fontSize: 22, fontWeight: 700, color: '#f4f4f5', margin: '36px 0 14px', paddingBottom: 8, borderBottom: '1px solid #27272a' },
  h3: { fontSize: 17, fontWeight: 600, color: '#e4e4e7', margin: '24px 0 10px' },
  p: { fontSize: 15, lineHeight: 1.8, color: '#a1a1aa', margin: '0 0 14px' },
  eq: { display: 'block', padding: '14px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, color: '#c4b5fd', fontFamily: 'monospace', margin: '16px 0', textAlign: 'center' },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { display: 'block', fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14 },
  ctxP: { margin: 0, fontSize: 14, lineHeight: 1.7, color: '#a1a1aa' },
  tbl: { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #3f3f46', color: '#d4d4d8', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #27272a', color: '#a1a1aa' },
  svgDiag: { width: '100%', margin: '20px 0', borderRadius: 12, overflow: 'hidden' },
};

/* ─── IEC 60255 Curve Functions ─── */
const CURVES = {
  SI:  { name: 'Standard Inverse',       fn: (psm, tms) => psm <= 1 ? Infinity : 0.14 * tms / (Math.pow(psm, 0.02) - 1), formula: 't = 0.14 × TMS / (PSM^0.02 − 1)' },
  VI:  { name: 'Very Inverse',            fn: (psm, tms) => psm <= 1 ? Infinity : 13.5 * tms / (psm - 1), formula: 't = 13.5 × TMS / (PSM − 1)' },
  EI:  { name: 'Extremely Inverse',       fn: (psm, tms) => psm <= 1 ? Infinity : 80 * tms / (psm * psm - 1), formula: 't = 80 × TMS / (PSM² − 1)' },
  LTI: { name: 'Long Time Inverse',       fn: (psm, tms) => psm <= 1 ? Infinity : 120 * tms / (psm - 1), formula: 't = 120 × TMS / (PSM − 1)' },
  DT:  { name: 'Definite Time',           fn: (psm, tms) => psm <= 1 ? Infinity : tms * 3, formula: 't = TMS × 3 (constant)' },
};

const RELAY_COLORS = { R1: '#22c55e', R2: '#3b82f6', R3: '#f59e0b' };
const RELAY_BORDERS = { R1: '#22c55e', R2: '#6366f1', R3: '#f59e0b' };
const CT_RATIOS = [100, 200, 300, 400, 500, 600, 800, 1000];
const RELAY_ORDER = ['R1', 'R2', 'R3'];

const FAULT_LOCATIONS = [
  { label: 'At R1', seenBy: ['R1', 'R2', 'R3'], note: 'All three relays are upstream of the fault and see the same feeder current.' },
  { label: 'Between R1 & R2', seenBy: ['R2', 'R3'], note: 'R1 is downstream of the fault, so only R2 and R3 carry fault current.' },
  { label: 'At R2', seenBy: ['R2', 'R3'], note: 'R2 and R3 see the fault. R1 is downstream of the faulted point.' },
  { label: 'Between R2 & R3', seenBy: ['R3'], note: 'Only the source-side relay R3 is in the fault-current path.' },
  { label: 'At R3', seenBy: ['R3'], note: 'The source-side relay sees the fault at its own location.' },
];

function primaryPickup(settings) {
  return settings.pickupSec * settings.ctRatio;
}

function relayFaultCurrent(name, faultCurrentKA, location) {
  return location.seenBy.includes(name) ? faultCurrentKA * 1000 : 0;
}

function buildRelayData(relaySettings, faultCurrentKA, location) {
  return RELAY_ORDER.map((name) => {
    const settings = relaySettings[name];
    const Ifault = relayFaultCurrent(name, faultCurrentKA, location);
    const pickupPrimary = primaryPickup(settings);
    const psm = pickupPrimary > 0 ? Ifault / pickupPrimary : 0;
    const opTime = CURVES[settings.curve].fn(psm, settings.tms);
    const i2t = opTime < Infinity && opTime > 0 ? Ifault * Ifault * opTime : Infinity;
    return { name, Ifault, psm, opTime, i2t, settings, pickupPrimary };
  });
}

/* ─── Tooltip Component ─── */
function Tooltip({ children, text, style: extraStyle }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onEnter = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
    setShow(true);
  }, []);

  return (
    <span
      style={{ position: 'relative', cursor: 'help', ...extraStyle }}
      onMouseEnter={onEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div style={{
          position: 'fixed', left: pos.x, top: pos.y - 8, transform: 'translate(-50%, -100%)',
          background: '#27272a', border: '1px solid #3f3f46', borderRadius: 8, padding: '10px 14px',
          zIndex: 100, maxWidth: 380, fontSize: 12, color: '#d4d4d8', fontFamily: 'monospace',
          lineHeight: 1.7, whiteSpace: 'pre-wrap', pointerEvents: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          {text}
        </div>
      )}
    </span>
  );
}

/* ─── Per-Relay Settings Panel ─── */
function RelayPanel({ relay, color, borderColor, settings, onChange }) {
  return (
    <div style={{
      flex: '1 1 280px', padding: '12px 14px', background: '#18181b',
      border: `1px solid ${borderColor}`, borderRadius: 10, minWidth: 260
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{relay}</span>
        <span style={{ fontSize: 11, color: '#71717a' }}>
          {relay === 'R1' ? '(Downstream)' : relay === 'R2' ? '(Intermediate)' : '(Upstream)'}
        </span>
      </div>

      {/* Curve type */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#a1a1aa', width: 60, flexShrink: 0 }}>Curve</span>
        <select
          value={settings.curve}
          onChange={(e) => onChange({ ...settings, curve: e.target.value })}
          style={{
            flex: 1, background: '#09090b', border: '1px solid #3f3f46', borderRadius: 6,
            color: '#e4e4e7', fontSize: 12, padding: '4px 8px', outline: 'none'
          }}
        >
          {Object.entries(CURVES).map(([k, v]) => (
            <option key={k} value={k}>{k} — {v.name}</option>
          ))}
        </select>
      </div>

      {/* TMS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#a1a1aa', width: 60, flexShrink: 0 }}>TMS</span>
        <input
          type="range" min="0.025" max="1.2" step="0.025" value={settings.tms}
          onChange={(e) => onChange({ ...settings, tms: Number(e.target.value) })}
          style={{ flex: 1, accentColor: color }}
        />
        <span style={{ fontSize: 11, color: '#71717a', fontFamily: 'monospace', minWidth: 40, textAlign: 'right' }}>
          {settings.tms.toFixed(3)}
        </span>
      </div>

      {/* Pickup current */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#a1a1aa', width: 60, flexShrink: 0 }}>Pickup</span>
        <input
          type="range" min="0.5" max="2.5" step="0.05" value={settings.pickupSec}
          onChange={(e) => onChange({ ...settings, pickupSec: Number(e.target.value) })}
          style={{ flex: 1, accentColor: color }}
        />
        <span style={{ fontSize: 11, color: '#71717a', fontFamily: 'monospace', minWidth: 50, textAlign: 'right' }}>
          {settings.pickupSec.toFixed(2)} A
        </span>
      </div>

      {/* CT Ratio */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: '#a1a1aa', width: 60, flexShrink: 0 }}>CT Ratio</span>
        <select
          value={settings.ctRatio}
          onChange={(e) => onChange({ ...settings, ctRatio: Number(e.target.value) })}
          style={{
            flex: 1, background: '#09090b', border: '1px solid #3f3f46', borderRadius: 6,
            color: '#e4e4e7', fontSize: 12, padding: '4px 8px', outline: 'none'
          }}
        >
          {CT_RATIOS.map((r) => (
            <option key={r} value={r}>{r}/1 A</option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 8, fontSize: 10, color: '#71717a', fontFamily: 'monospace' }}>
        Primary pickup = {primaryPickup(settings).toFixed(0)} A
      </div>
    </div>
  );
}

/* ─── TCC Log-Log Plot ─── */
function TCCPlot({ relaySettings, faultCurrent, faultLocation, cti }) {
  const W = 900, H = 520;
  const ML = 72, MR = 20, MT = 36, MB = 52;
  const PW = W - ML - MR, PH = H - MT - MB;

  // Log scale: X = current 100 A to 50000 A, Y = time 0.01 s to 100 s
  const xMin = Math.log10(100), xMax = Math.log10(50000);
  const yMin = Math.log10(0.01), yMax = Math.log10(100);

  const xS = (amps) => ML + ((Math.log10(Math.max(amps, 100))) - xMin) / (xMax - xMin) * PW;
  const yS = (secs) => {
    const ls = Math.log10(Math.max(Math.min(secs, 100), 0.01));
    return MT + PH - (ls - yMin) / (yMax - yMin) * PH;
  };

  // Compute fault current at each relay
  const loc = FAULT_LOCATIONS[faultLocation];
  const relayData = buildRelayData(relaySettings, faultCurrent, loc);

  // X-axis grid: current values
  const xGridValues = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
  const xSubGrid = [150, 300, 400, 600, 700, 800, 900, 1500, 3000, 4000, 6000, 7000, 8000, 9000, 15000, 30000, 40000];
  // Y-axis grid: time values
  const yGridValues = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
  const ySubGrid = [0.03, 0.04, 0.06, 0.07, 0.08, 0.09, 0.15, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9, 1.5, 3, 4, 6, 7, 8, 9, 15, 30, 40, 60, 70, 80, 90];

  // Build curve paths
  const curvePaths = ['R1', 'R2', 'R3'].map((name, ri) => {
    const s = relaySettings[name];
    const curveFn = CURVES[s.curve].fn;
    const startCurrent = primaryPickup(s);
    const points = [];

    // Sample from just above pickup to 50000A
    for (let logI = Math.log10(startCurrent * 1.02); logI <= xMax; logI += 0.015) {
      const I = Math.pow(10, logI);
      const psm = I / startCurrent;
      const time = curveFn(psm, s.tms);
      if (time > 0 && time < Infinity && time >= 0.01 && time <= 100) {
        points.push({ x: xS(I), y: yS(time) });
      }
    }

    if (points.length < 2) return null;
    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return { name, d, color: RELAY_COLORS[name], startCurrent };
  });

  // Sort relay data by operating time to get trip sequence
  const sortedRelays = [...relayData].filter(r => r.opTime < Infinity).sort((a, b) => a.opTime - b.opTime);

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto', display: 'block' }}>
        <rect width={W} height={H} fill="#09090b" />
        <text x={W / 2} y="22" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.08em">
          TIME-CURRENT CHARACTERISTIC (LOG-LOG)
        </text>

        {/* Sub-grid */}
        {xSubGrid.filter(v => v >= 100 && v <= 50000).map(v => (
          <line key={`xsub${v}`} x1={xS(v)} y1={MT} x2={xS(v)} y2={MT + PH} stroke="#131318" strokeWidth="0.5" />
        ))}
        {ySubGrid.map(v => (
          <line key={`ysub${v}`} x1={ML} y1={yS(v)} x2={ML + PW} y2={yS(v)} stroke="#131318" strokeWidth="0.5" />
        ))}

        {/* Main grid */}
        {xGridValues.map(v => (
          <g key={`xg${v}`}>
            <line x1={xS(v)} y1={MT} x2={xS(v)} y2={MT + PH} stroke="#1f1f28" strokeWidth="0.8" />
            <text x={xS(v)} y={MT + PH + 16} textAnchor="middle" fill="#52525b" fontSize="9">
              {v >= 1000 ? `${v / 1000}k` : v}
            </text>
          </g>
        ))}
        {yGridValues.map(v => (
          <g key={`yg${v}`}>
            <line x1={ML} y1={yS(v)} x2={ML + PW} y2={yS(v)} stroke="#1f1f28" strokeWidth="0.8" />
            <text x={ML - 8} y={yS(v) + 4} textAnchor="end" fill="#52525b" fontSize="9">{v}</text>
          </g>
        ))}

        {/* Axis border */}
        <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="#3f3f46" strokeWidth="1" />
        <line x1={ML} y1={MT + PH} x2={ML + PW} y2={MT + PH} stroke="#3f3f46" strokeWidth="1" />

        {/* Axis labels */}
        <text x={ML + PW / 2} y={MT + PH + 38} textAnchor="middle" fill="#71717a" fontSize="10">Current (A)</text>
        <text x="18" y={MT + PH / 2} textAnchor="middle" fill="#71717a" fontSize="10" transform={`rotate(-90 18 ${MT + PH / 2})`}>Operating Time (s)</text>

        {/* Relay curves */}
        {curvePaths.map(cp => cp && (
          <g key={cp.name}>
            <path d={cp.d} fill="none" stroke={cp.color} strokeWidth="2.5" opacity="0.9" />
            {/* Pickup marker */}
            <line x1={xS(cp.startCurrent)} y1={MT} x2={xS(cp.startCurrent)} y2={MT + PH}
              stroke={cp.color} strokeWidth="1" strokeDasharray="3 4" opacity="0.3" />
          </g>
        ))}

        {/* Fault current vertical line */}
        {relayData.map((rd, i) => {
          if (rd.Ifault < 100 || rd.Ifault > 50000) return null;
          return (
            <line key={`fv${i}`} x1={xS(rd.Ifault)} y1={MT} x2={xS(rd.Ifault)} y2={MT + PH}
              stroke={RELAY_COLORS[rd.name]} strokeDasharray="6 4" strokeWidth="1" opacity="0.4" />
          );
        })}
        {/* Main fault current line (fault level at selected location) */}
        <line x1={xS(faultCurrent * 1000)} y1={MT} x2={xS(faultCurrent * 1000)} y2={MT + PH}
          stroke="#ef4444" strokeDasharray="6 4" strokeWidth="1.5" opacity="0.6" />
        <text x={xS(faultCurrent * 1000)} y={MT + 12} textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="600">
          Selected fault: {faultCurrent} kA
        </text>

        {/* Operating points */}
        {relayData.map((rd, i) => {
          if (rd.opTime >= 100 || rd.opTime <= 0.01 || rd.Ifault < 100 || rd.Ifault > 50000 || rd.psm <= 1) return null;
          return (
            <g key={`op${i}`}>
              <circle cx={xS(rd.Ifault)} cy={yS(rd.opTime)} r="6" fill={RELAY_COLORS[rd.name]} stroke="#fff" strokeWidth="1.5" />
              <text x={xS(rd.Ifault) + (i === 0 ? 12 : i === 1 ? -12 : 12)} y={yS(rd.opTime) - 10}
                textAnchor={i === 1 ? 'end' : 'start'}
                fill={RELAY_COLORS[rd.name]} fontSize="10" fontWeight="700">
                {rd.name}: {rd.opTime.toFixed(3)}s
              </text>
            </g>
          );
        })}

        {/* CTI arrows between operating points */}
        {(() => {
          const valid = relayData.filter(r => r.opTime > 0.01 && r.opTime < 100 && r.psm > 1);
          const sorted = [...valid].sort((a, b) => a.opTime - b.opTime);
          const arrows = [];
          for (let i = 0; i < sorted.length - 1; i++) {
            const r1 = sorted[i], r2 = sorted[i + 1];
            const ax = Math.max(xS(r1.Ifault), xS(r2.Ifault)) + 24;
            if (ax < ML + PW - 10) {
              const diff = (r2.opTime - r1.opTime).toFixed(3);
              arrows.push(
                <g key={`cti${i}`}>
                  <line x1={ax} y1={yS(r1.opTime)} x2={ax} y2={yS(r2.opTime)}
                    stroke="#c4b5fd" strokeWidth="1.5" markerEnd="url(#arrowUp)" markerStart="url(#arrowDown)" />
                  <text x={ax + 8} y={(yS(r1.opTime) + yS(r2.opTime)) / 2 + 4}
                    fill="#c4b5fd" fontSize="9" fontWeight="600">
                    {diff}s
                  </text>
                </g>
              );
            }
          }
          return arrows;
        })()}

        {/* Arrow markers */}
        <defs>
          <marker id="arrowUp" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,6 L3,0 L6,6" fill="none" stroke="#c4b5fd" strokeWidth="1" />
          </marker>
          <marker id="arrowDown" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L3,6 L6,0" fill="none" stroke="#c4b5fd" strokeWidth="1" />
          </marker>
        </defs>

        {/* Legend */}
        <g transform={`translate(${ML + 12}, ${MT + 8})`}>
          <rect width="160" height="80" rx="8" fill="#09090b" fillOpacity="0.85" stroke="#27272a" />
          {['R1', 'R2', 'R3'].map((name, i) => (
            <g key={name} transform={`translate(10, ${14 + i * 22})`}>
              <line x1="0" y1="0" x2="20" y2="0" stroke={RELAY_COLORS[name]} strokeWidth="2.5" />
              <circle cx="10" cy="0" r="3" fill={RELAY_COLORS[name]} />
              <text x="28" y="4" fill={RELAY_COLORS[name]} fontSize="10" fontWeight="600">
                {name} — {relaySettings[name].curve}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ─── Coordination Assessment Panel ─── */
function AssessmentPanel({ relayData, cti, sortedRelays }) {
  const pairs = [
    { downstream: 'R1', upstream: 'R2' },
    { downstream: 'R2', upstream: 'R3' },
  ];

  const pairResults = pairs.map(({ downstream, upstream }) => {
    const dRelay = relayData.find(r => r.name === downstream);
    const uRelay = relayData.find(r => r.name === upstream);
    const tDown = dRelay?.opTime ?? Infinity;
    const tUp = uRelay?.opTime ?? Infinity;
    const diff = tUp - tDown;
    const margin = diff - cti;

    let status, statusColor;
    if (tDown >= Infinity || tUp >= Infinity || dRelay.psm <= 1 || uRelay.psm <= 1) {
      status = 'N/A'; statusColor = '#71717a';
    } else if (diff >= cti) {
      status = 'COORDINATED'; statusColor = '#22c55e';
    } else if (diff >= cti * 0.8) {
      status = 'MARGINAL'; statusColor = '#f59e0b';
    } else {
      status = 'FAIL'; statusColor = '#ef4444';
    }
    return { downstream, upstream, tDown, tUp, diff, margin, status, statusColor };
  });

  const overallOk = pairResults.every(p => p.status === 'COORDINATED' || p.status === 'N/A');
  const overallMarginal = pairResults.some(p => p.status === 'MARGINAL') && !pairResults.some(p => p.status === 'FAIL');
  const overallStatus = overallOk ? 'COORDINATED' : overallMarginal ? 'MARGINAL' : 'FAIL';
  const overallColor = overallOk ? '#22c55e' : overallMarginal ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ padding: '14px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Coordination Assessment
        </span>
        <span style={{
          padding: '3px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
          background: overallColor + '18', color: overallColor, border: `1px solid ${overallColor}40`
        }}>
          {overallStatus}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {pairResults.map((pr, i) => (
          <div key={i} style={{
            flex: '1 1 300px', padding: '10px 14px', background: '#18181b',
            border: `1px solid ${pr.statusColor}30`, borderRadius: 8
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8' }}>
                {pr.downstream} → {pr.upstream}
              </span>
              <span style={{
                padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                background: pr.statusColor + '18', color: pr.statusColor
              }}>
                {pr.status}
              </span>
            </div>
            {pr.status !== 'N/A' ? (
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#a1a1aa', lineHeight: 1.8 }}>
                <Tooltip text={`CTI(${pr.downstream}-${pr.upstream}) = t(${pr.upstream}) − t(${pr.downstream}) = ${pr.tUp.toFixed(3)} − ${pr.tDown.toFixed(3)} = ${pr.diff.toFixed(3)} s\nTarget CTI: ${cti.toFixed(2)} s\n${pr.status === 'COORDINATED' ? 'OK — margin is sufficient' : pr.status === 'MARGINAL' ? 'WARNING — within 20% of target' : 'FAIL — insufficient margin by ' + Math.abs(pr.margin).toFixed(3) + ' s'}`}>
                  <span>Time diff: <span style={{ color: pr.statusColor }}>{pr.diff.toFixed(3)} s</span></span>
                </Tooltip>
                <br />
                <span>CTI margin: <span style={{ color: pr.margin >= 0 ? '#22c55e' : '#ef4444' }}>{pr.margin >= 0 ? '+' : ''}{pr.margin.toFixed(3)} s</span></span>
                {pr.status === 'FAIL' && (
                  <span style={{ color: '#ef4444', marginLeft: 8 }}>
                    (short by {Math.abs(pr.margin).toFixed(3)} s)
                  </span>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 11, color: '#52525b' }}>Relay(s) not activated at this fault level</div>
            )}
          </div>
        ))}
      </div>

      {/* Trip sequence */}
      {sortedRelays.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 11, color: '#a1a1aa' }}>
          <span style={{ color: '#71717a', fontWeight: 600 }}>Trip sequence: </span>
          {sortedRelays.map((r, i) => (
            <span key={r.name}>
              <span style={{ color: RELAY_COLORS[r.name], fontWeight: 600 }}>{r.name}</span>
              <span style={{ color: '#52525b' }}> ({r.opTime.toFixed(3)}s)</span>
              {i < sortedRelays.length - 1 && <span style={{ color: '#3f3f46' }}> → </span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── SVG Theory Diagrams (preserved) ─── */
function RadialFeederSVG() {
  return (
    <svg viewBox="0 0 700 220" style={S.svgDiag}>
      <rect width="700" height="220" fill="#09090b" />
      <text x="350" y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">RADIAL FEEDER WITH MULTIPLE RELAY LOCATIONS</text>
      <circle cx="50" cy="80" r="22" fill="none" stroke="#60a5fa" strokeWidth="2.5" />
      <text x="50" y="85" textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="700">G</text>
      <text x="50" y="118" textAnchor="middle" fill="#71717a" fontSize="9">Source</text>
      <line x1="72" y1="80" x2="100" y2="80" stroke="#e4e4e7" strokeWidth="3" />
      <line x1="100" y1="50" x2="100" y2="110" stroke="#e4e4e7" strokeWidth="4" />
      <line x1="100" y1="80" x2="160" y2="80" stroke="#e4e4e7" strokeWidth="3" />
      <rect x="130" y="66" width="36" height="28" rx="6" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
      <text x="148" y="84" textAnchor="middle" fill="#f59e0b" fontSize="9" fontWeight="700">R3</text>
      <text x="148" y="110" textAnchor="middle" fill="#f59e0b" fontSize="8">Slowest</text>
      <line x1="166" y1="80" x2="300" y2="80" stroke="#e4e4e7" strokeWidth="2.5" />
      <line x1="300" y1="60" x2="300" y2="100" stroke="#e4e4e7" strokeWidth="3" />
      <line x1="300" y1="80" x2="360" y2="80" stroke="#e4e4e7" strokeWidth="2.5" />
      <rect x="330" y="66" width="36" height="28" rx="6" fill="#18181b" stroke="#3b82f6" strokeWidth="2" />
      <text x="348" y="84" textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="700">R2</text>
      <text x="348" y="110" textAnchor="middle" fill="#3b82f6" fontSize="8">Intermediate</text>
      <line x1="366" y1="80" x2="480" y2="80" stroke="#e4e4e7" strokeWidth="2" />
      <line x1="480" y1="60" x2="480" y2="100" stroke="#e4e4e7" strokeWidth="3" />
      <line x1="480" y1="80" x2="540" y2="80" stroke="#e4e4e7" strokeWidth="2" />
      <rect x="510" y="66" width="36" height="28" rx="6" fill="#18181b" stroke="#22c55e" strokeWidth="2" />
      <text x="528" y="84" textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="700">R1</text>
      <text x="528" y="110" textAnchor="middle" fill="#22c55e" fontSize="8">Fastest</text>
      <line x1="546" y1="80" x2="610" y2="80" stroke="#e4e4e7" strokeWidth="2" />
      <rect x="610" y="66" width="50" height="28" rx="6" fill="#18181b" stroke="#71717a" strokeWidth="1.5" />
      <text x="635" y="84" textAnchor="middle" fill="#71717a" fontSize="10">Load</text>
      <g transform="translate(580,50)">
        <line x1="0" y1="14" x2="8" y2="0" stroke="#ef4444" strokeWidth="2.5" />
        <line x1="8" y1="0" x2="16" y2="14" stroke="#ef4444" strokeWidth="2.5" />
        <text x="8" y="28" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="700">Fault</text>
      </g>
      <g transform="translate(100,140)">
        <rect width="560" height="60" rx="10" fill="#18181b" stroke="#27272a" />
        <text x="280" y="20" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="700">COORDINATION PRINCIPLE</text>
        <text x="280" y="40" textAnchor="middle" fill="#a1a1aa" fontSize="10">R1 trips first (fastest). R2 is backup (R1 time + CTI). R3 is backup for R2 (R2 time + CTI).</text>
      </g>
      <text x="528" y="50" textAnchor="middle" fill="#22c55e" fontSize="9">t1</text>
      <text x="348" y="50" textAnchor="middle" fill="#3b82f6" fontSize="9">t2 = t1 + CTI</text>
      <text x="148" y="50" textAnchor="middle" fill="#f59e0b" fontSize="9">t3 = t2 + CTI</text>
    </svg>
  );
}

function TimeDistanceSVG({ cti }) {
  const W = 700, H = 280;
  const ox = 80, oy = 230, pw = 540, ph = 180;
  const relays = [
    { name: 'R1', color: '#22c55e', dist: 0.85, time: 0.15 },
    { name: 'R2', color: '#3b82f6', dist: 0.5, time: 0.15 + cti },
    { name: 'R3', color: '#f59e0b', dist: 0.1, time: 0.15 + 2 * cti },
  ];
  const xS = (d) => ox + d * pw;
  const yS = (t) => oy - (t / 1.5) * ph;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={S.svgDiag}>
      <rect width={W} height={H} fill="#09090b" />
      <text x={W / 2} y="18" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">TIME-DISTANCE GRADING DIAGRAM</text>
      <line x1={ox} y1={oy - ph - 10} x2={ox} y2={oy} stroke="#3f3f46" strokeWidth="1.5" />
      <line x1={ox} y1={oy} x2={ox + pw + 10} y2={oy} stroke="#3f3f46" strokeWidth="1.5" />
      <text x={ox + pw / 2} y={oy + 28} textAnchor="middle" fill="#71717a" fontSize="10">Distance from source (feeder position)</text>
      <text x={ox - 24} y={oy - ph / 2} textAnchor="middle" fill="#71717a" fontSize="10" transform={`rotate(-90 ${ox - 24} ${oy - ph / 2})`}>Operating time (s)</text>
      {[0, 0.3, 0.6, 0.9, 1.2, 1.5].map((t) => (
        <g key={t}>
          <line x1={ox} y1={yS(t)} x2={ox + pw} y2={yS(t)} stroke="#18181b" strokeWidth="0.7" />
          <text x={ox - 8} y={yS(t) + 4} textAnchor="end" fill="#52525b" fontSize="9">{t.toFixed(1)}</text>
        </g>
      ))}
      {relays.map((r) => (
        <g key={r.name}>
          <line x1={xS(r.dist)} y1={oy} x2={xS(r.dist)} y2={yS(r.time)} stroke={r.color} strokeWidth="2" strokeDasharray="4 3" />
          <line x1={xS(r.dist)} y1={yS(r.time)} x2={xS(1)} y2={yS(r.time)} stroke={r.color} strokeWidth="3" />
          <circle cx={xS(r.dist)} cy={yS(r.time)} r="5" fill={r.color} />
          <text x={xS(r.dist) - 8} y={yS(r.time) - 8} fill={r.color} fontSize="10" fontWeight="700">{r.name}</text>
          <text x={xS(0.95)} y={yS(r.time) - 8} textAnchor="end" fill={r.color} fontSize="9">{r.time.toFixed(2)} s</text>
        </g>
      ))}
      <line x1={xS(0.92)} y1={yS(relays[0].time)} x2={xS(0.92)} y2={yS(relays[1].time)} stroke="#c4b5fd" strokeWidth="1.5" />
      <text x={xS(0.92) + 8} y={(yS(relays[0].time) + yS(relays[1].time)) / 2 + 4} fill="#c4b5fd" fontSize="9">CTI</text>
      <line x1={xS(0.92)} y1={yS(relays[1].time)} x2={xS(0.92)} y2={yS(relays[2].time)} stroke="#c4b5fd" strokeWidth="1.5" />
      <text x={xS(0.92) + 8} y={(yS(relays[1].time) + yS(relays[2].time)) / 2 + 4} fill="#c4b5fd" fontSize="9">CTI</text>
      <text x={xS(0.1)} y={oy + 16} textAnchor="middle" fill="#71717a" fontSize="8">Source bus</text>
      <text x={xS(0.5)} y={oy + 16} textAnchor="middle" fill="#71717a" fontSize="8">Mid bus</text>
      <text x={xS(0.85)} y={oy + 16} textAnchor="middle" fill="#71717a" fontSize="8">Load bus</text>
    </svg>
  );
}

function CTIConceptSVG() {
  return (
    <svg viewBox="0 0 700 260" style={S.svgDiag}>
      <rect width="700" height="260" fill="#09090b" />
      <text x="350" y="20" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.06em">COORDINATION TIME INTERVAL (CTI) CONCEPT</text>
      <line x1="80" y1="120" x2="620" y2="120" stroke="#3f3f46" strokeWidth="2" />
      <line x1="100" y1="105" x2="100" y2="135" stroke="#e4e4e7" strokeWidth="2" />
      <text x="100" y="100" textAnchor="middle" fill="#e4e4e7" fontSize="10">t = 0</text>
      <text x="100" y="155" textAnchor="middle" fill="#ef4444" fontSize="9">Fault</text>
      <line x1="250" y1="105" x2="250" y2="135" stroke="#22c55e" strokeWidth="2" />
      <text x="250" y="100" textAnchor="middle" fill="#22c55e" fontSize="10" fontWeight="600">R1 trips</text>
      <text x="250" y="155" textAnchor="middle" fill="#22c55e" fontSize="9">t1 = 0.15 s</text>
      <rect x="250" y="108" width="120" height="24" rx="4" fill="rgba(196,181,253,0.08)" stroke="#c4b5fd" strokeWidth="1" strokeDasharray="3 2" />
      <text x="310" y="124" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="600">CTI</text>
      <line x1="370" y1="105" x2="370" y2="135" stroke="#3b82f6" strokeWidth="2" />
      <text x="370" y="100" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="600">R2 trips</text>
      <text x="370" y="155" textAnchor="middle" fill="#3b82f6" fontSize="9">t2 = t1 + CTI</text>
      <rect x="370" y="108" width="120" height="24" rx="4" fill="rgba(196,181,253,0.08)" stroke="#c4b5fd" strokeWidth="1" strokeDasharray="3 2" />
      <text x="430" y="124" textAnchor="middle" fill="#c4b5fd" fontSize="10" fontWeight="600">CTI</text>
      <line x1="490" y1="105" x2="490" y2="135" stroke="#f59e0b" strokeWidth="2" />
      <text x="490" y="100" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="600">R3 trips</text>
      <text x="490" y="155" textAnchor="middle" fill="#f59e0b" fontSize="9">t3 = t2 + CTI</text>
      <g transform="translate(100,176)">
        <rect width="500" height="68" rx="10" fill="#18181b" stroke="#27272a" />
        <text x="250" y="20" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="700">CTI COMPONENTS (typical 0.2 - 0.4 s)</text>
        <text x="20" y="44" fill="#a1a1aa" fontSize="10">Breaker operating time (3-5 cycles) + Relay overtravel (EM: ~0.1s, Numerical: ~0) + Safety margin (~0.1s)</text>
      </g>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Overcurrent Relay Coordination</h2>
      <p style={S.p}>
        Coordination means the relay nearest to the fault should trip first, while upstream relays remain available
        as delayed backup. This ensures that only the faulted section is isolated, maintaining supply to the rest
        of the network. The coordination time interval (CTI) between successive relays must cover relay overtravel,
        breaker operating time, and a safety margin.
      </p>
      <span style={S.eq}>Tupstream = Tdownstream + CTI at the coordination current</span>

      <h3 style={S.h3}>Radial feeder with multiple relay locations</h3>
      <p style={S.p}>
        In a radial feeder, current flows in one direction from source to load. Multiple relays are placed along the
        feeder, each protecting a section. The relay closest to the fault (downstream) should have the shortest
        operating time. Each upstream relay is graded above the next with a fixed CTI. For any given fault, every
        source-side relay in the fault path sees essentially the same fault current, while relays downstream of the
        fault see no source current at all.
      </p>
      <RadialFeederSVG />

      <h3 style={S.h3}>Time-distance grading</h3>
      <p style={S.p}>
        When plotted on a time-distance diagram, the relay operating times form a staircase pattern. Each step
        represents the CTI between adjacent relays. The lowest step belongs to the most downstream relay,
        and the operating time increases as we move toward the source.
      </p>
      <TimeDistanceSVG cti={0.3} />

      <h3 style={S.h3}>Coordination time interval (CTI)</h3>
      <p style={S.p}>
        The CTI is not an arbitrary number. It has specific physical components that must be accounted for to
        ensure selectivity. If the CTI is too small, the upstream relay may trip before the downstream one can
        clear the fault. If too large, the upstream relay allows excessive fault damage.
      </p>
      <CTIConceptSVG />

      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>CTI Component</th>
            <th style={S.th}>Electromechanical</th>
            <th style={S.th}>Numerical</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}>Breaker operating time</td>
            <td style={S.td}>3-5 cycles (60-100 ms)</td>
            <td style={S.td}>3-5 cycles (60-100 ms)</td>
          </tr>
          <tr>
            <td style={S.td}>Relay overtravel</td>
            <td style={S.td}>~100 ms (disc momentum)</td>
            <td style={S.td}>~0 ms (digital reset)</td>
          </tr>
          <tr>
            <td style={S.td}>Safety margin</td>
            <td style={S.td}>~100 ms</td>
            <td style={S.td}>~50-100 ms</td>
          </tr>
          <tr>
            <td style={S.td}>Total CTI</td>
            <td style={S.td}>0.3-0.4 s</td>
            <td style={S.td}>0.2-0.3 s</td>
          </tr>
        </tbody>
      </table>

      <h3 style={S.h3}>Coordination procedure</h3>
      <ul style={S.ul}>
        <li style={S.li}>Start from the most downstream relay (nearest to the load). Choose the curve type and TMS for the required operating time at maximum fault current.</li>
        <li style={S.li}>Move upstream one relay at a time. At the maximum fault current seen by both relays, set the upstream relay to trip at the downstream relay's time plus CTI.</li>
        <li style={S.li}>Verify the coordination at multiple fault levels (maximum and minimum) to ensure the margin is maintained across the range.</li>
        <li style={S.li}>Check that the most upstream relay still clears within the equipment withstand time at the source fault level.</li>
      </ul>

      <h3 style={S.h3}>Practical considerations</h3>
      <ul style={S.ul}>
        <li style={S.li}>As more relays are added in series, the upstream relay operating time increases cumulatively, which can become a problem near the source.</li>
        <li style={S.li}>Using EI or VI curves can reduce the total grading time compared to SI curves when fault current drops significantly with distance.</li>
        <li style={S.li}>Definite minimum time elements are often added to provide an upper bound on operating time regardless of current level.</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>Indian practice</span>
        <p style={S.ctxP}>
          In Indian numerical-relay practice, CTI around 0.2-0.3 s is common, while older electromechanical systems
          often used 0.3-0.4 s due to disc overtravel. CBIP guidelines and utility coordination studies typically
          use SI curves for standard feeders and VI or EI curves for transformer-backed circuits.
          At 11 kV distribution, three to four relays in series is typical. At 33 kV, two to three relays are common.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>IEC 60255 relay characteristic definitions</li>
        <li style={S.li}>Y.G. Paithankar and S.R. Bhide, <em>Fundamentals of Power System Protection</em></li>
        <li style={S.li}>J. Lewis Blackburn and Thomas J. Domin, <em>Protective Relaying: Principles and Applications</em></li>
        <li style={S.li}>CBIP Manual on Protective Relays and Co-ordination</li>
        <li style={S.li}>B.L. Theraja and A.K. Theraja, <em>A Textbook of Electrical Technology, Vol. III</em></li>
      </ul>
    </div>
  );
}

/* ─── Main Component ─── */
export default function OvercurrentCoordination() {
  const [tab, setTab] = useState('simulate');
  const [cti, setCti] = useState(0.3);
  const [faultCurrent, setFaultCurrent] = useState(10); // kA
  const [faultLocation, setFaultLocation] = useState(0);

  const [relaySettings, setRelaySettings] = useState({
    R1: { curve: 'SI', tms: 0.100, pickupSec: 0.8, ctRatio: 400 },
    R2: { curve: 'SI', tms: 0.250, pickupSec: 0.9, ctRatio: 600 },
    R3: { curve: 'SI', tms: 0.450, pickupSec: 1.0, ctRatio: 800 },
  });

  const updateRelay = useCallback((name, settings) => {
    setRelaySettings(prev => ({ ...prev, [name]: settings }));
  }, []);

  // Compute relay data for results
  const loc = FAULT_LOCATIONS[faultLocation];
  const relayData = useMemo(() => buildRelayData(relaySettings, faultCurrent, loc), [relaySettings, faultCurrent, loc]);

  const sortedRelays = useMemo(() => {
    return [...relayData].filter(r => r.opTime > 0 && r.opTime < Infinity && r.psm > 1)
      .sort((a, b) => a.opTime - b.opTime);
  }, [relayData]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          {/* ─── Controls Section ─── */}
          <div style={{ padding: '16px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' }}>
            {/* Per-Relay Settings */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
              {['R1', 'R2', 'R3'].map(name => (
                <RelayPanel
                  key={name}
                  relay={name}
                  color={RELAY_COLORS[name]}
                  borderColor={RELAY_BORDERS[name]}
                  settings={relaySettings[name]}
                  onChange={(s) => updateRelay(name, s)}
                />
              ))}
            </div>

            {/* Fault & CTI Settings */}
            <div style={{
              display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center',
              padding: '10px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Fault Level</span>
                <input type="range" min="5" max="50" step="0.5" value={faultCurrent}
                  onChange={(e) => setFaultCurrent(Number(e.target.value))}
                  style={{ width: 140, accentColor: '#ef4444' }} />
                <span style={{ fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 52 }}>
                  {faultCurrent.toFixed(1)} kA
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600 }}>Fault Location</span>
                <select
                  value={faultLocation}
                  onChange={(e) => setFaultLocation(Number(e.target.value))}
                  style={{
                    background: '#09090b', border: '1px solid #3f3f46', borderRadius: 6,
                    color: '#e4e4e7', fontSize: 12, padding: '4px 10px', outline: 'none'
                  }}
                >
                  {FAULT_LOCATIONS.map((fl, i) => (
                    <option key={i} value={i}>{fl.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#c4b5fd', fontWeight: 600 }}>Target CTI</span>
                <input type="range" min="0.15" max="0.50" step="0.01" value={cti}
                  onChange={(e) => setCti(Number(e.target.value))}
                  style={{ width: 100, accentColor: '#c4b5fd' }} />
                <span style={{ fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 40 }}>
                  {cti.toFixed(2)} s
                </span>
              </div>
            </div>
          </div>

          {/* ─── TCC Plot ─── */}
          <div style={{ flex: 1, padding: '12px 16px', display: 'flex', justifyContent: 'center', minHeight: 400 }}>
            <TCCPlot
              relaySettings={relaySettings}
              faultCurrent={faultCurrent}
              faultLocation={faultLocation}
              cti={cti}
            />
          </div>

          {/* ─── Relay Results ─── */}
          <div style={{
            display: 'flex', gap: 12, flexWrap: 'wrap', padding: '12px 24px',
            background: '#0c0c0f', borderTop: '1px solid #1e1e2e'
          }}>
            {relayData.map((rd) => {
              const curveDef = CURVES[rd.settings.curve];
              const formulaText = `${curveDef.formula}\nTMS = ${rd.settings.tms.toFixed(3)}, PSM = ${rd.Ifault.toFixed(0)} / ${rd.pickupPrimary.toFixed(0)} = ${rd.psm.toFixed(2)}\nt = ${rd.opTime < Infinity ? rd.opTime.toFixed(3) + ' s' : '∞ (PSM ≤ 1)'}`;
              const pickupText = `Relay pickup = ${rd.settings.pickupSec.toFixed(2)} A secondary\nCT ratio = ${rd.settings.ctRatio}/1\nPrimary pickup = ${rd.pickupPrimary.toFixed(0)} A\nPSM = ${rd.Ifault.toFixed(0)} / ${rd.pickupPrimary.toFixed(0)} = ${rd.psm.toFixed(2)}`;

              return (
                <div key={rd.name} style={{
                  flex: '1 1 200px', padding: '10px 14px', background: '#18181b',
                  border: `1px solid ${RELAY_COLORS[rd.name]}30`, borderRadius: 8
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: RELAY_COLORS[rd.name], marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {rd.name} Results
                  </div>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#a1a1aa', lineHeight: 1.9 }}>
                    <Tooltip text={pickupText}>
                      <span>PSM: <span style={{ color: '#e4e4e7', fontWeight: 600 }}>{rd.psm > 0 ? rd.psm.toFixed(2) : 'N/A'}</span></span>
                    </Tooltip>
                    <br />
                    <span>Seen fault: <span style={{ color: '#e4e4e7' }}>{rd.Ifault > 0 ? (rd.Ifault / 1000).toFixed(1) + ' kA' : 'none'}</span></span>
                    <br />
                    <Tooltip text={formulaText}>
                      <span>Time: <span style={{ color: RELAY_COLORS[rd.name], fontWeight: 600 }}>
                        {rd.opTime < Infinity ? rd.opTime.toFixed(3) + ' s' : '∞'}
                      </span></span>
                    </Tooltip>
                    <br />
                    <span>I²t: <span style={{ color: '#e4e4e7' }}>
                      {rd.i2t < Infinity ? (rd.i2t / 1e6).toFixed(2) + ' MA²s' : '∞'}
                    </span></span>
                    <br />
                    <span>Sequence: <span style={{ color: '#e4e4e7' }}>
                      {(() => {
                        const idx = sortedRelays.findIndex(r => r.name === rd.name);
                        return idx >= 0 ? `#${idx + 1}` : 'N/A';
                      })()}
                    </span></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Coordination Assessment ─── */}
          <AssessmentPanel relayData={relayData} cti={cti} sortedRelays={sortedRelays} />

          {/* ─── Info Strip ─── */}
          <div style={{ display: 'flex', gap: 12, padding: '12px 24px', background: '#0f0f12', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 220px', padding: '12px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 10 }}>
              <span style={{ display: 'block', fontSize: 10, color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>IEC 60255 Curves</span>
              <span style={{ display: 'block', fontSize: 12, color: '#c4b5fd', fontFamily: 'monospace', lineHeight: 1.7 }}>
                SI: 0.14 / (PSM^0.02 - 1){'\n'}
                VI: 13.5 / (PSM - 1){'\n'}
                EI: 80 / (PSM² - 1){'\n'}
                LTI: 120 / (PSM - 1)
              </span>
            </div>
            <div style={{ flex: '1 1 220px', padding: '12px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 10 }}>
              <span style={{ display: 'block', fontSize: 10, color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Fault current path</span>
              <span style={{ display: 'block', fontSize: 12, color: '#c4b5fd', fontFamily: 'monospace', lineHeight: 1.7 }}>
                R1: {loc.seenBy.includes('R1') ? `${faultCurrent.toFixed(1)} kA` : '0 kA'}{'\n'}
                R2: {loc.seenBy.includes('R2') ? `${faultCurrent.toFixed(1)} kA` : '0 kA'}{'\n'}
                R3: {loc.seenBy.includes('R3') ? `${faultCurrent.toFixed(1)} kA` : '0 kA'}
              </span>
            </div>
            <div style={{ flex: '1 1 220px', padding: '12px 14px', background: '#18181b', border: '1px solid #27272a', borderRadius: 10 }}>
              <span style={{ display: 'block', fontSize: 10, color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Engineering note</span>
              <span style={{ display: 'block', fontSize: 12, color: '#c4b5fd', fontFamily: 'monospace', lineHeight: 1.7 }}>
                Fault current is common to all{'\n'}
                source-side relays for a given fault.{'\n'}
                {loc.note}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
