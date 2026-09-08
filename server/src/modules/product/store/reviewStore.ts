import { ReviewItem } from "../../../types/admin.js";
import { sequelize } from "../../../database/index.js";
import { QueryTypes } from "sequelize";
import { productStore } from "./productStore.js";

let reviews: ReviewItem[] = [];

// Initialize reviews table in MySQL if database is connected
export const initReviewTable = async () => {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR(36) PRIMARY KEY,
        product_id VARCHAR(36) NOT NULL,
        product_name VARCHAR(255),
        product_image VARCHAR(512),
        author VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        title VARCHAR(255),
        rating INT NOT NULL DEFAULT 5,
        comment TEXT NOT NULL,
        date VARCHAR(50),
        verified BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'Approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Ensure title column exists in case table was created earlier without it
    try {
      await sequelize.query(`ALTER TABLE reviews ADD COLUMN title VARCHAR(255) NULL AFTER email;`);
    } catch {}
  } catch (err) {
    // Database table creation skipped if offline
  }
};

// Auto-run table init
initReviewTable();

// Recalculates real rating average and review count from submitted approved customer reviews
export const syncProductRatingStore = async (productId: string) => {
  if (!productId) return;
  try {
    let count = 0;
    let sum = 0;

    try {
      const rows: any[] = await sequelize.query(
        `SELECT rating FROM reviews WHERE product_id = :productId AND LOWER(status) = 'approved'`,
        {
          replacements: { productId },
          type: QueryTypes.SELECT,
        }
      );
      if (Array.isArray(rows)) {
        count = rows.length;
        sum = rows.reduce((acc: number, r: any) => acc + (Number(r.rating) || 5), 0);
      }
    } catch {
      // In-memory fallback
      const prodRevs = reviews.filter(
        (r) => String(r.productId) === String(productId) && (r.status || "Approved").toLowerCase() === "approved"
      );
      count = prodRevs.length;
      sum = prodRevs.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    }

    const avg = count > 0 ? Number((sum / count).toFixed(1)) : 0;

    // 1. Update in MySQL directly
    try {
      await sequelize.query(
        `UPDATE products SET rating = :rating, review_count = :count WHERE id = :productId`,
        { replacements: { rating: avg, count, productId } }
      );
    } catch {}

    // 2. Update in-memory productStore & refresh
    const product = productStore.getByIdOrSlug(productId);
    if (product) {
      await productStore.update(product.id, {
        rating: avg,
        reviewCount: count,
      });
    }
  } catch (err) {
    console.error("[ReviewStore] Error syncing product rating:", err);
  }
};

