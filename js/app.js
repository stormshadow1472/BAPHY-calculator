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
        { id: 1, name: 'Preparatory Tools', sub: 'Tools I to IV', themeClass: 'cat-cyan' },
        { id: 2, name: 'CHAMP Cycle 1', sub: 'Semiconductors & Optics (Expt 1-4)', themeClass: 'cat-emerald' },
        { id: 3, name: 'CHAMP Cycle 2', sub: 'Quantum & Quantum Computing (Expt 5-8)', themeClass: 'cat-fuchsia' }
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
        groupHeader.className = `sidebar-category-header ${cat.themeClass}`;
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
            const TEXT_COLUMNS = ['ring_type', 'dimension', 'trial', 'face', 'color', 'label', 'input_state'];
            const isTextCol = col.inputType === 'text' || TEXT_COLUMNS.includes(col.id);
            input.type = isTextCol ? 'text' : 'number';
            input.className = 'cell-input';
            if (!isTextCol) input.step = 'any';
            input.value = row[col.id] !== undefined ? row[col.id] : '';
            input.placeholder = isTextCol ? (col.placeholder || (col.id === 'ring_type' ? 'Inner Ring / Outer Ring' : '—')) : '—';

            if (col.id === 'ring_type') {
              input.setAttribute('list', 'ring-type-options');
            }

            input.addEventListener('input', (e) => {
              const val = e.target.value;
              this.state.rows[rowIdx][col.id] = isTextCol ? val : (val.trim() === '' ? '' : (isNaN(Number(val)) ? val.trim() : parseFloat(val)));
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
