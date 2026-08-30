export interface UrlMetadata {
  applicationType: string;
  category: string;
}

export function categorizeUrl(pathname: string): UrlMetadata {
  const path = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const COMMON_APP_TYPE = 'Common';
  const S37_APP_TYPE = 'S37';
  const NWL_APP_TYPE = 'NWL';
  const appType = path.includes('/s-37/') ? S37_APP_TYPE
                : path.includes('/nwl/') ? NWL_APP_TYPE
                : COMMON_APP_TYPE;

  if (path.includes('feedback')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Feedback' };
  }

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
  if (path.includes('contact')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Site Settings' };
  }
  if (path.includes('signed-out')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Authentication' };
  }

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

  if (path.includes('request-access')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Onboarding' };
  }
  if (path.includes('otp-verify')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Authentication' };
  }

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

  if (path.includes('post-consultation')) {
    return { applicationType: appType, category: 'Consultations' };
  }

  if (path.includes('consultation')) {
    return { applicationType: appType, category: 'Consultations' };
  }

  if (path.startsWith('s-37/') || path.startsWith('s-37')) {
    if (path.includes('network-operator-contact') || path.includes('network-operator-details') || path.includes('who-is-applying')) {
      return { applicationType: S37_APP_TYPE, category: 'Applicant details' };
    }
    
    if (path.includes('works-overview') || path.includes('project-overview') || path.includes('asset-information') || path.includes('/assets')) {
      return { applicationType: S37_APP_TYPE, category: 'Project details' };
    }
    
    if (path.includes('route') || path.includes('sensitive-area') || path.includes('parishes')) {
      return { applicationType: S37_APP_TYPE, category: 'Location' };
    }
    
    if (path.includes('supporting-info') || path.includes('eia-fees')) {
      return { applicationType: S37_APP_TYPE, category: 'Supporting information' };
    }
    
    if (path.includes('check-your-answers') || path.includes('application-summary') || path.includes('pay-and-submit') || path.includes('application-submitted')) {
      return { applicationType: S37_APP_TYPE, category: 'Pay and submit' };
    }
    
    if (path.includes('withdraw') || path.includes('delete')) {
      return { applicationType: S37_APP_TYPE, category: 'Application Management' };
    }
    
    if (path.includes('task-list')) {
      return { applicationType: S37_APP_TYPE, category: 'Application' };
    }
    
    return { applicationType: S37_APP_TYPE, category: 'Application' };
  }

  if (path.startsWith('nwl/') || path.startsWith('nwl')) {
    return { applicationType: NWL_APP_TYPE, category: 'Application' };
  }

  if (path.includes('application-dashboard') || path === '' || path.includes('application-dashboard')) {
    return { applicationType: COMMON_APP_TYPE, category: 'Dashboard' };
  }

  if (path === 'landingPage') {
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

  return { applicationType: COMMON_APP_TYPE, category: 'Other' };
}
