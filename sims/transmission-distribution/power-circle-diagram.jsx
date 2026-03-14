import React, { useState, useMemo } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '20px 16px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 130, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 50, textAlign: 'right' },
  results: { display: 'flex', gap: 32, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  theory: { flex: 1, padding: '32px 24px', maxWidth: 820, margin: '0 auto', overflowY: 'auto', width: '100%' },
  h2: { fontSize: 22, fontWeight: 700, color: '#f4f4f5', margin: '36px 0 14px', paddingBottom: 8, borderBottom: '1px solid #27272a' },
  h3: { fontSize: 17, fontWeight: 600, color: '#e4e4e7', margin: '24px 0 10px' },
  p: { fontSize: 15, lineHeight: 1.8, color: '#a1a1aa', margin: '0 0 14px' },
  eq: { display: 'block', padding: '14px 20px', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, fontFamily: 'monospace', fontSize: 15, color: '#c4b5fd', margin: '16px 0', textAlign: 'center', overflowX: 'auto' },
  ctx: { padding: '16px 20px', background: 'rgba(99,102,241,0.06)', borderLeft: '3px solid #6366f1', borderRadius: '0 12px 12px 0', margin: '20px 0' },
  ctxT: { fontWeight: 600, color: '#818cf8', marginBottom: 6, fontSize: 14, display: 'block' },
  ctxP: { fontSize: 14, lineHeight: 1.7, color: '#a1a1aa', margin: 0 },
  ul: { paddingLeft: 20, margin: '10px 0' },
  li: { fontSize: 14, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 4 },
  tbl: { width: '100%', borderCollapse: 'collapse', margin: '16px 0', fontSize: 13 },
  th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #3f3f46', color: '#d4d4d8', fontWeight: 600 },
  td: { padding: '10px 12px', borderBottom: '1px solid #27272a', color: '#a1a1aa' },
};

const DEG = Math.PI / 180;

const PRESETS = [
  { name: 'Short', desc: '80 km', aM: 0.999, aD: 0.3, bM: 16, bD: 80 },
  { name: 'Medium', desc: '200 km', aM: 0.98, aD: 1.2, bM: 42, bD: 85 },
  { name: 'Long', desc: '400 km', aM: 0.93, aD: 3.5, bM: 130, bD: 88 },
];

const btnS = (on) => ({
  padding: '4px 10px', borderRadius: 6,
  border: on ? '1px solid #6366f1' : '1px solid #27272a',
  background: on ? 'rgba(99,102,241,0.15)' : 'transparent',
  color: on ? '#a5b4fc' : '#52525b',
  fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
});

function gridStep(range) {
  if (range < 1) return 1;
  const raw = range / 6;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  if (n <= 1.5) return mag;
  if (n <= 3.5) return mag * 2;
  if (n <= 7.5) return mag * 5;
  return mag * 10;
}

function calc(Vs, Vr, aM, aD, bM, bD, dD) {
  const alpha = aD * DEG, beta = bD * DEG, delta = dD * DEG;
  const R = Vs * Vr / bM;

  const crP = -(aM * Vr * Vr / bM) * Math.cos(beta - alpha);
  const crQ = -(aM * Vr * Vr / bM) * Math.sin(beta - alpha);
  const Pr = crP + R * Math.cos(beta - delta);
  const Qr = crQ + R * Math.sin(beta - delta);
  const PrMax = crP + R;
  const QrMax = crQ;

  const csP = (aM * Vs * Vs / bM) * Math.cos(beta - alpha);
  const csQ = (aM * Vs * Vs / bM) * Math.sin(beta - alpha);
  const Ps = csP - R * Math.cos(beta + delta);
  const Qs = csQ - R * Math.sin(beta + delta);

  const margin = bD > 0 ? Math.max(0, (bD - dD) / bD * 100) : 0;
  return { Pr, Qr, Ps, Qs, PrMax, QrMax, crP, crQ, csP, csQ, R, margin, beta, alpha, delta, bD, dD };
}

