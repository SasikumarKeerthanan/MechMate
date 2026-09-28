import React from 'react';
import './AdminPages.css';

export default function DiagnosisDataPage() {
  return (
    <div className="admin-page">
      <div className="page-header">
        <h2 className="page-heading">Diagnosis Data</h2>
        <p className="page-desc">
          Manage vehicle diagnosis categories and AI prompt templates used by providers.
        </p>
      </div>
      <div className="coming-soon-card" id="diagnosis-data-placeholder">
        <span className="coming-soon-icon">🩺</span>
        <h3>Diagnosis Data Manager</h3>
        <p>
          This section will allow administrators to manage symptom categories,
          AI prompt templates, and diagnostic decision trees. Implementation
          coming in the next sprint.
        </p>
      </div>
    </div>
  );
}
