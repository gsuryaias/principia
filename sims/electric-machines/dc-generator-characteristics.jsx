import React, { useState, useMemo, useEffect, useCallback } from 'react';

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

const E_MAX = 280, IF_KNEE = 1.2, IF_RES = 0.03, N_RATED = 1500, RA = 0.5, RSE = 0.2;

function occ(If, N) {
  return (N / N_RATED) * E_MAX * (If + IF_RES) / (If + IF_RES + IF_KNEE);
}

function occSlope0(N) {
  return (N / N_RATED) * E_MAX * IF_KNEE / ((IF_RES + IF_KNEE) * (IF_RES + IF_KNEE));
}

function findNoLoad(N, Rf) {
  let Vt = occ(0, N);
  for (let i = 0; i < 60; i++) {
    const nxt = occ(Vt / Rf, N);
    if (Math.abs(nxt - Vt) < 0.05) return nxt;
    Vt = nxt;
  }
  return Vt;
}

function extSepExcited(N, Rf, maxIL) {
  const V_nl = findNoLoad(N, Rf);
  const If_sep = V_nl / Rf;
  const Eg = occ(If_sep, N);
  const pts = [];
  for (let IL = 0; IL <= maxIL; IL += 0.5) {
    const Vt = Eg - IL * RA;
    if (Vt < 0) break;
    pts.push({ il: IL, vt: Vt });
  }
  return pts;
}

function extShunt(N, Rf, maxIL) {
  let Vt = findNoLoad(N, Rf);
  const pts = [];
  for (let IL = 0; IL <= maxIL; IL += 0.5) {
    for (let iter = 0; iter < 40; iter++) {
      const If = Math.max(Vt / Rf, 0);
      const Ia = IL + If;
      const Eg = occ(If, N);
      const Vn = Eg - Ia * RA;
      if (Math.abs(Vn - Vt) < 0.05) { Vt = Math.max(Vn, 0); break; }
      Vt = Math.max(Vn, 0);
    }
    if (Vt < 1) break;
    pts.push({ il: IL, vt: Vt });
  }
  return pts;
}

function extSeries(N, maxIL) {
  const pts = [];
  for (let IL = 0.5; IL <= maxIL; IL += 0.5) {
    const Eg = occ(IL, N);
    const Vt = Eg - IL * (RA + RSE);
    if (Vt < 0) break;
    pts.push({ il: IL, vt: Vt });
  }
  return pts;
}

