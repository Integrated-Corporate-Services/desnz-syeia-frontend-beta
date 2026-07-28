import { useCallback, useEffect, useRef, useState } from "react";
import { getFileScanStatuses, FileScanStatusEntry } from "../services/s3ApiService";
import { createLogger } from "../utils/logger";

const logger = createLogger('useFileScanStatuses');

const POLL_INTERVAL_MS = 1000;
const MAX_POLL_ATTEMPTS = 40;

export type TrackedScanStatus = FileScanStatusEntry['scanStatus'] | 'TIMED_OUT';

export interface TrackedFileScanState {
  fileId: string;
  scanStatus: TrackedScanStatus;
  scanResult: FileScanStatusEntry['scanResult'];
  virusName: string | null;
  scannedAt: string | null;
  bucketName: string | null;
  justCompletedClean: boolean;
}

const isTerminal = (status: TrackedScanStatus | undefined) =>
  status === 'COMPLETED' || status === 'FAILED' || status === 'TIMED_OUT';

export function useFileScanStatuses() {
  const [statuses, setStatuses] = useState<Map<string, TrackedFileScanState>>(new Map());
  const statusesRef = useRef<Map<string, TrackedFileScanState>>(new Map());
  const attemptsRef = useRef<Map<string, number>>(new Map());
  const trackedIdsRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    const idsToPoll = Array.from(trackedIdsRef.current).filter(
      (id) => !isTerminal(statusesRef.current.get(id)?.scanStatus)
    );

    if (idsToPoll.length === 0) {
      stopPolling();
      return;
    }

    try {
      const { statuses: fetched } = await getFileScanStatuses(idsToPoll);
      const fetchedById = new Map(fetched.map((entry) => [entry.fileId, entry]));

      const next = new Map(statusesRef.current);

      idsToPoll.forEach((id) => {
        const entry = fetchedById.get(id);
        const previousStatus = statusesRef.current.get(id)?.scanStatus;
        const attempts = (attemptsRef.current.get(id) || 0) + 1;
        attemptsRef.current.set(id, attempts);

        if (!entry) {
          next.set(id, {
            fileId: id,
            scanStatus: attempts >= MAX_POLL_ATTEMPTS ? 'TIMED_OUT' : 'PENDING',
            scanResult: null,
            virusName: null,
            scannedAt: null,
            bucketName: null,
            justCompletedClean: false,
          });
          return;
        }

        const timedOut = !isTerminal(entry.scanStatus) && attempts >= MAX_POLL_ATTEMPTS;
        const resolvedStatus: TrackedScanStatus = timedOut ? 'TIMED_OUT' : entry.scanStatus;

        next.set(id, {
          fileId: id,
          scanStatus: resolvedStatus,
          scanResult: entry.scanResult,
          virusName: entry.virusName,
          scannedAt: entry.scannedAt,
          bucketName: entry.bucketName,
          justCompletedClean:
            previousStatus !== 'COMPLETED' &&
            entry.scanStatus === 'COMPLETED' &&
            entry.scanResult === 'CLEAN',
        });
      });

      statusesRef.current = next;
      setStatuses(next);

      const stillPending = Array.from(trackedIdsRef.current).some(
        (id) => !isTerminal(next.get(id)?.scanStatus)
      );
      if (!stillPending) {
        stopPolling();
      }
    } catch (err) {
      logger.error('Failed to poll file scan statuses', { idsToPoll, error: err });
    }
  }, [stopPolling]);

  const ensurePolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
  }, [poll]);

  useEffect(() => stopPolling, [stopPolling]);

  const trackFileIds = useCallback((fileIds: string[]) => {
    const newIds = fileIds.filter((id) => id && !trackedIdsRef.current.has(id));
    if (newIds.length === 0) return;

    newIds.forEach((id) => trackedIdsRef.current.add(id));
    ensurePolling();
    void poll();
  }, [poll, ensurePolling]);

  const acknowledgeCompletion = useCallback((fileId: string) => {
    setStatuses((prev) => {
      const current = prev.get(fileId);
      if (!current || !current.justCompletedClean) return prev;
      const next = new Map(prev);
      next.set(fileId, { ...current, justCompletedClean: false });
      statusesRef.current = next;
      return next;
    });
  }, []);

  return { statuses, trackFileIds, acknowledgeCompletion };
}
