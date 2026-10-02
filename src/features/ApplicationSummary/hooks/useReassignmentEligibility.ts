import { useEffect, useState } from 'react';
import { applicationApiService } from '../../../services/applicationApiService';
import { hasReassignmentRole, isReassignmentTerminal } from '../constants/reassignment';

export function useReassignmentEligibility(
    applicationId: string,
    status: string | null,
    role: string | undefined
) {
    const allowed = hasReassignmentRole(role) && !isReassignmentTerminal(status);
    const [authorizedApplicationId, setAuthorizedApplicationId] = useState<string | null>(null);
    useEffect(() => {
        let active = true;
        setAuthorizedApplicationId(null);
        if (!allowed) return;
        applicationApiService
            .getEligibleAssignees(applicationId)
            .then(() => {
                if (active) setAuthorizedApplicationId(applicationId);
            })
            .catch(() => {
                if (active) setAuthorizedApplicationId(null);
            });
        return () => {
            active = false;
        };
    }, [applicationId, allowed]);
    return allowed && authorizedApplicationId === applicationId;
}
