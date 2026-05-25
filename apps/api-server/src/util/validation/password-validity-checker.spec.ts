import { passwordValidityChecker } from './password-validity-checker';

describe('passwordValidityChecker', () => {
  it('accepts passwords with letters and digits at minimum length', () => {
    expect(passwordValidityChecker('password1')).toBe(true);
  });

  it('rejects short passwords', () => {
    expect(passwordValidityChecker('pass1')).toBe(false);
  });

  it('rejects passwords without digits', () => {
    expect(passwordValidityChecker('password')).toBe(false);
  });
});
