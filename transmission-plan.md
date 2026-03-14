Transmission & Distribution Simulations — Build Plan

Two Architecture Changes (apply to ALL simulations going forward)

1. Tabbed Interface Inside Every Simulation

Every simulation will have a top-level tab bar with two tabs:

[ Simulate ]  [ Theory ]





Simulate tab: The interactive visualization + controls (what we have now)



Theory tab: Scrollable content with concept explanation, key equations (rendered with styled spans, not LaTeX), annotated SVG diagrams, real-world context boxes ("In AP Transco, this means...")

The tab bar will be a reusable pattern baked into each JSX file (self-contained, no shared components). Styled as pill tabs at the top of the simulation container.

2. Real-World Indian Power System Context

All simulations use real voltage levels and terminology from the Indian grid:





Transmission: 765 kV, 400 kV, 220 kV, 132 kV (PGCIL / AP Transco)



Sub-transmission: 33 kV (AP Transco / DISCOMs)



Distribution: 11 kV, 415 V (DISCOMs — APSPDCL, APEPDCL)



Real conductor types: ACSR Moose, Zebra, Panther, Dog



Real tower configurations: single-circuit, double-circuit, horizontal/vertical



Indian Electricity Grid Code (IEGC) references where relevant



Simulation #0 — Flagship: Complete Power Grid

File: sims/transmission-distribution/power-grid-overview.jsx

This is the centerpiece — an interactive single-line diagram of the entire power system from generation to consumer.

Simulate tab:





SVG single-line diagram spanning left to right:





Thermal plant (NTPC-style) generating at 21 kV



Generator step-up transformer: 21 kV / 400 kV



400 kV EHV transmission line (animated power flow particles)



400/220 kV grid substation (AP Transco)



220 kV transmission line



220/132 kV substation



132/33 kV substation



33/11 kV distribution substation (DISCOM)



11 kV feeder



11 kV / 415 V distribution transformer



Consumer load (residential, commercial, industrial)



Each component is clickable — shows popup with:





Equipment rating, type, specifications



Current voltage, current, power flow values



Losses at that stage



Controls: total generation (MW), load demand, power factor



Live readouts: voltage at each bus, line losses (MW + %), total system efficiency



Animated power flow arrows (thickness proportional to power)

Theory tab:





Overview of Indian power system structure



Why we step up voltage for transmission (I^2 R loss reduction — with equation)



Voltage levels and who operates each tier (NTPC, PGCIL, Transco, DISCOM)



Typical loss percentages at each stage (AT&C losses context)



SVG diagram of the voltage cascade



Simulations #1-9 — Individual T&D Topics

Each follows the same tabbed pattern. Listed with real-world framing:

#1: Transmission Line Parameters

File: sims/transmission-distribution/line-parameters.jsx

Simulate: Interactive cross-section of a transmission tower. User picks conductor type (ACSR Moose/Zebra/Panther), spacing configuration (single/double circuit, horizontal/vertical/triangular), bundled conductors (1/2/3/4). Computes and displays R, L, C per km using GMR/GMD. Shows the formulas updating live.

Theory: GMR and GMD derivations, effect of bundling on inductance and capacitance, table of standard ACSR conductor properties, why PGCIL uses quad-bundled Moose for 400 kV.

#2: ABCD Parameters & Line Models

File: sims/transmission-distribution/abcd-parameters.jsx

Simulate: User sets line length and picks model (short < 80 km, medium 80-250 km pi/T, long > 250 km). Shows the equivalent circuit diagram morphing between models. Receiving-end voltage/current circle diagram. Sending-end vs receiving-end phasor diagram. Voltage regulation calculation.

Theory: Derivation of ABCD matrices for each model, hyperbolic form for long lines, significance of Surge Impedance Loading (SIL), AP Transco's 400 kV lines are typically 200-400 km (long line model applies).

#3: Skin Effect & Proximity Effect

File: sims/transmission-distribution/skin-effect.jsx

Simulate: Animated cross-section of a conductor. Current density shown as a heatmap (uniform at DC, concentrated at surface at high frequency). Rac/Rdc ratio vs frequency curve. Proximity effect visualization with two adjacent conductors.

Theory: Bessel function solution (simplified), skin depth formula, why ACSR uses stranded construction, frequency dependency, impact on 50 Hz vs higher harmonics.

#4: Corona Effect

File: sims/transmission-distribution/corona-effect.jsx

Simulate: Cross-section of a 3-phase line. Voltage slider increases from zero — at critical disruptive voltage, corona glow appears (animated). Shows Peek's formula computing Vc, visual corona (Vv), and power loss vs voltage curve. Weather selector (fair/rain/fog) shifts the curves.

