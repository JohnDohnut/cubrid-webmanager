import { BaseDatabaseRequest } from './base-database-request';

export type SaveDatabaseProfileRequest = BaseDatabaseRequest & {
  id: string;
  /** Omitted or null → stored as empty string. */
  password?: string | null;
};
