Electric Machines Simulations — Build Plan

Two Architecture Changes (apply to ALL simulations going forward)

1. Tabbed Interface Inside Every Simulation

Every simulation will have a top-level tab bar with two tabs:

[ Simulate ]  [ Theory ]

Simulate tab: The interactive visualization + controls (what we have now)

Theory tab: Scrollable content with concept explanation, key equations (rendered with styled spans, not LaTeX), annotated SVG diagrams, real-world context boxes ("In Indian industry, this means...")

The tab bar will be a reusable pattern baked into each JSX file (self-contained, no shared components). Styled as pill tabs at the top of the simulation container.

2. Real-World Indian Industrial Context

All simulations use real ratings and terminology from Indian industrial practice:

- Standard voltage levels: 415 V (LT motors), 3.3 kV, 6.6 kV, 11 kV (HT motors)
- IS/IEC standards for motor ratings (IS 325, IS 12615, IEC 60034)
- BEE (Bureau of Energy Efficiency) star ratings and IE efficiency classes (IE1/IE2/IE3/IE4)
- Typical Indian industrial applications: cement plants, steel mills, textile mills, water pumping, sugar factories, railways (25 kV AC traction)
- NTPC/BHEL generator specifications where relevant
- Indian railway traction motor context (WAP-7, WAG-9 locomotives)


Simulation #0 — Flagship: Electric Machine Explorer

File: sims/electric-machines/machine-explorer.jsx

This is the centerpiece — an interactive side-by-side comparison of all four machine types with animated operating principles.

Simulate tab:

Four-quadrant selector: DC Motor | Induction Motor | Synchronous Motor | Transformer

For each selection, shows:

- Animated cross-section of the machine (rotor spinning, flux paths drawn, current flow arrows)
- Live phasor diagram (where applicable)
- Speed-torque characteristic curve with animated operating point
- Power flow diagram: Input → Losses (copper, iron, mechanical, stray) → Output
- Efficiency calculation updating live

Controls: load torque (0-150% rated), supply voltage, field/excitation, frequency

Live readouts: speed (rpm), torque (Nm), input power (kW), output power (kW), efficiency (%), power factor, slip (for induction)

Comparison mode: overlay speed-torque curves of all motor types on one plot — shows why each suits different applications

Theory tab:

- Overview of electromechanical energy conversion (field energy, co-energy)
- Classification tree of electric machines
- Comparison table: DC vs Induction vs Synchronous (starting torque, speed regulation, PF, complexity, cost, maintenance)
- Where each type is used in Indian industry (DC: steel mill rolling, Induction: 90% of industrial drives, Synchronous: compressors/PF correction, Transformer: everywhere)
- BEE energy efficiency norms for motors (IS 12615)
- SVG diagram of the energy conversion chain


Simulations #1-4 — DC Machines

#1: DC Motor Fundamentals

File: sims/electric-machines/dc-motor-fundamentals.jsx

Simulate: Animated cross-section showing rotor (armature), stator (field poles), commutator segments, and brush contact. Flux lines from field poles drawn. As armature rotates, shows:
- Current direction in conductors reversing at commutator
- Torque production (F = BIL force vectors on conductors)
- Back-EMF generation (Eb = PNZA/60A) with live value
- Speed settling to equilibrium where Eb ≈ V - IaRa

Controls: field current (If: 0.5-3A), armature voltage (V: 0-440V), load torque (0-200% rated)

Live readouts: speed (rpm), back-EMF (V), armature current (A), developed torque (Nm), input/output power (kW)

Animated detail: commutator segments light up to show current reversal, sparking animation if brush position is off-neutral

Theory tab:
- Construction details with annotated cross-section SVG (yoke, poles, interpoles, armature, commutator, brushes)
- EMF equation derivation: Eb = PNZA / 60A
- Torque equation: T = PZIa / 2piA (with phi)
- Torque production mechanism (BIL force on conductor)
- Commutation process — why we need a commutator (mechanical rectifier)
- Real-world context: DC motors in Indian steel plants (SAIL Bhilai, Tata Steel — rolling mill drives up to 5000 HP), Kolkata tram system, battery-operated vehicles
- Why DC motors are being replaced by VFD-driven induction motors, but still critical for legacy installations

#2: DC Motor Characteristics

File: sims/electric-machines/dc-motor-characteristics.jsx

