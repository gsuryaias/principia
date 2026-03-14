Power System Protection Simulations — Build Plan

Two Architecture Changes (apply to ALL simulations going forward)

1. Tabbed Interface Inside Every Simulation

Every simulation will have a top-level tab bar with two tabs:

[ Simulate ]  [ Theory ]

Simulate tab: The interactive visualization + controls

Theory tab: Scrollable content with concept explanation, key equations (rendered with styled spans, not LaTeX), annotated SVG diagrams, real-world context boxes

The tab bar will be a reusable pattern baked into each JSX file (self-contained, no shared components). Styled as pill tabs at the top of the simulation container.

2. Real-World Indian Power System Context

All simulations use real relay types, settings, and protection practices from the Indian grid:

- Relay manufacturers: ABB (REF/RET/RED series), Siemens (7SJ/7SA/7UT series), SEL, L&T, BHEL, Easun Reyrolle, Alstom/GE (MiCOM)
- CT/PT specifications per IS 2705 and IEC 61869
- IEGC and CEA Technical Standards for protection (CEA Regulation 2010)
- AP Transco/PGCIL protection philosophy and typical relay settings
- Indian grid protection coordination practices (CTI = 0.3-0.4s for electromechanical, 0.2-0.3s for numerical)
- Standard fault levels and breaker ratings at various voltage levels
- CBIP (Central Board of Irrigation and Power) Manual on Protection


Simulation #0 — Flagship: Protection System Simulator

File: sims/protection/protection-simulator.jsx

This is the centerpiece — an interactive power system with complete protection coverage where users simulate faults and watch the protection system respond.

Simulate tab:

A 4-bus radial system single-line diagram with:
- Generator (with differential + backup OC protection)
- Generator transformer (with differential + Buchholz)
- 220 kV bus (with bus differential)
- 220 kV transmission line (with distance relay Zone 1/2/3)
- 132/33 kV substation transformer (with differential + OC)
- 33 kV feeders (with directional OC)
- CTs and PTs at each protection point

Each relay shown as a small icon on the diagram with status indicator (green = monitoring, yellow = pickup, red = tripped).

Fault simulation: user clicks anywhere on the diagram to place a fault:
- Fault type selector (LG, LL, LLG, 3-phase)
- Fault current flows animated from sources to fault point
- Relays that see the fault show pickup (yellow)
- Primary relay trips first (fastest), backup relay pickup shown with timer countdown
- Breaker animation: contact opening, arc, interruption
- Post-trip: isolated section shown grayed out, healthy sections remain green

Event log: timeline at the bottom showing every protection event in sequence:
"t=0ms: Fault at Bus 3 (LG, 15 kA)"
"t=5ms: Distance relay R1 Zone 1 pickup"
"t=25ms: R1 Zone 1 trip command"  
"t=50ms: Breaker B1 opens"
"t=300ms: Backup OC relay R2 pickup (would trip if B1 failed)"

Controls: fault location (click on diagram), fault type, fault impedance, relay settings (editable for each relay), breaker fail simulation toggle

Live readouts: fault current at each relay location, relay pickup status, operating times, breaker status

Theory tab:

- Protection system objectives: reliability (dependability + security), selectivity, speed, simplicity
- Protection zones: overlapping zones concept — every element within at least one zone
- Primary vs backup protection: why redundancy is essential
- CT and PT role: reducing system quantities to measurable levels
- Indian protection philosophy: CEA Technical Standards for protection (2010 regulations)
- Typical protection scheme for Indian 220 kV substation (PGCIL standard)
- Why protection is the most critical engineering in power systems — a single missed trip can cascade to a blackout (2012 Indian grid failure case study)


Simulations #1-4 — Relay Characteristics

#1: Overcurrent Relay

File: sims/protection/overcurrent-relay.jsx

Simulate: IDMT (Inverse Definite Minimum Time) relay characteristic display:

