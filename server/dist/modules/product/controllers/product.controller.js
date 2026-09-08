import { productStore } from "../store/productStore.js";
import { AiProductGeneratorService } from "../services/aiProductGenerator.service.js";
const setNoCache = (res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
};
export class ProductController {
    // GET /api/v1/products (with comprehensive multi-filter, search, sort & pagination)
    static async getAllProducts(req, res) {
        setNoCache(res);
        const hasFilterParams = Boolean(req.query.page ||
            req.query.limit ||
            req.query.search ||
            req.query.category ||
            req.query.subcategory ||
            req.query.brand ||
            req.query.stockStatus ||
            req.query.status ||
            req.query.minPrice ||
            req.query.maxPrice ||
            req.query.dateFilter ||
            req.query.sort);
        await productStore.refreshFromMySQL();
        if (hasFilterParams) {
            const result = productStore.queryProducts({
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
                search: req.query.search,
                category: req.query.category,
                subcategory: req.query.subcategory,
                brand: req.query.brand,
                stockStatus: req.query.stockStatus,
                status: req.query.status,
                minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                dateFilter: req.query.dateFilter,
                sort: req.query.sort
            });
            res.status(200).json({
                success: true,
                ...result
            });
            return;
        }
        const isWebsiteClient = req.query.admin !== "true";
        const products = productStore.getAll(isWebsiteClient);
        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
            items: products,
            products: products,
            total: products.length,
            page: 1,
            limit: products.length,
            totalPages: 1
        });
    }
    // POST /api/v1/products/:id/duplicate
    static async duplicateProduct(req, res) {
        const { id } = req.params;
        const duplicated = await productStore.duplicate(id);
        if (!duplicated) {
            res.status(404).json({ success: false, message: "Product to duplicate not found" });
            return;
        }
        res.status(201).json({
            success: true,
            message: "Product duplicated successfully",
            data: duplicated
        });
    }
    // PATCH /api/v1/products/:id/status
    static async updateStatus(req, res) {
        const { id } = req.params;
        const { status, isPublished } = req.body;
        const updated = await productStore.toggleStatus(id, status !== undefined ? status : (isPublished !== undefined ? (isPublished ? 'Published' : 'Inactive') : undefined));
        if (!updated) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Product status updated successfully",
            data: updated
        });
    }
    // POST /api/v1/products/bulk-delete
    static async bulkDeleteProducts(req, res) {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ success: false, message: "Invalid product IDs array" });
            return;
        }
        const count = await productStore.bulkDelete(ids);
        res.status(200).json({ success: true, count, message: `Successfully deleted ${count} products` });
    }
    // POST /api/v1/products/bulk-status
    static async bulkUpdateStatus(req, res) {
        const { ids, isPublished, status } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ success: false, message: "Invalid product IDs array" });
            return;
        }
        const count = await productStore.bulkStatus(ids, isPublished !== false, status);
        res.status(200).json({ success: true, count, message: `Successfully updated ${count} products` });
    }
    // GET /api/v1/products/export
    static async exportProducts(_req, res) {
        await productStore.refreshFromMySQL();
        const products = productStore.getAll(false);
        res.status(200).json({ success: true, data: products });
    }
    // GET /api/v1/products/:query
    static async getProductByIdOrSlug(req, res) {
        const { query } = req.params;
        await productStore.refreshFromMySQL();
        const product = productStore.getByIdOrSlug(query);
        if (!product) {
            res.status(404).json({
                success: false,
                message: `Product not found for: ${query}`
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: product
        });
    }
    // POST /api/v1/products (Admin API)
    static async createProduct(req, res) {
        try {
            if (!req.body || !req.body.name) {
                res.status(400).json({ success: false, message: "Product Name is required" });
                return;
            }
            const newProduct = await productStore.add(req.body);
            res.status(201).json({
                success: true,
                message: "Product created successfully!",
                data: newProduct
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
    // PUT /api/v1/products/:id (Admin API)
    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const updated = await productStore.update(id, req.body);
            if (!updated) {
                res.status(404).json({
                    success: false,
                    message: "Product not found to update"
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Product updated successfully",
                data: updated
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message
            });
        }
    }
    // DELETE /api/v1/products/:id (Admin API)
    static async deleteProduct(req, res) {
        const { id } = req.params;
        const deleted = await productStore.delete(id);
        if (!deleted) {
            res.status(404).json({
                success: false,
                message: "Product not found to delete"
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    }
    // POST /api/v1/products/ai-generate (AI Image to Product Generator)
    static async generateFromImage(req, res) {
        try {
            const { image, images, hint, apiKey } = req.body;
            const rawImages = Array.isArray(images) && images.length > 0
                ? images
                : (image ? [image] : []);
            if (rawImages.length === 0) {
                res.status(400).json({ success: false, message: "At least one product image is required for AI generation" });
                return;
            }
            const generatedData = await AiProductGeneratorService.generateFromImages(rawImages, hint, apiKey);
            res.status(200).json({
                success: true,
                data: generatedData,
                message: "Product content generated successfully"
            });
        }
        catch (error) {
            console.error("AI Generation error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to generate product details"
            });
        }
    }
}
