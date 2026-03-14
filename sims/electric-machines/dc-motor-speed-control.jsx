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
  slider: { width: 120, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 50, textAlign: 'right' },
  results: { display: 'flex', gap: 28, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
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

const KE_RATED = 1.5;
const RA_BASE = 0.5;
const V_RATED = 220;
const IA_RATED = 30;

function ntCurve(V, Ke, Ra, maxT) {
  const pts = [];
  for (let T = 0; T <= maxT; T += 0.5) {
    const Ia = Ke > 0.01 ? T / Ke : 9999;
    if (Ia > IA_RATED * 2.5) break;
    const Eb = V - Ia * Ra;
    if (Eb <= 0) break;
    const N = (Eb / Ke) * 30 / Math.PI;
    pts.push({ t: T, n: N, ia: Ia });
  }
  return pts;
}

function opPoint(V, Ke, Ra, TL) {
  if (Ke < 0.01) return null;
  const Ia = TL / Ke;
  const Eb = V - Ia * Ra;
  if (Eb <= 0) return { t: TL, n: 0, ia: V / Ra, stalled: true };
  const N = (Eb / Ke) * 30 / Math.PI;
  const P = Eb * Ia;
  const eta = V * Ia > 0 ? (P / (V * Ia)) * 100 : 0;
  return { t: TL, n: N, ia: Ia, P, eta, stalled: false };
}

const METHODS = [
  { id: 'av', label: 'Armature Voltage', color: '#22c55e', desc: 'Below base speed — constant torque' },
  { id: 'fw', label: 'Field Weakening', color: '#f59e0b', desc: 'Above base speed — constant power' },
  { id: 'ar', label: 'Armature Resistance', color: '#ef4444', desc: 'Variable speed — lossy method' },
];

function Chart({ method, V, Ke, Ra, TL }) {
  const PX = 75, PY = 35, PW = 420, PH = 240;
  const T_MAX = 55, N_MAX = 3000;
  const sx = v => PX + (v / T_MAX) * PW;
  const sy = v => PY + PH - (Math.min(v, N_MAX) / N_MAX) * PH;
  const toPath = pts => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.t).toFixed(1)},${sy(p.n).toFixed(1)}`).join('');

  let family = [];
  let activeIdx = 0;
  const mColor = METHODS.find(m => m.id === method).color;

  if (method === 'av') {
    const volts = [60, 100, 140, 180, 220];
    family = volts.map(v => ({ label: `${v}V`, pts: ntCurve(v, KE_RATED, RA_BASE, T_MAX), v }));
    activeIdx = volts.indexOf(V) >= 0 ? volts.indexOf(V) : volts.reduce((best, v, i) => Math.abs(v - V) < Math.abs(volts[best] - V) ? i : best, 0);
  } else if (method === 'fw') {
    const kes = [1.5, 1.2, 0.9, 0.6, 0.4];
    family = kes.map(k => ({ label: `Kφ=${k.toFixed(1)}`, pts: ntCurve(V_RATED, k, RA_BASE, T_MAX), k }));
    activeIdx = kes.reduce((best, k, i) => Math.abs(k - Ke) < Math.abs(kes[best] - Ke) ? i : best, 0);
  } else {
    const ras = [0.5, 2, 4, 8, 14];
    family = ras.map(r => ({ label: `Ra=${r}Ω`, pts: ntCurve(V_RATED, KE_RATED, r, T_MAX), r }));
    activeIdx = ras.reduce((best, r, i) => Math.abs(r - Ra) < Math.abs(ras[best] - Ra) ? i : best, 0);
  }

  const op = opPoint(V, Ke, Ra, TL);

  const yTicks = [0, 500, 1000, 1500, 2000, 2500, 3000];
  const xTicks = [0, 10, 20, 30, 40, 50];

  const EP_X = 560, EP_Y = PY, EP_W = 360, EP_H = PH;
  const baseN = (V_RATED / KE_RATED) * 30 / Math.PI;
  const maxN = baseN * 2.5;
  const T_rated = KE_RATED * IA_RATED;
  const P_rated = V_RATED * IA_RATED;
  const esx = n => EP_X + (n / maxN) * EP_W;
  const esy_t = t => EP_Y + EP_H - (t / (T_rated * 1.2)) * EP_H;
  const esy_p = p => EP_Y + EP_H - (p / (P_rated * 1.2)) * EP_H;

  const envTorque = [];
  const envPower = [];
  for (let n = 10; n <= maxN; n += 20) {
    if (n <= baseN) {
      envTorque.push({ n, v: T_rated });
      envPower.push({ n, v: T_rated * n * Math.PI / 30 });
    } else {
      envPower.push({ n, v: P_rated });
      envTorque.push({ n, v: P_rated / (n * Math.PI / 30) });
    }
  }
  const envTPath = envTorque.map((p, i) => `${i === 0 ? 'M' : 'L'}${esx(p.n).toFixed(1)},${esy_t(p.v).toFixed(1)}`).join('');
  const envPPath = envPower.map((p, i) => `${i === 0 ? 'M' : 'L'}${esx(p.n).toFixed(1)},${esy_p(p.v).toFixed(1)}`).join('');

  return (
    <svg viewBox="0 0 960 340" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      {/* ── Left: Speed-Torque Curves ── */}
      <text x={(PX + PX + PW) / 2} y={18} textAnchor="middle" fill="#71717a" fontSize={12} fontWeight={600}>
        Speed–Torque Curves ({METHODS.find(m => m.id === method).label})
      </text>

      {yTicks.map(v => <line key={`yg${v}`} x1={PX} y1={sy(v)} x2={PX + PW} y2={sy(v)} stroke="#1e1e2e" strokeWidth={1} />)}
      {xTicks.map(v => <line key={`xg${v}`} x1={sx(v)} y1={PY} x2={sx(v)} y2={PY + PH} stroke="#1e1e2e" strokeWidth={1} />)}
      <line x1={PX} y1={PY} x2={PX} y2={PY + PH} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={PX} y1={PY + PH} x2={PX + PW} y2={PY + PH} stroke="#3f3f46" strokeWidth={1.5} />
      {yTicks.map(v => <text key={`yl${v}`} x={PX - 6} y={sy(v) + 4} textAnchor="end" fill="#52525b" fontSize={9}>{v}</text>)}
      {xTicks.map(v => <text key={`xl${v}`} x={sx(v)} y={PY + PH + 16} textAnchor="middle" fill="#52525b" fontSize={9}>{v}</text>)}
      <text x={(PX + PX + PW) / 2} y={PY + PH + 32} textAnchor="middle" fill="#71717a" fontSize={10}>Torque (Nm)</text>
      <text x={16} y={(PY + PY + PH) / 2} textAnchor="middle" fill="#71717a" fontSize={10} transform={`rotate(-90, 16, ${(PY + PY + PH) / 2})`}>Speed (rpm)</text>

      {family.map((f, i) => (
        <g key={i} opacity={i === activeIdx ? 1 : 0.3}>
          <path d={toPath(f.pts)} fill="none" stroke={mColor} strokeWidth={i === activeIdx ? 2.5 : 1.5} />
          {f.pts.length > 0 && <text x={sx(f.pts[0].t) + 4} y={sy(f.pts[0].n) - 6} fill={mColor} fontSize={8} opacity={i === activeIdx ? 1 : 0.6}>{f.label}</text>}
        </g>
      ))}

      {/* Load torque line */}
      <line x1={sx(TL)} y1={PY} x2={sx(TL)} y2={PY + PH} stroke="#6366f1" strokeWidth={1} strokeDasharray="5 3" opacity={0.5} />

      {/* Operating point */}
      {op && !op.stalled && (
        <g>
          <circle cx={sx(op.t)} cy={sy(op.n)} r={7} fill="none" stroke="#e4e4e7" strokeWidth={2} />
          <circle cx={sx(op.t)} cy={sy(op.n)} r={3.5} fill="#e4e4e7" />
          <text x={sx(op.t) + 12} y={sy(op.n) - 4} fill="#e4e4e7" fontSize={10} fontWeight={600}>{op.n.toFixed(0)} rpm</text>
          <text x={sx(op.t) + 12} y={sy(op.n) + 10} fill="#71717a" fontSize={9}>{op.ia.toFixed(1)} A</text>
        </g>
      )}

      {/* Direction arrow */}
      {method === 'av' && (
        <g>
          <line x1={sx(5)} y1={sy(600)} x2={sx(5)} y2={sy(1300)} stroke={mColor} strokeWidth={1.5} opacity={0.4} />
          <polygon points={`${sx(5)},${sy(1300)} ${sx(5) - 4},${sy(1200)} ${sx(5) + 4},${sy(1200)}`} fill={mColor} opacity={0.4} />
          <text x={sx(5) + 8} y={sy(950)} fill={mColor} fontSize={9} opacity={0.5}>Increase V</text>
        </g>
      )}
      {method === 'fw' && (
        <g>
          <line x1={sx(5)} y1={sy(1400)} x2={sx(5)} y2={sy(2400)} stroke={mColor} strokeWidth={1.5} opacity={0.4} />
          <polygon points={`${sx(5)},${sy(2400)} ${sx(5) - 4},${sy(2300)} ${sx(5) + 4},${sy(2300)}`} fill={mColor} opacity={0.4} />
          <text x={sx(5) + 8} y={sy(1900)} fill={mColor} fontSize={9} opacity={0.5}>Reduce φ</text>
        </g>
      )}
      {method === 'ar' && (
        <g>
          <line x1={sx(20)} y1={sy(1350)} x2={sx(20)} y2={sy(600)} stroke={mColor} strokeWidth={1.5} opacity={0.4} />
          <polygon points={`${sx(20)},${sy(600)} ${sx(20) - 4},${sy(700)} ${sx(20) + 4},${sy(700)}`} fill={mColor} opacity={0.4} />
          <text x={sx(20) + 8} y={sy(1000)} fill={mColor} fontSize={9} opacity={0.5}>Add Ra</text>
        </g>
      )}

      {/* Divider */}
      <line x1={535} y1={PY - 5} x2={535} y2={PY + PH + 15} stroke="#1e1e2e" strokeWidth={1} />

      {/* ── Right: Power-Speed Envelope ── */}
      <text x={EP_X + EP_W / 2} y={18} textAnchor="middle" fill="#71717a" fontSize={12} fontWeight={600}>Power-Speed Envelope</text>

      <line x1={EP_X} y1={EP_Y} x2={EP_X} y2={EP_Y + EP_H} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={EP_X} y1={EP_Y + EP_H} x2={EP_X + EP_W} y2={EP_Y + EP_H} stroke="#3f3f46" strokeWidth={1.5} />

      {[0, 500, 1000, 1500, 2000, 2500, 3000, 3500].map(n => (
        <g key={`en${n}`}>
          <line x1={EP_X} y1={EP_Y + EP_H} x2={EP_X + EP_W} y2={EP_Y + EP_H} stroke="transparent" />
          {n > 0 && <line x1={EP_X} y1={esy_t(n <= T_rated * 1.2 ? 0 : 0)} x2={EP_X + EP_W} y2={esy_t(0)} stroke="transparent" />}
          <text x={esx(n)} y={EP_Y + EP_H + 14} textAnchor="middle" fill="#3f3f46" fontSize={8}>{n}</text>
        </g>
      ))}
      <text x={EP_X + EP_W / 2} y={EP_Y + EP_H + 30} textAnchor="middle" fill="#71717a" fontSize={10}>Speed (rpm)</text>

      {/* Base speed line */}
      <line x1={esx(baseN)} y1={EP_Y} x2={esx(baseN)} y2={EP_Y + EP_H} stroke="#6366f1" strokeWidth={1} strokeDasharray="5 3" opacity={0.5} />
      <text x={esx(baseN)} y={EP_Y - 4} textAnchor="middle" fill="#6366f1" fontSize={9}>N_base</text>

      {/* Constant Torque region shade */}
      <rect x={EP_X} y={EP_Y} width={esx(baseN) - EP_X} height={EP_H} fill="rgba(34,197,94,0.04)" />
      <text x={(EP_X + esx(baseN)) / 2} y={EP_Y + 20} textAnchor="middle" fill="#22c55e" fontSize={9} opacity={0.7}>Constant Torque</text>
      <text x={(EP_X + esx(baseN)) / 2} y={EP_Y + 32} textAnchor="middle" fill="#22c55e" fontSize={8} opacity={0.5}>(Armature Voltage)</text>

      {/* Constant Power region shade */}
      <rect x={esx(baseN)} y={EP_Y} width={EP_X + EP_W - esx(baseN)} height={EP_H} fill="rgba(245,158,11,0.04)" />
      <text x={(esx(baseN) + EP_X + EP_W) / 2} y={EP_Y + 20} textAnchor="middle" fill="#f59e0b" fontSize={9} opacity={0.7}>Constant Power</text>
      <text x={(esx(baseN) + EP_X + EP_W) / 2} y={EP_Y + 32} textAnchor="middle" fill="#f59e0b" fontSize={8} opacity={0.5}>(Field Weakening)</text>

      {/* Torque envelope */}
      <path d={envTPath} fill="none" stroke="#22c55e" strokeWidth={2} opacity={0.8} />
      <text x={EP_X + EP_W - 5} y={esy_t(envTorque[envTorque.length - 1]?.v || 0) - 6} textAnchor="end" fill="#22c55e" fontSize={9}>T_max</text>

      {/* Power envelope */}
      <path d={envPPath} fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.8} />
      <text x={EP_X + EP_W - 5} y={esy_p(P_rated) - 6} textAnchor="end" fill="#f59e0b" fontSize={9}>P_max</text>

      {/* Operating point on envelope */}
      {op && !op.stalled && (
        <g>
          <circle cx={esx(op.n)} cy={esy_t(op.t)} r={5} fill="none" stroke="#e4e4e7" strokeWidth={1.5} />
          <circle cx={esx(op.n)} cy={esy_t(op.t)} r={2.5} fill="#e4e4e7" />
        </g>
      )}

      {/* Efficiency loss comparison (for resistance method) */}
      {method === 'ar' && op && (
        <g>
          <text x={EP_X + 10} y={EP_Y + EP_H - 30} fill="#ef4444" fontSize={9} fontWeight={500}>
            Loss in Ra_ext: {(op.ia * op.ia * (Ra - RA_BASE)).toFixed(0)} W
          </text>
          <text x={EP_X + 10} y={EP_Y + EP_H - 16} fill="#71717a" fontSize={9}>
            (Wasted as heat — inefficient!)
          </text>
        </g>
      )}
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>DC Motor Speed Control Methods</h2>
      <p style={S.p}>
        The speed of a DC motor is governed by the fundamental speed equation:
      </p>
      <div style={S.eq}>N = (V − Ia·Ra) / Kφ × (30/π)    rpm</div>
      <p style={S.p}>
        Three quantities can be varied to control speed: the armature voltage V, the flux φ
        (via field current), and the armature circuit resistance Ra. Each method has distinct
        characteristics that determine its suitability for different applications.
      </p>

      <h3 style={S.h3}>1. Armature Voltage Control (Below Base Speed)</h3>
      <p style={S.p}>
        By reducing the armature voltage while keeping flux constant, the speed decreases
        proportionally. Since flux is unchanged, the maximum torque capability
        (T_max = Kφ × Ia_rated) remains constant at all speeds. This is the
        <strong style={{ color: '#22c55e' }}> constant torque region</strong>.
      </p>
      <div style={S.eq}>N ∝ V   (at constant φ and load)</div>
      <p style={S.p}>
        The power capability P = T × ω increases linearly with speed. At zero voltage,
        the motor is stationary. At rated voltage, the motor reaches its
        <strong style={{ color: '#6366f1' }}> base speed</strong> (N_base).
      </p>
      <ul style={S.ul}>
        <li style={S.li}>Smooth, stepless speed control from zero to base speed</li>
        <li style={S.li}>Constant torque capability throughout the range</li>
        <li style={S.li}>High efficiency (no resistive losses in the control element)</li>
        <li style={S.li}>Requires a variable DC source (traditionally Ward-Leonard, now thyristor/chopper drives)</li>
      </ul>

      <h3 style={S.h3}>2. Field Weakening (Above Base Speed)</h3>
      <p style={S.p}>
        By increasing the field resistance (or reducing field current), the flux φ decreases.
        Since N ∝ 1/φ (at constant V), the speed increases beyond base speed. However, the
        maximum torque decreases because T_max = Kφ × Ia_rated, and φ is reduced. The power
        P = V × Ia remains approximately constant (since both V and Ia_max are unchanged).
        This is the <strong style={{ color: '#f59e0b' }}>constant power region</strong>.
      </p>
      <div style={S.eq}>N ∝ 1/φ   (at constant V and Ia)</div>
      <ul style={S.ul}>
        <li style={S.li}>Speed can be increased above base speed by 2–3× typically</li>
        <li style={S.li}>Torque capability decreases inversely with speed</li>
        <li style={S.li}>Power capability is constant</li>
        <li style={S.li}>Simple implementation — just a rheostat in the field circuit</li>
        <li style={S.li}>Limited range: excessive field weakening causes commutation problems and instability</li>
      </ul>

      <h3 style={S.h3}>3. Armature Resistance Control</h3>
      <p style={S.p}>
        Adding external resistance in series with the armature increases the voltage drop
        Ia × (Ra + Ra_ext), reducing the back-EMF and hence the speed. The no-load speed
        is unaffected (since Ia ≈ 0 at no load, the added resistance has no effect), but
        the speed at any load drops significantly.
      </p>
      <div style={S.eq}>N = (V − Ia·(Ra + Ra_ext)) / Kφ</div>
      <ul style={S.ul}>
        <li style={S.li}>Simple and cheap to implement (just a rheostat)</li>
        <li style={S.li}><strong style={{ color: '#ef4444' }}>Very inefficient</strong> — the power Ia²·Ra_ext is wasted as heat</li>
        <li style={S.li}>Speed regulation is poor (speed depends heavily on load)</li>
        <li style={S.li}>Only provides speed reduction below base speed</li>
        <li style={S.li}>Historically used for starting and crude speed control; obsolete for continuous speed control</li>
      </ul>

      <h3 style={S.h3}>The Power-Speed Envelope</h3>
      <p style={S.p}>
        By combining armature voltage control (below base speed) and field weakening (above base speed),
        a DC motor can operate over a wide speed range with optimal utilization of its ratings:
      </p>
      <div style={S.ctx}>
        <span style={S.ctxT}>Two-Region Operation</span>
        <p style={S.ctxP}>
          <strong style={{ color: '#22c55e' }}>Region I (0 to N_base)</strong>: Armature voltage control.
          V varies from 0 to V_rated while φ = φ_rated. Maximum torque = Kφ_rated × Ia_rated (constant).
          Power ramps linearly from 0 to P_rated.<br /><br />
          <strong style={{ color: '#f59e0b' }}>Region II (N_base to N_max)</strong>: Field weakening.
          V = V_rated while φ decreases below φ_rated. Maximum torque = Kφ × Ia_rated (decreasing).
          Power stays at P_rated (constant). The speed can typically reach 2–3× base speed before
          commutation limits are reached.
        </p>
      </div>
      <p style={S.p}>
        This envelope is fundamental to all variable-speed drive systems. Modern DC drives
        (thyristor converters, choppers) implement armature voltage control electronically,
        while field weakening is achieved by reducing the field current through a separate
        converter or chopper.
      </p>

      <h3 style={S.h3}>Comparison of Methods</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Property</th>
            <th style={S.th}>Armature Voltage</th>
            <th style={S.th}>Field Weakening</th>
            <th style={S.th}>Armature Resistance</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Speed range', '0 to base', 'Base to ~3× base', '0 to base (with load)'],
            ['Torque capability', 'Constant (rated)', 'Decreases (∝ 1/N)', 'Constant (rated)'],
            ['Power capability', 'Increases (∝ N)', 'Constant (rated)', 'Decreases'],
            ['Efficiency', 'High', 'High', 'Poor (Ia²Ra_ext loss)'],
            ['Implementation', 'Variable DC source', 'Field rheostat', 'Armature rheostat'],
            ['Modern practice', 'Thyristor/chopper', 'Field converter', 'Obsolete'],
          ].map(([prop, av, fw, ar]) => (
            <tr key={prop}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{prop}</td>
              <td style={S.td}>{av}</td>
              <td style={S.td}>{fw}</td>
              <td style={S.td}>{ar}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.ctx}>
        <span style={S.ctxT}>Ward-Leonard Drive System</span>
        <p style={S.ctxP}>
          Before power electronics, the Ward-Leonard system provided smooth armature voltage
          control using a motor-generator set. An AC motor drives a DC generator whose output
          feeds the DC motor. By varying the generator's field current, the output voltage
          (and hence motor speed) is continuously adjustable in both directions, enabling
          four-quadrant operation. Though elegant, this system requires three machines and is
          expensive. It has been almost entirely replaced by thyristor and IGBT-based drives,
          but the control principle remains identical — vary the armature voltage for speed
          below base, weaken the field for speed above base.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Chapman, S.J. — <em>Electric Machinery Fundamentals</em>, 5th Edition</li>
        <li style={S.li}>Sen, P.C. — <em>Principles of Electric Machines and Power Electronics</em>, 3rd Edition</li>
        <li style={S.li}>Dubey, G.K. — <em>Fundamentals of Electrical Drives</em>, 2nd Edition, CRC Press</li>
        <li style={S.li}>Rashid, M.H. — <em>Power Electronics</em>, 4th Edition (Ward-Leonard replacement by converters)</li>
      </ul>
    </div>
  );
}

const btnS = (active, color = '#6366f1') => ({
  padding: '5px 14px', borderRadius: 8,
  border: active ? `1px solid ${color}` : '1px solid #27272a',
  background: active ? `${color}18` : 'transparent',
  color: active ? color : '#52525b',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
});

export default function DCMotorSpeedControl() {
  const [tab, setTab] = useState('simulate');
  const [method, setMethod] = useState('av');
  const [V, setV] = useState(220);
  const [Ke, setKe] = useState(1.5);
  const [Ra, setRa] = useState(0.5);
  const [TL, setTL] = useState(15);

  const activeV = method === 'av' ? V : V_RATED;
  const activeKe = method === 'fw' ? Ke : KE_RATED;
  const activeRa = method === 'ar' ? Ra : RA_BASE;

  const op = useMemo(() => opPoint(activeV, activeKe, activeRa, TL), [activeV, activeKe, activeRa, TL]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Chart method={method} V={activeV} Ke={activeKe} Ra={activeRa} TL={TL} />
          </div>

          <div style={S.results}>
            <div style={S.ri}><span style={S.rl}>Speed</span><span style={{ ...S.rv, color: op?.stalled ? '#ef4444' : '#22c55e' }}>{op ? op.n.toFixed(0) : '—'} rpm</span></div>
            <div style={S.ri}><span style={S.rl}>Ia</span><span style={{ ...S.rv, color: op && op.ia > IA_RATED ? '#ef4444' : '#93c5fd' }}>{op ? op.ia.toFixed(1) : '—'} A</span></div>
            <div style={S.ri}><span style={S.rl}>Torque</span><span style={{ ...S.rv, color: '#c4b5fd' }}>{TL} Nm</span></div>
            <div style={S.ri}><span style={S.rl}>Power</span><span style={{ ...S.rv, color: '#f59e0b' }}>{op ? op.P.toFixed(0) : '—'} W</span></div>
            <div style={S.ri}><span style={S.rl}>Efficiency</span><span style={{ ...S.rv, color: op && op.eta > 80 ? '#22c55e' : '#ef4444' }}>{op ? op.eta.toFixed(1) : '—'}%</span></div>
            {method === 'ar' && op && <div style={S.ri}><span style={S.rl}>Ra Loss</span><span style={{ ...S.rv, color: '#ef4444' }}>{(op.ia * op.ia * (activeRa - RA_BASE)).toFixed(0)} W</span></div>}
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Method</span>
              {METHODS.map(m => (
                <button key={m.id} style={btnS(method === m.id, m.color)} onClick={() => setMethod(m.id)}>{m.label}</button>
              ))}
            </div>

            {method === 'av' && (
              <div style={S.cg}>
                <span style={S.label}>Armature Voltage</span>
                <input type="range" min={20} max={220} step={5} value={V} onChange={e => setV(+e.target.value)} style={S.slider} />
                <span style={S.val}>{V} V</span>
              </div>
            )}
            {method === 'fw' && (
              <div style={S.cg}>
                <span style={S.label}>Kφ (flux)</span>
                <input type="range" min={0.3} max={1.5} step={0.05} value={Ke} onChange={e => setKe(+e.target.value)} style={S.slider} />
                <span style={S.val}>{Ke.toFixed(2)}</span>
              </div>
            )}
            {method === 'ar' && (
              <div style={S.cg}>
                <span style={S.label}>Total Ra</span>
                <input type="range" min={0.5} max={15} step={0.5} value={Ra} onChange={e => setRa(+e.target.value)} style={S.slider} />
                <span style={S.val}>{Ra.toFixed(1)} Ω</span>
              </div>
            )}

            <div style={S.cg}>
              <span style={S.label}>Load Torque</span>
              <input type="range" min={2} max={50} step={1} value={TL} onChange={e => setTL(+e.target.value)} style={S.slider} />
              <span style={S.val}>{TL} Nm</span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
