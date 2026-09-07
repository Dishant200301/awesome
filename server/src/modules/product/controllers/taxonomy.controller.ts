import { Request, Response } from "express";
import {
  refreshTaxonomiesFromMySQL,
  getBrandsStore,
  getCollectionsStore,
  getAttributesStore,
  createCategoryStore,
  updateCategoryStore,
  deleteCategoryStore,
  createSubcategoryStore,
  updateSubcategoryStore,
  deleteSubcategoryStore,
  createBrandStore,
  createAttributeStore,
  addAttributeValueStore,
  syncAllCategoriesStore
} from "../store/taxonomyStore.js";

const setNoCache = (res: Response) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
};

export const getCategories = async (_req: Request, res: Response) => {
  setNoCache(res);
  try {
    const { categories, subcategories } = await refreshTaxonomiesFromMySQL();
    res.json({ success: true, data: { categories, subcategories } });

  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const syncCategories = async (req: Request, res: Response) => {
  try {
    const list = req.body.categories || req.body;
    const result = await syncAllCategoriesStore(Array.isArray(list) ? list : []);
    res.json({ success: true, message: "Categories synchronized successfully with MySQL!", data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await createCategoryStore(req.body);
    res.status(201).json({ success: true, data: category, message: "Category created and saved to MySQL!" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await updateCategoryStore(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: updated, message: "Category updated in MySQL!" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteCategoryStore(id);
    res.json({ success: deleted, message: deleted ? "Category deleted from MySQL" : "Category not found" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const createSubcategory = async (req: Request, res: Response) => {
  try {
    const sub = await createSubcategoryStore(req.body);
    res.status(201).json({ success: true, data: sub, message: "Subcategory created and saved to MySQL!" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateSubcategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await updateSubcategoryStore(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Subcategory not found" });
    }
    res.json({ success: true, data: updated, message: "Subcategory updated in MySQL!" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteSubcategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteSubcategoryStore(id);
    res.json({ success: deleted, message: deleted ? "Subcategory deleted from MySQL" : "Subcategory not found" });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
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
