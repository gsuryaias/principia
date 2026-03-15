Power System Stability & Control Simulations — Build Plan

Two Architecture Changes (apply to ALL simulations going forward)

1. Tabbed Interface Inside Every Simulation

Every simulation will have a top-level tab bar with two tabs:

[ Simulate ]  [ Theory ]

Simulate tab: The interactive visualization + controls

Theory tab: Scrollable content with concept explanation, key equations (rendered with styled spans, not LaTeX), annotated SVG diagrams, real-world context boxes

The tab bar will be a reusable pattern baked into each JSX file (self-contained, no shared components). Styled as pill tabs at the top of the simulation container.

2. Real-World Indian Power System Context

All simulations use real system parameters, events, and regulatory context from the Indian grid:

- Indian grid frequency: nominal 50 Hz, IEGC band 49.90-50.05 Hz (normal), CERC deviation settlement mechanism
- Generator inertia constants: NTPC coal-fired units H = 3-5 s, gas turbines H = 2-3 s, hydro H = 2-4 s
- Governor droop: 3-6% as per IEGC specifications
- Real blackout case studies: July 30-31, 2012 Northern/Eastern/NE grid collapse (largest blackout in history — 620 million people affected)
- POSOCO (now Grid-India) real-time operations data
- FACTS devices installed in Indian grid: SVC at Kanpur, STATCOM at Kothagudem (AP), TCSC on Raipur-Rourkela line
- RE integration challenges: frequency stability with high solar/wind penetration in Tamil Nadu, Rajasthan, AP/Telangana
- Automatic Generation Control (AGC) implementation in India (started 2019-20)


Simulation #0 — Flagship: Grid Stability Control Room

File: sims/stability-control/stability-control-room.jsx

This is the centerpiece — an interactive control room simulator showing how a power grid responds to disturbances and how control systems maintain stability.

Simulate tab:

A simplified 3-generator power system (Generator A: large thermal, Generator B: hydro, Generator C: wind farm) connected through a transmission network to loads:

Real-time displays (mimicking a grid control center):
- Frequency meter: analog needle-style gauge centered at 50.00 Hz, with IEGC bands marked (49.90-50.05 normal green, 49.85-49.90 and 50.05-50.10 yellow warning, below 49.85 or above 50.10 red critical)
- Generator displays: P output (MW bar), Q output (MVAr bar), speed (rpm), voltage (kV), power angle (degrees)
- Tie-line power flow: animated arrows between areas with MW/MVAr values
- Bus voltages: bar indicators for each bus (green 0.95-1.05 pu, yellow warning, red critical)

Disturbance scenarios (user-triggered):
1. Load increase (50 MW sudden): frequency dips → governors respond (droop action) → AGC restores frequency
2. Generator trip (Gen B trips): frequency drops sharply → other generators pick up load → possible load shedding if insufficient reserve
3. Transmission line trip: power reroutes → possible overloading on remaining lines → distance relay risk
4. Wind ramp-down (Gen C output drops 80% in 10 minutes): slow frequency decline → thermal units ramp up → ramp rate limitation visible
5. Three-phase fault + successful clearance: transient stability event — rotor angle swings and settles

For each scenario: time-domain plots of frequency, generator power angles, bus voltages, tie-line flows update in real time (simulated seconds).

Controls: disturbance type and magnitude, governor droop settings, AGC gain, load shedding thresholds, generator inertia constants, spinning reserve amount

Live readouts: system frequency, rate of change of frequency (ROCOF), ACE (Area Control Error), generator power angles, stability status (stable/unstable)

Theory tab:

- Power system stability classification (IEEE/CIGRE):
  * Rotor angle stability (transient and small-signal)
  * Frequency stability (short-term and long-term)
  * Voltage stability (large and small disturbance)
- Frequency-power balance: generation = load + losses at all times. Any mismatch → frequency deviates.
- Control hierarchy: primary (governor, 1-30s), secondary (AGC, 30s-10min), tertiary (economic dispatch, 10min-1hr)
- Why stability matters: loss of stability → cascading failure → blackout
- 2012 Indian blackout analysis: sequence of events, how distance relay Zone 3 operation on Bina-Gwalior line initiated cascading failure, 48,000 MW of load lost, lessons learned
- IEGC frequency management provisions: UI mechanism, deviation settlement, frequency response, ROCOF-based load shedding
- Grid-India (formerly POSOCO) role: national and regional load dispatch centers


