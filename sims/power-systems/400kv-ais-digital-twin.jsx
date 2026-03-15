import React, { useEffect, useMemo, useState } from 'react';

const S = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 3.5rem)',
    background:
      'radial-gradient(circle at top left, rgba(99,102,241,0.12), transparent 24%), radial-gradient(circle at top right, rgba(16,185,129,0.08), transparent 18%), #09090b',
    color: '#e4e4e7',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  hero: {
    padding: '26px 24px 18px',
    borderBottom: '1px solid #1e1e2e',
    background:
      'linear-gradient(180deg, rgba(12,12,18,0.96), rgba(10,10,15,0.92))',
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: '-0.03em',
    color: '#fafafa',
    margin: 0,
  },
  subtitle: {
    margin: '10px 0 0',
    maxWidth: 980,
    fontSize: 14,
    lineHeight: 1.7,
    color: '#a1a1aa',
  },
  bannerRow: {
    marginTop: 16,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  banner: (tone) => ({
    padding: '8px 12px',
    borderRadius: 12,
    border:
      tone === 'blue'
        ? '1px solid rgba(99,102,241,0.32)'
        : tone === 'green'
          ? '1px solid rgba(16,185,129,0.3)'
          : '1px solid rgba(244,114,182,0.28)',
    background:
      tone === 'blue'
        ? 'rgba(99,102,241,0.08)'
        : tone === 'green'
          ? 'rgba(16,185,129,0.08)'
          : 'rgba(244,114,182,0.08)',
    color:
      tone === 'blue'
        ? '#c7d2fe'
        : tone === 'green'
          ? '#bbf7d0'
          : '#f9a8d4',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.02em',
  }),
  tabBar: {
    display: 'flex',
    gap: 6,
    padding: '12px 24px',
    borderBottom: '1px solid #1e1e2e',
    background: 'rgba(10,10,15,0.92)',
    position: 'sticky',
    top: 0,
    zIndex: 20,
    backdropFilter: 'blur(14px)',
  },
  tab: (active) => ({
    padding: '9px 14px',
    borderRadius: 11,
    border: active ? '1px solid rgba(129,140,248,0.35)' : '1px solid #27272a',
    background: active ? 'rgba(99,102,241,0.14)' : 'rgba(24,24,27,0.72)',
    color: active ? '#e0e7ff' : '#a1a1aa',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  }),
  controls: {
    padding: '16px 24px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 14,
    alignItems: 'center',
    borderBottom: '1px solid #1e1e2e',
    background: 'rgba(12,12,18,0.84)',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minWidth: 155,
  },
  controlLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#71717a',
    fontWeight: 700,
  },
  sliderWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  slider: {
    width: 140,
    accentColor: '#818cf8',
    cursor: 'pointer',
  },
  smallValue: {
    minWidth: 58,
    textAlign: 'right',
    fontSize: 12,
    color: '#d4d4d8',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  select: {
    padding: '8px 10px',
    borderRadius: 10,
    background: '#18181b',
    border: '1px solid #27272a',
    color: '#e4e4e7',
    fontSize: 13,
  },
  toggleRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  toggleBtn: (active, accent) => ({
    padding: '8px 10px',
    borderRadius: 10,
    border: `1px solid ${
      active
        ? accent === 'green'
          ? 'rgba(16,185,129,0.38)'
          : 'rgba(129,140,248,0.35)'
        : '#27272a'
    }`,
    background: active
      ? accent === 'green'
        ? 'rgba(16,185,129,0.12)'
        : 'rgba(99,102,241,0.12)'
      : 'rgba(24,24,27,0.76)',
    color: active
      ? accent === 'green'
        ? '#bbf7d0'
        : '#c7d2fe'
      : '#a1a1aa',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  }),
  scenarioStrip: {
    padding: '16px 24px 0',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  scenarioBtn: (active) => ({
    padding: '11px 14px',
    width: 214,
    textAlign: 'left',
    borderRadius: 16,
    border: active ? '1px solid rgba(129,140,248,0.34)' : '1px solid #27272a',
    background: active ? 'rgba(99,102,241,0.13)' : 'rgba(17,17,20,0.82)',
    cursor: 'pointer',
  }),
  scenarioTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: '#f4f4f5',
    marginBottom: 4,
  },
  scenarioBody: {
    fontSize: 12,
    lineHeight: 1.55,
    color: '#a1a1aa',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    padding: '18px 24px 24px',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.55fr) minmax(340px, 0.95fr)',
    gap: 18,
    alignItems: 'start',
  },
  card: {
    background:
      'linear-gradient(180deg, rgba(24,24,27,0.88), rgba(12,12,15,0.94))',
    border: '1px solid #232329',
    borderRadius: 22,
    boxShadow: '0 24px 80px rgba(0,0,0,0.24)',
    overflow: 'hidden',
  },
  cardHead: {
    padding: '16px 18px 12px',
    borderBottom: '1px solid #232329',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  cardTitleWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: '#fafafa',
  },
  cardSub: {
    fontSize: 12,
    lineHeight: 1.6,
    color: '#a1a1aa',
    maxWidth: 760,
  },
  cardBody: {
    padding: '16px 18px 18px',
  },
  statusPill: (tone) => ({
    padding: '7px 10px',
    borderRadius: 999,
    background:
      tone === 'green'
        ? 'rgba(16,185,129,0.11)'
        : tone === 'amber'
          ? 'rgba(245,158,11,0.12)'
          : tone === 'red'
            ? 'rgba(239,68,68,0.12)'
            : 'rgba(99,102,241,0.12)',
    border:
      tone === 'green'
        ? '1px solid rgba(16,185,129,0.28)'
        : tone === 'amber'
          ? '1px solid rgba(245,158,11,0.28)'
          : tone === 'red'
            ? '1px solid rgba(239,68,68,0.3)'
            : '1px solid rgba(99,102,241,0.3)',
    color:
      tone === 'green'
        ? '#bbf7d0'
        : tone === 'amber'
          ? '#fcd34d'
          : tone === 'red'
            ? '#fca5a5'
            : '#c7d2fe',
    fontSize: 11,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  }),
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
  },
  metricCard: {
    padding: 14,
    borderRadius: 16,
    border: '1px solid #27272a',
    background: 'rgba(11,11,14,0.92)',
  },
  metricLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#71717a',
    fontWeight: 700,
  },
  metricValue: {
    marginTop: 8,
    fontSize: 23,
    fontWeight: 800,
    color: '#fafafa',
    letterSpacing: '-0.03em',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  metricHint: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 1.55,
    color: '#a1a1aa',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  rowCard: {
    padding: 13,
    borderRadius: 14,
    border: '1px solid #27272a',
    background: 'rgba(12,12,16,0.9)',
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: '#f4f4f5',
  },
  rowMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#a1a1aa',
    lineHeight: 1.55,
  },
  split: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: 16,
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: (selected, tone) => ({
    padding: '7px 10px',
    borderRadius: 999,
    border: `1px solid ${
      selected
        ? tone === 'green'
          ? 'rgba(16,185,129,0.36)'
          : 'rgba(129,140,248,0.32)'
        : '#2b2b31'
    }`,
    background: selected
      ? tone === 'green'
        ? 'rgba(16,185,129,0.1)'
        : 'rgba(99,102,241,0.12)'
      : 'rgba(15,15,18,0.85)',
    color: selected
      ? tone === 'green'
        ? '#bbf7d0'
        : '#c7d2fe'
      : '#a1a1aa',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 700,
  }),
  sequence: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto',
    paddingBottom: 4,
  },
  sequenceCard: (active, accent) => ({
    minWidth: 156,
    padding: 14,
    borderRadius: 18,
    border: `1px solid ${
      active
        ? accent || 'rgba(129,140,248,0.36)'
        : 'rgba(39,39,42,1)'
    }`,
    background: active ? 'rgba(99,102,241,0.12)' : 'rgba(13,13,16,0.94)',
    cursor: 'pointer',
  }),
  sequenceBadge: (color) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 12,
    background: `${color}20`,
    color,
    fontWeight: 800,
    fontSize: 13,
    border: `1px solid ${color}55`,
  }),
  sequenceName: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: 800,
    color: '#fafafa',
  },
  sequenceText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 1.55,
    color: '#a1a1aa',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    gap: 16,
  },
  detailBox: {
    padding: 16,
    borderRadius: 18,
    border: '1px solid #27272a',
    background: 'rgba(12,12,16,0.92)',
  },
  detailLead: {
    fontSize: 14,
    lineHeight: 1.7,
    color: '#d4d4d8',
  },
  detailPara: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 1.7,
    color: '#a1a1aa',
  },
  detailLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#71717a',
    fontWeight: 700,
    marginBottom: 8,
  },
  keyValue: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    padding: '10px 0',
    borderBottom: '1px solid #232329',
    fontSize: 13,
  },
  kvLabel: {
    color: '#a1a1aa',
  },
  kvValue: {
    color: '#fafafa',
    fontWeight: 700,
    textAlign: 'right',
  },
  bulletList: {
    paddingLeft: 18,
    margin: '8px 0 0',
  },
  bullet: {
    color: '#a1a1aa',
    fontSize: 13,
    lineHeight: 1.7,
    marginBottom: 6,
  },
  note: {
    padding: 14,
    borderRadius: 16,
    border: '1px solid rgba(99,102,241,0.22)',
    background: 'rgba(99,102,241,0.08)',
    color: '#c7d2fe',
    fontSize: 13,
    lineHeight: 1.7,
  },
  routeBox: {
    padding: 14,
    borderRadius: 16,
    border: '1px solid #27272a',
    background: 'rgba(11,11,14,0.92)',
  },
  pathText: {
    fontSize: 13,
    lineHeight: 1.7,
    color: '#d4d4d8',
  },
  mono: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    padding: '11px 10px',
    borderBottom: '2px solid #3f3f46',
    color: '#fafafa',
    fontWeight: 800,
  },
  td: {
    padding: '11px 10px',
    borderBottom: '1px solid #232329',
    color: '#d4d4d8',
    verticalAlign: 'top',
    lineHeight: 1.6,
  },
  foot: {
    padding: '0 24px 24px',
    fontSize: 12,
    lineHeight: 1.7,
    color: '#71717a',
  },
};

