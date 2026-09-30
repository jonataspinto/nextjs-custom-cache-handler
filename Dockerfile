# 1. Etapa de Dependências
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Habilita o Corepack e ativa o pnpm
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

# Copia os manifestos do pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instala as dependências com base no pnpm-lock.yaml
RUN pnpm i --frozen-lockfile

# 2. Etapa de Build
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV CI true
RUN pnpm run build

# 3. Etapa de Execução (Runner / Produção)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia a build standalone e os arquivos estáticos
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Garante a cópia do seu Custom Cache Handler para o container final
COPY --from=builder /app/cache-handler.js ./cache-handler.js

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]