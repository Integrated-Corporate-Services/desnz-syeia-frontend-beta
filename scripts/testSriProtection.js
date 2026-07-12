/**
 * Test SRI Protection Script
 * 
 * Validates that SRI (Subresource Integrity) is properly configured and working.
 * 
 * SECURITY ISSUE: MEDIUM #4 - No Subresource Integrity
 * 
 * Usage:
 *   node scripts/testSriProtection.js
 *   npm run test:sri
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

let passCount = 0;
let failCount = 0;
let warnCount = 0;

function pass(message) {
  console.log(`${colors.green}✓ PASS:${colors.reset} ${message}`);
  passCount++;
}

function fail(message) {
  console.log(`${colors.red}✗ FAIL:${colors.reset} ${message}`);
  failCount++;
}

function warn(message) {
  console.log(`${colors.yellow}⚠ WARN:${colors.reset} ${message}`);
  warnCount++;
}

function info(message) {
  console.log(`${colors.cyan}ℹ INFO:${colors.reset} ${message}`);
}

function header(message) {
  console.log(`\n${colors.bold}${colors.cyan}${message}${colors.reset}`);
  console.log(`${colors.cyan}${'─'.repeat(message.length)}${colors.reset}`);
}

/**
 * Check if SRI configuration file exists
 */
function checkSriConfigExists() {
  header('Test 1: SRI Configuration File');
  
  const configPath = path.join(__dirname, '../src/config/sriHashes.ts');
  
  if (fs.existsSync(configPath)) {
    pass('SRI configuration file exists');
    return true;
  } else {
    fail('SRI configuration file not found');
    return false;
  }
}

/**
 * Check if SRI helper utilities exist
 */
function checkSriHelperExists() {
  header('Test 2: SRI Helper Utilities');
  
  const helperPath = path.join(__dirname, '../src/utils/sriHelper.ts');
  
  if (fs.existsSync(helperPath)) {
    pass('SRI helper utilities file exists');
    return true;
  } else {
    fail('SRI helper utilities file not found');
    return false;
  }
}

/**
 * Check if GTM loader uses SRI helper
 */
function checkGtmUsesSri() {
  header('Test 3: GTM Uses SRI Helper');
  
  const gtmPath = path.join(__dirname, '../src/modules/cookie-consent/services/telemetry/gtm.ts');
  
  if (!fs.existsSync(gtmPath)) {
    fail('GTM file not found');
    return false;
  }
  
  const content = fs.readFileSync(gtmPath, 'utf8');
  
  if (content.includes('import { addSRIToScript }')) {
    pass('GTM imports SRI helper');
  } else {
    fail('GTM does not import SRI helper');
    return false;
  }
  
  if (content.includes('addSRIToScript(script, scriptSrc)')) {
    pass('GTM calls addSRIToScript function');
    return true;
  } else {
    fail('GTM does not call addSRIToScript function');
    return false;
  }
}

/**
 * Check if GA4 loader uses SRI helper
 */
function checkGa4UsesSri() {
  header('Test 4: GA4 Uses SRI Helper');
  
  const ga4Path = path.join(__dirname, '../src/modules/cookie-consent/services/telemetry/ga4.ts');
  
  if (!fs.existsSync(ga4Path)) {
    fail('GA4 file not found');
    return false;
  }
  
  const content = fs.readFileSync(ga4Path, 'utf8');
  
  if (content.includes('import { addSRIToScript }')) {
    pass('GA4 imports SRI helper');
  } else {
    fail('GA4 does not import SRI helper');
    return false;
  }
  
  if (content.includes('addSRIToScript(script, scriptUrl)')) {
    pass('GA4 calls addSRIToScript function');
    return true;
  } else {
    fail('GA4 does not call addSRIToScript function');
    return false;
  }
}

/**
 * Check if CSP allows external scripts
 */
