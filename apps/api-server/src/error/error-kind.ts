/**
 * Application error category (transport / domain grouping).
 */
export type ErrorKind =
  | 'AUTH'
  | 'STORAGE'
  | 'LOCK'
  | 'RESOURCE'
  | 'USER'
  | 'INTERNAL'
  | 'CMS'
  | 'DATABASE'
  | 'VALIDATION'
  | 'CONFIG'
  | 'BROKER';
