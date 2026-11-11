import React, { createRef } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import FileUpload, { type FileUploadHandle } from './FileUpload';
import { confirmUpload, extractUploadEtag, getPresignedUrls, uploadFileToS3 } from '../services/s3ApiService';
import { waitForScanResults } from '../utils/fileScanPolling';
import { validateFiles } from '../utils/fileUploadValidation';
import type { ApplicationDocument, UploadedFile } from '../types/fileUpload';

vi.mock('../context/AuthUserContext', () => ({ useAuthUserContext: () => ({ user: { user_id: 'user' } }) }));
vi.mock('../utils/fileUploadValidation', () => ({ validateFiles: vi.fn(), getMimeType: () => 'application/pdf' }));
vi.mock('../services/s3ApiService', () => ({ getPresignedUrls: vi.fn(), uploadFileToS3: vi.fn(), extractUploadEtag: vi.fn(), deleteFileCompletely: vi.fn(), deleteDocument: vi.fn(), confirmUpload: vi.fn() }));
vi.mock('../utils/fileScanPolling', () => ({ waitForScanResults: vi.fn() }));

const endpoints = {
  presignedUrl: '/api/applications/app/additional-payments/request/evidence/presigned-url',
  confirm: '/api/applications/app/additional-payments/request/evidence/confirm',
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(validateFiles).mockImplementation(async files => ({ validFiles: files, errors: [], totalSize: 0, remainingSpace: 1000 }));
});

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

it.each(['picker', 'drop'])('rejects more files than the page limit through %s', async (method) => {
  const ref = createRef<FileUploadHandle>();
  const validation = vi.fn();
  const view = render(<FileUpload
    ref={ref}
    applicationId="app"
    category="CPO_SITE_NOTICES"
    maxFiles={1}
    maxFilesError="You can upload no more than 1 site notice document."
    onValidationErrors={validation}
  />);
  const files = [
    new File(['one'], 'notice-one.pdf', { type: 'application/pdf' }),
    new File(['two'], 'notice-two.pdf', { type: 'application/pdf' }),
  ];

  if (method === 'picker') {
    fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files } });
  } else {
    fireEvent.drop(view.container.querySelector('.gds-upload-dropzone')!, { dataTransfer: { files } });
  }

  await waitFor(() => expect(validation).toHaveBeenLastCalledWith(['You can upload no more than 1 site notice document.']));
  expect(ref.current?.getPendingFiles()).toEqual([]);
});

it('counts documents already uploaded in the category against the page limit', async () => {
  const ref = createRef<FileUploadHandle>();
  const validation = vi.fn();
  const view = render(<FileUpload
    ref={ref}
    applicationId="app"
    category="CPO_SITE_NOTICES"
    maxFiles={1}
    maxFilesError="You can upload no more than 1 site notice document."
    uploadedFiles={[{
      id: 'existing', storageProvider: 'aws_s3', s3Key: '', bucketName: '', virtualFolder: '', filename: 'existing.pdf',
      fileContentType: 'application/pdf', fileSizeBytes: 3, uploadedAtTimestamp: '',
    }]}
    applicationDocuments={[{
      documentId: 'document', applicationId: 'app', fileId: 'existing', category: 'CPO_SITE_NOTICES', addedBy: 'user', addedAt: '',
    }]}
    onValidationErrors={validation}
  />);

  fireEvent.change(view.container.querySelector('input[type="file"]')!, {
    target: { files: [new File(['new'], 'new.pdf', { type: 'application/pdf' })] },
  });

  await waitFor(() => expect(validation).toHaveBeenLastCalledWith(['You can upload no more than 1 site notice document.']));
  expect(ref.current?.getPendingFiles()).toEqual([]);
});

