import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "../../../config/index.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ADMINS_DB_FILE = path.resolve(__dirname, "../../../../../admins_db.json");
// Default initial seeded admin accounts for Awesome Handmade
const DEFAULT_ADMINS = [
    {
        id: "admin-awesome-1",
        name: "Awesome Handmade Admin",
        email: "admin@awesomehandmade.com",
        password: "Awesome@123",
        role: "Super Admin",
        is_active: true
    },
    {
        id: "admin-awesome-2",
        name: "Super Admin",
        email: "admin@awesome.com",
        password: "Awesome@123",
        role: "Super Admin",
        is_active: true
    }
];
function getLocalAdmins() {
    try {
        if (fs.existsSync(ADMINS_DB_FILE)) {
            const data = fs.readFileSync(ADMINS_DB_FILE, "utf-8");
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    }
    catch (e) { }
    // Auto seed local file
    try {
        fs.writeFileSync(ADMINS_DB_FILE, JSON.stringify(DEFAULT_ADMINS, null, 2), "utf-8");
    }
    catch (e) { }
    return [...DEFAULT_ADMINS];
}
function saveLocalAdmins(admins) {
    try {
        fs.writeFileSync(ADMINS_DB_FILE, JSON.stringify(admins, null, 2), "utf-8");
    }
    catch (e) { }
}
let pool = null;
async function getPool() {
    if (pool)
        return pool;
    try {
        const p = mysql.createPool({
            host: config.db.host,
            port: config.db.port,
            user: config.db.user,
            password: config.db.password,
            database: config.db.name,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        // Test connection
        const conn = await p.getConnection();
        conn.release();
        pool = p;
        // Ensure admins table exists in MySQL
        await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Super Admin',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
        // Seed default admin accounts if empty
        for (const def of DEFAULT_ADMINS) {
            const [existing] = await pool.query("SELECT id FROM admins WHERE email = ?", [def.email]);
            if (!existing || existing.length === 0) {
                const hash = await bcrypt.hash(def.password, 10);
                await pool.query("INSERT INTO admins (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)", [def.id, def.name, def.email, hash, def.role, true]);
            }
        }
        return pool;
    }
    catch (e) {
        // MySQL offline - local file database fallback
        return null;
    }
}
export class AdminAuthService {
    /**
     * Register a new admin
     */
    static async adminSignUp(name, email, pass, role = "Super Admin") {
        const cleanEmail = email.trim().toLowerCase();
        const p = await getPool();
        if (p) {
            const [rows] = await p.query("SELECT id FROM admins WHERE email = ?", [cleanEmail]);
            if (rows && rows.length > 0) {
                throw new Error("An admin account with this email address already exists.");
            }
            const id = `admin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const passwordHash = await bcrypt.hash(pass, 10);
            await p.query("INSERT INTO admins (id, name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, ?, ?)", [id, name.trim(), cleanEmail, passwordHash, role, true]);
            const token = jwt.sign({ id, email: cleanEmail, role, type: "admin" }, config.jwt.accessSecret, { expiresIn: (config.jwt.accessExpiresIn || "24h") });
            return {
                user: { id, name: name.trim(), email: cleanEmail, role },
                token
            };
        }
        // Local JSON fallback
        const localAdmins = getLocalAdmins();
        if (localAdmins.some((a) => a.email.toLowerCase() === cleanEmail)) {
            throw new Error("An admin account with this email address already exists.");
        }
        const id = `admin-${Date.now()}`;
        const newAdmin = {
            id,
            name: name.trim(),
            email: cleanEmail,
            password: pass,
            role,
            is_active: true
        };
        localAdmins.push(newAdmin);
        saveLocalAdmins(localAdmins);
        const token = jwt.sign({ id, email: cleanEmail, role, type: "admin" }, config.jwt.accessSecret, { expiresIn: (config.jwt.accessExpiresIn || "24h") });
        return {
            user: { id, name: newAdmin.name, email: cleanEmail, role },
            token
        };
    }
    /**
     * Sign In admin using email and password
     */
    static async adminSignIn(email, pass) {
        const cleanEmail = email.trim().toLowerCase();
        const p = await getPool();
        if (p) {
            const [rows] = await p.query("SELECT id, name, email, password_hash, role, is_active FROM admins WHERE email = ?", [cleanEmail]);
            if (!rows || rows.length === 0) {
                throw new Error("Access Denied: Invalid admin email or password.");
            }
            const admin = rows[0];
            if (!admin.is_active) {
                throw new Error("Access Denied: Your admin account has been deactivated.");
            }
            const isMatch = await bcrypt.compare(pass, admin.password_hash);
            if (!isMatch) {
                throw new Error("Access Denied: Invalid admin email or password.");
            }
            const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role, type: "admin" }, config.jwt.accessSecret, { expiresIn: (config.jwt.accessExpiresIn || "24h") });
            return {
                user: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                },
                token
            };
        }
        // Local JSON Database
        const localAdmins = getLocalAdmins();
        const admin = localAdmins.find((a) => a.email.toLowerCase() === cleanEmail);
        if (!admin) {
            throw new Error("Access Denied: Invalid admin email or password.");
        }
        if (admin.is_active === false) {
            throw new Error("Access Denied: Your admin account has been deactivated.");
        }
        // Check plain password or hashed password
        let isMatch = false;
        if (admin.password && admin.password === pass) {
            isMatch = true;
        }
        else if (admin.password_hash) {
            isMatch = await bcrypt.compare(pass, admin.password_hash);
        }
        if (!isMatch) {
            throw new Error("Access Denied: Invalid admin email or password.");
        }
        const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role || "Super Admin", type: "admin" }, config.jwt.accessSecret, { expiresIn: (config.jwt.accessExpiresIn || "24h") });
        return {
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role || "Super Admin"
            },
            token
        };
    }
    /**
     * Get current authenticated admin profile
     */
    static async getAdminProfile(id) {
        const p = await getPool();
        if (p) {
            const [rows] = await p.query("SELECT id, name, email, role, is_active FROM admins WHERE id = ?", [id]);
            if (!rows || rows.length === 0) {
                throw new Error("Admin user not found.");
            }
            const admin = rows[0];
            return {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            };
        }
        const localAdmins = getLocalAdmins();
        const admin = localAdmins.find((a) => String(a.id) === String(id));
        if (!admin) {
            throw new Error("Admin user not found.");
        }
        return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role || "Super Admin"
        };
    }
}
