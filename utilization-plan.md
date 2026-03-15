Utilization of Electric Energy Simulations — Build Plan

Two Architecture Changes (apply to ALL simulations going forward)

1. Tabbed Interface Inside Every Simulation

Every simulation will have a top-level tab bar with two tabs:

[ Simulate ]  [ Theory ]

Simulate tab: The interactive visualization + controls

Theory tab: Scrollable content with concept explanation, key equations (rendered with styled spans, not LaTeX), annotated SVG diagrams, real-world context boxes

The tab bar will be a reusable pattern baked into each JSX file (self-contained, no shared components). Styled as pill tabs at the top of the simulation container.

2. Real-World Indian Context

All simulations use real-world Indian parameters, tariff structures, and industry standards:

- Indian Railways electric traction context (25 kV AC, WAP/WAG series locomotives)
- Industrial heating applications in Indian manufacturing (steel, glass, ceramics)
- Indian illumination standards (IS/NBC codes for lighting design)
- Indian electricity tariff structures (APERC, CERC, state-wise tariffs)
- BEE (Bureau of Energy Efficiency) standards and star ratings
- National Building Code of India (NBC 2016) for lighting and electrical installations
- Indian load patterns: agricultural pumping, industrial shift patterns, residential peak hours
- Power factor penalty/incentive schemes from Indian DISCOMs


Simulation #0 — Flagship: Energy Utilization Dashboard

File: sims/utilization/energy-dashboard.jsx

This is the centerpiece — an interactive dashboard showing how electrical energy is consumed across sectors in India, with drill-down into each category.

Simulate tab:

India's electricity consumption breakdown as an interactive Sankey/treemap diagram:
- Total generation → Transmission losses → Distribution losses → End-use sectors
- Sectors: Industrial (42%), Agricultural (18%), Domestic (25%), Commercial (9%), Traction (2%), Others (4%)

Click on any sector to drill down:
- Industrial: motors (70%), heating (15%), lighting (5%), compressed air (5%), others (5%)
- Agricultural: irrigation pumping (90%), cold storage (5%), others (5%)
- Domestic: fans/ACs (35%), lighting (20%), refrigeration (15%), cooking (15%), others (15%)
- Commercial: HVAC (40%), lighting (30%), equipment (20%), others (10%)

For each end-use, shows:
- Typical efficiency of the technology (e.g., incandescent 5% vs LED 50%)
- Energy saving potential if best available technology is adopted
- BEE star rating impact on consumption
- Cost of electricity for that use (based on Indian tariff rates)

24-hour demand curve: shows the characteristic demand profile of India — morning rise, afternoon industrial peak, evening domestic peak, night trough. Adjustable by sector contribution.

Controls: sector selector (drill-down), region selector (North/South/East/West/NE India — different load patterns), season (summer/winter/monsoon), tariff type, efficiency technology level (current practice vs best available)

Live readouts: total consumption (MU), sector-wise consumption, average tariff (Rs/kWh), energy saving potential (MU), CO2 reduction potential

Theory tab:

- India's electricity consumption profile and growth trajectory
- Sector-wise analysis: why industrial is largest but agricultural has highest subsidy
- Load factor, demand factor, diversity factor — what they mean for system planning
- Energy efficiency potential: BEE estimates 20-25% saving potential in Indian industry
- Cross-subsidy: industrial/commercial consumers pay more to subsidize agricultural/domestic
- DSM (Demand Side Management) programs: UJALA (LED distribution), Super-Efficient Fan Programme, Star Rating Programme
- National Energy Policy targets and NDC commitments


Simulations #1-2 — Electric Traction

#1: Traction Speed-Time Curve

File: sims/utilization/traction-speed-time.jsx

Simulate: Interactive speed-time curve for an electric train showing four phases:

Animated train icon moves along a track profile (with gradients) while the speed-time curve plots simultaneously:

1. Acceleration phase: speed increases from 0 to free-running speed. Tractive effort > train resistance. Current drawn is maximum. Duration depends on acceleration rate and gradient.

2. Free-running (cruising) phase: constant speed. Tractive effort = total resistance (gradient + curve + air + mechanical friction). Power is constant.

