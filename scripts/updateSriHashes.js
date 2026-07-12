/**
 * Update SRI Hashes Script
 * 
 * Fetches external scripts and generates SHA-384 SRI hashes.
 * Updates the sriHashes.ts configuration file with new hashes.
 * 
 * SECURITY ISSUE: MEDIUM #4 - No Subresource Integrity
 * 
 * Usage:
 *   node scripts/updateSriHashes.js
 *   npm run update-sri
 * 
 * This script should be run:
 * - When external scripts are updated by their providers (Google, etc.)
 * - As part of security maintenance (monthly/quarterly)
 * - When SRI integrity errors are detected in logs
 */

import https from 'https';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

/**
 * External scripts to fetch and generate SRI hashes for
 * 
 * Note: GTM and GA4 scripts change frequently and vary per container/measurement ID.
 * These are base URLs - actual URLs include dynamic IDs.
 */
const SCRIPTS_TO_HASH = [
  {
    name: 'Google Tag Manager (GTM)',
    key: 'gtm.js',
    // Use a sample GTM ID for hash generation
    url: 'https://www.googletagmanager.com/gtm.js?id=GTM-SAMPLE',
    note: 'Hash may vary per GTM container ID. Consider setting to empty string to skip SRI due to frequent updates.',
  },
  {
    name: 'Google Analytics 4 (GA4)',
    key: 'gtag.js',
    // Use a sample GA4 ID for hash generation
    url: 'https://www.googletagmanager.com/gtag/js?id=G-SAMPLE',
    note: 'Hash may vary per measurement ID. Consider setting to empty string to skip SRI due to frequent updates.',
  },
];

/**
 * Fetch a URL and calculate its SHA-384 hash
 * 
 * @param {string} url - The URL to fetch
 * @returns {Promise<{hash: string, size: number}>}
 */
function fetchAndHash(url) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.cyan}Fetching:${colors.reset} ${url}`);
    
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      const hash = crypto.createHash('sha384');
      let size = 0;

      res.on('data', (chunk) => {
        hash.update(chunk);
        size += chunk.length;
      });

      res.on('end', () => {
        const hashBase64 = hash.digest('base64');
        const sriHash = `sha384-${hashBase64}`;
        console.log(`${colors.green}✓${colors.reset} Fetched ${size} bytes`);
        console.log(`${colors.green}✓${colors.reset} Hash: ${sriHash.substring(0, 30)}...`);
        resolve({ hash: sriHash, size });
      });

      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Update the sriHashes.ts configuration file
 * 
 * @param {Array<{key: string, hash: string, url: string, note: string}>} results
 */
function updateConfigFile(results) {
  const configPath = path.join(__dirname, '../src/config/sriHashes.ts');
  
  console.log(`\n${colors.cyan}Updating configuration file...${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Manual Review Required${colors.reset}`);
  console.log(`\nGenerated SRI hashes:\n`);

  results.forEach(result => {
    console.log(`${colors.bold}${result.key}:${colors.reset}`);
    console.log(`  URL: ${result.url}`);
    console.log(`  Hash: ${result.hash}`);
    console.log(`  Note: ${result.note}`);
    console.log('');
  });

  console.log(`${colors.yellow}⚠️  IMPORTANT:${colors.reset}`);
  console.log(`Google Tag Manager and Google Analytics scripts are updated frequently by Google.`);
  console.log(`These hashes may become outdated, causing scripts to fail to load.`);
  console.log(``);
  console.log(`${colors.bold}Recommended approach:${colors.reset}`);
  console.log(`1. For now, keep SRI hashes EMPTY for GTM/GA4 scripts`);
  console.log(`2. This allows scripts to load without SRI checks`);
  console.log(`3. CSP (Content Security Policy) still provides protection`);
  console.log(`4. Monitor for script integrity issues via CSP reports`);
  console.log(``);
  console.log(`${colors.cyan}To enable SRI for these scripts:${colors.reset}`);
  console.log(`1. Copy the hashes above`);
  console.log(`2. Update ${configPath}`);
  console.log(`3. Set integrity values for the respective entries`);
  console.log(`4. Test thoroughly to ensure scripts load correctly`);
  console.log(`5. Set up monitoring for SRI failures`);
  console.log(`6. Re-run this script monthly or when Google updates their scripts`);
  console.log('');
}

/**
 * Main execution
 */
async function main() {
  console.log(`${colors.bold}${colors.cyan}===============================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  SRI Hash Generator${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Subresource Integrity Protection${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}===============================================${colors.reset}\n`);

  const results = [];

  for (const script of SCRIPTS_TO_HASH) {
    try {
      console.log(`\n${colors.bold}Processing: ${script.name}${colors.reset}`);
      const { hash, size } = await fetchAndHash(script.url);
      results.push({
        key: script.key,
        url: script.url,
        hash,
        size,
        note: script.note,
      });
    } catch (error) {
      console.error(`${colors.red}✗ Error:${colors.reset} ${error.message}`);
      console.log(`${colors.yellow}⚠️  Skipping ${script.name}${colors.reset}\n`);
    }
  }

  if (results.length > 0) {
    updateConfigFile(results);
  } else {
    console.log(`${colors.red}✗ No hashes generated${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.green}${colors.bold}✓ SRI hash generation complete!${colors.reset}\n`);
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
