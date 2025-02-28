import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ⚠️ Attention: cela ignore les erreurs de type pendant la production
    // À utiliser uniquement si vous êtes bloqué par cette erreur spécifique
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
