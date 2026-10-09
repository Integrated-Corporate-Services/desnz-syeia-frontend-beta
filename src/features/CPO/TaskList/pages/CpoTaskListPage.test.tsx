import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { it, expect, vi } from 'vitest';
import { applicationApiService } from '../../../../services/applicationApiService';
import { progressApiService } from '../../../../services/progressApiService';
import CpoTaskListPage from './CpoTaskListPage';
import { CPO_SUBSECTIONS } from '../constants/cpoTaskListConstants';

vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));

it('shows the reference title and real completed document progress on the task list', async () => {
  vi.spyOn(applicationApiService, 'getApplicationById').mockResolvedValue({ type: 'CPO', cpo_order_details: { orderName: 'North Ridge Grid Reinforcement CPO' }, operator_name: 'National Grid Electricity Distribution' });
  vi.spyOn(progressApiService, 'fetchApplicationProgress').mockResolvedValue([
    ...['Applicant details', 'Pre-submission meeting', 'Order details', 'Order documents'].map((subsection_name) => ({ subsection_name, status: 'Completed' })),
    { subsection_name: 'What your notices must include', status: 'Not completed' },
    { subsection_name: 'Record your notices', status: 'Not completed' },
    { subsection_name: 'Check and submit your application', status: 'Not completed' },
  ]);
  render(<MemoryRouter initialEntries={['/cpo/application-id/task-list']}><Routes><Route path="/cpo/:applicationId/task-list" element={<CpoTaskListPage />} /></Routes></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'Compulsory purchase order' })).toBeInTheDocument();
  expect(screen.getByText('Complete the following sections in order to create and submit your application.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Executive summary' })).toHaveAttribute('href', '/cpo/application-id/order-details/executive-summary');
  expect(screen.getByRole('link', { name: 'Executive summary' }).closest('li')).toHaveTextContent('Not completed');
  expect(screen.getByRole('link', { name: 'Order documents' }).closest('li')).toHaveTextContent('Completed');
  expect(screen.getByText('Cannot start yet')).toBeInTheDocument();
});

it('unlocks application review when all seven prerequisites are complete, ignoring legacy requirements progress', async () => {
  vi.spyOn(applicationApiService, 'getApplicationById').mockResolvedValue({ type: 'CPO', cpo_publicity: { requirements: { acknowledged: true }, check: { confirmed: true } } });
  vi.spyOn(progressApiService, 'fetchApplicationProgress').mockResolvedValue([
    ...Object.values(CPO_SUBSECTIONS).filter(subsection => subsection !== CPO_SUBSECTIONS.CHECK_AND_SUBMIT).map(subsection_name => ({ subsection_name, status: 'Completed' })),
    { subsection_name: 'What your notices must include', status: 'Not completed' },
  ]);
  render(<MemoryRouter initialEntries={['/cpo/application-id/task-list']}><Routes><Route path="/cpo/:applicationId/task-list" element={<CpoTaskListPage />} /></Routes></MemoryRouter>);
  expect(await screen.findByRole('link', { name: 'Check and submit your application' })).toHaveAttribute('href', '/cpo/application-id/check-and-submit');
  expect(screen.queryByRole('link', { name: 'Public notice requirements' })).not.toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: 'Record your notices' })).toHaveLength(1);
});

it('keeps legacy completed notices unfinished until requirements are acknowledged and reviewed', async () => {
  vi.spyOn(applicationApiService, 'getApplicationById').mockResolvedValue({ type: 'CPO', cpo_publicity: {} });
  vi.spyOn(progressApiService, 'fetchApplicationProgress').mockResolvedValue(Object.values(CPO_SUBSECTIONS).map(subsection_name => ({ subsection_name, status: 'Completed' })));
  render(<MemoryRouter initialEntries={['/cpo/application-id/task-list']}><Routes><Route path="/cpo/:applicationId/task-list" element={<CpoTaskListPage />} /></Routes></MemoryRouter>);
  expect((await screen.findByRole('link', { name: 'Record your notices' })).closest('li')).toHaveTextContent('Not completed');
  expect(screen.getByText('Cannot start yet')).toBeInTheDocument();
});

it('does not show misleading task statuses after a task-list load failure', async () => {
  vi.spyOn(applicationApiService, 'getApplicationById').mockRejectedValue(new Error('Failed'));
  vi.spyOn(progressApiService, 'fetchApplicationProgress').mockResolvedValue([]);
  render(<MemoryRouter initialEntries={['/cpo/application-id/task-list']}><Routes><Route path="/cpo/:applicationId/task-list" element={<CpoTaskListPage />} /></Routes></MemoryRouter>);
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load the CPO task list');
  expect(screen.queryByRole('link', { name: 'Order details' })).not.toBeInTheDocument();
});

it.each([
  ['Completed', 'Completed', 'govuk-tag--green'],
  ['Not completed', 'Not completed', 'govuk-tag--blue'],
  ['Incomplete', 'Not completed', 'govuk-tag--blue'],
  ['In progress', 'In progress', 'govuk-tag--blue'],
  ['Not started', 'Not completed', 'govuk-tag--blue'],
])('displays saved status %s using S37 status conventions', async (savedStatus, label, colour) => {
  vi.spyOn(applicationApiService, 'getApplicationById').mockResolvedValue({ type: 'CPO' });
  vi.spyOn(progressApiService, 'fetchApplicationProgress').mockResolvedValue([{ subsection_name: 'Order details', status: savedStatus }]);
  render(<MemoryRouter initialEntries={['/cpo/application-id/task-list']}><Routes><Route path="/cpo/:applicationId/task-list" element={<CpoTaskListPage />} /></Routes></MemoryRouter>);
  const link = await screen.findByRole('link', { name: 'Order details' });
  const status = link.closest('li')?.querySelector('.govuk-tag');
  expect(status).toHaveTextContent(label);
  expect(status).toHaveClass(colour);
  expect(link).toHaveAccessibleDescription(label);
  expect(screen.getByText('Cannot start yet')).toHaveClass('govuk-tag--grey');
  expect(screen.queryByRole('link', { name: 'Check and submit your application' })).not.toBeInTheDocument();
});
