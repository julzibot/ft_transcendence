FROM node:22-alpine3.18 AS base
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .

# FROM node:22-alpine3.18 AS builder
# ENV NODE_ENV=production
# ENV NEXT_PUBLIC_DOMAIN=localhost
# ENV NEXT_PUBLIC_BACKEND_PORT=8000
# WORKDIR /build
# RUN npm run build

FROM node:22-alpine3.18 AS runner
ENV NODE_ENV=development
WORKDIR /app

COPY --from=base /app /app
COPY --from=base /app/node_modules /app/node_modules
COPY --from=base /app/public /app/public
COPY --from=base /app/.next /app/.next
# COPY --from=builder /build .
# COPY --from=builder /build/node_modules ./node_modules
# COPY --from=builder /build/public ./public
# COPY --from=builder /build/.next ./.next

CMD ["npm", "run", "dev"]
