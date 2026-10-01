import React, { useState, useEffect } from 'react';
import { garageApi } from '../../api/services';
import './GaragePages.css';

const PRESET_CITIES = [
  { name: 'Colombo (Nugegoda)',      lat: 6.8724, lng: 79.8886 },
  { name: 'Kandy (Peradeniya Rd)',  lat: 7.2906, lng: 80.6337 },
  { name: 'Galle (Wakwella Rd)',    lat: 6.0535, lng: 80.2210 },
  { name: 'Gampaha (Negombo Rd)',   lat: 7.0840, lng: 79.9939 },
  { name: 'Kurunegala',             lat: 7.4863, lng: 80.3623 },
];

export default function GarageProfile() {
  const [profile, setProfile] = useState({
    business_name: '',
    owner_name: '',
    phone: '',
    email: '',
    city: 'Colombo',
    address: '',
    working_hours: '',
    business_type: 'Full-Service Auto Care & Hybrid Specialist',
    description: '',
    specialty: '',
    license_number: '',
    tax_id: '',
    logo_url: '',
    location: { lat: 6.8724, lng: 79.8886 },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    garageApi.getProfile()
      .then(({ data }) => {
        if (data.success && data.profile) {
          setProfile((prev) => ({
            ...prev,
            ...data.profile,
            location: data.profile.location || { lat: 6.8724, lng: 79.8886 },
          }));
        }
      })
      .catch((err) => console.error('Failed to load garage profile:', err))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleCoordChange = (axis, val) => {
    setProfile((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [axis]: parseFloat(val) || 0,
      },
    }));
  };

  const handlePresetLocation = (preset) => {
    setProfile((prev) => ({
      ...prev,
      city: preset.name.split(' ')[0],
      location: { lat: preset.lat, lng: preset.lng },
    }));
    showToast(`Coordinates updated to ${preset.name}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await garageApi.updateProfile(profile);
      if (data.success) {
        showToast('Service Centre profile and location updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update garage profile:', err);
      showToast('Error updating profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="garage-page">
        <div className="garage-page-header">
          <div className="garage-page-title-box">
            <h1>Service Centre Business Profile</h1>
            <p>Loading workshop credentials and operations info...</p>
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
          <h1>Service Centre Business Profile</h1>
          <p>Maintain your verified workshop identity, operating hours, geolocation, and diagnostic services description.</p>
        </div>
        <div className="garage-page-actions">
          <button
            type="button"
            className="garage-btn garage-btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* ── Brand Logo / Cover ── */}
        <div className="garage-card">
          <div className="garage-card-head">
            <h3>🖼️ Service Centre Branding & Logo</h3>
          </div>
          <div className="garage-card-body">
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: '#f1f5f9',
                  border: '2px dashed #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                {profile.logo_url ? (
                  <img
                    src={profile.logo_url}
                    alt="Garage Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '2.5rem' }}>🔧</span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: '260px' }}>
                <div className="garage-form-group">
                  <label className="garage-form-label">Workshop Logo / Cover Image URL</label>
                  <input
                    type="url"
                    className="garage-form-input"
                    value={profile.logo_url || ''}
                    placeholder="https://images.unsplash.com/..."
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Square PNG or JPG image recommended for workshop card displays.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Business Details ── */}
        <div className="garage-card">
          <div className="garage-card-head">
            <h3>🏢 Operations & Facility Details</h3>
          </div>
          <div className="garage-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="garage-form-group">
                <label className="garage-form-label">Service Centre / Garage Name *</label>
                <input
                  type="text"
                  className="garage-form-input"
                  value={profile.business_name || ''}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  required
                />
              </div>

              <div className="garage-form-group">
                <label className="garage-form-label">Proprietor / Chief Engineer Full Name</label>
                <input
                  type="text"
                  className="garage-form-input"
                  value={profile.owner_name || ''}
                  onChange={(e) => handleInputChange('owner_name', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="garage-form-group">
                <label className="garage-form-label">Business Type *</label>
                <select
                  className="garage-form-select"
                  value={profile.business_type || 'Full-Service Auto Care & Hybrid Specialist'}
                  onChange={(e) => handleInputChange('business_type', e.target.value)}
                >
                  <option value="Full-Service Auto Care & Hybrid Specialist">Full-Service Auto Care & Hybrid Specialist</option>
                  <option value="Authorized Dealership Service Centre">Authorized Dealership Service Centre</option>
                  <option value="Independent General Repair Garage">Independent General Repair Garage</option>
                  <option value="Body Repair, Tinkering & Paint Centre">Body Repair, Tinkering & Paint Centre</option>
                  <option value="Auto AC & Electrical Specialist">Auto AC & Electrical Specialist</option>
                  <option value="Tire, Suspension & Wheel Alignment Centre">Tire, Suspension & Wheel Alignment Centre</option>
                </select>
              </div>

              <div className="garage-form-group">
                <label className="garage-form-label">Operating Hours *</label>
                <input
                  type="text"
                  className="garage-form-input"
                  value={profile.working_hours || ''}
                  placeholder="Mon - Sat: 8:00 AM - 6:30 PM"
                  onChange={(e) => handleInputChange('working_hours', e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="garage-form-group">
                <label className="garage-form-label">Official Hotline / Service Desk *</label>
                <input
                  type="text"
                  className="garage-form-input"
                  value={profile.phone || ''}
                  placeholder="+94 11 254 7711"
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>

              <div className="garage-form-group">
                <label className="garage-form-label">Public Business Email</label>
                <input
                  type="email"
                  className="garage-form-input"
                  value={profile.email || ''}
                  placeholder="service@precisiontune.lk"
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            <div className="garage-form-group">
              <label className="garage-form-label">Key Specialties & Diagnostics</label>
              <input
                type="text"
                className="garage-form-input"
                value={profile.specialty || ''}
                placeholder="e.g. Periodic Lubrication, Wheel Alignment, AC Service, Dual-Clutch Hybrid Maintenance"
                onChange={(e) => handleInputChange('specialty', e.target.value)}
              />
            </div>

            <div className="garage-form-group">
              <label className="garage-form-label">Facility & Engineering Description</label>
              <textarea
                className="garage-form-textarea"
                rows="3"
                value={profile.description || ''}
                placeholder="Describe workshop equipment, diagnostic scanners, waiting lounge amenities, emergency towing, etc."
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Location & GPS Coordinates ── */}
        <div className="garage-card">
          <div className="garage-card-head">
            <h3>📍 Workshop Geolocation & Street Address</h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Allows drivers in need of repairs to navigate directly to your bays
            </span>
          </div>
          <div className="garage-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="garage-form-group">
                <label className="garage-form-label">City / Region *</label>
                <input
                  type="text"
                  className="garage-form-input"
                  value={profile.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>

              <div className="garage-form-group">
                <label className="garage-form-label">Physical Workshop Address *</label>
                <input
                  type="text"
                  className="garage-form-input"
                  value={profile.address || ''}
                  placeholder="500 High Level Road, Nugegoda"
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="garage-form-label" style={{ display: 'block', marginBottom: '8px' }}>
                Preset Service Centre Hubs:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {PRESET_CITIES.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className="garage-btn garage-btn-secondary garage-btn-sm"
                    onClick={() => handlePresetLocation(c)}
                  >
                    📍 {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* GPS coordinates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="garage-form-group">
                <label className="garage-form-label">Latitude (GPS)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="garage-form-input"
                  value={profile.location?.lat ?? 6.8724}
                  onChange={(e) => handleCoordChange('lat', e.target.value)}
                />
              </div>

              <div className="garage-form-group">
                <label className="garage-form-label">Longitude (GPS)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="garage-form-input"
                  value={profile.location?.lng ?? 79.8886}
                  onChange={(e) => handleCoordChange('lng', e.target.value)}
                />
              </div>
            </div>

            {/* Interactive Location Widget */}
            <div
              style={{
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: 'linear-gradient(135deg, #0b1120 0%, #162032 100%)',
                color: 'white',
                padding: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🗺️</span>
                  <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>Workshop GPS Coordinate Pin</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Lat: <strong>{profile.location?.lat}</strong>, Lng: <strong>{profile.location?.lng}</strong> ({profile.city || 'Colombo'})
                </div>
                <div style={{ fontSize: '0.78rem', color: '#14b8a6', marginTop: '6px' }}>
                  ✓ Direct turn-by-turn navigation enabled for customer app users
                </div>
              </div>

              <a
                href={`https://www.google.com/maps?q=${profile.location?.lat},${profile.location?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="garage-btn garage-btn-primary garage-btn-sm"
                style={{ textDecoration: 'none' }}
              >
                Open in Google Maps ↗
              </a>
            </div>
          </div>
        </div>

        {/* ── Business Registration ── */}
        <div className="garage-card">
          <div className="garage-card-head">
            <h3>📑 Compliance & Business Registration</h3>
          </div>
          <div className="garage-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="garage-form-group">
                <label className="garage-form-label">Business Registration Number (BRN)</label>
                <input
                  type="text"
                  className="garage-form-input"
                  value={profile.license_number || ''}
                  placeholder="BR-PV-2020-1129"
                  onChange={(e) => handleInputChange('license_number', e.target.value)}
                />
              </div>

              <div className="garage-form-group">
                <label className="garage-form-label">Taxpayer Identification Number (TIN)</label>
                <input
                  type="text"
                  className="garage-form-input"
                  value={profile.tax_id || ''}
                  placeholder="TIN-33910294"
                  onChange={(e) => handleInputChange('tax_id', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '20px' }}>
          <button
            type="submit"
            className="garage-btn garage-btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
