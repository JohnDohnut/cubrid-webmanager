import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for createuser task.
 */
export type CreateUserCmsRequest = BaseCmsRequest & {
  task: 'createuser';
  dbname: string;
  username: string;
  userpass: string;
  groups: { group: string[] };
  authorization: unknown[];
};
