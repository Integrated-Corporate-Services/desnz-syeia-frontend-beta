import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import NoticesPagination from './NoticesPagination';
import type { NoticePaginationStep } from '../constants/noticesConstants';

const renderPagination = (current: NoticePaginationStep, url: string) => render(
  <MemoryRouter initialEntries={[url]}>
    <Routes>
      <Route path="/cpo/:applicationId/record-notices/:noticeStep" element={<NoticesPagination current={current} />} />
    </Routes>
  </MemoryRouter>
);

describe('NoticesPagination', () => {
  it('links to the previous and next notice pages in sequence', () => {
    renderPagination('online', '/cpo/app/record-notices/online');

    expect(screen.getByRole('link', { name: /Previous page Inspection addresses/ })).toHaveAttribute('href', '/cpo/app/record-notices/inspection');
    expect(screen.getByRole('link', { name: /Next page Newspaper notices/ })).toHaveAttribute('href', '/cpo/app/record-notices/newspapers');
  });

  it('keeps the from query on pagination links', () => {
    renderPagination('site', '/cpo/app/record-notices/site?from=check');

    expect(screen.getByRole('link', { name: /Previous page Website notice/ })).toHaveAttribute('href', '/cpo/app/record-notices/website?from=check');
    expect(screen.getByRole('link', { name: /Next page Statement of service/ })).toHaveAttribute('href', '/cpo/app/record-notices/people?from=check');
  });

  it('has no next link on the final page and no previous link on the first', () => {
    const { unmount } = renderPagination('check', '/cpo/app/record-notices/check');
    expect(screen.queryByRole('link', { name: /Next page/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Previous page/ })).toBeInTheDocument();
    unmount();

    renderPagination('requirements', '/cpo/app/record-notices/requirements');
    expect(screen.queryByRole('link', { name: /Previous page/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Next page Inspection addresses/ })).toHaveAttribute('href', '/cpo/app/record-notices/inspection');
  });
});
