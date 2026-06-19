/** MongoDB-backed access to the published course catalog. */
import type { Course } from '../types/domain.js';
import { collections } from '../db/client.js';

export const courseRepository = {
  async listPublished(): Promise<Course[]> {
    return collections
      .courses()
      .find({ status: 'published' }, { projection: { _id: 0 } })
      .sort({ sortOrder: 1 })
      .toArray();
  },
};
