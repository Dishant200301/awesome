import { sequelize } from "./index.js";
/**
 * Fetch all categories and subcategories directly from MySQL
 */
export async function fetchCategoriesFromMySQL() {
    try {
        const [catRows] = await sequelize.query(`SELECT * FROM categories ORDER BY created_at ASC`);
        const [subRows] = await sequelize.query(`SELECT * FROM sub_categories ORDER BY created_at ASC`);
        const categories = (Array.isArray(catRows) ? catRows : []).map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || "",
            image: c.image_url || "/images/category/Latkan.webp",
            imageUrl: c.image_url || "/images/category/Latkan.webp",
            bannerImage: c.banner_image || "",
            metaTitle: c.meta_title || "",
            metaDescription: c.meta_description || "",
            metaKeywords: c.meta_keywords || "",
            isActive: c.is_active !== null && c.is_active !== undefined && c.is_active !== 0 && c.is_active !== "0" && Boolean(c.is_active),
            createdAt: c.created_at ? new Date(c.created_at).toISOString().split("T")[0] : "2026-01-15"
        }));
        const catMap = new Map(categories.map((c) => [c.id, c.name]));
        const subcategories = (Array.isArray(subRows) ? subRows : []).map((s) => ({
            id: s.id,
            categoryId: s.category_id,
            parentId: s.category_id,
            categoryName: catMap.get(s.category_id) || "",
            parentName: catMap.get(s.category_id) || "",
            name: s.name,
            slug: s.slug,
            description: s.description || "",
            image: s.image_url || "",
            imageUrl: s.image_url || "",
            bannerImage: s.banner_image || "",
            metaTitle: s.meta_title || "",
            metaDescription: s.meta_description || "",
            metaKeywords: s.meta_keywords || "",
            isActive: s.is_active !== null && s.is_active !== undefined && s.is_active !== 0 && s.is_active !== "0" && Boolean(s.is_active),
            createdAt: s.created_at ? new Date(s.created_at).toISOString().split("T")[0] : "2026-01-20"
        }));
        return { categories, subcategories };
    }
    catch (err) {
        console.error("[MySQL Sync] Error fetching categories from database:", err.message);
        return { categories: [], subcategories: [] };
    }
}
/**
 * Cleanly syncs a Category item to MySQL categories table
 */
export async function syncCategoryToMySQL(cat) {
    try {
        const slug = cat.slug || (cat.name ? cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "category");
        await sequelize.query(`INSERT INTO categories (
         id, name, slug, description, image_url, banner_image,
         meta_title, meta_description, meta_keywords, is_active
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         slug = VALUES(slug),
         description = VALUES(description),
         image_url = VALUES(image_url),
         banner_image = VALUES(banner_image),
         meta_title = VALUES(meta_title),
         meta_description = VALUES(meta_description),
         meta_keywords = VALUES(meta_keywords),
         is_active = VALUES(is_active)`, {
            replacements: [
                cat.id,
                cat.name,
                slug,
                cat.description || null,
                cat.image || cat.imageUrl || cat.image_url || null,
                cat.bannerImage || cat.banner_image || null,
                cat.metaTitle || cat.meta_title || null,
                cat.metaDescription || cat.meta_description || null,
                cat.metaKeywords || cat.meta_keywords || null,
                (cat.isActive === false || cat.isActive === 0 || cat.isActive === "0" || cat.isActive === "false") ? 0 : 1
            ]
        });
    }
    catch (err) {
        console.error(`[MySQL Sync] Failed to sync category '${cat.name}':`, err.message);
        throw err;
    }
}
/**
 * Cleanly syncs a Subcategory item to MySQL sub_categories table
 */
