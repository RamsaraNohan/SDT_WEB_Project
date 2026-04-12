# Build Stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package and install
COPY package*.json ./
RUN npm install

# Copy all and build
COPY . .
RUN npm run build

# Production Stage (Nginx)
FROM nginx:stable-alpine AS final
WORKDIR /usr/share/nginx/html

# Copy built artifacts from build stage
COPY --from=build /app/dist .

# Copy custom nginx config if we had one (otherwise default)
# EXPOSE 80

# Health Check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -O - http://localhost:80/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]