export const getReviewsStore = async (
  productId?: string,
  filterStatus?: string,
  search?: string
): Promise<ReviewItem[]> => {
  // Try fetching from MySQL database first if connected
  try {
    let query = "SELECT * FROM reviews WHERE 1=1";
    const replacements: Record<string, any> = {};

    if (productId) {
      query += " AND product_id = :productId";
      replacements.productId = productId;
    }

    if (filterStatus && filterStatus.toUpperCase() !== "ALL") {
      query += " AND LOWER(status) = LOWER(:status)";
      replacements.status = filterStatus;
    }

    if (search && search.trim() !== "") {
      query += " AND (LOWER(author) LIKE :search OR LOWER(email) LIKE :search OR LOWER(product_name) LIKE :search OR LOWER(comment) LIKE :search OR LOWER(title) LIKE :search)";
      replacements.search = `%${search.toLowerCase().trim()}%`;
    }

    query += " ORDER BY created_at DESC";

    const dbRows: any[] = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    if (Array.isArray(dbRows) && dbRows.length > 0) {
      return dbRows.map((r: any) => ({
        id: String(r.id),
        productId: String(r.product_id),
        productName: r.product_name || "Awesome Handmade Product",
        productImage: r.product_image || "",
        author: r.author || "Customer",
        email: r.email || "",
        title: r.title || "",
        rating: Number(r.rating) || 5,
        comment: r.comment || "",
        date: r.date || new Date(r.created_at || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        verified: r.verified !== undefined ? Boolean(r.verified) : true,
        status: (r.status as any) || "Approved",
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    }
  } catch (err) {
    // Fallback to in-memory store
  }

  let list = [...reviews];

  if (productId) {
    list = list.filter((r) => String(r.productId) === String(productId));
  }

  if (filterStatus && filterStatus.toUpperCase() !== "ALL") {
    list = list.filter((r) => (r.status || "Approved").toLowerCase() === filterStatus.toLowerCase());
  }

  if (search && search.trim() !== "") {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (r) =>
        (r.author && r.author.toLowerCase().includes(q)) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.productName && r.productName.toLowerCase().includes(q)) ||
        (r.comment && r.comment.toLowerCase().includes(q)) ||
        (r.title && r.title.toLowerCase().includes(q))
    );
  }

  return list;
};

export const createReviewStore = async (data: Partial<ReviewItem>): Promise<ReviewItem> => {
  const newReview: ReviewItem = {
    id: data.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    productId: String(data.productId || "prod-1"),
    productName: data.productName || "Awesome Handmade Product",
    productImage: data.productImage || "",
    author: (data.author || "Customer").trim(),
    email: (data.email || "").trim().toLowerCase(),
    title: (data.title || "").trim(),
    rating: Number(data.rating) || 5,
    comment: (data.comment || "").trim(),
    date: data.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    verified: data.verified !== undefined ? data.verified : true,
    status: (data.status as any) || "Approved",
    createdAt: new Date().toISOString(),
  };

  // 1. Update in-memory list
  reviews = [newReview, ...reviews.filter((r) => r.id !== newReview.id)];

  // 2. Insert into MySQL if available
  try {
    await sequelize.query(
      `INSERT INTO reviews (id, product_id, product_name, product_image, author, email, title, rating, comment, date, verified, status, created_at)
       VALUES (:id, :productId, :productName, :productImage, :author, :email, :title, :rating, :comment, :date, :verified, :status, NOW())
       ON DUPLICATE KEY UPDATE 
         rating = VALUES(rating),
         title = VALUES(title),
         comment = VALUES(comment),
         status = VALUES(status),
         author = VALUES(author),
         email = VALUES(email)`,
      {
        replacements: {
          id: newReview.id,
          productId: newReview.productId,
          productName: newReview.productName,
          productImage: newReview.productImage,
          author: newReview.author,
          email: newReview.email,
          title: newReview.title || null,
          rating: newReview.rating,
          comment: newReview.comment,
          date: newReview.date,
          verified: newReview.verified ? 1 : 0,
          status: newReview.status,
        },
      }
    );
  } catch (err) {
    // Database write fallback
  }

  // 3. Recalculate and update product rating and review count
  await syncProductRatingStore(newReview.productId);

  return newReview;
};

export const updateReviewStatusStore = async (
  id: string,
  status: "Approved" | "Pending" | "Rejected"
): Promise<ReviewItem | null> => {
  let productId: string | undefined;
  const rev = reviews.find((r) => String(r.id) === String(id));
  if (rev) {
    rev.status = status;
    productId = rev.productId;
  }

  // Update in MySQL
  try {
    const rows: any[] = await sequelize.query(
      `SELECT product_id FROM reviews WHERE id = :id LIMIT 1`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );
    if (Array.isArray(rows) && rows.length > 0) {
      productId = String(rows[0].product_id);
    }

    await sequelize.query(
      `UPDATE reviews SET status = :status WHERE id = :id`,
      {
        replacements: { id, status },
      }
    );
  } catch (err) {}

  if (productId) {
    await syncProductRatingStore(productId);
  }

  return rev || null;
};

export const deleteReviewStore = async (id: string): Promise<boolean> => {
  let productId: string | undefined;
  const rev = reviews.find((r) => String(r.id) === String(id));
  if (rev) {
    productId = rev.productId;
  }
  const initialLen = reviews.length;
  reviews = reviews.filter((r) => String(r.id) !== String(id));

  // Delete from MySQL
  try {
    const rows: any[] = await sequelize.query(
      `SELECT product_id FROM reviews WHERE id = :id LIMIT 1`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );
    if (Array.isArray(rows) && rows.length > 0) {
      productId = String(rows[0].product_id);
    }

    await sequelize.query(`DELETE FROM reviews WHERE id = :id`, {
      replacements: { id },
    });
  } catch (err) {}

  if (productId) {
    await syncProductRatingStore(productId);
  }

  return reviews.length < initialLen || true;
};
