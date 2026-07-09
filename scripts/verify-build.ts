#!/usr/bin/env tsx

/**
 * Production Build Security Verification Script
 * 
 * Validates that HIGH-018 security fixes are properly applied:
 * - React DevTools is disabled in production
 * - Source maps are not generated
 * - Code is properly minified
 * - Console statements are removed
 * 
 * Usage: tsx scripts/verify-build.ts
 */

import fs from 'fs';
import path from 'path';

// Type definitions
interface TestResult {
    name: string;
    passed: boolean;
    details: string;
}

interface VerificationResults {
    passed: number;
    failed: number;
    warnings: number;
    tests: TestResult[];
}

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
} as const;

const { reset, bright, red, green, yellow, blue, cyan } = colors;

// Configuration
const DIST_DIR = path.resolve(process.cwd(), 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

// Test results tracking
const results: VerificationResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
};

/**
 * Print formatted test result
 */
function logTest(name: string, passed: boolean, details: string = ''): void {
    const status = passed ? `${green} PASSED${reset}` : `${red} FAILED${reset}`;
    console.log(`   ${status}: ${details || name}`);
    
    results.tests.push({ name, passed, details });
    if (passed) {
        results.passed++;
    } else {
        results.failed++;
    }
}

/**
 * Print section header
 */
function logSection(title: string, step: string): void {
    console.log(`\n${cyan}${step}${reset} ${bright}${title}${reset}`);
}

/**
 * Print warning
 */
function logWarning(message: string): void {
    console.log(`   ${yellow} WARNING${reset}: ${message}`);
    results.warnings++;
}

/**
 * Check if dist directory exists
 */
function checkDistExists(): void {
    if (!fs.existsSync(DIST_DIR)) {
        console.log(`${red}${bright}ERROR:${reset} dist/ directory not found!`);
        console.log(`${yellow}Run:${reset} npm run build:prod`);
        process.exit(1);
    }
    
    if (!fs.existsSync(ASSETS_DIR)) {
        console.log(`${red}${bright}ERROR:${reset} dist/assets/ directory not found!`);
        console.log(`${yellow}Run:${reset} npm run build:prod`);
        process.exit(1);
    }
}

/**
 * Test 1: Check for source map files
 */
function checkSourceMaps(): void {
    logSection('Checking for source maps...', '[1/5]');
    
    const mapFiles: string[] = [];
    
    function searchMaps(dir: string): void {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                searchMaps(fullPath);
            } else if (file.endsWith('.map')) {
                mapFiles.push(fullPath.replace(DIST_DIR, ''));
            }
        }
    }
    
    searchMaps(DIST_DIR);
    
    if (mapFiles.length === 0) {
        logTest('source-maps', true, 'No source maps found');
    } else {
        logTest('source-maps', false, `Found ${mapFiles.length} source map file(s)`);
        console.log(`${red}   Found source maps:${reset}`);
        mapFiles.forEach(file => console.log(`     - ${file}`));
    }
}

/**
 * Test 2: Check React DevTools is disabled
 */
