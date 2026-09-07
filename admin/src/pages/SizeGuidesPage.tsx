import React, { useState, useEffect } from 'react';
import {
  Ruler,
  Plus,
  Trash2,
  Edit2,
  Globe,
  Columns,
  Check,
  X,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Bookmark,
  Link as LinkIcon
} from 'lucide-react';
import { SizeGuide, SizeGuideCountry, SizeGuideColumn, SizeGuideRow, Category } from '../types/admin';
import { AdminApiService } from '../services/adminApi';
import { Select } from '../components/ui/select';

interface SizeGuidesPageProps {
  initialSubTab?: 'all-guides' | 'add-guide' | 'templates' | 'assignment';
}

const INITIAL_SIZE_GUIDES: SizeGuide[] = [
  {
    id: "sg-choli",
    title: "Navratri Traditional Choli & Blouse Fit Guide",
    description: "Standard size and chest/waist measurements for stitched & semi-stitched cholis.",
    categoryIds: ["cat-2"],
    subcategoryIds: ["sub-2", "sub-3"],
    countries: [
      { id: "c-1", name: "India", code: "IN", displayOrder: 1 },
      { id: "c-2", name: "USA", code: "US", displayOrder: 2 },
      { id: "c-3", name: "UK", code: "UK", displayOrder: 3 }
    ],
    columns: [
      { id: "col-1", key: "brandSize", name: "Size / Age", displayOrder: 1 },
      { id: "col-2", key: "countrySize", name: "Standard", displayOrder: 2 },
      { id: "col-3", key: "chest", name: "Chest", displayOrder: 3 },
      { id: "col-4", key: "length", name: "Length", displayOrder: 4 }
    ],
    rows: [
      {
        id: "r-1",
        brandSize: "Kids (2-4 Yrs)",
        displayOrder: 1,
        values: {
          IN_countrySize: { cm: "22-24", inch: "22-24" },
          IN_chest: { cm: "56-60", inch: "22-24" },
          IN_length: { cm: "25-28", inch: "10-11" }
        }
      },
      {
        id: "r-2",
        brandSize: "Adult Free Size (M-XL)",
        displayOrder: 2,
        values: {
          IN_countrySize: { cm: "36-40", inch: "36-40" },
          IN_chest: { cm: "90-102", inch: "36-40" },
          IN_length: { cm: "38-42", inch: "15-16.5" }
        }
      }
    ]
  }
];


