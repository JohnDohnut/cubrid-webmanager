import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for updating a DBMT (CMS) user.
 * Task: updatedbmtuser.
 * No password in request; updates auth settings only.
 */
export type UpdateDbmtUserCmsRequest = BaseCmsRequest & {
  task: 'updatedbmtuser';
  /** Target user id (login name) */
  targetid: string;
  /** DB auth array (e.g. [] for none). Optional; omitted or undefined is treated as []. */
  dbauth?: unknown[];
  /** CAS auth: 'none' | 'admin' | 'monitor' */
  casauth: string;
  /** DB create auth: 'none' | 'admin' */
  dbcreate: string;
  /** Status monitor auth: 'none' | 'admin' */
  statusmonitorauth: string;
};