Simulate: Speed-torque (N vs T) curves plotted for three motor types simultaneously:
- Series motor: high starting torque, hyperbolic N-T curve, never-run-unloaded warning zone shaded
- Shunt motor: nearly flat speed, slight droop
- Compound motor: between series and shunt (cumulative and differential)

Animated operating point dot moves as user adjusts load. Motor type toggle switches the active curve. At light load on series motor, speed arrow shoots up with danger indicator.

Controls: motor type (series/shunt/compound cumulative/compound differential), supply voltage (220V/440V), field resistance (for shunt), load torque slider

Live readouts: speed, armature current, torque, speed regulation %

Additional visualization: current-torque (Ia vs T) and speed-current (N vs Ia) curves alongside

Theory tab:
- Derivation of N-T relationship for each type from fundamental equations
- Series: N ∝ 1/sqrt(T) — why never run unloaded (runaway)
- Shunt: N = (V - IaRa)/Kphi — nearly constant speed
- Compound: combined characteristics, why cumulative is preferred
- Comparison table: starting torque, speed regulation, applications
- Real-world context: series motors in Indian Railways (older DC EMUs in Mumbai suburban — now being replaced), shunt motors for machine tools (HMT lathes), compound motors for rolling mills
- IS 4722 (DC motor specifications)

#3: DC Motor Speed Control

File: sims/electric-machines/dc-motor-speed-control.jsx

Simulate: N-T curve with operating point. Two control methods visualized side-by-side:

Armature Voltage Control (below base speed):
- Variable voltage supply (Ward-Leonard or chopper-fed)
- Family of parallel N-T curves shifting up/down with voltage
- Constant torque region highlighted

Field Weakening (above base speed):
- Field resistance increased, flux reduced
- Family of N-T curves with steeper droops
- Constant power region highlighted

Combined: full speed range diagram showing constant torque + constant power regions with the transition at base speed

Controls: armature voltage (0-100% rated), field resistance (Rf), load torque
Live readouts: speed, Ia, If, torque, power, operating region (constant T / constant P)

Animated power-speed envelope showing the achievable operating area

Theory tab:
- Speed equation manipulation: N = (V - IaRa) / Kphi
- Armature voltage control: varies V, constant phi → constant torque capability
- Field weakening: reduces phi, constant V → constant power capability
- Ward-Leonard system diagram and modern thyristor/chopper equivalent
- Why armature voltage control is preferred below base speed (full torque available)
- Why field weakening is limited (commutation issues, armature reaction)
- Real-world context: DC drive systems in Indian paper mills (JK Paper, ITC), cement kilns, mine winders (Singareni Collieries)
- Modern replacement: 4-quadrant thyristor drives (ABB DCS800, Siemens SINAMICS DC)

#4: DC Generator Characteristics

File: sims/electric-machines/dc-generator-characteristics.jsx

Simulate: Three interactive plots:

1. Open Circuit Characteristic (OCC): Field current vs Generated EMF — S-shaped magnetization curve with saturation knee point marked. Animated flux building up in the core.

2. Voltage Build-Up Process: For self-excited generator — animated step-by-step showing residual flux → small EMF → small field current → more flux → more EMF → convergence at intersection of OCC and field resistance line. If Rf is above critical value, build-up fails (animated). User adjusts Rf to see critical resistance.

3. External Characteristic: Terminal voltage vs load current for separately excited, shunt, series, compound. Voltage regulation calculation.

Controls: speed (rpm), field resistance, load current, excitation type toggle

Live readouts: generated EMF, terminal voltage, field current, armature drop, voltage regulation %

Theory tab:
- EMF equation for generator: Eg = PNZA / 60A
- Conditions for voltage build-up (residual magnetism, correct field connection, Rf < Rc)
- Critical field resistance concept — graphical determination on OCC
- Armature reaction: cross-magnetizing and demagnetizing effects
- External characteristic derivation for each type
- Real-world context: DC generators nearly extinct in power generation but still used as exciters (older BHEL turbogenerators used DC pilot exciter → main exciter → alternator chain), also in electroplating/electrochemical plants
- Replaced by static excitation systems (thyristor-based) in modern practice


Simulations #5-9 — Induction Machines

#5: Rotating Magnetic Field

File: sims/electric-machines/rotating-magnetic-field.jsx

Simulate: Top-down cross-section of a 3-phase stator with windings placed 120deg apart. Three features animated simultaneously:

