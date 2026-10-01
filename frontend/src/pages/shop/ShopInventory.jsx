import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { shopApi, categoriesApi } from '../../api/services';
import './ShopPages.css';

const VEHICLE_MAKES = [
  'All Makes',
  'Toyota',
  'Honda',
  'Nissan',
  'Suzuki',
  'Mitsubishi',
  'Mazda',
  'Daihatsu',
  'Hyundai',
  'Kia',
];

const DEFAULT_PART_FORM = {
  name: '',
  part_number: '',
  category: '',
  brand: '',
  model: '',
  price: '',
  stock_quantity: 10,
  condition: 'Brand New',
  availability: 'in_stock',
  description: '',
  image_url: '',
  compatibility_text: '',
};

export default function ShopInventory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [parts, setParts] = useState([]);
  const [categoriesList, setCategoriesList] = useState(['All Categories']);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);


  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMake, setSelectedMake] = useState('All Makes');

  // Add / Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_PART_FORM);
  const [submitting, setSubmitting] = useState(false);

  // History Modal state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyPart, setHistoryPart] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState({ stock_history: [], price_history: [] });

  // Delete confirmation
  const [deletingPart, setDeletingPart] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchParts = () => {
    setLoading(true);
    shopApi.getParts()
      .then(({ data }) => {
        if (data.success && Array.isArray(data.parts)) {
          setParts(data.parts);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch parts:', err);
        showToast('Error loading spare parts from catalog.', 'error');
      })
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    categoriesApi.getParts()
      .then(({ data }) => {
        if (data.success && Array.isArray(data.categories)) {
          const names = data.categories.map((c) => c.name).filter(Boolean);
          // Pure dynamic loading from live Firestore API
          setCategoriesList(['All Categories', ...names]);
        }
      })
      .catch((err) => console.error('Failed to fetch live categories:', err));
  };

  useEffect(() => {
    fetchParts();
    fetchCategories();
  }, []);

  // Handle URL query for adding part
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      openAddModal();
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  // Filtered Parts
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const nameMatch = (part.name || '').toLowerCase().includes(query);
        const skuMatch = (part.part_number || '').toLowerCase().includes(query);
        const brandMatch = (part.brand || '').toLowerCase().includes(query);
        if (!nameMatch && !skuMatch && !brandMatch) return false;
      }

      // Category
      if (selectedCategory !== 'All Categories' && part.category !== selectedCategory) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && part.availability !== selectedStatus) {
        return false;
      }

      // Vehicle Make
      if (selectedMake !== 'All Makes') {
        const makeQuery = selectedMake.toLowerCase();
        const compat = Array.isArray(part.vehicle_compatibility)
          ? part.vehicle_compatibility.join(' ').toLowerCase()
          : '';
        if (!compat.includes(makeQuery)) return false;
      }

      return true;
    });
  }, [parts, searchTerm, selectedCategory, selectedStatus, selectedMake]);

  // Open Add Modal
  const openAddModal = () => {
    fetchCategories();
    setEditingPart(null);
    const firstCat = categoriesList.find((c) => c !== 'All Categories') || '';
    setFormData({
      ...DEFAULT_PART_FORM,
      category: firstCat,
      image_url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
    });
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (part) => {
    fetchCategories();
    setEditingPart(part);
    const compatList = Array.isArray(part.vehicle_compatibility)
      ? part.vehicle_compatibility.join(', ')
      : '';
    setFormData({
      name: part.name || '',
      part_number: part.part_number || '',
      category: part.category || (categoriesList.find((c) => c !== 'All Categories') || ''),
      brand: part.brand || '',
      model: part.model || '',
      price: part.price || '',
      stock_quantity: part.stock_quantity ?? 0,
      condition: part.condition || 'Brand New',
      availability: part.availability || 'in_stock',
      description: part.description || '',
      image_url: part.image_url || '',
      compatibility_text: compatList,
    });
    setIsEditModalOpen(true);
  };

  // Open History Modal
  const openHistoryModal = async (part) => {
    setHistoryPart(part);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const { data } = await shopApi.getPartHistory(part.id);
      if (data.success) {
        setHistoryData({
          stock_history: data.stock_history || [],
          price_history: data.price_history || [],
        });
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      showToast('Error loading history logs for this part.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const compatArray = formData.compatibility_text
        ? formData.compatibility_text.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const qty = parseInt(formData.stock_quantity) || 0;
      let avail = formData.availability;
      if (qty === 0) avail = 'out_of_stock';
      else if (qty <= 5 && avail === 'in_stock') avail = 'low_stock';

      const payload = {
        name: formData.name,
        part_number: formData.part_number,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        price: parseFloat(formData.price) || 0,
        stock_quantity: qty,
        condition: formData.condition,
        availability: avail,
        description: formData.description,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80',
        vehicle_compatibility: compatArray,
      };

      if (editingPart) {
        await shopApi.updatePart(editingPart.id, payload);
        showToast(`Spare part "${payload.name}" updated successfully.`);
      } else {
        await shopApi.addPart(payload);
        showToast(`Spare part "${payload.name}" added to catalog.`);
      }

      setIsEditModalOpen(false);
      fetchParts();
    } catch (err) {
      console.error('Failed to save part:', err);
      showToast('Error saving part. Please verify inputs.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!deletingPart) return;
    try {
      await shopApi.deletePart(deletingPart.id);
      showToast(`Part "${deletingPart.name}" deleted from catalog.`);
      setParts((prev) => prev.filter((p) => p.id !== deletingPart.id));
      setDeletingPart(null);
    } catch (err) {
      console.error('Failed to delete part:', err);
      showToast('Error removing spare part.', 'error');
    }
  };

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
          <h1>Spare Parts Inventory</h1>
          <p>Maintain your product catalog, vehicle compatibility references, stock levels, and pricing.</p>
        </div>
        <div className="shop-page-actions">
          <button className="shop-btn shop-btn-primary" onClick={openAddModal}>
            + Add New Spare Part
          </button>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <div className="shop-card" style={{ padding: '16px 20px' }}>
        <div className="shop-filter-bar" style={{ margin: 0 }}>
          <div className="shop-filter-group">
            {/* Search Input */}
            <input
              type="text"
              className="shop-search-input"
              placeholder="🔍 Search name, part number, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Category Filter */}
            <select
              className="shop-select-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Vehicle Make Filter */}
            <select
              className="shop-select-filter"
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
            >
              {VEHICLE_MAKES.map((make) => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>

            {/* Availability Status Filter */}
            <select
              className="shop-select-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Stock Statuses</option>
              <option value="in_stock">In Stock (Available)</option>
              <option value="low_stock">Low Stock (≤ 5 units)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Showing <strong>{filteredParts.length}</strong> of {parts.length} parts
          </div>
        </div>
      </div>

      {/* ── Inventory Data Table ── */}
      <div className="shop-card">
        <div className="shop-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Loading spare parts inventory...
            </div>
          ) : filteredParts.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📦</div>
              <strong style={{ fontSize: '1.1rem', color: '#1e293b', display: 'block' }}>No spare parts found</strong>
              <span style={{ fontSize: '0.85rem' }}>Try clearing filters or add a new part to your inventory catalog.</span>
            </div>
          ) : (
            <div className="shop-table-wrapper">
              <table className="shop-table">
                <thead>
                  <tr>
                    <th>Part Details</th>
                    <th>Category</th>
                    <th>Vehicle Compatibility</th>
                    <th>Condition</th>
                    <th>Price (LKR)</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map((part) => (
                    <tr key={part.id}>
                      {/* Thumbnail & Title */}
                      <td>
                        <div className="part-info-cell">
                          <div className="part-thumb-wrap">
                            <img
                              src={part.image_url || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=100&q=80'}
                              alt={part.name}
                              className="part-thumb"
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=100&q=80'; }}
                            />
                          </div>
                          <div>
                            <div className="part-title-text">{part.name}</div>
                            <div className="part-sku-text">
                              SKU: <strong>{part.part_number || 'N/A'}</strong> • Brand: {part.brand || 'OEM'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span style={{ fontWeight: 500 }}>{part.category}</span>
                      </td>

                      {/* Vehicle Compatibility */}
                      <td>
                        <div className="compat-tag-list">
                          {Array.isArray(part.vehicle_compatibility) && part.vehicle_compatibility.length > 0 ? (
                            part.vehicle_compatibility.map((veh, i) => (
                              <span key={i} className="compat-tag">
                                {veh}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Universal / Unspecified</span>
                          )}
                        </div>
                      </td>

                      {/* Condition */}
                      <td>
                        <span className="cond-badge">{part.condition || 'Brand New'}</span>
                      </td>

                      {/* Price */}
                      <td>
                        <strong style={{ color: '#0f172a' }}>
                          LKR {Number(part.price || 0).toLocaleString()}
                        </strong>
                      </td>

                      {/* Stock Quantity */}
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: part.stock_quantity === 0 ? '#ef4444' : part.stock_quantity <= 5 ? '#f59e0b' : '#1e293b',
                          }}
                        >
                          {part.stock_quantity ?? 0} pcs
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td>
                        <span className={`stock-badge ${part.availability}`}>
                          {part.availability === 'in_stock' && '✓ In Stock'}
                          {part.availability === 'low_stock' && '⚠️ Low Stock'}
                          {part.availability === 'out_of_stock' && '✕ Out of Stock'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          className="shop-icon-action"
                          title="Stock & Price History"
                          onClick={() => openHistoryModal(part)}
                        >
                          🕒 History
                        </button>
                        <button
                          className="shop-icon-action"
                          style={{ marginLeft: '6px' }}
                          title="Edit Part"
                          onClick={() => openEditModal(part)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="shop-icon-action danger"
                          style={{ marginLeft: '6px' }}
                          title="Delete Part"
                          onClick={() => setDeletingPart(part)}
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

      {/* ── Add / Edit Spare Part Modal ── */}
      {isEditModalOpen && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-box large">
            <div className="shop-modal-head">
              <h3>{editingPart ? '✏️ Edit Spare Part' : '➕ Add New Spare Part'}</h3>
              <button
                className="shop-modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="shop-modal-body">
                <div className="form-grid-2">
                  <div className="shop-form-group">
                    <label className="shop-form-label">Part Name *</label>
                    <input
                      type="text"
                      className="shop-form-input"
                      placeholder="e.g. Ceramic Front Brake Pads"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="shop-form-group">
                    <label className="shop-form-label">Part Number / SKU</label>
                    <input
                      type="text"
                      className="shop-form-input"
                      placeholder="e.g. ACT-905"
                      value={formData.part_number}
                      onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="shop-form-group">
                    <label className="shop-form-label">Category *</label>
                    <select
                      className="shop-form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      {categoriesList.filter((c) => c !== 'All Categories').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="shop-form-group">
                    <label className="shop-form-label">Manufacturer / Brand</label>
                    <input
                      type="text"
                      className="shop-form-input"
                      placeholder="e.g. Denso, Akebono, KYB, Toyota OEM"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                </div>

                <div className="shop-form-group">
                  <label className="shop-form-label">Vehicle Compatibility (Comma separated)</label>
                  <input
                    type="text"
                    className="shop-form-input"
                    placeholder="e.g. Toyota Prius, Toyota Axio, Honda Vezel, Suzuki Wagon R"
                    value={formData.compatibility_text}
                    onChange={(e) => setFormData({ ...formData, compatibility_text: e.target.value })}
                  />
                  <span className="shop-hint">
                    Add vehicle models separated by commas so drivers searching for their vehicle can discover this part.
                  </span>
                </div>

                <div className="form-grid-2">
                  <div className="shop-form-group">
                    <label className="shop-form-label">Price (LKR) *</label>
                    <input
                      type="number"
                      min="0"
                      className="shop-form-input"
                      placeholder="14500"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="shop-form-group">
                    <label className="shop-form-label">Initial / Current Stock Units *</label>
                    <input
                      type="number"
                      min="0"
                      className="shop-form-input"
                      placeholder="10"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="shop-form-group">
                    <label className="shop-form-label">Part Condition</label>
                    <select
                      className="shop-form-select"
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    >
                      <option value="Brand New">Brand New</option>
                      <option value="Reconditioned">Reconditioned (Japan)</option>
                      <option value="Used">Used / Genuine Pull</option>
                    </select>
                  </div>

                  <div className="shop-form-group">
                    <label className="shop-form-label">Stock Status Mode</label>
                    <select
                      className="shop-form-select"
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock Warning</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div className="shop-form-group">
                  <label className="shop-form-label">Image URL</label>
                  <input
                    type="url"
                    className="shop-form-input"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>

                <div className="shop-form-group">
                  <label className="shop-form-label">Technical Description & Notes</label>
                  <textarea
                    className="shop-form-textarea"
                    rows="3"
                    placeholder="Describe material, warranty, specifications, country of origin, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="shop-modal-foot">
                <button
                  type="button"
                  className="shop-btn shop-btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="shop-btn shop-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingPart ? 'Update Spare Part' : 'Save to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Stock & Price History Modal ── */}
      {isHistoryModalOpen && historyPart && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-box">
            <div className="shop-modal-head">
              <h3>🕒 Stock & Price History</h3>
              <button
                className="shop-modal-close-btn"
                onClick={() => setIsHistoryModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="shop-modal-body">
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{historyPart.name}</strong>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  SKU: {historyPart.part_number || 'N/A'} • Current Price: LKR {Number(historyPart.price || 0).toLocaleString()} • Stock: {historyPart.stock_quantity} pcs
                </div>
              </div>

              {historyLoading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                  Loading historical adjustment logs...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Stock Adjustments Timeline */}
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#334155' }}>
                      📦 Stock Movements & Replenishment Logs
                    </h4>
                    {historyData.stock_history.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>No stock adjustment history on record.</p>
                    ) : (
                      <div className="history-timeline">
                        {historyData.stock_history.map((item, idx) => (
                          <div key={idx} className="history-item">
                            <span className="history-item-dot"></span>
                            <div className="history-meta">
                              <span>📅 {item.date && !isNaN(new Date(item.date).getTime()) ? new Date(item.date).toLocaleString() : (item.date || 'Recent')}</span>
                              <span>•</span>
                              <strong style={{ color: '#d97706', textTransform: 'capitalize' }}>
                                {item.change_type || 'Adjustment'}
                              </strong>
                            </div>
                            <div className="history-title">
                              Quantity: {item.quantity_change > 0 ? `+${item.quantity_change}` : item.quantity_change} units
                              (Final: {item.final_quantity} units)
                            </div>
                            <div className="history-desc">{item.notes || 'Routine stock reconciliation'}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price Adjustments Timeline */}
                  <div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#334155' }}>
                      💰 Price Changes & Tariff Updates
                    </h4>
                    {historyData.price_history.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>No price changes recorded yet.</p>
                    ) : (
                      <div className="history-timeline">
                        {historyData.price_history.map((item, idx) => (
                          <div key={idx} className="history-item">
                            <span className="history-item-dot price"></span>
                            <div className="history-meta">
                              <span>📅 {item.date && !isNaN(new Date(item.date).getTime()) ? new Date(item.date).toLocaleString() : (item.date || 'Recent')}</span>
                            </div>
                            <div className="history-title">
                              LKR {Number(item.old_price || 0).toLocaleString()} → <strong>LKR {Number(item.new_price || 0).toLocaleString()}</strong>
                            </div>
                            <div className="history-desc">Reason: {item.reason || 'Price adjustment'}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="shop-modal-foot">
              <button
                className="shop-btn shop-btn-secondary"
                onClick={() => setIsHistoryModalOpen(false)}
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {deletingPart && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-box" style={{ maxWidth: '440px' }}>
            <div className="shop-modal-head">
              <h3 style={{ color: '#dc2626' }}>🗑️ Delete Spare Part</h3>
              <button
                className="shop-modal-close-btn"
                onClick={() => setDeletingPart(null)}
              >
                &times;
              </button>
            </div>
            <div className="shop-modal-body">
              <p style={{ margin: 0, color: '#334155' }}>
                Are you sure you want to delete <strong>"{deletingPart.name}"</strong>?
              </p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                This will remove the item from search listings and your inventory catalog immediately.
              </p>
            </div>
            <div className="shop-modal-foot">
              <button
                className="shop-btn shop-btn-secondary"
                onClick={() => setDeletingPart(null)}
              >
                Cancel
              </button>
              <button
                className="shop-btn shop-btn-danger"
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
