/** Mapping helpers between stored documents and client-facing shapes. */
import type { PublicUser, User } from '../types/domain.js';

/** Strip the password hash and add a derived firstName for client display. */
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