function checkCspConfiguration() {
  header('Test 5: CSP Configuration');
  
  const indexPath = path.join(__dirname, '../index.html');
  
  if (!fs.existsSync(indexPath)) {
    fail('index.html not found');
    return false;
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  
  if (content.includes('Content-Security-Policy')) {
    pass('CSP is configured in index.html');
  } else {
    fail('CSP not found in index.html');
    return false;
  }
  
  if (content.includes('www.googletagmanager.com')) {
    pass('CSP allows Google Tag Manager');
  } else {
    warn('CSP may not allow Google Tag Manager');
  }
  
  if (content.includes('www.google-analytics.com')) {
    pass('CSP allows Google Analytics');
  } else {
    warn('CSP may not allow Google Analytics');
  }
  
  return true;
}

/**
 * Check if update script exists
 */
function checkUpdateScriptExists() {
  header('Test 6: SRI Update Script');
  
  const updateScriptPath = path.join(__dirname, 'updateSriHashes.js');
  
  if (fs.existsSync(updateScriptPath)) {
    pass('SRI hash update script exists');
    info('Run "npm run update-sri" to update SRI hashes');
    return true;
  } else {
    fail('SRI hash update script not found');
    return false;
  }
}

/**
 * Validate SRI configuration structure
 */
function validateSriConfigStructure() {
  header('Test 7: SRI Configuration Structure');
  
  const configPath = path.join(__dirname, '../src/config/sriHashes.ts');
  
  if (!fs.existsSync(configPath)) {
    fail('SRI configuration file not found');
    return false;
  }
  
  const content = fs.readFileSync(configPath, 'utf8');
  
  if (content.includes('export const SRI_HASHES')) {
    pass('SRI_HASHES constant is exported');
  } else {
    fail('SRI_HASHES constant not found');
    return false;
  }
  
  if (content.includes('getSRIHash')) {
    pass('getSRIHash function exists');
  } else {
    fail('getSRIHash function not found');
  }
  
  if (content.includes('SRI_MODE')) {
    pass('SRI_MODE configuration exists');
    
    if (content.includes("'report'")) {
      info('SRI mode is set to "report" (warn but don\'t block)');
    } else if (content.includes("'enforce'")) {
      info('SRI mode is set to "enforce" (block on integrity failure)');
    } else if (content.includes("'disabled'")) {
      warn('SRI mode is set to "disabled" (not recommended for production)');
    }
  } else {
    warn('SRI_MODE configuration not found');
  }
  
  return true;
}

/**
 * Check for documentation
 */
function checkDocumentation() {
  header('Test 8: Documentation');
  
  const configPath = path.join(__dirname, '../src/config/sriHashes.ts');
  const content = fs.readFileSync(configPath, 'utf8');
  
  if (content.includes('How to update SRI hashes')) {
    pass('Update instructions documented in config file');
  } else {
    warn('Update instructions not found in config file');
  }
  
  if (content.includes('Last Updated')) {
    pass('Last updated timestamp exists');
  } else {
    warn('Last updated timestamp not found');
  }
  
  info('Ensure README.md documents SRI implementation');
  
  return true;
}

/**
 * Main test execution
 */
function main() {
  console.log(`${colors.bold}${colors.cyan}===============================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  SRI Protection Test Suite${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Subresource Integrity Validation${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}===============================================${colors.reset}\n`);
  
  checkSriConfigExists();
  checkSriHelperExists();
  checkGtmUsesSri();
  checkGa4UsesSri();
  checkCspConfiguration();
  checkUpdateScriptExists();
  validateSriConfigStructure();
  checkDocumentation();
  
  // Summary
  console.log(`\n${colors.bold}${colors.cyan}===============================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Test Summary${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}===============================================${colors.reset}\n`);
  
  console.log(`${colors.green}Passed:${colors.reset}  ${passCount}`);
  console.log(`${colors.red}Failed:${colors.reset}  ${failCount}`);
  console.log(`${colors.yellow}Warnings:${colors.reset} ${warnCount}`);
  
  if (failCount === 0) {
    console.log(`\n${colors.green}${colors.bold}✓ All tests passed!${colors.reset}`);
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log(`1. Start the development server: npm run dev`);
    console.log(`2. Open browser and check console for SRI logs`);
    console.log(`3. Enable cookie consent to trigger GTM/GA4 loading`);
    console.log(`4. Verify no SRI errors in browser console`);
    console.log(`5. Run "npm run update-sri" to update hashes if needed`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bold}✗ Some tests failed${colors.reset}`);
    console.log(`\nPlease fix the failing tests before deploying.`);
    process.exit(1);
  }
}

main();
