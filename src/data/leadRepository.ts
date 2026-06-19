/** MongoDB-backed access to learner-interest lead submissions. */
import type { LeadApplication } from '../types/domain.js';
import { collections } from '../db/client.js';
import { newId } from '../lib/id.js';

export const leadRepository = {
  async create(input: {
    name: string;
    email: string;
    phone: string;
    interest?: string;
    message?: string;
  }): Promise<LeadApplication> {
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
    await collections.leads().insertOne(lead);
    return lead;
  },
};
