import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ObjectionJourney } from '../types/objectionJourney';

export const journeyFixture = (overrides: Partial<ObjectionJourney> = {}): ObjectionJourney => ({
  reference: 'CPO00001',
  title: 'The Northtown Power Networks Ltd (North Ridge Connection) Compulsory Purchase Order 2026',
  organisation: 'Northtown Power Networks Ltd',
  action: 'submit',
  fullName: '',
  email: '',
  emailVerified: false,
  securityCodeExpiryMinutes: 60,
  addressSearch: { postcode: '', property: '', status: null, results: [] },
  address: null,
  objectorType: null,
  objectionDetails: '',
  documents: [],
  objectorNames: [],
  ...overrides,
});

export const renderPage = (page: React.ReactElement) => render(<MemoryRouter>{page}</MemoryRouter>);
