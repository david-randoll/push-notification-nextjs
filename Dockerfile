FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN yarn --network-timeout 100000
COPY . .
RUN yarn standalone

FROM alpine:3.20
RUN apk add --no-cache nodejs && \
    addgroup --system --gid 1001 node && \
    adduser --system --uid 1001 node && \
    mkdir -p /home/node/code && \
    chown -R node:node /home/node/code
WORKDIR /home/node/code
COPY --from=builder --chown=node:node /app/.next/standalone .
USER node
EXPOSE 3000
ENV PORT=3000
CMD [ "node", "server.js" ]