Simulations #1-3 — Rotor Angle Stability

#1: Swing Equation

File: sims/stability-control/swing-equation.jsx

Simulate: A synchronous generator rotor angle (delta) response to disturbances:

Animated rotor: a circular rotor icon spinning at synchronous speed. When disturbed, the rotor accelerates or decelerates relative to the synchronous reference frame — the angle delta changes.

Time-domain plots (stacked):
1. Mechanical input power (Pm) vs electrical output power (Pe) — step change in Pm or Pe triggers oscillation
2. Accelerating power: Pa = Pm - Pe (positive → accelerates, negative → decelerates)
3. Rotor angle delta(t) — shows oscillations: damped (stable), sustained (marginally stable), or diverging (unstable)
4. Rotor speed deviation: d(delta)/dt — proportional to frequency deviation

Damping effect demonstration:
- Without damping (D=0): rotor oscillates forever at natural frequency omega_n = sqrt(Ps/2H × omega_s)
- With damping (D>0): oscillations decay exponentially — system settles to new steady state
- Over-damped: no oscillations, slow return
- Under-damped: oscillations with decreasing amplitude (most common in practice)

Natural frequency slider: as H increases, natural frequency decreases (heavier rotor oscillates more slowly). As synchronizing power Ps increases, frequency increases (stiffer system).

Phase portrait: delta vs d(delta)/dt plotted in state space — shows circular (undamped) or spiral (damped) trajectories converging to equilibrium or diverging

Controls: inertia constant H (2-10 s), damping coefficient D, mechanical power Pm, initial power angle delta_0, disturbance magnitude (step change in Pm or Pe)

Live readouts: rotor angle (degrees), speed deviation (pu), accelerating power (pu), natural oscillation frequency (Hz), damping ratio, settling time

