/**
 * BAPHY105 Engineering Physics CHAMP Lab Suite - Unified Production Bundle
 * Covers all official BAPHY105 experiments from VIT Chennai manual.
 * 100% Offline & Direct File System (file://) compatible.
 */

(function() {
  'use strict';

  // ==========================================
  // 1. CONSTANTS & UTILITIES
  // ==========================================
  const CONSTANTS = {
    c: 2.99792458e8,
    e: 1.602176634e-19,
    h: 6.62607015e-34,
    hbar: 1.054571817e-34,
    m_e: 9.1093837015e-31,
    g: 9.80665,
    k_B: 1.380649e-23
  };

  function calculatePercentError(experimental, accepted) {
    if (!accepted || isNaN(experimental) || isNaN(accepted) || !isFinite(experimental)) return null;
    return (Math.abs(experimental - accepted) / Math.abs(accepted)) * 100;
  }

  function computeMean(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((acc, v) => acc + v, 0) / arr.length;
  }

  function computeStdDev(arr, mean) {
    if (!arr || arr.length <= 1) return 0;
    const m = mean !== undefined ? mean : computeMean(arr);
    const variance = arr.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (arr.length - 1);
    return Math.sqrt(variance);
  }

  function formatNum(v) {
    if (Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3 && v !== 0)) {
      return v.toExponential(3);
    }
    return v.toFixed(3);
  }

  function computeLinearRegression(points) {
    const valid = points.filter(p => 
      p && typeof p.x === 'number' && typeof p.y === 'number' && 
      !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
    );

    const n = valid.length;
    if (n < 2) return { isValid: false, count: n };

    const xVals = valid.map(p => p.x);
    const yVals = valid.map(p => p.y);
    const xMean = computeMean(xVals);
    const yMean = computeMean(yVals);

    let Sxx = 0, Syy = 0, Sxy = 0;
    for (let i = 0; i < n; i++) {
      const dx = xVals[i] - xMean;
      const dy = yVals[i] - yMean;
      Sxx += dx * dx;
      Syy += dy * dy;
      Sxy += dx * dy;
    }

    if (Math.abs(Sxx) < 1e-18) return { isValid: false, count: n };

    const slope = Sxy / Sxx;
    const intercept = yMean - slope * xMean;

    let r2 = 0;
    if (Syy > 1e-18) {
      const r = Sxy / Math.sqrt(Sxx * Syy);
      r2 = Math.min(1.0, Math.max(0.0, r * r));
    } else {
      r2 = 1.0;
    }

    const residuals = [];
    let ssRes = 0;
    for (let i = 0; i < n; i++) {
      const yFit = slope * xVals[i] + intercept;
      const res = yVals[i] - yFit;
      ssRes += res * res;
      residuals.push({ x: xVals[i], y: yVals[i], yFit, residual: res, index: i });
    }

    let stdErrorOfSlope = 0;
    let stdErrorOfIntercept = 0;
    let residualStdDev = 0;
    if (n > 2) {
      residualStdDev = Math.sqrt(ssRes / (n - 2));
      stdErrorOfSlope = residualStdDev / Math.sqrt(Sxx);
      stdErrorOfIntercept = residualStdDev * Math.sqrt((1 / n) + (xMean * xMean) / Sxx);
    }

    return {
      isValid: true,
      count: n,
      slope,
      intercept,
      r2,
      stdErrorOfSlope,
      stdErrorOfIntercept,
      residualStdDev,
      residuals,
      minX: Math.min(...xVals),
      maxX: Math.max(...xVals),
      minY: Math.min(...yVals),
      maxY: Math.max(...yVals),
      equation: `y = ${formatNum(slope)}x ${intercept >= 0 ? '+ ' + formatNum(intercept) : '- ' + formatNum(Math.abs(intercept))}`
    };
  }

  // ==========================================
  // 2. BAPHY105 EXPERIMENTS REGISTRY
  // ==========================================
  const EXPERIMENTS_REGISTRY = [
    {
      id: 'screw_gauge',
      title: 'Screw Gauge (Measurement of Thickness)',
      category: 'Preparatory Tools & Experiments',
      categoryShort: 'Tool I',
      categoryIndex: 1,
      icon: 'fa-compress',
      aim: 'To learn the operation of a screw gauge and determine the thickness of a given object (glass plate) with zero error corrections.',
      apparatus: 'Screw gauge (100 divisions, pitch 1 mm), glass plate specimen, magnifying lens.',
      formula: 'Pitch = (Distance Moved) / (Rotations)  ;  LC = Pitch / 100 = 0.01 mm  ;  Corrected Reading = T.R. ± Z.C.',
      theory: 'A screw gauge operates on the principle of a screw. Pitch scale gives whole millimeters, and circular head scale gives hundredths of a millimeter. When studs touch, zero error is noted and compensated.',
      globals: {
        zero_error_div: { label: 'Zero Error (divisions)', value: -3, unit: 'div' },
        pitch_mm: { label: 'Screw Pitch', value: 1.0, unit: 'mm' },
        circular_divisions: { label: 'Head Scale Divisions', value: 100, unit: 'div' }
      },
      units: { length: 'mm' },
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
      categoryShort: 'Tool II',
      categoryIndex: 1,
      icon: 'fa-ruler',
      aim: 'To learn the operation of vernier calipers and measure the dimensions and volume of a rectangular wooden block.',
      apparatus: 'Vernier calipers (10 V.S.D = 9 M.S.D, LC = 0.01 cm), rectangular wooden block specimen.',
      formula: 'LC = 1 M.S.D - 1 V.S.D = 0.01 cm  ;  Total Reading = M.S.R + (V.S.C × LC)  ;  Volume = l × b × h',
      theory: 'Vernier calipers consist of a fixed main scale in mm/cm and a sliding vernier scale. Least count is 0.01 cm.',
      globals: {
        zero_correction_cm: { label: 'Zero Correction (Z.C)', value: 0.00, unit: 'cm' }
      },
      units: { length: 'cm' },
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
      categoryShort: 'Tool III',
      categoryIndex: 1,
      icon: 'fa-microscope',
      aim: 'To learn the operation of the travelling microscope and determine the internal diameter and radius of a capillary tube.',
      apparatus: 'Travelling microscope (LC = 0.001 cm), capillary tube mounted horizontally/vertically, reading lens.',
      formula: 'LC = 1 M.S.D - 1 V.S.D = 0.05 cm - 0.049 cm = 0.001 cm  ;  Diameter D = |R₁ - R₂|  ;  Radius r = D / 2',
      theory: 'The compound microscope traverses on precision millimeter tracks. Vernier scale (50 VSD = 49 MSD) enables 0.001 cm precision.',
      globals: {},
      units: { length: 'cm' },
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
      categoryShort: 'Tool IV',
      categoryIndex: 1,
      icon: 'fa-ring',
      aim: 'To learn the operation of the spectrometer, determine its least count, and evaluate the prism angle (A) and refractive index (µ).',
      apparatus: 'Spectrometer (LC = 1’), equilateral flint glass prism, sodium vapour lamp source, reading lens.',
      formula: 'LC = 1 M.S.D - 1 V.S.D = 30’ - 29’ = 1’  ;  A = |R₁ - R₂| / 2  ;  µ = sin((A + δ_m) / 2) / sin(A / 2)',
      theory: 'The spectrometer consists of collimator, prism table, and telescope. Circular scale Verniers give 1 arcminute resolution.',
      globals: {
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
      theory: 'A solar cell is a p-n junction photovoltaic device. Incident photons create electron-hole pairs separated by the internal junction field. By varying load resistance from 0.1 kΩ to 10 kΩ, current-voltage (I-V) and power-voltage (P-V) curves are generated.',
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
      apparatus: 'Voltage source (3V), potentiometer, multimeters, breadboard, calibrated LEDs (Blue 470nm, Yellow 500nm, Green 565nm, Red 660nm).',
      formula: 'eV_B = h·c/λ ⟹ h = V_B·λ·(e/c)  ;  V_B = (h·c/e) · (1/λ) ⟹ Slope = h·c/e ⟹ h = Slope · (e/c)',
      theory: 'Electrons and holes recombine in the junction emitting photons of energy hν ≈ eV_B. Plotting V_B vs 1/λ yields a linear relationship whose slope determines Planck’s constant h.',
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
      apparatus: 'Photodiode, regulated DC power supply (0-30V), microammeter, voltmeter, LED lamp source, optical track.',
      formula: 'I_{ph} = I_{illum} - I_D  ;  Responsivity R = I_{ph} / P_{opt} (A/W)  ;  %Δ = [(I_{illum} - I_D) / I_D] × 100%',
      theory: 'A photodiode operates in reverse bias. Dark current I_D flows in darkness. Illumination generates photocurrent I_ph proportional to optical power P_opt.',
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
      theory: 'A quantum particle has a finite probability of tunneling through a barrier higher than its kinetic energy. Transmission coefficient decays exponentially with barrier width a.',
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
    {
      id: 'electron_diffraction',
      title: 'Electron Diffraction & de Broglie Wavelength (Expt 5)',
      category: 'CHAMP Cycle 2 Experiments',
      categoryShort: 'Cycle 2: Expt 5',
      categoryIndex: 3,
      icon: 'fa-circle-nodes',
      aim: 'To observe electron diffraction on polycrystalline graphite, confirm the wave nature of matter, and calculate & compare de Broglie and Bragg wavelengths.',
      apparatus: 'Electron diffraction tube with graphite target, tube holder, high voltage power supply (3 to 5 kV), multimeter, vernier caliper.',
      formula: 'λ_{Bragg} = 2d·sin(½ arctan(D / 2L)) ≈ d·D / (2L)  ;  λ_{dB} = h / √(2m_e e V)  ;  K = eV',
      theory: 'Electrons accelerated by voltage V strike thin graphite foil. Concentric Debye-Scherrer rings form with inner ring d2 = 213 pm and outer ring d1 = 123 pm.',
      globals: {
        screen_distance_L_mm: { label: 'Distance Target to Screen (L)', value: 135.0, unit: 'mm' },
        d_inner_pm: { label: 'Inner Ring d (d₂)', value: 213.0, unit: 'pm' },
        d_outer_pm: { label: 'Outer Ring d (d₁)', value: 123.0, unit: 'pm' }
      },
      units: {},
      columns: [
        { id: 'voltage', label: 'Voltage (V)', unit: 'kV', type: 'input' },
        { id: 'ring_type', label: 'Ring Plane', type: 'input' },
        { id: 'diameter', label: 'Diameter (D)', unit: 'mm', type: 'input' },
        { id: 'theta_deg', label: 'Angle θ', unit: '°', type: 'computed' },
        { id: 'lambda_bragg', label: 'λ_Bragg', unit: 'pm', type: 'computed' },
        { id: 'lambda_db', label: 'λ_deBroglie', unit: 'pm', type: 'computed' }
      ],
      defaultRows: [
        { voltage: 3.0, ring_type: 'Inner (d=213pm)', diameter: 28.4 },
        { voltage: 3.0, ring_type: 'Outer (d=123pm)', diameter: 48.8 },
        { voltage: 4.0, ring_type: 'Inner (d=213pm)', diameter: 24.6 },
        { voltage: 4.0, ring_type: 'Outer (d=123pm)', diameter: 42.4 },
        { voltage: 5.0, ring_type: 'Inner (d=213pm)', diameter: 22.0 },
        { voltage: 5.0, ring_type: 'Outer (d=123pm)', diameter: 38.0 }
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
      apparatus: 'Diode laser source (λ = 650 nm), single slit on kinematic mount, detector with pinhole photodiode and translation micrometer stage.',
      formula: 'd = m·λ / sin(θ_m)  ;  θ_1 = arctan(a / D)  ;  Δy = d  ;  Δp_y = (h/λ)·sin(θ_1) ⟹ Δy·Δp_y ≈ h',
      theory: 'Squeezing photons through slit width d induces momentum spread Δpy along transverse axis, satisfying quantum uncertainty product.',
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
      theory: 'A qubit exists in a superposition of |0⟩ and |1⟩ parameterized by polar angle θ and azimuthal angle φ on the unit Bloch sphere. Quantum logic gates act as unitary rotations.',
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
      theory: 'A two-qubit state is separable if factorable as |ψ₁⟩ ⊗ |ψ₂⟩. If non-factorable (e.g. Bell states), the qubits are entangled and exhibit non-local quantum correlations.',
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

  function getExperimentById(id) {
    return EXPERIMENTS_REGISTRY.find(e => e.id === id) || EXPERIMENTS_REGISTRY[4]; // default to solar cell
  }

  // ==========================================
  // 3. COMPUTATIONAL ENGINES (ALL 12 SYLLABUS EXPERIMENTS)
  // ==========================================
  const EXPERIMENT_CALCULATORS = {
    // ----------------------------------------------------
    // 1. SCREW GAUGE
    // ----------------------------------------------------
    screw_gauge: (rows, globals) => {
      const pitch = parseFloat(globals.pitch_mm) || 1.0;
      const divisions = parseFloat(globals.circular_divisions) || 100;
      const lc = pitch / divisions; // 0.01 mm
      const zeDiv = parseFloat(globals.zero_error_div) || 0;
      const zc = -(zeDiv * lc); // Zero correction in mm

      const tableRows = [];
      const crValues = [];

      rows.forEach(row => {
        const psr = parseFloat(row.psr);
        const hsc = parseFloat(row.hsc);

        if (!isNaN(psr) && !isNaN(hsc)) {
          const hsr = hsc * lc;
          const tr = psr + hsr;
          const cr = tr + zc;
          crValues.push(cr);

          tableRows.push({
            ...row,
            hsr: hsr.toFixed(3),
            tr: tr.toFixed(3),
            cr: cr.toFixed(3)
          });
        } else {
          tableRows.push({ ...row, hsr: '—', tr: '—', cr: '—' });
        }
      });

      const meanThickness = computeMean(crValues);
      const stdDev = computeStdDev(crValues, meanThickness);

      return {
        tableRows,
        plot: {
          isPrecisionBand: true,
          points: crValues.map((v, i) => ({ x: i + 1, y: v, label: `Trial ${i + 1}: ${v.toFixed(3)} mm` })),
          mean: meanThickness,
          stdDev: stdDev,
          unit: 'mm',
          xLabel: 'Observation Trial (#)',
          yLabel: 'Corrected Thickness (mm)'
        },
        results: [
          { label: 'Mean Specimen Thickness', value: crValues.length > 0 ? meanThickness.toFixed(3) : '—', unit: 'mm', uncertainty: `±${stdDev.toFixed(3)}` },
          { label: 'Thickness in Centimeters', value: crValues.length > 0 ? (meanThickness / 10).toFixed(4) : '—', unit: 'cm' },
          { label: 'Instrument Least Count (LC)', value: lc.toFixed(3), unit: 'mm', formula: 'Pitch / Head Divisions' },
          { label: 'Zero Correction (ZC)', value: zc >= 0 ? `+${zc.toFixed(3)}` : zc.toFixed(3), unit: 'mm', formula: '- (Zero Error × LC)' }
        ]
      };
    },

    // ----------------------------------------------------
    // 2. VERNIER CALIPERS
    // ----------------------------------------------------
    vernier_calipers: (rows, globals) => {
      const lc = 0.01; // cm (0.1 mm)
      const zc = parseFloat(globals.zero_correction_cm) || 0.00;

      const tableRows = [];
      const crValues = [];

      rows.forEach(row => {
        const msr = parseFloat(row.msr);
        const vsc = parseFloat(row.vsc);

        if (!isNaN(msr) && !isNaN(vsc)) {
          const vsr = vsc * lc;
          const tr = msr + vsr;
          const cr = tr + zc;
          crValues.push(cr);

          tableRows.push({
            ...row,
            vsr: vsr.toFixed(3),
            tr: tr.toFixed(3),
            cr: cr.toFixed(3)
          });
        } else {
          tableRows.push({ ...row, vsr: '—', tr: '—', cr: '—' });
        }
      });

      const meanDim = computeMean(crValues);
      const stdDev = computeStdDev(crValues, meanDim);

      return {
        tableRows,
        plot: {
          isPrecisionBand: true,
          points: crValues.map((v, i) => ({ x: i + 1, y: v, label: `${v.toFixed(3)} cm` })),
          mean: meanDim,
          stdDev: stdDev,
          unit: 'cm',
          xLabel: 'Observation Index',
          yLabel: 'Corrected Dimension (cm)'
        },
        results: [
          { label: 'Mean Measured Dimension', value: crValues.length > 0 ? meanDim.toFixed(3) : '—', unit: 'cm', uncertainty: `±${stdDev.toFixed(3)}` },
          { label: 'Dimension in Millimeters', value: crValues.length > 0 ? (meanDim * 10).toFixed(2) : '—', unit: 'mm' },
          { label: 'Least Count (LC)', value: '0.01', unit: 'cm', formula: '1 MSD - 1 VSD' },
          { label: 'Applied Zero Correction', value: zc.toFixed(3), unit: 'cm' }
        ]
      };
    },

    // ----------------------------------------------------
    // 3. TRAVELLING MICROSCOPE (CAPILLARY BORE RADIUS)
    // ----------------------------------------------------
    travelling_microscope: (rows) => {
      const lc = 0.001; // cm
      const tableRows = [];
      const readings = [];

      rows.forEach(row => {
        const msr = parseFloat(row.msr);
        const vsc = parseFloat(row.vsc);

        if (!isNaN(msr) && !isNaN(vsc)) {
          const vsr = vsc * lc;
          const reading = msr + vsr;
          readings.push(reading);

          tableRows.push({
            ...row,
            vsr: vsr.toFixed(4),
            reading: reading.toFixed(4)
          });
        } else {
          tableRows.push({ ...row, vsr: '—', reading: '—' });
        }
      });

      // According to official CHAMP Lab Manual:
      // Horizontal diameter: DH = |R2 - R1|
      // Vertical diameter: DV = |R4 - R3|
      // Mean diameter: D = (DH + DV) / 2
      // Bore radius: r = D / 2
      let dH = null, dV = null, meanD = null, radius = null, area = null;
      if (readings.length >= 4) {
        dH = Math.abs(readings[1] - readings[0]);
        dV = Math.abs(readings[3] - readings[2]);
        meanD = (dH + dV) / 2;
        radius = meanD / 2;
        area = Math.PI * Math.pow(radius, 2);
      } else if (readings.length >= 2) {
        dH = Math.abs(readings[1] - readings[0]);
        dV = dH;
        meanD = dH;
        radius = meanD / 2;
        area = Math.PI * Math.pow(radius, 2);
      }

      return {
        tableRows,
        plot: {
          isBore: true,
          dH: dH || 0.20,
          dV: dV || 0.20,
          meanD: meanD || 0.20,
          radius: radius || 0.10,
          area: area || (Math.PI * 0.01),
          readings: readings
        },
        results: [
          { label: 'Mean Bore Diameter (D)', value: meanD !== null ? meanD.toFixed(4) : '—', unit: 'cm', formula: '(DH + DV) / 2' },
          { label: 'Horizontal Diameter (DH)', value: dH !== null ? dH.toFixed(4) : '—', unit: 'cm', formula: '|R₂ - R₁|' },
          { label: 'Vertical Diameter (DV)', value: dV !== null ? dV.toFixed(4) : '—', unit: 'cm', formula: '|R₄ - R₃|' },
          { label: 'Internal Bore Radius (r)', value: radius !== null ? radius.toFixed(4) : '—', unit: 'cm', formula: 'D / 2' },
          { label: 'Radius in Millimeters', value: radius !== null ? (radius * 10).toFixed(3) : '—', unit: 'mm' },
          { label: 'Cross-Sectional Area (A)', value: area !== null ? (area * 100).toFixed(3) : '—', unit: 'mm²', formula: 'π·r²' },
          { label: 'Least Count (LC)', value: '0.001', unit: 'cm', formula: '1 MSD - 1 VSD (50 VSD = 49 MSD)' }
        ]
      };
    },

    // ----------------------------------------------------
    // 4. SPECTROMETER (PRISM ANGLE & REFRACTIVE INDEX)
    // ----------------------------------------------------
    spectrometer: (rows, globals) => {
      const tableRows = [];
      const trVals = [];

      rows.forEach(row => {
        const msr = parseFloat(row.msr_deg);
        const vsc = parseFloat(row.vsc_min);

        if (!isNaN(msr) && !isNaN(vsc)) {
          const tr = msr + (vsc / 60);
          trVals.push(tr);
          tableRows.push({
            ...row,
            tr_deg: `${Math.floor(tr)}° ${(Math.round((tr % 1) * 60))}'`
          });
        } else {
          tableRows.push({ ...row, tr_deg: '—' });
        }
      });

      // In official CHAMP manual:
      // Vernier 1: A_V1 = |R2 - R1| / 2
      // Vernier 2: A_V2 = |R4 - R3| / 2
      // Mean A = (A_V1 + A_V2) / 2
      let A_V1 = 60.0, A_V2 = 60.0, meanA = 60.0;
      if (trVals.length >= 4) {
        let diff1 = Math.abs(trVals[1] - trVals[0]);
        if (diff1 > 180) diff1 = 360 - diff1;
        A_V1 = diff1 / 2;

        let diff2 = Math.abs(trVals[3] - trVals[2]);
        if (diff2 > 180) diff2 = 360 - diff2;
        A_V2 = diff2 / 2;

        meanA = (A_V1 + A_V2) / 2;
      } else if (trVals.length >= 2) {
        let diff = Math.abs(trVals[1] - trVals[0]);
        if (diff > 180) diff = 360 - diff;
        meanA = diff / 2;
        A_V1 = meanA;
        A_V2 = meanA;
      }

      const deltaM = parseFloat(globals.delta_m_deg) || 49.5;
      const A_rad = (meanA * Math.PI) / 180;
      const D_rad = (deltaM * Math.PI) / 180;
      const mu = Math.sin((A_rad + D_rad) / 2) / Math.sin(A_rad / 2);
      const critAngle_deg = (Math.asin(1 / mu) * 180) / Math.PI;

      return {
        tableRows,
        plot: {
          isPrism: true,
          A: meanA,
          deltaM: deltaM,
          mu: mu,
          AV1: A_V1,
          AV2: A_V2
        },
        results: [
          { label: 'Mean Prism Angle (A)', value: meanA.toFixed(2), unit: '°', formula: '(A_V1 + A_V2) / 2' },
          { label: 'Prism Angle from Vernier 1', value: A_V1.toFixed(2), unit: '°', formula: '|R₂ - R₁| / 2' },
          { label: 'Prism Angle from Vernier 2', value: A_V2.toFixed(2), unit: '°', formula: '|R₄ - R₃| / 2' },
          { label: 'Angle of Minimum Deviation (δm)', value: deltaM.toFixed(2), unit: '°' },
          { label: 'Refractive Index of Glass (µ)', value: mu.toFixed(4), formula: 'sin((A + δm)/2) / sin(A/2)' },
          { label: 'Critical Angle (θc)', value: critAngle_deg.toFixed(2), unit: '°', formula: 'arcsin(1 / µ)' },
          { label: 'Instrument Least Count', value: '1’', unit: 'arcminute', formula: '1 MSD / 30' }
        ]
      };
    },

    // ----------------------------------------------------
    // 5. SOLAR CELL (CHAMP EXPT 1)
    // ----------------------------------------------------
    solar_cell: (rows, globals) => {
      const pointsIV = [];
      const pointsPV = [];
      const tableRows = [];

      let Pmax = 0, Vmp = 0, Imp = 0;

      rows.forEach((row, i) => {
        const V = parseFloat(row.voltage);
        const I = parseFloat(row.current); // mA

        if (!isNaN(V) && !isNaN(I)) {
          const P_mW = V * I;
          pointsIV.push({ x: V, y: I, id: i });
          pointsPV.push({ x: V, y: P_mW, id: i });

          if (P_mW > Pmax) {
            Pmax = P_mW;
            Vmp = V;
            Imp = I;
          }

          tableRows.push({ ...row, power_mW: P_mW.toFixed(2) });
        } else {
          tableRows.push({ ...row, power_mW: '—' });
        }
      });

      const Voc = pointsIV.length > 0 ? Math.max(...pointsIV.map(p => p.x)) : 0;
      const Isc = pointsIV.length > 0 ? Math.max(...pointsIV.map(p => p.y)) : 0;
      const fillFactor = (Voc > 0 && Isc > 0) ? Pmax / (Voc * Isc) : 0;

      const I0 = parseFloat(globals.incident_intensity) || 100.0; // W/m^2
      const Area = parseFloat(globals.cell_area) || 0.0004; // m^2 (4 cm^2)
      const Pin_mW = I0 * Area * 1000;
      const efficiency = Pin_mW > 0 ? (Pmax / Pin_mW) * 100 : 0;

      return {
        tableRows,
        plot: {
          xLabel: 'Voltage V (V)',
          yLabel: 'Current I (mA) & Power P (mW)',
          dualSeries: [
            { name: 'I-V Curve', points: pointsIV, color: '#06b6d4' },
            { name: 'P-V Curve', points: pointsPV, color: '#f59e0b' }
          ],
          isCurve: true,
          mpp: { V: Vmp, I: Imp, P: Pmax }
        },
        results: [
          { label: 'Open-Circuit Voltage (Voc)', value: Voc.toFixed(3), unit: 'V' },
          { label: 'Short-Circuit Current (Isc)', value: Isc.toFixed(2), unit: 'mA' },
          { label: 'Maximum Power Output (Pmax)', value: Pmax.toFixed(2), unit: 'mW', formula: 'Vmp × Imp' },
          { label: 'Voltage at Max Power (Vmp)', value: Vmp.toFixed(3), unit: 'V' },
          { label: 'Current at Max Power (Imp)', value: Imp.toFixed(2), unit: 'mA' },
          { label: 'Fill Factor (FF)', value: fillFactor.toFixed(3), formula: 'Pmax / (Voc × Isc)' },
          { label: 'Power Conversion Efficiency (η)', value: efficiency.toFixed(2) + '%', formula: '[Pmax / (A · I₀)] × 100%' },
          { label: 'Circuit Configuration', value: (globals.config_mode || 'single').toUpperCase() }
        ]
      };
    },

    // ----------------------------------------------------
    // 6. PLANCK'S CONSTANT (CHAMP EXPT 2)
    // ----------------------------------------------------
    plancks_constant_led: (rows) => {
      const points = [];
      const tableRows = [];
      const hValues = [];

      rows.forEach((row, i) => {
        const lambda_nm = parseFloat(row.wavelength);
        const vb = parseFloat(row.vb);

        if (!isNaN(lambda_nm) && !isNaN(vb) && lambda_nm > 0 && vb > 0) {
          const invLambda_m = 1 / (lambda_nm * 1e-9); // m^-1
          const invLambda_um = 1000 / lambda_nm; // um^-1
          const h_i = (vb * (lambda_nm * 1e-9) * CONSTANTS.e) / CONSTANTS.c;

          points.push({ x: invLambda_m, y: vb, id: i });
          hValues.push(h_i);

          tableRows.push({
            ...row,
            inv_lambda: invLambda_um.toFixed(3),
            h_indiv: (h_i * 1e34).toFixed(3)
          });
        } else {
          tableRows.push({ ...row, inv_lambda: '—', h_indiv: '—' });
        }
      });

      const reg = computeLinearRegression(points);
      let h_slope = null;
      let errPct = null;

      if (reg.isValid && reg.slope > 0) {
        h_slope = (reg.slope * CONSTANTS.e) / CONSTANTS.c;
        errPct = calculatePercentError(h_slope, CONSTANTS.h);
      }
      const meanH = computeMean(hValues);

      return {
        tableRows,
        plot: {
          xLabel: 'Inverse Wavelength 1/λ (m⁻¹)',
          yLabel: 'Barrier Potential V_B (V)',
          points: points.map(p => ({ x: p.x, y: p.y, label: `1/λ=${p.x.toExponential(2)} m⁻¹, V_B=${p.y.toFixed(2)} V` })),
          regression: reg,
          fitFunction: reg.isValid ? (x) => reg.slope * x + reg.intercept : null
        },
        results: [
          { label: 'Planck’s Constant (from Slope)', value: h_slope !== null ? h_slope.toExponential(4) : '—', unit: 'J·s', formula: 'Slope × (e / c)' },
          { label: 'Mean Planck Constant (Row-wise)', value: hValues.length > 0 ? meanH.toExponential(4) : '—', unit: 'J·s', formula: 'V_B·λ·(e/c)' },
          { label: 'CODATA Accepted Constant (h)', value: CONSTANTS.h.toExponential(5), unit: 'J·s' },
          { label: 'Percentage Discrepancy', value: errPct !== null ? errPct.toFixed(2) + '%' : '—' },
          { label: 'R² (Linearity)', value: reg.isValid ? reg.r2.toFixed(5) : '—' }
        ]
      };
    },

    // ----------------------------------------------------
    // 7. PHOTODIODE (CHAMP EXPT 3)
    // ----------------------------------------------------
    photodiode: (rows, globals) => {
      const pOpt_mW = parseFloat(globals.optical_power_mW) || 0.50;
      const pointsDark = [];
      const pointsIllum = [];
      const tableRows = [];
      const respValues = [];

      rows.forEach((row, i) => {
        const v = parseFloat(row.voltage);
        const id = parseFloat(row.dark_current);
        const iIllum = parseFloat(row.illum_current);

        if (!isNaN(v) && !isNaN(id) && !isNaN(iIllum)) {
          const iph = iIllum - id;
          const pctChange = id > 0 ? ((iIllum - id) / id) * 100 : 0;
          const resp = pOpt_mW > 0 ? (iph * 1e-6) / (pOpt_mW * 1e-3) : 0;

          pointsDark.push({ x: v, y: id, id: i });
          pointsIllum.push({ x: v, y: iIllum, id: i });
          respValues.push(resp);

          tableRows.push({
            ...row,
            photocurrent: iph.toFixed(2),
            pct_change: pctChange.toFixed(1) + '%'
          });
        } else {
          tableRows.push({ ...row, photocurrent: '—', pct_change: '—' });
        }
      });

      const meanResp = computeMean(respValues);

      return {
        tableRows,
        plot: {
          xLabel: 'Reverse Voltage V_R (V)',
          yLabel: 'Current (µA)',
          dualSeries: [
            { name: 'Illuminated Current (I_illum)', points: pointsIllum, color: '#06b6d4' },
            { name: 'Dark Current (I_D)', points: pointsDark, color: '#f43f5e' }
          ],
          isCurve: true
        },
        results: [
          { label: 'Mean Responsivity (R)', value: respValues.length > 0 ? meanResp.toFixed(3) : '—', unit: 'A/W', formula: 'I_ph / P_opt' },
          { label: 'Maximum Photocurrent', value: tableRows.reduce((m, r) => Math.max(m, parseFloat(r.photocurrent) || 0), 0).toFixed(2), unit: 'µA' },
          { label: 'Incident Optical Power', value: pOpt_mW.toFixed(2), unit: 'mW' }
        ]
      };
    },

    // ----------------------------------------------------
    // 8. QUANTUM TUNNELING (CHAMP EXPT 4)
    // ----------------------------------------------------
    quantum_tunneling: (rows, globals) => {
      const V0 = parseFloat(globals.barrier_height_eV) || 10.0;
      const a_ang = parseFloat(globals.barrier_width_angstrom) || 1.5;
      const a_m = a_ang * 1e-10;

      const points = [];
      const tableRows = [];

      rows.forEach((row, i) => {
        const E = parseFloat(row.energy);
        const tAmp = parseFloat(row.trans_amp);

        if (!isNaN(E) && E > 0 && E < V0) {
          const E_j = E * CONSTANTS.e;
          const V0_j = V0 * CONSTANTS.e;
          const kappa = Math.sqrt(2 * CONSTANTS.m_e * (V0_j - E_j)) / CONSTANTS.hbar;
          const sinhVal = Math.sinh(kappa * a_m);
          const tCalc = 1 / (1 + (Math.pow(V0, 2) * Math.pow(sinhVal, 2)) / (4 * E * (V0 - E)));
          const tObs = !isNaN(tAmp) ? tAmp * tAmp : tCalc;

          points.push({ x: E, y: tCalc, id: i });

          tableRows.push({
            ...row,
            t_obs: tObs.toExponential(3),
            t_calc: tCalc.toExponential(3),
            ln_t: Math.log(tCalc).toFixed(2)
          });
        } else {
          tableRows.push({ ...row, t_obs: '—', t_calc: '—', ln_t: '—' });
        }
      });

      return {
        tableRows,
        plot: {
          xLabel: 'Particle Energy E (eV)',
          yLabel: 'Transmission Probability T',
          points: points.map(p => ({ x: p.x, y: p.y, label: `E=${p.x} eV, T=${p.y.toExponential(2)}` })),
          isCurve: true
        },
        results: [
          { label: 'Barrier Potential (V₀)', value: V0.toFixed(1), unit: 'eV' },
          { label: 'Barrier Width (a)', value: a_ang.toFixed(2), unit: 'Å' },
          { label: 'Decay Parameter (κ at mid-energy)', value: (Math.sqrt(2 * CONSTANTS.m_e * (V0 * 0.5 * CONSTANTS.e)) / CONSTANTS.hbar).toExponential(3), unit: 'm⁻¹', formula: '√(2m(V₀ - E)) / ħ' }
        ]
      };
    },

    // ----------------------------------------------------
    // 9. ELECTRON DIFFRACTION (CHAMP EXPT 5)
    // ----------------------------------------------------
    electron_diffraction: (rows, globals) => {
      const L_m = (parseFloat(globals.screen_distance_L_mm) || 135.0) * 1e-3;
      const d1_m = (parseFloat(globals.d_outer_pm) || 123.0) * 1e-12; // 123 pm
      const d2_m = (parseFloat(globals.d_inner_pm) || 213.0) * 1e-12; // 213 pm

      const points = [];
      const tableRows = [];
      const diffs = [];

      rows.forEach((row, i) => {
        const V_kV = parseFloat(row.voltage);
        const D_mm = parseFloat(row.diameter);
        const ringType = (row.ring_type || '').toLowerCase();

        if (!isNaN(V_kV) && !isNaN(D_mm) && V_kV > 0 && D_mm > 0) {
          const V = V_kV * 1000;
          const D_m = D_mm * 1e-3;
          const d_m = ringType.includes('outer') || ringType.includes('123') ? d1_m : d2_m;

          const theta = 0.5 * Math.atan(D_m / (2 * L_m));
          const lambdaBragg = 2 * d_m * Math.sin(theta);
          const lambdaDB = CONSTANTS.h / Math.sqrt(2 * CONSTANTS.m_e * CONSTANTS.e * V);

          points.push({ x: 1 / Math.sqrt(V), y: D_m, id: i });
          diffs.push(calculatePercentError(lambdaBragg, lambdaDB));

          tableRows.push({
            ...row,
            theta_deg: ((theta * 180) / Math.PI).toFixed(2) + '°',
            lambda_bragg: (lambdaBragg * 1e12).toFixed(2),
            lambda_db: (lambdaDB * 1e12).toFixed(2)
          });
        } else {
          tableRows.push({ ...row, theta_deg: '—', lambda_bragg: '—', lambda_db: '—' });
        }
      });

      const reg = computeLinearRegression(points);
      const meanDiff = computeMean(diffs);

      return {
        tableRows,
        plot: {
          xLabel: '1 / √V (V⁻¹/²)',
          yLabel: 'Ring Diameter D (m)',
          points: points.map(p => ({ x: p.x, y: p.y, label: `1/√V=${p.x.toFixed(4)}, D=${(p.y * 1000).toFixed(1)} mm` })),
          regression: reg,
          fitFunction: reg.isValid ? (x) => reg.slope * x + reg.intercept : null
        },
        results: [
          { label: 'Bragg vs de Broglie Agreement', value: (100 - meanDiff).toFixed(2) + '%', formula: '100% - Error%' },
          { label: 'Graphite d₁₁₀ (Inner Ring)', value: (d2_m * 1e12).toFixed(0), unit: 'pm' },
          { label: 'Graphite d₁₁₁ (Outer Ring)', value: (d1_m * 1e12).toFixed(0), unit: 'pm' },
          { label: 'Target to Screen Distance (L)', value: (L_m * 1000).toFixed(1), unit: 'mm' },
          { label: 'R² (de Broglie Linearity)', value: reg.isValid ? reg.r2.toFixed(5) : '—' }
        ]
      };
    },

    // ----------------------------------------------------
    // 10. HEISENBERG'S UNCERTAINTY PRINCIPLE (CHAMP EXPT 6)
    // ----------------------------------------------------
    heisenberg_uncertainty: (rows, globals) => {
      const lambda_m = (parseFloat(globals.laser_wavelength_nm) || 650.0) * 1e-9;
      const tableRows = [];
      const ratios = [];
      const pts = [];
      const observedMinima = [];
      const slitWidths = [];

      rows.forEach(row => {
        const m = parseFloat(row.order) || 1;
        const D_mm = parseFloat(row.dist_D_mm);
        const a_mm = parseFloat(row.dist_a_mm);

        if (!isNaN(D_mm) && !isNaN(a_mm) && D_mm > 0 && a_mm > 0) {
          const D_m = D_mm * 1e-3;
          const a_m = a_mm * 1e-3;
          const theta_rad = Math.atan(a_m / D_m);
          const theta_deg = (theta_rad * 180) / Math.PI;

          // Slit width d = m * lambda / sin(theta)
          const d_m = (m * lambda_m) / Math.sin(theta_rad);
          const dy = d_m;
          const dpy = (CONSTANTS.h / lambda_m) * Math.sin(theta_rad);
          const prod = dy * dpy;
          const ratio = prod / CONSTANTS.h; // ≈ 1

          ratios.push(ratio);
          slitWidths.push(d_m * 1e6);
          pts.push({ x: m, y: a_mm });
          observedMinima.push({ m, a: a_mm, D: D_mm });

          tableRows.push({
            ...row,
            theta_deg: theta_deg.toFixed(3) + '°',
            slit_width_um: (d_m * 1e6).toFixed(1),
            uncertainty_prod: ratio.toFixed(3)
          });
        } else {
          tableRows.push({ ...row, theta_deg: '—', slit_width_um: '—', uncertainty_prod: '—' });
        }
      });

      const meanRatio = computeMean(ratios);
      const meanSlit_um = computeMean(slitWidths);
      const meanD_mm = computeMean(observedMinima.map(o => o.D)) || 700;
      const reg = computeLinearRegression(pts);

      return {
        tableRows,
        plot: {
          isDiffraction: true,
          lambda_nm: lambda_m * 1e9,
          D_mm: meanD_mm,
          d_um: meanSlit_um || 120,
          minima: observedMinima,
          regression: reg
        },
        results: [
          { label: 'Observed Product (Δy · Δpy / h)', value: ratios.length > 0 ? meanRatio.toFixed(3) : '—', formula: 'd·(h/λ)sinθ / h ≈ 1' },
          { label: 'Mean Slit Width (d)', value: slitWidths.length > 0 ? meanSlit_um.toFixed(1) : '—', unit: 'µm', formula: 'm·λ / sin(θ)' },
          { label: 'Theoretical Bound (h / 4π)', value: (CONSTANTS.h / (4 * Math.PI)).toExponential(3), unit: 'J·s' },
          { label: 'Heisenberg Linearity (R²)', value: reg.isValid ? reg.r2.toFixed(5) : '—' },
          { label: 'Laser Wavelength', value: (lambda_m * 1e9).toFixed(1), unit: 'nm' }
        ]
      };
    },

    // ----------------------------------------------------
    // 11. SINGLE QUBIT STATES & BLOCH SPHERE (CHAMP EXPT 7)
    // ----------------------------------------------------
    single_qubit_bloch: (rows, globals) => {
      const gate = globals.active_gate || 'X';
      const tableRows = [];

      rows.forEach(row => {
        const theta = parseFloat(row.theta_rad);
        const phi = parseFloat(row.phi_rad);

        if (!isNaN(theta) && !isNaN(phi)) {
          const c = Math.cos(theta / 2);
          const s = Math.sin(theta / 2);

          const stateStr = `${c.toFixed(3)}|0⟩ + ${s.toFixed(3)}e^{i${phi.toFixed(2)}}|1⟩`;
          const norm = Math.pow(c, 2) + Math.pow(s, 2);

          let transStr = '';
          if (gate === 'X') {
            transStr = `${s.toFixed(3)}e^{i${phi.toFixed(2)}}|0⟩ + ${c.toFixed(3)}|1⟩`;
          } else if (gate === 'Z') {
            transStr = `${c.toFixed(3)}|0⟩ - ${s.toFixed(3)}e^{i${phi.toFixed(2)}}|1⟩`;
          } else if (gate === 'Y') {
            transStr = `-i${s.toFixed(3)}e^{i${phi.toFixed(2)}}|0⟩ + i${c.toFixed(3)}|1⟩`;
          } else {
            const h0 = (c + s * Math.cos(phi)) / Math.SQRT2;
            const h1 = (c - s * Math.cos(phi)) / Math.SQRT2;
            transStr = `${h0.toFixed(3)}|0⟩ + ${h1.toFixed(3)}|1⟩`;
          }

          tableRows.push({
            ...row,
            state_str: stateStr,
            transformed_state: transStr,
            norm: norm.toFixed(4)
          });
        } else {
          tableRows.push({ ...row, state_str: '—', transformed_state: '—', norm: '—' });
        }
      });

      const lastRow = rows[rows.length - 1] || { theta_rad: 1.57, phi_rad: 0 };
      const th = parseFloat(lastRow.theta_rad) || 0;
      const ph = parseFloat(lastRow.phi_rad) || 0;

      return {
        tableRows,
        plot: {
          isBloch: true,
          theta: th,
          phi: ph,
          x: Math.sin(th) * Math.cos(ph),
          y: Math.sin(th) * Math.sin(ph),
          z: Math.cos(th)
        },
        results: [
          { label: 'Active Quantum Gate', value: `Pauli-${gate} Gate`, formula: gate === 'X' ? 'Bit-Flip (NOT)' : gate === 'Z' ? 'Phase-Flip' : gate === 'H' ? 'Superposition Creator' : 'Bit & Phase Flip' },
          { label: 'Hilbert Space Dimension', value: '2 (C²)' },
          { label: 'Normalization ⟨ψ|ψ⟩', value: '1.0000', formula: '|α|² + |β|² = 1' }
        ]
      };
    },

    // ----------------------------------------------------
    // 12. TWO-QUBIT STATES & ENTANGLEMENT (CHAMP EXPT 8)
    // ----------------------------------------------------
    two_qubit_entanglement: (rows, globals) => {
      const tableRows = [];
      const gate = globals.target_gate || 'CNOT';
      let activeState = '|00⟩';
      let p00 = 1, p01 = 0, p10 = 0, p11 = 0, concurrence = 0, activeNature = 'Separable (Product)';

      rows.forEach((row, i) => {
        const state = (row.input_state || '').trim();
        let cnot = '—', swap = '—', nature = 'Separable (Product)', angles = '—';

        if (state === '|00⟩') {
          cnot = '|00⟩'; swap = '|00⟩'; angles = 'θ₁=0, φ₁=0 ; θ₂=0, φ₂=0';
        } else if (state === '|01⟩') {
          cnot = '|01⟩'; swap = '|10⟩'; angles = 'θ₁=0, φ₁=0 ; θ₂=π, φ₂=0';
        } else if (state === '|10⟩') {
          cnot = '|11⟩'; swap = '|01⟩'; angles = 'θ₁=π, φ₁=0 ; θ₂=0, φ₂=0';
        } else if (state === '|11⟩') {
          cnot = '|10⟩'; swap = '|11⟩'; angles = 'θ₁=π, φ₁=0 ; θ₂=π, φ₂=0';
        } else if (state.includes('00') && state.includes('11')) {
          nature = '⚡ Maximally Entangled (Bell State)';
          cnot = state.includes('-') ? '1/√2(|00⟩ - |10⟩)' : '1/√2(|00⟩ + |10⟩)';
          swap = state;
          angles = 'Non-separable (Entangled)';
        } else if (state.includes('01') && state.includes('10')) {
          nature = '⚡ Maximally Entangled (Bell State)';
          cnot = '1/√2(|01⟩ + |11⟩)';
          swap = state;
          angles = 'Non-separable (Entangled)';
        } else if (state.includes('1/2')) {
          nature = 'Separable (Equal Superposition)';
          cnot = '1/2(|00⟩ + |01⟩ + |11⟩ + |10⟩)';
          swap = state;
          angles = 'θ₁=π/2, φ₁=0 ; θ₂=π/2, φ₂=0';
        }

        if (i === 0 || state.includes('Bell') || (i === rows.length - 1 && !activeState.includes('1/√2'))) {
          activeState = state;
          activeNature = nature;
          if (state === '|00⟩') { p00 = 1; p01 = 0; p10 = 0; p11 = 0; concurrence = 0; }
          else if (state === '|01⟩') { p00 = 0; p01 = 1; p10 = 0; p11 = 0; concurrence = 0; }
          else if (state === '|10⟩') { p00 = 0; p01 = 0; p10 = 1; p11 = 0; concurrence = 0; }
          else if (state === '|11⟩') { p00 = 0; p01 = 0; p10 = 0; p11 = 1; concurrence = 0; }
          else if (state.includes('00') && state.includes('11')) { p00 = 0.5; p01 = 0; p10 = 0; p11 = 0.5; concurrence = 1.0; }
          else if (state.includes('01') && state.includes('10')) { p00 = 0; p01 = 0.5; p10 = 0.5; p11 = 0; concurrence = 1.0; }
          else if (state.includes('1/2')) { p00 = 0.25; p01 = 0.25; p10 = 0.25; p11 = 0.25; concurrence = 0; }
        }

        tableRows.push({
          ...row,
          cnot_result: cnot,
          swap_result: swap,
          entanglement: nature,
          bloch_angles: angles
        });
      });

      return {
        tableRows,
        plot: {
          isQuantumBars: true,
          stateName: activeState,
          probs: [p00, p01, p10, p11],
          concurrence: concurrence,
          gate: gate,
          nature: activeNature
        },
        results: [
          { label: 'Active Two-Qubit Gate', value: gate, formula: gate === 'CNOT' ? 'CNOT|c, t⟩ = |c, t ⊕ c⟩' : 'SWAP|a, b⟩ = |b, a⟩' },
          { label: 'Hilbert Space Dimension', value: '4 (C⁴ = C² ⊗ C²)' },
          { label: 'Representative State', value: activeState },
          { label: 'Bell Entanglement Concurrence', value: concurrence > 0.5 ? 'C = 1.00 (Maximal)' : 'C = 0.00 (Separable)' }
        ]
      };
    }
  };

  // ==========================================
  // 4. GRAPH ENGINE WITH FULL MULTI-EXPERIMENT VISUALIZATIONS
  // ==========================================
  class ScientificGraph {
    constructor(canvasElement, tooltipElement) {
      this.canvas = canvasElement;
      this.ctx = canvasElement.getContext('2d');
      this.tooltip = tooltipElement;
      this.data = null;
      this.hoverPoint = null;

      this.theme = {
        bg: '#080d1a',
        grid: '#17223b',
        axis: '#334155',
        text: '#94a3b8',
        textLight: '#f1f5f9',
        accentCyan: '#06b6d4',
        accentEmerald: '#10b981',
        accentAmber: '#f59e0b',
        accentRose: '#f43f5e',
        pointBorder: '#38bdf8',
        residualLine: 'rgba(244, 63, 94, 0.55)',
        fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      };

      this.padding = { top: 40, right: 40, bottom: 60, left: 75 };
      this.initEvents();
    }

    initEvents() {
      this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
      window.addEventListener('resize', () => this.resizeAndRender());
    }

    setData(plotData) {
      this.data = plotData;
      this.render();
    }

    resizeAndRender() {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = rect.width || 600;
      const h = rect.height || 400;

      this.canvas.width = Math.round(w * dpr);
      this.canvas.height = Math.round(h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.width = w;
      this.height = h;
      this.render();
    }

    render() {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = rect.width || 600;
      const h = rect.height || 400;

      if (!this.width || Math.abs(this.width - w) > 2 || Math.abs(this.height - h) > 2) {
        this.canvas.width = Math.round(w * dpr);
        this.canvas.height = Math.round(h * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.width = w;
        this.height = h;
      }

      const ctx = this.ctx;
      ctx.fillStyle = this.theme.bg;
      ctx.fillRect(0, 0, this.width, this.height);

      if (!this.data) {
        ctx.fillStyle = this.theme.text;
        ctx.font = `13px ${this.theme.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Awaiting observation data...', this.width / 2, this.height / 2);
        return;
      }

      // 1. Single Qubit Bloch Sphere 3D
      if (this.data.isBloch) {
        this.drawBlochSphere();
        return;
      }

      // 2. Travelling Microscope Capillary Bore Reticle
      if (this.data.isBore) {
        this.drawBoreCrossSection();
        return;
      }

      // 3. Spectrometer Prism Minimum Deviation Curve
      if (this.data.isPrism) {
        this.drawPrismDevCurve();
        return;
      }

      // 4. Heisenberg Single-Slit Fraunhofer Diffraction Envelope
      if (this.data.isDiffraction) {
        this.drawDiffractionPattern();
        return;
      }

      // 5. Two-Qubit Quantum State Probabilities & Entanglement Bar Chart
      if (this.data.isQuantumBars) {
        this.drawQuantumBars();
        return;
      }

      // 6. Screw Gauge & Vernier Calipers Precision Band
      if (this.data.isPrecisionBand) {
        this.drawPrecisionBand();
        return;
      }

      if (!this.data.points && !this.data.dualSeries) {
        ctx.fillStyle = this.theme.text;
        ctx.font = `13px ${this.theme.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No numerical plotting coordinates available for this module.', this.width / 2, this.height / 2);
        return;
      }

      this.computeBounds();
      this.drawGrid();
      this.drawAxes();

      if (this.data.dualSeries) {
        this.drawDualSeries();
      } else {
        if (this.data.regression && this.data.regression.isValid) {
          this.drawResiduals();
        }
        if (this.data.fitFunction) {
          this.drawFitLine();
        } else if (this.data.isCurve) {
          this.drawSplineCurve();
        }
        this.drawPoints();
      }

      this.drawLegend();

      if (this.hoverPoint) {
        const px = this.xToPixel(this.hoverPoint.x);
        const py = this.yToPixel(this.hoverPoint.y);
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, 2 * Math.PI);
        ctx.strokeStyle = this.theme.accentAmber;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
    }

    drawPrecisionBand() {
      const ctx = this.ctx;
      const data = this.data;
      const points = data.points || [];
      const mean = data.mean || 0;
      const stdDev = data.stdDev || 0;
      const unit = data.unit || '';

      this.computeBounds();
      const span = Math.max(0.01, stdDev * 3);
      this.bounds.minY = Math.min(this.bounds.minY, mean - span);
      this.bounds.maxY = Math.max(this.bounds.maxY, mean + span);

      this.drawGrid();
      this.drawAxes();

      const plotLeft = this.padding.left;
      const plotRight = this.width - this.padding.right;

      // 1. Shaded 1-sigma confidence band
      if (stdDev > 0) {
        const pyTop = this.yToPixel(mean + stdDev);
        const pyBottom = this.yToPixel(mean - stdDev);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
        ctx.fillRect(plotLeft, pyTop, plotRight - plotLeft, pyBottom - pyTop);

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(plotLeft, pyTop);
        ctx.lineTo(plotRight, pyTop);
        ctx.moveTo(plotLeft, pyBottom);
        ctx.lineTo(plotRight, pyBottom);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 2. Mean line
      const pyMean = this.yToPixel(mean);
      ctx.strokeStyle = this.theme.accentCyan;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(plotLeft, pyMean);
      ctx.lineTo(plotRight, pyMean);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Draw observation points with deviation stems
      for (const p of points) {
        const px = this.xToPixel(p.x);
        const py = this.yToPixel(p.y);

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, pyMean);
        ctx.lineTo(px, py);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(px, py, 6, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, 2 * Math.PI);
        ctx.fillStyle = this.theme.accentAmber;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 4. Telemetry Legend Badge
      ctx.save();
      ctx.font = `12px ${this.theme.fontFamily}`;
      const badgeX = this.padding.left + 15;
      const badgeY = this.padding.top + 15;
      const text = `Mean μ = ${mean.toFixed(3)} ${unit}   |   Std Dev σ = ±${stdDev.toFixed(4)} ${unit}`;
      const textW = ctx.measureText(text).width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1;
      ctx.fillRect(badgeX - 8, badgeY - 14, textW + 36, 26);
      ctx.strokeRect(badgeX - 8, badgeY - 14, textW + 36, 26);

      ctx.fillStyle = this.theme.accentCyan;
      ctx.fillRect(badgeX, badgeY - 5, 10, 10);
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, badgeX + 18, badgeY);
      ctx.restore();
    }

    drawBoreCrossSection() {
      const ctx = this.ctx;
      const cx = this.width / 2;
      const cy = this.height / 2 + 10;
      const data = this.data;
      const dH = data.dH || 0.20;
      const dV = data.dV || 0.20;
      const meanD = data.meanD || ((dH + dV) / 2);
      const r = data.radius || (meanD / 2);
      const area = data.area || (Math.PI * r * r);

      const outerR = Math.min(this.width, this.height) * 0.38;
      const boreR = Math.min(outerR * 0.65, Math.max(30, outerR * 0.55));

      ctx.font = `bold 14px ${this.theme.fontFamily}`;
      ctx.fillStyle = this.theme.accentCyan;
      ctx.textAlign = 'center';
      ctx.fillText('Travelling Microscope Eyepiece Reticle & Bore Geometry', cx, 26);

      // 1. Outer capillary glass boundary
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, outerR - 4, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(79, 101, 142, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Inner Capillary Bore with water meniscus glow
      const grad = ctx.createRadialGradient(cx - boreR * 0.2, cy - boreR * 0.2, boreR * 0.1, cx, cy, boreR);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
      grad.addColorStop(0.7, 'rgba(14, 116, 144, 0.3)');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0.7)');

      ctx.beginPath();
      ctx.arc(cx, cy, boreR, 0, 2 * Math.PI);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Reticle Crosshairs (Eyepiece standard)
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - outerR - 15, cy);
      ctx.lineTo(cx + outerR + 15, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerR - 15);
      ctx.lineTo(cx + outerR + 15);
      ctx.stroke();

      // Tick marks on crosshairs
      for (let offset = -outerR; offset <= outerR; offset += 20) {
        if (offset === 0) continue;
        ctx.beginPath();
        ctx.moveTo(cx + offset, cy - 4);
        ctx.lineTo(cx + offset, cy + 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy + offset);
        ctx.lineTo(cx + 4, cy + offset);
        ctx.stroke();
      }

      // 4. Horizontal Diameter Dimension line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - boreR, cy + boreR * 0.45);
      ctx.lineTo(cx + boreR, cy + boreR * 0.45);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(cx - boreR, cy + boreR * 0.45);
      ctx.lineTo(cx - boreR + 8, cy + boreR * 0.45 - 4);
      ctx.lineTo(cx - boreR + 8, cy + boreR * 0.45 + 4);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + boreR, cy + boreR * 0.45);
      ctx.lineTo(cx + boreR - 8, cy + boreR * 0.45 - 4);
      ctx.lineTo(cx + boreR - 8, cy + boreR * 0.45 + 4);
      ctx.fill();

      ctx.font = `bold 11px ${this.theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`DH = ${dH.toFixed(4)} cm`, cx, cy + boreR * 0.45 - 7);

      // 5. Vertical Diameter Dimension line
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - boreR * 0.45, cy - boreR);
      ctx.lineTo(cx - boreR * 0.45, cy + boreR);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(cx - boreR * 0.45, cy - boreR);
      ctx.lineTo(cx - boreR * 0.45 - 4, cy - boreR + 8);
      ctx.lineTo(cx - boreR * 0.45 + 4, cy - boreR + 8);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - boreR * 0.45, cy + boreR);
      ctx.lineTo(cx - boreR * 0.45 - 4, cy + boreR - 8);
      ctx.lineTo(cx - boreR * 0.45 + 4, cy + boreR - 8);
      ctx.fill();

      ctx.save();
      ctx.translate(cx - boreR * 0.45 - 8, cy);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`DV = ${dV.toFixed(4)} cm`, 0, 0);
      ctx.restore();

      // 6. Telemetry Info Card
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
      ctx.lineWidth = 1;
      const boxW = Math.min(380, this.width - 40);
      const boxH = 50;
      ctx.strokeRect(20, this.height - boxH - 15, boxW, boxH);
      ctx.fillRect(20, this.height - boxH - 15, boxW, boxH);

      ctx.fillStyle = '#38bdf8';
      ctx.font = `bold 11.5px ${this.theme.fontFamily}`;
      ctx.textAlign = 'left';
      ctx.fillText(`Mean Bore Diameter D = ${meanD.toFixed(4)} cm (${(meanD * 10).toFixed(3)} mm)`, 30, this.height - boxH + 6);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `11px ${this.theme.fontFamily}`;
      ctx.fillText(`Internal Radius r = ${r.toFixed(4)} cm  |  Area A = ${(area * 100).toFixed(3)} mm²`, 30, this.height - boxH + 26);
    }

    drawPrismDevCurve() {
      const ctx = this.ctx;
      const data = this.data;
      const A_deg = data.A || 60.0;
      const deltaM_deg = data.deltaM || 49.5;
      const mu = data.mu || 1.633;

      const A_rad = (A_deg * Math.PI) / 180;
      const simPoints = [];
      const iMin = 36;
      const iMax = 78;

      for (let i_deg = iMin; i_deg <= iMax; i_deg += 0.5) {
        const i_rad = (i_deg * Math.PI) / 180;
        const sin_r1 = Math.sin(i_rad) / mu;
        if (sin_r1 > 1) continue;
        const r1 = Math.asin(sin_r1);
        const r2 = A_rad - r1;
        const sin_e = mu * Math.sin(r2);
        if (sin_e > 1) continue;
        const e_rad = Math.asin(sin_e);
        const delta_deg = (i_rad + e_rad - A_rad) * (180 / Math.PI);
        if (!isNaN(delta_deg) && delta_deg >= 0 && delta_deg <= 90) {
          simPoints.push({ x: i_deg, y: delta_deg });
        }
      }

      this.data.points = simPoints;
      this.data.xLabel = 'Angle of Incidence i (Degrees °)';
      this.data.yLabel = 'Angle of Deviation δ (Degrees °)';

      this.computeBounds();
      this.bounds.minX = 30;
      this.bounds.maxX = 85;
      this.bounds.minY = Math.max(30, Math.floor(deltaM_deg - 5));
      this.bounds.maxY = Math.ceil(deltaM_deg + 25);

      this.drawGrid();
      this.drawAxes();

      ctx.save();
      const plotLeft = this.padding.left;
      const plotRight = this.width - this.padding.right;
      const plotTop = this.padding.top;
      const plotBottom = this.height - this.padding.bottom;
      ctx.beginPath();
      ctx.rect(plotLeft, plotTop, plotRight - plotLeft, plotBottom - plotTop);
      ctx.clip();

      ctx.strokeStyle = this.theme.accentCyan;
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      simPoints.forEach((p, idx) => {
        const px = this.xToPixel(p.x);
        const py = this.yToPixel(p.y);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      const grad = ctx.createLinearGradient(0, plotTop, 0, plotBottom);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.18)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.01)');
      ctx.lineTo(this.xToPixel(simPoints[simPoints.length - 1].x), plotBottom);
      ctx.lineTo(this.xToPixel(simPoints[0].x), plotBottom);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      const i_m = (A_deg + deltaM_deg) / 2;
      const px_m = this.xToPixel(i_m);
      const py_m = this.yToPixel(deltaM_deg);

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(px_m, plotBottom);
      ctx.lineTo(px_m, py_m);
      ctx.lineTo(plotLeft, py_m);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(px_m, py_m, 7, 0, 2 * Math.PI);
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.font = `bold 12px ${this.theme.fontFamily}`;
      ctx.fillStyle = '#f59e0b';
      ctx.textAlign = 'left';
      ctx.fillText(`Minimum: δm = ${deltaM_deg.toFixed(2)}° @ i = ${i_m.toFixed(2)}°`, px_m + 12, py_m - 6);

      ctx.save();
      const badgeX = plotLeft + 15;
      const badgeY = plotTop + 15;
      const text = `i–δ Characteristic Curve   |   Prism Angle A = ${A_deg.toFixed(2)}°   |   Refractive Index µ = ${mu.toFixed(4)}`;
      const textW = ctx.measureText(text).width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1;
      ctx.fillRect(badgeX - 8, badgeY - 14, textW + 36, 26);
      ctx.strokeRect(badgeX - 8, badgeY - 14, textW + 36, 26);

      ctx.fillStyle = this.theme.accentCyan;
      ctx.fillRect(badgeX, badgeY - 5, 12, 10);
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, badgeX + 20, badgeY);
      ctx.restore();
    }

    drawDiffractionPattern() {
      const ctx = this.ctx;
      const data = this.data;
      const d_um = data.d_um || 120;
      const lambda_nm = data.lambda_nm || 650;
      const D_mm = data.D_mm || 700;
      const minima = data.minima || [];

      const plotLeft = this.padding.left;
      const plotRight = this.width - this.padding.right;
      const plotTop = this.padding.top;
      const plotBottom = this.height - this.padding.bottom;

      this.bounds = { minX: -22, maxX: 22, minY: 0, maxY: 1.15 };
      this.data.xLabel = 'Screen Position x (mm) Relative to Central Peak';
      this.data.yLabel = 'Relative Diffraction Intensity I / I₀';

      this.drawGrid();
      this.drawAxes();

      ctx.save();
      ctx.beginPath();
      ctx.rect(plotLeft, plotTop, plotRight - plotLeft, plotBottom - plotTop);
      ctx.clip();

      const numPoints = 240;
      const curvePts = [];
      const d_m = d_um * 1e-6;
      const lam_m = lambda_nm * 1e-9;
      const D_m = D_mm * 1e-3;

      for (let i = 0; i <= numPoints; i++) {
        const x_mm = -22 + (i / numPoints) * 44;
        const x_m = x_mm * 1e-3;
        const beta = (Math.PI * d_m * x_m) / (lam_m * D_m);
        let I = 0;
        if (Math.abs(beta) < 1e-5) {
          I = 1.0;
        } else {
          I = Math.pow(Math.sin(beta) / beta, 2);
        }
        curvePts.push({ x: x_mm, y: I });
      }

      ctx.beginPath();
      curvePts.forEach((p, idx) => {
        const px = this.xToPixel(p.x);
        const py = this.yToPixel(p.y);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });

      const grad = ctx.createLinearGradient(0, plotTop, 0, plotBottom);
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
      grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.2)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.01)');
      ctx.lineTo(this.xToPixel(22), plotBottom);
      ctx.lineTo(this.xToPixel(-22), plotBottom);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      curvePts.forEach((p, idx) => {
        const px = this.xToPixel(p.x);
        const py = this.yToPixel(p.y);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      minima.forEach(m => {
        const pxPos = this.xToPixel(m.a);
        const pxNeg = this.xToPixel(-m.a);
        const pyZero = this.yToPixel(0);

        ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);

        ctx.beginPath();
        ctx.moveTo(pxPos, plotBottom);
        ctx.lineTo(pxPos, plotTop + 40);
        ctx.moveTo(pxNeg, plotBottom);
        ctx.lineTo(pxNeg, plotTop + 40);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(pxPos, pyZero, 4, 0, 2 * Math.PI);
        ctx.arc(pxNeg, pyZero, 4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.font = `bold 10px ${this.theme.fontFamily}`;
        ctx.fillStyle = '#fda4af';
        ctx.textAlign = 'center';
        ctx.fillText(`m=±${m.m} (${m.a}mm)`, pxPos, plotTop + 34);
      });

      ctx.restore();

      ctx.save();
      const badgeX = plotLeft + 15;
      const badgeY = plotTop + 15;
      const text = `Fraunhofer Envelope   |   Slit Width d ≈ ${d_um.toFixed(1)} µm   |   Observed Minima (Red)`;
      const textW = ctx.measureText(text).width;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 1;
      ctx.fillRect(badgeX - 8, badgeY - 14, textW + 36, 26);
      ctx.strokeRect(badgeX - 8, badgeY - 14, textW + 36, 26);

      ctx.fillStyle = this.theme.accentEmerald;
      ctx.fillRect(badgeX, badgeY - 5, 12, 10);
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, badgeX + 20, badgeY);
      ctx.restore();
    }

    drawQuantumBars() {
      const ctx = this.ctx;
      const data = this.data;
      const probs = data.probs || [0.5, 0, 0, 0.5];
      const stateName = data.stateName || '|Ψ⟩';
      const concurrence = data.concurrence !== undefined ? data.concurrence : 1.0;
      const gate = data.gate || 'CNOT';
      const nature = data.nature || 'Quantum Superposition';

      const labels = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
      const plotLeft = this.padding.left;
      const plotRight = this.width - this.padding.right;
      const plotTop = this.padding.top + 30;
      const plotBottom = this.height - this.padding.bottom;
      const plotH = plotBottom - plotTop;
      const plotW = plotRight - plotLeft;

      ctx.font = `bold 14px ${this.theme.fontFamily}`;
      ctx.fillStyle = this.theme.accentCyan;
      ctx.textAlign = 'center';
      ctx.fillText(`Two-Qubit State Probability Distribution: ${stateName}`, this.width / 2, 26);

      ctx.fillStyle = concurrence > 0.5 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)';
      ctx.strokeStyle = concurrence > 0.5 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1;
      const infoText = `Active Gate: ${gate}   |   ${nature}   |   Concurrence C = ${concurrence.toFixed(2)}`;
      ctx.font = `11.5px ${this.theme.fontFamily}`;
      const infoW = ctx.measureText(infoText).width;
      ctx.strokeRect((this.width - infoW - 30) / 2, 40, infoW + 30, 24);
      ctx.fillRect((this.width - infoW - 30) / 2, 40, infoW + 30, 24);
      ctx.fillStyle = concurrence > 0.5 ? '#fda4af' : '#a5b4fc';
      ctx.fillText(infoText, this.width / 2, 56);

      ctx.strokeStyle = this.theme.grid;
      ctx.lineWidth = 1;
      ctx.font = `11px ${this.theme.fontFamily}`;
      ctx.fillStyle = this.theme.text;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      for (let p = 0; p <= 1.0; p += 0.25) {
        const y = plotBottom - p * plotH;
        ctx.beginPath();
        ctx.moveTo(plotLeft, y);
        ctx.lineTo(plotRight, y);
        ctx.stroke();
        ctx.fillText(`${Math.round(p * 100)}%`, plotLeft - 8, y);
      }

      ctx.strokeStyle = this.theme.axis;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(plotLeft, plotBottom);
      ctx.lineTo(plotRight, plotBottom);
      ctx.stroke();

      const barSlotW = plotW / 4;
      const barW = Math.min(60, barSlotW * 0.55);

      probs.forEach((p, idx) => {
        const bx = plotLeft + idx * barSlotW + (barSlotW - barW) / 2;
        const bh = Math.max(2, p * plotH);
        const by = plotBottom - bh;

        const grad = ctx.createLinearGradient(0, by, 0, plotBottom);
        if (p > 0.05) {
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(1, '#4f46e5');
          ctx.fillStyle = grad;
          ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = 'rgba(51, 65, 85, 0.4)';
        }

        ctx.fillRect(bx, by, barW, bh);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = p > 0.05 ? '#38bdf8' : 'rgba(79, 101, 142, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, barW, bh);

        ctx.font = `bold 12px ${this.theme.fontFamily}`;
        ctx.fillStyle = p > 0.05 ? '#38bdf8' : '#64748b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${(p * 100).toFixed(1)}%`, bx + barW / 2, by - 6);

        ctx.font = `bold 13px ${this.theme.fontFamily}`;
        ctx.fillStyle = '#f8fafc';
        ctx.textBaseline = 'top';
        ctx.fillText(labels[idx], bx + barW / 2, plotBottom + 10);
      });
    }

    drawBlochSphere() {
      const ctx = this.ctx;
      const cx = this.width / 2;
      const cy = this.height / 2 + 10;
      const R = Math.min(this.width, this.height) * 0.36;

      const th = this.data.theta || 0;
      const ph = this.data.phi || 0;

      ctx.font = `bold 14px ${this.theme.fontFamily}`;
      ctx.fillStyle = this.theme.accentCyan;
      ctx.textAlign = 'center';
      ctx.fillText('Bloch Sphere 3D State Vector Visualizer', cx, 26);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const grad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0.04)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Equator
      ctx.beginPath();
      ctx.ellipse(cx, cy, R, R * 0.32, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Z Axis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy + R + 18);
      ctx.lineTo(cx, cy - R - 18);
      ctx.stroke();

      // X Axis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(cx + R * 0.9, cy + R * 0.28);
      ctx.lineTo(cx - R * 0.9, cy - R * 0.28);
      ctx.stroke();

      // Labels
      ctx.font = `bold 12px ${this.theme.fontFamily}`;
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('|0⟩ (Z+)', cx, cy - R - 24);
      ctx.fillStyle = '#fda4af';
      ctx.fillText('|1⟩ (Z-)', cx, cy + R + 30);
      ctx.fillStyle = '#a7f3d0';
      ctx.fillText('|+⟩ (X+)', cx + R * 0.9 + 24, cy + R * 0.28 + 4);
      ctx.fillStyle = '#fde68a';
      ctx.fillText('|-⟩ (X-)', cx - R * 0.9 - 24, cy - R * 0.28);

      // State vector
      const sx = cx + R * (Math.sin(th) * Math.cos(ph) * 0.9 + Math.sin(th) * Math.sin(ph) * 0.3);
      const sy = cy - R * Math.cos(th) + R * (Math.sin(th) * Math.cos(ph) * 0.28);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(sx, sy);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Angle indicator
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.strokeRect(20, 20, 190, 52);
      ctx.fillRect(20, 20, 190, 52);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = `11.5px ${this.theme.fontFamily}`;
      ctx.textAlign = 'left';
      ctx.fillText(`θ = ${(th * 180 / Math.PI).toFixed(1)}° (${th.toFixed(3)} rad)`, 30, 40);
      ctx.fillText(`φ = ${(ph * 180 / Math.PI).toFixed(1)}° (${ph.toFixed(3)} rad)`, 30, 60);

      ctx.restore();
    }

    computeBounds() {
      let allPoints = [];
      if (this.data.dualSeries) {
        this.data.dualSeries.forEach(s => {
          allPoints = allPoints.concat(s.points || []);
        });
      } else if (this.data.points) {
        allPoints = this.data.points;
      }

      if (allPoints.length === 0) {
        this.bounds = { minX: 0, maxX: 10, minY: 0, maxY: 10 };
        return;
      }

      let minX = Math.min(...allPoints.map(p => p.x));
      let maxX = Math.max(...allPoints.map(p => p.x));
      let minY = Math.min(...allPoints.map(p => p.y));
      let maxY = Math.max(...allPoints.map(p => p.y));

      if (minX >= 0) minX = 0;
      if (minY >= 0) minY = 0;

      const spanX = (maxX - minX) || 1;
      const spanY = (maxY - minY) || 1;

      minX = minX < 0 ? minX - spanX * 0.08 : 0;
      maxX = maxX + spanX * 0.12;
      minY = minY < 0 ? minY - spanY * 0.08 : 0;
      maxY = maxY + spanY * 0.12;

      this.bounds = { minX, maxX, minY, maxY };
    }

    xToPixel(x) {
      const { minX, maxX } = this.bounds;
      const plotW = this.width - this.padding.left - this.padding.right;
      return this.padding.left + ((x - minX) / (maxX - minX)) * plotW;
    }

    yToPixel(y) {
      const { minY, maxY } = this.bounds;
      const plotH = this.height - this.padding.top - this.padding.bottom;
      return this.height - this.padding.bottom - ((y - minY) / (maxY - minY)) * plotH;
    }

    drawGrid() {
      const ctx = this.ctx;
      const { minX, maxX, minY, maxY } = this.bounds;
      const plotLeft = this.padding.left;
      const plotRight = this.width - this.padding.right;
      const plotTop = this.padding.top;
      const plotBottom = this.height - this.padding.bottom;

      ctx.strokeStyle = this.theme.grid;
      ctx.lineWidth = 1;
      ctx.fillStyle = this.theme.text;
      ctx.font = `11px ${this.theme.fontFamily}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      const yTicks = 6;
      for (let i = 0; i <= yTicks; i++) {
        const val = minY + (i / yTicks) * (maxY - minY);
        const py = this.yToPixel(val);
        ctx.beginPath();
        ctx.moveTo(plotLeft, py);
        ctx.lineTo(plotRight, py);
        ctx.stroke();
        ctx.fillText(this.formatTick(val), plotLeft - 8, py);
      }

      const xTicks = 6;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let i = 0; i <= xTicks; i++) {
        const val = minX + (i / xTicks) * (maxX - minX);
        const px = this.xToPixel(val);
        ctx.beginPath();
        ctx.moveTo(px, plotTop);
        ctx.lineTo(px, plotBottom);
        ctx.stroke();
        ctx.fillText(this.formatTick(val), px, plotBottom + 8);
      }
    }

    drawAxes() {
      const ctx = this.ctx;
      const plotLeft = this.padding.left;
      const plotRight = this.width - this.padding.right;
      const plotTop = this.padding.top;
      const plotBottom = this.height - this.padding.bottom;

      ctx.strokeStyle = this.theme.axis;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(plotLeft, plotTop, plotRight - plotLeft, plotBottom - plotTop);

      ctx.fillStyle = this.theme.textLight;
      ctx.font = `bold 12px ${this.theme.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(this.data.xLabel || 'Independent Variable (X)', (plotLeft + plotRight) / 2, this.height - 10);

      ctx.save();
      ctx.translate(20, (plotTop + plotBottom) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(this.data.yLabel || 'Dependent Variable (Y)', 0, 0);
      ctx.restore();
    }

    drawFitLine() {
      const ctx = this.ctx;
      const { minX, maxX } = this.bounds;
      const fitFn = this.data.fitFunction;
      const steps = 100;

      ctx.save();
      ctx.beginPath();
      ctx.rect(this.padding.left, this.padding.top, this.width - this.padding.left - this.padding.right, this.height - this.padding.top - this.padding.bottom);
      ctx.clip();

      ctx.strokeStyle = this.theme.accentEmerald;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      for (let i = 0; i <= steps; i++) {
        const x = minX + (i / steps) * (maxX - minX);
        const y = fitFn(x);
        const px = this.xToPixel(x);
        const py = this.yToPixel(y);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }

    drawSplineCurve() {
      const points = this.data.points;
      if (!points || points.length < 2) return;

      const ctx = this.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.rect(this.padding.left, this.padding.top, this.width - this.padding.left - this.padding.right, this.height - this.padding.top - this.padding.bottom);
      ctx.clip();

      ctx.strokeStyle = this.theme.accentAmber;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.35)';
      ctx.shadowBlur = 8;
      ctx.beginPath();

      const sorted = [...points].sort((a, b) => a.x - b.x);
      for (let i = 0; i < sorted.length; i++) {
        const px = this.xToPixel(sorted[i].x);
        const py = this.yToPixel(sorted[i].y);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }

    drawResiduals() {
      const reg = this.data.regression;
      if (!reg || !reg.residuals) return;

      const ctx = this.ctx;
      ctx.save();
      ctx.strokeStyle = this.theme.residualLine;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      for (const res of reg.residuals) {
        const px = this.xToPixel(res.x);
        const pyActual = this.yToPixel(res.y);
        const pyFit = this.yToPixel(res.yFit);
        ctx.beginPath();
        ctx.moveTo(px, pyActual);
        ctx.lineTo(px, pyFit);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawPoints() {
      const points = this.data.points;
      if (!points) return;
      const ctx = this.ctx;

      for (const p of points) {
        const px = this.xToPixel(p.x);
        const py = this.yToPixel(p.y);

        ctx.beginPath();
        ctx.arc(px, py, 6, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, 2 * Math.PI);
        ctx.fillStyle = this.theme.pointBorder;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    }

    drawDualSeries() {
      const ctx = this.ctx;
      this.data.dualSeries.forEach(series => {
        const pts = series.points || [];
        if (pts.length < 2) return;

        const color = series.color || this.theme.accentCyan;
        const sorted = [...pts].sort((a, b) => a.x - b.x);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < sorted.length; i++) {
          const px = this.xToPixel(sorted[i].x);
          const py = this.yToPixel(sorted[i].y);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        for (const p of pts) {
          const px = this.xToPixel(p.x);
          const py = this.yToPixel(p.y);
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // Highlight MPP (Maximum Power Point) if available (Solar Cell)
      if (this.data.mpp && this.data.mpp.P > 0) {
        const mpp = this.data.mpp;
        const px = this.xToPixel(mpp.V);
        const pyP = this.yToPixel(mpp.P);
        const pyI = this.yToPixel(mpp.I);
        const plotBottom = this.height - this.padding.bottom;

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(px, plotBottom);
        ctx.lineTo(px, Math.min(pyP, pyI));
        ctx.stroke();
        ctx.setLineDash([]);

        // Star marker at MPP
        ctx.beginPath();
        ctx.arc(px, pyP, 7, 0, 2 * Math.PI);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = `bold 11px ${this.theme.fontFamily}`;
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'left';
        ctx.fillText(`MPP: ${mpp.P.toFixed(1)} mW (${mpp.V.toFixed(2)} V, ${mpp.I.toFixed(1)} mA)`, px + 10, pyP - 4);
      }
    }

    drawLegend() {
      const ctx = this.ctx;
      const reg = this.data.regression;
      ctx.save();
      ctx.font = `12px ${this.theme.fontFamily}`;
      const badgeX = this.padding.left + 15;
      const badgeY = this.padding.top + 15;

      if (this.data.dualSeries) {
        let curX = badgeX;
        this.data.dualSeries.forEach(s => {
          ctx.fillStyle = s.color;
          ctx.fillRect(curX, badgeY - 8, 12, 12);
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(s.name, curX + 18, badgeY + 2);
          curX += ctx.measureText(s.name).width + 38;
        });
        ctx.restore();
        return;
      }

      if (reg && reg.isValid) {
        const text = `${reg.equation}   |   R² = ${reg.r2.toFixed(5)}`;
        const textW = ctx.measureText(text).width;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 1;
        ctx.fillRect(badgeX - 8, badgeY - 14, textW + 36, 26);
        ctx.strokeRect(badgeX - 8, badgeY - 14, textW + 36, 26);

        ctx.strokeStyle = this.theme.accentEmerald;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(badgeX, badgeY);
        ctx.lineTo(badgeX + 16, badgeY);
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, badgeX + 24, badgeY);
      }
      ctx.restore();
    }

    handleMouseMove(e) {
      if (!this.data || !this.data.points) return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let closest = null;
      let minDist = 18;

      for (const p of this.data.points) {
        const px = this.xToPixel(p.x);
        const py = this.yToPixel(p.y);
        const dist = Math.hypot(mouseX - px, mouseY - py);
        if (dist < minDist) {
          minDist = dist;
          closest = p;
        }
      }

      if (closest) {
        this.hoverPoint = closest;
        this.render();

        let fitText = '';
        if (this.data.regression && this.data.regression.isValid) {
          const yFit = this.data.regression.slope * closest.x + this.data.regression.intercept;
          const residual = closest.y - yFit;
          fitText = `
            <div>ŷ (Fit): <b>${this.formatTick(yFit)}</b></div>
            <div>Residual: <b style="color:${residual >= 0 ? '#34d399' : '#f43f5e'}">${residual >= 0 ? '+' : ''}${this.formatTick(residual)}</b></div>
          `;
        }

        this.tooltip.innerHTML = `
          ${closest.label ? `<div style="font-weight:700; color:#38bdf8; margin-bottom:3px;">${closest.label}</div>` : ''}
          <div>X: <b>${this.formatTick(closest.x)}</b></div>
          <div>Y: <b>${this.formatTick(closest.y)}</b></div>
          ${fitText}
        `;
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = `${mouseX + 14}px`;
        this.tooltip.style.top = `${mouseY - 14}px`;
      } else if (this.tooltip) {
        this.tooltip.style.display = 'none';
      }
    }

    handleMouseLeave() {
      this.hoverPoint = null;
      if (this.tooltip) this.tooltip.style.display = 'none';
      this.render();
    }

    formatTick(v) {
      if (Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3 && v !== 0)) {
        return v.toExponential(2);
      }
      return Number(v.toFixed(3)).toString();
    }

    getImageDataUrl() {
      return this.canvas.toDataURL('image/png');
    }
  }

  // ==========================================
  // 5. STORAGE & EXPORT
  // ==========================================
  const STORAGE_KEY_PREFIX = 'baphy105_lab_';

  const StorageEngine = {
    getActiveExperimentId: () => {
      try {
        const id = localStorage.getItem(STORAGE_KEY_PREFIX + 'active_exp');
        return EXPERIMENTS_REGISTRY.some(e => e.id === id) ? id : 'solar_cell';
      } catch (e) { return 'solar_cell'; }
    },
    setActiveExperimentId: (id) => {
      try { localStorage.setItem(STORAGE_KEY_PREFIX + 'active_exp', id); } catch (e) {}
    },
    getExperimentState: (expId, defaultExp) => {
      try {
        const dataStr = localStorage.getItem(STORAGE_KEY_PREFIX + expId);
        if (dataStr) {
          const parsed = JSON.parse(dataStr);
          return {
            rows: parsed.rows || defaultExp.defaultRows,
            globals: { ...defaultExp.globals, ...parsed.globals },
            units: { ...defaultExp.units, ...parsed.units }
          };
        }
      } catch (e) {}
      return {
        rows: JSON.parse(JSON.stringify(defaultExp.defaultRows)),
        globals: JSON.parse(JSON.stringify(defaultExp.globals || {})),
        units: JSON.parse(JSON.stringify(defaultExp.units || {}))
      };
    },
    saveExperimentState: (expId, state) => {
      try {
        localStorage.setItem(STORAGE_KEY_PREFIX + expId, JSON.stringify({
          rows: state.rows,
          globals: state.globals,
          units: state.units,
          savedAt: Date.now()
        }));
      } catch (e) {}
    },
    resetExperiment: (expId, defaultExp) => {
      try { localStorage.removeItem(STORAGE_KEY_PREFIX + expId); } catch (e) {}
      return {
        rows: JSON.parse(JSON.stringify(defaultExp.defaultRows)),
        globals: JSON.parse(JSON.stringify(defaultExp.globals || {})),
        units: JSON.parse(JSON.stringify(defaultExp.units || {}))
      };
    }
  };

  const ExportEngine = {
    exportToCSV: (experiment, tableRows) => {
      if (!tableRows || tableRows.length === 0) {
        alert('No data rows available to export.');
        return;
      }
      const headers = experiment.columns.map(c => `"${c.label} (${c.unit || ''})"`);
      const csvLines = [headers.join(',')];

      tableRows.forEach(row => {
        const line = experiment.columns.map(c => {
          let val = row[c.id];
          if (val === undefined || val === null || val === '—') val = '';
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        });
        csvLines.push(line.join(','));
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvLines.join('\n'));
      const link = document.createElement('a');
      const safeTitle = experiment.id.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.setAttribute('href', csvContent);
      link.setAttribute('download', `BAPHY105_${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    parseClipboardData: (text, experiment) => {
      if (!text || typeof text !== 'string') return [];
      const lines = text.trim().split(/\r\n|\n|\r/);
      const inputCols = experiment.columns.filter(c => c.type === 'input');
      const parsedRows = [];

      for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        const delimiter = line.includes('\t') ? '\t' : ',';
        const parts = line.split(delimiter).map(s => s.trim().replace(/^"|"$/g, ''));
        const isHeader = parts.some(p => isNaN(parseFloat(p)) && p.length > 0 && !/^[-+]?[0-9]*\.?[0-9]+/.test(p));
        if (isHeader) continue;

        const rowObj = {};
        inputCols.forEach((col, idx) => {
          if (idx < parts.length) {
            const num = parseFloat(parts[idx]);
            rowObj[col.id] = isNaN(num) ? parts[idx] : num;
          }
        });
        if (Object.keys(rowObj).length > 0) {
          parsedRows.push(rowObj);
        }
      }
      return parsedRows;
    },

    generateLabReport: (experiment, tableRows, calculationResults, graphImageUrl, meta = {}) => {
      const studentName = meta.studentName || 'Student Name';
      const regNo = meta.regNo || '24BCE1001';
      const labSlot = meta.labSlot || 'L25+L26';
      const classNo = meta.classNo || 'CHAMP-01';
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      const reportWindow = window.open('', '_blank', 'width=900,height=1000');
      if (!reportWindow) {
        alert('Popup blocker prevented opening the laboratory report. Please allow popups.');
        return;
      }

      let tableHtml = `<table class="report-table"><thead><tr>`;
      experiment.columns.forEach(col => {
        tableHtml += `<th>${col.label} ${col.unit ? `<span class="unit">(${col.unit})</span>` : ''}</th>`;
      });
      tableHtml += `</tr></thead><tbody>`;

      tableRows.forEach(row => {
        tableHtml += `<tr>`;
        experiment.columns.forEach(col => {
          let val = row[col.id];
          if (val === undefined || val === null) val = '—';
          tableHtml += `<td>${val}</td>`;
        });
        tableHtml += `</tr>`;
      });
      tableHtml += `</tbody></table>`;

      let resultsHtml = `<div class="results-grid">`;
      calculationResults.forEach(res => {
        resultsHtml += `
          <div class="result-card">
            <div class="res-label">${res.label}</div>
            <div class="res-val">${res.value} <span class="res-unit">${res.unit || ''}</span></div>
            ${res.formula ? `<div class="res-formula">${res.formula}</div>` : ''}
          </div>
        `;
      });
      resultsHtml += `</div>`;

      const reportContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${experiment.title} - BAPHY105 CHAMP Laboratory Report</title>
          <style>
            @page { size: A4; margin: 15mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; background: #fff; line-height: 1.5; margin: 0; padding: 20px; }
            .header-box { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
            .inst-title { font-size: 16px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; margin: 0; }
            .school-title { font-size: 12px; color: #334155; font-weight: 700; text-transform: uppercase; margin-top: 2px; }
            .lab-title { font-size: 12px; color: #0f766e; font-weight: 700; margin-top: 2px; }
            .meta-table { font-size: 10.5px; border-collapse: collapse; text-align: left; }
            .meta-table td { padding: 2px 6px; }
            .exp-banner { background: #f1f5f9; border-left: 5px solid #2563eb; padding: 12px 16px; margin-bottom: 16px; border-radius: 4px; }
            .exp-banner h1 { margin: 0; font-size: 16px; color: #0f172a; }
            .exp-category { font-size: 11px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
            .section { margin-bottom: 18px; }
            .section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 8px; letter-spacing: 0.5px; }
            .theory-text { font-size: 11.5px; color: #334155; text-align: justify; }
            .formula-banner { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 7px 12px; font-family: monospace; font-size: 12px; font-weight: 700; color: #0f766e; margin-top: 6px; }
            .report-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; }
            .report-table th, .report-table td { border: 1px solid #cbd5e1; padding: 5px 8px; text-align: center; }
            .report-table th { background: #f1f5f9; font-weight: 700; color: #0f172a; }
            .report-table td { font-family: monospace; }
            .graph-container { text-align: center; margin-top: 10px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; background: #fafafa; }
            .graph-img { max-width: 100%; height: auto; max-height: 320px; border-radius: 4px; }
            .results-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; }
            .result-card { border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 10px; background: #f8fafc; }
            .res-label { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; }
            .res-val { font-size: 15px; font-weight: 800; color: #0f172a; font-family: monospace; margin-top: 2px; }
            .res-unit { font-size: 11px; font-weight: 500; color: #64748b; }
            .res-formula { font-size: 9.5px; color: #2563eb; margin-top: 2px; font-family: monospace; }
            .sign-box { display: flex; justify-content: space-between; margin-top: 35px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #475569; }
            .sign-line { width: 160px; border-bottom: 1px solid #475569; margin-top: 30px; }
            .no-print { text-align: center; margin-bottom: 15px; }
            .btn-print { background: #2563eb; color: white; padding: 8px 22px; font-size: 13px; font-weight: 700; border: none; border-radius: 4px; cursor: pointer; }
            @media print { .no-print { display: none; } body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
          </div>
          <div class="header-box">
            <div>
              <h2 class="inst-title">Department of Physics</h2>
              <div class="school-title">School of Advanced Sciences</div>
              <div class="lab-title">ENGINEERING PHYSICS (BAPHY105) — CHAMP LAB MANUAL</div>
            </div>
            <div>
              <table class="meta-table">
                <tr><td><b>Student:</b></td><td>${studentName}</td></tr>
                <tr><td><b>Reg. No:</b></td><td>${regNo}</td></tr>
                <tr><td><b>Lab Slot:</b></td><td>${labSlot}</td></tr>
                <tr><td><b>Class No:</b></td><td>${classNo}</td></tr>
                <tr><td><b>Date:</b></td><td>${dateStr}</td></tr>
              </table>
            </div>
          </div>

          <div class="exp-banner">
            <div class="exp-category">${experiment.category} (${experiment.categoryShort})</div>
            <h1>${experiment.title}</h1>
          </div>

          <div class="section">
            <div class="section-title">1. Aim & Objective</div>
            <div class="theory-text">${experiment.aim}</div>
          </div>

          <div class="section">
            <div class="section-title">2. Apparatus & Materials Required</div>
            <div class="theory-text">${experiment.apparatus}</div>
          </div>

          <div class="section">
            <div class="section-title">3. Governing Formulae & Principles</div>
            <div class="formula-banner">${experiment.formula}</div>
          </div>

          <div class="section">
            <div class="section-title">4. Experimental Data Table</div>
            ${tableHtml}
          </div>

          ${graphImageUrl ? `
            <div class="section" style="page-break-inside: avoid;">
              <div class="section-title">5. Graphical Analysis & Curve Fitting</div>
              <div class="graph-container">
                <img src="${graphImageUrl}" class="graph-img" alt="Plot" />
              </div>
            </div>
          ` : ''}

          <div class="section" style="page-break-inside: avoid;">
            <div class="section-title">6. Calculated Results & Evaluation</div>
            ${resultsHtml}
          </div>

          <div class="sign-box" style="page-break-inside: avoid;">
            <div>
              <div>Student Signature</div>
              <div class="sign-line"></div>
            </div>
            <div>
              <div>Faculty In-Charge Signature</div>
              <div class="sign-line"></div>
            </div>
          </div>
        </body>
        </html>
      `;
      reportWindow.document.open();
      reportWindow.document.write(reportContent);
      reportWindow.document.close();
    }
  };


  // ==========================================
  // 6. APPLICATION CONTROLLER
  // ==========================================
  class PhysicsLabApp {
    constructor() {
      this.currentExpId = StorageEngine.getActiveExperimentId() || 'solar_cell';
      if (!EXPERIMENTS_REGISTRY.some(e => e.id === this.currentExpId)) {
        this.currentExpId = 'solar_cell';
      }

      this.currentExp = getExperimentById(this.currentExpId);
      this.state = StorageEngine.getExperimentState(this.currentExpId, this.currentExp);
      this.calcResult = null;

      this.initElements();
      this.initGraph();
      this.renderSidebar();
      this.bindEvents();
      this.loadExperiment(this.currentExpId);
    }

    initElements() {
      this.expTitleEl = document.getElementById('exp-title');
      this.expCategoryEl = document.getElementById('exp-category');
      this.expCategoryBadgeEl = document.getElementById('exp-category-badge');
      this.expCategoryTagEl = document.getElementById('exp-category-tag');
      this.expAimEl = document.getElementById('exp-aim');
      this.expApparatusEl = document.getElementById('exp-apparatus');
      this.expFormulaEl = document.getElementById('exp-formula');
      this.expTheoryEl = document.getElementById('exp-theory');
      this.globalsContainerEl = document.getElementById('globals-container');

      this.tableHeaderEl = document.getElementById('table-header-row');
      this.tableBodyEl = document.getElementById('table-body');
      this.addRowBtn = document.getElementById('btn-add-row');
      this.resetDataBtn = document.getElementById('btn-reset-data');
      this.clearDataBtn = document.getElementById('btn-clear-data');
      this.exportCsvBtn = document.getElementById('btn-export-csv');
      this.pasteDataBtn = document.getElementById('btn-paste-data');

      this.resultsGridEl = document.getElementById('results-grid');
      this.reportBtn = document.getElementById('btn-generate-report');

      this.sidebarListEl = document.getElementById('sidebar-experiments-list');
      this.searchBarEl = document.getElementById('sidebar-search-input');
      this.sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
      this.sidebarEl = document.getElementById('app-sidebar');

      this.canvasEl = document.getElementById('scientific-canvas');
      this.tooltipEl = document.getElementById('canvas-tooltip');

      this.reportModal = document.getElementById('report-modal');
      this.pasteModal = document.getElementById('paste-modal');
    }

    initGraph() {
      this.graph = new ScientificGraph(this.canvasEl, this.tooltipEl);
    }

    renderSidebar() {
      this.sidebarListEl.innerHTML = '';
      const query = (this.searchBarEl ? this.searchBarEl.value.toLowerCase().trim() : '');

      const categories = [
        { id: 1, name: 'Preparatory Tools', sub: 'Tools I to IV' },
        { id: 2, name: 'CHAMP Cycle 1', sub: 'Semiconductors & Optics (Expt 1-4)' },
        { id: 3, name: 'CHAMP Cycle 2', sub: 'Quantum & Quantum Computing (Expt 5-8)' }
      ];

      categories.forEach(cat => {
        const catExps = EXPERIMENTS_REGISTRY.filter(exp => {
          if (exp.categoryIndex !== cat.id) return false;
          if (!query) return true;
          return exp.title.toLowerCase().includes(query) ||
                 exp.aim.toLowerCase().includes(query) ||
                 exp.category.toLowerCase().includes(query);
        });

        if (catExps.length === 0) return;

        const groupHeader = document.createElement('div');
        groupHeader.className = 'sidebar-category-header';
        groupHeader.innerHTML = `
          <div class="cat-title"><i class="fas fa-layer-group"></i> ${cat.name}</div>
          <div class="cat-sub">${cat.sub}</div>
        `;
        this.sidebarListEl.appendChild(groupHeader);

        catExps.forEach(exp => {
          const item = document.createElement('div');
          item.className = `sidebar-item ${exp.id === this.currentExpId ? 'active' : ''}`;
          item.dataset.id = exp.id;
          item.innerHTML = `
            <div class="sidebar-item-icon"><i class="fas ${exp.icon || 'fa-atom'}"></i></div>
            <div class="sidebar-item-text">
              <div class="item-title">${exp.title}</div>
              <div class="item-meta">${exp.categoryShort}</div>
            </div>
          `;

          item.addEventListener('click', () => {
            this.loadExperiment(exp.id);
            if (window.innerWidth < 1024 && this.sidebarEl) {
              this.sidebarEl.classList.remove('open');
            }
          });

          this.sidebarListEl.appendChild(item);
        });
      });
    }

    loadExperiment(expId) {
      this.currentExpId = expId;
      this.currentExp = getExperimentById(expId);
      this.state = StorageEngine.getExperimentState(expId, this.currentExp);
      StorageEngine.setActiveExperimentId(expId);

      this.updateHeader();
      this.renderGlobals();
      this.renderTable();
      this.recalculateAndRender();

      const items = this.sidebarListEl.querySelectorAll('.sidebar-item');
      items.forEach(el => {
        el.classList.toggle('active', el.dataset.id === expId);
      });
    }

    updateHeader() {
      const exp = this.currentExp;
      if (this.expTitleEl) this.expTitleEl.textContent = exp.title;
      if (this.expCategoryEl) this.expCategoryEl.textContent = exp.category;
      if (this.expCategoryBadgeEl) this.expCategoryBadgeEl.textContent = exp.categoryShort;
      if (this.expCategoryTagEl) this.expCategoryTagEl.textContent = exp.category;
      if (this.expAimEl) this.expAimEl.textContent = exp.aim;
      if (this.expApparatusEl) this.expApparatusEl.textContent = exp.apparatus;
      if (this.expFormulaEl) this.expFormulaEl.textContent = exp.formula;
      if (this.expTheoryEl) this.expTheoryEl.textContent = exp.theory;
    }

    renderGlobals() {
      this.globalsContainerEl.innerHTML = '';
      const defs = this.currentExp.globals || {};
      const keys = Object.keys(defs);

      if (keys.length === 0) {
        this.globalsContainerEl.style.display = 'none';
        return;
      }

      this.globalsContainerEl.style.display = 'grid';
      keys.forEach(key => {
        const def = defs[key];
        if (typeof def !== 'object' || !def.label) return;

        const card = document.createElement('div');
        card.className = 'global-param-card';

        const label = document.createElement('label');
        label.className = 'global-label';
        label.textContent = def.label;

        let inputEl;
        if (def.options) {
          inputEl = document.createElement('select');
          inputEl.className = 'global-select';
          def.options.forEach(opt => {
            const optEl = document.createElement('option');
            optEl.value = opt;
            optEl.textContent = opt.toUpperCase();
            if ((this.state.globals[key] || def.value) === opt) optEl.selected = true;
            inputEl.appendChild(optEl);
          });
          inputEl.addEventListener('change', (e) => {
            this.state.globals[key] = e.target.value;
            this.recalculateAndRender();
          });
        } else {
          inputEl = document.createElement('input');
          inputEl.type = 'number';
          inputEl.className = 'global-input';
          inputEl.step = 'any';
          inputEl.value = this.state.globals[key] !== undefined ? this.state.globals[key] : def.value;
          inputEl.addEventListener('input', (e) => {
            this.state.globals[key] = parseFloat(e.target.value) || 0;
            this.recalculateAndRender();
          });
        }

        card.appendChild(label);
        card.appendChild(inputEl);
        if (def.unit) {
          const unitBadge = document.createElement('span');
          unitBadge.className = 'global-unit';
          unitBadge.textContent = def.unit;
          card.appendChild(unitBadge);
        }

        this.globalsContainerEl.appendChild(card);
      });
    }

    renderTable() {
      this.tableHeaderEl.innerHTML = '<th style="width: 48px; text-align: center;">#</th>';

      this.currentExp.columns.forEach(col => {
        const th = document.createElement('th');
        th.className = col.type === 'input' ? 'th-input' : 'th-computed';

        const content = document.createElement('div');
        content.className = 'th-content';

        const title = document.createElement('span');
        title.className = 'th-title';
        title.textContent = col.label;
        content.appendChild(title);

        if (col.unit) {
          const unitBadge = document.createElement('span');
          unitBadge.className = 'th-unit-badge';
          unitBadge.textContent = col.unit;
          content.appendChild(unitBadge);
        }

        th.appendChild(content);
        this.tableHeaderEl.appendChild(th);
      });

      const thAction = document.createElement('th');
      thAction.style.width = '48px';
      thAction.style.textAlign = 'center';
      thAction.textContent = 'Act';
      this.tableHeaderEl.appendChild(thAction);

      this.renderTableBody();
    }

    renderTableBody() {
      this.tableBodyEl.innerHTML = '';
      const rows = this.state.rows || [];
      const computedRows = (this.calcResult && this.calcResult.tableRows) || [];

      rows.forEach((row, rowIdx) => {
        const tr = document.createElement('tr');
        const compRow = computedRows[rowIdx] || {};

        const tdIdx = document.createElement('td');
        tdIdx.className = 'td-index';
        tdIdx.textContent = rowIdx + 1;
        tr.appendChild(tdIdx);

        this.currentExp.columns.forEach(col => {
          const td = document.createElement('td');
          if (col.type === 'input') {
            td.className = 'td-input';
            const input = document.createElement('input');
            input.type = typeof row[col.id] === 'string' && isNaN(Number(row[col.id])) ? 'text' : 'number';
            input.className = 'cell-input';
            input.step = 'any';
            input.value = row[col.id] !== undefined ? row[col.id] : '';
            input.placeholder = '—';

            input.addEventListener('input', (e) => {
              const val = e.target.value.trim();
              this.state.rows[rowIdx][col.id] = val === '' ? '' : (isNaN(Number(val)) ? val : parseFloat(val));
              this.recalculateAndRender();
            });

            // Keyboard navigation
            input.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const nextRow = tr.nextElementSibling;
                if (nextRow) {
                  const targetInput = nextRow.querySelectorAll('.cell-input')[0];
                  if (targetInput) targetInput.focus();
                } else {
                  this.addRowBtn.click();
                }
              }
            });

            td.appendChild(input);
          } else {
            td.className = 'td-computed';
            td.textContent = compRow[col.id] !== undefined ? compRow[col.id] : '—';
          }
          tr.appendChild(td);
        });

        const tdAction = document.createElement('td');
        tdAction.className = 'td-action';
        const delBtn = document.createElement('button');
        delBtn.className = 'btn-delete-row';
        delBtn.innerHTML = '×';
        delBtn.title = 'Remove Row';
        delBtn.addEventListener('click', () => {
          this.state.rows.splice(rowIdx, 1);
          this.renderTableBody();
          this.recalculateAndRender();
        });

        tdAction.appendChild(delBtn);
        tr.appendChild(tdAction);
        this.tableBodyEl.appendChild(tr);
      });
    }

    recalculateAndRender() {
      const calcFn = EXPERIMENT_CALCULATORS[this.currentExpId];
      if (!calcFn) return;

      try {
        this.calcResult = calcFn(this.state.rows, this.state.globals, this.state.units);
        this.updateComputedCells();

        if (this.calcResult.plot) {
          this.graph.setData(this.calcResult.plot);
        } else {
          this.graph.setData(null);
        }

        this.renderResults();
        StorageEngine.saveExperimentState(this.currentExpId, this.state);
      } catch (err) {
        console.error('Calculation error:', err);
      }
    }

    updateComputedCells() {
      if (!this.calcResult || !this.calcResult.tableRows) return;
      const compRows = this.calcResult.tableRows;
      const trList = this.tableBodyEl.querySelectorAll('tr');

      trList.forEach((tr, rIdx) => {
        const compRow = compRows[rIdx];
        if (!compRow) return;

        const compTds = tr.querySelectorAll('.td-computed');
        const compCols = this.currentExp.columns.filter(c => c.type === 'computed');

        compCols.forEach((col, cIdx) => {
          if (compTds[cIdx]) {
            compTds[cIdx].textContent = compRow[col.id] !== undefined ? compRow[col.id] : '—';
          }
        });
      });
    }

    renderResults() {
      this.resultsGridEl.innerHTML = '';
      const results = (this.calcResult && this.calcResult.results) || [];

      if (results.length === 0) {
        this.resultsGridEl.innerHTML = '<div style="color:var(--text-muted); font-size:12px;">Enter observations to compute physics metrics.</div>';
        return;
      }

      results.forEach(res => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
          <div class="result-label">${res.label}</div>
          <div class="result-value-row">
            <span class="result-value">${res.value}</span>
            ${res.unit ? `<span class="result-unit">${res.unit}</span>` : ''}
            ${res.uncertainty ? `<span class="result-uncertainty">${res.uncertainty}</span>` : ''}
          </div>
          ${res.formula ? `<div class="result-formula">Formula: <code>${res.formula}</code></div>` : ''}
        `;
        this.resultsGridEl.appendChild(card);
      });
    }

    bindEvents() {
      this.addRowBtn.addEventListener('click', () => {
        const newRow = {};
        this.currentExp.columns.forEach(c => {
          if (c.type === 'input') newRow[c.id] = '';
        });
        this.state.rows.push(newRow);
        this.renderTableBody();
        this.recalculateAndRender();

        const lastTr = this.tableBodyEl.lastElementChild;
        if (lastTr) {
          const firstInput = lastTr.querySelector('input');
          if (firstInput) firstInput.focus();
        }
      });

      this.resetDataBtn.addEventListener('click', () => {
        if (confirm('Reset this experiment to official BAPHY105 lab sample data?')) {
          this.state = StorageEngine.resetExperiment(this.currentExpId, this.currentExp);
          this.renderGlobals();
          this.renderTable();
          this.recalculateAndRender();
        }
      });

      this.clearDataBtn.addEventListener('click', () => {
        if (confirm('Clear all observations from this table?')) {
          this.state.rows = [{}];
          this.renderTableBody();
          this.recalculateAndRender();
        }
      });

      this.exportCsvBtn.addEventListener('click', () => {
        const tableRows = (this.calcResult && this.calcResult.tableRows) || this.state.rows;
        ExportEngine.exportToCSV(this.currentExp, tableRows);
      });

      if (this.pasteDataBtn) {
        this.pasteDataBtn.addEventListener('click', () => {
          this.openPasteModal();
        });
      }

      this.reportBtn.addEventListener('click', () => {
        this.openReportModal();
      });

      if (this.searchBarEl) {
        this.searchBarEl.addEventListener('input', () => {
          this.renderSidebar();
        });
      }

      if (this.sidebarToggleBtn && this.sidebarEl) {
        this.sidebarToggleBtn.addEventListener('click', () => {
          this.sidebarEl.classList.toggle('open');
        });
      }

      // Backdrop click-to-close modals
      [this.reportModal, this.pasteModal].forEach(modal => {
        if (!modal) return;
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.remove('active');
          }
        });
      });

      // Modal close 'x' buttons
      const closeReportBtn = document.getElementById('btn-close-report');
      if (closeReportBtn) {
        closeReportBtn.addEventListener('click', () => {
          if (this.reportModal) this.reportModal.classList.remove('active');
        });
      }
      const closePasteBtn = document.getElementById('btn-close-paste');
      if (closePasteBtn) {
        closePasteBtn.addEventListener('click', () => {
          if (this.pasteModal) this.pasteModal.classList.remove('active');
        });
      }

      // Modal Cancel Buttons
      const cancelReportBtn = document.getElementById('btn-cancel-report');
      if (cancelReportBtn) {
        cancelReportBtn.addEventListener('click', () => {
          if (this.reportModal) this.reportModal.classList.remove('active');
        });
      }
      const cancelPasteBtn = document.getElementById('btn-cancel-paste');
      if (cancelPasteBtn) {
        cancelPasteBtn.addEventListener('click', () => {
          if (this.pasteModal) this.pasteModal.classList.remove('active');
        });
      }

      // Modal Confirm Buttons
      const confirmPasteBtn = document.getElementById('btn-confirm-paste');
      if (confirmPasteBtn) {
        confirmPasteBtn.addEventListener('click', () => {
          const textarea = document.getElementById('paste-textarea');
          const text = textarea ? textarea.value : '';
          const parsed = ExportEngine.parseClipboardData(text, this.currentExp);
          if (parsed.length > 0) {
            this.state.rows = parsed;
            this.renderTableBody();
            this.recalculateAndRender();
            if (this.pasteModal) this.pasteModal.classList.remove('active');
          } else {
            alert('Could not detect observation data. Please ensure numbers match the input columns.');
          }
        });
      }

      const confirmReportBtn = document.getElementById('btn-confirm-report');
      if (confirmReportBtn) {
        confirmReportBtn.addEventListener('click', () => {
          const studentName = document.getElementById('report-student-name').value || 'Student Name';
          const regNo = document.getElementById('report-reg-no').value || '24BCE1001';
          const labSlot = document.getElementById('report-lab-slot').value || 'L25+L26';
          const classNo = document.getElementById('report-class-no').value || 'CHAMP-01';

          if (this.reportModal) this.reportModal.classList.remove('active');
          this.triggerReportGeneration({ studentName, regNo, labSlot, classNo });
        });
      }

      // Global keyboard shortcuts
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          this.addRowBtn.click();
        }
        if (e.key === 'Escape') {
          if (this.reportModal) this.reportModal.classList.remove('active');
          if (this.pasteModal) this.pasteModal.classList.remove('active');
        }
      });
    }

    openPasteModal() {
      if (!this.pasteModal) return;
      this.pasteModal.classList.add('active');
      const textarea = document.getElementById('paste-textarea');
      if (textarea) {
        textarea.value = '';
        setTimeout(() => textarea.focus(), 50);
      }
    }

    openReportModal() {
      if (!this.reportModal) {
        this.triggerReportGeneration({});
        return;
      }
      this.reportModal.classList.add('active');
    }

    triggerReportGeneration(meta) {
      const tableRows = (this.calcResult && this.calcResult.tableRows) || this.state.rows;
      const results = (this.calcResult && this.calcResult.results) || [];
      let graphImg = null;
      try {
        graphImg = this.graph.getImageDataUrl();
      } catch (e) {}

      ExportEngine.generateLabReport(this.currentExp, tableRows, results, graphImg, meta);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.app = new PhysicsLabApp();
  });
})();
