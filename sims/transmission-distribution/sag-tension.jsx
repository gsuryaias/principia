import React, { useState, useMemo } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '16px 16px 8px', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 8 },
  label: { fontSize: 12, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 100, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 12, color: '#71717a', fontFamily: 'monospace', minWidth: 40, textAlign: 'right' },
  results: { display: 'flex', gap: 28, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  btn: (a) => ({ padding: '4px 10px', borderRadius: 6, border: a ? '1px solid #6366f1' : '1px solid #27272a', background: a ? 'rgba(99,102,241,0.15)' : 'transparent', color: a ? '#a5b4fc' : '#71717a', fontSize: 11, cursor: 'pointer', fontWeight: a ? 600 : 400, transition: 'all 0.15s', outline: 'none' }),
  bg: { display: 'flex', gap: 3 },
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

const COND = {
  moose: { name: 'Moose', w: 2.004, d: 31.77, uts: 18890 },
  zebra: { name: 'Zebra', w: 1.621, d: 28.62, uts: 13568 },
  panther: { name: 'Panther', w: 0.978, d: 21.00, uts: 9166 },
};
const MIN_CLR = { 400: 8.84, 220: 7.01, 132: 6.10, 33: 5.49, 11: 5.18 };
const TWR_H = { 400: 36, 220: 28, 132: 24, 33: 18, 11: 12 };
const DEF_T = { 400: 4500, 220: 3500, 132: 2800, 33: 2500, 11: 2000 };
const DEF_C = { 400: 'moose', 220: 'zebra', 132: 'panther', 33: 'panther', 11: 'panther' };
const DEF_S = { 400: 350, 220: 300, 132: 250, 33: 200, 11: 150 };

function compute(span, condKey, tension, tempC, wind, ice, support, hDiffIn, vKV) {
  const c = COND[condKey];
  let d = c.d / 1000;

  const tIce = ice === 'light' ? 0.006 : ice === 'heavy' ? 0.012 : 0;
  let wIce = 0;
  if (tIce > 0) {
    wIce = Math.PI * 917 * tIce * (d + tIce);
    d += 2 * tIce;
  }
  const wTot = c.w + wIce;

  const qW = wind === 'moderate' ? 36 : wind === 'high' ? 73 : 0;
  const Fw = qW * d;
  const wR = Math.sqrt(wTot * wTot + Fw * Fw);

  const tFact = Math.max(0.8, 1 + 0.0015 * (tempC - 32));
  const sagBase = (wR * span * span) / (8 * tension);
  const sag = Math.max(0.05, sagBase * tFact);

  const tH = TWR_H[vKV] || 28;
  const hL = tH;
  const hR = support === 'unequal' ? tH + hDiffIn : tH;
  const hD = hR - hL;

  const sC = 4 * sag / (span * span);
  let xLow = span / 2;
  if (Math.abs(hD) > 0.01) xLow = span / 2 - hD / (2 * sC * span);
  xLow = Math.max(0, Math.min(span, xLow));

  const yAtFn = (x) => hL + (hD / span) * x - sC * x * (span - x);
  const yLow = yAtFn(xLow);
  const minClr = MIN_CLR[vKV] || 7;
  const condLen = span + (8 * sag * sag) / (3 * span);
  const swingAngle = Fw > 0 ? Math.atan(Fw / wTot) * (180 / Math.PI) : 0;

  return {
    sag, wR, wIce, wTot, Fw, condLen, yLow,
    clrOK: yLow >= minClr, minClr, hL, hR, hD, xLow, sC,
    pctUTS: (tension / c.uts) * 100, dEff: d * 1000,
    sagPct: (sag / span) * 100, swingAngle, tFact,
  };
}

function Diagram({ d, span, condKey, vKV, support, hDiff }) {
  const { sag, yLow, clrOK, minClr, hL, hR, xLow, sagPct } = d;
  const cond = COND[condKey];

  const W = 900, H = 480, GY = 400;
  const LX = 140, RX = 760, SPX = RX - LX;

  const maxH = Math.max(hL, hR) + 4;
  const sc = (GY - 40) / maxH;
  const sy = (h) => GY - h * sc;
  const sx = (x) => LX + (x / span) * SPX;

  const lTY = sy(hL), rTY = sy(hR);
  const midX = (LX + RX) / 2;
  const midChY = (lTY + rTY) / 2;
  const sagPx = sag * sc;
  const ctrlY = midChY + 2 * sagPx;

  const hDVal = hR - hL;
  const sCoeff = 4 * sag / (span * span);
  const yAt = (x) => hL + (hDVal / span) * x - sCoeff * x * (span - x);
  const condMidSvgY = sy(yAt(span / 2));

  const xLC = Math.max(0, Math.min(span, xLow));
  const lpX = sx(xLC), lpY = sy(yLow);
  const mcY = sy(minClr);
  const clrCol = clrOK ? '#22c55e' : '#ef4444';

  const twrPath = (cx, tY) => {
    const h = GY - tY;
    if (h <= 0) return '';
    const bw = Math.max(8, h * 0.055), tw = Math.max(2, h * 0.012);
    const n = Math.max(3, Math.min(6, Math.round(h / 50)));
    let p = `M${cx - bw},${GY}L${cx - tw},${tY}M${cx + bw},${GY}L${cx + tw},${tY}`;
    for (let i = 0; i <= n; i++) {
      const t = i / n, y = GY - h * t, w = bw - (bw - tw) * t;
      p += `M${cx - w},${y}L${cx + w},${y}`;
      if (i < n) {
        const t2 = (i + 1) / n, y2 = GY - h * t2, w2 = bw - (bw - tw) * t2;
        p += `M${cx - w},${y}L${cx + w2},${y2}M${cx + w},${y}L${cx - w2},${y2}`;
      }
    }
    return p;
  };

  const aW = Math.max(14, (GY - lTY) * 0.05);
  const aWR = Math.max(14, (GY - rTY) * 0.05);

  const sagDX = midX + 35;
  const clrDX = support === 'unequal' && Math.abs(xLC - span / 2) > span * 0.05 ? lpX - 40 : midX - 40;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, height: 'auto' }}>
      <rect x={1} y={1} width={W - 2} height={H - 2} rx={8} fill="none" stroke={clrCol} strokeWidth={1.5} opacity={0.15} />

      <text x={20} y={18} fontSize={11} fill="#52525b" fontWeight={500}>
        ACSR {cond.name} ({cond.w} kg/m) · {span}m span · {vKV} kV
      </text>
      <text x={W - 20} y={18} textAnchor="end" fontSize={12} fontWeight={700} fill={clrCol}>
        {clrOK ? '✓ CLEARANCE OK' : '✗ VIOLATION'}
      </text>

      <line x1={40} y1={GY} x2={W - 40} y2={GY} stroke="#52525b" strokeWidth={2} />
      {Array.from({ length: 26 }, (_, i) => (
        <line key={i} x1={50 + i * 32} y1={GY} x2={42 + i * 32} y2={GY + 12} stroke="#3f3f46" strokeWidth={0.5} />
      ))}

      {mcY < GY && mcY > 40 && (
        <g>
          <line x1={LX - 25} y1={mcY} x2={RX + 25} y2={mcY} stroke="#ef4444" strokeWidth={0.8} strokeDasharray="8 5" opacity={0.45} />
          <text x={RX + 30} y={mcY + 4} fontSize={8} fill="#ef4444" opacity={0.6}>Min {minClr}m</text>
        </g>
      )}

      <path d={twrPath(LX, lTY)} stroke="#71717a" strokeWidth={1.2} fill="none" />
      <line x1={LX - aW} y1={lTY} x2={LX + aW} y2={lTY} stroke="#818cf8" strokeWidth={2.5} />
      <line x1={LX} y1={lTY} x2={LX} y2={lTY + Math.min(10, sagPx * 0.08)} stroke="#a5b4fc" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={LX} cy={lTY + Math.min(10, sagPx * 0.08)} r={2} fill="#a5b4fc" />

      <path d={twrPath(RX, rTY)} stroke="#71717a" strokeWidth={1.2} fill="none" />
      <line x1={RX - aWR} y1={rTY} x2={RX + aWR} y2={rTY} stroke="#818cf8" strokeWidth={2.5} />
      <line x1={RX} y1={rTY} x2={RX} y2={rTY + Math.min(10, sagPx * 0.08)} stroke="#a5b4fc" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={RX} cy={rTY + Math.min(10, sagPx * 0.08)} r={2} fill="#a5b4fc" />

      <line x1={LX} y1={lTY} x2={RX} y2={rTY} stroke="#3f3f46" strokeWidth={0.7} strokeDasharray="6 4" />

      <path d={`M${LX},${lTY} Q${midX},${ctrlY} ${RX},${rTY}`} fill="none" stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round" />

      <circle cx={lpX} cy={lpY} r={4.5} fill={clrCol} stroke="#18181b" strokeWidth={1.5} />

      <g>
        <line x1={sagDX} y1={midChY} x2={sagDX} y2={condMidSvgY} stroke="#3b82f6" strokeWidth={1} />
        <line x1={sagDX - 5} y1={midChY} x2={sagDX + 5} y2={midChY} stroke="#3b82f6" strokeWidth={1} />
        <line x1={sagDX - 5} y1={condMidSvgY} x2={sagDX + 5} y2={condMidSvgY} stroke="#3b82f6" strokeWidth={1} />
        <rect x={sagDX + 7} y={(midChY + condMidSvgY) / 2 - 8} width={82} height={16} rx={3} fill="#09090b" opacity={0.85} />
        <text x={sagDX + 10} y={(midChY + condMidSvgY) / 2 + 4} fontSize={11} fill="#3b82f6" fontWeight={600}>
          S = {sag.toFixed(2)} m
        </text>
      </g>

      <g>
        <line x1={clrDX} y1={GY} x2={clrDX} y2={lpY} stroke={clrCol} strokeWidth={1} />
        <line x1={clrDX - 5} y1={GY} x2={clrDX + 5} y2={GY} stroke={clrCol} strokeWidth={1} />
        <line x1={clrDX - 5} y1={lpY} x2={clrDX + 5} y2={lpY} stroke={clrCol} strokeWidth={1} />
        <line x1={lpX} y1={lpY} x2={lpX} y2={GY} stroke={clrCol} strokeWidth={0.5} strokeDasharray="3 3" opacity={0.35} />
        <rect x={clrDX - 80} y={(GY + lpY) / 2 - 8} width={72} height={16} rx={3} fill="#09090b" opacity={0.85} />
        <text x={clrDX - 8} y={(GY + lpY) / 2 + 4} textAnchor="end" fontSize={11} fill={clrCol} fontWeight={600}>
          {yLow.toFixed(2)} m
        </text>
      </g>

      <g>
        <line x1={LX} y1={GY + 28} x2={RX} y2={GY + 28} stroke="#52525b" strokeWidth={0.8} />
        <line x1={LX} y1={GY + 23} x2={LX} y2={GY + 33} stroke="#52525b" strokeWidth={0.8} />
        <line x1={RX} y1={GY + 23} x2={RX} y2={GY + 33} stroke="#52525b" strokeWidth={0.8} />
        <text x={midX} y={GY + 44} textAnchor="middle" fontSize={10} fill="#71717a">L = {span} m</text>
      </g>

      <text x={LX} y={GY + 58} textAnchor="middle" fontSize={9} fill="#71717a">H = {hL} m</text>
      <text x={RX} y={GY + 58} textAnchor="middle" fontSize={9} fill="#71717a">H = {hR} m</text>

      {support === 'unequal' && Math.abs(xLC - span / 2) > span * 0.03 && (
        <text x={lpX} y={GY + 16} textAnchor="middle" fontSize={8} fill="#71717a">
          x₁ = {xLC.toFixed(0)} m
        </text>
      )}

      {sagPct > 10 && (
        <text x={W / 2} y={32} textAnchor="middle" fontSize={9} fill="#f59e0b">
          ⚠ Sag/span = {sagPct.toFixed(1)}% — parabolic approximation less accurate above 10%
        </text>
      )}
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Sag-Tension Analysis of Overhead Transmission Lines</h2>
      <p style={S.p}>
        Sag-tension calculation is arguably the most critical mechanical design problem in overhead
        transmission line engineering. The conductor must be strung with enough tension to limit sag
        (ensuring adequate ground clearance) but not so much that the tension exceeds the conductor's
        safe working load. This balance must hold across all operating temperatures, wind speeds, and
        ice loading conditions throughout the line's 40–50 year design life.
      </p>

      <h3 style={S.h3}>Catenary vs Parabolic Approximation</h3>
      <p style={S.p}>
        A perfectly flexible, uniform conductor suspended between two supports hangs in a{' '}
        <strong style={{ color: '#e4e4e7' }}>catenary</strong> curve described by the hyperbolic cosine:
      </p>
      <div style={S.eq}>y = (T/w) × cosh(wx/T) — catenary equation</div>
      <p style={S.p}>
        When the sag is small relative to the span (sag/span {'<'} 10%, which covers the vast majority
        of practical transmission lines), the Taylor expansion of cosh reduces the catenary to a
        parabola. This <strong style={{ color: '#e4e4e7' }}>parabolic approximation</strong> greatly
        simplifies calculations while introducing negligible error ({'<'}2% for typical EHV lines):
      </p>
      <div style={S.eq}>y ≈ wx² / (2T) — parabolic approximation</div>
      <p style={S.p}>
        All sag-tension calculations in standard practice (IS 802, CEA manuals) use the parabolic
        approximation. The simulation above uses this method.
      </p>

      <h3 style={S.h3}>Sag Formula Derivation</h3>
      <p style={S.p}>
        Consider a conductor of span L between two supports at equal height. Taking the origin at
        the lowest point of the conductor, the vertical displacement at any point x is:
      </p>
      <div style={S.eq}>y(x) = wx² / (2T)</div>
      <p style={S.p}>
        At the support point (x = L/2), the vertical displacement equals the sag S:
      </p>
      <div style={S.eq}>S = w(L/2)² / (2T) = wL² / (8T)</div>
      <p style={S.p}>Where:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>S</strong> — sag at midspan (m)</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>w</strong> — weight of conductor per unit length (kgf/m), including ice if present</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>L</strong> — horizontal span length (m)</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>T</strong> — horizontal component of tension (kgf)</li>
      </ul>
      <p style={S.p}>
        The conductor length between supports is approximately:
      </p>
      <div style={S.eq}>L_c ≈ L + 8S² / (3L)</div>

      <h3 style={S.h3}>Effect of Temperature</h3>
      <p style={S.p}>
        Conductor length changes with temperature due to thermal expansion. For ACSR conductors,
        the coefficient of linear expansion is:
      </p>
      <div style={S.eq}>α ≈ 19.3 × 10⁻⁶ /°C (for ACSR)</div>
      <p style={S.p}>
        As the conductor elongates with rising temperature, the additional length manifests as
        increased sag. The exact sag-temperature relationship requires solving the{' '}
        <strong style={{ color: '#e4e4e7' }}>state change equation</strong> — a cubic equation relating sag, tension,
        and temperature at two different states. For this simulation, a simplified linear model is used:
      </p>
      <div style={S.eq}>S(T) ≈ S(T₀) × [1 + 0.0015 × (T − T₀)]</div>
      <p style={S.p}>
        where T₀ = 32°C is the typical erection temperature in India. This corresponds to
        approximately <strong style={{ color: '#e4e4e7' }}>1.5% increase in sag per 10°C rise</strong>.
        The maximum sag (and minimum ground clearance) occurs at the maximum operating temperature —
        typically 75°C for ACSR conductors.
      </p>

      <h3 style={S.h3}>Wind and Ice Loading</h3>
      <p style={S.p}>
        External loads modify the effective weight per unit length, increasing sag:
      </p>
      <div style={S.eq}>w_ice = π × ρ_ice × t × (d + t)</div>
      <p style={S.p}>
        where ρ_ice = 917 kg/m³, t = radial ice thickness (m), d = conductor diameter (m).
        The effective diameter increases to d + 2t.
      </p>
      <div style={S.eq}>F_w = C_d × q × d_eff</div>
      <p style={S.p}>
        where C_d ≈ 1.0 (drag coefficient for round conductors), q = wind pressure (kg/m²),
        d_eff = effective diameter including ice. The resultant weight per unit length is:
      </p>
      <div style={S.eq}>w_r = √(w_total² + F_w²)</div>
      <p style={S.p}>
        The conductor swings at an angle θ = arctan(F_w / w_total) from the vertical plane. For
        ground clearance calculations, only the vertical component of sag matters, but the resultant
        weight determines the overall conductor stress.
      </p>

      <h3 style={S.h3}>Unequal Height Supports — Split Span Method</h3>
      <p style={S.p}>
        When the two supports are at different heights (common in hilly terrain), the lowest point
        of the conductor shifts toward the lower support. Using the{' '}
        <strong style={{ color: '#e4e4e7' }}>split span method</strong>, the actual span is divided
        into two equivalent half-spans at the lowest point:
      </p>
      <div style={S.eq}>x₁ = L/2 − Th / (wL) — from lower support</div>
      <div style={S.eq}>x₂ = L/2 + Th / (wL) — from higher support</div>
      <p style={S.p}>
        where h is the height difference between supports. The sag measured from each support to
        the lowest point is:
      </p>
      <div style={S.eq}>S₁ = wx₁² / (2T),  S₂ = wx₂² / (2T)</div>
      <p style={S.p}>
        The maximum sag below the chord (line joining the supports) still equals wL²/(8T) and
        always occurs at the midspan, regardless of the height difference. However, the minimum
        ground clearance occurs at the lowest conductor point, not at midspan.
      </p>

      <h3 style={S.h3}>Minimum Ground Clearance — Indian Electricity Rules</h3>
      <p style={S.p}>
        The Indian Electricity Rules, 1956 (as amended) prescribe minimum clearances above ground
        for different voltage levels. These must be maintained under the worst-case condition of
        maximum sag (typically at 75°C, still-air):
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Voltage (kV)</th>
            <th style={S.th}>Min. Clearance (m)</th>
            <th style={S.th}>Across Roads (m)</th>
            <th style={S.th}>Over Buildings (m)</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['400', '8.84', '10.84', '12.34'],
            ['220', '7.01', '9.01', '10.51'],
            ['132', '6.10', '8.10', '9.60'],
            ['66', '5.79', '7.79', '9.29'],
            ['33', '5.49', '7.49', '8.99'],
            ['11', '5.18', '7.18', '8.68'],
          ].map(([v, gc, rd, bld]) => (
            <tr key={v}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{v}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{gc}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{rd}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{bld}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.ctx}>
        <span style={S.ctxT}>Real-World Context — AP Transco 400 kV Lines</span>
        <p style={S.ctxP}>
          AP Transco's 400 kV D/C (double circuit) towers typically have spans of 300–400 m with
          quad-bundled ACSR Moose conductors. The minimum ground clearance of 8.84 m must be
          maintained at maximum temperature (75°C) under still-air conditions. Tower heights of
          35–40 m above ground are standard for flat terrain. In practice, AP Transco uses a
          clearance margin of 1–2 m above the IE Rules minimum to account for survey errors,
          foundation settlement, and future road-raising. The maximum tension is limited to
          approximately 35% of the conductor's ultimate tensile strength (UTS) under everyday
          conditions and 50% under maximum loading conditions.
        </p>
      </div>

      <h3 style={S.h3}>Ruling Span Concept</h3>
      <p style={S.p}>
        In a multi-span section between tension (dead-end) towers, the conductor tension is
        equalized across all spans by free movement at suspension clamps. The{' '}
        <strong style={{ color: '#e4e4e7' }}>ruling span</strong> (or equivalent span) is the
        single hypothetical span that produces the same tension as the actual series of unequal
        spans:
      </p>
      <div style={S.eq}>L_r = √(∑Lᵢ³ / ∑Lᵢ)</div>
      <p style={S.p}>
        Sag-tension calculations are performed for the ruling span, and the resulting tension is
        used to compute sag in each individual span. This approach assumes that the conductor can
        slide freely over the suspension clamp and that the tension equalizes across spans.
      </p>

      <h3 style={S.h3}>Stringing Charts and Construction Practice</h3>
      <p style={S.p}>
        A <strong style={{ color: '#e4e4e7' }}>stringing chart</strong> (or sag-tension table) is
        a pre-computed table that gives the required sag at various ambient temperatures for a given
        conductor, span, and design tension. Linemen use these charts during construction to set the
        correct sag by visual observation (using a sag board or transit level) or by measuring
        tension with a dynamometer.
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Temp (°C)</th>
            <th style={S.th}>Sag (m) — 350m Span</th>
            <th style={S.th}>Tension (kgf)</th>
            <th style={S.th}>Condition</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['0', '6.14', '4750', 'Minimum temperature'],
            ['15', '6.44', '4530', 'Cool weather'],
            ['32', '6.82', '4290', 'Erection (everyday)'],
            ['50', '7.23', '4045', 'Summer afternoon'],
            ['65', '7.59', '3845', 'High temperature'],
            ['75', '7.82', '3735', 'Max. operating'],
          ].map(([t, s, ten, cond]) => (
            <tr key={t}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{t}°</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{s}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{ten}</td>
              <td style={S.td}>{cond}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={S.p}>
        The erection sag (at ambient temperature, no wind) is the primary reference. The design
        must ensure that the maximum sag (at 75°C, still-air) still provides adequate ground
        clearance.
      </p>

      <h3 style={S.h3}>Safety Factors and Design Standards</h3>
      <p style={S.p}>
        Indian Standard IS 802 (Part 1: Use of Metal, Part 2: Permissible Stresses) governs the
        structural design of overhead transmission lines. Key requirements:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Factor of Safety on conductor:</strong> Minimum 2.0
          under normal loading (everyday temperature, no wind), 1.5 under maximum loading
          (worst combination of wind + ice + temperature).
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Design wind pressure:</strong> Based on basic wind
          speed for the zone (33, 39, 44, 47, 50, 55 m/s per IS 875 Part 3), with adjustments
          for terrain category, height, and risk coefficient.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Everyday tension:</strong> Must not exceed
          approximately 25–35% of UTS for ACSR conductors.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Maximum working tension:</strong> Must not exceed
          50% of UTS under the worst design loading.
        </li>
        <li style={S.li}>
          <strong style={{ color: '#e4e4e7' }}>Vibration-safe tension:</strong> CIGRÉ recommends
          limiting everyday tension to 18–22% UTS to avoid aeolian vibration fatigue without
          dampers.
        </li>
      </ul>

      <h3 style={S.h3}>ACSR Conductor Data</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Name</th>
            <th style={S.th}>Al/Steel</th>
            <th style={S.th}>Dia (mm)</th>
            <th style={S.th}>Weight (kg/m)</th>
            <th style={S.th}>UTS (kgf)</th>
            <th style={S.th}>Typical Use</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Moose', '54/7', '31.77', '2.004', '18,890', '400 kV (quad bundle)'],
            ['Zebra', '54/7', '28.62', '1.621', '13,568', '220 kV (twin bundle)'],
            ['Panther', '30/7', '21.00', '0.978', '9,166', '132 kV (single)'],
            ['Dog', '6/7', '18.13', '0.727', '6,480', '33/11 kV'],
          ].map(([n, st, dia, wt, uts, use]) => (
            <tr key={n}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{n}</td>
              <td style={S.td}>{st}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{dia}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{wt}</td>
              <td style={{ ...S.td, fontFamily: 'monospace' }}>{uts}</td>
              <td style={S.td}>{use}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={S.ctx}>
        <span style={S.ctxT}>Assumptions in This Simulation</span>
        <p style={S.ctxP}>
          The simulation uses the parabolic approximation (valid when sag/span {'<'} 10%). Temperature
          effects are modelled with a simplified linear factor of ~1.5% per 10°C rather than
          solving the full cubic state-change equation. The tension value represents the horizontal
          component of tension at 32°C still-air conditions. Wind and ice loads are applied
          statically; dynamic effects (galloping, aeolian vibration) are not modelled. The tower
          attachment height is fixed per voltage level and represents a typical value for flat
          terrain in peninsular India.
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Indian Electricity Rules, 1956 (as amended up to 2010) — Central Govt.</li>
        <li style={S.li}>IS 802 (Part 1/Sec 1 & 2): Code of Practice for Use of Structural Steel in Overhead Transmission Line Towers</li>
        <li style={S.li}>IS 5613 (Part 1/Sec 1): Code of Practice for Design, Installation and Maintenance of Overhead Power Lines — Lines up to and including 11 kV</li>
        <li style={S.li}>IS 5613 (Part 2/Sec 1 & 2): Lines above 11 kV and up to and including 220 kV</li>
        <li style={S.li}>IS 875 (Part 3): Code of Practice for Design Loads — Wind Loads</li>
        <li style={S.li}>CEA Manual on Transmission Line Design, Planning and Construction</li>
        <li style={S.li}>C.L. Wadhwa, <em>"Electrical Power Systems"</em>, New Age International Publishers</li>
        <li style={S.li}>CIGRÉ Technical Brochure 273 — "Overhead Conductor Safe Design Tension"</li>
      </ul>
    </div>
  );
}

export default function SagTension() {
  const [tab, setTab] = useState('simulate');
  const [vKV, setVKV] = useState(400);
  const [condKey, setCondKey] = useState('moose');
  const [span, setSpan] = useState(350);
  const [tension, setTension] = useState(4500);
  const [tempC, setTempC] = useState(32);
  const [wind, setWind] = useState('none');
  const [ice, setIce] = useState('none');
  const [support, setSupport] = useState('equal');
  const [hDiff, setHDiff] = useState(5);

  const changeVKV = (v) => {
    setVKV(v);
    setCondKey(DEF_C[v] || 'moose');
    setTension(DEF_T[v] || 4500);
    setSpan(DEF_S[v] || 350);
  };

  const effHD = support === 'equal' ? 0 : hDiff;
  const data = useMemo(
    () => compute(span, condKey, tension, tempC, wind, ice, support, effHD, vKV),
    [span, condKey, tension, tempC, wind, ice, support, effHD, vKV]
  );

  const cond = COND[condKey];
  const clrCol = data.clrOK ? '#22c55e' : '#ef4444';

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram d={data} span={span} condKey={condKey} vKV={vKV} support={support} hDiff={effHD} />
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Sag</span>
              <span style={{ ...S.rv, color: '#3b82f6' }}>{data.sag.toFixed(2)} m</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Ground Clearance</span>
              <span style={{ ...S.rv, color: clrCol }}>{data.yLow.toFixed(2)} m</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Clearance Status</span>
              <span style={{ ...S.rv, color: clrCol }}>{data.clrOK ? 'OK' : 'VIOLATION'}</span>
              <span style={{ fontSize: 10, color: '#3f3f46', fontFamily: 'monospace' }}>min {data.minClr} m</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Conductor Length</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{data.condLen.toFixed(1)} m</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Resultant Weight</span>
              <span style={{ ...S.rv, color: '#8b5cf6' }}>{data.wR.toFixed(3)} kg/m</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Sag / Span</span>
              <span style={{ ...S.rv, color: data.sagPct > 10 ? '#f59e0b' : '#71717a' }}>{data.sagPct.toFixed(2)}%</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Voltage</span>
              <div style={S.bg}>
                {[400, 220, 132, 33, 11].map((v) => (
                  <button key={v} style={S.btn(vKV === v)} onClick={() => changeVKV(v)}>{v} kV</button>
                ))}
              </div>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Conductor</span>
              <div style={S.bg}>
                {Object.entries(COND).map(([k, c]) => (
                  <button key={k} style={S.btn(condKey === k)} onClick={() => setCondKey(k)}>{c.name}</button>
                ))}
              </div>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Support</span>
              <div style={S.bg}>
                <button style={S.btn(support === 'equal')} onClick={() => setSupport('equal')}>Equal</button>
                <button style={S.btn(support === 'unequal')} onClick={() => setSupport('unequal')}>Unequal</button>
              </div>
            </div>
            {support === 'unequal' && (
              <div style={S.cg}>
                <span style={S.label}>Δh (m)</span>
                <input type="range" min={0} max={10} step={0.5} value={hDiff}
                  onChange={(e) => setHDiff(+e.target.value)} style={S.slider} />
                <span style={S.val}>{hDiff.toFixed(1)}</span>
              </div>
            )}
            <div style={S.cg}>
              <span style={S.label}>Span (m)</span>
              <input type="range" min={100} max={500} step={10} value={span}
                onChange={(e) => setSpan(+e.target.value)} style={{ ...S.slider, width: 120 }} />
              <span style={S.val}>{span}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Tension (kgf)</span>
              <input type="range" min={2000} max={8000} step={100} value={tension}
                onChange={(e) => setTension(+e.target.value)} style={{ ...S.slider, width: 110 }} />
              <span style={S.val}>{tension}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Temp (°C)</span>
              <input type="range" min={-5} max={75} step={1} value={tempC}
                onChange={(e) => setTempC(+e.target.value)} style={S.slider} />
              <span style={S.val}>{tempC}°</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Wind</span>
              <div style={S.bg}>
                {[['none', 'None'], ['moderate', '36 kg/m²'], ['high', '73 kg/m²']].map(([k, l]) => (
                  <button key={k} style={S.btn(wind === k)} onClick={() => setWind(k)}>{l}</button>
                ))}
              </div>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Ice</span>
              <div style={S.bg}>
                {[['none', 'None'], ['light', '6 mm'], ['heavy', '12 mm']].map(([k, l]) => (
                  <button key={k} style={S.btn(ice === k)} onClick={() => setIce(k)}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
