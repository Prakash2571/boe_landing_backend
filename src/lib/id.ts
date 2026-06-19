/** Random, URL-safe identifiers for new records. */
import { randomBytes } from 'node:crypto';

export function newId(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString('hex')}`;
}
