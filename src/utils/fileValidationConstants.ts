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
  MAX_INDIVIDUAL_FILE_SIZE: 25 * 1024 * 1024,
  MAX_TOTAL_SIZE: 500 * 1024 * 1024,
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
  FILE_HEADERS: {
    PDF: '255044462d',
    ZIP: '504b0304',
    OLE: 'd0cf11e0a1b11ae1',
    RAR: '526172211a07',
    SEVENZ: '377abcaf271c',
    GZIP: '1f8b08',
    JPEG: 'ffd8ff',
    PNG: '89504e47',
    GIF: '474946',
    BMP: '424d',
    TIFF: '49492a00',
    TIFF_BE: '4d4d002a',
  },
  PDF: {
    ENCRYPT_MARKER: '/Encrypt',
    HEX_MARKER: '456e637279707420',
    STANDARD_SECURITY: '2f5374616e6461726453656375726974794861',
    CRYPT_FILTER: '/CryptFilter',
    FILTER_STANDARD: '/Standard',
    P_FLAG: '/P ',
    U_ENTRY: '/U(',
    O_ENTRY: '/O(',
  },
  OFFICE_XML: {
    ZIP_HEADER: '504b0304',
    ENCRYPTED_KEY: '456e637279707465644b6579',
    ENCRYPTED_PACKAGE: '456e637279707465645061636b616765',
    MS_CONTAINER: '4d6963726f736f66742e436f6e7461696e65722e44617461537061636573',
    ENCRYPTION_INFO: '456e6372797074696f6e496e666f',
    AES_MARKER: '4145533a',
  },
  OFFICE_LEGACY: {
    OLE_HEADER: 'd0cf11e0a1b11ae1',
    ENCRYPTED_OBJECT: '456e637279707465644f626a656374',
    MS_OFFICE_WRITE: '30314d536f66746f66666963655772697465',
    ENCRYPTION_INFO: '456e6372797074696f6e496e666f',
    WORD_DOCUMENT: '57006f007200640044006f00630075006d0065006e007400',
    WORD_DOCUMENT_ASCII: '576f7264446f63756d656e74',
    WORKBOOK: '57006f0072006b0062006f006f006b00',
    WORKBOOK_ASCII: '576f726b626f6f6b',
    TABLE_STREAM_1: '31005400610062006c006500',
    TABLE_STREAM_0: '30005400610062006c006500',
    POWERPOINT_DOCUMENT: '506f776572506f696e7420446f63756d656e74',
    CURRENT_USER: '43757272656e742055736572',
    DOCUMENT_SUMMARY: '446f63756d656e7453756d6d617279496e666f726d6174696f6e',
    SUMMARY_INFO: '53756d6d617279496e666f726d6174696f6e',
    MSG_PROPERTIES: '5f5f7375627374726167655f76657273696f6e',
    MSG_NAMEID: '5f5f6e616d656964',
    MSG_RECIPIENTS: '5f5f726563697069656e7473',
    MSG_ATTACHMENTS: '5f5f6174746163686d656e7473',
    ENCRYPTION_HEADER: '01000000020000000300000004000000',
    RC4_CRYPTO_API: '5243344372797074',
    ENCRYPTION_VERSION: '0200',
    PASSWORD_VERIFIER: '00000000000000000000000000000000',
    BIFF_FILEPASS_RECORD: '2f00',
  },
  
  GENERIC: {
    ENCRYPTION_TEXT_KEYWORDS: [
      'encrypt', 'Encrypt', 'ENCRYPT',
      'password', 'Password', 'PASSWORD',
      'protected', 'Protected', 'PROTECTED',
      'cipher', 'Cipher', 'CIPHER',
      'crypt', 'Crypt', 'CRYPT',
      'AES', 'RSA', 'RC4',
      'EncryptedKey', 'EncryptedPackage', 'EncryptionInfo',
      '/Encrypt', '/CryptFilter', '/Filter/Standard',
      'EncryptedObject', 'EncryptionHeader'
    ],
    ENCRYPTION_HEX_PATTERNS: [
      '456e637279707420',
      '456e637279707465644b',
      '456e6372797074696f6e',
      '5061737377',
      '50726f746563746564',
      '4145533a',
      '5243343a',
      '525341',
      '456e637279707465644f',
      '456e6372797074696f6e496e666f',
      '5243344372797074',
    ],
  },
} as const;

export const BIFF_RECORD_CONSTANTS = {
  MAX_RECORD_LENGTH: 8224,
  MIN_RECORD_LENGTH: 1,
  FILEPASS_OLD_ENCRYPTION_LENGTH: 6,
  FILEPASS_RC4_ENCRYPTION_LENGTH: 54,
  RECORD_TYPE_OFFSET: 0,
  RECORD_LENGTH_OFFSET: 2,
} as const;

export const FILE_TYPE_CATEGORIES = {
  LEGACY_OFFICE: ['.doc', '.xls', '.ppt', '.msg'],
  MODERN_OFFICE: ['.docx', '.xlsx', '.pptx'],
  EXCEL_FILES: ['.xls', '.xlsx'],
  WORD_FILES: ['.doc', '.docx'],
  IMAGES: ['.jpg', '.jpeg', '.png'],
  DOCUMENTS: ['.pdf'],
} as const;

export const PASSWORD_DETECTION_READ_SIZES = {
  PDF: 4096,
  LEGACY_OFFICE: 65536,
  MODERN_OFFICE: 1024,
  IMAGES: 512,
  DEFAULT: 1536,
} as const;