Theory tab:
- Swing equation derivation: J(d^2theta_m/dt^2) = T_m - T_e (Newton's second law for rotation)
- Normalization: M(d^2delta/dt^2) = Pm - Pe, where M = 2H/omega_s (inertia constant in machine seconds)
- Adding damping: M(d^2delta/dt^2) + D(d(delta)/dt) = Pm - Pe
- Linearization: for small deviations around operating point, Pe ≈ Pe0 + Ps × delta_deviation → second-order linear ODE
- Natural frequency: omega_n = sqrt(Ps × omega_s / 2H) — typically 0.5-2 Hz for large generators
- Damping ratio: zeta = D / (2 × sqrt(2H × Ps / omega_s))
- Modes of oscillation: local mode (1-3 Hz, one generator against system), inter-area mode (0.1-0.7 Hz, one region against another — most dangerous)
- Real-world context:
  * NTPC 500 MW generator: H ≈ 3.5 s, Xd = 1.8 pu, Xd' = 0.3 pu — natural oscillation frequency ≈ 1.2 Hz
  * Inter-area oscillations in Indian grid: Southern region oscillates against Northern region at ~0.3 Hz (observed by synchrophasor measurements from Indian PMU network — 1800+ PMUs installed by Grid-India)
  * Low-frequency oscillation damping: Power System Stabilizers (PSS) installed on all NTPC generators per IEGC mandate
  * 2012 blackout: undamped oscillations preceded the cascading failure

#2: Equal Area Criterion

File: sims/stability-control/equal-area-criterion.jsx

Simulate: The classic P-delta diagram with shaded areas for energy balance:

P-delta curve (P = Pmax × sin(delta)) showing:
- Pre-fault operating point (delta_0): Pm = Pe at steady state
- Fault occurs: Pe drops (to fault curve, which is lower or zero for close-in fault)
- Accelerating area A1 shades red: rotor accelerates because Pm > Pe_fault
- Fault cleared at clearing angle delta_cl: Pe jumps back to post-fault curve
- Decelerating area A2 shades green: rotor decelerates because Pe_postfault > Pm
- If A2 ≥ A1: stable (rotor angle reaches maximum delta_max and swings back)
- If A2 < A1: unstable (rotor angle exceeds delta_limit, pole slips — loss of synchronism)

Critical clearing angle (delta_cr): the maximum angle at which the fault must be cleared to maintain stability. Found when A2 just equals A1 (maximum available decelerating area used up).

Animated scenario:
1. System in steady state
2. Fault applied — operating point drops to fault curve, delta starts increasing
3. Clearing time slider: user adjusts clearing time:
   * Early clearing (well before delta_cr): large stability margin, rotor swings and returns — green checkmark
   * Clearing at delta_cr: barely stable, rotor swings to delta_limit exactly — yellow warning
   * Late clearing (past delta_cr): unstable, rotor accelerates past recovery — red cross, pole slipping animation

Three P-delta curves superimposed: pre-fault, during-fault, post-fault — transition between them shown at fault inception and fault clearing instants

Controls: pre-fault Pmax, fault type (3-phase at generator terminal, 3-phase at mid-line, SLG), mechanical power Pm, fault clearing time (cycles), post-fault Pmax (reduced if one line tripped)

Live readouts: accelerating area A1, decelerating area A2, stability margin (A2 - A1), critical clearing angle (degrees), critical clearing time (ms/cycles), maximum rotor angle, stable/unstable verdict

Theory tab:
- Equal Area Criterion: energy balance approach — kinetic energy gained during acceleration (A1) must be absorbable during deceleration (A2)
- Derivation: integrate swing equation: integral(Pm - Pe)d(delta) = change in kinetic energy. For stability: integral from delta_0 to delta_cl of (Pm - Pe_fault) = integral from delta_cl to delta_max of (Pe_postfault - Pm)
- Critical clearing angle formula: cos(delta_cr) = [(Pm/Pmax2)(delta_limit - delta_0) + (Pmax3/Pmax2)cos(delta_limit) - cos(delta_0)] / [(Pmax3/Pmax2) - 1] (for general case)
- Simple case (3-phase fault, Pe_fault = 0): cos(delta_cr) = cos(delta_0) + (Pm/Pmax)(pi - 2×delta_0)
- Factors that improve transient stability: fast fault clearing (modern breakers: 2-3 cycles), higher generator inertia H, lower pre-fault loading (larger delta_0 → less margin), stronger post-fault system (higher Pmax_postfault)
- Why EAC is useful: gives quick visual/analytical assessment of stability without solving differential equations numerically
- Real-world context:
  * Indian grid protection clearing times: 400 kV zone 1 → 80-100 ms (including breaker), 220 kV → 100-120 ms, 132 kV → 150-200 ms
  * PGCIL 400 kV breaker spec: interrupting time ≤ 40 ms (2 cycles) → total clearing time with relay ≈ 60-80 ms → critical for transient stability of nearby large generators
  * NTPC generators: critical clearing time typically 150-250 ms depending on loading and system strength
  * AP Transco system studies verify transient stability for all credible contingencies (N-1 and N-2) per IEGC requirements
  * How renewable energy (low inertia) reduces critical clearing time — system becomes less tolerant of slow protection

#3: Power-Angle Stability Assessment

File: sims/stability-control/power-angle-stability.jsx

Simulate: Complete transient stability assessment for a multi-machine system:

Three P-delta curves (pre-fault, during-fault, post-fault) with the actual transient simulation superimposed:

System: SMIB (Single Machine Infinite Bus) model with:
- Generator: Xd, Xd', Xd'', H — all adjustable
- Transformer: Xt
- Two parallel transmission lines — one can be faulted and tripped
- Infinite bus: fixed voltage and frequency

Fault scenarios with step-through animation:
1. Pre-fault: generator operating at delta_0, both lines in service. Pmax = E'V / (Xd' + Xt + Xline/2)
2. During fault: 3-phase fault at sending end of one line. Transfer impedance increases → Pmax_fault drops → P-delta curve compresses
3. Post-fault: faulted line tripped. One line remains. Pmax_postfault = E'V / (Xd' + Xt + Xline) — less than pre-fault but more than during-fault

Time-domain simulation: rotor angle delta(t) plotted as the swing equation is solved numerically (Runge-Kutta) step by step. The solution traces the path on the P-delta diagram simultaneously.

Multi-swing stability: after first swing, the generator may be stable but subsequent swings may grow if damping is negative — shown over 5-10 seconds of simulation

Phase portrait (delta vs omega) shows the trajectory approaching or departing from the equilibrium

Controls: E' (generator internal voltage), V (infinite bus voltage), Xd', Xt, Xline, H, Pm, fault location (sending/receiving/mid-line), fault clearing time, number of parallel lines, damping coefficient

Live readouts: pre-fault/during-fault/post-fault Pmax values, critical clearing time, maximum swing angle, stability verdict, number of swings before settling