function Diagram({ d }) {
  const { crP, crQ, csP, csQ, R, Pr, Qr, Ps, Qs, PrMax, QrMax, beta, delta, bD, dD } = d;

  const W = 800, H = 510;
  const ML = 65, MR = 15, MT = 25, MB = 42;
  const pw = W - ML - MR, ph = H - MT - MB;

  const limD = Math.min(92, bD + 5);
  const pts = [[0, 0], [Pr, Qr], [Ps, Qs], [crP, crQ], [PrMax, QrMax]];
  for (let i = 0; i <= limD; i += 3) {
    const a = beta - i * DEG;
    pts.push([crP + R * Math.cos(a), crQ + R * Math.sin(a)]);
  }

  let p0 = Infinity, p1 = -Infinity, q0 = Infinity, q1 = -Infinity;
  for (const [p, q] of pts) { p0 = Math.min(p0, p); p1 = Math.max(p1, p); q0 = Math.min(q0, q); q1 = Math.max(q1, q); }
  const pad = Math.max(p1 - p0, q1 - q0, 100) * 0.08;
  p0 -= pad; p1 += pad; q0 -= pad; q1 += pad;

  const sc = Math.min(pw / (p1 - p0), ph / (q1 - q0));
  const uw = (p1 - p0) * sc, uh = (q1 - q0) * sc;
  const ox = ML + (pw - uw) / 2, oy = MT + (ph - uh) / 2;

  const px = (v) => ox + (v - p0) * sc;
  const py = (v) => oy + uh - (v - q0) * sc;
  const sr = (v) => v * sc;

  const sP = gridStep(p1 - p0), sQ = gridStep(q1 - q0);
  const gP = [], gQ = [];
  for (let v = Math.ceil(p0 / sP) * sP; v <= p1; v += sP) gP.push(v);
  for (let v = Math.ceil(q0 / sQ) * sQ; v <= q1; v += sQ) gQ.push(v);

  const stPts = [`${px(crP).toFixed(1)},${py(crQ).toFixed(1)}`];
  for (let i = 0; i <= bD; i++) {
    const a = beta - i * DEG;
    stPts.push(`${px(crP + R * Math.cos(a)).toFixed(1)},${py(crQ + R * Math.sin(a)).toFixed(1)}`);
  }

  const aR = Math.min(35, sr(R) * 0.07);
  const aPts = [];
  for (let i = 0; i <= 24; i++) {
    const a = beta - delta * i / 24;
    aPts.push(`${(px(crP) + aR * Math.cos(a)).toFixed(1)},${(py(crQ) - aR * Math.sin(a)).toFixed(1)}`);
  }

  const ref0P = crP + R * Math.cos(beta);
  const ref0Q = crQ + R * Math.sin(beta);

  const showPA = q0 <= 0 && q1 >= 0;
  const showQA = p0 <= 0 && p1 >= 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <defs><clipPath id="pc"><rect x={ML} y={MT} width={pw} height={ph} /></clipPath></defs>

      {gP.map((v) => <line key={`gp${v}`} x1={px(v)} y1={MT} x2={px(v)} y2={MT + ph} stroke="#18181b" strokeWidth={0.5} />)}
      {gQ.map((v) => <line key={`gq${v}`} x1={ML} y1={py(v)} x2={ML + pw} y2={py(v)} stroke="#18181b" strokeWidth={0.5} />)}

      {showPA && <line x1={ML} y1={py(0)} x2={ML + pw} y2={py(0)} stroke="#3f3f46" strokeWidth={1} />}
      {showQA && <line x1={px(0)} y1={MT} x2={px(0)} y2={MT + ph} stroke="#3f3f46" strokeWidth={1} />}

      {gP.map((v) => <text key={`tp${v}`} x={px(v)} y={MT + ph + 14} textAnchor="middle" fill="#52525b" fontSize={9}>{v.toFixed(0)}</text>)}
      {gQ.map((v) => <text key={`tq${v}`} x={ML - 5} y={py(v) + 3} textAnchor="end" fill="#52525b" fontSize={9}>{v.toFixed(0)}</text>)}

      <text x={ML + pw / 2} y={H - 4} textAnchor="middle" fill="#71717a" fontSize={11} fontWeight={500}>P (MW)</text>
      <text x={12} y={MT + ph / 2} textAnchor="middle" fill="#71717a" fontSize={11} fontWeight={500}
        transform={`rotate(-90 12 ${MT + ph / 2})`}>Q (MVAr)</text>

      <g clipPath="url(#pc)">
        <polygon points={stPts.join(' ')} fill="#22c55e" opacity={0.06} />

        <circle cx={px(crP)} cy={py(crQ)} r={sr(R)} fill="none" stroke="#06b6d4" strokeWidth={1.5} opacity={0.5} />
        <circle cx={px(csP)} cy={py(csQ)} r={sr(R)} fill="none" stroke="#f59e0b" strokeWidth={1} strokeDasharray="6 3" opacity={0.3} />

        <line x1={px(crP)} y1={py(crQ)} x2={px(ref0P)} y2={py(ref0Q)}
          stroke="#06b6d4" strokeWidth={0.7} strokeDasharray="4 3" opacity={0.3} />
        <line x1={px(crP)} y1={py(crQ)} x2={px(PrMax)} y2={py(QrMax)}
          stroke="#ef4444" strokeWidth={0.7} strokeDasharray="3 3" opacity={0.35} />
        <line x1={px(crP)} y1={py(crQ)} x2={px(Pr)} y2={py(Qr)}
          stroke="#06b6d4" strokeWidth={1.2} opacity={0.6} />
        <line x1={px(csP)} y1={py(csQ)} x2={px(Ps)} y2={py(Qs)}
          stroke="#f59e0b" strokeWidth={1} opacity={0.35} />

        {delta > 0.03 && (
          <polyline points={aPts.join(' ')} fill="none" stroke="#c4b5fd" strokeWidth={1.2} opacity={0.7} />
        )}
        {delta > 0.08 && (() => {
          const mA = beta - delta / 2;
          return (
            <text x={px(crP) + (aR + 14) * Math.cos(mA)} y={py(crQ) - (aR + 14) * Math.sin(mA)}
              textAnchor="middle" dominantBaseline="middle" fill="#c4b5fd" fontSize={10} fontWeight={600}>δ</text>
          );
        })()}

        <line x1={px(crP) - 6} y1={py(crQ)} x2={px(crP) + 6} y2={py(crQ)} stroke="#06b6d4" strokeWidth={1.5} />
        <line x1={px(crP)} y1={py(crQ) - 6} x2={px(crP)} y2={py(crQ) + 6} stroke="#06b6d4" strokeWidth={1.5} />
        <text x={px(crP) + 10} y={py(crQ) - 8} fill="#06b6d4" fontSize={9} fontWeight={600}>Cr</text>

        <line x1={px(csP) - 5} y1={py(csQ)} x2={px(csP) + 5} y2={py(csQ)} stroke="#f59e0b" strokeWidth={1.5} />
        <line x1={px(csP)} y1={py(csQ) - 5} x2={px(csP)} y2={py(csQ) + 5} stroke="#f59e0b" strokeWidth={1.5} />
        <text x={px(csP) + 10} y={py(csQ) - 8} fill="#f59e0b" fontSize={9} fontWeight={600}>Cs</text>

        <circle cx={px(PrMax)} cy={py(QrMax)} r={5} fill="none" stroke="#ef4444" strokeWidth={2} />
        <text x={px(PrMax) + 10} y={py(QrMax) - 8} fill="#ef4444" fontSize={9} fontWeight={600}>
          Pmax = {PrMax.toFixed(0)}
        </text>

        <circle cx={px(Pr)} cy={py(Qr)} r={5} fill="#06b6d4" stroke="#09090b" strokeWidth={1.5} />
        <text x={px(Pr) + 10} y={py(Qr) - 10} fill="#06b6d4" fontSize={10} fontWeight={600}>
          ({Pr.toFixed(0)}, {Qr.toFixed(0)})
        </text>

        <circle cx={px(Ps)} cy={py(Qs)} r={5} fill="#f59e0b" stroke="#09090b" strokeWidth={1.5} />
        <text x={px(Ps) - 10} y={py(Qs) + 16} fill="#f59e0b" fontSize={10} fontWeight={600} textAnchor="end">
          ({Ps.toFixed(0)}, {Qs.toFixed(0)})
        </text>

        {/* δ=0 reference label */}
        <text x={px(ref0P) + 8} y={py(ref0Q) - 6} fill="#52525b" fontSize={8}>δ=0</text>
      </g>

      <rect x={W - 190} y={MT + 5} width={180} height={66} rx={6} fill="rgba(9,9,11,0.92)" stroke="#27272a" strokeWidth={0.5} />
      <circle cx={W - 174} cy={MT + 19} r={4} fill="#06b6d4" />
      <text x={W - 164} y={MT + 23} fill="#a1a1aa" fontSize={10}>Receiving-end circle</text>
      <line x1={W - 179} y1={MT + 37} x2={W - 169} y2={MT + 37} stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 2" />
      <text x={W - 164} y={MT + 41} fill="#a1a1aa" fontSize={10}>Sending-end circle</text>
      <rect x={W - 179} y={MT + 51} width={10} height={6} rx={1} fill="#22c55e" opacity={0.3} />
      <text x={W - 164} y={MT + 57} fill="#a1a1aa" fontSize={10}>Stable region (δ {'<'} β)</text>

      {showPA && showQA && <text x={px(0) + 5} y={py(0) - 5} fill="#71717a" fontSize={9}>O</text>}
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Power Circle Diagram — Derivation & Application</h2>
      <p style={S.p}>
        The power circle diagram is a graphical construction that maps the complex power at each
        end of a transmission line onto a P–Q plane as a function of the load angle δ. For any
        given set of ABCD parameters and terminal voltages, the locus of complex power traces a
        circle — hence the name. It provides an immediate visual picture of real power transfer,
        reactive power requirements, and the <strong style={{ color: '#e4e4e7' }}>steady-state stability limit</strong>.
      </p>

      <h3 style={S.h3}>Starting Point: ABCD Equations</h3>
      <p style={S.p}>
        For a two-port transmission line with parameters A = |A|∠α, B = |B|∠β, D = |D|∠δ_D
        (and D = A for a symmetric line), the sending and receiving-end quantities are related by:
      </p>
      <div style={S.eq}>Vs = A · Vr + B · Ir &emsp;|&emsp; Is = C · Vr + D · Ir</div>
      <p style={S.p}>
        Taking Vr = |Vr|∠0° as reference and Vs = |Vs|∠δ, we can express the receiving-end
        current as Ir = (Vs − A·Vr) / B and compute the complex power Sr = Vr · Ir*.
      </p>

      <h3 style={S.h3}>Receiving-End Power Circle</h3>
      <p style={S.p}>
        After algebraic manipulation, the three-phase receiving-end complex power becomes:
      </p>
      <div style={S.eq}>Sr = Pr + jQr = (|Vs||Vr| / |B|)∠(β − δ) − (|A||Vr|² / |B|)∠(β − α)</div>
      <p style={S.p}>
        The second term is a fixed complex number (independent of δ), while the first term
        traces a circle of radius |Vs||Vr|/|B| as δ varies. Therefore:
      </p>
      <div style={S.eq}>Centre Cr = (−|A||Vr|²cos(β−α)/|B|, &ensp;−|A||Vr|²sin(β−α)/|B|)</div>
      <div style={S.eq}>Radius r = |Vs| · |Vr| / |B| &emsp;(MW)</div>
      <p style={S.p}>
        Since β ≈ 80–88° for typical transmission lines, cos(β−α) is small and positive,
        placing the P-coordinate of the centre slightly negative. The sin(β−α) ≈ 1 term makes
        the Q-coordinate strongly negative — the centre lies far below the P-axis.
      </p>

      <h3 style={S.h3}>Sending-End Power Circle</h3>
      <p style={S.p}>
        Using the inverse ABCD relation, Is = (D·Vs − Vr)/B, the sending-end complex power is:
      </p>
      <div style={S.eq}>Ss = Ps + jQs = (|A||Vs|² / |B|)∠(β − α) − (|Vs||Vr| / |B|)∠(β + δ)</div>
      <p style={S.p}>
        The sending-end circle has the same radius as the receiving-end but its centre is in
        the upper half-plane at positive (P, Q):
      </p>
      <div style={S.eq}>Centre Cs = (|A||Vs|²cos(β−α)/|B|, &ensp;|A||Vs|²sin(β−α)/|B|)</div>
      <p style={S.p}>
        The difference Ps − Pr = line losses, and Qs − Qr reflects the net reactive power
        consumed by the line's series inductance and generated by its shunt capacitance.
      </p>

      <h3 style={S.h3}>Steady-State Stability Limit</h3>
      <p style={S.p}>
        The receiving-end power Pr = (|Vs||Vr|/|B|)cos(β−δ) − (|A||Vr|²/|B|)cos(β−α) is
        maximised when cos(β−δ) = 1, i.e., when <strong style={{ color: '#e4e4e7' }}>δ = β</strong>:
      </p>
      <div style={S.eq}>Pr,max = |Vs|·|Vr|/|B| − (|A|·|Vr|²/|B|)·cos(β − α)</div>
      <p style={S.p}>
        Beyond δ = β the system loses synchronism — any further increase in load causes a
        cascading decrease in power transfer. This is the <strong style={{ color: '#e4e4e7' }}>
        steady-state stability limit</strong>. The operating point is the rightmost point on
        the receiving-end circle (the Pmax point).
      </p>

      <h3 style={S.h3}>Three Limits on Line Loading</h3>
      <p style={S.p}>
        A transmission line's loadability is constrained by whichever of three limits binds first:
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Limit</th>
            <th style={S.th}>Governed By</th>
            <th style={S.th}>Typically Binding For</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Thermal Limit', 'Conductor current rating, ambient temperature, sag clearance', 'Short lines (< 80 km)'],
            ['Voltage Drop Limit', 'Acceptable voltage regulation (±5% per IEGC)', 'Medium lines (80–300 km)'],
            ['Stability Limit', 'Maximum power at δ = β on the circle diagram', 'Long lines (> 300 km)'],
          ].map(([lim, gov, bind]) => (
            <tr key={lim}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{lim}</td>
              <td style={S.td}>{gov}</td>
              <td style={S.td}>{bind}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={S.p}>
        As line length increases, the |B| parameter grows, reducing the radius of the power
        circle and thus the stability limit. For lines longer than roughly 300 km (at 400 kV),
        the stability limit drops below the thermal rating, making it the binding constraint.
      </p>

      <h3 style={S.h3}>Operating Point Selection</h3>
      <p style={S.p}>
        System planners typically choose the operating load angle
        δ {'<'} 30° to maintain an adequate stability margin. The margin is defined as:
      </p>
      <div style={S.eq}>Stability Margin = (β − δ) / β × 100%</div>
      <p style={S.p}>
        A margin of 60–75% (δ around 20–30°) provides sufficient room for transient swings
        following fault clearing. For critical inter-regional corridors, even more conservative
        margins (δ {'<'} 20°) are mandated by PGCIL planning criteria.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Real-World Context — AP Transco / PGCIL</span>
        <p style={S.ctxP}>
          AP Transco system planners use the power circle diagram to determine loadability of
          400 kV and 220 kV lines. The stability limit is typically the binding constraint for
          long lines ({'>'}200 km), while thermal limits bind for short lines. For the 400 kV
          Kurnool–Nellore corridor (~350 km), PGCIL studies show the steady-state stability
          limit at approximately 1100 MW per circuit, well below the thermal rating of ~2000 MW.
          Operating at δ ≈ 25° keeps power transfer around 500–600 MW with a comfortable
          stability margin, and shunt compensation (reactors during off-peak, capacitors during
          peak) is sized to keep the operating point within the acceptable Q range on the
          circle diagram.
        </p>
      </div>

      <h3 style={S.h3}>Worked Example</h3>
      <p style={S.p}>
        Consider a 200 km, 400 kV transmission line with ABCD parameters:
      </p>
      <div style={S.eq}>A = 0.98∠1.2°, &ensp;B = 42∠85° Ω, &ensp;|Vs| = |Vr| = 400 kV</div>
      <p style={S.p}><strong style={{ color: '#e4e4e7' }}>Radius</strong> of both circles:</p>
      <div style={S.eq}>r = 400 × 400 / 42 = 3810 MW</div>
      <p style={S.p}><strong style={{ color: '#e4e4e7' }}>Receiving-end centre Cr:</strong></p>
      <div style={S.eq}>
        Cr_P = −(0.98 × 400²/42) × cos(83.8°) = −3733 × 0.108 = −403 MW
      </div>
      <div style={S.eq}>
        Cr_Q = −(0.98 × 400²/42) × sin(83.8°) = −3733 × 0.994 = −3711 MVAr
      </div>
      <p style={S.p}><strong style={{ color: '#e4e4e7' }}>At δ = 25°:</strong></p>
      <div style={S.eq}>Pr = 3810 × cos(60°) − 403 = 1905 − 403 = 1502 MW</div>
      <div style={S.eq}>Qr = 3810 × sin(60°) − 3711 = 3300 − 3711 = −411 MVAr</div>
      <p style={S.p}><strong style={{ color: '#e4e4e7' }}>Maximum power (at δ = β = 85°):</strong></p>
      <div style={S.eq}>Pr,max = 3810 − 403 = 3407 MW</div>
      <p style={S.p}>
        The stability margin at δ = 25° is (85° − 25°)/85° × 100 = <strong style={{ color: '#22c55e' }}>70.6%</strong>.
        The negative Qr indicates the line is absorbing reactive power from the receiving end —
        shunt capacitor compensation would be needed if the load cannot supply this VAr demand.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Practical Insight — Circle Radius and Line Length</span>
        <p style={S.ctxP}>
          The radius r = |Vs||Vr|/|B| decreases with line length because |B| grows roughly
          proportionally to length. For a short 80 km line (|B| ≈ 16 Ω), r ≈ 10,000 MW — the
          circle is so large that the operating arc is nearly a straight line, indicating the
          stability limit is far from binding. For a long 400 km line (|B| ≈ 130 Ω), r ≈ 1231 MW
          — a tighter circle where the stability limit genuinely constrains operation.
        </p>
      </div>

      <h3 style={S.h3}>Sending vs Receiving Power — Line Losses</h3>
      <p style={S.p}>
        At any load angle δ, the difference Ps − Pr represents the real power lost in the line's
        series resistance. The difference Qs − Qr reflects both the reactive power consumed by
        series inductance and the reactive power generated by shunt capacitance. In the circle
        diagram, these differences are visible as the horizontal and vertical offsets between
        the two operating points.
      </p>

      <h3 style={S.h3}>Effect of Voltage Magnitude</h3>
      <p style={S.p}>
        Raising |Vs| or |Vr| increases the circle radius linearly, directly increasing the maximum
        transferable power. This is the fundamental motivation for operating at higher voltages
        (400 kV, 765 kV) on long transmission corridors. Additionally, shunt compensation that
        boosts |Vr| moves the receiving-end centre outward along the P axis, further increasing
        Pr,max.
      </p>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Stevenson, W.D. — <em>Elements of Power System Analysis</em>, 4th Edition, McGraw-Hill</li>
        <li style={S.li}>Glover, Sarma, Overbye — <em>Power Systems Analysis and Design</em>, 6th Edition, Cengage</li>
        <li style={S.li}>PGCIL — Manual on Transmission Planning Criteria, 2023</li>
        <li style={S.li}>Central Electricity Authority — Manual on Transmission Planning Criteria</li>
        <li style={S.li}>Wadhwa, C.L. — <em>Electrical Power Systems</em>, New Academic Science</li>
      </ul>
    </div>
  );
}

