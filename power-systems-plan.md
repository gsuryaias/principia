Power Systems Analysis Simulations — Build Plan

Two Architecture Changes (apply to ALL simulations going forward)

1. Tabbed Interface Inside Every Simulation

Every simulation will have a top-level tab bar with two tabs:

[ Simulate ]  [ Theory ]

Simulate tab: The interactive visualization + controls

Theory tab: Scrollable content with concept explanation, key equations (rendered with styled spans, not LaTeX), annotated SVG diagrams, real-world context boxes

The tab bar will be a reusable pattern baked into each JSX file (self-contained, no shared components). Styled as pill tabs at the top of the simulation container.

2. Real-World Indian Power System Context

All simulations use real voltage levels, ratings, and system parameters from the Indian grid:

- Standard base values: 100 MVA system base (CERC convention), voltage bases at each level (400 kV, 220 kV, 132 kV, 33 kV, 11 kV)
- Real system data: PGCIL 400 kV network, AP Transco 220/132 kV network, DISCOM 33/11 kV
- Generator parameters from NTPC/BHEL units (500 MW, 21 kV, Xd, Xd', Xd'' values)
- Transformer impedances from actual Indian grid equipment (8-15% on own MVA base)
- Load flow data: typical Indian bus voltages (0.95-1.05 pu), power factor (0.85-0.95 lag)
- Fault levels: typical Indian grid fault levels (40 kA at 400 kV bus, 25 kA at 220 kV)
- IEGC and CERC regulations for voltage and frequency limits


Simulation #0 — Flagship: Interactive Power Network Analyzer

File: sims/power-systems/network-analyzer.jsx

This is the centerpiece — a drag-and-drop power system network builder with live analysis.

Simulate tab:

Canvas-based network editor where user builds a power system:
- Drag components from a palette: generator, transformer, transmission line, load, bus, shunt capacitor, shunt reactor
- Connect them by drawing lines between buses
- Each component has editable parameters (click to set rating, impedance, etc.)

Once network is built:
- Toggle between analysis modes: Load Flow | Symmetrical Fault | Unsymmetrical Fault
- Load flow: bus voltages, line flows, losses shown on the diagram (color-coded voltage magnitude — green for normal, yellow for low, red for critical)
- Fault: click on any bus to place a fault, see fault currents flow (animated), voltage collapse at faulted bus

Pre-built example networks:
- IEEE 9-bus system
- Simple 5-bus Indian grid model (NTPC plant → 400 kV bus → 220 kV → 132 kV → 33 kV → 11 kV load)

Controls: component palette, analysis type selector, solve button, reset, load pre-built network

Live readouts: bus voltage table, line flow table, total generation/load/losses, convergence status

Theory tab:

- Overview of power system analysis — why we need it (planning, operation, protection)
- Per-unit system: why it simplifies analysis (eliminates transformer turns ratios, normalizes comparison)
- Network modeling: how each component is represented (generators, lines, transformers, loads)
- Solution methods: iterative approaches required because power flow equations are nonlinear
- Indian power system structure: CTU (PGCIL), STU (Transco), distribution utilities
- CERC/SERC regulatory framework for system planning studies
- What a real load flow study report looks like (PGCIL system study format)


Simulations #1-2 — Fundamentals

#1: Per-Unit System

File: sims/power-systems/per-unit-system.jsx

Simulate: Interactive unit converter with cascading calculations:

Two-panel layout:
- Left panel: Actual values entry (voltage in kV, current in A, impedance in ohms, power in MVA/MW)
- Right panel: Per-unit values (auto-calculated)

Base value chain: user sets base MVA (e.g., 100 MVA) and base kV at one voltage level. All other bases auto-compute:
- Ibase = Sbase / (sqrt(3) × Vbase)
- Zbase = Vbase^2 / Sbase
- At each transformer, Vbase changes but Sbase remains constant

Multi-voltage level visualization: a single-line diagram with transformer connecting two voltage levels. Impedance shown in ohms on each side, then converted to per-unit — same pu value on both sides (this is the key insight, animated to emphasize).

Transformer impedance conversion: given Zt on old base (own rating), convert to new system base — formula shown live: Zpu(new) = Zpu(old) × (Sbase_new/Sbase_old) × (Vbase_old/Vbase_new)^2

Controls: base MVA, base kV at each level, actual component values (generator Xd, transformer Z%, line impedance in ohms/km × length), toggle between actual and per-unit display

Live readouts: all base values at each voltage level, per-unit impedances, actual impedances, per-unit diagram vs actual diagram toggle

Theory tab:
- Why per-unit: eliminates turns ratios, impedances become comparable across voltage levels, fault currents ≈ 1/Zpu (simple mental estimation)
- Four base quantities: Sbase, Vbase, Ibase, Zbase — only two are independent (Sbase and Vbase chosen)
- Single-phase vs three-phase convention (3-phase uses line-line voltage, 3-phase power)
- Base value calculation: Zbase = Vbase^2 / Sbase, Ibase = Sbase / (sqrt(3) × Vbase)
- Changing base: Zpu_new = Zpu_old × (MVA_new/MVA_old) × (kV_old/kV_new)^2
- Typical per-unit values in practice: generator Xd = 1.0-2.0 pu, Xd' = 0.2-0.35 pu, transformer Z = 0.08-0.15 pu, transmission line Z = 0.01-0.05 pu/km
- Real-world context: standard base used in Indian system studies — 100 MVA base (CERC), voltage bases match nominal levels. PGCIL protection setting calculations all done in per-unit. AP Transco system study examples.
- Common mistake: forgetting to convert to common base before analysis

#2: Bus Admittance Matrix (Ybus)

File: sims/power-systems/bus-admittance-matrix.jsx

Simulate: Interactive network builder for small power systems (2-6 buses):

Left: single-line diagram with buses as nodes, lines as connections. User adds/removes buses and lines, sets line impedances.

Right: Ybus matrix displayed, updating live as network changes.

Step-by-step build mode: user adds one line at a time, matrix updates incrementally — shows which elements change:
- Diagonal (Yii): sum of all admittances connected to bus i (self-admittance) — highlights affected diagonal element
- Off-diagonal (Yij): negative of admittance between bus i and j (mutual admittance) — highlights affected off-diagonal elements

Properties demonstrated:
- Symmetry: Yij = Yji (highlighted when adding a line)
- Sparsity: zero elements where no direct connection exists (grayed out)
- Diagonal dominance: Yii is largest in magnitude in each row

Toggle: show Ybus as admittance values or impedance values. Switch between rectangular (G+jB) and polar (Y∠theta) forms.

Singularity check: before adding a reference bus, matrix is singular (determinant = 0). After designating a slack bus, system is solvable.

Controls: add/remove bus, add/remove line (select two buses, enter Z), add shunt element (to ground), view format (admittance/impedance, rectangular/polar)

Live readouts: Ybus matrix, determinant, bus count, branch count, sparsity %

Theory tab:
- Why Ybus: the node admittance matrix relates bus currents and voltages — I = Y × V
- Formation by inspection: fast method for building Ybus from network topology
- Diagonal elements: Yii = sum of all admittances connected to bus i (including shunt elements)
- Off-diagonal elements: Yij = -yij (negative of series admittance between bus i and j)
- Singular matrix transformation: how removing slack bus row/column makes the system solvable
- Zbus (bus impedance matrix): Zbus = Ybus^-1, used for fault analysis (why direct inversion is expensive for large systems — LU factorization preferred)
- Sparsity: real power systems are very sparse (~3-5 connections per bus out of hundreds) — sparse matrix techniques critical for efficiency
- Real-world context: Indian grid Ybus is a massive sparse matrix (thousands of buses). PGCIL uses PSS/E, PowerWorld, and ETAP for system studies. AP Transco 220 kV network has ~50 buses. Typical line impedance: 0.01+j0.04 pu/km for 220 kV ACSR Zebra.


Simulations #3-5 — Load Flow Analysis

#3: Gauss-Seidel Load Flow

File: sims/power-systems/gauss-seidel-load-flow.jsx

Simulate: A 3-5 bus power system with single-line diagram:

Iteration display: a table showing bus voltages at each iteration:
- Column headers: Bus 1 (Slack) | Bus 2 (PV) | Bus 3 (PQ) | Bus 4 (PQ) ...
- Row headers: Iteration 0 (initial guess) | Iteration 1 | Iteration 2 | ...
- Values color-coded: red when far from convergence, transitioning to green as they settle

On the single-line diagram: bus voltage magnitudes shown as bar heights, updating at each iteration. Line power flows appear as arrows (animated, thickness proportional to MW flow).

Convergence plot: maximum mismatch vs iteration number — shows the slow, linear convergence characteristic of GS

Acceleration factor demo: with alpha = 1.0 (no acceleration) vs alpha = 1.4-1.6 (optimal range) — convergence speed comparison

Step mode: user clicks "Next Iteration" to step through one iteration at a time, seeing the formula applied at each bus:
Vi^(k+1) = (1/Yii) × [Pi - jQi)/Vi^(k)* - sum(Yij × Vj)]

