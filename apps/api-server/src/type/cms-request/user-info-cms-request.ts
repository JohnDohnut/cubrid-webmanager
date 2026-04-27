import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for userinfo task (get database users list).
 */
export type UserInfoCmsRequest = BaseCmsRequest & {
  task: 'userinfo';
  dbname: string;
};
