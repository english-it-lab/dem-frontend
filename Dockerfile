# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:prod

FROM nginx:1.27-alpine AS runner
# Backend the /api proxy forwards to. host.docker.internal = the Docker host,
# i.e. a backend started locally with uv; use http://api:8000 or similar when
# the backend runs in the same compose network.
ENV BACKEND_URL=http://host.docker.internal:8000 \
    NGINX_ENVSUBST_FILTER=^BACKEND_URL$
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
COPY --from=builder /app/dist /usr/share/nginx/html
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
