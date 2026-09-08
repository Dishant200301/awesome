import fs from "fs";
import path from "path";
export const INITIAL_ATTRIBUTES = [
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
const DB_FILE_PATH = path.join(process.cwd(), "attributes_db.json");
class AttributeStore {
    attributes = [];
    constructor() {
        this.loadFromDisk();
    }
    loadFromDisk() {
        try {
            if (fs.existsSync(DB_FILE_PATH)) {
                const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    this.attributes = parsed;
                    return;
                }
            }
        }
        catch (e) {
            console.warn("[AttributeStore] Could not read attributes_db.json, using defaults.");
        }
        this.attributes = [...INITIAL_ATTRIBUTES];
        this.saveToDisk();
    }
    saveToDisk() {
        try {
            fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.attributes, null, 2), "utf-8");
        }
        catch (e) {
            console.error("[AttributeStore] Failed to write attributes_db.json:", e);
        }
    }
    getAll(params) {
        let list = [...this.attributes];
        if (params?.usage && params.usage !== "All") {
            list = list.filter((a) => a.usage === params.usage || a.usage === "BOTH");
        }
        if (params?.status && params.status !== "All") {
            const activeBool = params.status === "Active" || params.status === "active";
            list = list.filter((a) => (a.status ? a.status === "active" : a.isActive) === activeBool);
        }
        if (params?.search) {
            const q = params.search.toLowerCase();
            list = list.filter((a) => a.name.toLowerCase().includes(q) ||
                a.slug.toLowerCase().includes(q) ||
                (a.values && a.values.some((v) => v.label.toLowerCase().includes(q) || v.value.toLowerCase().includes(q))));
        }
        list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        return list;
    }
    getById(id) {
        return this.attributes.find((a) => a.id === id || a.slug === id);
    }
    create(data) {
        const slug = data.slug || (data.name || "new-attribute")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        const newAttr = {
            id: data.id || `attr-${Date.now()}`,
            name: data.name || "New Attribute",
            slug,
            type: data.type || "SELECT",
            usage: data.usage || "PRODUCT",
            showInHighlights: data.showInHighlights !== undefined ? data.showInHighlights : true,
            isRequired: data.isRequired !== undefined ? data.isRequired : false,
            sortOrder: data.sortOrder || this.attributes.length + 1,
            status: data.status || "active",
            isActive: data.status ? data.status === "active" : true,
            values: data.values || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.attributes.push(newAttr);
        this.saveToDisk();
        return newAttr;
    }
    update(id, data) {
        const idx = this.attributes.findIndex((a) => a.id === id);
        if (idx === -1)
            return null;
        const existing = this.attributes[idx];
        const updatedStatus = data.status || (data.isActive !== undefined ? (data.isActive ? "active" : "inactive") : existing.status);
        const updated = {
            ...existing,
            ...data,
            status: updatedStatus,
            isActive: updatedStatus === "active",
            values: data.values ? data.values : existing.values,
            updatedAt: new Date().toISOString()
        };
        this.attributes[idx] = updated;
        this.saveToDisk();
        return updated;
    }
    updateStatus(id, status) {
        return this.update(id, { status, isActive: status === 'active' });
    }
    delete(id) {
        const len = this.attributes.length;
        this.attributes = this.attributes.filter((a) => a.id !== id);
        const deleted = this.attributes.length < len;
        if (deleted)
            this.saveToDisk();
        return deleted;
    }
    // Value CRUD
    getValues(attributeId) {
        const attr = this.getById(attributeId);
        return attr ? attr.values.sort((a, b) => a.sortOrder - b.sortOrder) : [];
    }
    addValue(attributeId, valueData) {
        const attr = this.getById(attributeId);
        if (!attr)
            return null;
        const newVal = {
            id: valueData.id || `val-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            attributeId: attr.id,
            label: valueData.label || valueData.value || "New Value",
            value: valueData.value || valueData.label || "New Value",
            colorCode: valueData.colorCode,
            status: valueData.status || "active",
            sortOrder: valueData.sortOrder || attr.values.length + 1
        };
        attr.values.push(newVal);
        this.update(attr.id, { values: attr.values });
        return newVal;
    }
    updateValue(attributeId, valueId, valueData) {
        const attr = this.getById(attributeId);
        if (!attr)
            return null;
        const valIdx = attr.values.findIndex((v) => v.id === valueId);
        if (valIdx === -1)
            return null;
        const updatedVal = {
            ...attr.values[valIdx],
            ...valueData
        };
        attr.values[valIdx] = updatedVal;
        this.update(attr.id, { values: attr.values });
        return updatedVal;
    }
    deleteValue(attributeId, valueId) {
        const attr = this.getById(attributeId);
        if (!attr)
            return false;
        const initialLen = attr.values.length;
        attr.values = attr.values.filter((v) => v.id !== valueId);
        if (attr.values.length < initialLen) {
            this.update(attr.id, { values: attr.values });
            return true;
        }
        return false;
    }
}
export const attributeStore = new AttributeStore();
