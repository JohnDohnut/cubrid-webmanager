import { BaseCmsResponse } from './base-cms-response';

/**
 * CMS response for setdbmtpasswd task.
 */
export type SetDbmtPasswdCmsResponse = BaseCmsResponse & {
  task: 'setdbmtpasswd';
};
