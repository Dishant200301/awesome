import "./processHandler.js";
import app from "./app.js";
import { config } from "./config/index.js";
import { sequelize } from "./database/index.js";
const PORT = Number(process.env.PORT) || config.port || 5000;
const HOST = process.env.HOST || "0.0.0.0";
console.log("==========================================");
console.log("🚀 Starting Awesome Handwork API");
console.log("Node version   :", process.version);
console.log("Environment    :", config.env);
console.log("Configured Port:", PORT);
console.log("Configured Host:", HOST);
console.log("Database Name  :", config.db.name);
console.log("Database Host  :", `${config.db.host}:${config.db.port}`);
console.log("==========================================");
const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 AwesomeHandwork API running on http://${HOST}:${PORT} [${config.env}]`);
});
// Graceful Shutdown Handling (SIGTERM & SIGINT)
const gracefulShutdown = async (signal) => {
    console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);
    // Stop accepting new connections
    server.close(async (err) => {
        if (err) {
            console.error("[Server] Error while closing HTTP server:", err);
            process.exit(1);
        }
        console.log("[Server] HTTP server closed successfully.");
        try {
            await sequelize.close();
            console.log("[Server] Database connection closed successfully.");
        }
        catch (dbErr) {
            console.error("[Server] Error closing database connection:", dbErr);
        }
        console.log("[Server] Process terminated cleanly.");
        process.exit(0);
    });
    // Force shutdown if cleanup takes longer than 10 seconds
    setTimeout(() => {
        console.error("[Server] Forced shutdown: Cleanup exceeded 10s timeout.");
        process.exit(1);
    }, 10000).unref();
};
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
