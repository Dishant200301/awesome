import fs from "fs";
import path from "path";
import { connectDB, sequelize } from "./index.js";
import { syncCategoryToMySQL, syncSubcategoryToMySQL, syncProductToMySQL } from "./mysqlSync.js";
async function runSync() {
    console.log("🔄 Starting JSON to MySQL Synchronization...");
    await connectDB();
    // 1. Sync Categories & Subcategories
    const taxPath = path.join(process.cwd(), "taxonomies_db.json");
    if (fs.existsSync(taxPath)) {
        try {
            const raw = fs.readFileSync(taxPath, "utf-8");
            const data = JSON.parse(raw);
            if (Array.isArray(data.categories)) {
                console.log(`📁 Syncing ${data.categories.length} Categories to MySQL...`);
                for (const cat of data.categories) {
                    await syncCategoryToMySQL(cat);
                }
                console.log(`✅ Categories synced!`);
            }
            if (Array.isArray(data.subcategories)) {
                console.log(`📂 Syncing ${data.subcategories.length} Subcategories to MySQL...`);
                for (const sub of data.subcategories) {
                    await syncSubcategoryToMySQL(sub);
                }
                console.log(`✅ Subcategories synced!`);
            }
        }
        catch (e) {
            console.error("Error reading taxonomies_db.json:", e);
        }
    }
    // 2. Sync Products
    const prodPath = path.join(process.cwd(), "products_db.json");
    if (fs.existsSync(prodPath)) {
        try {
            const raw = fs.readFileSync(prodPath, "utf-8");
            const prods = JSON.parse(raw);
            if (Array.isArray(prods)) {
                console.log(`🛍️ Syncing ${prods.length} Products to MySQL...`);
                let count = 0;
                for (const p of prods) {
                    await syncProductToMySQL(p);
                    count++;
                    if (count % 20 === 0 || count === prods.length) {
                        console.log(`   Processed ${count}/${prods.length} products...`);
                    }
                }
                console.log(`✅ All ${prods.length} Products successfully synced to MySQL!`);
            }
        }
        catch (e) {
            console.error("Error reading products_db.json:", e);
        }
    }
    console.log("🎉 Synchronization to MySQL complete!");
    await sequelize.close();
    process.exit(0);
}
runSync();
