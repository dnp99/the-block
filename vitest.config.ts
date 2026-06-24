import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html"],
      // Coverage targets the logic / hooks / server / API layers. Components are
      // the view layer — exercised by example tests, but not the coverage target by design due to time constraint.
      include: ["lib/**/*.ts", "hooks/**/*.ts", "server/**/*.ts", "app/api/**/*.ts"],
      exclude: ["**/*.test.{ts,tsx}", "lib/data/**", "test/**"],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
