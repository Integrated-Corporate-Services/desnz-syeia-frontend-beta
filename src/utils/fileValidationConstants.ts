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
  PDF: {
    ENCRYPT_MARKER: '/Encrypt',
    HEX_MARKER: '456e637279707420', // "Encrypt " in hex
  },
  OFFICE_XML: {
    ENCRYPTED_KEY: '456e637279707465644b6579', // "EncryptedKey"
    ENCRYPTED_PACKAGE: '456e637279707465645061636b616765', // "EncryptedPackage"
    MS_CONTAINER: '4d6963726f736f66742e436f6e7461696e65722e44617461537061636573', // Microsoft encryption
  },
  OFFICE_LEGACY: {
    OLE_HEADER: 'd0cf11e0a1b11ae1',
    ENCRYPTED_OBJECT: '456e637279707465644f626a656374',
    MS_OFFICE_WRITE: '30314d536f66746f66666963655772697465',
  },
} as const;