Controls: network topology (preset 3-bus, 5-bus, IEEE 9-bus), bus types (slack/PV/PQ assignment), P and Q specified values, initial voltage guess, acceleration factor, convergence tolerance

Live readouts: bus voltages (magnitude and angle), line flows (P and Q), total losses, mismatch at each bus, iteration count

Theory tab:
- Load flow problem: given P,Q at load buses and P,V at generator buses, find all bus voltages
- Why iterative: power equations are nonlinear (P = V^2 Y cos... — products of unknowns)
- Gauss-Seidel formula derivation from power balance equation at each bus
- Bus type classification:
  * Slack (swing) bus: V and theta specified, P and Q calculated (balances system)
  * PV bus: P and V specified, Q and theta calculated (generators)
  * PQ bus: P and Q specified, V and theta calculated (loads)
- Acceleration factor: over-relaxation to speed convergence, typical alpha = 1.4-1.6
- Convergence criteria: |Vi^(k+1) - Vi^(k)| < tolerance (typically 0.0001 pu)
- Limitations: slow convergence (linear), may not converge for ill-conditioned systems
- Real-world context: GS is rarely used in practice now (replaced by NR) but excellent for understanding the iterative concept. Indian system studies historically used GS in early computerization (1970s-80s at CEA). Now PSS/E and MiPower (Indian software by PRDC, Bangalore) use NR.

