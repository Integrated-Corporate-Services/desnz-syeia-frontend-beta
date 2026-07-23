# ============================================================================
# Stage 1: Build - Build the Vite application (environment-agnostic)
# ============================================================================
FROM public.ecr.aws/docker/library/node:18 AS builder

WORKDIR /app

# NOTE: No build arguments needed - all config will be injected at runtime
# This allows the same image to be used across all environments

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy app source
COPY . .

# Build the app in production mode (without environment-specific values)
RUN echo "========================================" && \
    echo "Building environment-agnostic frontend..." && \
    echo "========================================" && \
    npm run build -- --mode ${MODE}  && \
    echo "========================================" && \
    echo "Build Complete! Checking output..." && \
    echo "========================================" && \
    ls -la dist/ && \
    echo "========================================"

# ============================================================================
# Stage 2: Runtime - Lightweight production image with only built assets
# ============================================================================
FROM public.ecr.aws/docker/library/node:18-slim

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built assets from builder stage and organize for serve.json
# serve.json expects structure: dist-serve/
RUN mkdir -p dist-serve
COPY --from=builder /app/dist ./dist-serve

# Copy serve configuration and runtime config generator
COPY serve.json ./serve.json
COPY generate-runtime-config.sh ./generate-runtime-config.sh
RUN chmod +x ./generate-runtime-config.sh

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

# Generate runtime config and start the server
# The runtime config will be generated with environment variables at container startup
CMD ["sh", "-c", "./generate-runtime-config.sh && serve -l 5173 -c serve.json"]
