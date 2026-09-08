import { productStore } from "./productStore.js";
import { getCategoriesStore, getAttributesStore } from "./taxonomyStore.js";
import { getContactMessagesSync } from "./contactStore.js";
export const getDashboardAnalyticsStore = () => {
    const products = productStore.getAll(false);
    const categories = getCategoriesStore();
    const attributes = getAttributesStore();
    const messages = getContactMessagesSync();
    const totalProducts = products.length;
    const publishedProducts = products.filter((p) => p.isPublished || p.status === 'Published').length;
    const draftProducts = totalProducts - publishedProducts;
    let totalVariants = 0;
    const lowStockProducts = [];
    products.forEach((p) => {
        const vars = p.variations || p.variants || [];
        totalVariants += vars.length;
        const stockNum = p.stock !== undefined ? p.stock : (p.inventory?.stock ?? 100);
        if (stockNum <= 20) {
            lowStockProducts.push({
                id: p.id,
                name: p.name,
                sku: p.defaultSku || p.sku || (vars[0]?.sku) || 'N/A',
                stock: stockNum,
                category: p.category
            });
        }
    });
    const recentProducts = products.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock !== undefined ? p.stock : 100,
        status: p.isPublished || p.status === 'Published' ? 'Published' : 'Draft',
        image: p.image || p.images?.[0]?.url || p.images?.[0] || 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1'
    }));
    const recentMessages = messages.slice(0, 5);
    const unreadMessagesCount = messages.filter((m) => m.status === 'New').length;
    return {
        totalProducts,
        publishedProducts,
        draftProducts,
        totalVariants,
        totalCategories: categories.length,
        totalAttributes: attributes.length,
        lowStockCount: lowStockProducts.length,
        totalMessages: messages.length,
        unreadMessagesCount,
        recentProducts,
        recentMessages,
        lowStockProducts
    };
};