Five standard curves plotted on same axes (time vs current multiple):
- Standard Inverse (SI)
- Very Inverse (VI)
- Extremely Inverse (EI)
- Long-Time Inverse
- Definite Time (flat line)

Operating point: for a given fault current, a dot shows where on each curve the relay operates and the corresponding trip time.

Relay setting controls:
- Plug Setting (PS) / Pickup current: threshold current above which relay starts timing (0.5-2.0 × CT secondary rating)
- Time Multiplier Setting (TMS): scales the time curve up/down (0.05-1.0)
- CT ratio: determines how system current maps to relay current

Live demonstration: a current waveform appears (normal → fault). When current exceeds pickup:
1. Relay element picks up (disc starts rotating in electromechanical analogy / timer starts in numerical)
2. Operating time counted down based on curve type and TMS
3. Trip contact closes → breaker trips
4. Reset when current drops below pickup

Current plug setting multiplier (PSM) = fault current / pickup current — determines position on curve

Controls: curve type, plug setting (PS), TMS, CT ratio, fault current level, relay type (electromechanical disc / numerical)

Live readouts: PSM, operating time (seconds), pickup status, trip status, reset time

Theory tab:
- IDMT principle: higher fault current → faster trip time (inverse relationship)
- IEC 60255 standard curve equations:
  * SI: t = 0.14 × TMS / (I^0.02 - 1)
  * VI: t = 13.5 × TMS / (I - 1)
  * EI: t = 80 × TMS / (I^2 - 1)
- Plug setting: determines sensitivity (what minimum fault current the relay responds to)
- TMS: adjusts trip time without changing the curve shape — essential for coordination
- Pickup vs plug setting vs PSM terminology
- Electromechanical: aluminum disc rotating in magnetic field (induction principle), older but still in service
- Numerical relays: microprocessor-based, multiple curve options, event recording, communication (IEC 61850)
- Real-world context: overcurrent relays are the backbone of Indian distribution protection. Every 11 kV and 33 kV feeder has OC protection. Common relays in AP Transco: ABB REF615, Siemens 7SJ62, L&T numerical relays. Typical settings for an 11 kV feeder: CT 200/1, PS = 1.0 (pickup at 200A primary), TMS = 0.15, SI curve.
- CBIP Manual on Protection specifications for OC relay settings

#2: Distance Relay

File: sims/protection/distance-relay.jsx

Simulate: R-X diagram (impedance plane) with relay zones:

The impedance plane shows:
- Zone 1 (blue): instantaneous zone, 80% of protected line impedance, trips in 1-2 cycles (no intentional delay)
- Zone 2 (green): covers 100% of protected line + 50% of next line, trips in 0.3-0.5s delay
- Zone 3 (orange): covers next adjacent line, trips in 0.6-1.0s delay (backup)

Relay characteristics (user-selectable):
1. Mho circle: circular characteristic centered on Z-line direction
2. Quadrilateral: rectangular characteristic in R-X plane (more flexibility, preferred in modern relays)
3. Lens/tomato: modified mho (for short lines with high arc resistance)

Fault simulation: user clicks on the R-X plane to place a fault impedance point:
- Inside Zone 1: instantaneous trip (fast animation)
- Inside Zone 2 but outside Zone 1: delayed trip
- Inside Zone 3 but outside Zone 2: backup delayed trip
- Outside all zones: no trip (relay restrains)

Line impedance shown as a vector from origin — its length and angle represent the protected line

Arc resistance effect: fault through an arc adds resistance — fault impedance moves right on R-X plane. Can exit Zone 1 (underreach) — shown with adjustable arc resistance.

Power swing blocking: during stable power swing, apparent impedance sweeps through zones slowly — relay should block. Rate-of-change of impedance used to distinguish fault (fast) from swing (slow).

Controls: relay characteristic (mho/quad), zone reaches (Z1/Z2/Z3 in ohms), zone timers, line impedance, fault impedance point (R+jX), fault type, arc resistance, power swing demo toggle

