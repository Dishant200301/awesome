import React, { useState } from 'react';
import { getAdminApiBase, getAdminAuthHeaders } from '../utils/authHeaders';
import { Plus, Trash2, Save, RefreshCw, CheckCircle2, SlidersHorizontal, Palette, Ruler, Tag } from 'lucide-react';

interface CategoryItem {
  name: string;
  key: string;
}

interface ColorItem {
  name: string;
  hex: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { name: 'Latkan', key: 'Latkan' },
  { name: 'Choli', key: 'Choli' },
  { name: 'Gift Hamper', key: 'Gift Hamper' },
  { name: 'Necklace', key: 'Necklace' },
  { name: 'Earrings', key: 'Earrings' },
  { name: 'Tassel', key: 'Tassel' },
  { name: 'Hair Accessories', key: 'Hair Accessories' },
  { name: 'Macrame Hanging', key: 'Macrame Hanging' }
];

const DEFAULT_COLORS: ColorItem[] = [
  { name: 'Maroon', hex: '#800000' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Royal Blue', hex: '#4169E1' },
  { name: 'Emerald Green', hex: '#50C878' },
  { name: 'Blush Pink', hex: '#FF69B4' },
  { name: 'Mustard Yellow', hex: '#FFDB58' },
  { name: 'Classic White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' }
];

const DEFAULT_SIZES: string[] = ['Free Size', 'Kids (2-4 Yrs)', 'Kids (5-8 Yrs)', 'Adult S', 'Adult M', 'Adult L', 'Adult XL'];

const STORAGE_KEY = 'awesome_dynamic_filters';

export const FilterManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('aaramly_dynamic_filters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
          return parsed.categories;
        }
      }
    } catch {}
    return DEFAULT_CATEGORIES;
  });

  const [colors, setColors] = useState<ColorItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('aaramly_dynamic_filters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.colors) && parsed.colors.length > 0) {
          return parsed.colors;
        }
      }
    } catch {}
    return DEFAULT_COLORS;
  });

  const [sizes, setSizes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('aaramly_dynamic_filters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.sizes) && parsed.sizes.length > 0) {
          return parsed.sizes;
        }
      }
    } catch {}
    return DEFAULT_SIZES;
  });

  const [maxPrice, setMaxPrice] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('aaramly_dynamic_filters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.maxPrice) return Number(parsed.maxPrice);
      }
    } catch {}
    return 3000;
  });

  // New Inputs State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#bf5c30');
  const [newSize, setNewSize] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    const payload = { categories, colors, sizes, maxPrice };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      
      // Broadcast live update across all tabs
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('awesome_filter_sync');
        channel.postMessage({ filters: payload });
        const legacyChannel = new BroadcastChannel('aaramly_filter_sync');
        legacyChannel.postMessage({ filters: payload });
      }

      // Also try posting to backend API if live
      const apiBase = getAdminApiBase();
      fetch(`${apiBase}/filters`, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      }).catch(() => {});

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save filters', e);
    }
  };

  const handleResetDefaults = () => {
    setCategories(DEFAULT_CATEGORIES);
    setColors(DEFAULT_COLORS);
    setSizes(DEFAULT_SIZES);
    setMaxPrice(3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-[#bf5c30]" />
            <h1 className="text-2xl font-bold text-zinc-900">Dynamic Filter Management</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Configure catalog categories, colors, sizes, and price boundaries rendered live on the Shop Page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 border border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-zinc-900 hover:bg-[#bf5c30] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Filter Settings</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Filters updated live! All client shop pages will immediately render these options.</span>
        </div>
      )}

      {/* Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. CATEGORIES MANAGEMENT */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
              <Tag className="w-4 h-4 text-[#bf5c30]" />
              <span>Catalog Categories ({categories.length})</span>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Latkan, Choli, Gift Hamper..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#bf5c30]"
            />
            <button
              type="button"
              onClick={() => {
                if (newCategoryName.trim()) {
                  const key = newCategoryName.trim();
                  const name = key;
                  if (!categories.some((c) => c.key.toLowerCase() === key.toLowerCase())) {
                    setCategories([...categories, { name, key }]);
                  }
                  setNewCategoryName('');
                }
              }}
              className="bg-zinc-900 hover:bg-[#bf5c30] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-zinc-50 border border-zinc-200/80 rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <div>
                  <span className="text-zinc-900 font-bold">{cat.name}</span>
                  <span className="text-zinc-400 text-[10px] block">Key: {cat.key}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCategories(categories.filter((_, idx) => idx !== i))}
                  className="p-1 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 2. COLORS MANAGEMENT */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
              <Palette className="w-4 h-4 text-[#bf5c30]" />
              <span>Filter Colors ({colors.length})</span>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="e.g. Blush Pink"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#bf5c30]"
            />
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="w-9 h-9 p-0.5 border border-zinc-300 rounded-xl cursor-pointer bg-white"
              title="Choose Hex Color"
            />
            <button
              type="button"
              onClick={() => {
                if (newColorName.trim()) {
                  const name = newColorName.trim();
                  if (!colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
                    setColors([...colors, { name, hex: newColorHex }]);
                  }
                  setNewColorName('');
                }
              }}
              className="bg-zinc-900 hover:bg-[#bf5c30] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {colors.map((col, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-zinc-50 border border-zinc-200/80 rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full border border-zinc-300 shadow-2xs"
                    style={{ backgroundColor: col.hex }}
                  />
                  <div>
                    <span className="text-zinc-900 font-bold">{col.name}</span>
                    <span className="text-zinc-400 text-[10px] block">{col.hex}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setColors(colors.filter((_, idx) => idx !== i))}
                  className="p-1 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove color"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. SIZES MANAGEMENT */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
              <Ruler className="w-4 h-4 text-[#bf5c30]" />
              <span>Filter Sizes ({sizes.length})</span>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. S, XL, 34B, 38D..."
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#bf5c30]"
            />
            <button
              type="button"
              onClick={() => {
                if (newSize.trim()) {
                  const sz = newSize.trim().toUpperCase();
                  if (!sizes.includes(sz)) {
                    setSizes([...sizes, sz]);
                  }
                  setNewSize('');
                }
              }}
              className="bg-zinc-900 hover:bg-[#bf5c30] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 max-h-48 overflow-y-auto">
            {sizes.map((sz, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 text-zinc-900 px-3 py-1.5 rounded-xl text-xs font-bold"
              >
                <span>{sz}</span>
                <button
                  type="button"
                  onClick={() => setSizes(sizes.filter((_, idx) => idx !== i))}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove size"
                >
                  <Trash2 className="w-3 h-3 text-zinc-400 hover:text-rose-600" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 4. MAX PRICE LIMIT BOUNDARY */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
            <SlidersHorizontal className="w-4 h-4 text-[#bf5c30]" />
            <span>Price Filter Upper Limit</span>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
              <span>Maximum Filter Price:</span>
              <span className="text-[#bf5c30] text-sm">₹{maxPrice}</span>
            </div>

            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#bf5c30]"
            />

            <p className="text-[11px] text-zinc-400">
              This controls the top end of the price slider on the Shop Page sidebar (₹200 to ₹{maxPrice}).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
