import { useState, useCallback } from "react";
import { Parish } from "../types/Parish";
import { parishApiService } from "../services/parishApiService";
import { PARISH_VALIDATION } from "../constants/parishConstants";

export const useParishSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Parish[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = useCallback(async (value: string) => {
    setSearchTerm(value);

    if (value.length >= PARISH_VALIDATION.MIN_SEARCH_LENGTH) {
      setIsSearching(true);
      try {
        const results = await parishApiService.searchParishes(value);
        setSearchResults(results);
      } catch (error) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setSearchResults([]);
  }, []);

  return {
    searchTerm,
    searchResults,
    isSearching,
    handleSearchChange,
    clearSearch,
  };
};
