import { 
  FILE_SIZE_UNITS, 
  FILE_TYPE_CATEGORIES, 
  ALLOWED_FILE_EXTENSIONS,
  BIFF_RECORD_CONSTANTS,
  PASSWORD_PROTECTION_SIGNATURES,
  PASSWORD_DETECTION_READ_SIZES
} from './fileValidationConstants';
import { UploadedFile } from '../types/fileUpload';
import { createLogger } from './logger';

const logger = createLogger('fileValidationUtils');


export type FileOrMetadata = File | UploadedFile;

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  
  return `${size} ${FILE_SIZE_UNITS[i]}`;
};

export const getFileExtension = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? `.${extension}` : '';
};


const toSafeNumber = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  return isNaN(num) ? 0 : num;
};

export const calculateTotalSize = (files: FileOrMetadata[]): number => {
  return files.reduce((total, file) => {
    let size: number;
    
    if ((file as File).size !== undefined) {
      // File object - size is always a number
      size = (file as File).size;
    } else {
      size = toSafeNumber((file as UploadedFile).fileSizeBytes);
    }
    
    return total + size;
  }, 0);
};

export const isDuplicateFile = (newFile: File, existingFiles: FileOrMetadata[]): boolean => {
  return existingFiles.some(existingFile => {
    const existingName = (existingFile as File).name !== undefined
      ? (existingFile as File).name
      : (existingFile as UploadedFile).filename;
    
    const existingSize = (existingFile as File).size !== undefined
      ? (existingFile as File).size
      : toSafeNumber((existingFile as UploadedFile).fileSizeBytes);
    
    return existingName === newFile.name && existingSize === newFile.size;
  });
};

export const isValidFileType = (
  file: File, 
  allowedTypes: string[], 
  allowedExtensions: string[]
): boolean => {
  const fileExtension = getFileExtension(file.name);
  return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
};

export const readFileHeader = (file: File, bytesToRead: number = 1024): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) {
        reject(new Error('Failed to read file header'));
        return;
      }
      resolve(new Uint8Array(arrayBuffer));
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file.slice(0, bytesToRead));
  });
};

