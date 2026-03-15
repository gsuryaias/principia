import React, { useEffect, useMemo, useState } from 'react';

const C = {
  bg: '#09090b',
  panel: '#111115',
  panel2: '#16161d',
  border: '#24242b',
  text: '#f4f4f5',
  muted: '#a1a1aa',
  dim: '#71717a',
  faint: '#3f3f46',
  power: '#facc15',
  reactive: '#22d3ee',
  bus: '#818cf8',
  breaker: '#22c55e',
  isolator: '#a3e635',
  ct: '#38bdf8',
  vt: '#f472b6',
  arrester: '#fb7185',
  trap: '#c4b5fd',
  ict: '#fb923c',
  reactor: '#14b8a6',
  gantry: '#d4d4d8',
  off: '#ef4444',
  select: '#fde68a',
};

const S = {
  container: {
    minHeight: 'calc(100vh - 3.5rem)',
    background:
      'radial-gradient(circle at top left, rgba(129,140,248,0.1), transparent 22%), radial-gradient(circle at top right, rgba(34,211,238,0.08), transparent 18%), #09090b',
    color: C.text,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    padding: '18px 22px 14px',
    borderBottom: `1px solid ${C.border}`,
    background: 'rgba(10,10,14,0.92)',
  },
  titleRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: '-0.03em',
  },
  hint: {
    marginTop: 8,
    fontSize: 13,
    color: C.muted,
    lineHeight: 1.6,
  },
  pillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: (tone) => ({
    padding: '7px 10px',
    borderRadius: 999,
    border:
      tone === 'power'
        ? `1px solid ${C.power}55`
        : tone === 'reactive'
          ? `1px solid ${C.reactive}55`
          : tone === 'bus'
            ? `1px solid ${C.bus}55`
            : `1px solid ${C.border}`,
    background:
      tone === 'power'
        ? 'rgba(250,204,21,0.12)'
        : tone === 'reactive'
          ? 'rgba(34,211,238,0.12)'
          : tone === 'bus'
            ? 'rgba(129,140,248,0.12)'
            : 'rgba(24,24,27,0.9)',
    color:
      tone === 'power'
        ? '#fde68a'
        : tone === 'reactive'
          ? '#a5f3fc'
          : tone === 'bus'
            ? '#c7d2fe'
            : C.muted,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.04em',
  }),
  tabBar: {
    display: 'flex',
    gap: 6,
    padding: '12px 22px',
    borderBottom: `1px solid ${C.border}`,
    background: 'rgba(12,12,17,0.9)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backdropFilter: 'blur(12px)',
  },
  tab: (active) => ({
    padding: '9px 14px',
    borderRadius: 12,
    border: active ? `1px solid ${C.bus}66` : `1px solid ${C.border}`,
    background: active ? 'rgba(129,140,248,0.14)' : 'rgba(20,20,24,0.86)',
    color: active ? '#e0e7ff' : C.muted,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 800,
  }),
  controls: {
    padding: '14px 22px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  strip: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    color: C.dim,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 800,
  },
  scenarioBtn: (active) => ({
    padding: '9px 12px',
    borderRadius: 12,
    border: active ? `1px solid ${C.bus}66` : `1px solid ${C.border}`,
    background: active ? 'rgba(129,140,248,0.14)' : 'rgba(21,21,26,0.86)',
    color: active ? '#e0e7ff' : C.muted,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 800,
  }),
  sliderBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 12,
    border: `1px solid ${C.border}`,
    background: 'rgba(18,18,22,0.92)',
  },
  slider: {
    width: 124,
    accentColor: C.bus,
    cursor: 'pointer',
  },
  value: {
    minWidth: 54,
    textAlign: 'right',
    color: C.text,
    fontSize: 12,
    fontWeight: 800,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  toggle: (active, color) => ({
    padding: '10px 12px',
    borderRadius: 12,
    border: active ? `1px solid ${color}66` : `1px solid ${C.border}`,
    background: active ? `${color}20` : 'rgba(18,18,22,0.92)',
    color: active ? color : C.muted,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 800,
  }),
  chip: (active, color) => ({
    padding: '8px 10px',
    borderRadius: 999,
    border: active ? `1px solid ${color}66` : `1px solid ${C.border}`,
    background: active ? `${color}20` : 'rgba(18,18,22,0.9)',
    color: active ? color : C.muted,
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.04em',
  }),
  page: {
    padding: '14px 22px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  card: {
    background: 'linear-gradient(180deg, rgba(18,18,22,0.96), rgba(11,11,14,0.98))',
    border: `1px solid ${C.border}`,
    borderRadius: 22,
    overflow: 'hidden',
    boxShadow: '0 24px 80px rgba(0,0,0,0.28)',
  },
  cardHead: {
    padding: '14px 16px 10px',
    borderBottom: `1px solid ${C.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 800,
  },
  cardSub: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 1.6,
  },
  cardBody: {
    padding: 12,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr 0.9fr',
    gap: 14,
  },
  infoCard: {
    padding: 14,
    borderRadius: 16,
    border: `1px solid ${C.border}`,
    background: 'rgba(13,13,17,0.95)',
  },
  infoTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: C.dim,
    fontWeight: 800,
  },
  infoName: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 800,
    color: C.text,
  },
  infoMeta: {
    marginTop: 8,
    fontSize: 12,
    color: C.muted,
    lineHeight: 1.6,
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    marginTop: 10,
  },
  metric: {
    padding: 12,
    borderRadius: 14,
    border: `1px solid ${C.border}`,
    background: 'rgba(17,17,22,0.95)',
  },
  metricLabel: {
    fontSize: 10,
    color: C.dim,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 800,
  },
  metricValue: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: 800,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  miniList: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  miniRow: {
    padding: '10px 12px',
    borderRadius: 12,
    border: `1px solid ${C.border}`,
    background: 'rgba(17,17,21,0.94)',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    fontSize: 12,
  },
  actionWrap: {
    marginTop: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  actionGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  actionBtn: (active, color = C.bus) => ({
    padding: '8px 10px',
    borderRadius: 10,
    border: active ? `1px solid ${color}66` : `1px solid ${C.border}`,
    background: active ? `${color}20` : 'rgba(17,17,21,0.94)',
    color: active ? color : C.muted,
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.04em',
  }),
  actionLabel: {
    fontSize: 10,
    color: C.dim,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 800,
    minWidth: 88,
  },
  alertBox: {
    padding: '11px 12px',
    borderRadius: 12,
    border: `1px solid ${C.border}`,
    background: 'rgba(17,17,21,0.94)',
    fontSize: 12,
    lineHeight: 1.6,
    color: C.muted,
  },
  theory: {
    flex: 1,
    padding: '32px 24px',
    maxWidth: 900,
    margin: '0 auto',
    width: '100%',
    overflowY: 'auto',
  },
  h2: {
    fontSize: 22,
    fontWeight: 700,
    color: '#f4f4f5',
    margin: '36px 0 14px',
    paddingBottom: 8,
    borderBottom: '1px solid #27272a',
  },
  h3: {
    fontSize: 17,
    fontWeight: 600,
    color: '#e4e4e7',
    margin: '24px 0 10px',
  },
  p: {
    fontSize: 15,
    lineHeight: 1.8,
    color: '#a1a1aa',
    margin: '0 0 14px',
  },
  eq: {
    display: 'block',
    padding: '14px 20px',
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: 12,
    fontFamily: 'monospace',
    fontSize: 15,
    color: '#c4b5fd',
    margin: '16px 0',
    textAlign: 'center',
    overflowX: 'auto',
  },
  ctx: {
    padding: '16px 20px',
    background: 'rgba(99,102,241,0.06)',
    borderLeft: '3px solid #6366f1',
    borderRadius: '0 12px 12px 0',
    margin: '20px 0',
  },
  ctxT: {
    fontWeight: 600,
    color: '#818cf8',
    marginBottom: 6,
    fontSize: 14,
    display: 'block',
  },
  ctxP: {
    fontSize: 14,
    lineHeight: 1.7,
    color: '#a1a1aa',
    margin: 0,
  },
  ul: {
    paddingLeft: 20,
    margin: '10px 0',
  },
  li: {
    fontSize: 14,
    lineHeight: 1.8,
    color: '#a1a1aa',
    marginBottom: 4,
  },
  tbl: {
    width: '100%',
    borderCollapse: 'collapse',
    margin: '16px 0',
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '2px solid #3f3f46',
    color: '#d4d4d8',
    fontWeight: 600,
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid #27272a',
    color: '#a1a1aa',
    verticalAlign: 'top',
  },
  theoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 14,
  },
  theoryText: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 1.65,
    color: C.muted,
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  panelGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  buttonGrid: (columns = 2) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: 8,
  }),
  sliderStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginTop: 10,
  },
  compactSliderBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '12px 12px 10px',
    borderRadius: 14,
    border: `1px solid ${C.border}`,
    background: 'rgba(18,18,22,0.92)',
  },
  compactSliderHead: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
  },
  wrapRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  diagramFooter: {
    padding: '0 12px 12px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 10,
  },
  commandBox: {
    padding: '12px 12px',
    borderRadius: 14,
    border: `1px solid ${C.border}`,
    background: 'rgba(13,13,18,0.96)',
    fontSize: 12,
    lineHeight: 1.6,
    color: C.text,
  },
  commandLabel: {
    display: 'block',
    marginBottom: 6,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: C.dim,
    fontWeight: 800,
  },
  controlGrid: (compact) => ({
    display: 'grid',
    gridTemplateColumns: compact ? 'minmax(0, 1fr)' : 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: 12,
    alignItems: 'start',
  }),
  controlCard: {
    padding: 14,
    borderRadius: 18,
    border: `1px solid ${C.border}`,
    background: 'rgba(13,13,17,0.95)',
  },
  diagramStage: {
    position: 'relative',
  },
  floatingToast: (compact) => ({
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: compact ? 'calc(100% - 32px)' : 320,
    pointerEvents: 'none',
  }),
  dockGrid: (compact, medium) => ({
    display: 'grid',
    gridTemplateColumns: compact ? 'minmax(0, 1fr)' : medium ? 'repeat(2, minmax(0, 1fr))' : '1.15fr 0.95fr 0.95fr',
    gap: 14,
    alignItems: 'start',
  }),
  dockLead: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 1.6,
  },
};

const LINE_BAYS = [
  { id: 'line1', short: 'L1', name: 'North Incomer', corridor: 'Raichur', lengthKm: 210, capacityMW: 300, bus: 'bus400_1' },
  { id: 'line2', short: 'L2', name: 'East Incomer', corridor: 'Warangal', lengthKm: 260, capacityMW: 320, bus: 'bus400_1' },
  { id: 'line3', short: 'L3', name: 'South Incomer', corridor: 'Kurnool', lengthKm: 310, capacityMW: 350, bus: 'bus400_2' },
  { id: 'line4', short: 'L4', name: 'West Incomer', corridor: 'Hyderabad', lengthKm: 240, capacityMW: 340, bus: 'bus400_2' },
];

const ICTS = [
  { id: 'ict1', short: 'T1', name: 'ICT-1', ratingMVA: 315, hvBus: 'bus400_1', lvBus: 'bus220_1' },
  { id: 'ict2', short: 'T2', name: 'ICT-2', ratingMVA: 315, hvBus: 'bus400_2', lvBus: 'bus220_2' },
];

const FEEDERS = [
  { id: 'feeder1', short: 'F1', name: 'Metro West', baseMW: 120, bus: 'bus220_1' },
  { id: 'feeder2', short: 'F2', name: 'Industrial', baseMW: 140, bus: 'bus220_1' },
  { id: 'feeder3', short: 'F3', name: 'Urban Ring', baseMW: 110, bus: 'bus220_2' },
  { id: 'feeder4', short: 'F4', name: 'Bulk Supply', baseMW: 95, bus: 'bus220_2' },
];

const REACTOR = { id: 'reactor1', ratingMvar: 125, bus: 'bus400_2' };
const SQRT3 = Math.sqrt(3);
const LOAD_PROFILE = [
  0.58, 0.54, 0.51, 0.5, 0.52, 0.58, 0.68, 0.8, 0.9, 0.95, 0.98, 1.0,
  0.98, 0.96, 0.94, 0.97, 1.02, 1.08, 1.12, 1.1, 1.02, 0.9, 0.78, 0.66,
];

const FAMILY = {
  gantry: {
    short: 'GANTRY',
    color: C.gantry,
    name: 'Line Gantry',
    role: 'Mechanical termination and clearance point for the overhead line.',
    why: 'This is where the external line physically becomes yard equipment.',
    rating: '400 kV yard entry structure',
  },
  trap: {
    short: 'WT',
    color: C.trap,
    name: 'Wave Trap',
    role: 'Blocks PLCC carrier frequencies from spilling into the bus.',
    why: 'Useful for line communication and teleprotection channels.',
    rating: '400 kV line-trap set',
  },
  cvt: {
    short: 'CVT',
    color: C.vt,
    name: 'CVT',
    role: 'Provides voltage signals for metering, protection, and carrier coupling.',
    why: 'Distance relays and metering need this voltage reference on EHV line bays.',
    rating: '400 kV CVT / CCVT',
  },
  pt: {
    short: 'PT',
    color: C.vt,
    name: 'PT / VT',
    role: 'Measures bus or feeder voltage on the 220 kV side.',
    why: 'Makes the outgoing side visible to meters and relays.',
    rating: '220 kV voltage transformer',
  },
  arrester: {
    short: 'LA',
    color: C.arrester,
    name: 'Surge Arrester',
    role: 'Clamps lightning and switching surges to a safe insulation level.',
    why: 'Without it, transformer and bus insulation margins are much weaker.',
    rating: 'ZnO arrester set',
  },
  isolator: {
    short: 'DS',
    color: C.isolator,
    name: 'Isolator / Disconnector',
    role: 'Provides visible isolation after the breaker interrupts the current.',
    why: 'Operators need visible air-gap isolation for maintenance safety.',
    rating: 'Motorized disconnector',
  },
  selector: {
    short: 'BUS SEL',
    color: C.bus,
    name: 'Bus Selector',
    role: 'Routes a bay to Bus-1 or Bus-2 in the double-bus arrangement.',
    why: 'This is what makes maintenance transfer and sectionalizing possible.',
    rating: 'Double-bus isolator set',
  },
  ct: {
    short: 'CT',
    color: C.ct,
    name: 'Current Transformer',
    role: 'Feeds current to relays, meters, and event recorders.',
    why: 'Protection logic only knows the primary current through the CT secondary.',
    rating: 'Protection and metering CT',
  },
  breaker: {
    short: 'CB',
    color: C.breaker,
    name: 'SF6 Circuit Breaker',
    role: 'Interrupts load current and fault current.',
    why: 'This is the bay device that actually clears faults.',
    rating: '420 kV / 40 kA class',
  },
  bus: {
    short: 'BUS',
    color: C.bus,
    name: 'Main Bus',
    role: 'Common node tying line bays, transformer bays, and couplers together.',
    why: 'It creates flexibility, but also a shared fault zone.',
    rating: '400 kV or 220 kV busbar',
  },
  coupler: {
    short: 'BC',
    color: C.power,
    name: 'Bus Coupler',
    role: 'Connects Bus-1 and Bus-2 when the station needs a common section.',
    why: 'It controls whether the yard behaves like one section or two.',
    rating: 'Bus coupler bay',
  },
  ict: {
    short: 'ICT',
    color: C.ict,
    name: 'Interconnecting Transformer',
    role: 'Transfers bulk power from 400 kV to 220 kV.',
    why: 'Without the ICT, the yard only switches power and does not deliver it downstream.',
    rating: '400/220 kV, 315 MVA',
  },
  reactor: {
    short: 'SR',
    color: C.reactor,
    name: 'Shunt Reactor',
    role: 'Absorbs charging Mvar from long EHV lines during light load.',
    why: 'It controls overvoltage and makes Ferranti behavior visible in the yard.',
    rating: '125 Mvar, 400 kV',
  },
  feeder: {
    short: 'OUT',
    color: C.power,
    name: 'Outgoing Feeder',
    role: 'Exports the transformed power into the downstream 220 kV grid.',
    why: 'This is the dispatch end of the receiving substation story.',
    rating: '220 kV line bay',
  },
  control: {
    short: 'CTRL',
    color: C.reactive,
    name: 'Control House',
    role: 'Collects protection, metering, alarms, SCADA, and switching control.',
    why: 'The yard is physically complete without it, but not operationally complete.',
    rating: 'Relay and SCADA panels',
  },
};

const FAMILY_ORDER = [
  'gantry',
  'trap',
  'cvt',
  'arrester',
  'isolator',
  'selector',
  'ct',
  'breaker',
  'ict',
  'reactor',
];

const SCENARIOS = {
  normal: {
    label: 'Normal',
    loadPct: 82,
    hour: 18,
    reactor: 'auto',
    apply: () => {},
  },
  light: {
    label: 'Light Load',
    loadPct: 48,
    hour: 2,
    reactor: 'on',
    apply: () => {},
  },
  lineOut: {
    label: 'Line Out',
    loadPct: 86,
    hour: 19,
    reactor: 'off',
    apply: (cfg) => {
      cfg.service.line2 = false;
    },
  },
  ictOut: {
    label: 'ICT Out',
    loadPct: 88,
    hour: 20,
    reactor: 'off',
    apply: (cfg) => {
      cfg.service.ict1 = false;
    },
  },
  transfer: {
    label: 'Bus Transfer',
    loadPct: 72,
    hour: 10,
    reactor: 'on',
    apply: (cfg) => {
      cfg.assignments.line1.bus400 = 'bus400_2';
      cfg.assignments.line2.bus400 = 'bus400_2';
      cfg.service.coupler400 = false;
    },
  },
  split: {
    label: 'Split Bus',
    loadPct: 78,
    hour: 17,
    reactor: 'off',
    apply: (cfg) => {
      cfg.service.coupler400 = false;
      cfg.service.coupler220 = false;
    },
  },
};

const LAYOUT = {
  width: 1820,
  height: 1160,
  bus400_1_y: 380,
  bus400_2_y: 438,
  bus220_1_y: 834,
  bus220_2_y: 892,
  lineX: [150, 315, 480, 645],
  coupler400X: 820,
  reactorX: 920,
  ictX: [1110, 1285],
  feederX: [1060, 1225, 1450, 1615],
  coupler220X: 1730,
};

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

function formatCurrent(value) {
  return value >= 1000 ? `${(value / 1000).toFixed(2)} kA` : `${value.toFixed(0)} A`;
}

function formatMVA(value) {
  return `${value.toFixed(1)} MVA`;
}

function formatHour(hour) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const value = hour % 12 || 12;
  return `${value}:00 ${suffix}`;
}

function makeBaseConfig() {
  return {
    assignments: {
      line1: { bus400: LINE_BAYS[0].bus },
      line2: { bus400: LINE_BAYS[1].bus },
      line3: { bus400: LINE_BAYS[2].bus },
      line4: { bus400: LINE_BAYS[3].bus },
      ict1: { hvBus: ICTS[0].hvBus, lvBus: ICTS[0].lvBus },
      ict2: { hvBus: ICTS[1].hvBus, lvBus: ICTS[1].lvBus },
      feeder1: { bus220: FEEDERS[0].bus },
      feeder2: { bus220: FEEDERS[1].bus },
      feeder3: { bus220: FEEDERS[2].bus },
      feeder4: { bus220: FEEDERS[3].bus },
      reactor1: { bus400: REACTOR.bus },
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

function getScenarioState(scenarioKey, loadPct, overrides, assignmentOverrides, serviceOverrides) {
  const scenario = SCENARIOS[scenarioKey];
  const cfg = makeBaseConfig();
  scenario.apply(cfg);
  Object.entries(assignmentOverrides || {}).forEach(([key, value]) => {
    if (!cfg.assignments[key]) return;
    cfg.assignments[key] = { ...cfg.assignments[key], ...value };
  });
  Object.entries(serviceOverrides || {}).forEach(([key, value]) => {
    if (cfg.service[key] === undefined) return;
    cfg.service[key] = value;
  });
  const defaultReactor = scenario.reactor === 'auto' ? loadPct < 60 : scenario.reactor === 'on';

  return {
    scenario,
    cfg,
    reactorInService: overrides.reactor === null ? defaultReactor : overrides.reactor,
    coupler400Closed: overrides.coupler400 === null ? cfg.service.coupler400 : overrides.coupler400,
    coupler220Closed: overrides.coupler220 === null ? cfg.service.coupler220 : overrides.coupler220,
  };
}

function buildActiveEdges(state) {
  const edges = [];

  LINE_BAYS.forEach((line) => {
    if (!state.cfg.service[line.id]) return;
    edges.push({
      id: line.id,
      a: `src_${line.id}`,
      b: state.cfg.assignments[line.id].bus400,
    });
  });

  if (state.coupler400Closed) {
    edges.push({ id: 'coupler400', a: 'bus400_1', b: 'bus400_2' });
  }

  if (state.reactorInService) {
    edges.push({ id: 'reactor1', a: state.cfg.assignments.reactor1.bus400, b: 'sink_reactor1' });
  }

  ICTS.forEach((ict) => {
    if (!state.cfg.service[ict.id]) return;
    edges.push({
      id: ict.id,
      a: state.cfg.assignments[ict.id].hvBus,
      b: state.cfg.assignments[ict.id].lvBus,
    });
  });

  if (state.coupler220Closed) {
    edges.push({ id: 'coupler220', a: 'bus220_1', b: 'bus220_2' });
  }

  FEEDERS.forEach((feeder) => {
    if (!state.cfg.service[feeder.id]) return;
    edges.push({
      id: feeder.id,
      a: state.cfg.assignments[feeder.id].bus220,
      b: `load_${feeder.id}`,
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

function findComponents(adjacency) {
  const nodeComponent = {};
  const components = [];
  let index = 0;

  Object.keys(adjacency).forEach((root) => {
    if (nodeComponent[root] !== undefined) return;
    const queue = [root];
    nodeComponent[root] = index;
    const nodes = [];

    while (queue.length) {
      const node = queue.shift();
      nodes.push(node);
      adjacency[node].forEach((next) => {
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

function deriveModel(scenarioKey, loadPct, pf, overrides, assignmentOverrides, serviceOverrides) {
  const state = getScenarioState(scenarioKey, loadPct, overrides, assignmentOverrides, serviceOverrides);
  const edges = buildActiveEdges(state);
  const adjacency = buildGraph(edges);
  const { nodeComponent, components } = findComponents(adjacency);
  const pfAngle = Math.acos(pf);
  const componentMap = {};

  components.forEach((component) => {
    const lineIds = LINE_BAYS.filter((line) => component.nodes.includes(`src_${line.id}`)).map((line) => line.id);
    const feederIds = FEEDERS.filter((feeder) => component.nodes.includes(`load_${feeder.id}`)).map((feeder) => feeder.id);
    const ictIds = ICTS.filter((ict) => {
      if (!state.cfg.service[ict.id]) return false;
      return component.nodes.includes(state.cfg.assignments[ict.id].hvBus)
        && component.nodes.includes(state.cfg.assignments[ict.id].lvBus);
    }).map((ict) => ict.id);
    const hasReactor = component.nodes.includes('sink_reactor1');

    const hasSources = lineIds.length > 0;
    const hasTransformation = ictIds.length > 0;
    const energized = hasSources && hasTransformation;

    const demandMW = feederIds.reduce((sum, feederId) => {
      const feeder = FEEDERS.find((row) => row.id === feederId);
      return sum + feeder.baseMW * (loadPct / 100);
    }, 0);
    const servedMW = energized ? demandMW : 0;
    const demandMvar = energized ? servedMW * Math.tan(pfAngle) : 0;
    const lossesMW = energized ? servedMW * 0.008 : 0;
    const importMW = servedMW + lossesMW;
    const lineChargingMvar = lineIds.reduce((sum, lineId) => {
      const line = LINE_BAYS.find((row) => row.id === lineId);
      return sum + line.lengthKm * 0.2;
    }, 0);
    const reactorAbsorbMvar = hasReactor ? REACTOR.ratingMvar : 0;
    const reactiveMismatch = lineChargingMvar - reactorAbsorbMvar - demandMvar;
    const bus400KV = energized
      ? clamp(400 * (1 + reactiveMismatch / 6000), 388, 418)
      : 0;
    const apparentMVA = energized && pf > 0 ? servedMW / pf : 0;
    const ictShare = ictIds.length ? apparentMVA / ictIds.length : 0;
    const avgIctLoading = ictIds.length ? ictShare / 315 : 0;
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
      lineChargingMvar,
      reactorAbsorbMvar,
      reactiveMismatch,
      bus400KV,
      bus220KV,
      apparentMVA,
    };
  });

  const lineMetrics = LINE_BAYS.map((line) => {
    const componentId = nodeComponent[`src_${line.id}`];
    const component = componentMap[componentId];
    const totalCapacity = component
      ? component.lineIds.reduce((sum, id) => sum + LINE_BAYS.find((row) => row.id === id).capacityMW, 0)
      : 0;
    const shareMW =
      component && component.energized && totalCapacity > 0
        ? (component.importMW * line.capacityMW) / totalCapacity
        : 0;
    return {
      ...line,
      inService: state.cfg.service[line.id],
      selectedBus: state.cfg.assignments[line.id].bus400,
      shareMW,
      loadingPct: line.capacityMW ? (shareMW / line.capacityMW) * 100 : 0,
      currentA: shareMW > 0 ? (shareMW * 1000) / (SQRT3 * 400 * pf) : 0,
      chargingMvar: line.lengthKm * 0.2,
      componentId,
      busKV: component?.bus400KV || 0,
    };
  });

  const ictMetrics = ICTS.map((ict) => {
    const componentId = nodeComponent[state.cfg.assignments[ict.id].hvBus];
    const component = componentMap[componentId];
    const shareMVA =
      component && component.energized && component.ictIds.length
        ? component.apparentMVA / component.ictIds.length
        : 0;
    return {
      ...ict,
      inService: state.cfg.service[ict.id],
      hvBus: state.cfg.assignments[ict.id].hvBus,
      lvBus: state.cfg.assignments[ict.id].lvBus,
      shareMVA,
      loadingPct: ict.ratingMVA ? (shareMVA / ict.ratingMVA) * 100 : 0,
      hvCurrentA: shareMVA > 0 ? (shareMVA * 1000) / (SQRT3 * 400) : 0,
      lvCurrentA: shareMVA > 0 ? (shareMVA * 1000) / (SQRT3 * 220) : 0,
    };
  });

  const feederMetrics = FEEDERS.map((feeder) => {
    const componentId = nodeComponent[`load_${feeder.id}`];
    const component = componentMap[componentId];
    const energized = Boolean(component?.energized);
    const demandMW = feeder.baseMW * (loadPct / 100);
    return {
      ...feeder,
      inService: state.cfg.service[feeder.id],
      selectedBus: state.cfg.assignments[feeder.id].bus220,
      demandMW,
      servedMW: energized ? demandMW : 0,
      energized,
      currentA: energized ? (demandMW * 1000) / (SQRT3 * 220 * pf) : 0,
      busKV: component?.bus220KV || 0,
    };
  });

  const totalServedMW = feederMetrics.reduce((sum, feeder) => sum + feeder.servedMW, 0);
  const totalDemandMW = feederMetrics.reduce((sum, feeder) => sum + feeder.demandMW, 0);
  const totalReactiveMvar = totalServedMW * Math.tan(pfAngle);

  return {
    state,
    componentMap,
    nodeComponent,
    lineMetrics,
    ictMetrics,
    feederMetrics,
    bus400KV: {
      bus400_1: componentMap[nodeComponent.bus400_1]?.bus400KV || 0,
      bus400_2: componentMap[nodeComponent.bus400_2]?.bus400KV || 0,
    },
    bus220KV: {
      bus220_1: componentMap[nodeComponent.bus220_1]?.bus220KV || 0,
      bus220_2: componentMap[nodeComponent.bus220_2]?.bus220KV || 0,
    },
    totalServedMW,
    totalDemandMW,
    servedPct: totalDemandMW > 0 ? (totalServedMW / totalDemandMW) * 100 : 0,
    totalReactiveMvar,
    totalImportMW: lineMetrics.reduce((sum, line) => sum + line.shareMW, 0),
  };
}

function makeSelection(family, instance) {
  return {
    family,
    ...FAMILY[family],
    ...instance,
  };
}

function resolveSelectionEntity(selection) {
  if (!selection?.id) return { kind: 'unknown', entityId: null };
  if (selection.id.startsWith('line')) return { kind: 'line', entityId: selection.id.split('-')[0] };
  if (selection.id.startsWith('ict')) return { kind: 'ict', entityId: selection.id.split('-')[0] };
  if (selection.id.startsWith('feeder')) return { kind: 'feeder', entityId: selection.id.split('-')[0] };
  if (selection.id.startsWith('reactor')) return { kind: 'reactor', entityId: 'reactor1' };
  if (selection.id.startsWith('coupler400')) return { kind: 'coupler400', entityId: 'coupler400' };
  if (selection.id.startsWith('coupler220')) return { kind: 'coupler220', entityId: 'coupler220' };
  if (selection.id === 'control-house') return { kind: 'control', entityId: 'control-house' };
  return { kind: 'unknown', entityId: selection.id };
}

function buildSelectionDetails(selection, model, effectiveLoadPct, hour) {
  const resolved = resolveSelectionEntity(selection);
  const base = {
    title: selection.label,
    state: 'Informational',
    tone: selection.color || C.bus,
    metrics: [],
    insight: `${selection.role} ${selection.why}`,
  };

  if (resolved.kind === 'line') {
    const line = model.lineMetrics.find((row) => row.id === resolved.entityId);
    if (!line) return base;
    const metrics = [
      ['Bay state', line.inService ? 'In service' : 'Out of service'],
      ['Selected bus', line.selectedBus === 'bus400_1' ? '400-B1' : '400-B2'],
      ['Bus voltage', formatKV(line.busKV)],
      ['Import share', formatMW(line.shareMW)],
      ['Current', formatCurrent(line.currentA)],
      ['Charging', formatMvar(line.chargingMvar)],
    ];
    if (selection.family === 'cvt') metrics[3] = ['Measured voltage', formatKV(line.busKV)];
    if (selection.family === 'ct') metrics[4] = ['Measured current', formatCurrent(line.currentA)];
    if (selection.family === 'breaker') metrics[0] = ['Breaker state', line.inService ? 'Closed path' : 'Open / unavailable'];
    if (selection.family === 'isolator') metrics[0] = ['Isolator state', line.inService ? 'Closed for service' : 'Open for isolation'];
    if (selection.family === 'selector') metrics[1] = ['Bus route', line.selectedBus === 'bus400_1' ? 'Connected to 400-B1' : 'Connected to 400-B2'];
    if (selection.family === 'arrester') metrics[5] = ['Protected level', line.busKV > 404 ? 'Overvoltage watch' : 'Within normal band'];
    if (selection.family === 'trap') metrics[5] = ['Carrier path', 'PLCC channel retained on line side'];
    return {
      ...base,
      state: line.inService ? (line.shareMW > 0 ? 'Importing power' : 'Available') : 'Unavailable',
      metrics,
      insight: line.inService
        ? `At ${formatHour(hour)}, this incomer is contributing ${formatMW(line.shareMW)} to the station at ${formatPct(line.loadingPct)} loading.`
        : 'This entire line bay is unavailable, so the remaining incomers must carry the receiving-station import.',
    };
  }

  if (resolved.kind === 'ict') {
    const ict = model.ictMetrics.find((row) => row.id === resolved.entityId);
    if (!ict) return base;
    const isLvSide = selection.id.includes('-lv-');
    const metrics = [
      ['Bay state', ict.inService ? 'In service' : 'Out of service'],
      ['HV / LV route', `${ict.hvBus === 'bus400_1' ? '400-B1' : '400-B2'} / ${ict.lvBus === 'bus220_1' ? '220-B1' : '220-B2'}`],
      ['Transformer share', formatMVA(ict.shareMVA)],
      ['Loading', formatPct(ict.loadingPct)],
      ['HV current', formatCurrent(ict.hvCurrentA)],
      ['LV current', formatCurrent(ict.lvCurrentA)],
    ];
    if (selection.family === 'ct') metrics[4] = [isLvSide ? 'LV measured current' : 'HV measured current', formatCurrent(isLvSide ? ict.lvCurrentA : ict.hvCurrentA)];
    if (selection.family === 'breaker') metrics[0] = ['Breaker state', ict.inService ? 'Closed path' : 'Open / unavailable'];
    if (selection.family === 'arrester') metrics[5] = ['Protected HV bus', ict.hvBus === 'bus400_1' ? formatKV(model.bus400KV.bus400_1) : formatKV(model.bus400KV.bus400_2)];
    return {
      ...base,
      state: ict.inService ? 'Transforming power' : 'Unavailable',
      metrics,
      insight: ict.inService
        ? `${ict.name} is carrying ${formatMVA(ict.shareMVA)} right now. This is the device that turns the 400 kV switchyard into a real receiving substation.`
        : `${ict.name} is out, so the remaining transformer path has to absorb the full 400/220 kV transfer duty.`,
    };
  }

  if (resolved.kind === 'feeder') {
    const feeder = model.feederMetrics.find((row) => row.id === resolved.entityId);
    if (!feeder) return base;
    const metrics = [
      ['Bay state', feeder.inService ? 'Path closed' : 'Path open'],
      ['Selected bus', feeder.selectedBus === 'bus220_1' ? '220-B1' : '220-B2'],
      ['Bus voltage', formatKV(feeder.busKV)],
      ['Demand', formatMW(feeder.demandMW)],
      ['Served', formatMW(feeder.servedMW)],
      ['Current', formatCurrent(feeder.currentA)],
    ];
    if (selection.family === 'pt') metrics[2] = ['Measured voltage', formatKV(feeder.busKV)];
    if (selection.family === 'ct') metrics[5] = ['Measured current', formatCurrent(feeder.currentA)];
    if (selection.family === 'breaker') metrics[0] = ['Breaker state', feeder.inService ? (feeder.energized ? 'Closed and loaded' : 'Closed / waiting source') : 'Open / unavailable'];
    if (selection.family === 'isolator') metrics[0] = ['Isolator state', feeder.inService ? 'Closed for service' : 'Open for isolation'];
    return {
      ...base,
      state: feeder.energized ? 'Delivering power' : feeder.inService ? 'Waiting for source' : 'Supply interrupted',
      metrics,
      insight: feeder.energized
        ? `${selection.label} is exporting ${formatMW(feeder.servedMW)} into the downstream 220 kV network.`
        : feeder.inService
          ? `${selection.label} is available, but the selected 220 kV path is presently de-energized upstream.`
          : `${selection.label} has demand assigned, but the bay path has been opened from the station side.`,
    };
  }

  if (resolved.kind === 'reactor') {
    return {
      ...base,
      state: model.state.reactorInService ? 'Absorbing reactive power' : 'Out of service',
      metrics: [
        ['State', model.state.reactorInService ? 'In service' : 'Out of service'],
        ['Connected bus', model.state.cfg.assignments.reactor1.bus400 === 'bus400_1' ? '400-B1' : '400-B2'],
        ['Reactive duty', model.state.reactorInService ? `${REACTOR.ratingMvar} Mvar absorbed` : '0 Mvar'],
        ['Bus voltage', formatKV(model.bus400KV.bus400_2)],
        ['System load', `${effectiveLoadPct.toFixed(0)}% effective`],
      ],
      insight: model.state.reactorInService
        ? 'The reactor is in service because the yard needs inductive absorption to keep 400 kV bus voltage in check.'
        : 'With the reactor out, the 400 kV bus is left to ride more directly on line-charging and downstream reactive demand.',
    };
  }

  if (resolved.kind === 'coupler400') {
    return {
      ...base,
      state: model.state.coupler400Closed ? 'Buses paralleled' : 'Bus sections split',
      metrics: [
        ['State', model.state.coupler400Closed ? 'Closed' : 'Open'],
        ['400-B1', formatKV(model.bus400KV.bus400_1)],
        ['400-B2', formatKV(model.bus400KV.bus400_2)],
        ['Operating mode', model.state.coupler400Closed ? 'Common 400 kV section' : 'Independent 400 kV sections'],
      ],
      insight: model.state.coupler400Closed
        ? 'Closing the 400 kV coupler lets either bus section support the other.'
        : 'Opening the 400 kV coupler limits fault spread and preserves sectional independence, but reduces flexibility.',
    };
  }

  if (resolved.kind === 'coupler220') {
    return {
      ...base,
      state: model.state.coupler220Closed ? 'Buses paralleled' : 'Bus sections split',
      metrics: [
        ['State', model.state.coupler220Closed ? 'Closed' : 'Open'],
        ['220-B1', formatKV(model.bus220KV.bus220_1)],
        ['220-B2', formatKV(model.bus220KV.bus220_2)],
        ['Operating mode', model.state.coupler220Closed ? 'Common 220 kV section' : 'Independent 220 kV sections'],
      ],
      insight: model.state.coupler220Closed
        ? 'Closing the 220 kV coupler lets feeder groups back each other up.'
        : 'Opening the 220 kV coupler turns the outgoing side into two separate dispatch sections.',
    };
  }

  if (resolved.kind === 'control') {
    const liveLines = model.lineMetrics.filter((row) => row.inService).length;
    const liveIcts = model.ictMetrics.filter((row) => row.inService).length;
    const liveFeeders = model.feederMetrics.filter((row) => row.energized).length;
    return {
      ...base,
      state: 'Supervising station',
      metrics: [
        ['Live incomers', `${liveLines} / ${model.lineMetrics.length}`],
        ['Live ICTs', `${liveIcts} / ${model.ictMetrics.length}`],
        ['Live feeders', `${liveFeeders} / ${model.feederMetrics.length}`],
        ['Scenario', model.state.scenario.label],
      ],
      insight: 'The control house is where measurement, alarms, sequence-of-events, and switching commands are turned into station operation.',
    };
  }

  return base;
}

function buildAlerts(model) {
  const alerts = [];
  if (model.bus400KV.bus400_1 > 404 || model.bus400KV.bus400_2 > 404) {
    alerts.push('400 kV bus voltage is drifting upward. Light-load charging is becoming important.');
  }
  const ictStress = model.ictMetrics.find((row) => row.inService && row.loadingPct > 90);
  if (ictStress) {
    alerts.push(`${ictStress.name} is above 90% loading.`);
  }
  if (model.servedPct < 99.9) {
    alerts.push('Not all outgoing feeder demand is currently being served.');
  }
  if (!alerts.length) alerts.push('All major station sections are available and the power path is intact.');
  return alerts;
}

function powerEdgeColor(active) {
  return active ? C.power : C.faint;
}

function familyDim(focusFamily, family) {
  return focusFamily !== 'all' && focusFamily !== family ? 0.18 : 1;
}

function symbolSelected(selection, id) {
  return selection?.id === id;
}

function clickStyle() {
  return { cursor: 'pointer' };
}

function Ground({ x, y, color = C.faint }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y + 10} stroke={color} strokeWidth="2" />
      <line x1={x - 12} y1={y + 10} x2={x + 12} y2={y + 10} stroke={color} strokeWidth="2" />
      <line x1={x - 8} y1={y + 16} x2={x + 8} y2={y + 16} stroke={color} strokeWidth="2" />
      <line x1={x - 4} y1={y + 22} x2={x + 4} y2={y + 22} stroke={color} strokeWidth="2" />
    </g>
  );
}

function Tower({ x, y, color }) {
  return (
    <g>
      <line x1={x - 12} y1={y + 26} x2={x} y2={y - 8} stroke={color} strokeWidth="2" />
      <line x1={x + 12} y1={y + 26} x2={x} y2={y - 8} stroke={color} strokeWidth="2" />
      <line x1={x - 16} y1={y - 2} x2={x + 16} y2={y - 2} stroke={color} strokeWidth="3" />
      <line x1={x - 10} y1={y + 10} x2={x + 10} y2={y + 10} stroke={color} strokeWidth="1.5" />
      <line x1={x - 12} y1={y + 26} x2={x + 12} y2={y + 26} stroke={color} strokeWidth="2" />
      <circle cx={x - 16} cy={y - 6} r="2.5" fill={color} />
      <circle cx={x} cy={y - 6} r="2.5" fill={color} />
      <circle cx={x + 16} cy={y - 6} r="2.5" fill={color} />
    </g>
  );
}

function VerticalTrap({ x, y, color }) {
  return (
    <g>
      <path
        d={`M${x},${y - 14} C${x - 10},${y - 10} ${x - 10},${y - 2} ${x},${y + 2} C${x + 10},${y + 6} ${x + 10},${y + 14} ${x},${y + 18}`}
        fill="none"
        stroke={color}
        strokeWidth="3"
      />
    </g>
  );
}

function VerticalIsolator({ x, y, color, closed }) {
  return (
    <g>
      <line x1={x} y1={y - 18} x2={x} y2={y - 6} stroke={color} strokeWidth="3" />
      <line
        x1={x - 10}
        y1={closed ? y + 18 : y + 12}
        x2={x}
        y2={closed ? y - 6 : y + 2}
        stroke={color}
        strokeWidth="3"
      />
      <line x1={x - 10} y1={y + 18} x2={x - 10} y2={y + 26} stroke={color} strokeWidth="3" />
    </g>
  );
}

function CTSymbol({ x, y, color }) {
  return (
    <g>
      <circle cx={x} cy={y} r="12" fill="none" stroke={color} strokeWidth="3" />
    </g>
  );
}

function BreakerSymbol({ x, y, color, closed }) {
  return (
    <g>
      <rect x={x - 12} y={y - 12} width="24" height="24" rx="4" fill="rgba(0,0,0,0.18)" stroke={color} strokeWidth="3" />
      <line x1={x} y1={y - 12} x2={x} y2={y + 12} stroke={closed ? color : C.off} strokeWidth="2.5" />
      {!closed ? <line x1={x - 7} y1={y - 4} x2={x + 7} y2={y + 4} stroke={C.off} strokeWidth="2.5" /> : null}
    </g>
  );
}

function TransformerBody({ x, y, color }) {
  return (
    <g>
      <circle cx={x - 16} cy={y} r="18" fill="none" stroke={color} strokeWidth="3" />
      <circle cx={x + 16} cy={y} r="18" fill="none" stroke={color} strokeWidth="3" />
      <rect x={x - 42} y={y + 24} width="84" height="14" rx="7" fill={`${color}22`} stroke={`${color}66`} />
    </g>
  );
}

function ReactorCoil({ x, y, color }) {
  return (
    <g>
      <path
        d={`M${x},${y - 20} C${x - 12},${y - 16} ${x - 12},${y - 4} ${x},${y} C${x + 12},${y + 4} ${x + 12},${y + 16} ${x},${y + 20} C${x - 12},${y + 24} ${x - 12},${y + 36} ${x},${y + 40}`}
        fill="none"
        stroke={color}
        strokeWidth="3"
      />
    </g>
  );
}

function CvtSymbol({ x, y, color }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x - 26} y2={y} stroke={color} strokeWidth="2.5" />
      <line x1={x - 26} y1={y} x2={x - 26} y2={y + 14} stroke={color} strokeWidth="2.5" />
      <line x1={x - 34} y1={y + 14} x2={x - 18} y2={y + 14} stroke={color} strokeWidth="2.5" />
      <line x1={x - 34} y1={y + 22} x2={x - 18} y2={y + 22} stroke={color} strokeWidth="2.5" />
      <line x1={x - 26} y1={y + 22} x2={x - 26} y2={y + 40} stroke={color} strokeWidth="2.5" />
      <Ground x={x - 26} y={y + 40} color={color} />
    </g>
  );
}

function PtSymbol({ x, y, color }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x - 22} y2={y} stroke={color} strokeWidth="2.5" />
      <rect x={x - 34} y={y + 2} width="24" height="28" rx="4" fill="none" stroke={color} strokeWidth="2.5" />
      <line x1={x - 22} y1={y + 30} x2={x - 22} y2={y + 46} stroke={color} strokeWidth="2.5" />
      <Ground x={x - 22} y={y + 46} color={color} />
    </g>
  );
}

function ArresterSymbol({ x, y, color }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x + 24} y2={y} stroke={color} strokeWidth="2.5" />
      <path
        d={`M${x + 24},${y} L${x + 32},${y + 8} L${x + 24},${y + 16} L${x + 32},${y + 24} L${x + 24},${y + 32}`}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
      />
      <line x1={x + 24} y1={y + 32} x2={x + 24} y2={y + 44} stroke={color} strokeWidth="2.5" />
      <Ground x={x + 24} y={y + 44} color={color} />
    </g>
  );
}

function EquipmentNode({
  id,
  x,
  y,
  family,
  focusFamily,
  selection,
  onSelect,
  hit = 28,
  sasMode = false,
  onOperate = null,
  operateLabel = '',
  operateColor = C.bus,
  operateOffset = null,
  children,
}) {
  const selected = symbolSelected(selection, id);
  const color = FAMILY[family].color;
  const badgeOffset = operateOffset || { x: hit - 2, y: -hit + 9 };
  return (
    <g style={clickStyle()} opacity={familyDim(focusFamily, family)} onClick={onSelect}>
      {selected ? (
        <circle cx={x} cy={y} r={hit} fill="none" stroke={C.select} strokeWidth="2.5" filter="url(#glow)" />
      ) : null}
      {children}
      {sasMode && onOperate ? (
        <g
          transform={`translate(${x + badgeOffset.x},${y + badgeOffset.y})`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
            onOperate();
          }}
          style={clickStyle()}
        >
          <rect x="-16" y="-9" width="32" height="18" rx="9" fill="rgba(9,9,11,0.96)" stroke={operateColor} strokeWidth="1.6" />
          <circle cx="-8.5" cy="0" r="3" fill={operateColor} />
          <text x="4" y="3.2" textAnchor="middle" fontSize="8" fontWeight="800" fill={C.text} letterSpacing="0.06em">
            {operateLabel}
          </text>
        </g>
      ) : null}
      <rect x={x - hit} y={y - hit} width={hit * 2} height={hit * 2} rx="10" fill="transparent" />
      <text x={x} y={y + hit + 10} textAnchor="middle" fontSize="9" fontWeight="800" fill={selected ? C.select : color}>
        {FAMILY[family].short}
      </text>
    </g>
  );
}

function FlowParticles({ path, color, active, count = 3, duration = 2.4, radius = 4 }) {
  if (!active) return null;
  return (
    <g>
      {Array.from({ length: count }).map((_, index) => (
        <circle key={`${path}-${index}`} r={radius} fill={color} opacity="0.9" filter="url(#glow)">
          <animateMotion
            dur={`${duration}s`}
            begin={`${(duration / count) * index}s`}
            repeatCount="indefinite"
            path={path}
          />
        </circle>
      ))}
    </g>
  );
}

function BusLine({ x1, x2, y, label, kv, energized, overVoltage }) {
  const stroke = energized ? (overVoltage ? C.reactive : C.bus) : C.faint;
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={stroke} strokeWidth="8" strokeLinecap="round" opacity={energized ? 0.95 : 0.45} />
      {energized ? (
        <line x1={x1} y1={y} x2={x2} y2={y} stroke={C.power} strokeWidth="1.6" strokeDasharray="10 8" opacity="0.5">
          <animate attributeName="stroke-dashoffset" from="0" to="-36" dur="1.6s" repeatCount="indefinite" />
        </line>
      ) : null}
      <text x={x1 - 18} y={y - 12} textAnchor="start" fill={stroke} fontSize="11" fontWeight="800">
        {label}
      </text>
      <text x={x2 + 12} y={y + 4} fill={stroke} fontSize="11" fontWeight="800">
        {formatKV(kv)}
      </text>
    </g>
  );
}

function lineStatusTone(line) {
  if (!line.inService) return C.off;
  if (line.loadingPct > 88) return C.power;
  return C.breaker;
}

function StationDiagram({
  model,
  focusFamily,
  selection,
  onSelect,
  showMeasurements,
  showReactiveLayer,
  sasMode,
  operations,
}) {
  const Y = {
    top: 76,
    trap: 126,
    shunt: 174,
    iso: 230,
    ct: 284,
    breaker: 338,
    selector: 374,
    hvCt: 520,
    hvBreaker: 572,
    hvShunt: 622,
    transformer: 688,
    lvBreaker: 772,
    lvCt: 820,
    feederBreaker: 950,
    feederCt: 1000,
    feederShunt: 1044,
    feederIso: 1088,
    feederExit: 1122,
  };

  const bus400_1 = model.bus400KV.bus400_1 > 0;
  const bus400_2 = model.bus400KV.bus400_2 > 0;
  const bus220_1 = model.bus220KV.bus220_1 > 0;
  const bus220_2 = model.bus220KV.bus220_2 > 0;
  const lightLoadReactive = model.state.reactorInService && model.totalServedMW < 420;

  const lineFlowPath = (x, busY) => `M${x},${Y.top - 18} L${x},${Y.breaker + 16} L${x},${busY}`;
  const feederFlowPath = (x, busY) => `M${x},${busY} L${x},${Y.feederExit}`;
  const ictFlowPath = (x, hvBusY, lvBusY) => `M${x},${hvBusY} L${x},${Y.transformer - 26} L${x},${Y.transformer + 44} L${x},${lvBusY}`;

  return (
    <svg viewBox={`0 0 ${LAYOUT.width} ${LAYOUT.height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width={LAYOUT.width} height={LAYOUT.height} fill="transparent" />
      {Array.from({ length: 26 }).map((_, i) => (
        <line key={`gx-${i}`} x1={i * 70} y1="0" x2={i * 70} y2={LAYOUT.height} stroke="#101014" strokeWidth="1" />
      ))}
      {Array.from({ length: 17 }).map((_, i) => (
        <line key={`gy-${i}`} x1="0" y1={i * 70} x2={LAYOUT.width} y2={i * 70} stroke="#101014" strokeWidth="1" />
      ))}

      <text x="910" y="34" textAnchor="middle" fill={C.text} fontSize="18" fontWeight="800">
        400 / 220 kV AIS One-Line
      </text>
      <text x="910" y="56" textAnchor="middle" fill={C.dim} fontSize="11" fontWeight="800" letterSpacing="0.12em">
        INCOMING LINES - DOUBLE 400 KV BUS - ICTS - DOUBLE 220 KV BUS - OUTGOING FEEDERS
      </text>

      <BusLine
        x1="78"
        x2="1460"
        y={LAYOUT.bus400_1_y}
        label="400-B1"
        kv={model.bus400KV.bus400_1}
        energized={bus400_1}
        overVoltage={model.bus400KV.bus400_1 > 404}
      />
      <BusLine
        x1="78"
        x2="1460"
        y={LAYOUT.bus400_2_y}
        label="400-B2"
        kv={model.bus400KV.bus400_2}
        energized={bus400_2}
        overVoltage={model.bus400KV.bus400_2 > 404}
      />
      <BusLine
        x1="980"
        x2="1760"
        y={LAYOUT.bus220_1_y}
        label="220-B1"
        kv={model.bus220KV.bus220_1}
        energized={bus220_1}
        overVoltage={false}
      />
      <BusLine
        x1="980"
        x2="1760"
        y={LAYOUT.bus220_2_y}
        label="220-B2"
        kv={model.bus220KV.bus220_2}
        energized={bus220_2}
        overVoltage={false}
      />

      {model.lineMetrics.map((line, index) => {
        const x = LAYOUT.lineX[index];
        const busY = line.selectedBus === 'bus400_1' ? LAYOUT.bus400_1_y : LAYOUT.bus400_2_y;
        const tone = lineStatusTone(line);
        const active = line.inService && line.shareMW > 0;
        const charging = line.inService && line.chargingMvar > 0 && model.totalServedMW < 420;

        return (
          <g key={line.id}>
            <text x={x} y="78" textAnchor="middle" fill={tone} fontSize="12" fontWeight="800">
              {line.short}
            </text>
            <text x={x} y="96" textAnchor="middle" fill={C.muted} fontSize="10" fontWeight="700">
              {line.corridor}
            </text>
            <line x1={x} y1={Y.top} x2={x} y2={Y.selector} stroke={line.inService ? tone : C.faint} strokeWidth="4" opacity={line.inService ? 0.88 : 0.35} />
            <FlowParticles path={lineFlowPath(x, busY)} color={C.power} active={active} count={3} duration={2.2} />
            <FlowParticles path={`M${x},${Y.top - 6} L${x},${Y.shunt}`} color={C.reactive} active={showReactiveLayer && charging} count={2} duration={2.8} radius={3} />

            <EquipmentNode
              id={`${line.id}-gantry`}
              x={x}
              y={Y.top}
              family="gantry"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('gantry', { id: `${line.id}-gantry`, label: `${line.short} Gantry`, bay: line.name, voltage: '400 kV', rating: FAMILY.gantry.rating }))
              }
              hit={24}
            >
              <Tower x={x} y={Y.top} color={C.gantry} />
            </EquipmentNode>

            <EquipmentNode
              id={`${line.id}-trap`}
              x={x}
              y={Y.trap}
              family="trap"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('trap', { id: `${line.id}-trap`, label: `${line.short} Wave Trap`, bay: line.name, voltage: '400 kV', rating: FAMILY.trap.rating }))
              }
            >
              <VerticalTrap x={x} y={Y.trap} color={C.trap} />
            </EquipmentNode>

            <EquipmentNode
              id={`${line.id}-cvt`}
              x={x - 26}
              y={Y.shunt + 24}
              family="cvt"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('cvt', { id: `${line.id}-cvt`, label: `${line.short} CVT`, bay: line.name, voltage: '400 kV', rating: FAMILY.cvt.rating }))
              }
            >
              <CvtSymbol x={x} y={Y.shunt} color={C.vt} />
            </EquipmentNode>

            <EquipmentNode
              id={`${line.id}-la`}
              x={x + 24}
              y={Y.shunt + 24}
              family="arrester"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('arrester', { id: `${line.id}-la`, label: `${line.short} LA`, bay: line.name, voltage: '400 kV', rating: FAMILY.arrester.rating }))
              }
            >
              <ArresterSymbol x={x} y={Y.shunt} color={C.arrester} />
            </EquipmentNode>

            <EquipmentNode
              id={`${line.id}-iso`}
              x={x}
              y={Y.iso}
              family="isolator"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('isolator', { id: `${line.id}-iso`, label: `${line.short} Line DS`, bay: line.name, voltage: '400 kV', rating: FAMILY.isolator.rating }))
              }
              sasMode={sasMode}
              onOperate={() => operations.toggleLinePath(line.id, 'isolator')}
              operateLabel={line.inService ? 'C' : 'O'}
              operateColor={line.inService ? C.isolator : C.off}
            >
              <VerticalIsolator x={x} y={Y.iso} color={C.isolator} closed={line.inService} />
            </EquipmentNode>

            <EquipmentNode
              id={`${line.id}-ct`}
              x={x}
              y={Y.ct}
              family="ct"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('ct', { id: `${line.id}-ct`, label: `${line.short} CT`, bay: line.name, voltage: '400 kV', rating: FAMILY.ct.rating }))
              }
            >
              <CTSymbol x={x} y={Y.ct} color={C.ct} />
            </EquipmentNode>

            <EquipmentNode
              id={`${line.id}-cb`}
              x={x}
              y={Y.breaker}
              family="breaker"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('breaker', { id: `${line.id}-cb`, label: `${line.short} Breaker`, bay: line.name, voltage: '400 kV', rating: '420 kV / 40 kA' }))
              }
              sasMode={sasMode}
              onOperate={() => operations.toggleLinePath(line.id, 'breaker')}
              operateLabel={line.inService ? 'C' : 'O'}
              operateColor={line.inService ? C.breaker : C.off}
            >
              <BreakerSymbol x={x} y={Y.breaker} color={C.breaker} closed={line.inService} />
            </EquipmentNode>

            <EquipmentNode
              id={`${line.id}-selector`}
              x={x}
              y={Y.selector + 16}
              family="selector"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('selector', { id: `${line.id}-selector`, label: `${line.short} Bus Selector`, bay: line.name, voltage: '400 kV', rating: FAMILY.selector.rating }))
              }
              hit={34}
              sasMode={sasMode}
              onOperate={() => operations.cycleLineBus(line.id)}
              operateLabel={line.selectedBus === 'bus400_1' ? 'B1' : 'B2'}
              operateColor={C.bus}
              operateOffset={{ x: 30, y: -22 }}
            >
              <g>
                <line x1={x} y1={Y.selector} x2={x} y2={Y.selector + 18} stroke={C.bus} strokeWidth="3" opacity="0.9" />
                <line
                  x1={x}
                  y1={Y.selector + 18}
                  x2={x - 18}
                  y2={LAYOUT.bus400_1_y}
                  stroke={line.selectedBus === 'bus400_1' ? C.bus : C.faint}
                  strokeWidth={line.selectedBus === 'bus400_1' ? 4 : 2.4}
                />
                <line
                  x1={x}
                  y1={Y.selector + 18}
                  x2={x + 18}
                  y2={LAYOUT.bus400_2_y}
                  stroke={line.selectedBus === 'bus400_2' ? C.bus : C.faint}
                  strokeWidth={line.selectedBus === 'bus400_2' ? 4 : 2.4}
                />
              </g>
            </EquipmentNode>

            {showMeasurements ? (
              <g>
                <text x={x} y={Y.selector + 82} textAnchor="middle" fill={line.inService ? C.text : C.off} fontSize="10" fontWeight="800">
                  {line.inService ? formatMW(line.shareMW) : 'OUT'}
                </text>
                <text x={x} y={Y.selector + 96} textAnchor="middle" fill={C.dim} fontSize="9" fontWeight="700">
                  {line.inService ? formatCurrent(line.currentA) : ''}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}

      <g>
        <line x1={LAYOUT.coupler400X} y1={LAYOUT.bus400_1_y} x2={LAYOUT.coupler400X} y2={LAYOUT.bus400_2_y} stroke={model.state.coupler400Closed ? C.power : C.faint} strokeWidth="4" />
        <FlowParticles
          path={`M${LAYOUT.coupler400X},${LAYOUT.bus400_1_y} L${LAYOUT.coupler400X},${LAYOUT.bus400_2_y}`}
          color={C.power}
          active={model.state.coupler400Closed}
          count={2}
          duration={2.6}
          radius={3.5}
        />
        <EquipmentNode
          id="coupler400-selector-top"
          x={LAYOUT.coupler400X}
          y={LAYOUT.bus400_1_y + 18}
          family="coupler"
          focusFamily={focusFamily}
          selection={selection}
          onSelect={() =>
            onSelect(makeSelection('coupler', { id: 'coupler400-selector-top', label: '400 kV Bus Coupler', bay: '400 kV Bus Section', voltage: '400 kV', rating: FAMILY.coupler.rating }))
          }
          hit={26}
          sasMode={sasMode}
          onOperate={() => operations.toggleCoupler400('isolator')}
          operateLabel={model.state.coupler400Closed ? 'C' : 'O'}
          operateColor={model.state.coupler400Closed ? C.isolator : C.off}
        >
          <VerticalIsolator x={LAYOUT.coupler400X} y={LAYOUT.bus400_1_y + 18} color={C.isolator} closed={model.state.coupler400Closed} />
        </EquipmentNode>
        <EquipmentNode
          id="coupler400-ct1"
          x={LAYOUT.coupler400X}
          y={404}
          family="ct"
          focusFamily={focusFamily}
          selection={selection}
          onSelect={() =>
            onSelect(makeSelection('ct', { id: 'coupler400-ct1', label: '400 kV Coupler CT', bay: '400 kV Bus Coupler', voltage: '400 kV', rating: FAMILY.ct.rating }))
          }
        >
          <CTSymbol x={LAYOUT.coupler400X} y={404} color={C.ct} />
        </EquipmentNode>
        <EquipmentNode
          id="coupler400-cb"
          x={LAYOUT.coupler400X}
          y={LAYOUT.bus400_2_y - 28}
          family="breaker"
          focusFamily={focusFamily}
          selection={selection}
          onSelect={() =>
            onSelect(makeSelection('breaker', { id: 'coupler400-cb', label: '400 kV Coupler CB', bay: '400 kV Bus Coupler', voltage: '400 kV', rating: '420 kV coupler breaker' }))
          }
          sasMode={sasMode}
          onOperate={() => operations.toggleCoupler400('breaker')}
          operateLabel={model.state.coupler400Closed ? 'C' : 'O'}
          operateColor={model.state.coupler400Closed ? C.breaker : C.off}
        >
          <BreakerSymbol x={LAYOUT.coupler400X} y={LAYOUT.bus400_2_y - 28} color={C.breaker} closed={model.state.coupler400Closed} />
        </EquipmentNode>
        <text x={LAYOUT.coupler400X} y={LAYOUT.bus400_2_y + 34} textAnchor="middle" fill={model.state.coupler400Closed ? C.power : C.dim} fontSize="10" fontWeight="800">
          400 BC
        </text>
      </g>

      <g>
        <line x1={LAYOUT.reactorX} y1={LAYOUT.bus400_2_y} x2={LAYOUT.reactorX} y2={646} stroke={model.state.reactorInService ? C.reactor : C.faint} strokeWidth="4" />
        <FlowParticles
          path={`M${LAYOUT.reactorX},${LAYOUT.bus400_2_y} L${LAYOUT.reactorX},646`}
          color={C.reactive}
          active={showReactiveLayer && model.state.reactorInService}
          count={2}
          duration={2.4}
          radius={3}
        />
        <EquipmentNode
          id="reactor-ct"
          x={LAYOUT.reactorX}
          y={516}
          family="ct"
          focusFamily={focusFamily}
          selection={selection}
          onSelect={() =>
            onSelect(makeSelection('ct', { id: 'reactor-ct', label: 'Reactor CT', bay: 'Reactor Bay', voltage: '400 kV', rating: FAMILY.ct.rating }))
          }
        >
          <CTSymbol x={LAYOUT.reactorX} y={516} color={C.ct} />
        </EquipmentNode>
        <EquipmentNode
          id="reactor-cb"
          x={LAYOUT.reactorX}
          y={566}
          family="breaker"
          focusFamily={focusFamily}
          selection={selection}
          onSelect={() =>
            onSelect(makeSelection('breaker', { id: 'reactor-cb', label: 'Reactor Breaker', bay: 'Reactor Bay', voltage: '400 kV', rating: 'Reactor switching breaker' }))
          }
          sasMode={sasMode}
          onOperate={() => operations.toggleReactor()}
          operateLabel={model.state.reactorInService ? 'IN' : 'OUT'}
          operateColor={model.state.reactorInService ? C.reactive : C.off}
          operateOffset={{ x: 34, y: -22 }}
        >
          <BreakerSymbol x={LAYOUT.reactorX} y={566} color={C.breaker} closed={model.state.reactorInService} />
        </EquipmentNode>
        <EquipmentNode
          id="reactor-main"
          x={LAYOUT.reactorX}
          y={626}
          family="reactor"
          focusFamily={focusFamily}
          selection={selection}
          onSelect={() =>
            onSelect(makeSelection('reactor', { id: 'reactor-main', label: 'Shunt Reactor', bay: 'Reactor Bay', voltage: '400 kV', rating: '125 Mvar' }))
          }
          hit={34}
        >
          <ReactorCoil x={LAYOUT.reactorX} y={606} color={C.reactor} />
        </EquipmentNode>
        <Ground x={LAYOUT.reactorX} y={652} color={model.state.reactorInService ? C.reactor : C.faint} />
        {showMeasurements ? (
          <text x={LAYOUT.reactorX} y={710} textAnchor="middle" fill={model.state.reactorInService ? C.reactor : C.dim} fontSize="10" fontWeight="800">
            {model.state.reactorInService ? '125 Mvar' : 'SR'}
          </text>
        ) : null}
      </g>

      {model.ictMetrics.map((ict, index) => {
        const x = LAYOUT.ictX[index];
        const hvBusY = ict.hvBus === 'bus400_1' ? LAYOUT.bus400_1_y : LAYOUT.bus400_2_y;
        const lvBusY = ict.lvBus === 'bus220_1' ? LAYOUT.bus220_1_y : LAYOUT.bus220_2_y;
        const active = ict.inService && ict.shareMVA > 0;

        return (
          <g key={ict.id}>
            <line x1={x} y1={hvBusY} x2={x} y2={Y.lvCt} stroke={ict.inService ? C.ict : C.faint} strokeWidth="4" opacity={ict.inService ? 0.9 : 0.32} />
            <FlowParticles path={ictFlowPath(x, hvBusY, lvBusY)} color={C.power} active={active} count={3} duration={2.4} />

            <EquipmentNode
              id={`${ict.id}-hv-ct`}
              x={x}
              y={Y.hvCt}
              family="ct"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('ct', { id: `${ict.id}-hv-ct`, label: `${ict.short} HV CT`, bay: ict.name, voltage: '400 kV', rating: FAMILY.ct.rating }))
              }
            >
              <CTSymbol x={x} y={Y.hvCt} color={C.ct} />
            </EquipmentNode>

            <EquipmentNode
              id={`${ict.id}-hv-cb`}
              x={x}
              y={Y.hvBreaker}
              family="breaker"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('breaker', { id: `${ict.id}-hv-cb`, label: `${ict.short} HV Breaker`, bay: ict.name, voltage: '400 kV', rating: 'Transformer bay breaker' }))
              }
              sasMode={sasMode}
              onOperate={() => operations.toggleIctPath(ict.id, 'HV breaker')}
              operateLabel={ict.inService ? 'C' : 'O'}
              operateColor={ict.inService ? C.breaker : C.off}
            >
              <BreakerSymbol x={x} y={Y.hvBreaker} color={C.breaker} closed={ict.inService} />
            </EquipmentNode>

            <EquipmentNode
              id={`${ict.id}-hv-la`}
              x={x + 24}
              y={Y.hvShunt + 20}
              family="arrester"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('arrester', { id: `${ict.id}-hv-la`, label: `${ict.short} HV LA`, bay: ict.name, voltage: '400 kV', rating: FAMILY.arrester.rating }))
              }
            >
              <ArresterSymbol x={x} y={Y.hvShunt} color={C.arrester} />
            </EquipmentNode>

            <EquipmentNode
              id={`${ict.id}-main`}
              x={x}
              y={Y.transformer}
              family="ict"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('ict', { id: `${ict.id}-main`, label: ict.name, bay: ict.name, voltage: '400 / 220 kV', rating: '315 MVA' }))
              }
              hit={40}
            >
              <TransformerBody x={x} y={Y.transformer} color={C.ict} />
            </EquipmentNode>

            <EquipmentNode
              id={`${ict.id}-lv-cb`}
              x={x}
              y={Y.lvBreaker}
              family="breaker"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('breaker', { id: `${ict.id}-lv-cb`, label: `${ict.short} LV Breaker`, bay: ict.name, voltage: '220 kV', rating: '220 kV transformer bay breaker' }))
              }
              sasMode={sasMode}
              onOperate={() => operations.toggleIctPath(ict.id, 'LV breaker')}
              operateLabel={ict.inService ? 'C' : 'O'}
              operateColor={ict.inService ? C.breaker : C.off}
            >
              <BreakerSymbol x={x} y={Y.lvBreaker} color={C.breaker} closed={ict.inService} />
            </EquipmentNode>

            <EquipmentNode
              id={`${ict.id}-lv-ct`}
              x={x}
              y={Y.lvCt}
              family="ct"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('ct', { id: `${ict.id}-lv-ct`, label: `${ict.short} LV CT`, bay: ict.name, voltage: '220 kV', rating: FAMILY.ct.rating }))
              }
            >
              <CTSymbol x={x} y={Y.lvCt} color={C.ct} />
            </EquipmentNode>

            {showMeasurements ? (
              <g>
                <text x={x} y={Y.lvCt + 54} textAnchor="middle" fill={ict.inService ? C.ict : C.off} fontSize="11" fontWeight="800">
                  {ict.short} {ict.inService ? formatPct(ict.loadingPct) : 'OUT'}
                </text>
                <text x={x} y={Y.lvCt + 68} textAnchor="middle" fill={C.dim} fontSize="9" fontWeight="700">
                  {ict.inService ? formatMVA(ict.shareMVA) : ''}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}

      {model.feederMetrics.map((feeder, index) => {
        const x = LAYOUT.feederX[index];
        const busY = feeder.selectedBus === 'bus220_1' ? LAYOUT.bus220_1_y : LAYOUT.bus220_2_y;
        const active = feeder.energized;
        return (
          <g key={feeder.id}>
            <line x1={x} y1={busY} x2={x} y2={Y.feederExit} stroke={feeder.energized ? C.power : C.faint} strokeWidth="4" opacity={feeder.energized ? 0.9 : 0.28} />
            <FlowParticles path={feederFlowPath(x, busY)} color={C.power} active={active} count={3} duration={2.1} radius={3.5} />

            <EquipmentNode
              id={`${feeder.id}-cb`}
              x={x}
              y={Y.feederBreaker}
              family="breaker"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('breaker', { id: `${feeder.id}-cb`, label: `${feeder.short} Breaker`, bay: feeder.name, voltage: '220 kV', rating: '220 kV feeder breaker' }))
              }
              sasMode={sasMode}
              onOperate={() => operations.toggleFeederPath(feeder.id, 'breaker')}
              operateLabel={feeder.inService ? 'C' : 'O'}
              operateColor={feeder.inService ? C.breaker : C.off}
            >
              <BreakerSymbol x={x} y={Y.feederBreaker} color={C.breaker} closed={feeder.inService} />
            </EquipmentNode>

            <EquipmentNode
              id={`${feeder.id}-ct`}
              x={x}
              y={Y.feederCt}
              family="ct"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('ct', { id: `${feeder.id}-ct`, label: `${feeder.short} CT`, bay: feeder.name, voltage: '220 kV', rating: FAMILY.ct.rating }))
              }
            >
              <CTSymbol x={x} y={Y.feederCt} color={C.ct} />
            </EquipmentNode>

            <EquipmentNode
              id={`${feeder.id}-pt`}
              x={x - 22}
              y={Y.feederShunt + 22}
              family="pt"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('pt', { id: `${feeder.id}-pt`, label: `${feeder.short} PT`, bay: feeder.name, voltage: '220 kV', rating: FAMILY.pt.rating }))
              }
            >
              <PtSymbol x={x} y={Y.feederShunt} color={C.vt} />
            </EquipmentNode>

            <EquipmentNode
              id={`${feeder.id}-la`}
              x={x + 24}
              y={Y.feederShunt + 24}
              family="arrester"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('arrester', { id: `${feeder.id}-la`, label: `${feeder.short} LA`, bay: feeder.name, voltage: '220 kV', rating: FAMILY.arrester.rating }))
              }
            >
              <ArresterSymbol x={x} y={Y.feederShunt} color={C.arrester} />
            </EquipmentNode>

            <EquipmentNode
              id={`${feeder.id}-iso`}
              x={x}
              y={Y.feederIso}
              family="isolator"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('isolator', { id: `${feeder.id}-iso`, label: `${feeder.short} Line DS`, bay: feeder.name, voltage: '220 kV', rating: FAMILY.isolator.rating }))
              }
              sasMode={sasMode}
              onOperate={() => operations.toggleFeederPath(feeder.id, 'isolator')}
              operateLabel={feeder.inService ? 'C' : 'O'}
              operateColor={feeder.inService ? C.isolator : C.off}
            >
              <VerticalIsolator x={x} y={Y.feederIso} color={C.isolator} closed={feeder.inService} />
            </EquipmentNode>

            <EquipmentNode
              id={`${feeder.id}-exit`}
              x={x}
              y={Y.feederExit}
              family="feeder"
              focusFamily={focusFamily}
              selection={selection}
              onSelect={() =>
                onSelect(makeSelection('feeder', { id: `${feeder.id}-exit`, label: `${feeder.short} Outgoing Feeder`, bay: feeder.name, voltage: '220 kV', rating: FAMILY.feeder.rating }))
              }
              hit={22}
              sasMode={sasMode}
              onOperate={() => operations.cycleFeederBus(feeder.id)}
              operateLabel={feeder.selectedBus === 'bus220_1' ? 'B1' : 'B2'}
              operateColor={C.power}
              operateOffset={{ x: 24, y: -18 }}
            >
              <Tower x={x} y={Y.feederExit} color={C.power} />
            </EquipmentNode>

            {showMeasurements ? (
              <g>
                <text x={x} y={Y.feederExit + 46} textAnchor="middle" fill={feeder.energized ? C.text : C.off} fontSize="10" fontWeight="800">
                  {feeder.short} {feeder.energized ? formatMW(feeder.servedMW) : 'OFF'}
                </text>
                <text x={x} y={Y.feederExit + 60} textAnchor="middle" fill={C.dim} fontSize="9" fontWeight="700">
                  {feeder.energized ? formatCurrent(feeder.currentA) : ''}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}

      <g>
        <line x1={LAYOUT.coupler220X} y1={LAYOUT.bus220_1_y} x2={LAYOUT.coupler220X} y2={LAYOUT.bus220_2_y} stroke={model.state.coupler220Closed ? C.power : C.faint} strokeWidth="4" />
        <FlowParticles
          path={`M${LAYOUT.coupler220X},${LAYOUT.bus220_1_y} L${LAYOUT.coupler220X},${LAYOUT.bus220_2_y}`}
          color={C.power}
          active={model.state.coupler220Closed}
          count={2}
          duration={2.6}
          radius={3.5}
        />
        <EquipmentNode
          id="coupler220-cb"
          x={LAYOUT.coupler220X}
          y={863}
          family="coupler"
          focusFamily={focusFamily}
          selection={selection}
          onSelect={() =>
            onSelect(makeSelection('coupler', { id: 'coupler220-cb', label: '220 kV Bus Coupler', bay: '220 kV Bus Section', voltage: '220 kV', rating: FAMILY.coupler.rating }))
          }
          hit={26}
          sasMode={sasMode}
          onOperate={() => operations.toggleCoupler220('breaker')}
          operateLabel={model.state.coupler220Closed ? 'C' : 'O'}
          operateColor={model.state.coupler220Closed ? C.breaker : C.off}
        >
          <BreakerSymbol x={LAYOUT.coupler220X} y={863} color={C.breaker} closed={model.state.coupler220Closed} />
        </EquipmentNode>
        <text x={LAYOUT.coupler220X} y={934} textAnchor="middle" fill={model.state.coupler220Closed ? C.power : C.dim} fontSize="10" fontWeight="800">
          220 BC
        </text>
      </g>

      <EquipmentNode
        id="control-house"
        x={1730}
        y={644}
        family="control"
        focusFamily={focusFamily}
        selection={selection}
        onSelect={() =>
          onSelect(makeSelection('control', { id: 'control-house', label: 'Control House', bay: 'Relay / SCADA', voltage: 'Station level', rating: FAMILY.control.rating }))
        }
        hit={54}
      >
        <g>
          <rect x="1648" y="584" width="164" height="92" rx="18" fill="rgba(34,211,238,0.08)" stroke={C.reactive} strokeWidth="2" />
          <text x="1730" y="616" textAnchor="middle" fill={C.text} fontSize="13" fontWeight="800">
            CTRL
          </text>
          <text x="1730" y="638" textAnchor="middle" fill={C.muted} fontSize="11">
            Relay • SCADA
          </text>
          <text x="1730" y="658" textAnchor="middle" fill={C.dim} fontSize="10">
            Metering • Alarms
          </text>
        </g>
      </EquipmentNode>

      <g transform="translate(76,1088)">
        <rect x="0" y="0" width="566" height="42" rx="14" fill="rgba(15,15,20,0.92)" stroke={C.border} />
        <circle cx="22" cy="21" r="5" fill={C.power} />
        <text x="34" y="25" fill={C.muted} fontSize="11" fontWeight="700">
          real power flow
        </text>
        <circle cx="166" cy="21" r="5" fill={C.reactive} />
        <text x="178" y="25" fill={C.muted} fontSize="11" fontWeight="700">
          line charging / reactor Mvar
        </text>
        <circle cx="388" cy="21" r="5" fill={C.select} />
        <text x="400" y="25" fill={C.muted} fontSize="11" fontWeight="700">
          selected symbol
        </text>
      </g>

      {showReactiveLayer && lightLoadReactive ? (
        <text x="1440" y="328" fill={C.reactive} fontSize="11" fontWeight="800">
          light-load charging visible
        </text>
      ) : null}
    </svg>
  );
}

