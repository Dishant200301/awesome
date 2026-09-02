import { AttributeMaster, AttributeValue } from '../types/attribute.types';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1')}/attributes`;
const LOCAL_STORAGE_KEY = 'awesome_admin_attribute_master_v3';

export const INITIAL_DEFAULT_ATTRIBUTES: AttributeMaster[] = [
  {
    id: "attr-color",
    name: "Color",
    slug: "color",
    type: "SWATCH",
    usage: "BOTH",
    showInHighlights: true,
    isRequired: true,
    sortOrder: 1,
    status: "active",
    isActive: true,
    values: [
      { id: "val-c1", attributeId: "attr-color", label: "Maroon", value: "Maroon", colorCode: "#800000", status: "active", sortOrder: 1 },
      { id: "val-c2", attributeId: "attr-color", label: "Gold", value: "Gold", colorCode: "#D4AF37", status: "active", sortOrder: 2 },
      { id: "val-c3", attributeId: "attr-color", label: "Royal Blue", value: "Royal Blue", colorCode: "#4169E1", status: "active", sortOrder: 3 },
      { id: "val-c4", attributeId: "attr-color", label: "Emerald Green", value: "Emerald Green", colorCode: "#50C878", status: "active", sortOrder: 4 },
      { id: "val-c5", attributeId: "attr-color", label: "Pink", value: "Pink", colorCode: "#FF69B4", status: "active", sortOrder: 5 },
      { id: "val-c6", attributeId: "attr-color", label: "Yellow", value: "Yellow", colorCode: "#FFD700", status: "active", sortOrder: 6 },
      { id: "val-c7", attributeId: "attr-color", label: "Red", value: "Red", colorCode: "#DC2626", status: "active", sortOrder: 7 },
      { id: "val-c8", attributeId: "attr-color", label: "White", value: "White", colorCode: "#FFFFFF", status: "active", sortOrder: 8 },
      { id: "val-c9", attributeId: "attr-color", label: "Black", value: "Black", colorCode: "#18181B", status: "active", sortOrder: 9 },
      { id: "val-c10", attributeId: "attr-color", label: "Purple", value: "Purple", colorCode: "#9333EA", status: "active", sortOrder: 10 }
    ]
  },
  {
    id: "attr-size",
    name: "Size",
    slug: "size",
    type: "BUTTON",
    usage: "BOTH",
    showInHighlights: true,
    isRequired: true,
    sortOrder: 2,
    status: "active",
    isActive: true,
    values: [
      { id: "val-s1", attributeId: "attr-size", label: "Standard Pair", value: "Standard Pair", status: "active", sortOrder: 1 },
      { id: "val-s2", attributeId: "attr-size", label: "Free Size", value: "Free Size", status: "active", sortOrder: 2 },
      { id: "val-s3", attributeId: "attr-size", label: "S", value: "S", status: "active", sortOrder: 3 },
      { id: "val-s4", attributeId: "attr-size", label: "M", value: "M", status: "active", sortOrder: 4 },
      { id: "val-s5", attributeId: "attr-size", label: "L", value: "L", status: "active", sortOrder: 5 },
      { id: "val-s6", attributeId: "attr-size", label: "XL", value: "XL", status: "active", sortOrder: 6 }
    ]
  },
  {
    id: "attr-material",
    name: "Material",
    slug: "material",
    type: "SELECT",
    usage: "BOTH",
    showInHighlights: true,
    isRequired: false,
    sortOrder: 3,
    status: "active",
    isActive: true,
    values: [
      { id: "val-m1", attributeId: "attr-material", label: "Silk Thread & Pearls", value: "Silk Thread & Pearls", status: "active", sortOrder: 1 },
      { id: "val-m2", attributeId: "attr-material", label: "Mirror & Glass Beads", value: "Mirror & Glass Beads", status: "active", sortOrder: 2 },
      { id: "val-m3", attributeId: "attr-material", label: "Macrame Cotton Cord", value: "Macrame Cotton Cord", status: "active", sortOrder: 3 },
      { id: "val-m4", attributeId: "attr-material", label: "Brass & Ghungroo", value: "Brass & Ghungroo", status: "active", sortOrder: 4 },
      { id: "val-m5", attributeId: "attr-material", label: "Velvet & Zari", value: "Velvet & Zari", status: "active", sortOrder: 5 }
    ]
  },
  {
    id: "attr-craft",
    name: "Craft Technique",
    slug: "craft-technique",
    type: "SELECT",
    usage: "PRODUCT",
    showInHighlights: true,
    isRequired: false,
    sortOrder: 4,
    status: "active",
    isActive: true,
    values: [
      { id: "val-cr1", attributeId: "attr-craft", label: "Kutchi Mirror Embroidery", value: "Kutchi Mirror Embroidery", status: "active", sortOrder: 1 },
      { id: "val-cr2", attributeId: "attr-craft", label: "Hand-knotted Macrame", value: "Hand-knotted Macrame", status: "active", sortOrder: 2 },
      { id: "val-cr3", attributeId: "attr-craft", label: "Thread Tassel Weaving", value: "Thread Tassel Weaving", status: "active", sortOrder: 3 },
      { id: "val-cr4", attributeId: "attr-craft", label: "Handcrafted Beading", value: "Handcrafted Beading", status: "active", sortOrder: 4 }
    ]
  },
  {
    id: "attr-occasion",
    name: "Occasion",
    slug: "occasion",
    type: "SELECT",
    usage: "BOTH",
    showInHighlights: true,
    isRequired: false,
    sortOrder: 5,
    status: "active",
    isActive: true,
    values: [
      { id: "val-oc1", attributeId: "attr-occasion", label: "Navratri Garba", value: "Navratri Garba", status: "active", sortOrder: 1 },
      { id: "val-oc2", attributeId: "attr-occasion", label: "Wedding & Festive", value: "Wedding & Festive", status: "active", sortOrder: 2 },
      { id: "val-oc3", attributeId: "attr-occasion", label: "Ethnic Daily", value: "Ethnic Daily", status: "active", sortOrder: 3 },
      { id: "val-oc4", attributeId: "attr-occasion", label: "Gift Hamper", value: "Gift Hamper", status: "active", sortOrder: 4 }
    ]
  }
];

