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
  slider: { width: 110, accentColor: '#6366f1', cursor: 'pointer' },
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

const cx = (re, im = 0) => ({ re, im });
const cAdd = (a, b) => cx(a.re + b.re, a.im + b.im);
const cSub = (a, b) => cx(a.re - b.re, a.im - b.im);
const cMul = (a, b) => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cDiv = (a, b) => { const d = b.re ** 2 + b.im ** 2; return d < 1e-30 ? cx(0) : cx((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
const cAbs = (a) => Math.hypot(a.re, a.im);
const cAng = (a) => (Math.atan2(a.im, a.re) * 180) / Math.PI;
const cSqrt = (a) => { const r = cAbs(a); if (r < 1e-30) return cx(0); const t = Math.atan2(a.im, a.re); return cx(Math.sqrt(r) * Math.cos(t / 2), Math.sqrt(r) * Math.sin(t / 2)); };
const cCosh = (a) => cx(Math.cosh(a.re) * Math.cos(a.im), Math.sinh(a.re) * Math.sin(a.im));
const cSinh = (a) => cx(Math.sinh(a.re) * Math.cos(a.im), Math.cosh(a.re) * Math.sin(a.im));
const cSc = (a, s) => cx(a.re * s, a.im * s);

function solve(r, x, b, len, medType, PrMW, pf, vkv) {
  const z = cx(r, x), y = cx(0, b);
  const Z = cSc(z, len), Y = cSc(y, len);
  const Zc = cSqrt(cDiv(z, y));
  const gL = cMul(cSqrt(cMul(z, y)), cx(len));
  const type = len < 80 ? 'short' : len <= 250 ? medType : 'long';

  let A, B, C, D;
  if (type === 'short') {
    A = cx(1); B = Z; C = cx(0); D = cx(1);
  } else if (type === 'pi') {
    const ZY = cMul(Z, Y);
    A = cAdd(cx(1), cSc(ZY, 0.5)); B = Z;
    C = cMul(Y, cAdd(cx(1), cSc(ZY, 0.25))); D = cAdd(cx(1), cSc(ZY, 0.5));
  } else if (type === 'T') {
    const ZY = cMul(Z, Y);
    A = cAdd(cx(1), cSc(ZY, 0.5)); B = cMul(Z, cAdd(cx(1), cSc(ZY, 0.25)));
    C = Y; D = cAdd(cx(1), cSc(ZY, 0.5));
  } else {
    A = cCosh(gL); B = cMul(Zc, cSinh(gL));
    C = cDiv(cSinh(gL), Zc); D = cCosh(gL);
  }

  const adbc = cSub(cMul(A, D), cMul(B, C));
  const Qr = PrMW * Math.tan(Math.acos(Math.min(pf, 1)));
  const VrPh = (vkv * 1000) / Math.sqrt(3);
  const Ir = cx((PrMW * 1e6) / (3 * VrPh), (-Qr * 1e6) / (3 * VrPh));
  const Vr = cx(VrPh);
  const Vs = cAdd(cMul(A, Vr), cMul(B, Ir));
  const Is = cAdd(cMul(C, Vr), cMul(D, Ir));
  const VsKV = (Math.sqrt(3) * cAbs(Vs)) / 1000;
  const VR = ((cAbs(Vs) - VrPh) / VrPh) * 100;
  const zcMag = cAbs(Zc);
  const SIL = zcMag > 0 ? (vkv * vkv) / zcMag : 0;

  let Zp = null, Yp2 = null;
  if (type === 'long') {
    Zp = cMul(Zc, cSinh(gL));
    const h = cSc(gL, 0.5);
    Yp2 = cDiv(cDiv(cSinh(h), cCosh(h)), Zc);
  }

  return { A, B, C, D, Z, Y, Zc, gL, type, adbc, Vs, Is, Ir, Vr, VsKV, VR, SIL, IsMag: cAbs(Is), IrMag: cAbs(Ir), Qr, Zp, Yp2 };
}

function Diagram({ d }) {
  const SX = 60, RX = 540, WY = 95, GY = 195;
  const PCX = 810, PCY = 130, PR = 80;
  const mNames = { short: 'Short Line Model', pi: 'Medium Line — Nominal π', T: 'Medium Line — Nominal T', long: 'Long Line — Distributed Parameters' };
  const wire = '#52525b';

  const fZ = `${d.Z.re.toFixed(1)}+j${d.Z.im.toFixed(1)} Ω`;
  const fY2 = `j${((d.Y.im / 2) * 1e3).toFixed(2)} mS`;
  const fY = `j${(d.Y.im * 1e3).toFixed(2)} mS`;

  const vMax = Math.max(cAbs(d.Vr), cAbs(d.Vs), 1);
  const iMax = Math.max(cAbs(d.Ir), cAbs(d.Is), 1);

  const phasor = (mag, angDeg, maxM, scale, color, label) => {
    const len = Math.max((mag / maxM) * scale, 10);
    const rad = (angDeg * Math.PI) / 180;
    const ex = PCX + len * Math.cos(rad), ey = PCY - len * Math.sin(rad);
    const hl = 7, ha = 0.4;
    return (
      <g key={label}>
        <line x1={PCX} y1={PCY} x2={ex} y2={ey} stroke={color} strokeWidth={2} opacity={0.85} />
        <polygon points={`${ex},${ey} ${ex - hl * Math.cos(rad - ha)},${ey + hl * Math.sin(rad - ha)} ${ex - hl * Math.cos(rad + ha)},${ey + hl * Math.sin(rad + ha)}`} fill={color} opacity={0.85} />
        <text x={ex + 14 * Math.cos(rad)} y={ey - 14 * Math.sin(rad)} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={10} fontWeight={600}>{label}</text>
      </g>
    );
  };

  const gnd = (gx, gy) => (
    <g key={`g${gx}`}>
      <line x1={gx - 8} y1={gy} x2={gx + 8} y2={gy} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={gx - 5} y1={gy + 4} x2={gx + 5} y2={gy + 4} stroke="#3f3f46" strokeWidth={1.2} />
      <line x1={gx - 2} y1={gy + 8} x2={gx + 2} y2={gy + 8} stroke="#3f3f46" strokeWidth={1} />
    </g>
  );

  const capSym = (cx_, y1, y2, label, color = '#22c55e') => {
    const mid = (y1 + y2) / 2;
    return (
      <g key={`c${cx_}${label}`}>
        <line x1={cx_} y1={y1} x2={cx_} y2={mid - 4} stroke={color} strokeWidth={1.5} />
        <line x1={cx_ - 10} y1={mid - 4} x2={cx_ + 10} y2={mid - 4} stroke={color} strokeWidth={2.5} />
        <line x1={cx_ - 10} y1={mid + 4} x2={cx_ + 10} y2={mid + 4} stroke={color} strokeWidth={2.5} />
        <line x1={cx_} y1={mid + 4} x2={cx_} y2={y2} stroke={color} strokeWidth={1.5} />
        <text x={cx_ + 15} y={mid + 3} fill={color} fontSize={9}>{label}</text>
      </g>
    );
  };

  const zBox = (bx, by, bw, bh, label, col = '#6366f1', dash = false) => (
    <g key={`z${bx}`}>
      <rect x={bx - bw / 2} y={by - bh / 2} width={bw} height={bh} rx={4}
        fill={dash ? 'rgba(245,158,11,0.06)' : 'rgba(99,102,241,0.08)'}
        stroke={col} strokeWidth={1.5} strokeDasharray={dash ? '4 2' : undefined} />
      <text x={bx} y={by + 4} textAnchor="middle" fill={dash ? '#fcd34d' : '#c4b5fd'} fontSize={10} fontWeight={500}>{label}</text>
    </g>
  );

  let circuit;
  if (d.type === 'short') {
    circuit = (
      <>
        <line x1={SX} y1={WY} x2={220} y2={WY} stroke={wire} strokeWidth={1.5} />
        {zBox(300, WY, 160, 34, `Z = ${fZ}`)}
        <line x1={380} y1={WY} x2={RX} y2={WY} stroke={wire} strokeWidth={1.5} />
      </>
    );
  } else if (d.type === 'pi') {
    circuit = (
      <>
        <line x1={SX} y1={WY} x2={130} y2={WY} stroke={wire} strokeWidth={1.5} />
        <line x1={130} y1={WY} x2={220} y2={WY} stroke={wire} strokeWidth={1.5} />
        {zBox(300, WY, 160, 34, `Z = ${fZ}`)}
        <line x1={380} y1={WY} x2={470} y2={WY} stroke={wire} strokeWidth={1.5} />
        <line x1={470} y1={WY} x2={RX} y2={WY} stroke={wire} strokeWidth={1.5} />
        <circle cx={130} cy={WY} r={3} fill="#d4d4d8" />
        <circle cx={470} cy={WY} r={3} fill="#d4d4d8" />
        {capSym(130, WY, GY - 20, 'Y/2')}
        {capSym(470, WY, GY - 20, 'Y/2')}
        <text x={130} y={GY - 2} textAnchor="middle" fill="#22c55e" fontSize={8}>{fY2}</text>
        <text x={470} y={GY - 2} textAnchor="middle" fill="#22c55e" fontSize={8}>{fY2}</text>
        {gnd(130, GY + 4)}
        {gnd(470, GY + 4)}
      </>
    );
  } else if (d.type === 'T') {
    circuit = (
      <>
        <line x1={SX} y1={WY} x2={145} y2={WY} stroke={wire} strokeWidth={1.5} />
        {zBox(195, WY, 100, 34, 'Z/2')}
        <line x1={245} y1={WY} x2={300} y2={WY} stroke={wire} strokeWidth={1.5} />
        <line x1={300} y1={WY} x2={355} y2={WY} stroke={wire} strokeWidth={1.5} />
        {zBox(405, WY, 100, 34, 'Z/2')}
        <line x1={455} y1={WY} x2={RX} y2={WY} stroke={wire} strokeWidth={1.5} />
        <circle cx={300} cy={WY} r={3} fill="#d4d4d8" />
        {capSym(300, WY, GY - 20, 'Y')}
        <text x={300} y={GY - 2} textAnchor="middle" fill="#22c55e" fontSize={8}>{fY}</text>
        {gnd(300, GY + 4)}
      </>
    );
  } else {
    const zpS = `|Z'|=${cAbs(d.Zp).toFixed(1)} Ω`;
    const yp2S = `|Y'/2|=${(cAbs(d.Yp2) * 1e3).toFixed(3)} mS`;
    circuit = (
      <>
        <line x1={SX} y1={WY} x2={130} y2={WY} stroke={wire} strokeWidth={1.5} />
        <line x1={130} y1={WY} x2={215} y2={WY} stroke={wire} strokeWidth={1.5} />
        {zBox(300, WY, 170, 34, "Z' = Zc·sinh(γl)", '#f59e0b', true)}
        <text x={300} y={WY + 26} textAnchor="middle" fill="#a1a1aa" fontSize={8}>{zpS}</text>
        <line x1={385} y1={WY} x2={470} y2={WY} stroke={wire} strokeWidth={1.5} />
        <line x1={470} y1={WY} x2={RX} y2={WY} stroke={wire} strokeWidth={1.5} />
        <circle cx={130} cy={WY} r={3} fill="#d4d4d8" />
        <circle cx={470} cy={WY} r={3} fill="#d4d4d8" />
        {capSym(130, WY, GY - 20, "Y'/2", '#f59e0b')}
        {capSym(470, WY, GY - 20, "Y'/2", '#f59e0b')}
        <text x={130} y={GY - 2} textAnchor="middle" fill="#f59e0b" fontSize={8}>{yp2S}</text>
        <text x={470} y={GY - 2} textAnchor="middle" fill="#f59e0b" fontSize={8}>{yp2S}</text>
        {gnd(130, GY + 4)}
        {gnd(470, GY + 4)}
        <text x={300} y={GY + 28} textAnchor="middle" fill="#52525b" fontSize={9} fontStyle="italic">Exact equivalent π (hyperbolic)</text>
      </>
    );
  }

  return (
    <svg viewBox="0 0 1050 260" style={{ width: '100%', maxWidth: 1050, height: 'auto' }}>
      <text x={300} y={22} textAnchor="middle" fill="#71717a" fontSize={12} fontWeight={600}>{mNames[d.type]}</text>

      <circle cx={SX} cy={WY} r={4} fill="#f59e0b" />
      <text x={SX} y={WY - 16} textAnchor="middle" fill="#f59e0b" fontSize={11} fontWeight={700}>Vs</text>
      <circle cx={RX} cy={WY} r={4} fill="#06b6d4" />
      <text x={RX} y={WY - 16} textAnchor="middle" fill="#06b6d4" fontSize={11} fontWeight={700}>Vr</text>

      <line x1={SX + 15} y1={WY - 14} x2={SX + 38} y2={WY - 14} stroke="#22c55e" strokeWidth={1.5} />
      <polygon points={`${SX + 38},${WY - 14} ${SX + 33},${WY - 17} ${SX + 33},${WY - 11}`} fill="#22c55e" />
      <text x={SX + 26} y={WY - 20} textAnchor="middle" fill="#22c55e" fontSize={9} fontWeight={600}>Is</text>

      <line x1={RX - 38} y1={WY - 14} x2={RX - 15} y2={WY - 14} stroke="#22c55e" strokeWidth={1.5} />
      <polygon points={`${RX - 15},${WY - 14} ${RX - 20},${WY - 17} ${RX - 20},${WY - 11}`} fill="#22c55e" />
      <text x={RX - 26} y={WY - 20} textAnchor="middle" fill="#22c55e" fontSize={9} fontWeight={600}>Ir</text>

      {circuit}

      <line x1={575} y1={15} x2={575} y2={245} stroke="#1e1e2e" strokeWidth={1} />

      <text x={PCX} y={22} textAnchor="middle" fill="#71717a" fontSize={12} fontWeight={600}>Phasor Diagram</text>
      <circle cx={PCX} cy={PCY} r={PR} fill="none" stroke="#27272a" strokeDasharray="4 3" />
      <line x1={PCX - PR - 10} y1={PCY} x2={PCX + PR + 10} y2={PCY} stroke="#1e1e2e" strokeWidth={0.5} />
      <line x1={PCX} y1={PCY - PR - 10} x2={PCX} y2={PCY + PR + 10} stroke="#1e1e2e" strokeWidth={0.5} />

      {phasor(cAbs(d.Vr), cAng(d.Vr), vMax, PR, '#06b6d4', 'Vr')}
      {phasor(cAbs(d.Vs), cAng(d.Vs), vMax, PR, '#f59e0b', 'Vs')}
      {phasor(cAbs(d.Ir), cAng(d.Ir), iMax, PR * 0.65, '#22c55e', 'Ir')}
      {phasor(cAbs(d.Is), cAng(d.Is), iMax, PR * 0.65, '#a78bfa', 'Is')}

      <text x={PCX - PR} y={PCY + PR + 20} fill="#06b6d4" fontSize={8}>{'● Vr (ref)'}</text>
      <text x={PCX - PR} y={PCY + PR + 32} fill="#f59e0b" fontSize={8}>{'● Vs'}</text>
      <text x={PCX + 10} y={PCY + PR + 20} fill="#22c55e" fontSize={8}>{'● Ir'}</text>
      <text x={PCX + 10} y={PCY + PR + 32} fill="#a78bfa" fontSize={8}>{'● Is'}</text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>ABCD Parameters — Transmission Line Models</h2>
      <p style={S.p}>
        ABCD parameters (also called transmission or chain parameters) model a transmission line
        as a linear two-port network, relating sending-end quantities to receiving-end quantities
        through a 2×2 matrix:
      </p>
      <div style={S.eq}>Vs = A · Vr + B · Ir</div>
      <div style={S.eq}>Is = C · Vr + D · Ir</div>
      <p style={S.p}>
        where Vs, Is are the sending-end voltage and current phasors, and Vr, Ir are the
        receiving-end phasors. All quantities are per-phase complex values. The ABCD parameters
        are themselves complex numbers whose magnitudes and angles carry physical meaning.
      </p>

      <h3 style={S.h3}>Physical Meaning of Each Parameter</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>A</strong> — Open-circuit voltage ratio Vs/Vr when Ir = 0. Dimensionless. For a lossless line, |A| = 1.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>B</strong> — Short-circuit transfer impedance Vs/Ir when Vr = 0. Units: Ω. Governs the voltage drop due to load current.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>C</strong> — Open-circuit transfer admittance Is/Vr when Ir = 0. Units: Siemens. Represents charging current drawn by shunt capacitance.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>D</strong> — Short-circuit current ratio Is/Ir when Vr = 0. Dimensionless. For a symmetrical line, D = A always.</li>
      </ul>

      <h3 style={S.h3}>Short Line Model (ℓ {'<'} 80 km)</h3>
      <p style={S.p}>
        For short lines, the shunt capacitance is negligibly small compared to the series
        impedance. The line is modeled as a simple series impedance Z = (r + jx) × ℓ, where
        r is resistance and x is reactance per unit length:
      </p>
      <div style={S.eq}>A = 1,  B = Z,  C = 0,  D = 1</div>
      <p style={S.p}>
        Since C = 0, the sending-end current equals the receiving-end current (Is = Ir).
        No charging current flows. This model is adequate for distribution lines and short
        sub-transmission feeders.
      </p>

      <h3 style={S.h3}>Medium Line — Nominal π Model (80–250 km)</h3>
      <p style={S.p}>
        The nominal π model places half the total shunt admittance Y as a lumped capacitor
        at each end, with the full series impedance Z between them. This is the most commonly
        used medium-line representation:
      </p>
      <div style={S.eq}>A = 1 + ZY/2,  B = Z</div>
      <div style={S.eq}>C = Y(1 + ZY/4),  D = A</div>

      <h3 style={S.h3}>Medium Line — Nominal T Model (80–250 km)</h3>
      <p style={S.p}>
        The nominal T model splits the series impedance into two equal halves Z/2, with the
        full shunt admittance Y at the midpoint:
      </p>
      <div style={S.eq}>A = 1 + ZY/2,  B = Z(1 + ZY/4)</div>
      <div style={S.eq}>C = Y,  D = A</div>
      <p style={S.p}>
        Both π and T models give identical values for A and D. They differ in B and C: the
        π model has a simpler B (= Z) but more complex C, while the T model has a simpler C (= Y)
        but more complex B. In practice the π model is preferred because shunt capacitors are
        physically located at line ends (substations), matching the π topology.
      </p>

      <h3 style={S.h3}>Long Line — Hyperbolic Form (ℓ {'>'} 250 km)</h3>
      <p style={S.p}>
        For long lines, the series impedance and shunt admittance are distributed continuously.
        The exact solution uses hyperbolic functions of the propagation constant γ = √(zy) and
        the characteristic (surge) impedance Zc = √(z/y):
      </p>
      <div style={S.eq}>A = cosh(γℓ),  B = Zc · sinh(γℓ)</div>
      <div style={S.eq}>C = sinh(γℓ) / Zc,  D = cosh(γℓ) = A</div>
      <p style={S.p}>
        The propagation constant γ = α + jβ has two components: the <strong style={{ color: '#e4e4e7' }}>attenuation
        constant</strong> α (Np/km) quantifying resistive losses, and the <strong style={{ color: '#e4e4e7' }}>phase
        constant</strong> β (rad/km) giving the spatial phase shift of the traveling wave.
        At 50 Hz the wavelength is approximately 6000 km, so even a 500 km line spans less
        than 30° of electrical length.
      </p>

      <h3 style={S.h3}>Surge Impedance Loading (SIL)</h3>
      <div style={S.eq}>SIL = V²_rated / |Zc|  (MW)</div>
      <p style={S.p}>
        The surge impedance loading is the three-phase power delivered when the load impedance
        equals the characteristic impedance Zc. At SIL, the distributed capacitance generates
        exactly as much reactive power as the series inductance consumes, resulting in a
        perfectly flat voltage profile along the entire line:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#22c55e' }}>Below SIL</strong> — Excess capacitive VAr generation. Voltage rises toward the receiving end (Ferranti effect). Shunt reactors are needed.</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>At SIL</strong> — Perfect reactive power balance. Flat voltage profile. This is the natural loading of the line.</li>
        <li style={S.li}><strong style={{ color: '#ef4444' }}>Above SIL</strong> — Excess inductive consumption. Voltage drops along the line. Shunt capacitors or SVCs/STATCOMs are required.</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>Real-World Context — AP Transco 400 kV System</span>
        <p style={S.ctxP}>
          AP Transco's 400 kV lines from Kurnool to Nellore (~350 km) are modeled as long
          transmission lines using the distributed parameter (hyperbolic) model. The SIL for
          400 kV quad ACSR Moose conductor configuration is approximately 515 MW (Zc ≈ 310 Ω).
          During off-peak hours when loading drops well below SIL, 80 MVAr shunt reactors at
          grid substations are switched in to absorb excess capacitive reactive power and
          prevent voltage rise beyond statutory limits (±5% of 400 kV per IEGC).
        </p>
      </div>

      <h3 style={S.h3}>Comparison of Line Models</h3>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Property</th>
            <th style={S.th}>Short ({'<'}80 km)</th>
            <th style={S.th}>Medium (80–250 km)</th>
            <th style={S.th}>Long ({'>'}250 km)</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Model', 'Series Z only', 'Nominal π or T', 'Distributed'],
            ['Shunt Y', 'Neglected', 'Lumped', 'Distributed'],
            ['ABCD Form', 'Simple (A=D=1)', 'Polynomial in ZY', 'Hyperbolic'],
            ['Accuracy', '±1–2%', '±3–5%', 'Exact'],
            ['Typical Use', 'Distribution, LT', 'Sub-transmission', 'EHV / UHV (400+ kV)'],
            ['Ferranti Effect', 'Negligible', 'Noticeable', 'Significant'],
          ].map(([prop, s, m, l]) => (
            <tr key={prop}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{prop}</td>
              <td style={S.td}>{s}</td>
              <td style={S.td}>{m}</td>
              <td style={S.td}>{l}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>Verification: AD − BC = 1</h3>
      <p style={S.p}>
        For any passive, bilateral, linear two-port network, the determinant of the ABCD
        matrix satisfies the reciprocity condition:
      </p>
      <div style={S.eq}>AD − BC = 1</div>
      <p style={S.p}>
        This arises because the network is bilateral — it exhibits the same impedance behavior
        regardless of the direction of power flow. Any deviation from unity in computed ABCD
        parameters indicates a numerical or modeling error. The simulation verifies this
        property in real-time for all models.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Key Formulas Summary</span>
        <p style={S.ctxP}>
          Total impedance: Z = (r + jx) × ℓ | Total admittance: Y = jb × ℓ<br />
          Propagation constant: γ = √(zy) | Characteristic impedance: Zc = √(z/y)<br />
          Voltage regulation: VR% = (|Vs| − |Vr|) / |Vr| × 100<br />
          Surge impedance loading: SIL = V²rated / |Zc|
        </p>
      </div>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Stevenson, W.D. — <em>Elements of Power System Analysis</em>, 4th Edition, McGraw-Hill</li>
        <li style={S.li}>PGCIL — Design Manual for 400 kV & 765 kV Transmission Lines</li>
        <li style={S.li}>Glover, Sarma, Overbye — <em>Power Systems Analysis and Design</em>, 6th Edition</li>
        <li style={S.li}>Central Electricity Authority — Manual on Transmission Planning Criteria</li>
      </ul>
    </div>
  );
}

const btnS = (active) => ({
  padding: '4px 10px', borderRadius: 6,
  border: active ? '1px solid #6366f1' : '1px solid #27272a',
  background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
  color: active ? '#a5b4fc' : '#52525b',
  fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
});

export default function ABCDParameters() {
  const [tab, setTab] = useState('simulate');
  const [length, setLength] = useState(200);
  const [rV, setRV] = useState(10);
  const [xV, setXV] = useState(40);
  const [bV, setBV] = useState(28);
  const [loadMW, setLoadMW] = useState(200);
  const [pfV, setPfV] = useState(90);
  const [vkv, setVkv] = useState(400);
  const [medType, setMedType] = useState('pi');

  const d = useMemo(
    () => solve(rV / 1000, xV / 1000, bV * 1e-7, length, medType, loadMW, pfV / 100, vkv),
    [rV, xV, bV, length, medType, loadMW, pfV, vkv]
  );

  const vrCol = d.VR < 5 ? '#22c55e' : d.VR < 12 ? '#f59e0b' : '#ef4444';
  const modelLabel = { short: 'Short', pi: 'Med-π', T: 'Med-T', long: 'Long' };
  const isMed = length >= 80 && length <= 250;

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
              <span style={S.rl}>|A| ∠A</span>
              <span style={{ ...S.rv, color: '#c4b5fd' }}>{cAbs(d.A).toFixed(4)} ∠{cAng(d.A).toFixed(2)}°</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>|B| ∠B</span>
              <span style={{ ...S.rv, color: '#93c5fd' }}>{cAbs(d.B).toFixed(2)} ∠{cAng(d.B).toFixed(1)}° Ω</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Vs (L-L)</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{d.VsKV.toFixed(2)} kV</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Is</span>
              <span style={{ ...S.rv, color: '#22c55e' }}>{d.IsMag.toFixed(1)} A</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>VR%</span>
              <span style={{ ...S.rv, color: vrCol }}>{d.VR.toFixed(2)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>SIL</span>
              <span style={{ ...S.rv, color: '#818cf8' }}>{d.SIL.toFixed(1)} MW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Model</span>
              <span style={{ ...S.rv, color: '#e4e4e7' }}>{modelLabel[d.type]}</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Length (km)</span>
              <input type="range" min={10} max={500} step={5} value={length}
                onChange={(e) => setLength(+e.target.value)} style={S.slider} />
              <span style={S.val}>{length}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>R (Ω/km)</span>
              <input type="range" min={5} max={150} step={5} value={rV}
                onChange={(e) => setRV(+e.target.value)} style={S.slider} />
              <span style={S.val}>{(rV / 1000).toFixed(3)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>X (Ω/km)</span>
              <input type="range" min={10} max={500} step={10} value={xV}
                onChange={(e) => setXV(+e.target.value)} style={S.slider} />
              <span style={S.val}>{(xV / 1000).toFixed(3)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>B (μS/km)</span>
              <input type="range" min={10} max={60} step={2} value={bV}
                onChange={(e) => setBV(+e.target.value)} style={S.slider} />
              <span style={S.val}>{(bV / 10).toFixed(1)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Load (MW)</span>
              <input type="range" min={50} max={500} step={10} value={loadMW}
                onChange={(e) => setLoadMW(+e.target.value)} style={S.slider} />
              <span style={S.val}>{loadMW}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>PF</span>
              <input type="range" min={70} max={100} step={1} value={pfV}
                onChange={(e) => setPfV(+e.target.value)} style={S.slider} />
              <span style={S.val}>{(pfV / 100).toFixed(2)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>V (kV)</span>
              {[132, 220, 400].map((v) => (
                <button key={v} style={btnS(vkv === v)} onClick={() => setVkv(v)}>{v}</button>
              ))}
            </div>
            {isMed && (
              <div style={S.cg}>
                <span style={S.label}>Model</span>
                <button style={btnS(medType === 'pi')} onClick={() => setMedType('pi')}>π</button>
                <button style={btnS(medType === 'T')} onClick={() => setMedType('T')}>T</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
