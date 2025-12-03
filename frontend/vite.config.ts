import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react"; // or vue, etc.
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
      open: true, // opens in browser after build
    }),
  ],
});
