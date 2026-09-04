/**
 * BAPHY105 Engineering Physics Lab Calculator - Scientific Graph & Visualizer Engine
 * High-DPI HTML5 Canvas scientific plotter with linear fits, curves, dual-series,
 * 3D Bloch Sphere, Capillary Bore geometry, Prism deviation curves, Single-slit diffraction,
 * and Two-Qubit quantum probability distributions.
 */

export class ScientificGraph {
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
      const bgGrad = ctx.createRadialGradient(this.width / 2, this.height / 2, 20, this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.75);
      bgGrad.addColorStop(0, '#0c162e');
      bgGrad.addColorStop(1, '#050814');
      ctx.fillStyle = bgGrad;
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

