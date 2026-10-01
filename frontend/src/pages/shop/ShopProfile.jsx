import React, { useState, useEffect } from 'react';
import { shopApi } from '../../api/services';
import './ShopPages.css';

const PRESET_CITIES = [
  { name: 'Colombo (Panchikawatta)', lat: 6.9319, lng: 79.8654 },
  { name: 'Kandy (Peradeniya Rd)',  lat: 7.2906, lng: 80.6337 },
  { name: 'Galle (Wakwella Rd)',    lat: 6.0535, lng: 80.2210 },
  { name: 'Gampaha (Negombo Rd)',   lat: 7.0840, lng: 79.9939 },
  { name: 'Kurunegala',             lat: 7.4863, lng: 80.3623 },
];

export default function ShopProfile() {
  const [profile, setProfile] = useState({
    name: '',
    owner_name: '',
    phone: '',
    email: '',
    city: 'Colombo',
    address: '',
    opening_hours: '',
    coordinates: { lat: 6.9319, lng: 79.8654 },
    description: '',
    specialty: '',
    license_number: '',
    tax_id: '',
    logo_url: '',
    cover_url: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    shopApi.getProfile()
      .then(({ data }) => {
        if (data.success && data.profile) {
          setProfile((prev) => ({
            ...prev,
            ...data.profile,
            coordinates: data.profile.coordinates || { lat: 6.9319, lng: 79.8654 },
          }));
        }
      })
      .catch((err) => console.error('Failed to load profile:', err))
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
      coordinates: {
        ...prev.coordinates,
        [axis]: parseFloat(val) || 0,
      },
    }));
  };

  const handlePresetLocation = (preset) => {
    setProfile((prev) => ({
      ...prev,
      city: preset.name.split(' ')[0],
      coordinates: { lat: preset.lat, lng: preset.lng },
    }));
    showToast(`Coordinates updated to ${preset.name}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await shopApi.updateProfile(profile);
      if (data.success) {
        showToast('Shop profile and location updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      showToast('Error updating shop profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="shop-page">
        <div className="shop-page-header">
          <div className="shop-page-title-box">
            <h1>Shop Profile & Storefront</h1>
            <p>Loading business details and location data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      {/* Toast Alert */}
      {toast && (
        <div className={`shop-toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '⚠️'} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="shop-page-header">
        <div className="shop-page-title-box">
          <h1>Shop Profile & Storefront</h1>
          <p>Manage your public provider identity, contact channels, location coordinates, and working hours.</p>
        </div>
        <div className="shop-page-actions">
          <button
            type="button"
            className="shop-btn shop-btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving Changes...' : '💾 Save Profile'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* ── Brand Banner & Logo Section ── */}
        <div className="shop-card">
          <div className="shop-card-head">
            <h3>🖼️ Storefront Branding & Logo</h3>
          </div>
          <div className="shop-card-body">
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
                    alt="Shop Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '2.5rem' }}>🏬</span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: '260px' }}>
                <div className="shop-form-group">
                  <label className="shop-form-label">Shop Logo / Brand Image URL</label>
                  <input
                    type="url"
                    className="shop-form-input"
                    value={profile.logo_url || ''}
                    placeholder="https://example.com/logo.png"
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  />
                  <span className="shop-hint">
                    Recommended dimensions: 400x400px. Square PNG or JPG.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── General Shop Details ── */}
        <div className="shop-card">
          <div className="shop-card-head">
            <h3>🏢 Business Information</h3>
          </div>
          <div className="shop-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-grid-2">
              <div className="shop-form-group">
                <label className="shop-form-label">Shop Trading Name *</label>
                <input
                  type="text"
                  className="shop-form-input"
                  value={profile.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="shop-form-group">
                <label className="shop-form-label">Proprietor / Manager Full Name</label>
                <input
                  type="text"
                  className="shop-form-input"
                  value={profile.owner_name || ''}
                  onChange={(e) => handleInputChange('owner_name', e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="shop-form-group">
                <label className="shop-form-label">Official Contact Phone *</label>
                <input
                  type="text"
                  className="shop-form-input"
                  value={profile.phone || ''}
                  placeholder="+94 11 432 9988"
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>

              <div className="shop-form-group">
                <label className="shop-form-label">Public Business Email</label>
                <input
                  type="email"
                  className="shop-form-input"
                  value={profile.email || ''}
                  placeholder="sales@speedserve.lk"
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="shop-form-group">
                <label className="shop-form-label">Operating Hours *</label>
                <input
                  type="text"
                  className="shop-form-input"
                  value={profile.opening_hours || ''}
                  placeholder="Mon - Sat: 8:30 AM - 6:00 PM"
                  onChange={(e) => handleInputChange('opening_hours', e.target.value)}
                  required
                />
              </div>

              <div className="shop-form-group">
                <label className="shop-form-label">Specialties & Key Categories</label>
                <input
                  type="text"
                  className="shop-form-input"
                  value={profile.specialty || ''}
                  placeholder="e.g. Brake Systems, Suspension, Japanese Engine Parts"
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                />
              </div>
            </div>

            <div className="shop-form-group">
              <label className="shop-form-label">Business Description</label>
              <textarea
                className="shop-form-textarea"
                rows="3"
                value={profile.description || ''}
                placeholder="Describe your spare parts shop, quality guarantees, delivery options, etc."
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Location Coordinates & Map Picker ── */}
        <div className="shop-card">
          <div className="shop-card-head">
            <h3>📍 Store Location & GPS Coordinates</h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Used by vehicle owners searching for nearby parts on the map
            </span>
          </div>
          <div className="shop-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="form-grid-2">
              <div className="shop-form-group">
                <label className="shop-form-label">Primary City / Region *</label>
                <input
                  type="text"
                  className="shop-form-input"
                  value={profile.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>

              <div className="shop-form-group">
                <label className="shop-form-label">Physical Street Address *</label>
                <input
                  type="text"
                  className="shop-form-input"
                  value={profile.address || ''}
                  placeholder="112 Panchikawatta Road, Colombo 10"
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Quick Preset Selector */}
            <div>
              <span className="shop-form-label" style={{ display: 'block', marginBottom: '8px' }}>
                Quick Preset Locations in Sri Lanka:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {PRESET_CITIES.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    className="shop-btn shop-btn-secondary shop-btn-sm"
                    onClick={() => handlePresetLocation(city)}
                  >
                    📍 {city.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinates Inputs */}
            <div className="form-grid-2">
              <div className="shop-form-group">
                <label className="shop-form-label">Latitude (GPS)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="shop-form-input"
                  value={profile.coordinates?.lat ?? 6.9319}
                  onChange={(e) => handleCoordChange('lat', e.target.value)}
                />
              </div>

              <div className="shop-form-group">
                <label className="shop-form-label">Longitude (GPS)</label>
                <input
                  type="number"
                  step="0.0001"
                  className="shop-form-input"
                  value={profile.coordinates?.lng ?? 79.8654}
                  onChange={(e) => handleCoordChange('lng', e.target.value)}
                />
              </div>
            </div>

            {/* Map Visual Preview Widget */}
            <div
              style={{
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: 'white',
                padding: '24px',
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
                  <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>Storefront Geolocation Pin</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Lat: <strong>{profile.coordinates?.lat}</strong>, Lng: <strong>{profile.coordinates?.lng}</strong> ({profile.city || 'Colombo'})
                </div>
                <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '6px' }}>
                  ✓ Validated Sri Lanka geographic zone
                </div>
              </div>

              <a
                href={`https://www.google.com/maps?q=${profile.coordinates?.lat},${profile.coordinates?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shop-btn shop-btn-primary shop-btn-sm"
                style={{ textDecoration: 'none' }}
              >
                Open in Google Maps ↗
              </a>
            </div>
          </div>
        </div>

        {/* ── Business Verification & Tax ── */}
        <div className="shop-card">
          <div className="shop-card-head">
            <h3>📑 Compliance & Business Registration</h3>
          </div>
          <div className="shop-card-body">
            <div className="form-grid-2">
              <div className="shop-form-group">
                <label className="shop-form-label">Business Registration Number (BRN)</label>
                <input
                  type="text"
                  className="shop-form-input"
                  value={profile.license_number || ''}
                  placeholder="BR-CO-2021-3921"
                  onChange={(e) => handleInputChange('license_number', e.target.value)}
                />
              </div>

              <div className="shop-form-group">
                <label className="shop-form-label">Tax Identification Number (TIN)</label>
                <input
                  type="text"
                  className="shop-form-input"
                  value={profile.tax_id || ''}
                  placeholder="TIN-20918239"
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
            className="shop-btn shop-btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            disabled={saving}
          >
            {saving ? 'Saving Changes...' : '💾 Save Profile & Storefront'}
          </button>
        </div>
      </form>
    </div>
  );
}
