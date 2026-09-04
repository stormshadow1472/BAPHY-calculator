/**
 * BAPHY105 Engineering Physics Lab Calculator - Calculation Engine
 * Pure mathematical algorithms, regressions, and physics models for all BAPHY105 experiments.
 */

import { CONSTANTS, UNIT_CONVERSIONS, calculatePercentError } from './constants.js';

export function computeMean(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((acc, v) => acc + v, 0) / arr.length;
}

export function computeStdDev(arr, mean) {
  if (!arr || arr.length <= 1) return 0;
  const m = mean !== undefined ? mean : computeMean(arr);
  const variance = arr.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

export function computeLinearRegression(points) {
  const valid = points.filter(p => 
    p && typeof p.x === 'number' && typeof p.y === 'number' && 
    !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
  );

  const n = valid.length;
  if (n < 2) {
    return { isValid: false, count: n, warning: 'At least 2 valid data points required.' };
  }

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

  if (Math.abs(Sxx) < 1e-18) {
    return { isValid: false, count: n, warning: 'Zero horizontal variance.' };
  }

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

function formatNum(v) {
  if (Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3 && v !== 0)) {
    return v.toExponential(3);
  }
  return v.toFixed(3);
}

export const EXPERIMENT_CALCULATORS = {
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
        xLabel: 'Observation Trial (#)',
        yLabel: 'Corrected Thickness (mm)',
        points: crValues.map((v, i) => ({ x: i + 1, y: v, label: `Trial ${i+1}: ${v.toFixed(3)} mm` })),
        isCurve: true
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
        xLabel: 'Observation Index',
        yLabel: 'Corrected Dimension (cm)',
        points: crValues.map((v, i) => ({ x: i + 1, y: v, label: `${v.toFixed(3)} cm` })),
        isCurve: true
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
  // 3. TRAVELLING MICROSCOPE
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

    let internalDiam = null;
    let radius = null;
    if (readings.length >= 2) {
      internalDiam = Math.abs(readings[1] - readings[0]);
      radius = internalDiam / 2;
    }

    return {
      tableRows,
      plot: {
        xLabel: 'Measurement Point',
        yLabel: 'Microscope Scale Reading (cm)',
        points: readings.map((r, i) => ({ x: i + 1, y: r, label: `${r.toFixed(4)} cm` })),
        isCurve: true
      },
      results: [
        { label: 'Internal Bore Diameter (D)', value: internalDiam !== null ? internalDiam.toFixed(4) : '—', unit: 'cm', formula: '|R₂ - R₁|' },
        { label: 'Internal Bore Radius (r)', value: radius !== null ? radius.toFixed(4) : '—', unit: 'cm', formula: 'D / 2' },
        { label: 'Radius in Millimeters', value: radius !== null ? (radius * 10).toFixed(3) : '—', unit: 'mm' },
        { label: 'Least Count (LC)', value: '0.001', unit: 'cm', formula: '1 MSD - 1 VSD (50 VSD = 49 MSD)' }
      ]
    };
  },

  // ----------------------------------------------------
  // 4. SPECTROMETER
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

    let prismAngle = 60.0;
    if (trVals.length >= 2) {
      let diff = Math.abs(trVals[1] - trVals[0]);
      if (diff > 180) diff = 360 - diff;
      prismAngle = diff / 2;
    }

    const deltaM = parseFloat(globals.delta_m_deg) || 49.5;
    const A_rad = (prismAngle * Math.PI) / 180;
    const D_rad = (deltaM * Math.PI) / 180;
    const mu = Math.sin((A_rad + D_rad) / 2) / Math.sin(A_rad / 2);

    return {
      tableRows,
      plot: null,
      results: [
        { label: 'Calculated Prism Angle (A)', value: prismAngle.toFixed(2), unit: '°', formula: '|R₁ - R₂| / 2' },
        { label: 'Angle of Minimum Deviation (δm)', value: deltaM.toFixed(2), unit: '°' },
        { label: 'Refractive Index of Glass (µ)', value: mu.toFixed(4), formula: 'sin((A + δm)/2) / sin(A/2)' },
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
        isCurve: true
      },
      results: [
        { label: 'Open-Circuit Voltage (Voc)', value: Voc.toFixed(3), unit: 'V' },
        { label: 'Short-Circuit Current (Isc)', value: Isc.toFixed(2), unit: 'mA' },
        { label: 'Maximum Power Output (Pmax)', value: Pmax.toFixed(2), unit: 'mW', formula: 'Vmax × Imax' },
        { label: 'Fill Factor (FF)', value: fillFactor.toFixed(3), formula: 'Pmax / (Voc × Isc)' },
        { label: 'Power Conversion Efficiency (η)', value: efficiency.toFixed(2) + '%', formula: '[Pmax / (A · I₀)] × 100%' },
        { label: 'Configuration Mode', value: (globals.config_mode || 'single').toUpperCase() }
      ]
    };
  },

  // ----------------------------------------------------
  // 6. PLANCK'S CONSTANT FROM LEDS (CHAMP EXPT 2)
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
        // h = V_B * lambda * (e / c)
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
    // V_B = (hc/e) * (1/lambda) => slope = hc/e => h = slope * (e / c)
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
        points: points.map(p => ({ x: p.x, y: p.y, label: `1/λ=${p.x.toExponential(2)}m⁻¹, V_B=${p.y.toFixed(2)}V` })),
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
  // 7. PHOTODIODE CHARACTERISTICS (CHAMP EXPT 3)
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
        points: points.map(p => ({ x: p.x, y: p.y, label: `E=${p.x}eV, T=${p.y.toExponential(2)}` })),
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

        // Bragg: lambda = 2d sin(1/2 arctan(D / 2L))
        const theta = 0.5 * Math.atan(D_m / (2 * L_m));
        const lambdaBragg = 2 * d_m * Math.sin(theta);

        // de Broglie: lambda = h / sqrt(2 m_e e V)
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
        points: points.map(p => ({ x: p.x, y: p.y, label: `1/√V=${p.x.toFixed(4)}, D=${(p.y*1000).toFixed(1)}mm` })),
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

    return {
      tableRows,
      plot: null,
      results: [
        { label: 'Observed Product (Δy · Δpy / h)', value: ratios.length > 0 ? meanRatio.toFixed(3) : '—', formula: 'd·(h/λ)sinθ / h ≈ 1' },
        { label: 'Theoretical Bound (h / 4π)', value: (CONSTANTS.h / (4 * Math.PI)).toExponential(3), unit: 'J·s' },
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

        // |psi> = c|0> + e^(i phi) s |1>
        const stateStr = `${c.toFixed(3)}|0⟩ + ${s.toFixed(3)}e^{i${phi.toFixed(2)}}|1⟩`;
        const norm = Math.pow(c, 2) + Math.pow(s, 2);

        let transStr = '';
        if (gate === 'X') {
          // X flips |0> <-> |1>
          transStr = `${s.toFixed(3)}e^{i${phi.toFixed(2)}}|0⟩ + ${c.toFixed(3)}|1⟩`;
        } else if (gate === 'Z') {
          // Z leaves |0> and flips sign of |1>
          transStr = `${c.toFixed(3)}|0⟩ - ${s.toFixed(3)}e^{i${phi.toFixed(2)}}|1⟩`;
        } else if (gate === 'Y') {
          transStr = `-i${s.toFixed(3)}e^{i${phi.toFixed(2)}}|0⟩ + i${c.toFixed(3)}|1⟩`;
        } else {
          // Hadamard
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

    // Bloch Sphere Coordinates of the last state for 3D visualization
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

    rows.forEach(row => {
      const state = (row.input_state || '').trim();

      let cnot = '—';
      let swap = '—';
      let nature = 'Separable (Product)';
      let angles = '—';

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
      plot: null,
      results: [
        { label: 'Active Two-Qubit Gate', value: gate, formula: gate === 'CNOT' ? 'CNOT|c, t⟩ = |c, t ⊕ c⟩' : 'SWAP|a, b⟩ = |b, a⟩' },
        { label: 'Hilbert Space Dimension', value: '4 (C⁴ = C² ⊗ C²)' },
        { label: 'Bell State Entanglement', value: 'Concurrence C = 1.0 (Maximal)' }
      ]
    };
  }
};
