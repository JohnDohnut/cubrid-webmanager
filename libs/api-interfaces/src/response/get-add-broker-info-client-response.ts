/**
 * Client-facing response for getaddbrokerinfo CMS task.
 * Returns broker config file content (conflist) and metadata.
 *
 * @category Responses
 * @since 1.0.0
 */
export type GetAddBrokerInfoClientResponse = {
  /** List of config sections, each with confdata (array of config lines) */
  conflist: { confdata: string[] }[];
  /** Config name (e.g. "broker") */
  confname: string;
  /** Note from CMS (e.g. "none") */
  note: string;
  /** Execution time (e.g. "0 ms") */
  execTime: string;
};