1. Three sinusoidal phase currents (R-Y-B) plotted as time waveforms, vertical time cursor sweeping
2. At each time instant, individual flux vectors from each phase drawn in the cross-section
3. Resultant flux vector (vector sum) shown rotating smoothly at synchronous speed

The resultant vector maintains constant magnitude (1.5 times peak of individual) while rotating. Speed = 120f/P.

User can pause, step frame-by-frame, or scrub time. At any instant, the three individual vectors and their sum are clearly shown.

Controls: frequency (25/50/60 Hz), number of poles (2/4/6/8), phase current magnitude, time scrub slider

Live readouts: synchronous speed Ns (rpm), angular velocity omega_s (rad/s), instantaneous phase angles

Additional mode: single-phase vs 3-phase comparison — single phase produces pulsating (not rotating) field, split into two counter-rotating components

Theory tab:
- Mathematical proof: sum of three sinusoidal mmfs displaced 120deg in space and time gives constant-amplitude rotating field
- Ba + Bb + Bc = 1.5 Bm (derivation with trig identities)
- Synchronous speed formula: Ns = 120f/P
- Why 3-phase, not 2-phase (constant power, no pulsating torque)
- Why single-phase motors need a starting mechanism
- Real-world context: standard synchronous speeds in India at 50 Hz — 3000, 1500, 1000, 750 rpm (2/4/6/8 pole)
- Historical note: Tesla's invention, modern relevance

#6: Induction Motor Equivalent Circuit

File: sims/electric-machines/induction-motor-equivalent-circuit.jsx

Simulate: Per-phase equivalent circuit drawn as an interactive schematic:
- R1, X1 (stator resistance, leakage reactance)
- Xm (magnetizing reactance) — shunt branch
- R2/s, X2 (rotor referred to stator)
- R2(1-s)/s representing mechanical power conversion

Current flow arrows animate through the circuit, thickness proportional to magnitude. As slip changes (load changes), the current distribution shifts between magnetizing branch and rotor branch.

Power flow waterfall: Input electrical → stator copper loss → iron loss → air gap power → rotor copper loss → gross mechanical → friction/windage → net output. Each shown as colored bar, live updating.

Pie chart showing loss distribution at current operating point.

Controls: V (415V 3-phase), R1, X1, R2, X2, Xm (all in ohms), slip (0.01-1.0 slider or linked to load)

Live readouts: I1, I2, Im (A), input power, Pcu1, Pcu2, Piron, Pmech, Poutput, efficiency, power factor, torque

Theory tab:
- Why the equivalent circuit works (transformer analogy — stator is primary, rotor is secondary)
- Referred quantities: actual rotor values vs referred-to-stator values
- The R2(1-s)/s split: R2/s = R2 + R2(1-s)/s → rotor copper loss + mechanical power
- How to determine parameters from no-load and blocked-rotor tests (procedure with Indian standard test voltages)
- Approximate equivalent circuit (shifting Xm branch to supply terminals)
- Real-world context: typical parameter values for Indian standard motors (1.1 kW to 200 kW range from BHEL/Crompton/ABB India catalogs), BEE star-labeled motor efficiency comparison
- IS 325 motor frame sizes and ratings

#7: Torque-Slip Characteristics

File: sims/electric-machines/torque-slip-characteristics.jsx

Simulate: Complete torque-slip curve from s = -1 (generator) through s = 0 (synchronous) to s = +2 (braking), with three distinct regions color-coded:

- Motoring region (0 < s < 1): normal operation, operating point dot
- Generating region (s < 0): rotor faster than synchronous speed
- Braking/plugging region (s > 1): reverse rotation

Key points marked on curve:
- Starting torque (s = 1)
- Maximum torque Tmax with slip at max torque (sm)
- Full-load operating point
- Breakdown point (pullout torque)

User adjusts rotor resistance — the peak slides along constant Tmax line (Tmax independent of R2, but sm shifts). Shows why wound-rotor motors add external resistance for starting.

Controls: supply voltage, rotor resistance (R2), stator parameters, load torque line (adjustable slope for different load types)

Live readouts: operating slip, speed, torque, current, stability indicator (stable/unstable region)

Load type selector: constant torque, fan/pump (T ∝ N^2), constant power — shows intersection with motor curve

