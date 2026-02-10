#!/usr/bin/env node

/**
 * Terminal Logger - Capture all terminal output
 * 
 * Usage:
 *   node terminal-logger.js <command> [args...]
 *   node terminal-logger.js "npm install"
 *   node terminal-logger.js dir /s
 * 
 * All output will be saved to logs/ directory
 */

const { spawn } = require('child_process');
const path = require('path');
const Logger = require('../utils/logger');
const { getFilenameTimestamp } = require('../utils/timestamp');
const { ensureDirectory } = require('../utils/file-handler');

class TerminalLogger {
  constructor(customLogPath = null) {
    // Allow custom log path via environment variable or parameter
    this.logDir = customLogPath || 
                  process.env.LOG_OUTPUT_PATH || 
                  path.join(__dirname, 'logs');
    this.sessionId = getFilenameTimestamp();
    this.logger = new Logger(this.logDir, this.sessionId);
  }

  /**
   * Execute command and log all output
   * @param {string} command - Command to execute
   * @param {Array<string>} args - Command arguments
   * @returns {Promise<number>} Exit code
   */
  async executeCommand(command, args = []) {
    // Log command
    this.logger.logCommand(command, args.join(' '));
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Executing: ${command} ${args.join(' ')}`);
    console.log(`Session ID: ${this.sessionId}`);
    console.log(`Logs: ${this.logDir}`);
    console.log(`${'='.repeat(60)}\n`);

    return new Promise((resolve, reject) => {
      // Spawn process
      const childProcess = spawn(command, args, {
        shell: true,
        stdio: ['inherit', 'pipe', 'pipe'],
        cwd: process.cwd(),
        env: process.env
      });

      // Capture stdout
      childProcess.stdout.on('data', (data) => {
        const output = data.toString();
        process.stdout.write(output); // Echo to console
        this.logger.logOutput('stdout', output);
      });

      // Capture stderr
      childProcess.stderr.on('data', (data) => {
        const output = data.toString();
        process.stderr.write(output); // Echo to console
        this.logger.logOutput('stderr', output);
      });

      // Handle process errors
      childProcess.on('error', (error) => {
        this.logger.logError('Process error', error);
        console.error(`\nError executing command: ${error.message}`);
        reject(error);
      });

      // Handle process exit
      childProcess.on('close', (code) => {
        this.logger.logExit(code);
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Command finished with exit code: ${code}`);
        console.log(`Logs saved to: ${path.join(this.logDir, `session_${this.sessionId}.log`)}`);
        console.log(`${'='.repeat(60)}\n`);
        
        resolve(code);
      });
    });
  }

  /**
   * Start logging session
   */
  async start() {
    await ensureDirectory(this.logDir);
    this.logger.logSessionStart();
  }

  /**
   * End logging session
   */
  async end() {
    this.logger.logSessionEnd();
    await this.logger.cleanup();
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Terminal Logger - Capture all terminal output in real-time\n');
    console.log('Usage:');
    console.log('  node terminal-logger.js <command> [args...]');
    console.log('  run-logger <command> [args...]  (using batch file)\n');
    console.log('Examples:');
    console.log('  run-logger npm install');
    console.log('  run-logger node app.js');
    console.log('  run-logger "npm install && npm test"');
    console.log('  node terminal-logger.js dir /s\n');
    console.log('Environment Variables:');
    console.log('  LOG_OUTPUT_PATH - Custom directory for log files');
    console.log('  Example: set LOG_OUTPUT_PATH=C:\\MyLogs\n');
    const defaultLogPath = process.env.LOG_OUTPUT_PATH || path.join(__dirname, 'logs');
    console.log(`Current log path: ${defaultLogPath}`);
    process.exit(0);
  }

  const terminalLogger = new TerminalLogger();

  try {
    await terminalLogger.start();

    // Parse command - if single arg with spaces, split it
    let command, commandArgs;
    if (args.length === 1 && args[0].includes(' ')) {
      const parts = args[0].split(' ');
      command = parts[0];
      commandArgs = parts.slice(1);
    } else {
      command = args[0];
      commandArgs = args.slice(1);
    }

    const exitCode = await terminalLogger.executeCommand(command, commandArgs);
    await terminalLogger.end();

    process.exit(exitCode);
  } catch (error) {
    console.error('Fatal error:', error.message);
    await terminalLogger.end();
    process.exit(1);
  }
}

// Handle cleanup on process termination
process.on('SIGINT', async () => {
  console.log('\n\nReceived SIGINT, cleaning up...');
  process.exit(130);
});

process.on('SIGTERM', async () => {
  console.log('\n\nReceived SIGTERM, cleaning up...');
  process.exit(143);
});

// Run main function
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = TerminalLogger;
