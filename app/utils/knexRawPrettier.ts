import {Knex} from 'knex';

export function knexRawPrettier<T>(rows) {
  if (!rows.length) return [];

  return rows as T[];
}
