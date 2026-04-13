/**
 * File Upload Validation Constants
 * Contains all configuration values for file upload validation
 */

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg", 
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-outlook",
  "image/jpg",
];

export const ALLOWED_FILE_EXTENSIONS = [
  ".pdf",
  ".jpg", 
  ".jpeg",
  ".png",
  ".msg",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
];

export const FILE_SIZE_LIMITS = {
  MAX_INDIVIDUAL_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  MAX_TOTAL_SIZE: 500 * 1024 * 1024, // 500MB
} as const;

export const FILE_SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB'] as const;

export const SUPPORTED_FORMATS_DISPLAY = "PDF, JPG, JPEG, PNG, DOCX, XLSX, MSG";

export const VALIDATION_ERROR_MESSAGES = {
  EMPTY_FILE: "The selected file is empty",
  FILE_SIZE_EXCEEDED: "The selected file must be smaller than 25MB",
  PASSWORD_PROTECTED: "The selected file is password protected and cannot be uploaded",
  INVALID_FILE_TYPE: "You can only upload .pdf, .jpg, .jpeg, .png, .msg, .doc, .docx, .xls, and .xlsx files",
  DUPLICATE_FILE: "A file with the same name and size already exists",
  TOTAL_SIZE_EXCEEDED: "Adding this file would exceed the total 500MB limit",
} as const;

export const PASSWORD_PROTECTION_SIGNATURES = {
  // Common file format headers (magic numbers)
  FILE_HEADERS: {
    PDF: '255044462d',              // %PDF-
    ZIP: '504b0304',                // PK.. (ZIP/Office XML)
    OLE: 'd0cf11e0a1b11ae1',        // OLE Compound Document (Legacy Office)
    RAR: '526172211a07',            // Rar!..
    SEVENZ: '377abcaf271c',         // 7-Zip
    GZIP: '1f8b08',                 // GZIP
    JPEG: 'ffd8ff',                 // JPEG image
    PNG: '89504e47',                // PNG image
    GIF: '474946',                  // GIF image
    BMP: '424d',                    // BMP image
    TIFF: '49492a00',               // TIFF image (little-endian)
    TIFF_BE: '4d4d002a',            // TIFF image (big-endian)
  },
  PDF: {
    ENCRYPT_MARKER: '/Encrypt',
    HEX_MARKER: '456e637279707420', // "Encrypt " in hex
    // Additional PDF encryption markers
    STANDARD_SECURITY: '2f5374616e6461726453656375726974794861', // "/StandardSecurityHa"
    CRYPT_FILTER: '/CryptFilter',
    FILTER_STANDARD: '/Standard',
    P_FLAG: '/P ', // Permission flag
    U_ENTRY: '/U(',  // User password entry
    O_ENTRY: '/O(',  // Owner password entry
  },
  OFFICE_XML: {
    // ZIP header for Office XML files (.docx, .xlsx)
    ZIP_HEADER: '504b0304', // PK.. (ZIP signature)
    ENCRYPTED_KEY: '456e637279707465644b6579', // "EncryptedKey"
    ENCRYPTED_PACKAGE: '456e637279707465645061636b616765', // "EncryptedPackage"
    MS_CONTAINER: '4d6963726f736f66742e436f6e7461696e65722e44617461537061636573', // Microsoft encryption
    ENCRYPTION_INFO: '456e6372797074696f6e496e666f', // "EncryptionInfo"
    // AES encryption markers
    AES_MARKER: '4145533a', // "AES:"
  },
  OFFICE_LEGACY: {
    OLE_HEADER: 'd0cf11e0a1b11ae1',
    ENCRYPTED_OBJECT: '456e637279707465644f626a656374', // "EncryptedObject"
    MS_OFFICE_WRITE: '30314d536f66746f66666963655772697465',
    ENCRYPTION_INFO: '456e6372797074696f6e496e666f', // "EncryptionInfo" stream name
    // Additional legacy Office encryption markers
    WORD_DOCUMENT: '576f7264446f63756d656e74', // "WordDocument" stream
    WORKBOOK: '576f726b626f6f6b', // "Workbook" stream  
    POWERPOINT_DOCUMENT: '506f776572506f696e7420446f63756d656e74', // "PowerPoint Document" stream
    CURRENT_USER: '43757272656e742055736572', // "Current User" stream (Office files)
    DOCUMENT_SUMMARY: '446f63756d656e7453756d6d617279496e666f726d6174696f6e', // "DocumentSummaryInformation"
    SUMMARY_INFO: '53756d6d617279496e666f726d6174696f6e', // "SummaryInformation"
    // MSG (Outlook) specific streams
    MSG_PROPERTIES: '5f5f7375627374726167655f76657273696f6e', // "__substg_version" (MSG file marker)
    MSG_NAMEID: '5f5f6e616d656964', // "__nameid" (MSG metadata)
    MSG_RECIPIENTS: '5f5f726563697069656e7473', // "__recipients"
    MSG_ATTACHMENTS: '5f5f6174746163686d656e7473', // "__attachments"
    ENCRYPTION_HEADER: '01000000020000000300000004000000', // Common encryption header pattern
    RC4_CRYPTO_API: '5243344372797074', // RC4 CryptoAPI
    ENCRYPTION_VERSION: '0200', // Encryption version marker at specific offsets
    PASSWORD_VERIFIER: '00000000000000000000000000000000', // Password verifier pattern
  },
  // Generic encryption patterns found across multiple file formats
  GENERIC: {
    ENCRYPTION_KEYWORDS: [
      '456e637279707420',      // "Encrypt "
      '456e637279707465644b',  // "EncryptedK"
      '456e6372797074696f6e',  // "Encryption"
      '5061737377',            // "Passw"
      '50726f746563746564',    // "Protected"
      '4145533a',              // "AES:"
      '5243343a',              // "RC4:"
      '525341',                // "RSA"
      '43697068657220',        // "Cipher "
      '4372797074',            // "Crypt"
    ],
  },
} as const;