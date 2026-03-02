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
export const DESNZ_ADMIN = 'DESNZ_ADMIN' as const;
export const DESNZ_CASEWORKER = 'DESNZ_CASEWORKER' as const;
export const APPLICANT_TEAM_COORDINATOR = 'APPLICANT_TEAM_COORDINATOR' as const;
export const APPLICANT_USER = 'APPLICANT_USER' as const;
export const APPLICANT_AGENT = 'APPLICANT_AGENT' as const;
export const APPLICANT_FINANCE = 'APPLICANT_FINANCE' as const;
export const BUSINESS_ADMIN = 'BUSINESS_ADMIN' as const;
export const TECH_ADMIN = 'TECH_ADMIN' as const;

export const ADMIN_ROLES = [
  DESNZ_ADMIN,
  BUSINESS_ADMIN,
  TECH_ADMIN,
  APPLICANT_TEAM_COORDINATOR,
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];
export const SUPERUSER = DESNZ_ADMIN;

export type UserRole = 
  | typeof APPLICANT
  | typeof NETWORK_OPERATOR
  | typeof CONTACT
  | typeof CONSULTANT
  | typeof REVIEWER
  | typeof DESNZ_ADMIN
  | typeof DESNZ_CASEWORKER
  | typeof APPLICANT_TEAM_COORDINATOR
  | typeof APPLICANT_USER
  | typeof APPLICANT_AGENT
  | typeof APPLICANT_FINANCE
  | typeof BUSINESS_ADMIN
  | typeof TECH_ADMIN
  | string; // Allow unknown roles

/**
 * Get default "Submitted by" value based on user role
 * AC2: Applicant/Agent/User/Finance → "me", Team Coordinator/Admin/Caseworker/Reviewer → "all"
 */
export const getDefaultSubmittedBy = (role?: UserRole): 'me' | 'all' => {
  if (!role) {
    log.warn('[getDefaultSubmittedBy] No role provided, defaulting to "me"');
    return 'me';
  }

  switch (role) {
    case APPLICANT_TEAM_COORDINATOR:
    case DESNZ_ADMIN:
    case DESNZ_CASEWORKER:
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
 * AC2: Agents should NOT see the filter
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
         role === DESNZ_ADMIN || 
         role === DESNZ_CASEWORKER ||
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
  DESNZ_ADMIN,
  DESNZ_CASEWORKER,
  APPLICANT_TEAM_COORDINATOR,
  APPLICANT_USER,
  APPLICANT_AGENT,
  APPLICANT_FINANCE,
  BUSINESS_ADMIN,
  TECH_ADMIN,
  ADMIN_ROLES,
  SUPERUSER,
};