const LINE_BAYS = [
  {
    id: 'line1',
    name: 'North Incomer',
    short: 'L1',
    corridor: 'Raichur Corridor',
    lengthKm: 210,
    capacityMW: 300,
    defaultBus: 'bus400_1',
  },
  {
    id: 'line2',
    name: 'East Incomer',
    short: 'L2',
    corridor: 'Warangal Corridor',
    lengthKm: 260,
    capacityMW: 320,
    defaultBus: 'bus400_1',
  },
  {
    id: 'line3',
    name: 'South Incomer',
    short: 'L3',
    corridor: 'Kurnool Corridor',
    lengthKm: 310,
    capacityMW: 350,
    defaultBus: 'bus400_2',
  },
  {
    id: 'line4',
    name: 'West Incomer',
    short: 'L4',
    corridor: 'Hyderabad Corridor',
    lengthKm: 240,
    capacityMW: 340,
    defaultBus: 'bus400_2',
  },
];

const ICT_BAYS = [
  {
    id: 'ict1',
    name: 'ICT-1',
    short: 'T1',
    ratingMVA: 315,
    defaultHvBus: 'bus400_1',
    defaultLvBus: 'bus220_1',
  },
  {
    id: 'ict2',
    name: 'ICT-2',
    short: 'T2',
    ratingMVA: 315,
    defaultHvBus: 'bus400_2',
    defaultLvBus: 'bus220_2',
  },
];

const FEEDER_BAYS = [
  {
    id: 'feeder1',
    name: 'Metro West 220 kV',
    short: 'F1',
    baseMW: 120,
    defaultBus: 'bus220_1',
  },
  {
    id: 'feeder2',
    name: 'Industrial 220 kV',
    short: 'F2',
    baseMW: 140,
    defaultBus: 'bus220_1',
  },
  {
    id: 'feeder3',
    name: 'Urban Ring 220 kV',
    short: 'F3',
    baseMW: 110,
    defaultBus: 'bus220_2',
  },
  {
    id: 'feeder4',
    name: 'Bulk Supply 220 kV',
    short: 'F4',
    baseMW: 95,
    defaultBus: 'bus220_2',
  },
];

const REACTOR = {
  id: 'reactor1',
  name: '400 kV Bus Reactor',
  short: 'R',
  ratingMvar: 125,
  defaultBus: 'bus400_2',
};

const BAY_META = {
  line1: { name: 'North 400 kV line bay', type: 'line400', family: '400 kV line' },
  line2: { name: 'East 400 kV line bay', type: 'line400', family: '400 kV line' },
  line3: { name: 'South 400 kV line bay', type: 'line400', family: '400 kV line' },
  line4: { name: 'West 400 kV line bay', type: 'line400', family: '400 kV line' },
  coupler400: { name: '400 kV bus coupler', type: 'coupler400', family: '400 kV bus' },
  reactor1: { name: '400 kV bus reactor bay', type: 'reactor400', family: 'Reactive control' },
  ict1: { name: 'ICT-1 transformer bay', type: 'ict400to220', family: 'Transformer' },
  ict2: { name: 'ICT-2 transformer bay', type: 'ict400to220', family: 'Transformer' },
  coupler220: { name: '220 kV bus coupler', type: 'coupler220', family: '220 kV bus' },
  feeder1: { name: 'Metro West 220 kV feeder bay', type: 'feeder220', family: '220 kV feeder' },
  feeder2: { name: 'Industrial 220 kV feeder bay', type: 'feeder220', family: '220 kV feeder' },
  feeder3: { name: 'Urban Ring 220 kV feeder bay', type: 'feeder220', family: '220 kV feeder' },
  feeder4: { name: 'Bulk Supply 220 kV feeder bay', type: 'feeder220', family: '220 kV feeder' },
};

const EQUIPMENT = {
  gantry: {
    name: 'Line Entry Gantry',
    badge: 'GY',
    color: '#c4b5fd',
    role:
      'Provides the mechanical termination point and clearance envelope where the overhead 400 kV line enters the AIS yard.',
    importance:
      'The gantry is where the physical line becomes yard equipment. Its geometry governs conductor swing, phase spacing, and safe ground clearance.',
    watch:
      'Treat it as structural equipment first and electrical equipment second. A complete yard view feels wrong if the overhead line termination is missing.',
    phase2: 'Attach utility general arrangement drawings or tower interface details here.',
  },
  lineTrap: {
    name: 'Wave Trap / Line Trap',
    badge: 'LT',
    color: '#38bdf8',
    role:
      'Blocks high-frequency carrier signals from leaking into the bus while allowing 50 Hz power current to pass into the station.',
    importance:
      'PLCC-based teleprotection and carrier communication depend on it. Without the line trap, the communication channel is poorly defined.',
    watch:
      'This is a communication-path device, not a voltage-control device. It should be explained separately from the main power path.',
    phase2: 'Attach PLCC block diagrams and teleprotection channel notes.',
  },
  cvt: {
    name: 'CVT / Coupling Capacitor Voltage Transformer',
    badge: 'CVT',
    color: '#f472b6',
    role:
      'Steps down line voltage for metering and protection, while also providing the coupling point used by carrier communication equipment.',
    importance:
      'Distance relays, synchronism checks, meters, and PLCC all need a stable voltage reference on EHV line bays.',
    watch:
      'Keep the explanation honest: this is measurement and communication support, not a power-transfer device.',
    phase2: 'Attach relay drawings that show CVT secondary usage and coupling device connections.',
  },
  surgeArrester: {
    name: 'Surge Arrester',
    badge: 'LA',
    color: '#fb7185',
    role:
      'Clamps lightning and switching surges before they overstress insulation on line equipment, breakers, buses, or transformer terminals.',
    importance:
      'It protects the insulation coordination margin of the entire bay. Placement near exposed or high-value equipment matters.',
    watch:
      'Show it as a surge path to earth, not as something in the normal load current path.',
    phase2: 'Attach insulation coordination studies or arrester energy-class references.',
  },
  lineIsolator: {
    name: 'Line Isolator with Earth Switch',
    badge: 'DS-L',
    color: '#a3e635',
    role:
      'Provides visible isolation for the line side once the breaker has already interrupted the current.',
    importance:
      'Operators depend on it for safe maintenance. It is a no-load device and must not be presented as a fault-clearing element.',
    watch:
      'The sequence matters: breaker first, isolator second, earth switch last for maintenance.',
    phase2: 'Attach switching procedures or interlocking logic tables.',
  },
  ct: {
    name: 'Current Transformer',
    badge: 'CT',
    color: '#22d3ee',
    role:
      'Converts primary current to a relay-friendly secondary current for protection, measurement, and disturbance recording.',
    importance:
      'All current-based protection depends on it. If it saturates or is assigned poorly, the relay picture becomes misleading during faults.',
    watch:
      'Its role is measurement fidelity under normal and fault conditions, not interruption.',
    phase2: 'Attach CT core allocation sheets for metering and protection.',
  },
  sf6Breaker: {
    name: 'SF6 Circuit Breaker',
    badge: 'CB',
    color: '#22c55e',
    role:
      'Interrupts load current and short-circuit current. It is the primary switching element that protection operates during abnormal conditions.',
    importance:
      'This is the bay device that actually clears faults. Everything around it either supports measurement, isolation, or routing.',
    watch:
      'Keep its physics separate from isolators. Breaker duty is current interruption, not visible isolation.',
    phase2: 'Attach timing tests, density monitoring notes, or breaker failure logic references.',
  },
  busSelector: {
    name: 'Bus Selector Isolators',
    badge: 'DS-B',
    color: '#818cf8',
    role:
      'Connect the bay to Bus-1 or Bus-2 so operators can transfer circuits for maintenance, outage management, or bus splitting.',
    importance:
      'These devices make the station flexible. They are why a substation can survive maintenance without losing every connected circuit.',
    watch:
      'Explain them as routing devices with interlocks, not as live switching elements under heavy load.',
    phase2: 'Attach bus transfer switching sequences and interlock diagrams.',
  },
  busbar400: {
    name: '400 kV Main Bus',
    badge: 'B400',
    color: '#facc15',
    role:
      'Acts as the common high-voltage collection node tying line bays, transformer bays, reactor bays, and the bus coupler together.',
    importance:
      'Bus faults are severe because multiple bays are connected to a single conductive path. Bus protection and bus arrangement define overall station resilience.',
    watch:
      'The bus is not just a line on the drawing. It is a shared risk and a shared operating asset.',
    phase2: 'Attach bus differential logic and maintenance zoning drawings.',
  },
  coupler400: {
    name: '400 kV Bus Coupler',
    badge: 'BC',
    color: '#f59e0b',
    role:
      'Links Bus-1 and Bus-2 so power can move between sections, enabling bus transfer and contingency support.',
    importance:
      'It controls whether the 400 kV yard behaves like one node or two. That changes restoration options, fault spread, and maintenance flexibility.',
    watch:
      'This is topology control. Its state should visibly alter which paths are reachable in the simulation.',
    phase2: 'Attach bus split / bus parallel operating procedures.',
  },
  shuntReactor: {
    name: '400 kV Shunt Reactor',
    badge: 'SR',
    color: '#14b8a6',
    role:
      'Absorbs charging reactive power from long EHV lines, especially during light-load operation when the Ferranti effect pushes voltage upward.',
    importance:
      'It is the easiest way to show reactive power and bus-voltage control without faking load-flow detail.',
    watch:
      'Present it as a bus-voltage support device. It should improve voltage behavior at light load, not active power transfer.',
    phase2: 'Attach voltage-control philosophy and line charging studies.',
  },
  ict: {
    name: '400/220 kV ICT',
    badge: 'ICT',
    color: '#fb923c',
    role:
      'Steps bulk transmission voltage down to the 220 kV network and couples the upstream EHV system to the downstream subtransmission grid.',
    importance:
      'This is the bridge between incoming 400 kV power and outgoing 220 kV feeders. Without it, the station is only a switchyard, not a receiving node.',
    watch:
      'The ICT is where the "incoming to outgoing" story becomes complete. Include the HV bay, transformer body, and LV connection.',
    phase2: 'Attach transformer protections, OLTC notes, and tertiary / station service details.',
  },
  lvBreaker: {
    name: '220 kV Bay Breaker and Isolators',
    badge: '220',
    color: '#34d399',
    role:
      'Connect and protect the lower-voltage side of the ICT and each 220 kV outgoing feeder bay.',
    importance:
      'A complete end-to-end station model must show the outgoing side with the same discipline as the incoming side.',
    watch:
      'Do not stop at the transformer body. The receiving substation narrative finishes only after the outgoing 220 kV bays.',
    phase2: 'Attach feeder bay protection and 220 kV switching procedures.',
  },
  pt: {
    name: '220 kV PT / CVT',
    badge: 'PT',
    color: '#f9a8d4',
    role:
      'Supplies voltage signals for metering, synchronism check, and protection on the 220 kV side.',
    importance:
      'It makes the outgoing side measurable and operable, not just energizable.',
    watch:
      'Use it to teach that both ends of the transformer need measurement and protection assets.',
    phase2: 'Attach feeder metering and synchronization schemes.',
  },
  busbar220: {
    name: '220 kV Main Bus',
    badge: 'B220',
    color: '#fde68a',
    role:
      'Collects power from the ICT low-voltage side and dispatches it into outgoing 220 kV feeder bays.',
    importance:
      'This is the outgoing dispatch point. Without it, the station diagram ends too early and feels incomplete.',
    watch:
      'Show it as a separate bus layer, not as an extension of the 400 kV bus.',
    phase2: 'Attach 220 kV bus protection and sectionalizing logic.',
  },
  coupler220: {
    name: '220 kV Bus Coupler',
    badge: 'BC',
    color: '#fbbf24',
    role:
      'Parallels or splits the 220 kV buses so outgoing feeders can be re-fed or sectionalized during outages and maintenance.',
    importance:
      'It closes the operational loop on the lower-voltage side just as the 400 kV bus coupler does on the incoming side.',
    watch:
      'Use it to show how downstream feeders can survive transformer-side rearrangements.',
    phase2: 'Attach feeder restoration and bus split operating notes.',
  },
  stationService: {
    name: 'Station Service / Auxiliary Supply',
    badge: 'AUX',
    color: '#60a5fa',
    role:
      'Feeds battery chargers, cooling systems, lighting, control room panels, and substation auxiliaries from the transformer tertiary or dedicated service source.',
    importance:
      'Real substations need their own internal power ecosystem. It is often omitted in schematic-only explanations.',
    watch:
      'This is an ancillary system, but leaving it out makes the station feel abstract rather than operational.',
    phase2: 'Attach AC / DC auxiliary supply one-line diagrams.',
  },
  scada: {
    name: 'Relay Panels, SCADA, and Control House',
    badge: 'CTRL',
    color: '#38bdf8',
    role:
      'Collects measurement, alarms, sequence-of-events, interlocks, and control commands for the entire yard.',
    importance:
      'This is what turns a yard layout into an operable station. Without control and relay context, the diagram is physically complete but operationally silent.',
    watch:
      'Use it to tie equipment cards to future hyperlinks, manuals, relay schemes, and SOPs.',
    phase2: 'Attach relay panel indexes, SCADA point lists, and SOP references.',
  },
};

