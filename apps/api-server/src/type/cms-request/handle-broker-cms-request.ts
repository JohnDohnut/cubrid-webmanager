import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for starting or stopping a single broker by name.
 * Task: 'broker_start' | 'broker_stop', bname required.
 */
export type HandleBrokerCmsRequest = BaseCmsRequest & {
  task: 'broker_start' | 'broker_stop';
  bname: string;
};
