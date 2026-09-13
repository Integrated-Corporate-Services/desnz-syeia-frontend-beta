/*
 * Role-Based Utilities
 * Provides role-specific default values and visibility logic
 * for application features.
 */

import type { AuthUser } from "../types/auth";
import log from '../logger';

export const APPLICANT = 'Applicant' as const;
export const NETWORK_OPERATOR = 'Network operator' as const;
export const CONTACT = 'Contact' as const;
export const CONSULTANT = 'Consultant' as const;
export const REVIEWER = 'Reviewer' as const;
export const SUPERUSER = 'SUPERUSER' as const;
export const APPLICANT_TEAM_COORDINATOR = 'APPLICANT_TEAM_COORDINATOR' as const;
export const APPLICANT_USER = 'APPLICANT_USER' as const;
export const APPLICANT_AGENT = 'APPLICANT_AGENT' as const;
export const APPLICANT_FINANCE = 'APPLICANT_FINANCE' as const;
export const BUSINESS_ADMIN = 'BUSINESS_ADMIN' as const;
export const TECH_ADMIN = 'TECH_ADMIN' as const;

export const ADMIN_ROLES = [
  SUPERUSER,
  BUSINESS_ADMIN,
  TECH_ADMIN,
  APPLICANT_TEAM_COORDINATOR,
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export type UserRole = 
  | typeof APPLICANT
  | typeof NETWORK_OPERATOR
  | typeof CONTACT
  | typeof CONSULTANT
  | typeof REVIEWER
  | typeof SUPERUSER
  | typeof APPLICANT_TEAM_COORDINATOR
  | typeof APPLICANT_USER
  | typeof APPLICANT_AGENT
  | typeof APPLICANT_FINANCE
  | typeof BUSINESS_ADMIN
  | typeof TECH_ADMIN
  | string; // Allow unknown roles

/**
 * Get default "Submitted by" value based on user role
 * Applicant/Agent/User/Finance → "me", Team Coordinator/Admin/Caseworker/Reviewer → "all"
 */
export const getDefaultSubmittedBy = (role?: UserRole): 'me' | 'all' => {
  if (!role) {
    log.warn('[getDefaultSubmittedBy] No role provided, defaulting to "me"');
    return 'me';
  }

  switch (role) {
    case APPLICANT_TEAM_COORDINATOR:
    case SUPERUSER:
    case BUSINESS_ADMIN:
    case TECH_ADMIN:
    case REVIEWER:
      return 'all';
    
    case APPLICANT:
    case APPLICANT_USER:
    case APPLICANT_AGENT:
    case APPLICANT_FINANCE:
    case NETWORK_OPERATOR:
    case CONTACT:
    case CONSULTANT:
    default:
      return 'me';
  }
};

/**
 * Determine if "Submitted by" filter should be visible
 * Agents should NOT see the filter
 */
export const shouldShowSubmittedByFilter = (role?: UserRole): boolean => {
  if (!role) {
    return true; // Default to showing
  }

  return role !== APPLICANT_AGENT;
};

/**
 * Get user role from AuthUser object safely
 */
export const getUserRole = (user: AuthUser | null | undefined): UserRole | undefined => {
  return user?.role;
};

/**
 * Check if user has elevated permissions (coordinator/admin)
 */
export const hasElevatedPermissions = (role?: UserRole): boolean => {
  if (!role) return false;
  
  return role === APPLICANT_TEAM_COORDINATOR || 
         role === SUPERUSER || 
         role === BUSINESS_ADMIN || 
         role === TECH_ADMIN ||
         role === REVIEWER;
};


export default {
  APPLICANT,
  NETWORK_OPERATOR,
  CONTACT,
  CONSULTANT,
  REVIEWER,
  SUPERUSER,
  APPLICANT_TEAM_COORDINATOR,
  APPLICANT_USER,
  APPLICANT_AGENT,
  APPLICANT_FINANCE,
  BUSINESS_ADMIN,
  TECH_ADMIN,
  ADMIN_ROLES,
};
