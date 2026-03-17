import { BaseCmsResponse } from './base-cms-response';

/**
 * CMS response for stopbroker task (stop all brokers on a host).
 */
export type StopAllBrokersCmsResponse = BaseCmsResponse & {
  task: 'stopbroker';
};