export const uint8ArrayToHex = (uint8Array: Uint8Array): string => {
  return Array.from(uint8Array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const createFileValidationError = (
  filename: string, 
  errorType: string, 
  details?: string
): string => {
  const baseMessage = `${filename}: ${errorType}`;
  return details ? `${baseMessage}. ${details}` : baseMessage;
};

export const logValidationEvent = (
  event: string, 
  filename: string, 
  details?: Record<string, unknown>
): void => {
  logger.debug(`File validation ${event}`, {
    filename,
    ...details
  });
};

const isFileInCategory = (filename: string, category: readonly string[]): boolean => {
  const lowerFilename = filename.toLowerCase();
  return category.some(ext => lowerFilename.endsWith(ext));
};

export const isLegacyOfficeFile = (filename: string): boolean =>
  isFileInCategory(filename, FILE_TYPE_CATEGORIES.LEGACY_OFFICE);

export const isModernOfficeFile = (filename: string): boolean =>
  isFileInCategory(filename, FILE_TYPE_CATEGORIES.MODERN_OFFICE);

export const isExcelFile = (filename: string): boolean =>
  isFileInCategory(filename, FILE_TYPE_CATEGORIES.EXCEL_FILES);

export const isWordFile = (filename: string): boolean =>
  isFileInCategory(filename, FILE_TYPE_CATEGORIES.WORD_FILES);

export const isImageFile = (filename: string): boolean =>
  isFileInCategory(filename, FILE_TYPE_CATEGORIES.IMAGES);

export const isPdfFile = (filename: string): boolean =>
  isFileInCategory(filename, FILE_TYPE_CATEGORIES.DOCUMENTS);

export const hasAllowedExtension = (filename: string): boolean =>
  isFileInCategory(filename, ALLOWED_FILE_EXTENSIONS);

export const categorizeFileType = (filename: string): string => {
  if (isPdfFile(filename)) return 'PDF';
  if (isLegacyOfficeFile(filename)) return 'LEGACY_OFFICE';
  if (isModernOfficeFile(filename)) return 'MODERN_OFFICE';
  if (isImageFile(filename)) return 'IMAGE';
  return 'UNKNOWN';
};

export const getOptimalReadSize = (filename: string): number => {
  if (isPdfFile(filename)) return PASSWORD_DETECTION_READ_SIZES.PDF;
  if (isLegacyOfficeFile(filename)) return PASSWORD_DETECTION_READ_SIZES.LEGACY_OFFICE;
  if (isModernOfficeFile(filename)) return PASSWORD_DETECTION_READ_SIZES.MODERN_OFFICE;
  if (isImageFile(filename)) return PASSWORD_DETECTION_READ_SIZES.IMAGES;
  return PASSWORD_DETECTION_READ_SIZES.DEFAULT;
};

export const parseBiffRecordLength = (hexString: string): number => {
  if (hexString.length !== 4) return 0;
  
  const littleEndian = hexString.substring(2, 4) + hexString.substring(0, 2);
  return parseInt(littleEndian, 16);
};

export const isValidBiffRecordLength = (length: number): boolean =>
  length >= BIFF_RECORD_CONSTANTS.MIN_RECORD_LENGTH && 
  length <= BIFF_RECORD_CONSTANTS.MAX_RECORD_LENGTH;

export const isKnownFilePassLength = (length: number): boolean =>
  length === BIFF_RECORD_CONSTANTS.FILEPASS_OLD_ENCRYPTION_LENGTH ||
  length === BIFF_RECORD_CONSTANTS.FILEPASS_RC4_ENCRYPTION_LENGTH;

export const findFilePassRecord = (
  contentHex: string, 
  filename: string
): { found: boolean; offset?: number; length?: number; context?: string } => {
  const filePassMarker = PASSWORD_PROTECTION_SIGNATURES.OFFICE_LEGACY.BIFF_FILEPASS_RECORD;
  const maxSearchBytes = 8192;
  const maxSearchHex = maxSearchBytes * 2;
  const searchLimit = Math.min(contentHex.length - 8, maxSearchHex);
  
  logger.info('Searching for BIFF FilePass record', {
    filename,
    filePassMarker,
    contentLength: contentHex.length,
    searchLimit: searchLimit / 2,
    note: 'Only searching first 8KB to avoid false positives in cell data'
  });
  
  for (let i = 0; i < searchLimit; i += 2) {
    if (contentHex.substring(i, i + 4) === filePassMarker) {
      const lengthHex = contentHex.substring(i + 4, i + 8);
      const recordLength = parseBiffRecordLength(lengthHex);
      
      if (recordLength >= BIFF_RECORD_CONSTANTS.FILEPASS_OLD_ENCRYPTION_LENGTH && 
          recordLength <= BIFF_RECORD_CONSTANTS.MAX_RECORD_LENGTH) {
        logger.info('Found BIFF FilePass record', {
          filename,
          offset: i / 2,
          recordLength,
          isKnownLength: isKnownFilePassLength(recordLength),
          encryptionType: recordLength === 6 ? 'XOR' : recordLength === 54 ? 'RC4' : 'UNKNOWN',
        });
        
        return {
          found: true,
          offset: i / 2,
          length: recordLength,
          context: contentHex.substring(Math.max(0, i - 20), Math.min(contentHex.length, i + 40))
        };
      }
    }
  }
  
  logger.info('BIFF FilePass record NOT found', { filename });
  return { found: false };
};

export const validateBiffRecordStructure = (
  hexContent: string,
  offset: number,
  expectedRecordType: string
): boolean => {
  if (offset + 8 > hexContent.length) return false;
  
  const recordType = hexContent.substring(offset, offset + 4);
  if (recordType !== expectedRecordType) return false;
  
  const lengthHex = hexContent.substring(offset + 4, offset + 8);
  const recordLength = parseBiffRecordLength(lengthHex);
  
  return isValidBiffRecordLength(recordLength);
};

export const findWordEncryptionFlag = (
  contentHex: string,
  filename: string
): boolean => {
  logger.info('Searching for Word encryption flag', {
    filename,
    contentLength: contentHex.length,
    bytesScanned: contentHex.length / 2
  });
  
  const encryptionInfoPattern = PASSWORD_PROTECTION_SIGNATURES.OFFICE_LEGACY.ENCRYPTION_INFO;
  const hasEncryptionInfo = contentHex.includes(encryptionInfoPattern);
  
  logger.info('Checking for EncryptionInfo stream', {
    filename,
    hasEncryptionInfo,
    pattern: encryptionInfoPattern
  });
  
  if (hasEncryptionInfo) {
    logger.info('Word encryption detected via EncryptionInfo stream', { filename });
    return true;
  }
  
  const wordDocStreamUtf16 = PASSWORD_PROTECTION_SIGNATURES.OFFICE_LEGACY.WORD_DOCUMENT;
  const wordDocStreamAscii = PASSWORD_PROTECTION_SIGNATURES.OFFICE_LEGACY.WORD_DOCUMENT_ASCII;
  
  let streamIndex = contentHex.indexOf(wordDocStreamUtf16);
  let isUtf16 = true;
  
  if (streamIndex === -1) {
    streamIndex = contentHex.indexOf(wordDocStreamAscii);
    isUtf16 = false;
  }
  
  if (streamIndex === -1) {
    logger.info('WordDocument stream NOT found in scanned bytes', { 
      filename,
      triedUtf16: true,
      triedAscii: true,
      note: 'Cannot verify FIB flags - relying on EncryptionInfo check only'
    });
    return false;
  }
  
  logger.info('WordDocument stream found', { 
    filename, 
    streamIndex: streamIndex / 2,
    encoding: isUtf16 ? 'UTF-16LE' : 'ASCII'
  });
  
  const fibIdentifier = 'eca5';
  let fibIndex = contentHex.indexOf(fibIdentifier);
  
  while (fibIndex !== -1 && fibIndex < contentHex.length - 24) {
    const flagsOffset = fibIndex + 20;
    if (flagsOffset + 4 <= contentHex.length) {
      const flagsHex = contentHex.substring(flagsOffset, flagsOffset + 4);
      const flags = parseInt(flagsHex.substring(2, 4) + flagsHex.substring(0, 2), 16);
      
      const fEncrypted = (flags & 0x0100) !== 0;
      const fObfuscated = (flags & 0x8000) !== 0;
      
      if (fEncrypted || fObfuscated) {
        logger.info('Found Word FIB encryption/obfuscation flag', {
          filename,
          fibOffset: fibIndex / 2,
          flags: '0x' + flags.toString(16).padStart(4, '0'),
          fEncrypted,
          fObfuscated,
          encrypted: true
        });
        return true;
      }
    }
    
    fibIndex = contentHex.indexOf(fibIdentifier, fibIndex + 2);
  }
  
  logger.info('Word encryption detection result', {
    filename,
    isEncrypted: false,
    note: 'FIB found but no encryption/obfuscation flags set'
  });
  
  return false;
};