import { SafeHostGroupsMap } from '@type/collections';

/**
 * Response for host/group listing — groups contain nested hosts.
 */
export type GetHostsResponse = {
  host_groups: SafeHostGroupsMap;
};
