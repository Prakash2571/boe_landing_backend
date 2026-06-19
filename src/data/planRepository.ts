/** MongoDB-backed access to the published access plans. */
import type { Plan } from '../types/domain.js';
import { collections } from '../db/client.js';

export const planRepository = {
  async listPublished(): Promise<Plan[]> {
    return collections
      .plans()
      .find({ status: 'published' }, { projection: { _id: 0 } })
      .sort({ sortOrder: 1 })
      .toArray();
  },
};
