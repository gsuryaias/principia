import React, { useState, useEffect, useRef, useMemo } from 'react';

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

// ── Physics helpers ──────────────────────────────────────────────────────────
function computeTransformer(V1, ratio, freq) {
  // ratio = N1/N2 (turns ratio slider)
  const N1 = ratio;   // normalised: treat N1 = ratio, N2 = 1
  const N2 = 1;
  const a = N2 / N1;  // voltage ratio V2/V1
  const V2 = V1 * a;
  // Assume Φmax = 1 Wb (normalised). Real Φmax = E1/(4.44*f*N1)
  // For display we compute Φmax from the EMF equation E1 ≈ V1 (ideal):
  // E1 = 4.44 * f * N1 * Φmax  →  Φmax = V1/(4.44*f*N1)
  const Phimax = V1 / (4.44 * freq * N1);  // Wb
  const E1rms = 4.44 * freq * N1 * Phimax; // ≈ V1
  const E2rms = 4.44 * freq * N2 * Phimax; // ≈ V2
  return { V1, V2, a, N1, N2, Phimax, E1rms, E2rms, freq };
}

// ── Waveform path builders ───────────────────────────────────────────────────
function buildCosPath(ox, oy, W, H, phase) {
  let d = '';
  for (let i = 0; i <= 360; i += 2) {
    const x = ox + (i / 360) * W;
    const y = oy - Math.cos((i + phase) * Math.PI / 180) * H;
    d += (i === 0 ? 'M' : 'L') + `${x.toFixed(2)},${y.toFixed(2)}`;
  }
  return d;
}

function buildSinPath(ox, oy, W, H, phase) {
  let d = '';
  for (let i = 0; i <= 360; i += 2) {
    const x = ox + (i / 360) * W;
    const y = oy - Math.sin((i + phase) * Math.PI / 180) * H;
    d += (i === 0 ? 'M' : 'L') + `${x.toFixed(2)},${y.toFixed(2)}`;
  }
  return d;
}

// ── Coil symbol (zigzag) ─────────────────────────────────────────────────────
function Coil({ x, y, count, color, label, side }) {
  // Draws 'count' coil loops stacked vertically
  const h = Math.min(12, 80 / count);
  const w = 18;
  const totalH = count * h;
  const startY = y - totalH / 2;
  const points = [];
  for (let i = 0; i < count; i++) {
    const ty = startY + i * h + h / 2;
    if (side === 'left') {
      points.push(`M ${x - w / 2},${ty - h / 2} C ${x - w},${ty - h / 2} ${x - w},${ty + h / 2} ${x - w / 2},${ty + h / 2}`);
    } else {
      points.push(`M ${x + w / 2},${ty - h / 2} C ${x + w},${ty - h / 2} ${x + w},${ty + h / 2} ${x + w / 2},${ty + h / 2}`);
    }
  }
  return (
    <g>
      {points.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" opacity={0.9} />
      ))}
      <text x={x} y={y - totalH / 2 - 8} textAnchor="middle" fill={color} fontSize={10} fontWeight={700}>{label}</text>
    </g>
  );
}

