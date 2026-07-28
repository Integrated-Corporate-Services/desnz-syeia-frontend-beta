import { describe, expect, it } from 'vitest';
import {
  INFECTED_MULTI_USER_MESSAGE,
  INFECTED_USER_MESSAGE,
  buildInfectedWarningMessage,
  countInfectedListedFiles,
  reconcileVirusWarningAfterDelete,
  reconcileVirusWarningAfterScanBatch,
  shouldBlockContinueForInfection,
} from './fileUploadVirusWarning';

describe('countInfectedListedFiles', () => {
  it('counts files with scanResult INFECTED', () => {
    const files = [
      { id: '1', scanResult: 'INFECTED' },
      { id: '2', scanResult: 'CLEAN' },
      { id: '3', scanResult: 'INFECTED' },
    ];
    expect(countInfectedListedFiles(files, {})).toBe(2);
  });

  it('uses scan meta when parent omitted scanResult', () => {
    const files = [
      { id: '1', scanResult: null },
      { id: '2', scanResult: null },
    ];
    const meta = {
      '1': { scanResult: 'INFECTED' },
      '2': { scanResult: 'CLEAN' },
    };
    expect(countInfectedListedFiles(files, meta)).toBe(1);
  });

  it('excludes the deleted file id', () => {
    const files = [
      { id: '1', scanResult: 'INFECTED' },
      { id: '2', scanResult: 'INFECTED' },
    ];
    expect(countInfectedListedFiles(files, {}, '1')).toBe(1);
  });
});

describe('reconcileVirusWarningAfterDelete', () => {
  const files = [
    { id: 'clean-1', scanResult: 'CLEAN' as const },
    { id: 'virus-1', scanResult: 'INFECTED' as const },
    { id: 'virus-2', scanResult: 'INFECTED' as const },
  ];

  it('keeps the virus warning when other infected files remain', () => {
    const result = reconcileVirusWarningAfterDelete({
      files,
      metaById: {},
      excludeFileId: 'virus-1',
      blockedPendingCount: 0,
    });

    expect(result.keepVirusWarning).toBe(true);
    expect(result.remainingInfected).toBe(1);
    expect(result.virusMessage).toBe(INFECTED_USER_MESSAGE);
    expect(result.successMessage).toBeNull();
  });

  it('keeps a multi-file virus warning when several infected remain', () => {
    const result = reconcileVirusWarningAfterDelete({
      files,
      metaById: {},
      excludeFileId: 'clean-1',
      blockedPendingCount: 0,
    });

    expect(result.keepVirusWarning).toBe(true);
    expect(result.remainingInfected).toBe(2);
    expect(result.virusMessage).toBe(INFECTED_MULTI_USER_MESSAGE(2));
  });

  it('clears the virus warning only when the last infected file is removed', () => {
    const onlyOneInfected = [
      { id: 'clean-1', scanResult: 'CLEAN' as const },
      { id: 'virus-1', scanResult: 'INFECTED' as const },
    ];
    const result = reconcileVirusWarningAfterDelete({
      files: onlyOneInfected,
      metaById: {},
      excludeFileId: 'virus-1',
      blockedPendingCount: 0,
    });

    expect(result.keepVirusWarning).toBe(false);
    expect(result.virusMessage).toBeNull();
    expect(result.successMessage).toBeNull();
  });

  it('keeps the warning when blocked pending infected files remain', () => {
    const result = reconcileVirusWarningAfterDelete({
      files: [{ id: 'clean-1', scanResult: 'CLEAN' }],
      metaById: {},
      excludeFileId: 'virus-1',
      blockedPendingCount: 3,
    });

    expect(result.keepVirusWarning).toBe(true);
    expect(result.remainingInfected).toBe(3);
    expect(result.virusMessage).toBe(INFECTED_MULTI_USER_MESSAGE(3));
  });
});

describe('shouldBlockContinueForInfection', () => {
  it('blocks while listed infected files remain', () => {
    expect(
      shouldBlockContinueForInfection({
        listedInfectedCount: 1,
        blockedPendingCount: 0,
      })
    ).toBe(true);
  });

  it('blocks while pending blocked files remain', () => {
    expect(
      shouldBlockContinueForInfection({
        listedInfectedCount: 0,
        blockedPendingCount: 2,
      })
    ).toBe(true);
  });

  it('allows continue when nothing infected remains', () => {
    expect(
      shouldBlockContinueForInfection({
        listedInfectedCount: 0,
        blockedPendingCount: 0,
      })
    ).toBe(false);
  });
});

describe('reconcileVirusWarningAfterScanBatch', () => {
  it('shows virus warning while blocked files remain', () => {
    const result = reconcileVirusWarningAfterScanBatch({
      batchInfectedCount: 6,
      blockedRemainingCount: 6,
      listedInfectedCount: 6,
      failedCount: 0,
      cleanCount: 2,
      virusWarningWasActive: true,
    });

    expect(result.virusMessage).toBe(INFECTED_MULTI_USER_MESSAGE(6));
    expect(result.clearParentVirusErrors).toBe(false);
    expect(result.successMessage).toBeNull();
  });

  it('keeps progressive warning when blocked/listed look empty (timing race)', () => {
    const result = reconcileVirusWarningAfterScanBatch({
      batchInfectedCount: 6,
      blockedRemainingCount: 0,
      listedInfectedCount: 0,
      failedCount: 0,
      cleanCount: 2,
      virusWarningWasActive: true,
    });

    expect(result.virusMessage).toBe(INFECTED_MULTI_USER_MESSAGE(6));
    expect(result.clearParentVirusErrors).toBe(false);
  });

  it('does not re-show warning after applicant removed all infected files', () => {
    const result = reconcileVirusWarningAfterScanBatch({
      batchInfectedCount: 6,
      blockedRemainingCount: 0,
      listedInfectedCount: 0,
      failedCount: 0,
      cleanCount: 2,
      virusWarningWasActive: false,
    });

    expect(result.virusMessage).toBeNull();
    expect(result.successMessage).toBeNull();
  });

  it('shows warning from listed infected when block set is empty', () => {
    const result = reconcileVirusWarningAfterScanBatch({
      batchInfectedCount: 2,
      blockedRemainingCount: 0,
      listedInfectedCount: 2,
      failedCount: 0,
      cleanCount: 1,
      virusWarningWasActive: true,
    });

    expect(result.virusMessage).toBe(INFECTED_MULTI_USER_MESSAGE(2));
  });

  it('shows clean success when batch had no infections', () => {
    const result = reconcileVirusWarningAfterScanBatch({
      batchInfectedCount: 0,
      blockedRemainingCount: 0,
      listedInfectedCount: 0,
      failedCount: 0,
      cleanCount: 2,
      virusWarningWasActive: false,
    });

    expect(result.virusMessage).toBeNull();
    expect(result.clearParentVirusErrors).toBe(false);
    expect(result.successMessage).toBeNull();
  });
});