Theory tab:
- Transient stability: ability of synchronous machines to maintain synchronism after a large disturbance (fault, line trip, generator trip, large load change)
- Classical machine model: E' behind Xd' (constant during transient period) — simplification that works for first-swing stability
- Multi-machine stability: each generator has its own swing equation. Relative angles between generators determine stability. In practice, solved by numerical simulation (Euler, Runge-Kutta, trapezoidal integration).
- Factors affecting transient stability:
  * Generator inertia H: higher → more time to clear fault (slower acceleration)
  * Fault clearing time: most important controllable factor
  * Generator loading: heavier loaded → delta_0 is larger → closer to stability limit
  * Post-fault system strength: if parallel line is tripped, remaining system is weaker → Pmax_postfault is lower → less deceleration available
  * Excitation response: fast exciter increases E' during fault → increases Pmax_postfault → improves stability
- Real-world context:
  * Grid-India performs transient stability studies for all planned outages and grid augmentation projects using PSS/E
  * Critical faults: 3-phase fault near large generators (NTPC Korba, Singrauli, Talcher) — clearing time must be within critical limit
  * AP Transco: transient stability verified for 400 kV Kurnool and Nellore interconnection configurations
  * System protection schemes (SPS): automated generation tripping if stability is threatened (implemented at several PGCIL substations)
  * With increasing RE (low inertia): rate of change of frequency during faults is faster → less time for protection to operate → stability margins shrinking


Simulations #4-6 — Frequency & Voltage Control

#4: Automatic Generation Control (AGC)

File: sims/stability-control/automatic-generation-control.jsx

Simulate: Two-area power system with tie-line:

Area 1: large thermal generation (NTPC-equivalent) + load
Area 2: hydro + wind generation + load

Real-time animation showing:
- Area 1 and Area 2 with generator icons, load icons, and tie-line connecting them
- Frequency meters for each area (in actual interconnected system, frequency is nearly same everywhere but deviations shown magnified for visualization)
- Tie-line power flow (MW) and direction
- ACE (Area Control Error) bar gauge for each area

Load change scenario: sudden load increase in Area 1:
1. Frequency drops in both areas (interconnected system shares the burden)
2. Primary response (0-30s): governors on all generators increase output proportional to frequency deviation. Speed droop characteristic determines share. Frequency partially recovered but not to 50 Hz.
3. Secondary response (30s-10min): AGC measures ACE = Bias × delta_f + delta_P_tie. Adjusts generator setpoints to:
   * Restore frequency to 50 Hz
   * Restore tie-line flow to scheduled value
   * Each area handles its own load change (not burden on neighbors)
4. Tertiary (>10min): economic dispatch re-optimizes generation scheduling

ACE equation visualized: ACE = B × delta_f + (P_tie_actual - P_tie_scheduled)
- B = frequency bias (MW/Hz) — area's obligation to respond
- delta_f = frequency deviation
- delta_P_tie = tie-line flow error

Governor droop curves for each generator shown: P vs f characteristic with droop slope

Controls: Area 1 and 2 generation capacity, load change (MW, which area), droop (% for each generator), AGC gain, frequency bias B (MW/Hz), tie-line scheduled flow, AGC mode (flat frequency / flat tie-line / tie-line bias)

Live readouts: frequency (Hz), ACE for each area (MW), tie-line flow (MW), generation from each unit (MW), governor output change, AGC adjustment signal

Theory tab:
- Power-frequency relationship: at steady state, generation = load. Excess generation → frequency rises (generators speed up). Deficit → frequency drops.
- Governor droop: R = (delta_f / f_rated) / (delta_P / P_rated). Typical 4-5%. Droop of 4% means: for 4% frequency drop (2 Hz), generator increases output by 100% (full rated). Proportional response — does not restore frequency to 50 Hz (steady-state frequency error remains).
- AGC (secondary control): integral controller that drives ACE to zero. ACE = 0 means: frequency is restored AND tie-line flow is at schedule → each area is self-sufficient.
- Frequency bias: B = 1/R + D (generation response + load damping). Determines area's responsibility share.
- Free governor mode vs restricted governor mode: India historically used restricted governor mode (governors dead-banded ±0.03 Hz) — now transitioning to free governor (±0.05 Hz dead band, governor responsive beyond dead band) per CERC regulation.
- Real-world context:
  * India implemented AGC starting 2019-20 (very late compared to Western grids — previously relied on manual dispatch and UI mechanism)
  * Grid-India operates AGC from National Load Dispatch Center (NLDC), New Delhi
  * AGC signals sent every 4 seconds to participating generators
  * Initially thermal units only, expanding to hydro and storage
  * Frequency quality in India has dramatically improved: pre-2009 frequency used to swing 49.0-50.5 Hz daily, now maintained 49.90-50.05 Hz
  * CERC Ancillary Services regulations: reserves categorized as primary (governor), secondary (AGC), tertiary (manual)
  * The UI (Unscheduled Interchange) mechanism: financial penalty/incentive for deviating from schedule — unique to Indian grid, being phased out as AGC matures