// ── Main Diagram ─────────────────────────────────────────────────────────────
function Diagram({ trx, phase }) {
  const { V1, V2, a, N1, N2, Phimax, E1rms, E2rms } = trx;

  // Core geometry (shell/E-I type simplified to rectangular)
  // Outer core rectangle
  const CX = 480, CY = 155;        // core centre
  const CW = 200, CH = 130;         // outer core dims
  const LW = 32;                    // limb width
  const YH = 26;                    // yoke height

  // Flux animation: sinusoidal brightness pulse
  const fluxNorm = Math.sin(phase * Math.PI / 180); // -1..1
  const brightness = Math.abs(fluxNorm);             // 0..1
  const coreAlpha = 0.25 + brightness * 0.55;
  const coreColor = `rgba(${Math.round(60 + brightness * 80)},${Math.round(50 + brightness * 60)},${Math.round(200 + brightness * 55)},${coreAlpha})`;
  const coreBorder = `rgba(${Math.round(80 + brightness * 100)},${Math.round(70 + brightness * 80)},255,${0.4 + brightness * 0.4})`;

  // Waveform panel geometry
  const W1X = 20, W1Y = 155, WW = 190, WH = 52;   // primary waveform left panel
  const W2X = 750, W2Y = 155, WH2 = 52;            // secondary waveform right panel

  // Animated phase angle for moving cursor
  const cursorDeg = phase % 360;

  // Primary waveform path (cos — EMF leads flux by 90°)
  const pri1Path = useMemo(() => buildCosPath(W1X, W1Y, WW, WH, 0), []);
  // Phase-shifted static path, cursor is animated via phase
  const cursorX1 = W1X + (cursorDeg / 360) * WW;
  const cursorY1 = W1Y - Math.cos(cursorDeg * Math.PI / 180) * WH;

  const cursorX2 = W2X + (cursorDeg / 360) * WW;
  const cursorY2 = W2Y - Math.cos(cursorDeg * Math.PI / 180) * WH2;

  // Flux path (sin)
  const fluxPath = useMemo(() => buildSinPath(CX - 90, CY + 175, 180, 20, 0), []);
  const fluxCursorX = CX - 90 + (cursorDeg / 360) * 180;
  const fluxCursorY = CY + 175 - Math.sin(cursorDeg * Math.PI / 180) * 20;

  // Number of visible coil turns clamped
  const n1Turns = Math.min(Math.round(N1 * 3), 12);
  const n2Turns = Math.max(Math.round(n1Turns / N1), 1);

  // Flux arrow direction: fluxNorm > 0 → clockwise, < 0 → counter-clockwise
  const arrowOpa = brightness * 0.85;
  const arrowDir = fluxNorm >= 0 ? 1 : -1;

  // Core rectangles
  const outerX = CX - CW / 2, outerY = CY - CH / 2;
  const innerX = CX - CW / 2 + LW, innerY = CY - CH / 2 + YH;
  const innerW = CW - 2 * LW, innerH = CH - 2 * YH;

  // Coil positions (on left and right limbs)
  const leftLimbX = CX - CW / 2 + LW / 2;
  const rightLimbX = CX + CW / 2 - LW / 2;

  // V2/V1 ratio display
  const ratioStr = a.toFixed(3);

  return (
    <svg viewBox="0 0 960 320" style={{ width: '100%', maxWidth: 960, height: 'auto' }}>
      <defs>
        <marker id="tfa" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
          <polygon points="0,0 6,2.5 0,5" fill="#a78bfa" opacity={0.9} />
        </marker>
        <marker id="tfb" markerWidth="6" markerHeight="5" refX="0" refY="2.5" orient="auto-start-reverse">
          <polygon points="0,0 6,2.5 0,5" fill="#a78bfa" opacity={0.9} />
        </marker>
        <marker id="fluxA" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0,0 5,2 0,4" fill="#818cf8" opacity={0.8} />
        </marker>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── TITLE ── */}
      <text x={480} y={15} textAnchor="middle" fill="#52525b" fontSize={11} fontWeight={600}>
        Transformer — Animated Core Flux & EMF (Ideal, Single-Phase)
      </text>

      {/* ══ CORE BODY ══ */}
      {/* Outer filled rectangles (E-I limbs) */}
      {/* Top yoke */}
      <rect x={outerX} y={outerY} width={CW} height={YH} rx={3}
        fill={coreColor} stroke={coreBorder} strokeWidth={1.5} />
      {/* Bottom yoke */}
      <rect x={outerX} y={outerY + CH - YH} width={CW} height={YH} rx={3}
        fill={coreColor} stroke={coreBorder} strokeWidth={1.5} />
      {/* Left limb */}
      <rect x={outerX} y={outerY + YH} width={LW} height={CH - 2 * YH}
        fill={coreColor} stroke={coreBorder} strokeWidth={1.5} />
      {/* Right limb */}
      <rect x={outerX + CW - LW} y={outerY + YH} width={LW} height={CH - 2 * YH}
        fill={coreColor} stroke={coreBorder} strokeWidth={1.5} />
      {/* Centre limb (shell type) */}
      <rect x={innerX} y={outerY + YH} width={innerW} height={CH - 2 * YH}
        fill={`rgba(${Math.round(40 + brightness * 60)},${Math.round(35 + brightness * 50)},${Math.round(160 + brightness * 60)},${coreAlpha * 0.6})`}
        stroke={coreBorder} strokeWidth={1} strokeDasharray="4 3" opacity={0.6} />

      {/* Window (air gap in window) */}
      <rect x={innerX} y={innerY} width={innerW / 2 - 4} height={innerH}
        fill="#09090b" stroke="#1e1e2e" strokeWidth={0.5} rx={2} />
      <rect x={innerX + innerW / 2 + 4} y={innerY} width={innerW / 2 - 4} height={innerH}
        fill="#09090b" stroke="#1e1e2e" strokeWidth={0.5} rx={2} />

      {/* Core label */}
      <text x={CX} y={CY + 4} textAnchor="middle" fill={`rgba(148,163,250,${0.3 + brightness * 0.5})`}
        fontSize={9} fontWeight={700} letterSpacing="0.08em">IRON CORE</text>

      {/* ══ FLUX ARROWS in core (animated direction) ══ */}
      {/* Top yoke: left→right if fluxNorm>0 */}
      <line
        x1={arrowDir > 0 ? outerX + 10 : outerX + CW - 10}
        y1={outerY + YH / 2}
        x2={arrowDir > 0 ? outerX + CW - 10 : outerX + 10}
        y2={outerY + YH / 2}
        stroke="#818cf8" strokeWidth={1.5} opacity={arrowOpa}
        markerEnd="url(#fluxA)" />
      {/* Bottom yoke: right→left if fluxNorm>0 */}
      <line
        x1={arrowDir > 0 ? outerX + CW - 10 : outerX + 10}
        y1={outerY + CH - YH / 2}
        x2={arrowDir > 0 ? outerX + 10 : outerX + CW - 10}
        y2={outerY + CH - YH / 2}
        stroke="#818cf8" strokeWidth={1.5} opacity={arrowOpa}
        markerEnd="url(#fluxA)" />
      {/* Left limb: down if fluxNorm>0 */}
      <line
        x1={outerX + LW / 2}
        y1={arrowDir > 0 ? outerY + YH + 6 : outerY + CH - YH - 6}
        x2={outerX + LW / 2}
        y2={arrowDir > 0 ? outerY + CH - YH - 6 : outerY + YH + 6}
        stroke="#818cf8" strokeWidth={1.5} opacity={arrowOpa}
        markerEnd="url(#fluxA)" />
      {/* Right limb: up if fluxNorm>0 */}
      <line
        x1={outerX + CW - LW / 2}
        y1={arrowDir > 0 ? outerY + CH - YH - 6 : outerY + YH + 6}
        x2={outerX + CW - LW / 2}
        y2={arrowDir > 0 ? outerY + YH + 6 : outerY + CH - YH - 6}
        stroke="#818cf8" strokeWidth={1.5} opacity={arrowOpa}
        markerEnd="url(#fluxA)" />

      {/* ══ PRIMARY WINDING (indigo) on left limb ══ */}
      <Coil x={leftLimbX} y={CY} count={n1Turns} color="#818cf8" label={`N₁=${n1Turns}`} side="left" />

      {/* Primary terminal lines */}
      <line x1={leftLimbX - 18} y1={CY - 30} x2={leftLimbX - 60} y2={CY - 30}
        stroke="#6366f1" strokeWidth={1.5} />
      <line x1={leftLimbX - 18} y1={CY + 30} x2={leftLimbX - 60} y2={CY + 30}
        stroke="#6366f1" strokeWidth={1.5} />
      {/* AC source symbol */}
      <circle cx={leftLimbX - 75} cy={CY} r={18} fill="none" stroke="#6366f1" strokeWidth={1.5} />
      <path d={`M ${leftLimbX - 85},${CY} Q ${leftLimbX - 80},${CY - 8} ${leftLimbX - 75},${CY} Q ${leftLimbX - 70},${CY + 8} ${leftLimbX - 65},${CY}`}
        fill="none" stroke="#818cf8" strokeWidth={1.5} />
      <line x1={leftLimbX - 75} y1={CY - 18} x2={leftLimbX - 75} y2={CY - 30}
        stroke="#6366f1" strokeWidth={1.5} />
      <line x1={leftLimbX - 75} y1={CY + 18} x2={leftLimbX - 75} y2={CY + 30}
        stroke="#6366f1" strokeWidth={1.5} />
      <text x={leftLimbX - 75} y={CY - 36} textAnchor="middle" fill="#818cf8" fontSize={10} fontWeight={600}>V₁</text>

      {/* ══ SECONDARY WINDING (amber) on right limb ══ */}
      <Coil x={rightLimbX} y={CY} count={n2Turns} color="#f59e0b" label={`N₂=${n2Turns}`} side="right" />

      {/* Secondary terminal lines */}
      <line x1={rightLimbX + 18} y1={CY - 30} x2={rightLimbX + 60} y2={CY - 30}
        stroke="#f59e0b" strokeWidth={1.5} />
      <line x1={rightLimbX + 18} y1={CY + 30} x2={rightLimbX + 60} y2={CY + 30}
        stroke="#f59e0b" strokeWidth={1.5} />
      {/* Load symbol */}
      <rect x={rightLimbX + 62} y={CY - 14} width={22} height={28} rx={4}
        fill="none" stroke="#f59e0b" strokeWidth={1.5} />
      <text x={rightLimbX + 73} y={CY + 4} textAnchor="middle" fill="#fbbf24" fontSize={8} fontWeight={600}>R</text>
      <line x1={rightLimbX + 84} y1={CY - 30} x2={rightLimbX + 84} y2={CY - 14}
        stroke="#f59e0b" strokeWidth={1.5} />
      <line x1={rightLimbX + 84} y1={CY + 14} x2={rightLimbX + 84} y2={CY + 30}
        stroke="#f59e0b" strokeWidth={1.5} />
      <text x={rightLimbX + 73} y={CY - 38} textAnchor="middle" fill="#f59e0b" fontSize={10} fontWeight={600}>V₂</text>

      {/* ══ Turns ratio bar ══ */}
      <text x={CX} y={outerY - 14} textAnchor="middle" fill="#71717a" fontSize={10} fontWeight={600}>
        a = N₂/N₁ = {a.toFixed(3)}   →   V₂/V₁ = {ratioStr}
      </text>

      {/* ══ LEFT PANEL: Primary EMF waveform ══ */}
      {/* Panel background */}
      <rect x={W1X - 4} y={W1Y - WH - 8} width={WW + 8} height={WH * 2 + 16}
        rx={6} fill="#0d0d10" stroke="#1e1e2e" strokeWidth={1} />
      <text x={W1X + WW / 2} y={W1Y - WH - 15} textAnchor="middle"
        fill="#818cf8" fontSize={9} fontWeight={600}>e₁(t) — Primary EMF</text>
      {/* Axes */}
      <line x1={W1X} y1={W1Y} x2={W1X + WW} y2={W1Y} stroke="#27272a" strokeWidth={0.8} />
      <line x1={W1X} y1={W1Y - WH - 6} x2={W1X} y2={W1Y + WH + 6} stroke="#27272a" strokeWidth={0.8} />
      {/* Waveform */}
      <path d={pri1Path} fill="none" stroke="#818cf8" strokeWidth={2} opacity={0.9} />
      {/* Cursor */}
      <line x1={cursorX1} y1={W1Y - WH - 4} x2={cursorX1} y2={W1Y + WH + 4}
        stroke="#6366f1" strokeWidth={1} strokeDasharray="3 2" opacity={0.7} />
      <circle cx={cursorX1} cy={cursorY1} r={3.5} fill="#6366f1" stroke="#c4b5fd" strokeWidth={1.2} />
      {/* E1 label */}
      <text x={W1X + WW - 2} y={W1Y - WH + 4} textAnchor="end"
        fill="#52525b" fontSize={8}>{E1rms.toFixed(0)}V rms</text>
      <text x={W1X + 2} y={W1Y + WH + 14} fill="#3f3f46" fontSize={8}>0</text>
      <text x={W1X + WW} y={W1Y + WH + 14} textAnchor="end" fill="#3f3f46" fontSize={8}>T</text>

      {/* ══ RIGHT PANEL: Secondary EMF waveform ══ */}
      <rect x={W2X - 4} y={W2Y - WH2 - 8} width={WW + 8} height={WH2 * 2 + 16}
        rx={6} fill="#0d0d10" stroke="#1e1e2e" strokeWidth={1} />
      <text x={W2X + WW / 2} y={W2Y - WH2 - 15} textAnchor="middle"
        fill="#f59e0b" fontSize={9} fontWeight={600}>e₂(t) — Secondary EMF</text>
      <line x1={W2X} y1={W2Y} x2={W2X + WW} y2={W2Y} stroke="#27272a" strokeWidth={0.8} />
      <line x1={W2X} y1={W2Y - WH2 - 6} x2={W2X} y2={W2Y + WH2 + 6} stroke="#27272a" strokeWidth={0.8} />
      {/* Secondary waveform amplitude scales with a */}
      {(() => {
        const scaledH = WH2 * Math.min(a, 1.2);
        const scaledPath = buildCosPath(W2X, W2Y, WW, scaledH, 0);
        const scaledCursorY = W2Y - Math.cos(cursorDeg * Math.PI / 180) * scaledH;
        return (
          <>
            <path d={scaledPath} fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.9} />
            <line x1={cursorX2} y1={W2Y - WH2 - 4} x2={cursorX2} y2={W2Y + WH2 + 4}
              stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 2" opacity={0.7} />
            <circle cx={cursorX2} cy={scaledCursorY} r={3.5} fill="#f59e0b" stroke="#fde68a" strokeWidth={1.2} />
            <text x={W2X + WW - 2} y={W2Y - WH2 + 4} textAnchor="end"
              fill="#52525b" fontSize={8}>{E2rms.toFixed(0)}V rms</text>
          </>
        );
      })()}
      <text x={W2X + 2} y={W2Y + WH2 + 14} fill="#3f3f46" fontSize={8}>0</text>
      <text x={W2X + WW} y={W2Y + WH2 + 14} textAnchor="end" fill="#3f3f46" fontSize={8}>T</text>

      {/* ══ FLUX waveform at bottom of core ══ */}
      <text x={CX} y={CY + 163} textAnchor="middle" fill="#52525b" fontSize={8} fontWeight={600}>
        Φ(t) = Φmax·sin(2πft)
      </text>
      <line x1={CX - 90} y1={CY + 175} x2={CX + 90} y2={CY + 175} stroke="#27272a" strokeWidth={0.8} />
      <path d={fluxPath} fill="none" stroke="#a78bfa" strokeWidth={1.8} opacity={0.7} />
      <circle cx={fluxCursorX} cy={fluxCursorY} r={3} fill="#a78bfa" opacity={0.9} />
      {/* Flux value label */}
      <text x={CX + 95} y={CY + 178} fill="#a78bfa" fontSize={8} fontWeight={600}>
        {(fluxNorm * Phimax * 1000).toFixed(2)} mWb
      </text>

      {/* ══ DIVIDERS ══ */}
      <line x1={220} y1={20} x2={220} y2={300} stroke="#1e1e2e" strokeWidth={1} />
      <line x1={740} y1={20} x2={740} y2={300} stroke="#1e1e2e" strokeWidth={1} />

      {/* ══ Phase-in-sync annotation ══ */}
      <text x={CX} y={295} textAnchor="middle" fill="#3f3f46" fontSize={9}>
        Both EMFs in phase (ideal transformer — zero leakage flux)   |   f = {trx.freq} Hz
      </text>
    </svg>
  );
}

