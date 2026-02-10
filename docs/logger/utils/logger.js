/**
 * Logger Utility Module
 * Handles structured logging operations
 */

const path = require('path');
const { getISOTimestamp, getDisplayTimestamp } = require('./timestamp');
const { appendToFile, ensureDirectory } = require('./file-handler');

class Logger {
  constructor(logDir, sessionId) {
    this.logDir = logDir;
    this.sessionId = sessionId;
    this.buffer = [];
    this.bufferSize = 50; // Flush after 50 lines (reduced for real-time)
    this.flushInterval = 2000; // Flush every 2 seconds (reduced for real-time)
    this.lastFlush = Date.now();
    
    // Start auto-flush interval
    this.flushTimer = setInterval(() => this.flush(), this.flushInterval);
  }

  /**
   * Log a command entry
   * @param {string} command - Command being executed
   * @param {string} args - Command arguments
   */
  logCommand(command, args = '') {
    const entry = {
      timestamp: getISOTimestamp(),
      displayTime: getDisplayTimestamp(),
      sessionId: this.sessionId,
      type: 'command',
      command: command,
      args: args,
      fullCommand: args ? `${command} ${args}` : command
    };
    
    this.addToBuffer(entry);
  }

  /**
   * Log output from command
   * @param {string} stream - Stream type (stdout/stderr)
   * @param {string} data - Output data
   */
  logOutput(stream, data) {
    const entry = {
      timestamp: getISOTimestamp(),
      displayTime: getDisplayTimestamp(),
      sessionId: this.sessionId,
      type: 'output',
      stream: stream,
      data: data.trim()
    };
    
    this.addToBuffer(entry);
  }

  /**
   * Log command exit
   * @param {number} exitCode - Exit code
   */
  logExit(exitCode) {
    const entry = {
      timestamp: getISOTimestamp(),
      displayTime: getDisplayTimestamp(),
      sessionId: this.sessionId,
      type: 'exit',
      exitCode: exitCode,
      status: exitCode === 0 ? 'success' : 'error'
    };
    
    this.addToBuffer(entry);
  }

  /**
   * Log an error
   * @param {string} message - Error message
   * @param {Error} error - Error object
   */
  logError(message, error = null) {
    const entry = {
      timestamp: getISOTimestamp(),
      displayTime: getDisplayTimestamp(),
      sessionId: this.sessionId,
      type: 'error',
      message: message,
      error: error ? error.message : null,
      stack: error ? error.stack : null
    };
    
    this.addToBuffer(entry);
  }

  /**
   * Log session start
   */
  logSessionStart() {
    const entry = {
      timestamp: getISOTimestamp(),
      displayTime: getDisplayTimestamp(),
      sessionId: this.sessionId,
      type: 'session_start',
      platform: process.platform,
      nodeVersion: process.version,
      cwd: process.cwd()
    };
    
    this.addToBuffer(entry);
  }

  /**
   * Log session end
   */
  logSessionEnd() {
    const entry = {
      timestamp: getISOTimestamp(),
      displayTime: getDisplayTimestamp(),
      sessionId: this.sessionId,
      type: 'session_end'
    };
    
    this.addToBuffer(entry);
    this.flush(); // Force flush on session end
  }

  /**
   * Add entry to buffer
   * @param {Object} entry - Log entry
   */
  addToBuffer(entry) {
    this.buffer.push(entry);
    
    // Auto-flush if buffer is full
    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  /**
   * Flush buffer to file
   */
  async flush() {
    if (this.buffer.length === 0) {
      return;
    }

    const entries = [...this.buffer];
    this.buffer = [];
    this.lastFlush = Date.now();

    try {
      await ensureDirectory(this.logDir);
      
      const logFile = path.join(this.logDir, `session_${this.sessionId}.log`);
      const jsonFile = path.join(this.logDir, `session_${this.sessionId}.json`);
      
      // Write formatted text log
      const textLines = entries.map(entry => this.formatEntry(entry)).join('\n') + '\n';
      await appendToFile(logFile, textLines);
      
      // Write JSON log (one entry per line for easy parsing)
      const jsonLines = entries.map(entry => JSON.stringify(entry)).join('\n') + '\n';
      await appendToFile(jsonFile, jsonLines);
      
    } catch (error) {
      console.error('Error flushing logs:', error.message);
    }
  }

  /**
   * Format log entry for text display
   * @param {Object} entry - Log entry
   * @returns {string} Formatted string
   */
  formatEntry(entry) {
    const time = entry.displayTime;
    
    switch (entry.type) {
      case 'session_start':
        return `[${time}] ========== SESSION START ==========\n` +
               `[${time}] Platform: ${entry.platform}\n` +
               `[${time}] Node: ${entry.nodeVersion}\n` +
               `[${time}] Working Directory: ${entry.cwd}`;
      
      case 'session_end':
        return `[${time}] ========== SESSION END ==========`;
      
      case 'command':
        return `[${time}] > ${entry.fullCommand}`;
      
      case 'output':
        return `[${time}] [${entry.stream}] ${entry.data}`;
      
      case 'exit':
        return `[${time}] Exit Code: ${entry.exitCode} (${entry.status})`;
      
      case 'error':
        return `[${time}] ERROR: ${entry.message}${entry.error ? ' - ' + entry.error : ''}`;
      
      default:
        return `[${time}] ${JSON.stringify(entry)}`;
    }
  }

  /**
   * Clean up logger resources
   */
  async cleanup() {
    clearInterval(this.flushTimer);
    await this.flush();
  }
}

module.exports = Logger;
