#!/usr/bin/env bash
# Retire de l'image de production les artefacts qui n'existent que pour construire.
#
# Contexte. Cette application est déployée par Coolify avec nixpacks, qui produit
# une image mono-étage : tout ce qui a servi au build reste dans l'image finale.
# Le scan hebdomadaire (job 25 du homelab) y comptait des CVE critiques portées
# par des fichiers qu'aucun chemin d'exécution n'atteint. Mesuré le 2026-08-26,
# sur l'image en service :
#
#   stdlib 1.20.7 / 1.23.8   CVE-2024-24790, CVE-2025-68121   ×6, dans les
#   binaires Go d'esbuild (esbuild@0.18.20 et @0.25.4, chacun en double :
#   paquet `esbuild` + paquet natif `@esbuild/linux-x64`)
#
# Ce script les supprime pendant la phase de build, donc dans la même couche :
# l'image rétrécit vraiment, au lieu d'empiler une couche de suppression.
#
# Appelé depuis le `build_command` de l'application Coolify :
#   pnpm run build && bash scripts/prune-build-residues.sh
#
# Pourquoi c'est sûr ici, et à re-vérifier avant d'étendre : l'application
# démarre par `next start` sur un `.next` déjà construit (pnpm vient du profil
# nix, PAS du shim corepack — pas de cache corepack à préserver, vérifié par
# `readlink -f $(which pnpm)` dans le conteneur). Next.js transpile avec SWC ;
# esbuild n'est tiré que par l'outillage de build (drizzle-kit, etc.) et n'est
# jamais chargé à l'exécution. Validé le 2026-08-26 sur une image dérivée jetable
# lancée avec l'environnement réel : HTTP OK, zéro MODULE_NOT_FOUND.
# Même motif et même méthode que brand-radar (2026-08-25, 13 critiques -> 2).

set -uo pipefail

APP_DIR="${APP_DIR:-/app}"

log() { printf '  [prune] %s\n' "$*"; }

before=$(du -sm "$APP_DIR/node_modules" 2>/dev/null | cut -f1)

# Restes d'installation interrompue de pnpm, si un jour l'install passe par
# corepack. Aujourd'hui le motif ne correspond à rien et ne fait rien.
rm -rf "${HOME:-/root}"/.local/share/pnpm/.tools/pnpm/*_tmp_* 2>/dev/null || true

# Binaires Go d'esbuild : outillage de build, jamais exécuté par `next start`.
find "$APP_DIR/node_modules" -type d \( -name 'esbuild' -o -name '@esbuild' \) \
  -prune -exec rm -rf {} + 2>/dev/null || true

after=$(du -sm "$APP_DIR/node_modules" 2>/dev/null | cut -f1)
log "node_modules ${before:-?} Mo -> ${after:-?} Mo"

# Ne jamais faire échouer le déploiement pour un nettoyage : si un motif ne
# correspond à rien, l'image est simplement un peu plus grosse.
exit 0
