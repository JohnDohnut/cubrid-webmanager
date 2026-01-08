/**
 * Enum for resource monitoring error codes.
 *
 * @category Error
 * @since 1.0.0
 */
export enum ResourceMonitoringErrorCode {
    /**
     * An unknown or unexpected error occurred during resource monitoring.
     */
    UNKNOWN = 'RESOURCE_MONITORING_UNKNOWN',

    /**
     * Failed to retrieve statistics from the CMS API.
     */
    CMS_API_FAILURE = 'RESOURCE_MONITORING_CMS_API_FAILURE',

    /**
     * The host to be monitored could not be found.
     */
    HOST_NOT_FOUND = 'RESOURCE_MONITORING_HOST_NOT_FOUND',
}
