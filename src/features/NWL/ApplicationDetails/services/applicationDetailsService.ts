/**
 * Service for Application Details API calls
 * Following the pattern from objectorDetailsService.ts
 */

export interface ApplicationDetailsData {
  type_of_use?: string;
  wayleave_offer_date?: string;
  grounds_for_application?: string;
  wayleave_type?: string;
  wayleave_expiry_date?: string;
  notice_to_remove_date?: string;
  is_notice_to_remove_clear?: boolean;
  notice_to_remove_unclear_explanation?: string;
  is_within_three_months?: boolean;
  application_outside_timeframe_explanation?: string;
  is_standard_term?: boolean;
  standard_term_explanation?: string;
  notice_to_terminate_date?: string;
  termination_period_expired?: boolean;
}

/**
 * Save application details data
 * @param applicationId - The application ID
 * @param data - Application details data to save
 */
export const saveApplicationDetails = async (
  applicationId: string,
  data: Partial<ApplicationDetailsData>
): Promise<void> => {
  // TODO: Implement API call when backend is ready
  // const response = await fetch(`/api/applications/${applicationId}/details`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // if (!response.ok) throw new Error('Failed to save application details');
  console.log('Saving application details:', { applicationId, data });
};

/**
 * Fetch application details data
 * @param applicationId - The application ID
 */
export const fetchApplicationDetails = async (
  applicationId: string
): Promise<ApplicationDetailsData> => {
  // TODO: Implement API call when backend is ready
  // const response = await fetch(`/api/applications/${applicationId}/details`);
  // if (!response.ok) throw new Error('Failed to fetch application details');
  // return response.json();
  console.log('Fetching application details:', applicationId);
  return {};
};

/**
 * Validate date input
 */
export const validateDate = (day: string, month: string, year: string): boolean => {
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (
    isNaN(dayNum) ||
    isNaN(monthNum) ||
    isNaN(yearNum) ||
    dayNum < 1 ||
    dayNum > 31 ||
    monthNum < 1 ||
    monthNum > 12 ||
    yearNum < 1900 ||
    yearNum > 2100
  ) {
    return false;
  }

  const date = new Date(yearNum, monthNum - 1, dayNum);
  return (
    date.getFullYear() === yearNum &&
    date.getMonth() === monthNum - 1 &&
    date.getDate() === dayNum
  );
};

/**
 * Format date for API
 */
export const formatDateForAPI = (day: string, month: string, year: string): string => {
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/**
 * Parse date from API format
 */
export const parseDateFromAPI = (
  dateString: string
): { day: string; month: string; year: string } | null => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  return {
    day: date.getDate().toString(),
    month: (date.getMonth() + 1).toString(),
    year: date.getFullYear().toString(),
  };
};
