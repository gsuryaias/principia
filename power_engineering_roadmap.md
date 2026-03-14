---
name: Power Engineering SimLab
overview: A comprehensive interactive simulation library covering 8 major power engineering domains with ~90 JSX simulations, each combining animated visuals with numerical controls and real equations. All files will live under sims/ organized by topic folder.
todos:
  - id: electric-machines
    content: Build 17 Electric Machines simulations (DC, Induction, Synchronous, Transformer)
    status: pending
  - id: power-electronics
    content: Build 12 Power Electronics simulations (Rectifiers, Choppers, Inverters, Drives)
    status: pending
  - id: power-systems
    content: Build 8 Power Systems Analysis simulations (Per-Unit, Load Flow, Faults)
    status: pending
  - id: protection
    content: Build 9 Protection & Switchgear simulations (Relays, Schemes, Breakers)
    status: pending
  - id: high-voltage
    content: Build 6 High Voltage Engineering simulations
    status: pending
  - id: transmission-distribution
    content: Build 9 Transmission & Distribution simulations
    status: pending
  - id: utilization
    content: Build 7 Utilization of Electric Energy simulations
    status: pending
  - id: stability-control
    content: Build 8 Power System Stability & Control simulations
    status: pending
isProject: false
---

# Power Engineering Simulation Library — Topic Plan

All simulations combine **animated visuals + numerical controls + real equations**. Each is a standalone JSX file under `sims/<category>/`.

---

## 1. Electric Machines (`sims/electric-machines/`)

### DC Machines


| #   | Simulation                         | What it shows                                                                   | User controls                                |
| --- | ---------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | `dc-motor-fundamentals.jsx`        | Animated rotor, commutator, brush contact, back-EMF generation                  | Field current, armature voltage, load torque |
| 2   | `dc-motor-characteristics.jsx`     | Speed-torque curves for series, shunt, compound motors overlaid                 | Motor type toggle, voltage, field resistance |
| 3   | `dc-motor-speed-control.jsx`       | Armature voltage control vs field weakening — live operating point on N-T curve | Armature voltage, field resistance, load     |
| 4   | `dc-generator-characteristics.jsx` | OCC, voltage build-up process animated, external characteristics                | Speed, field resistance, load current        |


### Induction Machines


| #   | Simulation                               | What it shows                                                                                | User controls                         |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------- |
| 5   | `rotating-magnetic-field.jsx`            | 3-phase stator windings producing a rotating field vector — animated phasors + spatial field | Frequency, phase currents, time scrub |
| 6   | `induction-motor-equivalent-circuit.jsx` | Per-phase equivalent circuit with live power flow arrows, losses breakdown pie chart         | V, R1, X1, R2, X2, Xm, slip           |
| 7   | `torque-slip-characteristics.jsx`        | T-s curve with operating point dot, motoring/generating/braking regions marked               | Voltage, rotor resistance, frequency  |
| 8   | `induction-motor-speed-control.jsx`      | V/f control, rotor resistance, cascade — comparative curves                                  | Method selector, control parameter    |
| 9   | `induction-motor-starting.jsx`           | DOL vs Star-Delta vs Autotransformer — starting current and torque comparison                | Method selector, motor rating         |


### Synchronous Machines


| #   | Simulation                       | What it shows                                                                    | User controls                              |
| --- | -------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------ |
| 10  | `synchronous-phasor-diagram.jsx` | Animated phasor diagram (V, Ia, Ef, jXsIa) rotating for lagging/leading/unity PF | Load, power factor, excitation             |
| 11  | `v-curves-inverted-v.jsx`        | V-curves (Ia vs If) and inverted V (PF vs If) with operating point tracking      | Active power level, field current          |
| 12  | `power-angle-curve.jsx`          | P vs delta curve, max power limit, animated rotor angle                          | Excitation voltage, Xs, mechanical power   |
| 13  | `alternator-synchronization.jsx` | Synchroscope animation — voltage, frequency, phase matching conditions           | Incoming machine speed, voltage, frequency |


### Transformers


| #   | Simulation                                | What it shows                                                               | User controls                            |
| --- | ----------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| 14  | `transformer-working-principle.jsx`       | Animated core flux, primary/secondary EMF, turns ratio effect               | Turns ratio, primary voltage, frequency  |
| 15  | `transformer-equivalent-circuit.jsx`      | Equivalent circuit referred to either side, live loss calculation           | Load, PF, R, X parameters, referred side |
| 16  | `transformer-regulation-efficiency.jsx`   | Voltage regulation vs load curve, efficiency vs load, max efficiency point  | Load fraction, power factor              |
| 17  | `three-phase-transformer-connections.jsx` | Star-Delta, Delta-Star, Delta-Delta, Star-Star — phasor groups, phase shift | Connection type, input voltage           |


