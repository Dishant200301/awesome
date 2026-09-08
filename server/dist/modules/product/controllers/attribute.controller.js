import { attributeStore } from "../store/attributeStore.js";
import { productStore } from "../store/productStore.js";
export class AttributeController {
    static getAllAttributes = (req, res) => {
        try {
            const { usage, status, search } = req.query;
            const attributes = attributeStore.getAll({
                usage: usage,
                status: status,
                search: search
            });
            res.status(200).json({ success: true, data: attributes, count: attributes.length });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    static getAttributeById = (req, res) => {
        try {
            const { id } = req.params;
            const attribute = attributeStore.getById(id);
            if (!attribute) {
                res.status(404).json({ success: false, message: "Attribute not found" });
                return;
            }
            res.status(200).json({ success: true, data: attribute });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    static createAttribute = (req, res) => {
        try {
            const attributeData = req.body;
            if (!attributeData.name) {
                res.status(400).json({ success: false, message: "Attribute name is required" });
                return;
            }
            const newAttribute = attributeStore.create(attributeData);
            res.status(201).json({ success: true, data: newAttribute, message: "Attribute created successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    static updateAttribute = (req, res) => {
        try {
            const { id } = req.params;
            const attributeData = req.body;
            const updated = attributeStore.update(id, attributeData);
            if (!updated) {
                res.status(404).json({ success: false, message: "Attribute not found" });
                return;
            }
            res.status(200).json({ success: true, data: updated, message: "Attribute updated successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    static updateAttributeStatus = (req, res) => {
        try {
            const { id } = req.params;
            const { status, isActive } = req.body;
            const newStatus = status || (isActive !== undefined ? (isActive ? "active" : "inactive") : "active");
            const updated = attributeStore.updateStatus(id, newStatus);
            if (!updated) {
                res.status(404).json({ success: false, message: "Attribute not found" });
                return;
            }
            res.status(200).json({ success: true, data: updated, message: `Attribute status set to ${newStatus}` });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    static deleteAttribute = (req, res) => {
        try {
            const { id } = req.params;
            // Check if attribute is assigned to any existing product
            const allProducts = productStore.getAll();
            let usedCount = 0;
            allProducts.forEach((p) => {
                if (p.productAttributes && Array.isArray(p.productAttributes)) {
                    if (p.productAttributes.some((pa) => pa.attributeId === id || pa.attributeSlug === id)) {
                        usedCount++;
                    }
                }
            });
            if (usedCount > 0) {
                res.status(400).json({
                    success: false,
                    isUsed: true,
                    usedCount,
                    message: `This attribute is currently used by ${usedCount} product(s). Please deactivate it instead of deleting.`
                });
                return;
            }
            const deleted = attributeStore.delete(id);
            if (!deleted) {
                res.status(404).json({ success: false, message: "Attribute not found" });
                return;
            }
            res.status(200).json({ success: true, message: "Attribute deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    // Values Controllers
    static getAttributeValues = (req, res) => {
        try {
            const { id } = req.params;
            const values = attributeStore.getValues(id);
            res.status(200).json({ success: true, data: values, count: values.length });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    static addAttributeValue = (req, res) => {
        try {
            const { id } = req.params;
            const valueData = req.body;
            const newValue = attributeStore.addValue(id, valueData);
            if (!newValue) {
                res.status(404).json({ success: false, message: "Attribute not found" });
                return;
            }
            res.status(201).json({ success: true, data: newValue, message: "Value added successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    static updateAttributeValue = (req, res) => {
        try {
            const { id, valueId } = req.params;
            const valueData = req.body;
            const updatedValue = attributeStore.updateValue(id, valueId, valueData);
            if (!updatedValue) {
                res.status(404).json({ success: false, message: "Attribute or value not found" });
                return;
            }
            res.status(200).json({ success: true, data: updatedValue, message: "Value updated successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    static deleteAttributeValue = (req, res) => {
        try {
            const { id, valueId } = req.params;
            const deleted = attributeStore.deleteValue(id, valueId);
            if (!deleted) {
                res.status(404).json({ success: false, message: "Attribute or value not found" });
                return;
            }
            res.status(200).json({ success: true, message: "Value deleted successfully" });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
