import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for getaddbrokerinfo task.
 * Returns broker configuration content for the given confname.
 */
export type GetAddBrokerInfoCmsRequest = BaseCmsRequest & {
  task: 'getaddbrokerinfo';
  confname: string;
};