Theory: Peek's formula with all correction factors, corona power loss (Peterson's formula), effect on radio/TV interference, why 400 kV lines use bundled conductors to reduce corona, audible noise limits from CEA.

#5: Ferranti Effect

File: sims/transmission-distribution/ferranti-effect.jsx

Simulate: A long transmission line shown as a profile. Voltage magnitude plotted along the line length. At no-load: receiving end voltage rises above sending end — animated phasor explanation showing capacitive charging current. User adjusts line length and loading to see the effect appear/disappear.

Theory: Why it happens (distributed capacitance dominates at light load), the long-line equation showing Vr > Vs, SIL as the transition point, real cases — AP Transco 400 kV lines during low-demand nights, why shunt reactors are needed.

#6: Sag-Tension Calculation

File: sims/transmission-distribution/sag-tension.jsx

Simulate: Visual conductor span between two towers (equal or unequal height supports). Catenary curve drawn live. User adjusts: span length, conductor weight, temperature (expansion), wind loading, ice loading. Shows sag value, ground clearance check against IE rules. Temperature variation animates conductor expansion.

Theory: Parabolic vs catenary approximation, sag formula, effect of temperature (coefficient of expansion for ACSR), Indian Electricity Rules minimum ground clearance requirements (6.1m for 400kV, 5.2m for 220kV etc.), stringing charts, ruling span concept.

#7: Power Circle Diagram

File: sims/transmission-distribution/power-circle-diagram.jsx

Simulate: Interactive sending-end and receiving-end power circles drawn on P-Q axes. User adjusts ABCD parameters, Vs, Vr, and load angle delta. Operating point moves on the circle. Maximum power transfer point highlighted. Active and reactive power values displayed.

Theory: Derivation from ABCD parameters, relation between circle diagram and steady-state stability limit, significance in power system planning (thermal limit vs stability limit vs voltage limit), how AP Transco determines line loadability.

#8: Distribution Systems

File: sims/transmission-distribution/distribution-systems.jsx

Simulate: Top-down view of a distribution network. Toggle between radial, ring main, and mesh topologies. Place loads on the feeder, see voltage profile along the feeder (drops with distance). Simulate a fault — show which sections lose power in radial vs ring. Shows I^2R losses calculation.

Theory: Comparison table of topologies (cost, reliability, voltage regulation), Indian distribution practice (mostly radial, urban areas ring main), 11 kV feeder design standards, DISCOM loss calculation, SAIFI/SAIDI reliability indices.

#9: Capacitor Placement for Power Factor Correction

File: sims/transmission-distribution/capacitor-placement.jsx

Simulate: An 11 kV feeder with distributed loads. Before/after voltage profile when capacitors are placed. User drags capacitor bank to different locations on the feeder. Shows: voltage improvement, loss reduction (MW), reactive power flow reduction. Optimal placement indicator.

Theory: 2/3 rule for optimal placement, kVAr sizing calculation, fixed vs switched capacitor banks, voltage rise calculation, harmonic resonance concerns, APGENCO/DISCOM capacitor bank practices, tariff penalty for low PF in India.



Simulations #10-14 — Renewable Energy Integration

#10: Duck Curve & RE Variability

File: sims/transmission-distribution/duck-curve-re-variability.jsx

Simulate: 24-hour demand curve with adjustable solar/wind penetration. As RE percentage increases, the net demand curve morphs into a duck shape — belly (midday solar surplus), neck (evening ramp), head (evening peak). User adjusts: RE capacity (GW), season (summer/winter/monsoon), storage capacity. Shows curtailment zone, ramp rate (MW/min), and frequency stability risk indicator.

Theory: What causes the duck curve, California ISO's experience, India's own duck curve emerging in states like Rajasthan/Karnataka/AP, CERC's ancillary services market for managing ramps, why flexible generation and storage are critical, IEGC ramp rate requirements.

#11: Inverter-Based Resource Grid Integration

File: sims/transmission-distribution/inverter-based-resources.jsx

Simulate: Side-by-side comparison — synchronous generator vs solar inverter connected to a grid bus. Shows: inertia response (H constant vs zero), fault current contribution (5-8x rated vs 1.1-1.5x for inverter), reactive capability (P-Q diagram for each), frequency response. Simulate a frequency dip event — generator provides inertial response, inverter needs synthetic inertia programming.

Theory: Grid-forming vs grid-following inverters, IEEE 1547 / CEA Technical Standards for RE connectivity, LVRT/HVRT requirements, why high RE penetration reduces system inertia, synthetic inertia concepts, India's RE grid code (CEA 2019 amendments).

