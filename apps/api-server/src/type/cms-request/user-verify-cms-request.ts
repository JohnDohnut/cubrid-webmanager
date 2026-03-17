import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for userverify task (verify DB user credentials).
 */
export type UserVerifyCmsRequest = BaseCmsRequest & {
  task: 'userverify';
  dbname: string;
  dbuser: string;
  dbpasswd: string;
};
