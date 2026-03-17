import React, { useState, useMemo, useCallback, useEffect } from 'react';

const S = {
  container: { display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 3.5rem)', background: '#09090b', fontFamily: 'Inter, system-ui, sans-serif', color: '#e4e4e7' },
  tabBar: { display: 'flex', gap: 4, padding: '12px 24px', background: '#0a0a0f', borderBottom: '1px solid #1e1e2e' },
  tab: (a) => ({ padding: '8px 20px', borderRadius: 10, border: 'none', background: a ? '#6366f1' : 'transparent', color: a ? '#fff' : '#71717a', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
  simBody: { flex: 1, display: 'flex', flexDirection: 'column' },
  svgWrap: { flex: 1, padding: '16px 16px 0', overflowX: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280 },
  controls: { padding: '14px 24px', background: '#111114', borderTop: '1px solid #1e1e2e', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' },
  cg: { display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, color: '#a1a1aa', fontWeight: 500, whiteSpace: 'nowrap' },
  slider: { width: 130, accentColor: '#6366f1', cursor: 'pointer' },
  val: { fontSize: 13, color: '#71717a', fontFamily: 'monospace', minWidth: 50, textAlign: 'right' },
  results: { display: 'flex', gap: 32, padding: '12px 24px', background: '#0c0c0f', borderTop: '1px solid #1e1e2e', flexWrap: 'wrap', alignItems: 'flex-start' },
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

/* ─── SVG path helpers ─── */

const pathLen = (d) => {
  const nums = d.match(/[\d.]+/g).map(Number);
  let l = 0;
  for (let i = 2; i < nums.length; i += 2)
    l += Math.hypot(nums[i] - nums[i - 2], nums[i + 1] - nums[i - 1]);
  return l;
};

const PATHS = {
  su1: 'M73,75 L117,75',
  su2: 'M73,290 L117,290',
  sc1: 'M133,75 L163,75 L163,182 L191,182',
  sc2: 'M133,290 L163,290 L163,182 L191,182',
  dg:  'M215,350 L215,198',
  aA:  'M239,175 L276,175 L276,120 L312,120',
  aB:  'M239,189 L276,189 L276,245 L312,245',
  tA:  'M348,120 L414,120',
  tB:  'M348,245 L414,245',
  bA:  'M440,72 L440,106',
  bB:  'M440,293 L440,259',
  uA:  'M466,120 L500,120 L500,175 L538,175',
  uB:  'M466,245 L500,245 L500,189 L538,189',
  pA:  'M572,170 L610,170 L610,120 L646,120',
  pB:  'M572,182 L646,182',
  pC:  'M572,194 L610,194 L610,245 L646,245',
};

const SUPPLY = ['su1', 'su2', 'sc1', 'sc2'];
const MAIN   = ['aA', 'aB', 'tA', 'tB', 'uA', 'uB', 'pA', 'pB', 'pC'];
const BATT   = ['bA', 'bB'];
const DG_SEG = ['dg'];

const Dots = ({ d, c, n = 3, speed = 55 }) => {
  const dur = Math.max(0.8, pathLen(d) / speed);
  return Array.from({ length: n }, (_, i) => (
    <circle key={i} r={2.5} fill={c} opacity={0.8}>
      <animateMotion
        dur={`${dur.toFixed(1)}s`}
        begin={`${(i * dur / n).toFixed(2)}s`}
        repeatCount="indefinite"
        path={d}
      />
    </circle>
  ));
};

/* ─── Theory ─── */

function Theory() {
  return (
    <div style={S.theory}>
      <h2 style={{ ...S.h2, marginTop: 0 }}>Data Center Power Architecture</h2>
      <p style={S.p}>
        Modern hyperscale data centers consume 10–50 MW per site and demand electrical architectures
        that deliver 99.995%+ uptime while optimising efficiency and power quality. This simulation
        models a Tier III/IV topology with dual utility feeds, automatic transfer switching,
        online double-conversion UPS, diesel backup, and redundant distribution to IT loads.
      </p>

      {/* ── SVG: Data Center Power Distribution ── */}
      <svg viewBox="0 0 700 310" style={{ width: '100%', maxWidth: 700, height: 'auto', margin: '16px auto', display: 'block' }}>
        <rect width="700" height="310" rx="12" fill="#18181b" stroke="#27272a" strokeWidth="1" />
        <text x="350" y="22" textAnchor="middle" fontSize="12" fill="#e4e4e7" fontWeight="700">Data Center Power Distribution Chain</text>

        {/* Utility */}
        <circle cx="70" cy="80" r="22" fill="#09090b" stroke="#4ade80" strokeWidth="2" />
        <text x="70" y="76" textAnchor="middle" fontSize="10" fill="#4ade80" fontWeight="700">Utility</text>
        <text x="70" y="90" textAnchor="middle" fontSize="8" fill="#71717a">33 kV</text>
        <line x1="92" y1="80" x2="130" y2="80" stroke="#4ade80" strokeWidth="2" />

        {/* ATS */}
        <rect x="130" y="60" width="60" height="40" rx="6" fill="#09090b" stroke="#818cf8" strokeWidth="1.5" />
        <text x="160" y="76" textAnchor="middle" fontSize="9" fill="#818cf8" fontWeight="600">ATS</text>
        <text x="160" y="90" textAnchor="middle" fontSize="7" fill="#52525b">Auto Transfer</text>
        <line x1="190" y1="80" x2="230" y2="80" stroke="#4ade80" strokeWidth="2" />

        {/* Transformer */}
        <circle cx="248" cy="80" r="14" fill="#09090b" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="262" cy="80" r="14" fill="#09090b" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="255" y="103" textAnchor="middle" fontSize="8" fill="#71717a">33/0.4 kV</text>
        <line x1="276" y1="80" x2="310" y2="80" stroke="#4ade80" strokeWidth="2" />

        {/* UPS */}
        <rect x="310" y="60" width="80" height="40" rx="6" fill="#09090b" stroke="#22d3ee" strokeWidth="1.5" />
        <text x="350" y="76" textAnchor="middle" fontSize="10" fill="#22d3ee" fontWeight="600">UPS</text>
        <text x="350" y="90" textAnchor="middle" fontSize="7" fill="#52525b">Online Double-Conv</text>

        {/* Battery connected to UPS */}
        <rect x="330" y="115" width="40" height="20" rx="4" fill="#09090b" stroke="#f59e0b" strokeWidth="1" />
        <text x="350" y="129" textAnchor="middle" fontSize="8" fill="#f59e0b">BAT</text>
        <line x1="350" y1="100" x2="350" y2="115" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" />

        <line x1="390" y1="80" x2="430" y2="80" stroke="#4ade80" strokeWidth="2" />

        {/* PDU */}
        <rect x="430" y="55" width="55" height="50" rx="6" fill="#09090b" stroke="#a78bfa" strokeWidth="1.5" />
        <text x="457" y="77" textAnchor="middle" fontSize="10" fill="#a78bfa" fontWeight="600">PDU</text>
        <text x="457" y="92" textAnchor="middle" fontSize="7" fill="#52525b">Power Dist.</text>
        <line x1="485" y1="70" x2="540" y2="50" stroke="#a78bfa" strokeWidth="1.5" />
        <line x1="485" y1="80" x2="540" y2="80" stroke="#a78bfa" strokeWidth="1.5" />
        <line x1="485" y1="90" x2="540" y2="110" stroke="#a78bfa" strokeWidth="1.5" />

        {/* Server Racks */}
        {[50, 80, 110].map((y, i) => (
          <g key={i}>
            <rect x="540" y={y-12} width="35" height="24" rx="3" fill="#09090b" stroke="#3f3f46" strokeWidth="1" />
            {[-6, -1, 4].map(dy => <line key={dy} x1="544" y1={y+dy} x2="571" y2={y+dy} stroke="#27272a" strokeWidth="0.8" />)}
            <circle cx="568" cy={y-8} r="2" fill="#4ade80" />
          </g>
        ))}
        <text x="557" y="130" textAnchor="middle" fontSize="8" fill="#71717a">Server Racks</text>

        {/* DG */}
        <circle cx="70" cy="160" r="18" fill="#09090b" stroke="#f97316" strokeWidth="1.5" />
        <text x="70" y="164" textAnchor="middle" fontSize="11" fill="#f97316" fontWeight="700">G</text>
        <text x="70" y="185" textAnchor="middle" fontSize="8" fill="#71717a">Diesel Gen</text>
        <line x1="88" y1="160" x2="135" y2="105" stroke="#f97316" strokeWidth="1" strokeDasharray="4 3" />
        <text x="115" y="128" fontSize="7" fill="#f97316">Standby Path</text>

        {/* Arrow flow indicators */}
        {[110, 215, 300, 420].map(x => (
          <polygon key={x} points={`${x},76 ${x+8},80 ${x},84`} fill="#4ade80" opacity="0.5" />
        ))}

        {/* Redundancy section */}
        <text x="350" y="195" textAnchor="middle" fontSize="11" fill="#e4e4e7" fontWeight="700">Redundancy Schemes</text>

        {/* N+1 */}
        <rect x="60" y="210" width="260" height="80" rx="8" fill="#09090b" stroke="#3b82f6" strokeWidth="1" />
        <text x="190" y="228" textAnchor="middle" fontSize="10" fill="#3b82f6" fontWeight="600">N+1 Redundancy</text>
        {[0,1,2,3].map(i => (
          <rect key={i} x={85+i*50} y="238" width="35" height="22" rx="3" fill="#3b82f615" stroke="#3b82f6" strokeWidth="0.8" />
        ))}
        {[0,1,2,3].map(i => (
          <text key={i} x={102+i*50} y="253" textAnchor="middle" fontSize="8" fill="#3b82f6">UPS {i+1}</text>
        ))}
        <rect x="285" y="238" width="25" height="22" rx="3" fill="#22c55e15" stroke="#22c55e" strokeWidth="1" />
        <text x="297" y="253" textAnchor="middle" fontSize="7" fill="#22c55e">+1</text>
        <text x="190" y="278" textAnchor="middle" fontSize="8" fill="#71717a">4 needed + 1 spare = 20% overhead</text>

        {/* 2N */}
        <rect x="380" y="210" width="260" height="80" rx="8" fill="#09090b" stroke="#a78bfa" strokeWidth="1" />
        <text x="510" y="228" textAnchor="middle" fontSize="10" fill="#a78bfa" fontWeight="600">2N Redundancy</text>
        <text x="445" y="245" textAnchor="middle" fontSize="8" fill="#818cf8">Path A</text>
        {[0,1,2,3].map(i => (
          <rect key={i} x={400+i*30} y="250" width="22" height="14" rx="2" fill="#818cf820" stroke="#818cf8" strokeWidth="0.5" />
        ))}
        <text x="575" y="245" textAnchor="middle" fontSize="8" fill="#a78bfa">Path B</text>
        {[0,1,2,3].map(i => (
          <rect key={i} x={530+i*30} y="250" width="22" height="14" rx="2" fill="#a78bfa20" stroke="#a78bfa" strokeWidth="0.5" />
        ))}
        <text x="510" y="278" textAnchor="middle" fontSize="8" fill="#71717a">2 x 4 = 8 modules = 100% overhead</text>
      </svg>

      {/* ── SVG: PUE Concept ── */}
      <svg viewBox="0 0 700 140" style={{ width: '100%', maxWidth: 700, height: 'auto', margin: '16px auto', display: 'block' }}>
        <rect width="700" height="140" rx="12" fill="#18181b" stroke="#27272a" strokeWidth="1" />
        <text x="350" y="22" textAnchor="middle" fontSize="12" fill="#e4e4e7" fontWeight="700">Power Usage Effectiveness (PUE)</text>

        <text x="350" y="45" textAnchor="middle" fontSize="11" fill="#c4b5fd" fontFamily="monospace">PUE = Total Facility Power / IT Equipment Power</text>

        {/* Stacked bar showing breakdown */}
        <rect x="60" y="60" width="280" height="24" rx="4" fill="#4ade80" opacity="0.7" />
        <text x="200" y="76" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="600">IT Load (Servers, Storage, Network)</text>

        <rect x="340" y="60" width="130" height="24" rx="4" fill="#60a5fa" opacity="0.7" />
        <text x="405" y="76" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="600">Cooling (major non-IT load)</text>

        <rect x="470" y="60" width="60" height="24" rx="4" fill="#f59e0b" opacity="0.7" />
        <text x="500" y="76" textAnchor="middle" fontSize="9" fill="#fff" fontWeight="600">UPS Loss</text>

        <rect x="530" y="60" width="40" height="24" rx="4" fill="#a78bfa" opacity="0.7" />
        <text x="550" y="76" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="600">Aux</text>

        {/* Benchmark scale */}
        {[{pue:'1.1', x:180, c:'#22c55e', label:'Google'}, {pue:'1.2', x:300, c:'#4ade80', label:'Hyperscale Avg'}, {pue:'1.5', x:460, c:'#f59e0b', label:'Enterprise'}, {pue:'1.8', x:580, c:'#ef4444', label:'Legacy'}].map(d => (
          <g key={d.pue}>
            <line x1={d.x} y1="95" x2={d.x} y2="105" stroke={d.c} strokeWidth="2" />
            <text x={d.x} y="116" textAnchor="middle" fontSize="9" fill={d.c} fontWeight="600">{d.pue}</text>
            <text x={d.x} y="128" textAnchor="middle" fontSize="7" fill="#71717a">{d.label}</text>
          </g>
        ))}
        <line x1="100" y1="100" x2="640" y2="100" stroke="#3f3f46" strokeWidth="0.8" />
        <text x="80" y="103" textAnchor="end" fontSize="8" fill="#71717a">PUE</text>
      </svg>

      <h2 style={S.h2}>Uptime Institute Tier Classification</h2>
      <p style={S.p}>
        The Uptime Institute defines four tiers of data center infrastructure with progressively
        higher availability and redundancy requirements:
      </p>
      <table style={S.tbl}>
        <thead>
          <tr>
            <th style={S.th}>Tier</th>
            <th style={S.th}>Availability</th>
            <th style={S.th}>Redundancy</th>
            <th style={S.th}>Annual Downtime</th>
            <th style={S.th}>Typical Users</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['I',  '99.671%', 'N (none)',              '28.8 hours',  'Dev/test, small office'],
            ['II', '99.749%', 'N+1 (partial)',          '22.0 hours',  'SMEs, non-critical IT'],
            ['III','99.982%', 'N+1 (conc. maintainable)','1.6 hours',  'Enterprise, banking'],
            ['IV', '99.995%', '2N / 2N+1 (fault-tolerant)', '26.3 min', 'Mission-critical, hyperscale'],
          ].map(([t, a, r, d, u], i) => (
            <tr key={i}>
              <td style={{ ...S.td, color: '#818cf8', fontWeight: 600 }}>{t}</td>
              <td style={S.td}>{a}</td><td style={S.td}>{r}</td>
              <td style={S.td}>{d}</td><td style={S.td}>{u}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={S.p}>
        Tier III requires concurrent maintainability — any component can be serviced without
        impacting IT. Tier IV adds fault tolerance: any single failure must not cause downtime.
      </p>

      <h2 style={S.h2}>N+1 vs 2N Redundancy</h2>
      <p style={S.p}>
        <strong style={{ color: '#e4e4e7' }}>N+1 redundancy</strong> deploys one additional unit
        beyond the minimum. If the IT load requires 4 UPS modules, N+1 provides 5 — any single
        module can fail without capacity loss. Cost-effective but doesn't protect against
        distribution-path failures.
      </p>
      <p style={S.p}>
        <strong style={{ color: '#e4e4e7' }}>2N redundancy</strong> duplicates the entire power
        path: utility feed, transformer, UPS, PDU — each has an identical twin on an independent
        path. IT equipment uses dual power supplies, each on a different path. Protects against
        any single-path failure, including bus faults and maintenance errors.
      </p>
      <span style={S.eq}>N+1 → 4+1 = 5 modules (20% overhead) &nbsp;|&nbsp; 2N → 2×4 = 8 modules (100% overhead)</span>

      <h2 style={S.h2}>Power Usage Effectiveness (PUE)</h2>
      <span style={S.eq}>PUE = Total Facility Power ÷ IT Equipment Power</span>
      <p style={S.p}>
        A PUE of 1.0 would mean all power serves IT — physically impossible due to cooling,
        conversion losses, and auxiliary loads. The total facility power includes:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong style={{ color: '#d4d4d8' }}>IT Load:</strong> Servers, storage, networking — the productive load</li>
        <li style={S.li}><strong style={{ color: '#d4d4d8' }}>Cooling:</strong> CRAH/CRAC, chillers, cooling towers — often the largest non-IT load and can approach 30–40% of total facility power in warmer climates</li>
        <li style={S.li}><strong style={{ color: '#d4d4d8' }}>Conversion losses:</strong> UPS (3–8%), transformer (1–2%), distribution (2%)</li>
        <li style={S.li}><strong style={{ color: '#d4d4d8' }}>Lighting &amp; auxiliary:</strong> 3–5% of IT load</li>
      </ul>
      <p style={S.p}>
        Industry benchmarks: Google achieves PUE ≈ 1.10, hyperscale average is 1.2, enterprise
        colocation averages 1.5–1.8. Free-air cooling in cold climates can push PUE below 1.1.
      </p>

      <h2 style={S.h2}>Online Double-Conversion UPS</h2>
      <p style={S.p}>
        Data centres universally adopt this topology for its zero-transfer-time characteristic:
      </p>
      <span style={S.eq}>AC Mains → Rectifier → DC Bus (+ Battery) → Inverter → Clean AC Output</span>
      <p style={S.p}>
        The rectifier converts incoming AC to DC, simultaneously charging the battery bank
        and feeding the inverter. The inverter regenerates clean, regulated AC. Since the load
        always runs on inverter output, there is <em>zero</em> transfer time when mains fail —
        the battery seamlessly sustains the DC bus. Typical efficiency: 92–97% depending
        on loading. Modern IGBT-based units exceed 96% at rated load.
      </p>

      <h2 style={S.h2}>Harmonic Distortion from SMPS Loads</h2>
      <p style={S.p}>
        Server switch-mode power supplies draw non-sinusoidal current. The rectifier front-end
        produces odd harmonics dominated by:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>3rd harmonic (150 Hz): 15–33% of fundamental</li>
        <li style={S.li}>5th harmonic (250 Hz): 8–20%</li>
        <li style={S.li}>7th harmonic (350 Hz): 5–14%</li>
        <li style={S.li}>9th harmonic (450 Hz): 3–9%</li>
        <li style={S.li}>11th harmonic (550 Hz): 2–7%</li>
      </ul>
      <span style={S.eq}>THD = √(I₃² + I₅² + I₇² + I₉² + I₁₁² + ⋯) / I₁ × 100%</span>
      <p style={S.p}>
        IEEE 519-2022 limits THD to 5–8% at the point of common coupling (PCC). Compliance
        techniques include active harmonic filters and 12/18/24-pulse rectifier configurations.
      </p>

      <h2 style={S.h2}>K-Rated Transformers</h2>
      <p style={S.p}>
        Standard distribution transformers overheat when supplying harmonic-rich loads due to
        increased eddy-current and hysteresis losses. The K-factor quantifies harmonic severity:
      </p>
      <span style={S.eq}>K = Σ (h² × I_h²) &nbsp;&nbsp; where h = harmonic order, I_h = per-unit current</span>
      <p style={S.p}>
        A purely sinusoidal load has K = 1. Data centre loads produce K = 5–20. K-rated
        transformers (K-13, K-20) use oversized neutrals, reduced flux density, and improved
        core steel to safely handle these conditions.
      </p>

      <div style={S.ctx}>
        <span style={S.ctxT}>Indian Data Center Context</span>
        <p style={S.ctxP}>
          India's data centre market is expanding rapidly, with major hubs in Mumbai (submarine cable
          interconnect), Hyderabad (state incentives, low seismicity), Chennai (cable landing stations),
          and Pune. Installed capacity is projected to exceed 2 GW by 2026.
        </p>
        <p style={{ ...S.ctxP, marginTop: 8 }}>
          Facilities typically range 10–50 MW, with grid connections at 33 kV or 132 kV via
          AP Transco, MSEDCL, or TANGEDCO. Dual-feed from separate substations is essential for
          Tier III+ certification. Major operators include Reliance Jio, NTT, Adani (AdaniConneX),
          STT GDC, and CtrlS.
        </p>
        <p style={{ ...S.ctxP, marginTop: 8 }}>
          Tropical cooling challenges push PUE to 1.4–1.8 for conventional facilities. Liquid
          cooling and free-cooling economisers are gaining traction in newer builds. Industrial
          tariffs of ₹6–8/kWh make PUE optimisation directly impactful on operating cost. TRAI
          and MeitY data-localisation requirements continue to drive rapid capacity expansion.
        </p>
      </div>

      <h3 style={S.h3}>Key Standards &amp; References</h3>
      <ul style={S.ul}>
        <li style={S.li}>Uptime Institute — Tier Standard: Topology (2018)</li>
        <li style={S.li}>IEEE 519-2022 — Harmonic Control in Power Systems</li>
        <li style={S.li}>IEEE 1100-2005 — Powering &amp; Grounding Electronic Equipment (Emerald Book)</li>
        <li style={S.li}>BIS IS 1180 — Distribution Transformers Specification</li>
        <li style={S.li}>The Green Grid — PUE: A Comprehensive Examination (WP #49)</li>
        <li style={S.li}>ASHRAE TC 9.9 — Thermal Guidelines for Data Processing Environments</li>
        <li style={S.li}>IEC 62040 — Uninterruptible Power Systems (UPS)</li>
        <li style={S.li}>NFPA 110 — Standard for Emergency &amp; Standby Power Systems</li>
      </ul>
    </div>
  );
}

/* ─── Main Component ─── */

export default function DataCenterPower() {
  const [tab, setTab] = useState('simulate');
  const [itLoad, setItLoad] = useState(20);
  const [coolingEff, setCoolingEff] = useState(65);
  const [redundancy, setRedundancy] = useState('2N');
  const [season, setSeason] = useState('summer');
  const [fault, setFault] = useState('normal');
  const [faultStart, setFaultStart] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!faultStart) { setElapsed(0); return; }
    const id = setInterval(() => setElapsed((Date.now() - faultStart) / 1000), 100);
    return () => clearInterval(id);
  }, [faultStart]);

  useEffect(() => {
    if (elapsed > 2 && fault === 'ups_battery') setFault('dg_cranking');
    if (elapsed > 12 && fault === 'dg_cranking') setFault('dg_running');
  }, [elapsed, fault]);

  const triggerFault = useCallback(() => {
    if (fault === 'normal') {
      setFaultStart(Date.now());
      setFault('ups_battery');
    } else {
      setFaultStart(null);
      setFault('normal');
    }
  }, [fault]);

  const calc = useMemo(() => {
    const sf = season === 'summer' ? 1.0 : 0.6;
    const eff = coolingEff / 100;
    const cooling = itLoad * (0.15 + (1 - eff) * 0.6) * sf;
    const lighting = itLoad * 0.04;
    const upsEffPct = 91 + (itLoad / 50) * 5;
    const upsLoss = itLoad * (100 / upsEffPct - 1);
    const txLoss = itLoad * 0.015;
    const distLoss = itLoad * 0.02;
    const losses = upsLoss + txLoss + distLoss;
    const total = itLoad + cooling + lighting + losses;
    const pue = total / itLoad;
    const lf = itLoad / 50;
    const harmonics = [
      { n: 3, pct: 33 - lf * 15 },
      { n: 5, pct: 20 - lf * 10 },
      { n: 7, pct: 14 - lf * 7 },
      { n: 9, pct: 9 - lf * 4 },
      { n: 11, pct: 7 - lf * 3 },
    ];
    const thd = Math.sqrt(harmonics.reduce((s, h) => s + h.pct ** 2, 0));
    const avail = redundancy === '2N' ? 99.995 : 99.982;
    return { cooling, lighting, losses, total, pue, upsEffPct, harmonics, thd, avail };
  }, [itLoad, coolingEff, season, redundancy]);

  const supplyClr = fault === 'normal' ? '#4ade80' : '#ef4444';
  const dgClr = fault === 'dg_cranking' ? '#f59e0b' : fault === 'dg_running' ? '#4ade80' : '#3f3f46';
  const mainClr = fault === 'normal' || fault === 'dg_running' ? '#4ade80' : '#f59e0b';
  const batClr = fault === 'ups_battery' || fault === 'dg_cranking' ? '#f59e0b' : '#52525b';
  const pueClr = calc.pue < 1.3 ? '#4ade80' : calc.pue < 1.6 ? '#f59e0b' : '#ef4444';
  const batSoc = (fault === 'ups_battery' || fault === 'dg_cranking')
    ? Math.max(0.4, 1 - elapsed * 0.004) : 1;

  const STATUS = {
    normal: ['NORMAL OPERATION', '#4ade80'],
    ups_battery: ['UTILITY FAILURE — UPS ON BATTERY', '#f59e0b'],
    dg_cranking: ['DG START SEQUENCE — CRANKING', '#f59e0b'],
    dg_running: ['DG ONLINE — LOAD TRANSFERRED', '#818cf8'],
  };

  const breakdown = useMemo(() => {
    const items = [
      { label: 'IT', value: itLoad, color: '#4ade80' },
      { label: 'Cooling', value: calc.cooling, color: '#60a5fa' },
      { label: 'Losses', value: calc.losses, color: '#f59e0b' },
      { label: 'Aux', value: calc.lighting, color: '#a78bfa' },
    ];
    let x = 0;
    return items.map(item => {
      const w = (item.value / calc.total) * 190;
      const result = { ...item, x, w };
      x += w;
      return result;
    });
  }, [itLoad, calc]);

  const lineClr = (id) => {
    if (SUPPLY.includes(id)) return supplyClr;
    if (MAIN.includes(id)) return mainClr;
    if (BATT.includes(id)) return batClr;
    if (DG_SEG.includes(id)) return dgClr;
    return '#27272a';
  };

  const loadFrac = itLoad / 50;
  const txHeatClr = loadFrac > 0.8 ? '#ef4444' : loadFrac > 0.5 ? '#f59e0b' : '#4ade80';

  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(tab === 'simulate')} onClick={() => setTab('simulate')}>Simulate</button>
        <button style={S.tab(tab === 'theory')} onClick={() => setTab('theory')}>Theory</button>
      </div>

      {tab === 'simulate' ? (
        <div style={S.simBody}>
          <div style={S.svgWrap}>
            <svg viewBox="0 0 760 415" width="100%" style={{ maxHeight: 480 }}>
              <defs>
                <filter id="gw" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#111116" strokeWidth="0.5" />
                </pattern>
              </defs>

              <rect width="760" height="415" fill="url(#grid)" />

              {/* Title */}
              <text x={380} y={20} textAnchor="middle" fontSize={11} fill="#3f3f46" fontWeight="600"
                letterSpacing="0.12em" fontFamily="monospace">
                DATA CENTER SLD — TIER {redundancy === '2N' ? 'IV (2N)' : 'III (N+1)'}
              </text>

              {/* PUE indicator badge */}
              <g transform="translate(15,365)">
                <rect width={120} height={34} rx={6} fill="#18181b" stroke={pueClr} strokeWidth={1} opacity={0.9} />
                <text x={60} y={14} textAnchor="middle" fontSize={8} fill="#71717a" fontWeight={600}>PUE</text>
                <text x={60} y={28} textAnchor="middle" fontSize={14} fill={pueClr} fontWeight={700} fontFamily="monospace">
                  {calc.pue.toFixed(2)}
                </text>
              </g>
              {/* Load fraction bar */}
              <g transform="translate(145,365)">
                <rect width={120} height={34} rx={6} fill="#18181b" stroke={txHeatClr} strokeWidth={1} opacity={0.9} />
                <text x={60} y={14} textAnchor="middle" fontSize={8} fill="#71717a" fontWeight={600}>IT LOAD</text>
                <rect x={10} y={18} width={100} height={6} rx={3} fill="#27272a" />
                <rect x={10} y={18} width={Math.min(100, loadFrac * 100)} height={6} rx={3} fill={txHeatClr} />
                <text x={60} y={31} textAnchor="middle" fontSize={7} fill="#71717a">{itLoad} / 50 MW</text>
              </g>

              {/* ── Connection lines ── */}
              {Object.entries(PATHS).map(([id, d]) => (
                <path key={id} d={d} fill="none" stroke={lineClr(id)} strokeWidth={2}
                  strokeLinecap="round" opacity={lineClr(id) === '#3f3f46' || lineClr(id) === '#52525b' ? 0.4 : 1} />
              ))}

              {/* ── Flow dots ── */}
              {fault === 'normal' && SUPPLY.map(id =>
                <Dots key={`s${id}`} d={PATHS[id]} c="#4ade80" />
              )}
              {(fault === 'normal' || fault === 'dg_running') && MAIN.map(id =>
                <Dots key={`m${id}`} d={PATHS[id]} c="#4ade80" />
              )}
              {(fault === 'ups_battery' || fault === 'dg_cranking') && MAIN.map(id =>
                <Dots key={`t${id}`} d={PATHS[id]} c="#f59e0b" />
              )}
              {(fault === 'ups_battery' || fault === 'dg_cranking') && BATT.map(id =>
                <Dots key={`b${id}`} d={PATHS[id]} c="#f59e0b" n={2} />
              )}
              {fault === 'dg_running' && DG_SEG.map(id =>
                <Dots key={`g${id}`} d={PATHS[id]} c="#4ade80" />
              )}

              {/* ── Utility 1 ── */}
              <circle cx={55} cy={75} r={17} fill="#18181b" stroke={supplyClr} strokeWidth={2} />
              <text x={55} y={79} textAnchor="middle" fontSize={11} fill={supplyClr}
                fontWeight="700" fontFamily="monospace">U1</text>
              <text x={55} y={50} textAnchor="middle" fontSize={9} fill="#71717a">Utility 1</text>
              <text x={55} y={100} textAnchor="middle" fontSize={8} fill="#52525b" fontFamily="monospace">33 kV</text>

              {/* ── Utility 2 ── */}
              <circle cx={55} cy={290} r={17} fill="#18181b" stroke={supplyClr} strokeWidth={2} />
              <text x={55} y={294} textAnchor="middle" fontSize={11} fill={supplyClr}
                fontWeight="700" fontFamily="monospace">U2</text>
              <text x={55} y={318} textAnchor="middle" fontSize={9} fill="#71717a">Utility 2</text>
              <text x={55} y={272} textAnchor="middle" fontSize={8} fill="#52525b" fontFamily="monospace">33 kV</text>

              {/* Fault pulse rings */}
              {fault !== 'normal' && <>
                <circle cx={55} cy={75} r={22} fill="none" stroke="#ef4444" strokeWidth={1}>
                  <animate attributeName="r" values="22;30;22" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx={55} cy={290} r={22} fill="none" stroke="#ef4444" strokeWidth={1}>
                  <animate attributeName="r" values="22;30;22" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </>}

              {/* ── CB 1 ── */}
              <rect x={118} y={68} width={14} height={14} rx={2}
                fill={fault === 'normal' ? supplyClr : '#18181b'} stroke={supplyClr} strokeWidth={1.5} />
              {fault !== 'normal' && <>
                <line x1={120} y1={70} x2={130} y2={80} stroke="#ef4444" strokeWidth={2} />
                <line x1={130} y1={70} x2={120} y2={80} stroke="#ef4444" strokeWidth={2} />
              </>}
              <text x={125} y={62} textAnchor="middle" fontSize={7} fill="#52525b">CB</text>

              {/* ── CB 2 ── */}
              <rect x={118} y={283} width={14} height={14} rx={2}
                fill={fault === 'normal' ? supplyClr : '#18181b'} stroke={supplyClr} strokeWidth={1.5} />
              {fault !== 'normal' && <>
                <line x1={120} y1={285} x2={130} y2={295} stroke="#ef4444" strokeWidth={2} />
                <line x1={130} y1={285} x2={120} y2={295} stroke="#ef4444" strokeWidth={2} />
              </>}
              <text x={125} y={277} textAnchor="middle" fontSize={7} fill="#52525b">CB</text>

              {/* ── ATS ── */}
              <rect x={191} y={166} width={48} height={32} rx={5}
                fill="#18181b" stroke={mainClr} strokeWidth={2} />
              <text x={215} y={186} textAnchor="middle" fontSize={10} fill={mainClr} fontWeight="600">ATS</text>

              {/* ── Diesel Generator ── */}
              <circle cx={215} cy={370} r={20} fill="#18181b" stroke={dgClr} strokeWidth={2}
                filter={(fault === 'dg_cranking' || fault === 'dg_running') ? 'url(#gw)' : 'none'} />
              <text x={215} y={374} textAnchor="middle" fontSize={13} fill={dgClr} fontWeight="700">G</text>
              {(fault === 'dg_cranking' || fault === 'dg_running') && (
                <circle cx={215} cy={370} r={15} fill="none" stroke={dgClr}
                  strokeWidth={1.5} strokeDasharray="6 4" opacity={0.6}>
                  <animateTransform attributeName="transform" type="rotate"
                    from="0 215 370" to="360 215 370"
                    dur={fault === 'dg_cranking' ? '0.3s' : '1.5s'} repeatCount="indefinite" />
                </circle>
              )}
              <text x={215} y={398} textAnchor="middle" fontSize={9} fill="#71717a">Diesel Gen</text>
              <text x={215} y={410} textAnchor="middle" fontSize={7} fill="#52525b" fontFamily="monospace">
                {redundancy === '2N' ? '2×N rated' : 'N+1 spare'}
              </text>

              {/* ── Transformer A ── */}
              <circle cx={324} cy={120} r={12} fill="#18181b" stroke={mainClr} strokeWidth={1.5} />
              <circle cx={336} cy={120} r={12} fill="#18181b" stroke={mainClr} strokeWidth={1.5} />
              <circle cx={336} cy={109} r={3} fill={txHeatClr} opacity={0.9} />
              <text x={330} y={145} textAnchor="middle" fontSize={8} fill="#71717a">TX-A</text>
              <text x={330} y={155} textAnchor="middle" fontSize={7} fill="#52525b" fontFamily="monospace">33/0.415kV</text>

              {/* ── Transformer B ── */}
              <circle cx={324} cy={245} r={12} fill="#18181b" stroke={mainClr} strokeWidth={1.5} />
              <circle cx={336} cy={245} r={12} fill="#18181b" stroke={mainClr} strokeWidth={1.5} />
              <circle cx={336} cy={234} r={3} fill={txHeatClr} opacity={0.9} />
              <text x={330} y={270} textAnchor="middle" fontSize={8} fill="#71717a">TX-B</text>
              <text x={330} y={280} textAnchor="middle" fontSize={7} fill="#52525b" fontFamily="monospace">33/0.415kV</text>

              {/* ── UPS A ── */}
              <rect x={414} y={106} width={52} height={28} rx={4}
                fill="#18181b" stroke={mainClr} strokeWidth={1.5} />
              <text x={440} y={124} textAnchor="middle" fontSize={10} fill={mainClr} fontWeight="600">UPS</text>
              <text x={440} y={145} textAnchor="middle" fontSize={8} fill="#71717a">A</text>

              {/* ── UPS B ── */}
              <rect x={414} y={231} width={52} height={28} rx={4}
                fill="#18181b" stroke={mainClr} strokeWidth={1.5} />
              <text x={440} y={249} textAnchor="middle" fontSize={10} fill={mainClr} fontWeight="600">UPS</text>
              <text x={440} y={270} textAnchor="middle" fontSize={8} fill="#71717a">B</text>

              {/* UPS pulse when on battery */}
              {(fault === 'ups_battery' || fault === 'dg_cranking') && <>
                <rect x={411} y={103} width={58} height={34} rx={6} fill="none" stroke="#f59e0b" strokeWidth={1}>
                  <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1s" repeatCount="indefinite" />
                </rect>
                <rect x={411} y={228} width={58} height={34} rx={6} fill="none" stroke="#f59e0b" strokeWidth={1}>
                  <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1s" repeatCount="indefinite" />
                </rect>
              </>}

              {/* ── Battery A ── */}
              <rect x={427} y={59} width={26} height={13} rx={2} fill="none" stroke={batClr} strokeWidth={1.5} />
              <rect x={429} y={61} width={Math.max(1, 22 * batSoc)} height={9} rx={1} fill={batClr} />
              <rect x={453} y={63} width={3} height={5} rx={1} fill={batClr} />
              <text x={440} y={53} textAnchor="middle" fontSize={7} fill="#52525b">BAT-A</text>
              {(fault === 'ups_battery' || fault === 'dg_cranking') && (
                <text x={440} y={84} textAnchor="middle" fontSize={8} fill="#f59e0b" fontFamily="monospace">
                  {(batSoc * 100).toFixed(0)}%
                </text>
              )}

              {/* ── Battery B ── */}
              <rect x={427} y={293} width={26} height={13} rx={2} fill="none" stroke={batClr} strokeWidth={1.5} />
              <rect x={429} y={295} width={Math.max(1, 22 * batSoc)} height={9} rx={1} fill={batClr} />
              <rect x={453} y={297} width={3} height={5} rx={1} fill={batClr} />
              <text x={440} y={318} textAnchor="middle" fontSize={7} fill="#52525b">BAT-B</text>

              {/* ── PDU ── */}
              <rect x={538} y={158} width={34} height={48} rx={4}
                fill="#18181b" stroke={mainClr} strokeWidth={1.5} />
              <text x={555} y={186} textAnchor="middle" fontSize={9} fill={mainClr} fontWeight="600">PDU</text>

              {/* ── Server Racks ── */}
              {[120, 182, 245].map((y, i) => (
                <g key={i}>
                  <rect x={646} y={y - 18} width={28} height={36} rx={3}
                    fill="#18181b" stroke="#3f3f46" strokeWidth={1.5} />
                  {[-10, -3, 4, 11].map(dy => (
                    <line key={dy} x1={651} y1={y + dy} x2={669} y2={y + dy} stroke="#27272a" strokeWidth={1} />
                  ))}
                  <circle cx={666} cy={y - 12} r={2} fill="#4ade80">
                    <animate attributeName="opacity" values="1;0.3;1"
                      dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
                  </circle>
                </g>
              ))}
              <text x={660} y={278} textAnchor="middle" fontSize={9} fill="#71717a">Server Racks</text>
              <text x={660} y={290} textAnchor="middle" fontSize={8} fill="#52525b" fontFamily="monospace">
                {itLoad} MW IT
              </text>

              {/* Redundancy path labels */}
              {redundancy === '2N' && <>
                <text x={395} y={98} textAnchor="middle" fontSize={8} fill="#6366f1" fontStyle="italic">
                  Path A (independent)
                </text>
                <text x={395} y={288} textAnchor="middle" fontSize={8} fill="#6366f1" fontStyle="italic">
                  Path B (independent)
                </text>
              </>}

              {/* ── Status Banner ── */}
              <rect x={460} y={365} width={285} height={34} rx={8}
                fill="#18181b" stroke={STATUS[fault][1]} strokeWidth={1} opacity={0.9} />
              <text x={602} y={383} textAnchor="middle" fontSize={10}
                fill={STATUS[fault][1]} fontWeight="600" fontFamily="monospace">
                {STATUS[fault][0]}
              </text>
              {fault !== 'normal' && (
                <text x={602} y={395} textAnchor="middle" fontSize={8} fill="#71717a" fontFamily="monospace">
                  T+{elapsed.toFixed(1)}s
                  {fault === 'ups_battery' ? ' | Transfer <10ms' :
                   fault === 'dg_cranking' ? ' | Synchronising...' : ' | Stable'}
                </text>
              )}

              {/* Fault overlay border */}
              {fault !== 'normal' && (
                <rect x={1} y={1} width={758} height={413} rx={4}
                  fill="none" stroke={STATUS[fault][1]} strokeWidth={1}>
                  <animate attributeName="opacity" values="0.15;0.03;0.15" dur="2s" repeatCount="indefinite" />
                </rect>
              )}
            </svg>
          </div>

          {/* ── Results ── */}
          <div style={S.results}>
            <div style={S.ri}>
              <span style={S.rl}>Total Facility</span>
              <span style={S.rv}>{calc.total.toFixed(1)} <span style={{ fontSize: 12, color: '#71717a' }}>MW</span></span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>PUE</span>
              <span style={{ ...S.rv, color: pueClr }}>{calc.pue.toFixed(2)}</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>IT Load</span>
              <span style={S.rv}>{itLoad} <span style={{ fontSize: 12, color: '#71717a' }}>MW</span></span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Cooling</span>
              <span style={S.rv}>{calc.cooling.toFixed(1)} <span style={{ fontSize: 12, color: '#71717a' }}>MW</span></span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>UPS Efficiency</span>
              <span style={S.rv}>{calc.upsEffPct.toFixed(1)}%</span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>THD</span>
              <span style={{ ...S.rv, color: calc.thd > 30 ? '#ef4444' : calc.thd > 15 ? '#f59e0b' : '#4ade80' }}>
                {calc.thd.toFixed(1)}%
              </span>
            </div>
            <div style={S.ri}>
              <span style={S.rl}>Availability</span>
              <span style={S.rv}>{calc.avail.toFixed(3)}%</span>
            </div>
            <div style={{ ...S.ri, minWidth: 170 }}>
              <span style={S.rl}>Harmonic Spectrum</span>
              <svg width={170} height={52} viewBox="0 0 170 52">
                {calc.harmonics.map((h, i) => {
                  const bh = h.pct * 1.1;
                  return (
                    <g key={h.n}>
                      <rect x={6 + i * 33} y={38 - bh} width={22} height={bh}
                        rx={2} fill="#818cf8" opacity={0.65 + i * 0.05} />
                      <text x={17 + i * 33} y={36 - bh} textAnchor="middle"
                        fontSize={7} fill="#71717a">{h.pct.toFixed(0)}%</text>
                      <text x={17 + i * 33} y={49} textAnchor="middle"
                        fontSize={7} fill="#52525b">H{h.n}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div style={{ ...S.ri, minWidth: 200 }}>
              <span style={S.rl}>Power Breakdown</span>
              <svg width={200} height={24} viewBox="0 0 200 24">
                {breakdown.map((b, i) => (
                  <g key={i}>
                    <rect x={b.x + 2} y={2} width={Math.max(1, b.w)} height={14}
                      rx={i === 0 ? 3 : 0} fill={b.color} opacity={0.8} />
                    {b.w > 25 && (
                      <text x={b.x + b.w / 2 + 2} y={12} textAnchor="middle"
                        fontSize={7} fill="#fff" fontWeight="600">{b.label}</text>
                    )}
                  </g>
                ))}
                <rect x={2} y={2} width={190} height={14} rx={3}
                  fill="none" stroke="#27272a" strokeWidth={0.5} />
              </svg>
            </div>
          </div>

          {/* ── Controls ── */}
          <div style={S.controls}>
            <div style={S.cg}>
              <span style={S.label}>IT Load (MW)</span>
              <input type="range" min={1} max={50} value={itLoad}
                onChange={e => setItLoad(+e.target.value)} style={S.slider} />
              <span style={S.val}>{itLoad}</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Cooling Eff.</span>
              <input type="range" min={30} max={90} value={coolingEff}
                onChange={e => setCoolingEff(+e.target.value)} style={S.slider} />
              <span style={S.val}>{coolingEff}%</span>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Redundancy</span>
              <button style={{ ...S.tab(redundancy === 'N+1'), fontSize: 12, padding: '5px 12px' }}
                onClick={() => setRedundancy('N+1')}>N+1</button>
              <button style={{ ...S.tab(redundancy === '2N'), fontSize: 12, padding: '5px 12px' }}
                onClick={() => setRedundancy('2N')}>2N</button>
            </div>
            <div style={S.cg}>
              <span style={S.label}>Season</span>
              <button style={{ ...S.tab(season === 'summer'), fontSize: 12, padding: '5px 12px' }}
                onClick={() => setSeason('summer')}>Summer</button>
              <button style={{ ...S.tab(season === 'winter'), fontSize: 12, padding: '5px 12px' }}
                onClick={() => setSeason('winter')}>Winter</button>
            </div>
            <button
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: fault !== 'normal' ? '#dc2626' : '#27272a', color: '#fff',
              }}
              onClick={triggerFault}
            >
              {fault === 'normal' ? '\u26A1 Simulate Fault' : '\u21BB Restore Utility'}
            </button>
          </div>
        </div>
      ) : (
        <Theory />
      )}
    </div>
  );
}