---

## 2. Power Electronics (`sims/power-electronics/`)

### Semiconductor Devices


| #   | Simulation                        | What it shows                                                              | User controls                             |
| --- | --------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------- |
| 18  | `power-semiconductor-devices.jsx` | V-I characteristics of SCR, MOSFET, IGBT side-by-side, switching waveforms | Device type, gate signal, load            |
| 19  | `scr-firing-commutation.jsx`      | Gate triggering animation, natural & forced commutation waveforms          | Firing angle, commutation type, load type |


### AC-DC Converters (Rectifiers)


| #   | Simulation                   | What it shows                                                                           | User controls                                |
| --- | ---------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------- |
| 20  | `single-phase-rectifier.jsx` | Half-wave & full-wave with animated current path, output waveform, avg voltage equation | Topology, firing angle, load type (R/RL/RLE) |
| 21  | `three-phase-rectifier.jsx`  | 6-pulse bridge, animated conduction sequence, output ripple                             | Firing angle, load, overlap angle            |


### DC-DC Converters (Choppers)


| #   | Simulation                 | What it shows                                                                           | User controls                 |
| --- | -------------------------- | --------------------------------------------------------------------------------------- | ----------------------------- |
| 22  | `buck-converter.jsx`       | Circuit animation (switch ON/OFF states), inductor current waveform, Vout vs duty cycle | Vin, duty cycle, L, C, R load |
| 23  | `boost-converter.jsx`      | Same style — energy storage in inductor, Vout > Vin demonstration                       | Vin, duty cycle, L, C, R load |
| 24  | `buck-boost-converter.jsx` | Polarity inversion visualization, continuous vs discontinuous mode                      | Vin, duty cycle, L, load      |


### DC-AC Converters (Inverters)


| #   | Simulation                  | What it shows                                                                 | User controls                        |
| --- | --------------------------- | ----------------------------------------------------------------------------- | ------------------------------------ |
| 25  | `single-phase-inverter.jsx` | H-bridge switching animation, square vs quasi-square output                   | Switching pattern, DC voltage, load  |
| 26  | `pwm-inverter.jsx`          | SPWM: carrier vs reference, switching instants, output waveform, THD spectrum | Modulation index, carrier freq, load |
| 27  | `three-phase-inverter.jsx`  | 120 and 180 degree conduction, line/phase voltage waveforms                   | Conduction mode, DC bus voltage      |


### Drives


| #   | Simulation                | What it shows                                                                | User controls                           |
| --- | ------------------------- | ---------------------------------------------------------------------------- | --------------------------------------- |
| 28  | `vf-drive-control.jsx`    | V/f ratio maintenance, speed-torque family of curves, motor operating point  | Reference speed, V/f ratio, load torque |
| 29  | `four-quadrant-drive.jsx` | Four quadrants on speed-torque plane, motoring/braking/regeneration animated | Quadrant selection, speed reference     |


---

## 3. Power Systems Analysis (`sims/power-systems/`)

### Fundamentals


| #   | Simulation                  | What it shows                                                                                | User controls                     |
| --- | --------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------- |
| 30  | `per-unit-system.jsx`       | Interactive converter: enter actual values, see per-unit; change base, see everything update | Base MVA, base kV, actual values  |
| 31  | `bus-admittance-matrix.jsx` | Draw/edit a small network, see Ybus built step-by-step                                       | Add/remove buses, line impedances |


### Load Flow Analysis


| #   | Simulation                     | What it shows                                                                               | User controls                        |
| --- | ------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| 32  | `gauss-seidel-load-flow.jsx`   | Iteration-by-iteration convergence, bus voltages updating on single-line diagram            | Network config, bus types, P/Q specs |
| 33  | `newton-raphson-load-flow.jsx` | Jacobian matrix formation, mismatch reduction per iteration, convergence comparison with GS | Same network, tolerance              |
| 34  | `bus-type-concepts.jsx`        | Slack, PV, PQ bus behavior — what each specifies vs. what it computes                       | Bus type assignment, generation/load |


### Fault Analysis