#5: Automatic Voltage Regulator (AVR)

File: sims/stability-control/automatic-voltage-regulator.jsx

Simulate: Generator terminal voltage control loop shown as animated block diagram:

Block diagram elements:
- Reference voltage (Vref): setpoint, adjustable
- Comparator: error = Vref - Vt (terminal voltage)
- Amplifier: gain KA, time constant TA
- Exciter: gain KE, time constant TE (excitation system — generates field voltage Vf)
- Generator: gain KG, time constant TG (produces terminal voltage from field voltage)
- Feedback: terminal voltage measured by PT, filtered → back to comparator

All signals shown as live waveforms at each point in the block diagram.

Disturbance response:
1. Load increase: Vt drops (current increases, IXs drop increases) → error positive → AVR increases excitation → Vf increases → more flux → Vt recovers
2. Load decrease: Vt rises → AVR reduces excitation → Vt returns to setpoint
3. Reactive load change: Q demand changes → Vt swings → AVR compensates

Step response animation: a step change in load → Vt dip → AVR response → Vt recovery. Shows:
- Rise time: how fast Vt recovers
- Overshoot: how much Vt overshoots before settling
- Settling time: time to reach within ±2% of setpoint
- Steady-state error: final difference between Vref and Vt (zero if integral action present)

Effect of gain adjustment:
- Low KA: slow response, large steady-state error, stable
- Medium KA (optimal): fast response, small overshoot, good settling
- High KA: very fast but oscillatory, possible instability (sustained oscillations)

Root locus: as KA increases, poles move from stable (left half plane) toward and past imaginary axis → instability. The critical gain K_critical shown.

Controls: Vref, KA (amplifier gain), TA, KE, TE, KG, TG, load step magnitude, PSS (power system stabilizer) toggle, PSS gain and time constants

Live readouts: Vt (pu), error signal, field voltage Vf, exciter output, response time (ms), overshoot %, settling time (ms), damping ratio, stability status

Theory tab:
- Why AVR is essential: without AVR, generator terminal voltage varies with load (voltage regulation up to 30-40% for typical machines). With AVR, voltage maintained within ±0.5% under normal conditions.
- Excitation system types:
  * DC exciter (rotating, older): slow response (TE = 0.5-1.5s), used in older BHEL generators
  * AC exciter (brushless): medium response, no slip rings/brushes, used in medium generators
  * Static excitation (thyristor): fast response (TE < 0.1s), feeds field through slip rings, used in all modern large generators (NTPC fleet)
- Transfer function: Vt(s)/Vref(s) = [KA × KE × KG] / [(1+sTA)(1+sTE)(1+sTG) + KA × KE × KG]
- Stability: Routh-Hurwitz criterion or root locus to find KA_max for stability
- AVR + PSS: AVR alone tends to reduce system damping (fast excitation response can cause negative damping torque). PSS adds a supplementary signal derived from speed/power/frequency to add positive damping.
- Real-world context:
  * Every generator connected to the Indian grid must have AVR per IEGC regulation
  * NTPC standard: static excitation system with ceiling voltage = 2× rated field voltage (for forcing during faults to improve transient stability)
  * AVR response time spec per IEGC: excitation system must be capable of responding within 0.1s
  * PSS mandatory on all generators > 50 MW connected to inter-state transmission (CERC regulation)
  * AVR setpoint adjusted by Grid-India's SPC (Scheduling and Coordination) instructions to manage reactive power flow
  * Coordination: multiple generators at a power plant — voltage droop (reactive power sharing) between parallel machines

#6: Load-Frequency Control

File: sims/stability-control/load-frequency-control.jsx

