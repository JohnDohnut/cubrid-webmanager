export type AutoAddVolLogEntry = {
  dbname: string;
  volname: string;
  purpose: string;
  page: string;
  time: string;
  outcome: string;
};

/**
 * Client response for getautoaddvollog (domain data only).
 */
export type GetAutoAddVolLogResponse = AutoAddVolLogEntry[];
