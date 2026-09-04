/**
 * BAPHY105 Engineering Physics Lab Calculator - Scientific Graph & Bloch Sphere Engine
 * High-DPI HTML5 Canvas scientific plotter with linear fits, curves, dual-series,
 * and an interactive 3D Bloch Sphere visualizer for Quantum Computing.
 */

export class ScientificGraph {
  constructor(canvasElement, tooltipElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.tooltip = tooltipElement;
    this.data = null;
    this.hoverPoint = null;

    // Vibrant jewel-toned palette on deep navy canvas (rich, pleasant, not irritating)
    this.theme = {
      bg: '#080d1a',
      grid: '#17223b',
      gridSub: '#10182b',
      axis: '#334155',
      text: '#94a3b8',
      textLight: '#f1f5f9',
      accentCyan: '#06b6d4',
      accentEmerald: '#10b981',
      accentAmber: '#f59e0b',
      accentRose: '#f43f5e',
      accentIndigo: '#6366f1',
      accentViolet: '#8b5cf6',
      pointBorder: '#38bdf8',
      residualLine: 'rgba(244, 63, 94, 0.55)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "JetBrains Mono", monospace'
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
    this.canvas.width = Math.max(300, rect.width * dpr);
    this.canvas.height = Math.max(240, rect.height * dpr);
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
    this.render();
  }

  render() {
    if (!this.width || !this.height) {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = (rect.width || 600) * dpr;
      this.canvas.height = (rect.height || 400) * dpr;
      this.ctx.scale(dpr, dpr);
      this.width = rect.width || 600;
      this.height = rect.height || 400;
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

    // Special 3D Bloch Sphere Visualizer for Quantum Experiments
    if (this.data.isBloch) {
      this.drawBlochSphere();
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

  // ==========================================
  // BLOCH SPHERE 3D RENDERER
  // ==========================================
  drawBlochSphere() {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2 + 10;
    const R = Math.min(this.width, this.height) * 0.36;

    const th = this.data.theta || 0;
    const ph = this.data.phi || 0;

    // Glowing title banner
    ctx.font = `bold 14px ${this.theme.fontFamily}`;
    ctx.fillStyle = this.theme.accentCyan;
    ctx.textAlign = 'center';
    ctx.fillText('Bloch Sphere 3D State Vector Visualizer', cx, 26);

    // Sphere Outer Rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Translucent sphere volume fill
    const grad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
    grad.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
    grad.addColorStop(1, 'rgba(6, 182, 212, 0.03)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Equator Ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R * 0.32, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Prime Meridian Ellipse
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * 0.32, R, 0, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.stroke();

    // Z Axis (vertical)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy + R + 18);
    ctx.lineTo(cx, cy - R - 18);
    ctx.stroke();

    // X Axis (tilted)
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

    // Qubit State Vector tip on Bloch sphere
    // Coordinates: x = sin(th)*cos(ph), y = sin(th)*sin(ph), z = cos(th)
    const sx = cx + R * (Math.sin(th) * Math.cos(ph) * 0.9 + Math.sin(th) * Math.sin(ph) * 0.3);
    const sy = cy - R * Math.cos(th) + R * (Math.sin(th) * Math.cos(ph) * 0.28);

    // Vector line from center
    ctx.strokeStyle = '#f59e0b'; // amber glowing
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sx, sy);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Glowing tip
    ctx.beginPath();
    ctx.arc(sx, sy, 7, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Angle badge in corner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.strokeRect(20, 20, 180, 52);
    ctx.fillRect(20, 20, 180, 52);
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

    this.hoverPoint = closest;
    this.render();

    if (closest && this.tooltip) {
      const reg = this.data.regression;
      let fitText = '';
      if (reg && reg.isValid) {
        const yFit = reg.slope * closest.x + reg.intercept;
        const res = closest.y - yFit;
        fitText = `<div>Fit ŷ: <b>${this.formatTick(yFit)}</b></div><div>Residual: <b>${this.formatTick(res)}</b></div>`;
      }

      this.tooltip.innerHTML = `
        <div style="font-weight:700; color:#38bdf8; margin-bottom:4px;">Observation Point</div>
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
