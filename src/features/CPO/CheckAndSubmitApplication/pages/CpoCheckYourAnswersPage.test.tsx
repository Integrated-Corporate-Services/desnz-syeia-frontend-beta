import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreadcrumbProvider, useBreadcrumbContext } from '../../../../context/BreadcrumbContext';
import { downloadS3FileOnSameTab } from '../../../../utils/s3DownloadUtil';
import { applicationApiService, SubmitApplicationError } from '../../../../services/applicationApiService';
import { EMPTY_ORDER_DETAILS } from '../../OrderDetails/constants/orderDetailsConstants';
import { DOCUMENT_CATEGORIES } from '../../OrderDocuments/constants/orderDocumentsConstants';
import { CPO_SUBSECTIONS } from '../../TaskList/constants/cpoTaskListConstants';
import CpoCheckYourAnswersPage from './CpoCheckYourAnswersPage';

vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));
vi.mock('../../../../utils/s3DownloadUtil', () => ({ downloadS3FileOnSameTab: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../../../../services/applicationApiService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../services/applicationApiService')>();
  return { ...actual, applicationApiService: { getApplicationReview: vi.fn(), submitApplication: vi.fn() } };
});

const BreadcrumbOutlet = () => <nav aria-label="Page navigation">{useBreadcrumbContext().breadcrumb}</nav>;
const pageNavigation = () => within(screen.getByRole('navigation', { name: 'Page navigation' }));

const renderPage = () => render(<BreadcrumbProvider><MemoryRouter initialEntries={['/cpo/app/check-and-submit']}><BreadcrumbOutlet /><Routes>
  <Route path="/cpo/:applicationId/check-and-submit" element={<CpoCheckYourAnswersPage />} />
  <Route path="/cpo/:applicationId/application-submitted" element={<h1>Submitted page</h1>} />
</Routes></MemoryRouter></BreadcrumbProvider>);

const file = (filename: string) => ({ id: filename, document_id: filename, application_id: 'app', file_id: filename, filename, s3_key: `key/${filename}`, scan_status: 'COMPLETED' as const, scan_result: 'CLEAN' as const, bucket_name: 'test', virtual_folder: '', storage_provider: 'local', file_content_type: 'application/pdf', file_size_bytes: 100, uploaded_at_timestamp: '', added_by: '', added_at: '' });
const ready = () => screen.findByRole('heading', { level: 3, name: 'Record your notices' });
const card = (title: string) => screen.getByRole('heading', { level: 3, name: title }).closest('.govuk-summary-card') as HTMLElement;
const application = (overrides: Record<string, unknown> = {}) => ({
  type: 'CPO', status: 'DRAFT', desnz_ref: 'CPO000001', operator_ref: '012345678',
  permissions: { canEdit: true, canDownload: true, canSubmit: true },
  pre_submission_meeting_answer: 'Yes, I’ve had this meeting',
  application_party: { organisation_name: 'National Grid Electricity Distribution', contact_person_name: 'Alex Smith', contact_person_line1: '72 Guild Street', contact_person_city: 'London', contact_person_postcode: 'SE23 6FH', contact_person_email: 'alex.smith@example.co.uk', contact_person_phone: '07123 456789', additional_contact: 'ops.team@ngeld.co.uk' },
  ...overrides,
}) as any;
type Answers = { application: any; projectOverview: any; order: any; documents: any; notices: any; progress: { subsection_name: string; status: string }[] };
let answers: Answers;
const mockApplication = (value: unknown) => { answers.application = value; };
const inCategory = (documents: any[], ...categories: string[]) => documents.filter((document) => categories.includes(document.category));
/** The GET /review payload the backend's cpoReviewPayloadBuilder returns for these answers. */
const review = ({ application: saved, projectOverview, order, documents, notices: savedNotices, progress }: Answers) => ({
  applicationId: 'app', status: saved.status, desnzRef: saved.desnz_ref ?? null, formType: saved.type, permissions: saved.permissions,
  metadata: { schemaVersion: 1, source: 'SYEIA' },
  sections: {
    applicantDetails: { applicationParty: saved.application_party ?? null, operatorRef: saved.operator_ref ?? null },
    preSubmissionMeeting: { answer: saved.pre_submission_meeting_answer ?? null, requested: saved.pre_submission_meeting_requested ?? null, reason: saved.pre_submission_meeting_reason ?? null, requestedAt: null, completedAt: null },
    projectOverview,
    orderDetails: order.details,
    executiveSummary: { documents: order.documents },
    orderDocuments: {
      order: inCategory(documents.documents, DOCUMENT_CATEGORIES.order, DOCUMENT_CATEGORIES.maps),
      reasons: inCategory(documents.documents, DOCUMENT_CATEGORIES.reasons),
      additional: inCategory(documents.documents, DOCUMENT_CATEGORIES.additional),
    },
    notices: savedNotices, progress, incompleteSections: [], payment: null,
  },
});
const completedProgress = Object.values(CPO_SUBSECTIONS).map((subsection_name) => ({ subsection_name, status: 'Completed' }));
const notices = (overrides: Record<string, unknown> = {}) => ({
  reference: 'CPO000001', objectionsEmail: '', finalObjectionDate: null,
  record: {
    requirements: { acknowledged: true }, check: { confirmed: true },
    inspection: { addresses: [{ id: 'a1', line1: 'Network House', line2: '72 Guild Street', townCity: 'London', postcode: 'SE23 6FH', from: '2026-08-08' }] },
    online: { url: 'https://www.example.gov.uk/north-ridge-cpo' },
    newspapers: { evidence: [{ fileId: 'first-week.pdf', date: '2026-10-07' }] },
    site: { completionDate: '2026-10-07' },
    people: { completionDate: '2026-10-07' },
  },
  documents: [{ ...file('first-week.pdf'), category: 'CPO_NEWSPAPER_NOTICES' }, { ...file('site-map.pdf'), category: 'CPO_SITE_NOTICES' }, { ...file('statement-of-service.pdf'), category: 'CPO_QUALIFYING_PERSON_NOTICES' }],
  ...overrides,
}) as any;

describe('CPO check your answers', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); vi.clearAllMocks();
    answers = {
      application: application(),
      progress: completedProgress,
      projectOverview: { projectName: 'North Ridge substation', projectSummary: 'Grid reinforcement for North Ridge' },
      order: { details: { ...EMPTY_ORDER_DETAILS, orderName: 'Compulsory purchase order', purpose: 'To acquire land and rights' }, documents: [file('executive-summary.docx')] },
      documents: { orderDetails: {}, documents: [{ ...file('order.pdf'), category: DOCUMENT_CATEGORIES.order }, { ...file('reasons.pdf'), category: DOCUMENT_CATEGORIES.reasons }] },
      notices: notices(),
    };
    vi.mocked(applicationApiService.getApplicationReview).mockImplementation(async () => review(answers));
  });

  it('shows the caption, heading and each section of the design', async () => {
    renderPage(); await ready();
    expect(screen.getByText('Check and submit', { selector: 'span' })).toHaveClass('govuk-caption-l');
    expect(screen.getByRole('heading', { level: 1, name: 'Check your answers before sending your application' })).toBeInTheDocument();
    for (const heading of ['Applicant details', 'Project information', 'Public notices']) expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
    for (const title of ['Applicant details', 'Pre-application meeting', 'Project overview', 'Executive summary', 'Order details', 'Order documents', 'Record your notices']) expect(screen.getByRole('heading', { level: 3, name: title })).toBeInTheDocument();
  });

  it('shows the saved applicant details, references and order answers', async () => {
    renderPage(); await ready();
    const applicant = within(card('Applicant details'));
    expect(applicant.getByText('National Grid Electricity Distribution')).toBeInTheDocument();
    expect(applicant.getByText('ops.team@ngeld.co.uk')).toBeInTheDocument();
    expect(applicant.getByText('012345678')).toBeInTheDocument();
    expect(within(card('Pre-application meeting')).getByText('CPO000001')).toBeInTheDocument();
    expect(within(card('Project overview')).getByText('North Ridge substation')).toBeInTheDocument();
    expect(within(card('Project overview')).getByText('Grid reinforcement for North Ridge')).toBeInTheDocument();
    expect(within(card('Order details')).getByText('Compulsory purchase order')).toBeInTheDocument();
    expect(within(card('Order details')).getByText('To acquire land and rights')).toBeInTheDocument();
  });

  it('shows Yes for a meeting that took place, without a reason row', async () => {
    renderPage(); await ready();
    const meeting = within(card('Pre-application meeting'));
    expect(meeting.getByText('Yes')).toBeInTheDocument();
    expect(meeting.queryByText('Tell us why you don’t need this meeting')).not.toBeInTheDocument();
  });

  it('shows No without a reason row when a meeting was requested', async () => {
    mockApplication(application({ pre_submission_meeting_answer: 'No, I would like a pre-application meeting', pre_submission_meeting_reason: undefined }));
    renderPage(); await ready();
    const meeting = within(card('Pre-application meeting'));
    expect(meeting.getByText('No')).toBeInTheDocument();
    expect(meeting.queryByText('Tell us why you don’t need this meeting')).not.toBeInTheDocument();
  });

  it('shows No and the reason when a meeting is not needed', async () => {
    mockApplication(application({ pre_submission_meeting_answer: 'No, I don’t need this meeting', pre_submission_meeting_reason: 'Discussed with the case officer.' }));
    renderPage(); await ready();
    const meeting = within(card('Pre-application meeting'));
    expect(meeting.getByText('No')).toBeInTheDocument();
    expect(meeting.getByText('Tell us why you don’t need this meeting')).toBeInTheDocument();
    expect(meeting.getByText('Discussed with the case officer.')).toBeInTheDocument();
  });

  it('has no Change link on applicant details or the pre-application meeting', async () => {
    renderPage(); await ready();
    expect(within(card('Applicant details')).queryByRole('link', { name: /Change/ })).not.toBeInTheDocument();
    expect(within(card('Pre-application meeting')).queryByRole('link', { name: /Change/ })).not.toBeInTheDocument();
  });

  it('links each editable card to its check page and back to this review', async () => {
    renderPage(); await ready();
    expect(screen.getByRole('link', { name: 'Change project overview' })).toHaveAttribute('href', '/cpo/app/project-overview?from=check-and-submit');
    expect(screen.getByRole('link', { name: 'Change executive summary' })).toHaveAttribute('href', '/cpo/app/executive-summary?from=check-and-submit');
    expect(screen.getByRole('link', { name: 'Change order details' })).toHaveAttribute('href', '/cpo/app/order-details/check?from=check-and-submit');
    expect(screen.getByRole('link', { name: 'Change order documents' })).toHaveAttribute('href', '/cpo/app/order-documents/check?from=check-and-submit');
    expect(screen.getByRole('link', { name: 'Change record your notices' })).toHaveAttribute('href', '/cpo/app/record-notices/check?from=check-and-submit');
  });

  it('lists uploaded document names with their notice dates', async () => {
    renderPage(); await ready();
    expect(screen.getByRole('link', { name: 'executive-summary.docx' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'order.pdf' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'reasons.pdf' })).toBeInTheDocument();
    expect(within(card('Order documents')).getByText('None uploaded')).toBeInTheDocument();
    const record = within(card('Record your notices'));
    expect(record.getByText('Inspection address 1')).toBeInTheDocument();
    expect(record.getByText(/Available from 8 August 2026/)).toBeInTheDocument();
    expect(record.getByText('https://www.example.gov.uk/north-ridge-cpo')).toBeInTheDocument();
    expect(record.getByText('Published 7 October 2026')).toBeInTheDocument();
    expect(record.getByText('Displayed 7 October 2026')).toBeInTheDocument();
    expect(record.getByText('Last notice served 7 October 2026')).toBeInTheDocument();
  });

  it('does not show a website notice row when none was recorded', async () => {
    renderPage(); await ready();
    expect(within(card('Record your notices')).queryByText('Record the website notice')).not.toBeInTheDocument();
  });

  it('shows the website notice URL and live date when recorded', async () => {
    answers.notices = notices({ record: { ...notices().record, website: { url: 'https://www.example.gov.uk/notice', liveDate: '2026-10-01' } } });
    renderPage(); await ready();
    const record = within(card('Record your notices'));
    expect(record.getByText('Record the website notice')).toBeInTheDocument();
    expect(record.getByText('https://www.example.gov.uk/notice')).toBeInTheDocument();
    expect(record.getByText('Went live 1 October 2026')).toBeInTheDocument();
  });

  it('shows the last-served date when no statement of service is uploaded', async () => {
    answers.notices = notices({ documents: notices().documents.filter((document: any) => document.category !== 'CPO_QUALIFYING_PERSON_NOTICES') });
    renderPage(); await ready();
    const record = within(card('Record your notices'));
    expect(record.getByText('Not uploaded')).toBeInTheDocument();
    expect(record.getByText('Last notice served 7 October 2026')).toBeInTheDocument();
  });

  it('downloads a clean document with its file and application IDs', async () => {
    renderPage(); await ready(); fireEvent.click(screen.getByRole('link', { name: 'order.pdf' }));
    expect(downloadS3FileOnSameTab).toHaveBeenCalledWith('key/order.pdf', 'order.pdf', 'app', 'order.pdf');
  });

  it('does not offer a download while a virus check is running', async () => {
    answers.order.documents = [{ ...file('executive-summary.docx'), scan_status: 'PENDING' }];
    renderPage(); await ready();
    expect(screen.queryByRole('link', { name: 'executive-summary.docx' })).not.toBeInTheDocument();
    expect(screen.getByText(/Virus check not complete/)).toBeInTheDocument();
  });

  it('hides Change, download and Submit without permissions', async () => {
    mockApplication(application({ permissions: undefined }));
    renderPage(); await ready();
    expect(screen.queryByRole('link', { name: /^Change / })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'order.pdf' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit application' })).not.toBeInTheDocument();
  });

  it('does not allow changes or a second submit once submitted', async () => {
    mockApplication(application({ status: 'SUBMITTED' }));
    renderPage(); await ready();
    expect(screen.queryByRole('link', { name: /^Change / })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit application' })).not.toBeInTheDocument();
  });

  it('shows the task list breadcrumb to a user who can edit the draft', async () => {
    renderPage(); await ready();
    expect(pageNavigation().getByRole('link', { name: 'Task list' })).toHaveAttribute('href', '/cpo/app/task-list');
    expect(pageNavigation().getByRole('link', { name: 'Check and submit' })).toHaveAttribute('href', '/cpo/app/check-and-submit');
    expect(pageNavigation().queryByRole('link', { name: 'Application Dashboard' })).not.toBeInTheDocument();
  });

  it.each([
    ['a draft created by someone else', { permissions: { canEdit: false, canDownload: true, canSubmit: false } }],
    ['a submitted application', { status: 'SUBMITTED' }],
  ])('links back to the application dashboard for %s', async (_case, overrides) => {
    mockApplication(application(overrides));
    renderPage(); await ready();
    const back = await pageNavigation().findByRole('link', { name: 'Application Dashboard' });
    expect(back).toHaveAttribute('href', '/application-dashboard');
    expect(back).toHaveClass('govuk-back-link');
    expect(pageNavigation().queryByRole('link', { name: 'Task list' })).not.toBeInTheDocument();
  });

  it('submits a complete application and shows the confirmation page', async () => {
    vi.mocked(applicationApiService.submitApplication).mockResolvedValue({ message: 'ok' });
    renderPage(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));
    expect(await screen.findByRole('heading', { name: 'Submitted page' })).toBeInTheDocument();
    expect(applicationApiService.submitApplication).toHaveBeenCalledWith('app');
  });

  it('names each incomplete section and does not submit', async () => {
    answers.progress = completedProgress.filter((item) => item.subsection_name !== CPO_SUBSECTIONS.ORDER_DOCUMENTS);
    renderPage(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));
    const summary = await screen.findByRole('alert');
    expect(within(summary).getByRole('link', { name: 'Complete the order documents section' })).toHaveAttribute('href', '/cpo/app/order-documents');
    await waitFor(() => expect(summary).toHaveFocus());
    expect(applicationApiService.submitApplication).not.toHaveBeenCalled();
  });

  it('treats unconfirmed notices as incomplete', async () => {
    answers.notices = notices({ record: { ...notices().record, check: { confirmed: false } } });
    renderPage(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));
    expect(await screen.findByRole('link', { name: 'Complete the record your notices section' })).toHaveAttribute('href', '/cpo/app/record-notices');
  });

  it('shows the sections the server reports as incomplete', async () => {
    vi.mocked(applicationApiService.submitApplication).mockRejectedValue(new SubmitApplicationError(400, [{ key: 'executive-summary', label: CPO_SUBSECTIONS.EXECUTIVE_SUMMARY }]));
    renderPage(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));
    expect(await screen.findByRole('link', { name: 'Complete the executive summary section' })).toHaveAttribute('href', '/cpo/app/executive-summary');
    expect(screen.getByRole('button', { name: 'Submit application' })).toBeEnabled();
  });

  it('asks the user to try again when submit fails for another reason', async () => {
    vi.mocked(applicationApiService.submitApplication).mockRejectedValue(new Error('network'));
    renderPage(); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Your application could not be submitted. Try again.');
  });

  it('shows an error summary rather than partial data when the review cannot be loaded', async () => {
    vi.mocked(applicationApiService.getApplicationReview).mockRejectedValue(new Error('Failed to fetch application review'));
    renderPage(); await screen.findByRole('alert'); await waitFor(() => expect(screen.getByRole('alert')).toHaveFocus());
    expect(screen.queryByRole('heading', { name: 'Order details' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('loads every answer from the application review in one request', async () => {
    renderPage(); await ready();
    expect(applicationApiService.getApplicationReview).toHaveBeenCalledTimes(1);
    expect(applicationApiService.getApplicationReview).toHaveBeenCalledWith('app');
  });

  it('rejects another application type', async () => {
    mockApplication({ type: 'NWL', status: 'DRAFT' });
    renderPage(); await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent('Compulsory purchase order application not found');
  });

  it('leaves unanswered fields blank instead of showing Not answered', async () => {
    mockApplication(application({
      pre_submission_meeting_answer: null,
      pre_submission_meeting_requested: null,
      pre_submission_meeting_reason: null,
      operator_ref: '',
      application_party: {
        organisation_name: '',
        contact_person_name: '',
        contact_person_line1: '',
        contact_person_line2: '',
        contact_person_city: '',
        contact_person_county: '',
        contact_person_postcode: '',
        contact_person_email: '',
        contact_person_phone: '',
        additional_contact: '',
      },
    }));
    answers.projectOverview = { projectName: '', projectSummary: '' };
    answers.order = { details: { ...EMPTY_ORDER_DETAILS, orderName: '', purpose: '' }, documents: [file('executive-summary.docx')] };
    answers.notices = notices({ record: { ...notices().record, inspection: { addresses: [] }, online: { url: '' } } });
    renderPage();
    await ready();
    expect(screen.queryByText('Not answered')).not.toBeInTheDocument();
    const valueOf = (title: string, label: string) => {
      const row = Array.from(card(title).querySelectorAll('.govuk-summary-list__row')).find(
        (entry) => entry.querySelector('.govuk-summary-list__key')?.textContent === label,
      );
      return row?.querySelector('.govuk-summary-list__value')?.textContent ?? '';
    };
    expect(valueOf('Applicant details', 'Applicant name').trim()).toBe('');
    expect(valueOf('Applicant details', 'Email address').trim()).toBe('');
    expect(valueOf('Applicant details', 'Phone number').trim()).toBe('');
    expect(valueOf('Applicant details', 'Additional contacts').trim()).toBe('');
    expect(valueOf('Applicant details', "Applicant’s reference").trim()).toBe('');
    expect(screen.queryByText('None added')).not.toBeInTheDocument();
    expect(screen.queryByText('Not provided')).not.toBeInTheDocument();
    expect(valueOf('Pre-application meeting', 'Pre-application meeting').trim()).toBe('');
    expect(valueOf('Project overview', 'Enter the name of the project that requires this CPO').trim()).toBe('');
    expect(valueOf('Project overview', 'Summarise the project').trim()).toBe('');
    expect(valueOf('Order details', 'Enter the order title').trim()).toBe('');
    expect(valueOf('Order details', 'Explain what the order is for').trim()).toBe('');
    expect(valueOf('Record your notices', 'Inspection address').trim()).toBe('');
  });

  it('shows download failures in the error summary', async () => {
    vi.mocked(downloadS3FileOnSameTab).mockRejectedValueOnce(new Error('Download failed'));
    renderPage(); await ready(); fireEvent.click(screen.getByRole('link', { name: 'order.pdf' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to download'));
    expect(screen.getByRole('alert')).toHaveFocus();
  });
});
