import { BaseCmsResponse } from './base-cms-response';

/**
 * Application Server information in broker status response.
 * 
 * 브로커 상태 응답의 애플리케이션 서버 정보입니다.
 */
export type ApplicationServerInfo = {
    as_c: string;
    as_client_ip: string;
    as_cpu: string;
    as_ctime: string;
    as_cur: string;
    as_dbhost: string;
    as_dbname: string;
    as_error_query: string;
    as_id: string;
    as_lat: string;
    as_lct: string;
    as_long_query: string;
    as_long_tran: string;
    as_num_query: string;
    as_num_tran: string;
    as_pid: string;
    as_psize: string;
    as_status: string;
};

/**
 * CMS response for broker status request.
 * 
 * 브로커 상태 조회 요청에 대한 CMS 응답입니다.
 */
export type GetBrokerStatusCmsResponse = BaseCmsResponse & {
    asinfo: ApplicationServerInfo[];
    bname: string;
    time: string;
};

