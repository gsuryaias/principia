High Voltage Engineering Simulations — Build Plan

Two Architecture Changes (apply to ALL simulations going forward)

1. Tabbed Interface Inside Every Simulation

Every simulation will have a top-level tab bar with two tabs:

[ Simulate ]  [ Theory ]

Simulate tab: The interactive visualization + controls

Theory tab: Scrollable content with concept explanation, key equations (rendered with styled spans, not LaTeX), annotated SVG diagrams, real-world context boxes

The tab bar will be a reusable pattern baked into each JSX file (self-contained, no shared components). Styled as pill tabs at the top of the simulation container.

2. Real-World Indian Power System Context

All simulations use real equipment ratings, insulation levels, and standards from Indian practice:

- BIL (Basic Insulation Level) values per IS/IEC 60071 for each voltage class (400 kV: 1425 kV BIL, 220 kV: 950 kV, 132 kV: 650 kV, 33 kV: 170 kV)
- Standard lightning impulse 1.2/50 us per IS 2071
- Indian atmospheric conditions (temperature, humidity, altitude corrections for HV equipment)
- CPRI (Central Power Research Institute, Bangalore) testing standards
- Surge arrester specifications per IS/IEC 60099
- XLPE and oil-paper cable insulation as used in Indian installations
- CEA Technical Standards for construction of electrical installations


Simulation #0 — Flagship: HV Insulation Design Workbench

File: sims/high-voltage/insulation-workbench.jsx

This is the centerpiece — an interactive tool for designing insulation coordination for a complete substation, from lightning strike to equipment protection.

Simulate tab:

A substation single-line diagram with incoming overhead line, surge arrester, transformer, and bus:

Lightning strike simulation:
1. Lightning strikes the overhead line (animated bolt hitting conductor)
2. Voltage surge wave travels along the line toward the substation (animated pulse propagation)
3. Surge meets surge arrester — arrester clamps voltage (V-I characteristic shown)
4. Residual surge reaches transformer — must be below BIL
5. Protection margin displayed: (BIL - arrester residual voltage) / arrester residual voltage × 100%

User can adjust: lightning severity, arrester rating, equipment BIL, distance from arrester to equipment

If protection margin is insufficient: transformer BIL is exceeded → insulation failure animation (flashover arc)

Insulation coordination diagram: voltage levels stacked:
- Lightning overvoltage (top)
- Switching overvoltage
- Arrester protective level
- Equipment BIL (must be above arrester level with margin)
- System maximum operating voltage (MCOV)

Controls: system voltage (33/132/220/400 kV), lightning impulse magnitude (kV crest), arrester rating and class, equipment BIL, distance to protected equipment, arrester lead length

Live readouts: incoming surge magnitude, arrester discharge current, clamped voltage, residual surge at equipment, protection margin %, pass/fail assessment

Theory tab:

- Overvoltage classification: temporary (power frequency), switching (slow front), lightning (fast front), very fast front (GIS)
- Insulation coordination philosophy: ensure equipment insulation withstands all expected overvoltages with adequate margin
- Protection chain: overhead ground wire → surge arrester → equipment BIL → insulation margin
- Statistical approach: BIL chosen such that probability of failure < 10^-4 per year
- Indian standards: IS/IEC 60071-1 (definitions), 60071-2 (application guide)
- PGCIL insulation coordination practice for 400 kV substations
- Altitude correction: Indian substations at high altitude (Leh, Shimla) need higher insulation due to lower air density


Simulations #1-6 — Individual HV Topics

#1: Paschen's Law

File: sims/high-voltage/paschen-law.jsx

Simulate: Interactive Paschen curve — breakdown voltage (Vb) plotted against pd (pressure × gap distance):

The U-shaped curve shows:
- Left side (low pd): few gas molecules in gap, electrons travel far without collision, breakdown voltage is high (difficult to break down)
- Minimum point: optimal pd for breakdown — minimum voltage needed (Paschen minimum)
- Right side (high pd): many molecules, frequent collisions produce avalanche easily but electrons lose energy between collisions — voltage rises again but more gradually

