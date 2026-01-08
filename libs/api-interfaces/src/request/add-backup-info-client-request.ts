/**
 * Client request type for adding backup information.
 * 
 * 백업 정보를 추가하기 위한 클라이언트 요청 타입입니다.
 * 
 * @category Client Requests
 * @since 1.0.0
 */
export type AddBackupInfoClientRequest = {
    /**
     * Database name
     * 데이터베이스 이름
     */
    dbname: string;

    /**
     * Backup ID
     * 백업 ID
     */
    backupid: string;

    /**
     * Backup path
     * 백업 경로
     */
    path: string;

    /**
     * Period type (e.g., 'Monthly', 'Weekly', 'Daily')
     * 주기 타입 (예: 'Monthly', 'Weekly', 'Daily')
     */
    period_type: string;

    /**
     * Period date (day of month for Monthly, day of week for Weekly)
     * 주기 날짜 (월별: 일, 주별: 요일)
     */
    period_date: string;

    /**
     * Backup time (format: HHMM, e.g., '1230' for 12:30)
     * 백업 시간 (형식: HHMM, 예: '1230'은 12:30)
     */
    time: string;

    /**
     * Backup level (0, 1, 2)
     * 백업 레벨 (0, 1, 2)
     */
    level: string;

    /**
     * Archive deletion setting ('ON' | 'OFF')
     * 아카이브 삭제 설정
     */
    archivedel: 'ON' | 'OFF';

    /**
     * Update status setting ('ON' | 'OFF')
     * 상태 업데이트 설정
     */
    updatestatus: 'ON' | 'OFF';

    /**
     * Store old setting ('ON' | 'OFF')
     * 이전 백업 저장 설정
     */
    storeold: 'ON' | 'OFF';

    /**
     * Backup on/off setting ('ON' | 'OFF')
     * 백업 활성화/비활성화 설정
     */
    onoff: 'ON' | 'OFF';

    /**
     * Zip compression ('y' | 'n')
     * 압축 여부
     */
    zip: 'y' | 'n';

    /**
     * Check setting ('y' | 'n')
     * 체크 설정
     */
    check: 'y' | 'n';

    /**
     * Multi-thread setting ('0' for disabled)
     * 멀티스레드 설정 ('0'은 비활성화)
     */
    mt: string;

    /**
     * Backup number ('0' for unlimited)
     * 백업 개수 ('0'은 무제한)
     */
    bknum: string;
};

