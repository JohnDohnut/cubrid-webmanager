import { BaseCmsResponse } from './base-cms-response';

/**
 * Backup information entry.
 * 
 * 백업 정보 항목입니다.
 * 
 * @category CMS Responses
 * @since 1.0.0
 */
export type BackupInfo = {
    /**
     * Backup ID
     * 백업 ID
     */
    backupid: string;

    /**
     * Database name
     * 데이터베이스 이름
     */
    dbname: string;

    /**
     * Backup path
     * 백업 경로
     */
    path: string;

    /**
     * Period type
     * 주기 타입
     */
    period_type: string;

    /**
     * Period date
     * 주기 날짜
     */
    period_date: string;

    /**
     * Backup time
     * 백업 시간
     */
    time: string;

    /**
     * Backup level
     * 백업 레벨
     */
    level: string;

    /**
     * Archive deletion setting
     * 아카이브 삭제 설정
     */
    archivedel: 'ON' | 'OFF';

    /**
     * Update status setting
     * 상태 업데이트 설정
     */
    updatestatus: 'ON' | 'OFF';

    /**
     * Store old setting
     * 이전 백업 저장 설정
     */
    storeold: 'ON' | 'OFF';

    /**
     * Backup on/off setting
     * 백업 활성화/비활성화 설정
     */
    onoff: 'ON' | 'OFF';

    /**
     * Zip compression
     * 압축 여부
     */
    zip: 'y' | 'n';

    /**
     * Check setting
     * 체크 설정
     */
    check: 'y' | 'n';

    /**
     * Multi-thread setting
     * 멀티스레드 설정
     */
    mt: string;

    /**
     * Backup number
     * 백업 개수
     */
    bknum: string;
};

/**
 * Response type for getbackupinfo request.
 * 
 * getbackupinfo 요청에 대한 응답 타입입니다.
 * 
 * @category CMS Responses
 * @since 1.0.0
 */
export type GetBackupInfoCmsResponse = BaseCmsResponse & {
    /**
     * Database name
     * 데이터베이스 이름
     */
    dbname: string;

    /**
     * Backup information array, keyed by database name
     * 데이터베이스 이름을 키로 하는 백업 정보 배열
     * 
     * Note: CMS API returns backup info with database name as a dynamic key.
     * The structure is: { dbname: "demodb", demodb: [BackupInfo[]] }
     * 참고: CMS API는 데이터베이스 이름을 동적 키로 사용하여 백업 정보를 반환합니다.
     * 구조: { dbname: "demodb", demodb: [BackupInfo[]] }
     */
    [key: string]: string | BackupInfo[];
};