const BAY_TEMPLATES = {
  line400: {
    name: '400 kV line bay anatomy',
    description:
      'Representative AIS line-bay order from incoming transmission line to the 400 kV bus.',
    equipment: [
      'gantry',
      'lineTrap',
      'cvt',
      'surgeArrester',
      'lineIsolator',
      'ct',
      'sf6Breaker',
      'busSelector',
      'busbar400',
    ],
  },
  coupler400: {
    name: '400 kV bus coupler anatomy',
    description:
      'The coupler bay is built around controlled interconnection between Bus-1 and Bus-2.',
    equipment: ['busbar400', 'busSelector', 'ct', 'sf6Breaker', 'ct', 'busSelector', 'busbar400'],
  },
  reactor400: {
    name: '400 kV reactor bay anatomy',
    description:
      'A reactor bay connects to the bus and mainly exists to shape reactive power and voltage behavior.',
    equipment: ['busbar400', 'busSelector', 'ct', 'sf6Breaker', 'shuntReactor'],
  },
  ict400to220: {
    name: '400/220 kV ICT bay anatomy',
    description:
      'This is the receiving-station path that actually converts incoming EHV power into outgoing 220 kV supply.',
    equipment: [
      'busbar400',
      'busSelector',
      'ct',
      'sf6Breaker',
      'surgeArrester',
      'ict',
      'stationService',
      'lvBreaker',
      'busbar220',
    ],
  },
  feeder220: {
    name: '220 kV outgoing feeder bay anatomy',
    description:
      'The outgoing side needs its own interruption, isolation, measurement, and surge-protection chain.',
    equipment: [
      'busbar220',
      'lvBreaker',
      'ct',
      'pt',
      'surgeArrester',
      'lineIsolator',
      'gantry',
    ],
  },
  coupler220: {
    name: '220 kV bus coupler anatomy',
    description:
      'The lower-voltage bus coupler manages restoration and feeder rearrangement on the dispatch side.',
    equipment: ['busbar220', 'lvBreaker', 'ct', 'coupler220', 'busbar220'],
  },
};

const STATION_LAYOUT = {
  line1: { x: 140 },
  line2: { x: 330 },
  line3: { x: 520 },
  line4: { x: 710 },
  coupler400: { x: 910 },
  reactor1: { x: 1070 },
  ict1: { x: 1310 },
  ict2: { x: 1500 },
  feeder1: { x: 1130 },
  feeder2: { x: 1310 },
  feeder3: { x: 1490 },
  feeder4: { x: 1670 },
  coupler220: { x: 1760 },
  bus400_1: { y: 300 },
  bus400_2: { y: 350 },
  bus220_1: { y: 620 },
  bus220_2: { y: 670 },
};

const SCENARIOS = {
  normal: {
    label: 'Normal Receiving Duty',
    summary:
      'All four incomers are available, both ICTs share load, buses are paralleled, and the reactor is left out unless light-load voltage demands it.',
    loadPct: 82,
    reactorMode: 'auto',
    apply: () => {},
    timeline: [
      'Incoming 400 kV lines terminate at line gantries and enter their line bays.',
      'Line bays collect on the double 400 kV bus via bus selector isolators.',
      'Both ICTs transfer power down to the 220 kV buses.',
      'Outgoing 220 kV feeder bays dispatch load to the downstream grid.',
    ],
  },
  lightLoad: {
    label: 'Light Load / Ferranti Control',
    summary:
      'Demand is low, line charging becomes more visible, and the shunt reactor is intentionally kept in service to pull voltage back toward nominal.',
    loadPct: 48,
    reactorMode: 'on',
    apply: () => {},
    timeline: [
      'Lower real-power demand reduces transformer loading.',
      'Long 400 kV incomers still contribute capacitive charging Mvar.',
      'The bus reactor is kept in service to absorb excess reactive power.',
      '400 kV voltage stays closer to nominal instead of floating upward.',
    ],
  },
  lineOutage: {
    label: 'One 400 kV Incomer Out',
    summary:
      'A single incoming line bay is removed from service, so the remaining corridors pick up the import share.',
    loadPct: 86,
    reactorMode: 'off',
    apply: (cfg) => {
      cfg.service.line2 = false;
    },
    timeline: [
      'East incomer is isolated and its breaker path is unavailable.',
      'The remaining live incomers carry the station import.',
      'Both ICTs remain available, so outgoing supply is maintained.',
      'Line loading and corridor sharing become the main operator focus.',
    ],
  },
  ictOutage: {
    label: 'ICT-1 Outage',
    summary:
      'One transformer path is unavailable, so the remaining ICT becomes the bottleneck between the 400 kV yard and 220 kV feeders.',
    loadPct: 88,
    reactorMode: 'off',
    apply: (cfg) => {
      cfg.service.ict1 = false;
    },
    timeline: [
      'ICT-1 breaker path is unavailable on the transfer path to 220 kV.',
      'ICT-2 becomes the sole transformation path for downstream load.',
      'Outgoing feeders remain energized only if the 220 kV bus arrangement still has a live route.',
      'Transformer loading becomes the governing metric rather than line capacity.',
    ],
  },
  busMaintenance: {
    label: 'Bus-1 Maintenance Transfer',
    summary:
      'Bus-1 side circuits are intentionally transferred to Bus-2 so Bus-1 can be isolated for maintenance without losing the station.',
    loadPct: 74,
    reactorMode: 'on',
    apply: (cfg) => {
      cfg.assignments.line1.bus400 = 'bus400_2';
      cfg.assignments.line2.bus400 = 'bus400_2';
      cfg.assignments.ict1.hvBus = 'bus400_2';
      cfg.assignments.ict1.lvBus = 'bus220_2';
      cfg.assignments.feeder1.bus220 = 'bus220_2';
      cfg.assignments.feeder2.bus220 = 'bus220_2';
      cfg.service.coupler400 = false;
      cfg.service.coupler220 = false;
    },
    timeline: [
      'Selected bays are re-routed using bus selector isolators.',
      'Bus-1 is cleared and held out for maintenance.',
      'Bus-2 carries the remaining station duty as a single energized section.',
      'This scenario demonstrates why bus selector bays are so valuable in AIS yards.',
    ],
  },
  splitBus: {
    label: 'Split Bus Operation',
    summary:
      'The station is intentionally sectionalized, with each transformer and feeder group tied to its own bus section.',
    loadPct: 78,
    reactorMode: 'off',
    apply: (cfg) => {
      cfg.service.coupler400 = false;
      cfg.service.coupler220 = false;
    },
    timeline: [
      '400 kV Bus-1 and Bus-2 operate as separate sections.',
      'ICT-1 feeds the first 220 kV section and ICT-2 feeds the second.',
      'A fault or outage on one section stays local, but flexibility is reduced.',
      'The route tracer clearly shows where topology islands appear.',
    ],
  },
};

