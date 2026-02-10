/**
 * File Handler Module
 * Manages file operations for terminal logging
 */

const fs = require('fs').promises;
const path = require('path');
const { getFilenameTimestamp } = require('./timestamp');

/**
 * Ensure directory exists, create if it doesn't
 * @param {string} dirPath - Directory path to ensure
 */
async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
    }
  }
}

/**
 * Write content to file (append mode)
 * @param {string} filePath - Path to file
 * @param {string} content - Content to write
 */
async function appendToFile(filePath, content) {
  try {
    await fs.appendFile(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Write content to file (overwrite mode)
 * @param {string} filePath - Path to file
 * @param {string} content - Content to write
 */
async function writeToFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Error writing to file ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Read file content
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} File content
 */
async function readFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // File doesn't exist
    }
    throw error;
  }
}

/**
 * Check if file exists
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file size in bytes
 * @param {string} filePath - Path to file
 * @returns {Promise<number>} File size in bytes
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * Create log filename with timestamp and command name
 * @param {string} command - Command being logged
 * @param {string} extension - File extension (default: .log)
 * @returns {string} Filename
 */
function createLogFilename(command, extension = '.log') {
  const timestamp = getFilenameTimestamp();
  const sanitizedCommand = command
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .substring(0, 50); // Limit length
  
  return `cmd_${timestamp}_${sanitizedCommand}${extension}`;
}

/**
 * Create session log filename
 * @returns {string} Session filename
 */
function createSessionFilename() {
  const timestamp = getFilenameTimestamp();
  return `terminal_session_${timestamp}.log`;
}

module.exports = {
  ensureDirectory,
  appendToFile,
  writeToFile,
  readFile,
  fileExists,
  getFileSize,
  createLogFilename,
  createSessionFilename
};