3. Coasting phase: power cut off. Train decelerates slowly under resistance forces. Speed drops gradually. No energy consumed — momentum carries the train. Most energy-efficient portion.

4. Braking phase: brakes applied. Speed drops to zero at station. Options: regenerative braking (energy returned to supply — green energy flow arrow) or rheostatic braking (energy dissipated as heat — red heat animation).

Area under the speed-time curve = total distance traveled (shown filling up with distance counter)

Specific energy consumption calculation: energy per ton per km = total energy input / (mass × distance)

Schedule speed vs average speed: schedule speed includes station stop time, average speed is for running time only. Both calculated live.

Gradient effect: incline increases energy consumption (additional gravitational resistance mg sin theta), decline reduces it (coasting becomes self-sustaining downhill)

Controls: train mass (tonnes), acceleration rate (kmph/s), free-running speed (kmph), coasting duration, braking rate, gradient (%), curve radius, station distance (km), station stop time (s), locomotive type (WAP-7/WAG-9)

Live readouts: acceleration time, free-running time, coasting time, braking time, total time, schedule speed, average speed, distance, total energy consumed (kWh), specific energy consumption (Wh/ton-km), maximum tractive effort

Theory tab:
- Mechanics of train motion: tractive effort must overcome gravity, curve resistance, wind resistance, rolling friction, starting resistance
- Tractive effort equation: F = Ma + Mg sin(theta) + resistance forces
- Train resistance formula (Davis formula): R = A + BV + CV^2 (A: starting friction, B: rolling, C: aerodynamic)
- Specific energy consumption: Wh/ton-km — key metric for comparing traction systems. Indian electric traction: 20-30 Wh/ton-km (passenger), 10-15 Wh/ton-km (freight)
- Coasting: most effective for flat terrain, short distances — reduces energy but increases journey time (trade-off)
- Regenerative braking: modern WAP-5, WAP-7, WAG-12B locomotives return 20-30% of braking energy to the OHE (overhead equipment at 25 kV AC)
- Real-world context:
  * Indian Railways is the world's largest single consumer of electricity — 20+ billion kWh/year
  * Electric traction: 25 kV AC, 50 Hz, single phase from grid (Indian Railways gets supply at 132/220 kV, steps down through traction substations)
  * WAP-7 locomotive: 6120 HP, 25 kV AC, thyristor-controlled, max speed 160 kmph
  * WAG-9: freight locomotive, 6120 HP, IGBT-based (newer versions)
  * Vande Bharat Express: propulsion data, speed-time profile for Delhi-Varanasi route
  * Dedicated Freight Corridor (DFC): designed for higher axle loads and speeds, optimized traction energy

#2: Traction Mechanics

File: sims/utilization/traction-mechanics.jsx

Simulate: Tractive effort vs speed curve showing the complete performance envelope:

Three regions on the tractive effort-speed curve:
1. Constant tractive effort region (low speed): limited by adhesion between wheel and rail. Maximum TE = adhesion coefficient × weight on driving wheels. Speed controlled by voltage/current control.
2. Constant power region (medium speed): as speed increases, TE drops as P = F × v. Full voltage applied, current reduces with back-EMF. This is the "rated" region.
3. Falling power region (high speed): field weakening region, power drops. Beyond motor's rated speed range.

Adhesion limit visualization:
- Adhesion coefficient varies with rail conditions: dry (0.25-0.30), wet (0.15-0.20), oily/leaf-covered (0.05-0.10)
- If tractive effort exceeds adhesion × weight → wheel slip (animated spinning wheels). Anti-slip system activates (sanding, power reduction).

Gear ratio effect: changing gear ratio shifts the TE-speed curve:
- Higher ratio: more TE at low speed (good for freight/heavy trains), lower maximum speed
- Lower ratio: less TE but higher max speed (good for express trains)

Motor characteristic overlay: DC series motor / AC induction motor characteristic superimposed on TE-speed curve, showing how motor characteristic maps through the gear to the wheel.

