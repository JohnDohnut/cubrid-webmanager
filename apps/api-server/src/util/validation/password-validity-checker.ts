const MIN_PASSWORD_LENGTH = 8;

/**
 * Validates password strength for registration and password changes.
 */
export function passwordValidityChecker(password: string): boolean {
  if (typeof password !== 'string') {
    return false;
  }

  const trimmed = password.trim();
  if (trimmed.length < MIN_PASSWORD_LENGTH) {
    return false;
  }

  return /[A-Za-z]/.test(trimmed) && /\d/.test(trimmed);
}
