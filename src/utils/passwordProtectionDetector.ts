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
    // Check first 4096 bytes for encryption markers
    const bytesToCheck = Math.min(4096, uint8Array.length);
    const pdfHeader = String.fromCharCode(...uint8Array.slice(0, bytesToCheck));
    
   const hasEncryptDict = /\/Encrypt\s+\d+\s+\d+\s+R/.test(pdfHeader);
    
    // Fallback: Also check for /Encrypt followed by inline dictionary (less common)
    const hasInlineEncrypt = /\/Encrypt\s*<</.test(pdfHeader);
    
    // Additional generic check: /Filter /Standard is the standard encryption method
    const hasStandardFilter = /\/Filter\s*\/Standard/.test(pdfHeader);
    
    // Generic encryption object detection: Look for encryption version markers
    // /V (version) and /R (revision) are required in encryption dictionaries
    const hasEncryptionVersion = /\/V\s+\d+/.test(pdfHeader) && /\/R\s+\d+/.test(pdfHeader);
    
    // A PDF is password protected if it has any of these markers
    const isProtected = hasEncryptDict || hasInlineEncrypt || 
                       (hasStandardFilter && hasEncryptionVersion);
  
    
    logValidationEvent('PDF password check', filename, { 
      isProtected,
      hasEncryptDict,
      hasInlineEncrypt,
      hasStandardFilter,
      hasEncryptionVersion
    });
    
    return isProtected;
  } catch (error) {
    logger.warn('Error checking PDF password protection', { filename, error });
    return false;
  }
};

/**
 * Checks if Office XML document (.docx, .xlsx, .pptx, etc.) is password protected
 * Works regardless of file extension - detects based on file header structure
 * Password-protected Office XML files use OLE container instead of ZIP
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
    
    // CRITICAL FIX: Check file extension to avoid false positives
    // Legacy Office files (.xls, .doc, .ppt, .msg) ALWAYS have OLE headers (encrypted or not)
    // This function should ONLY detect encrypted MODERN Office files (.docx, .xlsx, .pptx)
    const lowerFilename = filename.toLowerCase();
    const isLegacyOfficeFile = lowerFilename.endsWith('.xls') || 
                               lowerFilename.endsWith('.doc') || 
                               lowerFilename.endsWith('.ppt') ||
                               lowerFilename.endsWith('.msg');
    
    // If it's a legacy Office file, DO NOT check it here - let isOfficeLegacyPasswordProtected handle it
    if (isLegacyOfficeFile) {
      logger.info('Skipping Office XML check - legacy Office file format', { filename });
      return false;
    }
    
    // For modern Office files (.docx, .xlsx, .pptx):
    // - Normal files: ZIP header (504b0304)
    // - Encrypted files: OLE header (d0cf11e0a1b11ae1)
    const isProtected = !isZipFile && hasOleHeader;
    
    logValidationEvent('Office XML password check', filename, {
      isProtected,
      isZipFile,
      hasOleHeader,
      isLegacyOfficeFile,
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
 * Checks if legacy Office document (.doc, .xls, .ppt, .msg, etc.) is password protected
 * Works regardless of file extension - detects based on OLE structure and streams
 * Handles Word, Excel, PowerPoint, and Outlook MSG files
 * @param uint8Array - File header data
 * @param filename - Name of the file
 * @returns True if password protected
 */