function MiniTheoryCard({ title, children, text }) {
  return (
    <div style={S.card}>
      <div style={S.cardHead}>
        <div style={S.cardTitle}>{title}</div>
      </div>
      <div style={S.cardBody}>
        {children}
        <div style={S.theoryText}>{text}</div>
      </div>
    </div>
  );
}

function TheoryPowerPath() {
  return (
    <svg viewBox="0 0 720 200" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <line x1="70" y1="100" x2="650" y2="100" stroke={C.power} strokeWidth="6" strokeLinecap="round" opacity="0.75" />
      {[
        ['IN', 90, C.gantry],
        ['WT', 180, C.trap],
        ['CB', 290, C.breaker],
        ['400 BUS', 390, C.bus],
        ['ICT', 500, C.ict],
        ['220 BUS', 600, C.bus],
      ].map(([label, x, color]) => (
        <g key={label}>
          <circle cx={x} cy="100" r="24" fill={`${color}22`} stroke={color} strokeWidth="3" />
          <text x={x} y="104" textAnchor="middle" fill={C.text} fontSize="11" fontWeight="800">
            {label}
          </text>
        </g>
      ))}
      <path d="M640,100 L680,70 L680,130 Z" fill={C.power} opacity="0.85" />
    </svg>
  );
}

function TheoryBusFlex() {
  return (
    <svg viewBox="0 0 720 200" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <line x1="90" y1="70" x2="630" y2="70" stroke={C.bus} strokeWidth="8" strokeLinecap="round" />
      <line x1="90" y1="130" x2="630" y2="130" stroke={C.bus} strokeWidth="8" strokeLinecap="round" opacity="0.85" />
      <line x1="360" y1="70" x2="360" y2="130" stroke={C.power} strokeWidth="6" />
      <rect x="345" y="86" width="30" height="28" rx="6" fill="rgba(250,204,21,0.14)" stroke={C.power} strokeWidth="2.5" />
      <line x1="180" y1="26" x2="180" y2="70" stroke={C.power} strokeWidth="4" />
      <line x1="540" y1="130" x2="540" y2="174" stroke={C.power} strokeWidth="4" />
      <circle cx="180" cy="26" r="12" fill={`${C.power}22`} stroke={C.power} strokeWidth="2.5" />
      <circle cx="540" cy="174" r="12" fill={`${C.power}22`} stroke={C.power} strokeWidth="2.5" />
      <text x="180" y="12" textAnchor="middle" fill={C.text} fontSize="11" fontWeight="800">
        Line Bay
      </text>
      <text x="540" y="194" textAnchor="middle" fill={C.text} fontSize="11" fontWeight="800">
        Transformer / Feeder Bay
      </text>
      <text x="360" y="162" textAnchor="middle" fill={C.muted} fontSize="12" fontWeight="700">
        Bus coupler decides split or parallel operation
      </text>
    </svg>
  );
}

