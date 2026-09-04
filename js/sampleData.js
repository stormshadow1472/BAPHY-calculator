/**
 * BAPHY105 Engineering Physics CHAMP Laboratory Manual Registry
 * Conforms strictly to the official syllabus & experiment manual of BAPHY105.
 */

export const EXPERIMENTS_REGISTRY = [
  // =========================================================================
  // CATEGORY 1: PREPARATORY TOOLS & EXPERIMENTS
  // =========================================================================
  {
    id: 'screw_gauge',
    title: 'Screw Gauge (Measurement of Thickness)',
    category: 'Preparatory Tools & Experiments',
    categoryShort: 'Preparatory Tool I',
    categoryIndex: 1,
    icon: 'fa-compress',
    aim: 'To learn the operation of a screw gauge and determine the thickness of a given object (glass plate) with zero error corrections.',
    apparatus: 'Screw gauge (100 divisions, pitch 1 mm), glass plate specimen, magnifying lens.',
    formula: 'Pitch = (Distance Moved) / (Full Rotations)  ;  Least Count (LC) = Pitch / 100 = 0.01 mm  ;  Corrected Reading = T.R. ± Z.C.',
    theory: 'A screw gauge operates on the principle of a precision screw. Turning the head moves the spindle forward along the pitch scale. When zero of head scale does not coincide with the datum line when jaws touch, a zero error exists: if zero lies below the baseline, error is positive and correction is negative; if above, error is negative and correction is positive.',
    globals: {
      zero_error_div: { label: 'Zero Error (divisions)', value: -3, unit: 'div' },
      pitch_mm: { label: 'Screw Pitch', value: 1.0, unit: 'mm' },
      circular_divisions: { label: 'Head Scale Divisions', value: 100, unit: 'div' }
    },
    units: {
      length: 'mm'
    },
    columns: [
      { id: 'psr', label: 'Pitch Scale Reading (P.S.R)', unit: 'mm', type: 'input' },
      { id: 'hsc', label: 'Head Scale Coincidence (H.S.C)', unit: 'div', type: 'input' },
      { id: 'hsr', label: 'H.S.R = H.S.C × LC', unit: 'mm', type: 'computed' },
      { id: 'tr', label: 'Total Reading (T.R)', unit: 'mm', type: 'computed' },
      { id: 'cr', label: 'Corrected Reading (C.R)', unit: 'mm', type: 'computed' }
    ],
    defaultRows: [
      { psr: 4, hsc: 56 },
      { psr: 4, hsc: 55 },
      { psr: 4, hsc: 57 },
      { psr: 4, hsc: 56 },
      { psr: 4, hsc: 58 }
    ]
  },

  {
    id: 'vernier_calipers',
    title: 'Vernier Calipers (Dimensions & Volume)',
    category: 'Preparatory Tools & Experiments',
    categoryShort: 'Preparatory Tool II',
    categoryIndex: 1,
    icon: 'fa-ruler',
    aim: 'To learn the operation of vernier calipers and measure the dimensions and volume of a rectangular wooden block.',
    apparatus: 'Vernier calipers (10 V.S.D = 9 M.S.D, LC = 0.01 cm), rectangular wooden block specimen.',
    formula: 'Least Count (LC) = 1 M.S.D - 1 V.S.D = 0.1 mm = 0.01 cm  ;  Total Reading = M.S.R + (V.S.C × LC)  ;  Volume = l × b × h',
    theory: 'The vernier calipers consist of a main scale graduated in mm and a sliding vernier scale with 10 divisions spanning 9 mm. The difference between 1 MSD and 1 VSD gives the least count of 0.01 cm. Dimensions along length, breadth, and height are measured to evaluate the volume of the regular solid.',
    globals: {
      zero_correction_cm: { label: 'Zero Correction (Z.C)', value: 0.00, unit: 'cm' }
    },
    units: {
      length: 'cm'
    },
    columns: [
      { id: 'dimension', label: 'Dimension / Trial', type: 'input' },
      { id: 'msr', label: 'Main Scale Reading (M.S.R)', unit: 'cm', type: 'input' },
      { id: 'vsc', label: 'Vernier Coincidence (V.S.C)', unit: 'div', type: 'input' },
      { id: 'vsr', label: 'V.S.R = V.S.C × LC', unit: 'cm', type: 'computed' },
      { id: 'tr', label: 'Total Reading (T.R)', unit: 'cm', type: 'computed' },
      { id: 'cr', label: 'Corrected Reading (C.R)', unit: 'cm', type: 'computed' }
    ],
    defaultRows: [
      { dimension: 'Length (l) 1', msr: 5.4, vsc: 4 },
      { dimension: 'Length (l) 2', msr: 5.4, vsc: 5 },
      { dimension: 'Breadth (b) 1', msr: 3.2, vsc: 6 },
      { dimension: 'Breadth (b) 2', msr: 3.2, vsc: 7 },
      { dimension: 'Height (h) 1', msr: 1.8, vsc: 3 },
      { dimension: 'Height (h) 2', msr: 1.8, vsc: 4 }
    ]
  },

  {
    id: 'travelling_microscope',
    title: 'Travelling Microscope (Capillary Bore Radius)',
    category: 'Preparatory Tools & Experiments',
    categoryShort: 'Preparatory Tool III',
    categoryIndex: 1,
    icon: 'fa-microscope',
    aim: 'To learn the operation of the travelling microscope and determine the internal diameter and radius of a capillary tube.',
    apparatus: 'Travelling microscope (LC = 0.001 cm), capillary tube mounted horizontally/vertically, reading lens, lamp.',
    formula: 'LC = 1 M.S.D - 1 V.S.D = 0.05 cm - 0.049 cm = 0.001 cm  ;  Internal Diameter D = |R₁ - R₂|  ;  Radius r = D / 2',
    theory: 'The travelling microscope consists of a compound microscope mounted on vertical and horizontal precision rails with vernier scales (50 VSD = 49 MSD of 0.5 mm each). By focusing on cross-hairs aligned with opposite edges of the capillary bore, the internal diameter and radius are determined with sub-millimeter precision.',
    globals: {},
    units: {
      length: 'cm'
    },
    columns: [
      { id: 'trial', label: 'Edge / Orientation', type: 'input' },
      { id: 'msr', label: 'M.S.R', unit: 'cm', type: 'input' },
      { id: 'vsc', label: 'V.S.C', unit: 'div', type: 'input' },
      { id: 'vsr', label: 'V.S.R', unit: 'cm', type: 'computed' },
      { id: 'reading', label: 'Total Reading (R)', unit: 'cm', type: 'computed' }
    ],
    defaultRows: [
      { trial: 'Horizontal Left (R1)', msr: 5.05, vsc: 20 },
      { trial: 'Horizontal Right (R2)', msr: 5.25, vsc: 35 },
      { trial: 'Vertical Top (R3)', msr: 8.10, vsc: 15 },
      { trial: 'Vertical Bottom (R4)', msr: 8.30, vsc: 30 }
    ]
  },

  {
    id: 'spectrometer',
    title: 'Spectrometer (Angle of Prism & Refractive Index)',
    category: 'Preparatory Tools & Experiments',
    categoryShort: 'Preparatory Tool IV',
    categoryIndex: 1,
    icon: 'fa-ring',
    aim: 'To learn the operation of the spectrometer, determine its least count, and evaluate the prism angle (A) and refractive index (µ).',
    apparatus: 'Spectrometer (LC = 1 arcminute), equilateral flint glass prism, sodium vapour lamp source, reading lens.',
    formula: 'LC = 1 M.S.D - 1 V.S.D = 30’ - 29’ = 1’  ;  A = |R₁ - R₂| / 2  ;  µ = sin((A + δ_m) / 2) / sin(A / 2)',
    theory: 'The spectrometer consists of a collimator, prism table, and telescope. Light from the collimator reflects off both polished faces of the prism. The angle between reflected beams equals 2A. At minimum deviation position δm, refraction is symmetrical and Snell’s law yields the refractive index µ.',
    globals: {
      msd_value_arcmin: { label: '1 MSD', value: 30, unit: 'arcmin' },
      vsd_count: { label: 'Vernier Divisions', value: 30, unit: 'div' },
      delta_m_deg: { label: 'Angle of Minimum Deviation (δm)', value: 49.5, unit: 'deg' }
    },
    units: {},
    columns: [
      { id: 'face', label: 'Prism Face / Vernier', type: 'input' },
      { id: 'msr_deg', label: 'M.S.R (Degrees)', unit: '°', type: 'input' },
      { id: 'vsc_min', label: 'V.S.C (Divisions)', unit: 'min', type: 'input' },
      { id: 'tr_deg', label: 'Total Reading (TR)', unit: 'deg', type: 'computed' }
    ],
    defaultRows: [
      { face: 'Reflected Ray 1 (V1)', msr_deg: 110.5, vsc_min: 9 },
      { face: 'Reflected Ray 2 (V1)', msr_deg: 230.5, vsc_min: 8 },
      { face: 'Reflected Ray 1 (V2)', msr_deg: 290.5, vsc_min: 9 },
      { face: 'Reflected Ray 2 (V2)', msr_deg: 50.5, vsc_min: 8 }
    ]
  },

  // =========================================================================
  // CATEGORY 2: CHAMP CYCLE 1 (OPTICS & SEMICONDUCTOR QUANTUM)
  // =========================================================================
  {
    id: 'solar_cell',
    title: 'Designing Solar Cell Renewable Energy Circuits (Expt 1)',
    category: 'CHAMP Cycle 1 Experiments',
    categoryShort: 'Cycle 1: Expt 1',
    categoryIndex: 2,
    icon: 'fa-sun',
    aim: 'To design a circuit using solar cells for electricity generation as a renewable energy device and determine its photovoltaic characteristics (Voc, Isc, Pmax, Fill Factor, and Efficiency) in single, series, and parallel configurations.',
    apparatus: 'Silicon solar cells, 5W halogen light source, breadboard, decade resistance box, digital multimeters, lux meter.',
    formula: 'P = V · I  ;  P_{max} = I_{max} · V_{max}  ;  FF = P_{max} / (V_{oc} · I_{sc})  ;  η = [P_{max} / (A · I_0)] × 100%',
    theory: 'A solar cell is a p-n junction photovoltaic device. Incident photons create electron-hole pairs separated by the internal junction electric field. By varying load resistance from 0.1 kΩ to 10 kΩ, current-voltage (I-V) and power-voltage (P-V) curves are generated. Series connection increases voltage (V_total = ΣV_i), whereas parallel connection increases current (I_total = ΣI_i).',
    globals: {
      config_mode: { label: 'Circuit Configuration', value: 'single', options: ['single', 'series', 'parallel'] },
      incident_intensity: { label: 'Incident Light Intensity (I_0)', value: 100.0, unit: 'W/m²' },
      cell_area: { label: 'Active Cell Area (A)', value: 0.0004, unit: 'm²' }
    },
    units: {},
    columns: [
      { id: 'resistance', label: 'Resistance (R_L)', unit: 'kΩ', type: 'input' },
      { id: 'voltage', label: 'Voltage (V)', unit: 'V', type: 'input' },
      { id: 'current', label: 'Current (I)', unit: 'mA', type: 'input' },
      { id: 'power_mW', label: 'Power P = V·I', unit: 'mW', type: 'computed' }
    ],
    defaultRows: [
      { resistance: 0.10, voltage: 0.05, current: 84.5 },
      { resistance: 0.22, voltage: 0.12, current: 83.8 },
      { resistance: 0.50, voltage: 0.26, current: 81.2 },
      { resistance: 1.00, voltage: 0.42, current: 75.6 },
      { resistance: 2.00, voltage: 0.51, current: 63.2 },
      { resistance: 3.00, voltage: 0.54, current: 51.5 },
      { resistance: 4.00, voltage: 0.56, current: 41.0 },
      { resistance: 5.00, voltage: 0.57, current: 33.2 },
      { resistance: 6.00, voltage: 0.58, current: 27.5 },
      { resistance: 7.00, voltage: 0.59, current: 23.4 },
      { resistance: 8.00, voltage: 0.59, current: 20.2 },
      { resistance: 9.00, voltage: 0.60, current: 17.8 },
      { resistance: 10.0, voltage: 0.60, current: 15.9 }
    ]
  },

  {
    id: 'plancks_constant_led',
    title: 'Planck’s Constant from Semiconductor Junctions (Expt 2)',
    category: 'CHAMP Cycle 1 Experiments',
    categoryShort: 'Cycle 1: Expt 2',
    categoryIndex: 2,
    icon: 'fa-atom',
    aim: 'To calculate the value of Planck’s constant (h) by studying the I-V characteristics and barrier potentials (VB) of Light Emitting Diodes (LEDs) of different wavelengths.',
    apparatus: 'Voltage source (3V), current limiting resistor (10-100 Ω), potentiometer (0-100 kΩ), digital multimeters, breadboard, calibrated LEDs (Blue 470nm, Yellow 500nm, Green 565nm, Red 660nm).',
    formula: 'eV_B = h·c/λ ⟹ h = V_B·λ·(e/c)  ;  V_B = (h·c/e) · (1/λ) ⟹ Slope = h·c/e ⟹ h = Slope · (e/c)',
    theory: 'In an LED, forward current injects electrons and holes across the p-n depletion region where they recombine and emit photons of energy hν ≈ eV_B. Measuring the knee / barrier potential V_B for different wavelengths and plotting V_B vs 1/λ yields a linear relationship whose slope determines Planck’s constant h.',
    globals: {},
    units: {},
    columns: [
      { id: 'color', label: 'LED Colour', type: 'input' },
      { id: 'wavelength', label: 'Wavelength (λ)', unit: 'nm', type: 'input' },
      { id: 'vb', label: 'Barrier Potential (V_B)', unit: 'V', type: 'input' },
      { id: 'inv_lambda', label: '1/λ', unit: 'µm⁻¹', type: 'computed' },
      { id: 'h_indiv', label: 'Individual h', unit: '10⁻³⁴ J·s', type: 'computed' }
    ],
    defaultRows: [
      { color: 'Blue LED', wavelength: 470, vb: 2.68 },
      { color: 'Yellow LED', wavelength: 500, vb: 2.49 },
      { color: 'Green LED', wavelength: 565, vb: 2.19 },
      { color: 'Red LED', wavelength: 660, vb: 1.88 }
    ]
  },

  {
    id: 'photodiode',
    title: 'Study of I–V Characteristics of a Photodiode (Expt 3)',
    category: 'CHAMP Cycle 1 Experiments',
    categoryShort: 'Cycle 1: Expt 3',
    categoryIndex: 2,
    icon: 'fa-lightbulb',
    aim: 'To study current-voltage (I-V) characteristics of a photodiode under dark and illuminated conditions, and determine photocurrent, responsivity, and percentage change.',
    apparatus: 'Photodiode, regulated DC power supply (0-30V), microammeter (0-100 µA), voltmeter (0-10V), LED lamp source, optical track with millimeter scale.',
    formula: 'I_{ph} = I_{illum} - I_D  ;  Responsivity R = I_{ph} / P_{opt} (A/W)  ;  %Δ = [(I_{illum} - I_D) / I_D] × 100%',
    theory: 'A photodiode operates in reverse bias. In the dark, only a tiny reverse saturation dark current I_D flows. Under illumination, incident photons generate electron-hole pairs in the depletion region, generating a photocurrent I_ph proportional to optical power P_opt.',
    globals: {
      optical_power_mW: { label: 'Incident Optical Power (P_opt)', value: 0.50, unit: 'mW' }
    },
    units: {},
    columns: [
      { id: 'voltage', label: 'Reverse Voltage (V_R)', unit: 'V', type: 'input' },
      { id: 'dark_current', label: 'Dark Current (I_D)', unit: 'µA', type: 'input' },
      { id: 'illum_current', label: 'Illuminated Current (I_illum)', unit: 'µA', type: 'input' },
      { id: 'photocurrent', label: 'Photocurrent (I_ph)', unit: 'µA', type: 'computed' },
      { id: 'pct_change', label: '% Change (%Δ)', unit: '%', type: 'computed' }
    ],
    defaultRows: [
      { voltage: 0.5, dark_current: 0.08, illum_current: 14.5 },
      { voltage: 1.0, dark_current: 0.12, illum_current: 24.2 },
      { voltage: 2.0, dark_current: 0.18, illum_current: 38.6 },
      { voltage: 3.0, dark_current: 0.22, illum_current: 48.0 },
      { voltage: 4.0, dark_current: 0.25, illum_current: 54.1 },
      { voltage: 5.0, dark_current: 0.27, illum_current: 58.2 }
    ]
  },

  {
    id: 'quantum_tunneling',
    title: 'Simulating Quantum Tunneling Through a Potential Barrier (Expt 4)',
    category: 'CHAMP Cycle 1 Experiments',
    categoryShort: 'Cycle 1: Expt 4',
    categoryIndex: 2,
    icon: 'fa-wave-square',
    aim: 'To simulate quantum mechanical tunneling of a particle through a potential barrier and understand the dependence of transmission probability (T) on energy and barrier width.',
    apparatus: 'Simulation platform / computing environment, 1D Schrödinger solver module.',
    formula: 'T = [1 + (V_0² sinh²(κ a)) / (4E(V_0 - E))]⁻¹  ;  κ = √(2m(V_0 - E)) / ħ  ;  ln(T) ∝ -2κa',
    theory: 'In quantum mechanics, a wave packet has a non-zero probability of tunneling through a classically forbidden potential barrier (E < V0). The transmission coefficient T decays exponentially with barrier width a and decay parameter κ.',
    globals: {
      barrier_height_eV: { label: 'Barrier Height (V_0)', value: 10.0, unit: 'eV' },
      barrier_width_angstrom: { label: 'Barrier Width (a)', value: 1.5, unit: 'Å' }
    },
    units: {},
    columns: [
      { id: 'energy', label: 'Particle Energy (E)', unit: 'eV', type: 'input' },
      { id: 'trans_amp', label: 'Transmitted Amp |t|', unit: '', type: 'input' },
      { id: 't_obs', label: 'Observed T = |t|²', unit: '', type: 'computed' },
      { id: 't_calc', label: 'Calculated T(E)', unit: '', type: 'computed' },
      { id: 'ln_t', label: 'ln(T)', unit: '', type: 'computed' }
    ],
    defaultRows: [
      { energy: 2.0, trans_amp: 0.015 },
      { energy: 3.5, trans_amp: 0.042 },
      { energy: 5.0, trans_amp: 0.098 },
      { energy: 6.5, trans_amp: 0.195 },
      { energy: 8.0, trans_amp: 0.365 },
      { energy: 9.2, trans_amp: 0.580 }
    ]
  },

  // =========================================================================
  // CATEGORY 3: CHAMP CYCLE 2 (QUANTUM MECHANICS & QUANTUM COMPUTING)
  // =========================================================================
  {
    id: 'electron_diffraction',
    title: 'Electron Diffraction & de Broglie Wavelength (Expt 5)',
    category: 'CHAMP Cycle 2 Experiments',
    categoryShort: 'Cycle 2: Expt 5',
    categoryIndex: 3,
    icon: 'fa-circle-nodes',
    aim: 'To observe electron diffraction on polycrystalline graphite, confirm the wave nature of matter, and calculate & compare de Broglie and Bragg wavelengths.',
    apparatus: 'Electron diffraction tube with graphite target, tube holder, high voltage power supply (3 to 5 kV), analogue/digital multimeter, vernier caliper.',
    formula: 'λ_{Bragg} = 2d·sin(½ arctan(D / 2L)) ≈ d·D / (2L)  ;  λ_{dB} = h / √(2m_e e V)  ;  K = eV',
    theory: 'Fast electrons accelerated by voltage V strike thin polycrystalline graphite. Constructive interference from atomic planes produces concentric rings on the fluorescent screen. Measuring ring diameters for outer ring (d1 = 123 pm) and inner ring (d2 = 213 pm) verifies de Broglie’s relationship.',
    globals: {
      screen_distance_L_mm: { label: 'Distance Target to Screen (L)', value: 135.0, unit: 'mm' },
      d_inner_pm: { label: 'Inner Ring d (d₂)', value: 213.0, unit: 'pm' },
      d_outer_pm: { label: 'Outer Ring d (d₁)', value: 123.0, unit: 'pm' }
    },
    units: {},
    columns: [
      { id: 'voltage', label: 'Voltage (V)', unit: 'kV', type: 'input' },
      { id: 'ring_type', label: 'Ring Plane', type: 'input', inputType: 'text', placeholder: 'Inner Ring / Outer Ring' },
      { id: 'diameter', label: 'Diameter (D)', unit: 'mm', type: 'input' },
      { id: 'theta_deg', label: 'Angle θ', unit: '°', type: 'computed' },
      { id: 'lambda_bragg', label: 'λ_Bragg', unit: 'pm', type: 'computed' },
      { id: 'lambda_db', label: 'λ_deBroglie', unit: 'pm', type: 'computed' }
    ],
    defaultRows: [
      { voltage: 3.0, ring_type: 'Inner Ring', diameter: 28.4 },
      { voltage: 3.0, ring_type: 'Outer Ring', diameter: 48.8 },
      { voltage: 4.0, ring_type: 'Inner Ring', diameter: 24.6 },
      { voltage: 4.0, ring_type: 'Outer Ring', diameter: 42.4 },
      { voltage: 5.0, ring_type: 'Inner Ring', diameter: 22.0 },
      { voltage: 5.0, ring_type: 'Outer Ring', diameter: 38.0 }
    ]
  },

  {
    id: 'heisenberg_uncertainty',
    title: 'Heisenberg’s Uncertainty Principle via Single-Slit (Expt 6)',
    category: 'CHAMP Cycle 2 Experiments',
    categoryShort: 'Cycle 2: Expt 6',
    categoryIndex: 3,
    icon: 'fa-arrows-split-up-and-left',
    aim: 'To observe single-slit diffraction patterns, calculate slit widths (d), determine the uncertainty in momentum (Δpy), and verify Heisenberg’s Uncertainty Principle (Δy·Δpy ≥ h/4π).',
    apparatus: 'Diode laser source (λ = 650 nm), single slit cell on kinematic mount, detector with pinhole photodiode and translation micrometer stage, optical rail.',
    formula: 'd = m·λ / sin(θ_m)  ;  θ_1 = arctan(a / D)  ;  Δy = d  ;  Δp_y = (h/λ)·sin(θ_1) ⟹ Δy·Δp_y ≈ h',
    theory: 'Confining photons through a slit of width d introduces a spatial localization uncertainty Δy = d. Diffraction spreads the beam over an angular half-width θ, imparting an uncertainty in transverse momentum Δpy = p·sin(θ). Their product satisfies Heisenberg’s uncertainty limit.',
    globals: {
      laser_wavelength_nm: { label: 'Laser Wavelength (λ)', value: 650.0, unit: 'nm' }
    },
    units: {},
    columns: [
      { id: 'order', label: 'Diffraction Order (m)', type: 'input' },
      { id: 'dist_D_mm', label: 'Distance to Screen (D)', unit: 'mm', type: 'input' },
      { id: 'dist_a_mm', label: 'Distance to Minima (a)', unit: 'mm', type: 'input' },
      { id: 'theta_deg', label: 'θ_m = arctan(a/D)', unit: '°', type: 'computed' },
      { id: 'slit_width_um', label: 'Slit Width (d)', unit: 'µm', type: 'computed' },
      { id: 'uncertainty_prod', label: 'Δy·Δpy / h', unit: '', type: 'computed' }
    ],
    defaultRows: [
      { order: 1, dist_D_mm: 700, dist_a_mm: 3.8 },
      { order: 2, dist_D_mm: 700, dist_a_mm: 7.6 },
      { order: 3, dist_D_mm: 700, dist_a_mm: 11.4 },
      { order: 1, dist_D_mm: 850, dist_a_mm: 4.6 },
      { order: 2, dist_D_mm: 850, dist_a_mm: 9.2 }
    ]
  },

  {
    id: 'single_qubit_bloch',
    title: 'Single Qubit States & Quantum Gates (Expt 7)',
    category: 'CHAMP Cycle 2 Experiments',
    categoryShort: 'Cycle 2: Expt 7',
    categoryIndex: 3,
    icon: 'fa-globe',
    aim: 'To simulate single-qubit states on the Bloch sphere and analyze the transformation actions of Pauli-X, Pauli-Y, Pauli-Z, and Hadamard quantum gates.',
    apparatus: 'Quantum simulation runtime environment, Bloch sphere vector visualizer.',
    formula: '|ψ⟩ = cos(θ/2)|0⟩ + e^{iφ}sin(θ/2)|1⟩  ;  X|ψ⟩, Y|ψ⟩, Z|ψ⟩, H|ψ⟩  ;  ⟨ψ|ψ⟩ = 1',
    theory: 'A qubit exists in a superposition of |0⟩ and |1⟩ parameterized by polar angle θ and azimuthal angle φ on the unit Bloch sphere. Quantum logic gates act as unitary rotations: Pauli-X is a bit-flip (NOT), Pauli-Z is a phase-flip, Pauli-Y combines bit and phase flips, and Hadamard creates equal superposition states.',
    globals: {
      active_gate: { label: 'Quantum Gate Test', value: 'X', options: ['X', 'Y', 'Z', 'H'] }
    },
    units: {},
    columns: [
      { id: 'label', label: 'Target State', type: 'input' },
      { id: 'theta_rad', label: 'Polar Angle (θ)', unit: 'rad', type: 'input' },
      { id: 'phi_rad', label: 'Azimuthal Angle (φ)', unit: 'rad', type: 'input' },
      { id: 'state_str', label: 'State Vector |ψ⟩', type: 'computed' },
      { id: 'transformed_state', label: 'Transformed Gate |ψ’⟩', type: 'computed' },
      { id: 'norm', label: 'Norm ⟨ψ|ψ⟩', type: 'computed' }
    ],
    defaultRows: [
      { label: '|0⟩ ground', theta_rad: 0, phi_rad: 0 },
      { label: '|1⟩ excited', theta_rad: 3.1416, phi_rad: 0 },
      { label: '|+⟩ superposition', theta_rad: 1.5708, phi_rad: 0 },
      { label: '|-⟩ phase-flip', theta_rad: 1.5708, phi_rad: 3.1416 },
      { label: '|+i⟩ circular', theta_rad: 1.5708, phi_rad: 1.5708 },
      { label: '|-i⟩ circular', theta_rad: 1.5708, phi_rad: 4.7124 }
    ]
  },

  {
    id: 'two_qubit_entanglement',
    title: 'Two-Qubit States, CNOT & SWAP Gates (Expt 8)',
    category: 'CHAMP Cycle 2 Experiments',
    categoryShort: 'Cycle 2: Expt 8',
    categoryIndex: 3,
    icon: 'fa-network-wired',
    aim: 'To simulate two-qubit quantum states, examine operations of CNOT and SWAP gates, and evaluate separability versus quantum entanglement.',
    apparatus: 'Quantum circuit simulator, two-qubit state vector engine.',
    formula: '|Ψ⟩ = c₀₀|00⟩ + c₀₁|01⟩ + c₁₀|10⟩ + c₁₁|11⟩  ;  CNOT|c, t⟩ = |c, t ⊕ c⟩  ;  SWAP|a, b⟩ = |b, a⟩',
    theory: 'A two-qubit system exists in a 4D Hilbert space. If a joint state can be written as |ψ₁⟩ ⊗ |ψ₂⟩, it is separable and each qubit has individual Bloch sphere coordinates. If no such factorization exists (e.g. Bell states (|00⟩ + |11⟩)/√2), the qubits are entangled and exhibit non-local quantum correlations.',
    globals: {
      target_gate: { label: 'Two-Qubit Gate', value: 'CNOT', options: ['CNOT', 'SWAP'] }
    },
    units: {},
    columns: [
      { id: 'input_state', label: 'Two-Qubit State |Ψ⟩', type: 'input' },
      { id: 'cnot_result', label: 'CNOT |Ψ⟩', type: 'computed' },
      { id: 'swap_result', label: 'SWAP |Ψ⟩', type: 'computed' },
      { id: 'entanglement', label: 'State Nature', type: 'computed' },
      { id: 'bloch_angles', label: 'Bloch (θ₁, φ₁ ; θ₂, φ₂)', type: 'computed' }
    ],
    defaultRows: [
      { input_state: '|00⟩' },
      { input_state: '|01⟩' },
      { input_state: '|10⟩' },
      { input_state: '|11⟩' },
      { input_state: '1/√2(|00⟩ + |11⟩)' },
      { input_state: '1/√2(|01⟩ + |10⟩)' },
      { input_state: '1/2(|00⟩ + |01⟩ + |10⟩ + |11⟩)' },
      { input_state: '1/√2(|00⟩ - |11⟩)' }
    ]
  }
];

export function getExperimentById(id) {
  return EXPERIMENTS_REGISTRY.find(e => e.id === id) || EXPERIMENTS_REGISTRY[0];
}
