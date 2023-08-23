FROM node:16-buster-slim

WORKDIR /app
COPY ./package.json ./yarn.lock ./
RUN --mount=type=cache,uid=1000,target=/app/.cache/node_modules \
    yarn install --modules-folder .cache/node_modules && \
    cp -ar .cache/node_modules node_modules

COPY . .
