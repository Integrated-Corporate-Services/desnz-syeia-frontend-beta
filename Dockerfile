# ============================================================================
# Stage 1: Build - Build the Vite application with all dependencies
# ============================================================================
FROM public.ecr.aws/docker/library/node:18 AS builder

WORKDIR /app

# Accept build arguments (only what Vite needs at build time)
ARG VITE_ENABLE_GA4=true
ARG VITE_GA4_MEASUREMENT_ID=""
ARG GTM_ID=""
ARG GTM_ISENABLED=true
ARG VITE_DISABLE_TELEMETRY=false
ARG VITE_SESSION_TIMEOUT_SECONDS
ARG VITE_SESSION_WARNING_SECONDS=120
ARG VITE_LOGIN_DISABLED=false
ARG VITE_DUMMY_USER_TYPE=developer
ARG VITE_DISABLED_FORM_TYPES
ARG VITE_SERVICE_NAME=SYEIA
ARG VITE_DETAILED_FEEDBACK_SURVEY_URL="#"
ARG VITE_RUM_APP_MONITOR_ID=""
ARG VITE_RUM_IDENTITY_POOL_ID=""
ARG VITE_RUM_REGION=eu-west-2
ARG VITE_AWS_REGION=eu-west-2

# Authentication Configuration
ARG VITE_AUTH_LOGIN_URL=""
ARG VITE_LOGOUT_URL=""
ARG VITE_SIGNED_OUT_PATH=""

# S3 Configuration
ARG VITE_S3_REFRESH_BEFORE_EXPIRY_SECONDS=300
ARG VITE_S3_URL_EXPIRY_SECONDS=3600

# Feature Flags
ARG VITE_SANDBOX_ROUTES_ENABLES=false

# CORS/Origin Configuration
ARG TRUSTED_ORIGIN=""

# Build Mode
ARG MODE=production

# Set env variables for Vite build
ENV VITE_ENABLE_GA4=$VITE_ENABLE_GA4
ENV VITE_GA4_MEASUREMENT_ID=$VITE_GA4_MEASUREMENT_ID
ENV VITE_GTM_ID=$GTM_ID
ENV VITE_ENABLE_GTM=$GTM_ISENABLED
ENV VITE_DISABLE_TELEMETRY=$VITE_DISABLE_TELEMETRY
ENV VITE_SESSION_TIMEOUT_SECONDS=$VITE_SESSION_TIMEOUT_SECONDS
ENV VITE_SESSION_WARNING_SECONDS=$VITE_SESSION_WARNING_SECONDS
ENV VITE_LOGIN_DISABLED=$VITE_LOGIN_DISABLED
ENV VITE_DUMMY_USER_TYPE=$VITE_DUMMY_USER_TYPE
ENV VITE_DISABLED_FORM_TYPES=$VITE_DISABLED_FORM_TYPES
ENV VITE_SERVICE_NAME=$VITE_SERVICE_NAME
ENV VITE_DETAILED_FEEDBACK_SURVEY_URL=$VITE_DETAILED_FEEDBACK_SURVEY_URL
ENV VITE_RUM_APP_MONITOR_ID=$VITE_RUM_APP_MONITOR_ID
ENV VITE_RUM_IDENTITY_POOL_ID=$VITE_RUM_IDENTITY_POOL_ID
ENV VITE_RUM_REGION=$VITE_RUM_REGION
ENV VITE_AWS_REGION=$VITE_AWS_REGION
ENV VITE_AUTH_LOGIN_URL=$VITE_AUTH_LOGIN_URL
ENV VITE_LOGOUT_URL=$VITE_LOGOUT_URL
ENV VITE_SIGNED_OUT_PATH=$VITE_SIGNED_OUT_PATH
ENV VITE_S3_REFRESH_BEFORE_EXPIRY_SECONDS=$VITE_S3_REFRESH_BEFORE_EXPIRY_SECONDS
ENV VITE_S3_URL_EXPIRY_SECONDS=$VITE_S3_URL_EXPIRY_SECONDS
ENV VITE_SANDBOX_ROUTES_ENABLES=$VITE_SANDBOX_ROUTES_ENABLES
ENV TRUSTED_ORIGIN=$TRUSTED_ORIGIN
ENV MODE=$MODE

# ============================================================================
# Debug: Print all environment variables to verify they're set correctly
# ============================================================================
RUN echo "========================================" && \
    echo "Environment Variables for Vite Build:" && \
    echo "========================================" && \
    echo "VITE_GTM_ID: $VITE_GTM_ID (from GTM_ID: $GTM_ID)" && \
    echo "VITE_ENABLE_GTM: $VITE_ENABLE_GTM (from GTM_ISENABLED: $GTM_ISENABLED)" && \
    echo "VITE_GA4_MEASUREMENT_ID: $VITE_GA4_MEASUREMENT_ID" && \
    echo "VITE_ENABLE_GA4: $VITE_ENABLE_GA4" && \
    echo "VITE_DISABLE_TELEMETRY: $VITE_DISABLE_TELEMETRY" && \
    echo "VITE_SESSION_TIMEOUT_SECONDS: $VITE_SESSION_TIMEOUT_SECONDS" && \
    echo "VITE_SESSION_WARNING_SECONDS: $VITE_SESSION_WARNING_SECONDS" && \
    echo "VITE_AUTH_LOGIN_URL: $VITE_AUTH_LOGIN_URL" && \
    echo "VITE_LOGIN_DISABLED: $VITE_LOGIN_DISABLED" && \
    echo "VITE_LOGOUT_URL: $VITE_LOGOUT_URL" && \
    echo "VITE_SIGNED_OUT_PATH: $VITE_SIGNED_OUT_PATH" && \
    echo "VITE_S3_REFRESH_BEFORE_EXPIRY_SECONDS: $VITE_S3_REFRESH_BEFORE_EXPIRY_SECONDS" && \
    echo "VITE_S3_URL_EXPIRY_SECONDS: $VITE_S3_URL_EXPIRY_SECONDS" && \
    echo "VITE_SANDBOX_ROUTES_ENABLES: $VITE_SANDBOX_ROUTES_ENABLES" && \
    echo "VITE_DISABLED_FORM_TYPES: $VITE_DISABLED_FORM_TYPES" && \
    echo "VITE_DUMMY_USER_TYPE: $VITE_DUMMY_USER_TYPE" && \
    echo "VITE_SERVICE_NAME: $VITE_SERVICE_NAME" && \
    echo "VITE_DETAILED_FEEDBACK_SURVEY_URL: $VITE_DETAILED_FEEDBACK_SURVEY_URL" && \
    echo "VITE_RUM_APP_MONITOR_ID: $VITE_RUM_APP_MONITOR_ID" && \
    echo "VITE_RUM_IDENTITY_POOL_ID: $VITE_RUM_IDENTITY_POOL_ID" && \
    echo "VITE_RUM_REGION: $VITE_RUM_REGION" && \
    echo "VITE_AWS_REGION: $VITE_AWS_REGION" && \
    echo "TRUSTED_ORIGIN: $TRUSTED_ORIGIN" && \
    echo "MODE: $MODE" && \
    echo "========================================"

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy app source
COPY . .

# Build the app with environment-specific mode
RUN echo "========================================" && \
    echo "Starting Vite Build Process with MODE=${MODE}..." && \
    echo "========================================" && \
    npm run build -- --mode ${MODE} && \
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

# Copy serve configuration
COPY serve.json ./serve.json

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

# Start app (serve expects to find dist-serve based on serve.json config)
CMD ["serve", "-l", "5173", "-c", "serve.json"]
