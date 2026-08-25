import { getFileScanStatuses } from "../services/s3ApiService";
import { createLogger } from "./logger";

const logger = createLogger('fileScanPolling');

const POLL_INTERVAL_MS = 1000;
const MAX_POLL_ATTEMPTS = 120;
export interface ScanOutcome {
  fileId: string;
  scanStatus: 'COMPLETED' | 'FAILED' | 'TIMED_OUT';
  scanResult: 'CLEAN' | 'INFECTED' | null;
  virusName: string | null;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function waitForScanResults(fileIds: string[]): Promise<Map<string, ScanOutcome>> {
  logger.debug('[fileScanPolling.ts][waitForScanResults] STARTs', { fileCount: fileIds.length });
  const outcomes = new Map<string, ScanOutcome>();
  const pending = new Set(fileIds);

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS && pending.size > 0; attempt++) {
    const pollStartedAt = Date.now();
    const { statuses } = await getFileScanStatuses(Array.from(pending));

    for (const entry of statuses) {
      if (entry && (entry.scanStatus === 'COMPLETED' || entry.scanStatus === 'FAILED')) {
        outcomes.set(entry.fileId, {
          fileId: entry.fileId,
          scanStatus: entry.scanStatus,
          scanResult: entry.scanResult,
          virusName: entry.virusName,
        });
        pending.delete(entry.fileId);
        logger.debug('[fileScanPolling.ts][waitForScanResults] File scan resolved', {
          fileId: entry.fileId,
          scanStatus: entry.scanStatus,
          attempt,
          resolvedAt: Date.now(),
        });
      }
    }

    if (pending.size === 0) {
      break;
    }

    const elapsed = Date.now() - pollStartedAt;
    await delay(Math.max(0, POLL_INTERVAL_MS - elapsed));
  }

  for (const fileId of pending) {
    logger.warn('[fileScanPolling.ts][waitForScanResults] File scan timed out', { fileId });
    outcomes.set(fileId, { fileId, scanStatus: 'TIMED_OUT', scanResult: null, virusName: null });
  }

  logger.debug('[fileScanPolling.ts][waitForScanResults] ENDs', { resolvedCount: outcomes.size });
  return outcomes;
}
