/**
 * Client request for adding a DBMT (CMS) user.
 */
export type AddDbmtUserRequest = {
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
