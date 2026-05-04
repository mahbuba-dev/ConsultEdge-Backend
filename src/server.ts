import app from "./app";
import { envVars } from "./config/env";
import { createServer } from "node:http";

import { seedAdmin, seedDemoClient } from "./utilis/seed";
import { connectPrismaWithRetry, prisma } from "./lib/prisma";

const httpServer = createServer(app);

let isShuttingDown = false;

const shutdown = async (signal: string, exitCode = 0) => {
    if (isShuttingDown) {
        return;
    }

    isShuttingDown = true;
    console.log(`${signal} received. Shutting down gracefully...`);

    if (httpServer.listening) {
        try {
            await new Promise<void>((resolve, reject) => {
                httpServer.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            });
        } catch (error) {
            console.error("Failed to close HTTP server cleanly:", error);
            exitCode = 1;
        }
    }

    try {
        await prisma.$disconnect();
    } catch (error) {
        console.error("Failed to disconnect Prisma cleanly:", error);
        exitCode = 1;
    }

    process.exit(exitCode);
};

process.on("SIGINT", () => {
    void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);

    if (envVars.NODE_ENV === "development") {
        return;
    }

    void shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    void shutdown("uncaughtException", 1);
});

const bootstrap = async() => {
    const port = Number(envVars.PORT);

    try {
        await connectPrismaWithRetry({ retries: 5, retryDelayMs: 2000 });

        // Defensive: ensure the live DB Role enum has all expected values.
        // In some historical deploys the `_prisma_migrations` table got out of
        // sync with the actual enum definition, which causes downstream seed
        // calls (signUpEmail with role=CLIENT) to fail with P2007. This is
        // idempotent and safe to run on every boot.
        try {
            await prisma.$executeRawUnsafe(
                `ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CLIENT';`
            );
            await prisma.$executeRawUnsafe(
                `ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'EXPERT';`
            );
            await prisma.$executeRawUnsafe(
                `ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ADMIN';`
            );
        } catch (enumErr) {
            console.warn("Role enum self-heal skipped:", enumErr);
        }

        await seedAdmin();

        // Demo seeding must never block the server from starting in
        // production. If it fails (e.g. transient DB issue, missing enum
        // value, etc.) log it and continue.
        try {
            await seedDemoClient();
        } catch (demoErr) {
            console.error("seedDemoClient failed (non-fatal):", demoErr);
        }

        await new Promise<void>((resolve, reject) => {
            httpServer.once("error", reject);
            httpServer.listen(port, () => {
                httpServer.off("error", reject);
                console.log(`Server is running on http://localhost:${port}`);
                resolve();
            });
        });
    } catch (error) {
        const startupError = error as NodeJS.ErrnoException;
        if (startupError.code === "EADDRINUSE") {
            console.error(
                `Port ${port} is already in use. Stop the existing process or change PORT in .env.`
            );
        } else {
            console.error('Failed to start server:', error);
        }
        await prisma.$disconnect().catch(() => null);
        process.exit(1);
    }
}

bootstrap();