import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.svg", "**/*.csv"],
  // Only imported lazily, so pre-bundle it at startup; otherwise the dev server bundles it later
  // against a second copy of React.
  optimizeDeps: { include: ["@paper-design/shaders-react"] },
});