| #   | Simulation                   | What it shows                                                                         | User controls                                 |
| --- | ---------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------- |
| 35  | `symmetrical-fault.jsx`      | 3-phase fault on a bus — subtransient, transient, steady-state current waveform decay | Fault location, generator parameters          |
| 36  | `symmetrical-components.jsx` | Decomposition of unbalanced phasors into positive, negative, zero sequence — animated | Unbalanced phase values (magnitude, angle)    |
| 37  | `unsymmetrical-faults.jsx`   | SLG, LL, LLG fault — sequence network interconnection, fault current calculation      | Fault type, system impedances, fault location |


---

## 4. Power System Protection (`sims/protection/`)

### Relay Characteristics


| #   | Simulation               | What it shows                                                                               | User controls                                     |
| --- | ------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 38  | `overcurrent-relay.jsx`  | IDMT curve (standard, very inverse, extremely inverse), definite time, pickup/TMS animation | Curve type, plug setting, TMS, fault current      |
| 39  | `distance-relay.jsx`     | R-X diagram with Zone 1/2/3 circles/mho/quadrilateral, fault impedance point                | Relay type, zone reach, fault R+jX                |
| 40  | `differential-relay.jsx` | CT connections, operating vs restraining current, trip/block regions, % slope               | Through current, internal fault current, CT ratio |
| 41  | `directional-relay.jsx`  | Power direction sensing, V-I angle, forward/reverse trip zones                              | Voltage, current, phase angle                     |


### Protection Schemes


| #   | Simulation                     | What it shows                                                                          | User controls                            |
| --- | ------------------------------ | -------------------------------------------------------------------------------------- | ---------------------------------------- |
| 42  | `overcurrent-coordination.jsx` | Radial feeder with multiple relays — time-grading, relay operating times on a timeline | Number of relays, CTI, fault location    |
| 43  | `transformer-protection.jsx`   | Buchholz, differential, overcurrent zones — which operates for which fault type        | Fault type (internal/external), severity |
| 44  | `generator-protection.jsx`     | Capability curve with protection zones overlaid — reverse power, loss of field, over-V | Operating point on capability diagram    |


### Switchgear


| #   | Simulation                      | What it shows                                                                         | User controls                                 |
| --- | ------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------- |
| 45  | `circuit-breaker-operation.jsx` | Contact separation animation, arc formation, arc quenching (SF6/vacuum), TRV waveform | Breaker type, fault current, recovery voltage |
| 46  | `ct-pt-characteristics.jsx`     | Magnetization curve, knee point, burden effect, accuracy class visualization          | Burden, primary current, turns ratio          |


---

## 5. High Voltage Engineering (`sims/high-voltage/`)


| #   | Simulation                     | What it shows                                                                      | User controls                                                  |
| --- | ------------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 47  | `paschen-law.jsx`              | Breakdown voltage vs pd (pressure x distance) curve, minimum breakdown point       | Gas type, pressure, gap distance                               |
| 48  | `lightning-surge-waveform.jsx` | Standard 1.2/50 us lightning impulse, 250/2500 us switching impulse waveforms      | Waveform type, peak voltage, front/tail times                  |
| 49  | `travelling-waves.jsx`         | Pulse propagation on a transmission line, reflection/refraction at junctions       | Surge impedance, junction type (open/short/loaded), wave speed |
| 50  | `insulation-coordination.jsx`  | BIL levels, protective margins, arrester V-I, coordination diagram                 | Equipment BIL, arrester rating, overvoltage level              |
| 51  | `electric-field-grading.jsx`   | Stress distribution in cable insulation — capacitance grading, intersheath grading | Number of layers, permittivity, conductor/sheath radii         |
| 52  | `sphere-gap.jsx`              | Voltage-gap distance curve, correction factors for temperature/pressure            | Sphere diameter, gap, atmospheric conditions                   |


---

## 6. Transmission & Distribution (`sims/transmission-distribution/`)


| #   | Simulation                         | What it shows                                                                          | User controls                                              |
| --- | ---------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 53  | `transmission-line-parameters.jsx` | GMR, GMD calculation for different conductor arrangements, R/L/C per km                | Conductor config (single/bundled), spacing, conductor data |
| 54  | `abcd-parameters.jsx`              | Short, medium (T/pi), long line models — sending/receiving end voltage/current circles | Line length, Z, Y, load, model type                        |
| 55  | `skin-effect.jsx`                  | Current density distribution across conductor cross-section, AC vs DC resistance ratio | Frequency, conductor radius, material                      |
| 56  | `corona-effect.jsx`                | Critical voltage calculation, visual corona onset on conductor, power loss vs voltage  | Conductor radius, spacing, voltage, weather                |
| 57  | `ferranti-effect.jsx`              | Voltage profile along unloaded/lightly loaded long line, phasor explanation            | Line length, voltage, line parameters                      |
| 58  | `sag-tension.jsx`                  | Catenary/parabolic curve, effect of temperature/ice/wind, equal/unequal supports       | Span, weight, tension, temperature, support heights        |
| 59  | `power-circle-diagram.jsx`         | Sending/receiving end power circles, active & reactive power flow vs angle             | ABCD params, voltages, load angle                          |
| 60  | `distribution-systems.jsx`         | Radial vs ring main — voltage drop profile, fault isolation comparison                 | System type, load points, feeder impedances                |
| 61  | `capacitor-placement.jsx`          | Reactive compensation on a feeder, before/after voltage profile, loss reduction        | Feeder length, loads, capacitor location/size              |


