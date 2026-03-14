Power Electronics Simulations — Build Plan

Two Architecture Changes (apply to ALL simulations going forward)

1. Tabbed Interface Inside Every Simulation

Every simulation will have a top-level tab bar with two tabs:

[ Simulate ]  [ Theory ]

Simulate tab: The interactive visualization + controls

Theory tab: Scrollable content with concept explanation, key equations (rendered with styled spans, not LaTeX), annotated SVG diagrams, real-world context boxes

The tab bar will be a reusable pattern baked into each JSX file (self-contained, no shared components). Styled as pill tabs at the top of the simulation container.

2. Real-World Indian Industrial Context

All simulations use real component ratings and terminology from Indian practice:

- Standard AC supply: 230V single-phase, 415V 3-phase, 50 Hz
- Power semiconductor manufacturers: BHEL (thyristors), Semikron India, Infineon, Mitsubishi
- Industrial drive brands common in India: ABB, Siemens, Danfoss, L&T, Hitachi
- Indian Railways traction context: 25 kV AC, thyristor/IGBT locomotives
- Solar inverter context: string inverters (5-50 kW), central inverters (500 kW-2 MW) for Indian solar parks
- UPS systems: Indian data center and telecom tower applications
- IS/IEC standards for power electronic equipment


Simulation #0 — Flagship: Power Electronics Converter Lab

File: sims/power-electronics/converter-lab.jsx

This is the centerpiece — an interactive workbench where users build and simulate any converter topology from switching building blocks.

Simulate tab:

Four converter categories arranged as cards:

AC→DC (Rectifiers) | DC→DC (Choppers) | DC→AC (Inverters) | AC→AC (Cycloconverters)

Clicking any card shows:
- Circuit topology with animated switches (ON/OFF states clearly shown)
- Input waveform on the left
- Output waveform on the right
- Switching sequence timeline at the bottom
- Power flow arrow showing energy conversion direction
- Harmonic spectrum of output (bar chart of fundamental + harmonics)

Common controls: input voltage/frequency, switching frequency, load type (R/RL/RLE)

Live readouts: output average/RMS voltage, output current, power factor, efficiency, THD (%)

Comparison mode: overlay output waveforms of different topologies (e.g., half-wave vs full-wave rectifier)

Theory tab:

- Classification of power electronic converters (4 types)
- Why power electronics matters — efficiency comparison: linear regulator (30-50%) vs switching converter (85-98%)
- Switching device comparison table: SCR, MOSFET, IGBT (voltage/current ratings, switching speed, applications)
- Harmonics: what they are, why converters produce them, IEEE 519 / IS 15652 limits
- Applications landscape in India: drives, UPS, HVDC, solar/wind, traction, welding, induction heating
- Market context: India's power electronics market growing with solar installations and EV adoption


Simulations #1-2 — Semiconductor Devices

#1: Power Semiconductor Devices

File: sims/power-electronics/power-semiconductor-devices.jsx

Simulate: Three-panel comparison showing SCR, MOSFET, and IGBT:

For each device:
- V-I characteristic curve with operating regions labeled (forward blocking, forward conduction, reverse blocking)
- Animated device symbol with gate/trigger pulse
- Switching waveforms: turn-on and turn-off transients showing delay times, rise/fall times
- Power loss breakdown: conduction loss vs switching loss pie chart
- Safe Operating Area (SOA) boundary on V-I plot

Switching speed comparison: timeline showing turn-on/turn-off times side-by-side (SCR: 10-100us, MOSFET: 10-100ns, IGBT: 0.5-5us)

Device selection guide: given application requirements (voltage, current, frequency), the simulation highlights the best device

Controls: device type toggle, gate signal (pulse/continuous), load type, operating voltage/current point, switching frequency

Live readouts: on-state voltage drop, switching losses (W), conduction losses (W), total losses, junction temperature estimate

