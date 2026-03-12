# ─── Dockerfile LifeGPS ────────────────────────────────────────────────────
# Multi-stage build : 
#   Stage 1 (builder) : npm install + vite build
#   Stage 2 (runner)  : nginx sert le dist/ statique

# ── Stage 1 : Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./
RUN npm ci --quiet

# Copier le code source
COPY . .

# Variables d'environnement injectées au build (VITE_ sont compilées dans le bundle)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_STRIPE_PRO_PRICE_ID
ARG VITE_STRIPE_PREMIUM_PRICE_ID
ARG VITE_POSTHOG_KEY
ARG VITE_POSTHOG_HOST

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_STRIPE_PRO_PRICE_ID=$VITE_STRIPE_PRO_PRICE_ID
ENV VITE_STRIPE_PREMIUM_PRICE_ID=$VITE_STRIPE_PREMIUM_PRICE_ID
ENV VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY
ENV VITE_POSTHOG_HOST=$VITE_POSTHOG_HOST

RUN npx vite build

# ── Stage 2 : Serve ──────────────────────────────────────────────────────────
FROM nginx:alpine AS runner

# Config nginx optimisée pour SPA React (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