const METHOD_ROWS = [
  {
    title: '1. Separate topology from equipment anatomy',
    body:
      'Use one view for the full substation topology and another for the detailed bay sequence. A single drawing that tries to do both usually becomes unreadable.',
  },
  {
    title: '2. Model only defensible electrical behavior',
    body:
      'Use simple power-balance, transformer-sharing, line-charging, reactor, and bus-voltage approximations. Avoid fake arc or fault physics unless you are specifically teaching breaker or protection dynamics.',
  },
  {
    title: '3. Make every device clickable',
    body:
      'Every equipment card should answer three questions: what it does, why it matters, and what operators must not confuse it with.',
  },
  {
    title: '4. Build phase-2 link slots into the data',
    body:
      'Keep a placeholder for OEM manuals, protection drawings, SOPs, and utility standards on every equipment item so hyperlinks can be attached later without redesigning the simulation.',
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatMW(value) {
  return `${value.toFixed(1)} MW`;
}

function formatMvar(value) {
  return `${value.toFixed(1)} Mvar`;
}

function formatKV(value) {
  return value > 0 ? `${value.toFixed(1)} kV` : '0 kV';
}

function formatPct(value) {
  return `${value.toFixed(0)}%`;
}

function makeBaseConfig() {
  return {
    assignments: {
      line1: { bus400: LINE_BAYS[0].defaultBus },
      line2: { bus400: LINE_BAYS[1].defaultBus },
      line3: { bus400: LINE_BAYS[2].defaultBus },
      line4: { bus400: LINE_BAYS[3].defaultBus },
      ict1: { hvBus: ICT_BAYS[0].defaultHvBus, lvBus: ICT_BAYS[0].defaultLvBus },
      ict2: { hvBus: ICT_BAYS[1].defaultHvBus, lvBus: ICT_BAYS[1].defaultLvBus },
      feeder1: { bus220: FEEDER_BAYS[0].defaultBus },
      feeder2: { bus220: FEEDER_BAYS[1].defaultBus },
      feeder3: { bus220: FEEDER_BAYS[2].defaultBus },
      feeder4: { bus220: FEEDER_BAYS[3].defaultBus },
      reactor1: { bus400: REACTOR.defaultBus },
    },
    service: {
      line1: true,
      line2: true,
      line3: true,
      line4: true,
      ict1: true,
      ict2: true,
      feeder1: true,
      feeder2: true,
      feeder3: true,
      feeder4: true,
      coupler400: true,
      coupler220: true,
    },
  };
}

function getScenarioState(scenarioKey, loadPct, overrides) {
  const scenario = SCENARIOS[scenarioKey];
  const cfg = makeBaseConfig();
  scenario.apply(cfg);
  const autoReactor = scenario.reactorMode === 'auto' ? loadPct < 60 : scenario.reactorMode === 'on';

  return {
    scenario,
    cfg,
    coupler400Closed:
      overrides.coupler400 === null ? cfg.service.coupler400 : overrides.coupler400,
    coupler220Closed:
      overrides.coupler220 === null ? cfg.service.coupler220 : overrides.coupler220,
    reactorInService:
      overrides.reactor === null ? autoReactor : overrides.reactor,
  };
}

function buildActiveEdges(cfgState) {
  const edges = [];

  LINE_BAYS.forEach((line) => {
    if (!cfgState.cfg.service[line.id]) return;
    const bus = cfgState.cfg.assignments[line.id].bus400;
    const x = STATION_LAYOUT[line.id].x;
    const yBus = STATION_LAYOUT[bus].y;
    edges.push({
      id: line.id,
      kind: 'line',
      entityId: line.id,
      a: `src_${line.id}`,
      b: bus,
      path: `M${x},86 L${x},210 L${x},${yBus}`,
    });
  });

  if (cfgState.coupler400Closed) {
    const x = STATION_LAYOUT.coupler400.x;
    edges.push({
      id: 'coupler400',
      kind: 'coupler400',
      entityId: 'coupler400',
      a: 'bus400_1',
      b: 'bus400_2',
      path: `M${x},${STATION_LAYOUT.bus400_1.y} L${x},${STATION_LAYOUT.bus400_2.y}`,
    });
  }

  if (cfgState.reactorInService) {
    const bus = cfgState.cfg.assignments.reactor1.bus400;
    const x = STATION_LAYOUT.reactor1.x;
    const yBus = STATION_LAYOUT[bus].y;
    edges.push({
      id: 'reactor1',
      kind: 'reactor',
      entityId: 'reactor1',
      a: bus,
      b: 'sink_reactor1',
      path: `M${x},${yBus} L${x},472`,
    });
  }

  ICT_BAYS.forEach((ict) => {
    if (!cfgState.cfg.service[ict.id]) return;
    const x = STATION_LAYOUT[ict.id].x;
    const hvBus = cfgState.cfg.assignments[ict.id].hvBus;
    const lvBus = cfgState.cfg.assignments[ict.id].lvBus;
    edges.push({
      id: ict.id,
      kind: 'ict',
      entityId: ict.id,
      a: hvBus,
      b: lvBus,
      path: `M${x},${STATION_LAYOUT[hvBus].y} L${x},476 L${x},${STATION_LAYOUT[lvBus].y}`,
    });
  });

  if (cfgState.coupler220Closed) {
    const x = STATION_LAYOUT.coupler220.x;
    edges.push({
      id: 'coupler220',
      kind: 'coupler220',
      entityId: 'coupler220',
      a: 'bus220_1',
      b: 'bus220_2',
      path: `M${x},${STATION_LAYOUT.bus220_1.y} L${x},${STATION_LAYOUT.bus220_2.y}`,
    });
  }

  FEEDER_BAYS.forEach((feeder) => {
    if (!cfgState.cfg.service[feeder.id]) return;
    const x = STATION_LAYOUT[feeder.id].x;
    const bus = cfgState.cfg.assignments[feeder.id].bus220;
    edges.push({
      id: feeder.id,
      kind: 'feeder',
      entityId: feeder.id,
      a: bus,
      b: `load_${feeder.id}`,
      path: `M${x},${STATION_LAYOUT[bus].y} L${x},850`,
    });
  });

  return edges;
}

function buildGraph(edges) {
  const adjacency = {};
  edges.forEach((edge) => {
    if (!adjacency[edge.a]) adjacency[edge.a] = [];
    if (!adjacency[edge.b]) adjacency[edge.b] = [];
    adjacency[edge.a].push({ node: edge.b, edgeId: edge.id });
    adjacency[edge.b].push({ node: edge.a, edgeId: edge.id });
  });
  return adjacency;
}

function findConnectedComponents(adjacency) {
  const nodeComponent = {};
  const components = [];
  let index = 0;

  Object.keys(adjacency).forEach((start) => {
    if (nodeComponent[start] !== undefined) return;
    const queue = [start];
    nodeComponent[start] = index;
    const nodes = [];
    while (queue.length) {
      const current = queue.shift();
      nodes.push(current);
      adjacency[current].forEach((next) => {
        if (nodeComponent[next.node] !== undefined) return;
        nodeComponent[next.node] = index;
        queue.push(next.node);
      });
    }
    components.push({ id: index, nodes });
    index += 1;
  });

  return { nodeComponent, components };
}

function findPath(adjacency, source, target) {
  if (!adjacency[source] || !adjacency[target]) return null;
  const queue = [source];
  const seen = new Set([source]);
  const prev = {};

  while (queue.length) {
    const node = queue.shift();
    if (node === target) break;
    adjacency[node].forEach((next) => {
      if (seen.has(next.node)) return;
      seen.add(next.node);
      prev[next.node] = { node, edgeId: next.edgeId };
      queue.push(next.node);
    });
  }

  if (!seen.has(target)) return null;
  const edgeIds = [];
  let cursor = target;
  while (cursor !== source) {
    const step = prev[cursor];
    edgeIds.unshift(step.edgeId);
    cursor = step.node;
  }
  return edgeIds;
}

function deriveModel(scenarioKey, loadPct, pf, overrides, sourceId, loadId) {
  const cfgState = getScenarioState(scenarioKey, loadPct, overrides);
  const edges = buildActiveEdges(cfgState);
  const adjacency = buildGraph(edges);
  const { nodeComponent, components } = findConnectedComponents(adjacency);
  const pfAngle = Math.acos(pf);
  const componentMap = {};

  components.forEach((component) => {
    const lineIds = LINE_BAYS.filter((line) => component.nodes.includes(`src_${line.id}`)).map(
      (line) => line.id
    );
    const feederIds = FEEDER_BAYS.filter((feeder) => component.nodes.includes(`load_${feeder.id}`)).map(
      (feeder) => feeder.id
    );
    const ictIds = ICT_BAYS.filter((ict) => {
      if (!cfgState.cfg.service[ict.id]) return false;
      return component.nodes.includes(cfgState.cfg.assignments[ict.id].hvBus)
        && component.nodes.includes(cfgState.cfg.assignments[ict.id].lvBus);
    }).map((ict) => ict.id);
    const hasReactor = component.nodes.includes('sink_reactor1');

    const hasSources = lineIds.length > 0;
    const hasTransformation = ictIds.length > 0;
    const energized = hasSources && hasTransformation;

    const demandMW = feederIds.reduce((sum, feederId) => {
      const feeder = FEEDER_BAYS.find((item) => item.id === feederId);
      return sum + feeder.baseMW * (loadPct / 100);
    }, 0);
    const servedMW = energized ? demandMW : 0;
    const demandMvar = energized ? servedMW * Math.tan(pfAngle) : 0;
    const lossesMW = energized ? servedMW * 0.008 : 0;
    const importMW = servedMW + lossesMW;
    const apparentMVA = energized && pf > 0 ? servedMW / pf : 0;
    const lineChargingMvar = lineIds.reduce((sum, lineId) => {
      const line = LINE_BAYS.find((item) => item.id === lineId);
      return sum + line.lengthKm * 0.2;
    }, 0);
    const reactorAbsorbMvar = hasReactor ? REACTOR.ratingMvar : 0;
    const reactiveMismatch = lineChargingMvar - reactorAbsorbMvar - demandMvar;
    const bus400KV = energized
      ? clamp(400 * (1 + reactiveMismatch / 6000), 388, 418)
      : 0;
    const ictShare = ictIds.length ? apparentMVA / ictIds.length : 0;
    const avgIctLoading = ictIds.length
      ? ictShare / ICT_BAYS.find((item) => item.id === ictIds[0]).ratingMVA
      : 0;
    const bus220KV = energized
      ? clamp(
          220 * (1 + ((bus400KV / 400) - 1) * 0.42 - Math.max(0, avgIctLoading - 0.85) * 0.18),
          212,
          224
        )
      : 0;

    componentMap[component.id] = {
      ...component,
      lineIds,
      feederIds,
      ictIds,
      hasReactor,
      energized,
      demandMW,
      servedMW,
      demandMvar,
      lossesMW,
      importMW,
      apparentMVA,
      lineChargingMvar,
      reactorAbsorbMvar,
      reactiveMismatch,
      bus400KV,
      bus220KV,
    };
  });

  const lineMetrics = LINE_BAYS.map((line) => {
    const componentId = nodeComponent[`src_${line.id}`];
    const component = componentMap[componentId];
    const totalCapacity = component
      ? component.lineIds.reduce((sum, id) => {
          const row = LINE_BAYS.find((item) => item.id === id);
          return sum + row.capacityMW;
        }, 0)
      : 0;
    const shareMW =
      component && component.energized && totalCapacity > 0
        ? (component.importMW * line.capacityMW) / totalCapacity
        : 0;
    return {
      ...line,
      inService: cfgState.cfg.service[line.id],
      bus: cfgState.cfg.assignments[line.id].bus400,
      shareMW,
      loadingPct: line.capacityMW ? (shareMW / line.capacityMW) * 100 : 0,
      componentId,
      busKV: component ? component.bus400KV : 0,
      chargingMvar: line.lengthKm * 0.2,
    };
  });

  const ictMetrics = ICT_BAYS.map((ict) => {
    const hvBus = cfgState.cfg.assignments[ict.id].hvBus;
    const componentId = nodeComponent[hvBus];
    const component = componentMap[componentId];
    const shareMVA =
      component && component.energized && component.ictIds.length
        ? component.apparentMVA / component.ictIds.length
        : 0;
    return {
      ...ict,
      inService: cfgState.cfg.service[ict.id],
      hvBus,
      lvBus: cfgState.cfg.assignments[ict.id].lvBus,
      shareMVA,
      loadingPct: ict.ratingMVA ? (shareMVA / ict.ratingMVA) * 100 : 0,
      componentId,
    };
  });

  const feederMetrics = FEEDER_BAYS.map((feeder) => {
    const loadNode = `load_${feeder.id}`;
    const componentId = nodeComponent[loadNode];
    const component = componentMap[componentId];
    const energized = Boolean(component && component.energized);
    const demandMW = feeder.baseMW * (loadPct / 100);
    return {
      ...feeder,
      inService: cfgState.cfg.service[feeder.id],
      bus: cfgState.cfg.assignments[feeder.id].bus220,
      demandMW,
      energized,
      servedMW: energized ? demandMW : 0,
      busKV: component ? component.bus220KV : 0,
      componentId,
    };
  });

  const totalServedMW = feederMetrics.reduce((sum, feeder) => sum + feeder.servedMW, 0);
  const totalDemandMW = feederMetrics.reduce((sum, feeder) => sum + feeder.demandMW, 0);
  const totalReactiveLoadMvar = totalServedMW * Math.tan(pfAngle);
  const totalImportMW = lineMetrics.reduce((sum, line) => sum + line.shareMW, 0);
  const routeEdgeIds = findPath(adjacency, `src_${sourceId}`, `load_${loadId}`);

  return {
    cfgState,
    edges,
    adjacency,
    componentMap,
    nodeComponent,
    lineMetrics,
    ictMetrics,
    feederMetrics,
    totalServedMW,
    totalDemandMW,
    totalImportMW,
    totalReactiveLoadMvar,
    servedPct: totalDemandMW > 0 ? (totalServedMW / totalDemandMW) * 100 : 0,
    routeEdgeIds,
    routeReachable: Boolean(routeEdgeIds),
    bus400KV: {
      bus400_1: componentMap[nodeComponent.bus400_1]?.bus400KV || 0,
      bus400_2: componentMap[nodeComponent.bus400_2]?.bus400KV || 0,
    },
    bus220KV: {
      bus220_1: componentMap[nodeComponent.bus220_1]?.bus220KV || 0,
      bus220_2: componentMap[nodeComponent.bus220_2]?.bus220KV || 0,
    },
  };
}

function bayStatusTone(bayId, model) {
  if (bayId === 'coupler400') {
    return model.cfgState.coupler400Closed ? 'green' : 'amber';
  }
  if (bayId === 'coupler220') {
    return model.cfgState.coupler220Closed ? 'green' : 'amber';
  }
  if (bayId === 'reactor1') {
    return model.cfgState.reactorInService ? 'green' : 'amber';
  }
  const line = model.lineMetrics.find((item) => item.id === bayId);
  if (line) {
    if (!line.inService) return 'red';
    return line.loadingPct > 85 ? 'amber' : 'green';
  }
  const ict = model.ictMetrics.find((item) => item.id === bayId);
  if (ict) {
    if (!ict.inService) return 'red';
    return ict.loadingPct > 90 ? 'amber' : 'green';
  }
  const feeder = model.feederMetrics.find((item) => item.id === bayId);
  if (feeder) {
    if (!feeder.inService || !feeder.energized) return 'red';
    return 'green';
  }
  return 'blue';
}

function getBayContext(bayId, model) {
  const meta = BAY_META[bayId];
  if (!meta) return [];

  if (bayId === 'coupler400') {
    return [
      ['State', model.cfgState.coupler400Closed ? 'Closed' : 'Open'],
      ['Function', 'Parallels or splits 400 kV Bus-1 and Bus-2'],
      ['Impact', model.cfgState.coupler400Closed ? 'Both 400 kV buses can support each other' : '400 kV yard is sectionalized'],
    ];
  }

  if (bayId === 'coupler220') {
    return [
      ['State', model.cfgState.coupler220Closed ? 'Closed' : 'Open'],
      ['Function', 'Parallels or splits 220 kV Bus-1 and Bus-2'],
      ['Impact', model.cfgState.coupler220Closed ? 'Feeder groups can cross-support' : '220 kV sections are independent'],
    ];
  }

  if (bayId === 'reactor1') {
    const componentId = model.nodeComponent[model.cfgState.cfg.assignments.reactor1.bus400];
    const component = model.componentMap[componentId];
    return [
      ['State', model.cfgState.reactorInService ? 'In service' : 'Out of service'],
      ['Connection', model.cfgState.cfg.assignments.reactor1.bus400 === 'bus400_1' ? '400 kV Bus-1' : '400 kV Bus-2'],
      ['Bus voltage effect', component ? formatKV(component.bus400KV) : '0 kV'],
      ['Reactive duty', model.cfgState.reactorInService ? `${REACTOR.ratingMvar} Mvar absorbed` : '0 Mvar'],
    ];
  }

  const line = model.lineMetrics.find((item) => item.id === bayId);
  if (line) {
    return [
      ['State', line.inService ? 'Available' : 'Out of service'],
      ['Bus selection', line.bus === 'bus400_1' ? 'Bus-1' : 'Bus-2'],
      ['Import share', formatMW(line.shareMW)],
      ['Line loading', formatPct(line.loadingPct)],
      ['Charging contribution', formatMvar(line.chargingMvar)],
    ];
  }

  const ict = model.ictMetrics.find((item) => item.id === bayId);
  if (ict) {
    return [
      ['State', ict.inService ? 'Available' : 'Out of service'],
      ['HV side', ict.hvBus === 'bus400_1' ? '400 kV Bus-1' : '400 kV Bus-2'],
      ['LV side', ict.lvBus === 'bus220_1' ? '220 kV Bus-1' : '220 kV Bus-2'],
      ['Transformer share', `${ict.shareMVA.toFixed(1)} MVA`],
      ['Loading', formatPct(ict.loadingPct)],
    ];
  }

  const feeder = model.feederMetrics.find((item) => item.id === bayId);
  if (feeder) {
    return [
      ['State', feeder.energized ? 'Energized' : 'Not energized'],
      ['220 kV bus', feeder.bus === 'bus220_1' ? 'Bus-1' : 'Bus-2'],
      ['Demand', formatMW(feeder.demandMW)],
      ['Served', formatMW(feeder.servedMW)],
      ['Bus voltage', formatKV(feeder.busKV)],
    ];
  }

  return [];
}

function BayTag({ active, label, onClick, tone }) {
  return (
    <button style={S.tag(active, tone)} onClick={onClick}>
      {label}
    </button>
  );
}

function StatusPill({ tone, children }) {
  return <span style={S.statusPill(tone)}>{children}</span>;
}

function Metric({ label, value, hint }) {
  return (
    <div style={S.metricCard}>
      <div style={S.metricLabel}>{label}</div>
      <div style={S.metricValue}>{value}</div>
      <div style={S.metricHint}>{hint}</div>
    </div>
  );
}

function SectionCard({ title, subtitle, children, pill }) {
  return (
    <div style={S.card}>
      <div style={S.cardHead}>
        <div style={S.cardTitleWrap}>
          <div style={S.cardTitle}>{title}</div>
          {subtitle ? <div style={S.cardSub}>{subtitle}</div> : null}
        </div>
        {pill || null}
      </div>
      <div style={S.cardBody}>{children}</div>
    </div>
  );
}

function StationSvg({ model, selectedBayId, onSelectBay }) {
  const routeSet = new Set(model.routeEdgeIds || []);
  const energizedLineSet = new Set(
    model.lineMetrics.filter((item) => item.inService && item.shareMW > 0).map((item) => item.id)
  );
  const energizedIctSet = new Set(
    model.ictMetrics.filter((item) => item.inService && item.shareMVA > 0).map((item) => item.id)
  );
  const energizedFeederSet = new Set(
    model.feederMetrics.filter((item) => item.energized).map((item) => item.id)
  );

  const isActiveEdge = (edgeId) => {
    if (edgeId === 'coupler400') return model.cfgState.coupler400Closed;
    if (edgeId === 'coupler220') return model.cfgState.coupler220Closed;
    if (edgeId === 'reactor1') return model.cfgState.reactorInService;
    return energizedLineSet.has(edgeId) || energizedIctSet.has(edgeId) || energizedFeederSet.has(edgeId);
  };

  return (
    <svg viewBox="0 0 1840 940" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="busGlow400" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="busGlow220" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0.85" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="1840" height="940" fill="transparent" />
      {Array.from({ length: 24 }, (_, i) => (
        <line
          key={`gx-${i}`}
          x1={i * 80}
          y1="0"
          x2={i * 80}
          y2="940"
          stroke="#101015"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <line
          key={`gy-${i}`}
          x1="0"
          y1={i * 70}
          x2="1840"
          y2={i * 70}
          stroke="#101015"
          strokeWidth="1"
        />
      ))}

      <text x="920" y="34" textAnchor="middle" fill="#f4f4f5" fontSize="18" fontWeight="800">
        Representative 400 / 220 kV AIS Receiving Substation
      </text>
      <text x="920" y="56" textAnchor="middle" fill="#71717a" fontSize="11" fontWeight="700" letterSpacing="0.12em">
        OVERVIEW TOPOLOGY - INCOMING 400 KV LINES TO OUTGOING 220 KV FEEDERS
      </text>

      <rect x="34" y="78" width="790" height="150" rx="22" fill="rgba(16,16,22,0.8)" stroke="#232329" />
      <rect x="900" y="138" width="700" height="140" rx="22" fill="rgba(16,16,22,0.82)" stroke="#232329" />
      <rect x="1020" y="700" width="760" height="150" rx="22" fill="rgba(16,16,22,0.8)" stroke="#232329" />

      <text x="58" y="102" fill="#c7d2fe" fontSize="12" fontWeight="800" letterSpacing="0.08em">
        400 KV INCOMING LINE BAYS
      </text>
      <text x="924" y="162" fill="#c7d2fe" fontSize="12" fontWeight="800" letterSpacing="0.08em">
        TRANSFORMATION AND REACTIVE CONTROL
      </text>
      <text x="1044" y="724" fill="#bbf7d0" fontSize="12" fontWeight="800" letterSpacing="0.08em">
        220 KV OUTGOING FEEDER BAYS
      </text>

      <text x="60" y="290" fill="#38bdf8" fontSize="11" fontWeight="700" letterSpacing="0.08em">
        400 KV BUS-1
      </text>
      <text x="60" y="340" fill="#818cf8" fontSize="11" fontWeight="700" letterSpacing="0.08em">
        400 KV BUS-2
      </text>
      <line
        x1="90"
        y1={STATION_LAYOUT.bus400_1.y}
        x2="1600"
        y2={STATION_LAYOUT.bus400_1.y}
        stroke="url(#busGlow400)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <line
        x1="90"
        y1={STATION_LAYOUT.bus400_2.y}
        x2="1600"
        y2={STATION_LAYOUT.bus400_2.y}
        stroke="url(#busGlow400)"
        strokeWidth="8"
        strokeLinecap="round"
      />

      <text x="1040" y="610" fill="#86efac" fontSize="11" fontWeight="700" letterSpacing="0.08em">
        220 KV BUS-1
      </text>
      <text x="1040" y="660" fill="#facc15" fontSize="11" fontWeight="700" letterSpacing="0.08em">
        220 KV BUS-2
      </text>
      <line
        x1="1060"
        y1={STATION_LAYOUT.bus220_1.y}
        x2="1780"
        y2={STATION_LAYOUT.bus220_1.y}
        stroke="url(#busGlow220)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <line
        x1="1060"
        y1={STATION_LAYOUT.bus220_2.y}
        x2="1780"
        y2={STATION_LAYOUT.bus220_2.y}
        stroke="url(#busGlow220)"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {model.edges.map((edge) => (
        <g key={edge.id}>
          <path
            d={edge.path}
            fill="none"
            stroke={routeSet.has(edge.id) ? '#facc15' : isActiveEdge(edge.id) ? '#22c55e' : '#52525b'}
            strokeWidth={routeSet.has(edge.id) ? 6 : 4}
            strokeLinecap="round"
            opacity={routeSet.has(edge.id) ? 0.95 : isActiveEdge(edge.id) ? 0.68 : 0.35}
            filter={routeSet.has(edge.id) ? 'url(#glow)' : undefined}
          />
          {routeSet.has(edge.id) ? (
            <>
              <circle r="5" fill="#fde68a" filter="url(#glow)">
                <animateMotion dur="2.2s" repeatCount="indefinite" path={edge.path} />
              </circle>
              <circle r="3.5" fill="#ffffff" opacity="0.8">
                <animateMotion dur="2.2s" begin="1.1s" repeatCount="indefinite" path={edge.path} />
              </circle>
            </>
          ) : null}
        </g>
      ))}

      {LINE_BAYS.map((line) => {
        const x = STATION_LAYOUT[line.id].x;
        const selected = selectedBayId === line.id;
        const metric = model.lineMetrics.find((item) => item.id === line.id);
        const tone = bayStatusTone(line.id, model);
        const fill =
          tone === 'green'
            ? 'rgba(16,185,129,0.12)'
            : tone === 'amber'
              ? 'rgba(245,158,11,0.12)'
              : 'rgba(239,68,68,0.12)';
        const stroke =
          tone === 'green' ? '#22c55e' : tone === 'amber' ? '#f59e0b' : '#ef4444';
        return (
          <g
            key={line.id}
            onClick={() => onSelectBay(line.id)}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={x - 70}
              y="106"
              width="140"
              height="98"
              rx="18"
              fill={fill}
              stroke={selected ? '#fde68a' : stroke}
              strokeWidth={selected ? 2.6 : 1.5}
            />
            <text x={x} y="132" textAnchor="middle" fill="#fafafa" fontSize="13" fontWeight="800">
              {line.short}
            </text>
            <text x={x} y="152" textAnchor="middle" fill="#d4d4d8" fontSize="12" fontWeight="700">
              {line.name}
            </text>
            <text x={x} y="171" textAnchor="middle" fill="#71717a" fontSize="10" fontWeight="700">
              {line.corridor}
            </text>
            <text x={x} y="189" textAnchor="middle" fill="#a1a1aa" fontSize="10">
              LT - CVT - LA - DS - CT - CB
            </text>
            <text x={x} y="224" textAnchor="middle" fill="#52525b" fontSize="9" fontWeight="700">
              {metric?.bus === 'bus400_1' ? 'ON BUS-1' : 'ON BUS-2'}
            </text>
            <circle cx={x} cy="86" r="7" fill={stroke} opacity="0.85" />
          </g>
        );
      })}

      <g onClick={() => onSelectBay('coupler400')} style={{ cursor: 'pointer' }}>
        <rect
          x={STATION_LAYOUT.coupler400.x - 58}
          y="216"
          width="116"
          height="74"
          rx="18"
          fill={selectedBayId === 'coupler400' ? 'rgba(250,204,21,0.14)' : 'rgba(245,158,11,0.1)'}
          stroke={selectedBayId === 'coupler400' ? '#fde68a' : '#f59e0b'}
          strokeWidth={selectedBayId === 'coupler400' ? 2.5 : 1.5}
        />
        <text x={STATION_LAYOUT.coupler400.x} y="242" textAnchor="middle" fill="#fafafa" fontSize="13" fontWeight="800">
          400 kV Coupler
        </text>
        <text x={STATION_LAYOUT.coupler400.x} y="263" textAnchor="middle" fill="#a1a1aa" fontSize="11">
          CT - CB - CT
        </text>
        <text x={STATION_LAYOUT.coupler400.x} y="281" textAnchor="middle" fill="#71717a" fontSize="10" fontWeight="700">
          {model.cfgState.coupler400Closed ? 'CLOSED' : 'OPEN'}
        </text>
      </g>

      <g onClick={() => onSelectBay('reactor1')} style={{ cursor: 'pointer' }}>
        <rect
          x={STATION_LAYOUT.reactor1.x - 70}
          y="392"
          width="140"
          height="100"
          rx="18"
          fill={selectedBayId === 'reactor1' ? 'rgba(20,184,166,0.14)' : 'rgba(20,184,166,0.1)'}
          stroke={selectedBayId === 'reactor1' ? '#99f6e4' : '#14b8a6'}
          strokeWidth={selectedBayId === 'reactor1' ? 2.5 : 1.5}
        />
        <text x={STATION_LAYOUT.reactor1.x} y="420" textAnchor="middle" fill="#fafafa" fontSize="13" fontWeight="800">
          Bus Reactor
        </text>
        <text x={STATION_LAYOUT.reactor1.x} y="441" textAnchor="middle" fill="#d4d4d8" fontSize="12" fontWeight="700">
          125 Mvar
        </text>
        <text x={STATION_LAYOUT.reactor1.x} y="461" textAnchor="middle" fill="#71717a" fontSize="10">
          Reactor bay for light-load voltage control
        </text>
        <text x={STATION_LAYOUT.reactor1.x} y="482" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontWeight="700">
          {model.cfgState.reactorInService ? 'IN SERVICE' : 'OUT OF SERVICE'}
        </text>
      </g>

      {ICT_BAYS.map((ict) => {
        const x = STATION_LAYOUT[ict.id].x;
        const selected = selectedBayId === ict.id;
        const metric = model.ictMetrics.find((item) => item.id === ict.id);
        return (
          <g key={ict.id} onClick={() => onSelectBay(ict.id)} style={{ cursor: 'pointer' }}>
            <rect
              x={x - 78}
              y="386"
              width="156"
              height="128"
              rx="22"
              fill={metric?.inService ? 'rgba(251,146,60,0.1)' : 'rgba(239,68,68,0.12)'}
              stroke={selected ? '#fde68a' : metric?.inService ? '#fb923c' : '#ef4444'}
              strokeWidth={selected ? 2.5 : 1.5}
            />
            <text x={x} y="416" textAnchor="middle" fill="#fafafa" fontSize="13" fontWeight="800">
              {ict.name}
            </text>
            <text x={x} y="438" textAnchor="middle" fill="#d4d4d8" fontSize="12" fontWeight="700">
              400 / 220 kV - 315 MVA
            </text>
            <text x={x} y="459" textAnchor="middle" fill="#71717a" fontSize="10">
              HV bay, transformer body, LV dispatch
            </text>
            <text x={x} y="482" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontWeight="700">
              {metric?.hvBus === 'bus400_1' ? 'HV ON BUS-1' : 'HV ON BUS-2'} /{' '}
              {metric?.lvBus === 'bus220_1' ? 'LV TO BUS-1' : 'LV TO BUS-2'}
            </text>
            <text x={x} y="502" textAnchor="middle" fill="#f4f4f5" fontSize="10" fontWeight="800">
              {metric?.inService ? `${metric.loadingPct.toFixed(0)}% LOADING` : 'OUT OF SERVICE'}
            </text>
          </g>
        );
      })}

      <g>
        <rect x="1568" y="388" width="208" height="126" rx="22" fill="rgba(96,165,250,0.08)" stroke="#3b82f6" />
        <text x="1672" y="416" textAnchor="middle" fill="#fafafa" fontSize="13" fontWeight="800">
          Control House / Relay Panels
        </text>
        <text x="1672" y="438" textAnchor="middle" fill="#d4d4d8" fontSize="12">
          Protection, SCADA, metering, alarms
        </text>
        <text x="1672" y="461" textAnchor="middle" fill="#71717a" fontSize="10">
          Click the equipment cards for device-level explanation
        </text>
        <text x="1672" y="495" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="800">
          OPERATES THE WHOLE YARD
        </text>
      </g>

      <g>
        <rect x="1188" y="520" width="244" height="70" rx="18" fill="rgba(96,165,250,0.08)" stroke="#3b82f6" />
        <text x="1310" y="548" textAnchor="middle" fill="#fafafa" fontSize="12" fontWeight="800">
          Station Service / Auxiliary Supply
        </text>
        <text x="1310" y="568" textAnchor="middle" fill="#a1a1aa" fontSize="11">
          Battery chargers, cooling, lighting, control DC and AC auxiliaries
        </text>
        <line x1="1310" y1="520" x2="1310" y2="496" stroke="#60a5fa" strokeWidth="3" />
      </g>

      {FEEDER_BAYS.map((feeder) => {
        const x = STATION_LAYOUT[feeder.id].x;
        const selected = selectedBayId === feeder.id;
        const metric = model.feederMetrics.find((item) => item.id === feeder.id);
        const stroke = metric?.energized ? '#22c55e' : '#ef4444';
        return (
          <g key={feeder.id} onClick={() => onSelectBay(feeder.id)} style={{ cursor: 'pointer' }}>
            <rect
              x={x - 78}
              y="728"
              width="156"
              height="100"
              rx="20"
              fill={metric?.energized ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.12)'}
              stroke={selected ? '#fde68a' : stroke}
              strokeWidth={selected ? 2.5 : 1.5}
            />
            <text x={x} y="756" textAnchor="middle" fill="#fafafa" fontSize="13" fontWeight="800">
              {feeder.short}
            </text>
            <text x={x} y="777" textAnchor="middle" fill="#d4d4d8" fontSize="12" fontWeight="700">
              {feeder.name}
            </text>
            <text x={x} y="797" textAnchor="middle" fill="#71717a" fontSize="10">
              220 kV feeder bay with CB, CT, PT, LA and isolators
            </text>
            <text x={x} y="818" textAnchor="middle" fill="#f4f4f5" fontSize="10" fontWeight="800">
              {metric?.energized ? `${metric.servedMW.toFixed(1)} MW SERVED` : 'SUPPLY NOT AVAILABLE'}
            </text>
          </g>
        );
      })}

      <g onClick={() => onSelectBay('coupler220')} style={{ cursor: 'pointer' }}>
        <rect
          x={STATION_LAYOUT.coupler220.x - 54}
          y="574"
          width="108"
          height="76"
          rx="18"
          fill={selectedBayId === 'coupler220' ? 'rgba(250,204,21,0.14)' : 'rgba(250,204,21,0.08)'}
          stroke={selectedBayId === 'coupler220' ? '#fde68a' : '#facc15'}
          strokeWidth={selectedBayId === 'coupler220' ? 2.5 : 1.5}
        />
        <text x={STATION_LAYOUT.coupler220.x} y="601" textAnchor="middle" fill="#fafafa" fontSize="13" fontWeight="800">
          220 kV Coupler
        </text>
        <text x={STATION_LAYOUT.coupler220.x} y="622" textAnchor="middle" fill="#a1a1aa" fontSize="11">
          {model.cfgState.coupler220Closed ? 'CLOSED' : 'OPEN'}
        </text>
      </g>

      <g transform="translate(32,870)">
        <rect x="0" y="0" width="530" height="46" rx="14" fill="rgba(16,16,22,0.8)" stroke="#232329" />
        <circle cx="28" cy="23" r="6" fill="#22c55e" />
        <text x="42" y="27" fill="#a1a1aa" fontSize="11" fontWeight="700">
          energized bay path
        </text>
        <circle cx="176" cy="23" r="6" fill="#facc15" />
        <text x="190" y="27" fill="#a1a1aa" fontSize="11" fontWeight="700">
          traced route from selected source to selected feeder
        </text>
        <circle cx="414" cy="23" r="6" fill="#ef4444" />
        <text x="428" y="27" fill="#a1a1aa" fontSize="11" fontWeight="700">
          unavailable or de-energized path
        </text>
      </g>
    </svg>
  );
}

function BayAnatomy({ selectedBayId, selectedEquipmentId, onSelectEquipment, model }) {
  const template = BAY_TEMPLATES[BAY_META[selectedBayId]?.type] || BAY_TEMPLATES.line400;
  const equipmentId = template.equipment.includes(selectedEquipmentId)
    ? selectedEquipmentId
    : template.equipment[0];
  const equipment = EQUIPMENT[equipmentId];
  const context = getBayContext(selectedBayId, model);

  return (
    <SectionCard
      title={template.name}
      subtitle={template.description}
      pill={<StatusPill tone={bayStatusTone(selectedBayId, model)}>Selected bay: {BAY_META[selectedBayId]?.name}</StatusPill>}
    >
      <div style={S.sequence}>
        {template.equipment.map((id, index) => {
          const item = EQUIPMENT[id];
          const active = equipmentId === id;
          return (
            <div
              key={`${selectedBayId}-${id}-${index}`}
              style={S.sequenceCard(active, `${item.color}88`)}
              onClick={() => onSelectEquipment(id)}
            >
              <div style={S.sequenceBadge(item.color)}>{item.badge}</div>
              <div style={S.sequenceName}>{item.name}</div>
              <div style={S.sequenceText}>
                {index === 0 ? 'Bay entry or common reference point.' : 'Click for role and importance.'}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ ...S.detailGrid, marginTop: 16 }}>
        <div style={S.detailBox}>
          <div style={S.detailLabel}>Selected equipment</div>
          <div style={S.detailLead}>{equipment.role}</div>
          <div style={S.detailPara}>{equipment.importance}</div>
          <div style={S.detailPara}>
            <strong style={{ color: '#fafafa' }}>Design caution:</strong> {equipment.watch}
          </div>
          <div style={{ ...S.note, marginTop: 14 }}>
            <strong>Phase 2 hook:</strong> {equipment.phase2}
          </div>
        </div>

        <div style={S.detailBox}>
          <div style={S.detailLabel}>Live bay context</div>
          {context.map(([label, value]) => (
            <div key={`${selectedBayId}-${label}`} style={S.keyValue}>
              <span style={S.kvLabel}>{label}</span>
              <span style={S.kvValue}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

function OverviewTab({
  model,
  selectedBayId,
  setSelectedBayId,
  selectedEquipmentId,
  setSelectedEquipmentId,
  sourceId,
  setSourceId,
  loadId,
  setLoadId,
}) {
  const scenario = model.cfgState.scenario;
  const selectedLine = LINE_BAYS.find((item) => item.id === sourceId);
  const selectedFeeder = FEEDER_BAYS.find((item) => item.id === loadId);
  const routeText = model.routeReachable
    ? `${selectedLine.name} -> ${
        model.lineMetrics.find((item) => item.id === selectedLine.id)?.bus === 'bus400_1'
          ? '400 kV Bus-1'
          : '400 kV Bus-2'
      } -> transformation path -> ${
        model.feederMetrics.find((item) => item.id === selectedFeeder.id)?.bus === 'bus220_1'
          ? '220 kV Bus-1'
          : '220 kV Bus-2'
      } -> ${selectedFeeder.name}`
    : `${selectedLine.name} does not currently have a live route to ${selectedFeeder.name}. Topology or outages block the path.`;

  return (
    <>
      <SectionCard
        title="Station overview"
        subtitle="This top-level yard diagram shows the incoming 400 kV line bays, double 400 kV buses, bus coupler, shunt reactor, two ICT bays, double 220 kV buses, and outgoing feeder bays."
        pill={<StatusPill tone="blue">{scenario.label}</StatusPill>}
      >
        <StationSvg model={model} selectedBayId={selectedBayId} onSelectBay={setSelectedBayId} />
      </SectionCard>

      <div style={S.twoCol}>
        <SectionCard
          title="System snapshot"
          subtitle="These planning-level values are intentionally simple and traceable. They explain the station, not replace detailed load-flow software."
        >
          <div style={S.metricGrid}>
            <Metric
              label="Served load"
              value={formatMW(model.totalServedMW)}
              hint={`${formatPct(model.servedPct)} of requested 220 kV feeder demand is currently being served.`}
            />
            <Metric
              label="Reactive load"
              value={formatMvar(model.totalReactiveLoadMvar)}
              hint="Lagging reactive demand is reflected through the ICTs into the 400 kV yard."
            />
            <Metric
              label="400 kV buses"
              value={`${formatKV(model.bus400KV.bus400_1)} / ${formatKV(model.bus400KV.bus400_2)}`}
              hint="Bus voltage is shaped mainly by line charging, reactor duty, and downstream reactive demand."
            />
            <Metric
              label="220 kV buses"
              value={`${formatKV(model.bus220KV.bus220_1)} / ${formatKV(model.bus220KV.bus220_2)}`}
              hint="The lower-voltage side reflects transformer sharing and the current bus arrangement."
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Route tracer"
          subtitle="Pick a source line and an outgoing feeder. The highlighted path shows whether the present topology supports that route."
          pill={<StatusPill tone={model.routeReachable ? 'green' : 'red'}>{model.routeReachable ? 'Route available' : 'Route blocked'}</StatusPill>}
        >
          <div style={S.split}>
            <div style={S.controlGroup}>
              <div style={S.controlLabel}>Incoming source</div>
              <select style={S.select} value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
                {LINE_BAYS.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={S.controlGroup}>
              <div style={S.controlLabel}>Outgoing feeder</div>
              <select style={S.select} value={loadId} onChange={(e) => setLoadId(e.target.value)}>
                {FEEDER_BAYS.map((feeder) => (
                  <option key={feeder.id} value={feeder.id}>
                    {feeder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ ...S.routeBox, marginTop: 14 }}>
            <div style={S.pathText}>{routeText}</div>
          </div>
        </SectionCard>
      </div>

      <div style={S.twoCol}>
        <BayAnatomy
          selectedBayId={selectedBayId}
          selectedEquipmentId={selectedEquipmentId}
          onSelectEquipment={setSelectedEquipmentId}
          model={model}
        />

        <SectionCard
          title="Selected bay details"
          subtitle={`${BAY_META[selectedBayId]?.family || 'Bay'} metrics and why this bay matters inside the station.`}
        >
          <div style={S.list}>
            {getBayContext(selectedBayId, model).map(([label, value]) => (
              <div key={`${selectedBayId}-${label}`} style={S.rowCard}>
                <div style={S.rowTitle}>{label}</div>
                <div style={S.rowMeta}>{value}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function OperationsTab({ model }) {
  const scenario = model.cfgState.scenario;

  return (
    <div style={S.twoCol}>
      <SectionCard
        title="Operating story"
        subtitle="These steps describe how the chosen scenario changes the station topology and loading picture."
        pill={<StatusPill tone="blue">{scenario.label}</StatusPill>}
      >
        <div style={S.list}>
          {scenario.timeline.map((step, index) => (
            <div key={step} style={S.rowCard}>
              <div style={S.rowTitle}>Step {index + 1}</div>
              <div style={S.rowMeta}>{step}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Live bay loading"
        subtitle="The station-level model is intentionally narrow: power balance, ICT sharing, line charging, and bus-voltage tendencies."
      >
        <div style={S.detailLabel}>400 kV incomers</div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Bay</th>
              <th style={S.th}>Bus</th>
              <th style={S.th}>Import share</th>
              <th style={S.th}>Loading</th>
            </tr>
          </thead>
          <tbody>
            {model.lineMetrics.map((line) => (
              <tr key={line.id}>
                <td style={S.td}>{line.name}</td>
                <td style={S.td}>{line.bus === 'bus400_1' ? 'Bus-1' : 'Bus-2'}</td>
                <td style={S.td}>{line.inService ? formatMW(line.shareMW) : 'Out of service'}</td>
                <td style={S.td}>{line.inService ? formatPct(line.loadingPct) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ ...S.detailLabel, marginTop: 16 }}>ICT loading</div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>ICT</th>
              <th style={S.th}>HV / LV bus</th>
              <th style={S.th}>Share</th>
              <th style={S.th}>Loading</th>
            </tr>
          </thead>
          <tbody>
            {model.ictMetrics.map((ict) => (
              <tr key={ict.id}>
                <td style={S.td}>{ict.name}</td>
                <td style={S.td}>
                  {ict.hvBus === 'bus400_1' ? '400 Bus-1' : '400 Bus-2'} /{' '}
                  {ict.lvBus === 'bus220_1' ? '220 Bus-1' : '220 Bus-2'}
                </td>
                <td style={S.td}>{ict.inService ? `${ict.shareMVA.toFixed(1)} MVA` : 'Out of service'}</td>
                <td style={S.td}>{ict.inService ? formatPct(ict.loadingPct) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}

function MethodTab() {
  return (
    <div style={S.twoCol}>
      <SectionCard
        title="Best way to build this kind of simulation"
        subtitle="For a complete AIS substation, the strongest approach is layered: topology first, bay anatomy second, operating scenarios third."
      >
        <div style={S.list}>
          {METHOD_ROWS.map((row) => (
            <div key={row.title} style={S.rowCard}>
              <div style={S.rowTitle}>{row.title}</div>
              <div style={S.rowMeta}>{row.body}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Modeling boundary"
        subtitle="This file deliberately avoids pretending to be a detailed transient solver."
      >
        <div style={S.detailBox}>
          <div style={S.detailLead}>
            The sim models a representative 400 / 220 kV AIS receiving station with double buses on both voltage levels.
          </div>
          <ul style={S.bulletList}>
            <li style={S.bullet}>It is a topology and operations teaching model, not a civil general arrangement drawing.</li>
            <li style={S.bullet}>Bus voltage reacts to line charging, shunt reactor duty, and lagging feeder demand using a stated approximation.</li>
            <li style={S.bullet}>Transformer loading is shared by live ICT paths in the connected section of the graph.</li>
            <li style={S.bullet}>Future phase-2 links can be attached per equipment object without changing the UI structure.</li>
          </ul>
          <div style={{ ...S.note, marginTop: 14 }}>
            Actual 400 kV layouts vary by utility and age: double-main, main-and-transfer, and breaker-and-half schemes all exist. This simulator intentionally chooses one clear instructional arrangement instead of pretending there is only one universal yard.
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function EquipmentLibraryTab({ selectedEquipmentId, setSelectedEquipmentId }) {
  const current = EQUIPMENT[selectedEquipmentId];

  return (
    <div style={S.twoCol}>
      <SectionCard
        title="Equipment library"
        subtitle="Every item in the station is clickable so the sim can teach role, importance, and what operators should not confuse it with."
      >
        <div style={S.tagRow}>
          {Object.entries(EQUIPMENT).map(([id, item]) => (
            <BayTag
              key={id}
              active={selectedEquipmentId === id}
              label={item.name}
              tone="green"
              onClick={() => setSelectedEquipmentId(id)}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={current.name}
        subtitle="This card format is ready for phase-2 hyperlinks to OEM manuals, standards, drawings, or SOPs."
        pill={<StatusPill tone="green">{current.badge}</StatusPill>}
      >
        <div style={S.detailBox}>
          <div style={S.detailLead}>{current.role}</div>
          <div style={S.detailPara}>{current.importance}</div>
          <div style={S.detailPara}>
            <strong style={{ color: '#fafafa' }}>Design caution:</strong> {current.watch}
          </div>
          <div style={{ ...S.note, marginTop: 14 }}>
            <strong>Phase 2 link placeholder:</strong> {current.phase2}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export default function AISDigitalTwin400kV() {
  const [tab, setTab] = useState('overview');
  const [scenarioKey, setScenarioKey] = useState('normal');
  const [loadPct, setLoadPct] = useState(SCENARIOS.normal.loadPct);
  const [pfPct, setPfPct] = useState(95);
  const [selectedBayId, setSelectedBayId] = useState('ict1');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('ict');
  const [sourceId, setSourceId] = useState('line1');
  const [loadId, setLoadId] = useState('feeder1');
  const [overrides, setOverrides] = useState({
    reactor: null,
    coupler400: null,
    coupler220: null,
  });

  const model = useMemo(
    () => deriveModel(scenarioKey, loadPct, pfPct / 100, overrides, sourceId, loadId),
    [scenarioKey, loadPct, pfPct, overrides, sourceId, loadId]
  );

  useEffect(() => {
    const template = BAY_TEMPLATES[BAY_META[selectedBayId]?.type];
    if (!template) return;
    if (!template.equipment.includes(selectedEquipmentId)) {
      setSelectedEquipmentId(template.equipment[0]);
    }
  }, [selectedBayId, selectedEquipmentId]);

  const applyScenario = (key) => {
    setScenarioKey(key);
    setLoadPct(SCENARIOS[key].loadPct);
    setOverrides({
      reactor: null,
      coupler400: null,
      coupler220: null,
    });
  };

  return (
    <div style={S.container}>
      <div style={S.hero}>
        <h1 style={S.title}>400 kV AIS Digital Twin</h1>
        <p style={S.subtitle}>
          A complete teaching model of a 400 / 220 kV air-insulated receiving substation. It follows a
          representative double-bus AIS arrangement from incoming 400 kV line bays, through the bus
          system and transformer bays, down to outgoing 220 kV feeder bays. The goal is clarity: full
          station topology, readable bay anatomy, and a stated electrical model that does not fake
          detailed physics.
        </p>
        <div style={S.bannerRow}>
          <div style={S.banner('blue')}>Incoming to outgoing story is complete</div>
          <div style={S.banner('green')}>Every major equipment group is clickable</div>
          <div style={S.banner('pink')}>Phase-2 hyperlink slots are already designed in</div>
        </div>
      </div>

      <div style={S.tabBar}>
        {[
          ['overview', 'Overview'],
          ['operations', 'Operations'],
          ['equipment', 'Equipment'],
          ['method', 'Method'],
        ].map(([id, label]) => (
          <button key={id} style={S.tab(tab === id)} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      <div style={S.controls}>
        <div style={S.controlGroup}>
          <div style={S.controlLabel}>Station loading</div>
          <div style={S.sliderWrap}>
            <input
              style={S.slider}
              type="range"
              min="35"
              max="110"
              value={loadPct}
              onChange={(e) => setLoadPct(Number(e.target.value))}
            />
            <span style={S.smallValue}>{loadPct}%</span>
          </div>
        </div>

        <div style={S.controlGroup}>
          <div style={S.controlLabel}>Power factor</div>
          <div style={S.sliderWrap}>
            <input
              style={S.slider}
              type="range"
              min="90"
              max="100"
              value={pfPct}
              onChange={(e) => setPfPct(Number(e.target.value))}
            />
            <span style={S.smallValue}>{(pfPct / 100).toFixed(2)}</span>
          </div>
        </div>

        <div style={S.controlGroup}>
          <div style={S.controlLabel}>400 kV coupler</div>
          <div style={S.toggleRow}>
            <button
              style={S.toggleBtn(model.cfgState.coupler400Closed, 'green')}
              onClick={() =>
                setOverrides((prev) => ({
                  ...prev,
                  coupler400: !(prev.coupler400 === null ? model.cfgState.coupler400Closed : prev.coupler400),
                }))
              }
            >
              {model.cfgState.coupler400Closed ? 'Closed' : 'Open'}
            </button>
          </div>
        </div>

        <div style={S.controlGroup}>
          <div style={S.controlLabel}>220 kV coupler</div>
          <div style={S.toggleRow}>
            <button
              style={S.toggleBtn(model.cfgState.coupler220Closed, 'green')}
              onClick={() =>
                setOverrides((prev) => ({
                  ...prev,
                  coupler220: !(prev.coupler220 === null ? model.cfgState.coupler220Closed : prev.coupler220),
                }))
              }
            >
              {model.cfgState.coupler220Closed ? 'Closed' : 'Open'}
            </button>
          </div>
        </div>

        <div style={S.controlGroup}>
          <div style={S.controlLabel}>Shunt reactor</div>
          <div style={S.toggleRow}>
            <button
              style={S.toggleBtn(model.cfgState.reactorInService, 'green')}
              onClick={() =>
                setOverrides((prev) => ({
                  ...prev,
                  reactor: !(prev.reactor === null ? model.cfgState.reactorInService : prev.reactor),
                }))
              }
            >
              {model.cfgState.reactorInService ? 'In service' : 'Out'}
            </button>
          </div>
        </div>
      </div>

      <div style={S.scenarioStrip}>
        {Object.entries(SCENARIOS).map(([id, scenario]) => (
          <button key={id} style={S.scenarioBtn(scenarioKey === id)} onClick={() => applyScenario(id)}>
            <div style={S.scenarioTitle}>{scenario.label}</div>
            <div style={S.scenarioBody}>{scenario.summary}</div>
          </button>
        ))}
      </div>

      <div style={S.content}>
        {tab === 'overview' ? (
          <OverviewTab
            model={model}
            selectedBayId={selectedBayId}
            setSelectedBayId={setSelectedBayId}
            selectedEquipmentId={selectedEquipmentId}
            setSelectedEquipmentId={setSelectedEquipmentId}
            sourceId={sourceId}
            setSourceId={setSourceId}
            loadId={loadId}
            setLoadId={setLoadId}
          />
        ) : null}

        {tab === 'operations' ? <OperationsTab model={model} /> : null}

        {tab === 'equipment' ? (
          <EquipmentLibraryTab
            selectedEquipmentId={selectedEquipmentId}
            setSelectedEquipmentId={setSelectedEquipmentId}
          />
        ) : null}

        {tab === 'method' ? <MethodTab /> : null}
      </div>

      <div style={S.foot}>
        This simulator models a representative 400 / 220 kV AIS layout commonly used for teaching
        receiving-substation concepts. It is intentionally not a utility-specific construction drawing
        and intentionally not an EMT-grade study tool.
      </div>
    </div>
  );
}
