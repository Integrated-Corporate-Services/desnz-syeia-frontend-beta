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

export async function waitForScanResult(fileId: string): Promise<ScanOutcome> {
  logger.debug('[fileScanPolling.ts][waitForScanResult] STARTs');
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const { statuses } = await getFileScanStatuses([fileId]);
    const entry = statuses[0];

    if (entry && (entry.scanStatus === 'COMPLETED' || entry.scanStatus === 'FAILED')) {
      logger.debug('[fileScanPolling.ts][waitForScanResult] ENDs');
      return {
        fileId,
        scanStatus: entry.scanStatus,
        scanResult: entry.scanResult,
        virusName: entry.virusName,
      };
    }

    await delay(POLL_INTERVAL_MS);
  }

  logger.debug('[fileScanPolling.ts][waitForScanResult] ENDs');
  return { fileId, scanStatus: 'TIMED_OUT', scanResult: null, virusName: null };
}