Simulate: Governor droop characteristic and frequency response in detail:

Governor droop characteristic (P vs f plot):
- Straight line from rated frequency at no-load to (rated frequency - delta_f) at full load
- Droop R = delta_f / f_rated per delta_P / P_rated
- Steeper line = higher droop = less responsive to frequency changes
- Multiple generators on same plot: different droops, different capacities → different contributions to load sharing

Frequency response simulation:
1. Initial: system at 50 Hz, all generators loaded at scheduled values
2. Load increase: delta_PL applied
3. Inertial response (0-2s): frequency falls at rate df/dt = -delta_PL / (2H_system × f_rated). Rate of change depends on total system inertia.
4. Primary response (2-30s): governor action. Each generator increases output proportional to 1/R. Frequency stabilizes at new lower value: delta_f_ss = -delta_PL / (D + sum(1/Ri))
5. Steady-state frequency error: f_new = 50 - delta_f_ss ≠ 50 Hz (governor alone cannot restore to 50 Hz — needs AGC)

Load damping effect: as frequency drops, load reduces slightly (motor loads slow down, reducing power). Load damping coefficient D (MW/Hz) helps arrest frequency decline.

Under-frequency load shedding (UFLS): if frequency drops below set thresholds despite governor response (insufficient generation/reserve):
- Stage 1 (49.5 Hz): 10% non-essential load shed — animated load blocks disconnecting
- Stage 2 (49.2 Hz): another 10%
- Stage 3 (49.0 Hz): another 10%
- Frequency recovers after shedding

ROCOF (Rate of Change of Frequency) calculation: df/dt = -delta_P / (2H × f). Used to detect generation loss event magnitude.

Controls: number of generators (2-4), droop for each (3-6%), capacity for each (MW), load change (MW), total system inertia H, load damping D, UFLS settings (thresholds and percentages), spinning reserve (MW)

Live readouts: frequency (Hz), ROCOF (Hz/s), each generator's output change (MW), steady-state frequency error, total generation, total load, frequency nadir (lowest point)

Theory tab:
- Droop characteristic: R = -(delta_f / f0) / (delta_P / P_rated) × 100%. Droop of 4% means: 1% frequency change → 25% power change (1/R = 25)
- Why droop (not isochronous): with droop, multiple generators can operate in parallel and share load proportionally. Without droop (isochronous, R=0), two generators would fight for load control → unstable.
- Frequency response characteristic: beta = D + 1/R (MW/Hz) — system's response to frequency deviation
- Frequency nadir: lowest frequency after disturbance, before governor response takes full effect. Depends on: inertia H (how fast frequency falls), governor time constant (how fast turbine responds), spinning reserve (how much capacity is available)
- Under-frequency load shedding: last resort defense. Settings coordinated across all regions in India by Grid-India.
- ROCOF-based detection: large ROCOF indicates large generation loss event — used to initiate fast load shedding (df/dt relays)
- Real-world context:
  * Indian grid UFLS scheme (IEGC Schedule):
    - 49.5 Hz: 14% load shedding in 0.5s
    - 49.2 Hz: 12% additional
    - 49.0 Hz: 12% additional
    - 48.8 Hz: 10% additional (total up to 48%)
  * India's declining system inertia with renewable energy integration: solar inverters have zero inertia, wind turbines have limited synthetic inertia. As RE share grows (target 500 GW by 2030), ROCOF during events increases.
  * Grid-India ROCOF analysis: at current RE penetration, ROCOF during largest credible contingency (loss of 3000 MW unit at Mundra) is ~0.08 Hz/s. At 500 GW RE: could increase to 0.15-0.20 Hz/s.
  * CERC regulation on frequency response obligation: every generator must demonstrate primary response capability (free governor mode)
  * Spinning reserve requirements: 2.5% of generation schedule as per CERC regulation


Simulations #7-8 — Voltage Stability & Reactive Power Control

#7: Voltage Stability (PV Curve)

File: sims/stability-control/voltage-stability-pv-curve.jsx

Simulate: The "nose curve" — bus voltage (V) vs active power load (P):

PV curve plotted: as load P increases from zero, voltage V starts at 1.0 pu and decreases gradually. At some critical loading point (the "nose"), the curve turns back — beyond this point, voltage collapses.

