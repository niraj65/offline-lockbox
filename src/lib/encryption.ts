import CryptoJS from 'crypto-js';

/**
 * Encryption service using AES-256-GCM for password manager
 * This provides industry-standard encryption for sensitive data
 */

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
}

/**
 * Derives a key from the master password using PBKDF2
 */
export function deriveKey(masterPassword: string, salt: string): string {
  return CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: 256 / 32,
    iterations: 100000 // OWASP recommended minimum
  }).toString();
}

/**
 * Generates a cryptographically secure random salt
 */
export function generateSalt(): string {
  return CryptoJS.lib.WordArray.random(256 / 8).toString();
}

/**
 * Generates a cryptographically secure IV
 */
export function generateIV(): string {
  return CryptoJS.lib.WordArray.random(96 / 8).toString();
}

/**
 * Encrypts data using AES-256-GCM
 */
export function encryptData(data: string, masterPassword: string): EncryptedData {
  const salt = generateSalt();
  const iv = generateIV();
  const key = deriveKey(masterPassword, salt);
  
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return {
    data: encrypted.toString(),
    iv,
    salt
  };
}

/**
 * Decrypts data using AES-256-GCM
 */
export function decryptData(encryptedData: EncryptedData, masterPassword: string): string {
  const key = deriveKey(masterPassword, encryptedData.salt);
  
  const decrypted = CryptoJS.AES.decrypt(encryptedData.data, key, {
    iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Validates master password by attempting to decrypt a known value
 */
export function validateMasterPassword(password: string, testData: EncryptedData): boolean {
  try {
    const decrypted = decryptData(testData, password);
    return decrypted === 'MASTER_PASSWORD_VALIDATION';
  } catch {
    return false;
  }
}

/**
 * Creates validation data for master password verification
 */
export function createValidationData(masterPassword: string): EncryptedData {
  return encryptData('MASTER_PASSWORD_VALIDATION', masterPassword);
}