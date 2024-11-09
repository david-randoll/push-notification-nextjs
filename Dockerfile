FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN yarn --network-timeout 100000
COPY . .
RUN yarn standalone

FROM alpine:3.20
RUN apk add --no-cache nodejs && \
    addgroup --system --gid 1001 node && \
    adduser --system --uid 1001 node && \
    mkdir -p /nextjs-app && \
    chown -R node:node /nextjs-app
WORKDIR /nextjs-app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
COPY --from=builder --chown=node:node /app/.next/standalone .
USER node
EXPOSE 3000
ENV PORT=3000
CMD [ "node", "server.js" ]