Three gas types selectable: Air, SF6, Nitrogen — each with different curve shape and Paschen minimum location. SF6 curve is much higher (better insulating gas — requires much higher voltage to break down at same pd).

Animated breakdown process:
1. Below breakdown: occasional electron crosses gap but dies out (no sustained avalanche)
2. At breakdown: electron avalanche develops (Townsend mechanism animation) — single electron creates cascade → streamer → arc
3. Above breakdown: immediate arc formation

Townsend's first coefficient (alpha) visualization: number of ionizations per unit length — increases with E/p. At critical value, self-sustaining discharge occurs.

Controls: gas type (air/SF6/N2/CO2), pressure (0.01-10 atm), gap distance (0.1-100 mm), applied voltage, temperature

Live readouts: pd product, breakdown voltage from Paschen curve, actual applied voltage, breakdown margin, alpha coefficient, Paschen minimum point (pd_min, Vb_min)

Theory tab:
- Paschen's Law: Vb = f(pd) — breakdown voltage depends only on the product of pressure and gap distance (not individually)
- Physical basis: pd determines the number of mean-free-paths in the gap → determines avalanche probability
- Townsend breakdown mechanism:
  1. Primary ionization by electron impact (alpha process)
  2. Secondary emission from cathode by ion/photon impact (gamma process)
  3. Self-sustaining condition: gamma × (e^(alpha×d) - 1) = 1
- Paschen minimum: occurs at pd ≈ 1 Torr·cm for air (Vb_min ≈ 327 V)
- Streamer (Kanal) mechanism: at higher pressures, space charge distortion creates conducting channel faster than Townsend process — relevant for practical gap sizes
- SF6 superiority: high electronegativity — captures free electrons, preventing avalanche. At 1 atm: SF6 dielectric strength ≈ 2.5× air. Used in GIS (Gas Insulated Switchgear) and SF6 circuit breakers.
- Real-world context: 
  * GIS in India: PGCIL 400 kV GIS at urban substations (Mumbai, Delhi) — SF6 at 4-5 atm
  * Altitude correction: Paschen curve shifts at reduced pressure (high altitude) — IS/IEC 60071-2 correction factor (1% per 100m above 1000m). Relevant for substations in Himachal Pradesh, Uttarakhand, Ladakh
  * CPRI Bangalore performs HV breakdown testing per IS 2071
  * Vacuum switchgear: operates at very low pd (left side of Paschen curve — extremely high breakdown strength)

#2: Lightning and Switching Surge Waveforms

File: sims/high-voltage/lightning-surge-waveform.jsx

Simulate: Interactive waveform generator for standard impulse voltages:

Two standard waveforms:

1. Lightning Impulse (1.2/50 us):
- Double exponential waveform: V(t) = V0 × (e^(-alpha×t) - e^(-beta×t))
- Front time T1 = 1.2 us (time to reach crest)
- Tail time T2 = 50 us (time to drop to 50% of crest)
- Waveform plotted with time markers for 30% and 90% points (which define T1)
- Tolerance bands shown: T1 = 1.2 ± 30%, T2 = 50 ± 20%

2. Switching Impulse (250/2500 us):
- Slower front, longer duration — represents switching surge from breaker operation
- Front time T1 = 250 us
- Tail time T2 = 2500 us

Chopped wave demonstration: a sphere gap or rod gap placed across the waveform. At a set voltage level, the gap breaks down — waveform abruptly chops to zero (front-of-wave chop or tail chop). Shows different stress on insulation (chopped waves are actually more severe in some cases).

Impulse generator circuit (Marx generator):
- Animated circuit showing capacitors charging in parallel, then switching to series (via triggered spark gaps)
- N stages × Vc per stage = N × Vc output voltage
- Waveshaping: Rf (front resistance), Rt (tail resistance), Cs (stage capacitance), Cl (load capacitance)

Controls: waveform type (lightning/switching), peak voltage (kV), front time, tail time, number of Marx stages, stage capacitance, front/tail resistance, chopping gap toggle and setting

