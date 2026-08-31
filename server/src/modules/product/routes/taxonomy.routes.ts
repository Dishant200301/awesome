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

const router = Router();

router.get("/categories", getCategories);
router.post("/categories/sync", syncCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);
router.post("/subcategories", createSubcategory);

router.get("/brands", getBrands);
router.post("/brands", createBrand);

router.get("/collections", getCollections);

router.get("/attributes", getAttributes);
router.post("/attributes", createAttribute);
router.post("/attributes/:id/values", addAttributeValue);

export default router;