Theory tab:
- Torque equation derivation from equivalent circuit: T = (3V^2 R2/s) / (2piNs[(R1+R2/s)^2 + (X1+X2)^2])
- Condition for maximum torque: sm = R2 / sqrt(R1^2 + (X1+X2)^2)
- Maximum torque formula: Tmax = 3V^2 / (4piNs[R1 + sqrt(R1^2 + (X1+X2)^2)])
- Tmax is independent of R2 — key insight for rotor resistance starting
- Stability: left side of peak is stable (dT/ds > 0), right side unstable
- Real-world context: why standard squirrel-cage motors have low starting torque (deep bar and double cage designs improve this), NEMA Design A/B/C/D equivalents in Indian practice
- BEE motor efficiency testing — how torque-slip measurement determines motor class

#8: Induction Motor Speed Control

File: sims/electric-machines/induction-motor-speed-control.jsx

Simulate: Family of torque-speed curves for different control methods, with animated operating point:

1. V/f Control (most common): frequency varies 0-50 Hz, voltage proportionally adjusted. Family of parallel T-N curves. Below 50 Hz: constant torque region. Above 50 Hz: field weakening (constant power). The V/f ratio shown as a bar gauge.

2. Rotor Resistance Control (wound rotor): external resistance steps shift sm but not Tmax. Starting torque improves but efficiency drops (resistor losses shown as heat animation).

3. Pole Changing: discrete speed steps (3000/1500 rpm for 2/4 pole). Torque-speed curve jumps between discrete positions.

4. Cascade Control: two motors on same shaft, combined slip gives lower speeds.

Comparative efficiency chart: V/f >> rotor resistance for variable speed applications

Controls: method selector, control parameter (freq/V for V/f, R_ext for resistance, pole pair for pole changing), load torque

Live readouts: speed, torque, efficiency, losses, operating region

Theory tab:
- Ns = 120f/P → three parameters to control speed: f, P, and slip (via V or R2)
- V/f control: why ratio must be maintained (constant flux), what happens if V/f drops (saturation) or rises (weak flux)
- Space Vector PWM concepts (modern drives)
- Comparison table: method vs efficiency vs smoothness vs cost vs complexity
- Real-world context: VFDs (Variable Frequency Drives) dominate Indian industry — ABB ACS880, Siemens G120, Danfoss FC302. BEE mandates VFDs for pumps/fans above 15 kW. Energy savings in pumping applications (affinity laws: P ∝ N^3 — 20% speed reduction = 50% power saving)
- Case study: VFD retrofit in Indian municipal water pumping — typical 30-40% energy savings

#9: Induction Motor Starting Methods

File: sims/electric-machines/induction-motor-starting.jsx

Simulate: Side-by-side comparison of starting methods with animated waveforms:

1. DOL (Direct On Line): full voltage applied — starting current spike (6-8x rated) shown as current waveform, starting torque (Tst). Voltage dip on supply bus visualized. Simple contactor circuit diagram.

2. Star-Delta: starts in star (V/sqrt(3) per phase), switches to delta at ~80% speed. Current = 1/3 of DOL, torque = 1/3 of DOL. Transition dip shown (momentary disconnection). Circuit diagram with timer relay.

3. Auto-transformer: reduced voltage taps (60%, 70%, 80%). Current = x^2 times DOL current (x = tap ratio). Torque = x^2 times DOL torque. Smoother than star-delta.

4. Soft Starter: thyristor-controlled voltage ramp from 30% to 100%. Smooth current and torque rise. Current waveform shows controlled ramp. No transient dip.

5. VFD Starting: V/f ramp from 0 to rated. Near-zero starting current surge, full torque available. Best but most expensive.

Bar chart comparison: starting current (pu), starting torque (pu), cost (relative), complexity

Controls: method selector, motor rating (kW), load inertia (affects acceleration time), supply capacity (shows % voltage dip)

Live readouts: starting current (A and x rated), starting torque (Nm and x rated), acceleration time (s), supply voltage dip %

Theory tab:
- Why starting current is high: at s=1, rotor impedance is low (R2/s = R2, very small)
- DOL: simplest, allowed only for small motors (< 5 HP in India typically, depends on transformer capacity)
- Star-Delta: most common in India for 5-50 HP, but torque drops to 1/3 — not suitable for loaded starts
- Auto-transformer: better for high-inertia loads (crushers, ball mills)
- Soft starter: modern choice for pumps, compressors, conveyors (L&T, ABB, Schneider ranges)
- VFD: if variable speed is also needed, VFD replaces both starter and speed controller
- Real-world context: IS 8225 (starting requirements for induction motors), DISCOM regulations on starting current limits for HT motors (typically < 2x FLA for HT, < 6x for LT), Indian industrial practice — most factories use star-delta for LT and auto-transformer/reactor for HT
- Cost comparison for a typical 50 HP motor in Indian market (DOL: Rs 5K, S-D: Rs 15K, Soft Starter: Rs 50K, VFD: Rs 1.5L)


