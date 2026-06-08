# Dockerfile for frontend production build
FROM public.ecr.aws/docker/library/node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files and serve.json config
COPY . .

# Build production files
RUN npm run build

# Install serve globally for production serving
RUN npm install -g serve

# Create /frontend path structure for production (matches test-production.ps1)
RUN mkdir -p dist-serve/frontend && \
    cp -r dist/* dist-serve/frontend/ && \
    rm -rf dist node_modules src public .git

EXPOSE 5173

# Serve using serve.json config (same as test-production.ps1)
# serve.json has "public": "dist-serve" to serve from dist-serve root
CMD ["serve", "-l", "5173", "-c", "serve.json"]