Live readouts: peak voltage, front time (measured 30-90%), tail time (measured 50%), time-to-chop, waveform parameters match standard (pass/fail)

Theory tab:
- Why standard waveforms: real lightning has variable shape — standard waveform allows repeatable testing. IEC 60060-1 / IS 2071 defines the standard shapes.
- Lightning impulse 1.2/50: represents the voltage stress from a lightning strike reaching equipment. Front time stress tests turn-to-turn insulation, tail time tests main insulation.
- Switching impulse 250/2500: represents switching transients (breaker operation, line energization). More critical for EHV (>220 kV) where switching impulse determines insulation design rather than lightning.
- BIL (Basic Insulation Level) vs SIL (Switching Impulse Level): BIL is lightning test voltage, SIL is switching test voltage. For 400 kV: BIL = 1425 kV, SIL = 1050 kV.
- Marx generator: Erwin Marx's invention (1924) — charging n capacitors in parallel through resistors, discharging in series through spark gaps. Multiplication factor = n.
- Waveshaping: double exponential circuit analysis — Rf controls front time (T1), Rt controls tail time (T2)
- Real-world context:
  * CPRI Bangalore and ERDA Vadodara have impulse generators for type testing of Indian transformers and switchgear
  * BHEL Bhopal has 2400 kV impulse generator for testing 400 kV transformers
  * Every power transformer delivered to PGCIL/AP Transco must pass impulse test at rated BIL
  * Lightning performance of transmission lines: PGCIL 400 kV lines designed for 1 in 400 years outage rate
  * Back flashover: lightning hits tower → tower potential rises → flashover from tower to conductor (reverse direction)

#3: Travelling Waves

File: sims/high-voltage/travelling-waves.jsx

Simulate: A horizontal transmission line representation with a voltage pulse propagating along it:

Wave propagation animation:
- A voltage step or impulse launched from the left end
- Pulse travels at velocity v = 1/sqrt(LC) (≈ speed of light for overhead lines, ≈ 0.5c for cables)
- When pulse reaches a junction (impedance discontinuity), it splits into:
  * Reflected wave: travels back toward source
  * Refracted (transmitted) wave: continues into new medium

Junction types (user-selectable):
1. Open end: full reflection, same polarity (voltage doubles). Current reflected with opposite polarity (current = 0 at open end).
2. Short circuit: full reflection, opposite polarity (voltage = 0 at short). Current doubles.
3. Matched impedance: no reflection (Z_load = Z0), complete absorption
4. Impedance mismatch: partial reflection. Coefficient: rho = (Z2 - Z1)/(Z2 + Z1)

Lattice diagram: time-distance plot showing all reflections at both ends as the wave bounces back and forth, attenuating each time. Voltage at any point = sum of all arriving waves at that time.

Practical scenario: overhead line (Z0 = 400 ohm) meets cable (Z0 = 40 ohm):
- Large impedance change
- Reflected wave coefficient = (40-400)/(40+400) = -0.9 (large negative reflection)
- Transmitted voltage = 2 × 40/(40+400) = 0.2 of incident (voltage steps down)
- But cable is short → wave reaches far end → reflects again → buildup effect

Bewley lattice diagram automatically drawn as waves propagate

Controls: surge impedance of section 1 and section 2, termination type (open/short/resistive/cable), incident wave shape (step/impulse), propagation velocity, line length, simulation speed

Live readouts: incident wave voltage/current, reflected wave voltage/current, refracted wave voltage/current, reflection coefficient, refraction coefficient, voltage at junction vs time

