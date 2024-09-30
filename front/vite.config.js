import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    VitePWA({
      injectRegister: "inline",
      manifestFilename: "manifest.json",
      registerType: "autoUpdate",
      manifest: {
        theme_color: "#F942FF",
        background_color: "#B034C3",
        icons: [
          {
            purpose: "maskable",
            sizes: "512x512",
            src: "/assets/images/icon512_maskable.png",
            type: "image/png",
          },
          {
            purpose: "any",
            sizes: "512x512",
            src: "/assets/images/icon512_rounded.png",
            type: "image/png",
          },
        ],
        orientation: "any",
        display: "standalone",
        dir: "auto",
        lang: "fr",
        name: "Buddj.app",
        short_name: "Buddj",
        start_url: "/",
        scope: "/",
      },
    }),
  ],
});