it('blocks confirmation synchronously while asynchronous selection validation is pending', async () => {
  let finish!: (value: Awaited<ReturnType<typeof validateFiles>>) => void;
  vi.mocked(validateFiles).mockReturnValue(new Promise(resolve => { finish = resolve; }));
  const ref = createRef<FileUploadHandle>();
  const view = render(<FileUpload ref={ref} applicationId="app" category="PAYMENT_PROOF" uploadEndpoints={endpoints} blockOnSelectionErrors />);
  const file = new File(['pdf'], 'proof.pdf', { type: 'application/pdf' });
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [file] } });
  expect(ref.current?.isBusy()).toBe(true);
  await act(async () => {
    expect((await ref.current!.triggerUpload()).scanErrors).toEqual(['File validation is in progress. Please wait and try again.']);
    finish({ validFiles: [], errors: [{ filename: file.name, errorType: 'INVALID_TYPE', message: 'Invalid proof' }], totalSize: 0, remainingSpace: 1000 });
  });
  expect(ref.current?.isBusy()).toBe(false);
  await act(async () => { expect((await ref.current!.triggerUpload()).scanErrors).toEqual(['Invalid proof']); });
  expect(getPresignedUrls).not.toHaveBeenCalled();
  act(() => ref.current!.clearFailedSelection?.());
  await act(async () => { expect((await ref.current!.triggerUpload()).scanErrors).toEqual([]); });
});

it('validates new selections against restored file metadata and associations', async () => {
  const uploaded = { id: 'existing', filename: 'proof.pdf', scanStatus: 'COMPLETED', scanResult: 'CLEAN' } as UploadedFile;
  const document = { documentId: 'doc', fileId: uploaded.id, category: 'PAYMENT_PROOF', subCategory: 'request' } as ApplicationDocument;
  const view = render(<FileUpload applicationId="app" category="PAYMENT_PROOF" subCategory="request"
    uploadEndpoints={endpoints} uploadedFiles={[uploaded]} applicationDocuments={[document]} />);
  const selected = new File(['pdf'], 'other.pdf', { type: 'application/pdf' });
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [selected] } });
  await waitFor(() => expect(validateFiles).toHaveBeenCalledWith(
    [selected], [uploaded],
  ));
});

it.each(['INFECTED', null] as const)('retains and blocks rejected scan result %s after clean props synchronize', async result => {
  vi.mocked(getPresignedUrls).mockResolvedValue({ urls: [{ url: 'https://upload.example/file', s3Key: 'key' }] });
  vi.mocked(uploadFileToS3).mockResolvedValue({ ok: true } as Response);
  vi.mocked(extractUploadEtag).mockResolvedValue('etag');
  vi.mocked(confirmUpload).mockResolvedValue({
    documentId: 'document', fileId: 'rejected', fileName: 'proof.pdf', s3Key: 'key', bucketName: 'bucket',
    virtualFolder: 'folder', contentType: 'application/pdf', fileSizeBytes: 3, uploadedAt: '2026-10-01', status: 'UPLOADED',
  });
  vi.mocked(waitForScanResults).mockResolvedValue(new Map([
    ['rejected', { fileId: 'rejected', scanStatus: 'COMPLETED', scanResult: result, virusName: null }],
  ]));
  const ref = createRef<FileUploadHandle>();
  const onRemoveUploadedFile = vi.fn().mockResolvedValue(undefined);
  const props = { applicationId: 'app', category: 'PAYMENT_PROOF', uploadEndpoints: endpoints, blockOnSelectionErrors: true, onRemoveUploadedFile };
  const view = render(<FileUpload ref={ref} {...props} />);
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [new File(['pdf'], 'proof.pdf', { type: 'application/pdf' })] } });
  await waitFor(() => expect(ref.current?.getPendingFiles()).toHaveLength(1));
  await act(async () => {
    const outcome = await ref.current!.triggerUpload();
    expect(outcome.uploadedFiles).toEqual([]);
    expect(outcome.scanErrors.length).toBeGreaterThan(0);
  });
  view.rerender(<FileUpload ref={ref} {...props} uploadedFiles={[]} applicationDocuments={[]} />);
  expect(screen.getByRole('link', { name: 'Remove proof.pdf' })).toBeInTheDocument();
  act(() => ref.current!.clearFailedSelection?.());
  await act(async () => { expect((await ref.current!.triggerUpload()).scanErrors.length).toBeGreaterThan(0); });
  fireEvent.click(screen.getByRole('link', { name: 'Remove proof.pdf' }));
  await waitFor(() => expect(onRemoveUploadedFile).toHaveBeenCalledWith('rejected'));
  await waitFor(() => expect(screen.queryByText(result === 'INFECTED' ? 'Infected' : 'Scan failed')).not.toBeInTheDocument());
});

