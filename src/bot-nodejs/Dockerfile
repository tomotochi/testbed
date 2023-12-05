# FROM node:16-buster-slim
FROM node:20-bookworm-slim

WORKDIR /app
COPY ./package.json ./package-lock.json ./
# RUN --mount=type=cache,uid=1000,target=/app/.cache/node_modules \
#     npm install --prefix .cache/node_modules && \
#     cp -ar .cache/node_modules node_modules
RUN npm install

COPY . .
