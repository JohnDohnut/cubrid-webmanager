import { BaseDatabaseRequest } from './base-database-request';

/**
 * Request type for getting database volume/space information.
 * 
 * 데이터베이스 볼륨/공간 정보를 조회하기 위한 요청 타입입니다.
 * 
 * @category Requests
 * @since 1.0.0
 */
export type DatabaseVolumeInfoRequest = BaseDatabaseRequest & { dbname:string };