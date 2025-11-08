# ---- Stage 1: Build ----
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY package*.json ./

# Install dependencies (use npm ci for clean install)
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# ---- Stage 2: Serve ----
FROM nginx:1.27-alpine

# Remove default nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config (optional custom config)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
