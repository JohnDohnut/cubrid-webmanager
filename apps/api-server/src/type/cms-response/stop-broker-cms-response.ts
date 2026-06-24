import { BaseCmsResponse } from './base-cms-response';

/**
 * CMS response for stopbroker task.
 */
export type StopBrokerCmsResponse = BaseCmsResponse & {
  task: 'stopbroker';
};
