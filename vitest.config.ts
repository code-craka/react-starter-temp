import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/tests/e2e/**", // Exclude Playwright E2E tests
      "**/tests/load/**", // Exclude k6 load tests
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: [
        "app/lib/**/*.{ts,tsx}",
        "app/components/ui/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.d.ts",
        "**/*.config.*",
        "**/dist/**",
        "**/build/**",
        "**/.{idea,git,cache,output,temp}/**",
        "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
        "**/node_modules/**",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "tests/**",
        "**/app/lib/sentry.client.ts", // Browser-only, requires window object
        "**/app/components/ui/chart.tsx", // Complex charting component
        "**/app/components/ui/sidebar.tsx", // Complex sidebar with React context
      ],
      thresholds: {
        statements: 25,
        branches: 20,
        functions: 20,
        lines: 25,
      },
    },
    // Watch mode for development
    watch: false,
    // CI mode
    reporters: ["verbose"],
    // Increase timeout for slower tests
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});
