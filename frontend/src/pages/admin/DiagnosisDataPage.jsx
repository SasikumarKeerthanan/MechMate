import React, { useEffect, useState, useMemo } from 'react';
import { diagnosisApi, categoriesApi } from '../../api/services';
import './AdminPages.css';

const SEVERITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

const DEFAULT_CATEGORIES = [
  'Engine Components',
  'Brakes & Hydraulics',
  'Suspension & Steering',
  'Electrical & Sensors',
  'Transmission & Clutch',
  'Cooling & Air Conditioning',
  'Exhaust & Emission',
];

export default function DiagnosisDataPage() {
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'history'
  const [rules, setRules] = useState([]);
  const [history, setHistory] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals state
  const [ruleModal, setRuleModal] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    data: {
      id: null,
      symptom: '',
      possible_fault: '',
      cause: '',
      solution: '',
      severity: 'Medium',
      category: 'Engine Components',
    },
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    rule: null,
  });

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [rulesRes, historyRes, partsRes] = await Promise.all([
        diagnosisApi.getAll(),
        diagnosisApi.getHistory(),
        categoriesApi.getParts().catch(() => null),
      ]);

      if (rulesRes.data?.entries) setRules(rulesRes.data.entries);
      if (historyRes.data?.history) setHistory(historyRes.data.history);
      if (partsRes?.data?.categories) {
        setCategories(partsRes.data.categories.map((c) => c.name));
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      const matchesSeverity = severityFilter === 'all' || r.severity?.toLowerCase() === severityFilter.toLowerCase();
      const matchesCategory = categoryFilter === 'all' || r.category?.toLowerCase() === categoryFilter.toLowerCase();

      if (!matchesSeverity || !matchesCategory) return false;

      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        r.symptom?.toLowerCase().includes(term) ||
        r.possible_fault?.toLowerCase().includes(term) ||
        r.cause?.toLowerCase().includes(term) ||
        r.solution?.toLowerCase().includes(term) ||
        r.category?.toLowerCase().includes(term)
      );
    });
  }, [rules, severityFilter, categoryFilter, search]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setRuleModal({
      isOpen: true,
      mode: 'create',
      data: {
        id: null,
        symptom: '',
        possible_fault: '',
        cause: '',
        solution: '',
        severity: 'Medium',
        category: categories[0] || 'Engine Components',
      },
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (rule) => {
    setRuleModal({
      isOpen: true,
      mode: 'edit',
      data: {
        id: rule.id,
        symptom: rule.symptom || '',
        possible_fault: rule.possible_fault || '',
        cause: rule.cause || '',
        solution: rule.solution || '',
        severity: rule.severity || 'Medium',
        category: rule.category || categories[0] || 'Engine Components',
      },
    });
  };

  // Submit Rule Form
  const handleSubmitRule = async (e) => {
    e.preventDefault();
    const { mode, data } = ruleModal;

    if (!data.symptom.trim() || !data.possible_fault.trim()) return;

    try {
      if (mode === 'create') {
        const res = await diagnosisApi.create(data);
        const newEntry = res.data?.entry || { ...data, id: Date.now() };
        setRules((prev) => [...prev, newEntry]);
        showToast('Diagnosis mapping rule created successfully.', 'success');
      } else {
        const res = await diagnosisApi.update(data.id, data);
        const updated = res.data?.entry || data;
        setRules((prev) => prev.map((r) => (r.id === data.id ? updated : r)));
        showToast('Diagnosis mapping rule updated.', 'success');
      }
    } catch {
      showToast('Error saving diagnosis entry.', 'danger');
    } finally {
      setRuleModal({ isOpen: false, mode: 'create', data: {} });
    }
  };

  // Delete Rule Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteModal.rule) return;
    const { id } = deleteModal.rule;

    try {
      await diagnosisApi.delete(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
      showToast('Diagnosis mapping rule removed.', 'info');
    } catch {
      showToast('Error deleting rule.', 'danger');
    } finally {
      setDeleteModal({ isOpen: false, rule: null });
    }
  };

  return (
    <div className="admin-page">
      {/* ── Toast Alert ── */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast--${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : toast.type === 'danger' ? '✕' : 'ℹ'}</span>
            <span>{toast.message}</span>
            <button className="toast-close-btn" onClick={() => setToast(null)}>×</button>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="page-header">
        <h2 className="page-heading">Diagnosis Reference Data & History</h2>
        <p className="page-desc">
          Manage symptoms, possible vehicle faults, root causes, solutions, severity mappings, and inspect live customer diagnosis search queries.
        </p>
      </div>

      {/* ── Tabbed View: Reference Rules vs Search Logs ── */}
      <div className="tabs-nav" id="diagnosis-tabs-nav">
        <button
          id="tab-diagnosis-rules"
          className={`tab-btn ${activeTab === 'rules' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          <span>🧠 Diagnosis Reference Rules</span>
          <span className="tab-count">{rules.length}</span>
        </button>

        <button
          id="tab-diagnosis-history"
          className={`tab-btn ${activeTab === 'history' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span>🔍 Customer Search Queries & History</span>
          <span className="tab-count">{history.length}</span>
        </button>
      </div>

      {/* ── Content View 1: Reference Rules ── */}
      {activeTab === 'rules' ? (
        <div id="diagnosis-rules-view">
          {/* Filters Toolbar */}
          <div className="table-toolbar" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                id="rules-search-input"
                type="search"
                className="search-input"
                placeholder="Search symptom, fault, cause…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '260px' }}
              />

              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Severity:</span>
              <select
                id="severity-filter-select"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155',
                  background: '#fff',
                }}
              >
                <option value="all">All Severities</option>
                {SEVERITY_OPTIONS.map((sev) => (
                  <option key={sev} value={sev}>{sev}</option>
                ))}
              </select>

              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Category:</span>
              <select
                id="category-filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155',
                  background: '#fff',
                  maxWidth: '180px',
                }}
              >
                <option value="all">All Part Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              id="add-rule-btn"
              className="action-btn action-btn--primary"
              onClick={handleOpenCreate}
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>＋</span>
              <span>Add Diagnosis Entry</span>
            </button>
          </div>

          {/* Rules Data Table */}
          <div className="table-card" id="rules-table">
            {loading ? (
              <div className="loading-row">Loading diagnosis reference data…</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th style={{ width: '18%' }}>Reported Symptom</th>
                    <th style={{ width: '16%' }}>Possible Fault</th>
                    <th style={{ width: '18%' }}>Underlying Cause</th>
                    <th style={{ width: '22%' }}>Recommended Solution</th>
                    <th>Severity</th>
                    <th>Part Category</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((rule) => {
                    const sevClass = `badge--severity-${rule.severity?.toLowerCase()}`;

                    return (
                      <tr key={rule.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>
                          #{rule.id}
                        </td>
                        <td>
                          <div className="fw-medium" style={{ color: '#0f172a' }}>
                            {rule.symptom}
                          </div>
                        </td>
                        <td>
                          <div style={{ color: '#b45309', fontWeight: 600 }}>
                            {rule.possible_fault}
                          </div>
                        </td>
                        <td className="text-muted" style={{ fontSize: '0.82rem' }}>
                          {rule.cause}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#334155' }}>
                          {rule.solution}
                        </td>
                        <td>
                          <span className={`badge ${sevClass}`}>
                            {rule.severity}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge--role">
                            {rule.category}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="action-cell" style={{ justifyContent: 'flex-end' }}>
                            <button
                              id={`edit-rule-${rule.id}`}
                              className="action-btn btn-inspect"
                              onClick={() => handleOpenEdit(rule)}
                            >
                              ✏️
                            </button>
                            <button
                              id={`delete-rule-${rule.id}`}
                              className="action-btn action-btn--danger"
                              onClick={() => setDeleteModal({ isOpen: true, rule })}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredRules.length === 0 && (
                    <tr>
                      <td colSpan={8} className="empty-row">
                        No diagnosis reference entries matched your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* ── Content View 2: Search Logs / Customer History ── */
        <div id="diagnosis-history-view">
          <div className="table-card">
            {loading ? (
              <div className="loading-row">Loading customer diagnosis search logs…</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th># ID</th>
                    <th>Customer Search Query</th>
                    <th>User & Vehicle Profile</th>
                    <th>Identified Fault</th>
                    <th>Severity Match</th>
                    <th>AI Engine Status</th>
                    <th>Searched At</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((log) => {
                    const sevClass = `badge--severity-${log.severity?.toLowerCase()}`;

                    return (
                      <tr key={log.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>
                          #{log.id}
                        </td>
                        <td>
                          <div className="fw-medium" style={{ color: '#0f172a' }}>
                            "{log.query}"
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                            {log.user}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            🚗 {log.vehicle}
                          </div>
                        </td>
                        <td>
                          <div style={{ color: '#92400e', fontWeight: 600, fontSize: '0.85rem' }}>
                            {log.detected_fault}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${sevClass}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              log.status?.includes('Gemini')
                                ? 'badge--ai-completed'
                                : 'badge--ai-matched'
                            }
                          >
                            ⚡ {log.status}
                          </span>
                        </td>
                        <td className="text-muted" style={{ fontSize: '0.8rem' }}>
                          {log.created_at}
                        </td>
                      </tr>
                    );
                  })}

                  {history.length === 0 && (
                    <tr>
                      <td colSpan={7} className="empty-row">
                        No customer diagnosis queries recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Add / Edit Diagnosis Entry Modal ── */}
      {ruleModal.isOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setRuleModal({ isOpen: false, mode: 'create', data: {} })}
        >
          <div className="modal-dialog modal-dialog--wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {ruleModal.mode === 'create' ? 'Add' : 'Edit'} Diagnosis Reference Mapping
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setRuleModal({ isOpen: false, mode: 'create', data: {} })}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRule}>
              <div className="modal-body">
                {/* Symptom */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="rule-symptom-input">Reported Symptom *</label>
                  <input
                    id="rule-symptom-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Grinding noise when braking, Engine temperature rising at idle"
                    value={ruleModal.data.symptom}
                    onChange={(e) =>
                      setRuleModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, symptom: e.target.value },
                      }))
                    }
                    required
                  />
                </div>

                {/* Possible Fault */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="rule-fault-input">Possible Fault *</label>
                  <input
                    id="rule-fault-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Worn brake friction pads, Blown head gasket, Failing alternator"
                    value={ruleModal.data.possible_fault}
                    onChange={(e) =>
                      setRuleModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, possible_fault: e.target.value },
                      }))
                    }
                    required
                  />
                </div>

                {/* Root Cause */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="rule-cause-input">Underlying Root Cause</label>
                  <textarea
                    id="rule-cause-input"
                    className="form-textarea"
                    placeholder="Technical root cause explaining why this symptom occurs…"
                    value={ruleModal.data.cause}
                    onChange={(e) =>
                      setRuleModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, cause: e.target.value },
                      }))
                    }
                    required
                  />
                </div>

                {/* Solution */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="rule-solution-input">Recommended Solution & Remedy</label>
                  <textarea
                    id="rule-solution-input"
                    className="form-textarea"
                    placeholder="Actionable repair steps, component replacement, or diagnostic procedures…"
                    value={ruleModal.data.solution}
                    onChange={(e) =>
                      setRuleModal((prev) => ({
                        ...prev,
                        data: { ...prev.data, solution: e.target.value },
                      }))
                    }
                    required
                  />
                </div>

                {/* Severity & Linked Part Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-field-group">
                    <label className="form-label" htmlFor="rule-severity-select">Severity Level *</label>
                    <select
                      id="rule-severity-select"
                      className="form-select"
                      value={ruleModal.data.severity}
                      onChange={(e) =>
                        setRuleModal((prev) => ({
                          ...prev,
                          data: { ...prev.data, severity: e.target.value },
                        }))
                      }
                    >
                      {SEVERITY_OPTIONS.map((sev) => (
                        <option key={sev} value={sev}>{sev}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label className="form-label" htmlFor="rule-category-select">Associated Spare-Part Category *</label>
                    <select
                      id="rule-category-select"
                      className="form-select"
                      value={ruleModal.data.category}
                      onChange={(e) =>
                        setRuleModal((prev) => ({
                          ...prev,
                          data: { ...prev.data, category: e.target.value },
                        }))
                      }
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="action-btn btn-inspect"
                  onClick={() => setRuleModal({ isOpen: false, mode: 'create', data: {} })}
                >
                  Cancel
                </button>
                <button
                  id="submit-rule-btn"
                  type="submit"
                  className="action-btn action-btn--primary"
                >
                  {ruleModal.mode === 'create' ? 'Create Diagnosis Rule' : 'Save Rule Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteModal.isOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setDeleteModal({ isOpen: false, rule: null })}
        >
          <div className="modal-dialog" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-box">
                <div className="confirm-icon-circle confirm-icon-circle--danger">
                  🗑️
                </div>
                <h3>Delete Diagnosis Rule?</h3>
                <p>
                  Are you sure you want to remove rule #{deleteModal.rule?.id} for symptom{' '}
                  <strong>'{deleteModal.rule?.symptom}'</strong>?
                </p>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button
                className="action-btn btn-inspect"
                onClick={() => setDeleteModal({ isOpen: false, rule: null })}
              >
                Cancel
              </button>
              <button
                id="confirm-delete-rule-btn"
                className="action-btn action-btn--danger"
                onClick={handleDeleteConfirm}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
