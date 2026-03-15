# Semiconductor Fundamentals — Basic Principles Simulation Plan

## Scope

A single file `sims/basic-principles/semiconductor-fundamentals.jsx` containing 13 topic tabs, each with **Simulate** and **Theory** views.

**Progression:** semiconductor physics → devices (diode, BJT, MOSFET, FinFET) → logic → CPU, GPU, microcontrollers → fabrication.

**Goals:** easy to load on the front end, clear and intuitive with a real simulation feel, and theory built in per topic for understanding.

---

## Reference Textbooks (Curriculum Alignment)

- **Neamen** — *Semiconductor Physics and Devices* (4th ed.): Material physics, doping, carrier statistics, device electrostatics
- **Streetman/Banerjee** — *Solid State Electronic Devices* (7th ed.): Energy bands, PN junction, BJT, MOSFET, IC technology
- **Sedra/Smith** — *Microelectronic Circuits* (8th ed.): Device models, CMOS logic, circuit-level view
- **Purdue ECE 606** (nanoHUB): Week-by-week progression from crystals → doping → transport → PN → BJT → MOSFET

---

## Simulate | Theory per Topic

Every topic follows the pattern used in `electric-machines-plan.md` and sims like `power-angle-curve.jsx`:

1. **Top-level:** One tab bar with `[ Simulate ] [ Theory ]` (pill style, same as other sims).
2. **Topic tabs:** A second row of 13 topic tabs (Energy Bands, Doping, …, Fabrication). The active topic decides which Simulate view and which Theory content are shown.
3. **Simulate view:** The interactive visualization, controls, key equation, and application note for the active topic.
4. **Theory view:** Scrollable theory for the same active topic — short concept explanation, key equations (styled code/monospace, no LaTeX), one or two annotated SVG diagrams, and a "Where this matters" / real-world note. Content is topic-specific (e.g. when "MOSFET" is selected, Theory shows MOSFET theory only).

Each of the 13 topics has both a Simulate panel and a Theory panel; switching topics or Simulate/Theory is instant and does not reload the page.

---

## Design Principles

### Load Performance and Front-End Friendliness

- **Single file, single lazy load:** The app already lazy-loads each sim by route; this file is one chunk. Keep the bundle parseable quickly by avoiding huge inline data (no 10,000-point arrays); use computed points and compact SVG.
- **Render only active topic:** Mount and render only the active topic's content (Simulate or Theory). Other topic components are not mounted, so only one topic's logic and animations run at a time. Reduces CPU and keeps scrolling smooth.
- **Animations only when visible:** Use `requestAnimationFrame` (or timers) only when the Simulate view is visible and this topic tab is selected. When the user switches to Theory or to another topic, cancel animation frames and clear timers so the browser stays responsive.
- **No extra dependencies:** No recharts or heavy libs in this file; SVG-only and React state. Keeps load and execution light.

### Clarity, Intuition, and Simulation Feel

- **One primary visualization per tab:** Each Simulate view has one main SVG (or one main idea). Avoid crowding the screen; support "see it at a glance".
- **Immediate feedback:** Every control (slider, selector) updates a visible value and the visualization in the same tick. Optional live readouts (e.g. current, voltage, carrier concentration) where they aid intuition.
- **Key equation visible:** Show the main formula for the topic next to or above the viz, with values substituted where possible (e.g. `I = Iₛ(e^(qV/kT) − 1)` and `I ≈ 1.2 mA`).
- **Application note:** Keep the short "Where this matters" blurb on Simulate so the link to real devices/systems is always visible.
- **Theory supports the sim:** Theory text and diagrams use the same terminology and symbols as the Simulate view (same variable names, same schematic style where applicable) so switching to Theory deepens rather than repeats.

---

## Proposed Tabs

> **Progression:** Energy Bands → Doping → Transport → Diode → BJT → MOSFET → FinFET → CMOS → Logic → CPU → GPU → Microcontrollers → Fabrication

### Tab 1 — Energy Bands and Band Gap

- **Core idea:** Valence band, conduction band, band gap Eᵍ; insulators vs semiconductors vs conductors
- **Visualization:** Energy-level diagram (E vs position) for Si, Ge, GaAs. Animated electrons in valence band, thermal excitation across Eᵍ into conduction band. Toggle material to show different Eᵍ (Si ~1.1 eV, Ge ~0.66 eV, GaAs ~1.43 eV)
- **Controls:** Material selector (Si, Ge, GaAs), temperature (affects intrinsic carrier concentration)
- **Application note:** Why Si dominates; band gap vs wavelength for optoelectronics
- **Theory:** Band structure in solids; Eᵍ and conductivity; comparison table Si/Ge/GaAs; annotated band diagram SVG