const isOfficeLegacyPasswordProtected = (uint8Array: Uint8Array, filename: string): boolean => {
  try {
    const headerHex = uint8ArrayToHex(uint8Array.slice(0, 32)); // Check first 32 bytes for header
    const contentHex = uint8ArrayToHex(uint8Array.slice(0, Math.min(4096, uint8Array.length))); 
    const { OFFICE_LEGACY } = PASSWORD_PROTECTION_SIGNATURES;
    
    // Legacy Office files (.doc, .xls) must have OLE header
    const hasOleHeader = headerHex.startsWith(OFFICE_LEGACY.OLE_HEADER);
    
    if (!hasOleHeader) {
      logger.info('Not an OLE file - no Legacy Office encryption', { filename });
      return false;
    }
    
    // For OLE files, check for encryption markers throughout the file structure
    const hasEncryptedObject = contentHex.includes(OFFICE_LEGACY.ENCRYPTED_OBJECT);
    const hasEncryptionInfo = contentHex.includes(OFFICE_LEGACY.ENCRYPTION_INFO);
    
    // CRITICAL FIX: Remove generic pattern checks that cause false positives
    // Only check for DEFINITIVE encryption stream names:
    // - "EncryptedObject" stream (ONLY in encrypted files)
    // - "EncryptionInfo" stream (ONLY in encrypted files)
    // 
    // REMOVED CHECKS (too generic, cause false positives):
    // - ENCRYPTION_HEADER: '01000000020000000300000004000000' (just sequential bytes 1,2,3,4 - can be any counter/index)
    // - RC4_CRYPTO_API: Can appear in file metadata or comments
    // - MS_OFFICE_WRITE: Unclear signature, not definitive
    
    // PRODUCTION FIX: Only flag as encrypted if we find EXPLICIT encryption stream names
    // Encrypted files ALWAYS have EncryptedObject or EncryptionInfo streams
    const hasExplicitEncryption = hasEncryptedObject || hasEncryptionInfo;
    
    // Additional verification: Check for Office document streams (for logging only, not decision)
    const hasWordDocument = contentHex.includes(OFFICE_LEGACY.WORD_DOCUMENT);
    const hasWorkbook = contentHex.includes(OFFICE_LEGACY.WORKBOOK);
    const hasPowerPointDocument = contentHex.includes(OFFICE_LEGACY.POWERPOINT_DOCUMENT);
    const hasCurrentUser = contentHex.includes(OFFICE_LEGACY.CURRENT_USER);
    const hasDocumentSummary = contentHex.includes(OFFICE_LEGACY.DOCUMENT_SUMMARY);
    const hasSummaryInfo = contentHex.includes(OFFICE_LEGACY.SUMMARY_INFO);
    const hasMsgProperties = contentHex.includes(OFFICE_LEGACY.MSG_PROPERTIES);
    const hasMsgNameId = contentHex.includes(OFFICE_LEGACY.MSG_NAMEID);
    const hasMsgRecipients = contentHex.includes(OFFICE_LEGACY.MSG_RECIPIENTS);
    const hasMsgAttachments = contentHex.includes(OFFICE_LEGACY.MSG_ATTACHMENTS);
    
    const hasOfficeStreams = hasWordDocument || hasWorkbook || hasPowerPointDocument || 
                            hasCurrentUser || hasDocumentSummary || hasSummaryInfo ||
                            hasMsgProperties || hasMsgNameId || hasMsgRecipients || hasMsgAttachments;
    
    // DEFENSIVE PROGRAMMING: Only flag as encrypted if explicit encryption markers found
    // This prevents false positives from files with streams located beyond first 4096 bytes
    const isProtected = hasExplicitEncryption;
    
    logValidationEvent('Office Legacy password check', filename, {
      isProtected,
      hasOleHeader,
      hasExplicitEncryption,
      hasEncryptedObject,
      hasEncryptionInfo,
      hasWordDocument,
      hasWorkbook,
      hasPowerPointDocument,
      hasOfficeStreams,
      bytesChecked: Math.min(4096, uint8Array.length),
      decision: isProtected ? 
        'ENCRYPTED - Encryption stream detected (EncryptedObject or EncryptionInfo)' : 
        'NOT ENCRYPTED - No encryption streams found'
    });
    
    return isProtected;
  } catch (error) {
    logger.warn('Error checking Office Legacy password protection', { filename, error });
    return false;
  }
};

/**
 * Generic password protection detection for any file type
 * Looks for common encryption patterns across different file formats
 * @param uint8Array - File header data
 * @param filename - Name of the file
 * @returns True if common encryption patterns detected
 */
