/**
 * Optional body for POST .../database/start|stop|restart/:dbname
 */
export type DatabaseLifecycleControlRequest = {
  /** When true, CMS tasks `ha_start` / `ha_stop` are used instead of `startdb` / `stopdb`. */
  isHA?: boolean;
};
