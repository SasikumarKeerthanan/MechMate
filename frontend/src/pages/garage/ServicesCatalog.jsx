import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { garageApi, categoriesApi } from '../../api/services';
import './GaragePages.css';

const DEFAULT_SERVICE_CATEGORIES = [
  'All Categories',
  'Periodic Lubrication & Oil Change',
  'Wheel Alignment & Balancing',
  'Transmission Fluid Flush & Repair',
  'AC Gas Recharge & Leak Repair',
  'Computer Diagnostic Scanning',
  'Brake System Overhaul',
  'Engine Tune-up & Overhaul',
  'Hybrid Battery Conditioning',
  'Suspension & Shock Replacement',
  'Electrical & Battery Diagnostics',
];

const AVAILABLE_VEHICLE_TYPES = ['Car', 'SUV', 'Van', 'Motorbike', 'Three-Wheeler', 'Heavy-Duty'];

const DEFAULT_SERVICE_FORM = {
  name: '',
  category: 'Periodic Lubrication & Oil Change',
  estimated_price: '',
  estimated_duration: '1.5 hrs',
  supported_vehicle_types: ['Car', 'SUV'],
  availability: 'available',
  description: '',
};

export default function ServicesCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categoriesList, setCategoriesList] = useState(DEFAULT_SERVICE_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedAvailability, setSelectedAvailability] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_SERVICE_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog
  const [deletingService, setDeletingService] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchServices = () => {
    setLoading(true);
    garageApi.getServices()
      .then(({ data }) => {
        if (data.success && Array.isArray(data.services)) {
          setServices(data.services);
        }
      })
      .catch((err) => {
        console.error('Failed to load services:', err);
        showToast('Error loading services catalog.', 'error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
    // Dynamically fetch garage service categories managed by Admin
    categoriesApi.getServices()
      .then(({ data }) => {
        if (data.success && Array.isArray(data.categories)) {
          const names = data.categories.map((c) => c.name).filter(Boolean);
          if (names.length > 0) {
            const unique = Array.from(new Set(['All Categories', ...names, ...DEFAULT_SERVICE_CATEGORIES.slice(1)]));
            setCategoriesList(unique);
          }
        }
      })
      .catch((err) => console.warn('Using default service categories:', err));
  }, []);

  // Check URL query action=add
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      openAddModal();
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const nameMatch = (srv.name || '').toLowerCase().includes(query);
        const descMatch = (srv.description || '').toLowerCase().includes(query);
        if (!nameMatch && !descMatch) return false;
      }

      if (selectedCategory !== 'All Categories' && srv.category !== selectedCategory) {
        return false;
      }

      if (selectedAvailability !== 'all' && srv.availability !== selectedAvailability) {
        return false;
      }

      return true;
    });
  }, [services, searchTerm, selectedCategory, selectedAvailability]);

  const openAddModal = () => {
    setEditingService(null);
    setFormData(DEFAULT_SERVICE_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (srv) => {
    setEditingService(srv);
    setFormData({
      name: srv.name || '',
      category: srv.category || 'Periodic Lubrication & Oil Change',
      estimated_price: srv.estimated_price || '',
      estimated_duration: srv.estimated_duration || '1.5 hrs',
      supported_vehicle_types: Array.isArray(srv.supported_vehicle_types)
        ? srv.supported_vehicle_types
        : ['Car', 'SUV'],
      availability: srv.availability || 'available',
      description: srv.description || '',
    });
    setIsModalOpen(true);
  };

  const handleVehicleTypeToggle = (type) => {
    const current = formData.supported_vehicle_types || [];
    if (current.includes(type)) {
      if (current.length === 1) return;
      setFormData({ ...formData, supported_vehicle_types: current.filter((t) => t !== type) });
    } else {
      setFormData({ ...formData, supported_vehicle_types: [...current, type] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: formData.name,
      category: formData.category,
      estimated_price: parseFloat(formData.estimated_price) || 0,
      estimated_duration: formData.estimated_duration,
      supported_vehicle_types: formData.supported_vehicle_types,
      availability: formData.availability,
      description: formData.description,
    };

    try {
      if (editingService) {
        await garageApi.updateService(editingService.id, payload);
        showToast(`Service "${payload.name}" updated successfully.`);
      } else {
        await garageApi.addService(payload);
        showToast(`Service "${payload.name}" added to catalog.`);
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error('Failed to save service:', err);
      showToast('Error saving service package.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingService) return;
    try {
      await garageApi.deleteService(deletingService.id);
      showToast(`Service "${deletingService.name}" removed from catalog.`);
      setServices((prev) => prev.filter((s) => s.id !== deletingService.id));
      setDeletingService(null);
    } catch (err) {
      console.error('Failed to delete service:', err);
      showToast('Error removing service.', 'error');
    }
  };

  return (
    <div className="garage-page">
      {/* Toast Alert */}
      {toast && (
        <div className={`garage-toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="garage-page-header">
        <div className="garage-page-title-box">
          <h1>Service Packages & Maintenance Catalog</h1>
          <p>Define workshop repair packages, labour estimates, turnaround durations, and vehicle compatibility.</p>
        </div>
        <div className="garage-page-actions">
          <button className="garage-btn garage-btn-primary" onClick={openAddModal}>
            + Add New Service Package
          </button>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="garage-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <input
              type="text"
              className="garage-form-input"
              style={{ minWidth: '260px' }}
              placeholder="🔍 Search service name, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="garage-form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categoriesList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              className="garage-form-select"
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
            >
              <option value="all">All Availability Statuses</option>
              <option value="available">Available (Immediate Booking)</option>
              <option value="booking_only">Prior Appointment Only</option>
              <option value="temporarily_unavailable">Temporarily Suspended</option>
            </select>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <strong>{filteredServices.length}</strong> of {services.length} services
          </div>
        </div>
      </div>

      {/* ── Services Table ── */}
      <div className="garage-card">
        <div className="garage-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Loading repair and maintenance catalog...
            </div>
          ) : filteredServices.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔧</div>
              <strong style={{ fontSize: '1.1rem', color: '#1e293b', display: 'block' }}>No service packages found</strong>
              <span style={{ fontSize: '0.85rem' }}>Create your first service package to attract vehicle owner bookings.</span>
            </div>
          ) : (
            <div className="garage-table-wrapper">
              <table className="garage-table">
                <thead>
                  <tr>
                    <th>Service Package</th>
                    <th>Category</th>
                    <th>Supported Vehicles</th>
                    <th>Estimated Duration</th>
                    <th>Est. Price (LKR)</th>
                    <th>Availability</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredServices.map((srv) => (
                    <tr key={srv.id}>
                      {/* Name & Desc */}
                      <td>
                        <div>
                          <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>{srv.name}</strong>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '320px', whiteSpace: 'normal', marginTop: '2px' }}>
                            {srv.description || 'Standard multi-point inspection and workshop service.'}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{srv.category}</span>
                      </td>

                      {/* Supported Vehicles */}
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxWidth: '180px' }}>
                          {Array.isArray(srv.supported_vehicle_types) && srv.supported_vehicle_types.length > 0 ? (
                            srv.supported_vehicle_types.map((v) => (
                              <span key={v} className="vehicle-tag-pill">
                                {v}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>All Vehicles</span>
                          )}
                        </div>
                      </td>

                      {/* Duration */}
                      <td>
                        <span style={{ fontWeight: 600, color: '#334155' }}>
                          ⏱️ {srv.estimated_duration || '1 hr'}
                        </span>
                      </td>

                      {/* Price */}
                      <td>
                        <strong style={{ color: '#0f766e', fontSize: '0.95rem' }}>
                          LKR {Number(srv.estimated_price || 0).toLocaleString()}
                        </strong>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`service-status-badge ${srv.availability || 'available'}`}>
                          {srv.availability === 'booking_only' ? 'Booking Only' : srv.availability === 'temporarily_unavailable' ? 'Unavailable' : 'Available'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          className="garage-icon-action"
                          onClick={() => openEditModal(srv)}
                          title="Edit Service"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="garage-icon-action danger"
                          style={{ marginLeft: '6px' }}
                          onClick={() => setDeletingService(srv)}
                          title="Delete Service"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Service Modal ── */}
      {isModalOpen && (
        <div className="garage-modal-overlay">
          <div className="garage-modal-box">
            <div className="garage-modal-head">
              <h3>{editingService ? '✏️ Edit Service Package' : '➕ Add New Service Package'}</h3>
              <button
                className="garage-modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="garage-modal-body">
                <div className="garage-form-group">
                  <label className="garage-form-label">Service Package Name *</label>
                  <input
                    type="text"
                    className="garage-form-input"
                    placeholder="e.g. 25-Point Comprehensive Hybrid Health Check & Service"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div className="garage-form-group">
                    <label className="garage-form-label">Service Category *</label>
                    <select
                      className="garage-form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      {categoriesList.filter((c) => c !== 'All Categories').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="garage-form-group">
                    <label className="garage-form-label">Availability Status</label>
                    <select
                      className="garage-form-select"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    >
                      <option value="available">Available (Instant / Walk-in)</option>
                      <option value="booking_only">Prior Appointment Only</option>
                      <option value="temporarily_unavailable">Temporarily Suspended</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div className="garage-form-group">
                    <label className="garage-form-label">Estimated Service Fee (LKR) *</label>
                    <input
                      type="number"
                      min="0"
                      className="garage-form-input"
                      placeholder="16500"
                      value={formData.estimated_price}
                      onChange={(e) => setFormData({ ...formData, estimated_price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="garage-form-group">
                    <label className="garage-form-label">Estimated Turnaround Duration *</label>
                    <input
                      type="text"
                      className="garage-form-input"
                      placeholder="e.g. 1.5 hrs, 45 mins, 1 Day"
                      value={formData.estimated_duration}
                      onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Supported Vehicle Types Multi-select */}
                <div className="garage-form-group">
                  <label className="garage-form-label">Supported Vehicle Classes</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {AVAILABLE_VEHICLE_TYPES.map((type) => {
                      const isChecked = (formData.supported_vehicle_types || []).includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          className={`garage-btn ${isChecked ? 'garage-btn-primary' : 'garage-btn-secondary'} garage-btn-sm`}
                          onClick={() => handleVehicleTypeToggle(type)}
                        >
                          {isChecked ? '✓ ' : '+ '} {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="garage-form-group">
                  <label className="garage-form-label">Detailed Service Description & Included Inclusions</label>
                  <textarea
                    className="garage-form-textarea"
                    rows="4"
                    placeholder="List all steps included (e.g. synthetic oil replacement, multi-point electronic health scan, suspension torque check, car wash)..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="garage-modal-foot">
                <button
                  type="button"
                  className="garage-btn garage-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="garage-btn garage-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingService ? 'Update Service Package' : 'Save to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {deletingService && (
        <div className="garage-modal-overlay">
          <div className="garage-modal-box" style={{ maxWidth: '440px' }}>
            <div className="garage-modal-head">
              <h3 style={{ color: '#dc2626' }}>🗑️ Delete Service Package</h3>
              <button
                className="garage-modal-close-btn"
                onClick={() => setDeletingService(null)}
              >
                &times;
              </button>
            </div>
            <div className="garage-modal-body">
              <p style={{ margin: 0, color: '#334155' }}>
                Are you sure you want to remove <strong>"{deletingService.name}"</strong>?
              </p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                Vehicle owners will no longer be able to select or request quotes for this service package.
              </p>
            </div>
            <div className="garage-modal-foot">
              <button
                className="garage-btn garage-btn-secondary"
                onClick={() => setDeletingService(null)}
              >
                Cancel
              </button>
              <button
                className="garage-btn garage-btn-danger"
                onClick={confirmDelete}
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
