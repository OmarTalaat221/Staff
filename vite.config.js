import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import compression from "vite-plugin-compression";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),

    // Gzip compression for production
    compression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 10240, // only compress files > 10kb
    }),

    // Brotli compression (better than gzip)
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 10240,
    }),

    // Bundle visualizer - only in analyze mode
    // Run: ANALYZE=true npm run build
    mode === "analyze" &&
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: "dist/stats.html",
      }),
  ].filter(Boolean),

  build: {
    // Target modern browsers - smaller output
    target: "es2015",

    // Disable source maps in production
    sourcemap: false,

    // Increase warning limit to avoid noise
    chunkSizeWarningLimit: 1000,

    // Minification
    minify: "esbuild",

    // esbuild options
    esbuildOptions: {
      // Remove console.log and debugger in production
      drop: mode === "production" ? ["console", "debugger"] : [],
    },

    rollupOptions: {
      output: {
        // Manual chunks - split vendor code into logical groups
        manualChunks(id) {
          // React core - loaded first, cached long
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          // Ant Design - large library, separate chunk
          if (
            id.includes("node_modules/antd/") ||
            id.includes("node_modules/@ant-design/") ||
            id.includes("node_modules/rc-")
          ) {
            return "vendor-antd";
          }

          // Lucide icons - separate chunk
          if (id.includes("node_modules/lucide-react/")) {
            return "vendor-icons";
          }

          // dayjs - separate chunk
          if (id.includes("node_modules/dayjs/")) {
            return "vendor-dayjs";
          }

          // Other utilities
          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }
        },

        // Consistent file naming
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
  },

  // Optimize deps pre-bundling
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "antd", "dayjs"],
    exclude: [],
  },
}));
