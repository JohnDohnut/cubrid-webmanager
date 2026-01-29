import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for setting system parameters in a configuration file.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type SetSysParamCmsRequest = BaseCmsRequest & {
  /**
   * Configuration file name
   *
   * Example: "cubridconf", "broker.conf"
   */
  confname: string;

  /**
   * Configuration data as array of lines
   *
   * Contains raw configuration file content including:
   * - Comments (lines starting with #)
   * - Section headers (lines like [section])
   * - Parameter lines (key=value format)
   * - Empty lines
   */
  confdata: string[];
};