Theory tab:
- SCR (Thyristor): 4-layer PNPN structure, gate triggering, latching, natural vs forced commutation, cannot be turned off from gate (conventional SCR)
- MOSFET: voltage-controlled, unipolar (majority carrier), fast switching, high Rds(on) at high voltage — suited for low-voltage high-frequency
- IGBT: hybrid of MOSFET gate + BJT conduction, moderate speed, low on-state drop — sweet spot for medium voltage/frequency
- GTO, IGCT for ultra-high power (mention for completeness)
- Device ratings: voltage (VDRM, VRRM), current (IT(avg), IT(rms)), di/dt and dv/dt limits
- Real-world context: BHEL manufactures thyristors up to 5000V/3000A for HVDC (Rihand-Delhi). Indian solar inverters use Infineon IGBT modules. Railway traction: WAP-7 uses GTO thyristors, newer WAP-5/WAG-12B use IGBTs
- Thermal management: heat sinks, thermal resistance chain (junction → case → sink → ambient)

#2: SCR Firing and Commutation

File: sims/power-electronics/scr-firing-commutation.jsx

Simulate: Two main sections:

Firing/Triggering:
- AC supply waveform with SCR in circuit
- Gate pulse timing adjustable — firing angle alpha moves the trigger pulse along the waveform
- Current conduction shown: SCR turns on at alpha, conducts till current reaches zero (natural commutation)
- Load voltage waveform builds as alpha changes
- Different gate pulse types: single pulse, pulse train, high-frequency carrier

Commutation Methods (animated circuit for each):
1. Class A (Self/Load commutation): LC load, current naturally reaches zero
2. Class B (Resonant pulse): LC resonant circuit forces current through SCR to zero
3. Class C (Complementary): another SCR turns on, diverting current
4. Class D (Auxiliary): external LC circuit applies reverse voltage
5. Class E (External pulse): external voltage source
6. Class F (AC line/Natural): AC source naturally reverses — most common in rectifiers

Each method shows: circuit diagram, animated current paths, voltage across SCR, and commutation instant highlighted

Controls: firing angle (0-180 deg), commutation type, supply (AC/DC), load type (R/RL/RLE), gate pulse type

Live readouts: conduction angle, average output voltage, SCR voltage/current waveforms, turn-off time

Theory tab:
- Triggering requirements: gate current (Ig), latching current (IL), holding current (IH)
- Why firing angle control works: delaying the trigger pulse reduces average output
- Natural commutation: only possible with AC supply — SCR turns off when current naturally crosses zero
- Forced commutation: needed for DC circuits — various methods to force current to zero
- di/dt protection (series inductor), dv/dt protection (snubber RC)
- Real-world context: thyristor firing circuits in Indian industrial practice — UJT-based triggers (older), microcontroller-based digital firing (modern), opto-isolated gate drivers for high voltage isolation
- HVDC converter stations use 12-pulse thyristor valves with precise firing angle control


Simulations #3-4 — AC-DC Converters (Rectifiers)

#3: Single-Phase Rectifiers

File: sims/power-electronics/single-phase-rectifier.jsx

Simulate: Four topologies selectable:

1. Half-wave uncontrolled (single diode)
2. Half-wave controlled (single SCR)
3. Full-wave center-tapped (2 diodes/SCRs)
4. Full-wave bridge (4 diodes/SCRs)

For each topology:
- Circuit diagram with animated current paths (highlighted in red when conducting)
- Input AC waveform
- Output DC waveform with average value (Vdc) line
- Current waveforms for each device
- Freewheeling diode effect on RL load (toggle on/off)

As firing angle (alpha) changes:
- Output voltage waveform clips earlier
- Vdc formula updates: Vdc = Vm(1+cos alpha)/2pi for half-wave, Vm(1+cos alpha)/pi for full-wave bridge
- At alpha > 90 deg with RL load: negative voltage regions appear (inversion possibility)

Load type comparison: R load (discontinuous current), RL load (continuous current, longer conduction), RLE load (back-EMF motor load)

Controls: topology selector, controlled/uncontrolled toggle, firing angle (0-180 deg), load type (R/RL/RLE), freewheeling diode toggle

Live readouts: Vdc, Vrms, Idc, Irms, ripple factor, form factor, PIV of each device, efficiency, input PF

Theory tab:
- Rectification: converting AC to DC using unidirectional switches
- Average voltage formulas for each topology (integration of Vm.sin(wt) over conduction period)
- Why full-wave is preferred (lower ripple, no DC magnetization of transformer core)
- Effect of firing angle: Vdc = Vdc0 × cos(alpha) for full-wave with continuous current
- Freewheeling diode: prevents negative output voltage, improves load current waveform, reduces reactive power
- Harmonics injected into AC supply: half-wave has even harmonics (bad), full-wave has odd harmonics
- Real-world context: battery chargers (e-rickshaw chargers: 48V DC from 230V AC), DC motor drives (single-phase SCR drive for small DC motors), electroplating rectifiers common in Indian small-scale industry
- IS 15652 harmonic limits for single-phase equipment

