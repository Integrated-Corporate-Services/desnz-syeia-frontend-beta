import { useState, useMemo } from 'react';
import { DATE_FILTER_DAYS } from '../constants/filterOptions';
import type { Application } from '../../../types/application';
import { getDaysDifference, containsSearchTerm } from '../../../utils';

export const useWorkbasketFilters = (applications: Application[]) => {
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Status filter
      if (statusFilter && app.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Date filter
      if (dateFilter && dateFilter in DATE_FILTER_DAYS) {
        const appDate = new Date(app.created_at);
        const now = new Date();
        const diffDays = getDaysDifference(appDate, now);
        const maxDays = DATE_FILTER_DAYS[dateFilter as keyof typeof DATE_FILTER_DAYS];
        
        if (diffDays > maxDays) return false;
      }

      // Search filter
      if (searchText) {
        const matchesReference = containsSearchTerm(app.operator_ref, searchText);
        const matchesStatus = containsSearchTerm(app.status, searchText);
        
        if (!matchesReference && !matchesStatus) {
          return false;
        }
      }

      return true;
    });
  }, [applications, statusFilter, dateFilter, searchText]);

  const clearFilters = () => {
    setStatusFilter('');
    setDateFilter('');
    setSearchText('');
  };

  return {
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    searchText,
    setSearchText,
    filteredApplications,
    clearFilters,
  };
};
