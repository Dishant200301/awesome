import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  ArrowLeft,
  AlertCircle,
  Palette,
  ChevronDown,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import {
  AttributeMaster,
  AttributeValue,
  AttributeDisplayType,
  AttributeUsage
} from '../types/attribute.types';
import { AttributeService } from '../services/attributeService';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { findHexByColorName, getClosestColorName } from '../utils/colorMatcher';

interface AttributesPageProps {
  initialTab?: string;
  onNavigate?: (tab: string) => void;
}

const ATTRIBUTE_TYPES: { label: string; value: AttributeDisplayType }[] = [
  { label: 'Large Text', value: 'TEXTAREA' },
  { label: 'Text', value: 'TEXT' },
  { label: 'Select / Dropdown', value: 'SELECT' },
  { label: 'Color Swatch', value: 'SWATCH' },
  { label: 'Button / Size Pills', value: 'BUTTON' },
  { label: 'Radio / Buttons', value: 'RADIO' },
  { label: 'Checkbox Multi-Select', value: 'CHECKBOX' },
  { label: 'Number', value: 'NUMBER' },
  { label: 'Boolean (Yes/No)', value: 'BOOLEAN' }
];

export const AttributesPage: React.FC<AttributesPageProps> = ({
  initialTab,
  onNavigate
}) => {
  // Main State
  const [attributes, setAttributes] = useState<AttributeMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sub-view: 'all' | 'create' | 'edit'
  const [subView, setSubView] = useState<'all' | 'create' | 'edit'>(
    initialTab === 'add-attribute' ? 'create' : 'all'
  );
  const [editingAttrId, setEditingAttrId] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Form State for Create / Edit Attribute (Matching Design Screenshot)
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDisplayName, setFormDisplayName] = useState('');
  const [formType, setFormType] = useState<AttributeDisplayType>('TEXTAREA');
  const [formUsage, setFormUsage] = useState<AttributeUsage>('BOTH');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [formValues, setFormValues] = useState<AttributeValue[]>([]);

  // Inline Add / Edit Value State (No Modal Popup)
  const [inlineValueInput, setInlineValueInput] = useState('');
  const [inlineHex, setInlineHex] = useState('#800000');
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [editingValueLabel, setEditingValueLabel] = useState('');

  // Validation Error State
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Delete Warning state
  const [deleteWarning, setDeleteWarning] = useState<{
    attrId: string;
    attrName: string;
    usedCount: number;
  } | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<AttributeMaster | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const data = await AttributeService.getAttributes();
      setAttributes(data);
    } catch (e) {
      console.error('Error fetching attributes master:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  useEffect(() => {
    if (initialTab === 'add-attribute') {
      handleOpenCreateView();
    }
  }, [initialTab]);

  // Open Create View
  const handleOpenCreateView = () => {
    setEditingAttrId(null);
    setFormName('');
    setFormSlug('');
    setFormDisplayName('');
    setFormType('TEXTAREA');
    setFormUsage('BOTH');
    setFormStatus('active');
    setFormValues([]);
    setFormErrors({});
    setSubView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Edit View
  const handleOpenEditView = (attr: AttributeMaster) => {
    setEditingAttrId(attr.id);
    setFormName(attr.name);
    setFormSlug(attr.slug);
    setFormDisplayName(attr.displayName || attr.name);
    setFormType(attr.type || 'SELECT');
    setFormUsage(attr.usage || 'BOTH');
    setFormStatus(attr.status || (attr.isActive ? 'active' : 'inactive'));
    setFormValues([...(attr.values || [])]);
    setFormErrors({});
    setSubView('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto-slug on Name change
  const handleNameChange = (val: string) => {
    setFormName(val);
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormSlug(generated);
    if (!formDisplayName || formDisplayName === formName) {
      setFormDisplayName(val);
    }
  };

  // Inline Value Handlers (No Modal)
  const handleAddInlineValue = () => {
    const raw = inlineValueInput.trim();
    if (!raw) return;

    const items = raw.split(',').map((s) => s.trim()).filter(Boolean);
    if (items.length === 0) return;

    const isColorType = formType === 'SWATCH' || formType === 'COLOR' || formName.toLowerCase().includes('color');

    const newItems: AttributeValue[] = items.map((itemLabel, idx) => {
      const slug = itemLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const detectedColor = isColorType ? findHexByColorName(itemLabel) || inlineHex : undefined;

      return {
        id: `val-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        label: itemLabel,
        value: slug || itemLabel,
        colorCode: detectedColor,
        status: 'active',
        sortOrder: formValues.length + idx + 1
      };
    });

    setFormValues((prev) => [...prev, ...newItems]);
    setInlineValueInput('');
  };

  const handleStartEditValue = (v: AttributeValue) => {
    setEditingValueId(v.id);
    setEditingValueLabel(v.label);
  };

  const handleSaveEditValue = (valueId: string) => {
    if (!editingValueLabel.trim()) {
      setEditingValueId(null);
      return;
    }

    const cleanLabel = editingValueLabel.trim();
    const isColorType = formType === 'SWATCH' || formType === 'COLOR' || formName.toLowerCase().includes('color');

    setFormValues((prev) =>
      prev.map((v) =>
        v.id === valueId
          ? {
              ...v,
              label: cleanLabel,
              value: cleanLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
              colorCode: isColorType ? findHexByColorName(cleanLabel) || v.colorCode : v.colorCode
            }
          : v
      )
    );
    setEditingValueId(null);
    setEditingValueLabel('');
  };

  const handleRemoveValue = (valueId: string) => {
    setFormValues((prev) => prev.filter((v) => v.id !== valueId));
  };

  // Form Validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formName.trim()) errors.name = 'Attribute Name is required.';
    if (!formDisplayName.trim()) errors.displayName = 'Display Name is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Attribute
  const handleSaveAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload: AttributeMaster = {
        id: editingAttrId || `attr-${Date.now()}`,
        name: formName.trim(),
        displayName: formDisplayName.trim(),
        slug: formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: formType,
        usage: formUsage,
        showInHighlights: true,
        isRequired: false,
        sortOrder: attributes.length + 1,
        status: formStatus,
        isActive: formStatus === 'active',
        values: formValues
      };

      await AttributeService.saveAttribute(payload);
      await fetchAttributes();
      showToast(
        editingAttrId
          ? 'Attribute updated successfully!'
          : 'Attribute created successfully!'
      );
      setSubView('all');
      setEditingAttrId(null);
    } catch (err: any) {
      console.error('Failed to save attribute:', err);
      alert('Error saving attribute: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (attr: AttributeMaster) => {
    const updatedStatus = attr.status === 'active' || attr.isActive ? 'inactive' : 'active';
    await AttributeService.updateStatus(attr.id, updatedStatus);
    fetchAttributes();
    showToast(`Attribute marked ${updatedStatus}`);
  };

  // Delete Attribute
  const handleDeleteAttribute = (attr: AttributeMaster) => {
    setDeleteCandidate(attr);
  };

  const confirmDeleteAttribute = async () => {
    if (!deleteCandidate) return;
    const res = await AttributeService.deleteAttribute(deleteCandidate.id);
    if (!res.success && res.isUsed) {
      setDeleteWarning({
        attrId: deleteCandidate.id,
        attrName: deleteCandidate.name,
        usedCount: res.usedCount || 0
      });
      setDeleteCandidate(null);
      return;
    }
    fetchAttributes();
    showToast('Attribute deleted');
    if (editingAttrId === deleteCandidate.id) {
      setSubView('all');
    }
    setDeleteCandidate(null);
  };

  // Filtered attributes list
  const filteredAttributes = attributes.filter((attr) => {
    const matchesSearch =
      attr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attr.displayName && attr.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      attr.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (attr.values &&
        attr.values.some(
          (v) =>
            v.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.value.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    const matchesType = filterType === 'All' || attr.type === filterType;
    const isAct = attr.status ? attr.status === 'active' : attr.isActive;
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Active' && isAct) ||
      (filterStatus === 'Inactive' && !isAct);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="font-sans text-neutral-900 bg-[#fbfbfc] min-h-screen pb-24 selection:bg-black selection:text-white">
      {/* SUCCESS TOAST */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-neutral-950 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-neutral-800 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CREATE / EDIT ATTRIBUTE VIEW (EXACT REPLICA OF DESIGN SCREENSHOT) */}
      {/* ========================================================================= */}
      {subView === 'create' || subView === 'edit' ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* HEADER BAR */}
          <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSubView('all')}
                className="h-8 w-8 rounded-lg border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition-colors cursor-pointer"
                title="Back to All Attributes"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h1 className="text-base sm:text-lg font-bold text-neutral-950 tracking-tight">
                {subView === 'edit' ? `Edit Attribute: ${formName}` : 'Create New Attribute'}
              </h1>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubView('all')}
              className="text-xs border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              All Attributes ({attributes.length})
            </Button>
          </div>

          {/* VALIDATION ERRORS */}
          {Object.keys(formErrors).length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Please fix the following:</span>
                <ul className="list-disc list-inside space-y-0.5 text-rose-700">
                  {Object.values(formErrors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveAttribute} className="space-y-10">
            {/* SECTION 1: ATTRIBUTE DETAILS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start border-b border-neutral-200/80 pb-10">
              <div className="lg:col-span-3 space-y-1">
                <h2 className="text-sm font-bold text-neutral-900 tracking-tight">Attribute</h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Add your attribute name and necessary information from here
                </p>
              </div>

              <div className="lg:col-span-9">
                <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs p-6 space-y-5">
                  {/* Name* */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">
                      Name<span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 transition-all"
                    />
                  </div>

                  {/* Slug (Read-only / Auto-generated Gray Input) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2 text-xs text-neutral-700 bg-neutral-100/80 border border-neutral-200 rounded-lg focus:outline-none font-mono"
                    />
                  </div>

                  {/* Display Name* */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">
                      Display Name<span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formDisplayName}
                      onChange={(e) => setFormDisplayName(e.target.value)}
                      placeholder=""
                      className="w-full px-3.5 py-2 text-xs text-neutral-900 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 transition-all"
                    />
                  </div>

                  {/* Attribute Type* with Clear 'x' and Dropdown icon */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700">
                      Attribute Type<span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as AttributeDisplayType)}
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs text-neutral-800 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 transition-all appearance-none cursor-pointer"
                      >
                        {ATTRIBUTE_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>

                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-neutral-400">
                        {formType && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormType('TEXTAREA');
                            }}
                            className="pointer-events-auto hover:text-neutral-700 cursor-pointer p-0.5"
                            title="Reset type"
                          >
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: ATTRIBUTE VALUES (INLINE ADDER - NO POPUP) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start border-b border-neutral-200/80 pb-10">
              <div className="lg:col-span-3 space-y-1">
                <h2 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Attribute Values
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Type values below and press Enter or click Add. Comma-separated values supported.
                </p>
              </div>

              <div className="lg:col-span-9">
                <div className="bg-white rounded-xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
                  {/* Inline Value Input Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {(formType === 'SWATCH' || formType === 'COLOR' || formName.toLowerCase().includes('color')) && (
                      <div className="flex items-center gap-1.5 p-1 bg-neutral-50 border border-neutral-200 rounded-lg shrink-0">
                        <input
                          type="color"
                          value={inlineHex}
                          onChange={(e) => {
                            setInlineHex(e.target.value);
                            const match = getClosestColorName(e.target.value);
                            if (!inlineValueInput) setInlineValueInput(match.name);
                          }}
                          className="w-7 h-7 rounded border-0 cursor-pointer p-0 bg-transparent"
                          title="Click to pick swatch color"
                        />
                        <span className="font-mono text-[10px] text-neutral-600 font-bold uppercase pr-1">{inlineHex}</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-[200px] relative">
                      <input
                        type="text"
                        value={inlineValueInput}
                        onChange={(e) => setInlineValueInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddInlineValue();
                          }
                        }}
                        placeholder="Enter value (e.g. Orange, Blue, 14K Gold, Small) or multiple comma-separated..."
                        className="w-full px-3.5 py-2 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-black font-medium"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleAddInlineValue}
                      className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-5 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Value</span>
                    </button>
                  </div>

                  {/* Configured Values List */}
                  {formValues.length > 0 ? (
                    <div className="pt-2 space-y-2 border-t border-neutral-100">
                      <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
                        <span>Configured Values ({formValues.length}):</span>
                        <button
                          type="button"
                          onClick={() => setFormValues([])}
                          className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                        >
                          Clear all
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {formValues.map((v) => {
                          const isEditing = editingValueId === v.id;

                          return (
                            <div
                              key={v.id}
                              className="inline-flex items-center gap-2 bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs px-3 py-1.5 rounded-lg font-medium shadow-2xs group"
                            >
                              {v.colorCode ? (
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs shrink-0"
                                  style={{ backgroundColor: v.colorCode }}
                                />
                              ) : (formType === 'SWATCH' || formType === 'COLOR' || formName.toLowerCase().includes('color')) ? (
                                <span
                                  className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs shrink-0"
                                  style={{ backgroundColor: findHexByColorName(v.label) }}
                                />
                              ) : null}

                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={editingValueLabel}
                                    onChange={(e) => setEditingValueLabel(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveEditValue(v.id);
                                      }
                                    }}
                                    className="px-1.5 py-0.5 text-xs bg-white border border-neutral-300 rounded font-medium outline-none w-28"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditValue(v.id)}
                                    className="text-emerald-600 hover:text-emerald-700 p-0.5 cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <span
                                  onDoubleClick={() => handleStartEditValue(v)}
                                  className="cursor-pointer"
                                  title="Double click to edit"
                                >
                                  {v.label}
                                </span>
                              )}

                              {!isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEditValue(v)}
                                  className="text-neutral-400 hover:text-neutral-800 ml-0.5 cursor-pointer opacity-70 group-hover:opacity-100"
                                  title="Edit"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveValue(v.id)}
                                className="text-neutral-400 hover:text-rose-600 cursor-pointer ml-0.5"
                                title="Remove"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 italic pt-1">
                      No values added yet. Type a value name above and click "Add Value" or press Enter.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* BOTTOM RIGHT ACTION BUTTON */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{subView === 'edit' ? 'Update Attribute' : 'Add Attribute'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ========================================================================= */
        /* ALL ATTRIBUTES TABLE LIST VIEW */
        /* ========================================================================= */
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* TOP HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-neutral-200 shadow-2xs">
            <div>
              <h1 className="text-base sm:text-lg font-bold text-black tracking-tight flex items-center gap-2">
                <Sliders className="w-5 h-5 text-black" />
                <span>Attributes Master Management</span>
                <Badge
                  variant="secondary"
                  className="text-xs font-semibold bg-neutral-100 text-neutral-800 border-neutral-200"
                >
                  {attributes.length} Attributes
                </Badge>
              </h1>
              <p className="text-xs text-neutral-500 font-normal mt-1">
                Manage global attributes (Material, Metal Color, Size, Diamond Clarity, Style) and preset values.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleOpenCreateView}
                size="sm"
                className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Attribute</span>
              </Button>
            </div>
          </div>

          {/* DELETE WARNING MODAL */}
          {deleteWarning && (
            <Card className="p-6 bg-amber-50 border border-amber-200 rounded-xl space-y-4 font-sans animate-in fade-in">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-900">
                    Cannot Permanently Delete Attribute
                  </h3>
                  <p className="text-xs text-amber-800 mt-1">
                    <strong>"{deleteWarning.attrName}"</strong> is currently used by{' '}
                    <strong>{deleteWarning.usedCount} product(s)</strong>. To protect catalog data,
                    please <strong>Deactivate</strong> this attribute instead.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    await AttributeService.updateStatus(deleteWarning.attrId, 'inactive');
                    setDeleteWarning(null);
                    fetchAttributes();
                  }}
                  className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold"
                >
                  Deactivate Attribute Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteWarning(null)}
                  className="text-xs border-amber-300 text-amber-900 hover:bg-amber-100 font-medium"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* SEARCH & FILTERS */}
          <Card className="p-4 bg-white border border-neutral-200 rounded-xl space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search attribute name, slug, or values..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs bg-white border-neutral-200 text-black"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-neutral-500">Type:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-xs bg-white border border-neutral-200 rounded-md px-2.5 py-1 text-neutral-800 outline-none"
                >
                  <option value="All">All Types</option>
                  {ATTRIBUTE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-neutral-500">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs bg-white border border-neutral-200 rounded-md px-2.5 py-1 text-neutral-800 outline-none"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </Card>

          {/* ATTRIBUTES TABLE */}
          {loading ? (
            <div className="min-h-[200px] flex items-center justify-center bg-white rounded-xl border border-neutral-200">
              <RefreshCw className="w-6 h-6 animate-spin text-neutral-800" />
            </div>
          ) : filteredAttributes.length === 0 ? (
            <Card className="p-12 text-center space-y-3 bg-white border-neutral-200 rounded-xl">
              <Sliders className="w-8 h-8 text-neutral-400 mx-auto" />
              <h4 className="text-sm font-bold text-black">No Attributes Found</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No attributes match your filter. Click below to create your first attribute.
              </p>
              <Button
                onClick={handleOpenCreateView}
                size="sm"
                className="bg-black text-white text-xs font-semibold mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Attribute</span>
              </Button>
            </Card>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans border-collapse">
                  <thead>
                    <tr className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-700 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-4">Name</th>
                      <th className="p-4">Display Name</th>
                      <th className="p-4">Slug</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Defined Values</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredAttributes.map((attr) => {
                      const isAct = attr.status ? attr.status === 'active' : attr.isActive;
                      return (
                        <tr key={attr.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="p-4">
                            <span className="font-bold text-neutral-900">{attr.name}</span>
                          </td>
                          <td className="p-4 text-neutral-700 font-medium">
                            {attr.displayName || attr.name}
                          </td>
                          <td className="p-4 font-mono text-neutral-500 text-[11px]">
                            {attr.slug}
                          </td>
                          <td className="p-4">
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase font-semibold bg-neutral-50 text-neutral-800 border-neutral-200"
                            >
                              {attr.type}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {attr.values && attr.values.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {attr.values.slice(0, 4).map((v) => (
                                  <span
                                    key={v.id}
                                    className="text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200"
                                  >
                                    {v.label}
                                  </span>
                                ))}
                                {attr.values.length > 4 && (
                                  <span className="text-[10px] text-neutral-400 font-medium self-center">
                                    +{attr.values.length - 4} more
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-neutral-400 italic">None</span>
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(attr)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                                isAct
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
                              }`}
                            >
                              {isAct ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEditView(attr)}
                                className="h-7 px-2.5 text-xs text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                                title="Edit Attribute"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteAttribute(attr)}
                                className="h-7 px-2.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                                title="Delete Attribute"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REUSABLE DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteCandidate)}
        title="Delete Attribute Master?"
        itemName={deleteCandidate ? `${deleteCandidate.name} (${deleteCandidate.displayName || deleteCandidate.slug})` : undefined}
        onConfirm={confirmDeleteAttribute}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};

export default AttributesPage;
