import { useState, useEffect } from "react";
import { networkOperatorApiService } from "../../../services/networkOperatorApiService";
import type { TeamCoordinator } from "../../../types/organisation";
import { createLogger } from "../../../utils/logger";

const logger = createLogger("useRoleBasedNetworkOperators");

/**
 * Custom hook to fetch role-based network operators for dropdown
 * Uses the updated /api/network-operators endpoint that provides:
 * - Agents: Only team coordinators
 * - Employees: All employees + coordinators  
 * - Team Coordinators: Self + coordinators + employees
 */
export const useRoleBasedNetworkOperators = () => {
  const [coordinators, setCoordinators] = useState<TeamCoordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        setLoading(true);
        setError("");
        logger.debug("Fetching role-based network operators");

        // Use the updated network operators endpoint that provides role-based filtering
        const result = await networkOperatorApiService.getNetworkOperators();
        
        // Convert the network operator data to TeamCoordinator format for compatibility
        const mappedCoordinators: TeamCoordinator[] = result.map((op: any) => ({
          user_id: op.user_id,
          person_id: op.person_id,
          first_name: op.first_name,
          last_name: op.last_name,
          email: op.email,
          phone_number: op.phone_number,
          address_id: null, // Not provided in network operators response
          address_line1: op.address_line1,
          address_line2: op.address_line2,
          town_city: op.town_city,
          postcode: op.postcode,
          organisation_id: op.organisation_id,
          organisation_name: op.organisation_name,
          role: op.role,
          status: op.status || 'ACTIVE',
        }));
        
        logger.debug("Network operators fetched successfully", {
          count: mappedCoordinators.length,
        });
        setCoordinators(mappedCoordinators);
      } catch (err: any) {
        const errorMsg =
          err.message || "An error occurred while fetching network operators";
        logger.error("Error fetching network operators", { error: errorMsg });
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchOperators();
  }, []);

  return { coordinators, loading, error };
};