#12: Reverse Power Flow in Distribution

File: sims/transmission-distribution/reverse-power-flow.jsx

Simulate: An 11 kV feeder with distributed rooftop solar at various points. Time-of-day slider shows: morning (normal flow), midday (reverse flow from solar), evening (normal). Voltage profile flips — receiving end voltage rises above sending end. Protection relay at substation sees reverse current — shows coordination problem. User adjusts solar penetration % and feeder length.

Theory: Why traditional radial protection assumes unidirectional flow, voltage regulation issues (ANSI limits), hosting capacity concept, solutions (smart inverters, OLTC coordination, network reconfiguration), India's net metering regulations, DISCOM challenges with high rooftop solar uptake in AP.

#13: Battery Energy Storage System (BESS)

File: sims/transmission-distribution/battery-energy-storage.jsx

Simulate: A BESS connected to a substation bus. 24-hour operation: charges during solar surplus (low price), discharges during evening peak (high price). Animated SoC gauge, charge/discharge power waveform, grid frequency stabilization demo (sudden load change → BESS responds in milliseconds vs gas turbine in minutes). Shows revenue calculation from arbitrage + ancillary services.

Theory: Li-ion cell chemistry basics, C-rate and cycle life trade-off, round-trip efficiency (85-90%), degradation curves, India's BESS tenders (SECI 500 MWh+), hybrid RE + storage projects, pumped hydro comparison, CERC regulations on storage.

#14: HVDC Transmission

File: sims/transmission-distribution/hvdc-transmission.jsx

Simulate: Two AC systems connected by HVDC link. Animated converter stations (rectifier → DC cable → inverter). Toggle between LCC (thyristor-based, current-source) and VSC (IGBT-based, voltage-source). Show: power flow control (independent of angle), no reactive power transmission on DC line, no skin effect. Comparison graph: HVDC vs HVAC breakeven distance (~600 km overhead, ~50 km cable).

Theory: Why DC (no reactive losses, no stability limit, no skin effect, asynchronous interconnection), 6-pulse and 12-pulse converter operation, Green Energy Corridors (Biswanath-Agra 800 kV, Raigarh-Pugalur 800 kV), India's HVDC links map, back-to-back HVDC for asynchronous regions, VSC advantages for offshore wind.



Simulations #15-19 — Modern Grid & Loads

#15: Data Center Power Architecture

File: sims/transmission-distribution/data-center-power.jsx

Simulate: Interactive single-line diagram of a Tier-III/IV data center: dual utility feeds → ATS → transformers → UPS (online double-conversion) → PDUs → server racks. Simulate: utility failure (UPS takes over, animated switchover), generator start sequence, load distribution across redundant paths. PUE calculator: total facility power / IT load power. Harmonic spectrum display from SMPS loads (3rd, 5th, 7th harmonics).

Theory: Uptime Institute tier classification (Tier I-IV), N+1 vs 2N redundancy, PUE benchmarks (1.1-1.6), why data centers are constant power loads (not constant impedance), harmonic mitigation (active filters, K-rated transformers), India's data center boom (Hyderabad, Mumbai, Chennai), typical 10-50 MW per facility, grid connection at 33/132 kV.

#16: EV Charging Infrastructure Impact

File: sims/transmission-distribution/ev-charging-impact.jsx

Simulate: A distribution transformer (100 kVA, 11kV/415V) serving a residential colony. User adds EV chargers: Level 1 (3.3 kW), Level 2 (7.2 kW), DC fast (50 kW). Shows transformer loading %, hot-spot temperature rise, voltage drop at end of feeder. Demand diversity factor reduces as EVs increase. Time-of-day charging profiles — unmanaged vs smart charging comparison. Animated transformer aging acceleration.

Theory: EV charging standards (Bharat AC/DC, CCS, CHAdeMO), demand diversity factors for EV, impact on distribution transformer life (IEEE C57.91 loading guide), smart charging and V2G concepts, India's FAME-II charging infrastructure targets, why managed charging is critical for grid stability.

#17: Smart Grid & SCADA

File: sims/transmission-distribution/smart-grid-scada.jsx

Simulate: Interactive map-style view of a regional grid (3-4 substations, feeders, loads). SCADA control center shows: real-time bus voltages, feeder currents, breaker status (green/red). Simulate events: line trip (breaker opens, alarm), load shedding (operator action), fault isolation and supply restoration (FLISR sequence animated). DMS functions: network reconfiguration for loss minimization.

