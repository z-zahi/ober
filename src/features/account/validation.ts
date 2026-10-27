import type { ProfileInput, SavedPlace, SignUpInput } from './types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateProfile(input: ProfileInput): string | null {
  if (input.fullName.trim().length < 2) return 'Enter your full name.';
  if (!EMAIL.test(input.email.trim())) return 'Enter a valid email address.';
  const digits = input.phone.replace(/[\s()-]/g, '');
  if (!/^\+?\d{10,15}$/.test(digits)) return 'Enter a valid phone number, for example +20 1001234567.';
  return null;
}

export function validateSignUp(input: SignUpInput): string | null {
  return validateProfile(input) ?? validatePassword(input.password);
}

export function validatePassword(password: string): string | null {
  return password.length < 6 ? 'Password must be at least 6 characters.' : null;
}

export function validateSignIn(email: string, password: string): string | null {
  if (!EMAIL.test(email.trim())) return 'Enter a valid email address.';
  return password ? null : 'Enter your password.';
}

export function validatePlace(label: string, address: string, existing: SavedPlace[]): string | null {
  if (!label.trim()) return 'Give the place a name, for example Home.';
  if (!address.trim()) return 'Enter the address of the place.';
  const taken = existing.some((place) => place.label.toLowerCase() === label.trim().toLowerCase());
  return taken ? `You already have a place called ${label.trim()}.` : null;
}
