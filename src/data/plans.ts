/** Seed access plans. CTAs are education-only (Start learning, Join premium). */
import type { Plan } from '../types/domain.js';

const CREATED_AT = '2024-01-01T00:00:00.000Z';

export const planSeed: Plan[] = [
  {
    id: 'plan_starter',
    slug: 'starter',
    name: 'Starter course access',
    tagline: 'Begin with a single course at your own pace.',
    pricePaise: 49900,
    cadence: 'one_time',
    features: [
      'Access to one course',
      'Lesson worksheets and templates',
      'Course completion certificate',
      'Email support',
    ],
    ctaLabel: 'Start learning',
    status: 'published',
    sortOrder: 1,
    createdAt: CREATED_AT,
  },
  {
    id: 'plan_premium',
    slug: 'premium',
    name: 'Premium membership',
    tagline: 'Ongoing learning, news briefings, and live sessions.',
    pricePaise: 29900,
    cadence: 'per_month',
    features: [
      'All courses included',
      'Daily & weekly news briefings',
      'Live Q&A sessions and webinars',
      'Templates, trackers, and worksheets',
      'Private learning community',
      'Early access to new courses',
    ],
    ctaLabel: 'Join premium',
    featured: true,
    status: 'published',
    sortOrder: 2,
    createdAt: CREATED_AT,
  },
  {
    id: 'plan_bundle',
    slug: 'bundle',
    name: 'Complete learning bundle',
    tagline: 'Every course plus a year of premium benefits.',
    pricePaise: 249900,
    cadence: 'one_time',
    features: [
      'Lifetime access to all courses',
      'One year of premium membership',
      'All certificates and worksheets',
      'Priority support',
      'Premium news briefings and explainers',
    ],
    ctaLabel: 'View plans',
    status: 'published',
    sortOrder: 3,
    createdAt: CREATED_AT,
  },
];
