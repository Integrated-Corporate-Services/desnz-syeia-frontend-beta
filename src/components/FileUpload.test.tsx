import React, { createRef } from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import FileUpload, { type FileUploadHandle } from './FileUpload';
import { getPresignedUrls } from '../services/s3ApiService';

vi.mock('../context/AuthUserContext', () => ({ useAuthUserContext: () => ({ user: { user_id: 'user' } }) }));
vi.mock('../utils/fileUploadValidation', () => ({ validateFiles: async (files: File[]) => ({ validFiles: files, errors: [] }), getMimeType: () => 'application/pdf' }));
vi.mock('../services/s3ApiService', () => ({ getPresignedUrls: vi.fn(), uploadFileToS3: vi.fn(), extractUploadEtag: vi.fn(), deleteFileCompletely: vi.fn(), deleteDocument: vi.fn(), confirmUpload: vi.fn() }));

it('returns upload-URL failures to the save handler instead of reporting success', async () => {
  vi.mocked(getPresignedUrls).mockRejectedValue(new Error('Maximum 10 files allowed per batch upload'));
  const ref = createRef<FileUploadHandle>();
  const validation = vi.fn();
  const view = render(<FileUpload ref={ref} applicationId="app" category="CPO_NEWSPAPER_NOTICES" onValidationErrors={validation} />);
  fireEvent.change(view.container.querySelector('input[type="file"]')!, { target: { files: [new File(['pdf'], 'notice.pdf', { type: 'application/pdf' })] } });
  await waitFor(() => expect(ref.current?.getPendingFiles()).toHaveLength(1));
  await act(async () => {
    const result = await ref.current!.triggerUpload();
    expect(result.scanErrors).toEqual(['Maximum 10 files allowed per batch upload']);
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