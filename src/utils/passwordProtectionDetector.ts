/**
 * Password Protection Detection Utility
 * Detects if files are password protected by examining file headers
 */

import { PASSWORD_PROTECTION_SIGNATURES } from './fileValidationConstants';
import { readFileHeader, uint8ArrayToHex, logValidationEvent } from './fileValidationUtils';
import { createLogger } from './logger';

const logger = createLogger('passwordProtectionDetector');

/**
 * Checks if PDF file is password protected
 * @param uint8Array - File header data
 * @param filename - Name of the file
 * @returns True if password protected
 */
const isPdfPasswordProtected = (uint8Array: Uint8Array, filename: string): boolean => {
  try {
    const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 20));
    const hex = uint8ArrayToHex(uint8Array.slice(0, 100));
    
    const isProtected = pdfHeader.includes(PASSWORD_PROTECTION_SIGNATURES.PDF.ENCRYPT_MARKER) || 
                       hex.includes(PASSWORD_PROTECTION_SIGNATURES.PDF.HEX_MARKER);
    
    logValidationEvent('PDF password check', filename, { 
      isProtected,
      hasEncryptMarker: pdfHeader.includes(PASSWORD_PROTECTION_SIGNATURES.PDF.ENCRYPT_MARKER),
      hasHexMarker: hex.includes(PASSWORD_PROTECTION_SIGNATURES.PDF.HEX_MARKER)
    });
    
    return isProtected;
  } catch (error) {
    logger.warn('Error checking PDF password protection', { filename, error });
    return false;
  }
};

/**
 * Checks if Office XML document (.docx, .xlsx) is password protected
 * @param uint8Array - File header data
 * @param filename - Name of the file
 * @returns True if password protected
 */
const isOfficeXmlPasswordProtected = (uint8Array: Uint8Array, filename: string): boolean => {
  try {
    const hex = uint8ArrayToHex(uint8Array.slice(0, 100));
    const { OFFICE_XML } = PASSWORD_PROTECTION_SIGNATURES;
    
    // Debug: Log the hex content for inspection
    logger.info('Checking Office XML password protection', {
      filename,
      hexPreview: hex.substring(0, 100),
      fullHex: hex
    });
    
    const isProtected = hex.includes(OFFICE_XML.ENCRYPTED_KEY) ||
                       hex.includes(OFFICE_XML.ENCRYPTED_PACKAGE) ||
                       hex.includes(OFFICE_XML.MS_CONTAINER);
    
    // Enhanced detection for modern Office formats
    const hasEncryptionIndicators = hex.includes('456e6372797074') || // "Encrypt"
                                   hex.includes('50617373776f7264') || // "Password"  
                                   hex.includes('4d6963726f736f6674') || // "Microsoft"
                                   hex.includes('0000000000000000') ||  // Common encrypted pattern
                                   hex.includes('d0cf11e0') ||          // OLE header that might indicate encryption
                                   uint8Array.length < 50;              // Very small files might be encrypted
    
    const finalResult = isProtected || hasEncryptionIndicators;
    
    logValidationEvent('Office XML password check', filename, {
      isProtected: finalResult,
      hasEncryptedKey: hex.includes(OFFICE_XML.ENCRYPTED_KEY),
      hasEncryptedPackage: hex.includes(OFFICE_XML.ENCRYPTED_PACKAGE),
      hasMsContainer: hex.includes(OFFICE_XML.MS_CONTAINER),
      hasEncryptionIndicators,
      hexLength: hex.length,
      uint8ArrayLength: uint8Array.length
    });
    
    return finalResult;
  } catch (error) {
    logger.warn('Error checking Office XML password protection', { filename, error });
    return false;
  }
};

/**
 * Checks if legacy Office document (.doc, .xls) is password protected
 * @param uint8Array - File header data
 * @param filename - Name of the file
 * @returns True if password protected
 */
const isOfficeLegacyPasswordProtected = (uint8Array: Uint8Array, filename: string): boolean => {
  try {
    const hex = uint8ArrayToHex(uint8Array.slice(0, 100));
    const { OFFICE_LEGACY } = PASSWORD_PROTECTION_SIGNATURES;
    
    const hasOleHeader = hex.startsWith(OFFICE_LEGACY.OLE_HEADER);
    const hasEncryption = hex.includes(OFFICE_LEGACY.ENCRYPTED_OBJECT) || 
                         hex.includes(OFFICE_LEGACY.MS_OFFICE_WRITE);
    
    const isProtected = hasOleHeader && hasEncryption;
    
    logValidationEvent('Office Legacy password check', filename, {
      isProtected,
      hasOleHeader,
      hasEncryptedObject: hex.includes(OFFICE_LEGACY.ENCRYPTED_OBJECT),
      hasMsOfficeWrite: hex.includes(OFFICE_LEGACY.MS_OFFICE_WRITE)
    });
    
    return isProtected;
  } catch (error) {
    logger.warn('Error checking Office Legacy password protection', { filename, error });
    return false;
  }
};

/**
 * Detects if a file is password protected by examining file headers
 * @param file - File to check for password protection
 * @returns Promise resolving to true if password protected
 */
export const isPasswordProtected = async (file: File): Promise<boolean> => {
  try {
    logValidationEvent('password protection check started', file.name, { 
      size: file.size,
      type: file.type 
    });
    
    const uint8Array = await readFileHeader(file, 1024);
    const filename = file.name.toLowerCase();
    
    // Check PDF files
    if (file.type === 'application/pdf') {
      return isPdfPasswordProtected(uint8Array, file.name);
    }
    
    // Check Office XML documents
    if (filename.endsWith('.docx') || filename.endsWith('.xlsx')) {
      return isOfficeXmlPasswordProtected(uint8Array, file.name);
    }
    
    // Check legacy Office documents
    if (filename.endsWith('.doc') || filename.endsWith('.xls')) {
      return isOfficeLegacyPasswordProtected(uint8Array, file.name);
    }
    
    // File type not supported for password protection check
    logValidationEvent('password protection check skipped', file.name, { 
      reason: 'Unsupported file type for password protection detection'
    });
    
    return false;
    
  } catch (error) {
    logger.error('Password protection check failed', { 
      filename: file.name,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Return false on error to allow upload (password check failure shouldn't block valid files)
    return false;
  }
};

/**
 * Batch check multiple files for password protection
 * @param files - Array of files to check
 * @returns Promise resolving to array of results with filename and isProtected status
 */
export const checkMultipleFilesPasswordProtection = async (
  files: File[]
): Promise<Array<{ filename: string; isProtected: boolean; error?: string }>> => {
  const results = await Promise.allSettled(
    files.map(async (file) => {
      const isProtected = await isPasswordProtected(file);
      return { filename: file.name, isProtected };
    })
  );
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      const filename = files[index].name;
      const error = result.reason instanceof Error ? result.reason.message : String(result.reason);
      logger.error('Batch password protection check failed', { filename, error });
      return { filename, isProtected: false, error };
    }
  });
};