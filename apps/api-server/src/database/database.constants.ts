/**
 * Constants used across database module.
 *
 * @category Database
 * @since 1.0.0
 */
export const DATABASE_CONSTANTS = {
  /**
   * CUBRID configuration file name
   */
  CUBRID_CONF_NAME: 'cubridconf',

  /**
   * CUBRID HA configuration file name (cubrid_ha.conf) for CMS getallsysparam
   */
  HACONF_NAME: 'haconf',

  /**
   * CMS API protocol
   */
  CMS_API_PROTOCOL: 'https://',

  /**
   * CMS API path
   */
  CMS_API_PATH: '/cm_api',
} as const;