### Tab 2 — Doping and Carrier Concentration

- **Core idea:** N-type (donors: P, As, Sb) and P-type (acceptors: B, Al, Ga); majority vs minority carriers; n·p = nᵢ²
- **Visualization:** Lattice diagram with Si atoms; substitute one with P (extra electron) or B (hole). Show carrier concentration bar chart: nₙ, pₙ for N-type; nₚ, pₚ for P-type
- **Controls:** Doping type (N/P), doping concentration (10¹⁴–10¹⁸ cm⁻³), temperature
- **Application note:** How doping sets conductivity; resistivity vs doping
- **Theory:** Donors/acceptors in the lattice; n·p = nᵢ²; majority vs minority; equation for nₙ, pₙ; annotated lattice SVG

### Tab 3 — Carrier Transport (Drift and Diffusion)

- **Core idea:** Drift J = σE (mobility μ), diffusion J = −qD·dn/dx; Einstein relation D/μ = kT/q
- **Visualization:** Two regions — (a) uniform field, carriers drift; (b) concentration gradient, carriers diffuse. Animated particle flow arrows. Side-by-side current density vs field and vs gradient
- **Controls:** Electric field, concentration gradient, mobility
- **Application note:** Basis for all device current equations; channel conduction in MOSFET
- **Theory:** Drift and diffusion equations; mobility and conductivity; Einstein relation; when each mechanism dominates; annotated flow diagram SVG

### Tab 4 — PN Junction and Diode

- **Core idea:** Depletion region, built-in potential Vbi, I-V characteristic I = Iₛ(e^(qV/kT) − 1)
- **Visualization:** Band diagram (E vs x) across junction; depletion region width; I-V curve with operating point. Forward bias: narrow depletion, current flows; reverse bias: wide depletion, tiny Iₛ
- **Controls:** Bias voltage (forward/reverse), temperature, doping asymmetry
- **Application note:** Rectification, solar cells, LEDs (reverse of absorption)
- **Theory:** Depletion region and Vbi; ideal diode equation; forward vs reverse; annotated band diagram and I-V SVG

### Tab 5 — Bipolar Junction Transistor (BJT)

- **Core idea:** NPN/PNP; emitter injects, base controls, collector collects; I_C = β·I_B; active, cutoff, saturation
- **Visualization:** Cross-section of NPN with emitter, base, collector. Band diagram or carrier flow. Output characteristics I_C vs V_CE with load line and operating point
- **Controls:** V_BE, V_CE, β, base width
- **Application note:** Amplifiers, analog circuits; still used in power and RF
- **Theory:** NPN/PNP structure; active/cutoff/saturation; Ebers–Moll or simplified I_C relation; output characteristics; annotated cross-section SVG

### Tab 6 — MOSFET

- **Core idea:** Gate voltage induces channel; V_GS > V_T turns on; triode and saturation; I_D ∝ (V_GS − V_T)²
- **Visualization:** MOS structure (gate, oxide, body, source, drain). Band bending / inversion layer as V_GS increases. I_D vs V_DS family of curves for different V_GS
- **Controls:** V_GS, V_DS, V_T, channel length
- **Application note:** Dominant device in digital ICs; scaling to nanometers
- **Theory:** MOS capacitor and threshold; triode vs saturation; square-law model; annotated cross-section and I_D–V_DS SVG

### Tab 7 — FinFET

- **Core idea:** 3D fin structure; gate wraps around channel on 3 sides; better gate control, reduced short-channel effects; used in sub-22 nm nodes
- **Visualization:** 3D-style cross-section of fin (vertical Si fin) with gate wrapping around. Compare planar MOSFET vs FinFET — show how gate controls channel from multiple sides. I_D–V_DS curve similar to MOSFET but with improved subthreshold slope
- **Controls:** Fin height, fin width, V_GS, V_DS
- **Application note:** Why planar MOSFET hit scaling limits; Intel 22 nm, TSMC 16 nm, all modern mobile/desktop CPUs
- **Theory:** Short-channel effects; why planar fails; fin and gate-all-around idea; subthreshold slope; planar vs FinFET comparison SVG

