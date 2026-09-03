import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";
import { authenticateAdmin } from "../../auth/middleware/auth.middleware.js";

const router = Router();

// Public Storefront Routes
router.get("/", ProductController.getAllProducts);
router.get("/:query", ProductController.getProductByIdOrSlug);

// Protected Admin Management Routes
router.get("/export", authenticateAdmin, ProductController.exportProducts);
router.post("/ai-generate", authenticateAdmin, ProductController.generateFromImage);
router.post("/bulk-delete", authenticateAdmin, ProductController.bulkDeleteProducts);
router.post("/bulk-status", authenticateAdmin, ProductController.bulkUpdateStatus);
router.post("/:id/duplicate", authenticateAdmin, ProductController.duplicateProduct);
router.patch("/:id/status", authenticateAdmin, ProductController.updateStatus);
router.post("/", authenticateAdmin, ProductController.createProduct);
router.put("/:id", authenticateAdmin, ProductController.updateProduct);
router.delete("/:id", authenticateAdmin, ProductController.deleteProduct);

export default router;
