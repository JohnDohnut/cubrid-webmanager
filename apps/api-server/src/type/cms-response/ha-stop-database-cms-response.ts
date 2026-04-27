import { BaseCmsResponse } from './base-cms-response';

/**
 * CMS success envelope for `ha_stop` (no extra domain fields).
 */
export type HaStopDatabaseCmsResponse = BaseCmsResponse & {
  task: 'ha_stop';
};
