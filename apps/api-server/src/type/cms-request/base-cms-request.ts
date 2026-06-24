/**
 * Represents the base structure for a CMS request, including a task and an optional authentication token.
 * The token is optional because it can be automatically added by BaseService.executeCmsRequest.
 *
 * @category Requests
 * @since 1.0.0
 */
export type BaseCmsRequest = {
  task: string;
  token?: string;
};