Simulations #10-13 — Synchronous Machines

#10: Synchronous Machine Phasor Diagram

File: sims/electric-machines/synchronous-phasor-diagram.jsx

Simulate: Animated phasor diagram with vectors rotating and scaling live:

Phasors shown: V (terminal voltage, reference), Ia (armature current), Ef (excitation EMF/back-EMF), jXs.Ia (synchronous reactance drop), Ia.Ra (armature resistance drop)

Phasor relationship: Ef = V + Ia.Ra + jXs.Ia (generator) or V = Ef + Ia.Ra + jXs.Ia (motor)

Three operating modes visualized:
- Lagging PF (under-excited motor / over-excited generator): Ia lags V, Ef inside V
- Unity PF: Ia in phase with V
- Leading PF (over-excited motor / under-excited generator): Ia leads V, Ef beyond V

As user adjusts excitation, the phasor diagram morphs smoothly between conditions. Power angle (delta between V and Ef) shown.

Controls: operating mode (motor/generator), load (P in kW), power factor (lag/unity/lead), excitation voltage (Ef), Xs, Ra

Live readouts: Ia (A), power angle (deg), PF, P (kW), Q (kVAr), complex power S

Theory tab:
- Phasor equation derivation from equivalent circuit
- Why synchronous machines can operate at any power factor (unlike induction motors which always lag)
- Generator vs motor convention (Ef leads V in generator, V leads Ef in motor)
- Significance of power angle delta — stability limit at 90 deg
- Salient pole vs cylindrical rotor (Xd ≠ Xq for salient pole — two-reaction theory intro)
- Real-world context: large alternators at NTPC Simhadri (2x500 MW, 21 kV, 0.85 PF lag), synchronous condensers for reactive power support (being revived in India for grid stability with high RE)
- Excitation systems: static thyristor excitation (modern BHEL units)

#11: V-Curves and Inverted V-Curves

File: sims/electric-machines/v-curves-inverted-v.jsx

Simulate: Two linked plots:

1. V-Curves (Ia vs If): Family of U-shaped curves at different power levels (P = 0, 25%, 50%, 75%, 100%). Minimum point of each curve = unity PF. Left side = leading PF (over-excited), right side = lagging PF (under-excited for motor). Operating point dot moves as user adjusts field current.

2. Inverted V-Curves (PF vs If): Same field current axis. PF peaks at 1.0, drops on both sides. The two plots share the same x-axis (If) and are stacked vertically for correlation.

Stability boundary marked: for each power level, there's a minimum excitation below which the machine pulls out of synchronism. Shown as dashed boundary curve.

The lagging/leading PF regions are shaded differently, with reactive power (Q) sign indicated.

Controls: active power level (P in pu: 0 to 1.0), field current (If), Xs, V

Live readouts: Ia (A), PF (lag/lead), Q (kVAr — absorbing/supplying), excitation voltage Ef, power angle

Theory tab:
- Why the V-shape: at constant P, reducing/increasing excitation changes the reactive component of Ia
- At minimum Ia, Q = 0 (unity PF) — most efficient operation
- Over-excited motor supplies reactive power (acts like capacitor) — synchronous condenser application
- Under-excited motor absorbs reactive power (like induction motor)
- Stability limit: minimum excitation for a given load — below this, delta > 90 deg and machine loses synchronism
- Real-world context: synchronous motors used in Indian cement plants (raw mills, 2000-5000 HP) deliberately run over-excited for PF correction — dual benefit of useful work + reactive power supply
- Economics: synchronous motor at 0.9 leading PF vs induction motor + capacitor bank — cost-benefit in Indian tariff structure (PF penalty/incentive)

#12: Power-Angle Curve

File: sims/electric-machines/power-angle-curve.jsx

