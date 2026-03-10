import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for updatedbmtuser task.
 */
export type UpdateDbmtUserCmsRequest = BaseCmsRequest & {
  task: 'updatedbmtuser';
  targetid: string;
  dbauth?: unknown[];
  casauth: string;
  dbcreate: string;
  statusmonitorauth: string;
};
