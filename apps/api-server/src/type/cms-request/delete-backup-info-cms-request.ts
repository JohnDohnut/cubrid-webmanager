import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for deleting backup information.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type DeleteBackupInfoCmsRequest = BaseCmsRequest & {
    /**
     * Task type - must be 'deletebackupinfo'
     */
    task: 'deletebackupinfo';

    /**
     * Database name
     */
    dbname: string;

    /**
     * Backup ID to delete
     */
    backupid: string;
};