Theory tab:
- Wave equation: d²V/dx² = LC × d²V/dt² — solutions are forward and backward travelling waves
- Surge impedance: Z0 = sqrt(L/C) — characteristic impedance of the line. For overhead lines: ~400 ohm (depends on conductor height and spacing). For cables: ~40-60 ohm.
- Reflection coefficient: rho = (Z2-Z1)/(Z2+Z1). Ranges from -1 (short circuit) to +1 (open circuit). Zero for matched load.
- Refraction coefficient: tau = 2Z2/(Z2+Z1). Always positive. If Z2 > Z1, voltage increases (dangerous for equipment).
- Voltage doubling at open end: V = Vi + Vr = Vi + Vi = 2Vi. This is why open-circuited lines are dangerous during switching.
- Attenuation: real lines have resistance and conductance — waves attenuate and distort as they travel
- Bewley lattice diagram: systematic graphical method to track all reflections at multiple junctions
- Real-world context:
  * Lightning surge on PGCIL 400 kV line travels at ≈ 300 m/us. For a 200 km line, transit time ≈ 0.67 ms. Multiple reflections can cause voltage buildup at transformer terminals.
  * Overhead line to cable transition at substation entrance (common in Indian urban substations — PGCIL uses cable entry for 220/400 kV in Mumbai, Delhi). Z0 changes drastically → large reflections → surge arrester placement critical at transition point.
  * GIS (Gas Insulated Switchgear): very fast transients (VFT) — nanosecond rise time surges inside GIS from disconnector switching. Unique to GIS installations becoming common in India.
  * PGCIL surge arrester placement: at line entrance to substation, at transformer terminals, at cable-overhead junctions

#4: Insulation Coordination

File: sims/high-voltage/insulation-coordination.jsx

Simulate: Interactive insulation coordination diagram for a complete substation:

Stacked voltage level diagram (vertical bar chart style):
- System maximum continuous operating voltage (Um) — base level
- Temporary overvoltage (TOV) — power frequency, 1.5-2.0 pu
- Switching overvoltage — slow front, 2.0-3.5 pu
- Lightning overvoltage — fast front, 3.0-10+ pu
- Surge arrester protective level (lightning) — the clamping voltage
- Surge arrester protective level (switching) — lower clamping for slower surges
- Equipment BIL — must be above arrester protective level with margin
- Equipment SIL — must be above arrester switching protective level with margin

Protection margins:
- Lightning margin: (BIL - arrester lightning protective level) / arrester lightning protective level × 100%
- Switching margin: (SIL - arrester switching protective level) / arrester switching protective level × 100%
- Required margins: ≥ 20% for lightning, ≥ 15% for switching (per IEC 60071)

Arrester V-I characteristic: nonlinear curve showing voltage vs discharge current. At low current (normal voltage): high impedance, no conduction. At surge: low impedance, clamps voltage. After surge: returns to high impedance.

Equipment withstand vs stress comparison: probability curves (statistical approach) — stress probability (Gaussian) must not overlap with strength probability. BIL chosen so overlap is negligible (10^-4 risk).

Controls: system voltage class (33/132/220/400 kV), arrester class and rating, equipment BIL/SIL, overvoltage magnitudes, arrester discharge current

Live readouts: protection margins (lightning and switching), overvoltage levels, arrester residual voltage, coordination assessment (adequate/inadequate)

Theory tab:
- Insulation coordination: the process of selecting insulation strength for all equipment such that flashover/failure occurs only at predetermined points (spark gaps/arresters) and not at expensive equipment (transformers)
- Deterministic method (conventional): BIL = K × arrester protective level, where K = 1.2-1.4 (20-40% margin)
- Statistical method (modern): considers probability distributions of both overvoltage (stress) and insulation strength. Allows more economic insulation design.
- Surge arrester: the key protective device. Modern metal oxide (ZnO) arresters have superior V-I characteristic compared to old SiC (gapped) arresters.
- Self-protecting insulation: external air insulation (flashover restores itself) vs non-self-restoring (transformer oil/paper insulation — failure is permanent)
- Clearances: air clearance requirements in Indian substations per IS/IEC 60071-2:
  * 400 kV: phase-to-earth = 3.4m, phase-to-phase = 4.2m
  * 220 kV: phase-to-earth = 2.1m, phase-to-phase = 2.4m
  * 132 kV: phase-to-earth = 1.1m, phase-to-phase = 1.4m
