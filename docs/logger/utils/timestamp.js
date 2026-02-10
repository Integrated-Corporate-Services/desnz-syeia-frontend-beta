/**
 * Timestamp Utility Module
 * Provides consistent timestamp formatting for logging and file naming
 */

/**
 * Get current timestamp in ISO format with milliseconds
 * @returns {string} ISO 8601 timestamp (e.g., "2026-01-29T10:30:45.123Z")
 */
function getISOTimestamp() {
  return new Date().toISOString();
}

/**
 * Get timestamp for human-readable display
 * @returns {string} Formatted timestamp (e.g., "2026-01-29 10:30:45.123")
 */
function getDisplayTimestamp() {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];
  const ms = now.getMilliseconds().toString().padStart(3, '0');
  return `${date} ${time}.${ms}`;
}

/**
 * Get timestamp for filename (safe for all operating systems)
 * @returns {string} Filename-safe timestamp (e.g., "20260129_103045")
 */
function getFilenameTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

/**
 * Get timestamp for date-only filename
 * @returns {string} Date-only timestamp (e.g., "20260129")
 */
function getDateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}${month}${day}`;
}

/**
 * Get Unix timestamp (milliseconds since epoch)
 * @returns {number} Unix timestamp
 */
function getUnixTimestamp() {
  return Date.now();
}

module.exports = {
  getISOTimestamp,
  getDisplayTimestamp,
  getFilenameTimestamp,
  getDateTimestamp,
  getUnixTimestamp
};
