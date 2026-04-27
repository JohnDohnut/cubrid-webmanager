/**
 * Volume mapping: one object with source path -> destination path.
 * Only included when advanced is "on".
 */
export type CopyDbVolumeItem = Record<string, string>;

/**
 * Client request for copydb task.
 */
export type CopyDbRequest = {
  srcdbname: string;
  destdbname: string;
  destdbpath: string;
  exvolpath: string;
  logpath: string;
  overwrite: string;
  move: string;
  advanced: string;
  /** Volume path mappings. Only when advanced is "on". */
  volume?: CopyDbVolumeItem[];
};