- Real-world context:
  * PGCIL 400 kV insulation coordination: BIL = 1425 kV (standard) or 1550 kV (high altitude), arrester rating = 336 kV (Ur), arrester protective level = 823 kV at 10 kA → margin = (1425-823)/823 = 73% (very conservative for Indian conditions)
  * Pollution severity: Indian coastal areas (Vizag, Chennai, Mumbai) need higher creepage distance on insulators due to salt pollution. IS/IEC 60815 pollution classes.
  * CPRI performs pollution testing of insulators
  * Altitude correction for Himalayan substations (Bhutan interconnection, NE India grid)

#5: Electric Field Stress Grading

File: sims/high-voltage/electric-field-grading.jsx

Simulate: Cross-section of a high-voltage cable showing concentric layers:

Radial stress distribution visualization:
- Conductor (inner radius r) at high voltage V
- Insulation (between r and R) — electric stress varies inversely with radius: E(x) = V / (x × ln(R/r))
- Sheath (outer radius R) at ground potential

Stress plotted as a curve from r to R: highest at conductor surface, lowest at sheath — the non-uniform distribution is the fundamental problem (inner insulation is overstressed, outer is underutilized).

Two grading methods animated:

1. Capacitance Grading:
- Multiple insulation layers with decreasing permittivity from inside to outside
- Higher permittivity near conductor (concentrates capacitance where stress is high) → equalizes stress distribution
- User adjusts permittivity of each layer → stress curve flattens
- Ideal grading: perfectly uniform stress (maximum insulation utilization)

2. Intersheath Grading:
- Metallic sheaths inserted between insulation layers at calculated voltages
- Each section carries a fraction of total voltage
- Stress in each section is more uniform
- Capacitance of each section must be equal (for voltage division)
- User adds intersheaths and sets voltages → stress distribution improves

3. No Grading (comparison): single insulation material → maximum stress at conductor surface = V / (r × ln(R/r))

Stress margin: maximum stress vs dielectric strength of insulation material — if exceeded, partial discharge begins (animated)

Controls: conductor radius, insulation outer radius, applied voltage, number of insulation layers (for capacitance grading), number of intersheaths, permittivity values for each layer, intersheath voltages

Live readouts: maximum stress (kV/mm), minimum stress, stress ratio (max/min), average stress, insulation utilization factor (avg/max), grading efficiency

Theory tab:
- Why grading matters: without grading, insulation near the conductor is stressed far more than outer insulation. To withstand the maximum stress everywhere, total insulation thickness must be much larger than theoretically needed → expensive, bulky cable.
- Stress formula (single dielectric): E(x) = V / (x × ln(R/r)). Maximum at x = r (conductor surface): E_max = V / (r × ln(R/r)).
- Capacitance grading: if epsilon varies as 1/x (ideal), stress becomes uniform = V / (R - r). In practice: use 2-3 layers with decreasing permittivity. Materials: oil-paper (epsilon ≈ 3.5), PVC (epsilon ≈ 4-5), rubber (epsilon ≈ 5-6).
- Intersheath grading: divide insulation into n sections with n-1 intersheaths. Each intersheath at calculated voltage: V_k = V × C_total / C_k. Capacitances must be equalized. Practical difficulty: maintaining intersheath voltages.
- Modern practice: XLPE cables use single insulation material (no grading) but semiconducting screens at conductor and insulation surfaces to smooth the stress distribution and eliminate air pockets (partial discharge prevention).
- Real-world context:
  * Indian cable practice: XLPE cables up to 220 kV manufactured by Polycab, Universal Cables, KEI, Havells. 400 kV XLPE cables imported (Nexans, Prysmian) for PGCIL underground installations.
  * Mumbai 220 kV underground cable network (Tata Power/AEML) uses XLPE cables with stress control layers.
  * Oil-filled cables still in service at some older installations (Delhi, Kolkata).
  * Cable terminations and joints: stress control is most critical at these points (geometric discontinuity). Prefabricated stress cones used.
  * CPRI performs partial discharge testing on cables per IS/IEC 60840 (HV cables) and IEC 62067 (EHV cables).

#6: Sphere Gap Measurement

File: sims/high-voltage/sphere-gap.jsx

