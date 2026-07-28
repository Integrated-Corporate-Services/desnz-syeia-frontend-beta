import { getFileScanStatuses } from "../services/s3ApiService";

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 60; // ~2 minutes at 2s intervals

export interface ScanOutcome {
  fileId: string;
  scanStatus: 'COMPLETED' | 'FAILED' | 'TIMED_OUT';
  scanResult: 'CLEAN' | 'INFECTED' | null;
  virusName: string | null;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Polls GET /api/upload/status for a single uploaded file until the virus scan
 * reaches a terminal status (COMPLETED or FAILED), or times out after ~2 minutes.
 * Intended to be awaited inline in the upload flow so a file only becomes visible
 * (added to the documents list) once it has actually passed the scan.
 *
 * @param fileId - uploaded_files id returned by /api/upload/confirm
 * @example
 * const outcome = await waitForScanResult(confirmResponse.fileId);
 * if (outcome.scanStatus === 'COMPLETED' && outcome.scanResult === 'CLEAN') { ... }
 */
export async function waitForScanResult(fileId: string): Promise<ScanOutcome> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const { statuses } = await getFileScanStatuses([fileId]);
    const entry = statuses[0];

    if (entry && (entry.scanStatus === 'COMPLETED' || entry.scanStatus === 'FAILED')) {
      return {
        fileId,
        scanStatus: entry.scanStatus,
        scanResult: entry.scanResult,
        virusName: entry.virusName,
      };
    }

    await delay(POLL_INTERVAL_MS);
  }

  return { fileId, scanStatus: 'TIMED_OUT', scanResult: null, virusName: null };
}
