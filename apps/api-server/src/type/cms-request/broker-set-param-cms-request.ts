import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for broker_setparam task.
 * Sets broker configuration file content.
 */
export type BrokerSetParamCmsRequest = BaseCmsRequest & {
  task: 'broker_setparam';
  confdata: string[];
};