#4: Newton-Raphson Load Flow

File: sims/power-systems/newton-raphson-load-flow.jsx

Simulate: Same network as GS simulation, but solved with Newton-Raphson:

Jacobian matrix display: the 2n×2n matrix [J1 J2; J3 J4] shown with elements updating each iteration:
- J1 = dP/dtheta
- J2 = dP/dV
- J3 = dQ/dtheta
- J4 = dQ/dV

Mismatch vectors: [deltaP; deltaQ] shown as bar charts — tall bars initially (large mismatch), collapsing rapidly to near-zero within 3-5 iterations

Convergence comparison: GS and NR convergence plots side-by-side on the same axes — NR shows quadratic convergence (mismatch drops dramatically each iteration), GS shows linear (slow, steady decline)

Step mode: user steps through iterations:
1. Compute mismatch: deltaP, deltaQ at each bus
2. Form Jacobian: J elements computed
3. Solve: [dtheta; dV] = J^-1 × [deltaP; deltaQ]
4. Update: V^(k+1) = V^(k) + dV, theta^(k+1) = theta^(k) + dtheta
5. Check convergence

Network diagram updates at each iteration showing voltages and flows converging

Controls: same as GS (network, bus types, specifications), plus flat start vs warm start toggle, tolerance

Live readouts: bus voltages, line flows, losses, Jacobian matrix, mismatch values, iteration count, convergence status

Theory tab:
- Newton-Raphson: Taylor series linearization of nonlinear power equations, solve linearized system, repeat
- The Jacobian: matrix of partial derivatives — describes sensitivity of P,Q to changes in V,theta
- Why quadratic convergence: each iteration uses current gradient information (not just the function value like GS)
- Typical convergence: 3-5 iterations regardless of system size (a major advantage)
- Fast Decoupled Load Flow: simplified NR that exploits P-theta and Q-V coupling (J2 and J3 are small), fewer computations per iteration, widely used
- Comparison table: GS vs NR vs FDLF (convergence speed, computation per iteration, robustness)
- Real-world context: NR is the industry standard for load flow. PGCIL uses PSS/E (Siemens PTI) with NR solver. Indian software MiPower (PRDC Bangalore) and ETAP also use NR. Typical Indian system study: 400 kV PGCIL network with 500+ buses converges in 4-5 NR iterations.
- CERC regulation: system studies mandatory for all new generator/transmission additions

