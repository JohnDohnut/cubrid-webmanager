import { BaseCmsRequest } from "./base-cms-request";

/**
 * CMS request for getting broker status.
 */
export type GetBrokerStatusCmsRequest = BaseCmsRequest & {
    bname: string;
};

