#!/usr/bin/env node

/**
 * Generate runtime-config.js from environment variables (SECURE VERSION)
 * 
 * This script uses JSON.stringify() to safely escape all values,
 * preventing script injection vulnerabilities.
 * 
 * Usage:
 *   node scripts/generate-runtime-config-js.js
 *   
 * Environment variables are read and safely serialized into JavaScript.
 */

const fs = require('fs');
const path = require('path');

// Read all environment variables
const config = {
  // API Configuration
  VITE_API_URL: process.env.VITE_API_URL || '',
  VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || '',
  
  // Analytics & Monitoring
  VITE_ENABLE_GA4: process.env.VITE_ENABLE_GA4 || 'false',
  VITE_GA4_MEASUREMENT_ID: process.env.VITE_GA4_MEASUREMENT_ID || '',
  VITE_GTM_ID: process.env.VITE_GTM_ID || '',
  VITE_ENABLE_GTM: process.env.VITE_ENABLE_GTM || 'false',
  VITE_DISABLE_TELEMETRY: process.env.VITE_DISABLE_TELEMETRY || 'false',
  
  // Session Configuration
  VITE_SESSION_TIMEOUT_SECONDS: process.env.VITE_SESSION_TIMEOUT_SECONDS || '1800',
  VITE_SESSION_WARNING_SECONDS: process.env.VITE_SESSION_WARNING_SECONDS || '120',
  
  // Authentication
  VITE_LOGIN_DISABLED: process.env.VITE_LOGIN_DISABLED || 'false',
  VITE_DUMMY_USER_TYPE: process.env.VITE_DUMMY_USER_TYPE || 'developer',
  VITE_AUTH_LOGIN_URL: process.env.VITE_AUTH_LOGIN_URL || '',
  VITE_LOGOUT_URL: process.env.VITE_LOGOUT_URL || '',
  VITE_SIGNED_OUT_PATH: process.env.VITE_SIGNED_OUT_PATH || '/signed-out',
  
  // S3 Configuration
  VITE_S3_REFRESH_BEFORE_EXPIRY_SECONDS: process.env.VITE_S3_REFRESH_BEFORE_EXPIRY_SECONDS || '300',
  VITE_S3_URL_EXPIRY_SECONDS: process.env.VITE_S3_URL_EXPIRY_SECONDS || '3600',
  
  // Feature Flags
  VITE_SANDBOX_ROUTES_ENABLED: process.env.VITE_SANDBOX_ROUTES_ENABLED || 'false',
  VITE_DISABLED_FORM_TYPES: process.env.VITE_DISABLED_FORM_TYPES || '',
  
  // Application Settings
  VITE_SERVICE_NAME: process.env.VITE_SERVICE_NAME || 'SYEIA',
  VITE_DETAILED_FEEDBACK_SURVEY_URL: process.env.VITE_DETAILED_FEEDBACK_SURVEY_URL || '#',
  VITE_ROUTER_BASENAME: process.env.VITE_ROUTER_BASENAME || '/',
  
  // AWS RUM Configuration
  VITE_RUM_APP_MONITOR_ID: process.env.VITE_RUM_APP_MONITOR_ID || '',
  VITE_RUM_IDENTITY_POOL_ID: process.env.VITE_RUM_IDENTITY_POOL_ID || '',
  VITE_RUM_REGION: process.env.VITE_RUM_REGION || 'eu-west-2',
  VITE_AWS_REGION: process.env.VITE_AWS_REGION || 'eu-west-2',
  
  // SRI Configuration
  VITE_SRI_MODE: process.env.VITE_SRI_MODE || 'report',
  
  // Build Mode
  MODE: process.env.MODE || 'production',
};

// Determine output path
// In Docker: /app/dist-serve/runtime-config.js
// In local build: public/runtime-config.js
const isDocker = fs.existsSync('/app/dist-serve');
const outputPath = isDocker 
  ? '/app/dist-serve/runtime-config.js'
  : path.join(__dirname, '..', 'public', 'runtime-config.js');

try {
  // Generate JavaScript with JSON.stringify() for safe escaping
  // This prevents script injection even if env vars contain quotes, backslashes, or newlines
  const jsContent = `// Runtime Configuration - Generated at ${new Date().toISOString()}
// DO NOT EDIT - This file is auto-generated from environment variables

window._env_ = ${JSON.stringify(config, null, 2)};
`;

  fs.writeFileSync(outputPath, jsContent, 'utf8');
  
 } catch (error) {
  process.exit(1);
}
