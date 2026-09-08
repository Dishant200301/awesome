import { Router } from "express";
import { authenticateCustomer } from "../../auth/middleware/auth.middleware.js";
import { sequelize } from "../../../database/index.js";
import { QueryTypes } from "sequelize";
const router = Router();
// In-memory cart fallback store keyed by customerId or email
const memoryCartStore = {};
// Helper to normalize user identifier
const getCustomerId = (req) => {
    const user = req.user || req.customer;
    return user?.id || user?.email || "guest_user";
};
// GET /api/v1/cart - Get user cart items
router.get("/", authenticateCustomer, async (req, res) => {
    const customerId = getCustomerId(req);
    try {
        const items = await sequelize.query(`SELECT c.id, c.product_id as productId, c.color_name as colorName, c.size, c.quantity,
              p.name as title, p.price, p.image_url as image
       FROM cart_items c
       LEFT JOIN products p ON c.product_id = p.id
       WHERE c.customer_id = :customerId`, {
            replacements: { customerId },
            type: QueryTypes.SELECT,
        });
        return res.status(200).json({
            success: true,
            data: items || memoryCartStore[customerId] || [],
        });
    }
    catch {
        return res.status(200).json({
            success: true,
            data: memoryCartStore[customerId] || [],
        });
    }
});
// POST /api/v1/cart/add - Add item to user cart
router.post("/add", authenticateCustomer, async (req, res) => {
    const customerId = getCustomerId(req);
    const { productId, colorName, size, quantity = 1, title, price, image } = req.body;
    if (!productId) {
        return res.status(400).json({ success: false, message: "productId is required" });
    }
    const itemId = `${productId}-${colorName || "default"}-${size || "default"}`;
    try {
        const existing = await sequelize.query(`SELECT * FROM cart_items WHERE customer_id = :customerId AND product_id = :productId AND color_name = :colorName AND size = :size LIMIT 1`, {
            replacements: { customerId, productId, colorName: colorName || null, size: size || null },
            type: QueryTypes.SELECT,
        });
        if (existing && existing.length > 0) {
            const newQty = (existing[0].quantity || 0) + quantity;
            await sequelize.query(`UPDATE cart_items SET quantity = :newQty, updated_at = NOW() WHERE id = :id`, { replacements: { newQty, id: existing[0].id } });
        }
        else {
            await sequelize.query(`INSERT INTO cart_items (id, customer_id, product_id, color_name, size, quantity)
         VALUES (:id, :customerId, :productId, :colorName, :size, :quantity)`, {
                replacements: {
                    id: itemId,
                    customerId,
                    productId,
                    colorName: colorName || null,
                    size: size || null,
                    quantity,
                },
            });
        }
    }
    catch {
        // In-memory fallback
        let userCart = memoryCartStore[customerId] || [];
        const idx = userCart.findIndex((item) => item.productId === productId && item.colorName === colorName && item.size === size);
        if (idx > -1) {
            userCart[idx].quantity += quantity;
        }
        else {
            userCart.push({ id: itemId, productId, colorName, size, quantity, title, price, image });
        }
        memoryCartStore[customerId] = userCart;
    }
    return res.status(200).json({ success: true, message: "Item added to cart successfully" });
});
// DELETE /api/v1/cart/item/:id - Remove item from user cart
router.delete("/item/:id", authenticateCustomer, async (req, res) => {
    const customerId = getCustomerId(req);
    const { id } = req.params;
    try {
        await sequelize.query(`DELETE FROM cart_items WHERE id = :id AND customer_id = :customerId`, {
            replacements: { id, customerId },
        });
    }
    catch {
        if (memoryCartStore[customerId]) {
            memoryCartStore[customerId] = memoryCartStore[customerId].filter((item) => item.id !== id);
        }
    }
    return res.status(200).json({ success: true, message: "Item removed from cart" });
});
// POST /api/v1/cart/merge - Merge local storage guest cart into user DB cart
router.post("/merge", authenticateCustomer, async (req, res) => {
    const customerId = getCustomerId(req);
    const guestItems = req.body.items || [];
    if (!Array.isArray(guestItems)) {
        return res.status(400).json({ success: false, message: "items must be an array" });
    }
    for (const item of guestItems) {
        if (!item.productId)
            continue;
        const itemKey = `${item.productId}-${item.colorName || "default"}-${item.size || "default"}`;
        const qty = item.quantity || 1;
        try {
            const existing = await sequelize.query(`SELECT * FROM cart_items WHERE customer_id = :customerId AND product_id = :productId AND color_name = :colorName AND size = :size LIMIT 1`, {
                replacements: {
                    customerId,
                    productId: item.productId,
                    colorName: item.colorName || null,
                    size: item.size || null,
                },
                type: QueryTypes.SELECT,
            });
            if (existing && existing.length > 0) {
                const newQty = (existing[0].quantity || 0) + qty;
                await sequelize.query(`UPDATE cart_items SET quantity = :newQty WHERE id = :id`, {
                    replacements: { newQty, id: existing[0].id },
                });
            }
            else {
                await sequelize.query(`INSERT INTO cart_items (id, customer_id, product_id, color_name, size, quantity)
           VALUES (:id, :customerId, :productId, :colorName, :size, :quantity)`, {
                    replacements: {
                        id: itemKey,
                        customerId,
                        productId: item.productId,
                        colorName: item.colorName || null,
                        size: item.size || null,
                        quantity: qty,
                    },
                });
            }
        }
        catch {
            let userCart = memoryCartStore[customerId] || [];
            const idx = userCart.findIndex((i) => i.productId === item.productId && i.colorName === item.colorName && i.size === item.size);
            if (idx > -1) {
                userCart[idx].quantity += qty;
            }
            else {
                userCart.push({
                    id: itemKey,
                    productId: item.productId,
                    colorName: item.colorName,
                    size: item.size,
                    quantity: qty,
                    title: item.title,
                    price: item.price,
                    image: item.image,
                });
            }
            memoryCartStore[customerId] = userCart;
        }
    }
    return res.status(200).json({
        success: true,
        message: "Guest cart merged successfully",
    });
});
export default router;
