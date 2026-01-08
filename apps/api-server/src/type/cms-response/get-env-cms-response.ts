import { BaseCmsResponse } from './base-cms-response';

/**
 * CMS response for getenv request.
 * Contains environment variables and system information.
 * 
 * getenv 요청에 대한 CMS 응답입니다.
 * 환경 변수 및 시스템 정보를 포함합니다.
 */
export type GetEnvCmsResponse = BaseCmsResponse & {
    BROKERVER: string;
    CUBRID: string;
    CUBRIDVER: string;
    CUBRID_DATABASES: string;
    CUBRID_DBMT: string;
    HOSTMONTAB0: string;
    HOSTMONTAB1: string;
    HOSTMONTAB2: string;
    HOSTMONTAB3: string;
    osinfo: string;
};

