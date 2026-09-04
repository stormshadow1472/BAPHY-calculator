/**
 * Engineering Physics Laboratory Calculator - Storage & Persistence Engine
 * Saves experiment datasets, units, and preferences to localStorage.
 */

const STORAGE_KEY_PREFIX = 'baphy_physics_lab_';

export class StorageEngine {
  static getActiveExperimentId() {
    try {
      return localStorage.getItem(STORAGE_KEY_PREFIX + 'active_exp') || 'simple_pendulum';
    } catch (e) {
      return 'simple_pendulum';
    }
  }

  static setActiveExperimentId(id) {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'active_exp', id);
    } catch (e) {}
  }

  static getExperimentState(expId, defaultExp) {
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
    } catch (e) {
      console.warn('Storage read error:', e);
    }

    // Default factory fallback
    return {
      rows: JSON.parse(JSON.stringify(defaultExp.defaultRows)),
      globals: JSON.parse(JSON.stringify(defaultExp.globals || {})),
      units: JSON.parse(JSON.stringify(defaultExp.units || {}))
    };
  }

  static saveExperimentState(expId, state) {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + expId, JSON.stringify({
        rows: state.rows,
        globals: state.globals,
        units: state.units,
        savedAt: Date.now()
      }));
    } catch (e) {
      console.warn('Storage write error:', e);
    }
  }

  static resetExperiment(expId, defaultExp) {
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + expId);
    } catch (e) {}
    return {
      rows: JSON.parse(JSON.stringify(defaultExp.defaultRows)),
      globals: JSON.parse(JSON.stringify(defaultExp.globals || {})),
      units: JSON.parse(JSON.stringify(defaultExp.units || {}))
    };
  }
}
