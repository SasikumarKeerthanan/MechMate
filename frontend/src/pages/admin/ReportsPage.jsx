import React, { useEffect, useState } from 'react';
import { reportsApi } from '../../api/services';
import './AdminPages.css';

const MOCK_REPORT = {
  period: 'September 2026',
  newUsers: 128,
  newProviders: 11,
  completedBookings: 340,
  cancelledBookings: 22,
  totalRevenue: 'LKR 1,870,000',
  avgRating: '4.3 / 5.0',
};

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi
      .getSummary()
      .then(({ data }) => setReport(data.report ?? MOCK_REPORT))
      .catch(() => setReport(MOCK_REPORT))
      .finally(() => setLoading(false));
  }, []);

  const rows = report
    ? [
        ['Period',               report.period],
        ['New Users',            report.newUsers],
        ['New Providers',        report.newProviders],
        ['Completed Bookings',   report.completedBookings],
        ['Cancelled Bookings',   report.cancelledBookings],
        ['Total Revenue',        report.totalRevenue],
        ['Avg. Provider Rating', report.avgRating],
      ]
    : [];

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2 className="page-heading">Reports</h2>
        <p className="page-desc">Summary metrics and analytics for the current period.</p>
      </div>

      <div className="table-card" id="reports-summary" style={{ maxWidth: 640 }}>
        {loading ? (
          <div className="loading-row">Loading report…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([metric, value]) => (
                <tr key={metric}>
                  <td className="fw-medium">{metric}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="coming-soon-card" id="charts-placeholder" style={{ marginTop: 24 }}>
        <span className="coming-soon-icon">📈</span>
        <h3>Charts & Visualizations</h3>
        <p>Interactive charts (Recharts / Chart.js) will be integrated here in the next sprint.</p>
      </div>
    </div>
  );
}
