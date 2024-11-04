FROM node:22-alpine3.18 AS base
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .

FROM node:22-alpine3.18 AS builder
WORKDIR /app

ARG NEXT_PUBLIC_BACKEND_PORT
ARG NEXT_PUBLIC_FRONTEND_PORT
ARG NEXT_PUBLIC_SOCKET_PORT
ARG NEXT_PUBLIC_SESSION_SECRET
ARG NEXT_PUBLIC_FORTY_TWO_CLIENT_UID
ARG NEXT_PUBLIC_FORTY_TWO_CLIENT_SECRET
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_DOMAIN
ARG NEXT_PUBLIC_URL

ENV NEXT_PUBLIC_BACKEND_PORT=${NEXT_PUBLIC_BACKEND_PORT}
ENV NEXT_PUBLIC_FRONTEND_PORT=${NEXT_PUBLIC_FRONTEND_PORT}
ENV NEXT_PUBLIC_SOCKET_PORT=${NEXT_PUBLIC_SOCKET_PORT}
ENV NEXT_PUBLIC_SESSION_SECRET=$N{EXT_PUBLIC_SESSION_SECRET}
ENV NEXT_PUBLIC_FORTY_TWO_CLIENT_UID=${NEXT_PUBLIC_FORTY_TWO_CLIENT_UID}
ENV NEXT_PUBLIC_FORTY_TWO_CLIENT_SECRET=${NEXT_PUBLIC_FORTY_TWO_CLIENT_SECRET}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_DOMAIN=${NEXT_PUBLIC_DOMAIN}
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}

COPY --from=base /app .
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next

RUN npm run build

# FROM node:22-alpine3.18 AS development
# WORKDIR /app
# COPY --from=base /app .
# COPY --from=base /app/node_modules ./node_modules
# COPY --from=base /app/public ./public
# COPY --from=base /app/.next ./.next

FROM node:22-alpine3.18 AS production
WORKDIR /app

COPY --from=builder /app .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

