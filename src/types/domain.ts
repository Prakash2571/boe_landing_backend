/** Shared domain types used across the service. */

export type Role = 'admin' | 'learner';

export type AccountStatus = 'pending_review' | 'approved' | 'rejected';

/** Full user record as stored in the data layer (includes the password hash). */
export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: Role;
  status: AccountStatus;
  createdAt: string;
};

/** User shape that is safe to send to clients (never includes the hash). */
export type PublicUser = {
  id: string;
  name: string;
  firstName: string;
  username: string;
  email: string;
  phone: string;
  role: Role;
  status: AccountStatus;
  createdAt: string;
};

export type Course = {
  id: string;
  slug: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'All levels';
  format: string;
  outcome: string;
  description?: string;
  image?: string | null;
  pricePaise?: number | null;
  status: 'published' | 'draft';
  sortOrder: number;
  createdAt: string;
};

export type Plan = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  pricePaise: number;
  cadence: 'one_time' | 'per_month';
  features: string[];
  ctaLabel: string;
  featured?: boolean;
  status: 'published' | 'draft';
  sortOrder: number;
  createdAt: string;
};

/** A learner-interest submission captured from the public lead form. */
export type LeadApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest?: string;
  message?: string;
  status: 'received';
  createdAt: string;
};