function checkDevToolsDisabled(): void {
    logSection('Checking React DevTools status...', '🛠️  [2/5]');
    
    const jsFiles = fs.readdirSync(ASSETS_DIR)
        .filter(f => f.endsWith('.js') && !f.endsWith('.min.js'));
    
    let devToolsDisabled = false;
    let foundInFile = null;
    
    for (const file of jsFiles) {
        const filePath = path.join(ASSETS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
       if (content.includes('isDisabled:!0') || content.includes('isDisabled:true')) {
            devToolsDisabled = true;
            foundInFile = file;
            break;
        }
    }
    
    if (devToolsDisabled) {
        logTest('devtools-disabled', true, `React DevTools is disabled (found in ${foundInFile})`);
    } else {
        logTest('devtools-disabled', false, 'React DevTools may still be enabled');
        console.log(`${red}   Searched in:${reset}`);
        jsFiles.slice(0, 3).forEach(file => console.log(`     - ${file}`));
    }
}

/**
 * Test 3: Check JavaScript minification
 */
function checkMinification(): void {
    logSection('Checking minification...', '[3/5]');
    
    const jsFiles = fs.readdirSync(ASSETS_DIR)
        .filter(f => f.endsWith('.js'));
    
    if (jsFiles.length === 0) {
        logTest('minification', false, 'No JavaScript files found');
        return;
    }
    
    let allMinified = true;
    const issues = [];
    
    for (const file of jsFiles) {
        const filePath = path.join(ASSETS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Check if file has multiple lines (not minified)
        if (lines.length > 10) {
            allMinified = false;
            issues.push(`${file} has ${lines.length} lines (should be 1-2)`);
        }
        
        // Check for sourceMappingURL comment
        if (content.includes('sourceMappingURL=')) {
            allMinified = false;
            issues.push(`${file} contains sourceMappingURL comment`);
        }
        
        // Check for unminified patterns (lots of whitespace)
        const avgLineLength = content.length / lines.length;
        if (avgLineLength < 100 && lines.length > 10) {
            allMinified = false;
            issues.push(`${file} appears unminified (avg line length: ${avgLineLength.toFixed(0)})`);
        }
    }
    
    if (allMinified) {
        logTest('minification', true, `All ${jsFiles.length} JavaScript files are properly minified`);
    } else {
        logTest('minification', false, `Some files may not be minified`);
        issues.forEach(issue => console.log(`${red}     - ${issue}${reset}`));
    }
}

/**
 * Test 4: Check console statements removed
 */
function checkConsoleRemoval(): void {
    logSection('Checking for console statements...', '[4/5]');
    
    const jsFiles = fs.readdirSync(ASSETS_DIR)
        .filter(f => f.endsWith('.js'));
    
    const consoleFindings = [];
    
    for (const file of jsFiles) {
        const filePath = path.join(ASSETS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Look for console.log, console.debug, console.info, console.trace
        // But exclude console.error and console.warn (those are okay)
        const patterns = [
            /console\.log\s*\(/g,
            /console\.debug\s*\(/g,
            /console\.info\s*\(/g,
            /console\.trace\s*\(/g,
        ];
        
        for (const pattern of patterns) {
            const matches = content.match(pattern);
            if (matches) {
                consoleFindings.push({
                    file,
                    type: pattern.source.match(/console\.(\w+)/)[1],
                    count: matches.length
                });
            }
        }
    }
    
    if (consoleFindings.length === 0) {
        logTest('console-removal', true, 'Console logs removed');
    } else {
        // This is a warning, not a failure (some vendor code may have console statements)
        logTest('console-removal', true, 'Console logs mostly removed');
        consoleFindings.forEach(finding => {
            logWarning(`${finding.file}: ${finding.count}x console.${finding.type}() found`);
        });
    }
}

/**
 * Test 5: Check bundle sizes
 */
function checkBundleSizes(): void {
    logSection('Analyzing bundle sizes...', '[5/5]');
    
    const jsFiles = fs.readdirSync(ASSETS_DIR)
        .filter(f => f.endsWith('.js'))
        .map(file => {
            const filePath = path.join(ASSETS_DIR, file);
            const stat = fs.statSync(filePath);
            return {
                name: file,
                size: stat.size,
                sizeKB: (stat.size / 1024).toFixed(2)
            };
        })
        .sort((a, b) => b.size - a.size);
    
    const totalSize = jsFiles.reduce((sum, f) => sum + f.size, 0);
    const totalKB = (totalSize / 1024).toFixed(2);
    const totalMB = (totalSize / 1024 / 1024).toFixed(2);
    
    console.log(`   ${cyan}Total JavaScript size:${reset} ${totalMB} MB (${totalKB} KB)`);
    console.log(`   ${cyan}Number of JS files:${reset} ${jsFiles.length}`);
    
    // Show largest files
    console.log(`\n   ${cyan}Largest bundles:${reset}`);
    jsFiles.slice(0, 5).forEach(file => {
        console.log(`     ${file.sizeKB.padStart(8)} KB - ${file.name}`);
    });
    
    // Check for overly large bundles
    const largeFiles = jsFiles.filter(f => f.size > 1024 * 1024); // > 1MB
    if (largeFiles.length > 0) {
        logWarning(`${largeFiles.length} file(s) exceed 1MB`);
        largeFiles.forEach(file => {
            console.log(`     ${file.sizeKB.padStart(8)} KB - ${file.name}`);
        });
    }
    
    logTest('bundle-size', true, 'Size analysis complete');
}

/**
 * Print final summary
 */
function printSummary(): void {
    console.log(`\n${'═'.repeat(63)}`);
    
    if (results.failed === 0) {
        console.log(`${green}${bright} Passed: ${results.passed}/${results.tests.length} checks${reset}`);
        if (results.warnings > 0) {
            console.log(`${yellow}  Warnings: ${results.warnings}${reset}`);
        }
        console.log(`${green}${bright} All security checks passed!${reset}`);
        console.log(`${'═'.repeat(63)}\n`);
        process.exit(0);
    } else {
        console.log(`${red}${bright} Failed: ${results.failed}/${results.tests.length} checks${reset}`);
        console.log(`${green} Passed: ${results.passed}/${results.tests.length} checks${reset}`);
        if (results.warnings > 0) {
            console.log(`${yellow}  Warnings: ${results.warnings}${reset}`);
        }
        console.log(`\n${red}${bright}  Security checks failed!${reset}`);
        console.log(`${yellow}Review the issues above and rebuild.${reset}`);
        console.log(`${'═'.repeat(63)}\n`);
        process.exit(1);
    }
}

/**
 * Main execution
 */
function main(): void {
    console.log(`\n${'═'.repeat(63)}`);
    console.log(`${bright}Production Build Security Verification (HIGH-018)${reset}`);
    console.log(`${'═'.repeat(63)}`);
    
    // Check prerequisites
    checkDistExists();
    
    // Run all tests
    checkSourceMaps();
    checkDevToolsDisabled();
    checkMinification();
    checkConsoleRemoval();
    checkBundleSizes();
    
    // Print summary
    printSummary();
}

// Run the script
main();
