import { Router } from "express";
import {
  getCategories,
  syncCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getBrands,
  createBrand,
  getCollections,
  getAttributes,
  createAttribute,
  addAttributeValue
} from "../controllers/taxonomy.controller.js";
import { authenticateAdmin } from "../../auth/middleware/auth.middleware.js";

const router = Router();

// Public Read Endpoints
router.get("/", getCategories);
router.get("/categories", getCategories);
router.get("/brands", getBrands);
router.get("/collections", getCollections);
router.get("/attributes", getAttributes);

// Protected Admin Mutation Endpoints
router.post("/categories/sync", authenticateAdmin, syncCategories);
router.post("/sync", authenticateAdmin, syncCategories);
router.post("/", authenticateAdmin, createCategory);
router.post("/categories", authenticateAdmin, createCategory);
router.put("/:id", authenticateAdmin, updateCategory);
router.put("/categories/:id", authenticateAdmin, updateCategory);
router.delete("/:id", authenticateAdmin, deleteCategory);
router.delete("/categories/:id", authenticateAdmin, deleteCategory);

router.post("/subcategories", authenticateAdmin, createSubcategory);
router.put("/subcategories/:id", authenticateAdmin, updateSubcategory);
router.delete("/subcategories/:id", authenticateAdmin, deleteSubcategory);

router.post("/brands", authenticateAdmin, createBrand);
router.post("/attributes", authenticateAdmin, createAttribute);
router.post("/attributes/:id/values", authenticateAdmin, addAttributeValue);

export default router;