export async function syncSubcategoryToMySQL(sub) {
    try {
        const slug = sub.slug || (sub.name ? sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "subcategory");
        let categoryId = sub.categoryId || sub.parentId;
        // If categoryId is missing, attempt lookup by parentName / categoryName
        if (!categoryId && (sub.parentName || sub.categoryName)) {
            const parentName = sub.parentName || sub.categoryName;
            const [rows] = await sequelize.query(`SELECT id FROM categories WHERE name = ? OR slug = ? LIMIT 1`, { replacements: [parentName, parentName.toLowerCase().replace(/[^a-z0-9]+/g, "-")] });
            if (Array.isArray(rows) && rows.length > 0) {
                categoryId = rows[0].id;
            }
        }
        // Fallback: If still no categoryId, attach to first available category
        if (!categoryId) {
            const [rows] = await sequelize.query(`SELECT id FROM categories LIMIT 1`);
            if (Array.isArray(rows) && rows.length > 0) {
                categoryId = rows[0].id;
            }
        }
        if (!categoryId) {
            console.warn(`[MySQL Sync] Cannot sync subcategory '${sub.name}': No valid parent category found.`);
            return;
        }
        await sequelize.query(`INSERT INTO sub_categories (
         id, category_id, name, slug, description, image_url, banner_image,
         meta_title, meta_description, meta_keywords, is_active
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         category_id = VALUES(category_id),
         name = VALUES(name),
         slug = VALUES(slug),
         description = VALUES(description),
         image_url = VALUES(image_url),
         banner_image = VALUES(banner_image),
         meta_title = VALUES(meta_title),
         meta_description = VALUES(meta_description),
         meta_keywords = VALUES(meta_keywords),
         is_active = VALUES(is_active)`, {
            replacements: [
                sub.id,
                categoryId,
                sub.name,
                slug,
                sub.description || null,
                sub.image || sub.imageUrl || sub.image_url || null,
                sub.bannerImage || sub.banner_image || null,
                sub.metaTitle || sub.meta_title || null,
                sub.metaDescription || sub.meta_description || null,
                sub.metaKeywords || sub.meta_keywords || null,
                (sub.isActive === false || sub.isActive === 0 || sub.isActive === "0" || sub.isActive === "false") ? 0 : 1
            ]
        });
    }
    catch (err) {
        console.error(`[MySQL Sync] Failed to sync subcategory '${sub.name}':`, err.message);
        throw err;
    }
}
/**
 * Delete a category from MySQL
 */
export async function deleteCategoryFromMySQL(id) {
    try {
        await sequelize.query(`DELETE FROM categories WHERE id = ?`, { replacements: [id] });
    }
    catch (err) {
        console.error(`[MySQL Sync] Failed to delete category '${id}':`, err.message);
        throw err;
    }
}
/**
 * Delete a subcategory from MySQL
 */
export async function deleteSubcategoryFromMySQL(id) {
    try {
        await sequelize.query(`DELETE FROM sub_categories WHERE id = ?`, { replacements: [id] });
    }
    catch (err) {
        console.error(`[MySQL Sync] Failed to delete subcategory '${id}':`, err.message);
        throw err;
    }
}
/**
 * Sync entire taxonomy batch to MySQL (categories first, then subcategories, then purge deleted)
 */
export async function syncAllCategoriesToMySQL(parents, subs) {
    // 1. Sync all parent categories sequentially
    for (const parent of parents) {
        await syncCategoryToMySQL(parent);
    }
    // 2. Sync all subcategories sequentially
    for (const sub of subs) {
        await syncSubcategoryToMySQL(sub);
    }
    // 3. Purge items from MySQL that are no longer in the provided list
    if (parents.length > 0) {
        const parentIds = parents.map((p) => p.id);
        await sequelize.query(`DELETE FROM categories WHERE id NOT IN (?)`, { replacements: [parentIds] });
    }
    if (subs.length > 0) {
        const subIds = subs.map((s) => s.id);
        await sequelize.query(`DELETE FROM sub_categories WHERE id NOT IN (?)`, { replacements: [subIds] });
    }
}
/**
 * Fetch all products directly from MySQL tables (products, variants, images)
 */
