import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

/* ──────────────────────────── STYLES ──────────────────────────── */
const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e', overflowX: 'auto' },
  tab: (a) => ({ padding: '8px 18px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '12px 16px 0', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 },
  controls: { padding: '12px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 8 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 110, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 40, textAlign: 'right' },
  results: { display: 'flex', gap: 28, padding: '10px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap' },
  ri: { display: 'flex', flexDirection: 'column', gap: 2 },
  rl: { fontSize: 11, color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  rv: { fontSize: 17, fontWeight: 700, fontFamily: 'monospace' },
  sel: { padding: '5px 8px', borderRadius: 6, border: '1px solid #27272a', background: '#18181b', color: '#a1a1aa', fontSize: 12, cursor: 'pointer', outline: 'none' },
  btn: (active, danger) => ({ padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: `1px solid ${danger ? '#ef4444' : active ? '#6366f1' : '#27272a'}`, background: danger ? 'rgba(239,68,68,0.1)' : active ? 'rgba(99,102,241,0.15)' : 'transparent', color: danger ? '#fca5a5' : active ? '#a5b4fc' : '#a1a1aa', transition: 'all 0.15s' }),
  alarmBar: { padding: '6px 24px', background: '#08080c', borderTop: '1px solid #1a1a24', display: 'flex', gap: 6, overflowX: 'auto', alignItems: 'stretch' },
  ac: (sev) => ({ padding: '4px 8px', borderRadius: 5, minWidth: 155, flexShrink: 0, background: sev === 'fault' ? 'rgba(239,68,68,0.06)' : sev === 'warn' ? 'rgba(245,158,11,0.06)' : 'rgba(34,197,94,0.04)', borderLeft: `2px solid ${sev === 'fault' ? '#ef4444' : sev === 'warn' ? '#f59e0b' : '#22c55e'}`, fontSize: 11, color: sev === 'fault' ? '#fca5a5' : sev === 'warn' ? '#fcd34d' : '#86efac', lineHeight: 1.5 }),
  at: { color: '#52525b', fontSize: 9, fontFamily: 'monospace', display: 'block' },
  theory: { flex: 1, padding: '32px 24px', maxWidth: 860, margin: '0 auto', overflowY: 'auto', width: '100%' },
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
  // extra styles for this sim
  panel: { padding: '14px 18px', background: '#111116', border: '1px solid #1e1e2e', borderRadius: 12, margin: '8px 0' },
  panelTitle: { fontSize: 12, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' },
  badge: (color) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: `${color}15`, color, border: `1px solid ${color}30`, marginRight: 6 }),
  frameField: (color) => ({ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', borderLeft: `3px solid ${color}`, background: `${color}08`, marginBottom: 2, borderRadius: '0 6px 6px 0', fontSize: 12 }),
  fieldName: { color: '#d4d4d8', fontWeight: 600, minWidth: 120 },
  fieldVal: { color: '#a1a1aa', fontFamily: 'monospace', fontSize: 11 },
  treeNode: (depth, active) => ({ padding: '6px 12px', paddingLeft: 12 + depth * 20, cursor: 'pointer', background: active ? 'rgba(99,102,241,0.1)' : 'transparent', borderLeft: active ? '2px solid #6366f1' : '2px solid transparent', fontSize: 13, color: active ? '#c4b5fd' : '#a1a1aa', transition: 'all 0.15s' }),
  swimLane: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, padding: '0 4px' },
  swimHeader: { fontSize: 10, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, textAlign: 'center' },
};

/* ──────────────────────────── CONSTANTS ──────────────────────────── */
const APTRANSCO_SUBS = [
  { id: 'VNR', name: 'Vidyanagar 400kV', type: 'sldc', bays: 12, x: 430, y: 180 },
  { id: 'NLR', name: 'Nellore 220kV', type: 'ss', bays: 8, x: 350, y: 340 },
  { id: 'KNL', name: 'Kurnool 220kV', type: 'ss', bays: 6, x: 180, y: 200 },
  { id: 'VJA', name: 'Vijayawada 220kV', type: 'ss', bays: 10, x: 500, y: 220 },
  { id: 'VSP', name: 'Visakhapatnam 220kV', type: 'ss', bays: 8, x: 680, y: 120 },
  { id: 'TPT', name: 'Tirupati 220kV', type: 'ss', bays: 6, x: 280, y: 400 },
  { id: 'RJM', name: 'Rajahmundry 220kV', type: 'ss', bays: 6, x: 620, y: 170 },
  { id: 'GNT', name: 'Guntur 220kV', type: 'ss', bays: 7, x: 420, y: 280 },
];

const CT_SPECS = [
  { label: '400/1', primary: 400, secondary: 1, kneeV: 150, burden: 15, class: '5P20' },
  { label: '800/1', primary: 800, secondary: 1, kneeV: 250, burden: 20, class: '5P20' },
  { label: '1200/1', primary: 1200, secondary: 1, kneeV: 350, burden: 30, class: '5P20' },
  { label: '2000/1', primary: 2000, secondary: 1, kneeV: 500, burden: 30, class: '10P20' },
];
const PT_RATIO = { primary: 220000 / Math.sqrt(3), secondary: 110 / Math.sqrt(3), ratio: 2000 };

const GOOSE_FIELDS = [
  { name: 'Destination MAC', bytes: '6', value: '01:0C:CD:01:00:01', color: '#818cf8', note: 'Multicast — all subscribers receive' },
  { name: 'Source MAC', bytes: '6', value: 'AA:BB:CC:DD:EE:01', color: '#818cf8', note: 'Publishing IED MAC address' },
  { name: 'VLAN Tag (802.1Q)', bytes: '4', value: 'PRI:4 VLAN:100', color: '#38bdf8', note: 'Priority 4, VLAN ID for GOOSE traffic' },
  { name: 'EtherType', bytes: '2', value: '0x88B8', color: '#22c55e', note: 'IEC 61850 GOOSE identifier' },
  { name: 'AppID', bytes: '2', value: '0x0001', color: '#f59e0b', note: 'Must be unique per GOOSE publisher' },
  { name: 'Length', bytes: '2', value: '0x00A2', color: '#a1a1aa', note: 'Total PDU length' },
  { name: 'gocbRef', bytes: 'var', value: 'IED1/LLN0$GO$gcbTrip', color: '#ec4899', note: 'GOOSE Control Block reference' },
  { name: 'datSet', bytes: 'var', value: 'IED1/LLN0$TripDataset', color: '#ec4899', note: 'Dataset being published' },
  { name: 'goID', bytes: 'var', value: 'IED1_Trip', color: '#ec4899', note: 'Human-readable GOOSE ID' },
  { name: 'stNum', bytes: '4', value: '→ increments on state change', color: '#ef4444', note: 'State number — changes on new event' },
  { name: 'sqNum', bytes: '4', value: '→ increments on retransmit', color: '#ef4444', note: 'Sequence number — resets to 0 on new stNum' },
  { name: 'allData', bytes: 'var', value: '[BOOLEAN: TRUE]', color: '#22c55e', note: 'Trip signal = TRUE' },
];

const GOOSE_RETRANSMIT = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1000];

const GOOSE_FAILURES = [
  { id: 'vlan', label: 'VLAN Mismatch', desc: 'Publisher on VLAN 100, subscriber on VLAN 200. Ethernet switch drops the frame — subscriber never sees GOOSE.', fix: 'Verify VLAN configuration in both IED and switch. Check .SCD file for consistent VLAN assignment.', color: '#ef4444' },
  { id: 'appid', label: 'AppID Conflict', desc: 'Two publishers using same AppID 0x0001. Subscriber processes wrong GOOSE dataset — incorrect trip/block decisions.', fix: 'Audit AppID allocation across all GCBs in the SCD file. Each publisher must have a unique AppID.', color: '#f59e0b' },
  { id: 'dataset', label: 'Dataset Mismatch', desc: 'Publisher sends 8 data members, subscriber expects 6. Dataset structure changed after commissioning without updating subscriber config.', fix: 'Re-export CID files from the SCD after any dataset modification. Re-download to all affected IEDs.', color: '#ec4899' },
  { id: 'switch', label: 'Switch Failure (No PRP)', desc: 'Single Ethernet switch fails. All GOOSE communication lost. IEDs fall back to hardwired backup (if wired) or lose inter-relay signaling entirely.', fix: 'Implement PRP (Parallel Redundancy Protocol) or HSR (High-availability Seamless Redundancy) per IEC 62439-3.', color: '#818cf8' },
];

const IEC104_TYPES = [
  { id: 1, name: 'M_SP_NA_1', desc: 'Single-point information', dir: 'M', example: 'CB Open/Close', bytes: '1 bit + quality' },
  { id: 3, name: 'M_DP_NA_1', desc: 'Double-point information', dir: 'M', example: 'Isolator position (4-state)', bytes: '2 bits + quality' },
  { id: 9, name: 'M_ME_NA_1', desc: 'Measured normalized value', dir: 'M', example: 'Bus voltage (pu)', bytes: '16-bit + quality' },
  { id: 13, name: 'M_ME_NC_1', desc: 'Measured short floating point', dir: 'M', example: 'MW, MVAR, kV', bytes: 'IEEE 754 float + quality' },
  { id: 30, name: 'M_SP_TB_1', desc: 'Single-point + CP56Time2a', dir: 'M', example: 'Breaker trip event', bytes: '1 bit + 7-byte timestamp' },
  { id: 36, name: 'M_ME_TF_1', desc: 'Float + CP56Time2a', dir: 'M', example: 'Fault current with timestamp', bytes: 'float + 7-byte timestamp' },
  { id: 45, name: 'C_SC_NA_1', desc: 'Single command', dir: 'C', example: 'Trip/Close breaker', bytes: '1 byte SCO' },
  { id: 100, name: 'C_IC_NA_1', desc: 'Interrogation command', dir: 'C', example: 'General interrogation', bytes: '1 byte QOI' },
];

const IEC104_COT = [
  { id: 1, name: 'periodic/cyclic' }, { id: 2, name: 'background scan' },
  { id: 3, name: 'spontaneous' }, { id: 5, name: 'requested' },
  { id: 6, name: 'activation' }, { id: 7, name: 'activation confirm' },
  { id: 10, name: 'activation termination' }, { id: 20, name: 'interrogated by station' },
];

const DATA_MODEL = {
  bays: [
    { id: 'line1', name: 'Line Bay 1 (Nellore–Ongole)', equipment: 'CB + 2 DS + CT + CVT + LA' },
    { id: 'line2', name: 'Line Bay 2 (Nellore–Kavali)', equipment: 'CB + 2 DS + CT + CVT + LA' },
    { id: 'xfmr', name: 'Transformer Bay (100 MVA)', equipment: 'CB + DS + CT + Buchholz + WTI' },
    { id: 'bus', name: 'Bus Coupler Bay', equipment: 'CB + 2 DS + CT' },
  ],
  logicalNodes: {
    line1: [
      { ln: 'LLN0', class: 'Logical Node Zero', type: 'system', dos: ['Mod', 'Beh', 'Health', 'NamPlt'] },
      { ln: 'LPHD1', class: 'Physical Device', type: 'system', dos: ['PhyNam', 'PhyHealth', 'Proxy'] },
      { ln: 'XCBR1', class: 'Circuit Breaker', type: 'switching', dos: [
        { name: 'Pos', type: 'DPC', desc: 'Position (Open/Close/Bad/Intermediate)' },
        { name: 'BlkOpn', type: 'SPC', desc: 'Block opening command' },
        { name: 'BlkCls', type: 'SPC', desc: 'Block closing command' },
        { name: 'CBOpCap', type: 'INS', desc: 'CB operating capability' },
      ]},
      { ln: 'XSWI1', class: 'Disconnector', type: 'switching', dos: [
        { name: 'Pos', type: 'DPC', desc: 'Isolator position' },
        { name: 'SwTyp', type: 'ENS', desc: 'Switch type' },
      ]},
      { ln: 'MMXU1', class: 'Measurement (3-phase)', type: 'metering', dos: [
        { name: 'TotW', type: 'MV', desc: 'Total active power (MW)' },
        { name: 'TotVAr', type: 'MV', desc: 'Total reactive power (MVAR)' },
        { name: 'Hz', type: 'MV', desc: 'Frequency (Hz)' },
        { name: 'PhV', type: 'WYE', desc: 'Phase voltages (kV)' },
        { name: 'A', type: 'WYE', desc: 'Phase currents (A)' },
      ]},
      { ln: 'PDIS1', class: 'Distance Protection', type: 'protection', dos: [
        { name: 'Str', type: 'ACD', desc: 'Start (pickup) indication' },
        { name: 'Op', type: 'ACT', desc: 'Operate (trip) indication' },
        { name: 'RsDlTmms', type: 'ING', desc: 'Reset delay time (ms)' },
      ]},
      { ln: 'PTOC1', class: 'Time Overcurrent', type: 'protection', dos: [
        { name: 'Str', type: 'ACD', desc: 'Start indication' },
        { name: 'Op', type: 'ACT', desc: 'Operate indication' },
        { name: 'TmACrv', type: 'CSG', desc: 'Time-current curve settings' },
      ]},
      { ln: 'RBRF1', class: 'Breaker Failure', type: 'protection', dos: [
        { name: 'Str', type: 'ACD', desc: 'BF timer started' },
        { name: 'Op', type: 'ACT', desc: 'BF operate (backup trip)' },
        { name: 'OpDlTmms', type: 'ING', desc: 'BF timer setting (ms)' },
      ]},
      { ln: 'CSWI1', class: 'Switch Controller', type: 'control', dos: [
        { name: 'Pos', type: 'DPC', desc: 'Commanded position' },
        { name: 'OpCntRs', type: 'INC', desc: 'Operation counter reset' },
      ]},
    ],
    line2: 'same as line1',
    xfmr: [
      { ln: 'LLN0', class: 'Logical Node Zero', type: 'system', dos: ['Mod', 'Beh', 'Health', 'NamPlt'] },
      { ln: 'XCBR1', class: 'Circuit Breaker', type: 'switching', dos: [
        { name: 'Pos', type: 'DPC', desc: 'Position' },
      ]},
      { ln: 'MMXU1', class: 'Measurement', type: 'metering', dos: [
        { name: 'TotW', type: 'MV', desc: 'Active power' },
        { name: 'TotVAr', type: 'MV', desc: 'Reactive power' },
        { name: 'A', type: 'WYE', desc: 'Currents' },
      ]},
      { ln: 'PDIF1', class: 'Differential Protection', type: 'protection', dos: [
        { name: 'Str', type: 'ACD', desc: 'Start indication' },
        { name: 'Op', type: 'ACT', desc: 'Operate indication' },
      ]},
      { ln: 'PTTR1', class: 'Thermal Overload', type: 'protection', dos: [
        { name: 'Tmp', type: 'MV', desc: 'Temperature (°C)' },
        { name: 'Alm', type: 'SPS', desc: 'Alarm indication' },
      ]},
    ],
    bus: [
      { ln: 'LLN0', class: 'Logical Node Zero', type: 'system', dos: ['Mod', 'Beh', 'Health'] },
      { ln: 'XCBR1', class: 'Circuit Breaker', type: 'switching', dos: [
        { name: 'Pos', type: 'DPC', desc: 'Position' },
      ]},
      { ln: 'MMXU1', class: 'Measurement', type: 'metering', dos: [
        { name: 'A', type: 'WYE', desc: 'Currents' },
      ]},
    ],
  },
  dataAttributes: {
    DPC: ['stVal (Dbpos)', 'q (Quality)', 't (Timestamp)', 'ctlModel', 'origin'],
    SPC: ['stVal (BOOLEAN)', 'q', 't', 'ctlModel'],
    MV: ['mag.f (FLOAT32)', 'q', 't', 'range', 'db (deadband)'],
    ACD: ['general (BOOLEAN)', 'dirGeneral (direction)', 'q', 't'],
    ACT: ['general (BOOLEAN)', 'q', 't'],
    INS: ['stVal (INT32)', 'q', 't'],
    ING: ['setVal (INT32)'],
    WYE: ['phsA.cVal.mag.f', 'phsB.cVal.mag.f', 'phsC.cVal.mag.f'],
    ENS: ['stVal (ENUM)', 'q', 't'],
    SPS: ['stVal (BOOLEAN)', 'q', 't'],
    INC: ['stVal (INT32)', 'q', 't', 'ctlModel'],
    CSG: ['setVal (curve points)'],
  },
};

const E2E_STAGES = [
  { label: 'Fault Inception', tMin: 0, tMax: 0, color: '#ef4444', layer: 'Field' },
  { label: 'CT/PT Sensing', tMin: 0.5, tMax: 2, color: '#f59e0b', layer: 'Field' },
  { label: 'IED Relay Pickup', tMin: 10, tMax: 30, color: '#ec4899', layer: 'IED' },
  { label: 'Protection Decision', tMin: 20, tMax: 60, color: '#ec4899', layer: 'IED' },
  { label: 'GOOSE Trip Command', tMin: 1, tMax: 4, color: '#818cf8', layer: 'Station Bus' },
  { label: 'Breaker Arc Extinction', tMin: 40, tMax: 80, color: '#22c55e', layer: 'Switchyard' },
  { label: 'RTU Event Capture', tMin: 50, tMax: 200, color: '#3b82f6', layer: 'Gateway' },
  { label: 'IEC 104 Spontaneous', tMin: 100, tMax: 500, color: '#3b82f6', layer: 'Gateway' },
  { label: 'WAN Transit (OPGW)', tMin: 10, tMax: 50, color: '#6366f1', layer: 'WAN' },
  { label: 'SLDC Display Update', tMin: 2000, tMax: 4000, color: '#a78bfa', layer: 'SLDC' },
];

const LN_COLORS = { protection: '#ec4899', switching: '#3b82f6', metering: '#22c55e', control: '#f59e0b', system: '#71717a' };

const TABS = [
  ['bay', 'Bay Wiring'],
  ['arch', '61850 Architecture'],
  ['goose', 'GOOSE'],
  ['model', 'Data Model'],
  ['iec104', 'IEC 104'],
  ['e2e', 'End-to-End'],
  ['theory', 'Theory'],
];

/* ──────────────────────────── TAB 1: BAY WIRING ──────────────────────────── */
function BayWiringTab() {
  const [faultCurrent, setFaultCurrent] = useState(8);
  const [ctIdx, setCtIdx] = useState(1);
  const [busVoltage, setBusVoltage] = useState(220);
  const [mode, setMode] = useState('conventional');
  const ct = CT_SPECS[ctIdx];

  const calc = useMemo(() => {
    const iSec = faultCurrent * 1000 / ct.primary;
    const vBurden = iSec * ct.burden;
    const saturated = vBurden > ct.kneeV;
    const vPTsec = (busVoltage * 1000 / Math.sqrt(3)) / PT_RATIO.ratio;
    const mA = Math.min(20, 4 + (iSec / ct.secondary) / 20 * 16);
    const adc = Math.round((mA - 4) / 16 * 4095);
    return { iSec: iSec.toFixed(2), vBurden: vBurden.toFixed(1), saturated, vPTsec: vPTsec.toFixed(1), mA: mA.toFixed(1), adc };
  }, [faultCurrent, ctIdx, busVoltage, ct]);

  const W = 900, H = 420;
  return (
    <div style={S.simBody}>
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, maxHeight: H }}>
          <defs>
            <marker id="arrowG" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4" fill="#22c55e" /></marker>
            <marker id="arrowB" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0,0 L6,2 L0,4" fill="#3b82f6" /></marker>
          </defs>
          {/* Bus bar */}
          <rect x={40} y={30} width={10} height={100} rx={3} fill="#f59e0b" opacity={0.8} />
          <text x={25} y={20} fill="#f59e0b" fontSize={11} fontWeight={700} textAnchor="middle">220 kV</text>
          <text x={25} y={145} fill="#71717a" fontSize={9}>Bus</text>

          {/* CT Symbol */}
          <line x1={45} y1={80} x2={130} y2={80} stroke="#52525b" strokeWidth={2} />
          <circle cx={145} cy={80} r={14} fill="none" stroke="#22c55e" strokeWidth={2} />
          <circle cx={157} cy={80} r={14} fill="none" stroke="#22c55e" strokeWidth={2} />
          <text x={151} y={60} fill="#22c55e" fontSize={11} fontWeight={600} textAnchor="middle">CT</text>
          <text x={151} y={110} fill="#52525b" fontSize={9} textAnchor="middle">{ct.label}</text>

          {/* PT Symbol */}
          <line x1={45} y1={80} x2={80} y2={140} stroke="#52525b" strokeWidth={1.5} strokeDasharray="4,3" />
          <circle cx={95} cy={155} r={12} fill="none" stroke="#f59e0b" strokeWidth={2} />
          <circle cx={107} cy={155} r={12} fill="none" stroke="#f59e0b" strokeWidth={2} />
          <text x={101} y={140} fill="#f59e0b" fontSize={11} fontWeight={600} textAnchor="middle">PT</text>
          <text x={101} y={180} fill="#52525b" fontSize={9} textAnchor="middle">{PT_RATIO.ratio}:1</text>

          {/* CB Symbol */}
          <line x1={170} y1={80} x2={220} y2={80} stroke="#52525b" strokeWidth={2} />
          <rect x={220} y={68} width={24} height={24} rx={4} fill="none" stroke="#3b82f6" strokeWidth={2} />
          <text x={232} y={84} fill="#3b82f6" fontSize={10} fontWeight={700} textAnchor="middle">CB</text>
          <line x1={244} y1={80} x2={280} y2={80} stroke="#52525b" strokeWidth={2} />
          <text x={260} y={65} fill="#52525b" fontSize={9}>To Line</text>

          {mode === 'conventional' ? (
            <>
              {/* Conventional: CT secondary → marshalling → RTU */}
              <path d="M170,80 L170,200 L350,200" stroke="#22c55e" strokeWidth={1.5} fill="none" markerEnd="url(#arrowG)" strokeDasharray="6,3">
                <animate attributeName="strokeDashoffset" from="18" to="0" dur="1s" repeatCount="indefinite" />
              </path>
              <text x={200} y={195} fill="#22c55e" fontSize={9}>CT secondary ({calc.iSec} A)</text>

              <path d="M115,168 L115,230 L350,230" stroke="#f59e0b" strokeWidth={1.5} fill="none" markerEnd="url(#arrowG)" strokeDasharray="6,3">
                <animate attributeName="strokeDashoffset" from="18" to="0" dur="1.2s" repeatCount="indefinite" />
              </path>
              <text x={200} y={225} fill="#f59e0b" fontSize={9}>PT secondary ({calc.vPTsec} V)</text>

              {/* Marshalling Kiosk */}
              <rect x={350} y={180} width={100} height={70} rx={8} fill="#18181b" stroke="#27272a" strokeWidth={1.5} />
              <text x={400} y={200} fill="#a1a1aa" fontSize={11} fontWeight={600} textAnchor="middle">Marshalling</text>
              <text x={400} y={215} fill="#a1a1aa" fontSize={11} fontWeight={600} textAnchor="middle">Kiosk</text>
              <text x={400} y={240} fill="#52525b" fontSize={9} textAnchor="middle">Terminal blocks + fuses</text>

              {/* 4-20mA to RTU */}
              <path d="M450,215 L560,215" stroke="#3b82f6" strokeWidth={1.5} fill="none" markerEnd="url(#arrowB)" strokeDasharray="6,3">
                <animate attributeName="strokeDashoffset" from="18" to="0" dur="0.8s" repeatCount="indefinite" />
              </path>
              <text x={505} y={208} fill="#3b82f6" fontSize={9} textAnchor="middle">4-20 mA</text>

              {/* RTU */}
              <rect x={560} y={170} width={130} height={90} rx={10} fill="#18181b" stroke="#6366f1" strokeWidth={2} />
              <text x={625} y={195} fill="#6366f1" fontSize={13} fontWeight={700} textAnchor="middle">RTU</text>
              <text x={625} y={212} fill="#52525b" fontSize={9} textAnchor="middle">A/D Conversion</text>
              <text x={625} y={230} fill="#a1a1aa" fontSize={10} fontWeight={600} fontFamily="monospace" textAnchor="middle">
                {calc.mA} mA → {calc.adc}
              </text>
              <text x={625} y={248} fill="#52525b" fontSize={8} textAnchor="middle">12-bit ADC (0-4095)</text>

              {/* To SLDC arrow */}
              <path d="M690,215 L800,215" stroke="#6366f1" strokeWidth={2} fill="none" markerEnd="url(#arrowB)">
                <animate attributeName="strokeDashoffset" from="12" to="0" dur="0.6s" repeatCount="indefinite" />
              </path>
              <text x={745} y={205} fill="#6366f1" fontSize={9} textAnchor="middle">IEC 104</text>
              <text x={745} y={232} fill="#52525b" fontSize={8} textAnchor="middle">to SLDC</text>

              {/* Wire count callout */}
              <rect x={350} y={280} width={340} height={40} rx={8} fill="rgba(239,68,68,0.06)" stroke="#ef444430" />
              <text x={520} y={298} fill="#fca5a5" fontSize={11} fontWeight={600} textAnchor="middle">Conventional: ~800m control cable per bay</text>
              <text x={520} y={312} fill="#71717a" fontSize={9} textAnchor="middle">Analog signals, hardwired digital I/O, dedicated pairs for each function</text>
            </>
          ) : (
            <>
              {/* Process Bus: CT/PT → Merging Unit → Ethernet → IED */}
              {/* Merging Unit at CT */}
              <rect x={160} y={120} width={80} height={40} rx={6} fill="#18181b" stroke="#22c55e" strokeWidth={1.5} />
              <text x={200} y={138} fill="#22c55e" fontSize={10} fontWeight={600} textAnchor="middle">MU-1</text>
              <text x={200} y={152} fill="#52525b" fontSize={8} textAnchor="middle">Merging Unit</text>
              <line x1={157} y1={95} x2={195} y2={120} stroke="#22c55e" strokeWidth={1} strokeDasharray="3,2" />

              {/* Merging Unit at PT */}
              <rect x={70} y={190} width={70} height={35} rx={6} fill="#18181b" stroke="#f59e0b" strokeWidth={1.5} />
              <text x={105} y={207} fill="#f59e0b" fontSize={10} fontWeight={600} textAnchor="middle">MU-2</text>
              <text x={105} y={220} fill="#52525b" fontSize={8} textAnchor="middle">Merging Unit</text>

              {/* Process Bus (Ethernet) */}
              <rect x={280} y={140} width={200} height={30} rx={15} fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth={1} />
              <text x={380} y={160} fill="#22c55e" fontSize={11} fontWeight={700} textAnchor="middle">Process Bus (Ethernet)</text>

              {/* SV streams */}
              <path d="M240,140 L290,155" stroke="#22c55e" strokeWidth={1.5} fill="none" strokeDasharray="4,2">
                <animate attributeName="strokeDashoffset" from="12" to="0" dur="0.4s" repeatCount="indefinite" />
              </path>
              <text x={260} y={138} fill="#22c55e" fontSize={8}>SV (IEC 61850-9-2)</text>

              <path d="M140,207 L290,160" stroke="#f59e0b" strokeWidth={1.5} fill="none" strokeDasharray="4,2">
                <animate attributeName="strokeDashoffset" from="12" to="0" dur="0.4s" repeatCount="indefinite" />
              </path>
              <text x={180} y={198} fill="#f59e0b" fontSize={8}>SV</text>

              {/* IED receives SV */}
              <rect x={520} y={130} width={120} height={55} rx={10} fill="#18181b" stroke="#ec4899" strokeWidth={2} />
              <text x={580} y={153} fill="#ec4899" fontSize={12} fontWeight={700} textAnchor="middle">IED</text>
              <text x={580} y={170} fill="#52525b" fontSize={9} textAnchor="middle">Protection + Metering</text>
              <path d="M480,155 L520,155" stroke="#22c55e" strokeWidth={1.5} fill="none" markerEnd="url(#arrowG)">
                <animate attributeName="strokeDashoffset" from="8" to="0" dur="0.3s" repeatCount="indefinite" />
              </path>

              {/* Station Bus */}
              <rect x={520} y={210} width={200} height={25} rx={12} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth={1} />
              <text x={620} y={227} fill="#6366f1" fontSize={10} fontWeight={700} textAnchor="middle">Station Bus (GOOSE + MMS)</text>
              <line x1={580} y1={185} x2={580} y2={210} stroke="#6366f1" strokeWidth={1.5} />

              {/* Gateway */}
              <rect x={560} y={260} width={120} height={45} rx={10} fill="#18181b" stroke="#6366f1" strokeWidth={2} />
              <text x={620} y={280} fill="#6366f1" fontSize={11} fontWeight={700} textAnchor="middle">Gateway</text>
              <text x={620} y={295} fill="#52525b" fontSize={9} textAnchor="middle">61850 → IEC 104</text>
              <line x1={620} y1={235} x2={620} y2={260} stroke="#6366f1" strokeWidth={1.5} />

              {/* To SLDC */}
              <path d="M680,282 L800,282" stroke="#6366f1" strokeWidth={2} fill="none" markerEnd="url(#arrowB)" strokeDasharray="6,3">
                <animate attributeName="strokeDashoffset" from="12" to="0" dur="0.6s" repeatCount="indefinite" />
              </path>
              <text x={740} y={275} fill="#6366f1" fontSize={9} textAnchor="middle">IEC 104</text>

              {/* Wire count callout */}
              <rect x={280} y={330} width={340} height={40} rx={8} fill="rgba(34,197,94,0.06)" stroke="#22c55e30" />
              <text x={450} y={348} fill="#86efac" fontSize={11} fontWeight={600} textAnchor="middle">Process Bus: 2 Ethernet drops per bay</text>
              <text x={450} y={362} fill="#71717a" fontSize={9} textAnchor="middle">Sampled Values replace all analog wiring — 95% copper reduction</text>
            </>
          )}

          {/* Saturation warning */}
          {calc.saturated && (
            <g>
              <rect x={350} y={30} width={240} height={50} rx={8} fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth={1.5} />
              <text x={470} y={50} fill="#ef4444" fontSize={12} fontWeight={700} textAnchor="middle">CT SATURATED</text>
              <text x={470} y={68} fill="#fca5a5" fontSize={10} textAnchor="middle">V_burden ({calc.vBurden}V) {'>'} V_knee ({ct.kneeV}V)</text>
            </g>
          )}

          {/* Waveform inset */}
          <rect x={700} y={30} width={180} height={100} rx={8} fill="#111116" stroke="#27272a" />
          <text x={790} y={48} fill="#71717a" fontSize={9} fontWeight={600} textAnchor="middle">CT Secondary Waveform</text>
          {(() => {
            const wx = 710, wy = 85, ww = 160, wh = 35;
            const pts = Array.from({ length: 80 }, (_, i) => {
              const t = i / 79;
              const angle = t * 4 * Math.PI;
              let amp = Math.sin(angle);
              if (calc.saturated) amp = Math.max(-0.7, Math.min(0.7, amp * 1.8));
              return `${wx + t * ww},${wy - amp * wh}`;
            }).join(' ');
            return <polyline points={pts} fill="none" stroke={calc.saturated ? '#ef4444' : '#22c55e'} strokeWidth={1.5} />;
          })()}
          <line x1={710} y1={85} x2={870} y2={85} stroke="#27272a" strokeWidth={0.5} />
        </svg>
      </div>
      <div style={S.controls}>
        <div style={S.cg}>
          <span style={S.label}>Fault Current</span>
          <input type="range" min={1} max={40} step={0.5} value={faultCurrent} onChange={e => setFaultCurrent(+e.target.value)} style={S.slider} />
          <span style={S.val}>{faultCurrent} kA</span>
        </div>
        <div style={S.cg}>
          <span style={S.label}>CT Ratio</span>
          <select value={ctIdx} onChange={e => setCtIdx(+e.target.value)} style={S.sel}>
            {CT_SPECS.map((c, i) => <option key={i} value={i}>{c.label} ({c.class})</option>)}
          </select>
        </div>
        <div style={S.cg}>
          <span style={S.label}>Bus Voltage</span>
          <input type="range" min={200} max={240} step={1} value={busVoltage} onChange={e => setBusVoltage(+e.target.value)} style={S.slider} />
          <span style={S.val}>{busVoltage} kV</span>
        </div>
        <button style={S.btn(mode === 'conventional')} onClick={() => setMode('conventional')}>Conventional</button>
        <button style={S.btn(mode === 'process')} onClick={() => setMode('process')}>Process Bus (61850)</button>
      </div>
      <div style={S.results}>
        <div style={S.ri}><span style={S.rl}>CT Secondary</span><span style={{ ...S.rv, color: calc.saturated ? '#ef4444' : '#22c55e' }}>{calc.iSec} A</span></div>
        <div style={S.ri}><span style={S.rl}>V Burden</span><span style={{ ...S.rv, color: calc.saturated ? '#ef4444' : '#a1a1aa' }}>{calc.vBurden} V</span></div>
        <div style={S.ri}><span style={S.rl}>V Knee</span><span style={S.rv}>{ct.kneeV} V</span></div>
        <div style={S.ri}><span style={S.rl}>PT Secondary</span><span style={{ ...S.rv, color: '#f59e0b' }}>{calc.vPTsec} V</span></div>
        <div style={S.ri}><span style={S.rl}>4-20mA</span><span style={S.rv}>{calc.mA} mA</span></div>
        <div style={S.ri}><span style={S.rl}>ADC (12-bit)</span><span style={{ ...S.rv, color: '#6366f1' }}>{calc.adc}</span></div>
        <div style={S.ri}><span style={S.rl}>Status</span><span style={{ ...S.rv, color: calc.saturated ? '#ef4444' : '#22c55e' }}>{calc.saturated ? 'SATURATED' : 'NORMAL'}</span></div>
      </div>
    </div>
  );
}