#4: Three-Phase Rectifiers

File: sims/power-electronics/three-phase-rectifier.jsx

Simulate: Two main topologies:

1. Three-phase half-wave (3-pulse): 3 devices, one per phase
2. Three-phase full-wave bridge (6-pulse): 6 devices in bridge configuration

For the 6-pulse bridge (primary focus):
- Circuit diagram with 6 SCRs labeled T1-T6 in bridge configuration
- Three-phase AC input waveforms (R-Y-B)
- Animated conduction sequence: at any instant, exactly 2 SCRs conduct (one in top group, one in bottom), conducting pair highlighted
- Conduction table showing which pair conducts in each 60-degree interval
- Output voltage waveform (6 pulses per cycle) with firing angle effect
- Output ripple: 6-pulse has 300 Hz ripple (6 × 50 Hz) — much smoother than single-phase

Overlap/commutation angle (mu): when transferring current between phases, both conduct briefly — overlap angle shown as notch in output voltage

Inverter mode: alpha > 90 deg — output voltage goes negative, power flows from DC to AC (regeneration)

Controls: topology (3-pulse/6-pulse), firing angle (0-180 deg), source inductance (for commutation overlap), load, controlled/uncontrolled toggle

Live readouts: Vdc, ripple voltage, ripple frequency, overlap angle, device currents, input PF, input current THD, power flow direction

Theory tab:
- 6-pulse operation: two groups of 3 devices, natural firing order (1-2-3-4-5-6), 60-degree intervals
- Vdc = (3Vm_L/pi) × cos(alpha) for 6-pulse (line voltage based)
- Commutation overlap: source inductance causes simultaneous conduction, reduces Vdc
- Input current waveform: quasi-square wave (120 deg conduction), harmonics at 6n ± 1 (5th, 7th, 11th, 13th...)
- Input power factor = displacement factor × distortion factor
- 12-pulse operation: two 6-pulse bridges with 30 deg phase shift (Dy + Yy transformers) — eliminates 5th and 7th harmonics
- Real-world context: 6-pulse bridge is the workhorse of Indian industry — DC motor drives for steel rolling mills (SAIL, JSW, Tata Steel), aluminium smelters (NALCO, Hindalco — massive 50-100 kA rectifiers), HVDC converter stations (Rihand-Delhi 1500 MW uses 12-pulse thyristor bridges)
- Harmonic filters: 5th, 7th, 11th, 13th tuned filters at HVDC stations


Simulations #5-7 — DC-DC Converters (Choppers)

#5: Buck (Step-Down) Converter

File: sims/power-electronics/buck-converter.jsx

Simulate: Circuit diagram with animated switch (MOSFET/IGBT) and freewheeling diode:

Two states animated alternately:
- Switch ON: current flows from Vin through switch → L → C → R load. Inductor charges (current ramps up). Current path highlighted in red.
- Switch OFF: inductor drives current through freewheeling diode → L → C → R load. Inductor discharges (current ramps down). Current path highlighted in blue.

Waveforms (stacked, time-synchronized):
- Gate signal (PWM pulse)
- Inductor current (triangular ripple superimposed on DC average)
- Output voltage (DC with small ripple)
- Switch voltage (0 or Vin)
- Diode current

Boundary between CCM (Continuous Conduction Mode) and DCM (Discontinuous Conduction Mode) shown: reducing load causes inductor current to touch zero — waveform changes shape.

Output voltage vs duty cycle: Vout = D × Vin — linear relationship plotted

Controls: Vin (12-400V), duty cycle D (0-100%), switching frequency (1-100 kHz), L (uH-mH), C (uF), R load

Live readouts: Vout (avg), Iout, inductor current ripple (delta_IL), output voltage ripple (delta_Vc), efficiency, mode (CCM/DCM)

