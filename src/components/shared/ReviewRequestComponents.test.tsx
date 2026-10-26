import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ActionButtons, ApplicantDetails } from './ReviewRequestComponents';

const requestData = {
  access_request_id: 'r1',
  first_name: 'Jane',
  last_name: 'Austen',
  email: 'jane@example.com',
  organisation_name: 'SSE Networks',
  is_agent: false,
  requested_at: new Date(2026, 9, 19, 11, 55).toISOString(),
};

describe('ApplicantDetails (SYEIA-2720)', () => {
  it('labels the date "Requested on" and formats it as "19 October 2026 at 11:55am"', () => {
    render(<ApplicantDetails requestData={requestData} />);
    expect(screen.getByText('Requested on')).toBeInTheDocument();
    expect(screen.queryByText('Request submitted')).not.toBeInTheDocument();
    expect(screen.getByText('19 October 2026 at 11:55am')).toBeInTheDocument();
  });

  it('uses "Agent or employee" for every role', () => {
    render(<ApplicantDetails requestData={requestData} />);
    expect(screen.getByText('Agent or employee')).toBeInTheDocument();
    expect(screen.queryByText('Applicant type')).not.toBeInTheDocument();
    expect(screen.getByText('Employee')).toBeInTheDocument();
  });
});

describe('ActionButtons (SYEIA-2720)', () => {
  it('shows "Approve access" and "Reject access"', () => {
    render(
      <ActionButtons processing={false} showRejectReason={false} onApprove={() => {}} onReject={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByRole('button', { name: 'Approve access' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reject access' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reject request' })).not.toBeInTheDocument();
  });
});