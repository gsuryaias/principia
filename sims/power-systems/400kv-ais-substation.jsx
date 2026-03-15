import React, { useState, useMemo, useCallback } from 'react';

// ── Styles ──────────────────────────────────────────────────────────────────────
const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '8px 12px 0', overflowX: 'auto', overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: 500 },
  controls: { padding: '10px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 8 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 110, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 40, textAlign: 'right' },
  results: { display: 'flex', gap: 24, padding: '10px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 10, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 15, fontWeight: 700, fontFamily: 'monospace' },
  btn: (active, danger) => ({ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${danger ? '#ef4444' : active ? '#6366f1' : '#27272a'}`, background: danger ? 'rgba(239,68,68,0.1)' : active ? 'rgba(99,102,241,0.15)' : 'transparent', color: danger ? '#fca5a5' : active ? '#a5b4fc' : '#a1a1aa', transition: 'all 0.15s' }),
  popup: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' },
  popCard: { background: '#18181b', border: '1px solid #27272a', borderRadius: 16, padding: '24px 28px', maxWidth: 440, width: '90%' },
  popTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#f4f4f5' },
  popRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1f1f23', fontSize: 14 },
  popL: { color: '#71717a' },
  popV: { color: '#e4e4e7', fontFamily: 'monospace', fontWeight: 600, maxWidth: '60%', textAlign: 'right' },
  popClose: { marginTop: 16, padding: '8px 20px', borderRadius: 8, border: '1px solid #3f3f46', background: 'transparent', color: '#a1a1aa', fontSize: 13, cursor: 'pointer' },
  interlockMsg: { padding: '8px 24px', background: 'rgba(245,158,11,0.08)', borderTop: '1px solid rgba(245,158,11,0.2)', fontSize: 13, color: '#fcd34d', display: 'flex', alignItems: 'center', gap: 8 },
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

// ── Equipment type definitions ──────────────────────────────────────────────────
// Realistic ratings per PGCIL / AP Transco 400 kV standard
const EQ = {
  GANTRY: { name: 'Line Entry Gantry', color: '#78716c', rating: 'Lattice steel, 24 m height, quad ACSR Moose conductors', role: 'The steel structure at the substation boundary where incoming 400 kV transmission line conductors are terminated via tension clamps and strain insulators. It provides the mechanical termination point and sets the conductor height for safe ground clearance.', importance: 'First and last physical point of the substation. Its height and spacing must maintain 3.5 m minimum ground clearance and 4.2 m phase-to-phase clearance per CEA standards. Structural failure can bring down the entire bay.' },
  WT: { name: 'Wave Trap (Line Trap)', color: '#78716c', rating: '400 kV, 2000 A continuous, blocking range 80–500 kHz', role: 'A parallel LC circuit inserted in series with the line conductor that blocks high-frequency carrier signals (used for PLCC — Power Line Carrier Communication) from entering the substation bus, while freely passing 50 Hz power frequency current.', importance: 'Essential for reliable tele-protection signalling between substations. The PLCC channel carries inter-trip signals and distance relay communication. Without the wave trap, carrier signals leak into the bus and remote-end protection coordination fails.' },
  LA: { name: 'Lightning / Surge Arrester', color: '#f59e0b', rating: '336 kV rated (Ur), 10 kA discharge class 3, ZnO metal oxide varistor', role: 'A non-linear resistor (metal oxide varistor) connected phase-to-ground that clamps transient overvoltages — from lightning strikes or switching surges — to levels safe for equipment insulation. Conducts zero current at normal voltage, but provides a low-impedance path to ground during surges.', importance: 'First line of defense against insulation breakdown. A single lightning strike (peak > 2000 kV) on an unprotected 400 kV bus can destroy transformers costing ₹40–80 crores. Surge arresters must be placed as close as possible to the protected equipment.' },
  CVT: { name: 'Capacitive Voltage Transformer (CVT)', color: '#ec4899', rating: '400/√3 kV : 110/√3 V, burden 200 VA, accuracy class 0.2 (metering) & 3P (protection)', role: 'A capacitor divider stack followed by an electromagnetic transformer that steps down 400 kV line voltage to 110 V for metering instruments and protection relays. At 400 kV, CVTs are used instead of conventional PTs because direct electromagnetic PTs at this voltage would be prohibitively large and expensive. Also provides the coupling point for PLCC carrier signal injection/extraction.', importance: 'Every protection relay needs accurate voltage measurement. An inaccurate CVT can cause distance relay Zone 1 under-reach (failing to trip for line faults) or over-reach (tripping for external faults). The PLCC coupling function makes it dual-purpose.' },
  ISO_L: { name: 'Line Disconnector (Isolator)', color: '#a78bfa', rating: '400 kV, 2000 A continuous, motorized horizontal centre-break with earth switch', switchable: true, role: 'A no-load switching device that provides visible electrical isolation between the outgoing line and the circuit breaker bay. Operated only when the circuit breaker is open (zero current). The integral earth switch allows the isolated line to be grounded for maintenance.', importance: 'Guarantees a visible air gap for maintenance crew safety — the crew can physically verify that the line is isolated before climbing the tower. Operating an isolator under load is forbidden — it has no arc-quenching capability and will cause a catastrophic arc flashover across the 3.5 m gap.' },
  CT: { name: 'Current Transformer (CT)', color: '#22d3ee', rating: '2000–1600/1 A, multi-core: 5P20 30VA (protection), 0.2s (metering), PS class (differential)', role: 'An instrument transformer that steps down line current (up to 2000 A) to a standardized 1 A secondary for protection relays and energy metering. Contains multiple independent magnetic cores — each dedicated to a specific function: metering (high accuracy at rated current), protection (accuracy maintained up to 20× rated current during faults), and special protection (PS class for differential relays).', importance: 'Feeds ALL current-based protection systems — overcurrent, differential, distance, and breaker failure. CT saturation during heavy faults can blind relays, causing delayed tripping or mis-operation. Correct CT knee-point voltage and burden calculations are critical for reliable protection.' },
  CB: { name: 'SF₆ Circuit Breaker', color: '#22c55e', rating: '420 kV, 40 kA breaking capacity, 3-cycle (60 ms) interruption, spring/hydraulic operating mechanism', switchable: true, role: 'The primary switching device capable of making and breaking both normal load currents and short-circuit fault currents up to 40,000 A. Uses sulphur hexafluoride (SF₆) gas at 6–7 bar pressure as the arc-quenching and insulating medium. The interrupter uses a puffer or self-blast mechanism to direct a high-pressure gas blast across the arc during opening.', importance: 'The ONLY device in the bay that can safely interrupt fault currents. If the breaker fails to open when commanded by protection relays, the fault persists and the breaker failure protection (50BF) must trip ALL adjacent breakers — causing a much wider outage. CB failure is the single most critical failure mode in a substation.' },
  ISO_B1: { name: 'Bus-1 Disconnector (Isolator)', color: '#a78bfa', rating: '400 kV, 2000 A, motorized pantograph/horizontal type with integral earth switch', switchable: true, role: 'Connects or disconnects the bay from Main Bus 1. In a double-bus arrangement, each bay has two bus isolators allowing the feeder to be connected to either bus. The integral earth switch permits safe bus earthing during maintenance.', importance: 'Enables bus selection and bus transfer operations. During Bus 1 maintenance, all feeders are sequentially transferred to Bus 2 using these isolators — without any supply interruption. The earth switch provides a ground path for safely working on the de-energized bus section.' },
  ISO_B2: { name: 'Bus-2 Disconnector (Isolator)', color: '#a78bfa', rating: '400 kV, 2000 A, motorized pantograph/horizontal type with integral earth switch', switchable: true, role: 'Connects or disconnects the bay from Main Bus 2. Mirror of the Bus-1 disconnector on the alternate bus. Together with the bus coupler, provides full flexibility for bus maintenance and fault management.', importance: 'Provides bus redundancy. If Bus 1 develops a fault (detected by bus differential protection 87B), all feeders are automatically or manually transferred to Bus 2 to maintain supply continuity. Without Bus 2 isolators, any bus fault would require a complete substation shutdown.' },
  ICT: { name: 'Inter-Connecting Transformer (ICT)', color: '#f59e0b', rating: '400/220 kV, 315 MVA, 3-phase, YNyn0(d11), ONAN/ONAF cooling, impedance 12.5%', role: 'The power transformer that steps down 400 kV (extra-high voltage) to 220 kV (high voltage) for the sub-transmission network. These are the largest, heaviest, and most expensive individual equipment in the substation — typically weighing 200+ tonnes including oil. The YNyn0(d11) vector group provides a neutral point for each winding and a tertiary delta winding for zero-sequence current circulation and station auxiliary supply.', importance: 'The power delivery bottleneck of the substation. If both ICTs are lost (e.g., simultaneous faults or maintenance overlap), the entire 220 kV network downstream — serving hundreds of MW of load — loses supply completely. Standard practice mandates 2 ICTs with N-1 redundancy, each rated for 80% of peak load.' },
  SR: { name: 'Bus Shunt Reactor', color: '#06b6d4', rating: '80 MVAR, 400 kV, oil-immersed, naturally cooled (ONAN)', role: 'An inductor connected bus-to-ground that absorbs excess capacitive reactive power from long 400 kV transmission lines. During low-load periods (night-time, holidays), the capacitive charging current of long EHV lines dominates, causing voltage to rise above rated value (Ferranti effect). The shunt reactor compensates this.', importance: 'Without shunt reactors, 400 kV lines can experience sustained voltage rise to 420–440 kV during light load, stressing transformer insulation and potentially causing flashovers. PGCIL mandates switchable shunt reactors on all 400 kV lines longer than 200 km.' },
  BPT: { name: 'Bus Potential Transformer', color: '#ec4899', rating: '400/√3 kV : 110/√3 V, electromagnetic or CVT, class 0.2 metering', role: 'A dedicated voltage transformer permanently connected to the bus bar for continuous bus voltage measurement. Feeds the bus voltage to check-synchronizing relays, bus differential protection, and bus voltage metering.', importance: 'Provides the bus voltage reference for check-sync relays — which verify voltage magnitude and phase angle match before closing a breaker onto the bus. An incorrect sync-check (due to BPT failure) can allow out-of-phase closing, producing massive current surges that damage generators and transformers.' },
};

// ── Bay definitions ─────────────────────────────────────────────────────────────
// Standard 400 kV AIS bay: complete end-to-end equipment sequence
// Line bay (from line side to bus): GANTRY → WT → LA → CVT → ISO_L → CT → CB → ISO_B1/ISO_B2 → BUS
// Transformer bay (from bus to xfmr): BUS → ISO_B1/ISO_B2 → CB → CT → ICT
// Bus coupler: BUS1 → ISO_B1 → CT → CB → CT → ISO_B2 → BUS2

const BAYS = [
  { id: 'L1', type: 'line', name: 'Vijayawada 400 kV',
    lineLength: 285, conductor: 'Quad ACSR Moose',
    baseMW: 285, baseMVAR: 95, pf: 0.95,
    equip: ['GANTRY','WT','LA','CVT','ISO_L','CT','CB','ISO_B1','ISO_B2'] },
  { id: 'L2', type: 'line', name: 'Kurnool 400 kV',
    lineLength: 190, conductor: 'Quad ACSR Moose',
    baseMW: 210, baseMVAR: 70, pf: 0.95,
    equip: ['GANTRY','WT','LA','CVT','ISO_L','CT','CB','ISO_B1','ISO_B2'] },
  { id: 'L3', type: 'line', name: 'Hyderabad 400 kV',
    lineLength: 250, conductor: 'Quad ACSR Moose',
    baseMW: 340, baseMVAR: 115, pf: 0.95,
    equip: ['GANTRY','WT','LA','CVT','ISO_L','CT','CB','ISO_B1','ISO_B2'] },
  { id: 'BC', type: 'coupler', name: 'Bus Coupler',
    baseMW: 0, baseMVAR: 0, pf: 1,
    equip: ['ISO_B1','CT','CB','CT_2','ISO_B2'] },
  { id: 'T1', type: 'transformer', name: '400/220 kV ICT-1',
    rating: '315 MVA',
    baseMW: 252, baseMVAR: 84, pf: 0.95,
    equip: ['ISO_B1','ISO_B2','CB','CT','LA','ICT'] },
  { id: 'T2', type: 'transformer', name: '400/220 kV ICT-2',
    rating: '315 MVA',
    baseMW: 252, baseMVAR: 84, pf: 0.95,
    equip: ['ISO_B1','ISO_B2','CB','CT','LA','ICT'] },
];

// ViewBox sized to fit content tightly
const VB_W = 1400, VB_H = 620;
const BAY_X = { L1: 120, L2: 320, L3: 520, BC: 720, T1: 940, T2: 1160 };
const BUS1_Y = 58, BUS2_Y = 100;

// ── Equipment spacing within a bay ──────────────────────────────────────────────
// For line bays: layout from top (line side) down to buses
// Top = line entry, bottom = bus connection
function getEquipY(bay) {
  const eqY = {};
  if (bay.type === 'coupler') {
    eqY.ISO_B1 = BUS1_Y + 20;
    eqY.CT = BUS1_Y + 50;
    eqY.CB = BUS1_Y + 76;
    eqY.CT_2 = BUS1_Y + 102;
    eqY.ISO_B2 = BUS2_Y + 64;
    return eqY;
  }

  if (bay.type === 'line') {
    eqY.ISO_B1 = BUS1_Y + 20;
    eqY.ISO_B2 = BUS2_Y + 20;
    let y = BUS2_Y + 55;
    eqY.CB = y; y += 36;
    eqY.CT = y; y += 30;
    eqY.ISO_L = y; y += 30;
    eqY.CVT = y; y += 32;
    eqY.LA = y; y += 32;
    eqY.WT = y; y += 32;
    eqY.GANTRY = y;
    return eqY;
  }

  if (bay.type === 'transformer') {
    eqY.ISO_B1 = BUS1_Y + 20;
    eqY.ISO_B2 = BUS2_Y + 20;
    let y = BUS2_Y + 55;
    eqY.CB = y; y += 36;
    eqY.CT = y; y += 30;
    eqY.LA = y; y += 34;
    eqY.ICT = y;
    return eqY;
  }
  return eqY;
}

// ── Initial switch state ────────────────────────────────────────────────────────
function makeInitial() {
  const st = {};
  BAYS.forEach(b => {
    b.equip.forEach(e => {
      const eqDef = EQ[e] || EQ[e.replace('_2', '')];
      if (eqDef?.switchable) {
        const k = `${b.id}_${e}`;
        if (e === 'ISO_B2' && b.type !== 'coupler') st[k] = false;
        else st[k] = true;
      }
    });
  });
  return st;
}

// ── Preset scenarios ────────────────────────────────────────────────────────────
const SCENARIOS = {
  normal: { label: 'Normal Operation', desc: 'All feeders on Bus 1, bus coupler closed', make: () => makeInitial() },
  outage: { label: 'Line Outage (L2)', desc: 'Kurnool line tripped — CB and isolators open', make: () => {
    const s = makeInitial();
    s.L2_CB = false; s.L2_ISO_B1 = false; s.L2_ISO_L = false;
    return s;
  }},
  transfer: { label: 'Bus Transfer (L1→B2)', desc: 'Vijayawada transferred to Bus 2 via coupler', make: () => {
    const s = makeInitial();
    s.L1_ISO_B1 = false; s.L1_ISO_B2 = true;
    return s;
  }},
  fault: { label: 'Xfmr Fault (T1)', desc: 'ICT-1 differential protection operated — T1 tripped', make: () => {
    const s = makeInitial();
    s.T1_CB = false; s.T1_ISO_B1 = false;
    return s;
  }},
};

// ── Energization computation ────────────────────────────────────────────────────
function computeEnergization(sw) {
  const busPath = {};

  BAYS.forEach(b => {
    if (b.type === 'coupler') return;
    const cbClosed = sw[`${b.id}_CB`] !== false;
    const ilClosed = b.equip.includes('ISO_L') ? sw[`${b.id}_ISO_L`] !== false : true;
    const sourceEnergized = b.type === 'line' || b.type === 'transformer';

    if (sourceEnergized && ilClosed && cbClosed) {
      if (sw[`${b.id}_ISO_B1`] !== false) busPath[b.id] = 'B1';
      if (sw[`${b.id}_ISO_B2`] === true) busPath[b.id] = busPath[b.id] ? 'BOTH' : 'B2';
    }
  });

  const bcClosed = (sw.BC_CB !== false) && (sw.BC_ISO_B1 !== false) && (sw.BC_ISO_B2 !== false);
  let bus1 = Object.values(busPath).some(v => v === 'B1' || v === 'BOTH');
  let bus2 = Object.values(busPath).some(v => v === 'B2' || v === 'BOTH');
  if (bcClosed && (bus1 || bus2)) { bus1 = true; bus2 = true; }

  const bays = {};
  BAYS.forEach(b => {
    if (b.type === 'coupler') { bays[b.id] = bcClosed && (bus1 || bus2); return; }
    const cbClosed = sw[`${b.id}_CB`] !== false;
    const ilClosed = b.equip.includes('ISO_L') ? sw[`${b.id}_ISO_L`] !== false : true;
    const onB1 = sw[`${b.id}_ISO_B1`] !== false && bus1;
    const onB2 = sw[`${b.id}_ISO_B2`] === true && bus2;
    bays[b.id] = cbClosed && ilClosed && (onB1 || onB2);
  });

  return { bus1, bus2, coupler: bcClosed, bays };
}

// Realistic power flow calculations
function computeReadings(sw, ener, loadPct) {
  const sc = loadPct / 100;
  let totalMW = 0, totalMVAR = 0;

  const feeders = BAYS.filter(b => b.type !== 'coupler').map(b => {
    const live = ener.bays[b.id];
    const mw = live ? b.baseMW * sc : 0;
    const mvar = live ? b.baseMVAR * sc : 0;
    const mva = Math.sqrt(mw * mw + mvar * mvar);
    // I = S / (√3 × V) — current in amps
    const iA = mva > 0 ? (mva * 1e6) / (Math.sqrt(3) * 400e3) : 0;
    totalMW += mw;
    totalMVAR += mvar;
    return { ...b, mw, mvar, mva, iA };
  });

  // Bus voltage varies realistically: 400 kV ± loading effect
  // At full load (~850 MW), voltage drops about 4 kV
  const totalMVA = Math.sqrt(totalMW * totalMW + totalMVAR * totalMVAR);
  const vDrop = totalMVA * 0.004;
  const busV = (live) => live ? (400 - vDrop).toFixed(1) : '0.0';

  return { feeders, totalMW, totalMVAR, totalMVA, bus1V: busV(ener.bus1), bus2V: busV(ener.bus2) };
}

// ── Interlocking ────────────────────────────────────────────────────────────────
function checkInterlock(bayId, equipType, sw) {
  const cbKey = `${bayId}_CB`;
  if ((equipType.startsWith('ISO_B') || equipType === 'ISO_L') && sw[cbKey] !== false) {
    return 'INTERLOCK: Cannot operate isolator while associated circuit breaker is CLOSED. Open the CB first.';
  }
  return null;
}

// ── SVG Symbol Components ───────────────────────────────────────────────────────
// All symbols are larger and more visible in this version

function GantrySym({ live, x, y, onInfo }) {
  const col = live ? '#a8a29e' : '#3f3f46';
  return (
    <g transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }} onClick={onInfo}>
      {/* Tower structure */}
      <line x1={-12} y1={-18} x2={-6} y2={18} stroke={col} strokeWidth={2} />
      <line x1={12} y1={-18} x2={6} y2={18} stroke={col} strokeWidth={2} />
      <line x1={-12} y1={-18} x2={12} y2={-18} stroke={col} strokeWidth={2.5} />
      <line x1={-9} y1={0} x2={9} y2={0} stroke={col} strokeWidth={1.2} />
      <line x1={-7} y1={10} x2={7} y2={10} stroke={col} strokeWidth={1.2} />
      {/* Conductors */}
      <circle cx={-10} cy={-22} r={2.5} fill={live ? '#60a5fa' : '#52525b'} />
      <circle cx={0} cy={-22} r={2.5} fill={live ? '#60a5fa' : '#52525b'} />
      <circle cx={10} cy={-22} r={2.5} fill={live ? '#60a5fa' : '#52525b'} />
      <text x={0} y={28} textAnchor="middle" fontSize={8} fill="#52525b" fontWeight={500}>GANTRY</text>
    </g>
  );
}

function WTSym({ live, x, y, onInfo }) {
  const col = live ? '#a8a29e' : '#3f3f46';
  return (
    <g transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }} onClick={onInfo}>
      <rect x={-16} y={-14} width={32} height={28} fill="transparent" />
      <path d="M0,-12 Q7,-8 0,-4 Q-7,0 0,4 Q7,8 0,12" fill="none" stroke={col} strokeWidth={2.2} />
      <line x1={-7} y1={-12} x2={7} y2={-12} stroke={col} strokeWidth={2} />
      <line x1={-7} y1={12} x2={7} y2={12} stroke={col} strokeWidth={2} />
      <text x={18} y={4} fontSize={7.5} fill="#52525b">WT</text>
    </g>
  );
}

function LASym({ live, x, y, onInfo }) {
  const col = live ? '#f59e0b' : '#3f3f46';
  return (
    <g transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }} onClick={onInfo}>
      <rect x={-16} y={-14} width={32} height={32} fill="transparent" />
      <polyline points="0,-12 -5,-4 5,-4 -5,4 5,4 0,12" fill="none" stroke={col} strokeWidth={2.2} />
      <line x1={0} y1={12} x2={0} y2={17} stroke={col} strokeWidth={2} />
      <line x1={-6} y1={17} x2={6} y2={17} stroke={col} strokeWidth={2} />
      <line x1={-4} y1={20} x2={4} y2={20} stroke={col} strokeWidth={1.5} />
      <line x1={-2} y1={22} x2={2} y2={22} stroke={col} strokeWidth={1} />
      <text x={18} y={4} fontSize={7.5} fill="#52525b">LA</text>
    </g>
  );
}

function CVTSym({ live, x, y, onInfo }) {
  const col = live ? '#ec4899' : '#3f3f46';
  return (
    <g transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }} onClick={onInfo}>
      <rect x={-16} y={-14} width={32} height={34} fill="transparent" />
      {/* Capacitor divider */}
      <line x1={-6} y1={-10} x2={6} y2={-10} stroke={col} strokeWidth={2} />
      <line x1={-6} y1={-6} x2={6} y2={-6} stroke={col} strokeWidth={2} />
      <line x1={0} y1={-6} x2={0} y2={0} stroke={col} strokeWidth={1.5} />
      <line x1={-6} y1={0} x2={6} y2={0} stroke={col} strokeWidth={2} />
      <line x1={-6} y1={4} x2={6} y2={4} stroke={col} strokeWidth={2} />
      {/* PT circle below */}
      <line x1={0} y1={4} x2={0} y2={8} stroke={col} strokeWidth={1.5} />
      <circle cx={0} cy={14} r={6} fill="none" stroke={col} strokeWidth={1.8} />
      <text x={18} y={4} fontSize={7.5} fill="#52525b">CVT</text>
    </g>
  );
}

function ISOSym({ closed, live, x, y, onClick, onInfo, label }) {
  const col = closed ? (live ? '#a78bfa' : '#52525b') : '#71717a';
  return (
    <g transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }}>
      <rect x={-20} y={-14} width={40} height={28} fill="transparent" onClick={onClick} />
      {closed ? (<>
        <line x1={0} y1={-10} x2={0} y2={10} stroke={col} strokeWidth={2.5} onClick={onClick} />
        <line x1={-7} y1={-10} x2={7} y2={-10} stroke={col} strokeWidth={2.5} onClick={onClick} />
        <line x1={-7} y1={10} x2={7} y2={10} stroke={col} strokeWidth={2.5} onClick={onClick} />
      </>) : (<>
        <line x1={0} y1={10} x2={0} y2={3} stroke={col} strokeWidth={2.5} onClick={onClick} />
        <line x1={0} y1={3} x2={10} y2={-10} stroke={col} strokeWidth={2.5} onClick={onClick} />
        <line x1={-7} y1={10} x2={7} y2={10} stroke={col} strokeWidth={2.5} onClick={onClick} />
        <circle cx={0} cy={-10} r={3} fill="none" stroke={col} strokeWidth={1.5} onClick={onClick} />
      </>)}
      {label && <text x={18} y={4} fontSize={7.5} fill="#52525b" fontWeight={500}>{label}</text>}
    </g>
  );
}

function CTSym({ live, x, y, onInfo }) {
  const col = live ? '#22d3ee' : '#3f3f46';
  return (
    <g transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }} onClick={onInfo}>
      <rect x={-14} y={-14} width={28} height={28} fill="transparent" />
      <circle cx={0} cy={-4} r={8} fill="none" stroke={col} strokeWidth={2} />
      <circle cx={0} cy={4} r={8} fill="none" stroke={col} strokeWidth={2} />
      <text x={18} y={4} fontSize={7.5} fill="#52525b">CT</text>
    </g>
  );
}

function CBSym({ closed, live, x, y, onClick, onInfo }) {
  const col = closed ? (live ? '#22c55e' : '#52525b') : '#ef4444';
  return (
    <g transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }}>
      <rect x={-20} y={-14} width={40} height={28} fill="transparent" onClick={onClick} />
      <rect x={-10} y={-10} width={20} height={20} fill="none" stroke={col} strokeWidth={2.5} rx={2} onClick={onClick} />
      {!closed && <>
        <line x1={-7} y1={-7} x2={7} y2={7} stroke={col} strokeWidth={2.2} onClick={onClick} />
        <line x1={7} y1={-7} x2={-7} y2={7} stroke={col} strokeWidth={2.2} onClick={onClick} />
      </>}
      {/* State indicator */}
      <circle cx={16} cy={-10} r={4} fill={closed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'} />
      <circle cx={16} cy={-10} r={2} fill={closed ? '#22c55e' : '#ef4444'} />
      <text x={-24} y={4} textAnchor="end" fontSize={7.5} fill="#52525b" fontWeight={600}>CB</text>
    </g>
  );
}

function ICTSym({ live, x, y, onInfo }) {
  const col = live ? '#f59e0b' : '#3f3f46';
  const col2 = live ? '#06b6d4' : '#3f3f46';
  return (
    <g transform={`translate(${x},${y})`} style={{ cursor: 'pointer' }} onClick={onInfo}>
      <rect x={-20} y={-20} width={40} height={60} fill="transparent" />
      {/* HV winding */}
      <circle cx={0} cy={-6} r={14} fill="none" stroke={col} strokeWidth={2.5} />
      <text x={0} y={-3} textAnchor="middle" fontSize={9} fill={col} fontWeight={600}>400</text>
      {/* LV winding */}
      <circle cx={0} cy={8} r={14} fill="none" stroke={col2} strokeWidth={2.5} />
      <text x={0} y={12} textAnchor="middle" fontSize={9} fill={col2} fontWeight={600}>220</text>
      {/* Output line */}
      <line x1={0} y1={22} x2={0} y2={36} stroke={col2} strokeWidth={2} />
      <polygon points="0,40 -5,32 5,32" fill={col2} opacity={0.7} />
      <text x={0} y={50} textAnchor="middle" fontSize={8} fill="#52525b" fontWeight={500}>to 220 kV bus</text>
    </g>
  );
}

// ── Bay Column Renderer ─────────────────────────────────────────────────────────
function BayColumn({ bay, sw, ener, onSwitch, onSelect }) {
  const x = BAY_X[bay.id];
  const live = ener.bays[bay.id];
  const wireCol = live ? '#3b82f6' : '#27272a';
  const eqY = getEquipY(bay);

  const doSwitch = (eType) => onSwitch(bay.id, eType, `${bay.id}_${eType}`);
  const doInfo = (eType) => {
    const realType = eType === 'CT_2' ? 'CT' : eType;
    onSelect({ bayId: bay.id, bayName: bay.name, equipType: realType, key: `${bay.id}_${eType}`, closed: sw[`${bay.id}_${eType}`] !== false });
  };

  // === WIRES ===
  const wires = [];

  if (bay.type === 'coupler') {
    // Vertical between buses
    const pts = ['ISO_B1','CT','CB','CT_2','ISO_B2'];
    wires.push(<line key="wb1" x1={x} y1={BUS1_Y} x2={x} y2={eqY.ISO_B1 - 10} stroke={ener.bus1 ? '#3b82f6' : '#27272a'} strokeWidth={2} />);
    let prevBottom = eqY.ISO_B1 + 10;
    for (let i = 1; i < pts.length; i++) {
      const prevKey = `${bay.id}_${pts[i-1]}`;
      const prevEq = EQ[pts[i-1]] || EQ[pts[i-1].replace('_2','')];
      if (prevEq?.switchable && sw[prevKey] === false) break;
      if (pts[i-1] === 'CB' && sw[`${bay.id}_CB`] === false) break;
      wires.push(<line key={`wc${i}`} x1={x} y1={prevBottom} x2={x} y2={eqY[pts[i]] - 10} stroke={wireCol} strokeWidth={2} />);
      prevBottom = eqY[pts[i]] + 10;
    }
    // Last segment to Bus 2
    if (sw[`${bay.id}_ISO_B2`] !== false && sw[`${bay.id}_CB`] !== false && sw[`${bay.id}_ISO_B1`] !== false) {
      wires.push(<line key="wb2" x1={x} y1={eqY.ISO_B2 + 10} x2={x} y2={BUS2_Y} stroke={ener.bus2 ? '#06b6d4' : '#27272a'} strokeWidth={2} />);
    }
  } else {
    // LINE or TRANSFORMER bay

    // Bus stubs
    wires.push(<line key="wb1" x1={x} y1={BUS1_Y} x2={x} y2={eqY.ISO_B1 - 10} stroke={ener.bus1 ? '#3b82f6' : '#27272a'} strokeWidth={2} />);
    wires.push(<line key="wb2s" x1={x} y1={BUS2_Y} x2={x} y2={eqY.ISO_B2 - 10} stroke={ener.bus2 ? '#06b6d4' : '#27272a'} strokeWidth={2} />);

    // Merge point from bus isolators
    const mergeY = eqY.ISO_B2 + 16;
    const b1Closed = sw[`${bay.id}_ISO_B1`] !== false;
    const b2Closed = sw[`${bay.id}_ISO_B2`] === true;

    if (b1Closed) wires.push(<line key="ms1" x1={x} y1={eqY.ISO_B1 + 10} x2={x - 10} y2={mergeY} stroke={wireCol} strokeWidth={2} />);
    if (b2Closed) wires.push(<line key="ms2" x1={x} y1={eqY.ISO_B2 + 10} x2={x + 10} y2={mergeY} stroke={wireCol} strokeWidth={2} />);
    if (b1Closed || b2Closed) {
      wires.push(<line key="mm" x1={x - 10} y1={mergeY} x2={x + 10} y2={mergeY} stroke={wireCol} strokeWidth={2} />);
      wires.push(<line key="mc" x1={x} y1={mergeY} x2={x} y2={eqY.CB - 10} stroke={wireCol} strokeWidth={2} />);
    }

    // From CB downward through all remaining equipment
    if (sw[`${bay.id}_CB`] !== false && (b1Closed || b2Closed)) {
      const rest = bay.equip.filter(e => !e.startsWith('ISO_B') && e !== 'CB');
      let prevY = eqY.CB + 10;
      rest.forEach((e, i) => {
        const ey = eqY[e];
        if (ey !== undefined) {
          const topGap = e === 'ICT' ? 22 : e === 'GANTRY' ? 18 : e === 'CVT' ? 14 : 12;
          const botGap = e === 'ICT' ? 36 : e === 'GANTRY' ? 18 : e === 'CVT' ? 20 : e === 'LA' ? 14 : e === 'CT' ? 12 : 12;
          wires.push(<line key={`wr${i}`} x1={x} y1={prevY} x2={x} y2={ey - topGap} stroke={wireCol} strokeWidth={2} />);
          prevY = ey + botGap;
        }
      });
    }
  }

  // === EQUIPMENT SYMBOLS ===
  const items = bay.equip.map((e, idx) => {
    const ey = eqY[e];
    if (ey === undefined) return null;
    const key = `${bay.id}_${e}`;
    const isClosed = sw[key] !== false;
    const realType = e === 'CT_2' ? 'CT' : e;

    switch (realType) {
      case 'GANTRY': return <GantrySym key={key} live={live} x={x} y={ey} onInfo={() => doInfo(e)} />;
      case 'WT': return <WTSym key={key} live={live} x={x} y={ey} onInfo={() => doInfo(e)} />;
      case 'LA': return <LASym key={key} live={live} x={x} y={ey} onInfo={() => doInfo(e)} />;
      case 'CVT': return <CVTSym key={key} live={live} x={x} y={ey} onInfo={() => doInfo(e)} />;
      case 'ISO_L': return <ISOSym key={key} closed={isClosed} live={live} x={x} y={ey} onClick={() => doSwitch(e)} label="LINE" />;
      case 'ISO_B1': return <ISOSym key={key} closed={isClosed} live={ener.bus1} x={x} y={ey} onClick={() => doSwitch(e)} label="B1" />;
      case 'ISO_B2': return <ISOSym key={key} closed={isClosed} live={ener.bus2} x={x} y={ey} onClick={() => doSwitch(e)} label="B2" />;
      case 'CT': return <CTSym key={key} live={live} x={x} y={ey} onInfo={() => doInfo(e)} />;
      case 'CB': return <CBSym key={key} closed={isClosed} live={live} x={x} y={ey} onClick={() => doSwitch(e)} onInfo={() => doInfo(e)} />;
      case 'ICT': return <ICTSym key={key} live={live} x={x} y={ey} onInfo={() => doInfo(e)} />;
      default: return null;
    }
  });

  // Bay label at bottom
  const allY = Object.values(eqY);
  const maxEqY = Math.max(...allY);
  const labelY = bay.type === 'transformer' ? maxEqY + 60 : bay.type === 'coupler' ? eqY.ISO_B2 + 28 : maxEqY + 36;

  return (
    <g key={bay.id}>
      {wires}
      {items}
      <text x={x} y={labelY} textAnchor="middle" fontSize={10} fill="#a1a1aa" fontWeight={700}>{bay.id}</text>
      <text x={x} y={labelY + 14} textAnchor="middle" fontSize={8} fill="#52525b">{bay.name}</text>
      {bay.lineLength && <text x={x} y={labelY + 25} textAnchor="middle" fontSize={7} fill="#3f3f46">{bay.lineLength} km</text>}
    </g>
  );
}

// ── Flow particles ──────────────────────────────────────────────────────────────
function FlowParticles({ ener }) {
  const particles = [];
  BAYS.forEach(bay => {
    if (!ener.bays[bay.id] || bay.type === 'coupler') return;
    const x = BAY_X[bay.id];
    const eqY = getEquipY(bay);
    const allY = Object.values(eqY);
    const topY = BUS1_Y;
    const botY = Math.max(...allY) + 10;

    [0, 1, 2].forEach(i => {
      particles.push(
        <circle key={`fp-${bay.id}-${i}`} r={3.5} fill="#3b82f6" opacity={0}>
          <animateMotion dur="3s" begin={`${i * 1}s`} repeatCount="indefinite"
            path={`M${x},${topY} L${x},${botY}`} />
          <animate attributeName="opacity" values="0;0.6;0.6;0" dur="3s" begin={`${i * 1}s`} repeatCount="indefinite" />
        </circle>
      );
    });
  });
  return <g>{particles}</g>;
}

// ── Legend ───────────────────────────────────────────────────────────────────────
function Legend({ y }) {
  const items = [
    { col: '#22c55e', label: 'CB Closed' }, { col: '#ef4444', label: 'CB Open/Tripped' },
    { col: '#a78bfa', label: 'Isolator (Closed)' }, { col: '#22d3ee', label: 'Current Transformer' },
    { col: '#ec4899', label: 'CVT / PT' }, { col: '#f59e0b', label: 'LA / Transformer' },
    { col: '#3b82f6', label: 'Energized Path' }, { col: '#27272a', label: 'De-energized' },
  ];
  return (
    <g transform={`translate(40, ${y})`}>
      <text x={0} y={0} fontSize={10} fill="#52525b" fontWeight={700} letterSpacing="0.05em">LEGEND</text>
      {items.map((it, i) => (
        <g key={i} transform={`translate(${(i % 4) * 160}, ${Math.floor(i / 4) * 18 + 14})`}>
          <rect x={0} y={-7} width={12} height={12} rx={2} fill={it.col} opacity={0.85} />
          <text x={16} y={3} fontSize={9} fill="#71717a">{it.label}</text>
        </g>
      ))}
      <text x={0} y={56} fontSize={8.5} fill="#3f3f46">Click any equipment symbol to learn about it · Click CB or Isolator to toggle · Try preset scenarios below</text>
    </g>
  );
}

// ── Info Panel ──────────────────────────────────────────────────────────────────
function InfoPanel({ info, onClose }) {
  if (!info) return null;
  const eq = EQ[info.equipType];
  if (!eq) return null;
  return (
    <div style={S.popup} onClick={onClose}>
      <div style={S.popCard} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: eq.color }} />
          <div style={S.popTitle}>{eq.name}</div>
        </div>
        <div style={S.popRow}><span style={S.popL}>Bay</span><span style={S.popV}>{info.bayName}</span></div>
        <div style={S.popRow}><span style={S.popL}>Rating</span><span style={{ ...S.popV, fontSize: 12, lineHeight: 1.5 }}>{eq.rating}</span></div>
        {eq.switchable && <div style={S.popRow}><span style={S.popL}>State</span><span style={{ ...S.popV, color: info.closed ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{info.closed ? 'CLOSED' : 'OPEN'}</span></div>}
        <div style={{ ...S.popRow, flexDirection: 'column', gap: 6 }}>
          <span style={{ ...S.popL, fontWeight: 600, color: '#a1a1aa' }}>Role</span>
          <span style={{ fontSize: 13, color: '#d4d4d8', lineHeight: 1.7 }}>{eq.role}</span>
        </div>
        <div style={{ ...S.popRow, flexDirection: 'column', gap: 6, borderBottom: 'none' }}>
          <span style={{ fontWeight: 600, color: '#f59e0b', fontSize: 13 }}>Why It Matters</span>
          <span style={{ fontSize: 13, color: '#e4e4e7', lineHeight: 1.7 }}>{eq.importance}</span>
        </div>
        <button style={S.popClose} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ── Theory Tab ──────────────────────────────────────────────────────────────────
function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>400 kV Air Insulated Substation (AIS)</h2>

      <p style={S.p}>A 400 kV substation is the highest voltage switching node in India's power grid. It serves as the interconnection hub where extra-high-voltage (EHV) transmission lines converge, power is transformed to lower voltages (220 kV, 132 kV), and switching operations route power flow across the national grid. These substations are operated by PGCIL (Power Grid Corporation of India) for the inter-state transmission system (ISTS) and by state utilities like AP Transco for intra-state 400 kV networks.</p>

      <p style={S.p}>An AIS (Air Insulated Switchgear) substation uses atmospheric air as the primary insulation medium between live conductors. This requires large safety clearances — about 3.5 metres phase-to-ground and 4.2 metres phase-to-phase at 400 kV — making these substations physically very large, typically spanning 5–10 acres. The alternative, GIS (Gas Insulated Switchgear), uses SF₆ gas for insulation and is far more compact, but costs 3–5× more.</p>

      <h3 style={S.h3}>Complete Bay Equipment — End to End</h3>
      <p style={S.p}>A standard 400 kV AIS line bay contains the following equipment, arranged in a specific order from the <strong>incoming transmission line</strong> to the <strong>bus bar</strong>. Every piece plays a critical role:</p>

      <table style={S.tbl}>
        <thead>
          <tr><th style={S.th}>Equipment</th><th style={S.th}>Typical Rating</th><th style={S.th}>Function</th></tr>
        </thead>
        <tbody>
          <tr><td style={{ ...S.td, fontWeight: 600 }}>Line Entry Gantry</td><td style={S.td}>Lattice steel, 24 m height</td><td style={S.td}>Conductor termination from transmission line</td></tr>
          <tr><td style={{ ...S.td, fontWeight: 600 }}>Wave Trap</td><td style={S.td}>400 kV, 2000 A, 80–500 kHz</td><td style={S.td}>Blocks PLCC carrier signals from bus</td></tr>
          <tr><td style={{ ...S.td, fontWeight: 600 }}>Lightning Arrester</td><td style={S.td}>336 kV, 10 kA ZnO</td><td style={S.td}>Clamps surge overvoltages to ground</td></tr>
          <tr><td style={{ ...S.td, fontWeight: 600 }}>CVT</td><td style={S.td}>400/√3 : 110/√3 V, 0.2 class</td><td style={S.td}>Voltage measurement + PLCC coupling</td></tr>
          <tr><td style={{ ...S.td, fontWeight: 600 }}>Line Isolator</td><td style={S.td}>400 kV, 2000 A motorized</td><td style={S.td}>Visible isolation for line maintenance</td></tr>
          <tr><td style={{ ...S.td, fontWeight: 600 }}>Current Transformer</td><td style={S.td}>2000/1 A, multi-core 5P20</td><td style={S.td}>Current measurement for protection & metering</td></tr>
          <tr><td style={{ ...S.td, fontWeight: 600 }}>SF₆ Circuit Breaker</td><td style={S.td}>420 kV, 40 kA, 3-cycle</td><td style={S.td}>Fault current interruption (primary switching)</td></tr>
          <tr><td style={{ ...S.td, fontWeight: 600 }}>Bus-1 Isolator</td><td style={S.td}>400 kV, 2000 A with ES</td><td style={S.td}>Connects bay to Main Bus 1</td></tr>
          <tr><td style={{ ...S.td, fontWeight: 600 }}>Bus-2 Isolator</td><td style={S.td}>400 kV, 2000 A with ES</td><td style={S.td}>Connects bay to Main Bus 2</td></tr>
        </tbody>
      </table>

      <div style={S.ctx}>
        <span style={S.ctxT}>Equipment Sequence Logic</span>
        <p style={S.ctxP}>The order is deliberate: the wave trap must be closest to the line to block carrier signals. The lightning arrester must be between the line and the CVT to protect it. The CT must be between the isolator and the CB to measure the fault current that the CB will interrupt. The bus isolators are closest to the bus to allow bus selection.</p>
      </div>

      <h3 style={S.h3}>Bus Bar Arrangements</h3>
      <p style={S.p}>The bus bar arrangement determines the substation's flexibility, reliability, and cost. At 400 kV, the most common arrangement in India is the <strong>double main bus</strong> scheme.</p>

      <svg viewBox="0 0 700 130" style={{ width: '100%', maxWidth: 700, margin: '16px 0' }}>
        <g transform="translate(10, 15)">
          <text x={70} y={0} textAnchor="middle" fontSize={10} fill="#a1a1aa" fontWeight={600}>Single Bus</text>
          <line x1={20} y1={20} x2={120} y2={20} stroke="#3b82f6" strokeWidth={2.5} />
          {[40, 70, 100].map(bx => (<g key={bx}><line x1={bx} y1={20} x2={bx} y2={55} stroke="#3b82f6" strokeWidth={1.5} /><rect x={bx-5} y={38} width={10} height={10} fill="none" stroke="#22c55e" strokeWidth={1.5} /></g>))}
          <text x={70} y={75} textAnchor="middle" fontSize={8} fill="#52525b">Simplest · No redundancy</text>
        </g>
        <g transform="translate(180, 15)">
          <text x={70} y={0} textAnchor="middle" fontSize={10} fill="#22c55e" fontWeight={600}>Double Bus ✓</text>
          <line x1={20} y1={20} x2={120} y2={20} stroke="#3b82f6" strokeWidth={2.5} />
          <line x1={20} y1={35} x2={120} y2={35} stroke="#06b6d4" strokeWidth={2.5} />
          {[40, 70, 100].map(bx => (<g key={bx}><line x1={bx} y1={20} x2={bx} y2={65} stroke="#3b82f6" strokeWidth={1.5} /><rect x={bx-5} y={48} width={10} height={10} fill="none" stroke="#22c55e" strokeWidth={1.5} /></g>))}
          <text x={70} y={82} textAnchor="middle" fontSize={8} fill="#22c55e" fontWeight={600}>Most common at 400 kV</text>
        </g>
        <g transform="translate(370, 15)">
          <text x={80} y={0} textAnchor="middle" fontSize={10} fill="#a1a1aa" fontWeight={600}>1½ Breaker</text>
          <line x1={20} y1={20} x2={140} y2={20} stroke="#3b82f6" strokeWidth={2.5} />
          <line x1={20} y1={85} x2={140} y2={85} stroke="#06b6d4" strokeWidth={2.5} />
          {[50, 110].map(bx => (<g key={bx}><line x1={bx} y1={20} x2={bx} y2={85} stroke="#a78bfa" strokeWidth={1.5} /><rect x={bx-4} y={30} width={8} height={8} fill="none" stroke="#22c55e" strokeWidth={1.2} /><rect x={bx-4} y={48} width={8} height={8} fill="none" stroke="#22c55e" strokeWidth={1.2} /><rect x={bx-4} y={66} width={8} height={8} fill="none" stroke="#22c55e" strokeWidth={1.2} /></g>))}
          <text x={80} y={102} textAnchor="middle" fontSize={8} fill="#52525b">Highest reliability · 3 CBs per 2 circuits</text>
        </g>
      </svg>

      <h3 style={S.h3}>Double Bus Operation & Bus Transfer</h3>
      <p style={S.p}>In the double bus arrangement, each feeder connects to either Bus 1 or Bus 2 through its bus isolators. Normally, all feeders operate on Bus 1 with the bus coupler closed, keeping both buses energized and synchronized.</p>
      <p style={S.p}>The <strong>bus transfer procedure</strong> moves a feeder from one bus to another without interrupting supply:</p>
      <ol style={S.ul}>
        <li style={S.li}><strong>Step 1:</strong> Ensure bus coupler CB is closed (both buses at same voltage and phase)</li>
        <li style={S.li}><strong>Step 2:</strong> Close the target bus isolator of the feeder (e.g., Bus-2 isolator)</li>
        <li style={S.li}><strong>Step 3:</strong> Feeder is now on both buses (paralleled through coupler) — verify currents</li>
        <li style={S.li}><strong>Step 4:</strong> Open the source bus isolator (e.g., Bus-1 isolator)</li>
        <li style={S.li}><strong>Step 5:</strong> Feeder is now exclusively on Bus 2 — transfer complete</li>
      </ol>

      <h3 style={S.h3}>Protection Zones</h3>
      <p style={S.p}>A 400 kV substation has overlapping protection zones ensuring every fault is cleared by at least two independent systems:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Bus Bar Protection (87B):</strong> Differential protection covering the bus zone. Trips all breakers on the faulted bus.</li>
        <li style={S.li}><strong>Line Distance Protection (21):</strong> Impedance-based, 3 zones. Zone 1: 80% instantaneous. Zone 2: 120% time-delayed. Zone 3: backup.</li>
        <li style={S.li}><strong>Transformer Differential (87T):</strong> Compares HV and LV currents. Any mismatch beyond threshold = internal fault → trip.</li>
        <li style={S.li}><strong>Breaker Failure (50BF):</strong> If CB fails to clear fault within 150 ms, trips all adjacent breakers.</li>
      </ul>

      <h3 style={S.h3}>Interlocking Philosophy</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong>Rule 1:</strong> Isolator cannot operate when its CB is closed (no arc-quenching capability).</li>
        <li style={S.li}><strong>Rule 2:</strong> Earth switch cannot close unless isolator is open and section is de-energized.</li>
        <li style={S.li}><strong>Rule 3:</strong> CB can open any time. Closing requires check-sync verification.</li>
      </ul>

      <div style={S.ctx}>
        <span style={S.ctxT}>Indian Grid Context — PGCIL / AP Transco</span>
        <p style={S.ctxP}>India's 400 kV network spans over 1,80,000 circuit-km operated by PGCIL for inter-state transmission. AP Transco operates intra-state 400 kV substations including Vijayawada, Kurnool, Nellore, Kadapa, and Anantapur. A typical AP Transco 400 kV substation has 2–4 line bays and 2 ICT bays (400/220 kV, 315 MVA). The double main bus arrangement is universal at this voltage level.</p>
      </div>

      <h3 style={S.h3}>Key Design Parameters</h3>
      <table style={S.tbl}>
        <thead><tr><th style={S.th}>Parameter</th><th style={S.th}>400 kV Standard</th></tr></thead>
        <tbody>
          <tr><td style={S.td}>Phase-to-ground clearance</td><td style={S.td}>3,500 mm minimum</td></tr>
          <tr><td style={S.td}>Phase-to-phase clearance</td><td style={S.td}>4,200 mm</td></tr>
          <tr><td style={S.td}>BIL (Basic Insulation Level)</td><td style={S.td}>1,425 kV peak</td></tr>
          <tr><td style={S.td}>Creepage distance</td><td style={S.td}>25 mm/kV (31 mm/kV polluted)</td></tr>
          <tr><td style={S.td}>Short-circuit level</td><td style={S.td}>40 kA for 1 second</td></tr>
          <tr><td style={S.td}>Continuous current rating</td><td style={S.td}>2,000 – 3,150 A</td></tr>
          <tr><td style={S.td}>Bay width (centre-to-centre)</td><td style={S.td}>21 – 25 m</td></tr>
          <tr><td style={S.td}>Substation area</td><td style={S.td}>5 – 10 acres typical</td></tr>
          <tr><td style={S.td}>Earth mat resistance</td><td style={S.td}>{"<"} 1 Ω</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>References</h3>
      <ul style={S.ul}>
        <li style={S.li}>CBIP Manual on Substation Engineering (Publication No. 353)</li>
        <li style={S.li}>CEA Technical Standards for Construction of EHV Substations</li>
        <li style={S.li}>PGCIL Standard Drawings for 400 kV AIS Substations</li>
        <li style={S.li}>IS 3716 — Application Guide for Insulation Coordination</li>
        <li style={S.li}>IEC 62271 — High-voltage switchgear and controlgear</li>
        <li style={S.li}>IEEE C37 — Circuit breaker standards</li>
      </ul>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────────
export default function AISSubstation400kV() {
  const [tab, setTab] = useState('simulate');
  const [sw, setSw] = useState(makeInitial);
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [scenario, setScenario] = useState('normal');
  const [loadLevel, setLoadLevel] = useState(80);
  const [interlockMsg, setInterlockMsg] = useState(null);

  const ener = useMemo(() => computeEnergization(sw), [sw]);
  const readings = useMemo(() => computeReadings(sw, ener, loadLevel), [sw, ener, loadLevel]);

  const handleSwitch = useCallback((bayId, equipType, key) => {
    const msg = checkInterlock(bayId, equipType, sw);
    if (msg) { setInterlockMsg(msg); setTimeout(() => setInterlockMsg(null), 3500); return; }
    setSw(prev => ({ ...prev, [key]: !prev[key] }));
    setInterlockMsg(null);
  }, [sw]);

  const applyScenario = useCallback((name) => {
    setScenario(name);
    setSw(SCENARIOS[name].make());
    setInterlockMsg(null);
  }, []);

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: '100%', maxWidth: VB_W, height: 'auto' }}>
              <defs>
                <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>

              {/* Title */}
              <text x={VB_W / 2} y={28} textAnchor="middle" fontSize={15} fill="#e4e4e7" fontWeight={700}>400 kV AIS Substation — Single Line Diagram</text>
              <text x={VB_W / 2} y={44} textAnchor="middle" fontSize={10} fill="#52525b">Double Main Bus Arrangement · {BAYS.filter(b=>b.type==='line').length} Line Bays · {BAYS.filter(b=>b.type==='transformer').length} Transformer Bays · Bus Coupler</text>

              {/* Bus bars */}
              <line x1={60} y1={BUS1_Y} x2={VB_W - 60} y2={BUS1_Y} stroke={ener.bus1 ? '#3b82f6' : '#3f3f46'} strokeWidth={4} />
              <line x1={60} y1={BUS2_Y} x2={VB_W - 60} y2={BUS2_Y} stroke={ener.bus2 ? '#06b6d4' : '#3f3f46'} strokeWidth={4} />
              {ener.bus1 && <line x1={60} y1={BUS1_Y} x2={VB_W - 60} y2={BUS1_Y} stroke="#3b82f6" strokeWidth={2} opacity={0.3} filter="url(#glow)" />}
              {ener.bus2 && <line x1={60} y1={BUS2_Y} x2={VB_W - 60} y2={BUS2_Y} stroke="#06b6d4" strokeWidth={2} opacity={0.3} filter="url(#glow)" />}

              {/* Bus labels */}
              <text x={48} y={BUS1_Y + 5} textAnchor="end" fontSize={11} fill={ener.bus1 ? '#60a5fa' : '#52525b'} fontWeight={700}>BUS 1</text>
              <text x={48} y={BUS2_Y + 5} textAnchor="end" fontSize={11} fill={ener.bus2 ? '#22d3ee' : '#52525b'} fontWeight={700}>BUS 2</text>
              <text x={VB_W - 48} y={BUS1_Y + 5} textAnchor="start" fontSize={10} fill={ener.bus1 ? '#60a5fa' : '#52525b'} fontFamily="monospace">{readings.bus1V} kV</text>
              <text x={VB_W - 48} y={BUS2_Y + 5} textAnchor="start" fontSize={10} fill={ener.bus2 ? '#22d3ee' : '#52525b'} fontFamily="monospace">{readings.bus2V} kV</text>

              {/* Bay columns */}
              {BAYS.map(bay => (
                <BayColumn key={bay.id} bay={bay} sw={sw} ener={ener}
                  onSwitch={handleSwitch} onSelect={setSelectedEquip} />
              ))}

              {/* Flow particles */}
              <FlowParticles ener={ener} />

              {/* Legend */}
              <Legend y={VB_H - 62} />
            </svg>
          </div>

          {interlockMsg && (
            <div style={S.interlockMsg}>
              <span style={{ fontSize: 16 }}>⚠</span>
              <span>{interlockMsg}</span>
            </div>
          )}

          {/* Results bar */}
          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Bus 1 Voltage</span>
              <span style={{ ...S.rv, color: ener.bus1 ? '#3b82f6' : '#ef4444' }}>{readings.bus1V} kV</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Bus 2 Voltage</span>
              <span style={{ ...S.rv, color: ener.bus2 ? '#06b6d4' : '#ef4444' }}>{readings.bus2V} kV</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Total Load</span>
              <span style={{ ...S.rv, color: '#22c55e' }}>{readings.totalMW.toFixed(0)} MW</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Reactive</span>
              <span style={{ ...S.rv, color: '#a78bfa', fontSize: 13 }}>{readings.totalMVAR.toFixed(0)} MVAR</span>
            </div>
            {readings.feeders.filter(f => f.type === 'line').map(f => (
              <div key={f.id} style={S.ri}>
                <span style={S.rl}>{f.id} ({f.name.split(' ')[0]})</span>
                <span style={{ ...S.rv, color: f.mw > 0 ? '#a5b4fc' : '#52525b', fontSize: 13 }}>
                  {f.mw.toFixed(0)} MW · {f.iA.toFixed(0)} A
                </span>
              </div>
            ))}
            {readings.feeders.filter(f => f.type === 'transformer').map(f => (
              <div key={f.id} style={S.ri}>
                <span style={S.rl}>{f.id} (ICT)</span>
                <span style={{ ...S.rv, color: f.mw > 0 ? '#fbbf24' : '#52525b', fontSize: 13 }}>
                  {f.mw.toFixed(0)} MW · {(f.mva / 315 * 100).toFixed(0)}% loaded
                </span>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>Scenario:</span>
              {Object.entries(SCENARIOS).map(([key, sc]) => (
                <button key={key} style={S.btn(scenario === key, key === 'fault')} onClick={() => applyScenario(key)}>{sc.label}</button>
              ))}
            </div>
            <div style={S.cg}>
              <span style={S.label}>Load Level</span>
              <input type="range" min={10} max={100} value={loadLevel} onChange={e => setLoadLevel(+e.target.value)} style={S.slider} />
              <span style={S.val}>{loadLevel}%</span>
            </div>
          </div>
        </div>
      ) : (
        <Theory />
      )}

      <InfoPanel info={selectedEquip} onClose={() => setSelectedEquip(null)} />
    </div>
  );
}
