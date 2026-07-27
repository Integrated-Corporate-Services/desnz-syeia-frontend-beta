# ============================================================================
# Stage 1: Build - Build the Vite application
# ============================================================================
FROM public.ecr.aws/docker/library/node:18 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy app source
COPY . .

# Build the app without environment variables
# Runtime configuration will be injected at container startup
RUN echo "========================================" && \
    echo "Starting Vite Build Process..." && \
    echo "Building environment-agnostic bundle..." && \
    echo "========================================" && \
    npm run build && \
    echo "========================================" && \
    echo "Build Complete! Checking output..." && \
    echo "========================================" && \
    ls -la dist/ && \
    echo "========================================"

# ============================================================================
# Stage 2: Runtime - Lightweight production image with runtime config injection
# ============================================================================
FROM public.ecr.aws/docker/library/node:18-slim

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built assets from builder stage
RUN mkdir -p dist-serve
COPY --from=builder /app/dist ./dist-serve

# Copy serve configuration
COPY serve.json ./serve.json

# Copy runtime config generation script
COPY generate-runtime-config.sh /app/generate-runtime-config.sh
RUN chmod +x /app/generate-runtime-config.sh

# Verify the final structure
RUN echo "========================================" && \
    echo "Final Runtime Image Structure:" && \
    echo "========================================" && \
    ls -la /app && \
    echo "----------------------------------------" && \
    echo "Contents of dist-serve:" && \
    ls -la /app/dist-serve && \
    echo "========================================"

# Expose port
EXPOSE 5173

# Generate runtime config and start the app
# The runtime config is generated from environment variables at container startup
CMD ["/bin/sh", "-c", "/app/generate-runtime-config.sh && serve -l 5173 -c serve.json"]
