import { BaseCmsRequest } from './base-cms-request';

/**
 * CMS request for viewing log file content.
 * 
 * 로그 파일 내용 조회를 위한 CMS 요청입니다.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type ViewLogCmsRequest = BaseCmsRequest & {
    task: 'viewlog';
    path: string;
    start: string;
    end: string;
};

