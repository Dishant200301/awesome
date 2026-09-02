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
        rating INT NOT NULL DEFAULT 5,
        comment TEXT NOT NULL,
        date VARCHAR(50),
        verified BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'Approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
  } catch (err) {
    // Database table creation skipped if offline
  }
};

// Auto-run table init
initReviewTable();

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
      query += " AND (LOWER(author) LIKE :search OR LOWER(email) LIKE :search OR LOWER(product_name) LIKE :search OR LOWER(comment) LIKE :search)";
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
        (r.comment && r.comment.toLowerCase().includes(q))
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
    author: (data.author || "Customer").trim().toUpperCase(),
    email: (data.email || "").trim().toLowerCase(),
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
      `INSERT INTO reviews (id, product_id, product_name, product_image, author, email, rating, comment, date, verified, status, created_at)
       VALUES (:id, :productId, :productName, :productImage, :author, :email, :rating, :comment, :date, :verified, :status, NOW())
       ON DUPLICATE KEY UPDATE 
         rating = VALUES(rating),
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

  // 3. Update Product rating and review count
  try {
    const productReviews = reviews.filter((r) => String(r.productId) === String(newReview.productId) && r.status !== "Rejected");
    const product = productStore.getByIdOrSlug(newReview.productId);
    if (product) {
      const count = productReviews.length;
      const sum = productReviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      const avg = count > 0 ? Number((sum / count).toFixed(1)) : 5.0;
      productStore.update(newReview.productId, {
        rating: avg,
        reviewCount: count,
      });
    }
  } catch (err) {}


  return newReview;
};

export const updateReviewStatusStore = async (
  id: string,
  status: "Approved" | "Pending" | "Rejected"
): Promise<ReviewItem | null> => {
  const rev = reviews.find((r) => String(r.id) === String(id));
  if (rev) {
    rev.status = status;
  }

  // Update in MySQL
  try {
    await sequelize.query(
      `UPDATE reviews SET status = :status WHERE id = :id`,
      {
        replacements: { id, status },
      }
    );
  } catch (err) {}

  return rev || null;
};

export const deleteReviewStore = async (id: string): Promise<boolean> => {
  const initialLen = reviews.length;
  reviews = reviews.filter((r) => String(r.id) !== String(id));

  // Delete from MySQL
  try {
    await sequelize.query(`DELETE FROM reviews WHERE id = :id`, {
      replacements: { id },
    });
  } catch (err) {}

  return reviews.length < initialLen || true;
};
