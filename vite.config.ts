import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    base: "/dream-home-finder/",
  },

  tanstackStart: {
    server: { entry: "server" },
  },
});