// ── Theory Tab ───────────────────────────────────────────────────────────────
function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Transformer — Working Principle</h2>
      <p style={S.p}>
        A transformer is a static electromagnetic device that transfers electrical energy between
        two (or more) circuits through <strong style={{ color: '#e4e4e7' }}>mutual induction</strong>.
        It has no moving parts and operates on Faraday's law of electromagnetic induction. An
        alternating current in the primary winding sets up a time-varying magnetic flux in the
        iron core; this flux links the secondary winding and induces an EMF proportional to
        the number of secondary turns.
      </p>

      <h3 style={S.h3}>Faraday's Law and Lenz's Law</h3>
      <p style={S.p}>
        Faraday's law states that the EMF induced in any closed loop equals the negative rate of
        change of the magnetic flux linking that loop:
      </p>
      <div style={S.eq}>e = −N × dΦ/dt</div>
      <p style={S.p}>
        The negative sign is Lenz's law: the induced EMF opposes the change in flux that caused it.
        In a transformer's primary, the applied voltage V₁ forces a current that maintains the core
        flux against this opposition. In the secondary, the induced EMF e₂ acts as a source that
        can drive load current.
      </p>
      <p style={S.p}>
        For a sinusoidal flux Φ(t) = Φmax × sin(2πft), differentiation gives:
      </p>
      <div style={S.eq}>e(t) = −N × dΦ/dt = −N × 2πf × Φmax × cos(2πft) = Emax × cos(2πft)</div>
      <p style={S.p}>
        The EMF <em>leads</em> the flux by 90° (cosine vs. sine), a key phasor relationship.
      </p>

      <h3 style={S.h3}>EMF Equation Derivation — The 4.44 Factor</h3>
      <p style={S.p}>
        The peak (maximum) value of the induced EMF is:
      </p>
      <div style={S.eq}>Emax = N × 2πf × Φmax = N × ω × Φmax</div>
      <p style={S.p}>
        Converting to RMS (for a pure sinusoid, E_rms = Emax / √2):
      </p>
      <div style={S.eq}>E_rms = (N × 2πf × Φmax) / √2 = N × f × Φmax × (2π/√2) = N × f × Φmax × 4.443</div>
      <p style={S.p}>
        Rounded to the universally used form:
      </p>
      <div style={S.eq}>E = 4.44 × f × N × Φmax    (RMS EMF in volts)</div>
      <p style={S.p}>
        This is the fundamental EMF equation of a transformer, directly derived from Faraday's
        law. The constant 4.44 = 2π/√2 ≈ 4.4429. Given the primary voltage and frequency, the
        required peak flux is:
      </p>
      <div style={S.eq}>Φmax = E₁ / (4.44 × f × N₁)    (Wb)</div>

      <h3 style={S.h3}>Turns Ratio — Voltage Transformation</h3>
      <p style={S.p}>
        Since both windings link the same core flux Φ, the EMF equations for primary and secondary are:
      </p>
      <div style={S.eq}>E₁ = 4.44 × f × N₁ × Φmax    and    E₂ = 4.44 × f × N₂ × Φmax</div>
      <p style={S.p}>Dividing:</p>
      <div style={S.eq}>E₂/E₁ = N₂/N₁ = a    (turns ratio, voltage ratio)</div>
      <p style={S.p}>
        For an ideal transformer (zero winding resistance, zero leakage flux, no core losses),
        V₁ = E₁ and V₂ = E₂, so:
      </p>
      <div style={S.eq}>V₂ = V₁ × (N₂/N₁)</div>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#818cf8' }}>Step-up transformer</strong>: N₂ &gt; N₁ → V₂ &gt; V₁ (used in power transmission to reduce I²R losses)</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>Step-down transformer</strong>: N₂ &lt; N₁ → V₂ &lt; V₁ (used in distribution to consumer voltages)</li>
        <li style={S.li}><strong style={{ color: '#71717a' }}>Isolation transformer</strong>: N₂ = N₁ → V₂ = V₁ (electrical isolation, safety)</li>
      </ul>

      <h3 style={S.h3}>MMF Balance — Current Transformation</h3>
      <p style={S.p}>
        For an ideal transformer, the net magnetomotive force (MMF) must equal zero (the iron
        core needs negligible MMF at zero losses). Therefore the primary and secondary MMFs
        must balance:
      </p>
      <div style={S.eq}>N₁ × I₁ = N₂ × I₂    (MMF balance, ideal transformer)</div>
      <p style={S.p}>Rearranging for the current ratio:</p>
      <div style={S.eq}>I₂/I₁ = N₁/N₂ = 1/a</div>
      <p style={S.p}>
        Current is transformed <em>inversely</em> to voltage. A step-up in voltage gives a
        step-down in current — exactly what is needed for efficient long-distance power transmission.
      </p>

      <h3 style={S.h3}>Power Conservation in an Ideal Transformer</h3>
      <p style={S.p}>
        Multiplying the voltage and current ratios:
      </p>
      <div style={S.eq}>V₁ × I₁ = V₂ × I₂ = S    (apparent power, VA)</div>
      <p style={S.p}>
        An ideal transformer conserves apparent power — it simply transforms voltage and current
        levels without loss. Real transformers have copper losses (I²R in windings), iron/core
        losses (hysteresis + eddy currents), and leakage flux losses, giving efficiencies of
        98–99.5% for large power transformers.
      </p>

      <h3 style={S.h3}>Phasor Diagram (Ideal Transformer, No Load)</h3>
      <p style={S.p}>
        At no-load the phasor relationships are:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#a78bfa' }}>Φ</strong> — Core flux (reference phasor)</li>
        <li style={S.li}><strong style={{ color: '#818cf8' }}>E₁</strong> — Primary induced EMF, <em>lags</em> V₁ by 180°, leads Φ by 90°</li>
        <li style={S.li}><strong style={{ color: '#f59e0b' }}>E₂</strong> — Secondary induced EMF, in phase with E₁ (same flux linkage)</li>
        <li style={S.li}><strong style={{ color: '#71717a' }}>I₀</strong> — Small no-load magnetising current, in phase with Φ (neglected in ideal model)</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>AP Transco Distribution Network Context</span>
        <p style={S.ctxP}>
          Distribution transformers in AP Transco's 11 kV / 415 V network use turns ratios of
          approximately 26.5:1 (11,000 V primary, 415 V secondary). The EMF equation gives
          Φmax = 11,000 / (4.44 × 50 × N₁). For a typical 100 kVA, 11kV/415V distribution
          transformer with N₁ ≈ 2000 turns, Φmax ≈ 24.8 mWb. These transformers achieve
          efficiencies of 98–99% and operate continuously at street-level substations serving
          agricultural pump sets, rural feeders, and domestic loads across Andhra Pradesh's
          grid (total installed transformer capacity &gt; 50,000 MVA as of 2024).
        </p>
      </div>

      <h2 style={S.h2}>Summary Table</h2>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Quantity</th>
            <th style={S.th}>Formula</th>
            <th style={S.th}>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={S.td}>EMF (RMS)</td><td style={S.td}>E = 4.44 f N Φmax</td><td style={S.td}>Faraday's law for sinusoidal flux</td></tr>
          <tr><td style={S.td}>Peak flux</td><td style={S.td}>Φmax = E₁ / (4.44 f N₁)</td><td style={S.td}>In Weber (Wb)</td></tr>
          <tr><td style={S.td}>Voltage ratio</td><td style={S.td}>V₂/V₁ = N₂/N₁ = a</td><td style={S.td}>Ideal transformer</td></tr>
          <tr><td style={S.td}>Current ratio</td><td style={S.td}>I₂/I₁ = N₁/N₂ = 1/a</td><td style={S.td}>From MMF balance</td></tr>
          <tr><td style={S.td}>Power</td><td style={S.td}>V₁I₁ = V₂I₂</td><td style={S.td}>Conservation (ideal)</td></tr>
          <tr><td style={S.td}>4.44 factor</td><td style={S.td}>2π/√2 ≈ 4.4429</td><td style={S.td}>For sinusoidal waveform</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Chapman, S.J. — <em>Electric Machinery Fundamentals</em>, 5th Edition, McGraw-Hill</li>
        <li style={S.li}>Theraja, B.L. &amp; Theraja, A.K. — <em>A Textbook of Electrical Technology Vol. II</em>, S. Chand</li>
        <li style={S.li}>Fitzgerald, Kingsley, Umans — <em>Electric Machinery</em>, 7th Edition, McGraw-Hill</li>
        <li style={S.li}>Nagrath, I.J. &amp; Kothari, D.P. — <em>Electric Machines</em>, 4th Edition, Tata McGraw-Hill</li>
      </ul>
    </div>
  );
}

