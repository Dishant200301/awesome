import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "../config/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureColumnExists(
  connection: mysql.Connection,
  dbName: string,
  table: string,
  column: string,
  definition: string
) {
  try {
    const [rows] = await connection.query<any[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [dbName, table, column]
    );
    if (!Array.isArray(rows) || rows.length === 0) {
      await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    }
  } catch {
    // Ignore migration error if already exists
  }
}

export async function initializeMySQLDatabase() {
  try {
    // 1. Connect (try directly with database first, or fallback without database for initial setup)
    let connection: mysql.Connection;
    try {
      connection = await mysql.createConnection({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.name,
        multipleStatements: true
      });
      console.log(`🔌 Connected to MySQL server at ${config.db.host}:${config.db.port} [DB: ${config.db.name}]`);
    } catch {
      // Fallback: Connect without specifying DB to attempt database creation (for local dev)
      connection = await mysql.createConnection({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        multipleStatements: true
      });
      console.log(`🔌 Connected to MySQL server at ${config.db.host}:${config.db.port}`);
      try {
        await connection.query(
          `CREATE DATABASE IF NOT EXISTS \`${config.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
        );
      } catch (createErr) {
        console.warn("⚠️ CREATE DATABASE skipped (standard on cloud/shared hosting):", (createErr as Error).message);
      }
      await connection.query(`USE \`${config.db.name}\`;`);
    }

    // 3. Read & execute SQL Schema file
    const possiblePaths = [
      path.join(__dirname, "schema.sql"),
      path.join(process.cwd(), "src", "database", "schema.sql"),
      path.join(process.cwd(), "database", "schema.sql")
    ];
    let sqlScript = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        sqlScript = fs.readFileSync(p, "utf-8");
        break;
      }
    }
    if (sqlScript) {
      await connection.query(sqlScript);
    }

    // 4. Safe migrations for existing tables (ensure LONGTEXT and metadata columns)
    const columnChecks = [
      { table: "categories", column: "banner_image", def: "LONGTEXT" },
      { table: "categories", column: "meta_title", def: "VARCHAR(500)" },
      { table: "categories", column: "meta_description", def: "TEXT" },
      { table: "categories", column: "meta_keywords", def: "TEXT" },
      { table: "sub_categories", column: "banner_image", def: "LONGTEXT" },
      { table: "sub_categories", column: "meta_title", def: "VARCHAR(500)" },
      { table: "sub_categories", column: "meta_description", def: "TEXT" },
      { table: "sub_categories", column: "meta_keywords", def: "TEXT" },
      { table: "products", column: "subcategory_id", def: "VARCHAR(64) NULL" },
      { table: "products", column: "color", def: "VARCHAR(100) NULL" },
      { table: "products", column: "color_hex", def: "VARCHAR(50) NULL" }
    ];

    for (const item of columnChecks) {
      await ensureColumnExists(connection, config.db.name, item.table, item.column, item.def);
    }

    // Ensure image_url is LONGTEXT
    const modifyColumns = [
      `ALTER TABLE categories MODIFY COLUMN image_url LONGTEXT`,
      `ALTER TABLE sub_categories MODIFY COLUMN image_url LONGTEXT`,
      `ALTER TABLE products MODIFY COLUMN image_url LONGTEXT`,
      `ALTER TABLE products MODIFY COLUMN subtitle TEXT`,
      `ALTER TABLE product_images MODIFY COLUMN image_url LONGTEXT`,
      `ALTER TABLE product_variants MODIFY COLUMN thumbnail_url LONGTEXT`,
      `ALTER TABLE product_colors MODIFY COLUMN display_image LONGTEXT, MODIFY COLUMN main_image LONGTEXT`,
      `ALTER TABLE product_color_images MODIFY COLUMN image_url LONGTEXT`,
      `ALTER TABLE brands MODIFY COLUMN logo_url LONGTEXT`
    ];

    for (const sql of modifyColumns) {
      try {
        await connection.query(sql);
      } catch {
        // Safe to ignore if already altered
      }
    }

    // 5. Ensure high-performance indexes exist for fast queries
    const indexChecks = [
      { table: "products", index: "idx_products_cat", cols: "`category_id`" },
      { table: "products", index: "idx_products_subcat", cols: "`subcategory_id`" },
      { table: "products", index: "idx_products_pub_status", cols: "`is_published`, `status`" },
      { table: "products", index: "idx_products_created", cols: "`created_at`" },
      { table: "products", index: "idx_products_price", cols: "`price`" },
      { table: "product_variants", index: "idx_variants_prod_id", cols: "`product_id`" },
      { table: "product_variants", index: "idx_variants_sku", cols: "`sku`" },
      { table: "product_images", index: "idx_images_prod_id", cols: "`product_id`" },
      { table: "product_images", index: "idx_images_var_id", cols: "`variant_id`" },
      { table: "sub_categories", index: "idx_subcats_cat_id", cols: "`category_id`" }
    ];

    for (const idx of indexChecks) {
      try {
        const [rows] = await connection.query<any[]>(
          `SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?`,
          [config.db.name, idx.table, idx.index]
        );
        if (!Array.isArray(rows) || rows.length === 0) {
          await connection.query(`CREATE INDEX \`${idx.index}\` ON \`${idx.table}\` (${idx.cols})`);
        }
      } catch {
        // Safe to ignore if index exists or table not ready
      }
    }

    console.log(`✅ MySQL Database '${config.db.name}' & all tables successfully initialized!`);
    await connection.end();
    return true;
  } catch (error) {
    console.warn(`⚠️ MySQL Database Auto-Initializer Note: ${(error as Error).message}`);
    return false;
  }
}

if (
  process.argv[1] &&
  (path.resolve(process.argv[1]) === path.resolve(__filename) ||
    process.argv[1].replace(/\\/g, "/").endsWith("init_db.ts"))
) {
  initializeMySQLDatabase().then((success) => process.exit(success ? 0 : 1));
}
