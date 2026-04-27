import { BaseCmsResponse } from './base-cms-response';

/**
 * CMS response for getaddbrokerinfo task.
 */
export type GetAddBrokerInfoCmsResponse = BaseCmsResponse & {
  task: 'getaddbrokerinfo';
  conflist: { confdata: string[] }[];
  confname: string;
};
