import { PASSWORD_PROTECTION_SIGNATURES } from './fileValidationConstants';
import { 
  readFileHeader, 
  uint8ArrayToHex, 
  logValidationEvent,
  isLegacyOfficeFile,
  isExcelFile,
  isWordFile,
  getOptimalReadSize,
  findFilePassRecord,
  findWordEncryptionFlag
} from './fileValidationUtils';
import { createLogger } from './logger';

const logger = createLogger('passwordProtectionDetector');

const isPdfPasswordProtected = (uint8Array: Uint8Array, filename: string): boolean => {
  try {
    const bytesToCheck = Math.min(4096, uint8Array.length);
    const pdfHeader = String.fromCharCode(...uint8Array.slice(0, bytesToCheck));
    
    const hasEncryptDict = /\/Encrypt\s+\d+\s+\d+\s+R/.test(pdfHeader);
    const hasInlineEncrypt = /\/Encrypt\s*<</.test(pdfHeader);
    const hasStandardFilter = /\/Filter\s*\/Standard/.test(pdfHeader);
    const hasEncryptionVersion = /\/V\s+\d+/.test(pdfHeader) && /\/R\s+\d+/.test(pdfHeader);
    
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

const isOfficeXmlPasswordProtected = (uint8Array: Uint8Array, filename: string): boolean => {
  try {
    const hex = uint8ArrayToHex(uint8Array.slice(0, 16));
    const { OFFICE_XML, OFFICE_LEGACY } = PASSWORD_PROTECTION_SIGNATURES;
    
    logger.info('Checking Office XML password protection', {
      filename,
      hexPreview: hex
    });
    
    const isZipFile = hex.startsWith(OFFICE_XML.ZIP_HEADER);
    const hasOleHeader = hex.startsWith(OFFICE_LEGACY.OLE_HEADER);
    
    if (isLegacyOfficeFile(filename)) {
      logger.info('Skipping Office XML check - legacy Office file format', { filename });
      return false;
    }
    
    const isProtected = !isZipFile && hasOleHeader;
    
    logValidationEvent('Office XML password check', filename, {
      isProtected,
      isZipFile,
      hasOleHeader,
      isLegacyOfficeFile: isLegacyOfficeFile(filename),
      headerHex: hex,
      reason: isProtected ? 'OLE header detected (file-level encryption)' : 'ZIP header detected (no file-level encryption)'
    });
    
    return isProtected;
  } catch (error) {
    logger.warn('Error checking Office XML password protection', { filename, error });
    return false;
  }
};

const isOfficeLegacyPasswordProtected = (uint8Array: Uint8Array, filename: string): boolean => {
  try {
    const headerHex = uint8ArrayToHex(uint8Array.slice(0, 32));
    const contentHex = uint8ArrayToHex(uint8Array);
    const { OFFICE_LEGACY } = PASSWORD_PROTECTION_SIGNATURES;
    
    const hasOleHeader = headerHex.startsWith(OFFICE_LEGACY.OLE_HEADER);
    
    if (!hasOleHeader) {
      logger.info('Not an OLE file - no Legacy Office encryption', { filename });
      return false;
    }
    
    const hasEncryptedObject = contentHex.includes(OFFICE_LEGACY.ENCRYPTED_OBJECT);
    const hasEncryptionInfo = contentHex.includes(OFFICE_LEGACY.ENCRYPTION_INFO);
     
    let hasFilePassRecord = false;
    
    if (isExcelFile(filename)) {
      logger.info('Checking for Excel FilePass record', { filename });
      const filePassResult = findFilePassRecord(contentHex, filename);
      hasFilePassRecord = filePassResult.found;
      logger.info('Excel FilePass check result', { filename, hasFilePassRecord });
    }
     
    let hasWordEncryption = false;
    
    if (isWordFile(filename)) {
      logger.info('Checking for Word FIB encryption', { filename });
      hasWordEncryption = findWordEncryptionFlag(contentHex, filename);
      logger.info('Word FIB encryption check result', { filename, hasWordEncryption });
    }
    
    const hasExplicitEncryption = hasEncryptedObject || hasEncryptionInfo || hasFilePassRecord || hasWordEncryption;
    const hasWordDocument = contentHex.includes(OFFICE_LEGACY.WORD_DOCUMENT) || 
                           contentHex.includes(OFFICE_LEGACY.WORD_DOCUMENT_ASCII);
    const hasWorkbook = contentHex.includes(OFFICE_LEGACY.WORKBOOK) || 
                       contentHex.includes(OFFICE_LEGACY.WORKBOOK_ASCII);
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
    
    const isProtected = hasExplicitEncryption;
    
    logValidationEvent('Office Legacy password check', filename, {
      isProtected,
      hasOleHeader,
      hasExplicitEncryption,
      hasEncryptedObject,
      hasEncryptionInfo,
      hasFilePassRecord,
      hasWordEncryption,
      hasWordDocument,
      hasWorkbook,
      hasPowerPointDocument,
      hasOfficeStreams,
      bytesChecked: Math.min(4096, uint8Array.length),
      decision: isProtected ? 
        'ENCRYPTED - Encryption marker detected (EncryptedObject/EncryptionInfo/FilePass/WordFIB)' : 
        'NOT ENCRYPTED - No encryption markers found'
    });
    
    return isProtected;
  } catch (error) {
    logger.warn('Error checking Office Legacy password protection', { filename, error });
    return false;
  }
};

const hasGenericEncryptionMarkers = (uint8Array: Uint8Array, filename: string): boolean => {
  try {
    const hex = uint8ArrayToHex(uint8Array);
    const textContent = String.fromCharCode(...uint8Array);
    
    const { GENERIC } = PASSWORD_PROTECTION_SIGNATURES;
    const hasEncryptionKeyword = GENERIC.ENCRYPTION_TEXT_KEYWORDS.some(keyword => 
      textContent.includes(keyword)
    );
    
    const hasEncryptionHexPattern = GENERIC.ENCRYPTION_HEX_PATTERNS.some(pattern => 
      hex.includes(pattern)
    );
    
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

const determineOptimalBytesToRead = (file: File): number => {
  return getOptimalReadSize(file.name);
};

const detectPasswordProtectionByFormat = async (
  uint8Array: Uint8Array, 
  file: File
): Promise<boolean> => {
  const headerHex = uint8ArrayToHex(uint8Array.slice(0, 16));
  
  logValidationEvent('Detecting file format by header', file.name, {
    headerHex: headerHex.substring(0, 32),
    mimeType: file.type
  });
  
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
  
  if (headerHex.startsWith('255044462d') || file.type === 'application/pdf') {
    logger.info('Detected PDF format', { filename: file.name });
    return isPdfPasswordProtected(uint8Array, file.name);
  }
  
  if (headerHex.startsWith('d0cf11e0a1b11ae1')) {
    logger.info('Detected OLE format - checking for encryption', { filename: file.name });
    
    const officeXmlEncrypted = isOfficeXmlPasswordProtected(uint8Array, file.name);
    if (officeXmlEncrypted) {
      logger.info('Detected encrypted Office XML file (DOCX/XLSX/PPTX with password)', { filename: file.name });
      return true;
    }
    
    const legacyOfficeEncrypted = isOfficeLegacyPasswordProtected(uint8Array, file.name);
    if (legacyOfficeEncrypted) {
      logger.info('Detected encrypted legacy Office/MSG file (DOC/XLS/PPT/MSG with password)', { filename: file.name });
      return true;
    }
    
    logger.info('OLE file without Office-specific encryption markers, checking generic patterns', { filename: file.name });
    return hasGenericEncryptionMarkers(uint8Array, file.name);
  }
  
  if (headerHex.startsWith('504b0304')) {
    logger.info('Detected ZIP format - checking for encryption', { filename: file.name });
    
    const officeXmlEncrypted = isOfficeXmlPasswordProtected(uint8Array, file.name);
    if (officeXmlEncrypted) {
      logger.info('Detected encryption in ZIP-based Office file', { filename: file.name });
      return true;
    }
    
    return hasGenericEncryptionMarkers(uint8Array, file.name);
  }
  
  logger.info('Unknown file format - using generic encryption detection', { filename: file.name });
  return hasGenericEncryptionMarkers(uint8Array, file.name);
};

export const isPasswordProtected = async (file: File): Promise<boolean> => {
  try {
    logValidationEvent('password protection check started', file.name, { 
      size: file.size,
      type: file.type,
      extension: file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    });
    
    const bytesToRead = determineOptimalBytesToRead(file);
    
    logValidationEvent('reading file header', file.name, {
      bytesToRead,
      reason: 'Based on file type and characteristics'
    });
    
    const uint8Array = await readFileHeader(file, bytesToRead);
    
    const headerHex = uint8ArrayToHex(uint8Array.slice(0, 16));
    logger.info('File header read', {
      filename: file.name,
      bytesRead: uint8Array.length,
      headerHex,
      fileSize: file.size
    });
    
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
    
    logger.warn('Allowing file upload despite password check failure - file may be password protected', {
      filename: file.name
    });
    
    return false;
  }
};

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