Simulate: P vs delta (power angle) sinusoidal curve:
- P = (V.Ef / Xs) sin(delta) plotted
- Operating point moves along the curve as mechanical input/load changes
- Maximum power point at delta = 90 deg marked prominently
- If load exceeds Pmax, operating point goes past 90 deg — loss of synchronism animated (rotor angle accelerating away, pole slipping)

Damped oscillation demo: sudden load change causes rotor angle to oscillate and settle (if stable) or diverge (if past critical). Spring-mass analogy animation shown alongside.

Generator and motor modes shown on same curve (generator: delta > 0, motor: delta < 0)

Controls: Ef (excitation voltage), V (terminal voltage), Xs (synchronous reactance), mechanical input power (Pm)

Live readouts: electrical power output, power angle, stability margin (% below Pmax), accelerating/decelerating torque

Transient demo: step change in mechanical power — animated oscillation of delta with damping

Theory tab:
- Power transfer equation: P = (V.Ef / Xs) sin(delta)
- Maximum power = V.Ef / Xs — how to increase it (increase Ef, decrease Xs)
- Synchronizing power coefficient: dP/d(delta) = (V.Ef / Xs) cos(delta) — positive means stable
- Equal area criterion preview (leads into stability simulations)
- Salient pole machine: P = (V.Ef/Xd)sin(delta) + V^2(Xd-Xq)sin(2delta)/(2XdXq) — reluctance torque component
- Real-world context: why NTPC generators operate at delta = 20-30 deg typically (stability margin), governor droop and delta relationship
- Transient stability — what happens during grid faults (delta swings)

#13: Alternator Synchronization

File: sims/electric-machines/alternator-synchronization.jsx

Simulate: Split-screen showing incoming alternator and grid bus:

Three conditions that must be matched, each with visual indicator (red/yellow/green):
1. Voltage magnitude: bar gauges comparing incoming vs bus voltage. Adjust excitation to match.
2. Frequency: frequency meters side by side. Adjust governor/prime mover speed.
3. Phase angle: synchroscope dial animation — pointer rotating (too fast/slow if freq mismatch), must close breaker when pointer is at 12 o'clock (zero phase difference)

Alternative method: dark lamp / bright lamp method animated — three lamps showing flickering pattern, all dark simultaneously at correct synchronizing instant

When all three conditions are met and breaker is closed:
- Smooth synchronization: no current surge
- If conditions not met: large circulating current spike shown (dangerous), with magnitude calculation

Post-synchronization: load sharing animation — governor droop curves for two machines, showing how increasing steam input on incoming machine picks up load from the other

Controls: incoming machine speed (rpm), excitation voltage, breaker close button, lamp method selector

Live readouts: frequency difference, voltage difference, phase angle, circulating current if synchronized out-of-phase

Theory tab:
- Why all three conditions matter (voltage diff → reactive circulating current, freq diff → power oscillations, phase diff → massive current surge)
- Synchroscope working principle — it measures the phase angle difference
- Lamp methods: dark lamp (all lamps across same phases), bright lamp (two lamps cross-connected), bright-dark combination
- Circulating current calculation: Ic = (V1 - V2) / (Xs1 + Xs2)
- Modern practice: automatic synchronizers (ABB Synchrotact, GE F650), synchrocheck relays
- Real-world context: synchronization procedure at Indian power plants (NTPC SOP), frequency tolerance per IEGC (49.9-50.05 Hz normal band), what happens during grid disturbances when generators trip and need resynchronization
- Indian Grid Code requirements for synchronization (CERC regulations)


Simulations #14-17 — Transformers

#14: Transformer Working Principle

File: sims/electric-machines/transformer-working-principle.jsx

Simulate: Animated transformer with visible core, primary winding, and secondary winding:

- Alternating flux in the core shown as animated field lines pulsating
- Primary current flow arrows (sinusoidal)
- Flux linking both windings — induced EMF in secondary
- Turns ratio visualization: draggable slider changes N1/N2, secondary voltage changes proportionally

Step-up / step-down mode toggle. Primary and secondary voltage/current waveforms plotted in sync.

Ideal transformer demonstration first (no losses), then toggle to real transformer with:
- Core losses: hysteresis (B-H loop animation) and eddy currents (circulating current animation in core laminations)
- Copper losses: I^2R heating in windings
- Leakage flux: some flux lines not linking secondary

Controls: primary voltage (V1), turns ratio (N1:N2), frequency, load impedance, ideal/real toggle

Live readouts: V1, V2, I1, I2, turns ratio a, apparent power (VA), regulation

