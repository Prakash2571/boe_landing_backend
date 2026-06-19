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
  await upsertCourses();
  await upsertPlans();
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

// Upsert by slug so newly added catalog entries appear on restart without
// having to drop the database, while existing documents stay in sync.
async function upsertCourses(): Promise<void> {
  const courses = collections.courses();
  for (const course of courseSeed) {
    await courses.updateOne({ slug: course.slug }, { $set: course }, { upsert: true });
  }
  console.log(`Synced ${courseSeed.length} courses.`);
}

async function upsertPlans(): Promise<void> {
  const plans = collections.plans();
  for (const plan of planSeed) {
    await plans.updateOne({ slug: plan.slug }, { $set: plan }, { upsert: true });
  }
  console.log(`Synced ${planSeed.length} plans.`);
}
