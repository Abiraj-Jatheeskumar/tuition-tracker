import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const site = String(env.VITE_SITE_URL || "")
    .trim()
    .replace(/\/$/, "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "html-social-meta",
        transformIndexHtml(html) {
          const ogImage = site ? `${site}/og-cover.svg` : "/og-cover.svg";
          let out = html.replace(/%OG_IMAGE%/g, ogImage);
          const canonical = site ? `${site}/` : "/";
          out = out.replace(/%CANONICAL%/g, canonical);
          return out;
        },
      },
    ],
  };
});
