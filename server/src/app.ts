import express, { Express, Request, Response, NextFunction } from "express";
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
import { connectDB } from "./database/index.js";
import { config } from "./config/index.js";

const app: Express = express();

connectDB();

app.use(helmet());

// Production CORS Configuration with explicit allowlist
const allowedProductionOrigins = [
  "https://awesomehandwork.com",
  "https://www.awesomehandwork.com",
  "https://admin.awesomehandwork.com"
];

const devOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (server-to-server, curl, mobile clients)
    if (!origin) return callback(null, true);

    const validOrigins = config.env === "production"
      ? allowedProductionOrigins
      : [...allowedProductionOrigins, ...devOrigins];

    if (validOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(compression());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(morgan("dev"));

// Health Check Endpoint (Safe: no secrets, credentials, or DB passwords exposed)
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "awesome-api",
    uptime: Math.floor(process.uptime())
  });
});

// Browser Extension Fallback
app.use("/api/ext", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Extension endpoint active" });
});

// API Routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/attributes", attributeRoutes);
app.use("/api/v1/filters", filterRoutes);
app.use("/api/v1/size-guides", sizeGuideRoutes);
app.use("/api/v1/taxonomies", taxonomyRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/contacts", contactRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);

// 404 Handler for undefined API routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "API endpoint not found" });
});

// Production Safe Error Handler (Never expose stack traces or internal secrets)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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