/* ──────────────────────────── TAB 2: 61850 ARCHITECTURE ──────────────────────────── */
function ArchitectureTab() {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [prpEnabled, setPrpEnabled] = useState(true);
  const [switchFail, setSwitchFail] = useState(false);

  const W = 900, H = 480;
  return (
    <div style={S.simBody}>
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, maxHeight: H }}>
          {/* Level labels */}
          <rect x={10} y={20} width={90} height={110} rx={8} fill="rgba(99,102,241,0.06)" stroke="#6366f130" />
          <text x={55} y={40} fill="#6366f1" fontSize={10} fontWeight={700} textAnchor="middle">STATION</text>
          <text x={55} y={55} fill="#6366f1" fontSize={10} fontWeight={700} textAnchor="middle">LEVEL</text>
          <text x={55} y={75} fill="#52525b" fontSize={8} textAnchor="middle">MMS (TCP/IP)</text>
          <text x={55} y={90} fill="#52525b" fontSize={8} textAnchor="middle">HMI, Gateway</text>
          <text x={55} y={105} fill="#52525b" fontSize={8} textAnchor="middle">~100ms</text>

          <rect x={10} y={150} width={90} height={120} rx={8} fill="rgba(236,72,153,0.06)" stroke="#ec489930" />
          <text x={55} y={170} fill="#ec4899" fontSize={10} fontWeight={700} textAnchor="middle">BAY</text>
          <text x={55} y={185} fill="#ec4899" fontSize={10} fontWeight={700} textAnchor="middle">LEVEL</text>
          <text x={55} y={205} fill="#52525b" fontSize={8} textAnchor="middle">GOOSE (L2)</text>
          <text x={55} y={220} fill="#52525b" fontSize={8} textAnchor="middle">IEDs, relays</text>
          <text x={55} y={235} fill="#52525b" fontSize={8} textAnchor="middle">{'<'}4ms</text>

          <rect x={10} y={290} width={90} height={120} rx={8} fill="rgba(34,197,94,0.06)" stroke="#22c55e30" />
          <text x={55} y={310} fill="#22c55e" fontSize={10} fontWeight={700} textAnchor="middle">PROCESS</text>
          <text x={55} y={325} fill="#22c55e" fontSize={10} fontWeight={700} textAnchor="middle">LEVEL</text>
          <text x={55} y={345} fill="#52525b" fontSize={8} textAnchor="middle">SV (L2)</text>
          <text x={55} y={360} fill="#52525b" fontSize={8} textAnchor="middle">MUs, CTs, PTs</text>
          <text x={55} y={375} fill="#52525b" fontSize={8} textAnchor="middle">4000 smp/s</text>

          {/* Station Level */}
          <rect x={150} y={30} width={110} height={50} rx={10} fill="#18181b" stroke="#6366f1" strokeWidth={2} />
          <text x={205} y={52} fill="#6366f1" fontSize={11} fontWeight={700} textAnchor="middle">HMI</text>
          <text x={205} y={68} fill="#52525b" fontSize={8} textAnchor="middle">Local Operator</text>

          <rect x={300} y={30} width={110} height={50} rx={10} fill="#18181b" stroke="#6366f1" strokeWidth={2} />
          <text x={355} y={52} fill="#6366f1" fontSize={11} fontWeight={700} textAnchor="middle">Gateway</text>
          <text x={355} y={68} fill="#52525b" fontSize={8} textAnchor="middle">61850 → IEC 104</text>

          <rect x={450} y={30} width={130} height={50} rx={10} fill="#18181b" stroke="#6366f1" strokeWidth={2} />
          <text x={515} y={52} fill="#6366f1" fontSize={11} fontWeight={700} textAnchor="middle">GPS Clock</text>
          <text x={515} y={68} fill="#52525b" fontSize={8} textAnchor="middle">IEEE 1588 PTP</text>

          {/* Station Bus */}
          <rect x={130} y={100} width={500} height={24} rx={12} fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth={1.5} />
          <text x={380} y={116} fill="#c4b5fd" fontSize={11} fontWeight={700} textAnchor="middle">Station Bus — MMS + GOOSE (Ethernet 100Mbps)</text>
          <line x1={205} y1={80} x2={205} y2={100} stroke="#6366f1" strokeWidth={1.5} />
          <line x1={355} y1={80} x2={355} y2={100} stroke="#6366f1" strokeWidth={1.5} />
          <line x1={515} y1={80} x2={515} y2={100} stroke="#6366f1" strokeWidth={1.5} />

          {/* VLANs */}
          <rect x={650} y={95} width={230} height={80} rx={8} fill="#111116" stroke="#27272a" />
          <text x={765} y={115} fill="#a1a1aa" fontSize={10} fontWeight={700} textAnchor="middle">VLAN Segregation</text>
          <text x={765} y={132} fill="#6366f1" fontSize={9} textAnchor="middle">VLAN 100: MMS Traffic</text>
          <text x={765} y={148} fill="#ec4899" fontSize={9} textAnchor="middle">VLAN 200: GOOSE Traffic</text>
          <text x={765} y={164} fill="#22c55e" fontSize={9} textAnchor="middle">VLAN 300: SV Traffic</text>

          {/* Bay Level - IEDs */}
          {[
            { x: 150, name: 'PDIS', label: 'Distance', bay: 'Bay 1' },
            { x: 280, name: 'PTOC', label: 'Overcurrent', bay: 'Bay 1' },
            { x: 410, name: 'PDIF', label: 'Busbar Prot', bay: 'Bus' },
            { x: 540, name: 'RBRF', label: 'Breaker Fail', bay: 'Bay 2' },
          ].map((ied, i) => (
            <g key={i}>
              <line x1={ied.x + 45} y1={124} x2={ied.x + 45} y2={160} stroke="#ec4899" strokeWidth={1.5} />
              <rect x={ied.x} y={160} width={90} height={55} rx={8} fill="#18181b" stroke="#ec4899" strokeWidth={1.5} />
              <text x={ied.x + 45} y={180} fill="#ec4899" fontSize={11} fontWeight={700} textAnchor="middle">{ied.name}</text>
              <text x={ied.x + 45} y={195} fill="#52525b" fontSize={8} textAnchor="middle">{ied.label}</text>
              <text x={ied.x + 45} y={208} fill="#71717a" fontSize={7} textAnchor="middle">{ied.bay}</text>
            </g>
          ))}

          {/* GOOSE arrows between IEDs */}
          <path d="M195,190 Q260,175 280,190" fill="none" stroke="#ec4899" strokeWidth={1} strokeDasharray="4,2" opacity={0.6}>
            <animate attributeName="strokeDashoffset" from="12" to="0" dur="0.8s" repeatCount="indefinite" />
          </path>
          <text x={240} y={175} fill="#ec489980" fontSize={7} textAnchor="middle">GOOSE</text>

          {/* Ethernet Switches (PRP) */}
          <rect x={200} y={235} width={80} height={30} rx={6} fill={switchFail ? 'rgba(239,68,68,0.15)' : '#18181b'} stroke={switchFail ? '#ef4444' : '#3b82f6'} strokeWidth={1.5} />
          <text x={240} y={254} fill={switchFail ? '#ef4444' : '#3b82f6'} fontSize={9} fontWeight={600} textAnchor="middle">{switchFail ? 'SW-A ✕' : 'Switch A'}</text>

          {prpEnabled && (
            <>
              <rect x={400} y={235} width={80} height={30} rx={6} fill="#18181b" stroke="#22c55e" strokeWidth={1.5} />
              <text x={440} y={254} fill="#22c55e" fontSize={9} fontWeight={600} textAnchor="middle">Switch B</text>
              <text x={340} y={252} fill="#71717a" fontSize={7} textAnchor="middle">PRP</text>
              <line x1={280} y1={250} x2={400} y2={250} stroke={switchFail ? '#22c55e' : '#3b82f6'} strokeWidth={1} strokeDasharray="3,2" />
            </>
          )}

          {switchFail && prpEnabled && (
            <g>
              <rect x={650} y={230} width={200} height={35} rx={6} fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth={1} />
              <text x={750} y={248} fill="#22c55e" fontSize={10} fontWeight={600} textAnchor="middle">PRP Failover Active</text>
              <text x={750} y={260} fill="#52525b" fontSize={8} textAnchor="middle">Zero packet loss — seamless switch</text>
            </g>
          )}
          {switchFail && !prpEnabled && (
            <g>
              <rect x={650} y={230} width={200} height={35} rx={6} fill="rgba(239,68,68,0.1)" stroke="#ef4444" strokeWidth={1} />
              <text x={750} y={248} fill="#ef4444" fontSize={10} fontWeight={600} textAnchor="middle">COMMUNICATION LOST</text>
              <text x={750} y={260} fill="#fca5a5" fontSize={8} textAnchor="middle">No redundancy — all GOOSE/MMS down</text>
            </g>
          )}

          {/* Process Bus */}
          <rect x={130} y={290} width={500} height={24} rx={12} fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth={1.5} />
          <text x={380} y={306} fill="#86efac" fontSize={11} fontWeight={700} textAnchor="middle">Process Bus — Sampled Values (Ethernet 100Mbps)</text>

          {/* Merging Units */}
          {[
            { x: 170, name: 'MU-1', bay: 'Bay 1 CT/PT' },
            { x: 320, name: 'MU-2', bay: 'Bay 2 CT/PT' },
            { x: 470, name: 'MU-3', bay: 'Xfmr CT' },
          ].map((mu, i) => (
            <g key={i}>
              <line x1={mu.x + 40} y1={314} x2={mu.x + 40} y2={340} stroke="#22c55e" strokeWidth={1.5} />
              <rect x={mu.x} y={340} width={80} height={40} rx={6} fill="#18181b" stroke="#22c55e" strokeWidth={1.5} />
              <text x={mu.x + 40} y={358} fill="#22c55e" fontSize={10} fontWeight={600} textAnchor="middle">{mu.name}</text>
              <text x={mu.x + 40} y={372} fill="#52525b" fontSize={8} textAnchor="middle">{mu.bay}</text>

              {/* CT/PT symbols below */}
              <circle cx={mu.x + 20} cy={410} r={8} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
              <circle cx={mu.x + 30} cy={410} r={8} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
              <text x={mu.x + 25} y={430} fill="#52525b" fontSize={7} textAnchor="middle">CT</text>
              <circle cx={mu.x + 55} cy={410} r={8} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
              <circle cx={mu.x + 65} cy={410} r={8} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
              <text x={mu.x + 60} y={430} fill="#52525b" fontSize={7} textAnchor="middle">PT</text>
              <line x1={mu.x + 40} y1={380} x2={mu.x + 40} y2={400} stroke="#52525b" strokeWidth={1} />
            </g>
          ))}

          {/* SV stream animation */}
          {[170, 320, 470].map((mx, i) => (
            <g key={i}>
              <line x1={mx + 40} y1={340} x2={mx + 40} y2={314} stroke="#22c55e" strokeWidth={1.5} strokeDasharray="4,2">
                <animate attributeName="strokeDashoffset" from="12" to="0" dur="0.3s" repeatCount="indefinite" />
              </line>
            </g>
          ))}

          {/* IED connections to process bus */}
          <line x1={195} y1={215} x2={195} y2={290} stroke="#71717a" strokeWidth={1} strokeDasharray="3,3" />
          <line x1={325} y1={215} x2={355} y2={290} stroke="#71717a" strokeWidth={1} strokeDasharray="3,3" />

          {/* Timing requirements */}
          <rect x={650} y={340} width={230} height={100} rx={8} fill="#111116" stroke="#27272a" />
          <text x={765} y={360} fill="#a1a1aa" fontSize={10} fontWeight={700} textAnchor="middle">Timing Requirements</text>
          <text x={765} y={380} fill="#22c55e" fontSize={9} textAnchor="middle">SV: 4000 samples/sec (80/cycle)</text>
          <text x={765} y={396} fill="#ec4899" fontSize={9} textAnchor="middle">GOOSE: {'<'} 4ms transfer time</text>
          <text x={765} y={412} fill="#6366f1" fontSize={9} textAnchor="middle">MMS: ~100ms typical response</text>
          <text x={765} y={428} fill="#f59e0b" fontSize={9} textAnchor="middle">PTP: {'<'} 1μs clock accuracy</text>
        </svg>
      </div>
      <div style={S.controls}>
        <button style={S.btn(prpEnabled)} onClick={() => setPrpEnabled(p => !p)}>
          PRP Redundancy: {prpEnabled ? 'ON' : 'OFF'}
        </button>
        <button style={S.btn(false, switchFail)} onClick={() => setSwitchFail(s => !s)}>
          {switchFail ? 'Restore Switch A' : 'Fail Switch A'}
        </button>
        <div style={{ ...S.panel, flex: 1, margin: 0, padding: '8px 14px' }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>
            IEC 61850 replaces vendor-proprietary protocols with a single standard. Three communication services — <span style={{ color: '#6366f1' }}>MMS</span> (monitoring/control), <span style={{ color: '#ec4899' }}>GOOSE</span> (fast peer-to-peer), <span style={{ color: '#22c55e' }}>SV</span> (digitized waveforms) — all over standard Ethernet.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── TAB 3: GOOSE DEEP-DIVE ──────────────────────────── */
function GooseTab() {
  const [faultActive, setFaultActive] = useState(false);
  const [stNum, setStNum] = useState(0);
  const [sqNum, setSqNum] = useState(0);
  const [retransmitIdx, setRetransmitIdx] = useState(-1);
  const [messages, setMessages] = useState([]);
  const [failMode, setFailMode] = useState('none');
  const [compareMode, setCompareMode] = useState(false);
  const timerRef = useRef(null);

  const injectFault = useCallback(() => {
    if (faultActive) return;
    setFaultActive(true);
    setStNum(s => s + 1);
    setSqNum(0);
    setRetransmitIdx(0);
    setMessages([{ time: 0, type: 'STATE_CHANGE', stNum: stNum + 1, sqNum: 0 }]);
  }, [faultActive, stNum]);

  const resetFault = useCallback(() => {
    setFaultActive(false);
    setRetransmitIdx(-1);
    setMessages([]);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!faultActive || retransmitIdx < 0) return;
    if (retransmitIdx >= GOOSE_RETRANSMIT.length) {
      // heartbeat mode
      timerRef.current = setTimeout(() => {
        setSqNum(s => s + 1);
        setMessages(m => [...m.slice(-8), { time: Date.now(), type: 'HEARTBEAT', stNum, sqNum: sqNum + 1 }]);
        setRetransmitIdx(GOOSE_RETRANSMIT.length);
      }, 1000);
      return;
    }
    const delay = Math.min(GOOSE_RETRANSMIT[retransmitIdx] * 5, 2000); // scaled for visibility
    timerRef.current = setTimeout(() => {
      setSqNum(s => s + 1);
      setMessages(m => [...m.slice(-8), {
        time: GOOSE_RETRANSMIT[retransmitIdx],
        type: 'RETRANSMIT',
        stNum,
        sqNum: retransmitIdx + 1,
        interval: GOOSE_RETRANSMIT[retransmitIdx],
      }]);
      setRetransmitIdx(i => i + 1);
    }, delay);
    return () => clearTimeout(timerRef.current);
  }, [faultActive, retransmitIdx, stNum, sqNum]);

  const failureActive = failMode !== 'none';
  const failure = GOOSE_FAILURES.find(f => f.id === failMode);

  const W = 900, H = compareMode ? 350 : 420;

  const IEDs = [
    { x: 120, y: 120, name: 'PDIS', label: 'Distance', role: 'publisher', color: '#ec4899' },
    { x: 320, y: 60, name: 'PTOC', label: 'Overcurrent', role: 'subscriber', color: '#f59e0b' },
    { x: 520, y: 60, name: 'RBRF', label: 'Breaker Fail', role: 'subscriber', color: '#ef4444' },
    { x: 720, y: 120, name: 'CSWI', label: 'Bay Controller', role: 'subscriber', color: '#3b82f6' },
    { x: 320, y: 200, name: 'PDIF', label: 'Busbar Prot', role: 'subscriber', color: '#818cf8' },
    { x: 520, y: 200, name: 'MMXU', label: 'Measurement', role: 'subscriber', color: '#22c55e' },
  ];

  return (
    <div style={S.simBody}>
      <div style={S.svgWrap}>
        {compareMode ? (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, maxHeight: H }}>
            {/* Conventional side */}
            <text x={220} y={25} fill="#ef4444" fontSize={14} fontWeight={700} textAnchor="middle">Conventional (Hardwired)</text>
            <rect x={20} y={35} width={400} height={300} rx={10} fill="rgba(239,68,68,0.03)" stroke="#ef444430" />
            {/* Relay boxes */}
            {[{ x: 60, y: 80, n: 'R1' }, { x: 180, y: 80, n: 'R2' }, { x: 300, y: 80, n: 'R3' },
              { x: 60, y: 180, n: 'R4' }, { x: 180, y: 180, n: 'R5' }, { x: 300, y: 180, n: 'R6' }].map((r, i) => (
              <g key={i}>
                <rect x={r.x} y={r.y} width={60} height={40} rx={6} fill="#18181b" stroke="#71717a" strokeWidth={1} />
                <text x={r.x + 30} y={r.y + 24} fill="#a1a1aa" fontSize={10} fontWeight={600} textAnchor="middle">{r.n}</text>
              </g>
            ))}
            {/* Spaghetti wiring */}
            {[[90, 100, 210, 100], [90, 100, 90, 180], [90, 100, 330, 100], [210, 100, 330, 100],
              [210, 100, 210, 180], [210, 100, 330, 180], [330, 100, 90, 180], [330, 100, 210, 180],
              [90, 200, 210, 200], [210, 200, 330, 200], [90, 200, 330, 200], [330, 100, 330, 180],
              [90, 120, 180, 180], [300, 120, 210, 180]].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ef444440" strokeWidth={1} />
            ))}
            <text x={220} y={260} fill="#71717a" fontSize={10} textAnchor="middle">48V DC hardwired between every relay pair</text>
            <text x={220} y={278} fill="#ef4444" fontSize={11} fontWeight={600} textAnchor="middle">~15 cable pairs × ~50m each = 750m copper</text>
            <text x={220} y={296} fill="#71717a" fontSize={9} textAnchor="middle">Commissioning: 2-3 weeks per bay</text>
            <text x={220} y={312} fill="#71717a" fontSize={9} textAnchor="middle">Modification: requires rewiring + outage</text>

            {/* IEC 61850 GOOSE side */}
            <text x={670} y={25} fill="#22c55e" fontSize={14} fontWeight={700} textAnchor="middle">IEC 61850 (GOOSE)</text>
            <rect x={470} y={35} width={400} height={300} rx={10} fill="rgba(34,197,94,0.03)" stroke="#22c55e30" />
            {/* Ethernet backbone */}
            <rect x={570} y={140} width={200} height={24} rx={12} fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth={1.5} />
            <text x={670} y={156} fill="#22c55e" fontSize={9} fontWeight={700} textAnchor="middle">Ethernet (GOOSE VLAN)</text>
            {/* IEDs connected cleanly */}
            {[{ x: 510, y: 80 }, { x: 630, y: 80 }, { x: 750, y: 80 },
              { x: 510, y: 200 }, { x: 630, y: 200 }, { x: 750, y: 200 }].map((r, i) => (
              <g key={i}>
                <rect x={r.x} y={r.y} width={60} height={40} rx={6} fill="#18181b" stroke="#22c55e" strokeWidth={1} />
                <text x={r.x + 30} y={r.y + 24} fill="#a1a1aa" fontSize={10} fontWeight={600} textAnchor="middle">IED{i + 1}</text>
                <line x1={r.x + 30} y1={r.y < 150 ? r.y + 40 : r.y} x2={r.x + 30} y2={r.y < 150 ? 140 : 164} stroke="#22c55e" strokeWidth={1.5} />
              </g>
            ))}
            <text x={670} y={270} fill="#22c55e" fontSize={11} fontWeight={600} textAnchor="middle">2 Ethernet cables per bay</text>
            <text x={670} y={288} fill="#71717a" fontSize={9} textAnchor="middle">Commissioning: 2-3 days per bay</text>
            <text x={670} y={306} fill="#71717a" fontSize={9} textAnchor="middle">Modification: software config change only</text>
          </svg>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, maxHeight: H }}>
            {/* Ethernet Switch */}
            <rect x={350} y={130} width={200} height={30} rx={15} fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth={1.5} />
            <text x={450} y={150} fill="#c4b5fd" fontSize={10} fontWeight={700} textAnchor="middle">Station Bus (Ethernet Switch)</text>

            {/* IEDs */}
            {IEDs.map((ied, i) => (
              <g key={i}>
                <line x1={ied.x + 40} y1={ied.role === 'publisher' ? ied.y : ied.y + 40}
                  x2={ied.x + 40} y2={ied.y < 145 ? 130 : 160}
                  stroke={failureActive && failMode === 'vlan' && ied.role === 'subscriber' && ied.name === 'RBRF' ? '#ef4444' : '#52525b'}
                  strokeWidth={1.5}
                  strokeDasharray={failureActive && failMode === 'vlan' && ied.role === 'subscriber' && ied.name === 'RBRF' ? '3,3' : 'none'} />
                <rect x={ied.x} y={ied.y} width={80} height={40} rx={8}
                  fill={faultActive && ied.role === 'publisher' ? 'rgba(239,68,68,0.15)' : '#18181b'}
                  stroke={faultActive && ied.role === 'publisher' ? '#ef4444' : ied.color}
                  strokeWidth={faultActive && ied.role === 'publisher' ? 2 : 1.5} />
                <text x={ied.x + 40} y={ied.y + 18} fill={ied.color} fontSize={11} fontWeight={700} textAnchor="middle">{ied.name}</text>
                <text x={ied.x + 40} y={ied.y + 32} fill="#52525b" fontSize={8} textAnchor="middle">{ied.label}</text>
                {/* Role badge */}
                {ied.role === 'publisher' && (
                  <rect x={ied.x + 15} y={ied.y - 12} width={50} height={14} rx={4} fill="rgba(239,68,68,0.15)" stroke="#ef444440" />
                )}
                {ied.role === 'publisher' && (
                  <text x={ied.x + 40} y={ied.y - 2} fill="#fca5a5" fontSize={7} fontWeight={700} textAnchor="middle">PUBLISHER</text>
                )}
              </g>
            ))}

            {/* GOOSE packet animation */}
            {faultActive && !failureActive && IEDs.filter(i => i.role === 'subscriber').map((sub, i) => (
              <circle key={i} r={4} fill="#ec4899" opacity={0.8}>
                <animateMotion dur="0.6s" repeatCount="indefinite"
                  path={`M${160},${145} L${sub.x + 40},${sub.y < 145 ? 130 : 160}`} />
              </circle>
            ))}

            {/* Retransmission timing diagram */}
            <rect x={30} y={270} width={840} height={130} rx={8} fill="#111116" stroke="#27272a" />
            <text x={50} y={290} fill="#a1a1aa" fontSize={10} fontWeight={700}>Retransmission Timeline</text>
            {/* Time axis */}
            <line x1={50} y1={350} x2={850} y2={350} stroke="#27272a" strokeWidth={1} />
            {GOOSE_RETRANSMIT.map((t, i) => {
              const cumulative = GOOSE_RETRANSMIT.slice(0, i + 1).reduce((a, b) => a + b, 0);
              const xPos = 50 + (cumulative / 2000) * 790;
              const active = retransmitIdx > i;
              return (
                <g key={i}>
                  <line x1={xPos} y1={310} x2={xPos} y2={350} stroke={active ? '#ec4899' : '#27272a'} strokeWidth={active ? 2 : 1} />
                  <text x={xPos} y={305} fill={active ? '#ec4899' : '#52525b'} fontSize={8} fontWeight={active ? 700 : 400} textAnchor="middle">{t}ms</text>
                  {active && <circle cx={xPos} cy={330} r={3} fill="#ec4899" />}
                </g>
              );
            })}
            <text x={50} y={370} fill="#52525b" fontSize={9}>t=0 (event)</text>
            <text x={830} y={370} fill="#52525b" fontSize={9} textAnchor="end">→ 1s heartbeat</text>
            {/* stNum/sqNum display */}
            <text x={450} y={390} fill="#71717a" fontSize={10} textAnchor="middle">
              stNum: <tspan fill="#ef4444" fontWeight={700} fontFamily="monospace">{stNum}</tspan>
              {'   '}sqNum: <tspan fill="#ef4444" fontWeight={700} fontFamily="monospace">{sqNum}</tspan>
            </text>

            {/* Failure overlay */}
            {failureActive && failure && (
              <g>
                <rect x={30} y={270} width={840} height={130} rx={8} fill="rgba(239,68,68,0.05)" />
                <rect x={200} y={280} width={500} height={80} rx={8} fill="#18181b" stroke={failure.color} strokeWidth={1.5} />
                <text x={450} y={300} fill={failure.color} fontSize={12} fontWeight={700} textAnchor="middle">{failure.label}</text>
                <text x={450} y={318} fill="#a1a1aa" fontSize={10} textAnchor="middle">{failure.desc.slice(0, 80)}...</text>
                <text x={450} y={340} fill="#22c55e" fontSize={9} textAnchor="middle">Fix: {failure.fix.slice(0, 90)}</text>
              </g>
            )}
          </svg>
        )}
      </div>

      {/* GOOSE Frame Dissector */}
      {!compareMode && (
        <div style={{ ...S.controls, flexDirection: 'column', alignItems: 'stretch', maxHeight: 180, overflowY: 'auto' }}>
          <span style={S.panelTitle}>GOOSE Frame Structure (IEEE 802.3 / IEC 61850-8-1)</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {GOOSE_FIELDS.map((f, i) => (
              <div key={i} style={{ ...S.frameField(f.color), flex: '1 1 280px' }}>
                <span style={S.fieldName}>{f.name}</span>
                <span style={S.fieldVal}>{f.name === 'stNum' ? `${stNum}` : f.name === 'sqNum' ? `${sqNum}` : f.value}</span>
                <span style={{ fontSize: 9, color: '#52525b', marginLeft: 'auto' }}>{f.bytes}B</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={S.controls}>
        <button style={S.btn(!faultActive)} onClick={injectFault} disabled={faultActive}>Inject Fault</button>
        <button style={S.btn(false, true)} onClick={resetFault}>Reset</button>
        <div style={{ width: 1, height: 24, background: '#27272a' }} />
        <button style={S.btn(compareMode)} onClick={() => setCompareMode(c => !c)}>
          {compareMode ? 'Station Bus View' : 'Compare: Copper vs GOOSE'}
        </button>
        <div style={{ width: 1, height: 24, background: '#27272a' }} />
        <span style={S.label}>Failure Mode</span>
        <select value={failMode} onChange={e => setFailMode(e.target.value)} style={S.sel}>
          <option value="none">Normal Operation</option>
          {GOOSE_FAILURES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
      </div>

      {/* Message log */}
      {messages.length > 0 && (
        <div style={S.alarmBar}>
          {messages.map((m, i) => (
            <div key={i} style={S.ac(m.type === 'STATE_CHANGE' ? 'fault' : m.type === 'RETRANSMIT' ? 'warn' : 'info')}>
              <span style={S.at}>{m.type === 'STATE_CHANGE' ? 't=0' : m.interval ? `+${m.interval}ms` : 'heartbeat'}</span>
              st:{m.stNum} sq:{m.sqNum}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────── TAB 4: DATA MODEL & SCL ──────────────────────────── */
function DataModelTab() {
  const [selectedBay, setSelectedBay] = useState('line1');
  const [expandedLN, setExpandedLN] = useState(null);
  const [expandedDO, setExpandedDO] = useState(null);

  const bayData = DATA_MODEL.logicalNodes[selectedBay];
  const nodes = bayData === 'same as line1' ? DATA_MODEL.logicalNodes.line1 : bayData;

  const sclPath = useMemo(() => {
    let path = `NLR220/${selectedBay.toUpperCase()}_LD`;
    if (expandedLN) {
      path += `/${expandedLN}`;
      if (expandedDO) path += `.${expandedDO}`;
    }
    return path;
  }, [selectedBay, expandedLN, expandedDO]);

  return (
    <div style={S.simBody}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Bay selector */}
        <div style={{ width: 240, borderRight: '1px solid #1e1e2e', overflowY: 'auto', padding: '12px' }}>
          <span style={S.panelTitle}>220kV Nellore Substation</span>
          {DATA_MODEL.bays.map(bay => (
            <div key={bay.id}
              onClick={() => { setSelectedBay(bay.id); setExpandedLN(null); setExpandedDO(null); }}
              style={{
                padding: '10px 12px', cursor: 'pointer', borderRadius: 8, marginBottom: 4,
                background: selectedBay === bay.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                border: selectedBay === bay.id ? '1px solid #6366f130' : '1px solid transparent',
              }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: selectedBay === bay.id ? '#c4b5fd' : '#a1a1aa' }}>{bay.name}</div>
              <div style={{ fontSize: 10, color: '#52525b', marginTop: 2 }}>{bay.equipment}</div>
            </div>
          ))}

          {/* Vendor mapping */}
          <div style={{ ...S.panel, marginTop: 16 }}>
            <span style={S.panelTitle}>Vendor-Neutral Mapping</span>
            <div style={{ fontSize: 10, color: '#71717a', lineHeight: 1.8 }}>
              Same LN path works across:<br />
              <span style={{ color: '#ef4444' }}>ABB</span> REL670<br />
              <span style={{ color: '#3b82f6' }}>Siemens</span> 7SA87<br />
              <span style={{ color: '#22c55e' }}>GE</span> D60<br />
              <span style={{ color: '#f59e0b' }}>L&T</span> MiCOM
            </div>
          </div>
        </div>

        {/* Right: Tree explorer */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {/* SCL Path display */}
          <div style={{ padding: '8px 16px', background: '#111116', borderBottom: '1px solid #1e1e2e', fontFamily: 'monospace', fontSize: 12 }}>
            <span style={{ color: '#52525b' }}>SCL Path: </span>
            <span style={{ color: '#c4b5fd' }}>{sclPath}</span>
          </div>

          {/* Hierarchy header */}
          <div style={{ padding: '8px 16px', display: 'flex', gap: 12, fontSize: 10, color: '#52525b', borderBottom: '1px solid #1e1e2e' }}>
            <span style={S.badge('#6366f1')}>PD</span> Physical Device
            <span style={S.badge('#818cf8')}>LD</span> Logical Device
            <span style={S.badge('#ec4899')}>LN</span> Logical Node
            <span style={S.badge('#f59e0b')}>DO</span> Data Object
            <span style={S.badge('#22c55e')}>DA</span> Data Attribute
          </div>

          {/* Physical Device */}
          <div style={S.treeNode(0, false)}>
            <span style={S.badge('#6366f1')}>PD</span> NLR220 (Nellore 220kV Substation)
          </div>

          {/* Logical Device */}
          <div style={S.treeNode(1, false)}>
            <span style={S.badge('#818cf8')}>LD</span> {selectedBay.toUpperCase()}_LD — {DATA_MODEL.bays.find(b => b.id === selectedBay)?.name}
          </div>

          {/* Logical Nodes */}
          {nodes.map((node, i) => (
            <React.Fragment key={i}>
              <div
                style={S.treeNode(2, expandedLN === node.ln)}
                onClick={() => { setExpandedLN(expandedLN === node.ln ? null : node.ln); setExpandedDO(null); }}>
                <span style={S.badge(LN_COLORS[node.type] || '#71717a')}>LN</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: LN_COLORS[node.type] || '#a1a1aa' }}>{node.ln}</span>
                <span style={{ color: '#52525b', marginLeft: 8, fontSize: 11 }}>— {node.class}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: '#3f3f46' }}>{expandedLN === node.ln ? '▾' : '▸'}</span>
              </div>

              {/* Data Objects */}
              {expandedLN === node.ln && Array.isArray(node.dos) && node.dos.map((dobj, j) => {
                const doName = typeof dobj === 'string' ? dobj : dobj.name;
                const doType = typeof dobj === 'string' ? '' : dobj.type;
                const doDesc = typeof dobj === 'string' ? '' : dobj.desc;
                return (
                  <React.Fragment key={j}>
                    <div
                      style={S.treeNode(3, expandedDO === doName)}
                      onClick={() => setExpandedDO(expandedDO === doName ? null : doName)}>
                      <span style={S.badge('#f59e0b')}>DO</span>
                      <span style={{ fontFamily: 'monospace', color: '#f59e0b' }}>{doName}</span>
                      {doType && <span style={{ color: '#52525b', marginLeft: 6, fontSize: 10 }}>[{doType}]</span>}
                      {doDesc && <span style={{ color: '#52525b', marginLeft: 6, fontSize: 10 }}>— {doDesc}</span>}
                      {doType && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#3f3f46' }}>{expandedDO === doName ? '▾' : '▸'}</span>}
                    </div>

                    {/* Data Attributes */}
                    {expandedDO === doName && doType && DATA_MODEL.dataAttributes[doType] && (
                      DATA_MODEL.dataAttributes[doType].map((da, k) => (
                        <div key={k} style={S.treeNode(4, false)}>
                          <span style={S.badge('#22c55e')}>DA</span>
                          <span style={{ fontFamily: 'monospace', color: '#22c55e', fontSize: 11 }}>{da}</span>
                        </div>
                      ))
                    )}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Integration issues */}
      <div style={S.controls}>
        <div style={{ ...S.panel, flex: 1, margin: 0, padding: '8px 14px' }}>
          <span style={S.panelTitle}>SCL Engineering Workflow</span>
          <span style={{ fontSize: 11, color: '#71717a', lineHeight: 1.6 }}>
            <span style={{ color: '#ec4899' }}>ICD</span> (vendor template) → <span style={{ color: '#6366f1' }}>SCD</span> (system integrator builds full station) → <span style={{ color: '#22c55e' }}>CID</span> (per-IED config downloaded to device).
            Any change to GOOSE datasets or data mappings requires regenerating CID files from the SCD.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────── TAB 5: IEC 60870-5-104 ──────────────────────────── */
function IEC104Tab() {
  const [connected, setConnected] = useState(false);
  const [connStep, setConnStep] = useState(-1);
  const [mode, setMode] = useState('spontaneous');
  const [selectedType, setSelectedType] = useState(30);
  const [frames, setFrames] = useState([]);
  const [polling, setPolling] = useState(false);
  const timerRef = useRef(null);

  const connect = useCallback(() => {
    if (connected) { setConnected(false); setConnStep(-1); setFrames([]); return; }
    setConnStep(0);
    // Animate TCP handshake + STARTDT
    const steps = [
      { delay: 400, step: 1, frame: { dir: '→', type: 'TCP SYN', color: '#3b82f6' } },
      { delay: 400, step: 2, frame: { dir: '←', type: 'TCP SYN-ACK', color: '#3b82f6' } },
      { delay: 300, step: 3, frame: { dir: '→', type: 'TCP ACK', color: '#3b82f6' } },
      { delay: 500, step: 4, frame: { dir: '→', type: 'U: STARTDT act', color: '#6366f1' } },
      { delay: 400, step: 5, frame: { dir: '←', type: 'U: STARTDT con', color: '#6366f1' } },
      { delay: 600, step: 6, frame: { dir: '→', type: 'I: C_IC_NA_1 (GI)', color: '#ec4899' } },
    ];
    let cumDelay = 0;
    steps.forEach(({ delay, step, frame }) => {
      cumDelay += delay;
      setTimeout(() => {
        setConnStep(step);
        setFrames(f => [...f, { ...frame, time: Date.now() }]);
        if (step === 6) setConnected(true);
      }, cumDelay);
    });
  }, [connected]);

  const triggerEvent = useCallback(() => {
    if (!connected) return;
    const typeInfo = IEC104_TYPES.find(t => t.id === selectedType);
    if (mode === 'spontaneous') {
      setFrames(f => [...f.slice(-12), {
        dir: '←', type: `I: ${typeInfo.name}`, color: '#22c55e',
        detail: `COT=3 (spontaneous) | IOA=1001 | ${typeInfo.example}`,
        time: Date.now(),
      }]);
    } else {
      // Cyclic: master polls first
      setFrames(f => [...f.slice(-12), {
        dir: '→', type: 'S: Ack', color: '#71717a', detail: 'Supervisory frame', time: Date.now(),
      }]);
      setTimeout(() => {
        setFrames(f => [...f.slice(-12), {
          dir: '←', type: `I: ${typeInfo.name}`, color: '#f59e0b',
          detail: `COT=1 (cyclic) | IOA=1001 | ${typeInfo.example}`,
          time: Date.now(),
        }]);
      }, 800);
    }
  }, [connected, selectedType, mode]);

  const W = 900, H = 340;

  return (
    <div style={S.simBody}>
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, maxHeight: H }}>
          {/* Substation side */}
          <rect x={30} y={80} width={140} height={80} rx={12} fill="#18181b" stroke="#ec4899" strokeWidth={2} />
          <text x={100} y={105} fill="#ec4899" fontSize={13} fontWeight={700} textAnchor="middle">RTU / Gateway</text>
          <text x={100} y={125} fill="#52525b" fontSize={9} textAnchor="middle">IEC 61850 → IEC 104</text>
          <text x={100} y={142} fill="#52525b" fontSize={8} textAnchor="middle">CASDU: 1 (Nellore SS)</text>

          {/* IEDs above RTU */}
          {['PDIS', 'MMXU', 'XCBR'].map((name, i) => (
            <g key={i}>
              <rect x={30 + i * 50} y={20} width={45} height={28} rx={5} fill="#18181b" stroke="#71717a" />
              <text x={52 + i * 50} y={38} fill="#71717a" fontSize={8} fontWeight={600} textAnchor="middle">{name}</text>
              <line x1={52 + i * 50} y1={48} x2={100} y2={80} stroke="#52525b" strokeWidth={0.5} />
            </g>
          ))}

          {/* WAN paths */}
          {/* OPGW */}
          <path d="M170,100 Q380,50 580,100" fill="none" stroke="#22c55e" strokeWidth={2} />
          <text x={380} y={55} fill="#22c55e" fontSize={10} fontWeight={600} textAnchor="middle">OPGW (Fiber Optic)</text>
          <text x={380} y={68} fill="#52525b" fontSize={8} textAnchor="middle">Primary — 2 Mbps+</text>
          {/* Animated packet on OPGW */}
          {connected && (
            <circle r={4} fill="#22c55e" opacity={0.8}>
              <animateMotion dur="2s" repeatCount="indefinite" path="M170,100 Q380,50 580,100" />
            </circle>
          )}

          {/* PLCC */}
          <path d="M170,130 Q380,160 580,130" fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="6,3" />
          <text x={380} y={165} fill="#f59e0b" fontSize={9} textAnchor="middle">PLCC (Power Line Carrier)</text>
          <text x={380} y={178} fill="#52525b" fontSize={8} textAnchor="middle">Backup — 64 kbps</text>

          {/* Leased line */}
          <path d="M170,150 Q380,200 580,150" fill="none" stroke="#71717a" strokeWidth={1} strokeDasharray="4,4" />
          <text x={380} y={208} fill="#71717a" fontSize={8} textAnchor="middle">MPLS VPN (Tertiary)</text>

          {/* SLDC */}
          <rect x={580} y={60} width={180} height={120} rx={12} fill="#18181b" stroke="#6366f1" strokeWidth={2} />
          <text x={670} y={85} fill="#6366f1" fontSize={14} fontWeight={700} textAnchor="middle">SLDC Vidyanagar</text>
          <text x={670} y={105} fill="#52525b" fontSize={9} textAnchor="middle">Front-End Processor</text>
          <text x={670} y={120} fill="#52525b" fontSize={9} textAnchor="middle">SCADA Server</text>
          <text x={670} y={135} fill="#52525b" fontSize={9} textAnchor="middle">EMS + Historian</text>
          <text x={670} y={155} fill="#71717a" fontSize={8} textAnchor="middle">~200 RTU connections</text>
          {connected && <circle cx={583} cy={63} r={4} fill="#22c55e"><animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" /></circle>}

          {/* Connection lifecycle */}
          {connStep >= 0 && (
            <g>
              <rect x={200} y={240} width={500} height={80} rx={8} fill="#111116" stroke="#27272a" />
              <text x={450} y={258} fill="#a1a1aa" fontSize={10} fontWeight={700} textAnchor="middle">Connection Lifecycle</text>
              {[
                { x: 220, label: 'SYN', done: connStep >= 1 },
                { x: 280, label: 'SYN-ACK', done: connStep >= 2 },
                { x: 360, label: 'ACK', done: connStep >= 3 },
                { x: 440, label: 'STARTDT\nact', done: connStep >= 4 },
                { x: 520, label: 'STARTDT\ncon', done: connStep >= 5 },
                { x: 620, label: 'GI\n(C_IC_NA_1)', done: connStep >= 6 },
              ].map((s, i) => (
                <g key={i}>
                  <circle cx={s.x} cy={290} r={10} fill={s.done ? '#22c55e20' : '#18181b'} stroke={s.done ? '#22c55e' : '#3f3f46'} strokeWidth={1.5} />
                  {s.done && <text x={s.x} y={293} fill="#22c55e" fontSize={8} fontWeight={700} textAnchor="middle">✓</text>}
                  <text x={s.x} y={310} fill={s.done ? '#86efac' : '#52525b'} fontSize={7} fontWeight={500} textAnchor="middle">{s.label.split('\n')[0]}</text>
                  {s.label.includes('\n') && <text x={s.x} y={318} fill={s.done ? '#86efac' : '#52525b'} fontSize={7} textAnchor="middle">{s.label.split('\n')[1]}</text>}
                  {i < 5 && <line x1={s.x + 12} y1={290} x2={[280, 360, 440, 520, 620][i] - 12} y2={290} stroke={s.done ? '#22c55e40' : '#27272a'} strokeWidth={1} />}
                </g>
              ))}
            </g>
          )}

          {/* Transmission towers along OPGW */}
          {[250, 330, 410, 490].map((tx, i) => (
            <g key={i}>
              <line x1={tx} y1={75 - Math.abs(tx - 380) * 0.08} x2={tx} y2={75 - Math.abs(tx - 380) * 0.08 + 15} stroke="#3f3f46" strokeWidth={1.5} />
              <line x1={tx - 5} y1={75 - Math.abs(tx - 380) * 0.08 + 15} x2={tx + 5} y2={75 - Math.abs(tx - 380) * 0.08 + 15} stroke="#3f3f46" strokeWidth={1} />
            </g>
          ))}
        </svg>
      </div>

      {/* Frame dissector */}
      <div style={{ ...S.controls, flexDirection: 'column', alignItems: 'stretch', maxHeight: 150, overflowY: 'auto' }}>
        <span style={S.panelTitle}>IEC 104 Frame Log (APCI + ASDU)</span>
        {frames.length === 0 ? (
          <span style={{ fontSize: 11, color: '#52525b' }}>Click Connect to initiate TCP + IEC 104 handshake...</span>
        ) : (
          frames.slice(-8).map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '3px 0', borderBottom: '1px solid #1a1a24' }}>
              <span style={{ fontSize: 11, color: f.dir === '→' ? '#3b82f6' : '#22c55e', fontWeight: 700, width: 16, textAlign: 'center' }}>{f.dir}</span>
              <span style={{ fontSize: 11, color: f.color, fontWeight: 600, fontFamily: 'monospace', minWidth: 160 }}>{f.type}</span>
              {f.detail && <span style={{ fontSize: 10, color: '#52525b' }}>{f.detail}</span>}
            </div>
          ))
        )}
      </div>

      <div style={S.controls}>
        <button style={S.btn(connected, !connected ? false : true)} onClick={connect}>
          {connected ? 'Disconnect' : 'Connect'}
        </button>
        <button style={S.btn(false)} onClick={triggerEvent} disabled={!connected}>Trigger Event</button>
        <div style={{ width: 1, height: 24, background: '#27272a' }} />
        <span style={S.label}>Type ID</span>
        <select value={selectedType} onChange={e => setSelectedType(+e.target.value)} style={S.sel}>
          {IEC104_TYPES.map(t => <option key={t.id} value={t.id}>{t.name} — {t.desc}</option>)}
        </select>
        <div style={{ width: 1, height: 24, background: '#27272a' }} />
        <button style={S.btn(mode === 'spontaneous')} onClick={() => setMode('spontaneous')}>Spontaneous (COT=3)</button>
        <button style={S.btn(mode === 'cyclic')} onClick={() => setMode('cyclic')}>Cyclic (COT=1)</button>
      </div>

      {/* Type identifier reference */}
      <div style={S.results}>
        {IEC104_TYPES.filter(t => t.id === selectedType).map(t => (
          <React.Fragment key={t.id}>
            <div style={S.ri}><span style={S.rl}>Type ID</span><span style={S.rv}>{t.id}</span></div>
            <div style={S.ri}><span style={S.rl}>Name</span><span style={{ ...S.rv, fontSize: 14 }}>{t.name}</span></div>
            <div style={S.ri}><span style={S.rl}>Direction</span><span style={S.rv}>{t.dir === 'M' ? 'Monitor' : 'Control'}</span></div>
            <div style={S.ri}><span style={S.rl}>Data</span><span style={{ ...S.rv, fontSize: 13 }}>{t.bytes}</span></div>
            <div style={S.ri}><span style={S.rl}>Example</span><span style={{ ...S.rv, fontSize: 13, color: '#818cf8' }}>{t.example}</span></div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────── TAB 6: END-TO-END ──────────────────────────── */
function EndToEndTab() {
  const [faultLoc, setFaultLoc] = useState('NLR');
  const [phase, setPhase] = useState(-1);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [timeline, setTimeline] = useState([]);
  const timerRef = useRef(null);

  const startSim = useCallback(() => {
    if (running) return;
    setRunning(true);
    setPhase(0);
    setTimeline([]);

    let cumTime = 0;
    const newTimeline = E2E_STAGES.map(stage => {
      const t = stage.tMin + Math.random() * (stage.tMax - stage.tMin);
      cumTime += t;
      return { ...stage, time: t, cumulative: cumTime };
    });
    setTimeline(newTimeline);

    // Animate through phases
    let delay = 0;
    newTimeline.forEach((entry, i) => {
      delay += Math.max(300, 600 / speed);
      setTimeout(() => setPhase(i), delay);
    });
    setTimeout(() => setRunning(false), delay + 500);
  }, [running, speed]);

  const resetSim = useCallback(() => {
    setRunning(false);
    setPhase(-1);
    setTimeline([]);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const totalTime = timeline.length > 0 ? timeline[timeline.length - 1].cumulative : 0;
  const protectionTime = timeline.length >= 6 ? timeline[5].cumulative : 0;

  const W = 880, H = 400;
  const laneW = W / 8;
  const lanes = ['Field', 'CT/PT', 'IED', 'GOOSE\n(Stn Bus)', 'Bay Ctrl', 'RTU/GW', 'WAN\n(IEC 104)', 'SLDC'];

  return (
    <div style={S.simBody}>
      <div style={S.svgWrap}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, maxHeight: H }}>
          {/* Lane headers */}
          {lanes.map((lane, i) => (
            <g key={i}>
              <rect x={i * laneW} y={0} width={laneW} height={35} fill={i % 2 === 0 ? '#0c0c10' : '#0a0a0e'} />
              {lane.split('\n').map((line, j) => (
                <text key={j} x={i * laneW + laneW / 2} y={15 + j * 12} fill="#71717a" fontSize={9} fontWeight={700} textAnchor="middle" style={{ textTransform: 'uppercase' }}>{line}</text>
              ))}
              {/* Lane column */}
              <rect x={i * laneW} y={35} width={laneW} height={H - 35} fill={i % 2 === 0 ? '#0c0c1005' : 'transparent'} />
              <line x1={i * laneW} y1={35} x2={i * laneW} y2={H} stroke="#1a1a24" strokeWidth={0.5} />
            </g>
          ))}

          {/* Stages as arrows */}
          {E2E_STAGES.map((stage, i) => {
            const active = phase >= i;
            const current = phase === i;
            const yPos = 50 + i * 32;
            const laneIdx = ['Field', 'Field', 'IED', 'IED', 'Station Bus', 'Switchyard', 'Gateway', 'Gateway', 'WAN', 'SLDC']
              .indexOf(stage.layer);
            const mappedLane = { 'Field': 0, 'IED': 2, 'Station Bus': 3, 'Switchyard': 4, 'Gateway': 5, 'WAN': 6, 'SLDC': 7 }[stage.layer] ?? i;
            const xStart = Math.max(0, mappedLane - 1) * laneW + laneW / 2;
            const xEnd = mappedLane * laneW + laneW / 2;

            return (
              <g key={i} opacity={active ? 1 : 0.3}>
                {/* Arrow */}
                <line x1={i === 0 ? xEnd - 15 : xStart} y1={yPos} x2={xEnd + 15} y2={yPos}
                  stroke={stage.color} strokeWidth={active ? 2.5 : 1} />
                <circle cx={xEnd} cy={yPos} r={current ? 6 : 4} fill={active ? stage.color : '#27272a'}
                  stroke={stage.color} strokeWidth={1.5}>
                  {current && <animate attributeName="r" values="4;8;4" dur="0.8s" repeatCount="indefinite" />}
                </circle>
                {/* Label */}
                <text x={xEnd + 20} y={yPos + 4} fill={active ? stage.color : '#3f3f46'} fontSize={9} fontWeight={active ? 600 : 400}>
                  {stage.label}
                </text>
                {/* Timing */}
                {timeline[i] && (
                  <text x={W - 10} y={yPos + 4} fill={active ? '#71717a' : '#27272a'} fontSize={8} fontFamily="monospace" textAnchor="end">
                    {timeline[i].time < 1 ? `${timeline[i].time.toFixed(1)}ms` : `${timeline[i].time.toFixed(0)}ms`}
                    {' '}({timeline[i].cumulative.toFixed(0)}ms)
                  </text>
                )}
              </g>
            );
          })}

          {/* Fault indicator */}
          {phase >= 0 && (
            <g>
              <circle cx={laneW / 2} cy={50} r={8} fill="none" stroke="#ef4444" strokeWidth={2}>
                <animate attributeName="r" values="8;14;8" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
              </circle>
              <text x={laneW / 2} y={54} fill="#ef4444" fontSize={10} fontWeight={700} textAnchor="middle">⚡</text>
            </g>
          )}
        </svg>
      </div>

      <div style={S.controls}>
        <div style={S.cg}>
          <span style={S.label}>Fault Location</span>
          <select value={faultLoc} onChange={e => setFaultLoc(e.target.value)} style={S.sel}>
            {APTRANSCO_SUBS.filter(s => s.type === 'ss').map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div style={S.cg}>
          <span style={S.label}>Speed</span>
          <input type="range" min={0.5} max={3} step={0.5} value={speed} onChange={e => setSpeed(+e.target.value)} style={S.slider} />
          <span style={S.val}>{speed}x</span>
        </div>
        <button style={S.btn(!running)} onClick={startSim} disabled={running}>Start Simulation</button>
        <button style={S.btn(false, true)} onClick={resetSim}>Reset</button>
      </div>

      <div style={S.results}>
        <div style={S.ri}><span style={S.rl}>Protection Clearing</span><span style={{ ...S.rv, color: '#22c55e' }}>{protectionTime > 0 ? `${protectionTime.toFixed(0)} ms` : '—'}</span></div>
        <div style={S.ri}><span style={S.rl}>SLDC Notification</span><span style={{ ...S.rv, color: '#6366f1' }}>{totalTime > 0 ? `${(totalTime / 1000).toFixed(1)} s` : '—'}</span></div>
        <div style={S.ri}><span style={S.rl}>Fault Location</span><span style={S.rv}>{APTRANSCO_SUBS.find(s => s.id === faultLoc)?.name}</span></div>
        <div style={S.ri}><span style={S.rl}>Phase</span><span style={{ ...S.rv, color: phase >= 0 ? E2E_STAGES[Math.min(phase, 9)].color : '#71717a' }}>{phase >= 0 ? E2E_STAGES[Math.min(phase, 9)].label : 'Ready'}</span></div>
      </div>
    </div>
  );
}

/* ──────────────────────────── TAB 7: THEORY ──────────────────────────── */
function TheoryTab() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Substation Communication: Field to Control Centre</h2>
      <p style={S.p}>
        SLDC (State Load Despatch Centre) is the nerve centre of AP's grid. It needs real-time visibility into every 220kV and 132kV substation to maintain frequency, manage voltage profiles, and ensure thermal limits aren't breached. The fundamental question: how does a breaker status change at a remote substation in Nellore reach the SLDC control room in Vidyanagar?
      </p>

      <h2 style={S.h2}>1. Signal Chain: Field to Digital</h2>
      <p style={S.p}>
        Everything starts with physics. Current Transformers (CTs) step down line currents to measurable levels (typically 1A secondary for 220kV). Potential Transformers (PTs) step down bus voltages (220kV/√3 → 110V/√3). These analog signals reach the IED (Intelligent Electronic Device) — a microprocessor-based relay that both protects and communicates.
      </p>
      <span style={S.eq}>I_secondary = I_primary / CT_ratio = 8000A / 800 = 10A</span>
      <span style={S.eq}>V_burden = I_secondary × Z_burden — must stay below V_knee to avoid saturation</span>

      <div style={S.ctx}>
        <span style={S.ctxT}>CT Saturation — The Silent Killer</span>
        <p style={S.ctxP}>
          If the burden (total impedance seen by CT secondary including relay + wiring) causes V_burden to exceed the CT's knee-point voltage, the CT saturates — its output waveform clips, and the relay sees distorted current. This can cause delayed tripping or complete failure to operate. In APTRANSCO 220kV substations, Class 5P20 CTs are standard, meaning accuracy within 5% up to 20× rated current.
        </p>
      </div>

      <h2 style={S.h2}>2. IEC 61850 — The Three-Level Architecture</h2>
      <h3 style={S.h3}>Process Level</h3>
      <p style={S.p}>
        In a digital substation, Merging Units (MUs) sit adjacent to the CT/PT and convert analog waveforms into Sampled Values (SV) — a continuous digital stream at 4000 samples/second (80 samples per power cycle at 50Hz). These SV frames travel over the Process Bus (a dedicated Ethernet segment) to the IEDs. This eliminates all analog wiring between CTs/PTs and relays.
      </p>

      <h3 style={S.h3}>Bay Level</h3>
      <p style={S.p}>
        IEDs communicate over the Station Bus using two services: MMS (Manufacturing Message Specification) for monitoring and control over TCP/IP (~100ms latency), and GOOSE (Generic Object Oriented Substation Event) for fast peer-to-peer signaling at Layer 2 ({'<'}4ms).
      </p>

      <h3 style={S.h3}>Station Level</h3>
      <p style={S.p}>
        The station computer/gateway aggregates all bay-level data via MMS, provides the local HMI, and converts IEC 61850 into IEC 60870-5-104 for the uplink to SLDC.
      </p>

      <h2 style={S.h2}>3. GOOSE Protocol Deep-Dive</h2>
      <p style={S.p}>
        GOOSE replaces hardwired copper between relays with Ethernet-based publish-subscribe messaging. A distance relay detecting a fault publishes a GOOSE message — every subscribing IED (breaker failure, bay controller, busbar protection) receives it within 4 milliseconds. This replaces dedicated 48V DC wiring between every relay pair.
      </p>

      <h3 style={S.h3}>Retransmission Scheme</h3>
      <p style={S.p}>
        After a state change, GOOSE uses exponential backoff retransmission: the first retransmit at 2ms, then 4ms, 8ms, 16ms, doubling up to the maximum heartbeat interval of ~1 second. This means even if a frame is lost, the next retransmission arrives almost immediately. Subscribers detect loss by checking sequence numbers (stNum for state changes, sqNum for retransmissions).
      </p>
      <span style={S.eq}>Retransmit intervals: 2, 4, 8, 16, 32, 64, 128, 256, 512, 1000 ms</span>

      <h3 style={S.h3}>Common Integration Failures</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong>VLAN mismatch</strong> — Publisher and subscriber on different VLANs. The switch drops the frame silently.</li>
        <li style={S.li}><strong>AppID conflict</strong> — Two publishers with the same AppID. Subscriber processes the wrong dataset.</li>
        <li style={S.li}><strong>Dataset mismatch</strong> — Publisher changed dataset structure without updating subscriber CID files.</li>
        <li style={S.li}><strong>No network redundancy</strong> — Single switch failure kills all GOOSE. PRP/HSR (IEC 62439-3) provides zero-loss failover.</li>
      </ul>

      <h2 style={S.h2}>4. IEC 61850 Data Model</h2>
      <p style={S.p}>
        The true revolution isn't the protocols — it's the standardized data model. IEC 61850 defines a hierarchy: Physical Device → Logical Device → Logical Node → Data Object → Data Attribute. A Logical Node (LN) represents a specific function, standardized worldwide:
      </p>
      <table style={S.tbl}>
        <thead>
          <tr><th style={S.th}>LN Class</th><th style={S.th}>Function</th><th style={S.th}>Key DOs</th></tr>
        </thead>
        <tbody>
          <tr><td style={S.td}>XCBR</td><td style={S.td}>Circuit Breaker</td><td style={S.td}>Pos, BlkOpn, BlkCls, CBOpCap</td></tr>
          <tr><td style={S.td}>MMXU</td><td style={S.td}>Measurement (3-phase)</td><td style={S.td}>TotW, TotVAr, Hz, PhV, A</td></tr>
          <tr><td style={S.td}>PDIS</td><td style={S.td}>Distance Protection</td><td style={S.td}>Str, Op, RsDlTmms</td></tr>
          <tr><td style={S.td}>PTOC</td><td style={S.td}>Time Overcurrent</td><td style={S.td}>Str, Op, TmACrv</td></tr>
          <tr><td style={S.td}>PDIF</td><td style={S.td}>Differential Protection</td><td style={S.td}>Str, Op</td></tr>
          <tr><td style={S.td}>RBRF</td><td style={S.td}>Breaker Failure</td><td style={S.td}>Str, Op, OpDlTmms</td></tr>
          <tr><td style={S.td}>CSWI</td><td style={S.td}>Switch Controller</td><td style={S.td}>Pos, OpCntRs</td></tr>
          <tr><td style={S.td}>PTTR</td><td style={S.td}>Thermal Overload</td><td style={S.td}>Tmp, Alm</td></tr>
        </tbody>
      </table>

      <div style={S.ctx}>
        <span style={S.ctxT}>SCL Engineering Workflow</span>
        <p style={S.ctxP}>
          <strong>ICD</strong> (IED Capability Description): Vendor provides a template file describing what their IED can do.<br />
          <strong>SCD</strong> (Substation Configuration Description): The system integrator assembles all ICDs into a single station-wide file, defines GOOSE publisher-subscriber relationships, data mappings, and network topology.<br />
          <strong>CID</strong> (Configured IED Description): Each IED receives its specific portion of the SCD for download.
        </p>
      </div>

      <h2 style={S.h2}>5. IEC 60870-5-104 — The Uplink Protocol</h2>
      <p style={S.p}>
        IEC 104 carries substation data over TCP/IP to the SLDC. It evolved from IEC 101 (serial) and shares the same application-layer data model (ASDU structure). The key advantage: spontaneous reporting. Instead of the SLDC polling each RTU cyclically, the RTU pushes data on change (Cause of Transmission = 3: spontaneous).
      </p>

      <h3 style={S.h3}>Frame Types</h3>
      <ul style={S.ul}>
        <li style={S.li}><strong>I-format</strong> (Information): Carries actual data (measurements, statuses, commands). Has send and receive sequence numbers.</li>
        <li style={S.li}><strong>S-format</strong> (Supervisory): Acknowledges received I-frames without sending data. Flow control mechanism.</li>
        <li style={S.li}><strong>U-format</strong> (Unnumbered): Connection management — STARTDT (activate data transfer), STOPDT, TESTFR (keepalive).</li>
      </ul>

      <h3 style={S.h3}>Connection Lifecycle</h3>
      <span style={S.eq}>TCP SYN → SYN-ACK → ACK → STARTDT act → STARTDT con → C_IC_NA_1 (General Interrogation)</span>
      <p style={S.p}>
        After the TCP handshake, the master sends STARTDT act to activate data transfer. The slave responds with STARTDT con. The master then sends a General Interrogation (C_IC_NA_1) to get a full snapshot of all data points. After that, the slave sends spontaneous updates on state changes.
      </p>

      <h2 style={S.h2}>6. Comparison Tables</h2>
      <h3 style={S.h3}>IEC 101 vs IEC 104</h3>
      <table style={S.tbl}>
        <thead>
          <tr><th style={S.th}>Feature</th><th style={S.th}>IEC 60870-5-101</th><th style={S.th}>IEC 60870-5-104</th></tr>
        </thead>
        <tbody>
          <tr><td style={S.td}>Transport</td><td style={S.td}>Serial (RS-232/485)</td><td style={S.td}>TCP/IP (Ethernet)</td></tr>
          <tr><td style={S.td}>Speed</td><td style={S.td}>9.6-19.2 kbps</td><td style={S.td}>100 Mbps+</td></tr>
          <tr><td style={S.td}>Addressing</td><td style={S.td}>Link address</td><td style={S.td}>IP address + CASDU</td></tr>
          <tr><td style={S.td}>Reporting</td><td style={S.td}>Polled (master-slave)</td><td style={S.td}>Spontaneous + polled</td></tr>
          <tr><td style={S.td}>Redundancy</td><td style={S.td}>Limited</td><td style={S.td}>Dual TCP connections</td></tr>
          <tr><td style={S.td}>Latency</td><td style={S.td}>500ms-2s typical</td><td style={S.td}>100-500ms typical</td></tr>
          <tr><td style={S.td}>APTRANSCO Status</td><td style={S.td}>Legacy 132kV substations</td><td style={S.td}>Standard for new/upgraded</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>Conventional vs Digital Substation</h3>
      <table style={S.tbl}>
        <thead>
          <tr><th style={S.th}>Aspect</th><th style={S.th}>Conventional</th><th style={S.th}>IEC 61850 Digital</th></tr>
        </thead>
        <tbody>
          <tr><td style={S.td}>CT/PT to relay</td><td style={S.td}>Copper cables (analog)</td><td style={S.td}>Ethernet (Sampled Values)</td></tr>
          <tr><td style={S.td}>Inter-relay signals</td><td style={S.td}>Hardwired 48V DC</td><td style={S.td}>GOOSE over Ethernet</td></tr>
          <tr><td style={S.td}>Wiring per bay</td><td style={S.td}>~800m control cable</td><td style={S.td}>2-4 Ethernet cables</td></tr>
          <tr><td style={S.td}>Commissioning</td><td style={S.td}>2-3 weeks/bay</td><td style={S.td}>2-3 days/bay</td></tr>
          <tr><td style={S.td}>Modification</td><td style={S.td}>Rewiring + outage</td><td style={S.td}>Software config change</td></tr>
          <tr><td style={S.td}>Vendor lock-in</td><td style={S.td}>Proprietary protocols</td><td style={S.td}>Vendor-neutral standard</td></tr>
          <tr><td style={S.td}>Inter-relay speed</td><td style={S.td}>~10-20ms (contact closure)</td><td style={S.td}>{'<'}4ms (GOOSE)</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>MMS vs GOOSE vs SV</h3>
      <table style={S.tbl}>
        <thead>
          <tr><th style={S.th}>Service</th><th style={S.th}>Transport</th><th style={S.th}>Speed</th><th style={S.th}>Use Case</th></tr>
        </thead>
        <tbody>
          <tr><td style={S.td}>MMS</td><td style={S.td}>TCP/IP (Layer 4+)</td><td style={S.td}>~100ms</td><td style={S.td}>Monitoring, control, settings</td></tr>
          <tr><td style={S.td}>GOOSE</td><td style={S.td}>Ethernet (Layer 2)</td><td style={S.td}>{'<'}4ms</td><td style={S.td}>Fast peer-to-peer events (trips, blocks)</td></tr>
          <tr><td style={S.td}>SV</td><td style={S.td}>Ethernet (Layer 2)</td><td style={S.td}>Continuous</td><td style={S.td}>Digitized CT/PT waveforms</td></tr>
        </tbody>
      </table>

      <h2 style={S.h2}>7. Network Design</h2>
      <h3 style={S.h3}>VLAN Segregation</h3>
      <p style={S.p}>
        Station bus traffic must be segregated by type using IEEE 802.1Q VLANs. Typical assignment: VLAN 100 for MMS (monitoring/control), VLAN 200 for GOOSE (fast events), VLAN 300 for Sampled Values. GOOSE and SV VLANs use priority tagging (802.1p) to ensure they are processed before MMS traffic by the Ethernet switches.
      </p>

      <h3 style={S.h3}>PRP / HSR Redundancy</h3>
      <p style={S.p}>
        IEC 62439-3 defines two redundancy protocols for zero-loss Ethernet failover. PRP (Parallel Redundancy Protocol) uses two independent Ethernet networks — every frame is sent on both, and the receiving node discards the duplicate. HSR (High-availability Seamless Redundancy) uses a ring topology — each frame travels both directions around the ring.
      </p>

      <h3 style={S.h3}>Time Synchronization</h3>
      <p style={S.p}>
        All IEDs must be time-synchronized for event sequencing. IEEE 1588 PTP (Precision Time Protocol) provides {'<'}1μs accuracy — essential for Sampled Values (where 80 samples/cycle means each sample represents 250μs). SNTP provides ~1ms accuracy, sufficient for IEC 104 event timestamps (CP56Time2a, 1ms resolution).
      </p>

      <h2 style={S.h2}>8. APTRANSCO Context</h2>
      <div style={S.ctx}>
        <span style={S.ctxT}>Current State of Communication Infrastructure</span>
        <p style={S.ctxP}>
          SLDC Vidyanagar manages ~200+ substations across Andhra Pradesh. The communication backbone is OPGW fiber along 220kV/400kV transmission corridors. New 220kV substations are being commissioned with IEC 61850 compliant IEDs (ABB REL670, Siemens 7SA87, L&T MiCOM series) with GOOSE-based interlocking. Legacy 132kV substations still use conventional RTUs with IEC 101/104. The PGCIL digital substation program and CEA guidelines are driving full IEC 61850 adoption including Sampled Values for greenfield 400kV+ installations.
        </p>
      </div>

      <div style={S.ctx}>
        <span style={S.ctxT}>Common Integration Challenges in AP</span>
        <p style={S.ctxP}>
          1. <strong>Multi-vendor IED interoperability</strong>: Different vendors' ICD files may have inconsistent LN implementations, especially for optional DOs and private extensions.<br />
          2. <strong>SCL file management</strong>: Each vendor provides their own SCL engineering tool (ABB PCM600, Siemens DIGSI, GE UR Setup). Creating a unified SCD requires a vendor-neutral tool or significant manual integration.<br />
          3. <strong>GOOSE commissioning</strong>: Testing GOOSE subscription without dedicated test equipment (like Omicron CMC + GOOSE Configuration) requires careful point-to-point verification.<br />
          4. <strong>IEC 104 point mapping</strong>: Translating IEC 61850 data objects to IEC 104 IOA (Information Object Address) requires careful mapping tables that must be maintained when IEDs are replaced or upgraded.<br />
          5. <strong>Time sync across mixed infrastructure</strong>: PTP for 61850 IEDs, SNTP for RTUs, and IRIG-B for older devices must all be synchronized to a common GPS source.
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────── MAIN COMPONENT ──────────────────────────── */
export default function SubstationCommunication() {
  const [tab, setTab] = useState('bay');

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        {TABS.map(([id, label]) => (
          <button key={id} style={S.tab(tab === id)} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {tab === 'bay' && <BayWiringTab />}
      {tab === 'arch' && <ArchitectureTab />}
      {tab === 'goose' && <GooseTab />}
      {tab === 'model' && <DataModelTab />}
      {tab === 'iec104' && <IEC104Tab />}
      {tab === 'e2e' && <EndToEndTab />}
      {tab === 'theory' && <TheoryTab />}
    </div>
  );
}