function TheoryReactive() {
  return (
    <svg viewBox="0 0 720 200" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <line x1="80" y1="70" x2="290" y2="70" stroke={C.power} strokeWidth="6" />
      <line x1="290" y1="70" x2="500" y2="70" stroke={C.bus} strokeWidth="8" />
      <line x1="500" y1="70" x2="500" y2="150" stroke={C.reactor} strokeWidth="5" />
      <path d="M500,92 C486,98 486,114 500,120 C514,126 514,142 500,148" fill="none" stroke={C.reactor} strokeWidth="3" />
      <line x1="290" y1="70" x2="290" y2="28" stroke={C.reactive} strokeWidth="3" />
      <line x1="370" y1="70" x2="370" y2="28" stroke={C.reactive} strokeWidth="3" />
      <line x1="450" y1="70" x2="450" y2="28" stroke={C.reactive} strokeWidth="3" />
      <circle cx="290" cy="28" r="8" fill={C.reactive} />
      <circle cx="370" cy="28" r="8" fill={C.reactive} />
      <circle cx="450" cy="28" r="8" fill={C.reactive} />
      <Ground x="500" y="150" color={C.reactor} />
      <text x="182" y="54" textAnchor="middle" fill={C.text} fontSize="11" fontWeight="800">
        Long 400 kV line
      </text>
      <text x="400" y="96" textAnchor="middle" fill={C.text} fontSize="11" fontWeight="800">
        High bus voltage at light load
      </text>
    </svg>
  );
}