Live readouts: apparent impedance seen by relay, zone in which fault falls, operating time, trip/restrain status

Theory tab:
- Distance relay principle: measures V and I at relay location, computes Z = V/I. If Z < Zset (fault is close), trips.
- Why distance (not overcurrent) for transmission lines: OC relay can't discriminate between close-in and far-away faults (current depends on source impedance too). Distance relay measures impedance to fault — proportional to distance.
- Zone scheme: Zone 1 = 80% of line (instantaneous, margin for errors), Zone 2 = 120% of line (delayed, overlaps into next line), Zone 3 = backup (covers next line)
- Mho characteristic: directional, good for long lines, but affected by arc resistance on short lines
- Quadrilateral: independent R and X settings, better arc resistance coverage, standard in modern numerical relays
- Reach setting calculation: Z_zone1 = 0.8 × Z_line, Z_zone2 = Z_line + 0.5 × Z_next_line, Z_zone3 = Z_line + Z_next_line
- Real-world context: distance relays protect all 220 kV and 400 kV lines in the Indian grid. PGCIL standard relay: ABB REL670 or Siemens 7SA87 (quadrilateral characteristic). AP Transco 220 kV lines use quadrilateral distance relays with Zone 1 set to 80%, Zone 2 to 120%, Zone 3 reverse for busbar backup. Typical 220 kV line impedance: 0.03+j0.32 ohm/km for ACSR Zebra.
- 2012 Indian grid blackout: distance relay Zone 3 played a role in cascading trips

#3: Differential Relay

File: sims/protection/differential-relay.jsx

Simulate: Protected equipment (transformer or generator) with CTs on both sides:

