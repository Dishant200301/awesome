import express, { Express } from "express";
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

const app: Express = express();

connectDB();

app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(compression());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(morgan("dev"));

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


// Browser Extension Fallback (Fatkun / Chrome Extensions)
app.use("/api/ext", (_req, res) => {
  res.status(200).json({ success: true, message: "Extension endpoint active" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP", database: "MySQL", timestamp: new Date().toISOString() });
});

export default app;
