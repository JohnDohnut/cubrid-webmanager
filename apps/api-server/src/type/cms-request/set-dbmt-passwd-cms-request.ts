import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for setdbmtpasswd task.
 */
export type SetDbmtPasswdCmsRequest = BaseCmsRequest & {
  task: 'setdbmtpasswd';
  targetid: string;
  newpassword: string;
};