export const SizeGuidesPage: React.FC<SizeGuidesPageProps> = ({ initialSubTab = 'all-guides' }) => {
  const [subTab, setSubTab] = useState(initialSubTab);
  const [guides, setGuides] = useState<SizeGuide[]>(INITIAL_SIZE_GUIDES);
  const [search, setSearch] = useState('');
  const [editingGuide, setEditingGuide] = useState<SizeGuide | null>(null);

  // Form State for Add / Edit
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>(['cat-1']);
  const [selectedSubcatIds, setSelectedSubcatIds] = useState<string[]>([]);
  const [countries, setCountries] = useState<SizeGuideCountry[]>([
    { id: "c-1", name: "India", code: "IN", displayOrder: 1 },
    { id: "c-2", name: "USA", code: "US", displayOrder: 2 },
    { id: "c-3", name: "EU", code: "EU", displayOrder: 3 },
    { id: "c-4", name: "UK", code: "UK", displayOrder: 4 },
    { id: "c-5", name: "China", code: "CN", displayOrder: 5 }
  ]);
  const [columns, setColumns] = useState<SizeGuideColumn[]>([
    { id: "col-1", key: "brandSize", name: "Brand Size", displayOrder: 1 },
    { id: "col-2", key: "countrySize", name: "Country Standard", displayOrder: 2 },
    { id: "col-3", key: "bust", name: "Bust", displayOrder: 3 },
    { id: "col-4", key: "underbust", name: "Underbust", displayOrder: 4 }
  ]);
  const [rows, setRows] = useState<SizeGuideRow[]>([
    {
      id: "r-1",
      brandSize: "32A",
      displayOrder: 1,
      values: {}
    },
    {
      id: "r-2",
      brandSize: "34B",
      displayOrder: 2,
      values: {}
    }
  ]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  // Dynamic Add Inputs
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newColName, setNewColName] = useState('');
  const [newRowBrandSize, setNewRowBrandSize] = useState('');

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    const fetchGuides = async () => {
      const remote = await AdminApiService.getSizeGuides();
      if (remote && remote.length > 0) {
        setGuides(remote);
      }
      try {
        const catRes = await AdminApiService.getCategories();
        if (catRes?.categories && Array.isArray(catRes.categories)) {
          setCategoriesList(catRes.categories);
        }
      } catch (e) {}
    };
    fetchGuides();
  }, []);

  const openCreateForm = () => {
    setEditingGuide(null);
    setTitle('');
    setDescription('');
    setSelectedCatIds(['cat-2']);
    setSelectedSubcatIds([]);
    setCountries([
      { id: "c-1", name: "India", code: "IN", displayOrder: 1 },
      { id: "c-2", name: "USA", code: "US", displayOrder: 2 },
      { id: "c-3", name: "UK", code: "UK", displayOrder: 3 }
    ]);
    setColumns([
      { id: "col-1", key: "brandSize", name: "Size / Age", displayOrder: 1 },
      { id: "col-2", key: "countrySize", name: "Standard", displayOrder: 2 },
      { id: "col-3", key: "chest", name: "Chest", displayOrder: 3 },
      { id: "col-4", key: "length", name: "Length", displayOrder: 4 }
    ]);
    setRows([
      { id: "r-1", brandSize: "Kids (2-4 Yrs)", displayOrder: 1, values: {} },
      { id: "r-2", brandSize: "Adult Free Size", displayOrder: 2, values: {} }
    ]);
    setSubTab('add-guide');
  };

  const openEditForm = (guide: SizeGuide) => {
    setEditingGuide(guide);
    setTitle(guide.title);
    setDescription(guide.description || '');
    setSelectedCatIds(guide.categoryIds || []);
    setSelectedSubcatIds(guide.subcategoryIds || []);
    setCountries(guide.countries || []);
    setColumns(guide.columns || []);
    setRows(guide.rows || []);
    setSubTab('add-guide');
  };

  const handleAddCountry = () => {
    if (!newCountryName.trim()) return;
    const code = (newCountryCode.trim() || newCountryName.trim().substring(0, 2)).toUpperCase();
    const newCountry: SizeGuideCountry = {
      id: `c-${Date.now()}`,
      name: newCountryName.trim(),
      code,
      displayOrder: countries.length + 1
    };
    setCountries([...countries, newCountry]);
    setNewCountryName('');
    setNewCountryCode('');
  };

  const handleRemoveCountry = (cId: string) => {
    setCountries(countries.filter((c) => c.id !== cId));
  };

  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    const key = newColName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
    const newCol: SizeGuideColumn = {
      id: `col-${Date.now()}`,
      key,
      name: newColName.trim(),
      displayOrder: columns.length + 1
    };
    setColumns([...columns, newCol]);
    setNewColName('');
  };

  const handleRemoveColumn = (colId: string) => {
    setColumns(columns.filter((c) => c.id !== colId));
  };

  const handleAddRow = () => {
    if (!newRowBrandSize.trim()) return;
    const newRow: SizeGuideRow = {
      id: `r-${Date.now()}`,
      brandSize: newRowBrandSize.trim(),
      displayOrder: rows.length + 1,
      values: {}
    };
    setRows([...rows, newRow]);
    setNewRowBrandSize('');
  };

  const handleRemoveRow = (rId: string) => {
    setRows(rows.filter((r) => r.id !== rId));
  };

  const handleRowValueChange = (
    rowId: string,
    countryCode: string,
    columnKey: string,
    unit: 'cm' | 'inch',
    value: string
  ) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          const valKey = `${countryCode}_${columnKey}`;
          const currentValObj = r.values[valKey] || { cm: '', inch: '' };
          const updatedValObj = { ...currentValObj, [unit]: value };
          return {
            ...r,
            values: {
              ...r.values,
              [valKey]: updatedValObj
            }
          };
        }
        return r;
      })
    );
  };

  const handleSaveGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter Size Guide Title.');
      return;
    }

    const savedGuide: SizeGuide = {
      id: editingGuide ? editingGuide.id : `sg-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      categoryIds: selectedCatIds,
      subcategoryIds: selectedSubcatIds,
      countries,
      columns,
      rows
    };

    if (editingGuide) {
      setGuides(guides.map((g) => (g.id === editingGuide.id ? savedGuide : g)));
    } else {
      setGuides([...guides, savedGuide]);
    }

    await AdminApiService.createSizeGuide(savedGuide);
    setSubTab('all-guides');
  };

  const handleDeleteGuide = (id: string) => {
    setGuides(guides.filter((g) => g.id !== id));
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-[1400px] mx-auto pb-24 font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Ruler className="w-6 h-6 text-indigo-600" />
            <span>Dynamic Size Guide &amp; Conversion System</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Manage international size conversion tables (India, USA, EU, UK, China, Japan), custom columns, rows, and category mappings.
          </p>
        </div>

        {/* SUBTAB SWITCHER */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubTab('all-guides')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'all-guides' ? 'bg-zinc-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>All Size Guides ({guides.length})</span>
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'add-guide' ? 'bg-zinc-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>{editingGuide ? 'Edit Size Guide' : 'Add Size Guide'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('templates')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'templates' ? 'bg-zinc-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-purple-400" />
            <span>Templates</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('assignment')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              subTab === 'assignment' ? 'bg-zinc-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Assign Mappings</span>
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      {subTab === 'all-guides' && (
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search size guides by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-xs font-bold text-slate-900 outline-none"
          />
        </div>
      )}

      {/* SUBTAB 1: ALL SIZE GUIDES LISTING */}
      {subTab === 'all-guides' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides
              .filter((g) => !search || g.title.toLowerCase().includes(search.toLowerCase()))
              .map((g) => (
                <div key={g.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-indigo-200 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{g.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{g.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(g)}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                        title="Edit Size Guide"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGuide(g.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                        title="Delete Size Guide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Country Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Countries:</span>
                    {g.countries.map((c) => (
                      <span key={c.id} className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold text-[11px] border border-indigo-200">
                        {c.name} ({c.code})
                      </span>
                    ))}
                  </div>

                  {/* Columns Preview */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Columns:</span>
                    {g.columns.map((col) => (
                      <span key={col.id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {col.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: ADD / EDIT SIZE GUIDE FORM */}
      {subTab === 'add-guide' && (
        <form onSubmit={handleSaveGuide} className="space-y-8">
          {/* BASIC INFORMATION */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
              <Ruler className="w-5 h-5 text-indigo-600" />
              <span>1. Basic Guide Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-1">Guide Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Women's Bra & International Fit Guide"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-1">Description / Fitting Note</label>
                <input
                  type="text"
                  placeholder="e.g. Measure around full bust and underbust for accurate cup fit..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC COUNTRY STANDARDS TABS */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <span>2. Dynamic Country Standards Tabs ({countries.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Admin can add custom international standards (India, USA, EU, UK, China, Australia, Japan).</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Country (e.g. Japan)"
                  value={newCountryName}
                  onChange={(e) => setNewCountryName(e.target.value)}
                  className="w-32 bg-slate-50 p-2 text-xs font-bold rounded-xl border border-slate-200 outline-none"
                />
                <input
                  type="text"
                  placeholder="Code (JP)"
                  value={newCountryCode}
                  onChange={(e) => setNewCountryCode(e.target.value)}
                  className="w-20 bg-slate-50 p-2 text-xs font-bold rounded-xl border border-slate-200 outline-none uppercase"
                />
                <button
                  type="button"
                  onClick={handleAddCountry}
                  className="px-3.5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 cursor-pointer"
                >
                  + Add Country
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {countries.map((c) => (
                <div key={c.id} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-extrabold text-xs border border-slate-200 flex items-center gap-2">
                  <span>{c.name} ({c.code})</span>
                  <button type="button" onClick={() => handleRemoveCountry(c.id)} className="text-rose-500 hover:text-rose-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC COLUMNS & ROWS TABLE */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Columns className="w-5 h-5 text-indigo-600" />
                  <span>3. Dynamic Columns &amp; Values Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Customize columns and add size rows with CM &amp; INCH measurements per country.</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Add Column */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Column Name (e.g. Underbust)"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    className="w-40 bg-slate-50 p-2 text-xs font-bold rounded-xl border border-slate-200 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 cursor-pointer"
                  >
                    + Column
                  </button>
                </div>

                {/* Add Row */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Size (e.g. 34C)"
                    value={newRowBrandSize}
                    onChange={(e) => setNewRowBrandSize(e.target.value)}
                    className="w-32 bg-slate-50 p-2 text-xs font-bold rounded-xl border border-slate-200 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 cursor-pointer"
                  >
                    + Row
                  </button>
                </div>
              </div>
            </div>

            {/* PREVIEW EDIT MATRIX TABLE */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                    <th className="p-3">Brand Size</th>
                    {countries.map((c) =>
                      columns.map((col) => (
                        <th key={`${c.code}_${col.key}`} className="p-3">
                          {c.code} • {col.name}
                        </th>
                      ))
                    )}
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs font-bold">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="p-3 text-slate-900 font-extrabold">{r.brandSize}</td>
                      {countries.map((c) =>
                        columns.map((col) => {
                          const valKey = `${c.code}_${col.key}`;
                          const currentVal = r.values[valKey] || { cm: '', inch: '' };
                          return (
                            <td key={valKey} className="p-3">
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  placeholder="cm"
                                  value={currentVal.cm}
                                  onChange={(e) => handleRowValueChange(r.id, c.code, col.key, 'cm', e.target.value)}
                                  className="w-24 bg-slate-50 p-1 border border-slate-200 rounded text-[11px] outline-none"
                                />
                              </div>
                            </td>
                          );
                        })
                      )}
                      <td className="p-3 text-right">
                        <button type="button" onClick={() => handleRemoveRow(r.id)} className="text-rose-500 hover:text-rose-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSubTab('all-guides')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Save Size Guide</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SUBTAB 3: SIZE GUIDE TEMPLATES */}
      {subTab === 'templates' && (
        <div className="space-y-6">
          <h3 className="text-base font-extrabold text-slate-900">Pre-Made International Size Guide Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">Lingerie</span>
              <h4 className="font-extrabold text-slate-900 text-base">Women's Bra &amp; Bralette Template</h4>
              <p className="text-xs text-slate-500">Includes India (IN), USA (US), Europe (EU), UK, China (CN) standards with bust and underbust conversions.</p>
              <button type="button" onClick={openCreateForm} className="w-full bg-zinc-900 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                Use Template
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">Apparel</span>
              <h4 className="font-extrabold text-slate-900 text-base">Men's &amp; Unisex T-Shirt Template</h4>
              <p className="text-xs text-slate-500">Standard S, M, L, XL chest and shoulder measurements across India, US, and UK.</p>
              <button type="button" onClick={openCreateForm} className="w-full bg-zinc-900 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                Use Template
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">Bottomwear</span>
              <h4 className="font-extrabold text-slate-900 text-base">Women's Jeans &amp; Trousers Template</h4>
              <p className="text-xs text-slate-500">Waist and hip sizing in cm &amp; inches for waist sizes 26 through 36.</p>
              <button type="button" onClick={openCreateForm} className="w-full bg-zinc-900 text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                Use Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: ASSIGN MAPPINGS */}
      {subTab === 'assignment' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-base font-extrabold text-slate-900">Category &amp; Product Size Guide Mappings</h3>
          <p className="text-xs text-slate-500">Assign a master Size Guide to an entire Category or override for specific individual products.</p>
          <div className="space-y-4">
            {categoriesList.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">No categories available.</div>
            ) : (
              categoriesList.map((cat) => (
                <div key={cat.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{cat.name} Category</h4>
                    <p className="text-[11px] text-slate-500">Applies to all products under {cat.name}</p>
                  </div>
                  <div className="w-56">
                    <Select
                      defaultValue={guides[0]?.id || ''}
                      className="rounded-xl font-bold text-slate-800"
                      options={[
                        { value: guides[0]?.id || 'default', label: guides[0]?.title || 'Size Guide' },
                        { value: 'none', label: '-- No Guide Assigned --' }
                      ]}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
