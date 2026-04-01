import { BaseCmsResponse } from './base-cms-response';

/**
 * CMS success envelope for `ha_start` (no extra domain fields).
 */
export type HaStartDatabaseCmsResponse = BaseCmsResponse & {
  task: 'ha_start';
};
