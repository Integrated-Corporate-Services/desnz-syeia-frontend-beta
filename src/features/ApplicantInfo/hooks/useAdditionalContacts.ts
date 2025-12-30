import { useState, useCallback } from "react";
import { isValidEmail, isDuplicateEmail } from "../../../utils/validation";
import { FORM_ERRORS } from "../constants/networkOperatorDetails";

interface UseAdditionalContactsReturn {
  additionalContacts: string[];
  emailAddress: string;
  emailInputError: string | null;
  setEmailAddress: (email: string) => void;
  handleAddContact: (e: React.FormEvent) => void;
  handleDeleteContact: (email: string) => void;
  setAdditionalContacts: React.Dispatch<React.SetStateAction<string[]>>;
  clearEmailInputError: () => void;
}

/**
 * Custom hook to manage additional email contacts
 */
export const useAdditionalContacts = (): UseAdditionalContactsReturn => {
  const [additionalContacts, setAdditionalContacts] = useState<string[]>([]);
  const [emailAddress, setEmailAddress] = useState("");
  const [emailInputError, setEmailInputError] = useState<string | null>(null);

  const handleAddContact = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const email = emailAddress.trim();

      if (!email) {
        return;
      }

      if (!isValidEmail(email)) {
        setEmailInputError(FORM_ERRORS.INVALID_EMAIL);
        return;
      }

      if (isDuplicateEmail(email, additionalContacts)) {
        setEmailInputError(FORM_ERRORS.DUPLICATE_EMAIL);
        return;
      }

      setAdditionalContacts((prev) => [...prev, email]);
      setEmailAddress("");
      setEmailInputError(null);
    },
    [emailAddress, additionalContacts]
  );

  const handleDeleteContact = useCallback((email: string) => {
    setAdditionalContacts((prev) => prev.filter((e) => e !== email));
  }, []);

  const clearEmailInputError = useCallback(() => {
    setEmailInputError(null);
  }, []);

  return {
    additionalContacts,
    emailAddress,
    emailInputError,
    setEmailAddress,
    handleAddContact,
    handleDeleteContact,
    setAdditionalContacts,
    clearEmailInputError,
  };
};