---

## 7. Utilization of Electric Energy (`sims/utilization/`)


| #   | Simulation                    | What it shows                                                                                     | User controls                                           |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 62  | `traction-speed-time.jsx`     | Speed-time curve (acceleration, free-run, coasting, braking), specific energy consumption         | Gradient, train mass, acceleration rate, schedule speed |
| 63  | `traction-mechanics.jsx`      | Tractive effort vs speed, adhesion limit, gear ratio effect                                       | Motor type, gear ratio, weight, track gradient          |
| 64  | `electric-heating.jsx`        | Resistance, induction, dielectric heating principles — temperature rise animation                 | Heating type, power, material properties                |
| 65  | `illumination-laws.jsx`       | Inverse square law, Lambert's cosine law — lux distribution on a surface from point/linear source | Source height, candlepower, measurement point           |
| 66  | `power-factor-correction.jsx` | Phasor diagram before/after, capacitor bank sizing, kVAr calculation, tariff savings              | Load kW, initial PF, target PF, tariff rate             |
| 67  | `tariff-structures.jsx`       | Flat rate, two-part, ToD, demand-based — monthly bill calculation and comparison                  | Consumer type, consumption pattern, demand              |
| 68  | `load-curves-factors.jsx`     | Daily load curve, load factor, demand factor, diversity factor — interactive area chart           | Hourly loads, connected loads, max demand               |


---

## 8. Power System Stability & Control (`sims/stability-control/`)


| #   | Simulation                         | What it shows                                                                      | User controls                                       |
| --- | ---------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------- |
| 69  | `swing-equation.jsx`               | Rotor angle (delta) vs time after disturbance, damped/undamped oscillations        | Inertia constant H, damping, mechanical input       |
| 70  | `equal-area-criterion.jsx`         | P-delta curve with accelerating/decelerating areas shaded, critical clearing angle | Pre-fault power, fault type, clearing time          |
| 71  | `power-angle-stability.jsx`        | Pre-fault, during-fault, post-fault P-delta curves, transient stability assessment | Xd, Xd', fault location, clearing angle             |
| 72  | `automatic-generation-control.jsx` | Two-area system, frequency deviation, tie-line power, ACE, governor response       | Load change, droop, bias factor                     |
| 73  | `automatic-voltage-regulator.jsx`  | AVR block diagram with live signals, terminal voltage response to load change      | Gain, time constants, reference voltage             |
| 74  | `load-frequency-control.jsx`       | Governor droop characteristic, frequency vs load, primary/secondary response       | Droop %, system inertia, load step                  |
| 75  | `voltage-stability-pv-curve.jsx`   | PV (nose) curve, loading margin, voltage collapse point                            | Line impedance, load PF, compensation               |
| 76  | `facts-devices.jsx`                | SVC, STATCOM, TCSC — operating principle animation, V-I characteristics            | FACTS type, rating, system voltage, reactive demand |


---

## Folder Structure

```
sims/
├── electric-machines/         (17 simulations)
├── power-electronics/         (12 simulations)
├── power-systems/             (8 simulations)
├── protection/                (9 simulations)
├── high-voltage/              (6 simulations)
├── transmission-distribution/ (9 simulations)
├── utilization/               (7 simulations)
├── stability-control/         (8 simulations)
└── examples/                  (2 existing demos)
```

**Total: 76 simulations + 2 existing examples**

## Implementation Approach

Each simulation JSX file will follow a consistent structure:

- **Top section**: Animated canvas or SVG visualization of the physical system
- **Bottom panel**: Controls (sliders, toggles, dropdowns) with labeled parameters
- **Sidebar or overlay**: Live equations with current values substituted, key results highlighted
- **Self-contained**: All inline styles, no external CSS dependencies

Build order: one category at a time, starting with whichever group is highest priority.