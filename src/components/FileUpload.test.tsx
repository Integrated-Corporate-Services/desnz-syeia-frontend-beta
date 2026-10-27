import React, { createRef } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import FileUpload, { type FileUploadHandle } from './FileUpload';
import { confirmUpload, extractUploadEtag, getPresignedUrls, uploadFileToS3 } from '../services/s3ApiService';
import { waitForScanResults } from '../utils/fileScanPolling';

vi.mock('../context/AuthUserContext', () => ({ useAuthUserContext: () => ({ user: { user_id: 'user' } }) }));
vi.mock('../utils/fileUploadValidation', () => ({ validateFiles: async (files: File[]) => ({ validFiles: files, errors: [] }), getMimeType: () => 'application/pdf' }));
vi.mock('../services/s3ApiService', () => ({ getPresignedUrls: vi.fn(), uploadFileToS3: vi.fn(), extractUploadEtag: vi.fn(), deleteFileCompletely: vi.fn(), deleteDocument: vi.fn(), confirmUpload: vi.fn() }));
vi.mock('../utils/fileScanPolling', () => ({ waitForScanResults: vi.fn() }));

const endpoints = {
  presignedUrl: '/api/applications/app/additional-payments/request/evidence/presigned-url',
  confirm: '/api/applications/app/additional-payments/request/evidence/confirm',
};

beforeEach(() => vi.resetAllMocks());

it.each([false, true])('preserves the deferred upload, confirm and scan flow (request scoped: %s)', async scoped => {
  const file = new File(['pdf'], 'receipt.pdf', { type: 'application/pdf' });
  const prefix = scoped ? 'app/ADDITIONAL_PAYMENTS/request' : 'app/documents';
  const category = scoped ? 'PAYMENT_PROOF' : 'CPO_NEWSPAPER_NOTICES';
  const subCategory = scoped ? 'request' : undefined;
  vi.mocked(getPresignedUrls).mockResolvedValue({ urls: [{ url: 'https://upload.example/file', s3Key: `${prefix}/receipt.pdf` }] });
  vi.mocked(uploadFileToS3).mockResolvedValue({ ok: true } as Response);
  vi.mocked(extractUploadEtag).mockResolvedValue('etag-1');
  vi.mocked(confirmUpload).mockResolvedValue({
    documentId: 'document', fileId: 'file', fileName: file.name, s3Key: `${prefix}/receipt.pdf`,
    bucketName: 'bucket', virtualFolder: prefix, contentType: file.type,
    fileSizeBytes: file.size, uploadedAt: '2026-10-01', status: 'UPLOADED',
  });
  vi.mocked(waitForScanResults).mockResolvedValue(new Map([
    ['file', { fileId: 'file', scanStatus: 'COMPLETED', scanResult: 'CLEAN', virusName: null }],
  ]));
  const ref = createRef<FileUploadHandle>();
  const onUploaded = vi.fn();
  const validation = vi.fn();
  const view = render(<FileUpload ref={ref} applicationId="app" prefix={prefix} category={category}
    subCategory={subCategory} uploadEndpoints={scoped ? endpoints : undefined}
    onUploaded={onUploaded} onValidationErrors={validation} />);
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [file] } });
  await waitFor(() => expect(ref.current?.getPendingFiles()).toHaveLength(1));
  expect(getPresignedUrls).not.toHaveBeenCalled();
  await act(async () => {
    const result = await ref.current!.triggerUpload();
    expect(result.scanErrors).toEqual([]);
    expect(result.uploadedFiles).toEqual([expect.objectContaining({ id: 'file', scanResult: 'CLEAN' })]);
    expect(result.applicationDocuments).toEqual([expect.objectContaining({ documentId: 'document', category, subCategory: subCategory || '' })]);
  });
  expect(getPresignedUrls).toHaveBeenCalledExactlyOnceWith([
    { filename: `${prefix}/receipt.pdf`, contentType: file.type, ...(scoped ? { size: file.size } : {}) },
  ], 'app', scoped ? endpoints.presignedUrl : undefined);
  expect(uploadFileToS3).toHaveBeenCalledExactlyOnceWith('https://upload.example/file', file, file.type);
  expect(confirmUpload).toHaveBeenCalledExactlyOnceWith({
    s3Key: `${prefix}/receipt.pdf`, fileName: file.name, contentType: file.type, fileSize: file.size,
    etag: 'etag-1', applicationId: 'app', category, addedBy: 'user', subCategory, consultationId: undefined,
  }, scoped ? endpoints.confirm : undefined);
  expect(waitForScanResults).toHaveBeenCalledExactlyOnceWith(['file']);
  expect(onUploaded).toHaveBeenCalledOnce();
  expect(validation).toHaveBeenLastCalledWith([]);
  expect(ref.current?.getPendingFiles()).toEqual([]);
  expect(ref.current?.isBusy()).toBe(false);
});

it.each([false, true])('reports upload-URL failures without changing the legacy return contract (request scoped: %s)', async scoped => {
  vi.mocked(getPresignedUrls).mockRejectedValue(new Error('Maximum 10 files allowed per batch upload'));
  const ref = createRef<FileUploadHandle>();
  const validation = vi.fn();
  const view = render(<FileUpload ref={ref} applicationId="app" category="CPO_NEWSPAPER_NOTICES" uploadEndpoints={scoped ? endpoints : undefined} onValidationErrors={validation} />);
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [new File(['pdf'], 'notice.pdf', { type: 'application/pdf' })] } });
  await waitFor(() => expect(ref.current?.getPendingFiles()).toHaveLength(1));
  await act(async () => {
    const result = await ref.current!.triggerUpload();
    expect(result.scanErrors).toEqual(scoped ? ['Maximum 10 files allowed per batch upload'] : []);
    expect(result.uploadedFiles).toEqual([]);
  });
  expect(validation).toHaveBeenLastCalledWith(['Maximum 10 files allowed per batch upload']);
});