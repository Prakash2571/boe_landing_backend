/**
 * MongoDB connection management. Connects once via the configured URL string
 * (MONGODB_URI) and exposes typed collection accessors used by the repositories.
 */
import { MongoClient, type Collection, type Db } from 'mongodb';
import { env } from '../config/env.js';
import type { Course, LeadApplication, Plan, User } from '../types/domain.js';

let client: MongoClient | null = null;
let db: Db | null = null;

/** Connect to MongoDB using the URL string. Safe to call once at startup. */
export async function connectToDatabase(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(env.mongodbUri);
  await client.connect();
  db = client.db(env.mongodbDb);
  await ensureIndexes(db);
  return db;
}

/** Returns the connected database, throwing if connect() has not run yet. */
export function getDb(): Db {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

// Strongly typed collection accessors keep repository code clean and consistent.
export const collections = {
  users(): Collection<User> {
    return getDb().collection<User>('users');
  },
  leads(): Collection<LeadApplication> {
    return getDb().collection<LeadApplication>('leads');
  },
  courses(): Collection<Course> {
    return getDb().collection<Course>('courses');
  },
  plans(): Collection<Plan> {
    return getDb().collection<Plan>('plans');
  },
};

/** Create the unique/index constraints the app relies on. */
async function ensureIndexes(database: Db): Promise<void> {
  const users = database.collection<User>('users');
  await users.createIndex({ id: 1 }, { unique: true });
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ username: 1 }, { unique: true });

  await database.collection<Course>('courses').createIndex({ slug: 1 }, { unique: true });
  await database.collection<Plan>('plans').createIndex({ slug: 1 }, { unique: true });
  await database.collection<LeadApplication>('leads').createIndex({ id: 1 }, { unique: true });
}
