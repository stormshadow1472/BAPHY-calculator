/**
 * Engineering Physics Laboratory Calculator - Physical Constants & Conversion Engine
 * Conforms to CODATA recommended values and standard physics laboratory benchmarks.
 */

export const CONSTANTS = {
  // Fundamental Physical Constants (CODATA 2018 / 2022)
  c: 2.99792458e8,          // Speed of light in vacuum (m/s)
  e: 1.602176634e-19,       // Elementary charge (C)
  h: 6.62607015e-34,        // Planck's constant (J*s)
  hbar: 1.054571817e-34,    // Reduced Planck constant (J*s)
  m_e: 9.1093837015e-31,    // Electron rest mass (kg)
  m_p: 1.67262192369e-27,   // Proton rest mass (kg)
  g: 9.80665,               // Standard acceleration due to gravity (m/s^2)
  k_B: 1.380649e-23,        // Boltzmann constant (J/K)
  N_A: 6.02214076e23,       // Avogadro constant (mol^-1)
  mu_0: 1.25663706212e-6,   // Vacuum permeability (4*pi*1e-7 H/m or T*m/A)
  epsilon_0: 8.8541878128e-12, // Vacuum permittivity (F/m)
  R_gas: 8.314462618,       // Molar gas constant (J/(mol*K))

  // Standard Material & Reference Values
  speed_of_sound_20C: 343.2, // Speed of sound at 20 deg C in dry air (m/s)
  lambda_sodium_D: 589.3e-9, // Sodium D-line average wavelength (m)
  lambda_he_ne: 632.8e-9,    // Helium-Neon laser wavelength (m)
  copper_resistivity: 1.68e-8, // Copper resistivity at 20 deg C (Ohm*m)
  nichrome_resistivity: 1.10e-6, // Nichrome resistivity (Ohm*m)
  steel_youngs_modulus: 2.0e11,  // Steel Young's Modulus (N/m^2 or Pa)
  brass_youngs_modulus: 1.0e11,  // Brass Young's Modulus (Pa)
  germanium_band_gap: 0.67,  // Germanium band gap (eV) at 300K
  silicon_band_gap: 1.12,    // Silicon band gap (eV) at 300K
  electron_em_ratio: 1.758820e11, // Specific charge e/m of electron (C/kg)
  work_function_cesium: 2.14, // Cesium work function (eV)
  work_function_potassium: 2.30, // Potassium work function (eV)
};

/**
 * Unit conversion factors to standard SI units
 */
export const UNIT_CONVERSIONS = {
  // Length to meters (m)
  length: {
    m: 1.0,
    cm: 1e-2,
    mm: 1e-3,
    um: 1e-6,
    nm: 1e-9,
    angstrom: 1e-10,
    pm: 1e-12,
    inch: 0.0254,
    ft: 0.3048,
  },
  // Mass to kilograms (kg)
  mass: {
    kg: 1.0,
    g: 1e-3,
    mg: 1e-6,
    lb: 0.45359237,
  },
  // Time to seconds (s)
  time: {
    s: 1.0,
    ms: 1e-3,
    us: 1e-6,
    ns: 1e-9,
    min: 60.0,
  },
  // Voltage to Volts (V)
  voltage: {
    V: 1.0,
    mV: 1e-3,
    uV: 1e-6,
    kV: 1e3,
  },
  // Current to Amperes (A)
  current: {
    A: 1.0,
    mA: 1e-3,
    uA: 1e-6,
    nA: 1e-9,
    pA: 1e-12,
  },
  // Resistance to Ohms (Omega)
  resistance: {
    ohm: 1.0,
    mohm: 1e-3,
    kohm: 1e3,
    Mohm: 1e6,
  },
  // Magnetic field to Tesla (T)
  magnetic_field: {
    T: 1.0,
    mT: 1e-3,
    G: 1e-4, // Gauss
    kG: 0.1,
  },
  // Frequency to Hertz (Hz)
  frequency: {
    Hz: 1.0,
    kHz: 1e3,
    MHz: 1e6,
    GHz: 1e9,
    THz: 1e12,
    x1e14_Hz: 1e14,
  },
  // Energy to Joules (J)
  energy: {
    J: 1.0,
    eV: 1.602176634e-19,
    meV: 1.602176634e-22,
    cal: 4.184,
  },
  // Temperature converters
  temperature: {
    toKelvin: (val, unit) => {
      if (unit === 'C' || unit === '°C') return val + 273.15;
      if (unit === 'F' || unit === '°F') return (val - 32) * (5 / 9) + 273.15;
      return val; // Assume K
    },
    fromKelvin: (valK, unit) => {
      if (unit === 'C' || unit === '°C') return valK - 273.15;
      if (unit === 'F' || unit === '°F') return (valK - 273.15) * (9 / 5) + 32;
      return valK;
    },
  },
  // Angle converters
  angle: {
    degToRad: (deg) => (deg * Math.PI) / 180,
    radToDeg: (rad) => (rad * 180) / Math.PI,
  }
};

/**
 * Numerical formatting helpers for scientific precision
 */
export function formatScientific(num, sigFigs = 4) {
  if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
    return '—';
  }
  const abs = Math.abs(num);
  if (abs === 0) return '0.000';
  if (abs >= 0.001 && abs < 10000) {
    const precision = Math.max(0, sigFigs - Math.floor(Math.log10(abs)) - 1);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: Math.min(precision, 4),
      maximumFractionDigits: Math.min(Math.max(precision, 2), 6),
    });
  }
  return num.toExponential(sigFigs - 1);
}

export function formatPercent(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num) || !isFinite(num)) {
    return '—';
  }
  return num.toFixed(decimals) + '%';
}

export function calculatePercentError(experimental, accepted) {
  if (!accepted || isNaN(experimental) || isNaN(accepted) || !isFinite(experimental)) {
    return null;
  }
  return (Math.abs(experimental - accepted) / Math.abs(accepted)) * 100;
}
