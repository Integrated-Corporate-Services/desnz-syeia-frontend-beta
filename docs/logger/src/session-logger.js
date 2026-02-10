#!/usr/bin/env node

/**
 * Session Logger - Capture entire terminal session
 * 
 * This creates a logged shell session that captures EVERYTHING:
 * - All commands you type
 * - All output from any program
 * - Runs continuously until you exit
 * 
 * Usage:
 *   node session-logger.js
 *   .\start-session-logger.bat
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { getFilenameTimestamp, getDisplayTimestamp } = require('../utils/timestamp');
const { ensureDirectory, appendToFile } = require('../utils/file-handler');

class SessionLogger {
  constructor() {
    this.logDir = process.env.LOG_OUTPUT_PATH || path.join(__dirname, 'logs');
    this.sessionId = getFilenameTimestamp();
    this.logFile = path.join(this.logDir, `session_${this.sessionId}.log`);
    this.jsonFile = path.join(this.logDir, `session_${this.sessionId}.json`);
    this.startTime = Date.now();
    this.lineBuffer = [];
    this.flushInterval = null;
  }

  /**
   * Initialize the session
   */
  async init() {
    await ensureDirectory(this.logDir);
    
    const header = `${'='.repeat(80)}
TERMINAL SESSION LOGGER
${'='.repeat(80)}
Session ID: ${this.sessionId}
Started: ${getDisplayTimestamp()}
Log File: ${this.logFile}
JSON File: ${this.jsonFile}

📝 Everything you type and see will be logged in real-time.
💡 Type 'exit' to end the session and stop logging.
${'='.repeat(80)}

`;
    
    console.log(header);
    await appendToFile(this.logFile, header);
    
    // Start auto-flush
    this.flushInterval = setInterval(() => this.flush(), 2000);
  }

  /**
   * Log data to buffer
   */
  log(data, type = 'output') {
    const timestamp = getDisplayTimestamp();
    const entry = `[${timestamp}] ${data}`;
    
    this.lineBuffer.push(entry);
    
    // Also log to JSON
    const jsonEntry = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      type: type,
      data: data.trim()
    };
    
    this.lineBuffer.push(JSON.stringify(jsonEntry) + '\n');
    
    // Flush if buffer is large
    if (this.lineBuffer.length > 50) {
      this.flush();
    }
  }

  /**
   * Flush buffer to disk
   */
  async flush() {
    if (this.lineBuffer.length === 0) return;
    
    const content = this.lineBuffer.join('');
    this.lineBuffer = [];
    
    try {
      await appendToFile(this.logFile, content);
    } catch (error) {
      console.error('Error writing to log:', error.message);
    }
  }

  /**
   * Start logged shell session
   */
  async startSession() {
    await this.init();

    // Determine shell to use
    const shell = process.env.SHELL || 
                  (process.platform === 'win32' ? 'powershell.exe' : '/bin/bash');
    
    console.log(`Starting ${shell} session...\n`);
    
    // Spawn interactive shell
    const shellProcess = spawn(shell, [], {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: false,
      env: process.env,
      cwd: process.cwd()
    });

    // Capture stdout
    shellProcess.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output); // Echo to console
      this.log(output, 'stdout');
    });

    // Capture stderr
    shellProcess.stderr.on('data', (data) => {
      const output = data.toString();
      process.stderr.write(output); // Echo to console
      this.log(output, 'stderr');
    });

    // Handle shell exit
    shellProcess.on('close', async (code) => {
      await this.endSession(code);
      process.exit(code);
    });

    // Handle errors
    shellProcess.on('error', (error) => {
      console.error('\nError starting shell:', error.message);
      process.exit(1);
    });

    // Handle process termination signals
    const cleanup = async () => {
      console.log('\n\nReceiving termination signal...');
      shellProcess.kill();
      await this.endSession(130);
      process.exit(130);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }

  /**
   * End the session
   */
  async endSession(exitCode) {
    // Stop auto-flush
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Final flush
    await this.flush();
    
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    
    const footer = `
${'='.repeat(80)}
SESSION ENDED
${'='.repeat(80)}
End Time: ${getDisplayTimestamp()}
Duration: ${duration} seconds
Exit Code: ${exitCode}
Log File: ${this.logFile}
${'='.repeat(80)}
`;
    
    await appendToFile(this.logFile, footer);
    console.log(footer);
  }
}

/**
 * Main execution
 */
async function main() {
  const logger = new SessionLogger();
  
  try {
    await logger.startSession();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = SessionLogger;