#5: Bus Type Concepts

File: sims/power-systems/bus-type-concepts.jsx

Simulate: Interactive 4-bus system with user-assignable bus types:

Each bus displayed as a large card showing:
- Bus type icon (generator for slack/PV, load arrow for PQ)
- Specified quantities (bold, user-editable): depends on bus type
- Computed quantities (shown after solving): the unknowns that load flow calculates

Bus type assignment: drag-and-drop or click to change any bus to Slack, PV, or PQ
- When changed, the specified/unknown quantities swap — visually animated

System rules enforced:
- Exactly ONE slack bus required (warning if zero or more than one)
- PV buses: if Q exceeds Qmax or Qmin, bus converts to PQ (Q-limited) — animated conversion with explanation

After solving:
- Each bus shows all four quantities: P, Q, V, theta
- Specified vs calculated quantities color-coded differently
- Generator buses show P-Q operating point on capability curve (if PV)

Reactive power limit demonstration: increase load until a PV bus hits Qmax → bus converts to PQ → voltage drops → system stress visible

Controls: bus type assignment for each bus, P, Q, V specifications, Qmin/Qmax limits for PV buses, solve button

Live readouts: all bus voltages, generation dispatch, load values, total losses, Q limits status

Theory tab:
- Three bus types defined:
  * Slack (Reference/Swing): specifies V and theta (usually theta = 0 deg reference), solves for P and Q. Purpose: balances the system (supplies/absorbs whatever P and Q is needed)
  * PV (Generator/Voltage-controlled): specifies P and V, solves for Q and theta. Purpose: represents generators maintaining voltage via excitation control
  * PQ (Load): specifies P and Q, solves for V and theta. Purpose: represents load buses with known demand
- Why we need a slack bus: total generation = total load + losses. Losses are unknown until solved. One bus must be free to adjust generation to match.
- Q limits on PV buses: real generators have reactive power limits (capability curve). If Q exceeds limit, AVR saturates, voltage can no longer be held → bus becomes PQ
- Physical interpretation: slack bus ≈ large grid connection (infinite bus), PV bus ≈ generator with AVR, PQ bus ≈ passive load
- Real-world context: in Indian system studies, the Northern Regional grid's largest station (e.g., Vindhyachal 4760 MW) is often the slack bus. NTPC plants are PV buses. All 33/11 kV load points are PQ buses. AP Transco planning studies: 400 kV Kurnool bus (connected to PGCIL inter-state network) is typically slack.


Simulations #6-8 — Fault Analysis

#6: Symmetrical (Three-Phase) Fault

File: sims/power-systems/symmetrical-fault.jsx

Simulate: Single-line diagram with a generator connected through a transformer and transmission line to a bus. Fault applied at a bus (user-selectable location).

Fault current waveform: shows the complete transient from fault inception:
- Sub-transient period (0-3 cycles): highest current, governed by Xd'' (sub-transient reactance). AC component + DC offset shown.
- Transient period (3-30 cycles): current decays, governed by Xd' (transient reactance). AC envelope shrinks.
- Steady-state: final sustained fault current, governed by Xd (synchronous reactance). Lowest AC value.

Three envelopes drawn: Xd'' envelope (innermost, highest), Xd' envelope (middle), Xd envelope (outermost, lowest)

DC offset component: exponential decay with time constant Ta = Xd''/(2pi f R). Shown separately and combined with AC component.

Asymmetry: total fault current = AC symmetrical + DC offset. Peak asymmetrical current (making current) at first half-cycle — critical for breaker rating.

Network impedance diagram: for the faulted bus, shows Thevenin equivalent — Vth/Zth = If

Controls: fault bus location, generator parameters (Xd'', Xd', Xd, Ra, time constants Td'', Td'), pre-fault voltage, fault inception angle (affects DC offset magnitude)

