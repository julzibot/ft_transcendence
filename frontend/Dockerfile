FROM node:22-alpine3.18 AS base
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .

# FROM node:22-alpine3.18 AS builder
# ENV NODE_ENV=production
# WORKDIR /build
# COPY --from=base /app /build
# RUN npm run build

FROM node:22-alpine3.18 AS runner
ENV NODE_ENV=development
WORKDIR /app

# COPY --from=builder
# COPY --from=builder /build/node_modules ./node_modules
# COPY --from=builder /build/public ./public
# COPY --from=builder /build/.next ./.next

COPY --from=base /app .
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next

CMD ["npm", "run", "dev"]