export async function fetchProductsFromMySQL(onlyPublished = false) {
    try {
        let query = `
      SELECT p.*, c.name as category_name, sc.name as subcategory_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN sub_categories sc ON p.subcategory_id = sc.id
    `;
        if (onlyPublished) {
            query += ` WHERE p.is_published = 1 AND (p.status = 'Published' OR p.status = 'Active')`;
        }
        query += ` ORDER BY p.created_at DESC`;
        const [rows] = await sequelize.query(query);
        if (!Array.isArray(rows) || rows.length === 0) {
            return [];
        }
        const productIds = rows.map((r) => r.id);
        let variantsRows = [];
        let imagesRows = [];
        try {
            const [v] = await sequelize.query(`SELECT * FROM product_variants WHERE product_id IN (?) ORDER BY id ASC`, { replacements: [productIds] });
            if (Array.isArray(v))
                variantsRows = v;
        }
        catch { }
        try {
            const [img] = await sequelize.query(`SELECT * FROM product_images WHERE product_id IN (?) ORDER BY display_order ASC`, { replacements: [productIds] });
            if (Array.isArray(img))
                imagesRows = img;
        }
        catch { }
        const variantsMap = new Map();
        for (const v of variantsRows) {
            if (!variantsMap.has(v.product_id))
                variantsMap.set(v.product_id, []);
            variantsMap.get(v.product_id).push({
                id: v.id,
                sku: v.sku,
                colorName: v.color_name,
                colorHex: v.color_hex,
                size: v.size_name,
                sizeName: v.size_name,
                price: Number(v.price),
                originalPrice: Number(v.original_price),
                costPrice: Number(v.cost_price),
                stock: Number(v.stock),
                thumbnail: v.thumbnail_url,
                status: v.status
            });
        }
        const imagesMap = new Map();
        for (const img of imagesRows) {
            if (!imagesMap.has(img.product_id))
                imagesMap.set(img.product_id, []);
            imagesMap.get(img.product_id).push(img.image_url);
        }
        return rows.map((r) => {
            const pImages = imagesMap.get(r.id) || (r.image_url ? [r.image_url] : ["/images/category/Latkan.webp"]);
            const pVariants = variantsMap.get(r.id) || [];
            const mainImg = r.image_url || pImages[0] || "/images/category/Latkan.webp";
            return {
                id: r.id,
                name: r.name,
                subtitle: r.subtitle || "",
                brand: r.brand || "Awesome Handmade",
                category: r.category_name || "Latkan",
                subcategory: r.subcategory_name || "",
                subCategory: r.subcategory_name || "",
                categories: [r.category_name || "Latkan"],
                slug: r.slug,
                sku: r.default_sku,
                defaultSku: r.default_sku,
                barcode: r.barcode || "",
                regularPrice: Number(r.original_price || r.price || 0),
                originalPrice: Number(r.original_price || r.price || 0),
                price: Number(r.price || 0),
                discountType: "percentage",
                discountValue: Number(r.discount_percentage || 0),
                stock: Number(r.stock || 0),
                mainImage: mainImg,
                image: mainImg,
                images: pImages,
                galleryImages: pImages.filter((img) => img !== mainImg),
                shortDescription: r.short_description || "",
                description: r.full_description || r.short_description || "",
                fullDescription: r.full_description || "",
                longDescription: r.full_description || "",
                variations: pVariants,
                variants: pVariants,
                rating: r.rating !== undefined && r.rating !== null ? Number(r.rating) : 0,
                reviewCount: r.review_count !== undefined && r.review_count !== null ? Number(r.review_count) : 0,
                isFeatured: Boolean(r.is_featured),
                isPublished: Boolean(r.is_published),
                status: r.status || (r.is_published ? "Published" : "Draft"),
                createdAt: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString()
            };
        });
    }
    catch (err) {
        console.error("[MySQL Sync] Error fetching products from database:", err.message);
        return [];
    }
}
/**
 * Cleanly syncs a Product (and its variants/images) to MySQL tables
 */