Live readouts: sub-transient fault current (kA rms), transient fault current, steady-state fault current, DC offset at any time, peak asymmetrical current (making current), fault MVA

Theory tab:
- Why fault analysis: breaker rating, relay setting, equipment withstand capability
- Symmetrical fault: all three phases faulted equally — balanced, so single-phase equivalent circuit suffices
- Sub-transient reactance Xd'': represents initial flux trapped in damper windings (smallest X, largest I)
- Transient reactance Xd': after damper winding flux decays (larger X, smaller I)
- Synchronous reactance Xd: steady-state (largest X, smallest I — but fault is usually cleared before this)
- DC offset: depends on fault inception angle on voltage wave — maximum when fault occurs at voltage zero crossing
- Asymmetrical current: used for breaker making capacity rating
- Fault MVA = Vbase^2 / Zf (in pu: If = Vpre-fault / Zf)
- Real-world context: Indian grid fault levels — 400 kV buses: 40-50 kA, 220 kV: 25-40 kA, 132 kV: 20-31.5 kA, 33 kV: 16-25 kA. Breaker ratings must exceed these. PGCIL specifies breaker fault ratings in their technical specifications. AP Transco 220 kV breakers rated 40 kA.
- IEC 60909 (international) and IS 13234 (Indian) fault calculation standards

#7: Symmetrical Components

File: sims/power-systems/symmetrical-components.jsx

Simulate: Animated decomposition of unbalanced three-phase phasors:

Left panel: three unbalanced phase phasors (Va, Vb, Vc) — user adjusts magnitude and angle of each independently. Clearly unequal/asymmetric phasors shown.

Right panel: three sets of balanced components extracted:
1. Positive sequence (V1): three equal phasors, 120 deg apart, ABC rotation (normal rotation direction). Shown in blue.
2. Negative sequence (V2): three equal phasors, 120 deg apart, ACB rotation (reverse direction). Shown in red.
3. Zero sequence (V0): three equal phasors, all in phase (no rotation). Shown in green.

Animation: the three sequence components add up phasor-by-phasor to reconstruct the original unbalanced phasors:
Va = Va0 + Va1 + Va2 (animated vector addition)
Vb = Vb0 + Vb1 + Vb2
Vc = Vc0 + Vc1 + Vc2

The operator 'a' (1∠120°) shown as a unit vector that rotates phasors by 120 deg — key mathematical tool

Pre-built scenarios:
- Single-line-to-ground fault (large Va unbalance)
- Line-to-line fault (Vb and Vc equal and opposite shift)
- Open conductor (one phase current = 0)
- Balanced system (only positive sequence exists — V2 = V0 = 0)

Controls: Va, Vb, Vc magnitudes (0-1.5 pu) and angles (0-360 deg), preset scenario buttons

Live readouts: V0, V1, V2 (magnitude and angle), unbalance factor (V2/V1 × 100%), sequence impedances

Theory tab:
- Fortescue's theorem (1918): any unbalanced set of 3 phasors can be resolved into three balanced sets
- Transformation matrix: [V0; V1; V2] = (1/3) × [1 1 1; 1 a a^2; 1 a^2 a] × [Va; Vb; Vc]
- The operator 'a' = 1∠120° = -0.5 + j0.866 — rotates a phasor by 120 deg
- Why it matters: unbalanced problems become three independent balanced problems in sequence domain
- Sequence impedances: Z0 ≠ Z1 ≠ Z2 in general (Z1 = Z2 for static equipment like transformers/lines)
- Generator sequence impedances: Z1 = jXd' (or Xd''), Z2 = jX2 (≈ Xd''), Z0 = jX0 (depends on grounding)
- Zero sequence behavior: depends on transformer connection (delta blocks zero sequence, star-grounded passes it)
- Real-world context: symmetrical components are fundamental to protective relay settings in the Indian grid. Negative sequence relays protect generators (NTPC units have 46-type negative sequence protection). Zero sequence current measurement used for ground fault detection. AP Transco relay setting calculations use sequence impedances from PGCIL data sheets.
- Unbalance limits: IEGC specifies max 2% negative sequence voltage unbalance at 400/220 kV