const hasGenericEncryptionMarkers = (uint8Array: Uint8Array, filename: string): boolean => {
  try {
    const hex = uint8ArrayToHex(uint8Array);
    const textContent = String.fromCharCode(...uint8Array);
    
    // Common encryption keywords that appear in various encrypted file formats
    const encryptionKeywords = [
      'encrypt', 'Encrypt', 'ENCRYPT',
      'password', 'Password', 'PASSWORD',
      'protected', 'Protected', 'PROTECTED',
      'cipher', 'Cipher', 'CIPHER',
      'crypt', 'Crypt', 'CRYPT',
      'AES', 'RSA', 'RC4',
      'EncryptedKey', 'EncryptedPackage', 'EncryptionInfo',
      '/Encrypt', '/CryptFilter', '/Filter/Standard',
      'EncryptedObject', 'EncryptionHeader'
    ];
    
    // Common encryption hex patterns (across different formats)
    const encryptionHexPatterns = [
      '456e637279707420',      // "Encrypt "
      '456e637279707465644b',  // "EncryptedK"
      '456e6372797074696f6e',  // "Encryption"
      '5061737377',            // "Passw"
      '50726f746563746564',    // "Protected"
      '4145533a',              // "AES:"
      '5243343a',              // "RC4:"
      '525341',                // "RSA"
      '456e637279707465644f',  // "EncryptedO" (EncryptedObject)
      '456e6372797074696f6e496e666f', // "EncryptionInfo"
      '5243344372797074',      // RC4 CryptoAPI
    ];
    
    // Check for encryption keywords in text content
    const hasEncryptionKeyword = encryptionKeywords.some(keyword => 
      textContent.includes(keyword)
    );
    
    // Check for encryption hex patterns
    const hasEncryptionHexPattern = encryptionHexPatterns.some(pattern => 
      hex.includes(pattern)
    );
    
    // Additional check: Look for Office-specific encryption markers from constants
    const { OFFICE_XML, OFFICE_LEGACY } = PASSWORD_PROTECTION_SIGNATURES;
    const hasOfficeXmlMarkers = hex.includes(OFFICE_XML.ENCRYPTED_KEY) || 
                                hex.includes(OFFICE_XML.ENCRYPTED_PACKAGE) ||
                                hex.includes(OFFICE_XML.ENCRYPTION_INFO);
    
    const hasOfficeLegacyMarkers = hex.includes(OFFICE_LEGACY.ENCRYPTED_OBJECT) ||
                                   hex.includes(OFFICE_LEGACY.ENCRYPTION_INFO) ||
                                   hex.includes(OFFICE_LEGACY.RC4_CRYPTO_API);
    
    const isProtected = hasEncryptionKeyword || hasEncryptionHexPattern || 
                       hasOfficeXmlMarkers || hasOfficeLegacyMarkers;
    
    if (isProtected) {
      logValidationEvent('Generic encryption markers detected', filename, {
        hasEncryptionKeyword,
        hasEncryptionHexPattern,
        hasOfficeXmlMarkers,
        hasOfficeLegacyMarkers
      });
    }
    
    return isProtected;
  } catch (error) {
    logger.warn('Error checking generic encryption markers', { filename, error });
    return false;
  }
};

/**
 * Determines optimal bytes to read based on file characteristics
 * @param file - File to analyze
 * @returns Number of bytes to read
 */
const determineOptimalBytesToRead = (file: File): number => {
  const filename = file.name.toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  // PDF files: Need more bytes for encryption dictionaries
  // Some PDFs have encryption info later in the header structure
  if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) {
    return 4096; // Increased from 2048 to 4096 for better PDF encryption detection
  }
  
  // OLE-based files (legacy Office): Need more bytes for structure analysis
  // Check by header later, but default to more bytes for Office MIME types
  if (mimeType.includes('msword') || 
      mimeType.includes('ms-excel') || 
      mimeType.includes('ms-powerpoint') ||
      filename.match(/\.(doc|xls|ppt|msg)$/)) {
    return 2048;
  }
  
  // ZIP-based files (modern Office): Header check is sufficient
  if (mimeType.includes('officedocument') || 
      filename.match(/\.(docx|xlsx|pptx)$/)) {
    return 1024;
  }
  
  // Archives and compressed files: Check header
  if (mimeType.includes('zip') || 
      mimeType.includes('compressed') ||
      filename.match(/\.(zip|rar|7z|tar|gz)$/)) {
    return 1024;
  }
  
  // Images: Minimal check
  if (mimeType.startsWith('image/') || 
      filename.match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/)) {
    return 512;
  }
  
  // Default: Read a reasonable amount for other file types
  return 1536;
};

/**
 * Detects file format from header and returns appropriate detection strategy
 * Works independently of file extension - only examines actual file structure
 * @param uint8Array - File header data
 * @param file - Original file object
 * @returns Detection result
 */