export async function syncProductToMySQL(p) {
    try {
        const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const sku = p.defaultSku || p.sku || `SKU-${p.id}`;
        const mainImg = p.image || p.mainImage || "/images/category/Latkan.webp";
        // 1. Resolve category_id if needed
        let categoryId = null;
        if (p.category) {
            const [rows] = await sequelize.query(`SELECT id FROM categories WHERE id = ? OR name = ? LIMIT 1`, { replacements: [p.category, p.category] });
            if (Array.isArray(rows) && rows.length > 0) {
                categoryId = rows[0].id;
            }
        }
        // 2. Resolve subcategory_id if needed
        let subcategoryId = null;
        const subName = p.subcategory || p.subCategory;
        if (subName) {
            const [rows] = await sequelize.query(`SELECT id FROM sub_categories WHERE id = ? OR name = ? OR slug = ? LIMIT 1`, { replacements: [subName, subName, subName.toLowerCase().replace(/[^a-z0-9]+/g, "-")] });
            if (Array.isArray(rows) && rows.length > 0) {
                subcategoryId = rows[0].id;
            }
        }
        // 3. Insert or update product
        await sequelize.query(`INSERT INTO products (
         id, name, subtitle, slug, product_type,
         short_description, full_description, price, original_price, cost_price,
         discount_percentage, rating, review_count, stock, default_sku,
         barcode, image_url, is_featured, is_trending, is_new_arrival,
         is_best_seller, is_on_sale, is_published, status, category_id, subcategory_id
       ) VALUES (
         ?, ?, ?, ?, ?,
         ?, ?, ?, ?, ?,
         ?, ?, ?, ?, ?,
         ?, ?, ?, ?, ?,
         ?, ?, ?, ?, ?, ?
       )
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         subtitle = VALUES(subtitle),
         slug = VALUES(slug),
         product_type = VALUES(product_type),
         short_description = VALUES(short_description),
         full_description = VALUES(full_description),
         price = VALUES(price),
         original_price = VALUES(original_price),
         cost_price = VALUES(cost_price),
         discount_percentage = VALUES(discount_percentage),
         rating = VALUES(rating),
         review_count = VALUES(review_count),
         stock = VALUES(stock),
         default_sku = VALUES(default_sku),
         barcode = VALUES(barcode),
         image_url = VALUES(image_url),
         is_featured = VALUES(is_featured),
         is_published = VALUES(is_published),
         status = VALUES(status),
         category_id = VALUES(category_id),
         subcategory_id = VALUES(subcategory_id)`, {
            replacements: [
                p.id,
                p.name,
                p.subtitle || null,
                slug,
                p.variations && p.variations.length > 0 ? "variable" : "simple",
                p.shortDescription || null,
                p.fullDescription || p.longDescription || null,
                Number(p.price) || 0,
                Number(p.originalPrice || p.regularPrice) || Number(p.price) || 0,
                Number(p.costPrice) || null,
                Number(p.discountPercentage) || 0,
                p.rating !== undefined && p.rating !== null ? Number(p.rating) : 0,
                p.reviewCount !== undefined && p.reviewCount !== null ? Math.floor(Number(p.reviewCount)) : 0,
                Number(p.stock) || 0,
                sku,
                p.barcode || null,
                mainImg,
                p.isFeatured ? 1 : 0,
                0,
                1,
                0,
                0,
                p.isPublished !== false ? 1 : 0,
                p.status || "Published",
                categoryId,
                subcategoryId
            ]
        });
        // 3. Sync Variants if variable
        if (Array.isArray(p.variations) && p.variations.length > 0) {
            for (let i = 0; i < p.variations.length; i++) {
                const v = p.variations[i];
                const vId = v.id || `var-${p.id}-${i}`;
                const vSku = v.sku || `${sku}-V${i + 1}`;
                await sequelize.query(`INSERT INTO product_variants (
             id, product_id, sku, barcode, color_name, color_hex,
             size_name, price, original_price, cost_price, stock, thumbnail_url, status
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             sku = VALUES(sku),
             color_name = VALUES(color_name),
             color_hex = VALUES(color_hex),
             size_name = VALUES(size_name),
             price = VALUES(price),
             original_price = VALUES(original_price),
             stock = VALUES(stock),
             thumbnail_url = VALUES(thumbnail_url),
             status = VALUES(status)`, {
                    replacements: [
                        vId,
                        p.id,
                        vSku,
                        v.barcode || null,
                        v.colorName || null,
                        v.colorHex || null,
                        v.sizeName || v.size || "Free Size",
                        Number(v.price) || Number(p.price) || 0,
                        Number(v.originalPrice) || Number(p.originalPrice) || 0,
                        Number(v.costPrice) || null,
                        Number(v.stock) || 0,
                        v.thumbnail || mainImg,
                        v.status || "Active"
                    ]
                });
            }
        }
        // 4. Sync Images
        const imgList = Array.isArray(p.images) && p.images.length > 0 ? p.images : [mainImg];
        for (let i = 0; i < imgList.length; i++) {
            const url = imgList[i];
            if (!url)
                continue;
            const imgId = `img-${p.id}-${i}`;
            await sequelize.query(`INSERT INTO product_images (id, product_id, variant_id, image_url, alt_text, display_order)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           image_url = VALUES(image_url),
           display_order = VALUES(display_order)`, {
                replacements: [imgId, p.id, null, url, `${p.name} image ${i + 1}`, i]
            });
        }
    }
    catch (err) {
        console.error(`[MySQL Sync] Failed to sync product '${p.name}':`, err.message);
        throw err;
    }
}
/**
 * Delete product and associated records from MySQL
 */
export async function deleteProductFromMySQL(id) {
    try {
        await sequelize.query(`DELETE FROM product_images WHERE product_id = ?`, { replacements: [id] });
        await sequelize.query(`DELETE FROM product_variants WHERE product_id = ?`, { replacements: [id] });
        await sequelize.query(`DELETE FROM products WHERE id = ?`, { replacements: [id] });
    }
    catch (err) {
        console.error(`[MySQL Sync] Failed to delete product '${id}':`, err.message);
        throw err;
    }
}
/**
 * Fetch all hero slides directly from MySQL
 */
