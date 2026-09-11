/**
 * Process lifecycle & crash handlers
 * Registered before any application module evaluation
 */

process.on("uncaughtException", (error: Error) => {
  console.error("[CRITICAL] UNCAUGHT_EXCEPTION:", error);
});

process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
  console.error("[CRITICAL] UNHANDLED_REJECTION at:", promise, "reason:", reason);
});

console.log("[Bootstrap] Process crash and unhandled rejection listeners registered.");
