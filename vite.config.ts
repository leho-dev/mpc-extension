import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: ["index.html"]
    },
    outDir: "dist",
    target: "esnext",
    minify: false
  },
  resolve: {
    extensions: [".js", ".ts"]
  },
  plugins: []
});
