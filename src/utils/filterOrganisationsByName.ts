import type { Organisation } from '../types/organisation';

export const filterOrganisationsByName = (
  organisations: Organisation[],
  searchTerm: string
) => {
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase('en-GB');

  if (!normalizedSearchTerm) return organisations;

  return organisations.filter((organisation) =>
    organisation.organisation_name
      .toLocaleLowerCase('en-GB')
      .includes(normalizedSearchTerm)
  );
};