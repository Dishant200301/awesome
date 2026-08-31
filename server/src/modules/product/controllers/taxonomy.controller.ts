import { Request, Response } from "express";
import {
  getCategoriesStore,
  getSubcategoriesStore,
  getBrandsStore,
  getCollectionsStore,
  getAttributesStore,
  createCategoryStore,
  updateCategoryStore,
  deleteCategoryStore,
  createSubcategoryStore,
  createBrandStore,
  createAttributeStore,
  addAttributeValueStore,
  syncAllCategoriesStore
} from "../store/taxonomyStore.js";

export const getCategories = (_req: Request, res: Response) => {
  const cats = getCategoriesStore();
  const subs = getSubcategoriesStore();
  res.json({ success: true, data: { categories: cats, subcategories: subs } });
};

export const syncCategories = (req: Request, res: Response) => {
  const list = req.body.categories || req.body;
  const result = syncAllCategoriesStore(Array.isArray(list) ? list : []);
  res.json({ success: true, message: "Categories synchronized successfully!", data: result });
};

export const createCategory = (req: Request, res: Response) => {
  const category = createCategoryStore(req.body);
  res.status(201).json({ success: true, data: category });
};

export const updateCategory = (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = updateCategoryStore(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Category not found" });
  }
  res.json({ success: true, data: updated });
};

export const deleteCategory = (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = deleteCategoryStore(id);
  res.json({ success: deleted, message: deleted ? "Category deleted" : "Category not found" });
};

export const createSubcategory = (req: Request, res: Response) => {
  const sub = createSubcategoryStore(req.body);
  res.status(201).json({ success: true, data: sub });
};

export const getBrands = (_req: Request, res: Response) => {
  res.json({ success: true, data: getBrandsStore() });
};

export const createBrand = (req: Request, res: Response) => {
  const brand = createBrandStore(req.body);
  res.status(201).json({ success: true, data: brand });
};

export const getCollections = (_req: Request, res: Response) => {
  res.json({ success: true, data: getCollectionsStore() });
};

export const getAttributes = (_req: Request, res: Response) => {
  res.json({ success: true, data: getAttributesStore() });
};

export const createAttribute = (req: Request, res: Response) => {
  const attr = createAttributeStore(req.body);
  res.status(201).json({ success: true, data: attr });
};

export const addAttributeValue = (req: Request, res: Response) => {
  const { id } = req.params;
  const { value } = req.body;
  const updated = addAttributeValueStore(id, value);
  if (!updated) {
    return res.status(404).json({ success: false, message: "Attribute not found" });
  }
  res.json({ success: true, data: updated });
};
