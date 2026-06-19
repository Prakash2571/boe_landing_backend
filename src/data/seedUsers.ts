/** Seed accounts inserted on first run when the users collection is empty. */
import type { Role, AccountStatus } from '../types/domain.js';

export type SeedUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  status: AccountStatus;
  createdAt: string;
};

export const userSeed: SeedUser[] = [
  {
    id: 'user_admin',
    name: 'Site Admin',
    username: 'admin',
    email: 'admin@beonedge.in',
    phone: '+919241131386',
    password: 'Admin@12345',
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
    password: 'Password123',
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
    password: 'Password123',
    role: 'learner',
    status: 'approved',
    createdAt: '2024-02-12T14:05:00.000Z',
  },
];
