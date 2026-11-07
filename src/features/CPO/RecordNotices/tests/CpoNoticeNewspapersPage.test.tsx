import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BreadcrumbProvider } from '../../../../context/BreadcrumbContext';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FileUploadProps, FileUploadHandle } from '../../../../components/FileUpload';
import type { NoticesResponse } from '../types/notices';
import { cpoNoticesService } from '../services/cpoNoticesService';
import CpoNoticeNewspapersPage from '../pages/CpoNoticeNewspapersPage';

const navigation = vi.hoisted(() => ({ navigate: vi.fn() }));
const upload = vi.hoisted(() => ({ props: undefined as FileUploadProps | undefined }));

vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('react-router-dom', async () => ({
  ...await vi.importActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => navigation.navigate,
}));
vi.mock('../../../../components/FileUpload', async () => {
  const react = await import('react');
  return {
    default: react.forwardRef<FileUploadHandle, FileUploadProps>((props, ref) => {
      upload.props = props;
      react.useImperativeHandle(ref, () => ({
        getPendingFiles: () => [],
        isBusy: () => false,
        triggerUpload: async () => ({ uploadedFiles: [], applicationDocuments: [], scanErrors: [] }),
      }));
      return <input id="file-upload-input" type="file" />;
    }),
  };
});

const response: NoticesResponse = {
  reference: 'CPO00001',
  objectionsEmail: '',
  finalObjectionDate: null,
  documents: [
    { document_id: 'doc-1', file_id: 'file-1', category: 'CPO_NEWSPAPER_NOTICES', filename: 'week-one.pdf' } as NoticesResponse['documents'][number],
    { document_id: 'doc-2', file_id: 'file-2', category: 'CPO_NEWSPAPER_NOTICES', filename: 'week-two.pdf' } as NoticesResponse['documents'][number],
  ],
  record: {
    newspapers: {
      format: 'reference',
      firstDate: '2026-10-07',
      secondDate: '2026-10-14',
      evidence: [
        { fileId: 'file-1', date: '2026-10-07' },
        { fileId: 'file-2', date: '2026-10-14' },
      ],
    },
  },
};

describe('CpoNoticeNewspapersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upload.props = undefined;
    vi.spyOn(cpoNoticesService, 'get').mockResolvedValue(response);
    vi.spyOn(cpoNoticesService, 'save').mockResolvedValue(response);
  });

  afterEach(() => vi.restoreAllMocks());

  it('continues with the two valid files after rejecting an extra file selection', async () => {
    render(
      <BreadcrumbProvider>
        <MemoryRouter initialEntries={['/cpo/app/record-notices/newspapers']}>
          <Routes>
            <Route path="/cpo/:applicationId/record-notices/newspapers" element={<CpoNoticeNewspapersPage />} />
          </Routes>
        </MemoryRouter>
      </BreadcrumbProvider>
    );

    await screen.findByText('week-one.pdf');
    await act(async () => upload.props?.onValidationErrors?.(['You can upload no more than 2 newspaper notice documents.']));
    expect(await screen.findByRole('alert')).toHaveTextContent('You can upload no more than 2 newspaper notice documents.');

    fireEvent.click(screen.getByRole('button', { name: 'Save and continue' }));

    await waitFor(() => expect(cpoNoticesService.save).toHaveBeenCalledWith(
      'app', 'newspapers', expect.objectContaining({ evidence: [
        { fileId: 'file-1', date: '2026-10-07' },
        { fileId: 'file-2', date: '2026-10-14' },
      ] }), false
    ));
    expect(navigation.navigate).toHaveBeenCalledWith('/cpo/app/record-notices/site');
  });
});