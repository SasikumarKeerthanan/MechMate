import React, { useState } from 'react';
import { Package, Plus, Trash2, Tag, Layers } from 'lucide-react';

export default function PartCategories() {
  const [categories, setCategories] = useState([
    { id: 'cat_1', name: 'Brake Systems', slug: 'brake-systems', description: 'Pads, rotors, calipers, hydraulic lines, and ABS components.', itemCount: 1420, status: 'active' },
    { id: 'cat_2', name: 'Engine & Drivetrain', slug: 'engine-drivetrain', description: 'Pistons, gaskets, timing belts, spark plugs, and filters.', itemCount: 3890, status: 'active' },
    { id: 'cat_3', name: 'Suspension & Steering', slug: 'suspension-steering', description: 'Shocks, struts, control arms, ball joints, and tie rods.', itemCount: 980, status: 'active' },
    { id: 'cat_4', name: 'Electrical & Lighting', slug: 'electrical-lighting', description: 'Alternators, starters, batteries, bulbs, sensors, and ECUs.', itemCount: 2100, status: 'active' },
    { id: 'cat_5', name: 'Cooling & AC Systems', slug: 'cooling-ac', description: 'Radiators, water pumps, thermostats, condensers, and compressors.', itemCount: 640, status: 'active' },
  ]);

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat = {
      id: `cat_${Date.now()}`,
      name: newCatName,
      slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      description: newCatDesc,
      itemCount: 0,
      status: 'active',
    };
    setCategories([...categories, newCat]);
    setNewCatName('');
    setNewCatDesc('');
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Part Categories</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define automotive spare parts catalog classification and marketplace indexing.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-sm hover:shadow transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Part Category
        </button>
      </div>

      {showAddModal && (
        <form onSubmit={handleAddCategory} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-brand-500/40 shadow-lg space-y-4 animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-500" /> Create New Part Category
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Category Title</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Transmission & Gearbox"
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Description</label>
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Brief summary of included automotive parts"
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{cat.name}</h3>
                    <span className="text-[11px] font-mono text-slate-400">slug: /{cat.slug}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {cat.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {cat.itemCount.toLocaleString()} Listed Products
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