function Diagram({ N, Rf, buildEgs, extType }) {
  const PX = 70, PY = 40, PW = 380, PH = 250;
  const IF_MAX = 3.5, EG_MAX = 260;
  const sx = v => PX + (v / IF_MAX) * PW;
  const sy = v => PY + PH - (Math.min(v, EG_MAX) / EG_MAX) * PH;

  const occPath = useMemo(() => {
    let d = '';
    for (let i = 0; i <= IF_MAX * 100; i++) {
      const If = i / 100;
      const Eg = occ(If, N);
      d += (i === 0 ? 'M' : 'L') + `${sx(If).toFixed(1)},${sy(Eg).toFixed(1)}`;
    }
    return d;
  }, [N]);

  const rfCrit = occSlope0(N);
  const rfLineEnd = Math.min(EG_MAX / Rf, IF_MAX);
  const rfCritEnd = Math.min(EG_MAX / rfCrit, IF_MAX);

  const cobwebPath = useMemo(() => {
    if (buildEgs.length < 1) return '';
    let d = `M ${sx(0).toFixed(1)},${sy(buildEgs[0]).toFixed(1)}`;
    for (let i = 1; i < buildEgs.length; i++) {
      const prevEg = buildEgs[i - 1];
      const newIf = prevEg / Rf;
      const newEg = buildEgs[i];
      d += ` L ${sx(newIf).toFixed(1)},${sy(prevEg).toFixed(1)}`;
      d += ` L ${sx(newIf).toFixed(1)},${sy(newEg).toFixed(1)}`;
    }
    return d;
  }, [buildEgs, Rf]);

  const steadyV = findNoLoad(N, Rf);
  const steadyIf = steadyV / Rf;

  const EX = 535, EY = PY, EW = 380, EH = PH;
  const IL_MAX = 50, VT_MAX = EG_MAX;
  const esx = v => EX + (v / IL_MAX) * EW;
  const esy = v => EY + EH - (Math.min(v, VT_MAX) / VT_MAX) * EH;

  const extCurves = useMemo(() => ({
    sep: extSepExcited(N, Rf, IL_MAX),
    shunt: extShunt(N, Rf, IL_MAX),
    series: extSeries(N, IL_MAX),
  }), [N, Rf]);

  const toExtPath = pts => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${esx(p.il).toFixed(1)},${esy(p.vt).toFixed(1)}`).join('');

  const yTicks = [0, 50, 100, 150, 200, 250];
  const xTicks1 = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5];
  const xTicks2 = [0, 10, 20, 30, 40, 50];

  return (
    <svg viewBox="0 0 960 360" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      {/* ── Left: OCC + Voltage Build-up ── */}
      <text x={PX + PW / 2} y={20} textAnchor="middle" fill="#71717a" fontSize={12} fontWeight={600}>
        Open Circuit Characteristic (OCC) — N = {N} rpm
      </text>

      {yTicks.map(v => <line key={`yg${v}`} x1={PX} y1={sy(v)} x2={PX + PW} y2={sy(v)} stroke="#1e1e2e" strokeWidth={1} />)}
      {xTicks1.map(v => <line key={`xg${v}`} x1={sx(v)} y1={PY} x2={sx(v)} y2={PY + PH} stroke="#1e1e2e" strokeWidth={1} />)}
      <line x1={PX} y1={PY} x2={PX} y2={PY + PH} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={PX} y1={PY + PH} x2={PX + PW} y2={PY + PH} stroke="#3f3f46" strokeWidth={1.5} />
      {yTicks.map(v => <text key={`yl${v}`} x={PX - 6} y={sy(v) + 4} textAnchor="end" fill="#52525b" fontSize={9}>{v}</text>)}
      {xTicks1.map(v => <text key={`xl${v}`} x={sx(v)} y={PY + PH + 14} textAnchor="middle" fill="#52525b" fontSize={8}>{v}</text>)}
      <text x={PX + PW / 2} y={PY + PH + 30} textAnchor="middle" fill="#71717a" fontSize={10}>Field Current If (A)</text>
      <text x={18} y={PY + PH / 2} textAnchor="middle" fill="#71717a" fontSize={10} transform={`rotate(-90, 18, ${PY + PH / 2})`}>EMF Eg (V)</text>

      {/* OCC curve */}
      <path d={occPath} fill="none" stroke="#3b82f6" strokeWidth={2.5} />
      <text x={sx(IF_MAX) - 30} y={sy(occ(IF_MAX, N)) - 8} fill="#3b82f6" fontSize={10} fontWeight={600}>OCC</text>

      {/* Rf line (current setting) */}
      <line x1={sx(0)} y1={sy(0)} x2={sx(rfLineEnd)} y2={sy(Rf * rfLineEnd)} stroke="#ef4444" strokeWidth={1.8} strokeDasharray="6 3" />
      <text x={sx(rfLineEnd) + 4} y={sy(Rf * rfLineEnd) - 4} fill="#ef4444" fontSize={9} fontWeight={500}>Rf = {Rf}Ω</text>

      {/* Critical Rf line */}
      <line x1={sx(0)} y1={sy(0)} x2={sx(rfCritEnd)} y2={sy(rfCrit * rfCritEnd)} stroke="#52525b" strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
      <text x={sx(rfCritEnd) + 4} y={sy(rfCrit * rfCritEnd) + 4} fill="#52525b" fontSize={8} opacity={0.6}>Rf,crit = {rfCrit.toFixed(0)}Ω</text>

      {/* Steady-state operating point */}
      {Rf < rfCrit && (
        <g>
          <circle cx={sx(steadyIf)} cy={sy(steadyV)} r={5} fill="none" stroke="#22c55e" strokeWidth={2} />
          <circle cx={sx(steadyIf)} cy={sy(steadyV)} r={2.5} fill="#22c55e" />
          <text x={sx(steadyIf) + 10} y={sy(steadyV) - 6} fill="#22c55e" fontSize={9} fontWeight={600}>{steadyV.toFixed(0)}V</text>
        </g>
      )}

      {/* Cobweb/staircase build-up */}
      {cobwebPath && <path d={cobwebPath} fill="none" stroke="#f59e0b" strokeWidth={1.8} opacity={0.85} />}

      {/* Build-up step dots */}
      {buildEgs.map((eg, i) => {
        if (i === 0) return <circle key={i} cx={sx(0)} cy={sy(eg)} r={3} fill="#f59e0b" />;
        const prevEg = buildEgs[i - 1];
        const newIf = prevEg / Rf;
        return <circle key={i} cx={sx(newIf)} cy={sy(eg)} r={3} fill="#f59e0b" />;
      })}

      {/* Build-up label */}
      {buildEgs.length > 1 && (
        <text x={PX + 10} y={PY + 15} fill="#f59e0b" fontSize={10} fontWeight={500}>
          Build-up: Step {buildEgs.length - 1} → {buildEgs[buildEgs.length - 1].toFixed(1)}V
        </text>
      )}

      {/* Divider */}
      <line x1={510} y1={PY - 5} x2={510} y2={PY + PH + 20} stroke="#1e1e2e" strokeWidth={1} />

      {/* ── Right: External Characteristics ── */}
      <text x={EX + EW / 2} y={20} textAnchor="middle" fill="#71717a" fontSize={12} fontWeight={600}>
        External Characteristics (Vt vs IL)
      </text>

      {yTicks.map(v => <line key={`eyg${v}`} x1={EX} y1={esy(v)} x2={EX + EW} y2={esy(v)} stroke="#1e1e2e" strokeWidth={1} />)}
      {xTicks2.map(v => <line key={`exg${v}`} x1={esx(v)} y1={EY} x2={esx(v)} y2={EY + EH} stroke="#1e1e2e" strokeWidth={1} />)}
      <line x1={EX} y1={EY} x2={EX} y2={EY + EH} stroke="#3f3f46" strokeWidth={1.5} />
      <line x1={EX} y1={EY + EH} x2={EX + EW} y2={EY + EH} stroke="#3f3f46" strokeWidth={1.5} />
      {yTicks.map(v => <text key={`eyl${v}`} x={EX - 6} y={esy(v) + 4} textAnchor="end" fill="#52525b" fontSize={9}>{v}</text>)}
      {xTicks2.map(v => <text key={`exl${v}`} x={esx(v)} y={EY + EH + 14} textAnchor="middle" fill="#52525b" fontSize={9}>{v}</text>)}
      <text x={EX + EW / 2} y={EY + EH + 30} textAnchor="middle" fill="#71717a" fontSize={10}>Load Current IL (A)</text>
      <text x={EX - 35} y={EY + EH / 2} textAnchor="middle" fill="#71717a" fontSize={10} transform={`rotate(-90, ${EX - 35}, ${EY + EH / 2})`}>Vt (V)</text>

      {/* Separately excited */}
      {(extType === 'all' || extType === 'sep') && extCurves.sep.length > 1 && (
        <g>
          <path d={toExtPath(extCurves.sep)} fill="none" stroke="#22c55e" strokeWidth={2} />
          <text x={esx(extCurves.sep[Math.min(6, extCurves.sep.length - 1)]?.il || 0) + 4} y={esy(extCurves.sep[Math.min(6, extCurves.sep.length - 1)]?.vt || 0) - 6} fill="#22c55e" fontSize={9}>Sep. Excited</text>
        </g>
      )}

      {/* Shunt */}
      {(extType === 'all' || extType === 'shunt') && extCurves.shunt.length > 1 && (
        <g>
          <path d={toExtPath(extCurves.shunt)} fill="none" stroke="#3b82f6" strokeWidth={2} />
          {extCurves.shunt.length > 8 && (
            <text x={esx(extCurves.shunt[Math.min(12, extCurves.shunt.length - 1)]?.il || 0) + 4} y={esy(extCurves.shunt[Math.min(12, extCurves.shunt.length - 1)]?.vt || 0) + 14} fill="#3b82f6" fontSize={9}>Shunt</text>
          )}
        </g>
      )}

      {/* Series */}
      {(extType === 'all' || extType === 'series') && extCurves.series.length > 1 && (
        <g>
          <path d={toExtPath(extCurves.series)} fill="none" stroke="#f59e0b" strokeWidth={2} />
          {extCurves.series.length > 5 && (
            <text x={esx(extCurves.series[Math.min(10, extCurves.series.length - 1)]?.il || 0) + 4} y={esy(extCurves.series[Math.min(10, extCurves.series.length - 1)]?.vt || 0) - 6} fill="#f59e0b" fontSize={9}>Series</text>
          )}
        </g>
      )}

      {/* Legend */}
      <line x1={EX + 10} y1={EY + EH + 42} x2={EX + 30} y2={EY + EH + 42} stroke="#22c55e" strokeWidth={2} />
      <text x={EX + 35} y={EY + EH + 45} fill="#71717a" fontSize={9}>Sep. Excited</text>
      <line x1={EX + 130} y1={EY + EH + 42} x2={EX + 150} y2={EY + EH + 42} stroke="#3b82f6" strokeWidth={2} />
      <text x={EX + 155} y={EY + EH + 45} fill="#71717a" fontSize={9}>Shunt</text>
      <line x1={EX + 210} y1={EY + EH + 42} x2={EX + 230} y2={EY + EH + 42} stroke="#f59e0b" strokeWidth={2} />
      <text x={EX + 235} y={EY + EH + 45} fill="#71717a" fontSize={9}>Series</text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>DC Generator — Characteristics & Self-Excitation</h2>
      <p style={S.p}>
        A DC generator converts mechanical energy into electrical energy by rotating armature
        conductors in a magnetic field. The generated EMF depends on speed, flux, and machine
        constants. The key challenge is establishing the magnetic field itself — which in a
        self-excited generator comes from the generator's own output.
      </p>

      <h3 style={S.h3}>Generated EMF Equation</h3>
      <div style={S.eq}>Eg = (P × φ × N × Z) / (60 × A) = Kφ × ω</div>
      <p style={S.p}>
        The generated EMF is proportional to both the speed and the flux per pole. The
        Open Circuit Characteristic (OCC) plots Eg versus field current If at constant
        speed. Its shape follows the magnetization curve of the machine's iron core — initially
        linear (unsaturated), then curving at the knee point (saturation onset), and finally
        nearly flat (deep saturation).
      </p>

      <h3 style={S.h3}>Open Circuit Characteristic (OCC)</h3>
      <p style={S.p}>
        The OCC is obtained experimentally by driving the generator at constant speed with
        no load connected, and measuring the terminal voltage as the field current is varied.
        It is also called the <strong style={{ color: '#e4e4e7' }}>magnetization curve</strong>
        or <strong style={{ color: '#e4e4e7' }}>no-load saturation curve</strong>. At If = 0,
        a small residual EMF exists due to remanent magnetism in the iron core.
      </p>
      <p style={S.p}>
        The OCC scales linearly with speed: at half the rated speed, every point on the curve
        is halved. This property is used to find the OCC at any speed from a single measured curve.
      </p>

      <h3 style={S.h3}>Voltage Build-Up in a Self-Excited Shunt Generator</h3>
      <p style={S.p}>
        The voltage build-up process in a self-excited shunt generator is a remarkable example
        of positive feedback converging to a stable equilibrium:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>Step 1:</strong> Residual magnetism in the poles produces a small EMF (typically 2–5% of rated voltage) even with zero field current.</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>Step 2:</strong> This residual EMF drives a small current through the field winding: If = E_res / Rf.</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>Step 3:</strong> The field current strengthens the magnetic field, producing a larger EMF (read from the OCC at the new If).</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>Step 4:</strong> The larger EMF drives more field current, which produces even more EMF...</li>
        <li style={S.li}><strong style={{ color: '#22c55e' }}>Convergence:</strong> The process continues in a staircase pattern until the OCC and the field resistance line (Eg = Rf × If) intersect. At this point, the EMF exactly supports the field current needed to produce it — a stable equilibrium.</li>
      </ul>
      <div style={S.ctx}>
        <span style={S.ctxT}>The Cobweb Diagram</span>
        <p style={S.ctxP}>
          The voltage build-up is visualized as a cobweb or staircase on the OCC plot. Starting
          from residual EMF, alternate horizontal steps (to the Rf line) and vertical steps (to
          the OCC) trace the convergence path. The final operating voltage is at the intersection
          of the OCC and Rf line. Use the "Animate Build-up" button in the simulation to watch
          this process unfold step by step.
        </p>
      </div>

      <h3 style={S.h3}>Conditions for Self-Excitation</h3>
      <p style={S.p}>
        For voltage to build up successfully, all four conditions must be satisfied simultaneously:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>1. Residual magnetism must exist</strong> — The iron core must retain some magnetism from previous operation. If the machine is completely demagnetized, an external DC source must be briefly applied to the field winding ("flashing the field").</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>2. Correct field polarity</strong> — The field winding must be connected so that the current it carries reinforces (not opposes) the residual flux. If connected in reverse, the field current will demagnetize the core.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>3. Rf {'<'} Rf,critical</strong> — The field resistance must be less than the critical value, which equals the slope of the OCC's air-gap line (the linear extrapolation of the unsaturated region through the origin). If Rf is too high, the Rf line doesn't intersect the OCC at any significant voltage.</li>
        <li style={S.li}><strong style={{ color: '#e4e4e7' }}>4. Speed ≥ N_min</strong> — The speed must be high enough that the OCC (which scales with speed) has an initial slope greater than Rf. The minimum speed is: N_min = N_rated × (Rf / Rf,critical at rated speed).</li>
      </ul>

      <h3 style={S.h3}>Critical Field Resistance</h3>
      <div style={S.eq}>Rf,critical = dEg/dIf |_{If→0} = (tangent to OCC from origin)</div>
      <p style={S.p}>
        The critical field resistance is the maximum Rf at which the generator can build up
        voltage. It equals the slope of the tangent drawn from the origin to the OCC curve.
        In practice, this is approximately the slope of the air-gap line (the initial linear
        part of the OCC). The critical Rf increases proportionally with speed.
      </p>

      <h3 style={S.h3}>External Characteristics (V_t vs I_L)</h3>
      <p style={S.p}>
        The external characteristic shows how the terminal voltage varies with load current.
        It differs significantly between generator types:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#22c55e' }}>Separately Excited:</strong> Vt = Eg − Ia·Ra. Since flux is maintained by an independent source, the drop is only due to armature resistance — a gentle linear decline.</li>
        <li style={S.li}><strong style={{ color: '#3b82f6' }}>Shunt:</strong> Vt = Eg(If) − Ia·Ra where If = Vt/Rf. As Vt drops under load, field current also drops, reducing Eg further — a steeper decline than separately excited. Eventually voltage collapses (the generator "dumps" its voltage).</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>Series:</strong> If = Ia = IL (field in series). At light load, Eg is small (little flux) and so is Vt. As load increases, flux builds and Vt rises — until the IaRa drop overcomes the EMF increase. The curve rises then falls.</li>
      </ul>

      <h3 style={S.h3}>Voltage Regulation</h3>
      <div style={S.eq}>Voltage Regulation = (V_no-load − V_full-load) / V_full-load × 100%</div>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Generator Type</th>
            <th style={S.th}>Typical Regulation</th>
            <th style={S.th}>Vt Behavior Under Load</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Separately Excited', '5–10%', 'Slight linear drop'],
            ['Shunt', '10–15% (then collapses)', 'Drops, then collapses at high load'],
            ['Series', 'Negative at light load', 'Rises then falls'],
            ['Compound (cumulative)', '0–5% (designed flat)', 'Nearly constant (compensated)'],
          ].map(([t, r, b]) => (
            <tr key={t}>
              <td style={{ ...S.td, color: '#e4e4e7', fontWeight: 600 }}>{t}</td>
              <td style={S.td}>{r}</td>
              <td style={S.td}>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Chapman, S.J. — <em>Electric Machinery Fundamentals</em>, 5th Edition, McGraw-Hill</li>
        <li style={S.li}>Fitzgerald, Kingsley, Umans — <em>Electric Machinery</em>, 7th Edition</li>
        <li style={S.li}>Theraja, B.L. — <em>A Textbook of Electrical Technology Vol. II</em>, S. Chand</li>
        <li style={S.li}>IS 4722 — Indian Standard for Rotating Electrical Machines</li>
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

export default function DCGeneratorCharacteristics() {
  const [tab, setTab] = useState('simulate');
  const [N, setN] = useState(1500);
  const [Rf, setRf] = useState(100);
  const [extType, setExtType] = useState('all');
  const [buildEgs, setBuildEgs] = useState([]);

  const rfCrit = occSlope0(N);
  const canBuild = Rf < rfCrit;
  const steadyV = findNoLoad(N, Rf);
  const steadyIf = steadyV / Rf;
  const nMin = Rf / (occSlope0(N_RATED)) * N_RATED;

  useEffect(() => { setBuildEgs([]); }, [N, Rf]);

  useEffect(() => {
    if (buildEgs.length === 0) return;
    const last = buildEgs[buildEgs.length - 1];
    const newIf = last / Rf;
    const newEg = occ(newIf, N);
    if (Math.abs(newEg - last) < 0.3 || buildEgs.length > 25) return;

    const timer = setTimeout(() => {
      setBuildEgs(prev => [...prev, newEg]);
    }, 400);
    return () => clearTimeout(timer);
  }, [buildEgs, Rf, N]);

  const startBuildUp = useCallback(() => {
    const Eg0 = occ(0, N);
    setBuildEgs([Eg0]);
  }, [N]);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram N={N} Rf={Rf} buildEgs={buildEgs} extType={extType} />
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Steady-State V</span>
              <span style={{ ...S.rv, color: canBuild ? '#22c55e' : '#ef4444' }}>{canBuild ? `${steadyV.toFixed(1)} V` : 'No build-up'}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>If (steady)</span>
              <span style={{ ...S.rv, color: '#93c5fd' }}>{canBuild ? `${steadyIf.toFixed(2)} A` : '—'}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Rf,crit</span>
              <span style={{ ...S.rv, color: '#c4b5fd' }}>{rfCrit.toFixed(0)} Ω</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>N_min</span>
              <span style={{ ...S.rv, color: N >= nMin ? '#22c55e' : '#ef4444' }}>{nMin.toFixed(0)} rpm</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Self-Excitation</span>
              <span style={{ ...S.rv, color: canBuild && N >= nMin ? '#22c55e' : '#ef4444' }}>
                {canBuild && N >= nMin ? 'CAN build up' : 'CANNOT build up'}
              </span>
            </div>
            {buildEgs.length > 1 && (
              <div style={S.ri}>
                <span style={S.rl}>Build-up Step</span>
                <span style={{ ...S.rv, color: '#f59e0b' }}>{buildEgs.length - 1} → {buildEgs[buildEgs.length - 1].toFixed(1)}V</span>
              </div>
            )}
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Speed (rpm)</span>
              <input type="range" min={500} max={2000} step={50} value={N} onChange={e => setN(+e.target.value)} style={S.slider} />
              <span style={S.val}>{N}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Rf (Ω)</span>
              <input type="range" min={30} max={350} step={5} value={Rf} onChange={e => setRf(+e.target.value)} style={S.slider} />
              <span style={S.val}>{Rf} Ω</span>
            </div>
            <div style={S.cg}>
              <button style={btnS(buildEgs.length > 0, '#f59e0b')} onClick={startBuildUp}>
                {buildEgs.length > 0 ? 'Restart Build-up' : 'Animate Build-up'}
              </button>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Ext. Char.</span>
              <button style={btnS(extType === 'all', '#6366f1')} onClick={() => setExtType('all')}>All</button>
              <button style={btnS(extType === 'sep', '#22c55e')} onClick={() => setExtType('sep')}>Sep. Exc.</button>
              <button style={btnS(extType === 'shunt', '#3b82f6')} onClick={() => setExtType('shunt')}>Shunt</button>
              <button style={btnS(extType === 'series', '#f59e0b')} onClick={() => setExtType('series')}>Series</button>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