function TheoryProtection() {
  return (
    <svg viewBox="0 0 720 200" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <line x1="100" y1="100" x2="620" y2="100" stroke={C.power} strokeWidth="6" />
      <circle cx="230" cy="100" r="14" fill="none" stroke={C.ct} strokeWidth="3" />
      <rect x="338" y="86" width="24" height="28" rx="4" fill="none" stroke={C.breaker} strokeWidth="3" />
      <line x1="470" y1="100" x2="448" y2="100" stroke={C.vt} strokeWidth="2.5" />
      <rect x="434" y="104" width="28" height="30" rx="4" fill="none" stroke={C.vt} strokeWidth="2.5" />
      <line x1="560" y1="100" x2="582" y2="100" stroke={C.arrester} strokeWidth="2.5" />
      <path d="M582,100 L592,110 L582,120 L592,130" fill="none" stroke={C.arrester} strokeWidth="2.5" />
      <Ground x="582" y="130" color={C.arrester} />
      <text x="230" y="72" textAnchor="middle" fill={C.ct} fontSize="10" fontWeight="800">
        CT
      </text>
      <text x="350" y="72" textAnchor="middle" fill={C.breaker} fontSize="10" fontWeight="800">
        CB
      </text>
      <text x="448" y="72" textAnchor="middle" fill={C.vt} fontSize="10" fontWeight="800">
        VT / CVT
      </text>
      <text x="592" y="72" textAnchor="middle" fill={C.arrester} fontSize="10" fontWeight="800">
        LA
      </text>
    </svg>
  );
}

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>400 / 220 kV AIS Receiving Substation</h2>
      <p style={S.p}>
        A 400 kV air-insulated substation is the receiving node where extra-high-voltage transmission lines
        arrive, power is collected on the 400 kV buses, transformed through ICTs, and dispatched onward on
        220 kV feeders. The whole point of this yard is not one device, but the chain from the incoming line
        termination to the outgoing feeder bay.
      </p>
      <p style={S.p}>
        This simulation uses a representative <strong style={{ color: C.text }}>double main bus</strong> arrangement
        because it is the clearest teaching layout for 400 kV AIS operation: it shows line bays, bus
        flexibility, transformer transfer, reactive control, and outgoing dispatch in one diagram.
      </p>

      <h3 style={S.h3}>End-to-End Power Path</h3>
      <p style={S.p}>
        The receiving-station story should be understood as a single one-line path, not as isolated pieces.
        Incoming transmission power passes through the line bay, reaches the 400 kV bus, crosses the ICT, and
        finally leaves through the 220 kV feeder bay.
      </p>
      <TheoryPowerPath />
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Stage</th>
            <th style={S.th}>Typical Equipment</th>
            <th style={S.th}>Why It Exists</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}>Incoming line bay</td>
            <td style={S.td}>Gantry, wave trap, CVT, surge arrester, isolator, CT, breaker</td>
            <td style={S.td}>Brings the external 400 kV line into the yard with communication, measurement, protection, and switching.</td>
          </tr>
          <tr>
            <td style={S.td}>400 kV bus system</td>
            <td style={S.td}>Bus-1, Bus-2, bus selectors, bus coupler</td>
            <td style={S.td}>Collects incomers and gives the station routing flexibility.</td>
          </tr>
          <tr>
            <td style={S.td}>Transformation</td>
            <td style={S.td}>400 / 220 kV ICT, HV and LV bay breakers, CTs, arresters</td>
            <td style={S.td}>Steps transmission voltage down to the subtransmission level.</td>
          </tr>
          <tr>
            <td style={S.td}>Outgoing feeder bay</td>
            <td style={S.td}>220 kV breaker, CT, PT, arrester, isolator, line exit</td>
            <td style={S.td}>Exports the transformed power into the downstream 220 kV network.</td>
          </tr>
        </tbody>
      </table>

      <div style={S.ctx}>
        <span style={S.ctxT}>Equipment Order Matters</span>
        <p style={S.ctxP}>
          The line-trap stays near the line because it belongs to the carrier channel. The CVT and CT feed the
          relays. The breaker interrupts current. The isolators provide visible isolation only after the breaker
          has done the current interruption. The bus selector sits nearest the bus because its job is routing.
        </p>
      </div>

      <h3 style={S.h3}>Double Main Bus and Coupler Logic</h3>
      <p style={S.p}>
        The two 400 kV buses and the bus coupler let the station operate either as one combined section or as
        two isolated sections. That is why maintenance transfer, sectionalizing, and N-1 style operation are
        possible without losing the whole station.
      </p>
      <TheoryBusFlex />
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: C.text }}>Coupler closed:</strong> Bus-1 and Bus-2 are electrically paralleled, so bays on either section can support the same connected system.</li>
        <li style={S.li}><strong style={{ color: C.text }}>Coupler open:</strong> The station is sectionalized. Fault spread is reduced, but operating flexibility drops.</li>
        <li style={S.li}><strong style={{ color: C.text }}>Bus selector isolators:</strong> These decide which bus a bay belongs to. They are routing devices, not fault-clearing devices.</li>
      </ul>

      <h3 style={S.h3}>ICT and Outgoing Dispatch</h3>
      <p style={S.p}>
        The ICT is the device that turns a switchyard into a receiving substation. A 400 kV yard without an ICT
        only redirects power. The ICT transfers it into the 220 kV system, where outgoing feeder bays dispatch it
        to the next network layer.
      </p>
      <span style={S.eq}>400 kV import → ICT → 220 kV bus → outgoing feeders</span>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Asset</th>
            <th style={S.th}>Typical Rating</th>
            <th style={S.th}>Operational Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}>ICT</td>
            <td style={S.td}>400 / 220 kV, 315 MVA</td>
            <td style={S.td}>Main transfer path between the EHV and 220 kV systems.</td>
          </tr>
          <tr>
            <td style={S.td}>220 kV bus</td>
            <td style={S.td}>Double main bus</td>
            <td style={S.td}>Dispatch platform for the lower-voltage network.</td>
          </tr>
          <tr>
            <td style={S.td}>Outgoing feeder bay</td>
            <td style={S.td}>220 kV bay with CB, CT, PT, LA, DS</td>
            <td style={S.td}>A complete outgoing path, not just a line drawn after the transformer.</td>
          </tr>
        </tbody>
      </table>

      <h3 style={S.h3}>Reactive Power and Voltage Control</h3>
      <p style={S.p}>
        Long 400 kV lines produce charging reactive power, especially during low-load hours. If that reactive power
        is not absorbed, the 400 kV bus voltage rises. The shunt reactor is the most visible station-level device
        that controls this behavior.
      </p>
      <TheoryReactive />
      <span style={S.eq}>Qmismatch ≈ Qline charging - Qreactor absorption - Qload demand</span>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: C.text }}>Light load:</strong> line charging dominates, so voltage tends to float upward.</li>
        <li style={S.li}><strong style={{ color: C.text }}>Reactor in:</strong> the bus reactor absorbs Mvar and pulls the voltage back toward nominal.</li>
        <li style={S.li}><strong style={{ color: C.text }}>Higher lagging load:</strong> downstream demand naturally absorbs reactive power, so the voltage rise becomes less severe.</li>
      </ul>

      <h3 style={S.h3}>Measurement, Protection, and Switching Hierarchy</h3>
      <p style={S.p}>
        The protection layer is what makes the one-line operational. CTs and VTs tell the relay what is happening,
        breakers clear faults, arresters protect insulation, and the control house turns all of that into alarms,
        interlocks, and SCADA supervision.
      </p>
      <TheoryProtection />
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: C.text }}>CT:</strong> converts primary current into a relay-usable secondary current.</li>
        <li style={S.li}><strong style={{ color: C.text }}>VT / CVT:</strong> provides the voltage reference for protection, metering, and synchronization.</li>
        <li style={S.li}><strong style={{ color: C.text }}>Breaker:</strong> the only primary bay device here that interrupts fault current.</li>
        <li style={S.li}><strong style={{ color: C.text }}>Arrester:</strong> stands between the equipment insulation and surge overvoltage.</li>
      </ul>

      <h3 style={S.h3}>Switching and Bus-Transfer Sequence</h3>
      <p style={S.p}>
        A clean bus transfer is one of the best ways to understand why the AIS layout is arranged as it is. The bay
        is first paralleled to the target bus through the coupler, then removed from the original bus, so supply is
        maintained while the route changes.
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Step</th>
            <th style={S.th}>Action</th>
            <th style={S.th}>Why</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}>1</td>
            <td style={S.td}>Close bus coupler if the buses must be paralleled</td>
            <td style={S.td}>Ensures both buses are at the same electrical potential.</td>
          </tr>
          <tr>
            <td style={S.td}>2</td>
            <td style={S.td}>Close the target bus selector</td>
            <td style={S.td}>The bay now has access to the destination bus.</td>
          </tr>
          <tr>
            <td style={S.td}>3</td>
            <td style={S.td}>Verify bay current and bus conditions</td>
            <td style={S.td}>Confirms the bay is safely supported before the old path is removed.</td>
          </tr>
          <tr>
            <td style={S.td}>4</td>
            <td style={S.td}>Open the original bus selector</td>
            <td style={S.td}>Transfer is complete without interrupting power flow.</td>
          </tr>
        </tbody>
      </table>

      <div style={S.ctx}>
        <span style={S.ctxT}>What This Simulation Simplifies</span>
        <p style={S.ctxP}>
          This sim is intentionally a teaching model. It does not attempt EMT-grade transients, detailed breaker
          physics, utility-specific civil geometry, or relay setting calculations. It focuses on layout, operating
          intuition, and the most useful station-level relationships: bus topology, transformer sharing, line
          charging, reactor duty, and feeder supply continuity.
        </p>
      </div>
    </div>
  );
}

