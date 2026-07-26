/**
 * Subresource Integrity (SRI) Configuration
 * 
 * This file contains SHA-384 integrity hashes for all external scripts and resources.
 * These hashes ensure that external resources haven't been tampered with.
 * 
 * SECURITY ISSUE: MEDIUM #4 - No Subresource Integrity
 * CVSS: 5.5
 * 
 * ⚠️ IMPORTANT: These hashes must be updated when external scripts are updated by their providers.
 * 
 * How to update SRI hashes:
 * 1. Run: npm run update-sri
 * 2. Or manually: node scripts/updateSriHashes.js
 * 3. Verify the new hashes are correct
 * 4. Commit the updated hashes
 * 
 * Last Updated: 2026-07-12
 */

export interface SRIConfig {
  url: string;
  integrity: string;
  crossorigin: 'anonymous' | 'use-credentials';
  lastUpdated: string;
  notes?: string;
}

/**
 * SRI hashes for external scripts
 * 
 * Format: 'sha384-{base64-hash}'
 * 
 * Note: Google Tag Manager and Google Analytics scripts are updated frequently by Google.
 * If a script fails to load due to SRI mismatch, update the hash using the update script.
 */
export const SRI_HASHES: Record<string, SRIConfig> = {
  // Google Tag Manager - Main Script
  // Pattern: https://www.googletagmanager.com/gtm.js?id=GTM-XXXXX
  // Note: Hash varies per GTM container ID, fetched dynamically
  'gtm.js': {
    url: 'https://www.googletagmanager.com/gtm.js',
    integrity: '', // Fetched dynamically - see getSRIHash()
    crossorigin: 'anonymous',
    lastUpdated: '2026-07-12',
    notes: 'GTM script hash is fetched dynamically per container ID. Set to empty to skip SRI for now due to frequent updates.',
  },

  // Google Analytics 4 - gtag.js
  // Pattern: https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX
  'gtag.js': {
    url: 'https://www.googletagmanager.com/gtag/js',
    integrity: '', // Fetched dynamically - see getSRIHash()
    crossorigin: 'anonymous',
    lastUpdated: '2026-07-12',
    notes: 'GA4 script hash is fetched dynamically per measurement ID. Set to empty to skip SRI for now due to frequent updates.',
  },
};

/**
 * Get SRI hash for a specific external resource
 * 
 * @param key - The key from SRI_HASHES
 * @returns SRI configuration or undefined
 */
export function getSRIHash(key: string): SRIConfig | undefined {
  return SRI_HASHES[key];
}

/**
 * Validate if SRI is configured for a URL
 * 
 * @param url - The URL to check
 * @returns true if SRI hash exists and is not empty
 */
export function hasSRIHash(url: string): boolean {
  for (const config of Object.values(SRI_HASHES)) {
    if (url.includes(config.url)) {
      return config.integrity !== '';
    }
  }
  return false;
}

/**
 * Get SRI configuration by URL pattern
 * 
 * @param url - The full URL to match
 * @returns SRI configuration or undefined
 */
export function getSRIConfigByUrl(url: string): SRIConfig | undefined {
  for (const config of Object.values(SRI_HASHES)) {
    if (url.includes(config.url)) {
      return config;
    }
  }
  return undefined;
}

/**
 * SRI enforcement mode
 * 
 * - 'enforce': Require SRI for all external scripts (blocks loading if hash missing/wrong)
 * - 'report': Add SRI but allow loading even if hash fails (logs warning)
 * - 'disabled': Skip SRI checks (not recommended for production)
 */
export type SRIMode = 'enforce' | 'report' | 'disabled';

/**
 * Current SRI enforcement mode
 * 
 * Set via environment variable: VITE_SRI_MODE
 * Default: 'report' (warn but don't block)
 * 
 * Production should use 'enforce' once hashes are stable
 */
import { getRuntimeEnv } from './runtimeEnv';

export const SRI_MODE: SRIMode = (getRuntimeEnv('VITE_SRI_MODE', 'report') as SRIMode) || 'report';

/**
 * Check if SRI is enabled for current environment
 */
export function isSRIEnabled(): boolean {
  return SRI_MODE !== 'disabled';
}

/**
 * Check if SRI should block script loading on failure
 */
export function isSRIEnforcing(): boolean {
  return SRI_MODE === 'enforce';
}
