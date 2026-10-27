import type { SavedPlace } from '../types';
import { validatePlace, validateProfile, validateSignIn, validateSignUp } from '../validation';

const valid = { fullName: 'Ali Zahi', email: 'ali@ober.app', phone: '+20 1001234567' };

describe('validateProfile', () => {
  it('accepts a complete profile', () => {
    expect(validateProfile(valid)).toBeNull();
  });

  it('accepts a local phone number', () => {
    expect(validateProfile({ ...valid, phone: '01001234567' })).toBeNull();
  });

  it('rejects a missing name', () => {
    expect(validateProfile({ ...valid, fullName: ' ' })).toBe('Enter your full name.');
  });

  it('rejects a malformed email', () => {
    expect(validateProfile({ ...valid, email: 'ali@ober' })).toBe('Enter a valid email address.');
  });

  it('rejects a short phone number', () => {
    expect(validateProfile({ ...valid, phone: '12345' })).toMatch(/phone number/);
  });

  it('accepts a phone number written with brackets and dashes', () => {
    expect(validateProfile({ ...valid, phone: '(010) 0123-4567' })).toBeNull();
  });

  it('rejects a phone number with letters or too many digits', () => {
    expect(validateProfile({ ...valid, phone: '0100123456a' })).toMatch(/phone number/);
    expect(validateProfile({ ...valid, phone: '+2010012345678901' })).toMatch(/phone number/);
  });

  it('rejects a one-letter name', () => {
    expect(validateProfile({ ...valid, fullName: 'A' })).toBe('Enter your full name.');
  });
});

describe('sign in and sign up', () => {
  it('requires a password on sign in', () => {
    expect(validateSignIn('ali@ober.app', '')).toBe('Enter your password.');
  });

  it('rejects a malformed email on sign in', () => {
    expect(validateSignIn('ali', 'ober123')).toBe('Enter a valid email address.');
  });

  it('requires six characters for a new password', () => {
    expect(validateSignUp({ ...valid, password: '12345' })).toMatch(/6 characters/);
    expect(validateSignUp({ ...valid, password: '123456' })).toBeNull();
  });

  it('reports a profile problem before a password problem', () => {
    expect(validateSignUp({ ...valid, email: 'ali', password: '' })).toBe('Enter a valid email address.');
  });
});

describe('validatePlace', () => {
  const existing: SavedPlace[] = [{ id: 'p1', userId: 'u1', label: 'Home', address: 'Madinaty' }];

  it('accepts a new place', () => {
    expect(validatePlace('Work', 'Smart Village', existing)).toBeNull();
  });

  it('requires a name and an address', () => {
    expect(validatePlace('', 'Smart Village', existing)).not.toBeNull();
    expect(validatePlace('Work', ' ', existing)).not.toBeNull();
  });

  it('rejects a duplicate name regardless of case', () => {
    expect(validatePlace('home', 'Elsewhere', existing)).toBe('You already have a place called home.');
  });

  it('rejects a duplicate name typed with extra spaces', () => {
    expect(validatePlace('  Home  ', 'Elsewhere', existing)).toBe('You already have a place called Home.');
  });

  it('rejects a name made only of spaces', () => {
    expect(validatePlace('   ', 'Smart Village', existing)).toMatch(/Give the place a name/);
  });
});
