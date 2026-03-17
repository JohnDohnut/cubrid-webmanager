import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for getdbmtuserinfo task.
 */
export type GetDbmtUserInfoCmsRequest = BaseCmsRequest & {
  task: 'getdbmtuserinfo';
};
