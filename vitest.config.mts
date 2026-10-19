import { defineConfig } from "vitest/config";
import path from "path";
export default defineConfig({
  test: { include: ["tests/**/*.test.ts"], environment: "node", testTimeout: 60000 },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src"), "server-only": path.resolve(import.meta.dirname, "tests/empty.ts") } },
});
