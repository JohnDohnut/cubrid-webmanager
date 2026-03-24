/**
 * Client request type for restoredb task.
 *
 * @category Client Requests
 * @since 1.0.0
 */
export type RestoreDbClientRequest = {
  /**
   * Restore date.
   * - "none"
   * - "backuptime"
   * - "19-03-2026:09:17:46"
   */
  date: string;
  /** Backup level: 0, 1, or 2 */
  level: '0' | '1' | '2' | string;
  /** Partial recovery: "y" | "n" */
  partial: 'y' | 'n' | string;
  /** Backup path (file path) */
  pathname: string;
  /** Recovery path */
  recoverypath: string;
};

