import { buildBackendUrl } from "../utils/apiConfig";
import { createLogger } from "../utils/logger";
import type { User, CreateUserData } from "../types/user";
import type { ServiceResponse } from "../types/common";

const logger = createLogger("userService");

class UserService {
  /**
   * Get users for an organization (or all if admin)
   */
  async getUsers(
    orgFilter: string | null = null
  ): Promise<ServiceResponse<User[]>> {
    try {
      const params = new URLSearchParams();
      if (orgFilter) {
        params.append("organisation", orgFilter);
      }
      const url = buildBackendUrl(`/api/users${
        params.toString() ? `?${params.toString()}` : ""
      }`);
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      // Transform backend response to match frontend User interface
      const transformedData = data.map((user: any) => ({
        id: user.user_id,
        fullName:
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          "Unknown",
        email: user.email,
        organisation: user.organisation_name || "",
        role: user.role,
        status: user.status,
        lastLogin: user.last_login_at,
        agencyName: user.agency_name || null,
      }));
      return {
        success: true,
        data: transformedData,
      };
    } catch (error) {
      logger.error("Failed to fetch users:", error);
      return {
        success: false,
        message: "Failed to fetch users",
      };
    }
  }

  /**
   * Create a new user manually
   */
  async createUser(userData: CreateUserData): Promise<ServiceResponse<User>> {
    try {
      const response = await fetch(buildBackendUrl("/api/users"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return {
        success: true,
        data,
        message: "User created successfully",
      };
    } catch (error) {
      logger.error("Failed to create user:", error);
      return {
        success: false,
        message: "Failed to create user",
      };
    }
  }

  /**
   * Suspend/revoke user access
   */
  async suspendUser(
    userId: string,
    reason: string,
    organisationId?: string
  ): Promise<ServiceResponse<void>> {
    try {
      logger.debug("Suspending user:", { userId, reason, organisationId });
      const requestBody: { reason: string; organisationId?: string } = { reason };
      if (organisationId) {
        requestBody.organisationId = organisationId;
      }
      const response = await fetch(buildBackendUrl(`/api/users/${userId}/suspend`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error("Failed to suspend user:", {
          error: errorData.error,
          status: response.status,
        });
        return {
          success: false,
          message: errorData.error || "Failed to suspend user",
        };
      }
      const data = await response.json();
      logger.debug("Suspend user response:", data);
      return {
        success: true,
        message: "User access revoked successfully",
      };
    } catch (error: any) {
      logger.error("Failed to suspend user:", {
        error: error.message,
      });
      return {
        success: false,
        message: "Failed to suspend user",
      };
    }
  }

  /**
   * Reactivate user
   */
  async reactivateUser(userId: string): Promise<ServiceResponse<void>> {
    try {
      const response = await fetch(buildBackendUrl(`/api/users/${userId}/reactivate`), {
        method: "PATCH",
        credentials: "include"
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return {
        success: true,
        message: "User reactivated successfully",
      };
    } catch (error) {
      logger.error("Failed to reactivate user:", error);
      return {
        success: false,
        message: "Failed to reactivate user",
      };
    }
  }
}

export default new UserService();
