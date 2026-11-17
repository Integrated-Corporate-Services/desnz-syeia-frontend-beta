import React, { createRef } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import FileUpload, { type FileUploadHandle } from './FileUpload';
import { deleteDocument } from '../services/s3ApiService';

vi.mock('../context/AuthUserContext', () => ({ useAuthUserContext: () => ({ user: { user_id: 'user' } }) }));
vi.mock('../services/s3ApiService', () => ({ getPresignedUrls: vi.fn(), uploadFileToS3: vi.fn(), extractUploadEtag: vi.fn(), deleteFileCompletely: vi.fn(), deleteDocument: vi.fn(), confirmUpload: vi.fn() }));

const uploadedFiles = [{
  id: 'f-1', storageProvider: 'aws_s3', s3Key: 'k', bucketName: '', virtualFolder: '', filename: 'eia.pdf',
  fileContentType: 'application/pdf', fileSizeBytes: 3, uploadedAtTimestamp: '',
}];
const applicationDocuments = [{ documentId: 'd-1', applicationId: 'app', fileId: 'f-1', category: 'EIA_REPORT', addedBy: 'user', addedAt: '' }];

beforeEach(() => vi.clearAllMocks());

// SYEIA-1485: a parent page must be able to hold a save while a delete is still in flight.
it('reports a delete as in progress until it finishes', async () => {
  let finishDelete: () => void = () => {};
  vi.mocked(deleteDocument).mockImplementation(() => new Promise((resolve) => { finishDelete = () => resolve(undefined as never); }));
  const ref = createRef<FileUploadHandle>();
  const onDeleteFile = vi.fn();
  render(<FileUpload ref={ref} applicationId="app" category="EIA_REPORT" uploadedFiles={uploadedFiles} applicationDocuments={applicationDocuments} onDeleteFile={onDeleteFile} />);
  expect(ref.current?.isDeleting?.()).toBe(false);
  fireEvent.click(screen.getByRole('link', { name: /Delete eia\.pdf/ }));
  await waitFor(() => expect(deleteDocument).toHaveBeenCalledWith('d-1'));
  expect(ref.current?.isDeleting?.()).toBe(true);
  expect(onDeleteFile).not.toHaveBeenCalled();
  await act(async () => { finishDelete(); });
  expect(onDeleteFile).toHaveBeenCalledWith('f-1');
  expect(ref.current?.isDeleting?.()).toBe(false);
});

it('ignores Delete while deleteDisabled is set', () => {
  const onDeleteFile = vi.fn();
  render(<FileUpload applicationId="app" category="EIA_REPORT" uploadedFiles={uploadedFiles} applicationDocuments={applicationDocuments} onDeleteFile={onDeleteFile} deleteDisabled />);
  fireEvent.click(screen.getByRole('link', { name: /Delete eia\.pdf/ }));
  expect(deleteDocument).not.toHaveBeenCalled();
  expect(onDeleteFile).not.toHaveBeenCalled();
});
