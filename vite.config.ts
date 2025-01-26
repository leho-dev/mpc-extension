import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

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
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "manifest.json",
          dest: "."
        },
        {
          src: "src/assets/img",
          dest: "src/assets"
        },
        {
          src: "src/assets/xlsx",
          dest: "src/assets"
        }
      ]
    })
  ]
});