it('disables chooser and guards pending removal while the parent is confirming', async () => {
  const ref = createRef<FileUploadHandle>();
  const view = render(<FileUpload ref={ref} applicationId="app" category="PAYMENT_PROOF" uploadEndpoints={endpoints} blockOnSelectionErrors />);
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [new File(['pdf'], 'proof.pdf', { type: 'application/pdf' })] } });
  await waitFor(() => expect(ref.current?.getPendingFiles()).toHaveLength(1));
  view.rerender(<FileUpload ref={ref} disabled applicationId="app" category="PAYMENT_PROOF" uploadEndpoints={endpoints} />);
  expect(view.container.querySelector('input[type="file"]')).toBeDisabled();
  const remove = screen.getByRole('link', { name: 'Remove proof.pdf' });
  expect(remove).toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(remove);
  expect(ref.current?.getPendingFiles()).toHaveLength(1);
});

it('associates file validation errors with the upload control', () => {
  const view = render(<FileUpload applicationId="app" category="PAYMENT_PROOF" uploadEndpoints={endpoints} errors={['Invalid proof']} />);
  const input = view.container.querySelector('input[type="file"]');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('file-upload-error'));
  expect(document.getElementById('file-upload-error')).toHaveTextContent('Invalid proof');
});

it('retains confirmed files when scan polling fails and allows their status to be checked again', async () => {
  const file = new File(['pdf'], 'proof.pdf', { type: 'application/pdf' });
  vi.mocked(getPresignedUrls).mockResolvedValue({ urls: [{ url: 'https://upload.example/file', s3Key: 'key' }] });
  vi.mocked(uploadFileToS3).mockResolvedValue({ ok: true } as Response);
  vi.mocked(extractUploadEtag).mockResolvedValue('etag');
  vi.mocked(confirmUpload).mockResolvedValue({
    documentId: 'document', fileId: 'confirmed', fileName: file.name, s3Key: 'key', bucketName: 'bucket',
    virtualFolder: 'folder', contentType: file.type, fileSizeBytes: file.size, uploadedAt: '2026-10-01', status: 'UPLOADED',
  });
  vi.mocked(waitForScanResults).mockRejectedValueOnce(new Error('Scan service unavailable'))
    .mockResolvedValueOnce(new Map([['confirmed', { fileId: 'confirmed', scanStatus: 'COMPLETED', scanResult: 'CLEAN', virusName: null }]]));
  const ref = createRef<FileUploadHandle>();
  const onUploaded = vi.fn();
  const view = render(<FileUpload ref={ref} applicationId="app" category="PAYMENT_PROOF" uploadEndpoints={endpoints}
    onUploaded={onUploaded} onValidationErrors={vi.fn()} />);
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [file] } });
  await waitFor(() => expect(ref.current?.getPendingFiles()).toHaveLength(1));

  let result!: Awaited<ReturnType<FileUploadHandle['triggerUpload']>>;
  await act(async () => { result = await ref.current!.triggerUpload(); });
  expect(result.uploadedFiles).toEqual([expect.objectContaining({ id: 'confirmed', scanStatus: 'PENDING' })]);
  expect(result.applicationDocuments).toEqual([expect.objectContaining({ fileId: 'confirmed' })]);
  expect(result.scanErrors).toContain('Could not check the uploaded files for viruses. Check their status or remove them before continuing.');
  expect(screen.getByText('Scan pending')).toBeInTheDocument();

  view.rerender(<FileUpload ref={ref} applicationId="app" category="PAYMENT_PROOF" uploadEndpoints={endpoints}
    uploadedFiles={result.uploadedFiles} applicationDocuments={result.applicationDocuments}
    onUploaded={onUploaded} onValidationErrors={vi.fn()} />);
  fireEvent.click(screen.getByRole('link', { name: 'Check scan status for proof.pdf' }));
  await waitFor(() => expect(onUploaded).toHaveBeenLastCalledWith(
    [expect.objectContaining({ id: 'confirmed', scanStatus: 'COMPLETED', scanResult: 'CLEAN' })],
    [expect.objectContaining({ fileId: 'confirmed' })],
  ));
});

