import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TAMBRÉ, maison de dattes gastronomiques",
    short_name: "TAMBRÉ",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F3EC",
    theme_color: "#251C1A",
    icons: [{ src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" }],
  };
}