Theory tab:
- Volt-second balance on inductor: Vin-Vout during TON = Vout during TOFF → Vout = D × Vin
- Inductor current ripple: delta_IL = (Vin - Vout) × D / (f × L)
- Output voltage ripple: delta_Vc = delta_IL / (8 × f × C)
- Critical inductance for CCM: Lc = (1-D) × R / (2f)
- Component selection: how to choose L and C for desired ripple
- Losses: conduction (I²R of MOSFET Rds(on)), switching (0.5 × V × I × (ton+toff) × f), diode losses
- Real-world context: buck converters everywhere in India — mobile phone chargers (5V from 12V adapter), LED drivers (constant current buck), solar charge controllers (MPPT buck from panel voltage to battery voltage), EV DC-DC converters (400V bus to 12V auxiliary)
- Design example: 48V to 12V converter for telecom tower backup (very common in Indian BTS installations)

#6: Boost (Step-Up) Converter

File: sims/power-electronics/boost-converter.jsx

Simulate: Circuit diagram with switch and diode, animated in two states:

- Switch ON: current flows from Vin through L → switch to ground. Inductor charges. Load supplied by capacitor alone. Current path highlighted.
- Switch OFF: inductor (now charged) drives current through L → diode → C + R load. Inductor voltage adds to source voltage → Vout > Vin. Current path highlighted.

Key insight animation: "L acts as an energy bucket — charges from source when switch is ON, dumps into load at higher voltage when switch is OFF"

Waveforms: gate signal, inductor current (triangular), diode current (pulsating), output voltage (DC with ripple)

Vout vs duty cycle: Vout = Vin / (1-D) — hyperbolic curve plotted. Warning: as D → 1, Vout → infinity in theory but losses dominate in practice (efficiency cliff shown)

Practical limit: efficiency vs duty cycle — drops sharply above D = 0.85 due to parasitic losses

Controls: Vin, duty cycle D, switching frequency, L, C, R load

Live readouts: Vout (avg and ripple), Iin, Iout, boost ratio, efficiency, duty cycle, CCM/DCM indicator

Theory tab:
- Volt-second balance: Vin × D = (Vout - Vin) × (1-D) → Vout = Vin / (1-D)
- Why the inductor is key: stores energy in magnetic field during ON, releases at higher voltage during OFF
- Input current is continuous (advantage for solar/battery applications)
- Output current is discontinuous (high ripple demands larger output capacitor)
- Non-ideal behavior: at high D, parasitic resistance of L and switch dominate, Vout peaks and drops
- Real-world context: solar micro-inverter first stage (boost from 30V panel to 400V DC bus), fuel cell voltage boosting, EV powertrain (boost 200V battery to 400V motor drive bus), LED TV backlight boost driver
- Indian solar context: MPPT boost converters in solar string inverters (Tata Power Solar, Adani Solar, Waaree)

#7: Buck-Boost Converter

File: sims/power-electronics/buck-boost-converter.jsx

Simulate: Circuit showing the buck-boost topology (output voltage polarity is inverted):

- Switch ON: current flows from Vin through switch → L to ground. Inductor charges. Load supplied by C.
- Switch OFF: inductor polarity reverses, current flows through L → C + R load → diode to ground. Output is negative polarity.

Key visual: the polarity inversion is highlighted — output voltage is negative with respect to input ground

Vout vs D: |Vout| = Vin × D/(1-D)
- D < 0.5: |Vout| < Vin (buck mode)
- D = 0.5: |Vout| = Vin
- D > 0.5: |Vout| > Vin (boost mode)

Mode visualization: a bar gauge shows buck/boost transition as D sweeps

Both CCM and DCM waveforms shown with mode transition

Controls: Vin, duty cycle, switching frequency, L, C, R load

Live readouts: Vout (magnitude and polarity), mode (buck/boost), ripple, efficiency

Theory tab:
- Derivation from volt-second balance: Vin × D = |Vout| × (1-D)
- Why output polarity inverts (inductor reversal)
- Comparison with Cuk converter (non-inverting buck-boost, capacitive energy transfer)
- SEPIC converter mention (non-inverting alternative)
- Input current: discontinuous (unlike boost) — needs input filter
- Real-world context: battery-powered systems where battery voltage varies above and below required output (laptop adapters, solar battery charger/discharger), regenerative braking energy capture
- Indian application: solar street light controllers (battery voltage varies 10-14V, LED needs constant 12V — buck-boost maintains output as battery charges/discharges)


Simulations #8-10 — DC-AC Converters (Inverters)

