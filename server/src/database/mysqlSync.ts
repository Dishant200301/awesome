import { sequelize } from "./index.js";
import { Category, Subcategory } from "../types/admin.js";
import { ProductItem } from "../modules/product/store/productStore.js";

/**
 * Fetch all categories and subcategories directly from MySQL
 */
export async function fetchCategoriesFromMySQL(): Promise<{ categories: any[]; subcategories: any[] }> {
  try {
    const [catRows] = await sequelize.query(`SELECT * FROM categories ORDER BY created_at ASC`);
    const [subRows] = await sequelize.query(`SELECT * FROM sub_categories ORDER BY created_at ASC`);

    const categories = (Array.isArray(catRows) ? catRows : []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      image: c.image_url || "",
      imageUrl: c.image_url || "",
      bannerImage: c.banner_image || "",
      metaTitle: c.meta_title || "",
      metaDescription: c.meta_description || "",
      metaKeywords: c.meta_keywords || "",
      isActive: c.is_active !== null && c.is_active !== undefined && c.is_active !== 0 && c.is_active !== "0" && Boolean(c.is_active),
      createdAt: c.created_at ? new Date(c.created_at).toISOString().split("T")[0] : "2026-01-15"
    }));

    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const subcategories = (Array.isArray(subRows) ? subRows : []).map((s: any) => ({
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
  } catch (err) {
    console.error("[MySQL Sync] Error fetching categories from database:", (err as Error).message);
    return { categories: [], subcategories: [] };
  }
}

/**
 * Cleanly syncs a Category item to MySQL categories table
 */
export async function syncCategoryToMySQL(cat: Partial<Category> | any): Promise<void> {
  try {
    const slug = cat.slug || (cat.name ? cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "category");
    await sequelize.query(
      `INSERT INTO categories (
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
         is_active = VALUES(is_active)`,
      {
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
      }
    );
  } catch (err) {
    console.error(`[MySQL Sync] Failed to sync category '${cat.name}':`, (err as Error).message);
    throw err;
  }
}

/**
 * Cleanly syncs a Subcategory item to MySQL sub_categories table
 */
export async function syncSubcategoryToMySQL(sub: Partial<Subcategory> | any): Promise<void> {
  try {
    const slug = sub.slug || (sub.name ? sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "subcategory");
    let categoryId = sub.categoryId || sub.parentId;

    // If categoryId is missing, attempt lookup by parentName / categoryName
    if (!categoryId && (sub.parentName || sub.categoryName)) {
      const parentName = sub.parentName || sub.categoryName;
      const [rows] = await sequelize.query(
        `SELECT id FROM categories WHERE name = ? OR slug = ? LIMIT 1`,
        { replacements: [parentName, parentName.toLowerCase().replace(/[^a-z0-9]+/g, "-")] }
      );
      if (Array.isArray(rows) && rows.length > 0) {
        categoryId = (rows[0] as any).id;
      }
    }

    // Fallback: If still no categoryId, attach to first available category
    if (!categoryId) {
      const [rows] = await sequelize.query(`SELECT id FROM categories LIMIT 1`);
      if (Array.isArray(rows) && rows.length > 0) {
        categoryId = (rows[0] as any).id;
      }
    }

    if (!categoryId) {
      console.warn(`[MySQL Sync] Cannot sync subcategory '${sub.name}': No valid parent category found.`);
      return;
    }

    await sequelize.query(
      `INSERT INTO sub_categories (
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
         is_active = VALUES(is_active)`,
      {
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
      }
    );
  } catch (err) {
    console.error(`[MySQL Sync] Failed to sync subcategory '${sub.name}':`, (err as Error).message);
    throw err;
  }
}

/**
 * Delete a category from MySQL
 */
export async function deleteCategoryFromMySQL(id: string): Promise<void> {
  try {
    await sequelize.query(`DELETE FROM categories WHERE id = ?`, { replacements: [id] });
  } catch (err) {
    console.error(`[MySQL Sync] Failed to delete category '${id}':`, (err as Error).message);
    throw err;
  }
}

/**
 * Delete a subcategory from MySQL
 */
export async function deleteSubcategoryFromMySQL(id: string): Promise<void> {
  try {
    await sequelize.query(`DELETE FROM sub_categories WHERE id = ?`, { replacements: [id] });
  } catch (err) {
    console.error(`[MySQL Sync] Failed to delete subcategory '${id}':`, (err as Error).message);
    throw err;
  }
}

/**
 * Sync entire taxonomy batch to MySQL (categories first, then subcategories, then purge deleted)
 */
export async function syncAllCategoriesToMySQL(parents: any[], subs: any[]): Promise<void> {
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
    await sequelize.query(
      `DELETE FROM categories WHERE id NOT IN (?)`,
      { replacements: [parentIds] }
    );
  }

  if (subs.length > 0) {
    const subIds = subs.map((s) => s.id);
    await sequelize.query(
      `DELETE FROM sub_categories WHERE id NOT IN (?)`,
      { replacements: [subIds] }
    );
  }
}

