/**
 * Secure password generator with customizable options
 */

export interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSpecialChars: boolean;
  numberCount?: number;
  specialCharCount?: number;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Characters that look similar
const SIMILAR_CHARS = 'il1Lo0O';
// Characters that might be ambiguous in some fonts
const AMBIGUOUS_CHARS = '{}[]()/\\\'"`~,;.<>';

/**
 * Generates a cryptographically secure random password
 */
export function generatePassword(options: PasswordOptions): string {
  let charset = '';
  let requiredChars = '';

  // Build character set
  if (options.includeUppercase) {
    let upperChars = UPPERCASE;
    if (options.excludeSimilar) {
      upperChars = upperChars.replace(/[IL]/g, '');
    }
    charset += upperChars;
    requiredChars += getRandomChar(upperChars);
  }

  if (options.includeLowercase) {
    let lowerChars = LOWERCASE;
    if (options.excludeSimilar) {
      lowerChars = lowerChars.replace(/[il]/g, '');
    }
    charset += lowerChars;
    requiredChars += getRandomChar(lowerChars);
  }

  if (options.includeNumbers) {
    let numberChars = NUMBERS;
    if (options.excludeSimilar) {
      numberChars = numberChars.replace(/[10]/g, '');
    }
    charset += numberChars;
    
    // Add required number of number characters
    const numCount = options.numberCount || 1;
    for (let i = 0; i < numCount; i++) {
      requiredChars += getRandomChar(numberChars);
    }
  }

  if (options.includeSpecialChars) {
    let specialChars = SPECIAL_CHARS;
    if (options.excludeAmbiguous) {
      specialChars = specialChars.replace(/[{}[\]()/\\'"`,;.<>]/g, '');
    }
    charset += specialChars;
    
    // Add required number of special characters
    const specialCount = options.specialCharCount || 1;
    for (let i = 0; i < specialCount; i++) {
      requiredChars += getRandomChar(specialChars);
    }
  }

  if (charset === '') {
    throw new Error('At least one character type must be selected');
  }

  // Generate remaining characters
  const remainingLength = options.length - requiredChars.length;
  if (remainingLength < 0) {
    throw new Error('Password length is too short for the required character counts');
  }

  let password = requiredChars;
  for (let i = 0; i < remainingLength; i++) {
    password += getRandomChar(charset);
  }

  // Shuffle the password to avoid predictable patterns
  return shuffleString(password);
}

/**
 * Gets a cryptographically secure random character from a string
 */
function getRandomChar(str: string): string {
  const array = new Uint8Array(1);
  crypto.getRandomValues(array);
  return str[array[0] % str.length];
}

/**
 * Shuffles a string using Fisher-Yates algorithm with crypto.getRandomValues
 */
function shuffleString(str: string): string {
  const array = str.split('');
  
  for (let i = array.length - 1; i > 0; i--) {
    const randomBytes = new Uint8Array(1);
    crypto.getRandomValues(randomBytes);
    const j = randomBytes[0] % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  
  return array.join('');
}

/**
 * Estimates password strength
 */
export function estimatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  
  // Length bonus
  score += Math.min(password.length * 4, 25);
  
  // Character variety bonus
  if (/[a-z]/.test(password)) score += 5;
  if (/[A-Z]/.test(password)) score += 5;
  if (/\d/.test(password)) score += 5;
  if (/[^a-zA-Z\d]/.test(password)) score += 10;
  
  // Patterns penalty
  if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 10; // Common patterns
  
  // Length penalties/bonuses
  if (password.length >= 16) score += 10;
  if (password.length >= 20) score += 10;
  if (password.length < 8) score -= 20;
  
  // Entropy calculation
  const uniqueChars = new Set(password).size;
  const entropy = password.length * Math.log2(uniqueChars);
  score += Math.min(entropy / 4, 25);
  
  score = Math.max(0, Math.min(100, score));
  
  if (score < 30) {
    return { score, label: 'Weak', color: 'destructive' };
  } else if (score < 60) {
    return { score, label: 'Fair', color: 'accent' };
  } else if (score < 80) {
    return { score, label: 'Good', color: 'primary' };
  } else {
    return { score, label: 'Strong', color: 'primary' };
  }
}

/**
 * Default password generation options
 */
export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSpecialChars: true,
  numberCount: 2,
  specialCharCount: 2,
  excludeSimilar: true,
  excludeAmbiguous: false,
};