#8: Single-Phase Inverter

File: sims/power-electronics/single-phase-inverter.jsx

Simulate: H-bridge circuit with 4 switches (S1-S4) and DC supply:

Switching animation:
- S1+S4 ON: current flows left-to-right through load → positive output voltage
- S2+S3 ON: current flows right-to-left through load → negative output voltage
- S1+S3 or S2+S4: never simultaneously (shoot-through — shown as fault condition with warning)

Output waveform types:
1. Square wave: simplest, S1S4 for half cycle, S2S3 for other half. Output is ±Vdc square wave.
2. Quasi-square wave (modified square): adds zero-voltage intervals using S1S3 or S2S4 (freewheeling). Notch width controls harmonic content.
3. Unipolar PWM: output swings between +Vdc and 0 (half cycle), then 0 and -Vdc (other half). Lower effective switching frequency stress on load.

Harmonic spectrum: bar chart showing fundamental + harmonics for each switching pattern. Square wave has strong 3rd, 5th, 7th harmonics. PWM pushes harmonics to high frequency.

RL load demonstration: current waveform lags voltage, anti-parallel diodes (body diodes) conduct during current lag — highlighted in animation

Controls: DC bus voltage, switching pattern (square/quasi-square/PWM), modulation index, switching frequency, load type (R/RL)

Live readouts: output fundamental voltage (V1), THD (%), output power, harmonic magnitudes, waveform shape

Theory tab:
- Voltage source inverter (VSI) vs current source inverter (CSI) — VSI dominates
- Square wave: Vn = 4Vdc/(n.pi) for odd n — contains all odd harmonics
- Quasi-square wave: choosing notch angle to eliminate specific harmonics
- Why we need inverters: solar DC → AC grid, UPS, VFDs, induction heating
- Dead time: brief delay between turning off one pair and turning on the other — prevents shoot-through, but causes output voltage distortion
- Real-world context: UPS systems (APC, Emerson/Vertiv, Numeric, Microtek — common Indian brands), solar inverters for home use (1-5 kW), inverter-type welding machines
- Indian home inverter market: Luminous, Microtek, Su-Kam — typically square wave (cheap) or sine wave (premium)

#9: PWM Inverter (SPWM)

File: sims/power-electronics/pwm-inverter.jsx

Simulate: Sinusoidal PWM generation shown step-by-step:

1. Reference signal: sine wave at desired output frequency (50 Hz)
2. Carrier signal: triangular wave at high frequency (1-20 kHz)
3. Comparison: when reference > carrier, S1S4 ON (+Vdc). When reference < carrier, S2S3 ON (-Vdc).
4. Resulting output: PWM chopped waveform — a series of variable-width pulses

The PWM output is then shown passing through an LC filter → clean sinusoidal output

Three views synchronized:
- Top: reference (sine) and carrier (triangle) overlaid — intersection points determine switching instants
- Middle: unfiltered PWM output (chopped DC)
- Bottom: filtered output (smooth sine wave)

Harmonic spectrum: fundamental at 50 Hz (desired), harmonics clustered around carrier frequency and multiples — far away from fundamental, easy to filter

Modulation index effect: ma = Vm_ref / Vm_carrier
- ma < 1: linear region, V1 = ma × Vdc (proportional)
- ma = 1: maximum linear output
- ma > 1: overmodulation — lower-order harmonics reappear

Controls: modulation index (0-1.5), carrier frequency (1-20 kHz), output frequency (10-100 Hz), DC bus voltage, LC filter values

Live readouts: fundamental output voltage, THD (%), switching frequency, frequency ratio (mf = fc/fm), harmonic magnitudes

Theory tab:
- SPWM principle: natural sampling — intersection of reference and carrier defines pulse widths
- Why triangular carrier: produces symmetrical PWM, easy to implement
- Frequency ratio mf = fc/fm: should be odd integer and multiple of 3 (for 3-phase) for harmonic cancellation
- Linear vs overmodulation region
- THD comparison: square wave (~48%) vs SPWM (~5% with proper mf)
- Third harmonic injection: adding 1/6 of 3rd harmonic to reference increases fundamental by 15% (SVM basis)
- Space Vector Modulation (SVM): brief intro as the industrial standard (better DC bus utilization)
- Real-world context: every modern VFD uses SPWM or SVM. Indian solar inverters (grid-tied, 3-50 kW range) use SPWM with IGBT modules at 10-20 kHz. ABB ACS series, Siemens G120 drives use SVM.
- dv/dt issues: fast PWM switching causes voltage spikes at motor terminals (cable reflection) — needs output filters for long cable runs (>50m in Indian practice)

