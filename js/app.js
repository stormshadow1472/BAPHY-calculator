/**
 * BAPHY105 Engineering Physics CHAMP Lab Calculator - Application Controller
 * Manages BAPHY105 syllabus experiments, interactive tables, graphs, and reports.
 */

import { EXPERIMENTS_REGISTRY, getExperimentById } from './sampleData.js';
import { EXPERIMENT_CALCULATORS } from './physicsEngine.js';
import { ScientificGraph } from './graphEngine.js';
import { ExportEngine } from './exportEngine.js';
import { StorageEngine } from './storage.js';

class PhysicsLabApp {
  constructor() {
    this.currentExpId = StorageEngine.getActiveExperimentId() || 'solar_cell';
    // If previous ID does not exist in BAPHY105 registry, default to solar_cell
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
    StorageEngine.setActiveExperimentId(expId);

    this.state = StorageEngine.getExperimentState(expId, this.currentExp);

    document.querySelectorAll('.sidebar-item').forEach(el => {
      el.classList.toggle('active', el.dataset.id === expId);
    });

    this.expTitleEl.textContent = this.currentExp.title;
    this.expCategoryEl.textContent = this.currentExp.category;
    this.expCategoryBadgeEl.textContent = this.currentExp.categoryShort;
    this.expAimEl.textContent = this.currentExp.aim;
    this.expApparatusEl.textContent = this.currentExp.apparatus;
    this.expFormulaEl.textContent = this.currentExp.formula;
    this.expTheoryEl.textContent = this.currentExp.theory;

    this.renderGlobals();
    this.renderTable();
    this.recalculateAndRender();
  }

  renderGlobals() {
    this.globalsContainerEl.innerHTML = '';
    const globals = this.currentExp.globals || {};
    const keys = Object.keys(globals);

    if (keys.length === 0) {
      this.globalsContainerEl.style.display = 'none';
      return;
    }

    this.globalsContainerEl.style.display = 'grid';
    keys.forEach(key => {
      const def = globals[key];
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
      th.className = col.type === 'computed' ? 'th-computed' : 'th-input';

      let unitSelectorHtml = '';
      if (col.unitOptions && col.unitOptions.length > 1) {
        const activeUnit = this.state.units[col.id] || col.unit;
        unitSelectorHtml = `
          <select class="th-unit-select" data-col="${col.id}">
            ${col.unitOptions.map(u => `<option value="${u}" ${u === activeUnit ? 'selected' : ''}>${u}</option>`).join('')}
          </select>
        `;
      } else if (col.unit) {
        unitSelectorHtml = `<span class="th-unit-badge">${col.unit}</span>`;
      }

      th.innerHTML = `
        <div class="th-content">
          <span class="th-title">${col.label}</span>
          ${unitSelectorHtml}
        </div>
      `;

      const select = th.querySelector('.th-unit-select');
      if (select) {
        select.addEventListener('change', (e) => {
          this.state.units[col.id] = e.target.value;
          this.recalculateAndRender();
        });
      }

      this.tableHeaderEl.appendChild(th);
    });

    const thAction = document.createElement('th');
    thAction.style.width = '48px';
    thAction.style.textAlign = 'center';
    thAction.innerHTML = '<i class="fas fa-trash-alt text-slate-500"></i>';
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
      this.resultsGridEl.innerHTML = '<div style="color:var(--text-muted); font-size:12px;">Enter readings to compute physics metrics.</div>';
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

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        this.addRowBtn.click();
      }
    });
  }

  openPasteModal() {
    if (!this.pasteModal) return;
    this.pasteModal.classList.add('active');
    const textarea = document.getElementById('paste-textarea');
    if (textarea) {
      textarea.value = '';
      textarea.focus();
    }

    const confirmBtn = document.getElementById('btn-confirm-paste');
    const cancelBtn = document.getElementById('btn-cancel-paste');

    const handleConfirm = () => {
      const text = textarea ? textarea.value : '';
      const parsed = ExportEngine.parseClipboardData(text, this.currentExp);
      if (parsed.length > 0) {
        this.state.rows = parsed;
        this.renderTableBody();
        this.recalculateAndRender();
        this.pasteModal.classList.remove('active');
      } else {
        alert('Could not detect observation data. Please ensure numbers match the input columns.');
      }
      cleanup();
    };

    const handleCancel = () => {
      this.pasteModal.classList.remove('active');
      cleanup();
    };

    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
  }

  openReportModal() {
    if (!this.reportModal) {
      this.triggerReportGeneration({});
      return;
    }

    this.reportModal.classList.add('active');
    const confirmBtn = document.getElementById('btn-confirm-report');
    const cancelBtn = document.getElementById('btn-cancel-report');

    const handleConfirm = () => {
      const studentName = document.getElementById('report-student-name').value || 'Student Name';
      const regNo = document.getElementById('report-reg-no').value || '24BCE1001';
      const labSlot = document.getElementById('report-lab-slot').value || 'L25+L26';
      const classNo = document.getElementById('report-class-no').value || 'CHAMP-01';

      this.reportModal.classList.remove('active');
      this.triggerReportGeneration({ studentName, regNo, labSlot, classNo });
      cleanup();
    };

    const handleCancel = () => {
      this.reportModal.classList.remove('active');
      cleanup();
    };

    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
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
