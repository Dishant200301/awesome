import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";

const router = Router();

router.get("/", ProductController.getAllProducts);
router.get("/export", ProductController.exportProducts);
router.post("/ai-generate", ProductController.generateFromImage);
router.post("/bulk-delete", ProductController.bulkDeleteProducts);
router.post("/bulk-status", ProductController.bulkUpdateStatus);
router.post("/:id/duplicate", ProductController.duplicateProduct);
router.patch("/:id/status", ProductController.updateStatus);
router.get("/:query", ProductController.getProductByIdOrSlug);
router.post("/", ProductController.createProduct);
router.put("/:id", ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);

export default router;
