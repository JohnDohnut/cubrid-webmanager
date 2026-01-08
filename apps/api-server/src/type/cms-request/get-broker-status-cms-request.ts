import { BaseCmsRequest } from "./base-cms-request";

/**
 * CMS request for getting broker status.
 * 
 * 브로커 상태 조회를 위한 CMS 요청입니다.
 */
export type GetBrokerStatusCmsRequest = BaseCmsRequest & {
    bname: string;
};

