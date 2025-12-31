/**
 * Correlation ID Utility
 *
 * Generates unique correlation IDs for distributed tracing across services.
 * Each user action/transaction gets a new correlation ID to track the entire
 * operation through frontend → backend → database → external services.
 *
 * GDS Compliance: Implements distributed tracing as per GDS API standards
 */

/**
 * Generate a UUID v4 correlation ID
 * @returns {string} UUID v4 format correlation ID
 */
export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

/**
 * Store correlation ID for error tracking and debugging
 * Useful when showing error messages to users
 */
let lastCorrelationId: string | null = null;

export function setLastCorrelationId(correlationId: string): void {
  lastCorrelationId = correlationId;
  // Store in session storage for persistence across page reloads
  sessionStorage.setItem("lastCorrelationId", correlationId);
}

export function getLastCorrelationId(): string | null {
  return lastCorrelationId || sessionStorage.getItem("lastCorrelationId");
}

/**
 * Create headers object with correlation ID
 * @param {string} correlationId - The correlation ID to include
 * @param {HeadersInit} additionalHeaders - Additional headers to merge
 * @returns {HeadersInit} Headers object with correlation ID
 */
export function createHeadersWithCorrelation(
  correlationId: string,
  additionalHeaders?: HeadersInit
): HeadersInit {
  return {
    "X-Correlation-ID": correlationId,
    ...additionalHeaders,
  };
}
