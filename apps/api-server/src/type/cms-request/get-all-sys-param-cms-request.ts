import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getting all system parameters from a configuration file.
 *
 * @category CMS Requests
 * @since 1.0.0
 */
export type GetAllSysParamCmsRequest = BaseCmsRequest & {
  /**
   * Configuration file name
   *
   * Example: "cubridconf", "broker.conf"
   */
  confname: string;
};
