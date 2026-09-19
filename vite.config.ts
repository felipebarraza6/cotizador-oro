import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** GitHub Pages: https://felipebarraza6.github.io/cotizador-oro/ */
export default defineConfig({
  plugins: [react()],
  base: "/cotizador-oro/",
});
