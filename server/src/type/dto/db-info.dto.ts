import { DBInfo } from '@type/db-info';

/**
 * Data Transfer Object for database information.
 *
 * Excludes sensitive password information and includes configuration status.
 *
 * @category DTOs
 * @since 1.0.0
 */
export type DBInfoDTO = Omit<DBInfo, 'password'> & { isConfigured: boolean };
