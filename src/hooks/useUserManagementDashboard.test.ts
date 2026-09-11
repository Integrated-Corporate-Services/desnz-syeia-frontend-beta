import { describe, expect, it } from 'vitest';
import { filterOrganisationsByName } from '../utils/filterOrganisationsByName';
import type { Organisation } from '../types/organisation';

const organisations: Organisation[] = [
  {
    organisation_id: 'sse',
    organisation_name: 'SSE Networks',
    team_coordinators: [],
    approved_domains: [],
  },
  {
    organisation_id: 'national-grid',
    organisation_name: 'National Grid Electricity Distribution',
    team_coordinators: [],
    approved_domains: [],
  },
];

describe('filterOrganisationsByName', () => {
  it('matches organisation names case-insensitively', () => {
    expect(filterOrganisationsByName(organisations, 'national grid')).toEqual([
      organisations[1],
    ]);
  });

  it('returns all organisations for an empty search', () => {
    expect(filterOrganisationsByName(organisations, '   ')).toEqual(organisations);
  });
});