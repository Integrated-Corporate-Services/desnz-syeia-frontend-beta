

import React from "react";
import { 
  getApplicationStatusConfig, 
  getApplicationStatusTagClass, 
  getApplicationStatusLabel 
} from "../../constants/status";
import { 
  getConsultationStatusConfig, 
  getConsultationStatusTagClass, 
  getConsultationStatusLabel 
} from "../../constants/consultationStatus";

/**
 * Props interface following Interface Segregation Principle
 */
interface StatusBadgeProps {
 
  status: string;
  className?: string;
  
  ariaLabel?: string;
 
  isConsultation?: boolean;
}


export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(
  ({ status, className = "", ariaLabel, isConsultation = false }) => {
    // Try consultation status first if isConsultation flag is set, otherwise try application status
    let config = isConsultation 
      ? getConsultationStatusConfig(status) 
      : getApplicationStatusConfig(status);
    
    // If not found, try the other type
    if (!config) {
      config = isConsultation 
        ? getApplicationStatusConfig(status)
        : getConsultationStatusConfig(status);
    }
    
    // Get display properties
    const displayText = config 
      ? config.label 
      : (isConsultation ? getConsultationStatusLabel(status) : getApplicationStatusLabel(status));
    
    const tagClass = config
      ? `govuk-tag govuk-tag--${config.color}`
      : (isConsultation ? getConsultationStatusTagClass(status) : getApplicationStatusTagClass(status));

    const combinedClassName = className 
      ? `${tagClass} govuk-!-font-size-18 ${className}`.trim()
      : `${tagClass} govuk-!-font-size-18`.trim();

    // Construct ARIA label for screen readers
    const ariaLabelText = ariaLabel || `Status: ${displayText}`;

    return (
      <strong
        className={combinedClassName}
        aria-label={ariaLabelText}
        role="status"
      >
        {displayText}
      </strong>
    );
  },
  // Memoization optimization - only re-render if props change
  (prevProps, nextProps) =>
    prevProps.status === nextProps.status &&
    prevProps.className === nextProps.className &&
    prevProps.ariaLabel === nextProps.ariaLabel &&
    prevProps.isConsultation === nextProps.isConsultation
);

// Display name for React DevTools
StatusBadge.displayName = "StatusBadge";
