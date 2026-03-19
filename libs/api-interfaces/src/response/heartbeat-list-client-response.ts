export type HaDbModeClientItem = {
  dbname: string;
  server_mode: string;
  server_msg: string;
};

export type HaDbProcInfoClientItem = {
  dbname: string;
  pid: string;
  state: string;
};

export type HaApplyLogClientItem = {
  dbname: string;
  hostname: string;
  logpath: string;
  pid: string;
  state: string;
};

export type HaCopyLogClientItem = {
  dbname: string;
  hostname: string;
  logpath: string;
  mode: string;
  pid: string;
  state: string;
};

export type HaServerClientItem = {
  applylogdb?: Array<{ element: HaApplyLogClientItem[] }>;
  copylogdb?: Array<{ element: HaCopyLogClientItem[] }>;
  dbmode?: HaDbModeClientItem[];
  dbprocinfo?: HaDbProcInfoClientItem[];
};

export type HaNodeClientItem = {
  hostname: string;
  ip: string;
  priority: string;
  state: string;
};

/**
 * Client response type for heartbeatlist task.
 */
export type HeartbeatListClientResponse = {
  __EXEC_TIME?: string;
  currentnode?: string;
  currentnodestate?: string;
  hadbinfolist?: Array<{ server: HaServerClientItem[] }> | Record<string, never>;
  hanodelist?: Array<{ node: HaNodeClientItem[] }>;
  note: string;
  status: string;
  task: string;
};

