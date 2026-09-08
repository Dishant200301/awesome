import { sequelize } from "../../../database/index.js";
const DEFAULT_SEED_MESSAGES = [
    {
        id: "cm-101",
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        phone: "+91 98251 34098",
        subject: "Custom Bridal Choli Enquiry",
        message: "Hi Awesome Handmade team, I love your handcrafted Navratri collection! Can you customize the mirror work on the royal blue Choli with gold Latkans for my wedding function next month?",
        status: "New",
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
        id: "cm-102",
        name: "Ananya Patel",
        email: "ananya.patel@gmail.com",
        phone: "+91 94260 88123",
        subject: "Bulk Order for Wedding Tassels & Latkans",
        message: "Hello! We are looking to order around 50 pairs of Handcrafted Royal Mirror Latkans as wedding favors for our sangeet ceremony. Is there a bulk discount available?",
        status: "New",
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
        id: "cm-103",
        name: "Neha Mehta",
        email: "neha.mehta@yahoo.com",
        phone: "+91 97245 11980",
        subject: "Delivery Timeline to Ahmedabad",
        message: "I want to place an order for the handmade necklace set and latkan pair. Could you please confirm if express delivery to Ahmedabad within 3 days is possible?",
        status: "Read",
        date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: "cm-104",
        name: "Ritu Verma",
        email: "ritu.verma@outlook.com",
        phone: "+91 99099 44321",
        subject: "Matching Accessories for Choli Set",
        message: "Thank you for the quick shipping! Just wanted to ask if you have matching hair accessories or tassels available for the maroon designer choli?",
        status: "Replied",
        date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        replyText: "Hi Ritu, yes! We have matching hair tassels and latkans in maroon velvet and mirror work. We have sent the catalog to your email."
    }
];
let cachedContactMessages = [...DEFAULT_SEED_MESSAGES];
let isTableInitialized = false;
export async function refreshContactMessagesFromMySQL() {
    try {
        // 1. Ensure table exists
        if (!isTableInitialized) {
            await sequelize.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          email VARCHAR(150) NOT NULL,
          phone VARCHAR(50),
          subject VARCHAR(255),
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'New',
          reply_text TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);
            isTableInitialized = true;
        }
        // 2. Fetch rows from MySQL
        const [rows] = await sequelize.query(`SELECT * FROM contact_messages ORDER BY created_at DESC`);
        if (Array.isArray(rows) && rows.length > 0) {
            cachedContactMessages = rows.map((r) => ({
                id: String(r.id),
                name: r.name || "Customer",
                email: r.email || "",
                phone: r.phone || "",
                subject: r.subject || "General Inquiry",
                message: r.message || "",
                status: (r.status || "New"),
                date: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
                replyText: r.reply_text || undefined
            }));
            return cachedContactMessages;
        }
        // 3. If MySQL table has 0 rows, seed initial realistic inquiries into MySQL
        for (const msg of DEFAULT_SEED_MESSAGES) {
            await sequelize.query(`
        INSERT INTO contact_messages (id, name, email, phone, subject, message, status, reply_text, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status)
      `, {
                replacements: [
                    msg.id,
                    msg.name,
                    msg.email,
                    msg.phone || null,
                    msg.subject,
                    msg.message,
                    msg.status,
                    msg.replyText || null,
                    msg.createdAt || new Date().toISOString()
                ]
            });
        }
        cachedContactMessages = [...DEFAULT_SEED_MESSAGES];
        return cachedContactMessages;
    }
    catch (err) {
        console.warn("[ContactStore] MySQL query failed, using in-memory cache:", err.message);
        return cachedContactMessages;
    }
}
export const getContactMessagesStore = async (filterStatus, search) => {
    const all = await refreshContactMessagesFromMySQL();
    let list = [...all];
    if (filterStatus && filterStatus.toUpperCase() !== 'ALL') {
        const targetStatus = filterStatus.trim().toLowerCase();
        list = list.filter((m) => m.status.toLowerCase() === targetStatus);
    }
    if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        list = list.filter((m) => m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.subject.toLowerCase().includes(q) ||
            m.message.toLowerCase().includes(q));
    }
    return list;
};
// Synchronous getter for analytics store
export const getContactMessagesSync = () => {
    return cachedContactMessages;
};
export const createContactMessageStore = async (data) => {
    const newMsg = {
        id: `cm-${Date.now()}`,
        name: (data.name || "Customer").trim(),
        email: (data.email || "customer@example.com").trim(),
        phone: (data.phone || "").trim(),
        subject: (data.subject || "General Inquiry").trim(),
        message: (data.message || "").trim(),
        status: "New",
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString()
    };
    try {
        await sequelize.query(`
      INSERT INTO contact_messages (id, name, email, phone, subject, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'New', NOW())
    `, {
            replacements: [
                newMsg.id,
                newMsg.name,
                newMsg.email,
                newMsg.phone || null,
                newMsg.subject,
                newMsg.message
            ]
        });
    }
    catch (err) {
        console.error("[ContactStore] Failed to insert contact message into MySQL:", err.message);
    }
    cachedContactMessages.unshift(newMsg);
    return newMsg;
};
export const updateContactMessageStatusStore = async (id, status, replyText) => {
    try {
        await sequelize.query(`
      UPDATE contact_messages SET status = ?, reply_text = ? WHERE id = ?
    `, {
            replacements: [status, replyText || null, id]
        });
    }
    catch (err) {
        console.error(`[ContactStore] Failed to update contact status for '${id}':`, err.message);
    }
    const msg = cachedContactMessages.find((m) => m.id === id);
    if (msg) {
        msg.status = status;
        if (replyText) {
            msg.replyText = replyText;
        }
    }
    return msg || null;
};
export const deleteContactMessageStore = async (id) => {
    try {
        await sequelize.query(`DELETE FROM contact_messages WHERE id = ?`, {
            replacements: [id]
        });
    }
    catch (err) {
        console.error(`[ContactStore] Failed to delete contact message '${id}':`, err.message);
    }
    const len = cachedContactMessages.length;
    cachedContactMessages = cachedContactMessages.filter((m) => m.id !== id);
    return cachedContactMessages.length < len;
};
