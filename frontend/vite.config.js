import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Rutas relativas para poder publicar en GitHub Pages, Vercel o Netlify.
  base: "./",
});
