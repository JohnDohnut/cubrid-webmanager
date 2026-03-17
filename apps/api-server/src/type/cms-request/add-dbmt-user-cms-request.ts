import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for adding a DBMT (CMS) user.
 * Task: adddbmtuser.
 */
export type AddDbmtUserCmsRequest = BaseCmsRequest & {
  task: 'adddbmtuser';
  /** Target user id (login name) */
  targetid: string;
  /** Password */
  password: string;
  /** CAS auth: 'none' | 'admin' | 'monitor' */
  casauth: string;
  /** DB create auth: 'none' | 'admin' */
  dbcreate: string;
  /** Status monitor auth: 'none' | 'admin' */
  statusmonitorauth: string;
};
