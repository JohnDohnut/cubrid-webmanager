import { SafeHostList } from '@type/collections';

/**
 * Response interface for getting hosts list.
 *
 * Contains a hashmap of host information returned from the server.
 *
 * @category Responses
 * @since 1.0.0
 */
export type GetHostsResponse = {
    host_list: SafeHostList;
};
