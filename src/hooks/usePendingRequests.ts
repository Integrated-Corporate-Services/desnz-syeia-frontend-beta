import { useState, useEffect } from 'react';
import accessRequestAdminService from '../services/accessRequestAdminService';

interface AccessRequest {
  access_request_id: string;
  first_name: string;
  last_name: string;
  email: string;
  organisation_name?: string;
  is_agent: boolean;
  requested_at: string;
  status: string;
}

interface Filters {
  applicantType: 'all' | 'employee' | 'agent';
}

export const usePendingRequests = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    applicantType: 'all'
  });

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, requests]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await accessRequestAdminService.getPendingRequests();
      if (response.success && response.data) {
        // Filter to show only PENDING status requests
        const pendingOnly = response.data.filter((req: AccessRequest) => req.status === 'PENDING');
        setRequests(pendingOnly);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (filters.applicantType === 'employee') {
      filtered = filtered.filter(req => !req.is_agent);
    } else if (filters.applicantType === 'agent') {
      filtered = filtered.filter(req => req.is_agent);
    }

    setFilteredRequests(filtered);
  };

  const updateFilter = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  return {
    requests,
    filteredRequests,
    loading,
    error,
    filters,
    updateFilter
  };
};
