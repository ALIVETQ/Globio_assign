import { defineConfig } from "vite";

export default defineConfig({
  test: {
    // Only logic/ and data/ are tested (ARCHITECTURE.md §9); no DOM needed.
    include: ["tests/**/*.test.js"],
    environment: "node",
  },
});
