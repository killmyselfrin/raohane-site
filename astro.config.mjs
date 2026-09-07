import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://killmyselfrin.github.io",
  base: "/raohane-site/",
  output: "static",
  build: {
    assets: "assets"
  }
});