Theory tab:
- Faraday's law: EMF = -N dPhi/dt → E = 4.44fNPhi_m
- Turns ratio: V1/V2 = N1/N2 = I2/I1 (ideal)
- Why mutual flux is key — all primary flux must link secondary for perfect transformation
- Core construction: why laminated (reduces eddy currents), CRGO steel (Cold Rolled Grain Oriented — lower hysteresis loss)
- Why transformers only work on AC (constant DC flux → no dPhi/dt → no EMF)
- Real-world context: Indian transformer manufacturing — BHEL Bhopal (up to 500 MVA), CGL, Voltamp, Transformers & Rectifiers India. Standard ratings: 25 kVA, 63 kVA, 100 kVA, 250 kVA (distribution), 20/40/100/250/500 MVA (power transformers)
- IS 2026 (power transformer specification), IS 1180 (distribution transformer)

#15: Transformer Equivalent Circuit

File: sims/electric-machines/transformer-equivalent-circuit.jsx

Simulate: Interactive equivalent circuit with live current flow arrows:

Full equivalent circuit showing:
- R1, X1 (primary winding resistance and leakage reactance)
- Rc, Xm (core loss resistance and magnetizing reactance — shunt branch)
- R2', X2' (secondary values referred to primary)
- Load impedance ZL (or ZL referred)

Toggle: refer to primary side / refer to secondary side — all values transform accordingly

Current animation: I1 splits into I0 (no-load component through Rc||Xm) and I2' (load component through series impedance). Arrow widths proportional to magnitude.

OC Test simulation: apply rated voltage to one winding, other open — measures core parameters (Rc, Xm). Wattmeter, ammeter, voltmeter readings shown.

SC Test simulation: apply reduced voltage to one winding, other shorted — measures winding parameters (R_eq, X_eq). Instruments shown with readings.

Controls: V1, R1, X1, R2, X2, Rc, Xm, load impedance (magnitude + PF), referred side toggle, test mode (normal/OC/SC)

Live readouts: all currents, voltages, power components, phasor diagram of V1, I1, V2, I2

Theory tab:
- Development from ideal to real: adding R1, X1, Rc, Xm, R2, X2 step by step
- Referring quantities to one side: multiply impedance by a^2, current by 1/a, voltage by a
- Approximate equivalent circuit: move shunt branch to primary terminals (acceptable for large transformers)
- OC test theory: at no load, I2 ≈ 0, so wattmeter reads core loss, Rc = V^2/P0, Xm from I0 and Ic
- SC test theory: at rated current with shorted secondary, low voltage means core loss negligible, wattmeter reads copper loss
- Real-world context: testing at Indian transformer factories — BIS testing requirements, routine vs type tests
- How to use equivalent circuit for regulation and efficiency calculation (leads to next simulation)

#16: Transformer Regulation and Efficiency

File: sims/electric-machines/transformer-regulation-efficiency.jsx

Simulate: Two main plots updating live:

1. Voltage Regulation vs Load:
- % VR = (Vnl - Vfl)/Vfl × 100 plotted from 0 to 150% load
- Separate curves for different power factors (0.8 lag, 1.0, 0.8 lead)
- At leading PF: negative regulation (V2 rises with load) — highlighted as important

2. Efficiency vs Load:
- Efficiency curve from 0 to 150% load — rises, peaks, then drops slightly
- Maximum efficiency point marked: occurs when copper loss = iron loss
- Separate curves for different PFs (lower PF → lower efficiency at same load)
- All-day efficiency calculation: for a distribution transformer with a typical daily load cycle

Animated power flow diagram: Pin → iron loss + copper loss → Pout, with proportions changing as load varies

Controls: transformer rating (kVA), iron loss (W), full-load copper loss (W), load fraction (0-1.5), power factor, load profile (for all-day efficiency — 24 hour cycle editor)

Live readouts: Vregulation %, efficiency %, copper loss, iron loss, output power, load fraction at max efficiency