export async function fetchHeroSlidesFromMySQL() {
    try {
        const [rows] = await sequelize.query(`SELECT * FROM hero_slides ORDER BY sort_order ASC, created_at ASC`);
        if (Array.isArray(rows) && rows.length > 0) {
            return rows.map((r) => ({
                id: r.id,
                tag: r.tag || "",
                title: r.title,
                subtitle: r.subtitle || "",
                image: r.image,
                mobileImage: r.mobile_image || "",
                buttonText: r.button_text || "Shop Collection",
                link: r.link || "#categories",
                theme: r.theme || "gold",
                align: r.align || "left",
                status: r.status || "Active",
                sortOrder: r.sort_order || 0
            }));
        }
        return [];
    }
    catch (err) {
        console.error("[MySQL Sync] Error fetching hero slides from database:", err.message);
        return [];
    }
}
/**
 * Sync hero slides batch to MySQL
 */
export async function syncHeroSlidesToMySQL(slides) {
    try {
        for (let i = 0; i < slides.length; i++) {
            const s = slides[i];
            await sequelize.query(`INSERT INTO hero_slides (
           id, tag, title, subtitle, image, mobile_image,
           button_text, link, theme, align, status, sort_order
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           tag = VALUES(tag),
           title = VALUES(title),
           subtitle = VALUES(subtitle),
           image = VALUES(image),
           mobile_image = VALUES(mobile_image),
           button_text = VALUES(button_text),
           link = VALUES(link),
           theme = VALUES(theme),
           align = VALUES(align),
           status = VALUES(status),
           sort_order = VALUES(sort_order)`, {
                replacements: [
                    s.id || `slide-${Date.now()}-${i}`,
                    s.tag || "",
                    s.title || "Slide Title",
                    s.subtitle || "",
                    s.image || "/images/home/hero/hero-1.webp",
                    s.mobileImage || "",
                    s.buttonText || "Shop Collection",
                    s.link || "#categories",
                    s.theme || "gold",
                    s.align || "left",
                    s.status || "Active",
                    s.sortOrder !== undefined ? s.sortOrder : i + 1
                ]
            });
        }
        if (slides.length > 0) {
            const ids = slides.map(s => s.id).filter(Boolean);
            if (ids.length > 0) {
                await sequelize.query(`DELETE FROM hero_slides WHERE id NOT IN (?)`, { replacements: [ids] });
            }
        }
    }
    catch (err) {
        console.error("[MySQL Sync] Error syncing hero slides to database:", err.message);
        throw err;
    }
}
/**
 * Fetch promo banner directly from MySQL
 */
export async function fetchPromoBannerFromMySQL() {
    try {
        const [rows] = await sequelize.query(`SELECT * FROM promo_banners ORDER BY updated_at DESC LIMIT 1`);
        if (Array.isArray(rows) && rows.length > 0) {
            const r = rows[0];
            return {
                id: r.id,
                tagline: r.tagline || "",
                title: r.title,
                subtitle: r.subtitle || "",
                badgeText: r.badge_text || "",
                buttonText: r.button_text || "Explore Collection",
                buttonLink: r.button_link || "#collection",
                imageUrl: r.image_url || "",
                mobileImageUrl: r.mobile_image_url || "",
                bgColor: r.bg_color || "",
                isActive: Boolean(r.is_active)
            };
        }
        return null;
    }
    catch (err) {
        console.error("[MySQL Sync] Error fetching promo banner from database:", err.message);
        return null;
    }
}
/**
 * Sync promo banner to MySQL
 */
export async function syncPromoBannerToMySQL(banner) {
    try {
        await sequelize.query(`INSERT INTO promo_banners (
         id, tagline, title, subtitle, badge_text, button_text,
         button_link, image_url, mobile_image_url, bg_color, is_active
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         tagline = VALUES(tagline),
         title = VALUES(title),
         subtitle = VALUES(subtitle),
         badge_text = VALUES(badge_text),
         button_text = VALUES(button_text),
         button_link = VALUES(button_link),
         image_url = VALUES(image_url),
         mobile_image_url = VALUES(mobile_image_url),
         bg_color = VALUES(bg_color),
         is_active = VALUES(is_active)`, {
            replacements: [
                banner.id || "promo-main-banner",
                banner.tagline || "",
                banner.title || "Handmade Collection",
                banner.subtitle || "",
                banner.badgeText || "",
                banner.buttonText || "Explore Collection",
                banner.buttonLink || "#collection",
                banner.imageUrl || "",
                banner.mobileImageUrl || "",
                banner.bgColor || "",
                banner.isActive !== false ? 1 : 0
            ]
        });
    }
    catch (err) {
        console.error("[MySQL Sync] Error syncing promo banner to database:", err.message);
        throw err;
    }
}
