import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// const patterns: Record<string, string> = {};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: true,
    rollupOptions: {
      // external: [/\.glb\//],
      output: {
        manualChunks: {
          three: ["three"],
          "three-stdlib": ["three-stdlib"],
          react: ["react-dom", "react", "react-reconciler"],
        },
        // (id) => manualChunks(id),
      },
    },
  },
  resolve: { alias: { "/app": "/src/app" } },
  server: {
    proxy: {
      "/api": {
        target: "https://nd.footstar.org/match/get_data_nviewer.asp",
        changeOrigin: true,
        rewrite: (path) => {
          // console.log("path", path, path.replace(/^\/api\//, "?jogo_id="));
          return path.replace(/^\/api\//, "?jogo_id=");
        },
      },
    },
  },
});