Theory: SCADA architecture (RTU → communication → master station → HMI), IEC 61850 protocol basics, synchrophasors/PMUs for wide-area monitoring, Distribution Management System functions, India's smart grid pilots (AP, Gujarat, Puducherry), NSGM (National Smart Grid Mission) objectives.

#18: HVDS (High Voltage Distribution System)

File: sims/transmission-distribution/hvds-system.jsx

Simulate: Side-by-side comparison — conventional LT distribution (11kV → large DTR → long LT lines) vs HVDS (11kV → small DTRs near loads → short LT). Shows: current flow (much lower in HV), I²R losses comparison, voltage profile, theft opportunity reduction (no long bare LT conductor). User adjusts: number of consumers, distance, load. Loss and voltage improvement computed live.

Theory: Why India's LT lines have high losses (30-40% in some areas), how HVDS reduces technical losses by 50-70%, how it reduces commercial losses (theft is harder from HT lines), cost-benefit analysis, R-APDRP and DDUGJY schemes that funded HVDS conversion, AP DISCOM HVDS rollout statistics.

#19: AT&C Loss Calculation

File: sims/transmission-distribution/atc-losses.jsx

Simulate: Interactive Sankey diagram showing energy flow: generation → transmission losses → distribution technical losses → commercial losses (theft + billing inefficiency) → billed energy → collected revenue. User adjusts each loss component. Shows AT&C loss formula: AT&C Loss = 1 - (Revenue Collected / Energy Input) × 100. Benchmark comparison: best-performing DISCOMs vs worst, AP DISCOMs position.

Theory: Breakdown of technical vs commercial losses, AT&C formula derivation, why AT&C is a better metric than pure technical losses (captures billing and collection efficiency), UDAY scheme targets, state-wise AT&C comparison, how smart metering reduces commercial losses, regulatory framework (APERC tariff orders), impact on DISCOM financial health.



Simulation Component Template

Every simulation will follow this internal structure (self-contained JSX):

+--------------------------------------------------+
|  [ Simulate ]    [ Theory ]          (tab bar)    |
+--------------------------------------------------+
|                                                    |
|  If Simulate tab:                                 |
|    +------------------------------------------+   |
|    |                                          |   |
|    |    SVG / Canvas visualization            |   |
|    |    (animated, interactive)               |   |
|    |                                          |   |
|    +------------------------------------------+   |
|    | Controls: sliders, selects, buttons      |   |
|    | Live results: voltage, current, losses   |   |
|    +------------------------------------------+   |
|                                                    |
|  If Theory tab:                                   |
|    +------------------------------------------+   |
|    | Concept Overview (text)                  |   |
|    | Key Equations (styled, values filled)    |   |
|    | Annotated SVG Diagram                    |   |
|    | Real-World Context box (AP Transco)      |   |
|    | References (IE Rules, CEA, IEGC)         |   |
|    +------------------------------------------+   |
|                                                    |
+--------------------------------------------------+

Key design decisions:





Tabs are inside each JSX file (no shared component needed)



Theory content is JSX — no markdown parser dependency



Equations rendered as styled span elements with fraction/superscript/subscript styling (no MathJax/KaTeX dependency)



SVG diagrams drawn inline in the Theory tab



Real-world context sections use a distinct card style (left border accent)



Build Order

Build the flagship first — it establishes the visual language, tabbed pattern, and Indian grid context that all others will follow.

Phase 1 — Flagship + Classical T&D (10 sims)





power-grid-overview.jsx — flagship end-to-end simulation (sets the template)



line-parameters.jsx — foundational, referenced by others



abcd-parameters.jsx — builds on line parameters



skin-effect.jsx — standalone



corona-effect.jsx — standalone



ferranti-effect.jsx — uses long-line concepts



sag-tension.jsx — standalone, very visual



power-circle-diagram.jsx — builds on ABCD



distribution-systems.jsx — shifts to distribution tier



capacitor-placement.jsx — practical distribution application

Phase 2 — RE Integration (5 sims)
11. duck-curve-re-variability.jsx — context for why the next ones matter
12. inverter-based-resources.jsx — fundamental RE grid interface
13. reverse-power-flow.jsx — distribution-level RE impact
14. battery-energy-storage.jsx — the solution to variability
15. hvdc-transmission.jsx — long-distance RE evacuation

Phase 3 — Modern Grid & Loads (5 sims)
16. data-center-power.jsx — emerging high-density load
17. ev-charging-impact.jsx — emerging distributed load
18. smart-grid-scada.jsx — how the grid is monitored/controlled
19. hvds-system.jsx — India-specific loss reduction
20. atc-losses.jsx — the big picture metric for DISCOM performance

Total: 20 simulations in sims/transmission-distribution/