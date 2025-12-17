import { useState, useEffect } from 'react';
import accessRequestAdminService from '../services/accessRequestAdminService';
import type { AccessRequest, DashboardStats } from '../types/accessRequest';

/**
 * Custom hook for managing dashboard data and pending requests
 * @param {string} userRole - Current user role
 * @returns {Object} Dashboard state and data
 */
export const useDashboard = (userRole: string) => {
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    pendingRequests: 0,
    activeUsers: 0,
    totalRequests: 0,
    approvedRequests: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Load all access requests
        const response = await accessRequestAdminService.getPendingRequests();
        
        // The service returns { success, data }
        const requests = response.success && response.data ? response.data : [];
        
        if (requests && Array.isArray(requests)) {
          // Filter for pending requests
          const pending = requests.filter(req => req.status === 'PENDING');
          setPendingRequests(pending);
          
          // Calculate stats from all the data
          const approved = requests.filter(req => req.status === 'APPROVED').length;
          const rejected = requests.filter(req => req.status === 'REJECTED').length;
          
          setStats({
            pendingRequests: pending.length,
            activeUsers: approved, // Approved requests become active users
            totalRequests: requests.length,
            approvedRequests: approved
          });
        } else {
          setPendingRequests([]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data');
        setPendingRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userRole]);

  // Get recent requests (sorted by date, limited to 5)
  const recentRequests = pendingRequests
    .sort((a, b) => {
      const dateA = new Date(a.requested_at || 0).getTime();
      const dateB = new Date(b.requested_at || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  // Get stats value with fallback
  const getStatValue = (key: keyof DashboardStats, fallback: number = 0): number => {
    return stats[key] || fallback;
  };

  return {
    pendingRequests,
    recentRequests,
    loading,
    error,
    getStatValue,
    stats
  };
};