it('rechecks restored pending scans and promotes clean files', async () => {
  const pending = { id: 'pending', filename: 'restored.pdf', s3Key: 'key', scanStatus: 'PENDING', scanResult: null } as UploadedFile;
  const document = { fileId: pending.id, documentId: 'doc' } as ApplicationDocument;
  vi.mocked(waitForScanResults).mockResolvedValue(new Map([
    ['pending', { fileId: 'pending', scanStatus: 'COMPLETED', scanResult: 'CLEAN', virusName: null }],
  ]));
  const onUploaded = vi.fn();
  render(<FileUpload applicationId="app" category="PAYMENT_PROOF" uploadEndpoints={endpoints}
    uploadedFiles={[pending]} applicationDocuments={[document]} onUploaded={onUploaded} />);
  expect(await screen.findByText('Scan pending')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: 'Check scan status for restored.pdf' }));
  await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(
    [expect.objectContaining({ id: 'pending', scanStatus: 'COMPLETED', scanResult: 'CLEAN' })],
    [document],
  ));
  await waitFor(() => expect(screen.queryByText('Scan pending')).not.toBeInTheDocument());
});

it('clears invalid selections without discarding previously queued valid files', async () => {
  const valid = new File(['pdf'], 'valid.pdf', { type: 'application/pdf' });
  vi.mocked(validateFiles)
    .mockResolvedValueOnce({ validFiles: [valid], errors: [], totalSize: valid.size, remainingSpace: 1000 })
    .mockResolvedValueOnce({ validFiles: [], errors: [{ filename: 'invalid.exe', errorType: 'INVALID_TYPE', message: 'Invalid file' }], totalSize: 0, remainingSpace: 1000 });
  const ref = createRef<FileUploadHandle>();
  const view = render(<FileUpload ref={ref} applicationId="app" category="PAYMENT_PROOF" uploadEndpoints={endpoints} blockOnSelectionErrors />);
  const input = view.container.querySelector('input[type="file"]')!;
  fireEvent.change(input, { target: { files: [valid] } });
  await waitFor(() => expect(ref.current?.getPendingFiles()).toEqual([valid]));
  fireEvent.change(input, { target: { files: [new File(['bad'], 'invalid.exe')] } });
  await screen.findByRole('button', { name: 'Clear failed selection' });
  fireEvent.click(screen.getByRole('button', { name: 'Clear failed selection' }));
  expect(ref.current?.getPendingFiles()).toEqual([valid]);
});

it('does not block a text-only submission on a cached invalid selection outside payment flow', async () => {
  vi.mocked(validateFiles).mockResolvedValue({ validFiles: [], errors: [
    { filename: 'invalid.exe', errorType: 'INVALID_TYPE', message: 'Invalid file' },
  ], totalSize: 0, remainingSpace: 1000 });
  const ref = createRef<FileUploadHandle>();
  const view = render(<FileUpload ref={ref} applicationId="app" category="FIR" uploadEndpoints={endpoints} />);
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [new File(['bad'], 'invalid.exe')] } });
  await waitFor(() => expect(validateFiles).toHaveBeenCalled());
  expect(screen.queryByRole('button', { name: 'Clear failed selection' })).not.toBeInTheDocument();
  await act(async () => expect((await ref.current!.triggerUpload()).scanErrors).toEqual([]));
});

it('keeps uploaded-document download links for non-payment uploaders using custom endpoints', () => {
  const uploaded = { id: 'existing', filename: 'existing.pdf', s3Key: 'key', scanStatus: 'COMPLETED', scanResult: 'CLEAN' } as UploadedFile;
  render(<FileUpload applicationId="app" category="FIR" uploadEndpoints={endpoints} uploadedFiles={[uploaded]} />);
  expect(screen.getByRole('link', { name: 'existing.pdf' })).toBeInTheDocument();
});