Two solution branches:
- Upper branch: normal operating region (stable). Small perturbation → voltage returns to upper branch.
- Lower branch: abnormal operating region (unstable). Any perturbation → voltage collapses to zero.
- Nose point: the voltage collapse point — maximum loadability of the system

Animated voltage collapse sequence:
1. System operating normally on upper branch
2. Load increases gradually (animated loading bar)
3. Voltage drops but system holds (generators increase reactive output)
4. Generators hit reactive power limits (Q_max) → voltage drops faster (curve steepens)
5. At nose point: any additional load causes voltage to cascade downward → voltage collapse (all voltages drop to unacceptable levels — brownout → blackout)

Power factor effect: multiple PV curves for different load power factors:
- PF = 1.0: maximum loadability, nose point at highest P
- PF = 0.9 lag: less loadability, nose point at lower P
- PF = 0.8 lag: even less (reactive load demand strains the system)
- PF = 0.9 lead: slightly improved (load supplies some reactive power)

Reactive compensation effect: adding SVC or capacitor bank shifts the nose point to the right (increases loadability) — animated demonstration

Loading margin: distance from current operating point to nose point — the safety margin. Expressed in MW or percentage.

Controls: system impedance (Z_line = R+jX), source voltage, load power factor, load increase rate, reactive compensation (MVAr), generator Q_max limit, number of parallel lines (tripping one reduces loadability)

Live readouts: bus voltage (pu), load power (MW), loading margin (MW and %), generator Q output (MVAr), Q limit status, stability status (stable/marginally stable/voltage collapse imminent)

Theory tab:
- Voltage stability: ability of power system to maintain acceptable voltages at all buses under normal conditions and after disturbances
- PV curve derivation: from load flow equations for 2-bus system: V^4 - 2V^2(RPcosφ + XPsinφ - Vs^2/2) + P^2(R^2+X^2) = 0 → quadratic in V^2 → two solutions (upper and lower branch)
- Maximum power: Pmax = Vs^2 / (2Z × (1 + cosφ)) for lossless line
- Nose point significance: at nose, dV/dP → -infinity. Jacobian becomes singular (load flow diverges — this is why NR load flow fails to converge near voltage collapse point).
- Continuation Power Flow (CPF): special technique that traces the PV curve through the nose point by parameterizing the load increase
- QV curve: complementary analysis — for a given bus, plot reactive power vs voltage. The minimum of the QV curve gives the reactive margin.
- Voltage collapse mechanism: load increase → increased current → increased reactive losses (I^2X) → generators increase Q output → Q limits hit → voltage drops further → more current for same power → positive feedback loop → collapse
- Real-world context:
  * Indian voltage collapse incidents: partial voltage collapse in Northern Region in 2001 (Delhi area, heavy load + reactive deficit), Southern Region voltage concerns during summer peak (Chennai, Bangalore — long radial 400 kV lines from Kurnool/Raichur to demand centers)
  * AP Transco voltage management: maintaining 400 kV bus voltage at Kurnool, Nellore, Vizag — reactive support from generators + 400 kV bus reactors + SVCs
  * PGCIL voltage profile management: maintaining 400 kV system voltage between 380-420 kV (1.0 ± 5%)
  * Reactive compensation: 400 kV bus reactors (63 MVAr standard) switched in during light load to absorb excess reactive power (Ferranti effect). Capacitor banks at 220/132 kV for voltage support during peak load.
  * Grid-India issues voltage schedule to all generators and grid substations daily

#8: FACTS Devices

File: sims/stability-control/facts-devices.jsx

Simulate: Three FACTS devices shown as interactive panels with animated operating principles:

1. SVC (Static VAr Compensator):
- Circuit: thyristor-controlled reactor (TCR) in parallel with fixed capacitor (FC) or thyristor-switched capacitor (TSC)
- Animation: thyristor firing angle alpha adjusts → reactor current varies → net reactive power changes
- At alpha = 90 deg: full reactor current → absorbs maximum Q (inductive)
- At alpha = 180 deg: zero reactor current → capacitor dominates → supplies maximum Q (capacitive)
- V-I characteristic: V vs I with slope (droop), controllable range between capacitive and inductive limits
- Application: bus voltage regulation — voltage goes high → SVC absorbs Q, voltage goes low → SVC supplies Q