#10: Three-Phase Inverter

File: sims/power-electronics/three-phase-inverter.jsx

Simulate: Three-phase bridge inverter (6 switches in 3 legs):

Two conduction modes:

1. 180-degree conduction: each switch conducts for 180 deg, 60 deg overlap between switches in same leg. At any instant, 3 switches conduct. Line voltages are 6-step waveforms. Phase voltages have 120 deg steps.

2. 120-degree conduction: each switch conducts for 120 deg. At any instant, 2 switches conduct. One phase is always floating. Simpler but lower output voltage.

For each mode:
- Switching sequence diagram (which switches are ON at each 60 deg interval)
- Line voltage waveforms (VRY, VYB, VBR)
- Phase voltage waveforms (VRN, VYN, VBN)
- Current paths through load at each switching state
- 8 voltage space vectors plotted on alpha-beta plane (6 active + 2 zero)

PWM mode: SPWM applied to three-phase — three sinusoidal references (120 deg apart) compared with single triangular carrier. Output PWM patterns for each leg.

Controls: conduction mode (180/120/PWM), DC bus voltage, output frequency, modulation index (for PWM), load (R/RL, star/delta connected)

Live readouts: line voltages (fundamental), phase voltages, THD, output power per phase, neutral voltage

Theory tab:
- 6-step operation: 8 possible switch states (6 active vectors + 2 zero vectors)
- 180 deg mode: line voltage = ±Vdc and 0, phase voltage = ±2Vdc/3 and ±Vdc/3
- 120 deg mode: simpler control, clean 60-deg stepped phase voltage
- Space Vector concept: each switching state defines a voltage vector in alpha-beta plane
- SVM: synthesize any desired voltage vector by time-averaging adjacent space vectors — better DC bus utilization than SPWM (by 2/sqrt(3) = 15.5%)
- Harmonic cancellation in 3-phase: triplen harmonics (3rd, 9th, 15th) cancel in line voltages
- Real-world context: three-phase inverters power most industrial drives in India. Solar inverters for MW-scale solar parks (e.g., Bhadla 2245 MW, Pavagada 2050 MW) use 3-phase inverters. Central inverters from SMA, ABB, Sungrow rated 1-5 MW each.
- Indian solar inverter standards: IS 16221 (grid-connected inverters), MNRE guidelines


Simulations #11-12 — Electric Drives

#11: V/f Drive Control

File: sims/power-electronics/vf-drive-control.jsx

Simulate: Complete VFD system animated:

Block diagram: AC supply → rectifier → DC bus (capacitor bank) → inverter → motor

Motor speed-torque curve family: as V/f ratio is maintained and frequency varies from 0-50 Hz, parallel T-N curves shift along the speed axis. Operating point tracks the intersection with load curve.

Three operating regions visualized:
1. Constant torque (0 to base frequency, 50 Hz): V/f = constant, full torque available
2. Constant power (above base frequency): V constant, f increases, flux weakens, torque drops
3. High-speed region: torque drops as 1/f^2

V/f ratio gauge: shows voltage and frequency tracking together, with a graphical "V/f profile" (linear up to 50 Hz, then V capped)

Boost voltage at low frequency: small extra voltage added at very low speeds to compensate for stator resistance drop — shown as V/f profile kink near zero

Motor current waveform: PWM current flowing through motor windings

Controls: reference speed (0-150% rated), V/f ratio boost (0-10%), load torque, acceleration ramp time, deceleration ramp

Live readouts: output frequency, output voltage, motor speed, motor current, torque, power, slip frequency, DC bus voltage

