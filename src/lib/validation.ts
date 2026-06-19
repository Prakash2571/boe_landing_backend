/**
 * Server-side input validation. Mirrors the landing page's client rules so the
 * two stay in lockstep, but this is the authoritative gate.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;
const MIN_PHONE_DIGITS = 10;
const MIN_PASSWORD_LENGTH = 8;

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function digits(value: unknown): string {
  return text(value).replace(/[^0-9]/g, '');
}

export type SignupFields = {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
};

export function validateSignup(input: Record<string, unknown>): {
  ok: boolean;
  values: SignupFields;
  errors: string[];
} {
  const values: SignupFields = {
    name: text(input.name).trim(),
    username: text(input.username).trim().toLowerCase(),
    email: text(input.email).trim().toLowerCase(),
    phone: text(input.phone).trim(),
    password: text(input.password),
  };

  const errors: string[] = [];
  if (!values.name) errors.push('Enter your name');
  if (!USERNAME_PATTERN.test(values.username)) {
    errors.push('Use 3-30 lowercase letters, numbers, or underscores');
  }
  if (!EMAIL_PATTERN.test(values.email)) errors.push('Enter a valid email address');
  if (digits(values.phone).length < MIN_PHONE_DIGITS) errors.push('Enter a valid mobile number');
  if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.push('Password must be at least 8 characters');
  }

  return { ok: errors.length === 0, values, errors };
}

export type LeadFields = {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
};

export function validateLead(input: Record<string, unknown>): {
  ok: boolean;
  values: LeadFields;
  errors: string[];
} {
  const values: LeadFields = {
    name: text(input.name).trim(),
    email: text(input.email).trim().toLowerCase(),
    phone: text(input.phone).trim(),
    interest: text(input.interest).trim(),
    message: text(input.message).trim(),
  };

  const errors: string[] = [];
  if (!values.name) errors.push('Enter your name');
  if (!EMAIL_PATTERN.test(values.email)) errors.push('Enter a valid email address');
  if (digits(values.phone).length < MIN_PHONE_DIGITS) errors.push('Enter a valid phone number');

  return { ok: errors.length === 0, values, errors };
}
