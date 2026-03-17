import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for deletedbmtuser task.
 */
export type DeleteDbmtUserCmsRequest = BaseCmsRequest & {
  task: 'deletedbmtuser';
  targetid: string;
};
