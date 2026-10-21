import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReviewApplicationInfoCard } from './ReviewApplicationInfoCard';

describe('ReviewApplicationInfoCard assignee row', () => {
  it('shows an explicit unassigned value when the application has no assignee', () => {
    render(<ReviewApplicationInfoCard desnzRef="S3700004" status="Draft" assigneeName={null} />);

    expect(screen.getByText('Assigned to')).toBeInTheDocument();
    expect(screen.getByText('Not assigned')).toBeInTheDocument();
  });

  it('shows the assigned contact name when present', () => {
    render(<ReviewApplicationInfoCard desnzRef="S3700004" status="Draft" assigneeName="Priya Nair" />);

    expect(screen.getByText('Assigned to')).toBeInTheDocument();
    expect(screen.getByText('Priya Nair')).toBeInTheDocument();
  });
});
