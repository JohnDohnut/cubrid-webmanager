import { BaseCmsRequest } from './base-cms-request';

/**
 * Represents a CMS request specifically for checking a file.
 * Extends BaseCmsRequest and sets the task to 'checkfile'.
 *
 * 파일 확인을 위한 CMS 요청을 나타냅니다.
 * BaseCmsRequest를 확장하고 task를 'checkfile'로 설정합니다.
 *
 * @category Requests
 * @since 1.0.0
 */
export type CheckFileCmsRequest = BaseCmsRequest & {
    task: 'checkfile';
};
