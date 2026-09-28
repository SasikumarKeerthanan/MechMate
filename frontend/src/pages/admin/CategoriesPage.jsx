import React, { useEffect, useState } from 'react';
import { categoriesApi } from '../../api/services';
import './AdminPages.css';

const MOCK_CATEGORIES = [
  { id: 1, name: 'Engine Repair',    icon: '🔩', active: true  },
  { id: 2, name: 'Tire & Wheel',     icon: '🛞', active: true  },
  { id: 3, name: 'Brake Service',    icon: '🛑', active: true  },
  { id: 4, name: 'Oil Change',       icon: '🛢️', active: true  },
  { id: 5, name: 'AC Service',       icon: '❄️', active: false },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🔧');

  useEffect(() => {
    categoriesApi
      .getAll()
      .then(({ data }) => setCategories(data.categories ?? MOCK_CATEGORIES))
      .catch(() => setCategories(MOCK_CATEGORIES))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newCat = { id: Date.now(), name: newName.trim(), icon: newIcon, active: true };
    try { await categoriesApi.create({ name: newCat.name, icon: newCat.icon }); } catch { /* stub */ }
    setCategories((prev) => [...prev, newCat]);
    setNewName('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await categoriesApi.delete(id); } catch { /* stub */ }
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2 className="page-heading">Categories</h2>
        <p className="page-desc">Manage service categories available to providers.</p>
      </div>

      {/* Add form */}
      <div className="card mb-6" id="add-category-card">
        <h3 className="card-title">Add New Category</h3>
        <form onSubmit={handleAdd} className="inline-form">
          <input
            id="new-cat-icon"
            type="text"
            className="inline-input"
            style={{ width: 60 }}
            placeholder="Icon"
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
          />
          <input
            id="new-cat-name"
            type="text"
            className="inline-input"
            placeholder="Category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <button id="add-category-btn" type="submit" className="action-btn action-btn--primary">
            Add Category
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="table-card" id="categories-table">
        {loading ? (
          <div className="loading-row">Loading categories…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ fontSize: '1.4rem' }}>{cat.icon}</td>
                  <td className="fw-medium">{cat.name}</td>
                  <td>
                    <span className={`badge badge--${cat.active ? 'success' : 'danger'}`}>
                      {cat.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      id={`delete-category-${cat.id}`}
                      className="action-btn action-btn--danger"
                      onClick={() => handleDelete(cat.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