Theory tab:
- Regulation formula: %VR = (I.Req.cos(phi) ± I.Xeq.sin(phi))/V2 × 100 (+ for lag, - for lead)
- Why regulation is negative at leading PF (capacitive load)
- Efficiency: eta = output / (output + iron loss + copper loss) = x.S.cos(phi) / (x.S.cos(phi) + Pi + x^2.Pcu)
- Maximum efficiency condition: x = sqrt(Pi/Pcu) — iron loss equals copper loss
- All-day efficiency: energy output / energy input over 24 hours — important for distribution transformers that are always energized but lightly loaded most of the time
- Real-world context: Indian distribution transformers (100 kVA, 11kV/415V) — typical iron loss 260W, copper loss 1500W — max efficiency at 42% load, all-day efficiency ~97% for typical rural load pattern
- BEE star rating for transformers: 1-star to 5-star based on total losses at 50% and 100% load (IS 1180 Part 1)
- Loss capitalization in transformer procurement: DISCOM evaluation formula (A × no-load loss + B × load loss)

#17: Three-Phase Transformer Connections

File: sims/electric-machines/three-phase-transformer-connections.jsx

Simulate: Animated 3-phase transformer showing:

Four connection types with toggle:
1. Star-Star (Yy): same phase, third harmonic issue
2. Delta-Star (Dy): 30 deg phase shift, most common for step-down
3. Star-Delta (Yd): 30 deg phase shift, step-up applications
4. Delta-Delta (Dd): no phase shift, used when 3rd harmonic is concern

For each connection:
- Winding diagram showing primary and secondary coil connections (animated current paths)
- Phasor diagrams: primary line voltages, secondary line voltages with phase shift clearly shown
- Voltage relationships: Vline vs Vphase for each side
- Current relationships: Iline vs Iphase for each side
- Clock notation (vector group): Dy11, Yd1, Yy0, Dd0 etc. — clock face animation showing the hour hand

Parallel operation check: two transformers — will they parallel safely? Must have same vector group (phase shift). Mismatched vector groups show the resulting circulating current.

Controls: connection type, primary voltage, turns ratio, load, vector group selector

Live readouts: primary/secondary line and phase voltages, currents, phase shift (degrees), vector group designation

Theory tab:
- Why 3-phase transformers (size, cost, efficiency advantages over three single-phase units)
- Phase shift in Dy and Yd connections: phasor derivation showing 30 deg shift
- Third harmonic: in Yy connection, no path for 3rd harmonic current → distorted flux → distorted voltage (unless delta tertiary winding provided)
- Vector groups and clock notation: international standard (IEC 60076-1)
- Conditions for parallel operation: same voltage ratio, same vector group, same impedance (%), same polarity
- Real-world context: Indian practice — 
  * Generator transformers: Yd1 (21kV delta to 400kV star, 30 deg shift)
  * Grid transformers: YNyn0 or YNd11 (400/220 kV, 220/132 kV)
  * Distribution transformers: Dyn11 (11kV/433V, most common in India)
  * Why Dyn11 is standard for distribution in India: provides 4-wire secondary (3-phase + neutral), handles unbalanced loads, no third harmonic issue on HV side
- IS 2026 vector group requirements


Build Order

Build the flagship first — it establishes the visual language, tabbed pattern, and machine comparison framework that all others reference.

Phase 1 — DC Machines (5 sims)
1. machine-explorer.jsx — flagship comparison of all machine types (sets the template)
2. dc-motor-fundamentals.jsx — foundational, introduces commutator and EMF concepts
3. dc-motor-characteristics.jsx — builds on fundamentals, adds speed-torque curves
4. dc-motor-speed-control.jsx — practical application of characteristics
5. dc-generator-characteristics.jsx — completes DC machines

Phase 2 — Induction Machines (5 sims)
6. rotating-magnetic-field.jsx — foundational concept for all AC machines
7. induction-motor-equivalent-circuit.jsx — builds on rotating field
8. torque-slip-characteristics.jsx — builds on equivalent circuit
9. induction-motor-speed-control.jsx — uses torque-slip understanding
10. induction-motor-starting.jsx — practical application

Phase 3 — Synchronous Machines (4 sims)
11. synchronous-phasor-diagram.jsx — foundational for synchronous analysis
12. v-curves-inverted-v.jsx — builds on phasor diagram
13. power-angle-curve.jsx — builds on phasor understanding
14. alternator-synchronization.jsx — practical operation

Phase 4 — Transformers (4 sims)
15. transformer-working-principle.jsx — foundational
16. transformer-equivalent-circuit.jsx — builds on principle
17. transformer-regulation-efficiency.jsx — builds on equivalent circuit
18. three-phase-transformer-connections.jsx — practical 3-phase systems

Total: 18 simulations in sims/electric-machines/
