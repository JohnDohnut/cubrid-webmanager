import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for deleteuser task.
 */
export type DeleteUserCmsRequest = BaseCmsRequest & {
  task: 'deleteuser';
  dbname: string;
  username: string;
};