export default function AISOneLinePlayground() {
  const [tab, setTab] = useState('single');
  const [scenarioKey, setScenarioKey] = useState('normal');
  const [loadPct, setLoadPct] = useState(SCENARIOS.normal.loadPct);
  const [hour, setHour] = useState(SCENARIOS.normal.hour);
  const [pfPct, setPfPct] = useState(95);
  const [focusFamily, setFocusFamily] = useState('all');
  const [sasMode, setSasMode] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showReactiveLayer, setShowReactiveLayer] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === 'undefined' ? 1440 : window.innerWidth));
  const [lastCommand, setLastCommand] = useState('SAS mimic armed. Tap a glowing state tag on the diagram to issue a switching command.');
  const [overrides, setOverrides] = useState({
    reactor: null,
    coupler400: null,
    coupler220: null,
  });
  const [assignmentOverrides, setAssignmentOverrides] = useState({});
  const [serviceOverrides, setServiceOverrides] = useState({});
  const [selection, setSelection] = useState(
    makeSelection('ict', {
      id: 'ict1-main',
      label: 'ICT-1',
      bay: 'ICT-1',
      voltage: '400 / 220 kV',
      rating: '315 MVA',
    })
  );

  const effectiveLoadPct = useMemo(
    () => clamp(loadPct * LOAD_PROFILE[hour], 20, 130),
    [loadPct, hour]
  );

  const model = useMemo(
    () => deriveModel(scenarioKey, effectiveLoadPct, pfPct / 100, overrides, assignmentOverrides, serviceOverrides),
    [scenarioKey, effectiveLoadPct, pfPct, overrides, assignmentOverrides, serviceOverrides]
  );
  const selectionDetails = useMemo(
    () => buildSelectionDetails(selection, model, effectiveLoadPct, hour),
    [selection, model, effectiveLoadPct, hour]
  );
  const alerts = useMemo(() => buildAlerts(model), [model]);
  const resolvedSelection = useMemo(() => resolveSelectionEntity(selection), [selection]);
  const compactLayout = viewportWidth < 920;
  const mediumLayout = viewportWidth < 1320;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const applyScenario = (key) => {
    setScenarioKey(key);
    setLoadPct(SCENARIOS[key].loadPct);
    setHour(SCENARIOS[key].hour);
    setOverrides({
      reactor: null,
      coupler400: null,
      coupler220: null,
    });
    setAssignmentOverrides({});
    setServiceOverrides({});
    setLastCommand(`Scenario applied: ${SCENARIOS[key].label}.`);
  };

  const updateAssignment = (key, patch) => {
    setAssignmentOverrides((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), ...patch },
    }));
  };

  const updateService = (key, value) => {
    setServiceOverrides((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleLinePath = (lineId, device) => {
    const line = model.lineMetrics.find((row) => row.id === lineId);
    if (!line) return;
    updateService(lineId, !line.inService);
    setLastCommand(`${line.short} ${device} ${line.inService ? 'opened' : 'closed'} from the SAS mimic.`);
  };

  const cycleLineBus = (lineId) => {
    const line = model.lineMetrics.find((row) => row.id === lineId);
    if (!line) return;
    const nextBus = line.selectedBus === 'bus400_1' ? 'bus400_2' : 'bus400_1';
    updateAssignment(lineId, { bus400: nextBus });
    setLastCommand(`${line.short} routed to ${nextBus === 'bus400_1' ? '400-B1' : '400-B2'}.`);
  };

  const toggleIctPath = (ictId, device) => {
    const ict = model.ictMetrics.find((row) => row.id === ictId);
    if (!ict) return;
    updateService(ictId, !ict.inService);
    setLastCommand(`${ict.short} ${device} ${ict.inService ? 'opened' : 'closed'} from the mimic.`);
  };

  const toggleFeederPath = (feederId, device) => {
    const feeder = model.feederMetrics.find((row) => row.id === feederId);
    if (!feeder) return;
    updateService(feederId, !feeder.inService);
    setLastCommand(`${feeder.short} ${device} ${feeder.inService ? 'opened' : 'closed'} from the SAS mimic.`);
  };

  const cycleFeederBus = (feederId) => {
    const feeder = model.feederMetrics.find((row) => row.id === feederId);
    if (!feeder) return;
    const nextBus = feeder.selectedBus === 'bus220_1' ? 'bus220_2' : 'bus220_1';
    updateAssignment(feederId, { bus220: nextBus });
    setLastCommand(`${feeder.short} routed to ${nextBus === 'bus220_1' ? '220-B1' : '220-B2'}.`);
  };

  const toggleCoupler400 = (device) => {
    const next = !model.state.coupler400Closed;
    setOverrides((prev) => ({ ...prev, coupler400: next }));
    setLastCommand(device === 'control' ? `400 kV coupler set ${next ? 'closed' : 'open'} from the dock.` : `400 kV coupler ${device} ${next ? 'closed' : 'opened'}.`);
  };

  const toggleCoupler220 = (device) => {
    const next = !model.state.coupler220Closed;
    setOverrides((prev) => ({ ...prev, coupler220: next }));
    setLastCommand(device === 'control' ? `220 kV coupler set ${next ? 'closed' : 'open'} from the dock.` : `220 kV coupler ${device} ${next ? 'closed' : 'opened'}.`);
  };

  const toggleReactor = () => {
    const next = !model.state.reactorInService;
    setOverrides((prev) => ({ ...prev, reactor: next }));
    setLastCommand(`400 kV shunt reactor ${next ? 'inserted' : 'removed'} from service.`);
  };

  const renderSelectionActions = () => {
    if (resolvedSelection.kind === 'line') {
      const line = model.lineMetrics.find((row) => row.id === resolvedSelection.entityId);
      if (!line) return null;
      return (
        <div style={S.actionWrap}>
          <div style={S.actionGroup}>
            <span style={S.actionLabel}>Bay state</span>
            <button style={S.actionBtn(line.inService, C.breaker)} onClick={() => { updateService(line.id, true); setLastCommand(`${line.short} bay path closed from inspector.`); }}>Closed</button>
            <button style={S.actionBtn(!line.inService, C.off)} onClick={() => { updateService(line.id, false); setLastCommand(`${line.short} bay path opened from inspector.`); }}>Open</button>
          </div>
          <div style={S.actionGroup}>
            <span style={S.actionLabel}>Bus route</span>
            <button style={S.actionBtn(line.selectedBus === 'bus400_1', C.bus)} onClick={() => { updateAssignment(line.id, { bus400: 'bus400_1' }); setLastCommand(`${line.short} routed to 400-B1 from inspector.`); }}>400-B1</button>
            <button style={S.actionBtn(line.selectedBus === 'bus400_2', C.bus)} onClick={() => { updateAssignment(line.id, { bus400: 'bus400_2' }); setLastCommand(`${line.short} routed to 400-B2 from inspector.`); }}>400-B2</button>
          </div>
        </div>
      );
    }

    if (resolvedSelection.kind === 'ict') {
      const ict = model.ictMetrics.find((row) => row.id === resolvedSelection.entityId);
      if (!ict) return null;
      return (
        <div style={S.actionWrap}>
          <div style={S.actionGroup}>
            <span style={S.actionLabel}>Bay state</span>
            <button style={S.actionBtn(ict.inService, C.breaker)} onClick={() => { updateService(ict.id, true); setLastCommand(`${ict.short} bay closed from inspector.`); }}>Closed</button>
            <button style={S.actionBtn(!ict.inService, C.off)} onClick={() => { updateService(ict.id, false); setLastCommand(`${ict.short} bay opened from inspector.`); }}>Open</button>
          </div>
          <div style={S.actionGroup}>
            <span style={S.actionLabel}>HV route</span>
            <button style={S.actionBtn(ict.hvBus === 'bus400_1', C.bus)} onClick={() => { updateAssignment(ict.id, { hvBus: 'bus400_1' }); setLastCommand(`${ict.short} HV shifted to 400-B1.`); }}>400-B1</button>
            <button style={S.actionBtn(ict.hvBus === 'bus400_2', C.bus)} onClick={() => { updateAssignment(ict.id, { hvBus: 'bus400_2' }); setLastCommand(`${ict.short} HV shifted to 400-B2.`); }}>400-B2</button>
          </div>
          <div style={S.actionGroup}>
            <span style={S.actionLabel}>LV route</span>
            <button style={S.actionBtn(ict.lvBus === 'bus220_1', C.power)} onClick={() => { updateAssignment(ict.id, { lvBus: 'bus220_1' }); setLastCommand(`${ict.short} LV shifted to 220-B1.`); }}>220-B1</button>
            <button style={S.actionBtn(ict.lvBus === 'bus220_2', C.power)} onClick={() => { updateAssignment(ict.id, { lvBus: 'bus220_2' }); setLastCommand(`${ict.short} LV shifted to 220-B2.`); }}>220-B2</button>
          </div>
        </div>
      );
    }

    if (resolvedSelection.kind === 'feeder') {
      const feeder = model.feederMetrics.find((row) => row.id === resolvedSelection.entityId);
      if (!feeder) return null;
      return (
        <div style={S.actionWrap}>
          <div style={S.actionGroup}>
            <span style={S.actionLabel}>Bay state</span>
            <button style={S.actionBtn(feeder.inService, C.breaker)} onClick={() => { updateService(feeder.id, true); setLastCommand(`${feeder.short} feeder path closed from inspector.`); }}>Closed</button>
            <button style={S.actionBtn(!feeder.inService, C.off)} onClick={() => { updateService(feeder.id, false); setLastCommand(`${feeder.short} feeder path opened from inspector.`); }}>Open</button>
          </div>
          <div style={S.actionGroup}>
            <span style={S.actionLabel}>Bus route</span>
            <button style={S.actionBtn(feeder.selectedBus === 'bus220_1', C.power)} onClick={() => { updateAssignment(feeder.id, { bus220: 'bus220_1' }); setLastCommand(`${feeder.short} routed to 220-B1 from inspector.`); }}>220-B1</button>
            <button style={S.actionBtn(feeder.selectedBus === 'bus220_2', C.power)} onClick={() => { updateAssignment(feeder.id, { bus220: 'bus220_2' }); setLastCommand(`${feeder.short} routed to 220-B2 from inspector.`); }}>220-B2</button>
          </div>
        </div>
      );
    }

    if (resolvedSelection.kind === 'reactor') {
      return (
        <div style={S.actionWrap}>
          <div style={S.actionGroup}>
            <span style={S.actionLabel}>Reactor</span>
            <button style={S.actionBtn(model.state.reactorInService, C.reactive)} onClick={() => { setOverrides((prev) => ({ ...prev, reactor: true })); setLastCommand('400 kV shunt reactor inserted from inspector.'); }}>In</button>
            <button style={S.actionBtn(!model.state.reactorInService, C.off)} onClick={() => { setOverrides((prev) => ({ ...prev, reactor: false })); setLastCommand('400 kV shunt reactor removed from inspector.'); }}>Out</button>
          </div>
        </div>
      );
    }

    if (resolvedSelection.kind === 'coupler400') {
      return (
        <div style={S.actionWrap}>
          <div style={S.actionGroup}>
            <span style={S.actionLabel}>400 BC</span>
            <button style={S.actionBtn(model.state.coupler400Closed, C.power)} onClick={() => { setOverrides((prev) => ({ ...prev, coupler400: true })); setLastCommand('400 kV bus coupler closed from inspector.'); }}>Closed</button>
            <button style={S.actionBtn(!model.state.coupler400Closed, C.off)} onClick={() => { setOverrides((prev) => ({ ...prev, coupler400: false })); setLastCommand('400 kV bus coupler opened from inspector.'); }}>Open</button>
          </div>
        </div>
      );
    }

    if (resolvedSelection.kind === 'coupler220') {
      return (
        <div style={S.actionWrap}>
          <div style={S.actionGroup}>
            <span style={S.actionLabel}>220 BC</span>
            <button style={S.actionBtn(model.state.coupler220Closed, C.power)} onClick={() => { setOverrides((prev) => ({ ...prev, coupler220: true })); setLastCommand('220 kV bus coupler closed from inspector.'); }}>Closed</button>
            <button style={S.actionBtn(!model.state.coupler220Closed, C.off)} onClick={() => { setOverrides((prev) => ({ ...prev, coupler220: false })); setLastCommand('220 kV bus coupler opened from inspector.'); }}>Open</button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.titleRow}>
          <h1 style={S.title}>400 kV AIS One-Line Playground</h1>
          <div style={S.pillRow}>
            <span style={S.pill('power')}>{formatMW(model.totalServedMW)}</span>
            <span style={S.pill('reactive')}>{formatMvar(model.totalReactiveMvar)}</span>
            <span style={S.pill('bus')}>
              {formatKV(model.bus400KV.bus400_1)} / {formatKV(model.bus220KV.bus220_1)}
            </span>
            <span style={S.pill('bus')}>{formatHour(hour)}</span>
          </div>
        </div>
        <div style={S.hint}>Single-shot one-line mimic. Tap any symbol for live diagnostics, and arm SAS mode to operate breakers, isolators, selectors, couplers, and reactor tags directly on the diagram.</div>
      </div>

      <div style={S.tabBar}>
        <button style={S.tab(tab === 'single')} onClick={() => setTab('single')}>Single Line</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'single' ? (
        <>
          <div style={S.page}>
            <div style={S.controlCard}>
              <div style={S.controlGrid(compactLayout)}>
                <div style={S.panelGroup}>
                  <div style={S.infoTitle}>Scenario</div>
                  <div style={S.buttonGrid(compactLayout ? 2 : 3)}>
                    {Object.entries(SCENARIOS).map(([id, scenario]) => (
                      <button key={id} style={S.scenarioBtn(scenarioKey === id)} onClick={() => applyScenario(id)}>
                        {scenario.label}
                      </button>
                    ))}
                  </div>
                  <div style={S.dockLead}>Quick operating states for normal transfer, light-load overvoltage, bus transfer, and outage conditions.</div>
                </div>

                <div style={S.panelGroup}>
                  <div style={S.infoTitle}>Load and Time</div>
                  <div style={S.sliderStack}>
                    <div style={S.compactSliderBox}>
                      <div style={S.compactSliderHead}>
                        <span style={S.label}>Load</span>
                        <span style={S.value}>{loadPct}%</span>
                      </div>
                      <input
                        style={{ ...S.slider, width: '100%' }}
                        type="range"
                        min="35"
                        max="110"
                        value={loadPct}
                        onChange={(e) => setLoadPct(Number(e.target.value))}
                      />
                    </div>
                    <div style={S.compactSliderBox}>
                      <div style={S.compactSliderHead}>
                        <span style={S.label}>Hour</span>
                        <span style={S.value}>{formatHour(hour)}</span>
                      </div>
                      <input
                        style={{ ...S.slider, width: '100%' }}
                        type="range"
                        min="0"
                        max="23"
                        value={hour}
                        onChange={(e) => setHour(Number(e.target.value))}
                      />
                    </div>
                    <div style={S.compactSliderBox}>
                      <div style={S.compactSliderHead}>
                        <span style={S.label}>PF</span>
                        <span style={S.value}>{(pfPct / 100).toFixed(2)}</span>
                      </div>
                      <input
                        style={{ ...S.slider, width: '100%' }}
                        type="range"
                        min="90"
                        max="100"
                        value={pfPct}
                        onChange={(e) => setPfPct(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div style={S.panelGroup}>
                  <div style={S.infoTitle}>Operate and View</div>
                  <div style={S.wrapRow}>
                    <button style={S.toggle(sasMode, C.bus)} onClick={() => setSasMode((prev) => !prev)}>
                      SAS {sasMode ? 'On' : 'Off'}
                    </button>
                    <button style={S.toggle(showMeasurements, C.bus)} onClick={() => setShowMeasurements((prev) => !prev)}>
                      Measurements {showMeasurements ? 'On' : 'Off'}
                    </button>
                    <button style={S.toggle(showReactiveLayer, C.reactive)} onClick={() => setShowReactiveLayer((prev) => !prev)}>
                      Reactive {showReactiveLayer ? 'On' : 'Off'}
                    </button>
                    <button style={S.toggle(model.state.coupler400Closed, C.power)} onClick={() => toggleCoupler400('control')}>
                      400 BC {model.state.coupler400Closed ? 'Closed' : 'Open'}
                    </button>
                    <button style={S.toggle(model.state.coupler220Closed, C.power)} onClick={() => toggleCoupler220('control')}>
                      220 BC {model.state.coupler220Closed ? 'Closed' : 'Open'}
                    </button>
                    <button style={S.toggle(model.state.reactorInService, C.reactive)} onClick={toggleReactor}>
                      Reactor {model.state.reactorInService ? 'In' : 'Out'}
                    </button>
                  </div>
                  <div style={S.dockLead}>Keep the diagram in inspect mode or arm SAS mode to operate the glowing device tags directly on the one-line.</div>
                </div>

                <div style={S.panelGroup}>
                  <div style={S.infoTitle}>Highlight</div>
                  <div style={S.wrapRow}>
                    <button style={S.chip(focusFamily === 'all', C.bus)} onClick={() => setFocusFamily('all')}>
                      ALL
                    </button>
                    {FAMILY_ORDER.map((family) => (
                      <button
                        key={family}
                        style={S.chip(focusFamily === family, FAMILY[family].color)}
                        onClick={() => setFocusFamily(family)}
                      >
                        {FAMILY[family].short}
                      </button>
                    ))}
                  </div>
                  <div style={S.dockLead}>Dim the yard to a single equipment family when you want to study breakers, CTs, selectors, arresters, or transformers in isolation.</div>
                </div>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.cardHead}>
                <div>
                  <div style={S.cardTitle}>Integrated one-line mimic</div>
                  <div style={S.cardSub}>Full receiving-substation path in one shot, with SAS-style state tags directly on breakers, isolators, selectors, couplers, and reactor control points.</div>
                </div>
                <div style={S.pillRow}>
                  <span style={S.pill('bus')}>{sasMode ? 'SAS Armed' : 'Inspect Mode'}</span>
                  <span style={S.pill('power')}>{showMeasurements ? 'Meas On' : 'Meas Off'}</span>
                  <span style={S.pill('reactive')}>{showReactiveLayer ? 'Reactive On' : 'Reactive Off'}</span>
                </div>
              </div>
              <div style={S.cardBody}>
                <div style={S.diagramStage}>
                  <StationDiagram
                    model={model}
                    focusFamily={focusFamily}
                    selection={selection}
                    onSelect={setSelection}
                    showMeasurements={showMeasurements}
                    showReactiveLayer={showReactiveLayer}
                    sasMode={sasMode}
                    operations={{
                      toggleLinePath,
                      cycleLineBus,
                      toggleIctPath,
                      toggleFeederPath,
                      cycleFeederBus,
                      toggleCoupler400,
                      toggleCoupler220,
                      toggleReactor,
                    }}
                  />
                  <div style={S.floatingToast(compactLayout)}>
                    <div style={S.commandBox}>
                      <span style={S.commandLabel}>Latest Command</span>
                      {lastCommand}
                    </div>
                  </div>
                </div>
              </div>
              <div style={S.diagramFooter}>
                <span style={S.pill('bus')}>Tap symbols to inspect</span>
                <span style={S.pill('power')}>State tags switch breaker and isolator paths</span>
                <span style={S.pill('reactive')}>Bus tags reroute selectors</span>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.cardHead}>
                <div>
                  <div style={S.cardTitle}>Operator Dock</div>
                  <div style={S.cardSub}>Selected equipment parameters, switching actions, and station-wide context without shrinking the one-line view.</div>
                </div>
              </div>
              <div style={S.cardBody}>
                <div style={S.dockGrid(compactLayout, mediumLayout)}>
                  <div style={S.infoCard}>
                    <div style={S.infoTitle}>Selected Symbol</div>
                    <div style={{ ...S.infoName, color: selectionDetails.tone }}>{selectionDetails.title}</div>
                    <div style={S.infoMeta}>
                      {selection.bay} • {selection.voltage} • {selection.rating}
                    </div>
                    <div style={{ ...S.infoMeta, color: C.text, marginTop: 12 }}>{selectionDetails.state}</div>
                    <div style={S.infoMeta}>{selection.why}</div>
                    <div style={S.miniList}>
                      {selectionDetails.metrics.map(([label, value]) => (
                        <div key={`${selection.id}-${label}`} style={S.miniRow}>
                          <span>{label}</span>
                          <span style={{ fontWeight: 800, color: selectionDetails.tone }}>{value}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ ...S.alertBox, marginTop: 12 }}>{selectionDetails.insight}</div>
                    {renderSelectionActions()}
                  </div>

                  <div style={S.infoCard}>
                    <div style={S.infoTitle}>Station Snapshot</div>
                    <div style={S.metricGrid}>
                      <div style={S.metric}>
                        <div style={S.metricLabel}>Served</div>
                        <div style={{ ...S.metricValue, color: C.power }}>{formatMW(model.totalServedMW)}</div>
                      </div>
                      <div style={S.metric}>
                        <div style={S.metricLabel}>Supply</div>
                        <div style={{ ...S.metricValue, color: C.bus }}>{formatPct(model.servedPct)}</div>
                      </div>
                      <div style={S.metric}>
                        <div style={S.metricLabel}>400 B1 / B2</div>
                        <div style={{ ...S.metricValue, fontSize: 16, color: model.bus400KV.bus400_1 > 404 || model.bus400KV.bus400_2 > 404 ? C.reactive : C.bus }}>
                          {formatKV(model.bus400KV.bus400_1)} / {formatKV(model.bus400KV.bus400_2)}
                        </div>
                      </div>
                      <div style={S.metric}>
                        <div style={S.metricLabel}>220 B1 / B2</div>
                        <div style={{ ...S.metricValue, fontSize: 16, color: C.text }}>
                          {formatKV(model.bus220KV.bus220_1)} / {formatKV(model.bus220KV.bus220_2)}
                        </div>
                      </div>
                      <div style={S.metric}>
                        <div style={S.metricLabel}>Effective Load</div>
                        <div style={{ ...S.metricValue, fontSize: 16, color: C.power }}>
                          {effectiveLoadPct.toFixed(0)}%
                        </div>
                      </div>
                      <div style={S.metric}>
                        <div style={S.metricLabel}>Time of Day</div>
                        <div style={{ ...S.metricValue, fontSize: 16, color: C.text }}>
                          {formatHour(hour)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={S.infoCard}>
                    <div style={S.infoTitle}>Live Assets & Alerts</div>
                    <div style={S.miniList}>
                      {model.ictMetrics.map((ict) => (
                        <div key={ict.id} style={S.miniRow}>
                          <span>{ict.name}</span>
                          <span style={{ color: ict.inService ? C.ict : C.off, fontWeight: 800 }}>
                            {ict.inService ? formatPct(ict.loadingPct) : 'OUT'}
                          </span>
                        </div>
                      ))}
                      <div style={S.miniRow}>
                        <span>400 kV reactor</span>
                        <span style={{ color: model.state.reactorInService ? C.reactive : C.dim, fontWeight: 800 }}>
                          {model.state.reactorInService ? 'IN' : 'OUT'}
                        </span>
                      </div>
                      <div style={S.miniRow}>
                        <span>Light-load charging</span>
                        <span style={{ color: model.totalServedMW < 420 ? C.reactive : C.dim, fontWeight: 800 }}>
                          {model.totalServedMW < 420 ? 'VISIBLE' : 'MUTED'}
                        </span>
                      </div>
                    </div>
                    <div style={S.actionWrap}>
                      {alerts.map((alert) => (
                        <div key={alert} style={S.alertBox}>{alert}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <Theory />
      )}
    </div>
  );
}
