import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ajoute le 2026-08-28 pour la conteneurisation, et uniquement pour ca.
  //
  // Sans cette ligne, l'image doit embarquer l'integralite de node_modules
  // pour que `next start` fonctionne. Avec elle, Next trace les dependances
  // reellement atteintes et les recopie dans .next/standalone : on embarque ce
  // sous-ensemble, et l'image se compte en dizaines de mega-octets plutot
  // qu'en centaines.
  //
  // C'est un changement d'EMPAQUETAGE, pas de produit : aucun comportement de
  // l'application ne change, seul le contenu de l'image bouge.
  output: "standalone",

  experimental: {
    ppr: true,
    clientSegmentCache: true,
  },
};

export default nextConfig;
