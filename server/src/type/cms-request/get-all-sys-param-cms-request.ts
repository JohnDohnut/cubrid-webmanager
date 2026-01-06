import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for getting all system parameters from a configuration file.
 * 
 * 설정 파일에서 모든 시스템 파라미터를 조회하기 위한 요청 타입입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type GetAllSysParamCmsRequest = BaseCmsRequest & {
    /**
     * Configuration file name
     * 설정 파일 이름
     * 
     * Example: "cubridconf", "broker.conf"
     */
    confname: string;
};