const detectPasswordProtectionByFormat = async (
  uint8Array: Uint8Array, 
  file: File
): Promise<boolean> => {
  const headerHex = uint8ArrayToHex(uint8Array.slice(0, 16));
  
  logValidationEvent('Detecting file format by header', file.name, {
    headerHex: headerHex.substring(0, 32),
    mimeType: file.type
  });
  
  // Check image formats - images cannot be password-protected in traditional sense
  // JPEG: FFD8FF, PNG: 89504E47, GIF: 474946, BMP: 424D, TIFF: 49492A00 or 4D4D002A
  const { FILE_HEADERS } = PASSWORD_PROTECTION_SIGNATURES;
  const isImageFormat = headerHex.startsWith(FILE_HEADERS.JPEG) ||
                       headerHex.startsWith(FILE_HEADERS.PNG) ||
                       headerHex.startsWith(FILE_HEADERS.GIF) ||
                       headerHex.startsWith(FILE_HEADERS.BMP) ||
                       headerHex.startsWith(FILE_HEADERS.TIFF) ||
                       headerHex.startsWith(FILE_HEADERS.TIFF_BE) ||
                       file.type.startsWith('image/');
  
  if (isImageFormat) {
    logger.info('Detected image format - images cannot be password-protected', { filename: file.name });
    return false;
  }
  
  // Check PDF format (starts with %PDF - 255044462d)
  if (headerHex.startsWith('255044462d') || file.type === 'application/pdf') {
    logger.info('Detected PDF format', { filename: file.name });
    return isPdfPasswordProtected(uint8Array, file.name);
  }
  
  // Check OLE format (starts with D0CF11E0A1B11AE1)
  // This includes:
  // 1. Legacy Office files (.doc, .xls, .ppt)
  // 2. Encrypted modern Office files (.docx, .xlsx, .pptx with password)
  // 3. MSG files (Outlook messages)
  if (headerHex.startsWith('d0cf11e0a1b11ae1')) {
    logger.info('Detected OLE format - checking for encryption', { filename: file.name });
    
    // First, check if it's an encrypted modern Office file (Office XML encrypted)
    // Encrypted DOCX/XLSX/PPTX files use OLE container instead of ZIP
    const officeXmlEncrypted = isOfficeXmlPasswordProtected(uint8Array, file.name);
    if (officeXmlEncrypted) {
      logger.info('Detected encrypted Office XML file (DOCX/XLSX/PPTX with password)', { filename: file.name });
      return true;
    }
    
    // Check for legacy Office encryption (.doc, .xls, .ppt, .msg)
    const legacyOfficeEncrypted = isOfficeLegacyPasswordProtected(uint8Array, file.name);
    if (legacyOfficeEncrypted) {
      logger.info('Detected encrypted legacy Office/MSG file (DOC/XLS/PPT/MSG with password)', { filename: file.name });
      return true;
    }
    
    // If OLE header but no Office-specific encryption, check generic patterns
    logger.info('OLE file without Office-specific encryption markers, checking generic patterns', { filename: file.name });
    return hasGenericEncryptionMarkers(uint8Array, file.name);
  }
  
  // Check ZIP format (starts with PK - 504b0304)
  // This includes:
  // 1. Unencrypted modern Office files (.docx, .xlsx, .pptx)
  // 2. Regular ZIP archives
  // 3. Other ZIP-based formats
  if (headerHex.startsWith('504b0304')) {
    logger.info('Detected ZIP format - checking for encryption', { filename: file.name });
    
    // Check for Office XML encryption markers within the ZIP structure
    // Some Office files might have internal encryption even with ZIP structure
    const officeXmlEncrypted = isOfficeXmlPasswordProtected(uint8Array, file.name);
    if (officeXmlEncrypted) {
      logger.info('Detected encryption in ZIP-based Office file', { filename: file.name });
      return true;
    }
    
    // Check for generic ZIP encryption or encryption markers in content
    return hasGenericEncryptionMarkers(uint8Array, file.name);
  }
  
  // For all other file types, use generic encryption marker detection
  logger.info('Unknown file format - using generic encryption detection', { filename: file.name });
  return hasGenericEncryptionMarkers(uint8Array, file.name);
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
      type: file.type,
      extension: file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    });
    
    // Dynamically determine optimal bytes to read based on file characteristics
    const bytesToRead = determineOptimalBytesToRead(file);
    
    logValidationEvent('reading file header', file.name, {
      bytesToRead,
      reason: 'Based on file type and characteristics'
    });
    
    const uint8Array = await readFileHeader(file, bytesToRead);
    
    // Log first few bytes for debugging
    const headerHex = uint8ArrayToHex(uint8Array.slice(0, 16));
    logger.info('File header read', {
      filename: file.name,
      bytesRead: uint8Array.length,
      headerHex,
      fileSize: file.size
    });
    
    // Use format-based detection that works with any file type
    const isProtected = await detectPasswordProtectionByFormat(uint8Array, file);
    
    logValidationEvent('password protection check completed', file.name, {
      isProtected,
      bytesRead: uint8Array.length,
      result: isProtected ? 'PASSWORD_PROTECTED' : 'NOT_PROTECTED'
    });
    
    logger.info('Password protection detection result', {
      filename: file.name,
      isProtected,
      fileSize: file.size,
      mimeType: file.type
    });
    
    return isProtected;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    logger.error('Password protection check failed - CRITICAL ERROR', { 
      filename: file.name,
      fileSize: file.size,
      fileType: file.type,
      error: errorMessage,
      stack: errorStack
    });
    
    // IMPORTANT: If we can't check for password protection, we should be cautious
    // Returning false means we treat it as not protected, which could be wrong
    // However, blocking all files with detection errors would be too strict
    logger.warn('Allowing file upload despite password check failure - file may be password protected', {
      filename: file.name
    });
    
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