/** MongoDB-backed access to learner/admin accounts. */
import type { Filter } from 'mongodb';
import type { AccountStatus, User } from '../types/domain.js';
import { collections } from '../db/client.js';
import { hashPassword } from '../lib/password.js';
import { newId } from '../lib/id.js';

function digits(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

const LEARNER_FILTER: Filter<User> = { role: { $ne: 'admin' } };

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    return collections.users().findOne({ id });
  },

  /** Look up by email, username, or phone (login accepts any of the three). */
  async findByIdentifier(identifier: string): Promise<User | null> {
    const value = identifier.trim().toLowerCase();
    const phone = digits(identifier);
    const candidates: Filter<User>[] = [{ email: value }, { username: value }];
    if (phone.length >= 10) candidates.push({ phone });
    return collections.users().findOne({ $or: candidates });
  },

  async existsByEmail(email: string): Promise<boolean> {
    const count = await collections.users().countDocuments({ email: email.trim().toLowerCase() });
    return count > 0;
  },

  async existsByUsername(username: string): Promise<boolean> {
    const count = await collections
      .users()
      .countDocuments({ username: username.trim().toLowerCase() });
    return count > 0;
  },

  async create(input: {
    name: string;
    username: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<User> {
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
    await collections.users().insertOne(user);
    return user;
  },

  /** List learner accounts (excludes admins), optionally filtered by status. */
  async listLearners(status?: AccountStatus): Promise<User[]> {
    const filter: Filter<User> = status
      ? { ...LEARNER_FILTER, status }
      : { ...LEARNER_FILTER };
    return collections.users().find(filter).sort({ createdAt: -1 }).toArray();
  },

  async setStatus(id: string, status: AccountStatus): Promise<User | null> {
    const result = await collections
      .users()
      .findOneAndUpdate({ id }, { $set: { status } }, { returnDocument: 'after' });
    return result ?? null;
  },

  async counts(): Promise<{
    total: number;
    pending_review: number;
    approved: number;
    rejected: number;
  }> {
    const users = collections.users();
    const [total, pending, approved, rejected] = await Promise.all([
      users.countDocuments(LEARNER_FILTER),
      users.countDocuments({ ...LEARNER_FILTER, status: 'pending_review' }),
      users.countDocuments({ ...LEARNER_FILTER, status: 'approved' }),
      users.countDocuments({ ...LEARNER_FILTER, status: 'rejected' }),
    ]);
    return { total, pending_review: pending, approved, rejected };
  },
};
