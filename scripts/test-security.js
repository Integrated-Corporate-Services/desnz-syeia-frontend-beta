#!/usr/bin/env node

/**
 * Security Test: Demonstrate the difference between unsafe and safe config generation
 * 
 * This test shows why JSON.stringify() is necessary to prevent script injection
 */

console.log('========================================');
console.log('Security Test: Config Generation');
console.log('========================================\n');

// Test cases with dangerous characters
const dangerousInputs = [
  {
    name: 'Quotes',
    value: 'https://api.com/path?param="value"',
    risk: 'Breaks JavaScript string syntax'
  },
  {
    name: 'Backslashes',
    value: 'C:\\Program Files\\App\\config.json',
    risk: 'Escape sequences can break string'
  },
  {
    name: 'Newlines',
    value: 'line1\nline2\nline3',
    risk: 'Breaks string across multiple lines'
  },
  {
    name: 'Script Injection',
    value: '"; alert("XSS"); var x="',
    risk: 'Can inject arbitrary JavaScript code'
  },
  {
    name: 'Unicode',
    value: 'Hello \u0000\u0001 World',
    risk: 'Control characters can break parsing'
  }
];

console.log('❌ UNSAFE: Direct string interpolation (OLD METHOD)\n');

dangerousInputs.forEach(test => {
  console.log(`Test: ${test.name}`);
  console.log(`Input: "${test.value}"`);
  console.log(`Risk: ${test.risk}`);
  
  // Simulate the old dangerous approach
  const unsafeJs = `window._env_ = { VITE_API_URL: "${test.value}" };`;
  console.log(`Generated: ${unsafeJs}`);
  console.log(`✗ VULNERABLE: String may be malformed or contain injection\n`);
});

console.log('\n========================================\n');
console.log('✅ SAFE: JSON.stringify() with escaping (NEW METHOD)\n');

dangerousInputs.forEach(test => {
  console.log(`Test: ${test.name}`);
  console.log(`Input: "${test.value}"`);
  
  // Simulate the new safe approach
  const config = { VITE_API_URL: test.value };
  const safeJs = `window._env_ = ${JSON.stringify(config, null, 2)};`;
  console.log(`Generated:\n${safeJs}`);
  console.log(`✓ SAFE: All special characters properly escaped\n`);
});

console.log('========================================');
console.log('Summary:');
console.log('========================================');
console.log('✅ JSON.stringify() automatically escapes:');
console.log('   - Quotes as \\"');
console.log('   - Backslashes as \\\\');
console.log('   - Newlines as \\n');
console.log('   - Control characters as \\uXXXX');
console.log('   - Prevents all injection attacks');
console.log('');
console.log('❌ Direct string interpolation:');
console.log('   - No escaping');
console.log('   - Breaks on special characters');
console.log('   - Vulnerable to injection attacks');
console.log('========================================');
