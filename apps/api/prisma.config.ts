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
    url: process.env["DATABASE_URL"],
  },
});
