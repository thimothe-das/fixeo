# Image de fixeo.
#
# Cette application etait construite par nixpacks dans Coolify, sur VM-100.
# Argo CD ne construit pas d'images : rendre l'image reproductible ailleurs
# que sur la machine qu'on cherche a decharger est le prealable de la
# migration.
#
# Les migrations de base NE SONT PAS jouees ici. Coolify les executait en
# `post_deployment_command` (`pnpm db:migrate`) ; dans le cluster elles sont un
# initContainer, qui utilise CETTE image avec une autre commande. Motif : une
# migration jouee pendant le build s'executerait sur la base du build, c'est-a
# dire nulle part, et surtout elle serait rejouee a chaque construction plutot
# qu'a chaque deploiement.

# --- 1. dependances -----------------------------------------------------------
FROM node:22-alpine AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- 2. build -----------------------------------------------------------------
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `next build` a besoin d'une POSTGRES_URL syntaxiquement valide : le code de
# l'application importe le client drizzle au chargement des modules, et
# drizzle refuse une chaine vide. Cette valeur ne joint aucune base et n'est
# jamais utilisee — le build ne fait aucune requete. La vraie vient du Secret,
# a l'execution.
ENV POSTGRES_URL="postgresql://build:build@127.0.0.1:5432/build"
RUN pnpm build

# --- 3. execution -------------------------------------------------------------
FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 nodejs && adduser -u 1001 -G nodejs -S nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3001
CMD ["node", "server.js"]

# --- 4. migrations ------------------------------------------------------------
#
# Une SECONDE image, publiee sous son propre nom, et c'est deliberе.
#
# La tentation est de glisser drizzle-kit dans l'image d'execution. Elle ne
# marche pas : le mode standalone ne recopie que les dependances que
# l'application ATTEINT, et copier `node_modules/drizzle-kit` a la main
# n'emmene pas ses dependances transitives. La migration echouerait au premier
# `require` manquant, c'est-a-dire au pire moment.
#
# La monter depuis l'etage `build`, qui a les node_modules complets, coute une
# image plus grosse — mais elle ne tourne que quelques secondes, en
# initContainer, et elle est CORRECTE. Le sha des deux images etant le meme, on
# ne peut pas migrer avec une version et servir avec une autre.
FROM build AS migrate
WORKDIR /app
USER node
CMD ["pnpm", "exec", "drizzle-kit", "migrate"]