### Tab 8 — CMOS Inverter

- **Core idea:** PMOS pull-up + NMOS pull-down; V_in high → V_out low; V_in low → V_out high; zero static power (except leakage)
- **Visualization:** Schematic of inverter; voltage transfer characteristic (VTC) curve; animated switch as V_in sweeps 0 → V_DD
- **Controls:** V_DD, V_in (sweep or slider), NMOS/PMOS strength ratio
- **Application note:** Building block of all digital logic; power efficiency
- **Theory:** Pull-up vs pull-down; VTC and noise margins; static power (ideally zero); annotated schematic and VTC SVG

### Tab 9 — Logic Gates from Transistors

- **Core idea:** NAND, NOR built from CMOS; series/parallel combinations of NMOS and PMOS
- **Visualization:** NAND gate schematic (2 NMOS in series, 2 PMOS in parallel); truth table; animated outputs for input combinations
- **Controls:** Input A, Input B; gate type selector (NAND, NOR, AND, OR)
- **Application note:** Universal gates; how Boolean logic maps to silicon
- **Theory:** NAND/NOR from complementary pull-up/pull-down; truth tables; universal gates; annotated NAND/NOR schematic SVG

### Tab 10 — CPU Architecture and Components

- **Core idea:** Major CPU building blocks — ALU (arithmetic/logic), control unit, registers, cache (L1/L2/L3), fetch-decode-execute pipeline, memory hierarchy
- **Visualization:** Block diagram of a CPU: instruction fetch → decode → execute (ALU) → memory access → writeback. Show data flow between registers, ALU, cache, and main memory. Animate a simple instruction (e.g., ADD) through the pipeline
- **Controls:** Instruction type selector, cache hit/miss toggle, pipeline stage scrubber
- **Application note:** How sequential logic and combinational logic combine; clock cycles; why cache matters for performance
- **Theory:** Fetch–decode–execute; ALU and control unit; registers and cache hierarchy; pipeline and CPI; annotated CPU block diagram SVG

### Tab 11 — GPU and Matrix Multiplication

- **Core idea:** GPUs excel at parallel workloads; matrix multiply C = A × B as many independent dot products; SIMD/SIMT; thousands of cores doing multiply-accumulate (MAC) in parallel
- **Visualization:** Animated matrix multiplication — show 2×2 or 3×3 example where each output element C[i,j] = Σₖ A[i,k]·B[k,j]. Map each dot product to a "thread" or "core". Show how many MACs run in parallel. Optional: tiling for larger matrices
- **Controls:** Matrix size (2×2, 3×3, 4×4), animation speed, highlight which elements are being computed
- **Application note:** Why GPUs dominate AI training (matrix ops in neural networks); CUDA/OpenCL concept; FLOPs and throughput
- **Theory:** C[i,j] = Σₖ A[i,k]·B[k,j]; dot products and parallelism; SIMD/SIMT; why matrix multiply fits GPUs; annotated matrix-multiply diagram SVG

### Tab 12 — Microcontrollers (ARM, AVR, etc.)

- **Core idea:** Single-chip computer — CPU core + RAM + flash + peripherals (GPIO, ADC, timers, UART, SPI, I2C); low power, real-time; ARM Cortex-M, AVR, PIC
- **Visualization:** Block diagram of a typical MCU (e.g., ARM Cortex-M4): core, flash, SRAM, GPIO blocks, ADC, timers, communication interfaces. Show how a simple program (blink LED, read sensor) uses these blocks
- **Controls:** MCU family selector (ARM Cortex-M, AVR, PIC), peripheral toggle (which blocks are active)
- **Application note:** Embedded systems; IoT; automotive; why ARM dominates mobile and embedded
- **Theory:** MCU vs CPU vs SoC; core + memory + peripherals; ARM Cortex-M, AVR, PIC in brief; typical peripherals and buses; annotated MCU block diagram SVG

### Tab 13 — Semiconductor Fabrication Process

- **Core idea:** How chips are made — wafer preparation → oxidation → photolithography → ion implantation (doping) → etching → deposition → metallization → packaging; cleanroom, multiple mask layers
- **Visualization:** Step-by-step animated flow: (1) Si wafer, (2) grow oxide, (3) spin photoresist, (4) expose through mask, (5) develop, (6) etch, (7) implant dopants, (8) remove resist, repeat. Show cross-section evolving through a few key steps. Optional: simple inverter or transistor emerging
- **Controls:** Process step scrubber, layer selector, mask pattern toggle
- **Application note:** Why fabs cost billions; Moore's Law; EUV lithography; TSMC, Intel, Samsung
- **Theory:** Wafer to packaged chip; oxidation, lithography, implant, etch, deposition, metallization; multiple mask layers; annotated process-flow SVG

