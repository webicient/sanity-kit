import { config } from "dotenv";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["test/setup.ts"],
    env: {
      ...config({ path: "studio/.env.local" }).parsed,
    },
  },
  optimizeDeps: {
    disabled: false,
  },
});
