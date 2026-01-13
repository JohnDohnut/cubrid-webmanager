/**
 * Represents the base structure for a CMS request, including a task and an authentication token.
 *
 * @category Requests
 * @since 1.0.0
 */
export type BaseCmsRequest = {
    task: string;
    token: string;
};
