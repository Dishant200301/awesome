import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import productRoutes from "./modules/product/routes/product.routes.js";
import filterRoutes from "./modules/product/routes/filter.routes.js";
import sizeGuideRoutes from "./modules/product/routes/sizeGuide.routes.js";
import taxonomyRoutes from "./modules/product/routes/taxonomy.routes.js";
import contactRoutes from "./modules/product/routes/contact.routes.js";
import analyticsRoutes from "./modules/product/routes/analytics.routes.js";
import attributeRoutes from "./modules/product/routes/attribute.routes.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";
import cartRoutes from "./modules/cart/routes/cart.routes.js";
import wishlistRoutes from "./modules/wishlist/routes/wishlist.routes.js";
import contentRoutes from "./modules/product/routes/content.routes.js";
import reviewRoutes from "./modules/product/routes/review.routes.js";
import { connectDB, isMySQLConnected } from "./database/index.js";
import { config } from "./config/index.js";
const app = express();
connectDB();
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: false,
    hsts: config.env === "production" ? { maxAge: 15552000, includeSubDomains: true } : false,
}));
// Production and Development CORS Configuration
const allowedProductionOrigins = [
    "https://awesomehandwork.com",
    "https://www.awesomehandwork.com",
    "https://admin.awesomehandwork.com"
];
const devOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175"
];
app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser requests (server-to-server, curl, mobile clients)
        if (!origin)
            return callback(null, true);
        // In development or local testing, allow localhost, 127.0.0.1, or local LAN IPs (e.g. 192.168.x.x, 10.x.x.x) on any port
        if (config.env !== "production") {
            if (/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) {
                return callback(null, true);
            }
        }
        const validOrigins = [...allowedProductionOrigins, ...devOrigins];
        if (validOrigins.includes(origin) || /^https?:\/\/([a-z0-9-]+\.)*awesomehandwork\.com$/.test(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
}));
app.use(compression());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(morgan("dev"));
// Root API Endpoint
app.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 Awesome Handwork API is running",
        health: "/health",
        version: "1.0.0"
    });
});
// Health Check Endpoint (Safe: no secrets, credentials, or DB passwords exposed)
app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        service: "api",
        status: "ok",
        uptime: Math.floor(process.uptime()),
        database: isMySQLConnected ? "connected" : "disconnected"
    });
});
// Browser Extension Fallback
app.use("/api/ext", (_req, res) => {
    res.status(200).json({ success: true, message: "Extension endpoint active" });
});
// API Routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/attributes", attributeRoutes);
app.use("/api/v1/filters", filterRoutes);
app.use("/api/v1/size-guides", sizeGuideRoutes);
app.use("/api/v1/taxonomies", taxonomyRoutes);
app.use("/api/v1/categories", taxonomyRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/contacts", contactRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
// 404 Handler for undefined API routes
app.use((_req, res) => {
    res.status(404).json({ success: false, message: "API endpoint not found" });
});
// Production Safe Error Handler (Never expose stack traces or internal secrets)
app.use((err, _req, res, _next) => {
    console.error("[API Error]:", err);
    const status = typeof err.status === "number" ? err.status : 500;
    const message = config.env === "production" && status === 500
        ? "Internal Server Error"
        : (err.message || "An unexpected error occurred");
    res.status(status).json({
        success: false,
        message
    });
});
export default app;
