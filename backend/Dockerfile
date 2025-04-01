FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm config set strict-ssl false \
    && npm ci
COPY . ./
RUN npm run build

FROM node:16-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm config set strict-ssl false \
    && npm ci --omit=dev --no-audit --no-fund \
    && npm i -g pm2
COPY --from=builder /app/dist ./dist
COPY ./ecosystem.config.js ./

EXPOSE 3000
ENTRYPOINT [ "pm2-runtime", "start", "ecosystem.config.js" ]