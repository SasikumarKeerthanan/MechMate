import React, { useState, useEffect } from 'react';
import { garageApi } from '../../api/services';
import './GaragePages.css';

const VEHICLE_CATEGORIES = [
  {
    id: 'Car',
    name: 'Sedan & Hatchback Cars',
    description: 'Compact, executive, and family passenger cars (Toyota Prius, Axio, Honda Fit, Suzuki Wagon R)',
    icon: '🚗',
  },
  {
    id: 'SUV',
    name: 'SUVs, Crossovers & 4x4',
    description: 'All-wheel drive, off-road, and high-ground clearance vehicles (Toyota Prado, Nissan X-Trail, Vezel)',
    icon: '🚙',
  },
  {
    id: 'Van',
    name: 'Passenger & Commercial Vans',
    description: 'Light commercial and passenger vans (Toyota HiAce, KDH, Caravan, Every)',
    icon: '🚐',
  },
  {
    id: 'Motorbike',
    name: 'Motorcycles & Scooters',
    description: 'Commuter two-wheelers, scooters, and performance motorbikes (Honda, Yamaha, TVS, Bajaj)',
    icon: '🏍️',
  },
  {
    id: 'Three-Wheeler',
    name: 'Three-Wheelers (Auto Rickshaws)',
    description: 'Commercial 2-stroke and 4-stroke autorickshaws (Bajaj RE, TVS King, Piaggio)',
    icon: '🛺',
  },
  {
    id: 'Heavy-Duty',
    name: 'Heavy Commercial Trucks & Buses',
    description: 'Medium and heavy-duty logistics trucks, tippers, and passenger coaches (Isuzu, Hino, Tata, Ashok Leyland)',
    icon: '🚛',
  },
  {
    id: 'Electric-Hybrid',
    name: 'EV & High-Voltage Hybrids',
    description: 'Electric vehicles, battery conditioning, and inverter cooling maintenance (Tesla, Leaf, BYD, Prius)',
    icon: '⚡',
  },
];

export default function SupportedVehicles() {
  const [selectedTypes, setSelectedTypes] = useState(['Car', 'SUV', 'Van']);
  const [specializationNotes, setSpecializationNotes] = useState('Specialized in Japanese Hybrid & Dual-Clutch (DCT) vehicles.');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    garageApi.getVehicles()
      .then(({ data }) => {
        if (data.success && Array.isArray(data.vehicles)) {
          setSelectedTypes(data.vehicles);
        }
      })
      .catch((err) => {
        console.error('Failed to load supported vehicles:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleCategory = (id) => {
    if (selectedTypes.includes(id)) {
      if (selectedTypes.length === 1) {
        showToast('At least one vehicle category must remain selected.', 'error');
        return;
      }
      setSelectedTypes(selectedTypes.filter((t) => t !== id));
    } else {
      setSelectedTypes([...selectedTypes, id]);
    }
  };

  const handleSelectAll = () => {
    setSelectedTypes(VEHICLE_CATEGORIES.map((c) => c.id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await garageApi.updateVehicles(selectedTypes);
      if (data.success) {
        showToast('Supported vehicle types updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update vehicles:', err);
      showToast('Error saving supported vehicles.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="garage-page">
        <div className="garage-page-header">
          <div className="garage-page-title-box">
            <h1>Supported Vehicle Categories</h1>
            <p>Loading vehicle workshop specifications...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <h1>Supported Vehicle Categories</h1>
          <p>
            Configure the vehicle makes and classes your workshop bays and technicians are equipped to service.
          </p>
        </div>
        <div className="garage-page-actions">
          <button
            type="button"
            className="garage-btn garage-btn-secondary"
            onClick={handleSelectAll}
          >
            Select All Categories
          </button>
          <button
            type="button"
            className="garage-btn garage-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Vehicle Capabilities'}
          </button>
        </div>
      </div>

      {/* ── Selection Status Banner ── */}
      <div className="garage-card" style={{ padding: '16px 20px', background: '#f0fdfa', border: '1px solid #99f6e4' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>🚗</span>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#0f766e' }}>
                {selectedTypes.length} Vehicle Categories Currently Supported
              </strong>
              <div style={{ fontSize: '0.78rem', color: '#115e59' }}>
                Drivers searching for garages by vehicle type will match your workshop automatically.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {selectedTypes.map((t) => (
              <span key={t} className="vehicle-tag-pill" style={{ background: '#ffffff', borderColor: '#5eead4' }}>
                ✓ {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Multi-select Grid ── */}
      <div className="vehicle-grid">
        {VEHICLE_CATEGORIES.map((cat) => {
          const isSelected = selectedTypes.includes(cat.id);
          return (
            <div
              key={cat.id}
              className={`vehicle-card ${isSelected ? 'active' : ''}`}
              onClick={() => toggleCategory(cat.id)}
            >
              <div className="vehicle-card-info">
                <div className="vehicle-card-icon">{cat.icon}</div>
                <div className="vehicle-card-text">
                  <h4>{cat.name}</h4>
                  <p>{cat.description}</p>
                </div>
              </div>
              <div className="vehicle-card-check">
                ✓
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Brand Specialization Notes ── */}
      <div className="garage-card">
        <div className="garage-card-head">
          <h3>⭐ Brand & Diagnostic Specializations</h3>
        </div>
        <div className="garage-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="garage-form-group">
            <label className="garage-form-label">Specialist Notes & Manufacturer Tooling</label>
            <textarea
              className="garage-form-textarea"
              rows="3"
              value={specializationNotes}
              onChange={(e) => setSpecializationNotes(e.target.value)}
              placeholder="e.g. Certified Toyota Techstream diagnosis, Honda i-DCD dual-clutch transmission clutch learning, Subarau Boxer engine rebuilds, Mercedes-Benz Star Diagnosis..."
            />
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Displayed on your public workshop card to highlight certified tools, factory scanners, and specialized competencies.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="garage-btn garage-btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
