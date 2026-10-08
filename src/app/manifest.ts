import type { MetadataRoute } from "next";

// Makes "Add to Home Screen" / "Install app" show the Readly name and R logo.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Readly",
    short_name: "Readly",
    description: "Your digital library — discover and read e-books.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f1e8",
    theme_color: "#0b4a3b",
    categories: ["books", "education", "entertainment"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