// ── Root component ───────────────────────────────────────────────────────────
export default function TransformerWorkingPrinciple() {
  const [tab, setTab] = useState('simulate');
  const [ratio, setRatio] = useState(2);     // N1/N2
  const [V1, setV1] = useState(230);
  const [freq, setFreq] = useState(50);
  const [phase, setPhase] = useState(0);

  const trx = useMemo(() => computeTransformer(V1, ratio, freq), [V1, ratio, freq]);
  const trxRef = useRef(trx);
  trxRef.current = trx;
  const freqRef = useRef(freq);
  freqRef.current = freq;

  useEffect(() => {
    let raf;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      // Phase advances at 1 cycle/second so animation is smooth and visible
      setPhase(p => (p + dt * 360) % 360);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const { V2, a, Phimax, E1rms, E2rms } = trx;

  const v2Col = a > 1 ? '#22c55e' : a < 1 ? '#f59e0b' : '#a1a1aa';

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <Diagram trx={trx} phase={phase} />
          </div>

          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>V₁ (Primary)</span>
              <span style={{ ...S.rv, color: '#818cf8' }}>{V1} V</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>V₂ (Secondary)</span>
              <span style={{ ...S.rv, color: v2Col }}>{V2.toFixed(1)} V</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Turns Ratio a=N₂/N₁</span>
              <span style={{ ...S.rv, color: '#c4b5fd' }}>{a.toFixed(3)}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Φmax</span>
              <span style={{ ...S.rv, color: '#a78bfa' }}>{(Phimax * 1000).toFixed(2)} mWb</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>E₁ rms</span>
              <span style={{ ...S.rv, color: '#818cf8' }}>{E1rms.toFixed(1)} V</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>E₂ rms</span>
              <span style={{ ...S.rv, color: '#f59e0b' }}>{E2rms.toFixed(1)} V</span>
            </div>
          </div>

          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Turns Ratio N₁/N₂</span>
              <input
                type="range" min={0.5} max={5} step={0.1}
                value={ratio}
                onChange={e => setRatio(+e.target.value)}
                style={S.slider}
              />
              <span style={S.val}>{ratio.toFixed(1)}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Primary Voltage V₁</span>
              <input
                type="range" min={100} max={500} step={5}
                value={V1}
                onChange={e => setV1(+e.target.value)}
                style={S.slider}
              />
              <span style={S.val}>{V1} V</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Frequency</span>
              <input
                type="range" min={25} max={100} step={1}
                value={freq}
                onChange={e => setFreq(+e.target.value)}
                style={S.slider}
              />
              <span style={S.val}>{freq} Hz</span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
