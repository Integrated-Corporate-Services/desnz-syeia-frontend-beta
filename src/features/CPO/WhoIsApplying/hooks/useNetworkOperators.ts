import { useEffect, useState } from 'react';
import { networkOperatorApiService } from '../../../../services/networkOperatorApiService';

type NetworkOperatorUser = {
  organisation_id: string;
  organisation_name: string;
  address_line1?: string;
};

export type OrganizationOption = {
  organisation_id: string;
  organisation_name: string;
  users: NetworkOperatorUser[];
};

export const useNetworkOperators = (organisationId = '') => {
  const [options, setOptions] = useState<OrganizationOption[]>([]);
  const [selectedOrgName, setSelectedOrgName] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await networkOperatorApiService.getNetworkOperators();
        const users: NetworkOperatorUser[] = Array.isArray(data) ? data : [];
        const organisations = new Map<string, OrganizationOption>();
        users.forEach(user => {
          const existing = organisations.get(user.organisation_id);
          if (existing) existing.users.push(user);
          else organisations.set(user.organisation_id, {
            organisation_id: user.organisation_id,
            organisation_name: user.organisation_name,
            users: [user],
          });
        });
        if (active) setOptions(Array.from(organisations.values()));
      } catch {
        if (active) setOptions([]);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (organisationId) setSelectedOrgName(options.find(option => option.organisation_id === organisationId)?.organisation_name || '');
  }, [organisationId, options]);

  return {
    options,
    selectedOrgName,
    selectedOrganisation: options.find(option => option.organisation_name === selectedOrgName) ?? null,
    handleOrgChange: setSelectedOrgName,
  };
};