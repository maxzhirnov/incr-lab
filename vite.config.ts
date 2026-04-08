import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: new URL("./index.html", import.meta.url).pathname,
        retargeting: new URL("./retargeting.html", import.meta.url).pathname,
        experimentSize: new URL("./experiment-size.html", import.meta.url).pathname,
      },
    },
  },
});
