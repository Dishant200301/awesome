export const INITIAL_SIZE_GUIDES = [
    {
        id: "sg-bralette",
        title: "Women's Bralette & Seamless Bra Size Guide",
        description: "Standard international conversion chart for wireless contour bralettes.",
        categoryIds: ["cat-1", "cat-2", "Bralettes", "Everyday Bras"],
        subcategoryIds: ["sub-1", "sub-2", "sub-3"],
        countries: [
            { id: "c-1", name: "India", code: "IN", displayOrder: 1 },
            { id: "c-2", name: "USA", code: "US", displayOrder: 2 },
            { id: "c-3", name: "EU", code: "EU", displayOrder: 3 },
            { id: "c-4", name: "UK", code: "UK", displayOrder: 4 },
            { id: "c-5", name: "China", code: "CN", displayOrder: 5 },
            { id: "c-6", name: "Australia", code: "AU", displayOrder: 6 },
            { id: "c-7", name: "Japan", code: "JP", displayOrder: 7 }
        ],
        columns: [
            { id: "col-1", key: "brandSize", name: "Brand Size", displayOrder: 1 },
            { id: "col-2", key: "countrySize", name: "Country Standard", displayOrder: 2 },
            { id: "col-3", key: "bust", name: "Bust", displayOrder: 3 },
            { id: "col-4", key: "underbust", name: "Underbust", displayOrder: 4 }
        ],
        rows: [
            {
                id: "r-1",
                brandSize: "S",
                displayOrder: 1,
                values: {
                    IN_countrySize: { cm: "32A / 32B", inch: "32A / 32B" },
                    IN_bust: { cm: "80-84", inch: "31.5-33.0" },
                    IN_underbust: { cm: "68-72", inch: "26.7-28.3" },
                    US_countrySize: { cm: "32A / 32B", inch: "32A / 32B" },
                    US_bust: { cm: "80-84", inch: "31.5-33.0" },
                    US_underbust: { cm: "68-72", inch: "26.7-28.3" },
                    EU_countrySize: { cm: "70A / 70B", inch: "70A / 70B" },
                    EU_bust: { cm: "80-84", inch: "31.5-33.0" },
                    EU_underbust: { cm: "68-72", inch: "26.7-28.3" },
                    UK_countrySize: { cm: "32A / 32B", inch: "32A / 32B" },
                    UK_bust: { cm: "80-84", inch: "31.5-33.0" },
                    UK_underbust: { cm: "68-72", inch: "26.7-28.3" },
                    CN_countrySize: { cm: "70A / 70B", inch: "70A / 70B" },
                    CN_bust: { cm: "80-84", inch: "31.5-33.0" },
                    CN_underbust: { cm: "68-72", inch: "26.7-28.3" }
                }
            },
            {
                id: "r-2",
                brandSize: "M",
                displayOrder: 2,
                values: {
                    IN_countrySize: { cm: "34A / 34B", inch: "34A / 34B" },
                    IN_bust: { cm: "85-89", inch: "33.5-35.0" },
                    IN_underbust: { cm: "73-77", inch: "28.7-30.3" },
                    US_countrySize: { cm: "34A / 34B", inch: "34A / 34B" },
                    US_bust: { cm: "85-89", inch: "33.5-35.0" },
                    US_underbust: { cm: "73-77", inch: "28.7-30.3" },
                    EU_countrySize: { cm: "75A / 75B", inch: "75A / 75B" },
                    EU_bust: { cm: "85-89", inch: "33.5-35.0" },
                    EU_underbust: { cm: "73-77", inch: "28.7-30.3" },
                    UK_countrySize: { cm: "34A / 34B", inch: "34A / 34B" },
                    UK_bust: { cm: "85-89", inch: "33.5-35.0" },
                    UK_underbust: { cm: "73-77", inch: "28.7-30.3" },
                    CN_countrySize: { cm: "75A / 75B", inch: "75A / 75B" },
                    CN_bust: { cm: "85-89", inch: "33.5-35.0" },
                    CN_underbust: { cm: "73-77", inch: "28.7-30.3" }
                }
            },
            {
                id: "r-3",
                brandSize: "L",
                displayOrder: 3,
                values: {
                    IN_countrySize: { cm: "36A / 36B", inch: "36A / 36B" },
                    IN_bust: { cm: "90-94", inch: "35.4-37.0" },
                    IN_underbust: { cm: "78-82", inch: "30.7-32.3" },
                    US_countrySize: { cm: "36A / 36B", inch: "36A / 36B" },
                    US_bust: { cm: "90-94", inch: "35.4-37.0" },
                    US_underbust: { cm: "78-82", inch: "30.7-32.3" },
                    EU_countrySize: { cm: "80A / 80B", inch: "80A / 80B" },
                    EU_bust: { cm: "90-94", inch: "35.4-37.0" },
                    EU_underbust: { cm: "78-82", inch: "30.7-32.3" },
                    UK_countrySize: { cm: "36A / 36B", inch: "36A / 36B" },
                    UK_bust: { cm: "90-94", inch: "35.4-37.0" },
                    UK_underbust: { cm: "78-82", inch: "30.7-32.3" },
                    CN_countrySize: { cm: "80A / 80B", inch: "80A / 80B" },
                    CN_bust: { cm: "90-94", inch: "35.4-37.0" },
                    CN_underbust: { cm: "78-82", inch: "30.7-32.3" }
                }
            },
            {
                id: "r-4",
                brandSize: "XL",
                displayOrder: 4,
                values: {
                    IN_countrySize: { cm: "38A / 38B", inch: "38A / 38B" },
                    IN_bust: { cm: "95-99", inch: "37.4-39.0" },
                    IN_underbust: { cm: "83-87", inch: "32.7-34.3" },
                    US_countrySize: { cm: "38A / 38B", inch: "38A / 38B" },
                    US_bust: { cm: "95-99", inch: "37.4-39.0" },
                    US_underbust: { cm: "83-87", inch: "32.7-34.3" },
                    EU_countrySize: { cm: "85A / 85B", inch: "85A / 85B" },
                    EU_bust: { cm: "95-99", inch: "37.4-39.0" },
                    EU_underbust: { cm: "83-87", inch: "32.7-34.3" },
                    UK_countrySize: { cm: "38A / 38B", inch: "38A / 38B" },
                    UK_bust: { cm: "95-99", inch: "37.4-39.0" },
                    UK_underbust: { cm: "83-87", inch: "32.7-34.3" },
                    CN_countrySize: { cm: "85A / 85B", inch: "85A / 85B" },
                    CN_bust: { cm: "95-99", inch: "37.4-39.0" },
                    CN_underbust: { cm: "83-87", inch: "32.7-34.3" }
                }
            }
        ]
    }
];
class SizeGuideStore {
    sizeGuides = [...INITIAL_SIZE_GUIDES];
    getAll() {
        return this.sizeGuides;
    }
    getById(id) {
        return this.sizeGuides.find((g) => g.id === id);
    }
    getForCategory(categoryId, subcategoryId) {
        if (subcategoryId) {
            const matchSub = this.sizeGuides.find((g) => g.subcategoryIds.includes(subcategoryId));
            if (matchSub)
                return matchSub;
        }
        if (categoryId) {
            const matchCat = this.sizeGuides.find((g) => g.categoryIds.includes(categoryId));
            if (matchCat)
                return matchCat;
        }
        return this.sizeGuides[0];
    }
    add(guideData) {
        const newGuide = {
            id: `sg-${Date.now()}`,
            title: guideData.title || "New Size Guide",
            description: guideData.description || "",
            categoryIds: guideData.categoryIds || [],
            subcategoryIds: guideData.subcategoryIds || [],
            countries: guideData.countries || INITIAL_SIZE_GUIDES[0].countries,
            columns: guideData.columns || INITIAL_SIZE_GUIDES[0].columns,
            rows: guideData.rows || INITIAL_SIZE_GUIDES[0].rows,
            createdAt: new Date().toISOString()
        };
        this.sizeGuides.unshift(newGuide);
        return newGuide;
    }
    update(id, updateData) {
        const idx = this.sizeGuides.findIndex((g) => g.id === id);
        if (idx === -1)
            return null;
        const updated = { ...this.sizeGuides[idx], ...updateData };
        this.sizeGuides[idx] = updated;
        return updated;
    }
    delete(id) {
        const len = this.sizeGuides.length;
        this.sizeGuides = this.sizeGuides.filter((g) => g.id !== id);
        return this.sizeGuides.length < len;
    }
}
export const sizeGuideStore = new SizeGuideStore();