Simulate: Two metallic spheres facing each other with adjustable gap:

Visual: 3D-perspective rendered spheres with the air gap between them. As voltage increases:
1. Low voltage: electric field lines drawn between spheres (nearly uniform for gap < 0.5 × diameter)
2. Approaching breakdown: field intensifies (lines crowd together at nearest points)
3. At breakdown voltage: spark jumps across gap (animated arc/spark)
4. Post-breakdown: arc extinguished when voltage removed

Breakdown voltage vs gap distance curve: plotted for the selected sphere diameter. The relationship is nearly linear for small gaps (gap/diameter < 0.5).

Atmospheric correction:
- Standard conditions: 20 deg C, 101.3 kPa (760 mmHg), 11 g/m^3 humidity
- Correction factor: delta = (0.386 × p) / (273 + t) where p is pressure in mmHg, t is temperature in deg C
- Corrected breakdown: Vb = Vb_standard × delta × k_h (humidity correction)

Field uniformity factor: for sphere gap, field is nearly uniform if gap < 0.5D (D = sphere diameter). This is why sphere gaps are used as measurement standards — the breakdown voltage is predictable.

Irradiation: UV or radioactive source (cobalt-60) used to provide initial electrons for consistent breakdown — without irradiation, breakdown may be erratic. Toggle to show effect.

Controls: sphere diameter (5-200 cm), gap distance (0.5-100 cm), applied voltage, temperature, pressure, humidity, irradiation toggle, voltage type (AC/DC/impulse)

Live readouts: breakdown voltage (standard), atmospheric correction factor, corrected breakdown voltage, gap/diameter ratio, field uniformity indicator, measurement uncertainty %

Theory tab:
- Sphere gap as measurement standard: because the near-uniform field gives predictable, reproducible breakdown voltage — used to calibrate HV measurement systems
- IS/IEC 60052: standard for sphere gap measurement of high voltages
- Standard sphere diameters: 2, 5, 10, 15, 25, 50, 75, 100, 150, 200 cm — larger spheres for higher voltages
- Accuracy: ±3% for AC and DC, ±5% for impulse — when used within specified gap/diameter ratios
- Gap/diameter ratio limits: 0.05 to 0.5 for accurate measurement (beyond 0.5, field becomes non-uniform)
- Voltage types: peak AC voltage measurement (breakdown at peak of AC), DC voltage measurement, impulse (50% flashover voltage — statistical)
- Atmospheric correction: IS 2071 / IEC 60060-1 correction formulas. Important in India due to temperature variation (0 deg C in Kashmir to 50 deg C in Rajasthan) and altitude variation (sea level in Mumbai to 3500m in Leh).
- Real-world context:
  * CPRI Bangalore has standard sphere gaps for calibration of HV test equipment
  * Every HV testing laboratory in India (BHEL Bhopal, Hyderabad, ERDA Vadodara) uses sphere gaps as reference
  * Sphere gaps also used as protective devices (triggered sphere gaps in impulse generators — Marx generator stage gaps)
  * Rod gaps: alternative for rough voltage estimation, but non-uniform field gives less accurate results
  * Digital HV dividers have largely replaced sphere gaps for routine measurement, but sphere gaps remain the ultimate calibration reference per IS/IEC standards


Build Order

Build the flagship first — it establishes the insulation coordination visual framework that puts individual topics in context.

Phase 1 — Fundamentals (3 sims)
1. insulation-workbench.jsx — flagship insulation coordination simulator (sets the template)
2. paschen-law.jsx — foundational gas breakdown physics
3. lightning-surge-waveform.jsx — standard test waveforms, links to impulse testing

Phase 2 — Wave Propagation & Protection (2 sims)
4. travelling-waves.jsx — how surges travel on lines (connects to insulation coordination)
5. insulation-coordination.jsx — detailed coordination design (builds on all previous)

Phase 3 — Field Analysis & Measurement (2 sims)
6. electric-field-grading.jsx — cable insulation stress management
7. sphere-gap.jsx — HV measurement technique

Total: 7 simulations in sims/high-voltage/
