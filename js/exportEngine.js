/**
 * BAPHY105 Engineering Physics Lab Calculator - Export & Laboratory Report Engine
 * Generates formal printable PDF reports tailored to the BAPHY105 CHAMP Lab Manual.
 */

export class ExportEngine {
  static exportToCSV(experiment, tableRows) {
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
  }

  static parseClipboardData(text, experiment) {
    if (!text || typeof text !== 'string') return [];
    const lines = text.trim().split(/\r\n|\n|\r/);
    const inputCols = experiment.columns.filter(c => c.type === 'input');
    const parsedRows = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;
      const delimiter = line.includes('\t') ? '\t' : ',';
      const parts = line.split(delimiter).map(s => s.trim().replace(/^"|"$/g, ''));
      if (i === 0 && parts.every(p => isNaN(parseFloat(p)))) continue;

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
  }

  static generateLabReport(experiment, tableRows, calculationResults, graphImageUrl, meta = {}) {
    const studentName = meta.studentName || 'Student Name';
    const regNo = meta.regNo || '24BCE1001';
    const labSlot = meta.labSlot || 'L25+L26';
    const classNo = meta.classNo || 'CHAMP-01';
    const faculty = meta.faculty || 'Faculty In-Charge';
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
}
