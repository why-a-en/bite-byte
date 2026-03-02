// Prisma 7 configuration file
// Connection URL is read from DATABASE_URL env var.
// Load .env file if available (dotenv/config), but gracefully skip if not present
// (e.g., when DATABASE_URL is already set in the environment)
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv/config");
} catch {
  // dotenv not available — DATABASE_URL must already be in env
}
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use MIGRATION_DATABASE_URL (superuser) for migrations if set,
    // falling back to DATABASE_URL (application user, non-superuser)
    url: process.env["MIGRATION_DATABASE_URL"] ?? process.env["DATABASE_URL"],
  },
});
