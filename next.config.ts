import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typescript: {
    // Permet de forcer le build même s'il y a des erreurs de types
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
