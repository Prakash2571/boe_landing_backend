/**
 * In-memory data store. This keeps the service self-contained and easy to run.
 * Swap these functions for a real database client (Postgres, Mongo, etc.)
 * without changing any of the route or service code.
 */
import type {
  AccountStatus,
  LeadApplication,
  PublicUser,
  User,
} from '../types/domain.js';
import { hashPassword } from '../lib/password.js';
import { newId } from '../lib/id.js';

function digits(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

// ── Seed accounts ───────────────────────────────────────────────────────────
// One admin (to drive the approvals dashboard) and two demo learners.
const users: User[] = [
  {
    id: 'user_admin',
    name: 'Site Admin',
    username: 'admin',
    email: 'admin@beonedge.in',
    phone: '+919241131386',
    passwordHash: hashPassword('Admin@12345'),
    role: 'admin',
    status: 'approved',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'user_asha',
    name: 'Asha Rao',
    username: 'asha_rao',
    email: 'asha@example.com',
    phone: '+919876543210',
    passwordHash: hashPassword('Password123'),
    role: 'learner',
    status: 'pending_review',
    createdAt: '2024-02-10T09:30:00.000Z',
  },
  {
    id: 'user_vikram',
    name: 'Vikram Singh',
    username: 'vikram_s',
    email: 'vikram@example.com',
    phone: '+919812345678',
    passwordHash: hashPassword('Password123'),
    role: 'learner',
    status: 'approved',
    createdAt: '2024-02-12T14:05:00.000Z',
  },
];

const leads: LeadApplication[] = [];

// ── Mapping helpers ───────────────────────────────────────────────────────────
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    firstName: user.name.split(' ')[0] || user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

// ── User store ────────────────────────────────────────────────────────────────
export const userStore = {
  all(): User[] {
    return users.slice();
  },

  findById(id: string): User | undefined {
    return users.find((user) => user.id === id);
  },

  /** Look up by email, username, or phone (login accepts any of the three). */
  findByIdentifier(identifier: string): User | undefined {
    const value = identifier.trim().toLowerCase();
    const phone = digits(identifier);
    return users.find(
      (user) =>
        user.email.toLowerCase() === value ||
        user.username.toLowerCase() === value ||
        (phone.length >= 10 && digits(user.phone) === phone),
    );
  },

  existsByEmail(email: string): boolean {
    const value = email.trim().toLowerCase();
    return users.some((user) => user.email.toLowerCase() === value);
  },

  existsByUsername(username: string): boolean {
    const value = username.trim().toLowerCase();
    return users.some((user) => user.username.toLowerCase() === value);
  },

  create(input: {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
  }): User {
    const user: User = {
      id: newId('user'),
      name: input.name,
      username: input.username,
      email: input.email,
      phone: input.phone,
      passwordHash: hashPassword(input.password),
      role: 'learner',
      status: 'pending_review',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    return user;
  },

  setStatus(id: string, status: AccountStatus): User | undefined {
    const user = users.find((entry) => entry.id === id);
    if (!user) return undefined;
    user.status = status;
    return user;
  },

  counts(): { total: number; pending_review: number; approved: number; rejected: number } {
    const learners = users.filter((user) => user.role !== 'admin');
    return {
      total: learners.length,
      pending_review: learners.filter((u) => u.status === 'pending_review').length,
      approved: learners.filter((u) => u.status === 'approved').length,
      rejected: learners.filter((u) => u.status === 'rejected').length,
    };
  },
};

// ── Lead store ────────────────────────────────────────────────────────────────
export const leadStore = {
  all(): LeadApplication[] {
    return leads.slice();
  },

  create(input: {
    name: string;
    email: string;
    phone: string;
    interest?: string;
    message?: string;
  }): LeadApplication {
    const lead: LeadApplication = {
      id: newId('lead'),
      name: input.name,
      email: input.email,
      phone: input.phone,
      ...(input.interest ? { interest: input.interest } : {}),
      ...(input.message ? { message: input.message } : {}),
      status: 'received',
      createdAt: new Date().toISOString(),
    };
    leads.push(lead);
    return lead;
  },
};
