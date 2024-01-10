FROM node:20-alpine AS build
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY common common
COPY src src
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /build/dist /app/dist
COPY package*.json ./
RUN npm ci --omit dev
COPY client client
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 CMD [ "wget", "--no-verbose", "--spider", "--tries=1", "localhost:3000" ]
CMD npm run start:prod