import { Router } from "express";
import {
  getCategories,
  syncCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
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
router.get("/categories", getCategories);
router.get("/brands", getBrands);
router.get("/collections", getCollections);
router.get("/attributes", getAttributes);

// Protected Admin Mutation Endpoints
router.post("/categories/sync", authenticateAdmin, syncCategories);
router.post("/categories", authenticateAdmin, createCategory);
router.put("/categories/:id", authenticateAdmin, updateCategory);
router.delete("/categories/:id", authenticateAdmin, deleteCategory);
router.post("/subcategories", authenticateAdmin, createSubcategory);
router.post("/brands", authenticateAdmin, createBrand);
router.post("/attributes", authenticateAdmin, createAttribute);
router.post("/attributes/:id/values", authenticateAdmin, addAttributeValue);

export default router;