Basic principle animation:
- Normal load: I_in = I_out (Kirchhoff's law). CT secondaries produce equal currents in opposite directions through relay → net differential current = 0 → relay restrains.
- Internal fault: I_in ≠ I_out (fault current flows in but doesn't flow out). Differential current flows through relay → relay operates.
- External fault: large currents flow through but I_in = I_out → relay should restrain. But CT saturation may cause mismatch → spurious trip (problem shown).

Percentage differential characteristic:
- X-axis: restraining current Ir = (I1 + I2)/2
- Y-axis: operating current Id = |I1 - I2|
- Slope line: relay operates only if Id > slope% × Ir (typically 15-40%)
- Operating point plotted: above the slope = trip, below = restrain
- Dual slope: higher slope at high currents (to account for CT saturation during external faults)

CT saturation demonstration: during heavy external fault, one CT saturates before the other → false differential current appears → without percentage bias, relay would maloperate. With bias, the restraining current is also high → relay correctly restrains.

Inrush current blocking: during transformer energization, large magnetizing inrush current flows on primary but not secondary → appears as internal fault. Solution: detect 2nd harmonic content in differential current (inrush is rich in 2nd harmonic) → block trip. Waveform shown with harmonic analysis.

Controls: equipment type (transformer/generator), primary current (I1), secondary current (I2), fault location (internal/external/no fault), CT ratio, CT saturation toggle, percentage slope (%), inrush current toggle, 2nd harmonic block threshold

Live readouts: differential current (Id), restraining current (Ir), operating ratio (Id/Ir), trip/restrain status, harmonic content %

Theory tab:
- Kirchhoff's current law basis: current entering = current leaving for healthy equipment
- Basic differential: simple but sensitive to CT errors, tap changes, and inrush
- Percentage/biased differential: adds restraint proportional to through current — immune to CT mismatch
- Slope setting: higher slope = more secure but less sensitive. Typical: 15-25% for generators, 15-40% for transformers
- Dual slope: modern relays use low slope for normal currents, high slope for heavy faults (CT saturation region)
- Transformer differential challenges: turns ratio mismatch (CT ratios must compensate), phase shift (Dy → 30 deg shift, CTs must be connected to compensate or numerically corrected), magnetizing inrush (2nd harmonic blocking), overexcitation (5th harmonic blocking)
- Real-world context: every generator and power transformer in the Indian grid has differential protection. NTPC 500 MW generators use ABB RET670 transformer differential + REG670 generator differential. AP Transco 220/132 kV transformer protection: ABB RET615 or Siemens 7UT612 with dual-slope characteristic, 2nd harmonic blocking at 15%, 5th harmonic blocking at 25%.
- IS 3842 (application guide for protective relays)

#4: Directional Relay

File: sims/protection/directional-relay.jsx

Simulate: A bus with two feeders — power can flow in either direction (e.g., ring main or parallel feeder system):

Directional element visualization:
- Voltage (polarizing quantity) shown as reference phasor
- Current phasor rotates based on fault direction
- Trip zone: a semicircle or sector in the V-I angle plane where the relay operates (forward faults)
- Restrain zone: other semicircle (reverse faults)

Two scenarios animated:
1. Forward fault (fault ahead of relay): current flows in trip direction → relay operates
2. Reverse fault (fault behind relay): current flows in restrain direction → relay blocks

The V-I angle (torque angle) displayed — relay trips when angle is within operating zone (typically ±90 deg around maximum torque angle MTA)

Maximum Torque Angle (MTA): the V-I angle at which relay has maximum sensitivity. For overcurrent elements: 30-60 deg. For earth fault elements: 0-45 deg.

Directional OC combination: directional element determines IF to trip, overcurrent element determines WHEN to trip. Both must agree.

Application demo: ring main system with two sources — without directional relays, a fault causes both sources to trip (total blackout). With directional relays, only the relay looking toward the fault trips — other source continues to supply healthy sections.

Controls: relay MTA, operating angle range, V and I phasors (magnitude + angle), fault direction (forward/reverse), system topology (radial/ring)

Live readouts: V-I angle, torque (V × I × cos(angle - MTA)), trip/restrain decision, directional element status

Theory tab:
- Why directionality is needed: in networks with multiple sources, overcurrent alone can't determine fault direction — relay must know which way fault current is flowing
- Directional principle: compare current angle with a reference (voltage). If current is in the "forward" direction, permit trip.
- Polarizing quantity: voltage from unfaulted phases (cross-polarization) or memory voltage (for close-in faults where local voltage collapses)
- Torque equation (electromechanical): T = V × I × cos(theta - MTA). T > 0 means operate.
- Maximum Torque Angle: relay is most sensitive at this V-I angle. Chosen to match typical fault angle (line impedance angle for distance direction, load angle for power direction)
- 30-60-90 deg connections: different ways to connect V and I phases to the directional element
- Real-world context: directional OC relays used on all parallel feeders and ring main systems in the Indian grid. AP Transco uses directional OC on parallel 132 kV lines (two lines between same substations). DISCOMs use directional relays on 33 kV ring feeders in urban areas. Common relays: ABB REF615 with directional OC function, Siemens 7SJ62.
- Directional earth fault relays: critical for detecting ground faults with correct directionality in impedance-grounded systems


Simulations #5-7 — Protection Schemes

#5: Overcurrent Relay Coordination

File: sims/protection/overcurrent-coordination.jsx

Simulate: A radial feeder with 3-4 series relays (R1 closest to load, R4 at source):

Time-grading diagram: vertical axis = time, horizontal axis = fault location along the feeder. Each relay's operating time plotted as a curve — closer relays operate faster, upstream relays have higher time settings.

Coordination demonstration:
1. Fault near load end: R1 trips first (fastest), R2 would trip 0.3s later (backup if R1 fails)
2. Fault in middle: R2 trips first for its zone, R3 is backup
3. Breaker failure: if R1's breaker fails, R2 trips after CTI (Coordination Time Interval) — animated "what-if"

Setting procedure (step-by-step animated):
1. Start from furthest relay (R1): set for minimum time at maximum fault current
2. Move upstream (R2): at the maximum fault current seen by R1, R2's time = R1's time + CTI
3. Continue upstream: each relay = downstream relay time + CTI at coordination current

CTI adjustment: user slides CTI from 0.2 to 0.5s — watches how grading margins change and total clearance time at source increases

Discrimination curve overlay: all relay curves on single time-current axes, showing how they step above each other

Controls: number of relays (2-5), CT ratio for each, PS for each, TMS for each, curve type, fault current at each relay location, CTI

Live readouts: operating time for each relay at each fault location, grading margin (actual CTI), coordination status (pass/fail)

Theory tab:
- Coordination objective: nearest relay to fault should trip first. If it fails, next upstream relay trips after a deliberate time delay (CTI).
- CTI components: breaker operating time (5 cycles = 100ms for modern, 8 cycles for old) + relay overshoot time (50-100ms) + safety margin (100-200ms) = 0.3-0.4s typical
- Time grading: set TMS of upstream relays to achieve desired CTI at maximum fault current through downstream relay
- Relay coordination methods: time grading (IDMT curves), current grading (definite time), combined
- Discrimination limit: as you go upstream, clearing times add up — total time at source may be unacceptably long for many series relays
- Solution for long feeders: pilot wire / communication-based differential (eliminates time grading, instantaneous trip at both ends)
- Real-world context: OC coordination is performed for every new feeder in the Indian grid. AP Transco 33 kV feeder relay coordination: typically 3 relays in series (substation OC → sectionalizer → load point fuse). DISCOM 11 kV coordination: fuse-fuse coordination or relay-fuse coordination. CTI in India: 0.3s for numerical relays, 0.4s for electromechanical.
- CBIP Manual on Protective Relays provides standard coordination procedure for Indian utilities

#6: Transformer Protection

File: sims/protection/transformer-protection.jsx

Simulate: A power transformer with comprehensive protection system:

Protection zones shown as layers around the transformer:
1. Buchholz relay (mechanical, oil-level/gas detection) — on the pipe between tank and conservator
2. Differential relay (87T) — CTs on HV and LV sides
3. Overcurrent relay (51) — backup, time-delayed
4. Earth fault relay (51N/64) — neutral CT or restricted earth fault
5. Winding temperature relay (49) — RTD/OTI based
6. Pressure relief device — sudden pressure rise

Fault type selector — each fault triggers specific protection:

1. Internal winding fault (turn-to-turn): small initially → Buchholz (gas accumulation over time, slow gas alarm). If severe, differential relay operates.
2. Internal winding fault (phase-to-ground): large fault current → differential relay operates immediately
3. External fault (on connected feeder): large through current but differential restrains (I_in = I_out). Backup OC may start timing if sustained.
4. Inrush during energization: large primary current (5-10x) → differential sees unbalanced current BUT 2nd harmonic blocking prevents trip. Waveform shown with harmonic content.
5. Overload: gradual temperature rise → winding temperature relay alarm (first stage) → trip (second stage)
6. Core bolt insulation failure: localized heating → slow gas evolution → Buchholz alarm
7. Oil breakdown: arcing → rapid gas generation → Buchholz trip + pressure relief

For each fault: the operating protection element lights up, non-operating elements remain gray. Event sequence shown on timeline.

Controls: fault type selector, fault severity, transformer rating, protection settings for each relay, enable/disable individual protections

Live readouts: fault current, differential current, Buchholz gas level, temperature, relay operating times, which protection operated first

Theory tab:
- Why transformer needs multiple protections: different fault types manifest differently — no single relay covers all
- Buchholz relay: mechanical device, detects gas from oil decomposition. Slow gas (minor fault) → alarm. Sudden gas surge (major fault) → trip. Also detects oil level drop and oil surge from arc. Only for oil-immersed transformers.
- Differential (87T): primary electrical protection for internal faults. Must handle CT mismatch, turns ratio, vector group shift, tap changer position, inrush.
- Overcurrent (51/51N): backup protection — operates if differential fails, or for external faults the transformer must be cleared from
- REF (Restricted Earth Fault): sensitive to ground faults near neutral end of star winding (where differential is insensitive due to low fault current)
- Temperature protection: OTI (Oil Temperature Indicator) and WTI (Winding Temperature Indicator) — alarm at lower threshold, trip at higher threshold
- Real-world context: Indian transformer protection practice per PGCIL/AP Transco standards:
  * 220/132 kV transformer: Buchholz + 87T (biased differential, ABB RET670) + 51/51N backup + WTI/OTI
  * 132/33 kV: same plus REF on 33 kV star winding
  * Distribution transformers (11kV/433V, 25-250 kVA): fuse protection only (HV side HRC fuse) — no relays due to cost
  * Transformer fire protection: nitrogen injection, foam spray systems at major substations
- IS 2026 transformer protection requirements

#7: Generator Protection

File: sims/protection/generator-protection.jsx

Simulate: Generator capability curve (P-Q diagram) with protection zones overlaid:

The capability curve shows the operating envelope:
- Stator current limit (outer circle — I^2R heating of stator winding)
- Rotor current limit (right side — field winding heating)
- Stability limit (left side — minimum excitation before loss of synchronism)
- End-region heating limit (leading PF region — stator end iron heating)
- Prime mover limit (top — maximum mechanical input)

Protection functions as colored overlay zones:

1. Reverse Power (32): P < 0 zone. Generator absorbs power — means prime mover has failed (e.g., steam valve closed but generator still connected). Trip to prevent motoring damage.
2. Loss of Field (40): operating point drifts into leading PF region beyond stability limit. Detected by impedance measurement (mho circle in R-X plane). Generator may lose synchronism and damage itself.
3. Negative Sequence (46): I2/I1 > threshold. Unbalanced stator currents induce 2f (100 Hz) currents in rotor → rotor overheating. Time-limited.
4. Stator Earth Fault (64S): 95% coverage with fundamental frequency injection, 100% with sub-harmonic (20 Hz) injection
5. Over/Under Voltage (59/27): abnormal voltage threatens insulation (over) or magnetic saturation (under)
6. Over/Under Frequency (81O/81U): abnormal frequency affects turbine blades and system stability
7. Out-of-Step (78): generator pole slipping — impedance trajectory crosses through the machine impedance repeatedly

User clicks on different regions of the capability diagram to simulate conditions — corresponding relay activates

Controls: operating point (P, Q — drag on capability diagram), generator parameters (rating, Xd, Xd', H), protection settings for each function, excitation level, prime mover power

Live readouts: P, Q, Ia, PF, excitation current, power angle, I2/I1 ratio, status of each protection function

Theory tab:
- Generator is the most expensive and critical component — comprehensive protection essential
- Capability curve: defines the safe operating region in P-Q space. Determined by thermal and stability limits.
- Each protection function and what it protects against:
  * 87G (differential): internal stator faults — most critical
  * 32 (reverse power): motoring — 1-3% of rated as threshold (steam turbine can be damaged by motoring)
  * 40 (loss of excitation): uses offset mho circle to detect impedance dropping into leading region
  * 46 (negative sequence): I2^2 × t = K (thermal capability — K = 5-30 depending on rotor type)
  * 64S (stator ground fault): first ground fault in India's typically impedance-grounded generator neutral doesn't cause damage but second ground fault would be catastrophic
  * 21 (distance — backup): backup for system faults that aren't cleared by line protection
- Real-world context: every NTPC/BHEL generator has comprehensive protection per CEA Technical Standards:
  * Typical 500 MW turbo-generator protection: ABB REG670 or Siemens 7UM62 providing all functions in one IED
  * Protection settings vetted by CEA protection committee
  * Generator tripping matrix: which protections trip generator breaker, field breaker, prime mover, or combinations
  * NTPC Simhadri (2×500 MW near Vizag) protection philosophy as example
- IEEE C37.102 (Generator Protection Guide) adapted to Indian practice


Simulations #8-9 — Switchgear

#8: Circuit Breaker Operation

File: sims/protection/circuit-breaker-operation.jsx

Simulate: Animated cross-section of a circuit breaker showing the interruption process:

Three breaker types selectable:
1. SF6 (gas circuit breaker): puffer/self-blast mechanism
2. Vacuum: contacts in vacuum interrupter bottle
3. Oil (legacy, still in service): oil acts as insulator and arc quencher

For each type, the animation shows:
- Contacts closed (normal operation) — current flowing through contacts
- Trip signal received — mechanism operates, contacts begin to separate
- Arc formation: as contacts separate, arc draws between them (animated plasma)
- Arc quenching: medium-specific mechanism:
  * SF6: gas blast cools the arc, SF6 recombines after arc extinction
  * Vacuum: arc diffuses in vacuum, re-strikes possible at current zero
  * Oil: oil decomposes into hydrogen gas bubble, cools the arc
- Current zero crossing: arc extinguishes at natural current zero (AC advantage)
- Transient Recovery Voltage (TRV): after arc extinction, voltage across contacts rises — if it exceeds dielectric strength before gap has recovered, arc re-strikes

TRV waveform: oscillatory voltage across contacts after arc extinction — first peak is the critical stress. If contacts have recovered enough dielectric strength, breaker succeeds. If not, re-strike occurs (animation shows this failure mode).

Breaking process timeline: contact parting → arcing time → total break time → typically 2-3 cycles for modern breakers

Controls: breaker type, rated voltage (11/33/132/220/400 kV), fault current level, X/R ratio (affects DC component and TRV), recovery voltage

Live readouts: fault current (symmetrical + asymmetrical), arc duration, TRV peak, TRV rate of rise (kV/us), total break time, breaking capacity utilization %

Theory tab:
- Why breaking AC is easier than DC: current naturally crosses zero every half cycle — arc momentarily extinguishes, breaker just needs to prevent re-strike
- Arc physics: ionized gas channel, maintained by I^2R heating of plasma, needs continuous current to sustain
- Arc interruption: remove energy from arc faster than I^2R puts it in → arc cools → resistance increases → current driven to zero
- SF6 properties: excellent dielectric (2-3x air), good thermal conductivity, high electronegativity (captures free electrons), self-healing. Environmental concern: SF6 is a potent greenhouse gas (GWP = 23,500)
- Vacuum: best for medium voltage (11-33 kV), extremely fast recovery (microseconds), low maintenance, compact
- TRV: determined by circuit parameters (L, C). Rate of Rise of Recovery Voltage (RRRV) is the critical parameter — IEC 62271-100 defines standard TRV envelopes
- Breaker ratings: rated voltage, rated current, breaking capacity (kA), making capacity (2.5 × breaking), short-time withstand
- Real-world context: Indian grid breaker inventory:
  * 400 kV: SF6 breakers, ABB/Siemens/CGL, 40-50 kA breaking capacity
  * 220 kV: SF6, 31.5-40 kA
  * 132 kV: SF6 (replacing old oil breakers), 25-31.5 kA
  * 33 kV: vacuum breakers (VCB), 20-25 kA — most new installations in India
  * 11 kV: VCB, 20-25 kA — L&T, Siemens, ABB, Schneider (very common in Indian distribution)
  * Old minimum oil circuit breakers (MOCB) still in service at some AP Transco 132 kV substations — being replaced
- IS 13118 (HV circuit breakers), IEC 62271-100

#9: CT and PT Characteristics

File: sims/protection/ct-pt-characteristics.jsx

Simulate: Two main visualization areas:

Current Transformer (CT):
- Magnetization curve (excitation characteristic): V_secondary vs I_excitation plotted. Knee point clearly marked — the voltage above which CT saturates (core flux reaches maximum).
- Below knee point: accurate transformation (linear region), secondary current faithfully reproduces primary current
- Above knee point: saturation — secondary current waveform clips/distorts (shown as waveform comparison: primary sinusoidal vs secondary clipped). CT ratio error increases dramatically.
- Burden effect: increasing burden (relay + lead resistance) requires more CT voltage to drive current → pushes CT toward saturation faster. Demonstrated with adjustable burden.
- CT secondary voltage = I_s × Z_burden plotted on the magnetization curve — intersection shows operating point

Accuracy class visualization:
- Metering CT (Class 0.5, 1.0): accurate at rated current, saturates at 1.2-1.5× (protects metering instruments from fault currents)
- Protection CT (Class 5P, 10P): maintains accuracy up to ALF × rated current (Accuracy Limit Factor), may saturate at high multiples but designed for wide range
- PS class (for differential relays): specified by Vkp (knee point voltage) and Ie (excitation current at Vkp)

Potential Transformer (PT):
- Voltage ratio accuracy vs burden
- Ferroresonance demonstration: PT with transformer and cable capacitance forms LC circuit — at certain conditions, sustained overvoltage oscillations occur (animated waveform showing chaotic ferro-resonant voltage). Solution: loading resistor on PT secondary.

Controls: CT — primary current (0-30× rated), burden (VA), CT class (metering/protection/PS class), CT ratio. PT — primary voltage, burden, cable capacitance.

Live readouts: CT — ratio error %, phase error, composite error, knee point voltage, ALF, operating point on magnetization curve. PT — ratio error %, burden VA, resonance indicator.

Theory tab:
- CT purpose: reduce system current (100s-1000s of A) to measurable level (1A or 5A secondary) for relays and meters
- CT must never be open-circuited: with no secondary load, entire primary MMF drives the core to extreme saturation → dangerously high voltage spikes on secondary (can kill)
- CT equivalent circuit: ideal transformer + magnetizing branch (core loss + magnetizing reactance) + winding impedance
- Knee point voltage: IEC definition — point where 10% increase in excitation voltage causes 50% increase in excitation current
- Burden: total impedance of relay + pilot wire + CT secondary winding. Must be within CT rating.
- Dimensioning for protection: ALF × rated current must exceed maximum fault current at that location → ALF × In × Zburden ≤ Vknee
- PS class CT for differential relays: specified by Vkp and Rct (winding resistance) — ensures no saturation during external faults up to rated through fault current × burden
- Real-world context: Indian CT/PT specifications:
  * IS 2705 (CTs), IS 3156 (PTs)
  * Standard CT ratios in India: 100/1, 200/1, 400/1, 800/1, 1600/1 (protection CTs use 1A secondary, metering use 5A secondary)
  * 5P20 means: accuracy class 5% composite error at 20× rated current (ALF = 20)
  * PS class specification example: Vkp ≥ 400V, Ie ≤ 30mA at Vkp, Rct ≤ 5 ohms — typical for transformer differential relay CT
  * PT ratios: 11kV/110V, 33kV/110V, 132kV/110V, 220kV/110V — secondary is always 110V (India) or 115V
  * Ferroresonance incidents in Indian 33 kV systems with CVTs (Capacitor Voltage Transformers) — a known issue


Build Order

Build the flagship first — it establishes the protection visualization framework showing relay pickup, trip sequencing, and fault response.

Phase 1 — Flagship + Relay Types (5 sims)
1. protection-simulator.jsx — flagship interactive protection system (sets the template)
2. overcurrent-relay.jsx — most fundamental relay type, used everywhere
3. distance-relay.jsx — primary transmission line protection
4. differential-relay.jsx — primary equipment protection
5. directional-relay.jsx — completes the relay type set

Phase 2 — Protection Schemes (3 sims)
6. overcurrent-coordination.jsx — practical application of OC relays in coordinated system
7. transformer-protection.jsx — complete protection scheme for transformers
8. generator-protection.jsx — most comprehensive protection scheme

Phase 3 — Switchgear (2 sims)
9. circuit-breaker-operation.jsx — the device that executes the trip command
10. ct-pt-characteristics.jsx — the sensing devices that feed the relays

Total: 10 simulations in sims/protection/
