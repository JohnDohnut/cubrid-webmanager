import { BaseCmsRequest } from './base-cms-request';

/**
 * Request type for setting auto-add volume configuration for a database.
 * 
 * @category CMS Requests
 * @since 1.0.0
 */
export type SetAutoAddVolCmsRequest = BaseCmsRequest & {
    /**
     * Database name
     */
    dbname: string;

    /**
     * Auto-add data volume setting
     * 
     * Values: "ON" | "OFF"
     */
    data: string;

    /**
     * Data volume warning threshold for out of space
     * 
     * Format: Decimal string (e.g., "0.15" means 15%)
     */
    data_warn_outofspace: string;

    /**
     * Data volume extension page size
     * 
     * Format: Number string (e.g., "32768")
     */
    data_ext_page: string;

    /**
     * Auto-add index volume setting
     * 
     * Values: "ON" | "OFF"
     */
    index: string;

    /**
     * Index volume warning threshold for out of space
     * 
     * Format: Decimal string (e.g., "0.15" means 15%)
     */
    index_warn_outofspace: string;

    /**
     * Index volume extension page size
     * 
     * Format: Number string (e.g., "32768")
     */
    index_ext_page: string;
};

