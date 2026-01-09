import { BaseCmsResponse } from './base-cms-response';

/**
 * Backup information entry.
 * 
 * @category CMS Responses
 * @since 1.0.0
 */
export type BackupInfo = {
    /**
     * Backup ID
     */
    backupid: string;

    /**
     * Database name
     */
    dbname: string;

    /**
     * Backup path
     */
    path: string;

    /**
     * Period type
     */
    period_type: string;

    /**
     * Period date
     */
    period_date: string;

    /**
     * Backup time
     */
    time: string;

    /**
     * Backup level
     */
    level: string;

    /**
     * Archive deletion setting
     */
    archivedel: 'ON' | 'OFF';

    /**
     * Update status setting
     */
    updatestatus: 'ON' | 'OFF';

    /**
     * Store old setting
     */
    storeold: 'ON' | 'OFF';

    /**
     * Backup on/off setting
     */
    onoff: 'ON' | 'OFF';

    /**
     * Zip compression
     */
    zip: 'y' | 'n';

    /**
     * Check setting
     */
    check: 'y' | 'n';

    /**
     * Multi-thread setting
     */
    mt: string;

    /**
     * Backup number
     */
    bknum: string;
};

/**
 * Response type for getbackupinfo request.
 * 
 * @category CMS Responses
 * @since 1.0.0
 */
export type GetBackupInfoCmsResponse = BaseCmsResponse & {
    /**
     * Database name
     */
    dbname: string;

    /**
     * Backup information array, keyed by database name
     * 
     * Note: CMS API returns backup info with database name as a dynamic key.
     * The structure is: { dbname: "demodb", demodb: [BackupInfo[]] }
     */
    [key: string]: string | BackupInfo[];
};