2. STATCOM (Static Synchronous Compensator):
- Circuit: voltage source converter (VSC) + DC capacitor connected to grid through coupling transformer
- Animation: VSC generates AC voltage. If Vout > Vgrid → supplies Q (capacitive). If Vout < Vgrid → absorbs Q (inductive).
- V-I characteristic: superior to SVC — at low voltage, STATCOM still provides full current (current-limited, not impedance-limited). SVC output drops with voltage squared.
- Dynamic response: faster than SVC (sub-cycle), better for voltage dips

3. TCSC (Thyristor Controlled Series Capacitor):
- Circuit: capacitor bank with parallel TCR
- Animation: by varying TCR firing angle, effective series impedance of transmission line is changed
- Capacitive mode: reduces line impedance → increases power transfer capacity (P = V^2 sin delta / X → lower X means more P)
- Inductive mode: increases impedance → can limit fault current or control power flow
- Application on long transmission lines to increase loadability

Comparison visualization: same transmission line scenario with no compensation, SVC, STATCOM, and TCSC — showing improvement in voltage profile, power transfer, and stability margin for each

Controls: FACTS type, rating (MVAr), system voltage, system impedance, load level, firing angle (for SVC/TCSC), VSC reference voltage (for STATCOM), line length (for TCSC)

Live readouts: reactive power output (MVAr), bus voltage (pu), power transfer (MW), stability margin improvement (%), effective line impedance (for TCSC), device operating point on V-I curve

Theory tab:
- FACTS (Flexible AC Transmission Systems): power electronic devices that enhance controllability, stability, and capacity of AC transmission systems
- Classification:
  * Shunt devices: SVC, STATCOM — control voltage by injecting/absorbing reactive power
  * Series devices: TCSC, SSSC — control line impedance/voltage to regulate power flow
  * Combined: UPFC (Unified Power Flow Controller) — both shunt and series
- SVC operating principle: TCR varies reactive absorption by controlling thyristor firing angle. Net Q = Q_capacitor - Q_reactor(alpha). Response time: 1-2 cycles.
- STATCOM advantage over SVC: output current is independent of terminal voltage (VSC is voltage source, not impedance). At 0.5 pu voltage, STATCOM still provides rated current → better voltage support during faults. But more expensive.
- TCSC: changes effective X_line by injecting variable series impedance. Practical range: 0.3-3.0 × X_capacitor. Also provides damping for sub-synchronous resonance (SSR).
- Real-world context:
  * Indian grid FACTS installations:
    - SVCs: Kanpur (UP) ±200 MVAr SVC by ABB (first in India, 2005), Kudankulam (TN) SVC, several at PGCIL 400 kV substations
    - STATCOM: Kothagudem (Telangana/AP) ±100 MVAr STATCOM by ABB (first in India, 2004), Pune STATCOM, Tiruvalam STATCOM
    - TCSC: Raipur-Rourkela 400 kV line TCSC (first in India, 2004) — increased line loading from 700 MW to 1000 MW
    - UPFC: Planned for some PGCIL corridors but not yet commissioned
  * PGCIL is India's largest FACTS user — deployed to increase capacity of existing transmission corridors rather than building new lines (cheaper, faster, less Right-of-Way issues)
  * With increasing RE integration, STATCOM installations are growing rapidly — required at large solar/wind plant interconnection points for voltage support per CEA grid code amendments
  * Cost comparison: SVC ≈ Rs 10-15 crore per 100 MVAr, STATCOM ≈ Rs 15-25 crore per 100 MVAr, TCSC ≈ Rs 10-20 crore per 100 MVAr


Build Order

Build the flagship first — it establishes the control room visual framework that gives context to all individual stability and control concepts.

Phase 1 — Flagship + Rotor Angle Stability (4 sims)
1. stability-control-room.jsx — flagship grid stability simulator (sets the template)
2. swing-equation.jsx — foundational equation for all rotor angle analysis
3. equal-area-criterion.jsx — builds on swing equation, visual stability assessment
4. power-angle-stability.jsx — complete transient stability analysis

Phase 2 — Frequency & Voltage Control (3 sims)
5. automatic-generation-control.jsx — frequency control and inter-area coordination
6. automatic-voltage-regulator.jsx — voltage control at generator level
7. load-frequency-control.jsx — governor droop and frequency response (complements AGC)

Phase 3 — Advanced Stability & Control (2 sims)
8. voltage-stability-pv-curve.jsx — voltage collapse analysis
9. facts-devices.jsx — modern power electronic solutions for stability enhancement

Total: 9 simulations in sims/stability-control/
