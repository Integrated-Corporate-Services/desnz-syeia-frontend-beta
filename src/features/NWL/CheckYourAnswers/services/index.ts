/**
 * Services for Check Your Answers feature
 *
 * Currently exports mock data service for development.
 * When backend is ready, switch to API service by changing the import below.
 */

// Export mock service by default (for development)
export { fetchCheckYourAnswersData } from './mockDataService';

// To use real API, comment the line above and uncomment this:
// export { fetchCheckYourAnswersData } from './apiService';
