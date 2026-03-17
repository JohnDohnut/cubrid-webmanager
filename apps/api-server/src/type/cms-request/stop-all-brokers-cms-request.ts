import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for stopping all brokers on a host.
 * Task: stopbroker (no additional parameters).
 */
export type StopAllBrokersCmsRequest = BaseCmsRequest & {
  task: 'stopbroker';
};
