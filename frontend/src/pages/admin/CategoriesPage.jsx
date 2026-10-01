import React, { useEffect, useState, useMemo } from 'react';
import { categoriesApi } from '../../api/services';
import './AdminPages.css';

const ICON_PRESETS = ['🔩', '🛑', '🛞', '⚡', '⚙️', '❄️', '💨', '🛢️', '🩺', '⚖️', '🎨', '🔋', '🛡️', '📦', '🔧'];

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState('parts'); // 'parts' | 'services'
  const [parts, setParts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    categoryType: 'parts', // 'parts' | 'services'
    data: {
      id: null,
      name: '',
      icon: '🔩',
      description: '',
      item_count: 0,
      estimated_time: '1 hr',
      popular: false,
      active: true,
    },
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    categoryType: 'parts',
    category: null,
  });

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const [partsRes, servicesRes] = await Promise.all([
        categoriesApi.getParts(),
        categoriesApi.getServices(),
      ]);

      if (partsRes.data?.categories) setParts(partsRes.data.categories);
      if (servicesRes.data?.categories) setServices(servicesRes.data.categories);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filtered categories
  const currentCategories = activeTab === 'parts' ? parts : services;

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return currentCategories;
    const term = search.toLowerCase();
    return currentCategories.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
    );
  }, [currentCategories, search]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      categoryType: activeTab,
      data: {
        id: null,
        name: '',
        icon: activeTab === 'parts' ? '🔩' : '🛢️',
        description: '',
        item_count: 0,
        estimated_time: '1 hr',
        popular: false,
        active: true,
      },
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (cat) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      categoryType: activeTab,
      data: {
        id: cat.id,
        name: cat.name || '',
        icon: cat.icon || '📦',
        description: cat.description || '',
        item_count: cat.item_count ?? 0,
        estimated_time: cat.estimated_time || '1 hr',
        popular: Boolean(cat.popular),
        active: Boolean(cat.active ?? true),
      },
    });
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { mode, categoryType, data } = modalState;

    if (!data.name.trim()) return;

    try {
      if (categoryType === 'parts') {
        if (mode === 'create') {
          const res = await categoriesApi.createPart(data);
          const newCat = res.data?.category || { ...data, id: Date.now() };
          setParts((prev) => [...prev, newCat]);
          showToast(`Spare part category '${newCat.name}' created.`, 'success');
        } else {
          const res = await categoriesApi.updatePart(data.id, data);
          const updated = res.data?.category || data;
          setParts((prev) => prev.map((c) => (c.id === data.id ? updated : c)));
          showToast(`Category '${updated.name}' updated.`, 'success');
        }
      } else {
        if (mode === 'create') {
          const res = await categoriesApi.createService(data);
          const newCat = res.data?.category || { ...data, id: Date.now() };
          setServices((prev) => [...prev, newCat]);
          showToast(`Service category '${newCat.name}' created.`, 'success');
        } else {
          const res = await categoriesApi.updateService(data.id, data);
          const updated = res.data?.category || data;
          setServices((prev) => prev.map((c) => (c.id === data.id ? updated : c)));
          showToast(`Service category '${updated.name}' updated.`, 'success');
        }
      }
      // Re-fetch live list to guarantee complete sync
      await loadCategories();
    } catch {
      showToast('Error saving category changes.', 'danger');
    } finally {
      setModalState({ isOpen: false, mode: 'create', categoryType: 'parts', data: {} });
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteModal.category) return;
    const { id, name } = deleteModal.category;
    const { categoryType } = deleteModal;

    // Optimistically remove from state immediately
    if (categoryType === 'parts') {
      setParts((prev) => prev.filter((c) => c.id !== id && c.name !== name));
    } else {
      setServices((prev) => prev.filter((c) => c.id !== id && c.name !== name));
    }

    try {
      if (categoryType === 'parts') {
        await categoriesApi.deletePart(id);
      } else {
        await categoriesApi.deleteService(id);
      }
      showToast(`Category '${name}' deleted successfully.`, 'info');
      // Refetch live category list from Firestore
      await loadCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      showToast('Failed to delete category.', 'danger');
      loadCategories();
    } finally {
      setDeleteModal({ isOpen: false, categoryType: 'parts', category: null });
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
        <h2 className="page-heading">Category Management</h2>
        <p className="page-desc">
          Manage spare-part categories and garage service categories used by vendors, garages, and customers across MechMate.
        </p>
      </div>

      {/* ── Tabbed View: Parts vs Services ── */}
      <div className="tabs-nav" id="category-tabs-nav">
        <button
          id="tab-parts-categories"
          className={`tab-btn ${activeTab === 'parts' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('parts')}
        >
          <span>📦 Spare Part Categories</span>
          <span className="tab-count">{parts.length}</span>
        </button>

        <button
          id="tab-services-categories"
          className={`tab-btn ${activeTab === 'services' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <span>🔧 Garage Service Categories</span>
          <span className="tab-count">{services.length}</span>
        </button>
      </div>

      {/* ── Toolbar: Search & Add Button ── */}
      <div className="table-toolbar" style={{ justifyContent: 'space-between' }}>
        <input
          id="category-search-input"
          type="search"
          className="search-input"
          placeholder={`Search ${activeTab === 'parts' ? 'parts' : 'services'} categories…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '300px' }}
        />

        <button
          id="add-new-category-btn"
          className="action-btn action-btn--primary"
          onClick={handleOpenCreate}
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>＋</span>
          <span>Add New {activeTab === 'parts' ? 'Part' : 'Service'} Category</span>
        </button>
      </div>

      {/* ── Category Cards Grid ── */}
      {loading ? (
        <div className="loading-row">Loading categories…</div>
      ) : filteredCategories.length === 0 ? (
        <div className="table-card">
          <div className="empty-row">No categories found matching your query.</div>
        </div>
      ) : (
        <div className="cat-cards-grid" id="categories-grid">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="cat-card" id={`cat-card-${cat.id}`}>
              <div>
                <div className="cat-card-header">
                  <div className="cat-icon-title-wrap">
                    <div className="cat-icon-box">{cat.icon || '📦'}</div>
                    <div>
                      <h4 className="cat-card-title">{cat.name}</h4>
                      <span className={`badge badge--${cat.active ? 'active' : 'inactive'}`}>
                        {cat.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="cat-card-desc" style={{ marginTop: '12px' }}>
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <div className="cat-meta-row">
                  {activeTab === 'parts' ? (
                    <>
                      <span>Listed Inventory:</span>
                      <span style={{ color: '#1e293b', fontWeight: 700 }}>
                        {cat.item_count ?? 0} items
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Est. Duration: {cat.estimated_time || '1 hr'}</span>
                      {cat.popular && (
                        <span style={{ color: '#ca8a04', background: '#fef9c3', padding: '2px 8px', borderRadius: '4px' }}>
                          ★ Popular
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="cat-card-actions">
                  <button
                    id={`edit-cat-${cat.id}`}
                    className="action-btn btn-inspect"
                    onClick={() => handleOpenEdit(cat)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    id={`delete-cat-${cat.id}`}
                    className="action-btn action-btn--danger"
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        categoryType: activeTab,
                        category: cat,
                      })
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit Category Modal ── */}
      {modalState.isOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setModalState({ isOpen: false, mode: 'create', categoryType: 'parts', data: {} })}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {modalState.mode === 'create' ? 'Add' : 'Edit'}{' '}
                {modalState.categoryType === 'parts' ? 'Spare-Part' : 'Garage Service'} Category
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setModalState({ isOpen: false, mode: 'create', categoryType: 'parts', data: {} })}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {/* Icon Selection */}
                <div className="form-field-group">
                  <label className="form-label">Category Icon</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      id="category-icon-input"
                      type="text"
                      className="form-input"
                      style={{ width: '60px', textAlign: 'center', fontSize: '1.25rem' }}
                      value={modalState.data.icon}
                      onChange={(e) =>
                        setModalState((prev) => ({
                          ...prev,
                          data: { ...prev.data, icon: e.target.value },
                        }))
                      }
                      maxLength={4}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Select a preset or enter an emoji:</span>
                  </div>
                  <div className="icon-preset-list">
                    {ICON_PRESETS.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        className={`icon-preset-btn ${modalState.data.icon === ic ? 'icon-preset-btn--selected' : ''}`}
                        onClick={() =>
                          setModalState((prev) => ({
                            ...prev,
                            data: { ...prev.data, icon: ic },
                          }))
                        }
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="cat-name-input">Category Name *</label>
                  <input
                    id="cat-name-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Brake & Hydraulics, Engine Overhaul"
                    value={modalState.data.name}
                    onChange={(e) =>
                      setModalState((prev) => ({
                        ...prev,
                        data: { ...prev.data, name: e.target.value },
                      }))
                    }
                    required
                  />
                </div>

                {/* Description */}
                <div className="form-field-group">
                  <label className="form-label" htmlFor="cat-desc-input">Description</label>
                  <textarea
                    id="cat-desc-input"
                    className="form-textarea"
                    placeholder="Briefly describe what components or services belong to this category…"
                    value={modalState.data.description}
                    onChange={(e) =>
                      setModalState((prev) => ({
                        ...prev,
                        data: { ...prev.data, description: e.target.value },
                      }))
                    }
                  />
                </div>

                {/* Type-Specific Fields */}
                {modalState.categoryType === 'parts' ? (
                  <div className="form-field-group">
                    <label className="form-label" htmlFor="cat-items-input">Initial Part Count</label>
                    <input
                      id="cat-items-input"
                      type="number"
                      min={0}
                      className="form-input"
                      value={modalState.data.item_count}
                      onChange={(e) =>
                        setModalState((prev) => ({
                          ...prev,
                          data: { ...prev.data, item_count: Number(e.target.value) },
                        }))
                      }
                    />
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className="form-field-group">
                      <label className="form-label" htmlFor="cat-duration-input">Estimated Duration</label>
                      <input
                        id="cat-duration-input"
                        type="text"
                        className="form-input"
                        placeholder="e.g., 45 mins, 2-3 days"
                        value={modalState.data.estimated_time}
                        onChange={(e) =>
                          setModalState((prev) => ({
                            ...prev,
                            data: { ...prev.data, estimated_time: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="form-field-group" style={{ justifyContent: 'center' }}>
                      <label className="form-label" style={{ marginBottom: '6px' }}>Popular Service</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        <input
                          id="cat-popular-checkbox"
                          type="checkbox"
                          checked={modalState.data.popular}
                          onChange={(e) =>
                            setModalState((prev) => ({
                              ...prev,
                              data: { ...prev.data, popular: e.target.checked },
                            }))
                          }
                        />
                        <span>Highlight as Popular</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Status Toggle */}
                <div className="form-field-group">
                  <label className="form-label">Category Status</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      id="cat-active-checkbox"
                      type="checkbox"
                      checked={modalState.data.active}
                      onChange={(e) =>
                        setModalState((prev) => ({
                          ...prev,
                          data: { ...prev.data, active: e.target.checked },
                        }))
                      }
                    />
                    <span>Active (Available for provider tagging)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="action-btn btn-inspect"
                  onClick={() => setModalState({ isOpen: false, mode: 'create', categoryType: 'parts', data: {} })}
                >
                  Cancel
                </button>
                <button
                  id="submit-category-btn"
                  type="submit"
                  className="action-btn action-btn--primary"
                >
                  {modalState.mode === 'create' ? 'Create Category' : 'Save Changes'}
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
          onClick={() => setDeleteModal({ isOpen: false, categoryType: 'parts', category: null })}
        >
          <div className="modal-dialog" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <div className="confirm-box">
                <div className="confirm-icon-circle confirm-icon-circle--danger">
                  🗑️
                </div>
                <h3>Delete Category?</h3>
                <p>
                  Are you sure you want to remove category{' '}
                  <strong>'{deleteModal.category?.name}'</strong>? Providers will no longer be able to associate items or services with this category.
                </p>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button
                className="action-btn btn-inspect"
                onClick={() => setDeleteModal({ isOpen: false, categoryType: 'parts', category: null })}
              >
                Cancel
              </button>
              <button
                id="confirm-delete-category-btn"
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
