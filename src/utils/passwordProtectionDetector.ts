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
    // Check first 2048 bytes for encryption markers (PDF structure is at the beginning)
    const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 2048));
    const hex = uint8ArrayToHex(uint8Array.slice(0, 512));
    
    // PDF files have encryption markers in their structure (not in content)
    // Look for /Encrypt dictionary which indicates file-level encryption
    const hasEncryptMarker = pdfHeader.includes(PASSWORD_PROTECTION_SIGNATURES.PDF.ENCRYPT_MARKER);
    const hasHexMarker = hex.includes(PASSWORD_PROTECTION_SIGNATURES.PDF.HEX_MARKER);
    
    const isProtected = hasEncryptMarker || hasHexMarker;
    
    logValidationEvent('PDF password check', filename, { 
      isProtected,
      hasEncryptMarker,
      hasHexMarker
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
    const hex = uint8ArrayToHex(uint8Array.slice(0, 16)); // Only check first 16 bytes for header
    const { OFFICE_XML, OFFICE_LEGACY } = PASSWORD_PROTECTION_SIGNATURES;
    
    // Debug: Log the hex content for inspection
    logger.info('Checking Office XML password protection', {
      filename,
      hexPreview: hex
    });
    
    // Check file header only - the FIRST BYTES determine file structure
    // Normal .docx/.xlsx files: Start with ZIP header (504b0304)
    // Encrypted .docx/.xlsx files: Start with OLE header (d0cf11e0a1b11ae1)
    const isZipFile = hex.startsWith(OFFICE_XML.ZIP_HEADER);
    const hasOleHeader = hex.startsWith(OFFICE_LEGACY.OLE_HEADER);
    
    // ONLY use file header to determine encryption status
    // This prevents false positives from document content containing keywords like
    // "Protected", "Official", "Encrypted", etc.
    const isProtected = !isZipFile && hasOleHeader;
    
    logValidationEvent('Office XML password check', filename, {
      isProtected,
      isZipFile,
      hasOleHeader,
      headerHex: hex,
      reason: isProtected ? 'OLE header detected (file-level encryption)' : 'ZIP header detected (no file-level encryption)'
    });
    
    return isProtected;
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
    const headerHex = uint8ArrayToHex(uint8Array.slice(0, 16)); // Check first 16 bytes for header
    const contentHex = uint8ArrayToHex(uint8Array.slice(0, 512)); // Check first 512 bytes for encryption markers
    const { OFFICE_LEGACY } = PASSWORD_PROTECTION_SIGNATURES;
    
    // Legacy Office files (.doc, .xls) must have OLE header
    const hasOleHeader = headerHex.startsWith(OFFICE_LEGACY.OLE_HEADER);
    
    if (!hasOleHeader) {
      logger.info('Not an OLE file - no Legacy Office encryption', { filename });
      return false;
    }
    
    // For OLE files, check for encryption markers in early content
    const hasEncryption = contentHex.includes(OFFICE_LEGACY.ENCRYPTED_OBJECT) || 
                         contentHex.includes(OFFICE_LEGACY.MS_OFFICE_WRITE) ||
                         contentHex.includes(OFFICE_LEGACY.ENCRYPTION_INFO);
    
    const isProtected = hasEncryption;
    
    logValidationEvent('Office Legacy password check', filename, {
      isProtected,
      hasOleHeader,
      hasEncryptedObject: contentHex.includes(OFFICE_LEGACY.ENCRYPTED_OBJECT),
      hasMsOfficeWrite: contentHex.includes(OFFICE_LEGACY.MS_OFFICE_WRITE),
      hasEncryptionInfo: contentHex.includes(OFFICE_LEGACY.ENCRYPTION_INFO)
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
    
    // Read more bytes for PDFs to ensure we capture encryption info
    const bytesToRead = file.type === 'application/pdf' ? 2048 : 1024;
    const uint8Array = await readFileHeader(file, bytesToRead);
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