Controls: locomotive type (WAP-7/WAG-9/WAP-5), number of motors, motor rating, gear ratio, wheel diameter, train weight, adhesive weight, rail condition (dry/wet/oily), gradient

Live readouts: maximum tractive effort, adhesion-limited TE, balancing speed, starting TE, continuous TE rating, power at wheel rim

Theory tab:
- Tractive effort: F = T × n × eta_gear / r_wheel (motor torque × number of motors × gear efficiency / wheel radius)
- Adhesion: F_max = mu × W_adhesive. Without adhesion, no traction. Critical constraint for starting heavy trains.
- Co-efficient of adhesion: depends on rail condition, speed (drops at high speed), surface contamination
- Anti-slip/anti-skid systems: detect wheel slip by speed difference between axles, reduce traction power on slipping axle
- DC series motor for traction: natural fit — high starting torque, speed self-adjusts with load. But commutator maintenance, brush wear.
- AC induction motor for traction: requires VFD but eliminates commutator — lower maintenance, better adhesion utilization (smooth torque). All modern traction.
- Gear ratio selection: trade-off between starting tractive effort and maximum speed. Indian Railways: WAP-7 gear ratio 64:18 = 3.56, WAG-9 gear ratio 72:15 = 4.8 (freight needs higher ratio for more pulling force)
- Real-world context:
  * Indian Railways locomotive performance specifications:
    - WAP-7: starting TE 258 kN, continuous TE 209 kN at 61.8 kmph, max speed 160 kmph
    - WAG-9: starting TE 458 kN, continuous TE 323 kN at 57.7 kmph, max speed 100 kmph
    - WAP-5: starting TE 258 kN, max speed 200 kmph (highest in India)
  * Adhesion improvement: Indian Railways uses sand blasting at wheel-rail interface during monsoon
  * Regenerative braking energy: Indian Railways saves ~2 billion kWh/year through regeneration
  * Comparison: diesel vs electric traction energy costs — electric is 3-4x cheaper per ton-km


Simulations #3 — Electric Heating

#3: Electric Heating Methods

File: sims/utilization/electric-heating.jsx

Simulate: Three heating methods shown as animated panels:

1. Resistance Heating:
- Heating element (nichrome wire coil) with current flowing through
- Temperature rise animation (color gradient: blue → red)
- Joule's law: H = I^2 × R × t — heat produced proportional to current squared
- Direct resistance heating (current through workpiece) vs indirect (current through element, heat transferred by radiation/convection)
- Temperature profile showing uniform heating (indirect) vs hotspot concerns (direct)

2. Induction Heating:
- Induction coil (solenoid) with high-frequency AC
- Workpiece inside the coil — eddy currents induced in the workpiece surface
- Skin effect: heating concentrated at surface (skin depth decreases with frequency)
- Skin depth formula: delta = sqrt(2 rho / (omega mu)) — adjustable with frequency slider
- At 50 Hz: deep penetration (through-heating). At 10 kHz: surface heating. At 100 kHz+: skin-deep heating (hardening)
- Power density visualization: high at surface, exponentially decaying inward

3. Dielectric Heating (Microwave):
- Workpiece placed between capacitor plates (for RF) or in a waveguide (microwave)
- Alternating electric field causes polar molecules to oscillate → friction → heat
- Heating is volumetric (entire body heats uniformly, unlike resistance/induction)
- Loss tangent (tan delta) determines heating rate: H ∝ f × E^2 × epsilon_r × tan(delta)
- Different materials: water (high tan delta — heats well), plastic (moderate), ceramic (low)

Comparison chart: heating method vs efficiency, speed, controllability, uniformity, cost, application

Controls: heating method, power input (kW), frequency (for induction/dielectric), workpiece material, workpiece geometry (cylinder/flat), temperature target, heating time

Live readouts: temperature rise rate, energy consumed (kWh), efficiency, skin depth (induction), power density, heating time to reach target temperature

