FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN yarn --network-timeout 100000
COPY . .
RUN yarn standalone

FROM alpine:3.20
RUN apk add --no-cache nodejs && \
    addgroup -S node && adduser -S node -G node
USER node
WORKDIR /home/node/code
COPY --from=builder /app/.next/standalone .
EXPOSE 3000
CMD [ "node", "server.js" ]