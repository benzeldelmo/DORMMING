import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

// HTTPS (self-signed) so phones on the dorm Wi-Fi allow the live camera for Scan QR.
// The API is proxied through the same address, so an https page never calls plain http.
const api = { "/api": "http://localhost:8080" };

export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  server: {
    host: true,
    port: 5180,
    strictPort: true,
    proxy: api,
  },
  // `npm run preview` (the built app) talks to the same backend
  preview: { host: true, port: 5180, strictPort: true, proxy: api },
});
