import { BaseCmsResponse } from './base-cms-response';

/**
 * Apply log database element.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type ApplyLogDbElement = {
  /**
   * Database name
   */
  dbname: string;

  /**
   * Hostname
   */
  hostname: string;

  /**
   * Log path
   */
  logpath: string;

  /**
   * Process ID
   */
  pid: string;

  /**
   * State
   */
  state: string;
};

/**
 * Copy log database element.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type CopyLogDbElement = {
  /**
   * Database name
   */
  dbname: string;

  /**
   * Hostname
   */
  hostname: string;

  /**
   * Log path
   */
  logpath: string;

  /**
   * Mode (e.g., "sync")
   */
  mode: string;

  /**
   * Process ID
   */
  pid: string;

  /**
   * State
   */
  state: string;
};

/**
 * Database mode information.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type DbModeInfo = {
  /**
   * Database name
   */
  dbname: string;

  /**
   * Server mode (e.g., "active")
   */
  server_mode: string;

  /**
   * Server message
   */
  server_msg: string;
};

/**
 * Database process information.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type DbProcInfo = {
  /**
   * Database name
   */
  dbname: string;

  /**
   * Process ID
   */
  pid: string;

  /**
   * State (e.g., "registered_and_active")
   */
  state: string;
};

/**
 * Server information in HA (High Availability) setup.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type HaServerInfo = {
  /**
   * Apply log database information
   */
  applylogdb: Array<{
    element: ApplyLogDbElement[];
  }>;

  /**
   * Copy log database information
   */
  copylogdb: Array<{
    element: CopyLogDbElement[];
  }>;

  /**
   * Database mode information
   */
  dbmode: DbModeInfo[];

  /**
   * Database process information
   */
  dbprocinfo: DbProcInfo[];
};

/**
 * HA database information list.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type HaDbInfoList = {
  /**
   * Server information list
   */
  server: HaServerInfo[];
};

/**
 * HA node information.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type HaNodeInfo = {
  /**
   * Hostname
   */
  hostname: string;

  /**
   * IP address
   */
  ip: string;

  /**
   * Priority
   */
  priority: string;

  /**
   * State (e.g., "master", "slave", "replica")
   */
  state: string;
};

/**
 * Response type for heartbeatlist task.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type HeartbeatListCmsResponse = BaseCmsResponse & {
  /**
   * Current node name
   */
  currentnode: string;

  /**
   * Current node state (e.g., "master", "slave", "replica")
   */
  currentnodestate: string;

  /**
   * HA database information list
   */
  hadbinfolist: HaDbInfoList[];

  /**
   * HA node list
   */
  hanodelist: Array<{
    node: HaNodeInfo[];
  }>;
};