export default function PowerCircleDiagram() {
  const [tab, setTab] = useState('simulate');
  const [Vs, setVs] = useState(400);
  const [Vr, setVr] = useState(400);
  const [dD, setDD] = useState(25);
  const [aM, setAM] = useState(0.98);
  const [aD, setAD] = useState(1.2);
  const [bM, setBM] = useState(42);
  const [bD, setBD] = useState(85);
  const [preset, setPreset] = useState(1);

  const d = useMemo(() => calc(Vs, Vr, aM, aD, bM, bD, dD), [Vs, Vr, aM, aD, bM, bD, dD]);

  const applyPreset = (i) => {
    const p = PRESETS[i];
    setAM(p.aM); setAD(p.aD); setBM(p.bM); setBD(p.bD);
    setPreset(i);
  };

  const mCol = d.margin > 40 ? '#22c55e' : d.margin > 15 ? '#f59e0b' : '#ef4444';

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram d={d} />
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Pr</span>
              <span style={{ ...S.rv, color: '#06b6d4' }}>{d.Pr.toFixed(0)} MW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Qr</span>
              <span style={{ ...S.rv, color: '#06b6d4' }}>{d.Qr.toFixed(0)} MVAr</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Ps</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{d.Ps.toFixed(0)} MW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Qs</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{d.Qs.toFixed(0)} MVAr</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Pmax</span>
              <span style={{ ...S.rv, color: '#ef4444' }}>{d.PrMax.toFixed(0)} MW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>δ at Pmax</span>
              <span style={{ ...S.rv, color: '#c4b5fd' }}>{d.bD.toFixed(1)}°</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Margin</span>
              <span style={{ ...S.rv, color: mCol }}>{d.margin.toFixed(1)}%</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>|Vs| (kV)</span>
              <input type="range" min={380} max={420} step={1} value={Vs}
                onChange={(e) => setVs(+e.target.value)} style={S.slider} />
              <span style={S.val}>{Vs}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>|Vr| (kV)</span>
              <input type="range" min={370} max={410} step={1} value={Vr}
                onChange={(e) => setVr(+e.target.value)} style={S.slider} />
              <span style={S.val}>{Vr}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>δ (°)</span>
              <input type="range" min={0} max={90} step={1} value={dD}
                onChange={(e) => setDD(+e.target.value)} style={S.slider} />
              <span style={S.val}>{dD}°</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Line</span>
              {PRESETS.map((p, i) => (
                <button key={p.name} style={btnS(preset === i)} onClick={() => applyPreset(i)}>
                  {p.name}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 11, color: '#3f3f46', marginLeft: 'auto', fontFamily: 'monospace' }}>
              A={aM.toFixed(3)}∠{aD}° &ensp; B={bM}∠{bD}° Ω
            </span>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
