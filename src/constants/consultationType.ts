/**
 * Consultation Type Constants
 * Defines the valid consultation types in the system
 */

export const ConsultationType = {
  LPA: 'LPA',                    // Standard Local Planning Authority consultation
  OTHER: 'OTHER',                // Other consultee organizations
  OTHER_LPA: 'OTHER-LPA',        // Optional LPA consultations (follows LPA journey but treated as OTHER)
  PUBLIC: 'PUBLIC',              // Public notices
  SANCTUARY: 'SANCTUARY',        // Sanctuary consultations
  STATUTORY: 'STATUTORY'         // Statutory consultations
} as const;

export type ConsultationTypeValue = typeof ConsultationType[keyof typeof ConsultationType];

/**
 * Check if consultation type follows LPA journey
 * @param consultationType - The consultation type to check
 * @returns True if it follows LPA journey
 */
export const isLpaJourney = (consultationType: string): boolean => {
  return consultationType === ConsultationType.LPA || 
         consultationType === ConsultationType.OTHER_LPA;
};

/**
 * Check if consultation type is treated as OTHER for display
 * @param consultationType - The consultation type to check
 * @returns True if it should be displayed in OTHER consultations section
 */
export const isOtherConsultation = (consultationType: string): boolean => {
  return consultationType === ConsultationType.OTHER || 
         consultationType === ConsultationType.OTHER_LPA;
};
