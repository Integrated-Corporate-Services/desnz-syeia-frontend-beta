import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ObjectionStartPage from './ObjectionStartPage';
import { renderPage } from '../utils/testUtils';

vi.mock('../../../../components/PageTitle', () => ({ default: () => null }));

describe('ObjectionStartPage (SYEIA-2923)', () => {
  it('introduces the service and who can object (AC1)', () => {
    renderPage(<ObjectionStartPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Submit or withdraw an objection to a CPO' })).toBeInTheDocument();
    expect(screen.getByText(/Use this service to object to a compulsory purchase order \(CPO\)/)).toBeInTheDocument();
    expect(screen.getByText('yourself')).toBeInTheDocument();
    expect(screen.getByText('an organisation you own or work for')).toBeInTheDocument();
  });

  it('lists what you need before you start, and the deadline (AC2)', () => {
    renderPage(<ObjectionStartPage />);
    expect(screen.getByRole('heading', { name: 'Before you start' })).toBeInTheDocument();
    [
      'the CPO reference number found on the public notice, for example CPO000001',
      'an email address you have access to, so we can send you a security code',
      'your postal address for official letters',
      'the name of each person or organisation making the objection',
      'full details of the objection',
      'You must submit objections before the deadline published on the public notice.',
    ].forEach((text) => expect(screen.getByText(text)).toBeInTheDocument());
  });

  it('starts the journey at the CPO reference page (AC3)', () => {
    renderPage(<ObjectionStartPage />);
    const start = screen.getByRole('button', { name: 'Start now' });
    expect(start).toHaveAttribute('href', '/object-to-a-cpo/cpo-reference');
    expect(start).toHaveClass('govuk-button--start');
  });

  it('explains what happens, links the guidance in a new tab and gives the postal route (AC4 to AC6)', () => {
    renderPage(<ObjectionStartPage />);
    expect(screen.getByText(/We will share your objection with the company that made the order/)).toBeInTheDocument();
    const guidance = screen.getByRole('link', { name: 'Read more about the compulsory purchase process (opens in a new tab)' });
    expect(guidance).toHaveAttribute('href', 'https://www.gov.uk/government/publications/compulsory-purchase-process-guidance');
    expect(guidance).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('heading', { name: 'Other ways to object' })).toBeInTheDocument();
    expect(screen.getByText('You can also object by writing to us at the address on the public notice.')).toBeInTheDocument();
  });
});
