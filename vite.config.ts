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
});

// function manualChunks(id: string) {
//   if (id.includes("node_modules")) {
//     id = id.replace(/.+?\/node_modules\/(.+?)\/.*/, "$1");
//     switch (id) {
//       case "three":
//       case "three-stdlib":
//       case "@react-three":
//         return id;
//       case "react-dom":
//       case "react-reconciler":
//         return "react";
//       case "@reduxjs":
//       case "redux":
//         return "redux";
//       default:
//         return "vendor";
//     }
//     // // if (id.includes("/@react-three")) return "react-three";
//     // if (!patterns[id]) {
//     //   console.log(id);
//     //   patterns[id] = "ok";
//     // }
//     // if (id) return id;

//     // return "vendor";
//   }

//   return null;
// }
