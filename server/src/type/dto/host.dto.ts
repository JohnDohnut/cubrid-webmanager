import { HostInfo } from '@type/host-info';

/**
 * Data Transfer Object for host information.
 *
 * Excludes sensitive password information for safe data transfer.
 *
 * @category DTOs
 * @since 1.0.0
 */
export type HostDTO = Omit<HostInfo, 'password'>;
