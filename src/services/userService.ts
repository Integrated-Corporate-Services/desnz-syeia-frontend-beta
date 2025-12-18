import axios from 'axios';
import { createLogger } from '../utils/logger';
import type { User, CreateUserData } from '../types/user';
import type { ServiceResponse } from '../types/common';

const logger = createLogger('userService');

class UserService {
  /**
   * Get users for an organization (or all if admin)
   */
  async getUsers(orgFilter: string | null = null): Promise<ServiceResponse<User[]>> {
    try {
      const params = new URLSearchParams();
      if (orgFilter) {
        params.append('organisation', orgFilter);
      }
      const url = `/backend/api/users${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axios.get(url);
      // Transform backend response to match frontend User interface
      const transformedData = response.data.map((user: any) => ({
        id: user.user_id,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
        email: user.email,
        organisation: user.organisation_name || '',
        role: user.role,
        status: user.status,
        lastLogin: user.last_login_at
      }));
      return {
        success: true,
        data: transformedData
      };
    } catch (error) {
      logger.error('Failed to fetch users:', error);
      return {
        success: false,
        message: 'Failed to fetch users'
      };
    }
  }

  /**
   * Create a new user manually
   */
  async createUser(userData: CreateUserData): Promise<ServiceResponse<User>> {
    try {
      const response = await axios.post('/backend/api/users', userData);
      return {
        success: true,
        data: response.data,
        message: 'User created successfully'
      };
    } catch (error) {
      logger.error('Failed to create user:', error);
      return {
        success: false,
        message: 'Failed to create user'
      };
    }
  }

  /**
   * Suspend/revoke user access
   */
  async suspendUser(userId: string, reason: string): Promise<ServiceResponse<void>> {
    try {
      logger.debug('Suspending user:', { userId, reason });
      const response = await axios.patch(`/backend/api/users/${userId}/suspend`, { reason });
      logger.debug('Suspend user response:', response.data);
      return {
        success: true,
        message: 'User access revoked successfully'
      };
    } catch (error: any) {
      logger.error('Failed to suspend user:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to suspend user'
      };
    }
  }

  /**
   * Reactivate user
   */
  async reactivateUser(userId: string): Promise<ServiceResponse<void>> {
    try {
      await axios.patch(`/backend/api/users/${userId}/reactivate`);
      return {
        success: true,
        message: 'User reactivated successfully'
      };
    } catch (error) {
      logger.error('Failed to reactivate user:', error);
      return {
        success: false,
        message: 'Failed to reactivate user'
      };
    }
  }
}

export default new UserService();
