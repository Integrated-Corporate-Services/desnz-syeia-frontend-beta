/**
 * URL pattern to metadata mapping for feedback source tracking.
 * Maps URL patterns to application types and categories based on routes.ts.
 */

export interface UrlMetadata {
  applicationType: string;  // Application type: "S37", "NWL", "TLP", or "Common"
  category: string;         // High-level category grouping (task list section names)
}

/**
 * Categorizes URLs based on path patterns.
 * Order matters - most specific patterns should come first.
 * 
 * @param pathname - The URL pathname to categorize
 * @returns Metadata containing applicationType and category
 */
export function categorizeUrl(pathname: string): UrlMetadata {
  // Normalize path: remove leading/trailing slashes and convert to lowercase
  const path = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const COMMON_APP_TYPE = 'Common';
  const S37_APP_TYPE = 'S37';
  const NWL_APP_TYPE = 'NWL';
  const TLP_APP_TYPE = 'TLP';
  // Determine application type once for reuse
  const appType = path.includes('/s-37/') ? S37_APP_TYPE
                : path.includes('/nwl/') ? NWL_APP_TYPE
                : path.includes('/tlp/') ? TLP_APP_TYPE
                : COMMON_APP_TYPE;

  // ── Feedback Module ─────────────────────────────────────────────────────────
  if (path.includes('feedback')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Feedback' };
  }

  // ── Site Settings & Static Pages ────────────────────────────────────────────
  if (path.includes('cookie')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Site Settings' };
  }
  if (path.includes('privacy')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Site Settings' };
  }
  if (path.includes('terms')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Site Settings' };
  }
  if (path.includes('accessibility')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Site Settings' };
  }
  if (path.includes('help')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Site Settings' };
  }
  if (path.includes('contact')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Site Settings' };
  }
  if (path.includes('signed-out')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Authentication' };
  }

  // ── Administration ──────────────────────────────────────────────────────────
  if (path.includes('admin/user-management') || path.includes('admin/manage-user')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Administration' };
  }
  if (path.includes('admin/review-request')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Administration' };
  }
  if (path.includes('admin/add-user')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Administration' };
  }
  if (path.includes('admin/user-created')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Administration' };
  }
  if (path.includes('admin/revoke-user')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Administration' };
  }
  if (path.includes('admin/access-approved')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Administration' };
  }
  if (path.includes('admin/access-denied')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Administration' };
  }
  if (path.includes('admin/access-revoked')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Administration' };
  }
  if (path.includes('admin/organisation') || path.includes('admin/team-coordinator') || path.includes('admin/approved-domain')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Administration' };
  }
  if (path.startsWith('frontend/admin') || path.startsWith('admin/')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Administration' };
  }

  // ── Access Request / Onboarding ─────────────────────────────────────────────
  if (path.includes('request-access')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Onboarding' };
  }
  if (path.includes('otp-verify')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Authentication' };
  }

  // ── Payment (Common - shared across all application types) ─────────────────
  if (path.includes('payment-success')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Pay and submit' };
  }
  if (path.includes('payment-callback')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Pay and submit' };
  }
  if (path.includes('payment-method')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Pay and submit' };
  }
  if (path.includes('payment')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Pay and submit' };
  }
  if (path.includes('bank-transfer-success')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Pay and submit' };
  }
  if (path.includes('bank-transfer-confirmation')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Pay and submit' };
  }
  if (path.includes('bank-transfer')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Pay and submit' };
  }
  if (path.includes('invoice-download')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Pay and submit' };
  }
  if (path.includes('generate-invoice')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Pay and submit' };
  }
  if (path.includes('invoice')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Pay and submit' };
  }

  // ── Post-Consultation (using appType to detect S37/NWL/TLP) ─────────────────
  if (path.includes('post-consultation')) {
    return { applicationType: appType, category: 'Consultations' };
  }

  // ── Consultation (must come after post-consultation, using appType) ─────────
  if (path.includes('consultation')) {
    return { applicationType: appType, category: 'Consultations' };
  }

  // ── Section 37 Application (MUST come before generic checks) ────────────────
  if (path.startsWith('frontend/s-37') || path.startsWith('s-37/')) {
    // 1. Applicant details
    if (path.includes('network-operator-contact') || path.includes('network-operator-details') || path.includes('who-is-applying')) {
      return { applicationType: S37_APP_TYPE, category: 'Applicant details' };
    }
    
    // 2. Project details
    if (path.includes('works-overview') || path.includes('project-overview') || path.includes('asset-information') || path.includes('/assets')) {
      return { applicationType: S37_APP_TYPE, category: 'Project details' };
    }
    
    // 3. Location
    if (path.includes('route') || path.includes('sensitive-area') || path.includes('parishes')) {
      return { applicationType: S37_APP_TYPE, category: 'Location' };
    }
    
    // 4. Supporting information
    if (path.includes('supporting-info') || path.includes('eia-fees')) {
      return { applicationType: S37_APP_TYPE, category: 'Supporting information' };
    }
    
    // 6. Pay and submit
    if (path.includes('check-your-answers') || path.includes('application-summary') || path.includes('pay-and-submit') || path.includes('application-submitted')) {
      return { applicationType: S37_APP_TYPE, category: 'Pay and submit' };
    }
    
    // Application management
    if (path.includes('withdraw') || path.includes('delete')) {
      return { applicationType: S37_APP_TYPE, category: 'Application Management' };
    }
    
    // Task list
    if (path.includes('task-list')) {
      return { applicationType: S37_APP_TYPE, category: 'Application' };
    }
    
    // Generic S37 fallback
    return { applicationType: S37_APP_TYPE, category: 'Application' };
  }

  // ── NWL Application ─────────────────────────────────────────────────────────
  if (path.startsWith('frontend/nwl') || path.startsWith('nwl/')) {
    return { applicationType: NWL_APP_TYPE, category: 'Application' };
  }

  // ── TLP Application ─────────────────────────────────────────────────────────
  if (path.startsWith('frontend/tlp') || path.startsWith('tlp/')) {
    return { applicationType: TLP_APP_TYPE, category: 'Application' };
  }

  // ── Workbasket / Dashboard ──────────────────────────────────────────────────
  if (path.includes('workbasket') || path === 'frontend' || path === '') {
    return { applicationType: COMMON_APP_TYPE, category: 'Dashboard' };
  }

  // ── Landing / Guidance Pages ────────────────────────────────────────────────
  if (path === 'landingpage' || path === 'frontend/landingpage') {
    return { applicationType: COMMON_APP_TYPE, category: 'Public' };
  }
  if (path.includes('s37-guidance')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Public' };
  }
  if (path.includes('nwl-guidance')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Public' };
  }
  if (path.includes('choose-application')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Public' };
  }

  // ── Default Fallback ────────────────────────────────────────────────────────
  return { applicationType: COMMON_APP_TYPE, category: 'Other' };
}
