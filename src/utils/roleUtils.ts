/**
 * Role-Based Utilities
 * 
 * Provides role-specific default values and visibility logic
 * for application features.
 */

import type { AuthUser } from "../types/auth";

/**
 * User roles that can exist in the system
 */
export type UserRole = 
  | 'APPLICANT'
  | 'TEAM_COORDINATOR'
  | 'DESNZ_ADMIN'
  | 'AGENT'
  | string; // Allow unknown roles

/**
 * Get default "Submitted by" value based on user role
 * 
 * Business Rules (AC2):
 * - Applicant: "Me" (only see own applications)
 * - Agent: "Me" (only see own applications)
 * - Team Coordinator: "All users" (see team applications)
 * - Admin: "All users" (see organization applications)
 * 
 * @param {UserRole} role - User's role from auth context
 * @returns {'me' | 'all'} Default filter value
 * 
 * @example
 * getDefaultSubmittedBy('TEAM_COORDINATOR') // Returns: 'all'
 * getDefaultSubmittedBy('APPLICANT') // Returns: 'me'
 */
export const getDefaultSubmittedBy = (role?: UserRole): 'me' | 'all' => {
  if (!role) {
    console.warn('getDefaultSubmittedBy: No role provided, defaulting to "me"');
    return 'me';
  }

  const normalizedRole = role.toUpperCase();

  switch (normalizedRole) {
    case 'TEAM_COORDINATOR':
    case 'DESNZ_ADMIN':
      return 'all';
    
    case 'APPLICANT':
    case 'AGENT':
    default:
      return 'me';
  }
};

/**
 * Determine if "Submitted by" filter should be visible
 * 
 * Business Rules (AC2):
 * - Agents should NOT see the filter (always "me" enforced by backend)
 * - All other roles should see the filter
 * 
 * @param {UserRole} role - User's role from auth context
 * @returns {boolean} True if filter should be shown
 * 
 * @example
 * shouldShowSubmittedByFilter('AGENT') // Returns: false
 * shouldShowSubmittedByFilter('APPLICANT') // Returns: true
 */
export const shouldShowSubmittedByFilter = (role?: UserRole): boolean => {
  if (!role) {
    return true; // Default to showing
  }

  const normalizedRole = role.toUpperCase();
  return normalizedRole !== 'AGENT';
};

/**
 * Get user role from AuthUser object safely
 * 
 * @param {AuthUser | null} user - User from auth context
 * @returns {UserRole | undefined} User's role or undefined
 */
export const getUserRole = (user: AuthUser | null | undefined): UserRole | undefined => {
  return user?.role;
};

/**
 * Check if user has elevated permissions (coordinator/admin)
 * 
 * @param {UserRole} role - User's role
 * @returns {boolean} True if user is coordinator or admin
 */
export const hasElevatedPermissions = (role?: UserRole): boolean => {
  if (!role) return false;
  
  const normalizedRole = role.toUpperCase();
  return normalizedRole === 'TEAM_COORDINATOR' || normalizedRole === 'DESNZ_ADMIN';
};
