import fs from "fs";
import path from "path";
import { getCategoriesStore, getSubcategoriesStore } from "./taxonomyStore.js";
import { productStore } from "./productStore.js";
const DEFAULT_COLORS = [
    { name: "Maroon", hex: "#520618" },
    { name: "Royal Gold", hex: "#C89B3C" },
    { name: "Emerald Green", hex: "#1A5235" },
    { name: "Peacock Blue", hex: "#004F7A" },
    { name: "Blush Pink", hex: "#E1306C" },
    { name: "Pure White", hex: "#FFFFFF" },
    { name: "Jet Black", hex: "#000000" },
    { name: "Golden", hex: "#D4AF37" },
    { name: "Red", hex: "#DC2626" },
    { name: "Purple", hex: "#9333EA" }
];
const DEFAULT_SIZES = [
    "Free Size",
    "Standard Pair",
    "S",
    "M",
    "L",
    "XL",
    "Kids (2-4 Yrs)",
    "Kids (5-8 Yrs)"
];
const DB_FILE_PATH = path.join(process.cwd(), "filters_db.json");
class FilterStore {
    filterData;
    constructor() {
        this.filterData = this.buildDynamicFilterData();
        this.loadFromDisk();
        this.refreshFilters();
    }
    buildDynamicFilterData() {
        let rawCats = [];
        let rawSubs = [];
        try {
            rawCats = getCategoriesStore().filter((c) => c.isActive !== false);
            rawSubs = getSubcategoriesStore().filter((s) => s.isActive !== false);
        }
        catch (e) { }
        const subcategories = rawSubs.map((s) => ({
            id: s.id,
            categoryId: s.categoryId || s.parentId || "",
            categoryName: s.categoryName || s.parentName || "",
            name: s.name,
            slug: s.slug || (s.name ? s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : ""),
        }));
        const categories = rawCats.map((c) => {
            const parentSubs = subcategories.filter((s) => s.categoryId === c.id || (s.categoryName && c.name && s.categoryName.toLowerCase() === c.name.toLowerCase()));
            return {
                id: c.id,
                name: c.name,
                slug: c.slug || (c.name ? c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : ""),
                key: c.name,
                subcategories: parentSubs,
            };
        });
        // Dynamic price min/max from actual products
        let minPrice = 0;
        let maxPrice = 3000;
        try {
            const prods = productStore.getAll(true);
            const prices = prods.map((p) => Number(p.price) || 0).filter((pr) => pr > 0);
            if (prices.length > 0) {
                minPrice = Math.min(...prices, 0);
                maxPrice = Math.max(...prices, 2000);
            }
        }
        catch (e) { }
        return {
            categories,
            subcategories,
            colors: [...DEFAULT_COLORS],
            sizes: [...DEFAULT_SIZES],
            minPrice,
            maxPrice,
            ratings: [5, 4, 3, 2, 1],
        };
    }
    loadFromDisk() {
        try {
            if (fs.existsSync(DB_FILE_PATH)) {
                const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === "object") {
                    if (Array.isArray(parsed.colors) && parsed.colors.length > 0) {
                        this.filterData.colors = parsed.colors;
                    }
                    if (Array.isArray(parsed.sizes) && parsed.sizes.length > 0) {
                        this.filterData.sizes = parsed.sizes;
                    }
                    if (parsed.minPrice !== undefined) {
                        this.filterData.minPrice = Number(parsed.minPrice) || 0;
                    }
                    if (parsed.maxPrice !== undefined) {
                        this.filterData.maxPrice = Number(parsed.maxPrice) || 3000;
                    }
                }
            }
        }
        catch (e) {
            console.warn("[FilterStore] Could not read filters_db.json, re-syncing from taxonomies.");
        }
    }
    saveToDisk() {
        try {
            fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.filterData, null, 2), "utf-8");
        }
        catch (e) {
            console.error("[FilterStore] Failed to write filters_db.json:", e);
        }
    }
    refreshFilters() {
        const dynamic = this.buildDynamicFilterData();
        this.filterData.categories = dynamic.categories;
        this.filterData.subcategories = dynamic.subcategories;
        if (!this.filterData.colors || this.filterData.colors.length === 0) {
            this.filterData.colors = dynamic.colors;
        }
        if (!this.filterData.sizes || this.filterData.sizes.length === 0) {
            this.filterData.sizes = dynamic.sizes;
        }
        this.filterData.ratings = [5, 4, 3, 2, 1];
        this.saveToDisk();
        return this.filterData;
    }
    getFilters() {
        return this.refreshFilters();
    }
    updateFilters(newFilters) {
        if (Array.isArray(newFilters.colors) && newFilters.colors.length > 0) {
            this.filterData.colors = newFilters.colors;
        }
        if (Array.isArray(newFilters.sizes) && newFilters.sizes.length > 0) {
            this.filterData.sizes = newFilters.sizes;
        }
        if (newFilters.minPrice !== undefined) {
            this.filterData.minPrice = Number(newFilters.minPrice) || 0;
        }
        if (newFilters.maxPrice !== undefined) {
            this.filterData.maxPrice = Number(newFilters.maxPrice) || 3000;
        }
        return this.refreshFilters();
    }
}
export const filterStore = new FilterStore();