Theory tab:
- Resistance heating: H = I^2Rt (Joule's law). Efficiency 70-90%. Element materials: nichrome (Ni-Cr alloy, max 1100°C), kanthal (Fe-Cr-Al, max 1400°C), silicon carbide (max 1600°C), molybdenum disilicide (max 1800°C)
- Induction heating: Faraday's law — changing magnetic flux induces EMF in conducting workpiece → eddy currents → I^2R heating. No contact needed. Efficiency 60-80%.
- Dielectric heating: displacement current in non-conducting materials. Works on polar molecules (water, some polymers). Microwave oven principle (2.45 GHz). Efficiency 50-70%.
- Arc heating: for extreme temperatures (steel making, EAF — Electric Arc Furnace). Arc temperature 3000-6000°C.
- Real-world context:
  * Indian steel industry: Electric Arc Furnaces (EAF) — JSW Steel, Essar Steel, Tata Steel use EAFs for secondary steelmaking. Typical 100-150 ton EAF consumes 350-500 kWh/ton.
  * Induction furnaces: very common in Indian SME sector. ~30,000 induction furnaces in India for steel/iron melting. Typical 1-10 ton capacity, 500-1000 kWh/ton. Major consumers of electricity.
  * Resistance heating: industrial ovens, heat treatment furnaces (Therelek, Shanti Engineering — Indian manufacturers)
  * Glass industry: electric glass melting furnaces (Saint-Gobain India, HNG, AGI Glaspac)
  * BEE benchmarks for specific energy consumption in Indian industries


Simulations #4 — Illumination

#4: Illumination Laws

File: sims/utilization/illumination-laws.jsx

Simulate: Interactive 3D-perspective room with a light source and measurement grid on the floor:

Two fundamental laws visualized:

1. Inverse Square Law: E = I / d^2
- Point source at adjustable height
- Illuminance plotted on the floor as a heatmap (brightest directly below, fading with distance)
- Measurement probe: user clicks any point on the floor to see exact lux value
- Curve: E vs distance from source (1/d^2 hyperbola)

2. Lambert's Cosine Law: E = (I × cos(theta)) / d^2
- For a point not directly below the source: the angle of incidence matters
- Theta = angle between light ray and the normal to the surface
- Combined with inverse square law: E = I × cos(theta) / h^2 × cos^2(theta) = I × cos^3(theta) / h^2

Room illumination design:
- Place multiple luminaires in a ceiling grid
- Each luminaire has a polar intensity distribution curve (shown as overlay when selected)
- Floor illumination computed as sum of contributions from all luminaires
- Uniformity ratio: E_min / E_avg — target > 0.5 for general lighting
- Lumen method: N = E × A / (F × UF × MF) — number of luminaires calculated

Luminaire types (with intensity distribution curves):
- Direct (narrow beam — spotlight)
- Semi-direct (office luminaire)
- General diffuse (pendant light)
- Indirect (uplight)

Controls: source type (point/fluorescent tube/LED panel), intensity (candela), mounting height, number of luminaires, room dimensions (L × W × H), reflectances (ceiling/wall/floor), target illuminance (lux)

Live readouts: illuminance at any point (lux), average illuminance, uniformity ratio, number of luminaires needed, power density (W/m^2), energy consumption (kWh/year)

Theory tab:
- Photometric quantities: luminous flux (lumen), luminous intensity (candela), illuminance (lux), luminance (cd/m^2)
- Inverse square law derivation: flux through area at distance d → E = phi / A = I × omega / (d^2 × omega) = I / d^2
- Lambert's cosine law: surface tilted at angle theta receives less flux per unit area → E = I cos(theta) / d^2
- Lumen method (room index method): total lumens needed = E_target × Area / (UF × MF)
  * UF (Utilization Factor): depends on room index and luminaire distribution
  * MF (Maintenance Factor): accounts for dirt/aging (typically 0.7-0.8)
  * Room Index: K = L × W / (H × (L+W)) — characterizes room proportions
- Indian illumination standards (IS 3646 / NBC 2016):
  * Office workspace: 300-500 lux
  * Manufacturing: 200-500 lux (depending on task precision)
  * Hospital operating theater: 10,000-50,000 lux
  * Street lighting: 10-30 lux (IS 1944)
  * Residential: 100-300 lux
- Real-world context:
  * Indian lighting transition: UJALA scheme distributed 370+ million LED bulbs. LED adoption transformed India's lighting energy consumption — BEE estimates 40 billion kWh/year savings.
  * Efficacy comparison: incandescent (12 lm/W), CFL (60 lm/W), LED (100-150+ lm/W)
  * Street lighting: Indian smart city program converting to LED street lights. Typically 100-150W LED replacing 250-400W HPSV (High Pressure Sodium Vapor).
  * Power quality impact: LED drivers inject harmonics (3rd harmonic particularly) — aggregate effect on distribution transformer loading in India.


Simulations #5-7 — Power Economics

#5: Power Factor Correction

File: sims/utilization/power-factor-correction.jsx

Simulate: Before/after comparison of power factor correction:

Before (low PF):
- Phasor diagram: V, I, phi (large angle, say 0.7 lag)
- Power triangle: P (horizontal), Q (vertical), S (hypotenuse)
- Current is large → conductor losses I^2R are high → transformer loading is high

After (corrected PF):
- Capacitor bank added → supplies reactive power locally
- New phasor diagram: V, I_new, phi_new (smaller angle)
- Power triangle: P unchanged, Q reduced by Qc (capacitor VAr), S reduced
- Current drops → losses drop → transformer loading reduced → voltage improves

Animated transition: morphing from before to after as capacitor bank slider increases

Capacitor bank sizing: Qc = P × (tan(phi1) - tan(phi2)) — calculated live as target PF changes

Economics calculator:
- Monthly electricity bill before PF correction (with PF penalty from DISCOM)
- Monthly bill after correction (with PF incentive)
- Capacitor bank cost (one-time investment)
- Monthly savings
- Payback period (months)

Over-correction warning: if PF corrected beyond unity to leading → voltage rises excessively → may damage equipment. Leading PF penalty from some DISCOMs shown.

Controls: load kW, initial PF (0.5-0.95 lag), target PF (0.9-1.0), supply voltage, capacitor bank kVAr (slider), tariff rate (Rs/kVAh or Rs/kWh), PF penalty/incentive schedule (DISCOM selector)

Live readouts: I_before, I_after, S_before, S_after, Q_before, Q_after, capacitor kVAr required, monthly bill before/after, annual saving (Rs), payback period (months), loss reduction %

Theory tab:
- Why power factor matters: P = VIcos(phi). For same P at lower PF, current I is higher → everything is bigger and costlier (conductors, transformers, switchgear, losses)
- Reactive power: inductive loads (motors, transformers) draw lagging reactive current for magnetization. This current doesn't deliver useful work but heats conductors and reduces system capacity.
- Power factor correction principle: add capacitor in parallel → supplies reactive current locally → grid only sees active + net reactive current → PF improves
- Qc sizing: Qc = P(tan phi1 - tan phi2). Example: 100 kW at 0.7 PF corrected to 0.95 → Qc = 100(1.02 - 0.33) = 69 kVAr
- Fixed vs automatic (APFC panel): fixed capacitor for constant loads, APFC (Automatic Power Factor Controller) with switched capacitor steps for varying loads
- Harmonic resonance risk: capacitor + system inductance can form resonant circuit at a harmonic frequency → dangerous amplification. Solution: detuned filter reactor (typically 7% detuning)
- Real-world context:
  * Indian DISCOM PF penalty/incentive: APSPDCL charges penalty for PF < 0.9 (typically 0.5-2% per 0.01 PF below 0.9), gives incentive for PF > 0.95 (0.5% per 0.01 PF above 0.95). Can amount to Rs 50,000-5,00,000/month for large industrial consumers.
  * APFC panel market in India: Larsen & Toubro, Shreem Electric, ABB — standard product for Indian industry
  * Capacitor banks: standard sizes 5/10/15/25/50 kVAr at 440V (LT), 50/100/200 kVAr at 11 kV (HT)
  * BEE PAT (Perform, Achieve, Trade) scheme includes PF improvement targets for designated consumers
  * Typical Indian industry: textile mill (PF 0.6-0.7 uncorrected), steel plant (0.75-0.85), IT park (0.85-0.95)

#6: Electricity Tariff Structures

File: sims/utilization/tariff-structures.jsx

Simulate: Interactive bill calculator comparing different tariff structures:

Five tariff types visualized:

1. Flat Rate: single rate (Rs/kWh) for all consumption. Simple but no incentive for off-peak use. Bill = rate × kWh consumed. Mostly historical.

2. Two-Part Tariff: demand charge (Rs/kW/month × max demand) + energy charge (Rs/kWh × consumption). Penalizes poor load factor. Industrial standard in India.

3. Time-of-Day (ToD): different rates for peak/off-peak/normal hours:
   - Peak (6-9 PM): 1.2-1.5× normal rate
   - Off-peak (10 PM - 6 AM): 0.8-0.9× normal rate
   - Normal: base rate
   Shows 24-hour rate profile as a stepped chart.

4. Telescopic (Slab) Rate: increasing rate with consumption level. First 100 units at Rs X, next 100 at Rs Y, above 200 at Rs Z. Common for domestic consumers in India.

5. Demand-Based: charges based on contracted demand (CMD) vs actual maximum demand (MD). Penalty if MD > CMD. Incentive for high load factor.

For each tariff type: user enters consumption pattern → bill is calculated with full breakdown (demand charge, energy charge, fuel surcharge, electricity duty, PF penalty/incentive, government subsidy if applicable)

Comparison view: same consumption pattern, all five tariffs side-by-side → which is cheapest, which is most expensive

Load profile editor: 24-hour bar chart where user sets hourly consumption (kW) → total kWh and max demand computed → bill calculated under each tariff

Controls: tariff type, consumer category (domestic/commercial/industrial/agricultural), monthly consumption (kWh), maximum demand (kW), power factor, time-of-use pattern (24 hours), contracted demand, DISCOM selector (APSPDCL/APEPDCL/BESCOM/TANGEDCO)

Live readouts: total monthly bill (Rs), per-unit cost (Rs/kWh effective), demand charge, energy charge, surcharges, PF adjustment, total with tax, bill comparison bar chart

Theory tab:
- Why different tariff structures: different consumer categories have different characteristics and price elasticity. Tariff design must recover utility costs while promoting efficient use.
- Cost components that tariff must recover:
  * Fixed costs: generation capacity, transmission assets, distribution infrastructure → recovered through demand charges
  * Variable costs: fuel (coal, gas), power purchase cost → recovered through energy charges
  * Losses: T&D losses factored into tariff calculation
- Two-part tariff economics: demand charge covers fixed costs (capacity reserved for the consumer), energy charge covers variable costs (fuel for actual generation)
- Cross-subsidy: in India, industrial and commercial consumers cross-subsidize agricultural and domestic consumers. CERC is gradually rationalizing cross-subsidy.
- Average Cost of Supply (ACS) vs Average Revenue Realized (ARR): the tariff gap that DISCOMs struggle with
- Real-world context:
  * AP tariff schedule (APERC tariff order 2024-25):
    - Domestic: slab-based, Rs 1.45/kWh (first 50 units) to Rs 9.95/kWh (above 500 units)
    - Industrial LT: demand charge Rs 300/kVA + energy Rs 7.80/kWh
    - Industrial HT (132 kV): demand charge Rs 400/kVA + energy Rs 6.50/kWh
    - Agricultural: free up to 7.5 HP (AP government subsidy)
  * ToD tariff: CERC mandates ToD for all consumers above 1 MW CMD. AP implementing gradually.
  * Open access: large consumers (>1 MW) can buy from any generator, paying wheeling charges to DISCOM. Cheaper than DISCOM tariff for some.
  * Gross metering vs net metering for solar prosumers — tariff impact
  * CERC's push for real-time pricing at 5-minute intervals (IEX spot market already operates at 15-min intervals)

#7: Load Curves and Load Factors

File: sims/utilization/load-curves-factors.jsx

Simulate: Interactive load curve builder and analyzer:

Daily Load Curve: 24-hour demand profile (MW vs time)
- User builds the curve by setting hourly demand values (bar chart editor)
- Or selects preset profiles: residential, industrial, commercial, mixed
- Shows: maximum demand (peak), minimum demand (base), average demand
- Peak hours highlighted, off-peak hours marked

Derived curves:
1. Load Duration Curve: hours sorted by demand (highest to lowest). Area under curve = total energy. Shows base load, intermediate load, peak load regions.
2. Integrated (Energy) Curve: cumulative energy vs time. Slope at any point = demand at that time.
3. Annual Load Curve: 8760-hour load duration curve from monthly load data.

Load Factors computed and visualized:

- Load Factor = Average demand / Maximum demand (0 to 1)
  * Visualized as ratio of rectangle areas on load curve
  * High LF = flat curve (industrial: 0.7-0.9), Low LF = peaky (residential: 0.3-0.5)

- Demand Factor = Maximum demand / Connected load (< 1 always)
  * Not all connected appliances run simultaneously

- Diversity Factor = Sum of individual max demands / System max demand (> 1 always)
  * Different consumers peak at different times — system peak < sum of individual peaks
  * Higher diversity = better asset utilization

- Plant Use Factor = Actual energy / (capacity × time)
- Plant Capacity Factor = Average demand / Rated capacity

Economic significance: higher load factor → lower per-unit cost (fixed costs spread over more units). Interactive calculator shows cost breakdown at different load factors.

Controls: hourly demand values (24 sliders), connected load total, individual consumer max demands (for diversity calculation), plant capacity, preset load profiles, consumer mix slider (% residential/industrial/commercial)

Live readouts: maximum demand (kW), average demand (kW), load factor, demand factor, diversity factor, total energy (kWh), load curve shape index, annual cost at different load factors

Theory tab:
- Load curve significance: fundamental tool for power system planning — determines generation mix, peak capacity needed, energy purchase cost
- Why load factor matters financially:
  * Cost per unit = (fixed cost + variable cost) / total units
  * Higher LF → more units generated → fixed cost per unit drops
  * Example: a 100 MW plant at 0.5 LF produces 438 GWh/year. At 0.8 LF: 700 GWh/year. If fixed cost is Rs 500 crore/year: cost per unit drops from Rs 1.14/kWh to Rs 0.71/kWh.
- Diversity factor importance: allows utility to build less capacity than the sum of all consumer peaks
- Load Duration Curve: area under curve = total energy generated. Shape determines generation mix:
  * Base load (bottom portion, runs all 8760 hours): coal, nuclear — lowest variable cost
  * Intermediate (middle): combined cycle gas — medium cost
  * Peaking (top, runs few hundred hours): gas turbines, hydro — highest variable cost but low fixed cost
- Real-world context:
  * Indian grid load factor: ~55-60% (relatively low — high residential/agricultural share). China: ~70%.
  * AP DISCOM load pattern: morning agricultural pumping peak (6-9 AM), industrial day load (9 AM-5 PM), domestic evening peak (6-10 PM)
  * Diversity factor benefit: AP DISCOMs have diversity between agricultural (daytime) and domestic (evening) peaks → system peak < sum
  * Peak demand management: DSM programs, ToD tariff, demand response — all aimed at flattening the load curve (improving load factor)
  * India's peak demand: ~243 GW (2024), growing 7-8% annually. Evening peak shifting later due to LED lighting (later sunset equivalent)
  * Merit order dispatch: CERC mandates cheapest generators dispatched first — load curve determines which plants run


Build Order

Build the flagship first — it provides the sectoral context that individual simulations elaborate on.

Phase 1 — Overview + Traction (3 sims)
1. energy-dashboard.jsx — flagship energy utilization overview (sets the template)
2. traction-speed-time.jsx — traction energy consumption analysis
3. traction-mechanics.jsx — builds on speed-time with mechanical engineering

Phase 2 — Heating + Lighting (2 sims)
4. electric-heating.jsx — industrial heating methods
5. illumination-laws.jsx — lighting design fundamentals

Phase 3 — Power Economics (3 sims)
6. power-factor-correction.jsx — most common energy efficiency measure
7. tariff-structures.jsx — electricity pricing and billing
8. load-curves-factors.jsx — demand analysis and system planning

Total: 8 simulations in sims/utilization/
