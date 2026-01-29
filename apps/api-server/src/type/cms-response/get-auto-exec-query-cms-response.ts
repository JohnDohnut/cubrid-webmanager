import { BaseCmsResponse } from './base-cms-response';

/**
 * Query plan in response.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type QueryPlanResponse = {
  /**
   * Query ID
   */
  query_id: string;

  /**
   * Username for query execution (with @ prefix in XML, but string in JSON)
   */
  '@username'?: string;
  username?: string;

  /**
   * User password (optional)
   */
  userpass?: string;

  /**
   * Period type
   */
  period: string;

  /**
   * Schedule detail
   */
  detail: string;

  /**
   * SQL query string
   */
  query_string: string;
};

/**
 * Plan list container in response.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type PlanListResponse = {
  /**
   * Database name
   */
  dbname: string;

  /**
   * Query plans array
   */
  queryplan: QueryPlanResponse[];
};

/**
 * Response type for getautoexecquery request.
 *
 * @category CMS Responses
 * @since 1.0.0
 */
export type GetAutoExecQueryCmsResponse = BaseCmsResponse & {
  /**
   * Plan list containing query plans
   */
  planlist: PlanListResponse[];
};
