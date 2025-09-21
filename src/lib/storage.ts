import { Preferences } from '@capacitor/preferences';
import { encryptData, decryptData, EncryptedData } from './encryption';

/**
 * Secure local storage service for password manager
 * Uses Capacitor Preferences for cross-platform compatibility
 */

export interface PasswordEntry {
  id: string;
  title: string;
  website: string;
  username: string;
  password: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface VaultData {
  entries: PasswordEntry[];
  version: string;
}

const STORAGE_KEYS = {
  VAULT_DATA: 'secure_vault_data',
  MASTER_PASSWORD_VALIDATION: 'master_password_validation',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  AUTO_LOCK_TIMEOUT: 'auto_lock_timeout',
  APP_SETTINGS: 'app_settings',
} as const;

/**
 * Stores encrypted vault data
 */
export async function storeVaultData(vaultData: VaultData, masterPassword: string): Promise<void> {
  try {
    const jsonData = JSON.stringify(vaultData);
    const encryptedData = encryptData(jsonData, masterPassword);
    
    await Preferences.set({
      key: STORAGE_KEYS.VAULT_DATA,
      value: JSON.stringify(encryptedData),
    });
  } catch (error) {
    console.error('Failed to store vault data:', error);
    throw new Error('Failed to save password vault');
  }
}

/**
 * Retrieves and decrypts vault data
 */
export async function getVaultData(masterPassword: string): Promise<VaultData | null> {
  try {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.VAULT_DATA });
    
    if (!value) {
      return null;
    }

    const encryptedData: EncryptedData = JSON.parse(value);
    const decryptedJson = decryptData(encryptedData, masterPassword);
    
    return JSON.parse(decryptedJson);
  } catch (error) {
    console.error('Failed to retrieve vault data:', error);
    throw new Error('Failed to decrypt password vault. Please check your master password.');
  }
}

/**
 * Stores master password validation data
 */
export async function storeMasterPasswordValidation(validationData: EncryptedData): Promise<void> {
  try {
    await Preferences.set({
      key: STORAGE_KEYS.MASTER_PASSWORD_VALIDATION,
      value: JSON.stringify(validationData),
    });
  } catch (error) {
    console.error('Failed to store master password validation:', error);
    throw new Error('Failed to save master password validation');
  }
}

/**
 * Retrieves master password validation data
 */
export async function getMasterPasswordValidation(): Promise<EncryptedData | null> {
  try {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.MASTER_PASSWORD_VALIDATION });
    
    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error('Failed to retrieve master password validation:', error);
    return null;
  }
}

/**
 * Checks if vault exists
 */
export async function vaultExists(): Promise<boolean> {
  try {
    const validation = await getMasterPasswordValidation();
    return validation !== null;
  } catch {
    return false;
  }
}

/**
 * Stores biometric settings
 */
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  try {
    await Preferences.set({
      key: STORAGE_KEYS.BIOMETRIC_ENABLED,
      value: enabled.toString(),
    });
  } catch (error) {
    console.error('Failed to store biometric setting:', error);
  }
}

/**
 * Gets biometric settings
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.BIOMETRIC_ENABLED });
    return value === 'true';
  } catch {
    return false;
  }
}

/**
 * Stores auto-lock timeout
 */
export async function setAutoLockTimeout(minutes: number): Promise<void> {
  try {
    await Preferences.set({
      key: STORAGE_KEYS.AUTO_LOCK_TIMEOUT,
      value: minutes.toString(),
    });
  } catch (error) {
    console.error('Failed to store auto-lock timeout:', error);
  }
}

/**
 * Gets auto-lock timeout
 */
export async function getAutoLockTimeout(): Promise<number> {
  try {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.AUTO_LOCK_TIMEOUT });
    return value ? parseInt(value, 10) : 5; // Default 5 minutes
  } catch {
    return 5;
  }
}

/**
 * Clears all stored data (for logout/reset)
 */
export async function clearAllData(): Promise<void> {
  try {
    await Promise.all([
      Preferences.remove({ key: STORAGE_KEYS.VAULT_DATA }),
      Preferences.remove({ key: STORAGE_KEYS.MASTER_PASSWORD_VALIDATION }),
      Preferences.remove({ key: STORAGE_KEYS.BIOMETRIC_ENABLED }),
      Preferences.remove({ key: STORAGE_KEYS.AUTO_LOCK_TIMEOUT }),
      Preferences.remove({ key: STORAGE_KEYS.APP_SETTINGS }),
    ]);
  } catch (error) {
    console.error('Failed to clear data:', error);
    throw new Error('Failed to clear application data');
  }
}