#8: Unsymmetrical Faults

File: sims/power-systems/unsymmetrical-faults.jsx

Simulate: A power system (generator-transformer-line-bus) with four fault type buttons:

1. LG (Single Line to Ground): most common (~70% of faults). One phase touches ground.
2. LL (Line to Line): two phases short together. ~15% of faults.
3. LLG (Double Line to Ground): two phases to ground. ~10% of faults.
4. 3-Phase (Symmetrical): all three phases. ~5% of faults (already covered, included for comparison).

For each fault type, the simulation shows:

Sequence network interconnection:
- LG: all three sequence networks in series
- LL: positive and negative in parallel (no zero sequence)
- LLG: positive in series with (negative || zero)
- 3-Phase: only positive sequence

The sequence networks are drawn as circuit diagrams with the interconnection animated — networks literally "plug together" based on fault type.

Fault current calculation: sequence currents I0, I1, I2 computed → phase currents Ia, Ib, Ic reconstructed using inverse transformation

Phasor diagrams: phase voltages and currents at faulted bus shown for each fault type — clearly showing the asymmetry

Fault current comparison bar chart: same system, different fault types — which gives highest current (usually LG if solidly grounded, or 3-phase if impedance grounded)

Controls: fault type, fault location (bus selection), fault impedance (Zf — for bolted fault set to 0), grounding method (solidly grounded/impedance grounded/ungrounded), system impedances (Z1, Z2, Z0)

Live readouts: I0, I1, I2 (sequence currents), Ia, Ib, Ic (phase currents in kA), fault MVA, V at faulted bus (per phase)

Theory tab:
- Why unsymmetrical faults matter: most real faults are unsymmetrical — SLG caused by insulator flashover, tree contact, LL by wind-induced conductor clashing
- Boundary conditions for each fault type:
  * LG (phase a to ground): Vfa = 0 (or ZfIfa), Ifb = 0, Ifc = 0
  * LL (phase b to c): Ifb = -Ifc, Vfb = Vfc, Ifa = 0
  * LLG: Vfb = Vfc = 0 (or ZfIf0), Ifa = 0
- Boundary conditions → sequence network interconnection (derivation for each)
- LG fault current: If = 3Ia0 = 3V / (Z1 + Z2 + Z0 + 3Zf) — ground fault current depends heavily on Z0
- Effect of grounding: solidly grounded → high LG fault current (good for relay sensitivity), impedance grounded → limited LG current (reduces touch voltage but harder to detect)
- Ungrounded system: no zero sequence path → LG fault causes voltage rise on healthy phases (1.73x), no fault current but sustained overvoltage
- Real-world context: Indian grid practice — 
  * 400/220/132 kV: solidly grounded (NGR not needed at EHV)
  * 33 kV: sometimes impedance grounded (AP Transco uses NGR at some 33 kV substations)
  * 11 kV: impedance grounded or resonant grounded (Petersen coil) in some DISCOMs
  * Ground fault relay settings: SEL, ABB, Siemens relays use sequence components for fault detection
  * Typical fault statistics on AP Transco 220 kV network: ~60% SLG, ~20% LL, ~15% LLG, ~5% 3-phase


Build Order

Build the flagship first — it establishes the network analysis visual framework that all subsequent simulations reference.

Phase 1 — Fundamentals (3 sims)
1. network-analyzer.jsx — flagship interactive power system workbench (sets the template)
2. per-unit-system.jsx — foundational, every subsequent simulation uses per-unit
3. bus-admittance-matrix.jsx — foundational network representation

Phase 2 — Load Flow (3 sims)
4. gauss-seidel-load-flow.jsx — first load flow method, establishes iterative concept
5. newton-raphson-load-flow.jsx — builds on GS, shows superior convergence
6. bus-type-concepts.jsx — reinforces load flow understanding with bus classification

Phase 3 — Fault Analysis (3 sims)
7. symmetrical-fault.jsx — simplest fault type, introduces transient current concepts
8. symmetrical-components.jsx — mathematical tool needed for unsymmetrical faults
9. unsymmetrical-faults.jsx — builds on both symmetrical fault and sequence components

Total: 9 simulations in sims/power-systems/
