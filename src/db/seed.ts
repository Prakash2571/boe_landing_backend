/**
 * One-time data seeding. Populates the users, courses, and plans collections
 * with starter content only when they are empty, so restarts are idempotent.
 */
import type { User } from '../types/domain.js';
import { collections } from './client.js';
import { courseSeed } from '../data/courses.js';
import { planSeed } from '../data/plans.js';
import { userSeed } from '../data/seedUsers.js';
import { hashPassword } from '../lib/password.js';

export async function seedDatabase(): Promise<void> {
  await seedUsers();
  await seedCourses();
  await seedPlans();
}

async function seedUsers(): Promise<void> {
  const users = collections.users();
  if ((await users.countDocuments({})) > 0) return;

  const docs: User[] = userSeed.map((seed) => ({
    id: seed.id,
    name: seed.name,
    username: seed.username,
    email: seed.email,
    phone: seed.phone,
    passwordHash: hashPassword(seed.password),
    role: seed.role,
    status: seed.status,
    createdAt: seed.createdAt,
  }));

  await users.insertMany(docs);
  console.log(`Seeded ${docs.length} users.`);
}

async function seedCourses(): Promise<void> {
  const courses = collections.courses();
  if ((await courses.countDocuments({})) > 0) return;
  await courses.insertMany(courseSeed);
  console.log(`Seeded ${courseSeed.length} courses.`);
}

async function seedPlans(): Promise<void> {
  const plans = collections.plans();
  if ((await plans.countDocuments({})) > 0) return;
  await plans.insertMany(planSeed);
  console.log(`Seeded ${planSeed.length} plans.`);
}
