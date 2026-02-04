import { useState } from "react";
import {
  searchCompanies,
  getCompanyDetails,
} from "../services/companiesHouseApi";
import { CompanySearchResult, CompanyDetails } from "../types/companiesHouse";

interface CompanySearchState {
  searchQuery: string;
  results: CompanySearchResult[];
  selectedCompany: CompanyDetails | null;
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

interface CompanySearchActions {
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;
  fetchCompanyDetails: (companyNumber: string) => Promise<void>;
  clearSelectedCompany: () => void;
}

interface UseCompanySearchReturn {
  state: CompanySearchState;
  actions: CompanySearchActions;
}

/**
 * Custom hook to manage company search state and operations
 * Separates logic from presentation components
 */
export const useCompanySearch = (): UseCompanySearchReturn => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  /**
   * Execute search against the API
   * @param {string} query - Search query
   */
  const performSearch = async (query: string) => {
    // Prevent concurrent searches
    if (isLoading) return;

    if (!query || !query.trim()) {
      setError("Enter a company name");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setSelectedCompany(null);

    try {
      const data = await searchCompanies(query);
      setResults(data.items || []);
      if (!data.items || data.items.length === 0) {
        // No error, just empty results, handled by UI state
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to search companies";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch company details
   * @param {string} companyNumber - Company registration number
   */
  const fetchCompanyDetails = async (companyNumber: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const details = await getCompanyDetails(companyNumber);
      setSelectedCompany(details);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch company details";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelectedCompany = () => {
    setSelectedCompany(null);
  };

  return {
    state: {
      searchQuery,
      results,
      selectedCompany,
      isLoading,
      error,
      hasSearched,
    },
    actions: {
      setSearchQuery,
      performSearch,
      fetchCompanyDetails,
      clearSelectedCompany,
    },
  };
};
