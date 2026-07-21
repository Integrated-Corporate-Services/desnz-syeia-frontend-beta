#!/bin/sh
# Generate runtime configuration from environment variables
# This script runs at container startup to inject environment-specific values

cat <<EOF > /app/dist-serve/runtime-config.js
// Runtime Configuration - Generated at container startup
window._env_ = {
  // API Configuration
  VITE_API_URL: "${VITE_API_URL:-}",
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-}",
  
  // Analytics & Monitoring
  VITE_ENABLE_GA4: "${VITE_ENABLE_GA4:-false}",
  VITE_GA4_MEASUREMENT_ID: "${VITE_GA4_MEASUREMENT_ID:-}",
  VITE_GTM_ID: "${VITE_GTM_ID:-}",
  VITE_ENABLE_GTM: "${VITE_ENABLE_GTM:-false}",
  VITE_DISABLE_TELEMETRY: "${VITE_DISABLE_TELEMETRY:-false}",
  
  // Session Configuration
  VITE_SESSION_TIMEOUT_SECONDS: "${VITE_SESSION_TIMEOUT_SECONDS:-1800}",
  VITE_SESSION_WARNING_SECONDS: "${VITE_SESSION_WARNING_SECONDS:-120}",
  
  // Authentication
  VITE_LOGIN_DISABLED: "${VITE_LOGIN_DISABLED:-false}",
  VITE_DUMMY_USER_TYPE: "${VITE_DUMMY_USER_TYPE:-developer}",
  VITE_AUTH_LOGIN_URL: "${VITE_AUTH_LOGIN_URL:-}",
  VITE_LOGOUT_URL: "${VITE_LOGOUT_URL:-}",
  VITE_SIGNED_OUT_PATH: "${VITE_SIGNED_OUT_PATH:-/signed-out}",
  
  // S3 Configuration
  VITE_S3_REFRESH_BEFORE_EXPIRY_SECONDS: "${VITE_S3_REFRESH_BEFORE_EXPIRY_SECONDS:-300}",
  VITE_S3_URL_EXPIRY_SECONDS: "${VITE_S3_URL_EXPIRY_SECONDS:-3600}",
  
  // Feature Flags
  VITE_SANDBOX_ROUTES_ENABLED: "${VITE_SANDBOX_ROUTES_ENABLED:-false}",
  VITE_DISABLED_FORM_TYPES: "${VITE_DISABLED_FORM_TYPES:-}",
  
  // Application Settings
  VITE_SERVICE_NAME: "${VITE_SERVICE_NAME:-SYEIA}",
  VITE_DETAILED_FEEDBACK_SURVEY_URL: "${VITE_DETAILED_FEEDBACK_SURVEY_URL:-#}",
  VITE_ROUTER_BASENAME: "${VITE_ROUTER_BASENAME:-/}",
  
  // AWS RUM Configuration
  VITE_RUM_APP_MONITOR_ID: "${VITE_RUM_APP_MONITOR_ID:-}",
  VITE_RUM_IDENTITY_POOL_ID: "${VITE_RUM_IDENTITY_POOL_ID:-}",
  VITE_RUM_REGION: "${VITE_RUM_REGION:-eu-west-2}",
  VITE_AWS_REGION: "${VITE_AWS_REGION:-eu-west-2}",
  
  // SRI Configuration
  VITE_SRI_MODE: "${VITE_SRI_MODE:-report}",
  
  // Build Mode (for debugging)
  MODE: "${MODE:-production}"
};

EOF

echo "Runtime configuration generated at /app/dist-serve/runtime-config.js"
cat /app/dist-serve/runtime-config.js