/**
 * Fetch all products directly from MySQL tables (products, variants, images)
 */
export async function fetchProductsFromMySQL(onlyPublished = false): Promise<ProductItem[]> {
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

    const productIds = rows.map((r: any) => r.id);
    let variantsRows: any[] = [];
    let imagesRows: any[] = [];

    try {
      const [v] = await sequelize.query(
        `SELECT * FROM product_variants WHERE product_id IN (?) ORDER BY id ASC`,
        { replacements: [productIds] }
      );
      if (Array.isArray(v)) variantsRows = v;
    } catch {}

    try {
      const [img] = await sequelize.query(
        `SELECT * FROM product_images WHERE product_id IN (?) ORDER BY display_order ASC`,
        { replacements: [productIds] }
      );
      if (Array.isArray(img)) imagesRows = img;
    } catch {}

    const variantImagesMap = new Map<string, { id: string; url: string; alt?: string }[]>();
    const imagesMap = new Map<string, string[]>();
    for (const img of imagesRows) {
      const imageUrl = String(img.image_url || "").trim();
      if (!imageUrl) continue;

      if (img.variant_id) {
        if (!variantImagesMap.has(img.variant_id)) variantImagesMap.set(img.variant_id, []);
        variantImagesMap.get(img.variant_id)!.push({
          id: String(img.id),
          url: imageUrl,
          alt: img.alt_text || undefined
        });
      } else {
        if (!imagesMap.has(img.product_id)) imagesMap.set(img.product_id, []);
        imagesMap.get(img.product_id)!.push(imageUrl);
      }
    }

    const variantsMap = new Map<string, any[]>();
    for (const v of variantsRows) {
      if (!variantsMap.has(v.product_id)) variantsMap.set(v.product_id, []);
      variantsMap.get(v.product_id)!.push({
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
        status: v.status,
        images: variantImagesMap.get(v.id) || []
      });
    }

    return rows.map((r: any) => {
      const pImages = imagesMap.get(r.id) || (r.image_url ? [r.image_url] : []);
      const pVariants = variantsMap.get(r.id) || [];
      const mainImg = r.image_url || pImages[0] || "";

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
      } as any;
    });
  } catch (err) {
    console.error("[MySQL Sync] Error fetching products from database:", (err as Error).message);
    return [];
  }
}

/**
 * Cleanly syncs a Product (and its variants/images) to MySQL tables
 */
