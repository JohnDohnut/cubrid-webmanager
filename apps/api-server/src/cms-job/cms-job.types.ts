import {
  AddVolDbRequest,
  CheckDatabaseRequest,
  CompactDatabaseRequest,
  CopyDbRequest,
  CreateDatabaseWithConfigRequest,
  CmsJobStatus,
  CmsJobType,
  LoadDatabaseRequest,
  OptimizeDatabaseRequest,
  RenameDatabaseRequest,
  UnloadDatabaseRequest,
} from '@api-interfaces';

export type CmsJobPayload =
  | UnloadDatabaseRequest
  | LoadDatabaseRequest
  | CreateDatabaseWithConfigRequest
  | OptimizeDatabaseRequest
  | CheckDatabaseRequest
  | CompactDatabaseRequest
  | CopyDbRequest
  | AddVolDbRequest
  | RenameDatabaseRequest;

export type CmsJobRecord = {
  jobId: string;
  userId: string;
  hostUid: string;
  dbname: string;
  type: CmsJobType;
  status: CmsJobStatus;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  payload: CmsJobPayload;
  result?: unknown;
  error?: { message: string; code?: string; cmsStatus?: string };
};

/** One active long-running CMS job per host (CMS serializes requests). */
export type HostCmsOperationLock = {
  jobId: string;
  userKey: string;
  dbname: string;
  type: CmsJobType;
};

export function resolveJobDbname(type: CmsJobType, dbname: string, payload: CmsJobPayload): string {
  if (type === 'copy') {
    const copy = payload as CopyDbRequest;
    return `${copy.srcdbname}→${copy.destdbname}`;
  }
  return dbname;
}

/** DB names involved in the lock (copy locks source + destination). */
export function resolveLockedDbnames(
  type: CmsJobType,
  dbname: string,
  payload: CmsJobPayload
): string[] {
  if (type === 'copy') {
    const copy = payload as CopyDbRequest;
    return [copy.srcdbname, copy.destdbname];
  }
  return [dbname];
}
