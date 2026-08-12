import app from "./app.js";
import { env } from "./config/env.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./config/prisma.js";

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      console.log(`
🚀 Mini ERP CRM API
────────────────────────────
Environment: ${env.NODE_ENV}
Port:        ${env.PORT}
URL:         http://localhost:${env.PORT}
Health:      http://localhost:${env.PORT}/api/health
────────────────────────────
`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down...`);

      server.close(async () => {
        await disconnectDatabase();
        console.log("✅ Server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    await disconnectDatabase();
    process.exit(1);
  }
}

startServer();