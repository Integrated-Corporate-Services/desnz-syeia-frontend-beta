import { PASSWORD_PROTECTION_SIGNATURES } from './fileValidationConstants';
import {
  readFileHeader,
  uint8ArrayToHex,
  isLegacyOfficeFile,
  isExcelFile,
  isWordFile,
  isMsgFile,
  getOptimalReadSize,
  findFilePassRecord,
  findWordEncryptionFlag
} from './fileValidationUtils';
import { createLogger } from './logger';

const logger = createLogger('passwordProtectionDetector');

const hexDump = (uint8Array: Uint8Array, maxBytes = 64): string => {
  const slice = uint8Array.slice(0, maxBytes);
  const hex   = Array.from(slice).map(b => b.toString(16).padStart(2, '0')).join(' ');
  const ascii = Array.from(slice).map(b => (b >= 32 && b < 127) ? String.fromCharCode(b) : '.').join('');
  return `HEX: ${hex}\nASC: ${ascii}`;
};

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
  
    logger.info('PDF PASSWORD CHECK ', {
      filename,
      bytesScanned: bytesToCheck,
      hasEncryptDict,
      hasInlineEncrypt,
      hasStandardFilter,
      hasEncryptionVersion,
      RESULT: isProtected ? 'PROTECTED' : 'NOT PROTECTED',
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
    
    const isZipFile = hex.startsWith(OFFICE_XML.ZIP_HEADER);
    const hasOleHeader = hex.startsWith(OFFICE_LEGACY.OLE_HEADER);
    const isLegacy    = isLegacyOfficeFile(filename);

    logger.info('OFFICE XML CHECK', {
      filename,
      headerHex: hex,
      isZipFile,
      hasOleHeader,
      isLegacyFile: isLegacy,
      ZIP_HEADER_EXPECTED: OFFICE_XML.ZIP_HEADER,
      OLE_HEADER_EXPECTED: OFFICE_LEGACY.OLE_HEADER,
    });

    if (isLegacy) {
      logger.info('Skipping Office XML check - legacy Office file format', { filename });
      return false;
    }
    
    const isProtected = !isZipFile && hasOleHeader;
    logger.info('OFFICE XML CHECK → RESULT', {
      filename,
      RESULT: isProtected ? 'PROTECTED (OLE wrapping modern file)' : 'NOT PROTECTED',
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
    logger.info('LEGACY OFFICE CHECK START', {
      filename,
      totalBytesRead: uint8Array.length,
      headerHex,
      hasOleHeader,
      OLE_HEADER_EXPECTED: OFFICE_LEGACY.OLE_HEADER,
      hexDump: hexDump(uint8Array, 64),
    });
    if (!hasOleHeader) {
      logger.info('Not an OLE file - no Legacy Office encryption', { filename });
      return false;
    }
    
    const hasEncryptedObject = contentHex.includes(OFFICE_LEGACY.ENCRYPTED_OBJECT);
    logger.info('EncryptedObject stream', {
      filename,
      pattern: OFFICE_LEGACY.ENCRYPTED_OBJECT,
      patternAscii: 'EncryptedObject',
      found: hasEncryptedObject,
      searchedBytes: contentHex.length / 2,
    });
    const hasEncryptionInfo = contentHex.includes(OFFICE_LEGACY.ENCRYPTION_INFO);
    logger.info('EncryptionInfo stream', {
      filename,
      pattern: OFFICE_LEGACY.ENCRYPTION_INFO,
      patternAscii: 'EncryptionInfo',
      found: hasEncryptionInfo,
    });
    const hasRc4CryptoApi = contentHex.includes(OFFICE_LEGACY.RC4_CRYPTO_API);
    logger.info('Check 3 — RC4 CryptoAPI marker', {
      filename,
      pattern: OFFICE_LEGACY.RC4_CRYPTO_API,
      patternAscii: 'RC4Crypt',
      found: hasRc4CryptoApi,
    });
     
    let hasFilePassRecord = false;
    
    if (isExcelFile(filename)) {
      logger.info('Checking for Excel FilePass record', { filename });
      const filePassResult = findFilePassRecord(contentHex, filename);
      hasFilePassRecord = filePassResult.found;
      logger.info('Excel FilePass check result',{
        filename,
        found: hasFilePassRecord,
        offset: filePassResult.offset,
        length: filePassResult.length,
        context: filePassResult.context,
      });
    } else {
      logger.info('Excel FilePass skipped (not an Excel file)', { filename });
    }
     
    let hasWordEncryption = false;
    
    if (isWordFile(filename)) {
      logger.info('Checking for Word FIB encryption', { filename });
      hasWordEncryption = findWordEncryptionFlag(contentHex, filename);
      logger.info('Word FIB encryption check result', { filename, hasWordEncryption });
    }else {
      logger.info('Word FIB encryption skipped (not a Word file)', { filename });
    }
    
    const hasExplicitEncryption = hasEncryptedObject || hasEncryptionInfo || hasFilePassRecord || hasWordEncryption;
    const isProtected = hasExplicitEncryption;

    logger.info('LEGACY OFFICE CHECK SUMMARY', {
      filename,
      bytesRead: uint8Array.length,
      checks: {
        '1_EncryptedObject': hasEncryptedObject,
        '2_EncryptionInfo':  hasEncryptionInfo,
        '3_RC4CryptoApi':    hasRc4CryptoApi,
        '4_BiffFilePass':    hasFilePassRecord,
        '5_WordFibFlags':    hasWordEncryption,
      },
      RESULT: isProtected
        ? 'PROTECTED — at least one marker found'
        : 'NOT PROTECTED — no markers found',
    });

  
    if (!isProtected) {
      const searchWindow = contentHex.substring(0, 512);
      logger.info('First 256 bytes hex (check manually for encryption bytes)', {
        filename,
        first256bytesHex: searchWindow,
        first256bytesAscii: Array.from(uint8Array.slice(0, 256))
          .map(b => (b >= 32 && b < 127) ? String.fromCharCode(b) : '.')
          .join(''),
      });
    }

    return isProtected;
  } catch (error) {
    logger.warn('Legacy Office check error', { filename, error });
    return false;
  }
};

const hasGenericEncryptionMarkers = (uint8Array: Uint8Array, filename: string): boolean => {
  try {
    const hex = uint8ArrayToHex(uint8Array);
    const textContent = String.fromCharCode(...uint8Array);
    const { GENERIC, OFFICE_XML, OFFICE_LEGACY } = PASSWORD_PROTECTION_SIGNATURES;

    const matchedKeywords = GENERIC.ENCRYPTION_TEXT_KEYWORDS.filter(kw => textContent.includes(kw));
    const matchedHexPats  = GENERIC.ENCRYPTION_HEX_PATTERNS.filter(p => hex.includes(p));

    const hasOfficeXmlMarkers = hex.includes(OFFICE_XML.ENCRYPTED_KEY) || hex.includes(OFFICE_XML.ENCRYPTED_PACKAGE) || hex.includes(OFFICE_XML.ENCRYPTION_INFO);

    const hasOfficeLegacyMarkers = hex.includes(OFFICE_LEGACY.ENCRYPTED_OBJECT) || hex.includes(OFFICE_LEGACY.ENCRYPTION_INFO)  || hex.includes(OFFICE_LEGACY.RC4_CRYPTO_API);

    const isProtected = matchedKeywords.length > 0 || matchedHexPats.length > 0  || hasOfficeXmlMarkers || hasOfficeLegacyMarkers;

    logger.info('Generic encryption check', {
      filename,
      matchedTextKeywords: matchedKeywords,
      matchedHexPatterns:  matchedHexPats,
      hasOfficeXmlMarkers,
      hasOfficeLegacyMarkers,
      RESULT: isProtected ? 'PROTECTED' : 'NOT PROTECTED',
    });

    return isProtected;
  } catch (error) {
    logger.warn('Generic check error', { filename, error });
    return false;
  }
};

const detectPasswordProtectionByFormat = async (
  uint8Array: Uint8Array,
  file: File
): Promise<boolean> => {
  const headerHex = uint8ArrayToHex(uint8Array.slice(0, 16));

  logger.info('Format detection', {
    filename:    file.name,
    fileSize:    file.size,
    mimeType:    file.type,
    bytesRead:   uint8Array.length,
    headerHex,
    hexDump:     hexDump(uint8Array, 32),
  });

  const { FILE_HEADERS } = PASSWORD_PROTECTION_SIGNATURES;

  const isImageFormat = headerHex.startsWith(FILE_HEADERS.JPEG) || headerHex.startsWith(FILE_HEADERS.PNG)  || headerHex.startsWith(FILE_HEADERS.GIF)  || headerHex.startsWith(FILE_HEADERS.BMP)  || headerHex.startsWith(FILE_HEADERS.TIFF) || headerHex.startsWith(FILE_HEADERS.TIFF_BE) || file.type.startsWith('image/');

  if (isImageFormat) {
    logger.info('IMAGE format detected, skipping password check', { filename: file.name });
    return false;
  }

  if (headerHex.startsWith('255044462d') || file.type === 'application/pdf') {
    logger.info('PDF format detected', { filename: file.name });
    return isPdfPasswordProtected(uint8Array, file.name);
  }

  if (headerHex.startsWith('d0cf11e0a1b11ae1')) {
    logger.info('OLE format detected (DOC/XLS/PPT/MSG or encrypted DOCX/XLSX/PPTX)', {
      filename: file.name,
      isLegacyExtension: isLegacyOfficeFile(file.name),
    });

    const officeXmlEncrypted = isOfficeXmlPasswordProtected(uint8Array, file.name);
    if (officeXmlEncrypted) {
      logger.info('ENCRYPTED modern Office file (DOCX/XLSX/PPTX wrapped in OLE)', { filename: file.name });
      return true;
    }

    const legacyEncrypted = isOfficeLegacyPasswordProtected(uint8Array, file.name);
    if (legacyEncrypted) {
      logger.info('ENCRYPTED legacy Office file', { filename: file.name });
      return true;
    }

    if (isMsgFile(file.name)) {
      logger.info('MSG file passed OLE2 stream checks - skipping generic fallback (unreliable for MSG content)', { filename: file.name });
      return false;
    }

    logger.info('OLE file passed specific checks, trying generic fallback', { filename: file.name });
    return hasGenericEncryptionMarkers(uint8Array, file.name);
  }

  if (headerHex.startsWith('504b0304')) {
    logger.info('ZIP format detected (DOCX/XLSX/PPTX unencrypted, or ZIP)', { filename: file.name });

    const officeXmlEncrypted = isOfficeXmlPasswordProtected(uint8Array, file.name);
    if (officeXmlEncrypted) return true;

    return hasGenericEncryptionMarkers(uint8Array, file.name);
  }

  logger.warn('Unknown format, using generic detection', {
    filename:  file.name,
    headerHex,
  });
  return hasGenericEncryptionMarkers(uint8Array, file.name);
};

export const isPasswordProtected = async (file: File): Promise<boolean> => {
  try {
    logger.info('Password check start', {
      filename:  file.name,
      fileSize:  file.size,
      mimeType:  file.type,
      extension: file.name.substring(file.name.lastIndexOf('.')).toLowerCase(),
    });

    const bytesToRead = determineOptimalBytesToRead(file);  
    logger.info('Reading file', {
      filename:    file.name,
      bytesToRead,
      fileSizeTotal: file.size,
      pctOfFile: ((bytesToRead / file.size) * 100).toFixed(1) + '%',
    });

    const uint8Array = await readFileHeader(file, bytesToRead);

    logger.info('File read complete', {
      filename:   file.name,
      bytesRead:  uint8Array.length,
      headerHex:  uint8ArrayToHex(uint8Array.slice(0, 16)),
    });

    const isProtected = await detectPasswordProtectionByFormat(uint8Array, file);

    logger.info('Password check complete', {
      filename:  file.name,
      FINAL_RESULT: isProtected ? 'PASSWORD PROTECTED - will be REJECTED' : 'NOT PROTECTED - will be ACCEPTED',
    });

    return isProtected;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error('Password check error: defaulting to ALLOW', {
      filename: file.name,
      error:    msg,
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
    if (result.status === 'fulfilled') return result.value;
    const filename = files[index].name;
    const error = result.reason instanceof Error ? result.reason.message : String(result.reason);
    logger.error('Batch check failed', { filename, error });
    return { filename, isProtected: false, error };
  });
};

const determineOptimalBytesToRead = (file: File): number => {
  const configuredMax = getOptimalReadSize(file.name);
  const bytesToRead = Math.min(configuredMax, file.size);

  logger.info('Bytes to read decision', {
    filename:      file.name,
    fileSize:      file.size,
    configuredMax,
    bytesToRead,
    pctOfFile:     ((bytesToRead / file.size) * 100).toFixed(1) + '%',
    note: bytesToRead < file.size
      ? 'Partial read — encryption markers must be in first ' + bytesToRead + ' bytes'
      : 'Full file read — no markers will be missed',
  });

  return bytesToRead;
};