Theory tab:
- Principle: flux phi ∝ V/f. To maintain constant flux (constant torque capacity), V must change with f
- Below base speed: V/f = constant → constant phi → constant Tmax → constant torque region
- Above base speed: V = Vmax (can't exceed supply), f increases → phi drops → Tmax drops → constant power region
- Low-frequency operation: stator R drop becomes significant fraction of V — boost voltage compensates
- Open loop V/f vs closed loop (slip compensation, encoder feedback)
- Scalar control (V/f) vs Vector control (Field Oriented Control) — V/f is simpler but less dynamic
- Real-world context: V/f drives are the most common in Indian industry. Typical applications:
  * Fans and pumps (affinity laws: P ∝ N^3 — massive energy savings)
  * Conveyors (constant torque, variable speed)
  * BEE PAT scheme mandates VFDs for industrial motors above 15 kW
  * Indian cement plant example: kiln ID fan VFD saving 25-35% energy
  * Common Indian VFD brands: ABB ACS580, Siemens V20, Danfoss FC51, L&T SX2000

#12: Four-Quadrant Drive

File: sims/power-electronics/four-quadrant-drive.jsx

Simulate: Speed-torque plane divided into four quadrants:

- Q1: Forward motoring (+N, +T) — motor drives load forward
- Q2: Forward braking/regeneration (+N, -T) — motor decelerates, energy recovered
- Q3: Reverse motoring (-N, -T) — motor drives load in reverse
- Q4: Reverse braking/regeneration (-N, +T) — motor decelerates from reverse

Operating point animated: moves between quadrants as user gives speed commands (forward/reverse/stop)

Converter topology for 4-quadrant operation:
- DC drive: dual converter (two anti-parallel thyristor bridges) — one for forward, one for reverse
- AC drive: regenerative front-end (AFE) + inverter — bidirectional power flow

Energy flow visualization:
- Motoring: power flows grid → converter → motor (red arrows)
- Regeneration: power flows motor → converter → grid (green arrows)

Practical demo: crane/hoist operation — raising (motoring), lowering (regenerative braking), emergency stop (dynamic braking with resistor). Energy meter shows net energy consumption with and without regeneration.

Controls: speed reference (+/- with ramp), load type (hoist/conveyor/centrifuge), braking method (regenerative/dynamic/combined), quadrant selection

Live readouts: speed, torque, power, direction, quadrant, energy consumed, energy recovered, net energy

Theory tab:
- Four quadrants defined by speed and torque signs
- Why 4-quadrant is needed: cranes, elevators, rolling mills, traction
- DC drive 4-quadrant: dual converter (circulating current mode vs circulating current-free mode)
- AC drive 4-quadrant: 
  * Motor side: inverter naturally 4-quadrant (IGBT + anti-parallel diode)
  * Grid side: standard rectifier only absorbs power → need AFE (Active Front End) for regeneration
  * Alternative: dynamic braking resistor (cheaper, wastes energy as heat)
- Regenerative braking energy: kinetic energy = 0.5 J omega^2 → how much energy is recovered
- Real-world context: 
  * Indian Railways: WAP-7 locomotive has regenerative braking, returns ~20% energy to grid (25 kV AC)
  * Mumbai local trains (IGBT-based EMUs) regenerate during braking
  * Steel plant rolling mill drives: 4-quadrant for acceleration/deceleration of rolls
  * Elevator drives: KONE, Otis, Schindler installations in Indian high-rises use regenerative drives
  * Metro rail (Delhi, Hyderabad, Bangalore) IGBT traction drives regenerate during station braking


Build Order

Build the flagship first — it establishes the converter comparison framework and visual language.

Phase 1 — Fundamentals + Rectifiers (5 sims)
1. converter-lab.jsx — flagship converter comparison workbench (sets the template)
2. power-semiconductor-devices.jsx — foundational device comparison
3. scr-firing-commutation.jsx — thyristor operation details
4. single-phase-rectifier.jsx — first converter topology in depth
5. three-phase-rectifier.jsx — industrial workhorse rectifier

Phase 2 — DC-DC Converters (3 sims)
6. buck-converter.jsx — fundamental step-down topology
7. boost-converter.jsx — step-up topology, builds on buck concepts
8. buck-boost-converter.jsx — combined topology, completes DC-DC

Phase 3 — Inverters + Drives (4 sims)
9. single-phase-inverter.jsx — H-bridge fundamentals
10. pwm-inverter.jsx — SPWM modulation technique (builds on H-bridge)
11. three-phase-inverter.jsx — industrial inverter topology
12. vf-drive-control.jsx — motor drive application (builds on 3-phase inverter)
13. four-quadrant-drive.jsx — advanced drive operation

Total: 13 simulations in sims/power-electronics/