export async function syncProductToMySQL(p: ProductItem): Promise<void> {
  try {
    const rawSlug = (p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
    const rawSku = (p.defaultSku || p.sku || `SKU-${p.id}`).trim();
    const mainImg = p.image || p.mainImage || "";

    // 1. Resolve category_id if needed
    let categoryId: string | null = null;
    if (p.category) {
      try {
        const [rows] = await sequelize.query(
          `SELECT id FROM categories WHERE id = ? OR name = ? LIMIT 1`,
          { replacements: [p.category, p.category] }
        );
        if (Array.isArray(rows) && rows.length > 0) {
          categoryId = (rows[0] as any).id;
        }
      } catch {}
    }

    // 2. Resolve subcategory_id if needed
    let subcategoryId: string | null = null;
    const subName = p.subcategory || p.subCategory;
    if (subName) {
      try {
        const [rows] = await sequelize.query(
          `SELECT id FROM sub_categories WHERE id = ? OR name = ? OR slug = ? LIMIT 1`,
          { replacements: [subName, subName, subName.toLowerCase().replace(/[^a-z0-9]+/g, "-")] }
        );
        if (Array.isArray(rows) && rows.length > 0) {
          subcategoryId = (rows[0] as any).id;
        }
      } catch {}
    }

    // 3. Ensure finalSku is strictly unique across all other products
    let finalSku = rawSku;
    let skuAttempts = 0;
    while (skuAttempts < 10) {
      const [existingSkuRows] = await sequelize.query(
        `SELECT id FROM products WHERE default_sku = ? AND id != ? LIMIT 1`,
        { replacements: [finalSku, p.id] }
      );
      if (Array.isArray(existingSkuRows) && existingSkuRows.length > 0) {
        finalSku = `${rawSku}-${Date.now().toString().slice(-4)}${skuAttempts > 0 ? skuAttempts : ''}`;
        skuAttempts++;
      } else {
        break;
      }
    }

    // 4. Ensure finalSlug is strictly unique across all other products
    let finalSlug = rawSlug;
    let slugAttempts = 0;
    while (slugAttempts < 10) {
      const [existingSlugRows] = await sequelize.query(
        `SELECT id FROM products WHERE slug = ? AND id != ? LIMIT 1`,
        { replacements: [finalSlug, p.id] }
      );
      if (Array.isArray(existingSlugRows) && existingSlugRows.length > 0) {
        finalSlug = `${rawSlug}-${Date.now().toString().slice(-4)}${slugAttempts > 0 ? slugAttempts : ''}`;
        slugAttempts++;
      } else {
        break;
      }
    }

    // 5. Check if product already exists by ID
    const [existingProdRows] = await sequelize.query(
      `SELECT id FROM products WHERE id = ? LIMIT 1`,
      { replacements: [p.id] }
    );
    const productExists = Array.isArray(existingProdRows) && existingProdRows.length > 0;

    if (productExists) {
      // Direct UPDATE to ensure row with p.id is updated and not another row with duplicate key
      await sequelize.query(
        `UPDATE products SET
           name = ?, subtitle = ?, slug = ?, product_type = ?,
           short_description = ?, full_description = ?, price = ?, original_price = ?,
           cost_price = ?, discount_percentage = ?, rating = ?, review_count = ?,
           stock = ?, default_sku = ?, barcode = ?, image_url = ?, is_featured = ?,
           is_published = ?, status = ?, category_id = ?, subcategory_id = ?
         WHERE id = ?`,
        {
          replacements: [
            p.name,
            p.subtitle || null,
            finalSlug,
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
            finalSku,
            p.barcode || null,
            mainImg,
            p.isFeatured ? 1 : 0,
            p.isPublished !== false ? 1 : 0,
            p.status || "Published",
            categoryId,
            subcategoryId,
            p.id
          ]
        }
      );
    } else {
      // Direct INSERT guaranteeing p.id is inserted as the primary key
      await sequelize.query(
        `INSERT INTO products (
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
         )`,
        {
          replacements: [
            p.id,
            p.name,
            p.subtitle || null,
            finalSlug,
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
            finalSku,
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
        }
      );
    }

    // 6. Sync Variants if variable
    const variations = Array.isArray(p.variations) && p.variations.length > 0
      ? p.variations
      : (Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : []);

    if (variations.length > 0) {
      const activeVariantIds: string[] = [];
      for (let i = 0; i < variations.length; i++) {
        const v = variations[i];
        const vId = (v.id && !v.id.match(/^var-\d+$/)) ? v.id : `var-${p.id}-${i}`;
        activeVariantIds.push(vId);
        const baseVSku = (v.sku && v.sku.trim()) || `${finalSku}-V${i + 1}`;
        const vSku = baseVSku;

        await sequelize.query(
          `INSERT INTO product_variants (
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
             status = VALUES(status)`,
          {
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
          }
        );
      }

      // Purge old variants for this product not in current set
      if (activeVariantIds.length > 0) {
        try {
          await sequelize.query(
            `DELETE FROM product_variants WHERE product_id = ? AND id NOT IN (?)`,
            { replacements: [p.id, activeVariantIds] }
          );
        } catch {}
      }
    } else {
      // Simple product - clean up any obsolete variants
      try {
        await sequelize.query(
          `DELETE FROM product_variants WHERE product_id = ?`,
          { replacements: [p.id] }
        );
      } catch {}
    }

    // 7. Sync Images
    const imgList = Array.isArray(p.images) && p.images.length > 0 ? p.images : [mainImg];
    const activeImgIds: string[] = [];
    for (let i = 0; i < imgList.length; i++) {
      const url = imgList[i];
      if (!url) continue;
      const imgId = `img-${p.id}-${i}`;
      activeImgIds.push(imgId);
      const safeAlt = `${(p.name || '').slice(0, 180)} image ${i + 1}`;
      await sequelize.query(
        `INSERT INTO product_images (id, product_id, variant_id, image_url, alt_text, display_order)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           image_url = VALUES(image_url),
           alt_text = VALUES(alt_text),
           display_order = VALUES(display_order)`,
        {
          replacements: [imgId, p.id, null, url, safeAlt, i]
        }
      );
    }

    // Store each variant's ordered image gallery separately. The storefront
    // uses this to show the selected colour's main image and thumbnails.
    for (let variantIndex = 0; variantIndex < variations.length; variantIndex++) {
      const variant = variations[variantIndex];
      const variantId = (variant.id && !variant.id.match(/^var-\d+$/))
        ? variant.id
        : `var-${p.id}-${variantIndex}`;
      const rawVariantImages = Array.isArray(variant.images) ? variant.images : [];
      const variantUrls = Array.from(new Set([
        variant.thumbnail,
        (variant as any).mainImage,
        (variant as any).image,
        ...rawVariantImages.map((image: any) => typeof image === "string" ? image : image?.url)
      ].filter((image): image is string => Boolean(image && image.trim()))));

      for (let imageIndex = 0; imageIndex < variantUrls.length; imageIndex++) {
        const imageUrl = variantUrls[imageIndex];
        const imageId = `img-${p.id}-var-${variantIndex}-${imageIndex}`;
        activeImgIds.push(imageId);
        await sequelize.query(
          `INSERT INTO product_images (id, product_id, variant_id, image_url, alt_text, display_order)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             variant_id = VALUES(variant_id),
             image_url = VALUES(image_url),
             alt_text = VALUES(alt_text),
             display_order = VALUES(display_order)`,
          {
            replacements: [
              imageId,
              p.id,
              variantId,
              imageUrl,
              `${(p.name || '').slice(0, 140)} variant ${variantIndex + 1} image ${imageIndex + 1}`,
              imageIndex
            ]
          }
        );
      }
    }

    if (activeImgIds.length > 0) {
      try {
        await sequelize.query(
          `DELETE FROM product_images WHERE product_id = ? AND id NOT IN (?)`,
          { replacements: [p.id, activeImgIds] }
        );
      } catch {}
    }
  } catch (err) {
    console.error(`[MySQL Sync] Failed to sync product '${p.name}':`, (err as Error).message);
    throw err;
  }
}

/**
 * Delete product and associated records from MySQL
 */
export async function deleteProductFromMySQL(id: string): Promise<void> {
  try {
    await sequelize.query(`DELETE FROM product_images WHERE product_id = ?`, { replacements: [id] });
    await sequelize.query(`DELETE FROM product_variants WHERE product_id = ?`, { replacements: [id] });
    await sequelize.query(`DELETE FROM products WHERE id = ?`, { replacements: [id] });
  } catch (err) {
    console.error(`[MySQL Sync] Failed to delete product '${id}':`, (err as Error).message);
    throw err;
  }
}

/**
 * Fetch all hero slides directly from MySQL
 */
export async function fetchHeroSlidesFromMySQL(): Promise<any[]> {
  try {
    const [rows] = await sequelize.query(`SELECT * FROM hero_slides ORDER BY sort_order ASC, created_at ASC`);
    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map((r: any) => ({
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
  } catch (err) {
    console.error("[MySQL Sync] Error fetching hero slides from database:", (err as Error).message);
    return [];
  }
}

/**
 * Sync hero slides batch to MySQL
 */
export async function syncHeroSlidesToMySQL(slides: any[]): Promise<void> {
  try {
    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      await sequelize.query(
        `INSERT INTO hero_slides (
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
           sort_order = VALUES(sort_order)`,
        {
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
        }
      );
    }
    if (slides.length > 0) {
      const ids = slides.map(s => s.id).filter(Boolean);
      if (ids.length > 0) {
        await sequelize.query(`DELETE FROM hero_slides WHERE id NOT IN (?)`, { replacements: [ids] });
      }
    }
  } catch (err) {
    console.error("[MySQL Sync] Error syncing hero slides to database:", (err as Error).message);
    throw err;
  }
}

/**
 * Fetch promo banner directly from MySQL
 */
export async function fetchPromoBannerFromMySQL(): Promise<any | null> {
  try {
    const [rows] = await sequelize.query(`SELECT * FROM promo_banners ORDER BY updated_at DESC LIMIT 1`);
    if (Array.isArray(rows) && rows.length > 0) {
      const r = rows[0] as any;
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
  } catch (err) {
    console.error("[MySQL Sync] Error fetching promo banner from database:", (err as Error).message);
    return null;
  }
}

/**
 * Sync promo banner to MySQL
 */
export async function syncPromoBannerToMySQL(banner: any): Promise<void> {
  try {
    await sequelize.query(
      `INSERT INTO promo_banners (
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
         is_active = VALUES(is_active)`,
      {
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
      }
    );
  } catch (err) {
    console.error("[MySQL Sync] Error syncing promo banner to database:", (err as Error).message);
    throw err;
  }
}
