import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nexus Talenta Indonesia Academy",
    short_name: "Nexus Academy",
    description:
      "Platform belajar online bahasa Jepang, English interview, Arabic harian, PMP prep, dan AI tutor dari Nexus Talenta Indonesia.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/icon.png",
        sizes: "200x200",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
