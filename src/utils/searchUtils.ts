/**
 * Check if a string contains a search term (case-insensitive)
 */
export const containsSearchTerm = (text: string | undefined, searchTerm: string): boolean => {
  if (!text) return false;
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};