### Optional Tab — Generation and Recombination

- **Core idea:** G = R at equilibrium; excess carriers recombine; minority carrier lifetime τ
- **Visualization:** Band diagram with electron-hole pair generation (light) and recombination (radiative, trap-assisted)
- **Application note:** Solar cells, LEDs, photodetectors; BJT base recombination

---

## File Structure

**Pattern:** Two-level tabs — (1) `[ Simulate | Theory ]` and (2) 13 topic tabs. Only the active topic's content is rendered. Follow styling from `electromagnetic-fundamentals.jsx` and Simulate/Theory from `power-angle-curve.jsx`.

```jsx
const TOPIC_TABS = [
  { id: 'energy-bands', label: 'Energy Bands' },
  { id: 'doping', label: 'Doping' },
  // ... (id, label) for all 13 topics
];

// Per-topic: Simulate view (viz + controls + equation + application note)
function EnergyBandsSimulate() { ... }
function DopingSimulate() { ... }
// ... one Simulate component per topic

// Per-topic: Theory view (scrollable text + equations + annotated SVGs)
function EnergyBandsTheory() { ... }
function DopingTheory() { ... }
// ... one Theory component per topic

export default function SemiconductorFundamentals() {
  const [viewMode, setViewMode] = useState('simulate');  // 'simulate' | 'theory'
  const [topic, setTopic] = useState('energy-bands');
  const ActiveSimulate = SIMULATE_MAP[topic];
  const ActiveTheory = THEORY_MAP[topic];
  return (
    <div style={S.container}>
      <div style={S.tabBar}>
        <button style={S.tab(viewMode === 'simulate')} onClick={() => setViewMode('simulate')}>Simulate</button>
        <button style={S.tab(viewMode === 'theory')} onClick={() => setViewMode('theory')}>Theory</button>
      </div>
      <div style={S.topicBar}>
        {TOPIC_TABS.map(t => <button key={t.id} ...>{t.label}</button>)}
      </div>
      {viewMode === 'simulate' ? <ActiveSimulate /> : <ActiveTheory />}
    </div>
  );
}
```

- All SVG-based; dark theme (`#09090b`, indigo accents)
- `requestAnimationFrame` only when `viewMode === 'simulate'` and topic is active (stop when switching to Theory or another topic)
- Each Simulate/Theory pair is self-contained; Theory content is static (no heavy animation)

---

## Implementation Notes

- **Numerical accuracy:** Use typical values (Si nᵢ ≈ 10¹⁰ cm⁻³ at 300 K, μₙ ≈ 1400 cm²/V·s) for educational clarity; log scales where needed (carrier concentration, I-V).
- **Log scale for I-V:** Diode and BJT currents span many decades; use `Math.log10` for readable plots.
- **CPU tab:** Block-diagram level; ALU, cache, pipeline stages; animate instruction flow.
- **GPU tab:** Matrix multiply C[i,j] = Σ A[i,k]·B[k,j]; animate dot products; show parallelism (many MACs at once).
- **Microcontrollers tab:** ARM Cortex-M as primary example; AVR/PIC as alternatives; peripheral blocks.
- **Fabrication tab:** Simplified flow (wafer → oxide → litho → implant → etch → metal); step scrubber.
- **No new dependencies:** Same stack as electromagnetic-fundamentals (`React`, `useState`, `useEffect`, `useRef`, SVG).
- **Animation lifecycle:** In each Simulate component, start `requestAnimationFrame` in `useEffect` only when that topic is active and viewMode is simulate; cleanup (`cancelAnimationFrame`) in the effect return so switching topic or to Theory stops animations and keeps the front end responsive.

---

## Estimated Size

~2,800–3,500 lines total (13 topics × Simulate + Theory). Per topic: Simulate ~120–180 lines, Theory ~80–120 lines (text, equations, 1–2 SVGs). Ensures everything is in one file for a single lazy load while keeping each section scannable and maintainable.

---

## Home.jsx

No change needed — `basic-principles` category and `Zap` icon already exist from `electromagnetic-fundamentals`.