export class AttributeService {
  private static getLocalAttributes(): AttributeMaster[] {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEFAULT_ATTRIBUTES));
    return [...INITIAL_DEFAULT_ATTRIBUTES];
  }

  private static saveLocalAttributes(attributes: AttributeMaster[], dispatchSync: boolean = true): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(attributes));
      if (dispatchSync && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('awesome_attribute_sync'));
        window.dispatchEvent(new CustomEvent('aaramly_attribute_sync'));
      }
    } catch (e) {}
  }

  public static async getAttributes(params?: { usage?: string; status?: string; search?: string }): Promise<AttributeMaster[]> {
    try {
      const query = new URLSearchParams();
      if (params?.usage) query.append('usage', params.usage);
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE_URL}?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          this.saveLocalAttributes(json.data, false);
          return json.data;
        }
      }
    } catch (error) {
      console.warn('[AttributeService] Backend API not reachable, loading from LocalStorage.');
    }

    let list = this.getLocalAttributes();
    if (params?.usage && params.usage !== 'All') {
      list = list.filter((a) => a.usage === params.usage || a.usage === 'BOTH');
    }
    if (params?.status && params.status !== 'All') {
      const isAct = params.status === 'Active' || params.status === 'active';
      list = list.filter((a) => (a.status ? a.status === 'active' : a.isActive) === isAct);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          (a.values && a.values.some((v) => v.label.toLowerCase().includes(q) || v.value.toLowerCase().includes(q)))
      );
    }
    return list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  public static async saveAttribute(attributeData: Partial<AttributeMaster>): Promise<AttributeMaster> {
    try {
      const isEdit = !!attributeData.id && !attributeData.id.startsWith('temp-');
      const url = isEdit ? `${API_BASE_URL}/${attributeData.id}` : API_BASE_URL;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attributeData)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const local = this.getLocalAttributes();
          const idx = local.findIndex((a) => a.id === json.data.id);
          if (idx !== -1) local[idx] = json.data;
          else local.push(json.data);
          this.saveLocalAttributes(local);
          return json.data;
        }
      }
    } catch (e) {}

    const local = this.getLocalAttributes();
    const slug = attributeData.slug || (attributeData.name || 'new-attr')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const savedAttr: AttributeMaster = {
      id: attributeData.id || `attr-${Date.now()}`,
      name: attributeData.name || 'New Attribute',
      slug,
      type: attributeData.type || 'SELECT',
      usage: attributeData.usage || 'PRODUCT',
      showInHighlights: attributeData.showInHighlights !== undefined ? attributeData.showInHighlights : true,
      isRequired: attributeData.isRequired !== undefined ? attributeData.isRequired : false,
      sortOrder: attributeData.sortOrder || local.length + 1,
      status: attributeData.status || 'active',
      isActive: attributeData.status ? attributeData.status === 'active' : true,
      values: attributeData.values || []
    };

    const idx = local.findIndex((a) => a.id === savedAttr.id);
    if (idx !== -1) {
      local[idx] = savedAttr;
    } else {
      local.unshift(savedAttr);
    }
    this.saveLocalAttributes(local);
    return savedAttr;
  }

  public static async updateStatus(id: string, status: 'active' | 'inactive'): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, isActive: status === 'active' })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const local = this.getLocalAttributes();
          const attr = local.find((a) => a.id === id);
          if (attr) {
            attr.status = status;
            attr.isActive = status === 'active';
            this.saveLocalAttributes(local);
          }
          return true;
        }
      }
    } catch (e) {}

    const local = this.getLocalAttributes();
    const attr = local.find((a) => a.id === id);
    if (attr) {
      attr.status = status;
      attr.isActive = status === 'active';
      this.saveLocalAttributes(local);
      return true;
    }
    return false;
  }

  public static async deleteAttribute(id: string): Promise<{ success: boolean; isUsed?: boolean; usedCount?: number; message?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        const local = this.getLocalAttributes().filter((a) => a.id !== id);
        this.saveLocalAttributes(local);
        return { success: true };
      } else {
        return { success: false, isUsed: json.isUsed, usedCount: json.usedCount, message: json.message };
      }
    } catch (e) {}

    const local = this.getLocalAttributes().filter((a) => a.id !== id);
    this.saveLocalAttributes(local);
    return { success: true };
  }

  // Value CRUD Methods
  public static async addValue(attributeId: string, valueData: Partial<AttributeValue>): Promise<AttributeValue | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/${attributeId}/values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valueData)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {}

    const local = this.getLocalAttributes();
    const attr = local.find((a) => a.id === attributeId);
    if (!attr) return null;

    const newVal: AttributeValue = {
      id: valueData.id || `val-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      attributeId: attr.id,
      label: valueData.label || valueData.value || 'New Value',
      value: valueData.value || valueData.label || 'New Value',
      colorCode: valueData.colorCode,
      status: valueData.status || 'active',
      sortOrder: valueData.sortOrder || attr.values.length + 1
    };

    attr.values.push(newVal);
    this.saveLocalAttributes(local);
    return newVal;
  }
}
